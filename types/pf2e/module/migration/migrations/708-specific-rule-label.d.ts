import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
export declare class Migration708SpecificRuleLabel extends MigrationBase {
  static version: number
  updateItem(itemSource: ItemSourcePF2e): Promise<void>
}
