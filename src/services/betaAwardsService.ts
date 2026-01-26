/**
 * Beta Awards Service
 * 
 * Gamified rewards system for beta testers with badges, credits, and achievements.
 * Uses client-side storage for beta phase - can be migrated to DB later.
 */

// ==================== TYPES ====================

export interface BetaBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: 'participation' | 'quality' | 'community' | 'milestone' | 'special';
  creditsAwarded: number;
  requirement: BadgeRequirement;
  unlockedAt?: Date;
}

export interface BadgeRequirement {
  type: 'count' | 'streak' | 'quality' | 'referral' | 'feedback' | 'special';
  target: number;
  metric?: string;
}

export interface BetaParticipant {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  joinedAt: Date;
  tier: 'explorer' | 'contributor' | 'champion' | 'pioneer';
  totalCreditsEarned: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  stats: ParticipantStats;
}

export interface ParticipantStats {
  generationsCompleted: number;
  feedbackSubmitted: number;
  bugsReported: number;
  featuresRequested: number;
  referralsMade: number;
  tutorialsCompleted: number;
  communityPosts: number;
}

export interface BetaReward {
  id: string;
  participantId: string;
  type: 'badge' | 'credits' | 'feature_unlock' | 'recognition';
  badgeId?: string;
  creditsAmount?: number;
  featureId?: string;
  awardedAt: Date;
  reason: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  tier: string;
  totalCredits: number;
  badgeCount: number;
  streak: number;
}

// ==================== BADGE DEFINITIONS ====================

export const BETA_BADGES: BetaBadge[] = [
  // Participation badges
  {
    id: 'first_generation',
    name: 'First Steps',
    description: 'Complete your first AI generation',
    icon: '🎯',
    tier: 'bronze',
    category: 'participation',
    creditsAwarded: 10,
    requirement: { type: 'count', target: 1, metric: 'generations' },
  },
  {
    id: 'explorer_10',
    name: 'Explorer',
    description: 'Complete 10 generations',
    icon: '🔍',
    tier: 'bronze',
    category: 'participation',
    creditsAwarded: 25,
    requirement: { type: 'count', target: 10, metric: 'generations' },
  },
  {
    id: 'power_user_50',
    name: 'Power User',
    description: 'Complete 50 generations',
    icon: '⚡',
    tier: 'silver',
    category: 'participation',
    creditsAwarded: 50,
    requirement: { type: 'count', target: 50, metric: 'generations' },
  },
  {
    id: 'dedicated_100',
    name: 'Dedicated Tester',
    description: 'Complete 100 generations',
    icon: '💪',
    tier: 'gold',
    category: 'participation',
    creditsAwarded: 100,
    requirement: { type: 'count', target: 100, metric: 'generations' },
  },
  
  // Streak badges
  {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Maintain a 3-day usage streak',
    icon: '🔥',
    tier: 'bronze',
    category: 'milestone',
    creditsAwarded: 15,
    requirement: { type: 'streak', target: 3 },
  },
  {
    id: 'streak_7',
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day usage streak',
    icon: '📅',
    tier: 'silver',
    category: 'milestone',
    creditsAwarded: 35,
    requirement: { type: 'streak', target: 7 },
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day usage streak',
    icon: '🏆',
    tier: 'gold',
    category: 'milestone',
    creditsAwarded: 150,
    requirement: { type: 'streak', target: 30 },
  },
  
  // Feedback badges
  {
    id: 'feedback_first',
    name: 'Voice Heard',
    description: 'Submit your first feedback',
    icon: '💬',
    tier: 'bronze',
    category: 'quality',
    creditsAwarded: 15,
    requirement: { type: 'feedback', target: 1 },
  },
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'Report 5 confirmed bugs',
    icon: '🐛',
    tier: 'silver',
    category: 'quality',
    creditsAwarded: 50,
    requirement: { type: 'feedback', target: 5, metric: 'bugs' },
  },
  {
    id: 'quality_champion',
    name: 'Quality Champion',
    description: 'Submit 20 pieces of feedback',
    icon: '✨',
    tier: 'gold',
    category: 'quality',
    creditsAwarded: 100,
    requirement: { type: 'feedback', target: 20 },
  },
  
  // Community badges
  {
    id: 'referral_first',
    name: 'Ambassador',
    description: 'Refer your first beta tester',
    icon: '🤝',
    tier: 'bronze',
    category: 'community',
    creditsAwarded: 25,
    requirement: { type: 'referral', target: 1 },
  },
  {
    id: 'referral_5',
    name: 'Influencer',
    description: 'Refer 5 beta testers',
    icon: '📣',
    tier: 'silver',
    category: 'community',
    creditsAwarded: 75,
    requirement: { type: 'referral', target: 5 },
  },
  {
    id: 'referral_10',
    name: 'Community Builder',
    description: 'Refer 10 beta testers',
    icon: '🌟',
    tier: 'gold',
    category: 'community',
    creditsAwarded: 200,
    requirement: { type: 'referral', target: 10 },
  },
  
  // Special badges
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined during beta launch week',
    icon: '🚀',
    tier: 'platinum',
    category: 'special',
    creditsAwarded: 100,
    requirement: { type: 'special', target: 1, metric: 'launch_week' },
  },
  {
    id: 'multilingual_master',
    name: 'Multilingual Master',
    description: 'Generate content in 5+ languages',
    icon: '🌍',
    tier: 'gold',
    category: 'special',
    creditsAwarded: 75,
    requirement: { type: 'count', target: 5, metric: 'languages_used' },
  },
  {
    id: 'all_products',
    name: 'Suite Explorer',
    description: 'Use all 7 Genie products',
    icon: '💎',
    tier: 'platinum',
    category: 'special',
    creditsAwarded: 150,
    requirement: { type: 'count', target: 7, metric: 'products_used' },
  },
];

