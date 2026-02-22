/**
 * useSceneComposition — React hook for scene-level composition
 *
 * Wraps the SceneCompositionEngine with React state management.
 * Provides undo/redo, auto-save, and event-driven updates.
 *
 * Design principle: USER'S CHOICE. Every operation is available.
 * AI recommendations are surfaced but never forced.
 *
 * Used by: UnifiedCompositionStudio, GenieCast PRODUCE/EDIT tabs,
 * Pipeline Orchestrator (automated chains)
 *
 * @see src/services/sceneCompositionEngine.ts — pure functions
 * @see src/components/genie-admin/composition-studio/types.ts — types
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import type {
  CompositionScene,
  CompositionProject,
  CompositionChapter,
  SceneStyle,
  SceneBRoll,
  SceneOutputFormat,
  SceneStyleVariant,
  SceneRecommendation,
  CompositionElementType,
  ChapterVisual,
  MultiOutputConfig,
} from '@/components/genie-admin/composition-studio/types';
import {
  createScene,
  insertScene,
  removeScene,
  duplicateScene,
  moveScene,
  splitScene,
  mergeScenes,
  addVisualLayer,
  removeVisualLayer,
  reorderVisualLayers,
  addBRoll,
  removeBRoll,
  updateBRoll,
  setSceneStyle,
  addStyleVariant,
  selectStyleVariant,
  configureMultiOutput,
  saveSceneVersion,
  restoreSceneVersion,
  markAsClip,
  getClipCandidates,
  chapterToScene,
  sceneToChapter,
  getProjectDuration,
  getDirtyScenes,
  getElementTypeSummary,
  estimateSceneCredits,
  estimateProjectCredits,
  buildStitchPlan,
  createFromTemplate,
  SCENE_TEMPLATES,
} from '@/services/sceneCompositionEngine';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UndoEntry {
  scenes: CompositionScene[];
  description: string;
  timestamp: number;
}

interface SceneCompositionState {
  scenes: CompositionScene[];
  selectedSceneId: string | null;
  isDirty: boolean;
}

export interface UseSceneCompositionReturn {
  // State
  scenes: CompositionScene[];
  selectedScene: CompositionScene | null;
  selectedSceneId: string | null;
  isDirty: boolean;

  // Scene CRUD
  addScene: (overrides?: Partial<CompositionScene>, position?: number | 'start' | 'end' | 'before_cta') => void;
  addFromTemplate: (templateKey: string, position?: number | 'start' | 'end' | 'before_cta') => void;
  removeSceneById: (sceneId: string) => void;
  duplicateSceneById: (sceneId: string) => void;
  updateScene: (sceneId: string, updates: Partial<CompositionScene>) => void;
  moveSceneByIndex: (fromIndex: number, toIndex: number) => void;
  selectScene: (sceneId: string | null) => void;

  // Timeline operations
  splitSceneAt: (sceneId: string, splitAtSeconds: number) => void;
  mergeTwoScenes: (sceneIdA: string, sceneIdB: string) => void;

  // Visual layers
  addLayer: (sceneId: string, layerType: CompositionElementType, config?: Partial<ChapterVisual>) => void;
  removeLayer: (sceneId: string, layerId: string) => void;
  reorderLayers: (sceneId: string, fromIndex: number, toIndex: number) => void;

  // B-roll
  addBRollToScene: (sceneId: string, bRoll: Omit<SceneBRoll, 'id'>) => void;
  removeBRollFromScene: (sceneId: string, bRollId: string) => void;
  updateBRollInScene: (sceneId: string, bRollId: string, updates: Partial<SceneBRoll>) => void;

  // Style
  setStyle: (sceneId: string, style: SceneStyle, stylePrompt?: string) => void;
  addVariant: (sceneId: string, variant: Omit<SceneStyleVariant, 'id'>) => void;
  selectVariant: (sceneId: string, variantId: string) => void;

  // Clips
  markSceneAsClip: (sceneId: string, platforms: string[]) => void;
  clipCandidates: CompositionScene[];

  // Multi-output
  setMultiOutput: (outputs: SceneOutputFormat[]) => CompositionProject | null;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Version history
  restoreVersion: (sceneId: string, versionId: string) => void;

  // Utilities
  totalDuration: number;
  dirtyScenes: CompositionScene[];
  elementSummary: Record<CompositionElementType, number>;
  creditEstimate: { total: number; perScene: Record<string, number>; perFormat: Record<string, number> };
  stitchPlan: ReturnType<typeof buildStitchPlan>;
  templateKeys: string[];

  // Conversion
  importChapters: (chapters: CompositionChapter[]) => void;
  exportChapters: () => CompositionChapter[];

  // Bulk operations
  setAllScenes: (scenes: CompositionScene[]) => void;
  applyStyleToAll: (style: SceneStyle, stylePrompt?: string) => void;
  markAllAsClips: (platforms: string[]) => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSceneComposition(
  initialProject?: CompositionProject,
): UseSceneCompositionReturn {
  // Core state
  const [state, setState] = useState<SceneCompositionState>({
    scenes: (initialProject?.scenes || initialProject?.chapters?.map(chapterToScene)) || [],
    selectedSceneId: null,
    isDirty: false,
  });

  // Undo/redo stacks
  const undoStack = useRef<UndoEntry[]>([]);
  const redoStack = useRef<UndoEntry[]>([]);
  const MAX_UNDO = 50;

  // Project ref for multi-output
  const projectRef = useRef<CompositionProject | null>(initialProject || null);

  // Push to undo stack before any modification
  const pushUndo = useCallback((description: string) => {
    undoStack.current.push({
      scenes: structuredClone(state.scenes),
      description,
      timestamp: Date.now(),
    });
    if (undoStack.current.length > MAX_UNDO) {
      undoStack.current.shift();
    }
    redoStack.current = []; // Clear redo on new action
  }, [state.scenes]);

  // Update scenes with undo tracking
  const updateScenes = useCallback((
    updater: (scenes: CompositionScene[]) => CompositionScene[],
    description: string,
  ) => {
    pushUndo(description);
    setState(prev => ({
      ...prev,
      scenes: updater(prev.scenes),
      isDirty: true,
    }));
  }, [pushUndo]);

  // Update a single scene
  const updateSingleScene = useCallback((
    sceneId: string,
    updater: (scene: CompositionScene) => CompositionScene,
    description: string,
  ) => {
    pushUndo(description);
    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === sceneId ? updater(s) : s),
      isDirty: true,
    }));
  }, [pushUndo]);

  // ─── Scene CRUD ──────────────────────────────────────────────────────────

  const addSceneFn = useCallback((
    overrides?: Partial<CompositionScene>,
    position: number | 'start' | 'end' | 'before_cta' = 'before_cta',
  ) => {
    const newScene = createScene(overrides);
    updateScenes(
      scenes => insertScene(scenes, newScene, position),
      `Add scene "${newScene.title}"`,
    );
    setState(prev => ({ ...prev, selectedSceneId: newScene.id }));
  }, [updateScenes]);

  const addFromTemplateFn = useCallback((
    templateKey: string,
    position: number | 'start' | 'end' | 'before_cta' = 'before_cta',
  ) => {
    const newScene = createFromTemplate(templateKey);
    updateScenes(
      scenes => insertScene(scenes, newScene, position),
      `Add "${templateKey}" scene from template`,
    );
    setState(prev => ({ ...prev, selectedSceneId: newScene.id }));
  }, [updateScenes]);

  const removeSceneByIdFn = useCallback((sceneId: string) => {
    const scene = state.scenes.find(s => s.id === sceneId);
    updateScenes(
      scenes => removeScene(scenes, sceneId),
      `Remove scene "${scene?.title || sceneId}"`,
    );
    setState(prev => ({
      ...prev,
      selectedSceneId: prev.selectedSceneId === sceneId ? null : prev.selectedSceneId,
    }));
  }, [state.scenes, updateScenes]);

  const duplicateSceneByIdFn = useCallback((sceneId: string) => {
    const scene = state.scenes.find(s => s.id === sceneId);
    updateScenes(
      scenes => duplicateScene(scenes, sceneId),
      `Duplicate scene "${scene?.title || sceneId}"`,
    );
  }, [state.scenes, updateScenes]);

  const updateSceneFn = useCallback((sceneId: string, updates: Partial<CompositionScene>) => {
    updateSingleScene(
      sceneId,
      scene => {
        const versioned = saveSceneVersion(scene, 'full', 'Manual update');
        return { ...versioned, ...updates };
      },
      `Update scene "${updates.title || sceneId}"`,
    );
  }, [updateSingleScene]);

  const moveSceneByIndexFn = useCallback((fromIndex: number, toIndex: number) => {
    updateScenes(
      scenes => moveScene(scenes, fromIndex, toIndex),
      `Move scene from position ${fromIndex + 1} to ${toIndex + 1}`,
    );
  }, [updateScenes]);

  const selectSceneFn = useCallback((sceneId: string | null) => {
    setState(prev => ({ ...prev, selectedSceneId: sceneId }));
  }, []);

  // ─── Timeline Operations ────────────────────────────────────────────────

  const splitSceneAtFn = useCallback((sceneId: string, splitAtSeconds: number) => {
    updateScenes(
      scenes => splitScene(scenes, sceneId, splitAtSeconds),
      `Split scene at ${splitAtSeconds}s`,
    );
  }, [updateScenes]);

  const mergeTwoScenesFn = useCallback((sceneIdA: string, sceneIdB: string) => {
    updateScenes(
      scenes => mergeScenes(scenes, sceneIdA, sceneIdB),
      'Merge two scenes',
    );
  }, [updateScenes]);

  // ─── Visual Layers ──────────────────────────────────────────────────────

  const addLayerFn = useCallback((
    sceneId: string,
    layerType: CompositionElementType,
    config?: Partial<ChapterVisual>,
  ) => {
    updateSingleScene(
      sceneId,
      scene => addVisualLayer(scene, layerType, config),
      `Add ${layerType} layer`,
    );
  }, [updateSingleScene]);

  const removeLayerFn = useCallback((sceneId: string, layerId: string) => {
    updateSingleScene(
      sceneId,
      scene => removeVisualLayer(scene, layerId),
      'Remove visual layer',
    );
  }, [updateSingleScene]);

  const reorderLayersFn = useCallback((sceneId: string, fromIndex: number, toIndex: number) => {
    updateSingleScene(
      sceneId,
      scene => reorderVisualLayers(scene, fromIndex, toIndex),
      'Reorder visual layers',
    );
  }, [updateSingleScene]);

  // ─── B-Roll ─────────────────────────────────────────────────────────────

  const addBRollFn = useCallback((sceneId: string, bRollData: Omit<SceneBRoll, 'id'>) => {
    updateSingleScene(
      sceneId,
      scene => addBRoll(scene, bRollData),
      'Add B-roll',
    );
  }, [updateSingleScene]);

  const removeBRollFn = useCallback((sceneId: string, bRollId: string) => {
    updateSingleScene(
      sceneId,
      scene => removeBRoll(scene, bRollId),
      'Remove B-roll',
    );
  }, [updateSingleScene]);

  const updateBRollFn = useCallback((sceneId: string, bRollId: string, updates: Partial<SceneBRoll>) => {
    updateSingleScene(
      sceneId,
      scene => updateBRoll(scene, bRollId, updates),
      'Update B-roll',
    );
  }, [updateSingleScene]);

  // ─── Style ──────────────────────────────────────────────────────────────

  const setStyleFn = useCallback((sceneId: string, style: SceneStyle, stylePrompt?: string) => {
    updateSingleScene(
      sceneId,
      scene => setSceneStyle(saveSceneVersion(scene, 'style', `Change style to ${style}`), style, stylePrompt),
      `Set style to ${style}`,
    );
  }, [updateSingleScene]);

  const addVariantFn = useCallback((sceneId: string, variant: Omit<SceneStyleVariant, 'id'>) => {
    updateSingleScene(
      sceneId,
      scene => addStyleVariant(scene, variant),
      `Add style variant "${variant.name}"`,
    );
  }, [updateSingleScene]);

  const selectVariantFn = useCallback((sceneId: string, variantId: string) => {
    updateSingleScene(
      sceneId,
      scene => selectStyleVariant(scene, variantId),
      'Select style variant',
    );
  }, [updateSingleScene]);

  // ─── Clips ──────────────────────────────────────────────────────────────

  const markSceneAsClipFn = useCallback((sceneId: string, platforms: string[]) => {
    updateSingleScene(
      sceneId,
      scene => markAsClip(scene, platforms),
      'Mark as clip',
    );
  }, [updateSingleScene]);

  const clipCandidates = useMemo(() => getClipCandidates(state.scenes), [state.scenes]);

  // ─── Multi-Output ───────────────────────────────────────────────────────

  const setMultiOutputFn = useCallback((outputs: SceneOutputFormat[]): CompositionProject | null => {
    if (!projectRef.current) return null;
    const updated = configureMultiOutput(projectRef.current, outputs);
    projectRef.current = updated;
    return updated;
  }, []);

  // ─── Undo/Redo ──────────────────────────────────────────────────────────

  const undoFn = useCallback(() => {
    const entry = undoStack.current.pop();
    if (!entry) return;

    redoStack.current.push({
      scenes: structuredClone(state.scenes),
      description: `Undo: ${entry.description}`,
      timestamp: Date.now(),
    });

    setState(prev => ({ ...prev, scenes: entry.scenes, isDirty: true }));
  }, [state.scenes]);

  const redoFn = useCallback(() => {
    const entry = redoStack.current.pop();
    if (!entry) return;

    undoStack.current.push({
      scenes: structuredClone(state.scenes),
      description: `Redo: ${entry.description}`,
      timestamp: Date.now(),
    });

    setState(prev => ({ ...prev, scenes: entry.scenes, isDirty: true }));
  }, [state.scenes]);

  // ─── Version History ────────────────────────────────────────────────────

  const restoreVersionFn = useCallback((sceneId: string, versionId: string) => {
    const scene = state.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const restored = restoreSceneVersion(scene, versionId);
    if (!restored) return;

    pushUndo(`Restore version of "${scene.title}"`);
    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === sceneId ? { ...restored, id: s.id, order: s.order } : s),
      isDirty: true,
    }));
  }, [state.scenes, pushUndo]);

  // ─── Conversion ─────────────────────────────────────────────────────────

  const importChaptersFn = useCallback((chapters: CompositionChapter[]) => {
    const scenes = chapters.map(chapterToScene);
    setState(prev => ({ ...prev, scenes, isDirty: true }));
    undoStack.current = [];
    redoStack.current = [];
  }, []);

  const exportChaptersFn = useCallback((): CompositionChapter[] => {
    return state.scenes.map(sceneToChapter);
  }, [state.scenes]);

  // ─── Bulk Operations ────────────────────────────────────────────────────

  const setAllScenesFn = useCallback((scenes: CompositionScene[]) => {
    pushUndo('Set all scenes');
    setState(prev => ({ ...prev, scenes, isDirty: true }));
  }, [pushUndo]);

  const applyStyleToAllFn = useCallback((style: SceneStyle, stylePrompt?: string) => {
    updateScenes(
      scenes => scenes.map(s => setSceneStyle(s, style, stylePrompt)),
      `Apply ${style} style to all scenes`,
    );
  }, [updateScenes]);

  const markAllAsClipsFn = useCallback((platforms: string[]) => {
    updateScenes(
      scenes => scenes.map(s => markAsClip(s, platforms)),
      'Mark all scenes as clips',
    );
  }, [updateScenes]);

  // ─── Computed Values ────────────────────────────────────────────────────

  const selectedScene = useMemo(
    () => state.scenes.find(s => s.id === state.selectedSceneId) || null,
    [state.scenes, state.selectedSceneId],
  );

  const totalDuration = useMemo(() => getProjectDuration(state.scenes), [state.scenes]);
  const dirtyScenes = useMemo(() => getDirtyScenes(state.scenes), [state.scenes]);
  const elementSummary = useMemo(() => getElementTypeSummary(state.scenes), [state.scenes]);

  const creditEstimate = useMemo(
    () => estimateProjectCredits(state.scenes, projectRef.current?.multiOutput || undefined),
    [state.scenes],
  );

  const stitchPlan = useMemo(
    () => buildStitchPlan(state.scenes, projectRef.current?.multiOutput || undefined),
    [state.scenes],
  );

  const templateKeys = useMemo(() => Object.keys(SCENE_TEMPLATES), []);

  return {
    // State
    scenes: state.scenes,
    selectedScene,
    selectedSceneId: state.selectedSceneId,
    isDirty: state.isDirty,

    // Scene CRUD
    addScene: addSceneFn,
    addFromTemplate: addFromTemplateFn,
    removeSceneById: removeSceneByIdFn,
    duplicateSceneById: duplicateSceneByIdFn,
    updateScene: updateSceneFn,
    moveSceneByIndex: moveSceneByIndexFn,
    selectScene: selectSceneFn,

    // Timeline
    splitSceneAt: splitSceneAtFn,
    mergeTwoScenes: mergeTwoScenesFn,

    // Visual layers
    addLayer: addLayerFn,
    removeLayer: removeLayerFn,
    reorderLayers: reorderLayersFn,

    // B-roll
    addBRollToScene: addBRollFn,
    removeBRollFromScene: removeBRollFn,
    updateBRollInScene: updateBRollFn,

    // Style
    setStyle: setStyleFn,
    addVariant: addVariantFn,
    selectVariant: selectVariantFn,

    // Clips
    markSceneAsClip: markSceneAsClipFn,
    clipCandidates,

    // Multi-output
    setMultiOutput: setMultiOutputFn,

    // Undo/Redo
    undo: undoFn,
    redo: redoFn,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,

    // Version history
    restoreVersion: restoreVersionFn,

    // Utilities
    totalDuration,
    dirtyScenes,
    elementSummary,
    creditEstimate,
    stitchPlan,
    templateKeys,

    // Conversion
    importChapters: importChaptersFn,
    exportChapters: exportChaptersFn,

    // Bulk
    setAllScenes: setAllScenesFn,
    applyStyleToAll: applyStyleToAllFn,
    markAllAsClips: markAllAsClipsFn,
  };
}
