import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import { ItemPF2e } from "types/pf2e/module/item/index.ts"
/** Check an item prior to its deletion for GrantItem on-delete actions */
declare function processGrantDeletions(item: ItemPF2e<ActorPF2e>, pendingItems: ItemPF2e<ActorPF2e>[]): Promise<void>
export { processGrantDeletions }
