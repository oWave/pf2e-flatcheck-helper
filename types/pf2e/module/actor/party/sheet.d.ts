/// <reference types="jquery" resolution-mode="require"/>
/// <reference types="jquery" resolution-mode="require"/>
/// <reference types="tooltipster" />
import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import { ActorSheetPF2e } from "types/pf2e/module/actor/sheet/base.ts"
import { ActorSheetDataPF2e, ActorSheetRenderOptionsPF2e } from "types/pf2e/module/actor/sheet/data-types.ts"
import { ItemPF2e } from "types/pf2e/module/item/index.ts"
import { ItemSourcePF2e } from "types/pf2e/module/item/data/index.ts"
import { Bulk } from "types/pf2e/module/item/physical/index.ts"
import { ValueAndMax, ZeroToFour } from "types/pf2e/module/data.ts"
import { PartyPF2e } from "./document.ts"
interface PartySheetRenderOptions extends ActorSheetRenderOptionsPF2e {
  actors?: boolean
}
declare class PartySheetPF2e extends ActorSheetPF2e<PartyPF2e> {
  #private
  currentSummaryView: string
  static get defaultOptions(): ActorSheetOptions
  regionTemplates: Record<string, string>
  get isLootSheet(): boolean
  getData(options?: ActorSheetOptions): Promise<PartySheetData>
  protected setSummaryView(view: string): void
  activateListeners($html: JQuery<HTMLElement>): void
  /** Overriden to prevent inclusion of campaign-only item types. Those should get added to their own sheet */
  protected _onDropItemCreate(itemData: ItemSourcePF2e | ItemSourcePF2e[]): Promise<Item<PartyPF2e>[]>
  /** Override to not auto-disable fields on a thing meant to be used by players */
  protected _disableFields(_form: HTMLElement): void
  render(force?: boolean, options?: PartySheetRenderOptions): Promise<this>
  protected _renderInner(data: Record<string, unknown>, options: RenderOptions): Promise<JQuery<HTMLElement>>
  protected _onDropActor(event: ElementDragEvent, data: DropCanvasData<"Actor", PartyPF2e>): Promise<false | void>
}
interface PartySheetData extends ActorSheetDataPF2e<PartyPF2e> {
  restricted: boolean
  members: MemberBreakdown[]
  overviewSummary: {
    languages: LanguageSheetData[]
    skills: SkillData[]
    knowledge: {
      regular: SkillData[]
      lore: SkillData[]
    }
  } | null
  inventorySummary: {
    totalCoins: number
    totalWealth: number
    totalBulk: Bulk
  }
  explorationSummary: {
    speed: number
    activities: number
  }
  /** Unsupported items on the sheet, may occur due to disabled campaign data */
  orphaned: ItemPF2e[]
}
interface SkillData {
  slug: string
  label: string
  mod: number
  rank?: ZeroToFour | null
}
interface MemberBreakdown {
  actor: ActorPF2e
  heroPoints: ValueAndMax | null
  hasBulk: boolean
  bestSkills: SkillData[]
  /** If the actor is owned by the current user */
  owner: boolean
  /** If the actor has observer or greater permission */
  observer: boolean
  /** If the actor has limited or greater permission */
  limited: boolean
  speeds: {
    label: string
    value: number
  }[]
  senses: {
    label: string | null
    labelFull: string
    acuity?: string
  }[]
  hp: {
    showValue: boolean
    temp: number
    value: number
    max: number
  }
  /** If true, the current user is restricted from seeing meta details */
  restricted: boolean
}
interface LanguageSheetData {
  slug: string
  label: string
  actors: ActorPF2e[]
}
export { PartySheetPF2e, PartySheetRenderOptions }
