import { CustomDamageData } from "./data.ts";
/**
 * To update all custom damage types in the system, we need to ensure that all collections are added to and cleaned.
 * This reduces the scope of all damage related operations so that its easier to identify when something goes wrong.
 */
export declare class DamageTypeManager {
    collections: {
        physical: string[];
        energy: string[];
        DAMAGE_TYPES: Set<"bludgeoning" | "piercing" | "slashing" | "bleed" | "vitality" | "void" | "acid" | "cold" | "electricity" | "fire" | "sonic" | "force" | "mental" | "poison" | "spirit" | "untyped">;
        BASE_DAMAGE_TYPES_TO_CATEGORIES: Record<"bludgeoning" | "piercing" | "slashing" | "bleed" | "vitality" | "void" | "acid" | "cold" | "electricity" | "fire" | "sonic" | "force" | "mental" | "poison" | "spirit" | "untyped", string | number | symbol | null>;
        DAMAGE_TYPE_ICONS: Record<"bludgeoning" | "piercing" | "slashing" | "bleed" | "vitality" | "void" | "acid" | "cold" | "electricity" | "fire" | "sonic" | "force" | "mental" | "poison" | "spirit" | "untyped", string | null>;
        damageTypesLocalization: any;
        damageRollFlavorsLocalization: any;
        immunityTypes: Record<string, string>;
        weaknessTypes: Record<string, string>;
        resistanceTypes: Record<string, string>;
    };
    addCustomDamage(data: CustomDamageData, options?: {
        slug?: string;
    }): void;
    updateSettings(): void;
}
