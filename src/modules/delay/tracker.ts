import MODULE from "src/index"
import type { CombatantPF2e } from "foundry-pf2e"
import { isDelaying } from "./utils"
import { parseHTML, translate } from "src/utils"
import { handleRequest } from "./delay"

export function onRenderCombatTracker(_tracker, html: HTMLElement, _data) {
	if (!MODULE.settings.showInCombatTracker) return
	const combat = game.combat
	if (!combat || !combat.started) return

	const combatantElements = html.querySelectorAll<HTMLElement>("li.combatant")
	for (const el of combatantElements) {
		const id = el.dataset.combatantId
		if (!id) continue
		const combatant = combat.combatants.get(id)
		if (!combatant?.isOwner || combatant.initiative == null) continue

		if (combat.combatant?.id === combatant.id) drawButton("delay", el, combatant)
		else if (combatant.actor && isDelaying(combatant.actor)) drawButton("return", el, combatant)
	}
}

function drawButton(
	type: "delay" | "return",
	combatantHtml: HTMLElement,
	combatant: CombatantPF2e,
) {
	let buttonHTML: DocumentFragment
	if (type === "delay") {
		buttonHTML = parseHTML(`
			<div class="initiative-delay" title="${translate("delay.delay")}">
      	<i class="fa-solid fa-hourglass"></i>
			</div>
		`)
	} else {
		const title = MODULE.settings.allowReturn
			? translate("delay.return-to-initiative")
			: translate("delay.delaying")
		const cls = MODULE.settings.allowReturn ? "initiative-return" : "initiative-delay-indicator"
		buttonHTML = parseHTML(`
      <div class="initiative-return" class="${cls}" title="${title}">
        <img class="delay-indicator" src="icons/svg/clockwork.svg"></img>
        <i class="fa-solid fa-play"></i>
      </div>
    `)
	}

	buttonHTML.firstElementChild?.addEventListener("click", (e) => {
		e.stopPropagation()
		handleRequest({ combatant, type })
	})

	const initiativeDiv = combatantHtml.querySelector<HTMLElement>(".token-initiative")
	if (initiativeDiv) initiativeDiv.style.display = "none"
	combatantHtml.append(buttonHTML)
}
