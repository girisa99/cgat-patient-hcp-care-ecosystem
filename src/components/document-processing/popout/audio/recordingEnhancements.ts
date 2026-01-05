/**
 * Popout Recording Studio - Recording Enhancements Module
 * Countdown, pause/resume, trim controls, stop cleanup
 */

export function getRecordingEnhancementsScript(): string {
  return `
    // =====================================================
    // RECORDING ENHANCEMENTS MODULE
    // =====================================================
    // Note: isStopped, isPaused, trimHistory, isRecording, mediaRecorder,
    // recordedChunks, recordingTimer, voiceoverAudio, musicAudio, ttsAudio
    // syncAudioSource, syncAnimationFrame are declared in shared globals
    
    var countdownInterval = null;

    // =====================================================
    // 5-SECOND COUNTDOWN
    // =====================================================

    function startCountdown(callback) {
      let count = 5;
      const overlay = document.getElementById('countdownOverlay');
      const countEl = document.getElementById('countdownNumber');
      
      if (!overlay || !countEl) {
        // Fallback: just start immediately
        if (callback) callback();
        return;
      }

      overlay.classList.add('visible');
      countEl.textContent = count;

      countdownInterval = setInterval(function() {
        count--;
        
        if (count > 0) {
          countEl.textContent = count;
          countEl.classList.add('pulse');
          setTimeout(function() { countEl.classList.remove('pulse'); }, 200);
        } else {
          clearInterval(countdownInterval);
          countdownInterval = null;
          overlay.classList.remove('visible');
          
          if (callback) callback();
        }
      }, 1000);

      console.log('[Recording] Countdown started');
    }

    function cancelCountdown() {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        
        const overlay = document.getElementById('countdownOverlay');
        if (overlay) overlay.classList.remove('visible');
        
        console.log('[Recording] Countdown cancelled');
      }
    }

    // =====================================================
    // PAUSE / RESUME
    // =====================================================

    function pauseRecording() {
      if (!isRecording || isPaused) return;

      console.log('[Recording] Pausing...');
      isPaused = true;
      pauseStartTime = Date.now();
      
      // CRITICAL: Request data chunk BEFORE pausing to capture recorded content
      // MediaRecorder doesn't send chunks while paused, so we must flush first
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        console.log('[Recording] Requesting data chunk before pause, current chunks:', recordedChunks.length);
        mediaRecorder.requestData(); // Flush current buffer to ondataavailable
        // Small delay to ensure chunk is processed before pausing
        setTimeout(function() {
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.pause();
            console.log('[Recording] MediaRecorder paused, chunks after flush:', recordedChunks.length);
          }
        }, 50);
      }

      // Pause any audio
      if (voiceoverAudio) voiceoverAudio.pause();
      if (musicAudio) musicAudio.pause();
      if (ttsAudio) ttsAudio.pause();

      // Update UI
      updatePauseUI(true);
      showEditPanel();
    }

    function resumeRecording() {
      if (!isRecording || !isPaused) return;

      console.log('[Recording] Resuming...');
      
      // Calculate paused duration and add to total
      if (pauseStartTime) {
        totalPausedTime += Date.now() - pauseStartTime;
        pauseStartTime = null;
      }
      
      isPaused = false;

      // Resume MediaRecorder if available
      if (mediaRecorder && mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
      }

      // Resume audio
      if (voiceoverAudio && !voiceoverAudio.ended) voiceoverAudio.play();
      if (musicAudio) musicAudio.play();
      if (ttsAudio && !ttsAudio.ended) ttsAudio.play();

      // Update UI
      updatePauseUI(false);
      hideEditPanel();
    }

    function togglePause() {
      if (isPaused) {
        resumeRecording();
      } else {
        pauseRecording();
      }
    }

    function updatePauseUI(paused) {
      const pauseBtn = document.getElementById('pauseBtn');
      const recordingIndicator = document.getElementById('recordingIndicator');
      const recordingStatus = document.getElementById('recordingStatus');
      const indicatorDot = recordingIndicator ? recordingIndicator.querySelector('.dot') : null;

      if (pauseBtn) {
        if (paused) {
          pauseBtn.innerHTML = '▶️ Resume';
          pauseBtn.classList.add('paused');
        } else {
          pauseBtn.innerHTML = '⏸️ Pause';
          pauseBtn.classList.remove('paused');
        }
      }

      if (recordingIndicator) {
        if (paused) {
          recordingIndicator.classList.add('paused');
        } else {
          recordingIndicator.classList.remove('paused');
        }
      }
      
      // Update status text and dot color
      if (recordingStatus) {
        recordingStatus.textContent = paused ? 'PAUSED' : 'REC';
      }
      if (indicatorDot) {
        indicatorDot.style.backgroundColor = paused ? '#fbbf24' : '#ef4444';
        indicatorDot.style.animation = paused ? 'none' : 'pulse 1s infinite';
      }
    }

    function showEditPanel() {
      const panel = document.getElementById('editPanel');
      if (panel) {
        panel.style.display = 'block';
      }
    }

    function hideEditPanel() {
      const panel = document.getElementById('editPanel');
      if (panel) {
        panel.style.display = 'none';
      }
    }

    // =====================================================
    // TRIM CONTROLS
    // =====================================================

    function trimLastSeconds(seconds) {
      if (!isRecording || recordedChunks.length === 0) {
        console.warn('[Recording] Cannot trim - no recording data');
        return;
      }

      const trimAmount = seconds || 5;
      
      // Estimate chunks to remove (1 chunk ≈ 1 second)
      const chunksToRemove = Math.min(trimAmount, recordedChunks.length - 1);
      
      if (chunksToRemove > 0) {
        // Save for undo
        trimHistory.push({
          chunks: recordedChunks.slice(-chunksToRemove),
          count: chunksToRemove,
          timestamp: Date.now()
        });

        // Remove chunks
        recordedChunks = recordedChunks.slice(0, -chunksToRemove);
        
        console.log('[Recording] Trimmed', chunksToRemove, 'seconds');
        showTrimFeedback('Trimmed ' + chunksToRemove + 's');
        updateTrimUI();
      }
    }

    function undoLastTrim() {
      if (trimHistory.length === 0) {
        console.warn('[Recording] No trim to undo');
        return;
      }

      const lastTrim = trimHistory.pop();
      recordedChunks = recordedChunks.concat(lastTrim.chunks);
      
      console.log('[Recording] Undid trim of', lastTrim.count, 'seconds');
      showTrimFeedback('Restored ' + lastTrim.count + 's');
      updateTrimUI();
    }

    function showTrimFeedback(message) {
      const feedback = document.getElementById('trimFeedback');
      if (feedback) {
        feedback.textContent = message;
        feedback.classList.add('visible');
        setTimeout(function() {
          feedback.classList.remove('visible');
        }, 2000);
      }
    }

    function updateTrimUI() {
      const undoBtn = document.getElementById('undoTrimBtn');
      if (undoBtn) {
        undoBtn.disabled = trimHistory.length === 0;
      }

      const trimInfo = document.getElementById('trimInfo');
      if (trimInfo) {
        trimInfo.textContent = recordedChunks.length + ' chunks';
      }
    }

    function selectTrimAmount(seconds) {
      // Update button states
      document.querySelectorAll('.trim-amount-btn').forEach(function(btn) {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.seconds) === seconds) {
          btn.classList.add('active');
        }
      });
    }

    // =====================================================
    // STOP & CLEANUP
    // =====================================================

    function stopAllAudio() {
      console.log('[Recording] Stopping all audio...');

      // Stop voiceover
      if (voiceoverAudio) {
        voiceoverAudio.pause();
        voiceoverAudio.currentTime = 0;
        voiceoverAudio.onended = null;
        voiceoverAudio.onerror = null;
      }

      // Stop music
      if (musicAudio) {
        musicAudio.pause();
        musicAudio.currentTime = 0;
        musicAudio.onended = null;
        musicAudio.onerror = null;
      }

      // Stop TTS
      if (ttsAudio) {
        ttsAudio.pause();
        ttsAudio.currentTime = 0;
        ttsAudio.onended = null;
        ttsAudio.onerror = null;
      }

      // Stop synced audio
      if (syncAudioSource) {
        try {
          syncAudioSource.stop();
        } catch (e) {}
        syncAudioSource = null;
      }

      // Clear animation frames
      if (syncAnimationFrame) {
        cancelAnimationFrame(syncAnimationFrame);
        syncAnimationFrame = null;
      }

      console.log('[Recording] All audio stopped');
    }

    function stopRecordingEnhanced() {
      if (!isRecording) return;

      console.log('[Recording] Enhanced stop...');
      
      // Set stopped flag FIRST
      isStopped = true;
      isPaused = false;

      // Stop all audio
      stopAllAudio();

      // Stop recording timer
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }

      // Update state
      isRecording = false;

      // Update UI
      const recordBtn = document.getElementById('recordBtn');
      const recordBtnText = document.getElementById('recordBtnText');
      const recordingIndicator = document.getElementById('recordingIndicator');

      if (recordBtn) {
        recordBtn.classList.remove('recording');
        recordBtn.classList.add('ready');
      }
      if (recordBtnText) {
        recordBtnText.textContent = 'Start Recording';
      }
      if (recordingIndicator) {
        recordingIndicator.classList.remove('visible', 'paused');
      }

      // Hide edit panel
      hideEditPanel();

      // Stop MediaRecorder
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }

      // Clear trim history
      trimHistory = [];
      updateTrimUI();

      console.log('[Recording] Stopped and cleaned up');
    }

    // =====================================================
    // AUDIO OPTIONS DIALOG
    // =====================================================

    function showAudioOptionsDialog() {
      const dialog = document.getElementById('audioOptionsDialog');
      if (dialog) {
        dialog.classList.add('visible');
      }
    }

    function hideAudioOptionsDialog() {
      const dialog = document.getElementById('audioOptionsDialog');
      if (dialog) {
        dialog.classList.remove('visible');
      }
    }

    function confirmAudioOptions() {
      hideAudioOptionsDialog();
      
      // Start countdown then record - delegate to camera module's actuallyStartRecording
      startCountdown(function() {
        // actuallyStartRecording is defined in popoutCameraScript.ts
        if (typeof actuallyStartRecording === 'function') {
          actuallyStartRecording();
        } else {
          console.error('[Recording] actuallyStartRecording not found');
        }
      });
    }

    // NOTE: actuallyStartRecording is defined in popoutCameraScript.ts
    // This module only provides countdown, pause/resume, and trim functionality

    // =====================================================
    // INITIALIZE RECORDING ENHANCEMENTS
    // =====================================================

    function initRecordingEnhancements() {
      // Pause button
      const pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) {
        pauseBtn.addEventListener('click', togglePause);
      }

      // Trim buttons
      document.querySelectorAll('.trim-amount-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const seconds = parseInt(this.dataset.seconds) || 5;
          selectTrimAmount(seconds);
          trimLastSeconds(seconds);
        });
      });

      // Undo trim
      const undoBtn = document.getElementById('undoTrimBtn');
      if (undoBtn) {
        undoBtn.addEventListener('click', undoLastTrim);
      }

      // Audio options dialog buttons
      const confirmOptionsBtn = document.getElementById('confirmOptionsBtn');
      if (confirmOptionsBtn) {
        confirmOptionsBtn.addEventListener('click', confirmAudioOptions);
      }

      const cancelOptionsBtn = document.getElementById('cancelOptionsBtn');
      if (cancelOptionsBtn) {
        cancelOptionsBtn.addEventListener('click', hideAudioOptionsDialog);
      }

      // NOTE: Record button is now handled in popoutCameraScript.ts
      // which calls startCountdown() and uses isStopped/isPaused flags

      updateTrimUI();
      console.log('[RecordingEnhancements] Initialized');
    }

    setTimeout(initRecordingEnhancements, 250);

    console.log('[RecordingEnhancements] Module loaded');
  `;
}

