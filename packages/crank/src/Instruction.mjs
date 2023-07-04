import { Frame } from './Frame.mjs';
import * as Utils from './Utils.mjs';

/** @type {WeakMap<object, Instruction>} */
const CACHE = new WeakMap();

export class Instruction {
	process;
	args = [];
	token = Object.freeze({ token: true });

	/** @param {import('./Process.mjs').Process} process */
	constructor(process, ...args) {
		this.process = process;
		this.args = args;

		CACHE.set(this.token, this);
		this.process.top.currentInstruction = this;
	}

	async execute() {
		return await this._execute();
	}

	async _execute() {
		Utils.RuntimeError(1);
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

			const instruction = CACHE.get(value);

			if (instruction !== frame.currentInstruction) {
				Utils.RuntimeError('not current ins.');
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

		await this._invoke(nextFrame, async () => {
			if (called) {
				Utils.RuntimeError(2);
			}

			called = true;
			await this.begin(nextFrame);
		});

		if (!called) {
			Utils.RuntimeError(3);
		}

		this.process.stack.shift();

		return nextFrame.ret;
	}

	async _invoke(_nextFrame, next) {
		next();
	}

	async _abort() {
		return false;
	}
}

export {
	Instruction as Base,
	CallInstruction as Call,
};
