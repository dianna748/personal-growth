/* ============================================
   Bloom · Learning Content Data
   ============================================ */

const CONTENT = {

  /* ============ English: News Reading ============ */
  englishNews: [
    {
      date: "2025-07-22",
      title: "AI Models Are Now Writing Code Alongside Human Developers",
      body: `<p>A new generation of <span class="highlight" data-word="artificial intelligence">artificial intelligence</span> tools is transforming the way software engineers work. These AI-powered coding assistants can now generate entire functions, debug errors, and even suggest architectural improvements in real time.</p>
      <p>Developers report that these tools significantly <span class="highlight" data-word="boost productivity">boost productivity</span>, allowing them to focus on higher-level problem-solving rather than repetitive boilerplate code. However, concerns remain about code quality, security vulnerabilities, and the potential <span class="highlight" data-word="displacement">displacement</span> of junior developers.</p>
      <p>Industry experts emphasize that AI is best viewed as a <span class="highlight" data-word="collaborative">collaborative</span> partner rather than a replacement. The most successful teams combine human creativity with machine efficiency, creating a <span class="highlight" data-word="synergy">synergy</span> that neither could achieve alone.</p>`,
      vocab: [
        { word: "artificial intelligence", phonetic: "/ˌɑːtɪˈfɪʃəl ɪnˈtelɪdʒəns/", meaning: "the simulation of human intelligence by machines" },
        { word: "boost productivity", phonetic: "/buːst ˌprɒdʌkˈtɪvəti/", meaning: "to increase the efficiency of output" },
        { word: "displacement", phonetic: "/dɪsˈpleɪsmənt/", meaning: "the act of replacing people or things" },
        { word: "collaborative", phonetic: "/kəˈlæbərətɪv/", meaning: "involving cooperation between people or groups" },
        { word: "synergy", phonetic: "/ˈsɪnədʒi/", meaning: "the combined effect greater than individual efforts" }
      ]
    },
    {
      date: "2025-07-21",
      title: "Remote Work Has Permanently Reshaped the Global Office",
      body: `<p>The shift toward <span class="highlight" data-word="remote work">remote work</span> has created lasting changes in how companies operate. Five years after the pandemic accelerated this trend, many organizations have adopted <span class="highlight" data-word="hybrid">hybrid</span> models that combine office and home work.</p>
      <p>Studies show that employees value <span class="highlight" data-word="flexibility">flexibility</span> above salary in many cases. Companies that insist on full-time office attendance risk losing talent to more <span class="highlight" data-word="adaptable">adaptable</span> competitors.</p>
      <p>The <span class="highlight" data-word="implications">implications</span> extend beyond individual companies. Urban planning, commercial real estate, and even local restaurants are adjusting to a world where fewer people commute daily.</p>`,
      vocab: [
        { word: "remote work", phonetic: "/rɪˈməʊt wɜːk/", meaning: "working from a location other than the office" },
        { word: "hybrid", phonetic: "/ˈhaɪbrɪd/", meaning: "combining two different elements" },
        { word: "flexibility", phonetic: "/ˌfleksəˈbɪləti/", meaning: "the ability to adapt to change easily" },
        { word: "adaptable", phonetic: "/əˈdæptəbl/", meaning: "able to adjust to new conditions" },
        { word: "implications", phonetic: "/ˌɪmplɪˈkeɪʃənz/", meaning: "possible effects or consequences" }
      ]
    },
    {
      date: "2025-07-20",
      title: "Breakthrough in Quantum Computing Brings Practical Use Closer",
      body: `<p>Scientists have achieved a significant <span class="highlight" data-word="breakthrough">breakthrough</span> in quantum computing, demonstrating that quantum processors can solve certain problems <span class="highlight" data-word="exponentially">exponentially</span> faster than classical computers.</p>
      <p>The research team used a new error-correction technique that dramatically reduces the <span class="highlight" data-word="noise">noise</span> that has long plagued quantum systems. This <span class="highlight" data-word="milestone">milestone</span> brings practical quantum applications in drug discovery and materials science closer to reality.</p>
      <p>While commercial quantum computers are still years away, this <span class="highlight" data-word="advancement">advancement</span> validates the decades of investment in the field and energizes the global research community.</p>`,
      vocab: [
        { word: "breakthrough", phonetic: "/ˈbreɪkθruː/", meaning: "a significant discovery or development" },
        { word: "exponentially", phonetic: "/ˌekspəˈnenʃəli/", meaning: "increasing at a very fast rate" },
        { word: "noise", phonetic: "/nɔɪz/", meaning: "unwanted disturbance in a system or signal" },
        { word: "milestone", phonetic: "/ˈmaɪlstəʊn/", meaning: "an important stage in development" },
        { word: "advancement", phonetic: "/ədˈvɑːnsmənt/", meaning: "progress or improvement in a field" }
      ]
    }
  ],

  /* ============ English: Listening Practice (7 items for daily rotation) ============ */
  englishListening: [
    {
      title: "The Future of Sustainable Cities",
      sentences: [
        "Cities around the world are racing to become more sustainable.",
        "Green roofs, solar panels, and electric buses are becoming common sights.",
        "Urban planners are designing neighborhoods where people can walk or cycle everywhere.",
        "The goal is to reduce carbon emissions while improving quality of life.",
        "Some cities are even experimenting with vertical farms in skyscrapers.",
        "These innovations could transform how we live in the next decade."
      ]
    },
    {
      title: "Why Sleep Matters More Than You Think",
      sentences: [
        "Sleep is not just rest — it is an active process of repair and consolidation.",
        "During deep sleep, your brain processes memories and clears out toxins.",
        "Chronic sleep deprivation is linked to heart disease and weakened immunity.",
        "Experts recommend seven to nine hours of sleep for most adults.",
        "A consistent sleep schedule is more important than total hours.",
        "Avoiding screens before bed can significantly improve sleep quality."
      ]
    },
    {
      title: "The Rise of Plant-Based Diets",
      sentences: [
        "Plant-based eating has moved from a niche lifestyle to a mainstream trend.",
        "Supermarkets now dedicate entire aisles to meat and dairy alternatives.",
        "Studies suggest that reducing meat consumption can lower carbon footprints significantly.",
        "Many people are adopting flexitarian diets rather than going fully vegan.",
        "Restaurants are expanding their menus to include more plant-based options.",
        "The global market for alternative proteins is expected to triple by 2030."
      ]
    },
    {
      title: "How Microplastics Are Affecting Marine Life",
      sentences: [
        "Scientists have found microplastics in nearly every corner of the ocean.",
        "These tiny particles come from synthetic clothing, packaging, and industrial waste.",
        "Marine animals often mistake microplastics for food and ingest them.",
        "The chemicals in plastics can accumulate in the food chain over time.",
        "Researchers are developing new methods to filter microplastics from water.",
        "Reducing single-use plastics remains the most effective solution for now."
      ]
    },
    {
      title: "The Psychology of Habit Formation",
      sentences: [
        "Habits are automatic behaviors triggered by specific cues in our environment.",
        "According to researchers, it takes an average of 66 days to form a new habit.",
        "The key is to start small and gradually increase the difficulty.",
        "Tracking your progress visually can significantly boost motivation.",
        "Removing friction from good habits and adding friction to bad ones is effective.",
        "Consistency matters more than intensity when building lasting habits."
      ]
    },
    {
      title: "Renewable Energy Is Now Cheaper Than Coal",
      sentences: [
        "Solar and wind power have become the cheapest sources of electricity in most countries.",
        "The cost of solar panels has fallen by more than 80 percent in the past decade.",
        "Battery storage technology is improving rapidly, solving the intermittency problem.",
        "Several countries now generate more than half their electricity from renewables.",
        "Fossil fuel industries are struggling to compete on price alone.",
        "The transition to clean energy is happening faster than most experts predicted."
      ]
    },
    {
      title: "The Science Behind Effective Learning",
      sentences: [
        "Spaced repetition is one of the most powerful learning techniques available.",
        "Reviewing material at increasing intervals helps move information into long-term memory.",
        "Active recall — testing yourself — is far more effective than passive rereading.",
        "Sleep plays a crucial role in consolidating what you have learned during the day.",
        "Interleaving different topics during study sessions leads to better retention.",
        "Teaching what you have learned to someone else is the ultimate test of understanding."
      ]
    }
  ],

  /* ============ English: Speaking Practice (7 items for daily rotation) ============ */
  englishSpeaking: [
    {
      prompt: "Scenario: Ordering at a coffee shop. Read the sentence aloud, paying attention to intonation and linking.",
      sentence: "Hi, could I get a large oat milk latte with a shot of vanilla, please? And could you tell me how long the wait might be?",
      tips: "Pronunciation tips:\n• Link 'could I' as /kʊdaɪ/\n• Use a glottal stop for the /t/ in 'oat milk'\n• Let your intonation rise slightly on 'please' to sound polite\n• Let it fall smoothly on 'how long the wait might be'"
    },
    {
      prompt: "Scenario: Sharing an opinion in a work update. Keep a professional tone and steady pace.",
      sentence: "Based on the data we've collected over the past quarter, I'd recommend we shift our focus toward the emerging market segment.",
      tips: "Pronunciation tips:\n• Link 'based on' as /beɪsdɒn/\n• Lighten 'I'd' in 'I'd recommend'\n• Make the -ing nasal in 'emerging market'\n• Pause briefly after 'recommend' to add emphasis"
    },
    {
      prompt: "Scenario: Introducing yourself in a social setting. Use a natural, relaxed tone.",
      sentence: "I'm actually really passionate about photography — I've been shooting street scenes for about three years now, and I just love capturing those fleeting moments.",
      tips: "Pronunciation tips:\n• Reduce the first syllable of 'actually' /ˈæktʃuəli/\n• Link 'passionate about' smoothly\n• Keep a natural rhythm in 'three years now'\n• Use a rising tone on 'just love' to show enthusiasm"
    },
    {
      prompt: "Scenario: Making a polite complaint at a hotel. Use a calm but assertive tone.",
      sentence: "Excuse me, I'm afraid there seems to be an issue with the air conditioning in my room — it's been blowing warm air all night, and I was wondering if someone could take a look at it.",
      tips: "Pronunciation tips:\n• Start with a polite 'Excuse me' — keep it light\n• Link 'there seems to be an issue' smoothly\n• Emphasize 'warm' slightly to convey the problem\n• End with a gently rising intonation on 'take a look at it' to make a polite request"
    },
    {
      prompt: "Scenario: Explaining a technical concept to a non-technical colleague. Slow down and enunciate clearly.",
      sentence: "Essentially, what the algorithm does is scan through thousands of data points, identify recurring patterns, and then make predictions based on those patterns — it's a bit like how your brain learns to recognize a friend's face after seeing it many times.",
      tips: "Pronunciation tips:\n• Say 'Essentially' clearly with all four syllables\n• Pause slightly after 'data points' to let the idea land\n• Stress 'recurring' and 'predictions' as key terms\n• Slow down for the analogy — 'how your brain learns to recognize'"
    },
    {
      prompt: "Scenario: Giving a toast at a friend's celebration. Use a warm, elevated yet natural tone.",
      sentence: "I've known Sarah for over a decade, and if there's one thing I've learned, it's that she brings out the best in everyone around her — so here's to many more years of your infectious energy and unwavering kindness.",
      tips: "Pronunciation tips:\n• Let 'I've known' flow together\n• Put gentle emphasis on 'decade' and 'best'\n• Pause meaningfully before 'so here's to'\n• Lift your tone slightly on 'infectious energy' and let it settle on 'kindness'"
    },
    {
      prompt: "Scenario: Delivering a brief project update. Be concise, confident, and clear.",
      sentence: "We're currently on track to hit the mid-November milestone, though the integration phase has been slightly more complex than we originally estimated — we've brought in two additional engineers to help close the gap.",
      tips: "Pronunciation tips:\n• Emphasize 'on track' and 'mid-November' as key anchoring points\n• Lighten 'has been' to flow naturally\n• Slight stress on 'more complex' and 'originally estimated'\n• End with a confident tone on 'close the gap' — show you're in control"
    }
  ],

  /* ============ English: Advanced Expressions ============ */
  englishExpressions: [
    {
      word: "bite the bullet",
      pronunciation: "/baɪt ðə ˈbʊlɪt/",
      meaning: "to face a difficult or unpleasant situation with courage",
      example: "I've been putting off the dentist for months, but I finally decided to bite the bullet and make an appointment.",
      usage: "Use it when you have to do something you have been avoiding because it is hard or uncomfortable. Common in everyday conversation."
    },
    {
      word: "under the weather",
      pronunciation: "/ˈʌndə ðə ˈweðə/",
      meaning: "feeling slightly ill or unwell",
      example: "I won't be able to make it to the meeting today — I'm feeling a bit under the weather.",
      usage: "A polite, gentle way to say you are not feeling well. More tactful than saying 'I'm sick' in emails or at work."
    },
    {
      word: "piece of cake",
      pronunciation: "/piːs əv keɪk/",
      meaning: "something very easy to do",
      example: "The exam was a piece of cake — I finished it in half the time and still got a perfect score.",
      usage: "An informal, cheerful expression. In formal contexts, use 'straightforward' or 'manageable' instead."
    },
    {
      word: "hit the nail on the head",
      pronunciation: "/hɪt ðə neɪl ɒn ðə hed/",
      meaning: "to describe exactly what is causing a situation or problem",
      example: "You really hit the nail on the head with that observation — that's exactly the problem we've been trying to identify.",
      usage: "Use it when someone makes a precise and accurate point. Positive and suitable for discussions or feedback."
    },
    {
      word: "burn the midnight oil",
      pronunciation: "/bɜːn ðə ˈmɪdnaɪt ɔɪl/",
      meaning: "to work or study late into the night",
      example: "She's been burning the midnight oil all week trying to finish her thesis before the deadline.",
      usage: "A slightly literary idiom that suggests working hard late at night. Useful for describing intense work or study periods."
    },
    {
      word: "cost an arm and a leg",
      pronunciation: "/kɒst ən ɑːm ənd ə leg/",
      meaning: "to be very expensive",
      example: "I'd love to travel to Japan, but the flights right now would cost an arm and a leg.",
      usage: "An exaggerated, vivid way to say something is too pricey. Great for casual conversation."
    },
    {
      word: "let the cat out of the bag",
      pronunciation: "/let ðə kæt aʊt əv ðə bæɡ/",
      meaning: "to accidentally reveal a secret",
      example: "We were planning a surprise party for Sarah, but Tom let the cat out of the bag by mentioning the decorations.",
      usage: "Use it when someone unintentionally gives away information that was supposed to be secret. Light and non-malicious."
    },
    {
      word: "on the same page",
      pronunciation: "/ɒn ðə seɪm peɪdʒ/",
      meaning: "to have the same understanding or agree on something",
      example: "Before we move forward, I want to make sure everyone is on the same page about the project timeline.",
      usage: "A business-friendly expression to confirm shared understanding. Professional yet warm, good for meetings and emails."
    },
    {
      word: "a blessing in disguise",
      pronunciation: "/ə ˈblesɪŋ ɪn ˌdɪsəˈɡaɪz/",
      meaning: "something that seems bad at first but turns out to be beneficial",
      example: "Losing that job was a blessing in disguise — it pushed me to start my own business, which turned out to be far more rewarding.",
      usage: "Use it when reflecting on a past difficulty that eventually led to a positive outcome. Uplifting and philosophical."
    },
    {
      word: "break the ice",
      pronunciation: "/breɪk ðə aɪs/",
      meaning: "to do or say something to relieve tension or start a conversation",
      example: "The workshop started off awkwardly, but the facilitator's humor really broke the ice and got everyone talking.",
      usage: "Common in social situations when someone helps people feel more comfortable and start talking."
    }
  ],

  /* ============ French: Vocabulary (30+ items for daily batching) ============ */
  frenchVocab: [
    { word: "bonjour", phonetic: "/bɔ̃.ʒuʁ/", translation: "你好（白天）", example: "Bonjour, comment allez-vous ?", exampleTrans: "你好，您怎么样？" },
    { word: "merci", phonetic: "/mɛʁ.si/", translation: "谢谢", example: "Merci beaucoup pour votre aide.", exampleTrans: "非常感谢您的帮助。" },
    { word: "maison", phonetic: "/mɛ.zɔ̃/", translation: "房子，家", example: "Ma maison est grande et belle.", exampleTrans: "我的房子又大又漂亮。" },
    { word: "chat", phonetic: "/ʃa/", translation: "猫", example: "Le chat dort sur le canapé.", exampleTrans: "猫在沙发上睡觉。" },
    { word: "eau", phonetic: "/o/", translation: "水", example: "Je voudrais un verre d'eau, s'il vous plaît.", exampleTrans: "请给我一杯水。" },
    { word: "livre", phonetic: "/livʁ/", translation: "书", example: "J'aime lire un livre le soir.", exampleTrans: "我喜欢在晚上读书。" },
    { word: "ami", phonetic: "/a.mi/", translation: "朋友（男）", example: "Mon meilleur ami habite à Paris.", exampleTrans: "我最好的朋友住在巴黎。" },
    { word: "fleur", phonetic: "/flœʁ/", translation: "花", example: "Elle a reçu un bouquet de fleurs.", exampleTrans: "她收到了一束花。" },
    { word: "soleil", phonetic: "/sɔ.lɛj/", translation: "太阳", example: "Le soleil brille aujourd'hui.", exampleTrans: "今天阳光明媚。" },
    { word: "amour", phonetic: "/a.muʁ/", translation: "爱，爱情", example: "L'amour est la plus belle chose au monde.", exampleTrans: "爱是世界上最美好的事物。" },
    { word: "pain", phonetic: "/pɛ̃/", translation: "面包", example: "J'achète du pain frais chaque matin.", exampleTrans: "我每天早上买新鲜面包。" },
    { word: "rouge", phonetic: "/ʁuʒ/", translation: "红色的", example: "Elle porte une robe rouge ce soir.", exampleTrans: "她今晚穿了一条红裙子。" },
    { word: "chien", phonetic: "/ʃjɛ̃/", translation: "狗", example: "Mon chien adore courir dans le parc.", exampleTrans: "我的狗喜欢在公园里跑步。" },
    { word: "école", phonetic: "/e.kɔl/", translation: "学校", example: "Les enfants vont à l'école le matin.", exampleTrans: "孩子们早上去学校。" },
    { word: "manger", phonetic: "/mɑ̃.ʒe/", translation: "吃", example: "J'aime manger des croissants le matin.", exampleTrans: "我喜欢早上吃牛角面包。" },
    { word: "boire", phonetic: "/bwaʁ/", translation: "喝", example: "Je voudrais boire un café, s'il vous plaît.", exampleTrans: "我想喝一杯咖啡，谢谢。" },
    { word: "beau", phonetic: "/bo/", translation: "美丽的", example: "Ce jardin est vraiment très beau.", exampleTrans: "这个花园真的很美。" },
    { word: "grand", phonetic: "/ɡʁɑ̃/", translation: "大的", example: "Paris est une grande ville.", exampleTrans: "巴黎是一座大城市。" },
    { word: "petit", phonetic: "/pə.ti/", translation: "小的", example: "Elle a un petit chien noir.", exampleTrans: "她有一只小黑狗。" },
    { word: "temps", phonetic: "/tɑ̃/", translation: "时间，天气", example: "Quel temps fait-il aujourd'hui ?", exampleTrans: "今天天气怎么样？" },
    { word: "travail", phonetic: "/tʁa.vaj/", translation: "工作", example: "Je vais au travail en métro tous les jours.", exampleTrans: "我每天坐地铁去上班。" },
    { word: "famille", phonetic: "/fa.mij/", translation: "家庭", example: "Ma famille est très importante pour moi.", exampleTrans: "我的家庭对我非常重要。" },
    { word: "musique", phonetic: "/my.zik/", translation: "音乐", example: "J'écoute de la musique classique le soir.", exampleTrans: "我晚上听古典音乐。" },
    { word: "voyage", phonetic: "/vwa.jaʒ/", translation: "旅行", example: "J'adore faire des voyages en Europe.", exampleTrans: "我喜欢在欧洲旅行。" },
    { word: "heureux", phonetic: "/œ.ʁø/", translation: "幸福的", example: "Je suis très heureux de vous rencontrer.", exampleTrans: "我很高兴认识您。" },
    { word: "triste", phonetic: "/tʁist/", translation: "悲伤的", example: "Il fait gris, je me sens un peu triste.", exampleTrans: "天阴了，我感觉有点难过。" },
    { word: "forêt", phonetic: "/fɔ.ʁɛ/", translation: "森林", example: "Nous nous promenons dans la forêt chaque week-end.", exampleTrans: "我们每个周末在森林里散步。" },
    { word: "rivière", phonetic: "/ʁi.vjɛʁ/", translation: "河流", example: "La rivière coule doucement à travers la vallée.", exampleTrans: "河流缓缓流过山谷。" },
    { word: "montagne", phonetic: "/mɔ̃.taɲ/", translation: "山", example: "Les montagnes sont couvertes de neige en hiver.", exampleTrans: "冬天山上积雪覆盖。" },
    { word: "fenêtre", phonetic: "/fə.nɛtʁ/", translation: "窗户", example: "Ouvre la fenêtre, il fait chaud ici.", exampleTrans: "打开窗户，这里很热。" },
    { word: "cuisine", phonetic: "/kɥi.zin/", translation: "厨房，烹饪", example: "La cuisine française est connue dans le monde entier.", exampleTrans: "法国菜闻名全世界。" },
    { word: "santé", phonetic: "/sɑ̃.te/", translation: "健康", example: "Faire du sport est bon pour la santé.", exampleTrans: "运动有益健康。" },
    { word: "espoir", phonetic: "/ɛs.pwaʁ/", translation: "希望", example: "Il ne faut jamais perdre l'espoir.", exampleTrans: "永远不要失去希望。" },
    { word: "liberté", phonetic: "/li.bɛʁ.te/", translation: "自由", example: "La liberté est un droit fondamental.", exampleTrans: "自由是一项基本权利。" },
    { word: "sourire", phonetic: "/su.ʁiʁ/", translation: "微笑", example: "Son sourire illumine toute la pièce.", exampleTrans: "她的微笑照亮了整个房间。" }
  ],

  /* ============ French: Grammar Practice (10 items for daily rotation) ============ */
  frenchGrammar: [
    {
      topic: "être 动词变位（现在时）",
      rule: "<strong>être</strong>（是）是法语最基本的不规则动词。现在时变位：<br>J<strong>e suis</strong> / Tu <strong>es</strong> / Il/Elle <strong>est</strong> / Nous <strong>sommes</strong> / Vous <strong>êtes</strong> / Ils/Elles <strong>sont</strong>",
      question: "选择正确的变位形式：Elle ___ étudiante.",
      options: ["suis", "es", "est", "sont"],
      answer: 2,
      explanation: "Elle（她）对应第三人称单数，使用 est。"
    },
    {
      topic: "名词阴阳性",
      rule: "法语所有名词都有性别（阳性/阴性）。一般规则：以 -e 结尾多为阴性，其他多为阳性。但有大量例外，需记忆。<br>冠词：le（阳性）/ la（阴性）/ un（阳性一）/ une（阴性一）",
      question: "选择正确的冠词：___ livre（书）",
      options: ["la", "une", "le", "l'"],
      answer: 2,
      explanation: "livre 是阳性名词，使用阳性定冠词 le。"
    },
    {
      topic: "avoir 动词变位（现在时）",
      rule: "<strong>avoir</strong>（有）也是高频不规则动词。现在时变位：<br>J<strong>'ai</strong> / Tu <strong>as</strong> / Il/Elle <strong>a</strong> / Nous <strong>avons</strong> / Vous <strong>avez</strong> / Ils/Elles <strong>ont</strong>",
      question: "选择正确的变位形式：Nous ___ un chien.",
      options: ["ai", "as", "avons", "ont"],
      answer: 2,
      explanation: "Nous（我们）对应第一人称复数，使用 avons。"
    },
    {
      topic: "形容词配合",
      rule: "法语形容词需要与名词的<strong>性别</strong>和<strong>数</strong>保持一致。<br>阳性单数 → 阴性单数通常加 -e<br>单数 → 复数通常加 -s",
      question: "选择正确的形容词形式：une maison ___（blanc = 白色的）",
      options: ["blanc", "blanche", "blancs", "blanches"],
      answer: 1,
      explanation: "maison 是阴性单数名词，blanc 的阴性单数形式为 blanche（加 -he）。"
    },
    {
      topic: "疑问句构成",
      rule: "法语疑问句有三种形式：<br>1. 口语：主语+动词+疑问词？<br>2. 标准加 est-ce que：Est-ce que + 陈述句？<br>3. 正式倒装：动词-主语？",
      question: "将以下句子变成疑问句（倒装形式）：Tu parles français.",
      options: ["Tu parles français ?", "Est-ce que tu parles français ?", "Parles-tu français ?", "Tu français parles ?"],
      answer: 2,
      explanation: "倒装疑问句结构为：动词-主语代词？parles-tu français ?（注意连字符 -）。"
    },
    {
      topic: "冠词缩合",
      rule: "介词 à 或 de 遇到阳性单数定冠词 le / les 时需要缩合：<br>à + le = <strong>au</strong><br>à + les = <strong>aux</strong><br>de + le = <strong>du</strong><br>de + les = <strong>des</strong>",
      question: "选择正确的缩合形式：Je vais ___ cinéma.",
      options: ["à le", "au", "à la", "aux"],
      answer: 1,
      explanation: "cinéma 是阳性名词，à + le = au。所以是 Je vais au cinéma.（我去看电影）"
    },
    {
      topic: "aller 动词变位（现在时）",
      rule: "<strong>aller</strong>（去）是重要的不规则动词。现在时变位：<br>Je <strong>vais</strong> / Tu <strong>vas</strong> / Il/Elle <strong>va</strong> / Nous <strong>allons</strong> / Vous <strong>allez</strong> / Ils/Elles <strong>vont</strong>",
      question: "选择正确的变位形式：Ils ___ au cinéma ce soir.",
      options: ["va", "vont", "allez", "allons"],
      answer: 1,
      explanation: "Ils（他们）对应第三人称复数，使用 vont。"
    },
    {
      topic: "否定结构 ne...pas",
      rule: "法语否定结构用 <strong>ne...pas</strong> 包围变位动词：<br>Je ne parle pas anglais.（我不会说英语）<br>在口语中 ne 常被省略：Je parle pas anglais.",
      question: "选择正确的否定句：Je ___ comprends ___ .",
      options: ["ne / pas", "pas / ne", "ne / rien", "pas / plus"],
      answer: 0,
      explanation: "正确结构是 ne + 动词 + pas。所以是 Je ne comprends pas.（我不明白）。"
    },
    {
      topic: "部分冠词",
      rule: "法语中表示不可数名词的「一些」用部分冠词：<br>阳性：<strong>du</strong> pain（一些面包）<br>阴性：<strong>de la</strong> viande（一些肉）<br>元音前：<strong>de l'</strong>eau（一些水）",
      question: "选择正确的部分冠词：Je voudrais ___ fromage.",
      options: ["le", "la", "du", "les"],
      answer: 2,
      explanation: "fromage 是阳性不可数名词，用部分冠词 du。Je voudrais du fromage.（我想要一些奶酪）。"
    },
    {
      topic: "最近将来时（futur proche）",
      rule: "用 <strong>aller + 动词原形</strong> 表示即将发生的动作：<br>Je <strong>vais</strong> manger.（我准备吃饭）<br>Nous <strong>allons</strong> partir.（我们要出发了）",
      question: "选择正确形式：Demain, je ___ visiter le musée.",
      options: ["suis", "vais", "ai", "fais"],
      answer: 1,
      explanation: "最近将来时 = aller + 动词原形。Je vais visiter le musée.（我明天要去参观博物馆）。"
    }
  ],

  /* ============ French: Leveled Reading (3 per level for daily rotation) ============ */
  frenchReading: [
    // Level 0: A1 启蒙
    [
      {
        tag: "Lecture A1",
        level: "A1 · 启蒙",
        title: "Bonjour !",
        body: `<p>Bonjour ! Je m'appelle Marie. J'ai cinq ans. J'habite à Paris.</p>
        <p>J'aime les fleurs. J'aime le soleil. J'aime mon chat.</p>
        <p>Mon chat est petit. Mon chat est noir. Il s'appelle Minou.</p>
        <p>Au revoir ! À demain !</p>`,
        translation: `<p>你好！我叫玛丽。我五岁。我住在巴黎。</p>
        <p>我喜欢花。我喜欢太阳。我喜欢我的猫。</p>
        <p>我的猫很小。我的猫是黑色的。它叫米努。</p>
        <p>再见！明天见！</p>`
      },
      {
        tag: "Lecture A1",
        level: "A1 · 启蒙",
        title: "La Famille",
        body: `<p>Voici ma famille. Mon père s'appelle Paul. Ma mère s'appelle Sophie.</p>
        <p>J'ai un frère. Il s'appelle Lucas. Il a huit ans.</p>
        <p>J'ai une sœur. Elle s'appelle Léa. Elle a trois ans.</p>
        <p>Nous habitons dans une maison. La maison est blanche.</p>
        <p>J'aime ma famille.</p>`,
        translation: `<p>这是我的家庭。我的爸爸叫保罗。我的妈妈叫苏菲。</p>
        <p>我有一个哥哥。他叫卢卡斯。他八岁了。</p>
        <p>我有一个妹妹。她叫莱娅。她三岁了。</p>
        <p>我们住在一栋房子里。房子是白色的。</p>
        <p>我爱我的家庭。</p>`
      },
      {
        tag: "Lecture A1",
        level: "A1 · 启蒙",
        title: "Les Couleurs",
        body: `<p>J'aime les couleurs. Le ciel est bleu. L'herbe est verte.</p>
        <p>Le soleil est jaune. La pomme est rouge.</p>
        <p>Mon sac est noir. Ma robe est blanche.</p>
        <p>Les fleurs sont roses et violettes. C'est beau !</p>`,
        translation: `<p>我喜欢颜色。天空是蓝色的。草是绿色的。</p>
        <p>太阳是黄色的。苹果是红色的。</p>
        <p>我的包是黑色的。我的裙子是白色的。</p>
        <p>花是粉色和紫色的。真美！</p>`
      }
    ],
    // Level 1: A2 入门
    [
      {
        tag: "Lecture A2",
        level: "A2 · 入门",
        title: "Une Journee a l'Ecole",
        body: `<p>Chaque matin, je me lève à sept heures. Je prends mon petit-déjeuner : du pain avec du beurre et de la confiture, et un grand verre de jus d'orange.</p>
        <p>Ensuite, je vais à l'école à vélo. L'école n'est pas loin, c'est seulement dix minutes. Mon cours préféré, c'est l'art. J'aime dessiner et peindre.</p>
        <p>À midi, je déjeune à la cantine avec mes amis. L'après-midi, nous avons des cours de mathématiques et de français.</p>
        <p>Après l'école, je joue au parc avec mon chien. C'est le meilleur moment de la journée !</p>`,
        translation: `<p>每天早上，我七点起床。我吃早餐：涂了黄油和果酱的面包，还有一大杯橙汁。</p>
        <p>然后，我骑自行车去上学。学校不远，只要十分钟。最喜欢的课是美术。喜欢画画和涂色。</p>
        <p>中午，我和朋友们在食堂吃午饭。下午，我们有数学课和法语课。</p>
        <p>放学后，我和我的狗在公园玩。这是一天中最美好的时刻！</p>`
      },
      {
        tag: "Lecture A2",
        level: "A2 · 入门",
        title: "Au Restaurant",
        body: `<p>Samedi soir, je vais au restaurant avec mes parents. Le restaurant s'appelle « Le Petit Bistro ». Il est petit mais très joli, avec des tables en bois et des bougies sur chaque table.</p>
        <p>Comme entrée, je prends une soupe à l'oignon. C'est un plat typiquement français. Ma mère choisit une salade verte. Mon père préfère les escargots — je ne veux même pas goûter !</p>
        <p>Pour le plat principal, je commande un steak-frites. C'est mon plat préféré. La viande est tendre et les frites sont croustillantes.</p>
        <p>Comme dessert, nous partageons une crème brûlée. Le serveur casse la couche de sucre caramélisé avec une cuillère. C'est délicieux !</p>`,
        translation: `<p>星期六晚上，我和父母去餐厅吃饭。餐厅叫「小酒馆」。它很小但很漂亮，有木桌子和每张桌子上的蜡烛。</p>
        <p>作为前菜，我点了洋葱汤。这是一道典型的法国菜。妈妈选了蔬菜沙拉。爸爸更喜欢蜗牛——我一点也不想尝！</p>
        <p>主菜我点了牛排配薯条。这是我最喜欢的菜。肉很嫩，薯条很脆。</p>
        <p>作为甜点，我们分享了一份焦糖布丁。服务员用勺子敲碎焦糖层。太好吃了！</p>`
      },
      {
        tag: "Lecture A2",
        level: "A2 · 入门",
        title: "Une Visite au Marche",
        body: `<p>Le dimanche matin, j'adore aller au marché avec ma grand-mère. Le marché est sur la place principale du village. Il y a beaucoup de stands colorés.</p>
        <p>D'abord, nous allons chez le fromager. Ma grand-mère achète du camembert et du comté. Le fromager nous fait toujours goûter un petit morceau.</p>
        <p>Ensuite, nous passons devant le marchand de fruits. Les fraises sont rouges et brillantes. Les pêches sentent très bon. Nous achetons une barquette de fraises pour le dessert.</p>
        <p>Avant de partir, ma grand-mère m'offre une brioche toute chaude. Le dimanche au marché, c'est mon moment préféré de la semaine.</p>`,
        translation: `<p>星期天早上，我喜欢和奶奶一起去集市。集市在村庄的主广场上。有很多五颜六色的摊位。</p>
        <p>首先，我们去奶酪摊。奶奶买了卡门贝尔奶酪和孔泰奶酪。奶酪师傅总是让我们尝一小块。</p>
        <p>然后，我们经过水果摊。草莓又红又亮。桃子闻起来很香。我们买了一小篮草莓做甜点。</p>
        <p>临走前，奶奶给我买了一个热乎乎的奶油面包。星期天的集市，是我一周中最喜欢的时刻。</p>`
      }
    ],
    // Level 2: B1 进阶
    [
      {
        tag: "Lecture B1",
        level: "B1 · 进阶",
        title: "Les Saisons en France",
        body: `<p>La France connaît quatre saisons bien marquées, chacune avec son charme particulier. Le printemps, qui arrive en mars, apporte avec lui une explosion de couleurs. Les jardins se remplissent de fleurs et les terrasses de cafés commencent à s'animer.</p>
        <p>L'été, de juin à septembre, est la saison privilégiée pour les vacances. Les Français profitent du soleil sur les plages de la Côte d'Azur ou dans la campagne provençale. C'est aussi la saison des festivals, de la musique en plein air et des marchés colorés.</p>
        <p>L'automne transforme le paysage en une toile aux teintes dorées. C'est la saison des vendanges, où les vignobles produisent le raisin qui deviendra le célèbre vin français.</p>
        <p>Enfin, l'hiver, bien que froid, a sa propre magie. Les marchés de Noël illuminent les villes et l'odeur du vin chaud réchauffe les passants.</p>`,
        translation: `<p>法国有四个分明的季节，每个季节都有其独特的魅力。春天在三月到来，带来色彩的爆发。花园里开满了鲜花，咖啡馆的露台开始热闹起来。</p>
        <p>夏天从六月到九月，是最受青睐的度假季节。法国人在蔚蓝海岸的海滩上或在普罗旺斯的乡村享受阳光。这也是音乐节、户外音乐会和五彩市场的季节。</p>
        <p>秋天将风景变成一幅金色的画卷。这是葡萄采摘的季节，葡萄园生产出将成为著名法国葡萄酒的葡萄。</p>
        <p>最后，冬天虽然寒冷，但也有自己的魔力。圣诞市场点亮了城市，热红酒的香气温暖着行人。</p>`
      },
      {
        tag: "Lecture B1",
        level: "B1 · 进阶",
        title: "La Gastronomie Française",
        body: `<p>La gastronomie française est inscrite au patrimoine culturel immatériel de l'UNESCO depuis 2010. Ce n'est pas seulement une question de bonne cuisine — c'est un art de vivre qui valorise le partage, la convivialité et le plaisir d'être ensemble autour d'une table.</p>
        <p>Chaque région de France possède ses propres spécialités. En Bretagne, on déguste des crêpes au sarrasin garnies de fromage et de jambon. En Alsace, la choucroute garnie réchauffe les cœurs pendant les hivers froids. À Lyon, capitale de la gastronomie, les bouchons lyonnais servent des plats généreux comme le saucisson brioché.</p>
        <p>Le repas français traditionnel suit une structure bien précise : apéritif, entrée, plat principal, fromage, dessert, et souvent un café pour terminer. Ce rituel, qui peut durer deux ou trois heures, reflète l'importance que les Français accordent au temps passé à table.</p>`,
        translation: `<p>法国美食自 2010 年起被列入联合国教科文组织非物质文化遗产。这不仅仅是关于美食的问题——这是一种生活的艺术，强调分享、欢乐和围坐在餐桌旁一起享受的乐趣。</p>
        <p>法国每个地区都有自己的特色菜。在布列塔尼，人们品尝荞麦可丽饼配上奶酪和火腿。在阿尔萨斯，酸菜腌肉在寒冷的冬天温暖人心。在美食之都里昂，里昂小馆供应丰盛的菜肴，如面包香肠。</p>
        <p>传统的法国餐遵循明确的结构：开胃酒、前菜、主菜、奶酪、甜点，通常以一杯咖啡结束。这个仪式可能持续两到三个小时，反映了法国人对餐桌时间的重视。</p>`
      },
      {
        tag: "Lecture B1",
        level: "B1 · 进阶",
        title: "Le Systeme Educatif Francais",
        body: `<p>Le système éducatif français est réputé pour sa rigueur et son exigence académique. L'école est obligatoire pour tous les enfants de trois à seize ans. Le cursus se divise en plusieurs étapes : l'école maternelle, l'école élémentaire, le collège et le lycée.</p>
        <p>Une particularité française est la notation sur 20. Les élèves reçoivent des notes tout au long de l'année, et la moyenne — 10 sur 20 — est nécessaire pour passer dans la classe supérieure. Le système est souvent critiqué pour sa sévérité, mais beaucoup de Français considèrent qu'il prépare bien les élèves aux études supérieures.</p>
        <p>Le baccalauréat, passé à la fin du lycée, est un rite de passage important. Chaque année, au mois de juin, des centaines de milliers de lycéens passent cet examen qui détermine leur accès à l'université. Les résultats sont affichés devant les lycées, et c'est toujours un moment de grande émotion pour les familles.</p>`,
        translation: `<p>法国教育体系以其严谨和学术要求而闻名。所有三至十六岁的儿童都必须接受教育。课程分为几个阶段：幼儿园、小学、初中和高中。</p>
        <p>法国的一个特色是 20 分制评分。学生全年收到分数，平均分——20 分中的 10 分——是升入更高年级的必要条件。这个体系常因严厉而受到批评，但许多法国人认为它为高等教育做好了充分准备。</p>
        <p>高中毕业会考（baccalauréat）是一个重要的成人仪式。每年六月，数十万高中生参加这个决定他们能否进入大学的考试。成绩张贴在学校门口，这对家庭来说总是一个充满情感的时刻。</p>`
      }
    ]
  ]
};
