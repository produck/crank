import * as Crank from './index.mjs';
import { Program } from './Program.mjs';
import { Extern } from './Extern.mjs';
import { describe, it } from 'mocha';
import * as assert from 'node:assert/strict';

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
			const CustomEngineProxy = Crank.defineEngine({}, { a: () => {} });

			new CustomEngineProxy();
		});

		describe('.execute()', function () {
			const CustomEngineProxy = Crank.defineEngine({}, { a() {
			} });
			it.only('should execute a program', function () {
				const vm = new CustomEngineProxy();
				vm.execute(new Program({
					*SAT() {
						return yield this.$.a();
					},
					*main() {
						return yield this.SAT();
					},
				}), new Extern());
			});

			it('should throw if bad program', function () {
			});

			it('should throw if bad extern', function () {
			});
		});

		describe('::compile()', function () {
			const CustomEngineProxy = Crank.defineEngine({}, { a: () => {} });

			it('should return a program', function () {
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

