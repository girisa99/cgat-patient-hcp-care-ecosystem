/**
 * Popout Recording Studio - Teleprompter Enhancements Module
 * Word-level tracking, visual reading cursor at 35%
 */

export function getTeleprompterEnhancementsScript(): string {
  return `
    // =====================================================
    // TELEPROMPTER ENHANCEMENTS MODULE
    // =====================================================

    var scriptWords = [];
    var currentWordIndex = 0;
    var wordHighlightInterval = null;
    var readingCursorVisible = true;
    var teleprompterScrollSpeed = 1;
    var teleprompterScrollInterval = null;
    
    // Reference to shared state (declared in recordingEnhancements)
    // isPaused and isStopped are used for sync control

    // =====================================================
    // WORD-LEVEL TRACKING
    // =====================================================

    function renderScriptWithWordTracking(scriptContent) {
      if (!scriptContent) return;

      // Split into words
      scriptWords = scriptContent.split(/\\s+/).filter(function(w) { return w.length > 0; });
      currentWordIndex = 0;

      const teleprompterEl = document.getElementById('teleprompterText');
      if (!teleprompterEl) return;

      // Render each word as a span
      let html = '';
      scriptWords.forEach(function(word, idx) {
        html += '<span class="script-word" data-word-idx="' + idx + '">' + escapeHtmlWord(word) + '</span> ';
      });

      teleprompterEl.innerHTML = html;
      console.log('[Teleprompter] Rendered', scriptWords.length, 'words for tracking');
    }

    function escapeHtmlWord(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    // =====================================================
    // WORD HIGHLIGHTING SYNC WITH AUDIO - PRECISE 1:1 SYNC
    // =====================================================

    // Store audio reference for precise sync
    var syncedAudioElement = null;
    var wordSyncAnimationId = null;
    
    // Word timing data - weighted by word length for more accurate sync
    var wordTimings = [];

    function calculateWordTimings(words, totalDuration) {
      // Calculate weighted timings based on word length
      // Longer words take more time to speak than shorter words
      // Also account for natural pauses after punctuation
      
      var totalWeight = 0;
      var weights = words.map(function(word) {
        var baseWeight = word.length;
        
        // Add weight for punctuation pauses
        if (/[.!?]$/.test(word)) {
          baseWeight += 3; // Sentence end pause
        } else if (/[,;:]$/.test(word)) {
          baseWeight += 1.5; // Clause pause
        }
        
        // Minimum weight for very short words
        baseWeight = Math.max(baseWeight, 2);
        
        totalWeight += baseWeight;
        return baseWeight;
      });
      
      // Calculate cumulative timings
      var timings = [];
      var currentTime = 0;
      
      for (var i = 0; i < words.length; i++) {
        var wordDuration = (weights[i] / totalWeight) * totalDuration;
        timings.push({
          startTime: currentTime,
          endTime: currentTime + wordDuration,
          midTime: currentTime + wordDuration / 2
        });
        currentTime += wordDuration;
      }
      
      return timings;
    }

    function startWordHighlighting(audioDuration) {
      if (scriptWords.length === 0 || !audioDuration) {
        console.warn('[Teleprompter] Cannot start highlighting - no words or duration');
        return;
      }

      // Calculate weighted word timings
      wordTimings = calculateWordTimings(scriptWords, audioDuration);
      currentWordIndex = 0;

      var avgTimePerWord = audioDuration / scriptWords.length;
      console.log('[Teleprompter] Starting word highlight');
      console.log('[Teleprompter] Avg time per word:', avgTimePerWord.toFixed(3) + 's');
      console.log('[Teleprompter] Using weighted timing for', scriptWords.length, 'words');

      var startTime = performance.now();
      
      function updateLoop() {
        if (isPaused || isStopped) {
          wordHighlightInterval = requestAnimationFrame(updateLoop);
          return;
        }
        
        var elapsed = (performance.now() - startTime) / 1000;
        
        // Find current word based on weighted timing
        var newWordIndex = wordTimings.findIndex(function(timing) {
          return elapsed >= timing.startTime && elapsed < timing.endTime;
        });
        
        if (newWordIndex === -1 && elapsed >= wordTimings[wordTimings.length - 1].endTime) {
          // Past the last word
          stopWordHighlighting();
          return;
        }
        
        if (newWordIndex >= 0 && newWordIndex !== currentWordIndex) {
          currentWordIndex = newWordIndex;
          highlightWord(currentWordIndex);
        }

        wordHighlightInterval = requestAnimationFrame(updateLoop);
      }
      
      wordHighlightInterval = requestAnimationFrame(updateLoop);
    }

    function startWordHighlightingFromAudio(audioElement) {
      if (!audioElement || scriptWords.length === 0) {
        console.log('[Teleprompter] Cannot sync - no audio or no words');
        return;
      }

      var duration = audioElement.duration;
      if (!duration || isNaN(duration)) {
        console.warn('[Teleprompter] Audio duration not available, waiting...');
        audioElement.addEventListener('durationchange', function onDuration() {
          if (audioElement.duration && !isNaN(audioElement.duration)) {
            audioElement.removeEventListener('durationchange', onDuration);
            startWordHighlightingFromAudio(audioElement);
          }
        });
        return;
      }

      console.log('[Teleprompter] Starting WEIGHTED word sync with audio');
      console.log('[Teleprompter] Audio duration:', duration, 'seconds');
      console.log('[Teleprompter] Total words:', scriptWords.length);

      // Calculate weighted word timings
      wordTimings = calculateWordTimings(scriptWords, duration);
      
      syncedAudioElement = audioElement;
      currentWordIndex = -1;

      // Use audio currentTime with weighted timing for PRECISE sync
      function updateHighlight() {
        if (isPaused || isStopped || !syncedAudioElement) {
          wordSyncAnimationId = null;
          return;
        }

        if (syncedAudioElement.paused && !syncedAudioElement.ended) {
          wordSyncAnimationId = requestAnimationFrame(updateHighlight);
          return;
        }

        if (syncedAudioElement.ended) {
          console.log('[Teleprompter] Audio ended, stopping sync');
          stopWordHighlighting();
          return;
        }

        var currentTime = syncedAudioElement.currentTime;
        
        // Find current word based on weighted timing - more accurate than linear
        var newWordIndex = -1;
        for (var i = 0; i < wordTimings.length; i++) {
          if (currentTime >= wordTimings[i].startTime && currentTime < wordTimings[i].endTime) {
            newWordIndex = i;
            break;
          }
        }
        
        // If past all words, show the last one
        if (newWordIndex === -1 && currentTime >= wordTimings[wordTimings.length - 1].startTime) {
          newWordIndex = scriptWords.length - 1;
        }
        
        // Only update if word changed
        if (newWordIndex !== currentWordIndex && newWordIndex >= 0) {
          currentWordIndex = newWordIndex;
          highlightWord(currentWordIndex);
          
          // Debug log every 10 words
          if (currentWordIndex % 10 === 0) {
            console.log('[Teleprompter] Word', currentWordIndex + 1, '/', scriptWords.length, 
                        'at', currentTime.toFixed(2) + 's',
                        '(expected:', wordTimings[currentWordIndex].startTime.toFixed(2) + 's)');
          }
        }

        wordSyncAnimationId = requestAnimationFrame(updateHighlight);
      }

      wordSyncAnimationId = requestAnimationFrame(updateHighlight);
      console.log('[Teleprompter] Started WEIGHTED audio-synced word highlighting');
    }

    function highlightWord(idx) {
      const teleprompterEl = document.getElementById('teleprompterText');
      if (!teleprompterEl) return;

      // Get all word elements
      const wordEls = teleprompterEl.querySelectorAll('.script-word');
      
      // Update classes - mark past, current, and future words
      wordEls.forEach(function(el, i) {
        el.classList.remove('word-current', 'word-past');
        if (i < idx) {
          el.classList.add('word-past');
        } else if (i === idx) {
          el.classList.add('word-current');
        }
      });

      // Scroll to current word - center it in view
      const currentEl = teleprompterEl.querySelector('.word-current');
      if (currentEl) {
        currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function stopWordHighlighting() {
      if (wordHighlightInterval) {
        clearInterval(wordHighlightInterval);
        wordHighlightInterval = null;
      }
      if (wordSyncAnimationId) {
        cancelAnimationFrame(wordSyncAnimationId);
        wordSyncAnimationId = null;
      }
      syncedAudioElement = null;
      currentWordIndex = 0;
      console.log('[Teleprompter] Stopped word highlighting');
    }

    // =====================================================
    // VISUAL READING CURSOR AT 35%
    // =====================================================

    function showReadingCursor() {
      let cursor = document.getElementById('readingCursor');
      
      if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'readingCursor';
        cursor.className = 'reading-cursor';
        
        const teleprompter = document.getElementById('teleprompter');
        if (teleprompter) {
          teleprompter.appendChild(cursor);
        }
      }

      cursor.style.display = 'block';
      readingCursorVisible = true;
      updateReadingCursor();
      console.log('[Teleprompter] Reading cursor shown');
    }

    function hideReadingCursor() {
      const cursor = document.getElementById('readingCursor');
      if (cursor) {
        cursor.style.display = 'none';
      }
      readingCursorVisible = false;
    }

    function toggleReadingCursor() {
      if (readingCursorVisible) {
        hideReadingCursor();
      } else {
        showReadingCursor();
      }
    }

    function updateReadingCursor() {
      const cursor = document.getElementById('readingCursor');
      const teleprompter = document.getElementById('teleprompter');
      
      if (!cursor || !teleprompter || !readingCursorVisible) return;

      const teleprompterHeight = teleprompter.offsetHeight;
      const cursorPosition = teleprompterHeight * 0.35; // 35% from top

      cursor.style.top = cursorPosition + 'px';
    }

    // =====================================================
    // AUTO-SCROLL SYNC - Uses word position for accurate scrolling
    // =====================================================

    function startTeleprompterScrollSync(audioDuration) {
      const teleprompterEl = document.getElementById('teleprompterText');
      const teleprompter = document.getElementById('teleprompter');
      
      if (!teleprompterEl || !teleprompter || !audioDuration) return;

      const scrollHeight = teleprompterEl.scrollHeight;
      const containerHeight = teleprompter.offsetHeight;
      const totalScroll = scrollHeight - containerHeight;

      if (totalScroll <= 0) {
        console.log('[Teleprompter] No scrolling needed');
        return;
      }

      // Store reference to the audio element for precise sync
      var audioElement = syncedAudioElement || voiceoverAudio || ttsAudio;
      
      console.log('[Teleprompter] Scroll sync started');
      console.log('[Teleprompter] Total scroll:', totalScroll, 'px');
      console.log('[Teleprompter] Audio duration:', audioDuration, 's');

      function scrollStep() {
        if (isStopped) {
          teleprompterScrollInterval = null;
          return;
        }

        if (isPaused) {
          teleprompterScrollInterval = requestAnimationFrame(scrollStep);
          return;
        }

        // Use audio currentTime for PRECISE sync if available
        if (audioElement && !audioElement.paused && !audioElement.ended) {
          var currentTime = audioElement.currentTime;
          var progress = currentTime / audioDuration;
          
          // If we have word timings, use word-based progress for more accurate scroll
          if (wordTimings && wordTimings.length > 0 && scriptWords.length > 0) {
            // Find current word index based on time
            var wordIdx = 0;
            for (var i = 0; i < wordTimings.length; i++) {
              if (currentTime >= wordTimings[i].startTime) {
                wordIdx = i;
              } else {
                break;
              }
            }
            
            // Calculate progress based on word position (more accurate than linear time)
            // Also factor in position within current word
            var wordProgress = wordIdx / scriptWords.length;
            var withinWordProgress = 0;
            if (wordTimings[wordIdx]) {
              var wordDuration = wordTimings[wordIdx].endTime - wordTimings[wordIdx].startTime;
              if (wordDuration > 0) {
                withinWordProgress = (currentTime - wordTimings[wordIdx].startTime) / wordDuration / scriptWords.length;
              }
            }
            progress = wordProgress + withinWordProgress;
          }
          
          var targetScroll = progress * totalScroll;
          
          // Smooth scroll to target position - FASTER interpolation for better sync
          var currentScroll = teleprompter.scrollTop;
          var diff = targetScroll - currentScroll;
          
          // Use faster easing (0.25 instead of 0.1) for snappier response
          if (Math.abs(diff) > 2) {
            teleprompter.scrollTop = currentScroll + (diff * 0.25);
          } else {
            teleprompter.scrollTop = targetScroll;
          }
          
          teleprompterScrollInterval = requestAnimationFrame(scrollStep);
        } else if (audioElement && audioElement.ended) {
          // Audio ended, scroll to end
          teleprompter.scrollTop = totalScroll;
          teleprompterScrollInterval = null;
          console.log('[Teleprompter] Scroll sync complete');
        } else {
          // No audio reference, continue with time-based scroll
          teleprompterScrollInterval = requestAnimationFrame(scrollStep);
        }
      }

      teleprompterScrollInterval = requestAnimationFrame(scrollStep);
      console.log('[Teleprompter] Started WORD-SYNCED scroll');
    }

    function stopTeleprompterScrollSync() {
      if (teleprompterScrollInterval) {
        cancelAnimationFrame(teleprompterScrollInterval);
        teleprompterScrollInterval = null;
      }
    }

    // =====================================================
    // AUTO-SCROLL WITHOUT AUDIO (for teleprompter only mode)
    // =====================================================
    
    var autoScrollInterval = null;
    var manualScrollSpeed = 60; // pixels per second default

    function startTeleprompterAutoScroll() {
      const teleprompterEl = document.getElementById('teleprompterText');
      const teleprompter = document.getElementById('teleprompter');
      
      if (!teleprompterEl || !teleprompter) return;

      const scrollHeight = teleprompterEl.scrollHeight;
      const containerHeight = teleprompter.offsetHeight;
      const totalScroll = scrollHeight - containerHeight;

      if (totalScroll <= 0) {
        console.log('[Teleprompter] No scrolling needed');
        return;
      }

      // Reset scroll position
      teleprompter.scrollTop = 0;
      const startTime = performance.now();

      // Get user-adjusted speed if available
      const currentSpeed = manualScrollSpeed * teleprompterScrollSpeed;
      const duration = totalScroll / currentSpeed;

      function scrollStep() {
        if (isStopped) {
          autoScrollInterval = null;
          return;
        }

        if (isPaused) {
          autoScrollInterval = requestAnimationFrame(scrollStep);
          return;
        }

        const elapsed = (performance.now() - startTime) / 1000;
        const targetScroll = elapsed * currentSpeed;

        if (targetScroll <= totalScroll) {
          teleprompter.scrollTop = targetScroll;
          autoScrollInterval = requestAnimationFrame(scrollStep);
        } else {
          teleprompter.scrollTop = totalScroll;
          autoScrollInterval = null;
          console.log('[Teleprompter] Auto-scroll complete');
        }
      }

      autoScrollInterval = requestAnimationFrame(scrollStep);
      console.log('[Teleprompter] Started auto-scroll, speed:', currentSpeed.toFixed(2) + 'px/s');
    }

    function stopTeleprompterAutoScroll() {
      if (autoScrollInterval) {
        cancelAnimationFrame(autoScrollInterval);
        autoScrollInterval = null;
      }
    }

    // =====================================================
    // TELEPROMPTER CONTROLS UI
    // =====================================================

    function showTeleprompterControls() {
      const controls = document.getElementById('teleprompterControls');
      if (controls) {
        controls.style.display = 'flex';
      }
    }

    function hideTeleprompterControls() {
      const controls = document.getElementById('teleprompterControls');
      if (controls) {
        controls.style.display = 'none';
      }
    }

    function adjustScrollSpeed(delta) {
      teleprompterScrollSpeed = Math.max(0.5, Math.min(5, teleprompterScrollSpeed + delta));
      
      const speedEl = document.getElementById('scrollSpeedValue');
      if (speedEl) {
        speedEl.textContent = teleprompterScrollSpeed.toFixed(1) + 'x';
      }
      
      console.log('[Teleprompter] Scroll speed:', teleprompterScrollSpeed);
    }

    // =====================================================
    // INITIALIZE TELEPROMPTER ENHANCEMENTS
    // =====================================================

    function initTeleprompterEnhancements() {
      // Listen for script changes
      const scriptSelectEl = document.getElementById('scriptSelect');
      if (scriptSelectEl) {
        scriptSelectEl.addEventListener('change', function() {
          const selectedId = this.value;
          const script = scriptsData.find(function(s) { return s.id === selectedId; });
          
          if (script && script.content) {
            renderScriptWithWordTracking(script.content);
          }
        });
      }

      // Reading cursor toggle
      const cursorToggle = document.getElementById('readingCursorToggle');
      if (cursorToggle) {
        cursorToggle.addEventListener('click', toggleReadingCursor);
      }

      // Speed controls
      const speedUp = document.getElementById('speedUpBtn');
      const speedDown = document.getElementById('speedDownBtn');
      
      if (speedUp) {
        speedUp.addEventListener('click', function() { adjustScrollSpeed(0.25); });
      }
      if (speedDown) {
        speedDown.addEventListener('click', function() { adjustScrollSpeed(-0.25); });
      }

      // Window resize handler for cursor position
      window.addEventListener('resize', updateReadingCursor);

      console.log('[TeleprompterEnhancements] Initialized');
    }

    setTimeout(initTeleprompterEnhancements, 300);

    console.log('[TeleprompterEnhancements] Module loaded');
  `;
}

export function getTeleprompterEnhancementsStyles(): string {
  return `
    /* Teleprompter Enhancements Styles */

    /* Word-level highlighting */
    .script-word {
      display: inline;
      transition: all 0.15s ease;
      padding: 2px 0;
    }

    .script-word.word-current {
      color: #22c55e;
      font-weight: 600;
      background: rgba(34, 197, 94, 0.2);
      border-radius: 4px;
      padding: 2px 4px;
      margin: 0 -2px;
    }

    .script-word.word-past {
      color: #666;
    }

    /* Reading Cursor at 35% */
    .reading-cursor {
      position: absolute;
      left: 0;
      right: 0;
      height: 3px;
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

    /* Teleprompter Controls */
    #teleprompterControls {
      display: none;
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      border-radius: 8px;
      padding: 8px 12px;
      gap: 8px;
      align-items: center;
      z-index: 20;
    }

    .teleprompter-control-btn {
      padding: 6px 10px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: #fff;
      font-size: 0.75rem;
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

    /* Sync indicator */
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
  `;
}
