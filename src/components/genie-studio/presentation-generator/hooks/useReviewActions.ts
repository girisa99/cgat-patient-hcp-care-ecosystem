/**
 * USE REVIEW ACTIONS HOOK
 * 
 * React hook for managing review actions (Accept, Skip, Enhance, Analyze, Fix, Refresh)
 * across element, slide, chapter, and presentation scopes.
 */

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { reviewActionService } from '../services/reviewActionService';
import {
  ReviewActionType,
  ReviewScope,
  ReviewActionTarget,
  ReviewActionResult,
  PresentationReviewState,
  SlideReviewState,
  ElementReviewState,
  BulkReviewAction,
  BulkActionResult,
  QUICK_ACTIONS,
  QuickActionKey,
  ReviewSuggestion,
  ReviewIssue,
} from '../types/reviewActions';
import { PresentationSlide, SlideEnhancementType } from '../types';

// ============================================
// HOOK INTERFACE
// ============================================

export interface UseReviewActionsOptions {
  onSlideUpdate?: (slideId: string, updates: Partial<PresentationSlide>) => void;
  onBulletUpdate?: (slideId: string, bulletId: string, text: string) => void;
  onStateChange?: (state: PresentationReviewState) => void;
}

export interface UseReviewActionsReturn {
  // State
  reviewState: PresentationReviewState | null;
  isProcessing: boolean;
  currentAction: ReviewActionType | null;
  processingTargets: Set<string>;
  
  // Initialize
  initializeReview: (slides: PresentationSlide[], outputType?: string) => void;
  
  // Element-level actions
  acceptElement: (slideId: string, elementId: string) => Promise<void>;
  skipElement: (slideId: string, elementId: string) => Promise<void>;
  enhanceElement: (slideId: string, elementId: string, type?: SlideEnhancementType) => Promise<ReviewActionResult>;
  analyzeElement: (slideId: string, elementId: string) => Promise<ReviewActionResult>;
  fixElement: (slideId: string, elementId: string, issues?: string[]) => Promise<ReviewActionResult>;
  refreshElement: (slideId: string, elementId: string) => Promise<ReviewActionResult>;
  revertElement: (slideId: string, elementId: string) => Promise<void>;
  
  // Slide-level actions
  acceptSlide: (slideId: string) => Promise<void>;
  skipSlide: (slideId: string) => Promise<void>;
  enhanceSlide: (slideId: string, type?: SlideEnhancementType, instructions?: string) => Promise<ReviewActionResult>;
  analyzeSlide: (slideId: string) => Promise<ReviewActionResult>;
  fixSlide: (slideId: string, autoFixAll?: boolean) => Promise<ReviewActionResult>;
  refreshSlide: (slideId: string) => Promise<ReviewActionResult>;
  revertSlide: (slideId: string) => Promise<void>;
  regenerateSlide: (slideId: string) => Promise<ReviewActionResult>;
  
  // Chapter-level actions
  acceptChapter: (chapterNumber: number) => Promise<void>;
  skipChapter: (chapterNumber: number) => Promise<void>;
  enhanceChapter: (chapterNumber: number, type?: SlideEnhancementType) => Promise<BulkActionResult>;
  
  // Presentation-level (quick actions)
  executeQuickAction: (actionKey: QuickActionKey) => Promise<BulkActionResult>;
  acceptAll: () => Promise<BulkActionResult>;
  skipRemaining: () => Promise<BulkActionResult>;
  enhanceAll: (type?: SlideEnhancementType) => Promise<BulkActionResult>;
  fixAllIssues: () => Promise<BulkActionResult>;
  analyzeQuality: () => Promise<ReviewActionResult>;
  refreshAllSuggestions: () => Promise<BulkActionResult>;
  
