import type { ChatMessagePF2e, SpellPF2e } from "foundry-pf2e"
import { MODULE_ID } from "src/constants"
import MODULE from "src/index"
import { parseHTML, translate } from "src/utils"
import { BaseModule } from "../base"
import { collectFlatChecks, type FlatCheckData } from "./data"
import { localizeOrigin, localizeType } from "./i18n"
import type { TreatAsAdjustment } from "./rules/common"
import { setupRuleElements } from "./rules/setup"

export class MessageFlatCheckModule extends BaseModule {
	settingsKey = "flat-check-in-message"

	enable() {
		if (!game.modules.get("lib-wrapper")?.active) return
		super.enable()

		this.registerHook("preCreateChatMessage", preCreateMessage)
		this.registerWrapper("ChatMessage.prototype.renderHTML", messageRenderHTMLWrapper, "WRAPPER")
		this.registerSocket("flat-dsn", handleDSNSocket)

		setupRuleElements()
	}
	disable() {
		super.disable()
	}
}

type RerollModes = "low" | "high" | "hero" | "new"
const REROLL_ICONS: Record<RerollModes, string> = {
	hero: "fa-solid fa-hospital-symbol",
	new: "fa-solid fa-dice",
	low: "fa-solid fa-dice-one",
	high: "fa-solid fa-dice-six",
}

type MsgFlagDataEntry = FlatCheckData & {
	roll?: number
	reroll?: {
		oldRoll: number
		keep: RerollModes
	}
}

type MsgFlagData = Record<string, MsgFlagDataEntry>

export async function messageRenderHTMLWrapper(this: ChatMessagePF2e, wrapper, ...args) {
	const html: HTMLElement = await wrapper(...args)

	try {
		if (this.isContentVisible) await renderButtons(this, html)
	} catch (e) {
		console.error("Exception occured while rendering message flat-check buttons: ", e)
	}

	return html
}

async function renderButtons(msg: ChatMessagePF2e, html: HTMLElement) {
	interface ButtonData {
		key: string
		type: string
		origin?: { slug: string; label?: string }
		baseDc: number
		finalDc: number
		dcAdjustments?: string
		conditionAdjustment?: TreatAsAdjustment
		rolls: { class: string; value: number }[]
		rerollIcon?: string
		showRollButton: boolean
	}

	const data = msg.flags[MODULE_ID]?.flatchecks as MsgFlagData | undefined
	if (!data) return

	const buttons: ButtonData[] = []

	for (const [key, check] of Object.entries(data)) {
		const rollData: { class: string; value: number }[] = []
		const rolls: [number | undefined, number | undefined] = [check.reroll?.oldRoll, check.roll]

		const rollClasses: [string, string] = ["strikethrough", "strikethrough"]
		if (check.reroll?.keep === "high") {
			const higherIndex = check.reroll.oldRoll < check.roll! ? 1 : 0
			const outcome = rolls[higherIndex]! >= check.finalDc ? "success" : "failure"
			rollClasses[higherIndex] = outcome
		} else if (check.reroll?.keep === "low") {
			const lowerIndex = check.reroll.oldRoll > check.roll! ? 1 : 0
			const outcome = rolls[lowerIndex]! >= check.finalDc ? "success" : "failure"
			rollClasses[lowerIndex] = outcome
		} else {
			const outcome = check.roll ? (check.roll >= check.finalDc ? "success" : "failure") : ""
			rollClasses[1] = outcome
		}

		if (check.reroll?.oldRoll) {
			rollData.push({ class: rollClasses[0], value: check.reroll.oldRoll })
		}
		if (check.roll) {
			rollData.push({ class: rollClasses[1], value: check.roll })
		}

		buttons.push({
			baseDc: check.baseDc,
			finalDc: check.finalDc,
			dcAdjustments: check.dcAdjustments?.map((a) => `${a.label}: ${a.value}`).join("<br>"),
			type: check.type,
			conditionAdjustment: check.conditionAdjustment,
			origin: check.origin,
			rolls: rollData,
			rerollIcon: check.reroll?.keep ? REROLL_ICONS[check.reroll?.keep] : undefined,
			showRollButton:
				msg.canUserModify(game.user as unknown as foundry.documents.BaseUser, "update") &&
				!check.reroll,
			key,
		})
	}

	if (buttons.length) {
		const renderData = {
			buttons,
			i18n: (key: string) => {
				return translate(`flat.${key}`)
			},
			localizeType: localizeType,
			localizeOrigin: localizeOrigin,
		}

		const buttonHtml = await foundry.applications.handlebars.renderTemplate(
			"modules/pf2e-flatcheck-helper/templates/flat-check-buttons.hbs",
			renderData,
		)

		const buttonNode = parseHTML(buttonHtml)

		if (data.grabbed && data.stupefied) {
			const note = parseHTML(`<div class="fc-rule-note">
					<span data-tooltip='"${translate("flat.message.tooltip-highest-dc")}"'><i class="fa-solid fa-circle-info"></i></span>
				</div>`)
			buttonNode.append(note)
		}
		;(() => {
			let section = html.querySelector("section.card-buttons")
			if (section) {
				section.append(buttonNode)
				return
			}

			section = html.querySelector("div.dice-roll")
			if (section) {
				section.after(buttonNode)
				return
			}

			section = html.querySelector("footer")
			if (section) {
				section.before(buttonNode)
				return
			}

			section = html.querySelector("div.message-content")
			if (section) {
				section.append(buttonNode)
				return
			}

			console.error("Could not insert flat check buttons into message.", msg)
		})()

		html.addEventListener("click", (event) => {
			const element = event.target
			if (
				element instanceof HTMLElement &&
				element.matches('button[data-action="roll-flatcheck"]')
			) {
				const key = element.dataset.key!
				const dc = Number(element.dataset.dc)
				handleFlatButtonClick(msg, key, dc)
			}
		})
	}
}

