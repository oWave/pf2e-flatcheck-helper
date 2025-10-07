import type { TokenDocumentPF2e } from "foundry-pf2e"
import * as R from "remeda"
import type { TargetFlatCheckSource } from "./target"

export type VisibilityFactorSlug =
	| "blinded"
	| "invisible"
	| "dazzled"
	| "undetected"
	| "hidden"
	| "concealed"
	| "magical-darkness"
	| "darkness"
	| "dim-light"
	| "lifesense"
	| "tremorsense"
	| "hearing"
	| "scent"
	| "bright-light"
	| "low-light-vision"
	| "darkvision"
	| "greater-darkvision"
	| string

const importantSlugs = [
	"invisible",
	"undetected",
	"magical-darkness",
	"blinded",
	"darkness",
	"hidden",
	"dazzled",
	"dim-light",
	"concealed",
] as const

const slugPriorities = new Map<string, number>(importantSlugs.map((s, i) => [s, i]))

export interface VisibilityFactors {
	state: "observed" | "concealed" | "hidden" | "undetected"
	lighting: "bright" | "dim" | "darkness" | "magicalDarkness" | "greaterMagicalDarkness" | string
	reasons: string[]
	slugs: VisibilityFactorSlug[]
}

export async function visionerAVSFlatCheck(
	origin: TokenDocumentPF2e,
	target: TokenDocumentPF2e,
): Promise<TargetFlatCheckSource | null> {
	const factors: VisibilityFactors = await game.modules
		.get("pf2e-visioner")
		// @ts-expect-error
		?.api.getVisibilityFactors(origin.id, target.id)

	if (!factors || factors.state === "observed") return null

	// Visoner slugs are an array. Use highest priority slugs as origin
	const sourceSlug = R.firstBy(factors.slugs, [(s) => slugPriorities.get(s) ?? Infinity, "asc"])

	const source: TargetFlatCheckSource = {
		type: factors.state,
	}
	if (sourceSlug) {
		source.origin = { slug: sourceSlug }
		if (factors.reasons?.length) source.origin.reasons = factors.reasons
	}

	return source
}
