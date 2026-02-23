/**
 * usePlatformExport — Multi-Platform Export Engine
 *
 * Universal export for ALL social/distribution platforms:
 *   Instagram Reels, TikTok, YouTube Shorts, YouTube Long, Facebook,
 *   LinkedIn, X/Twitter, WhatsApp Status, Snapchat, Pinterest,
 *   Threads, Bluesky, WeChat, LINE, KakaoTalk,
 *   Digital Signage, CTV/OTT, Podcast, Email, Website Embed
 *
 * Each platform has auto-optimized: aspect ratio, duration limits,
 * resolution, caption style, thumbnail, safe zones, and codec.
 *
 * Style-agnostic: exports whatever the timeline produces.
 */

import { useState, useCallback, useMemo } from 'react';

// ─── Platform Definitions ───────────────────────────────────────────────────

export type PlatformId =
  // Short-form video
  | 'instagram_reels' | 'tiktok' | 'youtube_shorts' | 'snapchat_spotlight'
  // Long-form video
  | 'youtube' | 'vimeo'
  // Social feeds
  | 'instagram_feed' | 'instagram_story' | 'facebook_feed' | 'facebook_reels'
  | 'facebook_story' | 'linkedin_feed' | 'linkedin_story' | 'x_twitter'
  | 'threads' | 'bluesky' | 'pinterest'
  // Messaging
  | 'whatsapp_status' | 'whatsapp_message' | 'telegram' | 'wechat_moments'
  | 'line_timeline' | 'kakaotalk'
  // Professional
  | 'email_embed' | 'website_embed' | 'landing_page' | 'digital_signage'
  | 'ctv_ott' | 'podcast_video'
  // Download
  | 'download_mp4' | 'download_webm' | 'download_mov' | 'download_gif';

export interface PlatformPreset {
  id: PlatformId;
  name: string;
  category: 'short_video' | 'long_video' | 'social_feed' | 'story' | 'messaging' | 'professional' | 'download';
  icon: string; // Lucide icon name
  // Video constraints
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5' | '4:3' | '21:9';
  resolution: { width: number; height: number };
  maxDurationSec: number;
  minDurationSec: number;
  maxFileSizeMb: number;
  codec: 'h264' | 'h265' | 'vp9' | 'av1';
  fps: 24 | 30 | 60;
  // Audio
  audioCodec: 'aac' | 'opus' | 'mp3';
  audioBitrate: number; // kbps
  // Features
  supportsCaptions: boolean;
  supportsHashtags: boolean;
  supportsThumbnail: boolean;
  supportsScheduling: boolean;
  autoCaption: boolean;
  // Safe zones (% from edges where text/graphics should not appear)
  safeZone: { top: number; bottom: number; left: number; right: number };
  // Notes
  notes: string;
}

export interface ExportJob {
  id: string;
  platformId: PlatformId;
  status: 'queued' | 'processing' | 'encoding' | 'uploading' | 'complete' | 'failed';
  progress: number;
  outputUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
  fileSizeMb?: number;
}

export interface ExportConfig {
  selectedPlatforms: PlatformId[];
  includeCaptions: boolean;
  captionStyle: 'burned_in' | 'srt_file' | 'both';
  captionLanguage: string;
  includeWatermark: boolean;
  watermarkPosition: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
  customThumbnail?: string; // URL
  hashtags: string[];
  title: string;
  description: string;
}

// ─── ALL Platform Presets ───────────────────────────────────────────────────

