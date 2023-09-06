import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Update roll notes on tanglefoot bags to have titled roll notes and no damage dice  */
export declare class Migration788UpdateTanglefootBags extends MigrationBase {
  #private
  static version: number
  updateItem(source: ItemSourcePF2e): Promise<void>
}
