class FrameProxy {
	#frame;

	get returnValue() {
		return this.#frame.ret;
	}

	set returnValue(value) {
		this.#frame.ret = value;
	}

	constructor(frame) {
		this.#frame = frame;
	}
}

export class Frame {
	proxy = new FrameProxy(this);
	currentInstruction = null;
	isKernal = false;
	ret;
}


