/**
 * GENIE UNIVERSAL CONTEXT SERVICE
 * 
 * Cross-product context guidance system for ALL Genie Suite products:
 * - Deck, Spark, Mind, Vibe, Hub, Ask Genie
 * 
 * Features:
 * - Product-specific knowledge bases and flows
 * - User journey tracking with deviation detection
 * - Context feeding to generation systems (templates, visuals, languages)
 * - Language pairing aligned with voice/speech/text
 * - Native language guidance based on IP detection
 */

import { LANGUAGE_VOICE_PAIRINGS, VoiceRegion } from '@/hooks/useAskGenieVoice';

// ==================== TYPES ====================

export type GenieProductId = 'deck' | 'spark' | 'mind' | 'vibe' | 'arc' | 'studio' | 'ask-genie';

export interface UniversalJourneyState {
  product: GenieProductId;
  currentFlow: string | null;
  flowSteps: FlowStep[];
  currentStepIndex: number;
  startedAt: Date;
  lastActivityAt: Date;
  deviationCount: number;
  contextStack: ContextItem[];
  userIntent: UserIntent | null;
  selectedOptions: Record<string, any>;
  warnings: string[];
  userLanguage: string;
  userCountry: string;
}

export interface FlowStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

export interface ContextItem {
  type: 'goal' | 'preference' | 'selection' | 'navigation' | 'template' | 'visual' | 'language';
  key: string;
  value: any;
  timestamp: Date;
  product: GenieProductId;
}

export interface UserIntent {
  primary: string;
  secondary?: string[];
  confidence: number;
  detectedFrom: string;
  product: GenieProductId;
}

export interface FlowGuidance {
  product: GenieProductId;
  currentStep: FlowStep | null;
  nextStep: FlowStep | null;
  progress: number; // 0-100
  suggestion: string;
  isOnTrack: boolean;
  deviationWarning?: string;
  recoveryOptions?: string[];
  suggestedActions?: SuggestedAction[];
}

export interface SuggestedAction {
  label: string;
  action: string;
  icon?: string;
  route?: string;
  isHighlighted?: boolean;
}

export interface GenerationContext {
  product: GenieProductId;
  template?: string;
  visualConfig?: VisualConfiguration;
  languageConfig?: LanguageConfiguration;
  contentConfig?: ContentConfiguration;
  agentConfig?: AgentConfiguration;
  selectedOptions: Record<string, any>;
  userIntent: UserIntent | null;
  currentFlow: string | null;
  currentStep: string | null;
}

export interface VisualConfiguration {
  colorScheme?: string;
  imageStyle?: 'ai-generated' | 'stock' | 'upload' | 'none';
  layoutType?: string;
  animations?: boolean;
  infographics?: boolean;
}

export interface LanguageConfiguration {
  primary: string;
  secondary: string[];
  voiceProvider?: string;
  translationProvider?: string;
  textToSpeech?: boolean;
}

export interface ContentConfiguration {
  inputType?: 'text' | 'document' | 'url' | 'voice';
  contentLength?: 'brief' | 'standard' | 'detailed';
  toneOfVoice?: string;
  targetAudience?: string;
}

export interface AgentConfiguration {
  architectureType?: 'single' | 'multi-agent' | 'a2a' | 'agentic';
  textProvider?: string;
  imageProvider?: string;
  voiceProvider?: string;
  translationProvider?: string;
}

// ==================== PRODUCT KNOWLEDGE BASES ====================

