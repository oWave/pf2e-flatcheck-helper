import { ConsumablePF2e } from "types/pf2e/module/item/index.ts"
import { PhysicalItemSheetData, PhysicalItemSheetPF2e } from "types/pf2e/module/item/physical/index.ts"
import { SheetOptions } from "types/pf2e/module/sheet/helpers.ts"
export declare class ConsumableSheetPF2e extends PhysicalItemSheetPF2e<ConsumablePF2e> {
  getData(options?: Partial<DocumentSheetOptions>): Promise<ConsumableSheetData>
}
interface ConsumableSheetData extends PhysicalItemSheetData<ConsumablePF2e> {
  consumableTypes: ConfigPF2e["PF2E"]["consumableTypes"]
  otherTags: SheetOptions
}
export {}
