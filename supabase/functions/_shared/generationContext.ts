/**
 * Shared Generation Context Types for A2A Orchestration
 * Used across all edge functions to ensure consistent context handling
 */

// ============================================
// TIER LEVELS
// ============================================
export type GlobalTierLevel = 'free' | 'starter' | 'pro' | 'enterprise';

// ============================================
// WORKFLOW CONTEXT (Step 0-1)
// ============================================
export interface WorkflowContext {
  industryCategory?: string;
  segment?: string;
  contentCategory?: string;
  selectedContentTypes?: string[];
  aiModels?: Record<string, string>;
  isAIAutoMode?: boolean;
  aiRecommendation?: string;
  step1Mode?: 'auto' | 'custom';
  step2Mode?: 'auto' | 'custom';
  modelSelections?: ModelSelections;
}

export interface ModelSelections {
  primary?: string;
  override?: string;
  multiSelect?: string[];
}

// ============================================
// TEMPLATE CONTEXT (Step 2-3)
// ============================================
export interface TemplateContext {
  selectedTemplateId?: string;
  selectedThemeId?: string;
  brandConfig?: BrandConfig;
  selectedFrameworkCategories?: string[];
  selectedFrameworkIds?: string[];
  visualFeatures?: VisualFeatureSelection[];
  visualFeatureSubOptionsCount?: number;
  step2Mode?: 'auto' | 'custom';
}

export interface BrandConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  logoUrl?: string;
}

export interface VisualFeatureSelection {
  id: string;
  category: string;
  subOptions?: string[];
  a2aRequired?: boolean;
}

// ============================================
// AGENT CONTEXT (Step 6)
// ============================================
export interface AgentContext {
  architectureType?: 'single' | 'agentic';
  selectedAgentIds?: string[];
  agentModelConfigs?: AgentModelConfig[];
  languageVoiceConfigs?: LanguageVoiceConfig[];
}

export interface AgentModelConfig {
  agentKey: string;
  enabled: boolean;
  model: string;
}

export interface LanguageVoiceConfig {
  languageCode: string;
  voiceProvider: string;
  voiceId: string;
}

// ============================================
// OUTPUT CONFIG (Step 4-5)
// ============================================
export interface OutputConfig {
  outputType?: string;
  outputTypes?: string[];
  structureMode?: 'auto' | 'manual';
  slideCount?: number;
  chapterCount?: number;
  slidesPerChapter?: number;
  includeVoiceover?: boolean;
  includeMusic?: boolean;
  animationIntensity?: number;
  resolution?: '720p' | '1080p' | '4k';
  aspectRatio?: '16:9' | '4:3' | '9:16' | '1:1';
}

// ============================================
// VOICE CONFIG
// ============================================
export interface VoiceConfig {
  provider?: string;
  voiceId?: string;
  persona?: string;
  speed?: number;
  pitch?: number;
  stability?: number;
  clarity?: number;
  backgroundMusic?: boolean;
  musicVolume?: number;
  pauseBetweenSlides?: number;
}

// ============================================
// A2A ROUTING CONFIGURATION
// ============================================
export interface A2ARoutingConfig {
  requiredAgents: string[];
  a2aRequired: boolean;
  tier: GlobalTierLevel;
  providers: Record<string, string>;
  orchestrationMode: 'parallel' | 'sequential' | 'hybrid';
}

