import MODULE from "src/index"
import type { CombatantPF2e, EncounterPF2e } from "foundry-pf2e"
import { tryDelay, tryReturn } from "."
import { isDelaying } from "./utils"
import { translate } from "src/utils"

export function onRenderPF2eHudTracker(app, tracker: HTMLElement) {
	if (!MODULE.settings.modifyPF2eHud) return

	const combat = app.combat as EncounterPF2e
	if (!combat?.started) return

	const t = tracker.querySelectorAll("ol.combatants li.combatant")

	for (const el of tracker.querySelectorAll<HTMLElement>("ol.combatants li.combatant")) {
		const id = el.dataset.combatantId
		if (!id) continue
		const c = combat.combatants.get(id)
		if (!c || !c.isOwner || c.initiative == null) continue

		let delayElement: HTMLElement | null = null
		if (game.user.isGM) delayElement = el.querySelector<HTMLLinkElement>("a.delay")
		else
			delayElement =
				el.querySelector<HTMLElement>("i.fa-solid.fa-hourglass-start") ??
				el.querySelector<HTMLElement>("i.fa-solid.fa-dice-d20")

		if (!delayElement) continue

		if (combat.combatant === c) {
			delayElement.replaceWith(makeDelayButton())
		} else if (c.actor && isDelaying(c.actor)) {
			delayElement.replaceWith(makeReturnButton(c))
		} else {
			const icon = document.createElement("i")
			icon.classList.add("fa-solid", "fa-dice-d20")
			delayElement.replaceWith(icon)
		}
	}
}

function parseHTML(html: string) {
	return new DOMParser().parseFromString(html, "text/html").body.firstChild!
}

function makeDelayButton() {
	const node = parseHTML(`
    <a class="delay" data-tooltip="${translate("delay.hud.delay-button-tooltip")}">
      <i class="fa-solid fa-clock"></i>
    </a>
    `)
	node?.addEventListener("click", (e) => {
		e.stopPropagation()
		tryDelay()
	})
	return node
}

function makeReturnButton(combatant: CombatantPF2e) {
	if (!MODULE.settings.allowReturn) {
		return parseHTML(`<i class="fa-solid fa-hourglass delay-indicator" data-tooltip="${translate("delay.hud.delaying-button-tooltip")}">`)
	}

	const node = parseHTML(`
    <a class="delay-return" data-tooltip="${translate("delay.hud.delaying-button-tooltip")}">
      <i class="fa-solid fa-hourglass delay-indicator"></i>
    </a>
    `)

	node?.addEventListener("click", (e) => {
		e.stopPropagation()
		tryReturn(combatant)
	})

	return node
}
