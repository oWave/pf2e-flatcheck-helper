import { MODULE_ID } from "src/constants"
import { SvelteMap } from "svelte/reactivity"

class SettingsStore {
	#hookId = Hooks.on(`${MODULE_ID}.updateSetting`, this.#onUpdateSetting.bind(this))
	current = new SvelteMap<string, any>()
	uncommitted = new SvelteMap<string, any>()
	dirty = $derived.by(() => {
		return this.uncommitted.entries().some(([k, v], index) => {
			return this.current.get(k) !== v
		})
	})

	constructor() {
		for (const [k, v] of game.settings.settings.entries()) {
			if (!k.startsWith(MODULE_ID)) continue
			const setting = k.split(".", 2)[1]
			this.current.set(setting, game.settings.get(MODULE_ID, setting))
		}
	}

	#onUpdateSetting({ key, value }: { key: string; value: any }) {
		this.current.set(key, value)
	}

	setValue(key: string, value: any) {
		if (this.current.get(key) === value) this.uncommitted.delete(key)
		else this.uncommitted.set(key, value)
	}

	commit() {
		let clientReload = false
		let worldReload = false

		for (const [key, value] of this.uncommitted.entries()) {
			const setting = game.settings.settings.get(`${MODULE_ID}.${key}`)
			game.settings.set(MODULE_ID, key, value)
			if (setting.requiresReload) {
				if (setting.scope === "world") worldReload = true
				else clientReload = true
			}
		}
		if (clientReload || worldReload) SettingsConfig.reloadConfirm({ world: worldReload })
	}
}

let instance: SettingsStore | null = null
export function getStore() {
	if (!instance) instance = new SettingsStore()
	return instance
}
