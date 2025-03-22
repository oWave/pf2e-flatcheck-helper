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

	declare class PreciseText extends PIXI.Text {
		constructor(
			text: string,
			style?: Partial<PIXI.ITextStyle> | PIXI.TextStyle,
			canvas?: HTMLCanvasElement,
		)
		static getTextStyle(opts: { anchor?: number } & Partial<PIXI.ITextStyle>): PIXI.TextStyle
	}
}
export type {}
