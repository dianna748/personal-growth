/* ============================================
   Bloom · Internationalization (中 / EN / FR)
   Lightweight i18n: data-i18n attributes + dictionary
   ============================================ */

const I18N_DATA = {
  en: {
    'brand.subtitle': 'Personal Growth & Learning',
    'nav.dailyTasks': 'Daily Tasks',
    'nav.english': 'English',
    'nav.french': 'French',
    'kicker.todolist': 'Daily Focus',
    'kicker.english': 'Fluency Builder',
    'kicker.french': 'Language Lab',
    'progress.daily': 'Daily Progress',
    'sync.open': 'Sync',

    'todo.subtitle': 'Leave room for what matters today',
    'date.today': 'Today',
    'date.yesterday': 'Yesterday',
    'date.prevTitle': 'Previous day',
    'date.nextTitle': 'Next day',
    'date.todayBtn': 'Today',
    'todo.historyBtn': 'History',
    'todo.section.archive': 'Archive',
    'todo.section.archiveHint': 'Past dates by day',
    'todo.section.dashboard': 'Dashboard',
    'todo.section.dashboardHint': 'Streak, completion rate and trends',
    'cat.life': 'Life',
    'cat.work': 'Work',
    'cat.study': 'Study',
    'todo.placeholder': 'What would you like to leave for today?',
    'archive.searchPlaceholder': 'Search tasks...',
    'archive.all': 'All',
    'todo.emptyTitle': 'Your day is a blank canvas',
    'todo.emptyHint': 'Add your first task and make it count',
    'archive.emptyTitle': 'No archived tasks yet',
    'archive.emptyHint': 'Complete tasks to build your archive',
    'archive.title': 'Archive',
    'archive.back': 'Back',
    'archive.modeRecent7': 'Last 7 days',
    'archive.resetRecent7': 'Back to last 7 days',
    'archive.openCalendar': 'By date',
    'archive.emptyFilterTitle': 'No tasks in this range',
    'archive.emptyFilterHint': 'Try another date or clear the filter',
    'dash.streak': 'Day Streak',
    'dash.rate': 'Completion Rate (7 days)',
    'dash.total': 'Total Tasks (all time)',
    'dash.topCat': 'Top Category',
    'dash.catDist': 'Category Distribution',
    'dash.weeklyTrend': 'Weekly Trend',

    'todo.rolloverBanner': '{n} unfinished tasks from previous days were rolled over to today — please prioritize',
    'todo.addedSuffix': 'added',
    'todo.rolledBadge': 'Rolled',
    'todo.toastEmpty': 'Please enter a task',
    'todo.toastAdded': 'Task added',
    'dn.prevDay': 'Previous day',
    'dn.nextDay': 'Next day',
    'dn.todayBtn': 'Today',
    'dn.viewDate': 'Day',
    'dn.viewAll': 'All',
    'dn.importBtn': 'Import past',
    'dn.todayBadge': 'Today',
    'dn.yesterdayBadge': 'Yesterday',
    'cal.prevMonth': 'Previous month',
    'cal.nextMonth': 'Next month',
    'import.title': 'Import past tasks',
    'import.hint': 'One task per line. Supported formats: plain text, <code>[category]</code> text, <code>[YYYY-MM-DD]</code> text, <code>[YYYY-MM-DD][category]</code> text.',
    'import.defaultDate': 'Default date',
    'import.defaultDateHint': 'Per-line <code>[YYYY-MM-DD]</code> overrides this',
    'import.defaultCat': 'Default category',
    'import.tasks': 'Tasks',
    'import.placeholder': 'Paste or type your past tasks here\u2026',
    'import.previewLbl': 'tasks will be imported',
    'import.cancel': 'Cancel',
    'import.confirm': 'Import',
    'import.successN': 'Imported {n} tasks',
    'import.successNone': 'No tasks parsed. Please add at least one line.',
    'import.catWork': 'work',
    'import.catLife': 'life',
    'import.catStudy': 'study',
    'import.unknownDate': 'invalid date',

    'todo.addSubtask': 'Add subtask',
    'todo.addSubtaskShort': 'Add',
    'todo.subtaskPlaceholder': 'Add a subtask…',
    'todo.subtaskProgress': '{done}/{total} subtasks done',
    'qs.today': 'Today',
    'qs.done': 'Done',
    'heatmap.title': 'Workload',
    'heatmap.activeDays': 'active days',
    'heatmap.doneTotal': 'tasks completed',
    'heatmap.less': 'Less',
    'heatmap.more': 'More',
    'heatmap.learnMore': 'Learn how this is calculated',
    'dateGroup.today': 'Today',
    'dateGroup.yesterday': 'Yesterday',
    'dateGroup.tasksCount': '{n} task(s)',
    'dateGroup.doneCount': '{done}/{total} done',
    'dateGroup.empty': 'No tasks this day',

    'eng.title': 'English Learning',
    'eng.subtitle': 'Daily practice for real progress',
    'eng.tab.news': '📰 Daily News',
    'eng.tab.archive': '📚 Archive',
    'eng.tab.vocablib': '📖 Vocab Library',
    'eng.tab.listening': '🎧 Listening',
    'eng.tab.speaking': '🗣️ Speaking',
    'eng.tab.expression': '✨ Expression',
    'eng.readAloud': '🔊 Read Aloud',
    'eng.vocabTitle': '📖 Key Vocabulary',
    'eng.autoMarked': 'auto-marked',
    'eng.userVocabTitle': '✏️ Your Marked Vocabulary',
    'eng.completeStatus': 'Read the article, then mark it as complete to archive.',
    'eng.markRead': '✓ Mark as Read',
    'eng.completed': 'Completed',
    'eng.addToVocab': '+ Add to Vocab',
    'eng.newsEmptyTitle': 'No news articles studied yet',
    'eng.newsEmptyHint': 'Read today’s news to start building your archive',
    'eng.vocablibSearch': 'Search vocabulary...',
    'eng.vocablibTotal': 'Total:',
    'eng.vocablibMastered': 'Mastered:',
    'eng.vocablibEmptyTitle': 'Your vocab library is empty',
    'eng.vocablibEmptyHint': 'Words you mark in news articles will appear here',
    'eng.todayLabel': 'Today',
    'eng.historyLabel': '📦 History',
    'eng.archivedLabel': 'Archived',
    'fr.archivedLabel': 'Archived',
    'eng.listenDateLabel': "Today's Practice",
    'eng.speakDateLabel': "Today's Challenge",
    'eng.exprDateLabel': "Today's Expression",
    'eng.listenTag': 'Listening',
    'eng.dailyListening': 'Daily Listening',
    'eng.speakingTag': 'Speaking',
    'eng.dailySpeaking': 'Daily Speaking',
    'eng.advancedExpr': 'Advanced Expression',
    'eng.dailyExpression': 'Daily Expression',
    'eng.listenEmptyTitle': 'No listening practice archived yet',
    'eng.listenEmptyHint': 'Complete today’s listening to start your archive',
    'eng.speakEmptyTitle': 'No speaking practice archived yet',
    'eng.speakEmptyHint': 'Practice today’s speaking to start your archive',
    'eng.exprEmptyTitle': 'No expressions archived yet',
    'eng.exprEmptyHint': 'Today’s expression will be archived automatically',
    'eng.record': '🎤 Record',
    'eng.stop': 'Stop',
    'eng.listenBtn': '🔊 Listen',
    'eng.meaningLabel': 'Meaning:',
    'eng.usageLabel': 'Usage:',
    'fr.pronounceBtn': '🔊 Pronounce',

    'fr.title': 'French Learning',
    'fr.subtitle': 'From bonjour to fluency · Bon courage !',
    'fr.tab.vocab': '🎴 Vocabulary',
    'fr.tab.grammar': '📐 Grammar',
    'fr.tab.reading': '📖 Leveled Reading',
    'fr.vocabDateLabel': "Today's Words",
    'fr.fcLangFr': 'Français',
    'fr.fcLangMeaning': 'Meaning',
    'fr.fcFlipHint': 'Tap to flip →',
    'fr.fcPrev': '← Prev',
    'fr.fcFlip': '🔄 Flip',
    'fr.fcKnown': '✓ Known',
    'fr.fcNext': 'Next →',
    'fr.fcIndex': '{cur} / {total}',
    'fr.vocabEmptyTitle': 'No vocabulary archived yet',
    'fr.vocabEmptyHint': 'Today’s words will be archived automatically',
    'fr.grammarDateLabel': "Today's Exercise",
    'fr.grammarTag': 'Grammaire',
    'fr.grammarCheck': 'Check Answer',
    'fr.grammarNext': 'Next →',
    'fr.grammarEmptyTitle': 'No grammar exercises archived yet',
    'fr.grammarEmptyHint': 'Today’s exercise will be archived automatically',
    'fr.readDateLabel': "Today's Reading",
    'fr.readTag': 'Lecture',
    'fr.showTranslation': 'Show Translation',
    'fr.hideTranslation': 'Hide Translation',
    'fr.readEmptyTitle': 'No reading passages archived yet',
    'fr.readEmptyHint': 'Today’s reading will be archived automatically',
    'fr.levelA1': '🧒 A1 · Beginner',
    'fr.levelA2': '👶 A2 · Elementary',
    'fr.levelB1': '🧑 B1 · Intermediate',
    'fr.todayLabel': 'Today',
    'fr.historyLabel': '📦 History',

    'toast.noSpeech': 'Speech synthesis is not supported in this browser',
    'toast.cached': 'Using cached content',
    'toast.articleArchived': 'Article completed and archived',
    'toast.vocabExists': '"{word}" is already in your vocab list for today',
    'toast.vocabAdded': 'Added "{word}" to vocab',
    'toast.vocabRemoved': 'Removed "{word}"',
    'toast.vocabLibRemoved': 'Removed "{word}" from library',
    'toast.viewingArticle': 'Viewing article from {date}',
    'toast.viewingListening': 'Viewing listening from {date}',
    'toast.viewingSpeaking': 'Viewing speaking from {date}',
    'toast.viewingExpression': 'Viewing expression from {date}',
    'toast.noRecord': 'Recording is not supported in this browser',
    'toast.playRecording': 'Playing back your recording',
    'toast.recording': 'Recording… tap again to stop',
    'toast.noMic': 'Cannot access microphone',
    'toast.knownRemoved': 'Removed from known list',
    'toast.markedKnown': 'Marked as known!',
    'toast.viewingVocab': 'Viewing vocab from {date}',
    'toast.viewingGrammar': 'Viewing grammar from {date}',
    'toast.viewingReading': 'Viewing reading from {date}',
    'toast.selectAnswer': 'Please select an answer',
    'eng.completeGreat': 'Great job! You read a {n}-word article. It has been archived to your library.',
    'eng.completeDone': 'Completed! You read a {n}-word article. It is in your archive.',
    'common.fetching': 'Fetching fresh content from the web…',
    'common.readAloud': 'Read Aloud',
    'common.stop': 'Stop'
  },

  zh: {
    'brand.subtitle': '个人成长与学习',
    'nav.dailyTasks': '每日任务',
    'nav.english': '英语',
    'nav.french': '法语',
    'kicker.todolist': '每日焦点',
    'kicker.english': '流利养成',
    'kicker.french': '语言实验室',
    'progress.daily': '每日进度',
    'sync.open': '同步',

    'todo.subtitle': '让今天，给重要的事留一点空间',
    'date.today': '今天',
    'date.yesterday': '昨天',
    'date.prevTitle': '前一天',
    'date.nextTitle': '后一天',
    'date.todayBtn': '今天',
    'todo.historyBtn': '历史',
    'todo.section.archive': '归档',
    'todo.section.archiveHint': '按日期排列的历史任务',
    'todo.section.dashboard': '仪表盘',
    'todo.section.dashboardHint': '连续天数、完成率与趋势',
    'cat.life': '生活',
    'cat.work': '工作',
    'cat.study': '学习',
    'todo.placeholder': '今天想为自己留出什么？',
    'archive.searchPlaceholder': '搜索任务…',
    'archive.all': '全部',
    'todo.emptyTitle': '你的一天是一张白纸',
    'todo.emptyHint': '添加你的第一个任务，让它有意义',
    'archive.emptyTitle': '还没有归档的任务',
    'archive.emptyHint': '完成任务即可建立你的归档',
    'archive.title': '归档',
    'archive.back': '返回',
    'archive.modeRecent7': '近 7 天',
    'archive.resetRecent7': '回到近 7 天',
    'archive.openCalendar': '按日期',
    'archive.emptyFilterTitle': '这个范围没有任务',
    'archive.emptyFilterHint': '试试别的日期，或清空筛选',
    'dash.streak': '连续天数',
    'dash.rate': '完成率（近 7 天）',
    'dash.total': '任务总数（累计）',
    'dash.topCat': '最常用分类',
    'dash.catDist': '分类分布',
    'dash.weeklyTrend': '每周趋势',

    'todo.rolloverBanner': '有 {n} 项前几日未完成任务已自动顺延至今日，请优先处理',
    'todo.addedSuffix': '加入',
    'todo.rolledBadge': '顺延',
    'todo.toastEmpty': '请输入任务',
    'todo.toastAdded': '任务已添加',
    'dn.prevDay': '前一天',
    'dn.nextDay': '后一天',
    'dn.todayBtn': '回到今天',
    'dn.viewDate': '单日',
    'dn.viewAll': '全部',
    'dn.importBtn': '导入历史',
    'dn.todayBadge': '今天',
    'dn.yesterdayBadge': '昨天',
    'cal.prevMonth': '上个月',
    'cal.nextMonth': '下个月',
    'import.title': '导入历史任务',
    'import.hint': '每行一条任务。支持的格式：纯文本、<code>[分类]</code> 文本、<code>[YYYY-MM-DD]</code> 文本、<code>[YYYY-MM-DD][分类]</code> 文本。',
    'import.defaultDate': '默认日期',
    'import.defaultDateHint': '行内 <code>[YYYY-MM-DD]</code> 会覆盖此默认',
    'import.defaultCat': '默认分类',
    'import.tasks': '任务列表',
    'import.placeholder': '在这里粘贴或输入你的历史任务…',
    'import.previewLbl': '条将被导入',
    'import.cancel': '取消',
    'import.confirm': '导入',
    'import.successN': '已导入 {n} 条任务',
    'import.successNone': '未解析到任务。请至少输入一行。',
    'import.catWork': '工作',
    'import.catLife': '生活',
    'import.catStudy': '学习',
    'import.unknownDate': '日期格式不对',

    'todo.addSubtask': '添加子任务',
    'todo.addSubtaskShort': '添加',
    'todo.subtaskPlaceholder': '添加子任务…',
    'todo.subtaskProgress': '已完成 {done}/{total} 项子任务',
    'qs.today': '今日',
    'qs.done': '已完成',
    'heatmap.title': '工作日历',
    'heatmap.activeDays': '活跃天数',
    'heatmap.doneTotal': '已完成任务',
    'heatmap.less': '少',
    'heatmap.more': '多',
    'heatmap.learnMore': '了解统计方法',
    'dateGroup.today': '今天',
    'dateGroup.yesterday': '昨天',
    'dateGroup.tasksCount': '{n} 项任务',
    'dateGroup.doneCount': '{done}/{total} 已完成',
    'dateGroup.empty': '该日没有任务',

    'eng.title': '英语学习',
    'eng.subtitle': '每日练习，真实进步',
    'eng.tab.news': '📰 每日新闻',
    'eng.tab.archive': '📚 归档',
    'eng.tab.vocablib': '📖 词汇库',
    'eng.tab.listening': '🎧 听力',
    'eng.tab.speaking': '🗣️ 口语',
    'eng.tab.expression': '✨ 地道表达',
    'eng.readAloud': '🔊 朗读',
    'eng.vocabTitle': '📖 重点词汇',
    'eng.autoMarked': '自动标记',
    'eng.userVocabTitle': '✏️ 你标记的词汇',
    'eng.completeStatus': '读完文章后，标记为已完成以归档。',
    'eng.markRead': '✓ 标记为已读',
    'eng.completed': '已完成',
    'eng.addToVocab': '+ 加入词汇本',
    'eng.newsEmptyTitle': '还没有学习过新闻文章',
    'eng.newsEmptyHint': '阅读今日新闻，开始建立你的归档',
    'eng.vocablibSearch': '搜索词汇…',
    'eng.vocablibTotal': '总数：',
    'eng.vocablibMastered': '已掌握：',
    'eng.vocablibEmptyTitle': '你的词汇库是空的',
    'eng.vocablibEmptyHint': '你在新闻中标记的单词会出现在这里',
    'eng.todayLabel': '今日',
    'eng.historyLabel': '📦 历史',
    'eng.archivedLabel': '已归档',
    'fr.archivedLabel': '已归档',
    'eng.listenDateLabel': '今日练习',
    'eng.speakDateLabel': '今日挑战',
    'eng.exprDateLabel': '今日表达',
    'eng.listenTag': '听力',
    'eng.dailyListening': '每日听力',
    'eng.speakingTag': '口语',
    'eng.dailySpeaking': '每日口语',
    'eng.advancedExpr': '高级表达',
    'eng.dailyExpression': '每日表达',
    'eng.listenEmptyTitle': '还没有听力练习归档',
    'eng.listenEmptyHint': '完成今日听力即可建立归档',
    'eng.speakEmptyTitle': '还没有口语练习归档',
    'eng.speakEmptyHint': '完成今日口语即可建立归档',
    'eng.exprEmptyTitle': '还没有表达归档',
    'eng.exprEmptyHint': '今日表达会自动归档',
    'eng.record': '🎤 录音',
    'eng.stop': '停止',
    'eng.listenBtn': '🔊 听',
    'eng.meaningLabel': '释义：',
    'eng.usageLabel': '用法：',
    'fr.pronounceBtn': '🔊 发音',

    'fr.title': '法语学习',
    'fr.subtitle': '从入门到流利 · Bon courage !',
    'fr.tab.vocab': '🎴 词汇',
    'fr.tab.grammar': '📐 语法',
    'fr.tab.reading': '📖 分级阅读',
    'fr.vocabDateLabel': '今日单词',
    'fr.fcLangFr': '法语',
    'fr.fcLangMeaning': '释义',
    'fr.fcFlipHint': '点击翻转 →',
    'fr.fcPrev': '← 上一张',
    'fr.fcFlip': '🔄 翻转',
    'fr.fcKnown': '✓ 已掌握',
    'fr.fcNext': '下一张 →',
    'fr.fcIndex': '{cur} / {total}',
    'fr.vocabEmptyTitle': '还没有词汇归档',
    'fr.vocabEmptyHint': '今日单词会自动归档',
    'fr.grammarDateLabel': '今日练习',
    'fr.grammarTag': '语法',
    'fr.grammarCheck': '检查答案',
    'fr.grammarNext': '下一张 →',
    'fr.grammarEmptyTitle': '还没有语法练习归档',
    'fr.grammarEmptyHint': '今日练习会自动归档',
    'fr.readDateLabel': '今日阅读',
    'fr.readTag': '阅读',
    'fr.showTranslation': '显示译文',
    'fr.hideTranslation': '隐藏译文',
    'fr.readEmptyTitle': '还没有阅读篇章归档',
    'fr.readEmptyHint': '今日阅读会自动归档',
    'fr.levelA1': '🧒 A1 · 初级',
    'fr.levelA2': '👶 A2 · 基础',
    'fr.levelB1': '🧑 B1 · 中级',
    'fr.todayLabel': '今日',
    'fr.historyLabel': '📦 历史',

    'toast.noSpeech': '此浏览器不支持语音合成',
    'toast.cached': '使用缓存内容',
    'toast.articleArchived': '文章已完成并归档',
    'toast.vocabExists': '“{word}” 已在你今日的词汇列表中',
    'toast.vocabAdded': '已将“{word}”加入词汇',
    'toast.vocabRemoved': '已移除“{word}”',
    'toast.vocabLibRemoved': '已从词汇库移除“{word}”',
    'toast.viewingArticle': '正在查看 {date} 的文章',
    'toast.viewingListening': '正在查看 {date} 的听力',
    'toast.viewingSpeaking': '正在查看 {date} 的口语',
    'toast.viewingExpression': '正在查看 {date} 的表达',
    'toast.noRecord': '此浏览器不支持录音',
    'toast.playRecording': '正在回放你的录音',
    'toast.recording': '录音中… 再次点击停止',
    'toast.noMic': '无法访问麦克风',
    'toast.knownRemoved': '已从已掌握列表移除',
    'toast.markedKnown': '已标记为掌握！',
    'toast.viewingVocab': '正在查看 {date} 的词汇',
    'toast.viewingGrammar': '正在查看 {date} 的语法',
    'toast.viewingReading': '正在查看 {date} 的阅读',
    'toast.selectAnswer': '请选择一个答案',
    'eng.completeGreat': '太棒了！你读了一篇 {n} 词的文章，已存入你的词库。',
    'eng.completeDone': '已完成！你读了一篇 {n} 词的文章，已归入归档。',
    'common.fetching': '正在从网络获取最新内容…',
    'common.readAloud': '朗读',
    'common.stop': '停止'
  },

  fr: {
    'brand.subtitle': 'Croissance & Apprentissage',
    'nav.dailyTasks': 'Tâches quotidiennes',
    'nav.english': 'Anglais',
    'nav.french': 'Français',
    'kicker.todolist': 'Focus quotidien',
    'kicker.english': 'Vers la fluidité',
    'kicker.french': 'Laboratoire de langue',
    'progress.daily': 'Progrès quotidien',
    'sync.open': 'Sync',

    'todo.subtitle': 'Faites de la place à l\'essentiel aujourd\'hui',
    'date.today': 'Aujourd’hui',
    'date.yesterday': 'Hier',
    'date.prevTitle': 'Jour précédent',
    'date.nextTitle': 'Jour suivant',
    'date.todayBtn': 'Aujourd’hui',
    'todo.historyBtn': 'Historique',
    'todo.section.archive': 'Archive',
    'todo.section.archiveHint': 'Tâches passées par jour',
    'todo.section.dashboard': 'Tableau de bord',
    'todo.section.dashboardHint': 'Série, taux et tendances',
    'cat.life': 'Vie',
    'cat.work': 'Travail',
    'cat.study': 'Études',
    'todo.placeholder': 'Que voudriez-vous garder pour aujourd\'hui ?',
    'archive.searchPlaceholder': 'Rechercher des tâches…',
    'archive.all': 'Tous',
    'todo.emptyTitle': 'Votre jour est une page blanche',
    'todo.emptyHint': 'Ajoutez votre première tâche et faites-en quelque chose',
    'archive.emptyTitle': 'Aucune tâche archivée pour l’instant',
    'archive.emptyHint': 'Complétez des tâches pour constituer votre archive',
    'archive.title': 'Archive',
    'archive.back': 'Retour',
    'archive.modeRecent7': '7 derniers jours',
    'archive.resetRecent7': 'Revenir aux 7 derniers jours',
    'archive.openCalendar': 'Par date',
    'archive.emptyFilterTitle': 'Aucune tâche dans cette plage',
    'archive.emptyFilterHint': 'Essayez une autre date ou effacez le filtre',
    'dash.streak': 'Jours consécutifs',
    'dash.rate': 'Taux de complétion (7 j)',
    'dash.total': 'Total des tâches (tout temps)',
    'dash.topCat': 'Catégorie principale',
    'dash.catDist': 'Répartition par catégorie',
    'dash.weeklyTrend': 'Tendance hebdomadaire',

    'todo.rolloverBanner': '{n} tâches non terminées des jours précédents ont été reportées à aujourd’hui — à traiter en priorité',
    'todo.addedSuffix': 'ajouté',
    'todo.rolledBadge': 'Reporté',
    'todo.toastEmpty': 'Veuillez saisir une tâche',
    'todo.toastAdded': 'Tâche ajoutée',
    'dn.prevDay': 'Jour précédent',
    'dn.nextDay': 'Jour suivant',
    'dn.todayBtn': "Aujourd'hui",
    'dn.viewDate': 'Jour',
    'dn.viewAll': 'Tout',
    'dn.importBtn': 'Importer',
    'dn.todayBadge': "Aujourd'hui",
    'dn.yesterdayBadge': 'Hier',
    'cal.prevMonth': 'Mois précédent',
    'cal.nextMonth': 'Mois suivant',
    'import.title': 'Importer des tâches passées',
    'import.hint': 'Une tâche par ligne. Formats pris en charge : texte brut, texte <code>[catégorie]</code>, texte <code>[YYYY-MM-DD]</code>, texte <code>[YYYY-MM-DD][catégorie]</code>.',
    'import.defaultDate': 'Date par défaut',
    'import.defaultDateHint': 'Le <code>[YYYY-MM-DD]</code> en début de ligne remplace ce choix',
    'import.defaultCat': 'Catégorie par défaut',
    'import.tasks': 'Tâches',
    'import.placeholder': 'Collez ou tapez vos tâches passées ici…',
    'import.previewLbl': 'tâches seront importées',
    'import.cancel': 'Annuler',
    'import.confirm': 'Importer',
    'import.successN': '{n} tâches importées',
    'import.successNone': 'Aucune tâche reconnue. Veuillez saisir au moins une ligne.',
    'import.catWork': 'travail',
    'import.catLife': 'vie',
    'import.catStudy': 'étude',
    'import.unknownDate': 'date invalide',

    'todo.addSubtask': 'Ajouter une sous-tâche',
    'todo.addSubtaskShort': 'Ajouter',
    'todo.subtaskPlaceholder': 'Ajouter une sous-tâche…',
    'todo.subtaskProgress': '{done}/{total} sous-tâches terminées',
    'qs.today': 'Aujourd’hui',
    'qs.done': 'Faite',
    'heatmap.title': 'Charge de travail',
    'heatmap.activeDays': 'jours actifs',
    'heatmap.doneTotal': 'tâches terminées',
    'heatmap.less': 'Moins',
    'heatmap.more': 'Plus',
    'heatmap.learnMore': 'Comprendre le calcul',
    'dateGroup.today': 'Aujourd’hui',
    'dateGroup.yesterday': 'Hier',
    'dateGroup.tasksCount': '{n} tâche(s)',
    'dateGroup.doneCount': '{done}/{total} faite(s)',
    'dateGroup.empty': 'Aucune tâche ce jour',

    'eng.title': 'Apprentissage de l’anglais',
    'eng.subtitle': 'Pratique quotidienne pour de vrais progrès',
    'eng.tab.news': '📰 Actualités du jour',
    'eng.tab.archive': '📚 Archive',
    'eng.tab.vocablib': '📖 Bibliothèque de vocab',
    'eng.tab.listening': '🎧 Compréhension orale',
    'eng.tab.speaking': '🗣️ Expression orale',
    'eng.tab.expression': '✨ Expressions',
    'eng.readAloud': '🔊 Lire à voix haute',
    'eng.vocabTitle': '📖 Vocabulaire clé',
    'eng.autoMarked': 'auto',
    'eng.userVocabTitle': '✏️ Votre vocabulaire marqué',
    'eng.completeStatus': 'Lisez l’article, puis marquez-le comme terminé pour l’archiver.',
    'eng.markRead': '✓ Marquer comme lu',
    'eng.completed': 'Terminé',
    'eng.addToVocab': '+ Ajouter au vocabulaire',
    'eng.newsEmptyTitle': 'Aucun article d’actualité étudié pour l’instant',
    'eng.newsEmptyHint': 'Lisez l’actualité du jour pour commencer votre archive',
    'eng.vocablibSearch': 'Rechercher du vocabulaire…',
    'eng.vocablibTotal': 'Total :',
    'eng.vocablibMastered': 'Maîtrisé :',
    'eng.vocablibEmptyTitle': 'Votre bibliothèque de vocabulaire est vide',
    'eng.vocablibEmptyHint': 'Les mots que vous marquez dans les articles apparaîtront ici',
    'eng.todayLabel': 'Aujourd’hui',
    'eng.historyLabel': '📦 Historique',
    'eng.archivedLabel': 'Archivé',
    'fr.archivedLabel': 'Archivé',
    'eng.listenDateLabel': 'Pratique du jour',
    'eng.speakDateLabel': 'Défi du jour',
    'eng.exprDateLabel': 'Expression du jour',
    'eng.listenTag': 'Écoute',
    'eng.dailyListening': 'Écoute quotidienne',
    'eng.speakingTag': 'Oral',
    'eng.dailySpeaking': 'Oral quotidien',
    'eng.advancedExpr': 'Expression avancée',
    'eng.dailyExpression': 'Expression quotidienne',
    'eng.listenEmptyTitle': 'Aucune écoute archivée pour l’instant',
    'eng.listenEmptyHint': 'Complétez l’écoute du jour pour démarrer votre archive',
    'eng.speakEmptyTitle': 'Aucune expression orale archivée',
    'eng.speakEmptyHint': 'Pratiquez l’oral du jour pour démarrer votre archive',
    'eng.exprEmptyTitle': 'Aucune expression archivée',
    'eng.exprEmptyHint': 'L’expression du jour sera archivée automatiquement',
    'eng.record': '🎤 Enregistrer',
    'eng.stop': 'Arrêter',
    'eng.listenBtn': '🔊 Écouter',
    'eng.meaningLabel': 'Signification :',
    'eng.usageLabel': 'Usage :',
    'fr.pronounceBtn': '🔊 Prononcer',

    'fr.title': 'Apprentissage du français',
    'fr.subtitle': 'De bonjour à la fluidité · Bon courage !',
    'fr.tab.vocab': '🎴 Vocabulaire',
    'fr.tab.grammar': '📐 Grammaire',
    'fr.tab.reading': '📖 Lecture niveau',
    'fr.vocabDateLabel': 'Mots du jour',
    'fr.fcLangFr': 'Français',
    'fr.fcLangMeaning': 'Signification',
    'fr.fcFlipHint': 'Cliquez pour retourner →',
    'fr.fcPrev': '← Préc.',
    'fr.fcFlip': '🔄 Retourner',
    'fr.fcKnown': '✓ Connu',
    'fr.fcNext': 'Suiv. →',
    'fr.fcIndex': '{cur} / {total}',
    'fr.vocabEmptyTitle': 'Aucun vocabulaire archivé pour l’instant',
    'fr.vocabEmptyHint': 'Les mots du jour seront archivés automatiquement',
    'fr.grammarDateLabel': 'Exercice du jour',
    'fr.grammarTag': 'Grammaire',
    'fr.grammarCheck': 'Vérifier',
    'fr.grammarNext': 'Suiv. →',
    'fr.grammarEmptyTitle': 'Aucun exercice de grammaire archivé',
    'fr.grammarEmptyHint': 'L’exercice du jour sera archivé automatiquement',
    'fr.readDateLabel': 'Lecture du jour',
    'fr.readTag': 'Lecture',
    'fr.showTranslation': 'Afficher la traduction',
    'fr.hideTranslation': 'Masquer la traduction',
    'fr.readEmptyTitle': 'Aucune lecture archivée pour l’instant',
    'fr.readEmptyHint': 'La lecture du jour sera archivée automatiquement',
    'fr.levelA1': '🧒 A1 · Débutant',
    'fr.levelA2': '👶 A2 · Élémentaire',
    'fr.levelB1': '🧑 B1 · Intermédiaire',
    'fr.todayLabel': 'Aujourd’hui',
    'fr.historyLabel': '📦 Historique',

    'toast.noSpeech': 'La synthèse vocale n’est pas prise en charge',
    'toast.cached': 'Contenu en cache utilisé',
    'toast.articleArchived': 'Article terminé et archivé',
    'toast.vocabExists': '« {word} » est déjà dans votre vocabulaire du jour',
    'toast.vocabAdded': '« {word} » ajouté au vocabulaire',
    'toast.vocabRemoved': '« {word} » supprimé',
    'toast.vocabLibRemoved': '« {word} » retiré de la bibliothèque',
    'toast.viewingArticle': 'Article du {date}',
    'toast.viewingListening': 'Écoute du {date}',
    'toast.viewingSpeaking': 'Oral du {date}',
    'toast.viewingExpression': 'Expression du {date}',
    'toast.noRecord': 'L’enregistrement n’est pas pris en charge',
    'toast.playRecording': 'Lecture de votre enregistrement',
    'toast.recording': 'Enregistrement… tapez à nouveau pour arrêter',
    'toast.noMic': 'Impossible d’accéder au microphone',
    'toast.knownRemoved': 'Retiré de la liste des connus',
    'toast.markedKnown': 'Marqué comme connu !',
    'toast.viewingVocab': 'Vocabulaire du {date}',
    'toast.viewingGrammar': 'Grammaire du {date}',
    'toast.viewingReading': 'Lecture du {date}',
    'toast.selectAnswer': 'Veuillez sélectionner une réponse',
    'eng.completeGreat': 'Bravo ! Vous avez lu un article de {n} mots. Il est archivé dans votre bibliothèque.',
    'eng.completeDone': 'Terminé ! Vous avez lu un article de {n} mots. Il est dans votre archive.',
    'common.fetching': 'Récupération de contenu depuis le web…',
    'common.readAloud': 'Lire à voix haute',
    'common.stop': 'Arrêter'
  }
};

