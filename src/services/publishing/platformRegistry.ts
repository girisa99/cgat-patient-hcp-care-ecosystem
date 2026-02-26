/**
 * Unified Platform Registry — Single canonical source for all 17 platform variants.
 *
 * Merges 4 separate platform arrays (SmartScheduler, DistributionPanel, EP04PublishHub,
 * SocialPublisher) plus usePlatformExport PLATFORM_PRESETS video specs into ONE registry.
 *
 * 12 platform families × 17 variants, each with:
 * - Feature flags, video specs, caption limits, optimal times, OAuth info
 * - Regional availability across the 16 parent regions
 * - UI colors for consistent rendering
 */

import {
  Youtube, Linkedin, Facebook, Music2, Image as ImageIcon,
  Zap, RefreshCw, Globe, Radio, MessageCircle, Hash, Send,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SocialPlatformId } from '@/types/publishing';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VideoSpec {
  aspectRatio: string;
  resolution: string;
  maxDurationSec: number;
  maxFileSizeMb: number;
  codec: string;
  fps: number;
  safeZone?: string;
}

export interface CaptionLimits {
  titleMax: number;
  descriptionMax: number;
  hashtagMax: number;
  shortCaptionMax: number;
}

export interface OptimalTimes {
  times: string[];
  bestDays: number[];  // 0=Sun, 6=Sat
}

export interface UnifiedPlatformDef {
  id: SocialPlatformId;
  name: string;
  icon: LucideIcon;
  tier: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  // Feature flags
  supportsVideo: boolean;
  supportsShorts: boolean;
  supportsCarousel: boolean;
  supportsStories: boolean;
  supportsAudio: boolean;
  supportsScheduling: boolean;
  // Video specs
  videoSpec?: VideoSpec;
  // Caption limits
  captionLimits: CaptionLimits;
  // Optimal posting times
  optimalTimes: OptimalTimes;
  // OAuth
  oauthSupported: boolean;
  oauthEdgeFunction?: string;
  // Regional availability
  availableRegions: string[] | 'all';
  regionalNotes?: Record<string, string>;
  // UI
  colorClass: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  sortOrder: number;
}

// ─── Registry ───────────────────────────────────────────────────────────────

