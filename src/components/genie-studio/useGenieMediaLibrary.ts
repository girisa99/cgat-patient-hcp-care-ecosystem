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
        // 1. If file_url is already a valid HTTPS URL (not blob), use it directly
        // 2. If storage_path exists and file_url was blob, mark as potentially inaccessible
        // 3. Blob URLs are NEVER usable across sessions
        let finalUrl: string | undefined = undefined;
        let needsRegeneration = false;
        
        // Check if file_url is already a valid storage URL
        if (item.file_url && item.file_url.startsWith('https://') && !item.file_url.includes('blob:')) {
          finalUrl = item.file_url;
          console.log(`📀 Using existing URL for ${item.name}:`, finalUrl.substring(0, 80));
        } 
        // If file_url is a blob/data URL, try to construct storage URL
        else if (item.file_url && (item.file_url.startsWith('blob:') || item.file_url.startsWith('data:'))) {
          if (item.storage_path) {
            // Ensure storage path has .mp3 extension for audio files
            let storagePath = item.storage_path;
            if (!storagePath.endsWith('.mp3') && !storagePath.endsWith('.wav') && !storagePath.endsWith('.ogg')) {
              storagePath = `${storagePath}.mp3`;
            }
            
            // Construct URL from storage - but note this file may not actually exist
            // (the original blob may not have been uploaded properly)
            const bucket = item.storage_bucket || 'genie-media';
            try {
              const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(storagePath);
              if (publicUrl) {
                finalUrl = publicUrl;
                // Mark that this URL is a guess - file may not exist
                needsRegeneration = true;
                console.warn(`📀 Constructed URL for ${item.name} (original was blob - may need regeneration):`, finalUrl.substring(0, 80));
              }
            } catch (e) {
              console.error(`📀 Failed to construct storage URL for ${item.name}:`, e);
            }
          } else {
            // Blob URL with no storage path - definitely inaccessible
            console.warn(`📀 ${item.name} has blob URL but NO storage path - file is INACCESSIBLE and needs regeneration`);
            needsRegeneration = true;
          }
        }
        // No URL at all
        else if (!item.file_url) {
          console.warn(`📀 ${item.name} has no file_url at all`);
        }
        
        // Determine metadataType with better fallback logic
        const metadataType = metadata.type || metadata.uploadedAs || undefined;
        
        // Log with regeneration status
        if (needsRegeneration) {
          console.log(`📀 Audio file ${item.name}: metadataType=${metadataType}, hasUrl=${!!finalUrl}, ⚠️ NEEDS REGENERATION`);
        } else {
          console.log(`📀 Audio file ${item.name}: metadataType=${metadataType}, hasUrl=${!!finalUrl}`);
        }
        
        return {
          id: item.id,
          name: needsRegeneration ? `⚠️ ${item.name}` : item.name, // Mark files that need regeneration
          url: finalUrl,
          timestamp: new Date(item.created_at).getTime(),
          scriptText: metadata.scriptText as string | undefined,
          originalScript: metadata.originalScript as string | undefined,
          scriptType: metadata.scriptType as VoiceoverData['scriptType'],
          metadataType: metadataType,
          needsRegeneration // Include flag for UI to show warning
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
