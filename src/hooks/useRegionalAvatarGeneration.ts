/**
 * Regional Avatar Generation Hook
 * Orchestrates 3D avatar + TTS generation for landing page content
 * Integrates with Genie Cast infrastructure (alibaba-avatar-generator, multi-provider-tts)
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { updateRegionalAssets } from '@/services/regionalAssetService';
import type { Avatar3DAsset } from '@/types/regional-assets';

export interface AvatarGenerationOptions {
  contentId: string;
  regionCode: string;
  narrationScript: string;
  language: string;
  avatarStyle?: 'professional' | 'casual' | 'animated';
  avatarPerspective?: 'portrait' | 'bust' | 'full_body';
}

interface GenerationState {
  isLoading: boolean;
  error: string | null;
  progress: 'idle' | 'generating_script' | 'generating_audio' | 'generating_avatar' | 'complete';
  audioUrl?: string;
  avatarUrl?: string;
}

const initialState: GenerationState = {
  isLoading: false,
  error: null,
  progress: 'idle',
};

/**
 * Hook to generate 3D avatars with voiceover for regional landing content
 */
export function useRegionalAvatarGeneration() {
  const [state, setState] = useState<GenerationState>(initialState);

  const generateAvatar = useCallback(
    async (options: AvatarGenerationOptions): Promise<Avatar3DAsset | null> => {
      const {
        contentId,
        regionCode,
        narrationScript,
        language,
        avatarStyle = 'professional',
        avatarPerspective = 'bust',
      } = options;

      try {
        setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          progress: 'generating_audio',
        }));

        // Get auth session
        const { data } = await supabase.auth.getSession();
        const authToken = data.session?.access_token;

        if (!authToken) {
          throw new Error('Authentication required for avatar generation');
        }

        // Step 1: Generate TTS audio using multi-provider-tts
        const ttsResponse = await fetch(
          '/functions/v1/multi-provider-tts',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              text: narrationScript,
              languageCode: language,
              region: regionCode,
              tier: 'premium',
            }),
          }
        );

        if (!ttsResponse.ok) {
          throw new Error(`TTS generation failed: ${ttsResponse.statusText}`);
        }

        const ttsData = await ttsResponse.json();
        const audioUrl = ttsData.audioUrl || ttsData.data?.audioUrl;

        if (!audioUrl) {
          throw new Error('No audio URL returned from TTS generation');
        }

        setState(prev => ({
          ...prev,
          audioUrl,
          progress: 'generating_avatar',
        }));

        // Step 2: Generate avatar video using alibaba-avatar-generator
        // Using Wan 2.2 S2V (Speech-to-Video) for lip-sync
        const avatarResponse = await fetch(
          '/functions/v1/alibaba-avatar-generator',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              model: 'wan2.2-s2v',
              audioUrl,
              prompt: `Create a professional ${avatarStyle} 3D avatar in ${avatarPerspective} view for regional landing page`,
              perspective: avatarPerspective,
              duration: 10, // 10 second default video
              fps: 30,
              resolution: '1080p',
            }),
          }
        );

        if (!avatarResponse.ok) {
          throw new Error(`Avatar generation failed: ${avatarResponse.statusText}`);
        }

        const avatarData = await avatarResponse.json();
        const modelUrl = avatarData.outputUrl || avatarData.data?.outputUrl;

        if (!modelUrl) {
          throw new Error('No avatar URL returned from generation');
        }

        setState(prev => ({
          ...prev,
          avatarUrl: modelUrl,
          progress: 'complete',
        }));

        // Step 3: Save avatar asset to regional_landing_content.assets
        const avatarAsset: Avatar3DAsset = {
          model_url: modelUrl,
          format: 'glb',
          scale: 1.0,
          animation: 'idle',
          has_morphs: true, // Wan 2.2 S2V supports morphs for lip-sync
        };

        await updateRegionalAssets(contentId, {
          avatar_3d: avatarAsset,
        });

        return avatarAsset;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          progress: 'idle',
        }));
        return null;
      } finally {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    generateAvatar,
    reset,
  };
}
