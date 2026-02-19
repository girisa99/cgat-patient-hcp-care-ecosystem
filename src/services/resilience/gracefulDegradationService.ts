/**
 * Graceful Degradation Service
 * P4-REC-06: Fallback to lower quality when premium fails
 * 
 * Manages quality tier fallbacks across all 206 pipelines:
 * - Premium → Standard → Basic → Minimal
 * - Maintains user experience during provider outages
 * - Tracks degradation events for analytics
 */

import { circuitBreakerService } from './circuitBreakerService';

export type QualityTier = 'premium' | 'standard' | 'basic' | 'minimal';

export interface DegradationConfig {
  enableAutoDegradation: boolean;
  notifyUser: boolean;
  maxDegradationLevel: QualityTier;
  preserveEssentialFeatures: boolean;
  logDegradations: boolean;
}

export interface ProviderFallback {
  providerId: string;
  providerName: string;
  tier: QualityTier;
  capabilities: string[];
  costMultiplier: number;
  qualityScore: number; // 0-100
}

export interface DegradationEvent {
  id: string;
  timestamp: string;
  pipelineId: string;
  originalTier: QualityTier;
  degradedTier: QualityTier;
  reason: string;
  providersAttempted: string[];
  finalProvider: string | null;
  userNotified: boolean;
}

// Provider fallback chains by capability
const FALLBACK_CHAINS: Record<string, ProviderFallback[]> = {
  // LLM Text Generation
  llm_text: [
    { providerId: 'claude', providerName: 'Claude 3.5', tier: 'premium', capabilities: ['creative', 'reasoning', 'multilingual'], costMultiplier: 1.0, qualityScore: 98 },
    { providerId: 'openai', providerName: 'GPT-4o', tier: 'premium', capabilities: ['creative', 'reasoning', 'multilingual'], costMultiplier: 1.0, qualityScore: 97 },
    { providerId: 'gemini', providerName: 'Gemini Pro', tier: 'standard', capabilities: ['reasoning', 'multilingual'], costMultiplier: 0.7, qualityScore: 92 },
    { providerId: 'deepseek', providerName: 'DeepSeek V3', tier: 'basic', capabilities: ['reasoning'], costMultiplier: 0.3, qualityScore: 88 },
  ],
  
  // TTS Voice Generation
  tts_voice: [
    { providerId: 'elevenlabs', providerName: 'ElevenLabs', tier: 'premium', capabilities: ['cloning', 'emotions', 'hifi'], costMultiplier: 1.0, qualityScore: 98 },
    { providerId: 'azure-tts', providerName: 'Azure Neural', tier: 'standard', capabilities: ['visemes', 'ssml'], costMultiplier: 0.5, qualityScore: 90 },
    { providerId: 'alibaba-qwen3-tts', providerName: 'Qwen3-TTS', tier: 'standard', capabilities: ['cjk', 'emotions'], costMultiplier: 0.4, qualityScore: 88 },
    { providerId: 'browser-tts', providerName: 'Browser TTS', tier: 'minimal', capabilities: ['basic'], costMultiplier: 0, qualityScore: 60 },
  ],
  
  // Image Generation
  image_generation: [
    { providerId: 'modelslab', providerName: 'ModelsLab SDXL', tier: 'premium', capabilities: ['4k', 'styles', 'controlnet'], costMultiplier: 1.0, qualityScore: 95 },
    { providerId: 'replicate', providerName: 'Replicate Flux', tier: 'standard', capabilities: ['hd', 'styles'], costMultiplier: 0.7, qualityScore: 90 },
    { providerId: 'gemini-vision', providerName: 'Gemini Vision', tier: 'basic', capabilities: ['basic'], costMultiplier: 0.3, qualityScore: 75 },
  ],
  
  // Video Generation
  video_generation: [
    { providerId: 'modelslab-video', providerName: 'ModelsLab Video', tier: 'premium', capabilities: ['4k', 'long-form'], costMultiplier: 1.0, qualityScore: 92 },
    { providerId: 'alibaba-wan', providerName: 'Alibaba Wan2.2', tier: 'standard', capabilities: ['hd', 'fast'], costMultiplier: 0.6, qualityScore: 85 },
    { providerId: 'replicate-video', providerName: 'Replicate Video', tier: 'basic', capabilities: ['basic'], costMultiplier: 0.4, qualityScore: 78 },
  ],
  
  // Translation
  translation: [
    { providerId: 'deepl', providerName: 'DeepL', tier: 'premium', capabilities: ['context', 'formality', '30-languages'], costMultiplier: 1.0, qualityScore: 98 },
    { providerId: 'google-translate', providerName: 'Google Translate', tier: 'standard', capabilities: ['140-languages'], costMultiplier: 0.5, qualityScore: 88 },
    { providerId: 'gemini-translate', providerName: 'Gemini Translate', tier: 'basic', capabilities: ['basic'], costMultiplier: 0.3, qualityScore: 82 },
  ],
  
  // 3D Generation
  mesh_3d: [
    { providerId: 'meshy-ai', providerName: 'Meshy AI', tier: 'premium', capabilities: ['textured', 'animated'], costMultiplier: 1.0, qualityScore: 90 },
    { providerId: 'modelslab-3d', providerName: 'ModelsLab 3D', tier: 'standard', capabilities: ['basic-mesh'], costMultiplier: 0.6, qualityScore: 80 },
  ],
  
  // Avatar Generation
  avatar: [
    { providerId: 'alibaba-wan22', providerName: 'Alibaba Wan 2.2', tier: 'premium', capabilities: ['lipsync', 'gestures', 'custom'], costMultiplier: 0.5, qualityScore: 92 },
    { providerId: 'modelslab-avatar', providerName: 'ModelsLab Avatar', tier: 'standard', capabilities: ['lipsync', 'preset'], costMultiplier: 0.5, qualityScore: 82 },
  ],
};

