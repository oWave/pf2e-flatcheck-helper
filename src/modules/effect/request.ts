import type {
	ActorPF2e,
	ConditionPF2e,
	EffectPF2e,
	ItemPF2e,
	TokenDocumentPF2e,
} from "foundry-pf2e"
import MODULE from "src"
import { QUERIES } from "src/constants"
import { apply } from "./apply"
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
	const validTokens = tokens.filter((t) => t != null)
	if (!validTokens.length) return "Error: no tokens"
	const user = game.users.get(data.user)
	if (!user) return "Error: invalid origin user id"

	if (
		MODULE.settings.quickApplyUserRequest === "auto-accept-always" ||
		(MODULE.settings.quickApplyUserRequest === "auto-accept-trusted" &&
			user.role >= CONST.USER_ROLES.TRUSTED)
	) {
		await apply({
			tokens: validTokens,
			parent: item,
			effect: effect,
			duration: data.overrides?.duration,
		})
	} else {
		const inputs: ApplyInputs = {
			config: dataFromItem(item, { _id: id }),
			effect,
			value: data.badge ?? null,
			item,
			tokens: validTokens,
			request: {
				user,
				duration: data.overrides?.duration,
			},
		}

		const { ApplyEffectApp } = await import("./apps/index")
		await ApplyEffectApp.wait(inputs)
	}

	return true
}
