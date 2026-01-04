/**
 * Hook to load and manage production context from URL params
 * Used when navigating from Production Hub to Genie Vibe
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  buildProductionContext, 
  type ProductionContext,
  type StudioSettingsFromProduction,
  SHOW_TYPE_TO_SCRIPT_MODE 
} from '@/types/productionContext';
import { getVoiceSettingsForMode, getRecordingLayoutForMode } from '@/config/scriptModePresets';
import type { ShowWithParticipants } from '@/types/shows';

interface UseProductionContextResult {
  productionContext: ProductionContext | null;
  studioSettings: StudioSettingsFromProduction | null;
  isLoading: boolean;
  error: string | null;
  showId: string | null;
  refresh: () => Promise<void>;
}

export function useProductionContext(): UseProductionContextResult {
  const [searchParams] = useSearchParams();
  const showId = searchParams.get('showId');
  
  const [productionContext, setProductionContext] = useState<ProductionContext | null>(null);
  const [studioSettings, setStudioSettings] = useState<StudioSettingsFromProduction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadProductionContext = useCallback(async () => {
    if (!showId) {
      setProductionContext(null);
      setStudioSettings(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch show with participants and assets
      const { data: show, error: fetchError } = await supabase
        .from('shows')
        .select(`
          *,
          show_participants (*),
          show_assets (*)
        `)
        .eq('id', showId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!show) throw new Error('Show not found');
      
      // Transform to ShowWithParticipants - cast for type compatibility
      const showWithParticipants = {
        ...show,
        metadata: (show.metadata || {}) as Record<string, any>,
        participants: (show.show_participants || []) as any,
        assets: (show.show_assets || []) as any,
      } as ShowWithParticipants;
      
      // Build production context
      const context = buildProductionContext(showWithParticipants);
      setProductionContext(context);
      
      // Derive studio settings from context
      const scriptMode = context.scriptMode;
      const voiceSettings = getVoiceSettingsForMode(scriptMode);
      const layoutPreset = getRecordingLayoutForMode(scriptMode);
      
      const settings: StudioSettingsFromProduction = {
        // Teleprompter
        teleprompterSpeed: scriptMode === 'podcast' ? 1.2 : scriptMode === 'video' ? 1.0 : 0.9,
        teleprompterEnabled: layoutPreset.showTeleprompter,
        
        // TTS - use correct property names from voiceSettings
        ttsVoiceId: voiceSettings.voiceId,
        ttsProvider: voiceSettings.provider,
        ttsVoiceSettings: {
          stability: voiceSettings.settings.stability,
          similarity_boost: voiceSettings.settings.similarity_boost,
          style: voiceSettings.settings.style,
          speed: voiceSettings.settings.speed,
        },
        
        // Layout
        showParticipantList: layoutPreset.showParticipantList,
        showTimer: layoutPreset.showTimer,
        showVisualCues: layoutPreset.showVisualCues,
        
        // Audio
        studioSoundEnabled: scriptMode === 'podcast' || scriptMode === 'webcast',
        noiseReductionLevel: scriptMode === 'podcast' ? 'high' : 'medium',
      };
      
      setStudioSettings(settings);
      
    } catch (err: any) {
      console.error('Error loading production context:', err);
      setError(err.message || 'Failed to load production');
      setProductionContext(null);
      setStudioSettings(null);
    } finally {
      setIsLoading(false);
    }
  }, [showId]);
  
  useEffect(() => {
    loadProductionContext();
  }, [loadProductionContext]);
  
  return {
    productionContext,
    studioSettings,
    isLoading,
    error,
    showId,
    refresh: loadProductionContext,
  };
}
