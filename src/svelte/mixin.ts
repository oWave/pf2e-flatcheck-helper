import type {
	ApplicationConfiguration,
	ApplicationRenderContext,
	ApplicationRenderOptions,
} from "@7h3laughingman/foundry-types/client/applications/_types.mjs"
import * as svelte from "svelte"

export abstract class SvelteApp<
	TComponent extends svelte.Component<any> = svelte.Component<any>,
> extends foundry.applications.api.ApplicationV2 {
	abstract component: TComponent

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

	abstract getProps(): Promise<Omit<svelte.ComponentProps<TComponent>, "shell">>
}

export type SvelteAppProps<T extends svelte.Component<any>> = Omit<
	svelte.ComponentProps<T>,
	"shell"
>
