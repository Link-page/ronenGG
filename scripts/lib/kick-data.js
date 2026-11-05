/**
 * Sanity checks for Kick API responses, so a Cloudflare challenge page or
 * an error payload never overwrites the last good data file.
 */

/**
 * Throws unless `text` is the subs leaderboard JSON the DONATORS view
 * reads (an object with a `gifts` array).
 * @param {string} text raw response body
 */
export function assertSubsLeaderboard(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Response is not JSON (starts with ${JSON.stringify(text.slice(0, 60))})`);
  }
  if (!data || !Array.isArray(data.gifts)) {
    throw new Error('Response JSON has no "gifts" array');
  }
}