// ============================================
// VISUAL FEATURE A2A ROUTING (22 categories)
// ============================================
export const VISUAL_FEATURE_A2A_ROUTING: Record<string, {
  agent: string;
  tier: GlobalTierLevel;
  a2aRequired: boolean;
  providers: string[];
}> = {
  // Journey & Flow Visualizations
  'journey-maps': { agent: 'journey-visualizer', tier: 'pro', a2aRequired: true, providers: ['gemini', 'claude'] },
  'process-flows': { agent: 'flow-diagram-agent', tier: 'starter', a2aRequired: false, providers: ['openai', 'gemini'] },
  'decision-trees': { agent: 'decision-tree-agent', tier: 'starter', a2aRequired: false, providers: ['claude', 'openai'] },
  'timelines': { agent: 'timeline-agent', tier: 'free', a2aRequired: false, providers: ['gemini'] },
  
  // Data Visualizations
  'charts-graphs': { agent: 'chart-generator', tier: 'free', a2aRequired: false, providers: ['gemini', 'openai'] },
  'infographics': { agent: 'infographic-agent', tier: 'pro', a2aRequired: true, providers: ['claude', 'gemini'] },
  'data-tables': { agent: 'table-formatter', tier: 'free', a2aRequired: false, providers: ['openai'] },
  'dashboards': { agent: 'dashboard-composer', tier: 'pro', a2aRequired: true, providers: ['gemini', 'claude'] },
  
  // 3D & Interactive
  '3d-objects': { agent: '3d-model-agent', tier: 'enterprise', a2aRequired: true, providers: ['replicate', 'stability'] },
  '3d-scenes': { agent: '3d-scene-composer', tier: 'enterprise', a2aRequired: true, providers: ['replicate'] },
  'interactive-forms': { agent: 'form-builder-agent', tier: 'pro', a2aRequired: true, providers: ['claude'] },
  'interactive-quizzes': { agent: 'quiz-agent', tier: 'starter', a2aRequired: false, providers: ['openai', 'claude'] },
  
  // Media & Animation
  'video-clips': { agent: 'video-generator', tier: 'pro', a2aRequired: true, providers: ['sora', 'veo', 'modelslab'] },
  'animations': { agent: 'animation-agent', tier: 'pro', a2aRequired: true, providers: ['lottie', 'rive'] },
  'avatars': { agent: 'avatar-agent', tier: 'pro', a2aRequired: true, providers: ['heygen', 'd-id', 'alibaba'] },
  'lip-sync': { agent: 'lipsync-agent', tier: 'pro', a2aRequired: true, providers: ['azure', 'alibaba'] },
  
  // Images & Icons
  'ai-images': { agent: 'image-generator', tier: 'starter', a2aRequired: false, providers: ['dall-e', 'imagen', 'flux'] },
  'stock-photos': { agent: 'stock-search-agent', tier: 'free', a2aRequired: false, providers: ['unsplash', 'pexels'] },
  'icons-illustrations': { agent: 'icon-agent', tier: 'free', a2aRequired: false, providers: ['iconify', 'lucide'] },
  'custom-illustrations': { agent: 'illustration-agent', tier: 'pro', a2aRequired: true, providers: ['midjourney', 'dall-e'] },
  
  // Specialized
  'code-snippets': { agent: 'code-formatter', tier: 'free', a2aRequired: false, providers: ['openai', 'claude'] },
  'maps-geo': { agent: 'geo-visual-agent', tier: 'starter', a2aRequired: false, providers: ['mapbox', 'google-maps'] },
};

