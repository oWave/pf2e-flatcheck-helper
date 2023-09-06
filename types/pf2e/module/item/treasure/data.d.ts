import {
  BasePhysicalItemSource,
  PhysicalSystemData,
  PhysicalSystemSource,
} from "types/pf2e/module/item/physical/data.ts"
type TreasureSource = BasePhysicalItemSource<"treasure", TreasureSystemSource>
type TreasureSystemSource = PhysicalSystemSource
type TreasureSystemData = PhysicalSystemData & {
  equipped: {
    invested?: never
  }
}
export { TreasureSource, TreasureSystemData, TreasureSystemSource }