// ==================== SERVICE ====================

class BetaAwardsService {
  /**
   * Get all available badges
   */
  getAllBadges(): BetaBadge[] {
    return BETA_BADGES;
  }

  /**
   * Get badges by category
   */
  getBadgesByCategory(category: BetaBadge['category']): BetaBadge[] {
    return BETA_BADGES.filter(b => b.category === category);
  }

  /**
   * Get badges by tier
   */
  getBadgesByTier(tier: BetaBadge['tier']): BetaBadge[] {
    return BETA_BADGES.filter(b => b.tier === tier);
  }

  /**
   * Check if user qualifies for any new badges
   */
  async checkBadgeEligibility(userId: string): Promise<BetaBadge[]> {
    const participant = await this.getParticipant(userId);
    if (!participant) return [];

    const earnedBadgeIds = new Set(participant.badges);
    const eligible: BetaBadge[] = [];

    for (const badge of BETA_BADGES) {
      if (earnedBadgeIds.has(badge.id)) continue;

      if (this.meetsRequirement(badge.requirement, participant.stats, participant)) {
        eligible.push(badge);
      }
    }

    return eligible;
  }

  /**
   * Award badge to user (client-side tracking - no DB required)
   */
  async awardBadge(userId: string, badgeId: string): Promise<BetaReward | null> {
    const badge = BETA_BADGES.find(b => b.id === badgeId);
    if (!badge) return null;

    const reward: BetaReward = {
      id: `reward_${Date.now()}`,
      participantId: userId,
      type: 'badge',
      badgeId,
      creditsAmount: badge.creditsAwarded,
      awardedAt: new Date(),
      reason: `Earned badge: ${badge.name}`,
    };

    // Store in localStorage for client-side persistence
    const rewards = this.getStoredRewards(userId);
    rewards.push(reward);
    localStorage.setItem(`beta_rewards_${userId}`, JSON.stringify(rewards));

    return reward;
  }

  /**
   * Award credits to user (client-side tracking)
   */
  async awardCredits(userId: string, amount: number, reason: string): Promise<BetaReward | null> {
    const reward: BetaReward = {
      id: `reward_${Date.now()}`,
      participantId: userId,
      type: 'credits',
      creditsAmount: amount,
      awardedAt: new Date(),
      reason,
    };

    const rewards = this.getStoredRewards(userId);
    rewards.push(reward);
    localStorage.setItem(`beta_rewards_${userId}`, JSON.stringify(rewards));

    return reward;
  }

  /**
   * Record user activity for streak tracking (client-side)
   */
  async recordActivity(userId: string, activityType: string): Promise<void> {
    const key = `beta_activity_${userId}`;
    const activities = JSON.parse(localStorage.getItem(key) || '[]');
    activities.push({ date: new Date().toISOString().split('T')[0], type: activityType });
    localStorage.setItem(key, JSON.stringify(activities));
  }

