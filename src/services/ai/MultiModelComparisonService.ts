/**
 * Multi-Model Comparison Service - Phase 2
 * 
 * Enables side-by-side AI model comparison with response quality scoring
 */

import { supabase } from '@/integrations/supabase/client';

export interface ComparisonRequest {
  prompt: string;
  systemPrompt?: string;
  models: string[];
  maxTokens?: number;
  temperature?: number;
}

export interface ModelResponse {
  modelId: string;
  provider: string;
  displayName: string;
  content: string;
  latencyMs: number;
  tokenCount: number;
  estimatedCost: number;
  timestamp: Date;
  error?: string;
}

export interface QualityMetrics {
  relevance: number;      // 0-100: How relevant to the prompt
  coherence: number;      // 0-100: How well-structured
  creativity: number;     // 0-100: Originality of response
  accuracy: number;       // 0-100: Factual correctness (estimated)
  completeness: number;   // 0-100: How complete the answer is
  overall: number;        // 0-100: Weighted average
}

export interface ComparisonResult {
  id: string;
  request: ComparisonRequest;
  responses: ModelResponse[];
  qualityScores: Map<string, QualityMetrics>;
  winner: string | null;
  timestamp: Date;
}

// Full 19 Provider Model Registry
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // Google Gemini
  'google/gemini-3-flash-preview': 'Gemini 3 Flash',
  'google/gemini-2.5-pro': 'Gemini 2.5 Pro',
  'google/gemini-2.5-flash': 'Gemini 2.5 Flash',
  'google/gemini-2.5-flash-lite': 'Gemini Flash Lite',
  // OpenAI
  'openai/gpt-5': 'GPT-5',
  'openai/gpt-5-mini': 'GPT-5 Mini',
  'openai/gpt-5-nano': 'GPT-5 Nano',
  // Anthropic Claude
  'anthropic/claude-3-opus': 'Claude 3 Opus',
  'anthropic/claude-3-sonnet': 'Claude 3 Sonnet',
  'anthropic/claude-3-haiku': 'Claude 3 Haiku',
  // DeepSeek
  'deepseek/deepseek-v3': 'DeepSeek V3',
  'deepseek/deepseek-coder': 'DeepSeek Coder',
  // Alibaba Qwen
  'alibaba/qwen-max': 'Qwen Max',
  'alibaba/qwen-turbo': 'Qwen Turbo',
  'alibaba/qwen-vl': 'Qwen VL (Vision)',
  // Azure
  'azure/gpt-4o': 'Azure GPT-4o',
  'azure/gpt-4o-mini': 'Azure GPT-4o Mini',
  // ModelsLab
  'modelslab/flux-pro': 'FLUX Pro',
  'modelslab/flux-schnell': 'FLUX Schnell',
  'modelslab/animatediff': 'AnimateDiff',
  // ElevenLabs
  'elevenlabs/multilingual-v2': 'ElevenLabs Multilingual',
  'elevenlabs/turbo-v2': 'ElevenLabs Turbo',
  // Azure Speech
  'azure/neural-tts': 'Azure Neural TTS',
  // Alibaba Qwen3-TTS
  'alibaba/qwen3-tts': 'Qwen3-TTS',
  // Meshy AI
  'meshy/text-to-3d': 'Meshy Text-to-3D',
  // Replicate
  'replicate/llama-3-70b': 'Llama 3 70B',
  // DeepL
  'deepl/translator': 'DeepL Translator',
  // Azure Doc Intelligence
  'azure/doc-intelligence': 'Azure Doc Intelligence',
};

// Provider categories for filtering
const PROVIDER_CATEGORIES: Record<string, string[]> = {
  text_llm: ['google/gemini-3-flash-preview', 'google/gemini-2.5-pro', 'google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite', 
             'openai/gpt-5', 'openai/gpt-5-mini', 'openai/gpt-5-nano',
             'anthropic/claude-3-opus', 'anthropic/claude-3-sonnet', 'anthropic/claude-3-haiku',
             'deepseek/deepseek-v3', 'deepseek/deepseek-coder',
             'alibaba/qwen-max', 'alibaba/qwen-turbo',
             'azure/gpt-4o', 'azure/gpt-4o-mini',
             'replicate/llama-3-70b'],
  vision: ['google/gemini-2.5-pro', 'openai/gpt-5', 'anthropic/claude-3-opus', 'anthropic/claude-3-sonnet', 
           'alibaba/qwen-vl', 'azure/gpt-4o'],
  image_gen: ['modelslab/flux-pro', 'modelslab/flux-schnell', 'meshy/text-to-3d'],
  video_gen: ['modelslab/animatediff'],
  audio_tts: ['elevenlabs/multilingual-v2', 'elevenlabs/turbo-v2', 'azure/neural-tts', 'alibaba/qwen3-tts'],
  translation: ['deepl/translator', 'alibaba/qwen-turbo', 'deepseek/deepseek-v3'],
  document: ['azure/doc-intelligence', 'alibaba/qwen-vl'],
};

