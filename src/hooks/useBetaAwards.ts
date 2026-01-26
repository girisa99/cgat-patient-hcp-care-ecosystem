/**
 * useBetaAwards Hook
 * 
 * React hook for integrating beta awards service with components.
 * Provides real-time badge tracking, credit updates, and achievement notifications.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  betaAwardsService, 
  BetaParticipant, 
  BetaBadge, 
  LeaderboardEntry,
  BETA_BADGES 
} from '@/services/betaAwardsService';

export interface UseBetaAwardsOptions {
  userId: string;
  email?: string;
  displayName?: string;
  autoEnroll?: boolean;
  showNotifications?: boolean;
}

export interface UseBetaAwardsReturn {
  // State
  participant: BetaParticipant | null;
  isEnrolled: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Badges
  allBadges: BetaBadge[];
  earnedBadges: BetaBadge[];
  availableBadges: BetaBadge[];
  badgeProgress: Map<string, { current: number; target: number; percentage: number }>;
  
  // Leaderboard
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  
  // Actions
  enroll: () => Promise<void>;
  trackGeneration: () => Promise<void>;
  trackFeedback: () => Promise<void>;
  trackBugReport: () => Promise<void>;
  trackFeatureRequest: () => Promise<void>;
  trackReferral: () => Promise<void>;
  trackTutorialComplete: () => Promise<void>;
  trackCommunityPost: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Utilities
  getTierColor: (tier: string) => string;
  getTierIcon: (tier: string) => string;
  getNextTierProgress: () => { current: number; required: number; percentage: number };
}

export function useBetaAwards(options: UseBetaAwardsOptions): UseBetaAwardsReturn {
  const { userId, email, displayName, autoEnroll = true, showNotifications = true } = options;
  
  const [participant, setParticipant] = useState<BetaParticipant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Load participant data
  const loadParticipant = useCallback(async () => {
    try {
      const data = await betaAwardsService.getParticipant(userId);
      setParticipant(data);
      return data;
    } catch (err) {
      console.error('Failed to load beta participant:', err);
      return null;
    }
  }, [userId]);

  // Load leaderboard
  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await betaAwardsService.getLeaderboard(20);
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    }
  }, []);

  // Enroll in beta program
  const enroll = useCallback(async () => {
    if (!email) {
      setError('Email required for enrollment');
      return;
    }
    
    try {
      setIsLoading(true);
      // Create a basic participant entry in localStorage
      const newParticipant: BetaParticipant = {
        id: userId,
        userId,
        email,
        displayName: displayName || email.split('@')[0],
        joinedAt: new Date(),
        tier: 'explorer',
        totalCreditsEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
        stats: {
          generationsCompleted: 0,
          feedbackSubmitted: 0,
          bugsReported: 0,
          featuresRequested: 0,
          referralsMade: 0,
          tutorialsCompleted: 0,
          communityPosts: 0,
        }
      };
      localStorage.setItem(`beta_participant_${userId}`, JSON.stringify(newParticipant));
      setParticipant(newParticipant);
      
      if (showNotifications) {
        toast.success('🎉 Welcome to the Beta Program!', {
          description: 'Start exploring to earn badges and credits.'
        });
      }
    } catch (err) {
      setError('Failed to enroll');
      console.error('Enrollment error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, email, displayName, showNotifications]);

  // Track activities with badge notification
  const trackWithNotification = useCallback(async (
    trackFn: () => Promise<void>,
    activityName: string
  ) => {
    const prevBadges = participant?.badges?.length || 0;
    
    await trackFn();
    const updated = await loadParticipant();
    
    if (updated && showNotifications) {
      const newBadges = (updated.badges?.length || 0) - prevBadges;
      if (newBadges > 0) {
        const latestBadge = BETA_BADGES.find(b => b.id === updated.badges[updated.badges.length - 1]);
        if (latestBadge) {
          toast.success(`🏆 Badge Earned: ${latestBadge.name}!`, {
            description: `${latestBadge.description} (+${latestBadge.creditsAwarded} credits)`
          });
        }
      }
    }
  }, [participant, loadParticipant, showNotifications]);

  // Activity tracking functions
  const trackGeneration = useCallback(async () => {
    await trackWithNotification(
      () => betaAwardsService.recordActivity(userId, 'generation'),
      'Generation'
    );
  }, [userId, trackWithNotification]);

  const trackFeedback = useCallback(async () => {
    await trackWithNotification(
      () => betaAwardsService.recordActivity(userId, 'feedback'),
      'Feedback'
    );
  }, [userId, trackWithNotification]);

  const trackBugReport = useCallback(async () => {
    await trackWithNotification(
      () => betaAwardsService.recordActivity(userId, 'bug_report'),
      'Bug Report'
    );
  }, [userId, trackWithNotification]);

  const trackFeatureRequest = useCallback(async () => {
    await trackWithNotification(
      () => betaAwardsService.recordActivity(userId, 'feature_request'),
      'Feature Request'
    );
  }, [userId, trackWithNotification]);

  const trackReferral = useCallback(async () => {
    await trackWithNotification(
      () => betaAwardsService.recordActivity(userId, 'referral'),
      'Referral'
    );
  }, [userId, trackWithNotification]);

  const trackTutorialComplete = useCallback(async () => {
    await trackWithNotification(
      () => betaAwardsService.recordActivity(userId, 'tutorial'),
      'Tutorial'
    );
  }, [userId, trackWithNotification]);

  const trackCommunityPost = useCallback(async () => {
    await trackWithNotification(
      () => betaAwardsService.recordActivity(userId, 'community'),
      'Community Post'
    );
  }, [userId, trackWithNotification]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([loadParticipant(), loadLeaderboard()]);
    setIsLoading(false);
  }, [loadParticipant, loadLeaderboard]);

  // Computed values
  const earnedBadges = BETA_BADGES.filter(b => participant?.badges?.includes(b.id));
  const availableBadges = BETA_BADGES.filter(b => !participant?.badges?.includes(b.id));
  
  // Badge progress calculation
  const badgeProgress = new Map<string, { current: number; target: number; percentage: number }>();
  if (participant) {
    availableBadges.forEach(badge => {
      let current = 0;
      const target = badge.requirement.target;
      
      switch (badge.requirement.metric) {
        case 'generations':
          current = participant.stats.generationsCompleted;
          break;
        case 'feedback':
          current = participant.stats.feedbackSubmitted;
          break;
        case 'bugs':
          current = participant.stats.bugsReported;
          break;
        case 'features':
          current = participant.stats.featuresRequested;
          break;
        case 'referrals':
          current = participant.stats.referralsMade;
          break;
        case 'tutorials':
          current = participant.stats.tutorialsCompleted;
          break;
        case 'streak':
          current = participant.currentStreak;
          break;
      }
      
      badgeProgress.set(badge.id, {
        current,
        target,
        percentage: Math.min((current / target) * 100, 100)
      });
    });
  }

  // User rank in leaderboard
  const userRank = leaderboard.findIndex(e => e.userId === userId) + 1 || null;

  // Tier utilities
  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      explorer: 'text-blue-500',
      contributor: 'text-green-500',
      champion: 'text-purple-500',
      pioneer: 'text-amber-500',
      bronze: 'text-orange-600',
      silver: 'text-gray-400',
      gold: 'text-yellow-500',
      platinum: 'text-cyan-400'
    };
    return colors[tier] || 'text-muted-foreground';
  };

  const getTierIcon = (tier: string): string => {
    const icons: Record<string, string> = {
      explorer: '🔍',
      contributor: '⭐',
      champion: '🏆',
      pioneer: '🚀'
    };
    return icons[tier] || '👤';
  };

  const getNextTierProgress = () => {
    const tierThresholds = {
      explorer: 100,
      contributor: 500,
      champion: 2000,
      pioneer: 10000
    };
    
    const currentCredits = participant?.totalCreditsEarned || 0;
    const currentTier = participant?.tier || 'explorer';
    
    const tiers = Object.entries(tierThresholds);
    const currentIndex = tiers.findIndex(([t]) => t === currentTier);
    const nextTier = tiers[currentIndex + 1];
    
    if (!nextTier) {
      return { current: currentCredits, required: tierThresholds.pioneer, percentage: 100 };
    }
    
    const prevRequired = currentIndex >= 0 ? tiers[currentIndex][1] : 0;
    const progress = currentCredits - prevRequired;
    const required = nextTier[1] - prevRequired;
    
    return {
      current: progress,
      required,
      percentage: Math.min((progress / required) * 100, 100)
    };
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const existing = await loadParticipant();
      
      if (!existing && autoEnroll && email) {
        await enroll();
      }
      
      await loadLeaderboard();
      setIsLoading(false);
    };
    
    if (userId) {
      init();
    }
  }, [userId, email, autoEnroll]);

  return {
    participant,
    isEnrolled: !!participant,
    isLoading,
    error,
    allBadges: BETA_BADGES,
    earnedBadges,
    availableBadges,
    badgeProgress,
    leaderboard,
    userRank,
    enroll,
    trackGeneration,
    trackFeedback,
    trackBugReport,
    trackFeatureRequest,
    trackReferral,
    trackTutorialComplete,
    trackCommunityPost,
    refresh,
    getTierColor,
    getTierIcon,
    getNextTierProgress
  };
}

export default useBetaAwards;
