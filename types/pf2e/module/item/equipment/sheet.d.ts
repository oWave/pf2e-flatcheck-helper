import { ItemSheetOptions } from "../base/sheet/sheet.ts";
import { PhysicalItemSheetData, PhysicalItemSheetPF2e } from "../physical/index.ts";
import { SheetOptions } from "../../sheet/helpers.ts";
import type { EquipmentPF2e } from "./document.ts";
export declare class EquipmentSheetPF2e extends PhysicalItemSheetPF2e<EquipmentPF2e> {
    getData(options?: Partial<ItemSheetOptions>): Promise<EquipmentSheetData>;
}
interface EquipmentSheetData extends PhysicalItemSheetData<EquipmentPF2e> {
    otherTags: SheetOptions;
}
export {};
