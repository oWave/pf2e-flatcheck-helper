import type { TokenPF2e } from "foundry-pf2e"
import * as R from "remeda"
import { OutlineFilter } from "@pixi/filter-outline"

declare global {
	interface Canvas {
		lightDebug: LightDebugLayer
	}
}

class LightDebugLayer extends InteractionLayer {
	protected _draw(options: object): Promise<void> {
		return super._draw(options)
	}
	static get layerOptions() {
		return foundry.utils.mergeObject(super.layerOptions, {
			elevation: 1,
			name: "lightDebug",
		})
	}
}

Hooks.once("init", () => {
	// @ts-expect-error
	CONFIG.Canvas.layers.lightDebug = {
		layerClass: LightDebugLayer,
		group: "primary",
	}
})

Hooks.once("ready", () => {
	// @ts-expect-error
	window.__PIXI_DEVTOOLS__ = { renderer: canvas.app.renderer, stage: canvas.app.stage }

	Hooks.on("lightingRefresh", () => {
		HighlightRenderer.instance.draw()
		for (const t of game.user.targets) TokenTargetRenderer.refresh(t)
	})
	Hooks.on("canvasInit", () => HighlightRenderer.instance.draw())
	Hooks.on("canvasTearDown", () => {
		HighlightRenderer.instance.destroy()
		TokenTargetRenderer.destroyAll()
	})
	Hooks.on("targetToken", (user, token, state) => {
		if (state) TokenTargetRenderer.target(token as TokenPF2e)
		else TokenTargetRenderer.untarget(token as TokenPF2e)
	})
	const refreshTimeoutIds = new Map<string, NodeJS.Timeout>()
	Hooks.on("refreshToken", (token: TokenPF2e, args: Record<string, boolean>) => {
		if (!(args.refreshPosition && args.refreshVisibility)) return

		if (refreshTimeoutIds.has(token.id)) {
			clearTimeout(refreshTimeoutIds.get(token.id))
		}
		const id = setTimeout(() => {
			refreshTimeoutIds.delete(token.id)
			TokenTargetRenderer.refresh(token)
		}, 100)
		refreshTimeoutIds.set(token.id, id)
	})
})

