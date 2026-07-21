<script lang="ts">
import { DropdownMenu } from "bits-ui"
import { type Snippet } from "svelte"

interface Props {
	parent: HTMLElement
	class?: string
	chevron?: "left" | "right"
	icon?: string
	text?: string
	children: Snippet
}
const { children, parent, class: extra = "", chevron = "right", icon, text }: Props = $props()
let open = $state(false)
</script>

<DropdownMenu.Root bind:open>
  <DropdownMenu.Trigger class="inline-flex items-center gap-1 {extra}">
		{#if icon}
    	<i class={icon}></i>
		{/if}
		{#if text}
			<span>{text}</span>
		{/if}
    <i
      class="fa-solid fa-chevron-down transition-transform duration-200 {chevron === 'left' ? 'order-first' : 'order-last'}"
      class:rotate-180={open}
    ></i>
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal to={parent}>
    <DropdownMenu.Content
      sideOffset={2}
      class="bg-solid border border-border rounded px-1 py-1"
    >
      {@render children()}
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
