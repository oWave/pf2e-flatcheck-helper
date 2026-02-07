import type { ActorPF2e, ChatMessagePF2e, CombatantPF2e, EffectPF2e, ItemPF2e } from "foundry-pf2e"
import { MODULE_ID } from "src/constants"
import MODULE from "src/index"
import { actorEffectBySlug, actorHasEffect, SYSTEM, translate } from "src/utils"
import { BaseModule } from "./base"

export class LifeLinkModule extends BaseModule {
	settingsKey = "lifelink"

	enable() {
		super.enable()

		this.registerHook("pf2e.startTurn", onStartTurn)
		this.registerHook("createItem", onCreateItem)
		this.registerHook("createChatMessage", onCreateMessage)
		this.registerHook("renderChatMessageHTML", onRenderChatMessage)
	}
}

interface ButtonArgs {
	// HP to transfer from source to target
	// Stops if source doesn't have enough HP
	transfer?: number
	// HP to restore to target
	heal?: number
	// HP to remove from source
	dmg?: number
	source: string
	target: string
	cd?: 1
}

const UNDO_BUTTON_MARKUP = `<button type="button" class="fc-undo-button" data-tooltip="PF2E.RevertDamage.ButtonTooltip" data-tooltip-direction="UP"><i class="fa-solid fa-rotate-left"></i></button>`

function makeButton(label: string, args: ButtonArgs) {
	const json = JSON.stringify(args)
	return `
  <a class="content-link life-link" data-args='${json}'>
    <i class="fa-solid fa-heart-pulse"></i>
    ${label}
  </a>
  `
}

async function updateHP(actor, delta) {
	const hp = actor.system.attributes.hp.value
	await actor.update({
		"system.attributes.hp.value": hp + delta,
	})
}

async function handleTransferButton(args: ButtonArgs) {
	const required = ["source", "target"]
	for (const k of required) {
		if (!(k in args)) return ui.notifications.error(`Missing arg ${k}`)
	}

	const source = fromUuidSync(args.source)
	const target = fromUuidSync(args.target)
	if (!target) return ui.notifications.error(translate("life-link.error-no-target"))
	if (!source) return ui.notifications.error(translate("life-link.error-no-source"))
	if (source.id === target.id)
		return ui.notifications.error(translate("life-link.error-source-is-target"))

	let transfer = 0

	if (args.transfer) {
		const missingHP =
			// @ts-expect-error pf2e
			target.system.attributes.hp.max - target.system.attributes.hp.value
		const maxTransfer = Math.min(Number(args.transfer), missingHP)

		// @ts-expect-error pf2e
		const hpRemaining = source.system.attributes.hp.value
		transfer = Math.min(maxTransfer, hpRemaining)

		if (transfer <= 0) return ui.notifications.warn(translate("life-link.no-hp-remaining"))
	}

	let heal = transfer
	let dmg = transfer

	// If the HP transfer (from life link) reduces the source to 0, share life no longer applies
	// @ts-expect-error pf2e
	if (transfer < source.system.attributes.hp.value) {
		heal += args.heal ?? 0
		dmg += args.dmg ?? 0
	}
	await updateHP(source, -dmg)
	await updateHP(target, heal)

	if (args.cd) {
		await target.createEmbeddedDocuments("Item", [
			{
				type: "effect",
				name: translate("life-link.life-link-cooldown-effect"),
				img: SYSTEM.filePath("icons/spells/life-link.webp"),
				system: {
					tokenIcon: { show: true },
					duration: {
						value: 1,
						unit: "rounds",
						sustained: false,
						expiry: "turn-start",
					},
					slug: "life-link-cd",
				},
			},
		])
	}

	await ChatMessage.create({
		content: `<span class="undo-text">
    <span style="background-color: rgba(0,255,0,0.2);padding: 1px 3px;">${translate("life-link.hp-add", { actor: String(target.name), hp: heal })}</span>
    🡰
    <span style="background-color: rgba(255,0,0,0.2);padding: 1px 3px;">${translate("life-link.hp-sub", { actor: String(source.name), hp: dmg })}</span>
    </span>
    ${UNDO_BUTTON_MARKUP}
    `,
		flags: {
			[MODULE_ID]: {
				undo: [
					[source.uuid, dmg],
					[target.uuid, -heal],
				],
			},
		},
	})
}

function handleSpiritLink(effect: EffectPF2e) {
	const { actor, origin } = effect

	if (!actor) {
		return null
	}

	if (!origin || origin.id === actor.id) {
		ui.notifications.error(
			translate("life-link.spirit-link-error-bad-actor", { actor: actor.name }),
		)
		return null
	}

	const transfer = effect.level * 2
	const missingHP = actor.system.attributes.hp!.max - actor.system.attributes.hp!.value
	if (missingHP <= 0) return null

	return makeButton(
		translate("life-link.spirit-link-button", { hp: transfer, actor: actor.name }),
		{
			transfer,
			source: origin.uuid,
			target: actor.uuid,
		},
	)
}

async function onStartTurn(combatant: CombatantPF2e) {
	if (game?.users?.activeGM?.id !== game.user?.id) return

	const links: string[] = []

	canvas.scene?.tokens.forEach(({ actor }) => {
		if (!actor) return
		const e = actorEffectBySlug(actor, "spirit-linked")
		if (!e) return
		if (combatant.actor?.id !== e.origin?.id) return

		const link = handleSpiritLink(e)
		if (link) links.push(link)
	})

	const content = translate("life-link.spirit-link-message", { link: links.join("<br>") })

	if (links.length) {
		await ChatMessage.create({
			content: content,
			whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
			speaker: ChatMessage.getSpeaker({ actor: combatant.actor }),
		})
	}
}

