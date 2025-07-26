import type { ChatMessagePF2e, EncounterPF2e } from "foundry-pf2e"
import { QUERIES } from "src/constants"
import { BaseModule } from "../base"
import { handleRequest, removeDelayEffect } from "./delay"
import { handleGmMoveQuery } from "./query"
import { onRenderTokenHUD } from "./token-hud"
import { onRenderCombatTracker } from "./tracker"

export class DelayModule extends BaseModule {
	settingsKey = null

	enable() {
		super.enable()

		this.registerHook("renderEncounterTracker", onRenderCombatTracker)
		this.registerHook("renderTokenHUD", onRenderTokenHUD)
		this.registerHook("updateCombat", onUpdateCombat)
		this.registerHook("createChatMessage", onCreateMessage)

		this.registerQuery(QUERIES.delay.gmMoveAfter, handleGmMoveQuery)
	}
}

function onUpdateCombat(combat: EncounterPF2e) {
	if (game.user && game.user.id !== game.users?.activeGM?.id) return
	if (!combat.combatant?.actor) return
	removeDelayEffect(combat.combatant.actor)
}

function onCreateMessage(msg: ChatMessagePF2e) {
	if (msg?.author?.id !== game.user?.id) return
	if (!game.combat?.started) return
	const item = msg?.item
	if (
		item?.actor?.isOwner &&
		item.actor.combatant &&
		item?.type === "action" &&
		item.slug === "delay"
	) {
		handleRequest({ combatant: item.actor.combatant, skipMessage: true })
	}
}
