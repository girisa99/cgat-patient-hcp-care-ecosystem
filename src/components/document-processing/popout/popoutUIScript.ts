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
    // TELEPROMPTER
    // =====================================================

    function updateTeleprompter() {
      const selectedId = scriptSelect.value;
      const script = scriptsData.find(function(s) { return s.id === selectedId; });
      
      if (script && teleprompterEnabled) {
        teleprompterText.textContent = script.content || '';
        teleprompter.classList.add('visible');
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
      blurEnabled = !blurEnabled;
      
      if (blurEnabled) {
        blurBtn.classList.remove('toggle-off');
        blurBtn.classList.add('toggle-on');
        blurBtn.textContent = '🔵 BG Blur: ON';
        videoPreview.style.filter = 'blur(0px)'; // Note: actual blur requires canvas processing
      } else {
        blurBtn.classList.remove('toggle-on');
        blurBtn.classList.add('toggle-off');
        blurBtn.textContent = '🔵 BG Blur: OFF';
        videoPreview.style.filter = 'none';
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
      } else {
        logoBtn.classList.remove('toggle-on');
        logoBtn.classList.add('toggle-off');
        logoBtn.textContent = '🖼️ Logo: OFF';
        logoOverlay.classList.remove('visible');
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
      voiceoverAudio.play().catch(function(e) {
        console.error('[Voiceover] Play error:', e);
      });
    });

    voiceoverStopBtn.addEventListener('click', function() {
      if (voiceoverAudio) {
        voiceoverAudio.pause();
        voiceoverAudio.currentTime = 0;
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
      musicAudio.loop = true;
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

    updateMusicButtons();

    // =====================================================
    // AUDIO PLAYBACK FOR RECORDING
    // =====================================================

    // These functions are called by the camera module during recording
    function startAudioPlayback() {
      // Start voiceover if selected
      const voOption = voiceoverSelect.options[voiceoverSelect.selectedIndex];
      const voUrl = voOption ? voOption.dataset.url : null;
      
      if (voUrl && voiceoverSelect.value) {
        if (voiceoverAudio) voiceoverAudio.pause();
        voiceoverAudio = new Audio(voUrl);
        voiceoverAudio.volume = voiceoverVolume.value / 100;
        voiceoverAudio.play().catch(function(e) {
          console.error('[Recording] Voiceover play error:', e);
        });
      }

      // Start music if selected
      const musicOption = musicSelect.options[musicSelect.selectedIndex];
      const musicUrl = musicOption ? musicOption.dataset.url : null;
      
      if (musicUrl && musicSelect.value) {
        if (musicAudio) musicAudio.pause();
        musicAudio = new Audio(musicUrl);
        musicAudio.volume = musicVolume.value / 100;
        musicAudio.loop = true;
        musicAudio.play().catch(function(e) {
          console.error('[Recording] Music play error:', e);
        });
      }
    }

    function stopAudioPlayback() {
      if (voiceoverAudio) {
        voiceoverAudio.pause();
        voiceoverAudio.currentTime = 0;
      }
      if (musicAudio) {
        musicAudio.pause();
        musicAudio.currentTime = 0;
      }
    }

    console.log('[UI] Module initialized');
  `;
}
