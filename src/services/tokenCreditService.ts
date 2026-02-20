/**
 * Token ↔ Credit Conversion Service
 *
 * DUAL DISPLAY MODEL:
 *   • Internal users → raw tokens + USD cost
 *   • External subscribers → credits consumed / estimated (tier-dependent ratio)
 *
 * Each subscription tier defines a `tokensPerCredit` ratio.
 * Credits = actual_tokens / tokensPerCredit.
 *
 * The service is product-agnostic — works with any Genie product.
 *
 * @see subscriptionCheck.ts — tier definitions
 * @see productionCostAccumulator.ts — raw token tracking
 */

// ============================================================================
// TYPES
// ============================================================================

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';
export type UserContext = 'internal' | 'external';
export type CostStepType = 'tts' | 'video' | 'avatar' | '3d' | 'animation' | 'music' | 'image' | 'script' | 'translation' | 'other';

export interface TierCreditConfig {
  /** How many raw tokens equal 1 credit for this tier */
  tokensPerCredit: number;
  /** Monthly credit quota (-1 = unlimited) */
  monthlyCredits: number;
  /** Label shown in UI */
  label: string;
}

export interface StepCostEstimate {
  step: CostStepType;
  label: string;
  estimatedTokens: number;
  estimatedCredits: number;
  actualTokens: number;
  actualCredits: number;
  actualCostUsd: number;
  jobCount: number;
}

export interface ProjectCostDisplay {
  /** For internal dashboard */
  internal: {
    totalTokens: number;
    totalCostUsd: number;
    byStep: StepCostEstimate[];
  };
  /** For external subscriber UI */
  external: {
    tier: SubscriptionTier;
    totalCreditsUsed: number;
    totalCreditsEstimated: number;
    monthlyQuota: number;
    remainingCredits: number;
    byStep: StepCostEstimate[];
  };
}

// ============================================================================
// TIER CREDIT CONFIGURATION (single source of truth)
// ============================================================================

export const TIER_CREDIT_CONFIG: Record<SubscriptionTier, TierCreditConfig> = {
  free: {
    tokensPerCredit: 250,
    monthlyCredits: 10,
    label: 'Free',
  },
  starter: {
    tokensPerCredit: 500,
    monthlyCredits: 100,
    label: 'Starter',
  },
  professional: {
    tokensPerCredit: 1000,
    monthlyCredits: 1000,
    label: 'Professional',
  },
  enterprise: {
    tokensPerCredit: 2000,
    monthlyCredits: -1, // Unlimited
    label: 'Enterprise',
  },
};

// ============================================================================
// STEP ESTIMATION DEFAULTS (approximate tokens per unit of work)
// ============================================================================

export const STEP_ESTIMATION_DEFAULTS: Record<CostStepType, {
  label: string;
  tokensPerUnit: number;
  unitDescription: string;
}> = {
  tts: { label: 'Text-to-Speech', tokensPerUnit: 150, unitDescription: 'per line' },
  video: { label: 'Video Generation', tokensPerUnit: 5000, unitDescription: 'per scene' },
  avatar: { label: 'Avatar Video', tokensPerUnit: 8000, unitDescription: 'per scene' },
  '3d': { label: '3D Generation', tokensPerUnit: 12000, unitDescription: 'per asset' },
  animation: { label: 'Animation', tokensPerUnit: 6000, unitDescription: 'per scene' },
  music: { label: 'Music/SFX', tokensPerUnit: 3000, unitDescription: 'per track' },
  image: { label: 'Image Generation', tokensPerUnit: 2000, unitDescription: 'per image' },
  script: { label: 'Script Generation', tokensPerUnit: 1000, unitDescription: 'per scene' },
  translation: { label: 'Translation', tokensPerUnit: 500, unitDescription: 'per language' },
  other: { label: 'Other', tokensPerUnit: 500, unitDescription: 'per unit' },
};

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/** Convert raw tokens to credits for a given tier */
export function tokensToCredits(tokens: number, tier: SubscriptionTier): number {
  const config = TIER_CREDIT_CONFIG[tier];
  if (!config || config.tokensPerCredit <= 0) return 0;
  return Math.round((tokens / config.tokensPerCredit) * 100) / 100;
}

/** Convert credits to estimated tokens for a given tier */
export function creditsToTokens(credits: number, tier: SubscriptionTier): number {
  const config = TIER_CREDIT_CONFIG[tier];
  return Math.round(credits * config.tokensPerCredit);
}

/** Get remaining credits for a subscriber */
export function getRemainingCredits(
  usedTokens: number,
  tier: SubscriptionTier,
): number {
  const config = TIER_CREDIT_CONFIG[tier];
  if (config.monthlyCredits === -1) return Infinity;
  const used = tokensToCredits(usedTokens, tier);
  return Math.max(0, config.monthlyCredits - used);
}

// ============================================================================
// ESTIMATE BEFORE GENERATION
// ============================================================================

export interface PreGenerationEstimate {
  stepType: CostStepType;
  unitCount: number;
  estimatedTokens: number;
  estimatedCredits: number;
  estimatedCostUsd: number;
}

