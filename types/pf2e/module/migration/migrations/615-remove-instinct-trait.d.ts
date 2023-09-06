import { MigrationBase } from "../base.ts"
import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
/** Remove "instinct" trait from feats */
export declare class Migration615RemoveInstinctTrait extends MigrationBase {
  static version: number
  updateItem(itemData: ItemSourcePF2e): Promise<void>
}
