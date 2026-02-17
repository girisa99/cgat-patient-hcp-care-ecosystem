/**
 * useSmartRegeneration Hook - Competitive Differentiator System
 * 
 * 5 Key Differentiators vs Competitors:
 * 1. RLHF Feedback Loop - "Why didn't you like it?" before regenerating
 * 2. Smart Suggestions - AI suggests what to fix vs blind retry
 * 3. Free Tier Credits - First 2-3 free per session
 * 4. Version History - Side-by-side comparison
 * 5. Targeted Regeneration - Only regenerate specific elements
 */

import { useState, useCallback, useMemo } from 'react';
import { useRefreshCaps, REFRESH_CAPS_BY_TIER } from './useRefreshCaps';

// ============================================================================
// TYPES
// ============================================================================

export interface RegenerationFeedback {
  reason: RegenerationReason;
  customFeedback?: string;
  affectedElements?: string[];
  suggestedFix?: string;
}

export type RegenerationReason = 
  | 'content_quality'      // "The content isn't accurate"
  | 'style_mismatch'       // "Doesn't match my brand"
  | 'length_issue'         // "Too long/short"
  | 'tone_wrong'           // "Wrong tone/voice"
  | 'missing_info'         // "Missing key information"
  | 'visual_issue'         // "Visuals don't work"
  | 'formatting'           // "Formatting issues"
  | 'just_exploring';      // "Just want to see alternatives"

export interface SmartSuggestion {
  id: string;
  type: 'enhance' | 'rewrite' | 'expand' | 'simplify' | 'restyle';
  label: string;
  description: string;
  confidence: number;
  estimatedImprovement: string;
  affectedElements: string[];
}

export interface VersionSnapshot {
  id: string;
  version: number;
  timestamp: Date;
  content: any;
  feedback?: RegenerationFeedback;
  qualityScore?: number;
  isOriginal?: boolean;
}

export interface FreeCreditsState {
  freeRegenerationsTotal: number;
  freeRegenerationsUsed: number;
  freeRegenerationsRemaining: number;
  isPaidRegeneration: boolean;
  discountPercent: number; // 0, 25, 50 based on feedback provided
}

// Competitive differentiator: First regenerations free per session
export const FREE_REGENS_BY_TIER: Record<string, number> = {
  free: 2,
  starter: 3,
  professional: 5,
  enterprise: Infinity,
};

// Discount for providing feedback (RLHF incentive)
export const FEEDBACK_DISCOUNT_PERCENT = 50;

// Reason labels for UI
export const REGENERATION_REASONS: Record<RegenerationReason, { label: string; icon: string; suggestAction: SmartSuggestion['type'] }> = {
  content_quality: { label: "Content isn't accurate", icon: '🎯', suggestAction: 'rewrite' },
  style_mismatch: { label: "Doesn't match my brand", icon: '🎨', suggestAction: 'restyle' },
  length_issue: { label: "Too long or too short", icon: '📏', suggestAction: 'expand' },
  tone_wrong: { label: "Wrong tone or voice", icon: '🗣️', suggestAction: 'rewrite' },
  missing_info: { label: "Missing key information", icon: '📝', suggestAction: 'expand' },
  visual_issue: { label: "Visuals don't work", icon: '🖼️', suggestAction: 'restyle' },
  formatting: { label: "Formatting issues", icon: '📋', suggestAction: 'simplify' },
  just_exploring: { label: "Just exploring alternatives", icon: '🔍', suggestAction: 'rewrite' },
};

// ============================================================================
// HOOK
// ============================================================================

export interface UseSmartRegenerationOptions {
  contentId: string;
  contentType: 'slide' | 'bullet' | 'video' | 'audio' | '3d' | 'avatar';
  userTier?: string;
  initialContent?: any;
  onFeedbackRecorded?: (feedback: RegenerationFeedback) => void;
  onVersionCreated?: (version: VersionSnapshot) => void;
}

