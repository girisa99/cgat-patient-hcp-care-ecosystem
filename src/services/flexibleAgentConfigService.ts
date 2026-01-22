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

export interface GenerationContext {
  // Content Context
  industry?: string;
  segment?: string;
  contentType?: string;
  collateralType?: string;
  
  // Framework & Visual Context
  selectedFrameworks?: string[];
  frameworkCategories?: string[];
  visualFeatures?: Array<{ featureId: string; subOptions: string[] }>;
  
  // Output Context
  outputTypes?: string[];
  outputFormat?: 'static' | 'video' | 'interactive' | '3d';
  
  // Language Context
  primaryLanguage?: string;
  targetLanguages?: string[];
  
  // Content Structure
  slideCount?: number;
  includeInfographics?: boolean;
  includeJourneyMaps?: boolean;
  includeCharts?: boolean;
  includeTables?: boolean;
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
// OUTPUT FORMAT PROVIDER ROUTING
// ============================================

const OUTPUT_FORMAT_PROVIDER_ROUTING: Record<string, {
  primaryProvider: string;
  enhancedProvider?: string;
  reason: string;
}> = {
  'static': { primaryProvider: 'modelslab-flux', reason: 'High-quality static images' },
  'video': { primaryProvider: 'modelslab-video', enhancedProvider: 'runway-gen3', reason: 'Motion graphics' },
  'interactive': { primaryProvider: 'gemini-imagen', reason: 'Dynamic elements' },
  '3d': { primaryProvider: 'replicate-3d', enhancedProvider: 'modelslab-3d', reason: '3D mesh generation' },
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
        return [AGENT_TYPES.CONTENT_GENERATOR];
        
      case 'agentic':
        const agenticAgents = [
          AGENT_TYPES.CONTENT_GENERATOR,
          AGENT_TYPES.IMAGE_GENERATOR,
        ];
        
        // Add translator if multiple languages
        if (context.targetLanguages && context.targetLanguages.length > 0) {
          agenticAgents.push(AGENT_TYPES.TRANSLATOR);
        }
        
        // Add enhancer if high-quality output needed
        if (context.outputFormat === 'video' || context.industry === 'consulting') {
          agenticAgents.push(AGENT_TYPES.ENHANCER);
        }
        
        return agenticAgents;
        
      case 'a2a':
        // Full A2A uses all agents
        return Object.values(AGENT_TYPES);
        
      default:
        return [AGENT_TYPES.CONTENT_GENERATOR, AGENT_TYPES.IMAGE_GENERATOR];
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
          const outputRouting = OUTPUT_FORMAT_PROVIDER_ROUTING[outputFormat] || OUTPUT_FORMAT_PROVIDER_ROUTING['static'];
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
    
    return parts.join(' | ');
  }
}

// Export singleton instance
export const flexibleAgentConfigService = new FlexibleAgentConfigService();

// Export types and service
export default FlexibleAgentConfigService;
