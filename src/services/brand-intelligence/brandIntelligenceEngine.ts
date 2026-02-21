/**
 * Brand Intelligence Engine — Core
 *
 * Unified marketing intelligence layer for GenieSuite ecosystem.
 * Supports every business tier from nano (roadside food carts) to Fortune 500.
 * Works across all languages, all regions, all 6 products.
 *
 * Design principle: For Fortune 500, we're a choice. For SMB/micro — we're THE tool.
 */

// ─── Business Tier System ────────────────────────────────────────────────────
// Every business on earth fits somewhere in this spectrum.

export type BusinessTier =
  | 'nano'        // Food carts, street vendors, individual artisans — 0-1 employees, <$5K/yr
  | 'micro'       // Home businesses, small shops, freelancers — 1-5 employees, $5K-50K/yr
  | 'small'       // Local restaurants, clinics, agencies — 5-50 employees, $50K-2M/yr
  | 'medium'      // Regional chains, mid-size firms — 50-500 employees, $2M-50M/yr
  | 'large'       // National companies, major brands — 500-5000 employees, $50M-1B/yr
  | 'enterprise'; // Fortune 500, multinationals — 5000+ employees, $1B+/yr

export type InformalEconomyType =
  | 'street_food'         // Food carts, hawkers, roadside stalls
  | 'market_vendor'       // Market stalls, bazaar sellers, flea market
  | 'home_business'       // Home kitchen, sewing, crafts from home
  | 'mobile_service'      // Auto-rickshaw, mobile repair, delivery
  | 'artisan_craft'       // Handloom, pottery, woodwork, jewelry making
  | 'agricultural'        // Small farm, produce seller, fisherman
  | 'personal_service'    // Barber, tailor, beautician, tutor
  | 'micro_retail'        // Kiosk, corner shop, paan shop, tienda
  | 'digital_freelance'   // Gig worker, content creator, online seller
  | 'community_service'   // Community healer, religious service, local guide
  | 'service_provider'    // SMB/enterprise service businesses
  | 'artisan'             // Artisan alias for expanded profiles
  | 'transport'           // Transport services
  | 'agriculture'         // Agriculture alias for expanded profiles
  | 'retail'              // Retail businesses (SMB to enterprise)
  | 'education';          // Education services

// ─── Marketing Framework Types ───────────────────────────────────────────────
// From academic rigor to street-level instinct — same intelligence, different depth.

export type MarketingFramework =
  | '4ps'          // Product, Price, Place, Promotion
  | '4es'          // Experience, Exchange, Everyplace, Evangelism
  | '4cs'          // Customer, Cost, Convenience, Communication
  | 'stp'          // Segmentation, Targeting, Positioning
  | 'aida'         // Attention, Interest, Desire, Action
  | 'value_prop'   // Value Proposition Canvas
  | 'jobs_to_done' // Jobs-To-Be-Done (Christensen)
  | 'lean_canvas'  // Lean Canvas (Ash Maurya)
  | 'brand_key'    // Unilever Brand Key
  | 'storm';       // Story, Trust, Offer, Reach, Momentum — our simplified framework for SMB

export type MessagingPillar = {
  id: string;
  name: string;
  headline: string;
  subheadline: string;
  proofPoints: string[];
  emotionalHook: string;
  rationalHook: string;
  targetSegment: string;
};

export type ToneOfVoice = {
  primary: string;        // e.g., "warm", "authoritative", "playful"
  secondary: string;      // e.g., "confident", "humble", "energetic"
  avoid: string[];        // e.g., ["corporate jargon", "slang"]
  formalityLevel: 1 | 2 | 3 | 4 | 5; // 1=casual street, 5=boardroom
  readingLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  culturalRegister: string; // e.g., "respectful-informal" for India
};

export type CompetitivePosition = {
  primaryDifferentiator: string;
  competitorNames: string[];
  marketPosition: 'leader' | 'challenger' | 'niche' | 'disruptor' | 'value' | 'emerging';
  pricePosition: 'premium' | 'mid' | 'value' | 'free' | 'freemium';
  uniqueAdvantages: string[];
  vulnerabilities: string[];
};

// ─── Audience Intelligence ───────────────────────────────────────────────────