async function handleFlatButtonClick(msg: ChatMessagePF2e, key: string, dc: number) {
	const roll = await new Roll("d20").roll()
	const oldRoll = foundry.utils.getProperty(msg, `flags.${MODULE_ID}.flatchecks.${key}.roll`)

	const updates: Record<string, any> = {}

	if (!oldRoll) {
		updates[`flags.${MODULE_ID}.flatchecks.${key}.roll`] = roll.total
	} else {
		let heroPoints = 0
		if (msg.actor?.isOfType("character")) {
			heroPoints = msg.actor?.system.resources.heroPoints.value
		}

		await foundry.applications.api.DialogV2.wait({
			id: `${MODULE_ID}.flatcheck.reroll`,
			window: { title: "PF2e Utility Buttons" },
			content: `
				${heroPoints > 0 ? `<label><input type="radio" name="choice" value="hero" checked> <i class="fa-solid fa-hospital-symbol"></i> ${translate("flat.message.reroll-hero-point")}</label>` : ""}
				<label><input type="radio" name="choice" value="new" ${heroPoints <= 0 ? "checked" : ""}> <i class="fa-solid fa-dice"></i> ${translate("flat.message.reroll-new-result")}</label>
				<label><input type="radio" name="choice" value="low"> <i class="fa-solid fa-dice-one"></i> ${translate("flat.message.reroll-lower-result")}</label>
				<label><input type="radio" name="choice" value="high"> <i class="fa-solid fa-dice-six"></i> ${translate("flat.message.reroll-higher-result")}</label>
			`,
			buttons: [
				{
					action: "submit",
					icon: "fa-solid fa-rotate rotate",
					label: translate("flat.message.button-reroll"),
					default: true,
					// @ts-expect-error
					callback: (event, button, dialog) => button.form.elements.choice.value,
				},
				{
					action: "cancel",
					icon: "fas fa-times",
					label: translate("flat.message.button-cancel"),
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

				updates[`flags.${MODULE_ID}.flatchecks.${key}.roll`] = roll.total
				updates[`flags.${MODULE_ID}.flatchecks.${key}.reroll`] = { oldRoll, keep: result }
			},
		})
	}

	if (Object.keys(updates).length > 0) {
		emitSocket({
			msgId: msg.id,
			userId: game.user.id,
			roll: JSON.stringify(roll.toJSON()),
		})

		msg.update(updates)
	}
}

function shouldShowFlatChecks(msg: ChatMessagePF2e): boolean {
	const contextType = msg.flags?.pf2e?.context?.type
	const blacklist: (typeof contextType)[] = [
		"damage-roll",
		"damage-taken",
		"initiative",
		"saving-throw",
	]

	if (contextType && blacklist.includes(contextType)) return false

	// If the spell has an attack roll, don't show flat checks on the spell card, but only on the attack roll itself
	if (contextType === "spell-cast") return (msg.item as SpellPF2e).isAttack === msg.isRoll

	// If message is a roll, only show flat checks if it has a DC
	if (msg.isRoll) return !!msg.flags?.pf2e?.context && "dc" in msg.flags.pf2e.context

	if (!msg.item) return false

	return msg.item.isOfType("action", "consumable", "equipment", "feat", "melee", "weapon")
}

export async function preCreateMessage(msg: ChatMessagePF2e) {
	if (!msg.actor || !shouldShowFlatChecks(msg)) return

	const data = collectFlatChecks(msg) as MsgFlagData

	msg.updateSource({
		[`flags.${MODULE_ID}.flatchecks`]: data,
	})
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
