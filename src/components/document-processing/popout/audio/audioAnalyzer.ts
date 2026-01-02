/**
 * Popout Recording Studio - Audio Analyzer Module
 * Waveform visualization, duration info, audio metadata
 */

export function getAudioAnalyzerScript(): string {
  return `
    // =====================================================
    // AUDIO ANALYZER MODULE
    // =====================================================

    let audioContext = null;
    let analyzerNode = null;
    let waveformCanvas = null;
    let waveformCtx = null;

    // Initialize audio context
    function initAudioContext() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioContext;
    }

    // Analyze audio file and return metadata
    async function analyzeAudio(audioUrl) {
      console.log('[Analyzer] Analyzing audio:', audioUrl);
      
      try {
        const ctx = initAudioContext();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const metadata = {
          duration: audioBuffer.duration,
          sampleRate: audioBuffer.sampleRate,
          numberOfChannels: audioBuffer.numberOfChannels,
          length: audioBuffer.length,
          durationFormatted: formatDuration(audioBuffer.duration)
        };

        console.log('[Analyzer] Audio metadata:', metadata);
        return { buffer: audioBuffer, metadata: metadata };

      } catch (err) {
        console.error('[Analyzer] Error analyzing audio:', err);
        return null;
      }
    }

    // Format duration as MM:SS
    function formatDuration(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    // Draw waveform on canvas
    function drawWaveform(audioBuffer, canvasId, options) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        console.warn('[Analyzer] Canvas not found:', canvasId);
        return;
      }

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const data = audioBuffer.getChannelData(0);
      
      const opts = Object.assign({
        color: '#8b5cf6',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        lineWidth: 1,
        trimStart: 0,
        trimEnd: 1
      }, options || {});

      // Clear canvas
      ctx.fillStyle = opts.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Calculate step size
      const startSample = Math.floor(data.length * opts.trimStart);
      const endSample = Math.floor(data.length * opts.trimEnd);
      const sampleRange = endSample - startSample;
      const step = Math.ceil(sampleRange / width);
      const amp = height / 2;

      ctx.beginPath();
      ctx.moveTo(0, amp);
      ctx.strokeStyle = opts.color;
      ctx.lineWidth = opts.lineWidth;

      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        
        for (let j = 0; j < step; j++) {
          const sampleIdx = startSample + (i * step) + j;
          if (sampleIdx < data.length) {
            const datum = data[sampleIdx];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
          }
        }

        ctx.lineTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
      }

      ctx.stroke();

      // Draw center line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, amp);
      ctx.lineTo(width, amp);
      ctx.stroke();

      console.log('[Analyzer] Waveform drawn on:', canvasId);
    }

    // Draw trim markers on waveform
    function drawTrimMarkers(canvasId, trimStart, trimEnd) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Draw trim regions (grayed out)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, width * trimStart, height);
      ctx.fillRect(width * trimEnd, 0, width * (1 - trimEnd), height);

      // Draw trim handles
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(width * trimStart - 2, 0, 4, height);
      ctx.fillRect(width * trimEnd - 2, 0, 4, height);
    }

    // Get audio peaks for visualization
    function getAudioPeaks(audioBuffer, numPeaks) {
      const data = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(data.length / numPeaks);
      const peaks = [];

      for (let i = 0; i < numPeaks; i++) {
        let max = 0;
        for (let j = 0; j < blockSize; j++) {
          const val = Math.abs(data[i * blockSize + j] || 0);
          if (val > max) max = val;
        }
        peaks.push(max);
      }

      return peaks;
    }

    // Display audio info in UI
    function displayAudioInfo(metadata, containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = 
        '<div class="audio-info">' +
          '<span class="info-item">⏱ ' + metadata.durationFormatted + '</span>' +
          '<span class="info-item">🎵 ' + metadata.sampleRate + ' Hz</span>' +
          '<span class="info-item">📢 ' + metadata.numberOfChannels + ' ch</span>' +
        '</div>';
    }

    console.log('[AudioAnalyzer] Module loaded');
  `;
}

export function getAudioAnalyzerStyles(): string {
  return `
    /* Audio Analyzer Styles */
    .waveform-canvas {
      width: 100%;
      height: 60px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
    }

    .audio-info {
      display: flex;
      gap: 16px;
      font-size: 0.75rem;
      color: #888;
      margin-top: 8px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `;
}
