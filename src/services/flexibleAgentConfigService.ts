/**
 * Flexible Agent Configuration Service
 * 
 * Provides system-suggested defaults with user override capabilities.
 * Integrates full context: industry, segment, framework, visual features, output types.
 * Supports Single, Agentic AI, and A2A architecture modes.
 */

import { 
  AGENT_CATALOG, 
  AgentConfig, 
  AgentArchitectureType,
  AGENT_TYPES 
} from '@/components/genie-studio/presentation-generator/AgentArchitecture';
import {
  TEXT_PROVIDERS,
  IMAGE_PROVIDERS,
  VIDEO_PROVIDERS,
  VOICE_PROVIDERS,
  TRANSLATION_PROVIDERS,
  AIProviderOption,
} from '@/components/genie-studio/presentation-generator/constants/aiProviderConstants';

// ============================================
// TYPES & INTERFACES
// ============================================

/**
 * Global Tier Alignment:
 * - 'standard' (Tier-1): Cost-effective, fast models (1.0x credits)
 * - 'advanced' (Tier-2): Balanced quality & speed (2.5x credits)
 * - 'premium' (Tier-3): Maximum quality (5.0x credits)
 */
export type GlobalTierLevel = 'standard' | 'advanced' | 'premium';

// Mapping between provider tier naming and global tier naming
export const TIER_MAPPING: Record<string, GlobalTierLevel> = {
  'tier-1': 'standard',
  'tier-2': 'advanced',
  'tier-3': 'premium',
};

export const CREDIT_MULTIPLIERS: Record<GlobalTierLevel, number> = {
  'standard': 1.0,
  'advanced': 2.5,
  'premium': 5.0,
};

/**
 * Complete Generation Context with ALL sub-options for A2A orchestration
 * Includes: Content Types, Output Formats (100+ sub-options), Frameworks, Visual Features
 */
export interface GenerationContext {
  // ==========================================
  // CONTENT TYPE & COLLATERAL (Multi-select)
  // ==========================================
  industry?: string;
  segment?: string;
  contentCategory?: string; // 'ai-generated' | 'narrative' | 'business' | 'training' | etc.
  contentType?: string;
  collateralType?: string;
  selectedContentTypes?: string[]; // Multi-select: ['investor-pitch', 'case-study']
  
  // ==========================================
  // DESIGN TEMPLATES & BRANDING
  // ==========================================
  selectedTemplateId?: string;
  templateCategory?: string;
  templateStyle?: 'pure-consulting' | 'consulting-hybrid' | 'industry-focused' | 
                  'creative-narrative' | 'data-analytical' | 'educational' | 
                  'investor-pitch' | 'storytelling' | 'mixed-adaptive';
  customBranding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    accentColor?: string;
  };
  
  // ==========================================
  // FRAMEWORK CATEGORIES & FRAMEWORKS (Multi-select)
  // ==========================================
  selectedFrameworkCategories?: string[]; // ['tier1-strategy', 'healthcare', 'agile']
  selectedFrameworks?: string[]; // ['swot', 'porter-five', 'patient-journey']
  frameworkCategories?: string[]; // Legacy support
  frameworkType?: 'consulting' | 'methodology' | 'industry' | 'regional';
  
  // ==========================================
  // VISUAL FEATURES WITH SUB-OPTIONS (100+ options)
  // ==========================================
  visualFeatures?: Array<{ 
    featureId: string;          // 'charts', 'infographics', '3d-objects'
    subOptions: string[];       // ['bar-chart', 'pie-chart', 'radar-chart']
    tier?: GlobalTierLevel;
    category?: 'data' | 'structure' | 'media' | '3d-ar' | 'interactive' | 'layout';
  }>;
  visualFeatureCount?: number;
  totalSubOptionsSelected?: number;
  
  // ==========================================
  // OUTPUT FORMATS WITH SUB-OPTIONS (Multi-select, Tiered)
  // ==========================================
  outputTypes?: string[]; // Multi-select: ['pdf-export', 'video-full']
  primaryOutputType?: string;
  outputFormat?: 'static' | 'video' | 'interactive' | '3d' | 'immersive';
  
  // Output Format Sub-Options (100+ options across tiers)
  outputSubOptions?: Array<{
    outputTypeId: string;       // 'video-full', '3d-animated', 'vr-experience'
    subOptions: string[];       // Specific sub-options per output type
    tier: 1 | 2 | 3;
    category: 'document' | 'static' | 'animated' | 'video' | '3d' | 'interactive' | 'immersive';
    models: {                   // Model selection per output type
      imageModels?: string[];
      videoModels?: string[];
      mesh3dModels?: string[];
      voiceModels?: string[];
    };
    requirements?: {
      requiresVoice?: boolean;
      requires3D?: boolean;
      requiresVideo?: boolean;
    };
  }>;
  
  // Immersive Output Sub-Options (Premium Tier 3)
  immersiveOptions?: {
    vrEnabled?: boolean;
    vrSubOptions?: ('360-content' | 'spatial-audio' | 'hand-tracking' | 'teleportation')[];
    arEnabled?: boolean;
    arSubOptions?: ('marker-ar' | 'markerless-ar' | 'face-filter' | 'product-viz' | 'ar-portal')[];
    mixedRealityEnabled?: boolean;
    avatarOptions?: {
      aiAvatarEnabled?: boolean;
      avatarType?: 'realistic' | 'stylized' | 'cartoon' | '3d-mesh';
      lipSyncEnabled?: boolean;
      expressionsEnabled?: boolean;
    };
  };
  
  resolution?: '720p' | '1080p' | '4k';
  aspectRatio?: '16:9' | '4:3' | '9:16' | '1:1' | '21:9';
  
  // ==========================================
  // LANGUAGE CONTEXT
  // ==========================================
  primaryLanguage?: string;
  targetLanguages?: string[];
  enableRTL?: boolean;
  enableCJK?: boolean;
  
  // ==========================================
  // CONTENT STRUCTURE (Multi-select)
  // ==========================================
  slideCount?: number;
  chapterCount?: number;
  structureMode?: 'flat' | 'chapters' | 'scenes';
  slidesPerChapter?: number;
  
  // Content Structure Sub-Options
  contentStructure?: {
    includeInfographics?: boolean;
    includeJourneyMaps?: boolean;
    includeCharts?: boolean;
    includeTables?: boolean;
    includeTimelines?: boolean;
    includeDiagrams?: boolean;
    includeQuotes?: boolean;
    include3DElements?: boolean;
    includeInteractiveElements?: boolean;
    includeAnimations?: boolean;
  };
  
  // ==========================================
  // A2A & AGENTIC AI CONFIGURATION
  // ==========================================
  agentArchitecture?: 'single' | 'agentic' | 'a2a';
  enableParallelExecution?: boolean;
  maxConcurrentAgents?: number;
  
  // A2A-specific routing for complex outputs
  a2aRouting?: {
    enableCoordinator?: boolean;
    enableEnhancer?: boolean;
    enableQualityChecker?: boolean;
    enableMultiModelComparison?: boolean;
    fallbackStrategy?: 'sequential' | 'parallel' | 'best-of-n';
  };
  
  // ==========================================
  // GLOBAL TIER & TOKEN CONSUMPTION
  // ==========================================
  globalTier?: GlobalTierLevel;
  
  // Token/Credit Estimation Context
  estimatedTokens?: number;
  estimatedCredits?: number;
  creditMultiplier?: number;
  
  // Model Selection Mode
  modelSelectionMode?: 'ai-auto' | 'user-override' | 'multi-select';
  selectedModels?: {
    textModels?: string[];
    imageModels?: string[];
    videoModels?: string[];
    voiceModels?: string[];
    translationModels?: string[];
    mesh3dModels?: string[];
  };
}

