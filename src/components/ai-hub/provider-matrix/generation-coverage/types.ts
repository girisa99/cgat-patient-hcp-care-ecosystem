/**
 * Generation Coverage Types
 * 
 * Comprehensive type definitions for mapping high-level generation context
 * (Industry, Framework, Template, Visual Features, Output Types)
 * to low-level AI capabilities (Providers, Models, Features)
 */

import { FeatureCategory, ProviderId } from '../types';

// ==========================================
// CONTEXT TYPES (What the user selects)
// ==========================================

export type IndustryId = 
  | 'healthcare' | 'pharma' | 'biotech' | 'medical-devices'
  | 'finance' | 'fintech' | 'insurance' | 'banking'
  | 'technology' | 'saas' | 'ai-ml' | 'cybersecurity'
  | 'consulting' | 'legal' | 'professional-services'
  | 'manufacturing' | 'automotive' | 'aerospace' | 'energy'
  | 'retail' | 'ecommerce' | 'consumer-goods' | 'food-beverage'
  | 'education' | 'edtech' | 'training' | 'research'
  | 'media' | 'entertainment' | 'gaming' | 'sports' | 'marketing'
  | 'government' | 'nonprofit' | 'real-estate' | 'hospitality';

export type FrameworkId = 
  | 'swot' | 'porter-five' | 'pestle' | 'value-chain' | 'ansoff'
  | 'blue-ocean' | 'balanced-scorecard' | 'growth-share-matrix'
  | 'three-horizons' | 'experience-curve' | 'nps' | 'okr'
  | 'design-thinking' | 'lean-startup' | 'jobs-to-be-done'
  | 'scrum' | 'kanban' | 'safe' | 'mece' | 'pyramid'
  | 'patient-journey' | 'value-based-care' | 'risk-assessment' | 'regulatory'
  | 'saas-metrics' | 'product-led' | 'pirate-metrics' | 'competitive-analysis'
  | 'kaizen' | 'six-sigma' | 'gdpr' | 'hipaa-compliance';

export type TemplateId = 
  | 'pitch-deck' | 'investor-update' | 'board-deck'
  | 'sales-deck' | 'product-demo' | 'case-study'
  | 'training-manual' | 'onboarding' | 'workshop'
  | 'annual-report' | 'quarterly-review' | 'strategy-brief'
  | 'marketing-campaign' | 'brand-guidelines' | 'social-media'
  | 'project-proposal' | 'rfp-response' | 'whitepaper'
  | 'research-report' | 'competitive-analysis' | 'market-research';

export type VisualFeatureId = 
  | 'infographics' | 'charts' | 'data-tables'
  | 'journey-maps' | 'timelines' | 'diagrams' | 'quote-blocks' | 'icon-sets'
  | 'images' | 'video-clips' | 'audio' | 'animations'
  | '3d-objects' | '3d-scenes' | '3d-animations' | 'ar-elements'
  | 'clickable' | 'forms' | 'quizzes' | 'data-filters' | 'realtime'
  | 'grids' | 'sections';

export type OutputFormatId = 
  | 'pdf-export' | 'pptx-export' | '2d-static' | 'print-ready'
  | '2d-animated' | 'video-short' | '3d-static' | 'web-embed' | 'social-media'
  | 'video-full' | '3d-animated' | 'interactive' | 'vr-experience' | 'ar-overlay' | 'mixed-reality';

export type ModelType = 'text' | 'image' | 'video' | 'voice' | 'translation' | '3d' | 'stt' | 'ocr';

// ==========================================
// MAPPING TYPES (Bidirectional relationships)
// ==========================================

export interface ContextToCapabilityMapping {
  contextType: 'industry' | 'framework' | 'template' | 'visual' | 'output';
  contextId: string;
  contextName: string;
  
  // Required AI capabilities
  requiredFeatures: { featureId: string; category: FeatureCategory; priority: 'critical' | 'recommended' | 'optional' }[];
  
  // Recommended providers per model type
  recommendedProviders: {
    text?: { providers: ProviderId[]; reason: string }[];
    image?: { providers: ProviderId[]; reason: string }[];
    video?: { providers: ProviderId[]; reason: string }[];
    voice?: { providers: ProviderId[]; reason: string }[];
    translation?: { providers: ProviderId[]; reason: string }[];
    mesh3d?: { providers: ProviderId[]; reason: string }[];
  };
  
  // Recommended models (specific model IDs from constants)
  recommendedModels: {
    type: ModelType;
    modelIds: string[];
    reason: string;
    tier: 1 | 2 | 3;
  }[];
  
  // Compatible contexts (what this works well with)
  compatibleWith: {
    industries?: IndustryId[];
    frameworks?: FrameworkId[];
    templates?: TemplateId[];
    visuals?: VisualFeatureId[];
    outputs?: OutputFormatId[];
  };
  