  // Helpers
  getSlideState: (slideId: string) => SlideReviewState | undefined;
  getElementState: (slideId: string, elementId: string) => ElementReviewState | undefined;
  getPendingSlides: () => SlideReviewState[];
  getIssuesForSlide: (slideId: string) => ReviewIssue[];
  getSuggestionsForSlide: (slideId: string) => ReviewSuggestion[];
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useReviewActions(options: UseReviewActionsOptions = {}): UseReviewActionsReturn {
  const { onSlideUpdate, onBulletUpdate, onStateChange } = options;
  
  const [reviewState, setReviewState] = useState<PresentationReviewState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<ReviewActionType | null>(null);
  const [processingTargets, setProcessingTargets] = useState<Set<string>>(new Set());
  
  // ============================================
  // STATE HELPERS
  // ============================================
  
  const updateState = useCallback((updater: (prev: PresentationReviewState) => PresentationReviewState) => {
    setReviewState(prev => {
      if (!prev) return prev;
      const newState = updater(prev);
      onStateChange?.(newState);
      return newState;
    });
  }, [onStateChange]);
  
  const addProcessingTarget = useCallback((targetId: string) => {
    setProcessingTargets(prev => new Set([...prev, targetId]));
  }, []);
  
  const removeProcessingTarget = useCallback((targetId: string) => {
    setProcessingTargets(prev => {
      const next = new Set(prev);
      next.delete(targetId);
      return next;
    });
  }, []);
  
  // ============================================
  // INITIALIZE
  // ============================================
  
  const initializeReview = useCallback((slides: PresentationSlide[], outputType: string = '2d-static') => {
    const state = reviewActionService.buildReviewState(slides, outputType);
    setReviewState(state);
  }, []);
  
  // ============================================
  // ELEMENT-LEVEL ACTIONS
  // ============================================
  
  const executeElementAction = useCallback(async (
    actionType: ReviewActionType,
    slideId: string,
    elementId: string,
    options?: any
  ): Promise<ReviewActionResult> => {
    const targetId = `${slideId}-${elementId}`;
    addProcessingTarget(targetId);
    setCurrentAction(actionType);
    
    try {
      const target: ReviewActionTarget = {
        scope: 'element',
        slideId,
        elementId,
      };
      
      const result = await reviewActionService.executeAction(actionType, target, options);
      
      // Update state based on action
      updateState(prev => {
        const chapters = prev.chapters.map(chapter => ({
          ...chapter,
          slides: chapter.slides.map(slide => {
            if (slide.slideId !== slideId) return slide;
            
            return {
              ...slide,
              elements: slide.elements.map(el => {
                if (el.id !== elementId) return el;
                
                let newStatus: ElementReviewState['status'] = el.status;
                let newValue = el.currentValue;
                
                if (actionType === 'accept') newStatus = 'accepted';
                else if (actionType === 'skip') newStatus = 'skipped';
                else if (actionType === 'enhance') newStatus = 'enhanced';
                else if (actionType === 'revert') newValue = el.originalValue;
                
                if (result.updatedContent?.text) {
                  newValue = result.updatedContent.text;
                }
                
                return {
                  ...el,
                  status: newStatus,
                  currentValue: newValue,
                  issues: result.analysis?.issues || el.issues,
                  suggestions: result.analysis?.suggestions || result.suggestions || el.suggestions,
                };
              }),
            };
          }),
        }));
        
        return { ...prev, chapters, lastUpdated: new Date().toISOString() };
      });
      
      return result;
    } finally {
      removeProcessingTarget(targetId);
      setCurrentAction(null);
    }
  }, [addProcessingTarget, removeProcessingTarget, updateState]);
  
  const acceptElement = useCallback(async (slideId: string, elementId: string) => {
    await executeElementAction('accept', slideId, elementId);
    toast.success('Element accepted');
  }, [executeElementAction]);
  
  const skipElement = useCallback(async (slideId: string, elementId: string) => {
    await executeElementAction('skip', slideId, elementId);
  }, [executeElementAction]);
  
  const enhanceElement = useCallback(async (
    slideId: string, 
    elementId: string, 
    type: SlideEnhancementType = 'polish'
  ) => {
    return executeElementAction('enhance', slideId, elementId, { enhancementType: type });
  }, [executeElementAction]);
  
  const analyzeElement = useCallback(async (slideId: string, elementId: string) => {
    return executeElementAction('analyze', slideId, elementId, { analysisType: 'quality' });
  }, [executeElementAction]);
  
  const fixElement = useCallback(async (slideId: string, elementId: string, issues?: string[]) => {
    return executeElementAction('fix', slideId, elementId, { issues, autoFixAll: !issues });
  }, [executeElementAction]);
  
  const refreshElement = useCallback(async (slideId: string, elementId: string) => {
    return executeElementAction('refresh', slideId, elementId);
  }, [executeElementAction]);
  
  const revertElement = useCallback(async (slideId: string, elementId: string) => {
    await executeElementAction('revert', slideId, elementId);
    toast.info('Element reverted to original');
  }, [executeElementAction]);
  
  // ============================================
  // SLIDE-LEVEL ACTIONS
  // ============================================
  
  const executeSlideAction = useCallback(async (
    actionType: ReviewActionType,
    slideId: string,
    options?: any
  ): Promise<ReviewActionResult> => {
    addProcessingTarget(slideId);
    setCurrentAction(actionType);
    setIsProcessing(true);
    
    try {
      const target: ReviewActionTarget = {
        scope: 'slide',
        slideId,
      };
      
      const result = await reviewActionService.executeAction(actionType, target, options);
      
      // Update state
      updateState(prev => {
        const chapters = prev.chapters.map(chapter => ({
          ...chapter,
          slides: chapter.slides.map(slide => {
            if (slide.slideId !== slideId) return slide;
            
            let newStatus: SlideReviewState['status'] = slide.status;
            if (actionType === 'accept') newStatus = 'accepted';
            else if (actionType === 'skip') newStatus = 'skipped';
            
            return {
              ...slide,
              status: newStatus,
              overallQuality: result.analysis?.qualityScore || slide.overallQuality,
            };
          }),
        }));
        
        // Recalculate stats
        let acceptedSlides = 0;
        let skippedSlides = 0;
        let pendingSlides = 0;
        
        chapters.forEach(ch => ch.slides.forEach(s => {
          if (s.status === 'accepted') acceptedSlides++;
          else if (s.status === 'skipped') skippedSlides++;
          else pendingSlides++;
        }));
        
        return { 
          ...prev, 
          chapters,
          acceptedSlides,
          skippedSlides,
          pendingSlides,
          reviewProgress: ((acceptedSlides + skippedSlides) / prev.totalSlides) * 100,
          lastUpdated: new Date().toISOString(),
        };
      });
      
      // Call onSlideUpdate if provided
      if (onSlideUpdate && result.updatedContent) {
        onSlideUpdate(slideId, {
          title: result.updatedContent.text,
        });
      }
      
      return result;
    } finally {
      removeProcessingTarget(slideId);
      setCurrentAction(null);
      setIsProcessing(false);
    }
  }, [addProcessingTarget, removeProcessingTarget, updateState, onSlideUpdate]);
  
  const acceptSlide = useCallback(async (slideId: string) => {
    await executeSlideAction('accept', slideId);
    toast.success('Slide accepted');
  }, [executeSlideAction]);
  
  const skipSlide = useCallback(async (slideId: string) => {
    await executeSlideAction('skip', slideId);
    toast.info('Slide skipped');
  }, [executeSlideAction]);
  
  const enhanceSlide = useCallback(async (
    slideId: string, 
    type: SlideEnhancementType = 'polish',
    instructions?: string
  ) => {
    const result = await executeSlideAction('enhance', slideId, { 
      enhancementType: type, 
      customInstructions: instructions 
    });
    if (result.success) toast.success('Slide enhanced');
    return result;
  }, [executeSlideAction]);
  
  const analyzeSlide = useCallback(async (slideId: string) => {
    return executeSlideAction('analyze', slideId, { analysisType: 'quality' });
  }, [executeSlideAction]);
  
  const fixSlide = useCallback(async (slideId: string, autoFixAll?: boolean) => {
    const result = await executeSlideAction('fix', slideId, { autoFixAll: autoFixAll ?? true });
    if (result.success) toast.success('Issues fixed');
    return result;
  }, [executeSlideAction]);
  
  const refreshSlide = useCallback(async (slideId: string) => {
    return executeSlideAction('refresh', slideId);
  }, [executeSlideAction]);
  
  const revertSlide = useCallback(async (slideId: string) => {
    await executeSlideAction('revert', slideId);
    toast.info('Slide reverted to original');
  }, [executeSlideAction]);
  
  const regenerateSlide = useCallback(async (slideId: string) => {
    const result = await executeSlideAction('regenerate', slideId);
    if (result.success) toast.success('Slide regenerated');
    return result;
  }, [executeSlideAction]);
  
  // ============================================
  // CHAPTER-LEVEL ACTIONS
  // ============================================
  
  const acceptChapter = useCallback(async (chapterNumber: number) => {
    if (!reviewState) return;
    
    const chapter = reviewState.chapters.find(c => c.chapterNumber === chapterNumber);
    if (!chapter) return;
    
    setIsProcessing(true);
    
    for (const slide of chapter.slides) {
      if (slide.status === 'pending') {
        await executeSlideAction('accept', slide.slideId);
      }
    }
    
    setIsProcessing(false);
    toast.success(`Chapter ${chapterNumber} accepted`);
  }, [reviewState, executeSlideAction]);
  
  const skipChapter = useCallback(async (chapterNumber: number) => {
    if (!reviewState) return;
    
    const chapter = reviewState.chapters.find(c => c.chapterNumber === chapterNumber);
    if (!chapter) return;
    
    setIsProcessing(true);
    
    for (const slide of chapter.slides) {
      if (slide.status === 'pending') {
        await executeSlideAction('skip', slide.slideId);
      }
    }
    
    setIsProcessing(false);
    toast.info(`Chapter ${chapterNumber} skipped`);
  }, [reviewState, executeSlideAction]);
  
  const enhanceChapter = useCallback(async (
    chapterNumber: number, 
    type: SlideEnhancementType = 'polish'
  ): Promise<BulkActionResult> => {
    if (!reviewState) {
      return { totalTargets: 0, successful: 0, failed: 0, skipped: 0, results: [], errors: [] };
    }
    
    const chapter = reviewState.chapters.find(c => c.chapterNumber === chapterNumber);
    if (!chapter) {
      return { totalTargets: 0, successful: 0, failed: 0, skipped: 0, results: [], errors: [] };
    }
    
    const targets: ReviewActionTarget[] = chapter.slides
      .filter(s => s.status === 'pending')
      .map(s => ({ scope: 'slide' as const, slideId: s.slideId }));
    
    const bulkAction: BulkReviewAction = {
      actionType: 'enhance',
      targets,
      options: { enhancementType: type },
    };
    
    setIsProcessing(true);
    const result = await reviewActionService.executeBulkAction(bulkAction);
    setIsProcessing(false);
    
    toast.success(`Enhanced ${result.successful} slides in Chapter ${chapterNumber}`);
    return result;
  }, [reviewState]);
  
  // ============================================
  // PRESENTATION-LEVEL ACTIONS
  // ============================================
  
  const executeQuickAction = useCallback(async (actionKey: QuickActionKey): Promise<BulkActionResult> => {
    if (!reviewState) {
      return { totalTargets: 0, successful: 0, failed: 0, skipped: 0, results: [], errors: [] };
    }
    
    const quickAction = QUICK_ACTIONS[actionKey];
    
    // Get all pending slides
    const targets: ReviewActionTarget[] = reviewState.chapters
      .flatMap(ch => ch.slides)
      .filter(s => s.status === 'pending')
      .map(s => ({ scope: quickAction.scope as ReviewScope, slideId: s.slideId }));
    
    const bulkAction: BulkReviewAction = {
      actionType: quickAction.action,
      targets,
    };
    
    setIsProcessing(true);
    setCurrentAction(quickAction.action);
    
    const result = await reviewActionService.executeBulkAction(bulkAction);
    
    // Update state after bulk action
    if (quickAction.action === 'accept') {
      updateState(prev => ({
        ...prev,
        acceptedSlides: prev.totalSlides,
        pendingSlides: 0,
        reviewProgress: 100,
        lastUpdated: new Date().toISOString(),
      }));
    }
    
    setIsProcessing(false);
    setCurrentAction(null);
    
    toast.success(`${quickAction.label}: ${result.successful} successful`);
    return result;
  }, [reviewState, updateState]);
  
  const acceptAll = useCallback(() => executeQuickAction('acceptAll'), [executeQuickAction]);
  const skipRemaining = useCallback(() => executeQuickAction('skipRemaining'), [executeQuickAction]);
  const enhanceAll = useCallback((type?: SlideEnhancementType) => {
    // For enhanceAll with type, use custom implementation
    if (!reviewState) {
      return Promise.resolve({ totalTargets: 0, successful: 0, failed: 0, skipped: 0, results: [], errors: [] });
    }
    
    const targets: ReviewActionTarget[] = reviewState.chapters
      .flatMap(ch => ch.slides)
      .filter(s => s.status === 'pending')
      .map(s => ({ scope: 'slide' as const, slideId: s.slideId }));
    
    const bulkAction: BulkReviewAction = {
      actionType: 'enhance',
      targets,
      options: { enhancementType: type || 'polish' },
    };
    
    setIsProcessing(true);
    return reviewActionService.executeBulkAction(bulkAction).finally(() => setIsProcessing(false));
  }, [reviewState]);
  
  const fixAllIssues = useCallback(() => executeQuickAction('fixAllIssues'), [executeQuickAction]);
  
  const analyzeQuality = useCallback(async (): Promise<ReviewActionResult> => {
    if (!reviewState) {
      return { success: false };
    }
    
    setIsProcessing(true);
    setCurrentAction('analyze');
    
    const result = await reviewActionService.executeAction('analyze', {
      scope: 'presentation',
      presentationId: reviewState.presentationId,
    }, { analysisType: 'quality' });
    
    setIsProcessing(false);
    setCurrentAction(null);
    
    return result;
  }, [reviewState]);
  
  const refreshAllSuggestions = useCallback(() => executeQuickAction('refreshSuggestions'), [executeQuickAction]);
  
  // ============================================
  // HELPER GETTERS
  // ============================================
  
  const getSlideState = useCallback((slideId: string): SlideReviewState | undefined => {
    if (!reviewState) return undefined;
    return reviewState.chapters.flatMap(ch => ch.slides).find(s => s.slideId === slideId);
  }, [reviewState]);
  
  const getElementState = useCallback((slideId: string, elementId: string): ElementReviewState | undefined => {
    const slide = getSlideState(slideId);
    if (!slide) return undefined;
    return slide.elements.find(e => e.id === elementId);
  }, [getSlideState]);
  
  const getPendingSlides = useCallback((): SlideReviewState[] => {
    if (!reviewState) return [];
    return reviewState.chapters.flatMap(ch => ch.slides).filter(s => s.status === 'pending');
  }, [reviewState]);
  
  const getIssuesForSlide = useCallback((slideId: string): ReviewIssue[] => {
    const slide = getSlideState(slideId);
    if (!slide) return [];
    return slide.elements.flatMap(e => e.issues);
  }, [getSlideState]);
  
  const getSuggestionsForSlide = useCallback((slideId: string): ReviewSuggestion[] => {
    const slide = getSlideState(slideId);
    if (!slide) return [];
    return slide.elements.flatMap(e => e.suggestions);
  }, [getSlideState]);
  
  return {
    // State
    reviewState,
    isProcessing,
    currentAction,
    processingTargets,
    
    // Initialize
    initializeReview,
    
    // Element-level
    acceptElement,
    skipElement,
    enhanceElement,
    analyzeElement,
    fixElement,
    refreshElement,
    revertElement,
    
    // Slide-level
    acceptSlide,
    skipSlide,
    enhanceSlide,
    analyzeSlide,
    fixSlide,
    refreshSlide,
    revertSlide,
    regenerateSlide,
    
    // Chapter-level
    acceptChapter,
    skipChapter,
    enhanceChapter,
    
    // Presentation-level
    executeQuickAction,
    acceptAll,
    skipRemaining,
    enhanceAll,
    fixAllIssues,
    analyzeQuality,
    refreshAllSuggestions,
    
    // Helpers
    getSlideState,
    getElementState,
    getPendingSlides,
    getIssuesForSlide,
    getSuggestionsForSlide,
  };
}

export default useReviewActions;
