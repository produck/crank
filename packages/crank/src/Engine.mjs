import * as Instruction from './Instruction.mjs';
import { Process } from './Process.mjs';

export class Engine {
	CallInstruction = Instruction.Call;
	InstrucionSet = {};

	async execute(program, extern) {
		const process = new Process(this, program);

		await process.run(extern);

		return process.top.ret;
	}
}

export { Engine as Base };
