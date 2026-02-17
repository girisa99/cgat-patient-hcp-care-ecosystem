/**
 * Universal Adaptive Hybrid Editor
 * Complete 5-layer architecture for 100+ pipelines
 */

// Types
export * from './types';

// Context
export { EditorProvider, useEditor } from './context/EditorContext';

// Layer Components
export { Layer0ContextBar, BrandKitSelector, ProjectHistory, UserPreferencesQuick, TeamStyleIndicator } from './layers/Layer0Context';
export { Layer1Input, UniversalDropZone, UrlInput, NaturalLanguageInput, InputPreviewCard, AIRouterResultCard } from './layers/Layer1Input';
export { Layer2Pipeline } from './layers/Layer2Pipeline';
export { Layer3Editor, EditorToolbar } from './layers/Layer3Editor';
export { Layer4ActionsSidebar, PreviewPanel, ElementInspector, CreditDashboardPanel, PublishPanel } from './layers/Layer4Actions';
export { Layer5Intelligence, AnalyticsPanel, ABTestingPanel, SuggestionsPanel, RepurposePanel } from './layers/Layer5Intelligence';

// P3 Components - Mode Switching & Transform
export { ModeSwitcher } from './components/ModeSwitcher';
export { transformMode, canvasToTimeline, timelineToCanvas, canvasToDocument } from './services/elementTransformService';

// P4 Components - Real-time Collaboration
export { CollaboratorCursors, getCollaboratorColor } from './components/CollaboratorCursors';
export { PresenceIndicators } from './components/PresenceIndicators';
export { ConflictResolutionDialog } from './components/ConflictResolutionDialog';

// Hooks
export { useAutoSave } from './hooks/useAutoSave';
export { useErrorRecovery } from './hooks/useErrorRecovery';
export { useEditorCollaboration } from './hooks/useEditorCollaboration';

// Infrastructure Fixes - Critical/High/Medium/Low
export { useSupabasePersistence } from './hooks/useSupabasePersistence';
export { useBoundedHistory, createBoundedHistoryReducer } from './hooks/useBoundedHistory';
export { useOfflineQueue, createQueuedFetch } from './hooks/useOfflineQueue';

// Unified Video Service
export { 
  unifiedVideoService,
  generateTextToVideo,
  generateImageToVideo,
  generateAvatarVideo,
  generateLipSyncVideo,
} from './services/unifiedVideoService';