export const PRODUCT_KNOWLEDGE: Record<GenieProductId, ProductKnowledge> = {
  deck: {
    id: 'deck',
    name: 'Genie Deck',
    tagline: 'Ideas to Impact',
    emoji: '📊',
    description: 'Transform ideas into stunning AI-powered presentations with smart visual design and multi-language support.',
    overview: `Genie Deck is your AI-powered presentation generator that transforms ideas into stunning visual presentations. It's like having a design team and copywriter working together at lightning speed!`,
    capabilities: [
      { name: 'Smart Context Generation', description: 'AI analyzes content and creates structured slides automatically', timeEstimate: '2-5 min' },
      { name: 'Creative Help', description: 'Get AI suggestions for content, design, and storytelling', timeEstimate: '1-3 min' },
      { name: 'Visual Flows', description: 'Create diagrams, charts, and infographics automatically', timeEstimate: 'Integrated' },
      { name: 'Video Script Generation', description: 'Create presenter scripts and voiceover narratives', timeEstimate: '3-5 min' },
      { name: 'Multi-Language Generation', description: 'Generate in 70+ languages with intelligent translation', timeEstimate: '+30s/lang' },
      { name: 'Record a Video', description: 'Record yourself with teleprompter support in Genie Vibe', timeEstimate: 'Variable', relatedProduct: 'vibe' }
    ],
    architecture: {
      agents: ['Content Analyst', 'Visual Designer', 'Image Generator', 'Translator', 'Voice Narrator'],
      providers: {
        text: ['OpenAI GPT-4', 'Google Gemini', 'Anthropic Claude', 'DeepSeek'],
        image: ['ModelsLab', 'Stability AI', 'DALL-E 3', 'Stock'],
        voice: ['ElevenLabs', 'OpenAI TTS', 'Google TTS', 'Azure Neural'],
        translation: ['DeepL', 'Google', 'Qwen-MT', 'NLLB']
      }
    },
    whyChoose: [
      '⚡ Generate 20+ slides in under 2 minutes',
      '🎨 Professional designs without design skills',
      '🌍 70+ languages with context-aware translation',
      '🖼️ AI-generated images tailored to your content',
      '📊 Automatic charts, infographics, and diagrams',
      '🎤 Voiceover scripts and audio generation'
    ]
  },
  spark: {
    id: 'spark',
    name: 'Genie Spark',
    tagline: 'Ignite Your Ideas',
    emoji: '✨',
    description: 'AI-powered creative content generation for scripts, stories, and multimedia content.',
    overview: `Genie Spark is your AI creative partner that helps you write scripts, generate content ideas, and create compelling stories for any medium!`,
    capabilities: [
      { name: 'Script Writing', description: 'Generate scripts for videos, podcasts, and presentations', timeEstimate: '2-5 min' },
      { name: 'Content Ideation', description: 'Get AI-powered content ideas and outlines', timeEstimate: '1-2 min' },
      { name: 'Story Generation', description: 'Create compelling narratives and storylines', timeEstimate: '3-5 min' },
      { name: 'Multi-Format Export', description: 'Export to different formats for various platforms', timeEstimate: '30s' }
    ],
    architecture: {
      agents: ['Creative Writer', 'Idea Generator', 'Story Architect', 'Format Adapter'],
      providers: {
        text: ['OpenAI GPT-4', 'Google Gemini', 'Anthropic Claude'],
        image: [],
        voice: [],
        translation: ['DeepL', 'Google']
      }
    },
    whyChoose: [
      '✍️ Professional scripts in minutes',
      '💡 Endless creative inspiration',
      '📝 Multiple writing styles and tones',
      '🎬 Perfect for video and podcast scripts'
    ]
  },
  mind: {
    id: 'mind',
    name: 'Genie Mind',
    tagline: 'Think Smarter',
    emoji: '🧠',
    description: 'AI model comparison, script editing, and intelligent optimization for your content.',
    overview: `Genie Mind is your AI thinking partner - compare models, optimize content, and make smarter decisions with AI-powered analysis!`,
    capabilities: [
      { name: 'AI Model Comparison', description: 'Compare outputs from different AI models side-by-side', timeEstimate: '2-3 min' },
      { name: 'Script Optimization', description: 'Enhance and polish your scripts with AI suggestions', timeEstimate: '1-2 min' },
      { name: 'Content Analysis', description: 'Get insights and improvements for your content', timeEstimate: '1 min' },
      { name: 'Smart Editing', description: 'AI-assisted editing with real-time suggestions', timeEstimate: 'Real-time' }
    ],
    architecture: {
      agents: ['Analyst', 'Editor', 'Optimizer', 'Comparator'],
      providers: {
        text: ['OpenAI GPT-4', 'Google Gemini', 'Anthropic Claude', 'DeepSeek', 'Mistral'],
        image: [],
        voice: [],
        translation: []
      }
    },
    whyChoose: [
      '🔍 Compare AI models instantly',
      '📈 Data-driven content optimization',
      '✏️ Smart editing suggestions',
      '🎯 Find the best AI for your needs'
    ]
  },
  vibe: {
    id: 'vibe',
    name: 'Genie Vibe',
    tagline: 'Feel the Moment',
    emoji: '🎥',
    description: 'Professional recording studio with teleprompter, voice-over, and audio/video production.',
    overview: `Genie Vibe is your professional recording studio - record videos, create voice-overs, and produce polished audio/video content!`,
    capabilities: [
      { name: 'Video Recording', description: 'Record with camera, screen share, or both', timeEstimate: 'Variable' },
      { name: 'Teleprompter', description: 'Read your script while recording', timeEstimate: 'Real-time' },
      { name: 'Voice-Over Generation', description: 'AI voices in 20+ languages', timeEstimate: '30s-2 min' },
      { name: 'Audio Mixing', description: 'Add music, effects, and polish audio', timeEstimate: '2-5 min' },
      { name: 'Multi-Language Dubbing', description: 'Dub your content in different languages', timeEstimate: '1-2 min/lang' }
    ],
    architecture: {
      agents: ['Recording Manager', 'Audio Mixer', 'Voice Generator', 'Video Processor'],
      providers: {
        text: [],
        image: [],
        voice: ['ElevenLabs', 'OpenAI TTS', 'Google TTS', 'Azure Neural', 'AWS Polly'],
        translation: []
      }
    },
    whyChoose: [
      '🎤 Professional AI voices in 20+ languages',
      '📹 Easy video recording with teleprompter',
      '🎵 Built-in audio mixing and effects',
      '🌍 Multi-language dubbing support'
    ]
  },
  arc: {
    id: 'arc',
    name: 'Genie Hub',
    tagline: 'Your Creative Command Center',
    emoji: '🎬',
    description: 'Creative command center for scheduling, assets, and team collaboration.',
    overview: `Genie Hub is your creative command center - plan, schedule, manage assets, and coordinate your content production!`,
    capabilities: [
      { name: 'Show Creation', description: 'Create podcast, webcast, webinar, or live stream shows', timeEstimate: '5-10 min' },
      { name: 'Episode Planning', description: 'Plan and schedule episodes with your team', timeEstimate: '2-5 min' },
      { name: 'Production Workflow', description: 'Coordinate scripts, recording, and publishing', timeEstimate: 'Variable' },
      { name: 'Team Collaboration', description: 'Invite team members and assign roles', timeEstimate: '2 min' }
    ],
    architecture: {
      agents: ['Show Manager', 'Episode Planner', 'Production Coordinator', 'Publisher'],
      providers: {
        text: [],
        image: [],
        voice: [],
        translation: []
      }
    },
    whyChoose: [
      '🎙️ All-in-one production hub',
      '📅 Easy scheduling and planning',
      '👥 Team collaboration built-in',
      '🚀 Streamlined publishing workflow'
    ]
  },
  studio: {
    id: 'studio',
    name: 'Genie Suite',
    tagline: 'Mind to Media',
    emoji: '🌟',
    description: 'The complete AI creative suite - presentations, scripts, recordings, and productions.',
    overview: `Genie Suite is your complete AI creative suite - combining all Genie products into one powerful workflow!`,
    capabilities: [
      { name: 'Full Production Workflow', description: 'From idea to published content', timeEstimate: 'Variable' },
      { name: 'Cross-Product Integration', description: 'Seamlessly move between Genie products', timeEstimate: 'Real-time' },
      { name: 'Unified Asset Management', description: 'Manage all your creative assets in one place', timeEstimate: 'N/A' }
    ],
    architecture: {
      agents: ['Workflow Orchestrator', 'Asset Manager', 'Integration Hub'],
      providers: {
        text: ['All providers'],
        image: ['All providers'],
        voice: ['All providers'],
        translation: ['All providers']
      }
    },
    whyChoose: [
      '🔄 Seamless product integration',
      '📦 Unified asset management',
      '⚡ Streamlined workflows',
      '🎯 One place for all creation'
    ]
  },
  'ask-genie': {
    id: 'ask-genie',
    name: 'Ask Genie',
    tagline: 'Your Creative Guide',
    emoji: '💜',
    description: 'Your AI assistant that guides you through all Genie products with contextual help.',
    overview: `I'm Ask Genie - your friendly guide through the entire Genie Suite! I can help you navigate, create, and get the most out of every product!`,
    capabilities: [
      { name: 'Contextual Guidance', description: 'Get help specific to what you\'re working on', timeEstimate: 'Real-time' },
      { name: 'Voice Interaction', description: 'Talk to me in 20+ languages', timeEstimate: 'Real-time' },
      { name: 'Product Navigation', description: 'I\'ll guide you to the right tool for your needs', timeEstimate: 'Real-time' },
      { name: 'Flow Guidance', description: 'Step-by-step help for any workflow', timeEstimate: 'Real-time' }
    ],
    architecture: {
      agents: ['Context Manager', 'Voice Handler', 'Flow Guide', 'Knowledge Base'],
      providers: {
        text: ['OpenAI GPT-4', 'Google Gemini', 'Anthropic Claude'],
        image: [],
        voice: ['ElevenLabs', 'OpenAI TTS', 'Google TTS', 'Azure Neural'],
        translation: []
      }
    },
    whyChoose: [
      '🗣️ Voice support in 20+ languages',
      '🎯 Context-aware assistance',
      '📚 Deep product knowledge',
      '💜 Always here to help!'
    ]
  }
};

