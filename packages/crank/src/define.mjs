import * as Engine from './Engine.mjs';
import { CallInstruction, Instruction } from './Instruction.mjs';
import { Program } from './Program.mjs';

import * as Utils from './Utils.mjs';
import * as Options from './Options.mjs';

export function defineEngine(...args) {
	const options = Options.normalizeOptions(...args.slice(0, 1));
	const executors =	Options.normalizeExecutors(...args.slice(1, 2));

	class CustomCallInstruction extends CallInstruction {
		_invoke(...args) {
			options.call(...args);
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

				const CustomInstruction = {
					[INSTRUCTION_NAME]: class extends Instruction {
						_execute(frame) {
							executor(frame, ...this.args);
						}
					},
				}[INSTRUCTION_NAME];

				const proxy = (...args) => new CustomInstruction(this, ...args).token;

				this.InstrucionSet[name] = proxy;
			}

			Object.freeze(this.InstrucionSet);
		}
	} }[ENGINE_NAME];

	const PROXY_NAME = `${ENGINE_NAME}Proxy`;

	return { [PROXY_NAME]: class {
		#engine = new CustomEngine();

		execute(program, context) {
			if (!Utils.Instance(program, Program)) {
				Utils.TypeError('program', 'Program');
			}

			if (!Utils.Instance(context, options.Context)) {
				Utils.TypeError('cotext', 'CustomContext');
			}

			return this.#engine.execute(program, context);
		}

		static compile(script) {
			return new Program(script);
		}
	} }[PROXY_NAME];
}

export { defineEngine as Engine };
