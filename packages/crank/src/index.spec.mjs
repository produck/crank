import * as Crank from './index.mjs';
import { describe, it } from 'mocha';
import * as assert from 'node:assert/strict';

describe('::defineEngine()', function () {
	it('should create a custom engine class by default', function () {
		const Engine = Crank.defineEngine();

		assert.equal(Engine.name, 'CrankEngineProxy');
	});

	describe('>CustomEngineProxy', function () {
		it('should create a custom engine proxxy', function () {
			const CustomEngineProxy = Crank.defineEngine({}, { a: () => {} });

			new CustomEngineProxy();
		});

		describe('.execute()', function () {

		});

		describe('::compile()', function () {

		});
	});
});

