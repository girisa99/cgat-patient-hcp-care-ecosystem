/**
 * Genie Suite - Comprehensive Pricing Options & Permutations
 * Based on VoC, Market Segments, and Competitor Analysis
 * 
 * This file contains all pricing models, permutations, and segment-specific strategies
 */

// =============================================================================
// MARKET SEGMENTS SUMMARY (From VoC Research)
// =============================================================================
export interface SegmentPricingProfile {
  id: string;
  name: string;
  priority: 'P0' | 'P1' | 'P2';
  marketSize: string;
  currentSpend: string;
  painPoint: string;
  voiceOfCustomer: string;
  priceThreshold: string;
  competitorPrice: string;
  valueDrivers: string[];
  buyingBehavior: 'Individual' | 'Team' | 'Enterprise';
  decisionMaker: string;
}

export const segmentPricingProfiles: SegmentPricingProfile[] = [
  {
    id: 'creator',
    name: 'Creator Economy',
    priority: 'P0',
    marketSize: '$250B (2027)',
    currentSpend: '$0-12/mo (CapCut free, Descript $12)',
    painPoint: 'Juggling 5-7 tools, 8-12 hours per video',
    voiceOfCustomer: '"I just want to go viral, is that too much to ask?"',
    priceThreshold: '$5-15/mo MAX',
    competitorPrice: 'CapCut: Free/$7.99 | Descript: $12-24',
    valueDrivers: ['Time savings', 'All-in-one solution', 'Easy to use'],
    buyingBehavior: 'Individual',
    decisionMaker: 'Self',
  },
  {
    id: 'influencer',
    name: 'Social Media Influencers',
    priority: 'P0',
    marketSize: '$21B (2024)',
    currentSpend: '$20-50/mo across tools',
    painPoint: '8 videos/week across 5 platforms, exhausted',
    voiceOfCustomer: '"8 videos a week across 5 platforms - I\'m exhausted"',
    priceThreshold: '$10-25/mo',
    competitorPrice: 'VN: $9.99 | Riverside: $15-24',
    valueDrivers: ['Multi-platform export', 'Content repurposing', 'Speed'],
    buyingBehavior: 'Individual',
    decisionMaker: 'Self or Manager',
  },
  {
    id: 'knowledge',
    name: 'Knowledge Sharers/Course Creators',
    priority: 'P0',
    marketSize: '$35B (online learning)',
    currentSpend: '$49-399/mo (Kajabi, Teachable)',
    painPoint: 'Deep expertise but no video production skills',
    voiceOfCustomer: '"I know my craft inside out but can\'t make a video"',
    priceThreshold: '$15-50/mo',
    competitorPrice: 'Teachable: $39-199 | Kajabi: $149-399',
    valueDrivers: ['No video skills needed', 'Script-to-course', 'Camera anxiety removal'],
    buyingBehavior: 'Individual',
    decisionMaker: 'Self',
  },
  {
    id: 'traveler',
    name: 'Traveler & Experience',
    priority: 'P1',
    marketSize: '$8B',
    currentSpend: '$0-7/mo (GoPro Quik free, InShot $3.99)',
    painPoint: '500 photos from vacation, zero edited videos',
    voiceOfCustomer: '"500 photos from vacation, zero edited videos"',
    priceThreshold: '$5-10/mo MAX',
    competitorPrice: 'GoPro Quik: Free/$49/yr | InShot: $3.99',
    valueDrivers: ['Auto-editing', 'Trip memories', 'Easy mobile'],
    buyingBehavior: 'Individual',
    decisionMaker: 'Self',
  },
  {
    id: 'smb',
    name: 'SMB Marketing',
    priority: 'P0',
    marketSize: '$15B',
    currentSpend: '$22-67/mo (Synthesia)',
    painPoint: 'Synthesia is amazing but $67/month is too much',
    voiceOfCustomer: '"Synthesia is amazing but $67/month is too much"',
    priceThreshold: '$15-40/mo',
    competitorPrice: 'Synthesia: $22-67 | Loom: $12.50 | InVideo: $15-30',
    valueDrivers: ['Cost savings vs agency', 'Team collaboration', 'Quick turnaround'],
    buyingBehavior: 'Team',
    decisionMaker: 'Marketing Manager/Owner',
  },
  {
    id: 'education',
    name: 'Education & eLearning',
    priority: 'P1',
    marketSize: '$12B',
    currentSpend: '$0-249 (Camtasia one-time)',
    painPoint: '4 hours to make a 10-minute lesson video',
    voiceOfCustomer: '"4 hours to make a 10-minute lesson video"',
    priceThreshold: '$10-30/mo or $99-249 one-time',
    competitorPrice: 'Camtasia: $249 | Screencastify: Free-$49',
    valueDrivers: ['Lesson scripting', 'Accessibility', 'LMS integration'],
    buyingBehavior: 'Individual',
    decisionMaker: 'Teacher/Admin',
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Patient Education',
    priority: 'P0',
    marketSize: '$25B',
    currentSpend: '$50K+/year (Healthwise, VIDIZMO)',
    painPoint: 'Patients forget 80% of what I tell them',
    voiceOfCustomer: '"Patients forget 80% of what I tell them"',
    priceThreshold: '$50-200/mo per provider',
    competitorPrice: 'Healthwise: $50K+/yr | VIDIZMO: $1000+/mo',
    valueDrivers: ['HIPAA compliance', '95% cost savings', 'Patient outcomes'],
    buyingBehavior: 'Enterprise',
    decisionMaker: 'CMIO/CIO/Practice Manager',
  },
  {
    id: 'enterprise',
    name: 'Enterprise & Corporate',
    priority: 'P1',
    marketSize: '$40B',
    currentSpend: '$180-1000+/mo (HeyGen, Kaltura)',
    painPoint: 'Legal review takes 3 weeks per video',
    voiceOfCustomer: '"Legal review takes 3 weeks per video"',
    priceThreshold: '$100-500/mo',
    competitorPrice: 'HeyGen: $180+ | Kaltura: Custom',
    valueDrivers: ['Approval workflows', 'Localization', 'Security'],
    buyingBehavior: 'Enterprise',
    decisionMaker: 'L&D Manager/VP/Procurement',
  },
];

