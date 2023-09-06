import { ActorSourcePF2e } from "types/pf2e/module/actor/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Ensure that a vehicle's dimensions are `number`s */
export declare class Migration661NumifyVehicleDimensions extends MigrationBase {
  static version: number
  updateActor(actorSource: ActorSourcePF2e): Promise<void>
}