export interface ProductKnowledge {
  id: GenieProductId;
  name: string;
  tagline: string;
  emoji: string;
  description: string;
  overview: string;
  capabilities: Array<{
    name: string;
    description: string;
    timeEstimate: string;
    relatedProduct?: GenieProductId;
  }>;
  architecture: {
    agents: string[];
    providers: {
      text: string[];
      image: string[];
      voice: string[];
      translation: string[];
    };
  };
  whyChoose: string[];
}

// ==================== PRODUCT-SPECIFIC FLOWS ====================

export const PRODUCT_FLOWS: Record<GenieProductId, Record<string, ProductFlow>> = {
  deck: {
    'create-presentation': {
      id: 'create-presentation',
      name: 'Create Presentation',
      steps: [
        { id: 'input', label: 'Add Content', description: 'Enter text, upload doc, or paste URL' },
        { id: 'collateral', label: 'Choose Type', description: 'Presentation, pitch deck, report' },
        { id: 'template', label: 'Select Template', description: 'Pick a visual theme' },
        { id: 'images', label: 'Configure Images', description: 'AI-generated, stock, or upload' },
        { id: 'language', label: 'Set Languages', description: 'Primary and additional languages' },
        { id: 'generate', label: 'Generate!', description: 'AI creates your presentation' },
        { id: 'download', label: 'Download', description: 'Export PPTX, PDF, or share' }
      ],
      estimatedTime: '5-10 minutes',
      deviationThreshold: 2
    },
    'quick-generate': {
      id: 'quick-generate',
      name: 'Quick Generate',
      steps: [
        { id: 'input', label: 'Describe Idea', description: 'One sentence is enough!' },
        { id: 'generate', label: 'Generate', description: 'AI does the rest' },
        { id: 'download', label: 'Download', description: 'Get your deck' }
      ],
      estimatedTime: '2-3 minutes',
      deviationThreshold: 1
    },
    'multilang-export': {
      id: 'multilang-export',
      name: 'Multi-Language Export',
      steps: [
        { id: 'select-deck', label: 'Select Deck', description: 'Choose your presentation' },
        { id: 'languages', label: 'Choose Languages', description: 'Select target languages' },
        { id: 'translate', label: 'Translate', description: 'AI translates all slides' },
        { id: 'export', label: 'Export All', description: 'Download all versions' }
      ],
      estimatedTime: '3-5 minutes',
      deviationThreshold: 1
    }
  },
  spark: {
    'write-script': {
      id: 'write-script',
      name: 'Write Script',
      steps: [
        { id: 'type', label: 'Script Type', description: 'Video, podcast, presentation' },
        { id: 'topic', label: 'Enter Topic', description: 'What\'s your script about?' },
        { id: 'tone', label: 'Set Tone', description: 'Professional, casual, educational' },
        { id: 'generate', label: 'Generate', description: 'AI writes your script' },
        { id: 'refine', label: 'Refine', description: 'Edit and polish' }
      ],
      estimatedTime: '3-5 minutes',
      deviationThreshold: 2
    },
    'ideation': {
      id: 'ideation',
      name: 'Content Ideation',
      steps: [
        { id: 'topic', label: 'Enter Topic', description: 'What area to explore?' },
        { id: 'brainstorm', label: 'Brainstorm', description: 'AI generates ideas' },
        { id: 'select', label: 'Select Ideas', description: 'Choose favorites' },
        { id: 'expand', label: 'Expand', description: 'Develop selected ideas' }
      ],
      estimatedTime: '2-4 minutes',
      deviationThreshold: 2
    }
  },
  mind: {
    'compare-models': {
      id: 'compare-models',
      name: 'Compare AI Models',
      steps: [
        { id: 'prompt', label: 'Enter Prompt', description: 'What to test?' },
        { id: 'models', label: 'Select Models', description: 'Choose models to compare' },
        { id: 'run', label: 'Run Comparison', description: 'Generate with all models' },
        { id: 'analyze', label: 'Analyze', description: 'Review results side-by-side' },
        { id: 'select', label: 'Select Best', description: 'Choose winner' }
      ],
      estimatedTime: '3-5 minutes',
      deviationThreshold: 1
    },
    'optimize-content': {
      id: 'optimize-content',
      name: 'Optimize Content',
      steps: [
        { id: 'input', label: 'Add Content', description: 'Paste your text' },
        { id: 'goals', label: 'Set Goals', description: 'What to optimize for?' },
        { id: 'analyze', label: 'Analyze', description: 'AI reviews content' },
        { id: 'apply', label: 'Apply Changes', description: 'Implement suggestions' }
      ],
      estimatedTime: '2-3 minutes',
      deviationThreshold: 2
    }
  },
  vibe: {
    'record-video': {
      id: 'record-video',
      name: 'Record Video',
      steps: [
        { id: 'setup', label: 'Setup', description: 'Configure camera and audio' },
        { id: 'script', label: 'Add Script', description: 'Load teleprompter script' },
        { id: 'record', label: 'Record', description: 'Record your video' },
        { id: 'review', label: 'Review', description: 'Watch and approve' },
        { id: 'export', label: 'Export', description: 'Save or publish' }
      ],
      estimatedTime: 'Variable',
      deviationThreshold: 2
    },
    'create-voiceover': {
      id: 'create-voiceover',
      name: 'Create Voice-Over',
      steps: [
        { id: 'script', label: 'Enter Script', description: 'Text to speak' },
        { id: 'voice', label: 'Choose Voice', description: 'Select AI voice' },
        { id: 'settings', label: 'Adjust Settings', description: 'Speed, pitch, style' },
        { id: 'generate', label: 'Generate', description: 'Create audio' },
        { id: 'download', label: 'Download', description: 'Export audio file' }
      ],
      estimatedTime: '2-3 minutes',
      deviationThreshold: 1
    }
  },
  arc: {
    'create-show': {
      id: 'create-show',
      name: 'Create Show',
      steps: [
        { id: 'type', label: 'Show Type', description: 'Podcast, webcast, webinar, live' },
        { id: 'details', label: 'Add Details', description: 'Name, description, artwork' },
        { id: 'schedule', label: 'Set Schedule', description: 'Episode frequency' },
        { id: 'team', label: 'Invite Team', description: 'Add collaborators' },
        { id: 'publish', label: 'Publish', description: 'Make show live' }
      ],
      estimatedTime: '5-10 minutes',
      deviationThreshold: 2
    }
  },
  studio: {
    'full-production': {
      id: 'full-production',
      name: 'Full Production',
      steps: [
        { id: 'idea', label: 'Start with Idea', description: 'What to create?' },
        { id: 'script', label: 'Write in Spark', description: 'Generate script' },
        { id: 'refine', label: 'Refine in Mind', description: 'Optimize content' },
        { id: 'visualize', label: 'Create in Deck', description: 'Make presentation' },
        { id: 'record', label: 'Record in Vibe', description: 'Create video/audio' },
        { id: 'produce', label: 'Produce in Arc', description: 'Finalize and publish' }
      ],
      estimatedTime: '30-60 minutes',
      deviationThreshold: 3
    }
  },
  'ask-genie': {
    'guided-tour': {
      id: 'guided-tour',
      name: 'Guided Tour',
      steps: [
        { id: 'welcome', label: 'Welcome', description: 'Introduction to Genie Suite' },
        { id: 'products', label: 'Products', description: 'Overview of each product' },
        { id: 'try', label: 'Try It', description: 'Hands-on experience' },
        { id: 'next', label: 'Next Steps', description: 'Recommendations for you' }
      ],
      estimatedTime: '5-10 minutes',
      deviationThreshold: 2
    }
  }
};