// ============================================
// FRAMEWORK A2A ROUTING (49+ categories)
// ============================================
export const FRAMEWORK_A2A_ROUTING: Record<string, {
  chartTypes: string[];
  a2aRequired: boolean;
  tier: GlobalTierLevel;
  specialists: string[];
}> = {
  // Strategy & Consulting (Tier: Pro+)
  'porter-five-forces': { chartTypes: ['force-diagram', 'radar'], a2aRequired: true, tier: 'pro', specialists: ['strategy-analyst'] },
  'swot-analysis': { chartTypes: ['matrix', 'quadrant'], a2aRequired: false, tier: 'starter', specialists: [] },
  'pestle-analysis': { chartTypes: ['hexagon', 'category-chart'], a2aRequired: true, tier: 'pro', specialists: ['macro-analyst'] },
  'value-chain': { chartTypes: ['flow', 'process'], a2aRequired: true, tier: 'pro', specialists: ['operations-analyst'] },
  'bcg-matrix': { chartTypes: ['quadrant', 'bubble'], a2aRequired: false, tier: 'starter', specialists: [] },
  'ansoff-matrix': { chartTypes: ['matrix', 'grid'], a2aRequired: false, tier: 'starter', specialists: [] },
  'mckinsey-7s': { chartTypes: ['web', 'interconnected'], a2aRequired: true, tier: 'pro', specialists: ['org-analyst'] },
  'balanced-scorecard': { chartTypes: ['scorecard', 'dashboard'], a2aRequired: true, tier: 'pro', specialists: ['performance-analyst'] },
  'okr-framework': { chartTypes: ['tree', 'hierarchy'], a2aRequired: false, tier: 'starter', specialists: [] },
  'kano-model': { chartTypes: ['curve', 'satisfaction'], a2aRequired: true, tier: 'pro', specialists: ['ux-analyst'] },
  
  // Healthcare Specific (Tier: Pro+)
  'care-pathways': { chartTypes: ['flow', 'swimlane'], a2aRequired: true, tier: 'pro', specialists: ['clinical-pathway-agent'] },
  'sdoh-framework': { chartTypes: ['wheel', 'category'], a2aRequired: true, tier: 'pro', specialists: ['social-health-agent'] },
  'chronic-care-model': { chartTypes: ['layered', 'ecosystem'], a2aRequired: true, tier: 'enterprise', specialists: ['care-model-agent'] },
  'patient-journey': { chartTypes: ['journey-map', 'timeline'], a2aRequired: true, tier: 'pro', specialists: ['patient-experience-agent'] },
  'clinical-trials': { chartTypes: ['phase-diagram', 'gantt'], a2aRequired: true, tier: 'enterprise', specialists: ['clinical-research-agent'] },
  'drug-lifecycle': { chartTypes: ['lifecycle', 'pipeline'], a2aRequired: true, tier: 'enterprise', specialists: ['pharma-lifecycle-agent'] },
  'value-based-care': { chartTypes: ['value-stream', 'outcome'], a2aRequired: true, tier: 'pro', specialists: ['vbc-analyst'] },
  'population-health': { chartTypes: ['cohort', 'stratification'], a2aRequired: true, tier: 'enterprise', specialists: ['pop-health-agent'] },
  
  // Financial Services (Tier: Pro+)
  'risk-assessment': { chartTypes: ['heatmap', 'matrix'], a2aRequired: true, tier: 'pro', specialists: ['risk-analyst'] },
  'investment-thesis': { chartTypes: ['funnel', 'criteria'], a2aRequired: true, tier: 'enterprise', specialists: ['investment-analyst'] },
  'financial-modeling': { chartTypes: ['waterfall', 'bridge'], a2aRequired: true, tier: 'enterprise', specialists: ['financial-modeler'] },
  'cap-table': { chartTypes: ['pie', 'ownership'], a2aRequired: true, tier: 'pro', specialists: ['equity-analyst'] },
  'unit-economics': { chartTypes: ['cohort', 'ltv-cac'], a2aRequired: true, tier: 'pro', specialists: ['unit-econ-agent'] },
  'dcf-model': { chartTypes: ['forecast', 'sensitivity'], a2aRequired: true, tier: 'enterprise', specialists: ['valuation-agent'] },
  
  // Technology & Product (Tier: Starter+)
  'jobs-to-be-done': { chartTypes: ['hierarchy', 'job-map'], a2aRequired: true, tier: 'pro', specialists: ['jtbd-analyst'] },
  'lean-canvas': { chartTypes: ['canvas', 'grid'], a2aRequired: false, tier: 'starter', specialists: [] },
  'business-model-canvas': { chartTypes: ['canvas', 'grid'], a2aRequired: false, tier: 'starter', specialists: [] },
  'product-roadmap': { chartTypes: ['timeline', 'gantt'], a2aRequired: false, tier: 'starter', specialists: [] },
  'user-story-map': { chartTypes: ['story-map', 'hierarchy'], a2aRequired: true, tier: 'pro', specialists: ['product-agent'] },
  'tech-architecture': { chartTypes: ['diagram', 'layers'], a2aRequired: true, tier: 'pro', specialists: ['architecture-agent'] },
  'api-design': { chartTypes: ['sequence', 'flow'], a2aRequired: true, tier: 'pro', specialists: ['api-agent'] },
  'data-model': { chartTypes: ['erd', 'schema'], a2aRequired: true, tier: 'pro', specialists: ['data-model-agent'] },
  
  // Marketing & Sales (Tier: Starter+)
  'customer-journey': { chartTypes: ['journey-map', 'touchpoint'], a2aRequired: true, tier: 'pro', specialists: ['cx-agent'] },
  'sales-funnel': { chartTypes: ['funnel', 'conversion'], a2aRequired: false, tier: 'starter', specialists: [] },
  'marketing-mix': { chartTypes: ['4p', '7p'], a2aRequired: false, tier: 'starter', specialists: [] },
  'competitor-analysis': { chartTypes: ['matrix', 'positioning'], a2aRequired: true, tier: 'pro', specialists: ['competitive-intel-agent'] },
  'brand-positioning': { chartTypes: ['perceptual-map', 'matrix'], a2aRequired: true, tier: 'pro', specialists: ['brand-agent'] },
  'campaign-performance': { chartTypes: ['dashboard', 'funnel'], a2aRequired: false, tier: 'starter', specialists: [] },
  
  // Operations & Supply Chain (Tier: Pro+)
  'supply-chain': { chartTypes: ['flow', 'network'], a2aRequired: true, tier: 'pro', specialists: ['supply-chain-agent'] },
  'process-optimization': { chartTypes: ['value-stream', 'flow'], a2aRequired: true, tier: 'pro', specialists: ['process-agent'] },
  'capacity-planning': { chartTypes: ['resource', 'utilization'], a2aRequired: true, tier: 'pro', specialists: ['capacity-agent'] },
  'quality-management': { chartTypes: ['control-chart', 'pareto'], a2aRequired: true, tier: 'pro', specialists: ['quality-agent'] },
  
  // Legal & Compliance (Tier: Enterprise)
  'regulatory-compliance': { chartTypes: ['checklist', 'matrix'], a2aRequired: true, tier: 'enterprise', specialists: ['compliance-agent'] },
  'contract-analysis': { chartTypes: ['clause-map', 'risk'], a2aRequired: true, tier: 'enterprise', specialists: ['legal-agent'] },
  'privacy-impact': { chartTypes: ['assessment', 'flow'], a2aRequired: true, tier: 'enterprise', specialists: ['privacy-agent'] },
  
  // Education & Training (Tier: Starter+)
  'learning-objectives': { chartTypes: ['bloom', 'taxonomy'], a2aRequired: false, tier: 'starter', specialists: [] },
  'curriculum-map': { chartTypes: ['map', 'progression'], a2aRequired: true, tier: 'pro', specialists: ['curriculum-agent'] },
  'competency-framework': { chartTypes: ['matrix', 'levels'], a2aRequired: true, tier: 'pro', specialists: ['competency-agent'] },
  
  // General Purpose (Tier: Free+)
  'comparison': { chartTypes: ['table', 'matrix'], a2aRequired: false, tier: 'free', specialists: [] },
  'pros-cons': { chartTypes: ['t-chart', 'list'], a2aRequired: false, tier: 'free', specialists: [] },
  'cause-effect': { chartTypes: ['fishbone', 'tree'], a2aRequired: false, tier: 'starter', specialists: [] },
  'mind-map': { chartTypes: ['radial', 'tree'], a2aRequired: false, tier: 'free', specialists: [] },
};

