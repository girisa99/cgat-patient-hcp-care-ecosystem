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
}

export const REGIONAL_CONFIGS: Record<RegionSlug, RegionalConfig> = {
  nam: {
    slug: 'nam',
    hero: {
      nativeHeadline: 'Transform Your Content Strategy',
      englishHeadline: 'Transform Your Content Strategy',
      nativeSubheadline: 'AI-powered production for Healthcare, Finance & Tech leaders',
      englishSubheadline: 'AI-powered production for Healthcare, Finance & Tech leaders',
      theme: 'Digital Transformation',
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
      title: 'Genie Studio — AI Video Production Platform | Mind to Media',
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
    socialProof: 'Trusted by content teams at Fortune 500 companies across North America',
    comparisonSavings: 'Save $121/month vs Synthesia + ElevenLabs + Descript + DeepL + InVideo',
  },

  europe: {
    slug: 'europe',
    hero: {
      nativeHeadline: 'Skalieren Sie Inhalte über ganz Europa',
      englishHeadline: 'Scale Content Across Europe',
      nativeSubheadline: 'KI-gestützte Produktion für Fertigung, Finanzen & professionelle Dienste',
      englishSubheadline: 'AI-powered production for Manufacturing, Finance & Professional Services',
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
      title: 'Genie Studio — KI-Videoproduktion für Europa | 25+ Sprachen',
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
    socialProof: 'Vertrauen von Fertigungs- und Finanzteams in der gesamten EU',
    comparisonSavings: 'Sparen Sie 121€/Monat im Vergleich zu Synthesia + DeepL + Descript + InVideo',
  },

  mena: {
    slug: 'mena',
    hero: {
      nativeHeadline: 'رؤية 2030 تبدأ من هنا',
      englishHeadline: 'Vision 2030 Starts Here',
      nativeSubheadline: 'إنتاج محتوى بالذكاء الاصطناعي بـ 7 لهجات عربية',
      englishSubheadline: 'AI content production in 7 Arabic dialects with full RTL support',
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
      title: 'جيني ستوديو — منصة إنتاج الفيديو بالذكاء الاصطناعي | 7 لهجات عربية',
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
  },

  india: {
    slug: 'india',
    hero: {
      nativeHeadline: 'भारत के लिए बनाया गया AI कंटेंट',
      englishHeadline: 'AI Content Built for India',
      nativeSubheadline: '11 भारतीय भाषाओं में वीडियो प्रोडक्शन — हिंदी, तमिल, तेलुगु, बंगाली और बहुत कुछ',
      englishSubheadline: 'Video production in 11 Indian languages — Hindi, Tamil, Telugu, Bengali & more',
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
      title: 'Genie Studio — AI वीडियो प्रोडक्शन प्लेटफॉर्म | 11 भारतीय भाषाएं',
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
  },

  africa: {
    slug: 'africa',
    hero: {
      nativeHeadline: 'Anza Kuunda Yaliyomo ya Afrika',
      englishHeadline: 'Build Content for Africa',
      nativeSubheadline: 'AI-powered video in Swahili, Yoruba, Hausa, Zulu, Amharic & more',
      englishSubheadline: 'AI-powered video in 10+ African languages with native voice synthesis',
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
      title: 'Genie Studio — AI Video Production for Africa | 10+ Languages',
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
  },

  apac: {
    slug: 'apac',
    hero: {
      nativeHeadline: 'アジア太平洋のコンテンツを革新',
      englishHeadline: 'Revolutionize APAC Content',
      nativeSubheadline: 'CJK言語完全対応 — 中国語・日本語・韓国語のAI動画制作',
      englishSubheadline: 'Full CJK support — Chinese, Japanese, Korean AI video production',
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
      { name: 'CosyVoice', task: 'Voice Synthesis', reason: 'Alibaba\'s native Chinese voice engine for authentic Mandarin' },
    ],
    industries: [
      { name: 'Technology', icon: '💻', useCase: 'Product launches for APAC markets, localized developer content' },
      { name: 'E-Commerce', icon: '🛒', useCase: 'Product videos for Lazada, Shopee, Tokopedia in local languages' },
      { name: 'Gaming', icon: '🎮', useCase: 'Game trailers, community content in CJK languages' },
      { name: 'Automotive', icon: '🚗', useCase: 'Showroom content, launch events for ASEAN markets' },
      { name: 'Tourism', icon: '✈️', useCase: 'Destination marketing for Japan, Thailand, Indonesia' },
    ],
    seo: {
      title: 'Genie Studio — AI動画制作プラットフォーム | CJK完全対応',
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
  },

  latam: {
    slug: 'latam',
    hero: {
      nativeHeadline: '¡Transforma tu estrategia de contenido!',
      englishHeadline: 'Transform Your Content Strategy',
      nativeSubheadline: 'Producción de video con IA en español, portugués y lenguas indígenas',
      englishSubheadline: 'AI video production in Spanish, Portuguese & indigenous languages',
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
      title: 'Genie Studio — Plataforma de Video con IA | Español & Portugués',
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
  },

  caribbean: {
    slug: 'caribbean',
    hero: {
      nativeHeadline: 'Caribbean Content, Caribbean Vibes',
      englishHeadline: 'Caribbean Content, Caribbean Vibes',
      nativeSubheadline: 'AI video production in English, French Creole, Spanish & Papiamento',
      englishSubheadline: 'AI video production for the Caribbean\'s unique multilingual landscape',
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
      title: 'Genie Studio — AI Video Production for the Caribbean',
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
  },
};

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
