import { MODULE_ID, QUERIES } from "src/constants"
import MODULE from "src/index"
import { combatantIsNext, isJQuery, parseHTML, sleep, translate } from "src/utils"
import { BaseModule } from "../base"
import { onRenderCombatTracker } from "./tracker"
import { isDelaying, setInitiativeFromDrop } from "./utils"
import type {
	ActorPF2e,
	ChatMessagePF2e,
	CombatantPF2e,
	EncounterPF2e,
	RolledCombatant,
	TokenDocumentPF2e,
	TokenPF2e,
} from "foundry-pf2e"
import { handleGmMoveQuery } from "./query"
import type TokenHUD from "foundry-pf2e/foundry/client/applications/hud/token-hud.mjs"
import { handleRequest, removeDelayEffect } from "./delay"
import { onRenderTokenHUD } from "./token-hud"

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
