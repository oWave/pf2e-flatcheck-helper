import type { ActorPF2e } from "types/pf2e/module/actor/base.ts"
import type { ItemPF2e } from "types/pf2e/module/item/base.ts"
import { MigrationBase } from "types/pf2e/module/migration/base.ts"
import { MigrationRunnerBase } from "types/pf2e/module/migration/runner/base.ts"
export declare class MigrationRunner extends MigrationRunnerBase {
  #private
  needsMigration(): boolean
  /** Ensure that an actor or item reflects the current data schema before it is created */
  static ensureSchemaVersion(document: ActorPF2e | ItemPF2e, migrations: MigrationBase[]): Promise<void>
  runCompendiumMigration<T extends ActorPF2e<null> | ItemPF2e<null>>(compendium: CompendiumCollection<T>): Promise<void>
  runMigrations(migrations: MigrationBase[]): Promise<void>
  runMigration(force?: boolean): Promise<void>
}