// Tier priority order
const TIER_ORDER: QualityTier[] = ['premium', 'standard', 'basic', 'minimal'];

class GracefulDegradationService {
  private config: DegradationConfig = {
    enableAutoDegradation: true,
    notifyUser: true,
    maxDegradationLevel: 'basic',
    preserveEssentialFeatures: true,
    logDegradations: true,
  };

  private degradationHistory: DegradationEvent[] = [];
  private activeDegrade: Map<string, QualityTier> = new Map();

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  updateConfig(config: Partial<DegradationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): DegradationConfig {
    return { ...this.config };
  }

  // ============================================================================
  // PROVIDER SELECTION
  // ============================================================================

  /**
   * Get the best available provider for a capability
   */
  getBestAvailableProvider(
    capability: string,
    preferredTier?: QualityTier
  ): ProviderFallback | null {
    const chain = FALLBACK_CHAINS[capability];
    if (!chain) {
      console.warn(`[GracefulDegradation] Unknown capability: ${capability}`);
      return null;
    }

    const maxTierIndex = TIER_ORDER.indexOf(this.config.maxDegradationLevel);
    const startTierIndex = preferredTier ? TIER_ORDER.indexOf(preferredTier) : 0;

    // Find first available provider within allowed tier range
    for (let i = startTierIndex; i <= maxTierIndex; i++) {
      const tierProviders = chain.filter(
        p => TIER_ORDER.indexOf(p.tier) === i
      );

      for (const provider of tierProviders) {
        if (circuitBreakerService.isAvailable(provider.providerId)) {
          return provider;
        }
      }
    }

    return null;
  }

  /**
   * Get all available providers for a capability, ordered by preference
   */
  getAvailableProviders(capability: string): ProviderFallback[] {
    const chain = FALLBACK_CHAINS[capability];
    if (!chain) return [];

    return chain.filter(provider =>
      circuitBreakerService.isAvailable(provider.providerId) &&
      TIER_ORDER.indexOf(provider.tier) <= TIER_ORDER.indexOf(this.config.maxDegradationLevel)
    );
  }

