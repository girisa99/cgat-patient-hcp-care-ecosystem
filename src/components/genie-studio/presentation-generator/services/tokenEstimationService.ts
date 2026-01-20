/**
 * Token Estimation Service
 * Provides detailed token/credit estimation with breakdown and optimization suggestions
 * 
 * NOTE: Actual token counts are difficult to calculate before generation because:
 * - AI model responses vary in length
 * - Image generation tokens depend on quality/resolution
 * - Video generation is highly variable
 * 
 * Therefore, we provide ESTIMATED tokens with confidence ranges.
 */

import { CREDIT_MULTIPLIERS } from '../components/CreditBurnDisplay';
import { MODEL_TIERS, getModelTierInfo } from '../components/PreGenerationConfirmationPanel';

// Base token costs per component
export const TOKEN_COSTS = {
  // Text generation (per slide)
  textPerSlide: 500, // ~500 tokens per slide content
  titleGeneration: 50,
  bulletPoints: 100,
  speakerNotes: 200,
  
  // Image generation (per image)
  imageGeneration: {
    '2d-static': 1000,
    '3d-scene': 3000,
    '3d-animated': 5000,
    'video-intro': 8000,
    'video-full': 15000,
  },
  
  // Voice generation (per minute)
  voicePerMinute: 2000,
  voicePerSlide: 500, // ~30 seconds per slide average
  
  // Translation (per 1000 chars)
  translationPer1K: 200,
  translationPerSlide: 300,
  
  // Additional features
  musicGeneration: 5000,
  interactiveElements: 1000,
  chartGeneration: 800,
  tableGeneration: 500,
  
  // Framework processing
  frameworkAnalysis: 1000,
  frameworkPerSlide: 200,
} as const;

// Token-to-credit conversion (approximate)
export const TOKENS_PER_CREDIT = 1000;

export interface TokenBreakdown {
  category: string;
  subcategory: string;
  tokens: number;
  credits: number;
  description: string;
  isOptional: boolean;
  savingsIfRemoved?: number;
  optimizationTip?: string;
}

export interface TokenEstimate {
  totalTokens: number;
  totalCredits: number;
  breakdown: TokenBreakdown[];
  confidenceLevel: 'low' | 'medium' | 'high';
  confidencePercent: number;
  estimatedRange: { min: number; max: number };
  optimizationSuggestions: OptimizationSuggestion[];
}

export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  savingsPercent: number;
  impact: 'low' | 'medium' | 'high';
  action: 'reduce_languages' | 'simplify_output' | 'reduce_slides' | 'remove_voiceover' | 'remove_music' | 'use_budget_models' | 'reduce_frameworks' | 'lower_resolution';
  currentValue: string | number;
  suggestedValue: string | number;
}

export interface EstimationConfig {
  // Content
  slideCount: number;
  contentLength: number; // Character count of input
  
  // Output
  outputType: string;
  resolution: '720p' | '1080p' | '4k';
  
  // Languages
  languageCount: number;
  includeVoiceover: boolean;
  voiceoverLanguages: number;
  
  // Additional features
  includeMusic: boolean;
  includeCharts: number;
  includeTables: number;
  includeInteractive: boolean;
  
  // Frameworks
  frameworkCount: number;
  
  // Models
  textModel: string;
  imageModel: string;
  voiceModel: string;
  translationModel: string;
}

/**
 * Calculate detailed token estimation with breakdown
 */
