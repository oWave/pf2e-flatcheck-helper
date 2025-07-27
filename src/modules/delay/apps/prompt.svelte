<form {onsubmit} class="p-2">
	<div class="flex flex-col items-center">
		<strong>{translate("delay.dialog.delay-after")}</strong>
		<div class="py-3 overflow-y-auto overflow-x-visible max-h-[500px]">
			{#each turns as t,i}
				{@const disabled=disabledTurns.includes(i)}
				{@const isSelf=t===combatant}
				{@const isSelected=t.id === selected}
				<div
				  class={[
						"flex items-center h-[50px] pl-1 pr-2 border",
						disabled ? "cursor-not-allowed rounded-none" : "cursor-pointer rounded-sm",
						isSelf ? "dark:bg-green-300/20 bg-green-600/20 border-green-400" :
						disabled ? "dark:bg-white/10 bg-black/10 border-transparent" :
					  isSelected ? "dark:bg-white/20 bg-black/20 border-orange-400" : "border-transparent hover:border-gray-500",
					]}
					onclick={() => { if (!disabled) selected = t.id }}
				>
					<img class="h-full p-0.5" {...imgPropsForToken(t.token!.object!)} inert>
					<p class="grow overflow-hidden text-ellipsis max-w-[20ch] max-h-[48px] ml-0.5" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">{displayName(t)}</p>
					<p class="ml-3">{t.initiative}</p>
				</div>
				{:else}
					<p class="text-center">Empty combat?</p>
				{/each}
		</div>
	</div>
	<div class="flex flex-col gap-1">
		<button type="submit" disabled={loading}>
			<i class={["fa-solid fa-hourglass-start", loading && "animate-spin"]}></i>
			{translate("delay.dialog.confirm")}
		</button>
		<button type="button" onclick={() => shell.close()}>
			<i class="fa-solid fa-xmark"></i>
			{translate("delay.dialog.cancel")}
		</button>
	</div>
</form>

<script lang="ts">
import type { CombatantPF2e } from "foundry-pf2e"
import type ApplicationV2 from "foundry-pf2e/foundry/client/applications/api/application.mjs"
import { imgPropsForToken } from "src/svelte/utils"
import { translate } from "src/utils"
import { applyDelay, createMessage } from "../delay"
import { sendGmMoveQuery } from "../query"

interface Props {
	combatant: CombatantPF2e
	shell: ApplicationV2
}
const { combatant, shell }: Props = $props()
if (!combatant.parent) throw new Error("Combatant has no combat!")
const combat = combatant.parent
const turns = combat.turns.filter((t) => t.initiative !== null)
const currentTurn = turns.findIndex((t) => t === combatant)
const disabledTurns = [currentTurn]
disabledTurns.push(currentTurn === 0 ? turns.length - 1 : currentTurn - 1)

let loading = $state(false)

// @ts-expect-error missing type
let selected: string = $state(combat.nextCombatant.id)

async function onsubmit(event: SubmitEvent) {
	event.preventDefault()
	loading = true
	if (combat.combatant === combatant && combatant.uuid) {
		applyDelay({ combatant })
		await sendGmMoveQuery({
			advanceTurn: true,
			afterId: selected,
			combatantUuid: combatant.uuid,
		})
	}
	shell.close()
}

function displayName(c: CombatantPF2e) {
	if (!game.user.isGM && game.pf2e.settings.tokens.nameVisibility && !c.playersCanSeeName)
		return "?"
	return c.name
}
</script>
