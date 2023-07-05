import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import * as Crank from './index.mjs';
import { Extern } from './Extern.mjs';

describe('::defineEngine()', function () {
	it('should create a CustomEngineProxy class by default.', function () {
		const CrankEngineProxy = Crank.defineEngine({});

		assert.equal(CrankEngineProxy.name, 'CrankEngineProxy');
	});

	it('should throw if bad options.Extern.', function () {
		assert.throws(() => {
			Crank.defineEngine({
				Extern() {},
			});
		}, {
			name: 'TypeError',
			message: /Invalid ".Extern", one "CustomExtern or Extern" expected./,
		});
	});

	it('should throw if bad options.abort.', async function () {
		await assert.rejects(async () => {
			const CustomEngineProxy = Crank.defineEngine({
				abort() {},
			});
			const vm = new CustomEngineProxy();

			await vm.execute({
				*main() {},
			}, new Extern());
		}, {
			name: 'TypeError',
			message: 'Invalid "flag <= options.abort()", one "boolean or Promise<boolean>" expected.',
		});
	});

	describe('>CustomEngineProxy', function () {
		it('should create a custom engine proxxy', function () {
			const CustomEngineProxy = Crank.defineEngine({}, {});

			new CustomEngineProxy();
		});

		describe('.execute()', function () {
			it('should execute a program', async function () {
				const CustomEngineProxy = Crank.defineEngine({}, {
					a: async () => {
						return 'pass';
					},
				});

				const vm = new CustomEngineProxy();

				const ret = await vm.execute({
					*SAT() {
						return yield this._a();
					},
					*main() {
						return yield this.SAT();
					},
				}, new Extern());

				assert.equal(ret, 'pass');
			});

			it('should throw if bad extern', async function () {
				class CustomExtern extends Extern {
					name = 'custom extern class';
				}

				const CustomEngineProxy = Crank.defineEngine({
					Extern: CustomExtern,
				});
				const vm = new CustomEngineProxy();

				await assert.rejects(async () => {
					await vm.execute({
						*main() {
							return yield 1;
						},
					}, new Extern());
				}, {
					name: 'TypeError',
					message: 'Invalid "extern", one "CustomExtern" expected.',
				});
			});
		});

		describe('.Extern', function () {
			it('should get options.Extern', function () {
				class CustomExtern extends Extern {
					name = 'custom';
				}

				const CustomEngineProxy = Crank.defineEngine({
					Extern: CustomExtern,
				}, {
					a: async function () {
						return await Promise.resolve(1);
					},
				});

				const program = {
					*step() {},
					*main() {
						return yield this.step();
					},
				};

				const CustomExternProvided = CustomEngineProxy.Extern;

				new CustomEngineProxy().execute(program, new CustomExternProvided());

				assert.equal(CustomExtern, CustomExternProvided);
			});
		});
	});
});

describe('::Extern', function () {
	it('should create a extern by default', function () {
		const extern = new Extern();

		assert.deepEqual(extern.args, []);
	});

	describe('.setArgs()', function () {
		it('should set extern.args by args', function () {
			const extern = new Extern();

			extern.setArgs(1, 2);
			assert.deepEqual(extern.args, [1, 2]);
		});
	});
});

