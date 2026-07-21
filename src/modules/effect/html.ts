import type { ConditionPF2e, EffectPF2e, ItemPF2e } from "@7h3laughingman/pf2e-types"
import MODULE from "src"
import { MODULE_ID } from "src/constants"
import { parseHTML } from "src/utils"
import { collectTokens } from "./apply"
import { dataFromElement, type EffectData, type EffectIndex } from "./data"

async function onClick(event: PointerEvent) {
	if (!(event.target instanceof HTMLElement)) return

	const containerElement = event.target.closest<HTMLElement>("span.fc-effect-button")
	if (!containerElement) return

	if (event.type === "click" && !event.target.closest("a.fc-quick-apply-indicator")) {
		return
	}
	if (event.type === "contextmenu" && !event.target.closest("span.fc-effect-button")) {
		return
	}

	event.stopImmediatePropagation()
	event.preventDefault()

	const data = dataFromElement(containerElement)
	if (!data) return

	if (!game.user.isGM && MODULE.settings.quickApplyUserRequest === "disable")
		return ui.notifications.warn("Quick Apply is disabled for players")

	const msgId = containerElement.closest<HTMLElement>(".chat-message.message")?.dataset?.messageId
	const msg = msgId?.length ? game.messages.get(msgId) : null
	const token = msg?.token ?? data.item.actor.getActiveTokens().at(0)?.document

	if (!token) {
		return ui.notifications.error("Actor has no token")
	}

	const effect = await fromUuid<EffectPF2e | ConditionPF2e>(data.effectIndex.uuid)
	if (!effect) {
		return ui.notifications.error("Effect doesn't exist?")
	}

	const tokens = collectTokens(data.config, token) ?? []

	const { ApplyEffectApp } = await import("./apps/index")
	new ApplyEffectApp({
		config: data.config,
		effect,
		value: data.value,
		item: data.item,
		tokens: tokens,
	}).render(true)
}

export const HTMLUtils = {
	wrapLinks(item: ItemPF2e, contentElement: HTMLElement) {
		let containsLinks = false
		for (const linkEl of contentElement.querySelectorAll<HTMLAnchorElement>("a.content-link")) {
			const uuid = linkEl.dataset.uuid
			if (!uuid) continue

			const effectItem = fromUuidSync(uuid) as EffectIndex | null

			if (!(effectItem?.type && ["effect", "condition"].includes(effectItem?.type))) continue

			const span = document.createElement("span")
			span.classList.add("fc-effect-button")
			linkEl.before(span)
			span.appendChild(linkEl)

			this.renderButton(item, effectItem, linkEl)
			containsLinks = true
		}

		if (containsLinks) {
			contentElement.addEventListener("contextmenu", onClick)
			contentElement.addEventListener("click", onClick)
		}
	},

	renderButton(parentItem: ItemPF2e, effectItem: EffectIndex, linkElement: HTMLAnchorElement) {
		const data = parentItem.getFlag(MODULE_ID, `effects.${effectItem._id}`) as
			| EffectData
			| undefined
		if (!data) return
		const icon = data.autoApply.type && this.icons[data.autoApply.type]
		if (!icon) return

		if (!game.user.isGM && MODULE.settings.quickApplyUserRequest === "disable") return

		if (linkElement.nextElementSibling instanceof HTMLAnchorElement) {
			const buttonElement = linkElement.nextElementSibling.firstElementChild
			buttonElement?.setAttribute("class", `fa-solid ${icon}`)
		} else {
			const button = parseHTML(
				`<a class="content-link fc-quick-apply-indicator"><i class="fa-solid ${icon}" data-tooltip="Apply Effect" inert></i></a>`,
			)
			linkElement.after(button)
		}
	},

	refreshButtons(effectItem: EffectIndex) {
		for (const linkElement of document.body.querySelectorAll<HTMLAnchorElement>(
			`span.fc-effect-button > a.content-link[data-uuid="${effectItem.uuid}"]`,
		)) {
			const msgElement = linkElement.closest<HTMLElement>(".chat-message[data-message-id]")
			if (msgElement?.dataset.messageId) {
				const parentItem = game.messages.get(msgElement.dataset.messageId)?.item
				if (parentItem) this.renderButton(parentItem, effectItem, linkElement)
			}
		}
	},

	removeButtons(effectItem: EffectIndex) {
		for (const buttonElement of document.body.querySelectorAll<HTMLAnchorElement>(
			`span.fc-effect-button > a.content-link[data-uuid="${effectItem.uuid}"] + a.content-link`,
		)) {
			buttonElement.remove()
		}
	},

	icons: Object.freeze({
		emanation: "fa-circle-dot",
		selected: "fa-expand",
		targets: "fa-bullseye",
	} as const),
}
