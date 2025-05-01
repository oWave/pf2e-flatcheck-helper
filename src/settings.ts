import MODULE from "src"
import { MODULE_ID } from "./constants"
import { parseHTML, translate } from "./utils"
import { FlatMessageConfigApplication } from "./modules/flat/message-config"

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
	get delayCreatesMessage() {
		return game.settings.get(MODULE_ID, "delay-create-message") as boolean
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

	get flags() {
		return SettingFlags
	},

	init() {
		register("show-global", {
			name: "pf2e-fc.settings.show-global.name",
			hint: "pf2e-fc.settings.show-global.hint",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
			requiresReload: true,
		})
		register("show", {
			name: "pf2e-fc.settings.show.name",
			hint: "pf2e-fc.settings.show.hint",
			scope: "client",
			config: true,
			default: true,
			type: Boolean,
			requiresReload: true,
		})

		register("flat-check-in-message", {
			name: "pf2e-fc.settings.flat-check-in-message.name",
			hint: "pf2e-fc.settings.flat-check-in-message.hint",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
			requiresReload: true,
			flags: {
				requiresLibwrapper: true,
			},
		})

		register("flat-check-config", {
			name: "pf2e-fc.settings.flat-check-config.name",
			hint: "",
			scope: "world",
			config: true,
			default: {},
			type: Object,
		})

		register("flat-check-targer-marker", {
			name: "pf2e-fc.settings.flat-check-targer-marker.name",
			hint: "pf2e-fc.settings.flat-check-targer-marker.hint",
			scope: "client",
			config: true,
			default: true,
			type: Boolean,
		})

		register("light-level-vis", {
			name: "pf2e-fc.settings.light-level-vis.name",
			hint: "pf2e-fc.settings.light-level-vis.hint",
			scope: "client",
			config: true,
			default: true,
			type: Boolean,
		})

		register("delay-combat-tracker", {
			name: "pf2e-fc.settings.delay-combat-tracker.name",
			hint: "pf2e-fc.settings.delay-combat-tracker.hint",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("delay-token-hud", {
			name: "pf2e-fc.settings.delay-token-hud.name",
			hint: "pf2e-fc.settings.delay-token-hud.hint",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("delay-return", {
			name: "pf2e-fc.settings.delay-return.name",
			hint: "pf2e-fc.settings.delay-return.hint",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("delay-prompt", {
			name: "pf2e-fc.settings.delay-prompt.name",
			hint: "pf2e-fc.settings.delay-prompt.hint",
			scope: "world",
			config: true,
			default: false,
			type: Boolean,
		})

		register("delay-create-message", {
			name: "pf2e-fc.settings.delay-create-message.name",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("token-hud-remove-combat-toggle", {
			name: "pf2e-fc.settings.token-hud-remove-combat-toggle.name",
			hint: "pf2e-fc.settings.token-hud-remove-combat-toggle.hint",
			scope: "world",
			config: true,
			default: false,
			type: Boolean,
		})

		register("pf2e-hud-enable", {
			name: "pf2e-fc.settings.pf2e-hud-enable.name",
			hint: "pf2e-fc.settings.pf2e-hud-enable.hint",
			scope: "world",
			config: true,
			default: false,
			type: Boolean,
		})

		register("lifelink", {
			name: "pf2e-fc.settings.lifelink.name",
			hint: "pf2e-fc.settings.lifelink.hint",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("lifelink-formular", {
			name: "pf2e-fc.settings.lifelink-formular.name",
			hint: "pf2e-fc.settings.lifelink-formular.hint",
			scope: "world",
			config: true,
			type: String,
			default: "apg",
			choices: {
				apg: "pf2e-fc.settings.lifelink-formular.choices.apg",
				plus: "pf2e-fc.settings.lifelink-formular.choices.plus",
			},
		})

		register("emanation-automation", {
			name: "pf2e-fc.settings.emanation-automation.name",
			hint: "",
			scope: "world",
			config: true,
			type: Boolean,
			default: false,
			flags: {
				requiresLibwrapper: true,
			},
		})

		register("script-alt-roll-breakdown", {
			name: "pf2e-fc.settings.script-alt-roll-breakdown.name",
			hint: "pf2e-fc.settings.script-alt-roll-breakdown.hint",
			scope: "world",
			config: true,
			type: Boolean,
			default: false,
		})

		register("script-toggle-shared-vision", {
			name: "pf2e-fc.settings.script-toggle-shared-vision.name",
			hint: "pf2e-fc.settings.script-toggle-shared-vision.hint",
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

interface SettingFlagsType {
	requiresLibwrapper?: true
}
type SettingsParamater = Parameters<typeof game.settings.register>[2]
interface SettingRegistration extends SettingsParamater {
	onChange?: (newValue: unknown) => void | Promise<void>
	flags?: SettingFlagsType
}

const SettingFlags = new Map<string, SettingFlagsType>()

function register(key: string, { flags, ...data }: SettingRegistration) {
	if (flags) SettingFlags.set(key, flags)

	game.settings.register(MODULE_ID, key, {
		...data,
		onChange() {
			const value = game.settings.get(MODULE_ID, key) as any
			data.onChange?.(value)
			settings.callListener(key, value)

			Hooks.callAll(`${MODULE_ID}.updateSetting`, { key, value })

			if (data.scope === "client") {
				onUpdateSetting({ key: `${MODULE_ID}.${key}` }, { value: value.toString() })
			}
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
		heading.textContent = translate(text)
		el.before(heading)

		if (hint) {
			heading.style.marginBottom = "0"
			const text = document.createElement("p")
			text.textContent = translate(hint)
			text.style.color = "var(--color-text-dark-secondary)"
			text.style.marginTop = "0"
			el.before(text)
		}
	}

	createHeading("show-global", "settings.headings.show-global")
	createHeading("delay-combat-tracker", "settings.headings.delay-combat-tracker")
	createHeading("lifelink", "settings.headings.lifelink")
	createHeading("emanation-automation", "settings.headings.emanation-automation")
	createHeading(
		"script-alt-roll-breakdown",
		"settings.headings.script-alt-roll-breakdown.text",
		"settings.headings.script-alt-roll-breakdown.hint",
	)

	if (!game.modules.get("lib-wrapper")?.active) {
		const settingRequiringLibwrapper = SettingFlags.entries()
			.filter(([k, v]) => v.requiresLibwrapper)
			.map(([k, v]) => k)
		for (const key of settingRequiringLibwrapper) {
			root
				.querySelector<HTMLElement>(`div.form-group[data-setting-id="${MODULE_ID}.${key}"] p.notes`)
				?.insertAdjacentHTML(
					"afterbegin",
					`<span style="color: var(--color-level-error)">Requires libwrapper. </span>`,
				)
			const input = root.querySelector<HTMLInputElement>(`input[name="${MODULE_ID}.${key}"]`)
			if (input) {
				input.title = "Requires lib-wrapper"
				input.disabled = true
				input.indeterminate = true
				input.style.cursor = "not-allowed"
			}
		}
	}

	const flatConfigButton = parseHTML(`<button type="button"><i class="fas fa-cogs"></i></button>`)
	flatConfigButton.firstChild!.addEventListener("click", () => {
		new FlatMessageConfigApplication({
			window: {
				title: translate("settings.flat-check-config.name"),
			},
		}).render(true)
	})

	const input = root.querySelector<HTMLElement>(`input[name="${MODULE_ID}.flat-check-config"]`)
	input?.parentNode?.appendChild(flatConfigButton)
	input?.remove()
}
