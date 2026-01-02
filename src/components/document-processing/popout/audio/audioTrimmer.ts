/**
 * Popout Recording Studio - Audio Trimmer Module
 * Cut start/end of audio clips with visual interface
 */

export function getAudioTrimmerScript(): string {
  return `
    // =====================================================
    // AUDIO TRIMMER MODULE
    // =====================================================

    let currentTrimStart = 0;
    let currentTrimEnd = 1;
    let currentAudioBuffer = null;
    let trimmedAudioBuffer = null;

    // Initialize trimmer for an audio buffer
    function initTrimmer(audioBuffer) {
      currentAudioBuffer = audioBuffer;
      currentTrimStart = 0;
      currentTrimEnd = 1;
      trimmedAudioBuffer = null;
      
      updateTrimDisplay();
      console.log('[Trimmer] Initialized with', audioBuffer.duration.toFixed(2), 'seconds');
    }

    // Set trim points (0-1 range)
    function setTrimPoints(start, end) {
      currentTrimStart = Math.max(0, Math.min(1, start));
      currentTrimEnd = Math.max(currentTrimStart, Math.min(1, end));
      updateTrimDisplay();
      console.log('[Trimmer] Trim points:', currentTrimStart.toFixed(2), '-', currentTrimEnd.toFixed(2));
    }

    // Update trim display
    function updateTrimDisplay() {
      if (!currentAudioBuffer) return;

      const duration = currentAudioBuffer.duration;
      const startTime = duration * currentTrimStart;
      const endTime = duration * currentTrimEnd;
      const trimmedDuration = endTime - startTime;

      const startEl = document.getElementById('trimStartTime');
      const endEl = document.getElementById('trimEndTime');
      const durationEl = document.getElementById('trimmedDuration');

      if (startEl) startEl.textContent = formatDuration(startTime);
      if (endEl) endEl.textContent = formatDuration(endTime);
      if (durationEl) durationEl.textContent = formatDuration(trimmedDuration);

      // Update trim slider positions
      const startSlider = document.getElementById('trimStartSlider');
      const endSlider = document.getElementById('trimEndSlider');
      
      if (startSlider) startSlider.value = currentTrimStart * 100;
      if (endSlider) endSlider.value = currentTrimEnd * 100;
    }

    // Apply trim to audio buffer
    function applyTrim() {
      if (!currentAudioBuffer) {
        console.warn('[Trimmer] No audio buffer to trim');
        return null;
      }

      const ctx = initAudioContext();
      const sampleRate = currentAudioBuffer.sampleRate;
      const channels = currentAudioBuffer.numberOfChannels;
      
      const startSample = Math.floor(currentAudioBuffer.length * currentTrimStart);
      const endSample = Math.floor(currentAudioBuffer.length * currentTrimEnd);
      const trimmedLength = endSample - startSample;

      // Create new buffer for trimmed audio
      trimmedAudioBuffer = ctx.createBuffer(channels, trimmedLength, sampleRate);

      // Copy trimmed data
      for (let channel = 0; channel < channels; channel++) {
        const sourceData = currentAudioBuffer.getChannelData(channel);
        const destData = trimmedAudioBuffer.getChannelData(channel);
        
        for (let i = 0; i < trimmedLength; i++) {
          destData[i] = sourceData[startSample + i];
        }
      }

      console.log('[Trimmer] Applied trim:', trimmedLength, 'samples,', 
        (trimmedLength / sampleRate).toFixed(2), 'seconds');

      return trimmedAudioBuffer;
    }

    // Get trimmed audio as blob
    async function getTrimmedAudioBlob(format) {
      const buffer = applyTrim();
      if (!buffer) return null;

      return await audioBufferToBlob(buffer, format || 'wav');
    }

    // Convert AudioBuffer to Blob
    async function audioBufferToBlob(audioBuffer, format) {
      const numChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const length = audioBuffer.length;

      if (format === 'wav') {
        // Create WAV file
        const wavData = encodeWAV(audioBuffer);
        return new Blob([wavData], { type: 'audio/wav' });
      } else {
        // For MP3, we'd need an encoder - fallback to WAV
        console.warn('[Trimmer] MP3 encoding not available, using WAV');
        const wavData = encodeWAV(audioBuffer);
        return new Blob([wavData], { type: 'audio/wav' });
      }
    }

    // Encode audio buffer as WAV
    function encodeWAV(audioBuffer) {
      const numChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const format = 1; // PCM
      const bitDepth = 16;
      
      const bytesPerSample = bitDepth / 8;
      const blockAlign = numChannels * bytesPerSample;
      const byteRate = sampleRate * blockAlign;
      const dataSize = audioBuffer.length * blockAlign;
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);

      // WAV header
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, format, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitDepth, true);
      writeString(view, 36, 'data');
      view.setUint32(40, dataSize, true);

      // Audio data
      const offset = 44;
      const channels = [];
      for (let i = 0; i < numChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
      }

      let index = 0;
      for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
          let sample = channels[channel][i];
          sample = Math.max(-1, Math.min(1, sample));
          sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          view.setInt16(offset + index, sample, true);
          index += 2;
        }
      }

      return buffer;
    }

    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    // Preview trimmed section
    function previewTrimmedAudio() {
      if (!currentAudioBuffer) return;

      const ctx = initAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = currentAudioBuffer;
      source.connect(ctx.destination);

      const startTime = currentAudioBuffer.duration * currentTrimStart;
      const duration = currentAudioBuffer.duration * (currentTrimEnd - currentTrimStart);

      source.start(0, startTime, duration);
      console.log('[Trimmer] Previewing from', startTime.toFixed(2), 'for', duration.toFixed(2), 's');

      return source;
    }

    console.log('[AudioTrimmer] Module loaded');
  `;
}

export function getAudioTrimmerStyles(): string {
  return `
    /* Audio Trimmer Styles */
    .trim-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .trim-slider-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .trim-slider-container label {
      width: 60px;
      font-size: 0.75rem;
      color: #888;
    }

    .trim-slider {
      flex: 1;
      height: 4px;
      -webkit-appearance: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }

    .trim-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      background: #22c55e;
      border-radius: 50%;
      cursor: pointer;
    }

    .trim-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #22c55e;
    }

    .trim-actions {
      display: flex;
      gap: 8px;
    }

    .trim-btn {
      flex: 1;
      padding: 8px 12px;
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 6px;
      color: #22c55e;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .trim-btn:hover {
      background: rgba(34, 197, 94, 0.3);
    }
  `;
}