export type AudiencePersona = {
  id: string;
  name: string;                // "Priya the Food Cart Owner" or "James the CMO"
  tier: BusinessTier;
  demographics: {
    ageRange: [number, number];
    regions: string[];
    languages: string[];
    education: 'none' | 'primary' | 'secondary' | 'vocational' | 'university' | 'postgraduate';
    techSavviness: 1 | 2 | 3 | 4 | 5;
    internetAccess: 'none' | 'mobile_only' | 'limited' | 'broadband' | 'enterprise';
  };
  psychographics: {
    goals: string[];
    painPoints: string[];
    motivations: string[];
    fears: string[];
    dailyRoutine: string;
  };
  businessContext: {
    industry: string;
    businessType: InformalEconomyType | string;
    monthlyRevenue: string;
    employeeCount: string;
    marketingBudget: 'zero' | 'minimal' | 'modest' | 'moderate' | 'significant' | 'unlimited';
    currentTools: string[];
    biggestChallenge: string;
  };
  contentPreferences: {
    preferredFormats: ('video' | 'image' | 'text' | 'audio' | 'whatsapp' | 'poster' | 'flyer')[];
    attentionSpan: 'seconds' | 'short' | 'medium' | 'long';
    bestReachChannel: string;
    languagePreference: string;
    deviceType: 'feature_phone' | 'low_end_smartphone' | 'smartphone' | 'tablet' | 'desktop' | 'multi_device';
  };
};

// ─── The Brand Intelligence Profile ──────────────────────────────────────────
// This is what flows through every product in the ecosystem.

export interface BrandIntelligenceProfile {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;

  // === IDENTITY ===
  identity: {
    businessName: string;
    tagline?: string;
    industry: string;
    subIndustry?: string;
    businessTier: BusinessTier;
    informalType?: InformalEconomyType;
    foundedYear?: number;
    founderStory?: string;
    missionStatement?: string;
    originLanguage: string;          // The language the founder thinks in
    primaryMarkets: string[];        // Region codes
    operatingLanguages: string[];    // Language codes the business operates in
  };

  // === VISUAL IDENTITY ===
  visual: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    logoUrl?: string;
    logoVariants?: Record<string, string>; // 'dark', 'light', 'icon', 'regional_ar', etc.
    imageStyle: 'photography' | 'illustration' | 'mixed' | 'user_generated' | 'none';
    visualMood: string;              // "vibrant street energy" or "corporate precision"
  };

  // === VOICE & TONE ===
  voice: ToneOfVoice;

  // === MARKETING INTELLIGENCE ===
  marketing: {
    activeFrameworks: MarketingFramework[];
    messagingPillars: MessagingPillar[];
    valueProposition: {
      forCustomer: string;           // "Hot fresh samosas in 30 seconds"
      forMarket: string;             // "Best street food on MG Road"
      uniqueness: string;            // "Secret family recipe since 1985"
    };
    competitivePosition: CompetitivePosition;
    pricing: {
      model: 'fixed' | 'negotiated' | 'tiered' | 'subscription' | 'freemium' | 'donation' | 'barter';
      range: string;                 // "₹10-50" or "$50K-500K/yr"
      currency: string;
      anchor: string;                // "Cheapest on the block" or "Premium quality"
    };
  };

  // === AUDIENCE ===
  audience: {
    primaryPersonas: AudiencePersona[];
    totalAddressableMarket: string;
    geographicReach: 'hyperlocal' | 'local' | 'city' | 'regional' | 'national' | 'multinational' | 'global';
    customerAcquisition: string[];   // "walk-by traffic", "word of mouth", "social media"
    loyaltyDrivers: string[];        // "taste", "convenience", "price", "relationship"
  };

  // === CONTENT STRATEGY ===
  contentStrategy: {
    primaryChannels: string[];       // "WhatsApp status", "Instagram", "local newspaper"
    contentFrequency: 'daily' | 'weekly' | 'monthly' | 'campaign' | 'seasonal' | 'as_needed';
    contentTypes: string[];          // "menu photos", "customer testimonials", "behind the scenes"
    callToAction: {
      primary: string;               // "Visit us today!" or "Schedule a demo"
      secondary?: string;            // "Follow us on Instagram" or "Download whitepaper"
      urgencyLevel: 'none' | 'gentle' | 'moderate' | 'urgent' | 'fomo';
    };
    seasonalEvents: string[];        // "Diwali", "Ramadan", "Back to school", "Q4 budget cycle"
  };

  // === CROSS-PRODUCT DIRECTIVES ===
  // These tell each GenieSuite product how to behave for this brand.
  productDirectives: {
    spark: {
      contentTone: string;
      maxReadingLevel: string;
      forbiddenWords: string[];
      requiredDisclosures: string[];
      templatePreferences: string[];
    };
    mind: {
      strategyDepth: 'quick_tips' | 'basic_plan' | 'detailed_strategy' | 'full_playbook';
      focusAreas: string[];
      budgetConstraint: string;
      timeHorizon: 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'multi_year';
    };
    deck: {
      slideStyle: 'minimal' | 'visual_heavy' | 'data_driven' | 'storytelling' | 'mixed';
      maxSlides: number;
      includeDataViz: boolean;
      audienceType: 'internal' | 'customer' | 'investor' | 'public';
    };
    cast: {
      videoStyle: string;
      maxDuration: number;           // seconds
      avatarPreference: 'none' | 'realistic' | 'animated' | 'brand_mascot';
      musicMood: string;
      subtitlesRequired: boolean;
      outputLanguages: string[];
    };
    vibe: {
      animationStyle: 'corporate' | 'playful' | 'dramatic' | 'cultural' | 'minimal';
      motionIntensity: 1 | 2 | 3 | 4 | 5;
      colorPalette: string[];
      regionalStyle?: string;        // references regional3DMotionGraphicsRegistry
    };
    arc: {
      workflowComplexity: 'simple' | 'standard' | 'advanced' | 'enterprise';
      automationLevel: 'manual' | 'semi_auto' | 'full_auto';
      approvalChain: string[];
      publishTargets: string[];
    };
  };

  // === TIER-SPECIFIC CONFIGURATION ===
  tierConfig: {
    aiModelTier: 'lite' | 'standard' | 'premium' | 'enterprise';
    tokenBudgetPerMonth: number;
    maxConcurrentJobs: number;
    priorityLevel: 1 | 2 | 3 | 4 | 5;
    features: {
      multiLanguage: boolean;
      advancedAnalytics: boolean;
      customTemplates: boolean;
      apiAccess: boolean;
      whiteLabel: boolean;
      dedicatedSupport: boolean;
      complianceTools: boolean;
      teamCollaboration: boolean;
    };
  };
}

