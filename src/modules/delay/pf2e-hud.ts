import type { EncounterPF2e } from "foundry-pf2e"
import MODULE from "src/index"
import { parseHTML, translate } from "src/utils"
import { handleRequest } from "./delay"
import { isDelaying } from "./utils"

export function onRenderPF2eHudTracker(app, tracker: HTMLElement) {
	if (!MODULE.settings.modifyPF2eHud) return

	const combat = app.viewed as EncounterPF2e
	if (!combat?.started) return

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

		let type: "delay" | "return" | null = null

		if (combat.combatant === c) {
			type = "delay"
		} else if (c.actor && isDelaying(c.actor)) {
			type = "return"
		}

		let button: DocumentFragment | null = null
		if (type == null) {
			const icon = document.createElement("i")
			icon.classList.add("fa-solid", "fa-dice-d20")
			delayElement.replaceWith(icon)
		} else if (type === "delay") {
			button = parseHTML(`
				<a class="delay" data-tooltip="${translate("delay.delay")}">
	  	    <i class="fa-solid fa-clock"></i>
  	  	</a>`)
		} else if (type === "return") {
			if (MODULE.settings.allowReturn) {
				button = parseHTML(`
					<a class="delay-return" data-tooltip="${translate("delay.return-to-initiative")}">
						<i class="fa-solid fa-hourglass delay-indicator"></i>
					</a>`)
			} else {
				const icon = parseHTML(
					`<i class="fa-solid fa-hourglass delay-indicator" data-tooltip="${translate("delay.delaying")}">`,
				)
				delayElement.replaceWith(icon)
			}
		}
		if (button) {
			button.firstElementChild?.addEventListener("click", () => {
				handleRequest({ combatant: c, type: type! })
			})
			delayElement.after(button)
			delayElement.remove()
		}
	}
}
