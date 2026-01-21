/**
 * Visual-Output Compatibility Matrix Service
 * Many-to-Many relationship with bidirectional guardrails
 * 
 * Architecture:
 * - Output Types ↔ Visual Features: Many-to-Many
 * - Guardrails: Warnings for incompatible combos (not restrictions)
 * - Recommendations: AI suggests optimal combos based on context
 */

import { ExpandedOutputType, EXPANDED_OUTPUT_CONFIGS, getOutputById } from '../constants/expandedOutputTypes';
import { ExpandedVisualFeature, EXPANDED_VISUAL_FEATURES, getVisualFeatureById } from '../constants/expandedVisualFeatures';

// ==========================================
// TYPES
// ==========================================

export type CompatibilityLevel = 'optimal' | 'compatible' | 'warning' | 'incompatible';

export interface CompatibilityResult {
  level: CompatibilityLevel;
  score: number; // 0-100
  reason?: string;
  suggestion?: string;
}

export interface VisualFeatureCompatibility {
  featureId: string;
  featureName: string;
  compatibility: CompatibilityLevel;
  score: number;
  reason?: string;
  suggestion?: string;
  isRecommended?: boolean;
  requiredTier?: 1 | 2 | 3;
}

export interface OutputTypeCompatibility {
  outputId: ExpandedOutputType;
  outputName: string;
  compatibility: CompatibilityLevel;
  score: number;
  reason?: string;
  suggestion?: string;
  isRecommended?: boolean;
}

export interface CompatibilityMatrix {
  [outputId: string]: {
    [visualFeatureId: string]: CompatibilityResult;
  };
}

// ==========================================
// COMPATIBILITY RULES (Many-to-Many Mappings)
// ==========================================

/**
 * Define which visual features are OPTIMAL for each output type
 * (suggestions, not restrictions)
 */
const OPTIMAL_FEATURES_BY_OUTPUT: Record<string, string[]> = {
  // Tier 1 - Standard
  'pdf-export': ['infographics', 'charts', 'data-tables', 'diagrams', 'timelines', 'quote-blocks', 'icon-sets', 'images', 'grids', 'sections'],
  'pptx-export': ['infographics', 'charts', 'data-tables', 'diagrams', 'timelines', 'journey-maps', 'quote-blocks', 'icon-sets', 'images', 'grids', 'sections'],
  '2d-static': ['infographics', 'charts', 'diagrams', 'images', 'icon-sets', 'quote-blocks', 'grids', 'sections'],
  'print-ready': ['infographics', 'charts', 'data-tables', 'diagrams', 'images', 'icon-sets', 'grids'],
  
  // Tier 2 - Advanced
  '2d-animated': ['infographics', 'charts', 'diagrams', 'images', 'animations', 'icon-sets', 'clickable', 'grids'],
  'video-short': ['infographics', 'charts', 'images', 'video-clips', 'audio', 'animations'],
  '3d-static': ['3d-objects', '3d-scenes', 'images', 'infographics'],
  'web-embed': ['charts', 'infographics', 'clickable', 'forms', 'quizzes', 'data-filters', 'grids', 'sections'],
  'social-media': ['infographics', 'images', 'video-clips', 'animations', 'quote-blocks'],
  
  // Tier 3 - Premium
  'video-full': ['infographics', 'charts', 'images', 'video-clips', 'audio', 'animations', '3d-animations'],
  '3d-animated': ['3d-objects', '3d-scenes', '3d-animations', 'animations', 'audio'],
  'interactive': ['clickable', 'forms', 'quizzes', 'data-filters', 'realtime', 'charts', 'animations'],
  'vr-experience': ['3d-objects', '3d-scenes', '3d-animations', 'ar-elements', 'audio'],
  'ar-overlay': ['3d-objects', 'ar-elements', 'animations', 'clickable'],
  'mixed-reality': ['3d-objects', '3d-scenes', '3d-animations', 'ar-elements', 'video-clips', 'audio', 'animations', 'clickable', 'realtime'],
};

