import { AbilitySystemData } from "./data.ts"
import { ItemPF2e } from "types/pf2e/module/item/index.ts"
interface SourceWithActionData {
  system: {
    actionType: AbilitySystemData["actionType"]
    actions: AbilitySystemData["actions"]
  }
}
interface SourceWithFrequencyData {
  system: {
    frequency?: AbilitySystemData["frequency"]
  }
}
/** Pre-update helper to ensure actionType and actions are in sync with each other */
declare function normalizeActionChangeData(
  document: SourceWithActionData,
  changed: DeepPartial<SourceWithActionData>
): void
/** Adds sheet listeners for modifying frequency */
declare function addSheetFrequencyListeners(item: ItemPF2e & SourceWithFrequencyData, html: HTMLElement): void
export { addSheetFrequencyListeners, normalizeActionChangeData }
