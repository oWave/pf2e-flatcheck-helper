import type { ModelPropFromDataField } from "foundry-pf2e/foundry/common/data/fields.mjs"
import { PRIORITIES } from "./common"
import { ValueField } from "./fields"

const fields = foundry.data.fields

const schema = {
	type: new fields.StringField({
		required: true,
		blank: false,
	}),
	mode: new fields.StringField({
		required: true,
		blank: false,
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

export function buildModifyFlatDCRuleElement() {
	// biome-ignore lint/correctness/noUnusedVariables: neccesary evil
	interface ModifyFlatDCRuleElementImpl extends SchemaProps {
		key: "fc-ModifyFlatDC"
	}

	// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: this should be a crime
	class ModifyFlatDCRuleElementImpl extends game.pf2e.RuleElement {
		static override defineSchema() {
			const base = super.defineSchema()
			base.priority.initial = (d) => PRIORITIES[String(d.mode)] ?? PRIORITIES.override
			return {
				...base,
				...schema,
			}
		}

		get tiebreakPriority() {
			return this.resolvedValue
		}

		get resolvedValue() {
			const resolved = this.resolveValue(this.value, NaN)
			if (Number.isNumeric(resolved)) return Number(resolved)
			return NaN
		}

		getData(options: string[]) {
			if (!this.test(options)) return null

			const resolvedValue = this.resolvedValue
			if (Number.isNaN(resolvedValue)) return null

			const data = {
				label: this.label,
				type: this.resolveInjectedProperties(this.type),
				mode: this.mode,
				value: resolvedValue,
				affects: this.affects,
			}

			if (this.ignored) return null
			return data
		}
	}

	return ModifyFlatDCRuleElementImpl
}

export type ModifyFlatDCRuleElement = InstanceType<ReturnType<typeof buildModifyFlatDCRuleElement>>

export type ModifyFlatDCData = NonNullable<ReturnType<ModifyFlatDCRuleElement["getData"]>>
