import { ActorPF2e } from "types/pf2e/module/actor/index.ts"
import { ItemPF2e } from "types/pf2e/module/item/index.ts"
import { AbstractEffectPF2e, EffectBadge } from "types/pf2e/module/item/abstract-effect/index.ts"
import { UserPF2e } from "types/pf2e/module/user/index.ts"
import { AfflictionDamageTemplate, DamageRollContext } from "types/pf2e/module/system/damage/index.ts"
import { AfflictionFlags, AfflictionSource, AfflictionSystemData } from "./data.ts"
declare class AfflictionPF2e<TParent extends ActorPF2e | null = ActorPF2e | null> extends AbstractEffectPF2e<TParent> {
  constructor(source: object, context?: DocumentConstructionContext<TParent>)
  get badge(): EffectBadge
  get stage(): number
  get maxStage(): number
  increase(): Promise<void>
  decrease(): Promise<void>
  prepareBaseData(): void
  /** Retrieves the damage for a specific stage */
  getStageDamage(stage: number): AfflictionDamage | null
  /** Run all updates that need to occur whenever the stage changes */
  protected handleStageChange(): Promise<void>
  getLinkedItems(): ItemPF2e<ActorPF2e>[]
  createStageMessage(): Promise<void>
  protected _preUpdate(
    changed: DeepPartial<this["_source"]>,
    options: DocumentModificationContext<TParent>,
    user: UserPF2e
  ): Promise<boolean | void>
  protected _onCreate(data: AfflictionSource, options: DocumentModificationContext<TParent>, userId: string): void
  _onUpdate(changed: DeepPartial<this["_source"]>, options: DocumentModificationContext<TParent>, userId: string): void
  rollRecovery(): Promise<void>
}
interface AfflictionPF2e<TParent extends ActorPF2e | null = ActorPF2e | null> extends AbstractEffectPF2e<TParent> {
  flags: AfflictionFlags
  readonly _source: AfflictionSource
  system: AfflictionSystemData
}
interface AfflictionDamage {
  template: AfflictionDamageTemplate
  context: DamageRollContext
}
export { AfflictionPF2e }
