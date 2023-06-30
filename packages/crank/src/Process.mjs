/*
引擎多进程实现
允许二级用户投入async generator function使用
允许指令execute使用async function
允许用户结束单个进程
 */
import * as Instruction from './Instruction.mjs';

import { Frame } from './Frame.mjs';

/**@type {WeakMap<import('./Program.mjs').Program, Engine>} */
const BINDING = new WeakMap();

export const getByProgram = program => BINDING.get(program);

export class Process {
	vm = null;
	program = null;
	stack = [];
	instructions = {};

	get top() {
		return this.stack[0];
	}

	constructor(vm, program) {
		this.vm = vm;
		this.program = program;

		for (const name in vm.InstrucionSet) {
			const CustomInstruction = vm.InstrucionSet[name];
			const proxy = (...args) => new CustomInstruction(this, this.top, ...args).token;

			this.instructions[name] = proxy;
		}

		this.bottomFrame = new Frame();
		this.stack.unshift(this.bottomFrame);
	}

	call(routine) {
		return new this.vm.CallInstruction(this, this.top, routine).token;
	}

	execute(program, extern) {
		BINDING.set(program, this);

		const mainToken = program.main(...extern.args);
		Instruction.getByToken(mainToken).execute();

		BINDING.delete(program);
	}
}
