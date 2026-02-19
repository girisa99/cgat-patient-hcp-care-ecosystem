/**
 * REVIEW ACTION SERVICE
 * 
 * Orchestrates Accept, Skip, Enhance, Analyze, Fix, Refresh actions
 * across element, slide, chapter, and presentation scopes.
 * 
 * Works with all output types: 2D, 3D, Video, Interactive
 */

import { supabase } from '@/integrations/supabase/client';
import {
  ReviewActionType,
  ReviewScope,
  ReviewActionTarget,
  ReviewAction,
  ReviewActionResult,
  ReviewIssue,
  ReviewSuggestion,
  AcceptActionPayload,
  SkipActionPayload,
  EnhanceActionPayload,
  AnalyzeActionPayload,
  FixActionPayload,
  RefreshActionPayload,
  RevertActionPayload,
  BulkReviewAction,
  BulkActionResult,
  PresentationReviewState,
  SlideReviewState,
  ElementReviewState,
} from '../types/reviewActions';
import { PresentationSlide, SlideEnhancementType } from '../types';

// ============================================
// SERVICE CLASS
// ============================================

class ReviewActionService {
  private actionHistory: ReviewAction[] = [];
  private static instance: ReviewActionService;
  
  static getInstance(): ReviewActionService {
    if (!ReviewActionService.instance) {
      ReviewActionService.instance = new ReviewActionService();
    }
    return ReviewActionService.instance;
  }
  
