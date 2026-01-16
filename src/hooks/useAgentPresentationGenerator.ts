/**
 * Agent-based Presentation Generator Hook
 * 
 * React hook for managing agent-based presentation generation with:
 * - Real-time slide streaming
 * - Multi-language parallel generation
 * - Per-language model selection
 * - Content type AI decisions
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  agentPresentationGeneratorService,
  PresentationVersion,
  StreamingSlideUpdate,
  LanguageModelConfig,
  ContentTypeDecision,
  AgentGenerationConfig,
} from '@/services/agentPresentationGeneratorService';
import { PresentationRequest, GeneratedSlide } from '@/services/universalPresentationService';
import { SUPPORTED_LANGUAGES } from '@/components/genie-studio/presentation-generator/MultiLanguageGenerator';

export interface LanguageGenerationState {
  languageCode: string;
  languageName: string;
  flag: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  progress: number;
  currentSlide: number;
  totalSlides: number;
  slides: GeneratedSlide[];
  contentDecisions: ContentTypeDecision[];
  confidenceScore: number;
  modelConfig: LanguageModelConfig;
  fileName: string;
  downloadUrl?: string;
  error?: string;
}

export interface StreamingSlide {
  slideNumber: number;
  languageCode: string;
  status: 'pending' | 'generating_content' | 'generating_image' | 'complete' | 'error';
  slide?: GeneratedSlide;
  contentDecision?: ContentTypeDecision;
  lastUpdate: Date;
}

export interface UseAgentPresentationGeneratorReturn {
  // State
  isGenerating: boolean;
  isPrimaryComplete: boolean;
  languageStates: Map<string, LanguageGenerationState>;
  streamingSlides: Map<string, StreamingSlide>; // key: `${langCode}-${slideNumber}`
  currentPrimarySlide: number;
  totalSlides: number;
  
  // Primary language slides (for immediate display)
  primarySlides: GeneratedSlide[];
  primaryLanguage: string;
  
  // All versions after completion
  completedVersions: PresentationVersion[];
  
  // Actions
  startGeneration: (config: {
    presentationId: string;
    userId: string;
    request: PresentationRequest;
    languages: string[];
    primaryLanguage: string;
    modelConfigs: LanguageModelConfig[];
  }) => Promise<void>;
  
  cancelGeneration: (languageCode?: string) => void;
  
  getVersionByLanguage: (languageCode: string) => PresentationVersion | undefined;
  
  updateSlide: (languageCode: string, slideNumber: number, updates: Partial<GeneratedSlide>) => void;
  
  reset: () => void;
}

// Default model configs by language
const getDefaultModelConfig = (languageCode: string): LanguageModelConfig => ({
  languageCode,
  textModel: 'google/gemini-3-flash-preview',
  imageModel: 'google/gemini-2.5-flash-image-preview',
  voiceModel: 'openai',
  voiceId: 'alloy',
});

export function useAgentPresentationGenerator(): UseAgentPresentationGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrimaryComplete, setIsPrimaryComplete] = useState(false);
  const [languageStates, setLanguageStates] = useState<Map<string, LanguageGenerationState>>(new Map());
  const [streamingSlides, setStreamingSlides] = useState<Map<string, StreamingSlide>>(new Map());
  const [currentPrimarySlide, setCurrentPrimarySlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [primarySlides, setPrimarySlides] = useState<GeneratedSlide[]>([]);
  const [primaryLanguage, setPrimaryLanguage] = useState('en');
  const [completedVersions, setCompletedVersions] = useState<PresentationVersion[]>([]);
  
  const versionIdsRef = useRef<Map<string, string>>(new Map());

  // Handle streaming slide update
  const handleSlideUpdate = useCallback((update: StreamingSlideUpdate) => {
    const key = `${update.languageCode}-${update.slideNumber}`;
    
    setStreamingSlides(prev => {
      const next = new Map(prev);
      const existing = prev.get(key);
      
      let status: StreamingSlide['status'] = 'pending';
      if (update.type === 'slide_started') status = 'generating_content';
      else if (update.type === 'slide_content') status = 'generating_image';
      else if (update.type === 'slide_image') status = 'generating_image';
      else if (update.type === 'slide_complete') status = 'complete';
      else if (update.type === 'slide_error') status = 'error';
      
      next.set(key, {
        slideNumber: update.slideNumber,
        languageCode: update.languageCode,
        status,
        slide: update.data as GeneratedSlide || existing?.slide,
        contentDecision: update.contentDecision || existing?.contentDecision,
        lastUpdate: update.timestamp,
      });
      
      return next;
    });

    // Update language state progress
    setLanguageStates(prev => {
      const next = new Map(prev);
      const state = prev.get(update.languageCode);
      if (state) {
        const updatedSlides = [...state.slides];
        const slideIndex = update.slideNumber - 1;
        
        if (update.type === 'slide_complete' && update.data) {
          updatedSlides[slideIndex] = update.data as GeneratedSlide;
        }
        
        const updatedDecisions = [...state.contentDecisions];
        if (update.contentDecision) {
          updatedDecisions[slideIndex] = update.contentDecision;
        }
        
        next.set(update.languageCode, {
          ...state,
          progress: update.progress,
          currentSlide: update.slideNumber,
          slides: updatedSlides,
          contentDecisions: updatedDecisions,
        });
      }
      return next;
    });

    // Update primary slides if this is primary language
    if (update.languageCode === primaryLanguage && update.type === 'slide_complete' && update.data) {
      setCurrentPrimarySlide(update.slideNumber);
      setPrimarySlides(prev => {
        const next = [...prev];
        next[update.slideNumber - 1] = update.data as GeneratedSlide;
        return next;
      });
    }
  }, [primaryLanguage]);

  // Handle version complete
  const handleVersionComplete = useCallback((languageCode: string, version: PresentationVersion) => {
    setLanguageStates(prev => {
      const next = new Map(prev);
      const state = prev.get(languageCode);
      if (state) {
        next.set(languageCode, {
          ...state,
          status: 'complete',
          progress: 100,
          slides: version.slidesData,
          contentDecisions: version.contentDecisions,
          confidenceScore: version.confidenceScores.overall,
          downloadUrl: version.downloadUrl,
        });
      }
      return next;
    });

    setCompletedVersions(prev => [...prev.filter(v => v.languageCode !== languageCode), version]);

    // Check if primary language is complete
    if (version.isPrimary) {
      setIsPrimaryComplete(true);
      setPrimarySlides(version.slidesData);
      toast.success(`Primary language (${languageCode}) generation complete!`);
    } else {
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
      toast.success(`${lang?.name || languageCode} version complete!`);
    }

    // Check if all languages are complete
    setLanguageStates(prev => {
      const allComplete = Array.from(prev.values()).every(s => s.status === 'complete' || s.status === 'error');
      if (allComplete) {
        setIsGenerating(false);
        toast.success('All language versions generated!');
      }
      return prev;
    });
  }, []);

  // Handle error
  const handleError = useCallback((languageCode: string, error: string) => {
    setLanguageStates(prev => {
      const next = new Map(prev);
      const state = prev.get(languageCode);
      if (state) {
        next.set(languageCode, {
          ...state,
          status: 'error',
          error,
        });
      }
      return next;
    });

    const lang = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
    toast.error(`Failed to generate ${lang?.name || languageCode} version: ${error}`);
  }, []);

  // Start generation
  const startGeneration = useCallback(async (config: {
    presentationId: string;
    userId: string;
    request: PresentationRequest;
    languages: string[];
    primaryLanguage: string;
    modelConfigs: LanguageModelConfig[];
  }) => {
    setIsGenerating(true);
    setIsPrimaryComplete(false);
    setPrimaryLanguage(config.primaryLanguage);
    setPrimarySlides([]);
    setStreamingSlides(new Map());
    setCompletedVersions([]);
    setCurrentPrimarySlide(0);

    // Determine total slides
    const lengthMap: Record<string, number> = { short: 6, standard: 12, long: 20 };
    const slideCount = lengthMap[config.request.length] || 10;
    setTotalSlides(slideCount);

    // Initialize language states
    const initialStates = new Map<string, LanguageGenerationState>();
    for (const langCode of config.languages) {
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
      const modelConfig = config.modelConfigs.find(c => c.languageCode === langCode) 
        || getDefaultModelConfig(langCode);
      
      initialStates.set(langCode, {
        languageCode: langCode,
        languageName: lang?.name || langCode,
        flag: lang?.flag || '🌐',
        status: langCode === config.primaryLanguage ? 'generating' : 'pending',
        progress: 0,
        currentSlide: 0,
        totalSlides: slideCount,
        slides: [],
        contentDecisions: [],
        confidenceScore: 0,
        modelConfig,
        fileName: `presentation_${langCode}.pptx`,
      });
    }
    setLanguageStates(initialStates);

    // Initialize streaming slides
    const initialStreaming = new Map<string, StreamingSlide>();
    for (const langCode of config.languages) {
      for (let i = 1; i <= slideCount; i++) {
        initialStreaming.set(`${langCode}-${i}`, {
          slideNumber: i,
          languageCode: langCode,
          status: 'pending',
          lastUpdate: new Date(),
        });
      }
    }
    setStreamingSlides(initialStreaming);

    // Start agent generation
    const generationConfig: AgentGenerationConfig = {
      presentationId: config.presentationId,
      userId: config.userId,
      request: config.request,
      languages: config.languages,
      primaryLanguage: config.primaryLanguage,
      modelConfigs: config.modelConfigs.length > 0 
        ? config.modelConfigs 
        : config.languages.map(getDefaultModelConfig),
      onSlideUpdate: handleSlideUpdate,
      onAgentStatusChange: (agentId, status, progress) => {
        console.log(`[AgentHook] Agent ${agentId}: ${status} (${progress}%)`);
      },
      onVersionComplete: handleVersionComplete,
      onError: handleError,
    };

    try {
      await agentPresentationGeneratorService.generateMultiLanguage(generationConfig);
    } catch (error) {
      console.error('[AgentHook] Generation failed:', error);
      setIsGenerating(false);
      toast.error('Presentation generation failed');
    }
  }, [handleSlideUpdate, handleVersionComplete, handleError]);

  // Cancel generation
  const cancelGeneration = useCallback((languageCode?: string) => {
    if (languageCode) {
      const versionId = versionIdsRef.current.get(languageCode);
      if (versionId) {
        agentPresentationGeneratorService.cancelGeneration(versionId);
      }
    } else {
      // Cancel all
      versionIdsRef.current.forEach(versionId => {
        agentPresentationGeneratorService.cancelGeneration(versionId);
      });
    }
    setIsGenerating(false);
  }, []);

  // Get version by language
  const getVersionByLanguage = useCallback((languageCode: string): PresentationVersion | undefined => {
    return completedVersions.find(v => v.languageCode === languageCode);
  }, [completedVersions]);

  // Update slide
  const updateSlide = useCallback((languageCode: string, slideNumber: number, updates: Partial<GeneratedSlide>) => {
    setLanguageStates(prev => {
      const next = new Map(prev);
      const state = prev.get(languageCode);
      if (state) {
        const updatedSlides = state.slides.map((s, i) => 
          i === slideNumber - 1 ? { ...s, ...updates } : s
        );
        next.set(languageCode, {
          ...state,
          slides: updatedSlides,
        });
      }
      return next;
    });

    if (languageCode === primaryLanguage) {
      setPrimarySlides(prev => 
        prev.map((s, i) => i === slideNumber - 1 ? { ...s, ...updates } : s)
      );
    }
  }, [primaryLanguage]);

  // Reset
  const reset = useCallback(() => {
    setIsGenerating(false);
    setIsPrimaryComplete(false);
    setLanguageStates(new Map());
    setStreamingSlides(new Map());
    setCurrentPrimarySlide(0);
    setTotalSlides(0);
    setPrimarySlides([]);
    setCompletedVersions([]);
    versionIdsRef.current.clear();
  }, []);

  return {
    isGenerating,
    isPrimaryComplete,
    languageStates,
    streamingSlides,
    currentPrimarySlide,
    totalSlides,
    primarySlides,
    primaryLanguage,
    completedVersions,
    startGeneration,
    cancelGeneration,
    getVersionByLanguage,
    updateSlide,
    reset,
  };
}
