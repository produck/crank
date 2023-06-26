import * as crank from './index.mjs';
import { describe, it } from 'mocha';
import * as assert from 'node:assert/strict';

describe('crank module test', function () {
	it('crank function test', function () {
		assert.ok(crank.compare());
	});
});

