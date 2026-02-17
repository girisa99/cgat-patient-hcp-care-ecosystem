/**
 * Visualization Recommendation Service
 * 
 * Provides context-aware visualization SUGGESTIONS based on:
 * - Selected frameworks
 * - Industry context
 * - Content types
 * - Output format
 * 
 * KEY PRINCIPLE: Industry/Framework SUGGESTS but NEVER RESTRICTS options.
 * All visualization types remain available regardless of context.
 */

import { 
  EXPANDED_VISUAL_FEATURES, 
  ExpandedVisualFeature, 
  VisualFeatureSubOption 
} from '../constants/expandedVisualFeatures';
import { 
  EXPANDED_FRAMEWORK_CATEGORIES, 
  Framework 
} from '../constants/expandedFrameworks';

// ==========================================
// TYPES
// ==========================================

export interface VisualizationSuggestion {
  featureId: string;
  featureName: string;
  suggestedSubOptions: string[];
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  source: 'framework' | 'industry' | 'content-type' | 'output-format';
}

export interface VisualizationRecommendation {
  // AI suggestions (non-binding)
  suggestions: VisualizationSuggestion[];
  
  // Reasoning for the recommendations
  overallReasoning: string;
  
  // ALL available features (never filtered by industry/framework)
  availableFeatures: ExpandedVisualFeature[];
  
  // Tier-filtered features (only restriction)
  tierFilteredFeatures: ExpandedVisualFeature[];
  
  // Framework-specific mappings (for reference)
  frameworkVisualMap: Record<string, string[]>;
}

export interface VisualizationContext {
  industry: string;
  segment?: string;
  contentTypes: string[];
  selectedFrameworks: string[];
  outputType: string;
  globalTier: 1 | 2 | 3;
  userPrompt?: string;
}

// ==========================================
// FRAMEWORK → VISUALIZATION MAPPING
// Non-restrictive suggestions based on framework methodology
// ==========================================

const FRAMEWORK_VISUALIZATION_MAP: Record<string, { visuals: string[], reasoning: string }> = {
  // Strategy Frameworks
  'swot': { 
    visuals: ['charts', 'data-tables', 'diagrams'], 
    reasoning: 'SWOT naturally fits 2x2 quadrant layouts'
  },
  'porter-five': { 
    visuals: ['charts', 'diagrams', 'infographics'], 
    reasoning: 'Five Forces maps well to radar/pentagon visualizations'
  },
  'pestle': { 
    visuals: ['charts', 'data-tables', 'diagrams'], 
    reasoning: 'PESTLE categories suit segmented charts'
  },
  'value-chain': { 
    visuals: ['diagrams', 'journey-maps', 'infographics'], 
    reasoning: 'Value chain is inherently process-oriented'
  },
  'ansoff': { 
    visuals: ['charts', 'diagrams', 'data-tables'], 
    reasoning: 'Growth matrix needs 2x2 quadrant display'
  },
  'blue-ocean': { 
    visuals: ['charts', 'diagrams', 'infographics'], 
    reasoning: 'Strategy canvas requires comparison charts'
  },
  'balanced-scorecard': { 
    visuals: ['charts', 'infographics', 'data-tables'], 
    reasoning: 'KPI-focused needs dashboard-style visualization'
  },
  
  // Growth/Portfolio Frameworks
  'growth-share-matrix': { 
    visuals: ['charts', 'diagrams', 'infographics'], 
    reasoning: 'Portfolio matrix needs bubble/quadrant charts'
  },
  'three-horizons': { 
    visuals: ['timelines', 'charts', 'diagrams'], 
    reasoning: 'Growth horizons suit timeline visualizations'
  },
  'experience-curve': { 
    visuals: ['charts', 'infographics', 'data-tables'], 
    reasoning: 'Experience curves need line/area charts'
  },
  
  // Operations Frameworks
  'nps': { 
    visuals: ['charts', 'infographics', 'data-tables'], 
    reasoning: 'NPS scores suit gauge/bar charts'
  },
  'okr-framework': { 
    visuals: ['data-tables', 'charts', 'infographics'], 
    reasoning: 'OKRs need progress tracking visuals'
  },
  'raci-matrix': { 
    visuals: ['data-tables', 'diagrams', 'charts'], 
    reasoning: 'RACI is inherently table-based'
  },
  'lean-six-sigma': { 
    visuals: ['diagrams', 'charts', 'infographics'], 
    reasoning: 'Process improvement needs flow diagrams'
  },
  
  // Journey/Experience Frameworks
  'customer-journey': { 
    visuals: ['journey-maps', 'timelines', 'diagrams'], 
    reasoning: 'Journey frameworks need journey map visuals'
  },
  'design-thinking': { 
    visuals: ['diagrams', 'infographics', 'journey-maps'], 
    reasoning: 'Design thinking is process-centric'
  },
  
  // Business Model Frameworks
  'business-model-canvas': { 
    visuals: ['diagrams', 'data-tables', 'infographics'], 
    reasoning: 'Canvas needs 9-block grid layout'
  },
  'lean-canvas': { 
    visuals: ['diagrams', 'data-tables', 'infographics'], 
    reasoning: 'Lean canvas needs structured grid'
  },
  
  // Default fallback
  '_default': { 
    visuals: ['infographics', 'charts', 'diagrams'], 
    reasoning: 'General-purpose visualization mix'
  }
};

