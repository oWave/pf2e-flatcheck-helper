import type { Action } from "svelte/action"

export const tooltip: Action<HTMLElement, { text: string }> = (node, { text }) => {
	if (!text) return
	let div: HTMLDivElement | null = null

	function mouseEnter(event: MouseEvent) {
		div = document.createElement("div")
		div.textContent = text

		const style: Partial<CSSStyleDeclaration> = {
			position: "fixed",
			padding: "4px 8px",
			borderRadius: "4px",
			backgroundColor: "hsl(0, 0%, 10%)",
			color: "hsl(0, 0%, 90%)",
			opacity: "0",
			transition: "opacity 0.5s",
			whiteSpace: "pre-wrap",
			zIndex: "9999",
		}

		Object.assign(div.style, style)

		const bounds = node.getBoundingClientRect()
		div.style.top = `${bounds.bottom}px`
		div.style.left = `${bounds.right}px`
		document.body.appendChild(div)

		setTimeout(() => {
			if (div) div.style.opacity = "1"
		}, 50)
	}
	function mouseLeave() {
		if (div) document.body.removeChild(div)
		div = null
	}

	node.addEventListener("mouseenter", mouseEnter)
	node.addEventListener("mouseleave", mouseLeave)

	return {
		destroy() {
			if (div) document.body.removeChild(div)
			node.removeEventListener("mouseenter", mouseEnter)
			node.removeEventListener("mouseleave", mouseLeave)
		},
	}
}
