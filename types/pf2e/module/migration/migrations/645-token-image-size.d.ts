import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Restore saved token images and sizes from old versions of the respective rule elements */
export declare class Migration645TokenImageSize extends MigrationBase {
  #private
  static version: number
  updateActor(actorSource: ActorSourcePF2e): Promise<void>
  updateToken(tokenSource: foundry.documents.TokenSource, actor: Readonly<ActorPF2e | null>): Promise<void>
}
