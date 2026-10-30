import { pad2 } from './format.js';

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Display value for every unit once a countdown has finished. */
export const EXPIRED_COUNTDOWN = Object.freeze({ days: '00', hours: '00', minutes: '00', seconds: '00' });

/**
 * Splits a duration in milliseconds into zero-padded display strings.
 * @param {number} ms
 * @returns {{days: string, hours: string, minutes: string, seconds: string}}
 */
export function splitDuration(ms) {
  return {
    days: pad2(Math.floor(ms / DAY_MS)),
    hours: pad2(Math.floor((ms % DAY_MS) / HOUR_MS)),
    minutes: pad2(Math.floor((ms % HOUR_MS) / MINUTE_MS)),
    seconds: pad2(Math.floor((ms % MINUTE_MS) / SECOND_MS)),
  };
}
