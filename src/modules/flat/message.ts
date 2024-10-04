import { MODULE_ID } from "src/constants"
import MODULE from "src/index"
import type { ActorPF2e } from "types/pf2e/module/actor"
import type { TokenPF2e } from "types/pf2e/module/canvas"
import type { ChatMessagePF2e } from "types/pf2e/module/chat-message"
import type { SpellPF2e } from "types/pf2e/module/item"
import { BaseModule } from "../base"

export class MessageFlatCheckModule extends BaseModule {
	settingsKey = "flat-check-in-message"

	enable() {
		if (!game.modules.get("lib-wrapper")?.active) return
		super.enable()

		this.registerHook("preCreateChatMessage", preCreateMessage)
		this.registerWrapper("ChatMessage.prototype.getHTML", messageGetHTMLWrapper, "WRAPPER")
		this.registerSocket("flat-dsn", handleDSNSocket)
	}
	disable() {
		super.disable()
	}
}

const REROLL_ICONS = {
	hero: "fa-solid fa-hospital-symbol",
	new: "fa-solid fa-dice",
	low: "fa-solid fa-dice-one",
	higher: "fa-solid fa-dice-six",
}

interface ButtonData {
	label: string
	dc: number
	roll?: number
	reroll?: {
		oldRoll: number
		keep: "low" | "high" | "hero" | "new"
	}
}

interface ButtonsFlags {
	grabbed?: ButtonData
	stupefied?: ButtonData
	targets?: ButtonData | { count: number }
}

export async function messageGetHTMLWrapper(this: ChatMessagePF2e, wrapper, ...args) {
	const html: JQuery = await wrapper(...args)

	try {
		if (this.isContentVisible) renderButtons(this, html)
	} catch (e) {
		console.error("Exception occured while rendering message flat-check buttons: ", e)
	}

	return html
}

function renderButtons(msg: ChatMessagePF2e, html: JQuery) {
	const buttons: Array<(ButtonData & { key: string }) | { text: string }> = []
	const data = msg.flags[MODULE_ID]?.flatchecks as ButtonsFlags | undefined
	if (data) {
		if (data.grabbed) buttons.push({ key: "grabbed", ...data.grabbed })
		if (data.stupefied) buttons.push({ key: "stupefied", ...data.stupefied })
		if (data.targets) {
			if ("count" in data.targets)
				buttons.push({ text: `${data.targets.count} targets require a flat check` })
			else buttons.push({ key: "targets", ...data.targets })
		}
	} else {
		return
	}

	if (buttons) {
		const buttonHtml = buttons.map((data) => {
			if ("text" in data) {
				return `<div class="fc-note"><i class="fa-regular fa-circle-question"></i> ${data.text}</div>`
			}

			const buttonIcon = data.roll ? "fa-rotate rotate" : "fa-dice-d20 die"
			const buttonClass = msg.canUserModify(game.user, "update") && !data.reroll ? "" : "hidden"

			const rolls: [number | undefined, number | undefined] = [data.reroll?.oldRoll, data.roll]
			const rollClasses: [string, string] = ["strikethrough", "strikethrough"]
			if (data.reroll?.keep === "high") {
				const higherIndex = data.reroll.oldRoll < data.roll! ? 1 : 0
				const outcome = rolls[higherIndex]! >= data.dc ? "success" : "failure"
				rollClasses[higherIndex] = outcome
			} else if (data.reroll?.keep === "low") {
				const lowerIndex = data.reroll.oldRoll > data.roll! ? 1 : 0
				const outcome = rolls[lowerIndex]! >= data.dc ? "success" : "failure"
				rollClasses[lowerIndex] = outcome
			} else {
				const outcome = data.roll ? (data.roll >= data.dc ? "success" : "failure") : ""
				rollClasses[1] = outcome
			}

			const rerollIcon = data.reroll
				? `<span class="fc-icon"><i class="${REROLL_ICONS[data.reroll.keep]}"></i></span>`
				: ""

			return `<div class="fc-check">
				<span class="fc-label">${data.label}</span>
				<span class="fc-dc">DC ${data.dc}</span>
				<span class="fc-roll">
					<span class="fc-rolls">
						<span class="${rollClasses[0]}">${rolls[0] ?? ""}</span>
						<span class="${rollClasses[1]}">${rolls[1] ?? ""}</span>
					</span>
					${rerollIcon}
				</span>
			  <button class="${buttonClass}" data-action="roll-flatcheck" data-key="${data.key}" data-dc="${data.dc}">
					<i class="fa-solid ${buttonIcon}"></i>
				</button>
			</div>`
		})

		const buttonNode = jQuery.parseHTML(
			`<section class="fc-flatcheck-buttons">${buttonHtml.join("")}</section>`,
		)[0] as HTMLElement

		if (data.grabbed && data.stupefied) {
			$(buttonNode).append(`<div class="fc-rule-note">
					<span data-tooltip='"If more than one flat check would ever cause or prevent the same thing, just roll once and use the highest DC."'><i class="fa-solid fa-circle-info"></i></span>
				</div>`)
		}

		let section = html.find("section.card-buttons")
		if (section.length) {
			section.append(buttonNode)
		} else {
			section = html.find("div.dice-roll")
			if (!section) {
				console.error("Could not find an element to insert flat check buttons")
				return
			}
			section.after(buttonNode)
		}

		html.on("click", 'button[data-action="roll-flatcheck"]', function (this: HTMLButtonElement) {
			const key = this.dataset.key!
			const dc = Number(this.dataset.dc)

			handleFlatButtonClick(msg, key, dc)
		})
	}
}

