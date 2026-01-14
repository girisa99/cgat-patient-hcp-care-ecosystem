/**
 * Genie Vibe Components - Export all components for the full studio
 * 
 * Phase 1+2: Recording consolidated into VibeRecordTab
 * Phase 3: Library management in VibeLibraryTab, Cost tracking via UnifiedCostPanel
 * Phase 4: Meeting Intelligence (wraps MeetingTranscriptPanel), 
 *          Keyboard Shortcuts (wraps KeyboardShortcutsHelp + useKeyboardShortcuts),
 *          Pop-out Window, Device Capabilities
 * Phase 5: Mobile UX - VibeMobileLayout (3-tab simplified mobile experience)
 * 
 * REFACTORED: 
 * - Phase 4 components wrap existing implementations to avoid duplication
 * - VibeCostTracker + ProjectAssetBreakdown → UnifiedCostPanel
 * - RecordingLibraryPanel → wraps VibeLibraryTab
 * - VibeMobileLayout → Simplified 3-tab mobile (Record | Edit | Export)
 */

export { VibeRecordTab } from './VibeRecordTab';
export { VibeLibraryTab } from './VibeLibraryTab';
export { VibeCostTracker } from './VibeCostTracker';
export { VibeMeetingIntelligence } from './VibeMeetingIntelligence';
export { VibeKeyboardShortcuts } from './VibeKeyboardShortcuts';
export { VibePopoutButton } from './VibePopoutButton';
export { VibeMobileLayout } from './VibeMobileLayout';

// Re-export unified cost panel
export { UnifiedCostPanel } from '@/components/shared/UnifiedCostPanel';

// Re-export the device capabilities hook for use in components
export { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
export type { DeviceCapabilities } from '@/hooks/useDeviceCapabilities';
