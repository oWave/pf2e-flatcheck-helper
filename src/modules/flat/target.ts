import type { ActorPF2e, TokenDocumentPF2e, TokenPF2e } from "foundry-pf2e"
import * as R from "remeda"
import { OriginToTargetCondition, type TargetConditionSlug, TargetConditionToDC } from "./constants"
import type { FlatCheckSource } from "./data"
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

export interface TargetFlatCheckSource extends Omit<FlatCheckSource, "baseDc"> {
	type: TargetConditionSlug
}

export interface BaseTargetFlatCheck extends TargetFlatCheckSource {
	conditionAdjustment?: TreatAsAdjustment
	baseDc: FlatCheckSource["baseDc"]
}

function keepHigherSource(...sources: (TargetFlatCheckSource | null | undefined)[]) {
	return R.firstBy(sources, (s) => {
		if (s?.origin?.slug == null) return Infinity
		const p = originPriorities[s.origin.slug] ?? -1
		return p
	})
}

function flatCheckDataFromOrigin(origin: ActorPF2e): TargetFlatCheckSource | null {
	for (const slug of ["blinded", "dazzled"] as const) {
		if (origin.conditions.bySlug(slug).length)
			return { type: OriginToTargetCondition[slug], origin: { slug } }
	}
	return null
}

export function flatCheckDataForTarget(target: ActorPF2e): TargetFlatCheckSource | null {
	for (const slug of ["unnoticed", "undetected", "hidden", "concealed"] as const) {
		if (target.conditions.bySlug(slug).length) return { type: slug }
	}
	return null
}

export function visionerFlatCheck(
	origin: TokenDocumentPF2e,
	target: TokenDocumentPF2e,
): TargetFlatCheckSource | null {
	const visioneerApi:
		| { getVisibility: (observerId: string, targetId: string) => string | null }
		| undefined =
		// @ts-expect-error
		game.modules.get("pf2e-visioner")?.api

	if (visioneerApi) {
		const condition = visioneerApi.getVisibility(origin.id, target.id)

		if (condition == null || condition === "observed" || !(condition in TargetConditionToDC))
			return null

		return { type: condition as TargetConditionSlug }
	}
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
			origin: { slug: "darkness" },
			type: "hidden",
		}
	if (lightLevel === LightLevels.DIM && !hasLowLightVision)
		return {
			origin: { slug: "dim-light" },
			type: "concealed",
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
				sources.push({ type: OriginToTargetCondition[slug], origin: { slug } })
		}

		return sources
	}

	#collectTargetSources() {
		const sources: TargetFlatCheckSource[] = []
		for (const slug of ["unnoticed", "undetected", "hidden", "concealed"] as const) {
			if (this.target.actor?.conditions.bySlug(slug).length) sources.push({ type: slug })
		}

		if (this.target.actor?.conditions.bySlug("invisible").length) {
			sources.push({ type: "hidden", origin: { slug: "invisible" } })
		}

		return sources
	}

	#collectMergedSources() {
		const sources: TargetFlatCheckSource[] = []

		if (this.origin && this.target) {
			const visioneerCheck = visionerFlatCheck(this.origin, this.target)
			if (visioneerCheck) sources.push(visioneerCheck)
		}

		if (this.target.object) {
			const lightCheck = conditionFromLightLevel(this.origin?.actor ?? null, this.target.object)
			if (lightCheck) sources.push(lightCheck)
		}

		return sources
	}

	#collectExtraConditions(): TargetFlatCheckSource[] {
		const adjustment = this.adjustments.getTreatAsAdjustment({ type: "observed" }, this.rollOptions)
		if (adjustment) {
			return [
				{
					type: adjustment.new,
					origin: {
						slug: adjustment.slug,
						label: adjustment.label,
					},
				},
			]
		}
		return []
	}

	collectedSources() {
		const merged = [
			this.#collectOriginSources(),
			this.#collectTargetSources(),
			this.#collectMergedSources(),
			this.#collectExtraConditions(),
		].flat()

		const sources: BaseTargetFlatCheck[] = []

		for (const source of merged) {
			const check: BaseTargetFlatCheck = {
				...source,
				baseDc: TargetConditionToDC[source.type],
			}
			const adjustments = this.adjustments.getTreatAsAdjustment(check, this.rollOptions)
			if (adjustments) {
				if (adjustments.new === "observed") continue
				check.type = adjustments.new
				check.conditionAdjustment = adjustments
				check.baseDc = TargetConditionToDC[check.type]
			}
			sources.push(check)
		}

		return sources
	}
}
