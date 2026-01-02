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

    /* Logo overlay */
    .logo-overlay {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      display: none;
    }

    .logo-overlay.visible {
      display: block;
    }

    .logo-overlay img {
      width: 100%;
      height: 100%;
      object-fit: contain;
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
  `;
}
