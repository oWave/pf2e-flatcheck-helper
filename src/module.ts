import { moveAfter, setup } from "./delay"
import { CONDITION_DCS, rollFlatCheck, rollForSingleTarget } from "./flat"
import { MoreDialog } from "./more-dialog"

export default class Module {
  static id = "pf2e-flatcheck-helper"
  static _socket: SocketlibSocket | null = null
  static get socket() {
    if (!this._socket) throw new Error("Socket not ready")
    return this._socket
  }
}

Hooks.on("socketlib.ready", () => {
  const s = socketlib.registerModule(Module.id)
  s.register("delay", moveAfter)
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

  setup()
})

Hooks.on("renderSidebarTab", async (app: SidebarTab, html: HTMLCollection) => {
  if (app.tabName !== "chat") return
  if (!game.settings.get(Module.id, "show")) return

  const chat = html[0].querySelector("#chat-form")

  const template = await renderTemplate("modules/pf2e-flatcheck-helper/templates/buttons.hbs", {})
  const node = document.createElement("div")
  node.id = "fc-container"
  // node.style.flex = "0"
  node.innerHTML = template

  chat?.after(node)
  const $node = $(node)
  // @ts-expect-error jquery
  $node.find(".tooltip").tooltipster({
    contentAsHTML: true,
  })

  node.querySelectorAll("button").forEach((button) =>
    button.addEventListener("click", function (e) {
      const value = this.dataset.dc
      if (!value) throw new Error("Bad button DC value " + value)
      const hidden = e.ctrlKey

      if (value === "targets") {
        if (game.user?.targets.size == 0) return ui.notifications.warn("No targets selected")
        if (game.user?.targets.size == 1) return rollForSingleTarget(game.user.targets.first(), { hidden })
        else return ui.notifications.warn("Too many targets")
      } else if (value === "more") {
        new MoreDialog().render(true)
      } else {
        const dc = Number(value)
        if (Number.isNaN(dc)) throw new Error("Bad button DC value " + value)

        rollFlatCheck(dc, { hidden })
      }
    })
  )
})

Hooks.on("targetToken", (user) => {
  if (user.id !== game.user?.id) return
  if (game.user.targets.size !== 1) return document.querySelector("#fc-button-target")?.classList.remove("highlight")
  const effectSlugs = Object.keys(CONDITION_DCS)

  if (
    game.user?.targets
      ?.first()
      // @ts-expect-error pf2e
      ?.actor?.conditions.some((c) => effectSlugs.includes(c.slug))
  )
    document.querySelector("#fc-button-target")?.classList.add("highlight")
  else document.querySelector("#fc-button-target")?.classList.remove("highlight")
})
