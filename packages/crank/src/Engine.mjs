import { Frame } from './Frame.mjs';
import * as Instruction from './Instruction.mjs';

/**@type {WeakMap<import('./Program.mjs').Program, Engine>} */
const BINDING = new WeakMap();

export const getByProgram = program => BINDING.get(program);

export class Engine {
	CallInstruction = Instruction.Call;
	InstrucionSet = {};

	stack = [];
	busy = false;

	call(routine) {
		return new this.CallInstruction(this, routine).token;
	}

	get top() {
		return this.stack[0];
	}

	execute(program, context) {
		if (this.busy) {
			throw 0;
		}

		if (BINDING.has(program)) {
			throw 1;
		}

		BINDING.set(program, this);
		this.busy = true;

		const bottomFrame = new Frame();
		const mainToken = program.main(...context.args);

		Instruction.getByToken(mainToken).execute(this, bottomFrame);
		this.busy = false;
		BINDING.delete(program);

		return process.bottomFrame.ret;
	}
}

export { Engine as Base };
