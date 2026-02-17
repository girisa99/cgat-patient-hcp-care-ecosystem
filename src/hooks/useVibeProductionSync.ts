/**
 * useVibeProductionSync - Sync Vibe recordings to Production Hub
 * 
 * Handles:
 * - Creating show assets from recordings
 * - Linking recordings to existing shows
 * - Syncing metadata and thumbnails
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { VibeRecording } from './useVibeRecordingPersistence';
import type { ShowType, ProductionStage } from '@/types/shows';

export interface ShowLinkOptions {
  showId?: string; // Link to existing show
  createShow?: {
    title: string;
    description?: string;
    showType: ShowType;
  };
}

export interface SyncResult {
  success: boolean;
  showId?: string;
  assetId?: string;
  error?: string;
}

interface AvailableShow {
  id: string;
  title: string;
  show_type: ShowType;
  current_stage: string; // Can be ProductionStage, DemoStage, etc.
}

interface UseVibeProductionSyncReturn {
  isSyncing: boolean;
  lastSyncResult: SyncResult | null;
  
  // Sync recording to Production Hub
  syncToProductionHub: (recording: VibeRecording, options: ShowLinkOptions) => Promise<SyncResult>;
  
  // List shows available for linking
  getAvailableShows: () => Promise<AvailableShow[]>;
  
  // Update recording thumbnail
  updateRecordingThumbnail: (recordingId: string, thumbnailUrl: string) => Promise<boolean>;
}

export function useVibeProductionSync(): UseVibeProductionSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const getAvailableShows = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('shows')
        .select('id, title, show_type, current_stage')
        .eq('user_id', user.id)
        .in('current_stage', ['recording', 'post_production', 'script', 'rehearsal'])
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch shows:', err);
      return [];
    }
  }, []);

  const syncToProductionHub = useCallback(async (
    recording: VibeRecording,
    options: ShowLinkOptions
  ): Promise<SyncResult> => {
    setIsSyncing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let showId = options.showId;

      // Create new show if requested
      if (!showId && options.createShow) {
        const slug = options.createShow.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        const { data: newShow, error: showError } = await supabase
          .from('shows')
          .insert({
            user_id: user.id,
            title: options.createShow.title,
            description: options.createShow.description || '',
            slug: `${slug}-${Date.now()}`,
            show_type: options.createShow.showType,
            event_category: 'media_production',
            current_stage: 'recording',
            duration_minutes: Math.ceil((recording.duration_seconds || 0) / 60),
            thumbnail_url: recording.thumbnail_url,
            metadata: {
              source: 'genie_vibe',
              vibe_recording_id: recording.id,
            },
          })
          .select('id')
          .single();

        if (showError) throw showError;
        showId = newShow.id;
      }

      if (!showId) {
        throw new Error('No show specified and no create options provided');
      }

      // Determine asset type based on recording type
      const assetType = recording.recording_type === 'audio' ? 'audio' : 'video';

      // Create show asset
      const { data: asset, error: assetError } = await supabase
        .from('show_assets')
        .insert({
          show_id: showId,
          asset_type: assetType,
          name: recording.title,
          file_url: recording.file_url,
          file_size: recording.file_size_bytes,
          duration_seconds: recording.duration_seconds,
          is_primary: true,
          stage: 'recording',
          metadata: {
            source: 'genie_vibe',
            vibe_recording_id: recording.id,
            recording_type: recording.recording_type,
            thumbnail_url: recording.thumbnail_url,
          },
        })
        .select('id')
        .single();

      if (assetError) throw assetError;

      // Update the vibe recording with the show link
      await supabase
        .from('vibe_recordings')
        .update({
          session_data: {
            ...(recording.session_data || {}),
            linked_show_id: showId,
            linked_asset_id: asset.id,
            synced_at: new Date().toISOString(),
          },
        })
        .eq('id', recording.id);

      const result: SyncResult = {
        success: true,
        showId,
        assetId: asset.id,
      };
      
      setLastSyncResult(result);
      toast.success('Recording synced to Production Hub');
      return result;
    } catch (err: unknown) {
      console.error('Production Hub sync failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      const result: SyncResult = {
        success: false,
        error: errorMessage,
      };
      setLastSyncResult(result);
      toast.error(errorMessage);
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updateRecordingThumbnail = useCallback(async (
    recordingId: string,
    thumbnailUrl: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('vibe_recordings')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', recordingId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to update thumbnail:', err);
      toast.error('Failed to update thumbnail');
      return false;
    }
  }, []);

  return {
    isSyncing,
    lastSyncResult,
    syncToProductionHub,
    getAvailableShows,
    updateRecordingThumbnail,
  };
}
