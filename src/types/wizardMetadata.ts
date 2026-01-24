/**
 * Wizard Metadata Types
 * 
 * Complete metadata structure capturing ALL wizard selections
 * for preservation in exports (PPTX, PDF, Video, etc.)
 * 
 * Principle: "What You Select is What You Get"
 * All UI selections → Generation → Export with full traceability
 */

// ============================================
// STEP 0: INPUT METADATA
// ============================================
export interface InputMetadata {
  inputType: 'text' | 'document' | 'image' | 'video' | 'audio' | 'url' | 'screen';
  inputLanguage: string;
  primaryLanguage: string;
  rawContentLength?: number;
  detectedTopic?: string;
  aiSuggestions?: string[];
  uploadedFileName?: string;
  processingTimestamp: string;
}

// ============================================
// STEP 1: CONFIGURATION METADATA
// ============================================
export interface ConfigurationMetadata {
  industry: string;
  industryLabel: string;
  segment: string;
  segmentLabel: string;
  contentTypes: string[];
  targetAudience?: string;
  complexity?: 'basic' | 'intermediate' | 'advanced';
}

// ============================================
// STEP 2: TEMPLATE & BRANDING METADATA
// ============================================
export interface TemplateMetadata {
  templateId: string;
  templateName: string;
  themeId: string;
  themeName: string;
  brandConfig: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    companyName?: string;
  };
  
  // Framework selection - MULTI-SELECT PRESERVED
  selectedFrameworkCategories: string[];
  selectedFrameworkCategoryLabels: string[]; // Human-readable names
  selectedFrameworkIds: string[];
  selectedFrameworkLabels: string[]; // Human-readable names
  
  // Visual Features - FULL MULTI-SELECT WITH ALL SUB-OPTIONS
  visualFeatures: Array<{
    featureId: string;
    featureName: string;
    category: string;
    tier: 'standard' | 'advanced' | 'premium';
    subOptions: string[];
    subOptionLabels: string[];
  }>;
  
  // Content Type Categories - MULTI-SELECT
  contentCategories: string[];
  contentCategoryLabels: string[];
  
  step2Mode: 'quick' | 'custom';
}

// ============================================
// STEP 3: OUTPUT CONFIGURATION METADATA
// ============================================
export interface OutputMetadata {
  outputType: string;
  outputTypes: string[]; // Multi-format support (animation, interactive, 3D, avatar, etc.)
  
  // Output format details - WYSIWYG
  outputFormats: Array<{
    formatId: string;
    formatName: string;
    category: 'static' | 'animated' | 'interactive' | 'immersive' | 'collaboration';
    tier: 'standard' | 'advanced' | 'premium';
  }>;
  
  structureMode: 'chapters' | 'flat';
  slideCount: number;
  chapterCount?: number;
  slidesPerChapter?: number;
  resolution?: '720p' | '1080p' | '4k';
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
  quality?: 'draft' | 'standard' | 'high' | 'ultra';
  
  // Avatar & 3D specific
  avatarEnabled?: boolean;
  avatarType?: 'standard' | 'full-body';
  avatarProvider?: string;
  meshEnabled?: boolean;
  mesh3DProvider?: string;
  
  // Animation specific
  animationType?: 'none' | 'basic' | 'advanced' | 'cinematic';
  transitionStyle?: string;
}

// ============================================
// STEP 4: AGENTS & LANGUAGES METADATA
// ============================================
export interface AgentMetadata {
  architectureType: 'single' | 'agentic';
  selectedAgentIds: string[];
  agentModelConfigs: Array<{
    agentKey: string;
    agentName?: string;
    enabled: boolean;
    model: string;
    provider?: string;
  }>;
  languageVoiceConfigs: Array<{
    languageCode: string;
    languageName?: string;
    voiceProvider: string;
    voiceId?: string;
    translationProvider?: string;
  }>;
  targetLanguages: string[];
}

// ============================================
// STEP 5: VOICE & MUSIC METADATA
// ============================================
export interface VoiceMetadata {
  voiceEnabled: boolean;
  voiceProvider: string;
  voiceId: string;
  voiceName?: string;
  speed?: number;
  pitch?: number;
  stability?: number;
  musicEnabled: boolean;
  musicTrack?: string;
  musicVolume?: number;
  musicGenre?: string;
}

// ============================================
// GENERATION CONTEXT METADATA
// ============================================
export interface GenerationMetadata {
  pipelineId: string;
  pipelineName: string;
  tier: 'standard' | 'advanced' | 'premium';
  
  // Text/LLM providers - CONTEXT AWARE
  llmProvider: string;
  llmModel: string;
  llmZone: string;
  llmReason: string; // Why this provider was selected
  
