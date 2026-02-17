/**
 * VibeKeyboardShortcuts - Thin wrapper around existing KeyboardShortcutsHelp
 * 
 * REFACTORED: Uses existing component + hook to avoid duplication
 * - Re-exports KeyboardShortcutsHelp for Genie Vibe
 * - Adds the useKeyboardShortcuts hook integration
 */

import React from 'react';
import { KeyboardShortcutsHelp } from '@/components/document-processing/RecordingStudio/components/KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '@/components/document-processing/RecordingStudio/hooks/useKeyboardShortcuts';
import { useIsMobile } from '@/hooks/use-mobile';

interface VibeKeyboardShortcutsProps {
  isRecording: boolean;
  isPaused: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onPauseRecording?: () => void;
  onToggleCamera?: () => void;
  onToggleMic?: () => void;
  onToggleTeleprompter?: () => void;
  onToggleBlur?: () => void;
  onTrimLast5s?: () => void;
  className?: string;
}

export function VibeKeyboardShortcuts({
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
  className,
}: VibeKeyboardShortcutsProps) {
  const isMobile = useIsMobile();
  
  // Activate keyboard shortcuts (hook handles event listeners)
  useKeyboardShortcuts({
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
    isEnabled: !isMobile, // Disable on mobile
  });
  
  // Don't show on mobile (keyboard shortcuts aren't useful)
  if (isMobile) {
    return null;
  }
  
  // Render the existing help component
  return <KeyboardShortcutsHelp isRecording={isRecording} />;
}

export default VibeKeyboardShortcuts;
