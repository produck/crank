// type Fn = (...args: any[]) => any;
type Fn = any;

interface Program {
	main: Fn;
	[key: string]: Fn;
}

type InstructionToken = Readonly<{
	readonly process: ProcessProxy,
	readonly frame: FrameProxy,
	execute: () => Promise<any>
}>;

interface Executors {
	[key: string]: (
		this: undefined,
		token: InstructionToken,
		args: any[]
	) => any;
}

type Runtime<
	P extends Program,
	E extends Executors,
> = {
	[k in Exclude<keyof P, 'main'>]: (
		...args: Parameters<P[k]>
	) => InstructionToken;
} & {
	[k in keyof E as `_${string & k}`]: (
		...args: any[]
	) => InstructionToken;
}

type ThisTypedProgram<
	P extends Program,
	E extends Executors,
> = ThisType<Runtime<P, E>> & P;

declare class ProcessProxy {
	readonly top: FrameProxy;
	extern: CustomExtern;
}

declare class FrameProxy {
	returnValue: any;
}

export class Extern {
	readonly args: Array<any>;
	setArgs: (...args: any[]) => undefined;
}

declare class CustomExtern extends Extern { }

type ChainNext = () => Promise<undefined>

interface Options {
	name?: string;
	call?: (token: InstructionToken, next: ChainNext, childFrame: FrameProxy) => any;
	Extern?: typeof Extern | typeof CustomExtern;
	abort?: (token: InstructionToken, last: InstructionToken) => boolean;
}

declare class EngineProxy<
	E extends Executors
> {
	static readonly Extern: typeof CustomExtern;

	execute<
		P extends Program,
	>(
		program: ThisTypedProgram<P, E>,
		extern?: CustomExtern
	): Promise<any>;
}

export function defineEngine<
	E extends Executors
>(
	options: Options,
	executors: E & Executors
): typeof EngineProxy<E>;

export { defineEngine as Engine };
