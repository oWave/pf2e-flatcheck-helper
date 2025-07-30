<form {onsubmit} class="p-2 flex flex-col gap-1">
	<div class="flex items-center">
		<img src={props.effect.img} class="h-8 pr-1">
		<p class="grow">{props.effect.name}</p>
		<button type="button" use:tooltip={{ text: "Reset effect config", align: "center" }} onclick={reset}>
			<i class="fa-solid fa-trash"></i>
		</button>
	</div>

	<fieldset>
		<legend>Apply To</legend>
		<div class="grid auto-cols-fr grid-flow-col ui-control split-button">
			{#snippet button(type, icon, disabled = false, text = "")}
				<button
					type="button"
				  class={[{"active": data.type == type}, "flex-1 px-2 flex-col h-fit"]}
					onclick={() => { data.type = type }}
					disabled={disabled}
					use:tooltip={{text, align: "center"}}
				>
					<i class="fa-solid {icon} text-base"></i>
					{type}
				</button>
			{/snippet}

			{@render button("emanation", "fa-circle-dot")}
			{@render button("selected", "fa-expand")}
			{@render button("targets", "fa-bullseye")}
		</div>
	</fieldset>
	{#if data.type === "emanation"}
		<fieldset transition:slide={{ duration: 200 }}>
			<legend>Emanation Affects</legend>
			<div class="grid auto-cols-fr grid-flow-col gap-2">
				<div class="flex flex-col">
					<label>
						<input type="checkbox" bind:checked={data.emanation.affects.allies}>
						Allies
					</label>
					<label>
						<input type="checkbox" bind:checked={data.emanation.affects.excludeSelf} disabled={!data.emanation.affects.allies}>
						Exclude Self
					</label>
				</div>

				<label class="self-start">
					<input type="checkbox" bind:checked={data.emanation.affects.enemies}>
					Enemies
				</label>
			</div>
			<div class="flex flex-col items-center">
				<label>
					Range
					<input type="number" min="5" step="5" required bind:value={data.emanation.range} class="max-w-[2.5rem] ml-2 mr-1">
					ft
				</label>
			</div>
		</fieldset>
	{/if}

	<fieldset>
		<legend>Options</legend>
		<div class="grid auto-cols-fr grid-flow-col gap-2">
			<label>
				<input type="checkbox" bind:checked={data.promptForDuration} disabled={props.effect.type === "condition"}>
				Prompt for Duration
			</label>
		</div>
	</fieldset>

	<button type="submit" class="mx-1">
		Save
	</button>
</form>

<script lang="ts">
import { type ConditionPF2e, type EffectPF2e, type ItemPF2e, type SpellPF2e } from "foundry-pf2e"
import { MODULE_ID } from "src/constants"
import { tooltip } from "src/guide/content/component/tooltip.svelte"
import { slide } from "svelte/transition"
import { dataFromItem, type EffectIndex } from "../data"
import { HTMLUtils } from "../html"

interface Props {
	parent: ItemPF2e
	effect: EffectIndex
	shell: foundry.applications.api.ApplicationV2
}
const props: Props = $props()

let data = $state(dataFromItem(props.parent, props.effect))

async function onsubmit(event: SubmitEvent) {
	event.preventDefault()
	await props.parent.setFlag(MODULE_ID, `effects.${props.effect._id}`, data)
	HTMLUtils.refreshButtons(props.effect)
	props.shell.close()
}

async function reset(event: Event) {
	event.preventDefault()
	await props.parent.setFlag(MODULE_ID, `effects.${props.effect._id}-=`, null)
	HTMLUtils.removeButtons(props.effect)
	props.shell.close()
}
</script>

<style>
	label {
		display: flex;
		align-items: center;
	}

	.split-button {
		button:first-child {
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
		}

		button:last-child {
			border-top-left-radius: 0;
			border-bottom-left-radius: 0;
		}

		button:not(:first-child):not(:last-child) {
			border-left-width: 0;
			border-right-width: 0;
			border-radius: 0;
		}

		button.active {
			outline: none;
			box-shadow: none;
			background-color: color-mix(in srgb, var(--button-hover-background-color) 100%, transparent 20%);
		}
	}
</style>
