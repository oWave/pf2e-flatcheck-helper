import type { ModelPropFromDataField } from "foundry-pf2e/foundry/common/data/fields.mjs"
import { ValueField } from "./fields"

const fields = foundry.data.fields

const schema = {
	type: new fields.StringField({
		required: true,
		choices: ["concealed", "hidden"],
	}),
	mode: new fields.StringField({
		required: true,
		blank: false,
		initial: undefined,
		choices: ["add", "upgrade", "downgrade", "override"],
	}),
	value: new ValueField({ required: true }),
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
export const FlatCheckModePriorities: Record<SchemaProps["mode"], number> = {
	add: 20,
	downgrade: 30,
	upgrade: 40,
	override: 50,
}

export function buildModifyFlatDCRuleElement() {
	// biome-ignore lint/correctness/noUnusedVariables: neccesary evil
	interface ModifyFlatDCRuleElementImpl extends SchemaProps {}

	// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: this should be a crime
	class ModifyFlatDCRuleElementImpl extends game.pf2e.RuleElement {
		static override defineSchema() {
			const base = super.defineSchema()
			base.priority.initial = (d) => FlatCheckModePriorities[String(d.mode)] ?? 50
			return {
				...base,
				...schema,
			}
		}

		get resolvedValue(): number {
			const resolved = this.resolveValue(this.value)
			if (typeof resolved !== "number") return 0
			return resolved
		}
	}

	return ModifyFlatDCRuleElementImpl
}

export type ModifyFlatDCRuleElement = InstanceType<ReturnType<typeof buildModifyFlatDCRuleElement>>