export interface ProductFlow {
  id: string;
  name: string;
  steps: Array<{ id: string; label: string; description: string }>;
  estimatedTime: string;
  deviationThreshold: number;
}

// ==================== LANGUAGE PAIRING ====================

interface LanguagePairingInfo {
  languageCode: string;
  languageName: string;
  nativeName?: string;
  voiceProvider: string;
  translationProvider: string;
  quality: string;
  recommendation: string;
}

const getTranslationProvider = (region: string): string => {
  const regionProviders: Record<string, string> = {
    western_europe: 'deepl',
    eastern_europe: 'deepl',
    east_asia: 'qwen-mt',
    south_asia: 'google',
    southeast_asia: 'google',
    middle_east: 'google',
    africa: 'google',
    americas: 'deepl'
  };
  return regionProviders[region] || 'google';
};

const getProviderRecommendation = (pairing: typeof LANGUAGE_VOICE_PAIRINGS[0], region: string): string => {
  const regionNames: Record<string, string> = {
    western_europe: 'Western European',
    eastern_europe: 'Eastern European',
    east_asia: 'East Asian',
    south_asia: 'South Asian',
    southeast_asia: 'Southeast Asian',
    middle_east: 'Middle Eastern',
    africa: 'African',
    americas: 'American'
  };
  
  const quality = pairing.quality === 'excellent' ? 'premium' : 'reliable';
  const regionName = regionNames[region] || region;
  
  return `For ${pairing.languageName}, we recommend ElevenLabs for voice (${quality} quality) and ${getTranslationProvider(region)} for translation - optimized for ${regionName} languages! 🎯`;
};

