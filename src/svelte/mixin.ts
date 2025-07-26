import type {
	ApplicationConfiguration,
	ApplicationRenderContext,
	ApplicationRenderOptions,
} from "foundry-pf2e/foundry/client/applications/_types.mjs"
import type ApplicationV2 from "foundry-pf2e/foundry/client/applications/api/application.mjs"
import * as svelte from "svelte"

export function SvelteMixin<TBase extends AbstractConstructorOf<ApplicationV2>>(
	BaseApplication: TBase,
) {
	abstract class SvelteApp extends BaseApplication {
		abstract component: svelte.Component<any>

		static DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> = {
			classes: ["fc-svelte"],
		}

		async _renderHTML(context: ApplicationRenderContext, options: ApplicationRenderOptions) {
			return { props: await this.getProps() }
		}
		_replaceHTML(
			result: Awaited<ReturnType<typeof this._renderHTML>>,
			content: HTMLElement,
			options: ApplicationRenderOptions,
		): void {
			if (options.isFirstRender) {
				svelte.mount(this.component, { target: content, props: { ...result.props, shell: this } })
			}
		}

		async getProps(): Promise<svelte.ComponentProps<typeof this.component> | undefined> {
			return undefined
		}
	}

	return SvelteApp
}

export const SvelteApp = SvelteMixin(foundry.applications.api.ApplicationV2)
