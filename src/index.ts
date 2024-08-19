import { MODULE_ID } from "./constants"
import { DelayModule } from "./modules/delay"
import { EmanationModule } from "./modules/emanation/emanation"
import { settings } from "./settings"
import { FlatModule } from "./modules/flat/flat"
import { LifeLinkModule } from "./modules/life-link"

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
	unregister(type: string) {
		delete this.#callbacks[type]
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

const MODULE = {
	socketHandler: new SocketHandler(),
	settings,
	modules: {
		flat: new FlatModule(),
		delay: new DelayModule(),
		emanation: new EmanationModule(),
		lifeLink: new LifeLinkModule(),
	},
}

export default MODULE

Hooks.on("init", () => {
	MODULE.settings.init()
	MODULE.socketHandler.init()

	for (const [name, module] of Object.entries(MODULE.modules)) {
		const enabled =
			module.settingsKey == null
				? true
				: (game.settings.get(MODULE_ID, module.settingsKey) as boolean)

		if (enabled) module.enable()
	}
})

Hooks.on("ready", () => {
	for (const [name, module] of Object.entries(MODULE.modules)) {
		if (module.enabled) module.onReady()
	}
})

Hooks.on("updateSetting", (setting: { key: string }, data) => {
	if (!setting.key.startsWith(MODULE_ID)) return

	const key = setting.key.split(".", 2).at(1)
	if (!key) return

	for (const m of Object.values(MODULE.modules).filter((m) => m.settingsKey === key)) {
		if (data.value === "true") {
			m.enable()
			if (m.enabled) m.onReady()
		} else if (data.value === "false") m.disable()
	}
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
