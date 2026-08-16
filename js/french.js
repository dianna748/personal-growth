/* ============================================
   Bloom · French Learning Module
   Vocab / Grammar / Reading
   -- All content fetched fresh daily from the internet,
      with static pool fallback.
   ============================================ */

const French = (function () {
  /* ---- State ---- */
  let vocabBatchSize = 5;
  let vocabIndex = 0;
  let currentVocabWords = [];   // full word objects for today
  let knownVocab = new Set();
  let currentGrammarItem = null;
  let grammarSelected = -1;
  let grammarAnswered = false;
  let readingLevel = 0;
  let currentReadingItem = null;

  const PROGRESS_KEY = 'bloom_french_progress';
  const VOCAB_HISTORY_KEY = 'bloom_fr_vocab_history';
  const VOCAB_KNOWN_KEY = 'bloom_fr_vocab_known';
  const GRAMMAR_HISTORY_KEY = 'bloom_fr_grammar_history';
  const READING_HISTORY_KEY = 'bloom_fr_reading_history';

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

  /* ---- Loading state ---- */
  function showLoading(elId) {
    var el = document.getElementById(elId);
    if (el) el.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>' + I18n.t('common.fetching') + '</p></div>';
  }

  /* ---- Known Vocab persistence ---- */
  function loadKnown() {
    try { knownVocab = new Set(JSON.parse(localStorage.getItem(VOCAB_KNOWN_KEY)) || []); }
    catch (e) { knownVocab = new Set(); }
  }

  function saveKnown() {
    localStorage.setItem(VOCAB_KNOWN_KEY, JSON.stringify(Array.from(knownVocab)));
  }

  /* ---- Web Speech ---- */
  function speakFr(text, rate) {
    if (!('speechSynthesis' in window)) {
      App.toast(I18n.t('toast.noSpeech'), 'warn');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    utter.rate = rate || 0.85;
    window.speechSynthesis.speak(utter);
  }

  /* ---- Panel Toggle Helper ---- */
  function togglePanelArchive(panelName, archiveId, dailyId, btnId) {
    const archive = document.getElementById(archiveId);
    const daily = document.getElementById(dailyId);
    const btn = document.getElementById(btnId);
    if (archive.style.display === 'none' || !archive.style.display) {
      archive.style.display = 'block';
      daily.style.display = 'none';
      btn.classList.add('active');
      btn.textContent = I18n.t('fr.todayLabel');
      if (panelName === 'frvocab') renderVocabArchive();
      if (panelName === 'frgrammar') renderGrammarArchive();
      if (panelName === 'frread') renderReadArchive();
    } else {
      archive.style.display = 'none';
      daily.style.display = 'block';
      btn.classList.remove('active');
      btn.textContent = I18n.t('fr.historyLabel');
    }
  }

  /* ================================================
     VOCABULARY FLASHCARDS — fetch from internet, fallback to pool
     ================================================ */
  async function getTodayVocab() {
    var today = todayStr();
    var history = loadJson(VOCAB_HISTORY_KEY);

    if (history[today] && history[today].content) {
      return { words: history[today].content, date: today };
    }

    showLoading('fr-vocab-word');
    var words = await Fetcher.fetchFrenchVocab();

    if (!words || words.length < 3) {
      // Fallback to static pool
      var pool = CONTENT.frenchVocab;
      var numBatches = Math.floor(pool.length / vocabBatchSize);
      var batchIdx = dateIndexForPool(today, numBatches);
      var startIdx = batchIdx * vocabBatchSize;
      words = [];
      for (var i = 0; i < vocabBatchSize; i++) {
        words.push(pool[(startIdx + i) % pool.length]);
      }
      App.toast(I18n.t('toast.cached'), 'info');
    }

    history[today] = { content: words };
    saveJson(VOCAB_HISTORY_KEY, history);
    return { words: words, date: today };
  }

  async function renderVocab() {
    loadKnown();
    var info = await getTodayVocab();
    currentVocabWords = info.words;
    vocabIndex = 0;
    renderVocabCard();

    document.getElementById('fr-vocab-date-label').textContent = I18n.t('fr.vocabDateLabel') + ' — ' + fmtDate(info.date);
  }

  function renderVocabCard() {
    if (!currentVocabWords || currentVocabWords.length === 0) return;
    var item = currentVocabWords[vocabIndex];

    document.getElementById('fr-vocab-word').textContent = item.word;
    document.getElementById('fr-vocab-phon').textContent = item.phonetic || '';
    document.getElementById('fr-vocab-trans').textContent = item.translation || '';
    document.getElementById('fr-vocab-example').textContent = item.example || '';
    document.getElementById('fr-vocab-example-trans').textContent = item.exampleTrans || '';

    // Progress
    var total = currentVocabWords.length;
    document.getElementById('fr-vocab-index').textContent = (vocabIndex + 1) + ' / ' + total;
    var progress = ((vocabIndex + 1) / total) * 100;
    document.getElementById('fr-vocab-progress').style.width = progress + '%';

    // Reset flip
    var card = document.getElementById('fr-flashcard');
    card.classList.remove('flipped');
    card.classList.add('entering');
    setTimeout(function () { card.classList.remove('entering'); }, 500);

    // Known status
    var knownBtn = document.getElementById('fr-vocab-known');
    if (knownVocab.has(item.word)) {
      knownBtn.style.background = 'rgba(107, 179, 141, 0.12)';
      knownBtn.style.borderColor = 'var(--cat-study)';
      knownBtn.style.color = 'var(--cat-study)';
    } else {
      knownBtn.style.background = '';
      knownBtn.style.borderColor = '';
      knownBtn.style.color = '';
    }
  }

  function flipCard() {
    document.getElementById('fr-flashcard').classList.toggle('flipped');
    if (document.getElementById('fr-flashcard').classList.contains('flipped')) {
      if (currentVocabWords[vocabIndex]) speakFr(currentVocabWords[vocabIndex].word);
    }
  }

  function nextVocab() {
    if (!currentVocabWords.length) return;
    vocabIndex = (vocabIndex + 1) % currentVocabWords.length;
    renderVocabCard();
  }

  function prevVocab() {
    if (!currentVocabWords.length) return;
    vocabIndex = (vocabIndex - 1 + currentVocabWords.length) % currentVocabWords.length;
    renderVocabCard();
  }

  function markKnown() {
    if (!currentVocabWords[vocabIndex]) return;
    var word = currentVocabWords[vocabIndex].word;
    if (knownVocab.has(word)) {
      knownVocab.delete(word);
      App.toast(I18n.t('toast.knownRemoved'), 'info');
    } else {
      knownVocab.add(word);
      App.toast(I18n.t('toast.markedKnown'), 'success');
    }
    saveKnown();
    renderVocabCard();
  }

  /* Vocab Archive */
  function renderVocabArchive(filterText) {
    var history = loadJson(VOCAB_HISTORY_KEY);
    var list = document.getElementById('fr-vocab-archive-list');
    var empty = document.getElementById('fr-vocab-archive-empty');
    var dates = Object.keys(history).sort().reverse();
    if (dates.length === 0) { list.innerHTML = ''; empty.style.display = 'flex'; return; }
    empty.style.display = 'none';
    var ft = (filterText || '').toLowerCase();

    list.innerHTML = dates.filter(function (d) {
      var words = history[d].content;
      if (!words) return false;
      return !ft || words.some(function (w) { return w.word.toLowerCase().includes(ft); });
    }).map(function (d) {
      var words = history[d].content;
      var isToday = d === todayStr();
      var preview = words.map(function (w) { return w.word; }).join(', ');
      return '<div class="archive-article-card" onclick="French.openVocabArchive(\'' + d + '\')">' +
        '<div class="archive-article-header">' +
        '<span class="archive-article-date">' + (isToday ? I18n.t('fr.todayLabel') : fmtDate(d)) + '</span>' +
        '<span class="archive-article-source">' + I18n.t('fr.tab.vocab') + '</span>' +
        '</div>' +
        '<h3 class="archive-article-title">' + words.length + ' words</h3>' +
        '<div class="archive-article-meta">' +
        '<span class="archive-vocab-count">' + preview + '</span>' +
        '<span class="archive-arrow">→</span>' +
        '</div></div>';
    }).join('');
  }

  function openVocabArchive(dateStr) {
    var history = loadJson(VOCAB_HISTORY_KEY);
    var entry = history[dateStr];
    if (!entry || !entry.content) return;
    currentVocabWords = entry.content;
    vocabIndex = 0;
    document.getElementById('fr-vocab-archive').style.display = 'none';
    document.getElementById('fr-vocab-daily').style.display = 'block';
    document.getElementById('fr-vocab-history-btn').classList.remove('active');
    document.getElementById('fr-vocab-history-btn').textContent = I18n.t('fr.historyLabel');
    document.getElementById('fr-vocab-date-label').textContent = I18n.t('fr.archivedLabel') + ' — ' + fmtDate(dateStr);
    renderVocabCard();
    App.toast(I18n.t('toast.viewingVocab', { date: fmtDate(dateStr) }), 'info');
  }

  /* ================================================
     GRAMMAR PRACTICE — fetch from internet, fallback to pool
     ================================================ */
  async function getTodayGrammar() {
    var today = todayStr();
    var history = loadJson(GRAMMAR_HISTORY_KEY);

    if (history[today] && history[today].content) {
      return { item: history[today].content, date: today };
    }

    showLoading('fr-grammar-exercise');
    var item = await Fetcher.fetchFrenchGrammar();

    if (!item) {
      var idx = dateIndexForPool(today, CONTENT.frenchGrammar.length);
      item = CONTENT.frenchGrammar[idx];
      App.toast(I18n.t('toast.cached'), 'info');
    }

    history[today] = { content: item };
    saveJson(GRAMMAR_HISTORY_KEY, history);
    return { item: item, date: today };
  }

  async function renderGrammar() {
    var info = await getTodayGrammar();
    currentGrammarItem = info.item;
    grammarSelected = -1;
    grammarAnswered = false;
    var item = info.item;

    document.getElementById('fr-grammar-date-label').textContent = I18n.t('fr.grammarDateLabel') + ' — ' + fmtDate(info.date);
    document.getElementById('fr-grammar-topic').textContent = item.topic;
    document.getElementById('fr-grammar-rule').innerHTML = item.rule;
    document.getElementById('fr-grammar-exercise').innerHTML = item.question;
    document.getElementById('fr-grammar-feedback').className = 'grammar-feedback';
    document.getElementById('fr-grammar-feedback').textContent = '';

    var optionsEl = document.getElementById('fr-grammar-options');
    optionsEl.innerHTML = item.options.map(function (opt, i) {
      return '<div class="grammar-option" data-idx="' + i + '">' + opt + '</div>';
    }).join('');

    optionsEl.querySelectorAll('.grammar-option').forEach(function (el) {
      el.addEventListener('click', function () {
        if (grammarAnswered) return;
        optionsEl.querySelectorAll('.grammar-option').forEach(function (o) { o.classList.remove('selected'); });
        el.classList.add('selected');
        grammarSelected = parseInt(el.dataset.idx);
      });
    });

    var card = document.querySelector('.grammar-card');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'panelFadeIn 0.4s ease';
  }

  function checkGrammar() {
    if (grammarAnswered) return;
    if (grammarSelected === -1) {
      App.toast(I18n.t('toast.selectAnswer'), 'warn');
      return;
    }
    if (!currentGrammarItem) return;
    grammarAnswered = true;
    var feedback = document.getElementById('fr-grammar-feedback');
    if (grammarSelected === currentGrammarItem.answer) {
      feedback.className = 'grammar-feedback show correct';
      feedback.textContent = '✓ Correct! ' + currentGrammarItem.explanation;
      var correctEl = document.querySelector('.grammar-option[data-idx="' + currentGrammarItem.answer + '"]');
      if (correctEl) correctEl.classList.add('correct');
    } else {
      feedback.className = 'grammar-feedback show wrong';
      feedback.textContent = '✗ Not quite. ' + currentGrammarItem.explanation;
      var selectedEl = document.querySelector('.grammar-option[data-idx="' + grammarSelected + '"]');
      if (selectedEl) selectedEl.classList.add('wrong');
      var correctEl2 = document.querySelector('.grammar-option[data-idx="' + currentGrammarItem.answer + '"]');
      if (correctEl2) correctEl2.classList.add('correct');
    }

    // Mark as answered in history
    var today = todayStr();
    var history = loadJson(GRAMMAR_HISTORY_KEY);
    if (history[today]) { history[today].answered = true; saveJson(GRAMMAR_HISTORY_KEY, history); }
  }

  async function nextGrammar() {
    // Re-fetch a new grammar exercise
    var item = await Fetcher.fetchFrenchGrammar();
    if (!item) {
      // Fallback to pool rotation
      var idx = dateIndexForPool(todayStr(), CONTENT.frenchGrammar.length);
      idx = (idx + 1) % CONTENT.frenchGrammar.length;
      item = CONTENT.frenchGrammar[idx];
    }
    currentGrammarItem = item;
    grammarSelected = -1;
    grammarAnswered = false;

    document.getElementById('fr-grammar-topic').textContent = item.topic;
    document.getElementById('fr-grammar-rule').innerHTML = item.rule;
    document.getElementById('fr-grammar-exercise').innerHTML = item.question;
    document.getElementById('fr-grammar-feedback').className = 'grammar-feedback';
    document.getElementById('fr-grammar-feedback').textContent = '';

    var optionsEl = document.getElementById('fr-grammar-options');
    optionsEl.innerHTML = item.options.map(function (opt, i) {
      return '<div class="grammar-option" data-idx="' + i + '">' + opt + '</div>';
    }).join('');

    optionsEl.querySelectorAll('.grammar-option').forEach(function (el) {
      el.addEventListener('click', function () {
        if (grammarAnswered) return;
        optionsEl.querySelectorAll('.grammar-option').forEach(function (o) { o.classList.remove('selected'); });
        el.classList.add('selected');
        grammarSelected = parseInt(el.dataset.idx);
      });
    });
  }

  function renderGrammarArchive(filterText) {
    var history = loadJson(GRAMMAR_HISTORY_KEY);
    var list = document.getElementById('fr-grammar-archive-list');
    var empty = document.getElementById('fr-grammar-archive-empty');
    var dates = Object.keys(history).sort().reverse();
    if (dates.length === 0) { list.innerHTML = ''; empty.style.display = 'flex'; return; }
    empty.style.display = 'none';
    var ft = (filterText || '').toLowerCase();

    list.innerHTML = dates.filter(function (d) {
      var item = history[d].content || CONTENT.frenchGrammar[history[d].index];
      return item && (!ft || item.topic.toLowerCase().includes(ft));
    }).map(function (d) {
      var item = history[d].content || CONTENT.frenchGrammar[history[d].index];
      var isToday = d === todayStr();
      var answered = history[d].answered;
      return '<div class="archive-article-card" onclick="French.openGrammarArchive(\'' + d + '\')">' +
        '<div class="archive-article-header">' +
        '<span class="archive-article-date">' + (isToday ? I18n.t('fr.todayLabel') : fmtDate(d)) + '</span>' +
        '<span class="archive-article-source">' + I18n.t('fr.tab.grammar') + '</span>' +
        (answered ? '<span style="font-size:11px;color:var(--cat-study);">✓ Done</span>' : '') +
        '</div>' +
        '<h3 class="archive-article-title">' + item.topic + '</h3>' +
        '<div class="archive-article-meta">' +
        '<span class="archive-vocab-count">' + item.question + '</span>' +
        '<span class="archive-arrow">→</span>' +
        '</div></div>';
    }).join('');
  }

  function openGrammarArchive(dateStr) {
    var history = loadJson(GRAMMAR_HISTORY_KEY);
    var entry = history[dateStr];
    if (!entry) return;
    var item = entry.content || CONTENT.frenchGrammar[entry.index];
    if (!item) return;
    currentGrammarItem = item;
    grammarSelected = -1;
    grammarAnswered = false;
    document.getElementById('fr-grammar-archive').style.display = 'none';
    document.getElementById('fr-grammar-daily').style.display = 'block';
    document.getElementById('fr-grammar-history-btn').classList.remove('active');
    document.getElementById('fr-grammar-history-btn').textContent = I18n.t('fr.historyLabel');

    document.getElementById('fr-grammar-date-label').textContent = I18n.t('fr.archivedLabel') + ' — ' + fmtDate(dateStr);
    document.getElementById('fr-grammar-topic').textContent = item.topic;
    document.getElementById('fr-grammar-rule').innerHTML = item.rule;
    document.getElementById('fr-grammar-exercise').innerHTML = item.question;
    document.getElementById('fr-grammar-feedback').className = 'grammar-feedback';
    document.getElementById('fr-grammar-feedback').textContent = '';
    var optionsEl = document.getElementById('fr-grammar-options');
    optionsEl.innerHTML = item.options.map(function (opt, i) {
      return '<div class="grammar-option" data-idx="' + i + '">' + opt + '</div>';
    }).join('');
    optionsEl.querySelectorAll('.grammar-option').forEach(function (el) {
      el.addEventListener('click', function () {
        if (grammarAnswered) return;
        optionsEl.querySelectorAll('.grammar-option').forEach(function (o) { o.classList.remove('selected'); });
        el.classList.add('selected');
        grammarSelected = parseInt(el.dataset.idx);
      });
    });
    App.toast(I18n.t('toast.viewingGrammar', { date: fmtDate(dateStr) }), 'info');
  }

  /* ================================================
     LEVELED READING — fetch from internet, fallback to pool
     ================================================ */
  async function getTodayReading(level) {
    var today = todayStr();
    var history = loadJson(READING_HISTORY_KEY);
    var key = today + '_L' + level;

    if (history[key] && history[key].content) {
      return { item: history[key].content, date: today };
    }

    showLoading('fr-read-body');
    var item = await Fetcher.fetchFrenchReading(level);

    if (!item) {
      var articles = CONTENT.frenchReading[level];
      var idx = dateIndexForPool(today, articles.length);
      item = articles[idx];
      App.toast(I18n.t('toast.cached'), 'info');
    }

    history[key] = { content: item, level: level };
    saveJson(READING_HISTORY_KEY, history);
    return { item: item, date: today };
  }

  async function renderReading() {
    var info = await getTodayReading(readingLevel);
    currentReadingItem = info.item;
    var item = info.item;

    document.getElementById('fr-read-date-label').textContent = I18n.t('fr.readDateLabel') + ' — ' + fmtDate(info.date);
    document.getElementById('fr-read-tag').textContent = item.tag;
    document.getElementById('fr-read-level').textContent = item.level;
    document.getElementById('fr-read-title').textContent = item.title;
    document.getElementById('fr-read-body').innerHTML = item.body;
    document.getElementById('fr-read-trans-text').innerHTML = item.translation;

    document.getElementById('fr-read-trans-text').style.display = 'none';
    document.getElementById('fr-toggle-trans').textContent = I18n.t('fr.showTranslation');
    var frRa = document.querySelector('[data-target^="fr-read"]');
    if (frRa && !frRa.classList.contains('reading')) frRa.innerHTML = '<span>🔊</span> ' + I18n.t('common.readAloud');

    var card = document.querySelector('.reading-card');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'panelFadeIn 0.4s ease';
  }

  function toggleTranslation() {
    var textEl = document.getElementById('fr-read-trans-text');
    var btn = document.getElementById('fr-toggle-trans');
    if (textEl.style.display === 'none') {
      textEl.style.display = 'block';
      btn.textContent = I18n.t('fr.hideTranslation');
    } else {
      textEl.style.display = 'none';
      btn.textContent = I18n.t('fr.showTranslation');
    }
  }

  async function changeReadingLevel(level) {
    readingLevel = parseInt(level);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ readingLevel: readingLevel }));
    await renderReading();

    // Update level picker
    document.querySelectorAll('.level-btn').forEach(function (b) {
      b.classList.remove('active');
      if (parseInt(b.dataset.level) === readingLevel) b.classList.add('active');
    });
  }

  function renderReadArchive(filterText) {
    var history = loadJson(READING_HISTORY_KEY);
    var list = document.getElementById('fr-read-archive-list');
    var empty = document.getElementById('fr-read-archive-empty');
    // Keys are date_L0, date_L1, date_L2 — extract dates
    var keys = Object.keys(history).sort().reverse();
    if (keys.length === 0) { list.innerHTML = ''; empty.style.display = 'flex'; return; }
    empty.style.display = 'none';
    var ft = (filterText || '').toLowerCase();

    list.innerHTML = keys.filter(function (k) {
      var entry = history[k];
      if (!entry || !entry.content) return false;
      var item = entry.content;
      return !ft || item.title.toLowerCase().includes(ft) || item.tag.toLowerCase().includes(ft);
    }).map(function (k) {
      var entry = history[k];
      var item = entry.content;
      var datePart = k.split('_L')[0];
      var isToday = datePart === todayStr();
      return '<div class="archive-article-card" onclick="French.openReadArchive(\'' + k + '\')">' +
        '<div class="archive-article-header">' +
        '<span class="archive-article-date">' + (isToday ? I18n.t('fr.todayLabel') : fmtDate(datePart)) + '</span>' +
        '<span class="archive-article-source">📖 ' + item.tag + '</span>' +
        '</div>' +
        '<h3 class="archive-article-title">' + item.title + '</h3>' +
        '<div class="archive-article-meta">' +
        '<span class="archive-vocab-count">' + item.level + '</span>' +
        '<span class="archive-arrow">→</span>' +
        '</div></div>';
    }).join('');
  }

  function openReadArchive(key) {
    var history = loadJson(READING_HISTORY_KEY);
    var entry = history[key];
    if (!entry || !entry.content) return;
    currentReadingItem = entry.content;
    var item = entry.content;
    var datePart = key.split('_L')[0];

    document.getElementById('fr-read-archive').style.display = 'none';
    document.getElementById('fr-read-daily').style.display = 'block';
    document.getElementById('fr-read-history-btn').classList.remove('active');
    document.getElementById('fr-read-history-btn').textContent = I18n.t('fr.historyLabel');

    document.getElementById('fr-read-date-label').textContent = I18n.t('fr.archivedLabel') + ' — ' + fmtDate(datePart);
    document.getElementById('fr-read-tag').textContent = item.tag;
    document.getElementById('fr-read-level').textContent = item.level;
    document.getElementById('fr-read-title').textContent = item.title;
    document.getElementById('fr-read-body').innerHTML = item.body;
    document.getElementById('fr-read-trans-text').innerHTML = item.translation;
    document.getElementById('fr-read-trans-text').style.display = 'none';
    document.getElementById('fr-toggle-trans').textContent = I18n.t('fr.showTranslation');
    var frRa2 = document.querySelector('[data-target^="fr-read"]');
    if (frRa2 && !frRa2.classList.contains('reading')) frRa2.innerHTML = '<span>🔊</span> ' + I18n.t('common.readAloud');

    // Update level picker
    document.querySelectorAll('.level-btn').forEach(function (b) {
      b.classList.remove('active');
      if (parseInt(b.dataset.level) === (entry.level || 0)) b.classList.add('active');
    });

    App.toast(I18n.t('toast.viewingReading', { date: fmtDate(datePart) }), 'info');
  }

  /* ================================================
     INITIALIZATION
     ================================================ */
  function init() {
    loadKnown();

    // Restore reading level
    try {
      var prog = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
      if (prog.readingLevel !== undefined) readingLevel = prog.readingLevel;
    } catch (e) { }

    // Kick off async renders
    renderVocab();
    renderGrammar();
    renderReading();

    // Vocabulary
    document.getElementById('fr-flashcard').addEventListener('click', flipCard);
    document.getElementById('fr-vocab-flip').addEventListener('click', function (e) { e.stopPropagation(); flipCard(); });
    document.getElementById('fr-vocab-next').addEventListener('click', function (e) { e.stopPropagation(); nextVocab(); });
    document.getElementById('fr-vocab-prev').addEventListener('click', function (e) { e.stopPropagation(); prevVocab(); });
    document.getElementById('fr-vocab-known').addEventListener('click', function (e) { e.stopPropagation(); markKnown(); });

    // Grammar
    document.getElementById('fr-grammar-check').addEventListener('click', checkGrammar);
    document.getElementById('fr-grammar-next').addEventListener('click', function () { nextGrammar(); });

    // Reading — init level picker
    document.querySelectorAll('.level-btn').forEach(function (btn) {
      if (parseInt(btn.dataset.level) === readingLevel) btn.classList.add('active');
      else btn.classList.remove('active');
      btn.addEventListener('click', function () {
        document.querySelectorAll('.level-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        changeReadingLevel(btn.dataset.level);
      });
    });
    document.getElementById('fr-toggle-trans').addEventListener('click', toggleTranslation);

    // French read-aloud button
    document.querySelectorAll('[data-target^="fr-read"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.dataset.target);
        if (btn.classList.contains('reading')) {
          window.speechSynthesis.cancel();
          btn.classList.remove('reading');
          btn.innerHTML = '<span>🔊</span> ' + I18n.t('common.readAloud');
          return;
        }
        var text = target.innerText;
        btn.classList.add('reading');
        btn.innerHTML = '<span>⏸</span> ' + I18n.t('common.stop');
        speakFr(text, 0.8);
        setTimeout(function () {
          btn.classList.remove('reading');
          btn.innerHTML = '<span>🔊</span> ' + I18n.t('common.readAloud');
        }, text.length * 120);
      });
    });

    // Sub-nav switching
    document.querySelectorAll('[data-fr-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-fr-tab]').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.fr-panel').forEach(function (p) { p.classList.remove('active'); });
        document.getElementById('fr-' + btn.dataset.frTab).classList.add('active');
      });
    });

    // Panel history toggles
    document.getElementById('fr-vocab-history-btn').addEventListener('click', function () {
      togglePanelArchive('frvocab', 'fr-vocab-archive', 'fr-vocab-daily', 'fr-vocab-history-btn');
    });
    document.getElementById('fr-grammar-history-btn').addEventListener('click', function () {
      togglePanelArchive('frgrammar', 'fr-grammar-archive', 'fr-grammar-daily', 'fr-grammar-history-btn');
    });
    document.getElementById('fr-read-history-btn').addEventListener('click', function () {
      togglePanelArchive('frread', 'fr-read-archive', 'fr-read-daily', 'fr-read-history-btn');
    });

    // Archive search inputs
    document.getElementById('fr-vocab-archive-search').addEventListener('input', function () {
      renderVocabArchive(this.value);
    });
    document.getElementById('fr-grammar-archive-search').addEventListener('input', function () {
      renderGrammarArchive(this.value);
    });
    document.getElementById('fr-read-archive-search').addEventListener('input', function () {
      renderReadArchive(this.value);
    });

    // Re-localize dynamic panels when the language changes
    I18n.onChange(function () {
      renderVocab();
      renderGrammar();
      renderReading();
    });
  }

  return {
    init: init,
    openVocabArchive: openVocabArchive,
    openGrammarArchive: openGrammarArchive,
    openReadArchive: openReadArchive
  };
})();
