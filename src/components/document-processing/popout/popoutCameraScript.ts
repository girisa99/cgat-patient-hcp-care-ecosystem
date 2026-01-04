/**
 * Popout Recording Studio - Camera & Recording Logic
 * Handles camera initialization, MediaRecorder, and video capture
 * Simplified and robust implementation
 */

export function getCameraScript(): string {
  return `
    // =====================================================
    // CAMERA & RECORDING MODULE (Simplified & Robust)
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
    
    console.log('[Camera] DOM elements found:', {
      videoPreview: !!videoPreview,
      loadingOverlay: !!loadingOverlay,
      recordBtn: !!recordBtn
    });

    // Format time as MM:SS
    function formatTime(seconds) {
      var mins = Math.floor(seconds / 60);
      var secs = seconds % 60;
      return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    // ALWAYS enable record button - works with or without camera
    function enableRecordButton(hasCamera) {
      if (!recordBtn || !recordBtnText) {
        console.error('[Camera] Record button elements not found');
        return;
      }
      
      recordBtn.disabled = false;
      recordBtn.classList.remove('disabled');
      recordBtn.classList.add('ready');
      recordBtnText.textContent = hasCamera ? 'Start Recording' : 'Start Recording (Audio Only)';
      console.log('[Camera] ✅ Record button ENABLED, hasCamera:', hasCamera);
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
      
      // Start timer
      recordingTimer = setInterval(function() {
        if (isPaused) return;
        var elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        if (recordingTimeEl) {
          recordingTimeEl.textContent = formatTime(elapsed);
        }
      }, 1000);
      
      // Start audio playback (voiceover, TTS, music)
      console.log('[Recording] Triggering audio playback...');
      if (typeof startAudioPlayback === 'function') {
        startAudioPlayback();
      } else {
        console.warn('[Recording] startAudioPlayback function not found');
      }
      
      // Start video recording if we have a stream
      if (mediaStream) {
        try {
          var options = { mimeType: 'video/webm;codecs=vp9,opus' };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm';
          }
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = '';
          }

          mediaRecorder = new MediaRecorder(mediaStream, options);

          mediaRecorder.ondataavailable = function(event) {
            if (event.data && event.data.size > 0 && !isStopped) {
              recordedChunks.push(event.data);
              console.log('[Recording] Chunk received:', event.data.size, 'bytes');
            }
          };

          mediaRecorder.onstop = function() {
            console.log('[Recording] MediaRecorder stopped');
            if (!isStopped) {
              processRecording();
            }
          };

          mediaRecorder.onerror = function(event) {
            console.error('[Recording] Error:', event.error);
            showStatus('Recording error: ' + event.error?.message, 'error');
            stopRecording();
          };

          mediaRecorder.start(1000);
          console.log('[Recording] ✅ Video recording started');
          showStatus('Recording started!', 'success');
          
        } catch (err) {
          console.error('[Recording] MediaRecorder error:', err);
          showStatus('Video recording failed - audio only', 'error');
        }
      } else {
        console.log('[Recording] Audio-only mode (no camera stream)');
        showStatus('Audio playback started!', 'success');
      }
    }

    // Stop recording
    function stopRecording() {
      if (!isRecording) return;

      console.log('[Recording] Stopping...');
      
      isStopped = true;
      isRecording = false;
      clearInterval(recordingTimer);
      
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

      // Stop audio
      if (typeof stopAudioPlayback === 'function') {
        stopAudioPlayback();
      }
      if (typeof stopAllAudio === 'function') {
        stopAllAudio();
      }

      // Stop MediaRecorder
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      } else {
        console.log('[Recording] No video to process (audio-only)');
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
        var duration = recordingStartTime ? Math.floor((Date.now() - recordingStartTime) / 1000) : 0;
        
        // Save to library if available
        if (typeof saveRecordingToLibrary === 'function') {
          await saveRecordingToLibrary(blob, {
            name: recordingName,
            duration: duration
          });
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

    // Close button handler
    var closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        if (mediaStream) {
          mediaStream.getTracks().forEach(function(track) { track.stop(); });
        }
        // Clear saved state on intentional close
        try {
          localStorage.removeItem('genie_vibe_popout_state');
        } catch (e) {}
        window.close();
      });
    }

    // Cleanup on window close
    window.addEventListener('beforeunload', function() {
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
