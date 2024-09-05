import { BaseModule } from "../base"

export class SharedVisionModule extends BaseModule {
	settingsKey = "script-toggle-shared-vision"

	enable() {
		super.enable()

		this.registerHook("updateSetting", onUpdateSetting)
		this.registerHook("combatStart", onCombatStart)
		this.registerHook("deleteCombat", onDeleteCombat)
	}

	onReady() {
		// Not perfect, but refreshing the setting if a second GM joins and gets activeGM should not cause any issues
		if (game.users.activeGM === game.user)
			game.settings.set("pf2e", "metagame_partyVision", !game.combat?.started)
	}
}

function onUpdateSetting(s: { key: string }) {
	if (game.user.isGM || s.key !== "pf2e.metagame_partyVision") return

	// Vision is updated in Token._onControl, so changing the party vision setting would only do something after a user (de)selects a token
	// This is copied from _onControl to force refresh vision

	for (const token of canvas.tokens.placeables) {
		// @ts-expect-error
		if (!token.vision === token._isVisionSource()) token.initializeVisionSource()
	}

	canvas.perception.update({
		refreshVision: true,
		refreshSounds: true,
		// @ts-expect-error
		refreshOcclusion: canvas.tokens.occlusionMode & CONST.TOKEN_OCCLUSION_MODES.CONTROLLED,
	})
}

function onCombatStart() {
	if (game.users.activeGM === game.user) game.settings.set("pf2e", "metagame_partyVision", false)
}
function onDeleteCombat() {
	if (game.users.activeGM === game.user) game.settings.set("pf2e", "metagame_partyVision", true)
}
