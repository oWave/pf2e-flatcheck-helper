export function localizeType(type: string) {
	const capitalized = type.capitalize()
	for (const key of [`PF2E.ConditionType${capitalized}`, `PF2E.Trait${capitalized}`]) {
		const t = tryTranslate(key)
		if (t) return t
	}

	return titleCase(type)
}

export function localizeOrigin(origin: { slug: string; label?: string }) {
	const t = tryTranslate(`pf2e-fc.flat.source.${origin.slug}`)
	if (t) return t

	return origin.label ?? titleCase(origin.slug)
}

function tryTranslate(key: string) {
	const t = game.i18n.localize(key)
	if (t === key) return null
	return t
}

function titleCase(s: string) {
	return s.replace(/\w\S*/g, (t) => {
		return t.charAt(0).toUpperCase() + t.substring(1).toLowerCase()
	})
}
