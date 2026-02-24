/**
 * Infrastructure & Operational Costs Data
 * Real-world pricing for all services used in Genie Suite
 * Last Updated: January 2026
 */

// ==================== AI MODEL COSTS ====================
export interface AIModelCost {
  provider: string;
  model: string;
  inputCostPer1MTok: number;  // Per 1M tokens
  outputCostPer1MTok: number; // Per 1M tokens
  avgTokensPerScript: number; // Approximate tokens for a 5-min video script
  costPerScript: number;      // Calculated cost per script
  contextWindow: string;
  bestFor: string;
}

export const aiModelCosts: AIModelCost[] = [
  {
    provider: 'Google',
    model: 'Gemini 2.5 Flash',
    inputCostPer1MTok: 0.075,
    outputCostPer1MTok: 0.30,
    avgTokensPerScript: 2500,
    costPerScript: 0.00094,
    contextWindow: '1M tokens',
    bestFor: 'High-volume scripting, fast responses',
  },
  {
    provider: 'Google',
    model: 'Gemini 2.5 Pro',
    inputCostPer1MTok: 1.25,
    outputCostPer1MTok: 5.00,
    avgTokensPerScript: 2500,
    costPerScript: 0.0156,
    contextWindow: '2M tokens',
    bestFor: 'Complex reasoning, long-form content',
  },
  {
    provider: 'OpenAI',
    model: 'GPT-4o',
    inputCostPer1MTok: 2.50,
    outputCostPer1MTok: 10.00,
    avgTokensPerScript: 2500,
    costPerScript: 0.0313,
    contextWindow: '128K tokens',
    bestFor: 'Multimodal analysis, vision tasks',
  },
  {
    provider: 'OpenAI',
    model: 'GPT-4o-mini',
    inputCostPer1MTok: 0.15,
    outputCostPer1MTok: 0.60,
    avgTokensPerScript: 2500,
    costPerScript: 0.00188,
    contextWindow: '128K tokens',
    bestFor: 'Cost-effective general tasks',
  },
  {
    provider: 'Anthropic',
    model: 'Claude 3.5 Sonnet',
    inputCostPer1MTok: 3.00,
    outputCostPer1MTok: 15.00,
    avgTokensPerScript: 2500,
    costPerScript: 0.045,
    contextWindow: '200K tokens',
    bestFor: 'Healthcare, compliance-heavy content',
  },
  {
    provider: 'Anthropic',
    model: 'Claude 3.5 Haiku',
    inputCostPer1MTok: 0.25,
    outputCostPer1MTok: 1.25,
    avgTokensPerScript: 2500,
    costPerScript: 0.00375,
    contextWindow: '200K tokens',
    bestFor: 'Fast classification, simple tasks',
  },
];

// ==================== TTS VOICE COSTS ====================
export interface TTSCost {
  provider: string;
  tier: string;
  costPerCharacter: number;
  costPerMinute: number;      // Approx 1000 chars = 1 min
  voiceCount: number;
  languages: number;
  quality: 'Standard' | 'Premium' | 'Ultra';
  cloning: boolean;
  emotionControl: boolean;
}

export const ttsCosts: TTSCost[] = [
  {
    provider: 'ElevenLabs',
    tier: 'Creator',
    costPerCharacter: 0.00003,
    costPerMinute: 0.30,
    voiceCount: 3000,
    languages: 32,
    quality: 'Ultra',
    cloning: true,
    emotionControl: true,
  },
  {
    provider: 'ElevenLabs',
    tier: 'Pro',
    costPerCharacter: 0.000018,
    costPerMinute: 0.18,
    voiceCount: 3000,
    languages: 32,
    quality: 'Ultra',
    cloning: true,
    emotionControl: true,
  },
  {
    provider: 'Google Cloud TTS',
    tier: 'WaveNet',
    costPerCharacter: 0.000016,
    costPerMinute: 0.16,
    voiceCount: 400,
    languages: 50,
    quality: 'Premium',
    cloning: false,
    emotionControl: false,
  },
  {
    provider: 'Azure Speech',
    tier: 'Neural',
    costPerCharacter: 0.000016,
    costPerMinute: 0.16,
    voiceCount: 500,
    languages: 60,
    quality: 'Premium',
    cloning: true,
    emotionControl: true,
  },
  {
    provider: 'Amazon Polly',
    tier: 'Neural',
    costPerCharacter: 0.000016,
    costPerMinute: 0.16,
    voiceCount: 70,
    languages: 30,
    quality: 'Premium',
    cloning: false,
    emotionControl: false,
  },
];