// ─── Business Tier Configuration ─────────────────────────────────────────────
// What each tier gets — ensuring nano/micro get real value, not a crippled trial.

export const BUSINESS_TIER_CONFIG: Record<BusinessTier, {
  displayName: string;
  description: string;
  localizedNames: Record<string, string>;
  frameworks: MarketingFramework[];
  aiModelTier: 'lite' | 'standard' | 'premium' | 'enterprise';
  tokenBudget: number;
  maxConcurrentJobs: number;
  features: BrandIntelligenceProfile['tierConfig']['features'];
  onboardingStyle: 'conversational' | 'guided' | 'wizard' | 'full_setup' | 'enterprise_onboard';
  defaultContentFormats: string[];
  supportLevel: string;
}> = {
  nano: {
    displayName: 'Nano Business',
    description: 'Street vendors, food carts, individual artisans, hawkers',
    localizedNames: {
      hi: 'छोटा व्यापार', ta: 'சிறு வணிகம்', te: 'చిన్న వ్యాపారం',
      ar: 'مشروع صغير جداً', es: 'Micronegocio', pt: 'Microempreendedor',
      sw: 'Biashara ndogo sana', yo: 'Iṣẹ́ kékeré', ha: 'Ƙaramin kasuwanci',
      zh: '纳米企业', ja: 'ナノビジネス', ko: '나노 비즈니스',
      fr: 'Nano-entreprise', id: 'Usaha nano', th: 'ธุรกิจจิ๋ว',
      vi: 'Kinh doanh siêu nhỏ', bn: 'ক্ষুদ্র ব্যবসা', ur: 'ننو کاروبار',
      tl: 'Nano na negosyo', am: 'ጥቃቅን ንግድ', my: 'နာနိုစီးပွားရေး',
    },
    frameworks: ['storm', 'aida'],  // Simple, actionable frameworks only
    aiModelTier: 'lite',
    tokenBudget: 50000,
    maxConcurrentJobs: 1,
    features: {
      multiLanguage: true,           // YES — this is critical for nano businesses
      advancedAnalytics: false,
      customTemplates: false,
      apiAccess: false,
      whiteLabel: false,
      dedicatedSupport: false,
      complianceTools: false,
      teamCollaboration: false,
    },
    onboardingStyle: 'conversational', // "Tell me about your business" — no forms
    defaultContentFormats: ['whatsapp', 'poster', 'flyer', 'image', 'audio'],
    supportLevel: 'community',
  },

  micro: {
    displayName: 'Micro Business',
    description: 'Home businesses, small shops, freelancers, solopreneurs',
    localizedNames: {
      hi: 'सूक्ष्म व्यापार', ta: 'நுண் வணிகம்', ar: 'مشروع متناهي الصغر',
      es: 'Microempresa', pt: 'Microempresa', sw: 'Biashara ndogo',
      zh: '微型企业', ja: 'マイクロビジネス', ko: '마이크로 비즈니스',
      fr: 'Micro-entreprise', id: 'Usaha mikro', th: 'ธุรกิจขนาดจิ๋ว',
    },
    frameworks: ['storm', '4cs', 'aida'],
    aiModelTier: 'lite',
    tokenBudget: 150000,
    maxConcurrentJobs: 2,
    features: {
      multiLanguage: true,
      advancedAnalytics: false,
      customTemplates: true,
      apiAccess: false,
      whiteLabel: false,
      dedicatedSupport: false,
      complianceTools: false,
      teamCollaboration: false,
    },
    onboardingStyle: 'conversational',
    defaultContentFormats: ['whatsapp', 'poster', 'flyer', 'image', 'video', 'audio', 'text'],
    supportLevel: 'community',
  },

  small: {
    displayName: 'Small Business',
    description: 'Local restaurants, clinics, agencies, shops with employees',
    localizedNames: {
      hi: 'लघु व्यवसाय', ta: 'சிறு தொழில்', ar: 'شركة صغيرة',
      es: 'Pequeña empresa', pt: 'Pequena empresa', sw: 'Biashara ndogo',
      zh: '小型企业', ja: '小規模ビジネス', ko: '소규모 비즈니스',
      fr: 'Petite entreprise', id: 'Usaha kecil', th: 'ธุรกิจขนาดเล็ก',
    },
    frameworks: ['4ps', '4cs', 'stp', 'aida', 'storm', 'value_prop'],
    aiModelTier: 'standard',
    tokenBudget: 500000,
    maxConcurrentJobs: 3,
    features: {
      multiLanguage: true,
      advancedAnalytics: true,
      customTemplates: true,
      apiAccess: false,
      whiteLabel: false,
      dedicatedSupport: false,
      complianceTools: false,
      teamCollaboration: true,
    },
    onboardingStyle: 'guided',
    defaultContentFormats: ['video', 'image', 'text', 'poster', 'social_media', 'email'],
    supportLevel: 'email',
  },

  medium: {
    displayName: 'Medium Business',
    description: 'Regional chains, mid-size firms, growing companies',
    localizedNames: {
      hi: 'मध्यम व्यवसाय', ta: 'நடுத்தர தொழில்', ar: 'شركة متوسطة',
      es: 'Mediana empresa', pt: 'Média empresa', zh: '中型企业',
      ja: '中規模ビジネス', ko: '중견기업', fr: 'Moyenne entreprise',
    },
    frameworks: ['4ps', '4es', '4cs', 'stp', 'aida', 'value_prop', 'jobs_to_done', 'lean_canvas'],
    aiModelTier: 'standard',
    tokenBudget: 2000000,
    maxConcurrentJobs: 5,
    features: {
      multiLanguage: true,
      advancedAnalytics: true,
      customTemplates: true,
      apiAccess: true,
      whiteLabel: false,
      dedicatedSupport: true,
      complianceTools: true,
      teamCollaboration: true,
    },
    onboardingStyle: 'wizard',
    defaultContentFormats: ['video', 'image', 'text', 'presentation', 'social_media', 'email', 'report'],
    supportLevel: 'priority',
  },

  large: {
    displayName: 'Large Business',
    description: 'National companies, major brands, large organizations',
    localizedNames: {
      hi: 'बड़ा व्यवसाय', ar: 'شركة كبيرة', es: 'Gran empresa',
      zh: '大型企业', ja: '大企業', ko: '대기업', fr: 'Grande entreprise',
    },
    frameworks: ['4ps', '4es', '4cs', 'stp', 'aida', 'value_prop', 'jobs_to_done', 'lean_canvas', 'brand_key'],
    aiModelTier: 'premium',
    tokenBudget: 10000000,
    maxConcurrentJobs: 10,
    features: {
      multiLanguage: true,
      advancedAnalytics: true,
      customTemplates: true,
      apiAccess: true,
      whiteLabel: true,
      dedicatedSupport: true,
      complianceTools: true,
      teamCollaboration: true,
    },
    onboardingStyle: 'full_setup',
    defaultContentFormats: ['video', 'image', 'text', 'presentation', 'social_media', 'email', 'report', '3d_animation', 'interactive'],
    supportLevel: 'dedicated',
  },

  enterprise: {
    displayName: 'Enterprise',
    description: 'Fortune 500, multinationals, global organizations',
    localizedNames: {
      hi: 'उद्यम', ar: 'مؤسسة', es: 'Empresa', zh: '企业级',
      ja: 'エンタープライズ', ko: '엔터프라이즈', fr: 'Entreprise',
    },
    frameworks: ['4ps', '4es', '4cs', 'stp', 'aida', 'value_prop', 'jobs_to_done', 'lean_canvas', 'brand_key', 'storm'],
    aiModelTier: 'enterprise',
    tokenBudget: 100000000,
    maxConcurrentJobs: 50,
    features: {
      multiLanguage: true,
      advancedAnalytics: true,
      customTemplates: true,
      apiAccess: true,
      whiteLabel: true,
      dedicatedSupport: true,
      complianceTools: true,
      teamCollaboration: true,
    },
    onboardingStyle: 'enterprise_onboard',
    defaultContentFormats: ['video', 'image', 'text', 'presentation', 'social_media', 'email', 'report', '3d_animation', 'interactive', 'ar_vr', 'broadcast'],
    supportLevel: 'white_glove',
  },
};

