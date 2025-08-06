import { translateHandleMissing } from "src/utils"

export function localizeCondition(condition: string) {
	return translateHandleMissing(condition.capitalize(), {
		prefix: "PF2E.ConditionType",
		case: "title",
	})
}

export function localizeSource(source: string) {
	return translateHandleMissing(source.capitalize(), {
		prefix: "pf2e-fc.flat.source",
		case: "title",
	})
}
