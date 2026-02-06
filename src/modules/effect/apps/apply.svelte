<div class="p-2">
	{#if appState.state === "apply"}
		<form {onsubmit} transition:slide={{ duration: 200 }}>
		<div class="flex flex-col">
			{#if props.request?.user}
				<p class="text-center">Request from {props.request.user.name}</p>
			{/if}
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
				<div class={["py-3 grid token-grid"]} style="--token-col-count: { tokens.size > 5 ? 2 : 1 }; --token-col-max: { tokens.size > 5 ? "200px" : "300px" }">
					{#each tokens.keys() as t}
					<div class="flex items-center">
						<img {...imgPropsForToken(t)} inert>
						<p class="grow overflow-hidden text-ellipsis max-h-[48px] ml-0.5" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">{t.name}</p>
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
							const origin = props.item.actor.getActiveTokens().at(0)?.document
							if (origin && props.config.type === "emanation") addTokens(getTokensInEmanation(origin, props.config))
						}}
					>
						<i class="fa-solid fa-circle-dot" inert></i>
						{#if props.config.type === "emanation"}
							<span class="opacity-80">
								{props.config.emanation.range} ft
							</span>
						{/if}
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

			{#if props.config.promptForDuration || props.request?.duration != null}
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
			<button class="mt-2" type="submit" disabled={!hasTokens}>
				{ ownsAllTokens ? "Apply" : "Request" }
			</button>
		</div>
		</form>
	{:else}
		<div transition:slide={{ duration: 200 }} class="flex flex-col items-center">
			{#if appState.state === "request"}
				<p>Waiting for GM</p>
				<span class="spinner"></span>
			{:else if appState.state === "done"}
				<p><i class="fas fa-check"></i> Applied</p>
				<svg class="w-[16px] h-[16px]">
					<circle
						id="timer-circle"
						class="text-green-500"
						stroke-width="2"
						stroke-linecap="round"
						stroke="currentColor"
						fill="transparent"
						r="7"
						cx="8"
						cy="8" />
				</svg>
			{:else if appState.state === "error"}
				<p>{appState.message}</p>
			{/if}
		</div>
	{/if}
</div>

<script lang="ts">
import {
	type ActorPF2e,
	type ConditionPF2e,
	type EffectPF2e,
	type TokenDocumentPF2e,
} from "foundry-pf2e"
import { tooltip } from "src/guide/content/component/tooltip.svelte"
import { canEditDocuments } from "src/utils"
import { SvelteMap } from "svelte/reactivity"
import { slide } from "svelte/transition"
import { apply, getSelectedTokens, getTargetedTokens, getTokensInEmanation } from "../apply"
import type { ApplyDialogData, Duration } from "../data"
import { type RequestApplyData, sendApplyRequest } from "../request"

interface Props extends Omit<ApplyDialogData, "effectIndex"> {
	effect: EffectPF2e | ConditionPF2e
	tokens: TokenDocumentPF2e[]
	request?: {
		user: User
		duration?: Duration
	}
	shell: foundry.applications.api.ApplicationV2
}
const props: Props = $props()

const tokens = new SvelteMap<TokenDocumentPF2e, boolean>(props.tokens.map((t) => [t, true]))
const selectedTokens = $derived(
	Array.from(
		tokens
			.entries()
			.filter(([token, checked]) => checked && token.actor)
			.map(([token, checked]) => token),
	),
)
const hasTokens = $derived(!!selectedTokens.length)
// const ownsAllTokens = $derived(canEditDocuments(selectedTokens))
const ownsAllTokens = !!props.request?.user

let duration = $state(
	props.request?.duration ?? {
		unit: props.effect.system.duration.unit,
		value: props.effect.system.duration.value,
	},
)

type State =
	| { state: "apply"; loading: boolean }
	| { state: "request" }
	| { state: "error"; message: string }
	| { state: "done" }

let appState = $state<State>({ state: "apply", loading: false })

function imgForActor(actor: ActorPF2e) {
	return (
		actor.img ??
		actor.getActiveTokens().at(0)?.document.texture.src ??
		actor.prototypeToken.texture.src
	)
}
function imgPropsForToken(token: TokenDocumentPF2e) {
	const scale = (() => {
		const defaultRingThickness = 0.1269848
		const defaultSubjectThickness = 0.6666666
		const scaleCorrection = token.ring.enabled
			? 1 / (defaultRingThickness + defaultSubjectThickness)
			: 1
		return Math.max(1, token.texture.scaleX ?? 1) * scaleCorrection
	})()

	let style = `transform:scale(${scale});`

	if (scale > 1.2) {
		const ringPercent = 100 - Math.floor(((scale - 0.7) / scale) * 100)
		const limitPercent = 100 - Math.floor(((scale - 1.15) / scale) * 100)
		style += `mask-image: radial-gradient(circle at center, black ${ringPercent}%, rgba(0, 0, 0, 0.2) ${limitPercent}%);`
	}

	return {
		src: token.texture.src,
		style,
	}
}

function addTokens(add: TokenDocumentPF2e[]) {
	for (const t of add) {
		if (!tokens.has(t)) tokens.set(t, true)
	}
}

async function onsubmit(event: SubmitEvent) {
	event.preventDefault()
	if (!["effect", "condition"].includes(props.effect.type))
		throw new Error(`${props.effect.uuid} is not an effect or condition`)

	const needsRequest = !ownsAllTokens

	if (!needsRequest) {
		await apply({
			tokens: selectedTokens,
			parent: props.item,
			effect: props.effect,
			duration: props.config.promptForDuration ? duration : undefined,
		})

		props.shell.close()
	} else {
		const request: RequestApplyData = {
			user: game.user.id,
			item: props.item.uuid,
			effect: props.effect.uuid,
			tokens: Array.from(selectedTokens.map((token) => token.uuid)),
		}

		if (props.config.promptForDuration)
			request.overrides = Object.assign(request.overrides ?? {}, { duration })

		appState = { state: "request" }
		const res = await sendApplyRequest(request)
		if (res === true) {
			appState = { state: "done" }
			setTimeout(() => props.shell.close(), 4000)
		} else {
			appState = { state: "error", message: res }
		}
	}
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

.token-grid {
	grid-template-columns: repeat(var(--token-col-count), minmax(0, var(--token-col-max)));
}

@keyframes countdown {
		from {
				stroke-dashoffset: 0;
		}
		to {
				/* 2 * PI * r */
				stroke-dashoffset: 44;
		}
}

#timer-circle {
	stroke-dasharray: 44;
	stroke-dashoffset: 0;
	transform-origin: 50% 50%;
	transform: rotate(-90deg);

	animation: countdown 4s linear forwards;
}
</style>
