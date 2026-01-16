/**
 * Hook for Universal Presentation Generator
 * Wraps the universalPresentationService with React state management
 */

import { useState, useCallback } from 'react';
import { 
  universalPresentationService, 
  PresentationRequest, 
  PresentationResult,
  GeneratedSlide 
} from '@/services/universalPresentationService';
import { useMasterToast } from './useMasterToast';

export function useUniversalPresentation() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PresentationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useMasterToast();

  const generatePresentation = useCallback(async (request: PresentationRequest) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const presentationResult = await universalPresentationService.generatePresentation(request);
      
      if (presentationResult.success) {
        setResult(presentationResult);
        showSuccess(`Generated ${presentationResult.slides.length} slides with ${presentationResult.metadata.imagesGenerated} images`);
      } else {
        setError(presentationResult.error || 'Generation failed');
        showError(presentationResult.error || 'Failed to generate presentation');
      }
      
      return presentationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
      showError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [showSuccess, showError]);

  const downloadPPTX = useCallback(async (slides: GeneratedSlide[], title: string) => {
    try {
      const blob = await universalPresentationService.downloadAsPPTX(slides, title);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess('Presentation downloaded!');
    } catch (err) {
      showError('Download failed');
    }
  }, [showSuccess, showError]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isGenerating,
    result,
    error,
    generatePresentation,
    downloadPPTX,
    reset
  };
}
