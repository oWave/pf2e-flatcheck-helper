import type { ActorPF2e, TokenDocumentPF2e, TokenPF2e } from "foundry-pf2e"
import * as R from "remeda"
import { OriginToTargetCondition, type TargetConditionSlug, TargetConditionToDC } from "./constants"
import { tokenLightLevel } from "./light/token"
import { LightLevels } from "./light/utils"
import { flatMessageConfig } from "./message-config"
import type { Adjustments, TreatAsAdjustment } from "./rules/common"

const originPriorities = {
	invisible: 0,
	blinded: 1,
	darkness: 2,
	hidden: 3,
	"dim-light": 4,
	dazzled: 5,
	concealed: 6,
} as const

export interface TargetFlatCheckSource {
	source: TargetConditionSlug
	origin?: string
}

export interface BaseTargetFlatCheck extends TargetFlatCheckSource {
	conditionAdjustment?: TreatAsAdjustment
	baseDc: number
}

function keepHigherSource(...sources: (TargetFlatCheckSource | null | undefined)[]) {
	return R.firstBy(sources, (s) => {
		if (s?.origin == null) return Infinity
		const p = originPriorities[s.origin] ?? -1
		return p
	})
}

function flatCheckDataFromOrigin(origin: ActorPF2e): TargetFlatCheckSource | null {
	for (const slug of ["blinded", "dazzled"] as const) {
		if (origin.conditions.bySlug(slug).length)
			return { source: OriginToTargetCondition[slug], origin: slug }
	}
	return null
}

export function flatCheckDataForTarget(target: ActorPF2e): TargetFlatCheckSource | null {
	// Todo: Invisibility
	for (const slug of ["hidden", "concealed"] as const) {
		if (target.conditions.bySlug(slug).length) return { source: slug }
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

		if (condition === "observed" || condition == null) return null

		// visioner also return undetected (and who knows what else)
		// Make sure to only return concealed/hidden or everything explodes
		let safeCondition: "hidden" | "concealed" | null = null
		if (condition === "concealed" || condition === "hidden") safeCondition = condition
		else safeCondition = "hidden"

		if (safeCondition) {
			return { source: safeCondition }
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

	if (source) return { ...source, baseDc: TargetConditionToDC[source.source] }

	return null
}

export function conditionFromLightLevel(
	origin: ActorPF2e | null,
	token: TokenPF2e,
): TargetFlatCheckSource | null {
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
			origin: "darkness",
			source: "hidden",
		}
	if (lightLevel === LightLevels.DIM && !hasLowLightVision)
		return {
			origin: "dim-light",
			source: "concealed",
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

export class TargetFlatCheckHelper {
	constructor(
		private origin: TokenDocumentPF2e | null | undefined,
		private target: TokenDocumentPF2e,
		private adjustments: Adjustments,
		private rollOptions: string[],
	) {}

	#collectOriginSources() {
		const sources: TargetFlatCheckSource[] = []
		for (const slug of ["blinded", "dazzled"] as const) {
			if (this.origin?.actor?.conditions.bySlug(slug).length)
				sources.push({ source: OriginToTargetCondition[slug], origin: slug })
		}

		return sources
	}

	#collectTargetSources() {
		const sources: TargetFlatCheckSource[] = []
		for (const slug of ["hidden", "concealed"] as const) {
			if (this.target.actor?.conditions.bySlug(slug).length) sources.push({ source: slug })
		}

		if (this.target.actor?.conditions.bySlug("invisible").length) {
			sources.push({ source: "hidden", origin: "invisible" })
		}

		return sources
	}

	#collectMergedSources() {
		const sources: TargetFlatCheckSource[] = []

		if (this.origin && this.target) {
			const visioneerCheck = visioneerFlatCheck(this.origin, this.target)
			if (visioneerCheck) sources.push(visioneerCheck)
		}

		if (this.target.object) {
			const lightCheck = conditionFromLightLevel(this.origin?.actor ?? null, this.target.object)
			if (lightCheck) sources.push(lightCheck)
		}

		return sources
	}

	collectedSources() {
		const merged = [
			this.#collectOriginSources(),
			this.#collectTargetSources(),
			this.#collectMergedSources(),
		].flat()

		const sources: BaseTargetFlatCheck[] = []

		for (const source of merged) {
			const check: BaseTargetFlatCheck = {
				...source,
				baseDc: TargetConditionToDC[source.source],
			}
			const adjustments = this.adjustments.getTreatAsAdjustment(check, this.rollOptions)
			if (adjustments) {
				if (adjustments.new === "observed") continue
				check.source = adjustments.new
				check.conditionAdjustment = adjustments
				check.baseDc = TargetConditionToDC[check.source]
			}
			sources.push(check)
		}

		const observedAdjustment = this.adjustments.getTreatAsAdjustment(
			{ source: "observed" },
			this.rollOptions,
		)
		if (observedAdjustment) {
			sources.push({
				source: observedAdjustment.new,
				origin: observedAdjustment.label,
				baseDc: TargetConditionToDC[observedAdjustment.new],
				conditionAdjustment: observedAdjustment,
			})
		}

		return sources
	}
}
