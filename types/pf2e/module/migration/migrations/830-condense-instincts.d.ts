import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Remove links to deleted compendium items */
export declare class Migration830BarbarianRework extends MigrationBase {
  #private
  static version: number
  updateItem(source: ItemSourcePF2e): Promise<void>
}
