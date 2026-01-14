/**
 * Genie Command Center - Financial Projections & Unit Economics
 * Go-to-market strategy, projections, and cost analysis
 */

import type { FinancialProjection, UnitEconomics, GoToMarketPhase } from '../types';

// =============================================================================
// GO-TO-MARKET STRATEGY
// =============================================================================
export const goToMarketPhases: GoToMarketPhase[] = [
  {
    phase: 'Phase 1',
    name: 'Soft Launch (Alpha)',
    duration: 'May - July 2026 (3 months)',
    segments: ['Creator', 'SMB'],
    countries: ['United States', 'Canada'],
    targetUsers: 500,
    activities: [
      'Invite-only beta program',
      'Direct outreach to 50 content creators',
      'Partnership with 10 SMB marketing agencies',
      'Weekly feedback sessions and iteration',
      'Core feature validation',
      'Pricing sensitivity testing',
    ],
  },
  {
    phase: 'Phase 2',
    name: 'Beta Launch',
    duration: 'August - October 2026 (3 months)',
    segments: ['Creator', 'SMB', 'Education'],
    countries: ['United States', 'Canada', 'United Kingdom', 'Australia'],
    targetUsers: 5000,
    activities: [
      'Public beta with waitlist',
      'Influencer partnerships (10 micro-influencers)',
      'Education pilot with 5 universities',
      'Content marketing launch (blog, YouTube)',
      'Product Hunt launch',
      'Affiliate program beta',
    ],
  },
  {
    phase: 'Phase 3',
    name: 'General Availability',
    duration: 'November 2026 - February 2027 (4 months)',
    segments: ['Creator', 'SMB', 'Education', 'Healthcare'],
    countries: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'],
    targetUsers: 25000,
    activities: [
      'Full public launch',
      'Paid advertising (Google, Meta, LinkedIn)',
      'Healthcare pilot with 3 hospital systems',
      'Enterprise sales team hire (2-3 reps)',
      'Integration marketplace launch',
      'Annual plan incentives',
    ],
  },
  {
    phase: 'Phase 4',
    name: 'Scale & Expand',
    duration: 'March 2027 onwards',
    segments: ['Creator', 'SMB', 'Education', 'Healthcare', 'Enterprise'],
    countries: ['North America', 'Europe', 'APAC (Japan, Singapore, Australia)'],
    targetUsers: 100000,
    activities: [
      'Series A fundraise ($15-25M)',
      'Team expansion (Engineering, Sales, Support)',
      'Enterprise tier launch',
      'API marketplace',
      'White-label partnerships',
      'Localization (10+ languages)',
    ],
  },
];

// =============================================================================
// FINANCIAL PROJECTIONS (2026-2028)
// =============================================================================
export const financialProjections: FinancialProjection[] = [
  // 2026 Quarters
  {
    year: 2026,
    quarter: 'Q2',
    users: 500,
    mrr: 7500,
    arr: 90000,
    marketingCost: 25000,
    hostingCost: 3000,
    aiModelCost: 5000,
    developmentCost: 50000,
    totalCost: 83000,
    revenue: 7500,
    netIncome: -75500,
  },
  {
    year: 2026,
    quarter: 'Q3',
    users: 2500,
    mrr: 37500,
    arr: 450000,
    marketingCost: 50000,
    hostingCost: 8000,
    aiModelCost: 15000,
    developmentCost: 60000,
    totalCost: 133000,
    revenue: 37500,
    netIncome: -95500,
  },
  {
    year: 2026,
    quarter: 'Q4',
    users: 8000,
    mrr: 120000,
    arr: 1440000,
    marketingCost: 100000,
    hostingCost: 20000,
    aiModelCost: 40000,
    developmentCost: 80000,
    totalCost: 240000,
    revenue: 120000,
    netIncome: -120000,
  },
  // 2027 Quarters
  {
    year: 2027,
    quarter: 'Q1',
    users: 18000,
    mrr: 270000,
    arr: 3240000,
    marketingCost: 150000,
    hostingCost: 40000,
    aiModelCost: 80000,
    developmentCost: 100000,
    totalCost: 370000,
    revenue: 270000,
    netIncome: -100000,
  },
  {
    year: 2027,
    quarter: 'Q2',
    users: 35000,
    mrr: 525000,
    arr: 6300000,
    marketingCost: 200000,
    hostingCost: 70000,
    aiModelCost: 140000,
    developmentCost: 120000,
    totalCost: 530000,
    revenue: 525000,
    netIncome: -5000,
  },
  {
    year: 2027,
    quarter: 'Q3',
    users: 55000,
    mrr: 825000,
    arr: 9900000,
    marketingCost: 250000,
    hostingCost: 100000,
    aiModelCost: 200000,
    developmentCost: 140000,
    totalCost: 690000,
    revenue: 825000,
    netIncome: 135000,
  },
  {
    year: 2027,
    quarter: 'Q4',
    users: 80000,
    mrr: 1200000,
    arr: 14400000,
    marketingCost: 300000,
    hostingCost: 140000,
    aiModelCost: 280000,
    developmentCost: 160000,
    totalCost: 880000,
    revenue: 1200000,
    netIncome: 320000,
  },
  // 2028
  {
    year: 2028,
    quarter: 'Full Year',
    users: 200000,
    mrr: 3000000,
    arr: 36000000,
    marketingCost: 4000000,
    hostingCost: 800000,
    aiModelCost: 1600000,
    developmentCost: 2000000,
    totalCost: 8400000,
    revenue: 36000000,
    netIncome: 8000000,
  },
];

