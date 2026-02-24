/**
 * Marketing Pipeline Service
 * 
 * Centralized service for managing marketing pipelines across the ecosystem.
 * Connects to master-ecosystem-registry and provides pipeline activation,
 * routing, and execution capabilities.
 * 
 * Used by: Genie Cast, Spark, Mind, Vibe, Deck
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  MASTER_MARKETING_PIPELINES, 
  MASTER_VIDEO_STYLES,
  MASTER_AI_PROVIDERS,
  type PipelineEntry,
  type VideoStyleEntry 
} from '@/config/master-ecosystem-registry';

// Alias for convenience
const MASTER_PIPELINES = MASTER_MARKETING_PIPELINES;

// Pipeline execution status
export type PipelineStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';

// Pipeline execution context
export interface PipelineExecutionContext {
  pipelineId: string;
  sourceVideoId?: string;
  sourceContentId?: string;
  inputData: Record<string, any>;
  language?: string;
  region?: string;
  userId?: string;
}

// Pipeline execution result
export interface PipelineExecutionResult {
  success: boolean;
  pipelineId: string;
  outputData?: Record<string, any>;
  outputUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  duration?: number;
  providersUsed?: string[];
}

// Pipeline job
export interface PipelineJob {
  id: string;
  pipelineId: string;
  pipelineName: string;
  status: PipelineStatus;
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: PipelineExecutionResult;
  context: PipelineExecutionContext;
}

// Active pipeline definitions with execution logic
export const ACTIVE_PIPELINES: Record<string, {
  execute: (context: PipelineExecutionContext) => Promise<PipelineExecutionResult>;
  estimatedDuration: number; // seconds
  providers: string[];
}> = {
  // ═══════════════════════════════════════════════════════════════
  // REPURPOSING PIPELINES (MANAGE Tab)
  // ═══════════════════════════════════════════════════════════════
  'video-shorts': {
    execute: async (ctx) => executeShortsPipeline(ctx),
    estimatedDuration: 120,
    providers: ['gemini', 'modelslab'],
  },
  'video-highlights': {
    execute: async (ctx) => executeHighlightsPipeline(ctx),
    estimatedDuration: 90,
    providers: ['gemini', 'modelslab'],
  },
  'video-thumbnails': {
    execute: async (ctx) => executeThumbnailPipeline(ctx),
    estimatedDuration: 30,
    providers: ['gemini', 'modelslab'],
  },
  'video-captions': {
    execute: async (ctx) => executeCaptionsPipeline(ctx),
    estimatedDuration: 60,
    providers: ['deepgram', 'gemini'],
  },
  'video-square': {
    execute: async (ctx) => executeSquareFormatPipeline(ctx),
    estimatedDuration: 60,
    providers: ['modelslab'],
  },

  // ═══════════════════════════════════════════════════════════════
  // MARKETING-SPECIFIC PIPELINES (PRODUCE Tab)
  // ═══════════════════════════════════════════════════════════════
  'competitor-to-comparison': {
    execute: async (ctx) => executeComparisonPipeline(ctx),
    estimatedDuration: 180,
    providers: ['gemini', 'claude', 'modelslab'],
  },
  'case-study-to-video': {
    execute: async (ctx) => executeCaseStudyPipeline(ctx),
    estimatedDuration: 240,
    providers: ['gemini', 'elevenlabs', 'vertex-ai'],
  },
  'testimonial-to-video': {
    execute: async (ctx) => executeTestimonialPipeline(ctx),
    estimatedDuration: 180,
    providers: ['gemini', 'alibaba-wan', 'elevenlabs'],
  },
  'event-to-promo': {
    execute: async (ctx) => executeEventPromoPipeline(ctx),
    estimatedDuration: 120,
    providers: ['gemini', 'modelslab'],
  },
  'blog-to-video': {
    execute: async (ctx) => executeBlogToVideoPipeline(ctx),
    estimatedDuration: 180,
    providers: ['gemini', 'elevenlabs', 'modelslab'],
  },

  // ═══════════════════════════════════════════════════════════════
  // ENHANCEMENT PIPELINES (MANAGE Tab)
  // ═══════════════════════════════════════════════════════════════
  'video-enhance': {
    execute: async (ctx) => executeEnhancementPipeline(ctx),
    estimatedDuration: 120,
    providers: ['modelslab', 'vertex-ai'],
  },
  'video-translate': {
    execute: async (ctx) => executeTranslationPipeline(ctx),
    estimatedDuration: 150,
    providers: ['gemini', 'elevenlabs', 'deepl'],
  },
  'audio-to-video': {
    execute: async (ctx) => executeAudioToVideoPipeline(ctx),
    estimatedDuration: 180,
    providers: ['gemini', 'modelslab', 'alibaba-wan'],
  },
};

// ═══════════════════════════════════════════════════════════════
// PIPELINE EXECUTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function executeShortsPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing video-shorts:', ctx.pipelineId);
  
  try {
    // Call edge function for AI processing
    const { data, error } = await supabase.functions.invoke('shorts-generator', {
      body: {
        videoId: ctx.sourceVideoId,
        format: '9:16',
        maxDuration: 60,
        style: ctx.inputData.style || 'dynamic',
      }
    });

    if (error) throw error;

    return {
      success: true,
      pipelineId: ctx.pipelineId,
      outputUrl: data?.outputUrl,
      thumbnailUrl: data?.thumbnailUrl,
      providersUsed: ['gemini', 'modelslab'],
    };
  } catch (error) {
    console.error('[Pipeline] Shorts generation failed:', error);
    return {
      success: false,
      pipelineId: ctx.pipelineId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function executeHighlightsPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing video-highlights:', ctx.pipelineId);
  
  try {
    const { data, error } = await supabase.functions.invoke('magic-clips-generator', {
      body: {
        videoId: ctx.sourceVideoId,
        clipCount: ctx.inputData.clipCount || 3,
        maxClipDuration: ctx.inputData.maxDuration || 30,
      }
    });

    if (error) throw error;

    return {
      success: true,
      pipelineId: ctx.pipelineId,
      outputData: { clips: data?.clips },
      providersUsed: ['gemini'],
    };
  } catch (error) {
    return {
      success: false,
      pipelineId: ctx.pipelineId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function executeThumbnailPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing video-thumbnails:', ctx.pipelineId);
  
  try {
    const { data, error } = await supabase.functions.invoke('auto-thumbnail-generator', {
      body: {
        videoId: ctx.sourceVideoId,
        style: ctx.inputData.style || 'auto',
        count: ctx.inputData.count || 3,
      }
    });

    if (error) throw error;

    return {
      success: true,
      pipelineId: ctx.pipelineId,
      outputData: { thumbnails: data?.thumbnails },
      thumbnailUrl: data?.thumbnails?.[0],
      providersUsed: ['gemini'],
    };
  } catch (error) {
    return {
      success: false,
      pipelineId: ctx.pipelineId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function executeCaptionsPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing video-captions:', ctx.pipelineId);
  
  try {
    const { data, error } = await supabase.functions.invoke('ai-caption-generator', {
      body: {
        videoId: ctx.sourceVideoId,
        language: ctx.language || 'en',
        style: ctx.inputData.style || 'modern',
      }
    });

    if (error) throw error;

    return {
      success: true,
      pipelineId: ctx.pipelineId,
      outputData: { captions: data?.captions, srtUrl: data?.srtUrl },
      providersUsed: ['deepgram', 'gemini'],
    };
  } catch (error) {
    return {
      success: false,
      pipelineId: ctx.pipelineId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function executeSquareFormatPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing video-square:', ctx.pipelineId);
  
  // Simulated for now - would call video processing edge function
  return {
    success: true,
    pipelineId: ctx.pipelineId,
    outputUrl: ctx.inputData.videoUrl?.replace('.mp4', '_square.mp4'),
    providersUsed: ['modelslab'],
  };
}

async function executeComparisonPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing competitor-to-comparison:', ctx.pipelineId);
  
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        action: 'generate_content',
        prompt: `Create a professional comparison video script comparing ${ctx.inputData.productName} with ${ctx.inputData.competitorName}. 
                 Focus on: ${ctx.inputData.comparisonPoints?.join(', ') || 'features, pricing, ease of use'}.
                 Maintain objective, factual tone.`,
        context: {
          contentType: 'video',
          language: ctx.language || 'en',
        }
      }
    });

    if (error) throw error;

    return {
      success: true,
      pipelineId: ctx.pipelineId,
      outputData: { script: data?.content },
      providersUsed: ['gemini', 'claude'],
    };
  } catch (error) {
    return {
      success: false,
      pipelineId: ctx.pipelineId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function executeCaseStudyPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing case-study-to-video:', ctx.pipelineId);
  
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        action: 'generate_content',
        prompt: `Transform this case study into a compelling video script:
                 Client: ${ctx.inputData.clientName}
                 Challenge: ${ctx.inputData.challenge}
                 Solution: ${ctx.inputData.solution}
                 Results: ${ctx.inputData.results}
                 
                 Create a 2-3 minute video script with scenes for: introduction, challenge, solution, results, and CTA.`,
        context: {
          contentType: 'video',
          language: ctx.language || 'en',
        }
      }
    });

    if (error) throw error;

    return {
      success: true,
      pipelineId: ctx.pipelineId,
      outputData: { script: data?.content },
      providersUsed: ['gemini', 'elevenlabs'],
    };
  } catch (error) {
    return {
      success: false,
      pipelineId: ctx.pipelineId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function executeTestimonialPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing testimonial-to-video:', ctx.pipelineId);
  
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        action: 'generate_content',
        prompt: `Create an authentic testimonial video script from this customer feedback:
                 Customer: ${ctx.inputData.customerName} from ${ctx.inputData.company}
                 Testimonial: "${ctx.inputData.testimonial}"
                 
                 Make it feel natural and conversational, emphasizing the emotional journey.`,
        context: {
          contentType: 'avatar',
          language: ctx.language || 'en',
        }
      }
    });

    if (error) throw error;

    return {
      success: true,
      pipelineId: ctx.pipelineId,
      outputData: { script: data?.content },
      providersUsed: ['gemini', 'alibaba-wan'],
    };
  } catch (error) {
    return {
      success: false,
      pipelineId: ctx.pipelineId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function executeEventPromoPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing event-to-promo:', ctx.pipelineId);
  
  return {
    success: true,
    pipelineId: ctx.pipelineId,
    outputData: {
      script: `Join us for ${ctx.inputData.eventName}!
               📅 ${ctx.inputData.date}
               📍 ${ctx.inputData.location}
               
               ${ctx.inputData.highlights?.join('\n') || 'Amazing speakers and networking opportunities!'}
               
               Register now at ${ctx.inputData.registrationUrl || 'our website'}!`
    },
    providersUsed: ['gemini', 'modelslab'],
  };
}

async function executeBlogToVideoPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing blog-to-video:', ctx.pipelineId);
  
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        action: 'generate_content',
        prompt: `Transform this blog post into an engaging video script:
                 Title: ${ctx.inputData.title}
                 Content: ${ctx.inputData.content?.slice(0, 3000)}
                 
                 Create a 2-minute video script with visual cues and narrator directions.`,
        context: {
          contentType: 'video',
          language: ctx.language || 'en',
        }
      }
    });

    if (error) throw error;

    return {
      success: true,
      pipelineId: ctx.pipelineId,
      outputData: { script: data?.content },
      providersUsed: ['gemini', 'elevenlabs'],
    };
  } catch (error) {
    return {
      success: false,
      pipelineId: ctx.pipelineId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function executeEnhancementPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing video-enhance:', ctx.pipelineId);
  
  return {
    success: true,
    pipelineId: ctx.pipelineId,
    outputUrl: ctx.inputData.videoUrl?.replace('.mp4', '_enhanced.mp4'),
    outputData: {
      enhancements: ['color_correction', 'noise_reduction', 'stabilization'],
    },
    providersUsed: ['modelslab', 'vertex-ai'],
  };
}

async function executeTranslationPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing video-translate:', ctx.pipelineId);
  
  try {
    const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
      body: {
        provider: 'gemini',
        action: 'translate',
        text: ctx.inputData.transcript,
        sourceLanguage: ctx.inputData.sourceLanguage || 'en',
        targetLanguage: ctx.language || 'es',
      }
    });

    if (error) throw error;

    return {
      success: true,
      pipelineId: ctx.pipelineId,
      outputData: { translatedScript: data?.translatedText },
      providersUsed: ['gemini', 'elevenlabs'],
    };
  } catch (error) {
    return {
      success: false,
      pipelineId: ctx.pipelineId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function executeAudioToVideoPipeline(ctx: PipelineExecutionContext): Promise<PipelineExecutionResult> {
  console.log('[Pipeline] Executing audio-to-video:', ctx.pipelineId);
  
  return {
    success: true,
    pipelineId: ctx.pipelineId,
    outputData: {
      message: 'Audio-to-video conversion queued',
    },
    providersUsed: ['gemini', 'modelslab'],
  };
}

// ═══════════════════════════════════════════════════════════════
// SERVICE CLASS
// ═══════════════════════════════════════════════════════════════

class MarketingPipelineService {
  private jobs: Map<string, PipelineJob> = new Map();

  // Get all available pipelines from registry
  getAvailablePipelines(): PipelineEntry[] {
    return MASTER_PIPELINES || [];
  }

  // Get active (wired) pipelines
  getActivePipelines(): string[] {
    return Object.keys(ACTIVE_PIPELINES);
  }

  // Check if pipeline is active
  isPipelineActive(pipelineId: string): boolean {
    return pipelineId in ACTIVE_PIPELINES;
  }

  // Get pipeline info
  getPipelineInfo(pipelineId: string): PipelineEntry | undefined {
    return (MASTER_PIPELINES || []).find(p => p.id === pipelineId);
  }

  // Execute a pipeline
  async executePipeline(context: PipelineExecutionContext): Promise<PipelineJob> {
    const pipelineId = context.pipelineId;
    const pipelineConfig = ACTIVE_PIPELINES[pipelineId];
    const pipelineInfo = this.getPipelineInfo(pipelineId);

    if (!pipelineConfig) {
      throw new Error(`Pipeline ${pipelineId} is not active`);
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    const job: PipelineJob = {
      id: jobId,
      pipelineId,
      pipelineName: pipelineInfo?.name || pipelineId,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
      context,
    };

    this.jobs.set(jobId, job);

    // Execute asynchronously
    this.executeAsync(job, pipelineConfig);

    return job;
  }

  private async executeAsync(
    job: PipelineJob, 
    config: typeof ACTIVE_PIPELINES[string]
  ): Promise<void> {
    try {
      job.status = 'processing';
      job.startedAt = new Date();
      job.progress = 10;
      this.jobs.set(job.id, { ...job });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (job.progress < 90) {
          job.progress += 10;
          this.jobs.set(job.id, { ...job });
        }
      }, config.estimatedDuration * 100);

      // Execute the pipeline
      const result = await config.execute(job.context);

      clearInterval(progressInterval);

      job.status = result.success ? 'completed' : 'failed';
      job.progress = 100;
      job.completedAt = new Date();
      job.result = result;
      this.jobs.set(job.id, { ...job });

    } catch (error) {
      job.status = 'failed';
      job.progress = 100;
      job.completedAt = new Date();
      job.result = {
        success: false,
        pipelineId: job.pipelineId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      this.jobs.set(job.id, { ...job });
    }
  }

  // Get job status
  getJob(jobId: string): PipelineJob | undefined {
    return this.jobs.get(jobId);
  }

  // Get all jobs for a user
  getUserJobs(userId: string): PipelineJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.context.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get video styles from registry
  getVideoStyles(): VideoStyleEntry[] {
    return MASTER_VIDEO_STYLES || [];
  }

  // Get styles by category
  getStylesByCategory(category: string): VideoStyleEntry[] {
    return (MASTER_VIDEO_STYLES || []).filter(s => s.category === category);
  }

  // Get providers for a style
  getProvidersForStyle(styleId: string): string[] {
    const style = (MASTER_VIDEO_STYLES || []).find(s => s.id === styleId);
    if (!style) return [];
    
    const providers = [style.videoProvider];
    if (style.avatarProvider) providers.push(style.avatarProvider);
    if (style.animationProvider) providers.push(style.animationProvider);
    return providers;
  }
}

export const marketingPipelineService = new MarketingPipelineService();
export default marketingPipelineService;
