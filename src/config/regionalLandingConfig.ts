/**
 * REGIONAL LANDING PAGE CONFIGURATION
 * 
 * Transcreated (NOT translated) content for each regional landing page.
 * Each region has:
 * - Native language headline + English fallback
 * - Region-specific industries, stats, and provider highlights
 * - Zone-based AI routing display
 * - Localized CTAs and social proof
 * - SEO metadata per region
 * 
 * IMPORTANT: Content is TRANSCREATED for cultural authenticity, not literally translated.
 * English is always available alongside native language content.
 */

export type RegionSlug = 'nam' | 'europe' | 'mena' | 'india' | 'africa' | 'apac' | 'latam' | 'caribbean';

export interface RegionalHero {
  nativeHeadline: string;
  englishHeadline: string;
  nativeSubheadline: string;
  englishSubheadline: string;
  theme: string;
  flag: string;
  regionName: string;
  isRTL?: boolean;
}

export interface RegionalStats {
  audienceReach: string;
  languages: string;
  dialects?: string;
  costSavings: string;
  localMetric: { label: string; value: string };
}

export interface RegionalProvider {
  name: string;
  task: string;
  reason: string;
}

export interface RegionalIndustry {
  name: string;
  icon: string;
  useCase: string;
}

export interface RegionalSEO {
  title: string;
  description: string;
  keywords: string[];
  hreflang: string;
  ogLocale: string;
}

export interface RegionalCTA {
  primary: string;
  secondary: string;
  signIn: string;
  freeCredits: string;
}

export interface RegionalDifferentiator {
  /** "First platform to..." claims */
  firstToMarket: string[];
  /** "Only platform with..." depth claims */
  capabilityDepth: string[];
  /** Badge text for hero, e.g. "First in Africa" */
  heroBadge: string;
}

export interface RegionalShowcaseExample {
  industry: string;
  icon: string;
  input: string;
  pipeline: string;
  output: string;
  languages: string;
  impact: string;
}

export interface RegionalLanguageShowcase {
  tabLabel: string;
  languages: Array<{
    code: string;
    name: string;
    nativeName: string;
    region: string;
    transcreation: string;
    literal: string;
    azureVoice: string;
  }>;
}

export interface RegionalConfig {
  slug: RegionSlug;
  hero: RegionalHero;
  stats: RegionalStats;
  zoneProviders: RegionalProvider[];
  industries: RegionalIndustry[];
  seo: RegionalSEO;
  cta: RegionalCTA;
  languageShowcase: RegionalLanguageShowcase;
  socialProof: string;
  comparisonSavings: string;
  differentiators: RegionalDifferentiator;
  showcaseExamples: RegionalShowcaseExample[];
  /** Cinematic welcome voiceover script — plays once on first visit */
  welcomeScript: string;
}

