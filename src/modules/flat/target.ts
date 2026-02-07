import type { ActorPF2e, TokenDocumentPF2e, TokenPF2e } from "foundry-pf2e"
import {
	ActorTypesWithPerception,
	OriginToTargetCondition,
	type TargetConditionSlug,
	TargetConditionToDC,
} from "./constants"
import type { FlatCheckSource } from "./data"
import { tokenLightLevel } from "./light/token"
import { LightLevels } from "./light/utils"
import { flatMessageConfig } from "./message-config"
import type { Adjustments, TreatAsAdjustment } from "./rules/common"
import { visionerAVSFlatCheck, visionerVisibilityFlatCheck } from "./visioner"

export interface TargetFlatCheckSource extends Omit<FlatCheckSource, "baseDc"> {
	type: TargetConditionSlug
	conditionAdjustments?: TreatAsAdjustment[]
}

export interface BaseTargetFlatCheck extends TargetFlatCheckSource {
	baseDc: FlatCheckSource["baseDc"]
}

export function flatCheckDataForTarget(target: ActorPF2e): TargetFlatCheckSource | null {
	for (const slug of ["unnoticed", "undetected", "hidden", "concealed"] as const) {
		if (target.conditions.bySlug(slug).length) return { type: slug }
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
	static useVisionerAVS(): boolean {
		return (
			// @ts-expect-error
			typeof game.modules.get("pf2e-visioner")?.api?.getVisibilityFactors === "function" &&
			(game.settings.get("pf2e-visioner", "autoVisibilityEnabled") as boolean)
		)
	}

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
			const visioneerCheck = visionerVisibilityFlatCheck(this.origin, this.target)
			if (visioneerCheck) sources.push(visioneerCheck)
		}

		if (
			this.origin?.actor &&
			this.target.object &&
			flatMessageConfig.toSets().experimental.has("light-level") &&
			ActorTypesWithPerception.includes(this.origin.actor.type)
		) {
			const lightCheck = conditionFromLightLevel(this.origin?.actor ?? null, this.target.object)
			if (lightCheck) sources.push(lightCheck)
		}

		return sources
	}

	#collectExtraConditions(): TargetFlatCheckSource[] {
		const treatObservedAs = this.adjustments.treatObservedAs(this.rollOptions)
		return treatObservedAs ? [treatObservedAs] : []
	}

	async #collectVisionerAVSSource(): Promise<TargetFlatCheckSource[]> {
		const origin = this.origin
		if (!origin) return []

		const check = await visionerAVSFlatCheck(origin, this.target)
		if (!check) return []
		return [check]
	}

	async collectedSources() {
		if (flatMessageConfig.toSets().ignored.has("target")) return []

		const collectors = TargetFlatCheckHelper.useVisionerAVS()
			? [this.#collectVisionerAVSSource()]
			: [
					this.#collectOriginSources(),
					this.#collectTargetSources(),
					this.#collectMergedSources(),
					this.#collectExtraConditions(),
				]

		const merged = (await Promise.all<TargetFlatCheckSource[]>(collectors)).flat()

		const sources: BaseTargetFlatCheck[] = []

		for (const source of merged) {
			const check: BaseTargetFlatCheck = {
				...source,
				baseDc: TargetConditionToDC[source.type],
			}
			const adjustments = this.adjustments.getTreatAsAdjustments(check, this.rollOptions)
			const last = adjustments?.at(-1)
			if (last?.new === "observed") continue

			if (last) {
				check.type = last.new
				check.conditionAdjustments = [check.conditionAdjustments ?? [], adjustments!].flat()
				check.baseDc = TargetConditionToDC[check.type]
			}

			sources.push(check)
		}

		return sources
	}
}
