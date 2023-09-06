import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/**
 * Update rule elements on the Cleric doctrines to include references to the granted doctrines.
 */
export declare class Migration831ClericDoctrines extends MigrationBase {
  #private
  static version: number
  updateItem(source: ItemSourcePF2e): Promise<void>
}
