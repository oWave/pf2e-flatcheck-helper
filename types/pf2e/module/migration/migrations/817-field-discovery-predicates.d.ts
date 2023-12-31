import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Convert crafting-entry field discovery data to predicates */
export declare class Migration817FieldDiscoveryPredicates extends MigrationBase {
  static version: number
  updateItem(source: ItemSourcePF2e): Promise<void>
}
