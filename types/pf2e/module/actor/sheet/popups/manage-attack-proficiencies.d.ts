import { CharacterPF2e } from "types/pf2e/module/actor/character/document.ts"
declare function add(actor: CharacterPF2e, event: MouseEvent): Promise<void>
declare function remove(actor: CharacterPF2e, event: MouseEvent): void
export declare const ManageAttackProficiencies: {
  add: typeof add
  remove: typeof remove
}
export {}
