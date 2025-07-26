import type Token from "foundry-pf2e/foundry/client/canvas/placeables/token.mjs"
import { darknessAtPoint, LightLevels } from "./utils"

export function tokenExposure(token: Token) {
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

export function tokenLightLevel(token: Token) {
	const exposure = tokenExposure(token)
	return LightLevels.fromExposure(exposure)
}
