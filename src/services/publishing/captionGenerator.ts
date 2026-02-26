/**
 * Caption Generator — Per-platform caption generation with regional/language support.
 *
 * Auto-generates customized captions for each target platform, adapting:
 * - Tone & length per platform (TikTok punchy vs LinkedIn professional)
 * - Regional hashtags, RTL, cultural tone from 16 regions × 62 subregions
 * - Character limits per platform from PLATFORM_REGISTRY
 */

import type {
  SocialPlatformId,
  ContentFormatId,
  PlatformCaption,
} from '@/types/publishing';
import { isRTLLanguage } from '@/types/publishing';
import { PLATFORM_REGISTRY } from './platformRegistry';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CaptionRequest {
  baseTitle: string;
  baseDescription: string;
  contentType: ContentFormatId;
  platforms: SocialPlatformId[];
  language: string;
  region?: string;
  subRegion?: string;
  culturalTone?: string;
  enrichmentContext?: Record<string, string>;
}

// ─── Per-Platform Tone Templates ────────────────────────────────────────────

interface ToneTemplate {
  hook: (title: string) => string;
  body: (desc: string, limit: number) => string;
  hashtagCount: number;
  emojiDensity: 'none' | 'low' | 'medium' | 'high';
}

const PLATFORM_TONES: Partial<Record<SocialPlatformId, ToneTemplate>> = {
  tiktok: {
    hook: (t) => `${t} #fyp`,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 5,
    emojiDensity: 'high',
  },
  youtube: {
    hook: (t) => t,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 10,
    emojiDensity: 'low',
  },
  youtube_shorts: {
    hook: (t) => `${t} #Shorts`,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 5,
    emojiDensity: 'low',
  },
  linkedin_feed: {
    hook: (t) => t,
    body: (d, lim) => {
      const professional = d.length > 0 ? d : 'Sharing insights on this topic.';
      return truncate(professional, lim);
    },
    hashtagCount: 5,
    emojiDensity: 'none',
  },
  linkedin_company: {
    hook: (t) => t,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 5,
    emojiDensity: 'none',
  },
  instagram_reels: {
    hook: (t) => t,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 20,
    emojiDensity: 'high',
  },
  instagram_feed: {
    hook: (t) => t,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 25,
    emojiDensity: 'high',
  },
  instagram_story: {
    hook: (t) => t,
    body: () => '',
    hashtagCount: 3,
    emojiDensity: 'medium',
  },
  x_twitter: {
    hook: (t) => truncate(t, 100),
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 3,
    emojiDensity: 'low',
  },
  facebook_feed: {
    hook: (t) => t,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 5,
    emojiDensity: 'medium',
  },
  facebook_reels: {
    hook: (t) => t,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 5,
    emojiDensity: 'medium',
  },
  threads: {
    hook: (t) => t,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 5,
    emojiDensity: 'low',
  },
  bluesky: {
    hook: (t) => truncate(t, 100),
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 3,
    emojiDensity: 'low',
  },
  pinterest: {
    hook: (t) => t,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 8,
    emojiDensity: 'low',
  },
  spotify_podcast: {
    hook: (t) => `In this episode: ${t}`,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 0,
    emojiDensity: 'none',
  },
  reddit: {
    hook: (t) => t,
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 0,
    emojiDensity: 'none',
  },
  whatsapp_status: {
    hook: (t) => truncate(t, 80),
    body: (d, lim) => truncate(d, lim),
    hashtagCount: 0,
    emojiDensity: 'low',
  },
};

// ─── Regional Hashtags ──────────────────────────────────────────────────────

const REGIONAL_HASHTAGS: Record<string, string[]> = {
  NAM: ['#USA', '#Canada', '#NorthAmerica'],
  Europe: ['#Europe', '#EU'],
  MENA: ['#MENA', '#MiddleEast'],
  India: ['#India', '#BharatContent'],
  CJK: ['#Asia', '#CJK'],
  SEA: ['#SoutheastAsia', '#SEA'],
  LATAM: ['#LATAM', '#LatinAmerica'],
  Africa: ['#Africa', '#AfricaRising'],
  Oceania: ['#Australia', '#NewZealand'],
  Turkey: ['#Turkey', '#Turkiye'],
  Pakistan: ['#Pakistan'],
  Bangladesh: ['#Bangladesh'],
  'South Asia': ['#SouthAsia'],
  'Eastern Europe': ['#EasternEurope'],
  'Central Asia': ['#CentralAsia'],
  Caribbean: ['#Caribbean'],
};

