/**
 * useUniversalMedia Hook
 * 
 * React hook for the Universal Media Adapter providing OCR, TTS/STT,
 * Image Generation, and NLP operations across the Genie Suite.
 * 
 * This hook COMPLEMENTS useUniversalAI (for LLM/Chat/Vision) - it doesn't replace it.
 */

import { useState, useCallback, useMemo } from 'react';
import { useMasterToast } from '@/hooks/useMasterToast';
import { 
  UniversalMediaAdapter, 
  getUniversalMediaAdapter 
} from '@/services/media/UniversalMediaAdapter';
import type {
  OCRRequest, OCRResult, OCRProvider,
  TTSRequest, TTSResult, TTSProvider,
  STTRequest, STTResult, STTProvider,
  ImageGenRequest, ImageGenResult, ImageGenProvider,
  NLPRequest, NLPResult, NLPProvider,
  MediaAdapterConfig,
  MediaRequestContext,
  GenieProduct,
} from '@/services/media/types';

// ============================================
// HOOK STATE INTERFACE
// ============================================

export interface UniversalMediaState {
  isLoading: boolean;
  error: string | null;
  lastOperation: 'ocr' | 'tts' | 'stt' | 'image_gen' | 'nlp' | null;
  lastResult: OCRResult | TTSResult | STTResult | ImageGenResult | NLPResult | null;
}

export interface UseUniversalMediaOptions {
  product?: GenieProduct;
  autoInitialize?: boolean;
  config?: Partial<MediaAdapterConfig>;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useUniversalMedia(options: UseUniversalMediaOptions = {}) {
  const { product = 'spark', autoInitialize = true, config } = options;
  const { showError, showSuccess, showInfo } = useMasterToast();

  const [state, setState] = useState<UniversalMediaState>({
    isLoading: false,
    error: null,
    lastOperation: null,
    lastResult: null,
  });

  // Get adapter instance
  const adapter = useMemo(() => getUniversalMediaAdapter(config), [config]);

  // Create context for all operations
  const createContext = useCallback((): MediaRequestContext => ({
    product,
    correlationId: crypto.randomUUID(),
  }), [product]);

  // ============================================
  // OCR OPERATIONS
  // ============================================

  const performOCR = useCallback(async (
    request: OCRRequest,
    options?: { silent?: boolean }
  ): Promise<OCRResult | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, lastOperation: 'ocr' }));

    try {
      const result = await adapter.performOCR(request, createContext());
      setState(prev => ({ ...prev, isLoading: false, lastResult: result }));
      
      if (!options?.silent) {
        const providerName = result.fallbackUsed 
          ? `${result.provider} (fallback from ${result.fallbackUsed})`
          : result.provider;
        showSuccess(`OCR completed with ${providerName}`, 
          `Extracted ${result.metadata.wordCount} words with ${(result.confidence.overall * 100).toFixed(0)}% confidence`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OCR failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      if (!options?.silent) {
        showError('OCR Failed', errorMessage);
      }
      return null;
    }
  }, [adapter, createContext, showError, showSuccess]);

  // ============================================
  // TTS OPERATIONS
  // ============================================

  const generateSpeech = useCallback(async (
    request: TTSRequest,
    options?: { silent?: boolean }
  ): Promise<TTSResult | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, lastOperation: 'tts' }));

    try {
      const result = await adapter.generateSpeech(request, createContext());
      setState(prev => ({ ...prev, isLoading: false, lastResult: result }));
      
      if (!options?.silent) {
        showSuccess(`Speech generated with ${result.provider}`,
          `${result.metadata.characterCount} characters, ${result.duration.toFixed(1)}s duration`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'TTS failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      if (!options?.silent) {
        showError('Speech Generation Failed', errorMessage);
      }
      return null;
    }
  }, [adapter, createContext, showError, showSuccess]);

  // ============================================
  // STT OPERATIONS
  // ============================================

  const transcribeAudio = useCallback(async (
    request: STTRequest,
    options?: { silent?: boolean }
  ): Promise<STTResult | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, lastOperation: 'stt' }));

    try {
      const result = await adapter.transcribeAudio(request, createContext());
      setState(prev => ({ ...prev, isLoading: false, lastResult: result }));
      
      if (!options?.silent) {
        showSuccess(`Transcription completed with ${result.provider}`,
          `${result.metadata.wordCount} words, ${result.metadata.durationSeconds.toFixed(1)}s audio`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'STT failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      if (!options?.silent) {
        showError('Transcription Failed', errorMessage);
      }
      return null;
    }
  }, [adapter, createContext, showError, showSuccess]);

  // ============================================
  // IMAGE GENERATION OPERATIONS
  // ============================================

  const generateImage = useCallback(async (
    request: ImageGenRequest,
    options?: { silent?: boolean }
  ): Promise<ImageGenResult | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, lastOperation: 'image_gen' }));

    try {
      const result = await adapter.generateImage(request, createContext());
      setState(prev => ({ ...prev, isLoading: false, lastResult: result }));
      
      if (!options?.silent) {
        showSuccess(`Image generated with ${result.provider}`,
          `${result.images.length} image(s) created`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Image generation failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      if (!options?.silent) {
        showError('Image Generation Failed', errorMessage);
      }
      return null;
    }
  }, [adapter, createContext, showError, showSuccess]);

  // ============================================
  // NLP OPERATIONS
  // ============================================

  const processNLP = useCallback(async (
    request: NLPRequest,
    options?: { silent?: boolean }
  ): Promise<NLPResult | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, lastOperation: 'nlp' }));

    try {
      const result = await adapter.processNLP(request, createContext());
      setState(prev => ({ ...prev, isLoading: false, lastResult: result }));
      
      if (!options?.silent) {
        showSuccess(`NLP completed with ${result.provider}`,
          `${result.metadata.operationsPerformed.join(', ')}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'NLP processing failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      if (!options?.silent) {
        showError('NLP Processing Failed', errorMessage);
      }
      return null;
    }
  }, [adapter, createContext, showError, showSuccess]);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const getAvailableProviders = useCallback((capability: 'ocr' | 'tts' | 'stt' | 'image_gen' | 'nlp') => {
    return adapter.getAvailableProviders(capability);
  }, [adapter]);

  const getBestProvider = useCallback(async (
    capability: 'ocr' | 'tts' | 'stt' | 'image_gen' | 'nlp',
    preferredProvider?: string
  ) => {
    return adapter.getBestProvider(capability, preferredProvider);
  }, [adapter]);

  // ============================================
  // RETURN HOOK VALUE
  // ============================================

  return {
    // State
    ...state,
    
    // OCR
    performOCR,
    
    // TTS/STT
    generateSpeech,
    transcribeAudio,
    
    // Image Generation
    generateImage,
    
    // NLP
    processNLP,
    
    // Utilities
    clearError,
    getAvailableProviders,
    getBestProvider,
    getConfig: () => adapter.getConfig(),
    updateConfig: (config: Partial<MediaAdapterConfig>) => adapter.updateConfig(config),
  };
}

export default useUniversalMedia;