export function useSmartRegeneration(options: UseSmartRegenerationOptions) {
  const {
    contentId,
    contentType,
    userTier = 'free',
    initialContent,
    onFeedbackRecorded,
    onVersionCreated,
  } = options;

  // Version history state
  const [versions, setVersions] = useState<VersionSnapshot[]>(() => 
    initialContent ? [{
      id: `${contentId}-v1`,
      version: 1,
      timestamp: new Date(),
      content: initialContent,
      isOriginal: true,
      qualityScore: 85,
    }] : []
  );

  // Free credits tracking (session-based)
  const [freeUsed, setFreeUsed] = useState(0);
  const [pendingFeedback, setPendingFeedback] = useState<RegenerationFeedback | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);

  // Use existing refresh caps for tier limits
  const refreshCaps = useRefreshCaps({ userTier });

  // ============================================================================
  // FREE CREDITS LOGIC (Differentiator #3)
  // ============================================================================

  const freeCreditsState = useMemo((): FreeCreditsState => {
    const freeTotal = FREE_REGENS_BY_TIER[userTier] || FREE_REGENS_BY_TIER.free;
    const freeRemaining = Math.max(0, freeTotal - freeUsed);
    const isPaid = freeRemaining === 0 && userTier !== 'enterprise';
    
    // Discount if feedback provided (RLHF incentive)
    const discount = pendingFeedback ? FEEDBACK_DISCOUNT_PERCENT : 0;

    return {
      freeRegenerationsTotal: freeTotal,
      freeRegenerationsUsed: freeUsed,
      freeRegenerationsRemaining: freeRemaining,
      isPaidRegeneration: isPaid,
      discountPercent: discount,
    };
  }, [userTier, freeUsed, pendingFeedback]);

  // ============================================================================
  // SMART SUGGESTIONS (Differentiator #2)
  // ============================================================================

  const generateSmartSuggestions = useCallback((feedback: RegenerationFeedback): SmartSuggestion[] => {
    const reasonConfig = REGENERATION_REASONS[feedback.reason];
    const suggestions: SmartSuggestion[] = [];

    // Primary suggestion based on feedback reason
    suggestions.push({
      id: `suggest-${feedback.reason}`,
      type: reasonConfig.suggestAction,
      label: `${reasonConfig.suggestAction.charAt(0).toUpperCase() + reasonConfig.suggestAction.slice(1)} Content`,
      description: `AI will ${reasonConfig.suggestAction} based on your feedback`,
      confidence: 0.85,
      estimatedImprovement: '+25% quality',
      affectedElements: feedback.affectedElements || ['all'],
    });

    // Secondary suggestions based on content type
    if (contentType === 'slide' && feedback.reason !== 'length_issue') {
      suggestions.push({
        id: 'suggest-bullets',
        type: 'simplify',
        label: 'Simplify Bullet Points',
        description: 'Reduce text and improve readability',
        confidence: 0.72,
        estimatedImprovement: '+15% clarity',
        affectedElements: ['bullets'],
      });
    }

    if (contentType === 'video' && feedback.reason === 'visual_issue') {
      suggestions.push({
        id: 'suggest-pacing',
        type: 'enhance',
        label: 'Adjust Pacing',
        description: 'Optimize scene transitions and timing',
        confidence: 0.78,
        estimatedImprovement: '+20% engagement',
        affectedElements: ['transitions', 'timing'],
      });
    }

    return suggestions.slice(0, 3); // Max 3 suggestions
  }, [contentType]);

  // ============================================================================
  // RLHF FEEDBACK (Differentiator #1)
  // ============================================================================

  const provideFeedback = useCallback((feedback: RegenerationFeedback) => {
    setPendingFeedback(feedback);
    
    // Generate smart suggestions based on feedback
    const suggestions = generateSmartSuggestions(feedback);
    setSmartSuggestions(suggestions);

    // Record for RLHF training
    console.log('[RLHF] Recording regeneration feedback:', {
      contentId,
      contentType,
      feedback,
      timestamp: new Date().toISOString(),
    });

    onFeedbackRecorded?.(feedback);
  }, [contentId, contentType, generateSmartSuggestions, onFeedbackRecorded]);

  const clearFeedback = useCallback(() => {
    setPendingFeedback(null);
    setSmartSuggestions([]);
  }, []);

  // ============================================================================
  // VERSION HISTORY (Differentiator #4)
  // ============================================================================

  const createVersion = useCallback((newContent: any, qualityScore?: number): VersionSnapshot => {
    const newVersion: VersionSnapshot = {
      id: `${contentId}-v${versions.length + 1}`,
      version: versions.length + 1,
      timestamp: new Date(),
      content: newContent,
      feedback: pendingFeedback || undefined,
      qualityScore: qualityScore || 85,
    };

    setVersions(prev => [...prev, newVersion]);
    onVersionCreated?.(newVersion);

    // Clear pending feedback after use
    clearFeedback();

    return newVersion;
  }, [contentId, versions.length, pendingFeedback, clearFeedback, onVersionCreated]);

  const revertToVersion = useCallback((versionId: string): VersionSnapshot | null => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return null;

    // Create a new version that's a copy of the old one
    return createVersion(version.content, version.qualityScore);
  }, [versions, createVersion]);

  const compareVersions = useCallback((versionId1: string, versionId2: string): { v1: VersionSnapshot | null; v2: VersionSnapshot | null } => {
    return {
      v1: versions.find(v => v.id === versionId1) || null,
      v2: versions.find(v => v.id === versionId2) || null,
    };
  }, [versions]);

  // ============================================================================
  // REGENERATION EXECUTION
  // ============================================================================

  const executeRegeneration = useCallback(async (
    regenerator: (feedback?: RegenerationFeedback) => Promise<any>,
    suggestion?: SmartSuggestion
  ): Promise<{ success: boolean; version?: VersionSnapshot; creditCost: number }> => {
    // Check if within limits
    if (!refreshCaps.canRefreshSlide(contentId)) {
      return { success: false, creditCost: 0 };
    }

    // Track free usage
    const isFree = freeCreditsState.freeRegenerationsRemaining > 0;
    
    // Calculate credit cost
    let creditCost = 1; // Base cost
    if (isFree) {
      creditCost = 0;
      setFreeUsed(prev => prev + 1);
    } else if (pendingFeedback) {
      creditCost = creditCost * (1 - FEEDBACK_DISCOUNT_PERCENT / 100);
    }

    try {
      // Execute with feedback context
      const result = await regenerator(pendingFeedback || undefined);
      
      // Create version snapshot
      const version = createVersion(result, 90);
      
      // Record refresh
      refreshCaps.recordSlideRefresh(contentId);

      return { success: true, version, creditCost };
    } catch (error) {
      console.error('[SmartRegen] Failed:', error);
      return { success: false, creditCost: 0 };
    }
  }, [contentId, refreshCaps, freeCreditsState, pendingFeedback, createVersion]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    versions,
    currentVersion: versions[versions.length - 1] || null,
    originalVersion: versions.find(v => v.isOriginal) || null,
    pendingFeedback,
    smartSuggestions,
    freeCredits: freeCreditsState,
    
    // Refresh caps (pass-through)
    caps: refreshCaps.caps,
    canRegenerate: refreshCaps.canRefreshSlide(contentId),
    regenerationsRemaining: refreshCaps.getSlideRefreshRemaining(contentId),
    
    // Actions
    provideFeedback,
    clearFeedback,
    executeRegeneration,
    createVersion,
    revertToVersion,
    compareVersions,
    
    // UI helpers
    reasons: REGENERATION_REASONS,
    isUnlimited: refreshCaps.isUnlimited,
  };
}

export default useSmartRegeneration;
