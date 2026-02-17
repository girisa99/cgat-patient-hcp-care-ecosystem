/**
 * Popout State Persistence Module - Enhanced Version
 * Handles saving and restoring popout recording state across window focus changes
 * Uses localStorage, sessionStorage, IndexedDB, and BroadcastChannel for robust cross-window communication
 * 
 * Key improvements:
 * - Multi-layer persistence (localStorage + sessionStorage + IndexedDB)
 * - Aggressive state saving during recording
 * - Better recovery on window/tab switch
 * - Recording chunk preservation
 * - MediaStream state tracking
 */

export interface PopoutRecordingState {
  // Recording state
  isRecording: boolean;
  isPaused: boolean;
  isStopped: boolean;
  recordingStartTime: number | null;
  recordingDuration: number;
  recordingChunksCount: number;
  
  // Media stream state
  hasMediaStream: boolean;
  hasVideoTrack: boolean;
  hasAudioTrack: boolean;
  mediaStreamActive: boolean;
  
  // Selections
  selectedScriptId: string;
  selectedVoiceoverId: string;
  selectedMusicId: string;
  currentScriptVersion: 'original' | 'enhanced' | 'clean';
  
  // Audio state
  voiceoverPlaying: boolean;
  voiceoverCurrentTime: number;
  voiceoverSrc: string;
  musicPlaying: boolean;
  musicCurrentTime: number;
  musicSrc: string;
  ttsPlaying: boolean;
  ttsCurrentTime: number;
  
  // UI state
  teleprompterEnabled: boolean;
  teleprompterScrollPosition: number;
  teleprompterAutoScroll: boolean;
  blurEnabled: boolean;
  logoEnabled: boolean;
  activePanel: string;
  
  // Volumes
  voiceoverVolume: number;
  musicVolume: number;
  ttsVolume: number;
  
  // Timestamps and identifiers
  lastUpdated: number;
  sessionId: string;
  windowId: string;
  recoveryAttempts: number;
}

const STORAGE_KEY = 'genie_vibe_popout_state';
const BACKUP_KEY = 'genie_vibe_popout_backup';
const CHANNEL_NAME = 'genie_vibe_popout_channel';
const INDEXED_DB_NAME = 'genie_vibe_recording_db';
const INDEXED_DB_STORE = 'recording_state';

/**
 * Get the persistence script to inject into the popout HTML
 */
