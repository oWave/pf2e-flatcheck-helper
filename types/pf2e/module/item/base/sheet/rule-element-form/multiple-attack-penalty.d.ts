import { RuleElementSource } from "../../../../rules/index.ts";
import { MultipleAttackPenaltyRuleElement } from "../../../../rules/rule-element/multiple-attack-penalty.ts";
import { RuleElementForm } from "./base.ts";
declare class MultipleAttackPenaltyForm extends RuleElementForm<RuleElementSource, MultipleAttackPenaltyRuleElement> {
    template: string;
}
export { MultipleAttackPenaltyForm };
