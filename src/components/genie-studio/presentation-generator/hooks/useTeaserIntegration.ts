/**
 * Teaser Integration Hook
 * 
 * TEASER FLOW DOCUMENTATION:
 * 
 * 1. USER DECISION OPTIONS:
 *    - "Skip" → User gets PLAIN slide/deck (no combination applied)
 *    - "Apply to Slide" → Combination applied to SPECIFIC slide only
 *    - "Apply to All" → Combination applied to ENTIRE deck
 *    - "Replace Slide" → Original slide REPLACED with combination version
 *    - "Add Slide" → NEW slide added with combination (keeps original)
 * 
 * 2. TEASER INTERVALS:
 *    - Generation 1: Show animation/kinetic (low barrier)
 *    - Generation 3-4: Show avatar/talking photo (high value)
 *    - Generation 5-6: Show data viz/3D (practical + wow)
 *    - Generation 7+: Show immersive/full-body (premium)
 *    - Cooldown: 2-3 generations between teasers
 *    - Max per session: 3 teasers
 * 
 * 3. PERSONALIZATION (from 8-step wizard):
 *    - Industry: Matches teaser to industry (e.g., 3D for manufacturing)
 *    - Content Type: Matches teaser to purpose (e.g., avatar for training)
 *    - Visual Features: Matches teaser to selected features
 *    - Framework: Context for storytelling teasers
 * 
 * 4. LEARNING:
 *    - Like/Dislike/Interested sent to Label Studio
 *    - Preference scores adjust future recommendations
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  useCombinationTeaser, 
  type TeaserPreview,
  type CombinationType,
  type TeaserDecision,
  type WizardTeaserContext
} from '@/services/combinationTeaserService';

interface UseTeaserIntegrationOptions {
  userTier: 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';
  wizardContext?: WizardTeaserContext; // Full 8-step wizard context
}

interface TeaserState {
  currentTeaser: TeaserPreview | null;
  isVisible: boolean;
  generationCount: number;
  showUpgradePrompt: boolean;
  selectedCombination: CombinationType | null;
  userDecision: TeaserDecision | null;
  targetSlide: number | null; // Which slide to apply combination to
}

export function useTeaserIntegration(options: UseTeaserIntegrationOptions) {
  const { userTier, wizardContext } = options;
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
    selectedCombination: null,
    userDecision: null,
    targetSlide: null
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
    
    // Check if we should show a teaser (using wizard context for personalization)
    const teaser = shouldShowTeaser({
      generationNumber: newCount,
      userTier,
      industry: wizardContext?.industry,
      contentType: wizardContext?.contentType
    });

    setState(prev => ({
      ...prev,
      generationCount: newCount,
      currentTeaser: teaser,
      isVisible: teaser !== null
    }));

    return teaser;
  }, [state.generationCount, userTier, wizardContext, shouldShowTeaser]);

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
