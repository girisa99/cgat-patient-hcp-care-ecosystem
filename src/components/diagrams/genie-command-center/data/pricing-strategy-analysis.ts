/**
 * Genie Suite — Comprehensive Pricing Strategy & Business Analysis
 * Created: 2026-02-19 (Sprint Day 4)
 *
 * Purpose: Evaluate cost of production, regional pricing, subscription combos,
 * competitive differentiation, unit economics, ARR/MRR projections, and breakeven
 * analysis to inform new pricing plans for landing pages.
 *
 * STATUS: OPTIONS FOR DISCUSSION — Not finalized
 */

// =============================================================================
// SECTION 1: COST OF PRODUCTION MODEL (What does it cost us per user?)
// =============================================================================

export interface CostPerAction {
  action: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costPerAction: number; // USD
  actionsPerUser: number; // avg per month per paying user
  monthlyUserCost: number; // costPerAction * actionsPerUser
  notes: string;
}

export const costPerAction: CostPerAction[] = [
  // --- AI Script Generation ---
  {
    action: 'Generate 5-min video script',
    provider: 'Google',
    model: 'Gemini 2.0 Flash',
    inputTokens: 1500,
    outputTokens: 2500,
    costPerAction: 0.0009,
    actionsPerUser: 20,
    monthlyUserCost: 0.018,
    notes: 'Default for Free/Starter. Cheapest option, 95% quality.',
  },
  {
    action: 'Generate 5-min video script',
    provider: 'OpenAI',
    model: 'GPT-4o-mini',
    inputTokens: 1500,
    outputTokens: 2500,
    costPerAction: 0.0017,
    actionsPerUser: 20,
    monthlyUserCost: 0.034,
    notes: 'Default for Creator tier. Good quality/cost balance.',
  },
  {
    action: 'Generate 5-min video script',
    provider: 'Anthropic',
    model: 'Claude 3.5 Haiku',
    inputTokens: 1500,
    outputTokens: 2500,
    costPerAction: 0.0035,
    actionsPerUser: 15,
    monthlyUserCost: 0.053,
    notes: 'Creative writing tier. Better tone/natural language.',
  },
  {
    action: 'Generate 5-min video script',
    provider: 'OpenAI',
    model: 'GPT-4o',
    inputTokens: 1500,
    outputTokens: 2500,
    costPerAction: 0.029,
    actionsPerUser: 30,
    monthlyUserCost: 0.87,
    notes: 'Business/Pro tier. High quality, 15x more expensive.',
  },
  {
    action: 'Generate 5-min video script',
    provider: 'Anthropic',
    model: 'Claude 3.5 Sonnet',
    inputTokens: 1500,
    outputTokens: 2500,
    costPerAction: 0.042,
    actionsPerUser: 25,
    monthlyUserCost: 1.05,
    notes: 'Healthcare/Enterprise. Best for nuanced medical content.',
  },
  // --- TTS Narration ---
  {
    action: '5-min TTS narration',
    provider: 'OpenAI',
    model: 'TTS-1',
    inputTokens: 0,
    outputTokens: 0,
    costPerAction: 0.075, // $0.015/min * 5 min
    actionsPerUser: 10,
    monthlyUserCost: 0.75,
    notes: 'Free/Starter default. 6 voices, decent quality.',
  },
  {
    action: '5-min TTS narration',
    provider: 'Google',
    model: 'Cloud TTS WaveNet',
    inputTokens: 0,
    outputTokens: 0,
    costPerAction: 0.30, // $0.06/min * 5 min
    actionsPerUser: 10,
    monthlyUserCost: 3.00,
    notes: 'Creator/Business tier. 400+ voices, 50 languages.',
  },
  {
    action: '5-min TTS narration',
    provider: 'ElevenLabs',
    model: 'Pro',
    inputTokens: 0,
    outputTokens: 0,
    costPerAction: 0.90, // $0.18/min * 5 min
    actionsPerUser: 15,
    monthlyUserCost: 13.50,
    notes: 'Pro/Healthcare tier. Ultra quality, voice cloning.',
  },
  // --- Translation ---
  {
    action: 'Translate script (1500 words)',
    provider: 'Google',
    model: 'Cloud Translation v3',
    inputTokens: 1500,
    outputTokens: 1500,
    costPerAction: 0.03, // $20 per 1M chars
    actionsPerUser: 3,
    monthlyUserCost: 0.09,
    notes: 'Standard translation. Good for common languages.',
  },
  {
    action: 'Translate script (1500 words)',
    provider: 'DeepL',
    model: 'API Pro',
    inputTokens: 1500,
    outputTokens: 1500,
    costPerAction: 0.038, // $25 per 1M chars
    actionsPerUser: 3,
    monthlyUserCost: 0.114,
    notes: 'Premium translation. Better nuance, EU languages.',
  },
  // --- Video Processing ---
  {
    action: 'Video export (5-min, 1080p)',
    provider: 'Internal',
    model: 'FFmpeg/Cloud Functions',
    inputTokens: 0,
    outputTokens: 0,
    costPerAction: 0.15, // compute + storage + bandwidth
    actionsPerUser: 8,
    monthlyUserCost: 1.20,
    notes: 'Supabase Edge Functions + Netlify bandwidth.',
  },
  {
    action: 'AI Captions (5-min video)',
    provider: 'OpenAI',
    model: 'Whisper',
    inputTokens: 0,
    outputTokens: 0,
    costPerAction: 0.03, // $0.006/min * 5 min
    actionsPerUser: 8,
    monthlyUserCost: 0.24,
    notes: 'STT for auto-captions. Very affordable.',
  },
];

// =============================================================================
// SECTION 2: BLENDED COST PER USER BY TIER
// =============================================================================

export interface TierCostModel {
  tier: string;
  proposedPrice: number;
  annualPrice: number; // per month when billed annually
  // Variable costs (per user per month)
  aiScriptCost: number;
  ttsCost: number;
  translationCost: number;
  videoProcessingCost: number;
  captionsCost: number;
  storageCost: number;
  totalVariableCost: number;
  // Fixed costs allocated per user (based on user count assumptions)
  infraSharePerUser: number;
  supportSharePerUser: number;
  totalCostPerUser: number;
  // Margins
  grossMarginMonthly: number;
  grossMarginPercent: number;
  // Key assumptions
  assumedUsageLevel: string;
  scriptsPerMonth: number;
  ttsMinutesPerMonth: number;
  videoExportsPerMonth: number;
}