// ==========================================
// INDUSTRY → VISUALIZATION SUGGESTIONS
// Suggestions based on industry conventions (NOT restrictions)
// ==========================================

const INDUSTRY_VISUALIZATION_SUGGESTIONS: Record<string, { visuals: string[], subOptions: Record<string, string[]> }> = {
  'finance': {
    visuals: ['charts', 'data-tables', 'infographics'],
    subOptions: {
      'charts': ['waterfall', 'candlestick', 'line-chart', 'bar-chart'],
      'data-tables': ['comparison-table', 'data-grid', 'pricing-table'],
      'infographics': ['statistics', 'comparison', 'funnel']
    }
  },
  'healthcare': {
    visuals: ['timelines', 'diagrams', 'infographics', 'journey-maps'],
    subOptions: {
      'timelines': ['milestone-timeline', 'horizontal', 'gantt'],
      'diagrams': ['flowchart', 'hierarchy', 'network-diagram'],
      'journey-maps': ['customer-journey', 'service-blueprint'],
      'infographics': ['statistics', 'process-flow', 'icon-grid']
    }
  },
  'pharma': {
    visuals: ['charts', 'timelines', 'diagrams', 'data-tables'],
    subOptions: {
      'charts': ['line-chart', 'bar-chart', 'scatter-plot', 'area-chart'],
      'timelines': ['milestone-timeline', 'gantt', 'horizontal'],
      'data-tables': ['data-grid', 'comparison-table', 'feature-matrix']
    }
  },
  'consulting': {
    visuals: ['diagrams', 'charts', 'infographics', 'data-tables'],
    subOptions: {
      'diagrams': ['flowchart', 'mind-map', 'hierarchy', 'venn'],
      'charts': ['bar-chart', 'radar-chart', 'pie-chart'],
      'infographics': ['comparison', 'process-flow', 'icon-grid']
    }
  },
  'technology': {
    visuals: ['diagrams', 'charts', 'infographics', 'timelines'],
    subOptions: {
      'diagrams': ['architecture', 'flowchart', 'network-diagram', 'uml'],
      'charts': ['bar-chart', 'line-chart', 'pie-chart'],
      'timelines': ['roadmap', 'gantt', 'milestone-timeline']
    }
  },
  'marketing': {
    visuals: ['infographics', 'journey-maps', 'charts', 'diagrams'],
    subOptions: {
      'infographics': ['funnel', 'comparison', 'statistics', 'icon-grid'],
      'journey-maps': ['customer-journey', 'user-flow'],
      'charts': ['bar-chart', 'pie-chart', 'donut-chart']
    }
  },
  'education': {
    visuals: ['diagrams', 'infographics', 'timelines', 'icon-sets'],
    subOptions: {
      'diagrams': ['flowchart', 'mind-map', 'hierarchy'],
      'infographics': ['process-flow', 'icon-grid', 'comparison'],
      'icon-sets': ['step-icons', 'feature-icons', 'category-icons']
    }
  },
  'startup': {
    visuals: ['charts', 'infographics', 'timelines', 'diagrams'],
    subOptions: {
      'charts': ['line-chart', 'bar-chart', 'area-chart'],
      'infographics': ['statistics', 'funnel', 'comparison'],
      'timelines': ['milestone-timeline', 'roadmap']
    }
  },
  'manufacturing': {
    visuals: ['diagrams', 'charts', 'timelines', 'data-tables'],
    subOptions: {
      'diagrams': ['flowchart', 'network-diagram', 'hierarchy'],
      'charts': ['bar-chart', 'line-chart', 'waterfall'],
      'timelines': ['gantt', 'swimlane', 'milestone-timeline']
    }
  },
  'travel': {
    visuals: ['images', 'journey-maps', 'infographics', 'timelines'],
    subOptions: {
      'images': ['hero-image', 'lifestyle', 'background'],
      'journey-maps': ['customer-journey', 'experience-map'],
      'infographics': ['icon-grid', 'comparison', 'statistics']
    }
  },
  // Default for any industry not explicitly mapped
  '_default': {
    visuals: ['infographics', 'charts', 'diagrams', 'data-tables'],
    subOptions: {
      'infographics': ['comparison', 'process-flow', 'statistics'],
      'charts': ['bar-chart', 'pie-chart', 'line-chart'],
      'diagrams': ['flowchart', 'hierarchy', 'mind-map']
    }
  }
};

