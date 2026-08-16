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

  async function fetchWordDefinition(word) {
    var data = await fetchJSON('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word), 5000);
    if (!data || !Array.isArray(data) || !data[0]) return null;
    var entry = data[0];
    var meaning = entry.meanings && entry.meanings[0];
    if (!meaning || !meaning.definitions || !meaning.definitions[0]) return null;
    var def = meaning.definitions[0];
    var phonetic = entry.phonetic || '';
    if (!phonetic && entry.phonetics) {
      for (var i = 0; i < entry.phonetics.length; i++) {
        if (entry.phonetics[i].text) { phonetic = entry.phonetics[i].text; break; }
      }
    }
    return {
      word: word,
      phonetic: phonetic || '/' + word + '/',
      meaning: def.definition
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
    fmtDate: fmtDate,
    dateStr: dateStr
  };
})();
