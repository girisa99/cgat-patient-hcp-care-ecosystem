/**
 * ASK GENIE CONTEXT SERVICE
 * 
 * Provides comprehensive context-aware guidance for Ask Genie:
 * - Product knowledge and capability overviews
 * - User journey tracking and deviation detection
 * - Context feeding to generation systems (Deck, Spark, etc.)
 * - Language pairing recommendations
 * - Flow guidance and recovery suggestions
 * - Full 141 pipeline awareness via askGeniePipelineKnowledgeBase
 * - A2A agent orchestration support
 * - 8-step wizard and editing workflow knowledge
 */

import { LANGUAGE_VOICE_PAIRINGS } from '@/hooks/useAskGenieVoice';
import { 
  askGeniePipelineKnowledgeBase, 
  WIZARD_STEPS_KNOWLEDGE, 
  EDITING_KNOWLEDGE, 
  A2A_AGENT_KNOWLEDGE,
  SUPPORT_KNOWLEDGE,
  ENGINEERING_CONTEXT_EXPORT,
  SUPPORT_TIERS,
  ASK_GENIE_AI_CAPABILITIES,
  ESCALATION_FLOW
} from '@/services/askGeniePipelineKnowledgeBase';
import { developerHandoffService, AI_TOOL_TEMPLATES } from '@/services/developerHandoffService';

// Re-export for convenience
export { 
  askGeniePipelineKnowledgeBase, 
  WIZARD_STEPS_KNOWLEDGE, 
  EDITING_KNOWLEDGE, 
  A2A_AGENT_KNOWLEDGE,
  SUPPORT_KNOWLEDGE,
  ENGINEERING_CONTEXT_EXPORT,
  SUPPORT_TIERS,
  ASK_GENIE_AI_CAPABILITIES,
  ESCALATION_FLOW,
  developerHandoffService,
  AI_TOOL_TEMPLATES
};

// ==================== TYPES ====================

export interface UserJourneyState {
  currentProduct: string;
  currentFlow: string | null;
  flowSteps: string[];
  currentStepIndex: number;
  startedAt: Date;
  lastActivityAt: Date;
  deviationCount: number;
  contextStack: ContextItem[];
  userIntent: UserIntent | null;
  selectedOptions: Record<string, any>;
  warnings: string[];
}

export interface ContextItem {
  type: 'goal' | 'preference' | 'selection' | 'navigation';
  key: string;
  value: any;
  timestamp: Date;
}

export interface UserIntent {
  primary: string;
  secondary?: string[];
  confidence: number;
  detectedFrom: string;
}

export interface FlowGuidance {
  currentStep: string;
  nextStep: string;
  suggestion: string;
  isOnTrack: boolean;
  deviationWarning?: string;
  recoveryOptions?: string[];
}

export interface ProductCapability {
  name: string;
  description: string;
  steps: string[];
  timeEstimate: string;
  relatedProducts?: string[];
}

// ==================== PRODUCT KNOWLEDGE BASE ====================

