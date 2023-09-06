import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Replace the "Giant" language with "Jotun" */
export declare class Migration681GiantLanguageToJotun extends MigrationBase {
  static version: number
  private replaceGiant
  updateActor(actorSource: ActorSourcePF2e): Promise<void>
  updateItem(itemSource: ItemSourcePF2e): Promise<void>
}
