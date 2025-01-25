import type { ActorPF2e, EncounterPF2e, RolledCombatant } from "foundry-pf2e"

export function isDelaying(actor: ActorPF2e) {
	return actor.items.some((e) => e.slug === "x-delay")
}

// https://github.com/foundryvtt/pf2e/blob/8ea3864e0394e944e6ccf5b65a8e31489c68505e/src/module/apps/sidebar/encounter-tracker.ts#L318
export function setInitiativeFromDrop(
	combat: EncounterPF2e,
	newOrder: RolledCombatant<NonNullable<EncounterPF2e>>[],
	dropped: RolledCombatant<NonNullable<EncounterPF2e>>,
): void {
	const aboveDropped = newOrder.find((c) => newOrder.indexOf(c) === newOrder.indexOf(dropped) - 1)
	const belowDropped = newOrder.find((c) => newOrder.indexOf(c) === newOrder.indexOf(dropped) + 1)

	const hasAboveAndBelow = !!aboveDropped && !!belowDropped
	const hasAboveAndNoBelow = !!aboveDropped && !belowDropped
	const hasBelowAndNoAbove = !aboveDropped && !!belowDropped
	const aboveIsHigherThanBelow =
		hasAboveAndBelow && belowDropped.initiative < aboveDropped.initiative
	const belowIsHigherThanAbove =
		hasAboveAndBelow && belowDropped.initiative < aboveDropped.initiative
	const wasDraggedUp =
		!!belowDropped && combat.getCombatantWithHigherInit(dropped, belowDropped) === belowDropped
	const wasDraggedDown = !!aboveDropped && !wasDraggedUp

	// Set a new initiative intuitively, according to allegedly commonplace intuitions
	dropped.initiative =
		hasBelowAndNoAbove || (aboveIsHigherThanBelow && wasDraggedUp)
			? belowDropped.initiative + 1
			: hasAboveAndNoBelow || (belowIsHigherThanAbove && wasDraggedDown)
				? aboveDropped.initiative - 1
				: hasAboveAndBelow
					? belowDropped.initiative
					: dropped.initiative

	const withSameInitiative = newOrder.filter((c) => c.initiative === dropped.initiative)
	if (withSameInitiative.length > 1) {
		for (let priority = 0; priority < withSameInitiative.length; priority++) {
			withSameInitiative[priority].flags.pf2e.overridePriority[dropped.initiative] = priority
		}
	}
}
