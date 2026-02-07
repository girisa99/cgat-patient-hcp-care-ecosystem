/**
 * AI Routing Intelligence Service - Phase 1
 * 
 * Provides intelligent query classification, auto-model selection,
 * and cost optimization routing for the Genie ecosystem.
 */

export type QueryIntent = 
  | 'creative_writing'      // Scripts, stories, marketing copy
  | 'technical_analysis'    // Code, data analysis, research
  | 'conversational'        // Chat, Q&A, support
  | 'translation'           // Multi-language content
  | 'summarization'         // Condensing content
  | 'image_generation'      // Visual content creation
  | 'video_generation'      // Video/animation content
  | 'audio_generation'      // TTS, music, SFX
  | 'document_processing'   // OCR, extraction, parsing
  | 'multimodal'            // Combined text+image+audio
  | 'reasoning'             // Complex logic, math, analysis
  | 'classification'        // Categorization, tagging
  | 'unknown';

export type ContentComplexity = 'simple' | 'moderate' | 'complex' | 'expert';
export type CostTier = 'economy' | 'standard' | 'premium' | 'enterprise';

export interface QueryClassification {
  intent: QueryIntent;
  confidence: number;
  complexity: ContentComplexity;
  estimatedTokens: number;
  requiresVision: boolean;
  requiresReasoning: boolean;
  language: string;
  suggestedCostTier: CostTier;
  reasoning: string[];
}

export interface ModelRecommendation {
  modelId: string;
  provider: string;
  displayName: string;
  score: number;
  estimatedCost: number;
  estimatedLatency: number;
  strengths: string[];
  reasoning: string;
}

