import type { Rarity } from "../../data.ts";
import type { PhysicalItemPF2e } from "./document.ts";
import type { PreciousMaterialGrade, PreciousMaterialType } from "./types.ts";
interface MaterialGradeData {
    level: number;
    price: number;
    hardness?: number;
    maxHP?: number;
    rarity: Rarity;
}
type MaterialValuationData = Partial<Record<PreciousMaterialType | "", Record<PreciousMaterialGrade, MaterialGradeData | null>>>;
declare function getMaterialValuationData(item: PhysicalItemPF2e): MaterialGradeData | null;
declare const OBJECT_MATERIAL_VALUATION_DATA: MaterialValuationData;
declare const MATERIAL_DATA: {
    armor: Partial<Record<"" | "adamantine" | "cold-iron" | "dawnsilver" | "duskwood" | "orichalcum" | "silver" | "sisterstone-dusk" | "sisterstone-scarlet" | "warpglass" | "abysium" | "djezet" | "dragonhide" | "grisantian-pelt" | "inubrix" | "keep-stone" | "noqual" | "peachwood" | "siccatite" | "sisterstone" | "sovereign-steel", Record<"low" | "standard" | "high", MaterialGradeData | null>>>;
    object: Partial<Record<"" | "adamantine" | "cold-iron" | "dawnsilver" | "duskwood" | "orichalcum" | "silver" | "sisterstone-dusk" | "sisterstone-scarlet" | "warpglass" | "abysium" | "djezet" | "dragonhide" | "grisantian-pelt" | "inubrix" | "keep-stone" | "noqual" | "peachwood" | "siccatite" | "sisterstone" | "sovereign-steel", Record<"low" | "standard" | "high", MaterialGradeData | null>>>;
    shield: {
        shield: Partial<Record<"" | "adamantine" | "cold-iron" | "dawnsilver" | "duskwood" | "orichalcum" | "silver" | "sisterstone-dusk" | "sisterstone-scarlet" | "warpglass" | "abysium" | "djezet" | "dragonhide" | "grisantian-pelt" | "inubrix" | "keep-stone" | "noqual" | "peachwood" | "siccatite" | "sisterstone" | "sovereign-steel", Record<"low" | "standard" | "high", MaterialGradeData | null>>>;
        buckler: Partial<Record<"" | "adamantine" | "cold-iron" | "dawnsilver" | "duskwood" | "orichalcum" | "silver" | "sisterstone-dusk" | "sisterstone-scarlet" | "warpglass" | "abysium" | "djezet" | "dragonhide" | "grisantian-pelt" | "inubrix" | "keep-stone" | "noqual" | "peachwood" | "siccatite" | "sisterstone" | "sovereign-steel", Record<"low" | "standard" | "high", MaterialGradeData | null>>>;
        towerShield: Partial<Record<"" | "adamantine" | "cold-iron" | "dawnsilver" | "duskwood" | "orichalcum" | "silver" | "sisterstone-dusk" | "sisterstone-scarlet" | "warpglass" | "abysium" | "djezet" | "dragonhide" | "grisantian-pelt" | "inubrix" | "keep-stone" | "noqual" | "peachwood" | "siccatite" | "sisterstone" | "sovereign-steel", Record<"low" | "standard" | "high", MaterialGradeData | null>>>;
    };
    weapon: Partial<Record<"" | "adamantine" | "cold-iron" | "dawnsilver" | "duskwood" | "orichalcum" | "silver" | "sisterstone-dusk" | "sisterstone-scarlet" | "warpglass" | "abysium" | "djezet" | "dragonhide" | "grisantian-pelt" | "inubrix" | "keep-stone" | "noqual" | "peachwood" | "siccatite" | "sisterstone" | "sovereign-steel", Record<"low" | "standard" | "high", MaterialGradeData | null>>>;
};
export { MATERIAL_DATA, OBJECT_MATERIAL_VALUATION_DATA, getMaterialValuationData };
export type { MaterialGradeData, MaterialValuationData };
