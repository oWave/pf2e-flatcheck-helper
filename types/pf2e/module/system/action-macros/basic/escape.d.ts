import { SkillActionOptions } from "../index.ts"
import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import { CheckContext, CheckContextData, CheckContextOptions } from "types/pf2e/module/system/action-macros/types.ts"
import {
  SingleCheckAction,
  SingleCheckActionVariant,
  SingleCheckActionVariantData,
} from "types/pf2e/module/actor/actions/index.ts"
import { ItemPF2e } from "types/pf2e/module/item/index.ts"
declare function escape(options: SkillActionOptions): void
declare class EscapeActionVariant extends SingleCheckActionVariant {
  get statistic(): string
  protected checkContext<ItemType extends ItemPF2e<ActorPF2e>>(
    opts: CheckContextOptions<ItemType>,
    data: CheckContextData<ItemType>
  ): CheckContext<ItemType> | undefined
}
declare class EscapeAction extends SingleCheckAction {
  constructor()
  protected toActionVariant(data?: SingleCheckActionVariantData): EscapeActionVariant
}
declare const action: EscapeAction
export { escape as legacy, action }
