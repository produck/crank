import { RuntimeError } from './Utils.mjs';

export class Extern {
	#args = [];

	get args() {
		return this.#args;
	}

	constructor (args) {
		if (args && !(Symbol.iterator in args)) {
			RuntimeError(1);
		}

		this.#args = args || this.#args;
	}
}
