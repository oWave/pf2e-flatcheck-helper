import { SkillActionOptions } from "../index.ts"
import { SingleCheckAction } from "types/pf2e/module/actor/actions/index.ts"
declare function commandAnAnimal(options: SkillActionOptions): void
declare const action: SingleCheckAction
export { commandAnAnimal as legacy, action }