// ─── Generator ──────────────────────────────────────────────────────────────

export function generateCaptionsSync(
  request: CaptionRequest,
): Record<SocialPlatformId, PlatformCaption> {
  const result: Partial<Record<SocialPlatformId, PlatformCaption>> = {};
  const rtl = isRTLLanguage(request.language);

  for (const platformId of request.platforms) {
    const registry = PLATFORM_REGISTRY[platformId];
    if (!registry) continue;

    const tone = PLATFORM_TONES[platformId] || PLATFORM_TONES.facebook_feed!;
    const limits = registry.captionLimits;

    // Build hashtags
    const hashtags: string[] = [];
    // Add regional hashtags
    if (request.region && REGIONAL_HASHTAGS[request.region]) {
      hashtags.push(...REGIONAL_HASHTAGS[request.region].slice(0, 2));
    }
    // Add enrichment-based hashtags
    if (request.enrichmentContext?.industry) {
      hashtags.push(`#${request.enrichmentContext.industry.replace(/\s+/g, '')}`);
    }
    // Pad with generic platform hashtags
    const genericTags = getGenericHashtags(platformId);
    for (const tag of genericTags) {
      if (hashtags.length >= tone.hashtagCount) break;
      if (!hashtags.includes(tag)) hashtags.push(tag);
    }

    // Build caption
    const shortCaption = truncate(
      tone.hook(request.baseTitle),
      limits.shortCaptionMax || limits.descriptionMax,
    );

    const longDescription = tone.body(
      request.baseDescription || request.baseTitle,
      limits.descriptionMax,
    );

    const teaserIntro = buildTeaser(request.baseTitle, request.contentType, platformId);

    result[platformId] = {
      platformId,
      shortCaption,
      longDescription: longDescription || undefined,
      teaserIntro,
      hashtags: hashtags.slice(0, limits.hashtagMax || 30),
      characterLimit: limits.shortCaptionMax || limits.descriptionMax,
      language: request.language,
      isRTL: rtl,
      regionalTone: request.culturalTone,
    };
  }

  return result as Record<SocialPlatformId, PlatformCaption>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function truncate(text: string, max: number): string {
  if (max <= 0 || !text) return text || '';
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '\u2026';
}

function buildTeaser(
  title: string,
  contentType: ContentFormatId,
  _platformId: SocialPlatformId,
): string {
  const formatLabels: Partial<Record<ContentFormatId, string>> = {
    short_video: 'Watch this quick take',
    long_video: 'Full video',
    thumbnail: 'Check this out',
    highlight_reel: 'Best moments',
    teaser_clip: 'Coming soon',
    carousel: 'Swipe through',
    story: 'See our latest story',
    audio_podcast: 'Listen now',
    audiogram: 'Hear this',
    social_card: 'Read more',
    text_post: '',
    document_embed: 'View document',
  };

  const label = formatLabels[contentType] || '';
  if (!label) return '';
  return `${label}: ${truncate(title, 80)}`;
}

function getGenericHashtags(platformId: SocialPlatformId): string[] {
  const map: Partial<Record<SocialPlatformId, string[]>> = {
    tiktok: ['#fyp', '#foryou', '#viral', '#trending'],
    youtube: ['#shorts', '#subscribe', '#trending'],
    youtube_shorts: ['#Shorts', '#viral', '#trending'],
    instagram_reels: ['#reels', '#explore', '#viral', '#instagood'],
    instagram_feed: ['#instagood', '#photooftheday', '#explore'],
    x_twitter: ['#trending'],
    linkedin_feed: ['#leadership', '#business', '#professional'],
    linkedin_company: ['#business', '#professional', '#industry'],
    facebook_feed: ['#video', '#share'],
    threads: ['#threads'],
    bluesky: [],
    pinterest: ['#inspiration', '#ideas'],
    spotify_podcast: [],
    reddit: [],
    whatsapp_status: [],
    facebook_reels: ['#reels', '#video'],
    instagram_story: [],
  };
  return map[platformId] || [];
}