// =============================================================================
// PRICING MODEL OPTIONS
// =============================================================================
export interface PricingModel {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  complexity: 'Low' | 'Medium' | 'High';
  example: string;
}

export const pricingModels: PricingModel[] = [
  {
    id: 'tiered-all-access',
    name: 'Tiered All-Access',
    description: 'Full platform access at different feature tiers (Starter, Business, Pro)',
    pros: [
      'Simple to understand',
      'Predictable revenue',
      'Easy upgrade path',
      'Lower support overhead',
    ],
    cons: [
      'May overpay for unused features',
      'Less flexibility',
      'Price jumps between tiers',
    ],
    bestFor: ['Creator', 'Influencer', 'SMB'],
    complexity: 'Low',
    example: 'Starter: $9.99 | Business: $29.99 | Pro: $79.99',
  },
  {
    id: 'modular-product',
    name: 'Modular Product Access',
    description: 'Pay for specific products/modules you need (Script, Record, Edit, Publish separately)',
    pros: [
      'Pay only for what you use',
      'Lower entry price',
      'Upsell opportunities',
      'Segment-specific bundles',
    ],
    cons: [
      'Complex pricing page',
      'Feature confusion',
      'Higher cognitive load',
    ],
    bestFor: ['Knowledge Sharer', 'Education', 'Enterprise'],
    complexity: 'High',
    example: 'Script: $5 | Record: $5 | Edit: $10 | Publish: $5 | Bundle: $20',
  },
  {
    id: 'usage-based',
    name: 'Usage-Based (Credits/Tokens)',
    description: 'Pay per AI usage: scripts generated, TTS minutes, videos rendered',
    pros: [
      'Aligns cost with value',
      'Low entry barrier',
      'Scales with usage',
      'Fair for light users',
    ],
    cons: [
      'Unpredictable bills',
      'User anxiety',
      'Complex tracking',
    ],
    bestFor: ['Healthcare (per patient)', 'Enterprise (per video)'],
    complexity: 'Medium',
    example: '100 credits = $10 | 1 script = 5 credits | 1 TTS min = 2 credits',
  },
  {
    id: 'hybrid',
    name: 'Hybrid (Base + Usage)',
    description: 'Base subscription with included credits + pay-as-you-go for overages',
    pros: [
      'Predictable base cost',
      'Flexibility for heavy users',
      'Best of both worlds',
      'Clear value proposition',
    ],
    cons: [
      'More complex billing',
      'Requires credit tracking',
      'Potential overage surprise',
    ],
    bestFor: ['SMB', 'Healthcare', 'Enterprise'],
    complexity: 'Medium',
    example: 'Starter: $9.99 + 500 credits | Business: $29.99 + 2000 credits',
  },
  {
    id: 'segment-specific',
    name: 'Segment-Specific Plans',
    description: 'Different pricing pages/products for each vertical (Healthcare Plan, Creator Plan, etc.)',
    pros: [
      'Speaks to specific needs',
      'Premium pricing for enterprise',
      'Targeted marketing',
      'Compliance features isolated',
    ],
    cons: [
      'Multiple pricing pages',
      'Complex to maintain',
      'Users may feel excluded',
    ],
    bestFor: ['Healthcare', 'Enterprise', 'Education'],
    complexity: 'High',
    example: 'Creator Plan: $9.99 | Healthcare Plan: $99.99 (HIPAA included)',
  },
  {
    id: 'freemium-conversion',
    name: 'Freemium + Premium',
    description: 'Generous free tier with premium upsell (CapCut model)',
    pros: [
      'Massive user acquisition',
      'Word of mouth growth',
      'Low friction start',
      'Compete with free tools',
    ],
    cons: [
      'Low conversion rates (2-5%)',
      'High infrastructure costs',
      'Freeloaders',
    ],
    bestFor: ['Creator', 'Influencer', 'Traveler'],
    complexity: 'Low',
    example: 'Free: 3 videos/mo | Pro: $9.99 unlimited',
  },
];

