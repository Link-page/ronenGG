/**
 * Saves the channel's gifted-subs leaderboards to subs.json, which feeds the
 * "Top Subs" cards in the DONATORS view. A valid response body is written
 * verbatim (not re-formatted); anything else leaves the previous file alone.
 *
 * Scrape errors are logged without failing the workflow, so the other data
 * sources still get committed.
 * Usage: node scripts/fetch-subs-leaderboard.js
 */
import puppeteer from 'puppeteer';
import { launchBrowser, readPageText } from './lib/browser.js';
import { assertSubsLeaderboard } from './lib/kick-data.js';
import { writeOutputFile } from './lib/output.js';

const LEADERBOARDS_URL = 'https://kick.com/api/v2/channels/ronengg/leaderboards';
const OUTPUT_FILE = 'subs.json';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const browser = await launchBrowser(puppeteer);
const page = await browser.newPage();
await page.setUserAgent(USER_AGENT);

try {
  console.log('Starting sub_scraper...');
  const subsData = await readPageText(page, LEADERBOARDS_URL);
  assertSubsLeaderboard(subsData);
  writeOutputFile(OUTPUT_FILE, subsData);
  console.log('subs.json updated successfully!');
} catch (error) {
  console.error('Error scraping subs:', error);
} finally {
  await browser.close();
}
