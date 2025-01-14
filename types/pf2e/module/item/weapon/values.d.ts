import type { WeaponGroup, WeaponTrait } from "./types.ts";
declare const WEAPON_CATEGORIES: readonly ["unarmed", "simple", "martial", "advanced"];
declare const WEAPON_GROUPS: Set<"shield" | "axe" | "bomb" | "bow" | "brawling" | "club" | "crossbow" | "dart" | "firearm" | "flail" | "hammer" | "knife" | "pick" | "polearm" | "sling" | "spear" | "sword">;
declare const MELEE_WEAPON_GROUPS: Set<"shield" | "axe" | "brawling" | "club" | "dart" | "flail" | "hammer" | "knife" | "pick" | "polearm" | "spear" | "sword">;
/** Groups that will be forced as ranged weapons */
declare const MANDATORY_RANGED_GROUPS: Set<WeaponGroup>;
declare const WEAPON_PROPERTY_RUNE_TYPES: Set<"speed" | "ancestralEchoing" | "anchoring" | "ashen" | "astral" | "authorized" | "bane" | "bloodbane" | "bloodthirsty" | "brilliant" | "called" | "coating" | "conducting" | "corrosive" | "crushing" | "cunning" | "dancing" | "deathdrinking" | "decaying" | "demolishing" | "disrupting" | "earthbinding" | "energizing" | "extending" | "fanged" | "fearsome" | "flaming" | "flickering" | "flurrying" | "frost" | "ghostTouch" | "giantKilling" | "greaterGiantKilling" | "greaterAnchoring" | "greaterAshen" | "greaterAstral" | "greaterBloodbane" | "greaterBrilliant" | "greaterCorrosive" | "greaterCrushing" | "greaterDecaying" | "greaterDisrupting" | "greaterExtending" | "greaterFanged" | "greaterFearsome" | "greaterFlaming" | "greaterFrost" | "greaterHauling" | "greaterImpactful" | "greaterRooting" | "greaterShock" | "greaterThundering" | "grievous" | "hauling" | "holy" | "hopeful" | "hooked" | "impactful" | "impossible" | "keen" | "kinWarding" | "majorFanged" | "majorRooting" | "merciful" | "nightmare" | "pacifying" | "returning" | "rooting" | "serrating" | "shifting" | "shock" | "shockwave" | "spellStoring" | "swarming" | "thundering" | "trueRooting" | "underwater" | "unholy" | "vorpal" | "wounding">;
declare const THROWN_RANGES: Set<10 | 15 | 20 | 40 | 30 | 100 | 60 | 80>;
declare const WEAPON_RANGES: Set<10 | 15 | 20 | 40 | 30 | 50 | 100 | 60 | 80 | 70 | 90 | 110 | 120 | 140 | 150 | 180 | 200 | 240 | 300>;
declare const RANGED_ONLY_TRAITS: Set<WeaponTrait>;
declare const MELEE_ONLY_TRAITS: Set<WeaponTrait>;
export { MANDATORY_RANGED_GROUPS, MELEE_ONLY_TRAITS, MELEE_WEAPON_GROUPS, RANGED_ONLY_TRAITS, THROWN_RANGES, WEAPON_CATEGORIES, WEAPON_GROUPS, WEAPON_PROPERTY_RUNE_TYPES, WEAPON_RANGES, };
