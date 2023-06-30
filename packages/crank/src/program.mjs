import * as Engine from './Engine.mjs';
import { normalizeScript } from './Options.mjs';

export class Program {
	get #vm() {
		return Engine.getByProgram(this);
	}

	get $() {
		return this.#vm.InstrucionSet;
	}

	constructor(script) {
		normalizeScript(script);

		for (const name in script) {
			const fn = script[name];

			this[name] = (...args) => {
				const routine = fn.call(this, ...args);

				return this.#vm.call(routine);
			};
		}

		Object.freeze(this);
	}
}