// =============================================================================
// PRODUCT MODULES (What can be sold separately)
// =============================================================================
export interface ProductModule {
  id: string;
  name: string;
  category: 'Core' | 'AI' | 'Collaboration' | 'Publishing' | 'Compliance';
  description: string;
  standaloneValue: boolean;
  monthlyValue: string;
  creditsPerUse: number;
  targetSegments: string[];
  competitorComparison: string;
}

export const productModules: ProductModule[] = [
  // Core Modules
  {
    id: 'script-generation',
    name: 'AI Script Generation',
    category: 'AI',
    description: 'Generate video scripts from prompts, topics, or expertise',
    standaloneValue: true,
    monthlyValue: '$5-10',
    creditsPerUse: 5,
    targetSegments: ['creator', 'knowledge', 'smb', 'healthcare'],
    competitorComparison: 'ChatGPT: $20/mo | Jasper: $49/mo',
  },
  {
    id: 'tts-narration',
    name: 'AI Text-to-Speech (TTS)',
    category: 'AI',
    description: 'Multi-provider TTS with 100+ voices across languages',
    standaloneValue: true,
    monthlyValue: '$5-15',
    creditsPerUse: 2, // per minute
    targetSegments: ['creator', 'knowledge', 'smb', 'healthcare', 'enterprise'],
    competitorComparison: 'ElevenLabs: $5-22/mo | Murf: $19-59/mo',
  },
  {
    id: 'video-recording',
    name: 'Video Recording Studio',
    category: 'Core',
    description: 'Screen, camera, or hybrid recording with teleprompter',
    standaloneValue: true,
    monthlyValue: '$5-10',
    creditsPerUse: 0, // unlimited with subscription
    targetSegments: ['creator', 'influencer', 'education', 'smb'],
    competitorComparison: 'Loom: $12.50/mo | Riverside: $15/mo',
  },
  {
    id: 'video-editing',
    name: 'AI Video Editing',
    category: 'Core',
    description: 'Timeline editor with AI cuts, captions, effects',
    standaloneValue: true,
    monthlyValue: '$10-20',
    creditsPerUse: 0,
    targetSegments: ['creator', 'influencer', 'smb', 'enterprise'],
    competitorComparison: 'Descript: $12-24/mo | CapCut Pro: $7.99/mo',
  },
  {
    id: 'multi-platform-publish',
    name: 'Multi-Platform Publishing',
    category: 'Publishing',
    description: 'Export to TikTok, YouTube, Instagram, LinkedIn formats',
    standaloneValue: false,
    monthlyValue: '$3-5',
    creditsPerUse: 0,
    targetSegments: ['influencer', 'smb', 'creator'],
    competitorComparison: 'Buffer: $6/mo | Later: $18/mo',
  },
  {
    id: 'team-collaboration',
    name: 'Team Collaboration',
    category: 'Collaboration',
    description: 'Multi-user workspace, comments, version control',
    standaloneValue: false,
    monthlyValue: '$5-10 per seat',
    creditsPerUse: 0,
    targetSegments: ['smb', 'enterprise', 'education'],
    competitorComparison: 'Frame.io: $15/user | Vimeo: $7/user',
  },
  {
    id: 'approval-workflows',
    name: 'Approval Workflows',
    category: 'Collaboration',
    description: 'Multi-stage review and approval for compliance',
    standaloneValue: false,
    monthlyValue: '$10-20',
    creditsPerUse: 0,
    targetSegments: ['enterprise', 'healthcare'],
    competitorComparison: 'Enterprise-only feature in most tools',
  },
  {
    id: 'hipaa-compliance',
    name: 'HIPAA Compliance Suite',
    category: 'Compliance',
    description: 'BAA, audit logs, PHI handling, encryption',
    standaloneValue: true,
    monthlyValue: '$50-100',
    creditsPerUse: 0,
    targetSegments: ['healthcare'],
    competitorComparison: 'VIDIZMO: $1000+/mo | Healthwise: $50K+/yr',
  },
  {
    id: 'multi-language',
    name: 'Multi-Language Translation',
    category: 'AI',
    description: 'Auto-translate scripts and TTS to 50+ languages',
    standaloneValue: false,
    monthlyValue: '$5-10',
    creditsPerUse: 3, // per translation
    targetSegments: ['healthcare', 'enterprise', 'knowledge'],
    competitorComparison: 'Synthesia: $67/mo (140 languages)',
  },
  {
    id: 'lesson-builder',
    name: 'Lesson/Course Builder',
    category: 'Core',
    description: 'Structured course creation with AI lesson plans',
    standaloneValue: true,
    monthlyValue: '$10-20',
    creditsPerUse: 0,
    targetSegments: ['knowledge', 'education'],
    competitorComparison: 'Teachable: $39/mo (hosting only)',
  },
];

