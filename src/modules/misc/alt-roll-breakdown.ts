import { MODULE_ID } from "src/constants"
import type { ChatMessagePF2e } from "foundry-pf2e"
import { BaseModule } from "../base"
import { parseHTML } from "src/utils"

export class AltRolLBreakdownModule extends BaseModule {
	settingsKey = "script-alt-roll-breakdown"

	enable() {
		super.enable()

		this.registerHook("renderChatMessage", onRenderChatMessage)
	}

	onReady() {
		verifySettingsDialog()
	}
}

function shouldHide(msg: ChatMessagePF2e) {
	return (
		!game.settings.get("pf2e", "metagame_showBreakdowns") &&
		msg.author?.isGM &&
		!msg.actor?.hasPlayerOwner &&
		msg.isRoll
	)
}

async function onRenderChatMessage(msg: ChatMessagePF2e, $html: JQuery) {
	const html = $html[0]
	if (!shouldHide(msg)) return
	if (!msg.flags.pf2e.modifiers) return

	const toReveal = msg.flags.pf2e.modifiers.filter(
		(m) =>
			m.type &&
			["untyped", "circumstance", "status"].includes(m.type) &&
			m.slug !== "base" &&
			m.enabled,
	)

	if (game.user.isGM) {
		for (const modifier of toReveal) {
			html
				.querySelector(`span.flavor-text span.tag[data-slug="${modifier.slug}"]`)
				?.removeAttribute("data-visibility")
		}
	} else {
		// Sanity check: Testing if the message already has modifiers the lazy way
		// Don't add more modifiers if the message has some for whatever reason
		if (!$html.find("div.tags.modifiers").is(":empty")) return
		const modifiersHTML = toReveal.map((m) => {
			const mod = m.modifier < 0 ? m.modifier : `+${m.modifier}`
			return `<span class="tag tag_transparent" data-slug="${m.slug}">${m.label} ${mod}</span>`
		})

		html
			.querySelector("span.flavor-text")
			?.appendChild(parseHTML(`<div class="tags modifiers">${modifiersHTML.join("")}</div>`))
	}
}

function verifySettingsDialog() {
	if (!game.user.isGM || !game.settings.get("pf2e", "metagame_showBreakdowns")) return

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
				callback: () => game.settings.set("pf2e", "metagame_showBreakdowns", false),
			},
		],
		submit: undefined,
	}).render({ force: true })
}
