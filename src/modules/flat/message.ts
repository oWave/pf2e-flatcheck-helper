import { MODULE_ID } from "src/constants"
import MODULE from "src/index"
import { BaseModule } from "../base"
import { flatMessageConfig } from "./message-config"
import type { ChatMessagePF2e, SpellPF2e } from "foundry-pf2e"
import { flatCheckForUserTargets } from "./target"
import { translate } from "src/utils"

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
	onReady() {
		setTimeout(() => {
			if (
				game.modules.get("pf2e-perception")?.active &&
				!(
					(game.modules.get("pf2e-perception") as any)?.api?.check?.getFlatCheckDc instanceof
					Function
				)
			) {
				foundry.applications.api.DialogV2.prompt({
					window: { title: translate("flat.message.perception-outdated-title") },
					content:
						translate("flat.message.perception-outdated-content"),
					ok: {
						label: translate("flat.message.button-close"),
						icon: "fas fa-close",
					},
				})
			}
		}, 1000)
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
	description?: string
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
	deafened?: ButtonData
	targets?: ButtonData | { count: number }
}

export async function messageGetHTMLWrapper(this: ChatMessagePF2e, wrapper, ...args) {
	const html: JQuery = await wrapper(...args)

	try {
		if (this.isContentVisible) renderButtons(this, html)
	} catch (e) {
		console.error(translate("flat.message.error-exception-when-rendering"), e)
	}

	return html
}

function renderButtons(msg: ChatMessagePF2e, html: JQuery) {
	const buttons: Array<(ButtonData & { key: string }) | { text: string }> = []
	const data = msg.flags[MODULE_ID]?.flatchecks as ButtonsFlags | undefined
	if (data) {
		if (data.grabbed) buttons.push({ key: "grabbed", ...data.grabbed })
		if (data.stupefied) buttons.push({ key: "stupefied", ...data.stupefied })
		if (data.deafened) buttons.push({ key: "deafened", ...data.deafened })
		if (data.targets) {
			if ("count" in data.targets)
				buttons.push({ text: translate("flat.message.button-require-flat-check", { count: data.targets.count }) })
			else buttons.push({ key: "targets", ...data.targets })
		}
	} else {
		return
	}

	if (buttons.length) {
		const buttonHtml = buttons.map((data) => {
			if ("text" in data) {
				return `<div class="fc-note"><i class="fa-regular fa-circle-question"></i> ${data.text}</div>`
			}

			const buttonIcon = data.roll ? "fa-rotate rotate" : "fa-dice-d20 die"
			const buttonClass =
				msg.canUserModify(game.user as unknown as foundry.documents.BaseUser, "update") &&
					!data.reroll
					? ""
					: "hidden"

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
				<span class="fc-label">
				  <span>${data.label}</span>
					${data.description ? `<span class="fc-description">${data.description}</span>` : ""}
				</span>
				<span class="fc-dc">${translate("flat.message.dc", { value: data.dc })}</span>
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
					<span data-tooltip='"${translate("flat.message.tooltip-highest-dc")}"'><i class="fa-solid fa-circle-info"></i></span>
				</div>`)
		}
		; (() => {
			let section = html.find("section.card-buttons")
			if (section.length) {
				section.append(buttonNode)
				return
			}

			section = html.find("div.dice-roll")
			if (section.length) {
				section.after(buttonNode)
				return
			}

			section = html.find("footer")
			if (section.length) {
				section.before(buttonNode)
				return
			}

			section = html.find("div.message-content")
			if (section.length) {
				section.append(buttonNode)
				return
			}

			console.error("Could not insert flat check buttons into message.", msg)
		})()

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
				<label><input type="radio" name="choice" value="higher"> <i class="fa-solid fa-dice-six"></i> ${translate("flat.message.reroll-higher-result")}</label>
			`,
			buttons: [
				{
					action: "submit",
					icon: "fa-solid fa-rotate rotate",
					label: translate("flat.message.reroll-button-reroll"),
					default: true,
					// @ts-expect-error
					callback: (event, button, dialog) => button.form.elements.choice.value,
				},
				{
					action: "cancel",
					icon: "fas fa-times",
					label: translate("flat.message.reroll-button-cancel"),
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
	if (
		[msg.flags?.pf2e?.context?.type && "flat-check", "damage-taken", "healing-received"].includes(
			msg.flags?.pf2e?.context?.type,
		)
	)
		return false

	// If the spell has an attack roll, don't show flat checks on the spell card, but only on the attack roll itself
	if (msg.flags?.pf2e?.context?.type === "spell-cast")
		return (msg.item as SpellPF2e).isAttack === msg.isRoll

	// Only show flat checks on dice rolls with a DC
	if (msg.isRoll) return !!msg.flags?.pf2e?.context && "dc" in msg.flags.pf2e.context

	if (!msg.item) return false

	return msg.item.isOfType("action", "consumable", "equipment", "feat", "melee", "weapon")
}

export async function preCreateMessage(msg: ChatMessagePF2e) {
	if (!msg.actor || !shouldShowFlatChecks(msg)) return

	const data: ButtonsFlags = {}

	const { ignored, experimental } = flatMessageConfig.toSets()
	if (
		!ignored.has("manipulate") &&
		msg.actor?.conditions.stored.some((c) => c.slug === "grabbed") &&
		msg.item?.system.traits.value?.some((t) => t === "manipulate")
	) {
		data.grabbed = { label: translate("flat.message.grabbed"), dc: 5 }
	}

	if (
		!ignored.has("deafened") &&
		msg.actor?.conditions.stored.some((c) => c.slug === "deafened") &&
		msg.item?.system.traits.value?.some((t) => t === "auditory")
	) {
		data.deafened = { label: translate("flat.message.deafened"), dc: 5 }
	}
	if (
		!ignored.has("deafened-spellcasting") &&
		msg.actor?.conditions.stored.some((c) => c.slug === "deafened") &&
		msg.flags?.pf2e?.origin?.type === "spell" &&
		!msg.item?.system.traits.value?.some((t) => t === "subtle")
	) {
		data.deafened = { label: translate("flat.message.deafened"), dc: 5 }
	}

	if (!ignored.has("stupefied") && msg.flags?.pf2e?.origin?.type === "spell") {
		const stupefied = msg.actor?.conditions.stupefied?.value
		if (stupefied) {
			data.stupefied = { label: translate("flat.message.stupefied", { value: stupefied }), dc: 5 + stupefied }
		}
	}

	if (!ignored.has("target")) {
		const targetCheck = msg.actor.isOfType("creature") ? flatCheckForUserTargets(msg.actor) : null
		if (targetCheck) data.targets = targetCheck
	}

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
