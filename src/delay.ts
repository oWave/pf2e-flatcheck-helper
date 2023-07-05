import Module from "./module"
import { isJQuery } from "./utils"

async function applyDelayEffect(actor: Actor) {
  return actor.createEmbeddedDocuments("Item", [
    {
      type: "effect",
      name: "Delay",
      img: "icons/svg/clockwork.svg",
      system: {
        tokenIcon: { show: true },
        duration: {
          value: -1,
          unit: "encounter",
          sustained: false,
          expiry: "turn-start",
        },
        slug: "x-delay",
      },
    },
  ])
}

function isDelaying(actor: Actor) {
  // @ts-expect-error pf2e
  return actor.items.some((e) => e.slug === "x-delay")
}

function removeDelaying(actor: Actor) {
  // @ts-expect-error pf2e
  const e = actor.items.find((e) => e.slug === "x-delay")
  if (e?.id) actor.deleteEmbeddedDocuments("Item", [e.id])
}

const sortedCombatants = () => {
  if (!game.combat) throw new Error("No combat?")
  return game.combat.combatants
    .filter((e) => e.initiative !== null)
    .sort((a, b) =>
      a.initiative != b.initiative
        ? b.initiative! - a.initiative!
        : // @ts-expect-error pf2e
          a.flags.pf2e.overridePriority[a.initiative] - b.flags.pf2e.overridePriority[b.initiative]
    )
}

export function delayButton() {
  const combat = game.combat
  if (!combat) return ui.notifications.error("No combat active")
  const c = combat.combatant
  if (!c) return ui.notifications.error("No combatant")
  if (!c.token?.isOwner) return ui.notifications.error("You do not own the current combatant")

  const options = sortedCombatants().map((e) => {
    const disabled = e.id === c.id ? "disabled" : ""
    return `<option value="${e.id}" ${disabled}>${e.initiative} - ${e.name}</option>`
  })

  if (!Module.delayShouldPrompt) {
    if (c.actor) applyDelayEffect(c.actor)
    combat.nextTurn()
    return
  }

  new Dialog(
    {
      title: "Delay",
      content: `
    <form style="margin: 5px 0 10px 0; text-align: center;">
      <label for="c">Delay after: </label>
      <select id="c">
        ${options}
      </select>
    </form>
    `,
      buttons: {
        cancel: {
          label: "Cancel",
          icon: `<i class="fa-solid fa-xmark"></i>`,
        },
        delay: {
          label: "Delay",
          icon: `<i class="fa-solid fa-hourglass"></i>`,
          callback: (html) => {
            if (!isJQuery(html)) return
            const id = html.find("select#c").val()
            if (typeof id !== "string") return
            // Ensure it's still the combatants turn that the dialog opened with
            if (game.combat?.id !== combat.id || c.id !== game.combat?.combatant?.id) return
            const target = game.combat.combatants.get(id)
            if (!target) return
            if (c.actor) applyDelayEffect(c.actor)
            combat
              .nextTurn()
              .then(() => Module.socket.executeAsGM("moveAfter", combat.id, c.id, target.id))
              .catch((e) => {
                throw e
              })
          },
        },
      },
    },
    // Prevents opening the dialog multiple times
    { id: `${Module.id}-delay` }
  ).render(true)
}

function returnButton(combatant: Combatant) {
  if (game.combat && game.combat.combatant)
    Module.socket.executeAsGM("moveAfter", game.combat.id, combatant.id, game.combat.combatant.id)
}

export function moveAfter(combatId: string, combatantId: string, afterId: string) {
  const combat = game.combats?.get(combatId)
  if (!combat) return
  const combatant = combat.combatants.get(combatantId)
  const after = combat.combatants.get(afterId)

  if (!combatant || !after) return

  const targetInitiative = after.initiative
  // @ts-expect-error pf2e
  const targetPriority = after.flags.pf2e.overridePriority[targetInitiative] + 1
  const updates = [
    {
      id: combatant.id,
      value: targetInitiative,
      overridePriority: targetPriority,
    },
  ]
  let i = targetPriority + 1
  sortedCombatants()
    .filter(
      (e) =>
        e.id !== combatant.id &&
        e.initiative == targetInitiative &&
        // @ts-expect-error pf2e
        e.flags.pf2e.overridePriority[targetInitiative] >= targetPriority
    )
    .forEach((e) =>
      updates.push({
        id: e.id,
        value: targetInitiative,
        overridePriority: i++,
      })
    )

  /*
  console.log("--Updates--")
  updates.forEach((e) => {
    const c = game.combat?.combatants.get(e.id)
    console.log(
      `${c?.name} ${c?.initiative} ${c?.flags.pf2e.overridePriority[c?.initiative]} -> ${e.value} ${e.overridePriority}`
    )
  })
  */
  game.combat
    // @ts-expect-error pf2e
    ?.setMultipleInitiatives(updates)
    .catch((e) => {
      throw e
    })
}

function drawButton(type: "delay" | "return", combatentHtml: JQuery, combatant: Combatant) {
  let button = $(`
    <div id="initiative-delay" title="Delay">
      <i class="fa-solid fa-hourglass"></i>
    </div>
  `)
  if (type === "return") {
    const title = Module.allowReturn ? "Return to initiative" : "Delaying"
    const cls = Module.allowReturn ? "initiative-return" : "initiative-delay-indicator"
    button = $(`
      <div id="initiative-return" class="${cls}" title="${title}">
        <img class="delay-indicator" src="/icons/svg/clockwork.svg"></img>
        <i class="fa-solid fa-play"></i>
      </div>
    `)
  }

  const div = combatentHtml.find(".token-initiative")
  div.find(".initiative").hide()
  div.append(button)

  button.on("click", (e) => {
    e.stopPropagation()
    if (type === "delay") delayButton()
    else if (Module.allowReturn) returnButton(combatant)
  })
}

function onRenderCombatTracker(tracker, html: JQuery, data) {
  if (!Module.delayEnabled) return
  const combat = game.combat
  if (!combat) return

  html.find(".combatant.actor").each((i, e) => {
    const id = e.dataset["combatantId"]
    if (!id) return
    const c = combat.combatants.get(id)
    if (!c || !c.isOwner) return

    if (combat.combatant?.id == c.id) drawButton("delay", $(e), c)
    else if (c.actor && isDelaying(c.actor)) drawButton("return", $(e), c)
  })
}

export function setupDelay() {
  Hooks.on("renderEncounterTrackerPF2e", onRenderCombatTracker)

  Hooks.on("updateCombat", (combat: Combat) => {
    if (game.user && game.user.id !== game.users?.activeGM?.id) return
    if (!combat.combatant?.actor) return
    removeDelaying(combat.combatant.actor)
  })

  Hooks.on("createChatMessage", (msg) => {
    if (msg.user.id !== game.user?.id) return
    if (!game.combat || !game.combat.combatant?.isOwner) return
    const item = msg?.item
    if (
      item &&
      item?.type === "action" &&
      (item.name === "Delay" || item.flags?.core?.sourceId === "Compendium.pf2e.actionspf2e.Item.A72nHGUtNXgY5Ey9")
    )
      delayButton()
  })
}
