/**
 * Popout Recording Studio - Main HTML Generator
 * Composes all modules into a complete HTML document
 */

import type { PopoutConfig } from './types';
import { getPopoutStyles } from './popoutStyles';
import { getPopoutHTML } from './popoutTemplate';
import { getCameraScript } from './popoutCameraScript';
import { getUIScript } from './popoutUIScript';

/**
 * Generate the complete HTML for the popout recording studio
 */
export function generatePopoutHTML(config: PopoutConfig): string {
  console.log('[Popout] Generating HTML with config:', {
    scripts: config.scripts.length,
    voiceovers: config.voiceovers.length,
    music: config.music.length
  });

  // Get all module parts
  const styles = getPopoutStyles();
  const htmlContent = getPopoutHTML(config);
  const cameraScript = getCameraScript();
  const uiScript = getUIScript();

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
    // UI Script must load first
${uiScript}

    // Camera Script loads second (depends on UI functions)
${cameraScript}

    console.log('[Popout] All modules loaded');
  </script>
</body>
</html>`;

  console.log('[Popout] Generated HTML length:', fullHTML.length);
  
  return fullHTML;
}
