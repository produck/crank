import { Scope } from './Scope.mjs';
import * as Instruction from './Instruction.mjs';

/** @type {WeakMap<typeof Engine, typeof import('./Program.mjs').Program>} */
const PROGRAM_MAP = new WeakMap();

export const set = (Engine, Program) => PROGRAM_MAP.set(Engine, Program);

export class Engine {
	#Process;

	constructor () {
		this.#Process = PROGRAM_MAP.get(new.target);
	}

	execute(script, context) {
		const globalScope = new Scope();
		const process = new this.#Process(script);
		const mainToken = program.main(...context.args);

		Instruction.getByToken(mainToken).execute(globalScope);

		return process.globalScope.ret;
	}
}

export { Engine as Base };
