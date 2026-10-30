/**
 * Loader for the JSON data files the GitHub Action commits to the repo.
 */

/**
 * Appends a timestamp query string so neither the browser nor the GitHub
 * Pages CDN serves a stale copy of a file that changes every few minutes.
 * @param {string} path
 * @param {number} [now]
 */
export function withCacheBuster(path, now = Date.now()) {
  return `${path}?t=${now}`;
}

/**
 * Fetches and parses a data file.
 *
 * Resolves to the parsed JSON, or to `undefined` when the server responds
 * with a non-2xx status (e.g. the file does not exist yet). Network and
 * JSON parse errors reject, so callers decide how to report them.
 * @param {string} path
 */
export async function fetchDataFile(path) {
  const res = await fetch(withCacheBuster(path));
  if (!res.ok) return undefined;
  return res.json();
}