export const GENIE_DECK_KNOWLEDGE = {
  overview: `Genie Deck is your AI-powered presentation generator that transforms ideas into stunning visual presentations. It's like having a design team and copywriter working together at lightning speed!`,
  
  tagline: "Ideas to Impact",
  
  keyCapabilities: [
    {
      name: "Smart Context Generation",
      description: "AI analyzes your content and automatically creates well-structured slides with optimal layouts",
      steps: ["Paste your text, upload a doc, or describe your idea", "AI extracts key points", "Generates slide structure", "Creates visual hierarchy"],
      timeEstimate: "2-5 minutes"
    },
    {
      name: "Creative Help",
      description: "Get AI suggestions for content, design, and storytelling",
      steps: ["Describe your presentation goal", "AI suggests content angles", "Choose tone and style", "Get design recommendations"],
      timeEstimate: "1-3 minutes"
    },
    {
      name: "Visual Flows",
      description: "Create stunning visual diagrams, charts, and infographics automatically",
      steps: ["Enable visual elements", "Choose infographic types", "AI generates diagrams", "Customize colors and styles"],
      timeEstimate: "Integrated into generation"
    },
    {
      name: "Video Script Generation",
      description: "Create presenter scripts and voiceover narratives for your slides",
      steps: ["Enable voiceover option", "Choose voice style", "AI generates script per slide", "Export with audio"],
      timeEstimate: "3-5 minutes"
    },
    {
      name: "Multi-Language Generation",
      description: "Generate presentations in 70+ languages with intelligent translation",
      steps: ["Select primary language", "Enable multi-language", "Choose target languages", "AI translates maintaining context"],
      timeEstimate: "Adds ~30 seconds per language"
    },
    {
      name: "Record a Video",
      description: "Record yourself presenting with teleprompter support",
      steps: ["Generate your deck", "Go to Genie Vibe", "Use teleprompter with slides", "Record and export"],
      timeEstimate: "Depends on presentation length",
      relatedProducts: ["vibe"]
    }
  ],
  
  architecture: {
    overview: "Genie Deck uses a multi-agent architecture where specialized AI agents handle different aspects of presentation creation.",
    agents: [
      { name: "Content Analyst", role: "Extracts key themes and structures content" },
      { name: "Visual Designer", role: "Determines layouts, colors, and visual hierarchy" },
      { name: "Image Generator", role: "Creates AI images using ModelsLab, Flux, or stock sources" },
      { name: "Translator", role: "Handles multi-language generation with context preservation" },
      { name: "Voice Narrator", role: "Generates voiceover scripts and audio" }
    ],
    providers: {
      text: ["OpenAI GPT-4", "Google Gemini", "Anthropic Claude", "DeepSeek"],
      image: ["ModelsLab (Primary)", "Stability AI", "DALL-E 3", "Stock libraries"],
      voice: ["ElevenLabs", "OpenAI TTS", "Google TTS", "Azure Neural"],
      translation: ["DeepL (European)", "Google Translate", "Qwen-MT (Chinese)", "NLLB (Indian languages)"]
    }
  },
  
  languagePairing: {
    description: "We pair languages with the best AI providers for quality. European languages use DeepL, Asian languages use Qwen or specialized models, and we always have fallbacks.",
    examples: [
      { language: "German", provider: "DeepL", reason: "Best quality for European languages" },
      { language: "Chinese", provider: "Qwen-MT", reason: "Native understanding of Chinese context" },
      { language: "Hindi", provider: "Google/NLLB", reason: "Strong Indic language support" }
    ]
  },
  
  whyChooseIt: [
    "⚡ Generate 20+ slides in under 2 minutes",
    "🎨 Professional designs without design skills",
    "🌍 70+ languages with context-aware translation",
    "🖼️ AI-generated images tailored to your content",
    "📊 Automatic charts, infographics, and diagrams",
    "🎤 Voiceover scripts and audio generation",
    "💼 Brand customization with logos and colors",
    "📥 Export to PPTX, PDF, or continue to video"
  ]
};

// ==================== FLOW DEFINITIONS ====================

export const DECK_FLOWS = {
  'create-presentation': {
    name: "Create Presentation",
    steps: [
      { id: 'input', label: 'Add Content', description: 'Enter text, upload doc, or paste URL' },
      { id: 'collateral', label: 'Choose Type', description: 'Presentation, pitch deck, report, etc.' },
      { id: 'template', label: 'Select Template', description: 'Pick a visual theme' },
      { id: 'images', label: 'Configure Images', description: 'AI-generated, stock, or upload' },
      { id: 'language', label: 'Set Languages', description: 'Primary and additional languages' },
      { id: 'generate', label: 'Generate!', description: 'AI creates your presentation' },
      { id: 'download', label: 'Download', description: 'Export PPTX, PDF, or share' }
    ],
    estimatedTime: "5-10 minutes",
    deviationThreshold: 2
  },
  'quick-generate': {
    name: "Quick Generate",
    steps: [
      { id: 'input', label: 'Describe Idea', description: 'One sentence is enough!' },
      { id: 'generate', label: 'Generate', description: 'AI does the rest' },
      { id: 'download', label: 'Download', description: 'Get your deck' }
    ],
    estimatedTime: "2-3 minutes",
    deviationThreshold: 1
  },
  'branded-presentation': {
    name: "Branded Presentation",
    steps: [
      { id: 'brand', label: 'Upload Brand', description: 'Logo, colors, fonts' },
      { id: 'input', label: 'Add Content', description: 'Your presentation content' },
      { id: 'template', label: 'Brand Template', description: 'Apply your brand' },
      { id: 'generate', label: 'Generate', description: 'Branded deck created' },
      { id: 'download', label: 'Download', description: 'Export with branding' }
    ],
    estimatedTime: "7-12 minutes",
    deviationThreshold: 2
  }
};

