<script lang="ts">
import { DropdownMenu } from "bits-ui"
import type { Snippet } from "svelte"

interface Props {
	children: Snippet
	class?: string
	disabled?: boolean
	onclick?: () => void
}
const { children, class: extra, ...rest }: Props = $props()
</script>

<DropdownMenu.Item
  class={[`flex select-none items-center
	  py-2 px-2 rounded
		not-data-disabled:cursor-pointer
		not-data-disabled:hover:bg-active data-disabled:bg-neutral-500/40`,
		extra]}
  {...rest}
>
  {@render children()}
</DropdownMenu.Item>
