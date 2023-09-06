import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Correct the reach trait on weapons */
export declare class Migration697WeaponReachTrait extends MigrationBase {
  static version: number
  updateItem(itemSource: ItemSourcePF2e): Promise<void>
}