// ==================== JOURNEY SERVICE ====================

class AskGenieContextService {
  private journeyState: UserJourneyState | null = null;
  private onContextChange?: (context: Record<string, any>) => void;
  
  constructor() {
    this.journeyState = null;
  }
  
  // Initialize journey for a product
  initializeJourney(product: string): UserJourneyState {
    this.journeyState = {
      currentProduct: product,
      currentFlow: null,
      flowSteps: [],
      currentStepIndex: 0,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      deviationCount: 0,
      contextStack: [],
      userIntent: null,
      selectedOptions: {},
      warnings: []
    };
    return this.journeyState;
  }
  
  // Start a specific flow
  startFlow(flowId: string): FlowGuidance | null {
    const flow = DECK_FLOWS[flowId as keyof typeof DECK_FLOWS];
    if (!flow || !this.journeyState) return null;
    
    this.journeyState.currentFlow = flowId;
    this.journeyState.flowSteps = flow.steps.map(s => s.id);
    this.journeyState.currentStepIndex = 0;
    
    return this.getCurrentGuidance();
  }
  
  // Get current flow guidance
  getCurrentGuidance(): FlowGuidance | null {
    if (!this.journeyState?.currentFlow) return null;
    
    const flow = DECK_FLOWS[this.journeyState.currentFlow as keyof typeof DECK_FLOWS];
    if (!flow) return null;
    
    const currentStep = flow.steps[this.journeyState.currentStepIndex];
    const nextStep = flow.steps[this.journeyState.currentStepIndex + 1];
    
    const isOnTrack = this.journeyState.deviationCount <= flow.deviationThreshold;
    
    return {
      currentStep: currentStep?.label || 'Unknown',
      nextStep: nextStep?.label || 'Complete!',
      suggestion: currentStep?.description || '',
      isOnTrack,
      deviationWarning: !isOnTrack 
        ? `You've navigated away ${this.journeyState.deviationCount} times. This might slow down your progress. Want to get back on track?`
        : undefined,
      recoveryOptions: !isOnTrack 
        ? [
            `Continue with ${currentStep?.label}`,
            `Start fresh with a new presentation`,
            `Let me guide you step by step`
          ]
        : undefined
    };
  }
  
  // Progress to next step
  advanceStep(): void {
    if (!this.journeyState) return;
    this.journeyState.currentStepIndex++;
    this.journeyState.lastActivityAt = new Date();
  }
  
  // Record deviation (user navigated away from flow)
  recordDeviation(reason: string): string {
    if (!this.journeyState) return '';
    
    this.journeyState.deviationCount++;
    this.journeyState.warnings.push(`Deviation: ${reason}`);
    
    const flow = DECK_FLOWS[this.journeyState.currentFlow as keyof typeof DECK_FLOWS];
    if (flow && this.journeyState.deviationCount > flow.deviationThreshold) {
      return `Hey! 🤔 I noticed you've moved away from your presentation ${this.journeyState.deviationCount} times. Just a friendly heads up - this might use more credits and take longer than sticking to the flow. Want me to help you get back on track? Your progress is saved! 💾`;
    }
    return '';
  }
  
  // Add context item (user selection, preference, etc.)
  addContext(item: Omit<ContextItem, 'timestamp'>): void {
    if (!this.journeyState) return;
    
    this.journeyState.contextStack.push({
      ...item,
      timestamp: new Date()
    });
    
    // Also store in selectedOptions for easy access
    if (item.type === 'selection') {
      this.journeyState.selectedOptions[item.key] = item.value;
    }
    
    this.journeyState.lastActivityAt = new Date();
    this.notifyContextChange();
  }
  
  // Set context change listener (for feeding to generation systems)
  setContextChangeListener(callback: (context: Record<string, any>) => void): void {
    this.onContextChange = callback;
  }
  
