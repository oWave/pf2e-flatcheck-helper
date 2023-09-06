import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
export declare class Migration669NPCAttackEffects extends MigrationBase {
  static version: number
  updateItem(item: ItemSourcePF2e, actor?: ActorSourcePF2e): Promise<void>
}
