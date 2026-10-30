import assert from 'node:assert/strict';
import { test } from 'node:test';

// formatDateHe uses local time; pin the zone before any Date is created.
process.env.TZ = 'UTC';

const { formatCount, formatDateHe, formatPrize, formatWagered, maskName, pad2 } = await import('../../assets/js/utils/format.js');

test('pad2 left-pads to two digits', () => {
  assert.equal(pad2(7), '07');
  assert.equal(pad2(42), '42');
  assert.equal(pad2(123), '123');
});

test('maskName hides all but the first and last character', () => {
  assert.equal(maskName('PlayerOne'), 'P******e');
});

test('maskName keeps names already masked by the API', () => {
  assert.equal(maskName('J*****d'), 'J*****d');
});

test('maskName keeps very short names and handles missing names', () => {
  assert.equal(maskName('ab'), 'ab');
  assert.equal(maskName(''), '---');
  assert.equal(maskName(undefined), '---');
});

test('formatDateHe renders a Hebrew date with zero-padded time', () => {
  // 2026-10-31T21:05:00Z
  assert.equal(formatDateHe(1793480700), '31 באוקטובר 2026 בשעה 21:05');
  assert.equal(formatDateHe(Date.UTC(2026, 0, 2, 3, 4) / 1000), '2 בינואר 2026 בשעה 03:04');
});

test('formatDateHe falls back to "---" without a date', () => {
  assert.equal(formatDateHe(0), '---');
  assert.equal(formatDateHe(undefined), '---');
});

test('formatWagered passes pre-formatted API strings through unchanged', () => {
  assert.equal(formatWagered('156,476'), '156,476');
});

test('formatWagered rounds numbers to whole units', () => {
  assert.equal(formatWagered(1234.6), (1235).toLocaleString());
});

test('formatPrize shows "0" when there is no prize', () => {
  assert.equal(formatPrize(0), '0');
  assert.equal(formatPrize(undefined), '0');
  assert.equal(formatPrize(3000), (3000).toLocaleString());
});

test('formatCount treats a missing count as 0', () => {
  assert.equal(formatCount(undefined), '0');
  assert.equal(formatCount(218500), (218500).toLocaleString());
});
