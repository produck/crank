import * as Engine from './Engine.mjs';
import { CallInstruction, Instruction } from './Instruction.mjs';
import { Program } from './Program.mjs';

const DEFAULT_CALL = (_s, _sc, next) => next();

// options.{Context, name, call};

export function defineEngine(options, executors = {}) {
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

			for (const name of executors) {
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
			Object.freeze(this);
		}
	} }[ENGINE_NAME];

	const PROXY_NAME = `${ENGINE_NAME}Prxoy`;

	return { [PROXY_NAME]: class {
		#engine = new CustomEngine();

		execute(...args) {
			return this.#engine.execute(...args);
		}

		static compile(script) {
			return new Program(script);
		}
	} }[PROXY_NAME];
}

export { defineEngine as Engine };
