/**
 * useContextualAIProviders Hook
 * 
 * Dynamic AI provider selection based on:
 * - Current Genie product (Deck, Spark, Mind, Vibe, Arc, Ask Genie)
 * - Task type (LLM, Translation, TTS, STT, Vision/OCR, Image Gen, Video Gen, NLP)
 * - User subscription tier
 * - Provider configuration status
 * 
 * Returns only relevant, configured providers for the current context
 */

import { useMemo, useCallback } from 'react';
import {
  getProvidersConfigurationStatus,
  getConfiguredFallbackChain,
  type ProviderConfig
} from '@/services/ai-hub/configuredProviders';
import type { AICapability, AIProviderKey } from '@/services/ai-hub/providerRegistry';

// ============================================
// TYPES
// ============================================

export type GenieProduct = 
  | 'spark'      // Content pipeline - needs LLM, Vision, Translation
  | 'deck'       // Presentations - needs LLM, Image Gen, Translation
  | 'mind'       // Script writing - needs LLM, TTS, Translation
  | 'vibe'       // Recording studio - needs TTS, STT, Audio
  | 'arc'        // Production hub - needs Video Gen, Image Gen, Audio
  | 'ask-genie'  // Universal assistant - all capabilities
  | 'hub'        // Command center - monitoring/overview
  | 'general';   // Default fallback

export type TaskScenario = 
  | 'chat'           // General conversation
  | 'script-gen'     // Script generation
  | 'translate'      // Translation
  | 'tts'            // Text-to-speech
  | 'stt'            // Speech-to-text
  | 'vision'         // Image analysis / OCR
  | 'image-gen'      // Image generation
  | 'video-gen'      // Video generation
  | 'audio-gen'      // Music/SFX generation
  | 'nlp'            // NLP tasks (sentiment, entities)
  | 'code-gen'       // Code generation
  | 'reasoning';     // Complex reasoning

export interface ProviderRecommendation {
  providerId: AIProviderKey;
  name: string;
  confidence: number;
  qualityScore: number;
  speedScore: number;
  costScore: number;
  isConfigured: boolean;
  reason: string;
  capabilities: AICapability[];
}

export interface ContextualProviderResult {
  recommendations: ProviderRecommendation[];
  fallbackChain: AIProviderKey[];
  primaryProvider: AIProviderKey | null;
  capabilityDescription: string;
  scenarioName: string;
  productName: string;
}

// ============================================
// PROVIDER SCORING MATRICES
// ============================================

// Map scenarios to required capabilities
const SCENARIO_CAPABILITIES: Record<TaskScenario, AICapability[]> = {
  'chat': ['llm'],
  'script-gen': ['llm'],
  'translate': ['translation'],
  'tts': ['tts'],
  'stt': ['stt'],
  'vision': ['vision', 'ocr'],
  'image-gen': ['image_gen'],
  'video-gen': ['video_gen'],
  'audio-gen': ['music_gen', 'sfx_gen'],
  'nlp': ['nlp'],
  'code-gen': ['llm'],
  'reasoning': ['llm'],
};

// Map products to their typical task scenarios
const PRODUCT_SCENARIOS: Record<GenieProduct, TaskScenario[]> = {
  'spark': ['chat', 'script-gen', 'vision', 'translate', 'nlp'],
  'deck': ['script-gen', 'image-gen', 'translate', 'nlp'],
  'mind': ['script-gen', 'translate', 'tts', 'nlp'],
  'vibe': ['tts', 'stt', 'audio-gen', 'nlp'],
  'arc': ['video-gen', 'image-gen', 'audio-gen', 'tts'],
  'ask-genie': ['chat', 'script-gen', 'translate', 'vision', 'nlp', 'reasoning', 'code-gen'],
  'hub': ['nlp', 'chat'],
  'general': ['chat', 'nlp'],
};

