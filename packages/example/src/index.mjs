import * as Crank from '@produck/crank';
import { executors, CutomExtern } from './executors.mjs';
import { program } from './program.mjs';
import { dump } from './dump.mjs';

const Engine = Crank.defineEngine({
	Extern: CutomExtern,
	call: async (token, next) => {
		await next();
	},
}, executors);

const extern = new Engine.Extern({
	crafts: {
		example: () => {},
	},
	dump: dump,
	finished: {},
});
new Engine().execute(program, extern);
