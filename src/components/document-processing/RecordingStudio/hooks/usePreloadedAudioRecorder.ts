/**
 * Pre-loaded Audio Recorder Hook
 * 
 * SIMPLIFIED AUDIO-FIRST APPROACH:
 * 1. Pre-load all audio files BEFORE recording starts
 * 2. Create a single mixed audio stream (TTS/voiceover + music + mic)
 * 3. Combine with video stream to create ONE complete recording stream
 * 4. Pass to MediaRecorder - no mid-recording audio connection needed!
 * 
 * This eliminates:
 * - connectAudio() complexity
 * - pendingAudioRef
 * - stale closure issues
 * - Audio timing problems
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface AudioSource {
  url: string;
  name: string;
  volume: number;
  loop?: boolean;
}

interface PreloadedAudio {
  element: HTMLAudioElement;
  source: AudioSource;
  loaded: boolean;
  error?: string;
}

interface PreloadedAudioRecorderState {
  isPreloading: boolean;
  isReady: boolean;
  error: string | null;
  preloadedCount: number;
  totalCount: number;
}

interface AudioConfig {
  tts?: AudioSource | null;
  music?: AudioSource | null;
}

interface UsePreloadedAudioRecorderOptions {
  /** Microphone stream from camera */
  micStream?: MediaStream | null;
  /** Video stream (camera/screen) */
  videoStream?: MediaStream | null;
  /** Audio configuration */
  audioConfig?: AudioConfig;
  /** Music ducking when TTS/voiceover plays */
  enableDucking?: boolean;
  /** Ducked volume for music (0-1) */
  duckedVolume?: number;
}

