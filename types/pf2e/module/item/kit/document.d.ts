import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import { ItemPF2e, PhysicalItemPF2e } from "types/pf2e/module/item/index.ts"
import { Price } from "types/pf2e/module/item/physical/data.ts"
import { UserPF2e } from "types/pf2e/module/user/index.ts"
import { KitEntryData, KitSource, KitSystemData } from "./data.ts"
import { Size } from "types/pf2e/module/data.ts"
declare class KitPF2e<TParent extends ActorPF2e | null = ActorPF2e | null> extends ItemPF2e<TParent> {
  get entries(): KitEntryData[]
  get price(): Price
  /** Expand a tree of kit entry data into a list of physical items */
  createGrantedItems(options?: {
    entries?: KitEntryData[]
    containerId?: string
    size?: Size
  }): Promise<PhysicalItemPF2e<null>[]>
  protected _preUpdate(
    changed: DeepPartial<this["_source"]>,
    options: DocumentModificationContext<TParent>,
    user: UserPF2e
  ): Promise<boolean | void>
}
interface KitPF2e<TParent extends ActorPF2e | null = ActorPF2e | null> extends ItemPF2e<TParent> {
  readonly _source: KitSource
  system: KitSystemData
}
export { KitPF2e }
