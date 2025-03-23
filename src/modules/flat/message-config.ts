import { MODULE_ID } from "src/constants"
import type { ApplicationRenderOptions } from "foundry-pf2e/foundry/client-esm/applications/_types.js"
import { translate } from "src/utils"

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
	}

	static async onSubmit(event: SubmitEvent | Event, form: HTMLFormElement, data: FormDataExtended) {
		const ignoredCheckTypes: string[] = []
		const experimentalCheckTypes: string[] = []
		for (const [key, checked] of Object.entries(data.object)) {
			if (CHECK_TYPES.includes(key as any) && !checked) {
				ignoredCheckTypes.push(key)
			}
			if (EXPERIMENTAL_CHECK_TYPES.includes(key as any) && checked) {
				experimentalCheckTypes.push(key)
			}
		}

		game.settings.set(MODULE_ID, "flat-check-config", {
			ignoredCheckTypes,
			experimentalCheckTypes,
		})
	}

	protected async _prepareContext(options: ApplicationRenderOptions): Promise<object> {
		const { ignored, experimental } = flatMessageConfig.toSets()
		return {
			buttons: [{ type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" }],
			types: [
				...CHECK_TYPES.map((t) => {
					return {
						key: t,
						checked: !ignored.has(t),
					}
				}),
				...EXPERIMENTAL_CHECK_TYPES.map((t) => {
					return {
						key: t,
						checked: experimental.has(t),
					}
				}),
			],
			i18n: (key: string) => {
				return translate(`flat-config.${key}`)
			},
		}
	}
}

const CHECK_TYPES = [
	"stupefied",
	"manipulate",
	"deafened",
	"deafened-spellcasting",
	"target",
] as const

const EXPERIMENTAL_CHECK_TYPES = ["light-level"] as const

interface ConfigJSON {
	ignoredCheckTypes: typeof CHECK_TYPES
	experimentalCheckTypes: typeof EXPERIMENTAL_CHECK_TYPES
}

function getRawConfig() {
	return game.settings.get(MODULE_ID, "flat-check-config") as ConfigJSON
}

export const flatMessageConfig = {
	checkTypes: CHECK_TYPES,
	experimentalTypes: EXPERIMENTAL_CHECK_TYPES,

	toSets() {
		const raw = getRawConfig()
		return {
			ignored: new Set(raw.ignoredCheckTypes),
			experimental: new Set(raw.experimentalCheckTypes),
		}
	},
}
