import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_AVATAR } from '../../assets/js/config.js';
import { currencySymbol, tableRowHtml } from '../../assets/js/features/affiliate-leaderboard.js';
import { leaderboardRowHtml } from '../../assets/js/features/donators-leaderboard.js';

const squash = (html) => html.replace(/\s+/g, ' ').trim();

test('donator row shows rank, username and formatted amount', () => {
  const html = squash(leaderboardRowHtml({ username: 'RB6666', quantity: 218500 }, 2));
  assert.match(html, /<span class="w-12 text-center font-black text-white\/40">2<\/span>/);
  assert.match(html, /<span class="flex-1 text-center font-bold text-white\/90">RB6666<\/span>/);
  assert.ok(html.includes(`text-white/70">${(218500).toLocaleString()}</span>`));
});

test('donator row highlights the #1 amount in orange', () => {
  assert.ok(leaderboardRowHtml({ username: 'a', quantity: 1 }, 1).includes('text-[#ff8c00]'));
  assert.ok(!leaderboardRowHtml({ username: 'a', quantity: 1 }, 2).includes('text-[#ff8c00]'));
});

test('donator row falls back to "Unknown" and 0', () => {
  const html = squash(leaderboardRowHtml({}, 5));
  assert.ok(html.includes('>Unknown</span>'));
  assert.ok(html.includes('text-white/70">0</span>'));
});

test('currencySymbol: euros for EmpireDrop, coins otherwise', () => {
  assert.equal(currencySymbol('empiredrop'), '€');
  assert.equal(currencySymbol('csdrop'), '<span class="text-yellow-400">🪙</span>');
});

test('affiliate table row renders place, masked user, wagered and prize', () => {
  const entry = { rank: 4, username: 'T*******L', wagered: '29,335', prize: 1000, img: 'https://cdn.example/a.webp' };
  const html = squash(tableRowHtml(entry, 4, '€'));
  assert.ok(html.startsWith('<tr> <td>4.</td>'));
  assert.ok(html.includes('<img src="https://cdn.example/a.webp" alt="user"> <span>T*******L</span>'));
  assert.ok(html.includes('<div class="aff-val-cell">€<span>29,335</span></div>'));
  assert.ok(html.includes(`<div class="aff-val-cell text-green-aff">€<span>${(1000).toLocaleString()}</span></div>`));
});

test('affiliate table row uses the default avatar and a "0" prize when missing', () => {
  const html = tableRowHtml({ username: 'PlayerOne', wagered: '10' }, 9, '€');
  assert.ok(html.includes(`<img src="${DEFAULT_AVATAR}"`));
  assert.ok(html.includes('<span>P******e</span>'));
  assert.ok(html.includes('text-green-aff">€<span>0</span>'));
});
