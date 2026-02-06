import type { ConditionPF2e, EffectPF2e, ItemPF2e } from "foundry-pf2e"
import MODULE from "src"
import { MODULE_ID } from "src/constants"
import { parseHTML } from "src/utils"
import { collectTokens } from "./apply"
import { dataFromElement, type EffectData, type EffectIndex } from "./data"

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
			contentElement.addEventListener("contextmenu", async (event) => {
				if (!(event.target instanceof HTMLElement)) return

				const containerElement = event.target.closest("span.fc-effect-button")
				if (!containerElement) return

				const contentLink = containerElement.firstElementChild
				if (!(contentLink instanceof HTMLAnchorElement)) return
				const uuid = contentLink.dataset.uuid
				if (!uuid) return

				event.preventDefault()
				event.stopImmediatePropagation()
				const { EffectConfigApp } = await import("./apps/index")
				new EffectConfigApp(item, uuid).render(true)
			})
			contentElement.addEventListener("click", async (event) => {
				if (!(event.target instanceof HTMLElement)) return

				const containerElement = event.target.closest<HTMLElement>("span.fc-effect-button")
				if (!containerElement) return

				const effectButton = event.target.closest(
					"span.fc-effect-button a.content-link:nth-child(2)",
				)
				if (!effectButton) return

				const data = dataFromElement(containerElement)
				if (!data) return

				if (!game.user.isGM && MODULE.settings.quickApplyUserRequest === "disable")
					return ui.notifications.warn("Quick Apply is disabled for players")

				const msgId =
					containerElement.closest<HTMLElement>(".chat-message.message")?.dataset?.messageId
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
			})
		}
	},

	renderButton(parentItem: ItemPF2e, effectItem: EffectIndex, linkElement: HTMLAnchorElement) {
		const data = parentItem.getFlag(MODULE_ID, `effects.${effectItem._id}`) as
			| EffectData
			| undefined
		if (!data) return

		if (!game.user.isGM && MODULE.settings.quickApplyUserRequest === "disable") return

		if (linkElement.nextElementSibling instanceof HTMLAnchorElement) {
			const buttonElement = linkElement.nextElementSibling.firstElementChild
			buttonElement?.setAttribute("class", `fa-solid ${this.icons[data.type]}`)
		} else {
			const button = parseHTML(
				`<a class="content-link"><i class="fa-solid ${this.icons[data.type]}" data-tooltip="Apply Effect" inert></i></a>`,
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

	icons: Object.freeze<Record<EffectData["type"], string>>({
		emanation: "fa-circle-dot",
		selected: "fa-expand",
		targets: "fa-bullseye",
	}),
}
