declare global {
	interface ConfigPF2e {
		queries: Record<string, (data: any, options: any) => Promise<any>>
	}
}

declare class PreciseText extends PIXI.Text {
	constructor(
		text: string,
		style?: Partial<PIXI.ITextStyle> | PIXI.TextStyle,
		canvas?: HTMLCanvasElement,
	)
	static getTextStyle(opts: { anchor?: number } & Partial<PIXI.ITextStyle>): PIXI.TextStyle
}

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

declare const libWrapper: LibWrapper
