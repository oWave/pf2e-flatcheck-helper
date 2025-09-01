import type { HookCallback } from "foundry-pf2e/foundry/client/helpers/hooks.mjs"
import { MODULE_ID } from "src/constants"
import MODULE from "src/index"
import { type ChatActionCallback, ChatActionHandler } from "src/shared/chat-button-handler"

export abstract class BaseModule {
	enabled = false
	hooks: Record<string, number> = {}
	wrappers: number[] = []
	sockets: string[] = []
	settingListeners: string[] = []
	queries: string[] = []
	chatActions: string[] = []

	abstract readonly settingsKey: string | null

	/** Assumes settingsKey is a boolean setting. Needs to be overriden if not */
	hasSettingEnabled(): boolean {
		if (this.settingsKey == null) return true
		return game.settings.get(MODULE_ID, this.settingsKey) as boolean
	}

	onReady() {}

	enable() {
		this.enabled = true
	}
	disable() {
		this.enabled = false

		for (const [hook, id] of Object.entries(this.hooks)) {
			Hooks.off(hook, id)
		}
		this.hooks = {}

		for (const id of this.wrappers) {
			libWrapper.unregister(MODULE_ID, id)
		}
		this.wrappers = []

		for (const type of this.sockets) {
			MODULE.socketHandler.unregister(type)
		}
		this.sockets = []

		for (const name of this.queries) {
			// @ts-expect-error
			delete CONFIG.queries[name]
		}
		this.queries = []

		for (const key of this.settingListeners) {
			MODULE.settings.removeListener(key)
		}
		this.settingListeners = []

		for (const key of this.chatActions) {
			ChatActionHandler.unregister(key)
		}
		this.chatActions = []
	}

	registerHook(hook: string, callback: HookCallback<any[]>) {
		this.hooks[hook] = Hooks.on(hook, callback)
	}

	registerWrapper(
		target: string,
		callback: CallableFunction,
		mode: "MIXED" | "WRAPPER" | "OVERRIDE",
	) {
		this.wrappers.push(libWrapper.register(MODULE_ID, target, callback, mode as any))
	}

	registerSocket(type: string, callback: (data: any) => void) {
		this.sockets.push(type)
		MODULE.socketHandler.register(type, callback)
	}

	registerQuery(name: string, callback: (data: any) => Promise<any>) {
		// @ts-expect-error
		CONFIG.queries[name] = callback
	}

	registerSettingListener(key: string, callback: (value: unknown) => void) {
		MODULE.settings.addListener(key, callback)
	}

	registerChatAction(key: string, callback: ChatActionCallback) {
		this.chatActions.push(key)
		ChatActionHandler.register(key, callback)
	}
}
