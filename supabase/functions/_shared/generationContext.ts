/**
 * Shared Generation Context Types for A2A Orchestration
 * Used across all edge functions to ensure consistent context handling
 * 
 * COMPLETE ROUTING FOR:
 * - Content Type Categories (6) + Content Types (18) with multi-select
 * - Framework Categories (10) + Frameworks (49+) with multi-select
 * - Design Template Categories (5) + Templates (15) with multi-select
 * - Visual Feature Categories (6) + Features (22) with sub-options (100+)
 * - Audio Categories (4): Voiceover, Music, SFX, Spatial Audio with multi-select
 * - Translation/Multi-Language separate routing
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
  // Content Type with Categories
  contentCategory?: string; // 'narrative' | 'business' | 'training' | 'research' | 'visual' | 'video'
  contentType?: string;
  selectedContentTypes?: string[]; // Multi-select
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
  // Framework with Categories
  selectedFrameworkCategories?: string[]; // Multi-select categories
  selectedFrameworkIds?: string[]; // Multi-select frameworks within categories
  // Design Templates with multi-select
  selectedTemplateCategories?: string[];
  selectedTemplateIds?: string[];
  // Visual Features with sub-options
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
  outputSubOptions?: OutputSubOption[];
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

export interface OutputSubOption {
  outputTypeId: string;
  subOptions: string[];
  tier: 1 | 2 | 3;
}

// ============================================
// AUDIO CONFIG (Expanded - Not just Music/SFX)
// ============================================
export interface AudioConfig {
  // Voiceover
  voiceoverEnabled?: boolean;
  voiceoverProvider?: string;
  voiceoverId?: string;
  voiceoverLanguages?: string[];
  
  // Music
  musicEnabled?: boolean;
  musicCategory?: string; // 'corporate' | 'cinematic' | 'ambient' | etc.
  musicProvider?: string;
  musicVolume?: number;
  
  // SFX
  sfxEnabled?: boolean;
  sfxCategories?: string[]; // Multi-select: ['transitions', 'notifications', 'ambient']
  sfxProvider?: string;
  
  // Spatial Audio (3D/VR)
  spatialAudioEnabled?: boolean;
  spatialAudioType?: '3d-positional' | 'ambisonics' | 'binaural';
}

// ============================================
// TRANSLATION CONFIG (Separate from Voice)
// ============================================
export interface TranslationConfig {
  enabled?: boolean;
  sourceLanguage?: string;
  targetLanguages?: string[]; // Multi-select
  translationProvider?: string; // 'deepl' | 'google' | 'azure' | 'qwen-mt' | 'nllb'
  formality?: 'formal' | 'informal' | 'auto';
  preserveFormatting?: boolean;
  glossaryTerms?: Record<string, string>;
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
// CONTENT TYPE CATEGORIES (6 categories)
// ============================================
export const CONTENT_TYPE_CATEGORIES: Record<string, {
  displayName: string;
  contentTypes: string[];
  a2aRequired: boolean;
  tier: GlobalTierLevel;
}> = {
  'narrative': {
    displayName: 'Narrative & Storytelling',
    contentTypes: ['storytelling', 'case-study', 'customer-journey', 'success-story'],
    a2aRequired: true,
    tier: 'starter',
  },
  'business': {
    displayName: 'Business & Strategy',
    contentTypes: ['investor-pitch', 'sales-deck', 'quarterly-review', 'board-presentation', 'proposal'],
    a2aRequired: true,
    tier: 'pro',
  },
  'training': {
    displayName: 'Training & Education',
    contentTypes: ['training-module', 'onboarding', 'workshop', 'course-content', 'certification'],
    a2aRequired: true,
    tier: 'starter',
  },
  'research': {
    displayName: 'Research & Analysis',
    contentTypes: ['research-report', 'market-analysis', 'whitepaper', 'competitive-intel', 'trend-analysis'],
    a2aRequired: true,
    tier: 'pro',
  },
  'visual': {
    displayName: 'Visual & Creative',
    contentTypes: ['infographic-deck', 'photo-essay', 'portfolio', 'brand-book', 'lookbook'],
    a2aRequired: true,
    tier: 'starter',
  },
  'video': {
    displayName: 'Video & Multimedia',
    contentTypes: ['video-script', 'explainer-video', 'product-demo', 'webinar', 'podcast-visual'],
    a2aRequired: true,
    tier: 'pro',
  },
};

// ============================================
// CONTENT TYPE A2A ROUTING (18+ types)
// ============================================
export const CONTENT_TYPE_A2A_ROUTING: Record<string, {
  category: string;
  agents: string[];
  a2aRequired: boolean;
  tier: GlobalTierLevel;
  outputFormats: string[];
  suggestedFrameworks: string[];
}> = {
  // Narrative Category
  'storytelling': { category: 'narrative', agents: ['content-generator', 'enhancer'], a2aRequired: true, tier: 'starter', outputFormats: ['slides', 'video'], suggestedFrameworks: ['customer-journey'] },
  'case-study': { category: 'narrative', agents: ['content-analyzer', 'content-generator'], a2aRequired: true, tier: 'starter', outputFormats: ['slides', 'document'], suggestedFrameworks: ['value-chain'] },
  'customer-journey': { category: 'narrative', agents: ['journey-mapper', 'content-generator'], a2aRequired: true, tier: 'pro', outputFormats: ['slides', 'interactive'], suggestedFrameworks: ['patient-journey', 'customer-lifecycle'] },
  'success-story': { category: 'narrative', agents: ['content-generator', 'image-generator'], a2aRequired: false, tier: 'starter', outputFormats: ['slides', 'video'], suggestedFrameworks: [] },
  
  // Business Category
  'investor-pitch': { category: 'business', agents: ['pitch-analyzer', 'financial-modeler', 'content-generator'], a2aRequired: true, tier: 'pro', outputFormats: ['slides', 'video'], suggestedFrameworks: ['growth-share-matrix', 'saas-metrics'] },
  'sales-deck': { category: 'business', agents: ['sales-optimizer', 'content-generator'], a2aRequired: true, tier: 'pro', outputFormats: ['slides', 'pdf'], suggestedFrameworks: ['swot', 'competitive-analysis'] },
  'quarterly-review': { category: 'business', agents: ['data-analyzer', 'chart-generator'], a2aRequired: true, tier: 'pro', outputFormats: ['slides', 'dashboard'], suggestedFrameworks: ['balanced-scorecard', 'okr'] },
  'board-presentation': { category: 'business', agents: ['executive-summarizer', 'content-generator'], a2aRequired: true, tier: 'enterprise', outputFormats: ['slides'], suggestedFrameworks: ['three-horizons', 'strategy-diamond'] },
  'proposal': { category: 'business', agents: ['proposal-writer', 'pricing-agent'], a2aRequired: true, tier: 'pro', outputFormats: ['document', 'slides'], suggestedFrameworks: [] },
  
  // Training Category
  'training-module': { category: 'training', agents: ['instructional-designer', 'quiz-generator'], a2aRequired: true, tier: 'pro', outputFormats: ['course', 'video', 'quiz'], suggestedFrameworks: ['design-thinking'] },
  'onboarding': { category: 'training', agents: ['onboarding-designer', 'checklist-agent'], a2aRequired: true, tier: 'starter', outputFormats: ['guide', 'video'], suggestedFrameworks: ['customer-journey'] },
  'workshop': { category: 'training', agents: ['workshop-designer', 'interactive-generator'], a2aRequired: true, tier: 'pro', outputFormats: ['slides', 'interactive'], suggestedFrameworks: ['design-thinking', 'scrum'] },
  
  // Research Category
  'research-report': { category: 'research', agents: ['research-analyst', 'citation-manager'], a2aRequired: true, tier: 'pro', outputFormats: ['document', 'slides'], suggestedFrameworks: ['pestle', 'porter-five'] },
  'market-analysis': { category: 'research', agents: ['market-analyst', 'chart-generator'], a2aRequired: true, tier: 'pro', outputFormats: ['slides', 'dashboard'], suggestedFrameworks: ['porter-five', 'competitive-analysis'] },
  'whitepaper': { category: 'research', agents: ['technical-writer', 'research-analyst'], a2aRequired: true, tier: 'enterprise', outputFormats: ['document', 'pdf'], suggestedFrameworks: ['value-chain'] },
  
  // Visual Category
  'infographic-deck': { category: 'visual', agents: ['infographic-designer', 'image-generator'], a2aRequired: true, tier: 'pro', outputFormats: ['slides', 'images'], suggestedFrameworks: [] },
  'portfolio': { category: 'visual', agents: ['portfolio-curator', 'image-generator'], a2aRequired: true, tier: 'starter', outputFormats: ['slides', 'web'], suggestedFrameworks: [] },
  
  // Video Category
  'video-script': { category: 'video', agents: ['video-scripter', 'storyboard-agent'], a2aRequired: true, tier: 'pro', outputFormats: ['script', 'storyboard', 'video'], suggestedFrameworks: [] },
  'explainer-video': { category: 'video', agents: ['explainer-scripter', 'animation-agent', 'voice-generator'], a2aRequired: true, tier: 'enterprise', outputFormats: ['video'], suggestedFrameworks: ['design-thinking'] },
  'product-demo': { category: 'video', agents: ['demo-scripter', 'screen-recorder'], a2aRequired: true, tier: 'pro', outputFormats: ['video', 'interactive'], suggestedFrameworks: ['product-led'] },
};

// ============================================
// FRAMEWORK CATEGORIES (10 categories)
// ============================================
export const FRAMEWORK_CATEGORIES: Record<string, {
  displayName: string;
  frameworks: string[];
  a2aRequired: boolean;
  tier: GlobalTierLevel;
}> = {
  'tier1-strategy': {
    displayName: 'Tier 1 Strategy',
    frameworks: ['7s', 'mece', 'pyramid', 'three-horizons', 'influence-model', 'growth-share-matrix'],
    a2aRequired: true,
    tier: 'pro',
  },
  'universal': {
    displayName: 'Universal Frameworks',
    frameworks: ['swot', 'porter-five', 'pestle', 'value-chain', 'competitive-analysis', 'bcg-matrix', 'ansoff-matrix'],
    a2aRequired: false,
    tier: 'starter',
  },
  'innovation': {
    displayName: 'Innovation & Product',
    frameworks: ['design-thinking', 'lean-startup', 'jobs-to-be-done', 'stage-gate', 'lean-canvas', 'business-model-canvas'],
    a2aRequired: true,
    tier: 'pro',
  },
  'agile': {
    displayName: 'Agile & Operations',
    frameworks: ['scrum', 'kanban', 'safe', 'okr', 'balanced-scorecard'],
    a2aRequired: false,
    tier: 'starter',
  },
  'healthcare': {
    displayName: 'Healthcare',
    frameworks: ['patient-journey', 'value-based-care', 'care-model', 'hipaa-compliance', 'clinical-trials', 'drug-lifecycle'],
    a2aRequired: true,
    tier: 'pro',
  },
  'fintech': {
    displayName: 'FinTech & Financial',
    frameworks: ['risk-assessment', 'regulatory', 'fintech-stack', 'unit-economics', 'cap-table', 'dcf-model'],
    a2aRequired: true,
    tier: 'pro',
  },
  'saas': {
    displayName: 'SaaS & Technology',
    frameworks: ['saas-metrics', 'product-led', 'pirate-metrics', 'tech-architecture', 'api-design', 'data-model'],
    a2aRequired: true,
    tier: 'pro',
  },
  'retail': {
    displayName: 'Retail & Commerce',
    frameworks: ['omnichannel', 'customer-lifecycle', 'retail-analytics', 'supply-chain'],
    a2aRequired: true,
    tier: 'pro',
  },
  'regional': {
    displayName: 'Regional Markets',
    frameworks: ['guanxi', 'kaizen', 'keiretsu', 'china-market', 'gdpr', 'eu-sustainability', 'mena-market', 'latam-growth', 'soc2'],
    a2aRequired: true,
    tier: 'enterprise',
  },
  'compliance': {
    displayName: 'Compliance & Legal',
    frameworks: ['gdpr', 'hipaa-compliance', 'soc2', 'regulatory-compliance', 'contract-analysis', 'privacy-impact'],
    a2aRequired: true,
    tier: 'enterprise',
  },
};

// ============================================
// FRAMEWORK A2A ROUTING (49+ frameworks)
// ============================================
export const FRAMEWORK_A2A_ROUTING: Record<string, {
  category: string;
  chartTypes: string[];
  a2aRequired: boolean;
  tier: GlobalTierLevel;
  specialists: string[];
}> = {
  // Tier 1 Strategy
  '7s': { category: 'tier1-strategy', chartTypes: ['heptagon', 'web'], a2aRequired: true, tier: 'pro', specialists: ['strategy-analyst'] },
  'mece': { category: 'tier1-strategy', chartTypes: ['tree', 'hierarchy'], a2aRequired: true, tier: 'pro', specialists: ['logic-analyst'] },
  'pyramid': { category: 'tier1-strategy', chartTypes: ['pyramid', 'hierarchy'], a2aRequired: true, tier: 'pro', specialists: ['structure-analyst'] },
  'three-horizons': { category: 'tier1-strategy', chartTypes: ['timeline', 'area'], a2aRequired: true, tier: 'pro', specialists: ['growth-strategist'] },
  'growth-share-matrix': { category: 'tier1-strategy', chartTypes: ['quadrant', 'bubble'], a2aRequired: true, tier: 'pro', specialists: ['portfolio-analyst'] },
  
  // Universal Frameworks
  'swot': { category: 'universal', chartTypes: ['matrix', 'quadrant'], a2aRequired: false, tier: 'free', specialists: [] },
  'porter-five': { category: 'universal', chartTypes: ['radar', 'force-diagram'], a2aRequired: true, tier: 'starter', specialists: ['strategy-analyst'] },
  'pestle': { category: 'universal', chartTypes: ['hexagon', 'category-chart'], a2aRequired: true, tier: 'starter', specialists: ['macro-analyst'] },
  'value-chain': { category: 'universal', chartTypes: ['flow', 'process'], a2aRequired: true, tier: 'starter', specialists: ['operations-analyst'] },
  'bcg-matrix': { category: 'universal', chartTypes: ['quadrant', 'bubble'], a2aRequired: false, tier: 'starter', specialists: [] },
  'ansoff-matrix': { category: 'universal', chartTypes: ['matrix', 'grid'], a2aRequired: false, tier: 'starter', specialists: [] },
  
  // Innovation
  'design-thinking': { category: 'innovation', chartTypes: ['process', 'cycle'], a2aRequired: true, tier: 'pro', specialists: ['innovation-coach'] },
  'lean-startup': { category: 'innovation', chartTypes: ['cycle', 'flow'], a2aRequired: true, tier: 'pro', specialists: ['startup-coach'] },
  'jobs-to-be-done': { category: 'innovation', chartTypes: ['hierarchy', 'job-map'], a2aRequired: true, tier: 'pro', specialists: ['jtbd-analyst'] },
  'lean-canvas': { category: 'innovation', chartTypes: ['canvas', 'grid'], a2aRequired: false, tier: 'starter', specialists: [] },
  'business-model-canvas': { category: 'innovation', chartTypes: ['canvas', 'grid'], a2aRequired: false, tier: 'starter', specialists: [] },
  
  // Agile
  'scrum': { category: 'agile', chartTypes: ['sprint', 'board'], a2aRequired: false, tier: 'free', specialists: [] },
  'kanban': { category: 'agile', chartTypes: ['board', 'flow'], a2aRequired: false, tier: 'free', specialists: [] },
  'safe': { category: 'agile', chartTypes: ['hierarchy', 'layers'], a2aRequired: true, tier: 'pro', specialists: ['agile-coach'] },
  'okr': { category: 'agile', chartTypes: ['tree', 'cascade'], a2aRequired: false, tier: 'starter', specialists: [] },
  'balanced-scorecard': { category: 'agile', chartTypes: ['scorecard', 'dashboard'], a2aRequired: true, tier: 'pro', specialists: ['performance-analyst'] },
  
  // Healthcare
  'patient-journey': { category: 'healthcare', chartTypes: ['journey-map', 'timeline'], a2aRequired: true, tier: 'pro', specialists: ['patient-experience-agent'] },
  'value-based-care': { category: 'healthcare', chartTypes: ['value-stream', 'outcome'], a2aRequired: true, tier: 'pro', specialists: ['vbc-analyst'] },
  'care-model': { category: 'healthcare', chartTypes: ['canvas', 'layers'], a2aRequired: true, tier: 'pro', specialists: ['care-model-agent'] },
  'hipaa-compliance': { category: 'healthcare', chartTypes: ['checklist', 'flow'], a2aRequired: true, tier: 'enterprise', specialists: ['compliance-agent'] },
  'clinical-trials': { category: 'healthcare', chartTypes: ['phase-diagram', 'gantt'], a2aRequired: true, tier: 'enterprise', specialists: ['clinical-research-agent'] },
  
  // FinTech
  'risk-assessment': { category: 'fintech', chartTypes: ['heatmap', 'matrix'], a2aRequired: true, tier: 'pro', specialists: ['risk-analyst'] },
  'fintech-stack': { category: 'fintech', chartTypes: ['architecture', 'layers'], a2aRequired: true, tier: 'pro', specialists: ['tech-architect'] },
  'unit-economics': { category: 'fintech', chartTypes: ['cohort', 'ltv-cac'], a2aRequired: true, tier: 'pro', specialists: ['unit-econ-agent'] },
  
  // SaaS
  'saas-metrics': { category: 'saas', chartTypes: ['dashboard', 'gauge'], a2aRequired: true, tier: 'pro', specialists: ['metrics-analyst'] },
  'product-led': { category: 'saas', chartTypes: ['funnel', 'flow'], a2aRequired: true, tier: 'pro', specialists: ['plg-strategist'] },
  'pirate-metrics': { category: 'saas', chartTypes: ['funnel', 'flow'], a2aRequired: false, tier: 'starter', specialists: [] },
  
  // Regional
  'guanxi': { category: 'regional', chartTypes: ['network', 'relationship'], a2aRequired: true, tier: 'enterprise', specialists: ['apac-specialist'] },
  'kaizen': { category: 'regional', chartTypes: ['cycle', 'improvement'], a2aRequired: true, tier: 'pro', specialists: ['lean-specialist'] },
  'gdpr': { category: 'regional', chartTypes: ['flow', 'compliance'], a2aRequired: true, tier: 'enterprise', specialists: ['privacy-agent'] },
};

// ============================================
// DESIGN TEMPLATE CATEGORIES (5 categories)
// ============================================
export const DESIGN_TEMPLATE_CATEGORIES: Record<string, {
  displayName: string;
  templates: string[];
  a2aRequired: boolean;
  tier: GlobalTierLevel;
}> = {
  'consulting': {
    displayName: 'Consulting & Strategy',
    templates: ['pure-consulting', 'consulting-hybrid', 'data-driven', 'executive-brief'],
    a2aRequired: true,
    tier: 'pro',
  },
  'creative': {
    displayName: 'Creative & Marketing',
    templates: ['creative-narrative', 'marketing-bold', 'startup-pitch', 'brand-story'],
    a2aRequired: true,
    tier: 'starter',
  },
  'industry': {
    displayName: 'Industry-Specific',
    templates: ['healthcare-clinical', 'pharma-scientific', 'fintech-bold', 'tech-modern', 'education-friendly'],
    a2aRequired: true,
    tier: 'pro',
  },
  'formal': {
    displayName: 'Formal & Enterprise',
    templates: ['enterprise-formal', 'gov-compliant', 'luxury-premium', 'legal-precise'],
    a2aRequired: true,
    tier: 'enterprise',
  },
  'minimal': {
    displayName: 'Minimal & Clean',
    templates: ['minimal-clean', 'ngo-impact', 'academic-research'],
    a2aRequired: false,
    tier: 'free',
  },
};

// ============================================
// DESIGN TEMPLATE A2A ROUTING (15+ templates)
// ============================================
export const DESIGN_TEMPLATE_A2A_ROUTING: Record<string, {
  category: string;
  visualProvider: string;
  a2aRequired: boolean;
  tier: GlobalTierLevel;
  styleGuide: Record<string, string>;
}> = {
  'pure-consulting': { category: 'consulting', visualProvider: 'minimal', a2aRequired: true, tier: 'pro', styleGuide: { fontFamily: 'Inter', colorScheme: 'corporate-blue' } },
  'consulting-hybrid': { category: 'consulting', visualProvider: 'balanced', a2aRequired: true, tier: 'pro', styleGuide: { fontFamily: 'Source Sans Pro', colorScheme: 'modern-gray' } },
  'data-driven': { category: 'consulting', visualProvider: 'charts-first', a2aRequired: true, tier: 'pro', styleGuide: { fontFamily: 'IBM Plex Sans', colorScheme: 'data-viz' } },
  'creative-narrative': { category: 'creative', visualProvider: 'creative', a2aRequired: true, tier: 'starter', styleGuide: { fontFamily: 'Playfair Display', colorScheme: 'warm-gradient' } },
  'marketing-bold': { category: 'creative', visualProvider: 'marketing', a2aRequired: true, tier: 'starter', styleGuide: { fontFamily: 'Montserrat', colorScheme: 'bold-gradient' } },
  'startup-pitch': { category: 'creative', visualProvider: 'startup', a2aRequired: false, tier: 'starter', styleGuide: { fontFamily: 'DM Sans', colorScheme: 'vibrant' } },
  'healthcare-clinical': { category: 'industry', visualProvider: 'clinical', a2aRequired: true, tier: 'pro', styleGuide: { fontFamily: 'Open Sans', colorScheme: 'medical-blue' } },
  'pharma-scientific': { category: 'industry', visualProvider: 'scientific', a2aRequired: true, tier: 'enterprise', styleGuide: { fontFamily: 'Merriweather', colorScheme: 'pharma-green' } },
  'fintech-bold': { category: 'industry', visualProvider: 'fintech', a2aRequired: true, tier: 'pro', styleGuide: { fontFamily: 'Poppins', colorScheme: 'fintech-dark' } },
  'tech-modern': { category: 'industry', visualProvider: 'tech', a2aRequired: false, tier: 'starter', styleGuide: { fontFamily: 'JetBrains Mono', colorScheme: 'dark-tech' } },
  'enterprise-formal': { category: 'formal', visualProvider: 'enterprise', a2aRequired: true, tier: 'enterprise', styleGuide: { fontFamily: 'IBM Plex Sans', colorScheme: 'enterprise-navy' } },
  'gov-compliant': { category: 'formal', visualProvider: 'government', a2aRequired: true, tier: 'enterprise', styleGuide: { fontFamily: 'Public Sans', colorScheme: 'gov-blue' } },
  'minimal-clean': { category: 'minimal', visualProvider: 'minimal', a2aRequired: false, tier: 'free', styleGuide: { fontFamily: 'Inter', colorScheme: 'monochrome' } },
  'ngo-impact': { category: 'minimal', visualProvider: 'nonprofit', a2aRequired: false, tier: 'starter', styleGuide: { fontFamily: 'Lato', colorScheme: 'earth-tones' } },
};

// ============================================
// VISUAL FEATURE CATEGORIES (6 categories)
// ============================================
export const VISUAL_FEATURE_CATEGORIES: Record<string, {
  displayName: string;
  features: string[];
  a2aRequired: boolean;
  tier: GlobalTierLevel;
}> = {
  'data': {
    displayName: 'Data Visualization',
    features: ['charts-graphs', 'infographics', 'data-tables', 'dashboards', 'gauges', 'sparklines'],
    a2aRequired: false,
    tier: 'free',
  },
  'structure': {
    displayName: 'Structure & Flow',
    features: ['journey-maps', 'process-flows', 'decision-trees', 'timelines', 'org-charts', 'swimlanes'],
    a2aRequired: true,
    tier: 'starter',
  },
  'media': {
    displayName: 'Media & Animation',
    features: ['video-clips', 'animations', 'ai-images', 'stock-photos', 'icons-illustrations', 'custom-illustrations'],
    a2aRequired: true,
    tier: 'pro',
  },
  '3d-ar': {
    displayName: '3D & AR/VR',
    features: ['3d-objects', '3d-scenes', 'avatars', 'lip-sync', 'ar-overlay', 'vr-360'],
    a2aRequired: true,
    tier: 'enterprise',
  },
  'interactive': {
    displayName: 'Interactive Elements',
    features: ['interactive-forms', 'interactive-quizzes', 'clickable-hotspots', 'data-filters', 'calculators'],
    a2aRequired: true,
    tier: 'pro',
  },
  'layout': {
    displayName: 'Layout Elements',
    features: ['grids', 'sections', 'quote-blocks', 'callouts', 'comparison-tables'],
    a2aRequired: false,
    tier: 'free',
  },
};

// ============================================
// VISUAL FEATURE A2A ROUTING (22+ features with sub-options)
// ============================================
export const VISUAL_FEATURE_A2A_ROUTING: Record<string, {
  category: string;
  agent: string;
  tier: GlobalTierLevel;
  a2aRequired: boolean;
  providers: string[];
  subOptions: string[];
}> = {
  // Data Visualization
  'charts-graphs': { category: 'data', agent: 'chart-generator', tier: 'free', a2aRequired: false, providers: ['recharts', 'd3'], subOptions: ['bar', 'line', 'pie', 'area', 'scatter', 'radar', 'waterfall', 'treemap'] },
  'infographics': { category: 'data', agent: 'infographic-agent', tier: 'pro', a2aRequired: true, providers: ['claude', 'gemini'], subOptions: ['statistical', 'comparison', 'timeline', 'process', 'geographic'] },
  'data-tables': { category: 'data', agent: 'table-formatter', tier: 'free', a2aRequired: false, providers: ['react'], subOptions: ['simple', 'sortable', 'grouped', 'pivot', 'comparison'] },
  'dashboards': { category: 'data', agent: 'dashboard-composer', tier: 'pro', a2aRequired: true, providers: ['gemini', 'claude'], subOptions: ['kpi', 'metrics', 'real-time', 'executive'] },
  
  // Structure & Flow
  'journey-maps': { category: 'structure', agent: 'journey-visualizer', tier: 'pro', a2aRequired: true, providers: ['gemini', 'claude'], subOptions: ['customer', 'patient', 'employee', 'user', 'stakeholder'] },
  'process-flows': { category: 'structure', agent: 'flow-diagram-agent', tier: 'starter', a2aRequired: false, providers: ['openai', 'gemini'], subOptions: ['simple', 'swimlane', 'cross-functional', 'value-stream'] },
  'decision-trees': { category: 'structure', agent: 'decision-tree-agent', tier: 'starter', a2aRequired: false, providers: ['claude', 'openai'], subOptions: ['binary', 'multi-branch', 'weighted'] },
  'timelines': { category: 'structure', agent: 'timeline-agent', tier: 'free', a2aRequired: false, providers: ['gemini'], subOptions: ['linear', 'milestone', 'gantt', 'roadmap'] },
  
  // Media & Animation
  'video-clips': { category: 'media', agent: 'video-generator', tier: 'pro', a2aRequired: true, providers: ['sora', 'veo', 'modelslab'], subOptions: ['intro', 'outro', 'transition', 'b-roll', 'explainer'] },
  'animations': { category: 'media', agent: 'animation-agent', tier: 'pro', a2aRequired: true, providers: ['lottie', 'rive', 'framer'], subOptions: ['micro', 'entrance', 'exit', 'emphasis', 'motion-path'] },
  'ai-images': { category: 'media', agent: 'image-generator', tier: 'starter', a2aRequired: false, providers: ['dall-e', 'imagen', 'flux'], subOptions: ['photorealistic', 'illustration', 'abstract', 'product', 'scene'] },
  'avatars': { category: 'media', agent: 'avatar-agent', tier: 'pro', a2aRequired: true, providers: ['heygen', 'd-id', 'alibaba'], subOptions: ['realistic', 'stylized', 'cartoon', '3d-mesh'] },
  'lip-sync': { category: 'media', agent: 'lipsync-agent', tier: 'pro', a2aRequired: true, providers: ['azure', 'alibaba', 'modelslab'], subOptions: ['basic', 'expressive', 'multilingual'] },
  
  // 3D & AR/VR
  '3d-objects': { category: '3d-ar', agent: '3d-model-agent', tier: 'enterprise', a2aRequired: true, providers: ['replicate', 'stability', 'meshy'], subOptions: ['product', 'character', 'environment', 'abstract'] },
  '3d-scenes': { category: '3d-ar', agent: '3d-scene-composer', tier: 'enterprise', a2aRequired: true, providers: ['replicate'], subOptions: ['interior', 'exterior', 'abstract', 'product-stage'] },
  'ar-overlay': { category: '3d-ar', agent: 'ar-agent', tier: 'enterprise', a2aRequired: true, providers: ['arcore', 'arkit'], subOptions: ['marker', 'markerless', 'face', 'product'] },
  'vr-360': { category: '3d-ar', agent: 'vr-agent', tier: 'enterprise', a2aRequired: true, providers: ['aframe', 'babylon'], subOptions: ['panorama', 'tour', 'interactive'] },
  
  // Interactive
  'interactive-forms': { category: 'interactive', agent: 'form-builder-agent', tier: 'pro', a2aRequired: true, providers: ['react'], subOptions: ['survey', 'calculator', 'configurator', 'booking'] },
  'interactive-quizzes': { category: 'interactive', agent: 'quiz-agent', tier: 'starter', a2aRequired: false, providers: ['openai', 'claude'], subOptions: ['multiple-choice', 'true-false', 'matching', 'ranking'] },
  
  // Layout
  'quote-blocks': { category: 'layout', agent: 'layout-agent', tier: 'free', a2aRequired: false, providers: ['react'], subOptions: ['simple', 'testimonial', 'pull-quote', 'highlight'] },
  'comparison-tables': { category: 'layout', agent: 'comparison-agent', tier: 'free', a2aRequired: false, providers: ['react'], subOptions: ['features', 'pricing', 'products', 'options'] },
};

// ============================================
// AUDIO CATEGORIES (4 categories - NOT just Music/SFX)
// ============================================
export const AUDIO_CATEGORIES: Record<string, {
  displayName: string;
  types: string[];
  a2aRequired: boolean;
  tier: GlobalTierLevel;
}> = {
  'voiceover': {
    displayName: 'Voiceover & Narration',
    types: ['narration', 'character-voice', 'presenter', 'documentary', 'commercial'],
    a2aRequired: true,
    tier: 'starter',
  },
  'music': {
    displayName: 'Background Music',
    types: ['corporate-ambient', 'cinematic-epic', 'upbeat-energetic', 'calm-meditation', 'tech-electronic', 'orchestral-classical', 'acoustic-warm', 'jazz-smooth', 'world-ethnic'],
    a2aRequired: false,
    tier: 'starter',
  },
  'sfx': {
    displayName: 'Sound Effects',
    types: ['transitions', 'notifications', 'ambient', 'ui-feedback', 'whoosh', 'impact', 'nature', 'urban'],
    a2aRequired: false,
    tier: 'free',
  },
  'spatial': {
    displayName: 'Spatial & 3D Audio',
    types: ['3d-positional', 'ambisonics', 'binaural', 'atmos', 'room-simulation'],
    a2aRequired: true,
    tier: 'enterprise',
  },
};

// ============================================
// AUDIO A2A ROUTING
// ============================================
export const AUDIO_A2A_ROUTING: Record<string, {
  category: string;
  provider: string;
  a2aRequired: boolean;
  tier: GlobalTierLevel;
  defaultParams: Record<string, any>;
}> = {
  // Voiceover
  'narration': { category: 'voiceover', provider: 'elevenlabs', a2aRequired: true, tier: 'starter', defaultParams: { style: 'narration', speed: 1.0 } },
  'character-voice': { category: 'voiceover', provider: 'elevenlabs', a2aRequired: true, tier: 'pro', defaultParams: { style: 'character' } },
  'presenter': { category: 'voiceover', provider: 'azure', a2aRequired: true, tier: 'starter', defaultParams: { style: 'presenter' } },
  'documentary': { category: 'voiceover', provider: 'elevenlabs', a2aRequired: true, tier: 'pro', defaultParams: { style: 'documentary' } },
  
  // Music
  'corporate-ambient': { category: 'music', provider: 'elevenlabs-music', a2aRequired: false, tier: 'starter', defaultParams: { mood: 'professional', tempo: 'moderate' } },
  'cinematic-epic': { category: 'music', provider: 'elevenlabs-music', a2aRequired: true, tier: 'pro', defaultParams: { mood: 'dramatic', tempo: 'building' } },
  'upbeat-energetic': { category: 'music', provider: 'elevenlabs-music', a2aRequired: false, tier: 'starter', defaultParams: { mood: 'energetic', tempo: 'fast' } },
  'calm-meditation': { category: 'music', provider: 'elevenlabs-music', a2aRequired: false, tier: 'starter', defaultParams: { mood: 'peaceful', tempo: 'slow' } },
  'tech-electronic': { category: 'music', provider: 'elevenlabs-music', a2aRequired: true, tier: 'pro', defaultParams: { mood: 'futuristic', tempo: 'pulsing' } },
  
  // SFX
  'transitions': { category: 'sfx', provider: 'elevenlabs-sfx', a2aRequired: false, tier: 'free', defaultParams: { type: 'transition' } },
  'notifications': { category: 'sfx', provider: 'elevenlabs-sfx', a2aRequired: false, tier: 'free', defaultParams: { type: 'notification' } },
  'ambient': { category: 'sfx', provider: 'elevenlabs-sfx', a2aRequired: false, tier: 'starter', defaultParams: { type: 'ambient' } },
  'ui-feedback': { category: 'sfx', provider: 'elevenlabs-sfx', a2aRequired: false, tier: 'free', defaultParams: { type: 'ui' } },
  
  // Spatial
  '3d-positional': { category: 'spatial', provider: 'spatial-audio-agent', a2aRequired: true, tier: 'enterprise', defaultParams: { type: '3d-spatial' } },
  'ambisonics': { category: 'spatial', provider: 'spatial-audio-agent', a2aRequired: true, tier: 'enterprise', defaultParams: { type: 'ambisonics' } },
  'binaural': { category: 'spatial', provider: 'spatial-audio-agent', a2aRequired: true, tier: 'enterprise', defaultParams: { type: 'binaural' } },
};

// ============================================
// TRANSLATION A2A ROUTING (Separate from Voice)
// ============================================
export const TRANSLATION_A2A_ROUTING: Record<string, {
  provider: string;
  a2aRequired: boolean;
  tier: GlobalTierLevel;
  quality: 'standard' | 'premium';
  supportedLanguages: string[];
}> = {
  // European Languages
  'european': { provider: 'deepl', a2aRequired: false, tier: 'starter', quality: 'premium', supportedLanguages: ['de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru'] },
  
  // CJK Languages
  'cjk': { provider: 'qwen-mt', a2aRequired: true, tier: 'pro', quality: 'premium', supportedLanguages: ['zh', 'ja', 'ko'] },
  
  // Indian Languages
  'indian': { provider: 'google', a2aRequired: true, tier: 'pro', quality: 'standard', supportedLanguages: ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml'] },
  
  // RTL Languages
  'rtl': { provider: 'azure', a2aRequired: true, tier: 'pro', quality: 'premium', supportedLanguages: ['ar', 'he', 'fa', 'ur'] },
  
  // African Languages
  'african': { provider: 'nllb', a2aRequired: true, tier: 'pro', quality: 'standard', supportedLanguages: ['sw', 'zu', 'yo', 'ig', 'am'] },
  
  // Low-resource Languages
  'low-resource': { provider: 'nllb', a2aRequired: true, tier: 'enterprise', quality: 'standard', supportedLanguages: ['my', 'km', 'lo', 'ne'] },
};

// ============================================
// COMPLETE GENERATION CONTEXT
// ============================================
export interface GenerationContext {
  workflowContext?: WorkflowContext;
  templateContext?: TemplateContext;
  agentContext?: AgentContext;
  outputConfig?: OutputConfig;
  audioConfig?: AudioConfig;
  translationConfig?: TranslationConfig;
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
  
  // 1. Check Content Type Category
  if (context.workflowContext?.contentCategory) {
    const category = CONTENT_TYPE_CATEGORIES[context.workflowContext.contentCategory];
    if (category) {
      if (category.a2aRequired) a2aRequired = true;
      updateTier(category.tier);
    }
  }
  
  // 2. Check Selected Content Types
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
  
  // 3. Check Framework Categories
  if (context.templateContext?.selectedFrameworkCategories) {
    for (const categoryId of context.templateContext.selectedFrameworkCategories) {
      const category = FRAMEWORK_CATEGORIES[categoryId];
      if (category) {
        if (category.a2aRequired) a2aRequired = true;
        updateTier(category.tier);
      }
    }
  }
  
  // 4. Check Individual Frameworks
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
  
  // 5. Check Design Template Categories
  if (context.templateContext?.selectedTemplateCategories) {
    for (const categoryId of context.templateContext.selectedTemplateCategories) {
      const category = DESIGN_TEMPLATE_CATEGORIES[categoryId];
      if (category) {
        if (category.a2aRequired) a2aRequired = true;
        updateTier(category.tier);
      }
    }
  }
  
  // 6. Check Visual Features with Sub-Options
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
  
  // 7. Check Audio Config
  if (context.audioConfig) {
    if (context.audioConfig.voiceoverEnabled) {
      a2aRequired = true;
      requiredAgents.push('voice-generator');
      updateTier('starter');
    }
    if (context.audioConfig.spatialAudioEnabled) {
      a2aRequired = true;
      requiredAgents.push('spatial-audio-agent');
      updateTier('enterprise');
    }
  }
  
  // 8. Check Translation Config
  if (context.translationConfig?.enabled && context.translationConfig.targetLanguages?.length) {
    a2aRequired = true;
    requiredAgents.push('translator-agent');
    updateTier('starter');
  }
  
  // Determine orchestration mode
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

// ============================================
// HELPER: Get Sub-Options for Feature
// ============================================
export function getSubOptionsForFeature(featureId: string): string[] {
  const routing = VISUAL_FEATURE_A2A_ROUTING[featureId];
  return routing?.subOptions || [];
}