// ─── STORM Framework ─────────────────────────────────────────────────────────
// Our own simplified marketing framework designed for SMB and micro-businesses.
// Story → Trust → Offer → Reach → Momentum
// Works in any language. No MBA required.

export interface STORMFramework {
  story: {
    whoAreYou: string;               // "I'm Priya, I make samosas from my grandmother's recipe"
    whyDoYouDoThis: string;          // "Because everyone deserves affordable homemade food"
    whatMakesYouSpecial: string;      // "40 years of family recipes, fresh every morning"
  };
  trust: {
    socialProof: string[];           // "500+ daily customers", "Featured in local newspaper"
    guarantees: string[];            // "Fresh or free", "Made while you watch"
    credentials: string[];           // "FSSAI certified", "Halal certified"
  };
  offer: {
    whatYouSell: string;             // "Fresh samosas, chai, and snacks"
    whyNow: string;                  // "Morning rush special: 2 samosas + chai for ₹20"
    pricingMessage: string;          // "Best taste, honest price"
  };
  reach: {
    whereCustomersAre: string[];     // "Outside office buildings", "WhatsApp groups"
    howToFind: string;               // "Look for the yellow cart at MG Road junction"
    bestTimeToReach: string;         // "7-9 AM and 4-6 PM"
  };
  momentum: {
    repeatStrategy: string;          // "Loyalty card: 10th samosa free"
    referralStrategy: string;        // "Bring a friend, both get free chai"
    growthGoal: string;              // "Open second cart at bus station"
  };
}

