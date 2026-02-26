/**
 * Outlet Registry — OTT Platforms & News Wire/Consolidators
 *
 * 40+ outlet definitions with submission specs, quality thresholds,
 * regional availability, and compliance notes.
 */

import type { OutletPlatformId } from '@/types/publishing';

// ─── Outlet Definition ────────────────────────────────────────────────────

export interface OutletDef {
  id: OutletPlatformId;
  name: string;
  category: 'ott' | 'news_wire' | 'news_consolidator' | 'regional_network';
  tier: 'pro' | 'business' | 'enterprise';
  /** How content is submitted */
  submissionMethod: 'api' | 'email' | 'portal' | 'ftp' | 'mrss_feed';
  /** Minimum quality gate score (0-100) */
  requiredQualityScore: number;
  acceptsVideo: boolean;
  acceptsAudio: boolean;
  acceptsText: boolean;
  minResolution?: string;
  maxDurationSec?: number;
  requiredMetadata: string[];
  /** Region codes or 'all' */
  availableRegions: string[] | 'all';
  primaryLanguages: string[];
  complianceNotes?: string;
  editorialGuidelines?: string;
}

// ─── Registry ──────────────────────────────────────────────────────────────

export const OUTLET_REGISTRY: Record<OutletPlatformId, OutletDef> = {
  // ── OTT / Streaming ───────────────────────────────────────────────────
  ott_roku: {
    id: 'ott_roku',
    name: 'Roku Channel',
    category: 'ott',
    tier: 'business',
    submissionMethod: 'api',
    requiredQualityScore: 75,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: false,
    minResolution: '1080p',
    maxDurationSec: 7200,
    requiredMetadata: ['title', 'description', 'category', 'thumbnail', 'duration'],
    availableRegions: ['NAM', 'EU', 'LATAM'],
    primaryLanguages: ['en', 'es', 'pt'],
    complianceNotes: 'Content must comply with Roku content policy',
  },
  ott_apple_tv: {
    id: 'ott_apple_tv',
    name: 'Apple TV',
    category: 'ott',
    tier: 'enterprise',
    submissionMethod: 'portal',
    requiredQualityScore: 90,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: false,
    minResolution: '4K',
    maxDurationSec: 14400,
    requiredMetadata: ['title', 'description', 'category', 'thumbnail', 'duration', 'rating', 'geo_tags'],
    availableRegions: 'all',
    primaryLanguages: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'pt'],
    complianceNotes: 'Apple TV+ requires review and approval process',
    editorialGuidelines: 'Premium quality content with closed captions required',
  },
  ott_fire_tv: {
    id: 'ott_fire_tv',
    name: 'Amazon Fire TV',
    category: 'ott',
    tier: 'business',
    submissionMethod: 'api',
    requiredQualityScore: 70,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: false,
    minResolution: '1080p',
    maxDurationSec: 7200,
    requiredMetadata: ['title', 'description', 'category', 'thumbnail'],
    availableRegions: ['NAM', 'EU', 'INDIA', 'CJK'],
    primaryLanguages: ['en', 'de', 'ja', 'hi'],
  },
  ott_samsung_tv: {
    id: 'ott_samsung_tv',
    name: 'Samsung TV Plus',
    category: 'ott',
    tier: 'business',
    submissionMethod: 'mrss_feed',
    requiredQualityScore: 70,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: false,
    minResolution: '1080p',
    maxDurationSec: 3600,
    requiredMetadata: ['title', 'description', 'category', 'thumbnail', 'geo_tags'],
    availableRegions: ['NAM', 'EU', 'SEA', 'CJK', 'LATAM'],
    primaryLanguages: ['en', 'es', 'ko', 'pt', 'fr', 'de'],
  },
  ott_lg_channels: {
    id: 'ott_lg_channels',
    name: 'LG Channels',
    category: 'ott',
    tier: 'business',
    submissionMethod: 'mrss_feed',
    requiredQualityScore: 65,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: false,
    minResolution: '1080p',
    maxDurationSec: 3600,
    requiredMetadata: ['title', 'description', 'category', 'thumbnail'],
    availableRegions: ['NAM', 'EU', 'CJK'],
    primaryLanguages: ['en', 'ko', 'de', 'fr'],
  },
  ott_pluto_tv: {
    id: 'ott_pluto_tv',
    name: 'Pluto TV',
    category: 'ott',
    tier: 'pro',
    submissionMethod: 'portal',
    requiredQualityScore: 60,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: false,
    minResolution: '720p',
    maxDurationSec: 7200,
    requiredMetadata: ['title', 'description', 'category'],
    availableRegions: ['NAM', 'EU', 'LATAM'],
    primaryLanguages: ['en', 'es', 'de', 'fr', 'pt'],
  },
  ott_tubi: {
    id: 'ott_tubi',
    name: 'Tubi',
    category: 'ott',
    tier: 'pro',
    submissionMethod: 'portal',
    requiredQualityScore: 60,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: false,
    minResolution: '720p',
    maxDurationSec: 7200,
    requiredMetadata: ['title', 'description', 'category', 'thumbnail'],
    availableRegions: ['NAM'],
    primaryLanguages: ['en', 'es'],
  },
  ott_peacock: {
    id: 'ott_peacock',
    name: 'Peacock',
    category: 'ott',
    tier: 'enterprise',
    submissionMethod: 'portal',
    requiredQualityScore: 85,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: false,
    minResolution: '4K',
    maxDurationSec: 14400,
    requiredMetadata: ['title', 'description', 'category', 'thumbnail', 'rating', 'duration', 'geo_tags'],
    availableRegions: ['NAM'],
    primaryLanguages: ['en'],
    complianceNotes: 'NBCUniversal editorial standards apply',
    editorialGuidelines: 'Requires professional production quality',
  },

  // ── News Wire / Agencies ──────────────────────────────────────────────
  news_reuters: {
    id: 'news_reuters',
    name: 'Reuters',
    category: 'news_wire',
    tier: 'enterprise',
    submissionMethod: 'api',
    requiredQualityScore: 95,
    acceptsVideo: true,
    acceptsAudio: true,
    acceptsText: true,
    minResolution: '1080p',
    maxDurationSec: 300,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags', 'dateline', 'byline', 'source_attribution'],
    availableRegions: 'all',
    primaryLanguages: ['en', 'ar', 'fr', 'es', 'de', 'ja', 'zh', 'pt', 'ru'],
    complianceNotes: 'Reuters Trust Principles. Factual accuracy mandatory.',
    editorialGuidelines: 'Neutral tone, sourced claims, no editorializing',
  },
  news_ap: {
    id: 'news_ap',
    name: 'Associated Press',
    category: 'news_wire',
    tier: 'enterprise',
    submissionMethod: 'api',
    requiredQualityScore: 95,
    acceptsVideo: true,
    acceptsAudio: true,
    acceptsText: true,
    minResolution: '1080p',
    maxDurationSec: 300,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags', 'dateline', 'byline'],
    availableRegions: 'all',
    primaryLanguages: ['en', 'es', 'ar'],
    complianceNotes: 'AP Stylebook compliance required',
    editorialGuidelines: 'AP standards: accuracy, fairness, independence',
  },
  news_afp: {
    id: 'news_afp',
    name: 'Agence France-Presse',
    category: 'news_wire',
    tier: 'enterprise',
    submissionMethod: 'api',
    requiredQualityScore: 90,
    acceptsVideo: true,
    acceptsAudio: true,
    acceptsText: true,
    minResolution: '1080p',
    maxDurationSec: 300,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags', 'dateline'],
    availableRegions: 'all',
    primaryLanguages: ['fr', 'en', 'es', 'ar', 'de', 'pt'],
  },
  news_upi: {
    id: 'news_upi',
    name: 'United Press International',
    category: 'news_wire',
    tier: 'business',
    submissionMethod: 'email',
    requiredQualityScore: 80,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: true,
    minResolution: '720p',
    maxDurationSec: 300,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags'],
    availableRegions: ['NAM', 'EU', 'MENA'],
    primaryLanguages: ['en', 'es', 'ar'],
  },

  // ── News Consolidators / Syndicators ──────────────────────────────────
  consolidator_bbc: {
    id: 'consolidator_bbc',
    name: 'BBC World Service',
    category: 'news_consolidator',
    tier: 'enterprise',
    submissionMethod: 'portal',
    requiredQualityScore: 90,
    acceptsVideo: true,
    acceptsAudio: true,
    acceptsText: true,
    minResolution: '1080p',
    maxDurationSec: 600,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags', 'source_attribution'],
    availableRegions: 'all',
    primaryLanguages: ['en', 'ar', 'hi', 'ur', 'sw', 'ha', 'fr', 'es', 'pt', 'ru', 'zh', 'ja', 'ko', 'bn', 'fa'],
    complianceNotes: 'BBC Editorial Guidelines apply',
    editorialGuidelines: 'Impartiality, accuracy, editorial integrity',
  },
  consolidator_cnn: {
    id: 'consolidator_cnn',
    name: 'CNN Newsource',
    category: 'news_consolidator',
    tier: 'enterprise',
    submissionMethod: 'ftp',
    requiredQualityScore: 85,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: true,
    minResolution: '1080p',
    maxDurationSec: 300,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags', 'source_attribution'],
    availableRegions: ['NAM', 'EU', 'MENA', 'SEA', 'CJK'],
    primaryLanguages: ['en', 'es', 'ar', 'ja'],
  },
  consolidator_aljaz: {
    id: 'consolidator_aljaz',
    name: 'Al Jazeera',
    category: 'news_consolidator',
    tier: 'enterprise',
    submissionMethod: 'portal',
    requiredQualityScore: 85,
    acceptsVideo: true,
    acceptsAudio: true,
    acceptsText: true,
    minResolution: '1080p',
    maxDurationSec: 600,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags', 'source_attribution'],
    availableRegions: 'all',
    primaryLanguages: ['ar', 'en', 'fr', 'es', 'bn', 'tr', 'bs'],
    complianceNotes: 'Al Jazeera editorial code of ethics',
  },
  consolidator_nhk: {
    id: 'consolidator_nhk',
    name: 'NHK World',
    category: 'news_consolidator',
    tier: 'enterprise',
    submissionMethod: 'portal',
    requiredQualityScore: 85,
    acceptsVideo: true,
    acceptsAudio: true,
    acceptsText: true,
    minResolution: '1080p',
    maxDurationSec: 600,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags'],
    availableRegions: ['CJK', 'NAM', 'EU', 'SEA'],
    primaryLanguages: ['ja', 'en', 'zh', 'ko', 'es', 'fr', 'ar', 'pt', 'hi', 'vi', 'th'],
  },
  consolidator_dw: {
    id: 'consolidator_dw',
    name: 'Deutsche Welle',
    category: 'news_consolidator',
    tier: 'business',
    submissionMethod: 'portal',
    requiredQualityScore: 80,
    acceptsVideo: true,
    acceptsAudio: true,
    acceptsText: true,
    minResolution: '1080p',
    maxDurationSec: 600,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags'],
    availableRegions: 'all',
    primaryLanguages: ['de', 'en', 'es', 'ar', 'fr', 'pt', 'ru', 'tr', 'uk', 'fa', 'hi', 'bn', 'ur'],
  },
  consolidator_france24: {
    id: 'consolidator_france24',
    name: 'France 24',
    category: 'news_consolidator',
    tier: 'business',
    submissionMethod: 'portal',
    requiredQualityScore: 80,
    acceptsVideo: true,
    acceptsAudio: true,
    acceptsText: true,
    minResolution: '1080p',
    maxDurationSec: 600,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags'],
    availableRegions: ['EU', 'AFRICA', 'MENA', 'NAM'],
    primaryLanguages: ['fr', 'en', 'ar', 'es'],
  },

  // ── Regional News Networks ────────────────────────────────────────────
  regional_ndtv: {
    id: 'regional_ndtv',
    name: 'NDTV',
    category: 'regional_network',
    tier: 'business',
    submissionMethod: 'email',
    requiredQualityScore: 70,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: true,
    minResolution: '720p',
    maxDurationSec: 600,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags'],
    availableRegions: ['INDIA', 'SOUTH_ASIA'],
    primaryLanguages: ['en', 'hi'],
  },
  regional_globo: {
    id: 'regional_globo',
    name: 'TV Globo / G1',
    category: 'regional_network',
    tier: 'business',
    submissionMethod: 'portal',
    requiredQualityScore: 75,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: true,
    minResolution: '1080p',
    maxDurationSec: 600,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags'],
    availableRegions: ['LATAM'],
    primaryLanguages: ['pt'],
  },
  regional_televisa: {
    id: 'regional_televisa',
    name: 'Televisa / Univision',
    category: 'regional_network',
    tier: 'business',
    submissionMethod: 'portal',
    requiredQualityScore: 75,
    acceptsVideo: true,
    acceptsAudio: false,
    acceptsText: true,
    minResolution: '1080p',
    maxDurationSec: 600,
    requiredMetadata: ['title', 'description', 'category', 'geo_tags'],
    availableRegions: ['LATAM', 'NAM'],
    primaryLanguages: ['es', 'en'],
  },
};

// ─── Lookup Helpers ─────────────────────────────────────────────────────

export function getAllOutlets(): OutletDef[] {
  return Object.values(OUTLET_REGISTRY);
}

export function getOutletsForRegion(region: string): OutletDef[] {
  return getAllOutlets().filter(
    o => o.availableRegions === 'all' || o.availableRegions.includes(region),
  );
}

export function getOutletsByCategory(category: OutletDef['category']): OutletDef[] {
  return getAllOutlets().filter(o => o.category === category);
}

export function getOutletsByTier(tier: OutletDef['tier']): OutletDef[] {
  return getAllOutlets().filter(o => o.tier === tier);
}

export function getOutletById(id: OutletPlatformId): OutletDef | undefined {
  return OUTLET_REGISTRY[id];
}