  /**
   * Get leaderboard (mock data for now)
   */
  async getLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
    // Return mock leaderboard data
    return [
      { rank: 1, userId: 'user1', displayName: 'Top Tester', tier: 'pioneer', totalCredits: 500, badgeCount: 12, streak: 30 },
      { rank: 2, userId: 'user2', displayName: 'Beta Champion', tier: 'champion', totalCredits: 350, badgeCount: 8, streak: 15 },
      { rank: 3, userId: 'user3', displayName: 'Active User', tier: 'contributor', totalCredits: 200, badgeCount: 5, streak: 7 },
    ].slice(0, limit);
  }

  /**
   * Get participant by user ID (client-side)
   */
  async getParticipant(userId: string): Promise<BetaParticipant | null> {
    const rewards = this.getStoredRewards(userId);
    const badges = rewards.filter(r => r.type === 'badge').map(r => r.badgeId!);
    const totalCredits = rewards.reduce((sum, r) => sum + (r.creditsAmount || 0), 0);

    return {
      id: userId,
      userId,
      email: '',
      displayName: 'Beta Tester',
      joinedAt: new Date(),
      tier: totalCredits >= 300 ? 'pioneer' : totalCredits >= 150 ? 'champion' : totalCredits >= 50 ? 'contributor' : 'explorer',
      totalCreditsEarned: totalCredits,
      currentStreak: this.calculateStreak(userId),
      longestStreak: this.calculateStreak(userId),
      badges,
      stats: this.getDefaultStats(),
    };
  }

  /**
   * Get user's rewards history (client-side)
   */
  async getRewardsHistory(userId: string): Promise<BetaReward[]> {
    return this.getStoredRewards(userId);
  }

  private getStoredRewards(userId: string): BetaReward[] {
    try {
      return JSON.parse(localStorage.getItem(`beta_rewards_${userId}`) || '[]');
    } catch {
      return [];
    }
  }

  private calculateStreak(userId: string): number {
    try {
      const activities = JSON.parse(localStorage.getItem(`beta_activity_${userId}`) || '[]');
      if (activities.length === 0) return 0;
      // Simple streak calculation
      return Math.min(activities.length, 7);
    } catch {
      return 0;
    }
  }

  // ==================== PRIVATE HELPERS ====================

  private meetsRequirement(
    requirement: BadgeRequirement,
    stats: ParticipantStats,
    participant: BetaParticipant
  ): boolean {
    switch (requirement.type) {
      case 'count':
        const metricValue = this.getStatValue(stats, requirement.metric);
        return metricValue >= requirement.target;
      
      case 'streak':
        return participant.currentStreak >= requirement.target;
      
      case 'feedback':
        if (requirement.metric === 'bugs') {
          return stats.bugsReported >= requirement.target;
        }
        return stats.feedbackSubmitted >= requirement.target;
      
      case 'referral':
        return stats.referralsMade >= requirement.target;
      
      case 'special':
        return this.checkSpecialRequirement(requirement, participant);
      
      default:
        return false;
    }
  }

  private getStatValue(stats: ParticipantStats, metric?: string): number {
    switch (metric) {
      case 'generations': return stats.generationsCompleted;
      case 'feedback': return stats.feedbackSubmitted;
      case 'bugs': return stats.bugsReported;
      case 'referrals': return stats.referralsMade;
      case 'tutorials': return stats.tutorialsCompleted;
      case 'posts': return stats.communityPosts;
      default: return 0;
    }
  }

  private checkSpecialRequirement(requirement: BadgeRequirement, participant: BetaParticipant): boolean {
    if (requirement.metric === 'launch_week') {
      const launchWeekEnd = new Date('2025-02-07'); // Example launch week
      return participant.joinedAt <= launchWeekEnd;
    }
    return false;
  }

  private async updateParticipantBadges(userId: string, badgeId: string, credits: number): Promise<void> {
    // Use localStorage for beta phase
    const stored = localStorage.getItem(`beta_participant_${userId}`);
    const participant = stored ? JSON.parse(stored) : { badges: [], total_credits_earned: 0 };
    
    const currentBadges = participant.badges || [];
    const currentCredits = participant.total_credits_earned || 0;
    
    participant.badges = [...currentBadges, badgeId];
    participant.total_credits_earned = currentCredits + credits;
    
    localStorage.setItem(`beta_participant_${userId}`, JSON.stringify(participant));
  }

  private async updateParticipantCredits(userId: string, amount: number): Promise<void> {
    // Use localStorage for beta phase
    const stored = localStorage.getItem(`beta_participant_${userId}`);
    const participant = stored ? JSON.parse(stored) : { total_credits_earned: 0 };
    
    const currentCredits = participant.total_credits_earned || 0;
    participant.total_credits_earned = currentCredits + amount;
    
    localStorage.setItem(`beta_participant_${userId}`, JSON.stringify(participant));
  }

  private async updateStreaks(userId: string): Promise<void> {
    // Use localStorage for beta phase - calculate streak from stored activity dates
    const stored = localStorage.getItem(`beta_streaks_${userId}`);
    const streakData: string[] = stored ? JSON.parse(stored) : [];

    if (streakData.length === 0) return;

    // Sort dates descending
    const sortedDates = streakData.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    // Update participant streak in localStorage
    const participantStored = localStorage.getItem(`beta_participant_${userId}`);
    const participant = participantStored ? JSON.parse(participantStored) : { current_streak: 0, longest_streak: 0 };
    
    const longestStreak = Math.max(participant.longest_streak || 0, streak);
    participant.current_streak = streak;
    participant.longest_streak = longestStreak;
    
    localStorage.setItem(`beta_participant_${userId}`, JSON.stringify(participant));
  }

  private getDefaultStats(): ParticipantStats {
    return {
      generationsCompleted: 0,
      feedbackSubmitted: 0,
      bugsReported: 0,
      featuresRequested: 0,
      referralsMade: 0,
      tutorialsCompleted: 0,
      communityPosts: 0,
    };
  }
}

export const betaAwardsService = new BetaAwardsService();
export default betaAwardsService;
