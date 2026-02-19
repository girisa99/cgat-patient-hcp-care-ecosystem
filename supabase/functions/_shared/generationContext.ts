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
 * - TRANSFORMATION PIPELINES (20+): text-to-image, image-to-video, ppt-to-video, etc.
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
// TRANSFORMATION PIPELINES (50+ workflows)
// Multi-modal X → Y transformations with agent orchestration
// Aligned with actual configured providers and models
// ============================================

// CUSTOMER PAIN POINTS → Platform Solutions:
// 1. "Takes too long to create professional videos" → Auto PPT-to-Video, Text-to-Video
// 2. "Can't afford multiple tools" → All-in-one platform with unified pipeline
// 3. "Lip-sync never matches audio" → Azure Viseme + ElevenLabs voice sync
// 4. "3D content requires expensive software" → Text/Image-to-3D with ModelsLab/Meshy
// 5. "VR/AR is too technical" → Guided VR creation with A-Frame/Babylon
// 6. "Localization is tedious" → Multi-language with auto voice dubbing
// 7. "Can't make AI avatars look natural" → HeyGen/D-ID with voice matching
// 8. "Need custom music without licensing" → ElevenLabs Music + SunoAI

export type TransformationPipeline = 
  // ============ TEXT-BASED ============
  | 'text-to-image' | 'text-to-video' | 'text-to-3d' | 'text-to-animation' | 'text-to-avatar'
  | 'text-to-vr' | 'text-to-ar' | 'text-to-interactive' | 'text-to-music' | 'text-to-sfx'
  
  // ============ IMAGE-BASED ============
  | 'image-to-video' | 'image-to-3d' | 'image-to-animation' | 'image-to-avatar'
  | 'image-to-vr' | 'image-to-ar' | 'image-to-vfx'
  
  // ============ VOICE/AUDIO-BASED ============
  | 'voice-to-animation' | 'voice-to-avatar' | 'voice-to-3d' | 'voice-to-interactive'
  | 'voice-to-video' | 'voice-to-vr' | 'audio-to-animation' | 'audio-to-vfx'
  
  // ============ DOCUMENT/PPT-BASED ============
  | 'ppt-to-video' | 'ppt-to-animation' | 'ppt-to-interactive' | 'ppt-to-3d' | 'ppt-to-vr'
  | 'document-to-video' | 'document-to-slides' | 'document-to-interactive'
  | 'pdf-to-video' | 'pdf-to-interactive'
  
  // ============ VIDEO-BASED ============
  | 'video-to-avatar' | 'video-to-3d' | 'video-to-animation' | 'video-to-interactive'
  | 'video-to-vr' | 'video-to-vfx' | 'video-to-multilingual'
  
  // ============ 3D-BASED ============
  | '3d-to-video' | '3d-to-animation' | '3d-to-vr' | '3d-to-ar' | '3d-to-interactive'
  
  // ============ AR/VR/IMMERSIVE ============
  | 'scene-to-vr' | 'scene-to-ar' | 'ar-to-video' | 'vr-to-video'
  | 'panorama-to-vr' | 'floor-plan-to-vr'
  
  // ============ COMPLEX MULTI-MODAL ============
  | 'auto-record-to-avatar' | 'auto-record-to-3d' | 'auto-record-to-interactive'
  | 'auto-record-to-video' | 'auto-record-to-vr'
  | 'multi-modal-mashup' | 'full-production-suite'
  
  // ============ SPECIALIZED ============
  | 'avatar-video-dubbing' | 'lip-sync-multilingual' | 'vfx-composite'
  | 'sfx-scene-audio' | 'music-score-generation' | 'spatial-audio-3d';

export interface TransformationPipelineConfig {
  pipeline: TransformationPipeline;
  stages: TransformationStage[];
  a2aRequired: boolean;
  tier: GlobalTierLevel;
  agents: string[];
  estimatedDurationSeconds: number;
  fallbackPipeline?: TransformationPipeline;
  // Customer value proposition
  customerPainPoint?: string;
  platformSolution?: string;
  // Provider alignment
  primaryProviders: string[];
  requiredSecrets: string[];
}

export interface TransformationStage {
  stage: number;
  name: string;
  inputType: 'text' | 'image' | 'audio' | 'video' | '3d' | 'document' | 'voice' | 'panorama' | 'scene';
  outputType: 'text' | 'image' | 'audio' | 'video' | '3d' | 'animation' | 'interactive' | 'vr' | 'ar' | 'vfx' | 'sfx' | 'music';
  agent: string;
  provider: string;
  models: string[];
  optional?: boolean;
}

