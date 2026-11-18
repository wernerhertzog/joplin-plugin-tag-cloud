'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { loadCloudFromApi } = require('../src/cloud-data');

test('loads every page of tags and notes, and excludes unused tags', async () => {
  const tags = Array.from({ length: 102 }, (_, i) => ({ id: String(i), title: `tag ${i}` }));
  const data = { async get(path, query) {
    const entries = path.length === 1 ? tags : Array.from({ length: path[1] === '3' ? 135 : path[1] === '4' ? 0 : 1 }, (_, i) => ({ id: String(i) }));
    const start = (query.page - 1) * query.limit;
    return { items: entries.slice(start, start + query.limit), has_more: start + query.limit < entries.length };
  } };
  const cloud = await loadCloudFromApi(data);
  assert.equal(cloud.length, 101);
  assert.equal(cloud.find(tag => tag.id === '3').count, 135);
  assert.equal(cloud.some(tag => tag.id === '4'), false);
  assert.deepEqual(cloud.slice(0, 3).map(tag => tag.title), ['tag 0', 'tag 1', 'tag 2']);
});

test('propagates API errors instead of presenting partial counts', async () => {
  const data = { async get(path) {
    if (path.length === 1) return { items: [{ id: 'x', title: 'A' }], has_more: false };
    throw new Error('failed');
  } };
  await assert.rejects(loadCloudFromApi(data), /failed/);
});

test('panel renders tag names as text, sizes by frequency, and opens the selected tag', () => {
  const elements = {};
  function element() {
    return { children: [], style: {}, attrs: {}, handlers: {}, textContent: '', disabled: false,
      addEventListener(type, callback) { this.handlers[type] = callback; },
      appendChild(child) { this.children.push(child); },
      replaceChildren() { this.children = []; },
      setAttribute(name, value) { this.attrs[name] = value; } };
  }
  for (const id of ['cloud', 'status', 'refresh']) elements[id] = element();
  const sent = [];
  let handler;
  const context = { document: { getElementById: id => elements[id], createElement: element },
    webviewApi: { onMessage: fn => { handler = fn; }, postMessage: msg => { sent.push(msg); } } };
  vm.runInNewContext(fs.readFileSync('src/webview.js', 'utf8'), context);
  handler({ message: { type: 'cloud', tags: [ { id: '1', title: '<img>', count: 1 }, { id: '2', title: 'Anthropology', count: 35 }, { id: '3', title: 'Most frequent', count: 62 } ] } });
  const [first, second] = elements.cloud.children;
  assert.equal(first.textContent, '<img>');
  assert.equal(second.attrs['aria-label'], 'Anthropology: 35 notes');
  assert.ok(parseFloat(second.style.fontSize) >= 2.5 * parseFloat(first.style.fontSize), 'a tag used 35 times should be at least 2.5 times larger than one used once');
  second.handlers.click();
  assert.equal(sent.at(-1).type, 'openTag');
  assert.equal(sent.at(-1).id, '2');
});

test('reads sidebar counts from a read-only database connection and closes it', async () => {
  const { loadCloudFromDatabase } = require('../src/cloud-data');
  let closed = false;
  let openMode;
  let statement;
  class Database {
    constructor(path, mode, callback) {
      assert.equal(path, '/fixture/profile/database.sqlite');
      openMode = mode;
      queueMicrotask(() => callback(null));
    }
    all(sql, callback) {
      statement = sql;
      callback(null, [{ id: 'b', title: 'Beta', count: 3 }, { id: 'a', title: 'Alpha', count: 1 }]);
    }
    close(callback) { closed = true; callback(null); }
  }
  const api = { settings: { globalValue: async () => '/fixture/profile' }, require: () => ({ Database, OPEN_READONLY: 1 }) };
  const result = await loadCloudFromDatabase(api);
  assert.equal(openMode, 1);
  assert.match(statement, /tags_with_note_count/);
  assert.equal(closed, true);
  assert.deepEqual(result.map(x => x.title), ['Alpha', 'Beta']);
});
