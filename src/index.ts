import { MODULE_ID } from "./constants"
import { DelayModule } from "./modules/delay"
import { EmanationModule } from "./modules/emanation/emanation"
import { LightVisModule } from "./modules/flat/light/layer"
import { MessageFlatCheckModule } from "./modules/flat/message"
import { setupRuleElements } from "./modules/flat/rules/setup"
import { TargetInfoModule } from "./modules/flat/target-marker"
import { LifeLinkModule } from "./modules/life-link"
import { AltRollBreakdownModule } from "./modules/misc/alt-roll-breakdown"
import { SharedVisionModule } from "./modules/misc/toggle-vision"
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
		flatMessageButtons: new MessageFlatCheckModule(),
		lightVis: new LightVisModule(),
		targetInfo: new TargetInfoModule(),
		delay: new DelayModule(),
		emanation: new EmanationModule(),
		lifeLink: new LifeLinkModule(),
		altRollBreakdown: new AltRollBreakdownModule(),
		sharedVision: new SharedVisionModule(),
	},
}

export default MODULE

Hooks.on("init", () => {
	MODULE.settings.init()
	MODULE.socketHandler.init()

	setupRuleElements()

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

	if (import.meta.env.DEV) {
		// @ts-expect-error
		window.__PIXI_DEVTOOLS__ = { renderer: canvas.app.renderer, stage: canvas.app.stage }
	}
})
