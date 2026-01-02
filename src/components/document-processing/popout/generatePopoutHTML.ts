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
    getVoiceProviderSelectionStyles()
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
        { name: 'Recording Enhancements', check: typeof isStopped !== 'undefined' },
        { name: 'Teleprompter Enhancements', check: typeof scriptWords !== 'undefined' },
        { name: 'Script Enhancement', check: typeof analyzeScript === 'function' },
        { name: 'Voice Provider Selection', check: typeof selectVoiceProvider === 'function' },
        { name: 'Countdown', check: typeof startCountdown === 'function' },
        { name: 'Audio Playback', check: typeof startAudioPlayback === 'function' },
        { name: 'Word Highlighting', check: typeof startWordHighlightingFromAudio === 'function' }
      ];
      
      console.log('[Popout] ===== MODULE VALIDATION =====');
      let allPassed = true;
      modules.forEach(function(m) {
        const status = m.check ? '✅' : '❌';
        console.log('[Popout] ' + status + ' ' + m.name);
        if (!m.check) allPassed = false;
      });
      console.log('[Popout] ===== ' + (allPassed ? 'ALL MODULES OK' : 'SOME MODULES MISSING') + ' =====');
    }, 500);
    
    console.log('[Popout] All modules loaded');
  </script>
</body>
</html>`;

  console.log('[Popout] Generated HTML length:', fullHTML.length);
  return fullHTML;
}
