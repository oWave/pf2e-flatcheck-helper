import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Change several AdjustStrike rule elements to modify weapon traits rather than action traits */
export declare class Migration752StrikeVsWeaponTraits extends MigrationBase {
  #private
  static version: number
  updateItem(source: ItemSourcePF2e): Promise<void>
}
