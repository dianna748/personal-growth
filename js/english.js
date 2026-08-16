/* ============================================
   Bloom · English Learning Module
   Daily News + Archive + Vocab Library
   + Listening / Speaking / Expression
   -- All content fetched fresh daily from the internet,
      with static pool fallback.
   ============================================ */

const English = (function () {
  /* ---- State ---- */
  let currentArticle = null;
  let currentUserVocab = [];
  let currentListenItem = null;
  let currentSpeakItem = null;
  let currentExprItem = null;
  let speakRate = 1;
  let isPlaying = false;
  let currentUtterance = null;
  let currentSentenceIdx = 0;
  let mediaRecorder = null;
  let audioChunks = [];

  const STORAGE_KEY = 'bloom_eng_history';
  const VOCAB_KEY = 'bloom_eng_vocab_lib';
  const LISTEN_KEY = 'bloom_eng_listening_history';
  const SPEAK_KEY = 'bloom_eng_speaking_history';
  const EXPR_KEY = 'bloom_eng_expression_history';

  const BASE_DATE = new Date('2025-07-20');

  /* ---- Helpers ---- */
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function fmtDate(dateStr) {
    return I18n.fmtDate(dateStr);
  }

  function dateIndexForPool(dateStr, poolSize) {
    const d = new Date(dateStr);
    const diffDays = Math.floor((d - BASE_DATE) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 0;
    return diffDays % poolSize;
  }

  function loadJson(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch (e) { return {}; }
  }

  function saveJson(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

  function loadHistory() { return loadJson(STORAGE_KEY); }
  function saveHistory(h) { saveJson(STORAGE_KEY, h); }

  function loadVocabLib() {
    try { return JSON.parse(localStorage.getItem(VOCAB_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveVocabLib(lib) { saveJson(VOCAB_KEY, lib); }

  /* ---- Loading state ---- */
  function showLoading(elId) {
    var el = document.getElementById(elId);
    if (el) el.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>' + I18n.t('common.fetching') + '</p></div>';
  }

  /* ---- Web Speech API ---- */
  function speak(text, opts) {
    opts = opts || {};
    if (!('speechSynthesis' in window)) {
      App.toast(I18n.t('toast.noSpeech'), 'warn');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = opts.lang || 'en-US';
    utter.rate = opts.rate || speakRate;
    utter.pitch = opts.pitch || 1;
    if (opts.onBoundary) utter.onboundary = opts.onBoundary;
    if (opts.onEnd) utter.onend = opts.onEnd;
    if (opts.onStart) utter.onstart = opts.onStart;
    currentUtterance = utter;
    window.speechSynthesis.speak(utter);
  }

  function speakWord(word) { speak(word); }

  /* ---- Panel Toggle Helper ---- */
  function togglePanelArchive(panelName, archiveId, dailyId, btnId) {
    const archive = document.getElementById(archiveId);
    const daily = document.getElementById(dailyId);
    const btn = document.getElementById(btnId);
    if (archive.style.display === 'none' || !archive.style.display) {
      archive.style.display = 'block';
      daily.style.display = 'none';
      btn.classList.add('active');
      btn.textContent = '📰 ' + I18n.t('eng.todayLabel');
      if (panelName === 'listen') renderListenArchive();
      if (panelName === 'speak') renderSpeakArchive();
      if (panelName === 'expr') renderExprArchive();
    } else {
      archive.style.display = 'none';
      daily.style.display = 'block';
      btn.classList.remove('active');
      btn.textContent = I18n.t('eng.historyLabel');
    }
  }

  /* ================================================
     DAILY NEWS TAB — fetch from internet, fallback to pool
     ================================================ */
  async function getTodayArticle() {
    const today = todayStr();
    let history = loadHistory();

    // Check cache
    if (history[today] && history[today].content) {
      return {
        article: history[today].content,
        userVocab: history[today].userVocab || [],
        completed: history[today].completed || false,
        date: today
      };
    }

    // Fetch fresh content
    showLoading('eng-news-body');
    showLoading('eng-news-vocab-list');
    let article = await Fetcher.fetchEnglishNews();

    // Fallback to static pool
    if (!article) {
      var idx = dateIndexForPool(today, ENGLISH_ARTICLE_POOL.length);
      article = ENGLISH_ARTICLE_POOL[idx];
      App.toast(I18n.t('toast.cached'), 'info');
    }

    history[today] = { content: article, userVocab: [], completed: false };
    saveHistory(history);

    return { article: article, userVocab: [], completed: false, date: today };
  }

  /* ---- Mark article as completed (archive into library) ---- */
  function completeArticle() {
    var today = todayStr();
    var history = loadHistory();
    if (!history[today] || !history[today].content) return;
    history[today].completed = true;
    history[today].completedAt = new Date().toISOString();
    saveHistory(history);
    // Update button UI
    var btn = document.getElementById('eng-news-complete-btn');
    if (btn) {
      btn.classList.add('completed');
      btn.innerHTML = '<span>✓</span> ' + I18n.t('eng.completed');
      btn.disabled = true;
    }
    // Show word count badge
    var bar = document.getElementById('eng-news-complete-bar');
    if (bar) {
      var wc = history[today].content.wordCount || 0;
      var msg = bar.querySelector('.complete-status');
      if (msg) msg.textContent = I18n.t('eng.completeGreat', { n: wc });
    }
    App.toast(I18n.t('toast.articleArchived'), 'success');
  }

  /* ---- Update completion UI based on stored state ---- */
  function updateCompleteUI(completed) {
    var btn = document.getElementById('eng-news-complete-btn');
    var bar = document.getElementById('eng-news-complete-bar');
    if (!btn) return;
    if (completed) {
      btn.classList.add('completed');
      btn.innerHTML = '<span>✓</span> ' + I18n.t('eng.completed');
      btn.disabled = true;
      if (bar) {
        bar.classList.add('done');
        var wc = (currentArticle && currentArticle.wordCount) || 0;
        var msg = bar.querySelector('.complete-status');
        if (msg) msg.textContent = I18n.t('eng.completeDone', { n: wc });
      }
    } else {
      btn.classList.remove('completed');
      btn.innerHTML = '<span>✓</span> ' + I18n.t('eng.markRead');
      btn.disabled = false;
      if (bar) {
        bar.classList.remove('done');
        var msg2 = bar.querySelector('.complete-status');
        if (msg2) msg2.textContent = I18n.t('eng.completeStatus');
      }
    }
  }

  async function renderDailyNews() {
    var todayInfo = await getTodayArticle();
    currentArticle = todayInfo.article;
    currentUserVocab = todayInfo.userVocab;

    var news = todayInfo.article;
    document.getElementById('eng-news-source').textContent = news.source;
    document.getElementById('eng-news-date').textContent = fmtDate(todayInfo.date);
    document.getElementById('eng-news-title').textContent = news.title;
    document.getElementById('eng-news-body').innerHTML = news.body;

    // Show word count badge
    var wcEl = document.getElementById('eng-news-wordcount');
    if (wcEl && news.wordCount) {
      wcEl.textContent = news.wordCount + ' words';
      wcEl.style.display = 'inline-block';
    } else if (wcEl) {
      wcEl.style.display = 'none';
    }

    var vocabList = document.getElementById('eng-news-vocab-list');
    var vocabs = news.vocab || [];
    if (vocabs.length === 0) {
      vocabList.innerHTML = '<div style="padding:12px;color:var(--text-muted);font-size:13px;">No auto-vocabulary available for this article.</div>';
    } else {
      vocabList.innerHTML = vocabs.map(function (v) {
        return '<div class="vocab-item" onclick="English.speakWord(\'' + v.word.replace(/'/g, "\\'") + '\')">' +
          '<div class="vocab-word">' + v.word + '</div>' +
          '<div class="vocab-phonetic">' + (v.phonetic || '') + '</div>' +
          '<div class="vocab-meaning">' + (v.meaning || '') + '</div>' +
          '</div>';
      }).join('');
    }

    document.querySelectorAll('#eng-news-body .highlight').forEach(function (el) {
      el.addEventListener('click', function () {
        speak(el.dataset.word);
        App.toast('🔊 ' + el.dataset.word, 'info');
      });
    });

    document.getElementById('eng-news-body').addEventListener('click', function (e) {
      var sel = window.getSelection();
      var word = sel.toString().trim();
      if (!word || word.length < 2 || word.length > 40) {
        document.getElementById('word-popup').style.display = 'none';
        return;
      }
      if (e.target.classList.contains('highlight')) {
        document.getElementById('word-popup').style.display = 'none';
        return;
      }
      if (word.split(/\s+/).length > 5) return;
      var popup = document.getElementById('word-popup');
      document.getElementById('word-popup-text').textContent = word;
      popup.style.display = 'block';
      popup.style.left = e.clientX + 'px';
      popup.style.top = (e.clientY - 40) + 'px';
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#eng-news-body') && !e.target.closest('#word-popup')) {
        document.getElementById('word-popup').style.display = 'none';
      }
    });

    document.getElementById('word-popup-add').onclick = function () {
      var word = document.getElementById('word-popup-text').textContent;
      addUserVocab(word);
      document.getElementById('word-popup').style.display = 'none';
    };

    renderUserVocab();

    // Update completion UI
    updateCompleteUI(todayInfo.completed);
  }

  function addUserVocab(word) {
    if (currentUserVocab.includes(word)) {
      App.toast(I18n.t('toast.vocabExists', { word: word }), 'info');
      return;
    }
    currentUserVocab.push(word);
    var history = loadHistory();
    var today = todayStr();
    if (history[today]) {
      history[today].userVocab = currentUserVocab;
      saveHistory(history);
    }
    addToVocabLib(word);
    renderUserVocab();
    App.toast(I18n.t('toast.vocabAdded', { word: word }), 'success');
  }

  function addToVocabLib(word) {
    var lib = loadVocabLib();
    if (!lib.find(function (v) { return v.word.toLowerCase() === word.toLowerCase(); })) {
      var source = currentArticle ? currentArticle.source + ' — ' + currentArticle.title : 'Daily News';
      lib.push({
        word: word, phonetic: '', meaning: '',
        source: source,
        dateAdded: todayStr(), mastered: false
      });
      saveVocabLib(lib);
    }
  }

  function renderUserVocab() {
    var section = document.getElementById('eng-user-vocab');
    var list = document.getElementById('eng-user-vocab-list');
    if (currentUserVocab.length === 0) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    list.innerHTML = currentUserVocab.map(function (w) {
      return '<div class="vocab-item user-vocab-item">' +
        '<div class="vocab-word">' + w + '</div>' +
        '<button class="vocab-remove-btn" onclick="English.removeUserVocab(\'' + w.replace(/'/g, "\\'") + '\')" title="Remove">×</button>' +
        '</div>';
    }).join('');
  }

  function removeUserVocab(word) {
    currentUserVocab = currentUserVocab.filter(function (w) { return w !== word; });
    var history = loadHistory();
    var today = todayStr();
    if (history[today]) { history[today].userVocab = currentUserVocab; saveHistory(history); }
    renderUserVocab();
    App.toast(I18n.t('toast.vocabRemoved', { word: word }), 'info');
  }

  /* ---- Read Aloud ---- */
  function readAloud(targetId) {
    var btn = document.querySelector('[data-target="' + targetId + '"]');
    var target = document.getElementById(targetId);
    if (btn.classList.contains('reading')) {
      window.speechSynthesis.cancel();
      btn.classList.remove('reading');
      btn.innerHTML = '<span>🔊</span> ' + I18n.t('common.readAloud');
      return;
    }
    var text = target.innerText;
    btn.classList.add('reading');
    btn.innerHTML = '<span>⏸</span> ' + I18n.t('common.stop');
    speak(text, {
      onEnd: function () {
        btn.classList.remove('reading');
        btn.innerHTML = '<span>🔊</span> ' + I18n.t('common.readAloud');
      }
    });
  }

  function localizeReadAloudButtons() {
    document.querySelectorAll('.read-aloud-btn').forEach(function (btn) {
      if (!btn.classList.contains('reading')) {
        btn.innerHTML = '<span>🔊</span> ' + I18n.t('common.readAloud');
      }
    });
  }

  /* ================================================
     ARCHIVE TAB (News) — reads stored content
     ================================================ */
  function renderArchive(filterText) {
    var history = loadHistory();
    var list = document.getElementById('eng-archive-list');
    var empty = document.getElementById('eng-archive-empty');
    // Only show articles that have been marked as completed
    var dates = Object.keys(history).filter(function (d) {
      return history[d].completed && history[d].content;
    }).sort().reverse();

    if (dates.length === 0) { list.innerHTML = ''; empty.style.display = 'flex'; return; }
    empty.style.display = 'none';
    var ft = (filterText || '').toLowerCase();

    var html = '';
    dates.forEach(function (dateStr) {
      var entry = history[dateStr];
      var article = entry.content || ENGLISH_ARTICLE_POOL[entry.articleIndex];
      if (!article) return;
      if (ft && !article.title.toLowerCase().includes(ft) && !article.source.toLowerCase().includes(ft)) return;
      var isToday = dateStr === todayStr();
      var label = isToday ? I18n.t('eng.todayLabel') : fmtDate(dateStr);
      var userCount = (entry.userVocab || []).length;
      var autoCount = (article.vocab || []).length;
      var wc = article.wordCount || 0;

      html += '<div class="archive-article-card" onclick="English.openArchivedArticle(\'' + dateStr + '\')">' +
        '<div class="archive-article-header">' +
        '<span class="archive-article-date">' + label + '</span>' +
        '<span class="archive-article-source">' + article.source + '</span>' +
        '</div>' +
        '<h3 class="archive-article-title">' + article.title + '</h3>' +
        '<div class="archive-article-meta">' +
        '<span class="archive-vocab-count">📖 ' + autoCount + ' auto + ' + userCount + ' marked' + (wc > 0 ? ' · ' + wc + ' words' : '') + '</span>' +
        '<span class="archive-arrow">→</span>' +
        '</div></div>';
    });

    list.innerHTML = html || '<div class="empty-state" style="display:flex;"><div class="empty-icon">🔍</div><p class="empty-title">No matching articles</p></div>';
  }

  function openArchivedArticle(dateStr) {
    var history = loadHistory();
    var entry = history[dateStr];
    if (!entry) return;
    var article = entry.content || ENGLISH_ARTICLE_POOL[entry.articleIndex];
    if (!article) return;
    switchEngTab('news');
    document.getElementById('eng-news-source').textContent = article.source + ' (Archived)';
    document.getElementById('eng-news-date').textContent = fmtDate(dateStr);
    document.getElementById('eng-news-title').textContent = article.title;
    document.getElementById('eng-news-body').innerHTML = article.body;

    // Word count badge
    var wcEl = document.getElementById('eng-news-wordcount');
    if (wcEl && article.wordCount) {
      wcEl.textContent = article.wordCount + ' words';
      wcEl.style.display = 'inline-block';
    } else if (wcEl) {
      wcEl.style.display = 'none';
    }

    var vocabs = article.vocab || [];
    document.getElementById('eng-news-vocab-list').innerHTML = vocabs.map(function (v) {
      return '<div class="vocab-item" onclick="English.speakWord(\'' + v.word.replace(/'/g, "\\'") + '\')">' +
        '<div class="vocab-word">' + v.word + '</div>' +
        '<div class="vocab-phonetic">' + (v.phonetic || '') + '</div>' +
        '<div class="vocab-meaning">' + (v.meaning || '') + '</div></div>';
    }).join('');

    currentUserVocab = entry.userVocab || [];
    currentArticle = article;
    renderUserVocab();

    // Show as completed since all archived articles are completed
    updateCompleteUI(true);

    App.toast(I18n.t('toast.viewingArticle', { date: fmtDate(dateStr) }), 'info');
  }

  function switchEngTab(tab) {
    document.querySelectorAll('[data-eng-tab]').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.eng-panel').forEach(function (p) { p.classList.remove('active'); });
    var btn = document.querySelector('[data-eng-tab="' + tab + '"]');
    if (btn) btn.classList.add('active');
    var panel = document.getElementById('eng-' + tab);
    if (panel) panel.classList.add('active');
    if (isPlaying) { window.speechSynthesis.cancel(); isPlaying = false; }
  }

  /* ================================================
     VOCAB LIBRARY TAB
     ================================================ */
  function renderVocabLib(filterText) {
    var lib = loadVocabLib();
    var grid = document.getElementById('vocablib-grid');
    var empty = document.getElementById('vocablib-empty');
    var totalEl = document.getElementById('vocablib-total');
    var masteredEl = document.getElementById('vocablib-mastered');
    syncAutoVocab();
    var updatedLib = loadVocabLib();
    var ft = (filterText || '').toLowerCase();
    var filtered = ft
      ? updatedLib.filter(function (v) { return v.word.toLowerCase().includes(ft) || v.meaning.toLowerCase().includes(ft) || v.source.toLowerCase().includes(ft); })
      : updatedLib;
    var masteredCount = updatedLib.filter(function (v) { return v.mastered; }).length;
    totalEl.textContent = updatedLib.length;
    masteredEl.textContent = masteredCount;
    if (filtered.length === 0) { grid.innerHTML = ''; empty.style.display = 'flex'; return; }
    empty.style.display = 'none';
    grid.innerHTML = filtered.map(function (v, i) {
      return '<div class="vocablib-card ' + (v.mastered ? 'mastered' : '') + '">' +
        '<div class="vocablib-card-inner">' +
        '<div class="vocablib-word" onclick="English.speakWord(\'' + v.word.replace(/'/g, "\\'") + '\')">' + v.word + '</div>' +
        (v.phonetic ? '<div class="vocablib-phonetic">' + v.phonetic + '</div>' : '') +
        (v.meaning ? '<div class="vocablib-meaning">' + v.meaning + '</div>' : '') +
        '<div class="vocablib-source">' + v.source + '</div>' +
        '<div class="vocablib-date">Added ' + fmtDate(v.dateAdded) + '</div>' +
        '</div>' +
        '<div class="vocablib-actions">' +
        '<button class="vocablib-master-btn ' + (v.mastered ? 'unmaster' : '') + '" onclick="English.toggleMasterVocab(\'' + v.word.replace(/'/g, "\\'") + '\')">' + (v.mastered ? '↩ Unmark' : '✓ Mastered') + '</button>' +
        '<button class="vocablib-del-btn" onclick="English.deleteVocab(\'' + v.word.replace(/'/g, "\\'") + '\')" title="Delete">×</button>' +
        '</div></div>';
    }).join('');
  }

  function syncAutoVocab() {
    var history = loadHistory();
    var lib = loadVocabLib();
    var changed = false;
    Object.keys(history).forEach(function (dateStr) {
      var entry = history[dateStr];
      var article = entry.content || ENGLISH_ARTICLE_POOL[entry.articleIndex];
      if (!article || !article.vocab) return;
      article.vocab.forEach(function (v) {
        if (!lib.find(function (l) { return l.word.toLowerCase() === v.word.toLowerCase(); })) {
          lib.push({ word: v.word, phonetic: v.phonetic, meaning: v.meaning, source: article.source + ' — ' + article.title, dateAdded: dateStr, mastered: false });
          changed = true;
        }
      });
    });
    if (changed) saveVocabLib(lib);
  }

  function toggleMasterVocab(wordText) {
    var lib = loadVocabLib();
    var libIdx = lib.findIndex(function (v) { return v.word === wordText; });
    if (libIdx === -1) return;
    lib[libIdx].mastered = !lib[libIdx].mastered;
    saveVocabLib(lib);
    renderVocabLib(document.getElementById('vocablib-search').value);
  }

  function deleteVocab(wordText) {
    var newLib = loadVocabLib().filter(function (v) { return v.word !== wordText; });
    saveVocabLib(newLib);
    App.toast(I18n.t('toast.vocabLibRemoved', { word: wordText }), 'info');
    renderVocabLib(document.getElementById('vocablib-search').value);
  }

  /* ================================================
     LISTENING — fetch from internet, fallback to pool
     ================================================ */
  async function getTodayListening() {
    var today = todayStr();
    var history = loadJson(LISTEN_KEY);

    if (history[today] && history[today].content) {
      return { item: history[today].content, date: today };
    }

    showLoading('eng-listen-transcript');
    var item = await Fetcher.fetchEnglishListening();

    if (!item) {
      var idx = dateIndexForPool(today, CONTENT.englishListening.length);
      item = CONTENT.englishListening[idx];
      App.toast(I18n.t('toast.cached'), 'info');
    }

    history[today] = { content: item };
    saveJson(LISTEN_KEY, history);
    return { item: item, date: today };
  }

  async function renderListening() {
    var info = await getTodayListening();
    currentListenItem = info.item;
    var item = info.item;

    document.getElementById('eng-listen-date-label').textContent = I18n.t('eng.listenDateLabel') + ' — ' + fmtDate(info.date);
    document.getElementById('eng-listen-title').textContent = item.title;
    var transcript = document.getElementById('eng-listen-transcript');
    transcript.innerHTML = item.sentences.map(function (s, i) {
      return '<span class="sentence" data-idx="' + i + '">' + s + ' </span>';
    }).join('');
    transcript.querySelectorAll('.sentence').forEach(function (el) {
      el.addEventListener('click', function () { playListening(parseInt(el.dataset.idx)); });
    });
  }

  function playListening(startIdx) {
    var playBtn = document.getElementById('eng-play-btn');
    if (isPlaying) {
      window.speechSynthesis.cancel();
      isPlaying = false;
      playBtn.classList.remove('playing');
      playBtn.innerHTML = '<span class="play-icon">▶</span>';
      document.querySelectorAll('.transcript .sentence').forEach(function (s) { s.classList.remove('speaking'); });
      return;
    }
    if (!currentListenItem) return;
    isPlaying = true;
    playBtn.classList.add('playing');
    playBtn.innerHTML = '<span class="play-icon">⏸</span>';
    currentSentenceIdx = startIdx || 0;
    playNextSentence();
  }

  function playNextSentence() {
    if (!currentListenItem) return;
    if (currentSentenceIdx >= currentListenItem.sentences.length) {
      isPlaying = false;
      document.getElementById('eng-play-btn').classList.remove('playing');
      document.getElementById('eng-play-btn').innerHTML = '<span class="play-icon">▶</span>';
      document.querySelectorAll('.transcript .sentence').forEach(function (s) { s.classList.remove('speaking'); });
      return;
    }
    document.querySelectorAll('.transcript .sentence').forEach(function (s) { s.classList.remove('speaking'); });
    var currentEl = document.querySelector('.transcript .sentence[data-idx="' + currentSentenceIdx + '"]');
    if (currentEl) currentEl.classList.add('speaking');
    speak(currentListenItem.sentences[currentSentenceIdx], {
      onEnd: function () { currentSentenceIdx++; if (isPlaying) playNextSentence(); }
    });
  }

  function renderListenArchive(filterText) {
    var history = loadJson(LISTEN_KEY);
    var list = document.getElementById('eng-listen-archive-list');
    var empty = document.getElementById('eng-listen-archive-empty');
    var dates = Object.keys(history).sort().reverse();
    if (dates.length === 0) { list.innerHTML = ''; empty.style.display = 'flex'; return; }
    empty.style.display = 'none';
    var ft = (filterText || '').toLowerCase();

    list.innerHTML = dates.filter(function (d) {
      var item = history[d].content || CONTENT.englishListening[history[d].index];
      return item && (!ft || item.title.toLowerCase().includes(ft));
    }).map(function (d) {
      var item = history[d].content || CONTENT.englishListening[history[d].index];
      var isToday = d === todayStr();
      return '<div class="archive-article-card" onclick="English.openListenArchive(\'' + d + '\')">' +
        '<div class="archive-article-header">' +
        '<span class="archive-article-date">' + (isToday ? I18n.t('eng.todayLabel') : fmtDate(d)) + '</span>' +
        '<span class="archive-article-source">' + I18n.t('eng.listenTag') + '</span>' +
        '</div>' +
        '<h3 class="archive-article-title">' + item.title + '</h3>' +
        '<div class="archive-article-meta">' +
        '<span class="archive-vocab-count">' + item.sentences.length + ' sentences</span>' +
        '<span class="archive-arrow">→</span>' +
        '</div></div>';
    }).join('');
  }

  function openListenArchive(dateStr) {
    var history = loadJson(LISTEN_KEY);
    var entry = history[dateStr];
    if (!entry) return;
    var item = entry.content || CONTENT.englishListening[entry.index];
    if (!item) return;
    currentListenItem = item;
    document.getElementById('eng-listen-archive').style.display = 'none';
    document.getElementById('eng-listen-daily').style.display = 'block';
    document.getElementById('eng-listen-history-btn').classList.remove('active');
    document.getElementById('eng-listen-history-btn').textContent = I18n.t('eng.historyLabel');
    document.getElementById('eng-listen-date-label').textContent = I18n.t('eng.archivedLabel') + ' — ' + fmtDate(dateStr);
    document.getElementById('eng-listen-title').textContent = item.title;
    var transcript = document.getElementById('eng-listen-transcript');
    transcript.innerHTML = item.sentences.map(function (s, i) {
      return '<span class="sentence" data-idx="' + i + '">' + s + ' </span>';
    }).join('');
    transcript.querySelectorAll('.sentence').forEach(function (el) {
      el.addEventListener('click', function () { playListening(parseInt(el.dataset.idx)); });
    });
    App.toast(I18n.t('toast.viewingListening', { date: fmtDate(dateStr) }), 'info');
  }

  /* ================================================
     SPEAKING — fetch from internet, fallback to pool
     ================================================ */
  async function getTodaySpeaking() {
    var today = todayStr();
    var history = loadJson(SPEAK_KEY);

    if (history[today] && history[today].content) {
      return { item: history[today].content, date: today };
    }

    showLoading('eng-speak-prompt');
    var item = await Fetcher.fetchEnglishSpeaking();

    if (!item) {
      var idx = dateIndexForPool(today, CONTENT.englishSpeaking.length);
      item = CONTENT.englishSpeaking[idx];
      App.toast(I18n.t('toast.cached'), 'info');
    }

    history[today] = { content: item };
    saveJson(SPEAK_KEY, history);
    return { item: item, date: today };
  }

  async function renderSpeaking() {
    var info = await getTodaySpeaking();
    currentSpeakItem = info.item;
    var item = info.item;
    document.getElementById('eng-speak-date-label').textContent = I18n.t('eng.speakDateLabel') + ' — ' + fmtDate(info.date);
    document.getElementById('eng-speak-prompt').textContent = item.prompt;
    document.getElementById('eng-speak-sentence').textContent = item.sentence;
    document.getElementById('eng-speak-tips').textContent = item.tips;
    var speakRecordBtn = document.getElementById('eng-speak-record');
    if (speakRecordBtn && !speakRecordBtn.classList.contains('recording')) {
      var rt = speakRecordBtn.querySelector('.record-text');
      if (rt) rt.textContent = I18n.t('eng.record');
    }
  }

  function playSpeaking() {
    if (!currentSpeakItem) return;
    speak(currentSpeakItem.sentence, { rate: 0.9 });
  }

  function toggleRecord() {
    var btn = document.getElementById('eng-speak-record');
    var recordText = btn.querySelector('.record-text');
    if (btn.classList.contains('recording')) {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      btn.classList.remove('recording');
      recordText.textContent = I18n.t('eng.record');
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      App.toast(I18n.t('toast.noRecord'), 'warn');
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.addEventListener('dataavailable', function (e) { audioChunks.push(e.data); });
      mediaRecorder.addEventListener('stop', function () {
        var audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        var audio = new Audio(URL.createObjectURL(audioBlob));
        audio.play();
        App.toast(I18n.t('toast.playRecording'), 'success');
        stream.getTracks().forEach(function (t) { t.stop(); });
      });
      mediaRecorder.start();
      btn.classList.add('recording');
      recordText.textContent = I18n.t('eng.stop');
      App.toast(I18n.t('toast.recording'), 'info');
    }).catch(function () { App.toast(I18n.t('toast.noMic'), 'warn'); });
  }

  function renderSpeakArchive(filterText) {
    var history = loadJson(SPEAK_KEY);
    var list = document.getElementById('eng-speak-archive-list');
    var empty = document.getElementById('eng-speak-archive-empty');
    var dates = Object.keys(history).sort().reverse();
    if (dates.length === 0) { list.innerHTML = ''; empty.style.display = 'flex'; return; }
    empty.style.display = 'none';
    var ft = (filterText || '').toLowerCase();

    list.innerHTML = dates.filter(function (d) {
      var item = history[d].content || CONTENT.englishSpeaking[history[d].index];
      return item && (!ft || item.prompt.toLowerCase().includes(ft) || item.sentence.toLowerCase().includes(ft));
    }).map(function (d) {
      var item = history[d].content || CONTENT.englishSpeaking[history[d].index];
      var isToday = d === todayStr();
      var preview = item.sentence.length > 80 ? item.sentence.substring(0, 80) + '...' : item.sentence;
      return '<div class="archive-article-card" onclick="English.openSpeakArchive(\'' + d + '\')">' +
        '<div class="archive-article-header">' +
        '<span class="archive-article-date">' + (isToday ? I18n.t('eng.todayLabel') : fmtDate(d)) + '</span>' +
        '<span class="archive-article-source">' + I18n.t('eng.speakingTag') + '</span>' +
        '</div>' +
        '<h3 class="archive-article-title">' + item.prompt + '</h3>' +
        '<div class="archive-article-meta">' +
        '<span class="archive-vocab-count">' + preview + '</span>' +
        '<span class="archive-arrow">→</span>' +
        '</div></div>';
    }).join('');
  }

  function openSpeakArchive(dateStr) {
    var history = loadJson(SPEAK_KEY);
    var entry = history[dateStr];
    if (!entry) return;
    var item = entry.content || CONTENT.englishSpeaking[entry.index];
    if (!item) return;
    currentSpeakItem = item;
    document.getElementById('eng-speak-archive').style.display = 'none';
    document.getElementById('eng-speak-daily').style.display = 'block';
    document.getElementById('eng-speak-history-btn').classList.remove('active');
    document.getElementById('eng-speak-history-btn').textContent = I18n.t('eng.historyLabel');
    document.getElementById('eng-speak-date-label').textContent = I18n.t('eng.archivedLabel') + ' — ' + fmtDate(dateStr);
    document.getElementById('eng-speak-prompt').textContent = item.prompt;
    document.getElementById('eng-speak-sentence').textContent = item.sentence;
    document.getElementById('eng-speak-tips').textContent = item.tips;
    App.toast(I18n.t('toast.viewingSpeaking', { date: fmtDate(dateStr) }), 'info');
  }

  /* ================================================
     ADVANCED EXPRESSION — fetch from internet, fallback to pool
     ================================================ */
  async function getTodayExpression() {
    var today = todayStr();
    var history = loadJson(EXPR_KEY);

    if (history[today] && history[today].content) {
      return { item: history[today].content, date: today };
    }

    showLoading('eng-expr-word');
    var item = await Fetcher.fetchEnglishExpression();

    if (!item) {
      var idx = dateIndexForPool(today, CONTENT.englishExpressions.length);
      item = CONTENT.englishExpressions[idx];
      App.toast(I18n.t('toast.cached'), 'info');
    }

    history[today] = { content: item };
    saveJson(EXPR_KEY, history);
    return { item: item, date: today };
  }

  async function renderExpression() {
    var info = await getTodayExpression();
    currentExprItem = info.item;
    var expr = info.item;
    document.getElementById('eng-expr-date-label').textContent = I18n.t('eng.exprDateLabel') + ' — ' + fmtDate(info.date);
    document.getElementById('eng-expr-word').textContent = expr.word;
    document.getElementById('eng-expr-pron').textContent = expr.pronunciation || '';
    document.getElementById('eng-expr-meaning').innerHTML = '<strong>' + I18n.t('eng.meaningLabel') + '</strong> ' + expr.meaning;
    document.getElementById('eng-expr-example').textContent = expr.example;
    document.getElementById('eng-expr-usage').innerHTML = '<strong>' + I18n.t('eng.usageLabel') + '</strong> ' + (expr.usage || '');
  }

  function speakExpression() {
    if (!currentExprItem) return;
    speak(currentExprItem.word, { rate: 0.8 });
    setTimeout(function () { speak(currentExprItem.example, { rate: 0.85 }); }, 1500);
  }

  function renderExprArchive(filterText) {
    var history = loadJson(EXPR_KEY);
    var list = document.getElementById('eng-expr-archive-list');
    var empty = document.getElementById('eng-expr-archive-empty');
    var dates = Object.keys(history).sort().reverse();
    if (dates.length === 0) { list.innerHTML = ''; empty.style.display = 'flex'; return; }
    empty.style.display = 'none';
    var ft = (filterText || '').toLowerCase();

    list.innerHTML = dates.filter(function (d) {
      var item = history[d].content || CONTENT.englishExpressions[history[d].index];
      return item && (!ft || item.word.toLowerCase().includes(ft) || item.meaning.toLowerCase().includes(ft));
    }).map(function (d) {
      var item = history[d].content || CONTENT.englishExpressions[history[d].index];
      var isToday = d === todayStr();
      return '<div class="archive-article-card" onclick="English.openExprArchive(\'' + d + '\')">' +
        '<div class="archive-article-header">' +
        '<span class="archive-article-date">' + (isToday ? I18n.t('eng.todayLabel') : fmtDate(d)) + '</span>' +
        '<span class="archive-article-source">' + I18n.t('eng.advancedExpr') + '</span>' +
        '</div>' +
        '<h3 class="archive-article-title">' + item.word + '</h3>' +
        '<div class="archive-article-meta">' +
        '<span class="archive-vocab-count">' + item.meaning + '</span>' +
        '<span class="archive-arrow">→</span>' +
        '</div></div>';
    }).join('');
  }

  function openExprArchive(dateStr) {
    var history = loadJson(EXPR_KEY);
    var entry = history[dateStr];
    if (!entry) return;
    var expr = entry.content || CONTENT.englishExpressions[entry.index];
    if (!expr) return;
    currentExprItem = expr;
    document.getElementById('eng-expr-archive').style.display = 'none';
    document.getElementById('eng-expr-daily').style.display = 'block';
    document.getElementById('eng-expr-history-btn').classList.remove('active');
    document.getElementById('eng-expr-history-btn').textContent = I18n.t('eng.historyLabel');
    document.getElementById('eng-expr-date-label').textContent = I18n.t('eng.archivedLabel') + ' — ' + fmtDate(dateStr);
    document.getElementById('eng-expr-word').textContent = expr.word;
    document.getElementById('eng-expr-pron').textContent = expr.pronunciation || '';
    document.getElementById('eng-expr-meaning').innerHTML = '<strong>Meaning:</strong> ' + expr.meaning;
    document.getElementById('eng-expr-example').textContent = expr.example;
    document.getElementById('eng-expr-usage').innerHTML = '<strong>' + I18n.t('eng.usageLabel') + '</strong> ' + (expr.usage || '');
    App.toast(I18n.t('toast.viewingExpression', { date: fmtDate(dateStr) }), 'info');
  }

  /* ================================================
     INITIALIZATION
     ================================================ */
  function init() {
    // Kick off all async renders (parallel)
    renderDailyNews();
    renderListening();
    renderSpeaking();
    renderExpression();

    // Sub-nav switching
    document.querySelectorAll('[data-eng-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-eng-tab]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.eng-panel').forEach(function (p) { p.classList.remove('active'); });
        var panelId = 'eng-' + btn.dataset.engTab;
        document.getElementById(panelId).classList.add('active');
        if (isPlaying) { window.speechSynthesis.cancel(); isPlaying = false; }
        if (btn.dataset.engTab === 'archive') renderArchive();
        if (btn.dataset.engTab === 'vocablib') renderVocabLib();
      });
    });

    // Read aloud
    document.querySelectorAll('.read-aloud-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { readAloud(btn.dataset.target); });
    });

    // Mark as complete button
    var completeBtn = document.getElementById('eng-news-complete-btn');
    if (completeBtn) {
      completeBtn.addEventListener('click', function () {
        if (!completeBtn.classList.contains('completed')) {
          completeArticle();
        }
      });
    }

    // Archive search
    document.getElementById('eng-archive-search').addEventListener('input', function () {
      renderArchive(this.value);
    });

    // Vocab lib search
    document.getElementById('vocablib-search').addEventListener('input', function () {
      renderVocabLib(this.value);
    });

    // Listening
    document.getElementById('eng-play-btn').addEventListener('click', function () { playListening(); });
    document.querySelectorAll('.speed-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.speed-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        speakRate = parseFloat(btn.dataset.speed);
      });
    });

    // Speaking
    document.getElementById('eng-speak-play').addEventListener('click', playSpeaking);
    document.getElementById('eng-speak-record').addEventListener('click', toggleRecord);

    // Expression
    document.getElementById('eng-expr-speak').addEventListener('click', speakExpression);

    // Panel history toggles
    document.getElementById('eng-listen-history-btn').addEventListener('click', function () {
      togglePanelArchive('listen', 'eng-listen-archive', 'eng-listen-daily', 'eng-listen-history-btn');
    });
    document.getElementById('eng-speak-history-btn').addEventListener('click', function () {
      togglePanelArchive('speak', 'eng-speak-archive', 'eng-speak-daily', 'eng-speak-history-btn');
    });
    document.getElementById('eng-expr-history-btn').addEventListener('click', function () {
      togglePanelArchive('expr', 'eng-expr-archive', 'eng-expr-daily', 'eng-expr-history-btn');
    });

    // Archive search inputs
    document.getElementById('eng-listen-archive-search').addEventListener('input', function () {
      renderListenArchive(this.value);
    });
    document.getElementById('eng-speak-archive-search').addEventListener('input', function () {
      renderSpeakArchive(this.value);
    });
    document.getElementById('eng-expr-archive-search').addEventListener('input', function () {
      renderExprArchive(this.value);
    });

    // Re-localize dynamic panels when the language changes
    I18n.onChange(function () {
      renderDailyNews();
      renderListening();
      renderSpeaking();
      renderExpression();
      localizeReadAloudButtons();
    });
    localizeReadAloudButtons();
  }

  return {
    init: init,
    speakWord: speakWord,
    addUserVocab: addUserVocab,
    removeUserVocab: removeUserVocab,
    openArchivedArticle: openArchivedArticle,
    completeArticle: completeArticle,
    toggleMasterVocab: toggleMasterVocab,
    deleteVocab: deleteVocab,
    openListenArchive: openListenArchive,
    openSpeakArchive: openSpeakArchive,
    openExprArchive: openExprArchive
  };
})();
