/**
 * useConfidenceGatedSuggestions Hook
 * 
 * Proactively shows inline suggestions when confidence thresholds are met.
 * Wires the existing InlineHint system from labelStudioBackgroundService
 * into a React-consumable hook with gating logic.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { labelStudioService, type InlineHint } from '@/services/labelStudioBackgroundService';
import { audienceRelevanceService } from '@/services/audienceRelevanceService';

export interface GatedSuggestion {
  id: string;
  type: 'hint' | 'audience' | 'quality';
  message: string;
  confidence: number;
  action?: {
    label: string;
    callback: () => void;
  };
  dismissed: boolean;
}

interface UseConfidenceGatedSuggestionsOptions {
  product: 'mind' | 'spark' | 'vibe' | 'arc' | 'hub';
  /** Minimum confidence threshold to show a suggestion (default: 0.7) */
  threshold?: number;
  /** Max suggestions to show at once (default: 3) */
  maxVisible?: number;
  /** Whether to include audience-learned suggestions */
  includeAudienceLearning?: boolean;
  productId?: string;
  enabled?: boolean;
}

export function useConfidenceGatedSuggestions(options: UseConfidenceGatedSuggestionsOptions) {
  const {
    product,
    threshold = 0.7,
    maxVisible = 3,
    includeAudienceLearning = false,
    productId,
    enabled = true,
  } = options;

  const [suggestions, setSuggestions] = useState<GatedSuggestion[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const hasLoaded = useRef(false);

  // Load hints from Label Studio service
  const loadSuggestions = useCallback(async () => {
    if (!enabled) return;

    const hints = labelStudioService.getInlineHints(product, {});
    
    // Filter by threshold and convert to GatedSuggestion
    const gated: GatedSuggestion[] = hints
      .filter(h => h.confidence >= threshold && !dismissed.has(h.id))
      .map(h => ({
        id: h.id,
        type: 'hint' as const,
        message: h.message,
        confidence: h.confidence,
        action: h.action,
        dismissed: false,
      }));

    // Optionally add audience-learned suggestions
    if (includeAudienceLearning && productId) {
      const scores = await audienceRelevanceService.getRelevanceScores(productId);
      const highScores = scores.filter(s => s.relevance_score >= 0.8 && s.feedback_count >= 3);
      
      if (highScores.length > 0) {
        gated.push({
          id: `audience_learned_${productId}`,
          type: 'audience',
          message: `Based on feedback, ${highScores[0].audience_id} is your strongest audience (${Math.round(highScores[0].relevance_score * 100)}% match)`,
          confidence: highScores[0].relevance_score,
          dismissed: false,
        });
      }
    }

    setSuggestions(gated.slice(0, maxVisible));
  }, [product, threshold, maxVisible, includeAudienceLearning, productId, enabled, dismissed]);

  useEffect(() => {
    if (!hasLoaded.current) {
      loadSuggestions();
      hasLoaded.current = true;
    }
  }, [loadSuggestions]);

  const dismissSuggestion = useCallback((id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    setSuggestions(prev => prev.filter(s => s.id !== id));
    
    // Record dismissal as training event
    labelStudioService.recordEvent({
      eventType: 'hashtag_rejected',
      context: {
        product,
        contentType: 'inline_suggestion',
        originalValue: id,
        userAction: 'ignore',
      },
    });
  }, [product]);

  const acceptSuggestion = useCallback((id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    setSuggestions(prev => prev.filter(s => s.id !== id));
    
    labelStudioService.recordEvent({
      eventType: 'seo_applied',
      context: {
        product,
        contentType: 'inline_suggestion',
        originalValue: id,
        userAction: 'accept',
      },
    });
  }, [product]);

  const refresh = useCallback(() => {
    hasLoaded.current = false;
    loadSuggestions();
  }, [loadSuggestions]);

  return {
    suggestions,
    dismissSuggestion,
    acceptSuggestion,
    refresh,
    hasSuggestions: suggestions.length > 0,
  };
}
