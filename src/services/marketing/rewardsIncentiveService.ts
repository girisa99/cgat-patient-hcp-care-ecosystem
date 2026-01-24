/**
 * Rewards & Incentive Service
 * 
 * Gamification system for dogfooding marketing:
 * - Weekly leaderboards for top creators
 * - Monthly incentive programs
 * - Engagement tracking and rewards
 * - User-generated content showcase through Genie Studio social platform
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface CreatorProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  level: CreatorLevel;
  points: number;
  badges: Badge[];
  streak: number; // Consecutive days with content
  joinedAt: Date;
  lastActiveAt: Date;
  stats: CreatorStats;
}

export type CreatorLevel = 
  | 'novice'      // 0-99 points
  | 'creator'     // 100-499 points
  | 'influencer'  // 500-1999 points
  | 'ambassador'  // 2000-4999 points
  | 'legend';     // 5000+ points

export interface CreatorStats {
  totalPublished: number;
  totalImpressions: number;
  totalEngagement: number;
  totalClicks: number;
  avgEngagementRate: number;
  weeklyPublished: number;
  weeklyImpressions: number;
  monthlyPublished: number;
  monthlyImpressions: number;
  topPerformingContent: string[];
  platformBreakdown: Record<string, number>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
  category: BadgeCategory;
}

export type BadgeCategory = 
  | 'publishing'   // Based on content published
  | 'engagement'   // Based on engagement metrics
  | 'consistency'  // Based on streak/regularity
  | 'quality'      // Based on content quality scores
  | 'innovation'   // Using new features/formats
  | 'community'    // Helping others, sharing tips
  | 'special';     // Event-based, limited time

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  changeFromLast: number; // +/- positions
  metric: string;
  level: CreatorLevel;
}

export interface IncentiveProgram {
  id: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly' | 'event' | 'milestone';
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  rewards: IncentiveReward[];
  criteria: IncentiveCriteria[];
  participants: string[];
  winners?: IncentiveWinner[];
}

export interface IncentiveReward {
  tier: 1 | 2 | 3; // 1st, 2nd, 3rd place
  type: 'credits' | 'subscription' | 'feature_unlock' | 'merchandise' | 'recognition';
  value: string | number;
  description: string;
}

export interface IncentiveCriteria {
  metric: 'impressions' | 'engagement' | 'content_count' | 'quality_score' | 'new_features_used';
  weight: number;
  threshold?: number;
}

export interface IncentiveWinner {
  userId: string;
  displayName: string;
  tier: 1 | 2 | 3;
  score: number;
  reward: IncentiveReward;
  announcedAt: Date;
}

export interface PublishedShowcase {
  id: string;
  userId: string;
  creatorName: string;
  contentTitle: string;
  contentType: string;
  platform: string;
  publishedUrl: string;
  thumbnailUrl?: string;
  impressions: number;
  engagement: number;
  publishedAt: Date;
  featured: boolean;
  featuredReason?: string;
}

// ============================================================================
// BADGE DEFINITIONS
// ============================================================================

export const BADGE_CATALOG: Omit<Badge, 'earnedAt'>[] = [
  // Publishing badges
  { id: 'first_publish', name: 'First Steps', description: 'Published your first content', icon: '🚀', rarity: 'common', category: 'publishing' },
  { id: 'publish_10', name: 'Content Creator', description: 'Published 10 pieces of content', icon: '📝', rarity: 'common', category: 'publishing' },
  { id: 'publish_50', name: 'Prolific Publisher', description: 'Published 50 pieces of content', icon: '📚', rarity: 'rare', category: 'publishing' },
  { id: 'publish_100', name: 'Content Machine', description: 'Published 100 pieces of content', icon: '🏭', rarity: 'epic', category: 'publishing' },
  { id: 'publish_500', name: 'Publishing Legend', description: 'Published 500 pieces of content', icon: '👑', rarity: 'legendary', category: 'publishing' },
  
  // Engagement badges
  { id: 'first_viral', name: 'Going Viral', description: 'Content reached 10K impressions', icon: '🔥', rarity: 'rare', category: 'engagement' },
  { id: 'mega_viral', name: 'Mega Viral', description: 'Content reached 100K impressions', icon: '💥', rarity: 'epic', category: 'engagement' },
  { id: 'engagement_master', name: 'Engagement Master', description: 'Achieved 10%+ engagement rate', icon: '💬', rarity: 'rare', category: 'engagement' },
  { id: 'million_views', name: 'Million Club', description: 'Total impressions reached 1 million', icon: '🌟', rarity: 'legendary', category: 'engagement' },
  
  // Consistency badges
  { id: 'streak_7', name: 'Week Warrior', description: '7-day publishing streak', icon: '📅', rarity: 'common', category: 'consistency' },
  { id: 'streak_30', name: 'Month Master', description: '30-day publishing streak', icon: '🗓️', rarity: 'rare', category: 'consistency' },
  { id: 'streak_100', name: 'Century Streak', description: '100-day publishing streak', icon: '💯', rarity: 'epic', category: 'consistency' },
  { id: 'streak_365', name: 'Year of Creation', description: '365-day publishing streak', icon: '🏆', rarity: 'legendary', category: 'consistency' },
  
  // Innovation badges
  { id: 'format_explorer', name: 'Format Explorer', description: 'Used 5 different content formats', icon: '🎨', rarity: 'common', category: 'innovation' },
  { id: 'platform_master', name: 'Platform Master', description: 'Published on all platforms', icon: '🌐', rarity: 'rare', category: 'innovation' },
  { id: 'ai_pioneer', name: 'AI Pioneer', description: 'First to use a new AI feature', icon: '🤖', rarity: 'epic', category: 'innovation' },
  { id: '3d_creator', name: '3D Creator', description: 'Created 10+ 3D content pieces', icon: '📦', rarity: 'rare', category: 'innovation' },
  { id: 'avatar_master', name: 'Avatar Master', description: 'Created 20+ AI avatar videos', icon: '👤', rarity: 'rare', category: 'innovation' },
  
  // Quality badges
  { id: 'quality_first', name: 'Quality First', description: 'Maintained 90%+ quality score', icon: '⭐', rarity: 'rare', category: 'quality' },
  { id: 'seo_wizard', name: 'SEO Wizard', description: 'Achieved 95+ SEO score', icon: '🔍', rarity: 'rare', category: 'quality' },
  
  // Community badges
  { id: 'helpful_creator', name: 'Helpful Creator', description: 'Shared tips with community', icon: '🤝', rarity: 'common', category: 'community' },
  { id: 'mentor', name: 'Mentor', description: 'Helped 10 new creators', icon: '🎓', rarity: 'rare', category: 'community' },
  
  // Special/Event badges
  { id: 'early_adopter', name: 'Early Adopter', description: 'Joined during beta', icon: '🌅', rarity: 'epic', category: 'special' },
  { id: 'launch_day', name: 'Launch Day Hero', description: 'Published on product launch day', icon: '🎉', rarity: 'rare', category: 'special' },
  { id: 'holiday_creator', name: 'Holiday Creator', description: 'Published on 5 holidays', icon: '🎄', rarity: 'common', category: 'special' },
];

// ============================================================================
// LEVEL THRESHOLDS
// ============================================================================

export const LEVEL_THRESHOLDS: Record<CreatorLevel, { min: number; max: number; perks: string[] }> = {
  novice: { 
    min: 0, max: 99, 
    perks: ['Basic analytics', 'Community access'] 
  },
  creator: { 
    min: 100, max: 499, 
    perks: ['Extended analytics', 'Priority support', 'Custom thumbnails'] 
  },
  influencer: { 
    min: 500, max: 1999, 
    perks: ['Advanced analytics', 'Beta features', 'Verified badge'] 
  },
  ambassador: { 
    min: 2000, max: 4999, 
    perks: ['All features', 'Direct feedback channel', 'Co-marketing opportunities'] 
  },
  legend: { 
    min: 5000, max: Infinity, 
    perks: ['Everything', 'Advisory board', 'Revenue sharing', 'Exclusive events'] 
  },
};

// ============================================================================
// REWARDS SERVICE
// ============================================================================

class RewardsIncentiveService {
  private static instance: RewardsIncentiveService;
  private creators: Map<string, CreatorProfile> = new Map();
  private leaderboards: Map<string, LeaderboardEntry[]> = new Map();
  private programs: Map<string, IncentiveProgram> = new Map();
  private showcases: PublishedShowcase[] = [];

  static getInstance(): RewardsIncentiveService {
    if (!this.instance) {
      this.instance = new RewardsIncentiveService();
    }
    return this.instance;
  }

  /**
   * Get or create creator profile
   */
  async getCreatorProfile(userId: string): Promise<CreatorProfile> {
    if (this.creators.has(userId)) {
      return this.creators.get(userId)!;
    }

    // Create new profile
    const profile: CreatorProfile = {
      userId,
      displayName: `Creator ${userId.substring(0, 6)}`,
      level: 'novice',
      points: 0,
      badges: [],
      streak: 0,
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      stats: {
        totalPublished: 0,
        totalImpressions: 0,
        totalEngagement: 0,
        totalClicks: 0,
        avgEngagementRate: 0,
        weeklyPublished: 0,
        weeklyImpressions: 0,
        monthlyPublished: 0,
        monthlyImpressions: 0,
        topPerformingContent: [],
        platformBreakdown: {},
      },
    };

    this.creators.set(userId, profile);
    return profile;
  }

  /**
   * Award points to creator
   */
  awardPoints(userId: string, points: number, reason: string): void {
    const profile = this.creators.get(userId);
    if (!profile) return;

    profile.points += points;
    profile.lastActiveAt = new Date();

    // Check for level up
    const newLevel = this.calculateLevel(profile.points);
    if (newLevel !== profile.level) {
      profile.level = newLevel;
      console.log(`[Rewards] ${userId} leveled up to ${newLevel}!`);
    }

    console.log(`[Rewards] Awarded ${points} points to ${userId}: ${reason}`);
  }

  /**
   * Calculate level based on points
   */
  private calculateLevel(points: number): CreatorLevel {
    for (const [level, threshold] of Object.entries(LEVEL_THRESHOLDS) as [CreatorLevel, typeof LEVEL_THRESHOLDS[CreatorLevel]][]) {
      if (points >= threshold.min && points <= threshold.max) {
        return level;
      }
    }
    return 'legend';
  }

  /**
   * Check and award badges
   */
  checkAndAwardBadges(userId: string): Badge[] {
    const profile = this.creators.get(userId);
    if (!profile) return [];

    const newBadges: Badge[] = [];
    const earnedBadgeIds = new Set(profile.badges.map(b => b.id));

    // Check publishing badges
    if (!earnedBadgeIds.has('first_publish') && profile.stats.totalPublished >= 1) {
      newBadges.push(this.createBadge('first_publish'));
    }
    if (!earnedBadgeIds.has('publish_10') && profile.stats.totalPublished >= 10) {
      newBadges.push(this.createBadge('publish_10'));
    }
    if (!earnedBadgeIds.has('publish_50') && profile.stats.totalPublished >= 50) {
      newBadges.push(this.createBadge('publish_50'));
    }
    if (!earnedBadgeIds.has('publish_100') && profile.stats.totalPublished >= 100) {
      newBadges.push(this.createBadge('publish_100'));
    }

    // Check engagement badges
    if (!earnedBadgeIds.has('million_views') && profile.stats.totalImpressions >= 1000000) {
      newBadges.push(this.createBadge('million_views'));
    }

    // Check streak badges
    if (!earnedBadgeIds.has('streak_7') && profile.streak >= 7) {
      newBadges.push(this.createBadge('streak_7'));
    }
    if (!earnedBadgeIds.has('streak_30') && profile.streak >= 30) {
      newBadges.push(this.createBadge('streak_30'));
    }

    // Add new badges to profile
    profile.badges.push(...newBadges);

    // Award bonus points for badges
    newBadges.forEach(badge => {
      const badgePoints = { common: 10, rare: 50, epic: 200, legendary: 500 };
      this.awardPoints(userId, badgePoints[badge.rarity], `Earned badge: ${badge.name}`);
    });

    return newBadges;
  }

  /**
   * Create badge from catalog
   */
  private createBadge(badgeId: string): Badge {
    const template = BADGE_CATALOG.find(b => b.id === badgeId);
    if (!template) throw new Error(`Badge not found: ${badgeId}`);
    
    return {
      ...template,
      earnedAt: new Date(),
    };
  }

  /**
   * Record content publication and update stats
   */
  recordPublication(
    userId: string,
    contentId: string,
    platform: string,
    url: string
  ): void {
    const profile = this.creators.get(userId);
    if (!profile) return;

    profile.stats.totalPublished++;
    profile.stats.weeklyPublished++;
    profile.stats.monthlyPublished++;
    profile.stats.platformBreakdown[platform] = 
      (profile.stats.platformBreakdown[platform] || 0) + 1;

    // Update streak
    const today = new Date().toDateString();
    const lastActive = profile.lastActiveAt.toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastActive === yesterday || lastActive === today) {
      profile.streak++;
    } else if (lastActive !== today) {
      profile.streak = 1; // Reset streak
    }

    profile.lastActiveAt = new Date();

    // Award base points for publishing
    this.awardPoints(userId, 5, 'Published content');

    // Check for new badges
    this.checkAndAwardBadges(userId);

    console.log(`[Rewards] Recorded publication for ${userId}: ${contentId} on ${platform}`);
  }

  /**
   * Update engagement metrics
   */
  updateEngagement(
    userId: string,
    contentId: string,
    impressions: number,
    engagement: number,
    clicks: number
  ): void {
    const profile = this.creators.get(userId);
    if (!profile) return;

    profile.stats.totalImpressions += impressions;
    profile.stats.totalEngagement += engagement;
    profile.stats.totalClicks += clicks;
    profile.stats.weeklyImpressions += impressions;
    profile.stats.monthlyImpressions += impressions;

    // Recalculate average engagement rate
    if (profile.stats.totalImpressions > 0) {
      profile.stats.avgEngagementRate = 
        (profile.stats.totalEngagement / profile.stats.totalImpressions) * 100;
    }

    // Award bonus points for engagement milestones
    if (impressions >= 10000) {
      this.awardPoints(userId, 50, 'Content reached 10K impressions');
    }
    if (impressions >= 100000) {
      this.awardPoints(userId, 200, 'Content reached 100K impressions');
    }

    // Check for new badges
    this.checkAndAwardBadges(userId);
  }

  /**
   * Get weekly leaderboard
   */
  getWeeklyLeaderboard(metric: 'impressions' | 'engagement' | 'published' = 'impressions'): LeaderboardEntry[] {
    const creators = Array.from(this.creators.values());
    
    const sorted = creators
      .map(c => ({
        userId: c.userId,
        displayName: c.displayName,
        avatarUrl: c.avatarUrl,
        score: metric === 'impressions' 
          ? c.stats.weeklyImpressions
          : metric === 'engagement'
          ? c.stats.avgEngagementRate
          : c.stats.weeklyPublished,
        level: c.level,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    return sorted.map((entry, index) => ({
      rank: index + 1,
      ...entry,
      changeFromLast: 0, // Would compare with previous week
      metric,
    }));
  }

  /**
   * Get monthly leaderboard
   */
  getMonthlyLeaderboard(metric: 'impressions' | 'engagement' | 'published' = 'impressions'): LeaderboardEntry[] {
    const creators = Array.from(this.creators.values());
    
    const sorted = creators
      .map(c => ({
        userId: c.userId,
        displayName: c.displayName,
        avatarUrl: c.avatarUrl,
        score: metric === 'impressions' 
          ? c.stats.monthlyImpressions
          : metric === 'engagement'
          ? c.stats.avgEngagementRate
          : c.stats.monthlyPublished,
        level: c.level,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    return sorted.map((entry, index) => ({
      rank: index + 1,
      ...entry,
      changeFromLast: 0,
      metric,
    }));
  }

  /**
   * Create incentive program
   */
  createIncentiveProgram(program: Omit<IncentiveProgram, 'id' | 'participants' | 'winners'>): IncentiveProgram {
    const id = `program_${Date.now()}`;
    const newProgram: IncentiveProgram = {
      ...program,
      id,
      participants: [],
    };

    this.programs.set(id, newProgram);
    console.log(`[Rewards] Created incentive program: ${newProgram.name}`);
    
    return newProgram;
  }

  /**
   * Get active incentive programs
   */
  getActivePrograms(): IncentiveProgram[] {
    return Array.from(this.programs.values())
      .filter(p => p.status === 'active');
  }

  /**
   * Join incentive program
   */
  joinProgram(programId: string, userId: string): boolean {
    const program = this.programs.get(programId);
    if (!program || program.status !== 'active') return false;

    if (!program.participants.includes(userId)) {
      program.participants.push(userId);
      console.log(`[Rewards] ${userId} joined program: ${program.name}`);
    }
    
    return true;
  }

  /**
   * Add to showcase
   */
  addToShowcase(showcase: Omit<PublishedShowcase, 'id'>): PublishedShowcase {
    const id = `showcase_${Date.now()}`;
    const entry: PublishedShowcase = { ...showcase, id };
    
    this.showcases.push(entry);
    
    // Feature content automatically if it performs well
    if (showcase.impressions >= 10000 || showcase.engagement >= 1000) {
      entry.featured = true;
      entry.featuredReason = 'High performing content';
    }

    return entry;
  }

  /**
   * Get featured showcases
   */
  getFeaturedShowcases(limit: number = 10): PublishedShowcase[] {
    return this.showcases
      .filter(s => s.featured)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, limit);
  }

  /**
   * Get recent showcases
   */
  getRecentShowcases(limit: number = 20): PublishedShowcase[] {
    return this.showcases
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Reset weekly stats (called by cron)
   */
  resetWeeklyStats(): void {
    for (const creator of this.creators.values()) {
      creator.stats.weeklyPublished = 0;
      creator.stats.weeklyImpressions = 0;
    }
    console.log('[Rewards] Reset weekly stats for all creators');
  }

  /**
   * Reset monthly stats (called by cron)
   */
  resetMonthlyStats(): void {
    for (const creator of this.creators.values()) {
      creator.stats.monthlyPublished = 0;
      creator.stats.monthlyImpressions = 0;
    }
    console.log('[Rewards] Reset monthly stats for all creators');
  }

  /**
   * Generate default monthly program
   */
  generateMonthlyProgram(month: number, year: number): IncentiveProgram {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const monthName = startDate.toLocaleString('en-US', { month: 'long' });

    return this.createIncentiveProgram({
      name: `${monthName} ${year} Creator Challenge`,
      description: `Top creators of ${monthName} win exclusive rewards!`,
      type: 'monthly',
      startDate,
      endDate,
      status: 'active',
      rewards: [
        { tier: 1, type: 'credits', value: 1000, description: '1000 Genie Credits + Featured Profile' },
        { tier: 2, type: 'credits', value: 500, description: '500 Genie Credits + Recognition' },
        { tier: 3, type: 'credits', value: 250, description: '250 Genie Credits + Badge' },
      ],
      criteria: [
        { metric: 'impressions', weight: 0.4 },
        { metric: 'engagement', weight: 0.3 },
        { metric: 'content_count', weight: 0.2 },
        { metric: 'quality_score', weight: 0.1 },
      ],
    });
  }
}

export const rewardsIncentiveService = RewardsIncentiveService.getInstance();
