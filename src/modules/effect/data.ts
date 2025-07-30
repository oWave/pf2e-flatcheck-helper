import type { ActorPF2e, ItemPF2e } from "foundry-pf2e"
import type { CompendiumIndexData } from "foundry-pf2e/foundry/client/documents/collections/compendium-collection.mjs"
import { MODULE_ID } from "src/constants"

/** Minimum types for fromUuidSync */
export type EffectIndex = Pick<CompendiumIndexData, "_id" | "uuid" | "name" | "type" | "img">

export interface BaseEffectData {
	type: "selected" | "targets"
	promptForDuration: boolean
}

export interface EmanationEffectData extends Omit<BaseEffectData, "type"> {
	type: "emanation"
	emanation: {
		affects: {
			allies: boolean
			excludeSelf: boolean
			enemies: boolean
		}
		range: number
	}
}

export type EffectData = BaseEffectData | EmanationEffectData

export interface ApplyDialogData {
	config: EffectData
	effect: EffectIndex
	value: number | null
	item: ItemPF2e<ActorPF2e>
}

function defaultDataForItem(item: ItemPF2e): EffectData {
	if (item.isOfType("spell") && item.system.area?.type === "emanation" && item.system.area.value) {
		return {
			type: "emanation",
			emanation: {
				affects: {
					allies: false,
					excludeSelf: false,
					enemies: false,
				},
				range: item.system.area.value,
			},
			promptForDuration: false,
		}
	}

	return {
		type: "selected",
		promptForDuration: false,
	}
}

export function dataFromItem(parent: ItemPF2e, effect: EffectIndex) {
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
			effect,
			value: effectValue,
			config: dataFromItem(item, effect),
		}
	}

	return null
}
