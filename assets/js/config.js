/**
 * Site-wide configuration.
 *
 * All paths are relative to index.html (the document), not to this module.
 * The JSON files are committed every 15 minutes by the "Update All
 * Leaderboards" GitHub Action — keep these paths in sync with
 * .github/workflows/update-leaderboard.yml.
 */

export const DATA_FILES = {
  liveStatus: 'data/kick_live.json',
  kicksLeaderboard: 'leaderboard.json',
  subsLeaderboard: 'subs.json',
  /** @param {string} site e.g. "empiredrop" or "csdrop" */
  affiliateLeaderboard: (site) => `data/${site}.json`,
};

/** Placeholder avatar for leaderboard entries without an image. */
export const DEFAULT_AVATAR = 'assets/images/profile.webp';

/** How often the Kick live badge re-reads its status file. */
export const LIVE_STATUS_REFRESH_MS = 60000;

/** Wager leaderboard shown on first load and whenever the Codes view opens. */
export const DEFAULT_AFFILIATE_SITE = 'empiredrop';
