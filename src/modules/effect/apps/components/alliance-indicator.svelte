<script lang="ts">
import type { ActorPF2e, TokenDocumentPF2e } from "@7h3laughingman/pf2e-types"

type Alliance = "ally" | "enemy" | "none"
type Props = { class?: string } & ({ type: Alliance } | { origin: ActorPF2e; actor: ActorPF2e })

const p: Props = $props()

const type: Alliance = $derived.by(() => {
	if ("type" in p) return p.type

	const { origin, actor } = p
	if (origin === actor) return "none"
	return origin.isAllyOf(actor) ? "ally" : "enemy"
})

const size = $derived.by(() => {
	if (type === "enemy") return "h-[0.5em]"
	return "h-[0.8em]"
})
</script>

<svg
  viewBox="0 0 100 100"
	  class="
    stroke-border stroke-1 *:[vector-effect:non-scaling-stroke]
    w-auto { size } { p.class }
  "
>
  {#if type === "ally"}
    <circle cx="50" cy="50" r="40" class="fill-green-500" />
	{:else if type === "none"}
		<circle cx="50" cy="50" r="40" class="fill-blue-500" />
  {:else}
    <polygon points="5,5 95,5 95,95 5,95" class="fill-red-500" />
  {/if}
</svg>
