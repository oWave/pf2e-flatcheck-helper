import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Normalize "cold-iron" slug in armor, weapon and melee items */
export declare class Migration813NormalizeColdIron extends MigrationBase {
  #private
  static version: number
  updateItem(source: ItemSourcePF2e): Promise<void>
}
