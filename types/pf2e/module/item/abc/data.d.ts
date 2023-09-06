import { ItemSystemSource } from "types/pf2e/module/item/data/base.ts"
interface ABCFeatureEntryData {
  uuid: string
  img: ImageFilePath
  name: string
  level: number
}
interface ABCSystemSource extends ItemSystemSource {
  items: Record<string, ABCFeatureEntryData>
}
type ABCSystemData = ABCSystemSource
export { ABCFeatureEntryData, ABCSystemData, ABCSystemSource }
