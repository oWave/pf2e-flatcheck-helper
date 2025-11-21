import { handleGmMoveQuery } from "../query"

const ACTOR_ID = "iIJUdizySvrjO6eZ"
const SCENE_ID = "uAudcxPa7qMfZksF"

interface CombatantData {
	name: string
	init: number
	override?: number
	alreadyWent?: boolean
}

interface SetupData {
	combatants: CombatantData[]
	active: string
	combat: { round: number }
	delay: { move: string; after: string }
}
type CombatantState = "went" | "active" | "waiting"

async function combatant(combatant: CombatantData, round: number, state: CombatantState) {
	const actor = game.actors.get(ACTOR_ID)
	if (!actor) throw "no actor"

	// @ts-expect-error
	const tokenProto: TokenDocument = await actor.getTokenDocument({}, { parent: canvas.scene! })
	// @ts-expect-error
	const token = await getDocumentClass("Token").create(tokenProto, { parent: canvas.scene })
	await token?.update({ name: combatant.name })
	await token?.actor?.update({ name: combatant.name })

	const data = {
		actorId: token?.actorId,
		sceneId: token?.scene?.id,
		tokenId: token?.id,
		hidden: false,
		initiative: combatant.init,
		flags: { pf2e: {} as Record<string, JSONValue> },
	}

	if (state === "went") {
		data.flags.pf2e = {
			roundOfLastTurn: round,
			roundOfLastTurnEnd: round,
		}
	} else if (state === "active") {
		data.flags.pf2e = {
			roundOfLastTurn: round,
			roundOfLastTurnEnd: round - 1,
		}
	} else {
		data.flags.pf2e = {
			roundOfLastTurn: round - 1,
			roundOfLastTurnEnd: round - 1,
		}
	}

	if (combatant.override != null) {
		data.flags.pf2e.overridePriority = { [combatant.init]: combatant.override }
	}

	await game.combat?.createEmbeddedDocuments("Combatant", [data])
}

export async function reset() {
	const scene = game.scenes.get(SCENE_ID)
	if (!scene) throw "no scene"
	await scene.activate()
	for (const c of game.combats) await c.delete()
	await scene.deleteEmbeddedDocuments(
		"Token",
		scene.tokens.map((t) => t.id),
	)

	// @ts-expect-error
	await CONFIG.Combat.documentClass.create()
}

async function setup(data: SetupData) {
	let state: CombatantState = "went"
	for (const c of data.combatants) {
		const active = c.name === data.active
		if (active) state = "active"
		await combatant(c, data.combat.round, c.alreadyWent ? "went" : state)
		if (active) state = "waiting"
	}
	const turn = game.combat?.turns.findIndex((t) => t.name === data.active)

	await game.combat?.update({ round: data.combat.round, turn })
}

async function execute(data: SetupData) {
	const move = game.combat?.turns.find((t) => t.name === data.delay.move)
	const after = game.combat?.turns.find((t) => t.name === data.delay.after)

	if (!move?.uuid) throw "no move"
	if (!after) throw "no after"

	const needsAdvance = data.active === data.delay.move

	await handleGmMoveQuery({
		advanceTurn: needsAdvance,
		combatantUuid: move.uuid,
		afterId: after.id,
	})

	const expectedOrder = data.combatants.filter((c) => c.name !== data.delay.move).map((c) => c.name)
	expectedOrder.splice(expectedOrder.indexOf(data.delay.after) + 1, 0, data.delay.move)
	const actualOrder = game.combat?.turns.map((t) => t.name)

	if (expectedOrder.length !== actualOrder?.length) {
		console.error("Turn count does not match!")
		console.log(expectedOrder)
		console.log(actualOrder)
		return false
	}
	for (let i = 0; i < actualOrder.length; i++) {
		const expected = expectedOrder[i]
		const actual = actualOrder[i]
		if (expected !== actual) {
			console.error(`Turn ${i}: ${expected} does not match ${actual}`)
			console.log(expectedOrder)
			console.log(actualOrder)
			return false
		}
	}

	if (needsAdvance) {
		let expectedTurn = data.combatants.findIndex((c) => c.name === data.active) + 1
		if (expectedTurn === data.combatants.length) expectedTurn = 0
		if (data.combatants[expectedTurn].name !== game.combat?.combatant?.name) {
			console.error(
				`Current turn: Expected ${data.combatants[expectedTurn].name}, is ${game.combat?.combatant?.name}`,
			)
			console.log(expectedOrder)
			console.log(actualOrder)
			return false
		}
	} else {
		if (data.active !== game.combat?.combatant?.name) {
			console.error(
				`Expected turn to not change (${data.active}), but got ${game.combat?.combatant?.name}`,
			)
			console.log(expectedOrder)
			console.log(actualOrder)
			return false
		}
	}

	return true
}

