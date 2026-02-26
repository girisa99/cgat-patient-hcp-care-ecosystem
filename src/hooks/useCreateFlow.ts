/**
 * useCreateFlow — Unified React Hook for CREATE Flow (Phase 4C-E)
 *
 * Master hook that orchestrates the entire CREATE tab experience:
 * - 16 script generation modes wired to pipeline orchestrator
 * - Transcreation as first-class citizen with inline preview
 * - Multi-format output selection with cross-format conversion
 * - Universal enrichment VISIBLE at every touchpoint
 * - Language I/O: input (1) → output (max 5, default English)
 * - Inline editing at EVERY field: accept / reject / update / enhance / analyze
 * - Statement-level control (edit individual sentences)
 * - Auto-save with debounce (never lose progress)
 * - 50-level undo/redo per field AND global
 * - Session persistence (close browser → resume)
 * - Checkpoint restore on pipeline failures
 *
 * @see src/services/createFlowOrchestrator.ts — pure functions
 * @see src/services/pipelineOrchestrator.ts — pipeline chains
 * @see src/hooks/useUniversalEnrichment.ts — enrichment data
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { ContentFormat, ContentIntent, InputType } from '@/services/pipelineOrchestrator';
import { selectChain, buildOrchestrationPlan } from '@/services/pipelineOrchestrator';
import type {
  ScriptGenerationMode,
  LanguageIOConfig,
  LanguageSelection,
  EnrichmentVisibility,
  InlineEditableField,
  InlineEditAction,
  StatementLevelEdit,
  CreateFlowSession,
  CreateFlowStep,
  OutputFormatConfig,
} from '@/services/createFlowOrchestrator';
import {
  SCRIPT_GEN_MODES,
  OUTPUT_FORMAT_CONFIGS,
  DEFAULT_OUTPUT_LANGUAGE,
  MAX_OUTPUT_LANGUAGES,
  createNewSession,
  navigateToStep,
  toggleEnrichmentField as toggleEnrichmentFieldFn,
  addOutputLanguage as addOutputLanguageFn,
  removeOutputLanguage as removeOutputLanguageFn,
  setAdaptationLevel as setAdaptationLevelFn,
  toggleOutputFormat as toggleOutputFormatFn,
  buildPlanFromSession,
  buildEnrichmentVisibility,
  createEditableField,
  applyInlineEdit,
  undoFieldEdit,
  redoFieldEdit,
  splitIntoStatements,
  saveSession,
  loadCurrentSession,
  loadAllSessions,
  deleteSession,
  getAvailableModes,
  getSimpleModes,
  getFormatsByCategory,
  getAvailableConversions,
} from '@/services/createFlowOrchestrator';
import type { ContentScenario, SceneStyle, CompositionElementType, CrossFormatConversionType } from '@/components/genie-hub/composition-studio/types';

// ─── Auto-Save Debounce ──────────────────────────────────────────────────────

const AUTO_SAVE_DELAY = 2000; // 2 seconds debounce

// ─── Hook Return Type ────────────────────────────────────────────────────────

export interface UseCreateFlowReturn {
  // ─── Session State ──────────────────────────────────────────────────────
  session: CreateFlowSession;
  isNewSession: boolean;
  hasUnsavedChanges: boolean;
  savedSessions: Array<{ id: string; title: string; lastSaved: string; step: CreateFlowStep }>;

  // ─── Navigation ─────────────────────────────────────────────────────────
  currentStep: CreateFlowStep;
  completedSteps: CreateFlowStep[];
  canGoNext: boolean;
  canGoPrev: boolean;
  goToStep: (step: CreateFlowStep) => void;
  goNext: () => void;
  goPrev: () => void;
  /** Steps with their status for progress display */
  stepStatus: Array<{
    step: CreateFlowStep;
    label: string;
    status: 'completed' | 'current' | 'upcoming' | 'locked';
    hasErrors: boolean;
  }>;

  // ─── Step 1: Input Mode ─────────────────────────────────────────────────
  inputMode: ScriptGenerationMode;
  setInputMode: (mode: ScriptGenerationMode) => void;
  inputContent: string;
  setInputContent: (content: string) => void;
  setInputFile: (file: { name: string; type: string; size: number; url?: string }) => void;
  setBusinessInfo: (name: string, location: string) => void;
  availableModes: typeof SCRIPT_GEN_MODES;
  simpleModes: ReturnType<typeof getSimpleModes>;

  // ─── Step 2: Enrichment Visibility ──────────────────────────────────────
  enrichment: EnrichmentVisibility;
  toggleEnrichmentField: (section: string, field: string) => void;
  refreshEnrichment: () => void;
  /** The assembled prompt the user can preview */
  promptPreview: string;
  enrichmentScore: number;

  // ─── Step 3: Script Editing ─────────────────────────────────────────────
  scriptLines: CreateFlowSession['script']['lines'];
  scriptTitle: InlineEditableField;
  scriptSynopsis: InlineEditableField;
  /** Edit a specific script line's text */
  editScriptLine: (lineIndex: number, action: InlineEditAction, newValue: string) => void;
  /** Edit script title */
  editTitle: (action: InlineEditAction, newValue: string) => void;
  /** Edit script synopsis */
  editSynopsis: (action: InlineEditAction, newValue: string) => void;
  /** Edit a specific statement within a line */
  editStatement: (lineIndex: number, statementIndex: number, action: InlineEditAction, newValue: string) => void;
  /** Undo/redo for a specific field */
  undoField: (fieldId: string) => void;
  redoField: (fieldId: string) => void;
  /** AI suggestions for the script */
  aiSuggestions: CreateFlowSession['script']['aiSuggestions'];

  // ─── Step 4: Language I/O ───────────────────────────────────────────────
  languageIO: LanguageIOConfig;
  inputLanguage: LanguageSelection;
  outputLanguages: LanguageSelection[];
  setInputLanguage: (lang: LanguageSelection) => void;
  addOutputLanguage: (lang: LanguageSelection) => void;
  removeOutputLanguage: (code: string) => void;
  canAddMoreLanguages: boolean;
  toggleTranscreation: () => void;
  setAdaptationLevel: (langCode: string, level: 'light' | 'moderate' | 'deep') => void;

  // ─── Step 5: Format Selection ───────────────────────────────────────────
  selectedFormats: ContentFormat[];
  toggleFormat: (format: ContentFormat) => void;
  formatConfigs: CreateFlowSession['formatConfigs'];
  updateFormatConfig: (format: ContentFormat, config: Partial<{ aspectRatio: string; duration: number; quality: string; crossFormatConversions: CrossFormatConversionType[] }>) => void;
  formatsByCategory: Record<string, OutputFormatConfig[]>;
  availableConversions: CrossFormatConversionType[];

  // ─── Step 6: Style & Scenario ───────────────────────────────────────────
  scenario: ContentScenario;
  setScenario: (scenario: ContentScenario) => void;
  sceneStyle: SceneStyle;
  setSceneStyle: (style: SceneStyle) => void;
  visualElements: CompositionElementType[];
  setVisualElements: (elements: CompositionElementType[]) => void;
  setPerSceneOverride: (sceneId: string, override: { style?: SceneStyle; elements?: CompositionElementType[]; framework?: string }) => void;

  // ─── Step 7: Review ─────────────────────────────────────────────────────
  reviewSummary: CreateFlowSession['review'];
  estimatedCredits: number;
  estimatedDuration: number;
  warnings: string[];
  isReadyToProduce: boolean;

  // ─── Intent ─────────────────────────────────────────────────────────────
  intent: ContentIntent;
  setIntent: (intent: ContentIntent) => void;

  // ─── Session Management ─────────────────────────────────────────────────
  saveNow: () => void;
  loadSession: (sessionId: string) => void;
  newSession: () => void;
  deleteSavedSession: (sessionId: string) => void;
  resetSession: () => void;

  // ─── Mode Toggle ────────────────────────────────────────────────────────
  isSimpleMode: boolean;
  isAdvancedMode: boolean;
  toggleMode: () => void;

  // ─── Global Undo/Redo ───────────────────────────────────────────────────
  canUndo: boolean;
  canRedo: boolean;
  globalUndo: () => void;
  globalRedo: () => void;
}

