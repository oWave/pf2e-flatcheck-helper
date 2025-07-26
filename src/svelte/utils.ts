import type { TokenPF2e } from "foundry-pf2e"

export function imgPropsForToken(token: TokenPF2e) {
	const scale = (() => {
		const defaultRingThickness = 0.1269848
		const defaultSubjectThickness = 0.6666666
		const scaleCorrection = token.document.ring.enabled
			? 1 / (defaultRingThickness + defaultSubjectThickness)
			: 1
		return Math.max(1, token.document.texture.scaleX ?? 1) * scaleCorrection
	})()

	let style = `transform:scale(${scale});`

	if (scale > 1.2) {
		const ringPercent = 100 - Math.floor(((scale - 0.7) / scale) * 100)
		const limitPercent = 100 - Math.floor(((scale - 1.15) / scale) * 100)
		style += `mask-image: radial-gradient(circle at center, black ${ringPercent}%, rgba(0, 0, 0, 0.2) ${limitPercent}%);`
	}

	return {
		src: token.document.texture.src,
		style,
	}
}