// ─── Marketing Framework Templates ──────────────────────────────────────────

export interface FourPsFramework {
  product: {
    coreBenefit: string;
    actualProduct: string;
    augmentedFeatures: string[];
    productLine: string[];
    lifecycle: 'introduction' | 'growth' | 'maturity' | 'decline';
  };
  price: {
    strategy: 'penetration' | 'skimming' | 'competitive' | 'value' | 'premium' | 'dynamic' | 'free';
    model: string;
    range: { min: number; max: number; currency: string };
    discountStrategy: string;
  };
  place: {
    channels: string[];
    distribution: 'direct' | 'indirect' | 'hybrid' | 'digital' | 'physical' | 'omnichannel';
    geographicScope: string;
    physicalPresence: string[];
    digitalPresence: string[];
  };
  promotion: {
    advertising: string[];
    salesPromotion: string[];
    publicRelations: string[];
    personalSelling: string[];
    digitalMarketing: string[];
    contentMarketing: string[];
    budget: string;
    primaryChannel: string;
  };
}

export interface FourEsFramework {
  experience: {
    customerJourney: string;
    emotionalConnection: string;
    memorableElements: string[];
    painPointsAddressed: string[];
  };
  exchange: {
    valueDelivered: string;
    customerInvestment: string;        // Not just price — time, effort, trust
    perceivedValue: string;
    exchangeFairness: string;
  };
  everyplace: {
    touchpoints: string[];
    seamlessTransitions: string;
    mobileExperience: string;
    physicalDigitalBridge: string;
  };
  evangelism: {
    advocacyDrivers: string[];
    sharingMechanisms: string[];
    communityBuilding: string;
    wordOfMouthStrategy: string;
  };
}

// ─── GenieSuite's Own Brand Intelligence Profile ─────────────────────────────
// Dogfooding: we use our own tool to define our own brand.

