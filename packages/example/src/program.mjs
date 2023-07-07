export const program = {
	*GET() {
		return yield this._val('done');
	},
	*SAT() {
		let count = 0, cause = null, ok = false;

		while (!ok && count < 3) {
			try {
				yield this._run('baz', {});

				return yield this.GET();
			} catch (error) {
				cause = error;
			}

			count++;
		}

		throw new Error('SAT failed 3 time.', { cause });
	},
	*main() {
		return yield this._all([
			this.SAT(),
			this.SAT(),
		]);
	},
};
