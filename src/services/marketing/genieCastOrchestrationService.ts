/**
 * Genie Cast Unified Orchestration Service
 * 
 * Ties together:
 * - Screenshots (captured/manual)
 * - AI Messaging (hooks, CTAs, positioning)
 * - Script Generation (localized per language)
 * - Video Assembly (regional TTS + visuals)
 * - Matrix Generation (language × product × tier)
 * 
 * Single source of truth for video generation pipeline.
 */

import { supabase } from '@/integrations/supabase/client';
import { aiMessagingGeneratorService, type GeneratedMessaging } from './aiMessagingGeneratorService';
import { GENIE_PRODUCTS, type GenieProductId } from './productVersionTrackingService';

// ============================================================================
// Types
// ============================================================================

export interface ProductScreenshot {
  id: string;
  productId: GenieProductId;
  screenId: string;
  screenName: string;
  imageUrl: string;
  order: number;
  capturedAt: Date;
  captureMethod: 'auto' | 'manual';
  isOutdated: boolean;
}

export interface LocalizedScript {
  languageCode: string;
  languageName: string;
  chapterId: string;
  productId: GenieProductId;
  script: string;
  hook: string;
  cta: string;
  duration: number;
  ttsProvider: string;
  voiceId: string;
}

export interface VideoGenerationRequest {
  id: string;
  mode: 'quick' | 'matrix' | 'feature';
  languages: string[];
  products: GenieProductId[];
  tiers?: string[];
  useApprovedMessaging: boolean;
  includeScreenshots: boolean;
  quality: 'preview' | 'production' | 'cinematic';
  fullProductionMode?: {
    enableAvatar: boolean;
    enable3D: boolean;
    enableAnimations: boolean;
  };
}

export interface GenerationPipeline {
  requestId: string;
  totalJobs: number;
  completedJobs: number;
  currentJob?: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  results: Array<{
    jobId: string;
    language: string;
    product: string;
    tier?: string;
    videoUrl?: string;
    error?: string;
    duration: number;
  }>;
}

export interface MessagingContext {
  productId: GenieProductId;
  featureId?: string;
  languageCode: string;
  messaging: GeneratedMessaging | null;
  fallbackScript: string;
}

// ============================================================================
// Constants
// ============================================================================

export const TTS_PROVIDERS = {
  en: { provider: 'elevenlabs', voiceId: 'pNInz6obpgDQGcFmaJgB' },
  es: { provider: 'elevenlabs', voiceId: 'GBv7mTt0atIp3Br8iCZE' },
  fr: { provider: 'elevenlabs', voiceId: 'pFZP5JQG7iQjIQuC4Bku' },
  de: { provider: 'azure', voiceId: 'de-DE-ConradNeural' },
  pt: { provider: 'azure', voiceId: 'pt-BR-AntonioNeural' },
  ar: { provider: 'azure', voiceId: 'ar-SA-HamedNeural' },
  hi: { provider: 'azure', voiceId: 'hi-IN-MadhurNeural' },
  bn: { provider: 'azure', voiceId: 'bn-BD-NabanitaNeural' },
  te: { provider: 'azure', voiceId: 'te-IN-ShrutiNeural' },
  ta: { provider: 'azure', voiceId: 'ta-IN-ValluvarNeural' },
  ur: { provider: 'azure', voiceId: 'ur-PK-AsadNeural' },
  zh: { provider: 'alibaba', voiceId: 'zhiyan_emo' },
  ja: { provider: 'alibaba', voiceId: 'tomoka' },
  ko: { provider: 'azure', voiceId: 'ko-KR-InJoonNeural' },
  id: { provider: 'azure', voiceId: 'id-ID-ArdiNeural' },
  sw: { provider: 'azure', voiceId: 'sw-KE-RafikiNeural' },
};

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  ar: 'Arabic',
  hi: 'Hindi',
  bn: 'Bengali',
  te: 'Telugu',
  ta: 'Tamil',
  ur: 'Urdu',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  id: 'Indonesian',
  sw: 'Swahili',
};

// ============================================================================
// Screenshot Management
// ============================================================================

