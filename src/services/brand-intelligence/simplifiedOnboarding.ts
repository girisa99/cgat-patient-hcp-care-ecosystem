/**
 * Simplified Onboarding Service
 *
 * Converts natural language business descriptions into full BrandIntelligenceProfiles.
 * No forms, no jargon, no MBA required.
 *
 * A food cart vendor says: "I sell samosas near the station"
 * → We infer: nano tier, street food, India region, Hindi language,
 *   STORM framework, WhatsApp marketing, ₹ pricing, walk-by customers
 *
 * A Fortune 500 CMO says: "Global SaaS platform for healthcare compliance"
 * → We infer: enterprise tier, B2B SaaS, global region, English primary,
 *   4Ps/4Es/Brand Key frameworks, multi-channel marketing, USD pricing
 *
 * Works in any language — the user describes their business in their language,
 * we understand and build the profile.
 */

import type {
  BrandIntelligenceProfile,
  BusinessTier,
  InformalEconomyType,
  MarketingFramework,
  ToneOfVoice,
  AudiencePersona,
} from './brandIntelligenceEngine';
import { BUSINESS_TIER_CONFIG, inferBusinessTier, createDefaultProfile } from './brandIntelligenceEngine';
import { ALL_BUSINESS_ARCHETYPES, findArchetypesByRegion } from './informalEconomyProfiles';
import { fetchLocalBusinessEnrichment, type LocalEnrichmentResult } from '@/lib/api/localBusinessEnrichment';
import type { GooglePlacesEnrichment } from '@/hooks/useUniversalEnrichment';

// ─── Onboarding Question Flow ────────────────────────────────────────────────
// Conversational onboarding — not a form. Each question is asked in natural language.

