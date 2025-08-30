<h3 class="ml-4">PF2e Utility Buttons</h3>

Select a tab on the left.

{#if import.meta.env.DEV}
	<div class="flex flex-col">
		{#each store.current.entries() as [k,v] }
		{@const uncommited=store.uncommitted.get(k)}
		<SettingInput label={k} key={k}></SettingInput>
		{/each}
	</div>
{/if}

<script lang="ts">
import { getStore } from "../setting.svelte.ts"
import SettingInput from "./component/setting-input.svelte"

const store = getStore()
</script>
