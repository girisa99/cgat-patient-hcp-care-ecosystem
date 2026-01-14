/**
 * Genie Vibe Components - Export all components for the full studio
 * 
 * Phase 1+2: Recording consolidated into VibeRecordTab
 * Phase 3: Library management in VibeLibraryTab, Cost tracking in VibeCostTracker
 * Phase 4: Meeting Intelligence (wraps MeetingTranscriptPanel), 
 *          Keyboard Shortcuts (wraps KeyboardShortcutsHelp + useKeyboardShortcuts),
 *          Pop-out Window, Device Capabilities
 * 
 * REFACTORED: Phase 4 components wrap existing implementations to avoid duplication
 */

export { VibeRecordTab } from './VibeRecordTab';
export { VibeLibraryTab } from './VibeLibraryTab';
export { VibeCostTracker } from './VibeCostTracker';
export { VibeMeetingIntelligence } from './VibeMeetingIntelligence';
export { VibeKeyboardShortcuts } from './VibeKeyboardShortcuts';
export { VibePopoutButton } from './VibePopoutButton';

// Re-export the device capabilities hook for use in components
export { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
export type { DeviceCapabilities } from '@/hooks/useDeviceCapabilities';