const CASES: SetupData[] = [
	// Delay - Move down 1
	{
		combat: { round: 2 },
		combatants: [
			{ name: "A", init: 20 },
			{ name: "B", init: 15 },
			{ name: "C", init: 10 },
		],
		active: "B",
		delay: { move: "B", after: "C" },
	},
	// Delay - Move down 2
	{
		combat: { round: 2 },
		combatants: [
			{ name: "A", init: 20 },
			{ name: "B", init: 15 },
			{ name: "C", init: 10 },
		],
		active: "A",
		delay: { move: "A", after: "C" },
	},
	// Delay - Move to next turn
	{
		combat: { round: 2 },
		combatants: [
			{ name: "A", init: 20 },
			{ name: "B", init: 15 },
			{ name: "C", init: 10 },
		],
		active: "C",
		delay: { move: "C", after: "A" },
	},
	// Delay - down 1
	{
		combat: { round: 2 },
		combatants: [
			{ name: "A", init: 20, override: 0 },
			{ name: "B", init: 20, override: 1 },
			{ name: "C", init: 20, override: 2 },
		],
		active: "B",
		delay: { move: "B", after: "C" },
	},
	// Delay: down 2
	{
		combat: { round: 2 },
		combatants: [
			{ name: "A", init: 20, override: 0 },
			{ name: "B", init: 20, override: 1 },
			{ name: "C", init: 20, override: 2 },
		],
		active: "A",
		delay: { move: "A", after: "C" },
	},
	// Delay: next round
	{
		combat: { round: 2 },
		combatants: [
			{ name: "A", init: 20, override: 0 },
			{ name: "B", init: 20, override: 1 },
			{ name: "C", init: 20, override: 2 },
		],
		active: "C",
		delay: { move: "C", after: "A" },
	},
	// Return - Up (early)
	{
		combat: { round: 2 },
		combatants: [
			{ name: "A", init: 20 },
			{ name: "B", init: 15 },
			{ name: "C", init: 10 },
		],
		active: "A",
		delay: { move: "C", after: "A" },
	},
	// Return - Down
	{
		combat: { round: 2 },
		combatants: [
			{ name: "A", init: 20 },
			{ name: "B", init: 15 },
			{ name: "C", init: 10 },
		],
		active: "B",
		delay: { move: "A", after: "B" },
	},
	// Will not fire turn start
	{
		combat: { round: 2 },
		combatants: [
			{ name: "A", init: 20 },
			{ name: "B", init: 15 },
			{ name: "C", init: 10, alreadyWent: true },
		],
		active: "B",
		delay: { move: "B", after: "C" },
	},
	// Will not fire turn end
	{
		combat: { round: 2 },
		combatants: [
			{ name: "A", init: 20 },
			{ name: "B", init: 15, alreadyWent: true },
			{ name: "C", init: 10 },
		],
		active: "B",
		delay: { move: "B", after: "C" },
	},
	// Will not fire either event
	{
		combat: { round: 2 },
		combatants: [
			{ name: "A", init: 20 },
			{ name: "B", init: 15, alreadyWent: true },
			{ name: "C", init: 10, alreadyWent: true },
		],
		active: "B",
		delay: { move: "B", after: "C" },
	},
]

export async function setupCase(id: number) {
	const c = CASES.at(id)
	if (!c) throw new Error(`Bad id ${id}`)
	await reset()
	await setup(c)
}

export async function runCase(id: number | null = null) {
	let cases = CASES
	if (id != null) {
		const c = CASES.at(id)
		if (!c) throw new Error(`Bad id ${id}`)
		cases = [c]
	}

	for (const [i, data] of cases.entries()) {
		await setupCase(id ?? i)
		if (!(await execute(data))) {
			console.error(`Case ${i} failed!`)
			break
		}
	}
}
