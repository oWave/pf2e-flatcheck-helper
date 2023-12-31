import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { MigrationBase } from "../base.ts"
/** Push back embedded spell property one object-nesting level */
export declare class Migration772V10EmbeddedSpellData extends MigrationBase {
  static version: number
  preUpdateItem(source: ItemSourcePF2e): Promise<void>
}
