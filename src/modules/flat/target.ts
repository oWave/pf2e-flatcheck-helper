import type { ActorPF2e, TokenDocumentPF2e, TokenPF2e } from "foundry-pf2e"
import * as R from "remeda"
import { tokenLightLevel } from "./light/token"
import { LightLevels } from "./light/utils"
import { flatMessageConfig } from "./message-config"

const originToTargetCondition = Object.freeze({
	dazzled: "concealed",
	blinded: "hidden",
})
// type OriginConditionSlug = keyof typeof originToTargetCondition

export const targetConditionDCs = {
	concealed: 5,
	hidden: 11,
	/* invisible: 11,
	undetected: 11,
	unnoticed: 11, */
}
type TargetConditionSlug = keyof typeof targetConditionDCs

/* export function flatCheckForUserTargets(origin: CreaturePF2e) {
	if (game.user.targets.size > 1) {
		const count = game.user.targets.reduce(
			(acc, t) => (calculateTargetFlatCheck(origin, t.document) !== null ? acc + 1 : acc),
			0,
		)
		if (count) return { count }
	} else if (game.user.targets.size === 1) {
		const target = game.user.targets.first()
		if (target) {
			const targetDC = calculateTargetFlatCheck(origin, target.document)
			if (targetDC) {
				return targetDC
			}
		}
	}
	return null
} */

const sourcePriorities = [
	"blinded",
	"darkness",
	"hidden",
	"dim-light",
	"dazzled",
	"concealed",
] as const

interface FlatCheckSource {
	condition: TargetConditionSlug
	source: (typeof sourcePriorities)[number]
}

function keepHigherSource(...sources: (FlatCheckSource | null | undefined)[]) {
	return R.firstBy(sources, (s) => {
		if (s == null) return Infinity
		const p = sourcePriorities.indexOf(s.source)
		if (p === -1) return Infinity
		return p
	})
}

function flatCheckDataFromOrigin(origin: ActorPF2e): FlatCheckSource | null {
	for (const slug of ["blinded", "dazzled"] as const) {
		if (origin.conditions.bySlug(slug).length)
			return { condition: originToTargetCondition[slug], source: slug }
	}
	return null
}

export function flatCheckDataForTarget(target: ActorPF2e): FlatCheckSource | null {
	// Todo: Invisibility
	for (const slug of ["hidden", "concealed"] as const) {
		if (target.conditions.bySlug(slug).length) return { condition: slug, source: slug }
	}
	return null
}

export function visioneerFlatCheck(origin: TokenDocumentPF2e, target: TokenDocumentPF2e) {
	const visioneerApi:
		| { getVisibility: (observerId: string, targetId: string) => string | null }
		| undefined =
		// @ts-expect-error
		game.modules.get("pf2e-visioner")?.api

	if (visioneerApi) {
		const condition = visioneerApi.getVisibility(origin.id, target.id)

		// visioner also return undetected (and who knows what else)
		// Make sure to only return concealed/hidden or everything explodes
		let safeCondition: "hidden" | "concealed" | null = null
		if (condition === "concealed" || condition === "hidden") safeCondition = condition
		else if (condition != null) safeCondition = "hidden"

		if (safeCondition) {
			return { condition: safeCondition, source: safeCondition }
		}
	}
	return null
}

export function calculateTargetFlatCheck(
	origin: TokenDocumentPF2e | null,
	target: TokenDocumentPF2e,
) {
	const originCondition = origin?.actor ? flatCheckDataFromOrigin(origin.actor) : null
	const targetCondition = target.actor ? flatCheckDataForTarget(target.actor) : null

	let source = keepHigherSource(originCondition, targetCondition)

	if (
		flatMessageConfig.toSets().experimental.has("light-level") &&
		target.object &&
		origin?.actor
	) {
		const lightLevelCondition = conditionFromLightLevel(origin.actor, target.object)
		source = keepHigherSource(source, lightLevelCondition)
	}

	if (origin && target) {
		const check = visioneerFlatCheck(origin, target)
		if (check) source = keepHigherSource(source, check)
	}

	if (source) return { ...source, baseDc: targetConditionDCs[source.condition] }

	return null
}

export function conditionFromLightLevel(
	origin: ActorPF2e | null,
	token: TokenPF2e,
): FlatCheckSource | null {
	let hasDarkvision = false
	let hasLowLightVision = false
	if (origin?.isOfType("creature")) {
		hasDarkvision = origin.hasDarkvision
		if (hasDarkvision) return null

		hasLowLightVision = origin.hasLowLightVision
	}

	const lightLevel = tokenLightLevel(token)
	if (lightLevel === LightLevels.DARK && !hasDarkvision)
		return {
			source: "darkness",
			condition: "hidden",
		}
	if (lightLevel === LightLevels.DIM && !hasLowLightVision)
		return {
			source: "dim-light",
			condition: "concealed",
		}
	return null
}

export function guessOrigin(): TokenDocumentPF2e | null {
	if (canvas.tokens.controlled.length === 1) {
		const token = canvas.tokens.controlled[0]
		return token.actor?.isOfType("creature") ? token.document : null
	} else if (canvas.tokens.controlled.length > 1) {
		return null
	}
	if (game.user.isGM) return null

	// If there is only one token on the scene the user owns, use that one
	let token: TokenDocumentPF2e | null = null
	for (const t of canvas.tokens.placeables) {
		if (!t.actor?.isOwner || !t.actor?.isOfType("creature")) continue
		if (token) return null
		token = t.document
	}
	return token
}
