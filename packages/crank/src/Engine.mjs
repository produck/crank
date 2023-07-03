import * as Instruction from './Instruction.mjs';
import { Process } from './Process.mjs';

export class Engine {
	name = '';
	CallInstruction = Instruction.Call;
	InstrucionSet = {};

	constructor() {
		this.name = new.target.name;
	}

	execute(program, extern) {
		new Process(this).execute(program, extern);
	}
}

export { Engine as Base };