/**
 * Define which visual features have WARNINGS for each output type
 * (user can still select, but gets a warning)
 */
const WARNING_FEATURES_BY_OUTPUT: Record<string, { features: string[]; reason: string; suggestion: string }[]> = {
  // Video outputs - data tables don't translate well
  'video-short': [
    { 
      features: ['data-tables'], 
      reason: 'Complex data tables are difficult to read in short videos',
      suggestion: 'Consider using animated charts or simplified statistics instead'
    },
    {
      features: ['forms', 'quizzes'],
      reason: 'Interactive forms cannot be used in video format',
      suggestion: 'Use visual CTAs or QR codes linking to interactive content'
    }
  ],
  'video-full': [
    { 
      features: ['data-tables', 'data-filters'], 
      reason: 'Static data tables disrupt video flow',
      suggestion: 'Use animated data visualizations or narrated highlights'
    },
    {
      features: ['forms', 'quizzes', 'realtime'],
      reason: 'Interactive elements cannot function in video',
      suggestion: 'Include call-to-action overlays linking to interactive versions'
    }
  ],
  
  // VR/AR - 2D elements need adaptation
  'vr-experience': [
    {
      features: ['data-tables', 'grids', 'sections'],
      reason: 'Flat 2D layouts require spatial adaptation for VR',
      suggestion: 'Consider 3D data visualizations or spatial UI elements'
    }
  ],
  'ar-overlay': [
    {
      features: ['data-tables', 'grids'],
      reason: 'Complex grids may obscure real-world view',
      suggestion: 'Use floating cards or spatial anchored elements'
    }
  ],
  
  // Static outputs - no interactivity
  'pdf-export': [
    {
      features: ['clickable', 'forms', 'quizzes', 'data-filters', 'realtime', 'animations', 'video-clips', '3d-animations'],
      reason: 'PDF format does not support interactive/animated elements',
      suggestion: 'Use static versions or add QR codes linking to interactive content'
    }
  ],
  '2d-static': [
    {
      features: ['clickable', 'forms', 'quizzes', 'data-filters', 'realtime', 'animations', 'video-clips', 'audio', '3d-animations', '3d-objects', '3d-scenes'],
      reason: 'Static images do not support interactive or 3D elements',
      suggestion: 'Choose animated or interactive output type for these features'
    }
  ],
  'print-ready': [
    {
      features: ['clickable', 'forms', 'quizzes', 'data-filters', 'realtime', 'animations', 'video-clips', 'audio', '3d-animations', '3d-objects', '3d-scenes', 'ar-elements'],
      reason: 'Print format cannot include dynamic content',
      suggestion: 'Include QR codes linking to digital interactive versions'
    }
  ],
};

/**
 * Define which visual features are INCOMPATIBLE (technical limitation)
 * These will show strong warnings but still allow selection
 */
const INCOMPATIBLE_FEATURES_BY_OUTPUT: Record<string, { features: string[]; reason: string }[]> = {
  'pdf-export': [
    {
      features: ['video-clips', 'audio', '3d-scenes', '3d-animations', 'ar-elements', 'realtime'],
      reason: 'Technical limitation: PDF cannot embed these media types'
    }
  ],
  'print-ready': [
    {
      features: ['video-clips', 'audio', '3d-scenes', '3d-animations', 'ar-elements', 'realtime'],
      reason: 'Technical limitation: Print cannot display dynamic content'
    }
  ]
};

// ==========================================
// CORE FUNCTIONS
// ==========================================

/**
 * Get compatibility result for a specific output-visual pair
 */
