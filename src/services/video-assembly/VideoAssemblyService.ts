/**
 * Video Assembly Service
 * 
 * Unified service for video assembly with:
 * - Batch processing queue
 * - Real-time progress streaming
 * - Quality presets with tier gating
 * - Smart retry and error recovery
 * - Cost estimation and preview
 */

import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  AssemblyJob,
  AssemblyConfig,
  AssemblyProgress,
  AssemblyResult,
  AssemblyQuality,
  BatchAssemblyRequest,
  BatchAssemblyResult,
  CostEstimate,
  CostBreakdown,
  AssemblyEvent,
  RetryConfig,
} from './types';
import { DEFAULT_RETRY_CONFIG, QUALITY_PRESETS } from './types';
import type { GlobalTier } from '../shared/globalTierService';

// Extended tier type to include internal admin
type ExtendedTier = GlobalTier | 'internal';

// ============================================================================
// CONSTANTS
// ============================================================================

const CHAPTER_BASE_COST = 2; // Credits per chapter
const TTS_COST_PER_1000_CHARS = 0.5;
const AVATAR_COST_PER_MINUTE = 10;
const THREE_D_COST_PER_MODEL = 15;
const ASSEMBLY_COST_PER_MINUTE = 2;

const TIER_CREDIT_LIMITS: Record<ExtendedTier, number> = {
  standard: 100,
  advanced: 500,
  premium: 2000,
  internal: Infinity,
};

// ============================================================================
// VIDEO ASSEMBLY SERVICE CLASS
// ============================================================================

class VideoAssemblyService {
  private activeJobs: Map<string, AssemblyJob> = new Map();
  private jobQueue: string[] = [];
  private maxConcurrent = 3;
  private isProcessing = false;
  private realtimeChannel: RealtimeChannel | null = null;
  private eventListeners: Map<string, ((event: AssemblyEvent) => void)[]> = new Map();

  // ==========================================================================
  // JOB MANAGEMENT
  // ==========================================================================

  /**
   * Create a new assembly job
   */
  async createJob(config: AssemblyConfig): Promise<AssemblyJob> {
    const jobId = crypto.randomUUID();
    const estimate = await this.estimateCost(config);

    if (!estimate.canProceed) {
      throw new Error(`Insufficient credits. Required: ${estimate.totalCredits}, Available: ${estimate.tierRemaining}`);
    }

    // Validate quality tier
    const qualityPreset = QUALITY_PRESETS[config.quality];
    if (!this.isTierSufficient(config.userTier, qualityPreset.requiredTier)) {
      throw new Error(`${config.quality} quality requires ${qualityPreset.requiredTier} tier or higher`);
    }

    const job: AssemblyJob = {
      id: jobId,
      userId: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
      status: 'queued',
      priority: this.getPriority(config.userTier),
      createdAt: new Date().toISOString(),
      config,
      progress: this.createInitialProgress(config),
      estimatedCredits: estimate.totalCredits,
      consumedCredits: 0,
    };

    this.activeJobs.set(jobId, job);
    this.jobQueue.push(jobId);
    
    // Sort queue by priority
    this.sortQueue();
    
    // Emit event
    this.emitEvent({
      type: 'job_created',
      jobId,
      timestamp: new Date().toISOString(),
      data: job.progress,
    });

    // Start processing if not already
    this.processQueue();

    return job;
  }

  /**
   * Create batch assembly jobs for multiple languages
   */
  async createBatchJobs(request: BatchAssemblyRequest): Promise<BatchAssemblyResult> {
    const batchId = crypto.randomUUID();
    const jobs: AssemblyJob[] = [];
    let totalCredits = 0;

    for (const language of request.languages) {
      const config: AssemblyConfig = {
        ...request.baseConfig,
        language,
        userTier: request.baseConfig.userTier,
      };

      const job = await this.createJob(config);
      jobs.push(job);
      totalCredits += job.estimatedCredits;
    }

    return {
      batchId,
      jobs,
      totalEstimatedCredits: totalCredits,
      status: 'queued',
    };
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): AssemblyJob | undefined {
    return this.activeJobs.get(jobId);
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.activeJobs.get(jobId);
    if (!job) return false;

    if (job.status === 'completed' || job.status === 'failed') {
      return false;
    }

    job.status = 'cancelled';
    job.completedAt = new Date().toISOString();

    // Remove from queue
    this.jobQueue = this.jobQueue.filter(id => id !== jobId);

    this.emitEvent({
      type: 'job_cancelled',
      jobId,
      timestamp: new Date().toISOString(),
      data: job.progress,
    });

    return true;
  }