export interface ProviderRecommendation {
  provider: string;
  model: string;
  reason: string;
  confidence: number;
  fallbacks: string[];
  tier: 'tier-1' | 'tier-2' | 'tier-3';
  isSystemSuggested: boolean;
}

export interface AgentProviderConfig {
  agentType: string;
  systemSuggested: ProviderRecommendation;
  userOverride?: ProviderRecommendation;
  effectiveProvider: ProviderRecommendation;
  availableProviders: AIProviderOption[];
  mode: 'ai-auto' | 'user-override' | 'multi-select';
}

export interface FlexibleAgentConfig {
  architectureType: AgentArchitectureType;
  agentConfigs: Record<string, AgentProviderConfig>;
  enabledAgents: string[];
  parallelExecution: boolean;
  maxConcurrentAgents: number;
  context: GenerationContext;
  userPreferences: UserProviderPreferences;
}

export interface UserProviderPreferences {
  preferredTextProvider?: string;
  preferredImageProvider?: string;
  preferredVideoProvider?: string;
  preferredVoiceProvider?: string;
  preferredTranslationProvider?: string;
  qualityVsSpeed?: 'quality' | 'balanced' | 'speed';
  costSensitivity?: 'low' | 'medium' | 'high';
  preferCJKProviders?: boolean;
  preferEuropeanProviders?: boolean;
}

// ============================================
// INDUSTRY-BASED PROVIDER ROUTING
// ============================================

const INDUSTRY_PROVIDER_ROUTING: Record<string, {
  textProvider: string;
  imageProvider: string;
  reason: string;
}> = {
  // Healthcare
  'healthcare': { textProvider: 'claude-3-opus', imageProvider: 'dall-e-3', reason: 'Medical accuracy & compliance' },
  'pharma': { textProvider: 'claude-3-opus', imageProvider: 'dall-e-3', reason: 'Regulatory precision' },
  'biotech': { textProvider: 'gemini-2.5-pro', imageProvider: 'stability-sdxl', reason: 'Scientific visualization' },
  
  // Finance & Legal
  'finance': { textProvider: 'claude-3-opus', imageProvider: 'dall-e-3', reason: 'Compliance & accuracy' },
  'banking': { textProvider: 'azure-gpt-4o', imageProvider: 'dall-e-3', reason: 'Enterprise security' },
  'legal': { textProvider: 'claude-3-opus', imageProvider: 'dall-e-3', reason: 'Legal precision' },
  'insurance': { textProvider: 'claude-3-sonnet', imageProvider: 'modelslab-flux', reason: 'Policy accuracy' },
  
  // Technology
  'technology': { textProvider: 'gemini-3-flash', imageProvider: 'modelslab-flux', reason: 'Fast & innovative' },
  'saas': { textProvider: 'deepseek-v3', imageProvider: 'modelslab-flux', reason: 'Technical depth' },
  'cybersecurity': { textProvider: 'claude-3-opus', imageProvider: 'stability-sdxl', reason: 'Security focus' },
  'ai-ml': { textProvider: 'gemini-2.5-pro', imageProvider: 'modelslab-flux', reason: 'AI expertise' },
  
  // Creative & Marketing
  'marketing': { textProvider: 'gemini-3-flash', imageProvider: 'modelslab-flux', reason: 'Creative & fast' },
  'advertising': { textProvider: 'gpt-5', imageProvider: 'dall-e-3', reason: 'Creative excellence' },
  'media': { textProvider: 'gemini-3-flash', imageProvider: 'modelslab-flux', reason: 'Visual storytelling' },
  
  // Consulting
  'consulting': { textProvider: 'claude-3-opus', imageProvider: 'dall-e-3', reason: 'Strategic depth' },
  'strategy': { textProvider: 'claude-3-opus', imageProvider: 'stability-sdxl', reason: 'Analytical precision' },
  
  // Education & Non-Profit
  'education': { textProvider: 'gemini-2.5-pro', imageProvider: 'modelslab-realvis', reason: 'Educational clarity' },
  'non-profit': { textProvider: 'gemini-3-flash', imageProvider: 'stability-sdxl', reason: 'Cost-effective quality' },
  
  // Default
  'default': { textProvider: 'gemini-3-flash', imageProvider: 'modelslab-flux', reason: 'Universal balance' },
};

