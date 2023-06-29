import * as Engine from './Engine.mjs';

function assertScript(script) {
	if (typeof script !== 'object') {
		throw 1;
	}

	for (const key in script) {
		if (typeof script[key] !== 'function') {
			throw 1;
		}
	}

	if (!script.main) {
		throw 1;
	}
}

export class Program {
	get #vm() {
		return Engine.getByProgram(this);
	}

	get $() {
		return this.#vm.InstrucionSet;
	}

	constructor(script) {
		assertScript(script);

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