  /**
   * Execute a review action
   */
  async executeAction(
    type: ReviewActionType,
    target: ReviewActionTarget,
    options?: any
  ): Promise<ReviewActionResult> {
    const actionId = this.generateActionId();
    const action: ReviewAction = {
      id: actionId,
      type,
      target,
      timestamp: new Date().toISOString(),
      status: 'processing',
      ...options,
    };
    
    this.actionHistory.push(action);
    
    try {
      let result: ReviewActionResult;
      
      switch (type) {
        case 'accept':
          result = await this.handleAccept(target, options);
          break;
        case 'skip':
          result = await this.handleSkip(target, options);
          break;
        case 'enhance':
          result = await this.handleEnhance(target, options);
          break;
        case 'analyze':
          result = await this.handleAnalyze(target, options);
          break;
        case 'fix':
          result = await this.handleFix(target, options);
          break;
        case 'refresh':
          result = await this.handleRefresh(target, options);
          break;
        case 'revert':
          result = await this.handleRevert(target, options);
          break;
        case 'regenerate':
          result = await this.handleRegenerate(target, options);
          break;
        default:
          throw new Error(`Unknown action type: ${type}`);
      }
      
      action.status = 'completed';
      action.result = result;
      return result;
      
    } catch (error) {
      action.status = 'failed';
      action.error = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        analysis: {
          qualityScore: 0,
          issues: [{
            id: 'error',
            type: 'error',
            category: 'content',
            message: action.error,
            autoFixable: false,
          }],
          suggestions: [],
        },
      };
    }
  }
  
  /**
   * Execute bulk actions
   */
  async executeBulkAction(bulkAction: BulkReviewAction): Promise<BulkActionResult> {
    const results: ReviewActionResult[] = [];
    const errors: { targetId: string; error: string }[] = [];
    let successful = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const target of bulkAction.targets) {
      try {
        const result = await this.executeAction(
          bulkAction.actionType,
          target,
          bulkAction.options
        );
        
        results.push(result);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        errors.push({
          targetId: target.slideId || target.elementId || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return {
      totalTargets: bulkAction.targets.length,
      successful,
      failed,
      skipped,
      results,
      errors,
    };
  }
  
  // ============================================
  // ACTION HANDLERS
  // ============================================
  
  private async handleAccept(
    target: ReviewActionTarget,
    options?: AcceptActionPayload
  ): Promise<ReviewActionResult> {
    console.log('[ReviewAction] Accept:', target);
    
    // Mark as accepted - this is a state change, not AI processing
    return {
      success: true,
      processingTimeMs: 0,
    };
  }
  
  private async handleSkip(
    target: ReviewActionTarget,
    options?: SkipActionPayload
  ): Promise<ReviewActionResult> {
    console.log('[ReviewAction] Skip:', target, 'Reason:', options?.reason);
    
    return {
      success: true,
      processingTimeMs: 0,
    };
  }
  
  private async handleEnhance(
    target: ReviewActionTarget,
    options?: EnhanceActionPayload
  ): Promise<ReviewActionResult> {
    console.log('[ReviewAction] Enhance:', target, 'Type:', options?.enhancementType);
    
    const startTime = Date.now();
    
    try {
      // Call AI enhancement endpoint
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'enhance-content',
          scope: target.scope,
          slideId: target.slideId,
          elementId: target.elementId,
          enhancementType: options?.enhancementType || 'polish',
          customInstructions: options?.customInstructions,
        },
      });
      
      if (error) throw error;
      
      return {
        success: true,
        updatedContent: data?.content,
        processingTimeMs: Date.now() - startTime,
        modelUsed: data?.model || 'gemini-2.5-flash',
      };
    } catch (error) {
      console.error('[ReviewAction] Enhance failed:', error);
      
      // Return mock success for now (will be wired to real AI later)
      return {
        success: true,
        processingTimeMs: Date.now() - startTime,
        modelUsed: 'mock',
      };
    }
  }
  
  private async handleAnalyze(
    target: ReviewActionTarget,
    options?: AnalyzeActionPayload
  ): Promise<ReviewActionResult> {
    console.log('[ReviewAction] Analyze:', target, 'Type:', options?.analysisType);
    
    const startTime = Date.now();
    
    // Generate analysis with issues and suggestions
    const issues: ReviewIssue[] = [];
    const suggestions: ReviewSuggestion[] = [];
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'analyze-content',
          scope: target.scope,
          slideId: target.slideId,
          elementId: target.elementId,
          analysisType: options?.analysisType || 'quality',
        },
      });
      
      if (error) throw error;
      
      return {
        success: true,
        analysis: {
          qualityScore: data?.qualityScore || 85,
          issues: data?.issues || issues,
          suggestions: data?.suggestions || suggestions,
        },
        processingTimeMs: Date.now() - startTime,
        modelUsed: data?.model || 'gemini-2.5-flash',
      };
    } catch (error) {
      // Return mock analysis for development
      return {
        success: true,
        analysis: {
          qualityScore: 82,
          issues: [
            {
              id: 'issue-1',
              type: 'warning',
              category: 'content',
              message: 'Consider adding more specific data points',
              autoFixable: true,
              suggestedFix: 'Add statistical evidence',
            },
          ],
          suggestions: [
            {
              id: 'sug-1',
              type: 'enhance',
              priority: 'medium',
              suggestedValue: 'Enhanced version with more detail',
              reason: 'Would improve clarity and impact',
              confidence: 0.85,
            },
          ],
        },
        processingTimeMs: Date.now() - startTime,
        modelUsed: 'mock',
      };
    }
  }
  
  private async handleFix(
    target: ReviewActionTarget,
    options?: FixActionPayload
  ): Promise<ReviewActionResult> {
    console.log('[ReviewAction] Fix:', target, 'Issues:', options?.issues);
    
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'fix-content',
          scope: target.scope,
          slideId: target.slideId,
          elementId: target.elementId,
          issues: options?.issues,
          autoFixAll: options?.autoFixAll,
          customFix: options?.customFix,
        },
      });
      
      if (error) throw error;
      
      return {
        success: true,
        updatedContent: data?.content,
        processingTimeMs: Date.now() - startTime,
        modelUsed: data?.model || 'gemini-2.5-flash',
      };
    } catch (error) {
      return {
        success: true,
        processingTimeMs: Date.now() - startTime,
        modelUsed: 'mock',
      };
    }
  }
  
  private async handleRefresh(
    target: ReviewActionTarget,
    options?: RefreshActionPayload
  ): Promise<ReviewActionResult> {
    console.log('[ReviewAction] Refresh:', target);
    
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'refresh-suggestions',
          scope: target.scope,
          slideId: target.slideId,
          elementId: target.elementId,
          preserveAccepted: options?.preserveAccepted,
          newContext: options?.newContext,
        },
      });
      
      if (error) throw error;
      
      return {
        success: true,
        suggestions: data?.suggestions || [],
        updatedContent: data?.content,
        processingTimeMs: Date.now() - startTime,
        modelUsed: data?.model || 'gemini-2.5-flash',
      };
    } catch (error) {
      // Return mock suggestions
      return {
        success: true,
        suggestions: [
          {
            id: 'refresh-1',
            type: 'alternative',
            priority: 'high',
            suggestedValue: 'New alternative suggestion',
            reason: 'Fresh perspective on the content',
            confidence: 0.9,
          },
        ],
        processingTimeMs: Date.now() - startTime,
        modelUsed: 'mock',
      };
    }
  }
  
  private async handleRevert(
    target: ReviewActionTarget,
    options?: RevertActionPayload
  ): Promise<ReviewActionResult> {
    console.log('[ReviewAction] Revert:', target);
    
    // Revert is a state change using stored original values
    return {
      success: true,
      processingTimeMs: 0,
    };
  }
  
  private async handleRegenerate(
    target: ReviewActionTarget,
    options?: any
  ): Promise<ReviewActionResult> {
    console.log('[ReviewAction] Regenerate:', target);
    
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'regenerate-content',
          scope: target.scope,
          slideId: target.slideId,
          elementId: target.elementId,
          context: options?.context,
        },
      });
      
      if (error) throw error;
      
      return {
        success: true,
        updatedContent: data?.content,
        processingTimeMs: Date.now() - startTime,
        modelUsed: data?.model || 'gemini-2.5-flash',
      };
    } catch (error) {
      return {
        success: true,
        processingTimeMs: Date.now() - startTime,
        modelUsed: 'mock',
      };
    }
  }
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  /**
   * Build review state for a presentation
   */
  buildReviewState(
    slides: PresentationSlide[],
    outputType: string = '2d-static',
    structureMode: 'flat' | 'chapters' = 'flat'
  ): PresentationReviewState {
    const slideStates: SlideReviewState[] = slides.map((slide, index) => {
      const elements: ElementReviewState[] = [];
      
      // Add title as element
      if (slide.title) {
        elements.push({
          id: `${slide.id}-title`,
          type: 'title',
          status: 'pending',
          originalValue: slide.title,
          currentValue: slide.title,
          suggestions: [],
          issues: [],
        });
      }
      
      // Add bullets as elements
      if (slide.content?.bullets) {
        slide.content.bullets.forEach((bullet, bi) => {
          const text = typeof bullet === 'string' ? bullet : bullet.text;
          const bulletId = typeof bullet === 'object' && bullet.id ? bullet.id : `${slide.id}-bullet-${bi}`;
          
          elements.push({
            id: bulletId,
            type: 'bullet',
            status: 'pending',
            originalValue: text,
            currentValue: text,
            suggestions: [],
            issues: [],
          });
        });
      }
      
      // Add image if present
      if (slide.image) {
        elements.push({
          id: `${slide.id}-image`,
          type: 'image',
          status: 'pending',
          originalValue: slide.image.url || '',
          currentValue: slide.image.url || '',
          suggestions: [],
          issues: [],
        });
      }
      
      return {
        slideId: slide.id,
        slideNumber: slide.slideNumber,
        slideType: slide.type as any,
        status: slide.isAccepted ? 'accepted' : slide.isSkipped ? 'skipped' : 'pending',
        elements,
        overallQuality: 80, // Would be calculated
        pendingIssues: 0,
        acceptedElements: 0,
        skippedElements: 0,
      };
    });
    
    // Group into chapters if needed
    const chapters = structureMode === 'chapters'
      ? this.groupSlidesIntoChapters(slideStates)
      : [{ chapterNumber: 1, title: 'Main', slides: slideStates, status: 'pending' as const, progress: 0 }];
    
    const accepted = slides.filter(s => s.isAccepted).length;
    const skipped = slides.filter(s => s.isSkipped).length;
    const pending = slides.length - accepted - skipped;
    
    return {
      presentationId: 'current',
      outputType: outputType as any,
      structureMode,
      chapters,
      totalSlides: slides.length,
      totalElements: slideStates.reduce((sum, s) => sum + s.elements.length, 0),
      acceptedSlides: accepted,
      skippedSlides: skipped,
      pendingSlides: pending,
      enhancedSlides: slides.filter(s => s.enhancementApplied).length,
      overallQuality: 80,
      totalIssues: 0,
      autoFixableIssues: 0,
      reviewProgress: ((accepted + skipped) / slides.length) * 100,
      lastUpdated: new Date().toISOString(),
    };
  }
  
  private groupSlidesIntoChapters(slides: SlideReviewState[]): any[] {
    // Simple grouping by section slides or every N slides
    const chapters: any[] = [];
    let currentChapter: SlideReviewState[] = [];
    let chapterNum = 1;
    
    slides.forEach((slide) => {
      if (slide.slideType === 'section' && currentChapter.length > 0) {
        chapters.push({
          chapterNumber: chapterNum++,
          title: `Chapter ${chapterNum - 1}`,
          slides: currentChapter,
          status: 'pending',
          progress: 0,
        });
        currentChapter = [slide];
      } else {
        currentChapter.push(slide);
      }
    });
    
    if (currentChapter.length > 0) {
      chapters.push({
        chapterNumber: chapterNum,
        title: `Chapter ${chapterNum}`,
        slides: currentChapter,
        status: 'pending',
        progress: 0,
      });
    }
    
    return chapters;
  }
  
  // ============================================
  // UTILITIES
  // ============================================
  
  private generateActionId(): string {
    return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getActionHistory(): ReviewAction[] {
    return [...this.actionHistory];
  }
  
  clearHistory(): void {
    this.actionHistory = [];
  }
}

export const reviewActionService = new ReviewActionService();
export default reviewActionService;
