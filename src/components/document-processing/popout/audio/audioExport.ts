/**
 * Popout Recording Studio - Audio Export Module
 * Download as MP3/WAV, enhanced audio processing
 */

export function getAudioExportScript(): string {
  return `
    // =====================================================
    // AUDIO EXPORT MODULE
    // =====================================================

    // Export audio with options
    async function exportAudio(audioBuffer, options) {
      const opts = Object.assign({
        format: 'wav',
        filename: 'audio-export',
        normalize: false,
        fadeIn: 0,
        fadeOut: 0
      }, options || {});

      console.log('[Export] Exporting audio with options:', opts);

      // Apply enhancements
      let processedBuffer = audioBuffer;
      
      if (opts.normalize) {
        processedBuffer = normalizeAudio(processedBuffer);
      }
      
      if (opts.fadeIn > 0 || opts.fadeOut > 0) {
        processedBuffer = applyFades(processedBuffer, opts.fadeIn, opts.fadeOut);
      }

      // Convert to blob
      const blob = await audioBufferToBlob(processedBuffer, opts.format);
      
      // Download
      downloadBlob(blob, opts.filename + '.' + opts.format);
      
      return blob;
    }

    // Normalize audio (maximize volume without clipping)
    function normalizeAudio(audioBuffer) {
      const ctx = initAudioContext();
      const channels = audioBuffer.numberOfChannels;
      const newBuffer = ctx.createBuffer(channels, audioBuffer.length, audioBuffer.sampleRate);

      // Find peak amplitude across all channels
      let peak = 0;
      for (let ch = 0; ch < channels; ch++) {
        const data = audioBuffer.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
          const abs = Math.abs(data[i]);
          if (abs > peak) peak = abs;
        }
      }

      // Calculate gain
      const gain = peak > 0 ? 0.95 / peak : 1;
      console.log('[Export] Normalizing with gain:', gain.toFixed(3));

      // Apply gain
      for (let ch = 0; ch < channels; ch++) {
        const source = audioBuffer.getChannelData(ch);
        const dest = newBuffer.getChannelData(ch);
        for (let i = 0; i < source.length; i++) {
          dest[i] = source[i] * gain;
        }
      }

      return newBuffer;
    }

    // Apply fade in/out
    function applyFades(audioBuffer, fadeInDuration, fadeOutDuration) {
      const ctx = initAudioContext();
      const channels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const newBuffer = ctx.createBuffer(channels, audioBuffer.length, sampleRate);

      const fadeInSamples = Math.floor(fadeInDuration * sampleRate);
      const fadeOutSamples = Math.floor(fadeOutDuration * sampleRate);
      const totalSamples = audioBuffer.length;

      console.log('[Export] Applying fades:', fadeInSamples, 'in,', fadeOutSamples, 'out');

      for (let ch = 0; ch < channels; ch++) {
        const source = audioBuffer.getChannelData(ch);
        const dest = newBuffer.getChannelData(ch);

        for (let i = 0; i < totalSamples; i++) {
          let gain = 1;

          // Fade in
          if (i < fadeInSamples) {
            gain = i / fadeInSamples;
          }

          // Fade out
          if (i > totalSamples - fadeOutSamples) {
            gain = (totalSamples - i) / fadeOutSamples;
          }

          dest[i] = source[i] * gain;
        }
      }

      return newBuffer;
    }

    // Download blob as file
    function downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
      console.log('[Export] Downloaded:', filename);
    }

    // Export recording with voiceover and music mixed
    async function exportMixedRecording(recordingBlob, options) {
      const opts = Object.assign({
        format: 'webm',
        filename: 'recording-mixed',
        voiceoverUrl: null,
        musicUrl: null,
        voiceoverVolume: 1,
        musicVolume: 0.3
      }, options || {});

      console.log('[Export] Exporting mixed recording');

      // For now, just download the recording
      // Full mixing would require more complex audio processing
      downloadBlob(recordingBlob, opts.filename + '.' + opts.format);
      
      return recordingBlob;
    }

    // Export enhanced script as text file
    function exportScript(scriptContent, filename) {
      const blob = new Blob([scriptContent], { type: 'text/plain' });
      downloadBlob(blob, (filename || 'script') + '.txt');
    }

    // Export script with timestamps
    function exportTimestampedScript(scriptData, filename) {
      let content = '# Timestamped Script\\n\\n';
      
      if (Array.isArray(scriptData)) {
        scriptData.forEach(function(item, index) {
          content += '[' + formatDuration(item.startTime || 0) + '] ';
          content += item.text + '\\n\\n';
        });
      } else {
        content += scriptData;
      }

      const blob = new Blob([content], { type: 'text/plain' });
      downloadBlob(blob, (filename || 'timestamped-script') + '.txt');
    }

    console.log('[AudioExport] Module loaded');
  `;
}

export function getAudioExportStyles(): string {
  return `
    /* Audio Export Styles */
    .export-panel {
      padding: 16px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .export-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .export-option {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .export-option label {
      width: 100px;
      font-size: 0.75rem;
      color: #888;
    }

    .export-option input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #8b5cf6;
    }

    .export-option input[type="number"] {
      width: 80px;
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: #fff;
      font-size: 0.75rem;
    }

    .format-select {
      display: flex;
      gap: 8px;
    }

    .format-btn {
      padding: 8px 16px;
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 6px;
      color: #a78bfa;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .format-btn.active {
      background: rgba(139, 92, 246, 0.4);
      border-color: #8b5cf6;
      color: #fff;
    }

    .export-btn-primary {
      width: 100%;
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

    .export-btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    }
  `;
}
