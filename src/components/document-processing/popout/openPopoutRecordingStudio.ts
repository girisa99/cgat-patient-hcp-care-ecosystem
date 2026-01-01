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

    // Prepare data for the pop-out
    const scriptsData: PopoutScriptData[] = availableScripts.map(s => ({
      id: s.id,
      title: s.title,
      content: s.content
    }));

    const voiceoversData: PopoutVoiceoverData[] = voiceoverFiles.map(a => ({
      id: a.id,
      name: a.name,
      url: a.url,
      scriptText: (a.metadata?.scriptText as string) || null,
      scriptType: (a.metadata?.scriptType as string) || null
    }));

    const musicData: PopoutMusicData[] = musicFiles.map(m => ({
      id: m.id,
      name: m.name,
      url: m.url
    }));

    const config: PopoutConfig = {
      scripts: scriptsData,
      voiceovers: voiceoversData,
      music: musicData,
      selectedScriptId: selectedScript?.id || '',
      selectedVoiceoverId: selectedAudioFile?.id || '',
      selectedMusicId: selectedBackgroundMusic?.id || '',
      supabaseUrl,
      supabaseKey,
    };

    // Generate HTML content BEFORE opening window
    console.log('🎬 Generating HTML content...');
    const htmlContent = generatePopoutHTML(config);
    console.log('📝 Generated HTML length:', htmlContent.length);

    // Open empty window first (less likely to be blocked by popup blockers)
    console.log('🪟 Opening popup window...');
    const popoutWindow = window.open(
      'about:blank',
      'recording-studio',
      'width=1400,height=900,left=100,top=50,toolbar=no,menubar=no,scrollbars=no,resizable=yes'
    );

    if (!popoutWindow) {
      console.error('❌ Pop-up blocked by browser - window.open returned null');
      onError?.('Pop-up blocked. Please allow pop-ups for this site.');
      return null;
    }

    console.log('✅ Pop-out window opened successfully');

    // Write content to the popup window
    console.log('📝 Writing content to popup...');
    popoutWindow.document.open();
    popoutWindow.document.write(htmlContent);
    popoutWindow.document.close();
    console.log('✅ Content written to pop-out window successfully');
    
    onSuccess?.();
    return popoutWindow;
  } catch (err) {
    console.error('❌ Error in openPopoutRecordingStudio:', err);
    options.onError?.('Failed to open recording studio: ' + String(err));
    return null;
  }
}
