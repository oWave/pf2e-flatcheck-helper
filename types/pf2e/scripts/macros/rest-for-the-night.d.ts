import { ChatMessagePF2e } from "types/pf2e/module/chat-message/index.ts"
import { ActionDefaultOptions } from "types/pf2e/module/system/action-macros/index.ts"
interface RestForTheNightOptions extends ActionDefaultOptions {
  skipDialog?: boolean
}
/** A macro for the Rest for the Night quasi-action */
export declare function restForTheNight(options: RestForTheNightOptions): Promise<ChatMessagePF2e[]>
export {}
