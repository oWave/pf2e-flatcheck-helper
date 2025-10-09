import type { Token } from "foundry-pf2e/foundry/client/canvas/placeables/_module.mjs"
import type AmbientLight from "foundry-pf2e/foundry/client/canvas/placeables/light.mjs"
import type PointLightSource from "foundry-pf2e/foundry/client/canvas/sources/point-light-source.mjs"

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
	DARK: { color: new PIXI.Color(0xff0000), darknessBreakpoint: 1 } as const,
	DIM: { color: new PIXI.Color(0xffff00), darknessBreakpoint: 0.75 } as const,
	BRIGHT: { color: new PIXI.Color(0x00ff00), darknessBreakpoint: 0.25 } as const,

	fromExposure(level: number) {
		return level <= LightLevels.BRIGHT.darknessBreakpoint
			? LightLevels.BRIGHT
			: level < LightLevels.DIM.darknessBreakpoint
				? LightLevels.DIM
				: LightLevels.DARK
	},
})

export const TargetColors = Object.freeze({
	UNKNOWN: new PIXI.Color(0xbb00ff),
	HIDDEN: new PIXI.Color(0xff0000),
	INBETWEEN: new PIXI.Color(0xff8000),
	CONCEALED: new PIXI.Color(0xffff00),
	BETTER: new PIXI.Color(0xd0ff00),

	fromDC(dc: number | null) {
		if (dc == null) return this.UNKNOWN
		if (dc < 5) return this.BETTER
		if (dc === 5) return this.CONCEALED
		if (dc < 11) return this.INBETWEEN
		return this.HIDDEN
	},
})

export type LightLevel = typeof LightLevels.DARK

export function darknessAtPoint(x: number, y: number): number {
	for (const source of (canvas.effects as any).darknessSources as Collection<
		string,
		PointLightSource<AmbientLight | Token>
	>) {
		if (!source.shape.contains(x, y)) continue
		return LightLevels.DARK.darknessBreakpoint
	}

	let lightSourceLevel = LightLevels.DARK.darknessBreakpoint
	for (const l of canvas.effects.lightSources) {
		if (!l.active || l instanceof foundry.canvas.sources.GlobalLightSource) continue

		if (!l.shape.contains(x, y)) continue
		const d = Math.sqrt(Math.abs(l.x - x) ** 2 + Math.abs(l.y - y) ** 2)

		//@ts-expect-error
		if (d <= l.data.bright) return LightLevels.BRIGHT.darknessBreakpoint
		//@ts-expect-error
		if (d <= l.data.dim) lightSourceLevel = LightLevels.DIM.darknessBreakpoint
	}

	// @ts-expect-error
	const globalIlluminationLevel = canvas.effects.getDarknessLevel({ x, y, elevation: 0 })

	return Math.min(lightSourceLevel, globalIlluminationLevel)
}
