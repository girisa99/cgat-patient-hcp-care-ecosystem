/**
 * Popout Recording Studio - Camera & Recording Logic
 * Handles camera initialization, MediaRecorder, and video capture
 * WITH Web Audio API for mixing all audio sources into recording
 */

export function getCameraScript(): string {
  return `
    // =====================================================
    // CAMERA & RECORDING MODULE (with Screen Share Support)
    // INCLUDES: Web Audio API mixing for voiceover/music/TTS
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
    
    // =====================================================
    // WEB AUDIO API FOR MIXING ALL AUDIO INTO RECORDING
    // This fixes Bug #1: Voiceover/Music not being recorded
    // =====================================================
    var audioContext = null;
    var audioDestination = null; // MediaStreamAudioDestinationNode
    var microphoneSource = null;
    var voiceoverSource = null;
    var musicSource = null;
    var ttsSource = null;
    var connectedSources = []; // Track all connected sources
    
    // Chunk monitoring (Bug #4 fix)
    var chunkMonitorInterval = null;
    var lastChunkCount = 0;
    var chunkStallCount = 0;
    
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
    
    // =====================================================
    // AUDIO MIXING FUNCTIONS (Web Audio API)
    // =====================================================
    
    function initAudioContext() {
      if (audioContext) return;
      
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioDestination = audioContext.createMediaStreamDestination();
        console.log('[AudioMix] ✅ AudioContext initialized');
      } catch (err) {
        console.error('[AudioMix] Failed to create AudioContext:', err);
      }
    }
    
    function connectMicrophoneToMix(micStream) {
      if (!audioContext || !audioDestination) {
        initAudioContext();
      }
      if (!audioContext) return null;
      
      try {
        if (micStream && micStream.getAudioTracks().length > 0) {
          microphoneSource = audioContext.createMediaStreamSource(micStream);
          microphoneSource.connect(audioDestination);
          connectedSources.push(microphoneSource);
          console.log('[AudioMix] ✅ Microphone connected to mix');
          return microphoneSource;
        }
      } catch (err) {
        console.error('[AudioMix] Error connecting microphone:', err);
      }
      return null;
    }
    
    function connectAudioElementToMix(audioElement, sourceName) {
      if (!audioContext || !audioDestination) {
        initAudioContext();
      }
      if (!audioContext || !audioElement) return null;
      
      try {
        var source = audioContext.createMediaElementSource(audioElement);
        source.connect(audioDestination);
        source.connect(audioContext.destination); // Also play through speakers
        connectedSources.push(source);
        console.log('[AudioMix] ✅', sourceName, 'connected to mix');
        return source;
      } catch (err) {
        // Might already be connected
        console.warn('[AudioMix] Could not connect', sourceName + ':', err.message);
        return null;
      }
    }
    
    function getMixedAudioStream() {
      if (!audioDestination) {
        console.warn('[AudioMix] No audio destination available');
        return null;
      }
      return audioDestination.stream;
    }
    
    function cleanupAudioMix() {
      console.log('[AudioMix] Cleaning up...');
      
      // Disconnect all sources
      connectedSources.forEach(function(source) {
        try {
          source.disconnect();
        } catch (e) {}
      });
      connectedSources = [];
      
      microphoneSource = null;
      voiceoverSource = null;
      musicSource = null;
      ttsSource = null;
      
      // Close context
      if (audioContext && audioContext.state !== 'closed') {
        try {
          audioContext.close();
        } catch (e) {}
      }
      audioContext = null;
      audioDestination = null;
    }
    
    // =====================================================
    // CHUNK MONITORING (Bug #4 fix)
    // =====================================================
    
    function startChunkMonitoring() {
      if (chunkMonitorInterval) return;
      
      lastChunkCount = recordedChunks.length;
      chunkStallCount = 0;
      
      chunkMonitorInterval = setInterval(function() {
        if (!isRecording || isPaused) return;
        
        var currentCount = recordedChunks.length;
        
        if (currentCount === lastChunkCount) {
          chunkStallCount++;
          console.warn('[ChunkMonitor] No new chunks for', chunkStallCount * 2, 'seconds');
          
          // If stalled for 4+ seconds, force requestData
          if (chunkStallCount >= 2 && mediaRecorder && mediaRecorder.state === 'recording') {
            console.log('[ChunkMonitor] Forcing requestData() due to stall...');
            try {
              mediaRecorder.requestData();
            } catch (e) {
              console.error('[ChunkMonitor] requestData failed:', e);
            }
          }
          
          // If stalled for 10+ seconds, likely a failure
          if (chunkStallCount >= 5) {
            console.error('[ChunkMonitor] Recording appears to have stalled!');
            showStatus('Warning: Recording may have stalled', 'error');
          }
        } else {
          chunkStallCount = 0;
        }
        
        lastChunkCount = currentCount;
      }, 2000);
      
      console.log('[ChunkMonitor] Started monitoring');
    }
    
    function stopChunkMonitoring() {
      if (chunkMonitorInterval) {
        clearInterval(chunkMonitorInterval);
        chunkMonitorInterval = null;
      }
      lastChunkCount = 0;
      chunkStallCount = 0;
      console.log('[ChunkMonitor] Stopped');
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
        // BUG #2 FIX: MUST stop recording FIRST to save data before cleanup
        screenStream.getVideoTracks()[0].onended = function() {
          console.log('[ScreenShare] User stopped sharing via browser UI');
          
          // CRITICAL: Stop recording first to save all data
          if (isRecording) {
            console.log('[ScreenShare] Stopping recording before screen share cleanup...');
            stopRecording(); // This saves the recording data
          }
          
          // Then clean up screen share
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
      
      console.log('[Recording] State initialized:', {
        isRecording: isRecording,
        recordingStartTime: recordingStartTime,
        recordedChunks: recordedChunks.length
      });
      
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
        if (!recordingStartTime) {
          console.warn('[Recording] Timer: recordingStartTime is null!');
          return;
        }
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
      
      // =====================================================
      // BUG #1 FIX: Initialize Web Audio API for mixing
      // This captures voiceover, music, TTS, AND mic into recording
      // =====================================================
      initAudioContext();
      
      // Connect microphone to audio mix
      if (mediaStream && mediaStream.getAudioTracks().length > 0) {
        connectMicrophoneToMix(mediaStream);
      }
      
      // Start audio playback (voiceover, TTS, music)
      console.log('[Recording] Triggering audio playback...');
      if (typeof startAudioPlayback === 'function') {
        startAudioPlayback();
      } else {
        console.warn('[Recording] startAudioPlayback function not found');
      }
      
      // Wait a short moment for audio elements to be created, then connect them
      setTimeout(function() {
        // Connect voiceover audio to mix
        if (typeof voiceoverAudio !== 'undefined' && voiceoverAudio && !voiceoverSource) {
          voiceoverSource = connectAudioElementToMix(voiceoverAudio, 'Voiceover');
        }
        
        // Connect music audio to mix  
        if (typeof musicAudio !== 'undefined' && musicAudio && !musicSource) {
          musicSource = connectAudioElementToMix(musicAudio, 'Music');
        }
        
        // Connect TTS audio to mix
        if (typeof ttsAudio !== 'undefined' && ttsAudio && !ttsSource) {
          ttsSource = connectAudioElementToMix(ttsAudio, 'TTS');
        }
        
        console.log('[Recording] Audio sources connected to mix:', {
          microphone: !!microphoneSource,
          voiceover: !!voiceoverSource,
          music: !!musicSource,
          tts: !!ttsSource
        });
      }, 200);
      
      // =====================================================
      // BUILD RECORDING STREAM WITH MIXED AUDIO
      // =====================================================
      var recordingStream = null;
      var videoTracks = [];
      
      // Get video tracks from screen share or camera
      if (isScreenSharing && screenStream) {
        videoTracks = screenStream.getVideoTracks();
        console.log('[Recording] Using screen video tracks:', videoTracks.length);
      } else if (mediaStream && mediaStream.getVideoTracks().length > 0) {
        videoTracks = mediaStream.getVideoTracks();
        console.log('[Recording] Using camera video tracks:', videoTracks.length);
      }
      
      // Get mixed audio stream (includes mic + voiceover + music + TTS)
      var mixedAudioStream = getMixedAudioStream();
      
      if (videoTracks.length > 0 && mixedAudioStream) {
        // Full recording: video + all mixed audio
        recordingStream = new MediaStream([
          ...videoTracks,
          ...mixedAudioStream.getAudioTracks()
        ]);
        console.log('[Recording] ✅ Stream with video + MIXED audio (includes voiceover/music/TTS)');
      } else if (videoTracks.length > 0 && mediaStream) {
        // Fallback: video + mic only (if audio context failed)
        recordingStream = new MediaStream([
          ...videoTracks,
          ...mediaStream.getAudioTracks()
        ]);
        console.log('[Recording] Using video + mic audio (fallback - no mix)');
      } else if (mediaStream) {
        recordingStream = mediaStream;
        console.log('[Recording] Using camera stream directly');
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
            console.log('[Recording] ondataavailable fired, data size:', event.data ? event.data.size : 0, 'state:', mediaRecorder.state);
            // CRITICAL: Always accept chunks - don't check any flags
            if (event.data && event.data.size > 0) {
              recordedChunks.push(event.data);
              console.log('[Recording] ✅ Chunk stored:', event.data.size, 'bytes, total chunks:', recordedChunks.length);
            } else {
              console.warn('[Recording] Empty data in ondataavailable');
            }
          };

          mediaRecorder.onstop = function() {
            console.log('[Recording] MediaRecorder onstop fired, chunks:', recordedChunks.length);
            
            // Stop chunk monitoring
            stopChunkMonitoring();
            
            // Clean up audio mix
            cleanupAudioMix();
            
            // Process recording after a small delay to ensure all chunks are captured
            setTimeout(function() {
              if (recordedChunks.length > 0) {
                processRecording();
              } else {
                console.error('[Recording] No chunks to process - this should not happen!');
                showStatus('No video data captured - please try again', 'error');
              }
            }, 200);
          };

          mediaRecorder.onerror = function(event) {
            console.error('[Recording] MediaRecorder error:', event.error);
            showStatus('Recording error: ' + (event.error?.message || 'Unknown error'), 'error');
            stopRecording();
          };

          // Start with 500ms timeslice
          mediaRecorder.start(500);
          console.log('[Recording] MediaRecorder started with 500ms timeslice, state:', mediaRecorder.state);
          
          // Start chunk monitoring (Bug #4 fix)
          startChunkMonitoring();
          
          // Force an immediate data request to ensure first chunk is captured
          setTimeout(function() {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              console.log('[Recording] Requesting initial data chunk...');
              mediaRecorder.requestData();
            }
          }, 100);
          
          var modeLabel = isScreenSharing ? 'Screen recording' : 'Video recording';
          console.log('[Recording] ✅', modeLabel, 'started with mixed audio');
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
    // BUG #3 FIX: Use proper async/Promise-based sequencing instead of nested setTimeout
    function stopRecording() {
      if (!isRecording) return;

      console.log('[Recording] ========== STOP RECORDING ==========');
      console.log('[Recording] Current state:', {
        recorderState: mediaRecorder ? mediaRecorder.state : 'none',
        chunksCollected: recordedChunks.length,
        isPaused: isPaused,
        totalPausedTime: totalPausedTime
      });
      
      isRecording = false;
      clearInterval(recordingTimer);
      stopChunkMonitoring();
      
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
      
      // Hide edit panel
      var editPanel = document.getElementById('editPanel');
      if (editPanel) {
        editPanel.style.display = 'none';
      }

      // Stop audio FIRST
      console.log('[Recording] Stopping all audio...');
      if (typeof stopAudioPlayback === 'function') {
        stopAudioPlayback();
      }
      if (typeof stopAllAudio === 'function') {
        stopAllAudio();
      }
      
      // Also directly stop audio elements
      if (voiceoverAudio) {
        voiceoverAudio.pause();
        voiceoverAudio.currentTime = 0;
      }
      if (musicAudio) {
        musicAudio.pause();
        musicAudio.currentTime = 0;
      }
      if (ttsAudio) {
        ttsAudio.pause();
        ttsAudio.currentTime = 0;
      }

      // =====================================================
      // BUG #3 FIX: Proper sequential handling with Promises
      // =====================================================
      if (mediaRecorder) {
        var recorderState = mediaRecorder.state;
        console.log('[Recording] MediaRecorder state before stop:', recorderState);
        
        // Create a promise to handle the stop sequence properly
        var stopSequence = new Promise(function(resolve) {
          
          if (recorderState === 'paused') {
            // PAUSED STATE: Must resume, wait for state change, request data, then stop
            console.log('[Recording] Was paused - using sequential stop flow...');
            
            // Step 1: Resume
            mediaRecorder.resume();
            
            // Step 2: Wait for resume to complete (longer delay for reliability)
            setTimeout(function() {
              if (mediaRecorder && mediaRecorder.state === 'recording') {
                // Step 3: Request any remaining data
                console.log('[Recording] Requesting data after resume...');
                mediaRecorder.requestData();
                
                // Step 4: Wait for data to be captured (longer delay)
                setTimeout(function() {
                  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    console.log('[Recording] Final stop, chunks:', recordedChunks.length);
                    mediaRecorder.stop();
                  }
                  resolve();
                }, 300); // Longer delay for data capture
              } else {
                // Resume failed, try direct stop
                console.warn('[Recording] Resume did not work, state:', mediaRecorder?.state);
                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                  try { mediaRecorder.stop(); } catch (e) {}
                }
                resolve();
              }
            }, 150); // Longer delay for resume
            
          } else if (recorderState === 'recording') {
            // ACTIVE RECORDING: Request final data and stop
            console.log('[Recording] Was recording - requesting final data chunk...');
            mediaRecorder.requestData();
            
            setTimeout(function() {
              if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                console.log('[Recording] Stopping MediaRecorder, final chunks:', recordedChunks.length);
                mediaRecorder.stop();
              }
              resolve();
            }, 250); // Slightly longer delay
            
          } else {
            // INACTIVE or other state
            console.log('[Recording] Recorder already inactive or unknown state');
            resolve();
          }
        });
        
        stopSequence.then(function() {
          isStopped = true;
          console.log('[Recording] Stop sequence completed');
        });
        
      } else {
        isStopped = true;
        console.log('[Recording] No MediaRecorder (audio-only mode)');
        showStatus('Recording stopped', 'success');
      }
      
      isPaused = false;
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

    // Get initial recording mode from parent studio
    var initialModeEl = document.getElementById('initialRecordingMode');
    var initialMode = 'camera';
    if (initialModeEl) {
      try {
        initialMode = JSON.parse(initialModeEl.textContent || '"camera"');
      } catch (e) {
        console.log('[Camera] Could not parse initial mode, defaulting to camera');
      }
    }
    console.log('[Camera] Initial recording mode:', initialMode);

    // Initialize camera
    console.log('[Camera] Initializing...');
    initCamera().then(function() {
      // Auto-start screen share if mode requires it
      if (initialMode === 'screen' || initialMode === 'screen+camera') {
        console.log('[Camera] Auto-starting screen share for mode:', initialMode);
        setTimeout(function() {
          if (!isScreenSharing) {
            startScreenShare();
          }
        }, 1500); // Give camera time to initialize first
      }
    });

    console.log('[Camera] ✅ Module loaded');
  `;
}
