import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
export declare class Migration657RemoveSetProperty extends MigrationBase {
  static version: number
  updateActor(actorSource: ActorSourcePF2e): Promise<void>
  updateItem(itemSource: ItemSourcePF2e): Promise<void>
}
