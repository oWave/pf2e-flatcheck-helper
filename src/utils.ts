import type { ActorPF2e, CombatantPF2e } from "foundry-pf2e"

export function isJQuery(obj: unknown): obj is JQuery {
	return obj instanceof jQuery
}

export function actorEffectBySlug(actor: ActorPF2e, slug: string) {
	return actor.itemTypes.effect.find((e) => e.slug === slug)
}

export function actorHasEffect(actor: ActorPF2e, slug: string) {
	return actor.itemTypes.effect.some((e) => e.slug === slug)
}

export function combatantIsNext(c: CombatantPF2e) {
	// @ts-expect-error missing type def
	return c.parent?.nextCombatant.tokenId === c.tokenId
}

export function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

export function parseHTML(string: string) {
	const template = document.createElement("template")
	template.innerHTML = string
	return template.content
}

export function translate(string: string, data?: { [key: string]: string | number }) {
	return data ? game.i18n.format(`pf2e-fc.${string}`, data) : game.i18n.localize(`pf2e-fc.${string}`);
}
