export const VisiblityLevelPriorities = {
	observed: 0,
	concealed: 1,
	hidden: 2,
} as const

export type VisibilityLevels = keyof typeof VisiblityLevelPriorities

export const OriginToTargetCondition = {
	dazzled: "concealed",
	blinded: "hidden",
} as const
export type OriginConditionSlug = keyof typeof OriginToTargetCondition

export const TargetConditionToDC = {
	observed: 0,
	concealed: 5,
	hidden: 11,
} as const
export type TargetConditionSlug = keyof typeof TargetConditionToDC
