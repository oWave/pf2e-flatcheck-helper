import { ItemSheetPF2e } from "../index.ts";
import type { ItemSheetOptions } from "../base/sheet/sheet.ts";
import type { ConditionPF2e } from "./document.ts";
declare class ConditionSheetPF2e extends ItemSheetPF2e<ConditionPF2e> {
    static get defaultOptions(): ItemSheetOptions;
    protected get validTraits(): Record<string, string>;
}
export { ConditionSheetPF2e };
