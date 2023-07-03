import * as Instruction from './Instruction.mjs';
import { Process } from './Process.mjs';

export class Engine {
	CallInstruction = Instruction.Call;
	InstrucionSet = {};

	createProcess(program, extern) {
		return new Process(this, program, extern);
	}
}

export { Engine as Base };
