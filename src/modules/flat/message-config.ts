import { MODULE_ID } from "src/constants"

export class FlatMessageConfigApplication extends foundry.applications.api.HandlebarsApplicationMixin(
	foundry.applications.api.ApplicationV2,
) {
	static PARTS = {
		form: {
			template: "modules/pf2e-flatcheck-helper/templates/message-config.hbs",
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	}
	static DEFAULT_OPTIONS = {
		id: "fc-flat-check-config",
		tag: "form",
		form: {
			handler: FlatMessageConfigApplication.onSubmit,
			submitOnChange: false,
			closeOnSubmit: true,
		},
		window: {
			title: "Flat Check Config",
		},
	}

	static async onSubmit(event: SubmitEvent | Event, form: HTMLFormElement, data: FormDataExtended) {
		const ignoredCheckTypes: string[] = []
		for (const [key, checked] of Object.entries(data.object)) {
			if (!checked) ignoredCheckTypes.push(key)
		}

		game.settings.set(MODULE_ID, "flat-check-config", {
			ignoredCheckTypes,
		})
	}

	protected async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
		return {
			buttons: [{ type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" }],
			types: CHECK_TYPES.map((t) => {
				const ignored = flatMessageConfig.ignoredCheckTypes
				return {
					key: t,
					checked: !ignored.has(t),
				}
			}),
			i18n: (key: string) => {
				return game.i18n.localize(`pf2e-fc.flat-config.${key}`)
			},
		}
	}
}

const CHECK_TYPES = ["stupefied", "manipulate", "target"] as const

interface ConfigJSON {
	ignoredCheckTypes: typeof CHECK_TYPES
}

function getRawConfig() {
	return game.settings.get(MODULE_ID, "flat-check-config") as ConfigJSON
}

export const flatMessageConfig = {
	checkTypes: CHECK_TYPES,
	get ignoredCheckTypes() {
		return new Set(getRawConfig().ignoredCheckTypes)
	},
}
