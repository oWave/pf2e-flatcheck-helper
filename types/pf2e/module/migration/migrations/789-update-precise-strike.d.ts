import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Fix the predicate on the Precise Strike's DamageDice rule element  */
export declare class Migration789UpdatePreciseStrike extends MigrationBase {
  #private
  static version: number
  updateItem(source: ItemSourcePF2e): Promise<void>
}
