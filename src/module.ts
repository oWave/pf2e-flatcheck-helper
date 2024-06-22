import { setupDelay } from "./delay"
import { setupEmanationAutomation } from "./emanation"
import { setupFlat } from "./flat"
import { setupLink } from "./life-link"

type Callback = (data: any) => void

class SocketHandler {
  #callbacks: Record<string, Callback> = {}

  init() {
    game.socket.on(`module.${Module.id}`, (data: { type: string; payload: any }) => {
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

    game.socket.emit(`module.${Module.id}`, { type, data })
    // Call function on this client as well
    this.#callbacks[type](data)
  }
}

export default class Module {
  static id = "pf2e-flatcheck-helper"
  static socketHandler = new SocketHandler()
  static get fcButtonsEnabled() {
    return (game.settings.get(this.id, "show-global") && game.settings.get(this.id, "show")) as boolean
  }
  static get delayShouldPrompt() {
    const s = game.settings.get(this.id, "delay-prompt") as boolean
    return s
  }
  static get allowReturn() {
    const s = game.settings.get(this.id, "delay-return") as boolean
    return s
  }
  static get showInCombatTracker() {
    return game.settings.get(this.id, "delay-combat-tracker") as boolean
  }
  static get showInTokenHUD() {
    return game.settings.get(this.id, "delay-token-hud") as boolean
  }
  static get removeCombatToggle() {
    return game.settings.get(this.id, "token-hud-remove-combat-toggle") as boolean
  }

  static get lifeLinkEnabled() {
    return game.settings.get(this.id, "lifelink") as boolean
  }
  static get lifeLinkVariant() {
    return game.settings.get(this.id, "lifelink-formular") as "apg" | "plus"
  }
  static get emanationAutomation() {
    return game.settings.get(this.id, "emanation-automation") as boolean
  }
}

Hooks.on("init", () => {
  game.settings.register(Module.id, "show-global", {
    name: "Enable flat check buttons",
    hint: "Global setting: Enables flat check buttons below the chat box.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    requiresReload: true,
  })
  game.settings.register(Module.id, "show", {
    name: "Show flat check buttons",
    hint: "Client setting: Turn off to hide the flat check buttons just for you.",
    scope: "client",
    config: true,
    default: true,
    type: Boolean,
    requiresReload: true,
  })

  game.settings.register(Module.id, "delay-combat-tracker", {
    name: "Show delay button in combat tracker",
    hint: "Adds delay/return buttons to the combat tracker. Will probably not work with any modules that change the combat tracker.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  })

  game.settings.register(Module.id, "delay-token-hud", {
    name: "Show delay button in token HUD",
    hint: "Adds delay/return buttons to the menu that appears when right-clicking a token",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  })

  game.settings.register(Module.id, "delay-return", {
    name: "Enable return button",
    hint: "Allows returning to initiative by pressing the delay button again.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  })

  game.settings.register(Module.id, "delay-prompt", {
    name: "Prompt for new initiative",
    hint: "Lets the user select a combatant to delay their turn after. Can still return early anytime they want.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  })

  game.settings.register(Module.id, "token-hud-remove-combat-toggle", {
    name: "Remove combat toggle from token HUD",
    hint: "Removes the 'Toggle Combat State' button for tokens in combat",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  })

  game.settings.register(Module.id, "lifelink", {
    name: "Enable life/spirit link automation buttons",
    hint: "Check the module readme for setup steps.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  })

  game.settings.register(Module.id, "lifelink-formular", {
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

  game.settings.register(Module.id, "emanation-automation", {
    name: "Enable automatic emanation effect application",
    hint: "Still experimental, may change it this works in the future. Requires libwrapper.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  })

  Module.socketHandler.init()

  setupDelay()
  setupFlat()
  setupLink()
})

Hooks.on("ready", () => {
  setupEmanationAutomation()
})

Hooks.on("renderSettingsConfig", (app: SettingsConfig, $html: JQuery) => {
  const root = $html[0]
  const tab = root.querySelector(`.tab[data-tab="${Module.id}"]`)
  if (!tab) return

  const createHeading = (settingId: string, text: string) => {
    const el = root.querySelector(`div[data-setting-id="${Module.id}.${settingId}"]`)
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
    const input = root.querySelector<HTMLInputElement>('input[name="pf2e-flatcheck-helper.emanation-automation"]')!
    input.title = "Requires lib-wrapper"
    input.disabled = true
    input.checked = false
    input.style.cursor = "not-allowed"
  }
})
