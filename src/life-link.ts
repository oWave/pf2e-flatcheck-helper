import Module from "./module"
import { actorEffectBySlug, actorHasEffect } from "./utils"
import type { CombatantPF2e, EncounterPF2e } from "types/pf2e/module/encounter"
import type { ActorPF2e, ChatMessagePF2e } from "types/pf2e/module/documents"
import type { EffectPF2e, ItemPF2e } from "types/pf2e/module/item"

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
    if (!(k in args)) return ui.notifications.error("Missing arg " + k)
  }

  const source = fromUuidSync(args.source)
  const target = fromUuidSync(args.target)
  if (!target) return ui.notifications.error("No target actor")
  if (!source) return ui.notifications.error("No source actor")
  if (source.id == target.id) return ui.notifications.error("Can't transfer damage to self!")

  let transfer = 0

  if (args.transfer) {
    // @ts-expect-error pf2e
    const missingHP = target.system.attributes.hp.max - target.system.attributes.hp.value
    const maxTransfer = Math.min(Number(args.transfer), missingHP)

    // @ts-expect-error pf2e
    const hpRemaining = source.system.attributes.hp.value
    transfer = Math.min(maxTransfer, hpRemaining)

    if (transfer <= 0) return ui.notifications.warn("No HP remaining to transfer.")
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
        name: "Life Link CD",
        img: "systems/pf2e/icons/spells/life-link.webp",
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

  // @ts-expect-error Using uuids as keys doesn't work, but this does. Only question is when does this break
  await ChatMessage.create({
    content: `<span class="undo-text">
    <span style="background-color: rgba(0,255,0,0.2);padding: 1px 3px;">${target.name} +${heal} HP</span>
    🡰
    <span style="background-color: rgba(255,0,0,0.2);padding: 1px 3px;">${source.name} -${dmg} HP</span>
    </span>
    ${UNDO_BUTTON_MARKUP}
    `,
    flags: {
      undo: [
        [source.uuid, dmg],
        [target.uuid, -heal],
      ],
    },
  })
}

function handleSpiritLink(effect: EffectPF2e) {
  const { actor, origin } = effect

  if (!actor) {
    return null
  }

  if (!origin || origin.id === actor.id) {
    ui.notifications.error(`Bad origin actor for Spirit Linked effect on ${actor.name}! See module readme.`)
    return null
  }

  const transfer = effect.level * 2
  const missingHP = actor.system.attributes.hp!.max - actor.system.attributes.hp!.value
  if (missingHP <= 0) return null

  return makeButton(`${transfer} HP to ${actor.name}`, {
    transfer,
    source: origin.uuid,
    target: actor.uuid,
  })
}

