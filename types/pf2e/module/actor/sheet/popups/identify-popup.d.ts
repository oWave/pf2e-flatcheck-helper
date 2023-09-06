/// <reference types="jquery" resolution-mode="require"/>
/// <reference types="jquery" resolution-mode="require"/>
/// <reference types="tooltipster" />
import { GenericIdentifyDCs, IdentifyAlchemyDCs, IdentifyMagicDCs } from "types/pf2e/module/item/identification.ts"
import { PhysicalItemPF2e } from "types/pf2e/module/item/physical/index.ts"
export declare class IdentifyItemPopup extends FormApplication<PhysicalItemPF2e> {
  static get defaultOptions(): FormApplicationOptions
  get item(): PhysicalItemPF2e
  getData(): Promise<IdentifyPopupData>
  activateListeners($form: JQuery<HTMLFormElement>): void
  protected _updateObject(_event: Event, formData: Record<string, unknown>): Promise<void>
}
interface IdentifyPopupData extends FormApplicationData {
  isMagic: boolean
  isAlchemical: boolean
  dcs: GenericIdentifyDCs | IdentifyMagicDCs | IdentifyAlchemyDCs
}
export {}
