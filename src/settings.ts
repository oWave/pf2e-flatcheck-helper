import { MODULE_ID } from "./constants"

type Callback = (value: unknown) => void
const listeners: Record<string, Callback> = {}

export const settings = {
	get fcButtonsEnabled() {
		return (game.settings.get(MODULE_ID, "show-global") &&
			game.settings.get(MODULE_ID, "show")) as boolean
	},
	get delayShouldPrompt() {
		const s = game.settings.get(MODULE_ID, "delay-prompt") as boolean
		return s
	},
	get allowReturn() {
		const s = game.settings.get(MODULE_ID, "delay-return") as boolean
		return s
	},
	get delayCreateMessage() {
		return game.settings.get(MODULE_ID, "delay-create-message") as boolean
	},
	get showInCombatTracker() {
		return game.settings.get(MODULE_ID, "delay-combat-tracker") as boolean
	},
	get showInTokenHUD() {
		return game.settings.get(MODULE_ID, "delay-token-hud") as boolean
	},
	get modifyPF2eHud() {
		return game.settings.get(MODULE_ID, "pf2e-hud-enable") as boolean
	},
	get removeCombatToggle() {
		return game.settings.get(MODULE_ID, "token-hud-remove-combat-toggle") as boolean
	},

	get lifeLinkEnabled() {
		return game.settings.get(MODULE_ID, "lifelink") as boolean
	},
	get lifeLinkVariant() {
		return game.settings.get(MODULE_ID, "lifelink-formular") as "apg" | "plus"
	},
	get emanationAutomation() {
		return (
			game.modules.get("lib-wrapper")?.active &&
			(game.settings.get(MODULE_ID, "emanation-automation") as boolean)
		)
	},

	init() {
		register("show-global", {
			name: "Enable flat check buttons",
			hint: "Global setting: Enables flat check buttons below the chat box.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
			requiresReload: true,
		})
		register("show", {
			name: "Show flat check buttons",
			hint: "Client setting: Turn off to hide the flat check buttons just for you.",
			scope: "client",
			config: true,
			default: true,
			type: Boolean,
			requiresReload: true,
		})

		register("delay-combat-tracker", {
			name: "Show delay button in combat tracker",
			hint: "Adds delay/return buttons to the combat tracker. Will probably not work with any modules that change the combat tracker.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("delay-token-hud", {
			name: "Show delay button in token HUD",
			hint: "Adds delay/return buttons to the menu that appears when right-clicking a token",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("delay-return", {
			name: "Enable return button",
			hint: "Allows returning to initiative by pressing the delay button again.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("delay-prompt", {
			name: "Prompt for new initiative",
			hint: "Lets the user select a combatant to delay their turn after. Can still return early anytime they want.",
			scope: "world",
			config: true,
			default: false,
			type: Boolean,
		})

		register("delay-create-message", {
			name: "Delay/Return creates chat message",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("token-hud-remove-combat-toggle", {
			name: "Remove combat toggle from token HUD",
			hint: "Removes the 'Toggle Combat State' button for tokens in combat",
			scope: "world",
			config: true,
			default: false,
			type: Boolean,
		})

		register("pf2e-hud-enable", {
			name: "Modify PF2e HUD",
			hint: "Overrides PF2e HUDs delay handling with this modules implementation. Please report issue with this to me and not to PF2e HUD!",
			scope: "world",
			config: true,
			default: false,
			type: Boolean,
		})

		register("lifelink", {
			name: "Enable life/spirit link automation buttons",
			hint: "Check the module readme for setup steps.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("lifelink-formular", {
			name: "Life Link Formular",
			hint: "Variant of life link damage absorption to use",
			scope: "world",
			config: true,
			type: String,
			default: "apg",
			choices: {
				apg: "Standard, as written in the APG",
				plus: "Oracles+ (Heightened (+2))",
			},
		})

		register("emanation-automation", {
			name: "Enable automatic emanation effect application",
			hint: "Still experimental, may change it this works in the future. Requires libwrapper.",
			scope: "world",
			config: true,
			type: Boolean,
			default: false,
		})

		for (const [key, setting] of game.settings.settings) {
			if (!key.startsWith(MODULE_ID)) continue
		}
	},

	addListener(key: string, callback: Callback) {
		listeners[key] = callback
	},
	removeListener(key: string) {
		delete listeners[key]
	},
	callListener(key: string, value: unknown) {
		listeners[key]?.(value)
	},
}

type SettingRegistration = Parameters<typeof game.settings.register>[2]

function register(key: string, data: SettingRegistration) {
	game.settings.register(MODULE_ID, key, {
		...data,
		onChange() {
			const value = game.settings.get(MODULE_ID, key)
			settings.callListener(key, value)
		},
	})
}
