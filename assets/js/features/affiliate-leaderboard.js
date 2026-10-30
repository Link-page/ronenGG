import { DATA_FILES, DEFAULT_AVATAR } from '../config.js';
import { fetchDataFile } from '../services/data-files.js';
import { EXPIRED_COUNTDOWN, splitDuration } from '../utils/countdown.js';
import { formatDateHe, formatPrize, formatWagered, maskName } from '../utils/format.js';

const PODIUM_PLACES = 3;
const LAST_TABLE_PLACE = 10;
const PRIZE_POOL_LABEL = '10,000';
const COIN_SYMBOL_HTML = '<span class="text-yellow-400">🪙</span>';

let countdownTimer;

/** EmpireDrop pays out in euros; other sites use their coin currency. */
export function currencySymbol(site) {
  return site === 'empiredrop' ? '€' : COIN_SYMBOL_HTML;
}

/**
 * Builds one table row (places 4–10).
 * @param {{username?: string, wagered: string|number, prize?: number, img?: string}} entry
 * @param {number} place 1-based leaderboard position
 * @param {string} symbol currency symbol HTML
 * @returns {string} HTML
 */
export function tableRowHtml(entry, place, symbol) {
  return `
    <tr>
      <td>${place}.</td>
      <td>
        <div class="aff-user-cell">
          <img src="${entry.img || DEFAULT_AVATAR}" alt="user">
          <span>${maskName(entry.username)}</span>
        </div>
      </td>
      <td><div class="aff-val-cell">${symbol}<span>${formatWagered(entry.wagered)}</span></div></td>
      <td><div class="aff-val-cell text-green-aff">${symbol}<span>${formatPrize(entry.prize)}</span></div></td>
    </tr>
  `;
}

function selectTab(tab) {
  document.querySelectorAll('.aff-tab').forEach((t) => t.classList.remove('active'));
  tab.classList.add('active');
}

function renderHeader(site, symbol) {
  document.getElementById('aff-lb-main-title').innerHTML = `${symbol} ${PRIZE_POOL_LABEL} ${site.toUpperCase()} LEADERBOARD`;
  document.querySelectorAll('.aff-symbol').forEach((el) => {
    el.innerHTML = symbol;
  });
}

function renderPodium(leaderboard) {
  for (let place = 1; place <= PODIUM_PLACES; place++) {
    const entry = leaderboard[place - 1];
    if (!entry) continue;
    document.getElementById(`aff-user${place}-name`).textContent = maskName(entry.username);
    document.getElementById(`aff-user${place}-wagered`).textContent = formatWagered(entry.wagered);
    document.getElementById(`aff-user${place}-prize`).textContent = formatPrize(entry.prize);
    if (entry.img) {
      document.getElementById(`aff-user${place}-img`).src = entry.img;
    }
  }
}

function renderTable(leaderboard, symbol) {
  const tbody = document.getElementById('aff-table-body');
  tbody.innerHTML = '';
  leaderboard.slice(PODIUM_PLACES, LAST_TABLE_PLACE).forEach((entry, i) => {
    tbody.insertAdjacentHTML('beforeend', tableRowHtml(entry, PODIUM_PLACES + 1 + i, symbol));
  });
}

function renderDates(endDateSec) {
  document.getElementById('aff-ends-on').textContent = `Ends on: ${formatDateHe(endDateSec)}`;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('aff-last-updated').textContent = `Last Updated: ${now}`;
}

function renderCountdown({ days, hours, minutes, seconds }) {
  document.getElementById('aff-days').textContent = days;
  document.getElementById('aff-hours').textContent = hours;
  document.getElementById('aff-minutes').textContent = minutes;
  document.getElementById('aff-seconds').textContent = seconds;
}

/** (Re)starts the "ENDING IN" countdown, replacing any previous one. */
function startCountdown(endDateSec) {
  if (countdownTimer) clearInterval(countdownTimer);

  const tick = () => {
    const remainingMs = endDateSec * 1000 - Date.now();
    if (remainingMs < 0) {
      clearInterval(countdownTimer);
      renderCountdown(EXPIRED_COUNTDOWN);
      return;
    }
    renderCountdown(splitDuration(remainingMs));
  };

  tick();
  countdownTimer = setInterval(tick, 1000);
}

function renderError(site) {
  document.getElementById('aff-lb-main-title').innerHTML =
    `${site.toUpperCase()} ERROR <br><small class="text-sm text-red-500">(Could not read ${DATA_FILES.affiliateLeaderboard(site)})</small>`;
}

/**
 * Loads data/<site>.json and renders the whole widget: title, podium,
 * table, end date and countdown.
 * @param {string} site e.g. "empiredrop" or "csdrop"
 * @param {Element|null} [tab] tab element to mark active (omitted on programmatic loads)
 */
export async function loadAffiliateLeaderboard(site, tab = null) {
  if (tab) selectTab(tab);

  try {
    const data = await fetchDataFile(DATA_FILES.affiliateLeaderboard(site));
    if (data === undefined) throw new Error('Local JSON file not found');

    const symbol = currencySymbol(site);
    renderHeader(site, symbol);
    renderPodium(data.leaderboard);
    renderTable(data.leaderboard, symbol);
    renderDates(data.end_date);
    startCountdown(data.end_date);
  } catch (err) {
    console.error(err);
    renderError(site);
  }
}

/** Wires the EmpireDrop / CSDrop `.aff-tab[data-site]` switcher. */
export function initAffiliateTabs() {
  document.querySelectorAll('.aff-tab[data-site]').forEach((tab) => {
    tab.addEventListener('click', () => loadAffiliateLeaderboard(tab.dataset.site, tab));
  });
}
