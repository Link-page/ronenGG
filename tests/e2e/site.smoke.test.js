// End-to-end smoke test: serves the repo like GitHub Pages and drives every
// feature in headless Chromium. Third-party hosts are blocked so the run is
// hermetic (Tailwind's CDN included — the JS behaviour doesn't depend on it).
//
// Run: npm run test:e2e   (needs `npx playwright install chromium` once;
// set CHROMIUM_PATH to use an already-installed Chromium/Chrome instead)
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.webp': 'image/webp', '.webm': 'video/webm', '.svg': 'image/svg+xml',
};
const readJson = async (path) => JSON.parse(await readFile(join(ROOT, path), 'utf8'));

let server;
let baseUrl;
let browser;
let page;
const pageErrors = [];

before(async () => {
  server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const file = join(ROOT, path.endsWith('/') ? `${path}index.html` : path);
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  baseUrl = `http://127.0.0.1:${server.address().port}/`;

  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseUrl });
  page = await context.newPage();
  await page.route('**/*', (route) => (route.request().url().startsWith(baseUrl) ? route.continue() : route.abort()));
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto(baseUrl);
  // The intro video plays first; the page is revealed when it ends (or fails).
  await page.waitForSelector('#main-page-content.visible', { timeout: 30000 });
});

after(async () => {
  await browser?.close();
  server?.close();
});

test('splash hands over to the home view with all link cards', async () => {
  await page.waitForFunction(() => getComputedStyle(document.getElementById('splash-screen')).display === 'none');
  assert.equal(await page.locator('#view-home.active .card').count(), 7);
  assert.equal(await page.isVisible('#spotlight'), true);
});

test('Kick live badge reflects data/kick_live.json', async () => {
  const { is_live: isLive } = await readJson('data/kick_live.json');
  const badge = page.locator('#kick-live-status');
  await assert.doesNotReject(badge.filter({ hasText: isLive ? 'Live Now' : 'Offline' }).waitFor());
  assert.match(await badge.getAttribute('class'), isLive ? /\bstatus-live\b/ : /\bstatus-offline\b/);
});

test('donators view lists the top subs and kicks', async () => {
  await page.click('.pill-btn[data-view="leaderboard"]');
  assert.equal(await page.isVisible('#view-leaderboard'), true);
  assert.equal(await page.getAttribute('.pill-btn[data-view="leaderboard"]', 'class'), 'pill-btn active');

  const kicks = (await readJson('leaderboard.json')).data.kicks_gifts_lifetime;
  const firstRow = page.locator('#all-time-kicks-list .lb-row').first();
  await firstRow.waitFor({ state: 'attached' });
  assert.equal(await page.locator('#all-time-kicks-list .lb-row').count(), Math.min(kicks.length, 10));
  assert.equal((await firstRow.locator('span').nth(1).textContent()).trim(), kicks[0].username);

  for (const list of ['#all-time-subs-list', '#weekly-subs-list', '#weekly-kicks-list']) {
    assert.doesNotMatch(await page.textContent(list), /Waiting for backend setup/, list);
  }
});

test('spin arrows flip the donator cards', async () => {
  await page.click('[data-spin="right"]');
  assert.equal(await page.getAttribute('#weekly-flipper', 'style'), 'transform: rotateY(180deg);');
  await page.click('[data-spin="left"]');
  await page.click('[data-spin="left"]');
  assert.equal(await page.getAttribute('#all-time-flipper', 'style'), 'transform: rotateY(-180deg);');
});

test('codes view renders the EmpireDrop leaderboard and switches to CSDrop', async () => {
  await page.click('.pill-btn[data-view="bonuses"]');
  const empire = await readJson('data/empiredrop.json');
  await page.locator('#aff-lb-main-title', { hasText: '€ 10,000 EMPIREDROP LEADERBOARD' }).waitFor();
  assert.equal(await page.textContent('#aff-user1-wagered'), empire.leaderboard[0].wagered);
  assert.equal(await page.locator('#aff-table-body tr').count(), Math.min(Math.max(empire.leaderboard.length - 3, 0), 7));
  assert.match(await page.textContent('#aff-ends-on'), /^Ends on: \d+ \S+ \d{4} בשעה \d\d:\d\d$/);
  assert.match(await page.textContent('#aff-days'), /^\d{2,}$/);

  await page.click('.aff-tab[data-site="csdrop"]');
  await page.locator('#aff-lb-main-title', { hasText: 'CSDROP LEADERBOARD' }).waitFor();
  assert.match(await page.getAttribute('.aff-tab[data-site="csdrop"]', 'class'), /\bactive\b/);
  assert.doesNotMatch(await page.getAttribute('.aff-tab[data-site="empiredrop"]', 'class'), /\bactive\b/);
  assert.equal(await page.locator('.aff-symbol .text-yellow-400').count(), 6);
});

