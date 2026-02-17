/**
 * Keyboard Shortcuts Hook for Recording Studio
 * Provides hotkey support for common recording actions
 */

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onPauseRecording?: () => void;
  onToggleCamera?: () => void;
  onToggleMic?: () => void;
  onToggleTeleprompter?: () => void;
  onToggleBlur?: () => void;
  onTrimLast5s?: () => void;
  isRecording: boolean;
  isPaused: boolean;
  isEnabled?: boolean;
}

interface ShortcutInfo {
  key: string;
  description: string;
  action: string;
}

export const SHORTCUTS: ShortcutInfo[] = [
  { key: 'Space', description: 'Start/Stop Recording', action: 'toggle-recording' },
  { key: 'P', description: 'Pause/Resume Recording', action: 'pause' },
  { key: 'C', description: 'Toggle Camera', action: 'camera' },
  { key: 'M', description: 'Toggle Microphone', action: 'mic' },
  { key: 'T', description: 'Toggle Teleprompter', action: 'teleprompter' },
  { key: 'B', description: 'Toggle Background Blur', action: 'blur' },
  { key: 'Backspace', description: 'Trim Last 5 Seconds', action: 'trim' },
  { key: 'Escape', description: 'Stop Recording', action: 'stop' },
];

export function useKeyboardShortcuts({
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onToggleCamera,
  onToggleMic,
  onToggleTeleprompter,
  onToggleBlur,
  onTrimLast5s,
  isRecording,
  isPaused,
  isEnabled = true,
}: KeyboardShortcutsConfig) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;
    
    // Ignore if typing in an input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = event.key.toLowerCase();
    const isShift = event.shiftKey;
    const isCtrl = event.ctrlKey || event.metaKey;

    // Prevent default for our shortcuts
    const preventKeys = [' ', 'p', 'c', 'm', 't', 'b', 'backspace', 'escape'];
    if (preventKeys.includes(key) && !isCtrl) {
      event.preventDefault();
    }

    switch (key) {
      case ' ': // Spacebar - Start/Stop Recording
        if (isRecording) {
          onStopRecording?.();
        } else {
          onStartRecording?.();
        }
        break;
        
      case 'p': // P - Pause/Resume
        if (isRecording) {
          onPauseRecording?.();
        }
        break;
        
      case 'c': // C - Toggle Camera
        if (!isRecording) {
          onToggleCamera?.();
        }
        break;
        
      case 'm': // M - Toggle Mic
        onToggleMic?.();
        break;
        
      case 't': // T - Toggle Teleprompter
        onToggleTeleprompter?.();
        break;
        
      case 'b': // B - Toggle Blur
        onToggleBlur?.();
        break;
        
      case 'backspace': // Backspace - Trim last 5 seconds
        if (isRecording && isPaused) {
          onTrimLast5s?.();
        }
        break;
        
      case 'escape': // Escape - Stop Recording
        if (isRecording) {
          onStopRecording?.();
        }
        break;
    }
  }, [
    isEnabled,
    isRecording,
    isPaused,
    onStartRecording,
    onStopRecording,
    onPauseRecording,
    onToggleCamera,
    onToggleMic,
    onToggleTeleprompter,
    onToggleBlur,
    onTrimLast5s,
  ]);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isEnabled]);

  return { shortcuts: SHORTCUTS };
}
