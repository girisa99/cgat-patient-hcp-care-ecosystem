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
  selectedFrameworkCategories: string[];
  selectedFrameworkIds: string[];
  visualFeatures: Array<{
    featureId: string;
    featureName: string;
    subOptions: string[];
  }>;
  step2Mode: 'quick' | 'custom';
}

// ============================================
// STEP 3: OUTPUT CONFIGURATION METADATA
// ============================================
export interface OutputMetadata {
  outputType: string;
  outputTypes: string[]; // Multi-format support
  structureMode: 'chapters' | 'flat';
  slideCount: number;
  chapterCount?: number;
  slidesPerChapter?: number;
  resolution?: '720p' | '1080p' | '4k';
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
  quality?: 'draft' | 'standard' | 'high' | 'ultra';
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
  llmProvider: string;
  llmModel: string;
  llmZone: string;
  translationProvider?: string;
  ttsProvider?: string;
  imageProvider?: string;
  videoProvider?: string;
  generatedAt: string;
  generationDurationMs?: number;
  creditsUsed?: number;
}

// ============================================
// PROVIDER ROUTING METADATA
// ============================================
export interface ProviderRoutingMetadata {
  regionalBundle: string;
  llmZone: 'claude' | 'alibaba' | 'gemini' | 'fallback';
  isRTL: boolean;
  isMoatLanguage: boolean;
  providers: {
    llm: { primary: string; fallback: string; reason: string };
    translation: { primary: string; fallback: string; reason: string };
    tts: { primary: string; fallback: string; reason: string };
    stt: { primary: string; fallback: string; reason: string };
    image: { primary: string; fallback: string };
    video: { primary: string; fallback: string };
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
      selectedFrameworkIds: [],
      visualFeatures: [],
      step2Mode: 'quick',
    },
    
    step3_output: {
      outputType: '2d-static',
      outputTypes: ['2d-static'],
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
      generatedAt: new Date().toISOString(),
    },
    
    providerRouting: {
      regionalBundle: 'english',
      llmZone: 'fallback',
      isRTL: false,
      isMoatLanguage: false,
      providers: {
        llm: { primary: 'gpt-4o-mini', fallback: 'gemini-flash', reason: 'Default' },
        translation: { primary: 'google-translate', fallback: 'azure-translator', reason: 'Default' },
        tts: { primary: 'azure-neural', fallback: 'google-tts', reason: 'Default' },
        stt: { primary: 'whisper', fallback: 'azure-stt', reason: 'Default' },
        image: { primary: 'flux-schnell', fallback: 'stability-core' },
        video: { primary: 'modelslab', fallback: 'replicate' },
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