export const tierCostModels: TierCostModel[] = [
  {
    tier: 'Free',
    proposedPrice: 0,
    annualPrice: 0,
    aiScriptCost: 0.009, // 10 scripts @ Gemini Flash
    ttsCost: 0.15,       // 2 min TTS @ OpenAI
    translationCost: 0,
    videoProcessingCost: 0.45, // 3 exports
    captionsCost: 0.06,
    storageCost: 0.05,   // 500MB
    totalVariableCost: 0.72,
    infraSharePerUser: 0.02, // At scale (10K+ free users)
    supportSharePerUser: 0,
    totalCostPerUser: 0.74,
    grossMarginMonthly: -0.74,
    grossMarginPercent: -100,
    assumedUsageLevel: 'Very Light — loss leader for conversion',
    scriptsPerMonth: 10,
    ttsMinutesPerMonth: 2,
    videoExportsPerMonth: 3,
  },
  {
    tier: 'Starter',
    proposedPrice: 7.99,
    annualPrice: 5.99,
    aiScriptCost: 0.034,  // 20 scripts @ GPT-4o-mini
    ttsCost: 0.75,        // 10 min TTS @ OpenAI TTS-1
    translationCost: 0,
    videoProcessingCost: 1.20, // 8 exports
    captionsCost: 0.24,
    storageCost: 0.10,    // 1GB
    totalVariableCost: 2.32,
    infraSharePerUser: 0.15,
    supportSharePerUser: 0.10,
    totalCostPerUser: 2.57,
    grossMarginMonthly: 5.42,
    grossMarginPercent: 67.8,
    assumedUsageLevel: 'Light — casual creator, 2 videos/week',
    scriptsPerMonth: 20,
    ttsMinutesPerMonth: 10,
    videoExportsPerMonth: 8,
  },
  {
    tier: 'Creator',
    proposedPrice: 14.99,
    annualPrice: 11.99,
    aiScriptCost: 0.085,  // 50 scripts @ GPT-4o-mini
    ttsCost: 3.00,        // 50 min TTS @ Google WaveNet
    translationCost: 0.09,// 3 translations @ Google
    videoProcessingCost: 3.00, // 20 exports
    captionsCost: 0.60,
    storageCost: 0.25,    // 5GB
    totalVariableCost: 7.03,
    infraSharePerUser: 0.30,
    supportSharePerUser: 0.25,
    totalCostPerUser: 7.58,
    grossMarginMonthly: 7.41,
    grossMarginPercent: 49.4,
    assumedUsageLevel: 'Medium — active creator, 5 videos/week',
    scriptsPerMonth: 50,
    ttsMinutesPerMonth: 50,
    videoExportsPerMonth: 20,
  },
  {
    tier: 'Business',
    proposedPrice: 29.99,
    annualPrice: 24.99,
    aiScriptCost: 0.87,   // 30 scripts @ GPT-4o
    ttsCost: 5.40,        // 30 min TTS @ Google WaveNet + some ElevenLabs
    translationCost: 0.23,// 6 translations
    videoProcessingCost: 4.50, // 30 exports
    captionsCost: 0.90,
    storageCost: 0.50,    // 10GB
    totalVariableCost: 12.40,
    infraSharePerUser: 0.50,
    supportSharePerUser: 0.75,
    totalCostPerUser: 13.65,
    grossMarginMonthly: 16.34,
    grossMarginPercent: 54.5,
    assumedUsageLevel: 'Active — SMB team, 1 video/day, 3 seats',
    scriptsPerMonth: 100,
    ttsMinutesPerMonth: 60,
    videoExportsPerMonth: 30,
  },
  {
    tier: 'Pro',
    proposedPrice: 59.99,
    annualPrice: 49.99,
    aiScriptCost: 1.75,   // 60 scripts mixed GPT-4o + Claude Sonnet
    ttsCost: 13.50,       // 75 min TTS @ ElevenLabs Pro
    translationCost: 0.76,// 20 translations
    videoProcessingCost: 7.50, // 50 exports
    captionsCost: 1.50,
    storageCost: 1.25,    // 25GB
    totalVariableCost: 26.26,
    infraSharePerUser: 0.75,
    supportSharePerUser: 1.50,
    totalCostPerUser: 28.51,
    grossMarginMonthly: 31.48,
    grossMarginPercent: 52.5,
    assumedUsageLevel: 'Heavy — agency/team, daily production, 10 seats',
    scriptsPerMonth: 200,
    ttsMinutesPerMonth: 150,
    videoExportsPerMonth: 50,
  },
  {
    tier: 'Healthcare',
    proposedPrice: 99.99,
    annualPrice: 84.99,
    aiScriptCost: 2.10,   // 50 scripts @ Claude Sonnet (medical accuracy)
    ttsCost: 9.00,        // 50 min TTS @ ElevenLabs (patient-friendly)
    translationCost: 1.14,// 30 translations (multi-language patient ed)
    videoProcessingCost: 7.50,// 50 exports
    captionsCost: 1.50,
    storageCost: 2.50,    // 50GB (HIPAA encrypted)
    totalVariableCost: 23.74,
    infraSharePerUser: 2.00, // HIPAA infra overhead
    supportSharePerUser: 5.00, // Dedicated support
    totalCostPerUser: 30.74,
    grossMarginMonthly: 69.25,
    grossMarginPercent: 69.3,
    assumedUsageLevel: 'Specialized — per provider, 10 patient videos/week',
    scriptsPerMonth: 200,
    ttsMinutesPerMonth: 100,
    videoExportsPerMonth: 50,
  },
  {
    tier: 'Enterprise',
    proposedPrice: 249.99,
    annualPrice: 199.99,
    aiScriptCost: 5.25,   // 150 scripts mixed premium models
    ttsCost: 27.00,       // 150 min TTS @ ElevenLabs
    translationCost: 3.80,// 100 translations (40+ languages)
    videoProcessingCost: 15.00,// 100 exports
    captionsCost: 3.00,
    storageCost: 6.25,    // 100GB
    totalVariableCost: 60.30,
    infraSharePerUser: 3.00,
    supportSharePerUser: 10.00,// Dedicated CSM
    totalCostPerUser: 73.30,
    grossMarginMonthly: 176.69,
    grossMarginPercent: 70.7,
    assumedUsageLevel: 'Enterprise — L&D team, 25+ seats, daily production',
    scriptsPerMonth: 500,
    ttsMinutesPerMonth: 300,
    videoExportsPerMonth: 100,
  },
];

// =============================================================================
// SECTION 3: INFRASTRUCTURE FIXED COSTS (Monthly Burn)
// =============================================================================

export interface FixedCostByStage {
  stage: string;
  userRange: string;
  monthlyMRR: string;
  supabase: number;
  hosting: number;
  email: number;
  devTools: number;
  monitoring: number;
  aiMinimums: number; // Minimum API commitments
  totalFixed: number;
  devTeamCost: number; // Engineering team
  totalBurn: number;   // Fixed + dev team
  notes: string;
}

export const fixedCostsByStage: FixedCostByStage[] = [
  {
    stage: 'Pre-Launch (Current)',
    userRange: '0-100 beta users',
    monthlyMRR: '$0',
    supabase: 25,
    hosting: 19,
    email: 20,
    devTools: 24,
    monitoring: 26,
    aiMinimums: 0,
    totalFixed: 114,
    devTeamCost: 0, // Claude Code + Lovable (tools only)
    totalBurn: 114,
    notes: 'Minimal fixed costs. All dev via AI tools.',
  },
  {
    stage: 'Early Traction',
    userRange: '100-1,000 users',
    monthlyMRR: '$500-$5K',
    supabase: 25,
    hosting: 19,
    email: 20,
    devTools: 24,
    monitoring: 26,
    aiMinimums: 50,
    totalFixed: 164,
    devTeamCost: 5000, // 1 part-time dev
    totalBurn: 5164,
    notes: 'First hire needed for support + bug fixes.',
  },
  {
    stage: 'Growth',
    userRange: '1,000-10,000 users',
    monthlyMRR: '$5K-$50K',
    supabase: 599, // Team tier for SOC2
    hosting: 99,   // Business tier
    email: 20,
    devTools: 48,
    monitoring: 89,
    aiMinimums: 200,
    totalFixed: 1055,
    devTeamCost: 25000, // 2 FT devs + 1 support
    totalBurn: 26055,
    notes: 'SOC2 needed for healthcare. Team tier Supabase.',
  },
  {
    stage: 'Scale',
    userRange: '10,000-100,000 users',
    monthlyMRR: '$50K-$500K',
    supabase: 599,
    hosting: 399,
    email: 400,
    devTools: 96,
    monitoring: 300,
    aiMinimums: 1000,
    totalFixed: 2794,
    devTeamCost: 100000, // 5 devs + 2 support + 1 PM
    totalBurn: 102794,
    notes: 'Enterprise infra. Negotiate AI API volume discounts.',
  },
];

