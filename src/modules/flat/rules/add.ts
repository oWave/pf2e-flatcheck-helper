import type { ModelPropFromDataField } from "foundry-pf2e/foundry/common/data/fields.mjs"
import type { AdditionalFlatCheckSource } from "./common"
import { ValueField } from "./fields"

const fields = foundry.data.fields

const schema = {
	source: new fields.StringField({
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
	}

	// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: this should be a crime
	class AddCheckRuleElementImpl extends game.pf2e.RuleElement {
		static override defineSchema() {
			return { ...super.defineSchema(), ...schema }
		}

		toSource(): AdditionalFlatCheckSource | null {
			const dc = this.resolveValue(this.baseDC)
			if (typeof dc !== "number") return null

			return {
				source: this.source,
				origin: this.label,
				slot: this.slot ?? game.pf2e.system.sluggify(this.label),
				baseDc: dc,
			}
		}
	}

	return AddCheckRuleElementImpl
}

export type AddCheckRuleElement = InstanceType<ReturnType<typeof buildAddCheckRuleElement>>
