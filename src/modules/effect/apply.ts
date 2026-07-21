import type {
	ActorPF2e,
	ConditionPF2e,
	EffectPF2e,
	ItemPF2e,
	TokenDocumentPF2e,
} from "@7h3laughingman/pf2e-types"
import type { Duration, EffectData } from "./data"

export function collectTokens(data: EffectData, origin: TokenDocumentPF2e) {
	if (data.autoApply.type === "selected") return getSelectedTokens()
	if (data.autoApply.type === "targets") return getTargetedTokens()
	if (data.autoApply.type === "emanation") {
		const r = placeEmanationOnToken(origin, data)
		return r ? getTokensInRegion(r, data) : []
	}
	return []
}

export function getSelectedTokens() {
	return canvas.tokens.controlled.map((t) => t.document)
}

export function getTargetedTokens() {
	return Array.from(game.user.targets).map((t) => t.document)
}

export function isTokenVisible(token: TokenDocumentPF2e) {
	if (game.user.isGM) return true
	return token.object?.isVisible ?? false
}

export function getTokensInRegion(region: RegionDocument, data: EffectData) {
	const tokens: TokenDocumentPF2e[] = []

	const origin = region.attachment.token as unknown as TokenDocumentPF2e | null

	if (!origin?.actor) return tokens

	for (const t of origin.scene!.tokens) {
		if (
			t.object &&
			t.actor?.alliance &&
			((data.emanation.affects.allies &&
				(t.actor.isAllyOf(origin.actor) || (data.emanation.affects.includeSelf && t === origin))) ||
				(data.emanation.affects.enemies && t.actor.isEnemyOf(origin.actor))) &&
			origin.object &&
			t.object &&
			origin.object.distanceTo(t.object) <= data.emanation.radius &&
			t.testInsideRegion(region)
		)
			tokens.push(t)
	}
	return tokens
}

export function placeEmanationOnToken(origin: TokenDocumentPF2e, data: EffectData) {
	if (!origin.object || !origin.scene) return null

	const createData = {
		name: "Temp",
		highlightMode: "coverage",
		shapes: [
			{
				type: "emanation",
				base: {
					type: "token",
					x: origin.object.x,
					y: origin.object.y,
					width: origin.width,
					height: origin.width,
					shape: CONST.TOKEN_SHAPES.RECTANGLE_1,
					hole: false,
				},
				radius: data.emanation.radius * canvas.dimensions.distancePixels,
				hole: false,
				gridBased: false,
			},
		],
		levels: [origin.level],
		restriction: {
			enabled: true,
			type: "move",
			priority: 0,
		},
		attachment: {
			token: origin.id,
		},
		displayMeasurements: false,
		hidden: false,
		locked: false,
	}

	const cls = getDocumentClass("Region")
	const document = new cls(createData, { parent: origin.scene })
	// @ts-expect-error
	document.updateShapeConstraints()

	return document
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