// ==================== INFRASTRUCTURE COSTS ====================
export interface InfrastructureCost {
  service: string;
  tier: string;
  monthlyCost: number;
  includedUsage: string;
  overage: string;
  category: 'Platform' | 'Database' | 'Auth' | 'Email' | 'Hosting' | 'Storage' | 'DevOps';
}

export const infrastructureCosts: InfrastructureCost[] = [
  // Platform
  {
    service: 'Lovable',
    tier: 'Pro',
    monthlyCost: 20,
    includedUsage: 'Unlimited projects, AI generation',
    overage: 'Enterprise custom',
    category: 'Platform',
  },
  // Database
  {
    service: 'Supabase',
    tier: 'Pro',
    monthlyCost: 25,
    includedUsage: '8GB DB, 250GB storage, 50GB bandwidth',
    overage: '$0.125/GB storage, $0.09/GB bandwidth',
    category: 'Database',
  },
  {
    service: 'Supabase',
    tier: 'Team',
    monthlyCost: 599,
    includedUsage: 'SOC2, 99.9% SLA, priority support',
    overage: 'Custom enterprise',
    category: 'Database',
  },
  // Auth
  {
    service: 'Google OAuth',
    tier: 'Free',
    monthlyCost: 0,
    includedUsage: 'Unlimited authentications',
    overage: 'N/A',
    category: 'Auth',
  },
  // Email
  {
    service: 'Resend',
    tier: 'Pro',
    monthlyCost: 20,
    includedUsage: '50,000 emails/mo',
    overage: '$0.00040/email',
    category: 'Email',
  },
  {
    service: 'Resend',
    tier: 'Enterprise',
    monthlyCost: 400,
    includedUsage: '1M emails/mo + dedicated IP',
    overage: '$0.00028/email',
    category: 'Email',
  },
  // Hosting
  {
    service: 'Netlify',
    tier: 'Pro',
    monthlyCost: 19,
    includedUsage: '1TB bandwidth, 25K form submissions',
    overage: '$55/100GB bandwidth',
    category: 'Hosting',
  },
  {
    service: 'Netlify',
    tier: 'Business',
    monthlyCost: 99,
    includedUsage: '1TB bandwidth, SSO, audit logs',
    overage: '$55/100GB bandwidth',
    category: 'Hosting',
  },
  // DevOps
  {
    service: 'GitHub',
    tier: 'Team',
    monthlyCost: 4,
    includedUsage: 'Per user, 3000 CI/CD mins',
    overage: '$0.008/min after',
    category: 'DevOps',
  },
];

// ==================== CUSTOMER ACQUISITION COSTS ====================
export interface AcquisitionChannel {
  channel: string;
  cpcRange: string;        // Cost per click
  cpmRange: string;        // Cost per 1000 impressions
  avgConversionRate: string;
  estimatedCAC: number;    // Customer acquisition cost
  bestSegments: string[];
  notes: string;
}

