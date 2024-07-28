import { PhysicalItemPF2e } from "../../../item/index.ts";
import { ChatMessagePF2e } from "../../../chat-message/index.ts";
import { CheckDC } from "../../degree-of-success.ts";
import { SkillActionOptions } from "../types.ts";
declare function repair(options: RepairActionOptions): Promise<void>;
declare function onRepairChatCardEvent(event: MouseEvent, message: ChatMessagePF2e | undefined, card: HTMLElement): Promise<void>;
interface RepairActionOptions extends SkillActionOptions {
    difficultyClass?: CheckDC;
    item?: PhysicalItemPF2e;
    uuid?: string;
}
export { onRepairChatCardEvent, repair };
