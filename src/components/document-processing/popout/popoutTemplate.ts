/**
 * Popout Recording Studio - HTML Template
 * Main HTML structure for the recording studio with all controls
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

            <!-- Logo Overlay (Draggable) -->
            <div class="logo-overlay" id="logoOverlay">
              <img id="logoImage" src="" alt="Logo">
            </div>
          </div>

          <!-- Video Controls Row 1: Camera & Mic -->
          <div class="video-controls">
            <button class="control-btn toggle-on" id="cameraToggleBtn">
              📹 Camera: ON
            </button>
            <button class="control-btn toggle-on" id="micToggleBtn">
              🎤 Mic: ON
            </button>
            <button class="control-btn toggle-on" id="teleprompterBtn">
              📜 Teleprompter: ON
            </button>
          </div>

          <!-- Video Controls Row 2: Effects -->
          <div class="video-controls">
            <button class="control-btn toggle-off" id="blurBtn">
              🔵 BG Blur: OFF
            </button>
            <button class="control-btn toggle-off" id="logoBtn">
              🖼️ Logo: OFF
            </button>
            <button class="control-btn-upload" id="logoUploadBtn">
              📤 Upload Logo
            </button>
            <input type="file" id="logoUploadInput" accept="image/*" style="display:none;">
          </div>

          <!-- Logo Position Controls (shown when logo enabled) -->
          <div class="logo-position-controls" id="logoPositionControls" style="display:none;">
            <span class="control-label">Position:</span>
            <button class="control-btn-small" data-logo-position="top-left">↖ TL</button>
            <button class="control-btn-small" data-logo-position="top-right">↗ TR</button>
            <button class="control-btn-small" data-logo-position="bottom-left">↙ BL</button>
            <button class="control-btn-small" data-logo-position="bottom-right">↘ BR</button>
            <span class="control-label">Size:</span>
            <button class="control-btn-small" data-logo-size="small">S</button>
            <button class="control-btn-small active" data-logo-size="medium">M</button>
            <button class="control-btn-small" data-logo-size="large">L</button>
          </div>

          <!-- Record Button -->
          <div class="record-section">
            <button class="record-btn disabled" id="recordBtn" disabled>
              <span class="icon"></span>
              <span id="recordBtnText">Waiting for camera...</span>
            </button>
          </div>

          <!-- Sync Progress -->
          <div class="sync-section" id="syncSection" style="display:none;">
            <div class="sync-progress-container">
              <div id="syncProgress"></div>
            </div>
            <div id="syncTime">00:00 / 00:00</div>
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
            <button class="assign-btn" id="assignVoiceoverBtn" style="margin-top:8px;">
              🔗 Assign Voiceover
            </button>
          </div>

          <!-- Audio Panel with Tabs -->
          <div class="sidebar-card audio-panel">
            <div class="audio-tabs">
              <button class="audio-tab-btn active" data-tab="voiceover">🎙️ Voiceover</button>
              <button class="audio-tab-btn" data-tab="tts">🔊 TTS</button>
              <button class="audio-tab-btn" data-tab="music">🎵 Music</button>
            </div>

            <!-- Voiceover Tab -->
            <div class="audio-tab-content active" id="audioTab-voiceover">
              <select class="custom-select" id="voiceoverSelect">
                <option value="">None</option>
                ${voiceoverOptions}
              </select>
              <canvas class="panel-waveform" id="voiceoverWaveform" width="280" height="40"></canvas>
              <div id="voiceoverWaveformInfo"></div>
              <div class="audio-controls">
                <button class="audio-btn" id="voiceoverPlayBtn" disabled>▶ Play</button>
                <button class="audio-btn" id="voiceoverStopBtn" disabled>⏹ Stop</button>
              </div>
              <div class="volume-control">
                <label>Vol:</label>
                <input type="range" class="volume-slider" id="voiceoverVolume" min="0" max="100" value="100">
              </div>
              <div class="audio-controls" style="margin-top:8px;">
                <button class="audio-btn" id="transcribeBtn">🎤 Transcribe</button>
                <button class="audio-btn" id="trimVoiceoverBtn">✂️ Trim</button>
              </div>
              <div id="transcriptionStatus"></div>
              <div class="transcription-result" id="transcriptionResult"></div>
            </div>

            <!-- TTS Tab -->
            <div class="audio-tab-content" id="audioTab-tts">
              <div class="tts-panel">
                <button class="audio-btn" id="useScriptForTTS" style="margin-bottom:8px;">
                  📝 Use Current Script
                </button>
                <textarea class="tts-text-input" id="ttsTextInput" placeholder="Enter text to convert to speech..."></textarea>
                <select class="tts-voice-select" id="ttsVoiceSelect">
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo">Echo (Male)</option>
                  <option value="fable">Fable (British)</option>
                  <option value="onyx">Onyx (Deep Male)</option>
                  <option value="nova">Nova (Female)</option>
                  <option value="shimmer">Shimmer (Soft Female)</option>
                </select>
                <div class="tts-controls">
                  <button class="tts-generate-btn" id="ttsGenerateBtn">🔊 Generate TTS</button>
                  <button class="tts-play-btn" id="ttsPlayBtn" disabled>▶</button>
                  <button class="tts-stop-btn" id="ttsStopBtn" disabled>⏹</button>
                </div>
                <div class="volume-control">
                  <label>Vol:</label>
                  <input type="range" class="volume-slider" id="ttsVolume" min="0" max="100" value="100">
                </div>
                <div class="tts-status" id="ttsStatus"></div>
              </div>
            </div>

            <!-- Music Tab -->
            <div class="audio-tab-content" id="audioTab-music">
              <select class="custom-select" id="musicSelect">
                <option value="">None</option>
                ${musicOptions}
              </select>
              <canvas class="panel-waveform" id="musicWaveform" width="280" height="40"></canvas>
              <div id="musicWaveformInfo"></div>
              <div class="audio-controls">
                <button class="audio-btn" id="musicPlayBtn" disabled>▶ Play</button>
                <button class="audio-btn" id="musicStopBtn" disabled>⏹ Stop</button>
                <button class="audio-btn" id="musicLoopBtn">🔁 Loop: ON</button>
              </div>
              <div class="volume-control">
                <label>Vol:</label>
                <input type="range" class="volume-slider" id="musicVolume" min="0" max="100" value="50">
              </div>
            </div>
          </div>

          <!-- Trim Panel (hidden by default) -->
          <div class="sidebar-card" id="trimPanel" style="display:none;">
            <h3>✂️ Trim Audio</h3>
            <canvas class="waveform-canvas" id="trimWaveform" width="280" height="60"></canvas>
            <div class="trim-controls">
              <div class="trim-slider-container">
                <label>Start:</label>
                <input type="range" class="trim-slider" id="trimStartSlider" min="0" max="100" value="0">
                <span id="trimStartTime">00:00</span>
              </div>
              <div class="trim-slider-container">
                <label>End:</label>
                <input type="range" class="trim-slider" id="trimEndSlider" min="0" max="100" value="100">
                <span id="trimEndTime">00:00</span>
              </div>
              <div class="trim-info">
                <span>Duration: <span id="trimmedDuration">00:00</span></span>
              </div>
              <div class="trim-actions">
                <button class="trim-btn" id="previewTrimBtn">▶ Preview</button>
                <button class="trim-btn" id="applyTrimBtn">✓ Apply</button>
              </div>
            </div>
          </div>

          <!-- Voiceover Assignments -->
          <div class="sidebar-card">
            <h3>🔗 Assignments</h3>
            <div class="assignments-list" id="assignmentsList">
              <div class="no-assignments">No voiceover assignments</div>
            </div>
          </div>

          <!-- Sync Controls -->
          <div class="sidebar-card">
            <h3>🔄 Sync Playback</h3>
            <div class="sync-controls">
              <button class="sync-btn sync-btn-play" id="syncPlayBtn">▶ Play Synced</button>
              <button class="sync-btn sync-btn-stop" id="syncStopBtn">⏹ Stop</button>
            </div>
            <div class="sync-info">
              <span id="syncSegmentCount">0 segments</span>
              <span id="syncDuration">00:00</span>
            </div>
          </div>

          <!-- Export Panel -->
          <div class="sidebar-card export-panel">
            <h3>📥 Export</h3>
            <div class="export-options">
              <div class="export-option">
                <label>Normalize:</label>
                <input type="checkbox" id="exportNormalize">
              </div>
              <div class="export-option">
                <label>Fade In (s):</label>
                <input type="number" id="exportFadeIn" value="0" min="0" max="5" step="0.5">
              </div>
              <div class="export-option">
                <label>Fade Out (s):</label>
                <input type="number" id="exportFadeOut" value="0" min="0" max="5" step="0.5">
              </div>
            </div>
            <div class="format-select">
              <button class="format-btn active" data-format="wav">WAV</button>
              <button class="format-btn" data-format="mp3">MP3</button>
            </div>
            <button class="export-btn-primary" id="exportAudioBtn">
              📥 Download Audio
            </button>
            <button class="audio-btn" id="exportScriptBtn" style="width:100%;margin-top:8px;">
              📝 Download Script
            </button>
          </div>

          <!-- Info Card -->
          <div class="info-card">
            <h4>ℹ️ Pop-out Info</h4>
            <p>This window is separate from the main app. Drag the logo to reposition it. When sharing your screen, only this window will be captured.</p>
          </div>
        </aside>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="assignment-toast" id="assignmentToast"></div>

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
