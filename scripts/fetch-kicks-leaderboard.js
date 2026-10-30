/**
 * Saves the channel's Kicks (gift) leaderboard to leaderboard.json, which
 * feeds the "Top Kicks" cards in the DONATORS view.
 *
 * Exits with code 1 on failure so the workflow stops before committing.
 * Usage: node scripts/fetch-kicks-leaderboard.js
 */
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { launchBrowser, readPageText } from './lib/browser.js';
import { writeOutputFile } from './lib/output.js';

const LEADERBOARD_URL = 'https://web.kick.com/api/v1/kicks/4865495/leaderboard';
const OUTPUT_FILE = 'leaderboard.json';

// Stealth mode masks headless-browser fingerprints so Cloudflare doesn't flag us as a bot.
puppeteer.use(StealthPlugin());

async function updateKicksLeaderboard() {
  console.log('Starting stealth browser to bypass Cloudflare...');
  const browser = await launchBrowser(puppeteer);

  try {
    const page = await browser.newPage();
    console.log('Navigating to Kick API...');
    const data = JSON.parse(await readPageText(page, LEADERBOARD_URL));

    if (data.error) {
      throw new Error('Blocked by Cloudflare even with stealth mode.');
    }

    writeOutputFile(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log('Success: leaderboard.json saved successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

await updateKicksLeaderboard();
