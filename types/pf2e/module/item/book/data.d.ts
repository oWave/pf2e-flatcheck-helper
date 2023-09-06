import { EquipmentSystemData, EquipmentSystemSource } from "types/pf2e/module/item/equipment/data.ts"
import { BasePhysicalItemSource } from "types/pf2e/module/item/physical/data.ts"
type BookSource = BasePhysicalItemSource<"book", BookSystemSource>
type BookSystemSource = EquipmentSystemSource & {
  capacity: number
} & (FormulaBookData | SpellBookData)
type BookSystemData = Omit<BookSystemSource, "hp" | "price"> & EquipmentSystemData
interface FormulaBookData {
  subtype: "formula"
  item: ItemUUID[]
}
interface SpellBookData {
  subtype: "spell"
  item: object[]
}
export { BookSource, BookSystemData }
