/**
 * Popout Recording Studio - Camera & Recording Logic
 * Handles camera initialization, MediaRecorder, and video capture
 * Simplified and robust implementation
 */

export function getCameraScript(): string {
  return `
    // =====================================================
    // CAMERA & RECORDING MODULE (with Screen Share Support)
    // =====================================================
    console.log('[Camera] Module loading...');
    
    // DOM Elements
    var videoPreview = document.getElementById('videoPreview');
    var loadingOverlay = document.getElementById('loadingOverlay');
    var loadingText = document.getElementById('loadingText');
    var recordBtn = document.getElementById('recordBtn');
    var recordBtnText = document.getElementById('recordBtnText');
    var recordingIndicator = document.getElementById('recordingIndicator');
    var recordingTimeEl = document.getElementById('recordingTime');
    var screenShareBtn = document.getElementById('screenShareBtn');
    
    // Screen share state
    var screenStream = null;
    var isScreenSharing = false;
    var combinedStream = null; // Combined camera + screen stream
    
    console.log('[Camera] DOM elements found:', {
      videoPreview: !!videoPreview,
      loadingOverlay: !!loadingOverlay,
      recordBtn: !!recordBtn,
      screenShareBtn: !!screenShareBtn
    });

    // Format time as MM:SS
    function formatTime(seconds) {
      var mins = Math.floor(seconds / 60);
      var secs = Math.floor(seconds % 60);
      return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }
    
    // Note: totalPausedTime and pauseStartTime are declared in shared globals

    // ALWAYS enable record button - works with or without camera
    function enableRecordButton(hasCamera) {
      if (!recordBtn || !recordBtnText) {
        console.error('[Camera] Record button elements not found');
        return;
      }
      
      recordBtn.disabled = false;
      recordBtn.classList.remove('disabled');
      recordBtn.classList.add('ready');
      var modeText = 'Start Recording';
      if (isScreenSharing) {
        modeText = hasCamera ? 'Record Screen + Camera' : 'Record Screen';
      } else if (!hasCamera) {
        modeText = 'Start Recording (Audio Only)';
      }
      recordBtnText.textContent = modeText;
      console.log('[Camera] ✅ Record button ENABLED, hasCamera:', hasCamera, 'screenShare:', isScreenSharing);
    }

    // Initialize camera with better error handling
    async function initCamera() {
      console.log('[Camera] 🎬 initCamera() called');
      
      // IMMEDIATELY enable the record button (user can always record audio)
      setTimeout(function() {
        enableRecordButton(false);
      }, 1000);
      
      if (!videoPreview) {
        console.error('[Camera] ❌ videoPreview element not found!');
        if (loadingText) loadingText.textContent = 'Video element not found - Audio only mode';
        hideDebugPanel();
        return;
      }
      
      // Check for mediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('[Camera] ⚠️ getUserMedia not available - Audio only mode');
        if (loadingText) loadingText.textContent = 'Camera not available - Audio only mode';
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        hideDebugPanel();
        return;
      }
      
      if (loadingText) loadingText.textContent = 'Requesting camera...';

      try {
        console.log('[Camera] 📹 Calling getUserMedia...');
        
        // Simple camera request with fallback options
        var constraints = {
          video: { 
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: 'user'
          },
          audio: true
        };
        
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        console.log('[Camera] ✅ Got media stream!');
        console.log('[Camera] Video tracks:', mediaStream.getVideoTracks().length);
        console.log('[Camera] Audio tracks:', mediaStream.getAudioTracks().length);

        // Attach to video element
        videoPreview.srcObject = mediaStream;
        videoPreview.muted = true;
        videoPreview.playsInline = true;
        
        // Wait for video to be ready
        videoPreview.onloadedmetadata = function() {
          console.log('[Camera] Video metadata loaded:', videoPreview.videoWidth + 'x' + videoPreview.videoHeight);
          
          videoPreview.play().then(function() {
            console.log('[Camera] ✅ Video playing successfully!');
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            enableRecordButton(true);
            showStatus('Camera ready!', 'success');
            hideDebugPanel();
          }).catch(function(err) {
            console.log('[Camera] Video play warning:', err.message);
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            enableRecordButton(true);
            hideDebugPanel();
          });
        };

      } catch (err) {
        console.log('[Camera] Camera error:', err.name, '-', err.message);
        
        var msg = 'Camera unavailable';
        if (err.name === 'NotAllowedError') {
          msg = 'Camera permission denied';
        } else if (err.name === 'NotFoundError') {
          msg = 'No camera found';
        } else if (err.name === 'NotReadableError') {
          msg = 'Camera in use by another app';
        }
        
        if (loadingText) loadingText.textContent = msg + ' - Audio recording available';
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        
        // Still enable recording for audio-only
        enableRecordButton(false);
        showStatus(msg + ' - You can still record audio!', 'success');
        hideDebugPanel();
      }
    }

    // =====================================================
    // SCREEN SHARE SUPPORT
    // =====================================================
    
    async function startScreenShare() {
      console.log('[ScreenShare] Starting screen share...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        console.error('[ScreenShare] getDisplayMedia not supported');
        showStatus('Screen sharing not supported in this browser', 'error');
        return false;
      }
      
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: true // Capture system audio if available
        });
        
        console.log('[ScreenShare] ✅ Got screen stream');
        console.log('[ScreenShare] Video tracks:', screenStream.getVideoTracks().length);
        console.log('[ScreenShare] Audio tracks:', screenStream.getAudioTracks().length);
        
        isScreenSharing = true;
        
        // Handle when user stops sharing via browser UI
        screenStream.getVideoTracks()[0].onended = function() {
          console.log('[ScreenShare] User stopped sharing');
          stopScreenShare();
        };
        
        // Update preview to show screen share
        if (videoPreview) {
          // Create combined stream for preview (screen + camera audio)
          if (mediaStream && mediaStream.getAudioTracks().length > 0) {
            combinedStream = new MediaStream([
              ...screenStream.getVideoTracks(),
              ...mediaStream.getAudioTracks() // Use mic audio from camera stream
            ]);
            // Also add screen audio if available
            if (screenStream.getAudioTracks().length > 0) {
              // For preview, just show the screen video
            }
          } else {
            combinedStream = screenStream;
          }
          
          videoPreview.srcObject = combinedStream;
        }
        
        // Update UI
        if (screenShareBtn) {
          screenShareBtn.classList.remove('toggle-off');
          screenShareBtn.classList.add('toggle-on');
          screenShareBtn.textContent = '🖥️ Screen: ON';
        }
        
        enableRecordButton(true);
        showStatus('Screen sharing active! Ready to record.', 'success');
        
        return true;
      } catch (err) {
        console.error('[ScreenShare] Error:', err.name, err.message);
        
        var msg = 'Screen share failed';
        if (err.name === 'NotAllowedError') {
          msg = 'Screen share cancelled or denied';
        }
        
        showStatus(msg, 'error');
        isScreenSharing = false;
        return false;
      }
    }
    
    function stopScreenShare() {
      console.log('[ScreenShare] Stopping screen share...');
      
      if (screenStream) {
        screenStream.getTracks().forEach(function(track) {
          track.stop();
        });
        screenStream = null;
      }
      
      combinedStream = null;
      isScreenSharing = false;
      
      // Revert preview to camera
      if (videoPreview && mediaStream) {
        videoPreview.srcObject = mediaStream;
      }
      
      // Update UI
      if (screenShareBtn) {
        screenShareBtn.classList.remove('toggle-on');
        screenShareBtn.classList.add('toggle-off');
        screenShareBtn.textContent = '🖥️ Screen: OFF';
      }
      
      enableRecordButton(!!mediaStream);
      showStatus('Screen sharing stopped', 'success');
    }
    
    function toggleScreenShare() {
      if (isScreenSharing) {
        stopScreenShare();
      } else {
        startScreenShare();
      }
    }
    
    // Attach screen share button handler
    if (screenShareBtn) {
      screenShareBtn.addEventListener('click', toggleScreenShare);
      console.log('[ScreenShare] Button handler attached');
    }

    // Start recording with countdown
    function startRecordingWithCountdown() {
      if (isRecording) return;
      
      console.log('[Recording] Starting with countdown...');
      
      if (typeof startCountdown === 'function') {
        startCountdown(function() {
          actuallyStartRecording();
        });
      } else {
        actuallyStartRecording();
      }
    }

    // Actually start recording
    function actuallyStartRecording() {
      console.log('[Recording] actuallyStartRecording called');
      
      isStopped = false;
      isPaused = false;
      recordedChunks = [];
      trimHistory = [];
      totalPausedTime = 0;
      pauseStartTime = null;
      
      isRecording = true;
      recordingStartTime = Date.now();
      
      // Update UI
      if (recordBtn) {
        recordBtn.classList.remove('ready');
        recordBtn.classList.add('recording');
      }
      if (recordBtnText) {
        recordBtnText.textContent = 'Stop Recording';
      }
      if (recordingIndicator) {
        recordingIndicator.classList.add('visible');
      }
      
      // Show pause button
      var pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) {
        pauseBtn.style.display = 'inline-block';
      }
      
      // Show audio controls bar
      var audioControlsBar = document.getElementById('audioControlsBar');
      if (audioControlsBar) {
        audioControlsBar.style.display = 'block';
      }
      
      // Start timer - subtract paused time for accuracy
      recordingTimer = setInterval(function() {
        if (isPaused) return;
        var now = Date.now();
        var elapsed = Math.floor((now - recordingStartTime - totalPausedTime) / 1000);
        if (recordingTimeEl) {
          recordingTimeEl.textContent = formatTime(elapsed);
        }
        
        // Update word progress if we have script words
        if (typeof scriptWords !== 'undefined' && scriptWords.length > 0 && typeof currentWordIndex !== 'undefined') {
          var wordProgressEl = document.getElementById('wordProgress');
          if (wordProgressEl) {
            var progress = scriptWords.length > 0 ? Math.round((currentWordIndex / scriptWords.length) * 100) : 0;
            wordProgressEl.textContent = 'Word ' + (currentWordIndex + 1) + '/' + scriptWords.length + ' • ' + progress + '%';
            wordProgressEl.style.display = 'block';
          }
        }
      }, 100); // Update more frequently for smoother timer
      
      // Start audio playback (voiceover, TTS, music)
      console.log('[Recording] Triggering audio playback...');
      if (typeof startAudioPlayback === 'function') {
        startAudioPlayback();
      } else {
        console.warn('[Recording] startAudioPlayback function not found');
      }
      
      // Determine which stream to record
      // Priority: combinedStream (screen+audio) > screenStream > mediaStream (camera)
      var recordingStream = null;
      
      if (isScreenSharing && screenStream) {
        // Create stream with screen video + mic audio
        if (mediaStream && mediaStream.getAudioTracks().length > 0) {
          recordingStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...mediaStream.getAudioTracks() // Mic audio from camera
          ]);
          console.log('[Recording] Using screen + mic audio');
        } else {
          recordingStream = screenStream;
          console.log('[Recording] Using screen only (no mic)');
        }
      } else if (mediaStream) {
        recordingStream = mediaStream;
        console.log('[Recording] Using camera stream');
      }
      
      // Start video recording if we have a stream
      if (recordingStream) {
        try {
          // Try VP9 for better quality, fallback to VP8
          var options = { mimeType: 'video/webm;codecs=vp9,opus' };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm;codecs=vp8,opus';
          }
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm';
          }
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = '';
          }
          
          console.log('[Recording] Using mimeType:', options.mimeType || 'default');

          mediaRecorder = new MediaRecorder(recordingStream, options);

          mediaRecorder.ondataavailable = function(event) {
            // CRITICAL: Always accept chunks while mediaRecorder is active
            // Don't check isStopped here - we need all chunks before processing
            if (event.data && event.data.size > 0) {
              recordedChunks.push(event.data);
              console.log('[Recording] Chunk received:', event.data.size, 'bytes, total:', recordedChunks.length);
            }
          };

          mediaRecorder.onstop = function() {
            console.log('[Recording] MediaRecorder stopped, chunks:', recordedChunks.length);
            // Process recording after a small delay to ensure all chunks are captured
            setTimeout(function() {
              if (recordedChunks.length > 0) {
                processRecording();
              } else {
                console.warn('[Recording] No chunks to process');
                showStatus('No video data captured', 'error');
              }
            }, 100);
          };

          mediaRecorder.onerror = function(event) {
            console.error('[Recording] Error:', event.error);
            showStatus('Recording error: ' + event.error?.message, 'error');
            stopRecording();
          };

          mediaRecorder.start(1000);
          var modeLabel = isScreenSharing ? 'Screen recording' : 'Video recording';
          console.log('[Recording] ✅', modeLabel, 'started');
          showStatus(modeLabel + ' started!', 'success');
          
        } catch (err) {
          console.error('[Recording] MediaRecorder error:', err);
          showStatus('Video recording failed - audio only', 'error');
        }
      } else {
        console.log('[Recording] Audio-only mode (no video stream)');
        showStatus('Audio playback started!', 'success');
      }
    }

    // Stop recording
    function stopRecording() {
      if (!isRecording) return;

      console.log('[Recording] Stopping... chunks so far:', recordedChunks.length);
      
      isRecording = false;
      clearInterval(recordingTimer);
      
      // If was paused, calculate final pause time
      if (isPaused && pauseStartTime) {
        totalPausedTime += Date.now() - pauseStartTime;
      }
      
      // Update UI
      if (recordBtn) {
        recordBtn.classList.remove('recording');
        recordBtn.classList.add('ready');
      }
      if (recordBtnText) {
        recordBtnText.textContent = 'Start Recording';
      }
      if (recordingIndicator) {
        recordingIndicator.classList.remove('visible');
      }
      
      // Hide pause button
      var pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) {
        pauseBtn.style.display = 'none';
      }
      
      // Hide word progress
      var wordProgressEl = document.getElementById('wordProgress');
      if (wordProgressEl) {
        wordProgressEl.style.display = 'none';
      }
      
      // Hide audio controls bar
      var audioControlsBar = document.getElementById('audioControlsBar');
      if (audioControlsBar) {
        audioControlsBar.style.display = 'none';
      }

      // Stop audio
      if (typeof stopAudioPlayback === 'function') {
        stopAudioPlayback();
      }
      if (typeof stopAllAudio === 'function') {
        stopAllAudio();
      }

      // CRITICAL: Stop MediaRecorder FIRST, then set isStopped
      // This ensures ondataavailable captures all final chunks
      isPaused = false;
      
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        console.log('[Recording] Stopping MediaRecorder, state:', mediaRecorder.state);
        mediaRecorder.stop();
        // Set isStopped AFTER stop() is called
        setTimeout(function() {
          isStopped = true;
        }, 200);
      } else {
        isStopped = true;
        console.log('[Recording] No active MediaRecorder (audio-only mode)');
        showStatus('Recording stopped', 'success');
      }
    }

    // Process and save recording
    async function processRecording() {
      if (recordedChunks.length === 0) {
        showStatus('No video data captured', 'error');
        return;
      }

      console.log('[Recording] Processing', recordedChunks.length, 'chunks');

      try {
        var blob = new Blob(recordedChunks, { type: 'video/webm' });
        var recordingName = 'recording-' + new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        var duration = recordingStartTime ? Math.floor((Date.now() - recordingStartTime - totalPausedTime) / 1000) : 0;
        
        console.log('[Recording] Blob size:', blob.size, 'bytes, duration:', duration, 's');
        
        // Save to library if available
        if (typeof saveRecordingToLibrary === 'function') {
          await saveRecordingToLibrary(blob, {
            name: recordingName,
            duration: duration
          });
          console.log('[Recording] Saved to library');
        }
        
        // Download
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = recordingName + '.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);

        showStatus('Recording saved!', 'success');
        console.log('[Recording] ✅ Saved successfully');

      } catch (err) {
        console.error('[Recording] Process error:', err);
        showStatus('Failed to save: ' + err.message, 'error');
      }
    }

    // Toggle recording
    function toggleRecording() {
      if (isRecording) {
        stopRecording();
      } else {
        startRecordingWithCountdown();
      }
    }

    // Attach record button event
    if (recordBtn) {
      recordBtn.addEventListener('click', toggleRecording);
      console.log('[Camera] Record button click handler attached');
    }

    // Close button handler - CRITICAL: Stop all audio and streams before closing
    var closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        console.log('[Camera] Close button clicked - stopping everything...');
        
        // Stop all audio FIRST
        if (typeof stopAllAudio === 'function') {
          stopAllAudio();
        }
        
        // Stop any audio elements directly
        if (typeof voiceoverAudio !== 'undefined' && voiceoverAudio) {
          voiceoverAudio.pause();
          voiceoverAudio.src = '';
          voiceoverAudio = null;
        }
        if (typeof musicAudio !== 'undefined' && musicAudio) {
          musicAudio.pause();
          musicAudio.src = '';
          musicAudio = null;
        }
        if (typeof ttsAudio !== 'undefined' && ttsAudio) {
          ttsAudio.pause();
          ttsAudio.src = '';
          ttsAudio = null;
        }
        
        // Stop screen share stream
        if (screenStream) {
          screenStream.getTracks().forEach(function(track) { track.stop(); });
          screenStream = null;
        }
        
        // Stop camera stream
        if (mediaStream) {
          mediaStream.getTracks().forEach(function(track) { track.stop(); });
          mediaStream = null;
        }
        
        // Clear video element
        if (videoPreview) {
          videoPreview.srcObject = null;
        }
        
        // Clear saved state on intentional close
        try {
          localStorage.removeItem('genie_vibe_popout_state');
          localStorage.removeItem('genie_vibe_popout_backup');
          sessionStorage.removeItem('genie_vibe_popout_state');
        } catch (e) {}
        
        console.log('[Camera] All audio and media stopped, closing window');
        window.close();
      });
    }

    // Cleanup on window close - stop all audio and streams
    window.addEventListener('beforeunload', function() {
      console.log('[Camera] Window unloading - stopping all audio...');
      
      // Stop all audio
      if (typeof stopAllAudio === 'function') {
        stopAllAudio();
      }
      
      // Direct audio element cleanup
      if (typeof voiceoverAudio !== 'undefined' && voiceoverAudio) {
        voiceoverAudio.pause();
        voiceoverAudio.src = '';
      }
      if (typeof musicAudio !== 'undefined' && musicAudio) {
        musicAudio.pause();
        musicAudio.src = '';
      }
      if (typeof ttsAudio !== 'undefined' && ttsAudio) {
        ttsAudio.pause();
        ttsAudio.src = '';
      }
      
      // Stop screen share stream
      if (screenStream) {
        screenStream.getTracks().forEach(function(track) { track.stop(); });
      }
      
      // Stop camera stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(function(track) { track.stop(); });
      }
    });
    
    // Also listen for unload event for more reliable cleanup
    window.addEventListener('unload', function() {
      console.log('[Camera] Window unload - final cleanup...');
      
      // Force stop all audio elements in the page
      var allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach(function(audio) {
        audio.pause();
        audio.src = '';
      });
      
      // Stop media stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(function(track) { track.stop(); });
      }
    });
    
    // Handle visibility change - reinitialize camera if stream was lost
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        console.log('[Camera] Tab became visible, checking stream...');
        // Check if video stream is still active
        if (videoPreview && (!videoPreview.srcObject || !mediaStream)) {
          console.log('[Camera] Stream lost, reinitializing...');
          initCamera();
        } else if (mediaStream) {
          var videoTracks = mediaStream.getVideoTracks();
          var hasActiveVideo = videoTracks.some(function(track) { return track.readyState === 'live'; });
          if (!hasActiveVideo) {
            console.log('[Camera] Video track ended, reinitializing...');
            initCamera();
          }
        }
      }
    });
    
    // Handle window focus - check and restore stream
    window.addEventListener('focus', function() {
      console.log('[Camera] Window focused, checking stream...');
      if (videoPreview && videoPreview.srcObject) {
        var stream = videoPreview.srcObject;
        if (stream && stream.getTracks) {
          var tracks = stream.getTracks();
          var allEnded = tracks.every(function(track) { return track.readyState === 'ended'; });
          if (allEnded) {
            console.log('[Camera] All tracks ended, reinitializing...');
            initCamera();
          }
        }
      }
    });

    // Initialize camera
    console.log('[Camera] Initializing...');
    initCamera();

    console.log('[Camera] ✅ Module loaded');
  `;
}
