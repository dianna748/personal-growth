/* ============================================
   Bloom · English News Article Pool
   Sources indexed by day: each day maps to
   articles[idx % pool.length]. Date is assigned
   dynamically on first access.
   ============================================ */

const ENGLISH_ARTICLE_POOL = [
  // ---- 0: The Economist - AI Regulation ----
  {
    source: "The Economist",
    title: "The Global Race to Regulate Artificial Intelligence Is Heating Up",
    body: `<p>Governments around the world are scrambling to establish <span class="highlight" data-word="regulatory frameworks">regulatory frameworks</span> for artificial intelligence, as fears grow that the technology could <span class="highlight" data-word="outpace">outpace</span> existing laws. The European Union has taken an early lead with its comprehensive AI Act, which categorizes applications by risk level and <span class="highlight" data-word="imposes">imposes</span> strict requirements on high-risk systems.</p>
    <p>Meanwhile, the United States has adopted a more <span class="highlight" data-word="piecemeal">piecemeal</span> approach, relying on executive orders and agency-level guidance rather than sweeping legislation. China, by contrast, has moved to regulate generative AI specifically, requiring companies to obtain government approval before releasing models to the public.</p>
    <p>The <span class="highlight" data-word="divergence">divergence</span> in regulatory philosophies is creating compliance headaches for multinational corporations. Some executives warn that an uncoordinated <span class="highlight" data-word="patchwork">patchwork</span> of rules could stifle innovation and fragment the global AI market, while others argue that competing regulatory models will ultimately produce more <span class="highlight" data-word="robust">robust</span> governance through natural experimentation.</p>`,
    vocab: [
      { word: "regulatory frameworks", phonetic: "/ˈreɡjələtəri ˈfreɪmwɜːks/", meaning: "systems of rules and guidelines set by authorities" },
      { word: "outpace", phonetic: "/aʊtˈpeɪs/", meaning: "to develop or increase faster than" },
      { word: "imposes", phonetic: "/ɪmˈpəʊzɪz/", meaning: "enforces or applies rules, often in an authoritative way" },
      { word: "piecemeal", phonetic: "/ˈpiːsmiːl/", meaning: "done in separate stages rather than according to a single plan" },
      { word: "divergence", phonetic: "/daɪˈvɜːdʒəns/", meaning: "the process of moving apart or becoming different" },
      { word: "patchwork", phonetic: "/ˈpætʃwɜːk/", meaning: "a system made up of many different and often inconsistent parts" },
      { word: "robust", phonetic: "/rəʊˈbʌst/", meaning: "strong, healthy, and unlikely to fail or weaken" }
    ]
  },

  // ---- 1: The Atlantic - Climate Innovation ----
  {
    source: "The Atlantic",
    title: "Can Direct Air Capture Technology Actually Help Solve Climate Change?",
    body: `<p>Direct air capture, or DAC, has emerged as one of the most <span class="highlight" data-word="contentious">contentious</span> technologies in the climate debate. Proponents argue that pulling carbon dioxide directly from the <span class="highlight" data-word="ambient">ambient</span> air is essential to meeting net-zero targets, especially in sectors like aviation and steelmaking where emissions are hardest to eliminate.</p>
    <p>Critics, however, point to the technology's <span class="highlight" data-word="exorbitant">exorbitant</span> costs and immense energy requirements. Capturing a single metric ton of CO₂ currently costs between $600 and $1,000 — far more than most carbon pricing schemes. There is also concern that the <span class="highlight" data-word="allure">allure</span> of future DAC deployment could serve as a dangerous <span class="highlight" data-word="pretext">pretext</span> for delaying the urgent transition away from fossil fuels.</p>
    <p>Despite these challenges, investment is pouring in. Several large-scale facilities are under construction in Iceland and the United States, backed by <span class="highlight" data-word="lucrative">lucrative</span> government tax credits. The question is no longer whether DAC works, but whether it can scale fast enough — and affordably enough — to make a <span class="highlight" data-word="meaningful">meaningful</span> dent in global emissions.</p>`,
    vocab: [
      { word: "contentious", phonetic: "/kənˈtenʃəs/", meaning: "causing or likely to cause disagreement or argument" },
      { word: "ambient", phonetic: "/ˈæmbiənt/", meaning: "relating to the immediate surroundings; present in the environment" },
      { word: "exorbitant", phonetic: "/ɪɡˈzɔːbɪtənt/", meaning: "unreasonably high or extreme, especially of a price" },
      { word: "allure", phonetic: "/əˈljʊə(r)/", meaning: "the quality of being powerfully and mysteriously attractive" },
      { word: "pretext", phonetic: "/ˈpriːtekst/", meaning: "a false reason given to hide the real one" },
      { word: "lucrative", phonetic: "/ˈluːkrətɪv/", meaning: "producing a great deal of profit" },
      { word: "meaningful", phonetic: "/ˈmiːnɪŋfl/", meaning: "having a serious, important, or useful quality" }
    ]
  },

  // ---- 2: NYT - Remote Work ----
  {
    source: "The New York Times",
    title: "Five Years In, Remote Work Has Quietly Rewired the American Economy",
    body: `<p>The shift to remote work, once <span class="highlight" data-word="dismissed">dismissed</span> as a temporary <span class="highlight" data-word="aberration">aberration</span> brought on by the pandemic, has proven remarkably durable. Data from the Bureau of Labor Statistics now shows that roughly 28% of paid workdays in the United States are performed from home — a figure that has stabilized over the past two years and shows no sign of declining.</p>
    <p>The economic <span class="highlight" data-word="ripple effects">ripple effects</span> are profound and far-reaching. Downtown office districts have seen commercial vacancy rates <span class="highlight" data-word="soar">soar</span>, while suburban and exurban housing markets have boomed. Restaurants that once relied on lunch crowds are struggling, even as neighborhood cafes near residential areas thrive. The daily <span class="highlight" data-word="commute">commute</span> that once defined American work culture is steadily fading from daily life.</p>
    <p>Perhaps most <span class="highlight" data-word="consequential">consequential</span> is the geographic redistribution of talent. Highly skilled workers are increasingly leaving expensive coastal cities and relocating to smaller metros with lower costs of living. This <span class="highlight" data-word="dispersion">dispersion</span> could, over time, reduce regional inequality — but it also risks hollowing out the middle-wage service economies of superstar cities.</p>`,
    vocab: [
      { word: "dismissed", phonetic: "/dɪsˈmɪst/", meaning: "treated as unworthy of serious consideration" },
      { word: "aberration", phonetic: "/ˌæbəˈreɪʃn/", meaning: "a departure from what is normal or expected" },
      { word: "ripple effects", phonetic: "/ˈrɪpl ɪˈfekts/", meaning: "spreading consequences or impacts from an initial event" },
      { word: "soar", phonetic: "/sɔː(r)/", meaning: "to rise or increase very rapidly" },
      { word: "commute", phonetic: "/kəˈmjuːt/", meaning: "the regular journey between home and work" },
      { word: "consequential", phonetic: "/ˌkɒnsɪˈkwenʃl/", meaning: "having significant importance or consequences" },
      { word: "dispersion", phonetic: "/dɪˈspɜːʃn/", meaning: "the spreading of something over a wide area" }
    ]
  },

  // ---- 3: BBC - Space Exploration ----
  {
    source: "BBC News",
    title: "The New Space Race: Why Nations Are Racing Back to the Moon",
    body: `<p>More than half a century after Apollo 11, the Moon is once again the object of an <span class="highlight" data-word="intensifying">intensifying</span> geopolitical competition. The United States, China, India, and a coalition of smaller nations are all pursuing crewed lunar missions, each with their own <span class="highlight" data-word="compelling">compelling</span> mix of scientific, economic, and strategic motivations.</p>
    <p>The <span class="highlight" data-word="incentives">incentives</span> go far beyond national pride. The lunar south pole is believed to contain vast deposits of water ice, which could be used to produce rocket fuel and support long-term <span class="highlight" data-word="habitation">habitation</span>. More <span class="highlight" data-word="ambitious">ambitious</span> still is the prospect of mining rare minerals — including helium-3, a potential fuel for future fusion reactors — though the economics of extraterrestrial mining remain highly theoretical.</p>
    <p>Critics argue that the billions being poured into lunar exploration would be better spent on problems closer to home. But proponents insist that space <span class="highlight" data-word="expeditions">expeditions</span> drive technological innovation that yields <span class="highlight" data-word="tangible">tangible</span> benefits on Earth, from satellite communications to medical imaging breakthroughs.</p>`,
    vocab: [
      { word: "intensifying", phonetic: "/ɪnˈtensɪfaɪɪŋ/", meaning: "becoming stronger or more extreme" },
      { word: "compelling", phonetic: "/kəmˈpelɪŋ/", meaning: "evoking interest or attention in an irresistible way" },
      { word: "incentives", phonetic: "/ɪnˈsentɪvz/", meaning: "things that motivate or encourage action" },
      { word: "habitation", phonetic: "/ˌhæbɪˈteɪʃn/", meaning: "the act of living in a place" },
      { word: "ambitious", phonetic: "/æmˈbɪʃəs/", meaning: "having or showing a strong desire for success or achievement" },
      { word: "expeditions", phonetic: "/ˌekspəˈdɪʃnz/", meaning: "journeys undertaken for a specific purpose, especially exploration" },
      { word: "tangible", phonetic: "/ˈtændʒəbl/", meaning: "real and able to be shown or experienced" }
    ]
  },

  // ---- 4: The Economist - Global Trade ----
  {
    source: "The Economist",
    title: "Supply Chains Are Shifting Faster Than Anyone Predicted",
    body: `<p>For decades, corporate strategy was built on a simple <span class="highlight" data-word="premise">premise</span>: manufacture where costs are lowest and sell where margins are highest. That logic produced <span class="highlight" data-word="sprawling">sprawling</span> global supply chains that <span class="highlight" data-word="crisscrossed">crisscrossed</span> the planet. But a series of shocks — trade wars, a pandemic, and rising geopolitical tensions — has prompted the most dramatic reconfiguration of global trade in a generation.</p>
    <p>Executives are now talking less about efficiency and more about <span class="highlight" data-word="resilience">resilience</span> and redundancy. The term "nearshoring" — moving production closer to final markets — has moved from business-school jargon to boardroom <span class="highlight" data-word="imperative">imperative</span>. Mexico has emerged as a particular beneficiary, with foreign direct investment surging as American firms shift manufacturing out of Asia.</p>
    <p>Yet the transition is <span class="highlight" data-word="fraught">fraught</span> with difficulty. Building new factories, training workforces, and establishing reliable local supplier networks takes years and billions of dollars. Some economists warn that the <span class="highlight" data-word="pendulum">pendulum</span> may be swinging too far toward costly duplication and away from the specialization that has driven global prosperity for decades.</p>`,
    vocab: [
      { word: "premise", phonetic: "/ˈpremɪs/", meaning: "a statement or idea that forms the basis for a theory or argument" },
      { word: "sprawling", phonetic: "/ˈsprɔːlɪŋ/", meaning: "spreading out over a large area in an uncontrolled way" },
      { word: "crisscrossed", phonetic: "/ˈkrɪskrɒst/", meaning: "crossed repeatedly in different directions" },
      { word: "resilience", phonetic: "/rɪˈzɪliəns/", meaning: "the ability to recover quickly from difficulties" },
      { word: "imperative", phonetic: "/ɪmˈperətɪv/", meaning: "an essential or urgent thing" },
      { word: "fraught", phonetic: "/frɔːt/", meaning: "filled with something undesirable, especially problems or anxiety" },
      { word: "pendulum", phonetic: "/ˈpendjʊləm/", meaning: "something that tends to swing from one extreme to another" }
    ]
  },

  // ---- 5: HBR - Workplace Mental Health ----
  {
    source: "Harvard Business Review",
    title: "Why Mental Health Benefits Are No Longer Optional for Employers",
    body: `<p>The <span class="highlight" data-word="stigma">stigma</span> around discussing mental health at work has <span class="highlight" data-word="eroded">eroded</span> significantly over the past decade, accelerated by a generation of younger workers who expect <span class="highlight" data-word="transparency">transparency</span> and support from their employers. Surveys consistently show that mental health benefits rank among the top three priorities for job seekers under 35 — behind only salary and career growth opportunities.</p>
    <p>Companies that invest <span class="highlight" data-word="proactively">proactively</span> in employee well-being are seeing measurable returns. Firms with comprehensive mental health programs report lower <span class="highlight" data-word="turnover">turnover</span>, fewer sick days, and higher engagement scores. Some research even suggests that every dollar spent on mental health support yields roughly four dollars in improved productivity and reduced health care costs.</p>
    <p>But implementing effective programs requires more than adding a meditation app to the benefits <span class="highlight" data-word="portfolio">portfolio</span>. The most successful companies are those where senior leaders model <span class="highlight" data-word="vulnerability">vulnerability</span> — sharing their own struggles openly — and middle managers are trained to recognize early signs of burnout before they escalate into crises.</p>`,
    vocab: [
      { word: "stigma", phonetic: "/ˈstɪɡmə/", meaning: "a mark of disgrace associated with a particular circumstance or quality" },
      { word: "eroded", phonetic: "/ɪˈrəʊdɪd/", meaning: "gradually destroyed or diminished" },
      { word: "transparency", phonetic: "/trænsˈpærənsi/", meaning: "openness, honesty, and willingness to share information" },
      { word: "proactively", phonetic: "/prəʊˈæktɪvli/", meaning: "acting in advance to deal with expected difficulties" },
      { word: "turnover", phonetic: "/ˈtɜːnəʊvə(r)/", meaning: "the rate at which employees leave a company and are replaced" },
      { word: "portfolio", phonetic: "/pɔːtˈfəʊliəʊ/", meaning: "a range of products, services, or investments held" },
      { word: "vulnerability", phonetic: "/ˌvʌlnərəˈbɪləti/", meaning: "the quality of being open to emotional or physical harm — and to connection" }
    ]
  },

  // ---- 6: Wired - EV Revolution ----
  {
    source: "Wired",
    title: "Electric Vehicles Are Winning — But the Grid Isn't Ready",
    body: `<p>Global sales of electric vehicles surpassed 17 million units last year, <span class="highlight" data-word="defying">defying</span> predictions from industry analysts who had expected growth to taper off. China, Europe, and increasingly the United States are all <span class="highlight" data-word="embracing">embracing</span> EVs at a pace that would have seemed <span class="highlight" data-word="far-fetched">far-fetched</span> just five years ago. Battery costs continue to fall, and a wave of affordable models is finally arriving.</p>
    <p>The bottleneck, however, has shifted from manufacturing to <span class="highlight" data-word="infrastructure">infrastructure</span>. Power grids in many countries were designed decades ago for a world of gas stations and 9-to-5 office work. They were not engineered to handle millions of vehicles charging simultaneously during evening peaks. Utilities are racing to upgrade <span class="highlight" data-word="transmission">transmission</span> lines and install smart-charging systems, but the timeline is tight, and the capital costs are enormous.</p>
    <p>Some <span class="highlight" data-word="visionaries">visionaries</span> see opportunity in the crisis. Vehicle-to-grid technology, which allows EV batteries to feed power back into the grid during peak demand, could turn millions of parked cars into a <span class="highlight" data-word="distributed">distributed</span> energy storage network. If the technology matures, the very cars that strain the grid could become its greatest asset.</p>`,
    vocab: [
      { word: "defying", phonetic: "/dɪˈfaɪɪŋ/", meaning: "openly resisting or refusing to obey or conform" },
      { word: "embracing", phonetic: "/ɪmˈbreɪsɪŋ/", meaning: "accepting or supporting something willingly and enthusiastically" },
      { word: "far-fetched", phonetic: "/fɑː ˈfetʃt/", meaning: "unlikely to be true or to happen" },
      { word: "infrastructure", phonetic: "/ˈɪnfrəstrʌktʃə(r)/", meaning: "the basic physical and organizational structures needed for operation" },
      { word: "transmission", phonetic: "/trænzˈmɪʃn/", meaning: "the process of transporting electrical energy from power plants to consumers" },
      { word: "visionaries", phonetic: "/ˈvɪʒənriz/", meaning: "people with original and creative ideas about the future" },
      { word: "distributed", phonetic: "/dɪˈstrɪbjuːtɪd/", meaning: "spread out or shared across multiple locations" }
    ]
  },

  // ---- 7: The Guardian - Ocean Conservation ----
  {
    source: "The Guardian",
    title: "The High Seas Treaty Offers a Rare Glimmer of Hope for the World's Oceans",
    body: `<p>After nearly two decades of stalled negotiations, the United Nations has finally <span class="highlight" data-word="ratified">ratified</span> a landmark treaty to protect marine biodiversity in international waters — the vast swaths of ocean that lie beyond any single country's <span class="highlight" data-word="jurisdiction">jurisdiction</span>. The High Seas Treaty, as it is known, creates a legal framework for establishing marine protected areas and regulating activities such as deep-sea mining and genetic resource extraction.</p>
    <p>The stakes could hardly be higher. The high seas cover nearly half the planet's surface and are home to <span class="highlight" data-word="countless">countless</span> species, many still undiscovered. Yet only about 1% of these waters currently enjoy any form of protection. <span class="highlight" data-word="Rampant">Rampant</span> overfishing, plastic pollution, and the emerging threat of seabed mining have pushed many marine ecosystems to the <span class="highlight" data-word="brink">brink</span>.</p>
    <p>The treaty's success will ultimately depend on enforcement — historically a <span class="highlight" data-word="chronic">chronic</span> weakness of international environmental agreements. But proponents are cautiously optimistic, pointing to recent advances in satellite monitoring and the growing political will among nations that have come to see the ocean's health as a matter of economic <span class="highlight" data-word="self-interest">self-interest</span>.</p>`,
    vocab: [
      { word: "ratified", phonetic: "/ˈrætɪfaɪd/", meaning: "formally approved and made official, especially by a government" },
      { word: "jurisdiction", phonetic: "/ˌdʒʊərɪsˈdɪkʃn/", meaning: "the official power to make legal decisions and judgments" },
      { word: "countless", phonetic: "/ˈkaʊntləs/", meaning: "too many to be counted; very numerous" },
      { word: "rampant", phonetic: "/ˈræmpənt/", meaning: "flourishing or spreading unchecked" },
      { word: "brink", phonetic: "/brɪŋk/", meaning: "the edge of something, especially a disaster or crisis" },
      { word: "chronic", phonetic: "/ˈkrɒnɪk/", meaning: "persisting for a long time or constantly recurring" },
      { word: "self-interest", phonetic: "/self ˈɪntrəst/", meaning: "concern for one's own advantage or well-being" }
    ]
  },

  // ---- 8: NYT - Microbiome ----
  {
    source: "The New York Times",
    title: "Your Gut Bacteria May Hold the Key to Treating Depression",
    body: `<p>The <span class="highlight" data-word="burgeoning">burgeoning</span> field of nutritional psychiatry is upending decades of <span class="highlight" data-word="conventional">conventional</span> wisdom about mental health treatment. Researchers have discovered that the <span class="highlight" data-word="trillions">trillions</span> of microorganisms living in the human gut — collectively known as the gut microbiome — communicate directly with the brain via the vagus nerve and through the production of neurotransmitters like serotonin and dopamine.</p>
    <p>Clinical trials are now <span class="highlight" data-word="underway">underway</span> testing whether carefully selected <span class="highlight" data-word="probiotics">probiotics</span> — supplements containing beneficial bacteria — can <span class="highlight" data-word="alleviate">alleviate</span> symptoms of depression and anxiety. Early results, while preliminary, are intriguing. Patients who received a specific strain of Lactobacillus showed measurable reductions in cortisol levels and reported fewer <span class="highlight" data-word="episodes">episodes</span> of low mood compared to those on a placebo.</p>
    <p>Skeptics caution that it is too early to declare the microbiome a <span class="highlight" data-word="silver bullet">silver bullet</span>. The relationship between gut health and mental well-being is <span class="highlight" data-word="exceedingly">exceedingly</span> complex, and individual responses to probiotic treatments vary widely. But the growing body of evidence suggests that diet and digestive health should be part of any comprehensive approach to mental health care.</p>`,
    vocab: [
      { word: "burgeoning", phonetic: "/ˈbɜːdʒənɪŋ/", meaning: "beginning to grow or increase rapidly" },
      { word: "conventional", phonetic: "/kənˈvenʃənl/", meaning: "based on or in accordance with what is generally done or believed" },
      { word: "trillions", phonetic: "/ˈtrɪljənz/", meaning: "a very large number; a million million" },
      { word: "underway", phonetic: "/ˌʌndəˈweɪ/", meaning: "having started and in progress" },
      { word: "probiotics", phonetic: "/ˌprəʊbaɪˈɒtɪks/", meaning: "live beneficial bacteria consumed for health benefits" },
      { word: "alleviate", phonetic: "/əˈliːvieɪt/", meaning: "to make suffering or a problem less severe" },
      { word: "episodes", phonetic: "/ˈepɪsəʊdz/", meaning: "periods of time during which something happens" },
      { word: "silver bullet", phonetic: "/ˈsɪlvə ˈbʊlɪt/", meaning: "a simple, seemingly magical solution to a complex problem" },
      { word: "exceedingly", phonetic: "/ɪkˈsiːdɪŋli/", meaning: "to a very great degree; extremely" }
    ]
  },

  // ---- 9: The Economist - Aging Population ----
  {
    source: "The Economist",
    title: "The Demographic Time Bomb: How Aging Populations Will Reshape the Global Economy",
    body: `<p>For the first time in human history, there are more people over 65 than under 5. This <span class="highlight" data-word="monumental">monumental</span> demographic shift is <span class="highlight" data-word="unfolding">unfolding</span> at different speeds across the globe — Japan and Italy are already deep into population decline, while China's workforce is <span class="highlight" data-word="projected">projected</span> to shrink by nearly 100 million over the next two decades. Even India and Indonesia, long seen as demographic bright spots, are aging faster than their development trajectories would predict.</p>
    <p>The economic <span class="highlight" data-word="implications">implications</span> are staggering. Shrinking workforces mean slower potential growth. Rising numbers of retirees place <span class="highlight" data-word="unsustainable">unsustainable</span> pressure on pension systems and healthcare budgets. Some economists predict a prolonged era of <span class="highlight" data-word="stagnation">stagnation</span> in countries that fail to adapt.</p>
    <p>But the <span class="highlight" data-word="narrative">narrative</span> is not entirely grim. Countries that embrace automation, raise retirement ages, and invest in retraining older workers could <span class="highlight" data-word="mitigate">mitigate</span> many of the worst effects. The "silver economy" — products and services designed for older consumers — is already a multi-trillion-dollar market that forward-thinking companies are racing to capture.</p>`,
    vocab: [
      { word: "monumental", phonetic: "/ˌmɒnjʊˈmentl/", meaning: "great in importance, extent, or size" },
      { word: "unfolding", phonetic: "/ʌnˈfəʊldɪŋ/", meaning: "developing or becoming clear over time" },
      { word: "projected", phonetic: "/prəˈdʒektɪd/", meaning: "estimated or forecast based on current trends" },
      { word: "implications", phonetic: "/ˌɪmplɪˈkeɪʃənz/", meaning: "possible effects or consequences" },
      { word: "unsustainable", phonetic: "/ˌʌnsəˈsteɪnəbl/", meaning: "not able to be maintained at the current rate or level" },
      { word: "stagnation", phonetic: "/stæɡˈneɪʃn/", meaning: "a lack of activity, growth, or development" },
      { word: "narrative", phonetic: "/ˈnærətɪv/", meaning: "a way of explaining or understanding events" },
      { word: "mitigate", phonetic: "/ˈmɪtɪɡeɪt/", meaning: "to make something less severe, serious, or painful" }
    ]
  },

  // ---- 10: BBC - Digital Privacy ----
  {
    source: "BBC News",
    title: "End-to-End Encryption Is Under Threat — Here's Why It Matters",
    body: `<p>Governments in the United Kingdom, Australia, and several other countries are pushing legislation that would require tech companies to build <span class="highlight" data-word="backdoors">backdoors</span> into encrypted messaging services. The stated goal is to combat child exploitation and terrorism, but <span class="highlight" data-word="privacy advocates">privacy advocates</span> warn that such measures would fundamentally <span class="highlight" data-word="undermine">undermine</span> the security of digital communications for everyone.</p>
    <p>The technical <span class="highlight" data-word="predicament">predicament</span> is straightforward: you cannot weaken encryption only for "the bad guys." Any vulnerability deliberately built into a system is a vulnerability that criminals, hostile governments, and malicious actors can also <span class="highlight" data-word="exploit">exploit</span>. Cryptographers are nearly <span class="highlight" data-word="unanimous">unanimous</span> in their assessment that mandated backdoors are technically unworkable without <span class="highlight" data-word="catastrophic">catastrophic</span> side effects.</p>
    <p>Several major messaging platforms, including Signal and WhatsApp, have stated publicly that they would rather cease operations in certain countries than compromise their encryption. As the legal battle escalates, the outcome will determine whether private digital conversation retains any meaningful protection from surveillance.</p>`,
    vocab: [
      { word: "backdoors", phonetic: "/ˈbækdɔːz/", meaning: "hidden methods of bypassing normal authentication in a system" },
      { word: "privacy advocates", phonetic: "/ˈprɪvəsi ˈædvəkəts/", meaning: "people who campaign for stronger protection of personal data" },
      { word: "undermine", phonetic: "/ˌʌndəˈmaɪn/", meaning: "to damage or weaken gradually or insidiously" },
      { word: "predicament", phonetic: "/prɪˈdɪkəmənt/", meaning: "a difficult, unpleasant, or embarrassing situation" },
      { word: "exploit", phonetic: "/ɪkˈsplɔɪt/", meaning: "to make use of a vulnerability for one's own advantage" },
      { word: "unanimous", phonetic: "/juːˈnænɪməs/", meaning: "fully in agreement" },
      { word: "catastrophic", phonetic: "/ˌkætəˈstrɒfɪk/", meaning: "involving or causing great damage or suffering" }
    ]
  },

  // ---- 11: Wired - Food Tech ----
  {
    source: "Wired",
    title: "Lab-Grown Meat Is Finally on the Menu — But Will Anyone Eat It?",
    body: `<p>After years of <span class="highlight" data-word="hype">hype</span> and billions in venture capital, cultivated meat — grown from animal cells in bioreactors rather than harvested from slaughtered animals — has received regulatory approval in Singapore, the United States, and Israel. A handful of upscale restaurants are now serving cultivated chicken and beef, <span class="highlight" data-word="heralding">heralding</span> what proponents call the beginning of a <span class="highlight" data-word="paradigm">paradigm</span> shift in food production.</p>
    <p>The environmental case is compelling. Traditional livestock farming accounts for roughly 15% of global greenhouse gas emissions and <span class="highlight" data-word="guzzles">guzzles</span> vast quantities of land and water. Lab-grown meat, in theory, could <span class="highlight" data-word="slash">slash</span> those figures dramatically while eliminating the ethical concerns associated with industrial animal agriculture.</p>
    <p>The <span class="highlight" data-word="hurdles">hurdles</span>, however, remain formidable. Production costs, while falling fast, are still too high for mass-market adoption. Consumer surveys reveal <span class="highlight" data-word="deep-seated">deep-seated</span> skepticism — many people find the very concept of lab-grown meat unappetizing. Overcoming the "yuck factor" may prove to be a greater challenge than solving the engineering problems.</p>`,
    vocab: [
      { word: "hype", phonetic: "/haɪp/", meaning: "extravagant or intensive publicity or promotion" },
      { word: "heralding", phonetic: "/ˈherəldɪŋ/", meaning: "announcing or signaling the approach of something" },
      { word: "paradigm", phonetic: "/ˈpærədaɪm/", meaning: "a typical example or pattern; a model or framework" },
      { word: "guzzles", phonetic: "/ˈɡʌzəlz/", meaning: "consumes greedily or in large amounts" },
      { word: "slash", phonetic: "/slæʃ/", meaning: "to reduce dramatically or cut drastically" },
      { word: "hurdles", phonetic: "/ˈhɜːdlz/", meaning: "obstacles or difficulties to be overcome" },
      { word: "deep-seated", phonetic: "/diːp ˈsiːtɪd/", meaning: "firmly established and difficult to change" }
    ]
  },

  // ---- 12: The Atlantic - Education Tech ----
  {
    source: "The Atlantic",
    title: "The AI Tutor Is Here — and Schools Aren't Ready",
    body: `<p>A new generation of AI-powered tutoring systems is <span class="highlight" data-word="poised">poised</span> to transform education in ways both promising and deeply <span class="highlight" data-word="unsettling">unsettling</span>. These tools can <span class="highlight" data-word="adapt">adapt</span> to individual students' learning speeds, offer <span class="highlight" data-word="instantaneous">instantaneous</span> feedback, and tirelessly review concepts until mastery is achieved — capabilities that even the most dedicated human teacher cannot match on a class-wide scale.</p>
    <p>Research from pilot programs in Kenya and India suggests that AI tutors can produce learning gains <span class="highlight" data-word="comparable">comparable</span> to one-on-one human tutoring, long regarded as the gold standard of education. For cash-strapped school systems in developing countries and under-resourced communities in wealthy nations, the technology offers a <span class="highlight" data-word="tantalizing">tantalizing</span> solution to teacher shortages.</p>
    <p>Yet the rollout raises <span class="highlight" data-word="thorny">thorny</span> questions. What happens to the social and emotional dimensions of learning when education is mediated through a screen? Who controls the curriculum when it is delivered by an algorithm? And most <span class="highlight" data-word="urgently">urgently</span>, will AI tutors <span class="highlight" data-word="exacerbate">exacerbate</span> inequality by offering premium versions only to families who can afford them?</p>`,
    vocab: [
      { word: "poised", phonetic: "/pɔɪzd/", meaning: "ready to do something or likely to happen soon" },
      { word: "unsettling", phonetic: "/ʌnˈsetlɪŋ/", meaning: "causing anxiety or uneasiness" },
      { word: "adapt", phonetic: "/əˈdæpt/", meaning: "to change or adjust to suit new conditions" },
      { word: "instantaneous", phonetic: "/ˌɪnstənˈteɪniəs/", meaning: "occurring or done instantly" },
      { word: "comparable", phonetic: "/ˈkɒmpərəbl/", meaning: "able to be compared; of similar quality" },
      { word: "tantalizing", phonetic: "/ˈtæntəlaɪzɪŋ/", meaning: "temptingly attractive but just out of reach" },
      { word: "thorny", phonetic: "/ˈθɔːni/", meaning: "causing difficulty or disagreement; problematic" },
      { word: "urgently", phonetic: "/ˈɜːdʒəntli/", meaning: "in a way that requires immediate action or attention" },
      { word: "exacerbate", phonetic: "/ɪɡˈzæsəbeɪt/", meaning: "to make a bad situation worse" }
    ]
  },

  // ---- 13: The Guardian - Biodiversity ----
  {
    source: "The Guardian",
    title: "One Million Species Face Extinction. Can the World Reverse the Trend?",
    body: `<p>The 2019 Global Assessment Report on Biodiversity delivered a <span class="highlight" data-word="sobering">sobering</span> verdict: roughly one million animal and plant species are now threatened with extinction, many within decades. The primary <span class="highlight" data-word="culprit">culprit</span> is not a single cause but a <span class="highlight" data-word="confluence">confluence</span> of pressures — habitat destruction, overexploitation, pollution, invasive species, and climate change — all driven by human activity.</p>
    <p>Yet amid the <span class="highlight" data-word="gloom">gloom</span>, there are remarkable success stories. The <span class="highlight" data-word="resurgence">resurgence</span> of the bald eagle in North America, the return of wolves to Yellowstone, and the restoration of coral reefs in parts of the Philippines demonstrate that <span class="highlight" data-word="concerted">concerted</span> conservation efforts can yield dramatic results. The key ingredients are consistent: adequate funding, strong legal protections, and the engagement of local communities who become <span class="highlight" data-word="stewards">stewards</span> of their own ecosystems.</p>
    <p>The upcoming UN biodiversity conference will test whether the international community can show the same <span class="highlight" data-word="urgency">urgency</span> on species loss that it has begun to demonstrate on climate change. The two crises are, in any case, deeply intertwined — protecting forests and oceans is one of the most effective strategies for both preserving biodiversity and absorbing carbon from the atmosphere.</p>`,
    vocab: [
      { word: "sobering", phonetic: "/ˈsəʊbərɪŋ/", meaning: "making you feel serious and thoughtful" },
      { word: "culprit", phonetic: "/ˈkʌlprɪt/", meaning: "the cause of a problem or the person responsible" },
      { word: "confluence", phonetic: "/ˈkɒnfluəns/", meaning: "the coming together of two or more things" },
      { word: "gloom", phonetic: "/ɡluːm/", meaning: "a state of depression or despondency; darkness" },
      { word: "resurgence", phonetic: "/rɪˈsɜːdʒəns/", meaning: "an increase or revival after a period of little activity" },
      { word: "concerted", phonetic: "/kənˈsɜːtɪd/", meaning: "jointly arranged or carried out; coordinated" },
      { word: "stewards", phonetic: "/ˈstjuːədz/", meaning: "people responsible for taking care of something" },
      { word: "urgency", phonetic: "/ˈɜːdʒənsi/", meaning: "importance requiring swift action" },
      { word: "intertwined", phonetic: "/ˌɪntəˈtwaɪnd/", meaning: "twisted together or closely connected" }
    ]
  },

  // ---- 14: The Economist - Quantum Computing ----
  {
    source: "The Economist",
    title: "Quantum Computing Is Finally Delivering on Its Promise",
    body: `<p>For years, quantum computing was <span class="highlight" data-word="dismissed">dismissed</span> by <span class="highlight" data-word="sceptics">sceptics</span> as a technology perpetually "ten years away." That era of doubt is now ending. Major technology companies and well-funded startups have demonstrated quantum processors capable of solving specific problems in minutes that would take classical supercomputers thousands of years — a milestone known as <span class="highlight" data-word="quantum supremacy">quantum supremacy</span>.</p>
    <p>The <span class="highlight" data-word="ramifications">ramifications</span> extend across industries. In pharmaceuticals, quantum simulations could <span class="highlight" data-word="drastically">drastically</span> accelerate drug discovery by modeling molecular interactions that are too complex for conventional computers. In finance, quantum algorithms could optimize investment portfolios with a precision that classical models cannot match. In logistics, they could solve the notoriously difficult traveling-salesman problem at unprecedented scale.</p>
    <p>But the technology is not yet ready for the <span class="highlight" data-word="mainstream">mainstream</span>. Current quantum computers are <span class="highlight" data-word="notoriously">notoriously</span> error-prone, requiring elaborate error-correction schemes that consume most of their processing power. Scaling up to the thousands of stable qubits needed for practical applications remains a formidable engineering challenge. The race is now on to build the first fault-tolerant quantum computer — and the <span class="highlight" data-word="stakes">stakes</span> could hardly be higher.</p>`,
    vocab: [
      { word: "sceptics", phonetic: "/ˈskeptɪks/", meaning: "people who question or doubt accepted opinions" },
      { word: "quantum supremacy", phonetic: "/ˈkwɒntəm sʊˈpreməsi/", meaning: "the point at which a quantum computer outperforms any classical computer" },
      { word: "ramifications", phonetic: "/ˌræmɪfɪˈkeɪʃnz/", meaning: "complex or unwelcome consequences of an action or event" },
      { word: "drastically", phonetic: "/ˈdræstɪkli/", meaning: "in a way that is likely to have a strong or far-reaching effect" },
      { word: "mainstream", phonetic: "/ˈmeɪnstriːm/", meaning: "the ideas and attitudes regarded as normal or conventional" },
      { word: "notoriously", phonetic: "/nəʊˈtɔːriəsli/", meaning: "in a way that is famous or well known, typically for a bad quality" },
      { word: "stakes", phonetic: "/steɪks/", meaning: "the amount of risk involved; what is at risk" }
    ]
  },

  // ---- 15: NYT - Urban Design ----
  {
    source: "The New York Times",
    title: "The 15-Minute City Is No Longer a Utopian Dream",
    body: `<p>The concept is elegantly simple: in a "15-minute city," every resident can access work, shopping, education, healthcare, and leisure within a 15-minute walk or bike ride from home. Originally <span class="highlight" data-word="championed">championed</span> by urbanist Carlos Moreno, the idea has moved from academic circles to city halls around the world, <span class="highlight" data-word="propelled">propelled</span> by the pandemic-era realization that many people wanted to live locally.</p>
    <p>Paris has been the most <span class="highlight" data-word="aggressive">aggressive</span> adopter, with Mayor Anne Hidalgo <span class="highlight" data-word="embarking">embarking</span> on an ambitious plan to turn schoolyards into parks, pedestrianize major streets, and <span class="highlight" data-word="retrofit">retrofit</span> neighborhoods with mixed-use zoning. Melbourne, Barcelona, and Portland have unveiled their own versions, each tailored to local geography and culture.</p>
    <p>The <span class="highlight" data-word="pushback">pushback</span>, however, has been fierce in some quarters. Critics describe the concept as a <span class="highlight" data-word="cloaked">cloaked</span> form of social control, arguing that it <span class="highlight" data-word="confines">confines</span> residents to their neighborhoods and discourages the kind of serendipitous encounters that cities thrive on. But advocates insist the model is about expanding choice — giving people the option to live locally without forcing them to.</p>`,
    vocab: [
      { word: "championed", phonetic: "/ˈtʃæmpiənd/", meaning: "vigorously supported or defended a cause" },
      { word: "propelled", phonetic: "/prəˈpeld/", meaning: "driven or pushed forward" },
      { word: "aggressive", phonetic: "/əˈɡresɪv/", meaning: "pursuing one's aims with force and determination" },
      { word: "embarking", phonetic: "/ɪmˈbɑːkɪŋ/", meaning: "starting or beginning a course of action" },
      { word: "retrofit", phonetic: "/ˈretrəʊfɪt/", meaning: "to add new technology or features to an older system" },
      { word: "pushback", phonetic: "/ˈpʊʃbæk/", meaning: "resistance or opposition in response to a policy or idea" },
      { word: "cloaked", phonetic: "/kləʊkt/", meaning: "hidden or disguised" },
      { word: "confines", phonetic: "/kənˈfaɪnz/", meaning: "restricts or keeps within limits" }
    ]
  },

  // ---- 16: BBC - Cybersecurity ----
  {
    source: "BBC News",
    title: "Ransomware Attacks Have Become a Billion-Dollar Industry",
    body: `<p>Ransomware — malicious software that <span class="highlight" data-word="encrypts">encrypts</span> victims' data and demands payment for its release — has <span class="highlight" data-word="morphed">morphed</span> from a niche form of cybercrime into a <span class="highlight" data-word="sprawling">sprawling</span> global enterprise. Sophisticated criminal groups now operate with the efficiency of multinational corporations, complete with customer support hotlines, affiliate marketing programs, and even public relations teams to pressure victims into paying.</p>
    <p>The <span class="highlight" data-word="toll">toll</span> has been staggering. Hospitals have been forced to cancel surgeries, municipal governments have seen their systems paralyzed for weeks, and critical infrastructure — including fuel pipelines and water treatment plants — has been successfully targeted. Global losses from ransomware are <span class="highlight" data-word="projected">projected</span> to exceed $40 billion annually by 2027, up from roughly $8 billion in 2021.</p>
    <p>Governments are <span class="highlight" data-word="scrambling">scrambling</span> to respond. A coalition of more than 40 countries has pledged to share threat intelligence and coordinate sanctions against nations that provide <span class="highlight" data-word="safe havens">safe havens</span> to cybercriminals. But the attackers are <span class="highlight" data-word="notoriously">notoriously</span> agile, constantly developing new <span class="highlight" data-word="evasion">evasion</span> techniques as soon as defenders adapt. The <span class="highlight" data-word="cat-and-mouse game">cat-and-mouse game</span> shows no sign of ending.</p>`,
    vocab: [
      { word: "encrypts", phonetic: "/ɪnˈkrɪpts/", meaning: "converts information into a code to prevent unauthorized access" },
      { word: "morphed", phonetic: "/mɔːft/", meaning: "changed from one form to another, often gradually" },
      { word: "toll", phonetic: "/təʊl/", meaning: "the extent of loss or damage resulting from something" },
      { word: "scrambling", phonetic: "/ˈskræmblɪŋ/", meaning: "hurrying or moving quickly in a disorganized way" },
      { word: "safe havens", phonetic: "/seɪf ˈheɪvnz/", meaning: "places providing safety or refuge" },
      { word: "evasion", phonetic: "/ɪˈveɪʒn/", meaning: "the action of avoiding something, especially by cleverness or deceit" },
      { word: "cat-and-mouse game", phonetic: "/kæt ænd maʊs ɡeɪm/", meaning: "a prolonged contest of wits between pursuer and pursued" }
    ]
  },

  // ---- 17: The Atlantic - Social Media ----
  {
    source: "The Atlantic",
    title: "Are We Finally Ready to Log Off? The Slow Death of Social Media Addiction",
    body: `<p>A quiet <span class="highlight" data-word="reckoning">reckoning</span> is underway. After two decades of <span class="highlight" data-word="relentless">relentless</span> growth, social media platforms are facing something unprecedented: user fatigue. Screen-time data from multiple studies suggests that the <span class="highlight" data-word="inexorable">inexorable</span> rise in daily social media use that defined the 2010s has plateaued — and for certain demographics, especially teenagers, it is actually declining.</p>
    <p>The reasons are <span class="highlight" data-word="multifaceted">multifaceted</span>. Growing awareness of the mental-health effects of constant comparison and algorithmic content is one factor. So is the <span class="highlight" data-word="proliferation">proliferation</span> of platforms — the social internet has become so <span class="highlight" data-word="fragmented">fragmented</span> across TikTok, Instagram, X, and countless messaging apps that no single feed commands the attention it once did.</p>
    <p>Some argue this is less a <span class="highlight" data-word="decline">decline</span> than a <span class="highlight" data-word="metamorphosis">metamorphosis</span>. The era of broadcast social media, where everyone performed for a mass audience, is giving way to something more intimate — smaller group chats, private communities, and genuine connection over public performance. If that shift persists, it may represent the first <span class="highlight" data-word="meaningful">meaningful</span> change in how humans relate online since the invention of the News Feed.</p>`,
    vocab: [
      { word: "reckoning", phonetic: "/ˈrekənɪŋ/", meaning: "a moment of judgment or facing consequences" },
      { word: "relentless", phonetic: "/rɪˈlentləs/", meaning: "unremittingly intense; persistent and unyielding" },
      { word: "inexorable", phonetic: "/ɪnˈeksərəbl/", meaning: "impossible to stop or prevent" },
      { word: "multifaceted", phonetic: "/ˌmʌltiˈfæsɪtɪd/", meaning: "having many different aspects or features" },
      { word: "proliferation", phonetic: "/prəˌlɪfəˈreɪʃn/", meaning: "rapid increase in the number or amount of something" },
      { word: "fragmented", phonetic: "/fræɡˈmentɪd/", meaning: "broken into separate parts or pieces" },
      { word: "decline", phonetic: "/dɪˈklaɪn/", meaning: "a gradual and continuous loss of strength, numbers, or quality" },
      { word: "metamorphosis", phonetic: "/ˌmetəˈmɔːfəsɪs/", meaning: "a complete change of form, structure, or substance" }
    ]
  },

  // ---- 18: The Economist - Space Economy ----
  {
    source: "The Economist",
    title: "The Space Economy Is No Longer Just About Satellites",
    body: `<p>The commercial space industry, long <span class="highlight" data-word="dominated">dominated</span> by telecommunications satellites and government contracts, is <span class="highlight" data-word="undergoing">undergoing</span> a radical <span class="highlight" data-word="diversification">diversification</span>. Space manufacturing — producing materials in microgravity that cannot be made on Earth — is moving from concept to commercial reality. Space tourism, once a billionaire's fantasy, is now a service with a growing, albeit exclusive, customer base.</p>
    <p>The economics are shifting rapidly. Launch costs have fallen more than 90% in the past decade thanks to reusable rockets, and they continue to drop. This <span class="highlight" data-word="relentless">relentless</span> decline is opening up entirely new business models — from <span class="highlight" data-word="in-orbit servicing">in-orbit servicing</span> of satellites to pharmaceutical research that exploits the unique properties of weightlessness.</p>
    <p>Investors have taken notice. Venture capital flowing into space startups exceeded $15 billion last year, more than double the amount invested just three years earlier. But the sector remains <span class="highlight" data-word="volatile">volatile</span>, with high-profile <span class="highlight" data-word="bankruptcies">bankruptcies</span> serving as reminders that space is a domain where the <span class="highlight" data-word="margin for error">margin for error</span> is vanishingly small. For every SpaceX success story, there are companies whose ambitions <span class="highlight" data-word="outstripped">outstripped</span> their engineering or financial <span class="highlight" data-word="wherewithal">wherewithal</span>.</p>`,
    vocab: [
      { word: "dominated", phonetic: "/ˈdɒmɪneɪtɪd/", meaning: "controlled or had power over" },
      { word: "undergoing", phonetic: "/ˌʌndəˈɡəʊɪŋ/", meaning: "experiencing or being subjected to something" },
      { word: "diversification", phonetic: "/daɪˌvɜːsɪfɪˈkeɪʃn/", meaning: "the process of becoming more varied" },
      { word: "in-orbit servicing", phonetic: "/ɪn ˈɔːbɪt ˈsɜːvɪsɪŋ/", meaning: "repairing or refueling satellites while they remain in space" },
      { word: "volatile", phonetic: "/ˈvɒlətaɪl/", meaning: "liable to change rapidly and unpredictably" },
      { word: "bankruptcies", phonetic: "/ˈbæŋkrʌptsiz/", meaning: "legal declarations of inability to pay debts" },
      { word: "margin for error", phonetic: "/ˈmɑːdʒɪn fɔːr ˈerə/", meaning: "the amount by which you can be wrong and still succeed" },
      { word: "outstripped", phonetic: "/aʊtˈstrɪpt/", meaning: "exceeded or surpassed" },
      { word: "wherewithal", phonetic: "/ˈweəwɪðɔːl/", meaning: "the money or means required for a particular purpose" }
    ]
  },

  // ---- 19: The Guardian - Language Extinction ----
  {
    source: "The Guardian",
    title: "A Language Dies Every Two Weeks. Can AI Help Save Them?",
    body: `<p>Of the roughly 7,000 languages spoken in the world today, linguists estimate that at least half will be <span class="highlight" data-word="extinct">extinct</span> by the end of this century — a rate of <span class="highlight" data-word="attrition">attrition</span> that translates to one language disappearing roughly every two weeks. Each loss represents not just a mode of communication but an entire <span class="highlight" data-word="repository">repository</span> of cultural knowledge, ecological wisdom, and unique ways of understanding the world.</p>
    <p>For decades, the response to the crisis was largely <span class="highlight" data-word="analog">analog</span> — linguists with notebooks and tape recorders, painstakingly documenting <span class="highlight" data-word="dwindling">dwindling</span> communities of speakers. But the rise of large language models has opened up a <span class="highlight" data-word="contentious">contentious</span> new frontier. Could AI help <span class="highlight" data-word="revitalize">revitalize</span> endangered languages by building digital tools — translators, chatbots, educational apps — at a fraction of the time and cost of traditional methods?</p>
    <p>The idea is <span class="highlight" data-word="polarizing">polarizing</span>. Some indigenous communities embrace the technology as a <span class="highlight" data-word="lifeline">lifeline</span> for languages that have too few speakers to sustain traditional preservation. Others argue that an AI model trained on publicly available data cannot capture the <span class="highlight" data-word="nuances">nuances</span> of oral traditions, ceremonial speech, and deeply contextual meaning that are the essence of a living language.</p>`,
    vocab: [
      { word: "extinct", phonetic: "/ɪkˈstɪŋkt/", meaning: "no longer in existence" },
      { word: "attrition", phonetic: "/əˈtrɪʃn/", meaning: "the process of gradually reducing strength or effectiveness" },
      { word: "repository", phonetic: "/rɪˈpɒzɪtəri/", meaning: "a place where something is stored in large quantities" },
      { word: "analog", phonetic: "/ˈænəlɒɡ/", meaning: "relating to or using signals or information not in digital form" },
      { word: "dwindling", phonetic: "/ˈdwɪndlɪŋ/", meaning: "gradually diminishing in size, amount, or strength" },
      { word: "revitalize", phonetic: "/riːˈvaɪtəlaɪz/", meaning: "to give new life, energy, or vigor to something" },
      { word: "polarizing", phonetic: "/ˈpəʊləraɪzɪŋ/", meaning: "causing strong disagreement between opposing groups" },
      { word: "lifeline", phonetic: "/ˈlaɪflaɪn/", meaning: "a thing on which someone depends for survival" },
      { word: "nuances", phonetic: "/ˈnjuːɑːnsɪz/", meaning: "subtle differences in meaning, expression, or sound" }
    ]
  }
];

/* ============================================
   Daily Article Assignment Helper
   ============================================ */
// Returns index into ARTICLE_POOL for a given date string YYYY-MM-DD
// Cycles through the pool so each day gets a unique article
(function () {
  const BASE_DATE = new Date('2025-07-20');
  window.articleIndexForDate = function (dateStr) {
    const d = new Date(dateStr);
    const diffDays = Math.floor((d - BASE_DATE) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 0;
    return diffDays % ENGLISH_ARTICLE_POOL.length;
  };
})();