class GenieCastOrchestrationService {
  private screenshotCache: Map<string, ProductScreenshot[]> = new Map();
  private messagingCache: Map<string, GeneratedMessaging> = new Map();
  private activePipelines: Map<string, GenerationPipeline> = new Map();
  private pipelineListeners: Array<(pipeline: GenerationPipeline) => void> = [];

  // =========================================================================
  // Screenshot Management
  // =========================================================================

  /**
   * Get all screenshots for a product
   */
  async getProductScreenshots(productId: GenieProductId): Promise<ProductScreenshot[]> {
    // Check cache first
    if (this.screenshotCache.has(productId)) {
      return this.screenshotCache.get(productId)!;
    }

    try {
      // Fetch from storage bucket
      const { data: files, error } = await supabase.storage
        .from('product-screenshots')
        .list(productId, { limit: 100 });

      if (error) throw error;

      const screenshots: ProductScreenshot[] = (files || []).map((file, idx) => ({
        id: `${productId}-${file.name}`,
        productId,
        screenId: file.name.replace(/\.(png|jpg|webp)$/i, ''),
        screenName: file.name.replace(/[-_]/g, ' ').replace(/\.(png|jpg|webp)$/i, ''),
        imageUrl: supabase.storage.from('product-screenshots').getPublicUrl(`${productId}/${file.name}`).data.publicUrl,
        order: idx,
        capturedAt: new Date(file.created_at || Date.now()),
        captureMethod: 'manual',
        isOutdated: false,
      }));

      this.screenshotCache.set(productId, screenshots);
      return screenshots;
    } catch (err) {
      console.error('[GenieCast] Failed to fetch screenshots:', err);
      return [];
    }
  }

  /**
   * Get screenshots for all products
   */
  async getAllScreenshots(): Promise<Map<GenieProductId, ProductScreenshot[]>> {
    const products = Object.keys(GENIE_PRODUCTS) as GenieProductId[];
    const results = new Map<GenieProductId, ProductScreenshot[]>();

    await Promise.all(
      products.map(async (productId) => {
        const screenshots = await this.getProductScreenshots(productId);
        results.set(productId, screenshots);
      })
    );

    return results;
  }

  /**
   * Check if screenshots are outdated (compared to product version)
   */
  getOutdatedScreenshots(productId: GenieProductId): ProductScreenshot[] {
    const screenshots = this.screenshotCache.get(productId) || [];
    return screenshots.filter(s => s.isOutdated);
  }

  /**
   * Clear screenshot cache (force refresh)
   */
  clearScreenshotCache(productId?: GenieProductId): void {
    if (productId) {
      this.screenshotCache.delete(productId);
    } else {
      this.screenshotCache.clear();
    }
  }

  // =========================================================================
  // Messaging Integration
  // =========================================================================

  /**
   * Get messaging context for video generation
   */
  async getMessagingContext(
    productId: GenieProductId,
    languageCode: string,
    featureId?: string
  ): Promise<MessagingContext> {
    const cacheKey = `${productId}-${languageCode}-${featureId || 'product'}`;

    // Check for approved messaging first
    const approvedMessaging = aiMessagingGeneratorService.getApprovedMessaging(productId, featureId);

    // Get fallback script
    const fallbackScript = this.getFallbackScript(productId, languageCode);

    return {
      productId,
      featureId,
      languageCode,
      messaging: approvedMessaging,
      fallbackScript,
    };
  }

  /**
   * Get fallback script from static config
   */
  private getFallbackScript(productId: GenieProductId, languageCode: string): string {
    const product = GENIE_PRODUCTS[productId];
    const scripts: Record<string, Record<GenieProductId, string>> = {
      en: {
        spark: `${product.name} transforms your ideas into compelling scripts. Drop any input and watch AI craft the perfect content.`,
        mind: `${product.name} doesn't just write – it understands. AI-powered enhancement with native voices.`,
        vibe: `${product.name} brings scripts to life with professional video and perfect lip-sync.`,
        deck: `${product.name} ends presentation pain. One prompt, one click, complete professional deck.`,
        arc: `Production Hub is your creative command center for timeline editing and content management.`,
        studio: `Genie Studio: Seven products, 206 pipelines, your creative vision realized.`,
        cast: `${product.name}: Make it. Show it. Scale it. Global distribution at your fingertips.`,
        ask_genie: `Ask Genie understands natural language. Just tell it what you need.`,
      },
    };

    return scripts[languageCode]?.[productId] || scripts.en[productId] || `${product.name}: ${product.tagline}`;
  }

