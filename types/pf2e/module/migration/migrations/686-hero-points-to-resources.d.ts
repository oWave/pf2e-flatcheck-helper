import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Move hero points from attributes to resources */
export declare class Migration686HeroPointsToResources extends MigrationBase {
  static version: number
  updateActor(actorSource: ActorSourcePF2e): Promise<void>
}
