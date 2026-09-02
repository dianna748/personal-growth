/* ============================================
   Bloom · Main Application Logic
   ============================================ */

const App = (function () {

  /* ---- Toast notifications ---- */
  function toast(message, type) {
    type = type || 'info';
    const container = document.getElementById('toast-container');
    const icons = { success: 'check', info: 'info', warn: 'warn' };
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span class="toast-icon">' + (window.Ico ? window.Ico(icons[type] || 'info') : '') + '</span><span>' + message + '</span>';
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* ---- Date display ---- */
  function renderDate() {
    const now = new Date();
    const months = I18n.months();
    const weekdays = I18n.weekdays();

    document.getElementById('date-day').textContent = now.getDate();
    document.getElementById('date-month').textContent = months[now.getMonth()];
    document.getElementById('date-weekday').textContent = weekdays[now.getDay()];
  }

  /* ---- Progress ring ---- */
  function updateProgress(done, total) {
    const ring = document.getElementById('daily-ring');
    const text = document.getElementById('daily-progress-text');
    const circumference = 2 * Math.PI * 26;
    const percent = total > 0 ? (done / total) * 100 : 0;
    const offset = circumference - (percent / 100) * circumference;

    ring.style.strokeDashoffset = offset;
    text.textContent = Math.round(percent) + '%';
  }

  /* ---- Module switching ---- */
  // v1.13: tag CJK-containing titles so v14 bold treatment applies (design requirement)
  function markZhTitles() {
    var sels = '.module-title, .article-title, .section-title, .heatmap-title, ' +
               '.panel-sub-title, .date-group-date, .empty-title, .vocab-title, ' +
               '.dash-section-title, .word-title';
    var nodes = document.querySelectorAll(sels);
    Array.prototype.forEach.call(nodes, function (el) {
      var has = /[一-鿿]/.test(el.textContent || '');
      if (has) el.classList.add('has-zh-title');
      else el.classList.remove('has-zh-title');
    });
  }

  function initNavigation() {
    var allNavBtns = document.querySelectorAll('.nav-item, .bottom-nav-item');
    allNavBtns.forEach(item => {
      if (!item.dataset.module) return; // skip non-module buttons (e.g. sync tab)
      item.addEventListener('click', () => {
        const module = item.dataset.module;
        // keep both the sidebar and the bottom bar in sync
        allNavBtns.forEach(n => n.classList.remove('active'));
        allNavBtns.forEach(n => { if (n.dataset.module === module) n.classList.add('active'); });
        document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
        var target = document.getElementById('module-' + module);
        if (target) target.classList.add('active');

        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      });
    });
    // Bottom-nav sync tab opens the sync settings modal
    var bnSync = document.getElementById('bn-sync');
    if (bnSync) bnSync.addEventListener('click', function () {
      var open = document.getElementById('open-sync-modal');
      if (open) open.click();
    });
  }

  /* ---- Initialization ---- */
  function initSidebarToggle() {
    var sidebar = document.getElementById('sidebar');
    var btn = document.getElementById('sidebar-toggle');
    var menuBtn = document.getElementById('mobile-menu-btn');
    var backdrop = document.getElementById('sidebar-backdrop');
    var KEY = 'bloom_sidebar_collapsed';
    if (sidebar && localStorage.getItem(KEY) === '1') sidebar.classList.add('sidebar-collapsed');
    if (btn) btn.addEventListener('click', function () {
      sidebar.classList.toggle('sidebar-collapsed');
      localStorage.setItem(KEY, sidebar.classList.contains('sidebar-collapsed') ? '1' : '0');
    });
    function openDrawer() { if (sidebar) sidebar.classList.add('sidebar-open'); if (backdrop) backdrop.classList.add('show'); }
    function closeDrawer() { if (sidebar) sidebar.classList.remove('sidebar-open'); if (backdrop) backdrop.classList.remove('show'); }
    if (menuBtn) menuBtn.addEventListener('click', openDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    // On mobile, close the drawer after picking a nav item or opening sync.
    if (sidebar) {
      var navItems = sidebar.querySelectorAll('.nav-item');
      for (var i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function () { if (window.innerWidth <= 900) closeDrawer(); });
      }
      var syncBtn = document.getElementById('open-sync-modal');
      if (syncBtn) syncBtn.addEventListener('click', function () { if (window.innerWidth <= 900) closeDrawer(); });
    }

    // App-like gestures: swipe in from the left edge to open; swipe left to close.
    var edgeX = null, edgeY = null;
    document.addEventListener('touchstart', function (e) {
      if (window.innerWidth > 900) return;
      var t = e.touches[0];
      var open = sidebar && sidebar.classList.contains('sidebar-open');
      if (open) { edgeX = t.clientX; edgeY = t.clientY; }        // track for swipe-to-close
      else if (t.clientX <= 26) { edgeX = t.clientX; edgeY = t.clientY; } // track for edge-open
      else { edgeX = null; }
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (edgeX === null || window.innerWidth > 900) { edgeX = null; return; }
      var t = e.changedTouches[0];
      var dx = t.clientX - edgeX;
      var dy = Math.abs(t.clientY - edgeY);
      var open = sidebar && sidebar.classList.contains('sidebar-open');
      if (!open && dx > 50 && dy < 40) openDrawer();              // swipe right from edge -> open
      else if (open && dx < -40 && dy < 50) closeDrawer();        // swipe left -> close
      edgeX = null;
    }, { passive: true });
  }
  function boot() {
    renderDate();
    initNavigation();
    initSidebarToggle();
    TodoList.init();
    English.init();
    French.init();
    // Wire up language switcher + apply current language to static UI
    I18n.initUI();
    I18n.apply();
    markZhTitles();
    // Convert any remaining emoji to line icons, and keep dynamic content in sync
    if (window.iconify) window.iconify(document);
    if (window.iconify && 'MutationObserver' in window) {
      let scheduled = false;
      const obs = new MutationObserver(function () {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () {
          scheduled = false;
          window.iconify(document.body);
        });
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
    // Refresh date card when language changes
    I18n.onChange(function () { renderDate(); markZhTitles(); });
    initSyncUI();
    if (window.BloomNotifications) BloomNotifications.init();
  }

  function init() {
    if (window.Sync) {
      Sync.init(boot);
    } else {
      boot();
    }
  }

  /* ---- Sync settings UI ---- */
  function initSyncUI() {
    var modal = document.getElementById('sync-modal-overlay');
    var openBtn = document.getElementById('open-sync-modal');
    var closeBtn = document.getElementById('sync-modal-close');
    var saveBtn = document.getElementById('sync-save');
    var genBtn = document.getElementById('sync-gen');
    var nowBtn = document.getElementById('sync-now');
    var copyBtn = document.getElementById('sync-copy-sql');
    var exportBtn = document.getElementById('sync-export-backup');
    var importBtn = document.getElementById('sync-import-backup');
    var backupFile = document.getElementById('sync-backup-file');
    var backupPreview = document.getElementById('backup-preview');
    var backupPreviewClose = document.getElementById('backup-preview-close');
    var restoreMergeBtn = document.getElementById('backup-restore-merge');
    var restoreOverwriteBtn = document.getElementById('backup-restore-overwrite');
    var demoScanBtn = document.getElementById('demo-cleanup-scan');
    var demoConfirmBtn = document.getElementById('demo-cleanup-confirm');
    var demoPreviewEl = document.getElementById('demo-cleanup-preview');
    var demoCountEl = document.getElementById('demo-cleanup-count');
    var demoListEl = document.getElementById('demo-cleanup-list');
    var urlIn = document.getElementById('sync-url');
    var keyIn = document.getElementById('sync-key');
    var codeIn = document.getElementById('sync-code');
    var enIn = document.getElementById('sync-enabled');
    var statusText = document.getElementById('sync-status-text');
    var statusDot = document.getElementById('sync-status-dot');
    var sidebarDot = document.getElementById('sync-dot');

    function refreshStatus(s) {
      if (!statusText) return;
      var map = { off: '未启用', idle: '已同步', syncing: '同步中…', offline: '离线 / 失败', error: '错误' };
      statusText.textContent = map[s] || s;
      var cls = 'sync-dot sync-' + s;
      if (statusDot) statusDot.className = cls;
      if (sidebarDot) sidebarDot.className = 'sync-dot sync-' + s;
    }
    if (window.Sync) Sync.onStatus(refreshStatus);

    function fillForm() {
      var c = (window.Sync && Sync.getConfig()) || {};
      if (urlIn) urlIn.value = c.url || '';
      if (keyIn) keyIn.value = c.anonKey || '';
      if (codeIn) codeIn.value = c.syncCode || '';
      if (enIn) enIn.checked = !!c.enabled;
    }

    if (openBtn) openBtn.addEventListener('click', function () {
      fillForm();
      if (modal) modal.hidden = false;
    });
    if (closeBtn) closeBtn.addEventListener('click', function () { if (modal) modal.hidden = true; });
    if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) modal.hidden = true; });
    if (genBtn) genBtn.addEventListener('click', function () { if (codeIn && window.Sync) codeIn.value = Sync.genCode(); });
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var sql = document.getElementById('sync-sql');
      if (sql) {
        try {
          navigator.clipboard.writeText(sql.textContent);
          copyBtn.textContent = '已复制';
          setTimeout(function () { copyBtn.textContent = '复制 SQL'; }, 1500);
        } catch (e) {}
      }
    });
    var pendingBackupPayload = null;

    function backupStamp() {
      var d = new Date();
      return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') +
        '-' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
    }

    function closeBackupPreview() {
      pendingBackupPayload = null;
      if (backupPreview) backupPreview.hidden = true;
      if (backupFile) backupFile.value = '';
    }

    if (exportBtn) exportBtn.addEventListener('click', function () {
      try {
        BackupRestore.download(BackupRestore.buildPayload(), 'bloom-local-backup-' + backupStamp() + '.json');
        toast('本地备份已下载（不含同步凭据）', 'success');
      } catch (e) {
        toast('备份下载失败，请检查浏览器下载权限', 'warn');
      }
    });

    if (importBtn && backupFile) importBtn.addEventListener('click', function () { backupFile.click(); });
    if (backupPreviewClose) backupPreviewClose.addEventListener('click', closeBackupPreview);
    if (backupFile) backupFile.addEventListener('change', function () {
      var file = backupFile.files && backupFile.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast('备份文件超过 10MB，已停止读取', 'warn');
        closeBackupPreview();
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        try {
          pendingBackupPayload = BackupRestore.parse(String(reader.result || ''));
          var summary = BackupRestore.analyze(pendingBackupPayload);
          document.getElementById('backup-preview-name').textContent = file.name;
          document.getElementById('backup-count-new').textContent = summary.newCount;
          document.getElementById('backup-count-duplicate').textContent = summary.duplicateCount;
          document.getElementById('backup-count-conflict').textContent = summary.conflictCount;
          var detail = '备份含 ' + summary.incomingTaskCount + ' 条任务、' + summary.incomingKeyCount + ' 个数据字段；其他数据字段：' +
            summary.otherNew + ' 个新增，' + summary.otherDuplicate + ' 个重复，' + summary.otherConflict + ' 个冲突。';
          if (summary.conflictTasks.length) detail += ' 冲突示例：' + summary.conflictTasks.join('、');
          document.getElementById('backup-preview-detail').textContent = detail;
          backupPreview.hidden = false;
          backupPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (e) {
          closeBackupPreview();
          toast(e.message || '无法读取这个备份文件', 'warn');
        }
      };
      reader.onerror = function () { closeBackupPreview(); toast('备份文件读取失败', 'warn'); };
      reader.readAsText(file);
    });

    function runRestore(mode) {
      if (!pendingBackupPayload) return;
      try {
        // Always create a recoverable snapshot before either restore mode.
        BackupRestore.download(BackupRestore.buildPayload(), 'bloom-before-restore-' + backupStamp() + '.json');
        BackupRestore.restore(pendingBackupPayload, mode);
        toast(mode === 'merge' ? '备份已安全合并，页面即将刷新' : '备份数据已覆盖恢复，页面即将刷新', 'success');
        setTimeout(function () { location.reload(); }, 650);
      } catch (e) {
        toast(e.message || '恢复失败，本机数据未改变', 'warn');
      }
    }
    if (restoreMergeBtn) restoreMergeBtn.addEventListener('click', function () { runRestore('merge'); });
    if (restoreOverwriteBtn) restoreOverwriteBtn.addEventListener('click', function () { runRestore('overwrite'); });
    var pendingDemoCleanup = null;
    function scanDemoData() {
      pendingDemoCleanup = (window.TodoList && TodoList.demoCleanupPreview)
        ? TodoList.demoCleanupPreview() : { rootCount: 0, copyCount: 0, totalCount: 0, samples: [] };
      if (demoPreviewEl) demoPreviewEl.hidden = false;
      if (demoCountEl) {
        demoCountEl.textContent = pendingDemoCleanup.totalCount
          ? ('检测到 ' + pendingDemoCleanup.rootCount + ' 条样例原任务 + ' + pendingDemoCleanup.copyCount + ' 条延续副本')
          : '没有检测到符合旧生成器特征的样例任务';
      }
      if (demoListEl) {
        demoListEl.innerHTML = '';
        pendingDemoCleanup.samples.slice(0, 12).forEach(function (sample) {
          var line = document.createElement('span');
          line.textContent = sample.date + ' · ' + sample.text;
          demoListEl.appendChild(line);
        });
        if (pendingDemoCleanup.samples.length > 12) {
          var more = document.createElement('span');
          more.textContent = '…另有 ' + (pendingDemoCleanup.samples.length - 12) + ' 条样例原任务';
          demoListEl.appendChild(more);
        }
      }
      if (demoConfirmBtn) demoConfirmBtn.disabled = !pendingDemoCleanup.totalCount;
    }
    if (demoScanBtn) demoScanBtn.addEventListener('click', scanDemoData);
    if (demoConfirmBtn) demoConfirmBtn.addEventListener('click', function () {
      if (!pendingDemoCleanup) scanDemoData();
      if (!pendingDemoCleanup || !pendingDemoCleanup.totalCount) return;
      var ok = window.confirm('将删除 ' + pendingDemoCleanup.totalCount + ' 条已识别的 v1.32 样例任务及延续副本，并同步删除标记。你的其他任务不会被改动。是否继续？');
      if (!ok) return;
      demoConfirmBtn.disabled = true;
      try {
        BackupRestore.download(BackupRestore.buildPayload(), 'bloom-before-demo-cleanup-' + backupStamp() + '.json');
      } catch (e) {
        demoConfirmBtn.disabled = false;
        toast('删除前安全备份下载失败，已取消清理', 'warn');
        return;
      }
      var removed = TodoList.cleanupDemoData();
      var finish = function () {
        toast('已删除 ' + removed.totalCount + ' 条样例记录，并写入防恢复删除标记', 'success');
        scanDemoData();
      };
      if (window.Sync && Sync.isEnabled && Sync.isEnabled()) {
        Sync.manualSync().then(finish).catch(function () {
          toast('样例已从本机删除；云端同步失败，删除标记会自动重试', 'warn');
          scanDemoData();
        });
      } else finish();
    });
    if (saveBtn) saveBtn.addEventListener('click', function () {
      var c = {
        url: (urlIn ? urlIn.value : '').trim(),
        anonKey: (keyIn ? keyIn.value : '').trim(),
        syncCode: (codeIn ? codeIn.value : '').trim(),
        enabled: enIn ? enIn.checked : false
      };
      if (c.enabled && (!c.url || !c.anonKey || !c.syncCode)) {
        alert('启用前请填齐 Supabase URL、anon key 和同步码');
        return;
      }
      if (c.enabled && !/^[A-Za-z0-9]{8,32}$/.test(c.syncCode)) {
        alert('同步码需为 8–32 位字母或数字，不能包含空格和符号');
        return;
      }
      if (c.enabled && !/^https:\/\//i.test(c.url) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(c.url)) {
        alert('Supabase URL 必须使用 HTTPS');
        return;
      }
      if (window.Sync) {
        Sync.saveConfig(c);
        if (c.enabled) {
          // Adopt the cloud as the source of truth on first enable, so any local
          // seed/demo data is replaced by real cloud data instead of overwriting it.
          Sync.safeFirstSync().then(function () {
            toast('首次同步已安全合并', 'success');
            setTimeout(function () { location.reload(); }, 450);
          }).catch(function () { toast('同步失败，本机修改已保留并会重试', 'warn'); });
        } else {
          toast('同步配置已保存（未启用）', 'info');
          if (modal) modal.hidden = true;
        }
      }
    });
    if (nowBtn) nowBtn.addEventListener('click', function () {
      if (window.Sync) {
        Sync.manualSync().then(function () { location.reload(); })
          .catch(function () { toast('同步失败，本机修改已保留并会重试', 'warn'); });
      }
    });
  }

  return { init, toast, updateProgress };
})();

document.addEventListener('DOMContentLoaded', App.init);
