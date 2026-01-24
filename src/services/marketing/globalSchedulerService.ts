/**
 * Global Marketing Scheduler Service
 * 
 * Handles timezone-aware scheduling for 14 regional bundles with:
 * - 3 posts per day per region (morning, afternoon, evening local time)
 * - No duplicates within same region in 24h window
 * - Smart content rotation to avoid repetition
 * - Holiday and special day awareness
 * - Round-the-clock global coverage
 */

import { supabase } from '@/integrations/supabase/client';
import type { BundleType } from '../regionLanguageBundles';
import type { Platform, PipelineCategory, ContentFormat } from '../marketingContentManager';

// ============================================================================
// TYPES
// ============================================================================

export interface RegionalTimeSlot {
  region: BundleType;
  slotName: 'morning' | 'afternoon' | 'evening';
  localHour: number;
  utcHour: number;
  timezone: string;
  optimalPlatforms: Platform[];
}

export interface ScheduledPost {
  id: string;
  region: BundleType;
  pipelineId: string;
  category: PipelineCategory;
  format: ContentFormat;
  platform: Platform;
  scheduledAt: Date;
  localTime: string;
  timezone: string;
  status: 'pending' | 'generating' | 'ready' | 'publishing' | 'published' | 'failed';
  contentHash: string; // For duplicate prevention
  generationConfig?: Record<string, unknown>;
  publishedUrl?: string;
}

export interface SpecialDay {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'holiday' | 'promotion' | 'launch' | 'awareness' | 'seasonal';
  regions: BundleType[] | 'all';
  theme?: string;
  messaging?: {
    headline?: string;
    hook?: string;
    hashtags?: string[];
  };
  contentBoost?: number; // Multiplier for content generation
}

export interface ContentRotationState {
  region: BundleType;
  lastUsedPipelines: string[];
  lastUsedCategories: PipelineCategory[];
  lastUsedFormats: ContentFormat[];
  pipelineUsageCount: Record<string, number>;
  categoryUsageCount: Record<PipelineCategory, number>;
}

// ============================================================================
// TIMEZONE & REGIONAL CONFIG
// ============================================================================

export const REGIONAL_TIMEZONES: Record<BundleType, {
  primaryTimezone: string;
  utcOffset: number;
  businessHours: { start: number; end: number };
  peakEngagementHours: number[];
}> = {
  english_core: {
    primaryTimezone: 'America/New_York',
    utcOffset: -5,
    businessHours: { start: 9, end: 18 },
    peakEngagementHours: [8, 12, 17, 20],
  },
  europe: {
    primaryTimezone: 'Europe/London',
    utcOffset: 0,
    businessHours: { start: 9, end: 18 },
    peakEngagementHours: [8, 12, 17, 19],
  },
  asia: {
    primaryTimezone: 'Asia/Tokyo',
    utcOffset: 9,
    businessHours: { start: 9, end: 18 },
    peakEngagementHours: [7, 12, 18, 21],
  },
  india: {
    primaryTimezone: 'Asia/Kolkata',
    utcOffset: 5.5,
    businessHours: { start: 9, end: 18 },
    peakEngagementHours: [8, 13, 19, 21],
  },
  mea: {
    primaryTimezone: 'Asia/Dubai',
    utcOffset: 4,
    businessHours: { start: 9, end: 17 },
    peakEngagementHours: [9, 13, 20, 22],
  },
  africa: {
    primaryTimezone: 'Africa/Lagos',
    utcOffset: 1,
    businessHours: { start: 8, end: 17 },
    peakEngagementHours: [7, 12, 18, 20],
  },
  latam: {
    primaryTimezone: 'America/Sao_Paulo',
    utcOffset: -3,
    businessHours: { start: 9, end: 18 },
    peakEngagementHours: [8, 12, 18, 21],
  },
};

// ============================================================================
// HOLIDAY CALENDAR
// ============================================================================