export const TRANSFORMATION_PIPELINE_ROUTING: Record<TransformationPipeline, TransformationPipelineConfig> = {
  // ============ TEXT-BASED PIPELINES ============
  'text-to-image': {
    pipeline: 'text-to-image',
    stages: [
      { stage: 1, name: 'Prompt Enhancement', inputType: 'text', outputType: 'text', agent: 'prompt-enhancer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Image Generation', inputType: 'text', outputType: 'image', agent: 'image-generator', provider: 'modelslab', models: ['flux-pro', 'dall-e-3', 'imagen-3'] },
    ],
    a2aRequired: false,
    tier: 'starter',
    agents: ['prompt-enhancer', 'image-generator'],
    estimatedDurationSeconds: 15,
    customerPainPoint: 'Need custom images without design skills',
    platformSolution: 'AI generates professional images from text descriptions',
    primaryProviders: ['modelslab', 'openai', 'google'],
    requiredSecrets: ['MODELSLAB_API_KEY', 'OPENAI_API_KEY'],
  },
  'text-to-video': {
    pipeline: 'text-to-video',
    stages: [
      { stage: 1, name: 'Script Generation', inputType: 'text', outputType: 'text', agent: 'script-generator', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Storyboard Creation', inputType: 'text', outputType: 'image', agent: 'storyboard-agent', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 3, name: 'Video Generation', inputType: 'text', outputType: 'video', agent: 'video-generator', provider: 'runway', models: ['runway-gen3', 'sora', 'veo', 'kling-ai'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['script-generator', 'storyboard-agent', 'video-generator'],
    estimatedDurationSeconds: 120,
    fallbackPipeline: 'text-to-image',
    customerPainPoint: 'Video creation takes weeks and costs thousands',
    platformSolution: 'Generate professional videos from text in minutes',
    primaryProviders: ['openai', 'google', 'runway', 'modelslab'],
    requiredSecrets: ['OPENAI_API_KEY', 'GEMINI_API_KEY'],
  },
  'text-to-3d': {
    pipeline: 'text-to-3d',
    stages: [
      { stage: 1, name: 'Concept Description', inputType: 'text', outputType: 'text', agent: 'concept-analyzer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: '3D Mesh Generation', inputType: 'text', outputType: '3d', agent: 'mesh-generator', provider: 'modelslab', models: ['meshy-ai', 'rodin-gen1', 'triposr', 'shap-e'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['concept-analyzer', 'mesh-generator'],
    estimatedDurationSeconds: 60,
    customerPainPoint: '3D modeling requires expensive software and skills',
    platformSolution: 'Create 3D models from text descriptions',
    primaryProviders: ['anthropic', 'modelslab', 'replicate'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'text-to-animation': {
    pipeline: 'text-to-animation',
    stages: [
      { stage: 1, name: 'Motion Script', inputType: 'text', outputType: 'text', agent: 'motion-scripter', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Keyframe Generation', inputType: 'text', outputType: 'animation', agent: 'animation-agent', provider: 'lottie', models: ['lottie', 'rive'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['motion-scripter', 'animation-agent'],
    estimatedDurationSeconds: 45,
    customerPainPoint: 'Creating smooth animations requires After Effects expertise',
    platformSolution: 'Generate Lottie/Rive animations from text',
    primaryProviders: ['openai', 'lottie', 'rive'],
    requiredSecrets: ['OPENAI_API_KEY'],
  },
  'text-to-avatar': {
    pipeline: 'text-to-avatar',
    stages: [
      { stage: 1, name: 'Avatar Script', inputType: 'text', outputType: 'text', agent: 'avatar-scripter', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Voice Synthesis', inputType: 'text', outputType: 'audio', agent: 'voice-generator', provider: 'elevenlabs', models: ['elevenlabs-v2', 'azure-neural', 'cosyvoice'] },
      { stage: 3, name: 'Avatar Video', inputType: 'audio', outputType: 'video', agent: 'avatar-generator', provider: 'heygen', models: ['heygen', 'd-id', 'synthesia', 'alibaba-wan'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['avatar-scripter', 'voice-generator', 'avatar-generator'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'AI avatars look fake and lip-sync is off',
    platformSolution: 'Photorealistic avatars with perfect lip-sync using Azure Viseme',
    primaryProviders: ['openai', 'elevenlabs', 'azure', 'heygen'],
    requiredSecrets: ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY'],
  },
  'text-to-vr': {
    pipeline: 'text-to-vr',
    stages: [
      { stage: 1, name: 'Scene Description', inputType: 'text', outputType: 'text', agent: 'scene-descriptor', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: '3D Environment', inputType: 'text', outputType: '3d', agent: 'environment-generator', provider: 'modelslab', models: ['meshy-ai', 'luma-genie'] },
      { stage: 3, name: 'VR Scene Assembly', inputType: '3d', outputType: 'vr', agent: 'vr-assembler', provider: 'aframe', models: ['a-frame', 'babylon', 'three.js'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['scene-descriptor', 'environment-generator', 'vr-assembler'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'VR development is too technical and expensive',
    platformSolution: 'Create VR experiences from text with A-Frame/Babylon',
    primaryProviders: ['anthropic', 'modelslab', 'aframe'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'text-to-ar': {
    pipeline: 'text-to-ar',
    stages: [
      { stage: 1, name: 'AR Object Design', inputType: 'text', outputType: 'text', agent: 'ar-designer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: '3D Asset Creation', inputType: 'text', outputType: '3d', agent: 'mesh-generator', provider: 'modelslab', models: ['meshy-ai', 'triposr'] },
      { stage: 3, name: 'AR Packaging', inputType: '3d', outputType: 'ar', agent: 'ar-packager', provider: 'modelviewer', models: ['model-viewer', 'arcore', 'arkit'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['ar-designer', 'mesh-generator', 'ar-packager'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'AR requires mobile development expertise',
    platformSolution: 'Web-based AR with Model Viewer for instant deployment',
    primaryProviders: ['openai', 'modelslab', 'google'],
    requiredSecrets: ['OPENAI_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'text-to-interactive': {
    pipeline: 'text-to-interactive',
    stages: [
      { stage: 1, name: 'Interactive Design', inputType: 'text', outputType: 'text', agent: 'interactive-designer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Component Build', inputType: 'text', outputType: 'interactive', agent: 'form-builder-agent', provider: 'react', models: ['react', 'd3'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['interactive-designer', 'form-builder-agent'],
    estimatedDurationSeconds: 60,
    customerPainPoint: 'Building interactive content requires coding',
    platformSolution: 'Generate quizzes, calculators, forms from text',
    primaryProviders: ['anthropic', 'react'],
    requiredSecrets: ['ANTHROPIC_API_KEY'],
  },
  'text-to-music': {
    pipeline: 'text-to-music',
    stages: [
      { stage: 1, name: 'Music Prompt', inputType: 'text', outputType: 'text', agent: 'music-prompt-agent', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Music Generation', inputType: 'text', outputType: 'music', agent: 'music-generator', provider: 'elevenlabs', models: ['elevenlabs-music', 'google-lyria', 'alibaba-funaudio', 'modelslab-musicgen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['music-prompt-agent', 'music-generator'],
    estimatedDurationSeconds: 45,
    customerPainPoint: 'Royalty-free music is generic or expensive',
    platformSolution: 'Generate custom original music with ElevenLabs or Google Lyria',
    primaryProviders: ['openai', 'elevenlabs', 'google', 'alibaba'],
    requiredSecrets: ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY'],
  },
  'text-to-sfx': {
    pipeline: 'text-to-sfx',
    stages: [
      { stage: 1, name: 'SFX Description', inputType: 'text', outputType: 'text', agent: 'sfx-designer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'SFX Generation', inputType: 'text', outputType: 'sfx', agent: 'sfx-generator', provider: 'elevenlabs', models: ['elevenlabs-sfx'] },
    ],
    a2aRequired: false,
    tier: 'starter',
    agents: ['sfx-designer', 'sfx-generator'],
    estimatedDurationSeconds: 15,
    customerPainPoint: 'Hard to find the perfect sound effect',
    platformSolution: 'Generate custom SFX from text descriptions',
    primaryProviders: ['openai', 'elevenlabs'],
    requiredSecrets: ['OPENAI_API_KEY', 'ELEVENLABS_API_KEY'],
  },

  // ============ IMAGE-BASED PIPELINES ============
  'image-to-video': {
    pipeline: 'image-to-video',
    stages: [
      { stage: 1, name: 'Image Analysis', inputType: 'image', outputType: 'text', agent: 'vision-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Motion Planning', inputType: 'text', outputType: 'text', agent: 'motion-planner', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Video Animation', inputType: 'image', outputType: 'video', agent: 'video-generator', provider: 'modelslab', models: ['animatediff-v2', 'svd', 'runway-gen3', 'kling-ai'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['vision-analyzer', 'motion-planner', 'video-generator'],
    estimatedDurationSeconds: 90,
    customerPainPoint: 'Static images don\'t engage audience',
    platformSolution: 'Animate any image with cinematic motion',
    primaryProviders: ['google', 'anthropic', 'modelslab', 'runway'],
    requiredSecrets: ['GEMINI_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'image-to-3d': {
    pipeline: 'image-to-3d',
    stages: [
      { stage: 1, name: 'Multi-View Inference', inputType: 'image', outputType: 'image', agent: 'multiview-agent', provider: 'stability', models: ['sv3d', 'zero123'] },
      { stage: 2, name: '3D Reconstruction', inputType: 'image', outputType: '3d', agent: 'mesh-generator', provider: 'modelslab', models: ['triposr', 'luma-genie', 'meshy-ai'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['multiview-agent', 'mesh-generator'],
    estimatedDurationSeconds: 75,
    customerPainPoint: '3D scanning equipment is expensive',
    platformSolution: 'Convert any 2D image to 3D model instantly',
    primaryProviders: ['stability', 'modelslab', 'luma'],
    requiredSecrets: ['MODELSLAB_API_KEY', 'REPLICATE_API_KEY'],
  },
  'image-to-animation': {
    pipeline: 'image-to-animation',
    stages: [
      { stage: 1, name: 'Character Detection', inputType: 'image', outputType: 'text', agent: 'character-detector', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Rig Generation', inputType: 'image', outputType: 'animation', agent: 'rigging-agent', provider: 'modelslab', models: ['animated-diff', 'sadtalker'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['character-detector', 'rigging-agent'],
    estimatedDurationSeconds: 60,
    customerPainPoint: 'Character animation needs frame-by-frame work',
    platformSolution: 'Auto-rig and animate characters from single image',
    primaryProviders: ['google', 'modelslab'],
    requiredSecrets: ['GEMINI_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'image-to-avatar': {
    pipeline: 'image-to-avatar',
    stages: [
      { stage: 1, name: 'Face Extraction', inputType: 'image', outputType: 'image', agent: 'face-extractor', provider: 'azure', models: ['face-api'] },
      { stage: 2, name: 'Avatar Creation', inputType: 'image', outputType: 'video', agent: 'avatar-generator', provider: 'heygen', models: ['heygen-photorealistic', 'd-id', 'alibaba-wan'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['face-extractor', 'avatar-generator'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'Creating talking head videos requires on-camera talent',
    platformSolution: 'Turn any photo into a speaking avatar',
    primaryProviders: ['azure', 'heygen', 'alibaba'],
    requiredSecrets: ['AZURE_API_KEY'],
  },
  'image-to-vr': {
    pipeline: 'image-to-vr',
    stages: [
      { stage: 1, name: 'Depth Estimation', inputType: 'image', outputType: 'image', agent: 'depth-estimator', provider: 'replicate', models: ['depth-anything', 'midas'] },
      { stage: 2, name: '3D Scene Generation', inputType: 'image', outputType: '3d', agent: 'scene-generator', provider: 'stability', models: ['sv3d'] },
      { stage: 3, name: 'VR Packaging', inputType: '3d', outputType: 'vr', agent: 'vr-packager', provider: 'aframe', models: ['a-frame'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['depth-estimator', 'scene-generator', 'vr-packager'],
    estimatedDurationSeconds: 150,
    customerPainPoint: 'VR content creation requires specialized 3D skills',
    platformSolution: 'Convert 2D images to immersive VR environments',
    primaryProviders: ['replicate', 'stability', 'aframe'],
    requiredSecrets: ['REPLICATE_API_KEY'],
  },
  'image-to-ar': {
    pipeline: 'image-to-ar',
    stages: [
      { stage: 1, name: 'Object Segmentation', inputType: 'image', outputType: 'image', agent: 'segmentation-agent', provider: 'replicate', models: ['sam-2'] },
      { stage: 2, name: '3D Lift', inputType: 'image', outputType: '3d', agent: 'mesh-generator', provider: 'modelslab', models: ['triposr'] },
      { stage: 3, name: 'AR Packaging', inputType: '3d', outputType: 'ar', agent: 'ar-packager', provider: 'modelviewer', models: ['model-viewer'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['segmentation-agent', 'mesh-generator', 'ar-packager'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'Product AR requires expensive 3D scanning',
    platformSolution: 'Create AR product views from photos',
    primaryProviders: ['replicate', 'modelslab', 'google'],
    requiredSecrets: ['REPLICATE_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'image-to-vfx': {
    pipeline: 'image-to-vfx',
    stages: [
      { stage: 1, name: 'VFX Planning', inputType: 'image', outputType: 'text', agent: 'vfx-planner', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Effect Generation', inputType: 'image', outputType: 'vfx', agent: 'vfx-generator', provider: 'modelslab', models: ['pika-effects', 'runway-gen3'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['vfx-planner', 'vfx-generator'],
    estimatedDurationSeconds: 75,
    customerPainPoint: 'VFX needs expensive software and expertise',
    platformSolution: 'Add professional VFX to any image',
    primaryProviders: ['anthropic', 'modelslab', 'pika'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },

  // ============ VOICE/AUDIO-BASED PIPELINES ============
  'voice-to-animation': {
    pipeline: 'voice-to-animation',
    stages: [
      { stage: 1, name: 'Speech-to-Text', inputType: 'voice', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper', 'azure-stt', 'paraformer'] },
      { stage: 2, name: 'Viseme Extraction', inputType: 'audio', outputType: 'animation', agent: 'viseme-agent', provider: 'azure', models: ['azure-viseme', 'rhubarb'] },
      { stage: 3, name: 'Animation Sync', inputType: 'animation', outputType: 'animation', agent: 'lipsync-agent', provider: 'modelslab', models: ['sadtalker', 'wav2lip'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['stt-agent', 'viseme-agent', 'lipsync-agent'],
    estimatedDurationSeconds: 90,
    customerPainPoint: 'Lip-sync animation is tedious frame-by-frame work',
    platformSolution: 'Auto lip-sync with Azure Viseme phoneme mapping',
    primaryProviders: ['azure', 'modelslab', 'openai'],
    requiredSecrets: ['AZURE_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'voice-to-avatar': {
    pipeline: 'voice-to-avatar',
    stages: [
      { stage: 1, name: 'Voice Processing', inputType: 'voice', outputType: 'audio', agent: 'voice-processor', provider: 'elevenlabs', models: ['voice-clone', 'voice-design'] },
      { stage: 2, name: 'Avatar Animation', inputType: 'audio', outputType: 'video', agent: 'avatar-generator', provider: 'heygen', models: ['heygen', 'd-id'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['voice-processor', 'avatar-generator'],
    estimatedDurationSeconds: 150,
    customerPainPoint: 'Need talking avatar but don\'t want to record myself',
    platformSolution: 'Clone voice and generate avatar speaking it',
    primaryProviders: ['elevenlabs', 'heygen', 'd-id'],
    requiredSecrets: ['ELEVENLABS_API_KEY'],
  },
  'voice-to-3d': {
    pipeline: 'voice-to-3d',
    stages: [
      { stage: 1, name: 'Voice-to-Text', inputType: 'voice', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 2, name: '3D Generation', inputType: 'text', outputType: '3d', agent: 'mesh-generator', provider: 'modelslab', models: ['meshy-ai', 'rodin-gen1'] },
      { stage: 3, name: '3D Animation', inputType: '3d', outputType: 'animation', agent: 'animation-agent', provider: 'three', models: ['three.js', 'babylon'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['stt-agent', 'mesh-generator', 'animation-agent'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Describing 3D models via text is imprecise',
    platformSolution: 'Speak your vision, AI creates the 3D model',
    primaryProviders: ['azure', 'openai', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'voice-to-interactive': {
    pipeline: 'voice-to-interactive',
    stages: [
      { stage: 1, name: 'Voice Command Parse', inputType: 'voice', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 2, name: 'Form Generation', inputType: 'text', outputType: 'interactive', agent: 'form-builder-agent', provider: 'react', models: ['react'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['stt-agent', 'form-builder-agent'],
    estimatedDurationSeconds: 45,
    customerPainPoint: 'Building forms is repetitive and slow',
    platformSolution: 'Voice-describe your form, AI builds it',
    primaryProviders: ['azure', 'openai'],
    requiredSecrets: ['AZURE_API_KEY', 'OPENAI_API_KEY'],
  },
  'voice-to-video': {
    pipeline: 'voice-to-video',
    stages: [
      { stage: 1, name: 'Speech-to-Text', inputType: 'voice', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper', 'deepgram'] },
      { stage: 2, name: 'Storyboard Generation', inputType: 'text', outputType: 'image', agent: 'storyboard-agent', provider: 'openai', models: ['dall-e-3'] },
      { stage: 3, name: 'Video Composition', inputType: 'image', outputType: 'video', agent: 'video-composer', provider: 'modelslab', models: ['animatediff-v2'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['stt-agent', 'storyboard-agent', 'video-composer'],
    estimatedDurationSeconds: 150,
    customerPainPoint: 'Turning podcast/voice into video is manual',
    platformSolution: 'Auto-visualize voice recording as video',
    primaryProviders: ['azure', 'openai', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'OPENAI_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'voice-to-vr': {
    pipeline: 'voice-to-vr',
    stages: [
      { stage: 1, name: 'Scene Description', inputType: 'voice', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 2, name: '3D Environment', inputType: 'text', outputType: '3d', agent: 'environment-generator', provider: 'modelslab', models: ['meshy-ai'] },
      { stage: 3, name: 'VR Assembly', inputType: '3d', outputType: 'vr', agent: 'vr-assembler', provider: 'aframe', models: ['a-frame'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['stt-agent', 'environment-generator', 'vr-assembler'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'VR prototyping is slow and technical',
    platformSolution: 'Voice-describe VR scene, AI builds it',
    primaryProviders: ['azure', 'modelslab', 'aframe'],
    requiredSecrets: ['AZURE_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'audio-to-animation': {
    pipeline: 'audio-to-animation',
    stages: [
      { stage: 1, name: 'Audio Analysis', inputType: 'audio', outputType: 'text', agent: 'audio-analyzer', provider: 'elevenlabs', models: ['audio-analysis'] },
      { stage: 2, name: 'Beat Mapping', inputType: 'audio', outputType: 'animation', agent: 'beat-mapper', provider: 'lottie', models: ['lottie'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['audio-analyzer', 'beat-mapper'],
    estimatedDurationSeconds: 60,
    customerPainPoint: 'Syncing animation to music is tedious',
    platformSolution: 'Auto-generate beat-synced animations',
    primaryProviders: ['elevenlabs', 'lottie'],
    requiredSecrets: ['ELEVENLABS_API_KEY'],
  },
  'audio-to-vfx': {
    pipeline: 'audio-to-vfx',
    stages: [
      { stage: 1, name: 'Audio Analysis', inputType: 'audio', outputType: 'text', agent: 'audio-analyzer', provider: 'elevenlabs', models: ['audio-analysis'] },
      { stage: 2, name: 'Reactive VFX', inputType: 'audio', outputType: 'vfx', agent: 'reactive-vfx-agent', provider: 'modelslab', models: ['audio-reactive'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['audio-analyzer', 'reactive-vfx-agent'],
    estimatedDurationSeconds: 90,
    customerPainPoint: 'Music visualizers need custom coding',
    platformSolution: 'Generate audio-reactive visual effects',
    primaryProviders: ['elevenlabs', 'modelslab'],
    requiredSecrets: ['ELEVENLABS_API_KEY', 'MODELSLAB_API_KEY'],
  },

  // ============ PPT/DOCUMENT-BASED PIPELINES ============
  'ppt-to-video': {
    pipeline: 'ppt-to-video',
    stages: [
      { stage: 1, name: 'Slide Extraction', inputType: 'document', outputType: 'text', agent: 'document-processor', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Script Generation', inputType: 'text', outputType: 'text', agent: 'script-generator', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Voiceover', inputType: 'text', outputType: 'audio', agent: 'voice-generator', provider: 'elevenlabs', models: ['elevenlabs-v2', 'azure-neural'] },
      { stage: 4, name: 'Video Composition', inputType: 'image', outputType: 'video', agent: 'video-composer', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['document-processor', 'script-generator', 'voice-generator', 'video-composer'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'Recording presentation videos is time-consuming',
    platformSolution: 'Auto-generate narrated video from PowerPoint',
    primaryProviders: ['azure', 'openai', 'elevenlabs'],
    requiredSecrets: ['AZURE_API_KEY', 'OPENAI_API_KEY', 'ELEVENLABS_API_KEY'],
  },
  'ppt-to-animation': {
    pipeline: 'ppt-to-animation',
    stages: [
      { stage: 1, name: 'Slide Extraction', inputType: 'document', outputType: 'image', agent: 'document-processor', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Animation Planning', inputType: 'text', outputType: 'animation', agent: 'animation-agent', provider: 'lottie', models: ['lottie', 'rive'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['document-processor', 'animation-agent'],
    estimatedDurationSeconds: 90,
    customerPainPoint: 'PowerPoint animations are limited and boring',
    platformSolution: 'Add cinematic Lottie animations to slides',
    primaryProviders: ['azure', 'lottie'],
    requiredSecrets: ['AZURE_API_KEY'],
  },
  'ppt-to-interactive': {
    pipeline: 'ppt-to-interactive',
    stages: [
      { stage: 1, name: 'Slide Analysis', inputType: 'document', outputType: 'text', agent: 'document-processor', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Interactive Build', inputType: 'text', outputType: 'interactive', agent: 'interactive-generator', provider: 'react', models: ['react', 'd3'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['document-processor', 'interactive-generator'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'Static slides don\'t engage audience',
    platformSolution: 'Convert slides to interactive web experience',
    primaryProviders: ['azure', 'react'],
    requiredSecrets: ['AZURE_API_KEY'],
  },
  'ppt-to-3d': {
    pipeline: 'ppt-to-3d',
    stages: [
      { stage: 1, name: 'Content Extraction', inputType: 'document', outputType: 'text', agent: 'document-processor', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: '3D Scene Design', inputType: 'text', outputType: 'text', agent: 'scene-designer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: '3D Generation', inputType: 'text', outputType: '3d', agent: 'mesh-generator', provider: 'modelslab', models: ['meshy-ai'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['document-processor', 'scene-designer', 'mesh-generator'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Presenting 3D data in slides is clunky',
    platformSolution: 'Convert slide graphics to interactive 3D',
    primaryProviders: ['azure', 'anthropic', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'ppt-to-vr': {
    pipeline: 'ppt-to-vr',
    stages: [
      { stage: 1, name: 'Slide Extraction', inputType: 'document', outputType: 'text', agent: 'document-processor', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'VR Layout', inputType: 'text', outputType: 'text', agent: 'vr-layout-agent', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'VR Assembly', inputType: 'text', outputType: 'vr', agent: 'vr-assembler', provider: 'aframe', models: ['a-frame'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['document-processor', 'vr-layout-agent', 'vr-assembler'],
    estimatedDurationSeconds: 210,
    customerPainPoint: 'VR presentations require specialized tools',
    platformSolution: 'Convert any PPT to VR gallery experience',
    primaryProviders: ['azure', 'anthropic', 'aframe'],
    requiredSecrets: ['AZURE_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  'document-to-video': {
    pipeline: 'document-to-video',
    stages: [
      { stage: 1, name: 'Document OCR', inputType: 'document', outputType: 'text', agent: 'ocr-agent', provider: 'azure', models: ['form-recognizer', 'tesseract'] },
      { stage: 2, name: 'Content Summary', inputType: 'text', outputType: 'text', agent: 'summarizer-agent', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Visual Generation', inputType: 'text', outputType: 'image', agent: 'image-generator', provider: 'modelslab', models: ['flux-pro'] },
      { stage: 4, name: 'Video Assembly', inputType: 'image', outputType: 'video', agent: 'video-generator', provider: 'modelslab', models: ['animatediff-v2'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['ocr-agent', 'summarizer-agent', 'image-generator', 'video-generator'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Documents are boring to read',
    platformSolution: 'Turn documents into engaging videos',
    primaryProviders: ['azure', 'anthropic', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'document-to-slides': {
    pipeline: 'document-to-slides',
    stages: [
      { stage: 1, name: 'Document Analysis', inputType: 'document', outputType: 'text', agent: 'document-processor', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Structure Generation', inputType: 'text', outputType: 'text', agent: 'slide-structurer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Visual Design', inputType: 'text', outputType: 'image', agent: 'slide-designer', provider: 'modelslab', models: ['flux-pro'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['document-processor', 'slide-structurer', 'slide-designer'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'Converting docs to slides is tedious',
    platformSolution: 'AI extracts key points and designs slides',
    primaryProviders: ['azure', 'openai', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'OPENAI_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'document-to-interactive': {
    pipeline: 'document-to-interactive',
    stages: [
      { stage: 1, name: 'Document Analysis', inputType: 'document', outputType: 'text', agent: 'document-processor', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Interactive Design', inputType: 'text', outputType: 'interactive', agent: 'interactive-generator', provider: 'react', models: ['react', 'd3'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['document-processor', 'interactive-generator'],
    estimatedDurationSeconds: 90,
    customerPainPoint: 'Long documents don\'t get read',
    platformSolution: 'Convert to interactive explorable format',
    primaryProviders: ['azure', 'react'],
    requiredSecrets: ['AZURE_API_KEY'],
  },
  'pdf-to-video': {
    pipeline: 'pdf-to-video',
    stages: [
      { stage: 1, name: 'PDF Extraction', inputType: 'document', outputType: 'text', agent: 'pdf-processor', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Script Writing', inputType: 'text', outputType: 'text', agent: 'script-generator', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Narration', inputType: 'text', outputType: 'audio', agent: 'voice-generator', provider: 'elevenlabs', models: ['elevenlabs-v2'] },
      { stage: 4, name: 'Video Assembly', inputType: 'image', outputType: 'video', agent: 'video-composer', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['pdf-processor', 'script-generator', 'voice-generator', 'video-composer'],
    estimatedDurationSeconds: 200,
    customerPainPoint: 'PDFs are static and unengaging',
    platformSolution: 'Transform PDF content into narrated videos',
    primaryProviders: ['azure', 'openai', 'elevenlabs'],
    requiredSecrets: ['AZURE_API_KEY', 'OPENAI_API_KEY', 'ELEVENLABS_API_KEY'],
  },
  'pdf-to-interactive': {
    pipeline: 'pdf-to-interactive',
    stages: [
      { stage: 1, name: 'PDF Analysis', inputType: 'document', outputType: 'text', agent: 'pdf-processor', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Interactive Build', inputType: 'text', outputType: 'interactive', agent: 'interactive-generator', provider: 'react', models: ['react'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['pdf-processor', 'interactive-generator'],
    estimatedDurationSeconds: 90,
    customerPainPoint: 'PDFs can\'t capture engagement data',
    platformSolution: 'Convert to trackable interactive experience',
    primaryProviders: ['azure', 'react'],
    requiredSecrets: ['AZURE_API_KEY'],
  },

  // ============ VIDEO-BASED PIPELINES ============
  'video-to-avatar': {
    pipeline: 'video-to-avatar',
    stages: [
      { stage: 1, name: 'Face Extraction', inputType: 'video', outputType: 'image', agent: 'face-extractor', provider: 'azure', models: ['face-api'] },
      { stage: 2, name: 'Avatar Training', inputType: 'image', outputType: 'video', agent: 'avatar-trainer', provider: 'heygen', models: ['heygen-clone'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['face-extractor', 'avatar-trainer'],
    estimatedDurationSeconds: 300,
    customerPainPoint: 'Creating consistent avatar from video is complex',
    platformSolution: 'Train custom avatar from video footage',
    primaryProviders: ['azure', 'heygen'],
    requiredSecrets: ['AZURE_API_KEY'],
  },
  'video-to-3d': {
    pipeline: 'video-to-3d',
    stages: [
      { stage: 1, name: 'Frame Extraction', inputType: 'video', outputType: 'image', agent: 'frame-extractor', provider: 'ffmpeg', models: ['ffmpeg'] },
      { stage: 2, name: 'Photogrammetry', inputType: 'image', outputType: '3d', agent: 'photogrammetry-agent', provider: 'replicate', models: ['nerf', 'gaussian-splatting'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['frame-extractor', 'photogrammetry-agent'],
    estimatedDurationSeconds: 360,
    customerPainPoint: '3D scanning from video needs expensive software',
    platformSolution: 'Convert video walkaround to 3D model',
    primaryProviders: ['ffmpeg', 'replicate'],
    requiredSecrets: ['REPLICATE_API_KEY'],
  },
  'video-to-animation': {
    pipeline: 'video-to-animation',
    stages: [
      { stage: 1, name: 'Motion Capture', inputType: 'video', outputType: 'animation', agent: 'mocap-agent', provider: 'replicate', models: ['mediapipe', 'openpose'] },
      { stage: 2, name: 'Animation Retarget', inputType: 'animation', outputType: 'animation', agent: 'retarget-agent', provider: 'modelslab', models: ['motion-retarget'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['mocap-agent', 'retarget-agent'],
    estimatedDurationSeconds: 150,
    customerPainPoint: 'Motion capture requires expensive equipment',
    platformSolution: 'Extract animation from any video',
    primaryProviders: ['replicate', 'modelslab'],
    requiredSecrets: ['REPLICATE_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'video-to-interactive': {
    pipeline: 'video-to-interactive',
    stages: [
      { stage: 1, name: 'Video Analysis', inputType: 'video', outputType: 'text', agent: 'video-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Hotspot Design', inputType: 'text', outputType: 'interactive', agent: 'interactive-generator', provider: 'react', models: ['react'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['video-analyzer', 'interactive-generator'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'Videos are passive, can\'t capture interaction',
    platformSolution: 'Add clickable hotspots and branching to videos',
    primaryProviders: ['google', 'react'],
    requiredSecrets: ['GEMINI_API_KEY'],
  },
  'video-to-vr': {
    pipeline: 'video-to-vr',
    stages: [
      { stage: 1, name: '360 Conversion', inputType: 'video', outputType: 'video', agent: 'panorama-converter', provider: 'ffmpeg', models: ['ffmpeg'] },
      { stage: 2, name: 'VR Packaging', inputType: 'video', outputType: 'vr', agent: 'vr-packager', provider: 'aframe', models: ['a-frame'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['panorama-converter', 'vr-packager'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'VR video players are fragmented',
    platformSolution: 'Package video for universal VR playback',
    primaryProviders: ['ffmpeg', 'aframe'],
    requiredSecrets: [],
  },
  'video-to-vfx': {
    pipeline: 'video-to-vfx',
    stages: [
      { stage: 1, name: 'Scene Analysis', inputType: 'video', outputType: 'text', agent: 'scene-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'VFX Overlay', inputType: 'video', outputType: 'vfx', agent: 'vfx-compositor', provider: 'runway', models: ['runway-gen3'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['scene-analyzer', 'vfx-compositor'],
    estimatedDurationSeconds: 150,
    customerPainPoint: 'Adding VFX to existing video needs After Effects',
    platformSolution: 'AI-powered VFX compositing on any video',
    primaryProviders: ['google', 'runway'],
    requiredSecrets: ['GEMINI_API_KEY'],
  },
  'video-to-multilingual': {
    pipeline: 'video-to-multilingual',
    stages: [
      { stage: 1, name: 'Audio Extraction', inputType: 'video', outputType: 'audio', agent: 'audio-extractor', provider: 'ffmpeg', models: ['ffmpeg'] },
      { stage: 2, name: 'Transcription', inputType: 'audio', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 3, name: 'Translation', inputType: 'text', outputType: 'text', agent: 'translator-agent', provider: 'deepl', models: ['deepl-pro', 'qwen-mt'] },
      { stage: 4, name: 'Voice Dubbing', inputType: 'text', outputType: 'audio', agent: 'voice-generator', provider: 'elevenlabs', models: ['elevenlabs-dubbing'] },
      { stage: 5, name: 'Lip Sync', inputType: 'audio', outputType: 'video', agent: 'lipsync-agent', provider: 'modelslab', models: ['wav2lip'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['audio-extractor', 'stt-agent', 'translator-agent', 'voice-generator', 'lipsync-agent'],
    estimatedDurationSeconds: 600,
    customerPainPoint: 'Dubbing videos in multiple languages is expensive',
    platformSolution: 'AI dubbing with voice cloning and lip-sync',
    primaryProviders: ['ffmpeg', 'azure', 'deepl', 'elevenlabs', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'DEEPL_API_KEY', 'ELEVENLABS_API_KEY', 'MODELSLAB_API_KEY'],
  },

  // ============ 3D-BASED PIPELINES ============
  '3d-to-video': {
    pipeline: '3d-to-video',
    stages: [
      { stage: 1, name: 'Camera Path', inputType: '3d', outputType: 'animation', agent: 'camera-agent', provider: 'three', models: ['three.js'] },
      { stage: 2, name: 'Render Sequence', inputType: '3d', outputType: 'video', agent: 'renderer', provider: 'three', models: ['three.js', 'babylon'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['camera-agent', 'renderer'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'Rendering 3D to video needs expensive software',
    platformSolution: 'Web-based 3D-to-video rendering',
    primaryProviders: ['three', 'babylon'],
    requiredSecrets: [],
  },
  '3d-to-animation': {
    pipeline: '3d-to-animation',
    stages: [
      { stage: 1, name: 'Rig Detection', inputType: '3d', outputType: 'animation', agent: 'auto-rigger', provider: 'modelslab', models: ['auto-rig'] },
      { stage: 2, name: 'Animation Apply', inputType: '3d', outputType: 'animation', agent: 'animation-agent', provider: 'three', models: ['three.js', 'mixamo'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['auto-rigger', 'animation-agent'],
    estimatedDurationSeconds: 90,
    customerPainPoint: 'Rigging 3D models for animation is technical',
    platformSolution: 'Auto-rig and animate any 3D model',
    primaryProviders: ['modelslab', 'three', 'mixamo'],
    requiredSecrets: ['MODELSLAB_API_KEY'],
  },
  '3d-to-vr': {
    pipeline: '3d-to-vr',
    stages: [
      { stage: 1, name: 'VR Optimization', inputType: '3d', outputType: '3d', agent: 'mesh-optimizer', provider: 'three', models: ['mesh-optimization'] },
      { stage: 2, name: 'VR Scene Build', inputType: '3d', outputType: 'vr', agent: 'vr-builder', provider: 'aframe', models: ['a-frame'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['mesh-optimizer', 'vr-builder'],
    estimatedDurationSeconds: 150,
    customerPainPoint: 'Optimizing 3D for VR is complex',
    platformSolution: 'Auto-optimize and package 3D for VR',
    primaryProviders: ['three', 'aframe'],
    requiredSecrets: [],
  },
  '3d-to-ar': {
    pipeline: '3d-to-ar',
    stages: [
      { stage: 1, name: 'AR Optimization', inputType: '3d', outputType: '3d', agent: 'mesh-optimizer', provider: 'three', models: ['mesh-optimization'] },
      { stage: 2, name: 'AR Packaging', inputType: '3d', outputType: 'ar', agent: 'ar-packager', provider: 'modelviewer', models: ['model-viewer'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['mesh-optimizer', 'ar-packager'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'AR deployment needs native app development',
    platformSolution: 'Web AR with Google Model Viewer',
    primaryProviders: ['three', 'google'],
    requiredSecrets: [],
  },
  '3d-to-interactive': {
    pipeline: '3d-to-interactive',
    stages: [
      { stage: 1, name: '3D Viewer Setup', inputType: '3d', outputType: 'interactive', agent: '3d-viewer-agent', provider: 'three', models: ['three.js', 'react-three-fiber'] },
    ],
    a2aRequired: false,
    tier: 'pro',
    agents: ['3d-viewer-agent'],
    estimatedDurationSeconds: 45,
    customerPainPoint: 'Embedding interactive 3D on web is hard',
    platformSolution: 'One-click interactive 3D viewer embed',
    primaryProviders: ['three', 'react'],
    requiredSecrets: [],
  },

  // ============ AR/VR SCENE PIPELINES ============
  'scene-to-vr': {
    pipeline: 'scene-to-vr',
    stages: [
      { stage: 1, name: 'Scene Description', inputType: 'scene', outputType: 'text', agent: 'scene-descriptor', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: '3D Assets', inputType: 'text', outputType: '3d', agent: 'asset-generator', provider: 'modelslab', models: ['meshy-ai'] },
      { stage: 3, name: 'VR Composition', inputType: '3d', outputType: 'vr', agent: 'vr-composer', provider: 'aframe', models: ['a-frame'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['scene-descriptor', 'asset-generator', 'vr-composer'],
    estimatedDurationSeconds: 300,
    customerPainPoint: 'Building VR scenes from scratch is daunting',
    platformSolution: 'Describe scene, AI builds complete VR environment',
    primaryProviders: ['anthropic', 'modelslab', 'aframe'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'scene-to-ar': {
    pipeline: 'scene-to-ar',
    stages: [
      { stage: 1, name: 'Scene Analysis', inputType: 'scene', outputType: 'text', agent: 'scene-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'AR Objects', inputType: 'text', outputType: '3d', agent: 'ar-object-generator', provider: 'modelslab', models: ['triposr'] },
      { stage: 3, name: 'AR Composition', inputType: '3d', outputType: 'ar', agent: 'ar-composer', provider: 'modelviewer', models: ['model-viewer'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['scene-analyzer', 'ar-object-generator', 'ar-composer'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'AR scene composition needs Unity/Unreal',
    platformSolution: 'Web-based AR scene composition',
    primaryProviders: ['google', 'modelslab', 'google'],
    requiredSecrets: ['GEMINI_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'ar-to-video': {
    pipeline: 'ar-to-video',
    stages: [
      { stage: 1, name: 'AR Recording', inputType: 'ar', outputType: 'video', agent: 'ar-recorder', provider: 'browser', models: ['web-ar-recorder'] },
      { stage: 2, name: 'Video Enhancement', inputType: 'video', outputType: 'video', agent: 'video-enhancer', provider: 'runway', models: ['runway-enhance'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['ar-recorder', 'video-enhancer'],
    estimatedDurationSeconds: 90,
    customerPainPoint: 'Recording AR experience for sharing is clunky',
    platformSolution: 'Smooth AR-to-video capture and enhance',
    primaryProviders: ['browser', 'runway'],
    requiredSecrets: [],
  },
  'vr-to-video': {
    pipeline: 'vr-to-video',
    stages: [
      { stage: 1, name: 'VR Recording', inputType: 'vr', outputType: 'video', agent: 'vr-recorder', provider: 'three', models: ['canvas-capture'] },
      { stage: 2, name: 'Video Encoding', inputType: 'video', outputType: 'video', agent: 'video-encoder', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['vr-recorder', 'video-encoder'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'Exporting VR experience as video is technical',
    platformSolution: 'One-click VR-to-video export',
    primaryProviders: ['three', 'ffmpeg'],
    requiredSecrets: [],
  },
  'panorama-to-vr': {
    pipeline: 'panorama-to-vr',
    stages: [
      { stage: 1, name: 'Panorama Processing', inputType: 'panorama', outputType: 'image', agent: 'panorama-processor', provider: 'three', models: ['equirectangular'] },
      { stage: 2, name: 'VR Scene Build', inputType: 'image', outputType: 'vr', agent: 'vr-panorama-agent', provider: 'aframe', models: ['a-frame'] },
    ],
    a2aRequired: false,
    tier: 'pro',
    agents: ['panorama-processor', 'vr-panorama-agent'],
    estimatedDurationSeconds: 60,
    customerPainPoint: '360 photos are hard to share immersively',
    platformSolution: 'Instant VR tour from 360 photos',
    primaryProviders: ['three', 'aframe'],
    requiredSecrets: [],
  },
  'floor-plan-to-vr': {
    pipeline: 'floor-plan-to-vr',
    stages: [
      { stage: 1, name: 'Floor Plan Analysis', inputType: 'image', outputType: 'text', agent: 'floor-plan-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: '3D Room Generation', inputType: 'text', outputType: '3d', agent: 'room-generator', provider: 'modelslab', models: ['meshy-ai'] },
      { stage: 3, name: 'VR Walkthrough', inputType: '3d', outputType: 'vr', agent: 'vr-builder', provider: 'aframe', models: ['a-frame'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['floor-plan-analyzer', 'room-generator', 'vr-builder'],
    estimatedDurationSeconds: 300,
    customerPainPoint: 'Architectural VR needs expensive software',
    platformSolution: 'Convert 2D floor plan to VR walkthrough',
    primaryProviders: ['google', 'modelslab', 'aframe'],
    requiredSecrets: ['GEMINI_API_KEY', 'MODELSLAB_API_KEY'],
  },

  // ============ COMPLEX MULTI-MODAL PIPELINES ============
  'auto-record-to-avatar': {
    pipeline: 'auto-record-to-avatar',
    stages: [
      { stage: 1, name: 'Voice Recording', inputType: 'voice', outputType: 'audio', agent: 'voice-recorder', provider: 'browser', models: ['web-audio-api'] },
      { stage: 2, name: 'Speech-to-Text', inputType: 'audio', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 3, name: 'Script Refinement', inputType: 'text', outputType: 'text', agent: 'script-enhancer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 4, name: 'Avatar Generation', inputType: 'audio', outputType: 'video', agent: 'avatar-generator', provider: 'heygen', models: ['heygen', 'd-id'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['voice-recorder', 'stt-agent', 'script-enhancer', 'avatar-generator'],
    estimatedDurationSeconds: 300,
    customerPainPoint: 'Creating avatar videos requires multiple tools',
    platformSolution: 'Record voice → instant avatar video',
    primaryProviders: ['browser', 'azure', 'openai', 'heygen'],
    requiredSecrets: ['AZURE_API_KEY', 'OPENAI_API_KEY'],
  },
  'auto-record-to-3d': {
    pipeline: 'auto-record-to-3d',
    stages: [
      { stage: 1, name: 'Voice Recording', inputType: 'voice', outputType: 'audio', agent: 'voice-recorder', provider: 'browser', models: ['web-audio-api'] },
      { stage: 2, name: 'Speech-to-Text', inputType: 'audio', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 3, name: '3D Scene Description', inputType: 'text', outputType: 'text', agent: 'scene-descriptor', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 4, name: '3D Generation', inputType: 'text', outputType: '3d', agent: 'mesh-generator', provider: 'modelslab', models: ['meshy-ai', 'rodin-gen1'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['voice-recorder', 'stt-agent', 'scene-descriptor', 'mesh-generator'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'Describing 3D via text is imprecise',
    platformSolution: 'Voice-describe 3D model → AI creates it',
    primaryProviders: ['browser', 'azure', 'anthropic', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'auto-record-to-interactive': {
    pipeline: 'auto-record-to-interactive',
    stages: [
      { stage: 1, name: 'Voice Recording', inputType: 'voice', outputType: 'audio', agent: 'voice-recorder', provider: 'browser', models: ['web-audio-api'] },
      { stage: 2, name: 'Speech-to-Text', inputType: 'audio', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 3, name: 'Interactive Design', inputType: 'text', outputType: 'interactive', agent: 'interactive-generator', provider: 'react', models: ['react', 'd3'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['voice-recorder', 'stt-agent', 'interactive-generator'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'Prototyping interactive content is slow',
    platformSolution: 'Voice-describe form/quiz → AI builds it',
    primaryProviders: ['browser', 'azure', 'react'],
    requiredSecrets: ['AZURE_API_KEY'],
  },
  'auto-record-to-video': {
    pipeline: 'auto-record-to-video',
    stages: [
      { stage: 1, name: 'Voice Recording', inputType: 'voice', outputType: 'audio', agent: 'voice-recorder', provider: 'browser', models: ['web-audio-api'] },
      { stage: 2, name: 'Speech-to-Text', inputType: 'audio', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 3, name: 'Storyboard', inputType: 'text', outputType: 'image', agent: 'storyboard-agent', provider: 'openai', models: ['dall-e-3'] },
      { stage: 4, name: 'Video Assembly', inputType: 'image', outputType: 'video', agent: 'video-composer', provider: 'modelslab', models: ['animatediff-v2'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['voice-recorder', 'stt-agent', 'storyboard-agent', 'video-composer'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Video creation from ideas is multi-step',
    platformSolution: 'Speak your video idea → AI creates it',
    primaryProviders: ['browser', 'azure', 'openai', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'OPENAI_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'auto-record-to-vr': {
    pipeline: 'auto-record-to-vr',
    stages: [
      { stage: 1, name: 'Voice Recording', inputType: 'voice', outputType: 'audio', agent: 'voice-recorder', provider: 'browser', models: ['web-audio-api'] },
      { stage: 2, name: 'Speech-to-Text', inputType: 'audio', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 3, name: 'VR Scene Design', inputType: 'text', outputType: 'text', agent: 'vr-designer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 4, name: '3D Assets', inputType: 'text', outputType: '3d', agent: 'mesh-generator', provider: 'modelslab', models: ['meshy-ai'] },
      { stage: 5, name: 'VR Assembly', inputType: '3d', outputType: 'vr', agent: 'vr-assembler', provider: 'aframe', models: ['a-frame'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['voice-recorder', 'stt-agent', 'vr-designer', 'mesh-generator', 'vr-assembler'],
    estimatedDurationSeconds: 360,
    customerPainPoint: 'VR prototyping is too technical',
    platformSolution: 'Voice-describe VR world → AI builds it',
    primaryProviders: ['browser', 'azure', 'anthropic', 'modelslab', 'aframe'],
    requiredSecrets: ['AZURE_API_KEY', 'ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'multi-modal-mashup': {
    pipeline: 'multi-modal-mashup',
    stages: [
      { stage: 1, name: 'Multi-Input Analysis', inputType: 'document', outputType: 'text', agent: 'multi-modal-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Content Fusion', inputType: 'text', outputType: 'text', agent: 'content-fusion-agent', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Multi-Format Output', inputType: 'text', outputType: 'video', agent: 'multi-format-generator', provider: 'coordinator', models: ['a2a-coordinator'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['multi-modal-analyzer', 'content-fusion-agent', 'multi-format-generator'],
    estimatedDurationSeconds: 360,
    customerPainPoint: 'Combining multiple content types is fragmented',
    platformSolution: 'Upload multiple inputs → unified output',
    primaryProviders: ['google', 'anthropic'],
    requiredSecrets: ['GEMINI_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  'full-production-suite': {
    pipeline: 'full-production-suite',
    stages: [
      { stage: 1, name: 'Content Analysis', inputType: 'document', outputType: 'text', agent: 'content-analyzer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Script Generation', inputType: 'text', outputType: 'text', agent: 'script-generator', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Visual Assets', inputType: 'text', outputType: 'image', agent: 'image-generator', provider: 'modelslab', models: ['flux-pro'] },
      { stage: 4, name: 'Voice Synthesis', inputType: 'text', outputType: 'audio', agent: 'voice-generator', provider: 'elevenlabs', models: ['elevenlabs-v2'] },
      { stage: 5, name: 'Music Score', inputType: 'text', outputType: 'music', agent: 'music-generator', provider: 'elevenlabs', models: ['elevenlabs-music', 'google-lyria'] },
      { stage: 6, name: 'Video Composition', inputType: 'image', outputType: 'video', agent: 'video-composer', provider: 'modelslab', models: ['runway-gen3'] },
      { stage: 7, name: 'Multilingual Dubbing', inputType: 'video', outputType: 'video', agent: 'dubbing-agent', provider: 'elevenlabs', models: ['elevenlabs-dubbing'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['content-analyzer', 'script-generator', 'image-generator', 'voice-generator', 'music-generator', 'video-composer', 'dubbing-agent'],
    estimatedDurationSeconds: 900,
    customerPainPoint: 'Full video production requires entire team',
    platformSolution: 'One-click complete video production pipeline',
    primaryProviders: ['anthropic', 'openai', 'modelslab', 'elevenlabs', 'google'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'MODELSLAB_API_KEY', 'ELEVENLABS_API_KEY'],
  },

  // ============ SPECIALIZED PIPELINES ============
  'avatar-video-dubbing': {
    pipeline: 'avatar-video-dubbing',
    stages: [
      { stage: 1, name: 'Audio Extraction', inputType: 'video', outputType: 'audio', agent: 'audio-extractor', provider: 'ffmpeg', models: ['ffmpeg'] },
      { stage: 2, name: 'Transcription', inputType: 'audio', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 3, name: 'Translation', inputType: 'text', outputType: 'text', agent: 'translator-agent', provider: 'deepl', models: ['deepl-pro'] },
      { stage: 4, name: 'Voice Clone Dub', inputType: 'text', outputType: 'audio', agent: 'voice-cloner', provider: 'elevenlabs', models: ['voice-clone'] },
      { stage: 5, name: 'Lip Sync', inputType: 'audio', outputType: 'video', agent: 'lipsync-agent', provider: 'modelslab', models: ['wav2lip'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['audio-extractor', 'stt-agent', 'translator-agent', 'voice-cloner', 'lipsync-agent'],
    estimatedDurationSeconds: 480,
    customerPainPoint: 'Professional dubbing costs thousands per minute',
    platformSolution: 'AI voice cloning + lip-sync dubbing',
    primaryProviders: ['ffmpeg', 'azure', 'deepl', 'elevenlabs', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'DEEPL_API_KEY', 'ELEVENLABS_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'lip-sync-multilingual': {
    pipeline: 'lip-sync-multilingual',
    stages: [
      { stage: 1, name: 'Audio Transcription', inputType: 'audio', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 2, name: 'Multi-Language Translation', inputType: 'text', outputType: 'text', agent: 'translator-agent', provider: 'deepl', models: ['deepl-pro', 'qwen-mt', 'azure-translator'] },
      { stage: 3, name: 'Multi-Voice Synthesis', inputType: 'text', outputType: 'audio', agent: 'multi-voice-agent', provider: 'elevenlabs', models: ['elevenlabs-v2', 'azure-neural', 'cosyvoice'] },
      { stage: 4, name: 'Lip Sync All', inputType: 'audio', outputType: 'video', agent: 'batch-lipsync-agent', provider: 'modelslab', models: ['wav2lip'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['stt-agent', 'translator-agent', 'multi-voice-agent', 'batch-lipsync-agent'],
    estimatedDurationSeconds: 600,
    customerPainPoint: 'Need content in 10+ languages with lip-sync',
    platformSolution: 'One-click multilingual lip-sync dubbing',
    primaryProviders: ['azure', 'deepl', 'elevenlabs', 'alibaba', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'DEEPL_API_KEY', 'ELEVENLABS_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'vfx-composite': {
    pipeline: 'vfx-composite',
    stages: [
      { stage: 1, name: 'Scene Segmentation', inputType: 'video', outputType: 'image', agent: 'segmentation-agent', provider: 'replicate', models: ['sam-2'] },
      { stage: 2, name: 'VFX Generation', inputType: 'text', outputType: 'vfx', agent: 'vfx-generator', provider: 'modelslab', models: ['pika-effects', 'runway-gen3'] },
      { stage: 3, name: 'Composite Render', inputType: 'vfx', outputType: 'video', agent: 'compositor', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['segmentation-agent', 'vfx-generator', 'compositor'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'VFX compositing needs After Effects expertise',
    platformSolution: 'AI-powered VFX layer compositing',
    primaryProviders: ['replicate', 'modelslab', 'runway', 'ffmpeg'],
    requiredSecrets: ['REPLICATE_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'sfx-scene-audio': {
    pipeline: 'sfx-scene-audio',
    stages: [
      { stage: 1, name: 'Scene Analysis', inputType: 'video', outputType: 'text', agent: 'scene-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'SFX Matching', inputType: 'text', outputType: 'text', agent: 'sfx-matcher', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'SFX Generation', inputType: 'text', outputType: 'sfx', agent: 'sfx-generator', provider: 'elevenlabs', models: ['elevenlabs-sfx'] },
      { stage: 4, name: 'Audio Mix', inputType: 'audio', outputType: 'audio', agent: 'audio-mixer', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['scene-analyzer', 'sfx-matcher', 'sfx-generator', 'audio-mixer'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'Finding and syncing SFX is tedious',
    platformSolution: 'AI analyzes video and adds perfect SFX',
    primaryProviders: ['google', 'openai', 'elevenlabs', 'ffmpeg'],
    requiredSecrets: ['GEMINI_API_KEY', 'OPENAI_API_KEY', 'ELEVENLABS_API_KEY'],
  },
  'music-score-generation': {
    pipeline: 'music-score-generation',
    stages: [
      { stage: 1, name: 'Scene Mood Analysis', inputType: 'video', outputType: 'text', agent: 'mood-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Music Composition', inputType: 'text', outputType: 'music', agent: 'music-composer', provider: 'elevenlabs', models: ['elevenlabs-music', 'google-lyria', 'alibaba-funaudio'] },
      { stage: 3, name: 'Audio Sync', inputType: 'music', outputType: 'audio', agent: 'music-sync-agent', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['mood-analyzer', 'music-composer', 'music-sync-agent'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'Custom music for video is expensive',
    platformSolution: 'AI composes scene-matched original music',
    primaryProviders: ['google', 'elevenlabs', 'alibaba', 'ffmpeg'],
    requiredSecrets: ['GEMINI_API_KEY', 'ELEVENLABS_API_KEY'],
  },
  'spatial-audio-3d': {
    pipeline: 'spatial-audio-3d',
    stages: [
      { stage: 1, name: '3D Scene Mapping', inputType: '3d', outputType: 'text', agent: '3d-mapper', provider: 'three', models: ['three.js'] },
      { stage: 2, name: 'Spatial Audio Design', inputType: 'text', outputType: 'text', agent: 'spatial-audio-designer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Binaural Render', inputType: 'audio', outputType: 'audio', agent: 'binaural-agent', provider: 'resonance', models: ['resonance-audio', 'ambisonics'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['3d-mapper', 'spatial-audio-designer', 'binaural-agent'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Spatial audio needs specialized knowledge',
    platformSolution: 'Auto-generate 3D positioned audio for VR',
    primaryProviders: ['three', 'openai', 'google'],
    requiredSecrets: ['OPENAI_API_KEY'],
  },

  // ============================================================================
  // ═══ PRESENTATION PIPELINES (5 types) ═══
  // ============================================================================
  'idea-to-presentation': {
    pipeline: 'idea-to-presentation',
    stages: [
      { stage: 1, name: 'Idea Expansion', inputType: 'text', outputType: 'text', agent: 'content-strategist', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Structure Generation', inputType: 'text', outputType: 'text', agent: 'slide-structurer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Visual Design', inputType: 'text', outputType: 'image', agent: 'slide-designer', provider: 'modelslab', models: ['flux-pro'] },
      { stage: 4, name: 'Deck Assembly', inputType: 'image', outputType: 'slides', agent: 'deck-assembler', provider: 'google', models: ['google-slides-api'] },
    ],
    a2aRequired: true,
    tier: 'starter',
    agents: ['content-strategist', 'slide-structurer', 'slide-designer', 'deck-assembler'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Starting from a blank slide deck is daunting',
    platformSolution: 'Describe your idea, get complete branded slide deck',
    primaryProviders: ['openai', 'anthropic', 'modelslab', 'google'],
    requiredSecrets: ['OPENAI_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'document-to-presentation': {
    pipeline: 'document-to-presentation',
    stages: [
      { stage: 1, name: 'Document OCR', inputType: 'document', outputType: 'text', agent: 'ocr-agent', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Key Point Extraction', inputType: 'text', outputType: 'text', agent: 'summarizer-agent', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Slide Generation', inputType: 'text', outputType: 'image', agent: 'slide-designer', provider: 'modelslab', models: ['flux-pro'] },
      { stage: 4, name: 'Deck Branding', inputType: 'image', outputType: 'slides', agent: 'brand-agent', provider: 'internal', models: ['brand-system'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['ocr-agent', 'summarizer-agent', 'slide-designer', 'brand-agent'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'Manually extracting slides from Word/PDF is tedious',
    platformSolution: 'Upload document → branded presentation instantly',
    primaryProviders: ['azure', 'anthropic', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'data-to-presentation': {
    pipeline: 'data-to-presentation',
    stages: [
      { stage: 1, name: 'Data Analysis', inputType: 'document', outputType: 'text', agent: 'data-analyst', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Chart Generation', inputType: 'text', outputType: 'image', agent: 'chart-generator', provider: 'recharts', models: ['recharts', 'd3'] },
      { stage: 3, name: 'Insight Narration', inputType: 'text', outputType: 'text', agent: 'insight-narrator', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 4, name: 'Deck Assembly', inputType: 'image', outputType: 'slides', agent: 'deck-assembler', provider: 'google', models: ['google-slides-api'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['data-analyst', 'chart-generator', 'insight-narrator', 'deck-assembler'],
    estimatedDurationSeconds: 200,
    customerPainPoint: 'Data visualization decks require analyst expertise',
    platformSolution: 'Upload spreadsheet → data story presentation',
    primaryProviders: ['openai', 'anthropic', 'recharts'],
    requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  'brand-to-templates': {
    pipeline: 'brand-to-templates',
    stages: [
      { stage: 1, name: 'Brand Analysis', inputType: 'document', outputType: 'text', agent: 'brand-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Color/Font Extraction', inputType: 'image', outputType: 'text', agent: 'style-extractor', provider: 'deepseek', models: ['deepseek-vl'] },
      { stage: 3, name: 'Template Generation', inputType: 'text', outputType: 'slides', agent: 'template-generator', provider: 'internal', models: ['template-engine'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['brand-analyzer', 'style-extractor', 'template-generator'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Creating on-brand templates requires designer',
    platformSolution: 'Upload brand guidelines → custom template library',
    primaryProviders: ['google', 'deepseek'],
    requiredSecrets: ['GEMINI_API_KEY'],
  },
  'presentation-to-video': {
    pipeline: 'presentation-to-video',
    stages: [
      { stage: 1, name: 'Slide Analysis', inputType: 'document', outputType: 'text', agent: 'slide-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Script Generation', inputType: 'text', outputType: 'text', agent: 'script-generator', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Voiceover', inputType: 'text', outputType: 'audio', agent: 'voice-generator', provider: 'elevenlabs', models: ['elevenlabs-v2'] },
      { stage: 4, name: 'Animation + Sync', inputType: 'slides', outputType: 'video', agent: 'video-composer', provider: 'ffmpeg', models: ['ffmpeg', 'lottie'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['slide-analyzer', 'script-generator', 'voice-generator', 'video-composer'],
    estimatedDurationSeconds: 300,
    customerPainPoint: 'Recording presentation videos takes hours',
    platformSolution: 'Upload deck → narrated video with animations',
    primaryProviders: ['google', 'openai', 'elevenlabs', 'ffmpeg'],
    requiredSecrets: ['GEMINI_API_KEY', 'OPENAI_API_KEY', 'ELEVENLABS_API_KEY'],
  },

  // ============================================================================
  // ═══ VIDEO PRODUCTION PIPELINES (5 types) ═══
  // ============================================================================
  'script-to-talking-head': {
    pipeline: 'script-to-talking-head',
    stages: [
      { stage: 1, name: 'Script Enhancement', inputType: 'text', outputType: 'text', agent: 'script-enhancer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Avatar Selection', inputType: 'text', outputType: 'text', agent: 'avatar-selector', provider: 'heygen', models: ['heygen'] },
      { stage: 3, name: 'Video Generation', inputType: 'text', outputType: 'video', agent: 'avatar-generator', provider: 'heygen', models: ['heygen', 'd-id'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['script-enhancer', 'avatar-selector', 'avatar-generator'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'Filming talking head videos requires studio setup',
    platformSolution: 'Write script → professional AI avatar video',
    primaryProviders: ['openai', 'heygen', 'd-id'],
    requiredSecrets: ['OPENAI_API_KEY'],
  },
  'text-to-full-video': {
    pipeline: 'text-to-full-video',
    stages: [
      { stage: 1, name: 'Script Expansion', inputType: 'text', outputType: 'text', agent: 'video-scripter', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Storyboard', inputType: 'text', outputType: 'image', agent: 'storyboard-agent', provider: 'modelslab', models: ['flux-pro'] },
      { stage: 3, name: 'Voiceover', inputType: 'text', outputType: 'audio', agent: 'voice-generator', provider: 'elevenlabs', models: ['elevenlabs-v2'] },
      { stage: 4, name: 'Music Score', inputType: 'text', outputType: 'music', agent: 'music-composer', provider: 'elevenlabs', models: ['elevenlabs-music', 'google-lyria'] },
      { stage: 5, name: 'Video Assembly', inputType: 'image', outputType: 'video', agent: 'video-composer', provider: 'modelslab', models: ['animatediff-v2'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['video-scripter', 'storyboard-agent', 'voice-generator', 'music-composer', 'video-composer'],
    estimatedDurationSeconds: 480,
    customerPainPoint: 'Full video production needs entire team',
    platformSolution: 'Describe idea → complete video with visuals/voice/music',
    primaryProviders: ['anthropic', 'modelslab', 'elevenlabs', 'google'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY', 'ELEVENLABS_API_KEY'],
  },
  'clone-to-personalized': {
    pipeline: 'clone-to-personalized',
    stages: [
      { stage: 1, name: 'Voice Clone Training', inputType: 'audio', outputType: 'audio', agent: 'voice-cloner', provider: 'elevenlabs', models: ['voice-clone'] },
      { stage: 2, name: 'Avatar Training', inputType: 'video', outputType: 'video', agent: 'avatar-trainer', provider: 'heygen', models: ['heygen-clone'] },
      { stage: 3, name: 'Batch Generation', inputType: 'text', outputType: 'video', agent: 'batch-video-agent', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['voice-cloner', 'avatar-trainer', 'batch-video-agent'],
    estimatedDurationSeconds: 600,
    customerPainPoint: 'Personalizing videos at scale is impossible',
    platformSolution: 'Clone yourself → generate thousands of personalized videos',
    primaryProviders: ['elevenlabs', 'heygen'],
    requiredSecrets: ['ELEVENLABS_API_KEY'],
  },

  // ============================================================================
  // ═══ CONTENT REPURPOSING PIPELINES (5 types) ═══
  // ============================================================================
  'long-to-short-clips': {
    pipeline: 'long-to-short-clips',
    stages: [
      { stage: 1, name: 'Highlight Detection', inputType: 'video', outputType: 'text', agent: 'highlight-detector', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Clip Extraction', inputType: 'video', outputType: 'video', agent: 'clip-extractor', provider: 'ffmpeg', models: ['ffmpeg'] },
      { stage: 3, name: 'Viral Score', inputType: 'video', outputType: 'text', agent: 'viral-scorer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 4, name: 'Caption Overlay', inputType: 'video', outputType: 'video', agent: 'caption-agent', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['highlight-detector', 'clip-extractor', 'viral-scorer', 'caption-agent'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Manually clipping long videos for TikTok is hours of work',
    platformSolution: 'Upload podcast → auto-generate TikTok/Reels/Shorts',
    primaryProviders: ['google', 'ffmpeg', 'openai'],
    requiredSecrets: ['GEMINI_API_KEY', 'OPENAI_API_KEY'],
  },
  'video-to-blog': {
    pipeline: 'video-to-blog',
    stages: [
      { stage: 1, name: 'Transcription', inputType: 'video', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 2, name: 'Blog Formatting', inputType: 'text', outputType: 'text', agent: 'blog-writer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'SEO Optimization', inputType: 'text', outputType: 'text', agent: 'seo-agent', provider: 'openai', models: ['gpt-4o'] },
      { stage: 4, name: 'Image Selection', inputType: 'text', outputType: 'image', agent: 'image-selector', provider: 'modelslab', models: ['flux-pro'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['stt-agent', 'blog-writer', 'seo-agent', 'image-selector'],
    estimatedDurationSeconds: 200,
    customerPainPoint: 'Transcribing videos to blogs is manual drudgery',
    platformSolution: 'Upload video → SEO-optimized blog post with images',
    primaryProviders: ['azure', 'anthropic', 'openai', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'podcast-to-video': {
    pipeline: 'podcast-to-video',
    stages: [
      { stage: 1, name: 'Audio Analysis', inputType: 'audio', outputType: 'text', agent: 'audio-analyzer', provider: 'azure', models: ['whisper'] },
      { stage: 2, name: 'Visual Generation', inputType: 'text', outputType: 'image', agent: 'visualizer-agent', provider: 'modelslab', models: ['flux-pro'] },
      { stage: 3, name: 'Waveform/Captions', inputType: 'audio', outputType: 'video', agent: 'waveform-agent', provider: 'ffmpeg', models: ['ffmpeg'] },
      { stage: 4, name: 'Video Assembly', inputType: 'image', outputType: 'video', agent: 'video-composer', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['audio-analyzer', 'visualizer-agent', 'waveform-agent', 'video-composer'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'Podcasts are audio-only, missing visual engagement',
    platformSolution: 'Upload audio → dynamic video with visuals/captions',
    primaryProviders: ['azure', 'modelslab', 'ffmpeg'],
    requiredSecrets: ['AZURE_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'blog-to-video': {
    pipeline: 'blog-to-video',
    stages: [
      { stage: 1, name: 'Content Parsing', inputType: 'text', outputType: 'text', agent: 'content-parser', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Script Adaptation', inputType: 'text', outputType: 'text', agent: 'script-adapter', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Visual Generation', inputType: 'text', outputType: 'image', agent: 'image-generator', provider: 'modelslab', models: ['flux-pro'] },
      { stage: 4, name: 'Voiceover', inputType: 'text', outputType: 'audio', agent: 'voice-generator', provider: 'elevenlabs', models: ['elevenlabs-v2'] },
      { stage: 5, name: 'Video Assembly', inputType: 'image', outputType: 'video', agent: 'video-composer', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['content-parser', 'script-adapter', 'image-generator', 'voice-generator', 'video-composer'],
    estimatedDurationSeconds: 300,
    customerPainPoint: 'Repurposing blogs to video is manual process',
    platformSolution: 'Paste blog URL → explainer video summary',
    primaryProviders: ['anthropic', 'openai', 'modelslab', 'elevenlabs'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'MODELSLAB_API_KEY', 'ELEVENLABS_API_KEY'],
  },
  'webinar-to-clips-deck': {
    pipeline: 'webinar-to-clips-deck',
    stages: [
      { stage: 1, name: 'Webinar Analysis', inputType: 'video', outputType: 'text', agent: 'webinar-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Key Moments', inputType: 'text', outputType: 'video', agent: 'moment-extractor', provider: 'ffmpeg', models: ['ffmpeg'] },
      { stage: 3, name: 'Slide Generation', inputType: 'text', outputType: 'image', agent: 'slide-designer', provider: 'modelslab', models: ['flux-pro'] },
      { stage: 4, name: 'Deck Assembly', inputType: 'image', outputType: 'slides', agent: 'deck-assembler', provider: 'google', models: ['google-slides-api'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['webinar-analyzer', 'moment-extractor', 'slide-designer', 'deck-assembler'],
    estimatedDurationSeconds: 360,
    customerPainPoint: 'Webinar recordings sit unused after live event',
    platformSolution: 'Upload webinar → highlight clips + presentation deck',
    primaryProviders: ['google', 'ffmpeg', 'modelslab'],
    requiredSecrets: ['GEMINI_API_KEY', 'MODELSLAB_API_KEY'],
  },

  // ============================================================================
  // ═══ TRAINING & L&D PIPELINES (4 types) ═══
  // ============================================================================
  'course-to-interactive': {
    pipeline: 'course-to-interactive',
    stages: [
      { stage: 1, name: 'Content Analysis', inputType: 'document', outputType: 'text', agent: 'instructional-designer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Module Structure', inputType: 'text', outputType: 'text', agent: 'course-structurer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Quiz Generation', inputType: 'text', outputType: 'interactive', agent: 'quiz-generator', provider: 'react', models: ['react'] },
      { stage: 4, name: 'Video Segments', inputType: 'text', outputType: 'video', agent: 'training-video-agent', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['instructional-designer', 'course-structurer', 'quiz-generator', 'training-video-agent'],
    estimatedDurationSeconds: 420,
    customerPainPoint: 'Creating interactive training is expensive',
    platformSolution: 'Upload course docs → interactive modules with quizzes',
    primaryProviders: ['anthropic', 'openai', 'react', 'heygen'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY'],
  },
  'sop-to-training': {
    pipeline: 'sop-to-training',
    stages: [
      { stage: 1, name: 'SOP Parsing', inputType: 'document', outputType: 'text', agent: 'sop-parser', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Step Breakdown', inputType: 'text', outputType: 'text', agent: 'step-analyzer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Visual Demonstration', inputType: 'text', outputType: 'video', agent: 'demo-generator', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['sop-parser', 'step-analyzer', 'demo-generator'],
    estimatedDurationSeconds: 300,
    customerPainPoint: 'SOPs are text-heavy and ignored by staff',
    platformSolution: 'Upload SOP → step-by-step video training',
    primaryProviders: ['azure', 'anthropic', 'heygen'],
    requiredSecrets: ['AZURE_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  'compliance-to-certification': {
    pipeline: 'compliance-to-certification',
    stages: [
      { stage: 1, name: 'Compliance Mapping', inputType: 'document', outputType: 'text', agent: 'compliance-mapper', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Module Design', inputType: 'text', outputType: 'interactive', agent: 'scorm-builder', provider: 'react', models: ['scorm-package'] },
      { stage: 3, name: 'Assessment Generation', inputType: 'text', outputType: 'interactive', agent: 'assessment-agent', provider: 'react', models: ['react'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['compliance-mapper', 'scorm-builder', 'assessment-agent'],
    estimatedDurationSeconds: 360,
    customerPainPoint: 'SCORM-compliant modules need specialized tools',
    platformSolution: 'Upload compliance docs → SCORM certification modules',
    primaryProviders: ['anthropic', 'react'],
    requiredSecrets: ['ANTHROPIC_API_KEY'],
  },
  'onboarding-to-personalized': {
    pipeline: 'onboarding-to-personalized',
    stages: [
      { stage: 1, name: 'Role Analysis', inputType: 'text', outputType: 'text', agent: 'onboarding-designer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Personalization', inputType: 'text', outputType: 'text', agent: 'personalization-agent', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Welcome Video', inputType: 'text', outputType: 'video', agent: 'avatar-generator', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['onboarding-designer', 'personalization-agent', 'avatar-generator'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Generic onboarding doesn\'t engage new hires',
    platformSolution: 'Enter role → personalized welcome video journey',
    primaryProviders: ['openai', 'anthropic', 'heygen'],
    requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  },

  // ============================================================================
  // ═══ MARKETING & ADVERTISING PIPELINES (5 types) ═══
  // ============================================================================
  'product-to-demo': {
    pipeline: 'product-to-demo',
    stages: [
      { stage: 1, name: 'Product Analysis', inputType: 'image', outputType: 'text', agent: 'product-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Script Generation', inputType: 'text', outputType: 'text', agent: 'demo-scripter', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Visual Enhancement', inputType: 'image', outputType: 'video', agent: 'product-animator', provider: 'modelslab', models: ['animatediff-v2'] },
      { stage: 4, name: 'Voiceover', inputType: 'text', outputType: 'audio', agent: 'voice-generator', provider: 'elevenlabs', models: ['elevenlabs-v2'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['product-analyzer', 'demo-scripter', 'product-animator', 'voice-generator'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'Product demo videos need video team',
    platformSolution: 'Upload screenshots → professional demo video',
    primaryProviders: ['google', 'openai', 'modelslab', 'elevenlabs'],
    requiredSecrets: ['GEMINI_API_KEY', 'OPENAI_API_KEY', 'MODELSLAB_API_KEY', 'ELEVENLABS_API_KEY'],
  },
  'brief-to-ad-creative': {
    pipeline: 'brief-to-ad-creative',
    stages: [
      { stage: 1, name: 'Brief Expansion', inputType: 'text', outputType: 'text', agent: 'creative-director', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Multi-Format Design', inputType: 'text', outputType: 'image', agent: 'ad-designer', provider: 'modelslab', models: ['flux-pro'] },
      { stage: 3, name: 'Copy Variants', inputType: 'text', outputType: 'text', agent: 'copywriter', provider: 'openai', models: ['gpt-4o'] },
      { stage: 4, name: 'Video Ads', inputType: 'image', outputType: 'video', agent: 'video-ad-agent', provider: 'modelslab', models: ['animatediff-v2'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['creative-director', 'ad-designer', 'copywriter', 'video-ad-agent'],
    estimatedDurationSeconds: 300,
    customerPainPoint: 'Campaign creatives need agency or designer',
    platformSolution: 'Submit brief → multi-format ad variants (static + video)',
    primaryProviders: ['anthropic', 'modelslab', 'openai'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY', 'OPENAI_API_KEY'],
  },
  'brand-to-ugc-ads': {
    pipeline: 'brand-to-ugc-ads',
    stages: [
      { stage: 1, name: 'Brand Voice Analysis', inputType: 'document', outputType: 'text', agent: 'brand-analyzer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'UGC Script', inputType: 'text', outputType: 'text', agent: 'ugc-scripter', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Avatar Testimonial', inputType: 'text', outputType: 'video', agent: 'ugc-avatar', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['brand-analyzer', 'ugc-scripter', 'ugc-avatar'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'Finding UGC creators is expensive and slow',
    platformSolution: 'Generate authentic-looking UGC-style testimonials',
    primaryProviders: ['anthropic', 'openai', 'heygen'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY'],
  },
  'landing-page-to-video': {
    pipeline: 'landing-page-to-video',
    stages: [
      { stage: 1, name: 'Page Capture', inputType: 'url', outputType: 'image', agent: 'page-capturer', provider: 'browser', models: ['puppeteer'] },
      { stage: 2, name: 'Content Extraction', inputType: 'image', outputType: 'text', agent: 'ocr-agent', provider: 'azure', models: ['form-recognizer'] },
      { stage: 3, name: 'Promo Script', inputType: 'text', outputType: 'text', agent: 'promo-scripter', provider: 'openai', models: ['gpt-4o'] },
      { stage: 4, name: 'Video Production', inputType: 'image', outputType: 'video', agent: 'promo-video-agent', provider: 'modelslab', models: ['animatediff-v2'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['page-capturer', 'ocr-agent', 'promo-scripter', 'promo-video-agent'],
    estimatedDurationSeconds: 200,
    customerPainPoint: 'Landing pages need separate video content',
    platformSolution: 'Paste URL → promotional video from page content',
    primaryProviders: ['browser', 'azure', 'openai', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'OPENAI_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'testimonial-to-video': {
    pipeline: 'testimonial-to-video',
    stages: [
      { stage: 1, name: 'Quote Enhancement', inputType: 'text', outputType: 'text', agent: 'quote-enhancer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Avatar Video', inputType: 'text', outputType: 'video', agent: 'testimonial-avatar', provider: 'heygen', models: ['heygen'] },
      { stage: 3, name: 'Brand Overlay', inputType: 'video', outputType: 'video', agent: 'brand-overlay-agent', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['quote-enhancer', 'testimonial-avatar', 'brand-overlay-agent'],
    estimatedDurationSeconds: 150,
    customerPainPoint: 'Getting customers to record testimonials is hard',
    platformSolution: 'Enter quotes → video testimonials with avatars',
    primaryProviders: ['anthropic', 'heygen', 'ffmpeg'],
    requiredSecrets: ['ANTHROPIC_API_KEY'],
  },

  // ============================================================================
  // ═══ SOCIAL MEDIA PIPELINES (4 types) ═══
  // ============================================================================
  'calendar-to-posts': {
    pipeline: 'calendar-to-posts',
    stages: [
      { stage: 1, name: 'Calendar Parsing', inputType: 'document', outputType: 'text', agent: 'calendar-parser', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Content Generation', inputType: 'text', outputType: 'text', agent: 'social-content-agent', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Visual Creation', inputType: 'text', outputType: 'image', agent: 'social-designer', provider: 'modelslab', models: ['flux-pro'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['calendar-parser', 'social-content-agent', 'social-designer'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Content calendar execution is daily grind',
    platformSolution: 'Upload calendar → ready-to-post content batch',
    primaryProviders: ['openai', 'anthropic', 'modelslab'],
    requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'video-to-platform-optimized': {
    pipeline: 'video-to-platform-optimized',
    stages: [
      { stage: 1, name: 'Platform Analysis', inputType: 'text', outputType: 'text', agent: 'platform-analyzer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Aspect Ratio Crop', inputType: 'video', outputType: 'video', agent: 'crop-agent', provider: 'ffmpeg', models: ['ffmpeg'] },
      { stage: 3, name: 'Platform Captions', inputType: 'video', outputType: 'video', agent: 'caption-agent', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'starter',
    agents: ['platform-analyzer', 'crop-agent', 'caption-agent'],
    estimatedDurationSeconds: 120,
    customerPainPoint: 'Each platform needs different video formats',
    platformSolution: 'One video → TikTok, Reels, Shorts, LinkedIn versions',
    primaryProviders: ['openai', 'ffmpeg'],
    requiredSecrets: ['OPENAI_API_KEY'],
  },
  'trend-to-viral-content': {
    pipeline: 'trend-to-viral-content',
    stages: [
      { stage: 1, name: 'Trend Analysis', inputType: 'text', outputType: 'text', agent: 'trend-analyzer', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Viral Script', inputType: 'text', outputType: 'text', agent: 'viral-scripter', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Quick Video', inputType: 'text', outputType: 'video', agent: 'quick-video-agent', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['trend-analyzer', 'viral-scripter', 'quick-video-agent'],
    estimatedDurationSeconds: 150,
    customerPainPoint: 'Jumping on trends requires speed',
    platformSolution: 'Enter trend → trend-aligned content in minutes',
    primaryProviders: ['openai', 'anthropic', 'heygen'],
    requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  'audio-to-music-video': {
    pipeline: 'audio-to-music-video',
    stages: [
      { stage: 1, name: 'Audio Analysis', inputType: 'audio', outputType: 'text', agent: 'music-analyzer', provider: 'elevenlabs', models: ['audio-analysis'] },
      { stage: 2, name: 'Visual Style', inputType: 'text', outputType: 'text', agent: 'visual-stylist', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Visualizer Generation', inputType: 'audio', outputType: 'video', agent: 'visualizer-agent', provider: 'modelslab', models: ['audio-reactive'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['music-analyzer', 'visual-stylist', 'visualizer-agent'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Music needs visual content for social',
    platformSolution: 'Upload track → music video/visualizer',
    primaryProviders: ['elevenlabs', 'anthropic', 'modelslab'],
    requiredSecrets: ['ELEVENLABS_API_KEY', 'ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },

  // ============================================================================
  // ═══ SALES ENABLEMENT PIPELINES (4 types) ═══
  // ============================================================================
  'proposal-to-video-pitch': {
    pipeline: 'proposal-to-video-pitch',
    stages: [
      { stage: 1, name: 'Proposal Analysis', inputType: 'document', outputType: 'text', agent: 'proposal-analyzer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Pitch Script', inputType: 'text', outputType: 'text', agent: 'pitch-scripter', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Video Pitch', inputType: 'text', outputType: 'video', agent: 'avatar-generator', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['proposal-analyzer', 'pitch-scripter', 'avatar-generator'],
    estimatedDurationSeconds: 200,
    customerPainPoint: 'Proposals get lost in inbox noise',
    platformSolution: 'Upload proposal → personalized video pitch',
    primaryProviders: ['anthropic', 'openai', 'heygen'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY'],
  },
  'demo-to-personalized': {
    pipeline: 'demo-to-personalized',
    stages: [
      { stage: 1, name: 'Demo Analysis', inputType: 'video', outputType: 'text', agent: 'demo-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Personalization Points', inputType: 'text', outputType: 'text', agent: 'personalization-agent', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Custom Intro/Outro', inputType: 'text', outputType: 'video', agent: 'avatar-generator', provider: 'heygen', models: ['heygen'] },
      { stage: 4, name: 'Video Merge', inputType: 'video', outputType: 'video', agent: 'video-merger', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['demo-analyzer', 'personalization-agent', 'avatar-generator', 'video-merger'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'Each prospect needs custom demo',
    platformSolution: 'One demo → prospect-specific versions',
    primaryProviders: ['google', 'openai', 'heygen', 'ffmpeg'],
    requiredSecrets: ['GEMINI_API_KEY', 'OPENAI_API_KEY'],
  },
  'crm-to-outreach-videos': {
    pipeline: 'crm-to-outreach-videos',
    stages: [
      { stage: 1, name: 'CRM Data Parse', inputType: 'document', outputType: 'text', agent: 'crm-parser', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Personalized Scripts', inputType: 'text', outputType: 'text', agent: 'outreach-scripter', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Batch Video Generation', inputType: 'text', outputType: 'video', agent: 'batch-video-agent', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['crm-parser', 'outreach-scripter', 'batch-video-agent'],
    estimatedDurationSeconds: 480,
    customerPainPoint: 'Personalized outreach at scale is impossible',
    platformSolution: 'Export CRM → 100+ personalized prospecting videos',
    primaryProviders: ['openai', 'anthropic', 'heygen'],
    requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  'battlecard-to-presentation': {
    pipeline: 'battlecard-to-presentation',
    stages: [
      { stage: 1, name: 'Battlecard Analysis', inputType: 'document', outputType: 'text', agent: 'battlecard-analyzer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Slide Design', inputType: 'text', outputType: 'image', agent: 'slide-designer', provider: 'modelslab', models: ['flux-pro'] },
      { stage: 3, name: 'Deck Assembly', inputType: 'image', outputType: 'slides', agent: 'deck-assembler', provider: 'google', models: ['google-slides-api'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['battlecard-analyzer', 'slide-designer', 'deck-assembler'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Competitive decks need frequent updates',
    platformSolution: 'Upload battlecard → sales battle deck',
    primaryProviders: ['anthropic', 'modelslab', 'google'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'MODELSLAB_API_KEY'],
  },

  // ============================================================================
  // ═══ CUSTOMER EDUCATION PIPELINES (4 types) ═══
  // ============================================================================
  'docs-to-help-videos': {
    pipeline: 'docs-to-help-videos',
    stages: [
      { stage: 1, name: 'Doc Parsing', inputType: 'document', outputType: 'text', agent: 'doc-parser', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Tutorial Script', inputType: 'text', outputType: 'text', agent: 'tutorial-scripter', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Tutorial Video', inputType: 'text', outputType: 'video', agent: 'tutorial-video-agent', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['doc-parser', 'tutorial-scripter', 'tutorial-video-agent'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'Help docs don\'t get read',
    platformSolution: 'Upload docs → video tutorial library',
    primaryProviders: ['azure', 'anthropic', 'heygen'],
    requiredSecrets: ['AZURE_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  'faq-to-video-library': {
    pipeline: 'faq-to-video-library',
    stages: [
      { stage: 1, name: 'FAQ Parsing', inputType: 'text', outputType: 'text', agent: 'faq-parser', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Answer Enhancement', inputType: 'text', outputType: 'text', agent: 'answer-enhancer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Video Answers', inputType: 'text', outputType: 'video', agent: 'faq-video-agent', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['faq-parser', 'answer-enhancer', 'faq-video-agent'],
    estimatedDurationSeconds: 300,
    customerPainPoint: 'Text FAQs have low engagement',
    platformSolution: 'Paste FAQ → video answer library',
    primaryProviders: ['openai', 'anthropic', 'heygen'],
    requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  'onboarding-to-welcome-flow': {
    pipeline: 'onboarding-to-welcome-flow',
    stages: [
      { stage: 1, name: 'Journey Mapping', inputType: 'text', outputType: 'text', agent: 'journey-mapper', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'Personalization', inputType: 'text', outputType: 'text', agent: 'personalization-agent', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Welcome Videos', inputType: 'text', outputType: 'video', agent: 'welcome-video-agent', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['journey-mapper', 'personalization-agent', 'welcome-video-agent'],
    estimatedDurationSeconds: 200,
    customerPainPoint: 'User onboarding is impersonal',
    platformSolution: 'Define journey → personalized video onboarding',
    primaryProviders: ['anthropic', 'openai', 'heygen'],
    requiredSecrets: ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY'],
  },
  'release-notes-to-update-video': {
    pipeline: 'release-notes-to-update-video',
    stages: [
      { stage: 1, name: 'Release Parsing', inputType: 'text', outputType: 'text', agent: 'release-parser', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Demo Script', inputType: 'text', outputType: 'text', agent: 'demo-scripter', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Announcement Video', inputType: 'text', outputType: 'video', agent: 'announcement-video-agent', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'starter',
    agents: ['release-parser', 'demo-scripter', 'announcement-video-agent'],
    estimatedDurationSeconds: 150,
    customerPainPoint: 'Release notes don\'t drive feature adoption',
    platformSolution: 'Paste changelog → feature announcement video',
    primaryProviders: ['openai', 'anthropic', 'heygen'],
    requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  },

  // ============================================================================
  // ═══ LOCALIZATION PIPELINES (3 types) ═══
  // ============================================================================
  'video-to-multilanguage': {
    pipeline: 'video-to-multilanguage',
    stages: [
      { stage: 1, name: 'Audio Extraction', inputType: 'video', outputType: 'audio', agent: 'audio-extractor', provider: 'ffmpeg', models: ['ffmpeg'] },
      { stage: 2, name: 'Transcription', inputType: 'audio', outputType: 'text', agent: 'stt-agent', provider: 'azure', models: ['whisper'] },
      { stage: 3, name: 'Translation', inputType: 'text', outputType: 'text', agent: 'translator-agent', provider: 'deepl', models: ['deepl-pro', 'qwen-mt'] },
      { stage: 4, name: 'Voice Dubbing', inputType: 'text', outputType: 'audio', agent: 'voice-generator', provider: 'elevenlabs', models: ['elevenlabs-dubbing'] },
      { stage: 5, name: 'Lip Sync', inputType: 'audio', outputType: 'video', agent: 'lipsync-agent', provider: 'modelslab', models: ['wav2lip'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['audio-extractor', 'stt-agent', 'translator-agent', 'voice-generator', 'lipsync-agent'],
    estimatedDurationSeconds: 600,
    customerPainPoint: 'Dubbing in 50+ languages costs millions',
    platformSolution: 'Upload video → dubbed in 50+ languages with lip-sync',
    primaryProviders: ['ffmpeg', 'azure', 'deepl', 'elevenlabs', 'modelslab'],
    requiredSecrets: ['AZURE_API_KEY', 'DEEPL_API_KEY', 'ELEVENLABS_API_KEY', 'MODELSLAB_API_KEY'],
  },
  'presentation-to-localized': {
    pipeline: 'presentation-to-localized',
    stages: [
      { stage: 1, name: 'Slide Extraction', inputType: 'document', outputType: 'text', agent: 'slide-extractor', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Translation', inputType: 'text', outputType: 'text', agent: 'translator-agent', provider: 'deepl', models: ['deepl-pro', 'qwen-mt', 'azure-translator'] },
      { stage: 3, name: 'Localized Deck', inputType: 'text', outputType: 'slides', agent: 'localized-deck-agent', provider: 'google', models: ['google-slides-api'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['slide-extractor', 'translator-agent', 'localized-deck-agent'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Translating presentations is tedious',
    platformSolution: 'Upload deck → localized versions in 50+ languages',
    primaryProviders: ['azure', 'deepl', 'google'],
    requiredSecrets: ['AZURE_API_KEY', 'DEEPL_API_KEY'],
  },
  'avatar-to-regional': {
    pipeline: 'avatar-to-regional',
    stages: [
      { stage: 1, name: 'Script Translation', inputType: 'text', outputType: 'text', agent: 'translator-agent', provider: 'deepl', models: ['deepl-pro', 'qwen-mt'] },
      { stage: 2, name: 'Native Voice', inputType: 'text', outputType: 'audio', agent: 'regional-voice-agent', provider: 'elevenlabs', models: ['elevenlabs-v2', 'azure-neural', 'cosyvoice'] },
      { stage: 3, name: 'Avatar Video', inputType: 'audio', outputType: 'video', agent: 'avatar-generator', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['translator-agent', 'regional-voice-agent', 'avatar-generator'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'Need native-sounding regional content',
    platformSolution: 'Enter script + language → native-looking regional avatar',
    primaryProviders: ['deepl', 'elevenlabs', 'alibaba', 'heygen'],
    requiredSecrets: ['DEEPL_API_KEY', 'ELEVENLABS_API_KEY'],
  },

  // ============================================================================
  // ═══ DATA & ANALYTICS PIPELINES (3 types) ═══
  // ============================================================================
  'data-to-dashboard-video': {
    pipeline: 'data-to-dashboard-video',
    stages: [
      { stage: 1, name: 'Data Analysis', inputType: 'document', outputType: 'text', agent: 'data-analyst', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Chart Generation', inputType: 'text', outputType: 'image', agent: 'chart-generator', provider: 'recharts', models: ['recharts', 'd3'] },
      { stage: 3, name: 'Narration Script', inputType: 'text', outputType: 'text', agent: 'data-narrator', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 4, name: 'Narrated Video', inputType: 'image', outputType: 'video', agent: 'data-video-agent', provider: 'ffmpeg', models: ['ffmpeg'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['data-analyst', 'chart-generator', 'data-narrator', 'data-video-agent'],
    estimatedDurationSeconds: 240,
    customerPainPoint: 'Dashboards don\'t tell the story',
    platformSolution: 'Upload data → narrated data story video',
    primaryProviders: ['openai', 'recharts', 'anthropic', 'ffmpeg'],
    requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  'report-to-executive-summary': {
    pipeline: 'report-to-executive-summary',
    stages: [
      { stage: 1, name: 'Report Parsing', inputType: 'document', outputType: 'text', agent: 'report-parser', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Executive Summary', inputType: 'text', outputType: 'text', agent: 'executive-summarizer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Summary Video', inputType: 'text', outputType: 'video', agent: 'summary-video-agent', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['report-parser', 'executive-summarizer', 'summary-video-agent'],
    estimatedDurationSeconds: 180,
    customerPainPoint: 'Execs don\'t read long reports',
    platformSolution: 'Upload report → 2-minute video summary for execs',
    primaryProviders: ['azure', 'anthropic', 'heygen'],
    requiredSecrets: ['AZURE_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  'survey-to-insights-video': {
    pipeline: 'survey-to-insights-video',
    stages: [
      { stage: 1, name: 'Survey Analysis', inputType: 'document', outputType: 'text', agent: 'survey-analyst', provider: 'openai', models: ['gpt-4o'] },
      { stage: 2, name: 'Insight Generation', inputType: 'text', outputType: 'text', agent: 'insight-generator', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Findings Presentation', inputType: 'text', outputType: 'video', agent: 'findings-video-agent', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['survey-analyst', 'insight-generator', 'findings-video-agent'],
    estimatedDurationSeconds: 200,
    customerPainPoint: 'Survey results need professional presentation',
    platformSolution: 'Upload results → findings video presentation',
    primaryProviders: ['openai', 'anthropic', 'heygen'],
    requiredSecrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  },

  // ============================================================================
  // ═══ INTERNAL COMMS PIPELINES (3 types) ═══
  // ============================================================================
  'announcement-to-video': {
    pipeline: 'announcement-to-video',
    stages: [
      { stage: 1, name: 'Announcement Enhancement', inputType: 'text', outputType: 'text', agent: 'announcement-enhancer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 2, name: 'CEO/Leadership Video', inputType: 'text', outputType: 'video', agent: 'leadership-avatar', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['announcement-enhancer', 'leadership-avatar'],
    estimatedDurationSeconds: 150,
    customerPainPoint: 'CEO can\'t record every announcement',
    platformSolution: 'Write announcement → AI CEO video message',
    primaryProviders: ['anthropic', 'heygen'],
    requiredSecrets: ['ANTHROPIC_API_KEY'],
  },
  'policy-to-training-video': {
    pipeline: 'policy-to-training-video',
    stages: [
      { stage: 1, name: 'Policy Parsing', inputType: 'document', outputType: 'text', agent: 'policy-parser', provider: 'azure', models: ['form-recognizer'] },
      { stage: 2, name: 'Training Script', inputType: 'text', outputType: 'text', agent: 'policy-trainer', provider: 'claude', models: ['claude-sonnet-4'] },
      { stage: 3, name: 'Explainer Video', inputType: 'text', outputType: 'video', agent: 'policy-video-agent', provider: 'heygen', models: ['heygen'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['policy-parser', 'policy-trainer', 'policy-video-agent'],
    estimatedDurationSeconds: 200,
    customerPainPoint: 'Policy documents don\'t get read',
    platformSolution: 'Upload policy → explainer video employees watch',
    primaryProviders: ['azure', 'anthropic', 'heygen'],
    requiredSecrets: ['AZURE_API_KEY', 'ANTHROPIC_API_KEY'],
  },
  'townhall-to-highlights': {
    pipeline: 'townhall-to-highlights',
    stages: [
      { stage: 1, name: 'Recording Analysis', inputType: 'video', outputType: 'text', agent: 'townhall-analyzer', provider: 'gemini', models: ['gemini-2.0-flash'] },
      { stage: 2, name: 'Key Moments', inputType: 'video', outputType: 'video', agent: 'moment-extractor', provider: 'ffmpeg', models: ['ffmpeg'] },
      { stage: 3, name: 'Q&A Summary', inputType: 'text', outputType: 'text', agent: 'qa-summarizer', provider: 'claude', models: ['claude-sonnet-4'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['townhall-analyzer', 'moment-extractor', 'qa-summarizer'],
    estimatedDurationSeconds: 300,
    customerPainPoint: 'Missed town halls mean missed info',
    platformSolution: 'Upload recording → key moments + Q&A summary',
    primaryProviders: ['google', 'ffmpeg', 'anthropic'],
    requiredSecrets: ['GEMINI_API_KEY', 'ANTHROPIC_API_KEY'],
  },

  // ============================================================================
  // ═══ LIVE & REAL-TIME PIPELINES (3 types) ═══
  // ============================================================================
  'avatar-to-live-stream': {
    pipeline: 'avatar-to-live-stream',
    stages: [
      { stage: 1, name: 'Real-time Input', inputType: 'text', outputType: 'text', agent: 'live-input-processor', provider: 'websocket', models: ['realtime-api'] },
      { stage: 2, name: 'Live Avatar Render', inputType: 'text', outputType: 'video', agent: 'live-avatar-agent', provider: 'heygen', models: ['heygen-streaming'] },
      { stage: 3, name: 'Stream Output', inputType: 'video', outputType: 'stream', agent: 'stream-agent', provider: 'rtmp', models: ['rtmp-server'] },
    ],
    a2aRequired: true,
    tier: 'enterprise',
    agents: ['live-input-processor', 'live-avatar-agent', 'stream-agent'],
    estimatedDurationSeconds: 0, // Real-time
    customerPainPoint: 'Live streaming requires being on camera',
    platformSolution: 'Type → live AI avatar stream to YouTube/Twitch',
    primaryProviders: ['websocket', 'heygen', 'rtmp'],
    requiredSecrets: [],
  },
  'webinar-to-interactive': {
    pipeline: 'webinar-to-interactive',
    stages: [
      { stage: 1, name: 'Live Presentation', inputType: 'slides', outputType: 'slides', agent: 'live-slide-agent', provider: 'browser', models: ['web-presenter'] },
      { stage: 2, name: 'Q&A Processing', inputType: 'text', outputType: 'text', agent: 'qa-agent', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Interactive Polls', inputType: 'text', outputType: 'interactive', agent: 'poll-agent', provider: 'react', models: ['react'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['live-slide-agent', 'qa-agent', 'poll-agent'],
    estimatedDurationSeconds: 0, // Real-time
    customerPainPoint: 'Webinars lack interactivity',
    platformSolution: 'Live presentation with AI-powered Q&A + polls',
    primaryProviders: ['browser', 'openai', 'react'],
    requiredSecrets: ['OPENAI_API_KEY'],
  },
  'meeting-to-summary': {
    pipeline: 'meeting-to-summary',
    stages: [
      { stage: 1, name: 'Live Transcription', inputType: 'audio', outputType: 'text', agent: 'live-stt-agent', provider: 'azure', models: ['azure-realtime-stt'] },
      { stage: 2, name: 'Action Item Detection', inputType: 'text', outputType: 'text', agent: 'action-detector', provider: 'openai', models: ['gpt-4o'] },
      { stage: 3, name: 'Meeting Summary', inputType: 'text', outputType: 'text', agent: 'summary-agent', provider: 'claude', models: ['claude-sonnet-4'] },
    ],
    a2aRequired: true,
    tier: 'pro',
    agents: ['live-stt-agent', 'action-detector', 'summary-agent'],
    estimatedDurationSeconds: 0, // Real-time
    customerPainPoint: 'Meeting notes are lost or incomplete',
    platformSolution: 'Live meeting → real-time notes + action items',
    primaryProviders: ['azure', 'openai', 'anthropic'],
    requiredSecrets: ['AZURE_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
  },
};

// ============================================
// PIPELINE CATEGORY REGISTRY (for UI grouping)
// ============================================
export const PIPELINE_CATEGORIES: Record<string, {
  displayName: string;
  description: string;
  pipelines: TransformationPipeline[];
  icon: string;
}> = {
  'presentation': {
    displayName: 'Presentation Pipelines',
    description: 'Create and transform presentations from any input',
    pipelines: ['idea-to-presentation', 'document-to-presentation', 'data-to-presentation', 'brand-to-templates', 'presentation-to-video'],
    icon: 'Presentation',
  },
  'video-production': {
    displayName: 'Video Production',
    description: 'Full video production from scripts to final output',
    pipelines: ['script-to-talking-head', 'text-to-full-video', 'clone-to-personalized', 'video-to-multilingual'],
    icon: 'Video',
  },
  'repurposing': {
    displayName: 'Content Repurposing',
    description: 'Transform content between formats',
    pipelines: ['long-to-short-clips', 'video-to-blog', 'podcast-to-video', 'blog-to-video', 'webinar-to-clips-deck'],
    icon: 'RefreshCw',
  },
  'training': {
    displayName: 'Training & L&D',
    description: 'Create training content and certification modules',
    pipelines: ['course-to-interactive', 'sop-to-training', 'compliance-to-certification', 'onboarding-to-personalized'],
    icon: 'GraduationCap',
  },
  'marketing': {
    displayName: 'Marketing & Advertising',
    description: 'Generate marketing content and ad creatives',
    pipelines: ['product-to-demo', 'brief-to-ad-creative', 'brand-to-ugc-ads', 'landing-page-to-video', 'testimonial-to-video'],
    icon: 'Megaphone',
  },
  'social': {
    displayName: 'Social Media',
    description: 'Optimize and create social media content',
    pipelines: ['calendar-to-posts', 'video-to-platform-optimized', 'trend-to-viral-content', 'audio-to-music-video'],
    icon: 'Share2',
  },
  'sales': {
    displayName: 'Sales Enablement',
    description: 'Create personalized sales content at scale',
    pipelines: ['proposal-to-video-pitch', 'demo-to-personalized', 'crm-to-outreach-videos', 'battlecard-to-presentation'],
    icon: 'Target',
  },
  'customer-ed': {
    displayName: 'Customer Education',
    description: 'Create help content and onboarding flows',
    pipelines: ['docs-to-help-videos', 'faq-to-video-library', 'onboarding-to-welcome-flow', 'release-notes-to-update-video'],
    icon: 'BookOpen',
  },
  'localization': {
    displayName: 'Localization',
    description: 'Translate and localize content globally',
    pipelines: ['video-to-multilanguage', 'presentation-to-localized', 'avatar-to-regional'],
    icon: 'Globe',
  },
  'data-analytics': {
    displayName: 'Data & Analytics',
    description: 'Visualize and narrate data stories',
    pipelines: ['data-to-dashboard-video', 'report-to-executive-summary', 'survey-to-insights-video'],
    icon: 'BarChart3',
  },
  'internal-comms': {
    displayName: 'Internal Comms',
    description: 'Create internal communications and announcements',
    pipelines: ['announcement-to-video', 'policy-to-training-video', 'townhall-to-highlights'],
    icon: 'Building2',
  },
  'live-realtime': {
    displayName: 'Live & Real-Time',
    description: 'Real-time streaming and meeting automation',
    pipelines: ['avatar-to-live-stream', 'webinar-to-interactive', 'meeting-to-summary'],
    icon: 'Radio',
  },
  // Original technical pipelines
  'text-transformations': {
    displayName: 'Text Transformations',
    description: 'Transform text to visual/audio outputs',
    pipelines: ['text-to-image', 'text-to-video', 'text-to-3d', 'text-to-animation', 'text-to-avatar', 'text-to-vr'],
    icon: 'FileText',
  },
  'image-transformations': {
    displayName: 'Image Transformations',
    description: 'Transform images to advanced outputs',
    pipelines: ['image-to-video', 'image-to-3d', 'image-to-animation', 'image-to-ar', 'image-to-vfx'],
    icon: 'Image',
  },
  'voice-audio': {
    displayName: 'Voice & Audio',
    description: 'Voice-driven content creation',
    pipelines: ['voice-to-animation', 'voice-to-avatar', 'voice-to-3d', 'voice-to-video', 'voice-to-vr', 'audio-to-animation', 'audio-to-vfx'],
    icon: 'Mic',
  },
  'document-pipelines': {
    displayName: 'Document Pipelines',
    description: 'Transform documents to rich media',
    pipelines: ['ppt-to-video', 'ppt-to-animation', 'ppt-to-interactive', 'ppt-to-3d', 'ppt-to-vr', 'document-to-video', 'document-to-slides', 'document-to-interactive', 'pdf-to-video', 'pdf-to-interactive'],
    icon: 'FileText',
  },
  'video-transformations': {
    displayName: 'Video Transformations',
    description: 'Transform videos to advanced formats',
    pipelines: ['video-to-avatar', 'video-to-3d', 'video-to-animation', 'video-to-interactive', 'video-to-vr', 'video-to-vfx'],
    icon: 'Film',
  },
  '3d-immersive': {
    displayName: '3D & Immersive',
    description: '3D, VR, and AR pipelines',
    pipelines: ['3d-to-video', '3d-to-animation', '3d-to-vr', '3d-to-ar', '3d-to-interactive', 'scene-to-vr', 'scene-to-ar', 'panorama-to-vr', 'floor-plan-to-vr'],
    icon: 'Box',
  },
  'auto-record': {
    displayName: 'Auto Record',
    description: 'Voice recording to content pipelines',
    pipelines: ['auto-record-to-avatar', 'auto-record-to-3d', 'auto-record-to-interactive', 'auto-record-to-video', 'auto-record-to-animation', 'auto-record-to-vr'],
    icon: 'Mic2',
  },
  'production-suite': {
    displayName: 'Full Production Suite',
    description: 'End-to-end production pipelines',
    pipelines: ['full-production-suite', 'avatar-video-dubbing', 'lip-sync-multilingual', 'vfx-composite', 'sfx-scene-audio', 'music-score-generation', 'spatial-audio-3d'],
    icon: 'Clapperboard',
  },
};

// Helper: Get pipeline config
export function getPipelineConfig(pipeline: TransformationPipeline): TransformationPipelineConfig | null {
  return TRANSFORMATION_PIPELINE_ROUTING[pipeline] || null;
}

// Helper: Get pipelines by tier
export function getPipelinesByTier(tier: GlobalTierLevel): TransformationPipeline[] {
  const tierOrder: GlobalTierLevel[] = ['free', 'starter', 'pro', 'enterprise'];
  const tierIndex = tierOrder.indexOf(tier);
  
  return (Object.entries(TRANSFORMATION_PIPELINE_ROUTING) as [TransformationPipeline, TransformationPipelineConfig][])
    .filter(([_, config]) => tierOrder.indexOf(config.tier) <= tierIndex)
    .map(([pipeline]) => pipeline);
}

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
  
  // Transformation pipeline selection
  transformationPipeline?: TransformationPipeline;
  transformationConfig?: {
    sourceType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'voice';
    targetType: 'image' | 'video' | '3d' | 'animation' | 'interactive' | 'avatar';
    includeVoiceover?: boolean;
    include3D?: boolean;
    includeInteractive?: boolean;
  };
  
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
