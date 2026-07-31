import type {
	ActorPF2e,
	CombatantPF2e,
	TokenDocumentPF2e,
	TokenPF2e,
} from "@7h3laughingman/pf2e-types"

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

export function canEditDocuments(documents: Pick<TokenDocumentPF2e, "canUserModify">[]) {
	return game.user.isGM || documents.every((t) => t.canUserModify(game.user, "update"))
}

export function displayName(c: CombatantPF2e): string
export function displayName(t: TokenPF2e): string
export function displayName(t: TokenDocumentPF2e): string
export function displayName(input: CombatantPF2e | TokenPF2e | TokenDocumentPF2e): string {
	const name = input.name
	const playersCanSeeName =
		input instanceof Combatant
			? input.playersCanSeeName
			: input instanceof TokenDocument
				? input.playersCanSeeName
				: input.document.playersCanSeeName

	if (!game.user.isGM && game.pf2e.settings.tokens.nameVisibility && !playersCanSeeName) return "?"
	return name
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
	return data ? game.i18n.localize(key, data) : game.i18n.localize(key)
}

type MissingOpts = {
	prefix?: string
	data?: Record<string, string | number>
	case?: "title"
}
export function translateHandleMissing(key: string, opts: MissingOpts) {
	const fullKey = opts.prefix ? `${opts.prefix}${key}` : key
	const translation = opts.data
		? game.i18n.localize(fullKey, opts.data)
		: game.i18n.localize(fullKey)
	if (fullKey !== translation) return translation

	if (opts.case === "title")
		return key.replace(/\w\S*/g, (t) => {
			return t.charAt(0).toUpperCase() + t.substring(1).toLowerCase()
		})
	return key
}

export const SYSTEM = {
	get id() {
		return game.system.id as "pf2e"
	},
	filePath(path: string) {
		return `systems/${this.id}/${path}`
	},
}
