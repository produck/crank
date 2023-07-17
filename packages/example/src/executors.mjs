import { isToken, Extern } from '@produck/crank';
import { webcrypto as crypto } from 'node:crypto';

export const executors = {
	val(token, args) {
		const extern = token.process.extern;

		return extern.dump.fetchValue(...args);
	},
	run(token, args) {
		const extern = token.process.extern;
		const id = extern.dump.fetchValue(crypto.randomUUID());

		if (!extern.hasJob(id)) {
			const [craft, source] = args;

			extern.planJob(id, craft, source);
		} else {
			const { ok, error, target } = extern.fetchJob(id);

			if (ok) {
				return target;
			} else {
				throw new Error(error);
			}
		}
	},
	all: async (token, args) => {
		const ret = [];
		const [list] = args;

		for (const item of list) {
			if (isToken(item)) {
				const val = await item.execute();

				ret.push(val);
			} else {
				ret.push(item);
			}
		}

		return ret;
	},
};

export class CutomExtern extends Extern {
	dump = null;
	finished = {};
	creating = [];
	crafts = {};
	done = false;

	constructor(_data) {
		super();

		const data = _data;

		this.dump = data.dump;
		this.finished = data.finished;
		this.crafts = data.crafts;
	}

	hasJob(jobId) {
		return Object.hasOwn(this.finished, jobId);
	}

	fetchJob(id) {
		return this.finished[id];
	}

	planJob(id, craft, source) {
		this.creating.push({ id, craft, source });
	}
}
