import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { MigrationBase } from "../base.ts"
export declare class Migration634PurgeMartialItems extends MigrationBase {
  static version: number
  updateActor(actorData: ActorSourcePF2e): Promise<void>
}
