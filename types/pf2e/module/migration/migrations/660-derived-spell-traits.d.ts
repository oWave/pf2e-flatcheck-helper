import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Remove manually set magic school and tradition traits from spells */
export declare class Migration660DerivedSpellTraits extends MigrationBase {
  static version: number
  private derivedTraits
  updateItem(itemSource: ItemSourcePF2e): Promise<void>
}
