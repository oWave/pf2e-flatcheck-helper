import type { ChatMessagePF2e } from "foundry-pf2e"
import { MODULE_ID } from "src/constants"
import { SYSTEM } from "src/utils"
import { BaseModule } from "../base"

export class AltRollBreakdownModule extends BaseModule {
	settingsKey = "script-alt-roll-breakdown"

	enable() {
		super.enable()

		this.registerHook("renderChatMessageHTML", onRenderChatMessage)
	}

	onReady() {
		verifySettingsDialog()
	}
}

function shouldHide(msg: ChatMessagePF2e) {
	return (
		!game.settings.get(SYSTEM.id, "metagame_showBreakdowns") &&
		msg.author?.isGM &&
		!msg.actor?.hasPlayerOwner &&
		msg.isRoll
	)
}

async function onRenderChatMessage(msg: ChatMessagePF2e, html: HTMLElement) {
	if (!shouldHide(msg)) return
	const modifiers = msg.flags[SYSTEM.id].modifiers
	if (!modifiers) return

	const toReveal = modifiers.filter(
		(m) =>
			m.type &&
			["untyped", "circumstance", "status"].includes(m.type) &&
			m.slug !== "base" &&
			m.enabled,
	)

	for (const modifier of toReveal) {
		html
			.querySelector(`span.flavor-text span.tag[data-slug="${modifier.slug}"]`)
			?.removeAttribute("data-visibility")
	}
}

function verifySettingsDialog() {
	if (!game.user.isGM || !game.settings.get(SYSTEM.id, "metagame_showBreakdowns")) return

	new foundry.applications.api.DialogV2({
		window: { title: "PF2e Utility Buttons - Alternative Roll Breakdowns" },
		content: `
     <p>Alternative Roll Breakdowns need the "Show Roll Breakdowns" system metagame setting to be disabled.</p>
    `,
		buttons: [
			{
				action: "disable",
				label: "Disable Alternative Roll Breakdowns",
				callback: () => game.settings.set(MODULE_ID, "script-alt-roll-breakdown", false),
			},
			{
				action: "enable",
				label: "Disable system setting",
				default: true,
				callback: () => game.settings.set(SYSTEM.id, "metagame_showBreakdowns", false),
			},
		],
		submit: undefined,
	}).render({ force: true })
}
