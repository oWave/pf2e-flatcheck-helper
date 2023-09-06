import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Focus Points became an actor resource. Relies on items running after actor */
export declare class Migration649FocusToActor extends MigrationBase {
  static version: number
  updateActor(actorData: ActorSourcePF2e): Promise<void>
  updateItem(itemData: ItemSourcePF2e): Promise<void>
}
