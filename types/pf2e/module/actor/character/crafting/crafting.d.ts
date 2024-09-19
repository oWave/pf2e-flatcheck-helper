import type { CharacterPF2e } from "../document.ts";
import { CraftingAbility } from "./ability.ts";
import { CraftingFormula } from "./formula.ts";
/** Caches and performs operations on elements related to crafting */
declare class CharacterCrafting {
    #private;
    actor: CharacterPF2e;
    abilities: CraftingAbility[];
    constructor(actor: CharacterPF2e);
    /**
     * Retrieves all formulas this actor knows including their associated items.
     * The result is cached until next data prep.
     */
    getFormulas(): Promise<CraftingFormula[]>;
    getAbility(selector: string): CraftingAbility | null;
    performDailyCrafting(): Promise<void>;
}
export { CharacterCrafting };
