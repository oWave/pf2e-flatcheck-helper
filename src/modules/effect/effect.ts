import type { ChatMessagePF2e } from "foundry-pf2e"
import { QUERIES } from "src/constants"
import { BaseModule } from "../base"
import { HTMLUtils } from "./html"
import { handleApplyRequest } from "./request"

export class EffectModule extends BaseModule {
	settingsKey = null

	enable(): void {
		this.registerHook("renderChatMessageHTML", this.onRenderMessage.bind(this))
		this.registerQuery(QUERIES.effect.request, handleApplyRequest)
	}
	onRenderMessage(msg: ChatMessagePF2e, html: HTMLElement) {
		if (!(game.user.isGM || msg.item?.canUserModify(game.user, "update"))) return
		if (!msg.item) return

		const content = html.querySelector<HTMLElement>(".card-content")
		if (content) HTMLUtils.wrapLinks(msg.item, content)
	}
}
