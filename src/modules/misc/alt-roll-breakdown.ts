import { ChatMessagePF2e } from "types/pf2e/module/chat-message"
import { BaseModule } from "../base"

export class AltRolLBreakdownModule extends BaseModule {
	settingsKey = "script-alt-roll-breakdown"

	enable() {
		super.enable()

		this.registerHook("renderChatMessage", onRenderChatMessage)
	}
}

function onRenderChatMessage(msg: ChatMessagePF2e, html: JQuery) {
  if (!msg.author?.isGM || msg.actor?.hasPlayerOwner ) return

  if (!msg.isRoll || msg.isDamageRoll) return
  html.find('span.tag[data-slug="base"]').attr("data-visibility", "gm")
  html.find('div.dice-formula').attr("data-visibility", "gm")
  html.find('div.dice-tooltip').attr("data-visibility", "gm")

  if (game.user.isGM) return
  // Hide nat 1/20 highlight
  const firstRoll = msg.rolls.at(0)
  if (firstRoll) firstRoll.options.showBreakdown = false
}
