import { ImmunityType, IWRType, ResistanceType, WeaknessType } from "../types.ts";
import { IWRException } from "../../rules/rule-element/iwr/base.ts";
import { Predicate, PredicateStatement } from "../../system/predication.ts";
declare abstract class IWR<TType extends IWRType> {
    #private;
    readonly type: TType;
    readonly exceptions: IWRException<TType>[];
    /** A definition for a custom IWR */
    readonly definition: Predicate | null;
    source: string | null;
    protected abstract readonly typeLabels: Record<TType, string>;
    constructor(data: IWRConstructorData<TType>);
    abstract get label(): string;
    /** A label showing the type, exceptions, and doubleVs but no value (in case of weaknesses and resistances) */
    get applicationLabel(): string;
    /** A label consisting of just the type */
    get typeLabel(): string;
    protected describe(iwrType: IWRException<TType>): PredicateStatement[];
    get predicate(): Predicate;
    toObject(): Readonly<IWRDisplayData<TType>>;
    /** Construct an object argument for Localization#format (see also PF2E.Actor.IWR.CompositeLabel in en.json) */
    protected createFormatData({ list, prefix, }: {
        list: IWRException<TType>[];
        prefix: string;
    }): Record<string, string>;
    test(statements: string[] | Set<string>): boolean;
}
type IWRConstructorData<TType extends IWRType> = {
    type: TType;
    exceptions?: IWRException<TType>[];
    customLabel?: Maybe<string>;
    definition?: Maybe<Predicate>;
    source?: string | null;
};
type IWRDisplayData<TType extends IWRType> = Pick<IWR<TType>, "type" | "exceptions" | "source" | "label">;
declare class Immunity extends IWR<ImmunityType> implements ImmunitySource {
    protected readonly typeLabels: any;
    /** No value on immunities, so the full label is the same as the application label */
    get label(): string;
}
interface IWRSource<TType extends IWRType = IWRType> {
    type: TType;
    exceptions?: IWRException<TType>[];
}
type ImmunitySource = IWRSource<ImmunityType>;
declare class Weakness extends IWR<WeaknessType> implements WeaknessSource {
    protected readonly typeLabels: any;
    value: number;
    constructor(data: IWRConstructorData<WeaknessType> & {
        value: number;
    });
    get label(): string;
    toObject(): Readonly<WeaknessDisplayData>;
}
type WeaknessDisplayData = IWRDisplayData<WeaknessType> & Pick<Weakness, "value">;
interface WeaknessSource extends IWRSource<WeaknessType> {
    value: number;
}
declare class Resistance extends IWR<ResistanceType> implements ResistanceSource {
    protected readonly typeLabels: any;
    value: number;
    readonly doubleVs: IWRException<ResistanceType>[];
    constructor(data: IWRConstructorData<ResistanceType> & {
        value: number;
        doubleVs?: IWRException<ResistanceType>[];
    });
    get label(): string;
    get applicationLabel(): string;
    toObject(): ResistanceDisplayData;
    /** Get the doubled value of this resistance if present and applicable to a given instance of damage */
    getDoubledValue(damageDescription: Set<string>): number;
}
type ResistanceDisplayData = IWRDisplayData<ResistanceType> & Pick<Resistance, "value" | "doubleVs">;
interface ResistanceSource extends IWRSource<ResistanceType> {
    value: number;
    doubleVs?: IWRException<ResistanceType>[];
}
/** Weaknesses to things that "[don't] normally deal damage, such as water": applied separately as untyped damage */
declare const NON_DAMAGE_WEAKNESSES: Set<WeaknessType>;
export { Immunity, NON_DAMAGE_WEAKNESSES, Resistance, Weakness };
export type { ImmunitySource, IWRSource, ResistanceSource, WeaknessSource };
