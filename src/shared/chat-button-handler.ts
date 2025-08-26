import type { ChatMessagePF2e } from "foundry-pf2e"

export type ChatActionCallback = (
	msg: ChatMessagePF2e,
	html: HTMLElement,
	target: HTMLElement,
) => any
const callbacks = new Map<string, ChatActionCallback>()

const clickHandler = (e: PointerEvent) => {
	const target = e.target
	const action = target instanceof HTMLElement && target.dataset.action
	if (!action) return
	const callback = callbacks.get(action)
	if (!callback) return

	const msgElement = target.closest<HTMLElement>("li.chat-message[data-message-id]")
	const msgDocument =
		msgElement?.dataset.messageId && game.messages.get(msgElement.dataset.messageId)
	if (!msgDocument) return

	e.preventDefault()
	e.stopImmediatePropagation()
	callback(msgDocument, msgElement, target)
}

export const ChatActionHandler = {
	init() {
		for (const selector of ["#ui-right #chat-notifications", "#sidebar-content #chat"]) {
			document.body.querySelector<HTMLElement>(selector)?.addEventListener("click", clickHandler)
		}
	},
	register(id: string, callback: ChatActionCallback) {
		callbacks.set(id, callback)
	},
	unregister(id: string) {
		callbacks.delete(id)
	},
}