// =============================================================================
// PRICING PERMUTATIONS
// =============================================================================
export interface PricingPermutation {
  id: string;
  name: string;
  model: string;
  structure: string;
  tiers: PricingTier[];
  targetSegments: string[];
  estimatedConversion: string;
  competitivePosition: string;
  recommendation: 'Strong' | 'Medium' | 'Weak';
  reasoning: string;
}

export interface PricingTier {
  name: string;
  price: string;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  creditsIncluded?: number;
  features: string[];
  tokensPerMonth?: string;
  aiModelsIncluded?: string[];
  limitations?: string[];
}

export const pricingPermutations: PricingPermutation[] = [
  // =============================================================================
  // OPTION 1: CURRENT MODEL (Tiered All-Access)
  // =============================================================================
  {
    id: 'current-tiered',
    name: 'Current Tiered Model',
    model: 'tiered-all-access',
    structure: 'Full platform access at 3 tiers',
    tiers: [
      {
        name: 'Starter',
        price: '$9.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 500,
        tokensPerMonth: '50K tokens (~100 scripts)',
        aiModelsIncluded: ['GPT-4o-mini', 'Claude 3 Haiku', 'OpenAI TTS'],
        features: [
          'Unlimited recording',
          'AI script generation (100/mo)',
          '10 TTS voices',
          'Social publishing',
          'Offline recording',
        ],
        limitations: ['No team features', 'Basic support'],
      },
      {
        name: 'Business',
        price: '$29.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 2000,
        tokensPerMonth: '200K tokens (~400 scripts)',
        aiModelsIncluded: ['GPT-4o', 'Claude 3.5 Sonnet', 'ElevenLabs TTS'],
        features: [
          'Everything in Starter',
          'Product demos & testimonials',
          '3 team members',
          'Priority support',
          '500 AI scripts/month',
        ],
        limitations: ['Limited API access'],
      },
      {
        name: 'Pro',
        price: '$79.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 5000,
        tokensPerMonth: '500K tokens (~1000 scripts)',
        aiModelsIncluded: ['GPT-4o', 'Claude 3.5 Opus', 'ElevenLabs Pro', 'All TTS'],
        features: [
          'Everything in Business',
          'Lesson builder & training modules',
          '10 team members',
          'API access',
          '2000 AI scripts/month',
          'All TTS voices',
        ],
        limitations: [],
      },
    ],
    targetSegments: ['creator', 'influencer', 'smb'],
    estimatedConversion: '3-5%',
    competitivePosition: 'Matches Descript, undercuts Synthesia',
    recommendation: 'Medium',
    reasoning: 'Simple but doesn\'t address segment-specific needs or healthcare/enterprise',
  },

  // =============================================================================
  // OPTION 2: SEGMENT-SPECIFIC PLANS
  // =============================================================================
  {
    id: 'segment-specific',
    name: 'Segment-Specific Plans',
    model: 'segment-specific',
    structure: 'Different plans designed for each vertical',
    tiers: [
      {
        name: 'Creator Free',
        price: 'Free',
        billingCycle: 'monthly',
        creditsIncluded: 100,
        tokensPerMonth: '10K tokens (20 scripts)',
        aiModelsIncluded: ['GPT-4o-mini', 'Basic TTS'],
        features: ['3 videos/month', 'Basic editing', 'Watermark', '5 TTS voices'],
        limitations: ['Watermark', '3 exports/mo'],
      },
      {
        name: 'Creator Pro',
        price: '$9.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 500,
        tokensPerMonth: '50K tokens',
        aiModelsIncluded: ['GPT-4o-mini', 'Claude 3 Haiku', 'All TTS'],
        features: ['Unlimited videos', 'All effects', 'No watermark', 'Multi-platform export'],
        limitations: [],
      },
      {
        name: 'SMB Marketing',
        price: '$24.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 1500,
        tokensPerMonth: '150K tokens',
        aiModelsIncluded: ['GPT-4o', 'Claude 3.5 Sonnet', 'ElevenLabs'],
        features: ['Brand kit', '3 team members', 'Product demos', 'Approval flow'],
        limitations: [],
      },
      {
        name: 'Healthcare Essential',
        price: '$49.99/mo per provider',
        billingCycle: 'monthly',
        creditsIncluded: 2000,
        tokensPerMonth: '200K tokens',
        aiModelsIncluded: ['GPT-4o', 'Medical TTS', 'Multi-language'],
        features: ['HIPAA BAA', 'Patient videos', 'Multi-language', 'Audit logs'],
        limitations: ['No EHR integration (add-on)'],
      },
      {
        name: 'Healthcare Practice',
        price: '$199/mo',
        billingCycle: 'monthly',
        creditsIncluded: 10000,
        tokensPerMonth: '1M tokens',
        aiModelsIncluded: ['All models', 'All TTS', 'Custom voices'],
        features: ['Everything + EHR integration', 'Unlimited providers', 'Dedicated support'],
        limitations: [],
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        billingCycle: 'yearly',
        creditsIncluded: -1, // unlimited
        tokensPerMonth: 'Unlimited',
        aiModelsIncluded: ['All models + custom fine-tuning'],
        features: ['SSO/SAML', 'Approval workflows', 'API access', 'SLA', 'Localization'],
        limitations: [],
      },
    ],
    targetSegments: ['creator', 'smb', 'healthcare', 'enterprise'],
    estimatedConversion: '5-8%',
    competitivePosition: 'Unique positioning for each vertical',
    recommendation: 'Strong',
    reasoning: 'Addresses specific VoC pain points, premium pricing for healthcare, freemium for creators',
  },

  // =============================================================================
  // OPTION 3: MODULAR PRODUCT ACCESS
  // =============================================================================
  {
    id: 'modular-products',
    name: 'Modular Product Access',
    model: 'modular-product',
    structure: 'Buy individual products or bundles',
    tiers: [
      {
        name: 'Script Studio',
        price: '$4.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 300,
        tokensPerMonth: '30K tokens',
        aiModelsIncluded: ['GPT-4o-mini', 'Claude 3 Haiku'],
        features: ['AI script generation', 'Templates', 'Export to recording'],
        limitations: ['Script only, no editing'],
      },
      {
        name: 'Recording Studio',
        price: '$4.99/mo',
        billingCycle: 'monthly',
        features: ['Screen recording', 'Camera recording', 'Teleprompter', 'Offline mode'],
        limitations: ['No editing, no TTS'],
      },
      {
        name: 'Edit Suite',
        price: '$9.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 200,
        features: ['Timeline editor', 'AI captions', 'Effects library', 'Export formats'],
        limitations: ['No TTS included'],
      },
      {
        name: 'Voice Studio (TTS)',
        price: '$7.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 500,
        tokensPerMonth: 'TTS-only credits',
        aiModelsIncluded: ['OpenAI TTS', 'ElevenLabs', 'Google TTS'],
        features: ['All 100+ voices', 'Multi-language', 'Voice cloning (Pro)'],
        limitations: [],
      },
      {
        name: 'Creator Bundle',
        price: '$14.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 800,
        tokensPerMonth: '80K tokens',
        aiModelsIncluded: ['GPT-4o-mini', 'All TTS'],
        features: ['Script + Recording + Edit + Basic TTS'],
        limitations: ['10 TTS voices only'],
      },
      {
        name: 'Full Suite',
        price: '$29.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 2000,
        tokensPerMonth: '200K tokens',
        aiModelsIncluded: ['All models'],
        features: ['All products', 'All TTS voices', '3 team members'],
        limitations: [],
      },
    ],
    targetSegments: ['knowledge', 'education', 'smb'],
    estimatedConversion: '4-6%',
    competitivePosition: 'Low entry price, build-your-own flexibility',
    recommendation: 'Medium',
    reasoning: 'Flexible but complex pricing page may confuse users',
  },

  // =============================================================================
  // OPTION 4: HYBRID CREDITS + BASE
  // =============================================================================
  {
    id: 'hybrid-credits',
    name: 'Hybrid Credits Model',
    model: 'hybrid',
    structure: 'Base subscription + included credits + overage pricing',
    tiers: [
      {
        name: 'Starter',
        price: '$7.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 500,
        tokensPerMonth: '50K tokens',
        aiModelsIncluded: ['GPT-4o-mini', 'Basic TTS (5 voices)'],
        features: [
          '500 credits/mo included',
          'Script: 5 credits',
          'TTS min: 2 credits',
          'Video export: 1 credit',
          'Overage: $0.02/credit',
        ],
        limitations: ['Basic AI models only'],
      },
      {
        name: 'Growth',
        price: '$19.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 2000,
        tokensPerMonth: '200K tokens',
        aiModelsIncluded: ['GPT-4o', 'Claude 3.5 Sonnet', 'ElevenLabs (20 voices)'],
        features: [
          '2000 credits/mo included',
          'Premium AI models',
          '3 team members',
          'Overage: $0.015/credit',
        ],
        limitations: [],
      },
      {
        name: 'Scale',
        price: '$49.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 6000,
        tokensPerMonth: '600K tokens',
        aiModelsIncluded: ['All models', 'All TTS (100+ voices)', 'Custom fine-tuning'],
        features: [
          '6000 credits/mo included',
          'All AI models & TTS',
          '10 team members',
          'API access',
          'Overage: $0.01/credit',
        ],
        limitations: [],
      },
      {
        name: 'Healthcare',
        price: '$99.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 10000,
        tokensPerMonth: '1M tokens',
        aiModelsIncluded: ['Medical-optimized models', 'All TTS', 'HIPAA-compliant'],
        features: [
          '10000 credits/mo',
          'HIPAA BAA',
          'Patient video templates',
          'Multi-language',
          'Overage: $0.008/credit',
        ],
        limitations: [],
      },
    ],
    targetSegments: ['smb', 'healthcare', 'enterprise'],
    estimatedConversion: '5-7%',
    competitivePosition: 'Transparent usage-based pricing with predictable base',
    recommendation: 'Strong',
    reasoning: 'Aligns cost with value, predictable base, scales with usage',
  },

  // =============================================================================
  // OPTION 5: FREEMIUM + PREMIUM (CapCut Model)
  // =============================================================================
  {
    id: 'freemium-premium',
    name: 'Freemium + Premium',
    model: 'freemium-conversion',
    structure: 'Generous free tier with premium upsell',
    tiers: [
      {
        name: 'Free',
        price: 'Free',
        billingCycle: 'monthly',
        creditsIncluded: 100,
        tokensPerMonth: '10K tokens',
        aiModelsIncluded: ['GPT-4o-mini'],
        features: [
          '3 videos/month',
          '5 AI scripts/month',
          '3 TTS voices',
          'Watermark on exports',
          '720p export max',
        ],
        limitations: ['Watermark', '720p only', '3 exports/mo'],
      },
      {
        name: 'Pro',
        price: '$9.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 1000,
        tokensPerMonth: '100K tokens',
        aiModelsIncluded: ['GPT-4o-mini', 'Claude 3 Haiku', 'All TTS'],
        features: [
          'Unlimited videos',
          '100 AI scripts/month',
          'All 100+ TTS voices',
          'No watermark',
          '4K export',
        ],
        limitations: ['1 user only'],
      },
      {
        name: 'Team',
        price: '$24.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 3000,
        tokensPerMonth: '300K tokens',
        aiModelsIncluded: ['GPT-4o', 'Claude 3.5 Sonnet', 'ElevenLabs Pro'],
        features: [
          'Everything in Pro',
          '5 team members',
          'Brand kit',
          'Approval workflows',
          '500 AI scripts/month',
        ],
        limitations: [],
      },
      {
        name: 'Business',
        price: '$59.99/mo',
        billingCycle: 'monthly',
        creditsIncluded: 8000,
        tokensPerMonth: '800K tokens',
        aiModelsIncluded: ['All models', 'Custom voice cloning'],
        features: [
          'Everything in Team',
          'Unlimited team members',
          'API access',
          'Priority support',
          'Unlimited scripts',
        ],
        limitations: [],
      },
    ],
    targetSegments: ['creator', 'influencer', 'traveler', 'smb'],
    estimatedConversion: '2-4%',
    competitivePosition: 'Competes directly with CapCut free tier',
    recommendation: 'Strong',
    reasoning: 'Low barrier to entry, massive user acquisition, word of mouth',
  },

  // =============================================================================
  // OPTION 6: USAGE-BASED PURE (Per Video/Per Minute)
  // =============================================================================
  {
    id: 'usage-pure',
    name: 'Pure Usage-Based',
    model: 'usage-based',
    structure: 'Pay per video, per minute, or per action',
    tiers: [
      {
        name: 'Pay-As-You-Go',
        price: 'No subscription',
        billingCycle: 'one-time',
        features: [
          'Script generation: $0.50/script',
          'TTS narration: $0.10/minute',
          'Video export: $0.25/video',
          'AI captions: $0.05/minute',
          'Translation: $0.20/language',
        ],
        limitations: ['No included credits', 'Can be expensive for heavy users'],
      },
      {
        name: 'Credit Pack: Starter',
        price: '$9.99',
        billingCycle: 'one-time',
        creditsIncluded: 500,
        features: ['500 credits (~20 videos)', 'Never expires', 'All features'],
        limitations: [],
      },
      {
        name: 'Credit Pack: Growth',
        price: '$39.99',
        billingCycle: 'one-time',
        creditsIncluded: 2500,
        features: ['2500 credits (~100 videos)', 'Never expires', '10% bonus credits'],
        limitations: [],
      },
      {
        name: 'Credit Pack: Pro',
        price: '$99.99',
        billingCycle: 'one-time',
        creditsIncluded: 7500,
        features: ['7500 credits (~300 videos)', 'Never expires', '25% bonus credits'],
        limitations: [],
      },
    ],
    targetSegments: ['healthcare', 'enterprise'],
    estimatedConversion: '1-3%',
    competitivePosition: 'Ultra-flexible for sporadic users',
    recommendation: 'Weak',
    reasoning: 'Unpredictable revenue, user anxiety about costs, complex tracking',
  },
];