/* ============================================
   Line-icon helpers — convert emoji to 简笔画 SVG
   ============================================ */
const EMOJI_MAP = {
  '✿': 'bloom', '☑': 'check-square', '🇬🇧': 'book', '🇫🇷': 'feather',
  '←': 'chevron-left', '→': 'chevron-right', '↔': 'chevron-right',
  '📦': 'archive', '📊': 'chart', '⏰': 'clock', '🌸': 'leaf', '🔍': 'search',
  '🔥': 'flame', '✅': 'check-circle', '📋': 'clipboard', '🏆': 'trophy',
  '📰': 'newspaper', '📚': 'library', '📖': 'book-open', '🎧': 'headphones',
  '🗣️': 'mic', '🗣': 'mic', '✨': 'sparkles', '🔊': 'volume',
  '✏️': 'pencil', '✏': 'pencil', '✓': 'check', '🔄': 'refresh', '✎': 'pencil', '✗': 'close',
  '🎤': 'mic', '🎴': 'cards', '📐': 'ruler', '▶': 'play', '⏸': 'pause',
  '↩': 'undo', '💡': 'bulb', '✦': 'sparkle', 'ℹ': 'info', '⚠': 'warn',
  '🧒': '', '👶': '', '🧑': ''
};

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const ICON_RE = new RegExp(Object.keys(EMOJI_MAP).sort(function (a, b) { return b.length - a.length; }).map(escapeRegExp).join('|'), 'g');