export function estimateTokens(config: EstimationConfig): TokenEstimate {
  const breakdown: TokenBreakdown[] = [];
  let totalTokens = 0;
  
  const outputMultiplier = CREDIT_MULTIPLIERS[config.outputType]?.multiplier || 1;
  const resolutionMultiplier = config.resolution === '4k' ? 1.5 : config.resolution === '1080p' ? 1.0 : 0.7;
  
  // Get model cost multipliers
  const textModelCost = getModelTierInfo(config.textModel).costMultiplier;
  const imageModelCost = getModelTierInfo(config.imageModel).costMultiplier;
  const voiceModelCost = getModelTierInfo(config.voiceModel).costMultiplier;
  const translationModelCost = getModelTierInfo(config.translationModel).costMultiplier;
  
  // 1. Text Generation
  const textTokens = Math.ceil(
    config.slideCount * TOKEN_COSTS.textPerSlide * textModelCost
  );
  breakdown.push({
    category: 'Text Generation',
    subcategory: 'Slide Content',
    tokens: textTokens,
    credits: Math.ceil(textTokens / TOKENS_PER_CREDIT),
    description: `${config.slideCount} slides × ${TOKEN_COSTS.textPerSlide} tokens`,
    isOptional: false,
    optimizationTip: 'Reduce slide count for fewer tokens',
  });
  totalTokens += textTokens;
  
  // 2. Image Generation
  const imageTokensPerSlide = TOKEN_COSTS.imageGeneration[config.outputType as keyof typeof TOKEN_COSTS.imageGeneration] || 1000;
  const imageTokens = Math.ceil(
    config.slideCount * imageTokensPerSlide * imageModelCost * resolutionMultiplier
  );
  breakdown.push({
    category: 'Visual Generation',
    subcategory: `${config.outputType.toUpperCase()} Images`,
    tokens: imageTokens,
    credits: Math.ceil(imageTokens / TOKENS_PER_CREDIT),
    description: `${config.slideCount} slides × ${imageTokensPerSlide} tokens (${config.resolution})`,
    isOptional: false,
    savingsIfRemoved: undefined,
    optimizationTip: config.outputType.includes('3d') || config.outputType.includes('video') 
      ? 'Switch to 2D static for 60-75% savings'
      : 'Lower resolution for 30% savings',
  });
  totalTokens += imageTokens;
  
  // 3. Voiceover
  if (config.includeVoiceover) {
    const voiceTokens = Math.ceil(
      config.slideCount * TOKEN_COSTS.voicePerSlide * config.voiceoverLanguages * voiceModelCost
    );
    breakdown.push({
      category: 'Voice Generation',
      subcategory: `TTS (${config.voiceoverLanguages} languages)`,
      tokens: voiceTokens,
      credits: Math.ceil(voiceTokens / TOKENS_PER_CREDIT),
      description: `${config.slideCount} slides × ${config.voiceoverLanguages} languages`,
      isOptional: true,
      savingsIfRemoved: voiceTokens,
      optimizationTip: config.voiceoverLanguages > 1 
        ? 'Reduce to 1-2 voiceover languages' 
        : 'Remove voiceover entirely',
    });
    totalTokens += voiceTokens;
  }
  
  // 4. Translation
  if (config.languageCount > 1) {
    const translationTokens = Math.ceil(
      config.slideCount * TOKEN_COSTS.translationPerSlide * (config.languageCount - 1) * translationModelCost
    );
    breakdown.push({
      category: 'Translation',
      subcategory: `${config.languageCount - 1} Additional Languages`,
      tokens: translationTokens,
      credits: Math.ceil(translationTokens / TOKENS_PER_CREDIT),
      description: `${config.slideCount} slides × ${config.languageCount - 1} languages`,
      isOptional: true,
      savingsIfRemoved: translationTokens,
      optimizationTip: 'Each additional language adds ~15% cost',
    });
    totalTokens += translationTokens;
  }
  
  // 5. Music
  if (config.includeMusic) {
    const musicTokens = Math.ceil(TOKEN_COSTS.musicGeneration * outputMultiplier);
    breakdown.push({
      category: 'Audio',
      subcategory: 'Background Music',
      tokens: musicTokens,
      credits: Math.ceil(musicTokens / TOKENS_PER_CREDIT),
      description: 'AI-generated background music',
      isOptional: true,
      savingsIfRemoved: musicTokens,
      optimizationTip: 'Remove music for fixed 5K token savings',
    });
    totalTokens += musicTokens;
  }
  
  // 6. Charts & Tables
  if (config.includeCharts > 0) {
    const chartTokens = config.includeCharts * TOKEN_COSTS.chartGeneration;
    breakdown.push({
      category: 'Data Visualization',
      subcategory: `${config.includeCharts} Charts`,
      tokens: chartTokens,
      credits: Math.ceil(chartTokens / TOKENS_PER_CREDIT),
      description: `${config.includeCharts} chart generations`,
      isOptional: true,
      savingsIfRemoved: chartTokens,
    });
    totalTokens += chartTokens;
  }
  
  if (config.includeTables > 0) {
    const tableTokens = config.includeTables * TOKEN_COSTS.tableGeneration;
    breakdown.push({
      category: 'Data Visualization',
      subcategory: `${config.includeTables} Tables`,
      tokens: tableTokens,
      credits: Math.ceil(tableTokens / TOKENS_PER_CREDIT),
      description: `${config.includeTables} table generations`,
      isOptional: true,
      savingsIfRemoved: tableTokens,
    });
    totalTokens += tableTokens;
  }
  
  // 7. Framework Analysis
  if (config.frameworkCount > 0) {
    const frameworkTokens = TOKEN_COSTS.frameworkAnalysis + (config.frameworkCount * config.slideCount * TOKEN_COSTS.frameworkPerSlide);
    breakdown.push({
      category: 'Framework Processing',
      subcategory: `${config.frameworkCount} Frameworks`,
      tokens: frameworkTokens,
      credits: Math.ceil(frameworkTokens / TOKENS_PER_CREDIT),
      description: `Analysis + slide integration`,
      isOptional: true,
      savingsIfRemoved: frameworkTokens,
      optimizationTip: 'Fewer frameworks = faster generation',
    });
    totalTokens += frameworkTokens;
  }
  
  // 8. Interactive Elements
  if (config.includeInteractive) {
    const interactiveTokens = config.slideCount * TOKEN_COSTS.interactiveElements;
    breakdown.push({
      category: 'Interactivity',
      subcategory: 'Interactive Elements',
      tokens: interactiveTokens,
      credits: Math.ceil(interactiveTokens / TOKENS_PER_CREDIT),
      description: 'Click/hover interactions',
      isOptional: true,
      savingsIfRemoved: interactiveTokens,
    });
    totalTokens += interactiveTokens;
  }
  
  // Calculate credits
  const totalCredits = Math.ceil(totalTokens / TOKENS_PER_CREDIT);
  
  // Determine confidence based on output type complexity
  let confidenceLevel: 'low' | 'medium' | 'high' = 'high';
  let confidencePercent = 85;
  
  if (config.outputType.includes('video')) {
    confidenceLevel = 'low';
    confidencePercent = 60;
  } else if (config.outputType.includes('3d') || config.outputType === 'interactive') {
    confidenceLevel = 'medium';
    confidencePercent = 70;
  }
  
  // Calculate range
  const varianceFactor = 1 - (confidencePercent / 100);
  const estimatedRange = {
    min: Math.ceil(totalTokens * (1 - varianceFactor)),
    max: Math.ceil(totalTokens * (1 + varianceFactor * 1.5)),
  };
  
  // Generate optimization suggestions
  const optimizationSuggestions = generateOptimizationSuggestions(config, breakdown, totalTokens);
  
  return {
    totalTokens,
    totalCredits,
    breakdown,
    confidenceLevel,
    confidencePercent,
    estimatedRange,
    optimizationSuggestions,
  };
}

