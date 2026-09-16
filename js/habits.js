/* Daily habits use separate records; never create or alter ordinary tasks. */
const Habits = (function () {
  'use strict';
  const DEF = 'bloom_habit_def_v1_', DAY = 'bloom_habit_day_v1_';
  let selected, lastToday, root, editor, returnFocus;
  function today(now) {
    const d = now || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function shift(date, amount) {
    const parts = date.split('-').map(Number);
    return today(new Date(parts[0], parts[1] - 1, parts[2] + amount, 12));
  }
  function read(key, storage) {
    const raw = storage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  }
  function definitions(storage) {
    const result = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key.startsWith(DEF)) continue;
      const h = read(key, storage);
      if (!h || typeof h.name !== 'string' || !Array.isArray(h.periods) || key !== DEF + h.id) throw new Error('习惯数据格式异常，请先备份，勿覆盖原记录。');
      result.push(h);
    }
    return result.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  }
  function active(h, date) { return h.periods.some(p => p.start <= date && (!p.end || date < p.end)); }
  function done(h, date, storage) {
    const entry = read(DAY + h.id + '_' + date, storage);
    return !!(entry && entry.done === true);
  }
  function save(h, storage) {
    storage.setItem(DEF + h.id, JSON.stringify(h));
    return h;
  }
  function create(name, note, storage, date) {
    name = String(name || '').trim(); note = String(note || '').trim();
    if (!name || name.length > 60 || note.length > 120) throw new Error('请填写 1–60 字的习惯名称，目标说明最多 120 字。');
    const all = definitions(storage);
    if (all.some(h => !h.archived && h.name === name)) throw new Error('已有同名习惯，可以直接打卡。');
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
    return save({ id, name, note, archived: false, periods: [{ start: date || today(), end: null }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, storage);
  }
  function check(h, date, value, storage, currentDay) {
    if (date > (currentDay || today()) || !active(h, date)) throw new Error('只能为习惯启用期间的今天或过去日期打卡。');
    // Explicit false survives sync: undo never removes the storage key.
    storage.setItem(DAY + h.id + '_' + date, JSON.stringify({ id: h.id, date, done: !!value, updatedAt: new Date().toISOString() }));
  }
  function archive(h, value, storage, date) {
    date = date || today();
    h = JSON.parse(JSON.stringify(h));
    if (h.archived === value) return h;
    h.archived = value;
    if (value) h.periods[h.periods.length - 1].end = shift(date, 1);
    else {
      const last = h.periods[h.periods.length - 1];
      if (last.end >= date) last.end = null;
      else h.periods.push({ start: date, end: null });
    }
    h.updatedAt = new Date().toISOString();
    return save(h, storage);
  }
  function streak(h, date, storage) {
    let cursor = date, count = 0;
    if (!done(h, cursor, storage)) cursor = shift(cursor, -1);
    while (active(h, cursor) && done(h, cursor, storage)) { count++; cursor = shift(cursor, -1); }
    return count;
  }
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function button(label, cls, fn) {
    const b = el('button', cls, label); b.type = 'button'; b.addEventListener('click', fn); return b;
  }
  function report(error) { document.getElementById('habits-message').textContent = error.message || '保存失败，请先检查浏览器存储空间。'; }
  function safely(fn) { try { fn(); render(); } catch (error) { report(error); } }
  function openEditor(h) {
    returnFocus = document.activeElement;
    editor.dataset.habitId = h ? h.id : '';
    document.getElementById('habit-editor-title').textContent = h ? '编辑习惯' : '添加每日习惯';
    document.getElementById('habit-name').value = h ? h.name : '';
    document.getElementById('habit-note').value = h ? h.note : '';
    document.getElementById('habit-editor-error').textContent = '';
    editor.showModal(); document.getElementById('habit-name').focus();
  }
  function render() {
    if (!root) return;
    const focusedHabit = document.activeElement && document.activeElement.dataset.habitCheck;
    const list = document.getElementById('habit-list'), manager = document.getElementById('habit-manager-list');
    document.getElementById('habits-message').textContent = '';
    list.replaceChildren(); manager.replaceChildren();
    try {
      const all = definitions(localStorage), current = today();
      const visible = all.filter(h => active(h, selected) && (!h.archived || selected < current));
      const completed = visible.filter(h => done(h, selected, localStorage)).length;
      document.getElementById('habit-date-label').textContent = selected === current ? '今天 · 每天一点积累' : selected + ' · 每日记录';
      document.getElementById('habit-progress').textContent = visible.length ? completed + '/' + visible.length + ' 已完成' : '从一个小习惯开始';
      if (!visible.length) list.append(el('p', 'habit-empty', selected > current ? '未来日期可以查看计划，到了当天再打卡。' : '这里还没有习惯。添加一个自己的每日目标，不会自动填充样例。'));
      visible.forEach(h => {
        const isDone = done(h, selected, localStorage), row = el('div', 'habit-row' + (isDone ? ' is-done' : ''));
        const toggle = button(isDone ? '✓' : '', 'habit-check', () => safely(() => check(h, selected, !isDone, localStorage)));
        toggle.setAttribute('aria-label', (isDone ? '撤销打卡：' : '完成打卡：') + h.name);
        toggle.dataset.habitCheck = h.id;
        toggle.setAttribute('aria-pressed', String(isDone)); toggle.disabled = selected > current;
        const copy = el('div', 'habit-copy'); copy.append(el('strong', 'habit-name', h.name));
        if (h.note) copy.append(el('span', 'habit-note', h.note));
        const week = el('div', 'habit-week');
        let weekDone = 0, eligible = 0;
        for (let n = -6; n <= 0; n++) {
          const d = shift(selected, n), available = active(h, d) && d <= current, checked = available && done(h, d, localStorage);
          if (available) eligible++; if (checked) weekDone++;
          const dot = el('span', 'habit-day' + (checked ? ' checked' : '') + (!available ? ' unavailable' : ''), checked ? '✓' : '·');
          dot.title = d + (checked ? ' 已完成' : available ? ' 未完成' : ' 不在打卡日期内');
          dot.setAttribute('aria-hidden', 'true'); week.append(dot);
        }
        week.setAttribute('role', 'img'); week.setAttribute('aria-label', '近七日：' + weekDone + '/' + eligible + ' 天完成');
        const side = el('div', 'habit-side'); side.append(week, el('span', 'habit-streak', '连续 ' + streak(h, selected > current ? current : selected, localStorage) + ' 天'));
        row.append(toggle, copy, side); list.append(row);
      });
      if (visible.length && completed === visible.length) list.append(el('p', 'habit-celebration', (selected === current ? '今日' : '这一天的') + '习惯已完成，给自己一个小小的肯定。'));
      all.forEach(h => {
        const row = el('div', 'habit-manage-row'); row.append(el('span', '', h.name + (h.archived ? ' · 已归档' : '')));
        row.append(button('编辑', 'habit-text-button', () => openEditor(h)), button(h.archived ? '恢复' : '归档', 'habit-text-button', () => {
          if (!h.archived && !confirm('归档“' + h.name + '”？以后不再出现在每日清单，历史打卡会保留。')) return;
          safely(() => archive(h, !h.archived, localStorage));
        })); manager.append(row);
      });
      if (!all.length) manager.append(el('p', 'habit-empty', '暂无习惯；点击“添加习惯”开始。'));
      if (focusedHabit) Array.from(list.querySelectorAll('[data-habit-check]')).forEach(b => { if (b.dataset.habitCheck === focusedHabit) b.focus(); });
    } catch (error) { report(error); }
  }
  function setDate(date) { selected = date; render(); }
  function init() {
    root = document.getElementById('daily-habits'); editor = document.getElementById('habit-editor');
    if (!root || !editor || root.dataset.initialized) return;
    root.dataset.initialized = 'true'; lastToday = today(); selected = selected || lastToday;
    document.getElementById('habit-add').addEventListener('click', () => openEditor(null));
    document.getElementById('habit-editor-cancel').addEventListener('click', () => editor.close());
    editor.addEventListener('close', () => { if (returnFocus && returnFocus.isConnected) returnFocus.focus(); else document.getElementById('habit-add').focus(); });
    document.getElementById('habit-form').addEventListener('submit', event => {
      event.preventDefault();
      try {
        const name = document.getElementById('habit-name').value.trim(), note = document.getElementById('habit-note').value.trim();
        if (!name || name.length > 60 || note.length > 120) throw new Error('请填写有效的名称和目标说明。');
        if (editor.dataset.habitId) {
          const h = read(DEF + editor.dataset.habitId, localStorage);
          if (!h) throw new Error('该习惯已变更，请关闭后重新打开。');
          save(Object.assign({}, h, { name, note, updatedAt: new Date().toISOString() }), localStorage);
        } else create(name, note, localStorage);
        editor.close(); render();
      } catch (error) { document.getElementById('habit-editor-error').textContent = error.message; }
    });
    window.addEventListener('storage', e => { if (!e.key || e.key.startsWith(DEF) || e.key.startsWith(DAY)) render(); });
    function tick() {
      const current = today();
      if (current !== lastToday) {
        if (selected === lastToday && window.TodoList) { TodoList.setViewDate(current); TodoList.render(); }
        lastToday = current; render();
      }
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
    setInterval(tick, 30000); render();
  }
  return { init, render, setDate, _test: { today, shift, active, definitions, create, check, archive, done, streak, DEF, DAY } };
})();
if (typeof window !== 'undefined') window.Habits = Habits;
if (typeof module !== 'undefined' && module.exports) module.exports = Habits;
