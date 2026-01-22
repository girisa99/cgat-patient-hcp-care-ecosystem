/**
 * Universal Editor Context Provider
 * Manages the complete 5-layer editor state
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  ActiveProject,
  EditorAction,
  EditorMode,
  UniversalElement,
  UniversalInput,
  PipelineTemplate,
  EditorViewport,
  PreviewConfig,
  InspectorState,
  PublishConfig,
  UserPreferences,
} from '../types';

// ============================================================================
// DEFAULT STATE
// ============================================================================

const defaultUserPreferences: UserPreferences = {
  defaultMode: 'hybrid',
  autoSave: true,
  autoSaveInterval: 30,
  showPipelineSteps: true,
  qualityPreset: 'balanced',
  defaultTier: 'standard',
};

const defaultViewport: EditorViewport = {
  zoom: 1,
  panX: 0,
  panY: 0,
  mode: 'canvas',
  showGrid: true,
  showGuides: true,
  snapToGrid: true,
  gridSize: 10,
};

const defaultPreview: PreviewConfig = {
  quality: 'preview',
  autoRefresh: true,
  showSafeZones: false,
  deviceFrame: 'none',
};

const defaultInspector: InspectorState = {
  isOpen: true,
  activeTab: 'properties',
};

const createEmptyProject = (): ActiveProject => ({
  id: uuidv4(),
  name: 'Untitled Project',
  context: {
    projectHistory: [],
    userPreferences: defaultUserPreferences,
  },
  inputs: [],
  mode: 'hybrid',
  elements: [],
  viewport: defaultViewport,
  selection: { elementIds: [] },
  preview: defaultPreview,
  inspector: defaultInspector,
  credits: {
    balance: 1000, // Default credits
    estimatedCost: 0,
    breakdown: [],
    optimizationSuggestions: [],
  },
  createdAt: new Date().toISOString(),
  savedAt: new Date().toISOString(),
  version: 1,
});

// ============================================================================
// REDUCER
// ============================================================================

interface EditorState {
  project: ActiveProject;
  history: ActiveProject[];
  historyIndex: number;
  isDirty: boolean;
  isProcessing: boolean;
}

const initialState: EditorState = {
  project: createEmptyProject(),
  history: [],
  historyIndex: -1,
  isDirty: false,
  isProcessing: false,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  // Save to history for undo/redo (skip for certain actions)
  const shouldSaveHistory = !['UPDATE_VIEWPORT', 'UPDATE_INSPECTOR', 'SELECT_ELEMENTS'].includes(action.type);
  const newHistory = shouldSaveHistory
    ? [...state.history.slice(0, state.historyIndex + 1), state.project]
    : state.history;

  switch (action.type) {
    case 'SET_MODE': {
      return {
        ...state,
        project: {
          ...state.project,
          mode: action.payload,
          viewport: { ...state.project.viewport, mode: action.payload === 'hybrid' ? 'canvas' : action.payload },
        },
        isDirty: true,
        history: newHistory,
        historyIndex: shouldSaveHistory ? newHistory.length - 1 : state.historyIndex,
      };
    }

    case 'ADD_INPUT': {
      return {
        ...state,
        project: {
          ...state.project,
          inputs: [...state.project.inputs, action.payload],
        },
        isDirty: true,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'SET_PIPELINE': {
      const template = action.payload;
      return {
        ...state,
        project: {
          ...state.project,
          pipeline: {
            template,
            mode: 'auto',
            stages: template.stages.map(s => ({ ...s, status: 'pending' })),
            currentStageIndex: 0,
            overallProgress: 0,
            status: 'configuring',
            creditsBurned: 0,
          },
        },
        isDirty: true,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'UPDATE_PIPELINE_STAGE': {
      if (!state.project.pipeline) return state;
      const { stageId, updates } = action.payload;
      return {
        ...state,
        project: {
          ...state.project,
          pipeline: {
            ...state.project.pipeline,
            stages: state.project.pipeline.stages.map(s =>
              s.id === stageId ? { ...s, ...updates } : s
            ),
          },
        },
        isDirty: true,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'ADD_ELEMENT': {
      return {
        ...state,
        project: {
          ...state.project,
          elements: [...state.project.elements, action.payload],
        },
        isDirty: true,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'UPDATE_ELEMENT': {
      const { id, updates } = action.payload;
      return {
        ...state,
        project: {
          ...state.project,
          elements: state.project.elements.map(el =>
            el.id === id ? { ...el, ...updates } : el
          ),
        },
        isDirty: true,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'DELETE_ELEMENT': {
      return {
        ...state,
        project: {
          ...state.project,
          elements: state.project.elements.filter(el => el.id !== action.payload),
          selection: {
            ...state.project.selection,
            elementIds: state.project.selection.elementIds.filter(id => id !== action.payload),
          },
        },
        isDirty: true,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'SELECT_ELEMENTS': {
      return {
        ...state,
        project: {
          ...state.project,
          selection: { elementIds: action.payload },
        },
      };
    }

    case 'UPDATE_VIEWPORT': {
      return {
        ...state,
        project: {
          ...state.project,
          viewport: { ...state.project.viewport, ...action.payload },
        },
      };
    }

    case 'SET_PREVIEW_CONFIG': {
      return {
        ...state,
        project: {
          ...state.project,
          preview: { ...state.project.preview, ...action.payload },
        },
      };
    }

    case 'UPDATE_INSPECTOR': {
      return {
        ...state,
        project: {
          ...state.project,
          inspector: { ...state.project.inspector, ...action.payload },
        },
      };
    }

    case 'UNDO': {
      if (state.historyIndex < 0) return state;
      return {
        ...state,
        project: state.history[state.historyIndex],
        historyIndex: state.historyIndex - 1,
        isDirty: true,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      return {
        ...state,
        project: state.history[state.historyIndex + 1],
        historyIndex: state.historyIndex + 1,
        isDirty: true,
      };
    }

    case 'SAVE': {
      return {
        ...state,
        project: {
          ...state.project,
          savedAt: new Date().toISOString(),
          version: state.project.version + 1,
        },
        isDirty: false,
      };
    }

    case 'PUBLISH': {
      return {
        ...state,
        project: {
          ...state.project,
          publishConfig: action.payload,
        },
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface EditorContextValue {
  // State
  project: ActiveProject;
  isDirty: boolean;
  isProcessing: boolean;
  canUndo: boolean;
  canRedo: boolean;

  // Mode Management
  setMode: (mode: EditorMode) => void;
  getRecommendedMode: () => EditorMode;

  // Input Management
  addInput: (input: UniversalInput) => void;
  removeInput: (inputId: string) => void;

  // Pipeline Management
  setPipeline: (template: PipelineTemplate) => void;
  updatePipelineStage: (stageId: string, updates: Partial<any>) => void;
  startPipeline: () => Promise<void>;
  pausePipeline: () => void;
  resumePipeline: () => void;

  // Element Management
  addElement: (element: Omit<UniversalElement, 'id' | 'metadata'>) => string;
  updateElement: (id: string, updates: Partial<UniversalElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => string;
  groupElements: (ids: string[]) => string;
  ungroupElements: (groupId: string) => void;

  // Selection
  selectElements: (ids: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Viewport
  updateViewport: (updates: Partial<EditorViewport>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  resetView: () => void;

  // Preview
  setPreviewConfig: (config: Partial<PreviewConfig>) => void;

  // Inspector
  updateInspector: (updates: Partial<InspectorState>) => void;
  openInspector: (elementId?: string) => void;
  closeInspector: () => void;

  // History
  undo: () => void;
  redo: () => void;

  // Persistence
  save: () => Promise<void>;
  publish: (config: PublishConfig) => Promise<void>;
  exportProject: (format: string) => Promise<Blob>;

  // Utilities
  getElementById: (id: string) => UniversalElement | undefined;
  getSelectedElements: () => UniversalElement[];
}

const EditorContext = createContext<EditorContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface EditorProviderProps {
  children: React.ReactNode;
  initialProject?: ActiveProject;
}

export function EditorProvider({ children, initialProject }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, {
    ...initialState,
    project: initialProject || createEmptyProject(),
  });

  // Mode Management
  const setMode = useCallback((mode: EditorMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const getRecommendedMode = useCallback((): EditorMode => {
    const { inputs, pipeline } = state.project;
    
    // Analyze inputs and pipeline to recommend best mode
    const hasVideo = inputs.some(i => i.detectedType === 'video');
    const hasAudio = inputs.some(i => i.detectedType === 'audio');
    const hasPresentation = inputs.some(i => ['presentation', 'document'].includes(i.detectedType));
    
    const outputTypes = pipeline?.template.outputTypes || [];
    const isVideoOutput = outputTypes.some(o => o.includes('video'));
    const isDocumentOutput = outputTypes.some(o => ['pdf', 'docx', 'pptx'].includes(o));
    
    if (isVideoOutput || hasVideo || hasAudio) return 'timeline';
    if (isDocumentOutput || hasPresentation) return 'canvas';
    return 'hybrid';
  }, [state.project]);

  // Input Management
  const addInput = useCallback((input: UniversalInput) => {
    dispatch({ type: 'ADD_INPUT', payload: input });
  }, []);

  const removeInput = useCallback((inputId: string) => {
    // Custom action not in type - would need to extend
  }, []);

  // Pipeline Management
  const setPipeline = useCallback((template: PipelineTemplate) => {
    dispatch({ type: 'SET_PIPELINE', payload: template });
  }, []);

  const updatePipelineStage = useCallback((stageId: string, updates: Partial<any>) => {
    dispatch({ type: 'UPDATE_PIPELINE_STAGE', payload: { stageId, updates } });
  }, []);

  const startPipeline = useCallback(async () => {
    // Implementation would call edge functions for each stage
    console.log('Starting pipeline execution...');
  }, []);

  const pausePipeline = useCallback(() => {
    console.log('Pausing pipeline...');
  }, []);

  const resumePipeline = useCallback(() => {
    console.log('Resuming pipeline...');
  }, []);

  // Element Management
  const addElement = useCallback((element: Omit<UniversalElement, 'id' | 'metadata'>): string => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const fullElement: UniversalElement = {
      ...element,
      id,
      metadata: {
        createdAt: now,
        modifiedAt: now,
        version: 1,
      },
    };
    dispatch({ type: 'ADD_ELEMENT', payload: fullElement });
    return id;
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<UniversalElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', payload: { id, updates: {
      ...updates,
      metadata: {
        ...updates.metadata,
        modifiedAt: new Date().toISOString(),
      },
    }}});
  }, []);

  const deleteElement = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ELEMENT', payload: id });
  }, []);

  const duplicateElement = useCallback((id: string): string => {
    const element = state.project.elements.find(el => el.id === id);
    if (!element) return '';
    
    const newId = uuidv4();
    const now = new Date().toISOString();
    const duplicated: UniversalElement = {
      ...element,
      id: newId,
      position: {
        ...element.position,
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
      metadata: {
        createdAt: now,
        modifiedAt: now,
        version: 1,
      },
    };
    dispatch({ type: 'ADD_ELEMENT', payload: duplicated });
    return newId;
  }, [state.project.elements]);

  const groupElements = useCallback((ids: string[]): string => {
    const groupId = uuidv4();
    ids.forEach(id => {
      dispatch({ type: 'UPDATE_ELEMENT', payload: { id, updates: { groupId } }});
    });
    return groupId;
  }, []);

  const ungroupElements = useCallback((groupId: string) => {
    state.project.elements
      .filter(el => el.groupId === groupId)
      .forEach(el => {
        dispatch({ type: 'UPDATE_ELEMENT', payload: { id: el.id, updates: { groupId: undefined } }});
      });
  }, [state.project.elements]);

  // Selection
  const selectElements = useCallback((ids: string[]) => {
    dispatch({ type: 'SELECT_ELEMENTS', payload: ids });
  }, []);

  const selectAll = useCallback(() => {
    dispatch({ type: 'SELECT_ELEMENTS', payload: state.project.elements.map(el => el.id) });
  }, [state.project.elements]);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'SELECT_ELEMENTS', payload: [] });
  }, []);

  // Viewport
  const updateViewport = useCallback((updates: Partial<EditorViewport>) => {
    dispatch({ type: 'UPDATE_VIEWPORT', payload: updates });
  }, []);

  const zoomIn = useCallback(() => {
    const newZoom = Math.min(state.project.viewport.zoom * 1.25, 5);
    dispatch({ type: 'UPDATE_VIEWPORT', payload: { zoom: newZoom } });
  }, [state.project.viewport.zoom]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(state.project.viewport.zoom * 0.8, 0.1);
    dispatch({ type: 'UPDATE_VIEWPORT', payload: { zoom: newZoom } });
  }, [state.project.viewport.zoom]);

  const fitToScreen = useCallback(() => {
    // Calculate fit - simplified
    dispatch({ type: 'UPDATE_VIEWPORT', payload: { zoom: 1, panX: 0, panY: 0 } });
  }, []);

  const resetView = useCallback(() => {
    dispatch({ type: 'UPDATE_VIEWPORT', payload: defaultViewport });
  }, []);

  // Preview
  const setPreviewConfig = useCallback((config: Partial<PreviewConfig>) => {
    dispatch({ type: 'SET_PREVIEW_CONFIG', payload: config });
  }, []);

  // Inspector
  const updateInspector = useCallback((updates: Partial<InspectorState>) => {
    dispatch({ type: 'UPDATE_INSPECTOR', payload: updates });
  }, []);

  const openInspector = useCallback((elementId?: string) => {
    const element = elementId ? state.project.elements.find(el => el.id === elementId) : undefined;
    dispatch({ type: 'UPDATE_INSPECTOR', payload: { isOpen: true, selectedElement: element } });
    if (elementId) selectElements([elementId]);
  }, [state.project.elements, selectElements]);

  const closeInspector = useCallback(() => {
    dispatch({ type: 'UPDATE_INSPECTOR', payload: { isOpen: false } });
  }, []);

  // History
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  // Persistence
  const save = useCallback(async () => {
    dispatch({ type: 'SAVE' });
    // Would save to Supabase
    console.log('Project saved');
  }, []);

  const publish = useCallback(async (config: PublishConfig) => {
    dispatch({ type: 'PUBLISH', payload: config });
    // Would trigger publishing pipeline
    console.log('Publishing project with config:', config);
  }, []);

  const exportProject = useCallback(async (format: string): Promise<Blob> => {
    // Would generate export
    console.log('Exporting as:', format);
    return new Blob(['']);
  }, []);

  // Utilities
  const getElementById = useCallback((id: string) => {
    return state.project.elements.find(el => el.id === id);
  }, [state.project.elements]);

  const getSelectedElements = useCallback(() => {
    return state.project.selection.elementIds
      .map(id => state.project.elements.find(el => el.id === id))
      .filter((el): el is UniversalElement => el !== undefined);
  }, [state.project.elements, state.project.selection.elementIds]);

  const value = useMemo<EditorContextValue>(() => ({
    project: state.project,
    isDirty: state.isDirty,
    isProcessing: state.isProcessing,
    canUndo: state.historyIndex >= 0,
    canRedo: state.historyIndex < state.history.length - 1,

    setMode,
    getRecommendedMode,
    addInput,
    removeInput,
    setPipeline,
    updatePipelineStage,
    startPipeline,
    pausePipeline,
    resumePipeline,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    groupElements,
    ungroupElements,
    selectElements,
    selectAll,
    clearSelection,
    updateViewport,
    zoomIn,
    zoomOut,
    fitToScreen,
    resetView,
    setPreviewConfig,
    updateInspector,
    openInspector,
    closeInspector,
    undo,
    redo,
    save,
    publish,
    exportProject,
    getElementById,
    getSelectedElements,
  }), [
    state.project,
    state.isDirty,
    state.isProcessing,
    state.historyIndex,
    state.history.length,
    setMode,
    getRecommendedMode,
    addInput,
    removeInput,
    setPipeline,
    updatePipelineStage,
    startPipeline,
    pausePipeline,
    resumePipeline,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    groupElements,
    ungroupElements,
    selectElements,
    selectAll,
    clearSelection,
    updateViewport,
    zoomIn,
    zoomOut,
    fitToScreen,
    resetView,
    setPreviewConfig,
    updateInspector,
    openInspector,
    closeInspector,
    undo,
    redo,
    save,
    publish,
    exportProject,
    getElementById,
    getSelectedElements,
  ]);

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}

export { EditorContext };