async function handleFlatButtonClick(msg: ChatMessagePF2e, key: string, dc: number) {
	const roll = await new Roll("d20").roll()
	const oldRoll = foundry.utils.getProperty(msg, `flags.${MODULE_ID}.flatchecks.${key}.roll`)

	const updates: Record<string, any> = {
		[`flags.${MODULE_ID}.flatchecks.${key}.roll`]: roll.total,
	}

	if (oldRoll) {
		let heroPoints = 0
		if (msg.actor?.isOfType("character")) {
			heroPoints = msg.actor?.system.resources.heroPoints.value
		}

		// @ts-expect-error
		await foundry.applications.api.DialogV2.wait({
			id: `${MODULE_ID}.flatcheck.reroll`,
			window: { title: "PF2e Utility Buttons" },
			content: `
				${heroPoints > 0 ? '<label><input type="radio" name="choice" value="hero" checked> <i class="fa-solid fa-hospital-symbol"></i> Reroll using a hero point</label>' : ""}
				<label><input type="radio" name="choice" value="new" ${heroPoints <= 0 ? "checked" : ""}> <i class="fa-solid fa-dice"></i> Reroll and keep the new result</label>
				<label><input type="radio" name="choice" value="low"> <i class="fa-solid fa-dice-one"></i> Reroll and keep the lower result</label>
				<label><input type="radio" name="choice" value="higher"> <i class="fa-solid fa-dice-six"></i> Reroll and keep the higher result</label>
			`,
			buttons: [
				{
					action: "submit",
					icon: "fa-solid fa-rotate rotate",
					label: "Reroll",
					default: true,
					callback: (event, button, dialog) => button.form.elements.choice.value,
				},
				{
					action: "cancel",
					icon: "fas fa-times",
					label: "Cancel",
				},
			],
			submit: async (result) => {
				if (result === "cancel") return

				if (result === "hero" && msg.actor?.isOfType("character")) {
					const { value, max } = msg.actor.system.resources.heroPoints
					await msg.actor?.update({
						"system.resources.heroPoints.value": Math.clamp(value - 1, 0, max),
					})
				}

				updates[`flags.${MODULE_ID}.flatchecks.${key}.reroll`] = { oldRoll, keep: result }
			},
		})
	}

	emitSocket({
		msgId: msg.id,
		userId: game.user.id,
		roll: JSON.stringify(roll.toJSON()),
	})

	msg.update(updates)
}