async function onCreateItem(item: ItemPF2e) {
	if (item.isOfType("effect") && item.slug === "spirit-linked") {
		const link = handleSpiritLink(item)
		if (link) {
			await ChatMessage.create({
				content: translate("life-link.spirit-link-message", { link }),
				whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
				speaker: ChatMessage.getSpeaker({ actor: item.actor }),
			})
		}
	}
}

async function onCreateMessage(msg: ChatMessagePF2e) {
	if (game.users?.activeGM?.id !== game.user?.id) return

	const flags = msg.flags?.[SYSTEM.id]?.appliedDamage
	const uuid = flags?.uuid
	const dmg = flags?.updates.find((e) => e.path === "system.attributes.hp.value")?.value
	if (!uuid || !dmg || dmg <= 0) return

	const actor = fromUuidSync(uuid) as ActorPF2e
	if (!actor) return

	let lifeLinkTransfer = 0

	const lifeLinkEffect = actorEffectBySlug(actor, "life-linked")
	if (lifeLinkEffect && !actorHasEffect(actor, "life-link-cd")) {
		lifeLinkTransfer = (() => {
			if (!lifeLinkEffect.origin || lifeLinkEffect.origin.id === actor.id) {
				ui.notifications.error(
					translate("life-link.life-link-error-bad-actor", { actor: actor.name }),
					{
						permanent: true,
					},
				)
				return 0
			}

			let maxTransfer = 3
			if (MODULE.settings.lifeLinkVariant === "plus")
				maxTransfer = 2 + Math.floor((lifeLinkEffect.level - 1) / 2) * 3
			else {
				if (lifeLinkEffect.level >= 3) maxTransfer = 5
				if (lifeLinkEffect.level >= 6) maxTransfer = 10
				if (lifeLinkEffect.level >= 9) maxTransfer = 15
			}

			return Math.min(maxTransfer, dmg)
		})()
	}

	const shareLifeEffect = actorEffectBySlug(actor, "share-life")

	if (shareLifeEffect && !shareLifeEffect?.origin)
		ui.notifications.error(
			translate("life-link.share-life-error-bad-actor", { actor: actor.name }),
			{
				permanent: true,
			},
		)

	const buttons: string[] = []
	;(() => {
		if (shareLifeEffect && lifeLinkTransfer) {
			const remainingDmg = dmg - lifeLinkTransfer

			if (
				shareLifeEffect?.origin &&
				lifeLinkEffect?.origin &&
				shareLifeEffect.origin.uuid === lifeLinkEffect.origin.uuid
			) {
				// Both effects from the same source -> One Button
				buttons.push(
					makeButton(
						translate("life-link.damage-button", {
							damage: Math.ceil(remainingDmg / 2) + lifeLinkTransfer,
							actor: lifeLinkEffect.origin.name,
						}),
						{
							transfer: lifeLinkTransfer,
							heal: remainingDmg === 1 ? 1 : Math.ceil(remainingDmg / 2),
							dmg: Math.ceil(remainingDmg / 2),
							cd: 1,
							source: lifeLinkEffect.origin.uuid,
							target: actor.uuid,
						},
					),
				)
				return
			}
		}
		// return above means this is unreachable if both effects are from the same source
		if (shareLifeEffect?.origin) {
			const remainingDmg = dmg - lifeLinkTransfer
			// Button for Share Life
			if (remainingDmg)
				buttons.push(
					makeButton(
						translate("life-link.share-life-damage-button", {
							damage: Math.ceil(remainingDmg / 2),
							actor: shareLifeEffect.origin.name,
						}),
						{
							heal: remainingDmg === 1 ? 1 : Math.ceil(remainingDmg / 2),
							dmg: Math.ceil(remainingDmg / 2),
							source: shareLifeEffect.origin.uuid,
							target: actor.uuid,
						},
					),
				)
		}
		if (lifeLinkEffect?.origin && lifeLinkTransfer) {
			buttons.push(
				makeButton(
					translate("life-link.life-link-damage-button", {
						damage: lifeLinkTransfer,
						actor: lifeLinkEffect.origin.name,
					}),
					{
						transfer: lifeLinkTransfer,
						cd: 1,
						source: lifeLinkEffect.origin.uuid,
						target: actor.uuid,
					},
				),
			)
		}
	})()

	if (buttons.length) {
		await ChatMessage.create({
			content: translate("life-link.damage-transfer-message", { buttons: buttons.join("<br>") }),
			whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
			speaker: ChatMessage.getSpeaker(actor),
		})
	}
}

function onRenderChatMessage(msg: ChatMessagePF2e, html: HTMLElement) {
	if (!game.user?.isGM) return
	html.querySelector("a.life-link")?.addEventListener("click", async (event) => {
		if (!(event.target instanceof HTMLElement)) return
		const args = JSON.parse(event.target.dataset.args!) as ButtonArgs
		await handleTransferButton(args)
	})
	html.querySelector("button.fc-undo-button")?.addEventListener("click", async () => {
		const data = msg.flags[MODULE_ID]?.undo as [string, number][]
		for (const [uuid, dmg] of data) {
			const actor = await fromUuid(uuid)
			await updateHP(actor, dmg)
		}
		html.querySelector<HTMLElement>(".undo-text")?.classList.add("undo")
		await msg.update({
			content: html.querySelector(".message-content")?.innerHTML,
		})
	})
}
