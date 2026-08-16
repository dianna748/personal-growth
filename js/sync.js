/* ============================================
   Bloom · Multi-device Sync (Supabase PostgREST)
   零依赖：直接走 Supabase REST，不引任何 SDK / CDN
   自配置：URL / anon key / 同步码 在页面「同步」面板里填写
   策略：云端权威 + 时间戳合并（last-write-wins，双离线也安全）
   ============================================ */
const Sync = (function () {
  'use strict';

  var CFG_KEY = 'bloom_sync_config';
  var TABLE = 'kv_store';
  var FETCH_TIMEOUT = 6000;
  var PUSH_DEBOUNCE = 700;
  var TS_PREFIX = '__ts__';

  var cfg = null;            // {url, anonKey, syncCode, enabled}
  var status = 'off';        // off | idle | syncing | offline | error
  var statusCbs = [];
  var pushTimer = null;
  var pushQueue = {};        // origKey -> {value, ts}
  var _origSetItem = Storage.prototype.setItem;
  var intercepting = false;  // true while writing local from cloud (avoid loop)

  function prefKey(k) { return 's_' + (cfg ? cfg.syncCode : '') + '|' + k; }
  function unprefKey(pk) { var i = pk.indexOf('|'); return i < 0 ? pk : pk.slice(i + 1); }
  function tsKey(k) { return TS_PREFIX + k; }

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
      'Prefer': 'resolution=merge-duplicates'
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
        if (localVal === null) {
          writeLocal(orig, rows[i].value, cloudTs);          // missing locally -> take cloud
        } else if (cloudTs > localTs) {
          writeLocal(orig, rows[i].value, cloudTs);          // cloud newer -> take cloud
        }
        // else: local is newer or equal -> keep local
      }
      setStatus('idle');
    }).catch(function () { setStatus('offline'); });
  }

  function flush() {
    if (!isEnabled()) return Promise.resolve();
    var keys = Object.keys(pushQueue);
    if (keys.length === 0) return Promise.resolve();
    setStatus('syncing');
    var payload = keys.map(function (k) {
      return { key: prefKey(k), value: pushQueue[k].value, updated_at: new Date(pushQueue[k].ts).toISOString() };
    });
    pushQueue = {};
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var opt = { method: 'POST', headers: hdrs(), body: JSON.stringify(payload), signal: ctrl ? ctrl.signal : undefined };
    return withTimeout(fetch(apiURL(), opt), FETCH_TIMEOUT).then(function (r) {
      if (!r.ok) throw new Error('push ' + r.status);
      setStatus('idle');
    }).catch(function () { setStatus('offline'); });
  }

  function schedulePush(key, value) {
    if (intercepting) return;
    if (!isEnabled()) return;
    pushQueue[key] = { value: value, ts: Date.now() };
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { flush(); }, PUSH_DEBOUNCE);
  }

  function init(afterBoot) {
    loadCfg();
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
    for (var i = 0; i < 8; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return s;
  }

  return {
    init: init,
    onStatus: onStatus,
    manualSync: manualSync,
    saveConfig: saveConfig,
    getConfig: getConfig,
    getStatus: getStatus,
    genCode: genCode,
    isEnabled: isEnabled
  };
})();
// 关键修复：顶层 const Sync 不会挂到 window 上，导致 app.js 里所有 `if (window.Sync)` 守卫都为 false、
// 同步功能形同虚设（点保存无反应、状态卡在“未启用”）。显式挂到 window 即可。
window.Sync = Sync;
