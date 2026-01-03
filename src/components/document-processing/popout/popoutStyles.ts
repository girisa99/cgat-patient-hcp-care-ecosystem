/**
 * Popout Recording Studio - CSS Styles
 * All styles for the recording studio popout window
 */

export function getPopoutStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      color: #ffffff;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      padding: 16px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      margin-bottom: 16px;
    }

    .header h1 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #ffffff;
    }

    .header-badge {
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .close-btn {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    /* Main Content */
    .main-content {
      display: flex;
      gap: 16px;
      flex: 1;
    }

    /* Video Section */
    .video-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .video-container {
      position: relative;
      background: #000;
      border-radius: 16px;
      overflow: hidden;
      aspect-ratio: 16/9;
      min-height: 400px;
    }

    #videoPreview {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scaleX(-1);
    }

    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      color: #888;
      flex-direction: column;
      gap: 12px;
    }

    .video-overlay.hidden {
      display: none;
    }

    .video-overlay .spinner {
      width: 48px;
      height: 48px;
      border: 3px solid rgba(139, 92, 246, 0.3);
      border-top-color: #8b5cf6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Teleprompter */
    .teleprompter {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      max-width: 600px;
      background: rgba(0, 0, 0, 0.75);
      border-radius: 12px;
      padding: 20px;
      max-height: 150px;
      overflow-y: auto;
      display: none;
    }

    .teleprompter.visible {
      display: block;
    }

    .teleprompter-text {
      font-size: 1.5rem;
      line-height: 1.6;
      color: #ffffff;
      text-align: center;
    }

    /* Logo overlay - high z-index to show above screen share and camera */
    .logo-overlay {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      display: none;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      pointer-events: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .logo-overlay.visible {
      display: block !important;
    }

    .logo-overlay img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Logo size variants */
    .logo-overlay.size-small {
      width: 60px;
      height: 60px;
    }

    .logo-overlay.size-medium {
      width: 80px;
      height: 80px;
    }

    .logo-overlay.size-large {
      width: 120px;
      height: 120px;
    }

    /* Logo position variants */
    .logo-overlay.pos-top-left {
      top: 20px;
      left: 20px;
      bottom: auto;
      right: auto;
    }

    .logo-overlay.pos-top-right {
      top: 20px;
      right: 20px;
      bottom: auto;
      left: auto;
    }

    .logo-overlay.pos-bottom-left {
      bottom: 20px;
      left: 20px;
      top: auto;
      right: auto;
    }

    .logo-overlay.pos-bottom-right {
      bottom: 20px;
      right: 20px;
      top: auto;
      left: auto;
    }

    /* Recording indicator */
    .recording-indicator {
      position: absolute;
      top: 20px;
      left: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239, 68, 68, 0.9);
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      display: none;
    }

    .recording-indicator.visible {
      display: flex;
    }

    .recording-indicator .dot {
      width: 10px;
      height: 10px;
      background: #fff;
      border-radius: 50%;
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Video Controls */
    .video-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 20px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
    }

    .control-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .control-btn.toggle-on {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .control-btn.toggle-off {
      background: rgba(107, 114, 128, 0.2);
      color: #9ca3af;
      border: 1px solid rgba(107, 114, 128, 0.3);
    }

    /* Record Button */
    .record-section {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    .record-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 48px;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      font-size: 1.125rem;
      font-weight: 600;
      transition: all 0.3s;
    }

    .record-btn.ready {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #ffffff;
      box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
    }

    .record-btn.ready:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 25px rgba(34, 197, 94, 0.5);
    }

    .record-btn.recording {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #ffffff;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
    }

    .record-btn.disabled {
      background: rgba(107, 114, 128, 0.3);
      color: #6b7280;
      cursor: not-allowed;
    }

    .record-btn .icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }

    .record-btn.ready .icon {
      background: #ffffff;
    }

    .record-btn.recording .icon {
      background: #ffffff;
      border-radius: 4px;
    }

    /* Sidebar */
    .sidebar {
      width: 320px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sidebar-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 16px;
    }

    .sidebar-card h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #a78bfa;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Select Dropdown */
    .custom-select {
      width: 100%;
      padding: 10px 14px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #ffffff;
      font-size: 0.875rem;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
    }

    .custom-select:focus {
      outline: none;
      border-color: #8b5cf6;
    }

    .custom-select option {
      background: #1a1a2e;
      color: #ffffff;
    }

    /* Audio Controls */
    .audio-controls {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .audio-btn {
      flex: 1;
      padding: 8px;
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 6px;
      color: #a78bfa;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s;
    }

    .audio-btn:hover {
      background: rgba(139, 92, 246, 0.3);
    }

    .audio-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Volume Slider */
    .volume-control {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }

    .volume-control label {
      font-size: 0.75rem;
      color: #888;
    }

    .volume-slider {
      flex: 1;
      height: 4px;
      -webkit-appearance: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      outline: none;
    }

    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      background: #8b5cf6;
      border-radius: 50%;
      cursor: pointer;
    }

    /* Info Card */
    .info-card {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      padding: 16px;
    }

    .info-card h4 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #60a5fa;
      margin-bottom: 8px;
    }

    .info-card p {
      font-size: 0.75rem;
      color: #94a3b8;
      line-height: 1.5;
    }

    /* Status Messages */
    .status-message {
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-top: 8px;
    }

    .status-message.error {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }

    .status-message.success {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }

    /* Logo Position Controls */
    .logo-position-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      flex-wrap: wrap;
    }

    .control-label {
      font-size: 0.7rem;
      color: #666;
      margin-left: 8px;
    }

    .control-btn-upload {
      padding: 8px 16px;
      background: rgba(139, 92, 246, 0.2);
      border: 1px dashed rgba(139, 92, 246, 0.4);
      border-radius: 8px;
      color: #a78bfa;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .control-btn-upload:hover {
      background: rgba(139, 92, 246, 0.3);
    }

    /* Sync Section */
    .sync-section {
      padding: 12px 20px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      margin-top: 8px;
    }

    /* Canvas Waveform */
    .waveform-canvas {
      width: 100%;
      height: 60px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
    }

    /* Scrollable Sidebar */
    .sidebar {
      max-height: calc(100vh - 120px);
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
    }

    .sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar::-webkit-scrollbar-thumb {
      background: rgba(139, 92, 246, 0.3);
      border-radius: 3px;
    }

    /* =====================================================
       PHASE 1: NEW ELEMENT STYLES
       ===================================================== */

    /* Countdown Overlay */
    .countdown-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    }

    .countdown-overlay.visible {
      opacity: 1;
      visibility: visible;
    }

    .countdown-number {
      font-size: 8rem;
      font-weight: 700;
      color: #8b5cf6;
      text-shadow: 0 0 40px rgba(139, 92, 246, 0.5);
      animation: countdownPulse 1s ease-in-out infinite;
    }

    .countdown-number.pulse {
      animation: countdownBounce 0.2s ease-out;
    }

    @keyframes countdownPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    @keyframes countdownBounce {
      0% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .countdown-label {
      font-size: 1.5rem;
      color: #a78bfa;
      margin-top: 20px;
    }

    /* Pause Button */
    .pause-btn {
      padding: 12px 24px;
      background: rgba(251, 191, 36, 0.2);
      border: 1px solid rgba(251, 191, 36, 0.4);
      border-radius: 50px;
      color: #fbbf24;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-left: 16px;
      transition: all 0.2s;
    }

    .pause-btn:hover {
      background: rgba(251, 191, 36, 0.3);
    }

    .pause-btn.paused {
      background: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.4);
      color: #22c55e;
    }

    /* Recording indicator paused state */
    .recording-indicator.paused {
      background: rgba(251, 191, 36, 0.9);
    }

    .recording-indicator.paused .dot {
      animation: none;
      background: #fff;
    }

    /* Trim Controls Bar */
    .trim-controls-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 12px;
    }

    .trim-label {
      font-size: 0.75rem;
      color: #888;
    }

    .trim-amount-btn {
      padding: 6px 12px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      color: #f87171;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .trim-amount-btn:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .trim-amount-btn.active {
      background: rgba(239, 68, 68, 0.4);
      border-color: #ef4444;
      color: #fff;
    }

    .undo-trim-btn {
      padding: 6px 12px;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 6px;
      color: #60a5fa;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-left: auto;
    }

    .undo-trim-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .trim-info {
      font-size: 0.7rem;
      color: #666;
    }

    .trim-feedback {
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      background: rgba(239, 68, 68, 0.9);
      color: #fff;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    }

    .trim-feedback.visible {
      opacity: 1;
      visibility: visible;
    }

    /* Edit Panel (shown when paused) */
    .edit-panel {
      padding: 20px;
      background: rgba(251, 191, 36, 0.1);
      border: 1px solid rgba(251, 191, 36, 0.2);
      border-radius: 12px;
      text-align: center;
    }

    .edit-panel h4 {
      color: #fbbf24;
      margin-bottom: 8px;
    }

    .edit-panel p {
      font-size: 0.875rem;
      color: #888;
      margin-bottom: 16px;
    }

    .edit-panel-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .edit-action-btn {
      padding: 10px 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #fff;
      cursor: pointer;
      transition: all 0.2s;
    }

    .edit-action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .edit-action-btn.primary {
      background: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.4);
      color: #22c55e;
    }

    /* Script Actions */
    .script-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .assign-btn, .analyze-btn {
      flex: 1;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .assign-btn {
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #60a5fa;
    }

    .analyze-btn {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .assign-btn:hover { background: rgba(59, 130, 246, 0.3); }
    .analyze-btn:hover { background: rgba(34, 197, 94, 0.3); }

    /* Analysis Panel */
    .analysis-panel {
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    #analysisStatus {
      margin-top: 8px;
      font-size: 0.75rem;
    }

    #analysisStatus .processing { color: #fbbf24; }
    #analysisStatus .success { color: #22c55e; }
    #analysisStatus .error { color: #ef4444; }

    /* Enhanced Downloads Section */
    .enhanced-downloads {
      border: 1px solid rgba(139, 92, 246, 0.3);
      background: rgba(139, 92, 246, 0.05);
    }

    .provider-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .provider-btn {
      flex: 1;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #888;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .provider-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .provider-btn.active {
      background: rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.5);
      color: #a78bfa;
    }

    .provider-name {
      display: block;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .provider-desc {
      font-size: 0.65rem;
      opacity: 0.7;
    }

    .generate-enhanced-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 8px;
    }

    .generate-enhanced-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    }

    .generate-enhanced-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    #voiceGenStatus {
      margin-top: 8px;
      font-size: 0.75rem;
      text-align: center;
    }

    #voiceGenStatus .processing { color: #fbbf24; }
    #voiceGenStatus .success { color: #22c55e; }
    #voiceGenStatus .error { color: #ef4444; }

    .enhanced-download-btns {
      display: flex;
      gap: 6px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .download-btn {
      flex: 1;
      min-width: 60px;
      padding: 8px 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #fff;
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .download-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .download-btn.primary {
      background: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.4);
      color: #22c55e;
    }

    .download-script-btn {
      width: 100%;
      padding: 10px;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 6px;
      color: #60a5fa;
      cursor: pointer;
      margin-top: 12px;
      transition: all 0.2s;
    }

    .download-script-btn:hover {
      background: rgba(59, 130, 246, 0.3);
    }

    /* Audio Options Dialog */
    .audio-options-dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    }

    .audio-options-dialog.visible {
      opacity: 1;
      visibility: visible;
    }

    .dialog-content {
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 16px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
    }

    .dialog-content h3 {
      color: #a78bfa;
      margin-bottom: 12px;
    }

    .dialog-content p {
      color: #888;
      font-size: 0.875rem;
      margin-bottom: 16px;
    }

    .audio-option-row {
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .audio-option-row label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      color: #fff;
    }

    .audio-option-row input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #8b5cf6;
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    .dialog-btn {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .dialog-btn.secondary {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .dialog-btn.primary {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border: none;
      color: #fff;
    }

    .dialog-btn:hover {
      transform: translateY(-2px);
    }

    /* Toast Notifications */
    .enhancement-toast,
    .voice-provider-toast {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      z-index: 1100;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    }

    .enhancement-toast.visible,
    .voice-provider-toast.visible {
      opacity: 1;
      visibility: visible;
    }

    .enhancement-toast.success,
    .voice-provider-toast.success {
      background: rgba(34, 197, 94, 0.9);
      color: #fff;
    }

    .enhancement-toast.warning,
    .voice-provider-toast.warning {
      background: rgba(251, 191, 36, 0.9);
      color: #000;
    }

    .enhancement-toast.error,
    .voice-provider-toast.error {
      background: rgba(239, 68, 68, 0.9);
      color: #fff;
    }

    .enhancement-toast.info,
    .voice-provider-toast.info {
      background: rgba(59, 130, 246, 0.9);
      color: #fff;
    }

    /* Teleprompter Controls */
    .teleprompter-controls {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 8px;
      padding: 8px 12px;
      gap: 8px;
      align-items: center;
      z-index: 20;
    }

    .teleprompter.visible .teleprompter-controls {
      display: flex;
    }

    .teleprompter-control-btn {
      padding: 6px 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: #fff;
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .teleprompter-control-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .teleprompter-control-btn.active {
      background: rgba(139, 92, 246, 0.3);
      border-color: rgba(139, 92, 246, 0.5);
    }

    #scrollSpeedValue {
      color: #a78bfa;
      font-size: 0.75rem;
      min-width: 40px;
      text-align: center;
    }

    /* Sync Active Indicator */
    .sync-active-indicator {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 8px;
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 4px;
      font-size: 0.65rem;
      color: #22c55e;
      display: none;
    }

    .sync-active-indicator.visible {
      display: block;
    }

    /* Reading Cursor */
    .reading-cursor {
      position: absolute;
      left: 0;
      right: 0;
      height: 3px;
      top: 35%;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(139, 92, 246, 0.8) 20%,
        #8b5cf6 50%,
        rgba(139, 92, 246, 0.8) 80%,
        transparent 100%
      );
      pointer-events: none;
      z-index: 10;
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
      display: none;
    }

    .reading-cursor::before,
    .reading-cursor::after {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
    }

    .reading-cursor::before {
      left: 10px;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 8px solid #8b5cf6;
    }

    .reading-cursor::after {
      right: 10px;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-right: 8px solid #8b5cf6;
    }

    /* Audio Panel Tabs */
    .audio-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
    }

    .audio-tab-btn {
      flex: 1;
      padding: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #888;
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .audio-tab-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .audio-tab-btn.active {
      background: rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.4);
      color: #a78bfa;
    }

    .audio-tab-content {
      display: none;
    }

    .audio-tab-content.active {
      display: block;
    }

    /* Panel Waveform */
    .panel-waveform {
      width: 100%;
      height: 40px;
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.3);
      margin-top: 8px;
    }

    /* TTS Panel */
    .tts-panel {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tts-text-input {
      width: 100%;
      height: 80px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 0.875rem;
      resize: none;
    }

    .tts-voice-select {
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #fff;
      font-size: 0.8rem;
    }

    .tts-controls {
      display: flex;
      gap: 6px;
    }

    .tts-generate-btn {
      flex: 2;
      padding: 10px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border: none;
      border-radius: 6px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }

    .tts-play-btn, .tts-stop-btn {
      flex: 1;
      padding: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #fff;
      cursor: pointer;
    }

    .tts-play-btn:disabled, .tts-stop-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tts-status {
      font-size: 0.75rem;
      text-align: center;
      color: #888;
    }

    /* Transcription Result */
    .transcription-result {
      margin-top: 8px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      font-size: 0.8rem;
      color: #888;
      max-height: 100px;
      overflow-y: auto;
      display: none;
    }

    .transcription-result.visible {
      display: block;
    }

    /* Export Panel */
    .export-panel .export-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .export-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .export-option label {
      font-size: 0.75rem;
      color: #888;
    }

    .export-option input[type="number"] {
      width: 60px;
      padding: 6px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: #fff;
      font-size: 0.8rem;
    }

    .format-select {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .format-btn {
      flex: 1;
      padding: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #888;
      cursor: pointer;
      transition: all 0.2s;
    }

    .format-btn.active {
      background: rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.4);
      color: #a78bfa;
    }

    .export-btn-primary {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .export-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
    }

    /* Sync Controls */
    .sync-controls {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .sync-btn {
      flex: 1;
      padding: 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }

    .sync-btn-play {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .sync-btn-stop {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }

    .sync-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #666;
    }

    /* Assignments List */
    .assignments-list {
      max-height: 150px;
      overflow-y: auto;
    }

    .no-assignments {
      font-size: 0.8rem;
      color: #666;
      text-align: center;
      padding: 12px;
    }

    /* Control Button Small */
    .control-btn-small {
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: #fff;
      font-size: 0.65rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .control-btn-small:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .control-btn-small.active {
      background: rgba(139, 92, 246, 0.3);
      border-color: rgba(139, 92, 246, 0.5);
    }

    /* Assignment Toast */
    .assignment-toast {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: rgba(34, 197, 94, 0.9);
      color: #fff;
      border-radius: 8px;
      font-size: 0.875rem;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
      z-index: 1100;
    }

    .assignment-toast.visible {
      opacity: 1;
      visibility: visible;
    }

    /* Trim Controls (sidebar version) */
    .trim-slider-container {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .trim-slider-container label {
      font-size: 0.75rem;
      color: #888;
      min-width: 40px;
    }

    .trim-slider {
      flex: 1;
      height: 4px;
      -webkit-appearance: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }

    .trim-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      background: #ef4444;
      border-radius: 50%;
      cursor: pointer;
    }

    .trim-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .trim-btn {
      flex: 1;
      padding: 8px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      color: #f87171;
      cursor: pointer;
      transition: all 0.2s;
    }

    .trim-btn:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    /* Screen Share Warning Banner */
    .screen-share-warning {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(234, 88, 12, 0.1));
      border: 1px solid rgba(251, 146, 60, 0.4);
      padding: 12px;
      border-radius: 8px;
      animation: pulse-warning 2s ease-in-out infinite;
    }

    @keyframes pulse-warning {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .warning-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .warning-text {
      font-size: 0.75rem;
      color: #fdba74;
      line-height: 1.4;
    }

    .warning-text strong {
      color: #fb923c;
    }

    /* Tip Banner */
    .tip-banner {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.1));
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 12px;
      border-radius: 8px;
    }

    .tip-icon {
      font-size: 1rem;
      flex-shrink: 0;
    }

    .tip-text {
      font-size: 0.75rem;
      color: #94a3b8;
      line-height: 1.4;
    }

    .tip-text strong {
      color: #60a5fa;
    }

    /* Script Version Toggle */
    .script-version-toggle {
      display: flex;
      gap: 4px;
      margin-top: 8px;
      background: rgba(0, 0, 0, 0.2);
      padding: 4px;
      border-radius: 8px;
    }

    .version-btn {
      flex: 1;
      padding: 6px 8px;
      font-size: 0.7rem;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }

    .version-btn:hover:not(:disabled) {
      background: rgba(139, 92, 246, 0.2);
      color: #a78bfa;
    }

    .version-btn.active {
      background: rgba(139, 92, 246, 0.3);
      color: #a78bfa;
      font-weight: 500;
    }

    .version-btn:disabled {
      cursor: not-allowed;
    }

    /* Studio Sound Panel Toggle */
    .studio-sound-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .studio-sound-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-switch {
      position: relative;
      width: 44px;
      height: 24px;
      background: rgba(100, 116, 139, 0.3);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toggle-switch.on {
      background: rgba(34, 197, 94, 0.4);
    }

    .toggle-switch-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: #fff;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .toggle-switch.on .toggle-switch-thumb {
      left: 22px;
    }

    .toggle-label {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .toggle-label.on {
      color: #4ade80;
    }

    /* Studio Sound Card */
    .studio-sound-card {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05));
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    .audio-preset-section {
      margin-bottom: 12px;
    }

    .preset-label {
      display: block;
      font-size: 0.7rem;
      color: #94a3b8;
      margin-bottom: 4px;
    }

    .audio-effects-toggles {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .effect-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 8px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
    }

    .effect-toggle label {
      font-size: 0.7rem;
      color: #94a3b8;
    }

    .mini-toggle {
      width: 32px;
      height: 18px;
      background: rgba(100, 116, 139, 0.3);
      border-radius: 9px;
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
    }

    .mini-toggle::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      background: #fff;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .mini-toggle.on {
      background: rgba(34, 197, 94, 0.5);
    }

    .mini-toggle.on::after {
      left: 16px;
    }
  `;
}
