/**
 * REGIONAL LANDING CONFIG
 * 
 * Types, configs, and utilities for region-specific landing pages.
 * Covers 8 primary regions + P0/P1 expansion regions.
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
};

const southAsiaConfig: RegionalConfig = {
  hero: {
    flag: '🌏',
    regionName: 'South Asia',
    theme: 'South Asian Voices',
    englishHeadline: 'AI Content Production Suite — South Asia',
    englishSubheadline: 'Nepal, Sri Lanka, Bhutan & Maldives.',
    nativeHeadline: 'AI Content Production Suite',
    nativeSubheadline: 'Content for South Asian markets',
  },
  stats: { languages: '8+', dialects: '15+', audienceReach: '200M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'South Asia ready' },
  differentiators: {
    heroBadge: 'South Asia AI Content Suite',
    firstToMarket: ['Nepali language AI', 'Sinhala & Tamil support', 'Dzongkha coverage'],
    capabilityDepth: ['Multi-script rendering', 'Regional cultural adaptation', 'Low-bandwidth optimization'],
    onlyHere: ['South Asian transcreation', 'Regional authenticity'],
  },
  languageShowcase: {
    languages: [
      { code: 'ne-NP', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
      { code: 'si-LK', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: {},
  },
  seo: {
    title: 'Genie Suite - AI Content Production | South Asia',
    description: 'AI content production for South Asia. Nepal, Sri Lanka, Bhutan, Maldives.',
    keywords: ['South Asia AI', 'Nepali content', 'Sinhala AI', 'South Asian transcreation'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Welcome to Genie Suite for South Asia. Create content across Nepali, Sinhala, Tamil, Dzongkha and more.',
  showcaseExamples: [
    { title: 'Education Content', input: 'Curriculum brief', pipeline: 'Translate > Voice > Animate', output: 'Educational content in South Asian languages', industry: 'Education' },
  ],
};

const oceaniaConfig: RegionalConfig = {
  hero: {
    flag: '🇦🇺',
    regionName: 'Oceania',
    theme: 'Pacific Excellence',
    englishHeadline: 'AI Content Production Suite — Oceania',
    englishSubheadline: 'Australia & New Zealand. Premium English AI.',
    nativeHeadline: 'AI Content Production Suite',
    nativeSubheadline: 'Premium AI content for ANZ markets',
  },
  stats: { languages: '5+', dialects: '3+', audienceReach: '30M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'ANZ optimized' },
  differentiators: {
    heroBadge: 'Oceania\'s AI Content Suite',
    firstToMarket: ['Australian English adaptation', 'Māori language support', 'Pacific Island coverage'],
    capabilityDepth: ['ANZ accent voice synthesis', 'Regional compliance built-in', 'Time-zone aware scheduling'],
    onlyHere: ['True ANZ transcreation', 'Pacific cultural intelligence'],
  },
  languageShowcase: {
    languages: [
      { code: 'en-AU', name: 'English (AU)', nativeName: 'English', flag: '🇦🇺' },
      { code: 'en-NZ', name: 'English (NZ)', nativeName: 'English', flag: '🇳🇿' },
      { code: 'mi-NZ', name: 'Māori', nativeName: 'Te Reo Māori', flag: '🇳🇿' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: {},
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Oceania',
    description: 'AI content production for Australia, New Zealand & Pacific Islands.',
    keywords: ['Oceania AI', 'Australian content', 'ANZ production', 'Pacific AI'],
    hreflang: 'en-AU',
    ogLocale: 'en_AU',
  },
  welcomeScript: 'Welcome to Genie Suite for Oceania. Premium AI content for Australia, New Zealand and the Pacific.',
  showcaseExamples: [
    { title: 'Tourism Campaign', input: 'Destination brief', pipeline: 'Script > Voice > Video', output: 'ANZ tourism content', industry: 'Tourism' },
  ],
};

const turkeyConfig: RegionalConfig = {
  hero: {
    flag: '🇹🇷',
    regionName: 'Turkey',
    theme: 'Türkiye AI',
    englishHeadline: 'AI Content Production Suite — Turkey',
    englishSubheadline: 'Türkçe-native. 85M audience.',
    nativeHeadline: 'AI İçerik Üretim Platformu',
    nativeSubheadline: 'Türkçe içerik üretimi',
  },
  stats: { languages: '3+', dialects: '5+', audienceReach: '85M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Ücretsiz Başla', secondary: 'Demo İzle', badge: 'Türkçe-optimize' },
  differentiators: {
    heroBadge: 'Turkey\'s AI Content Suite',
    firstToMarket: ['Turkish language AI mastery', 'Agglutinative language engine', 'Ottoman script support'],
    capabilityDepth: ['Istanbul accent synthesis', 'Turkish cultural calendar', 'E-commerce content'],
    onlyHere: ['True Turkish transcreation', 'Anatolian cultural depth'],
  },
  languageShowcase: {
    languages: [
      { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
      { code: 'ku-TR', name: 'Kurdish', nativeName: 'Kurdî', flag: '🇹🇷' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'tr-TR': 'Dakikalar içinde etkileyici içerik oluşturun' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Turkey',
    description: 'AI content production for Turkey. Turkish-native, culturally authentic.',
    keywords: ['Turkish AI', 'Türkçe content', 'Turkey production', 'Istanbul AI'],
    hreflang: 'tr',
    ogLocale: 'tr_TR',
  },
  welcomeScript: 'Genie Suite\'e hoş geldiniz. Türkçe içerik üretiminde yapay zeka ile fark yaratın.',
  showcaseExamples: [
    { title: 'E-Ticaret Kampanyası', input: 'Ürün kataloğu', pipeline: 'Script > Voice > Video', output: 'Turkish e-commerce content', industry: 'E-Commerce' },
  ],
};

const pakistanConfig: RegionalConfig = {
  hero: {
    flag: '🇵🇰',
    regionName: 'Pakistan',
    theme: 'Urdu-First Intelligence',
    englishHeadline: 'آپ کی زبان. آپ کی ثقافت. آپ کا پلیٹ فارم.',
    englishSubheadline: '230 million stories waiting to be told — in Urdu, Punjabi, Sindhi, Pashto. Your way.',
    nativeHeadline: 'آپ کی کہانی — آپ کی زبان میں',
    nativeSubheadline: 'اردو، پنجابی، سندھی، پشتو — دل سے بات، دل تک پہنچے',
    isRTL: true,
  },
  stats: { languages: '8+', dialects: '10+', audienceReach: '230M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'ابھی مفت شروع کریں', secondary: 'جادو دیکھیں', badge: 'نستعلیق میں خوبصورت — ہمیشہ' },
  differentiators: {
    heroBadge: 'پاکستان کا اپنا AI مواد پلیٹ فارم',
    firstToMarket: ['Urdu AI that writes like an Urdu writer — not a translator', 'Nastaliq script — the way Urdu was meant to look', 'Punjabi, Sindhi, Pashto, Balochi — every voice matters'],
    capabilityDepth: ['RTL architecture — نستعلیق is our default, not our afterthought', 'Pakistani cultural calendar — Eid, Shab-e-Qadr, Pakistan Day', 'Cricket, chai, and cultural references that resonate'],
    onlyHere: ['True Urdu transcreation — محتوى يتحدث بروحك', 'From Lahore\'s josh to Karachi\'s hustle — every city, every soul'],
  },
  languageShowcase: {
    languages: [
      { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', transcreation: 'منٹوں میں ایسا مواد جو دل چھو لے', literal: 'منٹوں میں شاندار مواد بنائیں' },
      { code: 'pa-PK', name: 'Punjabi', nativeName: 'پنجابی', flag: '🇵🇰', dialect: 'Shahmukhi' },
      { code: 'sd-PK', name: 'Sindhi', nativeName: 'سنڌي', flag: '🇵🇰' },
    ],
    demoPhrase: 'Your language is your identity — and we honor it',
    demoTranslations: { 'ur-PK': 'آپ کی زبان آپ کی پہچان ہے — اور ہم اس کا احترام کرتے ہیں' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Pakistan',
    description: 'AI content for Pakistan. Urdu-native, Nastaliq rendering, Punjabi, Sindhi, Pashto — transcreated with soul.',
    keywords: ['Pakistan AI', 'Urdu content', 'Nastaliq AI', 'Pakistani transcreation', 'Punjabi content'],
    hreflang: 'ur',
    ogLocale: 'ur_PK',
  },
  welcomeScript: 'جینی سوٹ میں خوش آمدید! آپ کی کہانیاں آپ کی زبانوں میں — دل سے بنائیں، دنیا تک پہنچائیں۔',
  showcaseExamples: [
    { title: 'Eid Campaign', input: 'Brand brief + Eid calendar', pipeline: 'Transcreate → Voice → Video', output: 'Eid content that feels like family — in Urdu, Punjabi, and beyond', industry: 'Marketing' },
  ],
};

const bangladeshConfig: RegionalConfig = {
  hero: {
    flag: '🇧🇩',
    regionName: 'Bangladesh',
    theme: 'Bengali Intelligence',
    englishHeadline: 'বাংলায় বলুন, বাংলায় সৃষ্টি করুন',
    englishSubheadline: '170 million Bengalis. A language of poetry, revolution, and pride. Content that honors all of it.',
    nativeHeadline: 'বাংলায় গল্প বলুন — হৃদয় দিয়ে',
    nativeSubheadline: 'বাংলা ভাষার গভীরতা, AI-এর শক্তি — একসাথে',
  },
  stats: { languages: '3+', dialects: '8+', audienceReach: '170M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'বিনামূল্যে শুরু করুন', secondary: 'ডেমো দেখুন', badge: 'বাংলা — আমাদের গর্ব, আমাদের ভাষা' },
  differentiators: {
    heroBadge: 'বাংলাদেশের নিজস্ব AI মঞ্চ',
    firstToMarket: ['Bengali AI that writes with the soul of Rabindranath — not a phrasebook', 'Bangla script rendering that honors every matra', 'Chittagongian dialect support — because Bangladesh is more than Dhaka'],
    capabilityDepth: ['Standard Bengali + Chittagongian + Sylheti awareness', 'Bangla calligraphy AI — শিল্প as art, not decoration', 'Garment and textile industry content — Bangladesh\'s global strength'],
    onlyHere: ['True Bengali transcreation — কথা যা হৃদয় ছুঁয়ে যায়', 'Content that understands Pohela Boishakh, Ekushey February, and Victory Day'],
  },
  languageShowcase: {
    languages: [
      { code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', transcreation: 'মিনিটে এমন কন্টেন্ট যা হৃদয় ছুঁয়ে যায়', literal: 'মিনিটের মধ্যে অসাধারণ কন্টেন্ট তৈরি করুন' },
      { code: 'en-BD', name: 'English', nativeName: 'English', flag: '🇧🇩' },
    ],
    demoPhrase: 'Your language carried a revolution — it deserves content that honors it',
    demoTranslations: { 'bn-BD': 'আপনার ভাষা একটি বিপ্লব বহন করেছে — এটি সম্মানের যোগ্য কন্টেন্ট প্রাপ্য' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Bangladesh',
    description: 'AI content for Bangladesh. Bengali-native, culturally transcreated with the soul of বাংলা.',
    keywords: ['Bangladesh AI', 'Bengali content', 'Bangla production', 'Dhaka AI', 'Bengali transcreation'],
    hreflang: 'bn',
    ogLocale: 'bn_BD',
  },
  welcomeScript: 'Genie Suite-এ স্বাগতম! বাংলায় গল্প বলুন — এমন গল্প যা হৃদয় থেকে আসে, হৃদয়ে পৌঁছে।',
  showcaseExamples: [
    { title: 'Ready-Made Garment Campaign', input: 'Product catalog + export markets', pipeline: 'Transcreate → Voice → Video', output: 'Bengali marketing that sells with pride — not just prices', industry: 'Textiles' },
  ],
};

const easternEuropeConfig: RegionalConfig = {
  hero: {
    flag: '🇺🇦',
    regionName: 'Eastern Europe & Caucasus',
    theme: 'Eurasian Bridge',
    englishHeadline: 'AI Content Production Suite — Eastern Europe',
    englishSubheadline: 'Ukraine, Balkans, Caucasus. 200M+ audience.',
    nativeHeadline: 'AI Платформа Контенту',
    nativeSubheadline: 'Контент для Східної Європи та Кавказу',
  },
  stats: { languages: '12+', dialects: '15+', audienceReach: '200M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'Cyrillic + Latin' },
  differentiators: {
    heroBadge: 'Eastern Europe AI Suite',
    firstToMarket: ['Ukrainian language AI', 'Cyrillic + Latin dual support', 'Balkan language coverage'],
    capabilityDepth: ['Ukrainian, Serbian, Bulgarian, Croatian', 'Georgian, Armenian scripts', 'Multi-script rendering'],
    onlyHere: ['True Slavic transcreation', 'Caucasus cultural intelligence'],
  },
  languageShowcase: {
    languages: [
      { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
      { code: 'sr-RS', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
      { code: 'ka-GE', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'uk-UA': 'Створюйте вражаючий контент за лічені хвилини' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Eastern Europe',
    description: 'AI content production for Eastern Europe & Caucasus. Ukrainian, Balkan, Georgian support.',
    keywords: ['Eastern Europe AI', 'Ukrainian content', 'Balkan AI', 'Caucasus production'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Welcome to Genie Suite for Eastern Europe. Create content across Ukrainian, Serbian, Georgian and more.',
  showcaseExamples: [
    { title: 'Tech Startup Content', input: 'Product brief', pipeline: 'Script > Voice > Video', output: 'Content in 5 Eastern European languages', industry: 'Technology' },
  ],
};

const centralAsiaConfig: RegionalConfig = {
  hero: {
    flag: '🇰🇿',
    regionName: 'Central Asia',
    theme: 'Silk Road Digital',
    englishHeadline: 'AI Content Production Suite — Central Asia',
    englishSubheadline: 'Kazakhstan, Uzbekistan, Azerbaijan.',
    nativeHeadline: 'AI Контент Платформасы',
    nativeSubheadline: 'Орталық Азияға арналған контент',
  },
  stats: { languages: '8+', dialects: '10+', audienceReach: '100M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'Turkic + Cyrillic' },
  differentiators: {
    heroBadge: 'Central Asia AI Suite',
    firstToMarket: ['Kazakh language AI', 'Turkic language family', 'Cyrillic-Latin dual script'],
    capabilityDepth: ['Kazakh, Uzbek, Azerbaijani', 'Arabic, Cyrillic, Latin scripts', 'Regional cultural adaptation'],
    onlyHere: ['True Central Asian transcreation', 'Silk Road cultural intelligence'],
  },
  languageShowcase: {
    languages: [
      { code: 'kk-KZ', name: 'Kazakh', nativeName: 'Қазақ', flag: '🇰🇿' },
      { code: 'uz-UZ', name: 'Uzbek', nativeName: 'Oʻzbek', flag: '🇺🇿' },
      { code: 'az-AZ', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'kk-KZ': 'Бірнеше минутта тамаша мазмұн жасаңыз' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Central Asia',
    description: 'AI content production for Central Asia. Kazakh, Uzbek, Azerbaijani support.',
    keywords: ['Central Asia AI', 'Kazakh content', 'Uzbek AI', 'Turkic production'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Welcome to Genie Suite for Central Asia. Create content in Kazakh, Uzbek, Azerbaijani and more.',
  showcaseExamples: [
    { title: 'Energy Sector Content', input: 'Industry brief', pipeline: 'Script > Voice > Video', output: 'Content in Central Asian languages', industry: 'Energy' },
  ],
};

const latamConfig: RegionalConfig = {
  hero: {
    flag: '🌎',
    regionName: 'Latin America',
    theme: 'Latino Creativity',
    englishHeadline: '¡Dale! Content That Moves Like Latin America Moves.',
    englishSubheadline: '650M people. Mexican warmth. Brazilian rhythm. Argentine passion. Colombian energy. All in one platform.',
    nativeHeadline: 'Contenido con alma latina — no traducido, vivido',
    nativeSubheadline: 'De México a Buenos Aires, de São Paulo a Bogotá — contenido que se siente tuyo',
  },
  stats: { languages: '10+', dialects: '20+', audienceReach: '650M+', industries: '50+', pipelines: '206' },
  cta: { primary: '¡Comienza ya — gratis!', secondary: 'Mira la magia', badge: 'Sin tarjeta. Sin trucos. Puro contenido.' },
  differentiators: {
    heroBadge: 'La Fábrica de Contenido de LATAM',
    firstToMarket: ['Mexican ≠ Argentine ≠ Colombian Spanish — we know the difference', 'Brazilian Portuguese ≠ European Portuguese — obviously', 'Telenovela-grade video AI — because drama sells'],
    capabilityDepth: ['Regional humor that actually lands — not gringo translations', 'Festival-aware content — Día de Muertos, Carnaval, Fiestas Patrias', 'Social-first distribution for TikTok, Mercado Libre, and beyond'],
    onlyHere: ['True Latino transcreation — contenido con sabor, no con subtítulos', 'From reggaetón energy to tango sophistication — every mood, every market'],
  },
  languageShowcase: {
    languages: [
      { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español mexicano', flag: '🇲🇽', transcreation: 'Crea contenido que se siente como en casa', literal: 'Crea contenido impresionante en minutos' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português brasileiro', flag: '🇧🇷', transcreation: 'Crie conteúdo que toca o coração', literal: 'Crie conteúdo impressionante em minutos' },
    ],
    demoPhrase: 'Content that dances, not just translates',
    demoTranslations: { 'es-MX': 'Contenido que baila, no solo se traduce', 'pt-BR': 'Conteúdo que dança, não só traduz' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Latin America',
    description: 'AI content for LATAM. Spanish and Portuguese transcreated with regional soul — not translated.',
    keywords: ['LATAM AI', 'Spanish content', 'Brazilian Portuguese', 'Latin America transcreation', 'contenido latino'],
    hreflang: 'es',
    ogLocale: 'es_MX',
  },
  welcomeScript: '¡Bienvenidos a Genie Suite! Aquí no traducimos — creamos contenido con alma latina. Del corazón de LATAM para todo el mundo.',
  showcaseExamples: [
    { title: 'Carnaval Campaign', input: 'Brand brief + festival calendar', pipeline: 'Transcreate → Voice → Video → Social', output: 'Campaigns that feel local in MX, BR, AR, CO — each with its own sabor', industry: 'Marketing' },
  ],
};

const caribbeanConfig: RegionalConfig = {
  hero: {
    flag: '🏝️',
    regionName: 'Caribbean',
    theme: 'Island Vibes',
    englishHeadline: 'Island Energy. Global Reach. Content That Vibes.',
    englishSubheadline: 'English, Spanish, French, Creole — four languages, one Caribbean soul.',
    nativeHeadline: 'Content wid di Caribbean spirit',
    nativeSubheadline: 'From Kingston to Port-au-Prince — content dat connect',
  },
  stats: { languages: '8+', dialects: '15+', audienceReach: '45M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free — No Stress', secondary: 'See di Vibes', badge: 'Built for island life — mobile, social, ready' },
  differentiators: {
    heroBadge: 'Caribbean\'s Creative AI Engine',
    firstToMarket: ['Caribbean Creole — not broken French, a real language with real support', 'Multi-colonial language handling — English, Spanish, French, Dutch, Papiamento', 'Tourism content that sells paradise — authentically'],
    capabilityDepth: ['Patois, Creole, Papiamento — languages that live in the streets', 'Reggae, soca, zouk energy in content tone', 'Carnival and festival-aware content calendar'],
    onlyHere: ['Caribbean transcreation — content with irie soul, not corporate polish', 'From Jamaican patois warmth to Haitian Creole resilience'],
  },
  languageShowcase: {
    languages: [
      { code: 'en-US', name: 'English', nativeName: 'Caribbean English', flag: '🇯🇲' },
      { code: 'es-MX', name: 'Spanish', nativeName: 'Español caribeño', flag: '🇨🇺', transcreation: 'Contenido con sabor a isla', literal: 'Crea contenido impresionante en minutos' },
      { code: 'fr-FR', name: 'French/Creole', nativeName: 'Créole', flag: '🇭🇹', transcreation: 'Kontni ki gen nanm karayib la', literal: 'Créez du contenu impressionnant en minutes' },
    ],
    demoPhrase: 'Content that carries the spirit of the islands',
    demoTranslations: { 'es-MX': 'Contenido que lleva el espíritu de las islas' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Caribbean',
    description: 'AI content for the Caribbean. English, Spanish, French, Creole — transcreated with island soul.',
    keywords: ['Caribbean AI', 'Creole content', 'island marketing', 'tourism AI', 'Caribbean transcreation'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Welcome to Genie Suite for the Caribbean! Content wid vibes — from Jamaica to Trinidad, Haiti to Curaçao.',
  showcaseExamples: [
    { title: 'Carnival Tourism Campaign', input: 'Destination brief + festival energy', pipeline: 'Transcreate → Voice → Video → Social', output: 'Tourism content that sells the experience, not just the beach', industry: 'Tourism' },
  ],
};

// ── Exported Registry ──

export const REGIONAL_CONFIGS: Record<RegionSlug, RegionalConfig> = {
  // Primary 8 regions
  nam: namConfig,
  europe: europeConfig,
  mena: menaConfig,
  india: indiaConfig,
  africa: africaConfig,
  sea: seaConfig,
  cjk: cjkConfig,
  latam: latamConfig,
  // Legacy fallback (redirected in router)
  apac: apacConfig,
  // Dedicated 8 expansion regions
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
