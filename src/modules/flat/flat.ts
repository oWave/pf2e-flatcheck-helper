import MODULE from "src/index"
import { BaseModule } from "../base"
import { MoreDialog } from "./more-dialog"
import type { ActorPF2e, TokenPF2e } from "foundry-pf2e"
import { translate } from "src/utils"

export class ChatFlatModule extends BaseModule {
	settingsKey = "show-global"

	enable() {
		super.enable()

		this.registerHook("renderSidebarTab", onRenderSidebarTab)
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
		new game.pf2e.StatisticModifier(label ? translate("flat.flat-check-label", { label }) : translate("flat.flat-check"), []),
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
			if (!value) throw new Error(translate("flat.error-bad-button-dc", { value: String(value) }))
			const hidden = e.ctrlKey

			if (value === "more") {
				new MoreDialog().render(true)
			} else {
				const dc = Number(value)
				if (Number.isNaN(dc)) throw new Error(translate("flat.error-bad-button-dc", { value }))

				rollFlatCheck(dc, { hidden })
			}
		}),
	)
}
