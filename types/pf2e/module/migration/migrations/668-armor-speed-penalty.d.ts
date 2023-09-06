import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Remove RuleElement implementation of armor speed penalties  */
export declare class Migration668ArmorSpeedPenalty extends MigrationBase {
  static version: number
  updateItem(itemSource: ItemSourcePF2e): Promise<void>
}