export function getRecordingEnhancementsStyles(): string {
  return `
    /* Recording Enhancements Styles */
    
    /* Countdown Overlay */
    #countdownOverlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }

    #countdownOverlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    #countdownNumber {
      font-size: 120px;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 0 40px rgba(139, 92, 246, 0.8);
      transition: transform 0.2s;
    }

    #countdownNumber.pulse {
      transform: scale(1.2);
    }

    /* Pause State - styles are in main popoutStyles.ts */

    /* Pause Button */
    #pauseBtn {
      padding: 10px 20px;
      background: rgba(251, 191, 36, 0.2);
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 8px;
      color: #fbbf24;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    #pauseBtn.paused {
      background: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    /* Edit Panel */
    #editPanel {
      display: none;
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 16px;
      z-index: 50;
    }

    .edit-panel-title {
      font-size: 0.875rem;
      color: #fff;
      margin-bottom: 12px;
      text-align: center;
    }

    /* Trim Controls */
    .trim-controls-row {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .trim-amount-btn {
      padding: 8px 16px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      color: #ef4444;
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
    }

    #undoTrimBtn {
      padding: 8px 16px;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 6px;
      color: #60a5fa;
      font-size: 0.75rem;
      cursor: pointer;
    }

    #undoTrimBtn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    #trimFeedback {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-50px);
      background: rgba(239, 68, 68, 0.9);
      color: #fff;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.875rem;
      opacity: 0;
      transition: all 0.3s;
      z-index: 200;
    }

    #trimFeedback.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    #trimInfo {
      font-size: 0.7rem;
      color: #666;
      text-align: center;
    }

    /* Audio Options Dialog */
    #audioOptionsDialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 150;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }

    #audioOptionsDialog.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .audio-options-content {
      background: #1a1a2e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
    }

    .audio-options-title {
      font-size: 1.25rem;
      color: #fff;
      margin-bottom: 16px;
      text-align: center;
    }

    .audio-option-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .audio-option-label {
      color: #888;
      font-size: 0.875rem;
    }

    .audio-option-value {
      color: #fff;
      font-size: 0.875rem;
    }

    .audio-options-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    #confirmOptionsBtn {
      flex: 2;
      padding: 12px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }

    #cancelOptionsBtn {
      flex: 1;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #888;
      cursor: pointer;
    }
  `;
}
