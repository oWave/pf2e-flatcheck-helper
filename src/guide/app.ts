import type { ApplicationConfiguration } from "@7h3laughingman/foundry-types/client/applications/_types.mjs"
import { MODULE_ID } from "src/constants"
import { SvelteMixin } from "src/svelte/mixin"
import Guide from "./guide.svelte"

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