// =============================================================================
// AI MODEL TOKEN TRANSPARENCY
// =============================================================================
export interface AIModelTokenInfo {
  provider: string;
  model: string;
  contextWindow: string;
  inputCostPer1K: string;
  outputCostPer1K: string;
  bestFor: string[];
  tierAvailability: string[];
  tokensPerScript: string;
  recommendation: string;
}

export const aiModelTokenInfo: AIModelTokenInfo[] = [
  {
    provider: 'OpenAI',
    model: 'GPT-4o-mini',
    contextWindow: '128K tokens',
    inputCostPer1K: '$0.00015',
    outputCostPer1K: '$0.0006',
    bestFor: ['Quick scripts', 'Simple edits', 'High volume'],
    tierAvailability: ['Free', 'Starter', 'All'],
    tokensPerScript: '~500 tokens avg',
    recommendation: 'Best for cost-conscious users, 95% of use cases',
  },
  {
    provider: 'OpenAI',
    model: 'GPT-4o',
    contextWindow: '128K tokens',
    inputCostPer1K: '$0.0025',
    outputCostPer1K: '$0.01',
    bestFor: ['Complex scripts', 'Long-form content', 'Healthcare accuracy'],
    tierAvailability: ['Business', 'Pro', 'Healthcare'],
    tokensPerScript: '~500 tokens avg',
    recommendation: 'Best for quality-critical content',
  },
  {
    provider: 'Anthropic',
    model: 'Claude 3 Haiku',
    contextWindow: '200K tokens',
    inputCostPer1K: '$0.00025',
    outputCostPer1K: '$0.00125',
    bestFor: ['Creative writing', 'Conversational scripts', 'Fast responses'],
    tierAvailability: ['Starter', 'All'],
    tokensPerScript: '~600 tokens avg',
    recommendation: 'Best for creative, natural-sounding scripts',
  },
  {
    provider: 'Anthropic',
    model: 'Claude 3.5 Sonnet',
    contextWindow: '200K tokens',
    inputCostPer1K: '$0.003',
    outputCostPer1K: '$0.015',
    bestFor: ['Long documents', 'Research content', 'Nuanced topics'],
    tierAvailability: ['Business', 'Pro'],
    tokensPerScript: '~600 tokens avg',
    recommendation: 'Best for educational & healthcare content',
  },
  {
    provider: 'Google',
    model: 'Gemini 1.5 Pro',
    contextWindow: '1M tokens',
    inputCostPer1K: '$0.00125',
    outputCostPer1K: '$0.005',
    bestFor: ['Ultra-long context', 'Multi-document analysis', 'Research'],
    tierAvailability: ['Pro', 'Enterprise'],
    tokensPerScript: '~500 tokens avg',
    recommendation: 'Best for analyzing large source materials',
  },
];

