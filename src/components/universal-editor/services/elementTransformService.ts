/**
 * Element Transform Service
 * Handles bidirectional conversion between editor modes while preserving styling/metadata
 * 
 * Supports: Canvas ↔ Timeline ↔ Document conversions
 */

import type {
  UniversalElement,
  SlideContainer,
  TimelineTrack,
  TimelineClip,
  EditorMode,
  ElementType,
  ElementStyle,
  ElementPosition,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TRANSFORM RESULT TYPES
// ============================================================================

export interface TransformResult {
  success: boolean;
  elements: UniversalElement[];
  slides?: SlideContainer[];
  timeline?: TimelineTrack[];
  warnings: TransformWarning[];
  lossyConversions: LossyConversion[];
}

export interface TransformWarning {
  elementId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  suggestion?: string;
}

export interface LossyConversion {
  elementId: string;
  originalType: ElementType;
  targetType: ElementType;
  lostProperties: string[];
  preservedData: Record<string, unknown>; // Stored for potential recovery
}

// ============================================================================
// CANVAS TO TIMELINE CONVERSION
// ============================================================================

export function canvasToTimeline(
  slides: SlideContainer[],
  elements: UniversalElement[],
  options: {
    defaultSlideDuration?: number;
    preserveAnimations?: boolean;
    autoGenerateTransitions?: boolean;
  } = {}
): TransformResult {
  const {
    defaultSlideDuration = 5,
    preserveAnimations = true,
    autoGenerateTransitions = true,
  } = options;

  const warnings: TransformWarning[] = [];
  const lossyConversions: LossyConversion[] = [];
  
  // Create timeline tracks
  const videoTrack: TimelineTrack = {
    id: uuidv4(),
    name: 'Main Video',
    type: 'video',
    clips: [],
  };
  
  const textTrack: TimelineTrack = {
    id: uuidv4(),
    name: 'Text Overlays',
    type: 'text',
    clips: [],
  };
  
  const audioTrack: TimelineTrack = {
    id: uuidv4(),
    name: 'Audio',
    type: 'audio',
    clips: [],
  };

  let currentTime = 0;

  slides.forEach((slide, index) => {
    const slideDuration = slide.duration || defaultSlideDuration;
    const slideElements = slide.elements.map(id => elements.find(el => el.id === id)).filter(Boolean) as UniversalElement[];

    // Convert slide to video clip
    const slideClip: TimelineClip = {
      id: uuidv4(),
      elementId: slide.id,
      trackId: videoTrack.id,
      startTime: currentTime,
      endTime: currentTime + slideDuration,
    };
    videoTrack.clips.push(slideClip);

    // Extract text elements to overlay track
    slideElements.filter(el => ['text', 'heading', 'paragraph'].includes(el.type)).forEach(textEl => {
      const textClip: TimelineClip = {
        id: uuidv4(),
        elementId: textEl.id,
        trackId: textTrack.id,
        startTime: currentTime,
        endTime: currentTime + slideDuration,
      };
      textTrack.clips.push(textClip);

      // Warn if text has complex styling that may not translate
      if (textEl.style.filter || textEl.style.backdropFilter) {
        warnings.push({
          elementId: textEl.id,
          message: 'Complex filters may render differently in video timeline',
          severity: 'info',
          suggestion: 'Review preview after conversion',
        });
      }
    });

    // Extract audio elements
    slideElements.filter(el => el.type === 'audio').forEach(audioEl => {
      const audioClip: TimelineClip = {
        id: uuidv4(),
        elementId: audioEl.id,
        trackId: audioTrack.id,
        startTime: currentTime,
        endTime: currentTime + slideDuration,
      };
      audioTrack.clips.push(audioClip);
    });

    // Handle animations → timeline keyframes
    if (!preserveAnimations) {
      slideElements.filter(el => el.animation).forEach(el => {
        lossyConversions.push({
          elementId: el.id,
          originalType: el.type,
          targetType: el.type,
          lostProperties: ['animation'],
          preservedData: { originalAnimation: el.animation },
        });
      });
    }

    currentTime += slideDuration;

    // Add transition time if applicable
    if (autoGenerateTransitions && index < slides.length - 1) {
      currentTime += 0.5; // 0.5s transition
    }
  });

  return {
    success: true,
    elements,
    timeline: [videoTrack, textTrack, audioTrack].filter(t => t.clips.length > 0),
    warnings,
    lossyConversions,
  };
}

// ============================================================================
// TIMELINE TO CANVAS CONVERSION
// ============================================================================

export function timelineToCanvas(
  timeline: TimelineTrack[],
  elements: UniversalElement[],
  options: {
    slideBreakInterval?: number;
    preserveClipTiming?: boolean;
  } = {}
): TransformResult {
  const {
    slideBreakInterval = 5,
    preserveClipTiming = true,
  } = options;

  const warnings: TransformWarning[] = [];
  const lossyConversions: LossyConversion[] = [];
  const slides: SlideContainer[] = [];

  // Get all clips sorted by start time
  const allClips = timeline.flatMap(track => track.clips).sort((a, b) => a.startTime - b.startTime);
  
  if (allClips.length === 0) {
    return { success: true, elements, slides: [], warnings, lossyConversions };
  }

  // Find total duration
  const maxEndTime = Math.max(...allClips.map(c => c.endTime));
  
  // Create slides at regular intervals
  const numSlides = Math.ceil(maxEndTime / slideBreakInterval);

  for (let i = 0; i < numSlides; i++) {
    const slideStartTime = i * slideBreakInterval;
    const slideEndTime = (i + 1) * slideBreakInterval;

    // Find clips that overlap with this slide's time window
    const overlappingClips = allClips.filter(
      clip => clip.startTime < slideEndTime && clip.endTime > slideStartTime
    );

    const slideElements = overlappingClips.map(clip => clip.elementId);

    const slide: SlideContainer = {
      id: uuidv4(),
      index: i,
      name: `Slide ${i + 1}`,
      elements: slideElements,
      duration: slideBreakInterval,
      notes: preserveClipTiming 
        ? `Original timing: ${slideStartTime.toFixed(1)}s - ${slideEndTime.toFixed(1)}s`
        : undefined,
    };

    slides.push(slide);

    // Warn about clips that span multiple slides
    overlappingClips.forEach(clip => {
      if (clip.startTime < slideStartTime || clip.endTime > slideEndTime) {
        warnings.push({
          elementId: clip.elementId,
          message: 'Element spans multiple slides - duplicated in each',
          severity: 'info',
        });
      }
    });
  }

  // Record timing loss
  allClips.forEach(clip => {
    lossyConversions.push({
      elementId: clip.elementId,
      originalType: 'video',
      targetType: 'slide',
      lostProperties: ['startTime', 'endTime', 'trimStart', 'trimEnd', 'speed'],
      preservedData: {
        originalClip: clip,
      },
    });
  });

  return {
    success: true,
    elements,
    slides,
    warnings,
    lossyConversions,
  };
}

// ============================================================================
// CANVAS TO DOCUMENT CONVERSION
// ============================================================================

export function canvasToDocument(
  slides: SlideContainer[],
  elements: UniversalElement[]
): TransformResult {
  const warnings: TransformWarning[] = [];
  const lossyConversions: LossyConversion[] = [];

  // Convert elements to document-friendly format
  const documentElements: UniversalElement[] = [];

  slides.forEach((slide, slideIndex) => {
    // Add section header for each slide
    const sectionHeader: UniversalElement = {
      id: uuidv4(),
      type: 'heading',
      content: {
        type: 'text',
        value: slide.name || `Section ${slideIndex + 1}`,
      },
      style: {
        opacity: 1,
        zIndex: 0,
        fontSize: 24,
        fontWeight: 'bold',
      },
      position: { x: 0, y: 0, width: 100, height: 40 },
      metadata: {
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        version: 1,
        tags: ['converted-from-slide'],
      },
      isLocked: false,
      isVisible: true,
    };
    documentElements.push(sectionHeader);

    // Process each element in the slide
    slide.elements.forEach(elementId => {
      const element = elements.find(el => el.id === elementId);
      if (!element) return;

      // Convert position-based layout to flow-based
      const convertedElement: UniversalElement = {
        ...element,
        position: {
          ...element.position,
          x: 0, // Document uses flow layout
          y: 0,
        },
        style: {
          ...element.style,
          // Reset absolute positioning for document flow
        },
      };

      // Track position loss
      if (element.position.x !== 0 || element.position.y !== 0) {
        lossyConversions.push({
          elementId: element.id,
          originalType: element.type,
          targetType: element.type,
          lostProperties: ['position.x', 'position.y', 'position.rotation'],
          preservedData: {
            originalPosition: element.position,
          },
        });
      }

      // Handle non-text elements
      if (['image', 'video', 'chart'].includes(element.type)) {
        warnings.push({
          elementId: element.id,
          message: `${element.type} elements will be embedded as figures in document`,
          severity: 'info',
        });
      }

      // Handle animations (lost in document mode)
      if (element.animation) {
        lossyConversions.push({
          elementId: element.id,
          originalType: element.type,
          targetType: element.type,
          lostProperties: ['animation'],
          preservedData: { originalAnimation: element.animation },
        });
      }

      documentElements.push(convertedElement);
    });
  });

  return {
    success: true,
    elements: documentElements,
    warnings,
    lossyConversions,
  };
}

// ============================================================================
// UNIFIED MODE TRANSFORM
// ============================================================================

export function transformMode(
  fromMode: EditorMode,
  toMode: EditorMode,
  elements: UniversalElement[],
  slides?: SlideContainer[],
  timeline?: TimelineTrack[]
): TransformResult {
  // Same mode - no transform needed
  if (fromMode === toMode || toMode === 'hybrid') {
    return {
      success: true,
      elements,
      slides,
      timeline,
      warnings: [],
      lossyConversions: [],
    };
  }

  // Route to appropriate converter
  if (fromMode === 'canvas' && toMode === 'timeline') {
    return canvasToTimeline(slides || [], elements);
  }

  if (fromMode === 'timeline' && toMode === 'canvas') {
    return timelineToCanvas(timeline || [], elements);
  }

  if (fromMode === 'canvas' && toMode === 'document') {
    return canvasToDocument(slides || [], elements);
  }

  if (fromMode === 'timeline' && toMode === 'document') {
    // First convert to canvas, then to document
    const canvasResult = timelineToCanvas(timeline || [], elements);
    return canvasToDocument(canvasResult.slides || [], canvasResult.elements);
  }

  if (fromMode === 'document' && toMode === 'canvas') {
    // Document to canvas - create single slide with all elements
    const slide: SlideContainer = {
      id: uuidv4(),
      index: 0,
      name: 'Converted Document',
      elements: elements.map(el => el.id),
      duration: 5,
    };
    return {
      success: true,
      elements,
      slides: [slide],
      warnings: [{
        elementId: 'document',
        message: 'Document converted to single slide - consider reorganizing',
        severity: 'info',
      }],
      lossyConversions: [],
    };
  }

  if (fromMode === 'document' && toMode === 'timeline') {
    // Document → Canvas → Timeline
    const slide: SlideContainer = {
      id: uuidv4(),
      index: 0,
      name: 'Converted Document',
      elements: elements.map(el => el.id),
      duration: 10,
    };
    return canvasToTimeline([slide], elements);
  }

  // Fallback
  return {
    success: false,
    elements,
    warnings: [{
      elementId: 'system',
      message: `Unsupported mode conversion: ${fromMode} → ${toMode}`,
      severity: 'error',
    }],
    lossyConversions: [],
  };
}

// ============================================================================
// RECOVERY HELPERS
// ============================================================================

export function recoverLostProperties(
  element: UniversalElement,
  lossyConversion: LossyConversion
): UniversalElement {
  // Attempt to restore original properties from preserved data
  const recovered = { ...element };

  if (lossyConversion.preservedData.originalPosition) {
    recovered.position = lossyConversion.preservedData.originalPosition as typeof element.position;
  }

  if (lossyConversion.preservedData.originalAnimation) {
    recovered.animation = lossyConversion.preservedData.originalAnimation as typeof element.animation;
  }

  return recovered;
}

export function canRecoverFromConversion(lossyConversion: LossyConversion): boolean {
  return Object.keys(lossyConversion.preservedData).length > 0;
}
