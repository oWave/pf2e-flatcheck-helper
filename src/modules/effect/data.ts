import type { CompendiumIndexData } from "@7h3laughingman/foundry-types/client/documents/collections/_module.mjs"
import type { ActorPF2e, EffectSystemData, ItemPF2e } from "@7h3laughingman/pf2e-types"
import { MODULE_ID } from "src/constants"
import type Effect from "src/guide/content/effect.svelte"
import { HTMLUtils } from "./html"

/** Minimum types for fromUuidSync */
export type EffectIndex = Pick<CompendiumIndexData, "_id" | "name" | "type" | "img"> & {
	uuid: string
}

export type Duration = Pick<EffectSystemData["duration"], "value" | "unit">

export type EffectData = {
	autoApply: {
		type: "selected" | "targets" | "emanation" | null
	}
	emanation: {
		affects: {
			allies: boolean
			includeSelf: boolean
			enemies: boolean
		}
		radius: number
	}
	promptForDuration?: boolean
}

export interface ApplyDialogData {
	config: EffectData
	effectIndex: EffectIndex
	value: number | null
	item: ItemPF2e<ActorPF2e>
}

export function defaultDataForItem(item: ItemPF2e): EffectData {
	let radius = 5

	if (item.isOfType("spell") && item.system.area?.type === "emanation" && item.system.area.value) {
		radius = item.system.area.value
	}

	return {
		autoApply: {
			type: null,
		},
		emanation: {
			affects: {
				allies: false,
				includeSelf: false,
				enemies: false,
			},
			radius,
		},
		promptForDuration: false,
	}
}

export function dataFromItem(parent: ItemPF2e, effect: Pick<EffectIndex, "_id">) {
	const data = parent.getFlag(MODULE_ID, `effects.${effect._id}`) as EffectData
	return data ?? defaultDataForItem(parent)
}

export function dataFromElement(containerElement: HTMLElement): ApplyDialogData | null {
	const effectUuid =
		containerElement?.firstElementChild instanceof HTMLAnchorElement &&
		containerElement.firstElementChild.dataset.uuid
	const effect = effectUuid && (fromUuidSync(effectUuid) as EffectIndex)
	if (!effect) return null

	let effectValue: number | null = null
	{
		const text = containerElement.firstElementChild.innerText.trim()
		const match = /(\d+)$/.exec(text)
		effectValue = match ? Number(match[1]) : null
	}

	const msgElement = containerElement.closest<HTMLElement>(".chat-message[data-message-id]")
	const msg = msgElement?.dataset.messageId && game.messages.get(msgElement.dataset.messageId)
	if (!msg) return null
	const item = msg.item

	if (item) {
		return {
			item,
			effectIndex: effect,
			value: effectValue,
			config: dataFromItem(item, effect),
		}
	}

	return null
}

export async function saveConfigToItem(parent: ItemPF2e, effect: EffectIndex, data: EffectData) {
	await parent.setFlag(MODULE_ID, `effects.${effect._id}`, data)
	HTMLUtils.refreshButtons(effect)
}

export async function clearConfigOnItem(parent: ItemPF2e, effect: EffectIndex) {
	await parent.setFlag(MODULE_ID, `effects.${effect._id}`, null)
	HTMLUtils.removeButtons(effect)
}
