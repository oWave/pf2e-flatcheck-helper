import MODULE from "src"
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
	get altRollBreakdown() {
		return game.settings.get(MODULE_ID, "script-alt-roll-breakdown") as boolean
	},
	get toggleSharedVision() {
		return game.settings.get(MODULE_ID, "script-toggle-shared-vision") as boolean
	},

	init() {
		register("show-global", {
			name: "Enable Flat Check Buttons",
			hint: "Global setting: Enables flat check buttons below the chat box.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
			requiresReload: true,
		})
		register("show", {
			name: "Show Flat Check Buttons",
			hint: "Client setting: Turn off to hide the flat check buttons just for you.",
			scope: "client",
			config: true,
			default: true,
			type: Boolean,
			requiresReload: true,
		})

		register("delay-combat-tracker", {
			name: "Show Delay Button in Combat Tracker",
			hint: "Adds delay/return buttons to the default combat tracker.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("delay-token-hud", {
			name: "Show Delay Button in Token Hud",
			hint: "Adds delay/return buttons to the menu that appears when right-clicking a token",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("delay-return", {
			name: "Enable Return Button",
			hint: "Allows returning to initiative by pressing the delay button again.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("delay-prompt", {
			name: "Prompt for New Initiative",
			hint: "Lets the user select a combatant to delay their turn after. Can still return early anytime they want.",
			scope: "world",
			config: true,
			default: false,
			type: Boolean,
		})

		register("delay-create-message", {
			name: "Delay/Return Creates Chat Message",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("token-hud-remove-combat-toggle", {
			name: "Remove Combat Toggle from Token Hud",
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
			name: "Enable Life/Spirit Link Automation Buttons",
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
				apg: "Standard",
				plus: "Oracles+ (Heightened (+2))",
			},
		})

		register("emanation-automation", {
			name: "Auto-Apply Emanation Effect Button",
			hint: "Requires libwrapper.",
			scope: "world",
			config: true,
			type: Boolean,
			default: false,
		})

		register("script-alt-roll-breakdown", {
			name: "Alternative Roll Breakdowns",
			hint: `Requires the "Show Roll Breakdowns" system metagame setting to be enabled. Hides only total and base modifier from players, instead of all modifiers (e.g. multi attack penalty, status bonuses).`,
			scope: "world",
			config: true,
			type: Boolean,
			default: false,
		})

		register("script-toggle-shared-vision", {
			name: "Toggle Shared Vision in Combat",
			hint: `Automaticlly turns the "Shared Party Vision" metagame setting off when combat starts, and enables it again when combat ends. This will override that setting, so only enable if you want to use shared vision.`,
			scope: "world",
			config: true,
			type: Boolean,
			default: false,
		})

		Hooks.on("updateSetting", onUpdateSetting)
		Hooks.on("renderSettingsConfig", onRenderSettingsConfig)
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

type SettingsParamater = Parameters<typeof game.settings.register>[2]
interface SettingRegistration extends SettingsParamater {
	onChange?: (newValue: unknown) => void | Promise<void>
}

function register(key: string, data: SettingRegistration) {
	game.settings.register(MODULE_ID, key, {
		...data,
		onChange() {
			const value = game.settings.get(MODULE_ID, key)
			data.onChange?.(value)
			settings.callListener(key, value)
		},
	})
}

function onUpdateSetting(setting: { key: string }, data) {
	if (!setting.key.startsWith(MODULE_ID)) return

	const key = setting.key.split(".", 2).at(1)
	if (!key) return

	for (const m of Object.values(MODULE.modules).filter((m) => m.settingsKey === key)) {
		if (data.value === "true") {
			m.enable()
			if (m.enabled) m.onReady()
		} else if (data.value === "false") m.disable()
	}
}

function onRenderSettingsConfig(app: SettingsConfig, $html: JQuery) {
	const root = $html[0]
	const tab = root.querySelector(`.tab[data-tab="${MODULE_ID}"]`)
	if (!tab) return

	const createHeading = (settingId: string, text: string, hint?: string) => {
		const el = root.querySelector(`div[data-setting-id="${MODULE_ID}.${settingId}"]`)
		if (!el) return

		const heading = document.createElement("h3")
		heading.textContent = text
		el.before(heading)

		if (hint) {
			heading.style.marginBottom = "0"
			const text = document.createElement("p")
			text.textContent = hint
			text.style.color = "var(--color-text-dark-secondary)"
			text.style.marginTop = "0"
			el.before(text)
		}
	}

	createHeading("show-global", "Flat Check Buttons")
	createHeading("delay-combat-tracker", "Delay")
	createHeading("lifelink", "Life Link")
	createHeading("emanation-automation", "Emanation Automation")
	createHeading("script-alt-roll-breakdown", "Miscellaneous", "This stuff has no buttons‽")

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
}