export function getCompatibility(
  outputId: ExpandedOutputType,
  visualFeatureId: string
): CompatibilityResult {
  // Check incompatible first
  const incompatibleRules = INCOMPATIBLE_FEATURES_BY_OUTPUT[outputId] || [];
  for (const rule of incompatibleRules) {
    if (rule.features.includes(visualFeatureId)) {
      return {
        level: 'incompatible',
        score: 10,
        reason: rule.reason,
        suggestion: 'This combination has technical limitations. The feature will be adapted or omitted.'
      };
    }
  }
  
  // Check warnings
  const warningRules = WARNING_FEATURES_BY_OUTPUT[outputId] || [];
  for (const rule of warningRules) {
    if (rule.features.includes(visualFeatureId)) {
      return {
        level: 'warning',
        score: 50,
        reason: rule.reason,
        suggestion: rule.suggestion
      };
    }
  }
  
  // Check optimal
  const optimalFeatures = OPTIMAL_FEATURES_BY_OUTPUT[outputId] || [];
  if (optimalFeatures.includes(visualFeatureId)) {
    return {
      level: 'optimal',
      score: 100,
      reason: 'Highly recommended for this output type'
    };
  }
  
  // Default: compatible but not specifically optimized
  return {
    level: 'compatible',
    score: 75,
    reason: 'Compatible with this output type'
  };
}

/**
 * Get all visual features with compatibility info for a given output type
 */
export function getVisualFeaturesForOutput(
  outputId: ExpandedOutputType,
  globalTier: 1 | 2 | 3 = 3
): VisualFeatureCompatibility[] {
  const output = getOutputById(outputId);
  if (!output) return [];
  
  return EXPANDED_VISUAL_FEATURES
    .filter(feature => feature.tier <= globalTier)
    .map(feature => {
      const compat = getCompatibility(outputId, feature.id);
      const isRecommended = (OPTIMAL_FEATURES_BY_OUTPUT[outputId] || []).includes(feature.id);
      
      return {
        featureId: feature.id,
        featureName: feature.name,
        compatibility: compat.level,
        score: compat.score,
        reason: compat.reason,
        suggestion: compat.suggestion,
        isRecommended,
        requiredTier: feature.tier
      };
    })
    .sort((a, b) => {
      // Sort by: recommended first, then by score, then alphabetically
      if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
      if (a.score !== b.score) return b.score - a.score;
      return a.featureName.localeCompare(b.featureName);
    });
}

/**
 * Get all output types with compatibility info for a given visual feature
 */
export function getOutputsForVisualFeature(
  visualFeatureId: string,
  globalTier: 1 | 2 | 3 = 3
): OutputTypeCompatibility[] {
  const feature = getVisualFeatureById(visualFeatureId);
  if (!feature) return [];
  
  return EXPANDED_OUTPUT_CONFIGS
    .filter(output => output.tier <= globalTier)
    .map(output => {
      const compat = getCompatibility(output.id, visualFeatureId);
      const isRecommended = (OPTIMAL_FEATURES_BY_OUTPUT[output.id] || []).includes(visualFeatureId);
      
      return {
        outputId: output.id,
        outputName: output.name,
        compatibility: compat.level,
        score: compat.score,
        reason: compat.reason,
        suggestion: compat.suggestion,
        isRecommended
      };
    })
    .sort((a, b) => {
      if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
      if (a.score !== b.score) return b.score - a.score;
      return a.outputName.localeCompare(b.outputName);
    });
}

/**
 * Validate a complete selection of output + visual features
 * Returns aggregated compatibility analysis
 */
