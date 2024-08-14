declare global {
	interface LibWrapper {
		register(
			moduleId: string,
			target: string,
			fn: CallableFunction,
			type: "MIXED" | "WRAPPER" | "OVERRIDE",
			options?: any,
		)
	}

	const libWrapper: LibWrapper
}
export type {}
