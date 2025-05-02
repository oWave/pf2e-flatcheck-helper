<div class="bg-yellow-600 p-1 rounded-sm">
	<i class="fa-solid fa-circle-exclamation"></i>
	{@render children()}
</div>

<script lang="ts">
import type { Snippet } from "svelte"

interface Props {
	children: Snippet
}

const { children }: Props = $props()
</script>