// ============================================
// CONTENT TYPE A2A ROUTING (18 types)
// ============================================
export const CONTENT_TYPE_A2A_ROUTING: Record<string, {
  agents: string[];
  a2aRequired: boolean;
  tier: GlobalTierLevel;
  outputFormats: string[];
}> = {
  'investor-pitch': { agents: ['pitch-analyzer', 'financial-modeler'], a2aRequired: true, tier: 'pro', outputFormats: ['slides', 'video'] },
  'sales-deck': { agents: ['sales-optimizer', 'competitor-analyst'], a2aRequired: true, tier: 'pro', outputFormats: ['slides', 'pdf'] },
  'product-demo': { agents: ['demo-scripter', 'screen-recorder'], a2aRequired: true, tier: 'pro', outputFormats: ['video', 'interactive'] },
  'training-module': { agents: ['instructional-designer', 'quiz-generator'], a2aRequired: true, tier: 'pro', outputFormats: ['course', 'video', 'quiz'] },
  'research-report': { agents: ['research-analyst', 'citation-manager'], a2aRequired: true, tier: 'pro', outputFormats: ['document', 'slides'] },
  'case-study': { agents: ['case-writer', 'outcome-analyst'], a2aRequired: true, tier: 'pro', outputFormats: ['document', 'slides'] },
  'whitepaper': { agents: ['technical-writer', 'research-analyst'], a2aRequired: true, tier: 'pro', outputFormats: ['document', 'pdf'] },
  'webinar': { agents: ['webinar-producer', 'qa-handler'], a2aRequired: true, tier: 'enterprise', outputFormats: ['video', 'slides'] },
  'podcast-script': { agents: ['podcast-scripter', 'audio-producer'], a2aRequired: true, tier: 'pro', outputFormats: ['script', 'audio'] },
  'video-script': { agents: ['video-scripter', 'storyboard-agent'], a2aRequired: true, tier: 'pro', outputFormats: ['script', 'storyboard'] },
  'social-content': { agents: ['social-optimizer', 'hashtag-agent'], a2aRequired: false, tier: 'starter', outputFormats: ['posts', 'video'] },
  'blog-article': { agents: ['blog-writer', 'seo-optimizer'], a2aRequired: false, tier: 'starter', outputFormats: ['article', 'snippets'] },
  'newsletter': { agents: ['newsletter-writer', 'engagement-optimizer'], a2aRequired: false, tier: 'starter', outputFormats: ['email', 'web'] },
  'press-release': { agents: ['pr-writer', 'media-analyst'], a2aRequired: true, tier: 'pro', outputFormats: ['document', 'snippets'] },
  'internal-memo': { agents: ['memo-writer'], a2aRequired: false, tier: 'free', outputFormats: ['document'] },
  'proposal': { agents: ['proposal-writer', 'pricing-agent'], a2aRequired: true, tier: 'pro', outputFormats: ['document', 'slides'] },
  'onboarding': { agents: ['onboarding-designer', 'checklist-agent'], a2aRequired: true, tier: 'pro', outputFormats: ['guide', 'video'] },
  'compliance-doc': { agents: ['compliance-writer', 'legal-reviewer'], a2aRequired: true, tier: 'enterprise', outputFormats: ['document', 'checklist'] },
};

