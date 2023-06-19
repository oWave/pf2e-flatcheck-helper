import { rollFlatCheck, rollForSingleTarget } from "./flat"

Hooks.on("init", () => {
  game.settings.register("pf2e-fc", "show", {
    name: "Enable flat check buttons",
    hint: "Toggle visibility of buttons below the chat box.",
    scope: "client",
    config: true,
    default: true,
    type: Boolean,
    requiresReload: true
  })
})

Hooks.on(
  "renderSidebarTab",
  async (app: SidebarTab, html: HTMLCollection) => {
    if (app.tabName !== "chat") return
    if (!game.settings.get("pf2e-fc", "show")) return

    const chat = html[0].querySelector("#chat-form")

    const template = await renderTemplate(
      "modules/pf2e-fc/templates/buttons.hbs",
      {}
    )
    const node = document.createElement("div")
    node.style.flex = "0"
    node.innerHTML = template

    chat?.after(node)

    node.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", function () {
        const value = this.dataset.dc
        if (!value) throw new Error("Bad button DC value " + value)

        if (value === "targets") {
          if (game.user?.targets.size == 0) return ui.notifications.warn("No targets selected")
          if (game.user?.targets.size == 1) return rollForSingleTarget(game.user.targets.first())
          else return ui.notifications.warn("Too many targets")
        } else if (value === "custom") {
          new Dialog({
            title: "Enter custom DC",
            content: `<strong>DC:</strong> <input id="dc" type="number" autofocus style="width: 50px;" value="10" min="1" max="20">`,
            buttons: {
              ok: { label: "Roll", callback: (html) => {
                const dc = parseInt((html as JQuery).find<HTMLFormElement>("#dc")[0].value)
                if (!Number.isNaN(dc)) rollFlatCheck(dc)
              }},
              cancel: { label: "Cancel", callback: () => {return} }
            },
            default: "ok"
          }).render(true)
        } else {
          const dc = Number(value)
          if (Number.isNaN(dc))
            throw new Error("Bad button DC value " + value)

          rollFlatCheck(dc)
        }
      })
    )
  }
)