export const PLATFORM_REGISTRY: Record<SocialPlatformId, UnifiedPlatformDef> = {
  // ── YouTube ───────────────────────────
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    tier: 'free',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: false,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '16:9',
      resolution: '1920x1080',
      maxDurationSec: 43200,
      maxFileSizeMb: 256000,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 100, descriptionMax: 5000, hashtagMax: 15, shortCaptionMax: 100 },
    optimalTimes: { times: ['09:00', '12:00', '17:00'], bestDays: [2, 4, 6] },
    oauthSupported: true,
    oauthEdgeFunction: 'youtube-oauth',
    availableRegions: 'all',
    regionalNotes: { CJK: 'Blocked in China — use Bilibili' },
    colorClass: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40',
    sortOrder: 1,
  },
  youtube_shorts: {
    id: 'youtube_shorts',
    name: 'YouTube Shorts',
    icon: Youtube,
    tier: 'free',
    supportsVideo: true,
    supportsShorts: true,
    supportsCarousel: false,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '9:16',
      resolution: '1080x1920',
      maxDurationSec: 60,
      maxFileSizeMb: 256000,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 100, descriptionMax: 5000, hashtagMax: 15, shortCaptionMax: 100 },
    optimalTimes: { times: ['15:00', '18:00', '21:00'], bestDays: [2, 4, 6] },
    oauthSupported: true,
    oauthEdgeFunction: 'youtube-oauth',
    availableRegions: 'all',
    regionalNotes: { CJK: 'Blocked in China — use Bilibili' },
    colorClass: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40',
    sortOrder: 2,
  },

  // ── TikTok ────────────────────────────
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: Music2,
    tier: 'pro',
    supportsVideo: true,
    supportsShorts: true,
    supportsCarousel: true,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '9:16',
      resolution: '1080x1920',
      maxDurationSec: 600,
      maxFileSizeMb: 4096,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 0, descriptionMax: 2200, hashtagMax: 100, shortCaptionMax: 150 },
    optimalTimes: { times: ['11:00', '19:00', '21:00'], bestDays: [1, 3, 5] },
    oauthSupported: true,
    oauthEdgeFunction: 'tiktok-oauth',
    availableRegions: [
      'NAM', 'Europe', 'Eastern Europe', 'Turkey', 'MENA', 'Africa',
      'India', 'Pakistan', 'Bangladesh', 'South Asia', 'SEA',
      'LATAM', 'Caribbean', 'Oceania', 'Central Asia',
    ],
    regionalNotes: { CJK: 'Use Douyin in China' },
    colorClass: 'text-foreground',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    badgeClass: 'bg-muted text-foreground border-border',
    sortOrder: 3,
  },

  // ── Instagram ─────────────────────────
  instagram_reels: {
    id: 'instagram_reels',
    name: 'Instagram Reels',
    icon: ImageIcon,
    tier: 'pro',
    supportsVideo: true,
    supportsShorts: true,
    supportsCarousel: false,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '9:16',
      resolution: '1080x1920',
      maxDurationSec: 5400,
      maxFileSizeMb: 4096,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 0, descriptionMax: 2200, hashtagMax: 30, shortCaptionMax: 125 },
    optimalTimes: { times: ['11:00', '14:00', '19:00'], bestDays: [1, 3, 5] },
    oauthSupported: true,
    oauthEdgeFunction: 'instagram-oauth',
    availableRegions: 'all',
    colorClass: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    badgeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
    sortOrder: 4,
  },
  instagram_feed: {
    id: 'instagram_feed',
    name: 'Instagram Feed',
    icon: ImageIcon,
    tier: 'pro',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: true,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '1:1',
      resolution: '1080x1080',
      maxDurationSec: 3600,
      maxFileSizeMb: 4096,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 0, descriptionMax: 2200, hashtagMax: 30, shortCaptionMax: 125 },
    optimalTimes: { times: ['11:00', '14:00', '19:00'], bestDays: [1, 3, 5] },
    oauthSupported: true,
    oauthEdgeFunction: 'instagram-oauth',
    availableRegions: 'all',
    colorClass: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    badgeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
    sortOrder: 5,
  },
  instagram_story: {
    id: 'instagram_story',
    name: 'Instagram Story',
    icon: ImageIcon,
    tier: 'pro',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: false,
    supportsStories: true,
    supportsAudio: false,
    supportsScheduling: false,
    videoSpec: {
      aspectRatio: '9:16',
      resolution: '1080x1920',
      maxDurationSec: 60,
      maxFileSizeMb: 4096,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 0, descriptionMax: 0, hashtagMax: 10, shortCaptionMax: 0 },
    optimalTimes: { times: ['08:00', '12:00', '20:00'], bestDays: [0, 1, 2, 3, 4, 5, 6] },
    oauthSupported: true,
    oauthEdgeFunction: 'instagram-oauth',
    availableRegions: 'all',
    colorClass: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    badgeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
    sortOrder: 6,
  },

  // ── Facebook ──────────────────────────
  facebook_feed: {
    id: 'facebook_feed',
    name: 'Facebook',
    icon: Facebook,
    tier: 'free',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: true,
    supportsStories: true,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '16:9',
      resolution: '1920x1080',
      maxDurationSec: 14400,
      maxFileSizeMb: 10240,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 0, descriptionMax: 63206, hashtagMax: 30, shortCaptionMax: 250 },
    optimalTimes: { times: ['13:00', '16:00', '20:00'], bestDays: [3, 4, 5] },
    oauthSupported: false,
    availableRegions: 'all',
    regionalNotes: { CJK: 'Blocked in China' },
    colorClass: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeClass: 'bg-blue-600/20 text-blue-400 border-blue-600/40',
    sortOrder: 7,
  },
  facebook_reels: {
    id: 'facebook_reels',
    name: 'Facebook Reels',
    icon: Facebook,
    tier: 'free',
    supportsVideo: true,
    supportsShorts: true,
    supportsCarousel: false,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '9:16',
      resolution: '1080x1920',
      maxDurationSec: 60,
      maxFileSizeMb: 4096,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 0, descriptionMax: 2200, hashtagMax: 30, shortCaptionMax: 150 },
    optimalTimes: { times: ['13:00', '15:00', '19:00'], bestDays: [3, 4, 5] },
    oauthSupported: false,
    availableRegions: 'all',
    regionalNotes: { CJK: 'Blocked in China' },
    colorClass: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeClass: 'bg-blue-600/20 text-blue-400 border-blue-600/40',
    sortOrder: 8,
  },

  // ── LinkedIn ──────────────────────────
  linkedin_feed: {
    id: 'linkedin_feed',
    name: 'LinkedIn',
    icon: Linkedin,
    tier: 'free',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: true,
    supportsStories: true,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '16:9',
      resolution: '1920x1080',
      maxDurationSec: 600,
      maxFileSizeMb: 5120,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 200, descriptionMax: 3000, hashtagMax: 30, shortCaptionMax: 200 },
    optimalTimes: { times: ['08:00', '10:00', '12:00'], bestDays: [1, 2, 3] },
    oauthSupported: true,
    oauthEdgeFunction: 'linkedin-oauth',
    availableRegions: 'all',
    colorClass: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    sortOrder: 9,
  },
  linkedin_company: {
    id: 'linkedin_company',
    name: 'LinkedIn Company',
    icon: Linkedin,
    tier: 'business',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: true,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '16:9',
      resolution: '1920x1080',
      maxDurationSec: 600,
      maxFileSizeMb: 5120,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 200, descriptionMax: 3000, hashtagMax: 30, shortCaptionMax: 200 },
    optimalTimes: { times: ['08:00', '10:00', '12:00'], bestDays: [1, 2, 3] },
    oauthSupported: true,
    oauthEdgeFunction: 'linkedin-oauth',
    availableRegions: 'all',
    colorClass: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    sortOrder: 10,
  },

  // ── X / Twitter ───────────────────────
  x_twitter: {
    id: 'x_twitter',
    name: 'X (Twitter)',
    icon: Zap,
    tier: 'pro',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: true,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '16:9',
      resolution: '1920x1080',
      maxDurationSec: 140,
      maxFileSizeMb: 512,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 0, descriptionMax: 280, hashtagMax: 10, shortCaptionMax: 280 },
    optimalTimes: { times: ['09:00', '12:00', '18:00'], bestDays: [1, 2, 3, 4] },
    oauthSupported: false,
    availableRegions: 'all',
    colorClass: 'text-foreground',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    badgeClass: 'bg-muted text-foreground border-border',
    sortOrder: 11,
  },

  // ── Threads ───────────────────────────
  threads: {
    id: 'threads',
    name: 'Threads',
    icon: RefreshCw,
    tier: 'business',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: true,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '9:16',
      resolution: '1080x1920',
      maxDurationSec: 300,
      maxFileSizeMb: 1024,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 0, descriptionMax: 500, hashtagMax: 30, shortCaptionMax: 500 },
    optimalTimes: { times: ['10:00', '14:00', '20:00'], bestDays: [2, 4, 6] },
    oauthSupported: false,
    availableRegions: 'all',
    colorClass: 'text-foreground',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    badgeClass: 'bg-muted text-foreground border-border',
    sortOrder: 12,
  },

  // ── Bluesky ───────────────────────────
  bluesky: {
    id: 'bluesky',
    name: 'Bluesky',
    icon: Globe,
    tier: 'pro',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: false,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: false,
    videoSpec: {
      aspectRatio: '16:9',
      resolution: '1920x1080',
      maxDurationSec: 60,
      maxFileSizeMb: 50,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 0, descriptionMax: 300, hashtagMax: 10, shortCaptionMax: 300 },
    optimalTimes: { times: ['10:00', '14:00', '18:00'], bestDays: [1, 3, 5] },
    oauthSupported: false,
    availableRegions: ['NAM', 'Europe', 'Oceania'],
    colorClass: 'text-sky-500',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    badgeClass: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
    sortOrder: 13,
  },

  // ── Pinterest ─────────────────────────
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    icon: Hash,
    tier: 'pro',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: true,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: true,
    videoSpec: {
      aspectRatio: '2:3',
      resolution: '1000x1500',
      maxDurationSec: 900,
      maxFileSizeMb: 2048,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 100, descriptionMax: 500, hashtagMax: 20, shortCaptionMax: 100 },
    optimalTimes: { times: ['20:00', '14:00', '09:00'], bestDays: [5, 6, 0] },
    oauthSupported: false,
    availableRegions: ['NAM', 'Europe', 'Oceania', 'LATAM'],
    colorClass: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeClass: 'bg-red-600/20 text-red-400 border-red-600/40',
    sortOrder: 14,
  },

  // ── Spotify Podcast ───────────────────
  spotify_podcast: {
    id: 'spotify_podcast',
    name: 'Spotify Podcast',
    icon: Radio,
    tier: 'business',
    supportsVideo: false,
    supportsShorts: false,
    supportsCarousel: false,
    supportsStories: false,
    supportsAudio: true,
    supportsScheduling: true,
    captionLimits: { titleMax: 200, descriptionMax: 4000, hashtagMax: 0, shortCaptionMax: 200 },
    optimalTimes: { times: ['06:00', '08:00', '17:00'], bestDays: [1, 2, 3] },
    oauthSupported: false,
    availableRegions: ['NAM', 'Europe', 'LATAM', 'Oceania', 'India', 'SEA'],
    colorClass: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeClass: 'bg-green-500/20 text-green-400 border-green-500/40',
    sortOrder: 15,
  },

  // ── Reddit ────────────────────────────
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    icon: MessageCircle,
    tier: 'pro',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: false,
    supportsStories: false,
    supportsAudio: false,
    supportsScheduling: false,
    videoSpec: {
      aspectRatio: '16:9',
      resolution: '1920x1080',
      maxDurationSec: 900,
      maxFileSizeMb: 1024,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 300, descriptionMax: 40000, hashtagMax: 0, shortCaptionMax: 300 },
    optimalTimes: { times: ['10:00', '13:00', '18:00'], bestDays: [1, 2, 6] },
    oauthSupported: false,
    availableRegions: ['NAM', 'Europe', 'Oceania', 'India'],
    colorClass: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    sortOrder: 16,
  },

  // ── WhatsApp ──────────────────────────
  whatsapp_status: {
    id: 'whatsapp_status',
    name: 'WhatsApp Status',
    icon: Send,
    tier: 'free',
    supportsVideo: true,
    supportsShorts: false,
    supportsCarousel: false,
    supportsStories: true,
    supportsAudio: false,
    supportsScheduling: false,
    videoSpec: {
      aspectRatio: '9:16',
      resolution: '1080x1920',
      maxDurationSec: 30,
      maxFileSizeMb: 16,
      codec: 'H.264',
      fps: 30,
    },
    captionLimits: { titleMax: 0, descriptionMax: 700, hashtagMax: 0, shortCaptionMax: 139 },
    optimalTimes: { times: ['08:00', '12:00', '20:00'], bestDays: [0, 1, 2, 3, 4, 5, 6] },
    oauthSupported: false,
    availableRegions: 'all',
    regionalNotes: { _all: 'Download-only — no publish API' },
    colorClass: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeClass: 'bg-green-600/20 text-green-400 border-green-600/40',
    sortOrder: 17,
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Get all platform definitions sorted by sortOrder */
export function getAllPlatforms(): UnifiedPlatformDef[] {
  return Object.values(PLATFORM_REGISTRY).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Get platforms available in a given parent region */
export function getPlatformsForRegion(region: string): UnifiedPlatformDef[] {
  return getAllPlatforms().filter(p => {
    if (p.availableRegions === 'all') return true;
    return p.availableRegions.includes(region);
  });
}

/** Get platforms at or below a given tier */
export function getPlatformsForTier(tier: UnifiedPlatformDef['tier']): UnifiedPlatformDef[] {
  const order = ['free', 'starter', 'pro', 'business', 'enterprise'];
  const maxIdx = order.indexOf(tier);
  return getAllPlatforms().filter(p => order.indexOf(p.tier) <= maxIdx);
}

/** Get platforms that support a specific feature */
export function getPlatformsByFeature(
  feature: 'video' | 'shorts' | 'carousel' | 'stories' | 'audio' | 'scheduling',
): UnifiedPlatformDef[] {
  const key = `supports${feature.charAt(0).toUpperCase() + feature.slice(1)}` as keyof UnifiedPlatformDef;
  return getAllPlatforms().filter(p => p[key] === true);
}

/** Deduplicate to one entry per platform family (pick the primary variant) */
export function getPrimaryPlatforms(): UnifiedPlatformDef[] {
  const PRIMARY_IDS: SocialPlatformId[] = [
    'youtube', 'tiktok', 'instagram_reels', 'facebook_feed',
    'linkedin_feed', 'x_twitter', 'threads', 'bluesky',
    'pinterest', 'spotify_podcast', 'reddit', 'whatsapp_status',
  ];
  return PRIMARY_IDS.map(id => PLATFORM_REGISTRY[id]);
}

/** Lookup a single platform */
export function getPlatform(id: SocialPlatformId): UnifiedPlatformDef {
  return PLATFORM_REGISTRY[id];
}
