/**
 * Studio Sound Processing Hook
 * Provides audio processing for podcast-quality sound:
 * - Compressor for even volume levels
 * - EQ for voice clarity
 * - Noise gate for clean cuts
 */

import { useCallback, useRef, useState } from 'react';

export interface StudioSoundSettings {
  enabled: boolean;
  compressor: {
    enabled: boolean;
    threshold: number; // dB
    ratio: number;
    attack: number; // seconds
    release: number; // seconds
    knee: number; // dB
  };
  eq: {
    enabled: boolean;
    lowCut: number; // Hz - cut frequencies below this
    lowShelf: { frequency: number; gain: number }; // Warmth
    midPeak: { frequency: number; gain: number; Q: number }; // Presence
    highShelf: { frequency: number; gain: number }; // Clarity/air
  };
  noiseGate: {
    enabled: boolean;
    threshold: number; // dB
    attack: number; // ms
    release: number; // ms
  };
  limiter: {
    enabled: boolean;
    threshold: number; // dB
  };
}

export const STUDIO_PRESETS: Record<string, StudioSoundSettings> = {
  podcast: {
    enabled: true,
    compressor: {
      enabled: true,
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
      knee: 10,
    },
    eq: {
      enabled: true,
      lowCut: 80,
      lowShelf: { frequency: 200, gain: -2 },
      midPeak: { frequency: 3000, gain: 3, Q: 1.5 },
      highShelf: { frequency: 10000, gain: 2 },
    },
    noiseGate: {
      enabled: true,
      threshold: -50,
      attack: 10,
      release: 100,
    },
    limiter: {
      enabled: true,
      threshold: -1,
    },
  },
  broadcast: {
    enabled: true,
    compressor: {
      enabled: true,
      threshold: -18,
      ratio: 6,
      attack: 0.001,
      release: 0.1,
      knee: 5,
    },
    eq: {
      enabled: true,
      lowCut: 100,
      lowShelf: { frequency: 150, gain: -3 },
      midPeak: { frequency: 2500, gain: 4, Q: 2 },
      highShelf: { frequency: 8000, gain: 3 },
    },
    noiseGate: {
      enabled: true,
      threshold: -45,
      attack: 5,
      release: 50,
    },
    limiter: {
      enabled: true,
      threshold: -0.5,
    },
  },
  natural: {
    enabled: true,
    compressor: {
      enabled: true,
      threshold: -30,
      ratio: 2,
      attack: 0.01,
      release: 0.3,
      knee: 20,
    },
    eq: {
      enabled: false,
      lowCut: 60,
      lowShelf: { frequency: 200, gain: 0 },
      midPeak: { frequency: 3000, gain: 0, Q: 1 },
      highShelf: { frequency: 10000, gain: 0 },
    },
    noiseGate: {
      enabled: false,
      threshold: -60,
      attack: 20,
      release: 200,
    },
    limiter: {
      enabled: true,
      threshold: -3,
    },
  },
  off: {
    enabled: false,
    compressor: { enabled: false, threshold: -24, ratio: 4, attack: 0.003, release: 0.25, knee: 10 },
    eq: { enabled: false, lowCut: 80, lowShelf: { frequency: 200, gain: 0 }, midPeak: { frequency: 3000, gain: 0, Q: 1 }, highShelf: { frequency: 10000, gain: 0 } },
    noiseGate: { enabled: false, threshold: -50, attack: 10, release: 100 },
    limiter: { enabled: false, threshold: -1 },
  },
};

