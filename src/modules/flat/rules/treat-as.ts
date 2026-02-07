import type { ModelPropFromDataField } from "foundry-pf2e/foundry/common/data/fields.mjs"

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

export const TreatAsConditionPriorities = {
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
		static override validateJoint(data: any) {
			if (data.condition === data.treatAs) {
				throw new Error("condition can't be the same as treatAs")
			}
			if (data.condition === "observed" && data.slug == null && data.slug === "") {
				throw new Error("slug is required when changing observed")
			}
		}

		static override defineSchema() {
			const base = super.defineSchema()
			base.priority.initial = (d) => TreatAsModePriorities[String(d.mode)] ?? 50
			return {
				...base,
				...schema,
			}
		}

		get tiebreakPriority() {
			const p = TreatAsConditionPriorities[this.treatAs]
			if (this.mode === "downgrade") return -p
			return p
		}

		getData(options: string[]) {
			if (!this.test(options)) return null

			return {
				slug: this.slug ?? "null",
				label: this.label,
				affects: this.affects,
				mode: this.mode,
				condition: this.condition,
				treatAs: this.treatAs,
				priority: this.tiebreakPriority,
			}
		}
	}

	return TreatAsRuleElementImpl
}

export type TreatAsRuleElement = InstanceType<ReturnType<typeof buildTreatAsRuleElement>>

export type TreatAsData = ReturnType<TreatAsRuleElement["getData"]>