// ==========================================
// CONTENT TYPE → VISUALIZATION SUGGESTIONS
// ==========================================

const CONTENT_TYPE_VISUALIZATION_MAP: Record<string, string[]> = {
  'strategic': ['diagrams', 'charts', 'infographics'],
  'marketing': ['infographics', 'journey-maps', 'charts'],
  'research': ['charts', 'data-tables', 'diagrams'],
  'training': ['diagrams', 'infographics', 'timelines', 'quizzes'],
  'storytelling': ['images', 'timelines', 'quote-blocks'],
  'investor': ['charts', 'infographics', 'data-tables', 'timelines'],
  'compliance': ['data-tables', 'diagrams', 'charts'],
  'proposal': ['charts', 'data-tables', 'timelines', 'diagrams'],
  'operational': ['diagrams', 'data-tables', 'charts', 'timelines']
};

// ==========================================
// OUTPUT FORMAT → VISUALIZATION SUGGESTIONS
// ==========================================

const OUTPUT_FORMAT_VISUALIZATION_MAP: Record<string, { suitable: string[], avoid: string[] }> = {
  '2d-static': {
    suitable: ['charts', 'data-tables', 'diagrams', 'infographics', 'images', 'timelines', 'journey-maps', 'quote-blocks', 'icon-sets', 'grids', 'sections'],
    avoid: [] // All are suitable for static
  },
  '2d-animated': {
    suitable: ['charts', 'diagrams', 'infographics', 'timelines', 'animations'],
    avoid: ['data-filters', 'realtime'] // Complex interactivity limited
  },
  'video-intro': {
    suitable: ['images', 'video-clips', 'animations', 'audio', 'quote-blocks'],
    avoid: ['data-tables', 'forms', 'quizzes'] // Not suitable for video
  },
  'video-full': {
    suitable: ['images', 'video-clips', 'animations', 'audio', 'charts', 'timelines'],
    avoid: ['data-tables', 'forms', 'data-filters']
  },
  '3d-scene': {
    suitable: ['3d-objects', '3d-scenes', '3d-animations', 'images'],
    avoid: ['data-tables', 'forms', 'quizzes']
  },
  '3d-animated': {
    suitable: ['3d-objects', '3d-scenes', '3d-animations', 'animations'],
    avoid: ['data-tables', 'forms']
  },
  'interactive': {
    suitable: ['clickable', 'forms', 'quizzes', 'data-filters', 'realtime', 'charts', 'diagrams'],
    avoid: [] // Interactive supports everything
  }
};