// =============================================================================
// SECTION 4: REGIONAL PRICING STRATEGY
// =============================================================================

export interface RegionalPricing {
  region: string;
  countries: string[];
  pppFactor: number; // Purchasing Power Parity multiplier
  currency: string;
  starterPrice: number;
  creatorPrice: number;
  businessPrice: number;
  proPrice: number;
  healthcarePrice: number;
  enterprisePrice: number;
  estimatedMarketSize: string;
  estimatedAdoptionRate: string;
  paymentMethods: string[];
  notes: string;
}

export const regionalPricing: RegionalPricing[] = [
  {
    region: 'North America',
    countries: ['US', 'Canada'],
    pppFactor: 1.0,
    currency: 'USD',
    starterPrice: 7.99,
    creatorPrice: 14.99,
    businessPrice: 29.99,
    proPrice: 59.99,
    healthcarePrice: 99.99,
    enterprisePrice: 249.99,
    estimatedMarketSize: '45% of TAM',
    estimatedAdoptionRate: '3-5% conversion from free',
    paymentMethods: ['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay'],
    notes: 'Anchor market. Full pricing. Highest willingness to pay.',
  },
  {
    region: 'Western Europe',
    countries: ['UK', 'DE', 'FR', 'NL', 'Nordic', 'IT', 'ES'],
    pppFactor: 0.90,
    currency: 'EUR/GBP',
    starterPrice: 6.99,
    creatorPrice: 12.99,
    businessPrice: 26.99,
    proPrice: 52.99,
    healthcarePrice: 89.99,
    enterprisePrice: 219.99,
    estimatedMarketSize: '25% of TAM',
    estimatedAdoptionRate: '3-5% conversion',
    paymentMethods: ['Credit Card', 'SEPA', 'PayPal', 'iDEAL'],
    notes: 'Strong market. Slight PPP adjustment. GDPR compliance required.',
  },
  {
    region: 'India',
    countries: ['IN'],
    pppFactor: 0.25,
    currency: 'INR',
    starterPrice: 1.99,    // ~165 INR
    creatorPrice: 3.99,    // ~330 INR
    businessPrice: 7.99,   // ~665 INR
    proPrice: 14.99,       // ~1,250 INR
    healthcarePrice: 24.99,// ~2,080 INR
    enterprisePrice: 59.99,// ~4,999 INR
    estimatedMarketSize: '10% of TAM',
    estimatedAdoptionRate: '5-8% conversion (price-sensitive, high volume)',
    paymentMethods: ['UPI', 'Razorpay', 'Credit Card', 'Net Banking', 'Paytm'],
    notes: 'Massive creator market (50M+ creators). Volume play. Canva model works here.',
  },
  {
    region: 'Southeast Asia',
    countries: ['ID', 'PH', 'VN', 'TH', 'MY', 'SG'],
    pppFactor: 0.35,
    currency: 'USD/Local',
    starterPrice: 2.99,
    creatorPrice: 4.99,
    businessPrice: 9.99,
    proPrice: 19.99,
    healthcarePrice: 34.99,
    enterprisePrice: 79.99,
    estimatedMarketSize: '8% of TAM',
    estimatedAdoptionRate: '4-7% conversion',
    paymentMethods: ['GrabPay', 'GCash', 'Credit Card', 'Bank Transfer', 'Dana'],
    notes: 'Fast-growing creator economy. Mobile-first market. TikTok dominant.',
  },
  {
    region: 'Latin America',
    countries: ['BR', 'MX', 'CO', 'AR', 'CL'],
    pppFactor: 0.40,
    currency: 'USD/BRL/MXN',
    starterPrice: 2.99,
    creatorPrice: 5.99,
    businessPrice: 11.99,
    proPrice: 24.99,
    healthcarePrice: 39.99,
    enterprisePrice: 99.99,
    estimatedMarketSize: '5% of TAM',
    estimatedAdoptionRate: '3-6% conversion',
    paymentMethods: ['PIX (BR)', 'OXXO (MX)', 'Credit Card', 'MercadoPago'],
    notes: 'Growing fast. Brazil is key. Portuguese/Spanish TTS critical.',
  },
  {
    region: 'Middle East & Africa',
    countries: ['AE', 'SA', 'NG', 'KE', 'ZA', 'EG'],
    pppFactor: 0.50,
    currency: 'USD/AED/ZAR',
    starterPrice: 3.99,
    creatorPrice: 7.99,
    businessPrice: 14.99,
    proPrice: 29.99,
    healthcarePrice: 49.99,
    enterprisePrice: 124.99,
    estimatedMarketSize: '4% of TAM',
    estimatedAdoptionRate: '2-4% conversion',
    paymentMethods: ['Credit Card', 'M-Pesa (Africa)', 'Apple Pay', 'STC Pay (SA)'],
    notes: 'Gulf states have high willingness to pay. Africa is volume play.',
  },
  {
    region: 'East Asia',
    countries: ['JP', 'KR', 'TW'],
    pppFactor: 0.75,
    currency: 'JPY/KRW/TWD',
    starterPrice: 5.99,
    creatorPrice: 10.99,
    businessPrice: 22.99,
    proPrice: 44.99,
    healthcarePrice: 74.99,
    enterprisePrice: 189.99,
    estimatedMarketSize: '3% of TAM',
    estimatedAdoptionRate: '2-4% conversion',
    paymentMethods: ['Credit Card', 'Konbini (JP)', 'KakaoPay (KR)', 'LINE Pay'],
    notes: 'Quality-conscious. Good for Pro/Enterprise tiers. Localization critical.',
  },
];

// =============================================================================
// SECTION 5: RECOMMENDED SUBSCRIPTION COMBINATIONS (NEW PLANS)
// =============================================================================

export interface ProposedPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  annualSavingsPercent: number;
  targetSegments: string[];
  products: string[]; // Which Genie products included
  aiModel: string;
  ttsProvider: string;
  keyFeatures: string[];
  limitations: string[];
  competitorComparison: string;
  competitorPrice: string;
  ourAdvantage: string;
  estimatedCostPerUser: number;
  estimatedGrossMargin: number;
  conversionTarget: string;
}

