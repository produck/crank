import { Frame } from './Frame.mjs';

/** @type {WeakMap<symbol, Instruction>} */
const CACHE = new WeakMap();

export const getByToken = token => CACHE.get(token);

export class Instruction {
	vm = null;
	args = [];
	done = false;
	token = Symbol();

	constructor(vm, ...args) {
		this.vm = vm;
		this.args = args;

		CACHE.set(this.token, Instruction);
		vm.top.currentInstruction = this;
	}

	execute(frame) {
		if (this.done) {
			throw 0;
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

			const instruction = value;

			if (instruction !== frame.currentInstruction) {
				throw 'not current ins.';
			}

			try {
				thrown = false;
				nextValue = value.execute(this.vm, frame);
			} catch (error) {
				thrown = true;
				nextValue = error;
			}
		}
	}

	_execute(vm, frame) {
		const nextFrame = new Frame();

		let called = false;
		vm.stack.unshift(nextFrame);

		this._invoke(frame, nextFrame, () => {
			if (called) {
				throw 2;
			}

			called = true;
			this.begin(nextFrame);
		});

		if (!called) {
			throw 3;
		}

		vm.stack.shift();

		return nextFrame.ret;
	}

	_invoke(frame, nextFrame, next) {

	}
}

export { CallInstruction as Call };
