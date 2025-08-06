import { buildModifyFlatDCRuleElement } from "./modify"

export function setupRuleElements() {
	game.pf2e.RuleElements.custom["fc-ModifyFlatDC"] = buildModifyFlatDCRuleElement()
}