export function getStatePersistenceScript(): string {
  return `
    // =====================================================
    // STATE PERSISTENCE MODULE - ENHANCED VERSION
    // Robust state preservation across window/tab switches
    // =====================================================
    console.log('[Persistence] Enhanced module loading...');
    
    var STORAGE_KEY = '${STORAGE_KEY}';
    var BACKUP_KEY = '${BACKUP_KEY}';
    var CHANNEL_NAME = '${CHANNEL_NAME}';
    var INDEXED_DB_NAME = '${INDEXED_DB_NAME}';
    var INDEXED_DB_STORE = '${INDEXED_DB_STORE}';
    
    var sessionId = 'popout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    var windowId = 'window_' + Date.now();
    var broadcastChannel = null;
    var stateSaveInterval = null;
    var fastSaveInterval = null;
    var lastKnownState = null;
    var recoveryAttempts = 0;
    var indexedDB = null;
    var isRecovering = false;
    
    // =====================================================
    // INDEXED DB SETUP (Most reliable storage)
    // =====================================================
    function initIndexedDB() {
      return new Promise(function(resolve, reject) {
        try {
          var request = window.indexedDB.open(INDEXED_DB_NAME, 1);
          
          request.onerror = function(event) {
            console.warn('[Persistence] IndexedDB error:', event.target.error);
            resolve(null);
          };
          
          request.onsuccess = function(event) {
            indexedDB = event.target.result;
            console.log('[Persistence] IndexedDB initialized');
            resolve(indexedDB);
          };
          
          request.onupgradeneeded = function(event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
              db.createObjectStore(INDEXED_DB_STORE, { keyPath: 'id' });
            }
          };
        } catch (e) {
          console.warn('[Persistence] IndexedDB not available:', e);
          resolve(null);
        }
      });
    }
    
    // Save to IndexedDB
    function saveToIndexedDB(state) {
      if (!indexedDB) return;
      try {
        var transaction = indexedDB.transaction([INDEXED_DB_STORE], 'readwrite');
        var store = transaction.objectStore(INDEXED_DB_STORE);
        store.put({ id: 'current_state', ...state });
      } catch (e) {
        console.warn('[Persistence] IndexedDB save failed:', e);
      }
    }
    
    // Load from IndexedDB
    function loadFromIndexedDB() {
      return new Promise(function(resolve) {
        if (!indexedDB) {
          resolve(null);
          return;
        }
        try {
          var transaction = indexedDB.transaction([INDEXED_DB_STORE], 'readonly');
          var store = transaction.objectStore(INDEXED_DB_STORE);
          var request = store.get('current_state');
          
          request.onsuccess = function() {
            resolve(request.result || null);
          };
          request.onerror = function() {
            resolve(null);
          };
        } catch (e) {
          resolve(null);
        }
      });
    }
    
    // =====================================================
    // BROADCAST CHANNEL SETUP
    // =====================================================
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
        broadcastChannel.onmessage = function(event) {
          console.log('[Persistence] Received message:', event.data.type);
          if (event.data.type === 'ping') {
            broadcastChannel.postMessage({ 
              type: 'pong', 
              sessionId: sessionId,
              windowId: windowId,
              isRecording: typeof isRecording !== 'undefined' ? isRecording : false,
              hasStream: !!mediaStream
            });
          } else if (event.data.type === 'restore_state') {
            restoreState(event.data.state);
          } else if (event.data.type === 'force_save') {
            saveStateImmediately();
          }
        };
        console.log('[Persistence] BroadcastChannel initialized');
      }
    } catch (e) {
      console.warn('[Persistence] BroadcastChannel not available:', e);
    }
    
    // =====================================================
    // GET CURRENT STATE (Comprehensive)
    // =====================================================
    function getCurrentState() {
      var state = {
        // Recording state
        isRecording: typeof isRecording !== 'undefined' ? isRecording : false,
        isPaused: typeof isPaused !== 'undefined' ? isPaused : false,
        isStopped: typeof isStopped !== 'undefined' ? isStopped : false,
        recordingStartTime: typeof recordingStartTime !== 'undefined' ? recordingStartTime : null,
        recordingDuration: 0,
        recordingChunksCount: typeof recordedChunks !== 'undefined' ? recordedChunks.length : 0,
        
        // Media stream state
        hasMediaStream: !!mediaStream,
        hasVideoTrack: false,
        hasAudioTrack: false,
        mediaStreamActive: false,
        
        // Selections
        selectedScriptId: '',
        selectedVoiceoverId: '',
        selectedMusicId: '',
        currentScriptVersion: typeof currentScriptVersion !== 'undefined' ? currentScriptVersion : 'original',
        
        // Audio state
        voiceoverPlaying: false,
        voiceoverCurrentTime: 0,
        voiceoverSrc: '',
        musicPlaying: false,
        musicCurrentTime: 0,
        musicSrc: '',
        ttsPlaying: false,
        ttsCurrentTime: 0,
        
        // UI state
        teleprompterEnabled: typeof teleprompterEnabled !== 'undefined' ? teleprompterEnabled : true,
        teleprompterScrollPosition: 0,
        teleprompterAutoScroll: typeof teleprompterAutoScroll !== 'undefined' ? teleprompterAutoScroll : false,
        blurEnabled: typeof blurEnabled !== 'undefined' ? blurEnabled : false,
        logoEnabled: typeof logoEnabled !== 'undefined' ? logoEnabled : false,
        activePanel: '',
        
        // Volumes
        voiceoverVolume: 100,
        musicVolume: 50,
        ttsVolume: 100,
        
        // Timestamps
        lastUpdated: Date.now(),
        sessionId: sessionId,
        windowId: windowId,
        recoveryAttempts: recoveryAttempts
      };
      
      // Get media stream details
      if (mediaStream) {
        var videoTracks = mediaStream.getVideoTracks();
        var audioTracks = mediaStream.getAudioTracks();
        state.hasVideoTrack = videoTracks.length > 0;
        state.hasAudioTrack = audioTracks.length > 0;
        state.mediaStreamActive = videoTracks.some(function(t) { return t.readyState === 'live'; }) ||
                                   audioTracks.some(function(t) { return t.readyState === 'live'; });
      }
      
      // Get select values
      var scriptSelect = document.getElementById('scriptSelect');
      var voiceoverSelect = document.getElementById('voiceoverSelect');
      var musicSelect = document.getElementById('musicSelect');
      
      if (scriptSelect) state.selectedScriptId = scriptSelect.value || '';
      if (voiceoverSelect) state.selectedVoiceoverId = voiceoverSelect.value || '';
      if (musicSelect) state.selectedMusicId = musicSelect.value || '';
      
        // Calculate recording duration (accounting for paused time)
        if (state.isRecording && state.recordingStartTime && !state.isPaused) {
          var pausedTime = typeof totalPausedTime !== 'undefined' ? totalPausedTime : 0;
          state.recordingDuration = Math.floor((Date.now() - state.recordingStartTime - pausedTime) / 1000);
        }
      
      // Get audio states with sources
      if (typeof voiceoverAudio !== 'undefined' && voiceoverAudio) {
        state.voiceoverPlaying = !voiceoverAudio.paused;
        state.voiceoverCurrentTime = voiceoverAudio.currentTime || 0;
        state.voiceoverSrc = voiceoverAudio.src || '';
      }
      if (typeof musicAudio !== 'undefined' && musicAudio) {
        state.musicPlaying = !musicAudio.paused;
        state.musicCurrentTime = musicAudio.currentTime || 0;
        state.musicSrc = musicAudio.src || '';
      }
      if (typeof ttsAudio !== 'undefined' && ttsAudio) {
        state.ttsPlaying = !ttsAudio.paused;
        state.ttsCurrentTime = ttsAudio.currentTime || 0;
      }
      
      // Get teleprompter state
      var teleprompter = document.getElementById('teleprompter');
      if (teleprompter) {
        state.teleprompterScrollPosition = teleprompter.scrollTop || 0;
      }
      
      // Get volumes
      var voiceoverVolumeEl = document.getElementById('voiceoverVolume');
      var musicVolumeEl = document.getElementById('musicVolume');
      var ttsVolumeEl = document.getElementById('ttsVolume');
      if (voiceoverVolumeEl) state.voiceoverVolume = parseInt(voiceoverVolumeEl.value) || 100;
      if (musicVolumeEl) state.musicVolume = parseInt(musicVolumeEl.value) || 50;
      if (ttsVolumeEl) state.ttsVolume = parseInt(ttsVolumeEl.value) || 100;
      
      // Get active panel
      var activeTab = document.querySelector('.tab-button.active');
      if (activeTab) state.activePanel = activeTab.dataset.tab || '';
      
      return state;
    }
    
    // =====================================================
    // SAVE STATE (Multi-layer persistence)
    // =====================================================
    function saveStateImmediately() {
      try {
        var state = getCurrentState();
        
        // Layer 1: localStorage (primary)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        
        // Layer 2: sessionStorage (backup for same tab)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        
        // Layer 3: Backup in separate key
        localStorage.setItem(BACKUP_KEY, JSON.stringify({
          ...state,
          backupTimestamp: Date.now()
        }));
        
        // Layer 4: IndexedDB (most reliable)
        saveToIndexedDB(state);
        
        lastKnownState = state;
        
        // Broadcast to parent window
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'state_update', state: state });
        }
        
        // Update indicator
        updateStateIndicator('saving');
        setTimeout(function() { updateStateIndicator('saved'); }, 200);
        
        return state;
      } catch (e) {
        console.warn('[Persistence] Failed to save state:', e);
        updateStateIndicator('error');
        return null;
      }
    }
    
    function saveState() {
      // Debounced version
      saveStateImmediately();
    }
    
    // =====================================================
    // RESTORE STATE (Try all sources)
    // =====================================================
    async function restoreState(stateToRestore) {
      if (isRecovering) {
        console.log('[Persistence] Already recovering, skipping...');
        return false;
      }
      
      isRecovering = true;
      
      try {
        var state = stateToRestore;
        
        // Try multiple sources if no state provided
        if (!state) {
          // Try localStorage first
          var savedState = localStorage.getItem(STORAGE_KEY);
          if (savedState) {
            state = JSON.parse(savedState);
          }
          
          // Try sessionStorage if localStorage failed
          if (!state) {
            savedState = sessionStorage.getItem(STORAGE_KEY);
            if (savedState) {
              state = JSON.parse(savedState);
            }
          }
          
          // Try backup key
          if (!state) {
            savedState = localStorage.getItem(BACKUP_KEY);
            if (savedState) {
              state = JSON.parse(savedState);
            }
          }
          
          // Try IndexedDB
          if (!state && indexedDB) {
            state = await loadFromIndexedDB();
          }
        }
        
        if (!state) {
          console.log('[Persistence] No saved state found in any storage');
          isRecovering = false;
          return false;
        }
        
        // Check if state is recent (within last 60 minutes for recording)
        var maxAge = state.isRecording ? 60 * 60 * 1000 : 30 * 60 * 1000;
        if (Date.now() - state.lastUpdated > maxAge) {
          console.log('[Persistence] Saved state is too old:', Math.floor((Date.now() - state.lastUpdated) / 60000), 'minutes');
          clearAllState();
          isRecovering = false;
          return false;
        }
        
        console.log('[Persistence] Restoring state...', {
          isRecording: state.isRecording,
          isPaused: state.isPaused,
          duration: state.recordingDuration,
          hasStream: state.hasMediaStream
        });
        
        recoveryAttempts++;
        
        // Restore selections
        var scriptSelect = document.getElementById('scriptSelect');
        var voiceoverSelect = document.getElementById('voiceoverSelect');
        var musicSelect = document.getElementById('musicSelect');
        
        if (scriptSelect && state.selectedScriptId) {
          scriptSelect.value = state.selectedScriptId;
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
        if (typeof teleprompterEnabled !== 'undefined') {
          teleprompterEnabled = state.teleprompterEnabled;
        }
        if (typeof blurEnabled !== 'undefined') {
          blurEnabled = state.blurEnabled;
        }
        if (typeof logoEnabled !== 'undefined') {
          logoEnabled = state.logoEnabled;
        }
        
        // Restore volumes
        var voiceoverVolumeEl = document.getElementById('voiceoverVolume');
        var musicVolumeEl = document.getElementById('musicVolume');
        var ttsVolumeEl = document.getElementById('ttsVolume');
        if (voiceoverVolumeEl && state.voiceoverVolume !== undefined) {
          voiceoverVolumeEl.value = state.voiceoverVolume;
        }
        if (musicVolumeEl && state.musicVolume !== undefined) {
          musicVolumeEl.value = state.musicVolume;
        }
        if (ttsVolumeEl && state.ttsVolume !== undefined) {
          ttsVolumeEl.value = state.ttsVolume;
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
        
        // Handle interrupted recording recovery
        if (state.isRecording && !state.isStopped) {
          // Only show recovery if there's ACTUAL data to recover
          // Must have BOTH duration > 5 seconds AND at least 1 chunk
          var hasMeaningfulRecording = state.recordingDuration > 5 && state.recordingChunksCount > 0;
          
          if (hasMeaningfulRecording) {
            console.log('[Persistence] Recording was in progress with data!');
            console.log('[Persistence] Duration:', state.recordingDuration, 'Chunks:', state.recordingChunksCount);
            showRecoveryNotification(state);
            
            // Try to reinitialize camera if stream was lost
            if (!mediaStream || !state.mediaStreamActive) {
              console.log('[Persistence] Media stream lost, attempting recovery...');
              if (typeof initCamera === 'function') {
                setTimeout(function() {
                  initCamera();
                }, 1000);
              }
            }
          } else {
            console.log('[Persistence] Recording was started but no meaningful data');
            console.log('[Persistence] Duration:', state.recordingDuration, 'Chunks:', state.recordingChunksCount);
            console.log('[Persistence] Clearing stale state...');
            clearAllState();
          }
        }
        
        // Restore audio positions with resume capability
        restoreAudioPositions(state);
        
        console.log('[Persistence] ✅ State restored successfully (attempt', recoveryAttempts + ')');
        isRecovering = false;
        return true;
        
      } catch (e) {
        console.warn('[Persistence] Failed to restore state:', e);
        isRecovering = false;
        return false;
      }
    }
    
    // Restore audio positions helper
    function restoreAudioPositions(state) {
      if (state.voiceoverCurrentTime > 0) {
        setTimeout(function() {
          if (typeof voiceoverAudio !== 'undefined' && voiceoverAudio) {
            voiceoverAudio.currentTime = state.voiceoverCurrentTime;
            console.log('[Persistence] Restored voiceover position:', state.voiceoverCurrentTime);
          }
        }, 1000);
      }
      if (state.musicCurrentTime > 0) {
        setTimeout(function() {
          if (typeof musicAudio !== 'undefined' && musicAudio) {
            musicAudio.currentTime = state.musicCurrentTime;
            console.log('[Persistence] Restored music position:', state.musicCurrentTime);
          }
        }, 1000);
      }
      if (state.ttsCurrentTime > 0) {
        setTimeout(function() {
          if (typeof ttsAudio !== 'undefined' && ttsAudio) {
            ttsAudio.currentTime = state.ttsCurrentTime;
            console.log('[Persistence] Restored TTS position:', state.ttsCurrentTime);
          }
        }, 1000);
      }
    }
    
    // Show recovery notification
    function showRecoveryNotification(state) {
      // Don't show notification for 0:00 recordings with no chunks - nothing to recover
      var duration = state.recordingDuration || 0;
      var hasChunks = state.recordingChunksCount > 0;
      
      if (duration === 0 && !hasChunks) {
        console.log('[Persistence] Skipping recovery notification - no actual recording data');
        clearAllState(); // Clear the stale state
        return;
      }
      
      var mins = Math.floor(duration / 60);
      var secs = duration % 60;
      var timeStr = mins + ':' + (secs < 10 ? '0' : '') + secs;
      
      var message = 'Recording was interrupted at ' + timeStr + '. ';
      if (hasChunks) {
        message += state.recordingChunksCount + ' chunks captured. Camera reinitializing...';
      } else {
        message += 'You can restart recording.';
      }
      
      showStatus(message, 'warning');
    }
    
    // =====================================================
    // CLEAR STATE
    // =====================================================
    function clearAllState() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(BACKUP_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        
        if (indexedDB) {
          var transaction = indexedDB.transaction([INDEXED_DB_STORE], 'readwrite');
          var store = transaction.objectStore(INDEXED_DB_STORE);
          store.delete('current_state');
        }
        
        lastKnownState = null;
        recoveryAttempts = 0;
        console.log('[Persistence] All state cleared');
      } catch (e) {
        console.warn('[Persistence] Failed to clear state:', e);
      }
    }
    
    // =====================================================
    // STATE INDICATOR UI
    // =====================================================
    function updateStateIndicator(status) {
      var indicator = document.getElementById('stateIndicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'stateIndicator';
        indicator.className = 'state-indicator';
        document.body.appendChild(indicator);
      }
      
      indicator.classList.remove('saving', 'saved', 'error');
      indicator.classList.add(status);
      
      if (status === 'saved') {
        indicator.title = 'State saved';
      } else if (status === 'saving') {
        indicator.title = 'Saving...';
      } else if (status === 'error') {
        indicator.title = 'Save error';
      }
    }
    
    // =====================================================
    // EVENT HANDLERS
    // =====================================================
    
    // Visibility change (tab switch) - CRITICAL
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        console.log('[Persistence] Tab hidden, saving state immediately...');
        saveStateImmediately();
        
        // Start aggressive saving while hidden during recording
        if (isRecording) {
          fastSaveInterval = setInterval(saveStateImmediately, 500);
        }
      } else {
        console.log('[Persistence] Tab visible again');
        
        // Stop aggressive saving
        if (fastSaveInterval) {
          clearInterval(fastSaveInterval);
          fastSaveInterval = null;
        }
        
        // Check stream health
        if (videoPreview && mediaStream) {
          var tracks = mediaStream.getTracks();
          var allEnded = tracks.every(function(t) { return t.readyState === 'ended'; });
          if (allEnded) {
            console.log('[Persistence] All tracks ended, attempting recovery...');
            restoreState();
          }
        } else if (lastKnownState && lastKnownState.isRecording) {
          console.log('[Persistence] Recording was active but stream lost');
          restoreState();
        }
      }
    });
    
    // Window blur (losing focus)
    window.addEventListener('blur', function() {
      console.log('[Persistence] Window blur, saving state...');
      saveStateImmediately();
    });
    
    // Window focus (gaining focus)
    window.addEventListener('focus', function() {
      console.log('[Persistence] Window focus regained');
      
      // Check if stream is still valid
      setTimeout(function() {
        if (mediaStream) {
          var tracks = mediaStream.getTracks();
          var hasActiveTrack = tracks.some(function(t) { return t.readyState === 'live'; });
          
          if (!hasActiveTrack && lastKnownState && lastKnownState.isRecording) {
            console.log('[Persistence] Stream lost during recording, reinitializing...');
            if (typeof initCamera === 'function') {
              initCamera();
            }
          }
        }
      }, 100);
    });
    
    // Before unload - CRITICAL
    window.addEventListener('beforeunload', function(e) {
      console.log('[Persistence] Window closing, final state save...');
      saveStateImmediately();
      
      // Warn if recording in progress
      if (isRecording && !isStopped) {
        e.preventDefault();
        e.returnValue = 'Recording in progress. Are you sure you want to close? Your recording will be interrupted.';
        return e.returnValue;
      }
    });
    
    // Page show (back/forward cache)
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        console.log('[Persistence] Page restored from cache');
        restoreState();
      }
    });
    
    // =====================================================
    // CROSS-WINDOW SYNC
    // =====================================================
    window.addEventListener('storage', function(e) {
      if (e.key === 'genie_vibe_parent_command') {
        try {
          var command = JSON.parse(e.newValue);
          console.log('[Persistence] Received parent command:', command.type);
          
          if (command.type === 'ping') {
            localStorage.setItem('genie_vibe_popout_response', JSON.stringify({
              type: 'pong',
              sessionId: sessionId,
              windowId: windowId,
              isRecording: isRecording,
              isPaused: isPaused,
              hasCamera: !!mediaStream,
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
          } else if (command.type === 'save_state') {
            saveStateImmediately();
          }
        } catch (err) {
          console.warn('[Persistence] Error handling parent command:', err);
        }
      }
    });
    
    // Heartbeat
    var heartbeatInterval = setInterval(function() {
      try {
        localStorage.setItem('genie_vibe_popout_heartbeat', JSON.stringify({
          sessionId: sessionId,
          windowId: windowId,
          isRecording: isRecording,
          isPaused: isPaused,
          isStopped: isStopped,
          hasCamera: !!mediaStream,
          streamActive: mediaStream ? mediaStream.getTracks().some(function(t) { return t.readyState === 'live'; }) : false,
          recordingDuration: isRecording && recordingStartTime ? Math.floor((Date.now() - recordingStartTime) / 1000) : 0,
          chunksCount: typeof recordedChunks !== 'undefined' ? recordedChunks.length : 0,
          timestamp: Date.now()
        }));
      } catch (e) {}
    }, 1000);
    
    // =====================================================
    // STATE SAVING INTERVALS
    // =====================================================
    function startStateSaving() {
      if (stateSaveInterval) {
        clearInterval(stateSaveInterval);
      }
      // Save every 2 seconds during active recording/playback
      stateSaveInterval = setInterval(function() {
        if (isRecording || 
            (typeof voiceoverAudio !== 'undefined' && voiceoverAudio && !voiceoverAudio.paused) || 
            (typeof musicAudio !== 'undefined' && musicAudio && !musicAudio.paused) ||
            (typeof ttsAudio !== 'undefined' && ttsAudio && !ttsAudio.paused)) {
          saveState();
        }
      }, 2000);
    }
    
    function stopStateSaving() {
      if (stateSaveInterval) {
        clearInterval(stateSaveInterval);
        stateSaveInterval = null;
      }
      if (fastSaveInterval) {
        clearInterval(fastSaveInterval);
        fastSaveInterval = null;
      }
    }
    
    // Hook into recording functions
    var originalActuallyStartRecording = typeof actuallyStartRecording === 'function' ? actuallyStartRecording : null;
    actuallyStartRecording = function() {
      console.log('[Persistence] Recording started, enabling aggressive state saving...');
      startStateSaving();
      // Also start fast save during recording
      if (!fastSaveInterval) {
        fastSaveInterval = setInterval(saveStateImmediately, 1000);
      }
      if (originalActuallyStartRecording) {
        originalActuallyStartRecording();
      }
    };
    
    var originalStopRecording = typeof stopRecording === 'function' ? stopRecording : null;
    stopRecording = function() {
      console.log('[Persistence] Recording stopped, clearing state and doing final save...');
      if (originalStopRecording) {
        originalStopRecording();
      }
      // Clear the recording state after successful stop - no need to recover this
      setTimeout(function() {
        clearAllState();
        console.log('[Persistence] Recording completed, state cleared');
      }, 2000); // Wait for processing to complete
      stopStateSaving();
    };
    
    // =====================================================
    // INITIALIZATION
    // =====================================================
    initIndexedDB().then(function() {
      setTimeout(async function() {
        var restored = await restoreState();
        if (restored) {
          console.log('[Persistence] ✅ Previous session state restored');
        } else {
          console.log('[Persistence] Starting fresh session');
        }
        startStateSaving();
      }, 2000);
    });
    
    // Cleanup
    window.addEventListener('unload', function() {
      clearInterval(heartbeatInterval);
      stopStateSaving();
    });
    
    console.log('[Persistence] ✅ Enhanced module loaded with sessionId:', sessionId, 'windowId:', windowId);
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
