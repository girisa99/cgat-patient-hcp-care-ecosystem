/**
 * Popout State Persistence Module
 * Handles saving and restoring popout recording state across window focus changes
 * Uses localStorage and BroadcastChannel for cross-window communication
 */

export interface PopoutRecordingState {
  // Recording state
  isRecording: boolean;
  isPaused: boolean;
  recordingStartTime: number | null;
  recordingDuration: number;
  
  // Selections
  selectedScriptId: string;
  selectedVoiceoverId: string;
  selectedMusicId: string;
  currentScriptVersion: 'original' | 'enhanced' | 'clean';
  
  // Audio state
  voiceoverPlaying: boolean;
  voiceoverCurrentTime: number;
  musicPlaying: boolean;
  musicCurrentTime: number;
  ttsPlaying: boolean;
  ttsCurrentTime: number;
  
  // UI state
  teleprompterEnabled: boolean;
  teleprompterScrollPosition: number;
  blurEnabled: boolean;
  logoEnabled: boolean;
  
  // Volumes
  voiceoverVolume: number;
  musicVolume: number;
  
  // Timestamps
  lastUpdated: number;
  sessionId: string;
}

const STORAGE_KEY = 'genie_vibe_popout_state';
const CHANNEL_NAME = 'genie_vibe_popout_channel';

/**
 * Get the persistence script to inject into the popout HTML
 */
