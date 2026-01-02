/**
 * Popout Recording Studio - UI Interaction Logic
 * Handles selectors, audio playback, toggles, and teleprompter
 */

export function getUIScript(): string {
  return `
    // =====================================================
    // UI INTERACTION MODULE
    // =====================================================

    // Audio elements
    let voiceoverAudio = null;
    let musicAudio = null;
    let ttsAudio = null;

    // UI State
    let teleprompterEnabled = true;
    let blurEnabled = false;
    let logoEnabled = false;

    // DOM Elements - UI
    const scriptSelect = document.getElementById('scriptSelect');
    const voiceoverSelect = document.getElementById('voiceoverSelect');
    const musicSelect = document.getElementById('musicSelect');
    const teleprompter = document.getElementById('teleprompter');
    const teleprompterText = document.getElementById('teleprompterText');
    const teleprompterBtn = document.getElementById('teleprompterBtn');
    const blurBtn = document.getElementById('blurBtn');
    const logoBtn = document.getElementById('logoBtn');
    const logoOverlay = document.getElementById('logoOverlay');
    const logoImage = document.getElementById('logoImage');

    // Audio controls
    const voiceoverPlayBtn = document.getElementById('voiceoverPlayBtn');
    const voiceoverStopBtn = document.getElementById('voiceoverStopBtn');
    const voiceoverVolume = document.getElementById('voiceoverVolume');
    const musicPlayBtn = document.getElementById('musicPlayBtn');
    const musicStopBtn = document.getElementById('musicStopBtn');
    const musicVolume = document.getElementById('musicVolume');

    // Get scripts data
    let scriptsData = [];
    try {
      const scriptsEl = document.getElementById('scriptsData');
      if (scriptsEl) {
        scriptsData = JSON.parse(scriptsEl.textContent || '[]');
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
    // TELEPROMPTER
    // =====================================================

    function updateTeleprompter() {
      const selectedId = scriptSelect.value;
      const script = scriptsData.find(function(s) { return s.id === selectedId; });
      
      if (script && teleprompterEnabled) {
        // Use word tracking if available
        if (typeof renderScriptWithWordTracking === 'function') {
          renderScriptWithWordTracking(script.content || '');
        } else {
          teleprompterText.textContent = script.content || '';
        }
        teleprompter.classList.add('visible');
        
        // Show teleprompter controls
        if (typeof showTeleprompterControls === 'function') {
          showTeleprompterControls();
        }
      } else {
        teleprompter.classList.remove('visible');
      }
    }

    scriptSelect.addEventListener('change', updateTeleprompter);

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

    // Initialize teleprompter
    updateTeleprompter();

    // =====================================================
    // BACKGROUND BLUR
    // =====================================================

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

    // =====================================================
    // LOGO OVERLAY
    // =====================================================

    logoBtn.addEventListener('click', function() {
      logoEnabled = !logoEnabled;
      
      if (logoEnabled) {
        logoBtn.classList.remove('toggle-off');
        logoBtn.classList.add('toggle-on');
        logoBtn.textContent = '🖼️ Logo: ON';
        logoOverlay.classList.add('visible');
        
        // Show position controls
        const posControls = document.getElementById('logoPositionControls');
        if (posControls) posControls.style.display = 'flex';
      } else {
        logoBtn.classList.remove('toggle-on');
        logoBtn.classList.add('toggle-off');
        logoBtn.textContent = '🖼️ Logo: OFF';
        logoOverlay.classList.remove('visible');
        
        // Hide position controls
        const posControls = document.getElementById('logoPositionControls');
        if (posControls) posControls.style.display = 'none';
      }
    });

    // =====================================================
    // VOICEOVER AUDIO
    // =====================================================

    function updateVoiceoverButtons() {
      const hasSelection = voiceoverSelect.value !== '';
      voiceoverPlayBtn.disabled = !hasSelection;
      voiceoverStopBtn.disabled = !hasSelection;
    }

    voiceoverSelect.addEventListener('change', function() {
      // Stop current audio
      if (voiceoverAudio) {
        voiceoverAudio.pause();
        voiceoverAudio = null;
      }
      updateVoiceoverButtons();
    });

    voiceoverPlayBtn.addEventListener('click', function() {
      const option = voiceoverSelect.options[voiceoverSelect.selectedIndex];
      const url = option ? option.dataset.url : null;
      
      if (!url) return;

      if (voiceoverAudio) {
        voiceoverAudio.pause();
      }

      voiceoverAudio = new Audio(url);
      voiceoverAudio.volume = voiceoverVolume.value / 100;
      
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

    voiceoverVolume.addEventListener('input', function() {
      if (voiceoverAudio) {
        voiceoverAudio.volume = this.value / 100;
      }
    });

    updateVoiceoverButtons();

    // =====================================================
    // BACKGROUND MUSIC
    // =====================================================

    let musicLoopEnabled = true;

    function updateMusicButtons() {
      const hasSelection = musicSelect.value !== '';
      musicPlayBtn.disabled = !hasSelection;
      musicStopBtn.disabled = !hasSelection;
    }

    musicSelect.addEventListener('change', function() {
      // Stop current audio
      if (musicAudio) {
        musicAudio.pause();
        musicAudio = null;
      }
      updateMusicButtons();
    });

    musicPlayBtn.addEventListener('click', function() {
      const option = musicSelect.options[musicSelect.selectedIndex];
      const url = option ? option.dataset.url : null;
      
      if (!url) return;

      if (musicAudio) {
        musicAudio.pause();
      }

      musicAudio = new Audio(url);
      musicAudio.volume = musicVolume.value / 100;
      musicAudio.loop = musicLoopEnabled;
      musicAudio.play().catch(function(e) {
        console.error('[Music] Play error:', e);
      });
    });

    musicStopBtn.addEventListener('click', function() {
      if (musicAudio) {
        musicAudio.pause();
        musicAudio.currentTime = 0;
      }
    });

    musicVolume.addEventListener('input', function() {
      if (musicAudio) {
        musicAudio.volume = this.value / 100;
      }
    });

    // Music loop toggle
    const musicLoopBtn = document.getElementById('musicLoopBtn');
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
      const pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) pauseBtn.style.display = 'inline-block';
      
      // Show trim controls
      const trimBar = document.getElementById('trimControlsBar');
      if (trimBar) trimBar.style.display = 'flex';
      
      // Show sync indicator if audio selected
      if (voiceoverSelect.value || musicSelect.value) {
        const syncIndicator = document.getElementById('syncActiveIndicator');
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

      // Stop any existing TTS to prevent overlap
      if (ttsAudio) {
        ttsAudio.pause();
        ttsAudio.currentTime = 0;
        ttsAudio = null;
      }

      // Start voiceover if selected (mutually exclusive with TTS)
      const voOption = voiceoverSelect.options[voiceoverSelect.selectedIndex];
      const voUrl = voOption ? voOption.dataset.url : null;
      
      if (voUrl && voiceoverSelect.value) {
        // Stop any existing voiceover
        if (voiceoverAudio) {
          voiceoverAudio.pause();
          voiceoverAudio.currentTime = 0;
        }
        
        voiceoverAudio = new Audio(voUrl);
        voiceoverAudio.volume = voiceoverVolume.value / 100;
        
        // Setup sync
        voiceoverAudio.addEventListener('loadedmetadata', function() {
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
        
        voiceoverAudio.play().catch(function(e) {
          console.error('[Recording] Voiceover play error:', e);
        });
      }

      // Start music if selected (can play alongside voiceover)
      const musicOption = musicSelect.options[musicSelect.selectedIndex];
      const musicUrl = musicOption ? musicOption.dataset.url : null;
      
      if (musicUrl && musicSelect.value) {
        // Stop any existing music
        if (musicAudio) {
          musicAudio.pause();
          musicAudio.currentTime = 0;
        }
        
        musicAudio = new Audio(musicUrl);
        musicAudio.volume = musicVolume.value / 100;
        musicAudio.loop = musicLoopEnabled;
        musicAudio.play().catch(function(e) {
          console.error('[Recording] Music play error:', e);
        });
      }
      
      // Show recording UI elements
      showRecordingUI();
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

    // Initialize all integrations
    initAudioTabs();
    initSyncControls();
    initExportControls();
    initTrimPanel();
    initTranscribe();

    console.log('[UI] Module initialized with complete integrations');
  `;
}
