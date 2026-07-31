<form {onsubmit} class="p-2 flex flex-col gap-1">
	<div class="flex items-center">
		<img src={p.effect.img} class="h-8 pr-1">
		<p class="grow">{p.effect.name}</p>
		<button type="button" use:tooltip={{ text: "Reset effect config", align: "center" }} onclick={reset}>
			<i class="fa-solid fa-rotate-left"></i>
		</button>
	</div>

	<fieldset>
		<legend use:tooltip={{ text: "The apply dialog will start with the tokens matching the selection below already listed" }}>Auto-Apply To <i class="fa-solid fa-circle-info"></i></legend>
		<div class="grid auto-cols-fr grid-flow-col fc-split-buttons">
			{#snippet button(type, icon, disabled = false, text = "")}
				<button
					type="button"
				  class={[{"active": data.autoApply.type == type}, "flex-1 px-2 flex-col h-fit"]}
					onclick={() => { data.autoApply.type = type }}
					disabled={disabled}
					use:tooltip={{text, align: "center"}}
				>
					<i class="fa-solid {icon} text-base"></i>
					{type ?? "manual"}
				</button>
			{/snippet}

			{@render button(null, "fa-xmark")}
			{@render button("emanation", "fa-circle-dot")}
			{@render button("selected", "fa-expand")}
			{@render button("targets", "fa-bullseye")}
		</div>
	</fieldset>

	<fieldset transition:slide={{ duration: 200 }}>
		<legend>Emanation Affects</legend>
		<div class="grid auto-cols-fr grid-flow-col gap-2">
			<div class="flex flex-col">
				<label>
					<input type="checkbox" bind:checked={data.emanation.affects.allies}>
					Allies
				</label>
				<label>
					<input type="checkbox" bind:checked={data.emanation.affects.includeSelf} disabled={!data.emanation.affects.allies}>
					Include Self
				</label>
			</div>

			<label class="self-start">
				<input type="checkbox" bind:checked={data.emanation.affects.enemies}>
				Enemies
			</label>
		</div>
		<div class="flex items-center">
				Range

				<div class="max-w-25 px-1">
					<NumberInput min={5} step={5} bind:value={data.emanation.radius}></NumberInput>
				</div>

				ft
		</div>
	</fieldset>


	<fieldset>
		<legend>Options</legend>
		<div class="grid auto-cols-fr grid-flow-col gap-2">
			<label>
				<input type="checkbox" bind:checked={data.promptForDuration}>
				{#if p.effect.type === "condition"}
					Apply condition with duration
				{:else}
					Allow changing effect duration
				{/if}
			</label>
		</div>
	</fieldset>

	<button type="submit" class="mx-1">
		Save
	</button>
</form>

<script lang="ts">
import { type ItemPF2e } from "@7h3laughingman/pf2e-types"
import { tooltip } from "src/guide/content/component/tooltip.svelte"
import NumberInput from "src/svelte/components/number-input.svelte"
import { untrack } from "svelte"
import { slide } from "svelte/transition"
import {
	clearConfigOnItem,
	dataFromItem,
	defaultDataForItem,
	type EffectButtonConfig,
	type EffectIndex,
	saveConfigToItem,
} from "../data"

interface Props {
	parent: ItemPF2e
	effect: EffectIndex
	shell: foundry.applications.api.ApplicationV2
	callback: (result: EffectButtonConfig | "closed") => void
}
const _reactiveProps: Props = $props()
const p: Props = untrack(() => _reactiveProps)

let data = $state(dataFromItem(p.parent, p.effect))

async function onsubmit(event: SubmitEvent) {
	event.preventDefault()
	await saveConfigToItem(p.parent, p.effect, data)
	p.callback(data)
	p.shell.close()
}

async function reset(event: Event) {
	event.preventDefault()
	await clearConfigOnItem(p.parent, p.effect)
	p.callback(defaultDataForItem(p.parent))
	p.shell.close()
}
</script>

<style>
	label {
		display: flex;
		align-items: center;
	}
</style>
