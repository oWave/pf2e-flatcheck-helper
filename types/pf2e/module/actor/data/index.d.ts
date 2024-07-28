import { ArmySource } from "../army/data.ts";
import { CharacterSource } from "../character/data.ts";
import { FamiliarSource } from "../familiar/data.ts";
import { HazardSource } from "../hazard/data.ts";
import { LootSource } from "../loot/data.ts";
import { NPCSource } from "../npc/data.ts";
import { PartySource } from "../party/data.ts";
import { VehicleSource } from "../vehicle/data.ts";
import { StatisticRollParameters } from "../../system/statistic/index.ts";
type CreatureSource = CharacterSource | NPCSource | FamiliarSource;
type ActorSourcePF2e = ArmySource | CreatureSource | HazardSource | LootSource | PartySource | VehicleSource;
interface RollInitiativeOptionsPF2e extends RollInitiativeOptions, StatisticRollParameters {
    secret?: boolean;
}
export type { ActorSourcePF2e, ArmySource, CharacterSource, CreatureSource, FamiliarSource, HazardSource, LootSource, NPCSource, PartySource, RollInitiativeOptionsPF2e, VehicleSource, };