export const SPECIAL_DAYS_CALENDAR: SpecialDay[] = [
  // Global Tech Events
  { date: '2025-01-28', name: 'Data Privacy Day', type: 'awareness', regions: 'all', theme: 'security' },
  { date: '2025-03-08', name: 'International Women\'s Day', type: 'awareness', regions: 'all', theme: 'diversity' },
  { date: '2025-04-22', name: 'Earth Day', type: 'awareness', regions: 'all', theme: 'sustainability' },
  { date: '2025-05-01', name: 'May Day / Labor Day', type: 'holiday', regions: 'all', theme: 'work' },
  { date: '2025-10-10', name: 'World Mental Health Day', type: 'awareness', regions: 'all', theme: 'wellness' },
  
  // Regional Holidays - US
  { date: '2025-07-04', name: 'Independence Day', type: 'holiday', regions: ['english_core'], theme: 'celebration' },
  { date: '2025-11-27', name: 'Thanksgiving', type: 'holiday', regions: ['english_core'], theme: 'gratitude' },
  { date: '2025-12-25', name: 'Christmas', type: 'holiday', regions: ['english_core', 'europe', 'latam'], theme: 'celebration' },
  
  // Regional Holidays - Asia
  { date: '2025-01-29', name: 'Chinese New Year', type: 'holiday', regions: ['asia'], theme: 'new-beginnings' },
  { date: '2025-03-21', name: 'Holi', type: 'holiday', regions: ['india'], theme: 'celebration' },
  { date: '2025-10-23', name: 'Diwali', type: 'holiday', regions: ['india'], theme: 'light' },
  
  // Regional Holidays - MEA
  { date: '2025-03-31', name: 'Ramadan Start', type: 'holiday', regions: ['mea'], theme: 'reflection' },
  { date: '2025-04-30', name: 'Eid al-Fitr', type: 'holiday', regions: ['mea'], theme: 'celebration' },
  
  // Regional Holidays - LATAM
  { date: '2025-02-28', name: 'Carnival', type: 'holiday', regions: ['latam'], theme: 'celebration' },
  { date: '2025-11-02', name: 'Day of the Dead', type: 'holiday', regions: ['latam'], theme: 'remembrance' },
  
  // Regional Holidays - Africa
  { date: '2025-05-25', name: 'Africa Day', type: 'awareness', regions: ['africa'], theme: 'unity' },
  
  // Product Launches & Promos (configurable)
  { date: '2025-03-15', name: 'Spring Launch', type: 'launch', regions: 'all', theme: 'innovation', contentBoost: 2 },
  { date: '2025-09-01', name: 'Back to Business', type: 'promotion', regions: 'all', theme: 'productivity', contentBoost: 1.5 },
  { date: '2025-11-29', name: 'Black Friday', type: 'promotion', regions: ['english_core', 'europe'], theme: 'deals', contentBoost: 3 },
];

// ============================================================================
// SCHEDULER SERVICE
// ============================================================================

class GlobalSchedulerService {
  private static instance: GlobalSchedulerService;
  private contentRotation: Map<BundleType, ContentRotationState> = new Map();
  private scheduledPosts: Map<string, ScheduledPost> = new Map();
  private customSpecialDays: SpecialDay[] = [];

  static getInstance(): GlobalSchedulerService {
    if (!this.instance) {
      this.instance = new GlobalSchedulerService();
    }
    return this.instance;
  }

  /**
   * Generate optimal time slots for all regions
   * Returns 3 slots per region (morning, afternoon, evening)
   */
  generateDailyTimeSlots(date: Date): RegionalTimeSlot[] {
    const slots: RegionalTimeSlot[] = [];

    for (const [region, config] of Object.entries(REGIONAL_TIMEZONES)) {
      const peakHours = config.peakEngagementHours;
      
      // Morning slot (first peak hour)
      slots.push({
        region: region as BundleType,
        slotName: 'morning',
        localHour: peakHours[0],
        utcHour: (peakHours[0] - config.utcOffset + 24) % 24,
        timezone: config.primaryTimezone,
        optimalPlatforms: ['linkedin', 'twitter'],
      });

      // Afternoon slot (second/third peak hour)
      slots.push({
        region: region as BundleType,
        slotName: 'afternoon',
        localHour: peakHours[1],
        utcHour: (peakHours[1] - config.utcOffset + 24) % 24,
        timezone: config.primaryTimezone,
        optimalPlatforms: ['youtube', 'instagram_feed', 'facebook'],
      });

      // Evening slot (last peak hour)
      slots.push({
        region: region as BundleType,
        slotName: 'evening',
        localHour: peakHours[3],
        utcHour: (peakHours[3] - config.utcOffset + 24) % 24,
        timezone: config.primaryTimezone,
        optimalPlatforms: ['tiktok', 'instagram_reels', 'youtube_shorts'],
      });
    }

    // Sort by UTC hour for round-the-clock execution
    return slots.sort((a, b) => a.utcHour - b.utcHour);
  }