export interface OnboardingQuestion {
  id: string;
  question: string;
  questionLocalized: Record<string, string>;  // Translations of the question
  helpText: string;
  helpTextLocalized: Record<string, string>;
  inputType: 'text' | 'select' | 'multi_select' | 'image' | 'color' | 'skip';
  options?: Array<{ value: string; label: string; labelLocalized?: Record<string, string> }>;
  required: boolean;
  tier: BusinessTier[];              // Which tiers see this question
  inferrable: boolean;               // Can we infer this from other answers?
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'business_description',
    question: 'Tell me about your business — what do you do and who do you do it for?',
    questionLocalized: {
      hi: 'अपने बिज़नेस के बारे में बताइए — आप क्या करते हैं और किसके लिए करते हैं?',
      ta: 'உங்கள் வணிகத்தைப் பற்றி சொல்லுங்கள் — நீங்கள் என்ன செய்கிறீர்கள், யாருக்காக?',
      ar: 'أخبرني عن عملك — ماذا تفعل ولمن؟',
      es: 'Cuéntame sobre tu negocio — ¿qué haces y para quién?',
      pt: 'Me conte sobre seu negócio — o que você faz e para quem?',
      sw: 'Niambie kuhusu biashara yako — unafanya nini na kwa nani?',
      id: 'Ceritakan tentang bisnis Anda — apa yang Anda lakukan dan untuk siapa?',
      th: 'เล่าเกี่ยวกับธุรกิจของคุณให้ฟัง — คุณทำอะไร ทำเพื่อใคร?',
      zh: '告诉我你的生意 — 你做什么，为谁做？',
      ja: 'あなたのビジネスについて教えてください — 何をしていて、誰のためにしていますか？',
      ko: '당신의 사업에 대해 알려주세요 — 무엇을 하고, 누구를 위해 하나요?',
      fr: 'Parlez-moi de votre entreprise — que faites-vous et pour qui ?',
      yo: 'Sọ fún mi nípa iṣẹ́ rẹ — kí ni o ṣe, fún tani?',
      tl: 'Sabihin mo sa akin ang tungkol sa iyong negosyo — ano ang ginagawa mo at para kanino?',
    },
    helpText: 'Just describe it naturally — "I sell samosas near the station" or "We provide cloud security for banks"',
    helpTextLocalized: {
      hi: 'बस सामान्य भाषा में बताइए — "मैं स्टेशन के पास समोसे बेचता हूँ"',
      es: 'Solo descríbelo naturalmente — "Vendo tacos en la esquina" o "Ofrecemos seguridad cloud para bancos"',
    },
    inputType: 'text',
    required: true,
    tier: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
    inferrable: false,
  },
  {
    id: 'business_location',
    question: 'Where is your business located?',
    questionLocalized: {
      hi: 'आपका बिज़नेस कहाँ है?',
      ta: 'உங்கள் வணிகம் எங்கே உள்ளது?',
      ar: 'أين يقع عملك؟',
      es: '¿Dónde está tu negocio?',
      sw: 'Biashara yako iko wapi?',
      id: 'Di mana bisnis Anda berlokasi?',
      zh: '你的生意在哪里？',
    },
    helpText: 'City, country, or neighborhood — "MG Road, Bangalore" or "Lagos Island" or "Mexico City"',
    helpTextLocalized: {},
    inputType: 'text',
    required: true,
    tier: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
    inferrable: false,
  },
  {
    id: 'business_language',
    question: 'What language do your customers speak?',
    questionLocalized: {
      hi: 'आपके ग्राहक कौन सी भाषा बोलते हैं?',
      ar: 'ما اللغة التي يتحدثها عملاؤك؟',
      es: '¿Qué idioma hablan tus clientes?',
      sw: 'Wateja wako wanazungumza lugha gani?',
    },
    helpText: 'Your primary language — we\'ll create content in this language first',
    helpTextLocalized: {},
    inputType: 'text',
    required: true,
    tier: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
    inferrable: true, // Can infer from location
  },
  {
    id: 'business_special',
    question: 'What makes you special? Why do customers choose you?',
    questionLocalized: {
      hi: 'आपमें क्या खास है? ग्राहक आपको क्यों चुनते हैं?',
      ar: 'ما الذي يميزك؟ لماذا يختارك العملاء؟',
      es: '¿Qué te hace especial? ¿Por qué te eligen los clientes?',
      sw: 'Ni nini kinachokufanya kuwa maalum? Kwa nini wateja wanakuchagua?',
    },
    helpText: '"My grandmother\'s secret recipe" or "Fastest delivery in the city" or "Only AWS-certified in the region"',
    helpTextLocalized: {},
    inputType: 'text',
    required: false,
    tier: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
    inferrable: false,
  },
  {
    id: 'content_goal',
    question: 'What do you want to create today?',
    questionLocalized: {
      hi: 'आज आप क्या बनाना चाहते हैं?',
      ar: 'ماذا تريد أن تنشئ اليوم؟',
      es: '¿Qué quieres crear hoy?',
      sw: 'Unataka kuunda nini leo?',
    },
    helpText: '',
    helpTextLocalized: {},
    inputType: 'select',
    options: [
      { value: 'promo_video', label: 'A promo video for my business', labelLocalized: { hi: 'मेरे बिज़नेस का प्रोमो वीडियो', es: 'Un video promocional' } },
      { value: 'social_post', label: 'Social media content', labelLocalized: { hi: 'सोशल मीडिया कंटेंट', es: 'Contenido para redes sociales' } },
      { value: 'marketing_plan', label: 'A marketing strategy', labelLocalized: { hi: 'मार्केटिंग प्लान', es: 'Una estrategia de marketing' } },
      { value: 'presentation', label: 'A presentation / pitch deck', labelLocalized: { hi: 'प्रेजेंटेशन', es: 'Una presentación' } },
    ],
    required: true,
    tier: ['nano', 'micro', 'small', 'medium', 'large', 'enterprise'],
    inferrable: false,
  },
  {
    id: 'brand_colors',
    question: 'Do you have brand colors? (Pick your main color)',
    questionLocalized: {
      hi: 'क्या आपके ब्रांड के रंग हैं?',
      es: '¿Tienes colores de marca?',
    },
    helpText: 'Skip if you don\'t have specific colors — we\'ll suggest some',
    helpTextLocalized: {},
    inputType: 'color',
    required: false,
    tier: ['micro', 'small', 'medium', 'large', 'enterprise'],
    inferrable: true,
  },
  {
    id: 'logo_upload',
    question: 'Upload your logo (if you have one)',
    questionLocalized: {
      hi: 'अपना लोगो अपलोड करें (अगर है तो)',
      es: 'Sube tu logo (si tienes uno)',
    },
    helpText: 'Don\'t have one? No problem — we can help create one later',
    helpTextLocalized: {},
    inputType: 'image',
    required: false,
    tier: ['micro', 'small', 'medium', 'large', 'enterprise'],
    inferrable: false,
  },
];