export const proposedPlans: ProposedPlan[] = [
  // --- TIER 0: FREE (Acquisition Engine) ---
  {
    id: 'free',
    name: 'Spark Free',
    tagline: 'Create your first AI video in 60 seconds',
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    annualSavingsPercent: 0,
    targetSegments: ['Creator', 'Influencer', 'Traveler', 'Student'],
    products: ['Genie Spark (limited)', 'Genie Mind (basic TTS)'],
    aiModel: 'Gemini 2.0 Flash',
    ttsProvider: 'OpenAI TTS-1 (3 voices)',
    keyFeatures: [
      '10 AI scripts/month',
      '3 video exports/month (720p, watermarked)',
      '2 min TTS/month',
      'Basic editing tools',
      'Community templates',
    ],
    limitations: [
      'Watermark on exports',
      '720p max resolution',
      '3 exports/month',
      'No team features',
      'No API access',
    ],
    competitorComparison: 'vs CapCut Free, Canva Free, InShot Free',
    competitorPrice: '$0',
    ourAdvantage: 'AI script generation — no competitor free tier has this',
    estimatedCostPerUser: 0.74,
    estimatedGrossMargin: -100,
    conversionTarget: '5-8% to Starter within 30 days',
  },

  // --- TIER 1: STARTER (Entry Paid) ---
  {
    id: 'starter',
    name: 'Spark Starter',
    tagline: 'Your AI video studio for the price of a coffee',
    monthlyPrice: 7.99,
    annualMonthlyPrice: 5.99,
    annualSavingsPercent: 25,
    targetSegments: ['Creator', 'Influencer', 'Traveler'],
    products: ['Genie Spark', 'Genie Mind (standard TTS)'],
    aiModel: 'GPT-4o-mini',
    ttsProvider: 'OpenAI TTS-1 (6 voices) + Google TTS (10 voices)',
    keyFeatures: [
      'Unlimited AI scripts',
      '30 video exports/month (1080p, no watermark)',
      '30 min TTS/month',
      'All editing tools + effects',
      'Multi-platform export (TikTok, YT, IG, LinkedIn)',
      'Offline editing',
    ],
    limitations: [
      '1 user only',
      'No team features',
      'Standard support',
      'No API',
    ],
    competitorComparison: 'vs CapCut Pro ($7.99), Descript Hobbyist ($16), InShot Pro ($3.99)',
    competitorPrice: '$4-16/mo',
    ourAdvantage: 'Script + TTS + editing + publishing in one tool. CapCut has no AI scripts. Descript is 2x price.',
    estimatedCostPerUser: 2.57,
    estimatedGrossMargin: 67.8,
    conversionTarget: '15-20% upgrade to Creator within 90 days',
  },

  // --- TIER 2: CREATOR (Power User) ---
  {
    id: 'creator',
    name: 'Creator Suite',
    tagline: 'Everything you need to create, brand, and publish',
    monthlyPrice: 14.99,
    annualMonthlyPrice: 11.99,
    annualSavingsPercent: 20,
    targetSegments: ['Creator', 'Influencer', 'Knowledge Sharer'],
    products: ['Genie Spark', 'Genie Mind (premium TTS)', 'Genie Deck (basic)'],
    aiModel: 'GPT-4o-mini + Claude 3.5 Haiku',
    ttsProvider: 'Google WaveNet (50 voices) + Azure Neural (20 voices)',
    keyFeatures: [
      'Everything in Starter',
      '100 video exports/month (4K)',
      '90 min TTS/month',
      '3 translations/month',
      'Brand kit (logos, colors, fonts)',
      'AI captions in 32 languages',
      'Content calendar',
      'Basic analytics',
    ],
    limitations: [
      '1 user (can invite 1 collaborator)',
      'No approval workflows',
      'Email support',
    ],
    competitorComparison: 'vs Descript Creator ($24), Synthesia Starter ($18), Riverside Pro ($24)',
    competitorPrice: '$18-24/mo',
    ourAdvantage: '40% cheaper than Descript. Script-first workflow unique. Presentation slides included (Deck).',
    estimatedCostPerUser: 7.58,
    estimatedGrossMargin: 49.4,
    conversionTarget: '10-15% upgrade to Business within 6 months',
  },

  // --- TIER 3: BUSINESS (Teams) ---
  {
    id: 'business',
    name: 'Business Team',
    tagline: 'Agency-quality video production for your whole team',
    monthlyPrice: 29.99,
    annualMonthlyPrice: 24.99,
    annualSavingsPercent: 17,
    targetSegments: ['SMB', 'Marketing Teams', 'Agencies'],
    products: ['Genie Spark', 'Genie Mind (all TTS)', 'Genie Deck', 'Genie Cast (basic)'],
    aiModel: 'GPT-4o + Claude 3.5 Haiku',
    ttsProvider: 'All providers (100+ voices, 50+ languages)',
    keyFeatures: [
      'Everything in Creator',
      '5 team seats included (+$5/seat)',
      '300 video exports/month',
      '300 min TTS/month',
      '10 translations/month',
      'Approval workflows',
      'Shared asset library',
      'Priority support',
      'Podcast creation (Cast basic)',
    ],
    limitations: [
      'No HIPAA compliance',
      'No API access',
      'No custom voice cloning',
    ],
    competitorComparison: 'vs Synthesia Teams ($67), Descript Business ($50), Canva Teams ($10/user)',
    competitorPrice: '$50-67/mo',
    ourAdvantage: '55% cheaper than Synthesia Teams. Includes podcasting (Genie Cast). Approval workflows built-in.',
    estimatedCostPerUser: 13.65,
    estimatedGrossMargin: 54.5,
    conversionTarget: '8-12% upgrade to Pro within 12 months',
  },

  // --- TIER 4: PRO (Power Teams / Small Agency) ---
  {
    id: 'pro',
    name: 'Pro Studio',
    tagline: 'Unlimited creation for agencies and power teams',
    monthlyPrice: 59.99,
    annualMonthlyPrice: 49.99,
    annualSavingsPercent: 17,
    targetSegments: ['Agencies', 'Enterprise L&D', 'Course Creators', 'Media Companies'],
    products: ['All 7 Genie Products'],
    aiModel: 'GPT-4o + Claude 3.5 Sonnet + Gemini Pro',
    ttsProvider: 'All providers + ElevenLabs Pro + Voice Cloning',
    keyFeatures: [
      'Everything in Business',
      '15 team seats included (+$5/seat)',
      'Unlimited video exports',
      'Unlimited TTS',
      '50 translations/month',
      'API access (10K calls/month)',
      'Voice cloning (5 custom voices)',
      'White-label exports',
      'Advanced analytics',
      'SSO (Google, Microsoft)',
      'All 7 Genie products (Spark, Mind, Deck, Vibe, Cast, Ask, Hub)',
    ],
    limitations: [
      'No HIPAA/BAA',
      'No dedicated CSM',
    ],
    competitorComparison: 'vs Synthesia Enterprise (Custom), Descript Business ($50), Kaltura (Custom)',
    competitorPrice: '$100-500/mo',
    ourAdvantage: 'All 7 products for $60 vs buying 7 separate tools ($300+). Voice cloning included. API access.',
    estimatedCostPerUser: 28.51,
    estimatedGrossMargin: 52.5,
    conversionTarget: '5% upgrade to Enterprise within 12 months',
  },

  // --- TIER 5: HEALTHCARE (Vertical-Specific) ---
  {
    id: 'healthcare',
    name: 'Healthcare Suite',
    tagline: 'HIPAA-compliant patient education at 95% less cost',
    monthlyPrice: 99.99,
    annualMonthlyPrice: 84.99,
    annualSavingsPercent: 15,
    targetSegments: ['Healthcare', 'Clinics', 'Hospitals', 'Telehealth'],
    products: ['All 7 Genie Products + HIPAA Module'],
    aiModel: 'Claude 3.5 Sonnet (medical accuracy) + GPT-4o',
    ttsProvider: 'ElevenLabs Pro (patient-friendly voices) + Azure Neural (medical)',
    keyFeatures: [
      'Everything in Pro',
      'HIPAA BAA included',
      'PHI-safe video creation',
      'Audit logs & compliance dashboard',
      '50+ language patient education',
      '25 provider seats included',
      'EHR integration ready (Epic, Cerner)',
      'Patient-facing video portal',
      'Medical terminology AI',
      'Dedicated support',
    ],
    limitations: [
      'EHR integration setup: additional one-time fee',
    ],
    competitorComparison: 'vs Healthwise ($50K+/yr), VIDIZMO ($1K+/mo), Emmi Solutions ($30K+/yr)',
    competitorPrice: '$1,000-4,166/mo',
    ourAdvantage: '90-95% cheaper. Provider-created personalized content. AI-powered vs static library.',
    estimatedCostPerUser: 30.74,
    estimatedGrossMargin: 69.3,
    conversionTarget: 'N/A — direct sales to healthcare orgs',
  },

  // --- TIER 6: ENTERPRISE (Custom) ---
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Scale video production across your organization',
    monthlyPrice: 249.99,
    annualMonthlyPrice: 199.99,
    annualSavingsPercent: 20,
    targetSegments: ['Enterprise', 'Fortune 500', 'Government', 'Global Orgs'],
    products: ['All Products + Custom Modules'],
    aiModel: 'All models + custom fine-tuning option',
    ttsProvider: 'All providers + unlimited voice cloning + custom voice training',
    keyFeatures: [
      'Everything in Pro',
      'Unlimited seats',
      'SAML SSO + SCIM provisioning',
      'Custom AI model training',
      'Unlimited translations (100+ languages)',
      'Dedicated Customer Success Manager',
      'SLA (99.9% uptime)',
      'On-premises deployment option',
      'Custom integrations (Slack, Teams, Salesforce)',
      'Advanced security (SOC2 Type II, ISO 27001)',
      'Volume discounts',
    ],
    limitations: [],
    competitorComparison: 'vs Kaltura (Custom), Brightcove ($500+/mo), Microsoft Stream (bundled)',
    competitorPrice: '$500-5,000/mo',
    ourAdvantage: 'Modern AI-first vs legacy platforms. Instant setup vs weeks. 10x faster content production.',
    estimatedCostPerUser: 73.30,
    estimatedGrossMargin: 70.7,
    conversionTarget: 'N/A — direct enterprise sales, 6-12 month cycle',
  },
];

