import type { ApplicationConfiguration } from "@7h3laughingman/foundry-types/client/applications/_module.mjs"
import type { ItemPF2e } from "@7h3laughingman/pf2e-types"
import { MODULE_ID } from "src/constants"
import { SvelteApp, type SvelteAppProps } from "src/svelte/mixin"
import type { ComponentProps } from "svelte"
import type { EffectData } from "../data"
import Apply from "./apply.svelte"
import Config from "./config.svelte"
import Emanation from "./emanation.svelte"

type Callback = ComponentProps<EffectConfigApp["component"]>["callback"]

export class EffectConfigApp extends SvelteApp {
	component = Config

	constructor(
		private parentItem: ItemPF2e,
		private effectUuid: string,
		private callback?: Callback,
	) {
		super({ id: `${MODULE_ID}.effect.config.${parentItem.uuid}-${effectUuid}` })
	}

	async getProps() {
		return {
			parent: this.parentItem,
			effect: await fromUuid(this.effectUuid),
			callback: this.callback,
		}
	}

	static override DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
		window: {
			title: "Effect Config",
		},
	}

	static async wait(parentItem: ItemPF2e, effectUuid: string) {
		return new Promise((resolve: Callback, reject) => {
			const instance = new this(parentItem, effectUuid, resolve)
			instance.addEventListener("close", () => resolve("closed"), { once: true })
			instance.render(true)
		})
	}
}

export class ApplyEffectApp extends SvelteApp {
	component = Apply

	constructor(private inputs: SvelteAppProps<typeof Apply>) {
		super({
			id: `${MODULE_ID}.effect.apply.${inputs.item.uuid}-${inputs.effect._id}`,
			window: { title: inputs.request?.user ? "Apply Request" : "Apply Effect" },
		})
	}

	async getProps() {
		return this.inputs
	}

	static async wait(inputs: SvelteAppProps<typeof Apply>) {
		return new Promise((resolve) => {
			const app = new ApplyEffectApp(inputs)
			app.addEventListener("close", resolve)
			app.render(true)
		})
	}
}

export class EmanationApp extends SvelteApp {
	component = Emanation

	constructor(private inputs: SvelteAppProps<typeof Emanation>) {
		super({
			id: `${MODULE_ID}.effect.emanation`,
			window: { title: "Place Emanation" },
		})
	}

	async getProps() {
		return this.inputs
	}

	protected override _onClose(options: fa.ApplicationClosingOptions): void {
		// @ts-expect-error
		canvas.regions._cancelPlacement()
		super._onClose(options)
	}
}
