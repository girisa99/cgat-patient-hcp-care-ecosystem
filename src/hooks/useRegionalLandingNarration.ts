/**
 * USE REGIONAL LANDING NARRATION
 * 
 * Fetches the active, default narration script + latest TTS audio
 * for a given region from the database. This is the consumer-side hook
 * that connects approved Genie Cast scripts to the landing page hero.
 * 
 * Resolution order:
 *  1. Exact sub-region match (e.g., AFRICA_WEST)
 *  2. Parent region match (e.g., africa)
 *  3. English base fallback (ENGLISH_BASE)
 *  4. null (no script available)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RegionSlug } from '@/config/regionalLandingConfig';

// ── Region slug → script region_code mapping ──
// Maps landing page region slugs to the codes used in regional_narration_scripts
const REGION_SLUG_TO_CODES: Record<RegionSlug, string[]> = {
  nam: ['NAM_US', 'NAM_CA', 'nam'],
  europe: ['EU_WEST', 'EU_DACH', 'EU_NORDIC', 'EU_EAST', 'EU_SOUTH', 'europe'],
  mena: ['MENA_GULF', 'MENA_EGYPT', 'MENA_LEVANT', 'MENA_MSA', 'MENA_MAGHREB', 'mena'],
  india: ['INDIA_NORTH', 'INDIA_SOUTH', 'INDIA_EAST', 'INDIA_WEST', 'INDIA_PAN', 'india'],
  africa: ['AFRICA_WEST', 'AFRICA_EAST', 'AFRICA_SOUTH', 'AFRICA_FRANCO', 'africa'],
  apac: ['CJK_CN', 'CJK_TW', 'CJK_JP', 'CJK_KR', 'SEA_MALAY', 'SEA_THAI', 'SEA_VIET', 'SEA_FILIPINO', 'SEA_SG', 'apac'],
  latam: ['LATAM_BRAZIL', 'LATAM_MEXICO', 'LATAM_ANDEAN', 'LATAM_RIOPLATENSE', 'LATAM_CARIB', 'latam'],
  caribbean: ['LATAM_CARIB', 'caribbean'],
};

export interface LandingNarrationScript {
  id: string;
  region_code: string;
  language_code: string;
  language_display_name: string;
  hook: string;
  problem_statement: string;
  solution: string;
  cta: string;
  full_script: string | null;
  generated_audio_url: string | null;
  tts_provider: string | null;
  status: string;
  is_english_base: boolean;
  is_default: boolean;
}

export interface LandingTTSAudio {
  id: string;
  audio_url: string;
  tts_provider: string;
  tts_voice_id: string;
  tts_locale: string;
  version_number: number;
  generation_mode: string;
}

export interface UseRegionalLandingNarrationReturn {
  /** The best-matching active script for this region */
  script: LandingNarrationScript | null;
  /** The latest TTS audio for the script */
  ttsAudio: LandingTTSAudio | null;
  /** All active scripts for this region (for carousel/multi-voice) */
  allRegionScripts: LandingNarrationScript[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Play the TTS audio */
  playNarration: () => void;
  /** Stop audio playback */
  stopNarration: () => void;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Refresh data from DB */
  refetch: () => void;
}

export const useRegionalLandingNarration = (
  regionSlug: RegionSlug,
  subRegionCode?: string
): UseRegionalLandingNarrationReturn => {
  const [script, setScript] = useState<LandingNarrationScript | null>(null);
  const [ttsAudio, setTtsAudio] = useState<LandingTTSAudio | null>(null);
  const [allRegionScripts, setAllRegionScripts] = useState<LandingNarrationScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  const fetchNarration = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build list of region codes to try, in priority order
      const regionCodes: string[] = [];
      if (subRegionCode) regionCodes.push(subRegionCode);
      const slugCodes = REGION_SLUG_TO_CODES[regionSlug] || [];
      regionCodes.push(...slugCodes);
      // Always add English base as final fallback
      if (!regionCodes.includes('ENGLISH_BASE')) regionCodes.push('ENGLISH_BASE');

      // Fetch all active scripts for these region codes
      const { data: scripts, error: fetchError } = await supabase
        .from('regional_narration_scripts')
        .select('*')
        .eq('status', 'active')
        .in('region_code', regionCodes)
        .order('is_default', { ascending: false })
        .order('updated_at', { ascending: false });

      if (fetchError) {
        console.error('[LandingNarration] Fetch error:', fetchError);
        setError(fetchError.message);
        setIsLoading(false);
        return;
      }

      if (!scripts || scripts.length === 0) {
        console.log('[LandingNarration] No active scripts found for region:', regionSlug);
        setIsLoading(false);
        return;
      }

      setAllRegionScripts(scripts as unknown as LandingNarrationScript[]);

      // Resolve best script: priority = sub-region > parent region > english base
      let bestScript: any = null;
      for (const code of regionCodes) {
        bestScript = scripts.find(s => s.region_code === code);
        if (bestScript) break;
      }

      if (!bestScript) bestScript = scripts[0]; // fallback to first available
      setScript(bestScript as unknown as LandingNarrationScript);

      // Fetch latest TTS audio for this script
      if (bestScript) {
        const { data: ttsData } = await supabase
          .from('tts_audio_versions')
          .select('*')
          .eq('script_id', bestScript.id)
          .eq('status', 'completed')
          .order('version_number', { ascending: false })
          .limit(1)
          .single();

        if (ttsData) {
          setTtsAudio({
            id: ttsData.id,
            audio_url: ttsData.audio_url || '',
            tts_provider: ttsData.tts_provider || '',
            tts_voice_id: ttsData.tts_voice_id || '',
            tts_locale: ttsData.tts_locale || '',
            version_number: ttsData.version_number || 1,
            generation_mode: ttsData.generation_mode || 'auto',
          });
        }
      }
    } catch (err) {
      console.error('[LandingNarration] Error:', err);
      setError('Failed to load regional narration');
    } finally {
      setIsLoading(false);
    }
  }, [regionSlug, subRegionCode]);

  // Fetch on mount and when region changes
  useEffect(() => {
    fetchNarration();
  }, [fetchNarration]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioEl) {
        audioEl.pause();
        audioEl.src = '';
      }
    };
  }, [audioEl]);

  const playNarration = useCallback(() => {
    // Determine audio URL: prefer tts_audio_versions, fallback to script.generated_audio_url
    const audioUrl = ttsAudio?.audio_url || script?.generated_audio_url;
    if (!audioUrl) {
      console.warn('[LandingNarration] No audio URL available');
      return;
    }

    // Stop any existing playback
    if (audioEl) {
      audioEl.pause();
      audioEl.src = '';
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      console.error('[LandingNarration] Audio playback error');
      setIsPlaying(false);
    };
    
    setAudioEl(audio);
    setIsPlaying(true);
    audio.play().catch(() => setIsPlaying(false));
  }, [ttsAudio, script, audioEl]);

  const stopNarration = useCallback(() => {
    if (audioEl) {
      audioEl.pause();
      audioEl.src = '';
    }
    setIsPlaying(false);
  }, [audioEl]);

  return {
    script,
    ttsAudio,
    allRegionScripts,
    isLoading,
    error,
    playNarration,
    stopNarration,
    isPlaying,
    refetch: fetchNarration,
  };
};

export default useRegionalLandingNarration;
