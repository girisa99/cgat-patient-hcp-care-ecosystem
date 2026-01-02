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
    console.log('[Camera] Module loading...');
    
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
    
    console.log('[Camera] DOM elements:', {
      videoPreview: !!videoPreview,
      loadingOverlay: !!loadingOverlay,
      loadingText: !!loadingText,
      recordBtn: !!recordBtn
    });

    // Format time as MM:SS
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    // Initialize camera
    async function initCamera() {
      console.log('[Camera] Initializing...');
      
      if (!videoPreview) {
        console.error('[Camera] FATAL: videoPreview element not found!');
        return;
      }
      
      if (loadingText) {
        loadingText.textContent = 'Requesting camera access...';
      }

      try {
        // Request camera permission
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'user'
          },
          audio: true
        });

        console.log('[Camera] Got media stream');

        // Attach to video element
        videoPreview.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoPreview.onloadedmetadata = function() {
          console.log('[Camera] Video metadata loaded');
          videoPreview.play();
          if (loadingOverlay) loadingOverlay.classList.add('hidden');
          enableRecordButton();
        };

        // Handle video playing
        videoPreview.onplaying = function() {
          console.log('[Camera] Video playing');
        };

      } catch (err) {
        console.error('[Camera] Error:', err);
        if (loadingText) {
          loadingText.textContent = 'Camera access denied. Please allow camera access and refresh.';
        }
        if (typeof showStatus === 'function') {
          showStatus('Camera error: ' + err.message, 'error');
        }
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

    // Initialize camera on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        console.log('[Camera] DOM ready, initializing camera...');
        initCamera();
      });
    } else {
      console.log('[Camera] DOM already ready, initializing camera...');
      initCamera();
    }

    console.log('[Camera] Module loaded with Phase 2 integrations');
  `;
}
