import type {
	ActorPF2e,
	ConditionPF2e,
	EffectPF2e,
	ItemPF2e,
	TokenDocumentPF2e,
} from "foundry-pf2e"
import { QUERIES } from "src/constants"
import type { ApplyInputs } from "./apps"
import { type Duration, dataFromItem } from "./data"

export interface RequestApplyData {
	user: string
	item: string
	effect: string
	tokens: string[]
	badge?: number
	overrides?: {
		duration: Duration
	}
}

export function sendApplyRequest(data: RequestApplyData) {
	return game.users.activeGM?.query(QUERIES.effect.request, data) as Promise<string | true>
}

export async function handleApplyRequest(data: RequestApplyData) {
	const [item, effect, tokens] = await Promise.all([
		fromUuid<ItemPF2e>(data.item),
		fromUuid<EffectPF2e | ConditionPF2e>(data.effect),
		Promise.all(data.tokens.map((id) => fromUuid<TokenDocumentPF2e>(id))),
	])

	const hasParent = (item: ItemPF2e): item is ItemPF2e<ActorPF2e> => item.parent instanceof Actor

	if (item == null) return "Error: parent item is null"
	if (!hasParent(item)) return "Error: parent item has no actor"
	if (effect == null) return "Error: effect is null"
	const id = effect._id
	if (id == null) return "Error: effect has no id"
	const safeTokens = tokens.filter((t) => t != null)
	if (!safeTokens.length) return "Error: no tokens"
	const user = game.users.get(data.user)
	if (!user) return "Error: invalid origin user id"

	const inputs: ApplyInputs = {
		config: dataFromItem(item, { _id: id }),
		effect,
		value: data.badge ?? null,
		item,
		tokens: safeTokens,
		request: {
			user,
			duration: data.overrides?.duration,
		},
	}

	const { ApplyEffectApp } = await import("./apps/index")
	await ApplyEffectApp.wait(inputs)

	return true
}
