import Module from "./module"
import { actorEffectBySlug, actorHasEffect } from "./utils"

interface ButtonArgs {
  dmg: number
  source: string
  target: string
  cd?: 1
}

function makeLink(label, args) {
  const textArgs = Object.entries(args)
    .flatMap(([k, v]) => `${k}=${v}`)
    .join("|")
  return `@UUID[Macro.r4cD8JH7OYf9AD9h]{${label}·${textArgs}}`
}

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
  const required = ["source", "target", "dmg"]
  for (const k of required) {
    if (!(k in args)) return ui.notifications.error("Missing arg " + k)
  }

  const source = fromUuidSync(args.source)
  const target = fromUuidSync(args.target)
  if (!target) return ui.notifications.error("No target actor")
  if (!source) return ui.notifications.error("No source actor")
  if (source.id == target.id) return ui.notifications.error("Can't transfer damage to self!")

  // @ts-expect-error pf2e
  const missingHP = target.system.attributes.hp.max - target.system.attributes.hp.value
  const dmg = Math.min(Number(args.dmg), missingHP)

  // @ts-expect-error pf2e
  const hpRemaining = source.system.attributes.hp.value
  const transfer = Math.min(dmg, hpRemaining)

  if (transfer <= 0) return ui.notifications.warn("No HP remaining to transfer.")

  await updateHP(source, -transfer)
  await updateHP(target, transfer)

  if (!!args.cd) {
    // @ts-expect-error pf2e
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

  await ChatMessage.create({
    content: `${transfer} HP transfered.<br>
    <span style="background-color: rgba(0,255,0,0.2);padding: 1px 3px;">${target.name}</span>
    🡰
    <span style="background-color: rgba(255,0,0,0.2);padding: 1px 3px;">${source.name}</span>
    `,
  })
}

export function setupLink() {
  Hooks.on("pf2e.startTurn", async (combatant, combat) => {
    if (!Module.lifeLinkEnabled) return
    if (game?.users?.activeGM?.id !== game.user?.id) return

    const links: string[] = []

    combat.combatants.forEach(({ actor }) => {
      const e = actorEffectBySlug(actor, "spirit-linked")
      if (!e) return
      if (combatant.actor.id != e.origin.id) return

      if (!e.origin || e.origin.id === actor.id)
        return ui.notifications.error(`Bad origin actor for Spirit Linked effect on ${actor.name}! See module readme.`)

      const transfer = e.level * 2
      const missingHP = actor.system.attributes.hp.max - actor.system.attributes.hp.value
      if (missingHP <= 0) return

      links.push(
        makeButton(`${transfer} HP to ${actor.name}`, {
          dmg: transfer,
          source: e.origin.uuid,
          target: actor.uuid,
        })
      )
    })

    const content = `<strong>Spirit Link</strong><br>` + links.join("<br>")

    if (links.length) {
      await ChatMessage.create({
        content,
        whisper: ChatMessage.getWhisperRecipients("GM"),
        speaker: ChatMessage.getSpeaker({ actor: combatant.actor }),
      })
    }
  })

  Hooks.on("createChatMessage", async (msg) => {
    if (!Module.lifeLinkEnabled) return
    if (game.users?.activeGM?.id !== game.user?.id) return

    const flags = msg.flags?.pf2e?.appliedDamage
    const uuid = flags?.uuid
    const dmg = flags?.updates.find((e) => e.path === "system.attributes.hp.value")?.value
    if (!uuid || dmg <= 0) return

    const actor = fromUuidSync(uuid) as Actor
    if (!actor) return
    const e = actorEffectBySlug(actor, "life-linked")
    if (!e) return

    if (!e.origin || e.origin.id === actor.id)
      return ui.notifications.error(`Bad origin actor for Life Linked effect on ${actor.name}! See module readme.`)

    let maxTransfer = 3
    if (Module.lifeLinkVariant === "plus") maxTransfer = 2 + Math.floor((e.level - 1) / 2) * 3
    else {
      if (e.level >= 3) maxTransfer = 5
      if (e.level >= 6) maxTransfer = 10
      if (e.level >= 9) maxTransfer = 15
    }

    const transfer = Math.min(maxTransfer, dmg)

    if (actorHasEffect(actor, "life-link-cd")) return

    const content =
      `<strong>Life Link</strong><br>` +
      makeButton(`${transfer} HP to ${actor.name}`, {
        dmg: transfer,
        cd: 1,
        source: e.origin.uuid,
        target: actor.uuid,
      })

    await ChatMessage.create({
      content,
      whisper: ChatMessage.getWhisperRecipients("GM"),
      speaker: ChatMessage.getSpeaker({ actor: e.origin }),
    })
  })

  Hooks.on("renderChatMessage", (msg, html) => {
    if (!game.user?.isGM) return
    html.find("a.life-link").on("click", async (event) => {
      const args = JSON.parse(event.target.dataset.args!) as ButtonArgs
      await handleTransferButton(args)
    })
  })
}
