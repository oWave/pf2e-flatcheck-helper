import type { ItemPF2e } from "foundry-pf2e"
import type { ApplicationConfiguration } from "foundry-pf2e/foundry/client/applications/_types.mjs"
import { MODULE_ID } from "src/constants"
import { SvelteApp, SvelteMixin } from "src/svelte/mixin"
import type { ComponentProps } from "svelte"
import { collectTokens } from "../apply"
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

export class ApplyEffectApp extends SvelteApp {
	component = Apply

	constructor(
		private inputs: Omit<ComponentProps<typeof Apply>, "tokens" | "shell" | "effect"> & {
			effectUuid: string
		},
	) {
		super({ id: `${MODULE_ID}.effect.apply.${inputs.item.uuid}-${inputs.effectUuid}` })
	}

	async getProps() {
		const originToken = this.inputs.item.actor?.getActiveTokens().at(0)
		if (!originToken) {
			throw new Error(`Origin actor ${this.inputs.item.actor?.name} has no tokens`)
		}
		return {
			...this.inputs,
			tokens: collectTokens(this.inputs.config, originToken),
			effect: await fromUuid(this.inputs.effectUuid),
		}
	}

	static override DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
		window: {
			title: "Apply Effect",
		},
	}
}
