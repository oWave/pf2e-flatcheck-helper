export function isJQuery(obj: unknown): obj is JQuery {
  return obj instanceof jQuery
}
