/**
 * Popout Recording Studio - Voice Provider Selection Module
 * OpenAI + ElevenLabs voice options for enhanced downloads
 */

export function getVoiceProviderSelectionScript(supabaseUrl: string, supabaseKey: string): string {
  return `
    // =====================================================
    // VOICE PROVIDER SELECTION MODULE
    // =====================================================

    const VOICE_SUPABASE_URL = '${supabaseUrl}';
    const VOICE_SUPABASE_KEY = '${supabaseKey}';

    let selectedVoiceProvider = 'openai';
    let selectedVoice = 'alloy';
    let generatedAudioUrl = null;
    let isGeneratingAudio = false;

    // Voice options with real ElevenLabs voice IDs
    const voiceProviders = {
      openai: {
        name: 'OpenAI',
        voices: [
          { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced' },
          { id: 'echo', name: 'Echo', description: 'Male, warm' },
          { id: 'fable', name: 'Fable', description: 'British, storyteller' },
          { id: 'onyx', name: 'Onyx', description: 'Deep male' },
          { id: 'nova', name: 'Nova', description: 'Female, energetic' },
          { id: 'shimmer', name: 'Shimmer', description: 'Soft female' }
        ]
      },
      elevenlabs: {
        name: 'ElevenLabs',
        voices: [
          { id: 'sarah', name: 'Sarah', description: 'Clear, professional female' },
          { id: 'brian', name: 'Brian', description: 'Narrator, warm male' },
          { id: 'alice', name: 'Alice', description: 'Friendly, approachable' },
          { id: 'daniel', name: 'Daniel', description: 'Authoritative male' },
          { id: 'aria', name: 'Aria', description: 'Neutral, balanced' },
          { id: 'jessica', name: 'Jessica', description: 'Soft, gentle female' },
          { id: 'roger', name: 'Roger', description: 'Crisp, clear male' },
          { id: 'liam', name: 'Liam', description: 'Young, energetic male' },
          { id: 'lily', name: 'Lily', description: 'Soft, pleasant female' },
          { id: 'george', name: 'George', description: 'Deep, mature male' },
          { id: 'matilda', name: 'Matilda', description: 'Strong, confident' },
          { id: 'will', name: 'Will', description: 'Raspy, unique male' }
        ]
      }
    };

    // =====================================================
    // PROVIDER SWITCHING
    // =====================================================

    function selectVoiceProvider(provider) {
      if (!voiceProviders[provider]) {
        console.warn('[VoiceProvider] Unknown provider:', provider);
        return;
      }

      selectedVoiceProvider = provider;
      
      // Update UI
      document.querySelectorAll('.provider-btn').forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.dataset.provider === provider) {
          btn.classList.add('active');
        }
      });

      // Update voice options
      populateVoiceOptions(provider);
      
      console.log('[VoiceProvider] Selected provider:', provider);
    }

    function populateVoiceOptions(provider) {
      const voiceSelect = document.getElementById('enhancedVoiceSelect');
      if (!voiceSelect) return;

      const voices = voiceProviders[provider]?.voices || [];
      
      voiceSelect.innerHTML = voices.map(function(v) {
        return '<option value="' + v.id + '">' + v.name + ' - ' + v.description + '</option>';
      }).join('');

      // Select first voice
      if (voices.length > 0) {
        selectedVoice = voices[0].id;
      }
    }

    function selectVoice(voiceId) {
      selectedVoice = voiceId;
      console.log('[VoiceProvider] Selected voice:', voiceId);
    }

    // =====================================================
    // AUDIO GENERATION
    // =====================================================

    async function generateEnhancedAudio(text) {
      if (!text || isGeneratingAudio) {
        console.warn('[VoiceProvider] No text or already generating');
        return null;
      }

      console.log('[VoiceProvider] Generating audio with', selectedVoiceProvider, '/', selectedVoice);
      isGeneratingAudio = true;
      updateGenerationUI('generating');

      try {
        let audioData;

        if (selectedVoiceProvider === 'openai') {
          audioData = await generateOpenAIAudio(text);
        } else if (selectedVoiceProvider === 'elevenlabs') {
          audioData = await generateElevenLabsAudio(text);
        }

        if (audioData) {
          generatedAudioUrl = audioData.url;
          isGeneratingAudio = false;
          updateGenerationUI('complete');
          return audioData;
        }

        throw new Error('No audio data received');

      } catch (err) {
        console.error('[VoiceProvider] Generation error:', err);
        isGeneratingAudio = false;
        updateGenerationUI('error', err.message);
        return null;
      }
    }

    async function generateOpenAIAudio(text) {
      // Create AbortController with 30s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(function() { controller.abort(); }, 30000);
      
      try {
        const response = await fetch(VOICE_SUPABASE_URL + '/functions/v1/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': VOICE_SUPABASE_KEY,
            'Authorization': 'Bearer ' + VOICE_SUPABASE_KEY
          },
          body: JSON.stringify({
            text: text,
            voice: selectedVoice,
            model: 'tts-1'
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('OpenAI TTS failed: ' + response.status);
        }

        const data = await response.json();
        
        if (data.audioContent) {
          const audioUrl = 'data:audio/mpeg;base64,' + data.audioContent;
          return { url: audioUrl, provider: 'openai', voice: selectedVoice };
        }

        throw new Error('No audio content');
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error('OpenAI TTS request timed out after 30s');
        }
        throw err;
      }
    }

    async function generateElevenLabsAudio(text) {
      // Create AbortController with 30s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(function() { controller.abort(); }, 30000);
      
      try {
        const response = await fetch(VOICE_SUPABASE_URL + '/functions/v1/elevenlabs-voice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': VOICE_SUPABASE_KEY,
            'Authorization': 'Bearer ' + VOICE_SUPABASE_KEY
          },
          body: JSON.stringify({
            text: text,
            voice: selectedVoice,
            agentType: 'narrator'
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('ElevenLabs TTS failed: ' + response.status);
        }

        const data = await response.json();
        
        if (data.audioContent) {
          const audioUrl = 'data:audio/mpeg;base64,' + data.audioContent;
          return { url: audioUrl, provider: 'elevenlabs', voice: selectedVoice };
        }

        throw new Error('No audio content');
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error('ElevenLabs TTS request timed out after 30s');
        }
        throw err;
      }
    }

    // =====================================================
    // DOWNLOAD ENHANCED AUDIO
    // =====================================================

    function downloadEnhancedAudio(format) {
      if (!generatedAudioUrl) {
        showVoiceProviderToast('Generate audio first', 'warning');
        return;
      }

      const fmt = format || 'mp3';
      
      // Create download
      const a = document.createElement('a');
      a.href = generatedAudioUrl;
      a.download = 'enhanced-audio-' + selectedVoiceProvider + '-' + selectedVoice + '-' + Date.now() + '.' + fmt;
      a.click();

      console.log('[VoiceProvider] Downloaded audio as', fmt);
    }

    async function downloadAsWav() {
      if (!generatedAudioUrl) {
        showVoiceProviderToast('Generate audio first', 'warning');
        return;
      }

      showVoiceProviderToast('Converting to WAV...', 'info');

      try {
        // Fetch audio data
        const response = await fetch(generatedAudioUrl);
        const arrayBuffer = await response.arrayBuffer();

        // Decode audio
        const ctx = initAudioContext();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        // Encode as WAV
        const wavBlob = audioBufferToWav(audioBuffer);
        const url = URL.createObjectURL(wavBlob);

        // Download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'enhanced-audio-' + selectedVoiceProvider + '-' + selectedVoice + '-' + Date.now() + '.wav';
        a.click();

        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
        console.log('[VoiceProvider] Downloaded as WAV');

      } catch (err) {
        console.error('[VoiceProvider] WAV conversion error:', err);
        showVoiceProviderToast('WAV conversion failed', 'error');
      }
    }

    function audioBufferToWav(audioBuffer) {
      const numChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const format = 1; // PCM
      const bitDepth = 16;

      const bytesPerSample = bitDepth / 8;
      const blockAlign = numChannels * bytesPerSample;

      const data = audioBuffer.getChannelData(0);
      const samples = data.length;
      const buffer = new ArrayBuffer(44 + samples * bytesPerSample);
      const view = new DataView(buffer);

      // WAV header
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + samples * bytesPerSample, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, format, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * blockAlign, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitDepth, true);
      writeString(view, 36, 'data');
      view.setUint32(40, samples * bytesPerSample, true);

      // Write samples
      let offset = 44;
      for (let i = 0; i < samples; i++) {
        const sample = Math.max(-1, Math.min(1, data[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }

      return new Blob([buffer], { type: 'audio/wav' });
    }

    function writeString(view, offset, str) {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    // =====================================================
    // UI HELPERS
    // =====================================================

    function updateGenerationUI(status, message) {
      const statusEl = document.getElementById('voiceGenStatus');
      const generateBtn = document.getElementById('generateEnhancedAudioBtn');
      const downloadBtns = document.getElementById('enhancedDownloadBtns');

      if (status === 'generating') {
        if (statusEl) statusEl.innerHTML = '<span class="processing">⏳ Generating audio...</span>';
        if (generateBtn) {
          generateBtn.disabled = true;
          generateBtn.textContent = 'Generating...';
        }
        if (downloadBtns) downloadBtns.style.display = 'none';
      } else if (status === 'complete') {
        if (statusEl) statusEl.innerHTML = '<span class="success">✅ Audio ready</span>';
        if (generateBtn) {
          generateBtn.disabled = false;
          generateBtn.textContent = '🔊 Regenerate Audio';
        }
        if (downloadBtns) downloadBtns.style.display = 'flex';
      } else if (status === 'error') {
        if (statusEl) statusEl.innerHTML = '<span class="error">❌ ' + (message || 'Generation failed') + '</span>';
        if (generateBtn) {
          generateBtn.disabled = false;
          generateBtn.textContent = '🔊 Retry Generate';
        }
      }
    }

    function showVoiceProviderToast(message, type) {
      const toast = document.getElementById('voiceProviderToast');
      if (!toast) return;

      toast.textContent = message;
      toast.className = 'voice-provider-toast visible ' + (type || 'info');
      
      setTimeout(function() {
        toast.className = 'voice-provider-toast';
      }, 3000);
    }

    // =====================================================
    // PREVIEW AUDIO
    // =====================================================

    let previewAudio = null;

    function cleanupPreviewAudio() {
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
        previewAudio.removeAttribute('src');
        previewAudio.load(); // Reset the audio element
        previewAudio = null;
      }
    }

    function previewGeneratedAudio() {
      if (!generatedAudioUrl) {
        showVoiceProviderToast('Generate audio first', 'warning');
        return;
      }

      // Cleanup previous audio to prevent memory leak
      cleanupPreviewAudio();

      previewAudio = new Audio(generatedAudioUrl);
      previewAudio.play().catch(function(e) {
        console.error('[VoiceProvider] Preview error:', e);
      });
    }

    function stopPreview() {
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
      }
    }

    // Cleanup on page unload
    window.addEventListener('unload', cleanupPreviewAudio);

    // =====================================================
    // INITIALIZE VOICE PROVIDER SELECTION
    // =====================================================

    function initVoiceProviderSelection() {
      // Provider buttons
      document.querySelectorAll('.provider-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          selectVoiceProvider(this.dataset.provider);
        });
      });

      // Voice select
      const voiceSelect = document.getElementById('enhancedVoiceSelect');
      if (voiceSelect) {
        voiceSelect.addEventListener('change', function() {
          selectVoice(this.value);
        });
      }

      // Generate button
      const generateBtn = document.getElementById('generateEnhancedAudioBtn');
      if (generateBtn) {
        generateBtn.addEventListener('click', function() {
          const text = enhancedScript || (teleprompterText ? teleprompterText.textContent : '');
          if (text) {
            generateEnhancedAudio(text);
          } else {
            showVoiceProviderToast('No script content', 'warning');
          }
        });
      }

      // Download buttons
      const downloadMp3Btn = document.getElementById('downloadMp3Btn');
      if (downloadMp3Btn) {
        downloadMp3Btn.addEventListener('click', function() {
          downloadEnhancedAudio('mp3');
        });
      }

      const downloadWavBtn = document.getElementById('downloadWavBtn');
      if (downloadWavBtn) {
        downloadWavBtn.addEventListener('click', downloadAsWav);
      }

      // Preview buttons
      const previewBtn = document.getElementById('previewEnhancedBtn');
      if (previewBtn) {
        previewBtn.addEventListener('click', previewGeneratedAudio);
      }

      const stopPreviewBtn = document.getElementById('stopPreviewBtn');
      if (stopPreviewBtn) {
        stopPreviewBtn.addEventListener('click', stopPreview);
      }

      // Initialize with OpenAI
      populateVoiceOptions('openai');

      console.log('[VoiceProviderSelection] Initialized');
    }

    setTimeout(initVoiceProviderSelection, 350);

    console.log('[VoiceProviderSelection] Module loaded');
  `;
}

