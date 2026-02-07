import type { ChatMessagePF2e, TokenDocumentPF2e, TokenPF2e } from "foundry-pf2e"
import { SYSTEM } from "src/utils"
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
	const context = msg.flags[SYSTEM.id].context
	if (context && "contextualOptions" in context && context.contextualOptions?.postRoll?.length) {
		options.push(context.contextualOptions.postRoll)
	}
	if (context && "options" in context && context.options?.length) {
		options.push(context.options)
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

	return options.flat()
}

function lightLevelOptions({
	self,
	target,
	msg,
}: {
	self?: TokenPF2e | null
	target?: TokenPF2e | null
	msg?: ChatMessagePF2e
}) {
	const options: Array<string[] | string> = []

	if (msg?.token?.object && msg.target?.token.object) {
		self = msg.token.object
		target = msg.target.token.object
	}

	if (self) options.push(lightLevelForToken("self", self))
	if (target) options.push(lightLevelForToken("self", target))
	return options.flat()
}

export const flatCheckRollOptions = {
	forCheck,
	forRollMessage,
	forMixed,
	lightLevelOptions,
}