// ==========================================
// CORE SERVICE FUNCTIONS
// ==========================================

/**
 * Get visualization recommendations based on context
 * IMPORTANT: This provides SUGGESTIONS only, never restrictions
 */
export function getVisualizationRecommendations(
  context: VisualizationContext
): VisualizationRecommendation {
  const suggestions: VisualizationSuggestion[] = [];
  const frameworkVisualMap: Record<string, string[]> = {};
  
  // 1. Framework-based suggestions
  context.selectedFrameworks.forEach(frameworkId => {
    const mapping = FRAMEWORK_VISUALIZATION_MAP[frameworkId] || FRAMEWORK_VISUALIZATION_MAP['_default'];
    frameworkVisualMap[frameworkId] = mapping.visuals;
    
    mapping.visuals.forEach((visualId, index) => {
      const feature = EXPANDED_VISUAL_FEATURES.find(f => f.id === visualId);
      if (feature) {
        const existing = suggestions.find(s => s.featureId === visualId);
        if (!existing) {
          suggestions.push({
            featureId: visualId,
            featureName: feature.name,
            suggestedSubOptions: feature.subOptions.slice(0, 3).map(s => s.id),
            reasoning: mapping.reasoning,
            priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
            source: 'framework'
          });
        }
      }
    });
  });
  
  // 2. Industry-based suggestions
  const industryKey = context.industry.toLowerCase();
  const industrySuggestions = INDUSTRY_VISUALIZATION_SUGGESTIONS[industryKey] || 
                              INDUSTRY_VISUALIZATION_SUGGESTIONS['_default'];
  
  industrySuggestions.visuals.forEach((visualId, index) => {
    const feature = EXPANDED_VISUAL_FEATURES.find(f => f.id === visualId);
    if (feature) {
      const existing = suggestions.find(s => s.featureId === visualId);
      if (!existing) {
        const subOptions = industrySuggestions.subOptions[visualId] || [];
        suggestions.push({
          featureId: visualId,
          featureName: feature.name,
          suggestedSubOptions: subOptions,
          reasoning: `Common in ${context.industry} presentations`,
          priority: index < 2 ? 'medium' : 'low',
          source: 'industry'
        });
      } else if (industrySuggestions.subOptions[visualId]) {
        // Merge sub-options
        existing.suggestedSubOptions = [
          ...new Set([...existing.suggestedSubOptions, ...industrySuggestions.subOptions[visualId]])
        ];
      }
    }
  });
  
  // 3. Content type suggestions
  context.contentTypes.forEach(contentType => {
    const typeKey = contentType.toLowerCase();
    const typeVisuals = CONTENT_TYPE_VISUALIZATION_MAP[typeKey] || [];
    
    typeVisuals.forEach(visualId => {
      const feature = EXPANDED_VISUAL_FEATURES.find(f => f.id === visualId);
      if (feature && !suggestions.find(s => s.featureId === visualId)) {
        suggestions.push({
          featureId: visualId,
          featureName: feature.name,
          suggestedSubOptions: feature.subOptions.slice(0, 2).map(s => s.id),
          reasoning: `Recommended for ${contentType} content`,
          priority: 'low',
          source: 'content-type'
        });
      }
    });
  });
  
  // 4. Output format adjustments
  const outputConfig = OUTPUT_FORMAT_VISUALIZATION_MAP[context.outputType] || 
                       OUTPUT_FORMAT_VISUALIZATION_MAP['2d-static'];
  
  // Boost priority for suitable visuals, mark avoided ones
  suggestions.forEach(s => {
    if (outputConfig.suitable.includes(s.featureId)) {
      if (s.priority === 'low') s.priority = 'medium';
    }
    if (outputConfig.avoid.includes(s.featureId)) {
      s.priority = 'low';
      s.reasoning += ' (Limited support in this output format)';
    }
  });
  
  // 5. Apply tier filter to get available features
  const tierFilteredFeatures = EXPANDED_VISUAL_FEATURES.filter(
    f => f.tier <= context.globalTier
  );
  
  // 6. Generate overall reasoning
  const overallReasoning = generateOverallReasoning(context, suggestions);
  
  return {
    suggestions: suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
    overallReasoning,
    availableFeatures: EXPANDED_VISUAL_FEATURES, // ALWAYS ALL available
    tierFilteredFeatures,
    frameworkVisualMap
  };
}

