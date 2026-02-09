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

// ==========================================
// INDUSTRY-SPECIFIC EXAMPLES FOR TTS / TRANSLATION
// ==========================================

export interface IndustryDemoExample extends DemoExample {
  industryId: string;
}

export const INDUSTRY_TTS_EXAMPLES: Record<string, DemoExample[]> = {
  healthcare: [
    { id: 'hc-patient', label: 'Patient Education', text: 'Your blood sugar levels are well controlled. Continue your current medication and schedule a follow-up in 3 months.', emoji: '🩺' },
    { id: 'hc-appointment', label: 'Appointment Reminder', text: 'Hello! Your appointment with Dr. Ahmed is confirmed for Tuesday at 10 AM. Please bring your insurance card and medication list.', emoji: '📋' },
    { id: 'hc-wellness', label: 'Wellness Program', text: 'Join our new wellness program! Weekly nutrition counseling, fitness classes, and mental health support — all in your preferred language.', emoji: '💪' },
  ],
  education: [
    { id: 'ed-welcome', label: 'Course Welcome', text: 'Welcome to Module 1: Introduction to Artificial Intelligence. In this lesson, you will learn the fundamentals of machine learning and neural networks.', emoji: '📚' },
    { id: 'ed-assignment', label: 'Assignment Brief', text: 'Your group project is due next Friday. Submit a 10-minute presentation on sustainable energy solutions with data visualizations.', emoji: '📝' },
    { id: 'ed-announce', label: 'Campus Announcement', text: 'The university library will now offer AI-powered study assistants in 12 languages. Visit the digital help desk to get started.', emoji: '🎓' },
  ],
  finance: [
    { id: 'fin-update', label: 'Market Update', text: 'Q4 results exceeded expectations with a 15% revenue increase. Our diversified portfolio strategy continues to outperform regional benchmarks.', emoji: '📈' },
    { id: 'fin-advisory', label: 'Client Advisory', text: 'Based on your risk profile, we recommend reallocating 20% of your portfolio toward emerging market bonds and sustainable infrastructure funds.', emoji: '💼' },
    { id: 'fin-compliance', label: 'Compliance Notice', text: 'Important: New regulatory requirements take effect January 1st. All client documentation must be updated to meet regional compliance standards.', emoji: '⚖️' },
  ],
  government: [
    { id: 'gov-psa', label: 'Public Service', text: 'Access all government services online! Apply for permits, schedule appointments, and track applications — available in 40 languages.', emoji: '🏛️' },
    { id: 'gov-emergency', label: 'Emergency Alert', text: 'Weather advisory: Heavy rainfall expected in the northern region. Please prepare emergency supplies and follow official guidance.', emoji: '🚨' },
    { id: 'gov-election', label: 'Civic Engagement', text: 'Your vote matters! Registration for the upcoming municipal elections is now open. Visit your nearest civic center or register online.', emoji: '🗳️' },
  ],
  tourism: [
    { id: 'tour-promo', label: 'Destination Promo', text: 'Discover ancient temples, pristine beaches, and world-class cuisine. Book your dream vacation today with exclusive early-bird pricing.', emoji: '🏝️' },
    { id: 'tour-guide', label: 'Tour Guide', text: 'Welcome to the historic old city! This guided walking tour covers 2,000 years of history across 12 landmarks. Audio available in your language.', emoji: '🗺️' },
    { id: 'tour-hotel', label: 'Hotel Welcome', text: 'Welcome to our resort! Your concierge speaks 8 languages and can arrange cultural experiences, spa treatments, and private dining.', emoji: '🏨' },
  ],
  retail: [
    { id: 'ret-launch', label: 'Product Launch', text: 'Introducing our Summer 2026 collection — designed for the global citizen. Shop now and enjoy free worldwide shipping on orders over $100.', emoji: '🛍️' },
    { id: 'ret-promo', label: 'Flash Sale', text: 'Flash sale alert! 48 hours only — up to 60% off across all categories. Use code GLOBAL60 at checkout. Available in all regional stores.', emoji: '🔥' },
    { id: 'ret-loyalty', label: 'Loyalty Program', text: 'Congratulations! You have earned 500 reward points. Redeem them for exclusive discounts, early access, or free premium shipping.', emoji: '⭐' },
  ],
  manufacturing: [
    { id: 'mfg-safety', label: 'Safety Briefing', text: 'Safety reminder: Always wear PPE in designated zones. Report any equipment malfunctions immediately to your shift supervisor.', emoji: '🦺' },
    { id: 'mfg-training', label: 'Equipment Training', text: 'This training module covers the operation of the new CNC milling machine. Complete all safety checkpoints before operating.', emoji: '⚙️' },
    { id: 'mfg-quality', label: 'Quality Update', text: 'Quality alert: New inspection protocols are now in effect for all production lines. Refer to the updated SOP document in your language.', emoji: '✅' },
  ],
  realestate: [
    { id: 're-listing', label: 'Property Listing', text: 'Luxury penthouse with panoramic ocean views. 3 bedrooms, smart home technology, and exclusive rooftop access. Schedule a virtual tour today.', emoji: '🏙️' },
    { id: 're-invest', label: 'Investment Pitch', text: 'Premium waterfront development with projected 12% annual ROI. Phase 1 units selling fast — early investors receive priority selection.', emoji: '💎' },
    { id: 're-open', label: 'Open House', text: 'Join us this Saturday for an exclusive open house event. Tour our model homes and meet our multilingual sales team. Refreshments provided.', emoji: '🏠' },
  ],
};

/** Get examples for a given region, with universals appended */
export function getExamplesForRegion(region?: string): DemoExample[] {
  const regional = region ? (REGION_EXAMPLES[region] || []) : [];
  return [...regional, ...UNIVERSAL_EXAMPLES];
}

/** Get industry-specific examples for TTS/Translation, fallback to universal */
export function getExamplesForIndustry(industryId?: string, region?: string): DemoExample[] {
  if (industryId && INDUSTRY_TTS_EXAMPLES[industryId]) {
    return INDUSTRY_TTS_EXAMPLES[industryId];
  }
  return getExamplesForRegion(region);
}

/** Get STT suggestions for a language code */
export function getSTTSuggestions(langCode: string): { phrase: string; language: string; langCode: string }[] {
  return STT_SUGGESTIONS[langCode] || STT_SUGGESTIONS['en'] || [];
}