test('promo box copies the code and shows a confirmation', async () => {
  const box = page.locator('[data-promo-code]').first();
  await box.click();
  await box.filter({ hasText: 'COPIED! ✓' }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'RONENGG');
  await box.filter({ hasText: 'RONENGG' }).waitFor({ timeout: 4000 });
});

test('leaderboard data cannot inject markup into the page', async () => {
  const entry = (username, img = '') => ({ rank: 1, username, wagered: '1', prize: 1, img });
  const hostile = {
    start_date: 1790000000,
    end_date: 1890000000,
    leaderboard: [entry('A***a'), entry('B***b'), entry('C***c'), entry('<b id="pwned">x*</b>', 'x" id="pwned-img')],
  };
  const serveHostile = (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(hostile) });
  await page.route('**/data/empiredrop.json*', serveHostile);
  try {
    await page.click('.aff-tab[data-site="csdrop"]');
    await page.click('.aff-tab[data-site="empiredrop"]');
    await page.locator('#aff-table-body tr').first().waitFor();
    await page.waitForFunction(() => document.querySelector('#aff-table-body').textContent.includes('x*'));
    assert.equal(await page.locator('#pwned, #pwned-img').count(), 0);
    assert.ok((await page.textContent('#aff-table-body')).includes('<b id="pwned">x*</b>'));
    assert.equal(await page.getAttribute('#aff-table-body img', 'src'), 'x" id="pwned-img');
  } finally {
    await page.unroute('**/data/empiredrop.json*', serveHostile);
  }
});

test('accessibility menu adjusts text size and toggles modes', async () => {
  await page.click('#a11y-toggle');
  assert.equal(await page.isVisible('#a11y-menu'), true);

  await page.fill('#fontSizeSlider', '130');
  assert.equal(await page.evaluate(() => document.documentElement.style.fontSize), '130%');
  assert.equal(await page.textContent('#fontSizeVal'), '130%');
  await page.fill('#wordSpacingSlider', '2.5');
  assert.equal(await page.evaluate(() => document.body.style.letterSpacing), '2.5px');

  await page.click('#btn-high-contrast');
  assert.equal(await page.evaluate(() => document.body.classList.contains('a11y-high-contrast')), true);
  assert.equal(await page.textContent('#btn-high-contrast .status-indicator'), 'ON');

  await page.click('#btn-pause-animations');
  assert.equal(await page.evaluate(() => document.body.classList.contains('a11y-no-animations')), true);
  assert.equal(await page.evaluate(() => document.getElementById('watermark-bg').paused), true);
  await page.click('#btn-pause-animations');
  assert.equal(await page.textContent('#btn-pause-animations .status-indicator'), 'OFF');

  await page.click('#btn-tts');
  assert.equal(await page.textContent('#btn-tts .status-indicator'), 'ON');
  await page.hover('h1');
  await page.locator('h1[data-tts-hovered="true"]').waitFor();
  await page.click('#btn-tts');

  await page.click('#a11y-toggle');
  assert.equal(await page.isVisible('#a11y-menu'), false);
});

// The modal is shown/hidden with Tailwind utilities (hidden/flex/opacity-0),
// which are inert here because the CDN is blocked — so assert the classes.
test('accessibility statement opens and closes', async () => {
  const modalClasses = () => page.evaluate(() => [...document.getElementById('a11y-modal').classList]);

  await page.click('[data-action="open-a11y-statement"]');
  await page.waitForFunction(() => !document.getElementById('a11y-modal').classList.contains('opacity-0'));
  let classes = await modalClasses();
  assert.ok(classes.includes('flex') && !classes.includes('hidden'));
  assert.match(await page.getAttribute('#a11y-modal > div', 'class'), /\bscale-100\b/);

  await page.click('#a11y-modal button[data-action="close-a11y-statement"] >> nth=1');
  await page.waitForFunction(() => document.getElementById('a11y-modal').classList.contains('hidden'));
  classes = await modalClasses();
  assert.ok(classes.includes('opacity-0') && !classes.includes('flex'));

  // A click on the backdrop (outside the dialog) also closes it.
  await page.click('[data-action="open-a11y-statement"]');
  await page.waitForFunction(() => !document.getElementById('a11y-modal').classList.contains('opacity-0'));
  await page.evaluate(() => document.getElementById('a11y-modal').click());
  await page.waitForFunction(() => document.getElementById('a11y-modal').classList.contains('hidden'));
});

test('no uncaught errors were thrown', () => {
  assert.deepEqual(pageErrors, []);
});
