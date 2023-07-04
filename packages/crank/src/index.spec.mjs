import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import * as Crank from './index.mjs';
import { Extern } from './Extern.mjs';
import * as Utils from './Utils.mjs';

describe('::defineEngine()', function () {
	it('should create a custom engine class by default', function () {
		const CrankEngineProxy = Crank.defineEngine();

		assert.equal(CrankEngineProxy.name, 'CrankEngineProxy');
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
				const CustomEngineProxy = Crank.defineEngine();
				const vm = new CustomEngineProxy();

				await assert.rejects(async () => {
					await vm.execute({
						*main() {
							return yield 1;
						},
					}, {});
				}, {
					name: 'TypeError',
					message: 'Invalid "extern", one "CustomExtern" expected.',
				});
			});
		});
	});
});

describe('::Extern', function () {
	it('should create a extern by default', function () {
		const extern = new Extern();
	});

	describe('.setArgs()', function () {
		it('should set extern.args by args', function () {
			const extern = new Extern();

			extern.setArgs(1);
		});
	});
});

