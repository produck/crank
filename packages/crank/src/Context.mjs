export class Context {
	constructor (args = []) {
		if (!(Symbol.iterator in args)) {
			throw 1;
		}

		this.args = args;
	}
}
