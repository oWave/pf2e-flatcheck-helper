import { PhysicalItemPF2e } from "../../../item/index.ts";
import { CheckDC } from "../../degree-of-success.ts";
import { SkillActionOptions } from "../types.ts";
export declare function craft(options: CraftActionOptions): Promise<void>;
interface CraftActionOptions extends SkillActionOptions {
    difficultyClass?: CheckDC;
    item?: PhysicalItemPF2e;
    quantity?: number;
    uuid?: string;
    free?: boolean;
}
export {};
