/**
 * Subscription Tiers Configuration
 * 
 * FINALIZED 5-TIER MODEL:
 * 1. Free Trial - $0, 14 days, basic access
 * 2. Starter - $9.99/mo, solo creators
 * 3. Business - $29.99/mo, small teams
 * 4. Pro - $79.99/mo, professionals
 * 5. Enterprise - Custom, organizations
 * 
 * SEGMENT-BASED RECOMMENDATIONS:
 * - Creator/Traveler → Starter
 * - Small Business → Business
 * - Education/Healthcare/Enterprise → Pro/Enterprise
 */

export type SubscriptionTier = 'free' | 'starter' | 'business' | 'pro' | 'enterprise' | 'beta';

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  displayName: string;
  price: {
    monthly: number;
    yearly: number;
  };
  credits: {
    monthly: number;
    daily: number;
  };
  limits: {
    projects: number;
    agents: number;
    documentsPerMonth: number;
    scriptsPerMonth: number;
    recordingHours: number;
    teamMembers: number;
  };
  features: string[];
  genieProducts: {
    mind: boolean;
    spark: boolean;
    vibe: boolean;
    arc: boolean;
    hub: boolean;
  };
  stripeIds: {
    productId: string;
    priceIdMonthly: string;
    priceIdYearly: string;
  } | null;
  recommendedFor: string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: 'free',
    name: 'free',
    displayName: 'Free Trial',
    price: { monthly: 0, yearly: 0 },
    credits: { monthly: 10, daily: 5 },
    limits: {
      projects: 2,
      agents: 1,
      documentsPerMonth: 10,
      scriptsPerMonth: 5,
      recordingHours: 0.5,
      teamMembers: 1
    },
    features: [
      'Basic Studio access',
      'Basic Spark generation',
      'Watermarked exports',
      '14-day trial period'
    ],
    genieProducts: {
      mind: true, // Limited
      spark: true, // Limited
      vibe: false,
      arc: false,
      hub: false
    },
    stripeIds: null,
    recommendedFor: ['trial', 'testing']
  },
  
  starter: {
    id: 'starter',
    name: 'starter',
    displayName: 'Starter',
    price: { monthly: 9.99, yearly: 99.99 },
    credits: { monthly: 100, daily: 10 },
    limits: {
      projects: 5,
      agents: 5,
      documentsPerMonth: 50,
      scriptsPerMonth: 25,
      recordingHours: 5,
      teamMembers: 1
    },
    features: [
      'Core Genie features',
      'No watermarks',
      '5 projects',
      'Basic AI routing',
      'Email support',
      'Basic templates'
    ],
    genieProducts: {
      mind: true,
      spark: true,
      vibe: true, // Limited hours
      arc: false,
      hub: false
    },
    stripeIds: {
      productId: 'prod_starter_genie',
      priceIdMonthly: 'price_starter_monthly',
      priceIdYearly: 'price_starter_yearly'
    },
    recommendedFor: ['creator', 'traveler', 'individual']
  },
  
  business: {
    id: 'business',
    name: 'business',
    displayName: 'Business',
    price: { monthly: 29.99, yearly: 299.99 },
    credits: { monthly: 500, daily: 25 },
    limits: {
      projects: 50,
      agents: 25,
      documentsPerMonth: 500,
      scriptsPerMonth: 150,
      recordingHours: 25,
      teamMembers: 5
    },
    features: [
      'Full Genie Suite access',
      '50 projects',
      'Team collaboration',
      'Premium AI voices',
      'Background blur & effects',
      'Custom templates',
      'Priority support',
      'Team feedback system'
    ],
    genieProducts: {
      mind: true,
      spark: true,
      vibe: true,
      arc: false,
      hub: true // Limited
    },
    stripeIds: {
      productId: 'prod_business_genie',
      priceIdMonthly: 'price_business_monthly',
      priceIdYearly: 'price_business_yearly'
    },
    recommendedFor: ['small_business', 'agency', 'marketing_team']
  },
  
  pro: {
    id: 'pro',
    name: 'pro',
    displayName: 'Pro',
    price: { monthly: 79.99, yearly: 799.99 },
    credits: { monthly: 2000, daily: 100 },
    limits: {
      projects: -1, // Unlimited
      agents: -1, // Unlimited
      documentsPerMonth: -1,
      scriptsPerMonth: -1,
      recordingHours: -1,
      teamMembers: 25
    },
    features: [
      'Unlimited projects',
      'Full Genie Suite + Arc',
      'White-label exports',
      'Voice cloning',
      'Virtual sets',
      'Custom embeddings',
      'Knowledge graphs',
      'API access',
      'Approval workflows',
      'Dedicated support'
    ],
    genieProducts: {
      mind: true,
      spark: true,
      vibe: true,
      arc: true,
      hub: true
    },
    stripeIds: {
      productId: 'prod_pro_genie',
      priceIdMonthly: 'price_pro_monthly',
      priceIdYearly: 'price_pro_yearly'
    },
    recommendedFor: ['education', 'healthcare', 'media_company', 'professional']
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    price: { monthly: -1, yearly: -1 }, // Custom pricing
    credits: { monthly: -1, daily: -1 }, // Unlimited
    limits: {
      projects: -1,
      agents: -1,
      documentsPerMonth: -1,
      scriptsPerMonth: -1,
      recordingHours: -1,
      teamMembers: -1
    },
    features: [
      'Everything in Pro',
      'HIPAA compliance',
      'SSO/SAML',
      'Custom integrations',
      'Dedicated infrastructure',
      'SLA guarantees',
      'Custom training',
      'Account manager',
      'On-premise option'
    ],
    genieProducts: {
      mind: true,
      spark: true,
      vibe: true,
      arc: true,
      hub: true
    },
    stripeIds: null, // Custom sales
    recommendedFor: ['enterprise', 'healthcare_org', 'government', 'large_team']
  },
  
  beta: {
    id: 'beta',
    name: 'beta',
    displayName: 'Beta Tester',
    price: { monthly: 0, yearly: 0 },
    credits: { monthly: -1, daily: -1 }, // Unlimited for testing
    limits: {
      projects: -1,
      agents: -1,
      documentsPerMonth: -1,
      scriptsPerMonth: -1,
      recordingHours: -1,
      teamMembers: 1
    },
    features: [
      'Full access (beta)',
      'Early feature access',
      'Direct feedback channel',
      'Beta community access'
    ],
    genieProducts: {
      mind: true,
      spark: true,
      vibe: true,
      arc: true,
      hub: true
    },
    stripeIds: null,
    recommendedFor: ['beta_tester', 'early_adopter']
  }
};