// ============================================
// FRAMEWORK-BASED PROVIDER ROUTING
// ============================================

const FRAMEWORK_PROVIDER_ROUTING: Record<string, {
  visualProvider: string;
  chartType: string;
  reason: string;
}> = {
  // Strategy Frameworks
  'swot': { visualProvider: 'modelslab-flux', chartType: 'quadrant', reason: '2x2 matrix visualization' },
  'porters-five-forces': { visualProvider: 'stability-sdxl', chartType: 'radar', reason: 'Force analysis' },
  'pestle': { visualProvider: 'modelslab-flux', chartType: 'hexagon', reason: '6-factor analysis' },
  'value-chain': { visualProvider: 'stability-sdxl', chartType: 'flow', reason: 'Process visualization' },
  'bcg-matrix': { visualProvider: 'modelslab-flux', chartType: 'quadrant', reason: 'Portfolio matrix' },
  'ansoff-matrix': { visualProvider: 'modelslab-flux', chartType: 'quadrant', reason: 'Growth strategies' },
  'balanced-scorecard': { visualProvider: 'stability-sdxl', chartType: 'dashboard', reason: 'Multi-metric' },
  
  // Default
  'default': { visualProvider: 'modelslab-flux', chartType: 'auto', reason: 'Context-adaptive' },
};

// ============================================
// OUTPUT FORMAT SUB-OPTION PROVIDER ROUTING
// Maps 100+ output sub-options to specialized models
// ============================================

const OUTPUT_SUBOPTION_PROVIDER_ROUTING: Record<string, {
  primaryProvider: string;
  models: string[];
  a2aRequired: boolean;
  tier: 1 | 2 | 3;
  reason: string;
}> = {
  // Document Tier (Tier 1)
  'pdf-export': { primaryProvider: 'jspdf', models: ['jspdf', 'pdfmake'], a2aRequired: false, tier: 1, reason: 'Static PDF generation' },
  'pptx-export': { primaryProvider: 'pptxgenjs', models: ['pptxgenjs'], a2aRequired: false, tier: 1, reason: 'PowerPoint export' },
  '2d-static': { primaryProvider: 'modelslab-flux', models: ['flux-pro', 'dall-e-3'], a2aRequired: false, tier: 1, reason: 'High-quality static images' },
  'print-ready': { primaryProvider: 'modelslab-flux', models: ['flux-pro', 'midjourney-v6'], a2aRequired: false, tier: 1, reason: 'Print-optimized output' },
  
  // Animated Tier (Tier 2)
  '2d-animated': { primaryProvider: 'modelslab-animatediff', models: ['animatediff-v2', 'framer-motion'], a2aRequired: true, tier: 2, reason: 'CSS/Framer animations' },
  'video-short': { primaryProvider: 'modelslab-video', models: ['animatediff-v2', 'pika-labs'], a2aRequired: true, tier: 2, reason: '5-15s video clips' },
  '3d-static': { primaryProvider: 'modelslab-3d', models: ['meshy-ai', 'triposr', 'shap-e'], a2aRequired: true, tier: 2, reason: 'Static 3D scenes' },
  'web-embed': { primaryProvider: 'react', models: ['react', 'vue'], a2aRequired: false, tier: 2, reason: 'Embeddable widgets' },
  'social-media': { primaryProvider: 'modelslab-flux', models: ['flux-pro', 'dall-e-3'], a2aRequired: true, tier: 2, reason: 'Platform-optimized formats' },
  
  // Video Premium (Tier 3)
  'video-full': { primaryProvider: 'runway-gen3', models: ['openai-sora', 'runway-gen3', 'gemini-veo', 'luma-dream-machine'], a2aRequired: true, tier: 3, reason: 'Full video with narration' },
  
  // 3D Premium (Tier 3)
  '3d-animated': { primaryProvider: 'modelslab-3d', models: ['rodin-gen1', 'luma-genie', 'csm-3d'], a2aRequired: true, tier: 3, reason: '3D animations with physics' },
  
  // Interactive (Tier 3)
  'interactive': { primaryProvider: 'react', models: ['react', 'd3', 'three.js'], a2aRequired: true, tier: 3, reason: 'Interactive web apps' },
  
  // Immersive (Tier 3) - VR/AR/MR
  'vr-experience': { primaryProvider: 'aframe', models: ['aframe', 'three.js', 'babylon.js'], a2aRequired: true, tier: 3, reason: 'VR-ready 360° content' },
  'ar-overlay': { primaryProvider: 'modelslab-3d', models: ['meshy-ai', 'triposr', 'arcore'], a2aRequired: true, tier: 3, reason: 'AR overlay content' },
  'mixed-reality': { primaryProvider: 'runway-gen3', models: ['openai-sora', 'rodin-gen1', 'elevenlabs-ultra'], a2aRequired: true, tier: 3, reason: 'Multi-format adaptive' },
  
  // AI Avatar Video (Premium Tier 3)
  'ai-avatar-video': { primaryProvider: 'heygen', models: ['heygen', 'd-id', 'synthesia'], a2aRequired: true, tier: 3, reason: 'AI avatar generation' },
  'avatar-lipsync': { primaryProvider: 'modelslab-video', models: ['sadtalker', 'wav2lip'], a2aRequired: true, tier: 3, reason: 'Lip-sync animation' },
  'avatar-realistic': { primaryProvider: 'heygen', models: ['heygen-v2', 'd-id-v2'], a2aRequired: true, tier: 3, reason: 'Photorealistic avatars' },
  'avatar-3d-mesh': { primaryProvider: 'rodin-gen1', models: ['rodin-gen1', 'luma-genie'], a2aRequired: true, tier: 3, reason: '3D avatar meshes' },
};

