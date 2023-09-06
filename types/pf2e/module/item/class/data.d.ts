import { AttributeString, SaveType } from "types/pf2e/module/actor/types.ts"
import { ABCSystemSource } from "types/pf2e/module/item/abc/data.ts"
import { BaseItemSourcePF2e, ItemTraits } from "types/pf2e/module/item/data/base.ts"
import { ZeroToFour } from "types/pf2e/module/data.ts"
import { CLASS_TRAITS } from "./values.ts"
type ClassSource = BaseItemSourcePF2e<"class", ClassSystemSource>
interface ClassSystemSource extends ABCSystemSource {
  traits: ItemTraits
  keyAbility: {
    value: AttributeString[]
    selected: AttributeString | null
  }
  hp: number
  perception: ZeroToFour
  savingThrows: Record<SaveType, ZeroToFour>
  attacks: ClassAttackProficiencies
  defenses: ClassDefenseProficiencies
  trainedSkills: {
    value: string[]
    additional: number
  }
  classDC: ZeroToFour
  ancestryFeatLevels: {
    value: number[]
  }
  classFeatLevels: {
    value: number[]
  }
  generalFeatLevels: {
    value: number[]
  }
  skillFeatLevels: {
    value: number[]
  }
  skillIncreaseLevels: {
    value: number[]
  }
  level?: never
}
type ClassSystemData = ClassSystemSource
interface ClassAttackProficiencies {
  simple: ZeroToFour
  martial: ZeroToFour
  advanced: ZeroToFour
  unarmed: ZeroToFour
  other: {
    name: string
    rank: ZeroToFour
  }
}
interface ClassDefenseProficiencies {
  unarmored: ZeroToFour
  light: ZeroToFour
  medium: ZeroToFour
  heavy: ZeroToFour
}
type ClassTrait = SetElement<typeof CLASS_TRAITS>
export { ClassAttackProficiencies, ClassDefenseProficiencies, ClassSource, ClassSystemData, ClassTrait }
