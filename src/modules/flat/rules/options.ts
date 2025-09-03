import type { ChatMessagePF2e, TokenDocumentPF2e, TokenPF2e } from "foundry-pf2e"
import type { FlatCheckSource } from "../data"
import { tokenLightLevel } from "../light/token"
import { LightLevels } from "../light/utils"

function lightLevelForToken(prefix: string, token: TokenPF2e) {
	const level = tokenLightLevel(token)
	const slug = level === LightLevels.DARK ? "dark" : level === LightLevels.DIM ? "dim" : "bright"
	return `${prefix}:fc-light:${slug}`
}

function forCheck(source: Partial<FlatCheckSource>) {
	const options: string[] = []
	if (source.type) options.push(`fc:type:${source.type}`)
	if (source.baseDc != null) options.push(`fc:base-dc:${source.baseDc}`)
	if (source.origin) options.push(`fc:origin:${source.origin.slug}`)

	return options
}

function forRollMessage(msg: ChatMessagePF2e) {
	const options: Array<string | string[]> = []
	if (
		msg.flags.pf2e.context &&
		"contextualOptions" in msg.flags.pf2e.context &&
		msg.flags.pf2e.context.contextualOptions?.postRoll?.length
	) {
		options.push(msg.flags.pf2e.context.contextualOptions.postRoll)
	}
	if (
		msg.flags.pf2e.context &&
		"options" in msg.flags.pf2e.context &&
		msg.flags.pf2e.context.options?.length
	) {
		options.push(msg.flags.pf2e.context.options)
	}

	if (msg.target?.token.object) {
		options.push(lightLevelForToken("target", msg.target.token.object))
	}
	if (msg.token?.object) {
		options.push(lightLevelForToken("self", msg.token.object))
	}

	return options.flat()
}

function forMixed(data: {
	msg?: ChatMessagePF2e
	origin?: TokenDocumentPF2e
	target?: TokenDocumentPF2e
}) {
	const options: Array<string[] | string> = []
	if (data.msg?.item) options.push(data.msg.item.getRollOptions("item"))
	if (data.origin?.actor) options.push(data.origin.actor.getRollOptions())
	if (data.target?.actor) options.push(data.target.actor.getSelfRollOptions("target"))

	if (data.origin?.object && data.target?.object) {
		const distance = data.origin.object.distanceTo(data.target.object)
		if (Number.isInteger(distance)) options.push(`target:distance:${distance}`)
		options.push("target")
	}

	if (data.target?.object) {
		options.push(lightLevelForToken("target", data.target.object))
	}
	if (data.origin?.object) {
		options.push(lightLevelForToken("self", data.origin.object))
	}

	return options.flat()
}

export const flatCheckRollOptions = {
	forCheck,
	forRollMessage,
	forMixed,
}
