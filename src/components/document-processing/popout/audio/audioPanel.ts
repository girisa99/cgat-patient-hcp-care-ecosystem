/**
 * Popout Recording Studio - Audio Panel Module
 * Unified audio controls with tabs for Voiceover, TTS, and Instrumental
 */

export function getAudioPanelScript(supabaseUrl: string, supabaseKey: string): string {
  return `
    // =====================================================
    // AUDIO PANEL MODULE
    // =====================================================
    // Note: ttsAudio is declared in shared globals

    const SUPABASE_URL = '${supabaseUrl}';
    const SUPABASE_KEY = '${supabaseKey}';

    var activeAudioTab = 'voiceover';
    var isGeneratingTTS = false;

    // =====================================================
    // TAB SWITCHING
    // =====================================================

    function switchAudioTab(tabId) {
      activeAudioTab = tabId;

      // Update tab buttons
      document.querySelectorAll('.audio-tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
          btn.classList.add('active');
        }
      });

      // Update tab content
      document.querySelectorAll('.audio-tab-content').forEach(function(content) {
        content.classList.remove('active');
        if (content.id === 'audioTab-' + tabId) {
          content.classList.add('active');
        }
      });

      console.log('[AudioPanel] Switched to tab:', tabId);
    }

    // =====================================================
    // TTS GENERATION
    // =====================================================

    async function generateTTS(text, voice) {
      if (!text || isGeneratingTTS) {
        console.warn('[AudioPanel] No text or already generating');
        return null;
      }

      console.log('[AudioPanel] Generating TTS for:', text.substring(0, 50) + '...');
      isGeneratingTTS = true;
      updateTTSUI('generating');

      try {
        const response = await fetch(SUPABASE_URL + '/functions/v1/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY
          },
          body: JSON.stringify({
            text: text,
            voice: voice || 'alloy'
          })
        });

        if (!response.ok) {
          throw new Error('TTS failed: ' + response.status);
        }

        const data = await response.json();
        
        if (data.audioContent) {
          // Create audio from base64
          const audioUrl = 'data:audio/mpeg;base64,' + data.audioContent;
          ttsAudio = new Audio(audioUrl);
          
          // Store URL globally for recording playback
          window._generatedTtsUrl = audioUrl;
          
          console.log('[AudioPanel] TTS generated successfully');
          console.log('[AudioPanel] TTS URL stored for recording playback');
          isGeneratingTTS = false;
          updateTTSUI('ready');
          
          // Enable play button and show success message
          const ttsPlayBtn = document.getElementById('ttsPlayBtn');
          const ttsStopBtn = document.getElementById('ttsStopBtn');
          if (ttsPlayBtn) ttsPlayBtn.disabled = false;
          if (ttsStopBtn) ttsStopBtn.disabled = false;
          
          return ttsAudio;
        }

        throw new Error('No audio content in response');

      } catch (err) {
        console.error('[AudioPanel] TTS error:', err);
        isGeneratingTTS = false;
        updateTTSUI('error', err.message);
        return null;
      }
    }

    function updateTTSUI(status, message) {
      const statusEl = document.getElementById('ttsStatus');
      const generateBtn = document.getElementById('ttsGenerateBtn');
      const playBtn = document.getElementById('ttsPlayBtn');

      if (status === 'generating') {
        if (statusEl) statusEl.innerHTML = '<span class="processing">⏳ Generating speech...</span>';
        if (generateBtn) {
          generateBtn.disabled = true;
          generateBtn.textContent = 'Generating...';
        }
        if (playBtn) playBtn.disabled = true;
      } else if (status === 'ready') {
        if (statusEl) statusEl.innerHTML = '<span class="success">✅ TTS ready</span>';
        if (generateBtn) {
          generateBtn.disabled = false;
          generateBtn.textContent = '🔊 Generate TTS';
        }
        if (playBtn) playBtn.disabled = false;
      } else if (status === 'error') {
        if (statusEl) statusEl.innerHTML = '<span class="error">❌ ' + (message || 'TTS failed') + '</span>';
        if (generateBtn) {
          generateBtn.disabled = false;
          generateBtn.textContent = '🔊 Retry Generate';
        }
      }
    }

    // Play TTS audio with teleprompter sync
    function playTTS() {
      if (ttsAudio) {
        const ttsVolEl = document.getElementById('ttsVolume');
        ttsAudio.volume = ttsVolEl ? ttsVolEl.value / 100 : 1;
        
        // Setup teleprompter sync
        ttsAudio.addEventListener('loadedmetadata', function onMeta() {
          ttsAudio.removeEventListener('loadedmetadata', onMeta);
          if (typeof startWordHighlightingFromAudio === 'function') {
            startWordHighlightingFromAudio(ttsAudio);
          }
          if (typeof startTeleprompterScrollSync === 'function') {
            startTeleprompterScrollSync(ttsAudio.duration);
          }
          if (typeof showReadingCursor === 'function') {
            showReadingCursor();
          }
        });
        
        // Apply ducking when TTS plays
        ttsAudio.addEventListener('play', function() {
          if (typeof applyDucking === 'function') {
            applyDucking(true);
          }
          // Update audio bar button if visible
          var voiceBtn = document.getElementById('voicePlayPauseBtn');
          if (voiceBtn) {
            voiceBtn.textContent = '⏸';
            voiceBtn.classList.add('playing');
          }
        });
        
        ttsAudio.addEventListener('pause', function() {
          if (typeof applyDucking === 'function') {
            applyDucking(false);
          }
        });
        
        ttsAudio.addEventListener('ended', function() {
          if (typeof applyDucking === 'function') {
            applyDucking(false);
          }
          if (typeof stopWordHighlighting === 'function') {
            stopWordHighlighting();
          }
          if (typeof hideReadingCursor === 'function') {
            hideReadingCursor();
          }
          var voiceBtn = document.getElementById('voicePlayPauseBtn');
          if (voiceBtn) {
            voiceBtn.textContent = '▶';
            voiceBtn.classList.remove('playing');
          }
        });
        
        ttsAudio.play().catch(function(e) {
          console.error('[AudioPanel] TTS play error:', e);
        });
      }
    }

    function stopTTS() {
      if (ttsAudio) {
        ttsAudio.pause();
        ttsAudio.currentTime = 0;
      }
      if (typeof stopWordHighlighting === 'function') {
        stopWordHighlighting();
      }
      if (typeof hideReadingCursor === 'function') {
        hideReadingCursor();
      }
    }

    // =====================================================
    // WAVEFORM VISUALIZATION
    // =====================================================

    function showWaveformForAudio(audioUrl, canvasId) {
      if (!audioUrl) return;

      analyzeAudio(audioUrl).then(function(result) {
        if (result && result.buffer) {
          drawWaveform(result.buffer, canvasId);
          displayAudioInfo(result.metadata, canvasId + 'Info');
        }
      });
    }

    // =====================================================
    // INITIALIZE AUDIO PANEL
    // =====================================================

    function initAudioPanel() {
      // Tab buttons
      document.querySelectorAll('.audio-tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          switchAudioTab(this.dataset.tab);
        });
      });

      // TTS generate button
      const ttsGenBtn = document.getElementById('ttsGenerateBtn');
      if (ttsGenBtn) {
        ttsGenBtn.addEventListener('click', function() {
          const text = document.getElementById('ttsTextInput').value || 
                       teleprompterText.textContent || '';
          const voice = document.getElementById('ttsVoiceSelect').value || 'alloy';
          generateTTS(text, voice);
        });
      }

      // TTS play/stop
      const ttsPlayBtn = document.getElementById('ttsPlayBtn');
      if (ttsPlayBtn) {
        ttsPlayBtn.addEventListener('click', playTTS);
      }

      const ttsStopBtn = document.getElementById('ttsStopBtn');
      if (ttsStopBtn) {
        ttsStopBtn.addEventListener('click', stopTTS);
      }

      // Use script for TTS
      const useScriptBtn = document.getElementById('useScriptForTTS');
      if (useScriptBtn) {
        useScriptBtn.addEventListener('click', function() {
          const scriptContent = teleprompterText ? teleprompterText.textContent : '';
          const ttsInput = document.getElementById('ttsTextInput');
          if (ttsInput && scriptContent) {
            ttsInput.value = scriptContent;
          }
        });
      }

      // Volume control
      const ttsVolume = document.getElementById('ttsVolume');
      if (ttsVolume) {
        ttsVolume.addEventListener('input', function() {
          if (ttsAudio) {
            ttsAudio.volume = this.value / 100;
          }
        });
      }

      // Show waveform when voiceover selected
      if (voiceoverSelect) {
        voiceoverSelect.addEventListener('change', function() {
          const option = this.options[this.selectedIndex];
          const url = option ? option.dataset.url : null;
          if (url) {
            showWaveformForAudio(url, 'voiceoverWaveform');
          }
        });
      }

      // Show waveform when music selected
      if (musicSelect) {
        musicSelect.addEventListener('change', function() {
          const option = this.options[this.selectedIndex];
          const url = option ? option.dataset.url : null;
          if (url) {
            showWaveformForAudio(url, 'musicWaveform');
          }
        });
      }

      console.log('[AudioPanel] Initialized');
    }

    // Initialize after DOM ready
    setTimeout(initAudioPanel, 150);

    console.log('[AudioPanel] Module loaded');
  `;
}

