import { BaseItemSourcePF2e, ItemSystemSource } from "types/pf2e/module/item/data/base.ts"
import { PhysicalItemTraits, PartialPrice } from "types/pf2e/module/item/physical/data.ts"
type KitSource = BaseItemSourcePF2e<"kit", KitSystemSource>
interface KitEntryData {
  uuid: ItemUUID
  img: ImageFilePath
  quantity: number
  name: string
  isContainer: boolean
  items?: Record<string, KitEntryData>
}
interface KitSystemSource extends ItemSystemSource {
  traits: PhysicalItemTraits
  items: Record<string, KitEntryData>
  price: PartialPrice
  level?: never
}
type KitSystemData = KitSystemSource
export { KitEntryData, KitSource, KitSystemData, KitSystemSource }
