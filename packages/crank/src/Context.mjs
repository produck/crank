export class ProcessProxy {
	#process = null;

	get frame() {
		const currentFrame = this.#process.top;

		return {
			ret: currentFrame.ret,
		};
	}

	constructor(process) {
		this.#process = process;
	}
}
