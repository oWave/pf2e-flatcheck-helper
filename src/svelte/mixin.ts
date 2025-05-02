import type {
	ApplicationConfiguration,
	ApplicationRenderContext,
	ApplicationRenderOptions,
} from "foundry-pf2e/foundry/client-esm/applications/_types.js"
import type ApplicationV2 from "foundry-pf2e/foundry/client-esm/applications/api/application.js"
import * as svelte from "svelte"

export function SvelteMixin<TBase extends AbstractConstructorOf<ApplicationV2>>(
	BaseApplication: TBase,
) {
	abstract class SvelteApp extends BaseApplication {
		abstract component: svelte.Component

		static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
			classes: ["fc-svelte"],
		}

		protected async _renderHTML(
			context: ApplicationRenderContext,
			options: ApplicationRenderOptions,
		) {
			return context
		}
		protected _replaceHTML(
			result: ApplicationRenderContext,
			content: HTMLElement,
			options: ApplicationRenderOptions,
		): void {
			if (options.isFirstRender) {
				svelte.mount(this.component, { target: content })
			}
		}
	}

	return SvelteApp
}
