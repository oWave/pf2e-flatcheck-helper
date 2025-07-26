import type { ActorPF2e, CreaturePF2e, ScenePF2e, TokenDocumentPF2e, TokenPF2e } from "foundry-pf2e"
import { tokenLightLevel } from "./light/token"
import { LightLevels } from "./light/utils"
import { flatMessageConfig } from "./message-config"
import { translate } from "src/utils"

const originConditionDCs = {
	dazzled: 5,
	blinded: 11,
}
type OriginConditionSlug = keyof typeof originConditionDCs

const originToTargetCondition = Object.freeze({
	dazzled: "concealed",
	blinded: "hidden",
})

export const targetConditionDCs = {
	concealed: 5,
	hidden: 11,
	invisible: 11,
	undetected: 11,
	unnoticed: 11,
}
type TargetConditionSlug = keyof typeof targetConditionDCs

export function flatCheckForUserTargets(origin: CreaturePF2e) {
	if (game.user.targets.size > 1) {
		const count = game.user.targets.reduce(
			(acc, t) => (calculateFlatCheck(origin, t) !== null ? acc + 1 : acc),
			0,
		)
		if (count) return { count }
	} else if (game.user.targets.size === 1) {
		const target = game.user.targets.first()
		if (target) {
			const targetDC = calculateFlatCheck(origin, target)
			if (targetDC) {
				return targetDC
			}
		}
	}
}

function flatCheckDataForOrigin(origin: CreaturePF2e): ConditionData | null {
	let originCondition = null as OriginConditionSlug | null
	origin.conditions.stored.forEach((c) => {
		const slug = c.system.slug
		if (
			slug in originConditionDCs &&
			(!originCondition || originConditionDCs[originCondition] < originConditionDCs[slug])
		) {
			originCondition = slug as OriginConditionSlug
		}
	})

	return originCondition
		? {
				slug: originToTargetCondition[originCondition],
				dc: originConditionDCs[originCondition],
				description: translate(`flat.target.condition.${originCondition}`),
			}
		: null
}

export function flatCheckDataForTarget(target: TokenPF2e): ConditionData | null {
	let targetCondition = null as TargetConditionSlug | null
	target.actor?.conditions?.stored.forEach((c) => {
		const slug = c.system.slug
		if (
			slug in targetConditionDCs &&
			(!targetCondition || targetConditionDCs[targetCondition] < targetConditionDCs[slug])
		)
			targetCondition = slug as TargetConditionSlug
	})

	return targetCondition ? { slug: targetCondition, dc: targetConditionDCs[targetCondition] } : null
}

interface ConditionData {
	slug: OriginConditionSlug | TargetConditionSlug
	dc: number
	description?: string
}

interface DisplayData {
	label: string
	dc: number
	description?: string
}

export function conditionToDisplayData(condition: ConditionData): DisplayData {
	return {
		label: translate(`flat.target.condition.${condition.slug}`),
		dc: condition.dc,
		description: condition.description,
	}
}

export function calculateFlatCheck(
	origin: CreaturePF2e | null,
	target: TokenPF2e,
): DisplayData | null {
	const perceptionActive = game.modules.get("pf2e-perception")?.active
	// Flat check with no origin is not supported by pf2e-perception
	if (!origin && perceptionActive) return null
	if (origin && perceptionActive) {
		const perceptionApi = (game.modules.get("pf2e-perception") as any).api
		const originToken = canvas.tokens.placeables.find((t) => t.actor?.uuid === origin.uuid)
		const condition = perceptionApi.token.getVisibility(target, originToken, {
			affects: "target",
		}) as TargetConditionSlug
		const dc = perceptionApi.check.getFlatCheckDc(originToken, target) as number

		if (dc === 0) return null
		return { label: translate(`flat.target.condition.${condition}`), dc }
	}

	const originCondition = origin ? flatCheckDataForOrigin(origin) : null
	let targetCondition = flatCheckDataForTarget(target)

	if (flatMessageConfig.toSets().experimental.has("light-level")) {
		const lightLevelCondition = conditionFromLightLevel(origin, target)
		if (lightLevelCondition && (!targetCondition || targetCondition.dc < lightLevelCondition.dc)) {
			targetCondition = {
				slug: lightLevelCondition.slug,
				dc: lightLevelCondition.dc,
				description: lightLevelCondition.description,
			}
		}
	}

	if (
		(targetCondition && !originCondition) ||
		(targetCondition && originCondition && originCondition.dc < targetCondition.dc)
	) {
		return conditionToDisplayData(targetCondition)
	} else if (originCondition) {
		return conditionToDisplayData(originCondition)
	}
	return null
}

export function conditionFromLightLevel(
	origin: ActorPF2e | null,
	token: TokenPF2e,
): { description: string; slug: TargetConditionSlug; dc: number } | null {
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
			description: translate("flat.target.darkness"),
			slug: "hidden",
			dc: targetConditionDCs.hidden,
		}
	if (lightLevel === LightLevels.DIM && !hasLowLightVision)
		return {
			description: translate("flat.target.dim-light"),
			slug: "concealed",
			dc: targetConditionDCs.concealed,
		}
	return null
}

export function guessOrigin(): CreaturePF2e | null {
	if (canvas.tokens.controlled.length === 1) {
		const token = canvas.tokens.controlled[0]
		return token.actor?.isOfType("creature") ? token.actor : null
	} else if (canvas.tokens.controlled.length > 1) {
		return null
	}
	if (game.user.isGM) return null

	let actor: CreaturePF2e | null = null
	for (const t of canvas.tokens.placeables) {
		if (!t.actor?.isOwner || !t.actor?.isOfType("creature")) continue
		if (actor) return null
		actor = t.actor
	}
	return actor
}