export const GENIESUITE_BRAND_PROFILE: Partial<BrandIntelligenceProfile> = {
  identity: {
    businessName: 'GenieSuite by CGAT',
    tagline: 'Enterprise AI, Street-Smart Simple',
    industry: 'AI SaaS / Marketing Technology',
    subIndustry: 'Multilingual Content Intelligence Platform',
    businessTier: 'small',    // We're a startup — eating our own cooking
    foundedYear: 2024,
    founderStory: 'Built to democratize enterprise-grade marketing intelligence for every business on earth — from Fortune 500 boardrooms to roadside food carts.',
    missionStatement: 'Make world-class marketing intelligence accessible to every business, in every language, at every scale.',
    originLanguage: 'en',
    primaryMarkets: ['us', 'in', 'ae', 'sa', 'gb', 'sg', 'ng', 'ke', 'mx', 'br', 'ph', 'id'],
    operatingLanguages: ['en', 'hi', 'ar', 'es', 'pt', 'ta', 'te', 'ur', 'sw', 'fr', 'zh', 'ja', 'ko', 'id', 'th', 'vi', 'bn', 'tl'],
  },

  voice: {
    primary: 'empowering',
    secondary: 'approachable',
    avoid: ['condescending', 'corporate jargon', 'exclusionary language', 'assuming tech literacy'],
    formalityLevel: 3,
    readingLevel: 'intermediate',
    culturalRegister: 'globally-respectful',
  },

  marketing: {
    activeFrameworks: ['storm', '4es', 'value_prop'],
    messagingPillars: [
      {
        id: 'mp-1',
        name: 'Universal Access',
        headline: 'Enterprise AI That Speaks Your Language',
        subheadline: 'From boardroom to bazaar — world-class marketing intelligence for every business',
        proofPoints: [
          '90+ languages supported natively',
          'Works on low-end smartphones',
          'Nano to enterprise pricing tiers',
          'Conversational onboarding — no forms, no jargon',
        ],
        emotionalHook: 'Your business deserves the same tools as a Fortune 500 company',
        rationalHook: '90% cost reduction vs. traditional marketing agencies',
        targetSegment: 'SMB and micro-businesses in developing markets',
      },
      {
        id: 'mp-2',
        name: 'Cultural Intelligence',
        headline: 'Not Just Translated — Transcreated',
        subheadline: 'Content that resonates locally because it was born locally',
        proofPoints: [
          '56 sub-regions with cultural adaptation',
          'Dialect-aware content generation',
          'Cultural emotion mapping',
          'Regional business context understanding',
        ],
        emotionalHook: 'Finally, AI that understands your culture — not just your language',
        rationalHook: '3x higher engagement with culturally adapted content',
        targetSegment: 'Businesses in non-English-first markets',
      },
      {
        id: 'mp-3',
        name: 'Full Ecosystem',
        headline: 'Six Products, One Intelligence',
        subheadline: 'Create, strategize, present, produce, animate, orchestrate — all brand-aware',
        proofPoints: [
          'Spark (content) → Mind (strategy) → Deck (presentations) → Cast (video) → Vibe (animation) → Arc (workflow)',
          'Brand context flows across all products automatically',
          'One onboarding, infinite outputs',
          'Cross-product intelligence gets smarter with each use',
        ],
        emotionalHook: 'Stop juggling 12 tools — one suite, infinite possibilities',
        rationalHook: 'Replace $50K+/year in disconnected SaaS subscriptions',
        targetSegment: 'Growing businesses tired of tool fragmentation',
      },
      {
        id: 'mp-4',
        name: 'Enterprise Ready',
        headline: 'Fortune 500 Power, Startup Soul',
        subheadline: 'Compliance, governance, multi-tenant — without losing agility',
        proofPoints: [
          'SOC2 / GDPR / HIPAA ready',
          'Multi-brand, multi-region governance',
          'Role-based approval workflows',
          'Enterprise SSO and API access',
        ],
        emotionalHook: 'Enterprise grade without enterprise bureaucracy',
        rationalHook: 'Deploy in days, not quarters',
        targetSegment: 'Fortune 500 and large enterprises',
      },
    ],
    valueProposition: {
      forCustomer: 'Create professional marketing content in your language, for your market, in minutes — not days',
      forMarket: 'The only AI marketing platform that works for both a food cart in Mumbai and a Fortune 500 in Manhattan',
      uniqueness: 'Cultural intelligence + business tier awareness + cross-product brand context — no other platform has all three',
    },
    competitivePosition: {
      primaryDifferentiator: 'Universal accessibility with cultural intelligence — from nano to enterprise',
      competitorNames: ['Jasper', 'Copy.ai', 'Canva', 'Beautiful.ai', 'Synthesia', 'HeyGen', 'Tome'],
      marketPosition: 'disruptor',
      pricePosition: 'freemium',
      uniqueAdvantages: [
        'Only platform supporting nano/micro business tiers with real value',
        '90+ languages with cultural transcreation (not just translation)',
        'Cross-product brand intelligence bus — one brain, six products',
        'Works on low-end smartphones for developing markets',
        'STORM framework — marketing intelligence without MBA',
      ],
      vulnerabilities: [
        'New entrant — limited brand recognition',
        'Broad scope — risk of being "good at everything, great at nothing"',
        'Developing market focus may be perceived as "not enterprise enough"',
      ],
    },
    pricing: {
      model: 'freemium',
      range: '$0-$999/mo',
      currency: 'USD',
      anchor: 'Free tier with real value — not a trial, a tool',
    },
  },

  audience: {
    primaryPersonas: [], // Defined in informalEconomyProfiles.ts
    totalAddressableMarket: '580M+ businesses worldwide (95% are micro/small)',
    geographicReach: 'global',
    customerAcquisition: [
      'word of mouth in local business communities',
      'WhatsApp business groups',
      'local language social media',
      'developer/agency partnerships',
      'enterprise sales team',
    ],
    loyaltyDrivers: [
      'works in my language',
      'understands my business size',
      'one tool instead of many',
      'content actually resonates with my customers',
      'affordable at my scale',
    ],
  },

  contentStrategy: {
    primaryChannels: ['website', 'WhatsApp', 'YouTube', 'LinkedIn', 'Instagram', 'Twitter', 'local_media'],
    contentFrequency: 'daily',
    contentTypes: [
      'product demos in local languages',
      'success stories from micro-businesses',
      'cultural content showcases',
      'tutorial videos',
      'comparison content',
    ],
    callToAction: {
      primary: 'Start free — create your first content in 60 seconds',
      secondary: 'See how businesses like yours use GenieSuite',
      urgencyLevel: 'gentle',
    },
    seasonalEvents: [
      'Diwali', 'Eid', 'Chinese New Year', 'Christmas', 'Ramadan',
      'Black Friday', 'Back to School', 'Small Business Saturday',
      'World MSME Day (Jun 27)', 'International SME Day',
    ],
  },

  productDirectives: {
    spark: {
      contentTone: 'empowering and clear — no jargon',
      maxReadingLevel: 'intermediate',
      forbiddenWords: ['synergy', 'leverage', 'paradigm', 'disrupt', 'ninja', 'guru', 'rockstar'],
      requiredDisclosures: ['AI-generated content disclaimer when required by region'],
      templatePreferences: ['success_story', 'how_to', 'announcement', 'social_post'],
    },
    mind: {
      strategyDepth: 'basic_plan',
      focusAreas: ['customer acquisition', 'content strategy', 'local market positioning'],
      budgetConstraint: 'bootstrap',
      timeHorizon: 'this_quarter',
    },
    deck: {
      slideStyle: 'visual_heavy',
      maxSlides: 15,
      includeDataViz: true,
      audienceType: 'investor',
    },
    cast: {
      videoStyle: 'dynamic_product_demo',
      maxDuration: 120,
      avatarPreference: 'realistic',
      musicMood: 'upbeat_confident',
      subtitlesRequired: true,
      outputLanguages: ['en', 'hi', 'ar', 'es', 'pt', 'zh', 'ja', 'ko', 'fr', 'sw'],
    },
    vibe: {
      animationStyle: 'playful',
      motionIntensity: 3,
      colorPalette: ['#6366F1', '#EC4899', '#F59E0B', '#10B981'],
      regionalStyle: 'global_modern',
    },
    arc: {
      workflowComplexity: 'standard',
      automationLevel: 'semi_auto',
      approvalChain: ['content_creator', 'brand_manager'],
      publishTargets: ['website', 'social_media', 'email'],
    },
  },

  tierConfig: {
    aiModelTier: 'standard',
    tokenBudgetPerMonth: 5000000,
    maxConcurrentJobs: 10,
    priorityLevel: 3,
    features: {
      multiLanguage: true,
      advancedAnalytics: true,
      customTemplates: true,
      apiAccess: true,
      whiteLabel: false,
      dedicatedSupport: false,
      complianceTools: true,
      teamCollaboration: true,
    },
  },
};

