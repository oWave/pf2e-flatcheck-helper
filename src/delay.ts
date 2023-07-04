import Module from "./module"
import { isJQuery } from "./utils"

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

  new Dialog({
    title: "Delay",
    content: `
    <form>
      <label for="c">Delay after: </label>
      <select id="c">
        ${options}
      </select>
    </form>
    `,
    buttons: {
      cancel: {
        label: "Cancel",
      },
      delay: {
        label: "Delay",
        callback: (html) => {
          if (!isJQuery(html)) return
          const id = html.find("select#c").val()
          if (typeof id !== "string") return
          // Ensure it's still the combatants turn that the macro started with
          if (game.combat?.id !== combat.id || c.id !== game.combat?.combatant?.id) return
          const target = game.combat.combatants.get(id)
          if (!target) return
          combat
            .nextTurn()
            .then(() => {
              Module.socket.executeAsGM("delay", combat.id, c.id, target.id)
            })
            .catch((e) => {
              throw e
            })
        },
      },
    },
  }).render(true)
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
    .then(() =>
      combatant.actor?.createEmbeddedDocuments("Item", [
        {
          type: "effect",
          name: "Delay",
          img: "icons/svg/clockwork.svg",
          system: {
            tokenIcon: { show: true },
            duration: {
              value: 1,
              unit: "rounds",
              sustained: false,
              expiry: "turn-start",
            },
            slug: "x-delay",
          },
        },
      ])
    )
    .catch((e) => {
      throw e
    })
}

export function setup() {
  Hooks.on("renderEncounterTrackerPF2e", (tracker, html: JQuery, data) => {
    const combat = game.combat
    if (!combat) return
    if (!combat.combatant?.isOwner) return
    const div = html.find(".combatant.active .token-initiative")
    div.find(".initiative").hide()

    const button = $(`
    <span id="initiative-delay">
      <i class="fa-solid fa-hourglass"></i>
    </span>
  `)
    button.on("click", (e) => {
      e.stopPropagation()
      delayButton()
    })

    div.append(button)
  })

  Hooks.on("updateCombat", (combat: Combat) => {
    if (game.user && game.user.id === game.users?.activeGM?.id) return
    if (!combat.combatant?.actor) return
    // @ts-expect-error pf2e
    const effect = combat.combatant.actor.items.find((e) => e.slug === "x-delay")
    if (effect) combat.combatant.actor.deleteEmbeddedDocuments("Item", [effect.id!])
  })
}
