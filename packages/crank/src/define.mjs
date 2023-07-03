import * as Engine from './Engine.mjs';
import { CallInstruction, Instruction } from './Instruction.mjs';
import { Program } from './Program.mjs';
import { ProcessProxy } from './Context.mjs';

import * as Utils from './Utils.mjs';
import * as Options from './Options.mjs';

export function defineEngine(...args) {
	const options = Options.normalizeOptions(...args.slice(0, 1));
	const executors =	Options.normalizeExecutors(...args.slice(1, 2));

	class CustomCallInstruction extends CallInstruction {
		async _abort() {
			const processProxy = new ProcessProxy(this.process);
			const flag = await options.abort(processProxy);

			if (typeof flag !== 'boolean') {
				Utils.TypeError('flag <= options.abort()', 'boolean or Promise<boolean>');
			}

			return flag;
		}

		async _invoke(...args) {
			const processProxy = new ProcessProxy(this.process);

			await options.call(processProxy, ...args); // 传Context
		}
	}

	const ENGINE_NAME = `${options.name}Engine`;

	const CustomEngine = { [ENGINE_NAME]: class extends Engine.Base {
		CallInstruction = CustomCallInstruction;

		constructor() {
			super();

			for (const name in executors) {
				const INSTRUCTION_NAME = `${name}Instruction`;
				const executor = executors[name];

				this.InstrucionSet[name] = {
					[INSTRUCTION_NAME]: class extends Instruction {
						_execute() {
							const processProxy = new ProcessProxy(this.process);

							executor(processProxy);
						}
					},
				}[INSTRUCTION_NAME];
			}

			Object.freeze(this.InstrucionSet);
		}
	} }[ENGINE_NAME];

	const PROXY_NAME = `${ENGINE_NAME}Proxy`;

	return { [PROXY_NAME]: class {
		#engine = new CustomEngine();

		async execute(program, extern) {
			if (!Utils.Instance(program, Program)) {
				Utils.TypeError('program', 'Program');
			}

			if (!Utils.Instance(extern, options.Extern)) {
				Utils.TypeError('extern', 'CustomExtern');
			}

			await this.#engine.execute(program, extern);
		}

		static compile(script) {
			return new Program(script);
		}
	} }[PROXY_NAME];
}

export { defineEngine as Engine };