  private notifyContextChange(): void {
    if (this.onContextChange && this.journeyState) {
      this.onContextChange(this.getGenerationContext());
    }
  }
  
  // Get context for generation systems (Deck, Spark, etc.)
  getGenerationContext(): Record<string, any> {
    if (!this.journeyState) return {};
    
    const context: Record<string, any> = {
      selectedOptions: this.journeyState.selectedOptions,
      userIntent: this.journeyState.userIntent,
      currentFlow: this.journeyState.currentFlow,
      currentStep: this.journeyState.flowSteps[this.journeyState.currentStepIndex],
      preferences: {}
    };
    
    // Extract preferences from context stack
    this.journeyState.contextStack.forEach(item => {
      if (item.type === 'preference') {
        context.preferences[item.key] = item.value;
      }
    });
    
    return context;
  }
  
  // Detect user intent from message
  detectIntent(message: string): UserIntent {
    const lowerMessage = message.toLowerCase();
    
    const intentPatterns: Array<{ pattern: RegExp; intent: string; confidence: number }> = [
      // Presentation creation
      { pattern: /create|make|generate|build.*presentation/i, intent: 'create-presentation', confidence: 0.9 },
      { pattern: /quick|fast|simple.*deck/i, intent: 'quick-generate', confidence: 0.85 },
      { pattern: /brand|logo|company.*colors/i, intent: 'branded-presentation', confidence: 0.85 },
      
      // Learning/exploration
      { pattern: /what.*(can|does)|how.*work|tell me about/i, intent: 'learn-product', confidence: 0.8 },
      { pattern: /architecture|technical|how.*built/i, intent: 'learn-architecture', confidence: 0.85 },
      { pattern: /language|translate|multi.*lang/i, intent: 'learn-languages', confidence: 0.8 },
      
      // Specific features
      { pattern: /script|voiceover|narrator/i, intent: 'create-script', confidence: 0.8 },
      { pattern: /video|record/i, intent: 'record-video', confidence: 0.8 },
      { pattern: /image|visual|infographic/i, intent: 'configure-visuals', confidence: 0.75 },
      
      // Navigation
      { pattern: /show me|guide|walk.*through|help me/i, intent: 'guided-tour', confidence: 0.7 },
      { pattern: /options|what.*choose/i, intent: 'show-options', confidence: 0.7 }
    ];
    
    let bestMatch: UserIntent = {
      primary: 'general-help',
      confidence: 0.5,
      detectedFrom: message
    };
    
    for (const { pattern, intent, confidence } of intentPatterns) {
      if (pattern.test(lowerMessage) && confidence > bestMatch.confidence) {
        bestMatch = {
          primary: intent,
          confidence,
          detectedFrom: message
        };
      }
    }
    
    if (this.journeyState) {
      this.journeyState.userIntent = bestMatch;
    }
    
    return bestMatch;
  }
  
  // Generate product overview response
  getProductOverview(detail: 'brief' | 'full' | 'architecture' = 'brief'): string {
    const k = GENIE_DECK_KNOWLEDGE;
    
    switch (detail) {
      case 'brief':
        return `${k.overview}\n\n**What can you do here?** 🎯\n${k.keyCapabilities.slice(0, 3).map(c => `• **${c.name}**: ${c.description}`).join('\n')}\n\nWant to learn more about any of these, or shall we dive right in and create something? 🚀`;
        
      case 'full':
        return `${k.overview}\n\n**✨ All Capabilities:**\n${k.keyCapabilities.map(c => `\n**${c.name}**\n${c.description}\n⏱️ Time: ${c.timeEstimate}`).join('\n')}\n\n**Why Choose Genie Deck?**\n${k.whyChooseIt.join('\n')}\n\nReady to create something amazing? Just tell me what you're working on! 💜`;
        
      case 'architecture':
        return `**🏗️ How Genie Deck Works (The Cool Technical Stuff!)**\n\n${k.architecture.overview}\n\n**Our AI Agents:**\n${k.architecture.agents.map(a => `• **${a.name}**: ${a.role}`).join('\n')}\n\n**AI Providers We Use:**\n• **Text**: ${k.architecture.providers.text.join(', ')}\n• **Images**: ${k.architecture.providers.image.join(', ')}\n• **Voice**: ${k.architecture.providers.voice.join(', ')}\n• **Translation**: ${k.architecture.providers.translation.join(', ')}\n\n**Language Pairing**: ${k.languagePairing.description}\n\nPretty cool, right? 🧠 This is what makes your presentations so good so fast!`;
        
      default:
        return k.overview;
    }
  }
  
