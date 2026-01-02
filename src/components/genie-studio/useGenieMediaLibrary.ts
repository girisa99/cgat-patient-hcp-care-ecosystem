/**
 * Hook for loading media from the database for GenieStudio
 * Fetches voiceovers, music, and audio files from generated_media table
 * and applies AudioFileFilters for proper categorization
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  VoiceoverData,
  MusicItem,
  filterInstrumentalFiles,
  filterTTSFiles,
  filterActualVoiceovers,
  filterCustomVoices
} from './AudioFileFilters';

export interface DatabaseMediaItem {
  id: string;
  name: string;
  file_type: string;
  storage_bucket: string | null;
  storage_path: string | null;
  file_url: string | null;
  duration_seconds: number | null;
  source: string | null;
  created_at: string;
  metadata: {
    type?: string;
    voice?: string;
    scriptType?: string;
    scriptText?: string;
    textLength?: number;
    uploadedAs?: string;
    [key: string]: any;
  } | null;
}

export interface GenieMediaLibrary {
  // Raw data from database
  allAudioFiles: VoiceoverData[];
  
  // Categorized audio
  instrumentalMusic: MusicItem[];
  ttsFiles: VoiceoverData[];
  voiceovers: VoiceoverData[];
  customVoices: VoiceoverData[];
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
}

export function useGenieMediaLibrary(): GenieMediaLibrary {
  const [allAudioFiles, setAllAudioFiles] = useState<VoiceoverData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromDatabase = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in, skipping media load');
        setIsLoading(false);
        return;
      }

      // Fetch all audio files from generated_media
      const { data, error: fetchError } = await supabase
        .from('generated_media')
        .select('*')
        .eq('user_id', user.id)
        .eq('file_type', 'audio')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform to VoiceoverData format
      const audioFiles: VoiceoverData[] = (data || []).map((item) => {
        // Parse metadata safely
        const metadata = typeof item.metadata === 'object' && item.metadata !== null 
          ? item.metadata as Record<string, any>
          : {};
        
        return {
          id: item.id,
          name: item.name,
          url: item.file_url || undefined,
          timestamp: new Date(item.created_at).getTime(),
          scriptText: metadata.scriptText as string | undefined,
          scriptType: metadata.scriptType as VoiceoverData['scriptType'],
          metadataType: (metadata.type || metadata.uploadedAs) as string | undefined
        };
      });

      console.log(`📀 GenieStudio: Loaded ${audioFiles.length} audio files from database`);
      setAllAudioFiles(audioFiles);
      
    } catch (err) {
      console.error('Failed to load media from database:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media');
      toast.error('Failed to load media library');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadFromDatabase();
  }, [loadFromDatabase]);

  // Apply filters to categorize audio files
  const instrumentalMusic: MusicItem[] = filterInstrumentalFiles(allAudioFiles).map(f => ({
    id: f.id,
    name: f.name,
    url: f.url
  }));
  
  const ttsFiles = filterTTSFiles(allAudioFiles);
  const voiceovers = filterActualVoiceovers(allAudioFiles);
  const customVoices = filterCustomVoices(allAudioFiles);

  return {
    allAudioFiles,
    instrumentalMusic,
    ttsFiles,
    voiceovers,
    customVoices,
    isLoading,
    error,
    refresh: loadFromDatabase
  };
}
