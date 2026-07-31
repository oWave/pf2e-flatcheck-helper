import MODULE from "src"
import { QUERIES } from "src/constants"
import { ApplyContext, type ApplyContextSource } from "./context.svelte"

export function sendApplyRequest(data: ApplyContextSource) {
	return game.users.activeGM?.query(QUERIES.effect.request, data) as Promise<string | true>
}

export async function handleApplyRequest(data: ApplyContextSource) {
	let context: ApplyContext
	try {
		context = await ApplyContext.fromJSON(data)
	} catch (error) {
		return error instanceof Error ? error.message : String(error)
	}

	const requester = context.requester!
	if (
		MODULE.settings.quickApplyUserRequest === "auto-accept-always" ||
		(MODULE.settings.quickApplyUserRequest === "auto-accept-trusted" &&
			requester.role >= CONST.USER_ROLES.TRUSTED)
	) {
		await context.apply()
	} else {
		const { ApplyEffectApp } = await import("./apps/index")
		await ApplyEffectApp.wait(context)
	}

	return true
}
