import type { ModelPropFromDataField } from "foundry-pf2e/foundry/common/data/fields.mjs"
import type { VisibilityLevels } from "../constants"
import { sortRuleElements } from "./common"

const fields = foundry.data.fields

const schema = {
	condition: new fields.StringField({
		required: true,
		blank: false,
		choices: ["observed", "concealed", "hidden"],
	}),
	treatAs: new fields.StringField({
		required: true,
		blank: false,
		choices: ["observed", "concealed", "hidden"],
	}),
	mode: new fields.StringField({
		required: true,
		blank: false,
		initial: undefined,
		choices: ["upgrade", "downgrade", "override"],
	}),
	affects: new fields.StringField({
		required: true,
		choices: ["origin", "self"],
		initial: "self",
	}),
}

type SchemaType = typeof schema
type SchemaProps = {
	[k in keyof SchemaType]: ModelPropFromDataField<SchemaType[k]>
}

const conditionPriorities = {
	observed: 0,
	concealed: 1,
	hidden: 2,
} as const

export const TreatAsModePriorities: Record<SchemaProps["mode"], number> = {
	downgrade: 30,
	upgrade: 40,
	override: 50,
}
export function buildTreatAsRuleElement() {
	// biome-ignore lint/correctness/noUnusedVariables: neccesary evil
	interface TreatAsRuleElementImpl extends SchemaProps {
		key: "fc-TreatAs"
	}

	// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: this should be a crime
	class TreatAsRuleElementImpl extends game.pf2e.RuleElement {
		static override defineSchema() {
			const base = super.defineSchema()
			base.priority.initial = (d) => TreatAsModePriorities[String(d.mode)] ?? 50
			return {
				...base,
				...schema,
			}
		}

		get conditionPriority() {
			const p = conditionPriorities[this.treatAs]
			if (this.mode === "downgrade") return -p
			return p
		}
	}

	return TreatAsRuleElementImpl
}

export type TreatAsRuleElement = InstanceType<ReturnType<typeof buildTreatAsRuleElement>>

export interface TreatAsAdjustment {
	old: VisibilityLevels
	new: VisibilityLevels
	label: string
}

export class TreatAsCollection {
	private rules: TreatAsRuleElement[]
	constructor(rules: TreatAsRuleElement[]) {
		rules.sort(sortRuleElements)
		this.rules = rules
	}

	getAdjustment(condition: VisibilityLevels): TreatAsAdjustment | null {
		const conditionPrio = conditionPriorities[condition]
		let adjustment: { new: VisibilityLevels; label: string } | null = null
		for (const r of this.rules) {
			if (r.condition !== condition) continue
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
}
