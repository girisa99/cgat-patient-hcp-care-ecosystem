/**
 * Unified Video Generation Service
 * LOW FIX: Single entry point for all video generation with provider fallback
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type VideoProvider = 
  | 'openai'    // Sora
  | 'modelslab' // AnimateDiff
  | 'alibaba'   // WAN
  | 'gemini'    // Veo
  | 'replicate'
  | 'auto';

export type VideoType = 
  | 'text-to-video'
  | 'image-to-video'
  | 'avatar-video'
  | 'lip-sync'
  | 'video-extend';

export interface VideoGenerationRequest {
  type: VideoType;
  prompt: string;
  provider?: VideoProvider;
  options: VideoGenerationOptions;
}

export interface VideoGenerationOptions {
  // Common options
  duration?: number;      // seconds
  width?: number;
  height?: number;
  fps?: number;
  quality?: 'draft' | 'preview' | 'production' | 'ultra';
  
  // Image-to-video
  sourceImageUrl?: string;
  motionType?: 'zoom' | 'pan' | 'rotate' | 'auto';
  
  // Avatar/Lip-sync
  audioUrl?: string;
  avatarId?: string;
  voiceText?: string;
  voiceId?: string;
  
  // Video extend
  sourceVideoUrl?: string;
  extendDirection?: 'forward' | 'backward';
  
  // Advanced
  seed?: number;
  negativePrompt?: string;
  guidanceScale?: number;
  numInferenceSteps?: number;
}

export interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  provider: VideoProvider;
  model?: string;
  generationTime?: number;
  creditsUsed?: number;
  error?: string;
  errorCode?: string;
  canRetry?: boolean;
}

export interface ProviderStatus {
  provider: VideoProvider;
  available: boolean;
  latency?: number;
  lastError?: string;
  lastChecked: string;
}

// ============================================================================
// PROVIDER FALLBACK CHAIN
// ============================================================================

const PROVIDER_CHAINS: Record<VideoType, VideoProvider[]> = {
  'text-to-video': ['openai', 'modelslab', 'alibaba', 'gemini', 'replicate'],
  'image-to-video': ['alibaba', 'modelslab', 'replicate'],
  'avatar-video': ['alibaba', 'modelslab'],
  'lip-sync': ['alibaba', 'modelslab'],
  'video-extend': ['openai', 'replicate'],
};

const PROVIDER_MODELS: Record<VideoProvider, Record<VideoType, string>> = {
  openai: {
    'text-to-video': 'sora',
    'image-to-video': 'sora',
    'video-extend': 'sora',
    'avatar-video': '',
    'lip-sync': '',
  },
  modelslab: {
    'text-to-video': 'animatediff',
    'image-to-video': 'animatediff',
    'avatar-video': 'wav2lip',
    'lip-sync': 'wav2lip',
    'video-extend': '',
  },
  alibaba: {
    'text-to-video': 'wan-2.1',
    'image-to-video': 'wan-2.1-i2v',
    'avatar-video': 'wan-avatar',
    'lip-sync': 'wan-lipsync',
    'video-extend': '',
  },
  gemini: {
    'text-to-video': 'veo-2',
    'image-to-video': 'veo-2',
    'avatar-video': '',
    'lip-sync': '',
    'video-extend': '',
  },
  replicate: {
    'text-to-video': 'stable-video-diffusion',
    'image-to-video': 'stable-video-diffusion',
    'avatar-video': 'sadtalker',
    'lip-sync': 'sadtalker',
    'video-extend': 'stable-video-diffusion',
  },
  auto: {
    'text-to-video': 'auto',
    'image-to-video': 'auto',
    'avatar-video': 'auto',
    'lip-sync': 'auto',
    'video-extend': 'auto',
  },
};

// ============================================================================
// SERVICE CLASS
// ============================================================================

class UnifiedVideoService {
  private providerStatus: Map<VideoProvider, ProviderStatus> = new Map();
  
  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const startTime = Date.now();
    const providers = this.getProviderChain(request);
    
    let lastError: string | undefined;
    let lastErrorCode: string | undefined;
    
    for (const provider of providers) {
      if (!this.isProviderAvailable(provider, request.type)) {
        console.log(`[Video] Skipping ${provider} - not available for ${request.type}`);
        continue;
      }
      
      try {
        console.log(`[Video] Attempting ${provider} for ${request.type}`);
        
        const result = await this.callEdgeFunction(provider, request);
        
        if (result.success) {
          // Update provider status
          this.updateProviderStatus(provider, true);
          
          return {
            ...result,
            provider,
            model: PROVIDER_MODELS[provider][request.type],
            generationTime: Date.now() - startTime,
          };
        }
        
        lastError = result.error;
        lastErrorCode = result.errorCode;
        this.updateProviderStatus(provider, false, result.error);
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        this.updateProviderStatus(provider, false, lastError);
        console.error(`[Video] ${provider} failed:`, error);
      }
    }
    
    // All providers failed
    return {
      success: false,
      provider: 'auto',
      error: lastError || 'All video providers failed',
      errorCode: lastErrorCode || 'ALL_PROVIDERS_FAILED',
      canRetry: true,
      generationTime: Date.now() - startTime,
    };
  }

  // ============================================================================
  // EDGE FUNCTION CALL
  // ============================================================================

  private async callEdgeFunction(
    provider: VideoProvider,
    request: VideoGenerationRequest
  ): Promise<VideoGenerationResult> {
    const { data, error } = await supabase.functions.invoke('ai-video-generator', {
      body: {
        action: this.getActionFromType(request.type),
        provider,
        prompt: request.prompt,
        ...request.options,
      },
    });

    if (error) {
      return {
        success: false,
        provider,
        error: error.message,
        errorCode: 'EDGE_FUNCTION_ERROR',
        canRetry: true,
      };
    }

    if (!data?.success) {
      return {
        success: false,
        provider,
        error: data?.error || 'Generation failed',
        errorCode: data?.errorCode || 'GENERATION_FAILED',
        canRetry: data?.canRetry ?? true,
      };
    }

    return {
      success: true,
      provider,
      videoUrl: data.videoUrl || data.video_url,
      thumbnailUrl: data.thumbnailUrl || data.thumbnail_url,
      duration: data.duration,
      creditsUsed: data.creditsUsed || data.credits_used,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getProviderChain(request: VideoGenerationRequest): VideoProvider[] {
    if (request.provider && request.provider !== 'auto') {
      // Specific provider requested, try it first then fallback
      const fallbackChain = PROVIDER_CHAINS[request.type].filter(p => p !== request.provider);
      return [request.provider, ...fallbackChain];
    }
    return PROVIDER_CHAINS[request.type];
  }

  private isProviderAvailable(provider: VideoProvider, type: VideoType): boolean {
    const model = PROVIDER_MODELS[provider]?.[type];
    if (!model) return false;
    
    const status = this.providerStatus.get(provider);
    if (!status) return true; // Assume available if no status
    
    // Don't use provider if it failed recently (within 5 minutes)
    if (!status.available) {
      const lastChecked = new Date(status.lastChecked).getTime();
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      if (lastChecked > fiveMinutesAgo) {
        return false;
      }
    }
    
    return status.available;
  }

  private updateProviderStatus(provider: VideoProvider, available: boolean, error?: string): void {
    this.providerStatus.set(provider, {
      provider,
      available,
      lastError: error,
      lastChecked: new Date().toISOString(),
    });
  }

  private getActionFromType(type: VideoType): string {
    switch (type) {
      case 'text-to-video': return 'generate';
      case 'image-to-video': return 'image-to-video';
      case 'avatar-video': return 'generate-avatar';
      case 'lip-sync': return 'lip-sync';
      case 'video-extend': return 'extend-video';
      default: return 'generate';
    }
  }

  // ============================================================================
  // STATUS CHECK
  // ============================================================================

  async checkProviderHealth(): Promise<ProviderStatus[]> {
    const providers: VideoProvider[] = ['openai', 'modelslab', 'alibaba', 'gemini', 'replicate'];
    const results: ProviderStatus[] = [];

    for (const provider of providers) {
      try {
        const start = Date.now();
        const { data, error } = await supabase.functions.invoke('ai-video-generator', {
          body: { action: 'health-check', provider },
        });
        
        const latency = Date.now() - start;
        const available = !error && data?.healthy;
        
        const status: ProviderStatus = {
          provider,
          available,
          latency,
          lastError: error?.message || data?.error,
          lastChecked: new Date().toISOString(),
        };
        
        this.providerStatus.set(provider, status);
        results.push(status);
      } catch (error) {
        const status: ProviderStatus = {
          provider,
          available: false,
          lastError: error instanceof Error ? error.message : 'Health check failed',
          lastChecked: new Date().toISOString(),
        };
        this.providerStatus.set(provider, status);
        results.push(status);
      }
    }

    return results;
  }

  getProviderStatuses(): ProviderStatus[] {
    return Array.from(this.providerStatus.values());
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const unifiedVideoService = new UnifiedVideoService();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function generateTextToVideo(
  prompt: string,
  options: Partial<VideoGenerationOptions> = {}
): Promise<VideoGenerationResult> {
  return unifiedVideoService.generateVideo({
    type: 'text-to-video',
    prompt,
    options,
  });
}

export async function generateImageToVideo(
  prompt: string,
  imageUrl: string,
  options: Partial<VideoGenerationOptions> = {}
): Promise<VideoGenerationResult> {
  return unifiedVideoService.generateVideo({
    type: 'image-to-video',
    prompt,
    options: {
      ...options,
      sourceImageUrl: imageUrl,
    },
  });
}

export async function generateAvatarVideo(
  text: string,
  avatarId: string,
  options: Partial<VideoGenerationOptions> = {}
): Promise<VideoGenerationResult> {
  return unifiedVideoService.generateVideo({
    type: 'avatar-video',
    prompt: text,
    options: {
      ...options,
      avatarId,
      voiceText: text,
    },
  });
}

export async function generateLipSyncVideo(
  audioUrl: string,
  avatarId: string,
  options: Partial<VideoGenerationOptions> = {}
): Promise<VideoGenerationResult> {
  return unifiedVideoService.generateVideo({
    type: 'lip-sync',
    prompt: '',
    options: {
      ...options,
      avatarId,
      audioUrl,
    },
  });
}
