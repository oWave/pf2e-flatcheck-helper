<div class="p-2">
  {#if appState.state === "apply"}
    <form {onsubmit} transition:slide={{ duration: 200 }}>
      <div class="flex flex-col">
        {#if context.requester}
          <p class="text-center">Request from {context.requester.name}</p>
        {/if}

        <div class="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <strong class="col-2">Origin</strong>
          <DropdownButton
            parent={shell.element}
            chevron="right"
            class="justify-self-start size-fit p-0"
          >
            {#if context.origin}
              <DropdownItem onclick={() => context.panToOrigin()}>
                <i class="fa-solid fa-arrows-to-circle mr-1"></i>
                Select and pan to {context.origin.name}
              </DropdownItem>
            {/if}
            {@const selectedToken = fvtt.controlled.current.length === 1 ? fvtt.controlled.current[0] : null}
            {@const sameToken = selectedToken != null && selectedToken.document == context.origin}
            <DropdownItem
              onclick={() => context.setOriginToken()}
              disabled={selectedToken == null || sameToken}
            >
              <i class="fa-solid fa-user mr-1"></i>
              {#if sameToken}
                Select a different token to change origin
              {:else if selectedToken}
                Set selected token ({selectedToken.name}) as origin
              {:else}
                Select one token to change origin
              {/if}
            </DropdownItem>
          </DropdownButton>
        </div>

        <div class="flex items-center self-center col-2">
          {#if context.origin?.actor}
            <img src={imgForActor(context.origin.actor)}>
            <div class="grow grid grid-rows-[1fr_auto_1fr]">
              <span class="row-2">{context.origin.name}</span>
              <span class="row-3 text-xs mt-1">{
                context.origin.actor.alliance ?? 'neutral'
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
            onclick={async () => { context.effect.sheet?.render(true) }}
          >
            <i
              class="fa-solid fa-{context.effect.type === 'effect' ? 'person-rays' : 'face-zany'}"
              inert
            ></i>
            {context.effect.name} {context.badge}
          </a>
          <button
            class="col-3 h-full min-h-auto w-10 p-0"
            type="button"
            onclick={() => context.openConfig()}
          >
            <i class="fa-solid fa-gear" inert></i>
          </button>
        </div>

        <strong>To</strong>
        <div class={[orderedEntries.length > 8 && "max-h-70 overflow-y-auto overflow-x-clip", "min-w-80"]}>
          <div class="py-3 columns-2 gap-1 *:mb-1">
            <div class="sticky top-0 z-10 flex p-px bg-border rounded-md">
              <DropdownButton
                parent={shell.element}
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
                  <DropdownItem onclick={() => context.removeAll()}>
                    <i class="fa-solid fa-trash mr-1"></i>
                    All
                  </DropdownItem>
                  <DropdownItem
                    onclick={() => context.removeByAlliance("allies")}
                  >
                    <AllianceIndicator type="ally" class="mr-1" />
                    Allies
                  </DropdownItem>
                  <DropdownItem
                    onclick={() => context.removeByAlliance("enemies")}
                  >
                    <AllianceIndicator type="enemy" class="mr-1" />
                    Enemies
                  </DropdownItem>
                </DropdownMenu.Group>
              </DropdownButton>
              <DropdownButton
                parent={shell.element}
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
                  <DropdownItem onclick={() => context.addTargets()}>
                    <i class="fa-solid fa-bullseye mr-1"></i>
                    Targets
                  </DropdownItem>
                  <DropdownItem onclick={() => context.addSelected()}>
                    <i class="fa-solid fa-expand mr-1"></i>
                    Selected
                  </DropdownItem>
                  <DropdownMenu.Separator class="bg-border h-px w-full my-1" />
                  <DropdownMenu.Group>
                    <DropdownMenu.GroupHeading class="text-center">
                      Emanation
                    </DropdownMenu.GroupHeading>
                    {#if context.hasEmanationConfig}
                      <DropdownItem onclick={() => context.addEmanationAuto()}>
                        <i class="fa-solid fa-circle-plus mr-1"></i>
                        <span class="max-w-[20ch]">
                          Allies/Enemies/All within {
                            context.config.emanation.radius
                          } ft of origin
                        </span>
                      </DropdownItem>
                      <DropdownItem onclick={() => context.addEmanationPlace()}>
                        <i class="fa-solid fa-solic fa-circle-dot mr-1"></i>
                        Place
                      </DropdownItem>
                    {/if}
                    <DropdownItem onclick={() => context.openConfig()}>
                      <i class="fa-solid fa-gear mr-1"></i>
                      Configure Emanation
                    </DropdownItem>
                  </DropdownMenu.Group>
                </DropdownMenu.Group>
              </DropdownButton>
            </div>

            {#each orderedEntries as entry (entry.token)}
              <label
                class="
                  relative flex items-center cursor-pointer select-none
                  pr-1
                  hover:bg-highlight
                  rounded-md border border-border
                  has-checked:border-active has-checked:bg-active/20 dark:has-checked:bg-active/10
                "
                use:tokenHover={{ token: entry.token }}
              >
                <TokenImage token={entry.token} />
                {#if entry.token.actor && context.origin?.actor}
                  <AllianceIndicator
                    origin={context.origin.actor}
                    actor={entry.token.actor}
                  />
                {/if}
                <span
                  class="ml-0.5 grow overflow-hidden text-ellipsis"
                  style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;"
                >
                  {displayName(entry.token)}
                </span>
                {#if !entry.visible}
                  <i
                    class="fa-solid fa-eye-slash text-xs opacity-75"
                    use:tooltip={{
                      text: `Not visible to ${context.requester?.name ?? "requester"}`,
                      align: "center",
                    }}
										></i>
                {/if}
                <input
                  type="checkbox"
                  class="absolute top-0 left-0 m-0 [--checkbox-size:16px] text-active"
                  bind:checked={entry.checked}
                >
              </label>
            {:else}
              <span class="w-40 inline-block text-center">
                <p>No targets</p>
              </span>
            {/each}
          </div>
        </div>

        {#if orderedEntries.length == 0}
          <div class="w-75 mx-auto space-y-2 mb-2">
            <div>
              Use the button above to add targets.
            </div>
            <div>
              You can also <button
                type="button"
                class="inline"
                onclick={() => context.openConfig()}
              >
                <i class="fa-solid fa-gear" inert></i> configure
              </button>
              this effect to start with matching tokens already in this list.
            </div>
          </div>
        {/if}

        {#if context.config.promptForDuration}
          <fieldset>
            <legend>Options</legend>
            <div class="flex items-center gap-1">
              <span class="grow">
                Duration
              </span>
              {#if !["unlimited", "encounter"].includes(context.duration.unit)}
                <NumberInput
                  bind:value={context.duration.value}
                  min={1}
                  step={1}
                  required
                  class="w-20"
                />
              {/if}
              <select bind:value={context.duration.unit} class="w-fit">
                {#each Object.entries(CONFIG.PF2E.timeUnits) as [k,v], i}
                  <option value={k}>{game.i18n.localize(v)}</option>
                {/each}
              </select>
            </div>
          </fieldset>
        {/if}
        <button class="mt-2" type="submit" disabled={!context.hasTokens}>
          {context.ownsAllTokens ? "Apply" : "Request"}
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
        <svg class="size-4">
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
import type { ActorPF2e } from "@7h3laughingman/pf2e-types"
import { DropdownMenu } from "bits-ui"
import { tooltip } from "src/guide/content/component/tooltip.svelte"
import { tokenHover } from "src/svelte/actions/token-hover.svelte"
import NumberInput from "src/svelte/components/number-input.svelte"
import TokenImage from "src/svelte/components/token-image.svelte"
import { fvtt } from "src/svelte/foundry.svelte"
import { displayName } from "src/utils"
import { slide } from "svelte/transition"
import type { ApplyContext, TokenEntry } from "../context.svelte"
import { sendApplyRequest } from "../request"
import AllianceIndicator from "./components/alliance-indicator.svelte"
import DropdownButton from "./components/dropdown-button.svelte"
import DropdownItem from "./components/dropdown-item.svelte"

interface Props {
	context: ApplyContext
	shell: foundry.applications.api.ApplicationV2
}

const { context, shell }: Props = $props()

// order right-left right instead of top-to-bottom
const orderedEntries = $derived.by(() => {
	const left: TokenEntry[] = []
	const right: TokenEntry[] = []

	context.visibleEntries.forEach((entry, i) => {
		;(i % 2 ? left : right).push(entry)
	})

	return [...left, ...right]
})

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

async function onsubmit(event: SubmitEvent) {
	event.preventDefault()
	if (!["effect", "condition"].includes(context.effect.type))
		throw new Error(`${context.effect.uuid} is not an effect or condition`)

	if (context.ownsAllTokens) {
		await context.apply()
		shell.close()
		return
	}

	appState = { state: "request" }
	const res = await sendApplyRequest(context.toJSON())
	if (res === true) {
		appState = { state: "done" }
		setTimeout(() => shell.close(), 4000)
	} else {
		appState = { state: "error", message: res }
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
