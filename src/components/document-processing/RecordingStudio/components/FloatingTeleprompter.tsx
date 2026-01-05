/**
 * Floating Teleprompter - Opens in a separate browser window
 * Won't be captured during screen recording
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Monitor, X } from 'lucide-react';

interface FloatingTeleprompterProps {
  content: string;
  title?: string;
  isRecording: boolean;
  scrollSpeed: number;
  fontSize?: number;
  isOpen: boolean;
  onClose: () => void;
  currentWordIndex?: number;
  audioProgress?: number; // 0-1
  scriptMode?: 'podcast' | 'webcast' | 'video' | 'audio'; // For mode-specific styling
}

export function FloatingTeleprompter({
  content,
  title = 'Script',
  isRecording,
  scrollSpeed,
  fontSize = 24,
  isOpen,
  onClose,
  currentWordIndex = 0,
  audioProgress = 0,
}: FloatingTeleprompterProps) {
  const externalWindowRef = useRef<Window | null>(null);
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  // Open teleprompter in external window
  const openExternalWindow = useCallback(() => {
    const width = 600;
    const height = 700;
    const left = window.screen.width - width - 50;
    const top = 50;
    
    const windowFeatures = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;
    const newWindow = window.open('', 'teleprompter-window', windowFeatures);
    
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>📜 ${title} - Teleprompter</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
              color: #f8fafc;
              padding: 0;
              overflow: hidden;
              height: 100vh;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
              padding: 12px 16px;
              background: rgba(0,0,0,0.3);
              border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .header h1 { font-size: 14px; opacity: 0.9; }
            .recording-badge {
              display: none;
              align-items: center;
              gap: 6px;
              background: #dc2626;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
            }
            .recording-badge.active { display: flex; }
            .recording-badge .dot {
              width: 6px;
              height: 6px;
              background: white;
              border-radius: 50%;
              animation: pulse 1s infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            .controls {
              display: flex;
              gap: 8px;
              padding: 12px 16px;
              background: rgba(0,0,0,0.2);
              flex-wrap: wrap;
            }
            button {
              background: rgba(255,255,255,0.1);
              color: white;
              border: 1px solid rgba(255,255,255,0.2);
              padding: 6px 14px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 12px;
              transition: all 0.2s;
            }
            button:hover { background: rgba(255,255,255,0.2); }
            button.active { background: #6366f1; border-color: #6366f1; }
            .slider-container {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 12px;
            }
            input[type="range"] {
              width: 80px;
              accent-color: #6366f1;
            }
            .content-wrapper {
              height: calc(100vh - 120px);
              position: relative;
              overflow: hidden;
            }
            .cursor-line {
              position: absolute;
              left: 0;
              right: 0;
              top: 35%;
              height: 3px;
              background: linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.6) 15%, #22c55e 50%, rgba(34,197,94,0.6) 85%, transparent 100%);
              box-shadow: 0 0 20px rgba(34,197,94,0.5);
              z-index: 10;
              pointer-events: none;
            }
            .content {
              height: 100%;
              overflow-y: auto;
              font-size: ${fontSize}px;
              line-height: 1.8;
              padding: 30% 24px;
              scroll-behavior: smooth;
              -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
              mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
            }
            .word {
              display: inline;
              transition: all 0.15s ease;
              margin-right: 0.25em;
            }
            .word.current {
              color: #22c55e;
              font-weight: 700;
              font-size: 1.1em;
              background: rgba(34,197,94,0.2);
              padding: 2px 6px;
              border-radius: 4px;
            }
            .word.past { opacity: 0.4; }
            .word.future { opacity: 0.9; }
            .progress-bar {
              height: 3px;
              background: rgba(255,255,255,0.1);
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
            }
            .progress-bar .fill {
              height: 100%;
              background: #22c55e;
              width: 0%;
              transition: width 0.1s;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📜 ${title}</h1>
            <div class="recording-badge" id="recordingBadge">
              <div class="dot"></div>
              RECORDING
            </div>
          </div>
          <div class="controls">
            <button id="scrollBtn">▶ Auto-scroll</button>
            <button id="resetBtn">↺ Reset</button>
            <div class="slider-container">
              <span>Speed:</span>
              <input type="range" id="speedSlider" min="10" max="90" value="${Math.round(scrollSpeed * 30)}">
            </div>
            <div class="slider-container">
              <span>Size:</span>
              <input type="range" id="sizeSlider" min="16" max="48" value="${fontSize}">
            </div>
          </div>
          <div class="content-wrapper">
            <div class="cursor-line"></div>
            <div class="content" id="content"></div>
            <div class="progress-bar"><div class="fill" id="progressFill"></div></div>
          </div>
          <script>
            const words = ${JSON.stringify(content.split(/\s+/).filter(w => w.length > 0))};
            const contentEl = document.getElementById('content');
            const recordingBadge = document.getElementById('recordingBadge');
            const progressFill = document.getElementById('progressFill');
            let isScrolling = false;
            let scrollInterval = null;
            let currentIndex = 0;

            // Render words
            function renderWords() {
              contentEl.innerHTML = words.map((word, idx) => {
                let className = 'word';
                if (idx === currentIndex) className += ' current';
                else if (idx < currentIndex) className += ' past';
                else className += ' future';
                return '<span class="' + className + '" data-index="' + idx + '">' + word + ' </span>';
              }).join('');
            }
            renderWords();

            // Auto-scroll controls
            const scrollBtn = document.getElementById('scrollBtn');
            const speedSlider = document.getElementById('speedSlider');
            const sizeSlider = document.getElementById('sizeSlider');
            let syncedWithParent = false; // Track if we're synced with parent

            scrollBtn.onclick = function() {
              // Only enable manual auto-scroll when NOT synced with parent
              if (syncedWithParent) {
                // Disable sync mode
                syncedWithParent = false;
                scrollBtn.textContent = '▶ Auto-scroll';
                scrollBtn.classList.remove('active');
                return;
              }
              
              isScrolling = !isScrolling;
              scrollBtn.textContent = isScrolling ? '⏸ Pause' : '▶ Auto-scroll';
              scrollBtn.classList.toggle('active', isScrolling);
              
              if (isScrolling) {
                scrollInterval = setInterval(() => {
                  if (currentIndex < words.length - 1) {
                    currentIndex++;
                    updateHighlight();
                  }
                }, (100 - parseInt(speedSlider.value)) * 3);
              } else {
                clearInterval(scrollInterval);
              }
            };

            document.getElementById('resetBtn').onclick = function() {
              currentIndex = 0;
              contentEl.scrollTop = 0;
              syncedWithParent = false;
              isScrolling = false;
              clearInterval(scrollInterval);
              scrollBtn.textContent = '▶ Auto-scroll';
              scrollBtn.classList.remove('active');
              updateHighlight();
            };

            speedSlider.oninput = function() {
              if (isScrolling && !syncedWithParent) {
                clearInterval(scrollInterval);
                scrollInterval = setInterval(() => {
                  if (currentIndex < words.length - 1) {
                    currentIndex++;
                    updateHighlight();
                  }
                }, (100 - parseInt(this.value)) * 3);
              }
            };

            sizeSlider.oninput = function() {
              contentEl.style.fontSize = this.value + 'px';
            };

            function updateHighlight() {
              const wordEls = contentEl.querySelectorAll('.word');
              wordEls.forEach((el, idx) => {
                el.classList.remove('current', 'past', 'future');
                if (idx === currentIndex) el.classList.add('current');
                else if (idx < currentIndex) el.classList.add('past');
                else el.classList.add('future');
              });

              // Scroll to keep current word at 35% from top
              const currentEl = wordEls[currentIndex];
              if (currentEl) {
                const containerHeight = contentEl.offsetHeight;
                const targetPosition = containerHeight * 0.35;
                const wordOffset = currentEl.offsetTop;
                contentEl.scrollTo({
                  top: wordOffset - targetPosition,
                  behavior: 'smooth'
                });
              }

              // Update progress
              progressFill.style.width = ((currentIndex / (words.length - 1)) * 100) + '%';
            }

            // Listen for messages from parent window - ONLY source of cursor sync when playing audio
            window.addEventListener('message', function(event) {
              if (event.data.type === 'UPDATE_STATE') {
                if (event.data.isRecording !== undefined) {
                  recordingBadge.classList.toggle('active', event.data.isRecording);
                  
                  // When recording starts, enable sync mode
                  if (event.data.isRecording) {
                    syncedWithParent = true;
                    isScrolling = false;
                    clearInterval(scrollInterval);
                    scrollBtn.textContent = '🔗 Synced';
                    scrollBtn.classList.add('active');
                  }
                }
                
                // Always accept parent's word index when synced or when parent sends it
                if (event.data.wordIndex !== undefined) {
                  if (event.data.wordIndex !== currentIndex) {
                    currentIndex = event.data.wordIndex;
                    syncedWithParent = true;
                    isScrolling = false;
                    clearInterval(scrollInterval);
                    scrollBtn.textContent = '🔗 Synced';
                    scrollBtn.classList.add('active');
                    updateHighlight();
                  }
                }
                
                if (event.data.progress !== undefined) {
                  progressFill.style.width = (event.data.progress * 100) + '%';
                }
              }
            });
          </script>
        </body>
        </html>
      `);
      newWindow.document.close();
      
      externalWindowRef.current = newWindow;
      setIsWindowOpen(true);
      
      // Handle window close
      newWindow.addEventListener('beforeunload', () => {
        externalWindowRef.current = null;
        setIsWindowOpen(false);
        onClose();
      });
    }
  }, [content, title, scrollSpeed, fontSize, onClose]);

  // Send updates to external window
  useEffect(() => {
    if (externalWindowRef.current && !externalWindowRef.current.closed) {
      externalWindowRef.current.postMessage({
        type: 'UPDATE_STATE',
        isRecording,
        wordIndex: currentWordIndex,
        progress: audioProgress,
      }, '*');
    }
  }, [isRecording, currentWordIndex, audioProgress]);

  // Open window when isOpen becomes true
  useEffect(() => {
    if (isOpen && !isWindowOpen) {
      openExternalWindow();
    }
  }, [isOpen, isWindowOpen, openExternalWindow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (externalWindowRef.current && !externalWindowRef.current.closed) {
        externalWindowRef.current.close();
      }
    };
  }, []);

  if (!content) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={isWindowOpen ? 'default' : 'outline'}
        onClick={openExternalWindow}
        className="gap-2 h-8"
      >
        {isWindowOpen ? (
          <>
            <Monitor className="w-4 h-4" />
            Teleprompter Open
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            Open Teleprompter
          </>
        )}
      </Button>
      {isWindowOpen && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (externalWindowRef.current && !externalWindowRef.current.closed) {
              externalWindowRef.current.close();
            }
            setIsWindowOpen(false);
            onClose();
          }}
          className="h-8 px-2"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
