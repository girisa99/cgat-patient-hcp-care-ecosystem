/**
 * Popout Recording Studio - Main HTML Generator
 * Composes all modules into a complete HTML document
 */

import type { PopoutConfig } from './types';
import { getPopoutStyles } from './popoutStyles';
import { getPopoutHTML } from './popoutTemplate';
import { getCameraScript } from './popoutCameraScript';
import { getUIScript } from './popoutUIScript';
import {
  getAudioAnalyzerScript, getAudioAnalyzerStyles,
  getAudioTrimmerScript, getAudioTrimmerStyles,
  getAudioExportScript, getAudioExportStyles,
  getTranscriptionScript, getTranscriptionStyles,
  getScriptAudioSyncScript, getScriptAudioSyncStyles,
  getVoiceoverManagerScript, getVoiceoverManagerStyles,
  getEnhancedControlsScript, getEnhancedControlsStyles,
  getAudioPanelScript, getAudioPanelStyles,
  getScriptEnhancementScript, getScriptEnhancementStyles,
  getRecordingEnhancementsScript, getRecordingEnhancementsStyles,
  getTeleprompterEnhancementsScript, getTeleprompterEnhancementsStyles,
  getVoiceProviderSelectionScript, getVoiceProviderSelectionStyles
} from './audio';
import { getBackgroundBlurScript, getBackgroundBlurStyles } from './audio/backgroundBlur';
import { getRecordingLibraryScript, getRecordingLibraryStyles } from './audio/recordingLibrary';

/**
 * Generate the complete HTML for the popout recording studio
 */
export function generatePopoutHTML(config: PopoutConfig): string {
  console.log('[Popout] Generating HTML with config:', {
    scripts: config.scripts.length,
    voiceovers: config.voiceovers.length,
    music: config.music.length
  });

  // Get all styles
  const styles = [
    getPopoutStyles(),
    getAudioAnalyzerStyles(),
    getAudioTrimmerStyles(),
    getAudioExportStyles(),
    getTranscriptionStyles(),
    getScriptAudioSyncStyles(),
    getVoiceoverManagerStyles(),
    getEnhancedControlsStyles(),
    getAudioPanelStyles(),
    getScriptEnhancementStyles(),
    getRecordingEnhancementsStyles(),
    getTeleprompterEnhancementsStyles(),
    getVoiceProviderSelectionStyles(),
    getBackgroundBlurStyles(),
    getRecordingLibraryStyles()
  ].join('\n');

  // Get HTML content
  const htmlContent = getPopoutHTML(config);

  // Get all scripts - order matters for dependencies
  const scripts = [
    // Base modules first
    getAudioAnalyzerScript(),
    getAudioTrimmerScript(),
    getAudioExportScript(),
    getTranscriptionScript(config.supabaseUrl, config.supabaseKey),
    getScriptAudioSyncScript(),
    getVoiceoverManagerScript(),
    getEnhancedControlsScript(),
    getAudioPanelScript(config.supabaseUrl, config.supabaseKey),
    // New enhancement modules
    getScriptEnhancementScript(config.supabaseUrl, config.supabaseKey),
    getRecordingEnhancementsScript(),
    getTeleprompterEnhancementsScript(),
    getVoiceProviderSelectionScript(config.supabaseUrl, config.supabaseKey),
    getBackgroundBlurScript(),
    getRecordingLibraryScript(),
    // UI and Camera last (they use the above)
    getUIScript(),
    getCameraScript()
  ].join('\n\n');

  // Compose the complete HTML document with validation logging
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recording Studio - Pop-out</title>
  <style>
${styles}
  </style>
</head>
<body>
${htmlContent}
  <script>
    // =====================================================
    // MODULAR POPOUT - PHASE 3 VALIDATED
    // =====================================================
    console.log('[Popout] Loading modular components...');
    
${scripts}

    // Validation check
    setTimeout(function() {
      const modules = [
        // Core recording
        { name: 'Recording Enhancements', check: typeof isStopped !== 'undefined' },
        { name: 'Countdown', check: typeof startCountdown === 'function' },
        { name: 'Pause/Resume', check: typeof pauseRecording === 'function' },
        { name: 'Trim Recording', check: typeof trimLastSeconds === 'function' },
        
        // Teleprompter
        { name: 'Teleprompter Enhancements', check: typeof scriptWords !== 'undefined' },
        { name: 'Word Highlighting', check: typeof startWordHighlightingFromAudio === 'function' },
        { name: 'Reading Cursor', check: typeof showReadingCursor === 'function' },
        
        // Audio
        { name: 'Audio Playback', check: typeof startAudioPlayback === 'function' },
        { name: 'Audio Analyzer', check: typeof analyzeAudio === 'function' },
        { name: 'Audio Trimmer', check: typeof initTrimmer === 'function' },
        { name: 'Audio Export', check: typeof exportAudio === 'function' },
        { name: 'Script-Audio Sync', check: typeof initSync === 'function' },
        
        // AI Features
        { name: 'Script Enhancement', check: typeof analyzeScript === 'function' },
        { name: 'Voice Provider Selection', check: typeof selectVoiceProvider === 'function' },
        { name: 'Transcription', check: typeof transcribeAudio === 'function' },
        
        // Visual Effects
        { name: 'Background Blur', check: typeof toggleBackgroundBlur === 'function' },
        { name: 'Enhanced Controls', check: typeof toggleCamera === 'function' },
        
        // Library
        { name: 'Recording Library', check: typeof saveRecordingToLibrary === 'function' },
        { name: 'Library UI', check: typeof updateLibraryUI === 'function' }
      ];
      
      console.log('[Popout] ===== MODULE VALIDATION =====');
      let passedCount = 0;
      let failedModules = [];
      modules.forEach(function(m) {
        const status = m.check ? '✅' : '❌';
        console.log('[Popout] ' + status + ' ' + m.name);
        if (m.check) {
          passedCount++;
        } else {
          failedModules.push(m.name);
        }
      });
      console.log('[Popout] ===== ' + passedCount + '/' + modules.length + ' MODULES LOADED =====');
      if (failedModules.length > 0) {
        console.warn('[Popout] Missing modules:', failedModules.join(', '));
      }
    }, 500);
    
    console.log('[Popout] All modules loaded');
  </script>
</body>
</html>`;

  console.log('[Popout] Generated HTML length:', fullHTML.length);
  return fullHTML;
}
