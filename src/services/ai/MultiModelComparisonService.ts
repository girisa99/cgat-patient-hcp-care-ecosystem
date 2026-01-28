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

// Model display names
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'google/gemini-3-flash-preview': 'Gemini 3 Flash',
  'google/gemini-2.5-pro': 'Gemini 2.5 Pro',
  'google/gemini-2.5-flash': 'Gemini 2.5 Flash',
  'google/gemini-2.5-flash-lite': 'Gemini Flash Lite',
  'openai/gpt-5': 'GPT-5',
  'openai/gpt-5-mini': 'GPT-5 Mini',
  'openai/gpt-5-nano': 'GPT-5 Nano',
};

// Cost per token estimates
const COST_PER_TOKEN: Record<string, { input: number; output: number }> = {
  'google/gemini-3-flash-preview': { input: 0.00001, output: 0.00002 },
  'google/gemini-2.5-pro': { input: 0.00003, output: 0.00006 },
  'google/gemini-2.5-flash': { input: 0.000005, output: 0.00001 },
  'google/gemini-2.5-flash-lite': { input: 0.000002, output: 0.000004 },
  'openai/gpt-5': { input: 0.00005, output: 0.00015 },
  'openai/gpt-5-mini': { input: 0.00001, output: 0.00003 },
  'openai/gpt-5-nano': { input: 0.000003, output: 0.000006 },
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
   * Get available models for comparison
   */
  getAvailableModels(): Array<{ id: string; displayName: string; provider: string }> {
    return Object.entries(MODEL_DISPLAY_NAMES).map(([id, displayName]) => ({
      id,
      displayName,
      provider: id.split('/')[0],
    }));
  }
}

export const multiModelComparison = new MultiModelComparisonService();
export default MultiModelComparisonService;
