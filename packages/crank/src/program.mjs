import * as Process from './Process.mjs';
import { normalizeScript } from './Options.mjs';

export class Program {
	get #process() {
		return Process.getByProgram(this);
	}

	get $() {
		return this.#process.instructions;
	}

	constructor(script) {
		normalizeScript(script);

		for (const name in script) {
			const fn = script[name];

			this[name] = (...args) => {
				const routine = fn.call(this, ...args);

				return this.#process.call(routine);
			};
		}

		Object.freeze(this);
	}
}
