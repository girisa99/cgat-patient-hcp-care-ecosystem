/**
 * REGIONAL LANDING CONFIG
 * 
 * Types, configs, and utilities for region-specific landing pages.
 * Covers 8 primary regions + P0/P1 expansion regions.
 * All regions include bilingual nativeSections for full transcreated rendering.
 */

// ── Types ──

export type RegionSlug =
  | 'nam' | 'europe' | 'mena' | 'india' | 'africa' | 'apac' | 'sea' | 'cjk' | 'latam' | 'caribbean'
  | 'oceania' | 'turkey'
  | 'pakistan' | 'bangladesh' | 'eastern_europe' | 'central_asia' | 'south_asia';

export interface RegionalShowcaseExample {
  title: string;
  input: string;
  pipeline: string;
  output: string;
  industry: string;
  icon?: string;
  languages?: string;
  impact?: string;
}

export interface NativeSections {
  /** Native version of "Your Audience Deserves Content That Feels Like Home" */
  ctaFooterHeadline: string;
  /** Native version of "From idea to global distribution..." */
  ctaFooterSubheadline: string;
  /** "Translation" label in native */
  comparisonTranslationLabel: string;
  /** "Transcreation" label in native */
  comparisonTranscreationLabel: string;
  /** Native literal translation example */
  comparisonTranslationExample: string;
  /** Native transcreated example */
  comparisonTranscreationExample: string;
  /** Stats labels in native */
  statsLanguagesLabel: string;
  statsDialectsLabel: string;
  statsRegionsLabel: string;
  statsSubRegionsLabel: string;
  /** "True Localization. Not Translation." in native */
  demoHubHeadline: string;
  demoHubSubheadline: string;
  /** "Schedule a Guided Demo" in native */
  scheduleDemoLabel: string;
  /** "Ready for {region}" in native */
  readyForRegion: string;
  /** Sign-in prompt in native */
  signInPrompt: string;
}

export interface RegionalConfig {
  hero: {
    flag: string;
    regionName: string;
    theme: string;
    englishHeadline: string;
    englishSubheadline: string;
    nativeHeadline: string;
    nativeSubheadline: string;
    isRTL?: boolean;
  };
  stats: {
    languages: string;
    dialects?: string;
    audienceReach: string;
    industries: string;
    pipelines: string;
    costSavings?: string;
    localMetric?: { value: string; label: string };
  };
  cta: {
    primary: string;
    secondary: string;
    badge?: string;
    freeCredits?: string;
    signIn?: string;
  };
  differentiators: {
    heroBadge: string;
    firstToMarket: string[];
    capabilityDepth: string[];
    onlyHere: string[];
  };
  languageShowcase: {
    tabLabel?: string;
    languages: { code: string; name: string; nativeName: string; flag: string; region?: string; azureVoice?: string; transcreation?: string; literal?: string; dialect?: string }[];
    demoPhrase: string;
    demoTranslations: Record<string, string>;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    hreflang: string;
    ogLocale: string;
  };
  welcomeScript: string;
  showcaseExamples: RegionalShowcaseExample[];
  comparisonSavings?: string;
  /** Native translations of all section content — bilingual rendering */
  nativeSections: NativeSections;
}

// ── Primary Region Configs ──

