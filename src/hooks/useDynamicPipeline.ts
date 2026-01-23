/**
 * useDynamicPipeline Hook
 * 
 * Provides dynamic pipeline selection from PIPELINE_CAPABILITY_MATRIX
 * Replaces hardcoded pipeline routing with intelligent context-based selection
 */

import { useMemo, useState, useCallback } from 'react';
import { 
  PIPELINE_CAPABILITY_MATRIX,
  type PipelineCapabilityEntry,
  type PipelineCategory,
  type ProductVertical,
  type PricingTier,
} from '@/components/ai-hub/provider-matrix/pipelineCapabilityMatrix';
import { useRegionalLanguage } from '@/hooks/useRegionalLanguage';

// Input source to pipeline category mapping
const INPUT_TO_CATEGORY_MAP: Record<string, PipelineCategory[]> = {
  'prompt': ['presentation', 'video_production', 'content_repurposing', 'marketing_advertising'],
  'text': ['presentation', 'video_production', 'content_repurposing'],
  'document': ['presentation', 'content_repurposing', 'training_ld'],
  'image': ['video_production', 'content_repurposing', 'marketing_advertising', 'social_media'],
  'url': ['presentation', 'content_repurposing', 'social_media'],
  'figma': ['presentation', 'video_production'],
  'miro': ['presentation', 'video_production'],
  'canva': ['presentation', 'content_repurposing'],
  'video': ['video_production', 'content_repurposing', 'localization'],
  'audio': ['content_repurposing', 'localization', 'audio_sfx'],
  'data': ['presentation', 'data_analytics'],
};

// Output type to vertical mapping
const OUTPUT_TO_VERTICAL_MAP: Record<string, ProductVertical[]> = {
  'presentation': ['presentations', 'enterprise', 'sales_enablement'],
  'video': ['generative_video', 'video_repurposing', 'marketing_ads'],
  'pdf': ['presentations', 'enterprise', 'customer_education'],
  'scorm': ['ld_training', 'customer_education'],
  'social': ['social_publishing', 'marketing_ads'],
  'audio': ['ld_training', 'customer_education'],
  'animation': ['generative_video', 'marketing_ads'],
  'vr': ['immersive_3d'],
  'ar': ['immersive_3d'],
  '3d': ['immersive_3d'],
  'podcast': ['ld_training', 'customer_education'],
  'webinar': ['ld_training', 'internal_comms'],
  'storyboard': ['generative_video', 'marketing_ads'],
};

// Tier to pricing tier mapping
const TIER_MAP: Record<string, PricingTier> = {
  'standard': 'starter',
  'advanced': 'pro',
  'premium': 'enterprise',
  'beta': 'enterprise', // Dev mode gets full access
};

export interface PipelineContext {
  inputSource?: string;
  outputType?: string;
  category?: PipelineCategory;
  vertical?: ProductVertical;
  searchTerm?: string;
}

export interface PipelineSelection {
  pipeline: PipelineCapabilityEntry;
  matchScore: number;
  matchReasons: string[];
  isRecommended: boolean;
  tierCompatible: boolean;
}

export interface UseDynamicPipelineReturn {
  // All available pipelines
  allPipelines: PipelineCapabilityEntry[];
  
  // Filtered pipelines based on context
  filteredPipelines: PipelineSelection[];
  
  // Currently selected pipeline
  selectedPipeline: PipelineCapabilityEntry | null;
  
  // Recommended pipeline for current context
  recommendedPipeline: PipelineCapabilityEntry | null;
  
  // Actions
  selectPipeline: (pipelineId: string) => void;
  clearSelection: () => void;
  
  // Filter actions
  setContext: (context: PipelineContext) => void;
  resetContext: () => void;
  
  // Categories for filtering
  categories: PipelineCategory[];
  
  // Loading state
  isLoading: boolean;
}

/**
 * Calculate match score for a pipeline based on context
 */
function calculateMatchScore(
  pipeline: PipelineCapabilityEntry,
  context: PipelineContext,
  userTier: PricingTier
): { score: number; reasons: string[]; tierCompatible: boolean } {
  let score = 0;
  const reasons: string[] = [];
  
  // Check tier compatibility
  const tierOrder: PricingTier[] = ['free', 'starter', 'pro', 'enterprise'];
  const userTierIndex = tierOrder.indexOf(userTier);
  const pipelineTierIndex = tierOrder.indexOf(pipeline.minimumTier);
  const tierCompatible = userTierIndex >= pipelineTierIndex;
  
  if (tierCompatible) {
    score += 20;
    reasons.push('Tier compatible');
  }
  
  // Match input source to category
  if (context.inputSource) {
    const matchingCategories = INPUT_TO_CATEGORY_MAP[context.inputSource] || [];
    if (matchingCategories.includes(pipeline.category)) {
      score += 30;
      reasons.push(`Matches ${context.inputSource} input`);
    }
  }
  
  // Match output type to vertical
  if (context.outputType) {
    const matchingVerticals = OUTPUT_TO_VERTICAL_MAP[context.outputType] || [];
    const pipelineVerticals = Object.keys(pipeline.verticalSupport) as ProductVertical[];
    const hasMatch = matchingVerticals.some(v => 
      pipelineVerticals.includes(v) && 
      pipeline.verticalSupport[v] === 'full'
    );
    if (hasMatch) {
      score += 30;
      reasons.push(`Optimized for ${context.outputType} output`);
    }
  }
  
  // Direct category match
  if (context.category && pipeline.category === context.category) {
    score += 25;
    reasons.push('Category match');
  }
  
  // Direct vertical match
  if (context.vertical && pipeline.verticalSupport[context.vertical] === 'full') {
    score += 25;
    reasons.push(`Full ${context.vertical} support`);
  }
  
  // Search term match
  if (context.searchTerm) {
    const search = context.searchTerm.toLowerCase();
    if (pipeline.displayName.toLowerCase().includes(search)) {
      score += 15;
      reasons.push('Name match');
    }
    if (pipeline.description.toLowerCase().includes(search)) {
      score += 10;
      reasons.push('Description match');
    }
  }
  
  // Quality and automation bonus
  if (pipeline.qualityScore >= 85) {
    score += 5;
    reasons.push('High quality');
  }
  if (pipeline.automationLevel >= 80) {
    score += 5;
    reasons.push('Highly automated');
  }
  
  return { score, reasons, tierCompatible };
}