  // Translation providers - INCLUDING ALIBABA, DEEPSEEK
  translationProvider?: string;
  translationModel?: string;
  translationReason?: string;
  
  // Voice/Audio providers
  ttsProvider?: string;
  ttsVoiceId?: string;
  sttProvider?: string;
  
  // Image providers
  imageProvider?: string;
  imageModel?: string;
  
  // Video/Avatar providers
  videoProvider?: string;
  avatarProvider?: string;
  mesh3DProvider?: string;
  
  generatedAt: string;
  generationDurationMs?: number;
  creditsUsed?: number;
}

// ============================================
// PROVIDER ROUTING METADATA - FULL 4-ZONE SUPPORT
// ============================================
export interface ProviderRoutingMetadata {
  regionalBundle: string;
  regionalBundleName: string;
  llmZone: 'claude' | 'alibaba' | 'gemini' | 'fallback';
  llmZoneReason: string; // Why this zone was selected
  isRTL: boolean;
  isMoatLanguage: boolean;
  detectedCountry?: string;
  detectedLanguage?: string;
  
  // Full provider routing with reasons
  providers: {
    // Text/LLM - Regional routing
    llm: { 
      primary: string; 
      primaryModel: string;
      fallback: string; 
      fallbackModel: string;
      zone: string;
      reason: string;
    };
    // Translation - Language-pair routing (DeepL EU, Qwen-MT CJK, NLLB African)
    translation: { 
      primary: string; 
      fallback: string; 
      reason: string;
      supportedPairs: string[];
    };
    // TTS - Regional voices
    tts: { 
      primary: string; 
      fallback: string; 
      reason: string;
    };
    // STT - Language-specific
    stt: { 
      primary: string; 
      fallback: string; 
      reason: string;
    };
    // Image - Global (not regional)
    image: { 
      primary: string; 
      fallback: string;
      model: string;
    };
    // Video - Global
    video: { 
      primary: string; 
      fallback: string;
      model: string;
    };
    // Avatar - Global (Alibaba Wan2.2)
    avatar: {
      primary: string;
      fallback: string;
      type: 'standard' | 'full-body';
    };
    // 3D Mesh - Global (ModelsLab)
    mesh3D: {
      primary: string;
      fallback: string;
    };
  };
}

// ============================================
// COMPLETE WIZARD METADATA
// ============================================
export interface WizardMetadata {
  version: string; // Schema version for forward compatibility
  exportedAt: string;
  exportedBy: string;
  
  // Step-by-step metadata
  step0_input: InputMetadata;
  step1_configuration: ConfigurationMetadata;
  step2_template: TemplateMetadata;
  step3_output: OutputMetadata;
  step4_agents: AgentMetadata;
  step5_voice: VoiceMetadata;
  
  // Generation context
  generation: GenerationMetadata;
  providerRouting: ProviderRoutingMetadata;
  
  // Project info
  projectId?: string;
  projectName?: string;
  userId?: string;
  
  // Export info
  exportFormat: string;
  exportQuality: string;
  totalSlides: number;
  totalLanguages: number;
}

// ============================================
// SLIDE-LEVEL METADATA
// ============================================
export interface SlideMetadata {
  slideNumber: number;
  slideId: string;
  slideType: string;
  topic?: string;
  segment?: string;
  importance?: 'high' | 'medium' | 'low';
  
  // Generation details
  generatedBy?: string; // Agent that generated this slide
  modelUsed?: string;
  imagePrompt?: string;
  imageProvider?: string;
  
  // Enhancement history
  enhancements?: Array<{
    type: string;
    appliedAt: string;
    model?: string;
  }>;
  
  // Voice/Audio
  voiceoverProvider?: string;
  voiceoverVoiceId?: string;
  voiceoverDuration?: number;
  
  // Visual features used
  visualFeatures?: string[];
  outputType?: string;
}

