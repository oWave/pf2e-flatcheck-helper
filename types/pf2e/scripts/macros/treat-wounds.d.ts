import type { ActorPF2e } from "../../module/actor/index.ts";
import { ChatMessagePF2e } from "../../module/chat-message/index.ts";
import type { ActionDefaultOptions } from "../../module/system/action-macros/index.ts";
import { type DegreeOfSuccessString } from "../../module/system/degree-of-success.ts";
declare function treatWounds(options: ActionDefaultOptions): Promise<void>;
declare function treatWoundsMacroCallback({ actor, bonus, message, originalMessageId, outcome, }: {
    actor: ActorPF2e;
    bonus: number;
    message: ChatMessagePF2e;
    originalMessageId?: string;
    outcome?: DegreeOfSuccessString | null;
}): Promise<void>;
export { treatWounds, treatWoundsMacroCallback };
