import { TokenPF2e } from "types/pf2e/module/canvas"
import Module from "./module"
import { MoreDialog } from "./more-dialog"

export async function rollFlatCheck(dc: number, { hidden = false, label }: { hidden: boolean; label?: string }) {
  const r = await new Roll("d20").roll()
  const degree = r.total >= dc ? "success" : "failure"
  const delta = r.total - dc
  const deltaText = delta > 0 ? `+${delta}` : delta.toString()

  const flavor = document.createElement("span")
  flavor.classList.add("flavor-text")
  flavor.innerHTML = `
  <div class="target-dc-result">
    <div class="target-dc"><span>${label ?? "Flat"} DC: ${dc}</span></div>
    <div class="result degree-of-success">
      Result: <span data-visibility="all" data-whose="self" class="${degree}">${degree.capitalize()}</span>
      <span data-whose="target">by ${deltaText}</span>
    </div>
  </div>
  `

  r.toMessage({ flavor: flavor.outerHTML }, { rollMode: hidden ? "blindroll" : "roll" })
}

export const CONDITION_DCS = {
  concealed: 5,
  hidden: 11,
  invisible: 11,
}

function dcForToken(token: TokenPF2e) {
  let dc = 0
  token.actor?.conditions.stored.forEach((c) => {
    dc = Math.max(CONDITION_DCS[c.slug] ?? 0, dc)
  })
  return dc || null
}

export async function rollForSingleTarget(target: TokenPF2e | undefined, { hidden = false }: { hidden: boolean }) {
  if (!target) return
  const dc = dcForToken(target)
  if (!dc) ui.notifications.warn("Selected target has no conditions that require a flat check")
  else rollFlatCheck(dc, { hidden })
}

export function setupFlat() {
  if (!Module.fcButtonsEnabled) return

  Hooks.on("renderSidebarTab", async (app: SidebarTab, html: HTMLCollection) => {
    if (app.tabName !== "chat") return

    const chat = html[0].querySelector("#chat-form")

    const template = await renderTemplate("modules/pf2e-flatcheck-helper/templates/buttons.hbs", {})
    const node = document.createElement("div")
    node.id = "fc-container"
    // node.style.flex = "0"
    node.innerHTML = template

    chat?.after(node)
    const $node = $(node)
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

    if (game.user?.targets?.first()?.actor?.conditions.some((c) => effectSlugs.includes(c.slug)))
      document.querySelector("#fc-button-target")?.classList.add("highlight")
    else document.querySelector("#fc-button-target")?.classList.remove("highlight")
  })
}
