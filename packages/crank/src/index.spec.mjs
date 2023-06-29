import * as Crank from './index.mjs';
import { Program } from './Program.mjs';
import { Context } from './Context.mjs';
import { describe, it } from 'mocha';
import * as assert from 'node:assert/strict';

describe('::defineEngine()', function () {
	it('should create a custom engine class by default', function () {
		const Engine = Crank.defineEngine();

		assert.equal(Engine.name, 'CrankEngineProxy');
	});

	it('should thrown by bad options', function () {
		try {
			Crank.defineEngine(1);
		} catch (e) {
			assert.equal(1, e);
		}
	});

	it('should thrown create by bad options.name', function () {
		try {
			Crank.defineEngine({ name: 1 });
		} catch (e) {
			assert.equal(1, e);
		}
	});

	it('should thrown create by bad options.call', function () {
		try {
			Crank.defineEngine({ call: 1 });
		} catch (e) {
			assert.equal(1, e);
		}
	});

	it('should thrown create by bad options.Context', function () {
		try {
			Crank.defineEngine({ Context: 1 });
		} catch (e) {
			assert.equal(1, e);
		}
	});

	it('should thrown create by bad executors', function () {
		try {
			Crank.defineEngine({}, 1);
		} catch (e) {
			assert.equal(1, e);
		}
	});

	it('should thrown create by bad item of executors', function () {
		try {
			Crank.defineEngine({}, {
				test: 1,
			});
		} catch (e) {
			assert.equal(1, e);
		}
	});

	describe('>CustomEngineProxy', function () {
		it('should create a custom engine proxxy', function () {
			const CustomEngineProxy = Crank.defineEngine({}, { a: () => {} });

			new CustomEngineProxy();
		});

		describe('.execute()', function () {
			const CustomEngineProxy = Crank.defineEngine({}, { a() {
			} });
			const vm = new CustomEngineProxy();
			it('should execute a program', function () {
				vm.execute(new Program({
					*SAT() {
						let count = 0, cause = null, ok = false;

						while (!ok && count < 3) {
							try {
								return yield this.$.a();
							} catch (error) {
								cause = error;
							}

							count++;
						}

						throw new Error('SAT failed 3 time.', { cause });
					},
					*main() {
						return yield this.SAT();
					},
				}), new Context());
			});

			it('should throw if bad program', function () {
			});

			it('should throw if bad context', function () {
			});
		});

		describe('::compile()', function () {
			const CustomEngineProxy = Crank.defineEngine({}, { a: () => {} });

			it('should return a program', function () {
				CustomEngineProxy.compile(new Program({
					main () {},
				}));
			});

			it('should throw with bad script', function () {
				try {
					CustomEngineProxy.compile(new Program(1));
				} catch (e) {
					assert.equal(1, e);
				}
			});
			it('should throw with bad item of script', function () {
				try {
					CustomEngineProxy.compile(new Program({
						a: 1,
					}));
				} catch (e) {
					assert.equal(1, e);
				}
			});
			it('should throw with bad script without main', function () {
				try {
					CustomEngineProxy.compile(new Program({
						a() {},
					}));
				} catch (e) {
					assert.equal(1, e);
				}
			});
		});
	});
});

