/**
 * Subscription Tiers Configuration
 * 
 * CREDIT-BASED 6-TIER MODEL (Jan 2026 - Excel Analysis Aligned):
 * Based on: AI_Presentation_Competitor_Analysis_Enhanced_11.xlsx
 * 
 * 1. Free - $0, 30 credits, watermark, 720p (Hook tier)
 * 2. Starter - $12/mo, 150 credits (Replaces 2-3 tools)
 * 3. Creator - $29/mo, 400 credits (Sweet spot for creators)
 * 4. Pro - $59/mo, 1,000 credits (Beats HeyGen/Synthesia)
 * 5. Business - $149/mo, 3,000 credits (Teams)
 * 6. Enterprise - Custom (White-label, SSO, unlimited)
 * 
 * CREDIT SYSTEM: 1 Credit = $0.10 user value (costs $0.025-0.05 = 50-75% margin)
 * 
 * KILLER PIPELINES:
 * #1: Global Voice Dubbing + Repair (70+ languages, checkpoint restoration)
 * #2: Mobile One-Tap Record → Publish (0% competitor coverage)
 * 
 * REGIONAL CONVERSION DRIVERS:
 * - Asia (CJK): "Voice sounds HUMAN, not robot" → CosyVoice
 * - India: "My language (Telugu/Tamil/Bengali) actually works!" → 22 languages
 * - MEA: "My dialect, not news anchor Arabic" → 7 Arabic dialects
 * - LatAm: "Mobile-first + unlimited short-form" → One-tap publish
 * - Europe: "Export that WORKS + full deck translation" → DeepL routing
 * - US/Canada: "All-in-one + no credit loss on failures" → Checkpoint restore
 */

