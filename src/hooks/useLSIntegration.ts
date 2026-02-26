/**
 * Label Studio Integration Hooks
 * Specialized hooks for each Genie Suite feature area
 * Use these in your components to capture training data
 */

import { useCallback, useRef } from 'react';
import { useLSUniversalOptional, type LSTrainingType } from '@/components/label-studio/LSUniversalProvider';

// ============================================================================
// SPARK INTEGRATION - Script Generation & Content Creation
// ============================================================================

export const useLSSparkIntegration = () => {
  const ls = useLSUniversalOptional();

  const captureContentGeneration = useCallback((
    prompt: string,
    generatedContent: string,
    contentType: 'video_script' | 'podcast_script' | 'social_post' | 'article',
    quality?: number
  ) => {
    ls?.captureData({
      type: 'content_generation',
      source: 'spark',
      platform: 'desktop',
      data: {
        prompt,
        generatedContent,
        contentType,
        wordCount: generatedContent.split(/\s+/).length,
      },
      labels: quality !== undefined ? { quality_score: quality } : undefined,
    });
  }, [ls]);

  const captureTemplateSelection = useCallback((
    templateId: string,
    templateCategory: string,
    wasUseful: boolean
  ) => {
    ls?.captureData({
      type: 'suggestion_relevance',
      source: 'spark',
      platform: 'desktop',
      data: { templateId, templateCategory },
      labels: { was_useful: wasUseful },
    });
  }, [ls]);

  return {
    captureContentGeneration,
    captureTemplateSelection,
    isEnabled: ls?.isEnabled ?? false,
  };
};

// ============================================================================
// SCRIPT EDITOR INTEGRATION - Script Quality & Enhancement
// ============================================================================

export const useLSScriptIntegration = () => {
  const ls = useLSUniversalOptional();

  const captureScriptContent = useCallback((
    content: string,
    scriptType: 'video' | 'audio',
    purpose?: string
  ) => {
    ls?.captureScript(content, { scriptType, purpose });
  }, [ls]);

  const captureEnhancement = useCallback((
    originalContent: string,
    enhancedContent: string,
    enhancementType: string,
    wasAccepted: boolean
  ) => {
    ls?.captureData({
      type: 'script_enhancement',
      source: 'script',
      platform: 'desktop',
      data: {
        original: originalContent,
        enhanced: enhancedContent,
        enhancementType,
        changeRatio: enhancedContent.length / originalContent.length,
      },
      labels: { accepted: wasAccepted },
    });
  }, [ls]);

  const captureAnalysisRecommendation = useCallback((
    recommendation: { type: string; originalText?: string; suggestedText?: string },
    wasApplied: boolean
  ) => {
    ls?.captureData({
      type: 'script_quality',
      source: 'script',
      platform: 'desktop',
      data: recommendation,
      labels: { applied: wasApplied },
    });
  }, [ls]);

  return {
    captureScriptContent,
    captureEnhancement,
    captureAnalysisRecommendation,
    isEnabled: ls?.isEnabled ?? false,
  };
};

// ============================================================================
// TTS INTEGRATION - Voice Quality & Emotion
// ============================================================================

export const useLSTTSIntegration = () => {
  const ls = useLSUniversalOptional();

  const captureTTSGeneration = useCallback((
    text: string,
    audioUrl: string,
    provider: string,
    voiceId: string,
    settings: { speed?: number; pitch?: number; stability?: number },
    quality?: number
  ) => {
    ls?.captureData({
      type: 'tts_quality',
      source: 'tts',
      platform: 'desktop',
      data: {
        text,
        audioUrl,
        provider,
        voiceId,
        settings,
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
      },
      labels: quality !== undefined ? { quality_rating: quality } : undefined,
    });
  }, [ls]);

  const captureVoiceEmotion = useCallback((
    audioUrl: string,
    expectedEmotion: string,
    detectedEmotion: string,
    confidence: number
  ) => {
    ls?.captureData({
      type: 'voice_emotion',
      source: 'tts',
      platform: 'desktop',
      data: { audioUrl, expectedEmotion, detectedEmotion, confidence },
      labels: { emotion_match: expectedEmotion === detectedEmotion },
    });
  }, [ls]);

  const captureVoiceClone = useCallback((
    originalAudioUrl: string,
    clonedVoiceId: string,
    sampleDuration: number,
    quality?: number
  ) => {
    ls?.captureData({
      type: 'voice_cloning',
      source: 'tts',
      platform: 'desktop',
      data: { originalAudioUrl, clonedVoiceId, sampleDuration },
      labels: quality !== undefined ? { clone_quality: quality } : undefined,
    });
  }, [ls]);

  return {
    captureTTSGeneration,
    captureVoiceEmotion,
    captureVoiceClone,
    isEnabled: ls?.isEnabled ?? false,
  };
};

