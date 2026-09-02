/* ============================================
   Todo List Module — Flat single-page layout
   • Multi-date grouped tasks (flat stream)
   • GitHub-style workload heatmap
   • Inline archive + dashboard below
   • Demo-data seeding for first run
   ============================================ */

const TodoList = (function () {
  let todos = [];            // all tasks across dates
  let currentCategory = 'work';
  let currentFilter = 'all';
  let hideCompleted = false;  // view-only preference; never persisted into history data
  let dragTodoId = null;
  let emptyMode = '';

  // Archive state
  let archiveSearch = '';
  let archiveCat = 'all';
  let archiveMode = 'recent7';      // 'recent7' (default) | 'date'
  let archiveSelectedDate = '';     // ISO string used when mode === 'date'
  let archiveCalYear = null;        // archive modal calendar anchor
  let archiveCalMonth = null;

  // Date navigator state
  let viewDate = todayStr();
  let calYear = null;    // calendar popover visible month (year)
  let calMonth = null;   // calendar popover visible month (1..12)

  // Import modal state
  let importDefaultDate = todayStr();
  let importDefaultCat = 'work';
  let importParsed = [];    // last parsed items for preview

  const STORAGE_KEY = 'bloom_todos_v2';
  const SEED_FLAG_KEY = 'bloom_todos_seeded_v1';
  const DEMO_CLEANUP_KEY = 'bloom_demo_cleanup_v1';
  const DEMO_TEXTS = new Set([
    'Morning jog 30 min', 'Grocery shopping', 'Cook dinner — pasta', 'Call parents',
    'Water plants', 'Yoga session', 'Read for 20 min', 'Tidy the desk', 'Laundry',
    'Sleep before 23:00', 'Meditation 10 min', 'Bake bread', 'Walk in the park',
    'Plan weekend trip', 'Journaling', 'Review quarterly report', 'Standup meeting',
    'Reply to client emails', 'Update project roadmap', 'Draft proposal deck', 'Code review',
    '1:1 with manager', 'Invoice processing — Jiangcai delivery data', 'Vendor follow-up calls',
    'Sprint retrospective', 'Prepare slides for Friday', 'Cross-team sync', 'Polish README',
    'Deploy hotfix', 'English — 30 vocab review', 'Read Economist article',
    'French — Le Monde reading', 'Practice shadowing 15 min', 'Watch TED talk',
    'Duolingo streak', 'Anki deck review', 'Write 5 sentences in French',
    'Listen to podcast episode', 'Grammar drill — past subjunctive', 'Draft blog post outline',
    'Edit video for YouTube', 'Reply to comments', "Schedule next week's posts",
    'Research trending topic', 'Record voiceover', 'Design thumbnail', 'Update content calendar',
    'Write newsletter', 'Repurpose article into tweet thread'
  ]);

  /* ---- Date Helpers ---- */
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function fmtDate(isoStr) { return I18n.fmtDate(isoStr); }
  function fmtShort(isoStr) { return I18n.fmtMonthDay(isoStr); }
  function fmtDateCN(isoStr) { return I18n.fmtMonthDay(isoStr); }

  function catLabel(cat) { return I18n.t('cat.' + cat); }

  var PRIORITY_ORDER = ['high', 'medium', 'low'];
  var PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

  // Old tasks intentionally remain untouched in storage. A missing/unknown
  // priority is interpreted as medium only when the task is displayed.
  function priorityOf(todo) {
    var p = todo && todo.priority;
    return PRIORITY_ORDER.indexOf(p) >= 0 ? p : 'medium';
  }

  function priorityLabel(priority) {
    return I18n.t('priority.' + priority);
  }

  function chainRootId(todo) {
    if (!todo) return null;
    return todo.taskChainId != null ? todo.taskChainId :
      (todo.parentRollover != null ? todo.parentRollover : todo.id);
  }

  function sameChain(a, b) {
    return a && b && String(chainRootId(a)) === String(chainRootId(b));
  }

  function dateOnly(value) {
    return typeof value === 'string' ? value.slice(0, 10) : '';
  }

  /* Build a display/statistics model without migrating old records. Legacy
     parentRollover links are interpreted as chains only in memory. */
  function buildTaskChains(list) {
    list = list || todos;
    var byRoot = {};
    var order = [];
    for (var i = 0; i < list.length; i++) {
      var key = String(chainRootId(list[i]));
      if (!byRoot[key]) { byRoot[key] = []; order.push(key); }
      byRoot[key].push(list[i]);
    }
    var chains = [];
    for (var j = 0; j < order.length; j++) {
      var members = byRoot[order[j]].slice().sort(function (a, b) {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1;
        return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
      });
      var original = null;
      for (var m = 0; m < members.length; m++) {
        if (!members[m].rolledOver && members[m].parentRollover == null) { original = members[m]; break; }
      }
      if (!original) original = members[0];
      var completed = false, completionDate = '', rolloverCount = 0;
      for (var n = 0; n < members.length; n++) {
        var member = members[n];
        if (member.rolledOver || member.parentRollover != null) rolloverCount++;
        if (member.done) {
          completed = true;
          var explicit = dateOnly(member.completedAt || member.chainCompletedAt);
          if (explicit && (!completionDate || explicit < completionDate)) completionDate = explicit;
        }
      }
      if (completed && !completionDate) {
        // Legacy completed chains have no completion timestamp. A rollover
        // chain is conservatively counted on its latest completed copy date.
        if (rolloverCount > 0) {
          for (var z = members.length - 1; z >= 0; z--) {
            if (members[z].done) { completionDate = members[z].date; break; }
          }
        } else completionDate = original.date;
      }
      chains.push({
        id: chainRootId(original),
        original: original,
        members: members,
        completed: completed,
        completionDate: completionDate,
        rolloverCount: rolloverCount,
        originalDate: original.originalDate || original.date
      });
    }
    return chains;
  }

  function touchTodo(todo) {
    if (todo) todo.updatedAt = new Date().toISOString();
  }

  function isToday(dateStr) { return dateStr === todayStr(); }
  function isYesterday(dateStr) { return dateStr === shiftDate(todayStr(), -1); }

  function shiftDate(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function dateLabel(dateStr) {
    if (isToday(dateStr)) return I18n.t('dateGroup.today');
    if (isYesterday(dateStr)) return I18n.t('dateGroup.yesterday');
    return fmtDate(dateStr);
  }

  /** Parse a YYYY-MM-DD date string. Returns Date or null. */
  function parseISODate(s) {
    if (!s || typeof s !== 'string') return null;
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!m) return null;
    var y = parseInt(m[1], 10), mo = parseInt(m[2], 10) - 1, d = parseInt(m[3], 10);
    var dt = new Date(y, mo, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
    return dt;
  }

  /** Get weekday short name from iso date, language-aware. */
  function weekdayShort(dateStr) {
    var d = parseISODate(dateStr);
    if (!d) return '';
    var wds = I18n.weekdays();
    return wds[d.getDay()];
  }

  /** Format a date string as "8月13日" / "Aug 13" / "13 août" using locale-appropriate order. */
  function dayMonthShort(dateStr) {
    var d = parseISODate(dateStr);
    if (!d) return dateStr;
    var ms = I18n.months();
    var lang = (typeof I18n.getLang === 'function') ? I18n.getLang() : 'en';
    if (lang === 'zh') return (d.getMonth() + 1) + '\u6708' + d.getDate() + '\u65e5';
    var mAbbr = ms[d.getMonth()];
    if (lang === 'fr') return d.getDate() + ' ' + mAbbr;
    return mAbbr + ' ' + d.getDate();
  }

  /* ---- Storage ---- */
  function load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      todos = data ? JSON.parse(data) : [];
    } catch (e) {
      todos = [];
    }
    for (var i = 0; i < todos.length; i++) {
      if (!todos[i].addedDate) todos[i].addedDate = todos[i].date;
      if (typeof todos[i].rolledOver === 'undefined') todos[i].rolledOver = false;
      if (typeof todos[i].parentRollover === 'undefined') todos[i].parentRollover = null;
      if (!Array.isArray(todos[i].subtasks)) todos[i].subtasks = [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  /* ---- Demo Data Seeding (first run only) ----
     Generates ~6 weeks of varied history so the heatmap,
     archive and dashboard have meaningful content.
  */
  function seedDemoData() {
    // If a sync account is configured, the cloud is authoritative — never
    // synthesize local demo data (it would otherwise get pushed over real cloud data).
    if (window.Sync && Sync.getConfig && Sync.getConfig()) return;
    // Skip if user already has tasks, or seed already ran.
    if (todos.length > 0) return;
    if (localStorage.getItem(SEED_FLAG_KEY) === '1') return;

    // Never let the seed writes be queued for upload (so demo can't overwrite cloud).
    // Important: enable suppression only after the early-return checks above;
    // otherwise an existing-data session could remain suppressed indefinitely.
    var _suppressSeed = !!(window.Sync && Sync.setSuppress);
    if (_suppressSeed) Sync.setSuppress(true);

    var pools = {
      life: [
        'Morning jog 30 min', 'Grocery shopping', 'Cook dinner — pasta',
        'Call parents', 'Water plants', 'Yoga session', 'Read for 20 min',
        'Tidy the desk', 'Laundry', 'Sleep before 23:00', 'Meditation 10 min',
        'Bake bread', 'Walk in the park', 'Plan weekend trip', 'Journaling'
      ],
      work: [
        'Review quarterly report', 'Standup meeting', 'Reply to client emails',
        'Update project roadmap', 'Draft proposal deck', 'Code review',
        '1:1 with manager', 'Invoice processing — Jiangcai delivery data',
        'Vendor follow-up calls', 'Sprint retrospective', 'Prepare slides for Friday',
        'Cross-team sync', 'Polish README', 'Deploy hotfix'
      ],
      study: [
        'English — 30 vocab review', 'Read Economist article',
        'French — Le Monde reading', 'Practice shadowing 15 min',
        'Watch TED talk', 'Duolingo streak', 'Anki deck review',
        'Write 5 sentences in French', 'Listen to podcast episode',
        'Grammar drill — past subjunctive'
      ],
      media: [
        'Draft blog post outline', 'Edit video for YouTube', 'Reply to comments',
        'Schedule next week\'s posts', 'Research trending topic', 'Record voiceover',
        'Design thumbnail', 'Update content calendar', 'Write newsletter',
        'Repurpose article into tweet thread'
      ]
    };

    // Per-day intensity profile (0..5) over 42 days — gives a natural-looking heatmap
    // Weighted toward 1-3 with occasional high days and quiet stretches.
    var profile = [
      2, 3, 1, 0, 4, 2, 1,
      1, 2, 3, 2, 1, 0, 0,
      3, 4, 2, 5, 3, 2, 1,
      2, 1, 3, 4, 2, 0, 1,
      3, 2, 4, 3, 5, 2, 1,
      2, 3, 1, 4, 2, 3
    ];

    function pickFrom(pool) {
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function pickCategory() {
      var r = Math.random();
      if (r < 0.4) return 'work';
      if (r < 0.6) return 'media';
      if (r < 0.85) return 'life';
      return 'study';
    }

    var seeded = [];
    var idSeed = Date.now() - 42 * 86400000; // start id low so newer ones win on .unshift
    for (var offset = 42; offset >= 1; offset--) {
      var date = shiftDate(todayStr(), -offset);
      var n = profile[42 - offset] || 0;
      if (n === 0) continue;

      for (var k = 0; k < n; k++) {
        var cat = pickCategory();
        var text = pickFrom(pools[cat]);
        // 75% completion overall; recent days slightly less done
        var doneChance = offset <= 2 ? 0.55 : (offset <= 7 ? 0.7 : 0.85);
        var done = Math.random() < doneChance;
        // Spread creation within the day
        var hour = 9 + Math.floor(Math.random() * 10);
        var minute = Math.floor(Math.random() * 60);
        var isoCreated = date + 'T' + String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0') + ':00.000Z';

        var subtasks = [];
        // ~35% of seeded tasks get 1–3 subtasks for a realistic demo
        if (Math.random() < 0.35) {
          var subCount = 1 + Math.floor(Math.random() * 3);
          var subPool = ['Draft outline', 'Collect materials', 'First pass', 'Review & polish', 'Send for feedback', 'Final check', 'Take notes', 'Summarize'];
          var usedSubs = {};
          for (var s = 0; s < subCount; s++) {
            var st = subPool[Math.floor(Math.random() * subPool.length)];
            if (usedSubs[st]) continue;
            usedSubs[st] = true;
            // subtasks follow parent completion, with a slight lag
            var subDone = done && (s < subCount - (Math.random() < 0.3 ? 1 : 0));
            subtasks.push({
              id: idSeed + Math.floor(Math.random() * 1000000),
              text: st,
              done: subDone
            });
          }
        }

        seeded.push({
          id: idSeed + Math.floor(Math.random() * 100000),
          text: text,
          category: cat,
          done: done,
          date: date,
          addedDate: date,
          rolledOver: false,
          createdAt: isoCreated,
          subtasks: subtasks
        });
      }
    }

    todos = seeded;
    save();
    try { localStorage.setItem(SEED_FLAG_KEY, '1'); } catch (e) { /* ignore */ }
    if (_suppressSeed) Sync.setSuppress(false);
  }

  /* ---- CRUD ---- */
  function add(text, category) {
    // New tasks land on the currently viewed date (top-right date navigator),
    // not always today. addedDate records when it was actually created.
    var targetDate = viewDate || todayStr();
    var useCategory = category || currentCategory;
    const newId = Date.now() + Math.random();
    const createdNow = new Date().toISOString();
    const todo = {
      id: newId,
      taskChainId: newId,
      text: text.trim(),
      category: useCategory,
      priority: 'medium',
      done: false,
      date: targetDate,
      addedDate: todayStr(),
      rolledOver: false,
      parentRollover: null,
      createdAt: createdNow,
      updatedAt: createdNow,
      subtasks: []
    };
    todos.unshift(todo);
    save();
    renderCurrentView();
    return todo;
  }

  /* ---- Import past tasks ---- */
  function openImportModal() {
    var overlay = document.getElementById('import-modal-overlay');
    if (!overlay) return;
    importDefaultDate = todayStr();
    var dt = document.getElementById('import-default-date');
    if (dt) dt.value = importDefaultDate;
    var txt = document.getElementById('import-text');
    if (txt) txt.value = '';
    updateImportPreview();
    overlay.hidden = false;
    setTimeout(function () {
      var t = document.getElementById('import-text');
      if (t) t.focus();
    }, 80);
  }
  function closeImportModal() {
    var overlay = document.getElementById('import-modal-overlay');
    if (overlay) overlay.hidden = true;
  }
  /** Parse a single line. Returns {text, date, category} or null. */
  function parseImportLine(line) {
    var s = line.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
    if (!s || s.indexOf('#') === 0) return null;
    var date = '';
    var category = '';
    var done = false;
    var rest = s;
    var dm = rest.match(/^\[(\d{4}-\d{1,2}-\d{1,2})\]\s*/);
    if (dm) {
      var d = parseISODate(dm[1]);
      if (!d) return null;
      date = dm[1];
      rest = rest.slice(dm[0].length);
    }
    var cm = rest.match(/^\[([^\]]+)\]\s*/);
    if (cm) {
      var raw = cm[1].trim().toLowerCase();
      var map = { '工作': 'work', 'work': 'work', 'travail': 'work',
                  '学习': 'study', 'study': 'study', 'étude': 'study', 'etude': 'study',
                  '生活': 'life', 'life': 'life', 'vie': 'life',
                  '自媒体': 'media', '媒体': 'media', 'media': 'media', 'self-media': 'media', 'selfmedia': 'media',
                  'média': 'media', 'médias': 'media', 'medias': 'media' };
      // v1.9.1: optional completion flag (e.g. [✓] / [x] / [done]) in 2nd [..] slot
      if (raw === 'x' || raw === '\u2713' || raw === 'done' || raw === 'ok' || raw === 'y') {
        done = true;
      } else {
        category = map[raw] || map[mapLangCat(raw)] || importDefaultCat;
      }
      rest = rest.slice(cm[0].length);
    }
    rest = rest.trim();
    if (!rest) return null;
    return { text: rest, date: date || importDefaultDate, category: category || importDefaultCat, done: done };
  }
  /** Map localized category labels back to internal key. */
  function mapLangCat(raw) {
    var key = 'cat.' + raw;
    var lower = I18n.t(key) || '';
    if (lower === I18n.t('cat.work')) return 'work';
    if (lower === I18n.t('cat.study')) return 'study';
    if (lower === I18n.t('cat.life')) return 'life';
    if (lower === I18n.t('cat.media')) return 'media';
    return '';
  }
  function parseImportText(text) {
    if (!text) return [];
    var lines = text.split(/\r?\n/);
    var items = [];
    for (var i = 0; i < lines.length; i++) {
      var it = parseImportLine(lines[i]);
      if (it) items.push(it);
    }
    return items;
  }
  function updateImportPreview() {
    var text = (document.getElementById('import-text') || {}).value || '';
    var dtEl = document.getElementById('import-default-date');
    if (dtEl && dtEl.value) importDefaultDate = dtEl.value;
    importParsed = parseImportText(text);
    var numEl = document.getElementById('import-preview-num');
    var det = document.getElementById('import-preview-detail');
    if (numEl) numEl.textContent = importParsed.length;
    if (det) {
      if (importParsed.length > 0) {
        var byDate = {};
        for (var i = 0; i < importParsed.length; i++) {
          var d = importParsed[i].date;
          byDate[d] = (byDate[d] || 0) + 1;
        }
        var keys = Object.keys(byDate).sort();
        var parts = [];
        for (var j = 0; j < keys.length; j++) parts.push(fmtDate(keys[j]) + ' \u00d7' + byDate[keys[j]]);
        det.textContent = '\u00b7 ' + parts.join(', ');
      } else {
        det.textContent = '';
      }
    }
    var confirmBtn = document.getElementById('import-modal-confirm');
    if (confirmBtn) confirmBtn.disabled = importParsed.length === 0;
  }
  function commitImport() {
    if (!importParsed.length) {
      App.toast(I18n.t('import.successNone'), 'warn');
      return;
    }
    var ids = [];
    var now = new Date();
    for (var i = 0; i < importParsed.length; i++) {
      var it = importParsed[i];
      var isoStamp = it.date + 'T08:00:00';
      var t = {
        id: Date.now() + Math.random() + i,
        text: it.text,
        category: it.category,
        priority: 'medium',
        done: it.done || false,
        date: it.date,
        addedDate: it.date,
        rolledOver: false,
        createdAt: isoStamp,
        updatedAt: isoStamp,
        subtasks: []
      };
      t.taskChainId = t.id;
      todos.unshift(t);
      ids.push(t.id);
    }
    save();
    closeImportModal();
    renderCurrentView();
    App.toast(I18n.t('import.successN', { n: importParsed.length }), 'success');
  }

  /* ---- Rollover: carry unfinished past-due tasks to today ----
     v1.27 — changed from "move" to "copy + keep":
       The original past-due task is left untouched (still listed on its
       original date) and a fresh copy is created for today with
       `parentRollover` pointing back at the original. Completing any
       member of a rollover group marks the whole group done so the past-day
       record stops lingering as unfinished forever. Removing the original
       cascades and removes its copies so the chain stays consistent. */
  function rolloverOverdue() {
    var today = todayStr();
    var chains = buildTaskChains(todos.slice());
    var added = 0;
    for (var i = 0; i < chains.length; i++) {
      var chain = chains[i];
      if (chain.completed) continue;
      var source = null, hasToday = false;
      for (var j = 0; j < chain.members.length; j++) {
        var member = chain.members[j];
        if (member.date === today) hasToday = true;
        if (!member.done && member.date < today) source = member;
      }
      if (hasToday || !source) continue;
      // Old buggy copies without any parent link cannot be attached safely;
      // leave them untouched rather than guessing and duplicating history.
      if (source.rolledOver && source.parentRollover == null && source.taskChainId == null) continue;
      var copyId = Date.now() + Math.random() + i;
      var now = new Date().toISOString();
      var copy = {
        id: copyId,
        taskChainId: chain.id,
        text: source.text,
        category: source.category,
        priority: priorityOf(source),
        done: false,
        date: today,
        addedDate: chain.originalDate,
        originalDate: chain.originalDate,
        rolledOver: true,
        parentRollover: chain.id,
        rolloverFromId: source.id,
        rolloverIndex: chain.rolloverCount + 1,
        createdAt: now,
        updatedAt: now,
        subtasks: (source.subtasks || []).map(function (s) {
          return { id: Date.now() + Math.random(), text: s.text, done: !!s.done };
        })
      };
      todos.unshift(copy);
      added++;
    }
    if (added > 0) save();
    return added;
  }

  /** Mark every member of a rollover group as done when any member is
      checked off, so the original past-day entry doesn't linger as
      "unfinished forever". No-op when t is not part of any rollover group. */
  function syncRolloverGroup(t) {
    if (!t) return;
    var completed = !!t.done;
    var completedAt = completed ? new Date().toISOString() : '';
    for (var k = 0; k < todos.length; k++) {
      var x = todos[k];
      if (sameChain(x, t)) {
        x.done = completed;
        if (completed) {
          x.chainCompletedAt = completedAt;
          if (x === t) x.completedAt = completedAt;
        } else {
          delete x.chainCompletedAt;
          delete x.completedAt;
        }
        touchTodo(x);
      }
    }
  }

  function toggle(id) {
    var t = null;
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === id) { t = todos[i]; break; }
    }
    if (!t) return;
    t.done = !t.done;
    syncRolloverGroup(t);
    save();
    renderCurrentView();
  }

  function remove(id) {
    var target = null;
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === id) { target = todos[i]; break; }
    }
    if (!target) return;

    // Cascade: when removing an original that spawned rollover copies,
    // remove those copies too so the "carry-over" chain stays consistent.
    var idsToRemove = [id];
    if (!target.parentRollover) {
      for (var k = 0; k < todos.length; k++) {
        if (todos[k].parentRollover === id) idsToRemove.push(todos[k].id);
      }
    }

    // Record the deletion before the exit animation finishes. The synced
    // tombstone prevents older cloud/device copies from restoring this task.
    if (window.Sync && Sync.markTodosDeleted) Sync.markTodosDeleted(idsToRemove);

    var firstEl = document.querySelector('[data-todo-id="' + id + '"]');
    if (firstEl) {
      firstEl.classList.add('leaving');
      setTimeout(function () {
        todos = todos.filter(function (t) { return idsToRemove.indexOf(t.id) === -1; });
        save();
        renderCurrentView();
      }, 280);
    } else {
      todos = todos.filter(function (t) { return idsToRemove.indexOf(t.id) === -1; });
      save();
      renderCurrentView();
    }
  }

  function updateText(id, newText) {
    var todo = null;
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === id) { todo = todos[i]; break; }
    }
    if (todo && newText.trim()) {
      todo.text = newText.trim();
      touchTodo(todo);
      save();
      renderCurrentView();
    }
  }

  /* ---- Subtasks (nested under a first-level task) ---- */
  function findTodo(id) {
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === id) return todos[i];
    }
    return null;
  }

  function subtaskProgress(parent) {
    if (!parent.subtasks || parent.subtasks.length === 0) return null;
    var done = 0;
    for (var i = 0; i < parent.subtasks.length; i++) if (parent.subtasks[i].done) done++;
    return { done: done, total: parent.subtasks.length };
  }

  function addSubtask(parentId, text) {
    var parent = findTodo(parentId);
    if (!parent) return;
    text = (text || '').trim();
    if (!text) return;
    if (!Array.isArray(parent.subtasks)) parent.subtasks = [];
    parent.subtasks.push({
      id: Date.now() + Math.random(),
      text: text,
      done: false
    });
    touchTodo(parent);
    save();
    renderCurrentView();
    reopenSubtaskInput(parentId);
  }

  function toggleSubtask(parentId, subId) {
    var parent = findTodo(parentId);
    if (!parent || !parent.subtasks) return;
    var sub = null;
    for (var i = 0; i < parent.subtasks.length; i++) {
      if (parent.subtasks[i].id === subId) { sub = parent.subtasks[i]; break; }
    }
    if (sub) {
      sub.done = !sub.done;
      touchTodo(parent);
      save();
      renderCurrentView();
    }
  }

  function removeSubtask(parentId, subId) {
    var parent = findTodo(parentId);
    if (!parent || !parent.subtasks) return;
    parent.subtasks = parent.subtasks.filter(function (s) { return s.id !== subId; });
    touchTodo(parent);
    save();
    renderCurrentView();
  }

  function startAddSubtask(parentId) {
    var item = document.querySelector('.todo-item[data-todo-id="' + parentId + '"]');
    if (!item) { renderCurrentView(); item = document.querySelector('.todo-item[data-todo-id="' + parentId + '"]'); }
    if (!item) return;
    var area = item.querySelector('.subtask-area');
    if (!area) return;
    if (area.classList.contains('open')) {
      area.classList.remove('open');
      return;
    }
    area.classList.add('open');
    var input = area.querySelector('.subtask-input');
    if (input) { input.focus(); }
  }

  function reopenSubtaskInput(parentId) {
    var item = document.querySelector('.todo-item[data-todo-id="' + parentId + '"]');
    if (!item) return;
    var area = item.querySelector('.subtask-area');
    if (!area) return;
    area.classList.add('open');
    var input = area.querySelector('.subtask-input');
    if (input) { input.value = ''; input.focus(); }
  }

  function commitSubtask(e, parentId) {
    if (e && e.key && e.key !== 'Enter') return;
    var item = document.querySelector('.todo-item[data-todo-id="' + parentId + '"]');
    if (!item) return;
    var area = item.querySelector('.subtask-area');
    if (!area) return;
    var input = area.querySelector('.subtask-input');
    if (!input) return;
    addSubtask(parentId, input.value);
  }

  function startEditSubtask(parentId, subId) {
    var item = document.querySelector('.todo-item[data-todo-id="' + parentId + '"]');
    if (!item) return;
    var area = item.querySelector('.subtask-area');
    if (!area) return;
    var span = area.querySelector('.subtask-text[data-sub-id="' + subId + '"]');
    if (!span) return;
    var oldText = span.textContent;
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'subtask-inline-edit';
    input.value = oldText;
    input.maxLength = 80;
    function finish() {
      var newText = input.value.trim();
      if (newText && newText !== oldText) {
        var parent = findTodo(parentId);
        if (parent && parent.subtasks) {
          for (var i = 0; i < parent.subtasks.length; i++) {
            if (parent.subtasks[i].id === subId) { parent.subtasks[i].text = newText; break; }
          }
          touchTodo(parent);
          save();
          renderCurrentView();
        }
      } else {
        span.textContent = oldText;
        span.style.display = '';
        input.remove();
      }
    }
    input.addEventListener('blur', finish);
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') input.blur();
      if (ev.key === 'Escape') { span.textContent = oldText; span.style.display = ''; input.remove(); }
    });
    span.style.display = 'none';
    span.parentNode.insertBefore(input, span.nextSibling);
    input.focus();
    input.select();
  }

  /* ---- Rendering: render everything (single page, no tabs) ---- */
  function renderCurrentView() {
    renderDateNavigator();
    renderHeatmap();
    renderChecklist();
    // Archive moved to a modal (v1.8); no longer in main page render.
    renderDashboard();
    updateGlobalStats();
  }

  /* ---- Date navigator (chip + view-mode toggle) ---- */
  function renderDateNavigator() {
    var chipWd = document.getElementById('date-chip-weekday');
    var chipDay = document.getElementById('date-chip-day');
    var chipBadge = document.getElementById('date-chip-badge');
    var todayBtn = document.getElementById('date-today');
    if (!chipWd || !chipDay) return;
    chipWd.textContent = weekdayShort(viewDate);
    chipDay.textContent = dayMonthShort(viewDate);
    if (chipBadge) {
      if (isToday(viewDate)) {
        chipBadge.textContent = I18n.t('dn.todayBadge');
        chipBadge.hidden = false;
        chipBadge.className = 'date-chip-badge badge-today';
      } else if (isYesterday(viewDate)) {
        chipBadge.textContent = I18n.t('dn.yesterdayBadge');
        chipBadge.hidden = false;
        chipBadge.className = 'date-chip-badge badge-yesterday';
      } else {
        chipBadge.hidden = true;
      }
    }
    if (todayBtn) {
      todayBtn.style.display = isToday(viewDate) ? 'none' : '';
    }
    // Update filter pill counts (today vs selected date)
    var filterTotal = document.getElementById('todo-total');
    var filterDone = document.getElementById('todo-done');
    if (filterTotal && filterDone) {
      var dayTasks = todos.filter(function (t) { return t.date === viewDate; });
      var doneCount = 0;
      for (var k = 0; k < dayTasks.length; k++) if (dayTasks[k].done) doneCount++;
      filterTotal.textContent = dayTasks.length;
      filterDone.textContent = doneCount;
      var navCount = document.getElementById('nav-todo-count');
      if (navCount) navCount.textContent = dayTasks.length;
      if (typeof App !== 'undefined' && App.updateProgress) {
        App.updateProgress(doneCount, dayTasks.length);
      }
    }
    updateAddPlaceholder();
  }

  /* Reflect the currently viewed date in the add-input placeholder so it's
     obvious which day a new task will land on. */
  function updateAddPlaceholder() {
    var inp = document.getElementById('todo-input');
    if (!inp) return;
    inp.placeholder = addPlaceholderForView();
  }

  /* v1.35: identify only the generator signature used by the old demo.
     A matching title alone is never enough: generated records also have a
     date-aligned UTC timestamp with seconds/milliseconds fixed to zero. */
  function isLegacyDemoRoot(todo) {
    if (!todo || todo.rolledOver || todo.parentRollover != null) return false;
    if (!DEMO_TEXTS.has(todo.text)) return false;
    if (!todo.date || todo.addedDate !== todo.date || typeof todo.createdAt !== 'string') return false;
    var escapedDate = todo.date.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    var stamp = new RegExp('^' + escapedDate + 'T(?:0[9]|1[0-8]):[0-5][0-9]:00\\.000Z$');
    return stamp.test(todo.createdAt);
  }

  function demoCleanupPreview(list) {
    list = Array.isArray(list) ? list : todos;
    var roots = {}, ids = {}, samples = [];
    list.forEach(function (todo) {
      if (!isLegacyDemoRoot(todo)) return;
      roots[String(todo.id)] = true;
      ids[String(todo.id)] = true;
      samples.push({ id: todo.id, text: todo.text, date: todo.date, category: todo.category });
    });
    list.forEach(function (todo) {
      var chain = todo.taskChainId != null ? todo.taskChainId : todo.parentRollover;
      if (chain != null && roots[String(chain)]) ids[String(todo.id)] = true;
      if (todo.rolloverFromId != null && ids[String(todo.rolloverFromId)]) ids[String(todo.id)] = true;
    });
    var allIds = Object.keys(ids);
    return {
      rootCount: Object.keys(roots).length,
      copyCount: Math.max(0, allIds.length - Object.keys(roots).length),
      totalCount: allIds.length,
      ids: allIds,
      samples: samples.sort(function (a, b) { return a.date.localeCompare(b.date); })
    };
  }

  function cleanupDemoData() {
    var preview = demoCleanupPreview(todos);
    if (!preview.totalCount) return preview;
    if (window.Sync && Sync.markTodosDeleted) Sync.markTodosDeleted(preview.ids);
    var removing = {};
    preview.ids.forEach(function (id) { removing[String(id)] = true; });
    todos = todos.filter(function (todo) { return !removing[String(todo.id)]; });
    save();
    try {
      localStorage.setItem(SEED_FLAG_KEY, '1');
      localStorage.setItem(DEMO_CLEANUP_KEY, JSON.stringify({
        cleanedAt: new Date().toISOString(),
        roots: preview.rootCount,
        copies: preview.copyCount
      }));
    } catch (e) {}
    renderCurrentView();
    return preview;
  }

  function addPlaceholderForView() {
    var lang = (typeof I18n !== 'undefined' && I18n.getLang) ? I18n.getLang() : 'en';
    if (isToday(viewDate)) {
      return (typeof I18n !== 'undefined' && I18n.t) ? I18n.t('todo.placeholder') : 'What needs doing today?';
    }
    var dStr = dayMonthShort(viewDate);
    if (lang === 'zh') return '为 ' + dStr + ' 添加任务…';
    if (lang === 'fr') return 'Ajouter une tâche pour le ' + dStr + '…';
    return 'Add a task for ' + dStr + '…';
  }

  /* ---- Calendar popover ---- */
  function ensureCalAnchored() {
    var d = parseISODate(viewDate) || new Date();
    calYear = d.getFullYear();
    calMonth = d.getMonth() + 1;
  }
  function renderCalendar() {
    if (calYear == null || calMonth == null) ensureCalAnchored();
    var pop = document.getElementById('calendar-popover');
    if (!pop) return;
    var months = I18n.months();
    var weekdays = I18n.weekdays();
    var py = calYear, pm = calMonth;
    // First day of month (0=Sun..6=Sat). For grid, use Monday-start; produce a 7-col layout.
    var first = new Date(py, pm - 1, 1);
    var firstDay = first.getDay(); // 0..6 (Sun..Sat)
    var startOffset = (firstDay + 6) % 7; // Monday = 0
    var daysInMonth = new Date(py, pm, 0).getDate();
    var today = todayStr();
    var monthLabel = months[pm - 1] + ' ' + py;
    var html = '';
    html += '<div class="cal-header">' +
      '<button class="cal-nav-btn" id="cal-prev" data-i18n-title="cal.prevMonth" title="Previous month">' +
        '<svg class="ico" aria-hidden="true"><use href="#i-chevron-left"/></svg>' +
      '</button>' +
      '<span class="cal-month-label">' + escapeHtml(monthLabel) + '</span>' +
      '<button class="cal-nav-btn" id="cal-next" data-i18n-title="cal.nextMonth" title="Next month">' +
        '<svg class="ico" aria-hidden="true"><use href="#i-chevron-right"/></svg>' +
      '</button>' +
      '</div>';
    html += '<div class="cal-weekdays">';
    // Show Mon..Sun
    var wkOrder = [1, 2, 3, 4, 5, 6, 0];
    for (var i = 0; i < 7; i++) {
      var idx = wkOrder[i];
      html += '<span class="cal-wd">' + escapeHtml(weekdays[idx]) + '</span>';
    }
    html += '</div>';
    html += '<div class="cal-grid">';
    // Pad before
    for (var p = 0; p < startOffset; p++) html += '<span class="cal-cell empty"></span>';
    for (var d = 1; d <= daysInMonth; d++) {
      var iso = py + '-' + String(pm).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      var hasTask = false;
      for (var t = 0; t < todos.length; t++) {
        if (todos[t].date === iso) { hasTask = true; break; }
      }
      var cls = 'cal-cell';
      if (iso === today) cls += ' is-today';
      if (iso === viewDate) cls += ' is-selected';
      var dot = hasTask ? '<span class="cal-dot"></span>' : '';
      html += '<button class="' + cls + '" data-date="' + iso + '"><span class="cal-day">' + d + '</span>' + dot + '</button>';
    }
    // pad after to fill last row
    var total = startOffset + daysInMonth;
    var padAfter = (7 - (total % 7)) % 7;
    for (var px = 0; px < padAfter; px++) html += '<span class="cal-cell empty"></span>';
    html += '</div>';
    pop.innerHTML = html;
    pop.dataset.open = '1';

    // Wire handlers
    var prev = document.getElementById('cal-prev');
    var next = document.getElementById('cal-next');
    if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); shiftCal(-1); });
    if (next) next.addEventListener('click', function (e) { e.stopPropagation(); shiftCal(1); });
    var cells = pop.querySelectorAll('.cal-cell[data-date]');
    for (var c = 0; c < cells.length; c++) {
      cells[c].addEventListener('click', function (e) {
        e.stopPropagation();
        var d = this.dataset.date;
        setViewDate(d);
        closeCalendar();
        renderCurrentView();
      });
    }
  }
  function shiftCal(delta) {
    var d = new Date(calYear, calMonth - 1 + delta, 1);
    calYear = d.getFullYear();
    calMonth = d.getMonth() + 1;
    renderCalendar();
  }
  function openCalendar() {
    ensureCalAnchored();
    var pop = document.getElementById('calendar-popover');
    if (!pop) return;
    renderCalendar();
    pop.hidden = false;
    // Click-outside
    setTimeout(function () {
      document.addEventListener('click', onDocClickCloseCal, { once: false });
    }, 50);
    document.addEventListener('keydown', onEscCloseCal);
  }
  function closeCalendar() {
    var pop = document.getElementById('calendar-popover');
    if (pop) pop.hidden = true;
    document.removeEventListener('click', onDocClickCloseCal);
    document.removeEventListener('keydown', onEscCloseCal);
  }
  function onDocClickCloseCal(e) {
    var pop = document.getElementById('calendar-popover');
    var chip = document.getElementById('date-chip');
    if (!pop || !chip) return;
    if (pop.contains(e.target) || chip.contains(e.target)) return;
    closeCalendar();
  }
  function onEscCloseCal(e) {
    if (e.key === 'Escape') closeCalendar();
  }

  /* ---- View navigation ---- */
  function setViewDate(dateStr) {
    var d = parseISODate(dateStr);
    if (!d) return;
    var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    viewDate = iso;
    calYear = d.getFullYear();
    calMonth = d.getMonth() + 1;
  }
  function shiftViewDate(days) {
    var d = parseISODate(viewDate) || new Date();
    d.setDate(d.getDate() + days);
    setViewDate(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
  }
  function goToday() {
    setViewDate(todayStr());
  }

  /* ---- View: Checklist — always filtered to selected date ---- */
  function renderChecklist() {
    var container = document.getElementById('todo-grouped');
    var empty = document.getElementById('todo-empty');
    if (!container || !empty) return;

    // 1) Apply category filter, then restrict to selected date
    var dayTasksAll = todos.filter(function (t) { return t.date === viewDate; });
    var visible = todos;
    if (currentFilter !== 'all') {
      visible = todos.filter(function (t) { return t.category === currentFilter; });
    }
    visible = visible.filter(function (t) { return t.date === viewDate; });
    if (hideCompleted) {
      visible = visible.filter(function (t) { return !t.done; });
    }

    updateEmptyState(dayTasksAll, visible);

    renderFocusSummary();

    // 3) Group by date descending (today first, then yesterday, etc.)
    var byDate = {};
    for (var i = 0; i < visible.length; i++) {
      var t = visible[i];
      if (!byDate[t.date]) byDate[t.date] = [];
      byDate[t.date].push(t);
    }
    var dates = Object.keys(byDate).sort(function (a, b) { return b < a ? -1 : b > a ? 1 : 0; });

    // Rollover banner (only when viewing today)
    var banner = document.getElementById('rollover-banner');
    var bannerText = document.getElementById('rollover-text');
    if (banner && bannerText) {
      var dayTasks = byDate[viewDate] || [];
      var rolledNow = 0;
      for (var ri = 0; ri < dayTasks.length; ri++) {
        if (dayTasks[ri].rolledOver && !dayTasks[ri].done) rolledNow++;
      }
      if (rolledNow > 0 && isToday(viewDate)) {
        banner.style.display = 'flex';
        bannerText.textContent = I18n.t('todo.rolloverBanner', { n: rolledNow });
      } else {
        banner.style.display = 'none';
      }
    }

    // 4) Render flat list with date dividers (no card boxes).
    //    v1.27: the empty-state placeholder was replaced by a persistent
    //    quick-add row appended after the last group, so users always see a
    //    single, obvious way to add a task — whether the date already has
    //    items or not. The "+" filter-pill button now scrolls/focuses this
    //    row instead of the top add-bar input.
    if (dates.length === 0) {
      container.innerHTML = buildQuickAddRow();
      return;
    }
    var html = '';
    for (var d = 0; d < dates.length; d++) {
      var date = dates[d];
      var items = byDate[date];
      var done = 0;
      for (var k = 0; k < items.length; k++) if (items[k].done) done++;
      var isTodayFlag = isToday(date);

      html += '<div class="date-group' + (isTodayFlag ? ' is-today' : '') + '" data-date="' + date + '">';
      html += '<div class="date-group-header">' +
        '<span class="date-group-bullet"></span>' +
        '<span class="date-group-date">' + escapeHtml(dateLabel(date)) + '</span>' +
        '<span class="date-group-full">' + escapeHtml(fmtDate(date)) + '</span>' +
        '<span class="date-group-meta">' +
          '<span class="date-group-count">' + done + '/' + items.length + '</span>' +
        '</span>' +
      '</div>';

      html += renderItemsByCategory(items);
      html += '</div>';
    }
    container.innerHTML = html + buildQuickAddRow();
  }

  function updateEmptyState(dayTasks, visible) {
    var empty = document.getElementById('todo-empty');
    if (!empty) return;
    var title = empty.querySelector('.empty-title');
    var hint = empty.querySelector('.empty-hint');
    var primary = document.getElementById('todo-empty-primary');
    var secondary = document.getElementById('todo-empty-secondary');
    var filtered = dayTasks;
    if (currentFilter !== 'all') filtered = dayTasks.filter(function (t) { return t.category === currentFilter; });
    var allDone = dayTasks.length > 0 && dayTasks.every(function (t) { return t.done; });
    emptyMode = '';
    if (dayTasks.length === 0) emptyMode = 'blank';
    else if (allDone || (filtered.length > 0 && filtered.every(function (t) { return t.done; }) && visible.length === 0)) emptyMode = 'complete';
    else if (currentFilter !== 'all' && filtered.length === 0) emptyMode = 'filter';

    empty.classList.toggle('show', !!emptyMode);
    empty.classList.toggle('is-complete', emptyMode === 'complete');
    if (!emptyMode) return;
    if (title) title.removeAttribute('data-i18n');
    if (hint) hint.removeAttribute('data-i18n');
    if (primary) primary.textContent = I18n.t('todo.emptyAddAction');
    if (emptyMode === 'blank') {
      if (title) title.textContent = I18n.t('todo.emptyDateTitle');
      if (hint) hint.textContent = I18n.t('todo.emptyDateHint');
      if (secondary) {
        secondary.hidden = isToday(viewDate);
        secondary.textContent = I18n.t('dn.todayBtn');
      }
    } else if (emptyMode === 'complete') {
      if (title) title.textContent = I18n.t('todo.allDoneTitle');
      if (hint) hint.textContent = I18n.t('todo.allDoneHint');
      if (secondary) {
        secondary.hidden = false;
        secondary.textContent = I18n.t(hideCompleted ? 'todo.showCompleted' : 'todo.hideCompleted');
      }
    } else {
      if (title) title.textContent = I18n.t('todo.emptyFilterTitle');
      if (hint) hint.textContent = I18n.t('todo.emptyFilterHint');
      if (secondary) {
        secondary.hidden = false;
        secondary.textContent = I18n.t('archive.all');
      }
    }
  }

  function focusQuickAdd() {
    var qa = document.querySelector('#todo-grouped .quick-add-input');
    var fallback = document.getElementById('todo-input');
    var target = qa || fallback;
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () { target.focus(); }, 220);
  }

  function emptyPrimary() { focusQuickAdd(); }

  function emptySecondary() {
    if (emptyMode === 'blank') {
      goToday();
      renderCurrentView();
    } else if (emptyMode === 'complete') {
      hideCompleted = !hideCompleted;
      renderChecklist();
    } else if (emptyMode === 'filter') {
      currentFilter = 'all';
      var tabs = document.querySelectorAll('#section-daily .todo-tab[data-filter]');
      for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('active', tabs[i].dataset.filter === 'all');
      renderChecklist();
    }
  }

  /* Display-only day summary. Reads the selected day's tasks but never mutates
     or persists them, so upgrades cannot rewrite historical task records. */
  function renderFocusSummary() {
    var value = document.getElementById('focus-summary-value');
    var progress = document.getElementById('focus-summary-progress');
    var toggle = document.getElementById('todo-hide-completed');
    var dayTasks = [];
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].date === viewDate) dayTasks.push(todos[i]);
    }
    var done = 0;
    for (var j = 0; j < dayTasks.length; j++) if (dayTasks[j].done) done++;
    var remaining = dayTasks.length - done;
    var pct = dayTasks.length ? Math.round(done / dayTasks.length * 100) : 0;
    if (value) {
      value.textContent = I18n.t('todo.daySummary', {
        remaining: remaining,
        done: done,
        total: dayTasks.length
      });
    }
    if (progress) progress.style.width = pct + '%';
    if (toggle) {
      toggle.setAttribute('aria-pressed', hideCompleted ? 'true' : 'false');
      toggle.classList.toggle('is-active', hideCompleted);
      var label = toggle.querySelector('span');
      if (label) {
        var key = hideCompleted ? 'todo.showCompleted' : 'todo.hideCompleted';
        label.textContent = I18n.t(key);
        label.setAttribute('data-i18n', key);
      }
    }
  }

  /* v1.28: Render order for category sub-groups inside a single date group.
     Tasks of unknown categories are pushed to the end (defensive — only
     happens if a foreign key ever sneaks into localStorage). */
  var CAT_RENDER_ORDER = ['work', 'media', 'life', 'study'];

  function renderItemsByCategory(items) {
    var html = '';
    if (!items.length) return html;
    // Bucket by category while remembering first-seen order for unknown cats.
    var byCat = {};
    var seenOrder = [];
    for (var i = 0; i < items.length; i++) {
      var c = items[i].category || 'life';
      if (!byCat[c]) { byCat[c] = []; seenOrder.push(c); }
      byCat[c].push(items[i]);
    }
    // Final ordered list: known cats first in CAT_RENDER_ORDER, then unknowns.
    var ordered = [];
    for (var ci = 0; ci < CAT_RENDER_ORDER.length; ci++) {
      if (byCat[CAT_RENDER_ORDER[ci]]) ordered.push(CAT_RENDER_ORDER[ci]);
    }
    for (var si = 0; si < seenOrder.length; si++) {
      if (ordered.indexOf(seenOrder[si]) === -1) ordered.push(seenOrder[si]);
    }
    var showSub = ordered.length > 1;
    for (var oi = 0; oi < ordered.length; oi++) {
      var cat = ordered[oi];
      var list = sortTaskList(byCat[cat]);
      var catDone = 0;
      for (var li = 0; li < list.length; li++) if (list[li].done) catDone++;
      if (showSub) {
        html += '<div class="cat-subgroup-header" data-cat="' + cat + '">' +
          '<span class="cat-subgroup-dot ' + cat + '"></span>' +
          '<span class="cat-subgroup-name">' + escapeHtml(catLabel(cat)) + '</span>' +
          '<span class="cat-subgroup-count">' + catDone + '/' + list.length + '</span>' +
        '</div>';
      }
      for (var ti = 0; ti < list.length; ti++) {
        html += todoItemHTML(list[ti]);
      }
    }
    return html;
  }

  function sortTaskList(list) {
    var indexed = [];
    for (var i = 0; i < list.length; i++) indexed.push({ task: list[i], index: i });
    indexed.sort(function (a, b) {
      var priorityDiff = PRIORITY_RANK[priorityOf(a.task)] - PRIORITY_RANK[priorityOf(b.task)];
      if (priorityDiff !== 0) return priorityDiff;
      var ao = (typeof a.task.sortOrder === 'number') ? a.task.sortOrder : Number.MAX_SAFE_INTEGER;
      var bo = (typeof b.task.sortOrder === 'number') ? b.task.sortOrder : Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.index - b.index;
    });
    return indexed.map(function (entry) { return entry.task; });
  }

  /* ---- Persistent quick-add row (v1.27) ----
     Lives at the very bottom of the checklist (and is the sole contents
     when no date groups exist). Sits inside #todo-grouped so the same
     event-delegation listeners used for swipe / filter pills also catch
     its Enter/submit behavior. */
  function buildQuickAddRow() {
    return '<div class="quick-add-row">' +
      '<span class="quick-add-icon"><svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg></span>' +
      '<input class="quick-add-input" type="text" maxlength="100" placeholder="' + escapeHtml(addPlaceholderForView()) + '" />' +
    '</div>';
  }

  /* ---- Single todo-item HTML (shared by renderChecklist) ---- */
  function todoItemHTML(todo) {
    var completedClass = todo.done ? ' completed' : '';
    var rolled = (todo.rolledOver && !todo.done);
    var rolledClass = rolled ? ' rolled-over' : '';
    var priority = priorityOf(todo);
    var rollLabel = todo.rolloverIndex > 1
      ? I18n.t('todo.rolledBadgeN', { n: todo.rolloverIndex }) : I18n.t('todo.rolledBadge');
    var badge = rolled ? '<span class="todo-roll-badge">' + escapeHtml(rollLabel) + '</span>' : '';
    var addedTag = '<span class="todo-added-tag' + (rolled ? ' strong' : '') + '">' +
      '<svg class="ico" aria-hidden="true"><use href="#i-clock"/></svg> ' +
      escapeHtml(fmtDateCN(todo.addedDate)) + ' ' + escapeHtml(I18n.t('todo.addedSuffix')) +
      '</span>';

    // Subtask progress pill (only when subtasks exist)
    var prog = subtaskProgress(todo);
    var progPill = '';
    if (prog) {
      var allDone = (prog.done === prog.total);
      progPill = '<span class="todo-subtask-pill' + (allDone ? ' all-done' : '') + '" title="' +
        escapeHtml(I18n.t('todo.subtaskProgress', { done: prog.done, total: prog.total })) + '">' +
        '<svg class="ico" aria-hidden="true"><use href="#i-subtask"/></svg>' +
        prog.done + '/' + prog.total + '</span>';
    }

    // Subtask list HTML
    var subtaskHTML = '';
    if (todo.subtasks && todo.subtasks.length) {
      for (var si = 0; si < todo.subtasks.length; si++) {
        var st = todo.subtasks[si];
        subtaskHTML += '<div class="subtask-item' + (st.done ? ' completed' : '') + '" data-sub-id="' + st.id + '">' +
          '<span class="subtask-check" onclick="TodoList.toggleSubtask(' + todo.id + ', ' + st.id + ')">' +
            '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' +
          '</span>' +
          '<span class="subtask-text" data-sub-id="' + st.id + '" ondblclick="TodoList.startEditSubtask(' + todo.id + ', ' + st.id + ')">' + escapeHtml(st.text) + '</span>' +
          '<button class="subtask-delete" onclick="TodoList.removeSubtask(' + todo.id + ', ' + st.id + ')" title="Delete">' +
            '<svg class="ico" aria-hidden="true"><use href="#i-close"/></svg>' +
          '</button>' +
        '</div>';
      }
    }

    var addRow = '<div class="subtask-add">' +
      '<span class="subtask-add-icon"><svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg></span>' +
      '<input class="subtask-input" type="text" maxlength="80" data-i18n-ph="todo.subtaskPlaceholder" placeholder="' + escapeHtml(I18n.t('todo.subtaskPlaceholder')) + '" onkeydown="TodoList.commitSubtask(event, ' + todo.id + ')">' +
      '<button class="subtask-add-btn" onclick="TodoList.commitSubtask(event, ' + todo.id + ')">' + escapeHtml(I18n.t('todo.addSubtaskShort')) + '</button>' +
    '</div>';

    // Group meta (date-added + category + subtask progress) so mobile can
    // float it to top-right via absolute positioning. Hidden when empty.
    // The cat tag is clickable so the user can re-categorize a task in place.
    var catTag = '<span class="todo-cat-tag ' + todo.category + ' clickable" ' +
      'onclick="event.stopPropagation(); TodoList.startChangeCategory(' + todo.id + ', this)" ' +
      'title="Click to change category">' +
      escapeHtml(catLabel(todo.category)) + '</span>';
    var priorityTag = '<span class="todo-priority-tag ' + priority + '" ' +
      'onclick="event.stopPropagation(); TodoList.startChangePriority(' + todo.id + ', this)" ' +
      'title="' + escapeHtml(I18n.t('todo.changePriority')) + '">' +
      '<span class="priority-dot"></span><span class="priority-label">' + escapeHtml(priorityLabel(priority)) + '</span></span>';
    var metaParts = badge + priorityTag + addedTag + catTag + progPill;
    var metaBlock = '<div class="todo-meta">' + metaParts + '</div>';

    // Group the three action buttons so mobile can swipe-reveal them as a
    // unit (desktop still reveals them on hover via existing rules).
    var actionsBlock = '<div class="todo-actions">' +
      '<button class="todo-subtask-btn" onclick="TodoList.startAddSubtask(' + todo.id + ')" title="' + escapeHtml(I18n.t('todo.addSubtask')) + '">' +
        '<svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg>' +
      '</button>' +
      '<button class="todo-edit-btn" onclick="TodoList.startEdit(' + todo.id + ')" title="Edit">' +
        '<svg class="ico" aria-hidden="true"><use href="#i-pencil"/></svg>' +
      '</button>' +
      '<button class="todo-delete" onclick="TodoList.remove(' + todo.id + ')" title="Delete">' +
        '<svg class="ico" aria-hidden="true"><use href="#i-close"/></svg>' +
      '</button>' +
    '</div>';

    var dragLabel = escapeHtml(I18n.t('todo.dragToReorder'));
    var dragHandle = '<span class="todo-drag-handle" draggable="true" tabindex="0" role="button" ' +
      'title="' + dragLabel + '" aria-label="' + dragLabel + '"><span aria-hidden="true">⠿</span></span>';

    return '<div class="todo-item' + completedClass + rolledClass + ' entering" data-todo-id="' + todo.id + '" data-cat="' + todo.category + '" data-priority="' + priority + '">' +
      '<div class="todo-main">' +
        dragHandle +
        '<div class="todo-checkbox" onclick="TodoList.toggle(' + todo.id + ')">' +
          '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' +
        '</div>' +
        '<span class="todo-text" data-todo-id="' + todo.id + '" onclick="TodoList.startEdit(' + todo.id + ')" title="Click to edit">' + escapeHtml(todo.text) + '</span>' +
        metaBlock +
        actionsBlock +
      '</div>' +
      '<div class="subtask-area' + (todo.subtasks && todo.subtasks.length ? ' has-subs' : '') + '">' +
        '<div class="subtask-list">' + subtaskHTML + '</div>' +
        addRow +
      '</div>' +
    '</div>';
  }

  /* ---- Inline Edit ---- */
  function startEdit(id) {
    var span = document.querySelector('.todo-text[data-todo-id="' + id + '"]');
    if (!span) return;
    var oldText = span.textContent;
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-inline-edit';
    input.value = oldText;
    input.maxLength = 100;

    function finish() {
      var newText = input.value.trim();
      if (newText && newText !== oldText) {
        updateText(id, newText);
      } else {
        span.textContent = oldText;
        span.style.display = '';
        input.remove();
      }
    }

    input.addEventListener('blur', finish);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { input.blur(); }
      if (e.key === 'Escape') {
        span.textContent = oldText;
        span.style.display = '';
        input.remove();
      }
    });

    span.style.display = 'none';
    span.parentNode.insertBefore(input, span.nextSibling);
    input.focus();
    input.select();
  }

  /* ---- Inline Category Change ----
     Click the .todo-cat-tag to open a small popover with the 4 category
     choices. Click an option to apply, click outside to dismiss. */
  function startChangeCategory(id, anchor) {
    // Close any other open popovers first
    var existing = document.querySelector('.cat-popover');
    if (existing) existing.remove();

    var todo = findTodo(id);
    if (!todo) return;

    var pop = document.createElement('div');
    pop.className = 'cat-popover';
    var cats = ['work', 'media', 'life', 'study'];
    var html = '';
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      var isCur = (c === todo.category);
      html += '<button type="button" class="cat-popover-opt' + (isCur ? ' is-current' : '') +
        '" data-cat="' + c + '">' +
        '<span class="cat-popover-dot ' + c + '"></span>' +
        '<span class="cat-popover-label">' + escapeHtml(catLabel(c)) + '</span>' +
        (isCur ? '<svg class="cat-popover-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : '') +
      '</button>';
    }
    pop.innerHTML = html;

    document.body.appendChild(pop);

    // Position: prefer below-right of anchor, flip / clamp to viewport.
    var rect = anchor.getBoundingClientRect();
    var popRect = pop.getBoundingClientRect();
    var margin = 8;
    var top = rect.bottom + margin;
    var left = rect.right - popRect.width;
    if (left < margin) left = margin;
    if (left + popRect.width > window.innerWidth - margin) {
      left = window.innerWidth - popRect.width - margin;
    }
    if (top + popRect.height > window.innerHeight - margin) {
      top = rect.top - popRect.height - margin;
      if (top < margin) top = margin;
    }
    pop.style.position = 'fixed';
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
    pop.classList.add('show');

    pop.addEventListener('click', function (e) {
      var btn = e.target.closest('.cat-popover-opt');
      if (!btn) return;
      var newCat = btn.getAttribute('data-cat');
      commitCategoryChange(id, newCat);
      closePopover();
    });

    function onDocClick(ev) {
      if (pop.contains(ev.target) || ev.target === anchor) return;
      closePopover();
    }
    function onKey(ev) {
      if (ev.key === 'Escape') closePopover();
    }
    function closePopover() {
      pop.remove();
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onKey);
    }
    setTimeout(function () {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('touchstart', onDocClick);
      document.addEventListener('keydown', onKey);
    }, 0);
  }

  function commitCategoryChange(id, newCat) {
    var t = findTodo(id);
    if (!t) return;
    if (t.category === newCat) return;
    t.category = newCat;
    delete t.sortOrder;
    touchTodo(t);
    save();
    renderCurrentView();
  }

  /* ---- Priority and manual ordering (v1.31) ---- */
  function startChangePriority(id, anchor) {
    var existing = document.querySelector('.cat-popover');
    if (existing) existing.remove();
    var todo = findTodo(id);
    if (!todo) return;

    var pop = document.createElement('div');
    pop.className = 'cat-popover priority-popover';
    var current = priorityOf(todo);
    var html = '';
    for (var i = 0; i < PRIORITY_ORDER.length; i++) {
      var p = PRIORITY_ORDER[i];
      var isCurrent = p === current;
      html += '<button type="button" class="cat-popover-opt priority-popover-opt' + (isCurrent ? ' is-current' : '') +
        '" data-priority="' + p + '">' +
        '<span class="priority-popover-dot ' + p + '"></span>' +
        '<span class="cat-popover-label">' + escapeHtml(priorityLabel(p)) + '</span>' +
        (isCurrent ? '<svg class="cat-popover-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : '') +
      '</button>';
    }
    pop.innerHTML = html;
    document.body.appendChild(pop);

    var rect = anchor.getBoundingClientRect();
    var popRect = pop.getBoundingClientRect();
    var margin = 8;
    var top = rect.bottom + margin;
    var left = rect.right - popRect.width;
    if (left < margin) left = margin;
    if (left + popRect.width > window.innerWidth - margin) left = window.innerWidth - popRect.width - margin;
    if (top + popRect.height > window.innerHeight - margin) top = Math.max(margin, rect.top - popRect.height - margin);
    pop.style.position = 'fixed';
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
    pop.classList.add('show');

    pop.addEventListener('click', function (e) {
      var btn = e.target.closest('.priority-popover-opt');
      if (!btn) return;
      commitPriorityChange(id, btn.getAttribute('data-priority'));
      closePopover();
    });
    function onDocClick(e) {
      if (pop.contains(e.target) || e.target === anchor) return;
      closePopover();
    }
    function onKey(e) { if (e.key === 'Escape') closePopover(); }
    function closePopover() {
      pop.remove();
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
      document.removeEventListener('keydown', onKey);
    }
    setTimeout(function () {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('touchstart', onDocClick);
      document.addEventListener('keydown', onKey);
    }, 0);
  }

  function commitPriorityChange(id, newPriority) {
    if (PRIORITY_ORDER.indexOf(newPriority) < 0) return;
    var todo = findTodo(id);
    if (!todo || priorityOf(todo) === newPriority) return;
    todo.priority = newPriority;
    touchTodo(todo);
    var group = getReorderGroup(todo);
    var minOrder = 0;
    for (var i = 0; i < group.length; i++) {
      if (group[i].id !== todo.id && typeof group[i].sortOrder === 'number') {
        minOrder = Math.min(minOrder, group[i].sortOrder);
      }
    }
    todo.sortOrder = minOrder - 100;
    save();
    renderCurrentView();
  }

  function getReorderGroup(todo) {
    var group = [];
    var priority = priorityOf(todo);
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].date === todo.date && todos[i].category === todo.category && priorityOf(todos[i]) === priority) {
        group.push(todos[i]);
      }
    }
    return sortTaskList(group);
  }

  function canReorder(source, target) {
    return !!(source && target && source.id !== target.id &&
      source.date === target.date && source.category === target.category &&
      priorityOf(source) === priorityOf(target));
  }

  function reorderTask(sourceId, targetId, placeAfter) {
    var source = findTodo(sourceId);
    var target = findTodo(targetId);
    if (!canReorder(source, target)) return false;
    var group = getReorderGroup(source);
    var sourceIndex = group.indexOf(source);
    var targetIndex = group.indexOf(target);
    if (sourceIndex < 0 || targetIndex < 0) return false;
    group.splice(sourceIndex, 1);
    targetIndex = group.indexOf(target);
    group.splice(targetIndex + (placeAfter ? 1 : 0), 0, source);
    for (var i = 0; i < group.length; i++) {
      group[i].sortOrder = i * 100;
      touchTodo(group[i]);
    }
    save();
    renderChecklist();
    return true;
  }

  function moveTaskByKeyboard(id, direction) {
    var todo = findTodo(id);
    if (!todo) return;
    var group = getReorderGroup(todo);
    var index = group.indexOf(todo);
    var targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= group.length) return;
    var target = group[targetIndex];
    if (reorderTask(id, target.id, direction > 0)) {
      setTimeout(function () {
        var handle = document.querySelector('[data-todo-id="' + id + '"] .todo-drag-handle');
        if (handle) handle.focus();
      }, 0);
    }
  }

  /* ---- Workload Heatmap (GitHub-style) ----
     Renders the past ~53 weeks (one year) of activity as a 7-row grid.
     Each cell's intensity (0-4) reflects the number of tasks completed that day.
  */
  function renderHeatmap() {
    var monthsEl = document.getElementById('heatmap-months');
    var grid = document.getElementById('heatmap-grid');
    var activeEl = document.getElementById('heatmap-active-days');
    var totalEl = document.getElementById('heatmap-total-tasks');
    if (!grid) return;

    // Count completed task chains, not every rollover copy.
    var byDay = {};
    var totalDone = 0;
    var activeDays = 0;
    var chains = buildTaskChains();
    for (var i = 0; i < chains.length; i++) {
      var chain = chains[i];
      if (!chain.completed || !chain.completionDate) continue;
      totalDone++;
      if (!byDay[chain.completionDate]) byDay[chain.completionDate] = 0;
      byDay[chain.completionDate]++;
    }
    for (var d in byDay) if (byDay[d] > 0) activeDays++;
    if (activeEl) activeEl.textContent = activeDays;
    if (totalEl) totalEl.textContent = totalDone;

    // Build a calendar for the last 53 weeks ending today.
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var dayOfWeek = today.getDay(); // 0 = Sunday
    // Monday-starting columns:
    var colStartOffset = (dayOfWeek + 6) % 7; // days since this week's Monday (0 = Mon)
    var totalDays = 53 * 7; // 53 weeks of full rows
    var start = new Date(today);
    start.setDate(start.getDate() - colStartOffset - 52 * 7);

    // Build month labels: position under each cell column whose week begins a new month
    var months = [];
    var seenMonths = {};
    var cursor = new Date(start);
    var totalCols = 53;
    for (var c = 0; c < totalCols; c++) {
      var d0 = new Date(cursor);
      var m = d0.getMonth();
      var y = d0.getFullYear();
      var key = y + '-' + m;
      if (!seenMonths[key]) {
        seenMonths[key] = true;
        months.push({ col: c, label: monthShortName(m) });
      }
      cursor.setDate(cursor.getDate() + 7);
    }

    if (monthsEl) {
      var monthsHTML = '';
      for (var mi = 0; mi < months.length; mi++) {
        var cellLeft = months[mi].col * 16; // 13px cell + 3px gap
        monthsHTML += '<span style="left:' + cellLeft + 'px">' + escapeHtml(months[mi].label) + '</span>';
      }
      monthsEl.innerHTML = monthsHTML;
    }

    // Render cells
    var cellsHTML = '';
    var cursorDate = new Date(start);
    var todayISO = todayStr();
    for (var i2 = 0; i2 < totalDays; i2++) {
      var iso = cursorDate.getFullYear() + '-' +
        String(cursorDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(cursorDate.getDate()).padStart(2, '0');
      var count = byDay[iso] || 0;
      var level = count === 0 ? 0 : (count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4);
      var cls = 'heatmap-cell h' + level;
      var isTodayCls = (iso === todayISO) ? ' today' : '';
      var tipAttr = '';
      if (count > 0 || iso === todayISO) {
        tipAttr = ' data-tip="' + count + ' on ' + escapeHtml(fmtShort(iso)) + (iso === todayISO ? ' (today)' : '') + '"';
      }
      cellsHTML += '<span class="' + cls + isTodayCls + '"' + tipAttr + '></span>';
      cursorDate.setDate(cursorDate.getDate() + 1);
    }
    grid.innerHTML = cellsHTML;
  }

  function monthShortName(m) {
    var names = I18n.months();
    return names[m] || '';
  }

  /* ---- View: Archive (kept, flat) ---- */
  function renderArchive() {
    var list = document.getElementById('archive-list');
    var empty = document.getElementById('archive-empty');
    if (!list || !empty) return;

    var today = todayStr();
    var recent7Start = shiftDate(today, -6); // today excluded; include yesterday + 6 prior days
    var dateMap = {};
    var hasAny = false;
    for (var i = 0; i < todos.length; i++) {
      var t = todos[i];
      // Mode-based date filter
      if (archiveMode === 'date') {
        if (t.date !== archiveSelectedDate) continue;
      } else {
        // recent7: include up to 7 most recent past days, exclude today (lives in checklist)
        if (t.date >= today) continue;
        if (t.date < recent7Start) continue;
      }
      if (archiveCat !== 'all' && t.category !== archiveCat) continue;
      if (archiveSearch) {
        var lower = t.text.toLowerCase();
        if (lower.indexOf(archiveSearch.toLowerCase()) === -1) continue;
      }
      if (!dateMap[t.date]) dateMap[t.date] = { done: 0, total: 0, items: [] };
      dateMap[t.date].items.push(t);
      dateMap[t.date].total++;
      if (t.done) dateMap[t.date].done++;
      hasAny = true;
    }

    if (!hasAny) {
      list.innerHTML = '';
      empty.classList.add('show');
      // Adapt empty-state copy to current filter mode
      var eTitle = document.getElementById('archive-empty-title');
      var eHint = document.getElementById('archive-empty-hint');
      if (eTitle) eTitle.textContent = I18n.t(archiveMode === 'date' ? 'archive.emptyFilterTitle' : 'archive.emptyTitle');
      if (eHint) eHint.textContent = I18n.t(archiveMode === 'date' ? 'archive.emptyFilterHint' : 'archive.emptyHint');
      return;
    }
    empty.classList.remove('show');

    var dates = Object.keys(dateMap).sort().reverse();
    var html = '';
    for (var d = 0; d < dates.length; d++) {
      var date = dates[d];
      var group = dateMap[date];
      var isTodayFlag = false; // archive never shows today
      html += '<div class="archive-group' + (isTodayFlag ? ' is-today' : '') + '" data-date="' + date + '">' +
        '<div class="archive-group-header">' +
          '<span class="archive-bullet"></span>' +
          '<span class="archive-date-title">' + escapeHtml(dateLabel(date)) + '</span>' +
          '<span class="archive-date-full">' + escapeHtml(fmtDate(date)) + '</span>' +
          '<span class="archive-date-stats">' + group.done + '/' + group.total + '</span>' +
        '</div>';
      for (var j = 0; j < group.items.length; j++) {
        var todo = group.items[j];
        var doneClass = todo.done ? ' completed' : '';
        var subHTML = '';
        if (todo.subtasks && todo.subtasks.length) {
          subHTML = '<div class="archive-subtasks">';
          for (var sk = 0; sk < todo.subtasks.length; sk++) {
            var stt = todo.subtasks[sk];
            subHTML += '<span class="archive-sub' + (stt.done ? ' done' : '') + '">' +
              '<svg class="ico" aria-hidden="true"><use href="#i-' + (stt.done ? 'check' : 'subtask') + '"/></svg>' +
              escapeHtml(stt.text) + '</span>';
          }
          subHTML += '</div>';
        }
        html += '<div class="archive-item' + doneClass + '" data-cat="' + todo.category + '">' +
          '<div class="archive-check"><svg class="ico" aria-hidden="true"><use href="#i-check"/></svg></div>' +
          '<div class="archive-item-body">' +
            '<span class="archive-text">' + escapeHtml(todo.text) + '</span>' +
            subHTML +
          '</div>' +
          '<span class="todo-cat-tag ' + todo.category + '">' + escapeHtml(catLabel(todo.category)) + '</span>' +
        '</div>';
      }
      html += '</div>';
    }
    list.innerHTML = html;
  }

  /* ---- Archive Page (v1.9: full-page sub-view) ---- */
  function showArchivePage() {
    var page = document.getElementById('archive-page');
    if (!page) return;
    // Reset search box visual but keep filters stateful across visits
    var searchEl = document.getElementById('archive-search');
    if (searchEl && !archiveSearch) searchEl.value = '';
    page.hidden = false;
    archiveEnsureCalAnchored();
    renderArchiveModeChip();
    renderArchiveCal();
    renderArchive();
    page.scrollTop = 0;
  }
  function hideArchivePage() {
    var page = document.getElementById('archive-page');
    if (page) page.hidden = true;
    archiveCloseCal();
  }
  function renderArchiveModeChip() {
    var chipText = document.getElementById('archive-mode-chip-text');
    var resetBtn = document.getElementById('archive-reset-btn');
    var calBtn = document.getElementById('archive-cal-btn');
    if (chipText) {
      if (archiveMode === 'date' && archiveSelectedDate) {
        chipText.textContent = fmtDate(archiveSelectedDate);
        chipText.removeAttribute('data-i18n');
      } else {
        chipText.textContent = I18n.t('archive.modeRecent7');
        chipText.setAttribute('data-i18n', 'archive.modeRecent7');
      }
    }
    if (resetBtn) resetBtn.hidden = !(archiveMode === 'date');
    if (calBtn) calBtn.classList.toggle('is-active', archiveMode === 'date');
  }
  function archiveEnsureCalAnchored() {
    if (archiveCalYear == null || archiveCalMonth == null) {
      var anchor = archiveMode === 'date' && archiveSelectedDate
        ? archiveSelectedDate : todayStr();
      var parts = anchor.split('-');
      archiveCalYear = parseInt(parts[0], 10);
      archiveCalMonth = parseInt(parts[1], 10);
    }
  }
  function archiveShiftCal(delta) {
    var d = new Date(archiveCalYear, archiveCalMonth - 1 + delta, 1);
    archiveCalYear = d.getFullYear();
    archiveCalMonth = d.getMonth() + 1;
    renderArchiveCal();
  }
  function renderArchiveCal() {
    archiveEnsureCalAnchored();
    var pop = document.getElementById('archive-cal-popover');
    if (!pop) return;
    var months = I18n.months();
    var weekdays = I18n.weekdays();
    var py = archiveCalYear, pm = archiveCalMonth;
    var first = new Date(py, pm - 1, 1);
    var firstDay = first.getDay();
    var startOffset = (firstDay + 6) % 7;
    var daysInMonth = new Date(py, pm, 0).getDate();
    var today = todayStr();
    var monthLabel = months[pm - 1] + ' ' + py;
    var html = '';
    html += '<div class="cal-header">' +
      '<button class="cal-nav-btn" id="archive-cal-prev" data-i18n-title="cal.prevMonth" title="Previous month">' +
        '<svg class="ico" aria-hidden="true"><use href="#i-chevron-left"/></svg>' +
      '</button>' +
      '<span class="cal-month-label">' + escapeHtml(monthLabel) + '</span>' +
      '<button class="cal-nav-btn" id="archive-cal-next" data-i18n-title="cal.nextMonth" title="Next month">' +
        '<svg class="ico" aria-hidden="true"><use href="#i-chevron-right"/></svg>' +
      '</button>' +
      '</div>';
    html += '<div class="cal-weekdays">';
    var wkOrder = [1, 2, 3, 4, 5, 6, 0];
    for (var i = 0; i < 7; i++) {
      var idx = wkOrder[i];
      html += '<span class="cal-wd">' + escapeHtml(weekdays[idx]) + '</span>';
    }
    html += '</div>';
    html += '<div class="cal-grid">';
    for (var p = 0; p < startOffset; p++) html += '<span class="cal-cell empty"></span>';
    for (var d = 1; d <= daysInMonth; d++) {
      var iso = py + '-' + String(pm).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      var hasTask = false;
      for (var t = 0; t < todos.length; t++) {
        if (todos[t].date === iso) { hasTask = true; break; }
      }
      var cls = 'cal-cell';
      if (iso === today) cls += ' is-today';
      if (iso === archiveSelectedDate && archiveMode === 'date') cls += ' is-selected';
      var dot = hasTask ? '<span class="cal-dot"></span>' : '';
      html += '<button class="' + cls + '" data-date="' + iso + '"><span class="cal-day">' + d + '</span>' + dot + '</button>';
    }
    var total = startOffset + daysInMonth;
    var padAfter = (7 - (total % 7)) % 7;
    for (var px = 0; px < padAfter; px++) html += '<span class="cal-cell empty"></span>';
    html += '</div>';
    pop.innerHTML = html;

    var prev = document.getElementById('archive-cal-prev');
    var next = document.getElementById('archive-cal-next');
    if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); archiveShiftCal(-1); });
    if (next) next.addEventListener('click', function (e) { e.stopPropagation(); archiveShiftCal(1); });
    var cells = pop.querySelectorAll('.cal-cell[data-date]');
    for (var c = 0; c < cells.length; c++) {
      cells[c].addEventListener('click', function (e) {
        e.stopPropagation();
        archiveSelectedDate = this.dataset.date;
        archiveMode = 'date';
        archiveCloseCal();
        renderArchiveModeChip();
        renderArchive();
      });
    }
  }
  function archiveOpenCal() {
    var pop = document.getElementById('archive-cal-popover');
    if (!pop) return;
    archiveEnsureCalAnchored();
    renderArchiveCal();
    pop.hidden = false;
    setTimeout(function () {
      document.addEventListener('click', onDocClickCloseArchiveCal, { once: false });
    }, 50);
    document.addEventListener('keydown', onEscCloseArchiveCal);
  }
  function archiveCloseCal() {
    var pop = document.getElementById('archive-cal-popover');
    if (pop) pop.hidden = true;
    document.removeEventListener('click', onDocClickCloseArchiveCal);
    document.removeEventListener('keydown', onEscCloseArchiveCal);
  }
  function onDocClickCloseArchiveCal(e) {
    var pop = document.getElementById('archive-cal-popover');
    var btn = document.getElementById('archive-cal-btn');
    if (!pop || pop.hidden) return;
    if (pop.contains(e.target) || (btn && btn.contains(e.target))) return;
    archiveCloseCal();
  }
  function onEscCloseArchiveCal(e) {
    if (e.key === 'Escape') archiveCloseCal();
  }

  /* ---- View: Dashboard — task-chain aware (v1.32) ---- */
  function renderDashboard() {
    var chains = buildTaskChains();
    var completed = 0, rollovers = 0, ontime = 0;
    var allCats = { life: 0, work: 0, media: 0, study: 0 };
    for (var i = 0; i < chains.length; i++) {
      var chain = chains[i];
      rollovers += chain.rolloverCount;
      if (chain.completed) {
        completed++;
        if (chain.completionDate && chain.completionDate <= chain.originalDate) ontime++;
      }
      var cat = chain.original.category;
      if (allCats[cat] !== undefined) allCats[cat]++;
    }
    var ontimeRate = completed ? Math.round(ontime / completed * 100) : 0;
    document.getElementById('dash-created').textContent = chains.length;
    document.getElementById('dash-completed').textContent = completed;
    document.getElementById('dash-rollovers').textContent = rollovers;
    document.getElementById('dash-ontime').textContent = ontimeRate + '%';

    var maxCat = Math.max(allCats.life, allCats.work, allCats.media, allCats.study, 1);
    document.getElementById('bar-life').style.width = ((allCats.life / maxCat) * 100) + '%';
    document.getElementById('bar-work').style.width = ((allCats.work / maxCat) * 100) + '%';
    var barMedia = document.getElementById('bar-media');
    if (barMedia) barMedia.style.width = ((allCats.media / maxCat) * 100) + '%';
    var barValMedia = document.getElementById('bar-val-media');
    if (barValMedia) barValMedia.textContent = allCats.media;
    document.getElementById('bar-study').style.width = ((allCats.study / maxCat) * 100) + '%';
    document.getElementById('bar-val-life').textContent = allCats.life;
    document.getElementById('bar-val-work').textContent = allCats.work;
    document.getElementById('bar-val-study').textContent = allCats.study;

    // Weekly trend compares unique chains created vs chains completed per day.
    var trendHtml = '';
    var trendDate = shiftDate(todayStr(), -6);
    var maxDay = 0;
    var dayData = [];
    for (var t = 0; t < 7; t++) {
      var created = 0, done = 0;
      for (var u = 0; u < chains.length; u++) {
        if (chains[u].originalDate === trendDate) created++;
        if (chains[u].completed && chains[u].completionDate === trendDate) done++;
      }
      dayData.push({ date: trendDate, total: created, done: done });
      maxDay = Math.max(maxDay, created, done);
      trendDate = shiftDate(trendDate, 1);
    }
    for (var y = 0; y < dayData.length; y++) {
      var day = dayData[y];
      var pct = maxDay > 0 ? (day.total / maxDay) * 100 : 0;
      var donePct = maxDay > 0 ? (day.done / maxDay) * 100 : 0;
      var isTodayFlag = isToday(day.date);
      trendHtml += '<div class="trend-col' + (isTodayFlag ? ' today' : '') + '">' +
        '<div class="trend-bar-wrap">' +
          '<div class="trend-bar total" style="height:' + pct + '%"></div>' +
          '<div class="trend-bar done" style="height:' + donePct + '%"></div>' +
        '</div>' +
        '<span class="trend-date">' + fmtShort(day.date) + '</span>' +
        '<span class="trend-val">' + day.done + '/' + day.total + '</span>' +
      '</div>';
    }
    document.getElementById('dash-trend').innerHTML = trendHtml;
  }

  /* ---- Global Stats (sidebar progress ring) ---- */
  function updateGlobalStats() {
    var todayTasks = [];
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].date === todayStr()) todayTasks.push(todos[i]);
    }
    var total = todayTasks.length;
    var done = 0;
    for (var j = 0; j < todayTasks.length; j++) { if (todayTasks[j].done) done++; }
    document.getElementById('nav-todo-count').textContent = total;
    if (typeof App !== 'undefined' && App.updateProgress) {
      App.updateProgress(done, total);
    }
  }

  /* ---- Utilities ---- */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---- Initialization ---- */
  function init() {
    load();
    // Personal workspaces now start empty. The legacy demo generator is kept
    // only so its exact signature remains auditable by the cleanup tool.
    // Carry over unfinished tasks from previous days onto today
    rolloverOverdue();

    // Held at function scope so both the swipe and quick-add delegations below
    // can share the same reference (avoids hoisting/undefined surprises).
    var swipeContainer = document.getElementById('todo-grouped');

    // Category picker
    var catBtns = document.querySelectorAll('.todo-add-bar--hero .cat-btn');
    for (var i = 0; i < catBtns.length; i++) {
      catBtns[i].addEventListener('click', function () {
        for (var j = 0; j < catBtns.length; j++) catBtns[j].classList.remove('active');
        this.classList.add('active');
        currentCategory = this.dataset.cat;
      });
    }

    // Add task
    var input = document.getElementById('todo-input');
    var addBtn = document.getElementById('todo-add-btn');

    function handleAdd() {
      var text = input.value.trim();
      if (!text) {
        App.toast(I18n.t('todo.toastEmpty'), 'warn');
        return;
      }
      add(text, currentCategory);
      input.value = '';
      input.focus();
      App.toast(I18n.t('todo.toastAdded'), 'success');
    }

    addBtn.addEventListener('click', handleAdd);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleAdd();
    });

    // The "+" button in the filter row scrolls to and focuses the
    // persistent quick-add row inside the checklist (v1.27).
    var tabsAddBtn = document.getElementById('todo-tabs-add');
    if (tabsAddBtn) tabsAddBtn.addEventListener('click', focusQuickAdd);
    var emptyPrimaryBtn = document.getElementById('todo-empty-primary');
    var emptySecondaryBtn = document.getElementById('todo-empty-secondary');
    if (emptyPrimaryBtn) emptyPrimaryBtn.addEventListener('click', emptyPrimary);
    if (emptySecondaryBtn) emptySecondaryBtn.addEventListener('click', emptySecondary);

    /* ---- Quick-add: Enter key on the bottom-of-list inline input ----
       Delegated off the same container as the swipe handler so the row
       is fully rebuilt on every render without rebinding. */
    if (swipeContainer && !swipeContainer.dataset.quickAddBound) {
      swipeContainer.dataset.quickAddBound = '1';
      swipeContainer.addEventListener('keydown', function (e) {
        if (!e.target || !e.target.classList || !e.target.classList.contains('quick-add-input')) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          var val = e.target.value.trim();
          if (!val) {
            App.toast(I18n.t('todo.toastEmpty'), 'warn');
            return;
          }
          add(val);
          // After render, refocus the freshly-rendered quick-add input.
          var refreshed = document.querySelector('#todo-grouped .quick-add-input');
          if (refreshed) refreshed.focus();
          App.toast(I18n.t('todo.toastAdded'), 'success');
        }
      });
    }

    // Filter pills (checklist view)
    var filterTabs = document.querySelectorAll('#section-daily .todo-tabs .todo-tab[data-filter]');
    for (var f = 0; f < filterTabs.length; f++) {
      filterTabs[f].addEventListener('click', function () {
        for (var g = 0; g < filterTabs.length; g++) filterTabs[g].classList.remove('active');
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderChecklist();
      });
    }

    // View-only completed-task toggle. It intentionally uses in-memory state
    // only and cannot alter or migrate saved task history.
    var hideDoneBtn = document.getElementById('todo-hide-completed');
    if (hideDoneBtn) hideDoneBtn.addEventListener('click', function () {
      hideCompleted = !hideCompleted;
      renderChecklist();
    });

    /* Priority-aware ordering: drag (mouse), drag handle touch, or keyboard
       ArrowUp/ArrowDown. Reordering is intentionally limited to tasks with
       the same date, category and priority so priority bands stay meaningful. */
    if (swipeContainer && !swipeContainer.dataset.prioritySortBound) {
      swipeContainer.dataset.prioritySortBound = '1';
      var touchDragId = null;
      var touchTargetId = null;
      var touchPlaceAfter = false;
      var touchStartY = 0;
      var touchMoved = false;

      function clearDragMarkers() {
        var marked = swipeContainer.querySelectorAll('.drag-before, .drag-after, .is-dragging');
        for (var i = 0; i < marked.length; i++) {
          marked[i].classList.remove('drag-before', 'drag-after', 'is-dragging');
        }
      }

      function markTarget(item, clientY) {
        clearDragMarkers();
        var source = findTodo(dragTodoId != null ? dragTodoId : touchDragId);
        var targetId = Number(item.dataset.todoId);
        var target = findTodo(targetId);
        if (!canReorder(source, target)) return false;
        var rect = item.getBoundingClientRect();
        var after = clientY > rect.top + rect.height / 2;
        item.classList.add(after ? 'drag-after' : 'drag-before');
        if (dragTodoId != null) {
          var sourceEl = swipeContainer.querySelector('[data-todo-id="' + dragTodoId + '"]');
          if (sourceEl) sourceEl.classList.add('is-dragging');
        }
        touchTargetId = targetId;
        touchPlaceAfter = after;
        return true;
      }

      swipeContainer.addEventListener('dragstart', function (e) {
        var handle = e.target.closest && e.target.closest('.todo-drag-handle');
        if (!handle) return;
        var item = handle.closest('.todo-item');
        if (!item) return;
        dragTodoId = Number(item.dataset.todoId);
        item.classList.add('is-dragging');
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(dragTodoId));
        }
      });
      swipeContainer.addEventListener('dragover', function (e) {
        if (dragTodoId == null) return;
        var item = e.target.closest && e.target.closest('.todo-item');
        if (!item || !markTarget(item, e.clientY)) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      });
      swipeContainer.addEventListener('drop', function (e) {
        if (dragTodoId == null) return;
        var item = e.target.closest && e.target.closest('.todo-item');
        if (item) {
          e.preventDefault();
          reorderTask(dragTodoId, Number(item.dataset.todoId), item.classList.contains('drag-after'));
        }
        dragTodoId = null;
        clearDragMarkers();
      });
      swipeContainer.addEventListener('dragend', function () {
        dragTodoId = null;
        clearDragMarkers();
      });

      swipeContainer.addEventListener('keydown', function (e) {
        var handle = e.target.closest && e.target.closest('.todo-drag-handle');
        if (!handle || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
        e.preventDefault();
        var item = handle.closest('.todo-item');
        if (item) moveTaskByKeyboard(Number(item.dataset.todoId), e.key === 'ArrowUp' ? -1 : 1);
      });

      swipeContainer.addEventListener('touchstart', function (e) {
        var handle = e.target.closest && e.target.closest('.todo-drag-handle');
        if (!handle || !e.touches[0]) return;
        var item = handle.closest('.todo-item');
        if (!item) return;
        touchDragId = Number(item.dataset.todoId);
        touchTargetId = null;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
      }, { passive: true });
      swipeContainer.addEventListener('touchmove', function (e) {
        if (touchDragId == null || !e.touches[0]) return;
        var touch = e.touches[0];
        if (!touchMoved && Math.abs(touch.clientY - touchStartY) < 7) return;
        touchMoved = true;
        e.preventDefault();
        var under = document.elementFromPoint(touch.clientX, touch.clientY);
        var item = under && under.closest ? under.closest('.todo-item') : null;
        if (item) markTarget(item, touch.clientY);
      }, { passive: false });
      swipeContainer.addEventListener('touchend', function () {
        if (touchMoved && touchDragId != null && touchTargetId != null) {
          reorderTask(touchDragId, touchTargetId, touchPlaceAfter);
        }
        touchDragId = null;
        touchTargetId = null;
        touchMoved = false;
        clearDragMarkers();
      }, { passive: true });
    }

    // History button — enters the full archive page (v1.9)
    var historyBtn = document.getElementById('todo-history-btn');
    if (historyBtn) {
      historyBtn.addEventListener('click', function () {
        showArchivePage();
      });
    }

    // Archive filters
    var archiveSearchEl = document.getElementById('archive-search');
    if (archiveSearchEl) {
      archiveSearchEl.addEventListener('input', function () {
        archiveSearch = this.value;
        renderArchive();
      });
    }

    var archiveCatBtns = document.querySelectorAll('[data-archive-cat]');
    for (var ac = 0; ac < archiveCatBtns.length; ac++) {
      archiveCatBtns[ac].addEventListener('click', function () {
        for (var ad = 0; ad < archiveCatBtns.length; ad++) archiveCatBtns[ad].classList.remove('active');
        this.classList.add('active');
        archiveCat = this.dataset.archiveCat;
        renderArchive();
      });
    }

    // Archive page: back button / reset / calendar (v1.9)
    var archClose = document.getElementById('archive-back-btn');
    if (archClose) archClose.addEventListener('click', hideArchivePage);
    var archReset = document.getElementById('archive-reset-btn');
    if (archReset) archReset.addEventListener('click', function () {
      archiveMode = 'recent7';
      archiveSelectedDate = '';
      archiveCloseCal();
      renderArchiveModeChip();
      renderArchive();
    });
    var archCalBtn = document.getElementById('archive-cal-btn');
    if (archCalBtn) archCalBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var pop = document.getElementById('archive-cal-popover');
      if (!pop) return;
      if (pop.hidden) archiveOpenCal(); else archiveCloseCal();
    });

    /* ---- Date navigator buttons ---- */
    var prevBtn = document.getElementById('date-prev');
    var nextBtn = document.getElementById('date-next');
    var chipEl = document.getElementById('date-chip');
    var todayBtn2 = document.getElementById('date-today');
    if (prevBtn) prevBtn.addEventListener('click', function () { shiftViewDate(-1); renderCurrentView(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { shiftViewDate(1); renderCurrentView(); });
    if (chipEl) chipEl.addEventListener('click', function (e) {
      e.stopPropagation();
      var pop = document.getElementById('calendar-popover');
      if (!pop) return;
      if (pop.hidden) openCalendar(); else closeCalendar();
    });
    if (todayBtn2) todayBtn2.addEventListener('click', function () { goToday(); renderCurrentView(); });

    /* ---- Import modal ---- */
    var importBtn = document.getElementById('open-import-modal');
    if (importBtn) importBtn.addEventListener('click', openImportModal);
    var impClose = document.getElementById('import-modal-close');
    if (impClose) impClose.addEventListener('click', closeImportModal);
    var impCancel = document.getElementById('import-modal-cancel');
    if (impCancel) impCancel.addEventListener('click', closeImportModal);
    var impConfirm = document.getElementById('import-modal-confirm');
    if (impConfirm) impConfirm.addEventListener('click', commitImport);
    var impText = document.getElementById('import-text');
    if (impText) impText.addEventListener('input', updateImportPreview);
    var impDate = document.getElementById('import-default-date');
    if (impDate) impDate.addEventListener('change', updateImportPreview);
    var impCats = document.querySelectorAll('#import-cat-picker .cat-btn');
    for (var ic = 0; ic < impCats.length; ic++) {
      impCats[ic].addEventListener('click', function () {
        for (var ix = 0; ix < impCats.length; ix++) impCats[ix].classList.remove('active');
        this.classList.add('active');
        importDefaultCat = this.dataset.cat;
        updateImportPreview();
      });
    }
    // ESC closes import modal / leaves archive page
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var im = document.getElementById('import-modal-overlay');
        if (im && !im.hidden) { closeImportModal(); return; }
        var am = document.getElementById('archive-page');
        if (am && !am.hidden) hideArchivePage();
      }
    });
    // Click on archive-page background (outside the inner content) returns
    var archPage = document.getElementById('archive-page');
    if (archPage) archPage.addEventListener('click', function (e) {
      if (e.target === archPage) hideArchivePage();
    });

    renderCurrentView();

    /* ---- Touch swipe: reveal todo-item actions on left swipe (mobile) ---- */
    // Delegated: a single touchstart listener on the list container tracks
    // each gesture so we can add/remove a `.swiped` class on the row.
    if (swipeContainer && !swipeContainer.dataset.swipeBound) {
      swipeContainer.dataset.swipeBound = '1';
      var startX = 0, startY = 0, activeItem = null, tracking = false;
      swipeContainer.addEventListener('touchstart', function (e) {
        var t = e.touches[0]; if (!t) return;
        var item = e.target.closest && e.target.closest('.todo-item');
        if (!item) return;
        startX = t.clientX; startY = t.clientY;
        activeItem = item; tracking = true;
      }, { passive: true });
      swipeContainer.addEventListener('touchmove', function (e) {
        if (!tracking || !activeItem) return;
        var t = e.touches[0]; if (!t) return;
        var dx = t.clientX - startX, dy = t.clientY - startY;
        if (Math.abs(dy) > Math.abs(dx)) { tracking = false; return; } // vertical scroll
        if (dx < -40) activeItem.classList.add('swiped');
        else if (dx > 40) activeItem.classList.remove('swiped');
      }, { passive: true });
      swipeContainer.addEventListener('touchend', function () {
        tracking = false; activeItem = null;
      }, { passive: true });
      // Tap on checkbox/text removes .swiped (so re-tap works normally)
      swipeContainer.addEventListener('click', function (e) {
        var item = e.target.closest && e.target.closest('.todo-item');
        if (item && item.classList.contains('swiped')) {
          var tag = e.target.tagName;
          // Keep swipe open only when the user is tapping inside the actions
          // strip; otherwise collapse so taps on checkbox/text behave normally.
          if (!e.target.closest('.todo-actions') && tag !== 'BUTTON') {
            item.classList.remove('swiped');
          }
        }
      });
    }
    // Tap outside any todo-item dismisses all open swipes
    if (!document.documentElement.dataset.swipeDocBound) {
      document.documentElement.dataset.swipeDocBound = '1';
      document.addEventListener('click', function (e) {
        if (!e.target.closest || !e.target.closest('.todo-item')) {
          var open = document.querySelectorAll('.todo-item.swiped');
          for (var oi = 0; oi < open.length; oi++) open[oi].classList.remove('swiped');
        }
      });
    }

    // Re-render on language switch
    I18n.onChange(function () {
      renderHeatmap();
      renderChecklist();
      var am = document.getElementById('archive-page');
      if (am && !am.hidden) {
        renderArchiveModeChip();
        renderArchive();
      }
      renderDashboard();
    });
  }

  return { init, add, toggle, remove, startEdit,
    startChangeCategory, commitCategoryChange,
    startChangePriority, commitPriorityChange, reorderTask, moveTaskByKeyboard,
    addSubtask, toggleSubtask, removeSubtask, startAddSubtask, commitSubtask, startEditSubtask,
    buildTaskChains, rolloverOverdue,
    demoCleanupPreview, cleanupDemoData,
    render: renderCurrentView,
    _test: { isLegacyDemoRoot, demoCleanupPreview } };
})();

if (typeof window !== 'undefined') window.TodoList = TodoList;
if (typeof module !== 'undefined' && module.exports) module.exports = TodoList;
