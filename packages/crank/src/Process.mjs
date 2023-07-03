import { Frame } from './Frame.mjs';

class Runtime {
	instructions = {};
}

class ProcessProxy {
	#process;

	constructor(process) {
		this.#process = process;
	}
}

export class Process {
	stack = [new Frame()];

	get top() {
		return this.stack[0];
	}

	constructor(vm, program) {
		const runtime = new Runtime();

		for (const name in vm.InstrucionSet) {
			const CustomInstruction = vm.InstrucionSet[name];

			runtime.instructions[name] = (...args) => {
				const instruction = new CustomInstruction(this, ...args);

				return instruction.token;
			};
		}

		const { main, ...functions } = program;

		for (const name in functions) {
			const fn = functions[name];

			runtime[name] = (...args) => {
				const routine = fn.call(runtime, ...args);

				return new vm.CallInstruction(this, routine).token;
			};
		}

		let called = false;

		this.run = async (extern) => {
			if (called) {
				throw 1;
			}

			called = true;

			const routine = main.call(runtime, ...extern.args);

			new vm.CallInstruction(this, routine).execute();
		};
	}

	proxy = new ProcessProxy(this);
}
