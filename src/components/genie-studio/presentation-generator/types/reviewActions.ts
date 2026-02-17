/**
 * REVIEW ACTION TYPES
 * 
 * Unified types for handling Accept, Skip, Enhance, Analyze, Fix, Refresh actions
 * across all scopes: Element (inline), Slide, Chapter, and Presentation-wide
 * 
 * Works with all output types: 2D, 3D, Video, Interactive
 */

import { SlideEnhancementType, OutputType, SlideType } from '../types';

// ============================================
// ACTION TYPES
// ============================================

export type ReviewActionType = 
  | 'accept'       // Approve as-is
  | 'skip'         // Ignore, keep but don't review again
  | 'enhance'      // AI improvement
  | 'analyze'      // Get explanation/analysis
  | 'fix'          // Fix issues and replace
  | 'refresh'      // Regenerate with new suggestions
  | 'revert'       // Undo to original
  | 'regenerate'   // Complete regeneration
  | 'compare';     // Compare versions

// Scope determines what the action applies to
export type ReviewScope = 
  | 'element'      // Single bullet, text block, image, chart element
  | 'slide'        // Entire slide
  | 'chapter'      // All slides in chapter
  | 'presentation'; // All slides/chapters

// Element types that can be reviewed
export type ReviewableElementType = 
  | 'bullet'
  | 'title'
  | 'subtitle'
  | 'paragraph'
  | 'image'
  | 'chart'
  | 'table'
  | 'infographic'
  | 'video-scene'
  | '3d-model'
  | 'audio'
  | 'speaker-notes';

// ============================================
// ACTION INTERFACES
// ============================================

export interface ReviewActionTarget {
  scope: ReviewScope;
  
  // IDs for targeting
  presentationId?: string;
  chapterNumber?: number;
  slideId?: string;
  elementId?: string;
  elementType?: ReviewableElementType;
  
  // For batch operations
  slideIds?: string[];
  elementIds?: string[];
}

export interface ReviewAction {
  id: string;
  type: ReviewActionType;
  target: ReviewActionTarget;
  timestamp: string;
  
  // Enhancement options
  enhancementType?: SlideEnhancementType;
  customInstructions?: string;
  
  // Analysis options
  analysisType?: 'quality' | 'accuracy' | 'suggestions' | 'comparison';
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  
  // Result
  result?: ReviewActionResult;
}

export interface ReviewActionResult {
  success: boolean;
  
  // Updated content (if applicable)
  updatedContent?: {
    text?: string;
    bullets?: string[];
    imageUrl?: string;
    chartData?: any;
  };
  
  // Analysis results (if applicable)
  analysis?: {
    qualityScore: number;
    issues: ReviewIssue[];
    suggestions: ReviewSuggestion[];
    comparison?: VersionComparison;
  };
  
  // New suggestions (for refresh)
  suggestions?: ReviewSuggestion[];
  
  // Processing metrics
  processingTimeMs?: number;
  modelUsed?: string;
}

export interface ReviewIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'content' | 'formatting' | 'accuracy' | 'style' | 'accessibility';
  message: string;
  elementId?: string;
  autoFixable: boolean;
  suggestedFix?: string;
}

export interface ReviewSuggestion {
  id: string;
  type: 'enhance' | 'alternative' | 'addition' | 'removal';
  priority: 'high' | 'medium' | 'low';
  currentValue?: string;
  suggestedValue: string;
  reason: string;
  confidence: number;
  
  // For inline suggestions
  elementId?: string;
  elementType?: ReviewableElementType;
}

export interface VersionComparison {
  original: string;
  current: string;
  changes: {
    type: 'added' | 'removed' | 'modified';
    original?: string;
    current?: string;
  }[];
}

// ============================================
// STATE INTERFACES
// ============================================

export interface ElementReviewState {
  id: string;
  type: ReviewableElementType;
  status: 'pending' | 'reviewed' | 'accepted' | 'skipped' | 'enhanced';
  originalValue: string;
  currentValue: string;
  suggestions: ReviewSuggestion[];
  issues: ReviewIssue[];
  lastAction?: ReviewAction;
}

export interface SlideReviewState {
  slideId: string;
  slideNumber: number;
  slideType: SlideType;
  status: 'pending' | 'in-review' | 'accepted' | 'skipped' | 'needs-attention';
  elements: ElementReviewState[];
  overallQuality: number;
  pendingIssues: number;
  acceptedElements: number;
  skippedElements: number;
  lastAction?: ReviewAction;
}

export interface ChapterReviewState {
  chapterNumber: number;
  title: string;
  slides: SlideReviewState[];
  status: 'pending' | 'in-review' | 'completed';
  progress: number; // 0-100
}

