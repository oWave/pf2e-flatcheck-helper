import { MODIFIER_TYPES } from "types/pf2e/module/actor/modifiers.ts"
import { FlatModifierRuleElement, FlatModifierSource } from "types/pf2e/module/rules/rule-element/flat-modifier.ts"
import { RuleElementForm, RuleElementFormSheetData } from "./base.ts"
/** Form handler for the flat modifier rule element */
declare class FlatModifierForm extends RuleElementForm<FlatModifierSource, FlatModifierRuleElement> {
  template: string
  activateListeners(html: HTMLElement): void
  getData(): Promise<FlatModifierFormSheetData>
  _updateObject(formData: Partial<FlatModifierSource>): void
}
interface FlatModifierFormSheetData extends RuleElementFormSheetData<FlatModifierSource, FlatModifierRuleElement> {
  selectorIsArray: boolean
  abilities: ConfigPF2e["PF2E"]["abilities"]
  types: Omit<keyof typeof MODIFIER_TYPES, "untyped">[]
  damageCategories: Pick<ConfigPF2e["PF2E"]["damageCategories"], "persistent" | "precision" | "splash">
  isDamage: boolean
  value: {
    mode: "brackets" | "object" | "primitive"
    data: unknown
  }
}
export { FlatModifierForm }