  // Get language recommendation based on user's detected language
  getLanguageRecommendation(userLanguage: string): string {
    const pairing = LANGUAGE_VOICE_PAIRINGS[userLanguage];
    if (!pairing) {
      return `I'll use our universal translation engine for ${userLanguage}. Works great for most languages! 🌍`;
    }
    
    return `For ${pairing.name}, I recommend ${pairing.tts.recommended} for voice and we'll use our optimized translation pipeline. This combination gives the best quality for ${pairing.region.replace('_', ' ')} languages! 🎯`;
  }
  
  // Generate contextual response based on user message and current state
  generateContextualGuidance(message: string): {
    response: string;
    suggestedActions: string[];
    shouldStartFlow?: string;
    contextToFeed?: Record<string, any>;
  } {
    const intent = this.detectIntent(message);
    const guidance = this.getCurrentGuidance();
    
    let response = '';
    let suggestedActions: string[] = [];
    let shouldStartFlow: string | undefined;
    let contextToFeed: Record<string, any> | undefined;
    
    switch (intent.primary) {
      case 'create-presentation':
        response = `Awesome! Let's create a stunning presentation! 🎨\n\nI'll guide you through the process step by step. Here's what we'll do:\n1. Add your content (text, doc, or just describe your idea)\n2. Choose a style and template\n3. Configure images and visuals\n4. Set your language(s)\n5. Generate and download!\n\nReady to start? Just paste your content or tell me what the presentation is about!`;
        suggestedActions = ['Paste my content', 'Describe my topic', 'Upload a document'];
        shouldStartFlow = 'create-presentation';
        break;
        
      case 'quick-generate':
        response = `Speed is the name of the game! ⚡\n\nFor a quick deck, just tell me:\n• What's the topic?\n• Who's the audience?\n\nI'll handle the rest - template, images, everything. You'll have a professional deck in under 2 minutes!`;
        suggestedActions = ['Just give me a sales pitch deck', 'Quick project update', 'Simple explainer'];
        shouldStartFlow = 'quick-generate';
        break;
        
      case 'learn-product':
        response = this.getProductOverview('full');
        suggestedActions = ['Create a presentation', 'Tell me about architecture', 'Show me language support'];
        break;
        
      case 'learn-architecture':
        response = this.getProductOverview('architecture');
        suggestedActions = ['That\'s cool! Let me try it', 'How do image models work?', 'Tell me about language pairing'];
        break;
        
      case 'learn-languages':
        const k = GENIE_DECK_KNOWLEDGE;
        response = `**🌍 Multi-Language Magic!**\n\n${k.languagePairing.description}\n\n**Examples:**\n${k.languagePairing.examples.map(e => `• **${e.language}** → ${e.provider} (${e.reason})`).join('\n')}\n\nWe support 70+ languages! Just tell me which ones you need, and I'll pair them with the best providers automatically. 🎯`;
        suggestedActions = ['Generate in multiple languages', 'What languages do you support?', 'Create presentation now'];
        break;
        
      case 'create-script':
        response = `Want voiceover or presenter scripts? Great choice! 🎙️\n\nWhen creating your presentation, enable "Include Voiceover" and I'll generate:\n• A natural script for each slide\n• AI-generated audio (optional)\n• Teleprompter-ready text\n\nYou can also take your deck to **Genie Vibe** to record yourself presenting with a teleprompter. Would you like to start with the presentation first?`;
        suggestedActions = ['Create presentation with voiceover', 'Just the presentation', 'Tell me about Genie Vibe'];
        break;
        
      case 'record-video':
        response = `Recording a video of your presentation? Love it! 🎥\n\nHere's the best flow:\n1. Create your deck here in Genie Deck\n2. Take it to **Genie Vibe** (our recording studio)\n3. Use the teleprompter with your slides\n4. Record, edit, and export!\n\nShall we start by creating the presentation first?`;
        suggestedActions = ['Create my presentation first', 'Go to Genie Vibe', 'Tell me more about the video flow'];
        break;
        
      case 'guided-tour':
        response = `I'd love to show you around! 🚀\n\n**Here's what you can do in Genie Deck:**\n\n📊 **Smart Context** - Paste any text and I'll structure it into slides\n🎨 **Creative Help** - Get AI suggestions for content and design\n📈 **Visual Flows** - Automatic charts and infographics\n🎬 **Video Scripts** - Presenter notes and voiceover\n🌍 **Multi-Language** - 70+ languages with smart translation\n📥 **Easy Export** - PPTX, PDF, or share online\n\nWhat catches your eye? Pick one and I'll dive deeper!`;
        suggestedActions = ['Smart Context', 'Creative Help', 'Multi-Language', 'Just create a presentation'];
        break;
        
      default:
        // Check if we're in a flow and potentially deviated
        if (guidance && !guidance.isOnTrack && guidance.deviationWarning) {
          response = guidance.deviationWarning;
          suggestedActions = guidance.recoveryOptions || [];
        } else if (guidance) {
          response = `You're on step "${guidance.currentStep}". ${guidance.suggestion}\n\nNext up: ${guidance.nextStep}\n\nNeed help with this step, or ready to move on?`;
          suggestedActions = [`Help with ${guidance.currentStep}`, 'Move to next step', 'Start over'];
        } else {
          response = `Hey there! 👋 I'm here to help you create amazing presentations with Genie Deck!\n\n**Quick options:**\n• 🚀 Create a presentation\n• 📖 Learn what Deck can do\n• 🔧 Technical architecture deep-dive\n\nWhat would you like to explore?`;
          suggestedActions = ['Create presentation', 'What can Deck do?', 'Architecture details'];
        }
    }
    
    // Prepare context to feed to generation system
    if (this.journeyState) {
      contextToFeed = {
        userIntent: intent,
        currentFlow: this.journeyState.currentFlow,
        selectedOptions: this.journeyState.selectedOptions,
        preferences: this.journeyState.contextStack.filter(c => c.type === 'preference')
      };
    }
    
    return {
      response,
      suggestedActions,
      shouldStartFlow,
      contextToFeed
    };
  }
  
