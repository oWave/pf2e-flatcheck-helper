import type { ChatMessagePF2e } from "foundry-pf2e"
import { BaseModule } from "../base"
import { HTMLUtils } from "./html"

export class EffectModule extends BaseModule {
	settingsKey = null

	enable(): void {
		this.registerHook("renderChatMessageHTML", this.onRenderMessage.bind(this))
	}
	onRenderMessage(msg: ChatMessagePF2e, html: HTMLElement) {
		if (!game.user.isGM) return
		if (!msg.item) return

		const content = html.querySelector<HTMLElement>(".card-content")
		if (content) HTMLUtils.wrapLinks(msg.item, content)
	}
}