// ============================================
// DESIGN TEMPLATE A2A ROUTING (15 styles)
// ============================================
export const DESIGN_TEMPLATE_A2A_ROUTING: Record<string, {
  visualProvider: string;
  a2aRequired: boolean;
  tier: GlobalTierLevel;
  styleGuide: Record<string, string>;
}> = {
  'pure-consulting': { visualProvider: 'minimal', a2aRequired: false, tier: 'pro', styleGuide: { fontFamily: 'Inter', colorScheme: 'corporate-blue' } },
  'creative-narrative': { visualProvider: 'creative', a2aRequired: true, tier: 'pro', styleGuide: { fontFamily: 'Playfair Display', colorScheme: 'warm-gradient' } },
  'data-driven': { visualProvider: 'charts-first', a2aRequired: true, tier: 'pro', styleGuide: { fontFamily: 'Source Sans Pro', colorScheme: 'data-viz' } },
  'tech-modern': { visualProvider: 'tech', a2aRequired: false, tier: 'starter', styleGuide: { fontFamily: 'JetBrains Mono', colorScheme: 'dark-tech' } },
  'healthcare-clinical': { visualProvider: 'clinical', a2aRequired: true, tier: 'pro', styleGuide: { fontFamily: 'Open Sans', colorScheme: 'medical-blue' } },
  'pharma-scientific': { visualProvider: 'scientific', a2aRequired: true, tier: 'enterprise', styleGuide: { fontFamily: 'Merriweather', colorScheme: 'pharma-green' } },
  'fintech-bold': { visualProvider: 'fintech', a2aRequired: true, tier: 'pro', styleGuide: { fontFamily: 'Poppins', colorScheme: 'fintech-dark' } },
  'startup-pitch': { visualProvider: 'startup', a2aRequired: false, tier: 'starter', styleGuide: { fontFamily: 'DM Sans', colorScheme: 'vibrant' } },
  'enterprise-formal': { visualProvider: 'enterprise', a2aRequired: false, tier: 'pro', styleGuide: { fontFamily: 'IBM Plex Sans', colorScheme: 'enterprise-navy' } },
  'education-friendly': { visualProvider: 'education', a2aRequired: true, tier: 'starter', styleGuide: { fontFamily: 'Nunito', colorScheme: 'learning-colors' } },
  'marketing-bold': { visualProvider: 'marketing', a2aRequired: true, tier: 'pro', styleGuide: { fontFamily: 'Montserrat', colorScheme: 'bold-gradient' } },
  'minimal-clean': { visualProvider: 'minimal', a2aRequired: false, tier: 'free', styleGuide: { fontFamily: 'Inter', colorScheme: 'monochrome' } },
  'luxury-premium': { visualProvider: 'luxury', a2aRequired: true, tier: 'enterprise', styleGuide: { fontFamily: 'Cormorant', colorScheme: 'gold-black' } },
  'gov-compliant': { visualProvider: 'government', a2aRequired: true, tier: 'enterprise', styleGuide: { fontFamily: 'Public Sans', colorScheme: 'gov-blue' } },
  'ngo-impact': { visualProvider: 'nonprofit', a2aRequired: true, tier: 'pro', styleGuide: { fontFamily: 'Lato', colorScheme: 'earth-tones' } },
};

