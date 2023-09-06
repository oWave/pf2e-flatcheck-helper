import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Remove value property from loot actor description */
export declare class Migration810LootDescriptionValue extends MigrationBase {
  static version: number
  updateActor(source: ActorSourcePF2e): Promise<void>
}