// Provider quality scores by capability (0-100)
const PROVIDER_CAPABILITY_SCORES: Record<string, Partial<Record<AICapability, { quality: number; speed: number; cost: number }>>> = {
  openai: {
    llm: { quality: 95, speed: 85, cost: 60 },
    vision: { quality: 92, speed: 80, cost: 55 },
    image_gen: { quality: 90, speed: 75, cost: 50 },
    tts: { quality: 88, speed: 85, cost: 65 },
    stt: { quality: 90, speed: 80, cost: 60 },
  },
  claude: {
    llm: { quality: 96, speed: 82, cost: 58 },
    vision: { quality: 90, speed: 78, cost: 55 },
  },
  gemini: {
    llm: { quality: 94, speed: 90, cost: 75 },
    vision: { quality: 93, speed: 88, cost: 70 },
    translation: { quality: 85, speed: 90, cost: 80 },
    image_gen: { quality: 85, speed: 88, cost: 70 },
  },
  deepseek: {
    llm: { quality: 88, speed: 85, cost: 90 },
  },
  deepl: {
    translation: { quality: 98, speed: 95, cost: 65 },
  },
  elevenlabs: {
    tts: { quality: 98, speed: 85, cost: 45 },
  },
  google: {
    translation: { quality: 90, speed: 95, cost: 80 },
    stt: { quality: 92, speed: 90, cost: 75 },
    tts: { quality: 85, speed: 90, cost: 80 },
    vision: { quality: 90, speed: 85, cost: 70 },
    ocr: { quality: 92, speed: 88, cost: 70 },
  },
  replicate: {
    image_gen: { quality: 92, speed: 70, cost: 60 },
    video_gen: { quality: 85, speed: 60, cost: 50 },
  },
  huggingface: {
    llm: { quality: 80, speed: 75, cost: 95 },
    nlp: { quality: 88, speed: 85, cost: 90 },
    image_gen: { quality: 85, speed: 70, cost: 85 },
  },
  alibaba: {
    llm: { quality: 85, speed: 88, cost: 85 },
    translation: { quality: 88, speed: 90, cost: 80 },
  },
  azure: {
    stt: { quality: 94, speed: 92, cost: 60 },
    tts: { quality: 92, speed: 90, cost: 60 },
    vision: { quality: 91, speed: 85, cost: 55 },
    ocr: { quality: 95, speed: 90, cost: 55 },
  },
  aws: {
    stt: { quality: 90, speed: 88, cost: 70 },
    tts: { quality: 88, speed: 90, cost: 70 },
    translation: { quality: 85, speed: 92, cost: 75 },
  },
  stability: {
    image_gen: { quality: 94, speed: 75, cost: 55 },
  },
};

// Scenario display names
const SCENARIO_NAMES: Record<TaskScenario, string> = {
  'chat': 'AI Chat & Conversation',
  'script-gen': 'Script & Content Generation',
  'translate': 'Translation & Localization',
  'tts': 'Text-to-Speech',
  'stt': 'Speech-to-Text',
  'vision': 'Vision & Image Analysis',
  'image-gen': 'Image Generation',
  'video-gen': 'Video Generation',
  'audio-gen': 'Audio & Music Generation',
  'nlp': 'NLP & Text Analysis',
  'code-gen': 'Code Generation',
  'reasoning': 'Complex Reasoning',
};

// Product display names
const PRODUCT_NAMES: Record<GenieProduct, string> = {
  'spark': 'Genie Spark',
  'deck': 'Genie Deck',
  'mind': 'Genie Mind',
  'vibe': 'Genie Vibe',
  'arc': 'Genie Arc / Production Hub',
  'ask-genie': 'Ask Genie',
  'hub': 'Genie Hub / Command Center',
  'general': 'General AI Assistant',
};

// Capability descriptions
const CAPABILITY_DESCRIPTIONS: Record<AICapability, string> = {
  llm: 'Large Language Model text generation',
  vision: 'Image understanding and analysis',
  ocr: 'Optical character recognition',
  translation: 'Multi-language translation',
  tts: 'Text-to-speech synthesis',
  stt: 'Speech-to-text transcription',
  image_gen: 'AI image generation',
  video_gen: 'AI video generation',
  music_gen: 'AI music composition',
  sfx_gen: 'Sound effects generation',
  nlp: 'Natural language processing',
};

// ============================================
// MAIN HOOK
// ============================================

