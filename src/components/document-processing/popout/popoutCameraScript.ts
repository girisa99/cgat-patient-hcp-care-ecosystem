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

    let mediaStream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;
    let recordingStartTime = null;
    let recordingTimer = null;

    // DOM Elements
    const videoPreview = document.getElementById('videoPreview');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const recordBtn = document.getElementById('recordBtn');
    const recordBtnText = document.getElementById('recordBtnText');
    const recordingIndicator = document.getElementById('recordingIndicator');
    const recordingTimeEl = document.getElementById('recordingTime');
    const statusContainer = document.getElementById('statusContainer');

    // Show status message
    function showStatus(message, type) {
      statusContainer.innerHTML = '<div class="status-message ' + type + '">' + message + '</div>';
      if (type === 'success') {
        setTimeout(function() { statusContainer.innerHTML = ''; }, 5000);
      }
    }

    // Format time as MM:SS
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    // Initialize camera
    async function initCamera() {
      console.log('[Camera] Initializing...');
      loadingText.textContent = 'Requesting camera access...';

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
          loadingOverlay.classList.add('hidden');
          enableRecordButton();
        };

        // Handle video playing
        videoPreview.onplaying = function() {
          console.log('[Camera] Video playing');
        };

      } catch (err) {
        console.error('[Camera] Error:', err);
        loadingText.textContent = 'Camera access denied. Please allow camera access and refresh.';
        showStatus('Camera error: ' + err.message, 'error');
      }
    }

    // Enable record button
    function enableRecordButton() {
      recordBtn.disabled = false;
      recordBtn.classList.remove('disabled');
      recordBtn.classList.add('ready');
      recordBtnText.textContent = 'Start Recording';
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

        // Update UI
        recordBtn.classList.remove('ready');
        recordBtn.classList.add('recording');
        recordBtnText.textContent = 'Stop Recording';
        recordingIndicator.classList.add('visible');

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
          recordingTimeEl.textContent = formatTime(elapsed);
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
      
      // Update UI
      recordBtn.classList.remove('recording');
      recordBtn.classList.add('ready');
      recordBtnText.textContent = 'Start Recording';
      recordingIndicator.classList.remove('visible');

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

    // Process and download recording
    function processRecording() {
      if (recordedChunks.length === 0) {
        showStatus('No recording data captured', 'error');
        return;
      }

      console.log('[Recording] Processing', recordedChunks.length, 'chunks');

      try {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording-' + new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-') + '.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);

        showStatus('Recording saved! Check your downloads folder.', 'success');
        console.log('[Recording] Downloaded successfully');

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

    // Record button click handler
    recordBtn.addEventListener('click', toggleRecording);

    // Close button handler
    document.getElementById('closeBtn').addEventListener('click', function() {
      if (mediaStream) {
        mediaStream.getTracks().forEach(function(track) { track.stop(); });
      }
      window.close();
    });

    // Cleanup on window close
    window.addEventListener('beforeunload', function() {
      if (mediaStream) {
        mediaStream.getTracks().forEach(function(track) { track.stop(); });
      }
    });

    // Initialize camera on load
    initCamera();

    console.log('[Camera] Module loaded with Phase 2 integrations');
  `;
}
