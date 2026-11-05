import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assertSubsLeaderboard } from '../../scripts/lib/kick-data.js';

test('accepts a subs leaderboard response', () => {
  assert.doesNotThrow(() => assertSubsLeaderboard('{"gifts":[{"username":"a","quantity":1}],"gifts_week":[]}'));
  assert.doesNotThrow(() => assertSubsLeaderboard('{"gifts":[],"gifts_enabled":false}'));
});

test('rejects a Cloudflare challenge page', () => {
  assert.throws(() => assertSubsLeaderboard('Checking your browser\n\nRay ID: 123'), /not JSON/);
});

test('rejects JSON without a gifts array', () => {
  assert.throws(() => assertSubsLeaderboard('{"message":"server error"}'), /no "gifts" array/);
  assert.throws(() => assertSubsLeaderboard('{"gifts":"nope"}'), /no "gifts" array/);
  assert.throws(() => assertSubsLeaderboard('null'), /no "gifts" array/);
});