function Ico(name) {
  return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>';
}

function IcoSVG(name) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'ico');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(ns, 'use');
  use.setAttribute('href', '#i-' + name);
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#i-' + name);
  svg.appendChild(use);
  return svg;
}

function iconify(root) {
  root = root || document;
  if (!root.querySelectorAll) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) {
    if (!n.nodeValue) continue;
    if (n.parentNode && (n.parentNode.tagName === 'SCRIPT' || n.parentNode.tagName === 'STYLE')) continue;
    ICON_RE.lastIndex = 0;
    if (ICON_RE.test(n.nodeValue)) nodes.push(n);
  }
  for (let i = 0; i < nodes.length; i++) {
    const tn = nodes[i];
    const s = tn.nodeValue;
    const frag = document.createDocumentFragment();
    let last = 0;
    let m;
    ICON_RE.lastIndex = 0;
    while ((m = ICON_RE.exec(s))) {
      const idx = m.index;
      const ch = m[0];
      if (idx > last) frag.appendChild(document.createTextNode(s.slice(last, idx)));
      const name = EMOJI_MAP[ch];
      if (name) frag.appendChild(IcoSVG(name));
      last = idx + ch.length;
    }
    if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
    if (frag.childNodes.length) tn.parentNode.replaceChild(frag, tn);
  }
}

