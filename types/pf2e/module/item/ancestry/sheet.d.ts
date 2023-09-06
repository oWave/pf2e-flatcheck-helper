import { AncestryPF2e } from "types/pf2e/module/item/ancestry/index.ts"
import { ABCSheetData, ABCSheetPF2e } from "types/pf2e/module/item/abc/sheet.ts"
import { SheetOptions } from "types/pf2e/module/sheet/helpers.ts"
declare class AncestrySheetPF2e extends ABCSheetPF2e<AncestryPF2e> {
  getData(options?: Partial<DocumentSheetOptions>): Promise<AncestrySheetData>
}
interface AncestrySheetData extends ABCSheetData<AncestryPF2e> {
  selectedBoosts: Record<string, Record<string, string>>
  selectedFlaws: Record<string, Record<string, string>>
  sizes: SheetOptions
  languages: SheetOptions
  additionalLanguages: SheetOptions
}
export { AncestrySheetPF2e }
