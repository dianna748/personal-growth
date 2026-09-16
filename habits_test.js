const assert = require('node:assert/strict');
const H = require('./js/habits.js')._test;
class Storage {
  constructor() { this.data = {}; }
  get length() { return Object.keys(this.data).length; }
  key(i) { return Object.keys(this.data)[i]; }
  getItem(k) { return this.data[k] ?? null; }
  setItem(k, v) { this.data[k] = String(v); }
}
const s = new Storage();
s.setItem('bloom_todos_v2', '[{"id":1,"text":"历史任务","date":"2026-09-15"}]');
const original = s.getItem('bloom_todos_v2');
assert.equal(H.definitions(s).length, 0);
const h = H.create('每天运动', '20 分钟', s, '2026-09-16');
assert.equal(H.definitions(s).length, 1);
assert.throws(() => H.create('每天运动', '', s), /同名/);
assert.equal(H.done(h, '2026-09-16', s), false);
H.check(h, '2026-09-16', true, s, '2026-09-16');
assert.equal(H.done(h, '2026-09-16', s), true);
assert.equal(H.done(h, '2026-09-17', s), false);
assert.equal(H.streak(h, '2026-09-17', s), 1);
H.check(h, '2026-09-17', true, s, '2026-09-17');
assert.equal(H.streak(h, '2026-09-17', s), 2);
H.check(h, '2026-09-17', false, s, '2026-09-17');
assert.equal(JSON.parse(s.getItem(H.DAY + h.id + '_2026-09-17')).done, false);
assert.throws(() => H.check(h, '2026-09-18', true, s, '2026-09-17'));
assert.throws(() => H.check(h, '2026-09-15', true, s, '2026-09-17'));
let archived = H.archive(h, true, s, '2026-09-17');
assert.equal(H.active(archived, '2026-09-16'), true);
assert.equal(H.active(archived, '2026-09-18'), false);
let resumed = H.archive(archived, false, s, '2026-09-20');
assert.equal(H.active(resumed, '2026-09-18'), false);
assert.equal(H.active(resumed, '2026-09-20'), true);
assert.equal(H.done(resumed, '2026-09-16', s), true);
assert.equal(H.shift('2024-03-01', -1), '2024-02-29');
assert.equal(H.shift('2026-01-01', -1), '2025-12-31');
assert.equal(s.getItem('bloom_todos_v2'), original);
const Backup = require('./js/backup.js');
const payload = Backup.buildPayload(s);
assert(Object.keys(payload.data).some(k => k.startsWith(H.DEF)));
assert(Object.keys(payload.data).some(k => k.startsWith(H.DAY)));
const restored = new Storage();
Backup.restore(payload, 'merge', restored);
assert.equal(H.done(resumed, '2026-09-16', restored), true);
assert.equal(H.done(resumed, '2026-09-17', restored), false);
assert.equal(H.definitions(restored)[0].periods.length, 2);
s.setItem(H.DEF + 'broken', 'invalid');
assert.throws(() => H.definitions(s));
assert.equal(s.getItem('bloom_todos_v2'), original);
console.log('PASS daily check-in, undo, local dates, streak, archive/resume, no task mutations, malformed data safety');
