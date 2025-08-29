import type { ChatMessagePF2e, SpellPF2e } from "foundry-pf2e"
import type { RollJSON } from "foundry-pf2e/foundry/client/dice/roll.mjs"
import { MODULE_ID } from "src/constants"
import MODULE from "src/index"
import { parseHTML, translate } from "src/utils"
import { BaseModule } from "../base"
import { collectFlatChecks, type FlatCheckData } from "./data"
import { localizeOrigin, localizeType } from "./i18n"
import type { TreatAsAdjustment } from "./rules/common"

export class MessageFlatCheckModule extends BaseModule {
	settingsKey = "flat-check-in-message"

	enable() {
		if (!game.modules.get("lib-wrapper")?.active) return
		super.enable()

		this.registerHook("preCreateChatMessage", preCreateMessage)
		this.registerHook("createChatMessage", onChatMessage)
		this.registerWrapper("ChatMessage.prototype.renderHTML", messageRenderHTMLWrapper, "WRAPPER")
		this.registerSocket("flat-dsn", handleDSNSocket)
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

interface MsgFlagCheckData extends FlatCheckData {
	roll?: number
	reroll?: {
		oldRoll: number
		keep: RerollModes
	}
}

interface MsgFlagTargetCountData {
	targetCount: number
}

export type MsgFlagData = Record<string, MsgFlagCheckData> & {
	target?: MsgFlagCheckData | MsgFlagTargetCountData
}

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
		baseDc: number | null
		finalDc: number | null
		dcAdjustments?: string
		conditionAdjustment?: TreatAsAdjustment
		rolls: { class: string; value: number }[]
		rerollIcon?: string
		secret?: "gm" | "hide"
		rollButton: string
	}
	interface NoteData {
		icon: string
		text: string
	}

	function checkToData(key: string, check: MsgFlagCheckData): ButtonData {
		const rollData: { class: string; value: number }[] = []
		const rolls: [number | undefined, number | undefined] = [check.reroll?.oldRoll, check.roll]

		let rollClasses: [string, string] = ["strikethrough", "strikethrough"]
		if (check.finalDc == null) {
			rollClasses = ["", ""]
			if (check.reroll?.keep && ["hero", "new"].includes(check.reroll?.keep)) {
				rollClasses[0] = "strikethrough"
			}
		} else if (check.reroll?.keep === "high") {
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

		let rollButton = "hide"
		if (check.finalDc != null && check.finalDc <= 1) rollButton = "auto"
		else if (check.finalDc != null && check.finalDc >= 20) rollButton = "impossible"
		else if (msg.canUserModify(game.user, "update") && !check.reroll) rollButton = "show"

		const secret = check.secret && (game.user.isGM ? "gm" : "hide")
		if (secret && !msg.hasPlayerOwner && game.user.isGM) rollButton = "gm-only"

		return {
			key,
			baseDc: check.baseDc,
			finalDc: check.finalDc,
			dcAdjustments: check.dcAdjustments?.map((a) => `${a.label}: ${a.value}`).join("<br>"),
			type: check.type,
			conditionAdjustment: check.conditionAdjustment,
			origin: check.origin,
			rolls: rollData,
			rerollIcon: check.reroll?.keep ? REROLL_ICONS[check.reroll?.keep] : undefined,
			secret,
			rollButton,
		}
	}

	function targetCountToData(key: string, check: MsgFlagTargetCountData): NoteData {
		return {
			icon: "fa-solid fa-circle-question",
			text: translate("flat.message.button-require-flat-check", { count: check.targetCount }),
		}
	}

	// @ts-expect-error
	if (msg.flags["pf2e-toolbelt"]?.targetHelper?.type === "check") return
	const data = msg.flags[MODULE_ID]?.flatchecks as MsgFlagData | undefined
	if (!data) return

	const buttons: ButtonData[] = []
	const notes: NoteData[] = []

	for (const [key, check] of Object.entries(data)) {
		if ("type" in check) {
			buttons.push(checkToData(key, check))
		} else if ("targetCount" in check) {
			notes.push(targetCountToData(key, check))
		}
	}

	if (buttons.length || notes.length) {
		const renderData = {
			buttons,
			notes,
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
			let section: Element | null | undefined = html.querySelector("section.card-buttons")
			if (section) {
				section.append(buttonNode)
				return
			}

			section = [...html.querySelectorAll("div.dice-roll")].at(-1)
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
			rolls: JSON.stringify([roll.toJSON()]),
		})

		msg.update(updates)
	}
}

