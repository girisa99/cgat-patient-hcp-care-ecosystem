/**
 * Teleprompter Sync Hook
 * 
 * Calculates word index based on audio progress using weighted timing.
 * Works with both TTS and voiceover audio.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

interface TeleprompterSyncState {
  currentWordIndex: number;
  totalWords: number;
  progress: number; // 0-1
  isActive: boolean;
}

interface UseTeleprompterSyncOptions {
  scriptContent: string | null;
  audioCurrentTime: number;
  audioDuration: number;
  isAudioPlaying: boolean;
  isRecording: boolean;
  isPaused: boolean;
}

export function useTeleprompterSync(options: UseTeleprompterSyncOptions) {
  const {
    scriptContent,
    audioCurrentTime,
    audioDuration,
    isAudioPlaying,
    isRecording,
    isPaused,
  } = options;

  const [state, setState] = useState<TeleprompterSyncState>({
    currentWordIndex: 0,
    totalWords: 0,
    progress: 0,
    isActive: false,
  });

  // Parse words and calculate weights (memoized)
  const wordsRef = useRef<string[]>([]);
  const weightsRef = useRef<number[]>([]);
  const totalWeightRef = useRef<number>(0);

  // Update words when script changes
  useEffect(() => {
    if (scriptContent) {
      const words = scriptContent.split(/\s+/).filter(w => w.length > 0);
      wordsRef.current = words;

      // Calculate weighted durations for each word
      const weights = words.map(word => {
        let weight = word.length;
        if (word.match(/[.!?]$/)) weight += 8; // End of sentence
        else if (word.match(/[,;:]$/)) weight += 4; // Comma
        else if (word.match(/[-–—]$/)) weight += 2; // Dash
        return Math.max(weight, 3);
      });
      weightsRef.current = weights;
      totalWeightRef.current = weights.reduce((sum, w) => sum + w, 0);

      setState(prev => ({
        ...prev,
        totalWords: words.length,
        currentWordIndex: 0,
        progress: 0,
      }));
    } else {
      wordsRef.current = [];
      weightsRef.current = [];
      totalWeightRef.current = 0;
      setState({
        currentWordIndex: 0,
        totalWords: 0,
        progress: 0,
        isActive: false,
      });
    }
  }, [scriptContent]);

  // Calculate word index from audio time
  useEffect(() => {
    const words = wordsRef.current;
    const weights = weightsRef.current;
    const totalWeight = totalWeightRef.current;

    if (words.length === 0 || audioDuration <= 0 || !isAudioPlaying) {
      setState(prev => ({
        ...prev,
        isActive: isRecording && !isPaused,
      }));
      return;
    }

    // Calculate progress with 2% lag for natural reading
    const timeProgress = Math.max(0, (audioCurrentTime / audioDuration) - 0.02);

    let accumulatedWeight = 0;
    let targetIndex = 0;

    for (let i = 0; i < words.length; i++) {
      const progress = accumulatedWeight / totalWeight;
      if (progress >= timeProgress) {
        targetIndex = Math.max(0, i - 1);
        break;
      }
      accumulatedWeight += weights[i];
      targetIndex = i;
    }

    targetIndex = Math.max(0, Math.min(targetIndex, words.length - 1));

    setState({
      currentWordIndex: targetIndex,
      totalWords: words.length,
      progress: audioDuration > 0 ? audioCurrentTime / audioDuration : 0,
      isActive: isRecording && !isPaused,
    });
  }, [audioCurrentTime, audioDuration, isAudioPlaying, isRecording, isPaused]);

  // Reset to beginning
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentWordIndex: 0,
      progress: 0,
    }));
  }, []);

  // Get words array
  const getWords = useCallback(() => wordsRef.current, []);

  return {
    ...state,
    words: wordsRef.current,
    reset,
    getWords,
  };
}
