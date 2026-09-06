/* ============================================
   Bloom · Multi-device Sync (Supabase PostgREST)
   零依赖：直接走 Supabase REST，不引任何 SDK / CDN
   自配置：URL / anon key / 同步码 在页面「同步」面板里填写
   策略：云端权威 + 时间戳合并（last-write-wins，双离线也安全）
   ============================================ */
const Sync = (function () {
  'use strict';

  var CFG_KEY = 'bloom_sync_config';
  var TODO_KEY = 'bloom_todos_v2';
  var TOMBSTONE_KEY = 'bloom_todo_tombstones_v1';
  var DEMO_CLEANUP_KEY = 'bloom_demo_cleanup_v1';
  var DEMO_QUARANTINE_KEY = '__bloom_demo_quarantine_v1';
  var TABLE = 'kv_store';
  var FETCH_TIMEOUT = 6000;
  var PUSH_DEBOUNCE = 700;
  var TS_PREFIX = '__ts__';
  var OUTBOX_KEY = '__bloom_sync_outbox_v1';
  var RECOVERY_KEY = '__bloom_sync_recovery_v1';

  var cfg = null;            // {url, anonKey, syncCode, enabled}
  var status = 'off';        // off | idle | syncing | offline | error
  var statusCbs = [];
  var pushTimer = null;
  var pushQueue = {};        // origKey -> {value, ts}
  var _origSetItem = Storage.prototype.setItem;
  var intercepting = false;  // true while writing local from cloud (avoid loop)
  var suppress = false;     // true while writing local seed data (don't push it)

  function prefKey(k) { return 's_' + (cfg ? cfg.syncCode : '') + '|' + k; }
  function unprefKey(pk) { var i = pk.indexOf('|'); return i < 0 ? pk : pk.slice(i + 1); }
  function tsKey(k) { return TS_PREFIX + k; }

  function isSyncableKey(key) {
    return typeof key === 'string' && key.indexOf('bloom_') === 0 && key !== CFG_KEY;
  }

  function persistOutbox() {
    try { _origSetItem.call(localStorage, OUTBOX_KEY, JSON.stringify(pushQueue)); } catch (e) {}
  }

  function loadOutbox() {
    try {
      var saved = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '{}');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) pushQueue = saved;
    } catch (e) { pushQueue = {}; }
  }

  function rememberConflict(key, localValue, cloudValue, localTs, cloudTs) {
    if (localValue === cloudValue) return;
    try {
      var entries = JSON.parse(localStorage.getItem(RECOVERY_KEY) || '[]');
      if (!Array.isArray(entries)) entries = [];
      entries.unshift({ key: key, savedAt: new Date().toISOString(), localTs: localTs || 0,
        cloudTs: cloudTs || 0, localValue: localValue, cloudValue: cloudValue });
      if (entries.length > 5) entries.length = 5;
      _origSetItem.call(localStorage, RECOVERY_KEY, JSON.stringify(entries));
    } catch (e) {}
  }

  function parseTombstones(raw) {
    try {
      var value = JSON.parse(raw || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (e) { return {}; }
  }

  function mergeTombstones(cloudRaw, localRaw) {
    var cloud = parseTombstones(cloudRaw), local = parseTombstones(localRaw), merged = {};
    var ids = {};
    Object.keys(cloud).forEach(function (id) { ids[id] = true; });
    Object.keys(local).forEach(function (id) { ids[id] = true; });
    Object.keys(ids).forEach(function (id) {
      var cloudTime = Date.parse(cloud[id]) || 0;
      var localTime = Date.parse(local[id]) || 0;
      merged[id] = localTime >= cloudTime ? local[id] : cloud[id];
    });
    return JSON.stringify(merged);
  }

  function filterTodosRaw(todoRaw, tombstoneRaw) {
    try {
      var todos = JSON.parse(todoRaw || '[]');
      if (!Array.isArray(todos)) return todoRaw;
      var tombstones = parseTombstones(tombstoneRaw);
      var filtered = todos.filter(function (todo) {
        return !todo || todo.id == null || !tombstones[String(todo.id)];
      });
      return JSON.stringify(filtered);
    } catch (e) { return todoRaw; }
  }

  function protectCleanedDemoRaw(todoRaw) {
    var result = { raw: todoRaw, ids: [], records: [] };
    try {
      // Never remove anything automatically unless the user has already run
      // and confirmed the dedicated v1.32 demo cleanup.
      if (!localStorage.getItem(DEMO_CLEANUP_KEY)) return result;
      if (typeof window === 'undefined' || !window.TodoList || !window.TodoList.demoCleanupPreview) return result;
      var list = JSON.parse(todoRaw || '[]');
      if (!Array.isArray(list)) return result;
      var preview = window.TodoList.demoCleanupPreview(list);
      if (!preview || !preview.totalCount) return result;
      var removing = {};
      preview.ids.forEach(function (id) { removing[String(id)] = true; });
      result.ids = preview.ids.slice();
      result.records = list.filter(function (todo) { return todo && removing[String(todo.id)]; });
      result.raw = JSON.stringify(list.filter(function (todo) { return !todo || !removing[String(todo.id)]; }));
    } catch (e) {}
    return result;
  }

  function quarantineDemoRecords(records) {
    if (!records || !records.length) return;
    try {
      var entries = JSON.parse(localStorage.getItem(DEMO_QUARANTINE_KEY) || '[]');
      if (!Array.isArray(entries)) entries = [];
      entries.unshift({ savedAt: new Date().toISOString(), reason: 'resurfaced-v1.32-demo', records: records });
      if (entries.length > 3) entries.length = 3;
      _origSetItem.call(localStorage, DEMO_QUARANTINE_KEY, JSON.stringify(entries));
    } catch (e) {}
  }

  function recordTodoTombstones(ids) {
    if (!ids || !ids.length) return false;
    var tombstones = parseTombstones(localStorage.getItem(TOMBSTONE_KEY));
    var deletedAt = new Date().toISOString();
    var changed = false;
    for (var i = 0; i < ids.length; i++) {
      var id = String(ids[i]);
      if (!tombstones[id]) {
        tombstones[id] = deletedAt;
        changed = true;
      }
    }
    if (!changed) return false;
    var raw = JSON.stringify(tombstones);
    _origSetItem.call(localStorage, TOMBSTONE_KEY, raw);
    if (isEnabled()) queueValue(TOMBSTONE_KEY, raw, Date.now());
    return true;
  }

  // Deletion is represented explicitly, rather than inferred from an item being
  // absent. This prevents an older cloud/device copy from resurrecting a task.
  function applyTodoTombstones() {
    var storedCurrent = localStorage.getItem(TODO_KEY);
    if (storedCurrent === null) return false;
    var demoProtection = protectCleanedDemoRaw(storedCurrent);
    if (demoProtection.ids.length) {
      quarantineDemoRecords(demoProtection.records);
      recordTodoTombstones(demoProtection.ids);
    }
    var filtered = filterTodosRaw(demoProtection.raw, localStorage.getItem(TOMBSTONE_KEY));
    if (filtered === storedCurrent) return false;
    var stamp = Date.now();
    writeLocal(TODO_KEY, filtered, stamp);
    if (isEnabled()) queueValue(TODO_KEY, filtered, stamp);
    return true;
  }

  function markTodosDeleted(ids) {
    if (!Array.isArray(ids)) ids = [ids];
    var tombstones = parseTombstones(localStorage.getItem(TOMBSTONE_KEY));
    var deletedAt = new Date().toISOString();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i] != null) tombstones[String(ids[i])] = deletedAt;
    }
    var raw = JSON.stringify(tombstones);
    _origSetItem.call(localStorage, TOMBSTONE_KEY, raw);
    if (isEnabled()) queueValue(TOMBSTONE_KEY, raw, Date.now());
    applyTodoTombstones();
  }

  function mergeCloudNewer(key, cloudRaw, localRaw) {
    if (key === TOMBSTONE_KEY) return mergeTombstones(cloudRaw, localRaw);
    if (key === TODO_KEY) {
      try {
        var cloud = JSON.parse(cloudRaw || '[]'), local = JSON.parse(localRaw || '[]');
        if (!Array.isArray(cloud) || !Array.isArray(local)) return cloudRaw;
        var ids = {}, out = cloud.slice();
        for (var i = 0; i < cloud.length; i++) ids[String(cloud[i].id)] = true;
        for (var j = 0; j < local.length; j++) if (!ids[String(local[j].id)]) out.push(local[j]);
        return filterTodosRaw(JSON.stringify(out), localStorage.getItem(TOMBSTONE_KEY));
      } catch (e) { return cloudRaw; }
    }
    if (localRaw == null) return cloudRaw;
    // Structured learning histories keep local-only fields while accepting
    // the newer cloud value on the same field.
    try {
      var cloudJson = JSON.parse(cloudRaw), localJson = JSON.parse(localRaw);
      if (cloudJson && localJson && typeof cloudJson === 'object' && typeof localJson === 'object' &&
          !Array.isArray(cloudJson) && !Array.isArray(localJson)) {
        var merged = {};
        var localKeys = Object.keys(localJson), cloudKeys = Object.keys(cloudJson);
        for (var a = 0; a < localKeys.length; a++) merged[localKeys[a]] = localJson[localKeys[a]];
        for (var b = 0; b < cloudKeys.length; b++) merged[cloudKeys[b]] = cloudJson[cloudKeys[b]];
        return JSON.stringify(merged);
      }
    } catch (e2) {}
    return cloudRaw;
  }

  function loadCfg() {
    try { cfg = JSON.parse(localStorage.getItem(CFG_KEY) || 'null'); }
    catch (e) { cfg = null; }
    return cfg;
  }
  function saveCfg(c) {
    cfg = c;
    try { _origSetItem.call(localStorage, CFG_KEY, JSON.stringify(c)); } catch (e) {}
  }
  function isEnabled() {
    return !!(cfg && cfg.enabled && cfg.url && cfg.anonKey && cfg.syncCode);
  }

  function setStatus(s) {
    status = s;
    for (var i = 0; i < statusCbs.length; i++) statusCbs[i](s);
  }
  function onStatus(cb) { if (typeof cb === 'function') statusCbs.push(cb); }

  function apiURL() { return cfg.url.replace(/\/+$/, '') + '/rest/v1/' + TABLE; }
  function hdrs() {
    var h = {
      'apikey': cfg.anonKey,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
      // x-client-info is accepted by Supabase CORS. The companion RLS policy
      // reads the bloom-sync/<code> suffix and exposes only that namespace.
      'x-client-info': 'bloom-sync/' + cfg.syncCode
    };
    // 旧版 anon key 是 JWT(eyJ...)，可走 Bearer；新版 publishable key(sb_publishable_) 不是 JWT，
    // 只能走 apikey 头，塞进 Bearer 会被 Supabase 拒绝。故仅对 JWT 补 Bearer 头。
    if (cfg.anonKey && cfg.anonKey.indexOf('eyJ') === 0) {
      h['Authorization'] = 'Bearer ' + cfg.anonKey;
    }
    return h;
  }
  function withTimeout(p, ms) {
    return new Promise(function (res, rej) {
      var t = setTimeout(function () { rej(new Error('timeout')); }, ms);
      p.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); });
    });
  }

  // Write to local storage WITHOUT triggering the interceptor (used for cloud->local)
  function writeLocal(orig, value, ts) {
    intercepting = true;
    try {
      _origSetItem.call(localStorage, orig, value);
      if (ts) _origSetItem.call(localStorage, tsKey(orig), String(ts));
    } catch (e) {}
    intercepting = false;
  }

  function pull() {
    if (!isEnabled()) return Promise.resolve();
    setStatus('syncing');
    var url = apiURL() + '?select=key,value,updated_at';
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var opt = { headers: hdrs(), signal: ctrl ? ctrl.signal : undefined };
    return withTimeout(fetch(url, opt), FETCH_TIMEOUT).then(function (r) {
      if (!r.ok) throw new Error('pull ' + r.status);
      return r.json();
    }).then(function (rows) {
      var prefix = 's_' + cfg.syncCode + '|';
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].key.indexOf(prefix) !== 0) continue; // only my namespace
        var orig = unprefKey(rows[i].key);
        var cloudTs = Date.parse(rows[i].updated_at) || 0;
        var localVal, localTs = 0;
        try {
          localVal = localStorage.getItem(orig);
          localTs = parseFloat(localStorage.getItem(tsKey(orig)) || '0') || 0;
        } catch (e) {}
        if (!isSyncableKey(orig)) continue;
        if (localVal === null) {
          writeLocal(orig, rows[i].value, cloudTs);          // missing locally -> take cloud
        } else if (cloudTs > localTs) {
          if (localVal !== rows[i].value) rememberConflict(orig, localVal, rows[i].value, localTs, cloudTs);
          var mergedCloud = mergeCloudNewer(orig, rows[i].value, localVal);
          writeLocal(orig, mergedCloud, cloudTs);            // newer cloud wins conflicts; local-only records survive
          if (mergedCloud !== rows[i].value) queueValue(orig, mergedCloud, Date.now());
        } else if (localVal !== rows[i].value) {
          // A local write survived a reload before upload. Durable timestamps
          // and the outbox ensure it is retried instead of being overwritten.
          queueValue(orig, localVal, localTs || Date.now());
        }
        // else: local is newer or equal -> keep local
      }
      return applyTodoTombstones() ? flush() : null;
    }).then(function () {
      setStatus('idle');
    }).catch(function (err) { setStatus('offline'); throw err; });
  }

  function flush() {
    if (!isEnabled()) return Promise.resolve();
    var keys = Object.keys(pushQueue);
    if (keys.length === 0) return Promise.resolve();
    setStatus('syncing');
    var sending = {};
    var payload = keys.filter(isSyncableKey).map(function (k) {
      sending[k] = pushQueue[k];
      return { key: prefKey(k), value: pushQueue[k].value, updated_at: new Date(pushQueue[k].ts).toISOString() };
    });
    if (payload.length === 0) return Promise.resolve();
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var opt = { method: 'POST', headers: hdrs(), body: JSON.stringify(payload), signal: ctrl ? ctrl.signal : undefined };
    return withTimeout(fetch(apiURL(), opt), FETCH_TIMEOUT).then(function (r) {
      if (!r.ok) throw new Error('push ' + r.status);
      var sentKeys = Object.keys(sending);
      for (var i = 0; i < sentKeys.length; i++) {
        var key = sentKeys[i];
        if (pushQueue[key] && pushQueue[key].ts === sending[key].ts) delete pushQueue[key];
      }
      persistOutbox();
      setStatus('idle');
    }).catch(function (err) {
      // Keep every unsent value in the durable outbox and retry later.
      persistOutbox();
      setStatus('offline');
      throw err;
    });
  }

  function queueValue(key, value, ts) {
    if (!isSyncableKey(key)) return;
    var stamp = ts || Date.now();
    pushQueue[key] = { value: value, ts: stamp };
    try { _origSetItem.call(localStorage, tsKey(key), String(stamp)); } catch (e) {}
    persistOutbox();
  }

  function schedulePush(key, value) {
    if (suppress) return;     // seed writes must never be uploaded
    if (intercepting) return;
    if (!isSyncableKey(key)) return;
    if (!isEnabled()) return;
    queueValue(key, value, Date.now());
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { flush().catch(function () {}); }, PUSH_DEBOUNCE);
  }

  function markDirty(key) {
    if (!isEnabled() || !isSyncableKey(key)) return;
    if (key === TODO_KEY || key === TOMBSTONE_KEY) applyTodoTombstones();
    var value = localStorage.getItem(key);
    if (value !== null) schedulePush(key, value);
  }

  function setSuppress(v) { suppress = v; }

  // First connection uses a non-destructive merge. Cloud-only data is adopted,
  // local-only data is queued, and same-key task arrays keep all unique IDs.
  function safeFirstSync() {
    if (!isEnabled()) return Promise.resolve();
    setStatus('syncing');
    var url = apiURL() + '?select=key,value,updated_at';
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var opt = { headers: hdrs(), signal: ctrl ? ctrl.signal : undefined };
    return withTimeout(fetch(url, opt), FETCH_TIMEOUT).then(function (r) {
      if (!r.ok) throw new Error('forcePull ' + r.status);
      return r.json();
    }).then(function (rows) {
      var prefix = 's_' + cfg.syncCode + '|';
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].key.indexOf(prefix) !== 0) continue;
        var orig = unprefKey(rows[i].key);
        if (!isSyncableKey(orig)) continue;
        var cloudTs = Date.parse(rows[i].updated_at) || 0;
        var localValue = localStorage.getItem(orig);
        if (localValue === null) {
          writeLocal(orig, rows[i].value, cloudTs);
        } else if (localValue !== rows[i].value) {
          rememberConflict(orig, localValue, rows[i].value, 0, cloudTs);
          var merged = orig === TOMBSTONE_KEY
            ? mergeTombstones(rows[i].value, localValue)
            : ((typeof window !== 'undefined' && window.BackupRestore)
              ? window.BackupRestore.mergeRaw(orig, rows[i].value, localValue) : localValue);
          if (orig === TODO_KEY) merged = filterTodosRaw(merged, localStorage.getItem(TOMBSTONE_KEY));
          writeLocal(orig, merged, Date.now());
          queueValue(orig, merged, Date.now());
        }
      }
      // Upload local keys that do not exist in the cloud namespace.
      var cloudKeys = {};
      for (var r = 0; r < rows.length; r++) if (rows[r].key.indexOf(prefix) === 0) cloudKeys[unprefKey(rows[r].key)] = true;
      for (var k = 0; k < localStorage.length; k++) {
        var localKey = localStorage.key(k);
        if (isSyncableKey(localKey) && !cloudKeys[localKey]) queueValue(localKey, localStorage.getItem(localKey), Date.now());
      }
      applyTodoTombstones();
      return flush();
    }).then(function () {
      setStatus('idle');
    }).catch(function (err) { setStatus('offline'); throw err; });
  }

  function init(afterBoot) {
    loadCfg();
    loadOutbox();
    // Install interceptor: capture every localStorage write across all modules
    try {
      Storage.prototype.setItem = function (k, v) {
        var ret = _origSetItem.apply(this, arguments);
        if (this === localStorage) schedulePush(k, v);
        return ret;
      };
    } catch (e) {}
    if (isEnabled()) {
      // push local first (avoid losing local edits), then pull cloud
      flush().then(function () { return pull(); }).then(function () {
        if (afterBoot) afterBoot();
      }).catch(function () { if (afterBoot) afterBoot(); });
    } else {
      setStatus('off');
      if (afterBoot) afterBoot();
    }
  }

  function manualSync() { return flush().then(function () { return pull(); }); }
  function saveConfig(c) { saveCfg(c); }
  function getConfig() { return cfg; }
  function getStatus() { return status; }
  function genCode() {
    var s = '', chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (var i = 0; i < 16; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return s;
  }

  return {
    init: init,
    onStatus: onStatus,
    manualSync: manualSync,
    safeFirstSync: safeFirstSync,
    forcePull: safeFirstSync,
    saveConfig: saveConfig,
    getConfig: getConfig,
    getStatus: getStatus,
    genCode: genCode,
    setSuppress: setSuppress,
    markDirty: markDirty,
    markTodosDeleted: markTodosDeleted,
    applyTodoTombstones: applyTodoTombstones,
    isSyncableKey: isSyncableKey,
    isEnabled: isEnabled,
    _test: {
      mergeTombstones: mergeTombstones,
      filterTodosRaw: filterTodosRaw,
      protectCleanedDemoRaw: protectCleanedDemoRaw
    }
  };
})();
// 关键修复：顶层 const Sync 不会挂到 window 上，导致 app.js 里所有 `if (window.Sync)` 守卫都为 false、
// 同步功能形同虚设（点保存无反应、状态卡在“未启用”）。显式挂到 window 即可。
window.Sync = Sync;
if (typeof module !== 'undefined' && module.exports) module.exports = Sync;
