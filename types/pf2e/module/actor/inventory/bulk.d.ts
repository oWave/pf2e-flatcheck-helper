import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import { PhysicalItemPF2e } from "types/pf2e/module/item/index.ts"
import { Bulk } from "types/pf2e/module/item/physical/bulk.ts"
import { Size } from "types/pf2e/module/data.ts"
export declare class InventoryBulk {
  #private
  /** The current bulk carried by the actor */
  value: Bulk
  /** The number of Bulk units the actor can carry before being encumbered */
  encumberedAfter: number
  /** The maximum bulk the actor can carry */
  max: number
  constructor(actor: ActorPF2e)
  get encumberedPercentage(): number
  get maxPercentage(): number
  get maxPercentageInteger(): number
  get isEncumbered(): boolean
  get isOverMax(): boolean
  get bulk(): number
  static computeTotalBulk(items: PhysicalItemPF2e[], actorSize: Size): Bulk
}