export const PLATFORM_PRESETS: PlatformPreset[] = [
  // ── Short-Form Video ──────────────────────────────────────────
  {
    id: 'instagram_reels', name: 'Instagram Reels', category: 'short_video', icon: 'Instagram',
    aspectRatio: '9:16', resolution: { width: 1080, height: 1920 },
    maxDurationSec: 90, minDurationSec: 3, maxFileSizeMb: 250,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: true, safeZone: { top: 15, bottom: 20, left: 5, right: 5 },
    notes: 'Recommended: 15-30s for best engagement. Cover image required.',
  },
  {
    id: 'tiktok', name: 'TikTok', category: 'short_video', icon: 'Music2',
    aspectRatio: '9:16', resolution: { width: 1080, height: 1920 },
    maxDurationSec: 600, minDurationSec: 3, maxFileSizeMb: 287,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: true, safeZone: { top: 10, bottom: 25, left: 5, right: 5 },
    notes: 'Best: 15-60s. Bottom 25% reserved for UI overlay.',
  },
  {
    id: 'youtube_shorts', name: 'YouTube Shorts', category: 'short_video', icon: 'Youtube',
    aspectRatio: '9:16', resolution: { width: 1080, height: 1920 },
    maxDurationSec: 60, minDurationSec: 3, maxFileSizeMb: 500,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: false, supportsScheduling: true,
    autoCaption: true, safeZone: { top: 10, bottom: 20, left: 5, right: 5 },
    notes: 'Must be 60s or less. #Shorts tag auto-added.',
  },
  {
    id: 'snapchat_spotlight', name: 'Snapchat Spotlight', category: 'short_video', icon: 'Ghost',
    aspectRatio: '9:16', resolution: { width: 1080, height: 1920 },
    maxDurationSec: 60, minDurationSec: 5, maxFileSizeMb: 250,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: true, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 15, bottom: 15, left: 5, right: 5 },
    notes: 'Vertical only. Audio required.',
  },

  // ── Long-Form Video ───────────────────────────────────────────
  {
    id: 'youtube', name: 'YouTube', category: 'long_video', icon: 'Youtube',
    aspectRatio: '16:9', resolution: { width: 3840, height: 2160 },
    maxDurationSec: 43200, minDurationSec: 3, maxFileSizeMb: 12000,
    codec: 'h264', fps: 60, audioCodec: 'aac', audioBitrate: 256,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: true, safeZone: { top: 5, bottom: 10, left: 5, right: 5 },
    notes: 'Supports 4K. Custom thumbnail strongly recommended.',
  },
  {
    id: 'vimeo', name: 'Vimeo', category: 'long_video', icon: 'Play',
    aspectRatio: '16:9', resolution: { width: 3840, height: 2160 },
    maxDurationSec: 43200, minDurationSec: 1, maxFileSizeMb: 25000,
    codec: 'h264', fps: 60, audioCodec: 'aac', audioBitrate: 320,
    supportsCaptions: true, supportsHashtags: false, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: true, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: 'Professional platform. Supports HDR, 8K on premium.',
  },

  // ── Social Feeds ──────────────────────────────────────────────
  {
    id: 'instagram_feed', name: 'Instagram Feed', category: 'social_feed', icon: 'Instagram',
    aspectRatio: '1:1', resolution: { width: 1080, height: 1080 },
    maxDurationSec: 60, minDurationSec: 3, maxFileSizeMb: 250,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: false, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: '1:1 square for feed. Also supports 4:5 vertical.',
  },
  {
    id: 'instagram_story', name: 'Instagram Story', category: 'story', icon: 'Instagram',
    aspectRatio: '9:16', resolution: { width: 1080, height: 1920 },
    maxDurationSec: 60, minDurationSec: 1, maxFileSizeMb: 250,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: false, supportsScheduling: true,
    autoCaption: false, safeZone: { top: 15, bottom: 15, left: 5, right: 5 },
    notes: 'Stories disappear after 24h. Highlights for persistence.',
  },
  {
    id: 'facebook_feed', name: 'Facebook Feed', category: 'social_feed', icon: 'Facebook',
    aspectRatio: '16:9', resolution: { width: 1920, height: 1080 },
    maxDurationSec: 14400, minDurationSec: 1, maxFileSizeMb: 10000,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: true, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: 'Square (1:1) also performs well. Auto-play without sound.',
  },
  {
    id: 'facebook_reels', name: 'Facebook Reels', category: 'short_video', icon: 'Facebook',
    aspectRatio: '9:16', resolution: { width: 1080, height: 1920 },
    maxDurationSec: 90, minDurationSec: 3, maxFileSizeMb: 250,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: true, safeZone: { top: 15, bottom: 20, left: 5, right: 5 },
    notes: 'Same format as Instagram Reels. Cross-post supported.',
  },
  {
    id: 'facebook_story', name: 'Facebook Story', category: 'story', icon: 'Facebook',
    aspectRatio: '9:16', resolution: { width: 1080, height: 1920 },
    maxDurationSec: 120, minDurationSec: 1, maxFileSizeMb: 250,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: false, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 15, bottom: 15, left: 5, right: 5 },
    notes: 'Disappears after 24h.',
  },
  {
    id: 'linkedin_feed', name: 'LinkedIn', category: 'social_feed', icon: 'Linkedin',
    aspectRatio: '16:9', resolution: { width: 1920, height: 1080 },
    maxDurationSec: 600, minDurationSec: 3, maxFileSizeMb: 5000,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: true, safeZone: { top: 5, bottom: 10, left: 5, right: 5 },
    notes: 'Professional tone. Captions critical (auto-play muted). 1:1 also works.',
  },
  {
    id: 'linkedin_story', name: 'LinkedIn Story', category: 'story', icon: 'Linkedin',
    aspectRatio: '9:16', resolution: { width: 1080, height: 1920 },
    maxDurationSec: 20, minDurationSec: 3, maxFileSizeMb: 250,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: false, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 15, bottom: 15, left: 5, right: 5 },
    notes: 'Max 20 seconds. B2B-focused.',
  },
  {
    id: 'x_twitter', name: 'X / Twitter', category: 'social_feed', icon: 'Twitter',
    aspectRatio: '16:9', resolution: { width: 1920, height: 1080 },
    maxDurationSec: 140, minDurationSec: 1, maxFileSizeMb: 512,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: false, supportsScheduling: true,
    autoCaption: false, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: '2:20 max. Short punchy clips perform best.',
  },
  {
    id: 'threads', name: 'Threads', category: 'social_feed', icon: 'AtSign',
    aspectRatio: '1:1', resolution: { width: 1080, height: 1080 },
    maxDurationSec: 300, minDurationSec: 1, maxFileSizeMb: 250,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: false, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: 'Text-first platform. Short video clips.',
  },
  {
    id: 'bluesky', name: 'Bluesky', category: 'social_feed', icon: 'Cloud',
    aspectRatio: '16:9', resolution: { width: 1920, height: 1080 },
    maxDurationSec: 60, minDurationSec: 1, maxFileSizeMb: 50,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: false, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: '50MB limit. Short clips recommended.',
  },
  {
    id: 'pinterest', name: 'Pinterest', category: 'social_feed', icon: 'Pin',
    aspectRatio: '9:16', resolution: { width: 1080, height: 1920 },
    maxDurationSec: 900, minDurationSec: 4, maxFileSizeMb: 2000,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: false, supportsHashtags: true, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: false, safeZone: { top: 10, bottom: 15, left: 5, right: 5 },
    notes: 'Idea Pins. Vertical performs best. Rich product pins.',
  },

  // ── Messaging ─────────────────────────────────────────────────
  {
    id: 'whatsapp_status', name: 'WhatsApp Status', category: 'messaging', icon: 'MessageCircle',
    aspectRatio: '9:16', resolution: { width: 720, height: 1280 },
    maxDurationSec: 30, minDurationSec: 1, maxFileSizeMb: 16,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: false, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 10, bottom: 10, left: 5, right: 5 },
    notes: '30s max, 16MB limit. Compress aggressively. Disappears 24h.',
  },
  {
    id: 'whatsapp_message', name: 'WhatsApp Message', category: 'messaging', icon: 'MessageCircle',
    aspectRatio: '16:9', resolution: { width: 1280, height: 720 },
    maxDurationSec: 180, minDurationSec: 1, maxFileSizeMb: 64,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: false, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: '64MB for direct messages. Lower quality for smaller file.',
  },
  {
    id: 'telegram', name: 'Telegram', category: 'messaging', icon: 'Send',
    aspectRatio: '16:9', resolution: { width: 1920, height: 1080 },
    maxDurationSec: 3600, minDurationSec: 1, maxFileSizeMb: 2000,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: false, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: 'Generous 2GB limit. Channel posting supported.',
  },
  {
    id: 'wechat_moments', name: 'WeChat Moments', category: 'messaging', icon: 'MessageSquare',
    aspectRatio: '1:1', resolution: { width: 1080, height: 1080 },
    maxDurationSec: 30, minDurationSec: 1, maxFileSizeMb: 25,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: false, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: 'China market. 30s max. Square preferred.',
  },
  {
    id: 'line_timeline', name: 'LINE Timeline', category: 'messaging', icon: 'MessageSquare',
    aspectRatio: '16:9', resolution: { width: 1280, height: 720 },
    maxDurationSec: 300, minDurationSec: 1, maxFileSizeMb: 200,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: false, supportsHashtags: true, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: 'Japan/SEA market. LINE VOOM (Timeline replacement).',
  },
  {
    id: 'kakaotalk', name: 'KakaoTalk', category: 'messaging', icon: 'MessageSquare',
    aspectRatio: '16:9', resolution: { width: 1280, height: 720 },
    maxDurationSec: 300, minDurationSec: 1, maxFileSizeMb: 300,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 128,
    supportsCaptions: false, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: 'Korea market. KakaoStory / Channel posting.',
  },

  // ── Professional ──────────────────────────────────────────────
  {
    id: 'email_embed', name: 'Email Embed', category: 'professional', icon: 'Mail',
    aspectRatio: '16:9', resolution: { width: 640, height: 360 },
    maxDurationSec: 30, minDurationSec: 1, maxFileSizeMb: 5,
    codec: 'h264', fps: 24, audioCodec: 'aac', audioBitrate: 96,
    supportsCaptions: false, supportsHashtags: false, supportsThumbnail: true, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: 'GIF or thumbnail+link. Most email clients block video.',
  },
  {
    id: 'website_embed', name: 'Website Embed', category: 'professional', icon: 'Globe',
    aspectRatio: '16:9', resolution: { width: 1920, height: 1080 },
    maxDurationSec: 3600, minDurationSec: 1, maxFileSizeMb: 500,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 192,
    supportsCaptions: true, supportsHashtags: false, supportsThumbnail: true, supportsScheduling: false,
    autoCaption: true, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: 'Provide embed code. Lazy-load recommended.',
  },
  {
    id: 'landing_page', name: 'Landing Page Hero', category: 'professional', icon: 'Layout',
    aspectRatio: '16:9', resolution: { width: 1920, height: 1080 },
    maxDurationSec: 30, minDurationSec: 3, maxFileSizeMb: 20,
    codec: 'h264', fps: 24, audioCodec: 'aac', audioBitrate: 96,
    supportsCaptions: false, supportsHashtags: false, supportsThumbnail: true, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 10, bottom: 30, left: 10, right: 10 },
    notes: 'Background video. Muted auto-play. Loop. Max 20MB for perf.',
  },
  {
    id: 'digital_signage', name: 'Digital Signage', category: 'professional', icon: 'Monitor',
    aspectRatio: '16:9', resolution: { width: 3840, height: 2160 },
    maxDurationSec: 120, minDurationSec: 5, maxFileSizeMb: 1000,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 192,
    supportsCaptions: true, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: true,
    autoCaption: false, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: '4K for large displays. Loop seamlessly. Bold text.',
  },
  {
    id: 'ctv_ott', name: 'CTV / Connected TV', category: 'professional', icon: 'Tv',
    aspectRatio: '16:9', resolution: { width: 3840, height: 2160 },
    maxDurationSec: 120, minDurationSec: 6, maxFileSizeMb: 2000,
    codec: 'h265', fps: 30, audioCodec: 'aac', audioBitrate: 256,
    supportsCaptions: true, supportsHashtags: false, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: false, safeZone: { top: 5, bottom: 10, left: 5, right: 5 },
    notes: '15s, 30s, 60s standard ad slots. H.265 for bandwidth.',
  },
  {
    id: 'podcast_video', name: 'Podcast Video', category: 'professional', icon: 'Mic',
    aspectRatio: '16:9', resolution: { width: 1920, height: 1080 },
    maxDurationSec: 14400, minDurationSec: 60, maxFileSizeMb: 10000,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 256,
    supportsCaptions: true, supportsHashtags: true, supportsThumbnail: true, supportsScheduling: true,
    autoCaption: true, safeZone: { top: 5, bottom: 5, left: 5, right: 5 },
    notes: 'Long-form. Audio quality is king. Waveform visualization.',
  },

  // ── Downloads ─────────────────────────────────────────────────
  {
    id: 'download_mp4', name: 'Download MP4', category: 'download', icon: 'Download',
    aspectRatio: '16:9', resolution: { width: 1920, height: 1080 },
    maxDurationSec: 86400, minDurationSec: 1, maxFileSizeMb: 50000,
    codec: 'h264', fps: 30, audioCodec: 'aac', audioBitrate: 256,
    supportsCaptions: true, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 0, bottom: 0, left: 0, right: 0 },
    notes: 'Universal format. Customizable resolution.',
  },
  {
    id: 'download_webm', name: 'Download WebM', category: 'download', icon: 'Download',
    aspectRatio: '16:9', resolution: { width: 1920, height: 1080 },
    maxDurationSec: 86400, minDurationSec: 1, maxFileSizeMb: 50000,
    codec: 'vp9', fps: 30, audioCodec: 'opus', audioBitrate: 192,
    supportsCaptions: true, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 0, bottom: 0, left: 0, right: 0 },
    notes: 'Web-optimized. VP9 codec.',
  },
  {
    id: 'download_mov', name: 'Download MOV', category: 'download', icon: 'Download',
    aspectRatio: '16:9', resolution: { width: 3840, height: 2160 },
    maxDurationSec: 86400, minDurationSec: 1, maxFileSizeMb: 100000,
    codec: 'h264', fps: 60, audioCodec: 'aac', audioBitrate: 320,
    supportsCaptions: true, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 0, bottom: 0, left: 0, right: 0 },
    notes: 'Apple QuickTime. High quality. Large files.',
  },
  {
    id: 'download_gif', name: 'Download GIF', category: 'download', icon: 'Image',
    aspectRatio: '16:9', resolution: { width: 640, height: 360 },
    maxDurationSec: 15, minDurationSec: 1, maxFileSizeMb: 20,
    codec: 'h264', fps: 24, audioCodec: 'aac', audioBitrate: 0,
    supportsCaptions: false, supportsHashtags: false, supportsThumbnail: false, supportsScheduling: false,
    autoCaption: false, safeZone: { top: 0, bottom: 0, left: 0, right: 0 },
    notes: 'Animated GIF. No audio. Max 15s. Email/web preview.',
  },
];

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePlatformExport() {
  const [config, setConfig] = useState<ExportConfig>({
    selectedPlatforms: [],
    includeCaptions: true,
    captionStyle: 'burned_in',
    captionLanguage: 'en',
    includeWatermark: false,
    watermarkPosition: 'bottom_right',
    hashtags: [],
    title: '',
    description: '',
  });

  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getPreset = useCallback((platformId: PlatformId) =>
    PLATFORM_PRESETS.find(p => p.id === platformId),
  []);

  const presetsByCategory = useMemo(() => {
    const map = new Map<string, PlatformPreset[]>();
    PLATFORM_PRESETS.forEach(p => {
      const list = map.get(p.category) || [];
      list.push(p);
      map.set(p.category, list);
    });
    return map;
  }, []);

  const selectedPresets = useMemo(
    () => config.selectedPlatforms.map(id => getPreset(id)).filter(Boolean) as PlatformPreset[],
    [config.selectedPlatforms, getPreset],
  );

  // ── Platform Selection ───────────────────────────────────────────────────

  const togglePlatform = useCallback((platformId: PlatformId) => {
    setConfig(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter(id => id !== platformId)
        : [...prev.selectedPlatforms, platformId],
    }));
  }, []);

  const selectCategory = useCallback((category: PlatformPreset['category']) => {
    const platforms = presetsByCategory.get(category) || [];
    setConfig(prev => ({
      ...prev,
      selectedPlatforms: [
        ...prev.selectedPlatforms,
        ...platforms.map(p => p.id).filter(id => !prev.selectedPlatforms.includes(id)),
      ],
    }));
  }, [presetsByCategory]);

  const clearPlatforms = useCallback(() => {
    setConfig(prev => ({ ...prev, selectedPlatforms: [] }));
  }, []);

  // ── Export Actions ───────────────────────────────────────────────────────

  const startExport = useCallback(async (timelineDurationMs: number) => {
    if (config.selectedPlatforms.length === 0) return;
    setIsExporting(true);

    const newJobs: ExportJob[] = config.selectedPlatforms.map(platformId => ({
      id: `export-${platformId}-${Date.now()}`,
      platformId,
      status: 'queued' as const,
      progress: 0,
      startedAt: new Date().toISOString(),
    }));

    setJobs(newJobs);

    // Process sequentially (in real impl, could parallel within provider limits)
    for (const job of newJobs) {
      const preset = getPreset(job.platformId);
      if (!preset) continue;

      // Validate duration
      const durationSec = timelineDurationMs / 1000;
      if (durationSec > preset.maxDurationSec) {
        setJobs(prev => prev.map(j =>
          j.id === job.id
            ? { ...j, status: 'failed', error: `Duration ${Math.round(durationSec)}s exceeds ${preset.maxDurationSec}s limit for ${preset.name}` }
            : j
        ));
        continue;
      }

      // Simulate processing
      setJobs(prev => prev.map(j =>
        j.id === job.id ? { ...j, status: 'processing', progress: 20 } : j
      ));

      // In real implementation: call edge function with timeline + preset
      // await supabase.functions.invoke('genie-cast-assembler', {
      //   body: { timeline, preset, config }
      // });

      setJobs(prev => prev.map(j =>
        j.id === job.id ? { ...j, status: 'encoding', progress: 60 } : j
      ));

      setJobs(prev => prev.map(j =>
        j.id === job.id
          ? { ...j, status: 'complete', progress: 100, completedAt: new Date().toISOString() }
          : j
      ));
    }

    setIsExporting(false);
  }, [config, getPreset]);

  const retryJob = useCallback((jobId: string) => {
    setJobs(prev => prev.map(j =>
      j.id === jobId ? { ...j, status: 'queued', progress: 0, error: undefined } : j
    ));
  }, []);

  const cancelExport = useCallback(() => {
    setIsExporting(false);
    setJobs(prev => prev.map(j =>
      j.status === 'queued' || j.status === 'processing' || j.status === 'encoding'
        ? { ...j, status: 'failed', error: 'Cancelled by user' }
        : j
    ));
  }, []);

  // ── Stats ───────────────────────────────────────────────────────────────

  const exportStats = useMemo(() => ({
    totalJobs: jobs.length,
    completed: jobs.filter(j => j.status === 'complete').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    inProgress: jobs.filter(j => ['queued', 'processing', 'encoding', 'uploading'].includes(j.status)).length,
    overallProgress: jobs.length > 0
      ? Math.round(jobs.reduce((sum, j) => sum + j.progress, 0) / jobs.length)
      : 0,
  }), [jobs]);

  return {
    config,
    setConfig,
    jobs,
    isExporting,
    exportStats,

    // Presets
    getPreset,
    presetsByCategory,
    selectedPresets,
    allPresets: PLATFORM_PRESETS,

    // Selection
    togglePlatform,
    selectCategory,
    clearPlatforms,

    // Export
    startExport,
    retryJob,
    cancelExport,
  };
}

export type PlatformExportHook = ReturnType<typeof usePlatformExport>;
