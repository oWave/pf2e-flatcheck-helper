import { AttributeString } from "types/pf2e/module/actor/types.ts"
import { BaseItemSourcePF2e, ItemSystemData, ItemSystemSource } from "types/pf2e/module/item/data/base.ts"
import { MagicTradition } from "types/pf2e/module/item/spell/types.ts"
import { OneToTen, ZeroToEleven, ZeroToFour } from "types/pf2e/module/data.ts"
import { RollNotePF2e } from "types/pf2e/module/notes.ts"
import { SpellcastingCategory } from "./types.ts"
type SlotKey = `slot${ZeroToEleven}`
type SpellcastingEntrySource = BaseItemSourcePF2e<"spellcastingEntry", SpellcastingEntrySystemSource>
interface SpellAttackRollModifier {
  breakdown: string
  notes: RollNotePF2e[]
  roll: Function
  value: number
}
interface SpellDifficultyClass {
  breakdown: string
  notes: RollNotePF2e[]
  value: number
}
interface SpellPrepData {
  id: string | null
  expended?: boolean
  name?: string
  prepared?: boolean
}
interface SpellSlotData {
  prepared: Record<number, SpellPrepData>
  value: number
  max: number
}
interface SpellcastingEntrySystemSource extends ItemSystemSource {
  ability: {
    value: AttributeString | ""
  }
  spelldc: {
    value: number
    dc: number
  }
  tradition: {
    value: MagicTradition | ""
  }
  prepared: SpellCollectionTypeSource
  showSlotlessLevels: {
    value: boolean
  }
  proficiency: {
    slug: string
    value: ZeroToFour
  }
  slots: Record<SlotKey, SpellSlotData>
  autoHeightenLevel: {
    value: OneToTen | null
  }
  level?: never
  traits?: never
}
interface SpellCollectionTypeSource {
  value: SpellcastingCategory
  flexible?: boolean
  validItems?: "scroll" | "" | null
}
interface SpellcastingEntrySystemData extends SpellcastingEntrySystemSource, Omit<ItemSystemData, "level" | "traits"> {
  prepared: SpellCollectionTypeData
}
interface SpellCollectionTypeData extends SpellCollectionTypeSource {
  flexible: boolean
  validItems: "scroll" | null
}
export {
  SlotKey,
  SpellAttackRollModifier,
  SpellDifficultyClass,
  SpellcastingEntrySource,
  SpellcastingEntrySystemData,
  SpellcastingEntrySystemSource,
}
