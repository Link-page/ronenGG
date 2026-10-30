import { DATA_FILES, LIVE_STATUS_REFRESH_MS } from '../config.js';
import { fetchDataFile } from '../services/data-files.js';

/** Switches the Kick card's badge between "Live Now" and "Offline". */
function renderLiveStatus(badge, isLive) {
  badge.classList.remove('status-live', 'status-offline');
  badge.classList.add(isLive ? 'status-live' : 'status-offline');
  badge.querySelector('.status-text').textContent = isLive ? 'Live Now' : 'Offline';
}

/**
 * Reads data/kick_live.json (written by the GitHub Action via Kick's
 * official API) and updates the badge. A missing file counts as offline;
 * network/parse errors are logged and leave the badge unchanged.
 */
async function refreshLiveStatus() {
  try {
    const status = await fetchDataFile(DATA_FILES.liveStatus);
    const badge = document.getElementById('kick-live-status');
    renderLiveStatus(badge, status !== undefined && Boolean(status.is_live));
  } catch (e) {
    console.error('Local Live Status Error', e);
  }
}

/** Checks the live status now and then once a minute. */
export function startLiveStatusPolling() {
  refreshLiveStatus();
  setInterval(refreshLiveStatus, LIVE_STATUS_REFRESH_MS);
}
