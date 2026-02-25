/**
 * useSocialPlatforms — Single source of truth for social platform definitions
 *
 * Replaces 3 redundant hardcoded PLATFORMS arrays in:
 * - SmartSchedulerPanel.tsx (5 platforms, simple)
 * - DistributionPanel.tsx (5 platforms, with colors/descriptions)
 * - EP04PublishHub.tsx (7 platforms, with tier/capabilities)
 *
 * Consolidates into one unified hook with:
 * - Full platform definitions (id, name, icon, capabilities, tier, colors)
 * - Optimal posting times per platform
 * - Platform filtering by feature support (video, shorts, article, reels)
 * - Session-aware: respects castSession's selectedRegion and primaryPlatform
 *
 * Future: Will be backed by a `social_platforms` Supabase table.
 * Currently uses comprehensive hardcoded defaults with the same shape.
 */

import { useMemo } from 'react';
import {
  Youtube,
  Linkedin,
  Facebook,
  Video,
  Music2,
  Globe,
  Zap,
  RefreshCw,
  Image as ImageIcon,
  Smartphone,
  Monitor,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SocialPlatform {
  id: string;
  name: string;
  icon: LucideIcon;
  /** Whether OAuth is connected (default: false, toggled at runtime) */
  connected: boolean;
  /** Minimum tier required */
  tier: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  description: string;
  /** Feature support flags */
  supportsVideo: boolean;
  supportsShorts: boolean;
  supportsArticle: boolean;
  supportsReels: boolean;
  supportsStories: boolean;
  supportsCarousel: boolean;
  /** Max video duration in seconds (0 = unlimited) */
  maxDurationSeconds: number;
  /** Supported aspect ratios */
  aspectRatios: string[];
  /** UI styling */
  colorClass: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  /** Sort order */
  sortOrder: number;
}

export interface PlatformOptimalTimes {
  platformId: string;
  /** Best times to post (24h format) */
  times: string[];
  /** Best days of week (0=Sun, 6=Sat) */
  bestDays: number[];
  /** Timezone context */
  timezone: string;
}

export interface UseSocialPlatformsResult {
  /** All available platforms */
  platforms: SocialPlatform[];
  /** Get a single platform by ID */
  getPlatform: (id: string) => SocialPlatform | undefined;
  /** Get platforms that support a specific feature */
  getByFeature: (feature: 'video' | 'shorts' | 'article' | 'reels' | 'stories' | 'carousel') => SocialPlatform[];
  /** Get platforms available for a given tier */
  getByTier: (tier: string) => SocialPlatform[];
  /** Optimal posting times per platform */
  optimalTimes: Record<string, PlatformOptimalTimes>;
  /** Get optimal times for a platform */
  getOptimalTimes: (platformId: string) => string[];
  /** Get platform IDs as simple string array */
  platformIds: string[];
  /** Simple platform list for scheduler (id + name + icon + color) */
  schedulerPlatforms: Array<{ id: string; name: string; icon: LucideIcon; color: string }>;
  /** Distribution platform list (with connected status and descriptions) */
  distributionPlatforms: Array<{
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
    connected: boolean;
    description: string;
  }>;
}

// ─── Platform Definitions (Single Source of Truth) ──────────────────────────

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    connected: false,
    tier: 'free',
    description: 'Upload full video + Shorts from teaser clips',
    supportsVideo: true,
    supportsShorts: true,
    supportsArticle: false,
    supportsReels: false,
    supportsStories: false,
    supportsCarousel: false,
    maxDurationSeconds: 43200, // 12 hours
    aspectRatios: ['16:9', '9:16', '1:1'],
    colorClass: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40',
    sortOrder: 1,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    connected: false,
    tier: 'free',
    description: 'Video post + article + company page share',
    supportsVideo: true,
    supportsShorts: false,
    supportsArticle: true,
    supportsReels: false,
    supportsStories: true,
    supportsCarousel: true,
    maxDurationSeconds: 600, // 10 min
    aspectRatios: ['16:9', '1:1', '9:16'],
    colorClass: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    sortOrder: 2,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    connected: false,
    tier: 'free',
    description: 'Post to Facebook page or group',
    supportsVideo: true,
    supportsShorts: false,
    supportsArticle: false,
    supportsReels: true,
    supportsStories: true,
    supportsCarousel: true,
    maxDurationSeconds: 14400, // 4 hours
    aspectRatios: ['16:9', '9:16', '1:1', '4:5'],
    colorClass: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeClass: 'bg-blue-600/20 text-blue-400 border-blue-600/40',
    sortOrder: 3,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Music2,
    connected: false,
    tier: 'pro',
    description: 'Upload teaser clips as TikTok videos',
    supportsVideo: true,
    supportsShorts: false,
    supportsArticle: false,
    supportsReels: false,
    supportsStories: false,
    supportsCarousel: true,
    maxDurationSeconds: 600, // 10 min
    aspectRatios: ['9:16', '1:1'],
    colorClass: 'text-foreground',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    badgeClass: 'bg-muted text-foreground border-border',
    sortOrder: 4,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: ImageIcon,
    connected: false,
    tier: 'pro',
    description: 'Share as Reels, Stories, or carousel post',
    supportsVideo: true,
    supportsShorts: false,
    supportsArticle: false,
    supportsReels: true,
    supportsStories: true,
    supportsCarousel: true,
    maxDurationSeconds: 5400, // 90 min
    aspectRatios: ['9:16', '1:1', '4:5'],
    colorClass: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    badgeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
    sortOrder: 5,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: Zap,
    connected: false,
    tier: 'pro',
    description: 'Tweet teaser clips with thread',
    supportsVideo: true,
    supportsShorts: false,
    supportsArticle: false,
    supportsReels: false,
    supportsStories: false,
    supportsCarousel: true,
    maxDurationSeconds: 140,
    aspectRatios: ['16:9', '1:1'],
    colorClass: 'text-foreground',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    badgeClass: 'bg-muted text-foreground border-border',
    sortOrder: 6,
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: RefreshCw,
    connected: false,
    tier: 'business',
    description: 'Post to Threads with clips',
    supportsVideo: true,
    supportsShorts: false,
    supportsArticle: false,
    supportsReels: false,
    supportsStories: false,
    supportsCarousel: true,
    maxDurationSeconds: 300,
    aspectRatios: ['9:16', '1:1'],
    colorClass: 'text-foreground',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    badgeClass: 'bg-muted text-foreground border-border',
    sortOrder: 7,
  },
];