// ============================================================================
// VIBE INTEGRATION - Recording, Video, Audio
// ============================================================================

export const useLSVibeIntegration = () => {
  const ls = useLSUniversalOptional();
  const frameBuffer = useRef<string[]>([]);

  const captureRecordingFrame = useCallback((frameDataUrl: string) => {
    frameBuffer.current.push(frameDataUrl);
    // Auto-flush every 30 frames
    if (frameBuffer.current.length >= 30) {
      ls?.captureVideo([...frameBuffer.current]);
      frameBuffer.current = [];
    }
  }, [ls]);

  const flushFrames = useCallback(() => {
    if (frameBuffer.current.length > 0) {
      ls?.captureVideo([...frameBuffer.current]);
      frameBuffer.current = [];
    }
  }, [ls]);

  const captureBackgroundSegmentation = useCallback((
    frameUrl: string,
    maskUrl: string,
    quality?: number
  ) => {
    ls?.captureData({
      type: 'background_segmentation',
      source: 'vibe',
      platform: 'desktop',
      data: { frameUrl, maskUrl },
      labels: quality !== undefined ? { segmentation_quality: quality } : undefined,
    });
  }, [ls]);

  const captureVideoTrimming = useCallback((
    videoUrl: string,
    originalDuration: number,
    trimStart: number,
    trimEnd: number,
    wasAutoSuggested: boolean
  ) => {
    ls?.captureData({
      type: 'video_trimming',
      source: 'vibe',
      platform: 'desktop',
      data: {
        videoUrl,
        originalDuration,
        trimStart,
        trimEnd,
        trimmedDuration: trimEnd - trimStart,
        trimRatio: (trimEnd - trimStart) / originalDuration,
      },
      labels: { auto_suggested: wasAutoSuggested },
    });
  }, [ls]);

  const captureSceneDetection = useCallback((
    videoUrl: string,
    scenes: { start: number; end: number; type: string }[],
    wasAccurate?: boolean
  ) => {
    ls?.captureData({
      type: 'scene_detection',
      source: 'vibe',
      platform: 'desktop',
      data: { videoUrl, scenes, sceneCount: scenes.length },
      labels: wasAccurate !== undefined ? { accurate: wasAccurate } : undefined,
    });
  }, [ls]);

  const captureAudioQuality = useCallback((
    audioUrl: string,
    metrics: { volume: number; clarity: number; noiseLevel: number },
    quality?: number
  ) => {
    ls?.captureAudio(audioUrl, undefined, { metrics, quality });
  }, [ls]);

  return {
    captureRecordingFrame,
    flushFrames,
    captureBackgroundSegmentation,
    captureVideoTrimming,
    captureSceneDetection,
    captureAudioQuality,
    isEnabled: ls?.isEnabled ?? false,
  };
};

// ============================================================================
// MOBILE INTEGRATION - Touch-optimized capture
// ============================================================================

export const useLSMobileIntegration = () => {
  const ls = useLSUniversalOptional();

  const captureMobileRecording = useCallback((
    recordingUrl: string,
    duration: number,
    recordingType: 'video' | 'audio' | 'screen',
    quality?: number
  ) => {
    ls?.captureData({
      type: 'audio_quality',
      source: 'mobile',
      platform: 'mobile',
      data: { recordingUrl, duration, recordingType },
      labels: quality !== undefined ? { quality_rating: quality } : undefined,
    });
  }, [ls]);

  const captureClipRanking = useCallback((
    clips: { id: string; thumbnailUrl: string; duration: number }[],
    selectedClipId: string,
    wasAISuggested: boolean
  ) => {
    const selectedIndex = clips.findIndex(c => c.id === selectedClipId);
    ls?.captureData({
      type: 'clip_ranking',
      source: 'mobile',
      platform: 'mobile',
      data: { clips, selectedClipId, selectedIndex, clipCount: clips.length },
      labels: { ai_suggested: wasAISuggested },
    });
  }, [ls]);

  const captureAutoArrange = useCallback((
    clips: { id: string; order: number }[],
    wasAccepted: boolean
  ) => {
    ls?.captureData({
      type: 'auto_edit',
      source: 'mobile',
      platform: 'mobile',
      data: { clips, clipCount: clips.length },
      labels: { arrangement_accepted: wasAccepted },
    });
  }, [ls]);

  const captureTransitionSelection = useCallback((
    transitionType: string,
    context: { clipBeforeId: string; clipAfterId: string },
    wasAISuggested: boolean
  ) => {
    ls?.captureData({
      type: 'transition_quality',
      source: 'mobile',
      platform: 'mobile',
      data: { transitionType, ...context },
      labels: { ai_suggested: wasAISuggested },
    });
  }, [ls]);

  const captureMusicSync = useCallback((
    musicTrackId: string,
    clips: { id: string; beatAligned: boolean }[],
    syncQuality?: number
  ) => {
    ls?.captureData({
      type: 'music_sync',
      source: 'mobile',
      platform: 'mobile',
      data: { musicTrackId, clips, alignedCount: clips.filter(c => c.beatAligned).length },
      labels: syncQuality !== undefined ? { sync_quality: syncQuality } : undefined,
    });
  }, [ls]);

  return {
    captureMobileRecording,
    captureClipRanking,
    captureAutoArrange,
    captureTransitionSelection,
    captureMusicSync,
    isEnabled: ls?.isEnabled ?? false,
  };
};

