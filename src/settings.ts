import type SettingsConfig from "foundry-pf2e/foundry/client/applications/settings/config.mjs"
import MODULE from "src"
import { MODULE_ID } from "./constants"
import { FlatMessageConfigApplication } from "./modules/flat/message-config"
import { parseHTML, translate } from "./utils"

type Callback = (value: unknown) => void
const listeners: Record<string, Callback> = {}

export const settings = {
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
	get flatAutoRoll() {
		const world = game.settings.get(MODULE_ID, "flat-check-auto-roll")
		if (world === "always") return true
		else if (world === "never") return false
		return game.settings.get(MODULE_ID, "flat-check-auto-roll-user") as boolean
	},
	get flatHideRoll() {
		return game.settings.get(MODULE_ID, "flat-check-hide-roll") as boolean
	},
	get flatAutoReveal() {
		return game.settings.get(MODULE_ID, "flat-check-hide-roll-auto-reveal") as boolean
	},
	get flatPlayersCanReveal() {
		return game.settings.get(MODULE_ID, "flat-check-hide-roll-players-can-reveal") as boolean
	},
	get flatTargetMarkerMode() {
		return game.settings.get(MODULE_ID, "flat-check-target-marker") as
			| "enabled"
			| "disabled"
			| "onlyWithOrigin"
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

		register("flat-check-auto-roll", {
			name: "pf2e-fc.settings.flat-check-auto-roll.name",
			hint: "pf2e-fc.settings.flat-check-auto-roll.hint",
			scope: "world",
			config: true,
			default: "user",
			choices: {
				always: "pf2e-fc.settings.flat-check-auto-roll.choices.always",
				user: "pf2e-fc.settings.flat-check-auto-roll.choices.user",
				never: "pf2e-fc.settings.flat-check-auto-roll.choices.never",
			},
			type: String,
		})

		register("flat-check-auto-roll-user", {
			name: "pf2e-fc.settings.flat-check-auto-roll-user.name",
			hint: "pf2e-fc.settings.flat-check-auto-roll-user.hint",
			scope: "user",
			config: true,
			default: false,
			type: Boolean,
		})

		register("flat-check-hide-roll", {
			name: "pf2e-fc.settings.flat-check-hide-roll.name",
			hint: "pf2e-fc.settings.flat-check-hide-roll.hint",
			scope: "world",
			config: true,
			default: false,
			type: Boolean,
		})

		register("flat-check-hide-roll-auto-reveal", {
			name: "pf2e-fc.settings.flat-check-hide-roll-auto-reveal.name",
			hint: "pf2e-fc.settings.flat-check-hide-roll-auto-reveal.hint",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
		})

		register("flat-check-hide-roll-players-can-reveal", {
			name: "pf2e-fc.settings.flat-check-hide-roll-players-can-reveal.name",
			hint: "pf2e-fc.settings.flat-check-hide-roll-players-can-reveal.hint",
			scope: "world",
			config: true,
			default: false,
			type: Boolean,
		})

		register("flat-check-target-marker", {
			name: "pf2e-fc.settings.flat-check-target-marker.name",
			hint: "pf2e-fc.settings.flat-check-target-marker.hint",
			scope: "user",
			config: true,
			default: "enabled",
			choices: {
				enabled: "pf2e-fc.settings.flat-check-target-marker.choices.enabled",
				onlyWithOrigin: "pf2e-fc.settings.flat-check-target-marker.choices.onlyWithOrigin",
				disabled: "pf2e-fc.settings.flat-check-target-marker.choices.disabled",
			},
			type: String,
		})

		register("light-level-vis", {
			name: "pf2e-fc.settings.light-level-vis.name",
			hint: "pf2e-fc.settings.light-level-vis.hint",
			scope: "user",
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

	for (const m of Object.values(MODULE.modules)) {
		if (m.settingsKey !== key) continue

		const hasSettingEnabled = m.hasSettingEnabled()
		if (hasSettingEnabled && m.enabled) {
			m.enable()
			if (m.enabled) m.onReady()
		} else if (!hasSettingEnabled && m.enabled) {
			m.disable()
		}
	}
}

function onRenderSettingsConfig(app: SettingsConfig, html: HTMLFormElement) {
	const tab = html.querySelector(`.tab[data-tab="${MODULE_ID}"]`)
	if (!tab) return

	const createHeading = (settingId: string, text: string) => {
		const label = tab.querySelector(`label[for="settings-config-${MODULE_ID}.${settingId}"]`)
		const el = label?.parentElement
		if (!el) return

		const heading = document.createElement("strong")
		heading.textContent = translate(text)
		heading.style.fontSize = "var(--font-h5-size)"
		heading.style.borderWidth = "0 0 1px 0"
		heading.style.borderColor = "var(--color-tabs-border)"
		heading.style.borderStyle = "solid"
		el.before(heading)
	}

	createHeading("flat-check-in-message", "settings.headings.flat")
	createHeading("delay-combat-tracker", "settings.headings.delay")
	createHeading("lifelink", "settings.headings.lifelink")
	createHeading("emanation-automation", "settings.headings.emanation-automation")
	createHeading("script-alt-roll-breakdown", "settings.headings.misc")

	if (!game.modules.get("lib-wrapper")?.active) {
		const settingRequiringLibwrapper = SettingFlags.entries()
			.filter(([k, v]) => v.requiresLibwrapper)
			.map(([k, v]) => k)
		for (const key of settingRequiringLibwrapper) {
			const label = tab.querySelector(`label[for="settings-config-${MODULE_ID}.${key}"]`)
			const formGroup = label?.parentElement
			formGroup
				?.querySelector<HTMLElement>("p.hint")
				?.insertAdjacentHTML(
					"afterbegin",
					`<span style="color: var(--color-level-error)">Requires libwrapper. </span>`,
				)
			const input = tab.querySelector<HTMLInputElement>(`input[name="${MODULE_ID}.${key}"]`)
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

	const input = tab.querySelector<HTMLElement>(`input[name="${MODULE_ID}.flat-check-config"]`)
	input?.parentNode?.appendChild(flatConfigButton)
	input?.remove()

	const guideButton = parseHTML(
		`<div>
		  <p>${translate("settings.docs.description")}</p>
		  <button type="button" style="width: 100%;">
			  <i class="fas fa-book"></i>
				${translate("settings.docs.button")}
			</button>
		</div>`,
	)
	guideButton.querySelector("button")?.addEventListener("click", async () => {
		const { GuideApp } = await import("./guide/app")
		new GuideApp().render(true)
	})

	tab.prepend(guideButton)
}
