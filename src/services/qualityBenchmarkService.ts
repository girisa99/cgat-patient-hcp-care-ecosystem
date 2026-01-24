/**
 * Quality Benchmarks & Testing Strategy Service
 * Comprehensive quality standards for LLM, TTS, STT, and Translation
 * Based on industry benchmarks: MMLU, HellaSwag, C-Eval, BLEU, MOS scores
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export type QualityRating = 1 | 2 | 3 | 4 | 5;
export type NaturalnessRating = '★☆☆☆☆' | '★★☆☆☆' | '★★★☆☆' | '★★★★☆' | '★★★★★';
export type TestStatus = 'passing' | 'failing' | 'warning' | 'pending';

export interface LLMQualityBenchmark {
  language: string;
  languageCode: string;
  bestProvider: string;
  secondBest: string;
  avoid: string[];
  benchmarkSource: string;
  qualityScore: number; // 0-100
  notes?: string;
}

export interface TTSQualityBenchmark {
  language: string;
  languageCode: string;
  bestProvider: string;
  mosScore: number; // 1-5
  naturalness: NaturalnessRating;
  notes: string;
  supportsCloning: boolean;
  supportsEmotion: boolean;
}

export interface ProviderLatency {
  provider: string;
  typicalLatency: string;
  latencyMs: { min: number; max: number };
  bestRegions: string[];
  worstRegions: string[];
  notes: string;
}

export interface TestCriteria {
  testName: string;
  regionsToTest: string[];
  metrics: string;
  passCriteria: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ABTestConfig {
  testName: string;
  hypothesis: string;
  sampleSize: number;
  duration: string;
  providerA: string;
  providerB: string;
  targetLanguage?: string;
  status: 'planned' | 'running' | 'completed';
}

export interface QualityMetric {
  metricName: string;
  description: string;
  calculationMethod: string;
  thresholds: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LLM QUALITY BENCHMARKS BY LANGUAGE
// ═══════════════════════════════════════════════════════════════════════════════

export const LLM_QUALITY_BENCHMARKS: LLMQualityBenchmark[] = [
  // Claude Zone Languages
  { language: 'English', languageCode: 'en', bestProvider: 'claude-3.5-sonnet', secondBest: 'gpt-4o', avoid: [], benchmarkSource: 'MMLU, HellaSwag', qualityScore: 95 },
  { language: 'German', languageCode: 'de', bestProvider: 'claude-3.5-sonnet', secondBest: 'gpt-4o', avoid: ['gemini'], benchmarkSource: 'German NLU benchmarks', qualityScore: 92 },
  { language: 'French', languageCode: 'fr', bestProvider: 'claude-3.5-sonnet', secondBest: 'gpt-4o', avoid: [], benchmarkSource: 'FrenchBench', qualityScore: 93 },
  { language: 'Spanish', languageCode: 'es', bestProvider: 'claude-3.5-sonnet', secondBest: 'gpt-4o', avoid: [], benchmarkSource: 'BELEBELE', qualityScore: 91 },
  { language: 'Portuguese', languageCode: 'pt', bestProvider: 'claude-3.5-sonnet', secondBest: 'gpt-4o', avoid: [], benchmarkSource: 'BELEBELE', qualityScore: 90 },
  
  // Qwen Zone Languages (CJK)
  { language: 'Chinese', languageCode: 'zh', bestProvider: 'qwen-max', secondBest: 'gpt-4o', avoid: ['claude'], benchmarkSource: 'C-Eval, CMMLU', qualityScore: 96, notes: 'Native training data advantage' },
  { language: 'Japanese', languageCode: 'ja', bestProvider: 'qwen-max', secondBest: 'gpt-4o', avoid: ['gemini'], benchmarkSource: 'JCommonsenseQA', qualityScore: 94 },
  { language: 'Korean', languageCode: 'ko', bestProvider: 'qwen-max', secondBest: 'gpt-4o', avoid: [], benchmarkSource: 'KoBEST', qualityScore: 93 },
  
  // GPT-4 Zone (Arabic - KEY FINDING: Qwen struggles with Arabic)
  { language: 'Arabic', languageCode: 'ar', bestProvider: 'gpt-4o', secondBest: 'claude-3.5-sonnet', avoid: ['qwen'], benchmarkSource: 'ArabicNLU, AraBench', qualityScore: 88, notes: '⚠️ Qwen struggles with Arabic - use GPT-4o instead' },
  
  // Gemini Zone Languages
  { language: 'Hindi', languageCode: 'hi', bestProvider: 'gemini-1.5-pro', secondBest: 'gpt-4o', avoid: ['claude'], benchmarkSource: 'IndicNLU', qualityScore: 86 },
  { language: 'Indonesian', languageCode: 'id', bestProvider: 'gemini-1.5-pro', secondBest: 'gpt-4o', avoid: [], benchmarkSource: 'IndoNLU', qualityScore: 85 },
  { language: 'Vietnamese', languageCode: 'vi', bestProvider: 'gemini-1.5-pro', secondBest: 'gpt-4o', avoid: [], benchmarkSource: 'ViNLU', qualityScore: 84 },
  { language: 'Thai', languageCode: 'th', bestProvider: 'gemini-1.5-pro', secondBest: 'gpt-4o', avoid: [], benchmarkSource: 'ThaiNLU', qualityScore: 83 },
  { language: 'Swahili', languageCode: 'sw', bestProvider: 'gemini-1.5-pro', secondBest: 'gpt-4o', avoid: ['all limited'], benchmarkSource: 'AfricanNLP', qualityScore: 72, notes: 'Limited support across all providers' }
];

// ═══════════════════════════════════════════════════════════════════════════════
// TTS QUALITY BENCHMARKS BY LANGUAGE
// ═══════════════════════════════════════════════════════════════════════════════

export const TTS_QUALITY_BENCHMARKS: TTSQualityBenchmark[] = [
  // ElevenLabs Premium (Western Languages)
  { language: 'English (US)', languageCode: 'en-US', bestProvider: 'elevenlabs', mosScore: 4.5, naturalness: '★★★★★', notes: 'Best cloning, emotion', supportsCloning: true, supportsEmotion: true },
  { language: 'English (UK)', languageCode: 'en-GB', bestProvider: 'elevenlabs', mosScore: 4.4, naturalness: '★★★★★', notes: 'Excellent', supportsCloning: true, supportsEmotion: true },
  { language: 'German', languageCode: 'de', bestProvider: 'elevenlabs', mosScore: 4.3, naturalness: '★★★★☆', notes: 'Good, improving', supportsCloning: true, supportsEmotion: true },
  { language: 'French', languageCode: 'fr', bestProvider: 'elevenlabs', mosScore: 4.3, naturalness: '★★★★☆', notes: 'Good', supportsCloning: true, supportsEmotion: true },
  { language: 'Spanish', languageCode: 'es', bestProvider: 'elevenlabs', mosScore: 4.2, naturalness: '★★★★☆', notes: 'Good', supportsCloning: true, supportsEmotion: true },
  { language: 'Portuguese (BR)', languageCode: 'pt-BR', bestProvider: 'elevenlabs', mosScore: 4.2, naturalness: '★★★★☆', notes: 'Good', supportsCloning: true, supportsEmotion: true },
  
  // Alibaba CosyVoice (CJK - Best native prosody)
  { language: 'Chinese (Mandarin)', languageCode: 'zh-CN', bestProvider: 'alibaba-cosyvoice', mosScore: 4.6, naturalness: '★★★★★', notes: 'Native prosody best', supportsCloning: true, supportsEmotion: true },
  { language: 'Japanese', languageCode: 'ja', bestProvider: 'alibaba-cosyvoice', mosScore: 4.5, naturalness: '★★★★★', notes: 'Excellent pitch accent', supportsCloning: true, supportsEmotion: true },
  { language: 'Korean', languageCode: 'ko', bestProvider: 'alibaba-cosyvoice', mosScore: 4.4, naturalness: '★★★★★', notes: 'Natural intonation', supportsCloning: true, supportsEmotion: true },
  
  // Azure Neural (Arabic, Indian, SEA, African)
  { language: 'Arabic (Gulf)', languageCode: 'ar-SA', bestProvider: 'azure-neural', mosScore: 4.0, naturalness: '★★★★☆', notes: 'Good dialect support', supportsCloning: false, supportsEmotion: true },
  { language: 'Arabic (Egyptian)', languageCode: 'ar-EG', bestProvider: 'azure-neural', mosScore: 3.9, naturalness: '★★★★☆', notes: 'Acceptable', supportsCloning: false, supportsEmotion: true },
  { language: 'Hindi', languageCode: 'hi', bestProvider: 'azure-neural', mosScore: 4.1, naturalness: '★★★★☆', notes: 'Good, many voices', supportsCloning: false, supportsEmotion: true },
  { language: 'Indonesian', languageCode: 'id', bestProvider: 'azure-neural', mosScore: 4.0, naturalness: '★★★★☆', notes: 'Good', supportsCloning: false, supportsEmotion: true },
  { language: 'Swahili', languageCode: 'sw', bestProvider: 'azure-neural', mosScore: 3.5, naturalness: '★★★☆☆', notes: 'Limited but works', supportsCloning: false, supportsEmotion: false }
];

// ═══════════════════════════════════════════════════════════════════════════════
// LATENCY CONSIDERATIONS BY PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

export const PROVIDER_LATENCY: ProviderLatency[] = [
  { provider: 'claude', typicalLatency: '1-3s', latencyMs: { min: 1000, max: 3000 }, bestRegions: ['US', 'EU'], worstRegions: ['Asia', 'Africa'], notes: 'Use for quality, not speed' },
  { provider: 'gpt-4o', typicalLatency: '1-2s', latencyMs: { min: 1000, max: 2000 }, bestRegions: ['US', 'EU', 'Asia'], worstRegions: ['Africa'], notes: 'Good global coverage' },
  { provider: 'gemini', typicalLatency: '0.5-1.5s', latencyMs: { min: 500, max: 1500 }, bestRegions: ['India', 'SEA', 'Global'], worstRegions: [], notes: 'Fastest for many regions' },
  { provider: 'qwen', typicalLatency: '0.8-2s', latencyMs: { min: 800, max: 2000 }, bestRegions: ['China', 'Asia'], worstRegions: ['EU', 'Americas'], notes: 'Best in Asia-Pacific' },
  { provider: 'deepseek', typicalLatency: '0.5-1s', latencyMs: { min: 500, max: 1000 }, bestRegions: ['China', 'Asia'], worstRegions: ['Americas'], notes: 'Fast but variable' },
  { provider: 'elevenlabs', typicalLatency: '1-2s', latencyMs: { min: 1000, max: 2000 }, bestRegions: ['US', 'EU'], worstRegions: ['Asia', 'Africa'], notes: 'Streaming helps' },
  { provider: 'azure-tts', typicalLatency: '0.5-1s', latencyMs: { min: 500, max: 1000 }, bestRegions: ['Global'], worstRegions: [], notes: 'Best global latency' }
];

// ═══════════════════════════════════════════════════════════════════════════════
// TESTING MATRIX
// ═══════════════════════════════════════════════════════════════════════════════

export const TESTING_MATRIX: TestCriteria[] = [
  { testName: 'LLM Output Quality', regionsToTest: ['US', 'DE', 'JP', 'SA', 'IN', 'NG'], metrics: 'Human rating 1-5', passCriteria: '≥4.0 average', priority: 'critical' },
  { testName: 'LLM Factual Accuracy', regionsToTest: ['All regions'], metrics: 'Fact-check sample', passCriteria: '≥95% accurate', priority: 'critical' },
  { testName: 'TTS Naturalness', regionsToTest: ['Per language'], metrics: 'MOS score', passCriteria: '≥4.0 for premium, ≥3.5 for standard', priority: 'high' },
  { testName: 'TTS Pronunciation', regionsToTest: ['Per language'], metrics: 'Native speaker review', passCriteria: '≥90% correct', priority: 'high' },
  { testName: 'Translation Accuracy', regionsToTest: ['Per pair'], metrics: 'BLEU score + human', passCriteria: 'BLEU ≥40, human ≥4.0', priority: 'high' },
  { testName: 'End-to-End Latency', regionsToTest: ['All regions'], metrics: 'P95 response time', passCriteria: '≤10s for full pipeline', priority: 'critical' },
  { testName: 'Fallback Reliability', regionsToTest: ['All regions'], metrics: 'Fallback success rate', passCriteria: '≥99.5%', priority: 'critical' }
];

// ═══════════════════════════════════════════════════════════════════════════════
// A/B TESTING CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const AB_TEST_CONFIGS: ABTestConfig[] = [
  { testName: 'GPT-4 vs Qwen for Arabic', hypothesis: 'GPT-4 quality > Qwen for Arabic business content', sampleSize: 100, duration: '2 weeks', providerA: 'gpt-4o', providerB: 'qwen-max', targetLanguage: 'ar', status: 'planned' },
  { testName: 'Gemini vs Claude for Hindi', hypothesis: 'Gemini better for Hindi formal content', sampleSize: 100, duration: '2 weeks', providerA: 'gemini-1.5-pro', providerB: 'claude-3.5-sonnet', targetLanguage: 'hi', status: 'planned' },
  { testName: 'ElevenLabs vs Azure for Spanish', hypothesis: 'ElevenLabs premium justified for Spanish', sampleSize: 50, duration: '1 week', providerA: 'elevenlabs', providerB: 'azure-neural', targetLanguage: 'es', status: 'planned' },
  { testName: 'CosyVoice vs Azure for Japanese', hypothesis: 'CosyVoice native prosody preferred', sampleSize: 50, duration: '1 week', providerA: 'alibaba-cosyvoice', providerB: 'azure-neural', targetLanguage: 'ja', status: 'planned' }
];

// ═══════════════════════════════════════════════════════════════════════════════
// QUALITY MONITORING METRICS
// ═══════════════════════════════════════════════════════════════════════════════

export const QUALITY_MONITORING_METRICS: QualityMetric[] = [
  {
    metricName: 'User Satisfaction Rating',
    description: 'Thumbs up/down feedback per output',
    calculationMethod: '(thumbs_up / total_rated) * 100',
    thresholds: { excellent: 90, good: 80, acceptable: 70, poor: 60 }
  },
  {
    metricName: 'Regeneration Rate',
    description: 'How often users retry generation',
    calculationMethod: '(regeneration_clicks / total_generations) * 100',
    thresholds: { excellent: 5, good: 10, acceptable: 20, poor: 30 } // Lower is better
  },
  {
    metricName: 'Edit Rate',
    description: 'How much users modify output',
    calculationMethod: '(edited_outputs / total_outputs) * 100',
    thresholds: { excellent: 10, good: 20, acceptable: 35, poor: 50 } // Lower is better
  },
  {
    metricName: 'Support Tickets per 1000',
    description: 'Support tickets per 1000 outputs',
    calculationMethod: '(support_tickets / outputs) * 1000',
    thresholds: { excellent: 1, good: 3, acceptable: 5, poor: 10 } // Lower is better
  },
  {
    metricName: 'Time to First Success',
    description: 'Time from request to successful output',
    calculationMethod: 'avg(first_success_timestamp - request_timestamp)',
    thresholds: { excellent: 5000, good: 10000, acceptable: 15000, poor: 20000 } // ms, lower is better
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// QUALITY ASSESSMENT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function getLLMQualityForLanguage(languageCode: string): LLMQualityBenchmark | null {
  return LLM_QUALITY_BENCHMARKS.find(b => b.languageCode === languageCode) || null;
}

export function getTTSQualityForLanguage(languageCode: string): TTSQualityBenchmark | null {
  return TTS_QUALITY_BENCHMARKS.find(b => b.languageCode === languageCode) || null;
}

export function getProviderLatency(provider: string): ProviderLatency | null {
  return PROVIDER_LATENCY.find(p => p.provider === provider) || null;
}

export function assessQualityScore(
  metricName: string,
  value: number
): { status: TestStatus; label: string } {
  const metric = QUALITY_MONITORING_METRICS.find(m => m.metricName === metricName);
  if (!metric) return { status: 'pending', label: 'Unknown' };

  const { thresholds } = metric;
  const isLowerBetter = ['Regeneration Rate', 'Edit Rate', 'Support Tickets per 1000', 'Time to First Success'].includes(metricName);

  if (isLowerBetter) {
    if (value <= thresholds.excellent) return { status: 'passing', label: 'Excellent' };
    if (value <= thresholds.good) return { status: 'passing', label: 'Good' };
    if (value <= thresholds.acceptable) return { status: 'warning', label: 'Acceptable' };
    return { status: 'failing', label: 'Poor' };
  } else {
    if (value >= thresholds.excellent) return { status: 'passing', label: 'Excellent' };
    if (value >= thresholds.good) return { status: 'passing', label: 'Good' };
    if (value >= thresholds.acceptable) return { status: 'warning', label: 'Acceptable' };
    return { status: 'failing', label: 'Poor' };
  }
}

export function validateTestCriteria(
  testName: string,
  actualValue: number | string,
  region?: string
): { passed: boolean; message: string } {
  const test = TESTING_MATRIX.find(t => t.testName === testName);
  if (!test) return { passed: false, message: 'Test not found' };

  // Parse pass criteria
  const criteria = test.passCriteria;
  
  if (criteria.includes('≥')) {
    const threshold = parseFloat(criteria.replace(/[^\d.]/g, ''));
    const numValue = typeof actualValue === 'number' ? actualValue : parseFloat(actualValue);
    return {
      passed: numValue >= threshold,
      message: `${testName}: ${numValue} ${numValue >= threshold ? '≥' : '<'} ${threshold}`
    };
  }
  
  if (criteria.includes('≤')) {
    const threshold = parseFloat(criteria.replace(/[^\d.]/g, ''));
    const numValue = typeof actualValue === 'number' ? actualValue : parseFloat(actualValue);
    return {
      passed: numValue <= threshold,
      message: `${testName}: ${numValue} ${numValue <= threshold ? '≤' : '>'} ${threshold}`
    };
  }

  return { passed: true, message: 'Manual review required' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER RECOMMENDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export interface ProviderRecommendation {
  provider: string;
  qualityScore: number;
  latencyScore: number;
  costScore: number;
  overallScore: number;
  warnings: string[];
  recommendation: 'recommended' | 'acceptable' | 'avoid';
}

export function getProviderRecommendation(
  languageCode: string,
  taskType: 'llm' | 'tts' | 'stt' | 'translation',
  prioritize: 'quality' | 'speed' | 'cost' = 'quality'
): ProviderRecommendation {
  const warnings: string[] = [];
  let provider = '';
  let qualityScore = 0;
  let latencyScore = 0;
  let costScore = 0;

  if (taskType === 'llm') {
    const benchmark = getLLMQualityForLanguage(languageCode);
    if (benchmark) {
      provider = benchmark.bestProvider;
      qualityScore = benchmark.qualityScore;
      
      if (benchmark.avoid.length > 0) {
        warnings.push(`Avoid: ${benchmark.avoid.join(', ')}`);
      }
      if (benchmark.notes) {
        warnings.push(benchmark.notes);
      }
    }
  } else if (taskType === 'tts') {
    const benchmark = getTTSQualityForLanguage(languageCode);
    if (benchmark) {
      provider = benchmark.bestProvider;
      qualityScore = benchmark.mosScore * 20; // Convert 1-5 to 0-100
    }
  }

  // Get latency info
  const latencyInfo = getProviderLatency(provider.split('-')[0]);
  if (latencyInfo) {
    latencyScore = 100 - (latencyInfo.latencyMs.max / 50); // Normalize
  }

  // Cost scoring (simplified)
  const costMap: Record<string, number> = {
    'deepseek': 95,
    'gemini-1.5-pro': 90,
    'qwen-max': 85,
    'azure-neural': 80,
    'gpt-4o': 60,
    'claude-3.5-sonnet': 60,
    'elevenlabs': 40,
    'alibaba-cosyvoice': 70
  };
  costScore = costMap[provider] || 50;

  // Calculate overall based on priority
  let overallScore = 0;
  if (prioritize === 'quality') {
    overallScore = qualityScore * 0.6 + latencyScore * 0.2 + costScore * 0.2;
  } else if (prioritize === 'speed') {
    overallScore = qualityScore * 0.2 + latencyScore * 0.6 + costScore * 0.2;
  } else {
    overallScore = qualityScore * 0.2 + latencyScore * 0.2 + costScore * 0.6;
  }

  return {
    provider,
    qualityScore,
    latencyScore,
    costScore,
    overallScore,
    warnings,
    recommendation: overallScore >= 80 ? 'recommended' : overallScore >= 60 ? 'acceptable' : 'avoid'
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUALITY DASHBOARD AGGREGATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface QualityDashboardData {
  llmBenchmarks: LLMQualityBenchmark[];
  ttsBenchmarks: TTSQualityBenchmark[];
  latencyData: ProviderLatency[];
  testingMatrix: TestCriteria[];
  abTests: ABTestConfig[];
  monitoringMetrics: QualityMetric[];
  keyFindings: string[];
}

export function getQualityDashboardData(): QualityDashboardData {
  return {
    llmBenchmarks: LLM_QUALITY_BENCHMARKS,
    ttsBenchmarks: TTS_QUALITY_BENCHMARKS,
    latencyData: PROVIDER_LATENCY,
    testingMatrix: TESTING_MATRIX,
    abTests: AB_TEST_CONFIGS,
    monitoringMetrics: QUALITY_MONITORING_METRICS,
    keyFindings: [
      '⚠️ Qwen struggles with Arabic - use GPT-4o instead',
      'CJK/India/Africa routes are 90% cheaper than US/EU',
      'Alibaba CosyVoice has best native prosody for CJK',
      'Azure TTS has best global latency coverage',
      'Gemini is fastest for India, SEA, and Africa regions'
    ]
  };
}

// Export convenience access to all constants
export {
  LLM_QUALITY_BENCHMARKS as llmBenchmarks,
  TTS_QUALITY_BENCHMARKS as ttsBenchmarks,
  PROVIDER_LATENCY as providerLatency,
  TESTING_MATRIX as testingMatrix,
  AB_TEST_CONFIGS as abTestConfigs,
  QUALITY_MONITORING_METRICS as qualityMetrics
};
