import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spotlightColor } from '../../assets/js/effects/spotlight.js';

// Golden values produced by the original inline implementation.
const GOLDEN = [
  [0, 0, 'rgba(144,140,180,0.17)'],
  [0.18, 0.14, 'rgba(173,147,182,0.24)'], // pink hot zone
  [0.02, 0.5, 'rgba(112,192,250,0.24)'], // blue hot zone
  [0.5, 0.72, 'rgba(182,204,239,0.24)'], // white hot zone
  [0.5, 0.5, 'rgba(160,181,219,0.20)'],
  [1, 1, 'rgba(125,145,190,0.14)'],
];

for (const [x, y, expected] of GOLDEN) {
  test(`spotlightColor(${x}, ${y}) matches the original tint`, () => {
    assert.equal(spotlightColor(x, y), expected);
  });
}
