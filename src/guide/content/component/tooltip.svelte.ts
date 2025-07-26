import type { Action } from "svelte/action"

export const tooltip: Action<HTMLElement, { text: string; align?: "center" | "right" }> = (
	node,
	{ text, align = "right" },
) => {
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
			whiteSpace: "nowrap",
			zIndex: "9999",
		}

		Object.assign(div.style, style)
		document.body.appendChild(div)

		const parentBounds = node.getBoundingClientRect()
		let divBounds = div.getBoundingClientRect()
		const viewBounds = document.body.getBoundingClientRect()
		div.style.top = `${parentBounds.bottom}px`
		if (align === "right") {
			div.style.left = `${parentBounds.right}px`
		} else {
			div.style.left = `${parentBounds.left + parentBounds.width / 2 - divBounds.width / 2}px`
		}

		divBounds = div.getBoundingClientRect()

		const padding = 5

		if (divBounds.right > viewBounds.right - padding) {
			const diff = divBounds.right - viewBounds.right + padding
			div.style.left = `${divBounds.left - diff}px`
		} else if (divBounds.left < viewBounds.left + padding) {
			const diff = viewBounds.left - divBounds.left + padding
			div.style.left = `${divBounds.left - diff}px`
		}

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
