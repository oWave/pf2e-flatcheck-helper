import type { TokenPF2e } from "foundry-pf2e"
import type TokenHUD from "foundry-pf2e/foundry/client/applications/hud/token-hud.mjs"
import MODULE from "src"
import { combatantIsNext, parseHTML, translate } from "src/utils"
import { handleRequest } from "./delay"
import { isDelaying } from "./utils"

export function onRenderTokenHUD(app: TokenHUD, html: HTMLElement) {
	if (MODULE.settings.showInTokenHUD) {
		renderDelayButton(app, html)
	}

	if (MODULE.settings.removeCombatToggle) {
		removeCombatToggle(app, html)
	}
}

function renderDelayButton(app: TokenHUD, html: HTMLElement) {
	const token = app.object as TokenPF2e
	const combatant = token.combatant
	if (
		combatant?.parent?.started &&
		combatant.initiative != null &&
		combatant.actor &&
		combatant.isOwner
	) {
		const column = html.querySelector("div.col.right")
		if (!column) return

		let data: { icon: string; title: string; type: "delay" | "return" } | null = null
		if (isDelaying(combatant.actor)) {
			if (!combatantIsNext(combatant) && MODULE.settings.allowReturn) {
				data = { icon: "fa-play", title: translate("delay.return-to-initiative"), type: "return" }
			}
		} else if (combatant.parent.combatant?.id === combatant.id) {
			data = { icon: "fa-hourglass", title: translate("delay.delay"), type: "delay" }
		}

		if (data) {
			const buttonElement = parseHTML(`
					<div class="control-icon" style="display: flex;" data-action="delay" title="${data.title}">
						<i class="fa-solid ${data.icon}"></i>
					</div>`)

			buttonElement.firstElementChild?.addEventListener("click", () => {
				handleRequest({ combatant, type: data.type })
			})
			column.append(buttonElement)
		}
	}
}

function removeCombatToggle(app: TokenHUD, html: HTMLElement) {
	const token = app.object as TokenPF2e
	const combatant = token?.combatant
	if (combatant?.parent.started && combatant.initiative != null) {
		const toggleCombatButton = html.querySelector<HTMLElement>(
			"button.control-icon[data-action=combat]",
		)
		if (toggleCombatButton) toggleCombatButton.style.display = "none"
	}
}