// ─── Step Configuration ──────────────────────────────────────────────────────

const STEP_ORDER: CreateFlowStep[] = ['input', 'enrichment', 'script', 'language', 'format', 'style', 'review', 'producing'];

const STEP_LABELS: Record<CreateFlowStep, string> = {
  input: 'Input',
  enrichment: 'Enrichment',
  script: 'Script',
  language: 'Languages',
  format: 'Format',
  style: 'Style',
  review: 'Review',
  producing: 'Produce',
};

// Simple mode skips enrichment and style steps
const SIMPLE_STEP_ORDER: CreateFlowStep[] = ['input', 'script', 'language', 'format', 'review', 'producing'];

// ─── The Hook ────────────────────────────────────────────────────────────────

export function useCreateFlow(
  initialTier: string = 'free',
  initialMode: 'simple' | 'advanced' = 'simple',
): UseCreateFlowReturn {
  // ─── Core Session State ─────────────────────────────────────────────────
  const [session, setSession] = useState<CreateFlowSession>(() => {
    // Try to restore previous session
    const saved = loadCurrentSession();
    if (saved) return saved;
    return createNewSession(initialMode, initialTier);
  });

  const [isNewSession, setIsNewSession] = useState(!loadCurrentSession());
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Auto-Save Effect ──────────────────────────────────────────────────
  useEffect(() => {
    if (!session.isDirty) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveSession(session);
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [session]);

  // ─── Update Helper (triggers auto-save via isDirty) ─────────────────────
  const updateSession = useCallback((updater: (prev: CreateFlowSession) => CreateFlowSession) => {
    setSession(prev => {
      const next = updater(prev);
      return { ...next, isDirty: true, lastSavedAt: new Date().toISOString() };
    });
  }, []);

  // ─── Navigation ─────────────────────────────────────────────────────────
  const activeStepOrder = session.mode === 'simple' ? SIMPLE_STEP_ORDER : STEP_ORDER;
  const currentStepIndex = activeStepOrder.indexOf(session.currentStep);

  const canGoNext = currentStepIndex < activeStepOrder.length - 2; // -2 because 'producing' is auto
  const canGoPrev = currentStepIndex > 0;

  const goToStep = useCallback((step: CreateFlowStep) => {
    updateSession(prev => navigateToStep(prev, step));
  }, [updateSession]);

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    const nextStep = activeStepOrder[currentStepIndex + 1];
    goToStep(nextStep);
  }, [canGoNext, currentStepIndex, activeStepOrder, goToStep]);

  const goPrev = useCallback(() => {
    if (!canGoPrev) return;
    const prevStep = activeStepOrder[currentStepIndex - 1];
    goToStep(prevStep);
  }, [canGoPrev, currentStepIndex, activeStepOrder, goToStep]);

  const stepStatus = useMemo(() => {
    return activeStepOrder.map((step, index) => ({
      step,
      label: STEP_LABELS[step],
      status: (
        session.completedSteps.includes(step) ? 'completed' :
        step === session.currentStep ? 'current' :
        index < currentStepIndex ? 'completed' :
        'upcoming'
      ) as 'completed' | 'current' | 'upcoming' | 'locked',
      hasErrors: false,
    }));
  }, [activeStepOrder, session.completedSteps, session.currentStep, currentStepIndex]);

  // ─── Step 1: Input ──────────────────────────────────────────────────────
  const setInputMode = useCallback((mode: ScriptGenerationMode) => {
    updateSession(prev => ({
      ...prev,
      input: { ...prev.input, mode },
    }));
  }, [updateSession]);

  const setInputContent = useCallback((content: string) => {
    updateSession(prev => ({
      ...prev,
      input: { ...prev.input, content },
    }));
  }, [updateSession]);

  const setInputFile = useCallback((file: { name: string; type: string; size: number; url?: string }) => {
    updateSession(prev => ({
      ...prev,
      input: { ...prev.input, file },
    }));
  }, [updateSession]);

  const setBusinessInfo = useCallback((name: string, location: string) => {
    updateSession(prev => ({
      ...prev,
      input: { ...prev.input, businessName: name, businessLocation: location },
    }));
  }, [updateSession]);

  // ─── Step 2: Enrichment ─────────────────────────────────────────────────
  const toggleEnrichmentField = useCallback((section: string, field: string) => {
    updateSession(prev =>
      toggleEnrichmentFieldFn(prev, section as keyof Omit<EnrichmentVisibility, 'assembledPromptPreview' | 'enrichmentScore'>, field),
    );
  }, [updateSession]);

  const refreshEnrichment = useCallback(() => {
    // Re-build enrichment from current data sources
    updateSession(prev => ({
      ...prev,
      enrichment: buildEnrichmentVisibility(),
    }));
  }, [updateSession]);

  // ─── Step 3: Script Editing ─────────────────────────────────────────────
  const editScriptLine = useCallback((lineIndex: number, action: InlineEditAction, newValue: string) => {
    updateSession(prev => {
      const lines = [...prev.script.lines];
      if (!lines[lineIndex]) return prev;
      const line = { ...lines[lineIndex] };
      line.editState = applyInlineEdit(line.editState, action, newValue, 'user');
      line.text = newValue;
      line.statements = splitIntoStatements(newValue, prev.languageIO.inputLanguage.code);
      lines[lineIndex] = line;

      // Push to global undo stack
      const undoEntry = {
        step: 'script' as CreateFlowStep,
        fieldId: `line_${lineIndex}`,
        oldValue: prev.script.lines[lineIndex].text,
        newValue,
        timestamp: new Date().toISOString(),
      };

      return {
        ...prev,
        script: { ...prev.script, lines },
        undoStack: [...prev.undoStack.slice(-49), undoEntry],
        redoStack: [],
      };
    });
  }, [updateSession]);

  const editTitle = useCallback((action: InlineEditAction, newValue: string) => {
    updateSession(prev => {
      const undoEntry = {
        step: 'script' as CreateFlowStep,
        fieldId: 'title',
        oldValue: prev.script.title.value,
        newValue,
        timestamp: new Date().toISOString(),
      };
      return {
        ...prev,
        script: {
          ...prev.script,
          title: applyInlineEdit(prev.script.title, action, newValue, 'user'),
        },
        undoStack: [...prev.undoStack.slice(-49), undoEntry],
        redoStack: [],
      };
    });
  }, [updateSession]);

  const editSynopsis = useCallback((action: InlineEditAction, newValue: string) => {
    updateSession(prev => {
      const undoEntry = {
        step: 'script' as CreateFlowStep,
        fieldId: 'synopsis',
        oldValue: prev.script.synopsis.value,
        newValue,
        timestamp: new Date().toISOString(),
      };
      return {
        ...prev,
        script: {
          ...prev.script,
          synopsis: applyInlineEdit(prev.script.synopsis, action, newValue, 'user'),
        },
        undoStack: [...prev.undoStack.slice(-49), undoEntry],
        redoStack: [],
      };
    });
  }, [updateSession]);

  const editStatement = useCallback((lineIndex: number, statementIndex: number, action: InlineEditAction, newValue: string) => {
    updateSession(prev => {
      const lines = [...prev.script.lines];
      if (!lines[lineIndex]) return prev;
      const line = { ...lines[lineIndex] };
      const statements = [...line.statements];
      if (!statements[statementIndex]) return prev;

      statements[statementIndex] = {
        ...statements[statementIndex],
        currentText: newValue,
        actions: [
          ...statements[statementIndex].actions,
          { action, result: newValue, timestamp: new Date().toISOString() },
        ],
      };

      // Reassemble line text from statements
      line.statements = statements;
      line.text = statements.map(s => s.currentText).join(' ');
      line.editState = applyInlineEdit(line.editState, action, line.text, 'user');
      lines[lineIndex] = line;

      return { ...prev, script: { ...prev.script, lines } };
    });
  }, [updateSession]);

  const undoField = useCallback((fieldId: string) => {
    updateSession(prev => {
      if (fieldId === 'title') {
        return { ...prev, script: { ...prev.script, title: undoFieldEdit(prev.script.title) } };
      }
      if (fieldId === 'synopsis') {
        return { ...prev, script: { ...prev.script, synopsis: undoFieldEdit(prev.script.synopsis) } };
      }
      if (fieldId.startsWith('line_')) {
        const idx = parseInt(fieldId.replace('line_', ''), 10);
        const lines = [...prev.script.lines];
        if (lines[idx]) {
          lines[idx] = { ...lines[idx], editState: undoFieldEdit(lines[idx].editState) };
          lines[idx].text = lines[idx].editState.value;
        }
        return { ...prev, script: { ...prev.script, lines } };
      }
      return prev;
    });
  }, [updateSession]);

  const redoField = useCallback((fieldId: string) => {
    updateSession(prev => {
      if (fieldId === 'title') {
        return { ...prev, script: { ...prev.script, title: redoFieldEdit(prev.script.title) } };
      }
      if (fieldId === 'synopsis') {
        return { ...prev, script: { ...prev.script, synopsis: redoFieldEdit(prev.script.synopsis) } };
      }
      if (fieldId.startsWith('line_')) {
        const idx = parseInt(fieldId.replace('line_', ''), 10);
        const lines = [...prev.script.lines];
        if (lines[idx]) {
          lines[idx] = { ...lines[idx], editState: redoFieldEdit(lines[idx].editState) };
          lines[idx].text = lines[idx].editState.value;
        }
        return { ...prev, script: { ...prev.script, lines } };
      }
      return prev;
    });
  }, [updateSession]);

  // ─── Step 4: Language I/O ───────────────────────────────────────────────
  const setInputLanguage = useCallback((lang: LanguageSelection) => {
    updateSession(prev => ({
      ...prev,
      languageIO: { ...prev.languageIO, inputLanguage: lang },
    }));
  }, [updateSession]);

  const addOutputLanguageHandler = useCallback((lang: LanguageSelection) => {
    updateSession(prev => addOutputLanguageFn(prev, lang));
  }, [updateSession]);

  const removeOutputLanguageHandler = useCallback((code: string) => {
    updateSession(prev => removeOutputLanguageFn(prev, code));
  }, [updateSession]);

  const toggleTranscreation = useCallback(() => {
    updateSession(prev => ({
      ...prev,
      languageIO: {
        ...prev.languageIO,
        transcreationEnabled: !prev.languageIO.transcreationEnabled,
      },
    }));
  }, [updateSession]);

  const setAdaptationLevelHandler = useCallback((langCode: string, level: 'light' | 'moderate' | 'deep') => {
    updateSession(prev => setAdaptationLevelFn(prev, langCode, level));
  }, [updateSession]);

  // ─── Step 5: Format Selection ───────────────────────────────────────────
  const toggleFormat = useCallback((format: ContentFormat) => {
    updateSession(prev => toggleOutputFormatFn(prev, format));
  }, [updateSession]);

  const updateFormatConfig = useCallback((format: ContentFormat, config: Partial<{ aspectRatio: string; duration: number; quality: string; crossFormatConversions: CrossFormatConversionType[] }>) => {
    updateSession(prev => ({
      ...prev,
      formatConfigs: {
        ...prev.formatConfigs,
        [format]: { ...prev.formatConfigs[format], ...config },
      },
    }));
  }, [updateSession]);

  const formatsByCategory = useMemo(() => getFormatsByCategory(), []);
  const availableConversions = useMemo(() => getAvailableConversions(session.selectedFormats), [session.selectedFormats]);

  // ─── Step 6: Style & Scenario ───────────────────────────────────────────
  const setScenario = useCallback((scenario: ContentScenario) => {
    updateSession(prev => ({ ...prev, style: { ...prev.style, scenario } }));
  }, [updateSession]);

  const setSceneStyle = useCallback((sceneStyle: SceneStyle) => {
    updateSession(prev => ({ ...prev, style: { ...prev.style, sceneStyle } }));
  }, [updateSession]);

  const setVisualElements = useCallback((visualElements: CompositionElementType[]) => {
    updateSession(prev => ({ ...prev, style: { ...prev.style, visualElements } }));
  }, [updateSession]);

  const setPerSceneOverride = useCallback((sceneId: string, override: { style?: SceneStyle; elements?: CompositionElementType[]; framework?: string }) => {
    updateSession(prev => ({
      ...prev,
      style: {
        ...prev.style,
        perSceneOverrides: {
          ...prev.style.perSceneOverrides,
          [sceneId]: { ...(prev.style.perSceneOverrides[sceneId] || {}), ...override },
        },
      },
    }));
  }, [updateSession]);

  // ─── Step 7: Review ─────────────────────────────────────────────────────
  const reviewData = useMemo(() => buildPlanFromSession(session), [session]);

  // ─── Intent ─────────────────────────────────────────────────────────────
  const setIntent = useCallback((intent: ContentIntent) => {
    updateSession(prev => ({ ...prev, intent }));
  }, [updateSession]);

  // ─── Session Management ─────────────────────────────────────────────────
  const saveNow = useCallback(() => {
    saveSession(session);
    setSession(prev => ({ ...prev, isDirty: false }));
  }, [session]);

  const loadSessionHandler = useCallback((sessionId: string) => {
    const sessions = loadAllSessions();
    const target = sessions[sessionId];
    if (target) {
      setSession(target);
      setIsNewSession(false);
    }
  }, []);

  const newSessionHandler = useCallback(() => {
    // Save current session first
    if (session.isDirty) saveSession(session);
    const fresh = createNewSession(session.mode, session.tier);
    setSession(fresh);
    setIsNewSession(true);
  }, [session]);

  const deleteSavedSession = useCallback((sessionId: string) => {
    deleteSession(sessionId);
  }, []);

  const resetSession = useCallback(() => {
    setSession(createNewSession(session.mode, session.tier));
    setIsNewSession(true);
  }, [session.mode, session.tier]);

  // ─── Mode Toggle ────────────────────────────────────────────────────────
  const toggleMode = useCallback(() => {
    updateSession(prev => ({
      ...prev,
      mode: prev.mode === 'simple' ? 'advanced' : 'simple',
    }));
  }, [updateSession]);

  // ─── Global Undo/Redo ───────────────────────────────────────────────────
  const canUndo = session.undoStack.length > 0;
  const canRedo = session.redoStack.length > 0;

  const globalUndo = useCallback(() => {
    updateSession(prev => {
      if (prev.undoStack.length === 0) return prev;
      const entry = prev.undoStack[prev.undoStack.length - 1];
      const newUndoStack = prev.undoStack.slice(0, -1);
      const newRedoStack = [...prev.redoStack, entry];

      // Apply the undo (revert to old value)
      let updated = { ...prev, undoStack: newUndoStack, redoStack: newRedoStack };

      if (entry.fieldId === 'title') {
        updated = {
          ...updated,
          script: {
            ...updated.script,
            title: { ...updated.script.title, value: entry.oldValue, isDirty: entry.oldValue !== updated.script.title.originalValue },
          },
        };
      } else if (entry.fieldId === 'synopsis') {
        updated = {
          ...updated,
          script: {
            ...updated.script,
            synopsis: { ...updated.script.synopsis, value: entry.oldValue, isDirty: entry.oldValue !== updated.script.synopsis.originalValue },
          },
        };
      } else if (entry.fieldId.startsWith('line_')) {
        const idx = parseInt(entry.fieldId.replace('line_', ''), 10);
        const lines = [...updated.script.lines];
        if (lines[idx]) {
          lines[idx] = {
            ...lines[idx],
            text: entry.oldValue,
            editState: { ...lines[idx].editState, value: entry.oldValue, isDirty: entry.oldValue !== lines[idx].editState.originalValue },
          };
        }
        updated = { ...updated, script: { ...updated.script, lines } };
      }

      return updated;
    });
  }, [updateSession]);

  const globalRedo = useCallback(() => {
    updateSession(prev => {
      if (prev.redoStack.length === 0) return prev;
      const entry = prev.redoStack[prev.redoStack.length - 1];
      const newRedoStack = prev.redoStack.slice(0, -1);
      const newUndoStack = [...prev.undoStack, entry];

      let updated = { ...prev, undoStack: newUndoStack, redoStack: newRedoStack };

      if (entry.fieldId === 'title') {
        updated = {
          ...updated,
          script: {
            ...updated.script,
            title: { ...updated.script.title, value: entry.newValue, isDirty: entry.newValue !== updated.script.title.originalValue },
          },
        };
      } else if (entry.fieldId === 'synopsis') {
        updated = {
          ...updated,
          script: {
            ...updated.script,
            synopsis: { ...updated.script.synopsis, value: entry.newValue, isDirty: entry.newValue !== updated.script.synopsis.originalValue },
          },
        };
      } else if (entry.fieldId.startsWith('line_')) {
        const idx = parseInt(entry.fieldId.replace('line_', ''), 10);
        const lines = [...updated.script.lines];
        if (lines[idx]) {
          lines[idx] = {
            ...lines[idx],
            text: entry.newValue,
            editState: { ...lines[idx].editState, value: entry.newValue, isDirty: entry.newValue !== lines[idx].editState.originalValue },
          };
        }
        updated = { ...updated, script: { ...updated.script, lines } };
      }

      return updated;
    });
  }, [updateSession]);

  // ─── Saved Sessions List ────────────────────────────────────────────────
  const savedSessions = useMemo(() => {
    const all = loadAllSessions();
    return Object.values(all).map(s => ({
      id: s.sessionId,
      title: s.script.title.value || `Draft (${s.input.mode})`,
      lastSaved: s.lastSavedAt,
      step: s.currentStep,
    })).sort((a, b) => b.lastSaved.localeCompare(a.lastSaved));
  }, [session.lastSavedAt]); // Re-compute when save happens

  // ─── Return ─────────────────────────────────────────────────────────────
  return {
    // Session
    session,
    isNewSession,
    hasUnsavedChanges: session.isDirty,
    savedSessions,

    // Navigation
    currentStep: session.currentStep,
    completedSteps: session.completedSteps,
    canGoNext,
    canGoPrev,
    goToStep,
    goNext,
    goPrev,
    stepStatus,

    // Step 1: Input
    inputMode: session.input.mode,
    setInputMode,
    inputContent: session.input.content,
    setInputContent,
    setInputFile,
    setBusinessInfo,
    availableModes: SCRIPT_GEN_MODES,
    simpleModes: getSimpleModes(),

    // Step 2: Enrichment
    enrichment: session.enrichment,
    toggleEnrichmentField,
    refreshEnrichment,
    promptPreview: session.enrichment.assembledPromptPreview,
    enrichmentScore: session.enrichment.enrichmentScore,

    // Step 3: Script
    scriptLines: session.script.lines,
    scriptTitle: session.script.title,
    scriptSynopsis: session.script.synopsis,
    editScriptLine,
    editTitle,
    editSynopsis,
    editStatement,
    undoField,
    redoField,
    aiSuggestions: session.script.aiSuggestions,

    // Step 4: Language
    languageIO: session.languageIO,
    inputLanguage: session.languageIO.inputLanguage,
    outputLanguages: session.languageIO.outputLanguages,
    setInputLanguage,
    addOutputLanguage: addOutputLanguageHandler,
    removeOutputLanguage: removeOutputLanguageHandler,
    canAddMoreLanguages: session.languageIO.outputLanguages.length < MAX_OUTPUT_LANGUAGES,
    toggleTranscreation,
    setAdaptationLevel: setAdaptationLevelHandler,

    // Step 5: Format
    selectedFormats: session.selectedFormats,
    toggleFormat,
    formatConfigs: session.formatConfigs,
    updateFormatConfig,
    formatsByCategory,
    availableConversions,

    // Step 6: Style
    scenario: session.style.scenario,
    setScenario,
    sceneStyle: session.style.sceneStyle,
    setSceneStyle,
    visualElements: session.style.visualElements,
    setVisualElements,
    setPerSceneOverride,

    // Step 7: Review
    reviewSummary: {
      ...session.review,
      estimatedCredits: reviewData.estimatedCredits,
      estimatedDuration: reviewData.estimatedDuration,
      warnings: reviewData.warnings,
      readyToProduce: reviewData.warnings.length === 0,
    },
    estimatedCredits: reviewData.estimatedCredits,
    estimatedDuration: reviewData.estimatedDuration,
    warnings: reviewData.warnings,
    isReadyToProduce: reviewData.warnings.length === 0,

    // Intent
    intent: session.intent,
    setIntent,

    // Session management
    saveNow,
    loadSession: loadSessionHandler,
    newSession: newSessionHandler,
    deleteSavedSession,
    resetSession,

    // Mode
    isSimpleMode: session.mode === 'simple',
    isAdvancedMode: session.mode === 'advanced',
    toggleMode,

    // Global undo/redo
    canUndo,
    canRedo,
    globalUndo,
    globalRedo,
  };
}
