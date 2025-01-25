import MODULE from "src/index"
import { BaseModule } from "../base"
import { MoreDialog } from "./more-dialog"
import type { ActorPF2e, TokenPF2e } from "foundry-pf2e"

export class ChatFlatModule extends BaseModule {
	settingsKey = "show-global"

	enable() {
		super.enable()

		this.registerHook("renderSidebarTab", onRenderSidebarTab)
		this.registerHook("targetToken", onTargetToken)
	}
	disable() {
		super.disable()
	}
}

export async function rollFlatCheck(
	dc: number,
	{ hidden = false, label }: { hidden: boolean; label?: string },
) {
	const actor =
		canvas.tokens.controlled.at(0)?.actor ??
		game.user.character ??
		(new Actor({ type: "npc", name: game.user.name }) as ActorPF2e)

	return await game.pf2e.Check.roll(
		new game.pf2e.StatisticModifier(label ? `Flat Check: ${label}` : "Flat Check", []),
		{
			actor,
			type: "flat-check",
			dc: { value: dc, visible: true },
			options: new Set(["flat-check"]),
			createMessage: true,
			skipDialog: true,
			rollMode: hidden ? "blindroll" : "roll",
		},
	)
}

export const CONDITION_DCS = {
	concealed: 5,
	hidden: 11,
	invisible: 11,
}

function dcForToken(token: TokenPF2e) {
	let dc = 0
	token.actor?.conditions.stored.forEach((c) => {
		dc = Math.max(CONDITION_DCS[c.slug] ?? 0, dc)
	})
	return dc || null
}

async function rollForSingleTarget(
	target: TokenPF2e | undefined,
	{ hidden = false }: { hidden: boolean },
) {
	if (!target) return
	const dc = dcForToken(target)
	if (!dc) ui.notifications.warn("Selected target has no conditions that require a flat check")
	else rollFlatCheck(dc, { hidden })
}

async function onRenderSidebarTab(app: SidebarTab, html: HTMLCollection) {
	if (app.tabName !== "chat") return
	if (!MODULE.settings.fcButtonsEnabled) return

	const chat = html[0].querySelector("#chat-form")

	const template = await renderTemplate("modules/pf2e-flatcheck-helper/templates/buttons.hbs", {})
	const node = document.createElement("div")
	node.id = "fc-container"
	node.innerHTML = template

	chat?.after(node)
	const $node = $(node)
	// @ts-expect-error
	$node.find(".tooltip").tooltipster({
		contentAsHTML: true,
	})

	node.querySelectorAll("button").forEach((button) =>
		button.addEventListener("click", function (e) {
			const value = this.dataset.dc
			if (!value) throw new Error(`Bad button DC value ${value}`)
			const hidden = e.ctrlKey

			if (value === "targets") {
				if (game.user?.targets.size === 0) return ui.notifications.warn("No targets selected")
				if (game.user?.targets.size === 1)
					return rollForSingleTarget(game.user.targets.first(), { hidden })
				else return ui.notifications.warn("Too many targets")
			} else if (value === "more") {
				new MoreDialog().render(true)
			} else {
				const dc = Number(value)
				if (Number.isNaN(dc)) throw new Error(`Bad button DC value ${value}`)

				rollFlatCheck(dc, { hidden })
			}
		}),
	)
}

function onTargetToken(user: User) {
	if (user.id !== game.user?.id) return
	if (game.user.targets.size !== 1)
		return document.querySelector("#fc-button-target")?.classList.remove("highlight")
	const effectSlugs = Object.keys(CONDITION_DCS)

	if (game.user?.targets?.first()?.actor?.conditions.some((c) => effectSlugs.includes(c.slug)))
		document.querySelector("#fc-button-target")?.classList.add("highlight")
	else document.querySelector("#fc-button-target")?.classList.remove("highlight")
}