// =============================================================================
// SECTION 6: COMPETITIVE PRICE POSITIONING MAP
// =============================================================================

export interface CompetitivePricePosition {
  competitor: string;
  segment: string;
  theirStarterPrice: number;
  theirProPrice: number;
  ourEquivalentTier: string;
  ourPrice: number;
  priceDifference: string;
  ourValueAdd: string;
}

export const competitivePricePositions: CompetitivePricePosition[] = [
  // Creator segment
  { competitor: 'CapCut Pro', segment: 'Creator', theirStarterPrice: 7.99, theirProPrice: 7.99, ourEquivalentTier: 'Starter', ourPrice: 7.99, priceDifference: 'Same price', ourValueAdd: '+AI scripts, +TTS narration, +multi-platform templates' },
  { competitor: 'Descript', segment: 'Creator', theirStarterPrice: 16, theirProPrice: 24, ourEquivalentTier: 'Creator', ourPrice: 14.99, priceDifference: '38% cheaper', ourValueAdd: '+Script generation, +presentation slides, +mobile editing' },
  { competitor: 'InVideo', segment: 'Creator', theirStarterPrice: 20, theirProPrice: 48, ourEquivalentTier: 'Creator', ourPrice: 14.99, priceDifference: '25-69% cheaper', ourValueAdd: '+Real recording studio, +TTS, +offline mode' },

  // SMB segment
  { competitor: 'Synthesia', segment: 'SMB', theirStarterPrice: 18, theirProPrice: 67, ourEquivalentTier: 'Business', ourPrice: 29.99, priceDifference: '55% cheaper vs Teams', ourValueAdd: '+Real presenter option, +podcasting, +approval workflows' },
  { competitor: 'Canva Teams', segment: 'SMB', theirStarterPrice: 10, theirProPrice: 10, ourEquivalentTier: 'Business', ourPrice: 29.99, priceDifference: '3x more but...', ourValueAdd: '+Full video production, +TTS, +AI scripts (Canva is design-first, not video-first)' },
  { competitor: 'Loom Business', segment: 'SMB', theirStarterPrice: 12.50, theirProPrice: 12.50, ourEquivalentTier: 'Business', ourPrice: 29.99, priceDifference: '2.4x more but...', ourValueAdd: '+Full editing, +AI scripts, +TTS, +publishing (Loom is record-only)' },

  // Healthcare segment
  { competitor: 'Healthwise', segment: 'Healthcare', theirStarterPrice: 4166, theirProPrice: 4166, ourEquivalentTier: 'Healthcare', ourPrice: 99.99, priceDifference: '97% cheaper', ourValueAdd: '+AI personalization, +provider-created, +modern UX, +50+ languages' },
  { competitor: 'VIDIZMO', segment: 'Healthcare', theirStarterPrice: 1000, theirProPrice: 1000, ourEquivalentTier: 'Healthcare', ourPrice: 99.99, priceDifference: '90% cheaper', ourValueAdd: '+AI script generation, +TTS, +patient-specific content' },

  // Enterprise segment
  { competitor: 'Kaltura', segment: 'Enterprise', theirStarterPrice: 500, theirProPrice: 2000, ourEquivalentTier: 'Enterprise', ourPrice: 249.99, priceDifference: '50-87% cheaper', ourValueAdd: '+AI-first, +instant setup, +no complexity overhead' },
  { competitor: 'Brightcove', segment: 'Enterprise', theirStarterPrice: 500, theirProPrice: 5000, ourEquivalentTier: 'Enterprise', ourPrice: 249.99, priceDifference: '50-95% cheaper', ourValueAdd: '+AI content creation (Brightcove is distribution-only)' },

  // Knowledge Sharer segment
  { competitor: 'Kajabi', segment: 'Knowledge', theirStarterPrice: 149, theirProPrice: 399, ourEquivalentTier: 'Creator', ourPrice: 14.99, priceDifference: '90-96% cheaper', ourValueAdd: 'Video creation included (Kajabi has zero video creation tools)' },
  { competitor: 'Teachable', segment: 'Knowledge', theirStarterPrice: 39, theirProPrice: 199, ourEquivalentTier: 'Creator', ourPrice: 14.99, priceDifference: '62-92% cheaper', ourValueAdd: '+AI course scripting, +TTS narration, +video production pipeline' },
];

// =============================================================================
// SECTION 7: UNIT ECONOMICS & CAC/LTV ANALYSIS
// =============================================================================

export interface UnitEconomics {
  tier: string;
  monthlyPrice: number;
  annualPrice: number;
  costPerUser: number;
  grossProfit: number;
  grossMarginPercent: number;
  estimatedCAC: number;       // Customer Acquisition Cost
  cacChannel: string;
  ltv12Month: number;         // 12-month Lifetime Value
  ltv24Month: number;         // 24-month Lifetime Value
  ltvCacRatio12: number;      // LTV:CAC ratio (12 month)
  ltvCacRatio24: number;      // LTV:CAC ratio (24 month)
  paybackMonths: number;      // Months to recoup CAC
  monthlyChurnEstimate: number; // Expected churn %
  netRevenueRetention: number;  // Including expansion revenue %
}

