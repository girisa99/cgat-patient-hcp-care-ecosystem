/**
 * Unified Media Orchestrator
 *
 * Coordinates all media generation across the Genie ecosystem:
 * - RunPod FFmpeg (Primary): Video assembly and stitching
 * - Cloud Run GPU (Phase 2): Avatar, 3D, VR/AR heavy processing
 * - Edge Functions: TTS, routing, quotas
 *
 * @see docs/architecture/UNIFIED_MEDIA_INFRASTRUCTURE.md
 */

import { GlobalTier, getProviderTier, filterProvidersByTier, getTierConfig } from './globalTierService';

// =============================================================================
// TYPES
// =============================================================================

export type MediaType = 'video-assembly' | 'avatar' | '3d' | 'vr-ar' | 'tts';
export type ProcessingPhase = 'phase1-runpod-ffmpeg' | 'phase2-cloudrun' | 'edge-function';

export interface MediaJobConfig {
  type: MediaType;
  tier: GlobalTier;
  region?: string;
  assets: MediaAsset[];
  output: OutputConfig;
  userId: string;
  isInternal?: boolean;
}

export interface MediaAsset {
  type: 'audio' | 'image' | 'video' | 'text' | 'graphics';
  url?: string;
  content?: string;
  duration?: number;
  startTime?: number;
}

export interface OutputConfig {
  format: 'mp4' | 'webm' | 'gif';
  quality: '720p' | '1080p' | '4k';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
}

export interface MediaJobResult {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  provider: string;
  phase: ProcessingPhase;
  outputUrl?: string;
  estimatedDuration?: number;
  cost?: number;
}

// =============================================================================
// PROVIDER CONFIGURATION
// =============================================================================

export const MEDIA_PROVIDERS = {
  // Primary - RunPod FFmpeg (Active)
  'runpod-ffmpeg': {
    phase: 'phase1-runpod-ffmpeg' as ProcessingPhase,
    capabilities: ['video-assembly', 'timeline-edit', 'transitions', 'audio-overlay'],
    maxDuration: 7200, // 120 minutes (RunPod has no hard duration limit)
    costPerMinute: 0.02,
    active: true,
  },
  
  // Phase 2 - Cloud Run GPU (Planned)
  'cloudrun-avatar': {
    phase: 'phase2-cloudrun' as ProcessingPhase,
    capabilities: ['avatar', 'lip-sync'],
    providers: ['alibaba-wan-2.2', 'elevenlabs-avatar'],
    costPerMinute: 0.10,
    active: false, // Enable when Cloud Run is ready
  },
  'cloudrun-3d': {
    phase: 'phase2-cloudrun' as ProcessingPhase,
    capabilities: ['3d', 'mesh-generation', 'texturing'],
    providers: ['meshy-ai', 'modelslab-3d'],
    costPerMinute: 0.15,
    active: false,
  },
  'cloudrun-vr': {
    phase: 'phase2-cloudrun' as ProcessingPhase,
    capabilities: ['vr-ar', '3dgs', 'real-time-render'],
    providers: ['taoavatar', 'alibaba-3d'],
    costPerMinute: 0.20,
    active: false,
  },
  'cloudrun-ffmpeg': {
    phase: 'phase2-cloudrun' as ProcessingPhase,
    capabilities: ['video-assembly', 'custom-edit'],
    costPerMinute: 0.02,
    active: false, // Future alternative to RunPod FFmpeg
  },
};

// =============================================================================
// TIER-BASED QUOTAS
// =============================================================================

export const TIER_QUOTAS = {
  free: {
    videoMinutes: 0,
    avatarMinutes: 0,
    threeDMinutes: 0,
    features: ['preview-only'],
  },
  creator: {
    videoMinutes: 10,
    avatarMinutes: 0,
    threeDMinutes: 0,
    features: ['runpod-ffmpeg-720p', 'basic-transitions'],
  },
  pro: {
    videoMinutes: 60,
    avatarMinutes: 10,
    threeDMinutes: 5,
    features: ['runpod-ffmpeg-1080p', 'avatar-preset', 'basic-3d'],
  },
  business: {
    videoMinutes: 300,
    avatarMinutes: 60,
    threeDMinutes: 30,
    features: ['runpod-ffmpeg-4k', 'avatar-custom', 'meshy-full', 'advanced-transitions'],
  },
  enterprise: {
    videoMinutes: -1, // Unlimited
    avatarMinutes: -1,
    threeDMinutes: -1,
    features: ['all', 'vr-ar', 'custom-training'],
  },
  internal: {
    videoMinutes: -1,
    avatarMinutes: -1,
    threeDMinutes: -1,
    features: ['all', 'admin-tools', 'batch-processing'],
  },
};

// =============================================================================
// ORCHESTRATOR SERVICE
// =============================================================================

