/**
 * Popout Recording Studio - Camera & Recording Logic
 * Handles camera initialization, MediaRecorder, and video capture
 * Integrates with enhanced recording features (countdown, pause, trim)
 */

export function getCameraScript(): string {
  return `
    // =====================================================
    // CAMERA & RECORDING MODULE
    // =====================================================
    debugLog('[Camera] Module loading...');
    
    // Note: mediaStream, mediaRecorder, recordedChunks, isRecording, 
    // recordingStartTime, recordingTimer, isStopped, isPaused, trimHistory
    // and showStatus are declared in shared globals

    // DOM Elements - with null checks
    var videoPreview = document.getElementById('videoPreview');
    var loadingOverlay = document.getElementById('loadingOverlay');
    var loadingText = document.getElementById('loadingText');
    var recordBtn = document.getElementById('recordBtn');
    var recordBtnText = document.getElementById('recordBtnText');
    var recordingIndicator = document.getElementById('recordingIndicator');
    var recordingTimeEl = document.getElementById('recordingTime');
    
    debugLog('[Camera] DOM: video=' + !!videoPreview + ', overlay=' + !!loadingOverlay + ', btn=' + !!recordBtn);

    // Format time as MM:SS
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    // Initialize camera
    async function initCamera() {
      debugLog('[Camera] 🎬 initCamera() called');
      
      if (!videoPreview) {
        debugLog('[Camera] ❌ videoPreview element not found!');
        if (loadingText) loadingText.textContent = 'Error: Video element not found';
        return;
      }
      
      debugLog('[Camera] ✅ Video element found');
      
      if (loadingText) {
        loadingText.textContent = 'Requesting camera access...';
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        debugLog('[Camera] ❌ getUserMedia not supported in this context!');
        if (loadingText) {
          loadingText.textContent = 'Camera not supported in this browser/context';
        }
        showStatus('Camera API not available', 'error');
        return;
      }
      
      debugLog('[Camera] ✅ getUserMedia API available');

      try {
        debugLog('[Camera] 📹 Calling getUserMedia...');
        
        // Request camera permission
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: true
        });

        debugLog('[Camera] ✅ Got media stream! ID: ' + mediaStream.id);
        debugLog('[Camera] Video tracks: ' + mediaStream.getVideoTracks().length);
        debugLog('[Camera] Audio tracks: ' + mediaStream.getAudioTracks().length);

        // Attach to video element
        videoPreview.srcObject = mediaStream;
        
        // Set video properties
        videoPreview.muted = true;
        videoPreview.playsInline = true;
        
        // Wait for video to be ready
        videoPreview.onloadedmetadata = function() {
          debugLog('[Camera] Video metadata loaded: ' + videoPreview.videoWidth + 'x' + videoPreview.videoHeight);
          
          videoPreview.play().then(function() {
            debugLog('[Camera] ✅ Video playing successfully!');
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            enableRecordButton();
            showStatus('Camera ready!', 'success');
            // Hide debug panel once camera works
            hideDebugPanel();
          }).catch(function(playErr) {
            debugLog('[Camera] ❌ Play error: ' + playErr.message);
            showStatus('Video play error: ' + playErr.message, 'error');
          });
        };
        
        // Handle errors
        videoPreview.onerror = function(e) {
          debugLog('[Camera] ❌ Video element error');
          showStatus('Video element error', 'error');
        };

        // Handle video playing
        videoPreview.onplaying = function() {
          debugLog('[Camera] Video is now playing');
        };

      } catch (err) {
        debugLog('[Camera] ❌ getUserMedia error: ' + err.name + ' - ' + err.message);
        
        var errorMessage = 'Camera error: ' + err.message;
        
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permission and refresh.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is in use by another application.';
        } else if (err.name === 'SecurityError') {
          errorMessage = 'Camera blocked due to security restrictions.';
        }
        
        debugLog('[Camera] Error message: ' + errorMessage);
        
        if (loadingText) {
          loadingText.textContent = errorMessage;
        }
        showStatus(errorMessage, 'error');
      }
    }

    // Enable record button - with null checks
    function enableRecordButton() {
      if (!recordBtn || !recordBtnText) {
        console.error('[Camera] Cannot enable record button - elements not found');
        return;
      }
      recordBtn.disabled = false;
      recordBtn.classList.remove('disabled');
      recordBtn.classList.add('ready');
      recordBtnText.textContent = 'Start Recording';
      console.log('[Camera] Record button enabled');
    }

    // Start recording with countdown
    function startRecordingWithCountdown() {
      if (!mediaStream || isRecording) return;

      console.log('[Recording] Starting with countdown...');
      
      // Use enhanced countdown if available
      if (typeof startCountdown === 'function') {
        startCountdown(function() {
          actuallyStartRecording();
        });
      } else {
        // Fallback: start immediately
        actuallyStartRecording();
      }
    }

    // Actually start recording (called after countdown)
    function actuallyStartRecording() {
      if (!mediaStream) {
        console.error('[Recording] No media stream');
        return;
      }

      // Reset enhanced state
      if (typeof isStopped !== 'undefined') isStopped = false;
      if (typeof isPaused !== 'undefined') isPaused = false;
      
      recordedChunks = [];
      if (typeof trimHistory !== 'undefined') trimHistory = [];

      try {
        const options = { mimeType: 'video/webm;codecs=vp9,opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = '';
        }

        mediaRecorder = new MediaRecorder(mediaStream, options);

        mediaRecorder.ondataavailable = function(event) {
          if (event.data && event.data.size > 0) {
            // Check isStopped flag from enhanced module
            if (typeof isStopped === 'undefined' || !isStopped) {
              recordedChunks.push(event.data);
              console.log('[Recording] Chunk received:', event.data.size, 'bytes');
            }
          }
        };

        mediaRecorder.onstop = function() {
          console.log('[Recording] Stopped, processing...');
          // Only process if not stopped via enhanced stop
          if (typeof isStopped === 'undefined' || !isStopped) {
            processRecording();
          }
        };

        mediaRecorder.onerror = function(event) {
          console.error('[Recording] Error:', event.error);
          showStatus('Recording error: ' + event.error.message, 'error');
          stopRecording();
        };

        mediaRecorder.start(1000); // Capture in 1-second chunks
        isRecording = true;
        recordingStartTime = Date.now();

        // Update UI - with null checks
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

        // Start timer (respects pause state)
        let pausedTime = 0;
        let lastPauseStart = null;
        
        recordingTimer = setInterval(function() {
          if (typeof isPaused !== 'undefined' && isPaused) {
            if (!lastPauseStart) lastPauseStart = Date.now();
            return;
          }
          
          if (lastPauseStart) {
            pausedTime += Date.now() - lastPauseStart;
            lastPauseStart = null;
          }
          
          const elapsed = Math.floor((Date.now() - recordingStartTime - pausedTime) / 1000);
          if (recordingTimeEl) {
            recordingTimeEl.textContent = formatTime(elapsed);
          }
        }, 1000);

        // Trigger audio playback and show recording UI
        if (typeof startAudioPlayback === 'function') {
          startAudioPlayback();
        }

        console.log('[Recording] Started successfully');

      } catch (err) {
        console.error('[Recording] Start error:', err);
        showStatus('Failed to start recording: ' + err.message, 'error');
      }
    }

    // Stop recording
    function stopRecording() {
      if (!isRecording || !mediaRecorder) return;

      console.log('[Recording] Stopping...');
      
      // Set stopped flag for enhanced module
      if (typeof isStopped !== 'undefined') isStopped = true;
      
      isRecording = false;
      clearInterval(recordingTimer);
      
      // Update UI - with null checks
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

      // Stop any audio playback
      if (typeof stopAudioPlayback === 'function') {
        stopAudioPlayback();
      }
      
      // Use enhanced stop if available
      if (typeof stopAllAudio === 'function') {
        stopAllAudio();
      }

      // Stop MediaRecorder
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }

    // Process and save/download recording
    async function processRecording() {
      if (recordedChunks.length === 0) {
        showStatus('No recording data captured', 'error');
        return;
      }

      console.log('[Recording] Processing', recordedChunks.length, 'chunks');

      try {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const recordingName = 'recording-' + new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        
        // Calculate duration
        const duration = recordingStartTime ? Math.floor((Date.now() - recordingStartTime) / 1000) : 0;
        
        // Get metadata
        const selectedScriptOption = document.getElementById('scriptSelect')?.options[document.getElementById('scriptSelect')?.selectedIndex];
        const selectedVoiceover = document.getElementById('voiceoverSelect')?.value;
        const selectedMusic = document.getElementById('musicSelect')?.value;
        
        // Save to library if available
        if (typeof saveRecordingToLibrary === 'function') {
          await saveRecordingToLibrary(blob, {
            name: recordingName,
            duration: duration,
            scriptTitle: selectedScriptOption ? selectedScriptOption.text : null,
            hasVoiceover: !!selectedVoiceover,
            hasMusic: !!selectedMusic
          });
        }
        
        // Also trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = recordingName + '.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);

        showStatus('Recording saved! Check downloads and library.', 'success');
        console.log('[Recording] Saved successfully');

      } catch (err) {
        console.error('[Recording] Process error:', err);
        showStatus('Failed to save recording: ' + err.message, 'error');
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

    // Record button click handler - with null check
    if (recordBtn) {
      recordBtn.addEventListener('click', toggleRecording);
      console.log('[Camera] Record button event attached');
    } else {
      console.error('[Camera] Record button not found - cannot attach event');
    }

    // Close button handler - with null check
    var closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        if (mediaStream) {
          mediaStream.getTracks().forEach(function(track) { track.stop(); });
        }
        window.close();
      });
      console.log('[Camera] Close button event attached');
    }

    // Cleanup on window close
    window.addEventListener('beforeunload', function() {
      if (mediaStream) {
        mediaStream.getTracks().forEach(function(track) { track.stop(); });
      }
    });

    // Initialize camera immediately (DOM is already ready from wrapper)
    console.log('[Camera] Initializing camera...');
    initCamera();

    console.log('[Camera] Module loaded with Phase 2 integrations');
  `;
}
