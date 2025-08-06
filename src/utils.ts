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

export function translate(key: string, data?: Record<string, string | number>) {
	if (!key.startsWith("pf2e-fc.")) key = `pf2e-fc.${key}`
	return data ? game.i18n.format(key, data) : game.i18n.localize(key)
}

type MissingOpts = {
	prefix?: string
	data?: Record<string, string | number>
	case?: "title"
}
export function translateHandleMissing(key: string, opts: MissingOpts) {
	const fullKey = opts.prefix ? `${opts.prefix}${key}` : key
	const translation = opts.data ? game.i18n.format(fullKey, opts.data) : game.i18n.localize(fullKey)
	if (fullKey !== translation) return translation

	if (opts.case === "title")
		return key.replace(/\w\S*/g, (t) => {
			return t.charAt(0).toUpperCase() + t.substring(1).toLowerCase()
		})
	return key
}
