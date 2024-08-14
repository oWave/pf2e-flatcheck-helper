import type { ActorPF2e } from "types/pf2e/module/actor"
import type { ChatMessagePF2e } from "types/pf2e/module/chat-message"
import type { CombatantPF2e, EncounterPF2e } from "types/pf2e/module/encounter"
import type { TokenDocumentPF2e } from "types/pf2e/module/scene"
import { MODULE_ID } from "./constants"
import module from "./index"
import { combatantIsNext, isJQuery, sleep } from "./utils"

async function applyDelayEffect(actor: ActorPF2e) {
	return actor.createEmbeddedDocuments("Item", [
		{
			type: "effect",
			name: "Delay",
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

function isDelaying(actor: ActorPF2e) {
	return actor.items.some((e) => e.slug === "x-delay")
}

function removeDelaying(actor: ActorPF2e) {
	const e = actor.items.find((e) => e.slug === "x-delay")
	if (e?.id) return actor.deleteEmbeddedDocuments("Item", [e.id])
}

const sortedCombatants = () => {
	if (!game.combat) throw new Error("No combat?")
	return game
		.combat!.combatants.filter((e) => e.initiative !== null)
		.sort((a, b) => {
			const resolveTie = (): number => {
				const [priorityA, priorityB] = [a, b].map(
					(c): number =>
						c.overridePriority(c.initiative ?? 0) ?? c.actor?.initiative?.tiebreakPriority ?? 3,
				)
				return priorityA === priorityB ? a.id.localeCompare(b.id) : priorityA - priorityB
			}

			return typeof a.initiative === "number" &&
				typeof b.initiative === "number" &&
				a.initiative === b.initiative
				? resolveTie()
				: b.initiative! - a.initiative! || (a.id > b.id ? 1 : -1)
		})
}

interface TryDelayOptions {
	skipMessage: boolean
}

export function tryDelay(opts?: TryDelayOptions) {
	const combat = game.combat
	if (!combat) return ui.notifications.error("No combat active")
	const c = combat.combatant
	if (!c) return ui.notifications.error("No combatant")
	if (!c.token?.isOwner) return ui.notifications.error("You do not own the current combatant")

	const combatants = sortedCombatants()
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

	if (!module.settings.delayShouldPrompt) {
		if (!opts?.skipMessage) createMessage(c.token, "Delay")
		if (c.actor) applyDelayEffect(c.actor)
		combat.nextTurn()
		return
	}

	new Dialog(
		{
			title: "Delay",
			content: `
    <form style="margin: 5px 0 10px 0; text-align: center;">
      <label for="c">Delay after: </label>
      <select id="c">
        ${options}
      </select>
    </form>
    `,
			buttons: {
				cancel: {
					label: "Cancel",
					icon: `<i class="fa-solid fa-xmark"></i>`,
				},
				delay: {
					label: "Delay",
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
						if (!opts?.skipMessage && c.token) createMessage(c.token, "Delay")
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

function tryReturn(combatant: CombatantPF2e, opts?: TryDelayOptions) {
	if (game.combat?.combatant && !combatantIsNext(combatant)) {
		if (!opts?.skipMessage && combatant.token) createMessage(combatant.token, "Return")
		emitMoveAfter(game.combat.id, combatant.id, game.combat.combatant.id)
	}
}

interface MoveAfterPayload {
	combatId: string
	combatantId: string
	afterId: string
}

function emitMoveAfter(combatId: string, combatantId: string, afterId: string) {
	module.socketHandler.emit("moveAfter", { combatId, combatantId, afterId })
}

export function moveAfter({ combatId, combatantId, afterId }: MoveAfterPayload) {
	if (game.users.activeGM?.id !== game.user.id) return

	const combat = game.combats?.get(combatId) as EncounterPF2e
	if (!combat) return
	const combatant = combat.combatants.get(combatantId)
	const after = combat.combatants.get(afterId)

	if (!combatant || !after) return

	const targetInitiative = after.initiative
	if (!targetInitiative) return

	const order = combat.turns
		.filter((c) => c.id !== combatantId)
		.map((c) => {
			return {
				id: c.id,
				initiative: c.initiative,
			}
		})
	let afterIndex = combat.turns.findIndex((c) => c.id === afterId)
	if (afterIndex === 0) afterIndex++

	const newOrder = [
		...order.slice(0, afterIndex),
		{ id: combatant.id, initiative: targetInitiative },
		...order.slice(afterIndex),
	]

	const updates: {
		id: string
		value: number
		overridePriority: number
	}[] = []

	const withSameInitiative = newOrder.filter((c) => c.initiative === targetInitiative)
	for (const [i, { id }] of withSameInitiative.entries()) {
		updates.push({
			id: id!,
			value: targetInitiative!,
			overridePriority: i,
		})
	}

	/*
  console.log("--Updates--")
  updates.forEach((e) => {
    const c = game.combat?.combatants.get(e.id)
    console.log(
      `${c?.name} ${c?.initiative} ${c?.flags.pf2e.overridePriority[c?.initiative] ?? "-"} -> ${e.value} ${
        e.overridePriority
      }`
    )
  })
  */
	game.combat?.setMultipleInitiatives(updates).catch((e) => {
		throw e
	})
}

function drawButton(type: "delay" | "return", combatentHtml: JQuery, combatant: CombatantPF2e) {
	let button = $(`
    <div id="initiative-delay" title="Delay">
      <i class="fa-solid fa-hourglass"></i>
    </div>
  `)
	if (type === "return") {
		const title = module.settings.allowReturn ? "Return to initiative" : "Delaying"
		const cls = module.settings.allowReturn ? "initiative-return" : "initiative-delay-indicator"
		button = $(`
      <div id="initiative-return" class="${cls}" title="${title}">
        <img class="delay-indicator" src="/icons/svg/clockwork.svg"></img>
        <i class="fa-solid fa-play"></i>
      </div>
    `)
	}

	const div = combatentHtml.find(".token-initiative")
	div.find(".initiative").hide()
	div.append(button)

	button.on("click", (e) => {
		e.stopPropagation()
		if (type === "delay") tryDelay()
		else if (module.settings.allowReturn) tryReturn(combatant)
	})
}

function createMessage(token: TokenDocumentPF2e, title: string) {
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

function onRenderCombatTracker(tracker, html: JQuery, data) {
	if (!module.settings.showInCombatTracker) return
	const combat = game.combat
	if (!combat || !combat.started) return

	html.find(".combatant.actor").each((i, e) => {
		const id = e.dataset.combatantId
		if (!id) return
		const c = combat.combatants.get(id)
		if (!c || !c.isOwner || c.initiative == null) return

		if (combat.combatant?.id === c.id) drawButton("delay", $(e), c)
		else if (c.actor && isDelaying(c.actor)) drawButton("return", $(e), c)
	})
}

function onRenderTokenHUD(app: TokenHUD, html: JQuery) {
	if (module.settings.showInTokenHUD) {
		const token = app.object
		const combatant = token?.combatant as CombatantPF2e
		if (
			combatant?.parent?.started &&
			!!combatant &&
			combatant.initiative != null &&
			combatant.actor &&
			combatant.isOwner
		) {
			const column = html.find("div.col.right")

			if (isDelaying(combatant.actor)) {
				if (!combatantIsNext(combatant) && module.settings.allowReturn) {
					$(`
            <div class="control-icon" data-action="return" title="Return to initiative">
              <i class="fa-solid fa-play"></i>
            </div>`)
						.on("click", (e) => {
							if (combatant.actor && isDelaying(combatant.actor) && !combatantIsNext(combatant)) {
								tryReturn(combatant)
								e.currentTarget.style.display = "none"
							}
						})
						.appendTo(column)
				}
			} else if (combatant.parent.combatant?.id === combatant.id) {
				$(`
          <div class="control-icon" data-action="delay" title="Delay">
            <i class="fa-solid fa-hourglass"></i>
          </div>`)
					.on("click", (e) => {
						if (combatant.parent?.combatant?.id === combatant.id) tryDelay()
					})
					.appendTo(column)
			}
		}
	}

	if (module.settings.removeCombatToggle) {
		const token = app.object
		const combatant = token?.combatant
		if (combatant?.parent.started && !!combatant && combatant.initiative != null) {
			const toggleCombatButton = html.find("div.control-icon[data-action=combat]")
			toggleCombatButton?.hide()
		}
	}
}

export function setupDelay() {
	Hooks.on("renderEncounterTrackerPF2e", onRenderCombatTracker)
	Hooks.on("renderTokenHUD", onRenderTokenHUD)

	Hooks.on<[EncounterPF2e]>("updateCombat", (combat) => {
		if (game.user && game.user.id !== game.users?.activeGM?.id) return
		if (!combat.combatant?.actor) return
		removeDelaying(combat.combatant.actor)
	})

	Hooks.on<[ChatMessagePF2e]>("createChatMessage", (msg) => {
		if (msg?.author?.id !== game.user?.id) return
		if (!game.combat?.started) return
		const item = msg?.item
		if (item?.actor?.isOwner && item?.type === "action" && item.slug === "delay")
			if (isDelaying(item.actor) && item.actor.combatant) {
				if (module.settings.allowReturn) tryReturn(item.actor.combatant, { skipMessage: true })
			} else if (item.actor.id === game.combat.combatant?.actorId) tryDelay({ skipMessage: true })
	})

	module.socketHandler.register("moveAfter", moveAfter)
}
