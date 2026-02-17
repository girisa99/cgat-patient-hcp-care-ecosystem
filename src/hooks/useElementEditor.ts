/**
 * useElementEditor Hook
 * 
 * Provides unified editing actions for any generated element type.
 * Integrates with UnifiedEditingContextService for context-aware regeneration.
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  unifiedEditingContextService,
  ElementType,
  EditAction,
  ElementGenerationContext,
  RegenerationRequest,
  RegenerationResult,
} from '@/services/unifiedEditingContextService';
import { GlobalTierLevel } from '@/services/flexibleAgentConfigService';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

export interface ElementEditorState {
  isLoading: boolean;
  isRegenerating: boolean;
  currentElement: ElementGenerationContext | null;
  editMode: 'view' | 'edit' | 'regenerate';
  pendingChanges: Map<string, unknown>;
  estimatedCredits: number;
}

export interface ElementEditorActions {
  // Load element context
  loadElement: (elementId: string) => void;
  
  // Manual editing
  updateField: (field: string, value: unknown) => void;
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
  
  // AI-assisted actions
  regenerate: (overrides?: RegenerationRequest['overrides']) => Promise<RegenerationResult | null>;
  enhance: (instructions?: string) => Promise<RegenerationResult | null>;
  refine: (adjustments: Record<string, unknown>) => Promise<RegenerationResult | null>;
  
  // Style/content specific
  updateStyle: (styleChanges: Record<string, unknown>) => Promise<RegenerationResult | null>;
  updateContent: (contentChanges: Record<string, unknown>) => Promise<RegenerationResult | null>;
  
  // Model switching
  changeModel: (modelId: string, providerId?: string) => Promise<RegenerationResult | null>;
  
  // Revert
  revertToOriginal: () => Promise<void>;
  
  // Batch operations
  regenerateBatch: (elementIds: string[], action: EditAction) => Promise<RegenerationResult[]>;
}

export interface UseElementEditorOptions {
  onRegenerationStart?: (elementId: string) => void;
  onRegenerationComplete?: (result: RegenerationResult) => void;
  onError?: (error: Error) => void;
  autoSave?: boolean;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useElementEditor(
  options: UseElementEditorOptions = {}
): [ElementEditorState, ElementEditorActions] {
  const { onRegenerationStart, onRegenerationComplete, onError, autoSave = false } = options;
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentElement, setCurrentElement] = useState<ElementGenerationContext | null>(null);
  const [editMode, setEditMode] = useState<'view' | 'edit' | 'regenerate'>('view');
  const [pendingChanges, setPendingChanges] = useState<Map<string, unknown>>(new Map());
  
  // Computed estimated credits
  const estimatedCredits = useMemo(() => {
    if (!currentElement) return 0;
    return unifiedEditingContextService.estimateRegenerationCredits(
      currentElement.elementId,
      'regenerate'
    );
  }, [currentElement]);
  
  // ============================================
  // ACTIONS
  // ============================================
  
  const loadElement = useCallback((elementId: string) => {
    setIsLoading(true);
    try {
      const context = unifiedEditingContextService.getElementContext(elementId);
      setCurrentElement(context || null);
      setPendingChanges(new Map());
      setEditMode('view');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateField = useCallback((field: string, value: unknown) => {
    setPendingChanges(prev => {
      const next = new Map(prev);
      next.set(field, value);
      return next;
    });
    setEditMode('edit');
  }, []);
  
  const saveChanges = useCallback(async () => {
    if (!currentElement || pendingChanges.size === 0) return;
    
    setIsLoading(true);
    try {
      // Convert pending changes to content update
      const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = [];
      const newContent = { ...currentElement.currentContent };
      
      pendingChanges.forEach((value, field) => {
        changes.push({
          field,
          oldValue: (currentElement.currentContent as Record<string, unknown>)?.[field],
          newValue: value,
        });
        (newContent as Record<string, unknown>)[field] = value;
      });
      
      // Update content
      unifiedEditingContextService.updateElementContent(currentElement.elementId, newContent);
      
      // Record edit
      unifiedEditingContextService.recordEdit(
        currentElement.elementId,
        'update-content',
        changes,
        undefined,
        0 // No credits for manual edits
      );
      
      // Refresh state
      const updated = unifiedEditingContextService.getElementContext(currentElement.elementId);
      setCurrentElement(updated || null);
      setPendingChanges(new Map());
      setEditMode('view');
      
      toast.success('Changes saved');
    } catch (error) {
      onError?.(error as Error);
      toast.error('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  }, [currentElement, pendingChanges, onError]);
  
  const discardChanges = useCallback(() => {
    setPendingChanges(new Map());
    setEditMode('view');
  }, []);
  
  // AI-assisted regeneration
  const executeRegeneration = useCallback(async (
    action: EditAction,
    overrides?: RegenerationRequest['overrides']
  ): Promise<RegenerationResult | null> => {
    if (!currentElement) return null;
    
    setIsRegenerating(true);
    onRegenerationStart?.(currentElement.elementId);
    
    const startTime = Date.now();
    
    try {
      // Get regeneration settings
      const settings = unifiedEditingContextService.getRegenerationSettings(
        currentElement.elementId,
        overrides
      );
      
      if (!settings) {
        throw new Error('Could not retrieve regeneration settings');
      }
      
      // Estimate credits
      const estimatedCredits = unifiedEditingContextService.estimateRegenerationCredits(
        currentElement.elementId,
        action,
        overrides
      );
      
      // TODO: Call actual regeneration API based on element type
      // This would dispatch to the appropriate agent/service
      // For now, simulate the regeneration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result: RegenerationResult = {
        success: true,
        elementId: currentElement.elementId,
        newVersion: currentElement.version + 1,
        updatedContent: currentElement.currentContent,
        creditsConsumed: estimatedCredits,
        estimatedVsActual: { estimated: estimatedCredits, actual: estimatedCredits },
        duration: Date.now() - startTime,
      };
      
      // Record the edit
      unifiedEditingContextService.recordEdit(
        currentElement.elementId,
        action,
        [{ field: 'content', oldValue: 'previous', newValue: 'regenerated' }],
        { modelUsed: overrides?.model || settings.settings.textModel },
        estimatedCredits
      );
      
      // Refresh state
      const updated = unifiedEditingContextService.getElementContext(currentElement.elementId);
      setCurrentElement(updated || null);
      
      onRegenerationComplete?.(result);
      toast.success(`${action} completed successfully`);
      
      return result;
    } catch (error) {
      const result: RegenerationResult = {
        success: false,
        elementId: currentElement.elementId,
        newVersion: currentElement.version,
        creditsConsumed: 0,
        estimatedVsActual: { estimated: 0, actual: 0 },
        duration: Date.now() - startTime,
        error: (error as Error).message,
      };
      
      onError?.(error as Error);
      toast.error(`Failed to ${action}: ${(error as Error).message}`);
      
      return result;
    } finally {
      setIsRegenerating(false);
      setEditMode('view');
    }
  }, [currentElement, onRegenerationStart, onRegenerationComplete, onError]);
  
  const regenerate = useCallback(async (overrides?: RegenerationRequest['overrides']) => {
    return executeRegeneration('regenerate', overrides);
  }, [executeRegeneration]);
  
  const enhance = useCallback(async (instructions?: string) => {
    return executeRegeneration('enhance', { customPrompt: instructions });
  }, [executeRegeneration]);
  
  const refine = useCallback(async (adjustments: Record<string, unknown>) => {
    return executeRegeneration('refine', { styleOverrides: adjustments });
  }, [executeRegeneration]);
  
  const updateStyle = useCallback(async (styleChanges: Record<string, unknown>) => {
    return executeRegeneration('update-style', { styleOverrides: styleChanges });
  }, [executeRegeneration]);
  
  const updateContent = useCallback(async (contentChanges: Record<string, unknown>) => {
    if (!currentElement) return null;
    
    // For content updates, we update locally first
    Object.entries(contentChanges).forEach(([field, value]) => {
      updateField(field, value);
    });
    
    await saveChanges();
    return null; // Content updates don't go through regeneration
  }, [currentElement, updateField, saveChanges]);
  
  const changeModel = useCallback(async (modelId: string, providerId?: string) => {
    return executeRegeneration('update-model', { 
      model: modelId, 
      provider: providerId 
    });
  }, [executeRegeneration]);
  
  const revertToOriginal = useCallback(async () => {
    if (!currentElement) return;
    
    setIsLoading(true);
    try {
      const revertedContent = unifiedEditingContextService.revertToOriginal(
        currentElement.elementId
      );
      
      if (revertedContent) {
        const updated = unifiedEditingContextService.getElementContext(currentElement.elementId);
        setCurrentElement(updated || null);
        setPendingChanges(new Map());
        setEditMode('view');
        toast.success('Reverted to original');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentElement]);
  
  const regenerateBatch = useCallback(async (
    elementIds: string[],
    action: EditAction
  ): Promise<RegenerationResult[]> => {
    const results: RegenerationResult[] = [];
    
    for (const elementId of elementIds) {
      loadElement(elementId);
      const result = await executeRegeneration(action);
      if (result) results.push(result);
    }
    
    return results;
  }, [loadElement, executeRegeneration]);
  
  // ============================================
  // RETURN STATE & ACTIONS
  // ============================================
  
  const state: ElementEditorState = {
    isLoading,
    isRegenerating,
    currentElement,
    editMode,
    pendingChanges,
    estimatedCredits,
  };
  
  const actions: ElementEditorActions = {
    loadElement,
    updateField,
    saveChanges,
    discardChanges,
    regenerate,
    enhance,
    refine,
    updateStyle,
    updateContent,
    changeModel,
    revertToOriginal,
    regenerateBatch,
  };
  
  return [state, actions];
}

export default useElementEditor;
