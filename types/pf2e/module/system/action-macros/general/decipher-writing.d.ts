import { SkillActionOptions } from "../index.ts"
import {
  SingleCheckAction,
  SingleCheckActionVariant,
  SingleCheckActionVariantData,
} from "types/pf2e/module/actor/actions/index.ts"
declare function decipherWriting(options: SkillActionOptions): void
declare class DecipherWritingAction extends SingleCheckAction {
  constructor()
  protected toActionVariant(data?: SingleCheckActionVariantData): SingleCheckActionVariant
}
declare const action: DecipherWritingAction
export { decipherWriting as legacy, action }
