import { BaseModule } from "src/modules/base"
import { darknessAtPoint, Grid, type LightLevel, LightLevels } from "./utils"
import { MODULE_ID } from "src/constants"

declare global {
	interface Canvas {
		lightVis: LightVisLayer
	}
}

class LightVisLayer extends InteractionLayer {
	protected _draw(options: object): Promise<void> {
		return super._draw(options)
	}
	static get layerOptions() {
		return foundry.utils.mergeObject(super.layerOptions, {
			elevation: 1,
			name: "lightVis",
		})
	}
}

class HighlightRenderer {
	#layer: PIXI.Graphics | null = null
	#addLayer() {
		this.#layer = new PIXI.Graphics()
		canvas.lightVis.addChild(this.#layer)
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

				/* const lineWitdh = 1
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
					highlightGraphics.moveTo(left, bottom).lineTo(right, bottom) */

				if (l !== LightLevels.BRIGHT) {
					const color = l.color
					highlightGraphics.lineStyle(0)
					highlightGraphics.beginFill(color, 0.25).drawRect(px, py, gridSize, gridSize)
				}
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
		this.destroy()
		this.drawMesh()
		// this.drawPoints()
		// this.drawPoints()
	}
}

export class LightVisModule extends BaseModule {
	settingsKey = "light-level-vis"

	layerRenderer?: HighlightRenderer

	enable(): void {
		// @ts-expect-error
		CONFIG.Canvas.layers.lightVis = {
			layerClass: LightVisLayer,
			group: "primary",
		}
		this.layerRenderer = new HighlightRenderer()

		this.registerHook("highlightObjects", (state: boolean) => {
			if (state) this.layerRenderer?.draw()
			else this.layerRenderer?.destroy()
		})
		/* this.registerHook("lightingRefresh", () => this.layerRenderer?.draw())
		this.registerHook("canvasInit", () => this.layerRenderer?.draw())
		this.registerHook("canvasTearDown", () => this.layerRenderer?.destroy()) */
	}
}