export function validateSelection(
  outputIds: ExpandedOutputType[],
  visualFeatureIds: string[]
): {
  overallScore: number;
  overallLevel: CompatibilityLevel;
  issues: {
    outputId: ExpandedOutputType;
    featureId: string;
    level: CompatibilityLevel;
    reason: string;
    suggestion?: string;
  }[];
  recommendations: string[];
} {
  const issues: {
    outputId: ExpandedOutputType;
    featureId: string;
    level: CompatibilityLevel;
    reason: string;
    suggestion?: string;
  }[] = [];
  
  let totalScore = 0;
  let count = 0;
  
  for (const outputId of outputIds) {
    for (const featureId of visualFeatureIds) {
      const compat = getCompatibility(outputId, featureId);
      totalScore += compat.score;
      count++;
      
      if (compat.level === 'warning' || compat.level === 'incompatible') {
        issues.push({
          outputId,
          featureId,
          level: compat.level,
          reason: compat.reason || 'Potential compatibility issue',
          suggestion: compat.suggestion
        });
      }
    }
  }
  
  const overallScore = count > 0 ? Math.round(totalScore / count) : 100;
  
  let overallLevel: CompatibilityLevel = 'optimal';
  if (issues.some(i => i.level === 'incompatible')) {
    overallLevel = 'incompatible';
  } else if (issues.some(i => i.level === 'warning')) {
    overallLevel = 'warning';
  } else if (overallScore < 80) {
    overallLevel = 'compatible';
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (issues.length > 0) {
    const warningCount = issues.filter(i => i.level === 'warning').length;
    const incompatibleCount = issues.filter(i => i.level === 'incompatible').length;
    
    if (incompatibleCount > 0) {
      recommendations.push(`${incompatibleCount} feature(s) have technical limitations with selected output(s). They will be adapted automatically.`);
    }
    
    if (warningCount > 0) {
      recommendations.push(`${warningCount} feature(s) may not display optimally. Consider the suggestions provided.`);
    }
  }
  
  // Suggest optimal combinations
  for (const outputId of outputIds) {
    const optimalFeatures = OPTIMAL_FEATURES_BY_OUTPUT[outputId] || [];
    const selectedOptimal = visualFeatureIds.filter(f => optimalFeatures.includes(f));
    
    if (selectedOptimal.length === 0 && optimalFeatures.length > 0) {
      const output = getOutputById(outputId);
      recommendations.push(`Consider adding ${optimalFeatures.slice(0, 3).join(', ')} for optimal ${output?.name || outputId} results.`);
    }
  }
  
  return {
    overallScore,
    overallLevel,
    issues,
    recommendations
  };
}

/**
 * Get AI-recommended visual features based on output selection
 */
export function getRecommendedFeaturesForOutputs(
  outputIds: ExpandedOutputType[],
  globalTier: 1 | 2 | 3 = 3
): VisualFeatureCompatibility[] {
  const recommendedSet = new Set<string>();
  
  for (const outputId of outputIds) {
    const optimalFeatures = OPTIMAL_FEATURES_BY_OUTPUT[outputId] || [];
    optimalFeatures.forEach(f => recommendedSet.add(f));
  }
  
  return Array.from(recommendedSet)
    .map(featureId => {
      const feature = getVisualFeatureById(featureId);
      if (!feature || feature.tier > globalTier) return null;
      
      // Calculate average compatibility across selected outputs
      let totalScore = 0;
      for (const outputId of outputIds) {
        const compat = getCompatibility(outputId, featureId);
        totalScore += compat.score;
      }
      const avgScore = Math.round(totalScore / outputIds.length);
      
      return {
        featureId,
        featureName: feature.name,
        compatibility: avgScore >= 90 ? 'optimal' : avgScore >= 70 ? 'compatible' : 'warning' as CompatibilityLevel,
        score: avgScore,
        isRecommended: true,
        requiredTier: feature.tier
      } as VisualFeatureCompatibility;
    })
    .filter((f): f is VisualFeatureCompatibility => f !== null)
    .sort((a, b) => b.score - a.score);
}

// ==========================================
// EXPORTS FOR UI COMPONENTS
// ==========================================

export const CompatibilityLevelColors: Record<CompatibilityLevel, string> = {
  optimal: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  compatible: 'text-blue-600 bg-blue-50 border-blue-200',
  warning: 'text-amber-600 bg-amber-50 border-amber-200',
  incompatible: 'text-red-600 bg-red-50 border-red-200'
};

export const CompatibilityLevelIcons: Record<CompatibilityLevel, string> = {
  optimal: 'CheckCircle2',
  compatible: 'Check',
  warning: 'AlertTriangle',
  incompatible: 'XCircle'
};

export const CompatibilityLevelLabels: Record<CompatibilityLevel, string> = {
  optimal: 'Optimal',
  compatible: 'Compatible',
  warning: 'Limited',
  incompatible: 'Not Supported'
};
