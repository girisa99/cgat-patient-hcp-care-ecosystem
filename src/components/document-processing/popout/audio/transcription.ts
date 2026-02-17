/**
 * Popout Recording Studio - Transcription Module
 * Speech-to-text integration for voiceovers
 */

export function getTranscriptionScript(supabaseUrl: string, supabaseKey: string): string {
  return `
    // =====================================================
    // TRANSCRIPTION MODULE
    // =====================================================

    const SUPABASE_URL = '${supabaseUrl}';
    const SUPABASE_KEY = '${supabaseKey}';

    let transcriptionInProgress = false;
    let currentTranscription = null;

    // Transcribe audio file
    async function transcribeAudio(audioUrl, options) {
      const opts = Object.assign({
        language: 'en',
        timestamps: true,
        onProgress: null
      }, options || {});

      console.log('[Transcription] Starting transcription for:', audioUrl);
      transcriptionInProgress = true;
      updateTranscriptionUI('processing');

      try {
        // Fetch audio file
        const audioResponse = await fetch(audioUrl);
        const audioBlob = await audioResponse.blob();

        // Convert to base64
        const base64 = await blobToBase64(audioBlob);

        // Call transcription edge function
        const response = await fetch(SUPABASE_URL + '/functions/v1/voice-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY
          },
          body: JSON.stringify({
            audio: base64.split(',')[1] || base64,
            language: opts.language
          })
        });

        if (!response.ok) {
          throw new Error('Transcription failed: ' + response.status);
        }

        const result = await response.json();
        currentTranscription = result.text || result.transcription || '';

        console.log('[Transcription] Result:', currentTranscription);
        transcriptionInProgress = false;
        updateTranscriptionUI('complete');

        return {
          text: currentTranscription,
          success: true
        };

      } catch (err) {
        console.error('[Transcription] Error:', err);
        transcriptionInProgress = false;
        updateTranscriptionUI('error', err.message);
        return {
          text: '',
          success: false,
          error: err.message
        };
      }
    }

    // Convert blob to base64
    function blobToBase64(blob) {
      return new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.onloadend = function() {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // Update transcription UI
    function updateTranscriptionUI(status, message) {
      const statusEl = document.getElementById('transcriptionStatus');
      const resultEl = document.getElementById('transcriptionResult');
      const btnEl = document.getElementById('transcribeBtn');

      if (status === 'processing') {
        if (statusEl) statusEl.innerHTML = '<span class="processing">⏳ Transcribing...</span>';
        if (btnEl) {
          btnEl.disabled = true;
          btnEl.textContent = 'Transcribing...';
        }
      } else if (status === 'complete') {
        if (statusEl) statusEl.innerHTML = '<span class="success">✅ Transcription complete</span>';
        if (resultEl) resultEl.textContent = currentTranscription;
        if (btnEl) {
          btnEl.disabled = false;
          btnEl.textContent = '🎤 Transcribe';
        }
      } else if (status === 'error') {
        if (statusEl) statusEl.innerHTML = '<span class="error">❌ ' + (message || 'Transcription failed') + '</span>';
        if (btnEl) {
          btnEl.disabled = false;
          btnEl.textContent = '🎤 Retry Transcribe';
        }
      }
    }

    // Apply transcription to script
    function applyTranscriptionToScript(scriptId) {
      if (!currentTranscription) {
        console.warn('[Transcription] No transcription to apply');
        return;
      }

      // Find script in data and update
      const script = scriptsData.find(function(s) { return s.id === scriptId; });
      if (script) {
        script.content = currentTranscription;
        console.log('[Transcription] Applied to script:', scriptId);
        
        // Update teleprompter if this script is selected
        if (scriptSelect && scriptSelect.value === scriptId) {
          updateTeleprompter();
        }
      }

      return currentTranscription;
    }

    // Generate enhanced script from transcription
    function generateEnhancedScript(transcription) {
      if (!transcription) return '';

      // Basic cleanup and enhancement
      let enhanced = transcription
        .trim()
        .replace(/\\s+/g, ' ')
        .replace(/([.!?])\\s*/g, '$1\\n\\n')
        .trim();

      console.log('[Transcription] Generated enhanced script');
      return enhanced;
    }

    // Compare transcription with script for matching
    function compareWithScript(transcription, scriptContent) {
      if (!transcription || !scriptContent) return { accuracy: 0, matches: [] };

      const transWords = transcription.toLowerCase().split(/\\s+/);
      const scriptWords = scriptContent.toLowerCase().split(/\\s+/);

      let matches = 0;
      let matchedPositions = [];

      transWords.forEach(function(word, idx) {
        if (scriptWords.includes(word)) {
          matches++;
          matchedPositions.push(idx);
        }
      });

      const accuracy = transWords.length > 0 ? (matches / transWords.length) * 100 : 0;

      console.log('[Transcription] Comparison accuracy:', accuracy.toFixed(1) + '%');

      return {
        accuracy: accuracy,
        matches: matchedPositions,
        totalWords: transWords.length,
        matchedWords: matches
      };
    }

    console.log('[Transcription] Module loaded');
  `;
}

export function getTranscriptionStyles(): string {
  return `
    /* Transcription Styles */
    .transcription-panel {
      padding: 16px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .transcription-result {
      min-height: 80px;
      max-height: 150px;
      overflow-y: auto;
      padding: 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      font-size: 0.875rem;
      line-height: 1.5;
      color: #e0e0e0;
      margin-bottom: 12px;
    }

    .transcription-result:empty::before {
      content: 'Transcription will appear here...';
      color: #666;
      font-style: italic;
    }

    .transcription-status {
      font-size: 0.75rem;
      margin-bottom: 8px;
    }

    .transcription-status .processing {
      color: #fbbf24;
    }

    .transcription-status .success {
      color: #22c55e;
    }

    .transcription-status .error {
      color: #ef4444;
    }

    .transcribe-btn {
      width: 100%;
      padding: 10px;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 6px;
      color: #60a5fa;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .transcribe-btn:hover:not(:disabled) {
      background: rgba(59, 130, 246, 0.3);
    }

    .transcribe-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .accuracy-badge {
      display: inline-block;
      padding: 4px 8px;
      background: rgba(34, 197, 94, 0.2);
      border-radius: 4px;
      font-size: 0.75rem;
      color: #22c55e;
    }
  `;
}
