import * as Engine from './Engine.mjs';
import { CallInstruction, Instruction } from './Instruction.mjs';
import { Program } from './Program.mjs';
import { Context } from './Context.mjs';

const DEFAULT_CALL = (_s, _sc, next) => next();

const normalizeOptions = (_options = {}) => {
	if (typeof _options !== 'object') {
		throw 1;
	}

	const options = {
		name: 'Crank',
		call: DEFAULT_CALL,
		Context,
	};

	const {
		name: _name = options.name,
		call: _call = options.call,
		Context: _Context = options.Context,
	} = _options;

	if (typeof _name !== 'string') {
		throw 1;
	}

	if (typeof _call !== 'function') {
		throw 1;
	}

	if (typeof _Context !== 'function' || Object.prototype.isPrototypeOf.call(Context, _Context)) {
		throw 1;
	}

	options.name = _name;
	options.call = _call;
	options.Context = _Context;

	return options;
};

const normalizeExecutors = (executors = {}) => {
	if (typeof executors !== 'object') {
		throw 1;
	}

	const options = {};

	for (const name in executors) {
		const executor = executors[name];

		if (typeof executor !== 'function') {
			throw 1;
		}

		options[name] = executor;
	}

	return options;
};

// options.{Context, name, call};

export function defineEngine(...args) {
	const options = normalizeOptions(...args.slice(0, 1));
	const executors =	normalizeExecutors(...args.slice(1, 2));

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

			if (Object.getPrototypeOf(program) !== Program.prototype) {
				throw 1;
			}

			if (Object.getPrototypeOf(context) !== options.Context.prototype) {
				throw 1;
			}

			return this.#engine.execute(program, context);
		}

		static compile(script) {
			return new Program(script);
		}
	} }[PROXY_NAME];
}

export { defineEngine as Engine };
