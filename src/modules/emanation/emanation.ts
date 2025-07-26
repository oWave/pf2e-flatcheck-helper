import type { ChatMessagePF2e, ItemPF2e, SpellPF2e, SpellSheetPF2e } from "foundry-pf2e"
import { MODULE_ID } from "src/constants"
import MODULE from "src/index"
import { parseHTML, translate } from "src/utils"
import { BaseModule } from "../base"
import { EmanationRequestDialog } from "./emanation-dialog"

export class EmanationModule extends BaseModule {
	settingsKey = "emanation-automation"

	enable(): void {
		if (!game.modules.get("lib-wrapper")?.active) return

		super.enable()

		this.registerHook("renderChatMessageHTML", onChatMessage)
	}

	onReady(): void {
		this.registerWrapper(
			'CONFIG.Item.sheetClasses.spell["pf2e.SpellSheetPF2e"].cls.prototype._renderInner',
			spellSheetRenderWrapper,
			"WRAPPER",
		)

		this.registerWrapper(
			'CONFIG.Item.sheetClasses.spell["pf2e.SpellSheetPF2e"].cls.prototype.activateListeners',
			spellSheetActivateListenersWrapper,
			"WRAPPER",
		)
	}
}

export interface EmanationRequestData {
	/** Spell UUID */
	spellUuid: string
	/** Effect UUID */
	effectUuid: string
	/** Origin Token UUID */
	originToken: string
}

export function extractFlagData(item: SpellPF2e) {
	const emanationAllies = item.getFlag(MODULE_ID, "emanation-allies") as boolean
	const emanationEnemies = item.getFlag(MODULE_ID, "emanation-enemies") as boolean
	const emanationExcludeSelf = item.getFlag(MODULE_ID, "emanation-exclude-self") as boolean
	const emanationPromptDuration = item.getFlag(MODULE_ID, "emanation-prompt-duration") as boolean

	return {
		emanationAllies,
		emanationEnemies,
		emanationExcludeSelf,
		emanationPromptDuration,
	}
}

function isValidSpell(item: SpellPF2e) {
	return item.system.area?.type === "emanation" && item.system.area.value && !item.system.defense
}

function extractEffectUUIDs(item: SpellPF2e) {
	if (!isValidSpell(item)) return null

	const matches = [...item.system.description.value.matchAll(/@UUID\[(.+?)\]/g)]

	return matches.reduce<string[]>((acc, match) => {
		const id = match.at(1)
		id && acc.push(id)
		return acc
	}, [])
}

async function extractEffects(item: SpellPF2e) {
	const uuids = extractEffectUUIDs(item)
	if (!uuids) return []

	const effects = (await Promise.all(uuids.map((id) => fromUuid<ItemPF2e>(id)))).filter(
		(e) => typeof e?.isOfType === "function" && e?.isOfType("effect"),
	)
	return effects
}

async function onChatMessage(msg: ChatMessagePF2e, html: HTMLElement) {
	if (!MODULE.settings.emanationAutomation) return
	if (!game.user.isGM) return
	if (!msg.item || !msg.item.isOfType("spell")) return
	const spell = msg.item
	const range = spell.system.area?.type === "emanation" ? spell.system.area?.value : null
	const token = msg.actor?.getActiveTokens().at(0)
	if (!token || !range) return

	const options = extractFlagData(spell)
	const effect = (await extractEffects(spell)).at(0)

	if (!effect || !(options.emanationAllies || options.emanationEnemies)) return

	const buttonElement = parseHTML(`<div class="spell-button">
		<button type="button" data-action="emanation-automation">${translate("emanation.message-text")}</button>
	</div>`)
	buttonElement.querySelector("button")?.addEventListener("click", () => {
		new EmanationRequestDialog({
			spellUuid: spell.uuid,
			effectUuid: effect.uuid,
			originToken: token.document.uuid,
		}).render(true)
	})

	html.querySelector("section.card-buttons")?.append(buttonElement)
}

async function spellSheetRenderInner(sheet: SpellSheetPF2e, $html: JQuery) {
	if (!isValidSpell(sheet.item)) return
	const effects = await extractEffects(sheet.item)
	if (!effects) return

	const { emanationAllies, emanationExcludeSelf, emanationEnemies, emanationPromptDuration } =
		extractFlagData(sheet.item)

	const checked = (value: boolean) => (value ? "checked" : "")

	const content =
		effects.length === 1
			? `
  <div class="form-group">
    <label>Apply to</label>
    <div class="form-fields" style="justify-content: start">
      <input type="checkbox" id="field-${sheet.id}-emanation-allies" ${checked(emanationAllies)}>
      <label for="field-${sheet.id}-emanation-allies">${translate("emanation.form-allies")}</label>

      <input type="checkbox" id="field-${sheet.id}-emanation-exclude-self" ${checked(emanationExcludeSelf)}>
      <label for="field-${sheet.id}-emanation-self">${translate("emanation.form-exclude-self")}</label>

      <input type="checkbox" id="field-${sheet.id}-emanation-enemies" ${checked(emanationEnemies)}>
      <label for="field-${sheet.id}-emanation-enemies">${translate("emanation.form-enemies")}</label>
    </div>
  </div>
  <div class="form-group" title="${translate("emanation.form-duration-title")}">
    <label for="field-${sheet.id}-emanation-prompt-duration">${translate("emanation.form-duration-prompt")}</label>
    <div class="form-fields" style="justify-content: start">
      <input type="checkbox" id="field-${sheet.id}-emanation-prompt-duration" ${checked(emanationPromptDuration)}>
      <i class="fa-solid fa-circle-info" style="cursor: help;"></i>
    </div>
  </div>
`
			: `<p>${translate("emanation.form-formatting-error")}</p>`

	$html.find("fieldset.publication").before(`
    <fieldset class="emanation-automation">
      <legend>
        ${translate("emanation.form-fieldset-legend")}
        <span style="font-weight: lighter;">(pf2e Utility Buttons)</span>
      </legend>

      ${content}

    </fieldset>
  `)
}

async function spellSheetRenderWrapper(this: SpellSheetPF2e, wrapped, ...args) {
	const $html = await wrapped(...args)

	try {
		if (MODULE.settings.emanationAutomation) await spellSheetRenderInner(this, $html)
	} catch (e) {
		ui.notifications.error("Could not insert emanation automation into spell sheet.")
		console.error(e)
	}

	return $html
}

function spellSheetActivateListenersWrapper(this: SpellSheetPF2e, wrapped, $html: JQuery) {
	wrapped($html)

	$html.find<HTMLInputElement>(`input#field-${this.id}-emanation-allies`).on("change", (e) => {
		this.item.setFlag(MODULE_ID, "emanation-allies", e.target.checked)
	})
	$html.find<HTMLInputElement>(`input#field-${this.id}-emanation-enemies`).on("change", (e) => {
		this.item.setFlag(MODULE_ID, "emanation-enemies", e.target.checked)
	})
	$html
		.find<HTMLInputElement>(`input#field-${this.id}-emanation-exclude-self`)
		.on("change", (e) => {
			this.item.setFlag(MODULE_ID, "emanation-exclude-self", e.target.checked)
		})
	$html
		.find<HTMLInputElement>(`input#field-${this.id}-emanation-prompt-duration`)
		.on("change", (e) => {
			this.item.setFlag(MODULE_ID, "emanation-prompt-duration", e.target.checked)
		})

	return $html
}