// ============================================
// FRAMEWORK CATEGORY PROVIDER ROUTING
// ============================================

const FRAMEWORK_CATEGORY_ROUTING: Record<string, {
  visualProvider: string;
  layoutType: string;
  a2aRecommended: boolean;
}> = {
  // Consulting Styles
  'tier1-strategy': { visualProvider: 'stability-sdxl', layoutType: 'executive', a2aRecommended: true },
  'portfolio-analysis': { visualProvider: 'modelslab-flux', layoutType: 'matrix', a2aRecommended: true },
  'results-driven': { visualProvider: 'modelslab-flux', layoutType: 'dashboard', a2aRecommended: false },
  'universal': { visualProvider: 'modelslab-flux', layoutType: 'flexible', a2aRecommended: false },
  
  // Methodology Types
  'strategy': { visualProvider: 'stability-sdxl', layoutType: 'analytical', a2aRecommended: true },
  'innovation': { visualProvider: 'modelslab-flux', layoutType: 'creative', a2aRecommended: true },
  'agile': { visualProvider: 'gemini-imagen', layoutType: 'sprint', a2aRecommended: false },
  
  // Industry-Specific
  'healthcare': { visualProvider: 'dall-e-3', layoutType: 'compliant', a2aRecommended: true },
  'fintech': { visualProvider: 'stability-sdxl', layoutType: 'secure', a2aRecommended: true },
  'saas': { visualProvider: 'modelslab-flux', layoutType: 'metric', a2aRecommended: false },
  'retail': { visualProvider: 'modelslab-flux', layoutType: 'visual', a2aRecommended: false },
  'manufacturing': { visualProvider: 'stability-sdxl', layoutType: 'process', a2aRecommended: true },
  
  // Regional
  'apac': { visualProvider: 'alibaba-wanx', layoutType: 'cultural', a2aRecommended: true },
  'emea': { visualProvider: 'stability-sdxl', layoutType: 'compliant', a2aRecommended: true },
  'americas': { visualProvider: 'modelslab-flux', layoutType: 'standard', a2aRecommended: false },
};

// ============================================
// CONTENT STRUCTURE AGENT ROUTING
// Maps structure options to required agents
// ============================================

const CONTENT_STRUCTURE_AGENT_REQUIREMENTS: Record<string, string[]> = {
  'includeInfographics': ['image_generator', 'enhancer'],
  'includeJourneyMaps': ['image_generator', 'content_analyzer'],
  'includeCharts': ['image_generator'],
  'includeTables': ['slide_generator'],
  'includeTimelines': ['image_generator'],
  'includeDiagrams': ['image_generator'],
  'includeQuotes': ['slide_generator'],
  'include3DElements': ['image_generator', 'mesh_generator'],
  'includeInteractiveElements': ['interactive_generator'],
  'includeAnimations': ['video_generator', 'animation_generator'],
};

// ============================================
// LANGUAGE-BASED PROVIDER ROUTING
// ============================================