export function getAudioPanelStyles(): string {
  return `
    /* Audio Panel Styles */
    .audio-panel {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      overflow: hidden;
    }

    .audio-tabs {
      display: flex;
      background: rgba(0, 0, 0, 0.3);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .audio-tab-btn {
      flex: 1;
      padding: 12px 8px;
      background: transparent;
      border: none;
      color: #888;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
    }

    .audio-tab-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }

    .audio-tab-btn.active {
      color: #a78bfa;
      border-bottom-color: #8b5cf6;
      background: rgba(139, 92, 246, 0.1);
    }

    .audio-tab-content {
      display: none;
      padding: 16px;
    }

    .audio-tab-content.active {
      display: block;
    }

    /* TTS Panel */
    .tts-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .tts-text-input {
      width: 100%;
      min-height: 80px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 0.875rem;
      resize: vertical;
    }

    .tts-text-input::placeholder {
      color: #666;
    }

    .tts-voice-select {
      width: 100%;
      padding: 10px 14px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 0.875rem;
    }

    .tts-controls {
      display: flex;
      gap: 8px;
    }

    .tts-generate-btn {
      flex: 2;
      padding: 12px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tts-generate-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tts-play-btn, .tts-stop-btn {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tts-play-btn {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .tts-stop-btn {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .tts-status {
      font-size: 0.75rem;
      text-align: center;
    }

    .tts-status .processing { color: #fbbf24; }
    .tts-status .success { color: #22c55e; }
    .tts-status .error { color: #ef4444; }

    /* Waveform in panel */
    .panel-waveform {
      width: 100%;
      height: 40px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      margin-top: 8px;
    }
  `;
}
