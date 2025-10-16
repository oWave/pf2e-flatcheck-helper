import type { DataFieldValidationOptions } from "foundry-pf2e/foundry/common/data/_module.mjs"
import type { CleanFieldOptions } from "foundry-pf2e/foundry/common/data/fields.mjs"

type RuleValue = string | number

export class ValueField<
	TRequired extends boolean,
	TNullable extends boolean,
	THasInitial extends boolean = false,
> extends foundry.data.fields.DataField<RuleValue, RuleValue, TRequired, TNullable, THasInitial> {
	protected override _validateType(value: JSONValue, options?: DataFieldValidationOptions) {
		return typeof value === "string" || typeof value === "number"
	}

	protected _cleanType(input: RuleValue, options?: CleanFieldOptions): RuleValue {
		if (typeof input === "number") return input

		const value = input.trim()
		const num = Number.parseInt(value, 10)
		if (Number.isNaN(num)) return value
		return num
	}
}
/*
// @ts-expect-error
const flatModSchema = game.pf2e.RuleElements.builtin.FlatModifier.defineSchema()

export const PredicateField = flatModSchema.predicate.constructor as PredicateFieldType */
