/**
 * Output helpers for the Node scrapers. Paths are resolved from the
 * repository root, so the scripts behave the same from any working directory.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Writes `contents` (UTF-8) to a repo-relative path, e.g. "leaderboard.json".
 * @param {string} relativePath
 * @param {string} contents
 */
export function writeOutputFile(relativePath, contents) {
  writeFileSync(resolve(REPO_ROOT, relativePath), contents);
}
