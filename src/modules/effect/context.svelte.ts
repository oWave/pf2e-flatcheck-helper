import type {
	ActorPF2e,
	ConditionPF2e,
	ConditionSource,
	EffectPF2e,
	EffectSource,
	GrantItemSource,
	ItemPF2e,
	TokenDocumentPF2e,
} from "@7h3laughingman/pf2e-types"
import { canEditDocuments } from "src/utils"
import {
	getSelectedTokens,
	getTargetedTokens,
	getTokensInRegion,
	isTokenVisible,
	placeEmanationOnToken,
} from "./apply"
import { type Duration, defaultConfig, type EffectButtonConfig } from "./data"

export class TokenEntry {
	checked = $state(true)

	constructor(
		readonly token: TokenDocumentPF2e,
		readonly visible: boolean,
	) {}
}

export interface ApplyContextSource {
	requester: string
	item: string
	effect: string
	originToken: string | null
	tokens: { uuid: string; visible: boolean }[]
	badge: number | null
	duration: Duration
	config: EffectButtonConfig
}

export class ApplyContext {
	origin = $state<TokenDocumentPF2e | null>(null)
	entries = $state<TokenEntry[]>([])
	badge = $state<number | null>(null)
	duration = $state<Duration>({ value: 1, unit: "unlimited" })
	config = $state<EffectButtonConfig>(defaultConfig())

	private constructor(
		readonly item: ItemPF2e<ActorPF2e>,
		readonly effect: EffectPF2e | ConditionPF2e,
		config: EffectButtonConfig,
		readonly requester: User | null,
	) {
		this.config = config
	}

	static forChatButton(data: {
		item: ItemPF2e<ActorPF2e>
		effect: EffectPF2e | ConditionPF2e
		config: EffectButtonConfig
		badge: number | null
		origin: TokenDocumentPF2e | null
		tokens: TokenDocumentPF2e[]
	}) {
		const context = new ApplyContext(data.item, data.effect, data.config, null)
		context.origin = data.origin
		context.badge = data.badge
		context.duration = {
			value: data.effect.system.duration.value,
			unit: data.effect.system.duration.unit,
		}
		context.addTokens(data.tokens)
		return context
	}

	static async fromJSON(source: ApplyContextSource) {
		const [item, effect, origin, entries] = await Promise.all([
			fromUuid<ItemPF2e>(source.item),
			fromUuid<EffectPF2e | ConditionPF2e>(source.effect),
			source.originToken ? fromUuid<TokenDocumentPF2e>(source.originToken) : null,
			Promise.all(
				source.tokens.map(async (t) => {
					const token = await fromUuid<TokenDocumentPF2e>(t.uuid)
					if (!token) throw new Error("Error: At least one token is null")
					return new TokenEntry(token, t.visible)
				}),
			),
		])

		const hasParent = (item: ItemPF2e): item is ItemPF2e<ActorPF2e> => item.parent instanceof Actor

		if (item == null) throw new Error("Error: parent item is null")
		if (!hasParent(item)) throw new Error("Error: parent item has no actor")
		if (effect == null) throw new Error("Error: effect is null")
		if (effect._id == null) throw new Error("Error: effect has no id")

		const requester = game.users.get(source.requester)
		if (!requester) throw new Error("Error: invalid origin user id")

		const context = new ApplyContext(item, effect, source.config, requester)
		context.origin = origin
		context.badge = source.badge
		context.duration = source.duration
		context.entries = entries

		if (!context.entries.length) throw new Error("Error: no tokens")

		return context
	}

	toJSON(): ApplyContextSource {
		return {
			requester: game.user.id,
			item: this.item.uuid,
			effect: this.effect.uuid,
			originToken: this.origin?.uuid ?? null,
			tokens: this.entries
				.filter((e) => e.checked && e.token.actor)
				.map((e) => ({ uuid: e.token.uuid, visible: e.visible })),
			badge: this.badge,
			duration: $state.snapshot(this.duration),
			config: $state.snapshot(this.config),
		}
	}

	get selectedTokens() {
		return this.entries.filter((e) => e.checked && e.token.actor).map((e) => e.token)
	}