// =============================================================================
// TTS VOICE PRICING INFO
// =============================================================================
export interface TTSVoiceInfo {
  provider: string;
  voiceCount: number;
  languages: number;
  costPerMinute: string;
  quality: 'Basic' | 'Standard' | 'Premium' | 'Ultra';
  tierAvailability: string[];
  bestFor: string[];
}

export const ttsVoiceInfo: TTSVoiceInfo[] = [
  {
    provider: 'OpenAI TTS',
    voiceCount: 6,
    languages: 57,
    costPerMinute: '$0.015',
    quality: 'Standard',
    tierAvailability: ['Free', 'All'],
    bestFor: ['General narration', 'Quick videos', 'Cost-conscious'],
  },
  {
    provider: 'ElevenLabs',
    voiceCount: 100,
    languages: 32,
    costPerMinute: '$0.18 (Pro) / $0.30 (Creator)',
    quality: 'Ultra',
    tierAvailability: ['Business', 'Pro', 'Healthcare'],
    bestFor: ['Natural sound', 'Emotional range', 'Premium content'],
  },
  {
    provider: 'Google Cloud TTS',
    voiceCount: 380,
    languages: 50,
    costPerMinute: '$0.016 (Standard) / $0.06 (WaveNet)',
    quality: 'Premium',
    tierAvailability: ['Starter', 'All'],
    bestFor: ['Multi-language', 'Accessibility', 'High volume'],
  },
  {
    provider: 'Azure Cognitive',
    voiceCount: 400,
    languages: 140,
    costPerMinute: '$0.016 (Neural)',
    quality: 'Premium',
    tierAvailability: ['Business', 'Pro'],
    bestFor: ['Enterprise', 'Global content', 'Accessibility'],
  },
];

