/* ============================================
   Bloom · Content Fetcher Module
   Fetches fresh learning content from the internet daily.
   APIs used (all CORS-friendly):
   - Wikipedia REST API (featured, on-this-day)
   - Wikipedia Action API (random articles)
   - Free Dictionary API (word definitions)
   - French Wikipedia / Wiktionary
   - MyMemory Translation API (fr→zh)
   ============================================ */

const Fetcher = (function () {

  /* ---- Generic fetch with timeout ---- */
  async function fetchJSON(url, timeout) {
    timeout = timeout || 12000;
    const controller = new AbortController();
    const id = setTimeout(function () { controller.abort(); }, timeout);
    try {
      var resp = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!resp.ok) return null;
      return await resp.json();
    } catch (e) {
      clearTimeout(id);
      return null;
    }
  }

  /* ---- Date helpers ---- */
  function dateStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function fmtDate(isoStr) {
    var d = new Date(isoStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /* ---- Stop words for vocab extraction ---- */
  var STOP_WORDS = new Set([
    'the','and','for','are','but','not','you','all','can','had','her','was','one','our','out','get','has','him','his','how','its','may','new','now','old','see','way','who','did','let','say','she','too','use',
    'about','after','again','being','below','could','every','first','found','great','group','house','large','learn','never','other','place','right','small','sound','still','study','their','there','these','thing','think','three','water','where','which','world','would','write',
    'although','because','between','through','without','however','another','against','according','different','important','political','national','international','government','university','american','european','australian','century','history',
    'wikipedia','article','featured','retrieved','original','archived','external','links','references','category','encyclopedia','content','license','creative','commons','foundation',
    'from','with','that','this','have','they','been','were','more','will','some','what','when','into','only','your','also','than','them','well','many','such','very','over','into','most','made','after','before','during','while','since','until','above','below','upon','among'
  ]);

  /* ================================================================
     ENGLISH: Daily News — Latest tech/economy/society articles
     Multi-strategy: In-the-News → Most-Read → Topic Search → TFA → Random
     All strategies fetch FULL article extract (500+ words target)
     ================================================================ */

  var NEWS_TOPICS = [
    // Technology
    'technolog', 'artificial intelligence', 'machine learning', 'software', 'computer', 'digital',
    'internet', 'cyber', 'algorithm', 'robot', 'automat', 'blockchain', 'crypto',
    'semiconductor', 'chip', 'processor', 'platform', 'cloud', 'saas', 'openai', 'google', 'apple',
    'microsoft', 'meta', 'amazon', 'tesla', 'nvidia', 'startup', 'venture', 'fintech', 'biotech',
    // Economy
    'econom', 'market', 'trade', 'finance', 'bank', 'invest', 'stock', 'currency', 'inflation',
    'recession', 'gdp', 'supply chain', 'tariff', 'commerce', 'corporation', 'fiscal', 'monetary',
    'debt', 'budget', 'tax', 'employment', 'labor', 'wage', 'merger', 'acquisition', 'ipo',
    // Society
    'societ', 'social', 'politic', 'govern', 'election', 'democrac', 'protest', 'immigr',
    'climate', 'environ', 'pollution', 'energy', 'health', 'pandemic', 'vaccine', 'educat',
    'inequality', 'housing', 'urban', 'populat', 'refugee', 'crisi', 'conflict', 'policy',
    'law', 'court', 'right', 'strike', 'union', 'regulatio', 'congress', 'parliament'
  ];

  function matchesTopic(title) {
    var lower = (title || '').toLowerCase();
    for (var i = 0; i < NEWS_TOPICS.length; i++) {
      if (lower.indexOf(NEWS_TOPICS[i]) !== -1) return true;
    }
    return false;
  }

  var SKIP_SECTIONS = ['see also', 'references', 'external links', 'further reading',
    'notes', 'bibliography', 'sources', 'citations', 'footnotes'];

  /* Fetch FULL Wikipedia article extract by title (not just intro) */
  async function fetchFullWikiArticle(title) {
    var url = 'https://en.wikipedia.org/w/api.php?action=query&format=json' +
      '&prop=extracts|info&inprop=url&explaintext=1&exsectionformat=plain' +
      '&titles=' + encodeURIComponent(title) + '&origin=*';
    var data = await fetchJSON(url, 15000);
    if (!data || !data.query || !data.query.pages) return null;

    var pages = Object.values(data.query.pages);
    if (pages.length === 0) return null;
    var page = pages[0];
    var extract = page.extract;
    if (!extract || extract.length < 500) return null;

    // Filter out non-content sections (References, See also, etc.)
    var sections = extract.split(/\n\n+/);
    var cleanSections = [];
    var skipping = false;
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i].trim();
      if (sec.length === 0) continue;
      var lowerSec = sec.toLowerCase().replace(/[^\w\s]/g, '').trim();
      var isSkipHeader = false;
      for (var j = 0; j < SKIP_SECTIONS.length; j++) {
        if (lowerSec === SKIP_SECTIONS[j] || lowerSec.indexOf(SKIP_SECTIONS[j]) === 0) {
          isSkipHeader = true;
          break;
        }
      }
      if (isSkipHeader) { skipping = true; continue; }
      if (skipping) {
        if (sec.length < 60) { skipping = false; continue; }
        continue;
      }
      if (sec.length < 30) continue;
      cleanSections.push(sec);
    }

    if (cleanSections.length === 0) {
      cleanSections = sections.filter(function (s) { return s.trim().length > 40; });
    }

    var cleanText = cleanSections.join('\n\n');
    var wordCount = cleanText.split(/\s+/).filter(function (w) { return w.length > 0; }).length;
    if (wordCount < 200) return null;

    var body = cleanSections.map(function (p) { return '<p>' + escapeHtml(p) + '</p>'; }).join('');
    var vocab = await extractVocabulary(cleanText);
    var pageUrl = page.fullurl || ('https://en.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_')));

    return {
      source: 'Wikipedia',
      title: page.title,
      body: body,
      vocab: vocab,
      wordCount: wordCount,
      url: pageUrl,
      fetchedAt: new Date().toISOString()
    };
  }

  async function fetchEnglishNews() {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    var feedUrl = 'https://en.wikipedia.org/api/rest_v1/feed/featured/' + yyyy + '/' + mm + '/' + dd;
    var feedData = await fetchJSON(feedUrl);

    /* Strategy 1: "In the News" — current events with linked articles */
    if (feedData && feedData.news && feedData.news.length > 0) {
      var candidates = [];
      for (var i = 0; i < feedData.news.length; i++) {
        var newsItem = feedData.news[i];
        if (newsItem.links && newsItem.links.length > 0) {
          for (var j = 0; j < newsItem.links.length; j++) {
            candidates.push(newsItem.links[j].title);
          }
        }
      }
      // Prefer topic-matching titles
      var topicMatches = candidates.filter(matchesTopic);
      var pool = topicMatches.length > 0 ? topicMatches : candidates;
      // Try up to 5 random picks from the pool
      pool.sort(function () { return Math.random() - 0.5; });
      for (var k = 0; k < Math.min(5, pool.length); k++) {
        var article = await fetchFullWikiArticle(pool[k]);
        if (article) {
          article.source = 'Wikipedia · In the News';
          return article;
        }
      }
    }

    /* Strategy 2: Most-read articles today — filter by topic */
    if (feedData && feedData.mostread && feedData.mostread.articles) {
      var topicArticles = feedData.mostread.articles.filter(function (a) {
        return matchesTopic(a.title);
      });
      var mrPool = topicArticles.length > 0 ? topicArticles : feedData.mostread.articles.slice(0, 10);
      mrPool.sort(function () { return Math.random() - 0.5; });
      for (var m = 0; m < Math.min(3, mrPool.length); m++) {
        var article = await fetchFullWikiArticle(mrPool[m].title);
        if (article) {
          article.source = 'Wikipedia · Trending';
          return article;
        }
      }
    }

    /* Strategy 3: Search for topic keywords sorted by last edit */
    var searchTopics = [
      'artificial intelligence', 'technology', 'climate change', 'global economy',
      'social media', 'cybersecurity', 'renewable energy', 'digital transformation',
      'stock market', 'startup company', 'healthcare policy', 'data privacy',
      'electric vehicle', 'quantum computing', 'space exploration', 'cryptocurrency'
    ];
    var topic = searchTopics[Math.floor(Math.random() * searchTopics.length)];
    var searchUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=search' +
      '&srsearch=' + encodeURIComponent(topic) + '&srnamespace=0&srsort=last_edit_desc' +
      '&srlimit=10&origin=*';
    var searchData = await fetchJSON(searchUrl);
    if (searchData && searchData.query && searchData.query.search) {
      var searchPool = searchData.query.search.map(function (s) { return s.title; });
      searchPool.sort(function () { return Math.random() - 0.5; });
      for (var s = 0; s < Math.min(3, searchPool.length); s++) {
        var article = await fetchFullWikiArticle(searchPool[s]);
        if (article) {
          article.source = 'Wikipedia · ' + topic.charAt(0).toUpperCase() + topic.slice(1);
          return article;
        }
      }
    }

    /* Strategy 4: Today's featured article (any topic) */
    if (feedData && feedData.tfa) {
      var tfaTitle = feedData.tfa.title;
      var article = await fetchFullWikiArticle(tfaTitle);
      if (article) {
        article.source = 'Wikipedia · Featured';
        return article;
      }
      // Fallback to summary-only if full fetch fails
      var built = await buildArticleFromSummary(feedData.tfa);
      if (built) return built;
    }

    /* Final fallback: random article */
    return await fetchRandomWikiArticle('en');
  }

  async function buildArticleFromSummary(summary) {
    if (!summary || !summary.extract) return null;
    var title = summary.title || summary.displaytitle || 'Untitled';
    var extract = summary.extract;

    var paragraphs = extract.split(/\n+/).filter(function (p) { return p.length > 40; });
    if (paragraphs.length === 0) paragraphs = [extract];

    var body = paragraphs.map(function (p) {
      return '<p>' + escapeHtml(p) + '</p>';
    }).join('');

    var vocab = await extractVocabulary(extract);
    var wordCount = extract.split(/\s+/).filter(function (w) { return w.length > 0; }).length;

    return {
      source: 'Wikipedia',
      title: title,
      body: body,
      vocab: vocab,
      wordCount: wordCount,
      url: summary.content_urls ? summary.content_urls.desktop && summary.content_urls.desktop.page : null,
      fetchedAt: new Date().toISOString()
    };
  }

  async function fetchRandomWikiArticle(lang) {
    var apiUrl = lang === 'fr'
      ? 'https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&generator=random&grnlimit=1&grnnamespace=0&exintro=1&explaintext=1&origin=*'
      : 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&generator=random&grnlimit=1&grnnamespace=0&exintro=1&explaintext=1&origin=*';

    var data = await fetchJSON(apiUrl);
    if (!data || !data.query || !data.query.pages) return null;

    var pages = Object.values(data.query.pages);
    if (pages.length === 0) return null;
    var page = pages[0];
    var extract = page.extract;
    if (!extract || extract.length < 80) return null;

    var paragraphs = extract.split(/\n+/).filter(function (p) { return p.length > 40; });
    if (paragraphs.length === 0) paragraphs = [extract];

    var body = paragraphs.map(function (p) { return '<p>' + escapeHtml(p) + '</p>'; }).join('');
    var vocab = lang === 'en' ? await extractVocabulary(extract) : [];

    return {
      source: 'Wikipedia',
      title: page.title,
      body: body,
      vocab: vocab,
      url: 'https://' + lang + '.wikipedia.org/wiki/' + encodeURIComponent(page.title.replace(/ /g, '_'))
    };
  }

  /* ---- Vocabulary extraction from text ---- */
  async function extractVocabulary(text) {
    var words = text.match(/\b[a-zA-Z]{8,}\b/g) || [];
    var unique = [];
    var seen = {};
    for (var i = 0; i < words.length; i++) {
      var w = words[i].toLowerCase();
      if (!seen[w] && !STOP_WORDS.has(w)) {
        seen[w] = true;
        unique.push(w);
      }
    }
    // Shuffle and pick top candidates
    unique.sort(function () { return Math.random() - 0.5; });
    var candidates = unique.slice(0, 12);

    var vocab = [];
    for (var j = 0; j < candidates.length && vocab.length < 6; j++) {
      var def = await fetchWordDefinition(candidates[j]);
      if (def) vocab.push(def);
    }
    return vocab;
  }

  function collectDictionarySenses(data) {
    if (!data || !Array.isArray(data)) return { phonetic: '', senses: [] };
    var phonetic = '';
    var senses = [];
    data.forEach(function (entry) {
      if (!phonetic) phonetic = entry.phonetic || '';
      if (!phonetic && entry.phonetics) {
        for (var p = 0; p < entry.phonetics.length; p++) {
          if (entry.phonetics[p].text) { phonetic = entry.phonetics[p].text; break; }
        }
      }
      (entry.meanings || []).forEach(function (meaning, meaningIndex) {
        (meaning.definitions || []).forEach(function (def, definitionIndex) {
          if (!def || !def.definition) return;
          senses.push({
            partOfSpeech: (meaning.partOfSpeech || '').toLowerCase(),
            definition: def.definition.trim(),
            example: (def.example || '').trim(),
            synonyms: (def.synonyms || []).concat(meaning.synonyms || []),
            order: meaningIndex * 20 + definitionIndex
          });
        });
      });
    });
    return { phonetic: phonetic, senses: senses };
  }

  async function fetchDictionarySenses(word) {
    var data = await fetchJSON('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word), 6500);
    return collectDictionarySenses(data);
  }

  async function fetchWordDefinition(word) {
    var result = await fetchDictionarySenses(word);
    if (!result.senses.length) return null;
    return {
      word: word,
      phonetic: result.phonetic || '/' + word + '/',
      meaning: result.senses[0].definition
    };
  }

  /* ---- Vocab enrichment: private DeepSeek function first, free sources as fallback ---- */
  function getAIConfig() {
    if (typeof window === 'undefined' || !window.Sync || !window.Sync.getConfig) return null;
    var config = window.Sync.getConfig();
    if (!config || !config.enabled || !config.url || !config.anonKey || !config.syncCode) return null;
    return config;
  }

  function cleanAIField(value, maxLength) {
    if (typeof value !== 'string') return '';
    value = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
    return value.length > maxLength ? value.slice(0, maxLength - 1) + '…' : value;
  }

  async function enrichVocabWithAI(term, sentence, context) {
    var config = getAIConfig();
    if (!config) return null;
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 24000);
    try {
      var response = await fetch(config.url.replace(/\/$/, '') + '/functions/v1/enrich-vocab', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.anonKey,
          'Authorization': 'Bearer ' + config.anonKey,
          'x-bloom-sync-code': config.syncCode
        },
        body: JSON.stringify({
          term: term,
          sentence: sentence,
          articleTitle: context && context.articleTitle ? context.articleTitle : '',
          source: context && context.source ? context.source : ''
        })
      });
      clearTimeout(timer);
      if (!response.ok) return null;
      var data = await response.json();
      if (!data || data.provider !== 'deepseek') return null;
      return {
        phonetic: cleanAIField(data.phonetic, 120),
        englishDefinition: cleanAIField(data.englishDefinition, 900),
        contextualChinese: cleanAIField(data.contextualChinese, 900),
        morphology: cleanAIField(data.morphology, 1800),
        selectedPartOfSpeech: cleanAIField(data.selectedPartOfSpeech, 80),
        providerNote: '已由 DeepSeek 根据文章例句生成，可修改后保存。'
      };
    } catch (e) {
      clearTimeout(timer);
      return null;
    }
  }

  function cleanWikiMarkup(text) {
    return (text || '')
      .replace(/<!--[^]*?-->/g, ' ')
      .replace(/<ref[^>]*>[^]*?<\/ref>/gi, ' ')
      .replace(/<ref[^>]*\/\s*>/gi, ' ')
      .replace(/\{\{(?:[^{}]|\{[^{}]*\})*\}\}/g, ' ')
      .replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1')
      .replace(/'{2,}/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async function fetchEtymology(term) {
    var url = 'https://en.wiktionary.org/w/api.php?action=parse&format=json&prop=wikitext' +
      '&page=' + encodeURIComponent(term) + '&origin=*';
    var data = await fetchJSON(url, 8000);
    var raw = data && data.parse && data.parse.wikitext && data.parse.wikitext['*'];
    if (!raw) return '';
    var englishStart = raw.search(/==English==/i);
    if (englishStart >= 0) raw = raw.slice(englishStart);
    var match = raw.match(/={3,4}Etymology(?:\s+\d+)?={3,4}([^]*?)(?=\n={3,4}[^=]|$)/i);
    if (!match) return '';
    var cleaned = cleanWikiMarkup(match[1]);
    return cleaned.length > 700 ? cleaned.slice(0, 697) + '…' : cleaned;
  }

  var CONTEXT_STOP_WORDS = new Set([
    'a','an','the','and','or','but','if','then','than','that','this','these','those','to','of','in','on','at','by','for','from','with','as','is','am','are','was','were','be','been','being','it','its','he','she','they','we','you','i','my','our','your','their','his','her','not','no','do','does','did','have','has','had','will','would','can','could','may','might','must','should','shall'
  ]);

  function contextTokens(text) {
    return (text || '').toLowerCase().match(/[a-z][a-z'-]{1,}/g) || [];
  }

  function inferContextPartOfSpeech(term, sentence) {
    var termWords = contextTokens(term);
    var words = contextTokens(sentence);
    if (termWords.length !== 1 || !words.length) return '';
    var target = termWords[0];
    var index = words.indexOf(target);
    if (index < 0) return '';
    var prev = words[index - 1] || '';
    var prev2 = words[index - 2] || '';
    var next = words[index + 1] || '';
    var verbMarkers = ['to','will','would','can','could','may','might','must','should','shall','did','does','do','not'];
    if (verbMarkers.indexOf(prev) >= 0 || (prev === 'to' && prev2 !== 'the')) return 'verb';
    if (/ing$|ed$/.test(target) && prev !== 'the') return 'verb';
    if (['a','an','the','this','that','these','those','my','your','our','their','his','her'].indexOf(prev) >= 0) return 'noun';
    if (['very','more','most','quite','rather','too','so'].indexOf(prev) >= 0) return 'adjective';
    if (next === 'of' && prev !== 'to') return 'noun';
    return '';
  }

  function chooseContextualSense(term, sentence, senses) {
    if (!senses || !senses.length) return null;
    var inferredPos = inferContextPartOfSpeech(term, sentence);
    var sentenceTokens = contextTokens(sentence).filter(function (token) {
      return !CONTEXT_STOP_WORDS.has(token) && token !== term.toLowerCase();
    });
    var abstractClues = new Set(['change','changes','changing','develop','development','future','process','event','events','story','crisis','plan','scenario','trend','trends','years','decades','projected','trajectory','trajectories','transition','demographic','market','economy','policy','technology','history','situation','gradually']);
    var literalClues = new Set(['map','paper','cloth','tablecloth','dress','fabric','clothes','arms','wings','letter','sheet']);
    var hasAbstractClue = sentenceTokens.some(function (token) { return abstractClues.has(token); });
    var hasLiteralClue = sentenceTokens.some(function (token) { return literalClues.has(token); });

    return senses.map(function (sense, index) {
      var score = 0;
      if (inferredPos && sense.partOfSpeech === inferredPos) score += 12;
      else if (inferredPos && sense.partOfSpeech && sense.partOfSpeech !== inferredPos) score -= 8;
      var senseText = [sense.definition, sense.example, (sense.synonyms || []).join(' ')].join(' ').toLowerCase();
      var senseTokens = new Set(contextTokens(senseText));
      sentenceTokens.forEach(function (token) { if (senseTokens.has(token)) score += 3; });
      if (hasAbstractClue && /happen|develop|progress|become|reveal|emerge|occur|gradual|successive/.test(senseText)) score += 9;
      if (hasLiteralClue && /fold|open|spread|cover|cloth|paper|map/.test(senseText)) score += 9;
      score -= (sense.order == null ? index : sense.order) * 0.015;
      return { sense: sense, score: score };
    }).sort(function (a, b) { return b.score - a.score; })[0].sense;
  }

  async function fetchWiktionarySenses(term) {
    var url = 'https://en.wiktionary.org/w/api.php?action=parse&format=json&prop=wikitext' +
      '&page=' + encodeURIComponent(term) + '&origin=*';
    var data = await fetchJSON(url, 8000);
    var raw = data && data.parse && data.parse.wikitext && data.parse.wikitext['*'];
    if (!raw) return [];
    var english = raw.match(/==English==([^]*?)(?=\n==[^=]+==|$)/i);
    if (!english) return [];
    var section = english[1];
    var headerRe = /^={3,4}\s*(Noun|Verb|Adjective|Adverb|Phrase|Proverb|Interjection|Preposition|Conjunction)(?:\s+\d+)?\s*={3,4}\s*$/gim;
    var headers = [];
    var match;
    while ((match = headerRe.exec(section))) headers.push({ pos: match[1].toLowerCase(), start: match.index, bodyStart: headerRe.lastIndex });
    var senses = [];
    headers.forEach(function (header, idx) {
      var body = section.slice(header.bodyStart, idx + 1 < headers.length ? headers[idx + 1].start : section.length);
      body.split('\n').forEach(function (line, lineIndex) {
        if (!/^#\s+[^#:*]/.test(line)) return;
        var definition = cleanWikiMarkup(line.replace(/^#\s+/, ''))
          .replace(/\{\{[^{}]*\}\}/g, ' ')
          .replace(/\s+/g, ' ').trim();
        if (definition.length < 4) return;
        senses.push({ partOfSpeech: header.pos === 'phrase' ? '' : header.pos, definition: definition, example: '', synonyms: [], order: lineIndex });
      });
    });
    return senses.slice(0, 24);
  }

  async function enrichVocab(term, sentence, context) {
    term = (term || '').trim();
    sentence = (sentence || '').trim();
    if (!term) return null;
    var aiResult = await enrichVocabWithAI(term, sentence, context);
    if (aiResult) return aiResult;
    var isSingleWord = term.split(/\s+/).length === 1;
    var senseResult = isSingleWord ? await fetchDictionarySenses(term) : { phonetic: '', senses: [] };
    if (!senseResult.senses.length) senseResult.senses = await fetchWiktionarySenses(term);
    var chosen = chooseContextualSense(term, sentence, senseResult.senses);
    var englishDefinition = chosen ? chosen.definition : '';
    var translations = await Promise.all([
      englishDefinition ? translateText(englishDefinition, 'en', 'zh-CN') : Promise.resolve(null),
      translateText(term, 'en', 'zh-CN'),
      isSingleWord ? fetchEtymology(term) : Promise.resolve('')
    ]);
    var contextual = translations[0] || translations[1] || '';
    if (contextual) contextual = '此处意为：' + contextual.replace(/[.。]\s*$/, '');
    var inferredPos = inferContextPartOfSpeech(term, sentence);
    return {
      phonetic: senseResult.phonetic || '',
      englishDefinition: englishDefinition,
      contextualChinese: contextual,
      morphology: translations[2] || '',
      selectedPartOfSpeech: chosen ? chosen.partOfSpeech : inferredPos,
      providerNote: englishDefinition && contextual
        ? 'DeepSeek 暂不可用，已改用免费词典并根据例句选择最接近的' + ((chosen && chosen.partOfSpeech) ? chosen.partOfSpeech + ' ' : '') + '义项。'
        : 'DeepSeek 暂不可用，已返回可用的免费词典结果；未补全字段可手动填写或重试。'
    };
  }

  /* ================================================================
     ENGLISH: Listening — Random Wikipedia article sentences
     ================================================================ */
  async function fetchEnglishListening() {
    var data = await fetchJSON('https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&generator=random&grnlimit=1&grnnamespace=0&exintro=1&explaintext=1&origin=*');
    if (!data || !data.query || !data.query.pages) return null;

    var pages = Object.values(data.query.pages);
    if (pages.length === 0) return null;
    var page = pages[0];
    var extract = page.extract;
    if (!extract || extract.length < 80) return null;

    var sentences = extract.match(/[^.!?]+[.!?]+/g) || [];
    var clean = sentences
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 25 && s.length < 220; })
      .slice(0, 8);

    if (clean.length < 3) return null;

    return {
      title: page.title,
      sentences: clean
    };
  }

  /* ================================================================
     ENGLISH: Speaking — Wikipedia "On This Day" historical events
     ================================================================ */
  async function fetchEnglishSpeaking() {
    var today = new Date();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');

    var data = await fetchJSON('https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/' + mm + '/' + dd);
    if (!data || !data.events || data.events.length === 0) return null;

    // Pick from the first 8 events randomly
    var pool = data.events.slice(0, Math.min(8, data.events.length));
    var event = pool[Math.floor(Math.random() * pool.length)];
    var text = event.text || '';
    var year = event.year;

    if (text.length < 20) return null;

    // Clean up the text for speaking
    var sentence = 'On this day, ' + (year < 0 ? Math.abs(year) + ' BC, ' : 'in ' + year + ', ') + text;

    return {
      prompt: 'Today in History (' + mm + '/' + dd + '): Read the following historical fact aloud. Focus on clear pronunciation and natural rhythm.',
      sentence: sentence,
      tips: 'Pronunciation tips:\n• Pause briefly after the year for emphasis\n• Stress key action verbs\n• Maintain a steady narrative pace\n• Let your intonation rise at clause boundaries and fall at sentence end'
    };
  }

  /* ================================================================
     ENGLISH: Expression — Wikipedia "Did You Know" + Dictionary
     ================================================================ */
  async function fetchEnglishExpression() {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');

    var data = await fetchJSON('https://en.wikipedia.org/api/rest_v1/feed/featured/' + yyyy + '/' + mm + '/' + dd);

    var dykTexts = [];
    if (data && data.dyk && Array.isArray(data.dyk)) {
      dykTexts = data.dyk.map(function (item) {
        if (typeof item === 'string') return item;
        return item.text || '';
      }).filter(function (t) { return t.length > 10; });
    }

    // If no DYK, try fetching from a random article
    if (dykTexts.length === 0) {
      var article = await fetchRandomWikiArticle('en');
      if (article) {
        var plainText = article.body.replace(/<[^>]+>/g, '');
        dykTexts = [plainText.substring(0, 200)];
      }
    }

    if (dykTexts.length === 0) return null;

    // Pick a random DYK
    var dyk = dykTexts[Math.floor(Math.random() * dykTexts.length)];
    // Clean HTML tags
    dyk = dyk.replace(/<[^>]+>/g, '');

    // Extract interesting words from DYK text
    var words = dyk.match(/\b[a-zA-Z]{10,}\b/g) || [];
    var unique = [];
    var seen = {};
    for (var i = 0; i < words.length; i++) {
      var w = words[i].toLowerCase();
      if (!seen[w] && !STOP_WORDS.has(w)) { seen[w] = true; unique.push(w); }
    }
    unique.sort(function () { return Math.random() - 0.5; });

    // Try to find a word with a dictionary definition
    for (var j = 0; j < unique.length; j++) {
      var def = await fetchWordDefinition(unique[j]);
      if (def) {
        return {
          word: def.word,
          pronunciation: def.phonetic,
          meaning: def.meaning,
          example: dyk,
          usage: 'This word was extracted from today\'s Wikipedia "Did You Know" section. Try using it in your own sentence.'
        };
      }
    }

    return null;
  }

  /* ================================================================
     FRENCH: Vocabulary — French Wikipedia article + MyMemory translate
     ================================================================ */
  var FR_STOP_WORDS = new Set([
    'le','la','les','un','une','des','du','de','dans','pour','par','sur','avec','sans','sous','entre','pendant','avant','apres','depuis',
    'est','sont','etre','avoir','fait','font','dont','cette','ces','celui','celle','ceux','celles','leur','leurs','notre','votre',
    'que','qui','quoi','dont','ou','comment','pourquoi','quand','quel','quelle','quels','quelles',
    'mais','ou','donc','or','ni','car','puis','aussi','encore','toujours','jamais','souvent','parfois',
    'plus','moins','tres','trop','assez','bien','mal','mieux','pire','aussi','autant',
    'france','paris','wikipedia','article','categorie','page','section'
  ]);

  async function fetchFrenchVocab() {
    // Fetch a random French Wikipedia article
    var data = await fetchJSON('https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&generator=random&grnlimit=3&grnnamespace=0&exintro=1&explaintext=1&origin=*');
    if (!data || !data.query || !data.query.pages) return null;

    var pages = Object.values(data.query.pages);
    var allWords = [];
    var sentenceMap = {};

    for (var p = 0; p < pages.length; p++) {
      var extract = pages[p].extract;
      if (!extract) continue;
      var sentences = extract.match(/[^.!?]+[.!?]+/g) || [];
      var wordSet = {};

      for (var s = 0; s < sentences.length; s++) {
        var sent = sentences[s].trim();
        var tokens = sent.match(/[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ\-]{4,12}/g) || [];
        for (var t = 0; t < tokens.length; t++) {
          var w = tokens[t].toLowerCase();
          if (FR_STOP_WORDS.has(w)) continue;
          if (wordSet[w]) continue;
          wordSet[w] = true;
          if (!sentenceMap[w] && sent.length > 20 && sent.length < 200) {
            sentenceMap[w] = sent;
            allWords.push(w);
          }
        }
      }
    }

    // Shuffle and pick 5 words with example sentences
    allWords.sort(function () { return Math.random() - 0.5; });
    var selected = allWords.filter(function (w) { return sentenceMap[w]; }).slice(0, 5);

    if (selected.length < 3) return null;

    // Translate each word to Chinese
    var results = [];
    for (var i = 0; i < selected.length; i++) {
      var word = selected[i];
      var example = sentenceMap[word];
      var translation = await translateText(word, 'fr', 'zh');
      var exampleTrans = await translateText(example.substring(0, 200), 'fr', 'zh');

      results.push({
        word: word,
        phonetic: '',
        translation: translation || word,
        example: example,
        exampleTrans: exampleTrans || ''
      });
    }

    return results.length >= 3 ? results : null;
  }

  /* ================================================================
     FRENCH: Grammar — Generate fill-in-blank from French Wikipedia
     ================================================================ */
  async function fetchFrenchGrammar() {
    var data = await fetchJSON('https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&generator=random&grnlimit=1&grnnamespace=0&exintro=1&explaintext=1&origin=*');
    if (!data || !data.query || !data.query.pages) return null;

    var pages = Object.values(data.query.pages);
    if (pages.length === 0) return null;
    var page = pages[0];
    var extract = page.extract;
    if (!extract || extract.length < 50) return null;

    var sentences = extract.match(/[^.!?]+[.!?]+/g) || [];
    var goodSentences = sentences
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 30 && s.length < 160; });

    if (goodSentences.length === 0) return null;

    var sentence = goodSentences[0];
    var tokens = sentence.split(/\s+/);
    var candidates = [];

    for (var i = 0; i < tokens.length; i++) {
      var cleanWord = tokens[i].replace(/[.,!?;:()«»"']/g, '');
      if (cleanWord.length >= 4 && i > 0 && i < tokens.length - 1) {
        candidates.push({ word: cleanWord, index: i, raw: tokens[i] });
      }
    }

    if (candidates.length === 0) return null;
    candidates.sort(function () { return Math.random() - 0.5; });

    var target = candidates[0];
    var correct = target.word;

    // Build distractors from other words in the text
    var distractors = [];
    var allTokens = extract.match(/[a-zA-ZàâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ\-]{4,}/g) || [];
    var dSet = {};
    for (var d = 0; d < allTokens.length; d++) {
      var dw = allTokens[d];
      if (dw.toLowerCase() !== correct.toLowerCase() && !dSet[dw.toLowerCase()] && dw.length >= 4) {
        dSet[dw.toLowerCase()] = true;
        distractors.push(dw);
      }
    }
    distractors.sort(function () { return Math.random() - 0.5; });
    distractors = distractors.slice(0, 3);

    if (distractors.length < 3) return null;

    var options = distractors.concat([correct]).sort(function () { return Math.random() - 0.5; });
    var answerIdx = options.indexOf(correct);

    // Build question with blank
    var questionTokens = tokens.slice();
    // Preserve original punctuation around the word
    var raw = questionTokens[target.index];
    var punct = raw.replace(target.word, '');
    questionTokens[target.index] = '<span class="blank">' + punct + '_____' + (raw.endsWith(target.word) ? '' : '') + '</span>';
    // Simpler: just replace with blank
    var questionParts = tokens.slice();
    questionParts[target.index] = '_____';
    var question = questionParts.join(' ');

    return {
      topic: '法语阅读填空（来源：Wikipedia — ' + page.title + '）',
      rule: '以下句子来自法语维基百科文章「' + page.title + '」。请根据上下文选择正确的词语填入空白处。',
      question: question,
      options: options,
      answer: answerIdx,
      explanation: '正确答案是「' + correct + '」。完整句子为：' + sentence
    };
  }

  /* ================================================================
     FRENCH: Reading — Random French Wikipedia article + translation
     ================================================================ */
  async function fetchFrenchReading(level) {
    var data = await fetchJSON('https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&generator=random&grnlimit=1&grnnamespace=0&exintro=1&explaintext=1&origin=*');
    if (!data || !data.query || !data.query.pages) return null;

    var pages = Object.values(data.query.pages);
    if (pages.length === 0) return null;
    var page = pages[0];
    var extract = page.extract;
    if (!extract || extract.length < 50) return null;

    var sentences = extract.match(/[^.!?]+[.!?]+/g) || [extract];
    var count = level === 0 ? 3 : (level === 1 ? 4 : 6);
    var selected = sentences
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 15; })
      .slice(0, count);

    if (selected.length < 2) return null;

    var body = selected.map(function (s) { return '<p>' + escapeHtml(s) + '</p>'; }).join('');

    // Translate to Chinese
    var fullText = selected.join(' ').substring(0, 400);
    var translation = await translateText(fullText, 'fr', 'zh');
    var transHtml = translation
      ? '<p>' + escapeHtml(translation) + '</p>'
      : '<p>（翻译暂时不可用，请尝试自行理解）</p>';

    var labels = [
      { tag: 'Lecture A1', level: 'A1 · 启蒙' },
      { tag: 'Lecture A2', level: 'A2 · 入门' },
      { tag: 'Lecture B1', level: 'B1 · 进阶' }
    ];
    var lbl = labels[level] || labels[0];

    return {
      tag: lbl.tag,
      level: lbl.level,
      title: page.title,
      body: body,
      translation: transHtml
    };
  }

  /* ================================================================
     SHARED: MyMemory Translation API
     ================================================================ */
  async function translateText(text, fromLang, toLang) {
    if (!text || text.length === 0) return null;
    var truncated = text.substring(0, 480);
    var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(truncated) + '&langpair=' + fromLang + '|' + toLang;
    var data = await fetchJSON(url, 8000);
    if (data && data.responseData && data.responseData.translatedText) {
      var result = data.responseData.translatedText;
      // Filter out error messages
      if (result.indexOf('MYMEMORY WARNING') === -1 && result.indexOf('INVALID') === -1) {
        return result;
      }
    }
    return null;
  }

  /* ---- HTML escape ---- */
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ================================================================
     PUBLIC API
     ================================================================ */
  return {
    fetchEnglishNews: fetchEnglishNews,
    fetchEnglishListening: fetchEnglishListening,
    fetchEnglishSpeaking: fetchEnglishSpeaking,
    fetchEnglishExpression: fetchEnglishExpression,
    fetchFrenchVocab: fetchFrenchVocab,
    fetchFrenchGrammar: fetchFrenchGrammar,
    fetchFrenchReading: fetchFrenchReading,
    translateText: translateText,
    fetchWordDefinition: fetchWordDefinition,
    enrichVocabWithAI: enrichVocabWithAI,
    enrichVocab: enrichVocab,
    fmtDate: fmtDate,
    dateStr: dateStr,
    _test: {
      collectDictionarySenses: collectDictionarySenses,
      inferContextPartOfSpeech: inferContextPartOfSpeech,
      chooseContextualSense: chooseContextualSense
    }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Fetcher;
}
