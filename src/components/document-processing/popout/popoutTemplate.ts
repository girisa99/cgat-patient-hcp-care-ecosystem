/**
 * Popout Recording Studio - HTML Template
 * Main HTML structure for the recording studio with all controls
 */

import type { PopoutConfig } from './types';

export function getPopoutHTML(config: PopoutConfig): string {
  // Generate script options with version label at end
  const scriptOptions = config.scripts.length > 0
    ? config.scripts.map(s => {
        const hasEnhanced = !!(s as any).enhancedContent;
        const hasOriginal = !!(s as any).originalContent || !!(s as any).content;
        // Determine version label based on what's available
        let versionLabel = '';
        if (hasEnhanced && hasOriginal) {
          versionLabel = ' — Enhanced + Original';
        } else if (hasEnhanced) {
          versionLabel = ' — Enhanced';
        } else if (hasOriginal) {
          versionLabel = ' — Original';
        }
        return `<option value="${s.id}" ${s.id === config.selectedScriptId ? 'selected' : ''}>${escapeHtml(s.title)}${versionLabel}</option>`;
      }).join('')
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
    <!-- Debug Panel - Shows initialization status -->
    <div id="debugPanel" style="position:fixed;top:0;left:0;right:0;background:#1a1a2e;color:#0f0;font-family:monospace;font-size:11px;padding:8px;z-index:10000;max-height:150px;overflow-y:auto;border-bottom:2px solid #0f0;">
      <strong>🔧 Debug Panel</strong> (will hide when camera works)
      <div id="debugLog"></div>
    </div>

    <div class="container" style="margin-top:150px;">
      <!-- Header -->
      <header class="header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <h1>🎬 Genie Vibe</h1>
          <span class="header-tagline">Script to Screen</span>
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

            <!-- Countdown Overlay -->
            <div class="countdown-overlay" id="countdownOverlay">
              <div class="countdown-number" id="countdownNumber">5</div>
              <div class="countdown-label">Get Ready...</div>
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
              <div class="reading-cursor" id="readingCursor"></div>
              <!-- Teleprompter Controls -->
              <div id="teleprompterControls" class="teleprompter-controls">
                <button class="teleprompter-control-btn" id="readingCursorToggle">📍 Cursor</button>
                <button class="teleprompter-control-btn" id="speedDownBtn">−</button>
                <span id="scrollSpeedValue">1.0x</span>
                <button class="teleprompter-control-btn" id="speedUpBtn">+</button>
              </div>
              <div class="sync-active-indicator" id="syncActiveIndicator">🔄 Synced</div>
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

          <!-- Record Button & Pause & Library -->
          <div class="record-section">
            <button class="record-btn disabled" id="recordBtn" disabled>
              <span class="icon"></span>
              <span id="recordBtnText">Waiting for camera...</span>
            </button>
            <button class="pause-btn" id="pauseBtn" style="display:none;">
              ⏸️ Pause
            </button>
            <button class="library-btn-toggle" id="libraryBtn">
              📚 Library <span id="libraryCount">0</span>
            </button>
          </div>

          <!-- Audio Controls Bar (shown during recording) - Independent control for each audio source -->
          <div class="audio-controls-bar" id="audioControlsBar" style="display:none;">
            <div class="audio-bar-header">
              <span class="audio-bar-title">🎛️ Audio Mixer</span>
              <span class="audio-bar-subtitle">Control each audio independently while recording</span>
            </div>
            <div class="audio-bar-tracks">
              <!-- Voice/TTS Track -->
              <div class="audio-bar-item" id="voiceTrack">
                <span class="audio-bar-label">🎙️ Voice/TTS</span>
                <div class="audio-bar-controls">
                  <button class="audio-bar-btn play-btn" id="voicePlayPauseBtn" title="Play/Pause Voice">▶</button>
                  <button class="audio-bar-btn stop-btn" id="voiceStopBtn" title="Stop Voice">⏹</button>
                  <input type="range" class="audio-bar-volume" id="voiceBarVolume" min="0" max="100" value="100" title="Voice Volume">
                  <span class="volume-label" id="voiceVolumeLabel">100%</span>
                </div>
                <span class="audio-status" id="voiceStatus">Ready</span>
              </div>
              <!-- Music Track -->
              <div class="audio-bar-item" id="musicTrack">
                <span class="audio-bar-label">🎵 Music</span>
                <div class="audio-bar-controls">
                  <button class="audio-bar-btn play-btn" id="musicPlayPauseBtn" title="Play/Pause Music">▶</button>
                  <button class="audio-bar-btn stop-btn" id="musicBarStopBtn" title="Stop Music">⏹</button>
                  <input type="range" class="audio-bar-volume" id="musicBarVolume" min="0" max="100" value="30" title="Music Volume">
                  <span class="volume-label" id="musicVolumeLabel">30%</span>
                </div>
                <span class="audio-status" id="musicStatus">Ready</span>
              </div>
            </div>
            <div class="audio-bar-options">
              <label class="duck-label" title="Auto-reduce music volume when voice plays">
                <input type="checkbox" id="duckMusicCheckbox" checked> 
                <span>🔉 Auto-duck music when voice plays</span>
              </label>
              <label class="loop-label" title="Loop music continuously">
                <input type="checkbox" id="loopMusicCheckbox" checked>
                <span>🔁 Loop music</span>
              </label>
            </div>
          </div>

          <!-- Trim Controls (shown during recording) -->
          <div class="trim-controls-bar" id="trimControlsBar" style="display:none;">
            <span class="trim-label">Trim Last:</span>
            <button class="trim-amount-btn" data-seconds="3">3s</button>
            <button class="trim-amount-btn active" data-seconds="5">5s</button>
            <button class="trim-amount-btn" data-seconds="10">10s</button>
            <button class="undo-trim-btn" id="undoTrimBtn" disabled>↩️ Undo</button>
            <span class="trim-info" id="trimInfo"></span>
            <div class="trim-feedback" id="trimFeedback"></div>
          </div>

          <!-- Edit Panel (shown when paused) -->
          <div class="edit-panel" id="editPanel" style="display:none;">
            <h4>⏸️ Recording Paused</h4>
            <p>You can trim the last few seconds or resume recording.</p>
            <div class="edit-panel-actions">
              <button class="edit-action-btn" onclick="trimLastSeconds(5)">✂️ Trim 5s</button>
              <button class="edit-action-btn" onclick="trimLastSeconds(10)">✂️ Trim 10s</button>
              <button class="edit-action-btn primary" onclick="resumeRecording()">▶️ Resume</button>
            </div>
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
          <!-- Screen Share Warning (hidden by default) -->
          <div class="sidebar-card screen-share-warning" id="screenShareWarning" style="display:none;">
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">
              <strong>Screen Mirror Effect:</strong><br/>
              Seeing infinite screens? This happens when you share this window.<br/>
              <strong>Fix:</strong> Share a <em>different</em> window or app, not this Recording Studio.
            </div>
          </div>

          <!-- Tip Banner -->
          <div class="sidebar-card tip-banner">
            <div class="tip-icon">💡</div>
            <div class="tip-text">
              <strong>Quick Start:</strong><br/>
              1. Select a <strong>script</strong> for the teleprompter<br/>
              2. Go to <strong>TTS tab</strong> → Generate TTS audio, OR select a <strong>Voiceover</strong><br/>
              3. Optionally add background music<br/>
              4. Click <strong>Start Recording</strong> → audio plays automatically!
            </div>
          </div>

          <!-- Script Selection -->
          <div class="sidebar-card">
            <h3>📝 Script</h3>
            <select class="custom-select" id="scriptSelect">
              <option value="">Select script for teleprompter...</option>
              ${scriptOptions}
            </select>
            <!-- Script Version Toggle -->
            <div class="script-version-toggle" id="scriptVersionToggle" style="display:none;">
              <button class="version-btn active" data-version="original" id="versionOriginalBtn">Original</button>
              <button class="version-btn" data-version="enhanced" id="versionEnhancedBtn">Enhanced</button>
              <button class="version-btn" data-version="clean" id="versionCleanBtn">Clean (TTS)</button>
            </div>
            <div id="analysisStatus"></div>
          </div>

          <!-- Analysis Panel (hidden by default) -->
          <div class="sidebar-card analysis-panel" id="analysisPanel" style="display:none;">
            <h3>✨ Script Enhancement</h3>
            <div id="changeCounts"></div>
            <div id="analysisResults"></div>
          </div>

          <!-- Enhanced Downloads Section (hidden by default) -->
          <div class="sidebar-card enhanced-downloads" id="enhancedDownloadsSection" style="display:none;">
            <h3>📥 Enhanced Downloads</h3>
            
            <!-- Voice Provider Toggle -->
            <div class="provider-toggle">
              <button class="provider-btn active" data-provider="openai">
                <span class="provider-name">OpenAI</span>
                <span class="provider-desc">High quality TTS</span>
              </button>
              <button class="provider-btn" data-provider="elevenlabs">
                <span class="provider-name">ElevenLabs</span>
                <span class="provider-desc">Natural voices</span>
              </button>
            </div>

            <!-- Voice Select -->
            <select class="custom-select" id="enhancedVoiceSelect">
              <option value="alloy">Alloy - Neutral, balanced</option>
              <option value="echo">Echo - Male, warm</option>
              <option value="fable">Fable - British, storyteller</option>
              <option value="onyx">Onyx - Deep male</option>
              <option value="nova">Nova - Female, energetic</option>
              <option value="shimmer">Shimmer - Soft female</option>
            </select>

            <!-- Generate Button -->
            <button class="generate-enhanced-btn" id="generateEnhancedAudioBtn">
              🔊 Generate Audio
            </button>
            <div id="voiceGenStatus"></div>

            <!-- Download Buttons (hidden until generated) -->
            <div class="enhanced-download-btns" id="enhancedDownloadBtns" style="display:none;">
              <button class="download-btn" id="previewEnhancedBtn">▶️ Preview</button>
              <button class="download-btn" id="stopPreviewBtn">⏹️ Stop</button>
              <button class="download-btn primary" id="downloadMp3Btn">📥 MP3</button>
              <button class="download-btn" id="downloadWavBtn">📥 WAV</button>
            </div>

            <!-- Download Enhanced Script -->
            <button class="download-script-btn" id="downloadEnhancedBtn">
              📝 Download Enhanced Script
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

          <!-- Studio Sound Panel -->
          <div class="sidebar-card studio-sound-card">
            <div class="studio-sound-header">
              <h3>🎙️ Studio Sound</h3>
              <div class="studio-sound-toggle">
                <div class="toggle-switch" id="studioSoundToggle">
                  <div class="toggle-switch-thumb"></div>
                </div>
                <span class="toggle-label" id="studioSoundLabel">OFF</span>
              </div>
            </div>
            
            <div id="studioSoundOptions" style="display:none;">
              <div class="audio-preset-section">
                <label class="preset-label">Audio Preset</label>
                <select class="custom-select" id="audioPresetSelect">
                  <option value="podcast">🎙️ Podcast - Warm, clear voice</option>
                  <option value="interview">🎤 Interview - Natural conversation</option>
                  <option value="narration">📖 Narration - Rich, immersive</option>
                  <option value="webcast">💻 Webcast - Balanced for screen</option>
                </select>
              </div>
              
              <div class="audio-effects-toggles">
                <div class="effect-toggle">
                  <label>Compressor</label>
                  <div class="mini-toggle" id="compressorToggle"></div>
                </div>
                <div class="effect-toggle">
                  <label>EQ</label>
                  <div class="mini-toggle on" id="eqToggle"></div>
                </div>
                <div class="effect-toggle">
                  <label>Noise Gate</label>
                  <div class="mini-toggle on" id="noiseGateToggle"></div>
                </div>
                <div class="effect-toggle">
                  <label>Limiter</label>
                  <div class="mini-toggle" id="limiterToggle"></div>
                </div>
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

    <!-- Audio Options Dialog -->
    <div class="audio-options-dialog" id="audioOptionsDialog">
      <div class="dialog-content">
        <h3>🎵 Audio Options</h3>
        <p>Select audio to play during recording:</p>
        <div class="audio-option-row">
          <label>
            <input type="checkbox" id="playVoiceoverOption" checked>
            Play Voiceover
          </label>
        </div>
        <div class="audio-option-row">
          <label>
            <input type="checkbox" id="playMusicOption" checked>
            Play Background Music
          </label>
        </div>
        <div class="audio-option-row">
          <label>
            <input type="checkbox" id="syncTeleprompterOption" checked>
            Sync Teleprompter with Audio
          </label>
        </div>
        <div class="dialog-actions">
          <button class="dialog-btn secondary" id="cancelOptionsBtn">Cancel</button>
          <button class="dialog-btn primary" id="confirmOptionsBtn">Start Recording</button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="assignment-toast" id="assignmentToast"></div>
    <div class="enhancement-toast" id="enhancementToast"></div>
    <div class="voice-provider-toast" id="voiceProviderToast"></div>
    <div class="library-toast" id="libraryToast"></div>

    <!-- Recording Library Panel -->
    <div class="library-panel" id="libraryPanel">
      <div class="library-header">
        <div>
          <h3>📚 Recording Library</h3>
          <span class="library-count" id="libraryCount">0 recordings</span>
        </div>
        <button class="close-library-btn" id="closeLibraryBtn">✕</button>
      </div>
      <div class="library-list" id="libraryList">
        <div class="library-empty">No recordings yet</div>
      </div>
    </div>

    <!-- Library Preview Container -->
    <div id="libraryPreviewContainer"></div>

    <!-- Hidden Data -->
    <script id="scriptsData" type="application/json">\${scriptsJson}</script>
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
