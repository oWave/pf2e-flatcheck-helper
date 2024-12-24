declare const PHYSICAL_ITEM_TYPES: Set<"armor" | "book" | "consumable" | "backpack" | "equipment" | "shield" | "treasure" | "weapon">;
declare const PRECIOUS_MATERIAL_TYPES: Set<"adamantine" | "cold-iron" | "dawnsilver" | "duskwood" | "orichalcum" | "silver" | "sisterstone-dusk" | "sisterstone-scarlet" | "warpglass" | "abysium" | "djezet" | "dragonhide" | "dreamweb" | "grisantian-pelt" | "inubrix" | "keep-stone" | "noqual" | "peachwood" | "siccatite" | "sisterstone" | "sloughstone" | "sovereign-steel">;
declare const PRECIOUS_MATERIAL_GRADES: Set<"low" | "standard" | "high">;
declare const DENOMINATIONS: readonly ["pp", "gp", "sp", "cp"];
export { DENOMINATIONS, PHYSICAL_ITEM_TYPES, PRECIOUS_MATERIAL_GRADES, PRECIOUS_MATERIAL_TYPES };
