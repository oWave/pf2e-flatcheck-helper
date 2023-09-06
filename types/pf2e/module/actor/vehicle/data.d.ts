import {
  ActorAttributes,
  ActorAttributesSource,
  ActorDetailsSource,
  ActorHitPoints,
  ActorSystemData,
  ActorSystemSource,
  ActorTraitsSource,
  BaseActorSourcePF2e,
} from "types/pf2e/module/actor/data/base.ts"
import { ImmunitySource } from "types/pf2e/module/actor/data/iwr.ts"
import { ActorSizePF2e } from "types/pf2e/module/actor/data/size.ts"
import { Rarity, Size } from "types/pf2e/module/data.ts"
import { ArmorClassTraceData } from "types/pf2e/module/system/statistic/armor-class.ts"
import { StatisticTraceData } from "types/pf2e/module/system/statistic/index.ts"
import { VehicleTrait } from "./types.ts"
/** The stored source data of a vehicle actor */
type VehicleSource = BaseActorSourcePF2e<"vehicle", VehicleSystemSource>
interface VehicleSystemSource extends ActorSystemSource {
  attributes: VehicleAttributesSource
  details: VehicleDetailsSource
  saves: {
    fortitude: VehicleFortitudeSaveData
  }
  traits: VehicleTraitsSource
}
interface VehicleAttributesSource extends ActorAttributesSource {
  ac: {
    value: number
  }
  hardness: number
  initiative?: never
  immunities: ImmunitySource[]
}
interface VehicleDetailsSource extends ActorDetailsSource {
  description: string
  level: {
    value: number
  }
  alliance: null
  price: number
  space: {
    long: number
    wide: number
    high: number
  }
  crew: string
  passengers: string
  pilotingCheck: string
  AC: number
  speed: number
}
interface VehicleTraitsSource extends ActorTraitsSource<VehicleTrait> {
  rarity: Rarity
  size: {
    value: Size
  }
  languages?: never
}
/** The system-level data of vehicle actors. */
interface VehicleSystemData extends VehicleSystemSource, Omit<ActorSystemData, "details"> {
  attributes: VehicleAttributes
  traits: VehicleTraits
}
interface VehicleAttributes extends Omit<VehicleAttributesSource, AttributesSourceOmission>, ActorAttributes {
  ac: ArmorClassTraceData
  hp: VehicleHitPoints
  initiative?: never
  shield?: never
}
type AttributesSourceOmission = "immunities" | "weaknesses" | "resistances"
interface VehicleHitPoints extends ActorHitPoints {
  brokenThreshold: number
}
interface VehicleFortitudeSaveData extends StatisticTraceData {
  saveDetail: string
}
interface VehicleTraits extends VehicleTraitsSource {
  size: ActorSizePF2e
}
interface TokenDimensions {
  width: number
  height: number
}
export { TokenDimensions, VehicleSource, VehicleSystemData, VehicleTrait }
