import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Convert weapon familiarity `ActiveEffect`s to Rule Elements */
export declare class Migration687FamiliarityAEsToREs extends MigrationBase {
  static version: number
  private isFamiliarityAE
  private toRuleElement
  updateActor(actorSource: ActorSourcePF2e): Promise<void>
  updateItem(itemSource: ItemSourcePF2e): Promise<void>
}
