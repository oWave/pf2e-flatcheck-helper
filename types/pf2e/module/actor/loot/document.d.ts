import { ItemType } from "types/pf2e/module/item/data/index.ts"
import { PhysicalItemPF2e } from "types/pf2e/module/item/physical/document.ts"
import { ActiveEffectPF2e } from "types/pf2e/module/active-effect.ts"
import { ActorPF2e, ItemPF2e } from "types/pf2e/module/documents.ts"
import { UserPF2e } from "types/pf2e/module/user/document.ts"
import { TokenDocumentPF2e } from "types/pf2e/module/scene/index.ts"
import { LootSource, LootSystemData } from "./data.ts"
declare class LootPF2e<TParent extends TokenDocumentPF2e | null = TokenDocumentPF2e | null> extends ActorPF2e<TParent> {
  armorClass: null
  get allowedItemTypes(): (ItemType | "physical")[]
  get isLoot(): boolean
  get isMerchant(): boolean
  /** Should this actor's token(s) be hidden when there are no items in its inventory? */
  get hiddenWhenEmpty(): boolean
  /** Loot actors can never benefit from rule elements */
  get canHostRuleElements(): boolean
  /** It's a box. */
  get canAct(): false
  /** It's a sturdy box. */
  isAffectedBy(): false
  /** Anyone with Limited permission can update a loot actor */
  canUserModify(user: UserPF2e, action: UserAction): boolean
  /** A user can see a loot actor in the actor directory only if they have at least Observer permission */
  get visible(): boolean
  transferItemToActor(
    targetActor: ActorPF2e,
    item: ItemPF2e<ActorPF2e>,
    quantity: number,
    containerId?: string,
    newStack?: boolean
  ): Promise<PhysicalItemPF2e<ActorPF2e> | null>
  /** Hide this actor's token(s) when in loot (rather than merchant) mode, empty, and configured thus */
  toggleTokenHiding(): Promise<void>
  /** Never process rules elements on loot actors */
  prepareDerivedData(): void
  protected _onCreate(data: LootSource, options: DocumentModificationContext<TParent>, userId: string): void
  protected _onUpdate(
    changed: DeepPartial<this["_source"]>,
    options: DocumentUpdateContext<TParent>,
    userId: string
  ): void
  protected _onCreateDescendantDocuments(
    parent: this,
    collection: "effects" | "items",
    documents: ActiveEffectPF2e<this>[] | ItemPF2e<this>[],
    result: ActiveEffectPF2e<this>["_source"][] | ItemPF2e<this>["_source"][],
    options: DocumentModificationContext<this>,
    userId: string
  ): void
  protected _onDeleteDescendantDocuments(
    parent: this,
    collection: "items" | "effects",
    documents: ActiveEffectPF2e<this>[] | ItemPF2e<this>[],
    ids: string[],
    options: DocumentModificationContext<this>,
    userId: string
  ): void
}
interface LootPF2e<TParent extends TokenDocumentPF2e | null = TokenDocumentPF2e | null> extends ActorPF2e<TParent> {
  readonly _source: LootSource
  system: LootSystemData
  readonly saves?: never
  get hitPoints(): null
}
export { LootPF2e }
