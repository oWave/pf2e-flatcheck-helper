import type { TokenDocumentPF2e, TokenPF2e } from "@7h3laughingman/pf2e-types"
import type { Action } from "svelte/action"

type Params = { token: TokenPF2e | TokenDocumentPF2e }

export const tokenHover: Action<HTMLElement, Params> = (node, params) => {
	let lastEvent: MouseEvent | null = null

	function object(): TokenPF2e | null {
		const token = params.token
		return "object" in token ? token.object : token
	}

	function mouseEnter(event: MouseEvent) {
		lastEvent = event
		object()?.emitHoverIn(event)
	}

	function mouseLeave(event: MouseEvent) {
		object()?.emitHoverOut(event)
		lastEvent = null
	}

	node.addEventListener("mouseenter", mouseEnter)
	node.addEventListener("mouseleave", mouseLeave)

	return {
		destroy() {
			if (lastEvent) object()?.emitHoverOut(lastEvent)
			node.removeEventListener("mouseenter", mouseEnter)
			node.removeEventListener("mouseleave", mouseLeave)
		},
	}
}
