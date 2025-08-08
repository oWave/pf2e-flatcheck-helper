import type { ActorPF2e } from "foundry-pf2e"
import * as R from "remeda"
import { type VisibilityLevels, VisiblityLevelPriorities } from "../constants"
import type { FlatCheckSource } from "../data"
import type { TargetFlatCheckSource } from "../target"
import type { AddCheckRuleElement } from "./add"
import type { ModifyFlatDCRuleElement } from "./modify"
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
			const delta = a.resolvedValue - b.resolvedValue
			if (delta) return delta
		}

		if (a.key === "fc-TreatAs" && b.key === "fc-TreatAs") {
			const delta = a.conditionPriority - b.conditionPriority
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
		const modifiers = this.modify.filter((r) => r.type === type && r.predicate.test(rollOptions))
		let currentDc = baseDc
		let adjustments: DcAdjustment[] = []
		for (const m of modifiers) {
			const value = m.resolvedValue
			switch (m.mode) {
				case "add":
					if (value === 0) continue
					currentDc += value
					adjustments.push({ label: m.label, value: `${value > 0 ? "+" : ""}${value}` })
					break
				case "upgrade":
					if (currentDc < value) {
						currentDc = value
						adjustments = [{ label: m.label, value: value.toString() }]
					}
					break
				case "downgrade":
					if (currentDc > value) {
						currentDc = value
						adjustments = [{ label: m.label, value: value.toString() }]
					}
					break
				case "override":
					currentDc = value
					adjustments = [{ label: m.label, value: value.toString() }]
					break
			}
		}
		return { finalDc: currentDc, adjustments }
	}

	getTreatAsAdjustment(
		check: TargetFlatCheckSource,
		rollOptions: string[],
	): TreatAsAdjustment | null {
		if (!Object.keys(VisiblityLevelPriorities).includes(check.source)) return null
		const condition = check.source as VisibilityLevels

		const conditionPrio = VisiblityLevelPriorities[condition]
		let adjustment: { new: VisibilityLevels; label: string } | null = null
		for (const r of this.treatAs) {
			const checkOptions = [rollOptions, flatCheckRollOptions.forCheck(check)].flat()

			if (r.condition !== condition || !r.predicate.test(checkOptions)) continue
			const rulePrio = r.conditionPriority
			if (r.mode === "downgrade" && conditionPrio > rulePrio)
				adjustment = { new: r.treatAs, label: r.label }
			else if (r.mode === "upgrade" && conditionPrio < rulePrio)
				adjustment = { new: r.treatAs, label: r.label }
			else adjustment = { new: r.treatAs, label: r.label }
		}
		if (adjustment) return { old: condition, ...adjustment }
		return null
	}

	getAdditionalSources(rollOptions: string[]) {
		const sources: AdditionalFlatCheckSource[] = []
		for (const rule of this.add) {
			if (!rule.predicate.test(rollOptions)) continue
			const source = rule.toSource()
			if (source) sources.push(source)
		}
		return sources
	}
}