// =============================================================================
// RECOMMENDED PRICING STRATEGY
// =============================================================================
export interface PricingRecommendation {
  priority: number;
  option: string;
  reasoning: string;
  targetSegments: string[];
  estimatedRevenue: string;
  implementationComplexity: 'Low' | 'Medium' | 'High';
  timeToMarket: string;
}

export const pricingRecommendations: PricingRecommendation[] = [
  {
    priority: 1,
    option: 'Hybrid: Freemium + Segment-Specific Premium',
    reasoning: 'Combines user acquisition (freemium for creators) with premium pricing for high-value segments (healthcare, enterprise). Addresses VoC: "$67/mo is too much" for SMB while enabling $100+/mo for healthcare.',
    targetSegments: ['All segments'],
    estimatedRevenue: 'Medium short-term, High long-term',
    implementationComplexity: 'Medium',
    timeToMarket: '2-3 weeks',
  },
  {
    priority: 2,
    option: 'Hybrid Credits (Option 4)',
    reasoning: 'Transparent usage-based pricing with predictable base. Aligns with AI cost structure. Users understand what they\'re paying for.',
    targetSegments: ['SMB', 'Healthcare', 'Enterprise'],
    estimatedRevenue: 'Medium-High',
    implementationComplexity: 'Medium',
    timeToMarket: '2-3 weeks',
  },
  {
    priority: 3,
    option: 'Segment-Specific Plans (Option 2)',
    reasoning: 'Speaks directly to each vertical\'s needs. Premium pricing for compliance-heavy segments. Marketing can target specific pain points.',
    targetSegments: ['Healthcare', 'Enterprise', 'SMB'],
    estimatedRevenue: 'High',
    implementationComplexity: 'High',
    timeToMarket: '3-4 weeks',
  },
];

