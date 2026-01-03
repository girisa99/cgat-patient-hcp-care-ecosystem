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
      // Show pause button
      var pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) pauseBtn.style.display = 'inline-block';
      
      // Show trim controls
      var trimBar = document.getElementById('trimControlsBar');
      if (trimBar) trimBar.style.display = 'flex';
      
      // Show sync indicator if audio selected
      if ((voiceoverSelect && voiceoverSelect.value) || (musicSelect && musicSelect.value)) {
        var syncIndicator = document.getElementById('syncActiveIndicator');
        if (syncIndicator) syncIndicator.classList.add('visible');
      }
    }

    function hideRecordingUI() {
      // Hide pause button
      const pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) pauseBtn.style.display = 'none';
      
      // Hide trim controls
      const trimBar = document.getElementById('trimControlsBar');
      if (trimBar) trimBar.style.display = 'none';
      
      // Hide edit panel
      const editPanel = document.getElementById('editPanel');
      if (editPanel) editPanel.style.display = 'none';
      
      // Hide sync indicator
      const syncIndicator = document.getElementById('syncActiveIndicator');
      if (syncIndicator) syncIndicator.classList.remove('visible');
    }

    // =====================================================
    // AUDIO PLAYBACK FOR RECORDING (with overlap prevention)
    // =====================================================

    let isStoppingAudio = false;  // Flag to prevent starting audio during stop

    // These functions are called by the camera module during recording
    function startAudioPlayback() {
      // Don't start audio if we're in the process of stopping
      if (isStoppingAudio) {
        console.log('[UI] Skipping audio start - stop in progress');
        return;
      }

      console.log('[Recording Audio] Starting audio playback...');
      console.log('[Recording Audio] voiceoverSelect:', !!voiceoverSelect, voiceoverSelect ? voiceoverSelect.value : 'N/A');
      console.log('[Recording Audio] musicSelect:', !!musicSelect, musicSelect ? musicSelect.value : 'N/A');

      // Stop any existing TTS to prevent overlap
      if (ttsAudio) {
        ttsAudio.pause();
        ttsAudio.currentTime = 0;
        ttsAudio = null;
      }

      // Start voiceover if selected (mutually exclusive with TTS)
      if (voiceoverSelect) {
        const voOption = voiceoverSelect.options[voiceoverSelect.selectedIndex];
        const voUrl = voOption ? voOption.dataset.url : null;
        
        console.log('[Recording Audio] Voiceover option:', voOption ? voOption.text : 'none');
        console.log('[Recording Audio] Voiceover URL:', voUrl);
        
        if (voUrl && voiceoverSelect.value) {
          // Stop any existing voiceover
          if (voiceoverAudio) {
            voiceoverAudio.pause();
            voiceoverAudio.currentTime = 0;
          }
          
          console.log('[Recording Audio] Creating new voiceover audio element...');
          voiceoverAudio = new Audio(voUrl);
          voiceoverAudio.volume = voiceoverVolume ? voiceoverVolume.value / 100 : 1;
          
          // Setup sync with teleprompter
          voiceoverAudio.addEventListener('loadedmetadata', function() {
            console.log('[Recording Audio] Voiceover metadata loaded, duration:', voiceoverAudio.duration);
            if (typeof startWordHighlightingFromAudio === 'function') {
              startWordHighlightingFromAudio(voiceoverAudio);
            }
            if (typeof startTeleprompterScrollSync === 'function') {
              startTeleprompterScrollSync(voiceoverAudio.duration);
            }
            if (typeof showReadingCursor === 'function') {
              showReadingCursor();
            }
          });

          voiceoverAudio.addEventListener('ended', function() {
            console.log('[Recording Audio] Voiceover finished playing');
            if (typeof stopWordHighlighting === 'function') {
              stopWordHighlighting();
            }
            if (typeof hideReadingCursor === 'function') {
              hideReadingCursor();
            }
          });

          voiceoverAudio.addEventListener('error', function(e) {
            console.error('[Recording Audio] Voiceover error:', e);
            showStatus('Failed to load voiceover audio', 'error');
          });
          
          voiceoverAudio.play().then(function() {
            console.log('[Recording Audio] Voiceover started playing!');
          }).catch(function(e) {
            console.error('[Recording Audio] Voiceover play error:', e);
            showStatus('Could not play voiceover: ' + e.message, 'error');
          });
        } else {
          console.log('[Recording Audio] No voiceover selected or no URL');
        }
      }

      // Start music if selected (can play alongside voiceover)
      if (musicSelect) {
        const musicOption = musicSelect.options[musicSelect.selectedIndex];
        const musicUrl = musicOption ? musicOption.dataset.url : null;
        
        console.log('[Recording Audio] Music option:', musicOption ? musicOption.text : 'none');
        console.log('[Recording Audio] Music URL:', musicUrl);
        
        if (musicUrl && musicSelect.value) {
          // Stop any existing music
          if (musicAudio) {
            musicAudio.pause();
            musicAudio.currentTime = 0;
          }
          
          console.log('[Recording Audio] Creating new music audio element...');
          musicAudio = new Audio(musicUrl);
          musicAudio.volume = musicVolume ? musicVolume.value / 100 : 0.5;
          musicAudio.loop = musicLoopEnabled;

          musicAudio.addEventListener('error', function(e) {
            console.error('[Recording Audio] Music error:', e);
            showStatus('Failed to load music', 'error');
          });

          musicAudio.play().then(function() {
            console.log('[Recording Audio] Music started playing!');
          }).catch(function(e) {
            console.error('[Recording Audio] Music play error:', e);
          });
        } else {
          console.log('[Recording Audio] No music selected or no URL');
        }
      }
      
      // Show recording UI elements
      showRecordingUI();
      console.log('[Recording Audio] Audio playback setup complete');
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
