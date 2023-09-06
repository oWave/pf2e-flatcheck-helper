import { MigrationBase } from "../base.ts"
import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
/** Catch up actors and items to the current template.json spec */
export declare class Migration605CatchUpToTemplateJSON extends MigrationBase {
  static version: number
  private addEffects
  updateActor(actorData: ActorSourcePF2e): Promise<void>
  updateItem(itemData: ItemSourcePF2e, actorData: ActorSourcePF2e): Promise<void>
}
