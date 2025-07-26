<div class="flex items-center">
	<strong>{label}</strong>

	{#if missingLibwrapper}
	<i class="fa-solid fa-cube mx-1 text-red-700" use:tooltip={{text: "Requires lib-wrapper"}}></i>
	{:else if locked}
	<i class="fa-solid fa-lock mx-1 text-orange-500" use:tooltip={{text: "A module controlling client settings is active in this world.\nPlease use the core settings window to change this setting."}}></i>
	{:else if setting.type === Boolean}
		<input type="checkbox" class={[disabled && "cursor-not-allowed!"]} disabled={disabled} bind:checked={
			() => invert ? !value : value,
			(v) => store.setValue(key, invert ? !v : v)
		}>
	{:else if setting.type === String && setting.choices}
		<select class={[disabled && "cursor-not-allowed!", "w-auto!", "mx-1"]} disabled={disabled} bind:value={
			() => value,
			(v) => store.setValue(key, v)
		}>
			{#each Object.entries(setting.choices) as [k, v]}
				<option value="{k}">{translate(v as string)}</option>
			{/each}
		</select>
	{:else}
		<span>{JSON.stringify(value)}</span>
	{/if}

	<div use:tooltip={{text: tooltipText}}>
		<i class="fa-solid {icon}"></i>
	</div>
	{#if requiresReload}
		<div class="ml-1" use:tooltip={{text: "Requires reload"}}>
			<i class="fa-solid fa-rotate-right"></i>
		</div>
	{/if}
</div>

<script lang="ts">
import MODULE from "src"
import { MODULE_ID } from "src/constants"
import { translate } from "src/utils"
import { getStore } from "../../setting.svelte"
import { tooltip } from "./tooltip.svelte"

interface Props {
	label: string
	key: string
	invert?: boolean
}
const { label, key, invert }: Props = $props()

const setting = game.settings.settings.get(`${MODULE_ID}.${key}`)
const icon = setting.scope === "world" ? "fa-earth" : "fa-user"
const tooltipText =
	setting.scope === "world"
		? "World setting"
		: "Client setting: Changing this setting only affects you."
const requiresReload = setting.requiresReload

const missingLibwrapper =
	MODULE.settings.flags.get(key)?.requiresLibwrapper && !game.modules.get("lib-wrapper")?.active
const disabled = setting.scope === "world" && !game.user.isGM
const locked = setting.scope === "client" && game.modules.get("force-client-settings")?.active

const store = getStore()
const value = $derived.by(() => {
	const uncommited = store.uncommitted.get(key)
	return uncommited === undefined ? store.current.get(key) : uncommited
})
</script>

<style>
	input[type="checkbox"]:indeterminate::before {
		content: "\f146";
		color: var(--color-level-error);
	}

</style>
