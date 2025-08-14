import { buildAddCheckRuleElement } from "./add"
import { buildModifyFlatDCRuleElement } from "./modify"
import { buildTreatAsRuleElement } from "./treat-as"

export function setupRuleElements() {
	game.pf2e.RuleElements.custom["fc-ModifyFlatDC"] = buildModifyFlatDCRuleElement()
	game.pf2e.RuleElements.custom["fc-AddCheck"] = buildAddCheckRuleElement()
	game.pf2e.RuleElements.custom["fc-TreatAs"] = buildTreatAsRuleElement()
}
