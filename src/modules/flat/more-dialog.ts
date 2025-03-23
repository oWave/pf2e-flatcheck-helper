import { translate } from "src/utils"
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
		name: "pf2e-fc.flat.more-dialog.stupefied",
		label: "pf2e-fc.flat.more-dialog.value",
		callback: async (value, e) => {
			rollFlatCheck(5 + value, { hidden: e.ctrlKey, label: translate("flat.more-dialog.stupefied") })
		},
		default: () => {
			let value = 0
			if (canvas.tokens?.controlled.length) {
				canvas.tokens.controlled.forEach((t) => {
					const conditions = t.actor?.conditions
					if (conditions?.stupefied?.value) value = Math.max(conditions.stupefied.value, value)
				})
			}
			return Math.max(value, 1)
		},
		min: 1,
		max: 15,
	},
	custom: {
		name: "pf2e-fc.flat.more-dialog.custom",
		label: "pf2e-fc.flat.more-dialog.dc",
		callback: async (value, e) => {
			rollFlatCheck(value, { hidden: e.ctrlKey })
		},
		default: () => 10,
		min: 1,
		max: 20,
	},
}

export class MoreDialog extends Application {
	override get template() {
		return "modules/pf2e-flatcheck-helper/templates/more.hbs"
	}
	override get title() {
		return translate("flat.more-dialog.title")
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
				const value = Number.parseInt(s as string)
				if (Number.isNaN(value)) ui.notifications.warn(translate("flat.more-dialog.error-invalid-input"))
				else data.callback(value, e)
				this.close()
			})
		})
	}
}
