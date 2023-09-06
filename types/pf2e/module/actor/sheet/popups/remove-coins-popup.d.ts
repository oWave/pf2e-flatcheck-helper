import { Coins } from "types/pf2e/module/item/physical/data.ts"
import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
interface PopupFormData extends Coins {
  removeByValue: boolean
}
/**
 * @category Other
 */
export declare class RemoveCoinsPopup extends FormApplication<ActorPF2e> {
  static get defaultOptions(): FormApplicationOptions
  _updateObject(_event: Event, formData: Record<string, unknown> & PopupFormData): Promise<void>
}
export {}
