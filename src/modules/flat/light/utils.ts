import type PointLightSource from "foundry-pf2e/foundry/client-esm/canvas/sources/point-light-source.js"
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
		return y * this.width + x
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
	for (const source of (canvas.effects as any).darknessSources as Collection<
		PointLightSource<AmbientLight | Token>
	>) {
		if (!source.shape.contains(x, y)) continue
		return LightLevels.DARK.darknessBreakpoint
	}

	let darkness = LightLevels.DARK.darknessBreakpoint
	for (const l of canvas.effects.lightSources) {
		if (!l.active || l instanceof foundry.canvas.sources.GlobalLightSource) continue

		if (!l.shape.contains(x, y)) continue
		const d = Math.sqrt(Math.abs(l.x - x) ** 2 + Math.abs(l.y - y) ** 2)

		if (d <= l.data.bright) return LightLevels.BRIGHT.darknessBreakpoint
		if (d <= l.data.dim) darkness = LightLevels.DIM.darknessBreakpoint
	}

	const globalLevel = canvas.environment.darknessLevel
	if (darkness < LightLevels.DARK.darknessBreakpoint) {
		// point is in at least dim light from a light source
		// darkness areas do not affect light sources
		return Math.min(darkness, globalLevel)
	}

	return canvas.effects.getDarknessLevel({ x, y, elevation: 0 })
}