const namConfig: RegionalConfig = {
  hero: {
    flag: '🇺🇸',
    regionName: 'North America',
    theme: 'Enterprise Innovation',
    englishHeadline: 'Your Ideas Deserve to Be Seen — Everywhere',
    englishSubheadline: '19 AI providers. 206 pipelines. From mind to media in minutes — not months.',
    nativeHeadline: 'From Concept to Content. Instantly.',
    nativeSubheadline: 'The production suite that moves as fast as your ambition',
  },
  stats: { languages: '140+', dialects: '30+', audienceReach: '400M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Creating Free', secondary: 'See It In Action', badge: 'No credit card. No catch. Just create.' },
  differentiators: {
    heroBadge: 'The Studio That Never Sleeps',
    firstToMarket: ['19 AI providers working in concert — not chaos', 'Real-time transcreation that feels local everywhere', 'One prompt → published across every channel'],
    capabilityDepth: ['206 production pipelines at your fingertips', '3D, avatars, and video — unified, not duct-taped', 'AI models routed by region for authentic output'],
    onlyHere: ['We don\'t translate — we transcreate with cultural soul', 'From a single idea to published media across 140+ languages'],
  },
  languageShowcase: {
    languages: [
      { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'es-MX', name: 'Spanish', nativeName: 'Español', flag: '🇲🇽', transcreation: 'Crea contenido que conecta — en minutos', literal: 'Crea contenido impresionante en minutos' },
      { code: 'fr-CA', name: 'French', nativeName: 'Français', flag: '🇨🇦', transcreation: 'Du concept au contenu — instantanément', literal: 'Créez du contenu impressionnant en minutes' },
    ],
    demoPhrase: 'Your story deserves to be heard in every language',
    demoTranslations: { 'es-MX': 'Tu historia merece ser escuchada en cada idioma', 'fr-CA': 'Votre histoire mérite d\'être entendue dans chaque langue' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | North America',
    description: 'The all-in-one AI content production suite. 19 providers, 206 pipelines, 140+ languages. From mind to media.',
    keywords: ['AI content', 'video production', 'transcreation', 'enterprise AI', 'content automation'],
    hreflang: 'en-US',
    ogLocale: 'en_US',
  },
  welcomeScript: 'You have the ideas. We have the studio. Welcome to Genie Suite — where one prompt becomes published content across 140+ languages.',
  showcaseExamples: [
    { title: 'Product Launch That Lands', input: 'Product brief + brand guidelines', pipeline: 'Script → Voice → Video → 3D', output: '4K product video in 22 languages — culturally resonant, not just translated', industry: 'Technology' },
    { title: 'Patient Education That Connects', input: 'Clinical protocol', pipeline: 'Simplify → Narrate → Animate', output: 'Guides patients actually understand — in their language, their tone', industry: 'Healthcare' },
  ],
  nativeSections: {
    ctaFooterHeadline: 'Your Audience Deserves Content That Feels Like Home.',
    ctaFooterSubheadline: 'From idea to global distribution — every format, every market, every language.',
    comparisonTranslationLabel: 'Translation',
    comparisonTranscreationLabel: 'Transcreation',
    comparisonTranslationExample: '"Our product helps you save time and money."',
    comparisonTranscreationExample: '"Because your time is worth more than any investment."',
    statsLanguagesLabel: 'Languages',
    statsDialectsLabel: 'Dialects',
    statsRegionsLabel: 'Regions',
    statsSubRegionsLabel: 'Sub-Regions',
    demoHubHeadline: 'True Localization. Not Translation.',
    demoHubSubheadline: 'We adapt meaning, culture, and context — this is transcreation.',
    scheduleDemoLabel: 'Schedule a Guided Demo',
    readyForRegion: 'Ready for North America',
    signInPrompt: 'Already have an account? Sign in',
  },
};

const europeConfig: RegionalConfig = {
  hero: {
    flag: '🇪🇺',
    regionName: 'Europe',
    theme: 'Multilingual Excellence',
    englishHeadline: 'One Voice. Twenty-Four Languages. Zero Compromise.',
    englishSubheadline: 'GDPR-native. Culturally precise. Built for European ambition.',
    nativeHeadline: 'Eine Stimme. Vierundzwanzig Sprachen. Ohne Kompromisse.',
    nativeSubheadline: 'KI-Inhalte, die europäische Vielfalt respektieren',
  },
  stats: { languages: '40+', dialects: '50+', audienceReach: '450M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Jetzt starten', secondary: 'Demo ansehen', badge: 'DSGVO-konform. Immer.' },
  differentiators: {
    heroBadge: 'Europe\'s Multilingual Content Engine',
    firstToMarket: ['24 languages, produced simultaneously — not sequentially', 'EU data sovereignty is architecture, not afterthought', 'GDPR isn\'t a checkbox — it\'s our foundation'],
    capabilityDepth: ['50+ European dialects — Bavarian to Catalan to Flemish', 'Cultural context that knows Zürich ≠ Vienna ≠ Berlin', 'Regulatory compliance woven into every pipeline'],
    onlyHere: ['True European transcreation — not American English with a flag swap', 'Zone-routed processing keeps your data where it belongs'],
  },
  languageShowcase: {
    languages: [
      { code: 'en-GB', name: 'English', nativeName: 'English', flag: '🇬🇧' },
      { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', transcreation: 'Inhalte, die ankommen — in jeder Sprache', literal: 'Erstellen Sie beeindruckende Inhalte in Minuten' },
      { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', transcreation: 'Du contenu qui résonne — dans chaque langue', literal: 'Créez du contenu impressionnant en minutes' },
      { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', transcreation: 'Contenido que conecta — en cada idioma', literal: 'Crea contenido impresionante en minutos' },
    ],
    demoPhrase: 'Content that resonates — in every European language',
    demoTranslations: { 'de-DE': 'Inhalte, die ankommen — in jeder europäischen Sprache', 'fr-FR': 'Du contenu qui résonne — dans chaque langue européenne' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Europe',
    description: 'Multilingual AI content production for European markets. 40+ languages, GDPR compliant, culturally transcreated.',
    keywords: ['AI content Europe', 'multilingual production', 'GDPR AI', 'European transcreation'],
    hreflang: 'en-GB',
    ogLocale: 'en_GB',
  },
  welcomeScript: 'Europe speaks in many voices. Genie Suite speaks them all — with the cultural nuance that turns content into connection.',
  showcaseExamples: [
    { title: 'Pan-European Campaign', input: 'Brand campaign brief', pipeline: 'Transcreate → Localize → Distribute', output: 'Campaign that feels local in all 24 EU languages — not one-size-fits-all', industry: 'Marketing' },
    { title: 'Compliance Training', input: 'Regulatory framework', pipeline: 'Script → Voice → Video', output: 'Training that respects local regulations AND local culture', industry: 'Finance' },
  ],
  nativeSections: {
    ctaFooterHeadline: 'Ihr Publikum verdient Inhalte, die sich wie Zuhause anfühlen.',
    ctaFooterSubheadline: 'Von der Idee zur globalen Verbreitung — jedes Format, jeder Markt, jede Sprache.',
    comparisonTranslationLabel: 'Übersetzung',
    comparisonTranscreationLabel: 'Transkreation',
    comparisonTranslationExample: '„Unser Produkt hilft Ihnen, Zeit und Geld zu sparen."',
    comparisonTranscreationExample: '„Weil Ihre Zeit wertvoller ist als jede Investition."',
    statsLanguagesLabel: 'Sprachen',
    statsDialectsLabel: 'Dialekte',
    statsRegionsLabel: 'Regionen',
    statsSubRegionsLabel: 'Subregionen',
    demoHubHeadline: 'Echte Lokalisierung. Keine Übersetzung.',
    demoHubSubheadline: 'Wir passen Bedeutung, Kultur und Kontext an — das ist Transkreation.',
    scheduleDemoLabel: 'Geführte Demo vereinbaren',
    readyForRegion: 'Bereit für Europa',
    signInPrompt: 'Bereits ein Konto? Anmelden',
  },
};

const menaConfig: RegionalConfig = {
  hero: {
    flag: '🇸🇦',
    regionName: 'MENA',
    theme: 'Arabic-First Intelligence',
    englishHeadline: 'Your Arabic Deserves Better Than Translation',
    englishSubheadline: '7 dialects. RTL-native. Content that speaks from the heart — in your dialect.',
    nativeHeadline: 'محتواك العربي يستحق أكثر من مجرد ترجمة',
    nativeSubheadline: 'سبع لهجات. محتوى ينبض بروح ثقافتك',
    isRTL: true,
  },
  stats: { languages: '15+', dialects: '7', audienceReach: '400M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'ابدأ مجاناً الآن', secondary: 'شاهد السحر', badge: 'محتوى عربي أصيل — ليس ترجمة حرفية' },
  differentiators: {
    heroBadge: 'أول منصة محتوى عربية بالذكاء الاصطناعي',
    firstToMarket: ['7 Arabic dialects — Gulf, Levantine, Egyptian, Maghrebi, Iraqi, Yemeni, MSA', 'RTL isn\'t a patch — it\'s how we\'re built', 'Islamic calendar, cultural context, and Quranic sensitivity — native'],
    capabilityDepth: ['Switch between MSA and dialect mid-script — naturally', 'Arabic calligraphy AI that honors the art form', 'Content that knows Ramadan ≠ just a month — it\'s a moment'],
    onlyHere: ['True Arabic transcreation — محتوى ينبض بالحياة', 'From Gulf prestige to Egyptian warmth — every dialect, every tone'],
  },
  languageShowcase: {
    languages: [
      { code: 'ar-SA', name: 'Arabic (Saudi)', nativeName: 'العربية السعودية', flag: '🇸🇦', dialect: 'Khaleeji', transcreation: 'محتوى يليق بطموحك', literal: 'أنشئ محتوى مذهلاً في دقائق' },
      { code: 'ar-AE', name: 'Arabic (UAE)', nativeName: 'العربية الإماراتية', flag: '🇦🇪', dialect: 'Gulf' },
      { code: 'ar-EG', name: 'Arabic (Egypt)', nativeName: 'مصري', flag: '🇪🇬', dialect: 'Egyptian', transcreation: 'محتوى يوصل — من القلب للقلب', literal: 'أنشئ محتوى مذهلاً في دقائق' },
    ],
    demoPhrase: 'Content that speaks your dialect — not just your language',
    demoTranslations: { 'ar-SA': 'محتوى يتكلم لهجتك — مش بس لغتك' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | MENA',
    description: 'Arabic-first AI content production. 7 dialects, RTL-native, culturally transcreated — not translated.',
    keywords: ['Arabic AI', 'MENA content', 'RTL production', 'Arabic transcreation', 'Khaleeji content'],
    hreflang: 'ar',
    ogLocale: 'ar_SA',
  },
  welcomeScript: 'مرحباً بك في جيني سويت — أول منصة محتوى تفهم لهجتك وثقافتك وروحك العربية. محتوى من القلب، لكل قلب.',
  showcaseExamples: [
    { title: 'Ramadan Campaign', input: 'Brand brief + cultural calendar', pipeline: 'Transcreate → Voice → Video', output: 'Ramadan content in 7 dialects — Gulf prestige, Egyptian warmth, Levantine elegance', industry: 'Marketing' },
  ],
  nativeSections: {
    ctaFooterHeadline: 'جمهورك يستحق محتوى يحس إنه من عندهم.',
    ctaFooterSubheadline: 'من الفكرة للنشر العالمي — كل صيغة، كل سوق، كل لغة.',
    comparisonTranslationLabel: 'ترجمة',
    comparisonTranscreationLabel: 'إبداع ثقافي',
    comparisonTranslationExample: '"منتجنا يساعدك في توفير الوقت والمال."',
    comparisonTranscreationExample: '"لأن وقتك أغلى من أي استثمار"',
    statsLanguagesLabel: 'لغات',
    statsDialectsLabel: 'لهجات',
    statsRegionsLabel: 'مناطق',
    statsSubRegionsLabel: 'مناطق فرعية',
    demoHubHeadline: 'توطين حقيقي. مش ترجمة.',
    demoHubSubheadline: 'نحن نكيّف المعنى والثقافة والسياق — هذا هو الإبداع الثقافي.',
    scheduleDemoLabel: 'احجز عرض توضيحي',
    readyForRegion: 'جاهز للشرق الأوسط',
    signInPrompt: 'عندك حساب؟ سجّل دخولك',
  },
};

const indiaConfig: RegionalConfig = {
  hero: {
    flag: '🇮🇳',
    regionName: 'India',
    theme: 'Bharatiya AI',
    englishHeadline: '1.4 Billion Stories. One Platform to Tell Them All.',
    englishSubheadline: '22 भाषाएं. Every script. Every accent. Every emotion — authentically Indian.',
    nativeHeadline: 'हर भाषा में आपकी कहानी — दिल से',
    nativeSubheadline: '22 भारतीय भाषाओं में सच्चा सृजन — अनुवाद नहीं, अनुभव',
  },
  stats: { languages: '22+', dialects: '50+', audienceReach: '1.4B+', industries: '50+', pipelines: '206' },
  cta: { primary: 'अभी शुरू करें — मुफ़्त', secondary: 'डेमो देखें', badge: 'UPI से भुगतान। भारत के लिए बना।' },
  differentiators: {
    heroBadge: 'भारत का सबसे पूरा AI सृजन मंच',
    firstToMarket: ['22 Indian languages — not afterthoughts, but first-class citizens', 'Devanagari, Tamil, Telugu, Bangla scripts — pixel-perfect', 'Voices that sound like home — not dubbed foreigners'],
    capabilityDepth: ['Festival-aware content calendar — Diwali, Pongal, Onam, Eid, Bihu', 'Bollywood-grade video AI for that cinematic feel', 'Code-switching support — Hinglish, Tanglish, and everything in between'],
    onlyHere: ['True Indic transcreation — content that feels like it was born in your language', 'From Kashmiri warmth to Tamilian precision — every region, every soul'],
  },
  languageShowcase: {
    languages: [
      { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳', transcreation: 'मिनटों में ऐसा कंटेंट जो दिल छू ले', literal: 'मिनटों में शानदार सामग्री बनाएं' },
      { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', transcreation: 'நிமிடங்களில் இதயத்தைத் தொடும் உள்ளடக்கம்', literal: 'நிமிடங்களில் அற்புதமான உள்ளடக்கத்தை உருவாக்குங்கள்' },
      { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
      { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    ],
    demoPhrase: 'Your language is not just words — it\'s your identity',
    demoTranslations: { 'hi-IN': 'आपकी भाषा सिर्फ़ शब्द नहीं — आपकी पहचान है' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | India',
    description: 'AI content production for India. 22 languages, Indic scripts, cultural transcreation — content that feels Indian.',
    keywords: ['Indian AI', 'Hindi content', 'Indic transcreation', 'Bharatiya AI', 'Indian languages'],
    hreflang: 'en-IN',
    ogLocale: 'en_IN',
  },
  welcomeScript: 'नमस्ते! जिनी सूट में आपका स्वागत है। 22 भारतीय भाषाओं में ऐसा कंटेंट बनाइए जो दिल से निकले और दिल तक पहुँचे।',
  showcaseExamples: [
    { title: 'Diwali Campaign', input: 'Brand brief + festival calendar', pipeline: 'Transcreate → Voice → Animate', output: 'Diwali content that feels like family — in 12 Indic languages', industry: 'Marketing' },
  ],
  nativeSections: {
    ctaFooterHeadline: 'आपके दर्शक ऐसा कंटेंट चाहते हैं जो अपना लगे।',
    ctaFooterSubheadline: 'विचार से वैश्विक वितरण तक — हर प्रारूप, हर बाज़ार, हर भाषा।',
    comparisonTranslationLabel: 'अनुवाद',
    comparisonTranscreationLabel: 'सृजनात्मक रूपांतरण',
    comparisonTranslationExample: '"हमारा उत्पाद आपका समय और पैसा बचाने में मदद करता है।"',
    comparisonTranscreationExample: '"क्योंकि आपका वक़्त किसी भी निवेश से ज़्यादा कीमती है"',
    statsLanguagesLabel: 'भाषाएं',
    statsDialectsLabel: 'बोलियाँ',
    statsRegionsLabel: 'क्षेत्र',
    statsSubRegionsLabel: 'उप-क्षेत्र',
    demoHubHeadline: 'सच्चा स्थानीयकरण। अनुवाद नहीं।',
    demoHubSubheadline: 'हम अर्थ, संस्कृति और संदर्भ को ढालते हैं — यही है सृजनात्मक रूपांतरण।',
    scheduleDemoLabel: 'गाइडेड डेमो शेड्यूल करें',
    readyForRegion: 'भारत के लिए तैयार',
    signInPrompt: 'पहले से अकाउंट है? साइन इन करें',
  },
};

const africaConfig: RegionalConfig = {
  hero: {
    flag: '🌍',
    regionName: 'Africa',
    theme: 'Pan-African Voice',
    englishHeadline: 'Africa\'s Stories. Africa\'s Voices. Africa\'s Platform.',
    englishSubheadline: '54 nations. 30+ languages. Mobile-first. Built for the continent that\'s building the future.',
    nativeHeadline: 'Sauti za Afrika — Jukwaa Letu',
    nativeSubheadline: 'Maudhui yanayowasiliana na moyo wa Afrika',
  },
  stats: { languages: '30+', dialects: '100+', audienceReach: '1.4B+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free — Mobile Ready', secondary: 'See Africa\'s Stories', badge: 'Works on 2G. Designed for Africa.' },
  differentiators: {
    heroBadge: 'Africa\'s Own AI Content Engine',
    firstToMarket: ['African languages as first-class — Swahili, Amharic, Yoruba, Zulu, Hausa', 'Low-bandwidth optimized — 2G/3G ready, no compromise', 'Mobile-first because Africa is mobile-first'],
    capabilityDepth: ['Nollywood-grade video AI', 'Afrobeats-aware content generation', 'M-Pesa and mobile payment flows built in'],
    onlyHere: ['African cultural transcreation — not Western content with African faces', 'Content that understands ubuntu, harambee, and the spirit of community'],
  },
  languageShowcase: {
    languages: [
      { code: 'en-KE', name: 'English', nativeName: 'English', flag: '🇰🇪' },
      { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', transcreation: 'Tengeneza maudhui yanayogusa moyo — kwa dakika', literal: 'Unda maudhui ya kushangaza kwa dakika' },
      { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇸🇳' },
    ],
    demoPhrase: 'Your story. Your language. Your continent.',
    demoTranslations: { 'sw-KE': 'Hadithi yako. Lugha yako. Bara lako.' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Africa',
    description: 'AI content production for Africa. 30+ languages, mobile-first, low-bandwidth, culturally authentic.',
    keywords: ['African AI', 'Swahili content', 'Pan-African production', 'Nollywood AI', 'mobile-first content'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Karibu! Welcome to Genie Suite for Africa. Your stories deserve to be told in your languages — with the soul of your culture.',
  showcaseExamples: [
    { title: 'Health Campaign That Saves Lives', input: 'Public health brief', pipeline: 'Simplify → Voice → Distribute', output: 'Health content in 10 African languages — reaching villages, not just cities', industry: 'Healthcare' },
  ],
  nativeSections: {
    ctaFooterHeadline: 'Watazamaji wako wanastahili maudhui yanayohisi kama nyumbani.',
    ctaFooterSubheadline: 'Kutoka wazo hadi usambazaji wa kimataifa — kila muundo, kila soko, kila lugha.',
    comparisonTranslationLabel: 'Tafsiri',
    comparisonTranscreationLabel: 'Ubunifu wa Kitamaduni',
    comparisonTranslationExample: '"Bidhaa yetu inakusaidia kuokoa muda na pesa."',
    comparisonTranscreationExample: '"Kwa sababu muda wako una thamani zaidi ya uwekezaji wowote"',
    statsLanguagesLabel: 'Lugha',
    statsDialectsLabel: 'Lahaja',
    statsRegionsLabel: 'Mikoa',
    statsSubRegionsLabel: 'Mikoa Ndogo',
    demoHubHeadline: 'Ujanibishaji wa Kweli. Si Tafsiri.',
    demoHubSubheadline: 'Tunabadilisha maana, utamaduni na muktadha — hii ndio ubunifu wa kitamaduni.',
    scheduleDemoLabel: 'Panga Onyesho la Mwongozo',
    readyForRegion: 'Tayari kwa Afrika',
    signInPrompt: 'Una akaunti tayari? Ingia',
  },
};

const seaConfig: RegionalConfig = {
  hero: {
    flag: '🌏',
    regionName: 'Southeast Asia',
    theme: 'SEA Digital',
    englishHeadline: '700 Million People. Five Cultures. One Platform That Gets It.',
    englishSubheadline: 'Malay ≠ Indonesian. Taglish ≠ Tagalog. We know the difference — and so does your content.',
    nativeHeadline: 'Konten yang Mengerti Asia Tenggara',
    nativeSubheadline: 'Dari Jakarta ke Manila — konten yang terasa lokal',
  },
  stats: { languages: '12+', dialects: '20+', audienceReach: '700M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Mulai Gratis', secondary: 'Lihat Demo', badge: 'Shopee-ready. Grab-ready. SEA-ready.' },
  differentiators: {
    heroBadge: 'SEA\'s AI Content Powerhouse',
    firstToMarket: ['Malay vs Indonesian distinction — competitors treat them as one', 'Taglish code-switching for Philippines — not forced formal Filipino', 'Singlish/SEA English accent — not US/UK defaults'],
    capabilityDepth: ['Thai tonal accuracy in voice synthesis', 'Vietnamese diacritics — pixel-perfect', 'Social commerce content for Shopee, Lazada, TikTok Shop'],
    onlyHere: ['True SEA transcreation — content that understands gotong royong and bayanihan', 'From Thai sabai-sabai to Vietnamese hustle — every market, every mood'],
  },
  languageShowcase: {
    languages: [
      { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', transcreation: 'Cipta kandungan yang menyentuh hati — dalam minit', literal: 'Cipta kandungan menakjubkan dalam minit' },
      { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', transcreation: 'สร้างคอนเทนต์ที่เข้าถึงหัวใจ — ในไม่กี่นาที', literal: 'สร้างเนื้อหาที่น่าทึ่งในไม่กี่นาที' },
      { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', transcreation: 'Tạo nội dung chạm đến trái tim — trong vài phút', literal: 'Tạo nội dung ấn tượng trong vài phút' },
      { code: 'tl-PH', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', transcreation: 'Gumawa ng content na dumadating sa puso — sa ilang minuto lang', literal: 'Gumawa ng kahanga-hangang content sa ilang minuto' },
    ],
    demoPhrase: 'Content that speaks your market\'s language — literally and culturally',
    demoTranslations: { 'th-TH': 'คอนเทนต์ที่พูดภาษาตลาดของคุณ — ทั้งตัวอักษรและวัฒนธรรม', 'vi-VN': 'Nội dung nói đúng ngôn ngữ thị trường của bạn — cả nghĩa đen và văn hóa' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Southeast Asia',
    description: 'AI content production for SEA. Malay, Thai, Vietnamese, Filipino — transcreated, not translated.',
    keywords: ['SEA AI', 'Thai content', 'Vietnamese AI', 'Filipino production', 'Indonesia transcreation', 'Shopee content'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Selamat datang! Welcome to Genie Suite for Southeast Asia. Content that doesn\'t just speak your language — it feels like home.',
  showcaseExamples: [
    { title: 'Shopee Mega Campaign', input: 'Product catalog + local trends', pipeline: 'Transcreate → Voice → Video → Social', output: 'Campaigns that go viral in 5 SEA markets — each with local flavor', industry: 'E-Commerce' },
  ],
  nativeSections: {
    ctaFooterHeadline: 'Audiens Anda layak mendapat konten yang terasa seperti rumah.',
    ctaFooterSubheadline: 'Dari ide hingga distribusi global — setiap format, setiap pasar, setiap bahasa.',
    comparisonTranslationLabel: 'Terjemahan',
    comparisonTranscreationLabel: 'Transkreasi',
    comparisonTranslationExample: '"Produk kami membantu Anda menghemat waktu dan uang."',
    comparisonTranscreationExample: '"Karena waktu Anda lebih berharga dari investasi apa pun"',
    statsLanguagesLabel: 'Bahasa',
    statsDialectsLabel: 'Dialek',
    statsRegionsLabel: 'Wilayah',
    statsSubRegionsLabel: 'Sub-Wilayah',
    demoHubHeadline: 'Lokalisasi Sejati. Bukan Terjemahan.',
    demoHubSubheadline: 'Kami mengadaptasi makna, budaya, dan konteks — inilah transkreasi.',
    scheduleDemoLabel: 'Jadwalkan Demo Terpandu',
    readyForRegion: 'Siap untuk Asia Tenggara',
    signInPrompt: 'Sudah punya akun? Masuk',
  },
};

const cjkConfig: RegionalConfig = {
  hero: {
    flag: '🌏',
    regionName: 'China, Japan & Korea',
    theme: 'CJK Intelligence',
    englishHeadline: 'Character-Perfect. Culturally Precise. Unmistakably CJK.',
    englishSubheadline: '1.6 billion people who know when content gets their culture wrong. We don\'t.',
    nativeHeadline: '文字の美しさを、AIの力で',
    nativeSubheadline: '日本語の敬語、中国語の簡体・繁体、韓国語の敬称 — すべて完璧に',
  },
  stats: { languages: '8+', dialects: '15+', audienceReach: '1.6B+', industries: '50+', pipelines: '206' },
  cta: { primary: '無料で始める', secondary: 'デモを見る', badge: 'CJK文字 — 一画も妥協しない' },
  differentiators: {
    heroBadge: 'CJK Content Perfection',
    firstToMarket: ['Character-perfect rendering — every stroke matters', 'Anime, manga, K-drama aesthetic AI', 'K-beauty, guochao, kawaii — culturally native styles'],
    capabilityDepth: ['Simplified ↔ Traditional Chinese conversion with context', 'Japanese keigo levels — casual to hyper-formal', 'Korean 존댓말 honorific system — pixel-perfect social hierarchy'],
    onlyHere: ['True CJK transcreation — 翻訳ではなく、文化を伝える', 'Content that understands 面子, おもてなし, and 정 — not just words'],
  },
  languageShowcase: {
    languages: [
      { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', transcreation: '几分钟内，创造触动人心的内容', literal: '几分钟内创建精彩内容' },
      { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', transcreation: '心に響くコンテンツを、数分で', literal: '数分で素晴らしいコンテンツを作成' },
      { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', transcreation: '마음을 울리는 콘텐츠를 몇 분 만에', literal: '몇 분 만에 멋진 콘텐츠를 만들어 보세요' },
      { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
    ],
    demoPhrase: 'Content that honors your characters — and your culture',
    demoTranslations: { 'ja-JP': 'あなたの文字と文化を大切にするコンテンツ', 'zh-CN': '尊重你的文字和文化的内容', 'ko-KR': '당신의 문자와 문화를 존중하는 콘텐츠' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | CJK',
    description: 'AI content for China, Japan & Korea. Character-perfect CJK, cultural transcreation, anime/K-drama aesthetics.',
    keywords: ['CJK AI', 'Japanese content', 'Chinese AI', 'Korean production', 'CJK transcreation', 'anime AI'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'ようこそ！Genie Suite へ。日本語の美しさ、中国語の深み、韓国語の繊細さ — すべてを尊重するAIコンテンツプラットフォームです。',
  showcaseExamples: [
    { title: 'Anime-Style Brand Campaign', input: 'Product brief + anime aesthetic', pipeline: 'Illustrate → Animate → Voice', output: 'Anime ads that feel native to otaku culture — not Western imports', industry: 'Entertainment' },
  ],
  nativeSections: {
    ctaFooterHeadline: 'あなたの視聴者は、自分の国のように感じるコンテンツを求めています。',
    ctaFooterSubheadline: 'アイデアからグローバル配信まで — あらゆるフォーマット、あらゆる市場、あらゆる言語。',
    comparisonTranslationLabel: '翻訳',
    comparisonTranscreationLabel: 'トランスクリエーション',
    comparisonTranslationExample: '「当社の製品は時間とお金の節約に役立ちます。」',
    comparisonTranscreationExample: '「あなたの時間は、どんな投資よりも価値がある」',
    statsLanguagesLabel: '言語',
    statsDialectsLabel: '方言',
    statsRegionsLabel: '地域',
    statsSubRegionsLabel: 'サブ地域',
    demoHubHeadline: '真のローカライゼーション。翻訳ではなく。',
    demoHubSubheadline: '意味、文化、コンテキストを適応させます — これがトランスクリエーションです。',
    scheduleDemoLabel: 'ガイド付きデモを予約',
    readyForRegion: 'CJKの準備完了',
    signInPrompt: 'アカウントをお持ちですか？サインイン',
  },
};

const apacConfig: RegionalConfig = {
  hero: {
    flag: '🌏',
    regionName: 'Asia Pacific',
    theme: 'CJK + SEA Intelligence',
    englishHeadline: 'AI Content Production Suite — Asia Pacific',
    englishSubheadline: 'CJK mastery. Southeast Asian reach. Pacific coverage.',
    nativeHeadline: 'AIコンテンツ制作スイート',
    nativeSubheadline: 'アジア太平洋地域向けAIコンテンツ',
  },
  stats: { languages: '25+', dialects: '40+', audienceReach: '4B+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'CJK-optimized' },
  differentiators: {
    heroBadge: 'APAC\'s AI Content Powerhouse',
    firstToMarket: ['CJK character-perfect rendering', 'SEA language coverage', 'Anime/Manga style AI'],
    capabilityDepth: ['Japanese, Chinese, Korean mastery', 'Thai, Vietnamese, Indonesian TTS', 'K-beauty, J-pop content styles'],
    onlyHere: ['True CJK transcreation', 'APAC cultural intelligence'],
  },
  languageShowcase: {
    languages: [
      { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
      { code: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
      { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'ja-JP': '数分で素晴らしいコンテンツを作成', 'zh-CN': '几分钟内创建精彩内容' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Asia Pacific',
    description: 'AI content production for APAC. CJK mastery, SEA coverage, 25+ languages.',
    keywords: ['APAC AI', 'Japanese content', 'Chinese AI', 'Korean production', 'SEA transcreation'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Welcome to Genie Suite for Asia Pacific. Master CJK content with character-perfect rendering across 25+ languages.',
  showcaseExamples: [
    { title: 'Anime Marketing', input: 'Product brief + anime style', pipeline: 'Illustrate > Animate > Voice', output: 'Anime-style ads in CJK + SEA', industry: 'Entertainment' },
  ],
  nativeSections: {
    ctaFooterHeadline: 'あなたの視聴者は、自分の国のように感じるコンテンツを求めています。',
    ctaFooterSubheadline: 'アイデアからグローバル配信まで — あらゆるフォーマット、あらゆる市場。',
    comparisonTranslationLabel: '翻訳',
    comparisonTranscreationLabel: 'トランスクリエーション',
    comparisonTranslationExample: '「当社の製品は時間とお金の節約に役立ちます。」',
    comparisonTranscreationExample: '「あなたの時間は、どんな投資よりも価値がある」',
    statsLanguagesLabel: '言語',
    statsDialectsLabel: '方言',
    statsRegionsLabel: '地域',
    statsSubRegionsLabel: 'サブ地域',
    demoHubHeadline: '真のローカライゼーション。翻訳ではなく。',
    demoHubSubheadline: '意味、文化、コンテキストを適応させる — トランスクリエーション。',
    scheduleDemoLabel: 'ガイド付きデモを予約',
    readyForRegion: 'アジア太平洋の準備完了',
    signInPrompt: 'アカウントをお持ちですか？サインイン',
  },
};

const southAsiaConfig: RegionalConfig = {
  hero: { flag: '🌏', regionName: 'South Asia', theme: 'Himalayan Heart', englishHeadline: 'From the Himalayas to the Indian Ocean — Your Languages, Your Way.', englishSubheadline: 'Nepali, Sinhala, Dzongkha, Dhivehi — languages the world overlooks, but we celebrate.', nativeHeadline: 'नेपाली, සිංහල, རྫོང་ཁ — तपाईंको भाषा, तपाईंको आवाज', nativeSubheadline: 'हिमालदेखि समुद्रसम्म — हरेक भाषामा सृजना' },
  stats: { languages: '8+', dialects: '15+', audienceReach: '200M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'सुरु गर्नुहोस् — निःशुल्क', secondary: 'डेमो हेर्नुहोस्', badge: 'Built for languages the world forgot — but we didn\'t.' },
  differentiators: { heroBadge: 'South Asia\'s Overlooked Voices — Amplified', firstToMarket: ['Nepali AI that writes like a Nepali — not a Hindi speaker guessing', 'Sinhala & Tamil dual-script for Sri Lanka — both communities, one platform', 'Dzongkha support — Bhutan\'s language, respected and rendered'], capabilityDepth: ['Dashain, Vesak, Tshechu festival-aware content calendar', 'Tourism content for Maldives luxury + Nepal trekking + Sri Lanka heritage', 'Low-bandwidth optimization for rural Nepal and Sri Lanka'], onlyHere: ['True South Asian transcreation — not Indian content repackaged', 'From Himalayan resilience to island serenity — every culture, every tone'] },
  languageShowcase: { languages: [ { code: 'ne-NP', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', transcreation: 'मिनेटमा हृदयलाई छुने सामग्री', literal: 'मिनेटमा अचम्मको सामग्री बनाउनुहोस्' }, { code: 'si-LK', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰', transcreation: 'මිනිත්තු කිහිපයකින් හදවතට දැනෙන අන්තර්ගතය', literal: 'මිනිත්තු කිහිපයකින් විශිෂ්ට අන්තර්ගතය සාදන්න' }, { code: 'ta-LK', name: 'Tamil (Sri Lanka)', nativeName: 'தமிழ்', flag: '🇱🇰' }, { code: 'dz-BT', name: 'Dzongkha', nativeName: 'རྫོང་ཁ', flag: '🇧🇹' } ], demoPhrase: 'Your language was never small — the world just wasn\'t listening', demoTranslations: { 'ne-NP': 'तपाईंको भाषा कहिल्यै सानो थिएन — संसारले सुनिरहेको थिएन' } },
  seo: { title: 'Genie Suite - AI Content Production | South Asia', description: 'AI content for Nepal, Sri Lanka, Bhutan & Maldives. Nepali, Sinhala, Dzongkha, Dhivehi — transcreated with cultural soul.', keywords: ['South Asia AI', 'Nepali content', 'Sinhala AI', 'Dzongkha', 'Maldives AI', 'South Asian transcreation'], hreflang: 'en', ogLocale: 'en_US' },
  welcomeScript: 'नमस्ते! आयुबोवන්! Genie Suite मा स्वागत छ। तपाईंको भाषा — तपाईंको कथा — संसारसँग साझा गर्नुहोस्।',
  showcaseExamples: [ { title: 'Nepal Trekking Campaign', input: 'Tourism brief + cultural calendar', pipeline: 'Transcreate → Voice → Video', output: 'Trekking content in Nepali that sells the experience, not just the mountain', industry: 'Tourism' }, { title: 'Sri Lanka Heritage Content', input: 'Heritage site brief', pipeline: 'Script → Voice → Animate', output: 'Dual Sinhala-Tamil content that unites — culturally resonant for both communities', industry: 'Tourism' } ],
  nativeSections: {
    ctaFooterHeadline: 'तपाईंको दर्शकले घर जस्तो लाग्ने सामग्री पाउनुपर्छ।',
    ctaFooterSubheadline: 'विचारदेखि विश्वव्यापी वितरणसम्म — हरेक ढाँचा, हरेक बजार, हरेक भाषा।',
    comparisonTranslationLabel: 'अनुवाद',
    comparisonTranscreationLabel: 'सांस्कृतिक सृजना',
    comparisonTranslationExample: '"हाम्रो उत्पादनले तपाईंको समय र पैसा बचाउन मद्दत गर्छ।"',
    comparisonTranscreationExample: '"किनभने तपाईंको समय कुनै पनि लगानीभन्दा बहुमूल्य छ"',
    statsLanguagesLabel: 'भाषाहरू',
    statsDialectsLabel: 'बोलीहरू',
    statsRegionsLabel: 'क्षेत्रहरू',
    statsSubRegionsLabel: 'उप-क्षेत्रहरू',
    demoHubHeadline: 'साँचो स्थानीयकरण। अनुवाद होइन।',
    demoHubSubheadline: 'हामी अर्थ, संस्कृति र सन्दर्भ अनुकूलन गर्छौं — यो नै सांस्कृतिक सृजना हो।',
    scheduleDemoLabel: 'मार्गदर्शित डेमो तालिका गर्नुहोस्',
    readyForRegion: 'दक्षिण एसियाको लागि तयार',
    signInPrompt: 'पहिले नै खाता छ? साइन इन गर्नुहोस्',
  },
};

const oceaniaConfig: RegionalConfig = {
  hero: { flag: '🇦🇺', regionName: 'Oceania', theme: 'Pacific Excellence', englishHeadline: 'No Worries — Your Content\'s Sorted.', englishSubheadline: 'Aussie English, Kiwi accent, Te Reo Māori, Pacific languages — content that sounds like home, not Hollywood.', nativeHeadline: 'Content That\'s Fair Dinkum — Not AI Slop', nativeSubheadline: 'From Sydney to Auckland, Fiji to Samoa — content that gets the Pacific' },
  stats: { languages: '5+', dialects: '8+', audienceReach: '45M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Get Started — It\'s Free, Mate', secondary: 'See It In Action', badge: 'No Hollywood accent. No corporate cringe. Just real.' },
  differentiators: { heroBadge: 'The Pacific\'s Own Content Engine', firstToMarket: ['Australian English ≠ American English — and we know it', 'Te Reo Māori language support — honouring Aotearoa', 'Pacific Island languages — Samoan, Tongan, Fijian recognition'], capabilityDepth: ['Aussie slang-aware without being cringe — we know the line', 'Aboriginal & Torres Strait Islander cultural sensitivity', 'APRA/AMCOS compliant music and audio content'], onlyHere: ['True ANZ transcreation — content that sounds like your mate, not a chatbot', 'Sustainability and First Nations respect built into content guidelines'] },
  languageShowcase: { languages: [ { code: 'en-AU', name: 'English (AU)', nativeName: 'Australian English', flag: '🇦🇺', transcreation: 'Create content that\'s proper good — in minutes', literal: 'Create stunning content in minutes' }, { code: 'en-NZ', name: 'English (NZ)', nativeName: 'New Zealand English', flag: '🇳🇿', transcreation: 'Sweet as — content sorted in minutes', literal: 'Create stunning content in minutes' }, { code: 'mi-NZ', name: 'Māori', nativeName: 'Te Reo Māori', flag: '🇳🇿', transcreation: 'He ihirangi e tū ana — i roto i ngā meneti' } ], demoPhrase: 'Content that sounds like home — wherever home is in the Pacific', demoTranslations: { 'mi-NZ': 'He ihirangi e ōrite ana ki te kāinga' } },
  seo: { title: 'Genie Suite - AI Content Production | Oceania', description: 'AI content for Australia, New Zealand & Pacific Islands. Aussie English, Kiwi accent, Te Reo Māori — authentic Pacific content.', keywords: ['Oceania AI', 'Australian content', 'ANZ production', 'Māori AI', 'Pacific content', 'New Zealand AI'], hreflang: 'en-AU', ogLocale: 'en_AU' },
  welcomeScript: 'G\'day! Welcome to Genie Suite for Oceania. No cookie-cutter American content here — just proper ANZ and Pacific voices.',
  showcaseExamples: [ { title: 'Outback Tourism Campaign', input: 'Tourism brief + cultural sensitivity guide', pipeline: 'Transcreate → Voice → Video', output: 'Tourism content that respects Country and sells the experience — in Aussie English and Te Reo', industry: 'Tourism' }, { title: 'AgriTech Product Launch', input: 'Product specs + farmer audience', pipeline: 'Script → Voice → Video → Social', output: 'Content that speaks to farmers — not at them. No jargon, just value.', industry: 'Agriculture' } ],
  nativeSections: {
    ctaFooterHeadline: 'Your Mob Deserves Content That Feels Like Home.',
    ctaFooterSubheadline: 'From idea to global distribution — every format, every market, every language.',
    comparisonTranslationLabel: 'Translation',
    comparisonTranscreationLabel: 'Transcreation',
    comparisonTranslationExample: '"Our product helps you save time and money."',
    comparisonTranscreationExample: '"Because your time\'s worth more than any investment, mate."',
    statsLanguagesLabel: 'Languages',
    statsDialectsLabel: 'Dialects',
    statsRegionsLabel: 'Regions',
    statsSubRegionsLabel: 'Sub-Regions',
    demoHubHeadline: 'True Localisation. Not Translation.',
    demoHubSubheadline: 'We adapt meaning, culture, and context — this is transcreation.',
    scheduleDemoLabel: 'Book a Guided Demo',
    readyForRegion: 'Ready for Oceania',
    signInPrompt: 'Already got an account? Sign in',
  },
};

const turkeyConfig: RegionalConfig = {
  hero: { flag: '🇹🇷', regionName: 'Türkiye', theme: 'Türkiye AI', englishHeadline: 'Where East Meets West — Your Content Speaks Both.', englishSubheadline: '85 million people at the crossroads of civilizations. Türkçe that\'s Istanbul-sharp and Anatolia-warm.', nativeHeadline: 'İçerik üretiminde devrim — Türkçe\'nin gücüyle', nativeSubheadline: 'İstanbul\'un enerjisi, Anadolu\'nun sıcaklığı — yapay zekâ ile buluşuyor' },
  stats: { languages: '3+', dialects: '5+', audienceReach: '85M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Hemen Başla — Ücretsiz', secondary: 'Demoyu İzle', badge: 'Türkçe\'ye saygı duyan yapay zekâ — çevirmen değil, içerik üreticisi' },
  differentiators: { heroBadge: 'Türkiye\'nin Kendi Yapay Zekâ İçerik Motoru', firstToMarket: ['Agglutinative Turkish mastery — suffixes that actually make sense', 'İstanbul cosmopolitan vs Anatolian heartland tone switching', 'Kurdish language support — Kurmancî and Zazakî'], capabilityDepth: ['Turkish vowel harmony in AI-generated text — not broken grammar', 'E-commerce content for Trendyol, Hepsiburada — local marketplace DNA', 'Ottoman calligraphy meets modern design — AI that respects heritage'], onlyHere: ['True Turkish transcreation — Google Translate\'in yapmaya cesaret edemeyeceği', 'Content that understands çay culture, hospitality, and memleket pride'] },
  languageShowcase: { languages: [ { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', transcreation: 'Dakikalar içinde kalbe dokunan içerik', literal: 'Dakikalar içinde etkileyici içerik oluşturun' }, { code: 'ku-TR', name: 'Kurdish (Kurmancî)', nativeName: 'Kurdî', flag: '🇹🇷', transcreation: 'Di hûrdeman de naverok ku dilê we bi xwe dike' } ], demoPhrase: 'Content that bridges continents — just like Türkiye', demoTranslations: { 'tr-TR': 'Tıpkı Türkiye gibi kıtaları birleştiren içerik' } },
  seo: { title: 'Genie Suite - AI İçerik Üretimi | Türkiye', description: 'Türkiye için yapay zekâ içerik üretimi. Türkçe-doğal, kültürel olarak özgün, İstanbul enerjisi.', keywords: ['Türkiye AI', 'Türkçe içerik', 'yapay zekâ içerik', 'İstanbul AI', 'Turkish transcreation'], hreflang: 'tr', ogLocale: 'tr_TR' },
  welcomeScript: 'Hoş geldiniz! Genie Suite ile tanışın — Türkçe\'nin güzelliğini ve derinliğini anlayan yapay zekâ. Çeviri değil, yaratım.',
  showcaseExamples: [ { title: 'E-Ticaret Kampanyası', input: 'Ürün kataloğu + trend analizi', pipeline: 'Transkreasyon → Seslendirme → Video', output: 'Trendyol & Hepsiburada\'da satış yapan içerik — Türkçe\'nin doğallığıyla', industry: 'E-Commerce' }, { title: 'Turizm Tanıtımı', input: 'Destinasyon brief + kültürel rehber', pipeline: 'Script → Voice → 4K Video', output: 'Kapadokya\'dan Bodrum\'a — turizm içeriği that sells the dream', industry: 'Tourism' } ],
  nativeSections: {
    ctaFooterHeadline: 'Kitleniz, evinde hissettiği içerikleri hak ediyor.',
    ctaFooterSubheadline: 'Fikirden küresel dağıtıma — her format, her pazar, her dil.',
    comparisonTranslationLabel: 'Çeviri',
    comparisonTranscreationLabel: 'Transkreasyon',
    comparisonTranslationExample: '"Ürünümüz zaman ve para tasarrufu yapmanıza yardımcı olur."',
    comparisonTranscreationExample: '"Çünkü zamanınız her yatırımdan daha değerli"',
    statsLanguagesLabel: 'Diller',
    statsDialectsLabel: 'Lehçeler',
    statsRegionsLabel: 'Bölgeler',
    statsSubRegionsLabel: 'Alt Bölgeler',
    demoHubHeadline: 'Gerçek Yerelleştirme. Çeviri Değil.',
    demoHubSubheadline: 'Anlamı, kültürü ve bağlamı uyarlıyoruz — işte bu transkreasyon.',
    scheduleDemoLabel: 'Rehberli Demo Planla',
    readyForRegion: 'Türkiye için hazır',
    signInPrompt: 'Zaten hesabınız var mı? Giriş yapın',
  },
};

const pakistanConfig: RegionalConfig = {
  hero: { flag: '🇵🇰', regionName: 'Pakistan', theme: 'Urdu-First Intelligence', englishHeadline: 'آپ کی زبان. آپ کی ثقافت. آپ کا پلیٹ فارم.', englishSubheadline: '230 million stories waiting to be told — in Urdu, Punjabi, Sindhi, Pashto. Your way.', nativeHeadline: 'آپ کی کہانی — آپ کی زبان میں', nativeSubheadline: 'اردو، پنجابی، سندھی، پشتو — دل سے بات، دل تک پہنچے', isRTL: true },
  stats: { languages: '8+', dialects: '10+', audienceReach: '230M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'ابھی مفت شروع کریں', secondary: 'جادو دیکھیں', badge: 'نستعلیق میں خوبصورت — ہمیشہ' },
  differentiators: { heroBadge: 'پاکستان کا اپنا AI مواد پلیٹ فارم', firstToMarket: ['Urdu AI that writes like an Urdu writer — not a translator', 'Nastaliq script — the way Urdu was meant to look', 'Punjabi, Sindhi, Pashto, Balochi — every voice matters'], capabilityDepth: ['RTL architecture — نستعلیق is our default, not our afterthought', 'Pakistani cultural calendar — Eid, Shab-e-Qadr, Pakistan Day', 'Cricket, chai, and cultural references that resonate'], onlyHere: ['True Urdu transcreation — محتوى يتحدث بروحك', 'From Lahore\'s josh to Karachi\'s hustle — every city, every soul'] },
  languageShowcase: { languages: [ { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', transcreation: 'منٹوں میں ایسا مواد جو دل چھو لے', literal: 'منٹوں میں شاندار مواد بنائیں' }, { code: 'pa-PK', name: 'Punjabi', nativeName: 'پنجابی', flag: '🇵🇰', dialect: 'Shahmukhi' }, { code: 'sd-PK', name: 'Sindhi', nativeName: 'سنڌي', flag: '🇵🇰' } ], demoPhrase: 'Your language is your identity — and we honor it', demoTranslations: { 'ur-PK': 'آپ کی زبان آپ کی پہچان ہے — اور ہم اس کا احترام کرتے ہیں' } },
  seo: { title: 'Genie Suite - AI Content Production | Pakistan', description: 'AI content for Pakistan. Urdu-native, Nastaliq rendering, Punjabi, Sindhi, Pashto — transcreated with soul.', keywords: ['Pakistan AI', 'Urdu content', 'Nastaliq AI', 'Pakistani transcreation', 'Punjabi content'], hreflang: 'ur', ogLocale: 'ur_PK' },
  welcomeScript: 'جینی سوٹ میں خوش آمدید! آپ کی کہانیاں آپ کی زبانوں میں — دل سے بنائیں، دنیا تک پہنچائیں۔',
  showcaseExamples: [ { title: 'Eid Campaign', input: 'Brand brief + Eid calendar', pipeline: 'Transcreate → Voice → Video', output: 'Eid content that feels like family — in Urdu, Punjabi, and beyond', industry: 'Marketing' } ],
  nativeSections: {
    ctaFooterHeadline: 'آپ کے ناظرین ایسا مواد چاہتے ہیں جو گھر جیسا محسوس ہو۔',
    ctaFooterSubheadline: 'خیال سے عالمی تقسیم تک — ہر شکل، ہر بازار، ہر زبان۔',
    comparisonTranslationLabel: 'ترجمہ',
    comparisonTranscreationLabel: 'تخلیقی ترجمہ',
    comparisonTranslationExample: '"ہمارا پروڈکٹ آپ کا وقت اور پیسہ بچانے میں مدد کرتا ہے۔"',
    comparisonTranscreationExample: '"کیونکہ آپ کا وقت کسی بھی سرمایہ کاری سے زیادہ قیمتی ہے"',
    statsLanguagesLabel: 'زبانیں',
    statsDialectsLabel: 'بولیاں',
    statsRegionsLabel: 'علاقے',
    statsSubRegionsLabel: 'ذیلی علاقے',
    demoHubHeadline: 'حقیقی مقامیت۔ ترجمہ نہیں۔',
    demoHubSubheadline: 'ہم معنی، ثقافت اور سیاق و سباق کو ڈھالتے ہیں — یہی تخلیقی ترجمہ ہے۔',
    scheduleDemoLabel: 'رہنمائی والا ڈیمو بک کریں',
    readyForRegion: 'پاکستان کے لیے تیار',
    signInPrompt: 'پہلے سے اکاؤنٹ ہے؟ سائن ان کریں',
  },
};

const bangladeshConfig: RegionalConfig = {
  hero: { flag: '🇧🇩', regionName: 'Bangladesh', theme: 'Bengali Intelligence', englishHeadline: 'বাংলায় বলুন, বাংলায় সৃষ্টি করুন', englishSubheadline: '170 million Bengalis. A language of poetry, revolution, and pride. Content that honors all of it.', nativeHeadline: 'বাংলায় গল্প বলুন — হৃদয় দিয়ে', nativeSubheadline: 'বাংলা ভাষার গভীরতা, AI-এর শক্তি — একসাথে' },
  stats: { languages: '3+', dialects: '8+', audienceReach: '170M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'বিনামূল্যে শুরু করুন', secondary: 'ডেমো দেখুন', badge: 'বাংলা — আমাদের গর্ব, আমাদের ভাষা' },
  differentiators: { heroBadge: 'বাংলাদেশের নিজস্ব AI মঞ্চ', firstToMarket: ['Bengali AI that writes with the soul of Rabindranath — not a phrasebook', 'Bangla script rendering that honors every matra', 'Chittagongian dialect support — because Bangladesh is more than Dhaka'], capabilityDepth: ['Standard Bengali + Chittagongian + Sylheti awareness', 'Bangla calligraphy AI — শিল্প as art, not decoration', 'Garment and textile industry content — Bangladesh\'s global strength'], onlyHere: ['True Bengali transcreation — কথা যা হৃদয় ছুঁয়ে যায়', 'Content that understands Pohela Boishakh, Ekushey February, and Victory Day'] },
  languageShowcase: { languages: [ { code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', transcreation: 'মিনিটে এমন কন্টেন্ট যা হৃদয় ছুঁয়ে যায়', literal: 'মিনিটের মধ্যে অসাধারণ কন্টেন্ট তৈরি করুন' }, { code: 'en-BD', name: 'English', nativeName: 'English', flag: '🇧🇩' } ], demoPhrase: 'Your language carried a revolution — it deserves content that honors it', demoTranslations: { 'bn-BD': 'আপনার ভাষা একটি বিপ্লব বহন করেছে — এটি সম্মানের যোগ্য কন্টেন্ট প্রাপ্য' } },
  seo: { title: 'Genie Suite - AI Content Production | Bangladesh', description: 'AI content for Bangladesh. Bengali-native, culturally transcreated with the soul of বাংলা.', keywords: ['Bangladesh AI', 'Bengali content', 'Bangla production', 'Dhaka AI', 'Bengali transcreation'], hreflang: 'bn', ogLocale: 'bn_BD' },
  welcomeScript: 'Genie Suite-এ স্বাগতম! বাংলায় গল্প বলুন — এমন গল্প যা হৃদয় থেকে আসে, হৃদয়ে পৌঁছে।',
  showcaseExamples: [ { title: 'Ready-Made Garment Campaign', input: 'Product catalog + export markets', pipeline: 'Transcreate → Voice → Video', output: 'Bengali marketing that sells with pride — not just prices', industry: 'Textiles' } ],
  nativeSections: {
    ctaFooterHeadline: 'আপনার দর্শকরা এমন কন্টেন্ট চায় যা ঘরের মতো মনে হয়।',
    ctaFooterSubheadline: 'ধারণা থেকে বৈশ্বিক বিতরণ — প্রতিটি ফর্ম্যাট, প্রতিটি বাজার, প্রতিটি ভাষা।',
    comparisonTranslationLabel: 'অনুবাদ',
    comparisonTranscreationLabel: 'সৃজনশীল রূপান্তর',
    comparisonTranslationExample: '"আমাদের পণ্য আপনার সময় এবং অর্থ সাশ্রয় করতে সাহায্য করে।"',
    comparisonTranscreationExample: '"কারণ আপনার সময় যেকোনো বিনিয়োগের চেয়ে মূল্যবান"',
    statsLanguagesLabel: 'ভাষা',
    statsDialectsLabel: 'উপভাষা',
    statsRegionsLabel: 'অঞ্চল',
    statsSubRegionsLabel: 'উপ-অঞ্চল',
    demoHubHeadline: 'প্রকৃত স্থানীয়করণ। অনুবাদ নয়।',
    demoHubSubheadline: 'আমরা অর্থ, সংস্কৃতি এবং প্রেক্ষাপট মানিয়ে নিই — এটাই সৃজনশীল রূপান্তর।',
    scheduleDemoLabel: 'গাইডেড ডেমো সময়সূচি করুন',
    readyForRegion: 'বাংলাদেশের জন্য প্রস্তুত',
    signInPrompt: 'ইতিমধ্যে অ্যাকাউন্ট আছে? সাইন ইন করুন',
  },
};

const easternEuropeConfig: RegionalConfig = {
  hero: { flag: '🇺🇦', regionName: 'Eastern Europe & Caucasus', theme: 'Eurasian Bridge', englishHeadline: 'Resilient Voices. Ancient Scripts. Modern Content.', englishSubheadline: 'Ukrainian, Georgian, Serbian, Armenian — languages with thousand-year alphabets deserve AI that respects them.', nativeHeadline: 'Створюйте контент, який звучить по-справжньому', nativeSubheadline: 'Від Києва до Тбілісі — кожна мова, кожна душа' },
  stats: { languages: '12+', dialects: '15+', audienceReach: '200M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Почніть безкоштовно', secondary: 'Дивіться демо', badge: 'Кирилиця + Латиниця + ქართული + Հայերեն — all native' },
  differentiators: { heroBadge: 'Eastern Europe\'s Own AI Content Engine', firstToMarket: ['Ukrainian AI that writes Ukrainian — not "Russian with different letters"', 'Georgian script (მხედრული) rendered with reverence — one of 14 unique alphabets in the world', 'Armenian script (Հայերեն) — 1,600 years old, now AI-powered'], capabilityDepth: ['Cyrillic + Latin dual-script for Serbian/Bosnian — automatic', 'Ukrainian cultural calendar — Vyshyvanka Day, Independence Day, Maidan spirit', 'Georgian polyphonic tradition awareness — content with კახური soul'], onlyHere: ['True Slavic & Caucasus transcreation — not Western templates with Cyrillic fonts', 'Content that understands supra, borsch, and the difference between Kyiv and Moscow'] },
  languageShowcase: { languages: [ { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', transcreation: 'Контент, що торкається серця — за хвилини', literal: 'Створюйте вражаючий контент за хвилини' }, { code: 'ka-GE', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪', transcreation: 'წუთებში შექმენით კონტენტი, რომელიც გულს ეხება' }, { code: 'sr-RS', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸', transcreation: 'Садржај који додирује срце — за минуте' }, { code: 'hy-AM', name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲', transcreation: 'Րոպdelays մdelays բовdays — սdays ևdays' } ], demoPhrase: 'Your alphabet is ancient. Your content should be cutting-edge.', demoTranslations: { 'uk-UA': 'Ваша абетка — давня. Ваш контент — має бути на вістрі.' } },
  seo: { title: 'Genie Suite - AI Content Production | Eastern Europe & Caucasus', description: 'AI content for Eastern Europe & Caucasus. Ukrainian, Georgian, Armenian, Serbian — transcreated with cultural depth.', keywords: ['Eastern Europe AI', 'Ukrainian content', 'Georgian AI', 'Armenian content', 'Balkan AI', 'Caucasus production'], hreflang: 'en', ogLocale: 'en_US' },
  welcomeScript: 'Ласкаво просимо! Welcome to Genie Suite for Eastern Europe & Caucasus. Your languages carry millennia of history — our AI honours every letter.',
  showcaseExamples: [ { title: 'Ukrainian Tech Campaign', input: 'Product brief + resilience narrative', pipeline: 'Transcreate → Voice → Video', output: 'Tech content in Ukrainian that resonates with national pride and innovation spirit', industry: 'Technology' }, { title: 'Georgian Wine Marketing', input: 'Winery brief + 8,000-year tradition', pipeline: 'Script → Voice → 4K Video', output: 'Wine content in ქართული that honours the cradle of wine — not just another vineyard ad', industry: 'Agriculture' } ],
  nativeSections: {
    ctaFooterHeadline: 'Ваша аудиторія заслуговує на контент, який відчувається як рідний.',
    ctaFooterSubheadline: 'Від ідеї до глобального поширення — кожен формат, кожен ринок, кожна мова.',
    comparisonTranslationLabel: 'Переклад',
    comparisonTranscreationLabel: 'Транскреація',
    comparisonTranslationExample: '"Наш продукт допомагає вам економити час і гроші."',
    comparisonTranscreationExample: '"Бо ваш час цінніший за будь-яку інвестицію"',
    statsLanguagesLabel: 'Мови',
    statsDialectsLabel: 'Діалекти',
    statsRegionsLabel: 'Регіони',
    statsSubRegionsLabel: 'Субрегіони',
    demoHubHeadline: 'Справжня локалізація. Не переклад.',
    demoHubSubheadline: 'Ми адаптуємо значення, культуру та контекст — це транскреація.',
    scheduleDemoLabel: 'Запланувати демонстрацію',
    readyForRegion: 'Готові для Східної Європи',
    signInPrompt: 'Вже є обліковий запис? Увійти',
  },
};

const centralAsiaConfig: RegionalConfig = {
  hero: { flag: '🇰🇿', regionName: 'Central Asia', theme: 'Silk Road Digital', englishHeadline: 'The Silk Road Is Digital Now — And It Speaks Your Language.', englishSubheadline: 'Kazakh, Uzbek, Azerbaijani — Turkic languages with ancient roots and modern ambition. Finally, AI that keeps up.', nativeHeadline: 'Сіздің тіліңіз — сіздің күшіңіз', nativeSubheadline: 'Қазақша, ўзбекча, Azərbaycanca — AI контент платформасы' },
  stats: { languages: '8+', dialects: '10+', audienceReach: '100M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Тегін бастаңыз', secondary: 'Демо көріңіз', badge: 'Түрік тілдері. Кирилл + Латын. Дайын.' },
  differentiators: { heroBadge: 'Орталық Азияның AI Контент Қозғалтқышы', firstToMarket: ['Kazakh Latin script transition support — Cyrillic AND Latin, seamlessly', 'Uzbek content that knows Tashkent style vs Samarkand heritage', 'Azerbaijani — the bridge between Turkic and Caucasus worlds'], capabilityDepth: ['Triple-script mastery — Arabic, Cyrillic, Latin for the same Turkic family', 'Nowruz, Nauryz festival-aware content calendar', 'Energy sector content for Kazakhstan — oil & gas terminology in Kazakh'], onlyHere: ['True Central Asian transcreation — not Russian content with local words swapped', 'Silk Road heritage meets digital ambition — content worthy of Samarkand and Astana'] },
  languageShowcase: { languages: [ { code: 'kk-KZ', name: 'Kazakh', nativeName: 'Қазақша', flag: '🇰🇿', transcreation: 'Жүрегіңізге жететін мазмұн — бірнеше минутта', literal: 'Бірнеше минутта тамаша мазмұн жасаңыз' }, { code: 'uz-UZ', name: 'Uzbek', nativeName: 'Oʻzbekcha', flag: '🇺🇿', transcreation: 'Yurakka yetadigan kontent — bir necha daqiqada', literal: 'Bir necha daqiqada ajoyib kontent yarating' }, { code: 'az-AZ', name: 'Azerbaijani', nativeName: 'Azərbaycanca', flag: '🇦🇿', transcreation: 'Ürəyə toxunan məzmun — bir neçə dəqiqədə', literal: 'Bir neçə dəqiqədə heyrətamiz məzmun yaradın' } ], demoPhrase: 'From Astana to Baku — content that honours your Turkic roots', demoTranslations: { 'kk-KZ': 'Астанадан Бакуге дейін — түркі тамырларыңызды құрметтейтін мазмұн' } },
  seo: { title: 'Genie Suite - AI Content Production | Central Asia', description: 'AI content for Central Asia. Kazakh, Uzbek, Azerbaijani — Turkic transcreation with Silk Road soul.', keywords: ['Central Asia AI', 'Kazakh content', 'Uzbek AI', 'Azerbaijani content', 'Turkic AI', 'Silk Road digital'], hreflang: 'en', ogLocale: 'en_US' },
  welcomeScript: 'Қош келдіңіздер! Xoş gəldiniz! Genie Suite — Орталық Азияның тілдерін құрметтейтін AI платформасы. Жібек жолынан — цифрлық дәуірге.',
  showcaseExamples: [ { title: 'Energy Sector Campaign', input: 'Oil & gas brief + Kazakh terminology', pipeline: 'Transcreate → Voice → Video', output: 'Energy content in Kazakh that speaks to the industry — not Google Translated jargon', industry: 'Energy' }, { title: 'Silk Road Tourism', input: 'Heritage tourism brief + Samarkand narrative', pipeline: 'Script → Voice → 4K Video', output: 'Tourism content in Uzbek that sells the heritage — Registan, Bibi-Khanym, and the spirit of the Silk Road', industry: 'Tourism' } ],
  nativeSections: {
    ctaFooterHeadline: 'Аудиторияңыз үйдегідей сезінетін мазмұнға лайық.',
    ctaFooterSubheadline: 'Идеядан жаһандық таратуға дейін — әр формат, әр нарық, әр тіл.',
    comparisonTranslationLabel: 'Аударма',
    comparisonTranscreationLabel: 'Транскреация',
    comparisonTranslationExample: '"Біздің өнім уақыт пен ақшаны үнемдеуге көмектеседі."',
    comparisonTranscreationExample: '"Сіздің уақытыңыз кез келген инвестициядан қымбат"',
    statsLanguagesLabel: 'Тілдер',
    statsDialectsLabel: 'Диалекттер',
    statsRegionsLabel: 'Аймақтар',
    statsSubRegionsLabel: 'Ішкі аймақтар',
    demoHubHeadline: 'Шынайы локализация. Аударма емес.',
    demoHubSubheadline: 'Біз мағына, мәдениет және контексті бейімдейміз — бұл транскреация.',
    scheduleDemoLabel: 'Басшылық демосын жоспарлау',
    readyForRegion: 'Орталық Азия үшін дайын',
    signInPrompt: 'Аккаунтыңыз бар ма? Кіру',
  },
};

const latamConfig: RegionalConfig = {
  hero: { flag: '🌎', regionName: 'Latin America', theme: 'Latino Creativity', englishHeadline: '¡Dale! Content That Moves Like Latin America Moves.', englishSubheadline: '650M people. Mexican warmth. Brazilian rhythm. Argentine passion. Colombian energy. All in one platform.', nativeHeadline: 'Contenido con alma latina — no traducido, vivido', nativeSubheadline: 'De México a Buenos Aires, de São Paulo a Bogotá — contenido que se siente tuyo' },
  stats: { languages: '10+', dialects: '20+', audienceReach: '650M+', industries: '50+', pipelines: '206' },
  cta: { primary: '¡Comienza ya — gratis!', secondary: 'Mira la magia', badge: 'Sin tarjeta. Sin trucos. Puro contenido.' },
  differentiators: { heroBadge: 'La Fábrica de Contenido de LATAM', firstToMarket: ['Mexican ≠ Argentine ≠ Colombian Spanish — we know the difference', 'Brazilian Portuguese ≠ European Portuguese — obviously', 'Telenovela-grade video AI — because drama sells'], capabilityDepth: ['Regional humor that actually lands — not gringo translations', 'Festival-aware content — Día de Muertos, Carnaval, Fiestas Patrias', 'Social-first distribution for TikTok, Mercado Libre, and beyond'], onlyHere: ['True Latino transcreation — contenido con sabor, no con subtítulos', 'From reggaetón energy to tango sophistication — every mood, every market'] },
  languageShowcase: { languages: [ { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español mexicano', flag: '🇲🇽', transcreation: 'Crea contenido que se siente como en casa', literal: 'Crea contenido impresionante en minutos' }, { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português brasileiro', flag: '🇧🇷', transcreation: 'Crie conteúdo que toca o coração', literal: 'Crie conteúdo impressionante em minutos' } ], demoPhrase: 'Content that dances, not just translates', demoTranslations: { 'es-MX': 'Contenido que baila, no solo se traduce', 'pt-BR': 'Conteúdo que dança, não só traduz' } },
  seo: { title: 'Genie Suite - AI Content Production | Latin America', description: 'AI content for LATAM. Spanish and Portuguese transcreated with regional soul — not translated.', keywords: ['LATAM AI', 'Spanish content', 'Brazilian Portuguese', 'Latin America transcreation', 'contenido latino'], hreflang: 'es', ogLocale: 'es_MX' },
  welcomeScript: '¡Bienvenidos a Genie Suite! Aquí no traducimos — creamos contenido con alma latina. Del corazón de LATAM para todo el mundo.',
  showcaseExamples: [ { title: 'Carnaval Campaign', input: 'Brand brief + festival calendar', pipeline: 'Transcreate → Voice → Video → Social', output: 'Campaigns that feel local in MX, BR, AR, CO — each with its own sabor', industry: 'Marketing' } ],
  nativeSections: {
    ctaFooterHeadline: 'Tu audiencia merece contenido que se sienta como en casa.',
    ctaFooterSubheadline: 'De la idea a la distribución global — cada formato, cada mercado, cada idioma.',
    comparisonTranslationLabel: 'Traducción',
    comparisonTranscreationLabel: 'Transcreación',
    comparisonTranslationExample: '"Nuestro producto te ayuda a ahorrar tiempo y dinero."',
    comparisonTranscreationExample: '"Porque tu tiempo vale más que cualquier inversión"',
    statsLanguagesLabel: 'Idiomas',
    statsDialectsLabel: 'Dialectos',
    statsRegionsLabel: 'Regiones',
    statsSubRegionsLabel: 'Subregiones',
    demoHubHeadline: 'Localización Real. No Traducción.',
    demoHubSubheadline: 'Adaptamos significado, cultura y contexto — esto es transcreación.',
    scheduleDemoLabel: 'Agenda una Demo Guiada',
    readyForRegion: 'Listo para Latinoamérica',
    signInPrompt: '¿Ya tienes cuenta? Inicia sesión',
  },
};

const caribbeanConfig: RegionalConfig = {
  hero: { flag: '🏝️', regionName: 'Caribbean', theme: 'Island Vibes', englishHeadline: 'Island Energy. Global Reach. Content That Vibes.', englishSubheadline: 'English, Spanish, French, Creole — four languages, one Caribbean soul.', nativeHeadline: 'Content wid di Caribbean spirit', nativeSubheadline: 'From Kingston to Port-au-Prince — content dat connect' },
  stats: { languages: '8+', dialects: '15+', audienceReach: '45M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free — No Stress', secondary: 'See di Vibes', badge: 'Built for island life — mobile, social, ready' },
  differentiators: { heroBadge: 'Caribbean\'s Creative AI Engine', firstToMarket: ['Caribbean Creole — not broken French, a real language with real support', 'Multi-colonial language handling — English, Spanish, French, Dutch, Papiamento', 'Tourism content that sells paradise — authentically'], capabilityDepth: ['Patois, Creole, Papiamento — languages that live in the streets', 'Reggae, soca, zouk energy in content tone', 'Carnival and festival-aware content calendar'], onlyHere: ['Caribbean transcreation — content with irie soul, not corporate polish', 'From Jamaican patois warmth to Haitian Creole resilience'] },
  languageShowcase: { languages: [ { code: 'en-US', name: 'English', nativeName: 'Caribbean English', flag: '🇯🇲' }, { code: 'es-MX', name: 'Spanish', nativeName: 'Español caribeño', flag: '🇨🇺', transcreation: 'Contenido con sabor a isla', literal: 'Crea contenido impresionante en minutos' }, { code: 'fr-FR', name: 'French/Creole', nativeName: 'Créole', flag: '🇭🇹', transcreation: 'Kontni ki gen nanm karayib la', literal: 'Créez du contenu impressionnant en minutes' } ], demoPhrase: 'Content that carries the spirit of the islands', demoTranslations: { 'es-MX': 'Contenido que lleva el espíritu de las islas' } },
  seo: { title: 'Genie Suite - AI Content Production | Caribbean', description: 'AI content for the Caribbean. English, Spanish, French, Creole — transcreated with island soul.', keywords: ['Caribbean AI', 'Creole content', 'island marketing', 'tourism AI', 'Caribbean transcreation'], hreflang: 'en', ogLocale: 'en_US' },
  welcomeScript: 'Welcome to Genie Suite for the Caribbean! Content wid vibes — from Jamaica to Trinidad, Haiti to Curaçao.',
  showcaseExamples: [ { title: 'Carnival Tourism Campaign', input: 'Destination brief + festival energy', pipeline: 'Transcreate → Voice → Video → Social', output: 'Tourism content that sells the experience, not just the beach', industry: 'Tourism' } ],
  nativeSections: {
    ctaFooterHeadline: 'Your people deserve content dat feel like yard.',
    ctaFooterSubheadline: 'From idea to global distribution — every format, every market, every language.',
    comparisonTranslationLabel: 'Translation',
    comparisonTranscreationLabel: 'Transcreation',
    comparisonTranslationExample: '"Our product helps you save time and money."',
    comparisonTranscreationExample: '"Because yuh time worth more than any investment, yuh know"',
    statsLanguagesLabel: 'Languages',
    statsDialectsLabel: 'Dialects',
    statsRegionsLabel: 'Regions',
    statsSubRegionsLabel: 'Sub-Regions',
    demoHubHeadline: 'Real Localisation. Not Translation.',
    demoHubSubheadline: 'We adapt meaning, culture, and context — dis is transcreation.',
    scheduleDemoLabel: 'Book a Guided Demo',
    readyForRegion: 'Ready fi di Caribbean',
    signInPrompt: 'Already have an account? Sign in',
  },
};

// ── Exported Registry ──

export const REGIONAL_CONFIGS: Record<RegionSlug, RegionalConfig> = {
  nam: namConfig,
  europe: europeConfig,
  mena: menaConfig,
  india: indiaConfig,
  africa: africaConfig,
  sea: seaConfig,
  cjk: cjkConfig,
  latam: latamConfig,
  apac: apacConfig,
  caribbean: caribbeanConfig,
  oceania: oceaniaConfig,
  turkey: turkeyConfig,
  pakistan: pakistanConfig,
  bangladesh: bangladeshConfig,
  eastern_europe: easternEuropeConfig,
  central_asia: centralAsiaConfig,
  south_asia: southAsiaConfig,
};

// ── Utilities ──

export const detectRegionFromTimezone = (): RegionSlug => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('America')) return 'nam';
    if (tz.includes('Europe/Istanbul')) return 'turkey';
    if (tz.includes('Europe')) return 'europe';
    if (tz.includes('Asia/Karachi')) return 'pakistan';
    if (tz.includes('Asia/Dhaka')) return 'bangladesh';
    if (tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) return 'india';
    if (tz.includes('Asia/Dubai') || tz.includes('Asia/Riyadh') || tz.includes('Asia/Kuwait')) return 'mena';
    if (tz.includes('Asia/Tokyo') || tz.includes('Asia/Seoul') || tz.includes('Asia/Shanghai') || tz.includes('Asia/Hong_Kong')) return 'cjk';
    if (tz.includes('Asia/Singapore') || tz.includes('Asia/Jakarta') || tz.includes('Asia/Bangkok') || tz.includes('Asia/Manila') || tz.includes('Asia/Ho_Chi_Minh') || tz.includes('Asia/Kuala_Lumpur')) return 'sea';
    if (tz.includes('Asia/Kathmandu') || tz.includes('Asia/Colombo') || tz.includes('Asia/Thimphu') || tz.includes('Indian/Maldives')) return 'south_asia';
    if (tz.includes('Asia/Almaty') || tz.includes('Asia/Tashkent') || tz.includes('Asia/Tbilisi') || tz.includes('Asia/Baku') || tz.includes('Asia/Yerevan')) return 'central_asia';
    if (tz.includes('Africa')) return 'africa';
    if (tz.includes('Australia') || tz.includes('Pacific')) return 'oceania';
    if (tz.includes('America/Sao_Paulo') || tz.includes('America/Mexico_City') || tz.includes('America/Buenos_Aires') || tz.includes('America/Bogota')) return 'latam';
  } catch {
    // fallback
  }
  return 'nam';
};

export const getAllRegionSlugs = (): RegionSlug[] => {
  return Object.keys(REGIONAL_CONFIGS) as RegionSlug[];
};

export default REGIONAL_CONFIGS;
