import * as Instruction from './Instruction.mjs';
import { Process } from './Process.mjs';

export class Engine {
	CallInstruction = Instruction.Call;
	InstrucionSet = {};

	async execute(program, extern) {
		const process = new Process(this, program);

		return await process.run(extern);
	}
}

export { Engine as Base };
