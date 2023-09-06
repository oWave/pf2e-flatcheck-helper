import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Set default linkToActorSize flag */
export declare class Migration662LinkToActorSizeDefaults extends MigrationBase {
  static version: number
  updateActor(actorSource: ActorSourcePF2e): Promise<void>
  updateToken(tokenSource: foundry.documents.TokenSource, actor: ActorPF2e): Promise<void>
}