// Cost per token estimates - Full provider coverage
const COST_PER_TOKEN: Record<string, { input: number; output: number }> = {
  // Google Gemini
  'google/gemini-3-flash-preview': { input: 0.00001, output: 0.00002 },
  'google/gemini-2.5-pro': { input: 0.00003, output: 0.00006 },
  'google/gemini-2.5-flash': { input: 0.000005, output: 0.00001 },
  'google/gemini-2.5-flash-lite': { input: 0.000002, output: 0.000004 },
  // OpenAI
  'openai/gpt-5': { input: 0.00005, output: 0.00015 },
  'openai/gpt-5-mini': { input: 0.00001, output: 0.00003 },
  'openai/gpt-5-nano': { input: 0.000003, output: 0.000006 },
  // Anthropic Claude
  'anthropic/claude-3-opus': { input: 0.00004, output: 0.00012 },
  'anthropic/claude-3-sonnet': { input: 0.00001, output: 0.00003 },
  'anthropic/claude-3-haiku': { input: 0.000003, output: 0.000006 },
  // DeepSeek
  'deepseek/deepseek-v3': { input: 0.000002, output: 0.000004 },
  'deepseek/deepseek-coder': { input: 0.000002, output: 0.000004 },
  // Alibaba
  'alibaba/qwen-max': { input: 0.00002, output: 0.00004 },
  'alibaba/qwen-turbo': { input: 0.000005, output: 0.00001 },
  'alibaba/qwen-vl': { input: 0.00002, output: 0.00004 },
  // Azure
  'azure/gpt-4o': { input: 0.00003, output: 0.00009 },
  'azure/gpt-4o-mini': { input: 0.000008, output: 0.000024 },
  // ModelsLab (per-request pricing)
  'modelslab/flux-pro': { input: 0.0001, output: 0 },
  'modelslab/flux-schnell': { input: 0.00003, output: 0 },
  'modelslab/animatediff': { input: 0.0002, output: 0 },
  // ElevenLabs (per-character)
  'elevenlabs/multilingual-v2': { input: 0.0001, output: 0 },
  'elevenlabs/turbo-v2': { input: 0.00005, output: 0 },
  // Azure Speech
  'azure/neural-tts': { input: 0.00004, output: 0 },
  // Alibaba Qwen3-TTS
  'alibaba/qwen3-tts': { input: 0.00003, output: 0 },
  // Meshy AI
  'meshy/text-to-3d': { input: 0.001, output: 0 },
  // Replicate
  'replicate/llama-3-70b': { input: 0.00001, output: 0.00002 },
  // DeepL
  'deepl/translator': { input: 0.00005, output: 0 },
  // Azure Doc Intelligence
  'azure/doc-intelligence': { input: 0.0001, output: 0 },
};

class MultiModelComparisonService {
  private comparisonHistory: ComparisonResult[] = [];

