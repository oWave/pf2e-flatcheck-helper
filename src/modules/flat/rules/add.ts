import type { ModelPropFromDataField } from "foundry-pf2e/foundry/common/data/fields.mjs"
import type { AdditionalFlatCheckSource } from "./common"
import { ValueField } from "./fields"

const fields = foundry.data.fields

const schema = {
	type: new fields.StringField({
		required: true,
		blank: false,
	}),
	slot: new fields.StringField({
		required: false,
		blank: false,
	}),
	baseDC: new ValueField({
		required: true,
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

export function buildAddCheckRuleElement() {
	// biome-ignore lint/correctness/noUnusedVariables: neccesary evil
	interface AddCheckRuleElementImpl extends SchemaProps {
		key: "fc-AddCheck"
		slug: string
	}

	// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: this should be a crime
	class AddCheckRuleElementImpl extends game.pf2e.RuleElement {
		static override defineSchema() {
			const base = super.defineSchema()
			base.slug.required = true
			base.slug.nullable = false

			return { ...base, ...schema }
		}

		toSource(options: string[]): AdditionalFlatCheckSource | null {
			if (!this.test(options)) return null
			const dc = this.resolveValue(this.baseDC)
			if (typeof dc !== "number") return null

			return {
				type: this.type,
				origin: {
					slug: this.slug,
					label: this.label,
				},
				slot: this.slot ?? this.slug,
				baseDc: dc,
			}
		}
	}

	return AddCheckRuleElementImpl
}

export type AddCheckRuleElement = InstanceType<ReturnType<typeof buildAddCheckRuleElement>>