// ============================================
// UTILITY: Create default metadata
// ============================================
export function createDefaultWizardMetadata(): WizardMetadata {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    exportedBy: 'Genie AI',
    
    step0_input: {
      inputType: 'text',
      inputLanguage: 'en',
      primaryLanguage: 'en',
      processingTimestamp: new Date().toISOString(),
    },
    
    step1_configuration: {
      industry: 'general',
      industryLabel: 'General',
      segment: 'general',
      segmentLabel: 'General',
      contentTypes: [],
    },
    
    step2_template: {
      templateId: 'default',
      templateName: 'Default Template',
      themeId: 'default',
      themeName: 'Default Theme',
      brandConfig: {},
      selectedFrameworkCategories: [],
      selectedFrameworkCategoryLabels: [],
      selectedFrameworkIds: [],
      selectedFrameworkLabels: [],
      visualFeatures: [],
      contentCategories: [],
      contentCategoryLabels: [],
      step2Mode: 'quick',
    },
    
    step3_output: {
      outputType: '2d-static',
      outputTypes: ['2d-static'],
      outputFormats: [{ formatId: '2d-static', formatName: 'Static Slides', category: 'static', tier: 'standard' }],
      structureMode: 'flat',
      slideCount: 10,
    },
    
    step4_agents: {
      architectureType: 'single',
      selectedAgentIds: [],
      agentModelConfigs: [],
      languageVoiceConfigs: [],
      targetLanguages: ['en'],
    },
    
    step5_voice: {
      voiceEnabled: false,
      voiceProvider: 'elevenlabs',
      voiceId: '',
      musicEnabled: false,
    },
    
    generation: {
      pipelineId: 'default',
      pipelineName: 'Default Pipeline',
      tier: 'standard',
      llmProvider: 'openai',
      llmModel: 'gpt-4o-mini',
      llmZone: 'fallback',
      llmReason: 'Default provider',
      generatedAt: new Date().toISOString(),
    },
    
    providerRouting: {
      regionalBundle: 'english',
      regionalBundleName: 'English Core',
      llmZone: 'fallback',
      llmZoneReason: 'Default zone',
      isRTL: false,
      isMoatLanguage: false,
      providers: {
        llm: { primary: 'gpt-4o-mini', primaryModel: 'gpt-4o-mini', fallback: 'gemini-flash', fallbackModel: 'gemini-1.5-flash', zone: 'fallback', reason: 'Default' },
        translation: { primary: 'google-translate', fallback: 'azure-translator', reason: 'Default', supportedPairs: ['en-*'] },
        tts: { primary: 'azure-neural', fallback: 'google-tts', reason: 'Default' },
        stt: { primary: 'whisper', fallback: 'azure-stt', reason: 'Default' },
        image: { primary: 'flux-schnell', fallback: 'stability-core', model: 'flux-schnell' },
        video: { primary: 'modelslab', fallback: 'replicate', model: 'animatediff' },
        avatar: { primary: 'alibaba-wan22', fallback: 'replicate', type: 'standard' },
        mesh3D: { primary: 'modelslab', fallback: 'replicate' },
      },
    },
    
    exportFormat: 'pptx',
    exportQuality: 'high',
    totalSlides: 0,
    totalLanguages: 1,
  };
}

// ============================================
// UTILITY: Format metadata for speaker notes
// ============================================
export function formatMetadataForNotes(metadata: WizardMetadata): string {
  const lines = [
    '═══════════════════════════════════════════',
    'GENIE AI - GENERATION METADATA',
    '═══════════════════════════════════════════',
    '',
    '📋 CONFIGURATION',
    `Industry: ${metadata.step1_configuration.industryLabel}`,
    `Segment: ${metadata.step1_configuration.segmentLabel}`,
    `Template: ${metadata.step2_template.templateName}`,
    `Theme: ${metadata.step2_template.themeName}`,
    '',
    '🌐 LANGUAGES',
    `Primary: ${metadata.step0_input.primaryLanguage}`,
    `Targets: ${metadata.step4_agents.targetLanguages.join(', ')}`,
    '',
    '🤖 AI PROVIDERS',
    `LLM: ${metadata.generation.llmProvider} (${metadata.generation.llmModel})`,
    `Zone: ${metadata.providerRouting.llmZone}`,
    `Translation: ${metadata.providerRouting.providers.translation.primary}`,
    `TTS: ${metadata.providerRouting.providers.tts.primary}`,
    '',
    '📊 OUTPUT',
    `Type: ${metadata.step3_output.outputType}`,
    `Slides: ${metadata.totalSlides}`,
    `Quality: ${metadata.exportQuality}`,
    '',
    '⏱️ GENERATION',
    `Pipeline: ${metadata.generation.pipelineName}`,
    `Tier: ${metadata.generation.tier}`,
    `Generated: ${metadata.generation.generatedAt}`,
    '',
    '═══════════════════════════════════════════',
  ];
  
  return lines.join('\n');
}

// ============================================
// UTILITY: Format slide metadata for notes
// ============================================
export function formatSlideMetadataForNotes(slide: SlideMetadata): string {
  const lines = [
    '---',
    `Slide #${slide.slideNumber} | Type: ${slide.slideType}`,
    slide.topic ? `Topic: ${slide.topic}` : null,
    slide.segment ? `Segment: ${slide.segment}` : null,
    slide.generatedBy ? `Generated by: ${slide.generatedBy}` : null,
    slide.modelUsed ? `Model: ${slide.modelUsed}` : null,
    slide.imagePrompt ? `Image prompt: ${slide.imagePrompt}` : null,
    '---',
  ].filter(Boolean);
  
  return lines.join('\n');
}
