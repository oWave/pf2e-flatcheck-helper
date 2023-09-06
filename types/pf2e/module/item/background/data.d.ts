import { SkillAbbreviation } from "types/pf2e/module/actor/creature/data.ts"
import { AttributeString } from "types/pf2e/module/actor/types.ts"
import { ABCSystemData, ABCSystemSource } from "types/pf2e/module/item/abc/data.ts"
import { BaseItemSourcePF2e, ItemTraits } from "types/pf2e/module/item/data/base.ts"
type BackgroundSource = BaseItemSourcePF2e<"background", BackgroundSystemSource>
interface BackgroundSystemSource extends ABCSystemSource {
  traits: ItemTraits
  boosts: Record<
    number,
    {
      value: AttributeString[]
      selected: AttributeString | null
    }
  >
  trainedLore: string
  trainedSkills: {
    value: SkillAbbreviation[]
  }
  level?: never
}
interface BackgroundSystemData extends Omit<BackgroundSystemSource, "items">, Omit<ABCSystemData, "level" | "traits"> {}
export { BackgroundSource, BackgroundSystemData }