export function getStatePersistenceScript(): string {
  return `
    // =====================================================
    // STATE PERSISTENCE MODULE
    // =====================================================
    console.log('[Persistence] Module loading...');
    
    var STORAGE_KEY = '${STORAGE_KEY}';
    var CHANNEL_NAME = '${CHANNEL_NAME}';
    var sessionId = 'popout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    var broadcastChannel = null;
    var stateSaveInterval = null;
    var lastKnownState = null;
    
    // Initialize broadcast channel for cross-window communication
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
        broadcastChannel.onmessage = function(event) {
          console.log('[Persistence] Received message:', event.data.type);
          if (event.data.type === 'ping') {
            broadcastChannel.postMessage({ type: 'pong', sessionId: sessionId });
          } else if (event.data.type === 'restore_state') {
            restoreState(event.data.state);
          }
        };
        console.log('[Persistence] BroadcastChannel initialized');
      }
    } catch (e) {
      console.warn('[Persistence] BroadcastChannel not available:', e);
    }
    
    // Get current popout state
    function getCurrentState() {
      var state = {
        isRecording: typeof isRecording !== 'undefined' ? isRecording : false,
        isPaused: typeof isPaused !== 'undefined' ? isPaused : false,
        recordingStartTime: typeof recordingStartTime !== 'undefined' ? recordingStartTime : null,
        recordingDuration: 0,
        selectedScriptId: '',
        selectedVoiceoverId: '',
        selectedMusicId: '',
        currentScriptVersion: typeof currentScriptVersion !== 'undefined' ? currentScriptVersion : 'original',
        voiceoverPlaying: false,
        voiceoverCurrentTime: 0,
        musicPlaying: false,
        musicCurrentTime: 0,
        ttsPlaying: false,
        ttsCurrentTime: 0,
        teleprompterEnabled: typeof teleprompterEnabled !== 'undefined' ? teleprompterEnabled : true,
        teleprompterScrollPosition: 0,
        blurEnabled: typeof blurEnabled !== 'undefined' ? blurEnabled : false,
        logoEnabled: typeof logoEnabled !== 'undefined' ? logoEnabled : false,
        voiceoverVolume: 100,
        musicVolume: 50,
        lastUpdated: Date.now(),
        sessionId: sessionId
      };
      
      // Get select values
      var scriptSelect = document.getElementById('scriptSelect');
      var voiceoverSelect = document.getElementById('voiceoverSelect');
      var musicSelect = document.getElementById('musicSelect');
      
      if (scriptSelect) state.selectedScriptId = scriptSelect.value || '';
      if (voiceoverSelect) state.selectedVoiceoverId = voiceoverSelect.value || '';
      if (musicSelect) state.selectedMusicId = musicSelect.value || '';
      
      // Calculate recording duration
      if (state.isRecording && state.recordingStartTime) {
        state.recordingDuration = Math.floor((Date.now() - state.recordingStartTime) / 1000);
      }
      
      // Get audio states
      if (typeof voiceoverAudio !== 'undefined' && voiceoverAudio) {
        state.voiceoverPlaying = !voiceoverAudio.paused;
        state.voiceoverCurrentTime = voiceoverAudio.currentTime || 0;
      }
      if (typeof musicAudio !== 'undefined' && musicAudio) {
        state.musicPlaying = !musicAudio.paused;
        state.musicCurrentTime = musicAudio.currentTime || 0;
      }
      if (typeof ttsAudio !== 'undefined' && ttsAudio) {
        state.ttsPlaying = !ttsAudio.paused;
        state.ttsCurrentTime = ttsAudio.currentTime || 0;
      }
      
      // Get teleprompter scroll position
      var teleprompter = document.getElementById('teleprompter');
      if (teleprompter) {
        state.teleprompterScrollPosition = teleprompter.scrollTop || 0;
      }
      
      // Get volumes
      var voiceoverVolumeEl = document.getElementById('voiceoverVolume');
      var musicVolumeEl = document.getElementById('musicVolume');
      if (voiceoverVolumeEl) state.voiceoverVolume = parseInt(voiceoverVolumeEl.value) || 100;
      if (musicVolumeEl) state.musicVolume = parseInt(musicVolumeEl.value) || 50;
      
      return state;
    }
    
    // Save state to localStorage
    function saveState() {
      try {
        var state = getCurrentState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        lastKnownState = state;
        
        // Also broadcast to parent window
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'state_update', state: state });
        }
      } catch (e) {
        console.warn('[Persistence] Failed to save state:', e);
      }
    }
    
    // Restore state from localStorage
    function restoreState(stateToRestore) {
      try {
        var state = stateToRestore;
        if (!state) {
          var savedState = localStorage.getItem(STORAGE_KEY);
          if (!savedState) {
            console.log('[Persistence] No saved state found');
            return false;
          }
          state = JSON.parse(savedState);
        }
        
        // Check if state is recent (within last 30 minutes)
        if (Date.now() - state.lastUpdated > 30 * 60 * 1000) {
          console.log('[Persistence] Saved state is too old, ignoring');
          localStorage.removeItem(STORAGE_KEY);
          return false;
        }
        
        console.log('[Persistence] Restoring state...', state);
        
        // Restore selections
        var scriptSelect = document.getElementById('scriptSelect');
        var voiceoverSelect = document.getElementById('voiceoverSelect');
        var musicSelect = document.getElementById('musicSelect');
        
        if (scriptSelect && state.selectedScriptId) {
          scriptSelect.value = state.selectedScriptId;
          // Trigger change event
          scriptSelect.dispatchEvent(new Event('change'));
        }
        if (voiceoverSelect && state.selectedVoiceoverId) {
          voiceoverSelect.value = state.selectedVoiceoverId;
          voiceoverSelect.dispatchEvent(new Event('change'));
        }
        if (musicSelect && state.selectedMusicId) {
          musicSelect.value = state.selectedMusicId;
          musicSelect.dispatchEvent(new Event('change'));
        }
        
        // Restore UI toggles
        if (state.teleprompterEnabled !== undefined) {
          teleprompterEnabled = state.teleprompterEnabled;
        }
        if (state.blurEnabled !== undefined) {
          blurEnabled = state.blurEnabled;
        }
        if (state.logoEnabled !== undefined) {
          logoEnabled = state.logoEnabled;
        }
        
        // Restore volumes
        var voiceoverVolumeEl = document.getElementById('voiceoverVolume');
        var musicVolumeEl = document.getElementById('musicVolume');
        if (voiceoverVolumeEl && state.voiceoverVolume !== undefined) {
          voiceoverVolumeEl.value = state.voiceoverVolume;
        }
        if (musicVolumeEl && state.musicVolume !== undefined) {
          musicVolumeEl.value = state.musicVolume;
        }
        
        // Restore teleprompter scroll position
        if (state.teleprompterScrollPosition > 0) {
          setTimeout(function() {
            var teleprompter = document.getElementById('teleprompter');
            if (teleprompter) {
              teleprompter.scrollTop = state.teleprompterScrollPosition;
            }
          }, 500);
        }
        
        // If was recording, show notification about interrupted recording
        if (state.isRecording) {
          showStatus('Previous recording was interrupted. You can start a new recording.', 'info');
        }
        
        // Restore audio positions if audio was playing
        if (state.voiceoverPlaying && state.voiceoverCurrentTime > 0) {
          setTimeout(function() {
            if (typeof voiceoverAudio !== 'undefined' && voiceoverAudio) {
              voiceoverAudio.currentTime = state.voiceoverCurrentTime;
              console.log('[Persistence] Restored voiceover position:', state.voiceoverCurrentTime);
            }
          }, 1000);
        }
        if (state.musicPlaying && state.musicCurrentTime > 0) {
          setTimeout(function() {
            if (typeof musicAudio !== 'undefined' && musicAudio) {
              musicAudio.currentTime = state.musicCurrentTime;
              console.log('[Persistence] Restored music position:', state.musicCurrentTime);
            }
          }, 1000);
        }
        
        console.log('[Persistence] ✅ State restored successfully');
        return true;
        
      } catch (e) {
        console.warn('[Persistence] Failed to restore state:', e);
        return false;
      }
    }
    
    // Clear saved state
    function clearSavedState() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        lastKnownState = null;
        console.log('[Persistence] State cleared');
      } catch (e) {
        console.warn('[Persistence] Failed to clear state:', e);
      }
    }
    
    // Handle visibility change (tab switch)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        // Tab is being hidden, save state immediately
        console.log('[Persistence] Tab hidden, saving state...');
        saveState();
      } else {
        // Tab is becoming visible again
        console.log('[Persistence] Tab visible again');
        // Don't auto-restore on visibility change, just save the current state
        // The state should persist in memory
      }
    });
    
    // Handle window blur (losing focus)
    window.addEventListener('blur', function() {
      console.log('[Persistence] Window blur, saving state...');
      saveState();
    });
    
    // Handle window focus (gaining focus)
    window.addEventListener('focus', function() {
      console.log('[Persistence] Window focus regained');
      // Check if we need to restore state
      if (!mediaStream && lastKnownState && lastKnownState.isRecording) {
        console.log('[Persistence] Recording was in progress, attempting camera reinit...');
        if (typeof initCamera === 'function') {
          initCamera();
        }
      }
    });
    
    // Handle before unload - CRITICAL: prevent close during recording
    window.addEventListener('beforeunload', function(e) {
      console.log('[Persistence] Window closing, saving final state...');
      saveState();
      
      // Warn if recording is in progress
      if (isRecording && !isStopped) {
        e.preventDefault();
        e.returnValue = 'Recording in progress. Are you sure you want to close?';
        return e.returnValue;
      }
    });
    
    // Handle page show (back/forward cache)
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        console.log('[Persistence] Page restored from cache');
        restoreState();
      }
    });
    
    // =====================================================
    // ENHANCED CROSS-WINDOW SYNC
    // =====================================================
    
    // Listen for events from parent window
    window.addEventListener('storage', function(e) {
      if (e.key === 'genie_vibe_parent_command') {
        try {
          var command = JSON.parse(e.newValue);
          console.log('[Persistence] Received parent command:', command.type);
          
          if (command.type === 'ping') {
            // Respond to ping
            localStorage.setItem('genie_vibe_popout_response', JSON.stringify({
              type: 'pong',
              sessionId: sessionId,
              isRecording: isRecording,
              timestamp: Date.now()
            }));
          } else if (command.type === 'pause_recording') {
            if (typeof pauseRecording === 'function' && isRecording && !isPaused) {
              pauseRecording();
            }
          } else if (command.type === 'stop_recording') {
            if (typeof stopRecording === 'function' && isRecording) {
              stopRecording();
            }
          }
        } catch (err) {
          console.warn('[Persistence] Error handling parent command:', err);
        }
      }
    });
    
    // Heartbeat to let parent know we're alive
    var heartbeatInterval = setInterval(function() {
      try {
        localStorage.setItem('genie_vibe_popout_heartbeat', JSON.stringify({
          sessionId: sessionId,
          isRecording: isRecording,
          isPaused: isPaused,
          hasCamera: !!mediaStream,
          timestamp: Date.now()
        }));
      } catch (e) {}
    }, 1000);
    
    // Start periodic state saving when recording
    function startStateSaving() {
      if (stateSaveInterval) {
        clearInterval(stateSaveInterval);
      }
      stateSaveInterval = setInterval(function() {
        if (isRecording || (typeof voiceoverAudio !== 'undefined' && voiceoverAudio && !voiceoverAudio.paused) || 
            (typeof musicAudio !== 'undefined' && musicAudio && !musicAudio.paused)) {
          saveState();
        }
      }, 2000); // Save every 2 seconds during active recording/playback
    }
    
    function stopStateSaving() {
      if (stateSaveInterval) {
        clearInterval(stateSaveInterval);
        stateSaveInterval = null;
      }
    }
    
    // Hook into recording start/stop
    var originalActuallyStartRecording = typeof actuallyStartRecording === 'function' ? actuallyStartRecording : null;
    actuallyStartRecording = function() {
      console.log('[Persistence] Recording started, enabling state saving...');
      startStateSaving();
      if (originalActuallyStartRecording) {
        originalActuallyStartRecording();
      }
    };
    
    var originalStopRecording = typeof stopRecording === 'function' ? stopRecording : null;
    stopRecording = function() {
      console.log('[Persistence] Recording stopped, final state save...');
      saveState();
      stopStateSaving();
      if (originalStopRecording) {
        originalStopRecording();
      }
    };
    
    // Try to restore state on initialization
    setTimeout(function() {
      var restored = restoreState();
      if (restored) {
        console.log('[Persistence] ✅ Previous session state restored');
      } else {
        console.log('[Persistence] Starting fresh session');
      }
      // Start state saving regardless
      startStateSaving();
    }, 2000);
    
    // Cleanup on unload
    window.addEventListener('unload', function() {
      clearInterval(heartbeatInterval);
      stopStateSaving();
    });
    
    console.log('[Persistence] ✅ Module loaded with sessionId:', sessionId);
  `;
}

/**
 * Get CSS styles for persistence-related UI elements
 */
export function getStatePersistenceStyles(): string {
  return `
    /* Persistence notification styles */
    .persistence-notification {
      position: fixed;
      top: 60px;
      right: 20px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: slideIn 0.3s ease-out;
    }
    
    .persistence-notification.warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }
    
    .persistence-notification.error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .state-indicator {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
      z-index: 9999;
      transition: all 0.3s ease;
    }
    
    .state-indicator.saving {
      background: #f59e0b;
      animation: pulse 1s infinite;
    }
    
    .state-indicator.error {
      background: #ef4444;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
}
