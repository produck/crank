interface Runtime {
	[key: string]: () => InstructionToken;
	[key: symbol]: never;
	[key: number]: never;
}

type InstructionToken = Readonly<{ token: true }>;
type ProgramFunction = (this: Runtime) => Generator<InstructionToken, any>;

interface Program {
	main: ProgramFunction;
	[key: string]: ProgramFunction;
}

declare class ProcessProxy {
	readonly top: FrameProxy;
}

declare class FrameProxy {
	returnValue: any;
}

export class Extern {
	readonly args: Array<any>;
	setArgs: (...args: any[]) => undefined;
}

declare class CustomExtern extends Extern {}

type ChainNext = () => Promise<undefined>

interface Options {
	name?: string;
	call?: (process: ProcessProxy, childFrame: FrameProxy, next: ChainNext) => any;
	Extern?: typeof Extern | typeof CustomExtern;
	abort?: (process: ProcessProxy) => boolean;
}

interface Executors {
	[key: string]: (process: ProcessProxy) => any;
}

declare class EngineProxy {
	static readonly Extern: typeof CustomExtern;
	execute(program: Program, extern: CustomExtern): Promise<any>;
}

export function defineEngine(options: Options, executors: Executors): typeof EngineProxy;
export { defineEngine as Engine };
