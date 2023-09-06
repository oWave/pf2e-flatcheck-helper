import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Fix Rule Element values reaching for too many datas */
export declare class Migration677RuleValueDataRefs extends MigrationBase {
  static version: number
  updateItem(itemSource: ItemSourcePF2e): Promise<void>
}
