import { rollFlatCheck } from "./flat"

const formSections: Record<
  string,
  {
    name: string
    label: string
    callback: (value: number, e: JQuery.ClickEvent) => Promise<void>
    default: () => number
    min: number
    max: number
  }
> = {
  stupefied: {
    name: "Stupefied",
    label: "Value",
    callback: async (value, e) => rollFlatCheck(5+value, {hidden: e.ctrlKey, label: "Stupefied"}),
    default: () => {
      let value = 0
      if (canvas.tokens?.controlled.length) {
        canvas.tokens.controlled.forEach(t => {
          // @ts-expect-error pf2e
          t.actor?.conditions.forEach((c) => {
            if (c.slug === "stupefied")
              value = Math.max(c.value ?? 0, value)
          })
        })
      }
      return Math.max(value, 1)
    },
    min: 1,
    max: 15
  },
  custom: {
    name: "Custom",
    label: "DC",
    callback: async (value, e) => rollFlatCheck(value, {hidden: e.ctrlKey}),
    default: () => 10,
    min: 1,
    max: 20
  },
}

export class MoreDialog extends Application {
  override get template() {
    return "modules/pf2e-flatcheck-helper/templates/more.hbs"
  }
  override get title() {
    return "More Flat Checks"
  }

  override getData() {
    return {
      sections: formSections,
    }
  }

  activateListeners(html: JQuery<HTMLElement>): void {
    Object.entries(formSections).forEach(([key, data]) => {
      html.find(`#${key}-button`).on("click", (e) => {
        const s = html.find(`#${key}-input`).val()
        const value = parseInt(s as string)
        if (Number.isNaN(value))
          ui.notifications.warn("Invalid input")
        else
          data.callback(value, e)
        this.close()
      })
    })
  }
}
