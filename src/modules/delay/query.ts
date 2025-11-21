import type { EncounterPF2e, RolledCombatant } from "foundry-pf2e"
import { QUERIES } from "src/constants"
import { translate } from "src/utils"
import { nextCombatant, setInitiativeFromDrop } from "./utils"

interface GmMoveQueryData {
	combatantUuid: string
	afterId: string
	advanceTurn: boolean
}

export async function sendGmMoveQuery(data: GmMoveQueryData) {
	try {
		if (game.user.isGM) {
			await handleGmMoveQuery(data)
		} else {
			if (!game.users.activeGM)
				return ui.notifications.error(translate("delay.errors.no-active-gm"))
			await game.users.activeGM?.query(QUERIES.delay.gmMoveAfter, data)
		}
	} catch (e) {
		const note = game.user.isGM ? "" : " (gm and player)"
		ui.notifications.error(
			`Encounted error while updating initiative. Check console${note} for details.`,
		)
		console.error(e)
	}
}

export async function handleGmMoveQuery(data: GmMoveQueryData) {
	const combatant = fromUuidSync(data.combatantUuid) as RolledCombatant<EncounterPF2e>
	let combat = combatant?.parent
	const after = combat?.combatants.get(data.afterId)

	if (!combat || typeof combatant?.initiative !== "number" || typeof after?.initiative !== "number")
		return

	const { promise, resolve, reject } = Promise.withResolvers<void>()

	let hookId: number | null = null
	let timeoutId: any = null

	const cleanup = () => {
		if (hookId !== null) {
			Hooks.off("updateCombatant", hookId)
			hookId = null
		}
		if (timeoutId !== null) {
			clearTimeout(timeoutId)
			timeoutId = null
		}
	}

	let executing = false
	const executeMove = async () => {
		if (executing) return
		executing = true

		cleanup()

		try {
			if (combat.combatant === combatant) {
				return reject(new Error("Combatant to move is the active combatant"))
			}

			const newOrder = combat.turns.filter(
				(c): c is RolledCombatant<EncounterPF2e> =>
					typeof c.initiative === "number" && c !== combatant,
			)
			const afterIndex = newOrder.findIndex((c) => c.id === data.afterId)
			newOrder.splice(afterIndex + 1, 0, combatant)

			const updates = setInitiativeFromDrop(combat, newOrder, combatant)

			// console.log("Updates", updates)
			// console.log("Updating")
			await combat.updateEmbeddedDocuments("Combatant", updates)
			// console.log("Done")

			// debugCombat("After")
			resolve()
		} catch (err) {
			reject(err)
		}
	}

	// debugCombat("Before", { afterId: data.afterId })

	let waitingForTurnEnd = false
	let waitingForTurnStart = false

	if (data.advanceTurn) {
		if (combat.combatant !== combatant) {
			console.error("Delay: Refusing to advance turn because the current combatant changed")
			reject(new Error(`Refusing to advance turn because the current combatant changed`))
			return promise
		}

		if (combat.combatant.flags.pf2e.roundOfLastTurnEnd !== combat.round) waitingForTurnEnd = true
		if (nextCombatant(combat)?.flags.pf2e.roundOfLastTurn !== combat.round)
			waitingForTurnStart = true

		if (waitingForTurnEnd || waitingForTurnStart) {
			let seenTurnEnd = false
			let seenTurnStart = false

			timeoutId = setTimeout(() => {
				if (!executing) {
					console.warn("handleGmMoveQuery timed out")
					cleanup()
					reject(new Error("Timeout"))
				}
			}, 2000)

			hookId = Hooks.on("updateCombatant", (_: any, update: any) => {
				try {
					if (typeof update?.flags?.pf2e?.roundOfLastTurnEnd === "number") {
						/* console.log("got turn end")
						if (!waitingForTurnEnd) console.warn("did not expect turn end!") */
						seenTurnEnd = true
					}
					if (typeof update?.flags?.pf2e?.roundOfLastTurn === "number") {
						/* console.log("got turn start")
						if (!waitingForTurnStart) console.warn("did not expect turn start!") */
						seenTurnStart = true
					}

					if (
						(seenTurnEnd && seenTurnStart) ||
						(!waitingForTurnStart && seenTurnEnd) ||
						(!waitingForTurnEnd && seenTurnStart)
					) {
						// console.log("Executing move")
						executeMove()
					}
				} catch (err) {
					cleanup()
					reject(err)
				}
			})
		}

		combat = await combat.nextTurn()
	}

	const isWaiting = waitingForTurnEnd || waitingForTurnStart

	if (!data.advanceTurn || !isWaiting) {
		// console.log("Executing move immediately!")
		executeMove()
	}

	return promise
}