const LANGUAGE_PROVIDER_ROUTING: Record<string, {
  textProvider: string;
  translationProvider: string;
  voiceProvider: string;
  reason: string;
}> = {
  // CJK Languages
  'zh': { textProvider: 'qwen-max', translationProvider: 'qwen-mt', voiceProvider: 'alibaba-tts', reason: 'Native CJK support' },
  'ja': { textProvider: 'qwen-max', translationProvider: 'qwen-mt', voiceProvider: 'alibaba-tts', reason: 'Japanese optimization' },
  'ko': { textProvider: 'qwen-max', translationProvider: 'qwen-mt', voiceProvider: 'google-tts', reason: 'Korean optimization' },
  
  // European Languages
  'de': { textProvider: 'claude-3-sonnet', translationProvider: 'deepl', voiceProvider: 'elevenlabs', reason: 'German precision' },
  'fr': { textProvider: 'claude-3-sonnet', translationProvider: 'deepl', voiceProvider: 'elevenlabs', reason: 'French nuance' },
  'es': { textProvider: 'claude-3-sonnet', translationProvider: 'deepl', voiceProvider: 'elevenlabs', reason: 'Spanish fluency' },
  'it': { textProvider: 'claude-3-sonnet', translationProvider: 'deepl', voiceProvider: 'elevenlabs', reason: 'Italian style' },
  'pt': { textProvider: 'claude-3-sonnet', translationProvider: 'deepl', voiceProvider: 'elevenlabs', reason: 'Portuguese variants' },
  
  // RTL Languages
  'ar': { textProvider: 'azure-gpt-4o', translationProvider: 'azure-translator', voiceProvider: 'azure-neural', reason: 'Arabic RTL support' },
  'he': { textProvider: 'azure-gpt-4o', translationProvider: 'azure-translator', voiceProvider: 'azure-neural', reason: 'Hebrew RTL support' },
  'fa': { textProvider: 'azure-gpt-4o', translationProvider: 'azure-translator', voiceProvider: 'azure-neural', reason: 'Persian RTL support' },
  
  // Indian Languages
  'hi': { textProvider: 'gemini-2.5-pro', translationProvider: 'google-translate', voiceProvider: 'google-tts', reason: 'Hindi understanding' },
  'bn': { textProvider: 'gemini-2.5-pro', translationProvider: 'google-translate', voiceProvider: 'google-tts', reason: 'Bengali support' },
  'ta': { textProvider: 'gemini-2.5-pro', translationProvider: 'nllb', voiceProvider: 'google-tts', reason: 'Tamil support' },
  
  // Default
  'en': { textProvider: 'gemini-3-flash', translationProvider: 'deepl', voiceProvider: 'elevenlabs', reason: 'Universal English' },
  'default': { textProvider: 'gemini-3-flash', translationProvider: 'gemini-translate', voiceProvider: 'elevenlabs', reason: 'Universal fallback' },
};

// ============================================
// FLEXIBLE AGENT CONFIG SERVICE
// ============================================

class FlexibleAgentConfigService {
  /**
   * Generate complete agent configuration based on context with system defaults
   */
  generateConfig(
    context: GenerationContext,
    userPreferences: UserProviderPreferences = {},
    architectureType: AgentArchitectureType = 'agentic'
  ): FlexibleAgentConfig {
    const agentConfigs: Record<string, AgentProviderConfig> = {};
    
    // Get enabled agents based on architecture
    const enabledAgents = this.getEnabledAgentsForArchitecture(architectureType, context);
    
    // Generate config for each agent
    for (const agentType of enabledAgents) {
      agentConfigs[agentType] = this.generateAgentProviderConfig(
        agentType,
        context,
        userPreferences
      );
    }
    
    return {
      architectureType,
      agentConfigs,
      enabledAgents,
      parallelExecution: architectureType !== 'single',
      maxConcurrentAgents: architectureType === 'a2a' ? 5 : 3,
      context,
      userPreferences,
    };
  }

  /**
   * Get enabled agents based on architecture type and context
   */
  private getEnabledAgentsForArchitecture(
    architectureType: AgentArchitectureType,
    context: GenerationContext
  ): string[] {
    switch (architectureType) {
      case 'single':
        return ['slide_generator'];
        
      case 'agentic':
        const agenticAgents: string[] = [
          'slide_generator',
          'image_generator',
        ];
        
        // Add translator if multiple languages
        if (context.targetLanguages && context.targetLanguages.length > 0) {
          agenticAgents.push('translator');
        }
        
        // Add enhancer if high-quality output needed
        if (context.outputFormat === 'video' || context.industry === 'consulting') {
          agenticAgents.push('enhancer');
        }
        
        return agenticAgents;
        
      case 'a2a':
        // Full A2A uses all agents
        return ['coordinator', 'slide_generator', 'image_generator', 'translator', 'content_analyzer', 'enhancer', 'voiceover'];
        
      default:
        return ['slide_generator', 'image_generator'];
    }
  }

  /**
   * Generate provider configuration for a single agent
   */
  private generateAgentProviderConfig(
    agentType: string,
    context: GenerationContext,
    userPreferences: UserProviderPreferences
  ): AgentProviderConfig {
    const agentConfig = AGENT_CATALOG[agentType as keyof typeof AGENT_CATALOG];
    const availableProviders = this.getAvailableProvidersForAgent(agentType);
    
    // Generate system suggestion based on context
    const systemSuggested = this.generateSystemSuggestion(
      agentType,
      context,
      userPreferences,
      availableProviders
    );
    
    // Check if user has an override
    const userOverride = this.getUserOverride(agentType, userPreferences);
    
    // Determine effective provider
    const effectiveProvider = userOverride || systemSuggested;
    const mode = userOverride ? 'user-override' : 'ai-auto';
    
    return {
      agentType,
      systemSuggested,
      userOverride,
      effectiveProvider,
      availableProviders,
      mode,
    };
  }