export function setupLink() {
  Hooks.on<[CombatantPF2e, EncounterPF2e]>("pf2e.startTurn", async (combatant) => {
    if (!Module.lifeLinkEnabled) return
    if (game?.users?.activeGM?.id !== game.user?.id) return

    const links: string[] = []

    canvas.scene?.tokens.forEach(({ actor }) => {
      if (!actor) return
      const e = actorEffectBySlug(actor, "spirit-linked")
      if (!e) return
      if (combatant.actor?.id != e.origin?.id) return

      const link = handleSpiritLink(e)
      if (link) links.push(link)
    })

    const content = `<strong>Spirit Link</strong><br>` + links.join("<br>")

    if (links.length) {
      await ChatMessage.create({
        content: content,
        whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
        speaker: ChatMessage.getSpeaker({ actor: combatant.actor }),
      })
    }
  })

  Hooks.on<[ItemPF2e]>("createItem", async (item) => {
    if (item.isOfType("effect") && item.slug == "spirit-linked") {
      const link = handleSpiritLink(item)
      if (link) {
        await ChatMessage.create({
          content: "<strong>Spirit Link</strong><br>" + link,
          whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
          speaker: ChatMessage.getSpeaker({ actor: item.actor }),
        })
      }
    }
  })

  Hooks.on("createChatMessage", async (msg) => {
    if (!Module.lifeLinkEnabled) return
    if (game.users?.activeGM?.id !== game.user?.id) return

    const flags = (<ChatMessagePF2e>msg).flags?.pf2e?.appliedDamage
    const uuid = flags?.uuid
    const dmg = flags?.updates.find((e) => e.path === "system.attributes.hp.value")?.value
    if (!uuid || !dmg || dmg <= 0) return

    const actor = fromUuidSync(uuid) as ActorPF2e
    if (!actor) return

    let lifeLinkTransfer = 0

    const lifeLinkEffect = actorEffectBySlug(actor, "life-linked")
    if (lifeLinkEffect && !actorHasEffect(actor, "life-link-cd")) {
      lifeLinkTransfer = (function () {
        if (!lifeLinkEffect.origin || lifeLinkEffect.origin.id === actor.id) {
          ui.notifications.error(`Bad origin actor for Life Linked effect on ${actor.name}! See module readme.`, {
            permanent: true,
          })
          return 0
        }

        let maxTransfer = 3
        if (Module.lifeLinkVariant === "plus") maxTransfer = 2 + Math.floor((lifeLinkEffect.level - 1) / 2) * 3
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
      ui.notifications.error(`Bad origin actor for Share Life effect on ${actor.name}! See module readme.`, {
        permanent: true,
      })

    const buttons: string[] = []
    ;(function () {
      if (shareLifeEffect && lifeLinkTransfer) {
        const remainingDmg = dmg - lifeLinkTransfer

        if (
          shareLifeEffect?.origin &&
          lifeLinkEffect?.origin &&
          shareLifeEffect.origin.uuid == lifeLinkEffect.origin.uuid
        ) {
          // Both effects from the same source -> One Button
          buttons.push(
            makeButton(`${Math.ceil(remainingDmg / 2) + lifeLinkTransfer} to ${lifeLinkEffect.origin.name}`, {
              transfer: lifeLinkTransfer,
              heal: remainingDmg == 1 ? 1 : Math.floor(remainingDmg / 2),
              dmg: Math.ceil(remainingDmg / 2),
              cd: 1,
              source: lifeLinkEffect.origin.uuid,
              target: actor.uuid,
            })
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
            makeButton(`(Share Life) ${Math.ceil(remainingDmg / 2)} to ${shareLifeEffect.origin.name}`, {
              heal: remainingDmg == 1 ? 1 : Math.floor(remainingDmg / 2),
              dmg: Math.ceil(remainingDmg / 2),
              source: shareLifeEffect.origin.uuid,
              target: actor.uuid,
            })
          )
      }
      if (lifeLinkEffect && lifeLinkEffect.origin && lifeLinkTransfer) {
        buttons.push(
          makeButton(`(Life Link) ${lifeLinkTransfer} to ${lifeLinkEffect.origin.name}`, {
            transfer: lifeLinkTransfer,
            cd: 1,
            source: lifeLinkEffect.origin.uuid,
            target: actor.uuid,
          })
        )
      }
    })()

    if (buttons.length) {
      await ChatMessage.create({
        content: `<strong>Damage Transfer</strong><br>` + buttons.join("<br>"),
        whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
        speaker: ChatMessage.getSpeaker(actor),
      })
    }
  })

  Hooks.on("renderChatMessage", (msg, html) => {
    if (!game.user?.isGM) return
    html.find("a.life-link").on("click", async (event) => {
      const args = JSON.parse(event.target.dataset.args!) as ButtonArgs
      await handleTransferButton(args)
    })
    html.find("button.fc-undo-button").on("click", async () => {
      const data = msg.flags.undo as unknown as [string, number][]
      for (const [uuid, dmg] of data) {
        const actor = await fromUuid(uuid)
        await updateHP(actor, dmg)
      }
      html.find(".undo-text").addClass("undo")
      await msg.update({
        content: html.find(".message-content").html(),
      })
    })
  })
}
