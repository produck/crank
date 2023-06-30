import { RuntimeError } from './Utils.mjs';

export class Extern {
	constructor (args = []) {
		if (args && !(Symbol.iterator in args)) {
			RuntimeError();
		}

		this.args = args;
	}
}
