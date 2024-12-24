declare const FEAT_CATEGORIES: Set<"ancestry" | "class" | "skill" | "general" | "bonus">;
declare const FEATURE_CATEGORIES: Set<"ancestryfeature" | "calling" | "classfeature" | "curse" | "deityboon" | "pfsboon">;
declare const FEAT_OR_FEATURE_CATEGORIES: Set<SetElement<typeof FEAT_CATEGORIES> | SetElement<typeof FEATURE_CATEGORIES>>;
export { FEATURE_CATEGORIES, FEAT_CATEGORIES, FEAT_OR_FEATURE_CATEGORIES };