/**
 * Segment-based tier recommendations
 */
export const SEGMENT_TIER_MAPPING: Record<string, SubscriptionTier> = {
  // Individuals
  creator: 'starter',
  traveler: 'starter',
  individual: 'starter',
  student: 'starter',
  
  // Small teams
  small_business: 'business',
  agency: 'business',
  marketing_team: 'business',
  
  // Professionals
  education: 'pro',
  healthcare: 'pro',
  media_company: 'pro',
  professional: 'pro',
  
  // Organizations
  enterprise: 'enterprise',
  healthcare_org: 'enterprise',
  government: 'enterprise',
  large_team: 'enterprise'
};

/**
 * Get recommended tier for a segment
 */
export function getRecommendedTier(segment: string): TierConfig {
  const tierId = SEGMENT_TIER_MAPPING[segment] || 'starter';
  return SUBSCRIPTION_TIERS[tierId];
}

/**
 * Check if a feature is available for a tier
 */
export function hasFeatureAccess(tier: SubscriptionTier, feature: string): boolean {
  const config = SUBSCRIPTION_TIERS[tier];
  return config.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
}

/**
 * Check if a Genie product is available for a tier
 */
export function hasProductAccess(tier: SubscriptionTier, product: keyof TierConfig['genieProducts']): boolean {
  return SUBSCRIPTION_TIERS[tier].genieProducts[product];
}