// ============================================
// MUSIC/SFX A2A ROUTING (14 categories)
// ============================================
export const MUSIC_SFX_A2A_ROUTING: Record<string, {
  provider: string;
  a2aRequired: boolean;
  tier: GlobalTierLevel;
  defaultParams: Record<string, any>;
}> = {
  'corporate-ambient': { provider: 'elevenlabs-music', a2aRequired: false, tier: 'starter', defaultParams: { mood: 'professional', tempo: 'moderate' } },
  'cinematic-epic': { provider: 'elevenlabs-music', a2aRequired: true, tier: 'pro', defaultParams: { mood: 'dramatic', tempo: 'building' } },
  'upbeat-energetic': { provider: 'elevenlabs-music', a2aRequired: false, tier: 'starter', defaultParams: { mood: 'energetic', tempo: 'fast' } },
  'calm-meditation': { provider: 'elevenlabs-music', a2aRequired: false, tier: 'starter', defaultParams: { mood: 'peaceful', tempo: 'slow' } },
  'tech-electronic': { provider: 'elevenlabs-music', a2aRequired: true, tier: 'pro', defaultParams: { mood: 'futuristic', tempo: 'pulsing' } },
  'orchestral-classical': { provider: 'elevenlabs-music', a2aRequired: true, tier: 'enterprise', defaultParams: { mood: 'classical', tempo: 'varied' } },
  'acoustic-warm': { provider: 'elevenlabs-music', a2aRequired: false, tier: 'starter', defaultParams: { mood: 'warm', tempo: 'moderate' } },
  'jazz-smooth': { provider: 'elevenlabs-music', a2aRequired: true, tier: 'pro', defaultParams: { mood: 'sophisticated', tempo: 'relaxed' } },
  'world-ethnic': { provider: 'elevenlabs-music', a2aRequired: true, tier: 'pro', defaultParams: { mood: 'cultural', tempo: 'varied' } },
  'sfx-transitions': { provider: 'elevenlabs-sfx', a2aRequired: false, tier: 'free', defaultParams: { type: 'transition' } },
  'sfx-notifications': { provider: 'elevenlabs-sfx', a2aRequired: false, tier: 'free', defaultParams: { type: 'notification' } },
  'sfx-ambient': { provider: 'elevenlabs-sfx', a2aRequired: false, tier: 'starter', defaultParams: { type: 'ambient' } },
  'sfx-ui-feedback': { provider: 'elevenlabs-sfx', a2aRequired: false, tier: 'free', defaultParams: { type: 'ui' } },
  '3d-spatial-audio': { provider: 'spatial-audio-agent', a2aRequired: true, tier: 'enterprise', defaultParams: { type: '3d-spatial' } },
};