  /**
   * Generate system-suggested provider based on full context
   */
  private generateSystemSuggestion(
    agentType: string,
    context: GenerationContext,
    preferences: UserProviderPreferences,
    availableProviders: AIProviderOption[]
  ): ProviderRecommendation {
    let provider: string;
    let model: string;
    let reason: string;
    let fallbacks: string[] = [];
    let tier: 'tier-1' | 'tier-2' | 'tier-3' = 'tier-1';
    
    const industry = context.industry || 'default';
    const language = context.primaryLanguage || 'en';
    const outputFormat = context.outputFormat || 'static';
    
    switch (agentType) {
      case AGENT_TYPES.CONTENT_GENERATOR:
      case AGENT_TYPES.COORDINATOR:
        // Text generation - prioritize industry, then language
        const industryRouting = INDUSTRY_PROVIDER_ROUTING[industry] || INDUSTRY_PROVIDER_ROUTING['default'];
        const langRouting = LANGUAGE_PROVIDER_ROUTING[language] || LANGUAGE_PROVIDER_ROUTING['default'];
        
        // CJK languages override industry preference
        if (['zh', 'ja', 'ko'].includes(language)) {
          provider = langRouting.textProvider;
          reason = langRouting.reason;
        } else {
          provider = industryRouting.textProvider;
          reason = industryRouting.reason;
        }
        model = this.getModelForProvider(provider, 'text');
        fallbacks = ['gemini-3-flash', 'gpt-5', 'claude-3-sonnet'];
        break;
        
      case AGENT_TYPES.IMAGE_GENERATOR:
        // Image generation - check framework, then output format
        if (context.selectedFrameworks && context.selectedFrameworks.length > 0) {
          const framework = context.selectedFrameworks[0];
          const frameworkRouting = FRAMEWORK_PROVIDER_ROUTING[framework] || FRAMEWORK_PROVIDER_ROUTING['default'];
          provider = frameworkRouting.visualProvider;
          reason = frameworkRouting.reason;
        } else {
          // Use output sub-option routing for format-specific providers
          const outputRouting = OUTPUT_SUBOPTION_PROVIDER_ROUTING[context.primaryOutputType || 'pdf-export'] || 
                               OUTPUT_SUBOPTION_PROVIDER_ROUTING['pdf-export'];
          provider = outputRouting.primaryProvider;
          reason = outputRouting.reason;
        }
        model = this.getModelForProvider(provider, 'image');
        fallbacks = ['modelslab-flux', 'dall-e-3', 'stability-sdxl'];
        break;
        
      case AGENT_TYPES.TRANSLATOR:
        // Translation - language pair specific
        const transLangRouting = LANGUAGE_PROVIDER_ROUTING[language] || LANGUAGE_PROVIDER_ROUTING['default'];
        provider = transLangRouting.translationProvider;
        model = this.getModelForProvider(provider, 'translation');
        reason = transLangRouting.reason;
        fallbacks = ['deepl', 'google-translate', 'gemini-translate'];
        break;
        
      case AGENT_TYPES.VOICEOVER:
        // Voice - language specific
        const voiceLangRouting = LANGUAGE_PROVIDER_ROUTING[language] || LANGUAGE_PROVIDER_ROUTING['default'];
        provider = voiceLangRouting.voiceProvider;
        model = this.getModelForProvider(provider, 'voice');
        reason = voiceLangRouting.reason;
        fallbacks = ['elevenlabs', 'azure-neural', 'google-tts'];
        break;
        
      case AGENT_TYPES.ENHANCER:
        // Enhancement - prefer Claude for nuanced rewriting
        provider = 'claude-3-opus';
        model = 'claude-3-opus-20240229';
        reason = 'Superior rewriting & enhancement';
        fallbacks = ['gemini-2.5-pro', 'gpt-5'];
        break;
        
      case AGENT_TYPES.ANALYZER:
        // Analysis - fast & accurate
        provider = 'gemini-3-flash';
        model = 'gemini-3-flash';
        reason = 'Fast quality analysis';
        fallbacks = ['claude-3-sonnet', 'gpt-5-mini'];
        break;
        
      default:
        provider = 'gemini-3-flash';
        model = 'gemini-3-flash';
        reason = 'Universal default';
        fallbacks = ['gpt-5', 'claude-3-sonnet'];
    }
    
    // Apply quality vs speed preference
    if (preferences.qualityVsSpeed === 'speed') {
      // Swap to faster tier-2 options
      tier = 'tier-2';
      if (provider.includes('opus') || provider.includes('pro')) {
        provider = provider.replace('opus', 'sonnet').replace('pro', 'flash');
      }
    } else if (preferences.qualityVsSpeed === 'quality') {
      tier = 'tier-1';
    }
    
    // Calculate confidence based on context specificity
    const confidence = this.calculateConfidence(context, agentType);
    
    return {
      provider,
      model,
      reason,
      confidence,
      fallbacks,
      tier,
      isSystemSuggested: true,
    };
  }