export const REGIONAL_CONFIGS: Record<RegionSlug, RegionalConfig> = {
  nam: {
    slug: 'nam',
    hero: {
      nativeHeadline: 'Mind to Media — For Every Industry',
      englishHeadline: 'Mind to Media — For Every Industry',
      nativeSubheadline: 'AI-powered content production across 50+ industries in 140+ languages',
      englishSubheadline: 'AI-powered content production across 50+ industries in 140+ languages',
      theme: 'Universal Creative Platform',
      flag: '🇺🇸',
      regionName: 'North America',
    },
    stats: {
      audienceReach: '350M+',
      languages: '70+',
      costSavings: '80%',
      localMetric: { label: 'Enterprise Clients', value: '500+' },
    },
    zoneProviders: [
      { name: 'Claude 4', task: 'LLM Transcreation', reason: 'Highest accuracy for English enterprise copy' },
      { name: 'Azure Neural', task: 'TTS & Lip-Sync', reason: 'Production-grade viseme data for video narration' },
      { name: 'Vertex Veo 3', task: 'Video Generation', reason: 'Cinematic quality at enterprise scale' },
      { name: 'ElevenLabs', task: 'Voice Cloning', reason: 'Custom brand voices for consistency' },
    ],
    industries: [
      { name: 'Healthcare', icon: '🏥', useCase: 'HIPAA-compliant patient education & HCP training videos' },
      { name: 'Finance', icon: '💰', useCase: 'Compliance-ready investor updates & market analysis' },
      { name: 'Technology', icon: '💻', useCase: 'Product demos, API walkthroughs, onboarding series' },
      { name: 'Retail', icon: '🛍️', useCase: 'Product showcases, seasonal campaigns, UGC-style ads' },
      { name: 'Education', icon: '📚', useCase: 'Course creation, LMS content, certification prep' },
    ],
    seo: {
      title: 'Genie Suite — AI Video Production Platform | Mind to Media',
      description: 'Transform ideas into professional videos with 206 AI pipelines, 12 providers, and 70+ languages. Start free with 50 credits.',
      keywords: ['AI video production', 'content creation platform', 'video marketing', 'AI-powered videos', 'enterprise video'],
      hreflang: 'en-US',
      ogLocale: 'en_US',
    },
    cta: {
      primary: 'Start Creating Free',
      secondary: 'See How It Works',
      signIn: 'Already have an account? Sign in →',
      freeCredits: '✓ 50 free credits • ✓ No credit card • ✓ 41 pipelines included',
    },
    languageShowcase: {
      tabLabel: 'English Variants',
      languages: [
        { code: 'en-US', name: 'US English', nativeName: 'English', region: 'United States', transcreation: 'Start creating awesome videos — it\'s free, no strings attached!', literal: 'Begin creating excellent video content at no cost', azureVoice: 'en-US-JennyNeural' },
        { code: 'en-GB', name: 'British English', nativeName: 'English', region: 'United Kingdom', transcreation: 'Get cracking with brilliant videos — completely free, no fuss!', literal: 'Begin creating excellent video content at no cost', azureVoice: 'en-GB-SoniaNeural' },
        { code: 'en-AU', name: 'Australian English', nativeName: 'English', region: 'Australia', transcreation: 'Have a go at making ripper videos — free as, no worries!', literal: 'Begin creating excellent video content at no cost', azureVoice: 'en-AU-NatashaNeural' },
      ],
    },
    socialProof: 'Trusted by content teams across 50+ industries in North America',
    comparisonSavings: 'Save $121/month vs Synthesia + ElevenLabs + Descript + DeepL + InVideo',
    differentiators: {
      firstToMarket: [
        'First platform to unify 19 AI providers into one production pipeline',
        'First to offer end-to-end Mind-to-Media workflow — Idea → Script → Visual → Voice → Video → Translate → Publish',
      ],
      capabilityDepth: [
        'Only platform with auto-routed AI across 19 providers per task',
        'Only platform producing enterprise video in 140+ languages from a single prompt',
        'Only platform combining AI avatars, lip-sync, 3D, and transcreation in one pipeline',
      ],
      heroBadge: '19 AI Providers. One Platform.',
    },
    showcaseExamples: [
      { industry: 'Healthcare', icon: '🏥', input: 'HIPAA training document (12 pages)', pipeline: 'Mind → Spark → Vibe → Cast → Hub', output: '8-module video course with AI presenter + 3 language dubs', languages: 'English, Spanish, Mandarin', impact: '85% faster than traditional production' },
      { industry: 'Finance', icon: '💰', input: 'Quarterly earnings summary', pipeline: 'Spark → Deck → Vibe → Cast', output: 'Investor update video + branded slide deck + audio summary', languages: 'English', impact: '4 hours vs 2 weeks traditional' },
      { industry: 'Technology', icon: '💻', input: 'API documentation + changelog', pipeline: 'Mind → Spark → Vibe → Hub', output: 'Developer walkthrough video + localized release notes', languages: 'English, Japanese, German', impact: '90% cost reduction vs agency' },
      { industry: 'Retail', icon: '🛍️', input: 'Product photos + feature list', pipeline: 'Spark → Vibe → Cast → Hub', output: 'Social media ad series (9:16 + 16:9) in 5 languages', languages: 'English, Spanish, French, Mandarin, Hindi', impact: '50 ads/day vs 5/week manual' },
    ],
    welcomeScript: "One idea. That's all it takes. Spark turns it into a story. Mind knows exactly who needs to hear it. Vibe makes it cinematic. Hub carries it across 140 languages — not translated, transcreated. Deck makes boardrooms believe. Cast takes it everywhere. And Ask Genie? Always one step ahead. This is Genie Suite. Seven products. 206 pipelines. 19 AI engines. One platform — and the only one you'll ever need.",
  },

  europe: {
    slug: 'europe',
    hero: {
      nativeHeadline: 'Inhalte skalieren — für jede Branche',
      englishHeadline: 'Scale Content — For Any Industry',
      nativeSubheadline: 'KI-gestützte Produktion in 25+ Sprachen für alle Branchen — von Fertigung bis Pharma',
      englishSubheadline: 'AI-powered production in 25+ languages for every industry — Manufacturing to Pharma',
      theme: 'Industry 4.0',
      flag: '🇪🇺',
      regionName: 'Europe',
    },
    stats: {
      audienceReach: '450M+',
      languages: '25+',
      costSavings: '75%',
      localMetric: { label: 'EU Languages', value: '24' },
    },
    zoneProviders: [
      { name: 'Claude 4', task: 'LLM Transcreation', reason: 'Superior multilingual European copy with GDPR compliance' },
      { name: 'Azure Neural', task: 'TTS & Lip-Sync', reason: 'Native prosody for German, French, Spanish, Italian, Dutch' },
      { name: 'DeepL', task: 'Translation', reason: 'Highest accuracy for European language pairs' },
      { name: 'Vertex Veo 3', task: 'Video Generation', reason: 'Enterprise-grade visual quality' },
    ],
    industries: [
      { name: 'Manufacturing', icon: '🏭', useCase: 'Industry 4.0 training, safety compliance, multilingual SOPs' },
      { name: 'Finance', icon: '🏦', useCase: 'MiFID II-compliant reporting, investor communications' },
      { name: 'Automotive', icon: '🚗', useCase: 'Product launches, dealer training, after-sales content' },
      { name: 'Pharma', icon: '💊', useCase: 'Clinical trial communications, HCP education in 24 EU languages' },
      { name: 'Professional Services', icon: '📊', useCase: 'Thought leadership, client presentations, ESG reporting' },
    ],
    seo: {
      title: 'Genie Suite — KI-Videoproduktion für Europa | 25+ Sprachen',
      description: 'Erstellen Sie professionelle Videos in 25+ europäischen Sprachen mit KI-gestützter Transkreation. DSGVO-konform.',
      keywords: ['KI Video Produktion', 'multilingual video', 'European content', 'GDPR compliant', 'Industry 4.0'],
      hreflang: 'de',
      ogLocale: 'de_DE',
    },
    cta: {
      primary: 'Kostenlos starten',
      secondary: 'Demo ansehen',
      signIn: 'Bereits ein Konto? Anmelden →',
      freeCredits: '✓ 50 kostenlose Credits • ✓ Keine Kreditkarte • ✓ DSGVO-konform',
    },
    languageShowcase: {
      tabLabel: 'European Languages',
      languages: [
        { code: 'de-DE', name: 'German', nativeName: 'Deutsch', region: 'Germany', transcreation: 'Leg los mit genialen Videos — kostenlos und ohne Haken!', literal: 'Beginnen Sie mit der Erstellung hervorragender Videoinhalte', azureVoice: 'de-DE-KatjaNeural' },
        { code: 'fr-FR', name: 'French', nativeName: 'Français', region: 'France', transcreation: 'Lancez-vous dans la création vidéo — c\'est gratuit et sans engagement !', literal: 'Commencez à créer d\'excellents contenus vidéo', azureVoice: 'fr-FR-DeniseNeural' },
        { code: 'es-ES', name: 'Spanish', nativeName: 'Español', region: 'Spain', transcreation: '¡Empieza a crear vídeos increíbles — gratis y sin compromiso!', literal: 'Comience a crear contenido de video excelente', azureVoice: 'es-ES-ElviraNeural' },
        { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', region: 'Italy', transcreation: 'Inizia a creare video fantastici — è gratis, senza impegno!', literal: 'Inizia a creare contenuti video eccellenti', azureVoice: 'it-IT-ElsaNeural' },
        { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', region: 'Netherlands', transcreation: 'Begin met het maken van geweldige video\'s — gratis en vrijblijvend!', literal: 'Begin met het maken van uitstekende video-inhoud', azureVoice: 'nl-NL-ColetteNeural' },
      ],
    },
    socialProof: 'Vertrauen von Teams aus allen Branchen in der gesamten EU',
    comparisonSavings: 'Sparen Sie 121€/Monat im Vergleich zu Synthesia + DeepL + Descript + InVideo',
    differentiators: {
      firstToMarket: [
        'First platform with native transcreation across all 24 EU official languages',
        'First to offer GDPR-compliant AI video production with EU data residency',
      ],
      capabilityDepth: [
        'Only platform with DeepL-powered translation + cultural transcreation in one pipeline',
        'Only platform supporting all 24 EU languages with native TTS lip-sync',
        'Only platform combining Industry 4.0 training content with multilingual distribution',
      ],
      heroBadge: '24 EU Languages. GDPR-Compliant.',
    },
    showcaseExamples: [
      { industry: 'Manufacturing', icon: '🏭', input: 'Safety compliance manual (German)', pipeline: 'Mind → Spark → Vibe → Hub → Cast', output: 'Interactive safety training in 8 EU languages with AI presenter', languages: 'DE, FR, ES, IT, PL, NL, PT, RO', impact: 'Single source → 8 markets in hours' },
      { industry: 'Automotive', icon: '🚗', input: 'New model feature specs', pipeline: 'Spark → Deck → Vibe → Cast → Hub', output: 'Dealer training video + launch event deck in 6 languages', languages: 'DE, FR, IT, ES, NL, EN', impact: 'Pan-European launch in 48 hours' },
      { industry: 'Pharma', icon: '💊', input: 'Clinical trial results summary', pipeline: 'Mind → Spark → Vibe → Cast', output: 'HCP education video with compliant disclaimers in 12 languages', languages: 'All 24 EU + English', impact: 'Regulatory-ready across EU markets' },
      { industry: 'Professional Services', icon: '📊', input: 'ESG annual report', pipeline: 'Spark → Deck → Vibe → Hub', output: 'Stakeholder video report + multilingual executive summary', languages: 'EN, DE, FR', impact: '€50K saved vs external agency' },
    ],
    welcomeScript: "Every great brand has a European story to tell — in French, German, Spanish, and thirty more. Spark finds your words. Mind reads the room. Vibe makes it unforgettable. Hub doesn't translate — it transcreates, preserving every nuance from Lisbon to Helsinki. Deck wins the pitch. Cast fills the feed. Ask Genie keeps it effortless. Genie Suite. One platform. Every European market. No one else even comes close.",
  },

  mena: {
    slug: 'mena',
    hero: {
      nativeHeadline: 'محتوى AI لكل صناعة — رؤية 2030',
      englishHeadline: 'AI Content for Every Industry — Vision 2030',
      nativeSubheadline: 'إنتاج محتوى بالذكاء الاصطناعي بـ 7 لهجات عربية لجميع القطاعات',
      englishSubheadline: 'AI content production in 7 Arabic dialects — Government, Finance, Energy & 50+ industries',
      theme: 'Vision 2030',
      flag: '🇦🇪',
      regionName: 'Middle East & North Africa',
      isRTL: true,
    },
    stats: {
      audienceReach: '400M+',
      dialects: '7',
      languages: '15+',
      costSavings: '85%',
      localMetric: { label: 'Arabic Dialects', value: '7' },
    },
    zoneProviders: [
      { name: 'Qwen-Max', task: 'LLM Transcreation', reason: 'Superior Arabic dialect understanding — Saudi, Egyptian, Gulf, Levantine, Maghrebi, Iraqi, MSA' },
      { name: 'Azure Neural', task: 'TTS & Lip-Sync', reason: '7 dialect-specific voices with native prosody and viseme data' },
      { name: 'Vertex Veo 3', task: 'Video Generation', reason: 'Enterprise-grade visual quality for Arabic content' },
      { name: 'DeepL', task: 'Translation', reason: 'High-accuracy Arabic ↔ English translation' },
    ],
    industries: [
      { name: 'Government', icon: '🏛️', useCase: 'Vision 2030 communications, citizen engagement, e-governance' },
      { name: 'Finance', icon: '🏦', useCase: 'Islamic banking content, Sharia-compliant reporting in local dialects' },
      { name: 'Oil & Energy', icon: '⛽', useCase: 'Safety training, ESG reporting, stakeholder communications' },
      { name: 'Real Estate', icon: '🏗️', useCase: 'Property showcases, mega-project marketing, investor decks' },
      { name: 'Tourism', icon: '✈️', useCase: 'Destination marketing, cultural heritage content, hotel showcases' },
    ],
    seo: {
      title: 'جيني سويت — منصة إنتاج الفيديو بالذكاء الاصطناعي | 7 لهجات عربية',
      description: 'إنشاء فيديوهات احترافية بـ 7 لهجات عربية مع تحويل ثقافي ذكي. دعم كامل للعربية من اليمين لليسار.',
      keywords: ['إنتاج فيديو', 'ذكاء اصطناعي', 'لهجات عربية', 'رؤية 2030', 'محتوى عربي'],
      hreflang: 'ar',
      ogLocale: 'ar_SA',
    },
    cta: {
      primary: 'ابدأ مجاناً',
      secondary: 'شاهد العرض',
      signIn: 'لديك حساب بالفعل؟ سجل دخول ←',
      freeCredits: '✓ 50 رصيد مجاني • ✓ بدون بطاقة ائتمان • ✓ دعم كامل للعربية',
    },
    languageShowcase: {
      tabLabel: 'Arabic Dialects',
      languages: [
        { code: 'ar-SA', name: 'Saudi', nativeName: 'سعودي', region: 'Saudi Arabia', transcreation: 'ابدأ تسوي فيديوهات روعة — مجاناً وبدون أي التزام!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة مجاناً', azureVoice: 'ar-SA-HamedNeural' },
        { code: 'ar-EG', name: 'Egyptian', nativeName: 'مصري', region: 'Egypt', transcreation: 'ابدأ اعمل فيديوهات جامدة — ببلاش وبدون أي حاجة!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة مجاناً', azureVoice: 'ar-EG-ShakirNeural' },
        { code: 'ar-AE', name: 'Gulf', nativeName: 'خليجي', region: 'UAE/Gulf', transcreation: 'ابدا سوّي فيديوهات حلوة — مجان وبدون شي!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة مجاناً', azureVoice: 'ar-AE-HamdanNeural' },
        { code: 'ar-LB', name: 'Levantine', nativeName: 'لبناني', region: 'Lebanon/Syria', transcreation: 'بلّش اعمل فيديوهات كتير حلوة — مجاناً وما في شي!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة مجاناً', azureVoice: 'ar-LB-LaylaNeural' },
        { code: 'ar-MA', name: 'Maghrebi', nativeName: 'مغربي', region: 'Morocco', transcreation: 'بدا دير فيديوهات زوينين — بلا ما تخلص والو!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة مجاناً', azureVoice: 'ar-MA-JamalNeural' },
        { code: 'ar-IQ', name: 'Iraqi', nativeName: 'عراقي', region: 'Iraq', transcreation: 'ابدي سوّي فيديوهات روعة — مجاناً وبدون أي شي!', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة مجاناً', azureVoice: 'ar-IQ-BasselNeural' },
        { code: 'ar-MSA', name: 'MSA', nativeName: 'فصحى', region: 'Formal/News', transcreation: 'ابدأ بإنشاء مقاطع فيديو احترافية — مجاناً وبدون أي التزام', literal: 'ابدأ بإنشاء مقاطع فيديو رائعة مجاناً', azureVoice: 'ar-SA-ZariyahNeural' },
      ],
    },
    socialProof: 'موثوق به من قبل الجهات الحكومية والمؤسسات المالية في الخليج',
    comparisonSavings: 'وفر 121$/شهر مقارنة بـ Synthesia + ElevenLabs + DeepL + InVideo',
    differentiators: {
      firstToMarket: [
        'First platform to support 7 Arabic dialects — Saudi, Egyptian, Gulf, Levantine, Maghrebi, Iraqi, MSA',
        'First AI video platform with full RTL production pipeline',
        'First to offer dialect-specific lip-sync for Arabic content',
      ],
      capabilityDepth: [
        'Only platform with Qwen-Max for native Arabic transcreation — not just translation',
        'Only platform distinguishing Saudi from Egyptian from Gulf Arabic in TTS',
        'Only platform aligning content with Vision 2030 digital transformation standards',
      ],
      heroBadge: '🏆 First Ever: 7 Arabic Dialects',
    },
    showcaseExamples: [
      { industry: 'Government', icon: '🏛️', input: 'Vision 2030 initiative brief', pipeline: 'Mind → Spark → Vibe → Cast → Hub', output: 'Citizen engagement video in 7 Arabic dialects + English + Urdu', languages: 'SA, EG, Gulf, Levantine, Maghrebi, Iraqi, MSA', impact: 'First-ever multi-dialect government communication' },
      { industry: 'Finance', icon: '🏦', input: 'Islamic banking product terms', pipeline: 'Spark → Vibe → Cast', output: 'Sharia-compliant explainer video with dialect-aware narration', languages: 'MSA + Saudi + Egyptian', impact: 'Culturally authentic financial content' },
      { industry: 'Real Estate', icon: '🏗️', input: 'NEOM mega-project overview', pipeline: 'Spark → Deck → Vibe → Cast → Hub', output: 'Investor pitch deck + showreel in Arabic + English + Mandarin', languages: 'AR-SA, EN, ZH', impact: 'Global investor reach from single brief' },
      { industry: 'Tourism', icon: '✈️', input: 'Red Sea resort features', pipeline: 'Spark → Vibe → Cast → Hub', output: 'Destination marketing video in 5 dialects + 4 international languages', languages: '5 Arabic + EN, FR, DE, ZH', impact: 'No competitor can do this' },
    ],
    welcomeScript: "Your story deserves to be heard in every dialect — Gulf, Levantine, Egyptian, Maghrebi, and beyond. Spark writes with cultural intelligence. Mind understands your audience from Riyadh to Casablanca. Vibe produces world-class visuals. Hub transcreates across seven Arabic dialects with precision no other platform can match. Deck commands the room. Cast scales your voice. Ask Genie never sleeps. Genie Suite — we don't just speak Arabic. We think in it.",
  },

  india: {
    slug: 'india',
    hero: {
      nativeHeadline: 'हर उद्योग के लिए AI कंटेंट — भारत में बनाया गया',
      englishHeadline: 'AI Content for Every Industry — Built for India',
      nativeSubheadline: '50+ उद्योगों के लिए 11 भारतीय भाषाओं में वीडियो प्रोडक्शन',
      englishSubheadline: 'Video production in 11 Indian languages for 50+ industries — Healthcare to EdTech & beyond',
      theme: 'Digital India',
      flag: '🇮🇳',
      regionName: 'India',
    },
    stats: {
      audienceReach: '1.4B+',
      languages: '11',
      costSavings: '90%',
      localMetric: { label: 'Indian Dialects', value: '11' },
    },
    zoneProviders: [
      { name: 'Gemini 3 Pro', task: 'LLM Transcreation', reason: 'Native support for 11 Indian languages including Telugu, Marathi, Kannada' },
      { name: 'Azure Neural', task: 'TTS & Lip-Sync', reason: 'High-precision viseme data for Indian language lip-sync' },
      { name: 'Vertex Veo 3', task: 'Video Generation', reason: 'Cinematic quality for Bollywood-style production' },
      { name: 'Alibaba Wan 2.2', task: 'Avatar Generation', reason: 'Photorealistic Indian avatar representations' },
    ],
    industries: [
      { name: 'Healthcare', icon: '🏥', useCase: 'Patient education in regional languages, Ayushman Bharat compliance' },
      { name: 'EdTech', icon: '📱', useCase: 'Course creation in 11 languages, vernacular learning content' },
      { name: 'Finance', icon: '💰', useCase: 'UPI onboarding videos, mutual fund explainers in local dialects' },
      { name: 'FMCG', icon: '🧴', useCase: 'Regional marketing campaigns, influencer-style product demos' },
      { name: 'Government', icon: '🏛️', useCase: 'Digital India communications, scheme explainers in all languages' },
    ],
    seo: {
      title: 'Genie Suite — AI वीडियो प्रोडक्शन प्लेटफॉर्म | 11 भारतीय भाषाएं',
      description: '11 भारतीय भाषाओं में प्रोफेशनल वीडियो बनाएं — हिंदी, तमिल, तेलुगु, बंगाली, मराठी और बहुत कुछ। AI-पावर्ड ट्रांसक्रिएशन।',
      keywords: ['AI video India', 'Hindi video production', 'Indian languages', 'Digital India', 'regional content'],
      hreflang: 'hi',
      ogLocale: 'hi_IN',
    },
    cta: {
      primary: 'फ्री में शुरू करें',
      secondary: 'डेमो देखें',
      signIn: 'पहले से अकाउंट है? साइन इन करें →',
      freeCredits: '✓ 50 फ्री क्रेडिट्स • ✓ कोई क्रेडिट कार्ड नहीं • ✓ 11 भारतीय भाषाएं',
    },
    languageShowcase: {
      tabLabel: 'Indian Languages',
      languages: [
        { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', region: 'North India', transcreation: 'AI course creator फ्री में ट्राई करो! एकदम मस्त है!', literal: 'कृपया हमारे AI-संचालित पाठ्यक्रम निर्माता को मुफ्त में आज़माएं', azureVoice: 'hi-IN-MadhurNeural' },
        { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu', transcreation: 'AI course creator free-ஆ try பண்ணு! சூப்பரா இருக்கு!', literal: 'எங்கள் AI-இயக்கப்படும் பாடநெறி உருவாக்கியை இலவசமாக முயற்சிக்கவும்', azureVoice: 'ta-IN-ValluvarNeural' },
        { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra/Telangana', transcreation: 'AI course creator free-గా try చెయ్యి! చాలా బాగుంది!', literal: 'దయచేసి మా AI-ఆధారిత కోర్సు సృష్టికర్తను ఉచితంగా ప్రయత్నించండి', azureVoice: 'te-IN-ShrutiNeural' },
        { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal', transcreation: 'AI course creator free-তে try করো! একদম ঝাক্কাস!', literal: 'অনুগ্রহ করে আমাদের AI-চালিত কোর্স নির্মাতা বিনামূল্যে চেষ্টা করুন', azureVoice: 'bn-IN-BashkarNeural' },
        { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra', transcreation: 'AI course creator free मध्ये try करा! एकदम भारी आहे!', literal: 'कृपया आमचे AI-संचालित कोर्स निर्माता विनामूल्य वापरून पहा', azureVoice: 'mr-IN-AarohiNeural' },
        { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat', transcreation: 'AI course creator free માં try કરો! એકદમ મસ્ત છે!', literal: 'કૃપા કરીને અમારા AI-સંચાલિત કોર્સ નિર્માતાને મફતમાં અજમાવો', azureVoice: 'gu-IN-DhwaniNeural' },
      ],
    },
    socialProof: 'भारत के अग्रणी EdTech और FMCG ब्रांड्स द्वारा भरोसेमंद',
    comparisonSavings: '₹10,000/माह बचाएं — Synthesia + ElevenLabs + DeepL + InVideo की तुलना में',
    differentiators: {
      firstToMarket: [
        'First AI video platform supporting 11 Indian languages with native TTS + lip-sync',
        'First to offer Hindi-English code-switching in AI-generated video narration',
        'First platform with Gemini 3 Pro transcreation for Indian vernacular content',
      ],
      capabilityDepth: [
        'Only platform with native TTS for Telugu, Marathi, Kannada, Gujarati — not just Hindi',
        'Only platform understanding Hinglish and regional code-mixing patterns',
        'Only platform combining Bollywood-style video generation with 11-language distribution',
      ],
      heroBadge: '🏆 First: 11 Indian Languages + Lip-Sync',
    },
    showcaseExamples: [
      { industry: 'EdTech', icon: '📱', input: 'NCERT Chapter 5 — Physics', pipeline: 'Mind → Spark → Vibe → Cast → Hub', output: 'Animated lesson video with AI teacher in 11 Indian languages', languages: 'HI, TA, TE, BN, MR, GU, KN, ML, PA, OR, AS', impact: 'First-ever 11-language course from single source' },
      { industry: 'Healthcare', icon: '🏥', input: 'Ayushman Bharat scheme guidelines', pipeline: 'Spark → Vibe → Cast', output: 'Patient education video in local dialects with AI avatar', languages: 'Hindi, Tamil, Telugu, Bengali', impact: 'Reach 1B+ citizens in their language' },
      { industry: 'FMCG', icon: '🧴', input: 'Product launch brief for shampoo', pipeline: 'Spark → Vibe → Cast → Hub', output: 'Regional ad campaign (30s) × 11 languages with local influencer style', languages: '11 Indian languages', impact: '₹5L saved vs dubbing studio per campaign' },
      { industry: 'Government', icon: '🏛️', input: 'Digital India initiative update', pipeline: 'Mind → Spark → Deck → Vibe → Cast', output: 'Citizen awareness video + infographic deck in all scheduled languages', languages: 'Hindi + 10 regional', impact: 'Pan-India reach from single brief' },
    ],
    welcomeScript: "A billion stories. Twenty-two languages. One platform that gets it. Spark writes in Hindi, Tamil, Telugu, Bengali — natively, not as an afterthought. Mind knows the difference between Mumbai and Chennai. Vibe produces at Bollywood scale. Hub transcreates — because translation isn't enough for India. Deck owns the boardroom. Cast fills every screen. Ask Genie connects it all. Genie Suite. Made for India's ambition.",
  },

  africa: {
    slug: 'africa',
    hero: {
      nativeHeadline: 'Anza Kuunda Yaliyomo kwa Kila Sekta',
      englishHeadline: 'Build Content for Every African Industry',
      nativeSubheadline: 'AI-powered video in Swahili, Yoruba, Hausa, Zulu, Amharic & more — for any sector',
      englishSubheadline: 'AI-powered video in 10+ African languages — Agriculture, Fintech, Healthcare & 50+ more',
      theme: 'Africa Rising',
      flag: '🌍',
      regionName: 'Africa',
    },
    stats: {
      audienceReach: '1.4B+',
      languages: '10+',
      costSavings: '90%',
      localMetric: { label: 'African Languages', value: '10' },
    },
    zoneProviders: [
      { name: 'Gemini 3 Pro', task: 'LLM Transcreation', reason: 'Native support for Swahili, Yoruba, and emerging African languages' },
      { name: 'Azure Neural', task: 'TTS & Lip-Sync', reason: 'African language voices — Swahili, Zulu, Afrikaans, Amharic' },
      { name: 'Vertex Veo 3', task: 'Video Generation', reason: 'Culturally appropriate visual content generation' },
      { name: 'Azure Translator', task: 'Translation', reason: 'Support for African language pairs unavailable on DeepL' },
    ],
    industries: [
      { name: 'Agriculture', icon: '🌾', useCase: 'Farmer education in local languages, crop management guides' },
      { name: 'Fintech', icon: '📱', useCase: 'Mobile money onboarding, financial literacy in vernacular' },
      { name: 'Healthcare', icon: '🏥', useCase: 'Public health campaigns, vaccine education, community health' },
      { name: 'Education', icon: '📚', useCase: 'Vernacular learning content, teacher training, digital literacy' },
      { name: 'NGO', icon: '🤝', useCase: 'Impact reports, donor communications, community engagement' },
    ],
    seo: {
      title: 'Genie Suite — AI Video Production for Africa | 10+ Languages',
      description: 'Create professional videos in Swahili, Yoruba, Hausa, Zulu, Amharic and more. AI-powered transcreation for authentic African content.',
      keywords: ['AI video Africa', 'Swahili content', 'African languages', 'Africa Rising', 'vernacular video'],
      hreflang: 'sw',
      ogLocale: 'sw_KE',
    },
    cta: {
      primary: 'Anza Bure',
      secondary: 'Tazama Demo',
      signIn: 'Already have an account? Sign in →',
      freeCredits: '✓ 50 free credits • ✓ No credit card • ✓ 10+ African languages',
    },
    languageShowcase: {
      tabLabel: 'African Languages',
      languages: [
        { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', region: 'Kenya/Tanzania', transcreation: 'Anza kuunda video za kushangaza — bure kabisa!', literal: 'Begin creating excellent video content for free', azureVoice: 'sw-KE-RafikiNeural' },
        { code: 'yo-NG', name: 'Yoruba', nativeName: 'Yorùbá', region: 'Nigeria', transcreation: 'Bẹ̀rẹ̀ ṣíṣe fidio to dára — ọfẹ́ ni!', literal: 'Begin creating excellent video content for free', azureVoice: 'yo-NG-AbiodunNeural' },
        { code: 'zu-ZA', name: 'Zulu', nativeName: 'isiZulu', region: 'South Africa', transcreation: 'Qala ukwenza amavidiyo amahle — mahhala!', literal: 'Begin creating excellent video content for free', azureVoice: 'zu-ZA-ThandoNeural' },
        { code: 'am-ET', name: 'Amharic', nativeName: 'አማርኛ', region: 'Ethiopia', transcreation: 'አስደናቂ ቪዲዮዎችን መፍጠር ጀምር — ነጻ!', literal: 'Begin creating excellent video content for free', azureVoice: 'am-ET-MekdesNeural' },
        { code: 'ha-NG', name: 'Hausa', nativeName: 'Hausa', region: 'Nigeria', transcreation: 'Fara yin bidiyo mai kyau — ba tare da biyan kuɗi ba!', literal: 'Begin creating excellent video content for free', azureVoice: 'ha-NG-AbubakarNeural' },
      ],
    },
    socialProof: 'Empowering African creators, educators, and development organizations',
    comparisonSavings: 'Save $121/month vs Synthesia + ElevenLabs + DeepL + InVideo',
    differentiators: {
      firstToMarket: [
        'First AI video platform with native Swahili, Yoruba, and Amharic TTS + lip-sync',
        'First platform to offer AI transcreation in Hausa, Zulu, and Igbo',
        'First AI content platform designed for African mobile-first audiences',
      ],
      capabilityDepth: [
        'Only platform with African language TTS where no competitor has any support',
        'Only platform combining agricultural extension content with vernacular AI narration',
        'Only platform supporting Afrobeat-style visuals with culturally appropriate avatar generation',
      ],
      heroBadge: '🏆 First Ever: AI Video in African Languages',
    },
    showcaseExamples: [
      { industry: 'Agriculture', icon: '🌾', input: 'Crop rotation best practices guide', pipeline: 'Mind → Spark → Vibe → Cast', output: 'Farmer education video with AI presenter in Swahili + Yoruba + Hausa', languages: 'SW, YO, HA, EN', impact: 'Zero competitors offer this — first ever' },
      { industry: 'Fintech', icon: '📱', input: 'M-Pesa onboarding flow', pipeline: 'Spark → Vibe → Cast → Hub', output: 'Mobile money tutorial in 5 African languages with local context', languages: 'SW, AM, ZU, HA, EN', impact: 'Reach 500M+ unbanked in their language' },
      { industry: 'Healthcare', icon: '🏥', input: 'Malaria prevention guidelines (WHO)', pipeline: 'Mind → Spark → Vibe → Cast', output: 'Community health video with AI avatar in local languages', languages: 'Swahili, Yoruba, Amharic, Zulu', impact: 'First AI health content in these languages' },
      { industry: 'NGO', icon: '🤝', input: 'Climate adaptation report', pipeline: 'Spark → Deck → Vibe → Cast → Hub', output: 'Impact video + donor deck in English + 4 African languages', languages: 'EN, SW, YO, AM, HA', impact: 'Donor engagement + community reach' },
    ],
    welcomeScript: "Fifty-four nations. Two thousand languages. Infinite stories waiting to be told. Spark captures your narrative — in Swahili, Yoruba, Zulu, Amharic, and beyond. Mind understands audiences from Lagos to Nairobi to Johannesburg. Vibe produces at world-class standard. Hub transcreates with cultural depth, not surface-level translation. Deck powers your pitch. Cast broadcasts to the continent. Ask Genie never misses a beat. Genie Suite. Africa's stories deserve Africa's platform.",
  },

  apac: {
    slug: 'apac',
    hero: {
      nativeHeadline: 'あらゆる業界のコンテンツをAIで革新',
      englishHeadline: 'AI Content for Every APAC Industry',
      nativeSubheadline: 'CJK+東南アジア15言語対応 — テック、EC、観光、自動車などすべての業界に',
      englishSubheadline: 'Full CJK + SEA support in 15 languages — for Tech, E-Commerce, Tourism & 50+ industries',
      theme: 'Digital Innovation',
      flag: '🇯🇵',
      regionName: 'Asia Pacific',
    },
    stats: {
      audienceReach: '4.7B+',
      languages: '15+',
      costSavings: '80%',
      localMetric: { label: 'CJK + SEA Languages', value: '15' },
    },
    zoneProviders: [
      { name: 'Qwen-Max', task: 'LLM Transcreation', reason: 'Native CJK understanding with cultural nuance for Chinese, Japanese, Korean' },
      { name: 'Azure Neural', task: 'TTS & Lip-Sync', reason: 'Native CJK prosody with proper tonal rendering' },
      { name: 'Alibaba Wan 2.2', task: 'Avatar Generation', reason: 'Culturally appropriate East Asian avatar representations' },
      { name: 'Qwen3-TTS', task: 'Voice Synthesis', reason: 'Alibaba\'s Qwen3-TTS-Flash for authentic CJK speech' },
    ],
    industries: [
      { name: 'Technology', icon: '💻', useCase: 'Product launches for APAC markets, localized developer content' },
      { name: 'E-Commerce', icon: '🛒', useCase: 'Product videos for Lazada, Shopee, Tokopedia in local languages' },
      { name: 'Gaming', icon: '🎮', useCase: 'Game trailers, community content in CJK languages' },
      { name: 'Automotive', icon: '🚗', useCase: 'Showroom content, launch events for ASEAN markets' },
      { name: 'Tourism', icon: '✈️', useCase: 'Destination marketing for Japan, Thailand, Indonesia' },
    ],
    seo: {
      title: 'Genie Suite — AI動画制作プラットフォーム | CJK完全対応',
      description: '中国語、日本語、韓国語、東南アジア言語でプロ品質の動画を制作。AIトランスクリエーション対応。',
      keywords: ['AI video APAC', 'CJK content', 'Japanese video', 'Chinese content', 'Korean video production'],
      hreflang: 'ja',
      ogLocale: 'ja_JP',
    },
    cta: {
      primary: '無料で始める',
      secondary: 'デモを見る',
      signIn: 'アカウントをお持ちですか？ログイン →',
      freeCredits: '✓ 50クレジット無料 • ✓ クレジットカード不要 • ✓ CJK完全対応',
    },
    languageShowcase: {
      tabLabel: 'CJK & SEA Languages',
      languages: [
        { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', region: 'Japan', transcreation: 'AIで動画制作を始めよう — 無料で、すぐに使えます！', literal: '当社のAI動画制作ツールを無料でお試しください', azureVoice: 'ja-JP-NanamiNeural' },
        { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', region: 'China', transcreation: '用AI来创作精彩视频吧——完全免费，立即上手！', literal: '请免费试用我们的AI视频制作工具', azureVoice: 'zh-CN-XiaoxiaoNeural' },
        { code: 'ko-KR', name: 'Korean', nativeName: '한국어', region: 'South Korea', transcreation: 'AI로 멋진 영상 만들어 보세요 — 무료로 바로 시작!', literal: '당사의 AI 비디오 제작 도구를 무료로 사용해 보세요', azureVoice: 'ko-KR-SunHiNeural' },
        { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', region: 'Thailand', transcreation: 'เริ่มสร้างวิดีโอสุดเจ๋งด้วย AI — ฟรี ไม่มีข้อผูกมัด!', literal: 'กรุณาลองใช้เครื่องมือสร้างวิดีโอ AI ของเราฟรี', azureVoice: 'th-TH-PremwadeeNeural' },
        { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Vietnam', transcreation: 'Bắt đầu tạo video tuyệt vời với AI — miễn phí hoàn toàn!', literal: 'Vui lòng dùng thử công cụ tạo video AI của chúng tôi miễn phí', azureVoice: 'vi-VN-HoaiMyNeural' },
        { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Indonesia', transcreation: 'Mulai bikin video keren pakai AI — gratis, tanpa ribet!', literal: 'Silakan coba alat pembuat video AI kami secara gratis', azureVoice: 'id-ID-ArdiNeural' },
      ],
    },
    socialProof: 'アジア太平洋地域のテック企業とeコマースブランドに選ばれています',
    comparisonSavings: '月額¥18,000節約 — Synthesia + ElevenLabs + DeepL + InVideo対比',
    differentiators: {
      firstToMarket: [
        'First platform with Qwen-Max for native CJK transcreation — not just translation',
        'First to combine Qwen3-TTS (Alibaba) + Azure Neural for dual Chinese TTS pipeline',
        'First AI video platform supporting full CJK + 6 SEA languages in one workflow',
      ],
      capabilityDepth: [
        'Only platform with proper tonal rendering for Mandarin, Cantonese, Japanese, Korean TTS',
        'Only platform with culturally appropriate East Asian avatar generation via Alibaba Wan 2.2',
        'Only platform supporting Indonesian, Thai, Vietnamese lip-sync alongside CJK',
      ],
      heroBadge: 'CJK + 6 SEA Languages. Native Quality.',
    },
    showcaseExamples: [
      { industry: 'E-Commerce', icon: '🛒', input: 'Product listing (Shopee/Lazada format)', pipeline: 'Spark → Vibe → Cast → Hub', output: 'Product demo video for 6 SEA markets with local narration', languages: 'ZH, JA, KO, TH, VI, ID', impact: 'One listing → 6 markets instantly' },
      { industry: 'Gaming', icon: '🎮', input: 'Game feature update notes', pipeline: 'Spark → Vibe → Cast → Hub', output: 'Community update video with AI presenter in CJK + English', languages: 'JA, ZH, KO, EN', impact: 'Global game community reach' },
      { industry: 'Technology', icon: '💻', input: 'SaaS product announcement', pipeline: 'Mind → Spark → Deck → Vibe → Cast', output: 'Product launch video + investor deck in 5 APAC languages', languages: 'JA, ZH, KO, EN, TH', impact: 'Pan-APAC launch from single brief' },
      { industry: 'Tourism', icon: '✈️', input: 'Destination highlights — Japan', pipeline: 'Spark → Vibe → Cast → Hub', output: 'Tourism promo video in 8 languages targeting inbound visitors', languages: 'EN, ZH, KO, TH, VI, ID, FR, DE', impact: 'Attract tourists in their native language' },
    ],
    welcomeScript: "Three greetings. Three writing systems. One platform built for all of them. Spark creates with tonal precision. Mind reads audiences from Tokyo to Sydney to Seoul. Vibe delivers cinema-grade production. Hub transcreates across CJK and Southeast Asia with native fluency — powered by region-optimized AI. Deck wins deals. Cast scales globally. Ask Genie anticipates your next move. Genie Suite. Precision-engineered for Asia Pacific.",
  },

  latam: {
    slug: 'latam',
    hero: {
      nativeHeadline: '¡Contenido AI para todas las industrias de LATAM!',
      englishHeadline: 'AI Content for Every LATAM Industry',
      nativeSubheadline: 'Producción de video con IA en español, portugués y lenguas indígenas — para cualquier sector',
      englishSubheadline: 'AI video production in Spanish, Portuguese & indigenous languages — for any industry',
      theme: 'América Digital',
      flag: '🇧🇷',
      regionName: 'Latin America',
    },
    stats: {
      audienceReach: '650M+',
      languages: '10+',
      costSavings: '85%',
      localMetric: { label: 'LATAM Variants', value: '8' },
    },
    zoneProviders: [
      { name: 'Claude 4', task: 'LLM Transcreation', reason: 'Superior Spanish/Portuguese with LATAM cultural nuance' },
      { name: 'Azure Neural', task: 'TTS & Lip-Sync', reason: 'Mexican, Colombian, Argentine, Brazilian variants with native prosody' },
      { name: 'Vertex Veo 3', task: 'Video Generation', reason: 'Vibrant visual style for LATAM markets' },
      { name: 'DeepL', task: 'Translation', reason: 'Highest accuracy for Spanish ↔ Portuguese translation' },
    ],
    industries: [
      { name: 'Fintech', icon: '📱', useCase: 'Neobank onboarding, Pix/SPEI tutorials in local Spanish/Portuguese' },
      { name: 'E-Commerce', icon: '🛒', useCase: 'Mercado Libre product videos, influencer marketing content' },
      { name: 'Agriculture', icon: '🌾', useCase: 'Agtech education, sustainable farming guides in local dialects' },
      { name: 'Education', icon: '📚', useCase: 'University courses, vocational training in regional Spanish' },
      { name: 'Healthcare', icon: '🏥', useCase: 'Public health campaigns in indigenous + Spanish' },
    ],
    seo: {
      title: 'Genie Suite — Plataforma de Video con IA | Español & Portugués',
      description: 'Crea videos profesionales en español, portugués y lenguas indígenas. Transkreación con IA para contenido auténtico de LATAM.',
      keywords: ['video AI LATAM', 'contenido en español', 'produção de vídeo', 'América Latina', 'transkreación'],
      hreflang: 'es-419',
      ogLocale: 'es_419',
    },
    cta: {
      primary: '¡Empieza Gratis!',
      secondary: 'Ver Demo',
      signIn: '¿Ya tienes cuenta? Inicia sesión →',
      freeCredits: '✓ 50 créditos gratis • ✓ Sin tarjeta • ✓ Español + Portugués',
    },
    languageShowcase: {
      tabLabel: 'LATAM Languages',
      languages: [
        { code: 'es-MX', name: 'Mexican Spanish', nativeName: 'Español (México)', region: 'Mexico', transcreation: '¡Échale ganas y crea videos chidos con IA — es gratis, neta!', literal: 'Por favor pruebe nuestra herramienta de creación de video con IA de forma gratuita', azureVoice: 'es-MX-DaliaNeural' },
        { code: 'pt-BR', name: 'Brazilian Portuguese', nativeName: 'Português (Brasil)', region: 'Brazil', transcreation: 'Começa a criar vídeos incríveis com IA — de graça, sem pegadinha!', literal: 'Por favor, experimente nossa ferramenta de criação de vídeo com IA gratuitamente', azureVoice: 'pt-BR-FranciscaNeural' },
        { code: 'es-CO', name: 'Colombian Spanish', nativeName: 'Español (Colombia)', region: 'Colombia', transcreation: '¡Empieza a crear videos bacanos con IA — gratis, parce!', literal: 'Por favor pruebe nuestra herramienta de creación de video con IA de forma gratuita', azureVoice: 'es-CO-SalomeNeural' },
        { code: 'es-AR', name: 'Argentine Spanish', nativeName: 'Español (Argentina)', region: 'Argentina', transcreation: '¡Arrancá a crear videos re piolas con IA — es gratis, posta!', literal: 'Por favor pruebe nuestra herramienta de creación de video con IA de forma gratuita', azureVoice: 'es-AR-ElenaNeural' },
      ],
    },
    socialProof: 'Confiado por equipos de contenido en toda América Latina',
    comparisonSavings: 'Ahorra $121/mes vs Synthesia + ElevenLabs + DeepL + InVideo',
    differentiators: {
      firstToMarket: [
        'First platform with Mexican, Colombian, Argentine, and Brazilian Spanish/Portuguese variants',
        'First AI video platform supporting indigenous language integration alongside Spanish',
        'First to offer culturally transcreated LATAM content — not Spain-Spanish or Portugal-Portuguese',
      ],
      capabilityDepth: [
        'Only platform distinguishing Mexican from Colombian from Argentine Spanish in TTS',
        'Only platform with LATAM-specific visual styles — not generic Western templates',
        'Only platform combining fintech onboarding with vernacular narration for LATAM markets',
      ],
      heroBadge: '🏆 First: LATAM-Native Spanish Variants',
    },
    showcaseExamples: [
      { industry: 'Fintech', icon: '📱', input: 'Neobank onboarding flow', pipeline: 'Spark → Vibe → Cast → Hub', output: 'Onboarding tutorial in Mexican, Colombian, Argentine, Brazilian variants', languages: 'ES-MX, ES-CO, ES-AR, PT-BR', impact: 'Region-authentic financial content' },
      { industry: 'E-Commerce', icon: '🛒', input: 'Product campaign brief (Mercado Libre)', pipeline: 'Spark → Vibe → Cast', output: 'Social ad series in 4 LATAM Spanish variants + Brazilian Portuguese', languages: 'ES-MX, ES-CO, ES-AR, PT-BR', impact: '5 markets from single brief' },
      { industry: 'Agriculture', icon: '🌾', input: 'Sustainable farming guide', pipeline: 'Mind → Spark → Vibe → Cast', output: 'Farmer education video in regional Spanish + indigenous language overlay', languages: 'ES-MX + Nahuatl subtitles', impact: 'First indigenous language integration' },
      { industry: 'Education', icon: '📚', input: 'University course module', pipeline: 'Mind → Spark → Vibe → Cast → Hub', output: 'Online course video with professor avatar in 3 Spanish variants', languages: 'ES-MX, ES-CO, ES-AR', impact: 'Pan-LATAM education from single source' },
    ],
    welcomeScript: "Latin America doesn't need another tool that thinks in English. Spark writes with sabor — Brazilian, Mexican, Argentine, Colombian, each with its own soul. Mind feels the pulse of your mercado. Vibe turns scripts into productions your audience can't scroll past. Hub transcreates — porque traducir no es suficiente. Deck conquers the sala de juntas. Cast fills every pantalla. Ask Genie keeps the magic flowing. Genie Suite. Hecho para quienes piensan en grande.",
  },

  caribbean: {
    slug: 'caribbean',
    hero: {
      nativeHeadline: 'Caribbean Content for Every Industry',
      englishHeadline: 'Caribbean Content for Every Industry',
      nativeSubheadline: 'AI video production in English, French Creole, Spanish & Papiamento — Tourism, Finance & beyond',
      englishSubheadline: 'AI video production for the Caribbean — Tourism, Finance, Agriculture & 50+ industries',
      theme: 'Caribbean Innovation',
      flag: '🏝️',
      regionName: 'Caribbean',
    },
    stats: {
      audienceReach: '44M+',
      languages: '6+',
      costSavings: '80%',
      localMetric: { label: 'Island Markets', value: '25+' },
    },
    zoneProviders: [
      { name: 'Claude 4', task: 'LLM Transcreation', reason: 'Creole and multilingual Caribbean content adaptation' },
      { name: 'Azure Neural', task: 'TTS & Lip-Sync', reason: 'Caribbean English, French, and Spanish voice variants' },
      { name: 'Vertex Veo 3', task: 'Video Generation', reason: 'Vibrant tropical visual content' },
      { name: 'DeepL', task: 'Translation', reason: 'French ↔ English ↔ Spanish for trilingual markets' },
    ],
    industries: [
      { name: 'Tourism', icon: '🏖️', useCase: 'Destination marketing, hotel showcases, experience videos' },
      { name: 'Finance', icon: '🏦', useCase: 'Offshore banking content, insurance explainers' },
      { name: 'Agriculture', icon: '🌿', useCase: 'Export marketing, sustainable farming education' },
      { name: 'Education', icon: '📚', useCase: 'University content, vocational training, distance learning' },
      { name: 'Government', icon: '🏛️', useCase: 'Public service announcements, citizen engagement' },
    ],
    seo: {
      title: 'Genie Suite — AI Video Production for the Caribbean',
      description: 'Create professional videos for the Caribbean market in English, French Creole, Spanish, and Papiamento. AI-powered transcreation.',
      keywords: ['Caribbean video', 'AI content Caribbean', 'Creole video', 'tourism marketing', 'island content'],
      hreflang: 'en-029',
      ogLocale: 'en_029',
    },
    cta: {
      primary: 'Start Creating Free',
      secondary: 'See How It Works',
      signIn: 'Already have an account? Sign in →',
      freeCredits: '✓ 50 free credits • ✓ No credit card • ✓ Multilingual Caribbean support',
    },
    languageShowcase: {
      tabLabel: 'Caribbean Languages',
      languages: [
        { code: 'en-JM', name: 'Jamaican English', nativeName: 'Patois', region: 'Jamaica', transcreation: 'Start mek some wicked videos wid AI — free, no strings!', literal: 'Begin creating excellent video content for free', azureVoice: 'en-US-JennyNeural' },
        { code: 'fr-HT', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', region: 'Haiti', transcreation: 'Kòmanse kreye bèl videyo ak AI — gratis, san kondisyon!', literal: 'Commencez à créer d\'excellents contenus vidéo gratuitement', azureVoice: 'fr-FR-DeniseNeural' },
        { code: 'es-CU', name: 'Cuban Spanish', nativeName: 'Español (Cuba)', region: 'Cuba', transcreation: '¡Dale y empieza a crear videos con IA — gratis, asere!', literal: 'Por favor pruebe nuestra herramienta de video con IA gratis', azureVoice: 'es-CU-BelkysNeural' },
      ],
    },
    socialProof: 'Trusted by Caribbean tourism boards and financial institutions',
    comparisonSavings: 'Save $121/month vs Synthesia + ElevenLabs + DeepL + InVideo',
    differentiators: {
      firstToMarket: [
        'First AI video platform supporting Haitian Creole and Papiamento',
        'First platform with Caribbean English dialect awareness in TTS',
        'First to offer trilingual (English + French + Spanish) video production for island markets',
      ],
      capabilityDepth: [
        'Only platform with Creole-aware transcreation — not just French translation',
        'Only platform covering 25+ island markets with culturally adapted content',
        'Only platform combining tourism visual styles with multilingual Caribbean narration',
      ],
      heroBadge: '🏆 First: Creole + Papiamento AI Video',
    },
    showcaseExamples: [
      { industry: 'Tourism', icon: '🏖️', input: 'Resort experience highlights', pipeline: 'Spark → Vibe → Cast → Hub', output: 'Destination marketing video in English + French Creole + Spanish', languages: 'EN, HT-Creole, ES, FR', impact: 'Trilingual reach across Caribbean' },
      { industry: 'Finance', icon: '🏦', input: 'Offshore banking product overview', pipeline: 'Spark → Deck → Vibe → Cast', output: 'Investor pitch video + compliance deck in English + Spanish', languages: 'EN, ES, FR', impact: 'Professional multilingual finance content' },
      { industry: 'Agriculture', icon: '🌿', input: 'Export crop marketing brief', pipeline: 'Spark → Vibe → Cast → Hub', output: 'Export marketing video targeting EU + North American buyers', languages: 'EN, FR, ES, DE', impact: 'Caribbean products to global markets' },
      { industry: 'Government', icon: '🏛️', input: 'Hurricane preparedness guidelines', pipeline: 'Mind → Spark → Vibe → Cast', output: 'Public safety video in Creole + English + Spanish with AI avatar', languages: 'HT-Creole, EN, ES', impact: 'Life-saving content in local languages' },
    ],
    welcomeScript: "From Kingston to Port-of-Spain, from Havana to Nassau — the Caribbean has a voice like nowhere else. Spark writes for island rhythm, tourism, and culture. Mind understands audiences across every shore. Vibe creates visuals as vibrant as the islands themselves. Hub handles Creole, Patois, French, Spanish, Dutch, and English — all in one flow. Deck pitches paradise. Cast publishes across every island. Ask Genie ties it together. Genie Suite. Caribbean-built. World-ready.",
  },
};

// Freeze all regional configs to prevent runtime mutation
Object.freeze(REGIONAL_CONFIGS);
Object.values(REGIONAL_CONFIGS).forEach(config => Object.freeze(config));

/**
 * Auto-detect region from timezone
 */
export function detectRegionFromTimezone(): RegionSlug {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Kolkata') || tz.includes('Mumbai') || tz.includes('Chennai') || tz.includes('Calcutta')) return 'india';
    if (tz.includes('Dubai') || tz.includes('Riyadh') || tz.includes('Qatar') || tz.includes('Bahrain') || tz.includes('Kuwait') || tz.includes('Muscat')) return 'mena';
    if (tz.includes('Africa/')) return 'africa';
    if (tz.includes('Tokyo') || tz.includes('Shanghai') || tz.includes('Seoul') || tz.includes('Singapore') || tz.includes('Bangkok') || tz.includes('Jakarta') || tz.includes('Manila') || tz.includes('Taipei') || tz.includes('Hong_Kong')) return 'apac';
    if (tz.includes('Europe/')) return 'europe';
    if (tz.includes('Mexico') || tz.includes('Sao_Paulo') || tz.includes('Buenos_Aires') || tz.includes('Lima') || tz.includes('Bogota') || tz.includes('Santiago')) return 'latam';
    if (tz.includes('Jamaica') || tz.includes('Nassau') || tz.includes('Port-au-Prince') || tz.includes('Barbados') || tz.includes('Trinidad') || tz.includes('Curacao')) return 'caribbean';
  } catch (e) {
    // Fallback to NAM
  }
  return 'nam';
}

/**
 * Get all region slugs for hreflang generation
 */
export function getAllRegionSlugs(): RegionSlug[] {
  return Object.keys(REGIONAL_CONFIGS) as RegionSlug[];
}
