import { StrikeLookupData } from "types/pf2e/module/chat-message/index.ts"
import { ZeroToThree } from "types/pf2e/module/data.ts"
import { UserPF2e } from "types/pf2e/module/user/index.ts"
import { DegreeOfSuccessIndex } from "types/pf2e/module/system/degree-of-success.ts"
import { RollDataPF2e } from "types/pf2e/module/system/rolls.ts"
declare class CheckRoll extends Roll {
  roller: UserPF2e | null
  isReroll: boolean
  isRerollable: boolean
  constructor(formula: string, data?: {}, options?: CheckRollDataPF2e)
  get degreeOfSuccess(): DegreeOfSuccessIndex | null
}
interface CheckRoll extends Roll {
  options: CheckRollDataPF2e
}
interface CheckRollDataPF2e extends RollDataPF2e {
  isReroll?: boolean
  degreeOfSuccess?: ZeroToThree
  strike?: StrikeLookupData
  domains?: string[]
}
export { CheckRoll, CheckRollDataPF2e }
