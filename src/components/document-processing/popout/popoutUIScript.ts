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
    // AUDIO PLAYBACK FOR RECORDING (COMPLETELY REWRITTEN)
    // =====================================================

    // Pre-loaded audio elements - create them ONCE and reuse
    var preloadedVoice = null;
    var preloadedMusic = null;
    var audioIsActive = false;

    // Helper: Check if URL is valid for audio playback
    function isValidAudioUrl(url) {
      if (!url) return false;
      // Accept http(s) URLs and data: URLs (for TTS base64)
      return url.startsWith('http') || url.startsWith('data:audio');
    }

    // Pre-load audio when selections change (not during recording)
    function preloadAudioAssets() {
      console.log('[Audio] Pre-loading audio assets...');
      
      // Pre-load voiceover
      if (voiceoverSelect && voiceoverSelect.value) {
        var option = voiceoverSelect.options[voiceoverSelect.selectedIndex];
        var url = option ? option.dataset.url : null;
        if (isValidAudioUrl(url)) {
          console.log('[Audio] Pre-loading voiceover:', url.substring(0, 60));
          preloadedVoice = new Audio(url);
          preloadedVoice.preload = 'auto';
          preloadedVoice.load();
        }
      } else if (isValidAudioUrl(window._generatedTtsUrl)) {
        // Pre-load TTS (data: URL is valid)
        console.log('[Audio] Pre-loading TTS:', window._generatedTtsUrl.substring(0, 60));
        preloadedVoice = new Audio(window._generatedTtsUrl);
        preloadedVoice.preload = 'auto';
        preloadedVoice.load();
      }
      
      // Pre-load music
      if (musicSelect && musicSelect.value) {
        var mOption = musicSelect.options[musicSelect.selectedIndex];
        var mUrl = mOption ? mOption.dataset.url : null;
        if (isValidAudioUrl(mUrl)) {
          console.log('[Audio] Pre-loading music:', mUrl.substring(0, 60));
          preloadedMusic = new Audio(mUrl);
          preloadedMusic.preload = 'auto';
          preloadedMusic.loop = true;
          preloadedMusic.load();
        }
      }
    }

    // Call preload on selection changes
    if (voiceoverSelect) {
      voiceoverSelect.addEventListener('change', function() {
        preloadedVoice = null;
        preloadAudioAssets();
      });
    }
    if (musicSelect) {
      musicSelect.addEventListener('change', function() {
        preloadedMusic = null;
        preloadAudioAssets();
      });
    }
    
    // Preload TTS when it's generated (set via window._generatedTtsUrl)
    // Check every 2 seconds for new TTS URL
    setInterval(function() {
      if (window._generatedTtsUrl && !preloadedVoice && !voiceoverSelect.value) {
        console.log('[Audio] New TTS detected, preloading...');
        preloadAudioAssets();
      }
    }, 2000);
    
    // Initial preload after a delay
    setTimeout(preloadAudioAssets, 2000);

    // Main audio playback function - called when recording starts
    function startAudioPlayback() {
      if (audioIsActive) {
        console.log('[Audio] Already active, skipping');
        return;
      }
      
      audioIsActive = true;
      console.log('[Audio] ========== STARTING PLAYBACK ==========');
      
      var voicePlaying = false;
      
      // STEP 0: Initialize teleprompter word tracking BEFORE audio plays
      // This ensures the cursor is ready when audio starts
      if (teleprompterEnabled && teleprompter && typeof renderScriptWithWordTracking === 'function') {
        console.log('[Audio] Pre-initializing teleprompter word tracking...');
        var selectedId = scriptSelect ? scriptSelect.value : '';
        var script = scriptsData.find(function(s) { return s.id === selectedId; });
        if (script) {
          var content = getScriptContentByVersion(script, currentScriptVersion);
          renderScriptWithWordTracking(content);
          console.log('[Audio] Teleprompter words initialized');
        }
      }
      
      // STEP 1: Play voice (voiceover or TTS)
      if (preloadedVoice && preloadedVoice.src) {
        console.log('[Audio] Using preloaded voice');
        voiceoverAudio = preloadedVoice;
        voiceoverAudio.volume = voiceoverVolume ? voiceoverVolume.value / 100 : 1;
        voiceoverAudio.currentTime = 0;
        
        // Setup events before playing
        voiceoverAudio.onplay = function() {
          console.log('[Audio] Voice started - triggering teleprompter sync NOW');
          applyDucking(true);
          updateVoiceButton(true);
          // Start teleprompter sync IMMEDIATELY when audio plays
          startTeleprompterSyncImmediate(voiceoverAudio);
        };
        voiceoverAudio.onpause = function() {
          applyDucking(false);
          updateVoiceButton(false);
        };
        voiceoverAudio.onended = function() {
          console.log('[Audio] Voice ended');
          applyDucking(false);
          updateVoiceButton(false);
        };
        voiceoverAudio.onerror = function(e) {
          console.error('[Audio] Voice error:', e);
        };
        
        voiceoverAudio.play()
          .then(function() { 
            voicePlaying = true;
            console.log('[Audio] ✅ Voice playing'); 
          })
          .catch(function(e) { 
            console.error('[Audio] Voice play error:', e.name, e.message);
            voicePlaying = false;
          });
      } else {
        console.log('[Audio] No preloaded voice, trying direct URL...');
        
        // Fallback: try to get URL directly
        var voiceUrl = getVoiceUrl();
        if (voiceUrl) {
          console.log('[Audio] Creating voice from URL:', voiceUrl.substring(0, 60));
          voiceoverAudio = new Audio(voiceUrl);
          voiceoverAudio.volume = voiceoverVolume ? voiceoverVolume.value / 100 : 1;
          
          voiceoverAudio.onplay = function() { 
            console.log('[Audio] Voice started (direct URL) - triggering teleprompter sync NOW');
            applyDucking(true); 
            updateVoiceButton(true); 
            startTeleprompterSyncImmediate(voiceoverAudio);
          };
          voiceoverAudio.onpause = function() { applyDucking(false); updateVoiceButton(false); };
          voiceoverAudio.onended = function() { applyDucking(false); updateVoiceButton(false); };
          
          voiceoverAudio.play()
            .then(function() { 
              voicePlaying = true;
              console.log('[Audio] ✅ Voice playing from direct URL'); 
            })
            .catch(function(e) { 
              console.error('[Audio] Voice play error:', e.name, e.message);
            });
        }
      }
      
      // STEP 2: Play music
      if (preloadedMusic && preloadedMusic.src) {
        console.log('[Audio] Using preloaded music');
        musicAudio = preloadedMusic;
        musicAudio.volume = duckingEnabled ? duckedMusicVolume : normalMusicVolume;
        musicAudio.loop = musicLoopEnabled;
        musicAudio.currentTime = 0;
        
        musicAudio.onplay = function() { updateMusicButton(true); };
        musicAudio.onpause = function() { updateMusicButton(false); };
        
        musicAudio.play()
          .then(function() { console.log('[Audio] ✅ Music playing'); })
          .catch(function(e) { console.error('[Audio] Music play error:', e.message); });
      } else {
        // Fallback
        var musicUrl = getMusicUrl();
        if (musicUrl) {
          console.log('[Audio] Creating music from URL:', musicUrl.substring(0, 60));
          musicAudio = new Audio(musicUrl);
          musicAudio.volume = duckingEnabled ? duckedMusicVolume : normalMusicVolume;
          musicAudio.loop = musicLoopEnabled;
          
          musicAudio.onplay = function() { updateMusicButton(true); };
          musicAudio.onpause = function() { updateMusicButton(false); };
          
          musicAudio.play()
            .then(function() { console.log('[Audio] ✅ Music playing'); })
            .catch(function(e) { console.error('[Audio] Music play error:', e.message); });
        }
      }
      
      // STEP 3: Show UI
      showRecordingUI();
      
      // STEP 4: Auto-scroll teleprompter if no voice audio
      if (!voicePlaying && teleprompterEnabled && teleprompter && teleprompter.classList.contains('visible')) {
        if (typeof startTeleprompterAutoScroll === 'function') {
          startTeleprompterAutoScroll();
        }
      }
      
      console.log('[Audio] ========== SETUP COMPLETE ==========');
    }
    
    // Helper to get voice URL
    function getVoiceUrl() {
      // First check voiceover select
      if (voiceoverSelect && voiceoverSelect.value) {
        var option = voiceoverSelect.options[voiceoverSelect.selectedIndex];
        var url = option ? option.dataset.url : null;
        if (isValidAudioUrl(url)) return url;
      }
      // Then check TTS (data: URLs are valid!)
      if (isValidAudioUrl(window._generatedTtsUrl)) {
        return window._generatedTtsUrl;
      }
      return null;
    }
    
    // Helper to get music URL
    function getMusicUrl() {
      if (musicSelect && musicSelect.value) {
        var option = musicSelect.options[musicSelect.selectedIndex];
        var url = option ? option.dataset.url : null;
        if (isValidAudioUrl(url)) return url;
      }
      return null;
    }
    
    // Teleprompter sync helper - called when metadata is loaded
    function startTeleprompterSync(audio) {
      if (!audio || !audio.duration) return;
      console.log('[Audio] Starting teleprompter sync, duration:', audio.duration);
      
      if (typeof startWordHighlightingFromAudio === 'function') {
        startWordHighlightingFromAudio(audio);
      }
      if (typeof startTeleprompterScrollSync === 'function') {
        startTeleprompterScrollSync(audio.duration);
      }
    }
    
    // IMMEDIATE teleprompter sync - called when audio actually starts playing
    // This ensures sync starts RIGHT AWAY, not waiting for metadata
    function startTeleprompterSyncImmediate(audio) {
      if (!audio) return;
      
      console.log('[Audio] IMMEDIATE teleprompter sync triggered');
      console.log('[Audio] Audio duration:', audio.duration, 'readyState:', audio.readyState);
      
      // If duration is available, start immediately
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        console.log('[Audio] Duration available, starting sync NOW');
        if (typeof startWordHighlightingFromAudio === 'function') {
          startWordHighlightingFromAudio(audio);
        }
        if (typeof startTeleprompterScrollSync === 'function') {
          startTeleprompterScrollSync(audio.duration);
        }
        if (typeof showReadingCursor === 'function') {
          showReadingCursor();
        }
      } else {
        // Poll for duration with short interval - don't wait for loadedmetadata event
        console.log('[Audio] Duration not ready, polling...');
        var pollCount = 0;
        var pollInterval = setInterval(function() {
          pollCount++;
          if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
            console.log('[Audio] Duration available after', pollCount * 50, 'ms:', audio.duration);
            clearInterval(pollInterval);
            if (typeof startWordHighlightingFromAudio === 'function') {
              startWordHighlightingFromAudio(audio);
            }
            if (typeof startTeleprompterScrollSync === 'function') {
              startTeleprompterScrollSync(audio.duration);
            }
            if (typeof showReadingCursor === 'function') {
              showReadingCursor();
            }
          } else if (pollCount > 100) { // 5 second timeout
            console.warn('[Audio] Timeout waiting for audio duration');
            clearInterval(pollInterval);
            // Fallback: use estimated duration based on script length
            if (typeof scriptWords !== 'undefined' && scriptWords.length > 0) {
              var estimatedDuration = scriptWords.length / 2.5; // ~2.5 words per second
              console.log('[Audio] Using estimated duration:', estimatedDuration, 's');
              if (typeof startTeleprompterScrollSync === 'function') {
                startTeleprompterScrollSync(estimatedDuration);
              }
            }
          }
        }, 50);
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
      console.log('[Audio] Stopping all playback');
      audioIsActive = false;
      
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
      
      // Stop sync
      if (typeof stopWordHighlighting === 'function') stopWordHighlighting();
      if (typeof stopTeleprompterScrollSync === 'function') stopTeleprompterScrollSync();
      if (typeof stopTeleprompterAutoScroll === 'function') stopTeleprompterAutoScroll();
      if (typeof hideReadingCursor === 'function') hideReadingCursor();
      
      hideRecordingUI();
    }
    
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
    // AUDIO BAR CONTROLS (During Recording) - Enhanced Mixer
    // Independent control for Voice/TTS and Music
    // =====================================================

    function initAudioBarControls() {
      console.log('[AudioBar] Initializing enhanced audio mixer controls...');
      
      var voicePlayPauseBtn = document.getElementById('voicePlayPauseBtn');
      var voiceStopBtn = document.getElementById('voiceStopBtn');
      var voiceBarVolume = document.getElementById('voiceBarVolume');
      var voiceVolumeLabel = document.getElementById('voiceVolumeLabel');
      var voiceStatus = document.getElementById('voiceStatus');
      var voiceTrack = document.getElementById('voiceTrack');
      
      var musicPlayPauseBtn = document.getElementById('musicPlayPauseBtn');
      var musicBarStopBtn = document.getElementById('musicBarStopBtn');
      var musicBarVolume = document.getElementById('musicBarVolume');
      var musicVolumeLabel = document.getElementById('musicVolumeLabel');
      var musicStatus = document.getElementById('musicStatus');
      var musicTrack = document.getElementById('musicTrack');
      
      var loopMusicCheckbox = document.getElementById('loopMusicCheckbox');
      
      // Helper to update voice status
      function updateVoiceStatus(status) {
        if (voiceStatus) {
          voiceStatus.textContent = status;
          voiceStatus.className = 'audio-status ' + status.toLowerCase();
        }
        if (voiceTrack) {
          voiceTrack.classList.remove('playing', 'paused', 'stopped');
          if (status === 'Playing') voiceTrack.classList.add('playing');
          else if (status === 'Paused') voiceTrack.classList.add('paused');
          else if (status === 'Stopped') voiceTrack.classList.add('stopped');
        }
      }
      
      // Helper to update music status
      function updateMusicStatus(status) {
        if (musicStatus) {
          musicStatus.textContent = status;
          musicStatus.className = 'audio-status ' + status.toLowerCase();
        }
        if (musicTrack) {
          musicTrack.classList.remove('playing', 'paused', 'stopped');
          if (status === 'Playing') musicTrack.classList.add('playing');
          else if (status === 'Paused') musicTrack.classList.add('paused');
          else if (status === 'Stopped') musicTrack.classList.add('stopped');
        }
      }
      
      // Voice/TTS play/pause - independent of music and recording
      if (voicePlayPauseBtn) {
        voicePlayPauseBtn.addEventListener('click', function() {
          var activeVoice = voiceoverAudio || ttsAudio;
          
          if (activeVoice && !activeVoice.paused) {
            // Pause voice - music and recording continue
            activeVoice.pause();
            this.textContent = '▶';
            this.classList.remove('playing');
            applyDucking(false);
            updateVoiceStatus('Paused');
            console.log('[AudioBar] Voice PAUSED - recording continues');
          } else if (activeVoice) {
            // Resume voice
            activeVoice.play();
            this.textContent = '⏸';
            this.classList.add('playing');
            applyDucking(true);
            updateVoiceStatus('Playing');
            console.log('[AudioBar] Voice RESUMED');
          } else {
            console.log('[AudioBar] No voice audio loaded');
          }
        });
      }
      
      // Voice stop - completely stop voice, music and recording continue
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
          updateVoiceStatus('Stopped');
          
          // Stop teleprompter sync when voice stops
          if (typeof stopWordHighlighting === 'function') stopWordHighlighting();
          if (typeof stopTeleprompterScrollSync === 'function') stopTeleprompterScrollSync();
          
          console.log('[AudioBar] Voice STOPPED - recording and music continue');
        });
      }
      
      // Voice volume with label update
      if (voiceBarVolume) {
        voiceBarVolume.addEventListener('input', function() {
          var vol = this.value / 100;
          if (voiceoverAudio) voiceoverAudio.volume = vol;
          if (ttsAudio) ttsAudio.volume = vol;
          if (voiceoverVolume) voiceoverVolume.value = this.value;
          if (ttsVolume) ttsVolume.value = this.value;
          if (voiceVolumeLabel) voiceVolumeLabel.textContent = this.value + '%';
        });
      }
      
      // Music play/pause - independent of voice and recording
      if (musicPlayPauseBtn) {
        musicPlayPauseBtn.addEventListener('click', function() {
          if (musicAudio && !musicAudio.paused) {
            // Pause music - voice and recording continue
            musicAudio.pause();
            this.textContent = '▶';
            this.classList.remove('playing');
            updateMusicStatus('Paused');
            console.log('[AudioBar] Music PAUSED - recording continues');
          } else if (musicAudio) {
            // Resume music
            musicAudio.play();
            this.textContent = '⏸';
            this.classList.add('playing');
            updateMusicStatus('Playing');
            console.log('[AudioBar] Music RESUMED');
          } else {
            console.log('[AudioBar] No music audio loaded');
          }
        });
      }
      
      // Music stop - completely stop music, voice and recording continue
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
          updateMusicStatus('Stopped');
          console.log('[AudioBar] Music STOPPED - recording and voice continue');
        });
      }
      
      // Music volume with label update
      if (musicBarVolume) {
        normalMusicVolume = musicBarVolume.value / 100;
        musicBarVolume.addEventListener('input', function() {
          var vol = this.value / 100;
          normalMusicVolume = vol;
          
          // Check if voice is playing for ducking
          var voicePlaying = (voiceoverAudio && !voiceoverAudio.paused) || (ttsAudio && !ttsAudio.paused);
          if (musicAudio && !voicePlaying) {
            musicAudio.volume = vol;
          }
          if (musicVolume) musicVolume.value = this.value;
          if (musicVolumeLabel) musicVolumeLabel.textContent = this.value + '%';
        });
      }
      
      // Music loop toggle
      if (loopMusicCheckbox) {
        loopMusicCheckbox.addEventListener('change', function() {
          musicLoopEnabled = this.checked;
          if (musicAudio) {
            musicAudio.loop = this.checked;
          }
          console.log('[AudioBar] Music loop:', this.checked ? 'ON' : 'OFF');
        });
      }
      
      // Initialize ducking
      initAudioDucking();
      
      console.log('[AudioBar] Enhanced mixer controls initialized');
      console.log('[AudioBar] - Voice/TTS: Independent play/pause/stop');
      console.log('[AudioBar] - Music: Independent play/pause/stop');
      console.log('[AudioBar] - Recording continues regardless of audio state');
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
