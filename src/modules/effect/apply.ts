import type { TokenPF2e } from "foundry-pf2e"
import type { EffectData, EmanationEffectData } from "./data"

export function collectTokens(data: EffectData, origin: TokenPF2e) {
	if (data.type === "selected") return getSelectedTokens()
	if (data.type === "targets") return getTargetedTokens()
	if (data.type === "emanation") return getTokensInEmanation(origin, data)
}

export function getSelectedTokens() {
	return canvas.tokens.controlled
}

export function getTargetedTokens() {
	return Array.from(game.user.targets)
}

export function getTokensInEmanation(origin: TokenPF2e, data: EmanationEffectData) {
	const tokens: TokenPF2e[] = []

	if (!origin.actor) return tokens

	for (const t of origin.scene!.tokens) {
		if (
			t.object &&
			t.actor?.alliance &&
			((data.emanation.affects.allies && t.actor.isAllyOf(origin.actor)) ||
				(data.emanation.affects.enemies && t.actor.isEnemyOf(origin.actor)) ||
				(!data.emanation.affects.excludeSelf && t.object === origin)) &&
			origin.distanceTo(t.object) <= data.emanation.range
		)
			tokens.push(t.object)
	}
	return tokens
}