/**
 * Generate human-readable reasoning
 */
function generateOverallReasoning(
  context: VisualizationContext,
  suggestions: VisualizationSuggestion[]
): string {
  const parts: string[] = [];
  
  const frameworkSuggestions = suggestions.filter(s => s.source === 'framework');
  const industrySuggestions = suggestions.filter(s => s.source === 'industry');
  
  if (frameworkSuggestions.length > 0) {
    const frameworks = context.selectedFrameworks.slice(0, 2).join(', ');
    parts.push(`Based on ${frameworks}, we recommend ${frameworkSuggestions[0]?.featureName}`);
  }
  
  if (industrySuggestions.length > 0) {
    parts.push(`${context.industry} presentations commonly use ${industrySuggestions.slice(0, 2).map(s => s.featureName).join(', ')}`);
  }
  
  parts.push('All visualization types remain available for your selection.');
  
  return parts.join('. ') + '.';
}

/**
 * Get sub-option recommendations for a specific visual feature
 */
export function getSubOptionRecommendations(
  featureId: string,
  context: VisualizationContext
): VisualFeatureSubOption[] {
  const feature = EXPANDED_VISUAL_FEATURES.find(f => f.id === featureId);
  if (!feature) return [];
  
  // Get industry-specific sub-options
  const industryKey = context.industry.toLowerCase();
  const industrySuggestions = INDUSTRY_VISUALIZATION_SUGGESTIONS[industryKey];
  const suggestedSubOptionIds = industrySuggestions?.subOptions[featureId] || [];
  
  // Sort sub-options: suggested first, then by tier
  return feature.subOptions.sort((a, b) => {
    const aIsSuggested = suggestedSubOptionIds.includes(a.id) ? 0 : 1;
    const bIsSuggested = suggestedSubOptionIds.includes(b.id) ? 0 : 1;
    
    if (aIsSuggested !== bIsSuggested) return aIsSuggested - bIsSuggested;
    return (a.tier || 1) - (b.tier || 1);
  });
}

/**
 * Filter visual features by tier
 */
export function filterVisualFeaturesByTier(
  tier: 1 | 2 | 3
): ExpandedVisualFeature[] {
  return EXPANDED_VISUAL_FEATURES.filter(f => f.tier <= tier);
}

/**
 * Get all visual features (no filtering)
 * Used in Custom mode
 */
export function getAllVisualFeatures(): ExpandedVisualFeature[] {
  return EXPANDED_VISUAL_FEATURES;
}

/**
 * Check if a visual feature is suitable for an output format
 */
export function isFeatureSuitableForOutput(
  featureId: string,
  outputType: string
): { suitable: boolean; warning?: string } {
  const outputConfig = OUTPUT_FORMAT_VISUALIZATION_MAP[outputType];
  
  if (!outputConfig) {
    return { suitable: true };
  }
  
  if (outputConfig.avoid.includes(featureId)) {
    return { 
      suitable: false, 
      warning: `This feature has limited support in ${outputType} output format` 
    };
  }
  
  return { suitable: true };
}

// ==========================================
// EXPORTS
// ==========================================

export const visualizationRecommendationService = {
  getRecommendations: getVisualizationRecommendations,
  getSubOptionRecommendations,
  filterByTier: filterVisualFeaturesByTier,
  getAllFeatures: getAllVisualFeatures,
  isFeatureSuitableForOutput,
  
  // Export mappings for reference
  FRAMEWORK_VISUALIZATION_MAP,
  INDUSTRY_VISUALIZATION_SUGGESTIONS,
  CONTENT_TYPE_VISUALIZATION_MAP,
  OUTPUT_FORMAT_VISUALIZATION_MAP
};

export default visualizationRecommendationService;