// ============================================================================
// PRODUCTION HUB INTEGRATION - End-to-end production
// ============================================================================

export const useLSProductionIntegration = () => {
  const ls = useLSUniversalOptional();

  const captureThumbnailSelection = useCallback((
    thumbnails: { id: string; url: string; isAIGenerated: boolean }[],
    selectedId: string,
    wasAISuggested: boolean
  ) => {
    ls?.captureData({
      type: 'thumbnail_quality',
      source: 'production',
      platform: 'desktop',
      data: { thumbnails, selectedId, thumbnailCount: thumbnails.length },
      labels: { ai_suggested: wasAISuggested },
    });
  }, [ls]);

  const captureContentTagging = useCallback((
    contentId: string,
    tags: string[],
    autoTags: string[],
    manualTags: string[]
  ) => {
    ls?.captureData({
      type: 'content_tagging',
      source: 'production',
      platform: 'desktop',
      data: { contentId, tags, autoTags, manualTags, tagAcceptanceRate: autoTags.length / tags.length },
    });
  }, [ls]);

  const captureProductionWorkflow = useCallback((
    showId: string,
    workflowSteps: { step: string; duration: number; wasSkipped: boolean }[],
    totalDuration: number
  ) => {
    ls?.captureData({
      type: 'competitive_analysis',
      source: 'production',
      platform: 'desktop',
      data: { showId, workflowSteps, totalDuration, stepCount: workflowSteps.length },
    });
  }, [ls]);

  return {
    captureThumbnailSelection,
    captureContentTagging,
    captureProductionWorkflow,
    isEnabled: ls?.isEnabled ?? false,
  };
};

// ============================================================================
// ASK GENIE INTEGRATION - AI Assistant Quality
// ============================================================================

export const useLSAskGenieIntegration = () => {
  const ls = useLSUniversalOptional();

  const captureGenieResponse = useCallback((
    prompt: string,
    response: string,
    context: { product: string; tab?: string },
    helpfulness?: number
  ) => {
    ls?.captureAIResponse(prompt, response, helpfulness);
  }, [ls]);

  const captureSuggestionRelevance = useCallback((
    suggestions: { id: string; text: string }[],
    selectedId: string | null,
    context: { product: string; action?: string }
  ) => {
    ls?.captureData({
      type: 'suggestion_relevance',
      source: 'ask_genie',
      platform: 'desktop',
      data: {
        suggestions,
        selectedId,
        wasAnySelected: selectedId !== null,
        ...context,
      },
    });
  }, [ls]);

  const captureFlowGuidance = useCallback((
    flowId: string,
    stepsCompleted: number,
    totalSteps: number,
    wasHelpful: boolean
  ) => {
    ls?.captureData({
      type: 'genie_response_quality',
      source: 'ask_genie',
      platform: 'desktop',
      data: { flowId, stepsCompleted, totalSteps, completionRate: stepsCompleted / totalSteps },
      labels: { was_helpful: wasHelpful },
    });
  }, [ls]);

  return {
    captureGenieResponse,
    captureSuggestionRelevance,
    captureFlowGuidance,
    isEnabled: ls?.isEnabled ?? false,
  };
};

// ============================================================================
// ARCH INTEGRATION - Architecture & Analytics
// ============================================================================

