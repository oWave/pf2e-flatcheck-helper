import { SvelteMixin } from "src/svelte/mixin"
import Guide from "./guide.svelte"
import type { ApplicationConfiguration } from "foundry-pf2e/foundry/client-esm/applications/_types.js"
import { MODULE_ID } from "src/constants"

export class GuideApp extends SvelteMixin(foundry.applications.api.ApplicationV2) {
	component = Guide

	static override DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
		window: {
			title: "Utility Buttons Guide",
			resizable: true,
		},
		position: {
			height: document.body.clientHeight * 0.8,
			width: document.body.clientWidth * 0.5,
		},
		id: `${MODULE_ID}.guide`,
	}
}
