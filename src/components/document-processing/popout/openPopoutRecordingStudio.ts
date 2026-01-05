/**
 * Opens the pop-out recording studio window
 */

import { generatePopoutHTML } from './generatePopoutHTML';
import type { 
  PopoutConfig, 
  MediaItemForPopout, 
  ScriptItemForPopout,
  PopoutScriptData,
  PopoutVoiceoverData,
  PopoutMusicData
} from './types';

interface OpenPopoutOptions {
  mediaItems: MediaItemForPopout[];
  availableScripts: ScriptItemForPopout[];
  selectedScript: ScriptItemForPopout | null;
  selectedAudioFile: MediaItemForPopout | null;
  selectedBackgroundMusic: MediaItemForPopout | null;
  supabaseUrl?: string;
  supabaseKey?: string;
  userAccessToken?: string;
  productionContext?: {
    showId: string;
    showTitle: string;
    showType: string;
    scriptMode: 'podcast' | 'webcast' | 'video' | 'audio';
    currentStage: string;
    participants: { id: string; name: string; role: string }[];
    studioSettings?: {
      teleprompterSpeed: number;
      ttsVoiceId: string;
      ttsProvider: 'openai' | 'elevenlabs';
    };
  };
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

/**
 * Opens the pop-out recording studio in a new window
 */
export function openPopoutRecordingStudio(options: OpenPopoutOptions): Window | null {
  try {
    const {
      mediaItems,
      availableScripts,
      selectedScript,
      selectedAudioFile,
      selectedBackgroundMusic,
      supabaseUrl = 'https://ithspbabhmdntioslfqe.supabase.co',
      supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw',
      userAccessToken,
      productionContext,
      onSuccess,
      onError,
    } = options;

    // Filter audio files
    const audioFiles = mediaItems.filter(m => m.file_type === 'audio');
    
    // Music files: instrumental type OR name contains music-related keywords
    const musicFiles = audioFiles.filter(m => 
      m.metadata?.type === 'instrumental' || 
      m.name.toLowerCase().includes('music') || 
      m.name.toLowerCase().includes('instrument') ||
      m.name.toLowerCase().includes('bgm') ||
      m.name.toLowerCase().includes('background') ||
      m.name.toLowerCase().includes('song_')
    );
    
    // Voiceover files: not in music list
    const voiceoverFiles = audioFiles.filter(m => {
      if (musicFiles.includes(m)) return false;
      if (m.metadata?.scriptText || m.metadata?.scriptType === 'audio' || m.metadata?.scriptType === 'video') {
        return true;
      }
      if (m.metadata?.voice) return true;
      return true;
    });

    console.log('📋 Pop-out data:', {
      scripts: availableScripts.length,
      voiceovers: voiceoverFiles.length,
      voiceoverNames: voiceoverFiles.map(v => v.name),
      music: musicFiles.length,
      musicNames: musicFiles.map(m => m.name),
      allAudio: audioFiles.length
    });

    // Prepare data for the pop-out with version info
    const scriptsData: PopoutScriptData[] = availableScripts.map(s => ({
      id: s.id,
      title: s.title,
      content: s.content,
      originalContent: (s as any).originalContent || s.content,
      enhancedContent: (s as any).enhancedContent,
      cleanContent: (s as any).cleanContent,
      draftContent: (s as any).draftContent,
      draftStatus: (s as any).draftStatus,
      type: (s as any).type || 'video',
      purpose: (s as any).purpose
    }));

    const voiceoversData: PopoutVoiceoverData[] = voiceoverFiles.map(a => {
      const url = a.url;
      // Warn about blob URLs - they won't work in the popout
      if (url && (url.startsWith('blob:') || url.startsWith('data:'))) {
        console.warn(`⚠️ Voiceover "${a.name}" has blob/data URL which won't work in popout:`, url.substring(0, 50));
      }
      return {
        id: a.id,
        name: a.name,
        url: url,
        scriptText: (a.metadata?.scriptText as string) || null,
        originalScript: (a.metadata?.originalScript as string) || null,
        scriptType: (a.metadata?.scriptType as string) || null,
        metadataType: (a.metadata?.type as string) || null
      };
    });

    const musicData: PopoutMusicData[] = musicFiles.map(m => {
      const url = m.url;
      // Warn about blob URLs - they won't work in the popout
      if (url && (url.startsWith('blob:') || url.startsWith('data:'))) {
        console.warn(`⚠️ Music "${m.name}" has blob/data URL which won't work in popout:`, url.substring(0, 50));
      }
      return {
        id: m.id,
        name: m.name,
        url: url
      };
    });

    const config: PopoutConfig = {
      scripts: scriptsData,
      voiceovers: voiceoversData,
      music: musicData,
      selectedScriptId: selectedScript?.id || '',
      selectedVoiceoverId: selectedAudioFile?.id || '',
      selectedMusicId: selectedBackgroundMusic?.id || '',
      supabaseUrl,
      supabaseKey,
      userAccessToken,
      productionContext,
    };

    // Generate HTML content
    console.log('🎬 Generating HTML content...');
    const htmlContent = generatePopoutHTML(config);
    console.log('📝 Generated HTML length:', htmlContent.length);

    // Use about:blank and document.write - this inherits the parent origin
    // which is CRITICAL for camera permissions to work
    console.log('🪟 Opening popup window...');
    const popoutWindow = window.open(
      '',  // Empty string = about:blank, inherits origin
      'recording-studio',
      'width=1400,height=900,left=100,top=50,toolbar=no,menubar=no,scrollbars=no,resizable=yes'
    );

    if (!popoutWindow) {
      console.error('❌ Pop-up blocked by browser - window.open returned null');
      onError?.('Pop-up blocked. Please allow pop-ups for this site.');
      return null;
    }

    console.log('✅ Pop-out window opened, origin:', popoutWindow.location.origin);

    // Write content to the popup window
    // IMPORTANT: We need to write and close the document in the same tick
    try {
      popoutWindow.document.open();
      popoutWindow.document.write(htmlContent);
      popoutWindow.document.close();
      console.log('✅ Content written to pop-out window successfully');
    } catch (writeErr) {
      console.error('❌ Error writing to popup:', writeErr);
      onError?.('Failed to initialize recording studio window');
      return null;
    }
    
    // Monitor popout window and cleanup when it closes
    const cleanupInterval = setInterval(() => {
      if (popoutWindow.closed) {
        clearInterval(cleanupInterval);
        console.log('🧹 Popout window closed - cleanup complete');
        
        // Clear any lingering state
        try {
          localStorage.removeItem('genie_vibe_popout_state');
          localStorage.removeItem('genie_vibe_popout_backup');
          localStorage.removeItem('genie_vibe_popout_heartbeat');
          sessionStorage.removeItem('genie_vibe_popout_state');
        } catch (e) {}
      }
    }, 1000);
    
    onSuccess?.();
    return popoutWindow;
  } catch (err) {
    console.error('❌ Error in openPopoutRecordingStudio:', err);
    options.onError?.('Failed to open recording studio: ' + String(err));
    return null;
  }
}
