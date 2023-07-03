import * as Crank from './index.mjs';
import { Program } from './Program.mjs';
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
				a: async () => {
					return await sleep();
				},
			});

			new CustomEngineProxy();
		});

		describe('.execute()', function () {
			it.only('should execute a program', async function () {
				let flag = false;

				const CustomEngineProxy = Crank.defineEngine({}, {
					a: async () => {
						flag = true;

						return await sleep();
					},
				});

				const vm = new CustomEngineProxy();

				const process = await vm.execute(new Program({
					*SAT() {
						yield this.$.a();
					},
					*main() {
						yield this.SAT();
					},
				}), new Extern());

				assert.equal(flag, true);
			});

			it('should throw if bad program', function () {
			});

			it('should throw if bad extern', function () {
			});
		});

		describe('::compile()', function () {
			it('should return a program', function () {
				const CustomEngineProxy = Crank.defineEngine({}, { a: async () => {
					return await Promise.resolve('resolved');
				} });
				const program = CustomEngineProxy.compile({
					*main () {},
				});

				assert.equal(program.constructor, Program);
			});

			it('should throw with bad script', function () {
			});

			it('should throw with bad item of script', function () {
			});

			it('should throw with bad script without main', function () {
			});
		});
	});
});

