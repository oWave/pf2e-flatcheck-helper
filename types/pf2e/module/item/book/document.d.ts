import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import { PhysicalItemPF2e } from "types/pf2e/module/item/index.ts"
import { BookSource, BookSystemData } from "./data.ts"
declare class BookPF2e<TParent extends ActorPF2e | null = ActorPF2e | null> extends PhysicalItemPF2e<TParent> {}
interface BookPF2e<TParent extends ActorPF2e | null = ActorPF2e | null> extends PhysicalItemPF2e<TParent> {
  readonly _source: BookSource
  system: BookSystemData
}
export { BookPF2e }