	// Hide tokens the player can't see in the list
	// Emanations let players add tokens to the list they can't see
	get visibleEntries() {
		return game.user.isGM ? this.entries : this.entries.filter((e) => e.visible)
	}

	get hasTokens() {
		return this.entries.some((e) => e.checked && e.token.actor)
	}

	// If a player owns all tokens, they can apply the effect. Otherwise send request to GM
	get ownsAllTokens() {
		return canEditDocuments(this.selectedTokens)
		// return !!this.requester
	}

	get hasEmanationConfig() {
		const { radius, affects } = this.config.emanation
		return !!radius && (affects.allies || affects.enemies)
	}

	get durationOverride() {
		return this.config.promptForDuration ? this.duration : null
	}

	addTokens(tokens: TokenDocumentPF2e[]) {
		const existing = new Set(this.entries.map((e) => e.token))
		for (const token of tokens) {
			if (existing.has(token)) continue
			this.entries.push(new TokenEntry(token, isTokenVisible(token)))
		}
	}

	addSelected() {
		this.addTokens(getSelectedTokens())
	}

	addTargets() {
		this.addTokens(getTargetedTokens())
	}

	addEmanationAuto() {
		if (!this.origin) return
		const region = placeEmanationOnToken(this.origin, this.config)
		if (!region) return
		this.addTokens(getTokensInRegion(region, this.config))
	}

	async addEmanationPlace() {
		const { EmanationApp } = await import("./apps/index")
		new EmanationApp({
			radius: this.config.emanation.radius,
			base: this.origin?.height ?? 1,
			callback: (region) => this.addTokens(getTokensInRegion(region, this.config)),
		}).render(true)
	}

	removeAll() {
		this.entries = []
	}

	removeByAlliance(type: "allies" | "enemies") {
		const origin = this.origin?.actor
		if (!origin) return

		this.entries = this.entries.filter((e) => {
			const actor = e.token.actor
			if (!actor) return true
			if (type === "enemies") return !actor.isEnemyOf(origin)
			return !actor.isAllyOf(origin)
		})
	}

	setOriginToken() {
		const token = canvas.tokens.controlled.at(0)
		if (token) this.origin = token.document
	}

	panToOrigin() {
		const object = this.origin?.object
		if (!object) return
		object.control()
		canvas.animatePan(object.center)
	}

	async openConfig() {
		const { EffectConfigApp } = await import("./apps/index")
		const config = await EffectConfigApp.wait(this.item, this.effect.uuid)
		if (config !== "closed") this.config = config
	}

	async apply() {
		const createData = this.effectCreateData()

		await Promise.all(
			this.selectedTokens.map((token) =>
				token.actor?.createEmbeddedDocuments("Item", [createData]),
			),
		)
	}

	private effectCreateData() {
		const context = {
			origin: {
				actor: this.item.actor.uuid,
				item: this.item.uuid,
				token: null,
				rollOptions: [],
				spellcasting: null,
			},
			target: null,
			roll: null,
		}

		if (this.effect.type === "effect") {
			const createData = this.effect.toObject() as EffectSource
			createData.system.context = context
			const duration = this.durationOverride
			if (duration) Object.assign(createData.system.duration, { ...duration })

			return createData
		}

		if (this.effect.type === "condition") {
			const duration = this.durationOverride
			if (duration) {
				const createData = {
					// TODO: Format duration (no value for unlimited, etc.)
					name: `${this.effect.name} ${this.badge} (${duration.value} ${duration.unit})`,
					type: "effect",
					system: {
						rules: [
							{
								key: "GrantItem",
								uuid: this.effect.uuid,
								onDeleteActions: {
									grantee: "restrict",
								},
								inMemoryOnly: true,
								alterations: [
									{
										mode: "override",
										property: "badge-value",
										value: this.badge,
									},
								],
							} as GrantItemSource,
						],
						duration: {
							value: duration.value,
							unit: duration.unit,
							expiry: "turn-start",
							sustained: false,
						},
						context: context,
					},
					img: this.effect.img,
				} satisfies DeepPartial<EffectSource>

				return createData
			} else {
				const createData = this.effect.toObject() as ConditionSource
				if (createData.system.value.isValued) createData.system.value.value = this.badge
				return createData
			}
		}

		throw new Error(`Unknown item type: ${this.effect.type}`)
	}
}
