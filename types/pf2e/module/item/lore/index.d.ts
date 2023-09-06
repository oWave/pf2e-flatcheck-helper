import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import { ItemPF2e } from "types/pf2e/module/item/base.ts"
import { LoreSource, LoreSystemData } from "./data.ts"
declare class LorePF2e<TParent extends ActorPF2e | null> extends ItemPF2e<TParent> {}
interface LorePF2e<TParent extends ActorPF2e | null> extends ItemPF2e<TParent> {
  readonly _source: LoreSource
  system: LoreSystemData
}
export { LorePF2e }