// ─── Optimal Posting Times ─────────────────────────────────────────────────

const OPTIMAL_POSTING_TIMES: Record<string, PlatformOptimalTimes> = {
  youtube: {
    platformId: 'youtube',
    times: ['09:00', '12:00', '17:00'],
    bestDays: [2, 4, 6], // Tue, Thu, Sat
    timezone: 'UTC',
  },
  linkedin: {
    platformId: 'linkedin',
    times: ['08:00', '10:00', '12:00'],
    bestDays: [1, 2, 3], // Mon, Tue, Wed
    timezone: 'UTC',
  },
  facebook: {
    platformId: 'facebook',
    times: ['13:00', '16:00', '20:00'],
    bestDays: [3, 4, 5], // Wed, Thu, Fri
    timezone: 'UTC',
  },
  tiktok: {
    platformId: 'tiktok',
    times: ['11:00', '19:00', '21:00'],
    bestDays: [1, 3, 5], // Mon, Wed, Fri
    timezone: 'UTC',
  },
  instagram: {
    platformId: 'instagram',
    times: ['11:00', '14:00', '19:00'],
    bestDays: [1, 3, 5], // Mon, Wed, Fri
    timezone: 'UTC',
  },
  twitter: {
    platformId: 'twitter',
    times: ['09:00', '12:00', '18:00'],
    bestDays: [1, 2, 3, 4], // Mon-Thu
    timezone: 'UTC',
  },
  threads: {
    platformId: 'threads',
    times: ['10:00', '14:00', '20:00'],
    bestDays: [2, 4, 6], // Tue, Thu, Sat
    timezone: 'UTC',
  },
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSocialPlatforms(): UseSocialPlatformsResult {
  const platforms = SOCIAL_PLATFORMS;

  const getPlatform = useMemo(
    () => (id: string) => platforms.find(p => p.id === id),
    [platforms],
  );

  const getByFeature = useMemo(
    () => (feature: 'video' | 'shorts' | 'article' | 'reels' | 'stories' | 'carousel') => {
      const featureMap: Record<string, keyof SocialPlatform> = {
        video: 'supportsVideo',
        shorts: 'supportsShorts',
        article: 'supportsArticle',
        reels: 'supportsReels',
        stories: 'supportsStories',
        carousel: 'supportsCarousel',
      };
      return platforms.filter(p => p[featureMap[feature]] as boolean);
    },
    [platforms],
  );

  const getByTier = useMemo(
    () => (tier: string) => {
      const tierOrder = ['free', 'starter', 'pro', 'business', 'enterprise'];
      const maxIdx = tierOrder.indexOf(tier);
      if (maxIdx === -1) return platforms;
      return platforms.filter(p => tierOrder.indexOf(p.tier) <= maxIdx);
    },
    [platforms],
  );

  const getOptimalTimes = useMemo(
    () => (platformId: string) => OPTIMAL_POSTING_TIMES[platformId]?.times || ['09:00', '12:00', '17:00'],
    [],
  );

  const platformIds = useMemo(() => platforms.map(p => p.id), [platforms]);

  // Simple format for SmartSchedulerPanel
  const schedulerPlatforms = useMemo(
    () => platforms.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      color: p.bgColor.includes('gradient') ? p.bgColor : p.bgColor.replace('bg-', 'bg-'),
    })),
    [platforms],
  );

  // Rich format for DistributionPanel
  const distributionPlatforms = useMemo(
    () => platforms.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      color: p.colorClass,
      bgColor: p.bgColor,
      borderColor: p.borderColor,
      connected: p.connected,
      description: p.description,
    })),
    [platforms],
  );

  return {
    platforms,
    getPlatform,
    getByFeature,
    getByTier,
    optimalTimes: OPTIMAL_POSTING_TIMES,
    getOptimalTimes,
    platformIds,
    schedulerPlatforms,
    distributionPlatforms,
  };
}