export function usePreloadedAudioRecorder(options: UsePreloadedAudioRecorderOptions = {}) {
  const {
    micStream,
    videoStream,
    audioConfig,
    enableDucking = true,
    duckedVolume = 0.08,
  } = options;

  const [state, setState] = useState<PreloadedAudioRecorderState>({
    isPreloading: false,
    isReady: false,
    error: null,
    preloadedCount: 0,
    totalCount: 0,
  });

  // Audio context and nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const micGainRef = useRef<GainNode | null>(null);
  const ttsGainRef = useRef<GainNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);

  // Preloaded audio elements
  const ttsAudioRef = useRef<PreloadedAudio | null>(null);
  const musicAudioRef = useRef<PreloadedAudio | null>(null);

  // Source nodes (connected to context)
  const ttsSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const musicSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Combined stream for recording
  const combinedStreamRef = useRef<MediaStream | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /**
   * Preload a single audio file
   */
  const preloadAudio = useCallback((source: AudioSource): Promise<PreloadedAudio> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      
      const preloaded: PreloadedAudio = {
        element: audio,
        source,
        loaded: false,
      };

      audio.oncanplaythrough = () => {
        preloaded.loaded = true;
        console.log(`[PreloadedAudio] ✅ Loaded: ${source.name}`);
        resolve(preloaded);
      };

      audio.onerror = () => {
        preloaded.error = `Failed to load: ${source.name}`;
        console.error(`[PreloadedAudio] ❌ Failed: ${source.name}`);
        resolve(preloaded);
      };

      // Set volume and loop
      audio.volume = source.volume;
      audio.loop = source.loop || false;

      // Start loading
      audio.src = source.url;
      audio.load();

      // Timeout fallback
      setTimeout(() => {
        if (!preloaded.loaded && !preloaded.error) {
          preloaded.loaded = true; // Assume loaded
          resolve(preloaded);
        }
      }, 5000);
    });
  }, []);

  /**
   * Initialize audio context and create mixed stream
   */
  const initializeAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    // Create destination for mixed output
    destinationRef.current = ctx.createMediaStreamDestination();

    // Create gain nodes for volume control
    micGainRef.current = ctx.createGain();
    ttsGainRef.current = ctx.createGain();
    musicGainRef.current = ctx.createGain();

    // Connect gains to destination
    micGainRef.current.connect(destinationRef.current);
    ttsGainRef.current.connect(destinationRef.current);
    musicGainRef.current.connect(destinationRef.current);

    // Set initial volumes
    micGainRef.current.gain.value = 1.0;
    ttsGainRef.current.gain.value = 1.0;
    musicGainRef.current.gain.value = 0.3; // Background music quieter

    console.log('[PreloadedAudio] AudioContext initialized');
    return ctx;
  }, []);

  /**
   * Connect microphone to mixer
   */
  const connectMicrophone = useCallback((stream: MediaStream) => {
    const ctx = audioContextRef.current;
    if (!ctx || !micGainRef.current) return;

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.log('[PreloadedAudio] No mic audio tracks');
      return;
    }

    // Disconnect existing
    if (micSourceRef.current) {
      try { micSourceRef.current.disconnect(); } catch (e) { /* ignore */ }
    }

    // Create new source from mic
    const micOnlyStream = new MediaStream([audioTracks[0]]);
    micSourceRef.current = ctx.createMediaStreamSource(micOnlyStream);
    micSourceRef.current.connect(micGainRef.current);

    console.log('[PreloadedAudio] ✅ Microphone connected');
  }, []);

  /**
   * Connect preloaded audio element to mixer using captureStream
   */
  const connectAudioToMixer = useCallback((
    audio: HTMLAudioElement,
    gainNode: GainNode,
    type: 'tts' | 'music'
  ): MediaStreamAudioSourceNode | null => {
    const ctx = audioContextRef.current;
    if (!ctx) return null;

    try {
      // Use captureStream for reliable capture
      // @ts-ignore - captureStream not in all TS definitions
      const stream: MediaStream = audio.captureStream ? audio.captureStream() : audio.mozCaptureStream?.();

      if (!stream) {
        console.warn(`[PreloadedAudio] captureStream not available for ${type}`);
        return null;
      }

      const source = ctx.createMediaStreamSource(stream);
      source.connect(gainNode);

      console.log(`[PreloadedAudio] ✅ ${type} connected to mixer`);
      return source;
    } catch (err: any) {
      console.error(`[PreloadedAudio] Failed to connect ${type}:`, err.message);
      return null;
    }
  }, []);

  /**
   * MAIN: Preload all audio and prepare for recording
   */
  const prepare = useCallback(async (config: AudioConfig): Promise<boolean> => {
    console.log('[PreloadedAudio] Preparing audio...', config);

    setState(prev => ({ ...prev, isPreloading: true, error: null }));

    try {
      // Initialize audio context
      const ctx = initializeAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Count sources to preload
      const toPreload: { source: AudioSource; type: 'tts' | 'music' }[] = [];
      if (config.tts?.url) toPreload.push({ source: config.tts, type: 'tts' });
      if (config.music?.url) toPreload.push({ source: config.music, type: 'music' });

      setState(prev => ({ ...prev, totalCount: toPreload.length }));

      // Preload all audio in parallel
      const results = await Promise.all(
        toPreload.map(async ({ source, type }) => {
          const preloaded = await preloadAudio(source);
          setState(prev => ({ ...prev, preloadedCount: prev.preloadedCount + 1 }));
          return { preloaded, type };
        })
      );

      // Store preloaded audio
      for (const { preloaded, type } of results) {
        if (type === 'tts') {
          ttsAudioRef.current = preloaded;
          // Connect to mixer
          if (preloaded.loaded && ttsGainRef.current) {
            ttsSourceRef.current = connectAudioToMixer(
              preloaded.element,
              ttsGainRef.current,
              'tts'
            );
          }
        } else if (type === 'music') {
          musicAudioRef.current = preloaded;
          if (preloaded.loaded && musicGainRef.current) {
            musicSourceRef.current = connectAudioToMixer(
              preloaded.element,
              musicGainRef.current,
              'music'
            );
          }
        }
      }

      // Connect microphone if available
      if (micStream) {
        connectMicrophone(micStream);
      }

      // Set duration from TTS audio
      if (ttsAudioRef.current?.element) {
        setDuration(ttsAudioRef.current.element.duration || 0);
      }

      setState(prev => ({ ...prev, isPreloading: false, isReady: true }));
      console.log('[PreloadedAudio] ✅ All audio prepared');
      return true;

    } catch (err: any) {
      console.error('[PreloadedAudio] Prepare failed:', err);
      setState(prev => ({
        ...prev,
        isPreloading: false,
        error: err.message || 'Failed to prepare audio',
      }));
      return false;
    }
  }, [initializeAudioContext, preloadAudio, connectAudioToMixer, connectMicrophone, micStream]);

  /**
   * Get the combined recording stream (video + mixed audio)
   */
  const getRecordingStream = useCallback((): MediaStream | null => {
    if (!destinationRef.current) {
      console.warn('[PreloadedAudio] No audio destination available');
      return videoStream || null;
    }

    const videoTracks = videoStream?.getVideoTracks() || [];
    const audioTracks = destinationRef.current.stream.getAudioTracks();

    if (videoTracks.length === 0 && audioTracks.length === 0) {
      console.warn('[PreloadedAudio] No tracks available');
      return null;
    }

    // Combine video + mixed audio
    const combined = new MediaStream([...videoTracks, ...audioTracks]);
    combinedStreamRef.current = combined;

    console.log('[PreloadedAudio] Combined stream:', {
      videoTracks: videoTracks.length,
      audioTracks: audioTracks.length,
    });

    return combined;
  }, [videoStream]);

  /**
   * Start playback of all preloaded audio
   */
  const startPlayback = useCallback(async () => {
    console.log('[PreloadedAudio] Starting playback...');

    const promises: Promise<void>[] = [];

    // Start TTS/voiceover
    if (ttsAudioRef.current?.element && ttsAudioRef.current.loaded) {
      ttsAudioRef.current.element.currentTime = 0;
      promises.push(
        ttsAudioRef.current.element.play().catch(err => {
          console.error('[PreloadedAudio] TTS play failed:', err);
        })
      );

      // Apply ducking to music when TTS plays
      if (enableDucking && musicGainRef.current) {
        musicGainRef.current.gain.value = duckedVolume;
      }
    }

    // Start music
    if (musicAudioRef.current?.element && musicAudioRef.current.loaded) {
      musicAudioRef.current.element.currentTime = 0;
      promises.push(
        musicAudioRef.current.element.play().catch(err => {
          console.error('[PreloadedAudio] Music play failed:', err);
        })
      );
    }

    await Promise.all(promises);
    setIsPlaying(true);
    console.log('[PreloadedAudio] ✅ Playback started');
  }, [enableDucking, duckedVolume]);

  /**
   * Pause all audio
   */
  const pausePlayback = useCallback(() => {
    ttsAudioRef.current?.element?.pause();
    musicAudioRef.current?.element?.pause();
    setIsPlaying(false);
  }, []);

  /**
   * Resume all audio
   */
  const resumePlayback = useCallback(() => {
    ttsAudioRef.current?.element?.play();
    musicAudioRef.current?.element?.play();
    setIsPlaying(true);
  }, []);

  /**
   * Stop and reset all audio
   */
  const stopPlayback = useCallback(() => {
    if (ttsAudioRef.current?.element) {
      ttsAudioRef.current.element.pause();
      ttsAudioRef.current.element.currentTime = 0;
    }
    if (musicAudioRef.current?.element) {
      musicAudioRef.current.element.pause();
      musicAudioRef.current.element.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  /**
   * Update current time (for teleprompter sync)
   */
  useEffect(() => {
    if (!isPlaying || !ttsAudioRef.current?.element) return;

    const audio = ttsAudioRef.current.element;
    const interval = setInterval(() => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);

      // Restore music volume when TTS ends
      if (audio.ended && enableDucking && musicGainRef.current) {
        musicGainRef.current.gain.value = 0.3;
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, enableDucking]);

  /**
   * Cleanup
   */
  const cleanup = useCallback(() => {
    console.log('[PreloadedAudio] Cleaning up...');

    // Stop and clear audio elements
    if (ttsAudioRef.current?.element) {
      ttsAudioRef.current.element.pause();
      ttsAudioRef.current.element.src = '';
    }
    if (musicAudioRef.current?.element) {
      musicAudioRef.current.element.pause();
      musicAudioRef.current.element.src = '';
    }

    // Disconnect sources
    try { ttsSourceRef.current?.disconnect(); } catch (e) { /* ignore */ }
    try { musicSourceRef.current?.disconnect(); } catch (e) { /* ignore */ }
    try { micSourceRef.current?.disconnect(); } catch (e) { /* ignore */ }

    // Close context
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) { /* ignore */ }
      audioContextRef.current = null;
    }

    // Clear refs
    ttsAudioRef.current = null;
    musicAudioRef.current = null;
    ttsSourceRef.current = null;
    musicSourceRef.current = null;
    micSourceRef.current = null;
    destinationRef.current = null;
    combinedStreamRef.current = null;

    setState({
      isPreloading: false,
      isReady: false,
      error: null,
      preloadedCount: 0,
      totalCount: 0,
    });

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    console.log('[PreloadedAudio] ✅ Cleanup complete');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Re-connect mic when it changes
  useEffect(() => {
    if (micStream && audioContextRef.current) {
      connectMicrophone(micStream);
    }
  }, [micStream, connectMicrophone]);

  return {
    // State
    state,
    isPlaying,
    currentTime,
    duration,

    // Methods
    prepare,
    getRecordingStream,
    startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    cleanup,

    // Direct access to audio elements (for teleprompter sync)
    ttsAudio: ttsAudioRef.current?.element || null,
    musicAudio: musicAudioRef.current?.element || null,
  };
}
