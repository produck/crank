import { Scope } from './Scope.mjs';

/** @type {WeakMap<symbol, Instruction>} */
const CACHE = new WeakMap();

export const getByToken = token => CACHE.get(token);

let current = null;

export class Instruction {
	args = [];
	done = false;
	token = Symbol();

	constructor(...args) {
		this.args = args;
		CACHE.set(this.token, Instruction);
		current = this;
	}

	execute(scope) {
		if (this.done) {
			throw 0;
		}

		this._execute(scope);
	}
}

export class CallInstruction extends Instruction {
	begin(scope) {
		const [routine] = this.args;
		let nextValue, thrown = false;

		while (true) {
			const { value, done } = thrown
				? routine.throw(nextValue)
				: routine.next(nextValue);

			if (done) {
				break;
			}

			if (value !== current) {
				throw 'not current ins.';
			}
		}
	}

	_execute(scope) {
		const childScope = new Scope();
		let called = false;

		this._invoke(scope, childScope, () => {
			if (called) {
				throw 2;
			}

			called = true;
			this.begin(childScope);
		});

		if (!called) {
			throw 3;
		}

		return childScope.ret;
	}

	_invoke(scope, childScope, next) {

	}
}