export interface PresentationReviewState {
  presentationId: string;
  outputType: OutputType;
  structureMode: 'flat' | 'chapters';
  chapters: ChapterReviewState[];
  
  // Overall stats
  totalSlides: number;
  totalElements: number;
  acceptedSlides: number;
  skippedSlides: number;
  pendingSlides: number;
  enhancedSlides: number;
  
  // Quality metrics
  overallQuality: number;
  totalIssues: number;
  autoFixableIssues: number;
  
  // Progress
  reviewProgress: number; // 0-100
  lastUpdated: string;
}

// ============================================
// ACTION PAYLOAD TYPES
// ============================================

export interface AcceptActionPayload {
  target: ReviewActionTarget;
  acceptAll?: boolean; // Accept all pending in scope
}

export interface SkipActionPayload {
  target: ReviewActionTarget;
  reason?: string;
  skipAll?: boolean; // Skip all pending in scope
}

export interface EnhanceActionPayload {
  target: ReviewActionTarget;
  enhancementType: SlideEnhancementType;
  customInstructions?: string;
  applyToAll?: boolean; // Apply same enhancement to all in scope
}

export interface AnalyzeActionPayload {
  target: ReviewActionTarget;
  analysisType: 'quality' | 'accuracy' | 'suggestions' | 'comparison';
  includeHistory?: boolean;
}

export interface FixActionPayload {
  target: ReviewActionTarget;
  issues: string[]; // Issue IDs to fix
  autoFixAll?: boolean; // Fix all auto-fixable issues
  customFix?: string; // Manual fix instruction
}

export interface RefreshActionPayload {
  target: ReviewActionTarget;
  preserveAccepted?: boolean; // Don't regenerate accepted items
  newContext?: string; // Additional context for regeneration
}

export interface RevertActionPayload {
  target: ReviewActionTarget;
  revertAll?: boolean; // Revert all to original
}

// ============================================
// BULK ACTION INTERFACES
// ============================================

export interface BulkReviewAction {
  actionType: ReviewActionType;
  targets: ReviewActionTarget[];
  options?: {
    enhancementType?: SlideEnhancementType;
    customInstructions?: string;
    skipReason?: string;
    autoFix?: boolean;
  };
}

export interface BulkActionResult {
  totalTargets: number;
  successful: number;
  failed: number;
  skipped: number;
  results: ReviewActionResult[];
  errors: { targetId: string; error: string }[];
}

// ============================================
// QUICK ACTION PRESETS
// ============================================

export const QUICK_ACTIONS = {
  acceptAll: {
    label: 'Accept All',
    action: 'accept' as ReviewActionType,
    scope: 'presentation' as ReviewScope,
    icon: 'CheckCheck',
  },
  skipRemaining: {
    label: 'Skip Remaining',
    action: 'skip' as ReviewActionType,
    scope: 'presentation' as ReviewScope,
    icon: 'FastForward',
  },
  enhanceAll: {
    label: 'Enhance All',
    action: 'enhance' as ReviewActionType,
    scope: 'presentation' as ReviewScope,
    icon: 'Wand2',
  },
  fixAllIssues: {
    label: 'Auto-Fix All',
    action: 'fix' as ReviewActionType,
    scope: 'presentation' as ReviewScope,
    icon: 'Wrench',
  },
  analyzeQuality: {
    label: 'Analyze Quality',
    action: 'analyze' as ReviewActionType,
    scope: 'presentation' as ReviewScope,
    icon: 'Search',
  },
  refreshSuggestions: {
    label: 'Refresh Suggestions',
    action: 'refresh' as ReviewActionType,
    scope: 'presentation' as ReviewScope,
    icon: 'RefreshCw',
  },
} as const;

// ============================================
// HELPER TYPES
// ============================================

export type QuickActionKey = keyof typeof QUICK_ACTIONS;

export interface ReviewActionHandler {
  accept: (payload: AcceptActionPayload) => Promise<ReviewActionResult>;
  skip: (payload: SkipActionPayload) => Promise<ReviewActionResult>;
  enhance: (payload: EnhanceActionPayload) => Promise<ReviewActionResult>;
  analyze: (payload: AnalyzeActionPayload) => Promise<ReviewActionResult>;
  fix: (payload: FixActionPayload) => Promise<ReviewActionResult>;
  refresh: (payload: RefreshActionPayload) => Promise<ReviewActionResult>;
  revert: (payload: RevertActionPayload) => Promise<ReviewActionResult>;
  bulk: (action: BulkReviewAction) => Promise<BulkActionResult>;
}
