import type { ChatMessagePF2e, TokenDocumentPF2e } from "foundry-pf2e"
import type { FlatCheckSource } from "../data"

function forCheck(source: Partial<FlatCheckSource>) {
	const options: string[] = []
	if (source.source) options.push(`fc:source:${source.source}`)
	if (source.baseDc != null) options.push(`fc:base-dc:${source.baseDc}`)
	if (source.origin) options.push(`fc:origin:${game.pf2e.system.sluggify(source.origin)}`)

	return options
}

function forRollMessage(msg: ChatMessagePF2e) {
	const options: string[] = []
	if (
		msg.flags.pf2e.context &&
		"contextualOptions" in msg.flags.pf2e.context &&
		msg.flags.pf2e.context.contextualOptions?.postRoll?.length
	) {
		options.push(...msg.flags.pf2e.context.contextualOptions.postRoll)
	}
	if (
		msg.flags.pf2e.context &&
		"options" in msg.flags.pf2e.context &&
		msg.flags.pf2e.context.options?.length
	) {
		options.push(...msg.flags.pf2e.context.options)
	}

	return options
}

function forMixed(data: {
	msg?: ChatMessagePF2e
	origin?: TokenDocumentPF2e
	target?: TokenDocumentPF2e
}) {
	const options: string[] = []
	if (data.msg?.item) options.push(...data.msg.item.getRollOptions("item"))
	if (data.origin?.actor) options.push(...data.origin.actor.getRollOptions())
	if (data.target?.actor) options.push(...data.target.actor.getSelfRollOptions("target"))

	if (data.origin?.object && data.target?.object) {
		const distance = data.origin.object.distanceTo(data.target.object)
		if (Number.isInteger(distance)) options.push(`target:distance:${distance}`)
		options.push("target")
	}

	return options
}

export const flatCheckRollOptions = {
	forCheck,
	forRollMessage,
	forMixed,
}