  /**
   * Check if date is a special day for a region
   */
  getSpecialDays(date: Date, region: BundleType): SpecialDay[] {
    const dateStr = date.toISOString().split('T')[0];
    const allDays = [...SPECIAL_DAYS_CALENDAR, ...this.customSpecialDays];
    
    return allDays.filter(day => {
      if (day.date !== dateStr) return false;
      if (day.regions === 'all') return true;
      return day.regions.includes(region);
    });
  }

  /**
   * Add custom special day (promotions, launches, etc.)
   */
  addSpecialDay(specialDay: SpecialDay): void {
    this.customSpecialDays.push(specialDay);
    console.log(`[Scheduler] Added special day: ${specialDay.name} on ${specialDay.date}`);
  }

  /**
   * Get content that hasn't been used recently in a region
   */
  getNextContentForRegion(
    region: BundleType,
    availablePipelines: { id: string; category: PipelineCategory }[],
    availableFormats: ContentFormat[]
  ): { pipelineId: string; category: PipelineCategory; format: ContentFormat } | null {
    let rotationState = this.contentRotation.get(region);
    
    if (!rotationState) {
      rotationState = {
        region,
        lastUsedPipelines: [],
        lastUsedCategories: [],
        lastUsedFormats: [],
        pipelineUsageCount: {},
        categoryUsageCount: {} as Record<PipelineCategory, number>,
      };
      this.contentRotation.set(region, rotationState);
    }

    // Filter out recently used pipelines (last 24 hours worth = ~3 posts)
    const recentPipelines = new Set(rotationState.lastUsedPipelines.slice(-3));
    const recentFormats = new Set(rotationState.lastUsedFormats.slice(-3));

    // Find pipelines not recently used
    const candidatePipelines = availablePipelines.filter(p => !recentPipelines.has(p.id));
    if (candidatePipelines.length === 0) {
      // All have been used, reset rotation
      rotationState.lastUsedPipelines = [];
      return this.getNextContentForRegion(region, availablePipelines, availableFormats);
    }

    // Sort by least used
    candidatePipelines.sort((a, b) => {
      const countA = rotationState!.pipelineUsageCount[a.id] || 0;
      const countB = rotationState!.pipelineUsageCount[b.id] || 0;
      return countA - countB;
    });

    // Find format not recently used
    const candidateFormats = availableFormats.filter(f => !recentFormats.has(f));
    const selectedFormat = candidateFormats.length > 0 
      ? candidateFormats[0] 
      : availableFormats[0];

    const selectedPipeline = candidatePipelines[0];

    // Update rotation state
    rotationState.lastUsedPipelines.push(selectedPipeline.id);
    rotationState.lastUsedFormats.push(selectedFormat);
    rotationState.pipelineUsageCount[selectedPipeline.id] = 
      (rotationState.pipelineUsageCount[selectedPipeline.id] || 0) + 1;

    return {
      pipelineId: selectedPipeline.id,
      category: selectedPipeline.category,
      format: selectedFormat,
    };
  }

  /**
   * Generate content hash to prevent duplicates
   */
  generateContentHash(
    region: BundleType,
    pipelineId: string,
    format: ContentFormat,
    date: Date
  ): string {
    const dateStr = date.toISOString().split('T')[0];
    return `${region}-${pipelineId}-${format}-${dateStr}`;
  }

  /**
   * Check if content already scheduled for region/date
   */
  isContentScheduled(contentHash: string): boolean {
    return this.scheduledPosts.has(contentHash);
  }

