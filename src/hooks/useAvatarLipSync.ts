/**
 * Avatar & Lip-Sync Generation Hook
 * 
 * Uses existing providers (Alibaba WAN 2.2, ModelsLab, Azure) for:
 * - AI Avatar Videos (talking head animation)
 * - Lip-Sync Translation (synchronized dubbing)
 * 
 * NO new providers needed - leverages configured API keys.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AvatarRequest {
  type: 'avatar' | 'lipsync';
  sourceImage: string;
  script?: string;
  audioUrl?: string;
  language?: string;
  voiceId?: string;
}

export interface AvatarResult {
  success: boolean;
  videoUrl?: string;
  audioUrl?: string;
  visemeData?: VisemeData[];
  provider?: string;
  model?: string;
  error?: string;
}

export interface VisemeData {
  offset: number;
  visemeId: number;
  audioOffset?: number;
}

// Provider capabilities for avatar/lip-sync
export const AVATAR_PROVIDERS = {
  alibaba: {
    id: 'alibaba',
    name: 'Alibaba WAN 2.2 Animate',
    capabilities: ['avatar', 'lipsync', 'character_animation'],
    secretKey: 'ALIBABA_API_KEY',
    strengths: ['Open-source', 'Free tier available', 'CJK language support', 'Motion transfer'],
    maxDuration: 60,
  },
  modelslab: {
    id: 'modelslab',
    name: 'ModelsLab Avatar',
    capabilities: ['avatar', 'lipsync', 'voice_clone'],
    secretKey: 'MODELSLAB_API_KEY',
    strengths: ['Multi-style avatars', 'Voice cloning', 'Fast processing'],
    maxDuration: 30,
  },
  azure: {
    id: 'azure',
    name: 'Azure Speech Visemes',
    capabilities: ['lipsync', 'viseme_data'],
    secretKey: 'AZURE_SPEECH_KEY',
    strengths: ['High-quality TTS', 'Precise viseme timing', 'Many languages'],
    maxDuration: 300,
  },
  google: {
    id: 'google',
    name: 'Google Speech API',
    capabilities: ['lipsync'],
    secretKey: 'GOOGLE_API_KEY',
    strengths: ['Wide language support', 'Natural voices'],
    maxDuration: 300,
  },
} as const;

export type AvatarProviderId = keyof typeof AVATAR_PROVIDERS;

export function useAvatarLipSync() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);

  /**
   * Generate AI Avatar video from a still image + script
   */
  const generateAvatar = useCallback(async (
    sourceImage: string,
    script: string,
    options?: {
      language?: string;
      voiceId?: string;
      preferredProvider?: AvatarProviderId;
    }
  ): Promise<AvatarResult> => {
    setIsGenerating(true);
    setProgress(10);

    try {
      toast.info('Generating AI avatar video...', { duration: 3000 });

      // Use unified video service for automatic fallback chain
      const { generateAvatarVideo } = await import('@/components/universal-editor/services/unifiedVideoService');
      
      setProgress(30);
      
      const result = await generateAvatarVideo(script, sourceImage, {
        voiceId: options?.voiceId,
      });

      setProgress(100);
      setCurrentProvider(result.provider);

      if (result.success) {
        toast.success(`Avatar generated with ${result.provider}!`);
        return {
          success: true,
          videoUrl: result.videoUrl,
          provider: result.provider,
          model: result.model,
        };
      } else {
        throw new Error(result.error || 'Avatar generation failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Avatar generation failed: ${message}`);
      return { success: false, error: message };
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, []);

  /**
   * Generate lip-synced video from image + audio
   */
  const generateLipSync = useCallback(async (
    sourceImage: string,
    audioUrl: string,
    options?: {
      language?: string;
      preferredProvider?: AvatarProviderId;
    }
  ): Promise<AvatarResult> => {
    setIsGenerating(true);
    setProgress(10);

    try {
      toast.info('Generating lip-sync video...', { duration: 3000 });

      // Use unified video service for automatic fallback chain
      const { generateLipSyncVideo } = await import('@/components/universal-editor/services/unifiedVideoService');
      
      setProgress(30);
      
      const result = await generateLipSyncVideo(audioUrl, sourceImage);

      setProgress(100);
      setCurrentProvider(result.provider);

      if (result.success) {
        toast.success(`Lip-sync generated with ${result.provider}!`);
        return {
          success: true,
          videoUrl: result.videoUrl,
          provider: result.provider,
          model: result.model,
        };
      } else {
        throw new Error(result.error || 'Lip-sync generation failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Lip-sync failed: ${message}`);
      return { success: false, error: message };
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, []);

  /**
   * Generate lip-synced translation for multilingual dubbing
   */
  const generateDubbedVideo = useCallback(async (
    sourceImage: string,
    originalScript: string,
    targetLanguage: string,
    options?: {
      preserveVoice?: boolean;
      voiceStyle?: 'original' | 'professional' | 'casual';
    }
  ): Promise<AvatarResult> => {
    setIsGenerating(true);
    setProgress(5);

    try {
      toast.info(`Translating and dubbing to ${targetLanguage}...`, { duration: 5000 });

      // Step 1: Translate the script (handled by backend)
      setProgress(20);

      // Step 2: Generate lip-synced avatar with translated audio
      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: {
          type: 'lipsync',
          sourceImage,
          script: originalScript, // Backend will translate
          language: targetLanguage,
          translateScript: true,
          voiceStyle: options?.voiceStyle || 'professional',
        },
      });

      if (error) throw error;

      setProgress(100);

      if (data.success) {
        toast.success(`Video dubbed to ${targetLanguage}!`);
        return {
          success: true,
          videoUrl: data.videoUrl,
          audioUrl: data.audioUrl,
          visemeData: data.visemeData,
          provider: data.provider,
          model: data.model,
        };
      } else {
        throw new Error(data.error || 'Dubbing failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Dubbing failed: ${message}`);
      return { success: false, error: message };
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, []);

  /**
   * Get available providers based on configured API keys
   */
  const getAvailableProviders = useCallback((): AvatarProviderId[] => {
    // This would ideally check actual configuration
    // For now, return all as potentially available
    return Object.keys(AVATAR_PROVIDERS) as AvatarProviderId[];
  }, []);

  return {
    // Actions
    generateAvatar,
    generateLipSync,
    generateDubbedVideo,
    getAvailableProviders,
    
    // State
    isGenerating,
    progress,
    currentProvider,
    
    // Provider info
    providers: AVATAR_PROVIDERS,
  };
}

export default useAvatarLipSync;
