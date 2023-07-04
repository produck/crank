export class Extern {
	#args = [];

	get args() {
		return this.#args;
	}

	setArgs(...args) {
		this.#args = Object.freeze(args);
	}
}
