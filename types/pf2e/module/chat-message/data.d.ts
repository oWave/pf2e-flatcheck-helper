import { ItemType } from "types/pf2e/module/item/data/index.ts"
import { MagicTradition } from "types/pf2e/module/item/spell/types.ts"
import { BaseRawModifier } from "types/pf2e/module/actor/modifiers.ts"
import { DegreeAdjustmentsRecord, DegreeOfSuccessString } from "types/pf2e/module/system/degree-of-success.ts"
import { RollNoteSource } from "types/pf2e/module/notes.ts"
import { CheckRollContext } from "types/pf2e/module/system/check/index.ts"
import { ZeroToTwo } from "types/pf2e/module/data.ts"
import { DamageRollContext } from "types/pf2e/module/system/damage/types.ts"
interface ChatMessageSourcePF2e extends foundry.documents.ChatMessageSource {
  flags: ChatMessageFlagsPF2e
}
export interface ItemOriginFlag {
  type: ItemType
  uuid: string
  castLevel?: number
  messageId?: string
  variant?: {
    overlays: string[]
  }
}
type ChatMessageFlagsPF2e = foundry.documents.ChatMessageFlags & {
  pf2e: {
    damageRoll?: DamageRollFlag
    context?: ChatContextFlag
    origin?: ItemOriginFlag | null
    casting?: {
      id: string
      tradition: MagicTradition
    } | null
    modifierName?: string
    modifiers?: BaseRawModifier[]
    preformatted?: "flavor" | "content" | "both"
    isFromConsumable?: boolean
    journalEntry?: DocumentUUID
    strike?: StrikeLookupData | null
    appliedDamage?: AppliedDamageFlag | null
    [key: string]: unknown
  }
  core: NonNullable<foundry.documents.ChatMessageFlags["core"]>
}
type ChatContextFlag = CheckRollContextFlag | DamageRollContextFlag | SpellCastContextFlag
/** Data used to lookup a strike on an actor */
interface StrikeLookupData {
  actor: ActorUUID | TokenDocumentUUID
  index: number
  damaging: boolean
  name: string
  altUsage?: "thrown" | "melee" | null
}
interface DamageRollFlag {
  outcome: DegreeOfSuccessString
  total: number
  traits: string[]
  types: Record<string, Record<string, number>>
  diceResults: Record<string, Record<string, DieResult[]>>
  baseDamageDice: number
}
interface DieResult {
  faces: number
  result: number
}
interface TargetFlag {
  actor: ActorUUID | TokenDocumentUUID
  token?: TokenDocumentUUID
}
type ContextFlagOmission =
  | "actor"
  | "altUsage"
  | "createMessage"
  | "dosAdjustments"
  | "item"
  | "mapIncreases"
  | "notes"
  | "options"
  | "target"
  | "token"
interface CheckRollContextFlag extends Required<Omit<CheckRollContext, ContextFlagOmission>> {
  actor: string | null
  token: string | null
  item?: undefined
  dosAdjustments?: DegreeAdjustmentsRecord
  target: TargetFlag | null
  altUsage?: "thrown" | "melee" | null
  notes: RollNoteSource[]
  options: string[]
}
interface DamageRollContextFlag extends Required<Omit<DamageRollContext, ContextFlagOmission | "self">> {
  actor: string | null
  token: string | null
  item?: undefined
  mapIncreases?: ZeroToTwo
  target: TargetFlag | null
  notes: RollNoteSource[]
  options: string[]
}
interface SpellCastContextFlag {
  type: "spell-cast"
  domains: string[]
  options: string[]
  outcome?: DegreeOfSuccessString
  /** The roll mode (i.e., 'roll', 'blindroll', etc) to use when rendering this roll. */
  rollMode?: RollMode
}
interface AppliedDamageFlag {
  uuid: ActorUUID
  isHealing: boolean
  isReverted?: boolean
  persistent: string[]
  shield: {
    id: string
    damage: number
  } | null
  updates: {
    path: string
    value: number
  }[]
}
export {
  AppliedDamageFlag,
  ChatContextFlag,
  ChatMessageSourcePF2e,
  ChatMessageFlagsPF2e,
  CheckRollContextFlag,
  DamageRollFlag,
  DamageRollContextFlag,
  StrikeLookupData,
  TargetFlag,
}
