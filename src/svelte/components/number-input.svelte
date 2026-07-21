<div class="flex {extra}" transition:slide={{ axis: "x", duration: 100 }}>
  <button
    type="button"
    class="rounded-r-none h-auto"
    onclick={() => click(-step)}
  >
    -
  </button>
  <input
    class="rounded-none h-auto text-center"
    type="number"
    bind:value={value}
    {min}
    {max}
    {step}
    {required}
  >
  <button
    type="button"
    class="rounded-l-none h-auto"
    onclick={() => click(step)}
  >
    +
  </button>
</div>

<script lang="ts">
import { slide } from "svelte/transition"

interface Props {
	value: number
	min?: number
	max?: number
	step?: number

	required?: boolean
	class?: string
}

let { value = $bindable(), step = 1, min, max, required, class: extra }: Props = $props()

function click(step: number) {
	value = Math.clamp(value + step, min ?? -Infinity, max ?? Infinity)
}
</script>