const LightLevels = Object.freeze({
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

type LightLevel = typeof LightLevels.DARK

const Textures = Object.freeze({
	DARK: PIXI.Texture.from("modules/pf2e-flatcheck-helper/assets/svg/dark.svg"),
	DIM: PIXI.Texture.from("modules/pf2e-flatcheck-helper/assets/svg/dim.svg"),
})

function darknessAtPoint(x: number, y: number) {
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

function drawLightPoint(g: PIXI.Graphics, x: number, y: number, darkness: number) {
	const level = LightLevels.fromExposure(darkness)
	const color = level.color
	g.beginFill(color, 1)
	if (level === LightLevels.BRIGHT) g.drawCircle(x, y, 5)
	else if (level === LightLevels.DIM) g.drawRect(x - 3, y - 3, 6, 6)
	else g.drawRoundedRect(x - 4, y - 4, 8, 8, 3)
}

export let Grid = class<T> {
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

export let HighlightRenderer = class {
	static instance = new this()

	#layer: PIXI.Graphics | null = null
	#addLayer() {
		this.#layer = new PIXI.Graphics()
		canvas.lightDebug.addChild(this.#layer)
		return this.#layer
	}
	get layer() {
		return this.#layer ?? this.#addLayer()
	}
	destroy() {
		this.#layer?.destroy()
		this.#layer = null
	}
	clear() {
		this.#layer?.clear()
		this.#layer?.removeChildren()
	}

	drawMesh() {
		const gridSize = canvas.scene!.grid.size
		const halfGrid = gridSize / 2
		// const { width, height } = canvas.scene!.dimensions

		const width = Math.ceil(canvas.scene!.dimensions.width / gridSize)
		const height = Math.ceil(canvas.scene!.dimensions.height / gridSize)

		const highlightGraphics = new PIXI.Graphics()

		const grid = new Grid<LightLevel>(width, height)
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				const px = halfGrid + x * gridSize
				const py = halfGrid + y * gridSize

				const l = darknessAtPoint(px, py)
				grid.set(x, y, LightLevels.fromExposure(l))
			}
		}

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				const px = x * gridSize
				const py = y * gridSize

				const l = grid.get(x, y)
				const color = l.color

				highlightGraphics.lineStyle(0)
				highlightGraphics.beginFill(color, 0.15).drawRect(px, py, gridSize, gridSize)

				const lineWitdh = 1
				const innerSize = gridSize - lineWitdh * 2
				const left = px
				const top = py
				const right = left + gridSize
				const bottom = top + gridSize
				highlightGraphics.lineStyle({
					width: lineWitdh,
					color: 0x999999,
					alpha: 1,
				})
				if (x < width - 1 && grid.getOrNull(x + 1, y) !== l)
					highlightGraphics.moveTo(right, top).lineTo(right, bottom)
				if (y < height - 1 && grid.getOrNull(x, y + 1) !== l)
					highlightGraphics.moveTo(left, bottom).lineTo(right, bottom)
			}
		}

		this.layer.addChild(highlightGraphics)
	}

	drawPoints() {
		const gridSize = canvas.scene!.grid.size
		const halfGrid = gridSize / 2

		const width = Math.ceil(canvas.scene!.dimensions.width / gridSize) + 1
		const height = Math.ceil(canvas.scene!.dimensions.height / gridSize) + 1

		const g = new PIXI.Graphics()

		const drawPoint = (px: number, py: number) => {
			const exposure = darknessAtPoint(px, py)
			const level = LightLevels.fromExposure(exposure)
			const color = level.color
			g.beginFill(color, 1)
			if (level === LightLevels.BRIGHT) g.drawCircle(px, py, 5)
			else if (level === LightLevels.DIM) g.drawRect(px - 3, py - 3, 6, 6)
			else g.drawRoundedRect(px - 4, py - 4, 8, 8, 3)
		}

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				const px = x * gridSize
				const py = y * gridSize

				drawPoint(px, py)
				if (x < width - 1 && y < width - 1) drawPoint(px + halfGrid, py + halfGrid)
			}
		}
		this.layer.addChild(g)
	}

	drawText() {
		const gridSize = canvas.scene!.grid.size
		const { width, height } = canvas.scene!.dimensions

		for (let x = gridSize / 2; x < width; x += gridSize) {
			for (let y = gridSize / 2; y < height; y += gridSize) {
				const l = darknessAtPoint(x, y)
				const color =
					l <= LightLevels.BRIGHT.darknessBreakpoint
						? "#00ff00"
						: l <= LightLevels.DIM.darknessBreakpoint
							? "#ffff00"
							: "#ff0000"

				const text = new PIXI.Text(
					l.toFixed(2).toLocaleLowerCase(),
					new PIXI.TextStyle({
						fill: color,
					}),
				)
				text.x = x
				text.y = y
				text.anchor.set(0.5)
				this.layer.addChild(text)
			}
		}
	}

	draw() {
		console.time("draw")
		this.destroy()
		this.drawMesh()
		// this.drawPoints()
		// this.drawPoints()
		console.timeEnd("draw")
	}
}

