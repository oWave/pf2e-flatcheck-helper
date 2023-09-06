import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import { ItemPF2e } from "types/pf2e/module/item/index.ts"
import { SkillActionOptions } from "../index.ts"
import {
  SingleCheckAction,
  SingleCheckActionVariant,
  SingleCheckActionVariantData,
} from "types/pf2e/module/actor/actions/index.ts"
import { CheckContext, CheckContextData, CheckContextOptions } from "types/pf2e/module/system/action-macros/types.ts"
declare function trip(options: SkillActionOptions): void
declare class TripActionVariant extends SingleCheckActionVariant {
  protected checkContext<ItemType extends ItemPF2e<ActorPF2e>>(
    opts: CheckContextOptions<ItemType>,
    data: CheckContextData<ItemType>
  ): CheckContext<ItemType> | undefined
}
declare class TripAction extends SingleCheckAction {
  constructor()
  protected toActionVariant(data?: SingleCheckActionVariantData): TripActionVariant
}
declare const action: TripAction
export { trip as legacy, action }
