import type { TokenDocumentPF2e } from "foundry-pf2e"
import type { EffectData, EmanationApplyConfig } from "./data"

export function collectTokens(data: EffectData, origin: TokenDocumentPF2e) {
	if (data.type === "selected") return getSelectedTokens()
	if (data.type === "targets") return getTargetedTokens()
	if (data.type === "emanation") return getTokensInEmanation(origin, data)
}

export function getSelectedTokens() {
	return canvas.tokens.controlled.map((t) => t.document)
}

export function getTargetedTokens() {
	return Array.from(game.user.targets).map((t) => t.document)
}

export function getTokensInEmanation(origin: TokenDocumentPF2e, data: EmanationApplyConfig) {
	const tokens: TokenDocumentPF2e[] = []

	if (!origin.actor) return tokens

	for (const t of origin.scene!.tokens) {
		if (
			t.object &&
			t.actor?.alliance &&
			((data.emanation.affects.allies &&
				(t.actor.isAllyOf(origin.actor) ||
					(!data.emanation.affects.excludeSelf && t === origin))) ||
				(data.emanation.affects.enemies && t.actor.isEnemyOf(origin.actor))) &&
			origin.object &&
			t.object &&
			origin.object.distanceTo(t.object) <= data.emanation.range
		)
			tokens.push(t)
	}
	return tokens
}
