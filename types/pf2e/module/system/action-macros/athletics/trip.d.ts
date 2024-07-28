import { ActorPF2e } from "../../../actor/index.ts";
import { SingleCheckAction, SingleCheckActionVariant, SingleCheckActionVariantData } from "../../../actor/actions/index.ts";
import { ItemPF2e } from "../../../item/index.ts";
import { CheckContextData, CheckContextOptions, CheckMacroContext } from "../types.ts";
import { SkillActionOptions } from "../index.ts";
declare function trip(options: SkillActionOptions): void;
declare class TripActionVariant extends SingleCheckActionVariant {
    protected checkContext<ItemType extends ItemPF2e<ActorPF2e>>(opts: CheckContextOptions<ItemType>, data: CheckContextData<ItemType>): CheckMacroContext<ItemType> | undefined;
}
declare class TripAction extends SingleCheckAction {
    constructor();
    protected toActionVariant(data?: SingleCheckActionVariantData): TripActionVariant;
}
declare const action: TripAction;
export { action, trip as legacy };
