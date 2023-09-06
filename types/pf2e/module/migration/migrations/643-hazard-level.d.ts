import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Move hazard level property to the same position as other actor data */
export declare class Migration643HazardLevel extends MigrationBase {
  static version: number
  updateActor(actorSource: ActorSourcePF2e): Promise<void>
}
