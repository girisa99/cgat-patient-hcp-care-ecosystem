/**
 * Canonical Publishing Types — Single Source of Truth
 *
 * Consolidates 5 duplicate SocialPlatform definitions across:
 * - useSocialOAuth.ts, useSocialPlatforms.ts, SocialPublisher.tsx,
 *   socialCutsService.ts, scheduledPublishingService.ts
 *
 * ALL publishing code imports types from here.
 */

// ─── Platform IDs ──────────────────────────────────────────────────────────
// 17 social platform variants (12 platforms, some with sub-variants)
export type SocialPlatformId =
  | 'youtube' | 'youtube_shorts'
  | 'tiktok'
  | 'instagram_reels' | 'instagram_feed' | 'instagram_story'
  | 'facebook_feed' | 'facebook_reels'
  | 'linkedin_feed' | 'linkedin_company'
  | 'x_twitter'
  | 'threads'
  | 'bluesky'
  | 'pinterest'
  | 'spotify_podcast'
  | 'reddit'
  | 'whatsapp_status';

/** Simplified platform family for OAuth grouping */
export type PlatformFamily =
  | 'youtube' | 'tiktok' | 'instagram' | 'facebook'
  | 'linkedin' | 'twitter' | 'threads' | 'bluesky'
  | 'pinterest' | 'spotify' | 'reddit' | 'whatsapp';

// ─── Content Formats ────────────────────────────────────────────────────────
export type ContentFormatId =
  | 'short_video' | 'long_video' | 'thumbnail' | 'highlight_reel'
  | 'teaser_clip' | 'carousel' | 'story' | 'audio_podcast'
  | 'audiogram' | 'document_embed' | 'social_card' | 'text_post';

// ─── Delivery Modes ─────────────────────────────────────────────────────────
export type DeliveryMode = 'direct_publish' | 'scheduled' | 'download_export' | 'url_share';

// ─── Per-Platform Caption ───────────────────────────────────────────────────
export interface PlatformCaption {
  platformId: SocialPlatformId;
  shortCaption: string;
  longDescription?: string;
  teaserIntro?: string;
  hashtags: string[];
  characterLimit: number;
  language: string;          // BCP47 code
  isRTL: boolean;
  regionalTone?: string;     // From regionalSubRegions culturalTone
}

// ─── Content Package (normalized from any product) ──────────────────────────
export type GenieProduct = 'spark' | 'mind' | 'vibe' | 'deck' | 'cast' | 'hub';

export interface PublishingContentPackage {
  contentId: string;
  contentType: 'video' | 'audio' | 'image' | 'presentation' | 'text' | 'carousel';
  primaryUrl: string;
  thumbnailUrl?: string;
  derivatives?: {
    shortsUrl?: string;
    audiogramUrl?: string;
    carouselSlides?: string[];
  };
  title: string;
  rawDescription: string;
  sourceProduct: GenieProduct;
  region?: string;
  subRegion?: string;
  language?: string;
  enrichmentContext?: Record<string, string>;
}

// ─── Publishing Target ──────────────────────────────────────────────────────
export interface PublishingTarget {
  platformId: SocialPlatformId;
  contentFormatId: ContentFormatId;
  deliveryMode: DeliveryMode;
  enabled: boolean;
  caption?: PlatformCaption;
  scheduledAt?: string;
  visibility?: 'public' | 'private' | 'unlisted';
}

// ─── Operation Result ───────────────────────────────────────────────────────
export interface PublishingOperationResult {
  platformId: SocialPlatformId;
  success: boolean;
  deliveryMode: DeliveryMode;
  postId?: string;
  postUrl?: string;
  downloadUrl?: string;
  error?: string;
}

// ─── Full Session ───────────────────────────────────────────────────────────
export interface PublishingSession {
  sessionId: string;
  content: PublishingContentPackage;
  targets: PublishingTarget[];
  results: PublishingOperationResult[];
}

// ─── OTT / News Outlet Platforms ─────────────────────────────────────────────
export type OutletPlatformId =
  // OTT / Streaming
  | 'ott_roku' | 'ott_apple_tv' | 'ott_fire_tv' | 'ott_samsung_tv'
  | 'ott_lg_channels' | 'ott_pluto_tv' | 'ott_tubi' | 'ott_peacock'
  // News wire / agencies
  | 'news_reuters' | 'news_ap' | 'news_afp' | 'news_upi'
  // News consolidators / syndicators
  | 'consolidator_bbc' | 'consolidator_cnn' | 'consolidator_aljaz'
  | 'consolidator_nhk' | 'consolidator_dw' | 'consolidator_france24'
  // Regional news networks
  | 'regional_ndtv' | 'regional_globo' | 'regional_televisa';

/** Combined platform ID covering social + outlets */
export type AnyPlatformId = SocialPlatformId | OutletPlatformId;

// ─── Quality Gate (OTT / News submission) ─────────────────────────────────
export interface QualityGateResult {
  passed: boolean;
  score: number;
  checks: QualityCheck[];
  requiredScore: number;
}

export interface QualityCheck {
  name: string;
  passed: boolean;
  score: number;
  details: string;
}

// ─── Mapping helpers ────────────────────────────────────────────────────────

/** Map a SocialPlatformId to its parent PlatformFamily (for OAuth grouping) */
export function getPlatformFamily(id: SocialPlatformId): PlatformFamily {
  const map: Record<SocialPlatformId, PlatformFamily> = {
    youtube: 'youtube',
    youtube_shorts: 'youtube',
    tiktok: 'tiktok',
    instagram_reels: 'instagram',
    instagram_feed: 'instagram',
    instagram_story: 'instagram',
    facebook_feed: 'facebook',
    facebook_reels: 'facebook',
    linkedin_feed: 'linkedin',
    linkedin_company: 'linkedin',
    x_twitter: 'twitter',
    threads: 'threads',
    bluesky: 'bluesky',
    pinterest: 'pinterest',
    spotify_podcast: 'spotify',
    reddit: 'reddit',
    whatsapp_status: 'whatsapp',
  };
  return map[id];
}

/** RTL languages (BCP47 prefixes) */
const RTL_LANGUAGES = ['ar', 'he', 'ur', 'fa', 'ps', 'sd', 'yi', 'ku'];

export function isRTLLanguage(lang: string): boolean {
  const prefix = lang.split(/[-_]/)[0].toLowerCase();
  return RTL_LANGUAGES.includes(prefix);
}
