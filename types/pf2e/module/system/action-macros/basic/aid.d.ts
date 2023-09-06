import {
  SingleCheckAction,
  SingleCheckActionVariant,
  SingleCheckActionVariantData,
} from "types/pf2e/module/actor/actions/index.ts"
declare class AidAction extends SingleCheckAction {
  constructor()
  protected toActionVariant(data?: SingleCheckActionVariantData): SingleCheckActionVariant
}
declare const aid: AidAction
export { aid }
