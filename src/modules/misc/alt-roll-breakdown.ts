import { MODULE_ID } from "src/constants"
import type { ChatMessagePF2e } from "foundry-pf2e"
import { BaseModule } from "../base"

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

async function onRenderChatMessage(msg: ChatMessagePF2e, html: JQuery) {
	if (game.user.isGM || !shouldHide(msg)) return

	// Testing if the message already has modifiers the lazy way
	if (!html.find("div.tags.modifiers").is(":empty")) return
	if (!msg.flags.pf2e.modifiers) return

	const modifiersHTML = msg.flags.pf2e.modifiers
		.filter(
			(m) =>
				m.type &&
				["untyped", "circumstance", "status"].includes(m.type) &&
				m.slug !== "base" &&
				m.enabled,
		)
		.map((m) => {
			const mod = m.modifier < 0 ? m.modifier : `+${m.modifier}`
			return `<span class="tag tag_transparent" data-slug="${m.slug}">${m.label} ${mod}</span>`
		})

	html
		.find("span.flavor-text")
		.append(`<div class="tags modifiers">${modifiersHTML.join("")}</div>`)
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
		submit: () => {},
	}).render({ force: true })
}
