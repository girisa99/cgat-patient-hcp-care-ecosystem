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
    languages: { code: string; name: string; nativeName: string; flag: string; region?: string; azureVoice?: string; transcreation?: string; literal?: string }[];
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
    englishHeadline: 'AI Content Production Suite — North America',
    englishSubheadline: '19 AI providers. 206 pipelines. One platform.',
    nativeHeadline: 'AI Content Production Suite',
    nativeSubheadline: 'Enterprise-grade content at startup speed',
  },
  stats: { languages: '140+', dialects: '30+', audienceReach: '400M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'No credit card required' },
  differentiators: {
    heroBadge: 'First All-in-One AI Content Suite',
    firstToMarket: ['19-provider AI orchestration', 'Real-time transcreation engine', 'End-to-end content pipeline'],
    capabilityDepth: ['206 production pipelines', '3D + Avatar + Video in one platform', 'Zone-routed AI models'],
    onlyHere: ['Cultural transcreation, not translation', 'Single prompt to published media'],
  },
  languageShowcase: {
    languages: [
      { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'es-MX', name: 'Spanish', nativeName: 'Espanol', flag: '🇲🇽' },
      { code: 'fr-CA', name: 'French', nativeName: 'Francais', flag: '🇨🇦' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'es-MX': 'Crea contenido impresionante en minutos', 'fr-CA': 'Creez du contenu impressionnant en minutes' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | North America',
    description: 'The all-in-one AI content production suite. 19 providers, 206 pipelines, 140+ languages.',
    keywords: ['AI content', 'video production', 'transcreation', 'enterprise AI'],
    hreflang: 'en-US',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Welcome to Genie Suite, the world\'s first all-in-one AI content production platform. From script to screen in minutes.',
  showcaseExamples: [
    { title: 'Product Launch Video', input: 'Product brief + brand guidelines', pipeline: 'Script > Voice > Video > 3D', output: '4K product video in 22 languages', industry: 'Technology' },
    { title: 'Patient Education', input: 'Clinical protocol', pipeline: 'Simplify > Narrate > Animate', output: 'Accessible patient guides', industry: 'Healthcare' },
  ],
};

const europeConfig: RegionalConfig = {
  hero: {
    flag: '🇪🇺',
    regionName: 'Europe',
    theme: 'Multilingual Excellence',
    englishHeadline: 'AI Content Production Suite — Europe',
    englishSubheadline: '24 official languages. One unified platform.',
    nativeHeadline: 'AI-Inhaltsproduktion',
    nativeSubheadline: 'GDPR-compliant, multilingual content at scale',
  },
  stats: { languages: '40+', dialects: '50+', audienceReach: '450M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'GDPR compliant' },
  differentiators: {
    heroBadge: 'Europe\'s Multilingual AI Suite',
    firstToMarket: ['24-language simultaneous production', 'EU data sovereignty', 'GDPR-native architecture'],
    capabilityDepth: ['50+ European dialects', 'Cultural context engine', 'Regulatory compliance built-in'],
    onlyHere: ['True European transcreation', 'Zone-routed EU data processing'],
  },
  languageShowcase: {
    languages: [
      { code: 'en-GB', name: 'English', nativeName: 'English', flag: '🇬🇧' },
      { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'fr-FR', name: 'French', nativeName: 'Francais', flag: '🇫🇷' },
      { code: 'es-ES', name: 'Spanish', nativeName: 'Espanol', flag: '🇪🇸' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'de-DE': 'Erstellen Sie beeindruckende Inhalte in Minuten', 'fr-FR': 'Creez du contenu impressionnant en minutes' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Europe',
    description: 'Multilingual AI content production for European markets. 40+ languages, GDPR compliant.',
    keywords: ['AI content Europe', 'multilingual production', 'GDPR AI', 'European transcreation'],
    hreflang: 'en-GB',
    ogLocale: 'en_GB',
  },
  welcomeScript: 'Welcome to Genie Suite for Europe. Create content in 40+ European languages with full GDPR compliance.',
  showcaseExamples: [
    { title: 'Pan-European Campaign', input: 'Brand campaign brief', pipeline: 'Transcreate > Localize > Distribute', output: 'Campaign in 24 EU languages', industry: 'Marketing' },
    { title: 'Compliance Training', input: 'Regulatory framework', pipeline: 'Script > Voice > Video', output: 'Multilingual training modules', industry: 'Finance' },
  ],
};

const menaConfig: RegionalConfig = {
  hero: {
    flag: '🇸🇦',
    regionName: 'MENA',
    theme: 'Arabic-First Intelligence',
    englishHeadline: 'AI Content Production Suite — MENA',
    englishSubheadline: '7 Arabic dialects. RTL-native. Culturally aware.',
    nativeHeadline: 'منصة إنتاج المحتوى بالذكاء الاصطناعي',
    nativeSubheadline: 'محتوى عربي أصيل بسبع لهجات',
    isRTL: true,
  },
  stats: { languages: '15+', dialects: '7', audienceReach: '400M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'ابدأ مجاناً', secondary: 'شاهد العرض', badge: 'مجاني بالكامل' },
  differentiators: {
    heroBadge: 'First Arabic-Native AI Suite',
    firstToMarket: ['7 Arabic dialect support', 'RTL-native rendering', 'Islamic calendar integration'],
    capabilityDepth: ['MSA + dialect switching', 'Arabic calligraphy AI', 'Culturally-aware content generation'],
    onlyHere: ['True Arabic transcreation', 'Gulf, Levantine, Egyptian, Maghrebi dialects'],
  },
  languageShowcase: {
    languages: [
      { code: 'ar-SA', name: 'Arabic (Saudi)', nativeName: 'العربية', flag: '🇸🇦' },
      { code: 'ar-AE', name: 'Arabic (UAE)', nativeName: 'العربية', flag: '🇦🇪' },
      { code: 'ar-EG', name: 'Arabic (Egypt)', nativeName: 'العربية', flag: '🇪🇬' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'ar-SA': 'أنشئ محتوى مذهلاً في دقائق' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | MENA',
    description: 'Arabic-first AI content production. 7 dialects, RTL-native, culturally transcreated.',
    keywords: ['Arabic AI', 'MENA content', 'RTL production', 'Arabic transcreation'],
    hreflang: 'ar',
    ogLocale: 'ar_SA',
  },
  welcomeScript: 'Welcome to Genie Suite for MENA. Create authentic Arabic content across 7 dialects, with full RTL support.',
  showcaseExamples: [
    { title: 'Islamic Finance Guide', input: 'Sharia compliance brief', pipeline: 'Script > Arabic Voice > Video', output: 'Compliant finance content in 7 dialects', industry: 'Finance' },
  ],
};

const indiaConfig: RegionalConfig = {
  hero: {
    flag: '🇮🇳',
    regionName: 'India',
    theme: 'Bharatiya AI',
    englishHeadline: 'AI Content Production Suite — India',
    englishSubheadline: '22 official languages. 1.4B audience.',
    nativeHeadline: 'AI सामग्री उत्पादन सुइट',
    nativeSubheadline: '22 भारतीय भाषाओं में सामग्री',
  },
  stats: { languages: '22+', dialects: '50+', audienceReach: '1.4B+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'UPI payments supported' },
  differentiators: {
    heroBadge: 'India\'s Most Complete AI Suite',
    firstToMarket: ['22 Indian language support', 'Indic script rendering', 'Regional voice synthesis'],
    capabilityDepth: ['Devanagari, Tamil, Telugu scripts', 'Bollywood-grade video AI', 'Festival-aware scheduling'],
    onlyHere: ['True Indic transcreation', 'Regional cultural adaptation'],
  },
  languageShowcase: {
    languages: [
      { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
      { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
      { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
      { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'hi-IN': 'मिनटों में शानदार सामग्री बनाएं' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | India',
    description: 'AI content production for India. 22 languages, Indic scripts, cultural transcreation.',
    keywords: ['Indian AI', 'Hindi content', 'Indic transcreation', 'Bharatiya AI'],
    hreflang: 'en-IN',
    ogLocale: 'en_IN',
  },
  welcomeScript: 'Welcome to Genie Suite for India. Create content in 22 Indian languages with authentic cultural transcreation.',
  showcaseExamples: [
    { title: 'EdTech Course', input: 'Curriculum content', pipeline: 'Translate > Voice > Animate', output: 'Courses in 12 Indic languages', industry: 'Education' },
  ],
};

const africaConfig: RegionalConfig = {
  hero: {
    flag: '🌍',
    regionName: 'Africa',
    theme: 'Pan-African Voice',
    englishHeadline: 'AI Content Production Suite — Africa',
    englishSubheadline: 'Serving 54 nations. 2000+ languages.',
    nativeHeadline: 'AI Content Production Suite',
    nativeSubheadline: 'Content for the African continent',
  },
  stats: { languages: '30+', dialects: '100+', audienceReach: '1.4B+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'Mobile-first' },
  differentiators: {
    heroBadge: 'Africa\'s First AI Content Suite',
    firstToMarket: ['African language AI models', 'Low-bandwidth optimization', 'Mobile-first design'],
    capabilityDepth: ['Swahili, Amharic, Yoruba TTS', 'Offline-capable content', 'Pan-African distribution'],
    onlyHere: ['African cultural transcreation', 'Continent-wide language support'],
  },
  languageShowcase: {
    languages: [
      { code: 'en-KE', name: 'English', nativeName: 'English', flag: '🇰🇪' },
      { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
      { code: 'fr-FR', name: 'French', nativeName: 'Francais', flag: '🇫🇷' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'sw-KE': 'Unda maudhui ya kushangaza kwa dakika' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Africa',
    description: 'AI content production for Africa. 30+ languages, mobile-first, culturally authentic.',
    keywords: ['African AI', 'Swahili content', 'Pan-African production', 'Africa transcreation'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Welcome to Genie Suite for Africa. Create content that resonates across the continent in 30+ African languages.',
  showcaseExamples: [
    { title: 'Health Campaign', input: 'Public health brief', pipeline: 'Simplify > Voice > Distribute', output: 'Health content in 10 African languages', industry: 'Healthcare' },
  ],
};

const seaConfig: RegionalConfig = {
  hero: {
    flag: '🌏',
    regionName: 'Southeast Asia',
    theme: 'SEA Digital',
    englishHeadline: 'AI Content Production Suite — Southeast Asia',
    englishSubheadline: 'Malay, Thai, Vietnamese, Filipino & more.',
    nativeHeadline: 'AI Content Production Suite',
    nativeSubheadline: 'Digital content for SEA markets',
  },
  stats: { languages: '12+', dialects: '20+', audienceReach: '700M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'SEA-optimized' },
  differentiators: {
    heroBadge: 'SEA\'s AI Content Suite',
    firstToMarket: ['SEA language coverage', 'Mobile-first distribution', 'Social commerce content'],
    capabilityDepth: ['Thai, Vietnamese, Indonesian TTS', 'Filipino/Taglish adaptation', 'Singapore English support'],
    onlyHere: ['True SEA transcreation', 'Regional cultural adaptation'],
  },
  languageShowcase: {
    languages: [
      { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
      { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
      { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
      { code: 'tl-PH', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'th-TH': 'สร้างเนื้อหาที่น่าทึ่งในไม่กี่นาที', 'vi-VN': 'Tạo nội dung ấn tượng trong vài phút' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Southeast Asia',
    description: 'AI content production for Southeast Asia. Malay, Thai, Vietnamese, Filipino support.',
    keywords: ['SEA AI', 'Thai content', 'Vietnamese AI', 'Filipino production', 'Indonesia transcreation'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Welcome to Genie Suite for Southeast Asia. Create content across Malay, Thai, Vietnamese, Filipino and more.',
  showcaseExamples: [
    { title: 'E-Commerce Campaign', input: 'Product catalog + brand tone', pipeline: 'Script > Voice > Video > Social', output: 'Campaigns in 5 SEA languages', industry: 'E-Commerce' },
  ],
};

const cjkConfig: RegionalConfig = {
  hero: {
    flag: '🌏',
    regionName: 'China, Japan & Korea',
    theme: 'CJK Intelligence',
    englishHeadline: 'AI Content Production Suite — CJK',
    englishSubheadline: 'Chinese, Japanese, Korean mastery.',
    nativeHeadline: 'AIコンテンツ制作スイート',
    nativeSubheadline: '日中韓コンテンツ制作',
  },
  stats: { languages: '8+', dialects: '15+', audienceReach: '1.6B+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'CJK-optimized' },
  differentiators: {
    heroBadge: 'CJK AI Content Powerhouse',
    firstToMarket: ['CJK character-perfect rendering', 'Anime/Manga style AI', 'K-beauty content styles'],
    capabilityDepth: ['Simplified & Traditional Chinese', 'Japanese keigo adaptation', 'Korean honorific system'],
    onlyHere: ['True CJK transcreation', 'East Asian cultural intelligence'],
  },
  languageShowcase: {
    languages: [
      { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
      { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
      { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
      { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'ja-JP': '数分で素晴らしいコンテンツを作成', 'zh-CN': '几分钟内创建精彩内容', 'ko-KR': '몇 분 만에 멋진 콘텐츠를 만들어 보세요' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | CJK',
    description: 'AI content production for China, Japan & Korea. Character-perfect CJK rendering.',
    keywords: ['CJK AI', 'Japanese content', 'Chinese AI', 'Korean production', 'CJK transcreation'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Welcome to Genie Suite for CJK markets. Master Chinese, Japanese and Korean content with character-perfect rendering.',
  showcaseExamples: [
    { title: 'Anime Marketing', input: 'Product brief + anime style', pipeline: 'Illustrate > Animate > Voice', output: 'Anime-style ads in CJK markets', industry: 'Entertainment' },
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
    englishHeadline: 'AI Content Production Suite — Pakistan',
    englishSubheadline: 'Urdu-native. 230M audience. RTL-ready.',
    nativeHeadline: 'AI مواد تیار کرنے کا پلیٹ فارم',
    nativeSubheadline: 'اردو میں مواد — پاکستان کے لیے',
    isRTL: true,
  },
  stats: { languages: '8+', dialects: '10+', audienceReach: '230M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'مفت شروع کریں', secondary: 'ڈیمو دیکھیں', badge: 'اردو آپٹمائزڈ' },
  differentiators: {
    heroBadge: 'Pakistan\'s AI Content Suite',
    firstToMarket: ['Urdu language AI', 'Nastaliq script rendering', 'Pakistan regional dialects'],
    capabilityDepth: ['Urdu, Punjabi, Sindhi, Pashto', 'RTL-native architecture', 'Pakistani cultural calendar'],
    onlyHere: ['True Urdu transcreation', 'Pakistani cultural intelligence'],
  },
  languageShowcase: {
    languages: [
      { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
      { code: 'pa-PK', name: 'Punjabi', nativeName: 'پنجابی', flag: '🇵🇰' },
      { code: 'sd-PK', name: 'Sindhi', nativeName: 'سنڌي', flag: '🇵🇰' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'ur-PK': 'منٹوں میں شاندار مواد بنائیں' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Pakistan',
    description: 'AI content production for Pakistan. Urdu-native, Nastaliq rendering, regional dialects.',
    keywords: ['Pakistan AI', 'Urdu content', 'Pakistani production', 'Nastaliq AI'],
    hreflang: 'ur',
    ogLocale: 'ur_PK',
  },
  welcomeScript: 'Genie Suite میں خوش آمدید۔ اردو، پنجابی، سندھی اور پشتو میں مواد بنائیں۔',
  showcaseExamples: [
    { title: 'EdTech Content', input: 'Curriculum brief', pipeline: 'Translate > Voice > Animate', output: 'Educational content in Urdu + regional', industry: 'Education' },
  ],
};

const bangladeshConfig: RegionalConfig = {
  hero: {
    flag: '🇧🇩',
    regionName: 'Bangladesh',
    theme: 'Bengali Intelligence',
    englishHeadline: 'AI Content Production Suite — Bangladesh',
    englishSubheadline: 'Bengali-native. 170M audience.',
    nativeHeadline: 'AI কন্টেন্ট প্রোডাকশন সুইট',
    nativeSubheadline: 'বাংলায় কন্টেন্ট — বাংলাদেশের জন্য',
  },
  stats: { languages: '3+', dialects: '8+', audienceReach: '170M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'ফ্রি শুরু করুন', secondary: 'ডেমো দেখুন', badge: 'বাংলা অপটিমাইজড' },
  differentiators: {
    heroBadge: 'Bangladesh\'s AI Content Suite',
    firstToMarket: ['Bengali language AI', 'Bangla script rendering', 'Bangladeshi dialects'],
    capabilityDepth: ['Standard Bengali + Chittagongian', 'Bangla calligraphy AI', 'Garment industry content'],
    onlyHere: ['True Bengali transcreation', 'Bangladeshi cultural depth'],
  },
  languageShowcase: {
    languages: [
      { code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
      { code: 'en-BD', name: 'English', nativeName: 'English', flag: '🇧🇩' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'bn-BD': 'মিনিটের মধ্যে অসাধারণ কন্টেন্ট তৈরি করুন' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Bangladesh',
    description: 'AI content production for Bangladesh. Bengali-native, culturally authentic.',
    keywords: ['Bangladesh AI', 'Bengali content', 'Bangla production', 'Dhaka AI'],
    hreflang: 'bn',
    ogLocale: 'bn_BD',
  },
  welcomeScript: 'Genie Suite-এ স্বাগতম। বাংলায় কন্টেন্ট তৈরি করুন — বাংলাদেশের জন্য।',
  showcaseExamples: [
    { title: 'Garment Marketing', input: 'Product catalog', pipeline: 'Script > Voice > Video', output: 'Bengali marketing content', industry: 'Textiles' },
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
    englishHeadline: 'AI Content Production Suite — Latin America',
    englishSubheadline: 'Spanish. Portuguese. Regional flair.',
    nativeHeadline: 'Suite de Produccion de Contenido IA',
    nativeSubheadline: 'Contenido autentico para toda Latinoamerica',
  },
  stats: { languages: '10+', dialects: '20+', audienceReach: '650M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Comienza Gratis', secondary: 'Ver Demo', badge: 'Sin tarjeta de credito' },
  differentiators: {
    heroBadge: 'LATAM\'s Creative AI Suite',
    firstToMarket: ['LatAm Spanish dialect engine', 'Brazilian Portuguese mastery', 'Telenovela-grade video AI'],
    capabilityDepth: ['Mexican, Argentine, Colombian Spanish', 'Brazilian vs European Portuguese', 'Regional humor adaptation'],
    onlyHere: ['True Latino transcreation', 'Regional cultural nuance'],
  },
  languageShowcase: {
    languages: [
      { code: 'es-MX', name: 'Spanish', nativeName: 'Espanol', flag: '🇲🇽' },
      { code: 'pt-BR', name: 'Portuguese', nativeName: 'Portugues', flag: '🇧🇷' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'es-MX': 'Crea contenido impresionante en minutos', 'pt-BR': 'Crie conteudo impressionante em minutos' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Latin America',
    description: 'AI content production for LATAM. Spanish and Portuguese with regional cultural adaptation.',
    keywords: ['LATAM AI', 'Spanish content', 'Brazilian Portuguese', 'Latin America transcreation'],
    hreflang: 'es',
    ogLocale: 'es_MX',
  },
  welcomeScript: 'Bienvenidos a Genie Suite para Latinoamerica. Contenido autentico en espanol y portugues con sabor regional.',
  showcaseExamples: [
    { title: 'Social Campaign', input: 'Brand brief + regional tone', pipeline: 'Script > Voice > Social', output: 'Campaigns for MX, BR, AR, CO', industry: 'Marketing' },
  ],
};

const caribbeanConfig: RegionalConfig = {
  hero: {
    flag: '🏝️',
    regionName: 'Caribbean',
    theme: 'Island Vibes',
    englishHeadline: 'AI Content Production Suite — Caribbean',
    englishSubheadline: 'English. Spanish. French. Creole.',
    nativeHeadline: 'AI Content Production Suite',
    nativeSubheadline: 'Content for the Caribbean islands',
  },
  stats: { languages: '8+', dialects: '15+', audienceReach: '45M+', industries: '50+', pipelines: '206' },
  cta: { primary: 'Start Free', secondary: 'Watch Demo', badge: 'Island-ready' },
  differentiators: {
    heroBadge: 'Caribbean\'s AI Content Suite',
    firstToMarket: ['Caribbean Creole support', 'Multi-colonial language handling', 'Tourism-optimized content'],
    capabilityDepth: ['English, Spanish, French, Dutch, Creole', 'Island-specific cultural adaptation', 'Tourism & hospitality focus'],
    onlyHere: ['Caribbean cultural transcreation', 'Island-specific tone adaptation'],
  },
  languageShowcase: {
    languages: [
      { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'es-MX', name: 'Spanish', nativeName: 'Espanol', flag: '🇨🇺' },
      { code: 'fr-FR', name: 'French', nativeName: 'Francais', flag: '🇭🇹' },
    ],
    demoPhrase: 'Create stunning content in minutes',
    demoTranslations: { 'es-MX': 'Crea contenido impresionante en minutos' },
  },
  seo: {
    title: 'Genie Suite - AI Content Production | Caribbean',
    description: 'AI content production for the Caribbean. English, Spanish, French, Creole support.',
    keywords: ['Caribbean AI', 'Creole content', 'island marketing', 'tourism AI'],
    hreflang: 'en',
    ogLocale: 'en_US',
  },
  welcomeScript: 'Welcome to Genie Suite for the Caribbean. Create vibrant content across English, Spanish, French, and Creole.',
  showcaseExamples: [
    { title: 'Tourism Campaign', input: 'Destination brief', pipeline: 'Script > Voice > Video > Social', output: 'Tourism content in 4 Caribbean languages', industry: 'Tourism' },
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