// ─── Utility: Create Default Profile by Tier ─────────────────────────────────

export function createDefaultProfile(
  businessName: string,
  tier: BusinessTier,
  language: string,
  region: string,
): Partial<BrandIntelligenceProfile> {
  const tierConfig = BUSINESS_TIER_CONFIG[tier];

  return {
    identity: {
      businessName,
      industry: '',
      businessTier: tier,
      originLanguage: language,
      primaryMarkets: [region],
      operatingLanguages: [language],
    },
    voice: {
      primary: tier === 'nano' || tier === 'micro' ? 'friendly' : 'professional',
      secondary: tier === 'nano' || tier === 'micro' ? 'warm' : 'confident',
      avoid: [],
      formalityLevel: tier === 'nano' ? 1 : tier === 'micro' ? 2 : tier === 'small' ? 3 : 4,
      readingLevel: tier === 'nano' ? 'basic' : tier === 'micro' ? 'basic' : 'intermediate',
      culturalRegister: 'respectful',
    },
    marketing: {
      activeFrameworks: tierConfig.frameworks,
      messagingPillars: [],
      valueProposition: { forCustomer: '', forMarket: '', uniqueness: '' },
      competitivePosition: {
        primaryDifferentiator: '',
        competitorNames: [],
        marketPosition: tier === 'nano' || tier === 'micro' ? 'value' : 'challenger',
        pricePosition: tier === 'nano' ? 'value' : tier === 'micro' ? 'value' : 'mid',
        uniqueAdvantages: [],
        vulnerabilities: [],
      },
      pricing: {
        model: tier === 'nano' ? 'fixed' : tier === 'micro' ? 'fixed' : 'tiered',
        range: '',
        currency: '',
        anchor: '',
      },
    },
    tierConfig: {
      aiModelTier: tierConfig.aiModelTier,
      tokenBudgetPerMonth: tierConfig.tokenBudget,
      maxConcurrentJobs: tierConfig.maxConcurrentJobs,
      priorityLevel: tier === 'enterprise' ? 5 : tier === 'large' ? 4 : tier === 'medium' ? 3 : 2,
      features: tierConfig.features,
    },
  };
}