/**
 * Generate actionable optimization suggestions
 */
function generateOptimizationSuggestions(
  config: EstimationConfig,
  breakdown: TokenBreakdown[],
  totalTokens: number
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];
  
  // 1. Output Type Simplification
  if (config.outputType.includes('video') || config.outputType.includes('3d')) {
    const currentMultiplier = CREDIT_MULTIPLIERS[config.outputType]?.multiplier || 1;
    const savingsPercent = Math.round((1 - (1 / currentMultiplier)) * 100);
    suggestions.push({
      id: 'simplify_output',
      title: 'Switch to 2D Static',
      description: `${config.outputType.toUpperCase()} uses ${currentMultiplier}x tokens. 2D Static is 1x.`,
      potentialSavings: Math.ceil(totalTokens * (1 - (1 / currentMultiplier))),
      savingsPercent,
      impact: 'high',
      action: 'simplify_output',
      currentValue: config.outputType,
      suggestedValue: '2d-static',
    });
  }
  
  // 2. Language Reduction
  if (config.languageCount > 3) {
    const translationItem = breakdown.find(b => b.category === 'Translation');
    if (translationItem) {
      const perLangTokens = translationItem.tokens / (config.languageCount - 1);
      const savings = perLangTokens * (config.languageCount - 3);
      suggestions.push({
        id: 'reduce_languages',
        title: 'Reduce to 3 Languages',
        description: `Currently generating ${config.languageCount} languages. Recommended: 3 max.`,
        potentialSavings: savings,
        savingsPercent: Math.round((savings / totalTokens) * 100),
        impact: 'medium',
        action: 'reduce_languages',
        currentValue: config.languageCount,
        suggestedValue: 3,
      });
    }
  }
  
  // 3. Voiceover Reduction
  if (config.includeVoiceover && config.voiceoverLanguages > 2) {
    const voiceItem = breakdown.find(b => b.category === 'Voice Generation');
    if (voiceItem) {
      const perLangTokens = voiceItem.tokens / config.voiceoverLanguages;
      const savings = perLangTokens * (config.voiceoverLanguages - 2);
      suggestions.push({
        id: 'reduce_voiceover',
        title: 'Limit Voiceover to 2 Languages',
        description: `Voiceover for ${config.voiceoverLanguages} languages is resource-intensive.`,
        potentialSavings: savings,
        savingsPercent: Math.round((savings / totalTokens) * 100),
        impact: 'medium',
        action: 'reduce_languages',
        currentValue: config.voiceoverLanguages,
        suggestedValue: 2,
      });
    }
  }
  
  // 4. Resolution Reduction
  if (config.resolution === '4k') {
    const savings = Math.ceil(totalTokens * 0.33); // 4k is 1.5x, so ~33% savings
    suggestions.push({
      id: 'lower_resolution',
      title: 'Use 1080p Instead of 4K',
      description: '4K adds 50% overhead. 1080p is sufficient for most displays.',
      potentialSavings: savings,
      savingsPercent: 33,
      impact: 'low',
      action: 'lower_resolution',
      currentValue: '4k',
      suggestedValue: '1080p',
    });
  }
  
  // 5. Remove Music
  if (config.includeMusic) {
    const musicItem = breakdown.find(b => b.subcategory === 'Background Music');
    if (musicItem) {
      suggestions.push({
        id: 'remove_music',
        title: 'Remove Background Music',
        description: 'Music generation is optional and adds fixed cost.',
        potentialSavings: musicItem.tokens,
        savingsPercent: Math.round((musicItem.tokens / totalTokens) * 100),
        impact: 'low',
        action: 'remove_music',
        currentValue: 'enabled',
        suggestedValue: 'disabled',
      });
    }
  }
  
  // 6. Slide Count
  if (config.slideCount > 15) {
    const perSlideTokens = totalTokens / config.slideCount;
    const targetSlides = 12;
    const savings = perSlideTokens * (config.slideCount - targetSlides);
    suggestions.push({
      id: 'reduce_slides',
      title: 'Reduce to 12 Slides',
      description: `${config.slideCount} slides is high. 10-12 is optimal for engagement.`,
      potentialSavings: savings,
      savingsPercent: Math.round((savings / totalTokens) * 100),
      impact: 'medium',
      action: 'reduce_slides',
      currentValue: config.slideCount,
      suggestedValue: 12,
    });
  }
  
  // 7. Framework Reduction
  if (config.frameworkCount > 3) {
    const frameworkItem = breakdown.find(b => b.category === 'Framework Processing');
    if (frameworkItem) {
      const perFrameworkTokens = frameworkItem.tokens / config.frameworkCount;
      const savings = perFrameworkTokens * (config.frameworkCount - 2);
      suggestions.push({
        id: 'reduce_frameworks',
        title: 'Use 2 Frameworks Instead',
        description: `${config.frameworkCount} frameworks adds complexity. 2 is recommended.`,
        potentialSavings: savings,
        savingsPercent: Math.round((savings / totalTokens) * 100),
        impact: 'low',
        action: 'reduce_frameworks',
        currentValue: config.frameworkCount,
        suggestedValue: 2,
      });
    }
  }
  
  // 8. Budget Models Suggestion
  const textTier = getModelTierInfo(config.textModel);
  const imageTier = getModelTierInfo(config.imageModel);
  const avgCostMultiplier = (textTier.costMultiplier + imageTier.costMultiplier) / 2;
  
  if (avgCostMultiplier > 1.5) {
    const savings = Math.ceil(totalTokens * 0.3);
    suggestions.push({
      id: 'use_budget_models',
      title: 'Switch to Budget-Tier Models',
      description: `Current models are ${avgCostMultiplier.toFixed(1)}x cost. Tier 3 models offer similar quality at lower cost.`,
      potentialSavings: savings,
      savingsPercent: 30,
      impact: 'medium',
      action: 'use_budget_models',
      currentValue: `${avgCostMultiplier.toFixed(1)}x avg`,
      suggestedValue: '0.5x avg',
    });
  }
  
  // Sort by savings potential
  return suggestions.sort((a, b) => b.potentialSavings - a.potentialSavings);
}

/**
 * Format token count for display
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Get color class based on usage percentage
 */
export function getUsageColor(usagePercent: number): string {
  if (usagePercent >= 90) return 'text-destructive';
  if (usagePercent >= 70) return 'text-warning';
  if (usagePercent >= 50) return 'text-amber-500';
  return 'text-success';
}

export default {
  estimateTokens,
  formatTokens,
  getUsageColor,
  TOKEN_COSTS,
  TOKENS_PER_CREDIT,
};
