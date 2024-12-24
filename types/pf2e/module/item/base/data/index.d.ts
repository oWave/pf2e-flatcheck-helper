import type { AbilitySource } from "../../ability/data.ts";
import type { AfflictionSource } from "../../affliction/data.ts";
import type { AncestrySource } from "../../ancestry/data.ts";
import type { ArmorSource } from "../../armor/data.ts";
import type { BackgroundSource } from "../../background/data.ts";
import type { BookSource } from "../../book/data.ts";
import type { CampaignFeatureSource } from "../../campaign-feature/data.ts";
import type { ClassSource } from "../../class/data.ts";
import type { ConditionSource } from "../../condition/data.ts";
import type { ConsumableSource } from "../../consumable/data.ts";
import type { ContainerSource } from "../../container/data.ts";
import type { DeitySource } from "../../deity/data.ts";
import type { EffectSource } from "../../effect/data.ts";
import type { EquipmentSource } from "../../equipment/data.ts";
import type { FeatSource } from "../../feat/data.ts";
import type { HeritageSource } from "../../heritage/data.ts";
import type { KitSource } from "../../kit/data.ts";
import type { LoreSource } from "../../lore.ts";
import type { MeleeSource } from "../../melee/data.ts";
import type { PhysicalItemType } from "../../physical/types.ts";
import type { ShieldSource } from "../../shield/data.ts";
import type { SpellSource } from "../../spell/data.ts";
import type { SpellcastingEntrySource } from "../../spellcasting-entry/data.ts";
import type { TreasureSource } from "../../treasure/data.ts";
import type { WeaponSource } from "../../weapon/data.ts";
import type { PROFICIENCY_RANKS, Rarity } from "../../../data.ts";
import { ItemDescriptionData } from "./system.ts";
type ProficiencyRank = (typeof PROFICIENCY_RANKS)[number];
type NonPhysicalItemType = "action" | "affliction" | "ancestry" | "background" | "campaignFeature" | "class" | "condition" | "deity" | "effect" | "feat" | "heritage" | "kit" | "lore" | "melee" | "spell" | "spellcastingEntry";
type ItemType = NonPhysicalItemType | PhysicalItemType;
type PhysicalItemSource = ArmorSource | BookSource | ConsumableSource | ContainerSource | EquipmentSource | ShieldSource | TreasureSource | WeaponSource;
type ItemSourcePF2e = PhysicalItemSource | AbilitySource | AfflictionSource | AncestrySource | BackgroundSource | CampaignFeatureSource | ClassSource | ConditionSource | DeitySource | EffectSource | FeatSource | HeritageSource | KitSource | LoreSource | MeleeSource | SpellSource | SpellcastingEntrySource;
type MagicItemSource = Exclude<PhysicalItemSource, ConsumableSource | TreasureSource>;
interface RawItemChatData {
    [key: string]: unknown;
    description: ItemDescriptionData;
    rarity?: {
        slug: Rarity;
        label: string;
        description: string;
    } | null;
    traits?: TraitChatData[];
    properties?: string[];
}
interface TraitChatData {
    value: string;
    label: string;
    description?: string;
    mystified?: boolean;
    excluded?: boolean;
}
export type { ActionCost, ActionType, Frequency, FrequencyInterval, FrequencySource, ItemFlagsPF2e, ItemSystemData, } from "./system.ts";
export type { AbilitySource, AncestrySource, ArmorSource, BackgroundSource, BookSource, ClassSource, ConditionSource, ConsumableSource, ContainerSource, DeitySource, EffectSource, EquipmentSource, FeatSource, ItemSourcePF2e, ItemType, KitSource, LoreSource, MagicItemSource, MeleeSource, NonPhysicalItemType, PhysicalItemSource, ProficiencyRank, RawItemChatData, ShieldSource, SpellcastingEntrySource, SpellSource, TraitChatData, TreasureSource, WeaponSource, };
