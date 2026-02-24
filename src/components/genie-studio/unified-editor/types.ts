/**
 * Unified Editor Types
 *
 * Shared types for the unified editing experience across Mind and Cast.
 * The adapter pattern allows Mind (single-script) and Cast (scene-based)
 * to share analysis, enhancement, TTS, brand voice, transcreation, and version history.
 */

import type {
  ScriptStats,
  AnalysisResult,
  AnalysisRecommendation,
  EnhancementChange,
  EnhancementMarkers,
  EngagementScore,
  EnhancementFocus,
  AIProvider,
} from '../script-editor/types';

export type { ScriptStats, AnalysisResult, AnalysisRecommendation, EnhancementChange, EnhancementMarkers, EngagementScore, EnhancementFocus, AIProvider };

/** The content source mode — single script (Mind) or scene-based (Cast) */
export type EditorMode = 'script' | 'scene';

/** Scene metadata when operating in scene mode */
export interface SceneContext {
  sceneId: string;
  sceneIndex: number;
  sceneTitle: string;
  sceneCount: number;
  /** Callback when scene script is modified */
  onScriptUpdate?: (sceneId: string, newText: string) => void;
}

/** Props for the useUnifiedEditorState hook */
export interface UnifiedEditorConfig {
  mode: EditorMode;
  /** The script content to analyze/enhance/check */
  content: string;
  /** Update callback when content changes (e.g. from enhancement apply) */
  onContentChange: (newContent: string) => void;
  /** Scene context when mode === 'scene' */
  sceneContext?: SceneContext;
  /** Product name for enrichment */
  productName?: string;
}

/** Full state returned by useUnifiedEditorState */
export interface UnifiedEditorState {
  // ─── Content ────
  stats: ScriptStats;
  originalStats: ScriptStats | null;
  enhancedStats: ScriptStats | null;

  // ─── Analysis ────
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  showAnalysis: boolean;
  analysisSteps: Array<{ step: string; status: 'pending' | 'running' | 'complete'; detail?: string }>;
  showProgressiveAnalysis: boolean;
  handleAnalyze: () => Promise<void>;
  handleApplyAnalysisFix: (original: string, suggested: string) => void;
  handleUpdateRecommendation: (recId: string, accepted: boolean) => void;
  handleNoteAll: () => void;
  setShowAnalysis: (show: boolean) => void;

  // ─── Enhancement ────
  isEnhancing: boolean;
  enhancedContent: string | null;
  enhancementChanges: EnhancementChange[];
  showEnhancementReview: boolean;
  reviewProgress: number;
  enhancementMarkers: EnhancementMarkers | null;
  engagementScore: EngagementScore | null;
  showEnhancementDialog: boolean;
  enhancementFocus: EnhancementFocus;
  customEnhancementInstructions: string;
  openEnhancementDialog: () => void;
  handleEnhance: (useCustom?: boolean) => Promise<void>;
  handleAcceptChange: (id: string) => void;
  handleSkipChange: (id: string) => void;
  handleAcceptAll: () => void;
  handleSkipAll: () => void;
  handleCompleteEnhancement: () => void;
  setShowEnhancementDialog: (show: boolean) => void;
  setShowEnhancementReview: (show: boolean) => void;
  setEnhancementFocus: (focus: EnhancementFocus) => void;
  setCustomEnhancementInstructions: (inst: string) => void;
  editingChangeId: string | null;
  editedEnhancedText: string;
  handleStartEdit: (changeId: string, text: string) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: (changeId: string, original: string, editedText: string) => void;
  handleApplyEnhancementChange: (original: string, enhanced: string) => void;

  // ─── AI Provider ────
  aiProvider: AIProvider;
  setAiProvider: (p: AIProvider) => void;

  // ─── Transcreation ────
  showTranscreation: boolean;
  setShowTranscreation: (show: boolean) => void;
  handleApplyTranscreation: (text: string, lang: string) => void;

  // ─── Brand Voice ────
  showBrandVoice: boolean;
  setShowBrandVoice: (show: boolean) => void;

  // ─── Version History ────
  showVersionHistory: boolean;
  setShowVersionHistory: (show: boolean) => void;
  scriptVersions: Array<{
    id: string;
    versionNumber: number;
    content: string;
    versionType: 'original' | 'enhanced' | 'manual_edit' | 'transcreation';
    changeSummary: string;
    createdAt: number;
    wordCount: number;
    enhancedContent?: string;
  }>;
  handleRestoreVersion: (version: any) => void;
  addVersionEntry: (content: string, type: 'original' | 'enhanced' | 'manual_edit' | 'transcreation', summary: string) => void;
}
