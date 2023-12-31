import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import * as Crank from '../src/index.mjs';
import * as Instruction from '../src/Instruction.mjs';

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
			}, {
				b() {},
			});

			const vm = new CustomEngineProxy();

			await vm.execute({
				*main() {
					yield this._b();
				},
			}, new Crank.Extern());
		}, {
			name: 'TypeError',
			message: 'Invalid "flag <= options.abort()", one "boolean or Promise<boolean>" expected.',
		});
	});

	it('should throw if multiple calling options.call.', async function () {
		await assert.rejects(async () => {
			const CustomEngineProxy = Crank.defineEngine({
				call: async function (token, next) {
					await next();
					await next();
				},
			});
			const vm = new CustomEngineProxy();

			await vm.execute({
				*main() {},
			}, new Crank.Extern());
		}, {
			name: 'Error',
			message: 'Multiple calling in options.call.',
		});
	});

	it('should throw if no calling options.call.', async function () {
		await assert.rejects(async () => {
			const CustomEngineProxy = Crank.defineEngine({
				call: async function () {
				},
			});
			const vm = new CustomEngineProxy();

			await vm.execute({
				*main() {},
			}, new Crank.Extern());
		}, {
			name: 'Error',
			message: 'No calling in options.call.',
		});
	});

	describe('>CustomEngineProxy', function () {
		it('should create a custom engine proxy.', function () {
			const CustomEngineProxy = Crank.defineEngine({}, {});

			new CustomEngineProxy();
		});

		describe('.execute()', function () {
			it('should execute a program.', async function () {
				const extern = new Crank.Extern();

				const CustomEngineProxy = Crank.defineEngine({}, {
					a: async (token) => {
						token.frame.returnValue = 'pass';

						return 'pass';
					},
				});

				const vm = new CustomEngineProxy();

				const ret = await vm.execute({
					*foo() {
						return yield this._a();
					},
					*main() {
						return yield this.foo();
					},
				}, extern);

				assert.equal(ret, 'pass');
			});

			it('should calling instruction.execute in instruction.', async function () {
				const CustomEngineProxy = Crank.defineEngine({}, {
					b: () => {
						return Promise.resolve(1);
					},
					a: async (token, args) => {
						const ret = [];

						for (const item of args) {
							if (Crank.isToken(item)) {
								const val = await item.execute();

								ret.push(val);
							} else {
								ret.push(item);
							}
						}

						assert.deepEqual(token.frame, token.process.top);

						return ret;
					},
				});

				const vm = new CustomEngineProxy();

				const ret = await vm.execute({
					async *foo() {
						return yield this._b();
					},
					async *main() {
						yield this.foo();
						return yield this._a(this._b(), this._b());
					},
				}, new Crank.Extern());

				assert.deepEqual(ret, [
					1, 1,
				]);
			});

			it('should throw if calling instruction.execute in program', async function () {
				const CustomEngineProxy = Crank.defineEngine({}, {
					b: () => {
						return Promise.resolve(1);
					},
				});

				const vm = new CustomEngineProxy();

				await assert.rejects(async () => {
					await vm.execute({
						async *foo() {
							return yield this._b();
						},
						async *main() {
							await this._b().execute();
							return yield this._b();
						},
					}, new Crank.Extern());
				}, {
					name: 'Error',
					message: 'Instruction can NOT be `.execute()`.',
				});
			});

			it('should throw if bad extern.', async function () {
				class CustomExtern extends Crank.Extern {
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
					}, new Crank.Extern());
				}, {
					name: 'TypeError',
					message: 'Invalid "extern", one "CustomExtern" expected.',
				});
			});

			it('should throw if calling bad instruction.', async function () {
				const CustomEngineProxy = Crank.defineEngine();

				const vm = new CustomEngineProxy();

				await assert.rejects(async () => {
					await vm.execute({
						*foo() {
							return yield this._a();
						},
						*main() {
							return yield this.foo();
						},
					}, new Crank.Extern());
				}, {
					name: 'Error',
					message: 'No instruction.',
				});
			});

			it('should throw if calling bad function of program.', async function () {
				const CustomEngineProxy = Crank.defineEngine();

				const vm = new CustomEngineProxy();

				await assert.rejects(async () => {
					await vm.execute({
						*main() {
							return yield this.foo();
						},
					}, new Crank.Extern());
				}, {
					name: 'Error',
					message: 'No function of program.',
				});
			});

			it('should throw if calling not current instruction.', async function () {
				const CustomEngineProxy = Crank.defineEngine({}, {
					a: async () => {
						return 'pass';
					},
					b: async () => {
						return 'twice pass';
					},
				});

				const vm = new CustomEngineProxy();

				await assert.rejects(async () => {
					await vm.execute({
						*foo() {
							return yield this._b();
						},
						*main() {
							const token = this._a();
							yield this.foo();

							return yield token;
						},
					}, new Crank.Extern());
				}, {
					name: 'Error',
					message: 'Calling is not current instruction.',
				});
			});

			it('should change return value if change frame.returnValue.', async function () {
				const CustomEngineProxy = Crank.defineEngine({
					async call(token, next, nextFrame) {
						const currentFrame = token.frame;
						await next();

						if (nextFrame.returnValue === 'pass') {
							nextFrame.returnValue = 'change return value';
						}

						assert.ok(currentFrame !== nextFrame);
					},
				}, {
					a: async () => {
						return 'pass';
					},
				});

				const vm = new CustomEngineProxy();

				const ret = await vm.execute({
					*foo() {
						return yield this._a();
					},
					*main() {
						return yield this.foo();
					},
				}, new Crank.Extern());

				assert.equal(ret, 'change return value');
			});

			it('should throw an error', async function () {
				const CustomEngineProxy = Crank.defineEngine();
				const vm = new CustomEngineProxy();

				await vm.execute({
					*a() {
						yield 1;
					},
					*main() {
						try {
							yield this.a();
						} catch {
							'ignore';
						}
					},
				}, new Crank.Extern());
			});

			it('should execute a complex program.', async function () {
				const extern = new Crank.Extern();

				const CustomEngineProxy = Crank.defineEngine({}, {
					all: async (token, args) => {
						const ret = [];

						for (const item of args) {
							if (Crank.isToken(item)) {
								let value;

								try {
									value = await item.execute();
								} catch (error) {
									value = error;
								}

								ret.push(value);
							} else {
								ret.push(item);
							}
						}

						return ret;
					},
				});

				const vm = new CustomEngineProxy();

				const ret = await vm.execute({
					*foo() {
						let count = 0, cause = null, ok = false;

						while (!ok && count < 3) {
							try {
								return yield this._run('foo', {});
							} catch (error) {
								cause = error;
							}

							count++;
						}

						throw new Error('foo failed 3 time.', { cause });
					},
					*main() {
						return yield this._all(
							this.foo(),
							this.foo(),
						);
					},
				}, extern);

				assert.deepEqual(ret, [
					new Error('foo failed 3 time.'),
					new Error('foo failed 3 time.'),
				]);
			});

			it('should return [{}, {}]', async function () {
				const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

				const CustomEngineProxy = Crank.defineEngine({}, {
					async foo(token, args) {
						const [ms] = args;

						if (ms <= 1000) {
							return 1;
						} else {
							throw new Error('Overtime.');
						}
					},
				});
				const vm = new CustomEngineProxy();

				const ret = await Promise.allSettled([
					vm.execute({
						async *main() {
							await sleep(1000);

							return yield this._foo(2000);
						},
					}, new Crank.Extern()),
					vm.execute({
						async *main() {
							await sleep(1000);

							return yield this._foo(1000);
						},
					}, new Crank.Extern()),
				]);

				assert.deepEqual(ret, [{
					status: 'rejected', reason: new Error('Overtime.'),
				}, {
					status: 'fulfilled', value: 1,
				}]);
			});
		});

		describe('.Extern', function () {
			it('should get options.Extern.', async function () {
				class CustomExtern extends Crank.Extern {
					name = 'custom';
				}

				const CustomEngineProxy = Crank.defineEngine({
					Extern: CustomExtern,
				}, {
					a: async function (token) {
						token.process.extern.name = `${token.process.extern.name} extern`;

						return await Promise.resolve(1);
					},
				});

				const program = {
					*step() {},
					*main() {
						yield this._a();

						return yield this.step();
					},
				};

				const CustomExternProvided = CustomEngineProxy.Extern;
				const extern = new CustomExternProvided();

				await new CustomEngineProxy().execute(program, extern);

				assert.equal(CustomExtern, CustomExternProvided);
				assert.equal(extern.name, 'custom extern');
			});
		});
	});
});

describe('::Extern', function () {
	it('should create a extern by default.', function () {
		const extern = new Crank.Extern();

		assert.deepEqual(extern.args, []);
	});

	describe('.setArgs()', function () {
		it('should set extern.args by args.', function () {
			const extern = new Crank.Extern();

			extern.setArgs(1, 2);
			assert.deepEqual(extern.args, [1, 2]);
		});
	});
});

describe('::Instruction', function () {
	it('should throw if not realize ._execute.', async function () {
		await assert.rejects(async () => {
			class WrongInstruction extends Instruction.Base {
				name = 'ErrorInstruction';
			}

			await new WrongInstruction({
				top: {},
			}).execute();
		}, {
			name: 'Error',
			message: '._execute not be realized.',
		});
	});

	describe('::CallInstruction', function () {
		it('should create a callInstruction by class CallInstruction.', async () => {
			const process = {
				stack: [{}],
				get top() { return this.stack[0]; },
			};

			const callInstruction = new Instruction.Call(process, (function *a () {
				const instruction = new Instruction.Call(process, (function *b () {

				})());

				yield instruction.token;
			})());

			await callInstruction.execute();
		});
	});
});