  /**
   * Build localized script with messaging
   */
  buildLocalizedScript(context: MessagingContext): LocalizedScript {
    const { productId, languageCode, messaging, fallbackScript } = context;
    const product = GENIE_PRODUCTS[productId];
    const ttsConfig = TTS_PROVIDERS[languageCode as keyof typeof TTS_PROVIDERS] || TTS_PROVIDERS.en;

    // Use approved messaging if available, otherwise fallback
    const script = messaging?.shortScript || messaging?.openingLine || fallbackScript;
    const hook = messaging?.hook || product.tagline;
    const cta = messaging?.cta || 'Get Started Today';

    return {
      languageCode,
      languageName: LANGUAGE_NAMES[languageCode] || languageCode,
      chapterId: productId,
      productId,
      script,
      hook,
      cta,
      duration: messaging?.shortScript ? 30 : 45, // Short script = 30s, full = 45s
      ttsProvider: ttsConfig.provider,
      voiceId: ttsConfig.voiceId,
    };
  }

  // =========================================================================
  // Video Generation Pipeline
  // =========================================================================

  /**
   * Start video generation pipeline
   */
  async startGenerationPipeline(request: VideoGenerationRequest): Promise<GenerationPipeline> {
    const pipelineId = `pipeline_${Date.now()}`;
    
    // Calculate total jobs
    const totalJobs = this.calculateTotalJobs(request);

    const pipeline: GenerationPipeline = {
      requestId: pipelineId,
      totalJobs,
      completedJobs: 0,
      status: 'pending',
      results: [],
    };

    this.activePipelines.set(pipelineId, pipeline);
    this.notifyPipelineListeners(pipeline);

    // Start async generation
    this.runPipeline(pipelineId, request);

    return pipeline;
  }

  /**
   * Calculate total jobs for a request
   */
  private calculateTotalJobs(request: VideoGenerationRequest): number {
    if (request.mode === 'quick') {
      return request.languages.length;
    } else if (request.mode === 'feature') {
      return request.languages.length * request.products.length;
    } else {
      // Matrix mode
      return request.languages.length * request.products.length * (request.tiers?.length || 1);
    }
  }

  /**
   * Run the generation pipeline
   */
  private async runPipeline(pipelineId: string, request: VideoGenerationRequest): Promise<void> {
    const pipeline = this.activePipelines.get(pipelineId);
    if (!pipeline) return;

    pipeline.status = 'running';
    this.notifyPipelineListeners(pipeline);

    try {
      // Get all screenshots once
      const allScreenshots = request.includeScreenshots ? await this.getAllScreenshots() : null;

      // Generate for each combination
      for (const lang of request.languages) {
        for (const productId of request.products) {
          const tiers = request.tiers || ['pro'];
          for (const tier of tiers) {
            const jobId = `${pipelineId}-${lang}-${productId}-${tier}`;
            pipeline.currentJob = jobId;
            this.notifyPipelineListeners(pipeline);

            try {
              // Get messaging context
              const messagingContext = request.useApprovedMessaging
                ? await this.getMessagingContext(productId, lang)
                : null;

              // Build localized script
              const script = messagingContext
                ? this.buildLocalizedScript(messagingContext)
                : null;

              // Get product screenshots
              const screenshots = allScreenshots?.get(productId) || [];

              // Call edge function
              const { data, error } = await supabase.functions.invoke('genie-cast-assembler', {
                body: {
                  language: lang,
                  product: productId,
                  tier,
                  quality: request.quality,
                  fullProductionMode: request.fullProductionMode,
                  // Pass dynamic messaging & screenshots
                  customScript: script?.script,
                  customHook: script?.hook,
                  customCta: script?.cta,
                  screenshots: screenshots.map(s => ({
                    screenId: s.screenId,
                    imageUrl: s.imageUrl,
                    order: s.order,
                  })),
                  useApprovedMessaging: request.useApprovedMessaging,
                },
              });

              if (error) throw error;

              pipeline.results.push({
                jobId,
                language: lang,
                product: productId,
                tier,
                videoUrl: data?.videoUrl,
                error: data?.error,
                duration: data?.duration || 0,
              });
            } catch (err) {
              pipeline.results.push({
                jobId,
                language: lang,
                product: productId,
                tier,
                error: err instanceof Error ? err.message : 'Unknown error',
                duration: 0,
              });
            }

            pipeline.completedJobs++;
            this.notifyPipelineListeners(pipeline);
          }
        }
      }

      pipeline.status = 'complete';
      pipeline.currentJob = undefined;
    } catch (err) {
      pipeline.status = 'error';
    }

    this.notifyPipelineListeners(pipeline);
  }