// ─── Utility: Infer Tier from Business Description ───────────────────────────

export function inferBusinessTier(description: string): BusinessTier {
  const lower = description.toLowerCase();

  const nanoKeywords = [
    'cart', 'stall', 'hawker', 'vendor', 'roadside', 'street food', 'pushcart',
    'thela', 'khomcha', 'dabba', 'redi', 'paan', 'chaat', 'juice', 'taco stand',
    'puesto', 'tianguis', 'warung', 'kedai', 'dhaba', 'bunna', 'mama put',
    'suya spot', 'buka', 'chop bar', 'food stall', 'tea stall', 'chai',
    'empanada', 'arepa', 'satay', 'nasi lemak', 'pad thai cart',
  ];

  const microKeywords = [
    'home business', 'home kitchen', 'freelance', 'solopreneur', 'handmade',
    'etsy', 'craft', 'tutor', 'tailor', 'barber', 'beautician', 'salon',
    'gig', 'uber', 'grab', 'delivery', 'repair', 'one person', 'side hustle',
    'cottage', 'artisan', 'homemade', 'small shop', 'kiosk', 'booth',
  ];

  const smallKeywords = [
    'restaurant', 'cafe', 'clinic', 'agency', 'store', 'shop', 'bakery',
    'gym', 'salon', 'dental', 'law firm', 'accounting', 'consulting',
    'startup', 'local business', 'family business', 'employees',
  ];

  const mediumKeywords = [
    'chain', 'franchise', 'regional', 'branch', 'department', 'mid-size',
    'growing company', 'series a', 'series b', '100 employees', 'expansion',
  ];

  const largeKeywords = [
    'national', 'major brand', 'corporation', 'listed company', 'ipo',
    'thousands of employees', 'multiple countries', 'billion',
  ];

  const enterpriseKeywords = [
    'fortune 500', 'fortune 1000', 'multinational', 'global enterprise',
    'conglomerate', 'publicly traded', 'market cap',
  ];

  if (enterpriseKeywords.some(k => lower.includes(k))) return 'enterprise';
  if (largeKeywords.some(k => lower.includes(k))) return 'large';
  if (mediumKeywords.some(k => lower.includes(k))) return 'medium';
  if (smallKeywords.some(k => lower.includes(k))) return 'small';
  if (microKeywords.some(k => lower.includes(k))) return 'micro';
  if (nanoKeywords.some(k => lower.includes(k))) return 'nano';

  return 'small'; // Safe default
}
