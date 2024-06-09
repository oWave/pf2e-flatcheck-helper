import { EffectPF2e, SpellPF2e } from "types/pf2e/module/item"
import { EmanationRequestData, extractFlagData } from "./emanation"
import { TokenDocumentPF2e } from "types/pf2e/module/scene"
import Module from "./module"

export class EmanationRequestDialog extends Application {
  #request: EmanationRequestData

  cache?: {
    spell: SpellPF2e
    effect: EffectPF2e
    targets: TokenDocumentPF2e[]
    origin: TokenDocumentPF2e
    durationOverride: boolean
  }

  constructor(data: EmanationRequestData) {
    super()

    this.#request = data
  }

  override async getData() {
    if (!this.cache) {
      const [spell, effect, origin] = await Promise.all([
        fromUuid<SpellPF2e>(this.#request.spellUuid),
        fromUuid<EffectPF2e>(this.#request.effectUuid),
        fromUuid<TokenDocumentPF2e>(this.#request.originToken),
      ])
      if (!spell) throw new Error("resolving spell UUID failed")
      if (!effect) throw new Error("resolving effect UUID failed")
      if (!origin) throw new Error("resolving origin UUID failed")
      if (!origin.actor) throw new Error("origin token has no actor")

      const options = extractFlagData(spell)

      const allyAlliance = origin.actor.alliance

      const targets = canvas.tokens.placeables.filter((t) => {
        return (
          ((options.emanationAllies && t.document.actor?.alliance === allyAlliance) ||
            (options.emanationEnemies && t.document.actor?.alliance !== allyAlliance)) &&
          origin.object &&
          t.distanceTo(origin.object) <= spell.system.area!.value &&
          !CONFIG.Canvas.polygonBackends.sight.testCollision(origin.object.center, t.center, {
            mode: "any",
            type: "sight",
          })
        )
      })

      if (options.emanationExcludeSelf) {
        const index = targets.findIndex((t) => t.actor?.id === origin.actor?.id)
        if (index != -1) targets.splice(index, 1)
      }

      this.cache = {
        spell,
        effect,
        targets: targets.map((t) => t.document),
        origin,
        durationOverride: options.emanationPromptDuration,
      }
    }

    return { ...this.cache }
  }

  override activateListeners(html: JQuery): void {
    super.activateListeners(html)

    html.on("submit", (e) => this.submit(e))

    html.find("a.content-link").on("click", () => {
      this.cache!.effect.sheet.render(true)
    })

    html.find('button[data-action="cancel"]').on("click", () => this.close())
  }

  async submit(e: JQuery.SubmitEvent) {
    e.preventDefault()

    const durationOverride = this.element.find('input[type="number"]').val() as number | undefined
    const excludedIds = new Set<string>()
    this.element.find<HTMLInputElement>('input[type="checkbox"]').each((i, el) => {
      if (!el.checked) excludedIds.add(el.dataset["id"]!)
    })

    const data = {
      "system.context.origin": {
        token: this.cache!.origin.uuid,
        actor: this.cache!.origin.actor?.uuid,
        item: this.cache!.effect.uuid,
      },
    }
    if (durationOverride) data["system.duration.value"] = durationOverride

    const effectSource = foundry.utils.mergeObject(this.cache!.effect.toObject(), data)
    for (const target of this.cache!.targets) {
      if (excludedIds.has(target.id)) continue

      target.actor?.createEmbeddedDocuments("Item", [effectSource])
    }
    this.close()
  }

  static override get defaultOptions(): ApplicationOptions {
    return {
      ...super.defaultOptions,
      title: "Emanation Effect",
      template: `modules/${Module.id}/templates/emanation-request.hbs`,
      width: "auto",
      height: "auto",
    }
  }
}
