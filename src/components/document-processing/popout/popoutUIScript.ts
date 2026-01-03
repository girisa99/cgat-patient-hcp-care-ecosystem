/**
 * Popout Recording Studio - UI Interaction Logic
 * Handles selectors, audio playback, toggles, and teleprompter
 */

export function getUIScript(): string {
  return `
    // =====================================================
    // UI INTERACTION MODULE
    // =====================================================
    console.log('[UI] Module loading...');
    
    // Note: voiceoverAudio, musicAudio, ttsAudio are declared in shared globals
    // We use the global variables directly, not local ones

    // UI State
    var teleprompterEnabled = true;
    var blurEnabled = false;
    // logoEnabled is declared in shared globals

    // DOM Elements - UI (with null checks)
    var scriptSelect = document.getElementById('scriptSelect');
    var voiceoverSelect = document.getElementById('voiceoverSelect');
    var musicSelect = document.getElementById('musicSelect');
    var teleprompter = document.getElementById('teleprompter');
    var teleprompterText = document.getElementById('teleprompterText');
    var teleprompterBtn = document.getElementById('teleprompterBtn');
    var blurBtn = document.getElementById('blurBtn');
    var logoBtn = document.getElementById('logoBtn');
    var logoOverlay = document.getElementById('logoOverlay');
    var logoImage = document.getElementById('logoImage');

    // Audio controls
    var voiceoverPlayBtn = document.getElementById('voiceoverPlayBtn');
    var voiceoverStopBtn = document.getElementById('voiceoverStopBtn');
    var voiceoverVolume = document.getElementById('voiceoverVolume');
    var musicPlayBtn = document.getElementById('musicPlayBtn');
    var musicStopBtn = document.getElementById('musicStopBtn');
    var musicVolume = document.getElementById('musicVolume');

    console.log('[UI] DOM elements:', {
      scriptSelect: !!scriptSelect,
      voiceoverSelect: !!voiceoverSelect,
      musicSelect: !!musicSelect,
      teleprompterBtn: !!teleprompterBtn,
      blurBtn: !!blurBtn
    });

    // Get scripts data
    var scriptsData = [];
    try {
      var scriptsEl = document.getElementById('scriptsData');
      if (scriptsEl) {
        scriptsData = JSON.parse(scriptsEl.textContent || '[]');
        console.log('[UI] Loaded', scriptsData.length, 'scripts');
      }
    } catch (e) {
      console.error('[UI] Failed to parse scripts data:', e);
    }

    // =====================================================
    // AUDIO TABS
    // =====================================================

    function initAudioTabs() {
      const tabBtns = document.querySelectorAll('.audio-tab-btn');
      console.log('[UI] Found', tabBtns.length, 'audio tab buttons');
      
      tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          const tabId = this.dataset.tab;
          console.log('[UI] Switching to tab:', tabId);
          
          // Update button states
          tabBtns.forEach(function(b) { b.classList.remove('active'); });
          this.classList.add('active');
          
          // Update content visibility
          document.querySelectorAll('.audio-tab-content').forEach(function(content) {
            content.classList.remove('active');
          });
          
          const targetContent = document.getElementById('audioTab-' + tabId);
          if (targetContent) {
            targetContent.classList.add('active');
            console.log('[UI] Tab content shown:', tabId);
          } else {
            console.warn('[UI] Tab content not found:', 'audioTab-' + tabId);
          }
        });
      });
      
      console.log('[UI] Audio tabs initialized');
    }
    
    // Initialize audio tabs immediately
    initAudioTabs();

    // =====================================================
    // TELEPROMPTER WITH SCRIPT VERSIONS
    // =====================================================

    var currentScriptVersion = 'original'; // 'original' | 'enhanced' | 'clean'
    var scriptVersionToggle = document.getElementById('scriptVersionToggle');
    var versionOriginalBtn = document.getElementById('versionOriginalBtn');
    var versionEnhancedBtn = document.getElementById('versionEnhancedBtn');
    var versionCleanBtn = document.getElementById('versionCleanBtn');

    function getScriptContentByVersion(script, version) {
      if (!script) return '';
      switch(version) {
        case 'enhanced':
          return script.enhancedContent || script.content || '';
        case 'clean':
          return script.cleanContent || script.content || '';
        case 'original':
        default:
          return script.originalContent || script.content || '';
      }
    }

    function updateVersionButtonStates(script) {
      if (!script) {
        if (scriptVersionToggle) scriptVersionToggle.style.display = 'none';
        return;
      }
      
      // Show toggle only if we have versions
      var hasVersions = script.enhancedContent || script.cleanContent;
      if (scriptVersionToggle) {
        scriptVersionToggle.style.display = hasVersions ? 'flex' : 'none';
      }
      
      // Update button active states
      [versionOriginalBtn, versionEnhancedBtn, versionCleanBtn].forEach(function(btn) {
        if (btn) btn.classList.remove('active');
      });
      
      if (currentScriptVersion === 'original' && versionOriginalBtn) {
        versionOriginalBtn.classList.add('active');
      } else if (currentScriptVersion === 'enhanced' && versionEnhancedBtn) {
        versionEnhancedBtn.classList.add('active');
      } else if (currentScriptVersion === 'clean' && versionCleanBtn) {
        versionCleanBtn.classList.add('active');
      }
      
      // Disable buttons if version not available
      if (versionEnhancedBtn) {
        versionEnhancedBtn.disabled = !script.enhancedContent;
        versionEnhancedBtn.style.opacity = script.enhancedContent ? '1' : '0.5';
      }
      if (versionCleanBtn) {
        versionCleanBtn.disabled = !script.cleanContent;
        versionCleanBtn.style.opacity = script.cleanContent ? '1' : '0.5';
      }
    }

    function updateTeleprompter() {
      if (!scriptSelect) return;
      
      var selectedId = scriptSelect.value;
      var script = scriptsData.find(function(s) { return s.id === selectedId; });
      
      // Update version button states
      updateVersionButtonStates(script);
      
      if (script && teleprompterEnabled) {
        var content = getScriptContentByVersion(script, currentScriptVersion);
        
        // Use word tracking if available
        if (typeof renderScriptWithWordTracking === 'function') {
          renderScriptWithWordTracking(content);
        } else if (teleprompterText) {
          teleprompterText.textContent = content;
        }
        if (teleprompter) teleprompter.classList.add('visible');
        
        // Show teleprompter controls
        if (typeof showTeleprompterControls === 'function') {
          showTeleprompterControls();
        }
      } else {
        if (teleprompter) teleprompter.classList.remove('visible');
      }
    }

    // Version toggle handlers
    if (versionOriginalBtn) {
      versionOriginalBtn.addEventListener('click', function() {
        currentScriptVersion = 'original';
        updateTeleprompter();
      });
    }
    if (versionEnhancedBtn) {
      versionEnhancedBtn.addEventListener('click', function() {
        var selectedId = scriptSelect ? scriptSelect.value : '';
        var script = scriptsData.find(function(s) { return s.id === selectedId; });
        if (script && script.enhancedContent) {
          currentScriptVersion = 'enhanced';
          updateTeleprompter();
        }
      });
    }
    if (versionCleanBtn) {
      versionCleanBtn.addEventListener('click', function() {
        var selectedId = scriptSelect ? scriptSelect.value : '';
        var script = scriptsData.find(function(s) { return s.id === selectedId; });
        if (script && script.cleanContent) {
          currentScriptVersion = 'clean';
          updateTeleprompter();
        }
      });
    }

    if (scriptSelect) {
      scriptSelect.addEventListener('change', function() {
        // Reset to original when changing scripts
        currentScriptVersion = 'original';
        updateTeleprompter();
      });
    }

    if (teleprompterBtn) {
      teleprompterBtn.addEventListener('click', function() {
        teleprompterEnabled = !teleprompterEnabled;
        
        if (teleprompterEnabled) {
          teleprompterBtn.classList.remove('toggle-off');
          teleprompterBtn.classList.add('toggle-on');
          teleprompterBtn.textContent = '📜 Teleprompter: ON';
        } else {
          teleprompterBtn.classList.remove('toggle-on');
          teleprompterBtn.classList.add('toggle-off');
          teleprompterBtn.textContent = '📜 Teleprompter: OFF';
        }
        
        updateTeleprompter();
      });
    }

    // Initialize teleprompter
    updateTeleprompter();

    // =====================================================
    // BACKGROUND BLUR
    // =====================================================

    if (blurBtn) {
      blurBtn.addEventListener('click', function() {
        // Delegate to background blur module if available
        if (typeof toggleBackgroundBlur === 'function') {
          toggleBackgroundBlur();
        } else {
          // Fallback to simple CSS blur
          blurEnabled = !blurEnabled;
          
          if (blurEnabled) {
            blurBtn.classList.remove('toggle-off');
            blurBtn.classList.add('toggle-on');
            blurBtn.textContent = '🔵 BG Blur: ON';
          } else {
            blurBtn.classList.remove('toggle-on');
            blurBtn.classList.add('toggle-off');
            blurBtn.textContent = '🔵 BG Blur: OFF';
          }
        }
      });
    }

    // =====================================================
    // LOGO OVERLAY WITH POSITION AND SIZE CONTROLS
    // =====================================================

    var currentLogoPosition = 'bottom-right';
    var currentLogoSize = 'medium';

    if (logoBtn) {
      logoBtn.addEventListener('click', function() {
        logoEnabled = !logoEnabled;
        
        if (logoEnabled) {
          logoBtn.classList.remove('toggle-off');
          logoBtn.classList.add('toggle-on');
          logoBtn.textContent = '🖼️ Logo: ON';
          if (logoOverlay) {
            logoOverlay.classList.add('visible');
            // Force z-index for screen share scenarios
            logoOverlay.style.zIndex = '9999';
          }
          
          // Show position controls
          var posControls = document.getElementById('logoPositionControls');
          if (posControls) posControls.style.display = 'flex';
        } else {
          logoBtn.classList.remove('toggle-on');
          logoBtn.classList.add('toggle-off');
          logoBtn.textContent = '🖼️ Logo: OFF';
          if (logoOverlay) logoOverlay.classList.remove('visible');
          
          // Hide position controls
          var posControls = document.getElementById('logoPositionControls');
          if (posControls) posControls.style.display = 'none';
        }
      });
    }

    // Logo position buttons
    document.querySelectorAll('[data-logo-position]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const pos = this.dataset.logoPosition;
        if (!pos || !logoOverlay) return;

        // Remove old position classes
        logoOverlay.classList.remove('pos-top-left', 'pos-top-right', 'pos-bottom-left', 'pos-bottom-right');
        // Add new position class
        logoOverlay.classList.add('pos-' + pos);
        currentLogoPosition = pos;

        // Update active state
        document.querySelectorAll('[data-logo-position]').forEach(function(b) {
          b.classList.remove('active');
        });
        this.classList.add('active');

        console.log('[Logo] Position set to:', pos);
      });
    });

    // Logo size buttons
    document.querySelectorAll('[data-logo-size]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const size = this.dataset.logoSize;
        if (!size || !logoOverlay) return;

        // Remove old size classes
        logoOverlay.classList.remove('size-small', 'size-medium', 'size-large');
        // Add new size class
        logoOverlay.classList.add('size-' + size);
        currentLogoSize = size;

        // Update active state
        document.querySelectorAll('[data-logo-size]').forEach(function(b) {
          b.classList.remove('active');
        });
        this.classList.add('active');

        console.log('[Logo] Size set to:', size);
      });
    });

    // =====================================================
    // VOICEOVER AUDIO
    // =====================================================

    function updateVoiceoverButtons() {
      if (!voiceoverSelect) return;
      var hasSelection = voiceoverSelect.value !== '';
      if (voiceoverPlayBtn) voiceoverPlayBtn.disabled = !hasSelection;
      if (voiceoverStopBtn) voiceoverStopBtn.disabled = !hasSelection;
    }

    if (voiceoverSelect) {
      voiceoverSelect.addEventListener('change', function() {
        // Stop current audio
        if (voiceoverAudio) {
          voiceoverAudio.pause();
          voiceoverAudio = null;
        }
        updateVoiceoverButtons();
      });
    }

    if (voiceoverPlayBtn) {
      voiceoverPlayBtn.addEventListener('click', function() {
        if (!voiceoverSelect) return;
        var option = voiceoverSelect.options[voiceoverSelect.selectedIndex];
        var url = option ? option.dataset.url : null;
        
        if (!url) return;

        if (voiceoverAudio) {
          voiceoverAudio.pause();
        }

        voiceoverAudio = new Audio(url);
        voiceoverAudio.volume = voiceoverVolume ? voiceoverVolume.value / 100 : 1;
        
        // Start word highlighting sync
        voiceoverAudio.addEventListener('loadedmetadata', function() {
          if (typeof startWordHighlightingFromAudio === 'function') {
            startWordHighlightingFromAudio(voiceoverAudio);
          }
          if (typeof startTeleprompterScrollSync === 'function') {
            startTeleprompterScrollSync(voiceoverAudio.duration);
          }
          // Show reading cursor
          if (typeof showReadingCursor === 'function') {
            showReadingCursor();
          }
        });
        
        voiceoverAudio.play().catch(function(e) {
          console.error('[Voiceover] Play error:', e);
        });
      });
    }

    if (voiceoverStopBtn) {
      voiceoverStopBtn.addEventListener('click', function() {
        if (voiceoverAudio) {
          voiceoverAudio.pause();
          voiceoverAudio.currentTime = 0;
        }
        // Stop word highlighting
        if (typeof stopWordHighlighting === 'function') {
          stopWordHighlighting();
        }
        if (typeof stopTeleprompterScrollSync === 'function') {
          stopTeleprompterScrollSync();
        }
        if (typeof hideReadingCursor === 'function') {
          hideReadingCursor();
        }
      });
    }

    if (voiceoverVolume) {
      voiceoverVolume.addEventListener('input', function() {
        if (voiceoverAudio) {
          voiceoverAudio.volume = this.value / 100;
        }
      });
    }

    updateVoiceoverButtons();

    // =====================================================
    // BACKGROUND MUSIC
    // =====================================================

    var musicLoopEnabled = true;

    function updateMusicButtons() {
      if (!musicSelect) return;
      var hasSelection = musicSelect.value !== '';
      if (musicPlayBtn) musicPlayBtn.disabled = !hasSelection;
      if (musicStopBtn) musicStopBtn.disabled = !hasSelection;
    }

    if (musicSelect) {
      musicSelect.addEventListener('change', function() {
        // Stop current audio
        if (musicAudio) {
          musicAudio.pause();
          musicAudio = null;
        }
        updateMusicButtons();
      });
    }

    if (musicPlayBtn) {
      musicPlayBtn.addEventListener('click', function() {
        if (!musicSelect) return;
        var option = musicSelect.options[musicSelect.selectedIndex];
        var url = option ? option.dataset.url : null;
        
        if (!url) return;

        if (musicAudio) {
          musicAudio.pause();
        }

        musicAudio = new Audio(url);
        musicAudio.volume = musicVolume ? musicVolume.value / 100 : 0.5;
        musicAudio.loop = musicLoopEnabled;
        musicAudio.play().catch(function(e) {
          console.error('[Music] Play error:', e);
        });
      });
    }

    if (musicStopBtn) {
      musicStopBtn.addEventListener('click', function() {
        if (musicAudio) {
          musicAudio.pause();
          musicAudio.currentTime = 0;
        }
      });
    }

    if (musicVolume) {
      musicVolume.addEventListener('input', function() {
        if (musicAudio) {
          musicAudio.volume = this.value / 100;
        }
      });
    }

    // Music loop toggle
    var musicLoopBtn = document.getElementById('musicLoopBtn');
    if (musicLoopBtn) {
      musicLoopBtn.addEventListener('click', function() {
        musicLoopEnabled = !musicLoopEnabled;
        this.textContent = musicLoopEnabled ? '🔁 Loop: ON' : '🔁 Loop: OFF';
        if (musicAudio) {
          musicAudio.loop = musicLoopEnabled;
        }
      });
    }

    updateMusicButtons();

    // =====================================================
    // RECORDING UI HELPERS
    // =====================================================

    function showRecordingUI() {
      console.log('[RecordingUI] Showing recording controls...');
      
      // Show pause button
      var pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) pauseBtn.style.display = 'inline-block';
      
      // Show trim controls
      var trimBar = document.getElementById('trimControlsBar');
      if (trimBar) trimBar.style.display = 'flex';
      
      // Show audio controls bar - ALWAYS show during recording
      var audioBar = document.getElementById('audioControlsBar');
      if (audioBar) {
        audioBar.style.display = 'flex';
        console.log('[RecordingUI] Audio controls bar shown');
      } else {
        console.warn('[RecordingUI] Audio controls bar element not found!');
      }
      
      // Show sync indicator if audio or TTS is available
      var hasTTS = !!window._generatedTtsUrl;
      var hasVoiceover = voiceoverSelect && voiceoverSelect.value;
      var hasMusic = musicSelect && musicSelect.value;
      
      if (hasVoiceover || hasMusic || hasTTS) {
        var syncIndicator = document.getElementById('syncActiveIndicator');
        if (syncIndicator) syncIndicator.classList.add('visible');
      }
      
      console.log('[RecordingUI] Recording UI shown');
    }

    function hideRecordingUI() {
      // Hide pause button
      const pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) pauseBtn.style.display = 'none';
      
      // Hide trim controls
      const trimBar = document.getElementById('trimControlsBar');
      if (trimBar) trimBar.style.display = 'none';
      
      // Hide audio controls bar
      const audioBar = document.getElementById('audioControlsBar');
      if (audioBar) audioBar.style.display = 'none';
      
      // Hide edit panel
      const editPanel = document.getElementById('editPanel');
      if (editPanel) editPanel.style.display = 'none';
      
      // Hide sync indicator
      const syncIndicator = document.getElementById('syncActiveIndicator');
      if (syncIndicator) syncIndicator.classList.remove('visible');
    }

    // =====================================================
    // AUDIO PLAYBACK FOR RECORDING (Simplified & Robust)
    // =====================================================

    var isStoppingAudio = false;

    // Main audio playback function - called when recording starts
    function startAudioPlayback() {
      if (isStoppingAudio) {
        console.log('[Audio] Skipping - stop in progress');
        return;
      }

      console.log('[Audio] ========== STARTING AUDIO PLAYBACK ==========');
      
      var voiceStarted = false;
      
      // Step 1: Try to play voiceover if selected
      if (voiceoverSelect && voiceoverSelect.value) {
        var option = voiceoverSelect.options[voiceoverSelect.selectedIndex];
        var url = option ? option.dataset.url : null;
        
        console.log('[Audio] Voiceover URL:', url);
        
        if (url && url.startsWith('http')) {
          voiceStarted = playVoiceAudio(url, 'voiceover');
        } else if (url) {
          console.warn('[Audio] Invalid voiceover URL (blob/data) - re-upload needed');
          showStatus('Please re-upload voiceover audio', 'error');
        }
      }
      
      // Step 2: If no voiceover, try TTS
      if (!voiceStarted && window._generatedTtsUrl) {
        console.log('[Audio] Using TTS URL:', window._generatedTtsUrl);
        voiceStarted = playVoiceAudio(window._generatedTtsUrl, 'tts');
      }
      
      // Step 3: Play music (can play alongside voice)
      if (musicSelect && musicSelect.value) {
        var musicOption = musicSelect.options[musicSelect.selectedIndex];
        var musicUrl = musicOption ? musicOption.dataset.url : null;
        
        console.log('[Audio] Music URL:', musicUrl);
        
        if (musicUrl && musicUrl.startsWith('http')) {
          playMusicAudio(musicUrl, voiceStarted);
        } else if (musicUrl) {
          console.warn('[Audio] Invalid music URL (blob/data) - re-upload needed');
        }
      }
      
      // Step 4: Show recording UI
      showRecordingUI();
      
      // Step 5: Start teleprompter scroll if enabled
      if (teleprompterEnabled && teleprompter && teleprompter.classList.contains('visible')) {
        if (typeof startTeleprompterAutoScroll === 'function') {
          startTeleprompterAutoScroll();
        }
      }
      
      console.log('[Audio] ========== AUDIO SETUP COMPLETE ==========');
    }
    
    // Helper: Play voice audio (voiceover or TTS)
    function playVoiceAudio(url, type) {
      console.log('[Audio] Playing', type, 'from:', url.substring(0, 50) + '...');
      
      // Stop existing audio
      if (voiceoverAudio) {
        voiceoverAudio.pause();
        voiceoverAudio = null;
      }
      if (ttsAudio) {
        ttsAudio.pause();
        ttsAudio = null;
      }
      
      try {
        var audio = new Audio(url);
        audio.volume = voiceoverVolume ? voiceoverVolume.value / 100 : 1;
        
        // Store reference
        if (type === 'voiceover') {
          voiceoverAudio = audio;
        } else {
          ttsAudio = audio;
        }
        
        // Setup events
        audio.addEventListener('loadedmetadata', function() {
          console.log('[Audio]', type, 'loaded, duration:', audio.duration);
          if (typeof startWordHighlightingFromAudio === 'function') {
            startWordHighlightingFromAudio(audio);
          }
          if (typeof startTeleprompterScrollSync === 'function') {
            startTeleprompterScrollSync(audio.duration);
          }
        });
        
        audio.addEventListener('play', function() {
          console.log('[Audio]', type, 'playing - applying ducking');
          applyDucking(true);
          updateVoiceButton(true);
        });
        
        audio.addEventListener('pause', function() {
          applyDucking(false);
          updateVoiceButton(false);
        });
        
        audio.addEventListener('ended', function() {
          console.log('[Audio]', type, 'ended');
          applyDucking(false);
          updateVoiceButton(false);
          if (typeof stopWordHighlighting === 'function') stopWordHighlighting();
        });
        
        audio.addEventListener('error', function(e) {
          console.error('[Audio]', type, 'error:', e);
          showStatus('Failed to load ' + type + ' audio', 'error');
        });
        
        // Play
        audio.play().then(function() {
          console.log('[Audio] ✅', type, 'playing!');
        }).catch(function(e) {
          console.error('[Audio]', type, 'play failed:', e.message);
          showStatus('Could not play ' + type + ': ' + e.message, 'error');
        });
        
        return true;
      } catch (e) {
        console.error('[Audio] Failed to create', type, 'audio:', e);
        return false;
      }
    }
    
    // Helper: Play music audio
    function playMusicAudio(url, voiceIsPlaying) {
      console.log('[Audio] Playing music from:', url.substring(0, 50) + '...');
      
      if (musicAudio) {
        musicAudio.pause();
        musicAudio = null;
      }
      
      try {
        musicAudio = new Audio(url);
        musicAudio.volume = voiceIsPlaying && duckingEnabled ? duckedMusicVolume : normalMusicVolume;
        musicAudio.loop = musicLoopEnabled;
        
        musicAudio.addEventListener('play', function() {
          updateMusicButton(true);
        });
        
        musicAudio.addEventListener('pause', function() {
          updateMusicButton(false);
        });
        
        musicAudio.addEventListener('error', function(e) {
          console.error('[Audio] Music error:', e);
          showStatus('Failed to load music', 'error');
        });
        
        musicAudio.play().then(function() {
          console.log('[Audio] ✅ Music playing!');
        }).catch(function(e) {
          console.error('[Audio] Music play failed:', e.message);
        });
        
      } catch (e) {
        console.error('[Audio] Failed to create music audio:', e);
      }
    }
    
    // UI button helpers
    function updateVoiceButton(isPlaying) {
      var btn = document.getElementById('voicePlayPauseBtn');
      if (btn) {
        btn.textContent = isPlaying ? '⏸' : '▶';
        btn.classList.toggle('playing', isPlaying);
      }
    }
    
    function updateMusicButton(isPlaying) {
      var btn = document.getElementById('musicPlayPauseBtn');
      if (btn) {
        btn.textContent = isPlaying ? '⏸' : '▶';
        btn.classList.toggle('playing', isPlaying);
      }
    }

    function stopAudioPlayback() {
      isStoppingAudio = true;  // Set flag to prevent new audio from starting
      
      if (voiceoverAudio) {
        voiceoverAudio.pause();
        voiceoverAudio.currentTime = 0;
        voiceoverAudio = null;
      }
      if (musicAudio) {
        musicAudio.pause();
        musicAudio.currentTime = 0;
        musicAudio = null;
      }
      if (ttsAudio) {
        ttsAudio.pause();
        ttsAudio.currentTime = 0;
        ttsAudio = null;
      }
      
      // Stop sync
      if (typeof stopWordHighlighting === 'function') {
        stopWordHighlighting();
      }
      if (typeof stopTeleprompterScrollSync === 'function') {
        stopTeleprompterScrollSync();
      }
      if (typeof stopTeleprompterAutoScroll === 'function') {
        stopTeleprompterAutoScroll();
      }
      if (typeof hideReadingCursor === 'function') {
        hideReadingCursor();
      }
      
      // Hide recording UI elements
      hideRecordingUI();
      
      // Reset flag after a short delay
      setTimeout(function() {
        isStoppingAudio = false;
      }, 500);
    }
    
    // Global stop all audio function (accessible from camera script)
    function stopAllAudio() {
      stopAudioPlayback();
    }

    // =====================================================
    // AUDIO DUCKING - Reduce music when voice plays
    // =====================================================

    var duckingEnabled = true;
    var normalMusicVolume = 0.3;
    var duckedMusicVolume = 0.08; // Very low when voice plays

    function initAudioDucking() {
      var duckCheckbox = document.getElementById('duckMusicCheckbox');
      if (duckCheckbox) {
        duckCheckbox.addEventListener('change', function() {
          duckingEnabled = this.checked;
          console.log('[Ducking] Enabled:', duckingEnabled);
        });
      }
    }

    function applyDucking(voicePlaying) {
      if (!musicAudio || !duckingEnabled) return;
      
      var targetVolume = voicePlaying ? duckedMusicVolume : normalMusicVolume;
      
      // Smooth transition
      var currentVolume = musicAudio.volume;
      var step = (targetVolume - currentVolume) / 10;
      var stepCount = 0;
      
      var fadeInterval = setInterval(function() {
        stepCount++;
        musicAudio.volume = Math.max(0, Math.min(1, currentVolume + (step * stepCount)));
        
        if (stepCount >= 10) {
          clearInterval(fadeInterval);
          musicAudio.volume = targetVolume;
        }
      }, 30);
      
      console.log('[Ducking] Voice playing:', voicePlaying, 'Music volume:', targetVolume);
    }

    // =====================================================
    // AUDIO BAR CONTROLS (During Recording)
    // =====================================================

    function initAudioBarControls() {
      console.log('[AudioBar] Initializing controls...');
      
      var voicePlayPauseBtn = document.getElementById('voicePlayPauseBtn');
      var voiceStopBtn = document.getElementById('voiceStopBtn');
      var voiceBarVolume = document.getElementById('voiceBarVolume');
      var musicPlayPauseBtn = document.getElementById('musicPlayPauseBtn');
      var musicBarStopBtn = document.getElementById('musicBarStopBtn');
      var musicBarVolume = document.getElementById('musicBarVolume');
      
      // Voice play/pause
      if (voicePlayPauseBtn) {
        voicePlayPauseBtn.addEventListener('click', function() {
          if (voiceoverAudio && !voiceoverAudio.paused) {
            // Pause voice
            voiceoverAudio.pause();
            this.textContent = '▶';
            this.classList.remove('playing');
            applyDucking(false);
          } else if (voiceoverAudio) {
            // Resume voice
            voiceoverAudio.play();
            this.textContent = '⏸';
            this.classList.add('playing');
            applyDucking(true);
          } else if (ttsAudio && !ttsAudio.paused) {
            ttsAudio.pause();
            this.textContent = '▶';
            this.classList.remove('playing');
            applyDucking(false);
          } else if (ttsAudio) {
            ttsAudio.play();
            this.textContent = '⏸';
            this.classList.add('playing');
            applyDucking(true);
          }
        });
      }
      
      // Voice stop
      if (voiceStopBtn) {
        voiceStopBtn.addEventListener('click', function() {
          if (voiceoverAudio) {
            voiceoverAudio.pause();
            voiceoverAudio.currentTime = 0;
          }
          if (ttsAudio) {
            ttsAudio.pause();
            ttsAudio.currentTime = 0;
          }
          if (voicePlayPauseBtn) {
            voicePlayPauseBtn.textContent = '▶';
            voicePlayPauseBtn.classList.remove('playing');
          }
          applyDucking(false);
        });
      }
      
      // Voice volume
      if (voiceBarVolume) {
        voiceBarVolume.addEventListener('input', function() {
          var vol = this.value / 100;
          if (voiceoverAudio) voiceoverAudio.volume = vol;
          if (ttsAudio) ttsAudio.volume = vol;
          if (voiceoverVolume) voiceoverVolume.value = this.value;
          if (ttsVolume) ttsVolume.value = this.value;
        });
      }
      
      // Music play/pause
      if (musicPlayPauseBtn) {
        musicPlayPauseBtn.addEventListener('click', function() {
          if (musicAudio && !musicAudio.paused) {
            musicAudio.pause();
            this.textContent = '▶';
            this.classList.remove('playing');
          } else if (musicAudio) {
            musicAudio.play();
            this.textContent = '⏸';
            this.classList.add('playing');
          }
        });
      }
      
      // Music stop
      if (musicBarStopBtn) {
        musicBarStopBtn.addEventListener('click', function() {
          if (musicAudio) {
            musicAudio.pause();
            musicAudio.currentTime = 0;
          }
          if (musicPlayPauseBtn) {
            musicPlayPauseBtn.textContent = '▶';
            musicPlayPauseBtn.classList.remove('playing');
          }
        });
      }
      
      // Music volume
      if (musicBarVolume) {
        normalMusicVolume = musicBarVolume.value / 100;
        musicBarVolume.addEventListener('input', function() {
          var vol = this.value / 100;
          normalMusicVolume = vol;
          if (musicAudio && !voiceoverAudio && !ttsAudio) {
            musicAudio.volume = vol;
          }
          if (musicVolume) musicVolume.value = this.value;
        });
      }
      
      // Initialize ducking
      initAudioDucking();
      
      console.log('[AudioBar] Controls initialized');
    }

    // Initialize audio bar controls
    setTimeout(initAudioBarControls, 500);

    // =====================================================
    // TTS FUNCTIONALITY
    // =====================================================

    const ttsTextInput = document.getElementById('ttsTextInput');
    const ttsVoiceSelect = document.getElementById('ttsVoiceSelect');
    const ttsGenerateBtn = document.getElementById('ttsGenerateBtn');
    const ttsPlayBtn = document.getElementById('ttsPlayBtn');
    const ttsStopBtn = document.getElementById('ttsStopBtn');
    const ttsVolume = document.getElementById('ttsVolume');
    const ttsStatus = document.getElementById('ttsStatus');
    const useScriptForTTS = document.getElementById('useScriptForTTS');

    let ttsAudioUrl = null;

    if (useScriptForTTS) {
      useScriptForTTS.addEventListener('click', function() {
        const content = teleprompterText ? teleprompterText.textContent : '';
        if (ttsTextInput && content) {
          ttsTextInput.value = content;
        }
      });
    }

    // =====================================================
    // FORMAT SELECT (EXPORT)
    // =====================================================

    document.querySelectorAll('.format-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.format-btn').forEach(function(b) {
          b.classList.remove('active');
        });
        this.classList.add('active');
      });
    });

    // =====================================================
    // SYNC CONTROLS INTEGRATION
    // =====================================================

    function initSyncControls() {
      const syncPlayBtn = document.getElementById('syncPlayBtn');
      const syncStopBtn = document.getElementById('syncStopBtn');
      const syncSection = document.getElementById('syncSection');

      if (syncPlayBtn) {
        syncPlayBtn.addEventListener('click', async function() {
          const scriptContent = teleprompterText ? teleprompterText.textContent : '';
          const voOption = voiceoverSelect.options[voiceoverSelect.selectedIndex];
          const voUrl = voOption ? voOption.dataset.url : null;

          if (!scriptContent || !voUrl) {
            showStatus('Select script and voiceover first', 'error');
            return;
          }

          // Initialize sync if not done
          if (typeof initSync === 'function') {
            await initSync(scriptContent, voUrl);
          }

          // Show sync section
          if (syncSection) syncSection.style.display = 'block';

          // Start synced playback
          if (typeof startSyncedPlayback === 'function') {
            startSyncedPlayback();
          }
        });
      }

      if (syncStopBtn) {
        syncStopBtn.addEventListener('click', function() {
          if (typeof stopSyncedPlayback === 'function') {
            stopSyncedPlayback();
          }
          if (syncSection) syncSection.style.display = 'none';
        });
      }
    }

    // =====================================================
    // EXPORT SCRIPT BUTTON
    // =====================================================

    function initExportControls() {
      const exportScriptBtn = document.getElementById('exportScriptBtn');
      
      if (exportScriptBtn) {
        exportScriptBtn.addEventListener('click', function() {
          const scriptContent = teleprompterText ? teleprompterText.textContent : '';
          
          if (!scriptContent) {
            showStatus('No script to export', 'error');
            return;
          }

          // Get selected script title
          const selectedOption = scriptSelect.options[scriptSelect.selectedIndex];
          const scriptTitle = selectedOption ? selectedOption.text : 'script';
          
          // Create download
          const blob = new Blob([scriptContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = scriptTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.txt';
          a.click();
          URL.revokeObjectURL(url);
          
          showStatus('Script downloaded!', 'success');
        });
      }

      const exportAudioBtn = document.getElementById('exportAudioBtn');
      
      if (exportAudioBtn) {
        exportAudioBtn.addEventListener('click', function() {
          const voOption = voiceoverSelect.options[voiceoverSelect.selectedIndex];
          const voUrl = voOption ? voOption.dataset.url : null;

          if (!voUrl) {
            showStatus('No audio to export', 'error');
            return;
          }

          // Get export options
          const normalize = document.getElementById('exportNormalize')?.checked || false;
          const fadeIn = parseFloat(document.getElementById('exportFadeIn')?.value) || 0;
          const fadeOut = parseFloat(document.getElementById('exportFadeOut')?.value) || 0;
          const format = document.querySelector('.format-btn.active')?.dataset.format || 'wav';

          // Use audioExport module if available
          if (typeof exportAudio === 'function') {
            exportAudio(voUrl, {
              normalize: normalize,
              fadeIn: fadeIn,
              fadeOut: fadeOut,
              format: format
            });
          } else {
            // Fallback: direct download
            const a = document.createElement('a');
            a.href = voUrl;
            a.download = 'audio-export.' + format;
            a.click();
          }
        });
      }
    }

    // =====================================================
    // TRIM PANEL INTEGRATION
    // =====================================================

    function initTrimPanel() {
      const trimVoiceoverBtn = document.getElementById('trimVoiceoverBtn');
      const trimPanel = document.getElementById('trimPanel');

      if (trimVoiceoverBtn && trimPanel) {
        trimVoiceoverBtn.addEventListener('click', async function() {
          const voOption = voiceoverSelect.options[voiceoverSelect.selectedIndex];
          const voUrl = voOption ? voOption.dataset.url : null;

          if (!voUrl) {
            showStatus('Select voiceover first', 'error');
            return;
          }

          // Show trim panel
          trimPanel.style.display = 'block';

          // Analyze audio and draw waveform
          if (typeof analyzeAudio === 'function') {
            const analysis = await analyzeAudio(voUrl);
            if (analysis && typeof drawWaveform === 'function') {
              drawWaveform(analysis.buffer, 'trimWaveform');
            }
            if (analysis && typeof initTrimmer === 'function') {
              initTrimmer(analysis.buffer);
            }
          }
        });
      }

      // Preview trim button
      const previewTrimBtn = document.getElementById('previewTrimBtn');
      if (previewTrimBtn) {
        previewTrimBtn.addEventListener('click', function() {
          if (typeof previewTrimmedAudio === 'function') {
            previewTrimmedAudio();
          }
        });
      }

      // Apply trim button
      const applyTrimBtn = document.getElementById('applyTrimBtn');
      if (applyTrimBtn) {
        applyTrimBtn.addEventListener('click', function() {
          if (typeof applyTrim === 'function') {
            applyTrim();
            showStatus('Trim applied!', 'success');
            if (trimPanel) trimPanel.style.display = 'none';
          }
        });
      }
    }

    // =====================================================
    // TRANSCRIBE INTEGRATION
    // =====================================================

    function initTranscribe() {
      const transcribeBtn = document.getElementById('transcribeBtn');
      
      if (transcribeBtn) {
        transcribeBtn.addEventListener('click', async function() {
          const voOption = voiceoverSelect.options[voiceoverSelect.selectedIndex];
          const voUrl = voOption ? voOption.dataset.url : null;

          if (!voUrl) {
            showStatus('Select voiceover first', 'error');
            return;
          }

          if (typeof transcribeAudio === 'function') {
            transcribeBtn.disabled = true;
            transcribeBtn.textContent = '⏳ Transcribing...';
            
            try {
              const result = await transcribeAudio(voUrl);
              if (result) {
                const resultEl = document.getElementById('transcriptionResult');
                if (resultEl) {
                  resultEl.textContent = result;
                  resultEl.style.display = 'block';
                }
              }
            } catch (e) {
              showStatus('Transcription failed: ' + e.message, 'error');
            }
            
            transcribeBtn.disabled = false;
            transcribeBtn.textContent = '🎤 Transcribe';
          }
        });
      }
    }

    // =====================================================
    // STUDIO SOUND PANEL
    // =====================================================

    function initStudioSound() {
      const toggle = document.getElementById('studioSoundToggle');
      const label = document.getElementById('studioSoundLabel');
      const options = document.getElementById('studioSoundOptions');
      const presetSelect = document.getElementById('audioPresetSelect');

      let studioSoundEnabled = false;

      // Preset configurations
      const presets = {
        podcast: { compressor: false, eq: true, noiseGate: true, limiter: false },
        interview: { compressor: true, eq: true, noiseGate: false, limiter: false },
        narration: { compressor: true, eq: true, noiseGate: true, limiter: true },
        webcast: { compressor: false, eq: true, noiseGate: true, limiter: true }
      };

      if (toggle) {
        toggle.addEventListener('click', function() {
          studioSoundEnabled = !studioSoundEnabled;

          if (studioSoundEnabled) {
            toggle.classList.add('on');
            if (label) {
              label.textContent = 'ON';
              label.classList.add('on');
            }
            if (options) options.style.display = 'block';
            console.log('[StudioSound] Enabled');
          } else {
            toggle.classList.remove('on');
            if (label) {
              label.textContent = 'OFF';
              label.classList.remove('on');
            }
            if (options) options.style.display = 'none';
            console.log('[StudioSound] Disabled');
          }
        });
      }

      // Apply preset
      if (presetSelect) {
        presetSelect.addEventListener('change', function() {
          const preset = presets[this.value];
          if (preset) {
            // Update effect toggles based on preset
            updateEffectToggle('compressorToggle', preset.compressor);
            updateEffectToggle('eqToggle', preset.eq);
            updateEffectToggle('noiseGateToggle', preset.noiseGate);
            updateEffectToggle('limiterToggle', preset.limiter);
            console.log('[StudioSound] Applied preset:', this.value, preset);
          }
        });
      }

      // Effect toggle clicks
      ['compressorToggle', 'eqToggle', 'noiseGateToggle', 'limiterToggle'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('click', function() {
            this.classList.toggle('on');
            console.log('[StudioSound] Toggled:', id, this.classList.contains('on'));
          });
        }
      });

      function updateEffectToggle(id, enabled) {
        const el = document.getElementById(id);
        if (el) {
          if (enabled) {
            el.classList.add('on');
          } else {
            el.classList.remove('on');
          }
        }
      }

      console.log('[StudioSound] Panel initialized');
    }

    // Initialize all integrations
    initAudioTabs();
    initSyncControls();
    initExportControls();
    initTrimPanel();
    initTranscribe();
    initStudioSound();

    console.log('[UI] Module initialized with complete integrations');
  `;
}
