import type { EncounterPF2e, RolledCombatant } from "foundry-pf2e"
import { QUERIES } from "src/constants"
import { translate } from "src/utils"
import { setInitiativeFromDrop } from "./utils"

interface GmMoveQueryData {
	combatantUuid: string
	afterId: string
	advanceTurn: boolean
}

export async function sendGmMoveQuery(data: GmMoveQueryData) {
	if (game.user.isGM) {
		await handleGmMoveQuery(data)
	} else {
		if (!game.users.activeGM) return ui.notifications.error(translate("delay.errors.no-active-gm"))
		await game.users.activeGM?.query(QUERIES.delay.gmMoveAfter, data)
	}
}

export async function handleGmMoveQuery(data: GmMoveQueryData) {
	const combatant = fromUuidSync(data.combatantUuid) as RolledCombatant<EncounterPF2e>
	let combat = combatant?.parent
	const after = combat?.combatants.get(data.afterId)

	if (!combat || typeof combatant?.initiative !== "number" || typeof after?.initiative !== "number")
		return

	let forceTurn: number | null = null
	if (data.advanceTurn && combat.turn !== null && combat.combatant === combatant) {
		forceTurn = combat.turn
		combat = await combat.nextTurn()
	}

	const newOrder = combat.turns.filter(
		(c): c is RolledCombatant<EncounterPF2e> => typeof c.initiative === "number" && c !== combatant,
	)
	const afterIndex = newOrder.findIndex((c) => c.id === data.afterId)
	newOrder.splice(afterIndex + 1, 0, combatant)

	const updates = setInitiativeFromDrop(combat, newOrder, combatant)

	const hookId = Hooks.on("updateCombatant", (_combatant, data, operation) => {
		if (data?.flags?.pf2e?.roundOfLastTurn !== undefined && operation.combatTurn !== forceTurn) {
			combat.update({ turn: forceTurn })
			Hooks.off("updateCombatant", hookId)
		}
	})
	setTimeout(() => {
		Hooks.off("updateCombatant", hookId)
	}, 5000)

	await combat.updateEmbeddedDocuments("Combatant", updates)
	// if (forceTurn != null) await combat.update({ turn: forceTurn })
}
