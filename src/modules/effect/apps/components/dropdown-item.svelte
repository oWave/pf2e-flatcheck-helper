<script lang="ts">
import { DropdownMenu } from "bits-ui"
import type { Snippet } from "svelte"

interface Props {
	children: Snippet
	class?: string
	onclick?: () => void
}
const { children, class: extra, ...rest }: Props = $props()
</script>

<DropdownMenu.Item
  class={["flex select-none items-center py-2 px-2 rounded hover:bg-active", extra]}
  {...rest}
>
  {@render children()}
</DropdownMenu.Item>
