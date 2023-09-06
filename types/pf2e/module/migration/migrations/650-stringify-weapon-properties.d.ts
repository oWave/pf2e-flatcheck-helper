import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Ensure weapon categories and ranges have valid properties */
export declare class Migration650StringifyWeaponProperties extends MigrationBase {
  static version: number
  updateItem(itemData: ItemSourcePF2e): Promise<void>
}
