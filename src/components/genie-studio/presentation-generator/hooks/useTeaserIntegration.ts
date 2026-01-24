/**
 * Teaser Integration Hook
 * 
 * PURPOSE: Manage teaser display logic within the wizard/editor
 * - Determines when to show teasers based on generation flow
 * - Tracks user journey through generations
 * - Coordinates with subscription tier for upgrade prompts
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  useCombinationTeaser, 
  type TeaserPreview,
  type CombinationType 
} from '@/services/combinationTeaserService';

interface UseTeaserIntegrationOptions {
  userTier: 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';
  industry?: string;
  contentType?: string;
}

interface TeaserState {
  currentTeaser: TeaserPreview | null;
  isVisible: boolean;
  generationCount: number;
  showUpgradePrompt: boolean;
  selectedCombination: CombinationType | null;
}

export function useTeaserIntegration(options: UseTeaserIntegrationOptions) {
  const { userTier, industry, contentType } = options;
  const { 
    shouldShowTeaser, 
    recordEngagement,
    getContextualRecommendations,
    markAsConverted,
    resetSession,
    TEASER_CATALOG
  } = useCombinationTeaser();

  const [state, setState] = useState<TeaserState>({
    currentTeaser: null,
    isVisible: false,
    generationCount: 0,
    showUpgradePrompt: false,
    selectedCombination: null
  });

  // Reset session on mount
  useEffect(() => {
    resetSession();
  }, []);

  /**
   * Called after each successful generation
   */
  const onGenerationComplete = useCallback((slideCount?: number) => {
    const newCount = state.generationCount + 1;
    
    // Check if we should show a teaser
    const teaser = shouldShowTeaser({
      generationNumber: newCount,
      userTier,
      industry,
      contentType
    });

    setState(prev => ({
      ...prev,
      generationCount: newCount,
      currentTeaser: teaser,
      isVisible: teaser !== null
    }));

    return teaser;
  }, [state.generationCount, userTier, industry, contentType, shouldShowTeaser]);

  /**
   * User expressed interest in a teaser
   */
  const onTeaserInterested = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      showUpgradePrompt: true,
      selectedCombination: prev.currentTeaser?.combinationType || null
    }));
  }, []);

  /**
   * User dismissed teaser
   */
  const onTeaserDismissed = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      currentTeaser: null
    }));
  }, []);

  /**
   * Close upgrade prompt
   */
  const closeUpgradePrompt = useCallback(() => {
    setState(prev => ({
      ...prev,
      showUpgradePrompt: false,
      selectedCombination: null
    }));
  }, []);

  /**
   * User completed upgrade/purchase
   */
  const onUpgradeComplete = useCallback((combinationType: CombinationType) => {
    markAsConverted(combinationType);
    setState(prev => ({
      ...prev,
      showUpgradePrompt: false,
      selectedCombination: null
    }));
  }, [markAsConverted]);

  /**
   * Get inline teaser suggestions for specific slides
   */
  const getInlineSuggestions = useCallback((slideContext: {
    slideNumber: number;
    hasData?: boolean;
    hasPeople?: boolean;
    hasProducts?: boolean;
  }) => {
    // Don't suggest to business+ tier users
    if (['business', 'enterprise'].includes(userTier)) {
      return [];
    }

    const recommendations = getContextualRecommendations({
      industry,
      contentType,
      ...slideContext
    });

    // Return top 2 recommendations with full teaser data
    return recommendations
      .slice(0, 2)
      .map(type => TEASER_CATALOG[type])
      .filter(Boolean);
  }, [userTier, industry, contentType, getContextualRecommendations, TEASER_CATALOG]);

  /**
   * Manually trigger a specific teaser (for testing or explicit selection)
   */
  const showSpecificTeaser = useCallback((combinationType: CombinationType) => {
    const teaser = TEASER_CATALOG[combinationType];
    if (teaser) {
      setState(prev => ({
        ...prev,
        currentTeaser: teaser,
        isVisible: true
      }));
    }
  }, [TEASER_CATALOG]);

  return {
    // State
    currentTeaser: state.currentTeaser,
    isTeaserVisible: state.isVisible,
    generationCount: state.generationCount,
    showUpgradePrompt: state.showUpgradePrompt,
    selectedCombination: state.selectedCombination,
    
    // Actions
    onGenerationComplete,
    onTeaserInterested,
    onTeaserDismissed,
    closeUpgradePrompt,
    onUpgradeComplete,
    getInlineSuggestions,
    showSpecificTeaser,
    
    // Utilities
    TEASER_CATALOG
  };
}

export type UseTeaserIntegrationReturn = ReturnType<typeof useTeaserIntegration>;