// ─── Onboarding Response Processing ─────────────────────────────────────────

export interface OnboardingResponse {
  questionId: string;
  answer: string;
  language: string;                  // Language the answer was given in
}

export interface InferredProfile {
  confidence: number;                // 0-1 confidence in inference
  profile: Partial<BrandIntelligenceProfile>;
  matchedArchetype?: string;         // ID of matched informal economy archetype
  suggestedNextQuestions: string[];   // IDs of questions that would improve accuracy
  warnings: string[];                // Things we're not sure about
}

// ─── Inference Functions ─────────────────────────────────────────────────────

export function inferProfileFromDescription(description: string, location?: string, language?: string): InferredProfile {
  const tier = inferBusinessTier(description);
  const lower = description.toLowerCase();

  // Try to match an archetype
  let matchedArchetype: string | undefined;
  let bestMatchScore = 0;
  for (const archetype of ALL_BUSINESS_ARCHETYPES) {
    let score = 0;
    // Check local names
    for (const localName of Object.values(archetype.localNames)) {
      if (lower.includes(localName.toLowerCase())) {
        score += 3;
      }
    }
    // Check products
    for (const product of archetype.typicalProducts) {
      if (lower.includes(product.toLowerCase())) {
        score += 2;
      }
    }
    // Check type keywords
    if (lower.includes(archetype.type.replace(/_/g, ' '))) {
      score += 1;
    }
    if (score > bestMatchScore) {
      bestMatchScore = score;
      matchedArchetype = archetype.id;
    }
  }

  // Infer region from location
  let regionCode = 'NAM_US'; // Default
  if (location) {
    regionCode = inferRegionFromLocation(location);
  }

  // Build profile
  const defaultProfile = createDefaultProfile(
    extractBusinessName(description) || 'My Business',
    tier,
    language || 'en',
    regionCode,
  );

  // Enhance with archetype if matched
  if (matchedArchetype) {
    const archetype = ALL_BUSINESS_ARCHETYPES.find(a => a.id === matchedArchetype);
    if (archetype) {
      defaultProfile.identity = {
        ...defaultProfile.identity!,
        industry: archetype.type.replace(/_/g, ' '),
        informalType: archetype.type as InformalEconomyType,
      };
    }
  }

  const confidence = bestMatchScore > 0 ? Math.min(0.9, 0.4 + bestMatchScore * 0.1) : 0.3;

  return {
    confidence,
    profile: defaultProfile,
    matchedArchetype,
    suggestedNextQuestions: confidence < 0.6
      ? ['business_special', 'business_location', 'brand_colors']
      : ['content_goal'],
    warnings: confidence < 0.5
      ? ['Low confidence — additional details would help create a better profile']
      : [],
  };
}

