import { Frame } from './Frame.mjs';

import { RuntimeError } from './Utils.mjs';

/** @type {WeakMap<symbol, Instruction>} */
const CACHE = new WeakMap();

export const getByToken = token => CACHE.get(token);

export class Instruction {
	vm = null;
	args = [];
	done = false;
	token = Object.freeze({ token: true });

	constructor(vm, ...args) {
		this.vm = vm;
		this.args = args;
		CACHE.set(this.token, this);
		this.vm.top.currentInstruction = this;
	}

	execute(frame) {
		if (this.done) {
			RuntimeError(0);
		}

		this._execute(frame);
	}
}

export class CallInstruction extends Instruction {
	begin(frame) {
		const [routine] = this.args;
		let nextValue, thrown = false;

		frame.routine = routine;

		while (true) {
			const { value, done } = thrown
				? routine.throw(nextValue)
				: routine.next(nextValue);

			if (done) {
				frame.ret = value;

				break;
			}

			const instruction = getByToken(value);

			if (instruction !== frame.currentInstruction) {
				RuntimeError('not current ins.');
			}

			try {
				thrown = false;
				nextValue = instruction.execute(this.vm, frame);
			} catch (error) {
				thrown = true;
				nextValue = error;
			}
		}
	}

	_execute(frame) {
		const nextFrame = new Frame();

		let called = false;
		this.vm.stack.unshift(nextFrame);

		this._invoke(frame, nextFrame, () => {
			if (called) {
				RuntimeError(2);
			}

			called = true;
			this.begin(nextFrame);
		});

		if (!called) {
			RuntimeError(3);
		}

		this.vm.stack.shift();

		return nextFrame.ret;
	}

	_invoke(frame, nextFrame, next) {

	}
}

export { CallInstruction as Call };
