import { createSubscriber } from "svelte/reactivity"

function refreshOnHook<T>(hooks: string[], read: () => T) {
	const subscribe = createSubscriber((update) => {
		const pairs = hooks.map((hook) => [hook, Hooks.on(hook, update)] as const)
		return () => {
			for (const [hook, id] of pairs) Hooks.off(hook, id)
		}
	})

	return {
		get current() {
			subscribe()
			return read()
		},
	}
}

export const fvtt = {
	controlled: refreshOnHook(["controlToken", "canvasReady"], () => canvas.tokens?.controlled ?? []),
	targets: refreshOnHook(["targetToken", "canvasReady"], () =>
		Array.from(game.user?.targets ?? []),
	),
}
