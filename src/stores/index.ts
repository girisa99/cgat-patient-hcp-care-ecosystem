/**
 * Stores — Zustand Global State
 *
 * Layer 1 of the state management architecture:
 *   Layer 1: Zustand  → Global shared state (stores/)
 *   Layer 2: XState   → Workflow orchestration (machines/)
 *   Layer 3: useReducer → Complex component state (per-component)
 */

export { useGenieStudioStore, useP2Settings, useAIPreferences, useCurrentTool, usePipelineContent, useFeedbackStats } from './useGenieStudioStore';
export type { GenieTool, SharedContent, P2EnhancementSettings, AIPreferences, FeedbackStats } from './useGenieStudioStore';

export { useUIStore, useThemeMode, useSidebarState, useDockState } from './useUIStore';
export type { ThemeMode, DockPosition, SidebarState } from './useUIStore';