export const acquisitionChannels: AcquisitionChannel[] = [
  {
    channel: 'YouTube Ads',
    cpcRange: '$0.10-0.30',
    cpmRange: '$4-10',
    avgConversionRate: '2-5%',
    estimatedCAC: 25,
    bestSegments: ['Creators', 'Influencers', 'Knowledge Sharers'],
    notes: 'Best for video editing demos, tutorial content',
  },
  {
    channel: 'TikTok Ads',
    cpcRange: '$0.50-1.00',
    cpmRange: '$10-20',
    avgConversionRate: '1-3%',
    estimatedCAC: 40,
    bestSegments: ['Creators', 'Influencers', 'Travelers'],
    notes: 'Younger audience, viral potential, high engagement',
  },
  {
    channel: 'Instagram/Meta Ads',
    cpcRange: '$0.50-2.00',
    cpmRange: '$5-15',
    avgConversionRate: '1-4%',
    estimatedCAC: 35,
    bestSegments: ['Influencers', 'SMB Marketing', 'Creators'],
    notes: 'Visual platform, good for showcasing features',
  },
  {
    channel: 'Google Search Ads',
    cpcRange: '$1-5',
    cpmRange: 'N/A (CPC only)',
    avgConversionRate: '3-8%',
    estimatedCAC: 45,
    bestSegments: ['SMB', 'Enterprise', 'Healthcare'],
    notes: 'High intent traffic, expensive but converts well',
  },
  {
    channel: 'SEO (Organic)',
    cpcRange: '$0 (content cost)',
    cpmRange: 'N/A',
    avgConversionRate: '2-6%',
    estimatedCAC: 15,
    bestSegments: ['All segments'],
    notes: 'Long-term investment, 6-12 months to see results',
  },
  {
    channel: 'Affiliate/Referral',
    cpcRange: '20-30% rev share',
    cpmRange: 'N/A',
    avgConversionRate: '5-10%',
    estimatedCAC: 20,
    bestSegments: ['Creators', 'Knowledge Sharers'],
    notes: 'Performance-based, low risk',
  },
];

// ==================== TIER TOKEN ALLOCATIONS ====================
export interface TierAllocation {
  tier: string;
  monthlyPrice: number;
  scriptsPerMonth: number;
  tokensPerMonth: number;
  ttsMinutes: number;
  videoExports: number;
  teamSeats: number;
  aiCostPerUser: number;     // Our cost per user
  ttsCostPerUser: number;    // Our cost per user
  totalCostPerUser: number;  // Total variable cost
  grossMargin: number;       // Percentage
}

export const tierAllocations: TierAllocation[] = [
  {
    tier: 'Free',
    monthlyPrice: 0,
    scriptsPerMonth: 3,
    tokensPerMonth: 7500,
    ttsMinutes: 3,
    videoExports: 3,
    teamSeats: 1,
    aiCostPerUser: 0.01,
    ttsCostPerUser: 0.54,
    totalCostPerUser: 0.55,
    grossMargin: -100, // Loss leader
  },
  {
    tier: 'Starter',
    monthlyPrice: 9.99,
    scriptsPerMonth: 50,
    tokensPerMonth: 125000,
    ttsMinutes: 30,
    videoExports: 30,
    teamSeats: 1,
    aiCostPerUser: 0.12,
    ttsCostPerUser: 5.40,
    totalCostPerUser: 5.52,
    grossMargin: 45,
  },
  {
    tier: 'Creator',
    monthlyPrice: 19.99,
    scriptsPerMonth: 150,
    tokensPerMonth: 375000,
    ttsMinutes: 90,
    videoExports: 100,
    teamSeats: 1,
    aiCostPerUser: 0.35,
    ttsCostPerUser: 16.20,
    totalCostPerUser: 16.55,
    grossMargin: 17,
  },
  {
    tier: 'Business',
    monthlyPrice: 49.99,
    scriptsPerMonth: 500,
    tokensPerMonth: 1250000,
    ttsMinutes: 300,
    videoExports: 300,
    teamSeats: 5,
    aiCostPerUser: 1.17,
    ttsCostPerUser: 54.00,
    totalCostPerUser: 55.17,
    grossMargin: -10, // Needs adjustment
  },
  {
    tier: 'Pro',
    monthlyPrice: 99.99,
    scriptsPerMonth: 1500,
    tokensPerMonth: 3750000,
    ttsMinutes: 600,
    videoExports: 'Unlimited' as any,
    teamSeats: 15,
    aiCostPerUser: 3.52,
    ttsCostPerUser: 108.00,
    totalCostPerUser: 111.52,
    grossMargin: -11, // Needs ElevenLabs enterprise deal
  },
  {
    tier: 'Healthcare',
    monthlyPrice: 199.99,
    scriptsPerMonth: 2000,
    tokensPerMonth: 5000000,
    ttsMinutes: 500,
    videoExports: 'Unlimited' as any,
    teamSeats: 25,
    aiCostPerUser: 4.69,
    ttsCostPerUser: 90.00,
    totalCostPerUser: 94.69,
    grossMargin: 53,
  },
];

