import * as Engine from './Engine.mjs';
import * as Instruction from './Instruction.mjs';
import * as Utils from './Utils.mjs';
import * as Options from './Options.mjs';

export function defineEngine(...args) {
	const options = Options.normalizeOptions(...args.slice(0, 1));
	const executors =	Options.normalizeExecutors(...args.slice(1, 2));

	class CustomCallInstruction extends Instruction.Call {
		async _abort(last) {
			const flag = await options.abort(last, this.process.proxy);

			if (typeof flag !== 'boolean') {
				Utils.TypeError('flag <= options.abort()', 'boolean or Promise<boolean>');
			}

			return flag;
		}

		async _invoke(nextFrame, next) {
			await options.call(this.process.proxy, nextFrame.proxy, next);
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
					[INSTRUCTION_NAME]: class extends Instruction.Base {
						async _execute() {
							return await executor(this.process.proxy, ...this.args);
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

		static get Extern() {
			return options.Extern;
		}

		async execute(program, extern) {
			Options.normalizeProgram(program);

			if (!Utils.Instance(extern, options.Extern)) {
				Utils.TypeError('extern', 'CustomExtern');
			}

			return await this.#engine.execute(program, extern);
		}
	} }[PROXY_NAME];
}

export { defineEngine as Engine };
