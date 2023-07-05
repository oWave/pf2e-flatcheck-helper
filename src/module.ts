import { moveAfter, setupDelay } from "./delay"
import { setupFlat } from "./flat"

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
  static get delayEnabled() {
    return game.settings.get(this.id, "delay") as Boolean
  }
  static get delayShouldPrompt() {
    const s = game.settings.get(this.id, "delay-prompt") as Boolean
    if (s && !this._socket) {
      ui.notifications.error(
        "socketlib module is required for moving initiative. Or disable prompt option in pf2e Utility Buttons settings"
      )
      return false
    }
    return s
  }
  static get allowReturn() {
    const s = game.settings.get(this.id, "delay-return") as Boolean
    if (s && !this._socket) {
      ui.notifications.error(
        "socketlib module is required for moving initiative. Or disable return button in pf2e Utility Buttons settings"
      )
      return false
    }
    return s
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

  game.settings.register(Module.id, "delay", {
    name: "Enable delay button",
    hint: "Shows a delay button in the combat tracker.",
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

  setupDelay()
  setupFlat()
})