export const getLanguagePairingInfo = (languageCode: string): LanguagePairingInfo => {
  const pairing = LANGUAGE_VOICE_PAIRINGS.find(p => p.languageCode === languageCode);
  
  if (!pairing) {
    return {
      languageCode,
      languageName: 'Unknown',
      voiceProvider: 'elevenlabs',
      translationProvider: 'google',
      quality: 'good',
      recommendation: 'Using default providers for this language.'
    };
  }
  
  const region = (pairing as any).region || 'western_europe';
  
  return {
    languageCode: pairing.languageCode,
    languageName: pairing.languageName,
    nativeName: pairing.nativeName,
    voiceProvider: 'elevenlabs',
    translationProvider: getTranslationProvider(region),
    quality: pairing.quality,
    recommendation: getProviderRecommendation(pairing, region)
  };
};

// ==================== UNIVERSAL CONTEXT SERVICE ====================

class GenieUniversalContextService {
  private journeyState: UniversalJourneyState | null = null;
  private contextListeners: Map<string, (context: GenerationContext) => void> = new Map();
  
  // Initialize journey for a product
  initializeJourney(product: GenieProductId, userLanguage = 'en', userCountry = 'US'): UniversalJourneyState {
    this.journeyState = {
      product,
      currentFlow: null,
      flowSteps: [],
      currentStepIndex: 0,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      deviationCount: 0,
      contextStack: [],
      userIntent: null,
      selectedOptions: {},
      warnings: [],
      userLanguage,
      userCountry
    };
    return this.journeyState;
  }
  
  // Get current journey state
  getJourneyState(): UniversalJourneyState | null {
    return this.journeyState;
  }
  
  // Switch product context
  switchProduct(product: GenieProductId): void {
    if (this.journeyState) {
      this.journeyState.product = product;
      this.journeyState.currentFlow = null;
      this.journeyState.flowSteps = [];
      this.journeyState.currentStepIndex = 0;
      this.journeyState.lastActivityAt = new Date();
    }
  }
  
  // Start a specific flow
  startFlow(flowId: string): FlowGuidance | null {
    if (!this.journeyState) return null;
    
    const productFlows = PRODUCT_FLOWS[this.journeyState.product];
    const flow = productFlows?.[flowId];
    
    if (!flow) return null;
    
    this.journeyState.currentFlow = flowId;
    this.journeyState.flowSteps = flow.steps.map(s => ({
      ...s,
      completed: false
    }));
    this.journeyState.currentStepIndex = 0;
    
    return this.getCurrentGuidance();
  }
  
  // Get current guidance
  getCurrentGuidance(): FlowGuidance | null {
    if (!this.journeyState?.currentFlow) return null;
    
    const productFlows = PRODUCT_FLOWS[this.journeyState.product];
    const flow = productFlows?.[this.journeyState.currentFlow];
    
    if (!flow) return null;
    
    const currentStep = this.journeyState.flowSteps[this.journeyState.currentStepIndex] || null;
    const nextStep = this.journeyState.flowSteps[this.journeyState.currentStepIndex + 1] || null;
    const progress = ((this.journeyState.currentStepIndex + 1) / this.journeyState.flowSteps.length) * 100;
    const isOnTrack = this.journeyState.deviationCount <= flow.deviationThreshold;
    
    return {
      product: this.journeyState.product,
      currentStep,
      nextStep,
      progress,
      suggestion: currentStep?.description || '',
      isOnTrack,
      deviationWarning: !isOnTrack 
        ? `You've navigated away ${this.journeyState.deviationCount} times. This might slow down your progress. Want to get back on track?`
        : undefined,
      recoveryOptions: !isOnTrack 
        ? [
            `Continue with ${currentStep?.label}`,
            `Start fresh`,
            `Let me guide you step by step`
          ]
        : undefined,
      suggestedActions: this.getSuggestedActions()
    };
  }
  
  // Get suggested actions based on current state
  private getSuggestedActions(): SuggestedAction[] {
    if (!this.journeyState) return [];
    
    const product = PRODUCT_KNOWLEDGE[this.journeyState.product];
    const currentFlow = this.journeyState.currentFlow;
    const currentStep = this.journeyState.flowSteps[this.journeyState.currentStepIndex];
    
    const actions: SuggestedAction[] = [];
    
    // Add flow-specific actions
    if (currentStep) {
      actions.push({
        label: `Continue: ${currentStep.label}`,
        action: 'continue-flow',
        isHighlighted: true
      });
    }
    
    // Add product capability actions
    product.capabilities.slice(0, 2).forEach(cap => {
      if (cap.relatedProduct) {
        actions.push({
          label: cap.name,
          action: `goto-${cap.relatedProduct}`,
          route: `/${cap.relatedProduct === 'vibe' ? 'genie-vibe' : cap.relatedProduct}`
        });
      }
    });
    
    return actions;
  }
  
