import * as Crank from './index.mjs';
import { Extern } from './Extern.mjs';
import { describe, it } from 'mocha';
import * as assert from 'node:assert/strict';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

describe('::defineEngine()', function () {
	it('should create a custom engine class by default', function () {
		const CrankEngineProxy = Crank.defineEngine();

		assert.equal(CrankEngineProxy.name, 'CrankEngineProxy');
	});

	it('should thrown by bad options', function () {
	});

	it('should thrown create by bad options.name', function () {
	});

	it('should thrown create by bad options.call', function () {
	});

	it('should thrown create by bad options.Extern', function () {
	});

	it('should thrown create by bad executors', function () {
	});

	it('should thrown create by bad item of executors', function () {
	});

	describe('>CustomEngineProxy', function () {
		it('should create a custom engine proxxy', function () {
			const CustomEngineProxy = Crank.defineEngine({}, {
				a: () => {
					return sleep();
				},
			});

			new CustomEngineProxy();
		});

		describe('.execute()', function () {
			it.only('should execute a program', async function () {
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

			it('should throw if bad program', function () {
			});

			it('should throw if bad extern', function () {
			});
		});
	});
});