export const unitEconomics: UnitEconomics[] = [
  {
    tier: 'Free→Starter',
    monthlyPrice: 7.99,
    annualPrice: 71.88,
    costPerUser: 2.57,
    grossProfit: 5.42,
    grossMarginPercent: 67.8,
    estimatedCAC: 15,
    cacChannel: 'Organic/SEO + Referral (free tier funnel)',
    ltv12Month: 65.04,
    ltv24Month: 130.08,
    ltvCacRatio12: 4.3,
    ltvCacRatio24: 8.7,
    paybackMonths: 2.8,
    monthlyChurnEstimate: 8,
    netRevenueRetention: 95,
  },
  {
    tier: 'Creator',
    monthlyPrice: 14.99,
    annualPrice: 143.88,
    costPerUser: 7.58,
    grossProfit: 7.41,
    grossMarginPercent: 49.4,
    estimatedCAC: 25,
    cacChannel: 'YouTube Ads + Content Marketing',
    ltv12Month: 88.92,
    ltv24Month: 177.84,
    ltvCacRatio12: 3.6,
    ltvCacRatio24: 7.1,
    paybackMonths: 3.4,
    monthlyChurnEstimate: 6,
    netRevenueRetention: 100,
  },
  {
    tier: 'Business',
    monthlyPrice: 29.99,
    annualPrice: 299.88,
    costPerUser: 13.65,
    grossProfit: 16.34,
    grossMarginPercent: 54.5,
    estimatedCAC: 45,
    cacChannel: 'Google Search Ads + LinkedIn',
    ltv12Month: 196.08,
    ltv24Month: 392.16,
    ltvCacRatio12: 4.4,
    ltvCacRatio24: 8.7,
    paybackMonths: 2.8,
    monthlyChurnEstimate: 5,
    netRevenueRetention: 110,
  },
  {
    tier: 'Pro',
    monthlyPrice: 59.99,
    annualPrice: 599.88,
    costPerUser: 28.51,
    grossProfit: 31.48,
    grossMarginPercent: 52.5,
    estimatedCAC: 80,
    cacChannel: 'Outbound Sales + Partnerships',
    ltv12Month: 377.76,
    ltv24Month: 755.52,
    ltvCacRatio12: 4.7,
    ltvCacRatio24: 9.4,
    paybackMonths: 2.5,
    monthlyChurnEstimate: 3,
    netRevenueRetention: 120,
  },
  {
    tier: 'Healthcare',
    monthlyPrice: 99.99,
    annualPrice: 1019.88,
    costPerUser: 30.74,
    grossProfit: 69.25,
    grossMarginPercent: 69.3,
    estimatedCAC: 500,
    cacChannel: 'Direct Sales + Healthcare Conferences + Referrals',
    ltv12Month: 831.00,
    ltv24Month: 1662.00,
    ltvCacRatio12: 1.7,
    ltvCacRatio24: 3.3,
    paybackMonths: 7.2,
    monthlyChurnEstimate: 2,
    netRevenueRetention: 130,
  },
  {
    tier: 'Enterprise',
    monthlyPrice: 249.99,
    annualPrice: 2399.88,
    costPerUser: 73.30,
    grossProfit: 176.69,
    grossMarginPercent: 70.7,
    estimatedCAC: 2000,
    cacChannel: 'Enterprise Sales Team + Channel Partners',
    ltv12Month: 2120.28,
    ltv24Month: 4240.56,
    ltvCacRatio12: 1.1,
    ltvCacRatio24: 2.1,
    paybackMonths: 11.3,
    monthlyChurnEstimate: 1.5,
    netRevenueRetention: 140,
  },
];

// =============================================================================
// SECTION 8: ARR/MRR PROJECTIONS BY SCENARIO
// =============================================================================

export interface RevenueProjection {
  month: number;
  label: string;
  // User counts by tier
  freeUsers: number;
  starterUsers: number;
  creatorUsers: number;
  businessUsers: number;
  proUsers: number;
  healthcareUsers: number;
  enterpriseUsers: number;
  // Revenue
  mrr: number;
  arr: number;
  // Costs
  variableCosts: number;
  fixedCosts: number;
  totalCosts: number;
  // Profitability
  grossProfit: number;
  netProfit: number;
  cumulativeLoss: number;
  burnRate: number;
}

export const conservativeProjection: RevenueProjection[] = [
  {
    month: 1, label: 'Mar 2026',
    freeUsers: 500, starterUsers: 25, creatorUsers: 10, businessUsers: 3, proUsers: 0, healthcareUsers: 0, enterpriseUsers: 0,
    mrr: 490, arr: 5880,
    variableCosts: 635, fixedCosts: 164, totalCosts: 799,
    grossProfit: -145, netProfit: -309, cumulativeLoss: -309, burnRate: 799,
  },
  {
    month: 3, label: 'May 2026',
    freeUsers: 2000, starterUsers: 120, creatorUsers: 50, businessUsers: 15, proUsers: 2, healthcareUsers: 0, enterpriseUsers: 0,
    mrr: 2828, arr: 33936,
    variableCosts: 2560, fixedCosts: 5164, totalCosts: 7724,
    grossProfit: 268, netProfit: -4896, cumulativeLoss: -9401, burnRate: 7724,
  },
  {
    month: 6, label: 'Aug 2026',
    freeUsers: 5000, starterUsers: 350, creatorUsers: 150, businessUsers: 50, proUsers: 10, healthcareUsers: 2, enterpriseUsers: 0,
    mrr: 8148, arr: 97776,
    variableCosts: 6745, fixedCosts: 5164, totalCosts: 11909,
    grossProfit: 1403, netProfit: -3761, cumulativeLoss: -27387, burnRate: 11909,
  },
  {
    month: 9, label: 'Nov 2026',
    freeUsers: 10000, starterUsers: 700, creatorUsers: 350, businessUsers: 120, proUsers: 25, healthcareUsers: 5, enterpriseUsers: 1,
    mrr: 18920, arr: 227040,
    variableCosts: 13890, fixedCosts: 5164, totalCosts: 19054,
    grossProfit: 5030, netProfit: -134, cumulativeLoss: -38965, burnRate: 19054,
  },
  {
    month: 12, label: 'Feb 2027',
    freeUsers: 20000, starterUsers: 1200, creatorUsers: 600, businessUsers: 250, proUsers: 50, healthcareUsers: 10, enterpriseUsers: 3,
    mrr: 37227, arr: 446724,
    variableCosts: 24620, fixedCosts: 26055, totalCosts: 50675,
    grossProfit: 12607, netProfit: -13448, cumulativeLoss: -66861, burnRate: 50675,
  },
  {
    month: 18, label: 'Aug 2027',
    freeUsers: 50000, starterUsers: 3000, creatorUsers: 1500, businessUsers: 600, proUsers: 120, healthcareUsers: 25, enterpriseUsers: 8,
    mrr: 92460, arr: 1109520,
    variableCosts: 58900, fixedCosts: 26055, totalCosts: 84955,
    grossProfit: 33560, netProfit: 7505, cumulativeLoss: -100236, burnRate: 84955,
  },
  {
    month: 24, label: 'Feb 2028',
    freeUsers: 100000, starterUsers: 6000, creatorUsers: 3500, businessUsers: 1400, proUsers: 300, healthcareUsers: 60, enterpriseUsers: 20,
    mrr: 224930, arr: 2699160,
    variableCosts: 135600, fixedCosts: 102794, totalCosts: 238394,
    grossProfit: 89330, netProfit: -13464, cumulativeLoss: -113700, burnRate: 238394,
  },
];

// =============================================================================
// SECTION 9: BREAKEVEN ANALYSIS BY REGION
// =============================================================================

export interface RegionalBreakeven {
  region: string;
  blendedARPU: number;          // Average Revenue Per User (blended across tiers)
  blendedCostPerUser: number;   // Average cost per user (blended)
  contributionMargin: number;    // ARPU - Cost
  contributionMarginPercent: number;
  monthlyFixedCostsAllocated: number; // Share of fixed costs
  breakEvenUsers: number;       // Users needed for this region to break even
  estimatedTimeToBreakeven: string;
  keyMetric: string;
}

