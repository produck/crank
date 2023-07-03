import * as Instruction from './Instruction.mjs';
import { Frame } from './Frame.mjs';

class Runtime {
	instructions = {};
}

export class Process {
	vm = null;
	stack = [];
	runtime = new Runtime();

	get top() {
		return this.stack[0];
	}

	constructor(vm, program) {
		this.vm = vm;

		for (const name in vm.InstrucionSet) {
			const CustomInstruction = vm.InstrucionSet[name];

			this.runtime.instructions[name] = (...args) => {
				const instruction = new CustomInstruction(this, ...args);

				return instruction.token;
			};
		}

		const { CallInstruction } = this.vm;

		for (const name in program) {
			const fn = program[name];

			this.runtime[name] = (...args) => {
				const routine = fn.call(this.runtime, ...args);

				return new CallInstruction(this, routine).token;
			};
		}

		this.bottomFrame = new Frame();
		this.stack.unshift(this.bottomFrame);
	}

	async execute(extern) {
		await Instruction.getByToken(this.runtime.main)(...extern.args);
	}
}
