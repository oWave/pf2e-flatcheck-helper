export function isJQuery(obj: unknown): obj is JQuery {
  return obj instanceof jQuery
}

export function actorEffectBySlug(actor: any, slug: string) {
  return actor.itemTypes.effect.find((e) => e.slug === slug)
}

export function actorHasEffect(actor: any, slug: string) {
  return actor.itemTypes.effect.some((e) => e.slug === slug)
}
