/**
 * Popout Recording Studio - HTML Template
 * Main HTML structure for the recording studio
 */

import type { PopoutConfig } from './types';

export function getPopoutHTML(config: PopoutConfig): string {
  // Generate script options
  const scriptOptions = config.scripts.length > 0
    ? config.scripts.map(s => 
        `<option value="${s.id}" ${s.id === config.selectedScriptId ? 'selected' : ''}>${escapeHtml(s.title)}</option>`
      ).join('')
    : '';

  // Generate voiceover options
  const voiceoverOptions = config.voiceovers.length > 0
    ? config.voiceovers.map(v => 
        `<option value="${v.id}" data-url="${escapeHtml(v.url)}" ${v.id === config.selectedVoiceoverId ? 'selected' : ''}>${escapeHtml(v.name)}</option>`
      ).join('')
    : '';

  // Generate music options
  const musicOptions = config.music.length > 0
    ? config.music.map(m => 
        `<option value="${m.id}" data-url="${escapeHtml(m.url)}" ${m.id === config.selectedMusicId ? 'selected' : ''}>${escapeHtml(m.name)}</option>`
      ).join('')
    : '';

  // Scripts data for teleprompter
  const scriptsJson = JSON.stringify(config.scripts);

  return `
    <div class="container">
      <!-- Header -->
      <header class="header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <h1>🎬 Recording Studio</h1>
          <span class="header-badge">Pop-out Mode</span>
        </div>
        <button class="close-btn" id="closeBtn">✕ Close</button>
      </header>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Video Section -->
        <div class="video-section">
          <!-- Video Container -->
          <div class="video-container">
            <video id="videoPreview" autoplay muted playsinline></video>
            
            <!-- Loading Overlay -->
            <div class="video-overlay" id="loadingOverlay">
              <div class="spinner"></div>
              <span id="loadingText">Checking camera permissions...</span>
            </div>

            <!-- Recording Indicator -->
            <div class="recording-indicator" id="recordingIndicator">
              <span class="dot"></span>
              <span>REC</span>
              <span id="recordingTime">00:00</span>
            </div>

            <!-- Teleprompter -->
            <div class="teleprompter" id="teleprompter">
              <div class="teleprompter-text" id="teleprompterText"></div>
            </div>

            <!-- Logo Overlay -->
            <div class="logo-overlay" id="logoOverlay">
              <img id="logoImage" src="" alt="Logo">
            </div>
          </div>

          <!-- Video Controls -->
          <div class="video-controls">
            <button class="control-btn toggle-on" id="teleprompterBtn">
              📜 Teleprompter: ON
            </button>
            <button class="control-btn toggle-off" id="blurBtn">
              🔵 BG Blur: OFF
            </button>
            <button class="control-btn toggle-off" id="logoBtn">
              🖼️ Logo: OFF
            </button>
          </div>

          <!-- Record Button -->
          <div class="record-section">
            <button class="record-btn disabled" id="recordBtn" disabled>
              <span class="icon"></span>
              <span id="recordBtnText">Waiting for camera...</span>
            </button>
          </div>

          <!-- Status Messages -->
          <div id="statusContainer"></div>
        </div>

        <!-- Sidebar -->
        <aside class="sidebar">
          <!-- Script Selection -->
          <div class="sidebar-card">
            <h3>📝 Script</h3>
            <select class="custom-select" id="scriptSelect">
              <option value="">None</option>
              ${scriptOptions}
            </select>
          </div>

          <!-- Voiceover Selection -->
          <div class="sidebar-card">
            <h3>🎙️ Voiceover</h3>
            <select class="custom-select" id="voiceoverSelect">
              <option value="">None</option>
              ${voiceoverOptions}
            </select>
            <div class="audio-controls">
              <button class="audio-btn" id="voiceoverPlayBtn" disabled>▶ Play</button>
              <button class="audio-btn" id="voiceoverStopBtn" disabled>⏹ Stop</button>
            </div>
            <div class="volume-control">
              <label>Vol:</label>
              <input type="range" class="volume-slider" id="voiceoverVolume" min="0" max="100" value="100">
            </div>
          </div>

          <!-- Music Selection -->
          <div class="sidebar-card">
            <h3>🎵 Background Music</h3>
            <select class="custom-select" id="musicSelect">
              <option value="">None</option>
              ${musicOptions}
            </select>
            <div class="audio-controls">
              <button class="audio-btn" id="musicPlayBtn" disabled>▶ Play</button>
              <button class="audio-btn" id="musicStopBtn" disabled>⏹ Stop</button>
            </div>
            <div class="volume-control">
              <label>Vol:</label>
              <input type="range" class="volume-slider" id="musicVolume" min="0" max="100" value="50">
            </div>
          </div>

          <!-- Info Card -->
          <div class="info-card">
            <h4>ℹ️ Pop-out Info</h4>
            <p>This window is separate from the main app. When sharing your screen, only this window will be captured.</p>
          </div>
        </aside>
      </div>
    </div>

    <!-- Hidden Data -->
    <script id="scriptsData" type="application/json">${scriptsJson}</script>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
