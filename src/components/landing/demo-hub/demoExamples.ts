/**
 * Pre-built example texts for TTS, Translation, and STT demo cards.
 * Lets users quickly test without needing to know target languages.
 * Region-aware: different examples surface based on active region.
 */

export interface DemoExample {
  id: string;
  label: string;
  text: string;
  emoji: string;
  /** Suggested target language code (DeepL format) for Translation card */
  suggestedTarget?: string;
}

// ==========================================
// TTS & TRANSLATION EXAMPLES
// ==========================================

export const UNIVERSAL_EXAMPLES: DemoExample[] = [
  {
    id: 'welcome',
    label: 'Welcome Message',
    text: 'Welcome to our platform! Create amazing AI-powered videos in any language, in seconds.',
    emoji: '👋',
  },
  {
    id: 'healthcare',
    label: 'Patient Greeting',
    text: 'Hello! Your appointment is confirmed for tomorrow at 10 AM. Please bring your insurance card.',
    emoji: '🏥',
  },
  {
    id: 'marketing',
    label: 'Product Launch',
    text: 'Introducing our revolutionary AI video creator — turn your ideas into stunning multilingual content instantly.',
    emoji: '🚀',
  },
  {
    id: 'ecommerce',
    label: 'Order Update',
    text: 'Great news! Your order has been shipped and will arrive within 2-3 business days. Track it anytime.',
    emoji: '📦',
  },
  {
    id: 'education',
    label: 'Course Intro',
    text: 'Welcome to Module 1. In this lesson, you will learn the fundamentals of artificial intelligence and machine learning.',
    emoji: '📚',
  },
];

export const REGION_EXAMPLES: Record<string, DemoExample[]> = {
  mena: [
    {
      id: 'mena-greeting',
      label: 'Arabic Greeting',
      text: 'Peace be upon you! We are delighted to welcome you to our platform designed specifically for the Middle East market.',
      emoji: '🌙',
      suggestedTarget: 'AR',
    },
    {
      id: 'mena-ramadan',
      label: 'Ramadan Campaign',
      text: 'Wishing you a blessed Ramadan! Enjoy special offers on all our premium plans this holy month.',
      emoji: '☪️',
      suggestedTarget: 'AR',
    },
  ],
  india: [
    {
      id: 'india-namaste',
      label: 'Namaste Greeting',
      text: 'Namaste! Welcome to our AI-powered video platform. Create content in Hindi, Tamil, Telugu and 8 more Indian languages.',
      emoji: '🙏',
      suggestedTarget: 'AR', // DeepL fallback
    },
    {
      id: 'india-festival',
      label: 'Festival Offer',
      text: 'Celebrate Diwali with us! Get 40% off on all plans and create festive videos in your mother tongue.',
      emoji: '🪔',
    },
  ],
  africa: [
    {
      id: 'africa-connect',
      label: 'Pan-African',
      text: 'Connect with your audience across Africa. Create videos in Swahili, Yoruba, Amharic and more local languages.',
      emoji: '🌍',
    },
  ],
  apac: [
    {
      id: 'apac-launch',
      label: 'Asia Launch',
      text: 'Now available in Japan, Korea, and China. Create professional AI videos with perfect local pronunciation.',
      emoji: '🏯',
      suggestedTarget: 'JA',
    },
  ],
  latam: [
    {
      id: 'latam-bienvenido',
      label: 'LatAm Welcome',
      text: 'Welcome to the future of content creation! Build videos in Spanish and Portuguese that truly connect with Latin American audiences.',
      emoji: '🌮',
      suggestedTarget: 'PT-BR',
    },
  ],
  europe: [
    {
      id: 'europe-gdpr',
      label: 'European Intro',
      text: 'Create GDPR-compliant AI videos in German, French, Italian and 20+ European languages. Privacy-first, always.',
      emoji: '🇪🇺',
      suggestedTarget: 'DE',
    },
  ],
  nam: [
    {
      id: 'nam-business',
      label: 'Business Pitch',
      text: 'Scale your video content globally. Our AI creates culturally adapted versions for every market, starting from English.',
      emoji: '💼',
      suggestedTarget: 'ES',
    },
  ],
  caribbean: [
    {
      id: 'caribbean-tourism',
      label: 'Tourism Ad',
      text: 'Discover paradise! Create stunning travel videos in English, Spanish, and French for the Caribbean market.',
      emoji: '🏝️',
      suggestedTarget: 'ES',
    },
  ],
};

// ==========================================
// STT SUGGESTED PHRASES (what to say into mic)
// ==========================================

export const STT_SUGGESTIONS: Record<string, { phrase: string; language: string; langCode: string }[]> = {
  en: [
    { phrase: 'Create a new video with AI narration', language: 'English', langCode: 'en' },
    { phrase: 'Schedule my appointment for next Monday', language: 'English', langCode: 'en' },
    { phrase: 'Translate this document to Arabic', language: 'English', langCode: 'en' },
  ],
  ar: [
    { phrase: 'أريد إنشاء فيديو جديد', language: 'Arabic', langCode: 'ar' },
    { phrase: 'موعدي يوم الاثنين القادم', language: 'Arabic', langCode: 'ar' },
  ],
  hi: [
    { phrase: 'मुझे एक नया वीडियो बनाना है', language: 'Hindi', langCode: 'hi' },
    { phrase: 'मेरी अपॉइंटमेंट अगले सोमवार को है', language: 'Hindi', langCode: 'hi' },
  ],
  de: [
    { phrase: 'Erstelle ein neues Video mit KI', language: 'German', langCode: 'de' },
  ],
  es: [
    { phrase: 'Quiero crear un video nuevo', language: 'Spanish', langCode: 'es' },
  ],
  fr: [
    { phrase: 'Je veux créer une nouvelle vidéo', language: 'French', langCode: 'fr' },
  ],
  ja: [
    { phrase: '新しいビデオを作成したい', language: 'Japanese', langCode: 'ja' },
  ],
};

/** Get examples for a given region, with universals appended */
export function getExamplesForRegion(region?: string): DemoExample[] {
  const regional = region ? (REGION_EXAMPLES[region] || []) : [];
  return [...regional, ...UNIVERSAL_EXAMPLES];
}

/** Get STT suggestions for a language code */
export function getSTTSuggestions(langCode: string): { phrase: string; language: string; langCode: string }[] {
  return STT_SUGGESTIONS[langCode] || STT_SUGGESTIONS['en'] || [];
}