  /**
   * Schedule a post
   */
  schedulePost(post: Omit<ScheduledPost, 'id'>): ScheduledPost {
    const id = `post_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const scheduledPost: ScheduledPost = { ...post, id };
    
    this.scheduledPosts.set(post.contentHash, scheduledPost);
    console.log(`[Scheduler] Scheduled: ${scheduledPost.contentHash} for ${scheduledPost.localTime} ${scheduledPost.timezone}`);
    
    return scheduledPost;
  }

  /**
   * Get all scheduled posts for a date
   */
  getScheduledPostsForDate(date: Date): ScheduledPost[] {
    const dateStr = date.toISOString().split('T')[0];
    return Array.from(this.scheduledPosts.values())
      .filter(post => post.scheduledAt.toISOString().split('T')[0] === dateStr);
  }

  /**
   * Get global schedule overview (all regions, all times)
   */
  getGlobalScheduleOverview(date: Date): {
    utcHour: number;
    posts: ScheduledPost[];
  }[] {
    const posts = this.getScheduledPostsForDate(date);
    const byHour: Map<number, ScheduledPost[]> = new Map();

    posts.forEach(post => {
      const hour = post.scheduledAt.getUTCHours();
      if (!byHour.has(hour)) byHour.set(hour, []);
      byHour.get(hour)!.push(post);
    });

    return Array.from(byHour.entries())
      .map(([utcHour, hourPosts]) => ({ utcHour, posts: hourPosts }))
      .sort((a, b) => a.utcHour - b.utcHour);
  }

  /**
   * Get content multiplier for a date (special days boost content)
   */
  getContentMultiplier(date: Date, region: BundleType): number {
    const specialDays = this.getSpecialDays(date, region);
    if (specialDays.length === 0) return 1;

    // Return highest boost if multiple special days
    return Math.max(...specialDays.map(d => d.contentBoost || 1));
  }

  /**
   * Execute scheduled posts (called by cron)
   */
  async executeScheduledPosts(): Promise<{
    executed: number;
    failed: number;
    errors: string[];
  }> {
    const now = new Date();
    const pendingPosts = Array.from(this.scheduledPosts.values())
      .filter(post => 
        post.status === 'ready' && 
        post.scheduledAt <= now
      );

    let executed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const post of pendingPosts) {
      try {
        post.status = 'publishing';
        
        // Call social-publish edge function
        const { data, error } = await supabase.functions.invoke('social-publish', {
          body: {
            platform: post.platform,
            content: post.generationConfig,
            region: post.region,
          },
        });

        if (error) throw error;

        post.status = 'published';
        post.publishedUrl = data?.url;
        executed++;
        
        console.log(`[Scheduler] Published: ${post.contentHash} to ${post.platform}`);
      } catch (err) {
        post.status = 'failed';
        failed++;
        errors.push(`${post.contentHash}: ${err}`);
        console.error(`[Scheduler] Failed to publish: ${post.contentHash}`, err);
      }
    }

    return { executed, failed, errors };
  }

  /**
   * Reset rotation state (useful for new campaigns)
   */
  resetRotation(region?: BundleType): void {
    if (region) {
      this.contentRotation.delete(region);
    } else {
      this.contentRotation.clear();
    }
    console.log(`[Scheduler] Reset rotation for ${region || 'all regions'}`);
  }

  /**
   * Get scheduler statistics
   */
  getStatistics(): {
    totalScheduled: number;
    byStatus: Record<string, number>;
    byRegion: Record<BundleType, number>;
    byPlatform: Record<Platform, number>;
  } {
    const posts = Array.from(this.scheduledPosts.values());
    
    const byStatus: Record<string, number> = {};
    const byRegion: Partial<Record<BundleType, number>> = {};
    const byPlatform: Partial<Record<Platform, number>> = {};

    posts.forEach(post => {
      byStatus[post.status] = (byStatus[post.status] || 0) + 1;
      byRegion[post.region] = (byRegion[post.region] || 0) + 1;
      byPlatform[post.platform] = (byPlatform[post.platform] || 0) + 1;
    });

    return {
      totalScheduled: posts.length,
      byStatus,
      byRegion: byRegion as Record<BundleType, number>,
      byPlatform: byPlatform as Record<Platform, number>,
    };
  }
}

export const globalSchedulerService = GlobalSchedulerService.getInstance();
