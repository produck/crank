// import Scope from './Scope'
import { Program } from './Program.mjs';
import * as Engine from './Engine.mjs';
import { CallInstruction, Instruction } from './Instruction.mjs';

const DEFAULT_CALL = (_s, _sc, next) => next();

// options.{Context, name, call, Scope};

export function defineEngine(options, executors = {}) {
	class CustomCallInstruction extends CallInstruction {
		_invoke(...args) {
			options.call(...args);
		}
	}

	const InstructionSet = {};

	for (const name of executors) {
		const INSTRUCTION_NAME = `${name}Instruction`;
		const executor = executors[name];

		const CustomInstruction = {
			[INSTRUCTION_NAME]: class extends Instruction {
				_execute(scope) {
					executor(scope, ...this.args);
				}
			},
		}[INSTRUCTION_NAME];

		InstructionSet[name] = (...args) => new CustomInstruction(...args).token;
	}

	const PROGRAM_NAME = `${options.name}Program`;

	const CustomProgram = { [PROGRAM_NAME]: class extends Program {
		$ = InstructionSet;
		static CallInstruction = CustomCallInstruction;
	} }[PROGRAM_NAME];

	const ENGINE_NAME = `${options.name}Engine`;

	const CustomEngine = { [ENGINE_NAME]: class extends Engine.Base {

	} }[ENGINE_NAME];

	Engine.set(CustomEngine, CustomProgram);

	return CustomEngine;
}

export { defineEngine as Engine };