  /**
   * Get pipeline status
   */
  getPipeline(pipelineId: string): GenerationPipeline | null {
    return this.activePipelines.get(pipelineId) || null;
  }

  /**
   * Get all active pipelines
   */
  getActivePipelines(): GenerationPipeline[] {
    return Array.from(this.activePipelines.values()).filter(p => p.status === 'running');
  }

  /**
   * Subscribe to pipeline updates
   */
  onPipelineUpdate(callback: (pipeline: GenerationPipeline) => void): () => void {
    this.pipelineListeners.push(callback);
    return () => {
      this.pipelineListeners = this.pipelineListeners.filter(l => l !== callback);
    };
  }

  private notifyPipelineListeners(pipeline: GenerationPipeline): void {
    this.pipelineListeners.forEach(listener => listener(pipeline));
  }

  // =========================================================================
  // Matrix View Helpers
  // =========================================================================

  /**
   * Get matrix data for display (screenshots + messaging status)
   */
  async getMatrixData(): Promise<{
    products: Array<{
      id: GenieProductId;
      name: string;
      screenshotCount: number;
      hasApprovedMessaging: boolean;
      screenshots: ProductScreenshot[];
    }>;
    languages: string[];
    tiers: string[];
  }> {
    const products = Object.keys(GENIE_PRODUCTS) as GenieProductId[];
    const productData = await Promise.all(
      products.map(async (productId) => {
        const screenshots = await this.getProductScreenshots(productId);
        const hasMessaging = !!aiMessagingGeneratorService.getApprovedMessaging(productId);

        return {
          id: productId,
          name: GENIE_PRODUCTS[productId].name,
          screenshotCount: screenshots.length,
          hasApprovedMessaging: hasMessaging,
          screenshots,
        };
      })
    );

    return {
      products: productData,
      languages: Object.keys(LANGUAGE_NAMES),
      tiers: ['free', 'starter', 'pro', 'enterprise'],
    };
  }

  /**
   * Get generation readiness status
   */
  getReadinessStatus(productId: GenieProductId): {
    screenshotsReady: boolean;
    messagingReady: boolean;
    scriptsReady: boolean;
    issues: string[];
  } {
    const screenshots = this.screenshotCache.get(productId) || [];
    const messaging = aiMessagingGeneratorService.getApprovedMessaging(productId);
    const issues: string[] = [];

    if (screenshots.length === 0) {
      issues.push('No screenshots captured');
    } else if (screenshots.some(s => s.isOutdated)) {
      issues.push('Some screenshots are outdated');
    }

    if (!messaging) {
      issues.push('No approved messaging (using fallback)');
    }

    return {
      screenshotsReady: screenshots.length > 0 && !screenshots.some(s => s.isOutdated),
      messagingReady: !!messaging,
      scriptsReady: true, // Fallbacks always available
      issues,
    };
  }
}

// Singleton instance
export const genieCastOrchestrationService = new GenieCastOrchestrationService();

export default genieCastOrchestrationService;