  // Get welcome message with product capabilities
  getWelcomeMessage(product: string, userLanguage?: string): string {
    if (product === 'deck') {
      const langTip = userLanguage && userLanguage !== 'en' 
        ? `\n\n🌍 I noticed you might speak ${LANGUAGE_VOICE_PAIRINGS[userLanguage]?.name || userLanguage}! I can help you create presentations in that language with optimized translation!`
        : '';
      
      return `Hey there, creator! 🎨 Welcome to **Genie Deck** - where ideas become impact!\n\nI can help you:\n• 📊 **Create presentations** from text, docs, or just a prompt\n• 🎨 **Design automatically** with AI-powered visuals\n• 🌍 **Generate in 70+ languages** with smart translation\n• 🎤 **Add voiceovers** and presenter scripts\n• 📥 **Export anywhere** - PPTX, PDF, video\n\n🎤 **Fun fact**: You can talk to me! Tap the mic button to speak, or tap the speaker to hear my responses.${langTip}\n\nWhat would you like to create today?`;
    }
    
    return `Welcome! I'm Ask Genie, your creative AI assistant. What can I help you with? ✨`;
  }
  
  // Check if user is deviating and needs gentle redirect
  checkDeviation(currentAction: string): { isDeviating: boolean; warning?: string } {
    if (!this.journeyState?.currentFlow) {
      return { isDeviating: false };
    }
    
    const flow = DECK_FLOWS[this.journeyState.currentFlow as keyof typeof DECK_FLOWS];
    if (!flow) return { isDeviating: false };
    
    const currentFlowStep = flow.steps[this.journeyState.currentStepIndex];
    
    // Define actions that are within the flow
    const onTrackActions = [currentFlowStep?.id, 'help', 'back', 'next'];
    
    if (!onTrackActions.includes(currentAction)) {
      const warning = this.recordDeviation(currentAction);
      return { isDeviating: true, warning };
    }
    
    return { isDeviating: false };
  }
}

// Export singleton instance
export const askGenieContextService = new AskGenieContextService();
