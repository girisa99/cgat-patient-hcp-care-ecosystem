/**
 * VibePopoutButton - Opens recording in a separate window
 * 
 * Uses the existing popout infrastructure from RecordingStudio
 * Provides a cleaner screen recording experience
 */

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { openPopoutRecordingStudio } from '@/components/document-processing/popout';
import type { PopoutScriptData, PopoutVoiceoverData, PopoutMusicData, RecordingMode } from '@/components/document-processing/popout/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ScriptItem {
  id: string;
  title: string;
  content: string;
  enhancedContent?: string;
}

interface VoiceoverItem {
  id: string;
  name: string;
  url?: string;
  scriptText?: string;
}

interface MusicItem {
  id: string;
  name: string;
  url?: string;
}

interface VibePopoutButtonProps {
  scripts: ScriptItem[];
  voiceovers: VoiceoverItem[];
  music: MusicItem[];
  selectedScriptId?: string;
  selectedVoiceoverId?: string;
  selectedMusicId?: string;
  recordingMode?: RecordingMode;
  productionContext?: {
    showId: string;
    showTitle: string;
    showType: string;
    scriptMode: 'podcast' | 'webcast' | 'video' | 'audio';
    currentStage: string;
    participants: { id: string; name: string; role: string }[];
  };
  onRecordingComplete?: (result: { id: string; url: string; duration: number }) => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function VibePopoutButton({
  scripts,
  voiceovers,
  music,
  selectedScriptId,
  selectedVoiceoverId,
  selectedMusicId,
  recordingMode = 'camera',
  productionContext,
  onRecordingComplete,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className,
}: VibePopoutButtonProps) {
  
  const handleOpenPopout = useCallback(async () => {
    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      const userAccessToken = session?.access_token;
      
      // Convert scripts to popout format
      const popoutScripts = scripts.map(s => ({
        id: s.id,
        title: s.title,
        content: s.enhancedContent || s.content,
      }));

      // Filter voiceovers and music with URLs
      const validVoiceovers = voiceovers.filter(v => v.url);
      const validMusic = music.filter(m => m.url);

      // Convert to mediaItems format
      const mediaItems = [
        ...validVoiceovers.map(v => ({ id: v.id, name: v.name, url: v.url!, file_type: 'audio' as const })),
        ...validMusic.map(m => ({ id: m.id, name: m.name, url: m.url!, file_type: 'audio' as const })),
      ];

      // Open popout window
      const popoutWindow = openPopoutRecordingStudio({
        mediaItems,
        availableScripts: popoutScripts,
        selectedScript: popoutScripts.find(s => s.id === selectedScriptId) || null,
        selectedAudioFile: validVoiceovers.find(v => v.id === selectedVoiceoverId)
          ? { id: selectedVoiceoverId!, name: validVoiceovers.find(v => v.id === selectedVoiceoverId)!.name, url: validVoiceovers.find(v => v.id === selectedVoiceoverId)!.url!, file_type: 'audio' as const }
          : null,
        selectedBackgroundMusic: validMusic.find(m => m.id === selectedMusicId)
          ? { id: selectedMusicId!, name: validMusic.find(m => m.id === selectedMusicId)!.name, url: validMusic.find(m => m.id === selectedMusicId)!.url!, file_type: 'audio' as const }
          : null,
        recordingMode,
        productionContext,
        userAccessToken,
        onSuccess: () => {
          toast.success('Recording saved from pop-out window');
        },
        onError: (error) => {
          toast.error(`Pop-out error: ${error}`);
        },
      });

      if (popoutWindow) {
        toast.info('Recording studio opened in new window', {
          description: 'Use the pop-out for a cleaner screen recording experience',
        });
      }
    } catch (err) {
      console.error('[VibePopoutButton] Error:', err);
      toast.error('Failed to open pop-out recording studio');
    }
  }, [
    scripts,
    voiceovers,
    music,
    selectedScriptId,
    selectedVoiceoverId,
    selectedMusicId,
    recordingMode,
    productionContext,
    onRecordingComplete,
  ]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleOpenPopout}
      disabled={disabled}
      className={cn("gap-2", className)}
      title="Open in separate window for cleaner screen recording"
    >
      <Maximize2 className="h-4 w-4" />
      <span className="hidden sm:inline">Pop Out</span>
    </Button>
  );
}

export default VibePopoutButton;