export function getVoiceProviderSelectionStyles(): string {
  return `
    /* Voice Provider Selection Styles */
    
    .voice-provider-section {
      margin-top: 16px;
    }

    .provider-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .provider-btn {
      flex: 1;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #888;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .provider-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .provider-btn.active {
      background: rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.5);
      color: #a78bfa;
    }

    .provider-btn .provider-name {
      display: block;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .provider-btn .provider-desc {
      font-size: 0.65rem;
      opacity: 0.7;
    }

    /* Voice Select */
    #enhancedVoiceSelect {
      width: 100%;
      padding: 10px 14px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 0.875rem;
      margin-bottom: 12px;
    }

    /* Generate Button */
    #generateEnhancedAudioBtn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 12px;
    }

    #generateEnhancedAudioBtn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    #generateEnhancedAudioBtn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
    }

    /* Status */
    #voiceGenStatus {
      font-size: 0.75rem;
      text-align: center;
      margin-bottom: 12px;
    }

    #voiceGenStatus .processing { color: #fbbf24; }
    #voiceGenStatus .success { color: #22c55e; }
    #voiceGenStatus .error { color: #ef4444; }

    /* Download Buttons */
    #enhancedDownloadBtns {
      display: none;
      gap: 8px;
    }

    .download-format-btn {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    #downloadMp3Btn {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    #downloadWavBtn {
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #60a5fa;
    }

    .download-format-btn:hover {
      transform: translateY(-1px);
    }

    /* Preview Buttons */
    .preview-controls {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    #previewEnhancedBtn, #stopPreviewBtn {
      flex: 1;
      padding: 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
    }

    #previewEnhancedBtn {
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #a78bfa;
    }

    #stopPreviewBtn {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    /* Toast */
    .voice-provider-toast {
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      padding: 12px 24px;
      background: #8b5cf6;
      color: #fff;
      border-radius: 8px;
      font-size: 0.875rem;
      opacity: 0;
      transition: all 0.3s;
      z-index: 1002;
    }

    .voice-provider-toast.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    .voice-provider-toast.success { background: #22c55e; }
    .voice-provider-toast.error { background: #ef4444; }
    .voice-provider-toast.warning { background: #fbbf24; color: #000; }
    .voice-provider-toast.info { background: #3b82f6; }
  `;
}
