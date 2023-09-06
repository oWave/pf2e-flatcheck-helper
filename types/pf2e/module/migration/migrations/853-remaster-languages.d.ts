import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Change languages renamed in Rage of Elements  */
export declare class Migration853RemasterLanguages extends MigrationBase {
  #private
  static version: number
  updateActor(source: ActorSourcePF2e): Promise<void>
  updateItem(source: ItemSourcePF2e): Promise<void>
}