export type SubscriptionTier = 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise' | 'beta';

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
    // Killer Pipeline #1: Global Voice Dubbing
    videoDubsPerMonth?: number;
    dubbingMinutesPerDub?: number;
    dubbingLanguages?: number;
    lipSyncEnabled?: boolean;
    voiceCloneEnabled?: boolean;
    checkpointRestoreEnabled?: boolean;
    // Killer Pipeline #2: Mobile Record → Publish
    mobileRecordsPerMonth?: number;
    mobileRecordMinutes?: number;
    offlineQueueMinutes?: number;
    socialPlatforms?: number;
    autoEditEnabled?: boolean;
    advancedEditEnabled?: boolean;
    // Presentation Features
    presentationsPerMonth?: number;
    avatarVideosPerMonth?: number;
    // Enterprise Features
    customAvatarTraining?: boolean;
    apiAccess?: boolean;
    whiteLabel?: boolean;
    ssoSaml?: boolean;
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
  hookFeatures?: string[]; // "Aha moment" features for conversion
  regionalValue?: Record<string, string>; // Region-specific value props
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
  /**
   * FREE TIER - "The Hook"
   * Goal: Create "aha moment" in first 2 minutes
   * 
   * Hook Psychology:
   * - Asia: Try Japanese/Korean/Chinese dub → "It sounds HUMAN!"
   * - MEA: Try Arabic dialect → "Finally not news anchor Arabic!"
   * - India: Try Telugu/Tamil → "My language actually works!"
   * - LatAm: Try mobile record → "I can create anywhere!"
   */
  free: {
    id: 'free',
    name: 'free',
    displayName: 'Free',
    price: { monthly: 0, yearly: 0 },
    credits: { monthly: 25, daily: 5 },
    limits: {
      projects: 2,
      agents: 1,
      documentsPerMonth: 10,
      scriptsPerMonth: 5,
      recordingHours: 0.5,
      teamMembers: 1,
      // HOOK: 3 AI presentations with watermark
      presentationsPerMonth: 3,
      // HOOK: 1 video dub (any language!) - shows 70+ language power
      videoDubsPerMonth: 1,
      dubbingMinutesPerDub: 2,
      dubbingLanguages: 70, // ALL languages available to hook!
      checkpointRestoreEnabled: true, // Show value even in free
      // HOOK: 5 min voice clone - personal & sticky
      voiceCloneEnabled: false, // Tease only
      // HOOK: 3 mobile records - demonstrates offline magic
      mobileRecordsPerMonth: 3,
      mobileRecordMinutes: 2,
      offlineQueueMinutes: 5,
    },
    features: [
      '3 AI presentations/mo (watermarked)',
      '1 video dub (any of 70+ languages!)',
      '5 min voice clone preview',
      '3 mobile recordings',
      'Offline mode (5 min queue)',
      'Checkpoint restore (no lost credits)',
      'Export with watermark',
    ],
    hookFeatures: [
      '🌍 Try ANY language - Japanese, Arabic dialects, Telugu - sounds HUMAN!',
      '📱 Mobile record anywhere - even offline!',
      '✅ Never lose credits on failed generations',
    ],
    regionalValue: {
      asia: 'CJK voice that sounds natural - Alibaba CosyVoice',
      india: 'Telugu, Tamil, Bengali, Kannada actually work!',
      mea: 'Your Arabic dialect, not news anchor Arabic',
      latam: 'Create on your phone, anywhere, anytime',
      europe: 'Full deck translation that preserves layout',
      north_america: 'One tool, no credit traps',
    },
    genieProducts: {
      mind: true,
      spark: true,
      vibe: false,
      arc: false,
      hub: false
    },
    stripeIds: null,
    recommendedFor: ['trial', 'testing', 'first_time']
  },
  
  /**
   * STARTER TIER ($12/mo) - "The Replacement"
   * Goal: Replace 2-3 separate tool subscriptions
   * 
   * Value: "One tool for $12 vs $30+ for 3 tools"
   * Target: India, SEA, LatAm (price sensitive, mobile-first)
   * 
   * Replaces:
   * - Gamma Free ($0) - but with working exports
   * - ElevenLabs Starter ($5) - voice dubbing
   * - No mobile equivalent exists
   */
  starter: {
    id: 'starter',
    name: 'starter',
    displayName: 'Starter',
    price: { monthly: 12, yearly: 120 },
    credits: { monthly: 150, daily: 15 },
    limits: {
      projects: 10,
      agents: 5,
      documentsPerMonth: 50,
      scriptsPerMonth: 25,
      recordingHours: 5,
      teamMembers: 1,
      // 15 presentations (no watermark) - beats Gamma Free
      presentationsPerMonth: 15,
      // 5 video dubs (5 min each) - replaces ElevenLabs Starter
      videoDubsPerMonth: 5,
      dubbingMinutesPerDub: 5,
      dubbingLanguages: 20,
      checkpointRestoreEnabled: true,
      // 15 mobile sessions - unique feature
      mobileRecordsPerMonth: 15,
      mobileRecordMinutes: 5,
      offlineQueueMinutes: 30,
      socialPlatforms: 3,
    },
    features: [
      '150 credits/month ($0.08/credit)',
      '15 AI presentations/mo (no watermark)',
      '1080p resolution (upgrade from 720p)',
      '5 video dubs (20 languages, 5 min each)',
      '15 mobile recordings',
      '30 min offline queue',
      '3 social platforms (TikTok, Reels, LinkedIn)',
      'Clean PPT/PDF export (no broken layouts!)',
      'Email support',
    ],
    hookFeatures: [
      '🎯 Replaces Gamma Free + ElevenLabs Starter',
      '📱 Mobile-first workflow (unique in market)',
      '✅ Exports that actually work',
    ],
    regionalValue: {
      asia: '20 Asian languages including CJK variants',
      india: 'Indian language pack + mobile workflow',
      mea: 'Arabic dialects + RTL export',
      latam: 'Mobile-first + Brazilian Portuguese',
      europe: 'DeepL translation + clean exports',
      north_america: 'All-in-one replacement',
    },
    genieProducts: {
      mind: true,
      spark: true,
      vibe: true,
      arc: false,
      hub: false
    },
    stripeIds: {
      productId: 'prod_starter_genie',
      priceIdMonthly: 'price_starter_monthly',
      priceIdYearly: 'price_starter_yearly'
    },
    recommendedFor: ['hobbyist', 'student', 'individual']
  },
  
  /**
   * CREATOR TIER ($29/mo) - "The Sweet Spot"
   * Goal: Sweet spot for content creators and freelancers
   * 
   * Value: Brand kit, templates, priority queue
   * Target: Content creators, freelancers, small teams
   */
  creator: {
    id: 'creator',
    name: 'creator',
    displayName: 'Creator',
    price: { monthly: 29, yearly: 290 },
    credits: { monthly: 400, daily: 40 },
    limits: {
      projects: 25,
      agents: 10,
      documentsPerMonth: 150,
      scriptsPerMonth: 75,
      recordingHours: 15,
      teamMembers: 2,
      presentationsPerMonth: 30,
      avatarVideosPerMonth: 8,
      videoDubsPerMonth: 10,
      dubbingMinutesPerDub: 8,
      dubbingLanguages: 40,
      lipSyncEnabled: true,
      voiceCloneEnabled: true, // 1 voice
      checkpointRestoreEnabled: true,
      mobileRecordsPerMonth: 30,
      mobileRecordMinutes: 10,
      offlineQueueMinutes: 45,
      socialPlatforms: 5,
      autoEditEnabled: true,
    },
    features: [
      '400 credits/month ($0.073/credit)',
      '30 AI presentations/mo',
      '8 avatar videos/mo',
      '10 video dubs (40 languages)',
      'Brand kit + templates',
      'Priority queue (2x faster)',
      '1 voice clone',
      'Premium template library',
      'Basic analytics',
      'Priority email support',
    ],
    hookFeatures: [
      '🎨 Brand kit to maintain consistency',
      '⚡ Priority queue - 2x faster processing',
      '🎤 Voice clone included',
    ],
    regionalValue: {
      asia: '40 Asian languages with brand templates',
      india: 'Full Indian language pack + brand kit',
      mea: 'Arabic dialects + brand templates',
      latam: 'Unlimited short-form + brand kit',
      europe: 'DeepL + brand governance',
      north_america: 'Creator toolkit + priority support',
    },
    genieProducts: {
      mind: true,
      spark: true,
      vibe: true,
      arc: true,
      hub: false
    },
    stripeIds: {
      productId: 'prod_creator_genie',
      priceIdMonthly: 'price_creator_monthly',
      priceIdYearly: 'price_creator_yearly'
    },
    recommendedFor: ['creator', 'freelancer', 'small_team', 'traveler']
  },
  
  /**
   * PRO TIER ($29.99/mo) - "The Creator's Arsenal"
   * Goal: Make switching from HeyGen/Synthesia a no-brainer
   * 
   * Value Comparison:
   * - Synthesia $89/mo = 120 credits ≈ 10 videos
   * - HeyGen Business $149/mo = 1,000 credits ≈ 8 dubs
   * - ElevenLabs Pro $99/mo = 500k chars
   * - Genie Pro $29.99/mo = 15 avatars + unlimited dubbing + presentations
   * 
   * Migration Offer: "Import HeyGen/ElevenLabs projects, 30% off first 3 months"
   * Target: US, Canada, Europe, Japan, Korea (value-conscious professionals)
   */
  pro: {
    id: 'pro',
    name: 'pro',
    displayName: 'Pro',
    price: { monthly: 29.99, yearly: 299.99 },
    credits: { monthly: 500, daily: 50 },
    limits: {
      projects: 50,
      agents: 25,
      documentsPerMonth: 500,
      scriptsPerMonth: 150,
      recordingHours: 25,
      teamMembers: 5,
      // 50 presentations - unlimited for most users
      presentationsPerMonth: 50,
      // 15 avatar videos - beats Synthesia $89
      avatarVideosPerMonth: 15,
      // UNLIMITED dubbing - beats ElevenLabs Pro $99
      videoDubsPerMonth: -1, // Unlimited
      dubbingMinutesPerDub: 10,
      dubbingLanguages: 70,
      lipSyncEnabled: true,
      voiceCloneEnabled: true, // 3 voices
      checkpointRestoreEnabled: true,
      // Unlimited mobile - unique
      mobileRecordsPerMonth: -1,
      mobileRecordMinutes: -1,
      offlineQueueMinutes: 60,
      socialPlatforms: -1, // All
      autoEditEnabled: true,
    },
    features: [
      '50 AI presentations/mo',
      '15 avatar videos/mo (beats Synthesia $89)',
      'UNLIMITED voice dubbing (beats ElevenLabs $99)',
      '70+ languages + lip-sync',
      '3 voice clones included',
      'Unlimited mobile recordings',
      '60 min offline queue',
      'All social platforms',
      'AI auto-edit',
      'Team collaboration (5 seats)',
      'Priority support',
      'API access (basic)',
    ],
    hookFeatures: [
      '🚀 Beats HeyGen Business ($149) + Synthesia ($89) combined',
      '🌍 70+ languages with native-quality voice',
      '🎤 Voice cloning included (not $22/mo add-on)',
    ],
    regionalValue: {
      asia: 'CJK voice cloning + lip-sync with Alibaba CosyVoice',
      india: '22 Indian languages + Dravidian dialects',
      mea: '7 Arabic dialects + RTL avatar videos',
      latam: 'Brazilian Portuguese distinction + unlimited dubbing',
      europe: 'GDPR-compliant + DeepL translation',
      north_america: 'All-in-one creator arsenal',
    },
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
    recommendedFor: ['creator', 'agency', 'marketing_team', 'education', 'healthcare', 'professional']
  },
  
  /**
   * ENTERPRISE TIER (Custom) - "The Platform"
   * Goal: Lock in agencies, L&D teams, enterprises
   * 
   * Unique Enterprise Value:
   * - Custom Avatar Training: "Our CEO in every video"
   * - API + White-Label: Resell to clients
   * - SSO/SAML: IT compliance
   * 
   * Target: Global enterprises, agencies, healthcare, education
   */
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
      teamMembers: -1,
      presentationsPerMonth: -1,
      avatarVideosPerMonth: -1,
      videoDubsPerMonth: -1,
      dubbingMinutesPerDub: -1,
      dubbingLanguages: 70,
      lipSyncEnabled: true,
      voiceCloneEnabled: true,
      checkpointRestoreEnabled: true,
      mobileRecordsPerMonth: -1,
      mobileRecordMinutes: -1,
      offlineQueueMinutes: -1,
      socialPlatforms: -1,
      autoEditEnabled: true,
      advancedEditEnabled: true,
      // Enterprise exclusives
      customAvatarTraining: true,
      apiAccess: true,
      whiteLabel: true,
      ssoSaml: true,
    },
    features: [
      'Everything in Pro (unlimited)',
      'Custom avatar training (5 executives)',
      'Full API access',
      'White-label + resell',
      'SSO/SAML',
      'HIPAA compliance',
      'Dedicated infrastructure',
      '99.9% SLA',
      'Named account manager',
      'Custom integrations',
      'On-premise option',
      'Unlimited team seats',
      'Brand template enforcement',
    ],
    hookFeatures: [
      '🎭 Train AI on executive faces/voices',
      '🏢 White-label and resell to your clients',
      '🔒 Enterprise security (SSO, HIPAA, on-prem)',
    ],
    regionalValue: {
      asia: 'Regional data residency options',
      india: 'India-hosted infrastructure available',
      mea: 'Arabic-first enterprise support',
      latam: 'LatAm-specific compliance',
      europe: 'EU data residency + GDPR',
      north_america: 'SOC2 + HIPAA compliance',
    },
    genieProducts: {
      mind: true,
      spark: true,
      vibe: true,
      arc: true,
      hub: true
    },
    stripeIds: null, // Custom sales
    recommendedFor: ['enterprise', 'healthcare_org', 'government', 'large_team', 'agency']
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
 * Segment-based tier recommendations (4-tier model)
 */
