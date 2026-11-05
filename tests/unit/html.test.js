import assert from 'node:assert/strict';
import { test } from 'node:test';
import { escapeHtml } from '../../assets/js/utils/html.js';

test('escapeHtml escapes the five HTML-significant characters', () => {
  assert.equal(escapeHtml(`<a href="x" title='y'>&</a>`), '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
});

test('escapeHtml leaves ordinary values unchanged', () => {
  assert.equal(escapeHtml('RB6666'), 'RB6666');
  assert.equal(escapeHtml('J*****d'), 'J*****d');
  assert.equal(escapeHtml('156,476'), '156,476');
  assert.equal(escapeHtml('https://cdn.csdrop.com/avatars/default_5.webp'), 'https://cdn.csdrop.com/avatars/default_5.webp');
});

test('escapeHtml stringifies non-string values', () => {
  assert.equal(escapeHtml(3000), '3000');
  assert.equal(escapeHtml(undefined), 'undefined');
});
