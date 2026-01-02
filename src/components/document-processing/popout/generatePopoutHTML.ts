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

  // Shared global variables declaration (must come first)
  const sharedGlobals = `
    // =====================================================
    // SHARED GLOBAL VARIABLES
    // =====================================================
    // These are declared first so all modules can access them
    var mediaStream = null;
    var mediaRecorder = null;
    var recordedChunks = [];
    var isRecording = false;
    var recordingStartTime = null;
    var recordingTimer = null;
    var isStopped = false;
    var isPaused = false;
    var trimHistory = [];
    var logoEnabled = false;
    
    // Audio references (shared across modules)
    var voiceoverAudio = null;
    var musicAudio = null;
    var ttsAudio = null;
    var syncAudioSource = null;
    var syncAnimationFrame = null;
    
    // Shared showStatus function
    function showStatus(message, type) {
      var container = document.getElementById('statusContainer');
      if (container) {
        container.innerHTML = '<div class="status-message ' + type + '">' + message + '</div>';
        if (type === 'success') {
          setTimeout(function() { container.innerHTML = ''; }, 5000);
        }
      } else {
        console.log('[Status] ' + type + ': ' + message);
      }
    }
    
    console.log('[Popout] Shared globals initialized');
  `;

  // Get all scripts - order matters for dependencies
  const scripts = [
    // Shared globals first
    sharedGlobals,
    // Base modules
    getAudioAnalyzerScript(),
    getAudioTrimmerScript(),
    getAudioExportScript(),
    getTranscriptionScript(config.supabaseUrl, config.supabaseKey),
    getScriptAudioSyncScript(),
    getVoiceoverManagerScript(),
    getAudioPanelScript(config.supabaseUrl, config.supabaseKey),
    // Enhancement modules
    getScriptEnhancementScript(config.supabaseUrl, config.supabaseKey),
    getRecordingEnhancementsScript(),
    getTeleprompterEnhancementsScript(),
    getVoiceProviderSelectionScript(config.supabaseUrl, config.supabaseKey),
    getBackgroundBlurScript(),
    getRecordingLibraryScript(),
    // Camera BEFORE enhanced controls (so mediaStream is available)
    getCameraScript(),
    // Enhanced controls after camera (needs mediaStream)
    getEnhancedControlsScript(),
    // UI last (uses everything)
    getUIScript()
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
    // MODULAR POPOUT - FULLY VALIDATED
    // =====================================================
    console.log('[Popout] Starting modular components load...');
    
    try {
${scripts}
    } catch (err) {
      console.error('[Popout] FATAL: Script loading error:', err);
      document.body.innerHTML = '<div style="padding:20px;color:red;font-family:sans-serif;">' +
        '<h1>Loading Error</h1>' +
        '<p>' + err.message + '</p>' +
        '<pre>' + err.stack + '</pre>' +
      '</div>';
    }

    // Validation check
    setTimeout(function() {
      console.log('[Popout] ===== INITIALIZATION VALIDATION =====');
      
      // Check critical elements exist
      var criticalElements = [
        'videoPreview', 'recordBtn', 'scriptSelect', 
        'voiceoverSelect', 'musicSelect', 'cameraToggleBtn',
        'micToggleBtn', 'blurBtn', 'teleprompterBtn'
      ];
      
      var missingElements = [];
      criticalElements.forEach(function(id) {
        if (!document.getElementById(id)) {
          missingElements.push(id);
        }
      });
      
      if (missingElements.length > 0) {
        console.error('[Popout] Missing critical elements:', missingElements.join(', '));
      } else {
        console.log('[Popout] ✅ All critical elements found');
      }
      
      // Check critical functions
      var modules = [
        { name: 'Camera Init', check: typeof mediaStream !== 'undefined' },
        { name: 'Recording Enhancements', check: typeof startCountdown === 'function' },
        { name: 'Pause/Resume', check: typeof pauseRecording === 'function' },
        { name: 'Audio Playback', check: typeof startAudioPlayback === 'function' },
        { name: 'Stop All Audio', check: typeof stopAllAudio === 'function' },
        { name: 'Camera Toggle', check: typeof toggleCamera === 'function' },
        { name: 'Mic Toggle', check: typeof toggleMicrophone === 'function' },
        { name: 'Background Blur', check: typeof toggleBackgroundBlur === 'function' },
        { name: 'Recording Library', check: typeof saveRecordingToLibrary === 'function' },
        { name: 'Library UI', check: typeof updateLibraryUI === 'function' }
      ];
      
      var passedCount = 0;
      var failedModules = [];
      modules.forEach(function(m) {
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
      
      // Verify camera is working
      if (typeof mediaStream !== 'undefined' && mediaStream) {
        console.log('[Popout] ✅ Camera stream active');
      } else {
        console.log('[Popout] ⏳ Camera initializing (or permission pending)...');
      }
      
    }, 1000);
    
    console.log('[Popout] All modules loaded');
  </script>
</body>
</html>`;

  console.log('[Popout] Generated HTML length:', fullHTML.length);
  return fullHTML;
}
