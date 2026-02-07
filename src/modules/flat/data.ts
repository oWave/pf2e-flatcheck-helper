import type { ActorPF2e, ChatMessagePF2e, TokenDocumentPF2e } from "foundry-pf2e"
import * as R from "remeda"
import type { MsgFlagData } from "./message"
import { flatMessageConfig } from "./message-config"
import { Adjustments, type DcAdjustment, type TreatAsAdjustment } from "./rules/common"
import { flatCheckRollOptions } from "./rules/options"
import { type BaseTargetFlatCheck, TargetFlatCheckHelper } from "./target"

export interface FlatCheckSource {
	type: string
	origin?: { label?: string; slug: string; reasons?: string[] }
	baseDc: number | null
}

export interface FlatCheckData extends FlatCheckSource {
	finalDc: number | null
	dcAdjustments?: DcAdjustment[]
	conditionAdjustments?: TreatAsAdjustment[]
	secret?: true
}

export type FlatCheckRecord = Record<string, FlatCheckData>

export async function collectFlatChecks(msg: ChatMessagePF2e): Promise<MsgFlagData | null> {
	if (!msg.author) return null

	if (msg.target?.token) {
		return FlatCheckHelper.fromMessage(msg, msg.target.token)
	}

	const checks = game.user.targets.size
		? [...game.user.targets].map((t) => FlatCheckHelper.fromMessage(msg, t.document))
		: [FlatCheckHelper.fromMessage(msg)]
	if (checks.length === 0) return null
	if (checks.length === 1) return checks[0]

	const merged: MsgFlagData = {}
	let targetCount = 0
	for (const check of checks) {
		for (const [key, slot] of Object.entries(await check)) {
			if (slot.finalDc == null || slot.finalDc <= 1) continue
			if (key === "target") {
				targetCount++
			} else if ((merged[key]?.finalDc ?? 0) < slot.finalDc) {
				merged[key] = slot
			}
		}
	}

	if (targetCount > 0) {
		merged.target = { targetCount }
	}

	return merged
}

export class FlatCheckHelper {
	static fromMessage(msg: ChatMessagePF2e, target?: TokenDocumentPF2e) {
		if (!msg.actor) throw new Error("Message has no actor")

		const msgTarget = msg.target?.token
		if (msgTarget && target && msgTarget !== target)
			throw new Error(
				`fromMessage called with a target (${target.uuid}) that doesn't match the message's target (${msgTarget.uuid})`,
			)

		const checkTarget = msgTarget ?? target

		const instance = new FlatCheckHelper(msg, checkTarget ?? null)
		return instance.calculateChecks()
	}

	static fromTokens(origin: TokenDocumentPF2e | null, target: TokenDocumentPF2e | null) {
		const instance = new FlatCheckHelper(origin, target)
		return instance.calculateChecks()
	}

	private adjustments: Adjustments
	private msg?: ChatMessagePF2e
	private token?: TokenDocumentPF2e
	private actor?: ActorPF2e

	private rollOptions: string[]
	constructor(
		origin: ChatMessagePF2e | TokenDocumentPF2e | null,
		private target: TokenDocumentPF2e | null,
	) {
		if (origin instanceof getDocumentClass("ChatMessage")) {
			this.msg = origin
			if (!origin.token) throw new Error("Message has no token")
			this.token = origin.token
			if (!this.token.actor) throw new Error("Token has no actor")
			this.actor = this.token.actor
		} else if (origin instanceof getDocumentClass("Token")) {
			this.token = origin
			if (!this.token.actor) throw new Error("Token has no actor")
			this.actor = this.token.actor
		}

		let options: string[] = []
		if (this.msg) options = flatCheckRollOptions.forRollMessage(this.msg)
		if (options.length === 0)
			options = flatCheckRollOptions.forMixed({
				msg: this.msg,
				origin: this.token,
				target: this.target ?? undefined,
			})

		options.push(
			...flatCheckRollOptions.lightLevelOptions({
				msg: this.msg,
				self: this.token?.object,
				target: this.target?.object,
			}),
		)

		this.rollOptions = options

		this.adjustments = new Adjustments(this.actor ?? null, this.target?.actor ?? null)
	}

	#collectOriginSources() {
		const sources: FlatCheckSource[] = []

		const { ignored } = flatMessageConfig.toSets()

		if (this.actor && this.msg) {
			if (
				!ignored.has("manipulate") &&
				this.actor.conditions.stored.some((c) => c.slug === "grabbed") &&
				this.msg.item?.system.traits.value?.some((t) => t === "manipulate")
			) {
				sources.push({ type: "grabbed", origin: { slug: "manipulate" }, baseDc: 5 })
			}

			if (
				!ignored.has("deafened") &&
				this.actor.conditions.stored.some((c) => c.slug === "deafened") &&
				this.msg.item?.system.traits.value?.some((t) => t === "auditory")
			) {
				sources.push({ type: "deafened", origin: { slug: "auditory" }, baseDc: 5 })
			}
			if (
				!ignored.has("deafened-spellcasting") &&
				this.actor.conditions.stored.some((c) => c.slug === "deafened") &&
				this.msg.flags?.pf2e?.origin?.type === "spell" &&
				!this.msg.item?.system.traits.value?.some((t) => t === "subtle")
			) {
				sources.push({ type: "deafened", origin: { slug: "spell" }, baseDc: 5 })
			}

			if (!ignored.has("stupefied") && this.msg.flags?.pf2e?.origin?.type === "spell") {
				const stupefied = this.actor.conditions.stupefied?.value
				if (stupefied) {
					sources.push({ type: "stupefied", origin: { slug: "spell" }, baseDc: 5 + stupefied })
				}
			}
		}

		return sources
	}

	#collectTargetSources() {
		if (!this.target) return []

		const helper = new TargetFlatCheckHelper(
			this.token,
			this.target,
			this.adjustments,
			this.rollOptions,
		)
		const sources = helper.collectedSources()
		return sources
	}

	#collectAdditionalSources() {
		return this.adjustments.getAdditionalSources(this.rollOptions)
	}

	async calculateChecks() {
		const slots: Record<string, FlatCheckSource[]> & { target: BaseTargetFlatCheck[] } = {
			target: [],
		}

		for (const source of this.#collectOriginSources()) {
			const key = source.type
			if (key in slots) slots[key].push(source)
			else slots[key] = [source]
		}

		for (const source of this.#collectAdditionalSources()) {
			const key = source.slot
			if (key in slots) slots[key].push(source)
			else slots[key] = [source]
		}

		for (const source of await this.#collectTargetSources()) {
			slots.target.push(source)
		}

		const checks: FlatCheckRecord = {}
		for (const [k, v] of Object.entries(slots)) {
			const check = this.#sourcesToHighestCheck(v)
			if (check) {
				checks[k] = check
				if (["undetected", "unnoticed"].includes(check.type)) {
					check.secret = true
				}
			}
		}

		return checks
	}

	#sourcesToHighestCheck(
		sources: FlatCheckSource[] | BaseTargetFlatCheck[],
	): FlatCheckData | undefined {
		return R.pipe(
			sources,
			R.map((s) => {
				const options = [this.rollOptions, flatCheckRollOptions.forCheck(s)].flat()

				if (s.baseDc == null)
					return {
						...s,
						finalDc: null,
					}

				const { finalDc, adjustments } = this.adjustments.getDcAdjustment(s.type, options, s.baseDc)
				return {
					...s,
					finalDc: finalDc,
					dcAdjustments: adjustments,
				}
			}),
			R.firstBy([(d) => d.finalDc ?? -Infinity, "desc"]),
		)
	}
}