  /**
   * Run a comparison across multiple models
   */
  async runComparison(request: ComparisonRequest): Promise<ComparisonResult> {
    const startTime = Date.now();
    const responses: ModelResponse[] = [];
    
    // Run all model requests in parallel
    const promises = request.models.map(async (modelId) => {
      const modelStart = Date.now();
      
      try {
        const provider = modelId.split('/')[0];
        
        const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            provider,
            model: modelId,
            prompt: request.prompt,
            systemPrompt: request.systemPrompt || 'You are a helpful AI assistant.',
            temperature: request.temperature || 0.7,
            maxTokens: request.maxTokens || 1000,
            action: 'generate'
          }
        });
        
        const latencyMs = Date.now() - modelStart;
        const content = data?.content || '';
        const tokenCount = Math.ceil(content.length / 4);
        const costInfo = COST_PER_TOKEN[modelId] || { input: 0.00001, output: 0.00002 };
        const inputTokens = Math.ceil(request.prompt.length / 4);
        const estimatedCost = (inputTokens * costInfo.input) + (tokenCount * costInfo.output);
        
        return {
          modelId,
          provider,
          displayName: MODEL_DISPLAY_NAMES[modelId] || modelId,
          content,
          latencyMs,
          tokenCount,
          estimatedCost,
          timestamp: new Date(),
          error: error?.message,
        } as ModelResponse;
      } catch (error) {
        return {
          modelId,
          provider: modelId.split('/')[0],
          displayName: MODEL_DISPLAY_NAMES[modelId] || modelId,
          content: '',
          latencyMs: Date.now() - modelStart,
          tokenCount: 0,
          estimatedCost: 0,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        } as ModelResponse;
      }
    });
    
    const results = await Promise.all(promises);
    responses.push(...results);
    
    // Calculate quality scores
    const qualityScores = new Map<string, QualityMetrics>();
    for (const response of responses) {
      if (!response.error && response.content) {
        qualityScores.set(response.modelId, this.calculateQualityMetrics(request.prompt, response.content));
      }
    }
    
    // Determine winner
    let winner: string | null = null;
    let highestScore = 0;
    for (const [modelId, metrics] of qualityScores) {
      if (metrics.overall > highestScore) {
        highestScore = metrics.overall;
        winner = modelId;
      }
    }
    
    const result: ComparisonResult = {
      id: crypto.randomUUID(),
      request,
      responses,
      qualityScores,
      winner,
      timestamp: new Date(),
    };
    
    this.comparisonHistory.push(result);
    return result;
  }

  /**
   * Calculate quality metrics for a response
   */
  private calculateQualityMetrics(prompt: string, response: string): QualityMetrics {
    // Relevance: Check for keyword overlap with prompt
    const promptWords = new Set(prompt.toLowerCase().split(/\s+/));
    const responseWords = response.toLowerCase().split(/\s+/);
    const relevantWords = responseWords.filter(w => promptWords.has(w) || w.length > 6);
    const relevance = Math.min(100, (relevantWords.length / responseWords.length) * 200);
    
    // Coherence: Check sentence structure and length consistency
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / Math.max(sentences.length, 1);
    const coherence = avgSentenceLength > 5 && avgSentenceLength < 30 ? 85 : 65;
    
    // Creativity: Check for unique words and varied vocabulary
    const uniqueWords = new Set(responseWords);
    const vocabularyDiversity = uniqueWords.size / Math.max(responseWords.length, 1);
    const creativity = Math.min(100, vocabularyDiversity * 200);
    
    // Accuracy: Heuristic based on presence of qualifiers and confident language
    const hasQualifiers = /perhaps|maybe|might|could|possibly/i.test(response);
    const hasConfidentLanguage = /definitely|certainly|clearly|obviously/i.test(response);
    const accuracy = hasConfidentLanguage && !hasQualifiers ? 80 : hasQualifiers ? 70 : 75;
    
    // Completeness: Based on response length relative to prompt complexity
    const promptComplexity = prompt.length / 100;
    const expectedLength = Math.min(promptComplexity * 200, 1000);
    const completeness = Math.min(100, (response.length / expectedLength) * 100);
    
    // Overall weighted average
    const overall = (
      relevance * 0.25 +
      coherence * 0.2 +
      creativity * 0.15 +
      accuracy * 0.2 +
      completeness * 0.2
    );
    
    return {
      relevance: Math.round(relevance),
      coherence: Math.round(coherence),
      creativity: Math.round(creativity),
      accuracy: Math.round(accuracy),
      completeness: Math.round(completeness),
      overall: Math.round(overall),
    };
  }

  /**
   * Get comparison history
   */
  getHistory(): ComparisonResult[] {
    return [...this.comparisonHistory];
  }

  /**
   * Clear comparison history
   */
  clearHistory(): void {
    this.comparisonHistory = [];
  }

  /**
   * Get available models for comparison, optionally filtered by category
   */
  getAvailableModels(category?: keyof typeof PROVIDER_CATEGORIES): Array<{ id: string; displayName: string; provider: string }> {
    const modelIds = category 
      ? PROVIDER_CATEGORIES[category] || Object.keys(MODEL_DISPLAY_NAMES)
      : Object.keys(MODEL_DISPLAY_NAMES);
    
    return modelIds.map((id) => ({
      id,
      displayName: MODEL_DISPLAY_NAMES[id] || id,
      provider: id.split('/')[0],
    }));
  }

  /**
   * Get available provider categories
   */
  getProviderCategories(): string[] {
    return Object.keys(PROVIDER_CATEGORIES);
  }

  /**
   * Get models by provider
   */
  getModelsByProvider(provider: string): Array<{ id: string; displayName: string }> {
    return Object.entries(MODEL_DISPLAY_NAMES)
      .filter(([id]) => id.startsWith(`${provider}/`))
      .map(([id, displayName]) => ({ id, displayName }));
  }
}

export const multiModelComparison = new MultiModelComparisonService();
export default MultiModelComparisonService;