// ==================== PRODUCTION COST PER ASSET ====================
export interface AssetProductionCost {
  assetType: string;
  aiTokens: number;
  ttsMinutes: number;
  storageGB: number;
  processingMinutes: number;
  totalCost: number;
  priceToUser: number;
  margin: number;
}

export const assetProductionCosts: AssetProductionCost[] = [
  {
    assetType: '1-min Video Script',
    aiTokens: 500,
    ttsMinutes: 1,
    storageGB: 0.001,
    processingMinutes: 0.5,
    totalCost: 0.18,
    priceToUser: 0, // Included in subscription
    margin: 0,
  },
  {
    assetType: '5-min Video Script',
    aiTokens: 2500,
    ttsMinutes: 5,
    storageGB: 0.005,
    processingMinutes: 2,
    totalCost: 0.90,
    priceToUser: 0,
    margin: 0,
  },
  {
    assetType: 'Full Video (5-min, 1080p)',
    aiTokens: 2500,
    ttsMinutes: 5,
    storageGB: 0.5,
    processingMinutes: 10,
    totalCost: 2.15,
    priceToUser: 0,
    margin: 0,
  },
  {
    assetType: 'Voice Clone Creation',
    aiTokens: 0,
    ttsMinutes: 0,
    storageGB: 0.1,
    processingMinutes: 30,
    totalCost: 5.00,
    priceToUser: 19.99,
    margin: 75,
  },
  {
    assetType: 'Avatar Video (1-min)',
    aiTokens: 1000,
    ttsMinutes: 1,
    storageGB: 0.2,
    processingMinutes: 15,
    totalCost: 3.50,
    priceToUser: 0,
    margin: 0,
  },
];

// ==================== MONTHLY UNIT ECONOMICS ====================
export interface MonthlyEconomics {
  category: string;
  fixedCosts: number;
  description: string;
}

export const monthlyFixedCosts: MonthlyEconomics[] = [
  { category: 'Supabase Pro', fixedCosts: 25, description: 'Database & auth' },
  { category: 'Netlify Pro', fixedCosts: 19, description: 'Hosting & CDN' },
  { category: 'Resend Pro', fixedCosts: 20, description: 'Transactional email' },
  { category: 'GitHub Team', fixedCosts: 16, description: '4 developers' },
  { category: 'Lovable Pro', fixedCosts: 20, description: 'Development platform' },
  { category: 'Domain & SSL', fixedCosts: 5, description: 'Annual amortized' },
  { category: 'Monitoring (Sentry)', fixedCosts: 26, description: 'Error tracking' },
  { category: 'Analytics (Mixpanel)', fixedCosts: 0, description: 'Free tier' },
];

// Summary calculations
export const calculateMonthlyBreakeven = () => {
  const totalFixed = monthlyFixedCosts.reduce((sum, c) => sum + c.fixedCosts, 0);
  const avgRevenuePerUser = 25; // Blended ARPU
  const avgVariableCostPerUser = 8; // AI + TTS costs
  const contributionMargin = avgRevenuePerUser - avgVariableCostPerUser;
  const breakEvenUsers = Math.ceil(totalFixed / contributionMargin);
  
  return {
    totalFixed,
    avgRevenuePerUser,
    avgVariableCostPerUser,
    contributionMargin,
    breakEvenUsers,
  };
};
