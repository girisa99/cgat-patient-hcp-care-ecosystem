/**
 * CONFIDENCE LOOP ENGINE
 * 
 * 95% Target Confidence with 5x Iteration Loop
 * Integrates with Label Studio for background feedback collection
 * 
 * Based on spec: Genie_180_Unified_Registry_v3_1.md
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ConfidenceResult {
  score: number;
  iteration: number;
  adjustments: string[];
  output: any;
  providers_used: string[];
  passed: boolean;
  durationMs: number;
}

export interface ConfidenceFactors {
  providerResponseQuality: number; // 25%
  languageAccuracy: number;        // 20%
  formatCompliance: number;        // 15%
  contentRelevance: number;        // 20%
  technicalQuality: number;        // 20%
}

export interface ConfidenceLoopConfig {
  targetConfidence: number;        // Default: 0.95 (95%)
  maxIterations: number;           // Default: 5
  minConfidenceImprovement: number; // Default: 0.05 (5%)
  enableLabelStudio: boolean;      // Default: true
  verboseLogging: boolean;         // Default: true
}

export interface IterationAdjustment {
  iteration: number;
  strategy: 'initial' | 'adjust_prompt' | 'switch_provider' | 'combine_outputs' | 'human_assisted';
  description: string;
}

// ═══════════════════════════════════════════════════════════════
// CONFIDENCE SCORING WEIGHTS
// ═══════════════════════════════════════════════════════════════

const CONFIDENCE_WEIGHTS = {
  providerResponseQuality: 0.25,
  languageAccuracy: 0.20,
  formatCompliance: 0.15,
  contentRelevance: 0.20,
  technicalQuality: 0.20
};

// Iteration strategies based on score
const ITERATION_STRATEGIES: IterationAdjustment[] = [
  { iteration: 1, strategy: 'initial', description: 'Initial generation with primary provider' },
  { iteration: 2, strategy: 'adjust_prompt', description: 'Adjust prompt, increase specificity' },
  { iteration: 3, strategy: 'switch_provider', description: 'Try secondary provider if score < 80%' },
  { iteration: 4, strategy: 'combine_outputs', description: 'Combine outputs from multiple providers' },
  { iteration: 5, strategy: 'human_assisted', description: 'Human-assisted refinement parameters' }
];

// ═══════════════════════════════════════════════════════════════
// CONFIDENCE LOOP ENGINE CLASS
// ═══════════════════════════════════════════════════════════════

export class ConfidenceLoopEngine {
  private config: ConfidenceLoopConfig;

  constructor(config: Partial<ConfidenceLoopConfig> = {}) {
    this.config = {
      targetConfidence: config.targetConfidence ?? 0.95,
      maxIterations: config.maxIterations ?? 5,
      minConfidenceImprovement: config.minConfidenceImprovement ?? 0.05,
      enableLabelStudio: config.enableLabelStudio ?? true,
      verboseLogging: config.verboseLogging ?? true
    };
  }

  /**
   * Execute pipeline with confidence loop
   */
  async executeWithConfidenceLoop(
    pipelineId: string,
    input: any,
    executePipeline: (input: any, provider: string, adjustments: string[]) => Promise<any>,
    selectProvider: (pipelineId: string, iteration: number, confidence: number) => string,
    calculateConfidence: (output: any, pipelineId: string) => Promise<ConfidenceFactors>
  ): Promise<ConfidenceResult> {
    const startTime = Date.now();
    let currentConfidence = 0;
    let iteration = 0;
    let output = null;
    let adjustments: string[] = [];
    let providersUsed: string[] = [];

    this.log(`🔄 Starting confidence loop for pipeline: ${pipelineId}`);
    this.log(`📊 Target confidence: ${(this.config.targetConfidence * 100).toFixed(0)}%`);

    while (currentConfidence < this.config.targetConfidence && iteration < this.config.maxIterations) {
      iteration++;
      const iterationStart = Date.now();

      // Get best provider for this iteration
      const provider = selectProvider(pipelineId, iteration, currentConfidence);
      providersUsed.push(provider);

      this.log(`\n━━━ Iteration ${iteration}/${this.config.maxIterations} ━━━`);
      this.log(`🔧 Provider: ${provider}`);
      this.log(`📝 Adjustments: ${adjustments.length > 0 ? adjustments.join(', ') : 'None'}`);

      // Execute pipeline
      try {
        output = await executePipeline(input, provider, adjustments);
      } catch (error) {
        this.log(`❌ Pipeline execution failed: ${error}`);
        continue;
      }

      // Calculate confidence
      const factors = await calculateConfidence(output, pipelineId);
      currentConfidence = this.calculateOverallConfidence(factors);

      this.log(`📈 Confidence: ${(currentConfidence * 100).toFixed(1)}%`);
      this.logFactors(factors);

      // Log to Label Studio for background feedback
      if (this.config.enableLabelStudio) {
        await this.logToLabelStudio({
          pipeline: pipelineId,
          iteration,
          confidence: currentConfidence,
          output_preview: this.getOutputPreview(output),
          input_hash: this.hashInput(input),
          provider,
          factors,
          duration_ms: Date.now() - iterationStart
        });
      }

      // Determine adjustments for next iteration
      if (currentConfidence < this.config.targetConfidence) {
        adjustments = this.determineAdjustments(output, currentConfidence, iteration);
        this.log(`🔄 Adjustments for next iteration: ${adjustments.join(', ')}`);
      }
    }

    const passed = currentConfidence >= this.config.targetConfidence;
    const durationMs = Date.now() - startTime;

    this.log(`\n${'═'.repeat(50)}`);
    this.log(`${passed ? '✅' : '⚠️'} Final confidence: ${(currentConfidence * 100).toFixed(1)}%`);
    this.log(`⏱️ Duration: ${durationMs}ms`);
    this.log(`🔄 Iterations: ${iteration}`);

    return {
      score: currentConfidence,
      iteration,
      adjustments,
      output,
      providers_used: providersUsed,
      passed,
      durationMs
    };
  }

  /**
   * Calculate overall confidence from factors
   */
  private calculateOverallConfidence(factors: ConfidenceFactors): number {
    return (
      factors.providerResponseQuality * CONFIDENCE_WEIGHTS.providerResponseQuality +
      factors.languageAccuracy * CONFIDENCE_WEIGHTS.languageAccuracy +
      factors.formatCompliance * CONFIDENCE_WEIGHTS.formatCompliance +
      factors.contentRelevance * CONFIDENCE_WEIGHTS.contentRelevance +
      factors.technicalQuality * CONFIDENCE_WEIGHTS.technicalQuality
    );
  }

  /**
   * Determine adjustments based on current state
   */
  private determineAdjustments(output: any, confidence: number, iteration: number): string[] {
    const adjustments: string[] = [];
    const strategy = ITERATION_STRATEGIES[iteration - 1] || ITERATION_STRATEGIES[4];

    switch (strategy.strategy) {
      case 'adjust_prompt':
        adjustments.push('increase_specificity');
        adjustments.push('add_examples');
        break;
      case 'switch_provider':
        if (confidence < 0.80) {
          adjustments.push('use_secondary_provider');
        }
        adjustments.push('retry_with_variations');
        break;
      case 'combine_outputs':
        adjustments.push('ensemble_approach');
        adjustments.push('merge_best_parts');
        break;
      case 'human_assisted':
        adjustments.push('apply_learned_refinements');
        adjustments.push('use_historical_feedback');
        break;
    }

    return adjustments;
  }

  /**
   * Log to Label Studio for RLHF feedback collection
   */
  private async logToLabelStudio(data: {
    pipeline: string;
    iteration: number;
    confidence: number;
    output_preview: string;
    input_hash: string;
    provider: string;
    factors: ConfidenceFactors;
    duration_ms: number;
  }): Promise<void> {
    try {
      // Log to local table for Label Studio sync
      await supabase.from('pipeline_feedback' as any).insert({
        pipeline_id: data.pipeline,
        confidence_score: data.confidence,
        iterations_used: data.iteration,
        provider_used: data.provider,
        input_hash: data.input_hash,
        quality_issues: JSON.stringify(data.factors),
        created_at: new Date().toISOString()
      });
    } catch (error) {
      this.log(`⚠️ Label Studio logging failed: ${error}`);
    }
  }

  /**
   * Get preview of output for logging
   */
  private getOutputPreview(output: any): string {
    if (typeof output === 'string') {
      return output.substring(0, 200);
    }
    if (output?.url) {
      return output.url;
    }
    return JSON.stringify(output).substring(0, 200);
  }

  /**
   * Hash input for deduplication
   */
  private hashInput(input: any): string {
    const str = JSON.stringify(input);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Log confidence factors
   */
  private logFactors(factors: ConfidenceFactors): void {
    this.log(`  📊 Provider Quality: ${(factors.providerResponseQuality * 100).toFixed(0)}%`);
    this.log(`  🌐 Language Accuracy: ${(factors.languageAccuracy * 100).toFixed(0)}%`);
    this.log(`  📋 Format Compliance: ${(factors.formatCompliance * 100).toFixed(0)}%`);
    this.log(`  🎯 Content Relevance: ${(factors.contentRelevance * 100).toFixed(0)}%`);
    this.log(`  ⚙️ Technical Quality: ${(factors.technicalQuality * 100).toFixed(0)}%`);
  }

  /**
   * Logging helper
   */
  private log(message: string): void {
    if (this.config.verboseLogging) {
      console.log(`[ConfidenceLoop] ${message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// FACTORY & SINGLETON
// ═══════════════════════════════════════════════════════════════

export function createConfidenceLoopEngine(config?: Partial<ConfidenceLoopConfig>): ConfidenceLoopEngine {
  return new ConfidenceLoopEngine(config);
}

// Default instance with 95% target
export const confidenceLoopEngine = new ConfidenceLoopEngine({
  targetConfidence: 0.95,
  maxIterations: 5,
  enableLabelStudio: true
});

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Default confidence calculator (can be overridden)
 */
export async function defaultCalculateConfidence(
  output: any,
  pipelineId: string
): Promise<ConfidenceFactors> {
  // AI self-assessment simulation
  // In production, this would call actual quality assessment APIs
  return {
    providerResponseQuality: 0.85 + Math.random() * 0.15,
    languageAccuracy: 0.80 + Math.random() * 0.20,
    formatCompliance: 0.90 + Math.random() * 0.10,
    contentRelevance: 0.85 + Math.random() * 0.15,
    technicalQuality: 0.80 + Math.random() * 0.20
  };
}

/**
 * Default provider selector based on 5-zone routing
 */
export function defaultSelectProvider(
  pipelineId: string,
  iteration: number,
  confidence: number
): string {
  // Primary providers by category
  const providerMap: Record<string, string[]> = {
    'text-to': ['OpenAI', 'Claude', 'Gemini'],
    'image-to': ['ModelsLab', 'OpenAI', 'Replicate'],
    'video-': ['ModelsLab', 'Alibaba', 'Replicate'],
    'audio-': ['ElevenLabs', 'Azure', 'OpenAI'],
    'podcast': ['ElevenLabs', 'Azure', 'OpenAI'],
    'default': ['OpenAI', 'Claude', 'Gemini']
  };

  // Find matching category
  let providers = providerMap.default;
  for (const [prefix, providerList] of Object.entries(providerMap)) {
    if (pipelineId.startsWith(prefix) || pipelineId.includes(prefix)) {
      providers = providerList;
      break;
    }
  }

  // Select based on iteration and confidence
  if (iteration <= 2) {
    return providers[0]; // Primary
  } else if (confidence < 0.80 && iteration === 3) {
    return providers[1]; // Secondary
  } else {
    return providers[Math.min(iteration - 1, providers.length - 1)];
  }
}
