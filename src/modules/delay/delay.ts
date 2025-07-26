import type { ActorPF2e, CombatantPF2e, TokenDocumentPF2e } from "foundry-pf2e"
import MODULE from "src"
import { combatantIsNext, translate } from "src/utils"
import { sendGmMoveQuery } from "./query"
import { isDelaying } from "./utils"

interface RequestOpts {
	combatant: CombatantPF2e
	skipMessage?: true
	type?: "delay" | "return"
}

export async function handleRequest(opts: RequestOpts) {
	const combatant = opts.combatant
	const combat = opts.combatant.parent
	if (!combat?.started) return ui.notifications.error(translate("delay.errors.combat-not-started"))
	if (!combatant.isOwner)
		return ui.notifications.error(translate("delay.errors.combatant-not-owned"))

	let type = opts?.type
	if (!type) {
		if (combatant?.actor && isDelaying(combatant.actor)) type = "return"
		else if (combatant === combat.combatant) type = "delay"
	}

	if (type === "delay") tryDelay(opts)
	else if (type === "return") tryReturn(opts)
}

function tryDelay(opts: RequestOpts) {
	if (!MODULE.settings.delayShouldPrompt) {
		applyDelay(opts)
		opts.combatant.parent?.nextTurn()
	} else {
		import("./apps/index").then((apps) => new apps.DelayPromptDialog(opts.combatant).render(true))
	}
}

export function applyDelay({ combatant, skipMessage }: RequestOpts) {
	if (!skipMessage && combatant.token) createMessage(combatant.token, "delay")
	if (combatant.actor) applyDelayEffect(combatant.actor)
}

async function tryReturn(opts: RequestOpts) {
	if (combatantIsNext(opts.combatant)) return

	const currentCombatant = opts.combatant.parent?.combatant
	if (currentCombatant && opts.combatant.uuid) {
		await sendGmMoveQuery({
			combatantUuid: opts.combatant.uuid,
			advanceTurn: false,
			afterId: currentCombatant.id,
		})
		if (opts.combatant.token) createMessage(opts.combatant.token, "return")
	}
}

export function createMessage(token: TokenDocumentPF2e, type: "delay" | "return") {
	if (MODULE.settings.delayCreateMessage) {
		const title = translate(`delay.actions.${type}`)
		ChatMessage.create({
			speaker: ChatMessage.getSpeaker({ token }),
			content: `<div class="pf2e chat-card action-card">
      <header class="card-header flexrow">
			<img src="systems/pf2e/icons/actions/FreeAction.webp" alt="${title}">
			<h3>${title} <span class="action-glyph">F</span></h3>
      </header>
			</div>`,
		})
	}
}

async function applyDelayEffect(actor: ActorPF2e) {
	return actor.createEmbeddedDocuments("Item", [
		{
			type: "effect",
			name: translate("delay.delay"),
			img: "icons/svg/clockwork.svg",
			system: {
				tokenIcon: { show: true },
				duration: {
					value: -1,
					unit: "encounter",
					sustained: false,
					expiry: "turn-start",
				},
				slug: "x-delay",
			},
		},
	])
}

export async function removeDelayEffect(actor: ActorPF2e) {
	const effects = actor.items.filter((e) => e.slug === "x-delay")
	if (effects.length)
		await actor.deleteEmbeddedDocuments(
			"Item",
			effects.map((e) => e.id),
		)
}
