/**
 * Draggable Teleprompter - Opens in a separate draggable popup window
 * 
 * Features:
 * - Opens in external window (won't be captured during screen recording)
 * - Draggable popup window
 * - Word-by-word highlighting synced with audio
 * - Auto-scroll based on audio progress
 * - Recording status indicator
 * - Adjustable font size and scroll speed
 * 
 * Simplified from FloatingTeleprompter with cleaner implementation
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, X, ExternalLink, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableTeleprompterProps {
  /** Script content to display */
  content: string;
  /** Title displayed in header */
  title?: string;
  /** Current word index (synced from audio) */
  currentWordIndex: number;
  /** Total number of words */
  totalWords: number;
  /** Progress 0-1 */
  progress: number;
  /** Whether currently recording */
  isRecording: boolean;
  /** Whether recording is paused */
  isPaused: boolean;
  /** Whether teleprompter should be open */
  isOpen: boolean;
  /** Callback when closed */
  onClose: () => void;
  /** Callback when opened */
  onOpen?: () => void;
  /** Initial scroll speed (1-3) */
  scrollSpeed?: number;
  /** Initial font size */
  fontSize?: number;
}

export function DraggableTeleprompter({
  content,
  title = 'Script',
  currentWordIndex,
  totalWords,
  progress,
  isRecording,
  isPaused,
  isOpen,
  onClose,
  onOpen,
  scrollSpeed = 2,
  fontSize = 24,
}: DraggableTeleprompterProps) {
  const windowRef = useRef<Window | null>(null);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const originRef = useRef<string>(typeof window !== 'undefined' ? window.location.origin : '');

  // Generate the popup HTML content
  const generatePopupHTML = useCallback(() => {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const wordsJSON = JSON.stringify(words);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>📜 ${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(145deg, hsl(222 47% 11%) 0%, hsl(262 47% 15%) 100%);
      color: hsl(210 40% 98%);
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: hsla(0 0% 0% / 0.3);
      border-bottom: 1px solid hsla(0 0% 100% / 0.1);
      flex-shrink: 0;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .title {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
    }
    
    .badge {
      display: none;
      align-items: center;
      gap: 6px;
      background: hsl(0 84% 60%);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .badge.recording { display: flex; }
    .badge.paused { background: hsl(38 92% 50%); }
    
    .badge-dot {
      width: 6px;
      height: 6px;
      background: white;
      border-radius: 50%;
      animation: pulse 1s infinite;
    }
    
    .badge.paused .badge-dot { animation: none; }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    
    .controls {
      display: flex;
      gap: 8px;
      padding: 10px 16px;
      background: hsla(0 0% 0% / 0.2);
      flex-shrink: 0;
      flex-wrap: wrap;
      align-items: center;
    }
    
    button {
      background: hsla(0 0% 100% / 0.1);
      color: white;
      border: 1px solid hsla(0 0% 100% / 0.2);
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    
    button:hover { background: hsla(0 0% 100% / 0.2); }
    button.active { background: hsl(239 84% 67%); border-color: hsl(239 84% 67%); }
    button.synced { background: hsl(142 71% 45%); border-color: hsl(142 71% 45%); }
    
    .slider-group {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      opacity: 0.8;
    }
    
    input[type="range"] {
      width: 70px;
      accent-color: hsl(239 84% 67%);
    }
    
    .content-area {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    
    .cursor-line {
      position: absolute;
      left: 0;
      right: 0;
      top: 35%;
      height: 3px;
      background: linear-gradient(90deg, transparent 0%, hsla(142 71% 45% / 0.5) 15%, hsl(142 71% 45%) 50%, hsla(142 71% 45% / 0.5) 85%, transparent 100%);
      box-shadow: 0 0 20px hsla(142 71% 45% / 0.4);
      z-index: 10;
      pointer-events: none;
    }
    
    .script-content {
      height: 100%;
      overflow-y: auto;
      padding: 35% 24px 50%;
      font-size: ${fontSize}px;
      line-height: 1.9;
      scroll-behavior: smooth;
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
      mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
    }
    
    .word {
      display: inline;
      transition: all 0.12s ease;
      margin-right: 0.3em;
    }
    
    .word.current {
      color: hsl(142 71% 45%);
      font-weight: 700;
      font-size: 1.15em;
      background: hsla(142 71% 45% / 0.2);
      padding: 2px 6px;
      border-radius: 4px;
      box-shadow: 0 0 10px hsla(142 71% 45% / 0.3);
    }
    
    .word.past { opacity: 0.35; }
    .word.future { opacity: 0.85; }
    
    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: hsla(0 0% 100% / 0.1);
    }
    
    .progress-fill {
      height: 100%;
      background: hsl(142 71% 45%);
      width: 0%;
      transition: width 0.15s ease;
    }
    
    .word-counter {
      font-size: 11px;
      opacity: 0.6;
      margin-left: auto;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <span class="title">📜 ${title}</span>
      <div class="badge" id="statusBadge">
        <div class="badge-dot"></div>
        <span id="statusText">RECORDING</span>
      </div>
    </div>
    <span class="word-counter" id="wordCounter">0 / 0</span>
  </div>
  
  <div class="controls">
    <button id="syncBtn" class="synced">🔗 Synced</button>
    <button id="resetBtn">↺ Reset</button>
    <div class="slider-group">
      <span>Size:</span>
      <input type="range" id="sizeSlider" min="18" max="48" value="${fontSize}">
    </div>
  </div>
  
  <div class="content-area">
    <div class="cursor-line"></div>
    <div class="script-content" id="scriptContent"></div>
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill"></div>
    </div>
  </div>

  <script>
    const PARENT_ORIGIN = '${originRef.current}';
    let words = ${wordsJSON};
    let currentIndex = 0;
    let isSynced = true;
    
    const scriptContent = document.getElementById('scriptContent');
    const statusBadge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    const wordCounter = document.getElementById('wordCounter');
    const progressFill = document.getElementById('progressFill');
    const syncBtn = document.getElementById('syncBtn');
    const resetBtn = document.getElementById('resetBtn');
    const sizeSlider = document.getElementById('sizeSlider');
    
    function renderWords() {
      scriptContent.innerHTML = words.map((word, idx) => {
        let cls = 'word';
        if (idx === currentIndex) cls += ' current';
        else if (idx < currentIndex) cls += ' past';
        else cls += ' future';
        return '<span class="' + cls + '">' + escapeHtml(word) + '</span>';
      }).join('');
      
      wordCounter.textContent = (currentIndex + 1) + ' / ' + words.length;
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    function scrollToWord() {
      const wordEls = scriptContent.querySelectorAll('.word');
      const currentEl = wordEls[currentIndex];
      if (currentEl) {
        const containerHeight = scriptContent.offsetHeight;
        const targetPos = containerHeight * 0.35;
        scriptContent.scrollTo({
          top: currentEl.offsetTop - targetPos,
          behavior: 'smooth'
        });
      }
    }
    
    function updateHighlight() {
      const wordEls = scriptContent.querySelectorAll('.word');
      wordEls.forEach((el, idx) => {
        el.classList.remove('current', 'past', 'future');
        if (idx === currentIndex) el.classList.add('current');
        else if (idx < currentIndex) el.classList.add('past');
        else el.classList.add('future');
      });
      
      wordCounter.textContent = (currentIndex + 1) + ' / ' + words.length;
      
      if (words.length > 1) {
        progressFill.style.width = ((currentIndex / (words.length - 1)) * 100) + '%';
      }
      
      scrollToWord();
    }
    
    // Initialize
    renderWords();
    
    // Controls
    syncBtn.onclick = function() {
      isSynced = !isSynced;
      syncBtn.textContent = isSynced ? '🔗 Synced' : '🔗 Manual';
      syncBtn.classList.toggle('synced', isSynced);
    };
    
    resetBtn.onclick = function() {
      currentIndex = 0;
      scriptContent.scrollTop = 0;
      updateHighlight();
    };
    
    sizeSlider.oninput = function() {
      scriptContent.style.fontSize = this.value + 'px';
    };
    
    // Listen for parent messages
    window.addEventListener('message', function(e) {
      if (e.origin !== PARENT_ORIGIN) return;
      
      const data = e.data;
      
      if (data.type === 'SYNC_STATE') {
        // Update recording status
        if (data.isRecording !== undefined) {
          statusBadge.classList.toggle('recording', data.isRecording);
          statusBadge.classList.toggle('paused', data.isPaused);
          statusText.textContent = data.isPaused ? 'PAUSED' : 'RECORDING';
        }
        
        // Update word index if synced
        if (isSynced && data.wordIndex !== undefined && data.wordIndex !== currentIndex) {
          currentIndex = Math.min(data.wordIndex, words.length - 1);
          updateHighlight();
        }
        
        // Update progress
        if (data.progress !== undefined) {
          progressFill.style.width = (data.progress * 100) + '%';
        }
      }
      
      if (data.type === 'UPDATE_CONTENT') {
        words = data.words || [];
        currentIndex = 0;
        renderWords();
      }
    });
  </script>
</body>
</html>`;
  }, [content, title, fontSize, originRef]);

  // Open popup window
  const openWindow = useCallback(() => {
    const width = 550;
    const height = 650;
    const left = window.screen.width - width - 30;
    const top = 50;

    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no,resizable=yes`;
    const popup = window.open('', 'teleprompter', features);

    if (popup) {
      popup.document.write(generatePopupHTML());
      popup.document.close();
      
      windowRef.current = popup;
      setIsWindowOpen(true);
      onOpen?.();

      // Handle close
      popup.addEventListener('beforeunload', () => {
        windowRef.current = null;
        setIsWindowOpen(false);
        onClose();
      });

      console.log('[DraggableTeleprompter] Window opened');
    }
  }, [generatePopupHTML, onOpen, onClose]);

  // Close window
  const closeWindow = useCallback(() => {
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.close();
    }
    windowRef.current = null;
    setIsWindowOpen(false);
    onClose();
  }, [onClose]);

  // Open when isOpen becomes true
  useEffect(() => {
    if (isOpen && !isWindowOpen && content) {
      openWindow();
    }
  }, [isOpen, isWindowOpen, content, openWindow]);

  // Send state updates to popup
  useEffect(() => {
    if (windowRef.current && !windowRef.current.closed) {
      try {
        windowRef.current.postMessage({
          type: 'SYNC_STATE',
          isRecording,
          isPaused,
          wordIndex: currentWordIndex,
          progress,
        }, originRef.current);
      } catch (e) {
        console.warn('[DraggableTeleprompter] Failed to post message:', e);
      }
    }
  }, [isRecording, isPaused, currentWordIndex, progress]);

  // Update content when it changes
  useEffect(() => {
    if (windowRef.current && !windowRef.current.closed && content) {
      try {
        const words = content.split(/\s+/).filter(w => w.length > 0);
        windowRef.current.postMessage({
          type: 'UPDATE_CONTENT',
          words,
        }, originRef.current);
      } catch (e) {
        console.warn('[DraggableTeleprompter] Failed to update content:', e);
      }
    }
  }, [content]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (windowRef.current && !windowRef.current.closed) {
        windowRef.current.close();
      }
    };
  }, []);

  if (!content) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={isWindowOpen ? 'default' : 'outline'}
        onClick={isWindowOpen ? closeWindow : openWindow}
        className={cn(
          "gap-2 h-8 transition-all",
          isWindowOpen && "bg-primary"
        )}
      >
        {isWindowOpen ? (
          <>
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Teleprompter Open</span>
          </>
        ) : (
          <>
            <ScrollText className="w-4 h-4" />
            <span className="hidden sm:inline">Teleprompter</span>
          </>
        )}
      </Button>
      
      {isWindowOpen && (
        <Button
          size="icon"
          variant="ghost"
          onClick={closeWindow}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