export const regionalBreakeven: RegionalBreakeven[] = [
  {
    region: 'North America',
    blendedARPU: 28.50,
    blendedCostPerUser: 11.20,
    contributionMargin: 17.30,
    contributionMarginPercent: 60.7,
    monthlyFixedCostsAllocated: 2500,
    breakEvenUsers: 145,
    estimatedTimeToBreakeven: 'Month 4-5 (with 200+ paid users)',
    keyMetric: 'Highest ARPU, fastest to breakeven',
  },
  {
    region: 'Western Europe',
    blendedARPU: 24.50,
    blendedCostPerUser: 11.20,
    contributionMargin: 13.30,
    contributionMarginPercent: 54.3,
    monthlyFixedCostsAllocated: 1500,
    breakEvenUsers: 113,
    estimatedTimeToBreakeven: 'Month 5-6 (with 150+ paid users)',
    keyMetric: 'Strong ARPU, GDPR compliance adds cost',
  },
  {
    region: 'India',
    blendedARPU: 5.50,
    blendedCostPerUser: 4.80,
    contributionMargin: 0.70,
    contributionMarginPercent: 12.7,
    monthlyFixedCostsAllocated: 500,
    breakEvenUsers: 714,
    estimatedTimeToBreakeven: 'Month 10-14 (need 1000+ paid users)',
    keyMetric: 'Volume play. Low margin but massive market. Only viable at scale.',
  },
  {
    region: 'Southeast Asia',
    blendedARPU: 7.50,
    blendedCostPerUser: 5.20,
    contributionMargin: 2.30,
    contributionMarginPercent: 30.7,
    monthlyFixedCostsAllocated: 400,
    breakEvenUsers: 174,
    estimatedTimeToBreakeven: 'Month 8-10 (with 250+ paid users)',
    keyMetric: 'Growing fast. Mobile-first critical.',
  },
  {
    region: 'Latin America',
    blendedARPU: 8.50,
    blendedCostPerUser: 5.50,
    contributionMargin: 3.00,
    contributionMarginPercent: 35.3,
    monthlyFixedCostsAllocated: 300,
    breakEvenUsers: 100,
    estimatedTimeToBreakeven: 'Month 8-10 (with 150+ paid users)',
    keyMetric: 'Brazil key market. PT/ES TTS essential.',
  },
  {
    region: 'Middle East & Africa',
    blendedARPU: 12.00,
    blendedCostPerUser: 6.50,
    contributionMargin: 5.50,
    contributionMarginPercent: 45.8,
    monthlyFixedCostsAllocated: 200,
    breakEvenUsers: 36,
    estimatedTimeToBreakeven: 'Month 6-8 (with 50+ paid users)',
    keyMetric: 'Gulf states drive ARPU. Africa is long-term.',
  },
  {
    region: 'East Asia',
    blendedARPU: 18.00,
    blendedCostPerUser: 9.00,
    contributionMargin: 9.00,
    contributionMarginPercent: 50.0,
    monthlyFixedCostsAllocated: 300,
    breakEvenUsers: 33,
    estimatedTimeToBreakeven: 'Month 6-8 (with 50+ paid users)',
    keyMetric: 'Quality-conscious. Good for Pro tier.',
  },
];

// =============================================================================
// SECTION 10: SWEET SPOT ANALYSIS — WHERE WE WIN
// =============================================================================

