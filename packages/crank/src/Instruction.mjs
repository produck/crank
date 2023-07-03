import { Frame } from './Frame.mjs';

import { RuntimeError } from './Utils.mjs';

/** @type {WeakMap<symbol, Instruction>} */
const CACHE = new WeakMap();

export const getByToken = token => CACHE.get(token);

export class Instruction {
	process = null;
	frame = null;
	args = [];
	token = Object.freeze({ token: true });

	constructor(process, frame, ...args) {
		this.process = process;
		this.frame = frame;
		this.args = args;

		CACHE.set(this.token, this);
		this.process.top.currentInstruction = this;
	}

	execute() {
		this._execute();
	}

	_execute() {
		RuntimeError(1);
	}
}

export class CallInstruction extends Instruction {
	begin(frame) {
		const [routine] = this.args;
		let nextValue, thrown = false;

		while (true) { // 允许提前退出功能
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
				nextValue = instruction.execute();
			} catch (error) {
				thrown = true;
				nextValue = error;
			}
		}
	}

	_execute() {
		const nextFrame = new Frame();

		this.process.stack.unshift(nextFrame);

		let called = false;

		this._invoke(this.frame, nextFrame, () => {
			if (called) {
				RuntimeError(2);
			}

			called = true;
			this.begin(nextFrame);
		});

		if (!called) {
			RuntimeError(3);
		}

		this.process.stack.shift();

		return nextFrame.ret;
	}

	_invoke(_frame, _nextFrame, next) {
		next();
	}
}

export { CallInstruction as Call };
