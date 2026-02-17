/**
 * useEcosystemIntegration Hook
 * 
 * React hook for integrating with the Genie ecosystem services.
 * Provides unified access to beta awards, feedback, confidence loop, and Ask Genie.
 */

import { useCallback, useMemo } from 'react';
import { useGenieStudioAuth } from './useGenieStudioAuth';
import { useBetaAwards } from './useBetaAwards';
import { ecosystemIntegrationService, EcosystemEvent, EcosystemContext, FeedbackPayload, GenerationResult } from '@/services/ecosystemIntegrationService';

export type GenieProduct = 'deck' | 'spark' | 'mind' | 'vibe' | 'arc' | 'hub' | 'cast' | 'ask_genie';

interface UseEcosystemIntegrationOptions {
  product: GenieProduct;
  tier?: 1 | 2 | 3;
  language?: string;
  industry?: string;
}

export function useEcosystemIntegration(options: UseEcosystemIntegrationOptions) {
  const { product, tier = 2, language, industry } = options;
  const { user, genieUser } = useGenieStudioAuth();

  const userId = user?.id || 'anonymous';
  const email = user?.email || genieUser?.email;
  const displayName = genieUser?.display_name || user?.email?.split('@')[0];

  // Beta awards integration
  const betaAwards = useBetaAwards({
    userId,
    email,
    displayName,
    autoEnroll: !!user,
    showNotifications: true
  });

  // Build context for ecosystem events
  const context: EcosystemContext = useMemo(() => ({
    userId,
    product,
    tier,
    language,
    industry,
    sessionId: typeof window !== 'undefined' ? sessionStorage.getItem('genie_session_id') || undefined : undefined
  }), [userId, product, tier, language, industry]);

  // Event tracking
  const trackEvent = useCallback(async (event: EcosystemEvent, data?: any) => {
    await ecosystemIntegrationService.trackEvent(event, context, data);
  }, [context]);

  // Generation tracking
  const trackGenerationStart = useCallback(async (metadata?: any) => {
    await trackEvent('generation_started', metadata);
  }, [trackEvent]);

  const trackGenerationComplete = useCallback(async (result: GenerationResult) => {
    await trackEvent('generation_completed', result);
    
    // Also update beta awards
    if (result.success) {
      await betaAwards.trackGeneration();
    }
  }, [trackEvent, betaAwards]);

  const trackGenerationFailed = useCallback(async (error: any) => {
    await trackEvent('generation_failed', { error: error?.message || String(error) });
  }, [trackEvent]);

  // Feedback tracking
  const submitFeedback = useCallback(async (feedback: Omit<FeedbackPayload, 'userId'>) => {
    await trackEvent('feedback_submitted', feedback);
    
    // Also update beta awards for feedback
    await betaAwards.trackFeedback();
  }, [trackEvent, betaAwards]);

  // Support tracking
  const trackBugReport = useCallback(async (details?: any) => {
    await trackEvent('bug_reported', details);
    await betaAwards.trackBugReport();
  }, [trackEvent, betaAwards]);

  const trackFeatureRequest = useCallback(async (details?: any) => {
    await trackEvent('feature_requested', details);
    await betaAwards.trackFeatureRequest();
  }, [trackEvent, betaAwards]);

  // Wizard tracking
  const trackWizardStep = useCallback(async (step: number, stepName: string, selections?: any) => {
    await trackEvent('wizard_step_completed', { step, stepName, selections });
  }, [trackEvent]);

  // Editor tracking
  const trackEditorAction = useCallback(async (action: string, elementId?: string, duration?: number) => {
    await trackEvent('editor_action', { action, elementId, duration });
  }, [trackEvent]);

  // Tutorial tracking
  const trackTutorialComplete = useCallback(async (tutorialId?: string) => {
    await trackEvent('tutorial_completed', { tutorialId });
    await betaAwards.trackTutorialComplete();
  }, [trackEvent, betaAwards]);

  // Community tracking
  const trackCommunityPost = useCallback(async (postId?: string) => {
    await trackEvent('community_post_created', { postId });
    await betaAwards.trackCommunityPost();
  }, [trackEvent, betaAwards]);

  // Get services status
  const servicesStatus = useMemo(() => 
    ecosystemIntegrationService.getServicesStatus(),
  []);

  // Get Ask Genie context
  const askGenieContext = useMemo(() => 
    ecosystemIntegrationService.getAskGenieContext(context),
  [context]);

  // Get filtered frameworks for current tier
  const getFilteredFrameworks = useCallback((type?: string) => 
    ecosystemIntegrationService.getFilteredFrameworks(tier, type),
  [tier]);

  // Build audio config
  const buildAudioConfig = useCallback((voiceConfig: any, audioOptions: any) => 
    ecosystemIntegrationService.buildAudioConfig(voiceConfig, audioOptions),
  []);

  return {
    // Context
    context,
    userId,
    isAuthenticated: !!user,

    // Beta Awards
    betaAwards: {
      participant: betaAwards.participant,
      isEnrolled: betaAwards.isEnrolled,
      earnedBadges: betaAwards.earnedBadges,
      availableBadges: betaAwards.availableBadges,
      leaderboard: betaAwards.leaderboard,
      userRank: betaAwards.userRank,
      getTierColor: betaAwards.getTierColor,
      getTierIcon: betaAwards.getTierIcon,
      getNextTierProgress: betaAwards.getNextTierProgress
    },

    // Event Tracking
    trackEvent,
    trackGenerationStart,
    trackGenerationComplete,
    trackGenerationFailed,
    submitFeedback,
    trackBugReport,
    trackFeatureRequest,
    trackWizardStep,
    trackEditorAction,
    trackTutorialComplete,
    trackCommunityPost,

    // Ecosystem Services
    servicesStatus,
    askGenieContext,
    getFilteredFrameworks,
    buildAudioConfig
  };
}

export default useEcosystemIntegration;
