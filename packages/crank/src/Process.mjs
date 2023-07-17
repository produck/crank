import { Frame } from './Frame.mjs';
import * as Utils from './Utils.mjs';

class Runtime {
}

const RUNTIME_PROXY_HANDLER = {
	get(target, property) {
		if (!target[property]) {
			if (property[0] === '_') {
				Utils.RuntimeError('No instruction.');
			} else {
				Utils.RuntimeError('No function of program.');
			}
		}

		return target[property];
	},
};

class ProcessProxy {
	#process;

	get top() {
		return this.#process.top.proxy;
	}

	get extern() {
		return this.#process.extern;
	}

	/** @param {Process} process */
	constructor(process) {
		this.#process = process;

		Object.freeze(this);
	}
}

export class Process {
	stack = [new Frame()];
	extern;

	get top() {
		return this.stack[0];
	}

	constructor(vm, program, extern) {
		this.extern = extern;

		const runtime = new Runtime();
		const runtimeProxy = new Proxy(runtime, RUNTIME_PROXY_HANDLER);

		for (const name in vm.InstrucionSet) {
			const CustomInstruction = vm.InstrucionSet[name];

			runtime[`_${name}`] = (...args) => {
				const instruction = new CustomInstruction(this, ...args);

				return instruction.token;
			};
		}

		const { main, ...functions } = program;

		for (const name in functions) {
			const fn = functions[name];

			runtime[name] = (...args) => {
				const routine = fn.call(runtimeProxy, ...args);

				return new vm.CallInstruction(this, routine).token;
			};
		}

		Object.freeze(runtime);

		this.run = async () => {
			const routine = main.call(runtimeProxy, ...this.extern.args);

			return await new vm.CallInstruction(this, routine).execute();
		};
	}

	proxy = new ProcessProxy(this);
}