export async function preCreateMessage(msg: ChatMessagePF2e) {
	if (!msg.actor) return

	if (
		(msg.flags?.pf2e?.context?.type === "spell-cast" &&
			(msg.item as SpellPF2e).isAttack &&
			!msg.isCheckRoll) ||
		msg.flags?.pf2e?.context?.type === "saving-throw"
	) {
		return
	}

	const data: ButtonsFlags = {}

	if (
		msg.actor?.conditions.stored.some((c) => c.slug === "grabbed") &&
		msg.item?.system.traits.value?.some((t) => t === "manipulate")
	) {
		data.grabbed = { label: "Grabbed", dc: 5 }
	}

	if (
		msg.flags?.pf2e?.context?.type === "spell-cast" ||
		(msg.flags?.pf2e?.context?.action === "cast-a-spell" &&
			msg.flags?.pf2e?.context?.type === "attack-roll")
	)
		if (["spell-cast", "attack-roll"].includes(msg.flags?.pf2e?.context?.type)) {
			const stupefied = msg.actor?.conditions.stupefied?.value
			if (stupefied) {
				data.stupefied = { label: `Stupefied ${stupefied}`, dc: 5 + stupefied }
			}
		}

	const targetCheck = flatCheckForUserTargets(msg.actor)
	if (targetCheck) data.targets = targetCheck

	msg.updateSource({
		[`flags.${MODULE_ID}.flatchecks`]: data,
	})
}

const originDCs = {
	dazzled: 5,
	blinded: 11,
}
type OriginSlug = keyof typeof originDCs

export const targetDCs = {
	concealed: 5,
	hidden: 11,
	invisible: 11,
}
type TargetSlug = keyof typeof targetDCs

function flatCheckForUserTargets(origin: ActorPF2e) {
	if (game.user.targets.size > 1) {
		const count = game.user.targets.reduce(
			(acc, t) => (flatCheckForTarget(origin, t) !== null ? acc + 1 : acc),
			0,
		)
		if (count) return { count }
	} else if (game.user.targets.size === 1) {
		const target = game.user.targets.first()
		if (target) {
			const targetDC = flatCheckForTarget(origin, target)
			if (targetDC) {
				return targetDC
			}
		}
	}
}

function flatCheckForTarget(origin: ActorPF2e, target: TokenPF2e) {
	let originCondition = null as OriginSlug | null
	origin.conditions.stored.forEach((c) => {
		const slug = c.system.slug
		if (slug in originDCs && (!originCondition || originDCs[originCondition] < originDCs[slug])) {
			originCondition = slug as OriginSlug
		}
	})

	let targetCondition = null as TargetSlug | null
	target.actor?.conditions?.stored.forEach((c) => {
		const slug = c.system.slug
		if (slug in targetDCs && (!targetCondition || targetDCs[targetCondition] < targetDCs[slug]))
			targetCondition = slug as TargetSlug
	})

	if (!originCondition && !targetCondition) return null
	const originDC = originCondition ? originDCs[originCondition] : 0
	const targetDC = targetCondition ? targetDCs[targetCondition] : 0

	if (originDC < targetDC) return { label: targetCondition!.capitalize(), dc: targetDC }
	else return { label: originCondition!.capitalize(), dc: originDC }
}

interface SocketData {
	msgId: string
	userId: string
	roll: string
}

function emitSocket(data: SocketData) {
	MODULE.socketHandler.emit("flat-dsn", data)
}

function handleDSNSocket(data: SocketData) {
	// @ts-expect-error
	if (!game.dice3d) return

	const msg = game.messages.get(data.msgId)
	const user = game.users.get(data.userId)
	const roll = Roll.fromJSON(data.roll)

	if (!user || !msg) return

	// @ts-expect-error
	game.dice3d.showForRoll(roll, user, false, null, false, data.msgId)
}
