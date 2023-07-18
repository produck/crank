import { Frame } from './Frame.mjs';
import * as Utils from './Utils.mjs';

/** @type {WeakMap<Token, Instruction>} */
const CACHE = new WeakMap();

export class Token {
	#instruction;

	get process() {
		return this.#instruction.process.proxy;
	}

	get frame() {
		return this.#instruction.frame.proxy;
	}

	/**
	 * @param {Instruction} instruction
	 */
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
	frame;
	args = [];
	token = new Token(this);

	/** @param {import('./Process.mjs').Process} process */
	constructor(process, ...args) {
		const frame = process.top;

		this.process = process;
		this.frame = frame;
		this.args = args;

		CACHE.set(this.token, this);
		frame.currentInstruction = this;
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

			frame.isKernal = true;

			if (done) {
				frame.ret = value;

				break;
			}

			const token = value;
			const instruction = CACHE.get(token);

			if (instruction !== frame.currentInstruction) {
				Utils.RuntimeError('Calling is not current instruction.');
			}

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
		let called = false, ok = true, error = null;

		await this._invoke(nextFrame, async () => {
			if (called) {
				Utils.RuntimeError('Multiple calling in options.call.');
			}

			called = true;
			this.process.stack.unshift(nextFrame);

			try {
				await this.begin(nextFrame);
			} catch (_error) {
				ok = false;
				error = _error;
			}
		});

		if (!called) {
			Utils.RuntimeError('No calling in options.call.');
		}

		this.process.stack.shift();

		if (ok) {
			return nextFrame.ret;
		} else {
			throw error;
		}
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