function extractBusinessName(description: string): string | null {
  // Look for quoted names
  const quoted = description.match(/"([^"]+)"/);
  if (quoted) return quoted[1];

  // Look for "called X" or "named X"
  const called = description.match(/(?:called|named|name is)\s+([A-Z][a-zA-Z\s']+)/);
  if (called) return called[1].trim();

  return null;
}

function inferRegionFromLocation(location: string): string {
  const lower = location.toLowerCase();

  const regionMap: Record<string, string[]> = {
    'INDIA_NORTH': ['delhi', 'mumbai', 'lucknow', 'jaipur', 'chandigarh', 'agra', 'varanasi', 'north india', 'uttar pradesh', 'rajasthan', 'punjab', 'haryana', 'mp', 'bihar'],
    'INDIA_SOUTH': ['bangalore', 'bengaluru', 'chennai', 'hyderabad', 'kochi', 'mysore', 'coimbatore', 'south india', 'karnataka', 'tamil nadu', 'kerala', 'andhra', 'telangana'],
    'INDIA_WEST': ['pune', 'ahmedabad', 'surat', 'vadodara', 'maharashtra', 'gujarat', 'goa', 'west india'],
    'INDIA_EAST': ['kolkata', 'bhubaneswar', 'patna', 'bengal', 'odisha', 'east india', 'assam', 'guwahati'],
    'MENA_GULF': ['dubai', 'abu dhabi', 'riyadh', 'doha', 'kuwait', 'muscat', 'bahrain', 'uae', 'saudi', 'qatar'],
    'MENA_EGYPT': ['cairo', 'alexandria', 'egypt', 'giza'],
    'AFRICA_WEST': ['lagos', 'abuja', 'accra', 'nigeria', 'ghana', 'dakar', 'senegal'],
    'AFRICA_EAST': ['nairobi', 'mombasa', 'dar es salaam', 'kenya', 'tanzania', 'uganda', 'kampala', 'addis ababa', 'ethiopia'],
    'AFRICA_SOUTH': ['johannesburg', 'cape town', 'durban', 'south africa', 'pretoria'],
    'LATAM_MEXICO': ['mexico city', 'cdmx', 'guadalajara', 'monterrey', 'cancun', 'oaxaca', 'mexico', 'guatemala', 'honduras'],
    'LATAM_BRAZIL': ['sao paulo', 'rio de janeiro', 'brasilia', 'salvador', 'brazil', 'brasil', 'recife', 'belo horizonte'],
    'SEA_MALAY': ['jakarta', 'kuala lumpur', 'surabaya', 'bali', 'indonesia', 'malaysia', 'bandung'],
    'SEA_THAI': ['bangkok', 'chiang mai', 'phuket', 'thailand', 'pattaya'],
    'SEA_PHIL': ['manila', 'cebu', 'davao', 'philippines', 'quezon'],
    'SEA_VIET': ['hanoi', 'ho chi minh', 'saigon', 'vietnam', 'da nang'],
    'CJK_JP': ['tokyo', 'osaka', 'kyoto', 'japan', 'yokohama', 'fukuoka'],
    'CJK_KR': ['seoul', 'busan', 'south korea', 'korea', 'incheon'],
    'CJK_CN': ['beijing', 'shanghai', 'shenzhen', 'guangzhou', 'china', 'hong kong', 'chengdu'],
    'NAM_US': ['new york', 'san francisco', 'los angeles', 'chicago', 'austin', 'seattle', 'boston', 'miami', 'usa', 'united states', 'america'],
    'EU_WEST': ['london', 'manchester', 'dublin', 'uk', 'england', 'ireland', 'britain'],
    'EU_DACH': ['berlin', 'munich', 'vienna', 'zurich', 'germany', 'austria', 'switzerland'],
    'EU_FRANCE': ['paris', 'lyon', 'marseille', 'france'],
    'PAKISTAN': ['karachi', 'lahore', 'islamabad', 'pakistan', 'rawalpindi', 'faisalabad'],
    'BANGLADESH': ['dhaka', 'chittagong', 'bangladesh'],
  };

  for (const [region, keywords] of Object.entries(regionMap)) {
    if (keywords.some(k => lower.includes(k))) {
      return region;
    }
  }

  return 'NAM_US'; // Default
}

// ─── Get Questions for Tier ──────────────────────────────────────────────────

export function getQuestionsForTier(tier: BusinessTier): OnboardingQuestion[] {
  return ONBOARDING_QUESTIONS.filter(q => q.tier.includes(tier));
}

export function getQuestionInLanguage(question: OnboardingQuestion, language: string): {
  question: string;
  helpText: string;
} {
  return {
    question: question.questionLocalized[language] || question.question,
    helpText: question.helpTextLocalized[language] || question.helpText,
  };
}

export function getMinimumQuestionsForProfile(): OnboardingQuestion[] {
  return ONBOARDING_QUESTIONS.filter(q => q.required);
}

// ─── Google Places Auto-Enrichment ──────────────────────────────────────────

/**
 * Fetch Google Places data for a business and convert to GooglePlacesEnrichment format.
 * This is the bridge between the edge function and the universal enrichment pipeline.
 *
 * Call this when user answers the "business_location" question.
 * The returned data flows into useUniversalEnrichment → formatEnrichmentForAI →
 * every AI prompt in every pipeline (video, podcast, presentation, etc.).
 */
export async function enrichWithGooglePlaces(
  businessName: string,
  location: string,
  vertical?: string,
): Promise<{ enrichment: GooglePlacesEnrichment | null; raw: LocalEnrichmentResult | null }> {
  // Parse location into city/state/country
  const parts = location.split(',').map(s => s.trim());
  const city = parts[0];
  const stateOrCountry = parts[1];
  const country = parts[2] || stateOrCountry;

  const result = await fetchLocalBusinessEnrichment({
    businessName,
    city,
    state: parts.length >= 3 ? stateOrCountry : undefined,
    country,
    vertical,
  });

  if (!result.success || !result.data?.place) {
    return { enrichment: null, raw: null };
  }

  const data = result.data;
  const enrichment: GooglePlacesEnrichment = {
    businessName: data.place.name,
    address: data.place.address,
    rating: data.place.rating,
    totalReviews: data.place.totalRatings,
    placeId: data.place.placeId,
    businessTypes: data.place.types,
    website: data.place.website,
    phoneNumber: data.place.phoneNumber,
    openingHours: data.place.openingHours,
    topReviews: data.details?.reviews.map(r => ({
      author: r.author,
      rating: r.rating,
      text: r.text,
    })) || [],
    editorialSummary: data.details?.editorialSummary || null,
    competitorInsights: data.competitors.map(c => ({
      name: c.title,
      snippet: c.snippet,
    })),
    mapsUrl: data.details?.mapsUrl || null,
  };

  return { enrichment, raw: data };
}

/**
 * Enhanced profile inference that uses Google Places data for higher accuracy.
 *
 * After standard inference from description, this layers in REAL data:
 * - Actual rating + review count → credibility signals for script generation
 * - Business types from Google → more accurate industry classification
 * - Customer review quotes → USPs and value proposition extraction
 * - Competitor data → positioning and differentiation
 * - Opening hours → time-sensitive content (e.g. "Open now until 9 PM!")
 */
export function enhanceProfileWithGooglePlaces(
  profile: InferredProfile,
  enrichment: GooglePlacesEnrichment,
): InferredProfile {
  const enhancedProfile = { ...profile.profile };

  // Boost confidence since we have real data
  const confidenceBoost = 0.2 + (enrichment.topReviews.length > 0 ? 0.1 : 0) + (enrichment.rating != null ? 0.1 : 0);

  // Enhance marketing data from real reviews
  if (enhancedProfile.marketing && enrichment.topReviews.length > 0) {
    // Extract common themes from reviews for value proposition
    const reviewTexts = enrichment.topReviews.map(r => r.text).join(' ');
    enhancedProfile.marketing = {
      ...enhancedProfile.marketing,
      valueProposition: (enhancedProfile.marketing.valueProposition || enrichment.editorialSummary || '') as any,
    };
  }

  // Add website if available
  if (enhancedProfile.identity && enrichment.website) {
    enhancedProfile.identity = {
      ...enhancedProfile.identity,
      businessName: enrichment.businessName || enhancedProfile.identity.businessName,
    };
  }

  return {
    ...profile,
    confidence: Math.min(0.95, profile.confidence + confidenceBoost),
    profile: enhancedProfile,
    warnings: profile.warnings.filter(w => !w.includes('Low confidence')),
  };
}
