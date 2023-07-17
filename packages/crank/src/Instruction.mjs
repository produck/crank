import { Frame } from './Frame.mjs';
import * as Utils from './Utils.mjs';

/** @type {WeakMap<Token, Instruction>} */
const CACHE = new WeakMap();

export class Token {
	#instruction;

	get done() {
		return this.#instruction.done;
	}

	setDone() {
		if (this.done) {
			Utils.RuntimeError('Duplicated `.setDone()`.');
		}

		this.#instruction.done = true;
	}

	constructor(instruction) {
		this.#instruction = instruction;

		Object.freeze(this);
	}

	async execute() {
		if (!this.#instruction.process.top.isKernal) {
			Utils.RuntimeError('Instruction can NOT be `.execute()`.');
		}

		return await this.#instruction.execute();
	}
}

export class Instruction {
	process;
	args = [];
	token = new Token(this);
	done = false;

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
		Utils.RuntimeError('._execute not be realized.');
	}
}

export class CallInstruction extends Instruction {
	async begin(frame) {
		const [routine] = this.args;
		let nextValue, thrown = false, last = null;

		do {
			frame.isKernal = false;

			const { value, done } = thrown
				? await routine.throw(nextValue)
				: await routine.next(nextValue);

			if (done) {
				frame.ret = value;
				this.done = last ? last.done : true;

				break;
			}

			const token = value;
			const instruction = CACHE.get(token);

			if (instruction !== frame.currentInstruction) {
				Utils.RuntimeError('Calling is not current instruction.');
			}

			frame.isKernal = true;

			try {
				thrown = false;
				nextValue = await instruction.execute();
			} catch (error) {
				thrown = true;
				nextValue = error;
			}

			last = token;
		} while (!await this._abort(last));
	}

	async _execute() {
		const nextFrame = new Frame();
		let called = false;

		await this._invoke(nextFrame, async () => {
			if (called) {
				Utils.RuntimeError('Multiple calling in options.call.');
			}

			this.process.stack.unshift(nextFrame);

			called = true;
			await this.begin(nextFrame);
		});

		if (!called) {
			Utils.RuntimeError('No calling in options.call.');
		}

		this.process.stack.shift();

		return nextFrame.ret;
	}

	async _invoke(_nextFrame, next) {
		await next();
	}

	async _abort() {
		return false;
	}
}

export {
	Instruction as Base,
	CallInstruction as Call,
};
