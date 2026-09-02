/* ============================================
   Bloom · Backup preview and safe restore
   - Accepts v1/v2 Bloom JSON backups
   - Never restores sync credentials
   - Previews new / duplicate / conflicting tasks
   - Merge keeps local conflicts; overwrite only touches included keys
   ============================================ */
const BackupRestore = (function () {
  'use strict';

  var FORMAT = 'bloom-local-backup';
  var TODO_KEY = 'bloom_todos_v2';
  var TOMBSTONE_KEY = 'bloom_todo_tombstones_v1';
  var BLOCKED_KEYS = {
    bloom_sync_config: true
  };

  function isSafeKey(key) {
    return typeof key === 'string' && key.indexOf('bloom_') === 0 && !BLOCKED_KEYS[key];
  }

  function canonical(value) {
    if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object') {
      var keys = Object.keys(value).sort();
      return '{' + keys.map(function (key) {
        return JSON.stringify(key) + ':' + canonical(value[key]);
      }).join(',') + '}';
    }
    return JSON.stringify(value);
  }

  function parseTodos(raw, label) {
    if (raw == null) return [];
    var parsed;
    try { parsed = JSON.parse(raw); }
    catch (e) { throw new Error((label || '任务数据') + '不是有效 JSON'); }
    if (!Array.isArray(parsed)) throw new Error((label || '任务数据') + '格式不正确');
    for (var i = 0; i < parsed.length; i++) {
      var task = parsed[i];
      if (!task || (typeof task.id !== 'number' && typeof task.id !== 'string') ||
          typeof task.text !== 'string' || typeof task.date !== 'string') {
        throw new Error((label || '任务数据') + '包含无法识别的第 ' + (i + 1) + ' 条记录');
      }
    }
    return parsed;
  }

  function validatePayload(payload) {
    if (!payload || payload.format !== FORMAT || (payload.version !== 1 && payload.version !== 2)) {
      throw new Error('不是可识别的 Bloom 备份文件');
    }
    if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
      throw new Error('备份文件缺少 data 数据区');
    }
    var safe = {};
    var keys = Object.keys(payload.data);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!isSafeKey(key)) continue;
      if (typeof payload.data[key] !== 'string') throw new Error('备份字段 ' + key + ' 格式不正确');
      safe[key] = payload.data[key];
    }
    if (safe[TODO_KEY] != null) parseTodos(safe[TODO_KEY], '备份任务数据');
    return safe;
  }

  function collectData(storage) {
    storage = storage || localStorage;
    var data = {};
    for (var i = 0; i < storage.length; i++) {
      var key = storage.key(i);
      if (isSafeKey(key)) data[key] = storage.getItem(key);
    }
    return data;
  }

  function buildPayload(storage) {
    return {
      format: FORMAT,
      version: 2,
      appVersion: '1.33',
      exportedAt: new Date().toISOString(),
      data: collectData(storage)
    };
  }

  function parse(text) {
    var payload;
    try { payload = JSON.parse(text); }
    catch (e) { throw new Error('备份文件不是有效 JSON'); }
    validatePayload(payload);
    return payload;
  }

  function analyze(payload, storage) {
    storage = storage || localStorage;
    var incoming = validatePayload(payload);
    var incomingTasks = parseTodos(incoming[TODO_KEY], '备份任务数据');
    var localTasks = parseTodos(storage.getItem(TODO_KEY), '本机任务数据');
    var localById = {};
    var result = {
      newCount: 0,
      duplicateCount: 0,
      conflictCount: 0,
      otherNew: 0,
      otherDuplicate: 0,
      otherConflict: 0,
      incomingTaskCount: incomingTasks.length,
      incomingKeyCount: Object.keys(incoming).length,
      conflictTasks: [],
      data: incoming
    };
    for (var i = 0; i < localTasks.length; i++) localById[String(localTasks[i].id)] = localTasks[i];
    for (var j = 0; j < incomingTasks.length; j++) {
      var task = incomingTasks[j];
      var local = localById[String(task.id)];
      if (!local) {
        result.newCount++;
      } else if (canonical(local) === canonical(task)) {
        result.duplicateCount++;
      } else {
        result.conflictCount++;
        if (result.conflictTasks.length < 5) result.conflictTasks.push(task.text);
      }
    }
    var keys = Object.keys(incoming);
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      if (key === TODO_KEY) continue;
      var localRaw = storage.getItem(key);
      if (localRaw === null) result.otherNew++;
      else if (localRaw === incoming[key]) result.otherDuplicate++;
      else result.otherConflict++;
    }
    return result;
  }

  function mergeJson(incoming, local) {
    if (Array.isArray(incoming) && Array.isArray(local)) {
      var seen = {};
      var merged = [];
      var both = local.concat(incoming);
      for (var i = 0; i < both.length; i++) {
        var sig = canonical(both[i]);
        if (!seen[sig]) { seen[sig] = true; merged.push(both[i]); }
      }
      return merged;
    }
    if (incoming && local && typeof incoming === 'object' && typeof local === 'object' &&
        !Array.isArray(incoming) && !Array.isArray(local)) {
      var out = {};
      var incomingKeys = Object.keys(incoming);
      for (var j = 0; j < incomingKeys.length; j++) out[incomingKeys[j]] = incoming[incomingKeys[j]];
      var localKeys = Object.keys(local);
      for (var k = 0; k < localKeys.length; k++) {
        var key = localKeys[k];
        out[key] = Object.prototype.hasOwnProperty.call(incoming, key)
          ? mergeJson(incoming[key], local[key]) : local[key];
      }
      return out;
    }
    return local;
  }

  function mergeRaw(key, incomingRaw, localRaw) {
    if (localRaw === null) return incomingRaw;
    if (key === TOMBSTONE_KEY) {
      try {
        var incomingDeleted = JSON.parse(incomingRaw || '{}');
        var localDeleted = JSON.parse(localRaw || '{}');
        var deleted = {}, deletedIds = {};
        Object.keys(incomingDeleted).forEach(function (id) { deletedIds[id] = true; });
        Object.keys(localDeleted).forEach(function (id) { deletedIds[id] = true; });
        Object.keys(deletedIds).forEach(function (id) {
          deleted[id] = (Date.parse(localDeleted[id]) || 0) >= (Date.parse(incomingDeleted[id]) || 0)
            ? localDeleted[id] : incomingDeleted[id];
        });
        return JSON.stringify(deleted);
      } catch (e0) { return localRaw; }
    }
    if (key === TODO_KEY) {
      var incomingTasks = parseTodos(incomingRaw, '备份任务数据');
      var localTasks = parseTodos(localRaw, '本机任务数据');
      var ids = {};
      var mergedTasks = localTasks.slice();
      for (var i = 0; i < localTasks.length; i++) ids[String(localTasks[i].id)] = true;
      for (var j = 0; j < incomingTasks.length; j++) {
        if (!ids[String(incomingTasks[j].id)]) mergedTasks.push(incomingTasks[j]);
      }
      return JSON.stringify(mergedTasks);
    }
    try {
      return JSON.stringify(mergeJson(JSON.parse(incomingRaw), JSON.parse(localRaw)));
    } catch (e) {
      return localRaw;
    }
  }

  function restore(payload, mode, storage) {
    storage = storage || localStorage;
    if (mode !== 'merge' && mode !== 'overwrite') throw new Error('请选择合并或覆盖恢复');
    var incoming = validatePayload(payload);
    var keys = Object.keys(incoming);
    var before = {};
    var written = [];
    var sync = typeof window !== 'undefined' ? window.Sync : null;
    for (var i = 0; i < keys.length; i++) before[keys[i]] = storage.getItem(keys[i]);
    if (sync && sync.setSuppress) sync.setSuppress(true);
    try {
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = mode === 'merge' ? mergeRaw(key, incoming[key], storage.getItem(key)) : incoming[key];
        storage.setItem(key, value);
        written.push(key);
      }
    } catch (e) {
      for (var r = 0; r < written.length; r++) {
        var rollbackKey = written[r];
        if (before[rollbackKey] === null) storage.removeItem(rollbackKey);
        else storage.setItem(rollbackKey, before[rollbackKey]);
      }
      throw new Error('恢复写入失败，已回滚本机数据');
    } finally {
      if (sync && sync.setSuppress) sync.setSuppress(false);
    }
    if (sync && sync.applyTodoTombstones) sync.applyTodoTombstones();
    if (sync && sync.markDirty) {
      for (var m = 0; m < keys.length; m++) sync.markDirty(keys[m]);
    }
    return { mode: mode, keys: keys.length, preview: analyze(payload, storage) };
  }

  function download(payload, filename) {
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  return {
    FORMAT: FORMAT,
    TODO_KEY: TODO_KEY,
    isSafeKey: isSafeKey,
    buildPayload: buildPayload,
    parse: parse,
    analyze: analyze,
    mergeRaw: mergeRaw,
    restore: restore,
    download: download,
    canonical: canonical
  };
})();

if (typeof window !== 'undefined') window.BackupRestore = BackupRestore;
if (typeof module !== 'undefined' && module.exports) module.exports = BackupRestore;