  // Incompatible/constrained contexts
  constraints: {
    contextType: string;
    contextId: string;
    severity: 'incompatible' | 'warning' | 'suboptimal';
    reason: string;
  }[];
  
  // Use cases and scenarios
  scenarios: string[];
  useCases: string[];
}

export interface CapabilityToContextMapping {
  featureId: string;
  featureName: string;
  category: FeatureCategory;
  
  // What contexts use this feature
  usedByIndustries: { id: IndustryId; priority: 'primary' | 'secondary' }[];
  usedByFrameworks: { id: FrameworkId; priority: 'primary' | 'secondary' }[];
  usedByTemplates: { id: TemplateId; priority: 'primary' | 'secondary' }[];
  usedByVisuals: { id: VisualFeatureId; priority: 'primary' | 'secondary' }[];
  usedByOutputs: { id: OutputFormatId; priority: 'primary' | 'secondary' }[];
  
  // Cross-dependencies
  dependsOn: { featureId: string; category: FeatureCategory }[];
  enablesFeatures: { featureId: string; category: FeatureCategory }[];
  
  // INHERITED from CROSS_FUNCTIONAL_MAPPINGS & FEATURE_USE_CASES (no redundancy)
  scenarios?: string[];
  useCases?: string[];
  limitations?: string[];
  recommendedProviders?: string[];
  recommendedLLMs?: string[];
  genieProducts?: string[];
}

// ==========================================
// COMBINATION VALIDATION
// ==========================================

export interface ContextCombination {
  industries: IndustryId[];
  frameworks: FrameworkId[];
  templates: TemplateId[];
  visualFeatures: VisualFeatureId[];
  visualSubOptions: string[]; // Sub-option IDs from visual features
  outputFormats: OutputFormatId[];
  languages: string[];
  tier: 1 | 2 | 3;
}

export interface CombinationValidationResult {
  isValid: boolean;
  
  // Required capabilities to fulfill this combination
  requiredCapabilities: {
    featureId: string;
    category: FeatureCategory;
    status: 'available' | 'partial' | 'missing';
    provider?: ProviderId;
  }[];
  
  // Resolved providers per model type
  resolvedProviders: {
    type: ModelType;
    primary: { providerId: ProviderId; modelId: string; confidence: number };
    fallbacks: { providerId: ProviderId; modelId: string; confidence: number }[];
  }[];
  
  // Warnings and issues
  warnings: {
    type: 'compatibility' | 'quality' | 'cost' | 'performance';
    message: string;
    affectedContexts: string[];
    suggestion?: string;
  }[];
  
  // Gaps in coverage
  gaps: {
    featureId: string;
    category: FeatureCategory;
    reason: string;
    impact: 'blocking' | 'degraded' | 'cosmetic';
  }[];
  
  // Estimated generation quality
  qualityScore: number; // 0-100
  costEstimate: 'low' | 'medium' | 'high' | 'premium';
  timeEstimate: { min: number; max: number }; // minutes
}

// ==========================================
// COVERAGE MATRIX TYPES
// ==========================================

export interface GenerationCoverageMatrix {
  // Forward mappings (Context → Capabilities)
  industryMappings: ContextToCapabilityMapping[];
  frameworkMappings: ContextToCapabilityMapping[];
  templateMappings: ContextToCapabilityMapping[];
  visualMappings: ContextToCapabilityMapping[];
  outputMappings: ContextToCapabilityMapping[];
  
  // Backward mappings (Capabilities → Contexts)
  featureMappings: CapabilityToContextMapping[];
  
  // Summary statistics
  summary: {
    totalIndustries: number;
    totalFrameworks: number;
    totalTemplates: number;
    totalVisualFeatures: number;
    totalOutputFormats: number;
    totalRequiredFeatures: number;
    coveredFeatures: number;
    partialFeatures: number;
    missingFeatures: number;
    coveragePercentage: number;
  };
}

// ==========================================
// UI DISPLAY TYPES
// ==========================================

export interface CoverageDisplayRow {
  contextType: 'industry' | 'framework' | 'template' | 'visual' | 'output';
  contextId: string;
  contextName: string;
  icon?: string;
  
  // Provider coverage badges
  textProviders: { id: ProviderId; status: 'primary' | 'fallback' | 'available' }[];
  imageProviders: { id: ProviderId; status: 'primary' | 'fallback' | 'available' }[];
  videoProviders: { id: ProviderId; status: 'primary' | 'fallback' | 'available' }[];
  voiceProviders: { id: ProviderId; status: 'primary' | 'fallback' | 'available' }[];
  
  // Feature requirements
  criticalFeatures: string[];
  recommendedFeatures: string[];
  
  // Cross-references
  compatibleOutputs: OutputFormatId[];
  compatibleVisuals: VisualFeatureId[];
  
  // Status
  coverageStatus: 'complete' | 'partial' | 'gap';
  gapCount: number;
}