export const useLSArchIntegration = () => {
  const ls = useLSUniversalOptional();

  const captureDiagramInteraction = useCallback((
    diagramType: string,
    interactionType: 'view' | 'zoom' | 'click_node',
    nodeId?: string
  ) => {
    ls?.captureData({
      type: 'competitive_analysis',
      source: 'arch',
      platform: 'desktop',
      data: { diagramType, interactionType, nodeId },
    });
  }, [ls]);

  const captureFeatureExploration = useCallback((
    featureId: string,
    featureName: string,
    wasUseful: boolean
  ) => {
    ls?.captureData({
      type: 'suggestion_relevance',
      source: 'arch',
      platform: 'desktop',
      data: { featureId, featureName },
      labels: { was_useful: wasUseful },
    });
  }, [ls]);

  return {
    captureDiagramInteraction,
    captureFeatureExploration,
    isEnabled: ls?.isEnabled ?? false,
  };
};

// ============================================================================
// DOCUMENT PROCESSING INTEGRATION - OCR, Extraction, Field Mapping
// ============================================================================

export const useLSDocumentProcessingIntegration = () => {
  const ls = useLSUniversalOptional();

  const captureOCRResult = useCallback((
    documentId: string,
    documentType: string,
    ocrText: string,
    confidence: number,
    wasAccurate?: boolean
  ) => {
    ls?.captureData({
      type: 'transcription_accuracy',
      source: 'production',
      platform: 'desktop',
      data: {
        documentId,
        documentType,
        ocrText,
        confidence,
        textLength: ocrText.length,
      },
      labels: wasAccurate !== undefined ? { ocr_accurate: wasAccurate } : undefined,
    });
  }, [ls]);

  const captureFieldExtraction = useCallback((
    documentId: string,
    documentType: string,
    extractedFields: Record<string, { value: string; confidence: number }>,
    modelUsed: string,
    wasAccepted?: boolean
  ) => {
    const fieldCount = Object.keys(extractedFields).length;
    const avgConfidence = Object.values(extractedFields).reduce((sum, f) => sum + f.confidence, 0) / fieldCount;
    
    ls?.captureData({
      type: 'content_tagging',
      source: 'production',
      platform: 'desktop',
      data: {
        documentId,
        documentType,
        extractedFields,
        fieldCount,
        avgConfidence,
        modelUsed,
      },
      labels: wasAccepted !== undefined ? { extraction_accepted: wasAccepted } : undefined,
    });
  }, [ls]);

  const captureFieldCorrection = useCallback((
    documentId: string,
    fieldName: string,
    originalValue: string,
    correctedValue: string,
    originalConfidence: number
  ) => {
    ls?.captureData({
      type: 'script_enhancement',
      source: 'production',
      platform: 'desktop',
      data: {
        documentId,
        fieldName,
        originalValue,
        correctedValue,
        originalConfidence,
        wasCorrection: originalValue !== correctedValue,
      },
      labels: { field_corrected: originalValue !== correctedValue },
    });
  }, [ls]);

  const captureModelRouting = useCallback((
    documentType: string,
    selectedModel: string,
    alternativeModels: string[],
    routingConfidence: number,
    wasOptimal?: boolean
  ) => {
    ls?.captureData({
      type: 'suggestion_relevance',
      source: 'production',
      platform: 'desktop',
      data: {
        documentType,
        selectedModel,
        alternativeModels,
        routingConfidence,
      },
      labels: wasOptimal !== undefined ? { routing_optimal: wasOptimal } : undefined,
    });
  }, [ls]);

  const captureDocumentClassification = useCallback((
    documentId: string,
    predictedType: string,
    actualType: string,
    confidence: number
  ) => {
    ls?.captureData({
      type: 'content_tagging',
      source: 'production',
      platform: 'desktop',
      data: {
        documentId,
        predictedType,
        actualType,
        confidence,
        wasCorrect: predictedType === actualType,
      },
      labels: { classification_correct: predictedType === actualType },
    });
  }, [ls]);

  return {
    captureOCRResult,
    captureFieldExtraction,
    captureFieldCorrection,
    captureModelRouting,
    captureDocumentClassification,
    isEnabled: ls?.isEnabled ?? false,
  };
};

// Re-export all hooks
export {
  useLSSparkIntegration as useSparkLS,
  useLSScriptIntegration as useScriptLS,
  useLSTTSIntegration as useTTSLS,
  useLSVibeIntegration as useVibeLS,
  useLSMobileIntegration as useMobileLS,
  useLSProductionIntegration as useProductionLS,
  useLSAskGenieIntegration as useAskGenieLS,
  useLSArchIntegration as useArchLS,
  useLSDocumentProcessingIntegration as useDocumentProcessingLS,
};

// Cast integration lives in its own file due to pipeline complexity
export { useLSCastIntegration, useCastLS } from './useLSCastIntegration';