export interface SweetSpotAnalysis {
  dimension: string;
  finding: string;
  recommendation: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export const sweetSpotAnalysis: SweetSpotAnalysis[] = [
  {
    dimension: 'Price Sweet Spot — Creator/Influencer',
    finding: 'CapCut Pro is $7.99 (500M users). Descript starts at $16. The $8-15 range is the sweet spot where users will pay for AI features CapCut lacks without hitting Descript sticker shock.',
    recommendation: 'Starter at $7.99 (match CapCut), Creator at $14.99 (undercut Descript by 38%). Lead with "AI scripts + TTS" as the differentiator CapCut cannot match.',
    confidence: 'High',
  },
  {
    dimension: 'Price Sweet Spot — SMB/Teams',
    finding: 'Synthesia Teams at $67/mo is the anchor. SMBs say "$67/month is too much" (VoC). Sweet spot is $25-35/mo for team features.',
    recommendation: 'Business at $29.99 with 5 seats. Position as "Synthesia quality at half the price, plus you can record real presenters."',
    confidence: 'High',
  },
  {
    dimension: 'Price Sweet Spot — Healthcare',
    finding: 'Healthwise charges $50K+/yr ($4,166/mo). Even at $100/mo we are 97% cheaper. Healthcare has HIGH willingness to pay — our floor should be $100, not $50.',
    recommendation: 'Healthcare at $99.99/mo per provider. This is our highest-margin tier (69%). Do NOT race to the bottom here. The value proposition is compliance, not price.',
    confidence: 'High',
  },
  {
    dimension: 'Regional Sweet Spot',
    finding: 'India has 50M+ creators but ARPU of $5.50. At PPP factor 0.25, our $1.99 Starter still yields 12.7% contribution margin. Only viable at 1000+ users.',
    recommendation: 'Launch regional pricing in India/SEA AFTER proving model in NA/EU. Use PPP pricing (Canva model). Accept thin margins for massive volume.',
    confidence: 'Medium',
  },
  {
    dimension: 'Bundle Sweet Spot',
    finding: 'No competitor offers Script + TTS + Video Editing + Presentations + Podcasting in one tool. Buying these separately costs $100-300+/mo.',
    recommendation: 'Pro tier at $59.99 includes ALL 7 products. Lead with "7 tools for the price of 1." This is our unique competitive moat.',
    confidence: 'High',
  },
  {
    dimension: 'CAC vs Revenue Sweet Spot',
    finding: 'Best LTV:CAC ratios are Starter (4.3x at 12mo) and Business (4.4x). Healthcare has high CAC ($500) due to sales cycle. Target: >3x LTV:CAC.',
    recommendation: 'Invest heavily in freemium-to-Starter conversion (CAC ~$15). SMB via Google Ads (CAC ~$45). Healthcare via direct sales (accept high CAC for high LTV).',
    confidence: 'High',
  },
  {
    dimension: 'Breakeven Sweet Spot',
    finding: 'Global breakeven at ~300 paid users (blended ARPU $25, contribution margin $14). With conservative growth, breakeven at Month 9 (~700 paid users).',
    recommendation: 'Focus first 6 months on NA + EU (highest ARPU, fastest breakeven). Expand to India/SEA at Month 9+ once unit economics proven.',
    confidence: 'Medium',
  },
  {
    dimension: 'Annual vs Monthly Sweet Spot',
    finding: 'Industry standard: 20-40% discount for annual. 60-70% of SaaS revenue comes from annual plans. Annual improves cash flow and reduces churn.',
    recommendation: 'Offer 17-25% annual discount. Default to annual on pricing page. Show monthly as "billed annually" with monthly option smaller.',
    confidence: 'High',
  },
];

// =============================================================================
// SECTION 11: KEY DIFFERENTIATORS vs COMPETITORS
// =============================================================================

export interface CompetitiveDifferentiator {
  differentiator: string;
  description: string;
  competitorsWhoLackThis: string[];
  segmentsItAppealsTo: string[];
  pricingImpact: string;
}

export const competitiveDifferentiators: CompetitiveDifferentiator[] = [
  {
    differentiator: '7-Product Suite in 1 Subscription',
    description: 'Spark (video), Mind (audio/TTS), Deck (presentations), Vibe (music), Cast (podcast), Ask Genie (AI assistant), Hub (knowledge base) — all in one.',
    competitorsWhoLackThis: ['CapCut', 'Descript', 'Synthesia', 'Canva', 'Loom', 'InVideo', 'Every single competitor'],
    segmentsItAppealsTo: ['All segments'],
    pricingImpact: 'Justifies $60 Pro tier — replacing $300+ in separate tools.',
  },
  {
    differentiator: 'Script-First Workflow',
    description: 'Start with AI-generated script, add TTS, then record/edit. No other tool starts with scripting.',
    competitorsWhoLackThis: ['CapCut', 'InShot', 'Loom', 'Canva Video', 'GoPro Quik'],
    segmentsItAppealsTo: ['Knowledge Sharer', 'Healthcare', 'Education', 'SMB'],
    pricingImpact: 'Removes production barrier — users who never created video now can. Expands TAM.',
  },
  {
    differentiator: 'Multi-Provider TTS (11 providers, 100+ voices)',
    description: 'OpenAI + ElevenLabs + Google + Azure + Amazon + more. User picks best voice for their content.',
    competitorsWhoLackThis: ['CapCut (0 TTS)', 'Canva (0 TTS)', 'Loom (0 TTS)', 'Descript (1 provider)'],
    segmentsItAppealsTo: ['Creator', 'Healthcare', 'Enterprise', 'Education'],
    pricingImpact: 'TTS is our moat. Enables non-speakers to create video. Premium TTS drives Pro tier.',
  },
  {
    differentiator: 'HIPAA-Compliant AI Video at 95% Less Cost',
    description: 'Full HIPAA BAA, audit logs, PHI-safe — all for $100/mo vs $50K+/yr at Healthwise.',
    competitorsWhoLackThis: ['CapCut', 'Descript', 'Synthesia', 'InVideo', 'Canva', 'Every non-healthcare tool'],
    segmentsItAppealsTo: ['Healthcare'],
    pricingImpact: 'Blue ocean pricing. 69% gross margin. Highest margin tier.',
  },
  {
    differentiator: 'Regional PPP Pricing',
    description: 'India at $1.99, SEA at $2.99, LATAM at $2.99. Most AI tools charge flat USD globally.',
    competitorsWhoLackThis: ['Jasper', 'Descript', 'Synthesia', 'Grammarly', 'Notion AI', 'Most SaaS'],
    segmentsItAppealsTo: ['Creators in emerging markets'],
    pricingImpact: 'Canva model: PPP pricing drove 170M+ users. We follow same playbook.',
  },
  {
    differentiator: 'Offline-First Mobile Editing',
    description: 'Record and edit offline on mobile. Sync when connected. Critical for travelers and field users.',
    competitorsWhoLackThis: ['Synthesia (web-only)', 'Descript (desktop-only)', 'Loom (web-only)', 'InVideo (web-only)'],
    segmentsItAppealsTo: ['Traveler', 'Creator', 'Influencer'],
    pricingImpact: 'Unlocks travel/field segments that web-only tools cannot serve.',
  },
];

// =============================================================================
// SECTION 12: EXECUTIVE SUMMARY — RECOMMENDED ACTIONS
// =============================================================================

export interface ExecutiveRecommendation {
  priority: number;
  action: string;
  rationale: string;
  expectedImpact: string;
  timeline: string;
  effort: 'Low' | 'Medium' | 'High';
}

export const executiveRecommendations: ExecutiveRecommendation[] = [
  {
    priority: 1,
    action: 'Replace current 3-tier pricing with 7-tier model (Free, Starter, Creator, Business, Pro, Healthcare, Enterprise)',
    rationale: 'Current Starter/Business/Pro at $9.99/$29.99/$79.99 misses the $5-8 entry point (creators) and the $100+ healthcare segment. New model captures full spectrum.',
    expectedImpact: '2-3x higher conversion from free tier. 30% higher ARPU from segment-specific tiers.',
    timeline: 'Week 1-2',
    effort: 'Medium',
  },
  {
    priority: 2,
    action: 'Launch generous free tier (Spark Free) with 10 scripts/month, 3 exports/month',
    rationale: 'CapCut Free has 500M users. We need a free tier to compete for creators. Cost per free user is only $0.74/month.',
    expectedImpact: '10-50x faster user acquisition. 5-8% conversion to Starter.',
    timeline: 'Week 1',
    effort: 'Low',
  },
  {
    priority: 3,
    action: 'Implement regional pricing for India, SEA, LATAM (PPP-based)',
    rationale: 'India alone has 50M+ creators. At $1.99 Starter (PPP factor 0.25), we still achieve 12.7% margin. Canva proved this model works.',
    expectedImpact: 'Access to 60% of global creator market currently priced out.',
    timeline: 'Month 2-3',
    effort: 'Medium',
  },
  {
    priority: 4,
    action: 'Position Healthcare tier as separate vertical with direct sales motion',
    rationale: '69% gross margin — our highest. $100/mo vs $4,166/mo (Healthwise) is an easy sell. Blue ocean — no AI competitors.',
    expectedImpact: 'Each healthcare customer = 12x revenue of a Starter customer.',
    timeline: 'Month 3-4',
    effort: 'High',
  },
  {
    priority: 5,
    action: 'Lead messaging with "7 tools for the price of 1" for Pro tier',
    rationale: 'No competitor bundles Script + TTS + Video + Presentations + Podcast + AI + Knowledge. Buying separately costs $300+/mo.',
    expectedImpact: 'Clear differentiation. Justifies $60/mo for users currently paying $100+ across tools.',
    timeline: 'Week 1',
    effort: 'Low',
  },
  {
    priority: 6,
    action: 'Default pricing page to annual billing with 17-25% discount',
    rationale: '60-70% of SaaS revenue comes from annual plans. Reduces churn, improves cash flow, increases LTV.',
    expectedImpact: '20-30% improvement in revenue retention and cash flow.',
    timeline: 'Week 1',
    effort: 'Low',
  },
  {
    priority: 7,
    action: 'Build referral program: Give 1 month free for each referral conversion',
    rationale: 'Referral CAC is $20 (vs $45 for Google Ads). LTV:CAC of 4.3x at Starter. Best acquisition channel after SEO.',
    expectedImpact: '15-25% of new users from referrals (industry benchmark).',
    timeline: 'Month 2',
    effort: 'Medium',
  },
];

// =============================================================================
// SUMMARY METRICS
// =============================================================================

export const summaryMetrics = {
  // Current state
  currentPricing: 'Starter $9.99 / Business $29.99 / Pro $79.99',
  currentIssues: [
    'No free tier — losing to CapCut in creator segment',
    'No healthcare-specific tier — missing 69% margin opportunity',
    'Pro at $79.99 is above sweet spot for agencies ($60 better)',
    'No regional pricing — invisible in India/SEA/LATAM (60% of global creators)',
    'Single pricing model — not speaking to segment-specific needs',
  ],

  // Proposed state
  proposedPricing: 'Free / Starter $7.99 / Creator $14.99 / Business $29.99 / Pro $59.99 / Healthcare $99.99 / Enterprise $249.99',
  proposedAdvantages: [
    'Free tier captures creators (500M+ CapCut user analog)',
    'Healthcare tier at 69% margin captures blue ocean',
    'Pro at $59.99 is 7-product bundle — unique in market',
    'Regional pricing unlocks India (50M creators), SEA, LATAM',
    'Annual pricing default improves LTV by 20-30%',
  ],

  // Key financials
  blendedARPU: 25.00,
  blendedGrossMargin: 57,
  globalBreakevenUsers: 300,
  month9PaidUsersConservative: 700,
  month12MRRConservative: 37227,
  month12ARRConservative: 446724,
  month18MRRConservative: 92460,
  month24ARRConservative: 2699160,
  totalFundingNeeded: 115000, // To reach Month 18 profitability

  // Regional priority
  launchOrder: [
    '1. North America + Western Europe (Month 0) — highest ARPU, fastest breakeven',
    '2. East Asia + Middle East (Month 3) — high ARPU, small user base needed',
    '3. India + Southeast Asia (Month 6) — volume play, need proven unit economics first',
    '4. Latin America + Africa (Month 9) — growing markets, localization investment',
  ],
};

// Default export
export default {
  costPerAction,
  tierCostModels,
  fixedCostsByStage,
  regionalPricing,
  proposedPlans,
  competitivePricePositions,
  unitEconomics,
  conservativeProjection,
  regionalBreakeven,
  sweetSpotAnalysis,
  competitiveDifferentiators,
  executiveRecommendations,
  summaryMetrics,
};