export function useContextualAIProviders(
  product: GenieProduct = 'general',
  scenario?: TaskScenario
) {
  const providerConfigs = useMemo(() => getProvidersConfigurationStatus(), []);

  // Get required capabilities for current context
  const requiredCapabilities = useMemo((): AICapability[] => {
    if (scenario) {
      return SCENARIO_CAPABILITIES[scenario] || ['llm'];
    }
    // Aggregate capabilities from all product scenarios
    const productScenarios = PRODUCT_SCENARIOS[product] || ['chat'];
    const allCaps = new Set<AICapability>();
    productScenarios.forEach(s => {
      SCENARIO_CAPABILITIES[s]?.forEach(cap => allCaps.add(cap));
    });
    return Array.from(allCaps);
  }, [product, scenario]);

  // Get provider recommendations for current context
  const getRecommendations = useCallback(
    (targetCapability?: AICapability): ProviderRecommendation[] => {
      const caps = targetCapability ? [targetCapability] : requiredCapabilities;
      const recommendations: ProviderRecommendation[] = [];

      providerConfigs.forEach((config: ProviderConfig) => {
        // Check if provider has any of the required capabilities (use availableCapabilities)
        const matchingCaps = config.availableCapabilities.filter(cap => caps.includes(cap));
        if (matchingCaps.length === 0) return;

        // Calculate aggregate scores
        let totalQuality = 0;
        let totalSpeed = 0;
        let totalCost = 0;
        let scoreCount = 0;

        matchingCaps.forEach(cap => {
          const scores = PROVIDER_CAPABILITY_SCORES[config.providerId]?.[cap];
          if (scores) {
            totalQuality += scores.quality;
            totalSpeed += scores.speed;
            totalCost += scores.cost;
            scoreCount++;
          }
        });

        const avgQuality = scoreCount > 0 ? totalQuality / scoreCount : 70;
        const avgSpeed = scoreCount > 0 ? totalSpeed / scoreCount : 70;
        const avgCost = scoreCount > 0 ? totalCost / scoreCount : 70;

        // Check if configured (status === 'configured')
        const isConfigured = config.status === 'configured';

        // Calculate confidence based on configuration status and capability match
        let confidence = isConfigured ? 90 : 30;
        confidence += (matchingCaps.length / caps.length) * 10;
        confidence = Math.min(100, confidence);

        // Generate reason
        const capNames = matchingCaps.map(cap => CAPABILITY_DESCRIPTIONS[cap]).join(', ');
        const reason = isConfigured
          ? `Configured and ready for: ${capNames}`
          : `Requires API key for: ${capNames}`;

        recommendations.push({
          providerId: config.providerId,
          name: config.name,
          confidence,
          qualityScore: Math.round(avgQuality),
          speedScore: Math.round(avgSpeed),
          costScore: Math.round(avgCost),
          isConfigured,
          reason,
          capabilities: matchingCaps,
        });
      });

      // Sort by: configured first, then by confidence, then by quality
      return recommendations.sort((a, b) => {
        if (a.isConfigured !== b.isConfigured) return a.isConfigured ? -1 : 1;
        if (a.confidence !== b.confidence) return b.confidence - a.confidence;
        return b.qualityScore - a.qualityScore;
      });
    },
    [providerConfigs, requiredCapabilities]
  );

  // Get contextual result for current product/scenario
  const contextualResult = useMemo((): ContextualProviderResult => {
    const currentScenario = scenario || PRODUCT_SCENARIOS[product]?.[0] || 'chat';
    const recommendations = getRecommendations();
    
    // Get fallback chain for primary capability
    const primaryCap = requiredCapabilities[0] || 'llm';
    const fallbackChain = getConfiguredFallbackChain(primaryCap);

    // Build capability description
    const capDescription = requiredCapabilities
      .map(cap => CAPABILITY_DESCRIPTIONS[cap])
      .join(', ');

    return {
      recommendations,
      fallbackChain,
      primaryProvider: recommendations[0]?.isConfigured ? recommendations[0].providerId : null,
      capabilityDescription: capDescription,
      scenarioName: SCENARIO_NAMES[currentScenario] || 'AI Processing',
      productName: PRODUCT_NAMES[product] || 'Genie AI',
    };
  }, [product, scenario, requiredCapabilities, getRecommendations]);

  // Get recommendations filtered by specific capability
  const getForCapability = useCallback(
    (capability: AICapability) => getRecommendations(capability),
    [getRecommendations]
  );

  // Get best configured provider for a capability
  const getBestProvider = useCallback(
    (capability: AICapability): AIProviderKey | null => {
      const recs = getRecommendations(capability);
      const configured = recs.find(r => r.isConfigured);
      return configured?.providerId || null;
    },
    [getRecommendations]
  );

  // Check if any provider is available for a capability
  const hasCapability = useCallback(
    (capability: AICapability): boolean => {
      const recs = getRecommendations(capability);
      return recs.some(r => r.isConfigured);
    },
    [getRecommendations]
  );

  return {
    // Main result
    ...contextualResult,
    
    // Utility functions
    getForCapability,
    getBestProvider,
    hasCapability,
    
    // Meta info
    product,
    scenario: scenario || PRODUCT_SCENARIOS[product]?.[0] || 'chat',
    requiredCapabilities,
    
    // Static lookups
    allScenarios: Object.keys(SCENARIO_NAMES) as TaskScenario[],
    allProducts: Object.keys(PRODUCT_NAMES) as GenieProduct[],
    scenarioNames: SCENARIO_NAMES,
    productNames: PRODUCT_NAMES,
  };
}

export default useContextualAIProviders;
