import { MenuTemplateData, SettingsMenuPF2e } from "./menu.ts";
declare const MetagameSettingsConfig: {
    showDC: {
        name: string;
        hint: string;
        default: boolean;
        type: BooleanConstructor;
    };
    showResults: {
        name: string;
        hint: string;
        default: boolean;
        type: BooleanConstructor;
    };
    showPartyStats: {
        name: string;
        hint: string;
        default: boolean;
        type: BooleanConstructor;
        onChange: () => void;
    };
    tokenSetsNameVisibility: {
        name: string;
        hint: string;
        default: boolean;
        type: BooleanConstructor;
        onChange: () => Promise<void>;
    };
    secretDamage: {
        name: string;
        hint: string;
        default: boolean;
        type: BooleanConstructor;
    };
    secretCondition: {
        name: string;
        hint: string;
        default: boolean;
        type: BooleanConstructor;
    };
    partyVision: {
        name: string;
        hint: string;
        default: boolean;
        type: BooleanConstructor;
        onChange: () => void;
    };
};
declare class MetagameSettings extends SettingsMenuPF2e {
    static namespace: string;
    static get settings(): typeof MetagameSettingsConfig;
    static get SETTINGS(): string[];
    static get prefix(): string;
    /** Hide "metagame_showPartyStats" setting in production builds until party actor is released */
    getData(): Promise<MenuTemplateData>;
}
export { MetagameSettings };