/**
 * Get unique categories from pipelines
 */
function getUniqueCategories(pipelines: PipelineCapabilityEntry[]): PipelineCategory[] {
  const categories = new Set<PipelineCategory>();
  pipelines.forEach(p => categories.add(p.category));
  return Array.from(categories);
}

/**
 * Dynamic Pipeline Selection Hook
 */
export function useDynamicPipeline(initialContext?: PipelineContext): UseDynamicPipelineReturn {
  const [context, setContextState] = useState<PipelineContext>(initialContext || {});
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const { globalTier } = useRegionalLanguage();
  
  // Map global tier to pricing tier
  const userTier: PricingTier = useMemo(() => {
    return TIER_MAP[globalTier] || 'starter';
  }, [globalTier]);
  
  // Get all pipelines
  const allPipelines = useMemo(() => PIPELINE_CAPABILITY_MATRIX, []);
  
  // Get unique categories
  const categories = useMemo(() => getUniqueCategories(allPipelines), [allPipelines]);
  
  // Filter and score pipelines based on context
  const filteredPipelines = useMemo((): PipelineSelection[] => {
    const hasContext = Object.values(context).some(v => v !== undefined && v !== '');
    
    const scored = allPipelines.map(pipeline => {
      const { score, reasons, tierCompatible } = calculateMatchScore(pipeline, context, userTier);
      return {
        pipeline,
        matchScore: score,
        matchReasons: reasons,
        isRecommended: false,
        tierCompatible,
      };
    });
    
    // Sort by score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);
    
    // Mark top recommendation
    if (scored.length > 0 && scored[0].matchScore > 30) {
      scored[0].isRecommended = true;
    }
    
    // If no context, return all; otherwise filter to those with some match
    if (!hasContext) {
      return scored;
    }
    
    return scored.filter(s => s.matchScore > 0);
  }, [allPipelines, context, userTier]);
  
  // Get selected pipeline
  const selectedPipeline = useMemo(() => {
    if (!selectedPipelineId) return null;
    return allPipelines.find(p => p.pipelineId === selectedPipelineId) || null;
  }, [allPipelines, selectedPipelineId]);
  
  // Get recommended pipeline
  const recommendedPipeline = useMemo(() => {
    const recommended = filteredPipelines.find(p => p.isRecommended);
    return recommended?.pipeline || null;
  }, [filteredPipelines]);
  
  // Actions
  const selectPipeline = useCallback((pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectedPipelineId(null);
  }, []);
  
  const setContext = useCallback((newContext: PipelineContext) => {
    setContextState(prev => ({ ...prev, ...newContext }));
  }, []);
  
  const resetContext = useCallback(() => {
    setContextState({});
  }, []);
  
  return {
    allPipelines,
    filteredPipelines,
    selectedPipeline,
    recommendedPipeline,
    selectPipeline,
    clearSelection,
    setContext,
    resetContext,
    categories,
    isLoading: false,
  };
}

/**
 * Get pipeline by ID
 */
export function getPipelineById(pipelineId: string): PipelineCapabilityEntry | undefined {
  return PIPELINE_CAPABILITY_MATRIX.find(p => p.pipelineId === pipelineId);
}

/**
 * Get pipelines by category
 */
export function getPipelinesByCategory(category: PipelineCategory): PipelineCapabilityEntry[] {
  return PIPELINE_CAPABILITY_MATRIX.filter(p => p.category === category);
}

/**
 * Get pipelines compatible with input source
 */
export function getPipelinesForInput(inputSource: string): PipelineCapabilityEntry[] {
  const categories = INPUT_TO_CATEGORY_MAP[inputSource] || [];
  return PIPELINE_CAPABILITY_MATRIX.filter(p => categories.includes(p.category));
}

/**
 * Get pipelines compatible with output type
 */
export function getPipelinesForOutput(outputType: string): PipelineCapabilityEntry[] {
  const verticals = OUTPUT_TO_VERTICAL_MAP[outputType] || [];
  return PIPELINE_CAPABILITY_MATRIX.filter(p => 
    verticals.some(v => p.verticalSupport[v] === 'full' || p.verticalSupport[v] === 'partial')
  );
}
