import type { ChatMessagePF2e } from "types/pf2e/module/chat-message"
import type { DamageRoll } from "types/pf2e/module/system/damage/roll"
import { BaseModule } from "../base"
import { MODULE_ID } from "src/constants"

export class AltRolLBreakdownModule extends BaseModule {
	settingsKey = "script-alt-roll-breakdown"

	enable() {
		super.enable()

		this.registerHook("renderChatMessage", onRenderChatMessage)
		this.registerHook("diceSoNiceRollStart", onDSNRollStart)
	}

	onReady() {
		verifySettingsDialog()
	}
}

function shouldHide(msg: ChatMessagePF2e) {
	return (
		game.settings.get("pf2e", "metagame_showBreakdowns") &&
		msg.author?.isGM &&
		!msg.actor?.hasPlayerOwner &&
		msg.isRoll
	)
}

async function onRenderChatMessage(msg: ChatMessagePF2e, html: JQuery) {
	if (!shouldHide(msg)) return

	if (msg.isDamageRoll) {
		html.find("div.tags.modifiers span.tag").attr("data-visibility", "gm")

		const roll = msg.rolls.at(0) as DamageRoll | null
		if (roll?.instances.length === 1) {
			const instanceHtml = await renderTemplate(
				`modules/${MODULE_ID}/templates/chat/damage-roll-instance.hbs`,
				{ instances: roll.instances },
			)
			html.find("h4.dice-total span.total").after(instanceHtml)
		}

		if (!game.user.isGM) html.find("div.tags.modifiers").remove()
	} else {
		html.find('span.tag[data-slug="base"]').attr("data-visibility", "gm")
	}

	html.find("div.dice-formula").attr("data-visibility", "gm")
	html.find("div.dice-tooltip").attr("data-visibility", "gm")

	if (game.user.isGM) return
	// Hide nat 1/20 highlight
	const firstRoll = msg.rolls.at(0)
	if (firstRoll) firstRoll.options.showBreakdown = false
}

function onDSNRollStart(messageId: string, context: any) {
	if (game.user.isGM) return
	const msg = game.messages.get(messageId)
	if (msg && shouldHide(msg)) context.roll.ghost = true
}

function verifySettingsDialog() {
	if (!game.user.isGM || game.settings.get("pf2e", "metagame_showBreakdowns")) return

	// @ts-expect-error
	new foundry.applications.api.DialogV2({
		window: { title: "PF2e Utility Buttons" },
		content: `
     <p>Alternative Roll Breakdowns need the "Show Roll Breakdowns" system metagame setting to be enabled.</p>
    `,
		buttons: [
			{
				action: "disable",
				label: "Disable Alternative Roll Breakdowns",
				callback: () => game.settings.set(MODULE_ID, "script-alt-roll-breakdown", false),
			},
			{
				action: "enable",
				label: "Enable system setting",
				default: true,
				callback: () => game.settings.set("pf2e", "metagame_showBreakdowns", true),
			},
		],
		submit: () => {},
	}).render({ force: true })
}
