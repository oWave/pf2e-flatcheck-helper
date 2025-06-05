import { MODULE_ID } from "src/constants"
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
} from "foundry-pf2e"

export class DelayModule extends BaseModule {
	settingsKey = null

	enable() {
		super.enable()

		this.registerHook("renderEncounterTracker", onRenderCombatTracker)
		this.registerHook("renderTokenHUD", onRenderTokenHUD)
		this.registerHook("updateCombat", onUpdateCombat)
		this.registerHook("createChatMessage", onCreateMessage)

		this.registerSocket("moveAfter", socketMoveAfter)
	}
}
function onRenderTokenHUD(app: TokenHUD, html: HTMLElement) {
	if (MODULE.settings.showInTokenHUD) {
		const token = app.object
		const combatant = token?.combatant as CombatantPF2e
		if (
			combatant?.parent?.started &&
			!!combatant &&
			combatant.initiative != null &&
			combatant.actor &&
			combatant.isOwner
		) {
			const column = html.querySelector("div.col.right")
			if (!column) return

			let delayButtonHTML: DocumentFragment | null = null
			if (isDelaying(combatant.actor)) {
				if (!combatantIsNext(combatant) && MODULE.settings.allowReturn) {
					delayButtonHTML = parseHTML(`
            <div class="control-icon" style="display: flex;" data-action="return" title="${translate("delay.return-to-initiative")}">
              <i class="fa-solid fa-play"></i>
            </div>`)

					delayButtonHTML.firstElementChild?.addEventListener("click", (event) => {
						if (combatant.actor && isDelaying(combatant.actor) && !combatantIsNext(combatant)) {
							tryReturn(combatant)
							if (event.currentTarget instanceof HTMLElement)
								event.currentTarget.style.display = "none"
						}
					})
				}
			} else if (combatant.parent.combatant?.id === combatant.id) {
				delayButtonHTML = parseHTML(`
          <div class="control-icon" style="display: flex;" data-action="delay" title="${translate("delay.delay")}">
            <i class="fa-solid fa-hourglass"></i>
          </div>`)

				delayButtonHTML.firstElementChild?.addEventListener("click", () => {
					if (combatant.parent?.combatant?.id === combatant.id) tryDelay()
				})
			}
			if (delayButtonHTML) column.append(delayButtonHTML)
		}
	}

	if (MODULE.settings.removeCombatToggle) {
		const token = app.object
		const combatant = token?.combatant
		if (combatant?.parent.started && !!combatant && combatant.initiative != null) {
			const toggleCombatButton = html.querySelector<HTMLElement>(
				"button.control-icon[data-action=combat]",
			)
			if (toggleCombatButton) toggleCombatButton.style.display = "none"
		}
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
	if (item?.actor?.isOwner && item?.type === "action" && item.slug === "delay")
		if (isDelaying(item.actor) && item.actor.combatant) {
			if (MODULE.settings.allowReturn) tryReturn(item.actor.combatant, { skipMessage: true })
		} else if (item.actor.id === game.combat.combatant?.actorId) tryDelay({ skipMessage: true })
}

function socketMoveAfter({
	combatId,
	combatantId,
	afterId,
}: {
	combatId: string
	combatantId: string
	afterId: string
}) {
	if (game.users.activeGM?.id !== game.user.id) return

	const combat = game.combats?.get(combatId) as EncounterPF2e
	if (!combat || combat.id !== ui.combat.viewed?.id) return
	const combatant = combat.combatants.get(combatantId) as RolledCombatant<EncounterPF2e>
	const after = combat.combatants.get(afterId)

	if (!combatant || !after || combatant.initiative == null || after.initiative == null) return

	const newOrder = combat.turns.filter(
		(c): c is RolledCombatant<EncounterPF2e> =>
			typeof c.initiative === "number" && c.id !== combatant.id,
	)
	const afterIndex = newOrder.findIndex((c) => c.id === afterId)
	newOrder.splice(afterIndex + 1, 0, combatant)

	setInitiativeFromDrop(combat, newOrder, combatant)

	combat.setMultipleInitiatives(
		newOrder.map((c) => ({
			id: c.id,
			value: c.initiative,
			overridePriority: c.overridePriority(c.initiative),
		})),
	)
}

interface TryDelayOptions {
	skipMessage: boolean
}

export function tryDelay(opts?: TryDelayOptions) {
	const combat = game.combat
	if (!combat) return ui.notifications.error(translate("delay.error-no-combat"))
	const c = combat.combatant
	if (!c) return ui.notifications.error(translate("delay.error-no-combatant"))
	if (!c.token?.isOwner) return ui.notifications.error(translate("delay.error-combatant-not-owned"))

	const combatants = combat.turns
	const currentId = combatants.findIndex((e) => e.id === c.id)

	const options = combatants
		.filter((e) => game.user.isGM || !e.hidden)
		.map((e, i) => {
			const disabled = e.id === c.id || i === currentId - 1 ? "disabled" : ""
			const style = e.id === c.id ? "background: rgba(51, 188, 78, 0.3);" : ""
			let name = e.name
			if (!game.user.isGM && game.pf2e.settings.tokens.nameVisibility && !e.playersCanSeeName)
				name = "?"

			return `<option value="${e.id}" style="${style}" ${disabled}>${e.initiative} - ${name}</option>`
		})

	if (!MODULE.settings.delayShouldPrompt) {
		if (!opts?.skipMessage) createMessage(c.token, translate("delay.delay"))
		if (c.actor) applyDelayEffect(c.actor)
		combat.nextTurn()
		return
	}

	new Dialog(
		{
			title: translate("delay.delay"),
			content: `
    <form style="margin: 5px 0 10px 0; text-align: center;">
      <label for="c">${translate("delay.dialog-delay-after")}</label>
      <select id="c">
        ${options}
      </select>
    </form>
    `,
			buttons: {
				cancel: {
					label: translate("delay.cancel"),
					icon: `<i class="fa-solid fa-xmark"></i>`,
				},
				delay: {
					label: translate("delay.delay"),
					icon: `<i class="fa-solid fa-hourglass"></i>`,
					callback: (html) => {
						if (!isJQuery(html)) return
						const id = html.find("select#c").val()
						if (typeof id !== "string") return
						// Ensure it's still the combatants turn that the dialog opened with
						if (game.combat?.id !== combat.id || c.id !== game.combat?.combatant?.id) return
						const target = game.combat.combatants.get(id)
						if (!target) return
						if (c.actor) applyDelayEffect(c.actor)
						if (!opts?.skipMessage && c.token) createMessage(c.token, translate("delay.delay"))
						combat
							.nextTurn()
							.then(() => sleep(50))
							.then(() => emitMoveAfter(combat.id, c.id, target.id))
							.catch((e) => {
								throw e
							})
					},
				},
			},
		},
		// Prevents opening the dialog multiple times
		{ id: `${MODULE_ID}-delay` },
	).render(true)
}

export function tryReturn(combatant: CombatantPF2e, opts?: TryDelayOptions) {
	if (game.combat?.combatant && !combatantIsNext(combatant)) {
		if (!opts?.skipMessage && combatant.token)
			createMessage(combatant.token, translate("delay.return-message-title"))
		emitMoveAfter(game.combat.id, combatant.id, game.combat.combatant.id)
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

function removeDelayEffect(actor: ActorPF2e) {
	const e = actor.items.find((e) => e.slug === "x-delay")
	if (e?.id) return actor.deleteEmbeddedDocuments("Item", [e.id])
}

function emitMoveAfter(combatId: string, combatantId: string, afterId: string) {
	MODULE.socketHandler.emit("moveAfter", { combatId, combatantId, afterId })
}

function createMessage(token: TokenDocumentPF2e, title: string) {
	if (MODULE.settings.delayCreateMessage)
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