export interface RoutingDecision {
  classification: QueryClassification;
  primaryRecommendation: ModelRecommendation;
  alternativeRecommendations: ModelRecommendation[];
  costOptimizedOption: ModelRecommendation | null;
  qualityOptimizedOption: ModelRecommendation | null;
  speedOptimizedOption: ModelRecommendation | null;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * FROZEN MODEL REGISTRY — DO NOT MODIFY WITHOUT GOVERNANCE APPROVAL
 * All configs are Object.freeze() locked per master-provider-routing-registry.ts
 * ═══════════════════════════════════════════════════════════════
 */

// 4-Zone LLM Routing (FROZEN)
const ZONE_LLM_ROUTING = Object.freeze({
  claude_zone: Object.freeze({ zones: ['western', 'europe', 'latam'], primary: 'anthropic/claude-3-sonnet', fallback: 'azure/gpt-4o' }),
  alibaba_zone: Object.freeze({ zones: ['cjk', 'mena'], primary: 'alibaba/qwen-max', fallback: 'azure/gpt-4o' }),
  gemini_zone: Object.freeze({ zones: ['india', 'sea', 'africa'], primary: 'google/gemini-2.5-pro', fallback: 'azure/gpt-4o' }),
  fallback_zone: Object.freeze({ zones: ['global'], primary: 'google/gemini-2.5-flash', fallback: 'azure/gpt-4o' }),
} as const);

// Translation Provider Routing (FROZEN)
const TRANSLATION_ROUTING = Object.freeze({
  deepl_supported: Object.freeze(['ar', 'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr', 'he', 'hu', 'id', 'it', 'ja', 'ko', 'lt', 'lv', 'nb', 'nl', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sv', 'th', 'tr', 'uk', 'vi', 'zh']),
  azure_translator_fallback: Object.freeze(['ur', 'fa', 'ps', 'hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'sw', 'yo', 'am', 'ms', 'tl']),
} as const);

// RTL Languages (FROZEN)
const RTL_LANGUAGES = Object.freeze(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ku', 'yi'] as const);

// TTS Provider Routing (FROZEN)
const ZONE_TTS_ROUTING = Object.freeze({
  western: 'azure-neural',
  europe: 'azure-neural',
  latam: 'azure-neural',
  cjk: 'alibaba-cosyvoice',
  mena: 'azure-neural',     // 7 Arabic dialects + Viseme data
  india: 'azure-neural',    // Viseme support for 11+ languages
  sea: 'azure-neural',
  africa: 'azure-neural',
  global: 'azure-neural',
} as const);

// STT Provider Routing (FROZEN)
const ZONE_STT_ROUTING = Object.freeze({
  western: 'deepgram-nova-2',
  europe: 'deepgram-nova-2',
  latam: 'deepgram-nova-2',
  cjk: 'alibaba-paraformer',
  mena: 'azure-stt',
  india: 'deepgram-nova-2',
  sea: 'deepgram-nova-2',
  africa: 'deepgram-nova-2',
  global: 'deepgram-nova-2',
} as const);

// Model capability registry - Full 30+ Provider Coverage (FROZEN)
const MODEL_REGISTRY: Record<string, {
  provider: string;
  displayName: string;
  strengths: QueryIntent[];
  costPerInputToken: number;
  costPerOutputToken: number;
  avgLatencyMs: number;
  contextWindow: number;
  supportsVision: boolean;
  supportsReasoning: boolean;
  qualityScore: number;
  tier: 'economy' | 'standard' | 'premium' | 'enterprise';
}> = Object.freeze({
  // ============== GOOGLE GEMINI ==============
  'google/gemini-3-flash-preview': Object.freeze({
    provider: 'gemini',
    displayName: 'Gemini 3 Flash Preview',
    strengths: ['creative_writing', 'conversational', 'summarization', 'classification'] as QueryIntent[],
    costPerInputToken: 0.00001,
    costPerOutputToken: 0.00002,
    avgLatencyMs: 800,
    contextWindow: 1000000,
    supportsVision: true,
    supportsReasoning: true,
    qualityScore: 88,
    tier: 'standard' as const
  }),
  'google/gemini-2.5-pro': Object.freeze({
    provider: 'gemini',
    displayName: 'Gemini 2.5 Pro',
    strengths: ['reasoning', 'technical_analysis', 'multimodal', 'document_processing'] as QueryIntent[],
    costPerInputToken: 0.00003,
    costPerOutputToken: 0.00006,
    avgLatencyMs: 2000,
    contextWindow: 1000000,
    supportsVision: true,
    supportsReasoning: true,
    qualityScore: 95,
    tier: 'premium' as const
  }),
  'google/gemini-2.5-flash': Object.freeze({
    provider: 'gemini',
    displayName: 'Gemini 2.5 Flash',
    strengths: ['creative_writing', 'conversational', 'summarization'] as QueryIntent[],
    costPerInputToken: 0.000005,
    costPerOutputToken: 0.00001,
    avgLatencyMs: 600,
    contextWindow: 1000000,
    supportsVision: true,
    supportsReasoning: false,
    qualityScore: 82,
    tier: 'standard' as const
  }),
  'google/gemini-2.5-flash-lite': Object.freeze({
    provider: 'gemini',
    displayName: 'Gemini 2.5 Flash Lite',
    strengths: ['classification', 'summarization', 'conversational'] as QueryIntent[],
    costPerInputToken: 0.000002,
    costPerOutputToken: 0.000004,
    avgLatencyMs: 300,
    contextWindow: 100000,
    supportsVision: false,
    supportsReasoning: false,
    qualityScore: 72,
    tier: 'economy' as const
  }),
  // ============== OPENAI ==============
  'openai/gpt-5': Object.freeze({
    provider: 'openai',
    displayName: 'GPT-5',
    strengths: ['reasoning', 'creative_writing', 'technical_analysis', 'multimodal'] as QueryIntent[],
    costPerInputToken: 0.00005,
    costPerOutputToken: 0.00015,
    avgLatencyMs: 2500,
    contextWindow: 200000,
    supportsVision: true,
    supportsReasoning: true,
    qualityScore: 98,
    tier: 'enterprise' as const
  }),
  'openai/gpt-5-mini': Object.freeze({
    provider: 'openai',
    displayName: 'GPT-5 Mini',
    strengths: ['conversational', 'summarization', 'classification'] as QueryIntent[],
    costPerInputToken: 0.00001,
    costPerOutputToken: 0.00003,
    avgLatencyMs: 1000,
    contextWindow: 128000,
    supportsVision: true,
    supportsReasoning: true,
    qualityScore: 85,
    tier: 'standard' as const
  }),
  'openai/gpt-5-nano': Object.freeze({
    provider: 'openai',
    displayName: 'GPT-5 Nano',
    strengths: ['classification', 'conversational'] as QueryIntent[],
    costPerInputToken: 0.000003,
    costPerOutputToken: 0.000006,
    avgLatencyMs: 400,
    contextWindow: 64000,
    supportsVision: false,
    supportsReasoning: false,
    qualityScore: 70,
    tier: 'economy' as const
  }),
  // ============== ANTHROPIC CLAUDE ==============
  'anthropic/claude-3-opus': Object.freeze({
    provider: 'claude',
    displayName: 'Claude 3 Opus',
    strengths: ['reasoning', 'creative_writing', 'technical_analysis'] as QueryIntent[],
    costPerInputToken: 0.00004,
    costPerOutputToken: 0.00012,
    avgLatencyMs: 3000,
    contextWindow: 200000,
    supportsVision: true,
    supportsReasoning: true,
    qualityScore: 96,
    tier: 'enterprise' as const
  }),
  'anthropic/claude-3-sonnet': Object.freeze({
    provider: 'claude',
    displayName: 'Claude 3 Sonnet',
    strengths: ['creative_writing', 'conversational', 'summarization', 'technical_analysis'] as QueryIntent[],
    costPerInputToken: 0.00001,
    costPerOutputToken: 0.00003,
    avgLatencyMs: 1500,
    contextWindow: 200000,
    supportsVision: true,
    supportsReasoning: true,
    qualityScore: 90,
    tier: 'premium' as const
  }),
  'anthropic/claude-3-haiku': Object.freeze({
    provider: 'claude',
    displayName: 'Claude 3 Haiku',
    strengths: ['classification', 'summarization', 'conversational'] as QueryIntent[],
    costPerInputToken: 0.000003,
    costPerOutputToken: 0.000006,
    avgLatencyMs: 500,
    contextWindow: 200000,
    supportsVision: true,
    supportsReasoning: false,
    qualityScore: 78,
    tier: 'economy' as const
  }),
  // ============== DEEPSEEK ==============
  'deepseek/deepseek-v3': Object.freeze({
    provider: 'deepseek',
    displayName: 'DeepSeek V3',
    strengths: ['technical_analysis', 'reasoning', 'translation'] as QueryIntent[],
    costPerInputToken: 0.000002,
    costPerOutputToken: 0.000004,
    avgLatencyMs: 1000,
    contextWindow: 128000,
    supportsVision: true,
    supportsReasoning: true,
    qualityScore: 85,
    tier: 'economy' as const
  }),
  'deepseek/deepseek-coder': Object.freeze({
    provider: 'deepseek',
    displayName: 'DeepSeek Coder',
    strengths: ['technical_analysis', 'reasoning'] as QueryIntent[],
    costPerInputToken: 0.000002,
    costPerOutputToken: 0.000004,
    avgLatencyMs: 800,
    contextWindow: 64000,
    supportsVision: false,
    supportsReasoning: true,
    qualityScore: 88,
    tier: 'economy' as const
  }),
  // ============== ALIBABA QWEN ==============
  'alibaba/qwen-max': Object.freeze({
    provider: 'alibaba',
    displayName: 'Qwen Max',
    strengths: ['reasoning', 'translation', 'creative_writing', 'multimodal'] as QueryIntent[],
    costPerInputToken: 0.00002,
    costPerOutputToken: 0.00004,
    avgLatencyMs: 1500,
    contextWindow: 128000,
    supportsVision: true,
    supportsReasoning: true,
    qualityScore: 92,
    tier: 'premium' as const
  }),
  'alibaba/qwen-turbo': Object.freeze({
    provider: 'alibaba',
    displayName: 'Qwen Turbo',
    strengths: ['conversational', 'summarization', 'translation'] as QueryIntent[],
    costPerInputToken: 0.000005,
    costPerOutputToken: 0.00001,
    avgLatencyMs: 600,
    contextWindow: 64000,
    supportsVision: false,
    supportsReasoning: false,
    qualityScore: 80,
    tier: 'standard' as const
  }),
  'alibaba/qwen-vl': Object.freeze({
    provider: 'alibaba',
    displayName: 'Qwen VL (Vision)',
    strengths: ['multimodal', 'document_processing'] as QueryIntent[],
    costPerInputToken: 0.00002,
    costPerOutputToken: 0.00004,
    avgLatencyMs: 2000,
    contextWindow: 32000,
    supportsVision: true,
    supportsReasoning: false,
    qualityScore: 85,
    tier: 'standard' as const
  }),
  // ============== AZURE OPENAI ==============
  'azure/gpt-4o': Object.freeze({
    provider: 'azure',
    displayName: 'Azure GPT-4o',
    strengths: ['reasoning', 'creative_writing', 'multimodal', 'technical_analysis'] as QueryIntent[],
    costPerInputToken: 0.00003,
    costPerOutputToken: 0.00009,
    avgLatencyMs: 2000,
    contextWindow: 128000,
    supportsVision: true,
    supportsReasoning: true,
    qualityScore: 94,
    tier: 'premium' as const
  }),
  'azure/gpt-4o-mini': Object.freeze({
    provider: 'azure',
    displayName: 'Azure GPT-4o Mini',
    strengths: ['conversational', 'summarization', 'classification'] as QueryIntent[],
    costPerInputToken: 0.000008,
    costPerOutputToken: 0.000024,
    avgLatencyMs: 800,
    contextWindow: 128000,
    supportsVision: true,
    supportsReasoning: false,
    qualityScore: 82,
    tier: 'standard' as const
  }),
  // ============== MEDIA PROVIDERS (Image/Video/3D/Audio) ==============
  'modelslab/flux-pro': Object.freeze({
    provider: 'modelslab', displayName: 'FLUX Pro', strengths: ['image_generation'] as QueryIntent[],
    costPerInputToken: 0.0001, costPerOutputToken: 0, avgLatencyMs: 15000, contextWindow: 1000,
    supportsVision: false, supportsReasoning: false, qualityScore: 95, tier: 'premium' as const
  }),
  'modelslab/flux-schnell': Object.freeze({
    provider: 'modelslab', displayName: 'FLUX Schnell', strengths: ['image_generation'] as QueryIntent[],
    costPerInputToken: 0.00003, costPerOutputToken: 0, avgLatencyMs: 5000, contextWindow: 1000,
    supportsVision: false, supportsReasoning: false, qualityScore: 85, tier: 'standard' as const
  }),
  'modelslab/animatediff': Object.freeze({
    provider: 'modelslab', displayName: 'AnimateDiff', strengths: ['video_generation'] as QueryIntent[],
    costPerInputToken: 0.0002, costPerOutputToken: 0, avgLatencyMs: 60000, contextWindow: 500,
    supportsVision: false, supportsReasoning: false, qualityScore: 88, tier: 'premium' as const
  }),
  'elevenlabs/multilingual-v2': Object.freeze({
    provider: 'elevenlabs', displayName: 'ElevenLabs Multilingual V2', strengths: ['audio_generation'] as QueryIntent[],
    costPerInputToken: 0.0001, costPerOutputToken: 0, avgLatencyMs: 3000, contextWindow: 10000,
    supportsVision: false, supportsReasoning: false, qualityScore: 98, tier: 'premium' as const
  }),
  'elevenlabs/turbo-v2': Object.freeze({
    provider: 'elevenlabs', displayName: 'ElevenLabs Turbo V2', strengths: ['audio_generation'] as QueryIntent[],
    costPerInputToken: 0.00005, costPerOutputToken: 0, avgLatencyMs: 1000, contextWindow: 5000,
    supportsVision: false, supportsReasoning: false, qualityScore: 90, tier: 'standard' as const
  }),
  'azure/neural-tts': Object.freeze({
    provider: 'azure_speech', displayName: 'Azure Neural TTS', strengths: ['audio_generation'] as QueryIntent[],
    costPerInputToken: 0.00004, costPerOutputToken: 0, avgLatencyMs: 1500, contextWindow: 10000,
    supportsVision: false, supportsReasoning: false, qualityScore: 92, tier: 'premium' as const
  }),
  'alibaba/cosyvoice': Object.freeze({
    provider: 'alibaba', displayName: 'CosyVoice', strengths: ['audio_generation'] as QueryIntent[],
    costPerInputToken: 0.00003, costPerOutputToken: 0, avgLatencyMs: 2000, contextWindow: 10000,
    supportsVision: false, supportsReasoning: false, qualityScore: 90, tier: 'premium' as const
  }),
  'meshy/text-to-3d': Object.freeze({
    provider: 'meshy', displayName: 'Meshy Text-to-3D', strengths: ['image_generation'] as QueryIntent[],
    costPerInputToken: 0.001, costPerOutputToken: 0, avgLatencyMs: 120000, contextWindow: 500,
    supportsVision: false, supportsReasoning: false, qualityScore: 85, tier: 'premium' as const
  }),
  'replicate/llama-3-70b': Object.freeze({
    provider: 'replicate', displayName: 'Llama 3 70B', strengths: ['conversational', 'summarization', 'creative_writing'] as QueryIntent[],
    costPerInputToken: 0.00001, costPerOutputToken: 0.00002, avgLatencyMs: 2000, contextWindow: 8000,
    supportsVision: false, supportsReasoning: true, qualityScore: 82, tier: 'standard' as const
  }),
  'deepl/translator': Object.freeze({
    provider: 'deepl', displayName: 'DeepL Translator', strengths: ['translation'] as QueryIntent[],
    costPerInputToken: 0.00005, costPerOutputToken: 0, avgLatencyMs: 500, contextWindow: 50000,
    supportsVision: false, supportsReasoning: false, qualityScore: 96, tier: 'premium' as const
  }),
  'azure/doc-intelligence': Object.freeze({
    provider: 'azure_doc_intel', displayName: 'Azure Document Intelligence', strengths: ['document_processing'] as QueryIntent[],
    costPerInputToken: 0.0001, costPerOutputToken: 0, avgLatencyMs: 5000, contextWindow: 100000,
    supportsVision: true, supportsReasoning: false, qualityScore: 94, tier: 'premium' as const
  }),
});

// Intent detection patterns
const INTENT_PATTERNS: Record<QueryIntent, RegExp[]> = {
  creative_writing: [
    /write\s+(a\s+)?(script|story|article|copy|content|blog|post)/i,
    /create\s+(content|marketing|script)/i,
    /generate\s+(a\s+)?(story|narrative|script)/i,
  ],
  technical_analysis: [
    /analyze|analysis|data|code|technical|research|statistics/i,
    /explain\s+(how|why|the)/i,
    /debug|optimize|refactor/i,
  ],
  conversational: [
    /^(hi|hello|hey|help|what|how|why|can\s+you)/i,
    /chat|talk|discuss|conversation/i,
    /question|ask|tell\s+me/i,
  ],
  translation: [
    /translat|convert\s+to\s+\w+/i,
    /in\s+(spanish|french|german|chinese|japanese|arabic|hindi)/i,
    /locali[sz]e/i,
  ],
  summarization: [
    /summari[sz]e|condense|brief|tldr|key\s+points/i,
    /shorter\s+version|main\s+ideas/i,
  ],
  image_generation: [
    /image|picture|photo|illustration|graphic|visual/i,
    /draw|create\s+(an?\s+)?image/i,
    /generate\s+(an?\s+)?(image|picture)/i,
  ],
  video_generation: [
    /video|animation|clip|footage/i,
    /create\s+(a\s+)?video/i,
    /animate/i,
  ],
  audio_generation: [
    /audio|voice|speech|narrat|sound|music/i,
    /text[\s-]to[\s-]speech|tts/i,
    /voiceover/i,
  ],
  document_processing: [
    /pdf|document|extract|parse|ocr/i,
    /read\s+(this|the)\s+(file|document)/i,
    /convert\s+(from|to)\s+(pdf|docx|txt)/i,
  ],
  multimodal: [
    /this\s+image|look\s+at|analyze\s+this\s+(image|photo)/i,
    /describe\s+(this|the)\s+(image|photo|picture)/i,
  ],
  reasoning: [
    /calculate|solve|prove|derive|logic|math/i,
    /step[\s-]by[\s-]step|reasoning/i,
    /complex|difficult|challenging/i,
  ],
  classification: [
    /classif|categoriz|label|tag|sort|group/i,
    /which\s+category|type\s+of/i,
  ],
  unknown: [],
};

// Complexity indicators
const COMPLEXITY_INDICATORS = {
  simple: {
    maxTokens: 500,
    patterns: [/simple|quick|brief|short|basic/i],
  },
  moderate: {
    maxTokens: 2000,
    patterns: [/detailed|thorough|complete/i],
  },
  complex: {
    maxTokens: 8000,
    patterns: [/complex|comprehensive|in-depth|extensive/i],
  },
  expert: {
    maxTokens: 32000,
    patterns: [/expert|professional|enterprise|advanced/i],
  },
};

class AIRoutingIntelligenceService {
  private metricsHistory: Map<string, { successRate: number; avgLatency: number; usageCount: number }> = new Map();

  /**
   * Classify the intent and characteristics of a query
   */
  classifyQuery(query: string, hasAttachments = false): QueryClassification {
    const reasoning: string[] = [];
    
    // Detect intent
    let intent: QueryIntent = 'unknown';
    let maxScore = 0;
    
    for (const [intentType, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          const score = pattern.toString().length; // Longer patterns = more specific
          if (score > maxScore) {
            maxScore = score;
            intent = intentType as QueryIntent;
          }
        }
      }
    }
    
    if (intent !== 'unknown') {
      reasoning.push(`Detected intent: ${intent} (confidence: ${Math.min(maxScore / 50, 1).toFixed(2)})`);
    } else {
      intent = 'conversational'; // Default fallback
      reasoning.push('No specific intent detected, defaulting to conversational');
    }
    
    // Detect complexity
    let complexity: ContentComplexity = 'moderate';
    for (const [level, config] of Object.entries(COMPLEXITY_INDICATORS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(query)) {
          complexity = level as ContentComplexity;
          reasoning.push(`Complexity indicator found: ${level}`);
          break;
        }
      }
    }
    
    // Estimate tokens
    const estimatedTokens = Math.ceil(query.length / 4) + 
      (complexity === 'simple' ? 200 : complexity === 'moderate' ? 500 : complexity === 'complex' ? 1500 : 4000);
    
    // Check for vision/reasoning requirements
    const requiresVision = hasAttachments || /image|photo|picture|screenshot/i.test(query);
    const requiresReasoning = /reason|logic|math|calculate|prove|analyze/i.test(query);
    
    if (requiresVision) reasoning.push('Vision capability required');
    if (requiresReasoning) reasoning.push('Advanced reasoning required');
    
    // Detect language (simple heuristic)
    const language = this.detectLanguage(query);
    if (language !== 'en') reasoning.push(`Detected language: ${language}`);
    
    // Suggest cost tier
    let suggestedCostTier: CostTier = 'standard';
    if (complexity === 'simple') suggestedCostTier = 'economy';
    if (complexity === 'complex' || requiresReasoning) suggestedCostTier = 'premium';
    if (complexity === 'expert') suggestedCostTier = 'enterprise';
    
    return {
      intent,
      confidence: Math.min(maxScore / 50, 0.95),
      complexity,
      estimatedTokens,
      requiresVision,
      requiresReasoning,
      language,
      suggestedCostTier,
      reasoning,
    };
  }

  /**
   * Get model recommendations based on query classification
   */
  getModelRecommendations(classification: QueryClassification): ModelRecommendation[] {
    const recommendations: ModelRecommendation[] = [];
    
    for (const [modelId, config] of Object.entries(MODEL_REGISTRY)) {
      // Filter by capabilities
      if (classification.requiresVision && !config.supportsVision) continue;
      if (classification.requiresReasoning && !config.supportsReasoning) continue;
      if (classification.estimatedTokens > config.contextWindow) continue;
      
      // Calculate score
      let score = config.qualityScore;
      
      // Bonus for intent match
      if (config.strengths.includes(classification.intent)) {
        score += 15;
      }
      
      // Cost tier alignment
      const costPerRequest = (classification.estimatedTokens * config.costPerInputToken) + 
        (classification.estimatedTokens * 0.5 * config.costPerOutputToken);
      
      if (classification.suggestedCostTier === 'economy' && costPerRequest < 0.01) {
        score += 10;
      } else if (classification.suggestedCostTier === 'enterprise' && config.qualityScore > 90) {
        score += 10;
      }
      
      // Historical performance bonus
      const metrics = this.metricsHistory.get(modelId);
      if (metrics && metrics.successRate > 0.95) {
        score += 5;
      }
      
      recommendations.push({
        modelId,
        provider: config.provider,
        displayName: config.displayName,
        score,
        estimatedCost: costPerRequest,
        estimatedLatency: config.avgLatencyMs,
        strengths: config.strengths.filter(s => s === classification.intent).map(s => s.replace(/_/g, ' ')),
        reasoning: `${config.displayName} scores ${score.toFixed(0)} for ${classification.intent} tasks`,
      });
    }
    
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Make a complete routing decision
   */
  makeRoutingDecision(query: string, hasAttachments = false): RoutingDecision {
    const classification = this.classifyQuery(query, hasAttachments);
    const recommendations = this.getModelRecommendations(classification);
    
    const primaryRecommendation = recommendations[0];
    const alternativeRecommendations = recommendations.slice(1, 4);
    
    // Find optimized options
    const costOptimizedOption = [...recommendations]
      .sort((a, b) => a.estimatedCost - b.estimatedCost)
      .find(r => r.score > 60) || null;
    
    const qualityOptimizedOption = [...recommendations]
      .sort((a, b) => b.score - a.score)[0] || null;
    
    const speedOptimizedOption = [...recommendations]
      .sort((a, b) => a.estimatedLatency - b.estimatedLatency)
      .find(r => r.score > 60) || null;
    
    return {
      classification,
      primaryRecommendation,
      alternativeRecommendations,
      costOptimizedOption,
      qualityOptimizedOption,
      speedOptimizedOption,
    };
  }

  /**
   * Record model usage metrics for learning
   */
  recordMetrics(modelId: string, success: boolean, latencyMs: number): void {
    const existing = this.metricsHistory.get(modelId);
    
    if (existing) {
      const newCount = existing.usageCount + 1;
      this.metricsHistory.set(modelId, {
        successRate: (existing.successRate * existing.usageCount + (success ? 1 : 0)) / newCount,
        avgLatency: (existing.avgLatency * existing.usageCount + latencyMs) / newCount,
        usageCount: newCount,
      });
    } else {
      this.metricsHistory.set(modelId, {
        successRate: success ? 1 : 0,
        avgLatency: latencyMs,
        usageCount: 1,
      });
    }
  }

  /**
   * Simple language detection heuristic
   */
  private detectLanguage(text: string): string {
    // Check for common language indicators
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh'; // Chinese
    if (/[\u3040-\u30ff]/.test(text)) return 'ja'; // Japanese
    if (/[\u0600-\u06ff]/.test(text)) return 'ar'; // Arabic
    if (/[\u0900-\u097f]/.test(text)) return 'hi'; // Hindi
    if (/[\u0400-\u04ff]/.test(text)) return 'ru'; // Russian
    return 'en';
  }

  /**
   * Get available models for a specific intent
   */
  getModelsForIntent(intent: QueryIntent): string[] {
    return Object.entries(MODEL_REGISTRY)
      .filter(([_, config]) => config.strengths.includes(intent))
      .map(([id]) => id);
  }
}

export const aiRoutingIntelligence = new AIRoutingIntelligenceService();
export default AIRoutingIntelligenceService;
