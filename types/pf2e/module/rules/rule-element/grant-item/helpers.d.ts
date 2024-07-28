import type { ActorPF2e } from "../../../actor/index.ts";
import type { ItemPF2e } from "../../../item/index.ts";
/** Check an item prior to its deletion for GrantItem on-delete actions */
declare function processGrantDeletions(item: ItemPF2e<ActorPF2e>, pendingItems: ItemPF2e<ActorPF2e>[]): Promise<void>;
export { processGrantDeletions };
