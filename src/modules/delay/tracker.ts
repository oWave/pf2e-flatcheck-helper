import type { CombatantPF2e } from "types/pf2e/module/encounter"
import MODULE from "src"
import { isDelaying } from "./utils"
import { tryDelay, tryReturn } from "."

export function onRenderCombatTracker(tracker, html: JQuery, data) {
	if (!MODULE.settings.showInCombatTracker) return
	const combat = game.combat
	if (!combat || !combat.started) return

	html.find(".combatant.actor").each((i, e) => {
		const id = e.dataset.combatantId
		if (!id) return
		const c = combat.combatants.get(id)
		if (!c || !c.isOwner || c.initiative == null) return

		if (combat.combatant?.id === c.id) drawButton("delay", $(e), c)
		else if (c.actor && isDelaying(c.actor)) drawButton("return", $(e), c)
	})
}

function drawButton(type: "delay" | "return", combatentHtml: JQuery, combatant: CombatantPF2e) {
	let button = $(`
    <div id="initiative-delay" title="Delay">
      <i class="fa-solid fa-hourglass"></i>
    </div>
  `)
	if (type === "return") {
		const title = MODULE.settings.allowReturn ? "Return to initiative" : "Delaying"
		const cls = MODULE.settings.allowReturn ? "initiative-return" : "initiative-delay-indicator"
		button = $(`
      <div id="initiative-return" class="${cls}" title="${title}">
        <img class="delay-indicator" src="/icons/svg/clockwork.svg"></img>
        <i class="fa-solid fa-play"></i>
      </div>
    `)
	}

	const div = combatentHtml.find(".token-initiative")
	div.find(".initiative").hide()
	div.append(button)

	button.on("click", (e) => {
		e.stopPropagation()
		if (type === "delay") tryDelay()
		else if (MODULE.settings.allowReturn) tryReturn(combatant)
	})
}