  // Advance to next step
  advanceStep(): void {
    if (!this.journeyState) return;
    
    // Mark current step as completed
    if (this.journeyState.flowSteps[this.journeyState.currentStepIndex]) {
      this.journeyState.flowSteps[this.journeyState.currentStepIndex].completed = true;
    }
    
    this.journeyState.currentStepIndex++;
    this.journeyState.lastActivityAt = new Date();
    this.notifyContextChange();
  }
  
  // Record deviation
  recordDeviation(reason: string): string {
    if (!this.journeyState) return '';
    
    this.journeyState.deviationCount++;
    this.journeyState.warnings.push(`Deviation: ${reason}`);
    
    const productFlows = PRODUCT_FLOWS[this.journeyState.product];
    const flow = productFlows?.[this.journeyState.currentFlow || ''];
    
    if (flow && this.journeyState.deviationCount > flow.deviationThreshold) {
      return `Hey! 🤔 I noticed you've moved away from your ${flow.name.toLowerCase()} ${this.journeyState.deviationCount} times. Just a friendly heads up - this might use more credits and take longer. Want me to help you get back on track? Your progress is saved! 💾`;
    }
    return '';
  }
  
  // Check deviation without recording
  checkDeviation(action: string): { isDeviating: boolean; warning?: string } {
    if (!this.journeyState?.currentFlow) {
      return { isDeviating: false };
    }
    
    const currentStep = this.journeyState.flowSteps[this.journeyState.currentStepIndex];
    const isRelevant = action.toLowerCase().includes(currentStep?.id || '');
    
    if (!isRelevant) {
      return {
        isDeviating: true,
        warning: `This action might take you away from "${currentStep?.label}". Continue anyway?`
      };
    }
    
    return { isDeviating: false };
  }
  
  // Add context item
  addContext(item: Omit<ContextItem, 'timestamp' | 'product'>): void {
    if (!this.journeyState) return;
    
    this.journeyState.contextStack.push({
      ...item,
      timestamp: new Date(),
      product: this.journeyState.product
    });
    
    // Store selections for easy access
    if (item.type === 'selection' || item.type === 'template' || item.type === 'visual' || item.type === 'language') {
      this.journeyState.selectedOptions[item.key] = item.value;
    }
    
    this.journeyState.lastActivityAt = new Date();
    this.notifyContextChange();
  }
  
  // Register context listener (for feeding to generation systems)
  registerContextListener(id: string, callback: (context: GenerationContext) => void): void {
    this.contextListeners.set(id, callback);
  }
  
  // Unregister context listener
  unregisterContextListener(id: string): void {
    this.contextListeners.delete(id);
  }
  
  private notifyContextChange(): void {
    const context = this.getGenerationContext();
    this.contextListeners.forEach(callback => callback(context));
  }
  
  // Get context for generation systems
  getGenerationContext(): GenerationContext {
    if (!this.journeyState) {
      return {
        product: 'deck',
        selectedOptions: {},
        userIntent: null,
        currentFlow: null,
        currentStep: null
      };
    }
    
    const context: GenerationContext = {
      product: this.journeyState.product,
      selectedOptions: this.journeyState.selectedOptions,
      userIntent: this.journeyState.userIntent,
      currentFlow: this.journeyState.currentFlow,
      currentStep: this.journeyState.flowSteps[this.journeyState.currentStepIndex]?.id || null
    };
    
    // Extract specific configurations
    const stack = this.journeyState.contextStack;
    
    // Template config
    const templateItems = stack.filter(i => i.type === 'template');
    if (templateItems.length > 0) {
      context.template = templateItems[templateItems.length - 1].value;
    }
    
    // Visual config
    const visualItems = stack.filter(i => i.type === 'visual');
    if (visualItems.length > 0) {
      context.visualConfig = visualItems.reduce((acc, item) => ({
        ...acc,
        [item.key]: item.value
      }), {} as VisualConfiguration);
    }
    
    // Language config
    const langItems = stack.filter(i => i.type === 'language');
    if (langItems.length > 0) {
      context.languageConfig = {
        primary: this.journeyState.userLanguage,
        secondary: langItems.map(i => i.value).filter(v => v !== this.journeyState!.userLanguage)
      };
    }
    
    return context;
  }
  
