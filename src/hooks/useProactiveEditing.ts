/**
 * USE PROACTIVE EDITING HOOK
 * 
 * Frontend hook for proactive editing suggestions across the Genie ecosystem.
 * Used in Wizard Step 7 (EmbeddedEditorPanel) and standalone editors.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  proactivePipelineEditorService, 
  ProactiveEditSuggestion,
  EditorType,
  EditorPriority,
  EDIT_CAPABILITIES
} from '@/services/proactivePipelineEditorService';
import { useMasterToast } from '@/hooks/useMasterToast';

export interface UseProactiveEditingOptions {
  pipelineId?: string;
  outputType?: string;
  userTier?: 'Starter' | 'Pro' | 'Enterprise';
  autoShow?: boolean;
}

export interface UseProactiveEditingReturn {
  suggestions: ProactiveEditSuggestion[];
  editorType: EditorType;
  shouldShowEditor: boolean;
  isAnalyzing: boolean;
  analyzePipeline: (pipelineId: string) => Promise<ProactiveEditSuggestion[]>;
  triggerEdit: (suggestionIndex: number) => void;
  dismissSuggestion: (pipelineId: string) => void;
  getByPriority: (priority: EditorPriority) => ProactiveEditSuggestion[];
}

export const useProactiveEditing = (options: UseProactiveEditingOptions = {}): UseProactiveEditingReturn => {
  const { pipelineId, outputType, userTier = 'Starter', autoShow = true } = options;
  const { showSuccess, showInfo } = useMasterToast();

  const [suggestions, setSuggestions] = useState<ProactiveEditSuggestion[]>([]);
  const [editorType, setEditorType] = useState<EditorType>('none');
  const [shouldShowEditor, setShouldShowEditor] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const analyzePipeline = useCallback(async (targetPipelineId: string): Promise<ProactiveEditSuggestion[]> => {
    setIsAnalyzing(true);
    try {
      const detectedType = proactivePipelineEditorService.getEditorType(targetPipelineId);
      setEditorType(detectedType);

      const deviceContext = /iPhone|iPad|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
      const newSuggestions = proactivePipelineEditorService.suggestEditingPipelines(
        targetPipelineId,
        deviceContext,
        userTier
      );

      const filtered = newSuggestions.filter(s => !dismissed.has(s.pipelineId));
      setSuggestions(filtered);

      if (autoShow) {
        setShouldShowEditor(proactivePipelineEditorService.shouldAutoShowEditor(targetPipelineId));
      }

      return filtered;
    } finally {
      setIsAnalyzing(false);
    }
  }, [userTier, autoShow, dismissed]);

  useEffect(() => {
    if (pipelineId) {
      analyzePipeline(pipelineId);
    }
  }, [pipelineId, analyzePipeline]);

  const triggerEdit = useCallback((suggestionIndex: number) => {
    const suggestion = suggestions[suggestionIndex];
    if (suggestion) {
      suggestion.triggerAction();
      showSuccess(`Opening ${suggestion.pipelineName} editor`);
    }
  }, [suggestions, showSuccess]);

  const dismissSuggestion = useCallback((pipelineIdToRemove: string) => {
    setDismissed(prev => new Set([...prev, pipelineIdToRemove]));
    setSuggestions(prev => prev.filter(s => s.pipelineId !== pipelineIdToRemove));
  }, []);

  const getByPriority = useCallback((priority: EditorPriority): ProactiveEditSuggestion[] => {
    return suggestions.filter(s => s.priority === priority);
  }, [suggestions]);

  return {
    suggestions,
    editorType,
    shouldShowEditor,
    isAnalyzing,
    analyzePipeline,
    triggerEdit,
    dismissSuggestion,
    getByPriority
  };
};

export default useProactiveEditing;
