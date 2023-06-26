import * as example from './index.mjs';
import { describe, it } from 'mocha';
import * as assert from 'node:assert/strict';

describe('example module test', function () {
	it('example function test', function () {
		assert.ok(example.compare2());
	});
});
