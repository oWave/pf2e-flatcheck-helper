import type { ActorPF2e } from "../index.ts";
import type { StrikeData } from "../data/base.ts";
import type { ItemPF2e } from "../../item/index.ts";
import type { Statistic } from "../../system/statistic/statistic.ts";
import { RollContext } from "./base.ts";
import { CheckContextConstructorParams, CheckContextData } from "./types.ts";
declare class CheckContext<TSelf extends ActorPF2e, TStatistic extends Statistic | StrikeData, TItem extends ItemPF2e<ActorPF2e> | null> extends RollContext<TSelf, TStatistic, TItem> {
    /** The slug of a `Statistic` for use in building a DC */
    against: string | null;
    constructor(params: CheckContextConstructorParams<TSelf, TStatistic, TItem>);
    resolve(): Promise<CheckContextData<TSelf, TStatistic, TItem>>;
}
export { CheckContext };
