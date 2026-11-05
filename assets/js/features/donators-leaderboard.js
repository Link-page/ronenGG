import { DATA_FILES } from '../config.js';
import { fetchDataFile } from '../services/data-files.js';
import { formatCount } from '../utils/format.js';
import { escapeHtml } from '../utils/html.js';

const TOP_N = 10;
const EMPTY_HTML = '<div class="text-center py-8 text-white/40 text-sm font-bold">No data found...</div>';

const topEntries = (list) => (list || []).slice(0, TOP_N);

/**
 * Builds one donators leaderboard row; the #1 amount is highlighted orange.
 * Values come from Kick's API, so they are HTML-escaped.
 * @param {{username?: string, quantity?: number}} entry
 * @param {number} rank 1-based position
 * @returns {string} HTML
 */
export function leaderboardRowHtml(entry, rank) {
  const amountClass = rank === 1 ? 'text-[#ff8c00]' : 'text-white/70';
  return `
    <div class="lb-row">
      <span class="w-12 text-center font-black text-white/40">${rank}</span>
      <span class="flex-1 text-center font-bold text-white/90">${escapeHtml(entry.username || 'Unknown')}</span>
      <span class="w-20 text-center font-black ${amountClass}">${escapeHtml(formatCount(entry.quantity))}</span>
    </div>
  `;
}

function renderLeaderboard(entries, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!entries || entries.length === 0) {
    container.innerHTML = EMPTY_HTML;
    return;
  }
  entries.forEach((entry, i) => {
    container.insertAdjacentHTML('beforeend', leaderboardRowHtml(entry, i + 1));
  });
}

/**
 * Fills the four donator lists: Kicks from leaderboard.json and Subs from
 * subs.json (both written by the GitHub Action). Each file is loaded
 * independently, so one failing does not block the other.
 */
export async function loadDonatorLeaderboards() {
  try {
    const kicks = await fetchDataFile(DATA_FILES.kicksLeaderboard);
    if (kicks && kicks.data) {
      renderLeaderboard(topEntries(kicks.data.kicks_gifts_lifetime), 'all-time-kicks-list');
      renderLeaderboard(topEntries(kicks.data.kicks_gifts_week), 'weekly-kicks-list');
    }
  } catch (e) {
    console.error('Error loading kicks:', e);
  }

  try {
    const subs = await fetchDataFile(DATA_FILES.subsLeaderboard);
    if (subs) {
      renderLeaderboard(topEntries(subs.gifts), 'all-time-subs-list');
      renderLeaderboard(topEntries(subs.gifts_week), 'weekly-subs-list');
    }
  } catch (e) {
    console.error('Error loading subs:', e);
  }
}
