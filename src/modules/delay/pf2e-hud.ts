import MODULE from "src"
import type { EncounterPF2e } from "types/pf2e/module/encounter"
import { isDelaying } from "./utils"
import { tryDelay } from "."

export function onRenderPF2eHudTracker(app, tracker: HTMLElement) {
	if (!MODULE.settings.modifyPF2eHud) return

	const combat = app.combat as EncounterPF2e
	if (!combat?.started) return

	const t = tracker.querySelectorAll("ol.combatants li.combatant")

	for (const el of tracker.querySelectorAll<HTMLElement>("ol.combatants li.combatant")) {
		const id = el.dataset.combatantId
		if (!id) return
		const c = combat.combatants.get(id)
		if (!c || !c.isOwner || c.initiative == null) return

		let delayElement: HTMLElement | null = null
		if (game.user.isGM) delayElement = el.querySelector<HTMLLinkElement>("a.delay")
		else
			delayElement =
				el.querySelector<HTMLElement>("i.fa-solid.fa-hourglass-start") ??
				el.querySelector<HTMLElement>("i.fa-solid.fa-dice-d20")

		if (!delayElement) return

		if (combat.combatant === c) {
			delayElement.replaceWith(makeDelayButton())
		} else if (c.actor && isDelaying(c.actor)) {
			delayElement.replaceWith(makeReturnButton())
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
    <a class="delay" data-tooltip="Delay">
      <i class="fa-solid fa-clock"></i>
    </a>
    `)
	node?.addEventListener("click", (e) => {
		e.stopPropagation()
		tryDelay()
	})
	return node
}

function makeReturnButton() {
	if (!MODULE.settings.allowReturn) {
		return parseHTML(`<i class="fa-solid fa-hourglass delay-indicator" data-tooltip="Delaying">`)
	}

	const node = parseHTML(`
    <a class="delay-return" data-tooltip="Return to initiative">
      <i class="fa-solid fa-hourglass delay-indicator"></i>
    </a>
    `)

	return node
}
