import { PhysicalItemSheetData, PhysicalItemSheetPF2e } from "types/pf2e/module/item/physical/index.ts"
import { SheetOptions } from "types/pf2e/module/sheet/helpers.ts"
import { EquipmentPF2e } from "./document.ts"
export declare class EquipmentSheetPF2e extends PhysicalItemSheetPF2e<EquipmentPF2e> {
  getData(options?: Partial<DocumentSheetOptions>): Promise<EquipmentSheetData>
}
interface EquipmentSheetData extends PhysicalItemSheetData<EquipmentPF2e> {
  bulkTypes: ConfigPF2e["PF2E"]["bulkTypes"]
  otherTags: SheetOptions
}
export {}
