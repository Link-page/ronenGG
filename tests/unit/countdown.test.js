import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EXPIRED_COUNTDOWN, splitDuration } from '../../assets/js/utils/countdown.js';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

test('splitDuration splits into padded days/hours/minutes/seconds', () => {
  assert.deepEqual(splitDuration(2 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND + 999), {
    days: '02', hours: '03', minutes: '04', seconds: '05',
  });
});

test('splitDuration keeps more than 99 days unpadded', () => {
  assert.equal(splitDuration(120 * DAY).days, '120');
});

test('splitDuration of zero is all zeros', () => {
  assert.deepEqual(splitDuration(0), { ...EXPIRED_COUNTDOWN });
});

test('splitDuration shows NaN for a missing end date (legacy behaviour)', () => {
  assert.deepEqual(splitDuration(NaN), { days: 'NaN', hours: 'NaN', minutes: 'NaN', seconds: 'NaN' });
});
