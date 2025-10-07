import type { TokenDocumentPF2e, TokenPF2e } from "foundry-pf2e"
import type Token from "foundry-pf2e/foundry/client/canvas/placeables/token.mjs"
import type { HookCallback } from "foundry-pf2e/foundry/client/helpers/hooks.mjs"
import { darknessAtPoint, LightLevels } from "./utils"

function tokenExposure(token: Token) {
	const gridSize = token.scene!.grid.size
	const halfGrid = gridSize / 2
	const sceneDimensions = token.scene!.dimensions

	let tokenExposure = LightLevels.DARK.darknessBreakpoint

	if (token.bounds.width < gridSize || token.bounds.height < gridSize) {
		const x = token.bounds.width / 2
		const y = token.bounds.height / 2
		const exp = darknessAtPoint(x + token.x, y + token.y)
		// drawLightPoint(this.#graphics, x, y, exp)
		tokenExposure = Math.min(tokenExposure, exp)
	} else {
		for (let x = halfGrid; x < token.bounds.width; x += gridSize) {
			for (let y = halfGrid; y < token.bounds.height; y += gridSize) {
				const gx = x + token.x
				const gy = y + token.y
				if (gx >= 0 && gx <= sceneDimensions.width && gy >= 0 && gy <= sceneDimensions.height) {
					const exp = darknessAtPoint(gx, gy)
					// drawLightPoint(this.#graphics, x, y, exp)
					tokenExposure = Math.min(tokenExposure, exp)
				}
			}
		}
	}
	return tokenExposure
}

class Cache {
	private map = new Map<TokenDocumentPF2e, number>()

	private calculate(token: TokenDocumentPF2e) {
		const exposure = token.object ? tokenExposure(token.object) : 0
		this.map.set(token, exposure)
		return exposure
	}

	get(token: TokenDocumentPF2e) {
		const exposure = this.map.get(token)
		if (exposure == null) return this.calculate(token)
		return exposure
	}

	invalidate(token: TokenDocumentPF2e) {
		this.map.delete(token)
	}

	invalidateAll() {
		this.map.clear()
	}

	private useCount = 0
	enable() {
		if (this.useCount === 0) {
			this.registerHook("canvasTearDown", () => this.invalidateAll())
			this.registerHook(
				"lightingRefresh",
				foundry.utils.debounce(() => this.invalidateAll(), 50),
			)
			this.registerHook("updateToken", (token: TokenDocumentPF2e, changes: any) => {
				if (
					"x" in changes ||
					"y" in changes ||
					"elevation" in changes ||
					"width" in changes ||
					"height" in changes
				) {
					this.invalidate(token)
				}
			})
		}
		this.useCount++
	}

	disable() {
		if (this.useCount === 1) {
			for (const [k, v] of this.hooks.entries()) Hooks.off(k, v)
			this.hooks.clear()
		}
		this.useCount = Math.max(this.useCount - 1, 0)
	}

	private hooks = new Map<string, number>()
	registerHook(type: string, callback: HookCallback<any[]>) {
		const id = Hooks.on(type, callback)
		this.hooks.set(type, id)
	}
}

export const tokenExposureCache = new Cache()

export function tokenLightLevel(token: TokenPF2e) {
	const exposure = token.document ? tokenExposureCache.get(token.document) : 0
	return LightLevels.fromExposure(exposure)
}