const DEFAULT_COST_PER_1K = 0.025;

/**
 * Pre-generation estimate for a given step.
 * Shows subscribers how many credits a job will consume BEFORE they click Generate.
 */
export function estimateStepCost(
  stepType: CostStepType,
  unitCount: number,
  tier: SubscriptionTier,
): PreGenerationEstimate {
  const defaults = STEP_ESTIMATION_DEFAULTS[stepType] || STEP_ESTIMATION_DEFAULTS.other;
  const estimatedTokens = defaults.tokensPerUnit * unitCount;
  return {
    stepType,
    unitCount,
    estimatedTokens,
    estimatedCredits: tokensToCredits(estimatedTokens, tier),
    estimatedCostUsd: Math.round((estimatedTokens / 1000) * DEFAULT_COST_PER_1K * 10000) / 10000,
  };
}

// ============================================================================
// BUILD DUAL DISPLAY FROM RAW COST SUMMARY
// ============================================================================

/**
 * Build the dual-view cost display from a raw ProjectCostSummary.
 * Internal = tokens + USD. External = credits + quota.
 *
 * @param rawSummary — from productionCostAccumulator.getProjectCostSummary()
 * @param tier — subscriber tier (defaults to 'free')
 * @param monthlyTokensUsedSoFar — total tokens used this billing period (for quota)
 */
export function buildProjectCostDisplay(
  rawSummary: {
    totalEstimatedTokens: number;
    totalActualTokens: number;
    totalEstimatedCostUsd: number;
    totalActualCostUsd: number;
    byJobType: Record<string, { count: number; tokens: number; costUsd: number }>;
  },
  tier: SubscriptionTier = 'free',
  monthlyTokensUsedSoFar: number = 0,
): ProjectCostDisplay {
  const config = TIER_CREDIT_CONFIG[tier];

  // Map byJobType to StepCostEstimate[]
  const stepMap = new Map<CostStepType, StepCostEstimate>();

  for (const [jobType, data] of Object.entries(rawSummary.byJobType)) {
    const stepType = normalizeJobType(jobType);
    const existing = stepMap.get(stepType);
    const defaults = STEP_ESTIMATION_DEFAULTS[stepType] || STEP_ESTIMATION_DEFAULTS.other;

    if (existing) {
      existing.actualTokens += data.tokens;
      existing.actualCredits = tokensToCredits(existing.actualTokens, tier);
      existing.actualCostUsd += data.costUsd;
      existing.jobCount += data.count;
    } else {
      stepMap.set(stepType, {
        step: stepType,
        label: defaults.label,
        estimatedTokens: defaults.tokensPerUnit * data.count,
        estimatedCredits: tokensToCredits(defaults.tokensPerUnit * data.count, tier),
        actualTokens: data.tokens,
        actualCredits: tokensToCredits(data.tokens, tier),
        actualCostUsd: data.costUsd,
        jobCount: data.count,
      });
    }
  }

  const byStep = Array.from(stepMap.values());

  const totalCreditsUsed = tokensToCredits(rawSummary.totalActualTokens, tier);
  const totalCreditsEstimated = tokensToCredits(rawSummary.totalEstimatedTokens, tier);

  return {
    internal: {
      totalTokens: rawSummary.totalActualTokens,
      totalCostUsd: rawSummary.totalActualCostUsd,
      byStep,
    },
    external: {
      tier,
      totalCreditsUsed,
      totalCreditsEstimated,
      monthlyQuota: config.monthlyCredits,
      remainingCredits: config.monthlyCredits === -1
        ? Infinity
        : Math.max(0, config.monthlyCredits - tokensToCredits(monthlyTokensUsedSoFar + rawSummary.totalActualTokens, tier)),
      byStep,
    },
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/** Normalize cast_generation_jobs.job_type to our CostStepType enum */
function normalizeJobType(jobType: string): CostStepType {
  const map: Record<string, CostStepType> = {
    tts: 'tts',
    'text-to-speech': 'tts',
    video: 'video',
    'video-generation': 'video',
    avatar: 'avatar',
    'avatar-video': 'avatar',
    '3d': '3d',
    '3d-generation': '3d',
    animation: 'animation',
    music: 'music',
    sfx: 'music',
    image: 'image',
    'image-generation': 'image',
    script: 'script',
    'script-generation': 'script',
    translation: 'translation',
    dubbing: 'translation',
  };
  return map[jobType.toLowerCase()] || 'other';
}

// ============================================================================
// FORMAT FOR UI
// ============================================================================

/** Format credits for display (e.g. "3.5 credits" or "∞") */
export function formatCredits(credits: number): string {
  if (!isFinite(credits)) return '∞';
  if (credits === 0) return '0';
  return credits % 1 === 0 ? `${credits}` : credits.toFixed(1);
}

/** Format tokens for display (e.g. "1,247" or "12.5K") */
export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 10_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toLocaleString();
}

/** Format USD for display (e.g. "$0.03" or "$1.25") */
export function formatUsd(usd: number): string {
  if (usd === 0) return '$0.00';
  if (usd < 0.01) return '<$0.01';
  return `$${usd.toFixed(2)}`;
}
