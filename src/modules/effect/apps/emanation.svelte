<div class="p-1">
	<div class="grid grid-cols-[auto_6rem] gap-2 items-center">
		<div>
			<i class="fa-solid fa-square"></i>
			<strong>Base</strong>
	</div>
	<div>

		<NumberInput
			bind:value={height}
			min={1}
			step={1}
		></NumberInput>
	</div>

	<div>
		<i class="fa-solid fa-circle-dot"></i>
		<strong>
			Radius
		</strong>
	</div>
		<NumberInput
			bind:value={radius}
			min={5}
			step={5}
		></NumberInput>
	</div>

	<button onclick={place}>Update</button>
</div>

<script lang="ts">
import NumberInput from "src/svelte/components/number-input.svelte"
import type { EmanationApp } from "."

interface Props {
	radius: number
	base: number
	callback: (region: RegionDocument) => void
	shell: EmanationApp
}

const props: Props = $props()

let radius = $state(props.radius)
let height = $state(props.base)

// onMount(place)

$effect(() => {
	radius
	height
	const t = setTimeout(place, 150)
	return () => clearTimeout(t)
})

async function place() {
	const res = await canvas.regions.placeRegion(
		{
			name: "Temp",
			highlightMode: "coverage",
			shapes: [
				{
					type: "emanation",
					base: {
						type: "token",
						x: 0,
						y: 0,
						width: height,
						height: height,
						shape: CONST.TOKEN_SHAPES.RECTANGLE_1,
					},
					radius: radius * canvas.dimensions.distancePixels,
				},
			],
			// @ts-expect-error
			levels: [canvas.level.id],
			restriction: { enabled: true },
		},
		{ create: false, attachToToken: true },
	)
	// res is null both if the placement was canceled by the user, or when canceled by calling placeRegion again
	if (canvas.regions._placementContext == null) {
		if (res) props.callback(res)
		props.shell.close()
	}
}
</script>
