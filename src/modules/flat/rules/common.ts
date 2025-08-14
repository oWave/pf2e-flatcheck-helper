import type { ActorPF2e } from "foundry-pf2e"
import * as R from "remeda"
import { type VisibilityLevels, VisiblityLevelPriorities } from "../constants"
import type { FlatCheckSource } from "../data"
import type { TargetFlatCheckSource } from "../target"
import type { AddCheckRuleElement } from "./add"
import type { ModifyFlatDCData, ModifyFlatDCRuleElement } from "./modify"
import { flatCheckRollOptions } from "./options"
import type { TreatAsRuleElement } from "./treat-as"

export const PRIORITIES = {
	add: 20,
	downgrade: 30,
	upgrade: 40,
	override: 50,
} as const

export type FlatCheckRuleElements =
	| AddCheckRuleElement
	| ModifyFlatDCRuleElement
	| TreatAsRuleElement

export function sortRuleElements<T extends FlatCheckRuleElements>(a: T, b: T) {
	if (a.priority === b.priority) {
		// Use the default priority if for some reason two different modes have the same
		if ("mode" in a && "mode" in b && a.mode !== b.mode) {
			return PRIORITIES[a.mode] - PRIORITIES[b.mode]
		}

		// Put the higher override last
		if (a.key === "fc-ModifyFlatDC" && b.key === "fc-ModifyFlatDC" && a.mode === "override") {
			const delta = a.tiebreakPriority - b.tiebreakPriority
			if (delta) return delta
		}

		if (a.key === "fc-TreatAs" && b.key === "fc-TreatAs") {
			const delta = a.tiebreakPriority - b.tiebreakPriority
			if (delta) return delta
		}

		// For anything else the order doesn't matter
		// Sort by label for a stable order
		return a.label.localeCompare(b.label)
	}
	return a.priority - b.priority
}

const ruleShortNames = {
	"fc-ModifyFlatDC": "modify",
	"fc-AddCheck": "add",
	"fc-TreatAs": "map",
} as const
function collectRules(actor: ActorPF2e, affects: ModifyFlatDCRuleElement["affects"]) {
	const keys = Object.keys(ruleShortNames)
	const rules = R.pipe(
		actor.rules,
		R.filter((r): r is ModifyFlatDCRuleElement | AddCheckRuleElement | TreatAsRuleElement =>
			keys.includes(r.key),
		),
		R.filter((r) => r.affects === affects),
		R.groupBy((r) => ruleShortNames[r.key]),
	)

	return rules as {
		modify: ModifyFlatDCRuleElement[]
		add: AddCheckRuleElement[]
		map: TreatAsRuleElement[]
	}
}
export type FlatCheckRules = ReturnType<typeof collectRules>

function mergeAndSort<T extends FlatCheckRuleElements>(origin?: T[], target?: T[]) {
	return [origin, target]
		.filter((t) => t != null)
		.flat()
		.sort(sortRuleElements)
}

export interface DcAdjustment {
	label: string
	value: string
}

export interface TreatAsAdjustment {
	old: VisibilityLevels
	new: VisibilityLevels
	slug: string
	label: string
}

export interface AdditionalFlatCheckSource extends FlatCheckSource {
	slot: string
}

export class Adjustments {
	modify: ModifyFlatDCRuleElement[]
	add: AddCheckRuleElement[]
	treatAs: TreatAsRuleElement[]
	constructor(origin?: ActorPF2e | null, target?: ActorPF2e | null) {
		const originRules = origin && collectRules(origin, "self")
		const targetRules = target && collectRules(target, "origin")

		this.modify = mergeAndSort(originRules?.modify, targetRules?.modify)
		this.add = mergeAndSort(originRules?.add, targetRules?.add)
		this.treatAs = mergeAndSort(originRules?.map, targetRules?.map)
	}

	getDcAdjustment(type: string, rollOptions: string[], baseDc: number) {
		logOptions(`fc-ModifyDC (${type})`, rollOptions)
		const rules = this.modify.reduce<ModifyFlatDCData[]>((acc, rule) => {
			if (rule.type === type) {
				const data = rule.getData(rollOptions)
				if (data) acc.push(data)
			}
			return acc
		}, [])

		let currentDc = baseDc
		let adjustments: DcAdjustment[] = []
		for (const rule of rules) {
			const value = rule.value
			switch (rule.mode) {
				case "add":
					if (value === 0) continue
					currentDc += value
					adjustments.push({ label: rule.label, value: `${value > 0 ? "+" : ""}${value}` })
					break
				case "upgrade":
					if (currentDc < value) {
						currentDc = value
						adjustments = [{ label: rule.label, value: value.toString() }]
					}
					break
				case "downgrade":
					if (currentDc > value) {
						currentDc = value
						adjustments = [{ label: rule.label, value: value.toString() }]
					}
					break
				case "override":
					currentDc = value
					adjustments = [{ label: rule.label, value: value.toString() }]
					break
			}
		}
		return { finalDc: currentDc, adjustments }
	}

	getTreatAsAdjustment(
		check: TargetFlatCheckSource,
		rollOptions: string[],
	): TreatAsAdjustment | null {
		if (!Object.keys(VisiblityLevelPriorities).includes(check.type)) return null

		const checkOptions = [rollOptions, flatCheckRollOptions.forCheck(check)].flat()
		logOptions(`fc-TreatAs (${check.type})`, checkOptions)

		const rules = this.treatAs
			.map((rule) => rule.getData(checkOptions))
			.filter((rule) => rule != null)

		const originalCondition = check.type
		const conditionPriority = VisiblityLevelPriorities[originalCondition]
		let adjustment: { new: VisibilityLevels; label: string; slug: string } | null = null
		for (const rule of rules) {
			if (rule.condition !== originalCondition) continue
			const rulePriority = rule.priority
			if (
				(rule.mode === "downgrade" && conditionPriority > rulePriority) ||
				(rule.mode === "upgrade" && conditionPriority < rulePriority) ||
				rule.mode === "override"
			) {
				adjustment = { new: rule.treatAs, label: rule.label, slug: rule.slug }
			}
		}
		if (adjustment) return { old: originalCondition, ...adjustment }
		return null
	}

	getAdditionalSources(rollOptions: string[]) {
		logOptions("fc-AddCheck", rollOptions)
		const sources: AdditionalFlatCheckSource[] = []
		for (const rule of this.add) {
			const source = rule.toSource(rollOptions)
			if (source) sources.push(source)
		}
		return sources
	}
}

function logOptions(rule: string, options: string[]) {
	console.log(`RollOptions for ${rule} RE: `, options)
}
