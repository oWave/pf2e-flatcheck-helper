import { moveAfter, setupDelay } from "./delay"
import { setupFlat } from "./flat"
import { setupLink } from "./life-link"

export default class Module {
  static id = "pf2e-flatcheck-helper"
  static _socket: SocketlibSocket | null = null
  static get socket() {
    if (!this._socket) throw new Error("socketlib module not enabled")
    return this._socket
  }
  static get fcButtonsEnabled() {
    return game.settings.get(this.id, "show") as Boolean
  }
  static get delayShouldPrompt() {
    const s = game.settings.get(this.id, "delay-prompt") as Boolean
    if (s && !this._socket) {
      return false
    }
    return s
  }
  static get allowReturn() {
    const s = game.settings.get(this.id, "delay-return") as Boolean
    if (s && !this._socket) {
      return false
    }
    return s
  }
  static get showInCombatTracker() {
    return game.settings.get(this.id, "delay-combat-tracker") as Boolean
  }
  static get showInTokenHUD() {
    return game.settings.get(this.id, "delay-token-hud") as Boolean
  }
  static get removeCombatToggle() {
    return game.settings.get(this.id, "token-hud-remove-combat-toggle") as Boolean
  }

  static get lifeLinkEnabled() {
    return game.settings.get(this.id, "lifelink") as Boolean
  }
  static get lifeLinkVariant() {
    return game.settings.get(this.id, "lifelink-formular") as "apg" | "plus"
  }
}

Hooks.on("socketlib.ready", () => {
  const s = socketlib.registerModule(Module.id)
  s.register("moveAfter", moveAfter)
  Module._socket = s
})

Hooks.on("init", () => {
  game.settings.register(Module.id, "show", {
    name: "Enable flat check buttons",
    hint: "Toggle visibility of buttons below the chat box.",
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
    hint: "Allows returning to initiative by pressing the delay button again. Requires socketlib.",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  })

  game.settings.register(Module.id, "delay-prompt", {
    name: "Prompt for new initiative",
    hint: "Lets the user select a combatant to delay their turn after. Can still return early anytime they want. Requires socketlib.",
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

  setupDelay()
  setupFlat()
  setupLink()
})

Hooks.on("ready", () => {
  if (
    game.user.isGM &&
    !Module._socket &&
    (game.settings.get(Module.id, "delay-return") || game.settings.get(Module.id, "delay-prompt"))
  ) {
    new Dialog({
      title: "pf2e Utility Buttons",
      content: `
        <p>The <a href="https://foundryvtt.com/packages/socketlib">socketlib</a> module is required for moving initiatives.</p>
        <p>Please install and enable socketlib, or disable "Enable return button" and "Prompt for new initiative" in the module settings.</p>
      `,
      buttons: {
        settings: {
          label: "Open settings",
          callback: () => {
            game.settings.sheet.render(true)
          },
        },
        close: {
          label: "Close",
        },
      },
      default: "close",
    }).render(true)
  }
})