export function useStudioSound() {
  const [settings, setSettings] = useState<StudioSoundSettings>(STUDIO_PRESETS.podcast);
  const [activePreset, setActivePreset] = useState<string>('podcast');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    input?: MediaStreamAudioSourceNode;
    compressor?: DynamicsCompressorNode;
    lowCut?: BiquadFilterNode;
    lowShelf?: BiquadFilterNode;
    midPeak?: BiquadFilterNode;
    highShelf?: BiquadFilterNode;
    limiter?: DynamicsCompressorNode;
    output?: MediaStreamAudioDestinationNode;
  }>({});

  // Apply studio sound processing to a MediaStream
  const processStream = useCallback((inputStream: MediaStream): MediaStream => {
    if (!settings.enabled) {
      return inputStream;
    }

    try {
      // Create or reuse AudioContext
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      // Clean up previous nodes
      Object.values(nodesRef.current).forEach(node => {
        try { node?.disconnect(); } catch (e) { /* ignore */ }
      });

      // Create source from input stream
      const source = ctx.createMediaStreamSource(inputStream);
      nodesRef.current.input = source;

      // Create processing chain
      let currentNode: AudioNode = source;

      // 1. Low Cut Filter (High Pass)
      if (settings.eq.enabled) {
        const lowCut = ctx.createBiquadFilter();
        lowCut.type = 'highpass';
        lowCut.frequency.value = settings.eq.lowCut;
        lowCut.Q.value = 0.707;
        currentNode.connect(lowCut);
        currentNode = lowCut;
        nodesRef.current.lowCut = lowCut;
      }

      // 2. Compressor
      if (settings.compressor.enabled) {
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = settings.compressor.threshold;
        compressor.ratio.value = settings.compressor.ratio;
        compressor.attack.value = settings.compressor.attack;
        compressor.release.value = settings.compressor.release;
        compressor.knee.value = settings.compressor.knee;
        currentNode.connect(compressor);
        currentNode = compressor;
        nodesRef.current.compressor = compressor;
      }

      // 3. EQ - Low Shelf
      if (settings.eq.enabled && settings.eq.lowShelf.gain !== 0) {
        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = settings.eq.lowShelf.frequency;
        lowShelf.gain.value = settings.eq.lowShelf.gain;
        currentNode.connect(lowShelf);
        currentNode = lowShelf;
        nodesRef.current.lowShelf = lowShelf;
      }

      // 4. EQ - Mid Peak (Presence)
      if (settings.eq.enabled && settings.eq.midPeak.gain !== 0) {
        const midPeak = ctx.createBiquadFilter();
        midPeak.type = 'peaking';
        midPeak.frequency.value = settings.eq.midPeak.frequency;
        midPeak.gain.value = settings.eq.midPeak.gain;
        midPeak.Q.value = settings.eq.midPeak.Q;
        currentNode.connect(midPeak);
        currentNode = midPeak;
        nodesRef.current.midPeak = midPeak;
      }

      // 5. EQ - High Shelf (Air/Clarity)
      if (settings.eq.enabled && settings.eq.highShelf.gain !== 0) {
        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.value = settings.eq.highShelf.frequency;
        highShelf.gain.value = settings.eq.highShelf.gain;
        currentNode.connect(highShelf);
        currentNode = highShelf;
        nodesRef.current.highShelf = highShelf;
      }

      // 6. Limiter (using compressor with high ratio)
      if (settings.limiter.enabled) {
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = settings.limiter.threshold;
        limiter.ratio.value = 20; // High ratio for limiting
        limiter.attack.value = 0.001;
        limiter.release.value = 0.1;
        limiter.knee.value = 0;
        currentNode.connect(limiter);
        currentNode = limiter;
        nodesRef.current.limiter = limiter;
      }

      // Create output destination
      const destination = ctx.createMediaStreamDestination();
      currentNode.connect(destination);
      nodesRef.current.output = destination;

      // Combine video tracks with processed audio
      const videoTracks = inputStream.getVideoTracks();
      const processedStream = new MediaStream([
        ...videoTracks,
        ...destination.stream.getAudioTracks(),
      ]);

      return processedStream;
    } catch (error) {
      console.error('Studio sound processing error:', error);
      return inputStream;
    }
  }, [settings]);

  // Apply preset
  const applyPreset = useCallback((presetName: string) => {
    const preset = STUDIO_PRESETS[presetName];
    if (preset) {
      setSettings(preset);
      setActivePreset(presetName);
    }
  }, []);

  // Update individual setting
  const updateSettings = useCallback((updates: Partial<StudioSoundSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setActivePreset('custom');
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    Object.values(nodesRef.current).forEach(node => {
      try { node?.disconnect(); } catch (e) { /* ignore */ }
    });
    nodesRef.current = {};
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  }, []);

  return {
    settings,
    activePreset,
    processStream,
    applyPreset,
    updateSettings,
    cleanup,
    presets: STUDIO_PRESETS,
  };
}
