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

	async execute() {
		await this._execute();
	}

	async _execute() {
		RuntimeError(1);
	}
}

export class CallInstruction extends Instruction {
	async begin(frame) {
		const [routine] = this.args;
		let nextValue, thrown = false;

		while (!await this._abort()) {
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
				nextValue = await instruction.execute();
			} catch (error) {
				thrown = true;
				nextValue = error;
			}
		}
	}

	async _execute() {
		const nextFrame = new Frame();

		this.process.stack.unshift(nextFrame);

		let called = false;

		await this._invoke(async () => {
			if (called) {
				RuntimeError(2);
			}

			called = true;
			await this.begin(nextFrame);
		});

		if (!called) {
			RuntimeError(3);
		}

		this.process.stack.shift();

		return nextFrame.ret;
	}

	_invoke(next) {
		next();
	}

	_abort() {
		return false;
	}
}

export { CallInstruction as Call };
