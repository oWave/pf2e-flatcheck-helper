import { SkillActionOptions } from "../index.ts"
import { SingleCheckAction } from "types/pf2e/module/actor/actions/index.ts"
declare function sneak(options: SkillActionOptions): void
declare const action: SingleCheckAction
export { sneak as legacy, action }