class UnifiedMediaOrchestrator {
  /**
   * Check if a media type is available for the given tier
   */
  isMediaTypeAvailable(mediaType: MediaType, tier: GlobalTier, isInternal = false): boolean {
    if (isInternal) return true;
    
    const quotaKey = this.getQuotaKey(mediaType);
    const tierQuota = TIER_QUOTAS[tier as keyof typeof TIER_QUOTAS];
    
    if (!tierQuota) return false;
    
    const quota = tierQuota[quotaKey as keyof typeof tierQuota];
    return typeof quota === 'number' && quota !== 0;
  }

  /**
   * Get the appropriate provider for a media job based on tier and type
   */
  getProvider(config: MediaJobConfig): { provider: string; phase: ProcessingPhase } {
    const { type, tier, isInternal } = config;
    
    // Video assembly uses RunPod FFmpeg
    if (type === 'video-assembly') {
      const quality = this.getQualityFromTier(tier);
      return {
        provider: `runpod-ffmpeg-${quality === '4k' ? '4k' : quality === '1080p' ? 'hd' : 'standard'}`,
        phase: 'phase1-runpod-ffmpeg',
      };
    }
    
    // Avatar, 3D, VR/AR require Cloud Run (Phase 2)
    if (type === 'avatar' || type === '3d' || type === 'vr-ar') {
      const provider = MEDIA_PROVIDERS[`cloudrun-${type === 'vr-ar' ? 'vr' : type}`];
      
      if (!provider?.active) {
        console.warn(`[MediaOrchestrator] ${type} requires Cloud Run (Phase 2) - not yet available`);
        return { provider: 'pending-phase2', phase: 'phase2-cloudrun' };
      }
      
      return {
        provider: `cloudrun-${type}`,
        phase: 'phase2-cloudrun',
      };
    }
    
    // TTS uses edge functions
    return { provider: 'edge-tts', phase: 'edge-function' };
  }

  /**
   * Estimate cost for a media job
   */
  estimateCost(config: MediaJobConfig, durationMinutes: number): number {
    const { provider } = this.getProvider(config);
    
    if (provider.startsWith('runpod-ffmpeg')) {
      return durationMinutes * MEDIA_PROVIDERS['runpod-ffmpeg'].costPerMinute;
    }
    
    // Add other provider costs as Phase 2 activates
    return durationMinutes * 0.05; // Default estimate
  }

  /**
   * Check remaining quota for a user
   */
  async checkQuota(
    userId: string, 
    mediaType: MediaType, 
    tier: GlobalTier,
    isInternal = false
  ): Promise<{ remaining: number; unlimited: boolean }> {
    if (isInternal) {
      return { remaining: -1, unlimited: true };
    }
    
    const quotaKey = this.getQuotaKey(mediaType);
    const tierQuota = TIER_QUOTAS[tier as keyof typeof TIER_QUOTAS];
    const maxQuota = tierQuota?.[quotaKey as keyof typeof tierQuota] as number || 0;
    
    if (maxQuota === -1) {
      return { remaining: -1, unlimited: true };
    }
    
    // TODO: Query actual usage from genie_usage_logs table
    // For now, return the tier limit
    return { remaining: maxQuota, unlimited: false };
  }

  /**
   * Build render timeline payload for RunPod FFmpeg
   */
  buildRenderTimelinePayload(config: MediaJobConfig): object {
    const { assets, output } = config;

    // Convert assets to timeline format
    const scenes: any[] = [];
    let currentTime = 0;
    
    for (const asset of assets) {
      if (asset.type === 'image') {
        scenes.push({
          background: asset.url,
          duration: asset.duration || 5,
          transition: { type: 'fade', duration: 0.5 },
        });
      }
      
      if (asset.type === 'audio' && asset.url) {
        // Audio track spans entire video
        // Will be added as soundtrack
      }
      
      currentTime += asset.duration || 5;
    }
    
    // Find audio asset for soundtrack
    const audioAsset = assets.find(a => a.type === 'audio');
    
    return {
      template: 'custom',
      resolution: output.quality === '4k' ? '3840x2160' : 
                  output.quality === '1080p' ? '1920x1080' : '1280x720',
      fps: 30,
      scenes,
      soundtrack: audioAsset?.url ? {
        src: audioAsset.url,
        volume: 1,
      } : undefined,
    };
  }

  // =============================================================================
  // PRIVATE HELPERS
  // =============================================================================

  private getQuotaKey(mediaType: MediaType): string {
    switch (mediaType) {
      case 'video-assembly': return 'videoMinutes';
      case 'avatar': return 'avatarMinutes';
      case '3d':
      case 'vr-ar': return 'threeDMinutes';
      default: return 'videoMinutes';
    }
  }

  private getQualityFromTier(tier: GlobalTier): '720p' | '1080p' | '4k' {
    switch (tier) {
      case 'standard': return '720p';
      case 'advanced': return '1080p';
      case 'premium': return '4k';
      default: return '720p';
    }
  }
}

// Export singleton instance
export const unifiedMediaOrchestrator = new UnifiedMediaOrchestrator();