  // Detect user intent
  detectIntent(message: string): UserIntent {
    if (!this.journeyState) {
      return {
        primary: 'general-help',
        confidence: 0.5,
        detectedFrom: message,
        product: 'deck'
      };
    }
    
    const lowerMessage = message.toLowerCase();
    const product = this.journeyState.product;
    
    // Product-specific intent patterns
    const intentPatterns: Array<{ pattern: RegExp; intent: string; confidence: number; products: GenieProductId[] }> = [
      // Deck intents
      { pattern: /create|make|generate|build.*presentation|deck|slides/i, intent: 'create-presentation', confidence: 0.9, products: ['deck', 'studio'] },
      { pattern: /quick|fast|simple.*deck|presentation/i, intent: 'quick-generate', confidence: 0.85, products: ['deck'] },
      { pattern: /translate|multi.*lang|other language/i, intent: 'multilang-export', confidence: 0.85, products: ['deck'] },
      
      // Spark intents
      { pattern: /write|create.*script/i, intent: 'write-script', confidence: 0.9, products: ['spark', 'studio'] },
      { pattern: /idea|brainstorm|content ideas/i, intent: 'ideation', confidence: 0.85, products: ['spark'] },
      
      // Mind intents
      { pattern: /compare.*model|model comparison/i, intent: 'compare-models', confidence: 0.9, products: ['mind'] },
      { pattern: /optimize|improve.*content/i, intent: 'optimize-content', confidence: 0.85, products: ['mind'] },
      
      // Vibe intents
      { pattern: /record.*video|video recording/i, intent: 'record-video', confidence: 0.9, products: ['vibe'] },
      { pattern: /voice.*over|voiceover|tts|text.*speech/i, intent: 'create-voiceover', confidence: 0.85, products: ['vibe'] },
      
      // Arc intents
      { pattern: /create.*show|podcast|webcast|webinar/i, intent: 'create-show', confidence: 0.9, products: ['arc'] },
      
      // Learning intents (all products)
      { pattern: /what.*(can|does)|how.*work|tell me about/i, intent: 'learn-product', confidence: 0.8, products: ['deck', 'spark', 'mind', 'vibe', 'arc', 'studio', 'ask-genie'] },
      { pattern: /architecture|technical|how.*built/i, intent: 'learn-architecture', confidence: 0.85, products: ['deck', 'spark', 'mind', 'vibe', 'arc', 'studio', 'ask-genie'] },
      { pattern: /language|translate|voice|speech/i, intent: 'learn-languages', confidence: 0.8, products: ['deck', 'spark', 'mind', 'vibe', 'arc', 'studio', 'ask-genie'] },
      
      // Navigation intents
      { pattern: /show me|guide|walk.*through|help me/i, intent: 'guided-tour', confidence: 0.7, products: ['deck', 'spark', 'mind', 'vibe', 'arc', 'studio', 'ask-genie'] },
      { pattern: /options|what.*choose/i, intent: 'show-options', confidence: 0.7, products: ['deck', 'spark', 'mind', 'vibe', 'arc', 'studio', 'ask-genie'] }
    ];
    
    let bestMatch: UserIntent = {
      primary: 'general-help',
      confidence: 0.5,
      detectedFrom: message,
      product
    };
    
    for (const { pattern, intent, confidence, products } of intentPatterns) {
      if (pattern.test(lowerMessage) && products.includes(product) && confidence > bestMatch.confidence) {
        bestMatch = {
          primary: intent,
          confidence,
          detectedFrom: message,
          product
        };
      }
    }
    
    this.journeyState.userIntent = bestMatch;
    return bestMatch;
  }
  
  // Get product knowledge
  getProductKnowledge(product?: GenieProductId): ProductKnowledge {
    const p = product || this.journeyState?.product || 'deck';
    return PRODUCT_KNOWLEDGE[p];
  }
  
  // Get product overview (brief, full, architecture)
  getProductOverview(detail: 'brief' | 'full' | 'architecture' = 'brief', product?: GenieProductId): string {
    const knowledge = this.getProductKnowledge(product);
    
    switch (detail) {
      case 'brief':
        return `${knowledge.overview}\n\n**What can you do here?** 🎯\n${knowledge.capabilities.slice(0, 3).map(c => `• **${c.name}**: ${c.description}`).join('\n')}\n\nWant to learn more, or shall we dive right in? 🚀`;
        
      case 'full':
        return `${knowledge.overview}\n\n**✨ All Capabilities:**\n${knowledge.capabilities.map(c => `\n**${c.name}**\n${c.description}\n⏱️ Time: ${c.timeEstimate}`).join('\n')}\n\n**Why Choose ${knowledge.name}?**\n${knowledge.whyChoose.join('\n')}\n\nReady to create something amazing? 💜`;
        
      case 'architecture':
        return `**🏗️ How ${knowledge.name} Works:**\n\n**Our AI Agents:**\n${knowledge.architecture.agents.map(a => `• ${a}`).join('\n')}\n\n**AI Providers:**\n${knowledge.architecture.providers.text.length ? `• **Text**: ${knowledge.architecture.providers.text.join(', ')}` : ''}${knowledge.architecture.providers.image.length ? `\n• **Images**: ${knowledge.architecture.providers.image.join(', ')}` : ''}${knowledge.architecture.providers.voice.length ? `\n• **Voice**: ${knowledge.architecture.providers.voice.join(', ')}` : ''}${knowledge.architecture.providers.translation.length ? `\n• **Translation**: ${knowledge.architecture.providers.translation.join(', ')}` : ''}\n\nPretty cool, right? 🧠`;
        
      default:
        return knowledge.overview;
    }
  }
  
  // Get welcome message in user's language
  getWelcomeMessage(product?: GenieProductId, language?: string): string {
    const knowledge = this.getProductKnowledge(product);
    const lang = language || this.journeyState?.userLanguage || 'en';
    
    // Get language-specific greeting
    const greetings: Record<string, string> = {
      en: `Hey there! 👋 Welcome to **${knowledge.name}** - "${knowledge.tagline}" ${knowledge.emoji}`,
      es: `¡Hola! 👋 Bienvenido a **${knowledge.name}** - "${knowledge.tagline}" ${knowledge.emoji}`,
      fr: `Salut! 👋 Bienvenue sur **${knowledge.name}** - "${knowledge.tagline}" ${knowledge.emoji}`,
      de: `Hallo! 👋 Willkommen bei **${knowledge.name}** - "${knowledge.tagline}" ${knowledge.emoji}`,
      zh: `你好！👋 欢迎使用 **${knowledge.name}** - "${knowledge.tagline}" ${knowledge.emoji}`,
      ja: `こんにちは！👋 **${knowledge.name}** へようこそ - "${knowledge.tagline}" ${knowledge.emoji}`,
      pt: `Olá! 👋 Bem-vindo ao **${knowledge.name}** - "${knowledge.tagline}" ${knowledge.emoji}`,
      it: `Ciao! 👋 Benvenuto su **${knowledge.name}** - "${knowledge.tagline}" ${knowledge.emoji}`,
      ko: `안녕하세요! 👋 **${knowledge.name}** 에 오신 것을 환영합니다 - "${knowledge.tagline}" ${knowledge.emoji}`,
      ar: `مرحباً! 👋 أهلاً بك في **${knowledge.name}** - "${knowledge.tagline}" ${knowledge.emoji}`,
      hi: `नमस्ते! 👋 **${knowledge.name}** में आपका स्वागत है - "${knowledge.tagline}" ${knowledge.emoji}`,
      sw: `Habari! 👋 Karibu **${knowledge.name}** - "${knowledge.tagline}" ${knowledge.emoji}`
    };
    
    const greeting = greetings[lang.split('-')[0]] || greetings.en;
    
    return `${greeting}\n\n${knowledge.description}\n\n🎤 **I can talk to you!** Tap the mic button to speak, or the speaker button to hear me. I support 20+ languages!\n\n**What would you like to do?**\n${knowledge.capabilities.slice(0, 3).map(c => `• ${c.name}`).join('\n')}\n\nJust ask me anything or tap one of the suggestions below! 💜`;
  }
  
