import { ActorPF2e } from "types/pf2e/module/actor/base.ts"
interface PopupData extends FormApplicationData<ActorPF2e> {
  tokenInfo: {
    id: string
    name: string
    checked: boolean
  }[]
}
export declare class LootNPCsPopup extends FormApplication<ActorPF2e> {
  static get defaultOptions(): FormApplicationOptions
  _updateObject(
    _event: Event,
    formData: Record<string, unknown> & {
      selection?: boolean
    }
  ): Promise<void>
  getData(): Promise<PopupData>
}
export {}
