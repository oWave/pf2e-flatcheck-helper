import { PhysicalItemPF2e } from "types/pf2e/module/item/index.ts"
import { ChatMessagePF2e } from "types/pf2e/module/chat-message/index.ts"
import { CheckDC } from "types/pf2e/module/system/degree-of-success.ts"
import { SkillActionOptions } from "../types.ts"
declare function repair(options: RepairActionOptions): Promise<void>
declare function onRepairChatCardEvent(
  event: MouseEvent,
  message: ChatMessagePF2e | undefined,
  card: HTMLElement
): Promise<void>
interface RepairActionOptions extends SkillActionOptions {
  difficultyClass?: CheckDC
  item?: PhysicalItemPF2e
  uuid?: string
}
export { onRepairChatCardEvent, repair }
