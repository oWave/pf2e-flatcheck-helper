import { MODULE_ID } from "./constants"
import { setupDelay } from "./delay"
import { setupEmanationAutomation } from "./emanation"
import { setupFlat } from "./flat"
import { setupLink } from "./life-link"
import { settings } from "./settings"

type Callback = (data: any) => void

class SocketHandler {
	#callbacks: Record<string, Callback> = {}

	init() {
		game.socket.on(`module.${MODULE_ID}`, (data: { type: string; payload: any }) => {
			const handler = this.#callbacks[data.type]
			if (!handler) throw new Error(`No socker handler for '${data.type}'`)
			handler(data.payload)
		})
	}

	register(type: string, handler: Callback) {
		this.#callbacks[type] = handler
	}

	emit(type: string, data: any) {
		if (!(type in this.#callbacks)) {
			throw new Error(`No socket callback registered for '${type}'`)
		}

		game.socket.emit(`module.${MODULE_ID}`, { type, payload: data })
		// Call function on this client as well
		this.#callbacks[type](data)
	}
}

const module = {
	socketHandler: new SocketHandler(),
	settings,
}

export default module

Hooks.on("init", () => {
	module.settings.init()
	module.socketHandler.init()

	setupDelay()
	setupFlat()
	setupLink()
})

Hooks.on("ready", () => {
	setupEmanationAutomation()
})

Hooks.on("renderSettingsConfig", (app: SettingsConfig, $html: JQuery) => {
	const root = $html[0]
	const tab = root.querySelector(`.tab[data-tab="${MODULE_ID}"]`)
	if (!tab) return

	const createHeading = (settingId: string, text: string) => {
		const el = root.querySelector(`div[data-setting-id="${MODULE_ID}.${settingId}"]`)
		if (!el) return

		const heading = document.createElement("h3")
		heading.textContent = text
		el.before(heading)
	}

	createHeading("show-global", "Flat Check Buttons")
	createHeading("delay-combat-tracker", "Delay")
	createHeading("lifelink", "Life Link")
	createHeading("emanation-automation", "Emanation Automation")

	if (!game.modules.get("lib-wrapper")?.active) {
		const input = root.querySelector<HTMLInputElement>(
			'input[name="pf2e-flatcheck-helper.emanation-automation"]',
		)
		if (input) {
			input.title = "Requires lib-wrapper"
			input.disabled = true
			input.checked = false
			input.style.cursor = "not-allowed"
		}
	}
})
