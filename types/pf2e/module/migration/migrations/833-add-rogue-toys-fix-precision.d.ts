import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Add rule elements to Surprise Attack and Dread Striker, fix damage type of Precision edge */
export declare class Migration833AddRogueToysFixPrecision extends MigrationBase {
  static version: number
  updateItem(source: ItemSourcePF2e): Promise<void>
}
