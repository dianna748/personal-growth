const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('./js/sync.js'), 'utf8');
const TODO = 'bloom_todos_v2';
const DELETIONS = 'bloom_todo_tombstones_v1';
const OUTBOX = '__bloom_sync_outbox_v1';
const cfg = { url: 'https://example.invalid', anonKey: 'test', syncCode: 'TEST', enabled: true };
const stamp = '2026-09-07T00:00:00.000Z';
const deleted = { root: stamp, directChinese: stamp };
const survivors = [
  { id: 'chinese', text: '保留中文任务', parentRollover: 'root', rolledOver: true },
  { id: 'sameTitle', text: 'Review quarterly report', taskChainId: 'sameTitle' },
  { id: 'otherEnglish', text: 'A real English task', rolledOver: true, parentRollover: 'unrelated' }
];
const stale = [
  { id: 'nested', text: 'Review quarterly report', rolloverFromId: 'child', rolledOver: true },
  { id: 'child', text: 'Review quarterly report', taskChainId: 'root', rolledOver: true },
  { id: 'parentLink', text: 'Standup meeting', parentRollover: 'root' },
  { id: 'directChinese', text: '已明确删除的任务' },
  ...survivors
];

function fixture(initial, rows = []) {
  class StorageMock {
    constructor() { this.data = { ...initial }; }
    get length() { return Object.keys(this.data).length; }
    key(index) { return Object.keys(this.data)[index] || null; }
    getItem(key) { return Object.hasOwn(this.data, key) ? this.data[key] : null; }
    setItem(key, value) { this.data[key] = String(value); }
  }
  const localStorage = new StorageMock();
  const posted = [];
  const ctx = vm.createContext({
    Storage: StorageMock, localStorage, window: {}, module: { exports: {} },
    setTimeout, clearTimeout,
    fetch: async (url, opt) => {
      if (opt.method === 'POST') posted.push(...JSON.parse(opt.body));
      return { ok: true, json: async () => rows };
    }
  });
  vm.runInContext(source, ctx);
  const sync = ctx.module.exports;
  sync.saveConfig(cfg);
  return { sync, localStorage, posted };
}

function taskIds(raw) { return JSON.parse(raw).map(task => task.id); }

(async () => {
  const unit = fixture({});
  assert.deepEqual(taskIds(unit.sync._test.filterTodosRaw(JSON.stringify(stale), JSON.stringify(deleted))),
    survivors.map(task => task.id), 'missing roots and reverse-order nested copies must be deleted without touching unrelated English or Chinese tasks');

  // Both startup and later manual sync run flush before pull. No stale outbox
  // record may leave this device before its already-known deletions apply.
  for (const stored of [stale, survivors, null]) {
    const initial = {
      [DELETIONS]: JSON.stringify(deleted),
      [OUTBOX]: JSON.stringify({
        [TODO]: { value: JSON.stringify(stale), ts: Date.parse(stamp) },
        [DELETIONS]: { value: JSON.stringify({ oldLocal: stamp }), ts: Date.parse(stamp) }
      })
    };
    if (stored !== null) initial[TODO] = JSON.stringify(stored);
    const boot = fixture(initial);
    await new Promise(resolve => boot.sync.init(resolve));
    const writes = boot.posted.filter(row => row.key.endsWith('|' + TODO));
    assert.ok(writes.length, 'startup must flush its existing outbox');
    for (const row of writes) assert.deepEqual(taskIds(row.value), survivors.map(task => task.id));
    if (stored !== null) assert.deepEqual(taskIds(boot.localStorage.getItem(TODO)), survivors.map(task => task.id));
    assert.ok(JSON.parse(boot.localStorage.getItem(DELETIONS)).oldLocal, 'queued deletion IDs must also survive');

    boot.localStorage.setItem(TODO, JSON.stringify(stale));
    await boot.sync.manualSync();
    assert.deepEqual(taskIds(boot.localStorage.getItem(TODO)), survivors.map(task => task.id));
    for (const row of boot.posted.filter(row => row.key.endsWith('|' + TODO))) {
      assert.deepEqual(taskIds(row.value), survivors.map(task => task.id), 'manual sync must not post reintroduced copies');
    }
  }

  // Cloud tombstones must win by membership, not by the row's LWW timestamp.
  // Return tasks first to also cover arbitrary Supabase row order.
  for (const localTs of [Date.parse(stamp), Date.parse(stamp) + 86400000]) {
    const pull = fixture({
      [TODO]: JSON.stringify(stale),
      ['__ts__' + TODO]: String(localTs),
      [DELETIONS]: JSON.stringify({ localOnly: stamp }),
      ['__ts__' + DELETIONS]: String(localTs)
    }, [
      { key: 's_TEST|' + TODO, value: JSON.stringify(stale), updated_at: stamp },
      { key: 's_TEST|' + DELETIONS, value: JSON.stringify(deleted), updated_at: stamp }
    ]);
    await pull.sync.manualSync();
    assert.deepEqual(taskIds(pull.localStorage.getItem(TODO)), survivors.map(task => task.id));
    const marks = JSON.parse(pull.localStorage.getItem(DELETIONS));
    assert.ok(marks.root && marks.localOnly && marks.directChinese, 'older/equal cloud deletions must union with local IDs');
    const sentMarks = pull.posted.filter(row => row.key.endsWith('|' + DELETIONS)).pop();
    assert.ok(JSON.parse(sentMarks.value).root && JSON.parse(sentMarks.value).localOnly);
  }
  console.log('deleted English rollover chains, stale outbox, and monotonic tombstones | ALL ASSERTIONS PASSED');
})().catch(error => { console.error(error); process.exitCode = 1; });
