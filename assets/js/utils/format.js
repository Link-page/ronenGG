/**
 * Pure display-formatting helpers (no DOM access).
 */

const HEBREW_MONTHS = ['בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני', 'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'];

/** Left-pads a number to two digits ("7" → "07"). */
export function pad2(value) {
  return value.toString().padStart(2, '0');
}

/**
 * Hides most of a username ("PlayerOne" → "P******e"). Names already masked
 * upstream (containing "*") and very short names are returned unchanged.
 */
export function maskName(name) {
  if (!name) return '---';
  if (name.includes('*')) return name;
  if (name.length <= 2) return name;
  return name.charAt(0) + '******' + name.charAt(name.length - 1);
}

/**
 * Formats a unix timestamp (seconds) as a Hebrew date in local time,
 * e.g. "31 באוקטובר 2026 בשעה 23:59".
 */
export function formatDateHe(unixSec) {
  if (!unixSec) return '---';
  const d = new Date(unixSec * 1000);
  return `${d.getDate()} ${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()} בשעה ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Formats a wagered amount. The API sends pre-formatted strings
 * (e.g. "156,476"), which pass through unchanged; numbers are rounded
 * and grouped for the visitor's locale.
 */
export function formatWagered(value) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** Formats a prize amount, showing "0" when there is none. */
export function formatPrize(value) {
  return value ? value.toLocaleString() : '0';
}

/** Formats a donation count (subs / kicks), treating missing as 0. */
export function formatCount(value) {
  return (value || 0).toLocaleString();
}