window.Ico = Ico;
window.iconify = iconify;

const I18n = (function () {
  const STORAGE_KEY = 'bloom_lang';
  const SUPPORTED = ['zh', 'en', 'fr'];
  let lang = 'en';
  const listeners = [];

  const MONTHS = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    fr: ['Janv', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  };
  const WDAYS = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    zh: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  };

  function load() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v && SUPPORTED.indexOf(v) !== -1) lang = v;
    } catch (e) { /* ignore */ }
  }

  function t(key, vars) {
    let s = (I18N_DATA[lang] && I18N_DATA[lang][key]) || (I18N_DATA.en && I18N_DATA.en[key]) || key;
    if (vars && typeof s === 'string') {
      s = s.replace(/\{(\w+)\}/g, function (m, p) {
        return vars[p] !== undefined ? vars[p] : m;
      });
    }
    return s;
  }

  function setLang(l) {
    if (SUPPORTED.indexOf(l) === -1) return;
    lang = l;
    try { localStorage.setItem(STORAGE_KEY, l); } catch (e) { /* ignore */ }
    document.documentElement.lang = (l === 'zh') ? 'zh-CN' : l;
    apply();
    highlight();
    notify();
  }

  function getLang() { return lang; }

  function apply(root) {
    root = root || document;
    const nodes = root.querySelectorAll('[data-i18n]');
    for (let i = 0; i < nodes.length; i++) {
      const k = nodes[i].getAttribute('data-i18n');
      if (k) nodes[i].textContent = t(k);
    }
    const phs = root.querySelectorAll('[data-i18n-ph]');
    for (let j = 0; j < phs.length; j++) {
      const k = phs[j].getAttribute('data-i18n-ph');
      if (k) phs[j].placeholder = t(k);
    }
    const titles = root.querySelectorAll('[data-i18n-title]');
    for (let m = 0; m < titles.length; m++) {
      const k = titles[m].getAttribute('data-i18n-title');
      if (k) titles[m].title = t(k);
    }
    if (window.iconify) window.iconify(root);
  }

  function onChange(cb) { listeners.push(cb); }
  function notify() { for (let i = 0; i < listeners.length; i++) { try { listeners[i](lang); } catch (e) { console.error(e); } } }

  function months() { return MONTHS[lang]; }
  function weekdays() { return WDAYS[lang]; }

  function fmtDate(isoStr) {
    const d = new Date(isoStr + 'T00:00:00');
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    if (lang === 'zh') return y + '年' + (m + 1) + '月' + day + '日';
    if (lang === 'fr') return day + ' ' + MONTHS.fr[m] + ' ' + y;
    return MONTHS.en[m] + ' ' + day + ', ' + y;
  }

  function fmtMonthDay(isoStr) {
    const d = new Date(isoStr + 'T00:00:00');
    const m = d.getMonth();
    const day = d.getDate();
    if (lang === 'zh') return (m + 1) + '月' + day + '日';
    if (lang === 'fr') return day + ' ' + MONTHS.fr[m];
    return MONTHS.en[m] + ' ' + day;
  }

  function initUI() {
    const sw = document.getElementById('lang-switch');
    if (!sw) return;
    const btns = sw.querySelectorAll('.lang-btn');
    for (let i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () { setLang(this.getAttribute('data-lang')); });
    }
    highlight();
  }

  function highlight() {
    const sw = document.getElementById('lang-switch');
    if (!sw) return;
    const btns = sw.querySelectorAll('.lang-btn');
    for (let i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-lang') === lang);
    }
  }

  load();

  return {
    t: t,
    setLang: setLang,
    getLang: getLang,
    apply: apply,
    onChange: onChange,
    months: months,
    weekdays: weekdays,
    fmtDate: fmtDate,
    fmtMonthDay: fmtMonthDay,
    initUI: initUI,
    highlight: highlight
  };
})();