  // ==========================================================================
  // COST ESTIMATION
  // ==========================================================================

  /**
   * Estimate cost for assembly config
   */
  async estimateCost(config: AssemblyConfig): Promise<CostEstimate> {
    const breakdown: CostBreakdown[] = [];
    const qualityMultiplier = QUALITY_PRESETS[config.quality].creditMultiplier;

    // TTS cost
    const estimatedChars = config.chapters.length * 500; // ~500 chars per chapter
    const ttsCost = Math.ceil(estimatedChars / 1000) * TTS_COST_PER_1000_CHARS;
    breakdown.push({
      component: 'tts',
      credits: ttsCost,
      provider: 'azure/elevenlabs',
      quantity: estimatedChars,
      unitCost: TTS_COST_PER_1000_CHARS,
    });

    // Video assembly cost
    const totalDuration = config.chapters.reduce((sum, ch) => sum + ch.duration, 0) / 60;
    const assemblyCost = Math.ceil(totalDuration) * ASSEMBLY_COST_PER_MINUTE * qualityMultiplier;
    breakdown.push({
      component: 'video_assembly',
      credits: assemblyCost,
      provider: 'json2video',
      quantity: totalDuration,
      unitCost: ASSEMBLY_COST_PER_MINUTE * qualityMultiplier,
    });

    // Avatar cost (if enabled)
    if (config.fullProductionMode && config.productionConfig?.avatar?.enabled) {
      const avatarMinutes = this.getAvatarMinutes(config);
      const avatarCost = avatarMinutes * AVATAR_COST_PER_MINUTE;
      breakdown.push({
        component: 'avatar',
        credits: avatarCost,
        provider: 'alibaba-wan/modelslab',
        quantity: avatarMinutes,
        unitCost: AVATAR_COST_PER_MINUTE,
      });
    }

    // 3D cost (if enabled)
    if (config.fullProductionMode && config.productionConfig?.threeD?.enabled) {
      const threeDCost = config.chapters.length * THREE_D_COST_PER_MODEL;
      breakdown.push({
        component: '3d',
        credits: threeDCost,
        provider: 'meshy-ai',
        quantity: config.chapters.length,
        unitCost: THREE_D_COST_PER_MODEL,
      });
    }

    // Rendering cost
    const renderingCost = Math.ceil(totalDuration * qualityMultiplier);
    breakdown.push({
      component: 'rendering',
      credits: renderingCost,
      provider: 'json2video',
      quantity: 1,
      unitCost: renderingCost,
    });

    const totalCredits = breakdown.reduce((sum, b) => sum + b.credits, 0);
    const tierLimit = TIER_CREDIT_LIMITS[config.userTier];
    
    // Get remaining credits (would query usage table in production)
    const tierRemaining = tierLimit; // TODO: Query actual remaining

    const warnings: string[] = [];
    if (totalCredits > tierRemaining * 0.8) {
      warnings.push('This job will use more than 80% of your remaining credits');
    }
    if (config.quality === '4k' && config.chapters.length > 5) {
      warnings.push('4K rendering for many chapters may take significant time');
    }

    return {
      totalCredits,
      breakdown,
      tierLimit,
      tierRemaining,
      canProceed: totalCredits <= tierRemaining,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Get quick preview estimate without full calculation
   */
  getQuickEstimate(chapterCount: number, quality: AssemblyQuality, hasAvatar: boolean): number {
    const qualityMultiplier = QUALITY_PRESETS[quality].creditMultiplier;
    let base = chapterCount * CHAPTER_BASE_COST * qualityMultiplier;
    if (hasAvatar) base += chapterCount * 5;
    return Math.ceil(base);
  }

  // ==========================================================================
  // QUEUE PROCESSING
  // ==========================================================================

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.jobQueue.length > 0) {
        const activeCount = Array.from(this.activeJobs.values())
          .filter(j => ['preprocessing', 'generating_tts', 'generating_visuals', 'assembling', 'rendering'].includes(j.status))
          .length;

        if (activeCount >= this.maxConcurrent) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        const jobId = this.jobQueue.shift();
        if (!jobId) continue;

        const job = this.activeJobs.get(jobId);
        if (!job || job.status !== 'queued') continue;

        // Process job (don't await - run in parallel)
        this.executeJob(job).catch(error => {
          console.error(`Job ${jobId} failed:`, error);
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeJob(job: AssemblyJob): Promise<void> {
    job.status = 'preprocessing';
    job.startedAt = new Date().toISOString();

    this.emitEvent({
      type: 'job_started',
      jobId: job.id,
      timestamp: new Date().toISOString(),
      data: job.progress,
    });

    try {
      // Call the edge function with retry logic
      const result = await this.callAssemblerWithRetry(job);

      if (result.success) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.result = result.data;
        job.progress.overallPercent = 100;
        job.progress.currentPhase = 'completed';

        this.emitEvent({
          type: 'job_completed',
          jobId: job.id,
          timestamp: new Date().toISOString(),
          data: result.data,
        });
      } else {
        throw new Error(result.error || 'Assembly failed');
      }
    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date().toISOString();
      job.error = {
        code: 'ASSEMBLY_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        phase: job.status,
        retryable: true,
      };

      this.emitEvent({
        type: 'job_failed',
        jobId: job.id,
        timestamp: new Date().toISOString(),
        data: job.error,
      });
    }
  }

  private async callAssemblerWithRetry(
    job: AssemblyJob,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<{ success: boolean; data?: AssemblyResult; error?: string }> {
    let lastError: Error | null = null;
    let retryCount = 0;

    const providers = [...retryConfig.fallbackProviders];

    for (const provider of providers) {
      for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
        try {
          // Update progress
          job.progress.currentPhase = 'generating_tts';
          this.emitProgressUpdate(job);

          const { data, error } = await supabase.functions.invoke('genie-cast-assembler', {
            body: {
              language: job.config.language,
              quality: job.config.quality,
              fullProductionMode: job.config.fullProductionMode,
              productionConfig: job.config.productionConfig,
              videoStyle: job.config.videoStyle,
              styleConfig: job.config.styleConfig,
              approvedMessaging: job.config.approvedMessaging,
              chapterMessaging: job.config.chapterMessaging,
              skipExistingTTS: job.config.skipExistingTTS,
              unifiedAudio: job.config.unifiedAudio,
              // Provider override for retry
              assemblyProvider: provider,
            },
          });

          if (error) throw error;

          // Update progress during processing
          if (data?.chapters) {
            job.progress.chaptersCompleted = data.chapters.filter((c: any) => c.success).length;
            job.progress.overallPercent = Math.round(
              (job.progress.chaptersCompleted / job.progress.chaptersTotal) * 100
            );
            this.emitProgressUpdate(job);
          }

          return {
            success: true,
            data: {
              videoUrl: data.videoUrl || '',
              thumbnailUrl: data.thumbnailUrl,
              duration: data.totalDuration || 0,
              chapters: data.chapters || [],
              providers: data.providers || {},
              storageKey: `videos/${job.config.language}/${job.id}`,
            },
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          retryCount++;
          
          console.warn(`Assembly attempt ${attempt + 1} with ${provider} failed:`, lastError.message);

          if (attempt < retryConfig.maxRetries) {
            const delay = retryConfig.retryDelay * Math.pow(retryConfig.backoffMultiplier, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'All providers failed after retries',
    };
  }

  // ==========================================================================
  // REALTIME EVENTS
  // ==========================================================================

  /**
   * Subscribe to job events
   */
  subscribeToJob(jobId: string, callback: (event: AssemblyEvent) => void): () => void {
    if (!this.eventListeners.has(jobId)) {
      this.eventListeners.set(jobId, []);
    }
    this.eventListeners.get(jobId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(jobId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to all jobs for a user via Supabase Realtime
   */
  subscribeToUserJobs(userId: string, callback: (event: AssemblyEvent) => void): () => void {
    const channelName = `assembly:${userId}`;
    
    this.realtimeChannel = supabase.channel(channelName)
      .on('broadcast', { event: 'assembly_event' }, (payload) => {
        callback(payload.payload as AssemblyEvent);
      })
      .subscribe();

    return () => {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel);
        this.realtimeChannel = null;
      }
    };
  }

  private emitEvent(event: AssemblyEvent): void {
    // Emit to local listeners
    const listeners = this.eventListeners.get(event.jobId);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }

    // Broadcast via Supabase Realtime
    const job = this.activeJobs.get(event.jobId);
    if (job && this.realtimeChannel) {
      supabase.channel(`assembly:${job.userId}`)
        .send({
          type: 'broadcast',
          event: 'assembly_event',
          payload: event,
        });
    }
  }

  private emitProgressUpdate(job: AssemblyJob): void {
    this.emitEvent({
      type: 'progress_update',
      jobId: job.id,
      timestamp: new Date().toISOString(),
      data: job.progress,
    });
  }

  // ==========================================================================
  // PREVIEW MODE
  // ==========================================================================

  /**
   * Generate low-res preview before full render
   */
  async generatePreview(config: AssemblyConfig): Promise<{ previewUrl: string; duration: number }> {
    const previewConfig = {
      ...config,
      quality: '720p' as AssemblyQuality,
      chapters: config.chapters.slice(0, 3), // Only first 3 chapters
    };

    const { data, error } = await supabase.functions.invoke('genie-cast-assembler', {
      body: {
        ...previewConfig,
        previewMode: true,
        maxDuration: 60, // 1 minute max
      },
    });

    if (error) throw error;

    return {
      previewUrl: data.videoUrl || data.previewUrl,
      duration: data.totalDuration || 60,
    };
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private createInitialProgress(config: AssemblyConfig): AssemblyProgress {
    return {
      overallPercent: 0,
      currentPhase: 'queued',
      chaptersCompleted: 0,
      chaptersTotal: config.chapters.length,
      phases: {
        tts: { status: 'pending', percent: 0 },
        visuals: { status: 'pending', percent: 0 },
        assembly: { status: 'pending', percent: 0 },
        rendering: { status: 'pending', percent: 0 },
      },
      elapsedSeconds: 0,
    };
  }

  private getPriority(tier: GlobalTier | 'internal'): number {
    const priorities: Record<ExtendedTier, number> = {
      internal: 100,
      premium: 80,
      advanced: 60,
      standard: 40,
    };
    return priorities[tier as ExtendedTier] || 40;
  }

  private sortQueue(): void {
    this.jobQueue.sort((a, b) => {
      const jobA = this.activeJobs.get(a);
      const jobB = this.activeJobs.get(b);
      if (!jobA || !jobB) return 0;
      return jobB.priority - jobA.priority;
    });
  }

  private isTierSufficient(userTier: GlobalTier | 'internal', requiredTier: GlobalTier): boolean {
    if (userTier === 'internal') return true; // Internal has full access
    const tierOrder: GlobalTier[] = ['standard', 'advanced', 'premium'];
    return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
  }

  private getAvatarMinutes(config: AssemblyConfig): number {
    if (!config.productionConfig?.avatar?.enabled) return 0;
    
    const placement = config.productionConfig.avatar.placement;
    const chapterCount = config.chapters.length;
    
    switch (placement) {
      case 'intro_outro':
        return 2; // ~1 min each for intro and outro
      case 'chapter_intros':
        return chapterCount * 0.5; // ~30s per chapter intro
      case 'throughout':
        return chapterCount * 1; // ~1 min per chapter
      default:
        return 0;
    }
  }

  // ==========================================================================
  // QUALITY VALIDATION
  // ==========================================================================

  /**
   * Get available quality options for tier
   */
  getAvailableQualities(tier: GlobalTier): AssemblyQuality[] {
    return (Object.keys(QUALITY_PRESETS) as AssemblyQuality[])
      .filter(quality => this.isTierSufficient(tier, QUALITY_PRESETS[quality].requiredTier));
  }

  /**
   * Validate quality selection
   */
  validateQuality(quality: AssemblyQuality, tier: GlobalTier): { valid: boolean; message?: string } {
    const preset = QUALITY_PRESETS[quality];
    if (this.isTierSufficient(tier, preset.requiredTier)) {
      return { valid: true };
    }
    return {
      valid: false,
      message: `${quality} requires ${preset.requiredTier} tier. Upgrade to unlock.`,
    };
  }
}

// Export singleton instance
export const videoAssemblyService = new VideoAssemblyService();

// Export class for testing
export { VideoAssemblyService };
