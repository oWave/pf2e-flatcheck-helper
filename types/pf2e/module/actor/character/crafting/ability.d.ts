import type { CharacterPF2e } from "../../index.ts";
import { Predicate, RawPredicate } from "../../../system/predication.ts";
import { CraftingFormula } from "./formula.ts";
declare class CraftingAbility implements CraftingAbilityData {
    #private;
    /** A label for this crafting entry to display on sheets */
    name: string;
    selector: string;
    /** This crafting ability's parent actor */
    actor: CharacterPF2e;
    preparedFormulaData: PreparedFormulaData[];
    isAlchemical: boolean;
    isDailyPrep: boolean;
    isPrepared: boolean;
    craftableItems: Predicate;
    maxSlots: number;
    fieldDiscovery: Predicate | null;
    batchSizes: {
        default: number;
        other: {
            definition: Predicate;
            quantity: number;
        }[];
    };
    fieldDiscoveryBatchSize: number;
    maxItemLevel: number;
    constructor(actor: CharacterPF2e, data: CraftingAbilityData);
    getPreparedCraftingFormulas(): Promise<PreparedCraftingFormula[]>;
    getSheetData(): Promise<CraftingAbilitySheetData>;
    /** Computes reagent cost. Will go away once updated to PC2 */
    calculateReagentCost(): Promise<number>;
    static isValid(data: Maybe<Partial<CraftingAbilityData>>): data is CraftingAbilityData;
    prepareFormula(formula: CraftingFormula): Promise<void>;
    checkEntryRequirements(formula: CraftingFormula, { warn }?: {
        warn?: boolean | undefined;
    }): boolean;
    unprepareFormula(index: number, itemUUID: string): Promise<void>;
    setFormulaQuantity(index: number, itemUUID: string, value: "increase" | "decrease" | number): Promise<void>;
    toggleFormulaExpended(index: number, itemUUID: string): Promise<void>;
    toggleSignatureItem(itemUUID: string): Promise<void>;
    updateFormulas(formulas: PreparedFormulaData[]): Promise<void>;
}
interface CraftingAbilityData {
    selector: string;
    name: string;
    isAlchemical: boolean;
    isDailyPrep: boolean;
    isPrepared: boolean;
    maxSlots?: number;
    craftableItems: RawPredicate;
    fieldDiscovery?: RawPredicate | null;
    batchSizes?: {
        default: number;
        other: {
            definition: RawPredicate;
            quantity: number;
        }[];
    };
    fieldDiscoveryBatchSize?: number;
    maxItemLevel?: number | null;
    preparedFormulaData?: PreparedFormulaData[];
}
interface PreparedFormulaData {
    itemUUID: string;
    quantity?: number;
    expended?: boolean;
    isSignatureItem?: boolean;
    sort?: number;
}
interface PreparedCraftingFormula extends CraftingFormula {
    quantity: number;
    expended: boolean;
    isSignatureItem: boolean;
    sort: number;
}
interface CraftingAbilitySheetData {
    name: string;
    selector: string;
    isAlchemical: boolean;
    isPrepared: boolean;
    isDailyPrep: boolean;
    maxSlots: number;
    maxItemLevel: number;
    reagentCost: number;
    formulas: ({
        uuid: string;
        expended: boolean;
        img: ImageFilePath;
        name: string;
        quantity: number;
        isSignatureItem: boolean;
    } | null)[];
}
export { CraftingAbility };
export type { CraftingAbilityData, CraftingAbilitySheetData, PreparedFormulaData };