function shouldShowFlatChecks(msg: ChatMessagePF2e): boolean {
	const contextType = msg.flags?.pf2e?.context?.type
	const blacklist: (typeof contextType)[] = [
		"damage-roll",
		"damage-taken",
		"flat-check",
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

export function preCreateMessage(msg: ChatMessagePF2e, _data, options: Record<string, any>) {
	if (!msg.actor || !shouldShowFlatChecks(msg)) return

	const data = collectFlatChecks(msg) as MsgFlagData

	if (data != null && Object.keys(data).length) {
		const updates: Record<string, JSONValue> = {
			[`flags.${MODULE_ID}.flatchecks`]: data,
		}
		if (game.modules.get("xdy-pf2e-workbench")?.active) {
			updates["flags.xdy-pf2e-workbench.noAutoDamageRoll"] = true
		}

		msg.updateSource(updates)
	}
}

async function onChatMessage(msg: ChatMessagePF2e) {
	if (msg.author !== game.user) return

	if (MODULE.settings.flatAutoRoll && msg.flags[MODULE_ID]?.flatchecks != null) {
		await autoRoll(msg)
		if (game.modules.get("xdy-pf2e-workbench")?.active && passedAllFlatChecks(msg, false)) {
			// @ts-expect-error
			await game.PF2eWorkbench?.autoRollDamage?.(msg)
		}
	}
}

async function autoRoll(msg: ChatMessagePF2e) {
	const data = msg.flags[MODULE_ID]?.flatchecks as MsgFlagData | undefined
	if (!data) return
	const updates: Record<string, number> = {}
	const rolls: RollJSON[] = []

	for (const [key, check] of Object.entries(data)) {
		if (!("finalDc" in check)) continue
		if (check.finalDc == null || check.finalDc <= 1 || check.finalDc >= 20) continue

		const roll = await new Roll("d20").roll()
		rolls.push(roll.toJSON())
		updates[`flags.${MODULE_ID}.flatchecks.${key}.roll`] = roll.total
	}

	if (rolls.length)
		emitSocket({ msgId: msg.id, userId: game.user.id, rolls: JSON.stringify(rolls) })

	await msg.update(updates)
}

function passedAllFlatChecks(msg: ChatMessagePF2e, passIfNoChecks = true) {
	const checks = msg.flags[MODULE_ID]?.flatchecks as MsgFlagData | undefined
	if (checks == null || Object.keys(checks).length === 0) return passIfNoChecks

	for (const check of Object.values(checks)) {
		if (!("finalDc" in check)) continue
		// Unknown or impossible check
		if (check.finalDc == null || check.finalDc >= 20) return false
		// Auto-success
		if (check.finalDc <= 1) continue

		// Player doesn't know if roll succeeded without GM saying so
		if (check.secret && !game.user.isGM) return false

		// TODO: Rerolls
		if (check.roll == null || check.roll < check.finalDc) return false
	}
	return true
}

interface SocketData {
	msgId: string
	userId: string
	rolls: string
}

function emitSocket(data: SocketData) {
	MODULE.socketHandler.emit("flat-dsn", data)
}

function handleDSNSocket(data: SocketData) {
	// @ts-expect-error
	if (!game.dice3d) return

	const msg = game.messages.get(data.msgId)
	const user = game.users.get(data.userId)
	if (!user || !msg) return

	for (const rollJson of JSON.parse(data.rolls)) {
		const roll = Roll.fromData(rollJson)
		// @ts-expect-error
		game.dice3d.showForRoll(roll, user, false, null, false, data.msgId)
	}
}
