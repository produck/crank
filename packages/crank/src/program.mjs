import { CallInstruction } from './Instruction.mjs';
import { Scope } from './Scope.mjs';

function assertScript() {

}

export class Program {
	static CallInstruction = CallInstruction;
	globalScope = new Scope();

	$ = {};

	constructor(script) {
		assertScript(script);

		const { CallInstruction } = new.target;

		for (const name in script) {
			const fn = script[name];

			this[name] = (...args) => {
				const routine = fn.call(this, ...args);

				return new CallInstruction(this.globalScope, routine).token;
			};
		}

		Object.freeze(this.$);
		Object.freeze(this);
	}
}