// =============================================================================
// BUNDLE SUGGESTIONS BY SEGMENT
// =============================================================================
export interface SegmentBundle {
  segment: string;
  bundleName: string;
  includedModules: string[];
  price: string;
  valueProposition: string;
  competitorSavings: string;
}

export const segmentBundles: SegmentBundle[] = [
  {
    segment: 'creator',
    bundleName: 'Creator Pro Bundle',
    includedModules: ['script-generation', 'video-recording', 'video-editing', 'tts-narration', 'multi-platform-publish'],
    price: '$9.99/mo',
    valueProposition: 'All-in-one: script to publish in minutes, not hours',
    competitorSavings: 'Replaces CapCut Pro ($7.99) + Descript ($12) + Jasper ($49) = $68 → $9.99',
  },
  {
    segment: 'knowledge',
    bundleName: 'Course Creator Bundle',
    includedModules: ['script-generation', 'lesson-builder', 'video-recording', 'video-editing', 'tts-narration'],
    price: '$19.99/mo',
    valueProposition: 'Turn expertise into courses without video skills',
    competitorSavings: 'vs Kajabi ($149) + editing tools ($30) = $179 → $19.99',
  },
  {
    segment: 'healthcare',
    bundleName: 'Healthcare Essential',
    includedModules: ['script-generation', 'tts-narration', 'video-recording', 'hipaa-compliance', 'multi-language'],
    price: '$49.99/mo per provider',
    valueProposition: 'HIPAA-compliant patient videos at 95% less cost',
    competitorSavings: 'vs Healthwise ($50K/yr) = $4166/mo → $49.99',
  },
  {
    segment: 'smb',
    bundleName: 'Marketing Team Bundle',
    includedModules: ['script-generation', 'video-recording', 'video-editing', 'tts-narration', 'team-collaboration', 'approval-workflows'],
    price: '$29.99/mo',
    valueProposition: 'Agency-quality videos without the agency price',
    competitorSavings: 'vs Synthesia Teams ($67) + Loom ($12.50) = $79.50 → $29.99',
  },
  {
    segment: 'enterprise',
    bundleName: 'Enterprise Training Suite',
    includedModules: ['script-generation', 'video-editing', 'tts-narration', 'team-collaboration', 'approval-workflows', 'multi-language', 'lesson-builder'],
    price: 'Custom ($200-500/mo)',
    valueProposition: 'Training content in days not months, 40+ languages',
    competitorSavings: 'vs Kaltura (Custom) + HeyGen ($180+) + translation services',
  },
];

export default {
  segmentPricingProfiles,
  pricingModels,
  productModules,
  pricingPermutations,
  aiModelTokenInfo,
  ttsVoiceInfo,
  pricingRecommendations,
  segmentBundles,
};