// ============================================
// COMPLETE GENERATION CONTEXT
// ============================================
export interface GenerationContext {
  workflowContext?: WorkflowContext;
  templateContext?: TemplateContext;
  agentContext?: AgentContext;
  outputConfig?: OutputConfig;
  globalTier?: GlobalTierLevel;
  voiceConfig?: VoiceConfig;
  
  // Computed A2A routing
  a2aRouting?: A2ARoutingConfig;
}

// ============================================
// HELPER: Compute A2A Requirements
// ============================================
export function computeA2ARequirements(context: GenerationContext): A2ARoutingConfig {
  const requiredAgents: string[] = [];
  const providers: Record<string, string> = {};
  let a2aRequired = false;
  let maxTier: GlobalTierLevel = 'free';
  
  const tierOrder: GlobalTierLevel[] = ['free', 'starter', 'pro', 'enterprise'];
  
  const updateTier = (tier: GlobalTierLevel) => {
    if (tierOrder.indexOf(tier) > tierOrder.indexOf(maxTier)) {
      maxTier = tier;
    }
  };
  
  // 1. Check Visual Features
  if (context.templateContext?.visualFeatures) {
    for (const feature of context.templateContext.visualFeatures) {
      const routing = VISUAL_FEATURE_A2A_ROUTING[feature.id];
      if (routing) {
        if (routing.a2aRequired) {
          a2aRequired = true;
          requiredAgents.push(routing.agent);
        }
        updateTier(routing.tier);
        providers[feature.id] = routing.providers[0];
      }
    }
  }
  
  // 2. Check Frameworks
  if (context.templateContext?.selectedFrameworkIds) {
    for (const frameworkId of context.templateContext.selectedFrameworkIds) {
      const routing = FRAMEWORK_A2A_ROUTING[frameworkId];
      if (routing) {
        if (routing.a2aRequired) {
          a2aRequired = true;
          requiredAgents.push(...routing.specialists);
        }
        updateTier(routing.tier);
      }
    }
  }
  
  // 3. Check Content Types
  if (context.workflowContext?.selectedContentTypes) {
    for (const contentType of context.workflowContext.selectedContentTypes) {
      const routing = CONTENT_TYPE_A2A_ROUTING[contentType];
      if (routing) {
        if (routing.a2aRequired) {
          a2aRequired = true;
          requiredAgents.push(...routing.agents);
        }
        updateTier(routing.tier);
      }
    }
  }
  
  // 4. Determine orchestration mode
  const uniqueAgents = [...new Set(requiredAgents)];
  let orchestrationMode: 'parallel' | 'sequential' | 'hybrid' = 'parallel';
  
  if (uniqueAgents.length > 5) {
    orchestrationMode = 'hybrid';
  } else if (context.outputConfig?.outputTypes && context.outputConfig.outputTypes.length > 1) {
    orchestrationMode = 'sequential';
  }
  
  return {
    requiredAgents: uniqueAgents,
    a2aRequired,
    tier: maxTier,
    providers,
    orchestrationMode,
  };
}

// ============================================
// HELPER: Validate Tier Access
// ============================================
export function validateTierAccess(requiredTier: GlobalTierLevel, userTier: GlobalTierLevel): boolean {
  const tierOrder: GlobalTierLevel[] = ['free', 'starter', 'pro', 'enterprise'];
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
}

// ============================================
// HELPER: Get Provider for Feature
// ============================================
export function getProviderForFeature(featureId: string, preferredProvider?: string): string | null {
  const routing = VISUAL_FEATURE_A2A_ROUTING[featureId];
  if (!routing) return null;
  
  if (preferredProvider && routing.providers.includes(preferredProvider)) {
    return preferredProvider;
  }
  
  return routing.providers[0];
}
