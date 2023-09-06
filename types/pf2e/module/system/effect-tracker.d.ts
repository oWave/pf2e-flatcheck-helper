import type { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import type { EffectPF2e } from "types/pf2e/module/item/index.ts"
import type { EncounterPF2e } from "types/pf2e/module/encounter/index.ts"
export declare class EffectTracker {
  #private
  effects: EffectPF2e<ActorPF2e>[]
  /** A separate collection of aura effects, including ones with unlimited duration */
  auraEffects: Collection<EffectPF2e<ActorPF2e>>
  private insert
  register(effect: EffectPF2e<ActorPF2e>): void
  unregister(toRemove: EffectPF2e<ActorPF2e>): void
  /**
   * Check for expired effects, removing or disabling as appropriate according to world settings
   * @param [options.resetItemData] Perform individual item data resets. This is only needed when the world time
   *                                changes.
   */
  refresh(options?: { resetItemData?: boolean }): Promise<void>
  /** Expire or remove on-encounter-end effects */
  onEncounterEnd(encounter: EncounterPF2e): Promise<void>
}
