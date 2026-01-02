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
  getAudioPanelScript, getAudioPanelStyles
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
    getAudioPanelStyles()
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
    // UI and Camera last (they use the above)
    getUIScript(),
    getCameraScript()
  ].join('\n\n');

  // Compose the complete HTML document
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
${scripts}
    console.log('[Popout] All modules loaded');
  </script>
</body>
</html>`;

  console.log('[Popout] Generated HTML length:', fullHTML.length);
  return fullHTML;
}
