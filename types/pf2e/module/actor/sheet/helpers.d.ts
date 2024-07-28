import type { ActorPF2e } from "../index.ts";
import { Sense } from "../creature/sense.ts";
import { PhysicalItemPF2e } from "../../item/index.ts";
declare function onClickCreateSpell(actor: ActorPF2e, data: Record<string, string | undefined>): void;
/** Create a price label like "L / 10" when appropriate. */
declare function createBulkPerLabel(item: PhysicalItemPF2e): string;
/** Returns a sense list with all redundant senses removed (such as low light vision on actors with darkvision) */
declare function condenseSenses(senses: Sense[]): Sense[];
export { condenseSenses, createBulkPerLabel, onClickCreateSpell };
