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
    .camera-off-overlay.screen-active {
      background: transparent;
      pointer-events: none;
    }
    .camera-off-overlay.screen-active .logo-placeholder,
    .camera-off-overlay.screen-active .camera-off-text,
    .camera-off-overlay.screen-active .upload-logo-btn {
      display: none;
    }
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
      cursor: grab;
      user-select: none;
      touch-action: none;
      position: relative;
    }
    .logo-placeholder.dragging { cursor: grabbing; transform: scale(1.05); }
    .logo-placeholder.positioned { 
      position: absolute; 
      margin-bottom: 0;
    }
    .logo-placeholder img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
    .drag-hint {
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      opacity: 0.6;
      white-space: nowrap;
      background: rgba(0,0,0,0.6);
      padding: 4px 8px;
      border-radius: 4px;
    }
    .screen-share-indicator {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(34, 197, 94, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      z-index: 30;
      display: none;
      animation: pulse 2s infinite;
    }
    .screen-share-indicator.visible { display: flex; align-items: center; gap: 8px; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
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
      overflow: visible;
      border: 3px solid #333;
      background: #000;
      z-index: 100;
      cursor: grab;
      user-select: none;
      touch-action: none;
    }
    .webcam-pip.dragging { cursor: grabbing; z-index: 200; }
    .webcam-pip.hidden { display: none; }
    .webcam-pip.blurred video { filter: blur(10px); }
    .webcam-pip video { width: 100%; height: 100%; object-fit: cover; pointer-events: none; border-radius: 9px; }
    .webcam-pip .pip-logo {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e, #2a2a4e);
      border-radius: 9px;
    }
    .webcam-pip .pip-logo img {
      max-width: 80%;
      max-height: 80%;
      object-fit: contain;
      border-radius: 8px;
    }
    .webcam-pip .pip-logo .default-icon {
      font-size: 48px;
    }
    .pip-controls {
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      background: rgba(0,0,0,0.9);
      padding: 6px 10px;
      border-radius: 8px;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
    .webcam-pip:hover .pip-controls { opacity: 1; pointer-events: auto; }
    .pip-controls button {
      padding: 4px 8px;
      font-size: 10px;
      min-width: auto;
      background: #334155;
      border: 1px solid #475569;
    }
    .pip-controls button:hover { background: #475569; }
    .pip-controls button.active { background: #6366f1; border-color: #6366f1; }
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
    
    /* Pause edit panel styles */
    .pause-edit-panel {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 150;
      border: 1px solid #475569;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      min-width: 380px;
    }
    .pause-edit-panel.hidden { display: none; }
    .pause-edit-panel .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .pause-edit-panel h4 {
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
    .pause-edit-panel .close-panel-btn {
      padding: 4px 8px;
      font-size: 16px;
      background: transparent;
      border: 1px solid #475569;
      cursor: pointer;
      min-width: auto;
      line-height: 1;
    }
    .pause-edit-panel .close-panel-btn:hover { background: #475569; }
    .pause-edit-panel .trim-controls {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .pause-edit-panel .trim-btn {
      padding: 8px 12px;
      font-size: 12px;
      background: #334155;
      border: 2px solid #475569;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pause-edit-panel .trim-btn:hover { background: #475569; border-color: #6366f1; }
    .pause-edit-panel .trim-btn.selected { 
      background: #dc2626; 
      border-color: #dc2626; 
      transform: scale(1.05);
      box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
    }
    .pause-edit-panel .trim-btn.active { background: #22c55e; border-color: #22c55e; }
    .pause-edit-panel .transcribe-btn {
      padding: 10px 16px;
      font-size: 13px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pause-edit-panel .transcribe-btn:hover { opacity: 0.9; }
    .pause-edit-panel .transcribe-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .pause-edit-panel .trim-info {
      font-size: 11px;
      opacity: 0.7;
      text-align: center;
    }
    
    /* Caption overlay styles */
    .caption-overlay {
      position: absolute;
      bottom: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 18px;
      max-width: 80%;
      text-align: center;
      z-index: 50;
      line-height: 1.4;
      font-weight: 500;
    }
    .caption-overlay.hidden { display: none; }
    .caption-toggle {
      position: absolute;
      bottom: 15px;
      right: 240px;
      padding: 6px 12px;
      font-size: 11px;
      background: rgba(0,0,0,0.7);
      border: 1px solid #444;
      cursor: pointer;
      z-index: 20;
    }
    .caption-toggle.active { background: #6366f1; border-color: #6366f1; }
    
    /* Teleprompter Speed Controls */
    .teleprompter-speed-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(30, 41, 59, 0.8);
      border-radius: 8px;
      margin-bottom: 8px;
      border: 1px solid #475569;
    }
    .teleprompter-speed-controls.hidden { display: none; }
    .teleprompter-speed-controls .speed-label {
      font-size: 11px;
      opacity: 0.7;
      min-width: 50px;
    }
    .teleprompter-speed-controls .speed-btn {
      padding: 4px 10px;
      font-size: 14px;
      background: #334155;
      border: 1px solid #475569;
      cursor: pointer;
      min-width: 32px;
    }
    .teleprompter-speed-controls .speed-btn:hover { background: #475569; }
    .teleprompter-speed-controls .speed-value {
      font-size: 12px;
      font-weight: 600;
      min-width: 45px;
      text-align: center;
      color: #6366f1;
    }
    .teleprompter-speed-controls .speed-preset {
      padding: 3px 8px;
      font-size: 10px;
      background: #334155;
      border: 1px solid #475569;
      cursor: pointer;
    }
    .teleprompter-speed-controls .speed-preset:hover { background: #475569; }
    .teleprompter-speed-controls .speed-preset.active { background: #6366f1; border-color: #6366f1; }
    
    /* Reading Cursor/Highlight */
    .reading-cursor {
      position: absolute;
      left: 0;
      right: 0;
      height: 32px;
      background: linear-gradient(to bottom, 
        rgba(99, 102, 241, 0.0) 0%, 
        rgba(99, 102, 241, 0.15) 30%, 
        rgba(99, 102, 241, 0.25) 50%, 
        rgba(99, 102, 241, 0.15) 70%, 
        rgba(99, 102, 241, 0.0) 100%);
      pointer-events: none;
      z-index: 10;
      transition: top 0.15s ease-out;
      border-left: 3px solid #6366f1;
    }
    .reading-cursor::before {
      content: '▶';
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 10px;
      color: #6366f1;
      opacity: 0.8;
    }
    .script-content.cursor-active {
      position: relative;
    }
    
    /* Current word highlight */
    .word-highlight {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.5) 0%, rgba(139, 92, 246, 0.4) 100%);
      border-radius: 3px;
      padding: 2px 4px;
      margin: 0 -2px;
      box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
      color: #fff;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    
    /* Script word for tracking */
    .script-word {
      transition: background 0.1s ease;
    }
    
    /* Script Analysis & Segment Styles */
    .script-segment {
      padding: 12px;
      margin: 8px 0;
      border-radius: 8px;
      border-left: 4px solid #475569;
      background: rgba(30, 41, 59, 0.4);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .script-segment:hover { background: rgba(30, 41, 59, 0.6); }
    .script-segment.active { 
      background: rgba(99, 102, 241, 0.2); 
      border-left-color: #6366f1;
    }
    .script-segment.intro { border-left-color: #22c55e; }
    .script-segment.demo { border-left-color: #f59e0b; }
    .script-segment.transition { border-left-color: #8b5cf6; }
    .script-segment.closing { border-left-color: #ec4899; }
    .script-segment .segment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .script-segment .segment-type {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
      background: #475569;
      text-transform: uppercase;
      font-weight: 600;
    }
    .script-segment.intro .segment-type { background: #22c55e; color: #000; }
    .script-segment.demo .segment-type { background: #f59e0b; color: #000; }
    .script-segment.transition .segment-type { background: #8b5cf6; }
    .script-segment.closing .segment-type { background: #ec4899; }
    .script-segment .segment-duration {
      font-size: 11px;
      opacity: 0.7;
    }
    .script-segment .segment-text {
      font-size: 16px;
      line-height: 1.8;
    }
    .script-segment .pause-marker {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      padding: 6px 10px;
      background: rgba(245, 158, 11, 0.2);
      border-radius: 6px;
      font-size: 12px;
      color: #fbbf24;
    }
    .script-segment .tone-markers {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-top: 6px;
    }
    .script-segment .tone-marker {
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(99, 102, 241, 0.3);
    }
    .script-segment .engagement-tip {
      font-size: 11px;
      opacity: 0.8;
      font-style: italic;
      margin-top: 6px;
      padding-left: 10px;
      border-left: 2px solid #6366f1;
    }
    
    /* Analysis Panel Styles */
    .analysis-panel {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
      border: 1px solid #6366f1;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 10px;
      max-height: 60vh;
      overflow-y: auto;
    }
    .analysis-panel h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .analysis-panel .score-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .analysis-panel .score-badge.good { background: #22c55e; color: #000; }
    .analysis-panel .score-badge.medium { background: #f59e0b; color: #000; }
    .analysis-panel .score-badge.low { background: #ef4444; }
    .analysis-panel .recommendation {
      font-size: 12px;
      padding: 6px 10px;
      background: rgba(30, 41, 59, 0.6);
      border-radius: 6px;
      margin-top: 6px;
    }
    .analysis-panel .tone-guide {
      font-size: 12px;
      opacity: 0.9;
      font-style: italic;
      margin-top: 8px;
    }
    .analysis-panel .action-btns {
      display: flex;
      gap: 6px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .analysis-panel .action-btn {
      padding: 6px 10px;
      font-size: 11px;
      border-radius: 6px;
      cursor: pointer;
      background: #334155;
      border: 1px solid #475569;
      transition: all 0.2s ease;
    }
    .analysis-panel .action-btn:hover { background: #475569; }
    .analysis-panel .action-btn.active { background: #6366f1; border-color: #6366f1; }
    .analysis-panel .pause-points-list {
      max-height: 200px;
      overflow-y: auto;
      margin-top: 8px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 8px;
      padding: 8px;
    }
    .analysis-panel .pause-point-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      margin: 4px 0;
      background: rgba(245, 158, 11, 0.15);
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .analysis-panel .pause-point-item:hover { background: rgba(245, 158, 11, 0.3); }
    .analysis-panel .pause-point-item .pp-position {
      padding: 2px 6px;
      background: #f59e0b;
      color: #000;
      border-radius: 4px;
      font-weight: 600;
      font-size: 10px;
    }
    .analysis-panel .pause-point-item .pp-reason { flex: 1; }
    .analysis-panel .pause-point-item .pp-duration {
      opacity: 0.7;
      font-size: 10px;
    }
    .analysis-panel .review-panel {
      margin-top: 10px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid #6366f1;
      border-radius: 8px;
      padding: 12px;
    }
    .analysis-panel .review-panel h5 {
      margin: 0 0 8px 0;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .analysis-panel .change-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px;
      margin: 6px 0;
      background: rgba(30, 41, 59, 0.6);
      border-radius: 6px;
      border-left: 3px solid #8b5cf6;
    }
    .analysis-panel .change-item .change-type {
      font-size: 10px;
      text-transform: uppercase;
      color: #8b5cf6;
      font-weight: 600;
    }
    .analysis-panel .change-item .change-text {
      font-size: 12px;
    }
    .analysis-panel .change-item .change-actions {
      display: flex;
      gap: 4px;
      margin-top: 4px;
    }
    .analysis-panel .change-item .change-btn {
      padding: 4px 8px;
      font-size: 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .analysis-panel .change-item .change-btn.accept {
      background: #22c55e;
      border: none;
      color: #000;
    }
    .analysis-panel .change-item .change-btn.reject {
      background: #ef4444;
      border: none;
    }
    .analysis-panel .apply-all-btn {
      width: 100%;
      padding: 8px;
      margin-top: 8px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    .analysis-panel .apply-all-btn:hover { opacity: 0.9; }
    /* Inline pause markers in script */
    .inline-pause-marker {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      margin: 0 4px;
      background: rgba(245, 158, 11, 0.3);
      border: 1px dashed #f59e0b;
      border-radius: 12px;
      font-size: 11px;
      color: #fbbf24;
      cursor: pointer;
      vertical-align: middle;
    }
    .inline-pause-marker:hover { background: rgba(245, 158, 11, 0.5); }
    .inline-pause-marker.highlighted {
      background: rgba(245, 158, 11, 0.6);
      animation: pulse-pause 1s ease-in-out;
    }
    @keyframes pulse-pause {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    /* Inline change markers for accept/skip flow */
    .inline-change-marker {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      margin: 0 4px;
      border-radius: 12px;
      font-size: 11px;
      cursor: pointer;
      vertical-align: middle;
      transition: all 0.2s ease;
    }
    .inline-change-marker .marker-icon {
      width: 14px;
      height: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 9px;
    }
    .inline-change-marker.pending {
      background: rgba(245, 158, 11, 0.3);
      border: 1px dashed #f59e0b;
      color: #fbbf24;
    }
    .inline-change-marker.pending .marker-icon {
      background: #f59e0b;
      color: #000;
    }
    .inline-change-marker.pending:hover {
      background: rgba(245, 158, 11, 0.5);
      transform: scale(1.05);
    }
    .inline-change-marker.accepted {
      background: rgba(34, 197, 94, 0.3);
      border: 1px solid #22c55e;
      color: #22c55e;
    }
    .inline-change-marker.accepted .marker-icon {
      background: #22c55e;
      color: #000;
    }
    .inline-change-marker.rejected {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      color: #ef4444;
      opacity: 0.5;
      text-decoration: line-through;
    }
    .inline-change-marker.rejected .marker-icon {
      background: #ef4444;
      color: #fff;
    }
    
    /* Pause Insert Resume Panel */
    .pause-insert-panel {
      background: rgba(15, 23, 42, 0.95);
      border: 2px solid #f59e0b;
      border-radius: 12px;
      padding: 16px;
      margin-top: 10px;
    }
    .pause-insert-panel .insert-mode-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .pause-insert-panel .mode-btn {
      flex: 1;
      padding: 10px;
      font-size: 12px;
      border: 2px solid #475569;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pause-insert-panel .mode-btn:hover { border-color: #6366f1; }
    .pause-insert-panel .mode-btn.active { 
      border-color: #f59e0b; 
      background: rgba(245, 158, 11, 0.2);
    }
    .pause-insert-panel .current-segment {
      background: rgba(30, 41, 59, 0.6);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 12px;
    }
    .pause-insert-panel .current-segment h5 {
      margin: 0 0 6px 0;
      font-size: 12px;
      opacity: 0.7;
    }
    .pause-insert-panel .segment-nav {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }
    .pause-insert-panel .nav-btn {
      padding: 6px 12px;
      font-size: 11px;
      background: #334155;
      border: 1px solid #475569;
      cursor: pointer;
    }
    .pause-insert-panel .nav-btn:hover { background: #475569; }
    .pause-insert-panel .resume-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .pause-insert-panel .resume-btn {
      padding: 10px 16px;
      font-size: 12px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pause-insert-panel .resume-btn.continue {
      background: #22c55e;
      border: none;
    }
    .pause-insert-panel .resume-btn.restart-segment {
      background: #f59e0b;
      border: none;
      color: #000;
    }
    .pause-insert-panel .resume-btn.skip-ahead {
      background: #6366f1;
      border: none;
    }
    
    /* Analyze Script Button */
    .analyze-script-btn {
      padding: 8px 12px;
      font-size: 11px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .analyze-script-btn:hover { opacity: 0.9; }
    .analyze-script-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .analyze-script-btn.loading::after {
      content: '';
      width: 12px;
      height: 12px;
      border: 2px solid #fff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-left: 6px;
    }
    
    .sidebar { width: 350px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
    .panel {
      background: #1a1a2e;
      border-radius: 12px;
      padding: 15px;
      flex-shrink: 0;
    }
    .panel.teleprompter {
      flex: 1;
      overflow-y: hidden;
      display: flex;
      flex-direction: column;
    }
    .panel h3 { font-size: 14px; margin-bottom: 10px; opacity: 0.8; display: flex; align-items: center; gap: 6px; }
    .script-content {
      font-size: 18px;
      line-height: 2;
      white-space: pre-wrap;
      overflow-y: auto;
      flex: 1;
      height: 0;
      min-height: 200px;
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
          
          <!-- Screen share indicator -->
          <div id="screenShareIndicator" class="screen-share-indicator">
            <span>🖥️</span>
            <span>Screen is being captured</span>
          </div>
          
          <!-- Camera off overlay with logo -->
          <div id="cameraOffOverlay" class="camera-off-overlay">
            <div id="logoPlaceholder" class="logo-placeholder">
              🎥
              <span class="drag-hint">Drag to position</span>
            </div>
            <p class="camera-off-text">Camera is off</p>
            <input type="file" id="logoUploadInput" accept="image/*" style="display:none;">
            <button id="uploadLogoBtn" class="upload-logo-btn">📷 Upload Logo</button>
          </div>
          
          <!-- Camera controls -->
          <div class="camera-controls">
            <button id="cameraToggleBtn" class="active" title="Toggle Camera (stops camera when off)">📹 On</button>
            <button id="cameraBlurBtn" title="Background Blur (softens entire webcam)">🔵 BG Blur</button>
            <button id="useLogoBtn" title="Use logo/avatar instead of camera">🖼️ Use Logo</button>
          </div>
          
          <!-- Draggable PIP overlay for camera/logo during recording -->
          <div id="pipOverlay" class="webcam-pip hidden">
            <div class="pip-controls">
              <button id="pipCameraBtn" class="active" title="Show Camera">📹</button>
              <button id="pipLogoBtn" title="Show Logo">🖼️</button>
              <button id="pipHideBtn" title="Hide PIP">👁️‍🗨️</button>
            </div>
            <video id="pipVideo" autoplay playsinline muted></video>
            <div id="pipLogoContainer" class="pip-logo" style="display:none;">
              <span class="default-icon">🎥</span>
            </div>
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
          
          <!-- Caption overlay for transcription -->
          <div id="captionOverlay" class="caption-overlay hidden"></div>
          <button id="captionToggleBtn" class="caption-toggle" style="display:none;">CC Off</button>
          
          <!-- Pause edit panel -->
          <div id="pauseEditPanel" class="pause-edit-panel hidden">
            <div class="panel-header">
              <h4>✏️ Edit While Paused</h4>
              <button id="closePausePanel" class="close-panel-btn" title="Close panel">✕</button>
            </div>
            <div class="trim-controls">
              <button id="trimLast5Btn" class="trim-btn" title="Remove last 5 seconds">✂️ Trim 5s</button>
              <button id="trimLast10Btn" class="trim-btn" title="Remove last 10 seconds">✂️ Trim 10s</button>
              <button id="trimLast30Btn" class="trim-btn" title="Remove last 30 seconds">✂️ Trim 30s</button>
              <button id="undoTrimBtn" class="trim-btn" title="Undo last trim" style="display:none;">↩️ Undo</button>
            </div>
            <div class="trim-info" id="trimInfo">Recording duration: 00:00</div>
            <button id="transcribeBtn" class="transcribe-btn" title="Transcribe current recording with AI">
              🎙️ Transcribe Recording
            </button>
            <div id="transcriptionStatus" class="trim-info" style="display:none;">Transcribing...</div>
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
              <button id="analyzeScriptBtn" class="analyze-script-btn" title="Analyze script for engagement tips">✨ Analyze</button>
              <button id="toggleSegmentViewBtn" style="padding:4px 8px;font-size:12px;" title="Toggle segment view">📊</button>
              <button id="scrollUpBtn" style="padding:4px 8px;font-size:12px;" title="Scroll Up">▲</button>
              <button id="scrollDownBtn" style="padding:4px 8px;font-size:12px;" title="Scroll Down">▼</button>
              <button id="scrollResetBtn" style="padding:4px 8px;font-size:12px;" title="Reset">⟲</button>
            </div>
          </div>
          
          <!-- Analysis Results Panel (hidden by default) -->
          <div id="analysisPanel" class="analysis-panel" style="display:none;">
            <h4>✨ Script Analysis <span id="analysisScore" class="score-badge"></span></h4>
            <div id="analysisToneGuide" class="tone-guide"></div>
            <div id="analysisRecommendations"></div>
            <div style="margin-top:8px;display:flex;gap:6px;">
              <span id="analysisDuration" style="font-size:11px;opacity:0.7;"></span>
              <span id="analysisPauseCount" style="font-size:11px;opacity:0.7;cursor:pointer;" title="Click to view pause points">⏸️ 0 pause points</span>
            </div>
            
            <!-- Action buttons -->
            <div class="action-btns">
              <button id="viewPausePointsBtn" class="action-btn" title="View all pause point locations">📍 View Pause Points</button>
              <button id="reviewChangesBtn" class="action-btn" title="Review suggested improvements">✏️ Review Changes</button>
              <button id="showInlineMarkersBtn" class="action-btn" title="Show pause markers in script">🔖 Show Markers</button>
            </div>
            
            <!-- Pause Points List (expandable) -->
            <div id="pausePointsList" class="pause-points-list" style="display:none;"></div>
            
            <!-- Review & Apply Changes Panel -->
            <div id="reviewChangesPanel" class="review-panel" style="display:none;">
              <h5>✏️ Suggested Improvements</h5>
              <div id="changesList"></div>
              <button id="applyAllChangesBtn" class="apply-all-btn">✅ Apply All Changes to Script</button>
              
              <!-- Enhanced Downloads Section -->
              <div id="enhancedDownloadsSection" style="display:none;margin-top:12px;padding:12px;background:rgba(34,197,94,0.15);border-radius:8px;border:1px solid rgba(34,197,94,0.3);">
                <h5 style="margin:0 0 8px 0;font-size:12px;display:flex;align-items:center;gap:6px;">💾 Enhanced Content Downloads</h5>
                
                <!-- Voice Selection for Enhanced Audio -->
                <div style="margin-bottom:10px;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;">
                  <label style="display:block;font-size:11px;margin-bottom:4px;opacity:0.8;">🎤 Select Voice for Audio:</label>
                  <div style="display:flex;gap:6px;margin-bottom:6px;">
                    <select id="enhancedTtsProvider" style="flex:1;padding:6px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.3);color:#fff;font-size:11px;">
                      <option value="openai">OpenAI TTS</option>
                      <option value="elevenlabs">ElevenLabs</option>
                    </select>
                  </div>
                  <select id="enhancedVoiceSelect" style="width:100%;padding:6px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.3);color:#fff;font-size:11px;">
                    <optgroup label="OpenAI Voices" id="openaiVoicesGroup">
                      <option value="alloy" selected>Alloy (Neutral)</option>
                      <option value="echo">Echo (Male)</option>
                      <option value="fable">Fable (British)</option>
                      <option value="onyx">Onyx (Deep Male)</option>
                      <option value="nova">Nova (Female)</option>
                      <option value="shimmer">Shimmer (Soft Female)</option>
                    </optgroup>
                    <optgroup label="ElevenLabs Voices" id="elevenlabsVoicesGroup" style="display:none;">
                      <option value="EXAVITQu4vr4xnSDxMaL">Sarah</option>
                      <option value="JBFqnCBsd6RMkjVDRZzb">George</option>
                      <option value="TX3LPaxmHKxFdv7VOQHJ">Liam</option>
                      <option value="XrExE9yKIg1WjnnlVkGX">Matilda</option>
                      <option value="pFZP5JQG7iQjIQuC4Bku">Lily</option>
                      <option value="onwK4e9ZLuTAKqWW03F9">Daniel</option>
                      <option value="cgSgspJ2msm6clMCkdW9">Jessica</option>
                      <option value="iP95p4xoKVk53GoZ742B">Chris</option>
                      <option value="nPczCjzI2devNBz1zQrb">Brian</option>
                      <option value="CwhRBWXzGAHq8TQ4Fs17">Roger</option>
                    </optgroup>
                  </select>
                </div>
                
                <div style="display:flex;flex-direction:column;gap:6px;">
                  <button id="downloadEnhancedAudioBtn" class="action-btn" style="background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;display:flex;align-items:center;gap:6px;justify-content:center;">
                    🎧 Generate & Download Enhanced Audio (MP3)
                  </button>
                  <button id="downloadEnhancedTranscriptBtn" class="action-btn" style="display:flex;align-items:center;gap:6px;justify-content:center;">
                    📄 Download Enhanced Transcript (TXT)
                  </button>
                  <button id="downloadOriginalTranscriptBtn" class="action-btn" style="display:flex;align-items:center;gap:6px;justify-content:center;">
                    📄 Download Original Transcript (TXT)
                  </button>
                </div>
                <div id="enhancedAudioProgress" style="display:none;margin-top:8px;font-size:11px;opacity:0.8;"></div>
              </div>
            </div>
          </div>
          
          <!-- Pause Insert Resume Panel (shown when paused with script) -->
          <div id="pauseInsertPanel" class="pause-insert-panel" style="display:none;">
            <div class="insert-mode-toggle">
              <button id="modeDemoBtn" class="mode-btn active" title="Insert demo/walkthrough">🖥️ Demo Mode</button>
              <button id="modeSilentBtn" class="mode-btn" title="Silent recording continues">🔇 Silent</button>
              <button id="modeSkipBtn" class="mode-btn" title="Skip to next segment">⏭️ Skip</button>
            </div>
            <div class="current-segment">
              <h5>📍 Current Position</h5>
              <div id="currentSegmentInfo">Segment 1 of 1</div>
              <div class="segment-nav">
                <button id="prevSegmentBtn" class="nav-btn">◀ Previous</button>
                <button id="jumpToSegmentBtn" class="nav-btn">📌 Jump to...</button>
                <button id="nextSegmentBtn" class="nav-btn">Next ▶</button>
              </div>
            </div>
            <div class="resume-options">
              <button id="resumeContinueBtn" class="resume-btn continue">▶️ Continue Recording</button>
              <button id="resumeRestartSegmentBtn" class="resume-btn restart-segment">🔄 Restart Segment</button>
              <button id="resumeSkipAheadBtn" class="resume-btn skip-ahead">⏭️ Skip to Next</button>
            </div>
          </div>
          
          <!-- Teleprompter Speed Controls (shown during recording) -->
          <div id="speedControls" class="teleprompter-speed-controls hidden">
            <span class="speed-label">📜 Speed:</span>
            <button id="speedDownBtn" class="speed-btn" title="Slow down">−</button>
            <span id="speedValue" class="speed-value">1.0x</span>
            <button id="speedUpBtn" class="speed-btn" title="Speed up">+</button>
            <div style="display:flex;gap:4px;margin-left:8px;">
              <button id="speedPreset05" class="speed-preset" title="0.5x speed">0.5x</button>
              <button id="speedPreset10" class="speed-preset active" title="1x speed (normal)">1x</button>
              <button id="speedPreset15" class="speed-preset" title="1.5x speed">1.5x</button>
              <button id="speedPreset20" class="speed-preset" title="2x speed">2x</button>
            </div>
          </div>
          
          <div id="scriptContent" class="script-content">
            <div id="readingCursor" class="reading-cursor" style="display:none;"></div>
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
      var pausedTime = 0; // Track total paused time
      var pauseStartTime = 0; // Track when pause started
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
      var audioProgressInterval = null; // Track the progress interval to avoid duplicates
      var voiceoverClone = null; // Track cloned audio elements
      var musicClone = null;
      var animationFrameId = null; // Track animation frame for cleanup
      var isSaving = false; // Prevent multiple saves and accidental restarts
      var isStopped = false; // Guard flag to prevent audio restart after stop
      
      // Word-level tracking for cursor sync
      var scriptWords = []; // Array of word objects with positions
      var currentWordIndex = 0;
      var wordHighlightInterval = null;
      var estimatedWPM = 150; // Words per minute for TTS (adjustable)
      var recordedMimeType = 'video/webm'; // Track the mime type used for recording
      
      // Trim and transcription state
      var trimmedChunks = []; // Stack to store trimmed chunks for undo
      var transcriptText = ''; // Stored transcription text
      var captionsEnabled = false; // Caption display toggle
      var isTranscribing = false; // Transcription in progress
      
      // Script analysis and segment state
      var scriptAnalysis = null; // Stores AI analysis results
      var currentSegmentIndex = 0; // Current segment during recording
      var isSegmentViewEnabled = false; // Toggle between plain text and segment view
      var insertMode = 'demo'; // 'demo', 'silent', 'skip'
      var isAnalyzing = false; // Analysis in progress
      
      // Teleprompter speed and cursor state
      var teleprompterSpeedMultiplier = 1.0; // User-adjustable speed multiplier
      var baseScrollSpeed = 2; // Base pixels per interval at 1.0x speed
      var readingCursorEnabled = true; // Show reading cursor during playback
      var currentScrollPixelsPerInterval = 2; // Current calculated speed
      
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
      
      // Initially hide audio control panel until recording starts
      audioControlPanel.style.display = 'none';
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
      var screenShareIndicator = document.getElementById('screenShareIndicator');
      
      // Pause edit panel elements
      var pauseEditPanel = document.getElementById('pauseEditPanel');
      var trimLast5Btn = document.getElementById('trimLast5Btn');
      var trimLast10Btn = document.getElementById('trimLast10Btn');
      var trimLast30Btn = document.getElementById('trimLast30Btn');
      var undoTrimBtn = document.getElementById('undoTrimBtn');
      var trimInfo = document.getElementById('trimInfo');
      var transcribeBtn = document.getElementById('transcribeBtn');
      var transcriptionStatus = document.getElementById('transcriptionStatus');
      var captionOverlay = document.getElementById('captionOverlay');
      var captionToggleBtn = document.getElementById('captionToggleBtn');
      
      // Script analysis elements
      var analyzeScriptBtn = document.getElementById('analyzeScriptBtn');
      var toggleSegmentViewBtn = document.getElementById('toggleSegmentViewBtn');
      var analysisPanel = document.getElementById('analysisPanel');
      var analysisScore = document.getElementById('analysisScore');
      var analysisToneGuide = document.getElementById('analysisToneGuide');
      var analysisRecommendations = document.getElementById('analysisRecommendations');
      var analysisDuration = document.getElementById('analysisDuration');
      var analysisPauseCount = document.getElementById('analysisPauseCount');
      var viewPausePointsBtn = document.getElementById('viewPausePointsBtn');
      var reviewChangesBtn = document.getElementById('reviewChangesBtn');
      var showInlineMarkersBtn = document.getElementById('showInlineMarkersBtn');
      var pausePointsList = document.getElementById('pausePointsList');
      var reviewChangesPanel = document.getElementById('reviewChangesPanel');
      var changesList = document.getElementById('changesList');
      var applyAllChangesBtn = document.getElementById('applyAllChangesBtn');
      var inlineMarkersEnabled = false;
      var pendingChanges = [];
      
      // Pause insert resume elements
      var pauseInsertPanel = document.getElementById('pauseInsertPanel');
      var modeDemoBtn = document.getElementById('modeDemoBtn');
      var modeSilentBtn = document.getElementById('modeSilentBtn');
      var modeSkipBtn = document.getElementById('modeSkipBtn');
      var currentSegmentInfo = document.getElementById('currentSegmentInfo');
      var prevSegmentBtn = document.getElementById('prevSegmentBtn');
      var nextSegmentBtn = document.getElementById('nextSegmentBtn');
      var jumpToSegmentBtn = document.getElementById('jumpToSegmentBtn');
      var resumeContinueBtn = document.getElementById('resumeContinueBtn');
      var resumeRestartSegmentBtn = document.getElementById('resumeRestartSegmentBtn');
      var resumeSkipAheadBtn = document.getElementById('resumeSkipAheadBtn');
      
      // Speed controls elements
      var speedControls = document.getElementById('speedControls');
      var speedDownBtn = document.getElementById('speedDownBtn');
      var speedUpBtn = document.getElementById('speedUpBtn');
      var speedValue = document.getElementById('speedValue');
      var speedPreset05 = document.getElementById('speedPreset05');
      var speedPreset10 = document.getElementById('speedPreset10');
      var speedPreset15 = document.getElementById('speedPreset15');
      var speedPreset20 = document.getElementById('speedPreset20');
      var readingCursor = document.getElementById('readingCursor');
      
      // =====================================================
      // Custom Modal Helper Functions (to keep modals within popout)
      // =====================================================
      
      function showCustomAlert(message, title) {
        title = title || 'Notice';
        var modalId = 'customModal-' + Date.now();
        var modalHtml = '<div id="' + modalId + '" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;">';
        modalHtml += '<div style="background:#1a1a2e;padding:24px;border-radius:12px;max-width:400px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,0.5);">';
        modalHtml += '<h3 style="margin:0 0 16px 0;font-size:18px;color:#fff;">' + title + '</h3>';
        modalHtml += '<p style="margin:0 0 20px 0;color:#a0a0b0;font-size:14px;line-height:1.5;white-space:pre-wrap;">' + message + '</p>';
        modalHtml += '<button onclick="document.getElementById(\\'' + modalId + '\\').remove()" style="width:100%;padding:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">OK</button>';
        modalHtml += '</div></div>';
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      }
      
      function showCustomPrompt(message, title, callback) {
        title = title || 'Input Required';
        var modalId = 'customPromptModal-' + Date.now();
        var inputId = 'customPromptInput-' + Date.now();
        var modalHtml = '<div id="' + modalId + '" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;">';
        modalHtml += '<div style="background:#1a1a2e;padding:24px;border-radius:12px;max-width:450px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,0.5);">';
        modalHtml += '<h3 style="margin:0 0 16px 0;font-size:18px;color:#fff;">' + title + '</h3>';
        modalHtml += '<p style="margin:0 0 16px 0;color:#a0a0b0;font-size:13px;line-height:1.5;white-space:pre-wrap;">' + message + '</p>';
        modalHtml += '<input id="' + inputId + '" type="text" style="width:100%;padding:12px;background:#2a2a3e;border:1px solid #3a3a4e;border-radius:8px;color:#fff;font-size:14px;margin-bottom:16px;box-sizing:border-box;" placeholder="Enter value...">';
        modalHtml += '<div style="display:flex;gap:10px;">';
        modalHtml += '<button id="' + modalId + '-cancel" style="flex:1;padding:12px;background:#3a3a4e;color:#fff;border:none;border-radius:8px;cursor:pointer;">Cancel</button>';
        modalHtml += '<button id="' + modalId + '-confirm" style="flex:1;padding:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Confirm</button>';
        modalHtml += '</div></div></div>';
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        var modal = document.getElementById(modalId);
        var input = document.getElementById(inputId);
        input.focus();
        
        document.getElementById(modalId + '-cancel').onclick = function() {
          modal.remove();
          if (callback) callback(null);
        };
        document.getElementById(modalId + '-confirm').onclick = function() {
          var value = input.value;
          modal.remove();
          if (callback) callback(value);
        };
        input.onkeydown = function(e) {
          if (e.key === 'Enter') {
            var value = input.value;
            modal.remove();
            if (callback) callback(value);
          }
        };
      }
      
      function showCustomConfirm(message, title, onConfirm, onCancel) {
        title = title || 'Confirm';
        var modalId = 'customConfirmModal-' + Date.now();
        var modalHtml = '<div id="' + modalId + '" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;">';
        modalHtml += '<div style="background:#1a1a2e;padding:24px;border-radius:12px;max-width:400px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,0.5);">';
        modalHtml += '<h3 style="margin:0 0 16px 0;font-size:18px;color:#fff;">' + title + '</h3>';
        modalHtml += '<p style="margin:0 0 20px 0;color:#a0a0b0;font-size:14px;line-height:1.5;white-space:pre-wrap;">' + message + '</p>';
        modalHtml += '<div style="display:flex;gap:10px;">';
        modalHtml += '<button id="' + modalId + '-cancel" style="flex:1;padding:12px;background:#3a3a4e;color:#fff;border:none;border-radius:8px;cursor:pointer;">Cancel</button>';
        modalHtml += '<button id="' + modalId + '-confirm" style="flex:1;padding:12px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Confirm</button>';
        modalHtml += '</div></div></div>';
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        var modal = document.getElementById(modalId);
        document.getElementById(modalId + '-cancel').onclick = function() {
          modal.remove();
          if (onCancel) onCancel();
        };
        document.getElementById(modalId + '-confirm').onclick = function() {
          modal.remove();
          if (onConfirm) onConfirm();
        };
      }
      
      // PIP overlay elements
      var pipOverlay = document.getElementById('pipOverlay');
      var pipVideo = document.getElementById('pipVideo');
      var pipLogoContainer = document.getElementById('pipLogoContainer');
      var pipCameraBtn = document.getElementById('pipCameraBtn');
      var pipLogoBtn = document.getElementById('pipLogoBtn');
      var pipHideBtn = document.getElementById('pipHideBtn');
      var useLogoBtn = document.getElementById('useLogoBtn');
      
      // Camera state
      var isCameraOn = true;
      var isCameraBlurred = false;
      var isCameraStreamActive = false;
      var useLogo = false; // Use logo instead of camera in PIP
      var pipPosition = { x: null, y: null }; // Custom PIP position (null = default bottom-right)
      var logoPreviewPosition = { x: null, y: null }; // Logo position before recording for preview
      var customLogoDataUrl = null;
      var customLogoImage = null;
      
      // Load saved logo from localStorage
      try {
        var savedLogo = localStorage.getItem('recording_studio_custom_logo');
        if (savedLogo) {
          customLogoDataUrl = savedLogo;
          customLogoImage = new Image();
          customLogoImage.src = savedLogo;
          logoPlaceholder.innerHTML = '<img src="' + savedLogo + '" alt="Logo"><span class="drag-hint">Drag to position</span>';
          // Also update PIP logo container
          pipLogoContainer.innerHTML = '<img src="' + savedLogo + '" alt="Logo">';
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
            logoPlaceholder.innerHTML = '<img src="' + customLogoDataUrl + '" alt="Logo"><span class="drag-hint">Drag to position</span>';
            // Also update PIP logo container
            pipLogoContainer.innerHTML = '<img src="' + customLogoDataUrl + '" alt="Logo">';
            // Save to localStorage
            try {
              localStorage.setItem('recording_studio_custom_logo', customLogoDataUrl);
            } catch(err) { console.error('Failed to save logo:', err); }
          };
          reader.readAsDataURL(file);
        }
      };
      
      // Make logo placeholder draggable for positioning before recording
      var isLogoDragging = false;
      var logoDragOffsetX = 0;
      var logoDragOffsetY = 0;
      
      logoPlaceholder.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        e.stopPropagation();
        isLogoDragging = true;
        logoPlaceholder.classList.add('dragging');
        
        var rect = logoPlaceholder.getBoundingClientRect();
        logoDragOffsetX = e.clientX - rect.left;
        logoDragOffsetY = e.clientY - rect.top;
        console.log('🖱️ Logo drag started');
      });
      
      document.addEventListener('mousemove', function(e) {
        if (!isLogoDragging) return;
        e.preventDefault();
        
        var container = cameraOffOverlay;
        var containerRect = container.getBoundingClientRect();
        var logoWidth = logoPlaceholder.offsetWidth;
        var logoHeight = logoPlaceholder.offsetHeight;
        
        // Calculate new position relative to container
        var newX = e.clientX - containerRect.left - logoDragOffsetX;
        var newY = e.clientY - containerRect.top - logoDragOffsetY;
        
        // Constrain to container bounds with 10px padding
        newX = Math.max(10, Math.min(newX, containerRect.width - logoWidth - 10));
        newY = Math.max(10, Math.min(newY, containerRect.height - logoHeight - 10));
        
        // Apply position - switch to absolute positioning
        logoPlaceholder.classList.add('positioned');
        logoPlaceholder.style.left = newX + 'px';
        logoPlaceholder.style.top = newY + 'px';
        
        // Store position for PIP and canvas drawing (scale to relative position)
        logoPreviewPosition.x = newX;
        logoPreviewPosition.y = newY;
        
        // Also sync to pipPosition for recording
        pipPosition.x = newX;
        pipPosition.y = newY;
      });
      
      document.addEventListener('mouseup', function(e) {
        if (isLogoDragging) {
          isLogoDragging = false;
          logoPlaceholder.classList.remove('dragging');
          console.log('🖱️ Logo drag ended at:', logoPreviewPosition);
        }
      });
      
      // Touch events for logo dragging on mobile
      logoPlaceholder.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        isLogoDragging = true;
        logoPlaceholder.classList.add('dragging');
        
        var touch = e.touches[0];
        var rect = logoPlaceholder.getBoundingClientRect();
        logoDragOffsetX = touch.clientX - rect.left;
        logoDragOffsetY = touch.clientY - rect.top;
      }, { passive: false });
      
      document.addEventListener('touchmove', function(e) {
        if (!isLogoDragging) return;
        e.preventDefault();
        
        var touch = e.touches[0];
        var container = cameraOffOverlay;
        var containerRect = container.getBoundingClientRect();
        var logoWidth = logoPlaceholder.offsetWidth;
        var logoHeight = logoPlaceholder.offsetHeight;
        
        var newX = touch.clientX - containerRect.left - logoDragOffsetX;
        var newY = touch.clientY - containerRect.top - logoDragOffsetY;
        
        newX = Math.max(10, Math.min(newX, containerRect.width - logoWidth - 10));
        newY = Math.max(10, Math.min(newY, containerRect.height - logoHeight - 10));
        
        logoPlaceholder.classList.add('positioned');
        logoPlaceholder.style.left = newX + 'px';
        logoPlaceholder.style.top = newY + 'px';
        
        logoPreviewPosition.x = newX;
        logoPreviewPosition.y = newY;
        pipPosition.x = newX;
        pipPosition.y = newY;
      }, { passive: false });
      
      document.addEventListener('touchend', function() {
        if (isLogoDragging) {
          isLogoDragging = false;
          logoPlaceholder.classList.remove('dragging');
        }
      });
      
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
      
      // Clean script for TTS - remove markers, notes sections that shouldn't be spoken
      // Defined early so it can be used by download handlers
      function cleanScriptForTTS(text) {
        if (!text) return '';
        
        console.log('🧹 Cleaning script for TTS, input length:', text.length);
        
        var cleaned = text
          // Replace [PAUSE Xs] with natural pauses (ellipsis for short pauses)
          .replace(/\[PAUSE\s+[0-9.]+s\]/gi, '...')
          // Remove entire notes sections - match [SECTION:] through end of that section
          .replace(/\[IMPROVEMENT NOTES:\][\s\S]*?(?=\n\n|\[|$)/gi, '')
          .replace(/\[ENGAGEMENT NOTES:\][\s\S]*?(?=\n\n|\[|$)/gi, '')
          .replace(/\[DELIVERY TIPS:\][\s\S]*?(?=\n\n|\[|$)/gi, '')
          // Remove any remaining bracket markers
          .replace(/\[[A-Z\s]+:\]/gi, '')
          // Remove bullet points
          .replace(/[•·▪]/g, '')
          // Clean up multiple newlines
          .replace(/\n{3,}/g, '\n\n')
          // Clean up multiple spaces
          .replace(/  +/g, ' ')
          .trim();
        
        console.log('🧹 Cleaned script length:', cleaned.length);
        
        return cleaned;
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
      document.getElementById('scrollResetBtn').onclick = function() { 
        scriptContent.scrollTop = 0; 
        updateReadingCursor();
      };
      
      // =====================================================
      // Teleprompter Speed & Reading Cursor Controls
      // =====================================================
      
      // Update speed display and apply multiplier
      function updateSpeedDisplay() {
        speedValue.textContent = teleprompterSpeedMultiplier.toFixed(1) + 'x';
        
        // Update preset button states
        [speedPreset05, speedPreset10, speedPreset15, speedPreset20].forEach(function(btn) {
          btn.classList.remove('active');
        });
        
        if (teleprompterSpeedMultiplier === 0.5) speedPreset05.classList.add('active');
        else if (teleprompterSpeedMultiplier === 1.0) speedPreset10.classList.add('active');
        else if (teleprompterSpeedMultiplier === 1.5) speedPreset15.classList.add('active');
        else if (teleprompterSpeedMultiplier === 2.0) speedPreset20.classList.add('active');
      }
      
      // Apply speed multiplier to current scroll speed
      function getAdjustedScrollSpeed() {
        return baseScrollSpeed * teleprompterSpeedMultiplier;
      }
      
      // Update reading cursor position based on scroll
      function updateReadingCursor() {
        if (!readingCursor || !readingCursorEnabled || !isRecording) return;
        
        // Position cursor at the center of the visible area
        var containerHeight = scriptContent.clientHeight;
        var cursorTop = containerHeight * 0.35; // Position at ~35% from top (reading zone)
        readingCursor.style.top = cursorTop + 'px';
        readingCursor.style.display = 'block';
      }
      
      // Show/hide speed controls and reading cursor based on recording state
      function showTeleprompterControls(show) {
        if (show) {
          speedControls.classList.remove('hidden');
          scriptContent.classList.add('cursor-active');
          updateReadingCursor();
        } else {
          speedControls.classList.add('hidden');
          readingCursor.style.display = 'none';
          scriptContent.classList.remove('cursor-active');
        }
      }
      
      // Speed control event handlers
      speedDownBtn.onclick = function() {
        teleprompterSpeedMultiplier = Math.max(0.25, teleprompterSpeedMultiplier - 0.25);
        updateSpeedDisplay();
        console.log('📜 Speed decreased to:', teleprompterSpeedMultiplier + 'x');
      };
      
      speedUpBtn.onclick = function() {
        teleprompterSpeedMultiplier = Math.min(3.0, teleprompterSpeedMultiplier + 0.25);
        updateSpeedDisplay();
        console.log('📜 Speed increased to:', teleprompterSpeedMultiplier + 'x');
      };
      
      speedPreset05.onclick = function() {
        teleprompterSpeedMultiplier = 0.5;
        updateSpeedDisplay();
      };
      
      speedPreset10.onclick = function() {
        teleprompterSpeedMultiplier = 1.0;
        updateSpeedDisplay();
      };
      
      speedPreset15.onclick = function() {
        teleprompterSpeedMultiplier = 1.5;
        updateSpeedDisplay();
      };
      
      speedPreset20.onclick = function() {
        teleprompterSpeedMultiplier = 2.0;
        updateSpeedDisplay();
      };
      
      // Initialize speed display
      updateSpeedDisplay();
      
      // =====================================================
      // Script Analysis Functions
      // =====================================================
      
      // Analyze script using AI
      function analyzeScript(scriptText) {
        if (!scriptText || isAnalyzing) return;
        
        isAnalyzing = true;
        analyzeScriptBtn.disabled = true;
        analyzeScriptBtn.classList.add('loading');
        analyzeScriptBtn.innerHTML = '✨ Analyzing...';
        
        var supabaseUrl = '${config.supabaseUrl}';
        var supabaseKey = '${config.supabaseKey}';
        
        fetch(supabaseUrl + '/functions/v1/analyze-script', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + supabaseKey
          },
          body: JSON.stringify({
            script: scriptText,
            context: 'video recording walkthrough'
          })
        })
        .then(function(response) {
          if (!response.ok) throw new Error('Analysis failed');
          return response.json();
        })
        .then(function(analysis) {
          scriptAnalysis = analysis;
          displayAnalysisResults(analysis);
          if (isSegmentViewEnabled) {
            renderSegmentView(analysis);
          }
          console.log('✅ Script analysis complete:', analysis);
        })
        .catch(function(err) {
          console.error('Script analysis error:', err);
          // Show a simple fallback message
          analysisPanel.style.display = 'block';
          analysisScore.textContent = '⚠️';
          analysisScore.className = 'score-badge';
          analysisToneGuide.textContent = 'Analysis unavailable - try again later';
        })
        .finally(function() {
          isAnalyzing = false;
          analyzeScriptBtn.disabled = false;
          analyzeScriptBtn.classList.remove('loading');
          analyzeScriptBtn.innerHTML = '✨ Analyze';
        });
      }
      
      // Display analysis results in the panel
      function displayAnalysisResults(analysis) {
        analysisPanel.style.display = 'block';
        
        // Score badge
        var score = analysis.overallScore || 50;
        analysisScore.textContent = score + '/100';
        if (score >= 70) {
          analysisScore.className = 'score-badge good';
        } else if (score >= 50) {
          analysisScore.className = 'score-badge medium';
        } else {
          analysisScore.className = 'score-badge low';
        }
        
        // Tone guide
        analysisToneGuide.textContent = analysis.toneGuide || 'Deliver naturally';
        
        // Recommendations
        var recsHtml = '';
        if (analysis.engagementRecommendations && analysis.engagementRecommendations.length > 0) {
          analysis.engagementRecommendations.slice(0, 3).forEach(function(rec) {
            recsHtml += '<div class="recommendation">💡 ' + rec + '</div>';
          });
        }
        analysisRecommendations.innerHTML = recsHtml;
        
        // Duration and pause info
        var duration = analysis.totalDuration || 0;
        var mins = Math.floor(duration / 60);
        var secs = duration % 60;
        analysisDuration.textContent = '⏱️ ~' + mins + ':' + (secs < 10 ? '0' : '') + secs;
        
        var pauseCount = analysis.pausePoints ? analysis.pausePoints.length : 0;
        analysisPauseCount.textContent = '⏸️ ' + pauseCount + ' pause points';
        
        // Automatically show review changes panel with all suggestions
        reviewChangesBtn.classList.add('active');
        reviewChangesPanel.style.display = 'block';
        renderChangesList();
        
        // Highlight that user should review changes
        console.log('📝 Analysis complete - Review ' + pendingChanges.length + ' suggested changes');
      }
      
      // Render script in segment view with markers
      function renderSegmentView(analysis) {
        if (!analysis || !analysis.segments || analysis.segments.length === 0) {
          return;
        }
        
        var html = '';
        analysis.segments.forEach(function(seg, idx) {
          var segClass = 'script-segment ' + seg.type;
          if (idx === currentSegmentIndex) segClass += ' active';
          
          html += '<div class="' + segClass + '" data-segment-index="' + idx + '">';
          html += '<div class="segment-header">';
          html += '<span class="segment-type">' + seg.type + '</span>';
          html += '<span class="segment-duration">~' + seg.estimatedDuration + 's</span>';
          html += '</div>';
          html += '<div class="segment-text">' + seg.text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
          
          // Tone markers
          if (seg.toneMarkers && seg.toneMarkers.length > 0) {
            html += '<div class="tone-markers">';
            seg.toneMarkers.forEach(function(marker) {
              var icon = '';
              switch(marker) {
                case 'emphasize': icon = '💪'; break;
                case 'slower': icon = '🐢'; break;
                case 'faster': icon = '🚀'; break;
                case 'pause': icon = '⏸️'; break;
                case 'question': icon = '❓'; break;
                case 'excitement': icon = '🎉'; break;
                default: icon = '🎯';
              }
              html += '<span class="tone-marker">' + icon + ' ' + marker + '</span>';
            });
            html += '</div>';
          }
          
          // Engagement tips
          if (seg.engagementTips && seg.engagementTips.length > 0) {
            seg.engagementTips.forEach(function(tip) {
              html += '<div class="engagement-tip">💡 ' + tip + '</div>';
            });
          }
          
          // Pause marker
          if (seg.suggestedPauseAfter) {
            html += '<div class="pause-marker">';
            html += '⏸️ ' + (seg.pauseReason || 'Suggested pause point');
            html += '</div>';
          }
          
          html += '</div>';
        });
        
        scriptContent.innerHTML = html;
        
        // Add click handlers to segments
        var segmentEls = scriptContent.querySelectorAll('.script-segment');
        segmentEls.forEach(function(el) {
          el.onclick = function() {
            var idx = parseInt(el.getAttribute('data-segment-index'));
            setCurrentSegment(idx);
          };
        });
      }
      
      // Set current segment and scroll to it
      function setCurrentSegment(idx) {
        if (!scriptAnalysis || !scriptAnalysis.segments) return;
        if (idx < 0) idx = 0;
        if (idx >= scriptAnalysis.segments.length) idx = scriptAnalysis.segments.length - 1;
        
        currentSegmentIndex = idx;
        
        // Update active class
        var segmentEls = scriptContent.querySelectorAll('.script-segment');
        segmentEls.forEach(function(el, i) {
          if (i === idx) {
            el.classList.add('active');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            el.classList.remove('active');
          }
        });
        
        // Update segment info
        updateSegmentInfo();
      }
      
      // Update segment navigation info
      function updateSegmentInfo() {
        if (!scriptAnalysis || !scriptAnalysis.segments) {
          currentSegmentInfo.textContent = 'No segments loaded';
          return;
        }
        
        var seg = scriptAnalysis.segments[currentSegmentIndex];
        var total = scriptAnalysis.segments.length;
        currentSegmentInfo.innerHTML = '<strong>' + seg.type.toUpperCase() + '</strong> - Segment ' + (currentSegmentIndex + 1) + ' of ' + total;
        
        prevSegmentBtn.disabled = currentSegmentIndex === 0;
        nextSegmentBtn.disabled = currentSegmentIndex >= total - 1;
      }
      
      // Toggle segment view
      function toggleSegmentView() {
        isSegmentViewEnabled = !isSegmentViewEnabled;
        toggleSegmentViewBtn.classList.toggle('active', isSegmentViewEnabled);
        
        if (isSegmentViewEnabled && scriptAnalysis) {
          renderSegmentView(scriptAnalysis);
        } else {
          // Restore plain text view
          var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
          if (selectedScript) {
            scriptContent.innerHTML = selectedScript.content.replace(/\\n/g, '<br>').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          }
        }
      }
      
      // Analyze button click handler
      if (analyzeScriptBtn) {
        analyzeScriptBtn.onclick = function() {
          var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
          if (selectedScript) {
            analyzeScript(selectedScript.content);
          } else {
            console.log('⚠️ No script selected to analyze');
          }
        };
      }
      
      // Toggle segment view button
      if (toggleSegmentViewBtn) {
        toggleSegmentViewBtn.onclick = toggleSegmentView;
      }
      
      // =====================================================
      // Pause Points & Review Changes Handlers
      // =====================================================
      
      // View pause points button
      if (viewPausePointsBtn) {
        viewPausePointsBtn.onclick = function() {
          viewPausePointsBtn.classList.toggle('active');
          if (pausePointsList.style.display === 'none') {
            renderPausePointsList();
            pausePointsList.style.display = 'block';
            reviewChangesPanel.style.display = 'none';
            reviewChangesBtn.classList.remove('active');
          } else {
            pausePointsList.style.display = 'none';
          }
        };
      }
      
      // Render pause points list
      function renderPausePointsList() {
        if (!scriptAnalysis || !scriptAnalysis.pausePoints || scriptAnalysis.pausePoints.length === 0) {
          pausePointsList.innerHTML = '<div style="opacity:0.6;font-size:11px;text-align:center;">No pause points detected</div>';
          return;
        }
        
        var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
        var scriptText = selectedScript ? selectedScript.content : '';
        
        var html = '';
        scriptAnalysis.pausePoints.forEach(function(pp, idx) {
          // Get context around the pause position
          var startCtx = Math.max(0, pp.position - 30);
          var endCtx = Math.min(scriptText.length, pp.position + 30);
          var context = '...' + scriptText.substring(startCtx, pp.position) + '⏸️' + scriptText.substring(pp.position, endCtx) + '...';
          context = context.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, ' ');
          
          html += '<div class="pause-point-item" data-pause-index="' + idx + '" data-position="' + pp.position + '">';
          html += '<span class="pp-position">#' + (idx + 1) + '</span>';
          html += '<span class="pp-reason" title="' + context + '">' + pp.reason + '</span>';
          html += '<span class="pp-duration">' + pp.suggestedDuration + 's</span>';
          html += '</div>';
        });
        
        pausePointsList.innerHTML = html;
        
        // Add click handlers to scroll to position
        var items = pausePointsList.querySelectorAll('.pause-point-item');
        items.forEach(function(item) {
          item.onclick = function() {
            var pos = parseInt(item.getAttribute('data-position'));
            scrollToPausePosition(pos);
          };
        });
      }
      
      // Scroll to pause position in script
      function scrollToPausePosition(position) {
        var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
        if (!selectedScript) return;
        
        // If inline markers are enabled, find and highlight the marker
        if (inlineMarkersEnabled) {
          var markers = scriptContent.querySelectorAll('.inline-pause-marker');
          markers.forEach(function(m) {
            m.classList.remove('highlighted');
            if (parseInt(m.getAttribute('data-position')) === position) {
              m.classList.add('highlighted');
              m.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        } else {
          // Enable inline markers and show
          inlineMarkersEnabled = true;
          showInlineMarkersBtn.classList.add('active');
          renderScriptWithInlineMarkers();
          setTimeout(function() {
            var markers = scriptContent.querySelectorAll('.inline-pause-marker');
            markers.forEach(function(m) {
              if (parseInt(m.getAttribute('data-position')) === position) {
                m.classList.add('highlighted');
                m.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            });
          }, 100);
        }
      }
      
      // Review changes button
      if (reviewChangesBtn) {
        reviewChangesBtn.onclick = function() {
          reviewChangesBtn.classList.toggle('active');
          if (reviewChangesPanel.style.display === 'none') {
            renderChangesList();
            reviewChangesPanel.style.display = 'block';
            pausePointsList.style.display = 'none';
            viewPausePointsBtn.classList.remove('active');
          } else {
            reviewChangesPanel.style.display = 'none';
          }
        };
      }
      
      // Render suggested changes list
      function renderChangesList() {
        if (!scriptAnalysis) {
          changesList.innerHTML = '<div style="opacity:0.6;font-size:11px;text-align:center;">No analysis available</div>';
          return;
        }
        
        pendingChanges = [];
        var html = '';
        
        // Add pause point insertions as changes
        if (scriptAnalysis.pausePoints && scriptAnalysis.pausePoints.length > 0) {
          html += '<div style="margin-bottom:8px;font-size:11px;opacity:0.7;">📍 Pause Point Insertions (' + scriptAnalysis.pausePoints.length + ')</div>';
          scriptAnalysis.pausePoints.forEach(function(pp, idx) {
            pendingChanges.push({
              type: 'pause',
              position: pp.position,
              duration: pp.suggestedDuration,
              reason: pp.reason,
              text: '[PAUSE ' + pp.suggestedDuration + 's]',
              applied: null // null = pending, true = accepted, false = rejected
            });
            html += '<div class="change-item" data-change-index="' + (pendingChanges.length - 1) + '" data-type="pause">';
            html += '<span class="change-type">⏸️ Pause #' + (idx + 1) + '</span>';
            html += '<span class="change-text">' + pp.reason + ' (' + pp.suggestedDuration + 's)</span>';
            html += '<div class="change-actions">';
            html += '<button class="change-btn accept" data-action="accept">✓ Accept</button>';
            html += '<button class="change-btn reject" data-action="reject">✗ Skip</button>';
            html += '</div>';
            html += '</div>';
          });
        }
        
        // Add segment improvement suggestions as changes
        if (scriptAnalysis.segments && scriptAnalysis.segments.length > 0) {
          var segmentsWithSuggestions = scriptAnalysis.segments.filter(function(s) { return s.improvementSuggestions; });
          if (segmentsWithSuggestions.length > 0) {
            html += '<div style="margin:12px 0 8px 0;font-size:11px;opacity:0.7;">✏️ Improvement Suggestions (' + segmentsWithSuggestions.length + ')</div>';
            segmentsWithSuggestions.forEach(function(seg) {
              pendingChanges.push({
                type: 'suggestion',
                segmentId: seg.id,
                segmentText: seg.text,
                suggestion: seg.improvementSuggestions,
                applied: null
              });
              html += '<div class="change-item" data-change-index="' + (pendingChanges.length - 1) + '" data-type="suggestion">';
              html += '<span class="change-type">💡 ' + seg.type + '</span>';
              html += '<span class="change-text">' + seg.improvementSuggestions + '</span>';
              html += '<div class="change-actions">';
              html += '<button class="change-btn accept" data-action="accept">✓ Accept</button>';
              html += '<button class="change-btn reject" data-action="reject">✗ Skip</button>';
              html += '</div>';
              html += '</div>';
            });
          }
        }
        
        // Add engagement tips
        if (scriptAnalysis.engagementTips && scriptAnalysis.engagementTips.length > 0) {
          html += '<div style="margin:12px 0 8px 0;font-size:11px;opacity:0.7;">🎯 Engagement Tips</div>';
          scriptAnalysis.engagementTips.forEach(function(tip, idx) {
            pendingChanges.push({
              type: 'engagement',
              text: tip,
              applied: null
            });
            html += '<div class="change-item" data-change-index="' + (pendingChanges.length - 1) + '" data-type="engagement">';
            html += '<span class="change-type">🎯 Tip</span>';
            html += '<span class="change-text">' + tip + '</span>';
            html += '<div class="change-actions">';
            html += '<button class="change-btn accept" data-action="accept">✓ Include</button>';
            html += '<button class="change-btn reject" data-action="reject">✗ Skip</button>';
            html += '</div>';
            html += '</div>';
          });
        }
        
        // Add conversational tips
        if (scriptAnalysis.conversationalTips && scriptAnalysis.conversationalTips.length > 0) {
          html += '<div style="margin:12px 0 8px 0;font-size:11px;opacity:0.7;">💬 Delivery Tips</div>';
          scriptAnalysis.conversationalTips.forEach(function(tip, idx) {
            pendingChanges.push({
              type: 'delivery',
              text: tip,
              applied: null
            });
            html += '<div class="change-item" data-change-index="' + (pendingChanges.length - 1) + '" data-type="delivery">';
            html += '<span class="change-type">💬 Delivery</span>';
            html += '<span class="change-text">' + tip + '</span>';
            html += '<div class="change-actions">';
            html += '<button class="change-btn accept" data-action="accept">✓ Include</button>';
            html += '<button class="change-btn reject" data-action="reject">✗ Skip</button>';
            html += '</div>';
            html += '</div>';
          });
        }
        
        if (html === '') {
          html = '<div style="opacity:0.6;font-size:11px;text-align:center;">No specific changes to review</div>';
        }
        
        // Add summary at top
        var summaryHtml = '<div style="background:rgba(99,102,241,0.2);padding:8px;border-radius:6px;margin-bottom:10px;font-size:11px;">';
        summaryHtml += '<strong>Review each suggestion below:</strong><br>';
        summaryHtml += '✓ Accept to include in enhanced script<br>';
        summaryHtml += '✗ Skip to exclude from enhanced script';
        summaryHtml += '</div>';
        
        changesList.innerHTML = summaryHtml + html;
        
        // Add click handlers for accept/reject buttons
        var changeBtns = changesList.querySelectorAll('.change-btn');
        changeBtns.forEach(function(btn) {
          btn.onclick = function(e) {
            e.stopPropagation();
            var changeItem = btn.closest('.change-item');
            var changeIndex = parseInt(changeItem.getAttribute('data-change-index'));
            var action = btn.getAttribute('data-action');
            
            if (action === 'accept') {
              pendingChanges[changeIndex].applied = true;
              changeItem.style.borderLeftColor = '#22c55e';
              changeItem.querySelector('.accept').textContent = '✓ Accepted';
              changeItem.querySelector('.accept').disabled = true;
              changeItem.querySelector('.accept').style.background = '#22c55e';
              changeItem.querySelector('.reject').style.display = 'none';
            } else {
              pendingChanges[changeIndex].applied = false;
              changeItem.style.opacity = '0.4';
              changeItem.style.borderLeftColor = '#ef4444';
              changeItem.querySelector('.reject').textContent = '✗ Skipped';
              changeItem.querySelector('.reject').disabled = true;
              changeItem.querySelector('.accept').style.display = 'none';
            }
            
            // Update the inline preview
            renderScriptWithAcceptedChanges();
            updateApplyButtonState();
          };
        });
        
        // Initially render script with pending changes highlighted
        renderScriptWithAcceptedChanges();
      }
      
      // Update apply button to show count
      function updateApplyButtonState() {
        var acceptedCount = pendingChanges.filter(function(c) { return c.applied === true; }).length;
        var pendingCount = pendingChanges.filter(function(c) { return c.applied === null; }).length;
        
        if (pendingCount > 0) {
          applyAllChangesBtn.textContent = '⚠️ Review ' + pendingCount + ' pending items first';
          applyAllChangesBtn.style.background = '#f59e0b';
        } else if (acceptedCount > 0) {
          applyAllChangesBtn.textContent = '✅ Apply ' + acceptedCount + ' Accepted Changes';
          applyAllChangesBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        } else {
          applyAllChangesBtn.textContent = 'No changes accepted';
          applyAllChangesBtn.style.background = '#475569';
        }
      }
      
      // Render script with accepted changes shown inline
      function renderScriptWithAcceptedChanges() {
        var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
        if (!selectedScript || !pendingChanges || pendingChanges.length === 0) return;
        
        var scriptText = selectedScript.content;
        var result = '';
        var lastPos = 0;
        
        // Get pause points sorted by position
        var pauseChanges = pendingChanges
          .filter(function(c) { return c.type === 'pause'; })
          .map(function(c, idx) { return { ...c, originalIndex: pendingChanges.indexOf(c) }; })
          .sort(function(a, b) { return a.position - b.position; });
        
        // Build script with inline markers
        pauseChanges.forEach(function(pause, idx) {
          // Add text before this pause point
          var textBefore = scriptText.substring(lastPos, pause.position);
          result += textBefore.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>');
          
          // Add inline pause marker with status
          var statusClass = pause.applied === true ? 'accepted' : (pause.applied === false ? 'rejected' : 'pending');
          var statusIcon = pause.applied === true ? '✓' : (pause.applied === false ? '✗' : '?');
          
          result += '<span class="inline-change-marker ' + statusClass + '" data-index="' + pause.originalIndex + '">';
          result += '<span class="marker-icon">' + statusIcon + '</span>';
          result += '⏸️ ' + pause.duration + 's';
          result += '</span>';
          
          lastPos = pause.position;
        });
        
        // Add remaining text
        result += scriptText.substring(lastPos).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>');
        
        // Add notes section if any accepted
        var acceptedEngagement = pendingChanges.filter(function(c) { return c.type === 'engagement' && c.applied === true; });
        var acceptedDelivery = pendingChanges.filter(function(c) { return c.type === 'delivery' && c.applied === true; });
        var acceptedSuggestions = pendingChanges.filter(function(c) { return c.type === 'suggestion' && c.applied === true; });
        
        if (acceptedEngagement.length > 0 || acceptedDelivery.length > 0 || acceptedSuggestions.length > 0) {
          result += '<br><br><div style="border-top:2px dashed #6366f1;padding-top:10px;margin-top:10px;">';
          result += '<strong style="color:#6366f1;">📝 Accepted Notes:</strong><br>';
          
          if (acceptedSuggestions.length > 0) {
            result += '<div style="margin:6px 0;padding:6px;background:rgba(139,92,246,0.2);border-radius:4px;">';
            result += '<strong>Improvements:</strong><br>';
            acceptedSuggestions.forEach(function(s) {
              result += '• ' + s.suggestion + '<br>';
            });
            result += '</div>';
          }
          
          if (acceptedEngagement.length > 0) {
            result += '<div style="margin:6px 0;padding:6px;background:rgba(34,197,94,0.2);border-radius:4px;">';
            result += '<strong>Engagement Tips:</strong><br>';
            acceptedEngagement.forEach(function(e) {
              result += '• ' + e.text + '<br>';
            });
            result += '</div>';
          }
          
          if (acceptedDelivery.length > 0) {
            result += '<div style="margin:6px 0;padding:6px;background:rgba(59,130,246,0.2);border-radius:4px;">';
            result += '<strong>Delivery Tips:</strong><br>';
            acceptedDelivery.forEach(function(d) {
              result += '• ' + d.text + '<br>';
            });
            result += '</div>';
          }
          
          result += '</div>';
        }
        
        scriptContent.innerHTML = result;
        
        // Add click handlers to inline markers for quick accept/reject
        var markers = scriptContent.querySelectorAll('.inline-change-marker.pending');
        markers.forEach(function(marker) {
          marker.onclick = function() {
            var idx = parseInt(marker.getAttribute('data-index'));
            // Toggle to accepted
            pendingChanges[idx].applied = true;
            
            // Update the change item in the list
            var changeItem = changesList.querySelector('[data-change-index="' + idx + '"]');
            if (changeItem) {
              changeItem.style.borderLeftColor = '#22c55e';
              var acceptBtn = changeItem.querySelector('.accept');
              var rejectBtn = changeItem.querySelector('.reject');
              if (acceptBtn) {
                acceptBtn.textContent = '✓ Accepted';
                acceptBtn.disabled = true;
                acceptBtn.style.background = '#22c55e';
              }
              if (rejectBtn) rejectBtn.style.display = 'none';
            }
            
            renderScriptWithAcceptedChanges();
            updateApplyButtonState();
          };
        });
      }
      
      // Apply all changes button - incorporates ONLY ACCEPTED changes into enhanced script
      if (applyAllChangesBtn) {
        applyAllChangesBtn.onclick = function() {
          if (!scriptAnalysis) return;
          
          var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
          if (!selectedScript) return;
          
          // Check if there are pending items
          var pendingCount = pendingChanges.filter(function(c) { return c.applied === null; }).length;
          if (pendingCount > 0) {
            showCustomConfirm('You have ' + pendingCount + ' items still pending review.\\n\\nDo you want to skip all pending items and apply only accepted changes?', 'Pending Items', function() {
              // Mark all pending as rejected and continue
              pendingChanges.forEach(function(c) {
                if (c.applied === null) c.applied = false;
              });
              applyEnhancedChanges();
            }, function() {
              // Cancelled - do nothing
            });
            return;
          }
          
          applyEnhancedChanges();
        };
        
        function applyEnhancedChanges() {
          var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
          if (!selectedScript || !scriptAnalysis) return;
          
          // Build enhanced script with ONLY ACCEPTED changes
          var enhancedScript = selectedScript.content;
          var changesApplied = 0;
          
          // 1. Apply accepted pause markers
          var acceptedPauses = pendingChanges
            .filter(function(c) { return c.type === 'pause' && c.applied === true; })
            .sort(function(a, b) { return b.position - a.position; }); // Reverse order to not affect positions
          
          acceptedPauses.forEach(function(pause) {
            enhancedScript = enhancedScript.slice(0, pause.position) + ' [PAUSE ' + pause.duration + 's] ' + enhancedScript.slice(pause.position);
            changesApplied++;
          });
          
          // 2. Add accepted suggestions at the end
          var acceptedSuggestions = pendingChanges.filter(function(c) { return c.type === 'suggestion' && c.applied === true; });
          if (acceptedSuggestions.length > 0) {
            enhancedScript += '\\n\\n[IMPROVEMENT NOTES:]\\n';
            acceptedSuggestions.forEach(function(s) {
              enhancedScript += '• ' + s.suggestion + '\\n';
            });
            changesApplied += acceptedSuggestions.length;
          }
          
          // 3. Add accepted engagement tips
          var acceptedEngagement = pendingChanges.filter(function(c) { return c.type === 'engagement' && c.applied === true; });
          if (acceptedEngagement.length > 0) {
            enhancedScript += '\\n[ENGAGEMENT NOTES:]\\n';
            acceptedEngagement.forEach(function(e) {
              enhancedScript += '• ' + e.text + '\\n';
            });
            changesApplied += acceptedEngagement.length;
          }
          
          // 4. Add accepted delivery tips
          var acceptedDelivery = pendingChanges.filter(function(c) { return c.type === 'delivery' && c.applied === true; });
          if (acceptedDelivery.length > 0) {
            enhancedScript += '\\n[DELIVERY TIPS:]\\n';
            acceptedDelivery.forEach(function(d) {
              enhancedScript += '• ' + d.text + '\\n';
            });
            changesApplied += acceptedDelivery.length;
          }
          
          if (changesApplied === 0) {
            showCustomAlert('No changes were accepted. Please accept at least one suggestion.', 'No Changes Applied');
            return;
          }
          
          // Store enhanced script globally and in localStorage
          window.enhancedScriptContent = enhancedScript;
          
          // Save to localStorage for persistence
          try {
            var enhancedScripts = {};
            var saved = localStorage.getItem('enhancedScripts');
            if (saved) enhancedScripts = JSON.parse(saved);
            
            enhancedScripts[selectedScript.id] = {
              originalContent: selectedScript.content,
              enhancedContent: enhancedScript,
              analysis: scriptAnalysis,
              acceptedChanges: pendingChanges.filter(function(c) { return c.applied === true; }),
              appliedAt: new Date().toISOString(),
              changesCount: changesApplied
            };
            
            localStorage.setItem('enhancedScripts', JSON.stringify(enhancedScripts));
            console.log('💾 Enhanced script saved with ' + changesApplied + ' accepted changes');
            
            // Notify parent window
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({ 
                type: 'SCRIPT_ENHANCED', 
                scriptId: selectedScript.id, 
                enhancedContent: enhancedScript,
                changesCount: changesApplied 
              }, '*');
            }
          } catch(e) {
            console.error('Failed to save enhanced script:', e);
          }
          
          // Update the script content display with enhanced version
          if (scriptContent) {
            renderScriptWithWordTracking(enhancedScript);
          }
          
          // Show enhanced downloads section
          var enhancedDownloadsSection = document.getElementById('enhancedDownloadsSection');
          if (enhancedDownloadsSection) {
            enhancedDownloadsSection.style.display = 'block';
          }
          
          // Hide the review panel
          reviewChangesPanel.style.display = 'none';
          reviewChangesBtn.classList.remove('active');
          
          // Show confirmation
          applyAllChangesBtn.textContent = '✅ Applied ' + changesApplied + ' changes!';
          applyAllChangesBtn.style.background = '#22c55e';
          
          console.log('✅ Enhanced script created with ' + changesApplied + ' accepted changes');
          
          setTimeout(function() {
            applyAllChangesBtn.textContent = '✅ Apply Accepted Changes';
            applyAllChangesBtn.style.background = '';
          }, 3000);
        };
      }
      
      // =====================================================
      // Enhanced Content Download Handlers
      // =====================================================
      
      var downloadEnhancedAudioBtn = document.getElementById('downloadEnhancedAudioBtn');
      var downloadEnhancedTranscriptBtn = document.getElementById('downloadEnhancedTranscriptBtn');
      var downloadOriginalTranscriptBtn = document.getElementById('downloadOriginalTranscriptBtn');
      var enhancedAudioProgress = document.getElementById('enhancedAudioProgress');
      var enhancedTtsProvider = document.getElementById('enhancedTtsProvider');
      var enhancedVoiceSelect = document.getElementById('enhancedVoiceSelect');
      
      // Store the generated enhanced audio for later download
      var generatedEnhancedAudioBlob = null;
      
      // Handle TTS provider change - show/hide appropriate voice options
      if (enhancedTtsProvider && enhancedVoiceSelect) {
        enhancedTtsProvider.onchange = function() {
          var provider = enhancedTtsProvider.value;
          var openaiGroup = enhancedVoiceSelect.querySelector('#openaiVoicesGroup');
          var elevenlabsGroup = enhancedVoiceSelect.querySelector('#elevenlabsVoicesGroup');
          
          if (provider === 'openai') {
            // Show OpenAI voices, hide ElevenLabs
            if (openaiGroup) {
              openaiGroup.disabled = false;
              Array.from(openaiGroup.querySelectorAll('option')).forEach(function(opt) {
                opt.disabled = false;
                opt.hidden = false;
              });
            }
            if (elevenlabsGroup) {
              elevenlabsGroup.disabled = true;
              Array.from(elevenlabsGroup.querySelectorAll('option')).forEach(function(opt) {
                opt.disabled = true;
                opt.hidden = true;
              });
            }
            // Select first OpenAI voice
            enhancedVoiceSelect.value = 'alloy';
          } else {
            // Show ElevenLabs voices, hide OpenAI
            if (openaiGroup) {
              openaiGroup.disabled = true;
              Array.from(openaiGroup.querySelectorAll('option')).forEach(function(opt) {
                opt.disabled = true;
                opt.hidden = true;
              });
            }
            if (elevenlabsGroup) {
              elevenlabsGroup.disabled = false;
              Array.from(elevenlabsGroup.querySelectorAll('option')).forEach(function(opt) {
                opt.disabled = false;
                opt.hidden = false;
              });
            }
            // Select first ElevenLabs voice
            enhancedVoiceSelect.value = 'EXAVITQu4vr4xnSDxMaL';
          }
          
          console.log('🎤 Enhanced TTS provider changed to:', provider);
        };
        
        // Initialize - hide ElevenLabs voices by default
        var elevenlabsGroup = enhancedVoiceSelect.querySelector('#elevenlabsVoicesGroup');
        if (elevenlabsGroup) {
          elevenlabsGroup.disabled = true;
          Array.from(elevenlabsGroup.querySelectorAll('option')).forEach(function(opt) {
            opt.disabled = true;
            opt.hidden = true;
          });
        }
      }
      
      // Download enhanced transcript as TXT - CLEAN version without markers
      if (downloadEnhancedTranscriptBtn) {
        downloadEnhancedTranscriptBtn.onclick = function() {
          if (!window.enhancedScriptContent) {
            showCustomAlert('Please apply changes first to generate enhanced content.', 'Apply Changes First');
            return;
          }
          
          // Use cleanScriptForTTS to get a clean version without markers
          var cleanContent = cleanScriptForTTS(window.enhancedScriptContent);
          
          var blob = new Blob([cleanContent], { type: 'text/plain' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'enhanced_transcript_' + new Date().toISOString().slice(0,10) + '.txt';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log('📄 Enhanced transcript downloaded (clean version)');
        };
      }
      
      // Download original transcript as TXT
      if (downloadOriginalTranscriptBtn) {
        downloadOriginalTranscriptBtn.onclick = function() {
          var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
          if (!selectedScript) {
            showCustomAlert('No script selected.', 'Script Required');
            return;
          }
          
          var blob = new Blob([selectedScript.content], { type: 'text/plain' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'original_transcript_' + new Date().toISOString().slice(0,10) + '.txt';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log('📄 Original transcript downloaded');
        };
      }
      
      // Generate and download enhanced audio as MP3
      if (downloadEnhancedAudioBtn) {
        downloadEnhancedAudioBtn.onclick = async function() {
          if (!window.enhancedScriptContent) {
            showCustomAlert('Please apply changes first to generate enhanced content.', 'Apply Changes First');
            return;
          }
          
          var enhancedText = window.enhancedScriptContent;
          // Use cleanScriptForTTS to get proper clean version for TTS
          var ttsText = cleanScriptForTTS(enhancedText);
          
          console.log('🎤 Enhanced audio TTS text:', ttsText.substring(0, 200));
          
          if (!ttsText || ttsText.length < 5) {
            showCustomAlert('Enhanced script content is too short for audio generation.', 'Content Too Short');
            return;
          }
          
          downloadEnhancedAudioBtn.disabled = true;
          downloadEnhancedAudioBtn.textContent = '⏳ Generating audio...';
          enhancedAudioProgress.style.display = 'block';
          enhancedAudioProgress.textContent = 'Generating TTS audio from enhanced script...';
          
          try {
            // Get selected voice and provider from dropdowns
            var selectedVoice = enhancedVoiceSelect ? enhancedVoiceSelect.value : 'alloy';
            var ttsProvider = enhancedTtsProvider ? enhancedTtsProvider.value : 'openai';
            
            console.log('🎤 Generating enhanced audio with:', ttsProvider, selectedVoice);
            
            var audioBlob = null;
            
            if (ttsProvider === 'elevenlabs') {
              // Call ElevenLabs TTS
              enhancedAudioProgress.textContent = 'Calling ElevenLabs TTS...';
              var response = await fetch(supabaseUrl + '/functions/v1/elevenlabs-voice', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + supabaseKey
                },
                body: JSON.stringify({
                  text: ttsText,
                  voice: selectedVoice,
                  model: 'eleven_multilingual_v2'
                })
              });
              
              if (!response.ok) {
                throw new Error('ElevenLabs TTS failed: ' + response.status);
              }
              
              var data = await response.json();
              if (data.audioContent) {
                // Convert base64 to blob
                var binaryStr = atob(data.audioContent);
                var bytes = new Uint8Array(binaryStr.length);
                for (var i = 0; i < binaryStr.length; i++) {
                  bytes[i] = binaryStr.charCodeAt(i);
                }
                audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
              }
            } else {
              // Call OpenAI TTS
              enhancedAudioProgress.textContent = 'Calling OpenAI TTS...';
              var response = await fetch(supabaseUrl + '/functions/v1/openai-tts', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + supabaseKey
                },
                body: JSON.stringify({
                  text: ttsText,
                  voice: selectedVoice,
                  speed: 1.0
                })
              });
              
              if (!response.ok) {
                throw new Error('OpenAI TTS failed: ' + response.status);
              }
              
              var data = await response.json();
              if (data.audioContent) {
                // Convert base64 to blob
                var binaryStr = atob(data.audioContent);
                var bytes = new Uint8Array(binaryStr.length);
                for (var i = 0; i < binaryStr.length; i++) {
                  bytes[i] = binaryStr.charCodeAt(i);
                }
                audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
              } else if (data.chunks) {
                // Handle chunked response for long text
                enhancedAudioProgress.textContent = 'Processing ' + data.chunks.length + ' audio chunks...';
                var audioChunks = [];
                for (var j = 0; j < data.chunks.length; j++) {
                  enhancedAudioProgress.textContent = 'Processing chunk ' + (j+1) + '/' + data.chunks.length + '...';
                  var chunkResponse = await fetch(supabaseUrl + '/functions/v1/openai-tts', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + supabaseKey
                    },
                    body: JSON.stringify({
                      text: data.chunks[j],
                      voice: selectedVoice,
                      speed: 1.0,
                      chunkIndex: j,
                      totalChunks: data.chunks.length
                    })
                  });
                  
                  if (chunkResponse.ok) {
                    var chunkData = await chunkResponse.json();
                    if (chunkData.audioContent) {
                      audioChunks.push(chunkData.audioContent);
                    }
                  }
                }
                
                // Combine all chunks
                if (audioChunks.length > 0) {
                  var combinedBytes = [];
                  audioChunks.forEach(function(chunk) {
                    var binaryStr = atob(chunk);
                    for (var k = 0; k < binaryStr.length; k++) {
                      combinedBytes.push(binaryStr.charCodeAt(k));
                    }
                  });
                  audioBlob = new Blob([new Uint8Array(combinedBytes)], { type: 'audio/mpeg' });
                }
              }
            }
            
            if (audioBlob) {
              generatedEnhancedAudioBlob = audioBlob;
              
              // Download the audio
              var url = URL.createObjectURL(audioBlob);
              var a = document.createElement('a');
              a.href = url;
              a.download = 'enhanced_audio_' + new Date().toISOString().slice(0,10) + '.mp3';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              enhancedAudioProgress.textContent = '✅ Enhanced audio downloaded successfully!';
              console.log('🎧 Enhanced audio downloaded');
              
              setTimeout(function() {
                enhancedAudioProgress.style.display = 'none';
              }, 3000);
            } else {
              throw new Error('No audio data received');
            }
          } catch(error) {
            console.error('Failed to generate enhanced audio:', error);
            enhancedAudioProgress.textContent = '❌ Error: ' + error.message;
            setTimeout(function() {
              enhancedAudioProgress.style.display = 'none';
            }, 5000);
          } finally {
            downloadEnhancedAudioBtn.disabled = false;
            downloadEnhancedAudioBtn.textContent = '🎧 Generate & Download Enhanced Audio (MP3)';
          }
        };
      }
      
      // Render script with word-level tracking for cursor sync
      function renderScriptWithWordTracking(text) {
        if (!scriptContent) return;
        
        // Split text into words while preserving structure
        var words = text.split(/(\s+)/);
        scriptWords = [];
        var html = '';
        var wordIndex = 0;
        
        words.forEach(function(word) {
          if (word.trim() === '') {
            // Preserve whitespace and newlines
            html += word.replace(/\\n/g, '<br>');
          } else {
            // Wrap each word in a span for highlighting
            var sanitizedWord = word.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += '<span class="script-word" data-word-index="' + wordIndex + '">' + sanitizedWord + '</span>';
            scriptWords.push({
              index: wordIndex,
              text: word,
              element: null // Will be set after render
            });
            wordIndex++;
          }
        });
        
        scriptContent.innerHTML = html;
        
        // Cache word element references
        var wordElements = scriptContent.querySelectorAll('.script-word');
        wordElements.forEach(function(el, idx) {
          if (scriptWords[idx]) {
            scriptWords[idx].element = el;
          }
        });
        
        console.log('📝 Script rendered with ' + scriptWords.length + ' words for tracking');
      }
      
      // Show inline markers button
      if (showInlineMarkersBtn) {
        showInlineMarkersBtn.onclick = function() {
          inlineMarkersEnabled = !inlineMarkersEnabled;
          showInlineMarkersBtn.classList.toggle('active', inlineMarkersEnabled);
          
          if (inlineMarkersEnabled) {
            renderScriptWithInlineMarkers();
          } else {
            // Restore normal view
            if (isSegmentViewEnabled && scriptAnalysis) {
              renderSegmentView(scriptAnalysis);
            } else {
              var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
              if (selectedScript) {
                scriptContent.innerHTML = selectedScript.content.replace(/\\n/g, '<br>').replace(/</g, '&lt;').replace(/>/g, '&gt;');
              }
            }
          }
        };
      }
      
      // Render script with inline pause markers
      function renderScriptWithInlineMarkers() {
        if (!scriptAnalysis || !scriptAnalysis.pausePoints) return;
        
        var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
        if (!selectedScript) return;
        
        var scriptText = selectedScript.content;
        var result = '';
        var lastPos = 0;
        
        // Sort pause points by position
        var sortedPauses = scriptAnalysis.pausePoints.slice().sort(function(a, b) { return a.position - b.position; });
        
        sortedPauses.forEach(function(pp, idx) {
          // Add text before this pause point
          var textBefore = scriptText.substring(lastPos, pp.position);
          result += textBefore.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>');
          
          // Add inline pause marker
          result += '<span class="inline-pause-marker" data-position="' + pp.position + '" data-index="' + idx + '" title="' + pp.reason + ' (' + pp.suggestedDuration + 's)">';
          result += '⏸️ ' + (idx + 1);
          result += '</span>';
          
          lastPos = pp.position;
        });
        
        // Add remaining text
        result += scriptText.substring(lastPos).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>');
        
        scriptContent.innerHTML = result;
        
        // Add click handlers to markers
        var markers = scriptContent.querySelectorAll('.inline-pause-marker');
        markers.forEach(function(marker) {
          marker.onclick = function() {
            var idx = parseInt(marker.getAttribute('data-index'));
            var pp = sortedPauses[idx];
            showCustomAlert('Reason: ' + pp.reason + '\\n\\nSuggested Duration: ' + pp.suggestedDuration + ' seconds', '⏸️ Pause Point #' + (idx + 1));
          };
        });
      }
      
      // =====================================================
      // Pause-Insert-Resume Controls
      // =====================================================
      
      // Insert mode buttons
      if (modeDemoBtn) {
        modeDemoBtn.onclick = function() {
          insertMode = 'demo';
          modeDemoBtn.classList.add('active');
          modeSilentBtn.classList.remove('active');
          modeSkipBtn.classList.remove('active');
        };
      }
      
      if (modeSilentBtn) {
        modeSilentBtn.onclick = function() {
          insertMode = 'silent';
          modeDemoBtn.classList.remove('active');
          modeSilentBtn.classList.add('active');
          modeSkipBtn.classList.remove('active');
          // Pause audio when in silent mode
          if (ttsAudio) ttsAudio.pause();
          if (voiceoverClone) voiceoverClone.pause();
        };
      }
      
      if (modeSkipBtn) {
        modeSkipBtn.onclick = function() {
          insertMode = 'skip';
          modeDemoBtn.classList.remove('active');
          modeSilentBtn.classList.remove('active');
          modeSkipBtn.classList.add('active');
        };
      }
      
      // Segment navigation
      if (prevSegmentBtn) {
        prevSegmentBtn.onclick = function() {
          setCurrentSegment(currentSegmentIndex - 1);
        };
      }
      
      if (nextSegmentBtn) {
        nextSegmentBtn.onclick = function() {
          setCurrentSegment(currentSegmentIndex + 1);
        };
      }
      
      if (jumpToSegmentBtn) {
        jumpToSegmentBtn.onclick = function() {
          if (!scriptAnalysis || !scriptAnalysis.segments) return;
          
          var options = scriptAnalysis.segments.map(function(seg, idx) {
            return (idx + 1) + '. ' + seg.type.toUpperCase() + ': ' + seg.text.substring(0, 40) + '...';
          }).join('\\n');
          
          showCustomPrompt(options + '\\n\\nEnter segment number:', '🎯 Jump to Segment', function(choice) {
            if (choice) {
              var idx = parseInt(choice) - 1;
              if (!isNaN(idx) && idx >= 0 && idx < scriptAnalysis.segments.length) {
                setCurrentSegment(idx);
              }
            }
          });
        };
      }
      
      // Resume controls
      if (resumeContinueBtn) {
        resumeContinueBtn.onclick = function() {
          // Continue recording from current position
          pauseInsertPanel.style.display = 'none';
          pauseBtn.click(); // Toggle pause/resume
        };
      }
      
      if (resumeRestartSegmentBtn) {
        resumeRestartSegmentBtn.onclick = function() {
          // Restart current segment - scroll to segment start, resume audio from segment
          if (scriptAnalysis && scriptAnalysis.segments && scriptAnalysis.segments[currentSegmentIndex]) {
            setCurrentSegment(currentSegmentIndex);
          }
          pauseInsertPanel.style.display = 'none';
          pauseBtn.click();
        };
      }
      
      if (resumeSkipAheadBtn) {
        resumeSkipAheadBtn.onclick = function() {
          // Skip to next segment
          if (scriptAnalysis && scriptAnalysis.segments) {
            setCurrentSegment(currentSegmentIndex + 1);
          }
          pauseInsertPanel.style.display = 'none';
          pauseBtn.click();
        };
      }
      
      // Show pause insert panel when paused (if script has analysis)
      function showPauseInsertPanel() {
        if (scriptAnalysis && scriptAnalysis.segments && scriptAnalysis.segments.length > 0) {
          updateSegmentInfo();
          pauseInsertPanel.style.display = 'block';
        }
      }
      
      // Hide pause insert panel
      function hidePauseInsertPanel() {
        pauseInsertPanel.style.display = 'none';
      }
      
      // Camera toggle controls - now actually stops/starts camera stream
      cameraToggleBtn.onclick = function() {
        if (isCameraOn) {
          // Turn camera OFF - stop the stream to turn off camera light
          isCameraOn = false;
          cameraOffOverlay.classList.add('visible');
          cameraToggleBtn.textContent = '📹 Off';
          cameraToggleBtn.classList.remove('active');
          
          // Actually stop video tracks to turn off camera light
          if (stream) {
            var videoTracks = stream.getVideoTracks();
            videoTracks.forEach(function(track) { 
              track.stop(); // This turns off the camera light
            });
            isCameraStreamActive = false;
          }
          console.log('📹 Camera turned OFF - stream stopped');
        } else {
          // Turn camera ON - re-acquire camera stream
          isCameraOn = true;
          cameraToggleBtn.textContent = '📹 ...';
          
          navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: true
          }).then(function(newStream) {
            stream = newStream;
            window.cameraStream = newStream;
            isCameraStreamActive = true;
            
            preview.srcObject = newStream;
            preview.play().catch(console.error);
            
            // Also update PIP video
            pipVideo.srcObject = newStream;
            pipVideo.play().catch(console.error);
            
            cameraOffOverlay.classList.remove('visible');
            cameraToggleBtn.textContent = '📹 On';
            cameraToggleBtn.classList.add('active');
            console.log('📹 Camera turned ON - stream re-acquired');
          }).catch(function(err) {
            console.error('Failed to re-acquire camera:', err);
            isCameraOn = false;
            cameraToggleBtn.textContent = '📹 Error';
          });
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
      
      // Use Logo button - switch to logo in PIP instead of camera
      useLogoBtn.onclick = function() {
        useLogo = !useLogo;
        if (useLogo) {
          useLogoBtn.textContent = '📹 Use Camera';
          useLogoBtn.classList.add('active');
          console.log('🖼️ Switched to logo mode for PIP');
        } else {
          useLogoBtn.textContent = '🖼️ Use Logo';
          useLogoBtn.classList.remove('active');
          console.log('📹 Switched to camera mode for PIP');
        }
      };
      
      // PIP overlay controls
      pipCameraBtn.onclick = function(e) {
        e.stopPropagation();
        useLogo = false;
        pipVideo.style.display = '';
        pipLogoContainer.style.display = 'none';
        pipCameraBtn.classList.add('active');
        pipLogoBtn.classList.remove('active');
      };
      
      pipLogoBtn.onclick = function(e) {
        e.stopPropagation();
        useLogo = true;
        pipVideo.style.display = 'none';
        pipLogoContainer.style.display = '';
        pipLogoBtn.classList.add('active');
        pipCameraBtn.classList.remove('active');
      };
      
      pipHideBtn.onclick = function(e) {
        e.stopPropagation();
        pipOverlay.classList.add('hidden');
      };
      
      // Make PIP overlay draggable anywhere on the video container
      var isPipDragging = false;
      var pipDragOffsetX = 0;
      var pipDragOffsetY = 0;
      
      pipOverlay.addEventListener('mousedown', function(e) {
        // Don't start drag if clicking on a button
        if (e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        e.stopPropagation();
        isPipDragging = true;
        pipOverlay.classList.add('dragging');
        
        var rect = pipOverlay.getBoundingClientRect();
        pipDragOffsetX = e.clientX - rect.left;
        pipDragOffsetY = e.clientY - rect.top;
        
        console.log('🖱️ PIP drag started');
      });
      
      document.addEventListener('mousemove', function(e) {
        if (!isPipDragging) return;
        e.preventDefault();
        
        var container = document.querySelector('.video-container');
        var containerRect = container.getBoundingClientRect();
        var pipWidth = pipOverlay.offsetWidth;
        var pipHeight = pipOverlay.offsetHeight;
        
        // Calculate new position relative to container
        var newX = e.clientX - containerRect.left - pipDragOffsetX;
        var newY = e.clientY - containerRect.top - pipDragOffsetY;
        
        // Constrain to container bounds with 10px padding
        newX = Math.max(10, Math.min(newX, containerRect.width - pipWidth - 10));
        newY = Math.max(10, Math.min(newY, containerRect.height - pipHeight - 10));
        
        // Apply position
        pipOverlay.style.left = newX + 'px';
        pipOverlay.style.top = newY + 'px';
        pipOverlay.style.right = 'auto';
        pipOverlay.style.bottom = 'auto';
        
        // Store position for canvas drawing
        pipPosition.x = newX;
        pipPosition.y = newY;
      });
      
      document.addEventListener('mouseup', function(e) {
        if (isPipDragging) {
          isPipDragging = false;
          pipOverlay.classList.remove('dragging');
          console.log('🖱️ PIP drag ended at:', pipPosition);
        }
      });
      
      // Also handle touch events for mobile
      pipOverlay.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        isPipDragging = true;
        pipOverlay.classList.add('dragging');
        
        var touch = e.touches[0];
        var rect = pipOverlay.getBoundingClientRect();
        pipDragOffsetX = touch.clientX - rect.left;
        pipDragOffsetY = touch.clientY - rect.top;
      }, { passive: false });
      
      document.addEventListener('touchmove', function(e) {
        if (!isPipDragging) return;
        e.preventDefault();
        
        var touch = e.touches[0];
        var container = document.querySelector('.video-container');
        var containerRect = container.getBoundingClientRect();
        var pipWidth = pipOverlay.offsetWidth;
        var pipHeight = pipOverlay.offsetHeight;
        
        var newX = touch.clientX - containerRect.left - pipDragOffsetX;
        var newY = touch.clientY - containerRect.top - pipDragOffsetY;
        
        newX = Math.max(10, Math.min(newX, containerRect.width - pipWidth - 10));
        newY = Math.max(10, Math.min(newY, containerRect.height - pipHeight - 10));
        
        pipOverlay.style.left = newX + 'px';
        pipOverlay.style.top = newY + 'px';
        pipOverlay.style.right = 'auto';
        pipOverlay.style.bottom = 'auto';
        
        pipPosition.x = newX;
        pipPosition.y = newY;
      }, { passive: false });
      
      document.addEventListener('touchend', function() {
        if (isPipDragging) {
          isPipDragging = false;
          pipOverlay.classList.remove('dragging');
        }
      });
      
      // Music loop toggle
      var musicLoopToggle = document.getElementById('musicLoopToggle');
      musicLoopToggle.onchange = function() {
        bgMusic.loop = this.checked;
        // Also sync clone if exists
        if (musicClone) musicClone.loop = this.checked;
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
          isCameraStreamActive = true;
          isCameraOn = true;
          
          preview.srcObject = mediaStream;
          preview.muted = true;
          
          // Also set PIP video source
          pipVideo.srcObject = mediaStream;
          pipVideo.muted = true;
          pipVideo.play().catch(console.error);
          
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
        
        // Stop any playing audio and reset clones from previous recording
        stopAllAudio();
        voiceoverClone = null;
        musicClone = null;
        ttsAudio = null;
        
        status.textContent = 'Select screen...';
        status.className = 'status countdown';
        
        // Request screen share WITH audio option - user should enable "Share tab audio"
        navigator.mediaDevices.getDisplayMedia({
          video: { width: 1920, height: 1080, frameRate: 30 },
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        }).then(function(displayStr) {
          // Check if system audio was captured
          var hasSystemAudio = displayStr.getAudioTracks().length > 0;
          console.log('🖥️ Screen shared, has system audio:', hasSystemAudio);
          displayStream = displayStr;
          window.displayStream = displayStr;
          
          // Handle user clicking "Stop Sharing" in browser UI
          displayStr.getVideoTracks().forEach(function(track) {
            track.onended = function() {
              console.log('🛑 Screen share stopped by user');
              // Hide screen share indicator
              screenShareIndicator.classList.remove('visible');
              cameraOffOverlay.classList.remove('screen-active');
              
              if (isRecording) {
                // Auto-stop recording when screen share ends
                stopBtn.click();
              } else if (isCountingDown) {
                // Cancel countdown if screen share ends
                cancelCountdown.click();
              }
            };
          });
          
          // Show screen share indicator
          screenShareIndicator.classList.add('visible');
          
          // Make camera off overlay transparent so screen share is visible
          cameraOffOverlay.classList.add('screen-active');
          
          preview.srcObject = displayStream;
          preview.muted = true; // Keep muted to prevent feedback
          preview.play().then(function() {
            console.log('✅ Screen share preview playing');
            status.textContent = '✅ Screen selected - Configure options below';
            status.className = 'status ready';
          }).catch(function(playErr) {
            console.error('Screen share preview play error:', playErr);
            status.textContent = '✅ Screen selected';
            status.className = 'status ready';
          });
          
          // Show the audio options dialog immediately
          showAudioOptionsDialog();
          
        }).catch(function(e) {
          console.error('Screen share error:', e);
          status.textContent = 'Ready';
          status.className = 'status ready';
          if (e.name !== 'NotAllowedError') {
            showCustomAlert('Screen share error: ' + e.message, 'Screen Share Error');
          }
        });
      };
      
      // Stop all audio helper - with thorough cleanup (called when STOPPING recording)
      function stopAllAudio() {
        console.log('🔇 Stopping all audio PERMANENTLY');
        
        // Set guard flag FIRST to prevent any callbacks from restarting audio
        isStopped = true;
        
        // Reset active states IMMEDIATELY to prevent any play attempts
        voiceoverActive = false;
        ttsActive = false;
        musicActive = false;
        
        // Clear word highlighting interval
        if (wordHighlightInterval) {
          clearInterval(wordHighlightInterval);
          wordHighlightInterval = null;
        }
        
        // Clear scroll interval
        if (scrollInterval) {
          clearInterval(scrollInterval);
          scrollInterval = null;
        }
        
        try {
          // Stop original voiceover completely - remove ALL event handlers first
          if (voiceover) { 
            voiceover.onplay = null;
            voiceover.onended = null;
            voiceover.onloadedmetadata = null;
            voiceover.ontimeupdate = null;
            voiceover.onerror = null;
            voiceover.pause(); 
            voiceover.currentTime = 0;
          }
          // Stop cloned voiceover and DESTROY it
          if (voiceoverClone) {
            voiceoverClone.onplay = null;
            voiceoverClone.onended = null;
            voiceoverClone.onloadedmetadata = null;
            voiceoverClone.ontimeupdate = null;
            voiceoverClone.onerror = null;
            voiceoverClone.pause();
            voiceoverClone.currentTime = 0;
            try { 
              voiceoverClone.src = ''; 
              voiceoverClone.removeAttribute('src');
              voiceoverClone.load(); 
            } catch(e) {}
            voiceoverClone = null; // Nullify immediately
          }
          // Stop TTS audio and DESTROY it completely
          if (ttsAudio) { 
            ttsAudio.onplay = null;
            ttsAudio.onended = null;
            ttsAudio.onloadedmetadata = null;
            ttsAudio.ontimeupdate = null;
            ttsAudio.onerror = null;
            ttsAudio.pause(); 
            ttsAudio.currentTime = 0;
            try { 
              ttsAudio.src = ''; 
              ttsAudio.removeAttribute('src');
              ttsAudio.load(); 
            } catch(e) {}
            ttsAudio = null; // Nullify immediately
          }
          // Stop original background music
          if (bgMusic) { 
            bgMusic.onplay = null;
            bgMusic.onended = null;
            bgMusic.ontimeupdate = null;
            bgMusic.pause(); 
            bgMusic.currentTime = 0;
          }
          // Stop cloned music and DESTROY it
          if (musicClone) {
            musicClone.onplay = null;
            musicClone.onended = null;
            musicClone.ontimeupdate = null;
            musicClone.pause();
            musicClone.currentTime = 0;
            try { 
              musicClone.src = ''; 
              musicClone.removeAttribute('src');
              musicClone.load(); 
            } catch(e) {}
            musicClone = null; // Nullify immediately
          }
          
          // Close audio context to fully release
          if (audioContext && audioContext.state !== 'closed') {
            audioContext.close().catch(function(e) { console.log('Audio context close:', e); });
            audioContext = null;
          }
        } catch(e) {
          console.error('Error stopping audio:', e);
        }
        
        console.log('✅ All audio stopped permanently, isStopped flag set, all audio nullified');
      }
      
      // Audio options dialog
      function showAudioOptionsDialog() {
        var hasScript = scriptSelect.value && scripts.find(function(s) { return s.id === scriptSelect.value; });
        var hasVoiceover = voiceoverSelect.value && voiceovers.find(function(v) { return v.id === voiceoverSelect.value; });
        var hasMusic = musicSelect.value && musicList.find(function(m) { return m.id === musicSelect.value; });
        
        var dialogHtml = '<div id="audioOptionsDialog" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:200;">';
        dialogHtml += '<div style="background:#1a1a2e;padding:30px;border-radius:16px;max-width:500px;width:90%;">';
        dialogHtml += '<h2 style="margin-bottom:20px;font-size:20px;">🎬 Ready to Record!</h2>';
        dialogHtml += '<p style="opacity:0.7;margin-bottom:15px;font-size:14px;">Configure audio options below, then click "Start Recording" to begin the countdown.</p>';
        
        if (hasScript) {
          dialogHtml += '<div style="margin-bottom:20px;padding:15px;background:#2a2a3e;border-radius:8px;">';
          dialogHtml += '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;">';
          dialogHtml += '<input type="checkbox" id="useTTS" checked style="width:20px;height:20px;">';
          dialogHtml += '<div><strong>🗣️ Generate TTS Voiceover</strong><br><small style="opacity:0.7;">Convert script to speech using AI voice</small></div>';
          dialogHtml += '</label>';
          
          // Show Original vs Enhanced option if we have enhanced content OR script analysis
          var hasEnhancedContent = window.enhancedScriptContent && window.enhancedScriptContent.trim().length > 0;
          var hasAnalysis = scriptAnalysis && scriptAnalysis.segments && scriptAnalysis.segments.length > 0;
          
          if (hasEnhancedContent || hasAnalysis) {
            dialogHtml += '<div id="ttsVersionSelect" style="margin-top:12px;padding:10px;background:rgba(99,102,241,0.1);border-radius:6px;border:1px solid #6366f1;">';
            dialogHtml += '<div style="font-size:12px;font-weight:600;margin-bottom:8px;">✨ Script Version for TTS:</div>';
            dialogHtml += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:6px;">';
            dialogHtml += '<input type="radio" name="ttsVersion" value="original" style="width:16px;height:16px;">';
            dialogHtml += '<span style="font-size:13px;">📄 Original Script</span>';
            dialogHtml += '</label>';
            dialogHtml += '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">';
            dialogHtml += '<input type="radio" name="ttsVersion" value="enhanced" checked style="width:16px;height:16px;">';
            var enhancedLabel = hasEnhancedContent ? '✨ Enhanced Script (with your accepted changes)' : '✨ Enhanced Script (with pause markers)';
            dialogHtml += '<span style="font-size:13px;">' + enhancedLabel + '</span>';
            dialogHtml += '</label>';
            if (hasEnhancedContent) {
              dialogHtml += '<div style="font-size:11px;color:#22c55e;margin-top:8px;">✅ Enhanced script ready with your accepted changes</div>';
            } else {
              dialogHtml += '<div style="font-size:11px;opacity:0.7;margin-top:8px;">Enhanced version syncs with teleprompter segments</div>';
            }
            dialogHtml += '</div>';
          }
          
          dialogHtml += '</div>';
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
        dialogHtml += '<button id="confirmOptions" class="primary" style="padding:12px 24px;font-weight:600;">🎬 Start Recording</button>';
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
          
          // Check which TTS version to use (original vs enhanced)
          var useEnhancedScript = false;
          var ttsVersionRadios = document.querySelectorAll('input[name="ttsVersion"]');
          
          // Check if we have enhanced content available
          var hasEnhancedAvailable = (window.enhancedScriptContent && window.enhancedScriptContent.trim().length > 0) ||
                                     (scriptAnalysis && scriptAnalysis.segments && scriptAnalysis.segments.length > 0);
          
          console.log('🎯 TTS Version Check:', {
            hasRadios: ttsVersionRadios.length > 0,
            hasEnhancedContent: !!(window.enhancedScriptContent && window.enhancedScriptContent.trim().length > 0),
            hasAnalysis: !!(scriptAnalysis && scriptAnalysis.segments),
            hasEnhancedAvailable: hasEnhancedAvailable
          });
          
          if (ttsVersionRadios.length > 0) {
            // User had option to choose - check their selection
            ttsVersionRadios.forEach(function(radio) {
              if (radio.checked && radio.value === 'enhanced') {
                useEnhancedScript = true;
              }
            });
          } else if (hasEnhancedAvailable) {
            // No radios shown but we have enhanced content - default to using it
            useEnhancedScript = true;
            console.log('📌 Auto-selecting enhanced script (no radio options shown but content available)');
          }
          
          console.log('🎤 TTS will use:', useEnhancedScript ? 'ENHANCED' : 'ORIGINAL');
          
          document.getElementById('audioOptionsDialog').remove();
          
          if (useTTS && hasScript) {
            // Show loading state for TTS generation
            status.textContent = 'Generating TTS audio...';
            status.className = 'status countdown';
            var scriptToUse = scripts.find(function(s) { return s.id === scriptSelect.value; });
            
            if (scriptToUse) {
              var scriptText = scriptToUse.content;
              
              console.log('📄 Original script length:', scriptText.length, 'chars');
              console.log('📝 Enhanced content available:', window.enhancedScriptContent ? window.enhancedScriptContent.length + ' chars' : 'NONE');
              
              // If enhanced version selected, use the saved enhanced script with accepted changes
              if (useEnhancedScript) {
                // Priority: 1. User's accepted changes (window.enhancedScriptContent)
                //           2. Build from analysis segments as fallback
                if (window.enhancedScriptContent && window.enhancedScriptContent.trim().length > 0) {
                  scriptText = window.enhancedScriptContent;
                  console.log('✨✨✨ USING ENHANCED SCRIPT WITH ACCEPTED CHANGES ✨✨✨');
                  console.log('📝 Enhanced script preview:', scriptText.substring(0, 200) + '...');
                } else if (scriptAnalysis && scriptAnalysis.segments) {
                  scriptText = buildEnhancedScript(scriptAnalysis);
                  console.log('✨ Using ENHANCED script (built from segments)');
                } else {
                  console.log('⚠️ Enhanced selected but no enhanced content found, using original');
                }
                // Note: Teleprompter will be updated below with the clean script
              } else {
                console.log('📄 Using ORIGINAL script for TTS');
              }
              
              // Log what script version we're starting with BEFORE cleaning
              console.log('📋 PRE-CLEAN scriptText preview:', scriptText.substring(0, 200));
              console.log('📋 Contains [PAUSE]?', scriptText.includes('[PAUSE'));
              console.log('📋 Contains [IMPROVEMENT NOTES:]?', scriptText.includes('[IMPROVEMENT NOTES:]'));
              
              // Clean the script for TTS - remove markers that shouldn't be spoken
              var ttsCleanScript = cleanScriptForTTS(scriptText);
              console.log('🔊 TTS clean script length:', ttsCleanScript.length, 'chars');
              console.log('📋 POST-CLEAN Contains [PAUSE]?', ttsCleanScript.includes('[PAUSE'));
              console.log('📋 POST-CLEAN Contains [IMPROVEMENT NOTES:]?', ttsCleanScript.includes('[IMPROVEMENT NOTES:]'));
              
              // Store the CLEAN script for teleprompter - must match TTS audio exactly for sync
              window.currentTTSScript = ttsCleanScript;
              console.log('💾 Stored window.currentTTSScript (clean):', ttsCleanScript.substring(0, 150));
              
              // Update teleprompter to show the CLEAN script (what TTS will speak)
              // This ensures word tracking matches audio exactly
              if (scriptContent) {
                console.log('🖥️ Rendering teleprompter with CLEAN script');
                renderScriptWithWordTracking(ttsCleanScript);
              }
              
              // Use the CLEAN script for TTS (without markers)
              console.log('🎤 Calling generateTTS with CLEAN script');
              generateTTS(ttsCleanScript, function() {
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
      
      // Note: cleanScriptForTTS is defined earlier in the file (around line 2115)
      // to ensure it's available for download handlers
      
      // Build enhanced script from analysis segments
      function buildEnhancedScript(analysis) {
        if (!analysis || !analysis.segments) return '';
        
        var enhancedParts = [];
        
        analysis.segments.forEach(function(seg, idx) {
          // Add segment text
          enhancedParts.push(seg.text);
          
          // Add natural pause markers if suggested
          if (seg.suggestedPauseAfter && idx < analysis.segments.length - 1) {
            // Add a short pause indicator (TTS engines often respect "..." or commas for pauses)
            enhancedParts.push('...');
          }
        });
        
        return enhancedParts.join(' ');
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
            // Wait for audio metadata to get duration
            ttsAudio.onloadedmetadata = function() {
              console.log('✅ TTS audio ready, duration:', ttsAudio.duration, 'seconds');
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
        // Reset clones and audio state
        stopAllAudio();
        voiceoverClone = null;
        musicClone = null;
        ttsAudio = null;
        
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
        var compositingStarted = false; // Guard against multiple calls
        
        function onVideoReady() {
          videosReady++;
          if (videosReady >= totalVideos && !compositingStarted) {
            compositingStarted = true;
            startCompositing(useVoiceover, useMusic, useTTS);
          }
        }
        
        screenVideo.oncanplay = onVideoReady;
        webcamVideo.oncanplay = onVideoReady;
        screenVideo.play().catch(console.error);
        webcamVideo.play().catch(console.error);
        
        // Fallback timeout if videos don't fire canplay
        setTimeout(function() {
          if (!compositingStarted) {
            console.log('⚠️ Force starting compositing (timeout)...');
            compositingStarted = true;
            startCompositing(useVoiceover, useMusic, useTTS);
          }
        }, 2000);
      }
      
      // Start compositing and recording
      function startCompositing(useVoiceover, useMusic, useTTS) {
        // Prevent duplicate calls
        if (isRecording) {
          console.log('⚠️ Already recording, ignoring duplicate startCompositing call');
          return;
        }
        
        isRecording = true;
        isCountingDown = false;
        isPaused = false; // Reset pause state for new recording
        isStopped = false; // Reset stop guard for new recording
        
        // Reset chunks for new recording
        chunks = [];
        
        // Reset timer display
        timer.textContent = '00:00';
        
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
            voiceoverClone = new Audio(voiceover.src);
            voiceoverClone.crossOrigin = 'anonymous';
            voiceoverClone.volume = 1.0;
            
            voiceoverAudioSource = audioContext.createMediaElementSource(voiceoverClone);
            var voiceoverGain = audioContext.createGain();
            voiceoverGain.gain.value = 1.0;
            voiceoverAudioSource.connect(voiceoverGain);
            voiceoverGain.connect(destination);
            voiceoverGain.connect(audioContext.destination); // Also play to speakers
            
            // Keep original voiceover for dropdown reference, use clone for playback
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
            musicClone = new Audio(bgMusic.src);
            musicClone.crossOrigin = 'anonymous';
            musicClone.volume = 0.3;
            musicClone.loop = bgMusic.loop;
            
            musicAudioSource = audioContext.createMediaElementSource(musicClone);
            var musicGain = audioContext.createGain();
            musicGain.gain.value = 0.3;
            musicAudioSource.connect(musicGain);
            musicGain.connect(destination); // Connect to recording
            musicGain.connect(audioContext.destination); // Also play to speakers
            
            // Keep original bgMusic for dropdown reference, use clone for playback
            console.log('🎵 Music audio connected to recording');
          } catch(e) {
            console.error('Music source error:', e);
          }
        }
        
        // Log audio configuration for debugging
        console.log('🎧 Audio configuration:', {
          mic: stream ? stream.getAudioTracks().length > 0 : false,
          systemAudio: displayStream ? displayStream.getAudioTracks().length > 0 : false,
          voiceover: useVoiceover && voiceoverClone ? true : false,
          tts: useTTS && ttsAudio ? true : false,
          music: useMusic && musicClone ? true : false
        });
        
        audioSourcesConnected = true;
        
        // Combined stream
        var finalTracks = canvasStream.getVideoTracks().concat(destination.stream.getAudioTracks());
        var combinedStream = new MediaStream(finalTracks);
        
        // Use MP4 format for better compatibility - fallback to webm if mp4 not supported
        var mimeType = 'video/webm;codecs=vp9';
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')) {
          mimeType = 'video/mp4;codecs=h264,aac';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          mimeType = 'video/webm;codecs=vp9,opus';
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
          mimeType = 'video/webm;codecs=vp8,opus';
        }
        console.log('🎥 Using recording format:', mimeType);
        recordedMimeType = mimeType; // Store globally for later use
        
        mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: mimeType,
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000
        });
        window.mediaRecorder = mediaRecorder;
        
        mediaRecorder.ondataavailable = function(e) {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        mediaRecorder.onstop = function() {
          console.log('🛑 Recording stopped, chunks:', chunks.length);
          isRecording = false;
          isCountingDown = false;
          
          // Cancel animation frame
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          
          // Clear all intervals
          if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
          if (scrollInterval) { clearInterval(scrollInterval); scrollInterval = null; }
          
          // Stop all audio completely and remove event listeners
          stopAllAudio();
          
          // Clear progress interval
          if (audioProgressInterval) {
            clearInterval(audioProgressInterval);
            audioProgressInterval = null;
          }
          
          // Reset audio sources, clones, and TTS for next recording
          voiceoverAudioSource = null;
          ttsAudioSource = null;
          musicAudioSource = null;
          voiceoverClone = null;
          musicClone = null;
          ttsAudio = null; // Clear TTS so a fresh one is generated for next recording
          audioSourcesConnected = false;
          
          // Reset word tracking state
          scriptWords = [];
          currentWordIndex = 0;
          
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
          
          // Hide screen share indicator and reset camera overlay
          screenShareIndicator.classList.remove('visible');
          cameraOffOverlay.classList.remove('screen-active');
          
          recIndicator.style.display = 'none';
          audioControlPanel.classList.remove('visible');
          audioControlPanel.style.display = 'none';
          pipOverlay.classList.add('hidden'); // Hide PIP overlay
          showTeleprompterControls(false); // Hide speed controls and cursor
          startBtn.style.display = 'none';
          pauseBtn.style.display = 'none';
          stopBtn.style.display = 'none';
          
          // Check if we have recording data
          if (chunks.length === 0) {
            console.error('❌ No recording data captured');
            status.textContent = '⚠️ No recording data - try again';
            status.className = 'status error';
            startBtn.style.display = '';
            return;
          }
          
          // Show save UI
          videoNameInput.style.display = '';
          videoNameInput.value = 'recording_' + new Date().toISOString().slice(0, 10);
          videoNameInput.focus();
          saveBtn.style.display = '';
          saveBtn.textContent = '💾 Save';
          saveBtn.disabled = false;
          resetBtn.style.display = '';
          
          status.textContent = '✅ Recording Complete - Enter name to save';
          status.className = 'status ready';
          
          // Determine file type based on recordedMimeType (global variable)
          var fileType = recordedMimeType.startsWith('video/mp4') ? 'video/mp4' : 'video/webm';
          var blob = new Blob(chunks, { type: fileType });
          console.log('📦 Recording blob created:', fileType, 'size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
          
          // Preview the recorded video
          preview.srcObject = null;
          preview.src = URL.createObjectURL(blob);
          preview.controls = true;
          preview.muted = false;
          
          // Enable download link immediately as backup
          console.log('✅ Save UI shown, ready for user input');
        };
        
        // Start recording with 1 second timeslice for continuous data availability
        // This helps prevent data loss for long recordings and enables progress monitoring
        mediaRecorder.start(1000);
        startTime = Date.now();
        console.log('🎬 MediaRecorder started with 1s timeslice');
        
        // Reset pause tracking
        pausedTime = 0;
        pauseStartTime = 0;
        
        timerInterval = setInterval(function() {
          if (!isPaused) {
            // Subtract paused time from elapsed calculation
            var elapsed = Math.floor((Date.now() - startTime - pausedTime) / 1000);
            timer.textContent = formatTime(elapsed);
          }
        }, 1000);
        
        // Draw loop - continue even when paused (mediaRecorder state is 'paused')
        function drawFrame() {
          // Only stop if mediaRecorder is fully inactive (not paused, not recording)
          if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            console.log('🎬 Draw loop stopped - recorder inactive');
            animationFrameId = null;
            return;
          }
          
          ctx.drawImage(screenVideo, 0, 0, 1920, 1080);
          
          // Calculate PIP position (default bottom-right, or custom dragged position)
          var pipWidth = 320;
          var pipHeight = 180;
          var pipX, pipY;
          
          if (pipPosition.x !== null && pipPosition.y !== null) {
            // Use custom position (scaled from preview to canvas)
            var scaleX = 1920 / document.querySelector('.video-container').offsetWidth;
            var scaleY = 1080 / document.querySelector('.video-container').offsetHeight;
            pipX = pipPosition.x * scaleX;
            pipY = pipPosition.y * scaleY;
          } else {
            // Default bottom-right
            pipX = 1920 - pipWidth - 20;
            pipY = 1080 - pipHeight - 20;
          }
          
          // Decide whether to show camera or logo in PIP
          if (useLogo || !isCameraOn) {
            // Draw logo/avatar in PIP
            var gradient = ctx.createLinearGradient(pipX, pipY, pipX + pipWidth, pipY + pipHeight);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#2a2a4e');
            ctx.fillStyle = gradient;
            ctx.fillRect(pipX, pipY, pipWidth, pipHeight);
            
            // Draw custom logo if uploaded, otherwise default icon
            if (customLogoImage && customLogoImage.complete) {
              var logoSize = Math.min(pipWidth * 0.6, pipHeight * 0.8);
              var logoX = pipX + (pipWidth - logoSize) / 2;
              var logoY = pipY + (pipHeight - logoSize) / 2;
              ctx.drawImage(customLogoImage, logoX, logoY, logoSize, logoSize);
            } else {
              ctx.fillStyle = '#6366f1';
              ctx.font = '48px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🎥', pipX + pipWidth/2, pipY + pipHeight/2);
            }
            
            // Draw PIP border
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.strokeRect(pipX, pipY, pipWidth, pipHeight);
          } else if (isCameraOn && isCameraStreamActive) {
            // Draw camera in PIP
            if (isCameraBlurred) {
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
          }
          // If neither camera nor logo - no PIP is drawn (hidden state)
          
          // Continue loop for recording or paused state
          animationFrameId = requestAnimationFrame(drawFrame);
        }
        drawFrame();
        
        // Play audio - IMPORTANT: Only play ONE voiceover source to avoid overlap
        // If TTS is enabled, use that as primary voice. Otherwise use voiceover audio clone.
        
        // Show speed controls and reading cursor during recording
        showTeleprompterControls(true);
        
        // Word-level highlighting that syncs with audio time
        function startWordHighlighting(audio, audioDuration) {
          if (!scriptWords || scriptWords.length === 0) {
            console.log('⚠️ No scriptWords available for word tracking');
            return;
          }
          
          // Calculate words per millisecond based on audio duration
          var msPerWord = (audioDuration * 1000) / scriptWords.length;
          var lastHighlightedIndex = -1;
          
          console.log('📝 Word tracking started:');
          console.log('   - scriptWords.length:', scriptWords.length);
          console.log('   - audioDuration:', audioDuration, 'seconds');
          console.log('   - msPerWord:', msPerWord.toFixed(1), 'ms');
          console.log('   - First few words:', scriptWords.slice(0, 5).map(function(w) { return w.text; }).join(' '));
          
          // Clear any existing word highlight interval
          if (wordHighlightInterval) {
            clearInterval(wordHighlightInterval);
          }
          
          wordHighlightInterval = setInterval(function() {
            if (isPaused || isStopped || !audio) return;
            
            // Calculate which word should be highlighted based on audio time
            var currentTimeMs = audio.currentTime * 1000;
            var targetWordIndex = Math.floor(currentTimeMs / msPerWord);
            
            // Clamp to valid range
            targetWordIndex = Math.max(0, Math.min(scriptWords.length - 1, targetWordIndex));
            
            // Only update if index changed
            if (targetWordIndex !== lastHighlightedIndex) {
              // Remove previous highlight
              if (lastHighlightedIndex >= 0 && scriptWords[lastHighlightedIndex] && scriptWords[lastHighlightedIndex].element) {
                scriptWords[lastHighlightedIndex].element.classList.remove('word-highlight');
              }
              
              // Add new highlight
              if (scriptWords[targetWordIndex] && scriptWords[targetWordIndex].element) {
                scriptWords[targetWordIndex].element.classList.add('word-highlight');
                
                // Scroll word into view if needed
                var wordEl = scriptWords[targetWordIndex].element;
                var containerRect = scriptContent.getBoundingClientRect();
                var wordRect = wordEl.getBoundingClientRect();
                
                // If word is outside visible area, scroll to it
                if (wordRect.top < containerRect.top + 50 || wordRect.bottom > containerRect.bottom - 50) {
                  wordEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
              
              lastHighlightedIndex = targetWordIndex;
              currentWordIndex = targetWordIndex;
            }
          }, 100); // Check every 100ms for smooth highlighting
        }
        
        // Function to start teleprompter scroll with proper audio sync
        // This now directly ties scroll position to audio.currentTime for perfect sync
        function startTeleprompterScrollSync(audioDuration, audio) {
          var scrollIntervalMs = 50;
          
          // Start word-level highlighting
          startWordHighlighting(audio, audioDuration);
          
          // Calculate scroll parameters
          var scrollableHeight = scriptContent ? (scriptContent.scrollHeight - scriptContent.clientHeight) : 0;
          var effectiveDuration = audioDuration && audioDuration > 0 ? audioDuration : 60;
          
          console.log('📜 Teleprompter sync: scrollHeight=' + scrollableHeight + 'px, audioDuration=' + effectiveDuration.toFixed(1) + 's');
          
          // Clear any existing scroll interval
          if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
          }
          
          // If no scrollable content, just return
          if (scrollableHeight <= 0) {
            console.log('📜 No scrollable content, skipping scroll sync');
            return;
          }
          
          // Sync scroll position directly to audio currentTime
          scrollInterval = setInterval(function() {
            if (isPaused || isStopped || !scriptContent) return;
            
            var currentTime = 0;
            var totalDuration = effectiveDuration;
            
            // Get current audio position if available
            if (audio && !isNaN(audio.currentTime) && !isNaN(audio.duration) && audio.duration > 0) {
              currentTime = audio.currentTime;
              totalDuration = audio.duration;
            }
            
            // Calculate target scroll position based on audio progress
            // DO NOT apply speed multiplier here - scroll must stay perfectly in sync with audio
            var progress = currentTime / totalDuration;
            progress = Math.max(0, Math.min(1, progress)); // Clamp 0-1
            
            var targetScroll = Math.floor(progress * scrollableHeight);
            
            // Directly set scroll position for perfect sync (no easing which can cause drift)
            scriptContent.scrollTop = targetScroll;
            
            // Update reading cursor position
            updateReadingCursor();
          }, scrollIntervalMs);
        }
        
        if (useTTS && ttsAudio) {
          // Guard: check if stopped before playing
          if (isStopped) {
            console.log('⚠️ Recording stopped, skipping TTS playback');
            return;
          }
          
          // Teleprompter should already be rendered with the clean TTS script
          // from generateTTS callback - only re-render if somehow not set
          if (!window.currentTTSScript) {
            console.log('⚠️ currentTTSScript not set, using fallback');
            var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
            var fallbackText = window.enhancedScriptContent || (selectedScript ? selectedScript.content : '');
            // Clean it before using
            var scriptText = cleanScriptForTTS(fallbackText);
            window.currentTTSScript = scriptText;
            if (scriptText && scriptContent) {
              renderScriptWithWordTracking(scriptText);
            }
          } else {
            console.log('✅ Using pre-set currentTTSScript (clean version):', window.currentTTSScript.substring(0, 100) + '...');
          }
          
          // Wait for TTS audio metadata before starting scroll sync
          if (ttsAudio && ttsAudio.duration && ttsAudio.duration > 0 && !isNaN(ttsAudio.duration)) {
            // Metadata already loaded
            console.log('🎤 TTS metadata already loaded, duration:', ttsAudio.duration);
            if (!isStopped && ttsAudio) {
              ttsAudio.play().catch(console.error);
              startTeleprompterScrollSync(ttsAudio.duration, ttsAudio);
            }
          } else if (ttsAudio) {
            // Wait for metadata to load
            ttsAudio.onloadedmetadata = function() {
              if (isStopped || !ttsAudio) return; // Guard check
              console.log('🎤 TTS metadata loaded, duration:', ttsAudio.duration);
              startTeleprompterScrollSync(ttsAudio.duration, ttsAudio);
            };
            if (!isStopped) {
              ttsAudio.play().catch(console.error);
            }
            
            // Fallback: start scroll after 2s if metadata doesn't load
            setTimeout(function() {
              if (!scrollInterval && !isStopped && ttsAudio) {
                console.log('⚠️ TTS metadata timeout, using default scroll speed');
                startTeleprompterScrollSync(60, ttsAudio); // Assume 60s as fallback
              }
            }, 2000);
          }
          
          // If user also selected voiceover, DON'T play it - TTS takes priority
          console.log('🎤 Playing TTS audio (voiceover disabled to prevent overlap)');
          
          // TTS ended handler
          if (ttsAudio) {
            ttsAudio.onended = function() {
              if (isStopped) return; // Don't do anything if stopped
              console.log('🎤 TTS audio ended');
              // Stop word highlighting when audio ends
              if (wordHighlightInterval) {
                clearInterval(wordHighlightInterval);
                wordHighlightInterval = null;
              }
            };
          }
        } else if (useVoiceover && voiceoverClone) {
          // Guard: check if stopped before playing
          if (isStopped) {
            console.log('⚠️ Recording stopped, skipping voiceover playback');
            return;
          }
          
          // For voiceover mode, we need to clean the script too for proper sync
          if (!window.currentTTSScript) {
            console.log('📜 Teleprompter (voiceover): cleaning script for sync');
            var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
            var fallbackText = window.enhancedScriptContent || (selectedScript ? selectedScript.content : '');
            // Clean it before using
            var scriptText = cleanScriptForTTS(fallbackText);
            window.currentTTSScript = scriptText;
            if (scriptText && scriptContent) {
              renderScriptWithWordTracking(scriptText);
            }
          } else {
            console.log('✅ Using pre-set currentTTSScript for voiceover sync');
          }
          
          // Wait for voiceover metadata before starting scroll sync
          if (voiceoverClone && voiceoverClone.duration && voiceoverClone.duration > 0 && !isNaN(voiceoverClone.duration)) {
            console.log('🎤 Voiceover metadata already loaded, duration:', voiceoverClone.duration);
            if (!isStopped && voiceoverClone) {
              voiceoverClone.play().catch(console.error);
              startTeleprompterScrollSync(voiceoverClone.duration, voiceoverClone);
            }
          } else if (voiceoverClone) {
            voiceoverClone.onloadedmetadata = function() {
              if (isStopped || !voiceoverClone) return; // Guard check
              console.log('🎤 Voiceover metadata loaded, duration:', voiceoverClone.duration);
              startTeleprompterScrollSync(voiceoverClone.duration, voiceoverClone);
            };
            if (!isStopped) {
              voiceoverClone.play().catch(console.error);
            }
            
            setTimeout(function() {
              if (!scrollInterval && !isStopped && voiceoverClone) {
                console.log('⚠️ Voiceover metadata timeout, using default scroll speed');
                startTeleprompterScrollSync(60, voiceoverClone);
              }
            }, 2000);
          }
          console.log('🎤 Playing voiceover audio (clone)');
          
          // Voiceover ended handler
          if (voiceoverClone) {
            voiceoverClone.onended = function() {
              if (isStopped) return;
              console.log('🎤 Voiceover audio ended');
              if (wordHighlightInterval) {
                clearInterval(wordHighlightInterval);
                wordHighlightInterval = null;
              }
            };
          }
        } else {
          // No audio - use default scroll speed, still render word tracking for visual
          var selectedScript = scripts.find(function(s) { return s.id === scriptSelect.value; });
          var scriptText = window.enhancedScriptContent || (selectedScript ? selectedScript.content : '');
          if (scriptText && scriptContent) {
            renderScriptWithWordTracking(scriptText);
          }
          if (!isStopped) {
            startTeleprompterScrollSync(null, null);
          }
        }
        
        // Background music is separate and can play alongside voice - use clone
        if (useMusic && musicClone && !isStopped) {
          musicClone.volume = 0.3;
          musicClone.play().catch(console.error);
          console.log('🎵 Playing background music (clone)');
        }
        
        showAudioControls(useVoiceover, useTTS, useMusic);
        
        // Show PIP overlay (draggable) - update its content based on mode
        pipOverlay.classList.remove('hidden');
        
        // Apply the logo position to PIP overlay if user dragged the logo
        if (pipPosition.x !== null && pipPosition.y !== null) {
          pipOverlay.style.left = pipPosition.x + 'px';
          pipOverlay.style.top = pipPosition.y + 'px';
          pipOverlay.style.right = 'auto';
          pipOverlay.style.bottom = 'auto';
          console.log('📍 PIP positioned at:', pipPosition);
        }
        
        if (useLogo || !isCameraOn) {
          pipVideo.style.display = 'none';
          pipLogoContainer.style.display = '';
          pipLogoBtn.classList.add('active');
          pipCameraBtn.classList.remove('active');
        } else {
          pipVideo.style.display = '';
          pipLogoContainer.style.display = 'none';
          pipCameraBtn.classList.add('active');
          pipLogoBtn.classList.remove('active');
        }
        
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
        
        audioControlPanel.style.display = '';
        audioControlPanel.classList.add('visible');
        updateAudioProgress();
      }
      
      // Update progress bars and status
      function updateAudioProgress() {
        // Clear any existing interval to prevent duplicates
        if (audioProgressInterval) {
          clearInterval(audioProgressInterval);
        }
        
        audioProgressInterval = setInterval(function() {
          // Only update if recording is active
          if (!isRecording) return;
          
          // Update voiceover - use clone if available
          var voAudio = voiceoverClone || voiceover;
          if (voiceoverActive && voAudio) {
            if (voAudio.duration) {
              document.getElementById('voProgress').style.width = (voAudio.currentTime / voAudio.duration * 100) + '%';
            }
            updateTrackStatus('voiceoverControls', voAudio);
          }
          // Update TTS
          if (ttsActive && ttsAudio) {
            if (ttsAudio.duration) {
              document.getElementById('ttsProgress').style.width = (ttsAudio.currentTime / ttsAudio.duration * 100) + '%';
            }
            updateTrackStatus('ttsControls', ttsAudio);
          }
          // Update music - use clone if available
          var musicAudio = musicClone || bgMusic;
          if (musicActive && musicAudio) {
            if (musicAudio.duration) {
              document.getElementById('musicProgress').style.width = (musicAudio.currentTime / musicAudio.duration * 100) + '%';
            }
            updateTrackStatus('musicControls', musicAudio);
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
      
      // Audio controls with visual feedback - use clones when available
      document.getElementById('voRewindBtn').onclick = function() { 
        var vo = voiceoverClone || voiceover;
        if (vo && vo.src) vo.currentTime = Math.max(0, vo.currentTime - 5); 
      };
      document.getElementById('voPlayPauseBtn').onclick = function() {
        if (isStopped) return; // Guard: don't play if recording stopped
        var vo = voiceoverClone || voiceover;
        if (!vo || !vo.src) {
          console.log('⚠️ No voiceover loaded');
          return;
        }
        if (vo.paused) { 
          vo.play().catch(function(e) { console.error('Voiceover play error:', e); }); 
          this.textContent = '⏸️'; 
        } else { 
          vo.pause(); 
          this.textContent = '▶️'; 
        }
      };
      document.getElementById('voStopBtn').onclick = function() { 
        var vo = voiceoverClone || voiceover;
        if (vo && vo.src) { 
          vo.pause(); 
          vo.currentTime = 0; 
          document.getElementById('voPlayPauseBtn').textContent = '▶️';
        }
      };
      document.getElementById('voForwardBtn').onclick = function() { 
        var vo = voiceoverClone || voiceover;
        if (vo && vo.src) vo.currentTime = Math.min(vo.duration || 0, vo.currentTime + 5); 
      };
      
      document.getElementById('ttsRewindBtn').onclick = function() { 
        if (ttsAudio) ttsAudio.currentTime = Math.max(0, ttsAudio.currentTime - 5); 
      };
      document.getElementById('ttsPlayPauseBtn').onclick = function() {
        if (isStopped) return; // Guard: don't play if recording stopped
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
        var music = musicClone || bgMusic;
        if (music && music.src) music.currentTime = Math.max(0, music.currentTime - 5); 
      };
      document.getElementById('musicPlayPauseBtn').onclick = function() {
        if (isStopped) return; // Guard: don't play if recording stopped
        var music = musicClone || bgMusic;
        if (!music || !music.src) {
          console.log('⚠️ No music loaded');
          return;
        }
        if (music.paused) { 
          music.play().catch(function(e) { console.error('Music play error:', e); }); 
          this.textContent = '⏸️'; 
        } else { 
          music.pause(); 
          this.textContent = '▶️'; 
        }
      };
      document.getElementById('musicStopBtn').onclick = function() { 
        var music = musicClone || bgMusic;
        if (music && music.src) { 
          music.pause(); 
          music.currentTime = 0; 
          document.getElementById('musicPlayPauseBtn').textContent = '▶️';
        }
      };
      document.getElementById('musicVolumeDownBtn').onclick = function() { 
        var music = musicClone || bgMusic;
        if (music) music.volume = Math.max(0, music.volume - 0.1); 
      };
      document.getElementById('musicVolumeUpBtn').onclick = function() { 
        var music = musicClone || bgMusic;
        if (music) music.volume = Math.min(1, music.volume + 0.1); 
      };
      document.getElementById('musicLoopBtn').onclick = function() {
        var music = musicClone || bgMusic;
        if (music) {
          music.loop = !music.loop;
          // Also sync original bgMusic loop state
          if (bgMusic) bgMusic.loop = music.loop;
          if (musicClone) musicClone.loop = music.loop;
          
          var loopStatus = document.getElementById('musicLoopStatus');
          if (music.loop) {
            loopStatus.textContent = '🔁 Loop: ON';
            this.classList.add('active');
          } else {
            loopStatus.textContent = '🔁 Loop: OFF';
            this.classList.remove('active');
          }
          // Sync with sidebar checkbox
          document.getElementById('musicLoopToggle').checked = music.loop;
        }
      };
      
      document.getElementById('pauseAllAudioBtn').onclick = function() {
        var vo = voiceoverClone || voiceover;
        var music = musicClone || bgMusic;
        if (vo && vo.src) { vo.pause(); document.getElementById('voPlayPauseBtn').textContent = '▶️'; }
        if (ttsAudio) { ttsAudio.pause(); document.getElementById('ttsPlayPauseBtn').textContent = '▶️'; }
        if (music && music.src) { music.pause(); document.getElementById('musicPlayPauseBtn').textContent = '▶️'; }
      };
      document.getElementById('resumeAllAudioBtn').onclick = function() {
        if (isStopped) return; // Guard: don't play if recording stopped
        var vo = voiceoverClone || voiceover;
        var music = musicClone || bgMusic;
        // Only play ONE voice source - TTS takes priority
        if (ttsActive && ttsAudio && !isStopped) { 
          ttsAudio.play().catch(console.error); 
          document.getElementById('ttsPlayPauseBtn').textContent = '⏸️'; 
        } else if (voiceoverActive && vo && vo.src && !isStopped) { 
          vo.play().catch(console.error); 
          document.getElementById('voPlayPauseBtn').textContent = '⏸️'; 
        }
        if (musicActive && music && music.src && !isStopped) { music.play().catch(console.error); document.getElementById('musicPlayPauseBtn').textContent = '⏸️'; }
      };
      document.getElementById('restartAllAudioBtn').onclick = function() {
        if (isStopped) return; // Guard: don't play if recording stopped
        var vo = voiceoverClone || voiceover;
        var music = musicClone || bgMusic;
        // Only restart ONE voice source - TTS takes priority
        if (ttsActive && ttsAudio && !isStopped) { 
          ttsAudio.currentTime = 0; 
          ttsAudio.play().catch(console.error); 
          document.getElementById('ttsPlayPauseBtn').textContent = '⏸️'; 
        } else if (voiceoverActive && vo && vo.src && !isStopped) { 
          vo.currentTime = 0; 
          vo.play().catch(console.error); 
          document.getElementById('voPlayPauseBtn').textContent = '⏸️'; 
        }
        if (musicActive && music && music.src && !isStopped) { music.currentTime = 0; music.play().catch(console.error); document.getElementById('musicPlayPauseBtn').textContent = '⏸️'; }
      };
      
      // Pause/Resume recording - ALSO pause/resume audio
      pauseBtn.onclick = function() {
        console.log('⏸️ Pause button clicked, isPaused:', isPaused, 'mediaRecorder state:', mediaRecorder ? mediaRecorder.state : 'null');
        
        var vo = voiceoverClone || voiceover;
        var music = musicClone || bgMusic;
        
        if (isPaused) {
          // Guard: don't resume if stopped
          if (isStopped) {
            console.log('⚠️ Cannot resume - recording stopped');
            return;
          }
          
          // Resume recording
          console.log('▶️ Resuming recording...');
          if (mediaRecorder) {
            if (mediaRecorder.state === 'paused') {
              mediaRecorder.resume();
              console.log('✅ MediaRecorder resumed');
            } else {
              console.log('⚠️ MediaRecorder state is:', mediaRecorder.state, '- cannot resume');
            }
          }
          
          // Resume audio - Only ONE voice source (TTS takes priority)
          if (ttsActive && ttsAudio && !isStopped) { 
            ttsAudio.play().catch(function(err) { console.error('TTS resume error:', err); }); 
          } else if (voiceoverActive && vo && vo.src && !isStopped) { 
            vo.play().catch(function(err) { console.error('VO resume error:', err); }); 
          }
          if (musicActive && music && music.src && !isStopped) { 
            music.play().catch(function(err) { console.error('Music resume error:', err); }); 
          }
          
          // Track paused duration when resuming
          if (pauseStartTime > 0) {
            pausedTime += Date.now() - pauseStartTime;
            pauseStartTime = 0;
          }
          
          pauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>Pause';
          isPaused = false;
          
          // Update status
          status.textContent = 'Recording...';
          status.className = 'status recording';
          
          // Hide pause edit panel when resuming
          pauseEditPanel.classList.add('hidden');
        } else {
          // Pause recording
          console.log('⏸️ Pausing recording...');
          if (mediaRecorder) {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.pause();
              console.log('✅ MediaRecorder paused');
            } else {
              console.log('⚠️ MediaRecorder state is:', mediaRecorder.state, '- cannot pause');
            }
          }
          
          // Pause ALL audio sources thoroughly
          console.log('🔇 Pausing all audio...');
          try {
            if (ttsAudio) { 
              ttsAudio.pause(); 
              console.log('  - TTS paused');
            }
            if (voiceover) { 
              voiceover.pause(); 
            }
            if (voiceoverClone) { 
              voiceoverClone.pause(); 
              console.log('  - Voiceover clone paused');
            }
            if (bgMusic) { 
              bgMusic.pause(); 
            }
            if (musicClone) { 
              musicClone.pause(); 
              console.log('  - Music clone paused');
            }
          } catch(e) {
            console.error('Error pausing audio:', e);
          }
          
          // Track when pause started
          pauseStartTime = Date.now();
          
          pauseBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>Resume';
          isPaused = true;
          
          // Update status
          status.textContent = 'Paused';
          status.className = 'status countdown';
          
          // Show pause edit panel and update info
          var elapsed = Math.floor((Date.now() - startTime - pausedTime) / 1000);
          trimInfo.textContent = 'Recording duration: ' + formatTime(elapsed) + ' (' + chunks.length + ' segments)';
          pauseEditPanel.classList.remove('hidden');
          
          // Show pause insert panel with segment controls (if script analysis exists)
          showPauseInsertPanel();
          
          // Show caption toggle if transcript exists
          if (transcriptText) {
            captionToggleBtn.style.display = '';
          }
        }
      };
      
      // Stop recording - with thorough cleanup (but keep camera for new recording)
      stopBtn.onclick = function() {
        console.log('🛑 Stop button clicked');
        
        // Set stop guard FIRST to prevent any audio callbacks
        isStopped = true;
        isRecording = false;
        isCountingDown = false;
        
        // Stop all audio immediately and permanently
        stopAllAudio();
        
        // Hide ALL panels
        pauseEditPanel.classList.add('hidden');
        hidePauseInsertPanel(); // Hide the segment controls panel too
        
        // Cancel animation frame
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        
        // Clear all intervals IMMEDIATELY
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        if (scrollInterval) { clearInterval(scrollInterval); scrollInterval = null; }
        if (audioProgressInterval) { clearInterval(audioProgressInterval); audioProgressInterval = null; }
        
        // Hide speed controls and reading cursor
        showTeleprompterControls(false);
        
        // Stop the recorder - this triggers onstop handler
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        
        // DO NOT stop camera stream here - it will be stopped in onstop handler
        // and we keep it so user can see preview of recording
        
        // Stop display stream (screen share)
        if (displayStream) {
          displayStream.getTracks().forEach(function(t) { t.stop(); });
          displayStream = null;
        }
        
        // Nullify audio references COMPLETELY to prevent restart
        if (voiceoverClone) {
          voiceoverClone.onplay = null;
          voiceoverClone.onended = null;
          voiceoverClone.onloadedmetadata = null;
        }
        if (ttsAudio) {
          ttsAudio.onplay = null;
          ttsAudio.onended = null;
          ttsAudio.onloadedmetadata = null;
        }
        if (musicClone) {
          musicClone.onplay = null;
          musicClone.onended = null;
        }
        
        // Reset audio clones for next recording
        voiceoverClone = null;
        musicClone = null;
        ttsAudio = null;
        
        // Reset audio context reference
        audioContext = null;
        
        console.log('✅ Stop handler complete, all audio prevented from restarting');
      };
      
      // Save recording to Supabase storage and database
      saveBtn.onclick = async function() {
        // Prevent multiple saves
        if (isSaving) {
          console.log('⚠️ Already saving, ignoring click');
          return;
        }
        isSaving = true;
        
        var name = videoNameInput.value.trim() || 'recording';
        
        // Determine format based on the global recordedMimeType variable
        var isMP4 = recordedMimeType.startsWith('video/mp4');
        var fileType = isMP4 ? 'video/mp4' : 'video/webm';
        var fileExt = isMP4 ? 'mp4' : 'webm';
        
        var blob = new Blob(chunks, { type: fileType });
        var supabaseUrl = '${config.supabaseUrl}';
        var supabaseKey = '${config.supabaseKey}';
        
        // Check file size - warn for large files (> 250MB)
        var fileSizeMB = blob.size / (1024 * 1024);
        console.log('📦 Recording size:', fileSizeMB.toFixed(2), 'MB, format:', fileType);
        if (fileSizeMB > 250) {
          status.textContent = '⚠️ Large file (' + fileSizeMB.toFixed(0) + 'MB) - uploading may take a while...';
        }
        
        saveBtn.disabled = true;
        resetBtn.disabled = true; // Disable reset during save
        saveBtn.textContent = '⏳ Saving...';
        status.textContent = 'Uploading to cloud...';
        
        try {
          // Generate unique filename with correct extension
          var timestamp = Date.now();
          var safeFileName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
          var storagePath = 'recording_' + timestamp + '_' + safeFileName + '.' + fileExt;
          
          // Upload to Supabase Storage with correct content type
          var uploadResponse = await fetch(supabaseUrl + '/storage/v1/object/generated-videos/' + storagePath, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + supabaseKey,
              'apikey': supabaseKey,
              'Content-Type': fileType,
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
                format: fileExt,
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
          
          // Also offer local download with correct extension
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = name + '.' + fileExt;
          a.click();
          
          // Reset save state and re-enable reset button
          isSaving = false;
          resetBtn.disabled = false;
          
          // Show success modal instead of alert
          showSaveModal('✅ Video Saved Successfully!', 'Your video has been saved to the cloud and downloaded locally.', 'success');
          
        } catch (err) {
          console.error('Save error:', err);
          status.textContent = 'Save failed';
          saveBtn.textContent = '💾 Retry Save';
          saveBtn.disabled = false;
          resetBtn.disabled = false;
          isSaving = false;
          
          // Fallback to local download with correct extension
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = name + '.' + fileExt;
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
      
      // Reset - with protection against accidental resets during save
      resetBtn.onclick = function() {
        if (isSaving) {
          console.log('⚠️ Cannot reset while saving');
          return;
        }
        location.reload();
      };
      
      // =====================================================
      // TRIM FUNCTIONALITY
      // =====================================================
      
      // Helper to estimate chunk duration (rough estimate based on total time)
      function estimateChunkDuration() {
        if (chunks.length === 0) return 0;
        var elapsed = Math.floor((Date.now() - startTime - pausedTime) / 1000);
        return elapsed / chunks.length; // seconds per chunk
      }
      
      // Trim last X seconds
      function trimLastSeconds(seconds) {
        var chunkDuration = estimateChunkDuration();
        if (chunkDuration <= 0) {
          console.log('⚠️ Cannot estimate chunk duration');
          return;
        }
        
        var chunksToRemove = Math.ceil(seconds / chunkDuration);
        chunksToRemove = Math.min(chunksToRemove, chunks.length - 1); // Keep at least 1 chunk
        
        if (chunksToRemove <= 0) {
          console.log('⚠️ Not enough recording to trim');
          return;
        }
        
        // Store removed chunks for undo
        var removed = chunks.splice(chunks.length - chunksToRemove, chunksToRemove);
        trimmedChunks.push(removed);
        
        // Update timer display
        var newElapsed = Math.floor(chunks.length * chunkDuration);
        timer.textContent = formatTime(newElapsed);
        startTime = Date.now() - (newElapsed * 1000) - pausedTime; // Adjust start time
        
        // Update info
        trimInfo.textContent = 'Trimmed ' + seconds + 's. Duration: ' + formatTime(newElapsed) + ' (' + chunks.length + ' segments)';
        undoTrimBtn.style.display = '';
        
        console.log('✂️ Trimmed', chunksToRemove, 'chunks (~' + seconds + 's)');
      }
      
      // Undo last trim
      function undoLastTrim() {
        if (trimmedChunks.length === 0) return;
        
        var lastTrimmed = trimmedChunks.pop();
        chunks = chunks.concat(lastTrimmed);
        
        var chunkDuration = estimateChunkDuration();
        var newElapsed = Math.floor(chunks.length * chunkDuration);
        timer.textContent = formatTime(newElapsed);
        startTime = Date.now() - (newElapsed * 1000) - pausedTime;
        
        trimInfo.textContent = 'Undo complete. Duration: ' + formatTime(newElapsed) + ' (' + chunks.length + ' segments)';
        
        if (trimmedChunks.length === 0) {
          undoTrimBtn.style.display = 'none';
        }
        
        console.log('↩️ Undo trim, restored', lastTrimmed.length, 'chunks');
      }
      
      // Close panel button
      var closePausePanel = document.getElementById('closePausePanel');
      closePausePanel.onclick = function() {
        pauseEditPanel.classList.add('hidden');
      };
      
      // Track selected trim button
      var selectedTrimBtn = null;
      function selectTrimBtn(btn) {
        // Remove selection from all trim buttons
        [trimLast5Btn, trimLast10Btn, trimLast30Btn].forEach(function(b) {
          b.classList.remove('selected');
        });
        // Select the clicked button
        btn.classList.add('selected');
        selectedTrimBtn = btn;
        // Auto-deselect after 1.5s
        setTimeout(function() {
          btn.classList.remove('selected');
          if (selectedTrimBtn === btn) selectedTrimBtn = null;
        }, 1500);
      }
      
      // Trim button handlers with selection feedback
      trimLast5Btn.onclick = function() { 
        selectTrimBtn(this);
        trimLastSeconds(5); 
      };
      trimLast10Btn.onclick = function() { 
        selectTrimBtn(this);
        trimLastSeconds(10); 
      };
      trimLast30Btn.onclick = function() { 
        selectTrimBtn(this);
        trimLastSeconds(30); 
      };
      undoTrimBtn.onclick = undoLastTrim;
      
      // =====================================================
      // TRANSCRIPTION FUNCTIONALITY
      // =====================================================
      
      transcribeBtn.onclick = async function() {
        if (isTranscribing || chunks.length === 0) return;
        
        isTranscribing = true;
        transcribeBtn.disabled = true;
        transcribeBtn.textContent = '⏳ Transcribing...';
        transcriptionStatus.style.display = '';
        transcriptionStatus.textContent = 'Preparing audio for transcription...';
        
        try {
          // Create blob from current chunks
          var fileType = recordedMimeType.startsWith('video/mp4') ? 'video/mp4' : 'video/webm';
          var blob = new Blob(chunks, { type: fileType });
          
          transcriptionStatus.textContent = 'Converting to audio...';
          
          // Convert blob to base64
          var reader = new FileReader();
          var base64Promise = new Promise(function(resolve, reject) {
            reader.onload = function() {
              var base64 = reader.result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
          });
          reader.readAsDataURL(blob);
          var base64Audio = await base64Promise;
          
          transcriptionStatus.textContent = 'Sending to AI transcription service...';
          
          // Call Hugging Face speech function via Supabase
          var supabaseUrl = '${config.supabaseUrl}';
          var supabaseKey = '${config.supabaseKey}';
          
          var transcribeResponse = await fetch(supabaseUrl + '/functions/v1/huggingface-speech', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + supabaseKey,
              'apikey': supabaseKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              audio: base64Audio,
              agentType: 'transcription'
            })
          });
          
          if (!transcribeResponse.ok) {
            throw new Error('Transcription failed: ' + transcribeResponse.statusText);
          }
          
          var transcribeData = await transcribeResponse.json();
          transcriptText = transcribeData.text || '';
          
          transcriptionStatus.textContent = 'Transcription complete!';
          transcriptionStatus.style.color = '#22c55e';
          
          // Show caption toggle
          captionToggleBtn.style.display = '';
          captionToggleBtn.textContent = 'CC Off';
          captionsEnabled = false;
          
          // Display transcript in the teleprompter
          if (transcriptText) {
            scriptContent.innerHTML = '<strong style="color:#22c55e;">📝 Transcription:</strong><br><br>' + transcriptText.replace(/\\n/g, '<br>');
          }
          
          console.log('✅ Transcription complete:', transcriptText.substring(0, 100) + '...');
          
        } catch (err) {
          console.error('Transcription error:', err);
          transcriptionStatus.textContent = '❌ Transcription failed: ' + err.message;
          transcriptionStatus.style.color = '#dc2626';
        } finally {
          isTranscribing = false;
          transcribeBtn.disabled = false;
          transcribeBtn.textContent = '🎙️ Transcribe Recording';
          
          setTimeout(function() {
            transcriptionStatus.style.display = 'none';
            transcriptionStatus.style.color = '';
          }, 5000);
        }
      };
      
      // =====================================================
      // CAPTION TOGGLE
      // =====================================================
      
      captionToggleBtn.onclick = function() {
        captionsEnabled = !captionsEnabled;
        
        if (captionsEnabled) {
          captionToggleBtn.textContent = 'CC On';
          captionToggleBtn.classList.add('active');
          captionOverlay.classList.remove('hidden');
          captionOverlay.textContent = transcriptText || 'No transcript available';
        } else {
          captionToggleBtn.textContent = 'CC Off';
          captionToggleBtn.classList.remove('active');
          captionOverlay.classList.add('hidden');
        }
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
