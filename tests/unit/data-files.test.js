import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { fetchDataFile, withCacheBuster } from '../../assets/js/services/data-files.js';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(response) {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    return response;
  };
  return calls;
}

test('withCacheBuster appends a timestamp query string', () => {
  assert.equal(withCacheBuster('data/csdrop.json', 1700000000000), 'data/csdrop.json?t=1700000000000');
});

test('fetchDataFile requests a cache-busted URL and returns parsed JSON', async () => {
  const calls = stubFetch({ ok: true, json: async () => ({ is_live: true }) });
  assert.deepEqual(await fetchDataFile('data/kick_live.json'), { is_live: true });
  assert.match(calls[0], /^data\/kick_live\.json\?t=\d+$/);
});

test('fetchDataFile resolves to undefined for a non-2xx response', async () => {
  stubFetch({ ok: false, json: async () => assert.fail('body must not be parsed') });
  assert.equal(await fetchDataFile('leaderboard.json'), undefined);
});

test('fetchDataFile keeps a JSON null body distinguishable from a missing file', async () => {
  stubFetch({ ok: true, json: async () => null });
  assert.equal(await fetchDataFile('subs.json'), null);
});

test('fetchDataFile rejects on network errors', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch');
  };
  await assert.rejects(fetchDataFile('subs.json'), TypeError);
});
