import { ActorPF2e } from "types/pf2e/module/documents"

export function isJQuery(obj: unknown): obj is JQuery {
  return obj instanceof jQuery
}

export function actorEffectBySlug(actor: ActorPF2e, slug: string) {
  return actor.itemTypes.effect.find((e) => e.slug === slug)
}

export function actorHasEffect(actor: ActorPF2e, slug: string) {
  return actor.itemTypes.effect.some((e) => e.slug === slug)
}
