import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Remove duplicate Recall Knowledge action items */
export declare class Migration799RMRecallKnowledgeDuplicates extends MigrationBase {
  #private
  static version: number
  updateItem(source: ItemSourcePF2e): Promise<void>
}