  /**
   * Get user override if preferences specify a provider
   */
  private getUserOverride(
    agentType: string,
    preferences: UserProviderPreferences
  ): ProviderRecommendation | undefined {
    let preferredProvider: string | undefined;
    
    switch (agentType) {
      case AGENT_TYPES.CONTENT_GENERATOR:
      case AGENT_TYPES.COORDINATOR:
      case AGENT_TYPES.ENHANCER:
      case AGENT_TYPES.ANALYZER:
        preferredProvider = preferences.preferredTextProvider;
        break;
      case AGENT_TYPES.IMAGE_GENERATOR:
        preferredProvider = preferences.preferredImageProvider;
        break;
      case 'translator':
        preferredProvider = preferences.preferredTranslationProvider;
        break;
      case 'voiceover':
        preferredProvider = preferences.preferredVoiceProvider;
        break;
      case 'enhancer':
      case 'content_analyzer':
        preferredProvider = preferences.preferredTextProvider;
        break;
    }
    
    if (!preferredProvider) return undefined;
    
    const category = this.getAgentCategory(agentType);
    const model = this.getModelForProvider(preferredProvider, category);
    
    return {
      provider: preferredProvider,
      model,
      reason: 'User preference',
      confidence: 1.0,
      fallbacks: [],
      tier: 'tier-1',
      isSystemSuggested: false,
    };
  }

  /**
   * Get available providers for an agent type
   */
  private getAvailableProvidersForAgent(agentType: string): AIProviderOption[] {
    switch (agentType) {
      case AGENT_TYPES.CONTENT_GENERATOR:
      case AGENT_TYPES.COORDINATOR:
      case AGENT_TYPES.ENHANCER:
      case AGENT_TYPES.ANALYZER:
        return TEXT_PROVIDERS;
      case AGENT_TYPES.IMAGE_GENERATOR:
        return IMAGE_PROVIDERS;
      case AGENT_TYPES.TRANSLATOR:
        return TRANSLATION_PROVIDERS;
      case AGENT_TYPES.VOICEOVER:
        return VOICE_PROVIDERS;
      default:
        return TEXT_PROVIDERS;
    }
  }

  /**
   * Get model ID for a provider
   */
  private getModelForProvider(providerId: string, category: string): string {
    const modelMap: Record<string, string> = {
      // Text
      'gemini-3-flash': 'gemini-3-flash-preview',
      'gemini-2.5-pro': 'gemini-2.5-pro-preview',
      'gpt-5': 'gpt-5',
      'gpt-5-mini': 'gpt-5-mini',
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-5-sonnet-20241022',
      'deepseek-v3': 'deepseek-chat',
      'qwen-max': 'qwen-max',
      'azure-gpt-4o': 'gpt-4o',
      
      // Image
      'modelslab-flux': 'flux-pro',
      'dall-e-3': 'dall-e-3',
      'stability-sdxl': 'stable-diffusion-xl-1024-v1-0',
      'gemini-imagen': 'imagen-3',
      'modelslab-realvis': 'realvis-xl-v4',
      'alibaba-wanx': 'wanx-v1',
      
      // Translation
      'deepl': 'deepl-pro',
      'google-translate': 'google-nmt',
      'azure-translator': 'azure-translator-v3',
      'qwen-mt': 'qwen-mt',
      'gemini-translate': 'gemini-translation',
      'nllb': 'nllb-200',
      
      // Voice
      'elevenlabs': 'eleven-multilingual-v2',
      'azure-neural': 'azure-neural-tts',
      'google-tts': 'google-wavenet',
      'alibaba-tts': 'cosyvoice',
      'openai-tts': 'tts-1-hd',
      
      // Video
      'modelslab-video': 'animatediff-v2',
      'runway-gen3': 'gen-3-alpha',
      'pika-labs': 'pika-1.0',
    };
    
    return modelMap[providerId] || providerId;
  }

  /**
   * Get category for an agent type
   */
  private getAgentCategory(agentType: string): string {
    switch (agentType) {
      case AGENT_TYPES.IMAGE_GENERATOR:
        return 'image';
      case AGENT_TYPES.TRANSLATOR:
        return 'translation';
      case AGENT_TYPES.VOICEOVER:
        return 'voice';
      default:
        return 'text';
    }
  }

  /**
   * Calculate confidence score based on context specificity
   */
  private calculateConfidence(context: GenerationContext, agentType: string): number {
    let confidence = 0.7; // Base confidence
    
    // Industry specificity
    if (context.industry && context.industry !== 'default') {
      confidence += 0.1;
    }
    
    // Language specificity
    if (context.primaryLanguage && context.primaryLanguage !== 'en') {
      confidence += 0.05;
    }
    
    // Framework specificity
    if (context.selectedFrameworks && context.selectedFrameworks.length > 0) {
      confidence += 0.08;
    }
    
    // Output format specificity
    if (context.outputFormat && context.outputFormat !== 'static') {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 0.98);
  }

  /**
   * Apply user override to an existing config
   */
  applyUserOverride(
    config: FlexibleAgentConfig,
    agentType: string,
    overrideProvider: string,
    overrideModel?: string
  ): FlexibleAgentConfig {
    const agentConfig = config.agentConfigs[agentType];
    if (!agentConfig) return config;
    
    const category = this.getAgentCategory(agentType);
    const model = overrideModel || this.getModelForProvider(overrideProvider, category);
    
    const userOverride: ProviderRecommendation = {
      provider: overrideProvider,
      model,
      reason: 'User override',
      confidence: 1.0,
      fallbacks: [],
      tier: 'tier-1',
      isSystemSuggested: false,
    };
    
    return {
      ...config,
      agentConfigs: {
        ...config.agentConfigs,
        [agentType]: {
          ...agentConfig,
          userOverride,
          effectiveProvider: userOverride,
          mode: 'user-override',
        },
      },
    };
  }

