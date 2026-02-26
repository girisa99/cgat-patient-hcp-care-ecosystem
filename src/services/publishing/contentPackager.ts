/**
 * Content Packager — Maps each product's output to the universal PublishingContentPackage.
 *
 * Each Genie product has its own output shape. This module normalizes them
 * into a single PublishingContentPackage that the publishing pipeline consumes.
 */

import type { PublishingContentPackage, GenieProduct } from '@/types/publishing';

// ─── Cast ───────────────────────────────────────────────────────────────────

export interface CastArtifacts {
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  shortsUrl?: string;
  title: string;
  description?: string;
}

export interface CastSession {
  id: string;
  selectedRegion?: string;
  selectedSubRegion?: string;
  language?: string;
}

export function packCastContent(
  artifacts: CastArtifacts,
  session: CastSession,
): PublishingContentPackage {
  return {
    contentId: session.id,
    contentType: artifacts.videoUrl ? 'video' : artifacts.audioUrl ? 'audio' : 'text',
    primaryUrl: artifacts.videoUrl || artifacts.audioUrl || '',
    thumbnailUrl: artifacts.thumbnailUrl,
    derivatives: {
      shortsUrl: artifacts.shortsUrl,
    },
    title: artifacts.title,
    rawDescription: artifacts.description || '',
    sourceProduct: 'cast',
    region: session.selectedRegion,
    subRegion: session.selectedSubRegion,
    language: session.language,
  };
}

// ─── Deck ───────────────────────────────────────────────────────────────────

export interface DeckSlides {
  slideUrls: string[];
  pdfUrl?: string;
  videoUrl?: string;
  title: string;
  description?: string;
}

export function packDeckContent(
  slides: DeckSlides,
  exportUrls?: { pdfUrl?: string; videoUrl?: string },
): PublishingContentPackage {
  const primaryUrl = exportUrls?.videoUrl || exportUrls?.pdfUrl || slides.slideUrls[0] || '';
  return {
    contentId: `deck_${Date.now()}`,
    contentType: exportUrls?.videoUrl ? 'video' : 'presentation',
    primaryUrl,
    derivatives: {
      carouselSlides: slides.slideUrls,
    },
    title: slides.title,
    rawDescription: slides.description || '',
    sourceProduct: 'deck',
  };
}

// ─── Spark / Mind (script-based products) ───────────────────────────────────

export interface ScriptOutput {
  id: string;
  title: string;
  body: string;
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
}

export function packScriptContent(
  script: ScriptOutput,
  sourceProduct: 'spark' | 'mind' = 'spark',
): PublishingContentPackage {
  const hasVideo = !!script.videoUrl;
  const hasAudio = !!script.audioUrl;
  return {
    contentId: script.id,
    contentType: hasVideo ? 'video' : hasAudio ? 'audio' : 'text',
    primaryUrl: script.videoUrl || script.audioUrl || '',
    thumbnailUrl: script.thumbnailUrl,
    title: script.title,
    rawDescription: script.body,
    sourceProduct,
  };
}

// ─── Vibe ───────────────────────────────────────────────────────────────────

export interface VibeRecording {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  duration?: number;
}

export function packVibeContent(recording: VibeRecording): PublishingContentPackage {
  return {
    contentId: recording.id,
    contentType: 'video',
    primaryUrl: recording.videoUrl,
    thumbnailUrl: recording.thumbnailUrl,
    title: recording.title,
    rawDescription: recording.description || '',
    sourceProduct: 'vibe',
  };
}

// ─── Hub (generic / admin-driven) ───────────────────────────────────────────

export function packHubContent(
  contentId: string,
  contentUrl: string,
  title: string,
  description: string,
  contentType: PublishingContentPackage['contentType'] = 'video',
  region?: string,
  language?: string,
): PublishingContentPackage {
  return {
    contentId,
    contentType,
    primaryUrl: contentUrl,
    title,
    rawDescription: description,
    sourceProduct: 'hub',
    region,
    language,
  };
}

// ─── Generic (any product) ──────────────────────────────────────────────────

export function packGenericContent(
  id: string,
  type: PublishingContentPackage['contentType'],
  url: string,
  title: string,
  desc: string,
  product: GenieProduct,
  region?: string,
  language?: string,
): PublishingContentPackage {
  return {
    contentId: id,
    contentType: type,
    primaryUrl: url,
    title,
    rawDescription: desc,
    sourceProduct: product,
    region,
    language,
  };
}