// =============================================================================
// UNIT ECONOMICS BY SEGMENT
// =============================================================================
export const unitEconomics: UnitEconomics[] = [
  {
    segment: 'Creator',
    arpu: 12, // Average Revenue Per User (monthly)
    cac: 45, // Customer Acquisition Cost
    ltv: 216, // Lifetime Value (18 months avg)
    ltvCacRatio: 4.8,
    churnRate: 5.5, // Monthly churn %
    paybackMonths: 3.75,
  },
  {
    segment: 'SMB',
    arpu: 35,
    cac: 120,
    ltv: 840, // 24 months avg
    ltvCacRatio: 7.0,
    churnRate: 4.0,
    paybackMonths: 3.4,
  },
  {
    segment: 'Education',
    arpu: 25,
    cac: 80,
    ltv: 600, // 24 months avg
    ltvCacRatio: 7.5,
    churnRate: 3.5,
    paybackMonths: 3.2,
  },
  {
    segment: 'Healthcare',
    arpu: 75,
    cac: 300,
    ltv: 2700, // 36 months avg
    ltvCacRatio: 9.0,
    churnRate: 2.5,
    paybackMonths: 4.0,
  },
  {
    segment: 'Enterprise',
    arpu: 500,
    cac: 2000,
    ltv: 18000, // 36 months avg
    ltvCacRatio: 9.0,
    churnRate: 2.0,
    paybackMonths: 4.0,
  },
];

// =============================================================================
// COST BREAKDOWN ASSUMPTIONS
// =============================================================================
export const costAssumptions = {
  hosting: {
    description: 'Supabase, Vercel, CDN',
    perUserMonth: 0.50,
    baseMonthly: 2000,
    notes: 'Scales with usage, enterprise tier at $0.30/user',
  },
  aiModels: {
    description: 'OpenAI, Google, ElevenLabs, Anthropic',
    perVideoMinute: 0.15,
    avgMinutesPerUser: 20,
    notes: 'Bulk pricing reduces by 30% at scale',
  },
  development: {
    description: 'Engineering team salaries',
    teamSize: 5,
    avgSalary: 12000,
    monthly: 60000,
    scaling: '+2 engineers per 50K users',
  },
  marketing: {
    description: 'Paid ads, content, partnerships',
    cacTarget: 50,
    breakdown: {
      paidAds: 50,
      content: 20,
      affiliates: 15,
      events: 10,
      other: 5,
    },
  },
  support: {
    description: 'Customer success team',
    ratioUsersPerRep: 5000,
    costPerRep: 5000,
  },
  infrastructure: {
    description: 'Storage, bandwidth, security',
    perUserMonth: 0.20,
    baseMonthly: 1000,
  },
};

// =============================================================================
// PRICING TIERS
// =============================================================================
export const pricingTiers = {
  creator: {
    free: { price: 0, credits: 50, features: ['Basic Script', '5 min TTS', 'Watermark'] },
    starter: { price: 9, credits: 200, features: ['Full Script', '30 min TTS', 'No Watermark', 'HD Export'] },
    pro: { price: 19, credits: 500, features: ['Everything + AI Agents', 'Priority TTS', '4K Export', 'Templates'] },
  },
  smb: {
    business: { price: 35, credits: 1000, features: ['Team (3 seats)', 'Brand Kit', 'Analytics', 'Priority Support'] },
    team: { price: 79, credits: 3000, features: ['Team (10 seats)', 'Approval Workflows', 'SSO', 'Dedicated Success'] },
  },
  healthcare: {
    clinic: { price: 99, credits: 2000, features: ['HIPAA Compliant', 'Patient Portal', 'Multi-language', 'EHR Ready'] },
    hospital: { price: 499, credits: 10000, features: ['Unlimited Seats', 'Full Compliance', 'Custom Integrations', 'SLA'] },
  },
  enterprise: {
    custom: { price: 'Contact', credits: 'Unlimited', features: ['White-label', 'Data Residency', 'Custom AI', 'Dedicated Infrastructure'] },
  },
};

// =============================================================================
// COMPETITOR PRICING COMPARISON
// =============================================================================
export const competitorPricing = [
  { name: 'CapCut Pro', segment: 'Creator', price: 8, features: 'Basic editing, templates' },
  { name: 'Descript', segment: 'Creator', price: 24, features: 'Transcription, basic voice' },
  { name: 'Loom Business', segment: 'SMB', price: 15, features: 'Recording, analytics' },
  { name: 'Synthesia', segment: 'SMB', price: 67, features: 'AI avatars, multi-language' },
  { name: 'Healthwise', segment: 'Healthcare', price: 4000, features: 'Content library, compliance' },
  { name: 'Kaltura', segment: 'Enterprise', price: 10000, features: 'Full platform, enterprise' },
  { name: 'Genie Suite', segment: 'All', price: '9-499', features: 'Unified AI suite, all segments' },
];
