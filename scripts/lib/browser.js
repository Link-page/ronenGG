/**
 * Shared Puppeteer helpers for the Kick scrapers.
 *
 * Kick's API endpoints sit behind Cloudflare, which rejects plain HTTP
 * clients, so the scrapers open the JSON endpoint in a headless browser and
 * read the response body as page text.
 */

const LAUNCH_OPTIONS = {
  headless: 'new',
  // Chrome's sandbox cannot start on GitHub-hosted Ubuntu runners.
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

/**
 * Launches a headless browser using the given Puppeteer flavour
 * (`puppeteer` or `puppeteer-extra` with plugins applied).
 */
export function launchBrowser(puppeteer) {
  return puppeteer.launch(LAUNCH_OPTIONS);
}

/**
 * Opens `url`, waits until the network is idle (i.e. Cloudflare's checks
 * have finished) and returns the page's text — for a JSON endpoint, the raw
 * JSON string.
 * @param {import('puppeteer').Page} page
 * @param {string} url
 */
export async function readPageText(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2' });
  return page.evaluate(() => document.body.innerText);
}