export const SEGMENT_TIER_MAPPING: Record<string, SubscriptionTier> = {
  // Free trial seekers
  trial: 'free',
  testing: 'free',
  first_time: 'free',
  
  // Basic - Price-sensitive, mobile-first
  creator: 'basic',
  traveler: 'basic',
  individual: 'basic',
  student: 'basic',
  small_business: 'basic',
  
  // Pro - Value-conscious professionals
  agency: 'pro',
  marketing_team: 'pro',
  education: 'pro',
  healthcare: 'pro',
  media_company: 'pro',
  professional: 'pro',
  
  // Enterprise - Organizations
  enterprise: 'enterprise',
  healthcare_org: 'enterprise',
  government: 'enterprise',
  large_team: 'enterprise'
};

/**
 * Regional tier recommendations based on market research
 */
export const REGIONAL_TIER_RECOMMENDATIONS: Record<string, { 
  suggestedTier: SubscriptionTier;
  hookFeature: string;
  conversionDriver: string;
}> = {
  asia: {
    suggestedTier: 'pro',
    hookFeature: 'CJK voice that sounds HUMAN via Alibaba CosyVoice',
    conversionDriver: 'Numbers/dates handled correctly in dubbing',
  },
  india: {
    suggestedTier: 'basic',
    hookFeature: '22 Indian languages including Dravidian (Telugu, Tamil, Kannada)',
    conversionDriver: 'Mobile-first workflow + affordable pricing',
  },
  mea: {
    suggestedTier: 'pro',
    hookFeature: '7 Arabic dialects (not just MSA "news anchor" Arabic)',
    conversionDriver: 'RTL layout that exports correctly',
  },
  latam: {
    suggestedTier: 'basic',
    hookFeature: 'Mobile one-tap record → social publish',
    conversionDriver: 'Brazilian vs Portugal Portuguese distinction',
  },
  europe: {
    suggestedTier: 'pro',
    hookFeature: 'Full deck translation via DeepL (preserves layout)',
    conversionDriver: 'PPT exports that actually work',
  },
  north_america: {
    suggestedTier: 'pro',
    hookFeature: 'All-in-one (replaces HeyGen + ElevenLabs + Gamma)',
    conversionDriver: 'Checkpoint restore - no credit loss on failures',
  },
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
