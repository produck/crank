import * as Crank from './index.mjs';
import { describe, it } from 'mocha';
import * as assert from 'node:assert/strict';

describe('crank module test', function () {
	it('crank function test', function () {
		const Evaluator = Crank.Engine();
		const vm = new Evaluator();
		const program = Evaluator.compile()
	});
});