export let TokenTargetRenderer = class TokenTargetRendererClass {
	static #tokenMap = new Map<string, TokenTargetRendererClass>()
	static getOrCreate(token: TokenPF2e) {
		if (this.#tokenMap.has(token.id)) return this.#tokenMap.get(token.id)!
		const r = new TokenTargetRendererClass(token)
		this.#tokenMap.set(token.id, r)
		return r
	}
	static target(token: TokenPF2e) {
		this.getOrCreate(token).draw()
	}
	static untarget(token: TokenPF2e) {
		this.#tokenMap.get(token.id)?.destroy()
		this.#tokenMap.delete(token.id)
	}
	static refresh(token: TokenPF2e) {
		this.#tokenMap.get(token.id)?.draw()
	}
	static destroyAll() {
		for (const [_, token] of this.#tokenMap.entries()) token.destroy()
	}
	static init() {
		for (const t of game.user.targets) this.target(t)
	}

	#layer: PIXI.Container
	#graphics: PIXI.Graphics
	#sprite: PIXI.Sprite | null = null
	#filter: OutlineFilter
	constructor(public token: TokenPF2e) {
		this.#layer = new PIXI.Container()
		this.#graphics = new PIXI.Graphics()
		this.#filter = new OutlineFilter(undefined, undefined, 1, 1, false)

		this.#layer.addChild(this.#graphics)
		this.token.addChild(this.#layer)
		this.token.mesh?.filters?.push(this.#filter)
	}

	draw() {
		this.#graphics.clear()
		if (!this.#sprite?.destroyed) this.#sprite?.destroy()

		const gridSize = this.token.scene!.grid.size
		const halfGrid = gridSize / 2
		const { width, height } = this.token.scene!.dimensions

		let tokenExposure = LightLevels.DARK.darknessBreakpoint

		if (this.token.bounds.width < gridSize || this.token.bounds.height < gridSize) {
			const x = this.token.bounds.width / 2
			const y = this.token.bounds.height / 2
			const exp = darknessAtPoint(x + this.token.x, y + this.token.y)
			// drawLightPoint(this.#graphics, x, y, exp)
			tokenExposure = Math.min(tokenExposure, exp)
		} else {
			for (let x = halfGrid; x < this.token.bounds.width; x += gridSize) {
				for (let y = halfGrid; y < this.token.bounds.height; y += gridSize) {
					const gx = x + this.token.x
					const gy = y + this.token.y
					if (gx >= 0 && gx <= width && gy >= 0 && gy <= height) {
						const exp = darknessAtPoint(gx, gy)
						// drawLightPoint(this.#graphics, x, y, exp)
						tokenExposure = Math.min(tokenExposure, exp)
					}
				}
			}
		}

		const tokenLightLevel = LightLevels.fromExposure(tokenExposure)

		if (tokenLightLevel === LightLevels.BRIGHT) {
			this.#filter.enabled = false
			return
		}

		const color = tokenLightLevel.color
		this.#filter.color = color.toNumber()

		const baseThickness = gridSize * 0.05
		const squares = Math.max(
			1,
			Math.ceil(Math.min(this.token.bounds.width, this.token.bounds.height) / gridSize),
		)

		const thickness = baseThickness * ((squares + 1) / 2)
		this.#filter.thickness = thickness
		this.#filter.enabled = true

		const texture = tokenLightLevel === LightLevels.DARK ? Textures.DARK : Textures.DIM
		const sprite = new PIXI.Sprite(texture)
		sprite.width = sprite.height = Math.min(this.token.bounds.width, this.token.bounds.height) * 0.2
		sprite.x = this.token.bounds.width / 2
		sprite.y = this.token.bounds.height * 0.8
		sprite.anchor.set(0.5)
		this.#layer.addChild(sprite)
		this.#sprite = sprite
	}
	destroy() {
		this.#layer.destroy()

		const idx = this.token.mesh?.filters?.indexOf(this.#filter)
		if (idx !== undefined && idx > -1) this.token.mesh?.filters?.splice(idx, 1)
	}
}

if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		HighlightRenderer.instance.destroy()
		TokenTargetRenderer.destroyAll()
	})
	import.meta.hot.accept((n) => {
		Grid = n?.Grid ?? Grid
		HighlightRenderer = n?.HighlightRenderer ?? HighlightRenderer
		HighlightRenderer.instance.draw()
		TokenTargetRenderer = n?.TokenTargetRenderer ?? TokenTargetRenderer
		TokenTargetRenderer.init()
	})
}
