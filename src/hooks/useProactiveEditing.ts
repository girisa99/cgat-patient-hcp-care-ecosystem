/**
 * USE PROACTIVE EDITING HOOK
 * 
 * Frontend hook for proactive editing suggestions across the Genie ecosystem.
 * Used in Wizard Step 7 (EmbeddedEditorPanel) and standalone editors.
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  proactivePipelineEditorService, 
  ProactiveEditSuggestion,
  EditorType,
  EditorPriority,
  DeviceContext
} from '@/services/proactivePipelineEditorService';
import { useMasterToast } from '@/hooks/useMasterToast';

export interface UseProactiveEditingOptions {
  pipelineId?: string;
  outputType?: string;
  autoShow?: boolean;
}

export interface UseProactiveEditingReturn {
  suggestions: ProactiveEditSuggestion[];
  editorType: EditorType;
  shouldShowEditor: boolean;
  isAnalyzing: boolean;
  analyzePipeline: (pipelineId: string, outputContent?: any) => Promise<ProactiveEditSuggestion[]>;
  triggerEdit: (suggestionIndex: number) => void;
  dismissSuggestion: (pipelineId: string) => void;
  getByPriority: (priority: EditorPriority) => ProactiveEditSuggestion[];
}

export const useProactiveEditing = (options: UseProactiveEditingOptions = {}): UseProactiveEditingReturn => {
  const { pipelineId, outputType, autoShow = true } = options;
  const { showSuccess } = useMasterToast();

  const [suggestions, setSuggestions] = useState<ProactiveEditSuggestion[]>([]);
  const [editorType, setEditorType] = useState<EditorType>('none');
  const [shouldShowEditor, setShouldShowEditor] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const getDeviceContext = (): DeviceContext => {
    if (/iPhone|iPad|Android/i.test(navigator.userAgent)) {
      return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  };

  const analyzePipeline = useCallback(async (
    targetPipelineId: string, 
    outputContent?: any
  ): Promise<ProactiveEditSuggestion[]> => {
    setIsAnalyzing(true);
    try {
      const detectedType = proactivePipelineEditorService.getEditorType(targetPipelineId);
      setEditorType(detectedType);

      const deviceContext = getDeviceContext();
      const newSuggestions = proactivePipelineEditorService.getProactiveSuggestions(
        targetPipelineId,
        outputContent || {},
        deviceContext
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
  }, [autoShow, dismissed]);

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
