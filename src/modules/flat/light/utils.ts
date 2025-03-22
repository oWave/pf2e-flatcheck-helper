import * as R from "remeda"

export const Grid = class<T> {
	#elements: Array<T>
	constructor(
		public width: number,
		public height: number,
	) {
		this.#elements = new Array(width * height)
	}

	index(x: number, y: number) {
		return y * this.height + x
	}

	get(x: number, y: number) {
		const el = this.#elements[this.index(x, y)]
		return el
	}

	getOrNull(x: number, y: number) {
		if (!this.isValid(x, y)) return null
		return this.get(x, y)
	}

	set(x: number, y: number, value: T) {
		this.#elements[this.index(x, y)] = value
	}

	isValid(x: number, y: number) {
		return 0 <= x && x < this.width && 0 <= y && y < this.height
	}
}

export const LightLevels = Object.freeze({
	DARK: { color: new PIXI.Color(0xff0000), darknessBreakpoint: 1 },
	DIM: { color: new PIXI.Color(0xffff00), darknessBreakpoint: 0.75 },
	BRIGHT: { color: new PIXI.Color(0x00ff00), darknessBreakpoint: 0.25 },

	fromExposure(level: number) {
		return level <= LightLevels.BRIGHT.darknessBreakpoint
			? LightLevels.BRIGHT
			: level <= LightLevels.DIM.darknessBreakpoint
				? LightLevels.DIM
				: LightLevels.DARK
	},
})

export const TargetColors = Object.freeze({
	HIDDEN: new PIXI.Color(0xff0000),
	INBETWEEN: new PIXI.Color(0xff8000),
	CONCEALED: new PIXI.Color(0xffff00),
	BETTER: new PIXI.Color(0xd0ff00),

	fromDC(dc: number) {
		if (dc < 5) return this.BETTER
		if (dc === 5) return this.CONCEALED
		if (dc < 11) return this.INBETWEEN
		return this.HIDDEN
	},
})

export type LightLevel = typeof LightLevels.DARK

export function darknessAtPoint(x: number, y: number) {
	const lights = canvas.lighting.quadtree?.getObjects(new PIXI.Rectangle(x, y, 1, 1))

	let darkness = LightLevels.DARK.darknessBreakpoint
	if (lights?.size) {
		for (const l of lights) {
			if (!l.lightSource?.shape.contains(x, y)) continue
			const d = Math.sqrt(Math.abs(l.x - x) ** 2 + Math.abs(l.y - y) ** 2)

			if (l.emitsDarkness && d <= Math.max(l.dimRadius, l.brightRadius)) {
				return LightLevels.DARK.darknessBreakpoint
			}

			if (l.emitsLight) {
				if (d <= l.brightRadius) return LightLevels.BRIGHT.darknessBreakpoint
				if (d <= l.dimRadius) darkness = LightLevels.DIM.darknessBreakpoint
			}
		}
	}

	const globalLevel = canvas.environment.darknessLevel

	// TODO: Check if this whole mess can be replaced with canvas.effects.getDarknessLevel

	const AdjustDarknessLevelRegionBehaviorType =
		foundry.data.regionBehaviors.AdjustDarknessLevelRegionBehaviorType

	const point = new PIXI.Point(x, y)
	const adjustDarknessBehaviors = R.pipe(
		canvas.scene!.regions.contents,
		R.filter((r) => r.behaviors.some((b) => !b.disabled && b.type === "adjustDarknessLevel")),
		R.filter((r) => r.object.testPoint(point, 0)),
		R.flatMap((r) => r.behaviors.contents),
		R.filter((b) => !b.disabled && b.type === "adjustDarknessLevel" && b.system.mode !== null),
		R.map((b) => b.system as foundry.data.regionBehaviors.AdjustDarknessLevelRegionBehaviorType),
	)

	if (adjustDarknessBehaviors.length === 0) {
		return Math.min(darkness, globalLevel)
	}

	const adjustDarknessBehaviorGroups = R.pipe(
		adjustDarknessBehaviors,
		R.groupBy((b) => b.mode!),
	)

	if (adjustDarknessBehaviorGroups[AdjustDarknessLevelRegionBehaviorType.MODES.BRIGHTEN]?.length) {
		const max = R.pipe(
			adjustDarknessBehaviorGroups[AdjustDarknessLevelRegionBehaviorType.MODES.BRIGHTEN]!,
			R.firstBy([(b) => b.modifier, "desc"]),
		)
		return globalLevel * (1 - max.modifier)
	}
	if (adjustDarknessBehaviorGroups[AdjustDarknessLevelRegionBehaviorType.MODES.DARKEN]?.length) {
		const min = R.pipe(
			adjustDarknessBehaviorGroups[AdjustDarknessLevelRegionBehaviorType.MODES.DARKEN]!,
			R.firstBy([(b) => b.modifier, "asc"]),
		)
		return 1 - (1 - globalLevel) * (1 - min.modifier)
	}
	if (adjustDarknessBehaviorGroups[AdjustDarknessLevelRegionBehaviorType.MODES.OVERRIDE]?.length) {
		const min = R.pipe(
			adjustDarknessBehaviorGroups[AdjustDarknessLevelRegionBehaviorType.MODES.OVERRIDE]!,
			R.firstBy([(b) => b.modifier, "asc"]),
		)
		return min.modifier
	}

	return darkness
}
