declare global {
	interface LibWrapper {
		register(
			moduleId: string,
			target: string,
			fn: CallableFunction,
			type: "MIXED" | "WRAPPER" | "OVERRIDE",
			options?: any,
		)
		unregister(moduleId: string, target: number | string)
	}

	const libWrapper: LibWrapper
}
export type {}