  /**
   * Execute with automatic degradation fallback
   */
  async executeWithFallback<T>(
    capability: string,
    pipelineId: string,
    execute: (provider: ProviderFallback) => Promise<T>,
    options?: {
      preferredTier?: QualityTier;
      onDegrade?: (from: QualityTier, to: QualityTier, provider: string) => void;
    }
  ): Promise<{ result: T; usedProvider: ProviderFallback; degraded: boolean }> {
    const chain = FALLBACK_CHAINS[capability];
    if (!chain?.length) {
      throw new Error(`No providers configured for capability: ${capability}`);
    }

    const providersAttempted: string[] = [];
    const originalTier = options?.preferredTier || 'premium';
    let lastError: Error | null = null;

    // Try each provider in the fallback chain
    for (const provider of this.getAvailableProviders(capability)) {
      providersAttempted.push(provider.providerId);

      try {
        const result = await execute(provider);
        
        // Record success
        circuitBreakerService.recordSuccess(provider.providerId);
        
        const degraded = provider.tier !== originalTier;
        
        if (degraded) {
          this.recordDegradation(pipelineId, originalTier, provider.tier, 
            'Provider fallback', providersAttempted, provider.providerId);
          options?.onDegrade?.(originalTier, provider.tier, provider.providerName);
        }

        return { result, usedProvider: provider, degraded };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        circuitBreakerService.recordFailure(provider.providerId, lastError);
        console.warn(`[GracefulDegradation] ${provider.providerName} failed:`, error);
      }
    }

    // All providers failed
    this.recordDegradation(pipelineId, originalTier, 'minimal', 
      'All providers failed', providersAttempted, null);
    
    throw new Error(`All providers failed for ${capability}. Last error: ${lastError?.message}`);
  }

  // ============================================================================
  // DEGRADATION TRACKING
  // ============================================================================

  private recordDegradation(
    pipelineId: string,
    originalTier: QualityTier,
    degradedTier: QualityTier,
    reason: string,
    providersAttempted: string[],
    finalProvider: string | null
  ): void {
    if (!this.config.logDegradations) return;

    const event: DegradationEvent = {
      id: `deg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      pipelineId,
      originalTier,
      degradedTier,
      reason,
      providersAttempted,
      finalProvider,
      userNotified: this.config.notifyUser,
    };

    this.degradationHistory.push(event);
    this.activeDegrade.set(pipelineId, degradedTier);

    // Keep history bounded
    if (this.degradationHistory.length > 100) {
      this.degradationHistory = this.degradationHistory.slice(-100);
    }

    console.info(`[GracefulDegradation] ${pipelineId}: ${originalTier} → ${degradedTier} (${reason})`);
  }

  getDegradationHistory(): DegradationEvent[] {
    return [...this.degradationHistory];
  }

  getCurrentDegradations(): Map<string, QualityTier> {
    return new Map(this.activeDegrade);
  }

  clearDegradation(pipelineId: string): void {
    this.activeDegrade.delete(pipelineId);
  }

  // ============================================================================
  // QUALITY METRICS
  // ============================================================================

  getQualityMetrics(): {
    currentQuality: number;
    degradedPipelines: number;
    avgQualityScore: number;
    providerHealth: Record<string, boolean>;
  } {
    const allProviders = Object.values(FALLBACK_CHAINS).flat();
    const uniqueProviders = [...new Set(allProviders.map(p => p.providerId))];
    
    const providerHealth: Record<string, boolean> = {};
    uniqueProviders.forEach(id => {
      providerHealth[id] = circuitBreakerService.isAvailable(id);
    });

    const availableProviders = allProviders.filter(p => providerHealth[p.providerId]);
    const avgQualityScore = availableProviders.length > 0
      ? availableProviders.reduce((sum, p) => sum + p.qualityScore, 0) / availableProviders.length
      : 0;

    const circuitStats = circuitBreakerService.getCircuitStats();

    return {
      currentQuality: circuitStats.overallHealth,
      degradedPipelines: this.activeDegrade.size,
      avgQualityScore,
      providerHealth,
    };
  }

  getFallbackChains(): Record<string, ProviderFallback[]> {
    return { ...FALLBACK_CHAINS };
  }
}

// Singleton
export const gracefulDegradationService = new GracefulDegradationService();
