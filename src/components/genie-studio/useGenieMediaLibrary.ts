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
        
        // Determine the correct URL to use
        // Priority: 
        // 1. If storage_path exists, ALWAYS construct public URL from storage (most reliable)
        // 2. If file_url starts with http (not blob), use it directly
        // 3. Mark file as inaccessible if only blob URL
        let finalUrl: string | undefined = undefined;
        let storageUrlConstructed = false;
        
        // Always prefer storage URL when available - blob URLs won't work across sessions
        if (item.storage_path) {
          // Ensure storage path has .mp3 extension for audio files
          let storagePath = item.storage_path;
          if (!storagePath.endsWith('.mp3') && !storagePath.endsWith('.wav') && !storagePath.endsWith('.ogg')) {
            storagePath = `${storagePath}.mp3`;
          }
          
          // Try multiple bucket names as fallbacks (handle legacy data inconsistencies)
          const bucketCandidates = [
            item.storage_bucket,
            'genie-media',
            'generated-media',
            'generated-audio'
          ].filter(Boolean) as string[];
          
          for (const bucket of bucketCandidates) {
            try {
              const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(storagePath);
              if (publicUrl) {
                finalUrl = publicUrl;
                storageUrlConstructed = true;
                console.log(`📀 Using storage URL for ${item.name}:`, finalUrl.substring(0, 80));
                break;
              }
            } catch (e) {
              console.warn(`📀 Bucket ${bucket} not accessible for ${item.name}`);
            }
          }
        }
        
        // If no storage URL, check if file_url is valid (not blob)
        if (!storageUrlConstructed && item.file_url) {
          if (item.file_url.startsWith('https://') && !item.file_url.startsWith('blob:')) {
            finalUrl = item.file_url;
            console.log(`📀 Using direct URL for ${item.name}:`, finalUrl.substring(0, 80));
          } else if (item.file_url.startsWith('blob:') || item.file_url.startsWith('data:')) {
            console.warn(`📀 Warning: ${item.name} has blob/data URL but no valid storage path - file is NOT accessible`);
            // Don't use blob URL - it won't work across sessions
            finalUrl = undefined;
          }
        }
        
        // Determine metadataType with better fallback logic
        const metadataType = metadata.type || metadata.uploadedAs || undefined;
        
        console.log(`📀 Loaded audio file: ${item.name}, metadataType: ${metadataType}, hasUrl: ${!!finalUrl}`);
        
        return {
          id: item.id,
          name: item.name,
          url: finalUrl,
          timestamp: new Date(item.created_at).getTime(),
          scriptText: metadata.scriptText as string | undefined,
          originalScript: metadata.originalScript as string | undefined,
          scriptType: metadata.scriptType as VoiceoverData['scriptType'],
          metadataType: metadataType
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
