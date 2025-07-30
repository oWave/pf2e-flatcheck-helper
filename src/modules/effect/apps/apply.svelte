<form {onsubmit} class="p-2">
	<div class="flex flex-col">
		<strong>Origin</strong>
		<div class="flex items-center self-center">
			<img src={imgForActor(props.item.actor)}>
			<p class="grow">{props.item.actor.name}</p>
		</div>
		<strong>Apply</strong>
		<a class="content-link w-fit self-center"
			onclick={async () => { props.effect.sheet?.render(true) }}
		>
			<i class="fa-solid fa-{props.effect.type === 'effect' ? 'person-rays' : 'face-zany'}" inert></i>
			{props.effect.name}
		</a>

		<strong>To</strong>
		<div class="overflow-y-auto overflow-x-visible max-h-[270px]">
			<div class={["py-3 grid grid-cols-1", { "grid-cols-2": tokens.size > 5 }]}>
				{#each tokens.keys() as t}
				<div class="flex items-center">
					<img {...imgPropsForToken(t)} inert>
					<p class="grow overflow-hidden text-ellipsis max-w-[20ch] max-h-[48px] ml-0.5" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">{t.name}</p>
					<input type="checkbox" bind:checked={() => tokens.get(t), (v) => tokens.set(t, v ?? false)}>
				</div>
				{:else}
					<p class="text-center">No tokens</p>
				{/each}
			</div>
		</div>

		<div>
			<div class="grid auto-cols-fr grid-flow-col fc-split-buttons">
				<button
				  type="button"
				  use:tooltip={{ text: "Clear tokens", align: "center" }}
					onclick={() => tokens.clear()}
				>
					<i class="fa-solid fa-eraser text-red-600" inert></i>
				</button>
				<button
					type="button"
					disabled={props.config.type !== "emanation"}
					use:tooltip={{ text: "Add tokens in emanation", align: "center" }}
					onclick={() => {
						const origin = props.item.actor.getActiveTokens().at(0)
						if (origin && props.config.type === "emanation") addTokens(getTokensInEmanation(origin, props.config))
					}}
				>
					<i class="fa-solid fa-circle-dot" inert></i>
				</button>
				<button
					type="button"
					use:tooltip={{ text: "Add selected tokens", align: "center" }}
					onclick={() => addTokens(getSelectedTokens())}
				>
					<i class="fa-solid fa-expand" inert></i>
				</button>
				<button
					type="button"
					use:tooltip={{ text: "Add targeted tokens", align: "center" }}
					onclick={() => addTokens(getTargetedTokens())}
				>
					<i class="fa-solid fa-bullseye" inert></i>
				</button>
			</div>
		</div>

		{#if props.config.promptForDuration}
			<fieldset>
				<legend>Options</legend>
				<label class="flex items-center gap-1">
					Duration
					{#if !["unlimited", "encounter"].includes(duration.unit) }
						<input type="number" min="1" step="1" required
						  bind:value={duration.value}
							class="w-[5ch] text-right"
							transition:slide={{axis: "x", duration: 100}}
						>
					{/if}
					<select bind:value={duration.unit}>
						{#each Object.entries(CONFIG.PF2E.timeUnits) as [k,v],i}
							<option value={k}>{game.i18n.localize(v)}</option>
						{/each}
					</select>
				</label>
			</fieldset>
		{/if}
		<button class="mt-2" type="submit">
			Apply
		</button>
	</div>
</form>

<script lang="ts">
import type {
	ActorPF2e,
	ConditionPF2e,
	EffectPF2e,
	EffectSource,
	ItemPF2e,
	TokenPF2e,
} from "foundry-pf2e"
import { tooltip } from "src/guide/content/component/tooltip.svelte"
import { SvelteMap } from "svelte/reactivity"
import { slide } from "svelte/transition"
import { getSelectedTokens, getTargetedTokens, getTokensInEmanation } from "../apply"
import type { ApplyDialogData, EffectData, EffectIndex } from "../data"

interface Props extends Omit<ApplyDialogData, "effect"> {
	effect: EffectPF2e | ConditionPF2e
	tokens: TokenPF2e[]
	shell: foundry.applications.api.ApplicationV2
}
const props: Props = $props()

const tokens = new SvelteMap<TokenPF2e, boolean>(props.tokens.map((t) => [t, true]))

let duration = $state({
	unit: props.effect.system.duration.unit,
	value: props.effect.system.duration.value,
})

function imgForActor(actor: ActorPF2e) {
	return (
		actor.img ??
		actor.getActiveTokens().at(0)?.document.texture.src ??
		actor.prototypeToken.texture.src
	)
}
function imgPropsForToken(token: TokenPF2e) {
	const scale = (() => {
		const defaultRingThickness = 0.1269848
		const defaultSubjectThickness = 0.6666666
		const scaleCorrection = token.document.ring.enabled
			? 1 / (defaultRingThickness + defaultSubjectThickness)
			: 1
		return Math.max(1, token.document.texture.scaleX ?? 1) * scaleCorrection
	})()

	let style = `transform:scale(${scale});`

	if (scale > 1.2) {
		const ringPercent = 100 - Math.floor(((scale - 0.7) / scale) * 100)
		const limitPercent = 100 - Math.floor(((scale - 1.15) / scale) * 100)
		style += `mask-image: radial-gradient(circle at center, black ${ringPercent}%, rgba(0, 0, 0, 0.2) ${limitPercent}%);`
	}

	return {
		src: token.document.texture.src,
		style,
	}
}

function addTokens(add: TokenPF2e[]) {
	for (const t of add) {
		if (!tokens.has(t)) tokens.set(t, true)
	}
}

async function onsubmit(event) {
	event.preventDefault()
	if (!["effect", "condition"].includes(props.effect.type))
		throw new Error(`${props.effect.uuid} is not an effect or condition`)
	let createData = props.effect.toObject()

	if (createData.type === "effect") {
		createData.system.context = {
			origin: {
				actor: props.item.actor.uuid,
				item: props.item.uuid,
				token: null,
				rollOptions: [],
				spellcasting: null,
			},
			target: null,
			roll: null,
		}

		if (props.config.promptForDuration) Object.assign(createData.system.duration, { ...duration })
	}

	await Promise.all(
		tokens.entries().map(([token, checked]) => {
			return checked ? token.actor?.createEmbeddedDocuments("Item", [createData]) : null
		}),
	)
	props.shell.close()
}
</script>

<style>
img {
	height: 48px;
	width: 48px;
	object-fit: cover;
	object-position: 50% 0;
}

strong {
	text-align: center;
	width: 100%;

	&:not(:first-child) {
		margin-top: 0.4rem;
	}
}
</style>
