import type { ActorPF2e, ChatMessagePF2e, TokenDocumentPF2e } from "foundry-pf2e"
import { flatMessageConfig } from "./message-config"
import { FlatCheckModePriorities, type ModifyFlatDCRuleElement } from "./rules/modify"
import { calculateTargetFlatCheck } from "./target"

interface AdjustmentData {
	label: string
	value: string
}

export interface FlatCheckSource {
	condition: string
	source: string
	baseDc: number
}

export interface FlatCheckData extends FlatCheckSource {
	finalDc: number
	adjustments?: AdjustmentData[]
}

export type FlatCheckRecord = Record<string, FlatCheckData>

class FlatCheckAdjustments {
	rules: ModifyFlatDCRuleElement[]
	constructor(originRules: ModifyFlatDCRuleElement[], targetRules?: ModifyFlatDCRuleElement[]) {
		const merged = [...originRules, ...(targetRules ?? [])]
		merged.sort((a, b) => {
			if (a.priority === b.priority) {
				// Use the default priority if for some reason two different modes have the same
				if (a.mode !== b.mode) {
					return FlatCheckModePriorities[a.mode] - FlatCheckModePriorities[b.mode]
				}
				// Put the higher override last
				if (a.mode === "override") {
					return a.resolvedValue - b.resolvedValue
				}
				// For anything else the order doesn't matter
				// Sort by label for a stable order
				return a.label.localeCompare(b.label)
			}
			return a.priority - b.priority
		})
		this.rules = merged
	}

	calculate(type: string, rollOptions: string[], baseDc: number) {
		const modifiers = this.rules.filter((r) => r.type === type && r.predicate.test(rollOptions))
		let currentDc = baseDc
		let adjustments: AdjustmentData[] = []
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
}

function collectAdjustments(actor: ActorPF2e, affects: ModifyFlatDCRuleElement["affects"]) {
	const modifiers = actor.rules
		.filter((r): r is ModifyFlatDCRuleElement => r.key === "fc-ModifyFlatDC")
		.filter((r) => r.affects === affects)

	return modifiers
}

export function collectFlatChecks(msg: ChatMessagePF2e) {
	if (!msg.author) return null

	return FlatCheckHelper.fromMessage(msg)
}

export class FlatCheckHelper {
	static fromMessage(msg: ChatMessagePF2e, target?: TokenDocumentPF2e) {
		if (!msg.actor) throw new Error("Message has no actor")

		const rollOptions: string[] = []
		if (
			msg.flags.pf2e.context &&
			"contextualOptions" in msg.flags.pf2e.context &&
			msg.flags.pf2e.context.contextualOptions?.postRoll?.length
		) {
			rollOptions.push(...msg.flags.pf2e.context.contextualOptions.postRoll)
		}
		if (
			msg.flags.pf2e.context &&
			"options" in msg.flags.pf2e.context &&
			msg.flags.pf2e.context.options?.length
		) {
			rollOptions.push(...msg.flags.pf2e.context.options)
		}

		const msgTarget = msg.target?.token
		if (msgTarget && target && msgTarget !== target)
			throw new Error(
				`fromMessage called with a target (${target.uuid}) that doesn't match the message's target (${msgTarget.uuid})`,
			)

		const checkTarget = msgTarget ?? target

		if (!checkTarget) return null

		const instance = new FlatCheckHelper(msg, checkTarget, rollOptions)
		return instance.mergedChecks
	}

	static fromTokens(origin: TokenDocumentPF2e | null, target: TokenDocumentPF2e | null) {
		const instance = new FlatCheckHelper(origin, target, [])
		return instance.mergedChecks
	}

	private adjustments: FlatCheckAdjustments
	private msg?: ChatMessagePF2e
	private token?: TokenDocumentPF2e
	private actor?: ActorPF2e

	public originChecks: Record<string, FlatCheckData>
	public targetCheck: FlatCheckData | null
	constructor(
		origin: ChatMessagePF2e | TokenDocumentPF2e | null,
		private target: TokenDocumentPF2e | null,
		private rollOptions: string[],
	) {
		if (origin instanceof getDocumentClass("ChatMessage")) {
			this.msg = origin
			if (!origin.token) throw new Error("Message has no token")
			this.token = origin.token
			if (!this.token.actor) throw new Error("Token has no actor")
			this.actor = this.token.actor
		} else if (origin instanceof getDocumentClass("Token")) {
			this.token = origin
			if (!this.token.actor) throw new Error("Token has no actor")
			this.actor = this.token.actor
		}

		const originAdjustments = this.actor ? collectAdjustments(this.actor, "self") : []
		const targetAdjustments = this.target?.actor
			? collectAdjustments(this.target.actor, "origin")
			: []

		this.adjustments = new FlatCheckAdjustments(originAdjustments, targetAdjustments)

		this.originChecks = this.#collectOriginChecks()
		this.targetCheck = this.#collectTargetChecks()
	}

	get mergedChecks() {
		const checks = this.originChecks
		if (this.targetCheck) checks.target = this.targetCheck
		return checks
	}

	#collectOriginChecks() {
		const sources: FlatCheckSource[] = []

		const { ignored } = flatMessageConfig.toSets()

		if (this.actor && this.msg) {
			if (
				!ignored.has("manipulate") &&
				this.actor.conditions.stored.some((c) => c.slug === "grabbed") &&
				this.msg.item?.system.traits.value?.some((t) => t === "manipulate")
			) {
				sources.push({ condition: "grabbed", source: "manipulate", baseDc: 5 })
			}

			if (
				!ignored.has("deafened") &&
				this.actor.conditions.stored.some((c) => c.slug === "deafened") &&
				this.msg.item?.system.traits.value?.some((t) => t === "auditory")
			) {
				sources.push({ condition: "deafened", source: "auditory", baseDc: 5 })
			}
			if (
				!ignored.has("deafened-spellcasting") &&
				this.actor.conditions.stored.some((c) => c.slug === "deafened") &&
				this.msg.flags?.pf2e?.origin?.type === "spell" &&
				!this.msg.item?.system.traits.value?.some((t) => t === "subtle")
			) {
				sources.push({ condition: "deafened", source: "spell", baseDc: 5 })
			}

			if (!ignored.has("stupefied") && this.msg.flags?.pf2e?.origin?.type === "spell") {
				const stupefied = this.actor.conditions.stupefied?.value
				if (stupefied) {
					sources.push({ condition: "stupefied", source: "spell", baseDc: 5 + stupefied })
				}
			}
		}

		const data: Record<string, FlatCheckData> = {}
		for (const source of sources) {
			const key = source.condition
			const { finalDc, adjustments } = this.adjustments.calculate(
				key,
				this.rollOptions,
				source.baseDc,
			)
			data[key] = { ...source, finalDc: finalDc ?? source.baseDc, adjustments }
		}
		return data
	}

	#collectTargetChecks() {
		if (!this.target) return null
		const check = calculateTargetFlatCheck(this.token ?? null, this.target)
		if (!check) return null

		const { finalDc, adjustments } = this.adjustments.calculate(
			check.condition,
			this.rollOptions,
			check.baseDc,
		)
		return { ...check, finalDc: finalDc ?? check.baseDc, adjustments }
	}
}
