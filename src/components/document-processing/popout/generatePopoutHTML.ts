/**
 * Generates the complete HTML content for the pop-out recording studio
 * This is extracted from VideoRecorder to improve maintainability
 */

import type { PopoutConfig } from './types';

/**
 * Safely encode data as base64 to avoid template literal issues
 */
function encodeData(data: unknown): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(data)));
  } catch (e) {
    console.error('Failed to encode data:', e);
    return '';
  }
}

/**
 * Escape HTML special characters for safe embedding
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;')
    .replace(/\$/g, '&#36;')
    .replace(/\\/g, '&#92;')
    .replace(/\n/g, '<br>');
}

/**
 * Generate the CSS styles for the pop-out window
 */
function generateStyles(): string {
  return `
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #fff;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      background: #1a1a2e;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #333;
    }
    .header h1 { font-size: 18px; display: flex; align-items: center; gap: 8px; }
    .header .badge { background: #22c55e; padding: 4px 10px; border-radius: 12px; font-size: 12px; }
    
    .status { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    .status.loading { background: #334155; color: #94a3b8; }
    .status.ready { background: #166534; color: #86efac; }
    .status.recording { background: #991b1b; color: #fca5a5; animation: pulse 1s ease-in-out infinite; }
    .status.countdown { background: #854d0e; color: #fde047; }
    .status.error { background: #7f1d1d; color: #fca5a5; }
    
    .options-bar {
      background: #1a1a2e;
      padding: 12px 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      border-bottom: 1px solid #333;
    }
    .option-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .option-group label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    select {
      background: #2a2a3e;
      border: 1px solid #444;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      min-width: 180px;
      cursor: pointer;
    }
    select:focus { outline: 2px solid #6366f1; outline-offset: 2px; }
    
    .main { flex: 1; display: flex; gap: 10px; padding: 10px; overflow: hidden; }
    .video-section { flex: 2; display: flex; flex-direction: column; gap: 10px; }
    .video-container {
      flex: 1;
      background: #1a1a1a;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }
    video { width: 100%; height: 100%; object-fit: contain; }
    .controls {
      display: flex;
      gap: 10px;
      justify-content: center;
      padding: 15px;
      background: #1a1a2e;
      border-radius: 12px;
    }
    .camera-controls {
      position: absolute;
      bottom: 15px;
      left: 15px;
      display: flex;
      gap: 8px;
      z-index: 20;
    }
    .camera-controls button {
      padding: 8px 12px;
      font-size: 12px;
      background: rgba(0,0,0,0.7);
      border: 1px solid #444;
    }
    .camera-controls button.active { background: #6366f1; border-color: #6366f1; }
    .camera-off-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 15;
    }
    .camera-off-overlay.visible { display: flex; }
    .logo-placeholder {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(99,102,241,0.3);
      overflow: hidden;
    }
    .logo-placeholder img { width: 100%; height: 100%; object-fit: cover; }
    .camera-off-text { font-size: 16px; opacity: 0.7; }
    .upload-logo-btn {
      margin-top: 15px;
      padding: 8px 16px;
      font-size: 12px;
      background: rgba(99,102,241,0.3);
      border: 1px dashed #6366f1;
      cursor: pointer;
    }
    .upload-logo-btn:hover { background: rgba(99,102,241,0.5); }
    .webcam-pip {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 200px;
      height: 112px;
      border-radius: 12px;
      overflow: hidden;
      border: 3px solid #333;
      background: #000;
      z-index: 10;
    }
    .webcam-pip.hidden { display: none; }
    .webcam-pip.blurred video { filter: blur(10px); }
    .webcam-pip video { width: 100%; height: 100%; object-fit: cover; }
    button {
      background: #4a4a6a;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    button:hover { background: #5a5a7a; }
    button.primary { background: #6366f1; }
    button.primary:hover { background: #4f46e5; }
    button.danger { background: #dc2626; }
    button.danger:hover { background: #b91c1c; }
    button.use-script-btn { 
      background: #22c55e; 
      font-size: 12px; 
      padding: 6px 12px; 
      width: 100%;
    }
    button.use-script-btn:hover { background: #16a34a; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .audio-control-panel {
      position: fixed;
      bottom: 120px;
      right: 20px;
      background: rgba(15, 23, 42, 0.95);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
      z-index: 200;
      border: 1px solid #475569;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      min-width: 180px;
      max-width: 240px;
      cursor: default;
      user-select: none;
    }
    .audio-control-panel .drag-handle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0 8px 0;
      border-bottom: 1px solid #334155;
      margin-bottom: 4px;
      cursor: move;
    }
    .audio-control-panel .drag-handle:active { cursor: grabbing; }
    .audio-control-panel .drag-handle-icon {
      font-size: 12px;
      opacity: 0.5;
      letter-spacing: 2px;
    }
    .audio-control-panel .panel-title {
      font-size: 11px;
      font-weight: 600;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .audio-control-panel.minimized {
      padding: 8px 12px;
      min-width: 140px;
    }
    .audio-control-panel.minimized .audio-control-group { display: none; }
    .audio-control-panel.minimized .drag-handle { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .minimized-label { display: none; font-size: 11px; opacity: 0.6; }
    .audio-control-panel.minimized .minimized-label { display: block; }
    .minimize-toggle {
      padding: 4px 8px;
      font-size: 11px;
      background: #334155;
      border: 1px solid #475569;
      cursor: pointer;
      min-width: auto;
      border-radius: 4px;
    }
    .minimize-toggle:hover { background: #475569; }
    .audio-control-group {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      padding: 10px;
      background: rgba(30, 41, 59, 0.6);
      border-radius: 8px;
      border-left: 3px solid #475569;
      transition: all 0.2s ease;
    }
    .audio-control-group.playing { 
      border-left-color: #22c55e; 
      background: rgba(34, 197, 94, 0.1);
    }
    .audio-control-group.paused { 
      border-left-color: #f59e0b; 
      background: rgba(245, 158, 11, 0.1);
    }
    .audio-control-group .track-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .audio-control-group label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      opacity: 0.9;
    }
    .audio-control-group .track-status {
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 10px;
      background: #475569;
      text-transform: uppercase;
    }
    .audio-control-group.playing .track-status {
      background: #22c55e;
      color: #000;
    }
    .audio-control-group.paused .track-status {
      background: #f59e0b;
      color: #000;
    }
    .audio-control-group .controls {
      display: flex;
      gap: 4px;
      justify-content: center;
    }
    .audio-control-group button {
      padding: 6px 10px;
      font-size: 12px;
      min-width: 36px;
      background: #334155;
      border: 1px solid #475569;
    }
    .audio-control-group button:hover {
      background: #475569;
    }
    .audio-control-group .progress {
      width: 100%;
      height: 4px;
      background: #1e293b;
      border-radius: 2px;
      overflow: hidden;
    }
    .audio-control-group .progress-bar {
      height: 100%;
      background: #6366f1;
      width: 0%;
      transition: width 0.1s;
    }
    .audio-control-group.playing .progress-bar { background: #22c55e; }
    .audio-control-group.paused .progress-bar { background: #f59e0b; }
    .audio-control-group.disabled { opacity: 0.5; }
    .audio-control-group.disabled .track-status { background: #334155; }
    .audio-control-group.active { opacity: 1; }
    .audio-control-group.active .track-status { background: #475569; }
    .sidebar { width: 350px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
    .panel {
      background: #1a1a2e;
      border-radius: 12px;
      padding: 15px;
      flex-shrink: 0;
    }
    .panel.teleprompter {
      flex: 1;
      overflow-y: auto;
    }
    .panel h3 { font-size: 14px; margin-bottom: 10px; opacity: 0.8; display: flex; align-items: center; gap: 6px; }
    .script-content {
      font-size: 18px;
      line-height: 2;
      white-space: pre-wrap;
      overflow-y: auto;
    }
    .recording-indicator {
      position: absolute;
      top: 15px;
      left: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0,0,0,0.7);
      padding: 8px 12px;
      border-radius: 8px;
    }
    .rec-dot {
      width: 12px;
      height: 12px;
      background: #dc2626;
      border-radius: 50%;
      animation: pulse 1s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .timer { font-family: monospace; font-size: 16px; }
    input {
      background: #2a2a3e;
      border: 1px solid #444;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      width: 200px;
    }
    input:focus { outline: 2px solid #6366f1; outline-offset: 2px; }
    
    .camera-loading {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #1a1a1a;
      color: white;
    }
    .camera-loading.hidden { display: none; }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #333;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .audio-info {
      margin-top: 10px;
      padding: 10px;
      background: #2a2a3e;
      border-radius: 8px;
      font-size: 13px;
    }
    
    .countdown-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .countdown-overlay.hidden { display: none; }
    .countdown-number {
      font-size: 150px;
      font-weight: bold;
      color: white;
      animation: countPulse 1s ease-in-out infinite;
    }
    .countdown-text { font-size: 24px; color: #888; margin-top: 20px; }
    .countdown-cancel { margin-top: 30px; }
    @keyframes countPulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
}

/**
 * Generate the HTML body content
 */
function generateBody(config: PopoutConfig, escapedScriptContent: string): string {
  const selectedAudioUrl = config.voiceovers.find(v => v.id === config.selectedVoiceoverId)?.url || '';
  const selectedAudioName = config.voiceovers.find(v => v.id === config.selectedVoiceoverId)?.name || '';
  const selectedMusicUrl = config.music.find(m => m.id === config.selectedMusicId)?.url || '';
  const selectedMusicName = config.music.find(m => m.id === config.selectedMusicId)?.name || '';

  return `
    <div class="header">
      <h1>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        Video Recording Studio
        <span class="badge">Pop-out Mode</span>
      </h1>
      <div style="display:flex;align-items:center;gap:15px;">
        <div id="status" class="status loading">Initializing Camera...</div>
        <button id="closeBtn" class="danger" style="padding:8px 16px;font-size:13px;">
          ✕ Close
        </button>
      </div>
    </div>
    
    <div class="options-bar">
      <div class="option-group">
        <label for="scriptSelect">📄 Script (${config.scripts.length} available)</label>
        <select id="scriptSelect" name="scriptSelect">
          <option value="">None</option>
        </select>
      </div>
      <div class="option-group">
        <label for="voiceoverSelect">🎤 Voiceover (${config.voiceovers.length} available)</label>
        <select id="voiceoverSelect" name="voiceoverSelect">
          <option value="">None</option>
        </select>
      </div>
      <div class="option-group">
        <label for="musicSelect">🎵 Background Music (${config.music.length} available)</label>
        <select id="musicSelect" name="musicSelect">
          <option value="">None</option>
        </select>
      </div>
    </div>
    
    <div class="main">
      <div class="video-section">
        <div class="video-container">
          <video id="preview" autoplay playsinline muted></video>
          
          <!-- Camera off overlay with logo -->
          <div id="cameraOffOverlay" class="camera-off-overlay">
            <div id="logoPlaceholder" class="logo-placeholder">🎥</div>
            <p class="camera-off-text">Camera is off</p>
            <input type="file" id="logoUploadInput" accept="image/*" style="display:none;">
            <button id="uploadLogoBtn" class="upload-logo-btn">📷 Upload Logo</button>
          </div>
          
          <!-- Camera controls -->
          <div class="camera-controls">
            <button id="cameraToggleBtn" class="active" title="Toggle Camera">📹 On</button>
            <button id="cameraBlurBtn" title="Background Blur (softens entire webcam)">🔵 BG Blur</button>
          </div>
          
          <div id="cameraLoading" class="camera-loading">
            <div id="cameraLoadingContent">
              <div class="spinner"></div>
              <p style="margin-top:20px;opacity:0.7;">Checking camera permissions...</p>
              <p style="margin-top:10px;font-size:12px;opacity:0.5;">Please allow camera access when prompted</p>
            </div>
            <div id="cameraPermissionRequest" style="display:none;text-align:center;">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5" style="margin-bottom:20px;">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              <p style="font-size:18px;font-weight:600;margin-bottom:10px;">Camera Access Required</p>
              <p style="font-size:14px;opacity:0.7;margin-bottom:20px;">Click below to grant camera and microphone access</p>
              <button id="requestCameraBtn" style="padding:15px 30px;font-size:16px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border:none;color:white;border-radius:10px;cursor:pointer;margin-bottom:15px;">
                🎥 Allow Camera Access
              </button>
              <p style="font-size:12px;opacity:0.5;">Your browser will ask for permission</p>
            </div>
          </div>
          
          <div id="countdownOverlay" class="countdown-overlay hidden">
            <div id="countdownNumber" class="countdown-number">5</div>
            <div class="countdown-text">Get ready...</div>
            <button id="cancelCountdown" class="countdown-cancel">Cancel</button>
          </div>
          
          <div id="recIndicator" class="recording-indicator" style="display:none;">
            <div class="rec-dot"></div>
            <span id="timer" class="timer">00:00</span>
          </div>
          
          <div id="audioControlPanel" class="audio-control-panel">
            <div class="drag-handle" id="audioPanelDragHandle">
              <span class="panel-title">🎛️ Audio Controls</span>
              <span class="drag-handle-icon">⋮⋮</span>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <button id="minimizeAudioBtn" class="minimize-toggle" title="Minimize/Expand">➖</button>
              <span class="minimized-label">Minimized</span>
            </div>
            
            <div id="voiceoverControls" class="audio-control-group disabled">
              <div class="track-header">
                <label>🎤 Voiceover</label>
                <span class="track-status">Not Selected</span>
              </div>
              <div class="controls">
                <button id="voRewindBtn" title="Rewind 5s" disabled>⏪</button>
                <button id="voPlayPauseBtn" title="Play/Pause" disabled>▶️</button>
                <button id="voStopBtn" title="Stop" disabled>⏹️</button>
                <button id="voForwardBtn" title="Forward 5s" disabled>⏩</button>
              </div>
              <div class="progress"><div id="voProgress" class="progress-bar"></div></div>
            </div>
            
            <div id="ttsControls" class="audio-control-group disabled">
              <div class="track-header">
                <label>🗣️ TTS Script</label>
                <span class="track-status">Not Selected</span>
              </div>
              <div class="controls">
                <button id="ttsRewindBtn" title="Rewind 5s" disabled>⏪</button>
                <button id="ttsPlayPauseBtn" title="Play/Pause" disabled>▶️</button>
                <button id="ttsStopBtn" title="Stop" disabled>⏹️</button>
                <button id="ttsForwardBtn" title="Forward 5s" disabled>⏩</button>
              </div>
              <div class="progress"><div id="ttsProgress" class="progress-bar"></div></div>
            </div>
            
            <div id="musicControls" class="audio-control-group disabled">
              <div class="track-header">
                <label>🎵 Background Music</label>
                <span class="track-status">Not Selected</span>
              </div>
              <div class="controls">
                <button id="musicRewindBtn" title="Rewind 5s" disabled>⏪</button>
                <button id="musicPlayPauseBtn" title="Play/Pause" disabled>▶️</button>
                <button id="musicStopBtn" title="Stop" disabled>⏹️</button>
                <button id="musicLoopBtn" title="Toggle Loop" disabled>🔁</button>
                <button id="musicVolumeDownBtn" title="Volume -" disabled>🔉</button>
                <button id="musicVolumeUpBtn" title="Volume +" disabled>🔊</button>
              </div>
              <div class="progress"><div id="musicProgress" class="progress-bar"></div></div>
              <div style="font-size:9px;text-align:center;opacity:0.7;margin-top:2px;">
                <span id="musicLoopStatus">🔁 Loop: ON</span>
              </div>
            </div>
            
            <div id="allAudioControls" class="audio-control-group" style="background:transparent;border-left-color:#6366f1;">
              <div class="track-header">
                <label>🎛️ All Tracks</label>
              </div>
              <div class="controls">
                <button id="pauseAllAudioBtn" title="Pause All">⏸️</button>
                <button id="resumeAllAudioBtn" title="Resume All">▶️</button>
                <button id="restartAllAudioBtn" title="Restart All">🔄</button>
              </div>
            </div>
          </div>
        </div>
        <div class="controls">
          <button id="startBtn" class="primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
            </svg>
            Start Recording
          </button>
          <button id="pauseBtn" style="display:none;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            Pause
          </button>
          <button id="stopBtn" class="danger" style="display:none;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2"></rect>
            </svg>
            Stop
          </button>
          <label for="videoName" class="sr-only">Video name</label>
          <input id="videoName" name="videoName" placeholder="Video name..." style="display:none;" />
          <button id="saveBtn" class="primary" style="display:none;">Save</button>
          <button id="resetBtn" style="display:none;">New Recording</button>
        </div>
      </div>
      
      <div class="sidebar">
        <div id="scriptPanel" class="panel teleprompter">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h3 style="margin:0;">📄 Teleprompter</h3>
            <div style="display:flex;gap:5px;">
              <button id="scrollUpBtn" style="padding:4px 8px;font-size:12px;" title="Scroll Up">▲</button>
              <button id="scrollDownBtn" style="padding:4px 8px;font-size:12px;" title="Scroll Down">▼</button>
              <button id="scrollResetBtn" style="padding:4px 8px;font-size:12px;" title="Reset">⟲</button>
            </div>
          </div>
          <div id="scriptContent" class="script-content">
            ${escapedScriptContent || '<span style="opacity:0.5;">Select a script to display here...</span>'}
          </div>
        </div>
        
        <div id="audioPanel" class="panel" style="${selectedAudioUrl ? '' : 'display:none;'}">
          <h3>🎤 Voiceover Audio</h3>
          <div class="audio-info">
            <strong id="voiceoverName">${selectedAudioName}</strong><br>
            <small>Will play automatically when recording starts</small>
            <button id="useVoiceoverScriptBtn" class="use-script-btn" style="display:none;margin-top:8px;">
              📄 Use Attached Script
            </button>
          </div>
          <audio id="voiceover" src="${selectedAudioUrl}" preload="auto"></audio>
        </div>
        
        <div id="musicPanel" class="panel" style="${selectedMusicUrl ? '' : 'display:none;'}">
          <h3>🎵 Background Music</h3>
          <div class="audio-info">
            <strong id="bgMusicName">${selectedMusicName}</strong>
            <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
              <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;">
                <input type="checkbox" id="musicLoopToggle" checked style="width:14px;height:14px;">
                🔁 Loop until recording ends
              </label>
            </div>
          </div>
          <audio id="bgMusic" src="${selectedMusicUrl}" preload="auto" loop></audio>
        </div>
        
        <div class="panel">
          <h3>⚙️ Info</h3>
          <p style="font-size:13px;opacity:0.8;">
            This window is separate from the main app.<br><br>
            When you share your screen, only this window will be captured - the main app controls won't show.
          </p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate the complete JavaScript for the pop-out window
 */
function generateScript(config: PopoutConfig): string {
  const scriptsEncoded = encodeData(config.scripts);
  const voiceoversEncoded = encodeData(config.voiceovers);
  const musicEncoded = encodeData(config.music);

  return `
    // =====================================================
    // CRITICAL: Close button setup BEFORE anything else
    // This runs in its own scope to ensure it never fails
    // =====================================================
    (function setupCloseButton() {
      try {
        window.mediaRecorder = null;
        window.cameraStream = null;
        window.displayStream = null;
        
        var closeBtn = document.getElementById('closeBtn');
        console.log('🔴 Close button element:', closeBtn);
        
        if (closeBtn) {
          closeBtn.onclick = function() {
            console.log('Close clicked!');
            try {
              if (window.mediaRecorder && window.mediaRecorder.state === 'recording') {
                window.mediaRecorder.stop();
              }
              if (window.cameraStream) {
                window.cameraStream.getTracks().forEach(function(t) { t.stop(); });
              }
              if (window.displayStream) {
                window.displayStream.getTracks().forEach(function(t) { t.stop(); });
              }
            } catch(e) { console.log('Cleanup error:', e); }
            window.close();
            return false;
          };
          console.log('✅ Close button ready');
        } else {
          console.error('❌ No close button!');
        }
        
        document.onkeydown = function(e) {
          if (e.key === 'Escape' || e.keyCode === 27) {
            closeBtn && closeBtn.click();
          }
        };
      } catch(e) {
        console.error('Close button setup error:', e);
      }
    })();
    
    // Global error handler
    window.onerror = function(msg, url, line) {
      console.error('Script Error:', msg, 'line:', line);
      var s = document.getElementById('status');
      if (s) { s.textContent = 'Script Error'; s.className = 'status error'; }
      return false;
    };
    
    // =====================================================
    // Main functionality in separate IIFE
    // =====================================================
    (function mainScript() {
      'use strict';
      console.log('🚀 Main script starting...');
      
      // Decode data from base64 (safe encoding to avoid template literal issues)
      function decodeData(encoded) {
        try {
          if (!encoded) return [];
          return JSON.parse(decodeURIComponent(atob(encoded)));
        } catch(e) {
          console.error('Failed to decode data:', e);
          return [];
        }
      }
      
      // Data from parent (base64 encoded for safety)
      var scripts = decodeData('${scriptsEncoded}');
      var voiceovers = decodeData('${voiceoversEncoded}');
      var musicList = decodeData('${musicEncoded}');
      
      console.log('📋 Data loaded:', { scripts: scripts.length, voiceovers: voiceovers.length, music: musicList.length });
      
      var mediaRecorder = null;
      var chunks = [];
      var stream = null;
      var startTime = 0;
      var timerInterval = null;
      var isPaused = false;
      var countdownInterval = null;
      var countdownValue = 5;
      var displayStream = null;
      var screenVideo = null;
      var webcamVideo = null;
      var canvas = null;
      var ctx = null;
      var audioContext = null;
      var scrollInterval = null;
      var ttsAudio = null;
      var voiceoverActive = false;
      var ttsActive = false;
      var musicActive = false;
      var isRecording = false;
      var isCountingDown = false;
      var voiceoverAudioSource = null;
      var ttsAudioSource = null;
      var musicAudioSource = null;
      var audioSourcesConnected = false; // Track if sources already connected
      
      // DOM Elements
      var preview = document.getElementById('preview');
      var startBtn = document.getElementById('startBtn');
      var pauseBtn = document.getElementById('pauseBtn');
      var stopBtn = document.getElementById('stopBtn');
      var saveBtn = document.getElementById('saveBtn');
      var resetBtn = document.getElementById('resetBtn');
      var videoNameInput = document.getElementById('videoName');
      var recIndicator = document.getElementById('recIndicator');
      var timer = document.getElementById('timer');
      var status = document.getElementById('status');
      var voiceover = document.getElementById('voiceover');
      var bgMusic = document.getElementById('bgMusic');
      var countdownOverlay = document.getElementById('countdownOverlay');
      var countdownNumber = document.getElementById('countdownNumber');
      var cancelCountdown = document.getElementById('cancelCountdown');
      var scriptSelect = document.getElementById('scriptSelect');
      var voiceoverSelect = document.getElementById('voiceoverSelect');
      var musicSelect = document.getElementById('musicSelect');
      var scriptContent = document.getElementById('scriptContent');
      var audioPanel = document.getElementById('audioPanel');
      var musicPanel = document.getElementById('musicPanel');
      var voiceoverName = document.getElementById('voiceoverName');
      var bgMusicName = document.getElementById('bgMusicName');
      var audioControlPanel = document.getElementById('audioControlPanel');
      var voiceoverControls = document.getElementById('voiceoverControls');
      var ttsControls = document.getElementById('ttsControls');
      var musicControls = document.getElementById('musicControls');
      var cameraLoading = document.getElementById('cameraLoading');
      var cameraLoadingContent = document.getElementById('cameraLoadingContent');
      var cameraPermissionRequest = document.getElementById('cameraPermissionRequest');
      var requestCameraBtn = document.getElementById('requestCameraBtn');
      var cameraOffOverlay = document.getElementById('cameraOffOverlay');
      var cameraToggleBtn = document.getElementById('cameraToggleBtn');
      var cameraBlurBtn = document.getElementById('cameraBlurBtn');
      var logoPlaceholder = document.getElementById('logoPlaceholder');
      var logoUploadInput = document.getElementById('logoUploadInput');
      var uploadLogoBtn = document.getElementById('uploadLogoBtn');
      
      // Camera state
      var isCameraOn = true;
      var isCameraBlurred = false;
      var customLogoDataUrl = null;
      var customLogoImage = null;
      
      // Load saved logo from localStorage
      try {
        var savedLogo = localStorage.getItem('recording_studio_custom_logo');
        if (savedLogo) {
          customLogoDataUrl = savedLogo;
          customLogoImage = new Image();
          customLogoImage.src = savedLogo;
          logoPlaceholder.innerHTML = '<img src="' + savedLogo + '" alt="Logo">';
        }
      } catch(e) { console.error('Failed to load saved logo:', e); }
      
      // Logo upload handling
      uploadLogoBtn.onclick = function() {
        logoUploadInput.click();
      };
      
      logoUploadInput.onchange = function(e) {
        var file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
          var reader = new FileReader();
          reader.onload = function(evt) {
            customLogoDataUrl = evt.target.result;
            customLogoImage = new Image();
            customLogoImage.src = customLogoDataUrl;
            logoPlaceholder.innerHTML = '<img src="' + customLogoDataUrl + '" alt="Logo">';
            // Save to localStorage
            try {
              localStorage.setItem('recording_studio_custom_logo', customLogoDataUrl);
            } catch(err) { console.error('Failed to save logo:', err); }
          };
          reader.readAsDataURL(file);
        }
      };
      
      // Currently selected IDs
      var selectedScriptId = '${config.selectedScriptId}';
      var selectedVoiceoverId = '${config.selectedVoiceoverId}';
      var selectedMusicId = '${config.selectedMusicId}';
      
      // Populate dropdowns
      try {
        scripts.forEach(function(s) {
          var opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = s.title;
          if (s.id === selectedScriptId) opt.selected = true;
          scriptSelect.appendChild(opt);
        });
        
        voiceovers.forEach(function(v) {
          var opt = document.createElement('option');
          opt.value = v.id;
          opt.textContent = v.name;
          if (v.id === selectedVoiceoverId) opt.selected = true;
          voiceoverSelect.appendChild(opt);
        });
        
        musicList.forEach(function(m) {
          var opt = document.createElement('option');
          opt.value = m.id;
          opt.textContent = m.name;
          if (m.id === selectedMusicId) opt.selected = true;
          musicSelect.appendChild(opt);
        });
        
        console.log('✅ Dropdowns populated');
      } catch(e) {
        console.error('Dropdown error:', e);
      }
      
      // Function to update audio control panel based on dropdown selections
      function updateControlPanelFromDropdowns() {
        var hasVoiceover = voiceoverSelect.value && voiceovers.find(function(v) { return v.id === voiceoverSelect.value; });
        var hasScript = scriptSelect.value && scripts.find(function(s) { return s.id === scriptSelect.value; });
        var hasMusic = musicSelect.value && musicList.find(function(m) { return m.id === musicSelect.value; });
        
        console.log('🎛️ Updating control panel:', { hasVoiceover: !!hasVoiceover, hasScript: !!hasScript, hasMusic: !!hasMusic });
        
        // Update voiceover controls
        if (hasVoiceover) {
          voiceoverControls.classList.remove('disabled');
          voiceoverControls.classList.add('active');
          voiceoverControls.querySelector('.track-status').textContent = 'Ready';
          voiceoverControls.querySelectorAll('button').forEach(function(btn) { btn.disabled = false; });
        } else {
          voiceoverControls.classList.remove('active');
          voiceoverControls.classList.add('disabled');
          voiceoverControls.querySelector('.track-status').textContent = 'Not Selected';
          voiceoverControls.querySelectorAll('button').forEach(function(btn) { btn.disabled = true; });
        }
        
        // Update TTS controls (based on script selection)
        if (hasScript) {
          ttsControls.classList.remove('disabled');
          ttsControls.classList.add('active');
          ttsControls.querySelector('.track-status').textContent = 'Ready';
          ttsControls.querySelectorAll('button').forEach(function(btn) { btn.disabled = false; });
        } else {
          ttsControls.classList.remove('active');
          ttsControls.classList.add('disabled');
          ttsControls.querySelector('.track-status').textContent = 'Not Selected';
          ttsControls.querySelectorAll('button').forEach(function(btn) { btn.disabled = true; });
        }
        
        // Update music controls
        if (hasMusic) {
          musicControls.classList.remove('disabled');
          musicControls.classList.add('active');
          musicControls.querySelector('.track-status').textContent = 'Ready';
          musicControls.querySelectorAll('button').forEach(function(btn) { btn.disabled = false; });
        } else {
          musicControls.classList.remove('active');
          musicControls.classList.add('disabled');
          musicControls.querySelector('.track-status').textContent = 'Not Selected';
          musicControls.querySelectorAll('button').forEach(function(btn) { btn.disabled = true; });
        }
      }
      
      // Dropdown change handlers
      scriptSelect.onchange = function() {
        var id = this.value;
        var script = scripts.find(function(s) { return s.id === id; });
        if (script) {
          scriptContent.innerHTML = script.content.replace(/\\n/g, '<br>').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        } else {
          scriptContent.innerHTML = '<span style="opacity:0.5;">Select a script to display here...</span>';
        }
        updateControlPanelFromDropdowns();
      };
      
      voiceoverSelect.onchange = function() {
        var id = this.value;
        var vo = voiceovers.find(function(v) { return v.id === id; });
        if (vo) {
          voiceover.src = vo.url;
          voiceoverName.textContent = vo.name;
          audioPanel.style.display = '';
          
          // Check for attached script
          var useScriptBtn = document.getElementById('useVoiceoverScriptBtn');
          if (vo.scriptText) {
            useScriptBtn.style.display = 'block';
            useScriptBtn.onclick = function() {
              scriptContent.innerHTML = vo.scriptText.replace(/\\n/g, '<br>').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            };
          } else {
            useScriptBtn.style.display = 'none';
          }
        } else {
          audioPanel.style.display = 'none';
        }
        updateControlPanelFromDropdowns();
      };
      
      musicSelect.onchange = function() {
        var id = this.value;
        var m = musicList.find(function(x) { return x.id === id; });
        if (m) {
          bgMusic.src = m.url;
          bgMusicName.textContent = m.name;
          musicPanel.style.display = '';
        } else {
          musicPanel.style.display = 'none';
        }
        updateControlPanelFromDropdowns();
      };
      
      // Initialize control panel on load
      setTimeout(function() {
        updateControlPanelFromDropdowns();
      }, 100);
      
      // Scroll controls
      document.getElementById('scrollUpBtn').onclick = function() { scriptContent.scrollTop -= 50; };
      document.getElementById('scrollDownBtn').onclick = function() { scriptContent.scrollTop += 50; };
      document.getElementById('scrollResetBtn').onclick = function() { scriptContent.scrollTop = 0; };
      
      // Camera toggle controls
      cameraToggleBtn.onclick = function() {
        isCameraOn = !isCameraOn;
        if (isCameraOn) {
          cameraOffOverlay.classList.remove('visible');
          preview.style.display = '';
          cameraToggleBtn.textContent = '📹 On';
          cameraToggleBtn.classList.add('active');
          // Re-enable video track
          if (stream) {
            var videoTracks = stream.getVideoTracks();
            videoTracks.forEach(function(track) { track.enabled = true; });
          }
        } else {
          cameraOffOverlay.classList.add('visible');
          cameraToggleBtn.textContent = '📹 Off';
          cameraToggleBtn.classList.remove('active');
          // Disable video track (keeps audio)
          if (stream) {
            var videoTracks = stream.getVideoTracks();
            videoTracks.forEach(function(track) { track.enabled = false; });
          }
        }
      };
      
      cameraBlurBtn.onclick = function() {
        isCameraBlurred = !isCameraBlurred;
        if (isCameraBlurred) {
          preview.style.filter = 'blur(8px)';
          cameraBlurBtn.textContent = '🔵 Unblur';
          cameraBlurBtn.classList.add('active');
        } else {
          preview.style.filter = '';
          cameraBlurBtn.textContent = '🔵 BG Blur';
          cameraBlurBtn.classList.remove('active');
        }
      };
      
      // Music loop toggle
      var musicLoopToggle = document.getElementById('musicLoopToggle');
      musicLoopToggle.onchange = function() {
        bgMusic.loop = this.checked;
        console.log('🔁 Music loop:', this.checked ? 'ON' : 'OFF');
      };
      
      // Audio control panel minimize toggle and drag functionality
      var minimizeAudioBtn = document.getElementById('minimizeAudioBtn');
      var audioControlPanel = document.getElementById('audioControlPanel');
      var audioPanelDragHandle = document.getElementById('audioPanelDragHandle');
      var isAudioMinimized = false;
      
      minimizeAudioBtn.onclick = function(e) {
        e.stopPropagation();
        isAudioMinimized = !isAudioMinimized;
        if (isAudioMinimized) {
          audioControlPanel.classList.add('minimized');
          minimizeAudioBtn.textContent = '➕';
          minimizeAudioBtn.title = 'Expand Audio Controls';
        } else {
          audioControlPanel.classList.remove('minimized');
          minimizeAudioBtn.textContent = '➖';
          minimizeAudioBtn.title = 'Minimize Audio Controls';
        }
      };
      
      // Make audio panel draggable
      var isDragging = false;
      var dragOffsetX = 0;
      var dragOffsetY = 0;
      
      audioPanelDragHandle.onmousedown = function(e) {
        e.preventDefault();
        isDragging = true;
        var rect = audioControlPanel.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        audioControlPanel.style.transition = 'none';
      };
      
      document.onmousemove = function(e) {
        if (!isDragging) return;
        var newX = e.clientX - dragOffsetX;
        var newY = e.clientY - dragOffsetY;
        
        // Keep within viewport bounds
        var panelWidth = audioControlPanel.offsetWidth;
        var panelHeight = audioControlPanel.offsetHeight;
        newX = Math.max(0, Math.min(newX, window.innerWidth - panelWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - panelHeight));
        
        audioControlPanel.style.left = newX + 'px';
        audioControlPanel.style.top = newY + 'px';
        audioControlPanel.style.right = 'auto';
        audioControlPanel.style.bottom = 'auto';
      };
      
      document.onmouseup = function() {
        if (isDragging) {
          isDragging = false;
          audioControlPanel.style.transition = '';
        }
      };
      
      // Show permission denied UI
      function showPermissionDenied() {
        cameraLoadingContent.style.display = 'none';
        cameraPermissionRequest.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" style="margin-bottom:20px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg><p style="font-size:18px;font-weight:600;color:#ef4444;margin-bottom:10px;">Camera Access Blocked</p><p style="font-size:14px;opacity:0.7;margin-bottom:15px;">Camera permission was denied by browser</p><div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;text-align:left;margin-bottom:20px;max-width:400px;"><p style="font-size:13px;font-weight:600;margin-bottom:10px;">To allow camera access:</p><ol style="font-size:12px;opacity:0.8;padding-left:20px;margin:0;"><li style="margin-bottom:5px;">Click the camera/lock icon in your browser address bar</li><li style="margin-bottom:5px;">Find Camera and change to Allow</li><li style="margin-bottom:5px;">Click the button below to reload</li></ol></div><button onclick="location.reload()" style="padding:12px 25px;font-size:14px;background:#3b82f6;border:none;color:white;border-radius:8px;cursor:pointer;">Reload Window</button>';
        cameraPermissionRequest.style.display = 'block';
        status.textContent = 'Permission Denied';
        status.className = 'status error';
      }
      
      // Initialize camera
      function initCamera() {
        console.log('🎥 Requesting camera access...');
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error('Camera API not available');
          cameraLoadingContent.innerHTML = '<p style="color:#f87171;">Camera API not available in this browser</p>';
          status.textContent = 'Error';
          status.className = 'status error';
          return;
        }
        
        navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true
        }).then(function(mediaStream) {
          console.log('✅ Camera stream obtained');
          stream = mediaStream;
          window.cameraStream = mediaStream;
          
          preview.srcObject = mediaStream;
          preview.muted = true;
          preview.play().then(function() {
            console.log('✅ Preview playing');
            cameraLoading.classList.add('hidden');
            status.textContent = 'Camera Ready';
            status.className = 'status ready';
          }).catch(function(playErr) {
            console.error('Preview play error:', playErr);
            cameraLoading.classList.add('hidden');
            status.textContent = 'Camera Ready';
            status.className = 'status ready';
          });
          
        }).catch(function(e) {
          console.error('❌ Camera error:', e.name, e.message);
          
          if (e.name === 'NotAllowedError') {
            showPermissionDenied();
          } else if (e.name === 'NotFoundError') {
            cameraLoadingContent.style.display = 'none';
            cameraPermissionRequest.innerHTML = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" style="margin-bottom:20px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg><p style="font-size:18px;font-weight:600;color:#ef4444;margin-bottom:10px;">No Camera Found</p><p style="font-size:14px;opacity:0.7;margin-bottom:20px;">Please connect a camera and try again</p><button onclick="location.reload()" style="padding:12px 25px;background:#3b82f6;border:none;color:white;border-radius:8px;cursor:pointer;">Retry</button>';
            cameraPermissionRequest.style.display = 'block';
            status.textContent = 'No Camera';
            status.className = 'status error';
          } else {
            cameraLoadingContent.innerHTML = '<p style="color:#f87171;font-size:16px;margin-bottom:10px;">Camera Error</p><p style="font-size:13px;opacity:0.7;margin-bottom:15px;">' + (e.message || 'Unknown error') + '</p><button onclick="initCamera()" style="padding:10px 20px;background:#3b82f6;border:none;color:white;border-radius:8px;cursor:pointer;">Retry</button>';
            status.textContent = 'Error';
            status.className = 'status error';
          }
        });
      }
      
      // Button to retry camera
      requestCameraBtn.onclick = initCamera;
      
      // Initialize camera immediately
      console.log('🎬 Starting camera initialization...');
      initCamera();
      
      // Utility functions
      function formatTime(seconds) {
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return mins.toString().padStart(2,'0') + ':' + secs.toString().padStart(2,'0');
      }
      
      // Start recording button
      startBtn.onclick = function() {
        // Prevent multiple clicks
        if (isRecording || isCountingDown) {
          console.log('⚠️ Already recording or counting down, ignoring click');
          return;
        }
        
        // Stop any playing audio first
        stopAllAudio();
        
        status.textContent = 'Select screen...';
        status.className = 'status countdown';
        
        navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080, frameRate: 30 },
          audio: true
        }).then(function(displayStr) {
          displayStream = displayStr;
          window.displayStream = displayStr;
          
          preview.srcObject = displayStream;
          status.textContent = 'Screen selected';
          
          showAudioOptionsDialog();
          
        }).catch(function(e) {
          console.error('Screen share error:', e);
          status.textContent = 'Ready';
          status.className = 'status ready';
          if (e.name !== 'NotAllowedError') {
            alert('Screen share error: ' + e.message);
          }
        });
      };
      
      // Stop all audio helper - with thorough cleanup
      function stopAllAudio() {
        console.log('🔇 Stopping all audio');
        try {
          if (voiceover) { 
            voiceover.pause(); 
            voiceover.currentTime = 0;
            voiceover.onended = null;
          }
          if (ttsAudio) { 
            ttsAudio.pause(); 
            ttsAudio.currentTime = 0;
            ttsAudio.onended = null;
          }
          if (bgMusic) { 
            bgMusic.pause(); 
            bgMusic.currentTime = 0; 
          }
        } catch(e) {
          console.error('Error stopping audio:', e);
        }
      }
      
      // Audio options dialog
      function showAudioOptionsDialog() {
        var hasScript = scriptSelect.value && scripts.find(function(s) { return s.id === scriptSelect.value; });
        var hasVoiceover = voiceoverSelect.value && voiceovers.find(function(v) { return v.id === voiceoverSelect.value; });
        var hasMusic = musicSelect.value && musicList.find(function(m) { return m.id === musicSelect.value; });
        
        var dialogHtml = '<div id="audioOptionsDialog" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:200;">';
        dialogHtml += '<div style="background:#1a1a2e;padding:30px;border-radius:16px;max-width:500px;width:90%;">';
        dialogHtml += '<h2 style="margin-bottom:20px;font-size:20px;">🎬 Recording Options</h2>';
        
        if (hasScript) {
          dialogHtml += '<div style="margin-bottom:20px;padding:15px;background:#2a2a3e;border-radius:8px;">';
          dialogHtml += '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;">';
          dialogHtml += '<input type="checkbox" id="useTTS" checked style="width:20px;height:20px;">';
          dialogHtml += '<div><strong>🗣️ Generate TTS Voiceover</strong><br><small style="opacity:0.7;">Convert script to speech using AI voice</small></div>';
          dialogHtml += '</label></div>';
        }
        
        if (hasVoiceover) {
          var voName = voiceovers.find(function(v) { return v.id === voiceoverSelect.value; });
          dialogHtml += '<div style="margin-bottom:20px;padding:15px;background:#2a2a3e;border-radius:8px;">';
          dialogHtml += '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;">';
          dialogHtml += '<input type="checkbox" id="useVoiceover" checked style="width:20px;height:20px;">';
          dialogHtml += '<div><strong>🎤 Play Voiceover Audio</strong><br><small style="opacity:0.7;">' + (voName ? voName.name : '') + '</small></div>';
          dialogHtml += '</label></div>';
        }
        
        if (hasMusic) {
          var mName = musicList.find(function(m) { return m.id === musicSelect.value; });
          dialogHtml += '<div style="margin-bottom:20px;padding:15px;background:#2a2a3e;border-radius:8px;">';
          dialogHtml += '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;">';
          dialogHtml += '<input type="checkbox" id="useMusic" checked style="width:20px;height:20px;">';
          dialogHtml += '<div><strong>🎵 Play Background Music</strong><br><small style="opacity:0.7;">' + (mName ? mName.name : '') + '</small></div>';
          dialogHtml += '</label></div>';
        }
        
        if (!hasScript && !hasVoiceover && !hasMusic) {
          dialogHtml += '<p style="opacity:0.7;margin-bottom:20px;">No audio sources selected. Recording will use microphone only.</p>';
        }
        
        dialogHtml += '<div style="display:flex;gap:10px;justify-content:flex-end;">';
        dialogHtml += '<button id="cancelOptions" style="padding:12px 24px;">Cancel</button>';
        dialogHtml += '<button id="confirmOptions" class="primary" style="padding:12px 24px;">Start Countdown</button>';
        dialogHtml += '</div></div></div>';
        
        document.body.insertAdjacentHTML('beforeend', dialogHtml);
        
        document.getElementById('cancelOptions').onclick = function() {
          document.getElementById('audioOptionsDialog').remove();
          if (displayStream) {
            displayStream.getTracks().forEach(function(t) { t.stop(); });
            displayStream = null;
          }
          preview.srcObject = stream;
          status.textContent = 'Ready';
          status.className = 'status ready';
        };
        
        document.getElementById('confirmOptions').onclick = function() {
          var useTTSVal = document.getElementById('useTTS');
          var useVoiceoverVal = document.getElementById('useVoiceover');
          var useMusicVal = document.getElementById('useMusic');
          var useTTS = useTTSVal ? useTTSVal.checked : false;
          var useVoiceoverOpt = useVoiceoverVal ? useVoiceoverVal.checked : false;
          var useMusicOpt = useMusicVal ? useMusicVal.checked : false;
          
          document.getElementById('audioOptionsDialog').remove();
          
          if (useTTS && hasScript) {
            status.textContent = 'Generating TTS...';
            var scriptToUse = scripts.find(function(s) { return s.id === scriptSelect.value; });
            if (scriptToUse) {
              generateTTS(scriptToUse.content, function() {
                startCountdown(useVoiceoverOpt, useMusicOpt, useTTS);
              });
            } else {
              startCountdown(useVoiceoverOpt, useMusicOpt, useTTS);
            }
          } else {
            startCountdown(useVoiceoverOpt, useMusicOpt, useTTS);
          }
        };
      }
      
      // Generate TTS from script
      function generateTTS(text, callback) {
        var supabaseUrl = '${config.supabaseUrl}';
        var supabaseKey = '${config.supabaseKey}';
        
        // Helper to save TTS to parent window's localStorage
        function saveTTSToLibrary(audioContent, scriptTitle) {
          try {
            var audioId = 'tts-' + Date.now() + '-' + Math.random().toString(36).substring(7);
            var audioName = 'TTS: ' + (scriptTitle || 'Generated').substring(0, 30);
            var audioDataUrl = 'data:audio/mpeg;base64,' + audioContent;
            
            // Save to localStorage for the parent window to pick up
            var existingAudios = [];
            try {
              var saved = localStorage.getItem('generatedAudiosMetadata');
              if (saved) existingAudios = JSON.parse(saved);
            } catch(e) {}
            
            existingAudios.push({
              id: audioId,
              name: audioName,
              audioUrl: audioDataUrl,
              storagePath: null,
              createdAt: new Date().toISOString(),
              scriptText: text.substring(0, 500),
              scriptType: 'video',
              source: 'tts-popout'
            });
            
            localStorage.setItem('generatedAudiosMetadata', JSON.stringify(existingAudios));
            console.log('✅ TTS saved to library:', audioName);
            
            // Try to notify parent window
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({ type: 'TTS_GENERATED', audioId: audioId, name: audioName }, '*');
            }
          } catch(e) {
            console.error('Failed to save TTS to library:', e);
          }
        }
        
        var scriptTitle = '';
        var selectedScriptObj = scripts.find(function(s) { return s.id === scriptSelect.value; });
        if (selectedScriptObj) scriptTitle = selectedScriptObj.title;
        
        fetch(supabaseUrl + '/functions/v1/elevenlabs-voice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + supabaseKey
          },
          body: JSON.stringify({
            text: text.substring(0, 5000),
            voice: 'Aria',
            model: 'eleven_multilingual_v2',
            agentType: 'conversational'
          })
        }).then(function(response) {
          if (!response.ok) throw new Error('TTS API failed');
          return response.json();
        }).then(function(data) {
          if (data.audioContent) {
            ttsAudio = new Audio('data:audio/mpeg;base64,' + data.audioContent);
            ttsAudio.volume = 1.0;
            ttsAudio.crossOrigin = 'anonymous';
            ttsAudio.preload = 'auto';
            // Wait for audio to be ready before calling callback
            ttsAudio.oncanplaythrough = function() {
              console.log('✅ TTS audio ready');
            };
            saveTTSToLibrary(data.audioContent, scriptTitle);
          }
          if (callback) callback();
        }).catch(function(e) {
          console.error('TTS error:', e);
          fetch(supabaseUrl + '/functions/v1/openai-tts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': 'Bearer ' + supabaseKey
            },
            body: JSON.stringify({
              text: text.substring(0, 4000),
              voice: 'alloy',
              speed: 1.0
            })
          }).then(function(response) {
            if (response.ok) return response.json();
            throw new Error('OpenAI TTS failed');
          }).then(function(data) {
            if (data.audioContent) {
              ttsAudio = new Audio('data:audio/mpeg;base64,' + data.audioContent);
              ttsAudio.volume = 1.0;
              ttsAudio.crossOrigin = 'anonymous';
              ttsAudio.preload = 'auto';
              saveTTSToLibrary(data.audioContent, scriptTitle);
            }
            if (callback) callback();
          }).catch(function(e2) {
            console.error('OpenAI TTS fallback failed:', e2);
            ttsAudio = null; // Ensure it's null if failed
            if (callback) callback();
          });
        });
      }
      
      // Start countdown after screen share is ready
      function startCountdown(useVoiceover, useMusic, useTTS) {
        if (isCountingDown || isRecording) {
          console.log('⚠️ Already counting down or recording');
          return;
        }
        
        isCountingDown = true;
        countdownValue = 5;
        countdownNumber.textContent = countdownValue;
        countdownOverlay.classList.remove('hidden');
        status.textContent = 'Countdown...';
        status.className = 'status countdown';
        
        // Clear any previous countdown
        if (countdownInterval) clearInterval(countdownInterval);
        
        countdownInterval = setInterval(function() {
          countdownValue--;
          if (countdownValue <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            countdownOverlay.classList.add('hidden');
            actuallyStartRecording(useVoiceover, useMusic, useTTS);
          } else {
            countdownNumber.textContent = countdownValue;
          }
        }, 1000);
      }
      
      cancelCountdown.onclick = function() {
        isCountingDown = false;
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        countdownOverlay.classList.add('hidden');
        if (displayStream) {
          displayStream.getTracks().forEach(function(t) { t.stop(); });
          displayStream = null;
        }
        preview.srcObject = stream;
        status.textContent = 'Ready';
        status.className = 'status ready';
      };
      
      // Actually start recording
      function actuallyStartRecording(useVoiceover, useMusic, useTTS) {
        canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        ctx = canvas.getContext('2d');
        
        screenVideo = document.createElement('video');
        screenVideo.srcObject = displayStream;
        screenVideo.muted = true;
        screenVideo.playsInline = true;
        
        webcamVideo = document.createElement('video');
        webcamVideo.srcObject = stream;
        webcamVideo.muted = true;
        webcamVideo.playsInline = true;
        
        var videosReady = 0;
        var totalVideos = 2;
        
        function onVideoReady() {
          videosReady++;
          if (videosReady >= totalVideos) {
            startCompositing(useVoiceover, useMusic, useTTS);
          }
        }
        
        screenVideo.oncanplay = onVideoReady;
        webcamVideo.oncanplay = onVideoReady;
        screenVideo.play().catch(console.error);
        webcamVideo.play().catch(console.error);
        
        setTimeout(function() {
          if (videosReady < totalVideos) {
            console.log('Force starting compositing...');
            startCompositing(useVoiceover, useMusic, useTTS);
          }
        }, 2000);
      }
      
      // Start compositing and recording
      function startCompositing(useVoiceover, useMusic, useTTS) {
        isRecording = true;
        isCountingDown = false;
        
        var canvasStream = canvas.captureStream(30);
        
        // Create a fresh audio context for this recording session
        if (audioContext && audioContext.state !== 'closed') {
          try { audioContext.close(); } catch(e) {}
        }
        audioContext = new AudioContext();
        var destination = audioContext.createMediaStreamDestination();
        
        // Reset audio source references for fresh connection
        voiceoverAudioSource = null;
        ttsAudioSource = null;
        musicAudioSource = null;
        
        // Mic audio
        if (stream) {
          var micAudio = stream.getAudioTracks();
          if (micAudio.length > 0) {
            var micStream = new MediaStream(micAudio);
            var micSource = audioContext.createMediaStreamSource(micStream);
            var micGain = audioContext.createGain();
            micGain.gain.value = 1.0;
            micSource.connect(micGain);
            micGain.connect(destination);
            console.log('🎙️ Mic audio connected');
          }
        }
        
        // System audio
        if (displayStream) {
          var sysAudio = displayStream.getAudioTracks();
          if (sysAudio.length > 0) {
            var sysStream = new MediaStream(sysAudio);
            var sysSource = audioContext.createMediaStreamSource(sysStream);
            var sysGain = audioContext.createGain();
            sysGain.gain.value = 0.5;
            sysSource.connect(sysGain);
            sysGain.connect(destination);
            console.log('🖥️ System audio connected');
          }
        }
        
        // Connect voiceover audio to destination
        // Note: createMediaElementSource can only be called ONCE per audio element
        // So we create a fresh audio element if we need to reconnect
        if (useVoiceover && voiceover && voiceover.src && !useTTS) {
          try {
            // Create a fresh audio element to avoid "already connected" errors
            var voiceoverClone = new Audio(voiceover.src);
            voiceoverClone.crossOrigin = 'anonymous';
            voiceoverClone.volume = 1.0;
            
            voiceoverAudioSource = audioContext.createMediaElementSource(voiceoverClone);
            var voiceoverGain = audioContext.createGain();
            voiceoverGain.gain.value = 1.0;
            voiceoverAudioSource.connect(voiceoverGain);
            voiceoverGain.connect(destination);
            voiceoverGain.connect(audioContext.destination); // Also play to speakers
            
            // Replace the global voiceover reference with the clone
            voiceover = voiceoverClone;
            console.log('🎤 Voiceover audio connected to recording');
          } catch(e) {
            console.error('Voiceover source error:', e);
          }
        }
        
        // Connect TTS audio to destination
        if (useTTS && ttsAudio) {
          try {
            // TTS audio is already fresh from generation, just connect it
            ttsAudioSource = audioContext.createMediaElementSource(ttsAudio);
            var ttsGain = audioContext.createGain();
            ttsGain.gain.value = 1.0;
            ttsAudioSource.connect(ttsGain);
            ttsGain.connect(destination);
            ttsGain.connect(audioContext.destination); // Also play to speakers
            console.log('🗣️ TTS audio connected to recording');
          } catch(e) {
            console.error('TTS source error - may already be connected:', e);
            // If already connected, just play it normally (won't be in recording)
          }
        }
        
        // Connect background music to destination
        if (useMusic && bgMusic && bgMusic.src) {
          try {
            // Create a fresh audio element to avoid "already connected" errors
            var musicClone = new Audio(bgMusic.src);
            musicClone.crossOrigin = 'anonymous';
            musicClone.volume = 0.3;
            musicClone.loop = bgMusic.loop;
            
            musicAudioSource = audioContext.createMediaElementSource(musicClone);
            var musicGain = audioContext.createGain();
            musicGain.gain.value = 0.3;
            musicAudioSource.connect(musicGain);
            musicGain.connect(destination);
            musicAudioSource.connect(audioContext.destination); // Also play to speakers
            
            // Replace the global bgMusic reference with the clone
            bgMusic = musicClone;
            console.log('🎵 Music audio connected to recording');
          } catch(e) {
            console.error('Music source error:', e);
          }
        }
        
        audioSourcesConnected = true;
        
        // Combined stream
        var finalTracks = canvasStream.getVideoTracks().concat(destination.stream.getAudioTracks());
        var combinedStream = new MediaStream(finalTracks);
        
        mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
        });
        window.mediaRecorder = mediaRecorder;
        
        mediaRecorder.ondataavailable = function(e) {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        mediaRecorder.onstop = function() {
          console.log('🛑 Recording stopped');
          isRecording = false;
          isCountingDown = false;
          
          // Clear all intervals
          if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
          if (scrollInterval) { clearInterval(scrollInterval); scrollInterval = null; }
          
          // Stop all audio completely and remove event listeners
          stopAllAudio();
          
          // Reset audio sources and TTS for next recording
          voiceoverAudioSource = null;
          ttsAudioSource = null;
          musicAudioSource = null;
          ttsAudio = null; // Clear TTS so a fresh one is generated for next recording
          audioSourcesConnected = false;
          
          // Close audio context to fully disconnect sources
          if (audioContext && audioContext.state !== 'closed') {
            audioContext.close().catch(console.error);
            audioContext = null;
          }
          
          // Stop display stream tracks
          if (displayStream) {
            displayStream.getTracks().forEach(function(t) { t.stop(); });
            displayStream = null;
          }
          
          recIndicator.style.display = 'none';
          audioControlPanel.classList.remove('visible');
          startBtn.style.display = 'none';
          pauseBtn.style.display = 'none';
          stopBtn.style.display = 'none';
          videoNameInput.style.display = '';
          videoNameInput.value = 'recording_' + new Date().toISOString().slice(0, 10);
          videoNameInput.focus();
          saveBtn.style.display = '';
          resetBtn.style.display = '';
          
          status.textContent = 'Recording Complete - Enter name to save';
          status.className = 'status ready';
          
          var blob = new Blob(chunks, { type: 'video/webm' });
          preview.srcObject = null;
          preview.src = URL.createObjectURL(blob);
          preview.controls = true;
          preview.muted = false;
        };
        
        mediaRecorder.start();
        startTime = Date.now();
        
        timerInterval = setInterval(function() {
          if (!isPaused) {
            var elapsed = Math.floor((Date.now() - startTime) / 1000);
            timer.textContent = formatTime(elapsed);
          }
        }, 1000);
        
        // Draw loop
        function drawFrame() {
          ctx.drawImage(screenVideo, 0, 0, 1920, 1080);
          
          // Only draw webcam PIP if camera is on
          if (isCameraOn) {
            var pipWidth = 320;
            var pipHeight = 180;
            var pipX = 1920 - pipWidth - 20;
            var pipY = 1080 - pipHeight - 20;
            
            if (isCameraBlurred) {
              // Apply blur effect to webcam
              ctx.save();
              ctx.filter = 'blur(10px)';
              ctx.drawImage(webcamVideo, pipX, pipY, pipWidth, pipHeight);
              ctx.restore();
            } else {
              ctx.drawImage(webcamVideo, pipX, pipY, pipWidth, pipHeight);
            }
            
            // Draw PIP border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.strokeRect(pipX, pipY, pipWidth, pipHeight);
          } else {
            // Draw logo placeholder instead of webcam
            var pipWidth = 320;
            var pipHeight = 180;
            var pipX = 1920 - pipWidth - 20;
            var pipY = 1080 - pipHeight - 20;
            
            // Draw dark background
            var gradient = ctx.createLinearGradient(pipX, pipY, pipX + pipWidth, pipY + pipHeight);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#2a2a4e');
            ctx.fillStyle = gradient;
            ctx.fillRect(pipX, pipY, pipWidth, pipHeight);
            
            // Draw custom logo if uploaded, otherwise camera icon
            if (customLogoImage && customLogoImage.complete) {
              // Draw the custom logo centered and scaled
              var logoSize = Math.min(pipWidth * 0.6, pipHeight * 0.8);
              var logoX = pipX + (pipWidth - logoSize) / 2;
              var logoY = pipY + (pipHeight - logoSize) / 2;
              ctx.drawImage(customLogoImage, logoX, logoY, logoSize, logoSize);
            } else {
              // Draw default camera icon
              ctx.fillStyle = '#6366f1';
              ctx.font = '48px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🎥', pipX + pipWidth/2, pipY + pipHeight/2);
            }
            
            // Draw border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.strokeRect(pipX, pipY, pipWidth, pipHeight);
          }
          
          if (mediaRecorder.state === 'recording') {
            requestAnimationFrame(drawFrame);
          }
        }
        drawFrame();
        
        // Play audio - IMPORTANT: Only play ONE voiceover source to avoid overlap
        // If TTS is enabled, use that as primary voice. Otherwise use voiceover audio.
        if (useTTS && ttsAudio) {
          ttsAudio.play().catch(console.error);
          // If user also selected voiceover, DON'T play it - TTS takes priority
          console.log('🎤 Playing TTS audio (voiceover disabled to prevent overlap)');
        } else if (useVoiceover && voiceover && voiceover.src) {
          voiceover.play().catch(console.error);
          console.log('🎤 Playing voiceover audio');
        }
        
        // Background music is separate and can play alongside voice
        if (useMusic && bgMusic && bgMusic.src) {
          bgMusic.volume = 0.3;
          bgMusic.play().catch(console.error);
          console.log('🎵 Playing background music');
        }
        
        // Auto-scroll
        scrollInterval = setInterval(function() {
          if (!isPaused) scriptContent.scrollTop += 1;
        }, 100);
        
        showAudioControls(useVoiceover, useTTS, useMusic);
        
        startBtn.style.display = 'none';
        pauseBtn.style.display = '';
        stopBtn.style.display = '';
        recIndicator.style.display = 'flex';
        status.textContent = 'Recording...';
        status.className = 'status recording';
      }
      
      // Show audio controls and enable active tracks
      function showAudioControls(useVoiceover, useTTS, useMusic) {
        voiceoverActive = useVoiceover;
        ttsActive = useTTS;
        musicActive = useMusic;
        
        // Enable voiceover controls
        if (useVoiceover) {
          voiceoverControls.classList.remove('disabled');
          voiceoverControls.classList.add('active');
          voiceoverControls.querySelector('.track-status').textContent = 'Ready';
          voiceoverControls.querySelectorAll('button').forEach(function(btn) { btn.disabled = false; });
        }
        
        // Enable TTS controls
        if (useTTS) {
          ttsControls.classList.remove('disabled');
          ttsControls.classList.add('active');
          ttsControls.querySelector('.track-status').textContent = 'Ready';
          ttsControls.querySelectorAll('button').forEach(function(btn) { btn.disabled = false; });
        }
        
        // Enable music controls
        if (useMusic) {
          musicControls.classList.remove('disabled');
          musicControls.classList.add('active');
          musicControls.querySelector('.track-status').textContent = 'Ready';
          musicControls.querySelectorAll('button').forEach(function(btn) { btn.disabled = false; });
        }
        
        audioControlPanel.classList.add('visible');
        updateAudioProgress();
      }
      
      // Update progress bars and status
      function updateAudioProgress() {
        setInterval(function() {
          // Update voiceover
          if (voiceoverActive && voiceover) {
            if (voiceover.duration) {
              document.getElementById('voProgress').style.width = (voiceover.currentTime / voiceover.duration * 100) + '%';
            }
            updateTrackStatus('voiceoverControls', voiceover);
          }
          // Update TTS
          if (ttsActive && ttsAudio) {
            if (ttsAudio.duration) {
              document.getElementById('ttsProgress').style.width = (ttsAudio.currentTime / ttsAudio.duration * 100) + '%';
            }
            updateTrackStatus('ttsControls', ttsAudio);
          }
          // Update music
          if (musicActive && bgMusic) {
            if (bgMusic.duration) {
              document.getElementById('musicProgress').style.width = (bgMusic.currentTime / bgMusic.duration * 100) + '%';
            }
            updateTrackStatus('musicControls', bgMusic);
          }
        }, 100);
      }
      
      // Update track visual status
      function updateTrackStatus(controlId, audioElement) {
        var control = document.getElementById(controlId);
        var statusEl = control.querySelector('.track-status');
        if (!audioElement) return;
        
        control.classList.remove('playing', 'paused');
        if (!audioElement.paused && !audioElement.ended) {
          control.classList.add('playing');
          if (statusEl) statusEl.textContent = 'Playing';
        } else if (audioElement.paused && audioElement.currentTime > 0) {
          control.classList.add('paused');
          if (statusEl) statusEl.textContent = 'Paused';
        } else {
          if (statusEl) statusEl.textContent = 'Stopped';
        }
      }
      
      // Audio controls with visual feedback - with proper null checks and status updates
      document.getElementById('voRewindBtn').onclick = function() { 
        if (voiceover && voiceover.src) voiceover.currentTime = Math.max(0, voiceover.currentTime - 5); 
      };
      document.getElementById('voPlayPauseBtn').onclick = function() {
        if (!voiceover || !voiceover.src) {
          console.log('⚠️ No voiceover loaded');
          return;
        }
        if (voiceover.paused) { 
          voiceover.play().catch(function(e) { console.error('Voiceover play error:', e); }); 
          this.textContent = '⏸️'; 
        } else { 
          voiceover.pause(); 
          this.textContent = '▶️'; 
        }
      };
      document.getElementById('voStopBtn').onclick = function() { 
        if (voiceover && voiceover.src) { 
          voiceover.pause(); 
          voiceover.currentTime = 0; 
          document.getElementById('voPlayPauseBtn').textContent = '▶️';
        }
      };
      document.getElementById('voForwardBtn').onclick = function() { 
        if (voiceover && voiceover.src) voiceover.currentTime = Math.min(voiceover.duration || 0, voiceover.currentTime + 5); 
      };
      
      document.getElementById('ttsRewindBtn').onclick = function() { 
        if (ttsAudio) ttsAudio.currentTime = Math.max(0, ttsAudio.currentTime - 5); 
      };
      document.getElementById('ttsPlayPauseBtn').onclick = function() {
        if (!ttsAudio) {
          console.log('⚠️ No TTS audio loaded');
          return;
        }
        if (ttsAudio.paused) { 
          ttsAudio.play().catch(function(e) { console.error('TTS play error:', e); }); 
          this.textContent = '⏸️'; 
        } else { 
          ttsAudio.pause(); 
          this.textContent = '▶️'; 
        }
      };
      document.getElementById('ttsStopBtn').onclick = function() { 
        if (ttsAudio) { 
          ttsAudio.pause(); 
          ttsAudio.currentTime = 0; 
          document.getElementById('ttsPlayPauseBtn').textContent = '▶️';
        }
      };
      document.getElementById('ttsForwardBtn').onclick = function() { 
        if (ttsAudio) ttsAudio.currentTime = Math.min(ttsAudio.duration || 0, ttsAudio.currentTime + 5); 
      };
      
      document.getElementById('musicRewindBtn').onclick = function() { 
        if (bgMusic && bgMusic.src) bgMusic.currentTime = Math.max(0, bgMusic.currentTime - 5); 
      };
      document.getElementById('musicPlayPauseBtn').onclick = function() {
        if (!bgMusic || !bgMusic.src) {
          console.log('⚠️ No music loaded');
          return;
        }
        if (bgMusic.paused) { 
          bgMusic.play().catch(function(e) { console.error('Music play error:', e); }); 
          this.textContent = '⏸️'; 
        } else { 
          bgMusic.pause(); 
          this.textContent = '▶️'; 
        }
      };
      document.getElementById('musicStopBtn').onclick = function() { 
        if (bgMusic && bgMusic.src) { 
          bgMusic.pause(); 
          bgMusic.currentTime = 0; 
          document.getElementById('musicPlayPauseBtn').textContent = '▶️';
        }
      };
      document.getElementById('musicVolumeDownBtn').onclick = function() { if (bgMusic) bgMusic.volume = Math.max(0, bgMusic.volume - 0.1); };
      document.getElementById('musicVolumeUpBtn').onclick = function() { if (bgMusic) bgMusic.volume = Math.min(1, bgMusic.volume + 0.1); };
      document.getElementById('musicLoopBtn').onclick = function() {
        if (bgMusic) {
          bgMusic.loop = !bgMusic.loop;
          var loopStatus = document.getElementById('musicLoopStatus');
          if (bgMusic.loop) {
            loopStatus.textContent = '🔁 Loop: ON';
            this.classList.add('active');
          } else {
            loopStatus.textContent = '🔁 Loop: OFF';
            this.classList.remove('active');
          }
          // Sync with sidebar checkbox
          document.getElementById('musicLoopToggle').checked = bgMusic.loop;
        }
      };
      
      document.getElementById('pauseAllAudioBtn').onclick = function() {
        if (voiceover && voiceover.src) { voiceover.pause(); document.getElementById('voPlayPauseBtn').textContent = '▶️'; }
        if (ttsAudio) { ttsAudio.pause(); document.getElementById('ttsPlayPauseBtn').textContent = '▶️'; }
        if (bgMusic && bgMusic.src) { bgMusic.pause(); document.getElementById('musicPlayPauseBtn').textContent = '▶️'; }
      };
      document.getElementById('resumeAllAudioBtn').onclick = function() {
        if (voiceoverActive && voiceover && voiceover.src) { voiceover.play().catch(console.error); document.getElementById('voPlayPauseBtn').textContent = '⏸️'; }
        if (ttsActive && ttsAudio) { ttsAudio.play().catch(console.error); document.getElementById('ttsPlayPauseBtn').textContent = '⏸️'; }
        if (musicActive && bgMusic && bgMusic.src) { bgMusic.play().catch(console.error); document.getElementById('musicPlayPauseBtn').textContent = '⏸️'; }
      };
      document.getElementById('restartAllAudioBtn').onclick = function() {
        if (voiceover && voiceover.src) { voiceover.currentTime = 0; voiceover.play().catch(console.error); document.getElementById('voPlayPauseBtn').textContent = '⏸️'; }
        if (ttsAudio) { ttsAudio.currentTime = 0; ttsAudio.play().catch(console.error); document.getElementById('ttsPlayPauseBtn').textContent = '⏸️'; }
        if (bgMusic && bgMusic.src) { bgMusic.currentTime = 0; bgMusic.play().catch(console.error); document.getElementById('musicPlayPauseBtn').textContent = '⏸️'; }
      };
      
      // Pause/Resume recording - ALSO pause/resume audio
      pauseBtn.onclick = function() {
        if (isPaused) {
          // Resume recording
          if (mediaRecorder && mediaRecorder.state === 'paused') {
            mediaRecorder.resume();
          }
          // Resume audio
          if (ttsActive && ttsAudio) { ttsAudio.play().catch(console.error); }
          if (voiceoverActive && voiceover && voiceover.src) { voiceover.play().catch(console.error); }
          if (musicActive && bgMusic && bgMusic.src) { bgMusic.play().catch(console.error); }
          
          pauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>Pause';
          isPaused = false;
        } else {
          // Pause recording
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.pause();
          }
          // Pause all audio
          if (ttsAudio) { ttsAudio.pause(); }
          if (voiceover) { voiceover.pause(); }
          if (bgMusic) { bgMusic.pause(); }
          
          pauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>Resume';
          isPaused = true;
        }
      };
      
      // Stop recording - with thorough cleanup
      stopBtn.onclick = function() {
        console.log('🛑 Stop button clicked');
        isRecording = false;
        isCountingDown = false;
        
        // Stop all audio immediately
        stopAllAudio();
        
        // Clear intervals
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        if (scrollInterval) { clearInterval(scrollInterval); scrollInterval = null; }
        
        // Stop the recorder
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        
        // Stop camera stream
        if (stream) {
          stream.getTracks().forEach(function(t) { t.stop(); });
        }
        
        // Stop display stream
        if (displayStream) {
          displayStream.getTracks().forEach(function(t) { t.stop(); });
        }
      };
      
      // Save recording to Supabase storage and database
      saveBtn.onclick = async function() {
        var name = videoNameInput.value.trim() || 'recording';
        var blob = new Blob(chunks, { type: 'video/webm' });
        var supabaseUrl = '${config.supabaseUrl}';
        var supabaseKey = '${config.supabaseKey}';
        
        saveBtn.disabled = true;
        saveBtn.textContent = '⏳ Saving...';
        status.textContent = 'Uploading to cloud...';
        
        try {
          // Generate unique filename
          var timestamp = Date.now();
          var safeFileName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
          var storagePath = 'recording_' + timestamp + '_' + safeFileName + '.webm';
          
          // Upload to Supabase Storage
          var uploadResponse = await fetch(supabaseUrl + '/storage/v1/object/generated-videos/' + storagePath, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + supabaseKey,
              'apikey': supabaseKey,
              'Content-Type': 'video/webm',
              'x-upsert': 'true'
            },
            body: blob
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Upload failed: ' + uploadResponse.statusText);
          }
          
          var fileUrl = supabaseUrl + '/storage/v1/object/public/generated-videos/' + storagePath;
          
          // Get current user
          var authResponse = await fetch(supabaseUrl + '/auth/v1/user', {
            headers: {
              'Authorization': 'Bearer ' + supabaseKey,
              'apikey': supabaseKey
            }
          });
          
          var userId = null;
          if (authResponse.ok) {
            var authData = await authResponse.json();
            userId = authData.id;
          }
          
          // Save to generated_media table
          var dbResponse = await fetch(supabaseUrl + '/rest/v1/generated_media', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + supabaseKey,
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              name: name,
              file_type: 'video',
              file_url: fileUrl,
              storage_bucket: 'generated-videos',
              storage_path: storagePath,
              file_size_bytes: blob.size,
              source: 'popout-recording',
              user_id: userId,
              metadata: {
                recordedAt: new Date().toISOString(),
                format: 'webm',
                source: 'popout-studio'
              }
            })
          });
          
          if (!dbResponse.ok) {
            console.error('Database save failed:', await dbResponse.text());
          }
          
          status.textContent = '✅ Saved to cloud!';
          saveBtn.textContent = '✅ Saved!';
          
          // Notify parent window
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'VIDEO_SAVED', name: name, url: fileUrl }, '*');
          }
          
          // Also offer local download
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = name + '.webm';
          a.click();
          
          // Show success modal instead of alert
          showSaveModal('✅ Video Saved Successfully!', 'Your video has been saved to the cloud and downloaded locally.', 'success');
          
        } catch (err) {
          console.error('Save error:', err);
          status.textContent = 'Save failed';
          saveBtn.textContent = '💾 Retry Save';
          saveBtn.disabled = false;
          
          // Fallback to local download
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = name + '.webm';
          a.click();
          showSaveModal('⚠️ Cloud Save Failed', 'Your video was downloaded locally instead. Cloud save encountered an error.', 'warning');
        }
      };
      
      // Show styled modal instead of browser alert
      function showSaveModal(title, message, type) {
        var modalHtml = '<div id="saveResultModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:300;">';
        modalHtml += '<div style="background:#1a1a2e;padding:30px;border-radius:16px;max-width:450px;width:90%;text-align:center;border:1px solid ' + (type === 'success' ? '#22c55e' : '#f59e0b') + ';">';
        modalHtml += '<div style="font-size:48px;margin-bottom:15px;">' + (type === 'success' ? '✅' : '⚠️') + '</div>';
        modalHtml += '<h2 style="margin-bottom:15px;font-size:20px;color:' + (type === 'success' ? '#22c55e' : '#f59e0b') + ';">' + title + '</h2>';
        modalHtml += '<p style="opacity:0.8;margin-bottom:25px;line-height:1.5;">' + message + '</p>';
        modalHtml += '<button id="closeSaveModal" class="primary" style="padding:12px 32px;">OK</button>';
        modalHtml += '</div></div>';
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('closeSaveModal').onclick = function() {
          document.getElementById('saveResultModal').remove();
        };
        
        // Close on click outside
        document.getElementById('saveResultModal').onclick = function(e) {
          if (e.target === this) this.remove();
        };
      }
      
      // Reset
      resetBtn.onclick = function() {
        location.reload();
      };
      
    })();
  `;
}

/**
 * Generate the complete HTML document for the pop-out recording studio
 */
export function generatePopoutHTML(config: PopoutConfig): string {
  const selectedScript = config.scripts.find(s => s.id === config.selectedScriptId);
  const escapedScriptContent = selectedScript ? escapeHtml(selectedScript.content) : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Video Recording Studio</title>
  <style>${generateStyles()}</style>
</head>
<body>
  ${generateBody(config, escapedScriptContent)}
  <script>${generateScript(config)}</script>
</body>
</html>`;
}
