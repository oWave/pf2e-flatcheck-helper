import type { ActorPF2e } from "../index.ts";
import type { MigrationDataField } from "../../data.ts";
import type { AutoChangeEntry } from "../../rules/rule-element/ae-like.ts";
declare abstract class ActorSystemModel<TParent extends ActorPF2e, TSchema extends ActorSystemSchema> extends foundry.abstract
    .TypeDataModel<TParent, TSchema> {
    autoChanges: Record<string, AutoChangeEntry[] | undefined>;
    static defineSchema(): ActorSystemSchema;
}
type ActorSystemSchema = {
    _migration: MigrationDataField;
};
export { ActorSystemModel, type ActorSystemSchema };
