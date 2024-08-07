import type { ArmorTrait } from "../armor/types.ts";
import type { ConsumableTrait } from "../consumable/types.ts";
import type { EquipmentTrait } from "../equipment/types.ts";
import type { ShieldTrait } from "../shield/types.ts";
import type { WeaponTrait } from "../weapon/types.ts";
import type { PHYSICAL_ITEM_TYPES, PRECIOUS_MATERIAL_GRADES, PRECIOUS_MATERIAL_TYPES } from "./values.ts";
type BaseMaterialType = "bone" | "cloth" | "glass" | "leather" | "paper" | "rope" | "steel" | "stone" | "wood";
type BaseMaterialThickness = "thin" | "standard" | "structure";
type BaseMaterial = {
    type: BaseMaterialType;
    thickness: BaseMaterialThickness;
};
type CoinDenomination = "pp" | "gp" | "sp" | "cp";
type PhysicalItemTrait = ArmorTrait | ConsumableTrait | EquipmentTrait | ShieldTrait | WeaponTrait;
type PhysicalItemType = SetElement<typeof PHYSICAL_ITEM_TYPES>;
type PreciousMaterialType = SetElement<typeof PRECIOUS_MATERIAL_TYPES>;
type PreciousMaterialGrade = SetElement<typeof PRECIOUS_MATERIAL_GRADES>;
export type { BaseMaterial, CoinDenomination, PhysicalItemTrait, PhysicalItemType, PreciousMaterialGrade, PreciousMaterialType, };
