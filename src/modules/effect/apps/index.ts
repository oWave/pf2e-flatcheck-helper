import type { ItemPF2e } from "foundry-pf2e"
import type { ApplicationConfiguration } from "foundry-pf2e/foundry/client/applications/_types.mjs"
import { MODULE_ID } from "src/constants"
import { SvelteApp, SvelteMixin } from "src/svelte/mixin"
import type { ComponentProps } from "svelte"
import Apply from "./apply.svelte"
import Config from "./config.svelte"

export class EffectConfigApp extends SvelteMixin(foundry.applications.api.ApplicationV2) {
	component = Config

	constructor(
		private parentItem: ItemPF2e,
		private effectUuid: string,
	) {
		super({ id: `${MODULE_ID}.effect.config.${parentItem.uuid}-${effectUuid}` })
	}

	async getProps() {
		return {
			parent: this.parentItem,
			effect: await fromUuid(this.effectUuid),
		}
	}

	static override DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
		window: {
			title: "Effect Config",
		},
	}
}

export interface ApplyInputs extends Omit<ComponentProps<typeof Apply>, "shell"> {}

export class ApplyEffectApp extends SvelteApp {
	component = Apply

	constructor(private inputs: ApplyInputs) {
		super({
			id: `${MODULE_ID}.effect.apply.${inputs.item.uuid}-${inputs.effect._id}`,
			window: { title: inputs.request?.user ? "Apply Request" : "Apply Effect" },
		})
	}

	async getProps() {
		return this.inputs
	}

	static async wait(inputs: ApplyInputs) {
		return new Promise((resolve) => {
			const app = new ApplyEffectApp(inputs)
			app.addEventListener("close", resolve)
			app.render(true)
		})
	}
}
