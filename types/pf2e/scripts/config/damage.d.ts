import { DamageCategoryUnique, DamageType } from "types/pf2e/module/system/damage/types.ts"
declare const damageCategoriesUnique: Record<DamageCategoryUnique, string>
declare const materialDamageEffects: Pick<
  Record<
    | "adamantine"
    | "darkwood"
    | "mithral"
    | "orichalcum"
    | "silver"
    | "warpglass"
    | "abysium"
    | "cold-iron"
    | "djezet"
    | "dragonhide"
    | "grisantian-pelt"
    | "inubrix"
    | "keep-stone"
    | "noqual"
    | "peachwood"
    | "siccatite"
    | "sisterstone-dusk"
    | "sisterstone-scarlet"
    | "sovereign-steel",
    string
  >,
  | "adamantine"
  | "darkwood"
  | "mithral"
  | "orichalcum"
  | "silver"
  | "warpglass"
  | "abysium"
  | "cold-iron"
  | "djezet"
  | "keep-stone"
  | "noqual"
  | "peachwood"
  | "sisterstone-dusk"
  | "sisterstone-scarlet"
  | "sovereign-steel"
>
declare const damageCategories: {
  alignment: string
  energy: string
  physical: string
  adamantine: string
  darkwood: string
  mithral: string
  orichalcum: string
  silver: string
  warpglass: string
  abysium: string
  "cold-iron": string
  djezet: string
  "keep-stone": string
  noqual: string
  peachwood: string
  "sisterstone-dusk": string
  "sisterstone-scarlet": string
  "sovereign-steel": string
  precision: string
  splash: string
  persistent: string
}
declare const physicalDamageTypes: {
  bleed: string
  bludgeoning: string
  piercing: string
  slashing: string
}
declare const damageTypes: Record<DamageType, string>
declare const damageRollFlavors: Record<
  | "acid"
  | "bleed"
  | "bludgeoning"
  | "chaotic"
  | "cold"
  | "electricity"
  | "evil"
  | "fire"
  | "force"
  | "good"
  | "lawful"
  | "mental"
  | "negative"
  | "piercing"
  | "poison"
  | "positive"
  | "slashing"
  | "sonic"
  | "untyped",
  string
>
export {
  damageCategories,
  damageCategoriesUnique,
  damageRollFlavors,
  damageTypes,
  materialDamageEffects,
  physicalDamageTypes,
}
