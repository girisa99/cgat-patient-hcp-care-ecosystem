/**
 * Popout Genie Vibe - Main HTML Generator
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
    // DEBUG LOGGING FUNCTION (writes to visible panel)
    // =====================================================
    function debugLog(msg) {
      console.log(msg);
      var panel = document.getElementById('debugLog');
      if (panel) {
        var time = new Date().toLocaleTimeString();
        panel.innerHTML += '<div>[' + time + '] ' + msg + '</div>';
        panel.scrollTop = panel.scrollHeight;
      }
    }
    
    function hideDebugPanel() {
      var panel = document.getElementById('debugPanel');
      if (panel) {
        panel.style.display = 'none';
        // Also remove the margin from container
        var container = document.querySelector('.container');
        if (container) container.style.marginTop = '0';
      }
    }
    
    debugLog('🚀 Script execution started');
    debugLog('📍 Location: ' + window.location.href);
    debugLog('📍 Origin: ' + window.location.origin);
    debugLog('🔧 mediaDevices available: ' + !!navigator.mediaDevices);
    if (navigator.mediaDevices) {
      debugLog('🔧 getUserMedia available: ' + !!navigator.mediaDevices.getUserMedia);
    }
    
    // =====================================================
    // SHARED GLOBAL VARIABLES
    // =====================================================
    debugLog('Initializing shared globals...');
    
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
      }
      debugLog('[Status] ' + type + ': ' + message);
    }
    
    debugLog('✅ Shared globals initialized');
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
  <title>Genie Vibe - Pop-out</title>
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
    console.log('[Popout] Script tag executing...');
    console.log('[Popout] Document readyState:', document.readyState);
    console.log('[Popout] Location origin:', window.location.origin);
    console.log('[Popout] Location href:', window.location.href);
    
    // Check if we have access to mediaDevices
    console.log('[Popout] navigator.mediaDevices available:', !!navigator.mediaDevices);
    if (navigator.mediaDevices) {
      console.log('[Popout] getUserMedia available:', !!navigator.mediaDevices.getUserMedia);
    }
    
    // Wrap everything to ensure DOM is ready
    function initializePopout() {
      console.log('[Popout] initializePopout called, readyState:', document.readyState);
      
      // Double-check video element exists
      var videoCheck = document.getElementById('videoPreview');
      console.log('[Popout] Video element exists:', !!videoCheck);
      
      try {
${scripts}
      } catch (err) {
        console.error('[Popout] FATAL: Script loading error:', err);
        var errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'padding:20px;color:red;font-family:sans-serif;position:fixed;top:0;left:0;right:0;background:white;z-index:9999;';
        errorDiv.innerHTML = '<h1>Loading Error</h1><p>' + err.message + '</p><pre>' + err.stack + '</pre>';
        document.body.insertBefore(errorDiv, document.body.firstChild);
      }
    }
    
    // Always wait for window.onload with document.write content
    // This ensures the full document is parsed
    window.onload = function() {
      console.log('[Popout] window.onload fired');
      initializePopout();
    };
    
    // Fallback: if onload doesn't fire within 2 seconds, try anyway
    setTimeout(function() {
      if (!window._popoutInitialized) {
        console.log('[Popout] Fallback initialization after timeout');
        initializePopout();
        window._popoutInitialized = true;
      }
    }, 2000);

    // Validation check - runs after a delay to check everything initialized
    setTimeout(function() {
      console.log('[Popout] ===== INITIALIZATION VALIDATION (3s) =====');
      
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
        if (typeof showStatus === 'function') {
          showStatus('Missing elements: ' + missingElements.join(', '), 'error');
        }
      } else {
        console.log('[Popout] ✅ All critical elements found');
      }
      
      // Check critical functions/variables
      console.log('[Popout] Checking functions/variables...');
      console.log('[Popout] mediaStream defined:', typeof mediaStream !== 'undefined');
      console.log('[Popout] mediaStream value:', mediaStream);
      console.log('[Popout] initCamera:', typeof initCamera);
      console.log('[Popout] toggleCamera:', typeof toggleCamera);
      console.log('[Popout] showStatus:', typeof showStatus);
      
      // Check camera status
      if (typeof mediaStream !== 'undefined') {
        if (mediaStream) {
          console.log('[Popout] ✅ Camera stream is ACTIVE');
          console.log('[Popout] Video tracks:', mediaStream.getVideoTracks().length);
          console.log('[Popout] Audio tracks:', mediaStream.getAudioTracks().length);
        } else {
          console.log('[Popout] ⚠️ mediaStream is null - camera may have failed or permission denied');
          if (typeof showStatus === 'function') {
            showStatus('Camera not initialized - check browser permissions', 'error');
          }
        }
      } else {
        console.error('[Popout] ❌ mediaStream variable not defined!');
      }
      
    }, 3000);
    
    console.log('[Popout] Script tag complete, waiting for onload...');
  </script>
</body>
</html>`;

  console.log('[Popout] Generated HTML length:', fullHTML.length);
  return fullHTML;
}