  /**
   * Reset to system suggestion for an agent
   */
  resetToSystemSuggestion(
    config: FlexibleAgentConfig,
    agentType: string
  ): FlexibleAgentConfig {
    const agentConfig = config.agentConfigs[agentType];
    if (!agentConfig) return config;
    
    return {
      ...config,
      agentConfigs: {
        ...config.agentConfigs,
        [agentType]: {
          ...agentConfig,
          userOverride: undefined,
          effectiveProvider: agentConfig.systemSuggested,
          mode: 'ai-auto',
        },
      },
    };
  }

  /**
   * Get a summary of the current configuration
   */
  getConfigSummary(config: FlexibleAgentConfig): string {
    const parts: string[] = [];
    
    parts.push(`Architecture: ${config.architectureType.toUpperCase()}`);
    parts.push(`Agents: ${config.enabledAgents.length}`);
    
    const overrideCount = Object.values(config.agentConfigs).filter(c => c.mode === 'user-override').length;
    if (overrideCount > 0) {
      parts.push(`User Overrides: ${overrideCount}`);
    }
    
    // Add tier info
    if (config.context.globalTier) {
      parts.push(`Tier: ${config.context.globalTier.toUpperCase()}`);
    }
    
    return parts.join(' | ');
  }

  /**
   * Calculate estimated credits based on context and selected providers
   */
  calculateEstimatedCredits(config: FlexibleAgentConfig): {
    totalCredits: number;
    breakdown: Array<{ agent: string; credits: number; tier: string }>;
    tierMultiplier: number;
  } {
    const breakdown: Array<{ agent: string; credits: number; tier: string }> = [];
    let totalCredits = 0;
    
    const globalTier = config.context.globalTier || 'standard';
    const tierMultiplier = CREDIT_MULTIPLIERS[globalTier];
    
    const slideCount = config.context.slideCount || 10;
    const languageCount = (config.context.targetLanguages?.length || 0) + 1;
    const visualFeatureCount = config.context.visualFeatures?.length || 0;
    const totalSubOptions = config.context.totalSubOptionsSelected || 0;
    
    // Base credits per agent type
    const BASE_CREDITS: Record<string, number> = {
      'slide_generator': 100,
      'image_generator': 200,
      'translator': 50,
      'voiceover': 150,
      'enhancer': 75,
      'content_analyzer': 25,
      'coordinator': 50,
    };
    
    for (const agentType of config.enabledAgents) {
      const agentConfig = config.agentConfigs[agentType];
      const providerTier = agentConfig?.effectiveProvider.tier || 'tier-1';
      const providerMultiplier = CREDIT_MULTIPLIERS[TIER_MAPPING[providerTier] || 'standard'];
      
      let agentCredits = BASE_CREDITS[agentType] || 50;
      
      // Scale by slide count
      agentCredits *= slideCount / 10;
      
      // Scale by language count for translator
      if (agentType === 'translator') {
        agentCredits *= languageCount;
      }
      
      // Scale by visual features for image generator
      if (agentType === 'image_generator') {
        agentCredits += (visualFeatureCount * 20) + (totalSubOptions * 5);
      }
      
      // Apply provider tier multiplier
      agentCredits *= providerMultiplier;
      
      breakdown.push({
        agent: agentType,
        credits: Math.ceil(agentCredits),
        tier: providerTier,
      });
      
      totalCredits += agentCredits;
    }
    
    // Apply global tier multiplier
    totalCredits *= tierMultiplier;
    
    // Output format multiplier
    const outputMultipliers: Record<string, number> = {
      'static': 1.0,
      'interactive': 1.5,
      '3d': 3.0,
      'video': 4.0,
    };
    const outputFormat = config.context.outputFormat || 'static';
    totalCredits *= outputMultipliers[outputFormat] || 1.0;
    
    return {
      totalCredits: Math.ceil(totalCredits),
      breakdown,
      tierMultiplier,
    };
  }

  /**
   * Get tier recommendation based on context
   */
  getRecommendedTier(context: GenerationContext): {
    tier: GlobalTierLevel;
    reason: string;
    estimatedCredits: number;
  } {
    // High-stakes industries should use premium
    const premiumIndustries = ['healthcare', 'pharma', 'legal', 'finance', 'banking'];
    if (context.industry && premiumIndustries.includes(context.industry)) {
      return {
        tier: 'premium',
        reason: `${context.industry} requires maximum accuracy`,
        estimatedCredits: (context.slideCount || 10) * 50 * 5.0,
      };
    }
    
    // Complex output formats should use advanced+
    if (context.outputFormat === 'video' || context.outputFormat === '3d') {
      return {
        tier: 'advanced',
        reason: 'Complex output format benefits from quality providers',
        estimatedCredits: (context.slideCount || 10) * 50 * 2.5,
      };
    }
    
    // Many visual features should use advanced
    if ((context.visualFeatures?.length || 0) > 5) {
      return {
        tier: 'advanced',
        reason: 'Multiple visual features need quality image generation',
        estimatedCredits: (context.slideCount || 10) * 50 * 2.5,
      };
    }
    
    // Default to standard
    return {
      tier: 'standard',
      reason: 'Cost-effective for standard presentations',
      estimatedCredits: (context.slideCount || 10) * 50 * 1.0,
    };
  }
}

// Export singleton instance
export const flexibleAgentConfigService = new FlexibleAgentConfigService();

// Export types and service
export default FlexibleAgentConfigService;