  // Get language recommendation
  getLanguageRecommendation(language: string): string {
    const info = getLanguagePairingInfo(language);
    return info.recommendation;
  }
  
  // Generate contextual guidance response
  generateContextualGuidance(message: string): {
    response: string;
    suggestedActions: SuggestedAction[];
    shouldStartFlow?: string;
    contextToFeed?: GenerationContext;
  } {
    const intent = this.detectIntent(message);
    const guidance = this.getCurrentGuidance();
    const knowledge = this.getProductKnowledge();
    
    let response = '';
    let suggestedActions: SuggestedAction[] = [];
    let shouldStartFlow: string | undefined;
    let contextToFeed: GenerationContext | undefined;
    
    switch (intent.primary) {
      case 'create-presentation':
      case 'quick-generate':
      case 'write-script':
      case 'record-video':
      case 'create-voiceover':
      case 'create-show':
      case 'compare-models':
        shouldStartFlow = intent.primary;
        const flow = PRODUCT_FLOWS[this.journeyState?.product || 'deck']?.[intent.primary];
        if (flow) {
          response = `Let's do this! 🚀\n\n**${flow.name}**\nEstimated time: ${flow.estimatedTime}\n\n**Here's what we'll do:**\n${flow.steps.map((s, i) => `${i + 1}. **${s.label}**: ${s.description}`).join('\n')}\n\nReady to start? I'll guide you through each step!`;
          suggestedActions = [
            { label: 'Start Now', action: 'start-flow', isHighlighted: true },
            { label: 'Tell me more', action: 'learn-more' },
            { label: 'Show me options', action: 'show-options' }
          ];
        }
        break;
        
      case 'learn-product':
        response = this.getProductOverview('brief');
        suggestedActions = [
          { label: 'Show all features', action: 'learn-full' },
          { label: 'How does it work?', action: 'learn-architecture' },
          { label: 'Let\'s create something!', action: 'start-creating', isHighlighted: true }
        ];
        break;
        
      case 'learn-architecture':
        response = this.getProductOverview('architecture');
        suggestedActions = [
          { label: 'About languages', action: 'learn-languages' },
          { label: 'Start creating', action: 'start-creating', isHighlighted: true }
        ];
        break;
        
      case 'learn-languages':
        const langInfo = getLanguagePairingInfo(this.journeyState?.userLanguage || 'en');
        response = `**🌍 Multi-Language Support**\n\n${langInfo.recommendation}\n\n**We support 70+ languages** with intelligent provider pairing:\n• European languages → DeepL (best quality)\n• Asian languages → Qwen-MT / Native models\n• Other languages → Google / NLLB\n\n**Voice in 20+ languages** with provider pairing for optimal quality!\n\nWant to try multi-language generation? 🗣️`;
        suggestedActions = [
          { label: 'Create multi-language content', action: 'multilang-create', isHighlighted: true },
          { label: 'Change my language', action: 'change-language' }
        ];
        break;
        
      case 'guided-tour':
        response = this.getWelcomeMessage();
        shouldStartFlow = 'guided-tour';
        suggestedActions = [
          { label: 'Show me around', action: 'start-tour', isHighlighted: true },
          { label: 'Just let me explore', action: 'explore' }
        ];
        break;
        
      default:
        // Check if in a flow and provide flow-specific help
        if (guidance?.currentStep) {
          response = `You're currently on **${guidance.currentStep.label}**: ${guidance.currentStep.description}\n\nProgress: ${Math.round(guidance.progress)}% complete 📊\n\n${guidance.isOnTrack ? '✅ You\'re on track!' : '⚠️ ' + guidance.deviationWarning}\n\nHow can I help you with this step?`;
          suggestedActions = guidance.suggestedActions || [];
        } else {
          response = `I'm here to help with **${knowledge.name}**! 💜\n\n${knowledge.description}\n\nWhat would you like to do?`;
          suggestedActions = [
            { label: `What can ${knowledge.name} do?`, action: 'learn-product' },
            { label: 'Start creating', action: 'start-creating', isHighlighted: true },
            { label: 'Show me a demo', action: 'show-demo' }
          ];
        }
    }
    
    // Include context to feed if in a flow
    if (this.journeyState) {
      contextToFeed = this.getGenerationContext();
    }
    
    return {
      response,
      suggestedActions,
      shouldStartFlow,
      contextToFeed
    };
  }
}

// Singleton instance
export const genieUniversalContextService = new GenieUniversalContextService();

export { GenieUniversalContextService };
