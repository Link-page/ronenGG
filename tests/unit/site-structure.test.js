// Guards the wiring between index.html, the JS modules and the data workflow,
// so moving or renaming a file can't silently break the published site.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { DATA_FILES, DEFAULT_AFFILIATE_SITE, DEFAULT_AVATAR } from '../../assets/js/config.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));

function listJs(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listJs(full) : full.endsWith('.js') ? [full] : [];
  });
}
const modules = listJs(join(ROOT, 'assets', 'js'));

test('every local asset referenced by index.html exists', () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((m) => m[1]);
  assert.ok(refs.length > 0);
  for (const ref of refs) assert.ok(existsSync(join(ROOT, ref)), `missing ${ref}`);
});

test('index.html loads main.js as an ES module and has no inline handlers', () => {
  assert.match(html, /<script type="module" src="assets\/js\/main\.js"><\/script>/);
  assert.doesNotMatch(html, /\son(click|input|change|load)=/);
});

test('every relative module import resolves to a file', () => {
  for (const file of modules) {
    for (const [, spec] of readFileSync(file, 'utf8').matchAll(/from '(\.[^']+)'/g)) {
      assert.ok(existsSync(resolve(dirname(file), spec)), `${file}: cannot resolve ${spec}`);
    }
  }
});

test('every element id looked up by the modules exists in index.html', () => {
  for (const file of modules) {
    for (const [, id] of readFileSync(file, 'utf8').matchAll(/getElementById\('([^'$`]+)'\)/g)) {
      assert.ok(ids.has(id), `${file}: #${id} not found in index.html`);
    }
  }
  for (const place of [1, 2, 3]) {
    for (const field of ['name', 'wagered', 'prize', 'img']) assert.ok(ids.has(`aff-user${place}-${field}`));
  }
});

test('data-attribute hooks used by the modules are present in the markup', () => {
  for (const view of ['home', 'bonuses', 'leaderboard']) {
    assert.ok(html.includes(`data-view="${view}"`) && ids.has(`view-${view}`), view);
  }
  for (const hook of ['data-promo-code="RONENGG"', 'data-site="empiredrop"', 'data-site="csdrop"',
    'data-spin="left"', 'data-spin="right"', 'data-action="open-a11y-statement"', 'data-action="close-a11y-statement"']) {
    assert.ok(html.includes(hook), hook);
  }
});

test('configured data files exist and are committed by the update workflow', () => {
  const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'update-leaderboard.yml'), 'utf8');
  assert.match(workflow, /git add leaderboard\.json subs\.json data\//);

  const paths = [DATA_FILES.liveStatus, DATA_FILES.kicksLeaderboard, DATA_FILES.subsLeaderboard,
    DATA_FILES.affiliateLeaderboard('empiredrop'), DATA_FILES.affiliateLeaderboard('csdrop')];
  for (const path of paths) {
    assert.ok(existsSync(join(ROOT, path)), `missing ${path}`);
    assert.ok(path.startsWith('data/') || ['leaderboard.json', 'subs.json'].includes(path), `${path} is not committed by the workflow`);
  }
  assert.ok(existsSync(join(ROOT, DATA_FILES.affiliateLeaderboard(DEFAULT_AFFILIATE_SITE))));
  assert.ok(existsSync(join(ROOT, DEFAULT_AVATAR)));
});
