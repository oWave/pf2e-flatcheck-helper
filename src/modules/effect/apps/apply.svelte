<div class="p-2">
  {#if appState.state === "apply"}
    <form {onsubmit} transition:slide={{ duration: 200 }}>
      <div class="flex flex-col">
        {#if p.request?.user}
          <p class="text-center">Request from {p.request.user.name}</p>
        {/if}

        <div class="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <strong class="col-2">Origin</strong>
          <DropdownButton
            parent={p.shell.element}
            chevron="right"
            class="justify-self-start size-fit p-0"
          >
            {#if origin}
              <DropdownItem onclick={panToOrigin}>
                <i class="fa-solid fa-arrows-to-circle"></i>
                Select and pan to {origin.name}
              </DropdownItem>
            {/if}
            <DropdownItem onclick={setOriginToken}>
              <i class="fa-solid fa-user"></i>
              Set selected token as origin
            </DropdownItem>
          </DropdownButton>
        </div>

        <div class="flex items-center self-center col-2">
          {#if origin?.actor}
            <img src={imgForActor(origin.actor)}>
            <div class="grow grid grid-rows-[1fr_auto_1fr]">
              <span class="row-2">{origin.name}</span>
              <span class="row-3 text-xs mt-1">{
                origin.actor.alliance ?? 'neutral'
              }</span>
            </div>
          {:else}
            <p class="text-red-500">Missing origin token</p>
          {/if}
        </div>

        <strong>Apply</strong>
        <div class="grid grid-cols-[1fr_auto_1fr] gap-1">
          <a
            class="content-link w-fit self-center col-2"
            onclick={async () => { p.effect.sheet?.render(true) }}
          >
            <i
              class="fa-solid fa-{p.effect.type === 'effect' ? 'person-rays' : 'face-zany'}"
              inert
            ></i>
            {p.effect.name}
          </a>
          <button
            class="col-3 h-full min-h-auto p-0"
            type="button"
            onclick={openConfig}
          >
            <i class="fa-solid fa-gear" inert></i>
          </button>
        </div>

        <strong>To</strong>
        <div class={[orderedTokens.length > 8 && "max-h-[270px] overflow-y-auto overflow-x-clip"]}>
          <div class="py-3 columns-2 gap-1 *:mb-1">
            <div class="sticky top-0 z-10 flex p-px bg-border rounded-md">
              <DropdownButton
                parent={p.shell.element}
                icon="fas fa-eraser"
                chevron="left"
                class="
                  h-full grow border-0 rounded-none
                  bg-solid hover:bg-red-500 dark:hover:bg-red-700
                  rounded-l-md pr-4
                  [clip-path:polygon(0_0,calc(100%-14px)_0,100%_100%,0_100%)]
                "
              >
                <DropdownMenu.Group>
                  <DropdownMenu.GroupHeading class="text-center">
                    Remove Tokens
                  </DropdownMenu.GroupHeading>
                  <DropdownItem onclick={removeAll}>
                    <i class="fa-solid fa-trash mr-1"></i>
                    All
                  </DropdownItem>
                  <DropdownItem onclick={() => removeAlliance("allies")}>
                    <AllianceIndicator type="ally" class="mr-1" />
                    Allies
                  </DropdownItem>
                  <DropdownItem onclick={() => removeAlliance("enemies")}>
                    <AllianceIndicator type="enemy" class="mr-1" />
                    Enemies
                  </DropdownItem>
                </DropdownMenu.Group>
              </DropdownButton>
              <DropdownButton
                parent={p.shell.element}
                icon="fas fa-plus"
                class="
                  h-full w-3/4 border-0 rounded-none
                  bg-solid hover:bg-green-500 dark:hover:bg-green-700
                  rounded-r-md pl-4 -ml-3
                  [clip-path:polygon(0_0,100%_0,100%_100%,14px_100%)]
                "
              >
                <DropdownMenu.Group>
                  <DropdownMenu.GroupHeading class="text-center">
                    Add Tokens
                  </DropdownMenu.GroupHeading>
                  <DropdownItem onclick={addTargets}>
                    <i class="fa-solid fa-bullseye mr-1"></i>
                    Targets
                  </DropdownItem>
                  <DropdownItem onclick={addSelected}>
                    <i class="fa-solid fa-expand mr-1"></i>
                    Selected
                  </DropdownItem>
                  <DropdownMenu.Separator class="bg-border h-px w-full my-1" />
                  <DropdownMenu.Group>
                    <DropdownMenu.GroupHeading class="text-center">
                      Emanation
                    </DropdownMenu.GroupHeading>
                    {#if hasEmanationConfig}
                      <DropdownItem onclick={addEmanationAuto}>
                        <i class="fa-solid fa-circle-plus mr-1"></i>
                        <span class="max-w-[20ch]">
                          Allies/Enemies/All within {config.emanation.radius} ft
                          of origin
                        </span>
                      </DropdownItem>
                      <DropdownItem onclick={addEmanationPlace}>
                        <i class="fa-solid fa-solic fa-circle-dot mr-1"></i>
                        Place
                      </DropdownItem>
                    {/if}
                    <DropdownItem onclick={openConfig}>
                      <i class="fa-solid fa-gear mr-1"></i>
                      Configure Emanation
                    </DropdownItem>
                  </DropdownMenu.Group>
                </DropdownMenu.Group>
              </DropdownButton>
            </div>

            {#each orderedTokens as t}
              <label
                class="
                  relative flex items-center cursor-pointer select-none
                  pr-1
                  hover:bg-highlight
                  rounded-md border border-border
                  has-checked:border-active has-checked:bg-active/20 dark:has-checked:bg-active/10
                "
              >
                <TokenImage token={t} />
                {#if t.actor && origin?.actor}
                  <AllianceIndicator origin={origin.actor} actor={t.actor} />
                {/if}
                <span
                  class="ml-px grow overflow-hidden text-ellipsis"
                  style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;"
                >
                  {t.name}
                </span>
                {#if unseen.has(t)}
                  <i
                    class="fa-solid fa-eye-slash text-xs opacity-75"
                    use:tooltip={{
                      text: `Not visible to ${p.request?.user.name ?? "requester"}`,
                      align: "center",
                    }}
                  ></i>
                {/if}
                <input
                  type="checkbox"
                  class="absolute top-0 left-0 m-0 [--checkbox-size:16px] text-active"
                  bind:checked={() => tokens.get(t), (t) => t ?? false}
                >
              </label>
            {:else}
              <p class="text-center">No targets</p>
            {/each}
          </div>
        </div>

        {#if config.promptForDuration || p.request?.duration != null}
          <fieldset>
            <legend>Options</legend>
            <div class="flex items-center gap-1">
              <span class="grow">
                Duration
              </span>
              {#if !["unlimited", "encounter"].includes(duration.unit)}
                <NumberInput
                  bind:value={duration.value}
                  min={1}
                  step={1}
                  required
                  class="w-20"
                />
              {/if}
              <select bind:value={duration.unit} class="w-fit">
                {#each Object.entries(CONFIG.PF2E.timeUnits) as [k,v], i}
                  <option value={k}>{game.i18n.localize(v)}</option>
                {/each}
              </select>
            </div>
          </fieldset>
        {/if}
        <button class="mt-2" type="submit" disabled={!hasTokens}>
          {ownsAllTokens ? "Apply" : "Request"}
        </button>
      </div>
    </form>
  {:else}
    <div
      transition:slide={{ duration: 200 }}
      class="flex flex-col items-center"
    >
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
            cy="8"
          />
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
} from "@7h3laughingman/pf2e-types"
import { DropdownMenu } from "bits-ui"
import { tooltip } from "src/guide/content/component/tooltip.svelte"
import NumberInput from "src/svelte/components/number-input.svelte"
import TokenImage from "src/svelte/components/token-image.svelte"
import { canEditDocuments } from "src/utils"
import { untrack } from "svelte"
import { SvelteMap, SvelteSet } from "svelte/reactivity"
import { slide } from "svelte/transition"
import {
	apply,
	getSelectedTokens,
	getTargetedTokens,
	getTokensInRegion,
	isTokenVisible,
	placeEmanationOnToken,
} from "../apply"
import { type ApplyDialogData, type Duration, dataFromItem } from "../data"
import { type RequestApplyData, sendApplyRequest } from "../request"
import { EffectConfigApp, EmanationApp } from "."
import AllianceIndicator from "./components/alliance-indicator.svelte"
import DropdownButton from "./components/dropdown-button.svelte"
import DropdownItem from "./components/dropdown-item.svelte"

interface Props extends Omit<ApplyDialogData, "effectIndex"> {
	effect: EffectPF2e | ConditionPF2e
	tokens: TokenDocumentPF2e[]
	request?: {
		user: User
		duration?: Duration
		/** Tokens the requesting user could not see when they submitted. */
		unseenTokens?: TokenDocumentPF2e[]
	}
	shell: foundry.applications.api.ApplicationV2
}

const _reactiveProps: Props = $props()
const p: Props = untrack(() => ({ ..._reactiveProps }))
let config = $state(p.config)

let origin = $state(p.item.actor.getActiveTokens().at(0)?.document)

const tokens = new SvelteMap<TokenDocumentPF2e, boolean>(p.tokens.map((t) => [t, true]))

// Visibility is snapshotted when a token enters the list, never re-evaluated.
// For a GM handling a request this is the requesting user's view, sent along with the request;
// otherwise it's our own. isTokenVisible() short-circuits for GMs, so a GM's own dialog has an empty set.
const unseen = new SvelteSet<TokenDocumentPF2e>(
	p.request ? p.request.unseenTokens : p.tokens.filter((t) => !isTokenVisible(t)),
)
// Players must not be able to infer that a token they can't see is being targeted
const isRowVisible = (t: TokenDocumentPF2e) => game.user.isGM || !unseen.has(t)
const selectedTokens = $derived(
	Array.from(
		tokens
			.entries()
			.filter(([token, checked]) => checked && token.actor)
			.map(([token, checked]) => token),
	),
)

// columns fill top-to-bottom, but displaying right-left-right is more intuitive
const orderedTokens = $derived.by(() => {
	const left: TokenDocumentPF2e[] = []
	const right: TokenDocumentPF2e[] = []
	let i = 0
	// filter before splitting, otherwise hidden rows leave gaps in the columns
	for (const t of tokens.keys().filter(isRowVisible)) {
		;(i % 2 ? left : right).push(t)
		i++
	}

	return [...left, ...right]
})
const hasTokens = $derived(!!selectedTokens.length)
// const ownsAllTokens = $derived(canEditDocuments(selectedTokens))
const ownsAllTokens = !!p.request?.user

const hasEmanationConfig = $derived(
	config.emanation.radius && (config.emanation.affects.allies || config.emanation.affects.enemies),
)

let duration = $state(
	p.request?.duration ?? {
		unit: p.effect.system.duration.unit,
		value: p.effect.system.duration.value,
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

function addTokens(add: TokenDocumentPF2e[]) {
	for (const t of add) {
		if (tokens.has(t)) continue
		tokens.set(t, true)
		if (!isTokenVisible(t)) unseen.add(t)
	}
}

async function onsubmit(event: SubmitEvent) {
	event.preventDefault()
	if (!["effect", "condition"].includes(p.effect.type))
		throw new Error(`${p.effect.uuid} is not an effect or condition`)

	const needsRequest = !ownsAllTokens

	if (!needsRequest) {
		await apply({
			tokens: selectedTokens,
			parent: p.item,
			effect: p.effect,
			duration: config.promptForDuration ? duration : undefined,
		})

		p.shell.close()
	} else {
		const request: RequestApplyData = {
			user: game.user.id,
			item: p.item.uuid,
			effect: p.effect.uuid,
			tokens: Array.from(selectedTokens.map((token) => token.uuid)),
			unseenTokens: selectedTokens.filter((t) => unseen.has(t)).map((t) => t.uuid),
		}

		if (config.promptForDuration)
			request.overrides = Object.assign(request.overrides ?? {}, { duration })

		appState = { state: "request" }
		const res = await sendApplyRequest(request)
		if (res === true) {
			appState = { state: "done" }
			setTimeout(() => p.shell.close(), 4000)
		} else {
			appState = { state: "error", message: res }
		}
	}
}

async function openConfig() {
	const data = await EffectConfigApp.wait(p.item, p.effect.uuid)
	if (data !== "closed") config = data
}

function panToOrigin() {
	origin?.object?.control()
	const center = origin?.object?.center
	canvas.animatePan(center)
}

function setOriginToken() {
	const token = canvas.tokens.controlled.at(0)
	if (token) origin = token.document
}

function emanationButton() {
	if (!hasEmanationConfig) {
		openConfig()
		return
	}
}

function addSelected() {
	const tokens = getSelectedTokens()
	addTokens(tokens)
}

function addTargets() {
	const tokens = getTargetedTokens()
	addTokens(tokens)
}

function addEmanationAuto() {
	if (!origin) return

	const r = placeEmanationOnToken(origin, config)
	if (!r) return
	const t = getTokensInRegion(r, config)
	addTokens(t)
}

function addEmanationPlace() {
	new EmanationApp({
		radius: config.emanation.radius,
		base: origin?.height ?? 1,
		callback: (r) => {
			const t = getTokensInRegion(r, config)
			addTokens(t)
		},
	}).render(true)
}

function removeAll() {
	tokens.clear()
}

function removeAlliance(type: "allies" | "enemies") {
	if (!origin?.actor) return

	for (const t of tokens.keys()) {
		if (!t.actor) continue

		if (
			(type === "enemies" && t.actor.isEnemyOf(origin.actor)) ||
			(type === "allies" && t.actor.isAllyOf(origin.actor))
		) {
			tokens.delete(t)
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
