import type { Action } from "svelte/action"

export const indeterminate: Action<HTMLInputElement, { state?: boolean }> = (
	node: HTMLInputElement,
	data,
) => {
	if (data.state) node.indeterminate = true
}
