import type { CombatantPF2e } from "foundry-pf2e"
import type { ApplicationConfiguration } from "foundry-pf2e/foundry/client/applications/_types.mjs"
import { MODULE_ID } from "src/constants"
import { SvelteMixin } from "src/svelte/mixin"
import { translate } from "src/utils"
import Prompt from "./prompt.svelte"

export class DelayPromptDialog extends SvelteMixin(foundry.applications.api.ApplicationV2) {
	component = Prompt

	constructor(private combatant: CombatantPF2e) {
		super({ id: `${MODULE_ID}.delay.prompt` })
	}

	async getProps() {
		return {
			combatant: this.combatant,
		}
	}

	static override DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
		window: {
			title: translate("delay.delay"),
		},
	}
}
