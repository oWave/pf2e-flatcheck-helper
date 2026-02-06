import type {
	ActorPF2e,
	ConditionPF2e,
	DurationData,
	EffectPF2e,
	ItemPF2e,
	TokenDocumentPF2e,
	TokenPF2e,
} from "foundry-pf2e"
import type { Duration, EffectData, EmanationApplyConfig } from "./data"

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

export async function apply(data: {
	tokens: TokenDocumentPF2e[]
	parent: ItemPF2e<ActorPF2e>
	effect: ConditionPF2e | EffectPF2e
	duration?: Duration
}) {
	const createData = data.effect.toObject()

	if (createData.type === "effect") {
		createData.system.context = {
			origin: {
				actor: data.parent.actor.uuid,
				item: data.parent.uuid,
				token: null,
				rollOptions: [],
				spellcasting: null,
			},
			target: null,
			roll: null,
		}

		if (data.duration) Object.assign(createData.system.duration, { ...data.duration })
	}

	await Promise.all(
		data.tokens.map((token) => {
			return token.actor?.createEmbeddedDocuments("Item", [createData])
		}),
	)
}
