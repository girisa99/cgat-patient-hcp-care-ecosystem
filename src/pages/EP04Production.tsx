/**
 * EP04 TTS Production Page
 * 
 * Generates and plays back all 30 voiceover lines for EP04.
 * Uses multi-provider-tts edge function with ElevenLabs (Host/Nova) + Azure (Atlas).
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Play, Pause, Square, Volume2, VolumeX, Loader2,
  CheckCircle2, AlertCircle, AlertTriangle, Mic, SkipForward, ArrowLeft,
  Camera, Monitor, Image as ImageIcon, ExternalLink,
  Film, Music, Clapperboard, Download, Eye, Layers,
  Share2, Scissors, Trash2, RefreshCw, Zap, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EP04_SCRIPT_CONTENT, EP04_NARRATOR_BRIDGES, type ScriptLine } from '@/config/ep04-script-content';
import { EP04_VOICES, EP04_STORYBOOK_TRANSITIONS, EP04_STORYBOOK_BOOKENDS, EP04_CHARACTER_INTERACTIONS, EP04_NARRATOR_SCROLLS, SCRIPT_TO_PIPELINE_MAP, PIPELINE_TO_SCRIPT_MAP, EP04_AVATAR_CONFIG, EP04_SCENE_PIPELINES, EP04_MUSIC_SCORE } from '@/config/ep04-production-config';
import { EP04_SCENE_SCREENSHOT_MAP, PRODUCT_SCREENS } from '@/components/genie-hub/MultiScreenshotGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EP04PublishHub } from '@/components/genie-cast/EP04PublishHub';
import { ContentRepurposingPanel } from '@/components/genie-cast/ContentRepurposingPanel';
import { useCastProjectPersistence } from '@/hooks/useCastProjectPersistence';
import { useCastProjectData } from '@/hooks/useCastProjectData';
import { useQueryClient } from '@tanstack/react-query';
import { castKeys } from '@/hooks/castQueryKeys';
import {
  useEP04ProjectLookup,
  useRestoredTts,
  useRestoredSceneProduction,
} from '@/hooks/useEP04DataRestore';
import { buildCastTimeline, type CastChapter, type CastTransition, type CastBookends, type CastSpeakerInfo } from '@/utils/castTimelineEngine';
import { Save, FolderOpen } from 'lucide-react';

// ── Build version — check console to verify you're on latest deploy ──
const EP04_BUILD = 'v2026-03-11-B';
console.log(`%c[EP04] Build ${EP04_BUILD} loaded`, 'color: #22c55e; font-weight: bold; font-size: 14px;');
// Session-level cache-buster — bypasses corrupted browser disk cache entries
const MEDIA_CACHE_BUST = `cb=${Date.now()}`;

// Shared helper: detect external CDN URLs that may have expired (~24h TTL)
const isExpiredCdnUrl = (url: string): boolean =>
  !!url && !url.includes('supabase.co/storage') && (
    url.includes('oss-cn-beijing') || url.includes('replicate.delivery') || url.includes('dashscope')
  );

// Upload base64 TTS audio to Supabase Storage instead of storing as data URI
async function uploadTtsToStorage(
  projectId: string,
  lineKey: string,
  base64Audio: string,
): Promise<string> {
  const binaryStr = atob(base64Audio);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'audio/mpeg' });

  const path = `${projectId}/tts/${lineKey}.mp3`;
  const { error } = await supabase.storage.from('cast-assets').upload(path, blob, {
    contentType: 'audio/mpeg',
    upsert: true,
  });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from('cast-assets').getPublicUrl(path);
  return publicUrl;
}

// Upload base64 image data URI to Supabase Storage — prevents MB-sized base64 from bloating DB JSONB
async function uploadBase64ImageToStorage(
  projectId: string,
  key: string,
  dataUri: string,
): Promise<string> {
  // Parse "data:image/png;base64,iVBOR..." → extract mime + raw base64
  const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error('Invalid base64 data URI');
  const mime = match[1];
  const ext = mime.split('/')[1] || 'png';
  const binaryStr = atob(match[2]);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });

  const safeName = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `${projectId}/images/${safeName}.${ext}`;
  const { error } = await supabase.storage.from('cast-assets').upload(path, blob, {
    contentType: mime,
    upsert: true,
  });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from('cast-assets').getPublicUrl(path);
  console.log(`[EP04] Uploaded base64 image → Supabase Storage: ${publicUrl.substring(0, 80)}...`);
  return publicUrl;
}

// Check if a value is a base64 data URI (not a proper HTTP URL)
const isBase64DataUri = (url: string): boolean =>
  typeof url === 'string' && url.startsWith('data:');

// Check if URL is already on Supabase Storage (permanent, never expires)
const isSupabaseStorageUrl = (url: string): boolean =>
  typeof url === 'string' && url.includes('supabase.co/storage');

// Ensure a URL is on Supabase Storage — mirrors base64, CDN, or local assets
// Returns: permanent Supabase Storage URL, or original URL if mirroring fails
async function ensureStorageUrl(
  projectId: string,
  key: string,
  url: string,
  contentType: 'image' | 'video' | 'audio' = 'image',
): Promise<string> {
  // Already on Supabase Storage — nothing to do
  if (isSupabaseStorageUrl(url)) return url;

  // Base64 data URI — decode and upload directly
  if (isBase64DataUri(url)) {
    return uploadBase64ImageToStorage(projectId, key, url);
  }

  // Relative Vite asset path (e.g., /assets/scene-0-title-abc123.png) — make absolute
  let fetchUrl = url;
  if (url.startsWith('/') && !url.startsWith('//')) {
    fetchUrl = `${window.location.origin}${url}`;
  }

  // HTTP(S) URL from external CDN — fetch and re-upload to Storage
  if (fetchUrl.startsWith('http')) {
    const resp = await fetch(fetchUrl);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status} ${resp.statusText}`);
    const blob = await resp.blob();
    let ext: string;
    let mime: string;
    if (contentType === 'video') {
      ext = 'mp4'; mime = 'video/mp4';
    } else if (contentType === 'audio') {
      ext = url.match(/\.(mp3|wav|ogg|aac|m4a|flac)/i)?.[1] || 'mp3';
      mime = ext === 'wav' ? 'audio/wav' : ext === 'ogg' ? 'audio/ogg' : 'audio/mpeg';
    } else {
      ext = url.match(/\.(png|jpg|jpeg|webp|gif)/i)?.[1] || 'png';
      mime = `image/${ext}`;
    }
    const safeName = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    const path = `${projectId}/${contentType}s/${safeName}.${ext}`;
    const { error } = await supabase.storage.from('cast-assets').upload(path, blob, {
      contentType: mime,
      upsert: true,
    });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('cast-assets').getPublicUrl(path);
    console.log(`[EP04] Mirrored ${contentType} to Storage: ${publicUrl.substring(0, 80)}...`);
    return publicUrl;
  }

  // Unknown URL type — return as-is (shouldn't happen)
  return url;
}

// Filter out base64 data URIs from a URL bucket — only keep HTTP(S) URLs
const filterBase64FromBucket = (bucket: Record<string, string>): Record<string, string> => {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(bucket)) {
    if (v && !isBase64DataUri(v)) {
      clean[k] = v;
    } else if (v && isBase64DataUri(v)) {
      console.warn(`[EP04] Stripped base64 data URI from bucket key "${k}" (${v.length} chars) — should have been uploaded to Storage`);
    }
  }
  return clean;
};

// Character avatar imports — upgraded to Pixar 3D portraits for visual consistency with scene backgrounds
import hostAvatar from '@/assets/characters/host-real-photo.jpg';
import atlasAvatar from '@/assets/characters/atlas-avatar-3d.png';
import novaAvatar from '@/assets/characters/nova-avatar-3d.png';
import squirrelAvatar from '@/assets/characters/squirrel-avatar-3d.png';
import ep02Thumbnail from '@/assets/thumbnails/ep02-thumbnail.png';
import claudeLogo from '@/assets/ep04-claude-avatar.png';
import lovableLogo from '@/assets/ep04-lovable-avatar.png';
import allaudinAvatar from '@/assets/characters/allaudin-avatar-3d.png';

// Scene background imports
import scene0Bg from '@/assets/scenes/scene-0-title.png';
import scene1Bg from '@/assets/scenes/scene-1-problem.png';
import scene2Bg from '@/assets/scenes/scene-2-introductions.png';
import scene3Bg from '@/assets/scenes/scene-3-origin.png';
import scene4Bg from '@/assets/scenes/scene-4-solution.png';
import scene5Bg from '@/assets/scenes/scene-5-governance.png';
import scene6Bg from '@/assets/scenes/scene-6-po-actions.png';
import scene7Bg from '@/assets/scenes/scene-7-velocity.png';
import scene8Bg from '@/assets/scenes/scene-8-numbers.png';
import scene9Bg from '@/assets/scenes/scene-9-challenges.png';
import scene10Bg from '@/assets/scenes/scene-10-vision.png';
import scene11Bg from '@/assets/scenes/scene-11-close.png';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GeneratedAudio {
  audioUrl: string;
  provider: string;
  voice: string;
  /** Actual audio duration in seconds (measured from Audio element or API response) */
  audioDuration?: number;
}

type LineStatus = 'idle' | 'generating' | 'done' | 'error';

// ─── Voice config mapping ────────────────────────────────────────────────────
// Falls back to hardcoded EP04_VOICES when DB data not available.

function getVoiceConfigFromStatic(voice: keyof typeof EP04_VOICES) {
  const v = EP04_VOICES[voice];
  return {
    provider: v.provider as string,
    voiceId: v.voiceId,
    stability: 'stability' in v ? v.stability : undefined,
    similarityBoost: 'similarityBoost' in v ? v.similarityBoost : undefined,
    rate: 'rate' in v ? v.rate : undefined,
    pitch: 'pitch' in v ? v.pitch : undefined,
  };
}

const VOICE_COLORS: Record<string, string> = {
  host: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  atlas: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  nova: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  squirrel: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  allaudin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const VOICE_LABELS: Record<string, string> = {
  host: 'Host (Brian) — Sai Dasika, Product Owner',
  atlas: 'Atlas (Azure Guy) — Claude Code',
  nova: 'Nova (Lily) — Lovable',
  squirrel: '🐿️ Squirrel (Gigi) — The Distractor',
  allaudin: '🧞 Allaudin (Clyde) — The Genie',
};

const CHARACTER_AVATARS: Record<string, string> = {
  host: hostAvatar,
  atlas: atlasAvatar,
  nova: novaAvatar,
  squirrel: squirrelAvatar,
  allaudin: allaudinAvatar,
};

// Characters that should regenerate via AI instead of using pre-made avatars
// host: uses real photo (host-real-photo.jpg) for lipsync — WAN2.2 generates talking head from real face
// allaudin: pre-made genie avatar works well, AI regen hits DashScope rate limits
const REGENERATE_AVATAR_VIA_AI: Set<string> = new Set([]);

// ─── Context-Aware Animation Engine ─────────────────────────────────────────
// Parses direction + motion fields to determine mood, energy, and animation style

interface AnimationContext {
  mood: 'proud' | 'dramatic' | 'warm' | 'urgent' | 'playful' | 'serious' | 'mystical' | 'confident' | 'reflective' | 'energetic';
  energy: 'low' | 'medium' | 'high';
  emoji: string;
  label: string;
  avatarAnimation: string;
  cardGlow: string;
  stripGradient: string;
  motionLabel: string;
}

const MOOD_KEYWORDS: Record<string, { mood: AnimationContext['mood']; emoji: string }> = {
  'proud': { mood: 'proud', emoji: '🏆' },
  'reveal': { mood: 'proud', emoji: '✨' },
  'confident': { mood: 'confident', emoji: '💪' },
  'direct': { mood: 'confident', emoji: '🎯' },
  'owning': { mood: 'confident', emoji: '👑' },
  'theatrical': { mood: 'dramatic', emoji: '🎭' },
  'dramatic': { mood: 'dramatic', emoji: '🎬' },
  'grand': { mood: 'dramatic', emoji: '🌟' },
  'gravitas': { mood: 'dramatic', emoji: '⚡' },
  'warm': { mood: 'warm', emoji: '☀️' },
  'welcoming': { mood: 'warm', emoji: '🤝' },
  'genuine': { mood: 'warm', emoji: '💛' },
  'gentle': { mood: 'warm', emoji: '🕊️' },
  'urgent': { mood: 'urgent', emoji: '🚨' },
  'frustrat': { mood: 'urgent', emoji: '😤' },
  'pain': { mood: 'urgent', emoji: '💢' },
  'chaos': { mood: 'urgent', emoji: '🌪️' },
  'crisis': { mood: 'urgent', emoji: '⚠️' },
  'playful': { mood: 'playful', emoji: '🎪' },
  'laugh': { mood: 'playful', emoji: '😄' },
  'mischief': { mood: 'playful', emoji: '😏' },
  'fun': { mood: 'playful', emoji: '🎉' },
  'wink': { mood: 'playful', emoji: '😉' },
  'serious': { mood: 'serious', emoji: '🔒' },
  'weight': { mood: 'serious', emoji: '⚖️' },
  'sobering': { mood: 'serious', emoji: '🪨' },
  'real': { mood: 'serious', emoji: '📋' },
  'honest': { mood: 'serious', emoji: '🔍' },
  'mystical': { mood: 'mystical', emoji: '🔮' },
  'magical': { mood: 'mystical', emoji: '✨' },
  'mist': { mood: 'mystical', emoji: '🌫️' },
  'genie': { mood: 'mystical', emoji: '🧞' },
  'lamp': { mood: 'mystical', emoji: '🪔' },
  'reflect': { mood: 'reflective', emoji: '🪞' },
  'pause': { mood: 'reflective', emoji: '⏸️' },
  'quiet': { mood: 'reflective', emoji: '🤔' },
  'contemplat': { mood: 'reflective', emoji: '💭' },
  'energetic': { mood: 'energetic', emoji: '⚡' },
  'burst': { mood: 'energetic', emoji: '💥' },
  'rapid': { mood: 'energetic', emoji: '🏃' },
  'fast': { mood: 'energetic', emoji: '💨' },
  'excit': { mood: 'energetic', emoji: '🎆' },
};

const MOOD_STYLES: Record<AnimationContext['mood'], Omit<AnimationContext, 'mood' | 'emoji' | 'label' | 'motionLabel'>> = {
  proud:      { energy: 'high',   avatarAnimation: 'proudPulse 1.2s ease-in-out infinite',    cardGlow: 'ring-amber-400/40 shadow-amber-500/20',     stripGradient: 'from-amber-500/15 via-yellow-500/10 to-orange-500/15' },
  dramatic:   { energy: 'high',   avatarAnimation: 'dramaticScale 1.5s ease-in-out infinite',  cardGlow: 'ring-violet-400/40 shadow-violet-500/20',    stripGradient: 'from-violet-500/15 via-purple-500/10 to-fuchsia-500/15' },
  warm:       { energy: 'low',    avatarAnimation: 'warmGlow 2s ease-in-out infinite',         cardGlow: 'ring-orange-300/30 shadow-orange-400/15',    stripGradient: 'from-orange-500/10 via-amber-500/10 to-yellow-500/10' },
  urgent:     { energy: 'high',   avatarAnimation: 'urgentShake 0.4s ease-in-out infinite',    cardGlow: 'ring-red-400/40 shadow-red-500/20',          stripGradient: 'from-red-500/15 via-orange-500/10 to-amber-500/15' },
  playful:    { energy: 'medium', avatarAnimation: 'playfulBounce 0.8s ease-in-out infinite',  cardGlow: 'ring-emerald-400/30 shadow-emerald-500/15',  stripGradient: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10' },
  serious:    { energy: 'low',    avatarAnimation: 'seriousSteady 2.5s ease-in-out infinite',  cardGlow: 'ring-slate-400/30 shadow-slate-500/15',      stripGradient: 'from-slate-500/10 via-zinc-500/10 to-gray-500/10' },
  mystical:   { energy: 'medium', avatarAnimation: 'mysticalFloat 2s ease-in-out infinite',    cardGlow: 'ring-indigo-400/40 shadow-indigo-500/25',    stripGradient: 'from-indigo-500/15 via-blue-500/10 to-purple-500/15' },
  confident:  { energy: 'medium', avatarAnimation: 'confidentPulse 1.8s ease-in-out infinite', cardGlow: 'ring-sky-400/30 shadow-sky-500/15',          stripGradient: 'from-sky-500/10 via-blue-500/10 to-indigo-500/10' },
  reflective: { energy: 'low',    avatarAnimation: 'reflectiveFade 3s ease-in-out infinite',   cardGlow: 'ring-zinc-400/20 shadow-zinc-500/10',        stripGradient: 'from-zinc-500/10 via-slate-500/5 to-gray-500/10' },
  energetic:  { energy: 'high',   avatarAnimation: 'energeticPop 0.6s ease-in-out infinite',   cardGlow: 'ring-lime-400/40 shadow-lime-500/20',        stripGradient: 'from-lime-500/15 via-green-500/10 to-emerald-500/15' },
};

function getAnimationContext(line: ScriptLine): AnimationContext {
  const directionLower = (line.direction || '').toLowerCase();
  const motionLower = (line.motion || '').toLowerCase();
  const combined = `${directionLower} ${motionLower}`;

  // Score each mood by keyword hits
  let bestMood: AnimationContext['mood'] = 'warm';
  let bestScore = 0;
  let bestEmoji = '🎙️';

  const moodScores: Partial<Record<AnimationContext['mood'], { score: number; emoji: string }>> = {};

  for (const [keyword, { mood, emoji }] of Object.entries(MOOD_KEYWORDS)) {
    if (combined.includes(keyword)) {
      if (!moodScores[mood]) moodScores[mood] = { score: 0, emoji };
      moodScores[mood]!.score++;
    }
  }

  for (const [mood, data] of Object.entries(moodScores)) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestMood = mood as AnimationContext['mood'];
      bestEmoji = data.emoji;
    }
  }

  // Build human-readable motion label from the motion field
  const motionLabel = line.motion
    ? line.motion.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Speaking';

  // Build context label from direction (first ~6 words of notable direction)
  const directionWords = (line.direction || '').split(/[.!,—]/).filter(Boolean);
  const label = directionWords[0]?.trim().split(' ').slice(0, 5).join(' ') || bestMood;

  const styles = MOOD_STYLES[bestMood];

  return {
    mood: bestMood,
    energy: styles.energy,
    emoji: bestEmoji,
    label,
    avatarAnimation: styles.avatarAnimation,
    cardGlow: styles.cardGlow,
    stripGradient: styles.stripGradient,
    motionLabel,
  };
}

const SCENE_BACKGROUNDS: Record<string, string> = {
  'scene-0-title': scene0Bg,
  'scene-1-problem': scene1Bg,
  'scene-2-introductions': scene2Bg,
  'scene-3-origin': scene3Bg,
  'scene-4-solution': scene4Bg,
  'scene-5-governance': scene5Bg,
  'scene-6-po-actions': scene6Bg,
  'scene-7-velocity': scene7Bg,
  'scene-8-numbers': scene8Bg,
  'scene-9-challenges': scene9Bg,
  'scene-10-whats-next': scene10Bg,
  'scene-11-close': scene11Bg,
};

// Static branded assets — real images (not AI-generated), keyed by assetKey from config
const STATIC_ASSETS: Record<string, string> = {
  'podcast-banner': ep02Thumbnail,
};

const SCENE_TITLES: Record<string, string> = {
  'scene-0-title': 'Scene 0 — Title & Welcome',
  'scene-1-problem': 'Scene 1 — The Problem',
  'scene-2-introductions': 'Scene 2 — Meet the Team',
  'scene-3-origin': 'Scene 3 — The Origin Story',
  'scene-4-solution': 'Scene 4 — The Solution',
  'scene-5-governance': 'Scene 5 — Governance',
  'scene-6-po-actions': 'Scene 6 — PO Actions',
  'scene-7-velocity': 'Scene 7 — Velocity & Scope Creep',
  'scene-8-numbers': 'Scene 8 — The Numbers',
  'scene-9-challenges': 'Scene 9 — Honest Challenges',
  'scene-10-whats-next': 'Scene 10 — What\'s Next',
  'scene-11-close': 'Scene 11 — Close & CTA',
};

// ─── STORYBOOK CHAPTER MAPPING — chapter number per scene ─────────────────
const SCENE_CHAPTERS: Record<string, { chapter: string; subtitle: string }> = {
  'scene-0-title': { chapter: 'Chapter I', subtitle: 'The Genie Emerges' },
  'scene-1-problem': { chapter: 'Chapter I', subtitle: 'The Problem' },
  'scene-2-introductions': { chapter: 'Chapter II', subtitle: 'The Cast' },
  'scene-3-origin': { chapter: 'Chapter II', subtitle: 'Origins' },
  'scene-4-solution': { chapter: 'Chapter III', subtitle: 'The Sprint Begins' },
  'scene-5-governance': { chapter: 'Chapter III', subtitle: 'Governance' },
  'scene-6-po-actions': { chapter: 'Chapter IV', subtitle: 'The Bottleneck' },
  'scene-7-velocity': { chapter: 'Chapter IV', subtitle: 'Velocity' },
  'scene-8-numbers': { chapter: 'Chapter V', subtitle: 'The Dashboard Tour' },
  'scene-9-challenges': { chapter: 'Chapter V', subtitle: 'Storms' },
  'scene-10-whats-next': { chapter: 'Chapter VI', subtitle: 'Stars' },
  'scene-11-close': { chapter: 'The Last Page', subtitle: 'For Now' },
};

// ─── TRANSITION TYPE BADGES — which storybook transition precedes this scene ─
const SCENE_TRANSITION_TYPES: Record<string, string> = {};
EP04_STORYBOOK_TRANSITIONS.forEach(t => {
  SCENE_TRANSITION_TYPES[t.to] = t.style;
});

const TRANSITION_LABELS: Record<string, string> = {
  'page-turn': 'Page Turn',
  'scroll-unroll': 'Scroll Unroll',
  'iris-wipe': 'Iris Wipe',
  'storybook-flip': 'Storybook Flip',
  'chapter-card': 'Chapter Card',
  'dissolve-morph': 'Dissolve Morph',
};

const TRANSITION_COLORS: Record<string, string> = {
  'page-turn': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'scroll-unroll': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'iris-wipe': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'storybook-flip': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'chapter-card': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'dissolve-morph': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
};

// ─── THREE-PROVIDER SHOWCASE MIX ──────────────────────────────────────────
// Pre-selected video provider per scene based on narrative tone.
// Sora2API: cinematic hero moments. Gemini Veo: data/numbers. Wan: character-driven.
type VideoProviderChoice = 'alibaba' | 'sora2api' | 'gemini';
// EP04 uses Alibaba (WAN) for all video generation — consistent Pixar 3D style.
// Future episodes can mix Sora2API + Gemini Veo for variety.
const SCENE_PROVIDER_DEFAULTS: Record<string, { provider: VideoProviderChoice; rationale: string }> = {
  'scene-0-title':          { provider: 'alibaba',  rationale: 'Cinematic genie lamp — Pixar 3D' },
  'scene-1-problem':        { provider: 'alibaba',  rationale: 'Character-driven — Pixar warmth' },
  'scene-2-introductions':  { provider: 'alibaba',  rationale: 'Character intros — Pixar personality' },
  'scene-3-origin':         { provider: 'alibaba',  rationale: 'Dramatic turning point — Pixar 3D' },
  'scene-4-solution':       { provider: 'alibaba',  rationale: 'Sprint action — Pixar energy' },
  'scene-5-governance':     { provider: 'alibaba',  rationale: 'Team collaboration — animated warmth' },
  'scene-6-po-actions':     { provider: 'alibaba',  rationale: 'Technical showcase — stylized' },
  'scene-7-velocity':       { provider: 'alibaba',  rationale: 'Data storytelling — Pixar 3D' },
  'scene-8-numbers':        { provider: 'alibaba',  rationale: '18-screen montage — Pixar 3D' },
  'scene-9-challenges':     { provider: 'alibaba',  rationale: '"36h→22min" — Pixar 3D reveal' },
  'scene-10-whats-next':    { provider: 'alibaba',  rationale: 'Language constellation — Pixar 3D' },
  'scene-11-close':         { provider: 'alibaba',  rationale: 'Emotional farewell — Pixar 3D close' },
};

const VIDEO_PROVIDER_OPTIONS: Array<{ id: VideoProviderChoice; label: string; color: string; description: string }> = [
  { id: 'alibaba',  label: 'Alibaba Wan 2.6', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', description: 'Pixar 3D, animation (current)' },
  { id: 'sora2api', label: 'Sora2API (Sora-2)', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30', description: 'Cinematic, realistic, documentary' },
  { id: 'gemini',   label: 'Gemini Veo 2', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', description: 'Data viz, typography, explainer' },
];

const SCENE_STYLES: Record<string, string> = {
  'scene-0-title': 'Pixar 3D',
  'scene-1-problem': 'Anime',
  'scene-2-introductions': 'Watercolor',
  'scene-3-origin': 'Flat Illustration',
  'scene-4-solution': 'Pixar 3D',
  'scene-5-governance': 'Anime',
  'scene-6-po-actions': 'Watercolor',
  'scene-7-velocity': 'Pixar 3D',
  'scene-8-numbers': 'Flat Illustration',
  'scene-9-challenges': 'Anime',
  'scene-10-whats-next': 'Watercolor',
  'scene-11-close': 'Pixar 3D',
};

// ─── Bridge: EP04Production scene IDs → EP04_SCENE_SCREENSHOT_MAP scene IDs ──
// Production scenes use "scene-N-name" while screenshot map uses different naming
const SCENE_TO_SCREENSHOT_MAP: Record<string, string[]> = {
  'scene-0-title': [], // Pure AI — title card
  'scene-1-problem': ['scene-1-cold-open'], // motion-graphics — AI regen from original
  'scene-2-introductions': ['scene-2-meet-team'], // 3d-avatar — character intro
  'scene-3-origin': ['scene-3-governance'], // mixed — ORIGINAL screenshots (charter, governance)
  'scene-4-solution': ['scene-4-day1'], // mixed — ORIGINAL (day-1, findings)
  'scene-5-governance': ['scene-5-day2'], // mixed — ORIGINAL (day-2, po-actions)
  'scene-6-po-actions': ['scene-6-day3'], // mixed — ORIGINAL (day-3, velocity)
  'scene-7-velocity': ['scene-7-mission-control'], // screen-capture — ORIGINAL (mission control, standup, qa, eod)
  'scene-8-numbers': ['scene-8-dashboard-tour'], // screen-capture — ORIGINAL (18 screens!)
  'scene-9-challenges': ['scene-9-numbers'], // motion-graphics — AI regen
  'scene-10-whats-next': ['scene-10-whats-next'], // 3d-avatar — pure AI
  'scene-11-close': ['scene-11-close'], // 3d-avatar — pure AI
};

// Get screenshot details for a production scene
function getSceneScreenshots(productionSceneId: string) {
  const mappedIds = SCENE_TO_SCREENSHOT_MAP[productionSceneId] || [];
  const results: Array<{
    sceneLabel: string;
    visualStyle: string;
    screenIds: string[];
    screens: Array<{ id: string; name: string; description: string }>;
  }> = [];

  for (const mappedId of mappedIds) {
    const mapEntry = EP04_SCENE_SCREENSHOT_MAP.find(s => s.sceneId === mappedId);
    if (!mapEntry) continue;

    const sprintScreens = PRODUCT_SCREENS['sprint-tracker'] || [];
    const screens = mapEntry.screenIds
      .map(sid => sprintScreens.find(s => s.id === sid))
      .filter(Boolean) as Array<{ id: string; name: string; description: string }>;

    results.push({
      sceneLabel: mapEntry.sceneLabel,
      visualStyle: mapEntry.visualStyle,
      screenIds: mapEntry.screenIds,
      screens,
    });
  }

  return results;
}

const VISUAL_STYLE_CONFIG: Record<string, { label: string; icon: string; color: string; showOriginal: boolean }> = {
  'screen-capture': { label: 'Original Screenshots', icon: '📸', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', showOriginal: true },
  'mixed': { label: 'Original + AI Enhanced', icon: '🔀', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', showOriginal: true },
  'motion-graphics': { label: 'AI Regenerated', icon: '✨', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', showOriginal: false },
  '3d-avatar': { label: '3D Avatar Scene', icon: '🎭', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30', showOriginal: false },
};

// ─── Component ───────────────────────────────────────────────────────────────

// ─── Error Boundary for EP04 ──────────────────────────────────────────────
class EP04ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[EP04] Render crash:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="p-8 text-center max-w-lg border rounded-xl bg-card">
            <h2 className="text-xl font-bold mb-3 text-destructive">EP04 Render Error</h2>
            <p className="text-sm text-muted-foreground mb-2">{this.state.error?.message || 'Unknown error'}</p>
            <p className="text-xs text-muted-foreground mb-4 font-mono break-all">{this.state.error?.stack?.split('\n').slice(0, 3).join('\n')}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  // Clear service worker cache and hard reload
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(regs => {
                      regs.forEach(r => r.unregister());
                    });
                    caches.keys().then(names => {
                      names.forEach(name => caches.delete(name));
                    });
                  }
                  window.location.reload();
                }}
                className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium"
              >
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function EP04Production() {
  return (
    <EP04ErrorBoundary>
      <EP04ProductionInner />
    </EP04ErrorBoundary>
  );
}

function EP04ProductionInner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');
  const queryClient = useQueryClient();

  // ─── React Query: project lookup (replaces manual useEffect + useState) ──
  const {
    projectId: rqProjectId,
    isLoading: projectLoading,
    error: projectLoadError,
    retry: retryProjectLookup,
  } = useEP04ProjectLookup(urlProjectId);
  const projectId = rqProjectId;
  const {
    saveProjectContent, loadProjectContent, updateLineTTS,
    trackGenerationJob, completeGenerationJob, fetchTokenBreakdown,
    tokenBreakdown, isSaving, isLoading: isLoadingContent,
    updateSceneArtifacts, updateSceneMusic, updateFinalAssembly,
  } = useCastProjectPersistence();

  // Project lookup is now handled by useEP04ProjectLookup (React Query)
  // — see rqProjectId above. Auth, lookup, legacy fallback, and auto-create
  // are all encapsulated in the hook with 30-min cache.

  // ─── DB-driven data (with fallback to config imports) ──────────────
  const dbProject = useCastProjectData(projectId);

  // Build full script: 109 dialogue lines + 11 narrator bridges = 120 total
  // DB data takes precedence for lines it has; static config fills any gaps.

  // Map transition scene keys → their parent scene key so bridges fold into scenes
  const TRANSITION_TO_SCENE: Record<string, string> = {
    'transition-0-to-1': 'scene-0-title',
    'transition-1-to-2': 'scene-1-problem',
    'transition-2-to-3': 'scene-2-introductions',
    'transition-3-to-4': 'scene-3-origin',
    'transition-4-to-5': 'scene-4-solution',
    'transition-5-to-6': 'scene-5-governance',
    'transition-6-to-7': 'scene-6-po-actions',
    'transition-7-to-8': 'scene-7-velocity',
    'transition-8-to-9': 'scene-8-numbers',
    'transition-9-to-10': 'scene-9-challenges',
    'transition-10-to-11': 'scene-10-whats-next',
  };

  const remapScene = (sceneKey: string) => TRANSITION_TO_SCENE[sceneKey] || sceneKey;

  const scriptContentForUI = React.useMemo<Record<string, ScriptLine>>(() => {
    // AUTHORITATIVE line list — always from static config (143 dialogue + 11 bridges = 154 total).
    // DB data is ONLY used for TTS audio restoration (handled by loadProjectContent effect).
    // This prevents duplicate lines from DB seeding issues (transition-scene double-entries).
    const fullStaticScript: Record<string, ScriptLine> = {};
    for (const [key, line] of Object.entries(EP04_SCRIPT_CONTENT)) {
      fullStaticScript[key] = { ...line, scene: remapScene(line.scene) };
    }
    for (const [key, line] of Object.entries(EP04_NARRATOR_BRIDGES)) {
      fullStaticScript[key] = { ...line, scene: remapScene(line.scene) };
    }
    return fullStaticScript;
  }, []);

  // Voice config lookup: DB first, then static config
  const getVoiceConfig = React.useCallback((voice: string) => {
    if (dbProject.isSeeded) {
      const dbVoice = dbProject.voiceConfigFor(voice);
      if (dbVoice) {
        return {
          provider: dbVoice.provider,
          voiceId: dbVoice.voiceId,
          stability: dbVoice.stability,
          similarityBoost: dbVoice.similarityBoost,
          rate: dbVoice.rate,
          pitch: dbVoice.pitch,
        };
      }
    }
    return getVoiceConfigFromStatic(voice as keyof typeof EP04_VOICES);
  }, [dbProject.isSeeded, dbProject.voiceConfigFor]);

  const scriptKeys = Object.keys(scriptContentForUI);

  // Group lines by scene — used both by render and production callbacks
  const scenes = React.useMemo(() => {
    const map = new Map<string, { keys: string[]; lines: ScriptLine[] }>();
    for (const key of scriptKeys) {
      const line = scriptContentForUI[key];
      if (!map.has(line.scene)) {
        map.set(line.scene, { keys: [], lines: [] });
      }
      map.get(line.scene)!.keys.push(key);
      map.get(line.scene)!.lines.push(line);
    }
    return map;
  }, [scriptKeys, scriptContentForUI]);

  // ─── Change 8: Pipeline verification — which scenes have pipeline data ──
  const scenesWithPipeline = React.useMemo(() => {
    return Array.from(scenes.keys()).filter(k => {
      // Config file is source of truth (always available), DB is fallback
      const pipelineSceneKey = SCRIPT_TO_PIPELINE_MAP[k] || k;
      const configPipeline = EP04_SCENE_PIPELINES[pipelineSceneKey as keyof typeof EP04_SCENE_PIPELINES];
      const p = configPipeline || dbProject.scenePipelineFor(k);
      const steps = Array.isArray(p) ? p : (p?.steps || []);
      return steps.length > 0;
    });
  }, [scenes, dbProject]);

  // ─── Stats (computed from state — placed early for callback access) ────
  // These are referenced by production phase callbacks and the render below.

  // State
  const [audioMap, setAudioMap] = useState<Record<string, GeneratedAudio>>({});
  const [statusMap, setStatusMap] = useState<Record<string, LineStatus>>({});
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [screenshotUrls, setScreenshotUrls] = useState<Record<string, string>>({});
  const [screenshotsLoading, setScreenshotsLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef(false);

  // ─── Full Production Pipeline State (Phases 2-5) ────────────────────────

  type ProductionPhase = 'tts' | 'tts_approved' | 'visual' | 'music' | 'assembly' | 'complete';

  interface SceneProductionStatus {
    visual: 'idle' | 'generating' | 'done' | 'error';
    music: 'idle' | 'generating' | 'done' | 'error';
    sfx: 'idle' | 'generating' | 'done' | 'error';
    assembled: 'idle' | 'generating' | 'done' | 'error';
    videoUrls: Record<string, string>;
    imageUrls: Record<string, string>;
    avatarUrls: Record<string, string>;
    lipsyncUrls: Record<string, string>;
    musicUrl: string | null;
    sfxUrls: string[];
    assembledClipUrl: string | null;
  }

  const defaultSceneStatus = (): SceneProductionStatus => ({
    visual: 'idle', music: 'idle', sfx: 'idle', assembled: 'idle',
    videoUrls: {}, imageUrls: {}, avatarUrls: {}, lipsyncUrls: {},
    musicUrl: null, sfxUrls: [], assembledClipUrl: null,
  });

  const [productionPhase, setProductionPhase] = useState<ProductionPhase>('tts');
  const [sceneProduction, setSceneProduction] = useState<Record<string, SceneProductionStatus>>({});
  const [visualProgress, setVisualProgress] = useState<{ current: number; total: number } | null>(null);
  const [musicProgress, setMusicProgress] = useState<{ current: number; total: number } | null>(null);
  const [assemblyProgress, setAssemblyProgress] = useState<string | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  // Per-scene video provider selections (for three-provider showcase)
  const [sceneProviders, setSceneProviders] = useState<Record<string, VideoProviderChoice>>(() => {
    const defaults: Record<string, VideoProviderChoice> = {};
    for (const [key, val] of Object.entries(SCENE_PROVIDER_DEFAULTS)) {
      defaults[key] = val.provider;
    }
    return defaults;
  });
  const [regenProgress, setRegenProgress] = useState<Record<string, 'idle' | 'generating' | 'done' | 'error'>>({});

  // ─── Concat / Stitching state ──────────────────────────────────────────
  const [concatStatus, setConcatStatus] = useState<'idle' | 'submitting' | 'rendering' | 'completed' | 'failed'>('idle');
  const [concatJobId, setConcatJobId] = useState<string | null>(null);
  const [concatVideoUrl, setConcatVideoUrl] = useState<string | null>(null);
  const [concatError, setConcatError] = useState<string | null>(null);

  // ─── React Query: TTS + scene restoration (replaces 400-line useEffect) ──
  // Cache: TTS 15 min, scenes 10 min. Zero DB queries on page refresh within window.
  const rqTts = useRestoredTts(projectId, scriptContentForUI);
  const rqScenes = useRestoredSceneProduction(projectId, Object.keys(SCENE_TITLES));
  const rqContentLoaded = !rqTts.isLoading && !rqScenes.isLoading && !!projectId;

  // ─── Bridge: sync React Query results → existing useState (migration bridge) ──
  // This effect runs when RQ data changes, keeping the existing render logic intact.
  // Once all downstream consumers are migrated to read from RQ directly, this can be removed.
  const rqBridgeApplied = useRef(false);
  useEffect(() => {
    if (!rqContentLoaded) return;
    // Only apply the bridge once per data load (RQ handles re-fetching)
    if (rqBridgeApplied.current) return;
    rqBridgeApplied.current = true;

    const staticKeys = new Set(Object.keys(scriptContentForUI));

    // Apply TTS data from React Query
    if (Object.keys(rqTts.audioMap).length > 0) {
      setAudioMap(rqTts.audioMap);
      setStatusMap(rqTts.statusMap);
      const matchCount = Object.keys(rqTts.audioMap).filter(k => staticKeys.has(k)).length;
      toast.success(`Restored ${matchCount} saved voiceovers`);
      console.log(`[EP04 RQ Bridge] TTS: ${matchCount} match static config`);
    }

    // Apply scene production data from React Query
    const restoredScenes = rqScenes.sceneProduction;
    if (Object.keys(restoredScenes).length > 0) {
      setSceneProduction(prev => ({ ...prev, ...restoredScenes }));
      setProductionPhase(rqScenes.productionPhase);

      const restoredVisualCount = Object.keys(restoredScenes).filter(sk => restoredScenes[sk].visual === 'done').length;
      const musicCount = Object.values(restoredScenes).filter(s => s.music === 'done').length;
      const restoreMsg = `Restored ${Object.keys(restoredScenes).length} scene(s)${restoredVisualCount > 0 ? ` (${restoredVisualCount} with visuals)` : ''}${musicCount > 0 ? `, ${musicCount} with music` : ''}`;
      toast.success(restoreMsg);
      console.log(`[EP04 RQ Bridge] Scenes: ${restoreMsg}, phase=${rqScenes.productionPhase}`);

      if (rqScenes.expiredMusicCount > 0) {
        toast.warning(`${rqScenes.expiredMusicCount} scene(s) have expired music URLs. Use "Regen Music" in Phase 4.`);
      }
    }

    // Background: re-persist TTS data recovered from generation_jobs fallback
    const ttsEntries = Object.entries(rqTts.audioMap).filter(([k]) => staticKeys.has(k));
    if (ttsEntries.length > 0) {
      (async () => {
        const BATCH_SIZE = 10;
        const db = supabase as any;
        for (let i = 0; i < ttsEntries.length; i += BATCH_SIZE) {
          const batch = ttsEntries.slice(i, i + BATCH_SIZE);
          await Promise.allSettled(batch.map(([lineKey, audio]) =>
            db.from('cast_project_script_lines')
              .update({
                tts_audio_url: audio.audioUrl,
                tts_provider: audio.provider,
                tts_status: 'generated',
              })
              .eq('project_id', projectId)
              .eq('line_key', lineKey)
          ));
          if (i + BATCH_SIZE < ttsEntries.length) {
            await new Promise(r => setTimeout(r, 100));
          }
        }
        console.log(`[EP04 RQ Bridge] Background TTS re-persist: ${ttsEntries.length} lines`);
      })();
    }

    setContentLoaded(true);
  }, [rqContentLoaded, rqTts.audioMap, rqTts.statusMap, rqScenes.sceneProduction, rqScenes.productionPhase, rqScenes.expiredMusicCount, projectId]);

  // ─── Cache invalidation helper — call after any mutation that writes to DB ──
  const invalidateSceneCache = useCallback(() => {
    if (!projectId) return;
    queryClient.invalidateQueries({ queryKey: castKeys.project(projectId).sceneSummaries });
  }, [projectId, queryClient]);

  const invalidateTtsCache = useCallback(() => {
    if (!projectId) return;
    queryClient.invalidateQueries({ queryKey: castKeys.project(projectId).ttsLines });
  }, [projectId, queryClient]);

  // ─── Auto-seed DB if projectId present but no DB data ──────────────────
  // GUARDED: only runs ONCE per page load to prevent re-seeding (which wipes TTS data).
  // ALSO GUARDED: skip if sceneProduction already has restored assets — re-seeding
  // upserts scene_config and wipes artifacts that were saved by updateSceneArtifacts.
  const seedAttemptedRef = useRef(false);

  useEffect(() => {
    if (!projectId || dbProject.isLoading || dbProject.isSeeded) return;
    if (seedAttemptedRef.current) return; // prevent repeated seed attempts
    // Wait for restoration to finish before deciding to seed — otherwise we race with artifact restore
    if (!contentLoaded) return;
    // Don't re-seed if we already restored visual artifacts — the upsert wipes scene_config.artifacts
    // Check BOTH in-memory state AND whether any audio/visual generation jobs exist in DB
    const hasRestoredAssets = Object.values(sceneProduction).some(s =>
      s.visual === 'done' || s.music === 'done' || s.sfx === 'done' || s.assembled === 'done'
    );
    if (hasRestoredAssets) {
      console.log('[EP04] Skipping auto-seed — production data already restored from DB');
      seedAttemptedRef.current = true;
      return;
    }
    // Extra guard: check DB directly for existing scene rows with artifacts before wiping
    seedAttemptedRef.current = true;
    (async () => {
      try {
        const { count } = await supabase
          .from('cast_project_scenes')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', projectId);
        if (count && count > 0) {
          console.log(`[EP04] Skipping auto-seed — ${count} scene rows already exist in DB`);
          return;
        }
      } catch (e) {
        // If check fails, proceed cautiously
      }
      console.log('[EP04] No DB data found — auto-seeding from config files...');
      dbProject.seedFromConfig().then(ok => {
        if (ok) toast.success('Project seeded from config — DB is now source of truth');
        else console.warn('[EP04] Auto-seed failed — using config file fallback');
      });
    })();
  }, [projectId, dbProject.isLoading, dbProject.isSeeded, sceneProduction, contentLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Load token breakdown on mount ──────────────────────────────────────

  useEffect(() => {
    if (projectId) fetchTokenBreakdown(projectId);
  }, [projectId, fetchTokenBreakdown]);

  // ─── Load screenshots from Supabase storage (auto-captured by MultiScreenshotGallery) ──

  useEffect(() => {
    async function loadScreenshots() {
      try {
        // Auto-capture saves to: product-screenshots/screenshots/{productId}-{screenId}.png
        const { data: files, error } = await supabase.storage
          .from('product-screenshots')
          .list('screenshots', { limit: 100 });

        if (error || !files?.length) {
          setScreenshotsLoading(false);
          return;
        }

        const urls: Record<string, string> = {};
        for (const file of files) {
          // Only load sprint-tracker captures (format: "sprint-tracker-{screenId}.png")
          if (!file.name.startsWith('sprint-tracker-')) continue;

          const { data: urlData } = supabase.storage
            .from('product-screenshots')
            .getPublicUrl(`screenshots/${file.name}`);
          
          // Extract screen ID: "sprint-tracker-po-mission-control.png" → "po-mission-control"
          const screenId = file.name
            .replace(/^sprint-tracker-/, '')
            .replace(/\.(png|jpg|jpeg|webp)$/i, '');
          
          if (urlData?.publicUrl) {
            urls[screenId] = urlData.publicUrl;
          }
        }
        setScreenshotUrls(urls);
        console.log(`📸 [EP04] Loaded ${Object.keys(urls).length} sprint-tracker screenshots`);
      } catch (err) {
        console.error('[EP04] Failed to load screenshots:', err);
      } finally {
        setScreenshotsLoading(false);
      }
    }
    loadScreenshots();
  }, []);

  // ─── Generate TTS for a single line ──────────────────────────────────────

  const generateLine = useCallback(async (key: string): Promise<boolean> => {
    try {
      const line = scriptContentForUI[key];
      if (!line) {
        toast.error(`TTS: Line "${key}" not found in script config`);
        console.error(`[EP04 TTS] Key not in scriptContentForUI: "${key}". Available keys sample:`, Object.keys(scriptContentForUI).slice(0, 5));
        return false;
      }

      // Skip TTS for visual-only lines (empty text = cinematic staging/beats)
      if (!line.text || line.text.trim().length === 0) {
        console.log(`[EP04 TTS] Skipping "${key}" — visual-only line (no dialogue)`);
        setStatusMap(prev => ({ ...prev, [key]: 'done' }));
        setAudioMap(prev => ({ ...prev, [key]: { audioUrl: '', provider: 'none', voice: 'visual-only' } }));
        return true;
      }

      console.log(`[EP04 TTS] Generating: "${key}" voice=${line.voice} scene=${line.scene} text=${line.text.slice(0, 40)}...`);
      setStatusMap(prev => ({ ...prev, [key]: 'generating' }));

      const voiceConfig = getVoiceConfig(line.voice);
      if (!voiceConfig?.voiceId) {
        toast.error(`TTS: No voice config for "${line.voice}" (line: ${key})`);
        setStatusMap(prev => ({ ...prev, [key]: 'error' }));
        return false;
      }

      // Track generation job for per-step cost breakdown
      let jobId: string | null = null;
      if (projectId) {
        const estimatedTokens = Math.ceil(line.text.length / 4);
        jobId = await trackGenerationJob({
          projectId,
          jobType: 'tts',
          sceneKey: line.scene,
          lineKey: key,
          provider: voiceConfig.provider,
          estimatedTokens,
        });
      }

      const { data, error } = await supabase.functions.invoke('multi-provider-tts', {
        body: {
          text: line.text,
          languageCode: 'en-US',
          provider: voiceConfig.provider,
          voice: voiceConfig.voiceId,
          tier: 'premium',
          voiceStyle: {
            stability: voiceConfig.stability,
            similarity_boost: voiceConfig.similarityBoost,
            ...(voiceConfig.rate || voiceConfig.pitch ? {
              azureProsody: { rate: voiceConfig.rate, pitch: voiceConfig.pitch }
            } : {}),
          },
        },
      });

      if (error) {
        toast.error(`TTS edge function error for "${key}": ${error.message || JSON.stringify(error)}`);
        console.error(`[EP04 TTS] Edge function error:`, error);
        setStatusMap(prev => ({ ...prev, [key]: 'error' }));
        return false;
      }

      if (!data?.audioContent && !data?.audioUrl) {
        toast.error(`TTS: No audio returned for "${key}" — provider: ${voiceConfig.provider}, voice: ${voiceConfig.voiceId}`);
        console.error(`[EP04 TTS] No audio in response:`, data);
        setStatusMap(prev => ({ ...prev, [key]: 'error' }));
        return false;
      }

      // Upload base64 audio to Supabase Storage instead of storing as data URI
      let audioUrl = data.audioUrl; // Use URL if provider already returns one
      if (!audioUrl && data.audioContent) {
        if (projectId) {
          try {
            audioUrl = await uploadTtsToStorage(projectId, key, data.audioContent);
          } catch (uploadErr) {
            console.warn(`[EP04 TTS] Storage upload failed for "${key}", falling back to data URI:`, uploadErr);
            audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
          }
        } else {
          // No projectId — can't build a storage path, use data URI as fallback
          audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        }
      }

      const resolvedProvider = data.provider || voiceConfig.provider;
      const resolvedVoice = data.voice || voiceConfig.voiceId;
      const actualTokens = data.tokensUsed || Math.ceil(line.text.length / 4);

      // Measure actual audio duration for precise lipsync/assembly timing
      let audioDuration: number | undefined;
      if (audioUrl && audioUrl.startsWith('http')) {
        try {
          audioDuration = await new Promise<number>((resolve, reject) => {
            const el = new Audio(audioUrl!);
            el.addEventListener('loadedmetadata', () => resolve(el.duration));
            el.addEventListener('error', () => reject(new Error('Audio metadata load failed')));
            setTimeout(() => reject(new Error('Audio metadata timeout')), 5000);
          });
          console.log(`[EP04 TTS] "${key}" actual duration: ${audioDuration.toFixed(1)}s (est: ${line.duration_est}s)`);
        } catch {
          // Non-critical — assembly will fall back to duration_est
        }
      }

      setAudioMap(prev => ({
        ...prev,
        [key]: { audioUrl: audioUrl!, provider: resolvedProvider, voice: resolvedVoice, audioDuration },
      }));
      setStatusMap(prev => ({ ...prev, [key]: 'done' }));

      // Auto-persist TTS result + complete job tracking
      if (projectId) {
        updateLineTTS(projectId, key, {
          tts_audio_url: audioUrl!,
          tts_provider: resolvedProvider,
          tts_voice_id: resolvedVoice,
          tts_status: 'generated',
        });
        if (jobId) {
          completeGenerationJob(jobId, actualTokens, audioUrl);
        }
      }
      return true;
    } catch (err: any) {
      const errMsg = err?.message || err?.toString() || 'Unknown error';
      console.error(`[EP04 TTS] Uncaught error for "${key}":`, err);
      toast.error(`TTS failed for "${key}": ${errMsg}`);
      setStatusMap(prev => ({ ...prev, [key]: 'error' }));
      return false;
    }
  }, [projectId, scriptContentForUI, getVoiceConfig, trackGenerationJob, completeGenerationJob, updateLineTTS]);

  // ─── Batch generate all ──────────────────────────────────────────────────

  const generateAll = useCallback(async () => {
    abortRef.current = false;
    const keys = scriptKeys.filter(k => statusMap[k] !== 'done');
    setBatchProgress({ current: 0, total: keys.length });

    let success = 0;
    for (let i = 0; i < keys.length; i++) {
      if (abortRef.current) break;
      setBatchProgress({ current: i + 1, total: keys.length });
      const ok = await generateLine(keys[i]);
      if (ok) success++;
      // Rate limit delay
      if (i < keys.length - 1) await new Promise(r => setTimeout(r, 500));
    }

    setBatchProgress(null);
    invalidateTtsCache(); // Refresh React Query TTS cache after batch
    if (success === keys.length) {
      toast.success(`Generated all ${success} voiceovers`);
    } else if (success > 0) {
      toast.warning(`Generated ${success}/${keys.length} — ${keys.length - success} failed (check console for details)`);
    } else {
      toast.error(`All ${keys.length} TTS generations failed — check browser console for error details`);
    }
  }, [scriptKeys, statusMap, generateLine, invalidateTtsCache]);

  // Generate ONLY missing TTS lines for a specific scene (or bridge keys)
  const generateMissingForKeys = useCallback(async (keys: string[]) => {
    const missing = keys.filter(k => {
      if (audioMap[k]?.audioUrl) return false; // already has audio
      // Skip visual-only lines (no dialogue text) — they don't need TTS
      const line = scriptContentForUI[k];
      if (!line?.text || line.text.trim().length === 0) return false;
      return true;
    });
    if (missing.length === 0) {
      toast.info('All TTS lines already generated for this selection');
      return;
    }
    abortRef.current = false;
    setBatchProgress({ current: 0, total: missing.length });
    let success = 0;
    for (let i = 0; i < missing.length; i++) {
      if (abortRef.current) break;
      setBatchProgress({ current: i + 1, total: missing.length });
      const ok = await generateLine(missing[i]);
      if (ok) success++;
      if (i < missing.length - 1) await new Promise(r => setTimeout(r, 500));
    }
    setBatchProgress(null);
    if (success === missing.length) {
      toast.success(`Generated ${success} missing TTS lines`);
    } else {
      toast.warning(`Generated ${success}/${missing.length} — ${missing.length - success} failed`);
    }
  }, [audioMap, scriptContentForUI, generateLine]);

  // Convenience: regen missing TTS for a specific scene
  const generateMissingTtsForScene = useCallback((sceneKey: string) => {
    const sceneLines = scriptKeys.filter(k => scriptContentForUI[k]?.scene === sceneKey);
    generateMissingForKeys(sceneLines);
  }, [scriptKeys, scriptContentForUI, generateMissingForKeys]);

  // Convenience: regen missing bridge narrator TTS
  const generateMissingBridgeTts = useCallback(() => {
    const bridgeKeys = EP04_STORYBOOK_TRANSITIONS.map(t =>
      `bridge-${t.from.replace('scene-', '').split('-')[0]}-to-${t.to.replace('scene-', '').split('-')[0]}`
    );
    generateMissingForKeys(bridgeKeys);
  }, [generateMissingForKeys]);

  const cancelBatch = useCallback(() => {
    abortRef.current = true;
    setBatchProgress(null);
  }, []);

  // ─── Playback ────────────────────────────────────────────────────────────

  const playLine = useCallback((key: string) => {
    const audio = audioMap[key];
    if (!audio) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const el = new Audio(audio.audioUrl);
    el.onended = () => setPlayingKey(null);
    el.onerror = () => setPlayingKey(null);
    audioRef.current = el;
    setPlayingKey(key);
    el.play().catch(() => setPlayingKey(null));
  }, [audioMap]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingKey(null);
  }, []);

  // ─── Play all sequentially ───────────────────────────────────────────────

  const playAll = useCallback(async () => {
    const playable = scriptKeys.filter(k => audioMap[k]);
    for (const key of playable) {
      if (abortRef.current) break;
      await new Promise<void>(resolve => {
        const el = new Audio(audioMap[key].audioUrl);
        audioRef.current = el;
        setPlayingKey(key);
        el.onended = () => resolve();
        el.onerror = () => resolve();
        el.play().catch(() => resolve());
      });
    }
    setPlayingKey(null);
  }, [scriptKeys, audioMap]);

  // ─── Save full project to DB ──────────────────────────────────────────────

  const saveFullProject = useCallback(async () => {
    if (!projectId) {
      toast.error('No project linked — open from Genie Cast to save');
      return;
    }

    // Read existing scene_configs from DB FIRST so we don't wipe artifacts
    let existingConfigs: Record<string, Record<string, unknown>> = {};
    try {
      const { data: dbScenes } = await supabase
        .from('cast_project_scenes')
        .select('scene_key, scene_config')
        .eq('project_id', projectId);
      if (dbScenes) {
        for (const row of dbScenes) {
          existingConfigs[row.scene_key] = (row.scene_config || {}) as Record<string, unknown>;
        }
      }
    } catch (e) {
      console.warn('[EP04] Could not read existing scene_configs before save:', e);
    }

    // Build scenes — PRESERVE existing scene_config (especially artifacts)
    const sceneEntries = Array.from(new Set(scriptKeys.map(k => scriptContentForUI[k].scene)));
    const scenesPayload = sceneEntries.map((sceneKey, idx) => ({
      project_id: projectId,
      scene_key: sceneKey,
      title: SCENE_TITLES[sceneKey] || sceneKey,
      scene_index: idx,
      art_style: SCENE_STYLES[sceneKey] || null,
      visual_style: SCENE_STYLES[sceneKey] || null,
      background_url: null, // Asset imports can't be persisted as URLs
      scene_config: existingConfigs[sceneKey] || {} as Record<string, unknown>,
    }));

    // Build characters
    const charKeys = new Set(scriptKeys.map(k => scriptContentForUI[k].voice));
    const charsPayload = Array.from(charKeys).map(ck => ({
      project_id: projectId,
      character_key: ck,
      display_name: VOICE_LABELS[ck] || ck,
      color_class: VOICE_COLORS[ck] || null,
      voice_provider: getVoiceConfig(ck as any).provider,
      voice_id: getVoiceConfig(ck as any).voiceId,
      voice_config: {} as Record<string, unknown>,
    }));

    // Build script lines (scene_id will be resolved by the hook using scene_key)
    const linesPayload = scriptKeys.map((key, idx) => {
      const line = scriptContentForUI[key];
      const audio = audioMap[key];
      return {
        project_id: projectId,
        scene_id: line.scene, // scene_key — hook resolves to UUID
        line_key: key,
        line_index: idx,
        character_id: line.voice,
        dialogue: line.text,
        direction: line.direction || null,
        motion: line.motion || null,
        duration_hint: `${line.duration_est}s`,
        sfx_tags: line.sfx || null,
        visual_tags: line.visual_ref ? [line.visual_ref] : null,
        tts_audio_url: audio?.audioUrl || null,
        tts_status: audio ? 'generated' : null,
        tts_provider: audio?.provider || null,
        tts_voice_id: audio?.voice || null,
        line_config: {
          lipsync: line.lipsync,
          isInterruption: line.isInterruption,
          links: line.links,
        } as Record<string, unknown>,
      };
    });

    await saveProjectContent(projectId, {
      scenes: scenesPayload,
      scriptLines: linesPayload,
      characters: charsPayload,
    });
  }, [projectId, scriptKeys, audioMap, saveProjectContent]);

  // ─── Stats (computed, used by phases + render) ─────────────────────────

  const doneCount = scriptKeys.filter(k => statusMap[k] === 'done').length;
  const totalDuration = scriptKeys.reduce((sum, k) => sum + scriptContentForUI[k].duration_est, 0);

  // ─── Phase 2: Approve All TTS ───────────────────────────────────────────
  // Allow approval when >= 90% lines have audio (some narrator bridges are optional)

  const ttsApprovalThreshold = Math.floor(scriptKeys.length * 0.9);

  const approveTTS = useCallback(async () => {
    const missingAudio = scriptKeys.filter(k => !audioMap[k]);
    if (missingAudio.length > scriptKeys.length * 0.1) {
      toast.error(`${missingAudio.length} lines still missing — need at least ${ttsApprovalThreshold} of ${scriptKeys.length}`);
      return;
    }

    if (missingAudio.length > 0) {
      toast.info(`Proceeding with ${doneCount}/${scriptKeys.length} lines (${missingAudio.length} optional lines skipped)`);
    }

    // Advance phase FIRST (don't let DB failure block the UI)
    setProductionPhase('tts_approved');
    toast.success('TTS approved — ready for visual production');

    // Update project status in DB (fire-and-forget — non-blocking)
    if (projectId) {
      try {
        const db = supabase as any;
        await db.from('cast_projects').update({
          status: 'visual_production',
          updated_at: new Date().toISOString(),
        }).eq('id', projectId);
      } catch (err) {
        console.warn('[EP04] DB status update failed (non-critical):', err);
      }
    }
  }, [scriptKeys, audioMap, projectId, doneCount, ttsApprovalThreshold]);

  // ─── Phase 3: Visual Production (per scene) ───────────────────────────

  // ─── Step types to skip in visual production (already done in Phase 2 / Phase 4) ──
  // scene-transition and storybook-frame are visual assets (videos/images) — do NOT skip them
  const SKIP_IN_VISUAL = new Set(['tts', 'music', 'sfx']);

  // ─── Client-side polling for async WAN video tasks ───────────────────────
  const pollVideoTaskResult = useCallback(async (taskId: string, provider?: string): Promise<string | null> => {
    // Poll video task status via the edge function
    // Routes to correct poll endpoint based on provider:
    //   - 'sora2api' → poll_sora2api (Sora2API status check)
    //   - 'gemini' → poll_gemini (Gemini Veo operation polling)
    //   - default → poll_task (Alibaba DashScope)
    const pollAction = provider === 'sora2api' ? 'poll_sora2api' : provider === 'gemini' ? 'poll_gemini' : 'poll_task';
    const maxPolls = provider === 'sora2api' ? 60 : provider === 'gemini' ? 60 : 36; // Sora2API/Gemini: 60 × 10s = 10 min; DashScope: 36 × 10s = 6 min
    console.log(`[EP04] Starting ${pollAction} for taskId=${taskId}, provider=${provider || 'alibaba'}, maxPolls=${maxPolls}`);
    for (let i = 0; i < maxPolls; i++) {
      await new Promise(r => setTimeout(r, 10000)); // 10s between polls
      try {
        const { data } = await supabase.functions.invoke('ai-video-generator', {
          body: { action: pollAction, taskId },
        });
        if (data?.videoUrl && !data.videoUrl.includes('placehold.co')) {
          console.log(`[EP04] Video task ${taskId} completed: ${data.videoUrl.substring(0, 80)}`);
          return data.videoUrl;
        }
        if (data?.status === 'FAILED') {
          console.warn(`[EP04] Video task ${taskId} failed:`, data?.message);
          return null;
        }
        const progress = data?.progress ? ` (${data.progress}%)` : '';
        console.log(`[EP04] Video task ${taskId} poll ${i + 1}/${maxPolls}: ${data?.status || 'pending'}${progress}`);
      } catch (e) {
        console.warn(`[EP04] Poll error for task ${taskId}:`, e);
      }
    }
    console.warn(`[EP04] Video task ${taskId} timed out after ${maxPolls} polls`);
    return null;
  }, []);

  // ── Regenerate scene video with a different provider ──
  // Only regenerates the establishing shot video, not TTS or images.
  const regenerateSceneVideo = useCallback(async (sceneKey: string) => {
    const provider = sceneProviders[sceneKey] || 'alibaba';
    const pipelineSceneKey = SCRIPT_TO_PIPELINE_MAP[sceneKey] || sceneKey;
    const pipeline = EP04_SCENE_PIPELINES[pipelineSceneKey as keyof typeof EP04_SCENE_PIPELINES];
    const videoStep = (Array.isArray(pipeline) ? pipeline : []).find(s => s.type === 'alibaba-video') as
      { type: 'alibaba-video'; model: string; prompt: string } | undefined;

    if (!videoStep) {
      toast.error(`No video step found for ${sceneKey}`);
      return;
    }

    setRegenProgress(prev => ({ ...prev, [sceneKey]: 'generating' }));
    toast.info(`Regenerating ${sceneKey} with ${provider}...`);

    try {
      // Map provider to edge function parameters
      const providerModel: Record<string, string> = {
        alibaba: 'wan2.6-t2v',
        sora2api: 'sora-2',
        gemini: 'veo-002',
      };

      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: {
          type: 'video',
          action: 'generate_video',
          prompt: videoStep.prompt,
          model: providerModel[provider] || 'wan2.6-t2v',
          duration: provider === 'sora2api' ? 10 : provider === 'gemini' ? 8 : 5, // Sora2API: 10s = 20 credits (vs 15s = 25 credits); establishing shots play for 8s
          provider,
          aspectRatio: '16:9',
        },
      });

      if (error) throw new Error(error.message);

      let videoUrl = data?.url || data?.videoUrl;

      // Poll for async result if needed (DashScope, Sora2API, Gemini all can be async)
      const pollId = data?.alibabaTaskId || data?.taskId;
      if (!videoUrl && pollId) {
        toast.info(`${sceneKey}: video rendering on ${provider} — polling (taskId: ${String(pollId).substring(0, 20)})...`);
        videoUrl = await pollVideoTaskResult(pollId, provider);
      } else if (!videoUrl && !pollId) {
        // No video URL AND no taskId — the provider call itself failed
        console.error(`[EP04] Regen ${sceneKey}: no videoUrl AND no taskId — ${provider} failed`, data);
        throw new Error(data?.error || data?.message || `${provider} returned no video and no taskId — check edge function logs`);
      }

      if (videoUrl) {
        // Re-upload to Supabase Storage to avoid CDN expiry
        if (projectId && !videoUrl.includes('supabase.co/storage')) {
          try {
            const resp = await fetch(videoUrl);
            const blob = await resp.blob();
            const path = `${projectId}/videos/${sceneKey}-${provider}-${Date.now()}.mp4`;
            await supabase.storage.from('cast-assets').upload(path, blob, { contentType: 'video/mp4', upsert: true });
            const { data: { publicUrl } } = supabase.storage.from('cast-assets').getPublicUrl(path);
            videoUrl = publicUrl;
          } catch (uploadErr) {
            console.warn(`[EP04] Re-upload failed for ${sceneKey}, using original URL:`, uploadErr);
          }
        }

        // Update scene production state with new video URL
        setSceneProduction(prev => {
          const current = prev[sceneKey] || defaultSceneStatus();
          return {
            ...prev,
            [sceneKey]: {
              ...current,
              videoUrls: { ...current.videoUrls, [`${provider}-establishing`]: videoUrl! },
              visual: 'done',
            },
          };
        });

        // Persist to DB
        if (projectId) {
          const status = sceneProduction[sceneKey] || defaultSceneStatus();
          await updateSceneArtifacts(projectId, sceneKey, {
            videoUrls: { ...status.videoUrls, [`${provider}-establishing`]: videoUrl },
          });
        }

        setRegenProgress(prev => ({ ...prev, [sceneKey]: 'done' }));
        invalidateSceneCache(); // Refresh React Query cache
        toast.success(`${sceneKey} regenerated with ${provider}!`);
      } else {
        throw new Error('No video URL returned');
      }
    } catch (err: any) {
      console.error(`[EP04] Regen ${sceneKey} with ${provider} failed:`, err);
      setRegenProgress(prev => ({ ...prev, [sceneKey]: 'error' }));
      toast.error(`Regen ${sceneKey} failed: ${err.message}`);
    }
  }, [sceneProviders, projectId, pollVideoTaskResult, sceneProduction, updateSceneArtifacts, invalidateSceneCache]);

  // Helper: process a single visual step and return the result URL (or null)
  const processVisualStep = useCallback(async (
    step: Record<string, unknown>,
    sceneKey: string,
    results: Record<string, string>,
    lastTTSByCharacter: Record<string, string>,
    stepLabel: string,
  ): Promise<void> => {
    const stepType = (step.type as string) || 'image';
    const prompt = (step.prompt as string) || `Generate ${stepType} for ${sceneKey}`;

    // ── screen-capture: use pre-loaded screenshot URLs (no edge call) ──
    if (stepType === 'screen-capture') {
      const screenIds = (step.screenIds as string[]) || [];
      for (const sid of screenIds) {
        if (screenshotUrls[sid]) {
          let scUrl = screenshotUrls[sid];
          // Mirror local screenshots to Supabase Storage so assembly can access them
          if (projectId && !isSupabaseStorageUrl(scUrl)) {
            try { scUrl = await ensureStorageUrl(projectId, `screen-capture-${sid}`, scUrl); } catch { /* keep original */ }
          }
          results[`screen-capture-${sid}`] = scUrl;
        } else {
          toast.warning(`Screenshot "${sid}" not captured yet — skipping`);
        }
      }
      return;
    }

    // ── ai-screen-enhance: route through ai-video-generator with referenceImage ──
    // ai-universal-processor has no image-to-image support; ai-video-generator
    // accepts referenceImage and passes it to Alibaba WAN i2v for enhancement.
    if (stepType === 'ai-screen-enhance') {
      const screenIds = (step.screenIds as string[]) || [];
      const enhanceMode = (step.enhanceMode as string) || 'highlight';
      const scriptContext = (step.scriptContext as string) || '';
      const focusAreas = (step.focusAreas as string[]) || [];

      for (const sid of screenIds) {
        let sourceUrl = screenshotUrls[sid];
        if (!sourceUrl) { toast.warning(`Screenshot "${sid}" not captured — skipping enhance`); continue; }
        // Convert local Vite asset paths to full URLs for edge function access
        if (sourceUrl.startsWith('/') && !sourceUrl.startsWith('//')) {
          sourceUrl = `${window.location.origin}${sourceUrl}`;
        }

        let jobId: string | null = null;
        if (projectId) {
          jobId = await trackGenerationJob({
            projectId, jobType: 'video', sceneKey, provider: 'alibaba', estimatedTokens: 500,
          });
        }

        const { data, error } = await supabase.functions.invoke('ai-video-generator', {
          body: {
            type: 'video',
            prompt: `${enhanceMode} mode: ${scriptContext}. Focus: ${focusAreas.join(', ') || 'auto'}`,
            referenceImage: sourceUrl,
            model: 'wan2.6-i2v',
            duration: 3,
          },
        });
        if (error) { toast.error(`${stepLabel} enhance "${sid}" failed: ${error.message}`); continue; }
        let url = data?.url || data?.videoUrl || data?.imageUrl;
        // WAN i2v is always async — poll for result
        if (!url && data?.asyncGeneration && data?.taskId) {
          toast.info(`${stepLabel}: enhancing "${sid}"... polling for result`);
          url = await pollVideoTaskResult(data.taskId);
        }
        if (url && projectId && !isSupabaseStorageUrl(url)) {
          try { url = await ensureStorageUrl(projectId, `ai-screen-enhance-${sid}`, url, 'video'); } catch { /* keep original */ }
        }
        if (url) results[`ai-screen-enhance-${sid}`] = url;
        if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url);
      }
      return;
    }

    // ── avatar-lipsync: CRITICAL — pass TTS audioUrl + avatar sourceImage for lip sync ──
    if (stepType === 'avatar-lipsync') {
      const character = (step.character as string) || 'host';
      const lipsyncScriptKey = step.scriptKey as string | undefined;
      // Per-segment: if scriptKey is specified, use that specific TTS audio (not first-wins)
      const ttsAudioUrl = lipsyncScriptKey && audioMap[lipsyncScriptKey]?.audioUrl
        ? audioMap[lipsyncScriptKey].audioUrl
        : lastTTSByCharacter[character] || null;

      if (!ttsAudioUrl) {
        toast.warning(`No TTS audio for "${character}"${lipsyncScriptKey ? ` (${lipsyncScriptKey})` : ''} lipsync — skipping`);
        return;
      }

      // Find the avatar source image for lipsync
      // Priority depends on whether character uses a real photo (pre-made) or AI-generated avatar:
      // - Real photo characters (NOT in REGENERATE_AVATAR_VIA_AI): pre-made photo FIRST
      //   This ensures the real person's face is always used for lipsync, even if old
      //   AI-generated Pixar avatars exist in saved state from previous runs.
      // - AI characters (in REGENERATE_AVATAR_VIA_AI): current-run > saved > cross-scene > pre-made
      const avatarFromResults = Object.entries(results).find(([k]) => k.includes('avatar-3d') && k.includes(character))?.[1];
      const savedAvatarUrls = sceneProduction[sceneKey]?.avatarUrls || {};
      const avatarFromSaved = Object.entries(savedAvatarUrls).find(([k]) => k.includes(character))?.[1];
      // Cross-scene: check OTHER scenes for this character's avatar
      let avatarFromOtherScene: string | null = null;
      for (const [sk, sp] of Object.entries(sceneProduction)) {
        if (sk === sceneKey) continue;
        const match = Object.entries(sp.avatarUrls || {}).find(([k]) => k.includes(character))?.[1];
        if (match && match.startsWith('http') && match.includes('supabase.co')) {
          avatarFromOtherScene = match;
          break;
        }
      }
      const avatarPreMade = CHARACTER_AVATARS[character];
      const usesRealPhoto = !REGENERATE_AVATAR_VIA_AI.has(character);

      let sourceImage: string | null = null;
      if (usesRealPhoto && avatarPreMade) {
        // Real photo character (e.g., host) — ALWAYS use the pre-made photo for lipsync
        // This ensures the real person's face drives the lipsync, not an old Pixar avatar
        sourceImage = avatarPreMade.startsWith('http') ? avatarPreMade : `${window.location.origin}${avatarPreMade}`;
        console.log(`[EP04 Visual] ${stepLabel}: using real photo for "${character}" lipsync`);
      } else if (avatarFromResults && avatarFromResults.startsWith('http') && avatarFromResults.includes('supabase.co')) {
        sourceImage = avatarFromResults; // Current-run avatar on Supabase — best
      } else if (avatarFromSaved && avatarFromSaved.startsWith('http') && avatarFromSaved.includes('supabase.co')) {
        sourceImage = avatarFromSaved; // Previously saved avatar on Supabase — great for lipsync-only regen
      } else if (avatarFromOtherScene) {
        sourceImage = avatarFromOtherScene; // Cross-scene Supabase avatar
        console.log(`[EP04 Visual] ${stepLabel}: using cross-scene avatar for "${character}" lipsync`);
      } else if (avatarFromResults && avatarFromResults.startsWith('http')) {
        sourceImage = avatarFromResults; // Current-run DashScope CDN
      } else if (avatarFromSaved && avatarFromSaved.startsWith('http')) {
        sourceImage = avatarFromSaved; // Previously saved CDN
      } else if (avatarPreMade) {
        sourceImage = avatarPreMade.startsWith('http') ? avatarPreMade : `${window.location.origin}${avatarPreMade}`;
      }
      if (!sourceImage) {
        toast.warning(`No avatar image for "${character}" lipsync — skipping`);
        return;
      }

      // Ensure sourceImage is on Supabase Storage — edge function can't reach localhost or Vercel static paths
      if (projectId && !isSupabaseStorageUrl(sourceImage)) {
        try {
          sourceImage = await ensureStorageUrl(projectId, `lipsync-source-${character}`, sourceImage);
          console.log(`[EP04 Visual] ${stepLabel}: uploaded lipsync source to Supabase: ${sourceImage.substring(0, 60)}...`);
        } catch (uploadErr) {
          console.warn(`[EP04 Visual] ${stepLabel}: ensureStorageUrl failed for lipsync source — sending original URL`, uploadErr);
          // Fall through — edge function has its own re-upload logic as backup
        }
      }

      console.log(`[EP04 Visual] ${stepLabel}: lipsync "${character}" — audio: ${ttsAudioUrl.substring(0, 50)}..., avatar: ${sourceImage.substring(0, 50)}...`);

      let jobId: string | null = null;
      if (projectId) {
        jobId = await trackGenerationJob({
          projectId, jobType: 'avatar', sceneKey, provider: (step.provider as string) || 'alibaba-wan2.2', estimatedTokens: 500,
        });
      }

      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: {
          type: 'avatar',
          character,
          provider: step.provider || 'alibaba-wan2.2',
          lipsync: true,
          audioUrl: ttsAudioUrl,
          sourceImage,
        },
      });
      if (error) {
        console.error(`[EP04 Visual] ${stepLabel}: lipsync "${character}" failed:`, error.message);
        toast.error(`${stepLabel} lipsync "${character}" failed: ${error.message}`);
        return;
      }

      let url = data?.url || data?.videoUrl;

      // If edge function returned an Alibaba task ID (async lipsync on DashScope),
      // poll from client side until the lipsync video is ready (up to 5 min)
      if (!url && data?.alibabaTaskId) {
        console.log(`[EP04 Visual] ${stepLabel}: lipsync "${character}" processing on Alibaba (${data.model}) — polling...`);
        toast.info(`${stepLabel}: lipsync rendering on Alibaba — polling (free, no cost)...`);
        const taskId = data.alibabaTaskId;
        const maxPolls = 60; // 60 × 10s = 600s (10 min) max — WAN lipsync can take 5-8 min
        for (let p = 0; p < maxPolls; p++) {
          await new Promise(r => setTimeout(r, 10000));
          const { data: pollData } = await supabase.functions.invoke('ai-video-generator', {
            body: { action: 'poll_task', taskId, isLipsync: true },
          });
          console.log(`[EP04 Visual] ${stepLabel}: alibaba lipsync poll ${p + 1}/${maxPolls} — ${pollData?.status} videoUrl=${pollData?.videoUrl ? 'YES' : 'none'}`);
          if (pollData?.status === 'SUCCEEDED') {
            if (pollData?.videoUrl) {
              url = pollData.videoUrl;
              console.log(`[EP04 Visual] ${stepLabel}: lipsync "${character}" done via Alibaba: ${url.substring(0, 60)}...`);
            } else {
              console.warn(`[EP04 Visual] ${stepLabel}: lipsync "${character}" SUCCEEDED but no videoUrl in response:`, JSON.stringify(pollData));
              toast.error(`Lipsync "${character}" succeeded but video URL extraction failed — check edge function logs`);
            }
            break; // Always break on SUCCEEDED — don't keep polling
          }
          if (pollData?.status === 'FAILED') {
            console.warn(`[EP04 Visual] ${stepLabel}: lipsync "${character}" failed on Alibaba:`, pollData?.message);
            toast.error(`Lipsync "${character}" failed on Alibaba: ${pollData?.message}`);
            break;
          }
        }
      }

      // If edge function returned a Replicate prediction ID (Alibaba fallback),
      // poll from client side until the lipsync video is ready (up to 10 min)
      if (!url && data?.replicatePredictionId) {
        console.log(`[EP04 Visual] ${stepLabel}: lipsync "${character}" processing on Replicate (${data.model}) — polling...`);
        toast.info(`${stepLabel}: lipsync rendering on Replicate — this may take 2-10 min...`);
        const predId = data.replicatePredictionId;
        const maxPolls = 60; // 60 × 10s = 600s (10 min) max
        for (let p = 0; p < maxPolls; p++) {
          await new Promise(r => setTimeout(r, 10000));
          const { data: pollData } = await supabase.functions.invoke('ai-video-generator', {
            body: { action: 'poll_replicate', predictionId: predId },
          });
          console.log(`[EP04 Visual] ${stepLabel}: lipsync poll ${p + 1}/${maxPolls} — ${pollData?.status}`);
          if (pollData?.status === 'succeeded' && pollData?.videoUrl) {
            url = pollData.videoUrl;
            console.log(`[EP04 Visual] ${stepLabel}: lipsync "${character}" done via polling: ${url.substring(0, 60)}...`);
            break;
          }
          if (pollData?.status === 'failed') {
            console.warn(`[EP04 Visual] ${stepLabel}: lipsync "${character}" failed on Replicate:`, pollData?.error);
            toast.error(`Lipsync "${character}" failed: ${pollData?.error}`);
            break;
          }
        }
      }

      if (url) {
        // Per-segment key: avatar-lipsync-allaudin-bridge-0-to-1 vs avatar-lipsync-allaudin-allaudin-emerge
        const resultKey = lipsyncScriptKey ? `avatar-lipsync-${character}-${lipsyncScriptKey}` : `avatar-lipsync-${character}`;
        // Mirror lipsync video to Supabase Storage (CDN URLs expire)
        if (projectId && !isSupabaseStorageUrl(url)) {
          try { url = await ensureStorageUrl(projectId, resultKey, url, 'video'); } catch { /* keep original */ }
        }
        results[resultKey] = url;
        console.log(`[EP04 Visual] ${stepLabel}: lipsync "${character}" [${resultKey}] saved: ${url.substring(0, 60)}...`);
      } else {
        console.warn(`[EP04 Visual] ${stepLabel}: lipsync "${character}" returned no URL`, data);
      }
      // Pass actual provider for accurate cost calc (alibaba=free vs replicate=$4/run)
      const actualProvider = data?.provider || (data?.replicatePredictionId ? 'replicate' : 'alibaba');
      if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url, actualProvider);
      return;
    }

    // ── character-interaction: group shot / duo argument / standup ──
    if (stepType === 'character-interaction') {
      let jobId: string | null = null;
      if (projectId) {
        jobId = await trackGenerationJob({
          projectId, jobType: 'video', sceneKey, provider: 'alibaba', estimatedTokens: 500,
        });
      }

      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: {
          type: 'scene',
          action: 'generate_video',
          prompt,
          style: step.style || 'group-shot',
          characters: step.characters || [],
        },
      });
      if (error) { toast.error(`${stepLabel} character-interaction failed: ${error.message}`); return; }
      let url = data?.url || data?.videoUrl;
      if (url && projectId && !isSupabaseStorageUrl(url)) {
        try { url = await ensureStorageUrl(projectId, `character-interaction-${sceneKey}`, url, 'video'); } catch { /* keep original */ }
      }
      if (url) results[`character-interaction-${sceneKey}-${Date.now()}`] = url;
      if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url);
      return;
    }

    // ── narrator-scroll: parchment data reveal animation ──
    if (stepType === 'narrator-scroll') {
      let jobId: string | null = null;
      if (projectId) {
        jobId = await trackGenerationJob({
          projectId, jobType: 'video', sceneKey, provider: 'alibaba', estimatedTokens: 500,
        });
      }

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'generate_video',
          prompt,
          duration: step.duration || 4,
        },
      });
      if (error) { toast.error(`${stepLabel} narrator-scroll failed: ${error.message}`); return; }
      let url = data?.url || data?.videoUrl;
      if (url && projectId && !isSupabaseStorageUrl(url)) {
        try { url = await ensureStorageUrl(projectId, `narrator-scroll-${sceneKey}`, url, 'video'); } catch { /* keep original */ }
      }
      if (url) results[`narrator-scroll-${sceneKey}-${Date.now()}`] = url;
      if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url);
      return;
    }

    // ── scene-transition: short animated clip via Wan2.6 t2v (iris-wipe, scroll-unroll, page-turn) ──
    if (stepType === 'scene-transition') {
      let jobId: string | null = null;
      if (projectId) {
        jobId = await trackGenerationJob({
          projectId, jobType: 'video', sceneKey, provider: 'alibaba', estimatedTokens: 500,
        });
      }

      const { data, error } = await supabase.functions.invoke('ai-video-generator', {
        body: {
          type: 'video',
          prompt,
          model: 'wan2.6-t2v',
          duration: step.duration || 3,
          provider: 'alibaba',
        },
      });
      if (error) { toast.error(`${stepLabel} scene-transition failed: ${error.message}`); return; }
      let url = data?.url || data?.videoUrl;
      // Poll for async result if needed
      if (!url && data?.asyncGeneration && data?.taskId) {
        toast.info(`${stepLabel}: scene-transition generating... polling for result`);
        url = await pollVideoTaskResult(data.taskId);
      }
      if (url && projectId && !isSupabaseStorageUrl(url)) {
        try { url = await ensureStorageUrl(projectId, `scene-transition-${sceneKey}`, url, 'video'); } catch { /* keep original */ }
      }
      if (url) results[`scene-transition-${sceneKey}-${Date.now()}`] = url;
      if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url);
      return;
    }

    // ── static-asset: pre-existing branded image (no AI generation, just mirror to storage) ──
    if (stepType === 'static-asset') {
      const assetKey = (step as { assetKey?: string }).assetKey || '';
      const assetUrl = STATIC_ASSETS[assetKey];
      if (!assetUrl) { console.warn(`[EP04 Visual] ${stepLabel}: unknown static asset "${assetKey}"`); return; }
      let finalUrl = assetUrl;
      if (projectId && !isSupabaseStorageUrl(assetUrl)) {
        try {
          finalUrl = await ensureStorageUrl(projectId, `static-asset-${assetKey}-${sceneKey}`, assetUrl);
        } catch { console.warn(`[EP04 Visual] ${stepLabel}: static-asset mirror failed, using local path`); }
      }
      results[`static-asset-${assetKey}-${sceneKey}`] = finalUrl;
      console.log(`[EP04 Visual] ${stepLabel}: using static asset "${assetKey}" as scene image`);
      return;
    }

    // ── storybook-frame: static illustration (image generation for chapter headers, powered-by pages) ──
    if (stepType === 'storybook-frame') {
      const variant = (step.variant as string) || 'opening';
      console.log(`[EP04 Visual] ${stepLabel}: generating storybook-frame (${variant}) via ai-universal-processor...`);
      let jobId: string | null = null;
      if (projectId) {
        jobId = await trackGenerationJob({
          projectId, jobType: 'image', sceneKey, provider: 'alibaba', estimatedTokens: 500,
        });
      }

      try {
        const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            action: 'image_generation',
            prompt,
            provider: 'alibaba',
            model: 'wan2.6-t2i',
            style_intent: 'cinematic',
            size: '1280x720',
          },
        });
        if (error) {
          console.error(`[EP04 Visual] ${stepLabel}: storybook-frame edge error:`, error.message);
          toast.error(`${stepLabel} storybook-frame failed: ${error.message}`);
          if (jobId && projectId) await completeGenerationJob(jobId, 0);
          return;
        }
        let url = data?.url || data?.imageUrl;
        console.log(`[EP04 Visual] ${stepLabel}: storybook-frame response — url=${url ? 'YES' : 'NONE'}`);
        // Ensure URL is on Supabase Storage (handles base64, CDN URLs, etc.)
        if (url && projectId && !isSupabaseStorageUrl(url)) {
          try {
            url = await ensureStorageUrl(projectId, `storybook-frame-${sceneKey}`, url);
          } catch { console.warn(`[EP04 Visual] ${stepLabel}: storybook-frame mirror failed`); }
        }
        if (url) results[`storybook-frame-${sceneKey}-${Date.now()}`] = url;
        if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url);
      } catch (err: any) {
        console.error(`[EP04 Visual] ${stepLabel}: storybook-frame threw:`, err?.message || err);
        toast.error(`${stepLabel} storybook-frame error: ${err?.message || 'unknown'}`);
        if (jobId && projectId) await completeGenerationJob(jobId, 0);
      }
      return;
    }

    // ── avatar-3d: Use pre-made assets OR generate from character config prompt ──
    if (stepType === 'avatar-3d') {
      const character = (step.character as string) || 'host';
      const existingAvatar = CHARACTER_AVATARS[character];
      // Use pre-made avatar UNLESS character is flagged for AI regeneration
      if (existingAvatar && !REGENERATE_AVATAR_VIA_AI.has(character)) {
        // Mirror pre-made avatar to Supabase Storage so assembly can access it via HTTP
        let avatarUrl = existingAvatar;
        if (projectId && !isSupabaseStorageUrl(existingAvatar)) {
          try {
            avatarUrl = await ensureStorageUrl(projectId, `avatar-3d-${character}-${sceneKey}`, existingAvatar);
          } catch { console.warn(`[EP04 Visual] ${stepLabel}: pre-made avatar mirror failed, using local path`); }
        }
        results[`avatar-3d-${character}-${sceneKey}`] = avatarUrl;
        console.log(`[EP04 Visual] ${stepLabel}: using pre-made avatar for "${character}"`);
        return;
      }
      // Generate via AI using the character's pixarPrompt from config
      // Uses Alibaba wan2.6-t2i (rich cinematic quality) with error handling + pre-made fallback
      const charConfig = EP04_AVATAR_CONFIG.characters[character as keyof typeof EP04_AVATAR_CONFIG.characters];
      if (charConfig) {
        const avatarStyle = (step.style as string) || 'pixar-3d';
        const avatarPrompt = avatarStyle.includes('disney') ? charConfig.disneyPrompt : charConfig.pixarPrompt;
        console.log(`[EP04 Visual] ${stepLabel}: generating avatar for "${character}" via Alibaba wan2.6-t2i`);
        let jobId: string | null = null;
        if (projectId) {
          jobId = await trackGenerationJob({ projectId, jobType: 'avatar', sceneKey, provider: 'alibaba', estimatedTokens: 500 });
        }
        try {
          // Wait 3s to avoid DashScope rate limiting if a video request just ran
          await new Promise(r => setTimeout(r, 3000));
          const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
            body: { action: 'image_generation', prompt: avatarPrompt, provider: 'alibaba', model: 'wan2.6-t2i', aspectRatio: '1:1', style_intent: 'cinematic' },
          });
          if (error) {
            // Try to extract detailed error from response body
            const detail = data?.error || error.message || 'Unknown error';
            console.error(`[EP04 Visual] ${stepLabel}: edge function error detail:`, detail, data);
            throw new Error(detail);
          }
          // Ensure URL is on Supabase Storage (handles base64, CDN, or relative paths)
          let url = data?.url || data?.imageUrl || data?.result?.url;
          if (!url) throw new Error('No image URL in response');

          if (projectId && !isSupabaseStorageUrl(url)) {
            try {
              url = await ensureStorageUrl(projectId, `avatar-3d-${character}-${sceneKey}`, url);
            } catch (mirrorErr) {
              console.warn(`[EP04 Visual] ${stepLabel}: avatar "${character}" mirror to Storage failed:`, mirrorErr);
              // Keep original URL — it may work for display but won't survive CDN expiry
            }
          }

          results[`avatar-3d-${character}-${sceneKey}`] = url;
          console.log(`[EP04 Visual] ${stepLabel}: Alibaba avatar for "${character}": ${url.substring(0, 80)}...`);
          if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[EP04 Visual] ${stepLabel}: avatar generation failed for "${character}": ${msg}`);
          // Fallback chain: cross-scene Supabase avatar > pre-made avatar
          // Check OTHER scenes for a previously generated avatar of this character (avoids dog fallback for host)
          let crossSceneAvatar: string | null = null;
          for (const [sk, sp] of Object.entries(sceneProduction)) {
            if (sk === sceneKey) continue;
            const match = Object.entries(sp.avatarUrls || {}).find(([k]) => k.includes(character))?.[1];
            if (match && match.startsWith('http') && match.includes('supabase.co')) {
              crossSceneAvatar = match;
              break;
            }
          }
          if (crossSceneAvatar) {
            results[`avatar-3d-${character}-${sceneKey}`] = crossSceneAvatar;
            toast.info(`Avatar "${character}" AI failed — reusing avatar from another scene`);
            console.log(`[EP04 Visual] ${stepLabel}: cross-scene avatar for "${character}": ${crossSceneAvatar.substring(0, 80)}...`);
          } else if (existingAvatar) {
            results[`avatar-3d-${character}-${sceneKey}`] = existingAvatar;
            toast.warning(`Avatar "${character}" AI failed — using pre-made fallback`);
            console.log(`[EP04 Visual] ${stepLabel}: falling back to pre-made avatar for "${character}"`);
          } else {
            toast.error(`Avatar "${character}" failed: ${msg}`);
          }
        }
        return;
      }
      console.warn(`[EP04 Visual] No pre-made avatar or config for "${character}" — falling through to generic generation`);
    }

    // ── kinetic-text: USE EXISTING scene background thumbnails where available ──
    // Scene backgrounds already have cinematic title art — no need to generate poor text-to-image
    if (stepType === 'kinetic-text') {
      const sceneBg = SCENE_BACKGROUNDS[sceneKey];
      if (sceneBg) {
        // Mirror pre-made background to Supabase Storage so assembly can access it via HTTP
        let bgUrl = sceneBg;
        if (projectId && !isSupabaseStorageUrl(sceneBg)) {
          try {
            bgUrl = await ensureStorageUrl(projectId, `kinetic-text-${sceneKey}`, sceneBg);
          } catch { console.warn(`[EP04 Visual] ${stepLabel}: scene bg mirror failed, using local path`); }
        }
        const ktIdx = Object.keys(results).filter(k => k.startsWith(`kinetic-text-${sceneKey}`)).length;
        results[`kinetic-text-${sceneKey}-${ktIdx}`] = bgUrl;
        console.log(`[EP04 Visual] ${stepLabel}: using pre-made scene background as title card`);
        return;
      }
      // Fallback: generate via AI only if no scene background exists
      console.warn(`[EP04 Visual] No pre-made background for "${sceneKey}" — generating kinetic text via AI`);
    }

    // ── Standard step routing for steps that DO need AI generation ──
    let action = 'image_generation';
    let edgeFn = 'ai-universal-processor';

    // Route video types through ai-video-generator (alibaba WAN models)
    if (stepType === 'alibaba-video' || stepType === 'video') {
      edgeFn = 'ai-video-generator';
      action = 'generate_video';
    } else if (stepType === 'alibaba-image') {
      edgeFn = 'ai-universal-processor';
      action = 'image_generation';
    } else if (stepType === 'motion-graphics') {
      action = 'image_generation';
    }

    // ── Scene context enrichment: pull rich direction/sfx cues from script content ──
    // EP04_SCRIPT_CONTENT has detailed direction fields per line — these describe
    // camera angles, character staging, backgrounds, particle effects, color values, etc.
    // We aggregate them per scene for contextual prompt enrichment.
    const sceneScriptLines = scenes.get(sceneKey)?.keys || [];
    const sceneDirections: string[] = [];
    for (const lk of sceneScriptLines) {
      const lineData = scriptContentForUI[lk];
      if (lineData?.direction) sceneDirections.push(lineData.direction as string);
    }
    const sceneContext = sceneDirections.length > 0
      ? sceneDirections.slice(0, 3).join(' | ').substring(0, 400)
      : '';

    // ── Motion-graphics content tag → rich description mapping ──
    const MOTION_GRAPHICS_DESCRIPTIONS: Record<string, string> = {
      'sprint-dashboard-montage': 'Animated sprint management dashboard with Kanban boards, burndown charts, velocity metrics, task cards flying into columns, progress bars filling up, developer avatars appearing on task assignments. Shows the entire sprint lifecycle from planning to completion in a dynamic data-driven montage',
      'velocity-chart-animation': 'Animated velocity comparison chart with bars growing dynamically, sparkline trends, developer performance metrics side by side, green upward arrows and completion badges',
      'territory-map-visualization': 'Animated file ownership territory map showing two color-coded zones (blue for Atlas/Claude, green for Nova/Lovable) with clear boundary lines, task icons distributing across zones, merge conflict warnings at borders',
    };

    // Build rich prompts for steps that actually need AI generation
    // (avatar-3d and kinetic-text early-return above using pre-made assets)
    let richPrompt = prompt;
    if (stepType === 'motion-graphics' && step.content) {
      const contentTag = step.content as string;
      const enrichedContent = MOTION_GRAPHICS_DESCRIPTIONS[contentTag] || contentTag;
      richPrompt = `Cinematic motion graphics visualization: ${enrichedContent}. Scene context: ${sceneContext || 'Sprint management documentary'}. Style: professional data visualization with glowing neon elements, holographic UI overlays, dark tech background with blue/purple accent lighting, floating 3D data panels, cinematic depth of field, movie-quality VFX, 8K.`;
    } else if (stepType === 'alibaba-image') {
      // Enrich alibaba-image prompts with scene context
      richPrompt = sceneContext
        ? `${prompt}. Scene context: ${sceneContext}. Pixar-quality 3D rendering, cinematic lighting, 8K detail.`
        : `${prompt}. Pixar-quality 3D rendering, cinematic lighting, 8K detail.`;
    } else if ((stepType === 'alibaba-video' || stepType === 'video') && sceneContext) {
      // Enrich video prompts with scene narrative context
      richPrompt = `${prompt}. Narrative context: ${sceneContext.substring(0, 200)}`;
    }

    let jobId: string | null = null;
    if (projectId) {
      jobId = await trackGenerationJob({
        projectId,
        jobType: stepType.includes('video') ? 'video' : stepType.includes('avatar') ? 'avatar' : 'image',
        sceneKey,
        provider: (step.provider as string) || 'alibaba',
        estimatedTokens: 500,
      });
    }

    const body: Record<string, unknown> = {
      action,
      prompt: richPrompt,
      model: step.model || undefined,
      provider: step.provider || undefined,
      style: step.style || undefined,
    };
    // Motion-graphics: route to Alibaba wan2.6-t2i for rich cinematic visuals
    if (stepType === 'motion-graphics') {
      body.style_intent = 'cinematic';
      body.provider = 'alibaba';
      body.model = 'wan2.6-t2i';
      body.size = '1280x720';
    }
    // alibaba-image: route to Alibaba wan2.6-t2i (replaces deprecated wanx-v2.1)
    if (stepType === 'alibaba-image') {
      body.style_intent = 'cinematic';
      body.provider = 'alibaba';
      body.model = 'wan2.6-t2i';
      body.size = '1280x720';
    }
    // Pass type + model for alibaba-video through ai-video-generator
    if (stepType === 'alibaba-video' || stepType === 'video') {
      body.type = 'video';
      body.provider = step.provider || 'alibaba';
      body.model = step.model || 'wan2.6-t2v';
      body.duration = step.duration || 4;
      // ── CRITICAL: resolve referenceImage for i2v steps ──
      // Pipeline configs use tag names (e.g., 'velocity-metrics-screenshot') which
      // must be resolved from screenshotUrls. Without this, i2v gets no image.
      const refImage = step.referenceImage as string | undefined;
      if (refImage) {
        // Check if it's a URL (starts with http) or a tag to resolve from screenshots
        if (refImage.startsWith('http')) {
          body.referenceImage = refImage;
        } else {
          // Try to find a matching image: screenshots → already-generated results → scene backgrounds
          // Results may contain data: URLs (base64 from Alibaba image gen) — include those too
          const httpOrDataUrl = (u: unknown): boolean =>
            typeof u === 'string' && (u.startsWith('http') || u.startsWith('data:image'));
          const resolvedUrl = screenshotUrls[refImage]
            || Object.entries(screenshotUrls).find(([k]) => refImage.includes(k) || k.includes(refImage))?.[1]
            || Object.values(results).find(u => httpOrDataUrl(u))
            || SCENE_BACKGROUNDS[sceneKey];
          if (resolvedUrl) {
            // Convert Vite asset paths (/assets/...) to full URLs so edge functions can download them
            const finalUrl = (typeof resolvedUrl === 'string' && resolvedUrl.startsWith('/') && !resolvedUrl.startsWith('//'))
              ? `${window.location.origin}${resolvedUrl}`
              : resolvedUrl;
            body.referenceImage = finalUrl;
            console.log(`[EP04 Visual] Resolved i2v referenceImage "${refImage}" → ${String(finalUrl).substring(0, 80)}`);
          } else {
            // Fallback: no reference image available, switch to t2v instead
            console.warn(`[EP04 Visual] No screenshot for i2v ref "${refImage}" — falling back to t2v`);
            body.model = 'wan2.6-t2v';
            delete body.referenceImage;
          }
        }
      }
    }

    console.log(`[EP04 Visual] ${stepLabel} → ${edgeFn} body:`, JSON.stringify(body).slice(0, 300));
    const { data, error } = await supabase.functions.invoke(edgeFn, { body });

    if (error) {
      toast.error(`${stepLabel} "${stepType}" failed: ${error.message}`);
      return;
    }

    let url = data?.url || data?.videoUrl || data?.imageUrl || null;
    // Skip placeholder URLs (placehold.co) — these mean the real generation failed
    const isPlaceholder = url && (url.includes('placehold.co') || url.includes('placeholder'));
    const isAsync = data?.asyncGeneration === true;
    const taskId2 = data?.taskId;

    // If video is still generating async, poll for completion (WAN models take 1-5 min)
    if (isAsync && taskId2 && !url) {
      toast.info(`${stepLabel} "${stepType}": video generating... polling for result`);
      url = await pollVideoTaskResult(taskId2);
      if (url) {
        console.log(`[EP04 Visual] ${stepLabel} async poll resolved:`, url.substring(0, 80));
      }
    }

    // CRITICAL: Ensure all generated assets are on Supabase Storage (permanent URLs)
    // Base64 data URIs (1-3MB+) will cause DB JSONB timeouts/size failures
    // CDN URLs (DashScope, Replicate) expire after ~24h — assembly can't use them
    const isImageType = stepType.includes('image') || stepType === 'kinetic-text' || stepType === 'motion-graphics';
    if (url && projectId && !isSupabaseStorageUrl(url)) {
      const resultKey = `${stepType}-${sceneKey}-${Date.now()}`;
      try {
        url = await ensureStorageUrl(projectId, resultKey, url, isImageType ? 'image' : 'video');
      } catch (mirrorErr) {
        console.warn(`[EP04 Visual] ${stepLabel}: mirror to Storage failed:`, mirrorErr);
        if (isBase64DataUri(url)) url = null; // Never store base64 in results
      }
    }

    if (isPlaceholder) {
      toast.warning(`${stepLabel} "${stepType}": generation returned placeholder — provider may be unavailable`);
      console.warn(`[EP04 Visual] ${stepLabel} got placeholder URL:`, url);
    } else if (url) {
      // Deterministic index for kinetic-text keys (matches assembly-phase sort order)
      const suffix = stepType === 'kinetic-text'
        ? String(Object.keys(results).filter(k => k.startsWith(`kinetic-text-${sceneKey}`)).length)
        : String(Date.now());
      results[`${stepType}-${sceneKey}-${suffix}`] = url;
    } else if (isAsync) {
      toast.warning(`${stepLabel} "${stepType}": still generating — check back later`);
    }
    if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, isPlaceholder ? null : url);
  }, [projectId, screenshotUrls, scenes, scriptContentForUI, trackGenerationJob, completeGenerationJob]);

  const startSceneVisualProduction = useCallback(async (sceneKey: string, onlyTypes?: Set<string>, forceRegenAll = false) => {
    setSceneProduction(prev => ({
      ...prev,
      [sceneKey]: { ...(prev[sceneKey] || defaultSceneStatus()), visual: 'generating' },
    }));

    try {
      // Read pipeline steps — prefer config file (always up-to-date), fall back to DB
      const pipelineSceneKey = SCRIPT_TO_PIPELINE_MAP[sceneKey] || sceneKey;
      const configPipeline = EP04_SCENE_PIPELINES[pipelineSceneKey as keyof typeof EP04_SCENE_PIPELINES];
      const rawPipeline = configPipeline || dbProject.scenePipelineFor(sceneKey);
      const pipelineSteps = (Array.isArray(rawPipeline) ? rawPipeline : (rawPipeline?.steps || [])) as Array<Record<string, unknown>>;
      const results: Record<string, string> = {};

      if (configPipeline) {
        console.log(`[EP04 Visual] ${sceneKey}: using config file pipeline (${pipelineSceneKey}, ${pipelineSteps.length} steps)`);
        // NOTE: Pipeline sync to DB removed — it raced with updateSceneArtifacts and could
        // overwrite artifacts with stale scene_config. Config file is already the source of
        // truth for pipeline lookups via EP04_SCENE_PIPELINES, so DB sync is unnecessary.
      }

      // Verify pipeline data exists
      if (pipelineSteps.length === 0) {
        toast.warning(`No pipeline configured for ${sceneKey} — skipping`);
        setSceneProduction(prev => ({
          ...prev,
          [sceneKey]: { ...(prev[sceneKey] || defaultSceneStatus()), visual: 'done' },
        }));
        return;
      }

      // ── Track TTS audio per character for lipsync correlation ──
      // Use FIRST (shortest) TTS line per character — shorter audio means:
      // 1. Alibaba (free) can handle it (20s limit)
      // 2. Replicate renders faster and cheaper if needed
      // 3. Lipsync only needs a representative clip, not the full monologue
      const lastTTSByCharacter: Record<string, string> = {};
      const sceneLineKeys = scenes.get(sceneKey)?.keys || [];
      for (const lk of sceneLineKeys) {
        const lineData = scriptContentForUI[lk];
        const audio = audioMap[lk];
        if (lineData && audio?.audioUrl && audio.audioUrl.length > 0) {
          // First-wins: keep the first (typically shortest) TTS line per character
          if (!lastTTSByCharacter[lineData.voice]) {
            lastTTSByCharacter[lineData.voice] = audio.audioUrl;
            console.log(`[EP04 Visual] ${sceneKey}: TTS for "${lineData.voice}" → ${audio.audioUrl.substring(0, 60)}...`);
          }
        }
      }

      // ── Smart regeneration: skip steps that already have a generated asset ──
      // forceRegenAll = true → ignore ALL existing assets (full fresh generation)
      const existingScene = forceRegenAll ? null : sceneProduction[sceneKey];
      const existingVideoUrls = existingScene?.videoUrls || {};
      const existingImageUrls = existingScene?.imageUrls || {};
      const existingAvatarUrls = existingScene?.avatarUrls || {};
      const existingLipsyncUrls = existingScene?.lipsyncUrls || {};
      if (forceRegenAll) {
        console.log(`[EP04 Visual] ${sceneKey}: forceRegenAll — ignoring all existing assets`);
      }

      const hasExistingAsset = (sType: string, sKey: string, character?: string, scriptKey?: string): boolean => {
        // Only trust permanent Supabase URLs — external CDN URLs expire
        const isPermanent = (url: string) => url && url.includes('supabase.co/storage');
        if (sType === 'alibaba-video' || sType === 'video' || sType === 'scene-transition') {
          return Object.entries(existingVideoUrls).some(([k, url]) => (k.includes('video') || k.includes('scene-transition')) && k.includes(sKey) && isPermanent(url));
        }
        if (sType === 'static-asset') {
          return Object.entries(existingImageUrls).some(([k, url]) => k.includes('static-asset') && k.includes(sKey) && isPermanent(url));
        }
        if (sType === 'kinetic-text' || sType === 'motion-graphics' || sType === 'screen-capture' || sType === 'storybook-frame') {
          return Object.entries(existingImageUrls).some(([k, url]) => k.includes(sType.split('-')[0]) && k.includes(sKey) && isPermanent(url));
        }
        if (sType === 'avatar-3d' && character) {
          // Only skip if the existing avatar is a PERMANENT Supabase URL.
          // External CDN URLs (DashScope oss-*.aliyuncs.com, replicate.delivery, etc.) expire
          // and should always be regenerated so we get a fresh permanent URL.
          const existingUrl = Object.entries(existingAvatarUrls).find(([k]) => k.includes(character))?.[1];
          return !!existingUrl && existingUrl.includes('supabase.co/storage');
        }
        if (sType === 'avatar-lipsync' && character) {
          // Per-scriptKey check: avatar-lipsync-allaudin-bridge-0-to-1 is different from avatar-lipsync-allaudin-allaudin-emerge
          // Only trust permanent Supabase URLs — expired CDN URLs should regenerate
          const checkUrl = (k: string) => {
            const url = existingLipsyncUrls[k];
            return url && url.includes('supabase.co/storage');
          };
          if (scriptKey) {
            return Object.keys(existingLipsyncUrls).some(k => k.includes(character) && k.includes(scriptKey) && checkUrl(k));
          }
          return Object.keys(existingLipsyncUrls).some(k => k.includes(character) && checkUrl(k));
        }
        return false;
      };

      // Count visual steps for progress tracking (respect onlyTypes filter)
      const visualSteps = pipelineSteps.filter(s => {
        const t = (s.type as string) || 'image';
        if (SKIP_IN_VISUAL.has(t)) return false;
        if (onlyTypes && !onlyTypes.has(t)) return false;
        return true;
      });
      let visualStepNum = 0;
      const totalVisualSteps = visualSteps.length;

      if (totalVisualSteps === 0 && onlyTypes) {
        console.log(`[EP04 Visual] ${sceneKey}: no ${[...onlyTypes].join(',')} steps in pipeline — skipping`);
        setSceneProduction(prev => ({
          ...prev,
          [sceneKey]: { ...(prev[sceneKey] || defaultSceneStatus()), visual: 'done' },
        }));
        return;
      }

      // Carry forward ALL existing assets into results so they're preserved in the final save
      Object.assign(results, existingVideoUrls, existingImageUrls);
      for (const [k, v] of Object.entries(existingAvatarUrls)) { if (v) results[k] = v; }
      for (const [k, v] of Object.entries(existingLipsyncUrls)) { if (v) results[k] = v; }

      for (let i = 0; i < pipelineSteps.length; i++) {
        if (abortRef.current) break;
        const step = pipelineSteps[i] as Record<string, unknown>;
        const stepType = (step.type as string) || 'image';

        // ── Track TTS audio for lipsync (first-wins, don't regenerate) ──
        if (stepType === 'tts') {
          const scriptKey = step.scriptKey as string;
          const voice = step.voice as string;
          if (scriptKey && audioMap[scriptKey]?.audioUrl && !lastTTSByCharacter[voice]) {
            lastTTSByCharacter[voice] = audioMap[scriptKey].audioUrl;
          }
          continue;
        }

        // Skip non-visual step types
        if (SKIP_IN_VISUAL.has(stepType)) continue;

        // ── onlyTypes filter: skip step types not in the filter ──
        if (onlyTypes && !onlyTypes.has(stepType)) continue;

        // ── Skip steps that already have a generated asset ──
        const stepCharacter = step.character as string | undefined;
        const stepScriptKey = step.scriptKey as string | undefined;
        if (hasExistingAsset(stepType, sceneKey, stepCharacter, stepScriptKey)) {
          const existKey = stepCharacter ? `${stepType}(${stepCharacter}${stepScriptKey ? ':' + stepScriptKey : ''})` : stepType;
          console.log(`[EP04 Visual] ${sceneKey}: skipping ${existKey} — already generated`);
          continue; // existing assets already carried forward above
        }

        // ── Per-step progress toast ──
        visualStepNum++;
        const stepLabel = `${sceneKey}: ${stepType}`;
        console.log(`[EP04 Visual] ${stepLabel} — starting step ${visualStepNum}/${totalVisualSteps}...`);
        toast.info(`${stepLabel} (step ${visualStepNum}/${totalVisualSteps})...`);

        await processVisualStep(step, sceneKey, results, lastTTSByCharacter, stepLabel);

        // ── Change 7: Rate limiting between steps (1s) ──
        if (i < pipelineSteps.length - 1) await new Promise(r => setTimeout(r, 1000));
      }

      // ── Change 6: Process Character Interactions for this scene ──
      // CI/NS use pipeline scene IDs (e.g. 'scene-5-day2') while our scenes Map
      // uses script scene IDs (e.g. 'scene-5-governance'). Map via SCRIPT_TO_PIPELINE_MAP.
      const pipelineSceneId = SCRIPT_TO_PIPELINE_MAP[sceneKey] || sceneKey;
      const extraInteractions = EP04_CHARACTER_INTERACTIONS.filter(ci => ci.sceneId === sceneKey || ci.sceneId === pipelineSceneId);
      const extraScrolls = EP04_NARRATOR_SCROLLS.filter(ns => ns.sceneId === sceneKey || ns.sceneId === pipelineSceneId);
      const extraSteps = [
        ...extraInteractions.flatMap(ci => ci.steps),
        ...extraScrolls.flatMap(ns => ns.steps),
      ] as Array<Record<string, unknown>>;

      for (let j = 0; j < extraSteps.length; j++) {
        if (abortRef.current) break;
        const extraStep = extraSteps[j];
        const extraType = (extraStep.type as string) || 'unknown';
        toast.info(`${sceneKey}: ${extraType} (extra ${j + 1}/${extraSteps.length})...`);
        await processVisualStep(extraStep, sceneKey, results, lastTTSByCharacter, `${sceneKey}: ${extraType}`);
        await new Promise(r => setTimeout(r, 1000)); // rate limit
      }

      // Persist visual artifacts to DB
      // SAFETY: Strip any base64 data URIs that slipped through — they'll bloat JSONB and cause save failures
      const httpOnly = ([, v]: [string, string]) => v && !isBase64DataUri(v);
      console.log(`[PERSIST SAVE] ${sceneKey}: visual production complete, ${Object.keys(results).length} total results:`, Object.keys(results));
      if (projectId) {
        const saveOk = await updateSceneArtifacts(projectId, sceneKey, {
          videoUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('video') || k.includes('character-interaction') || k.includes('narrator-scroll') || k.includes('scene-transition')).filter(httpOnly)),
          imageUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('image') || k.includes('kinetic') || k.includes('motion') || k.includes('screen-capture') || k.includes('ai-screen-enhance') || k.includes('storybook-frame') || k.includes('static-asset')).filter(httpOnly)),
          avatarUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('avatar-3d')).filter(httpOnly)),
          lipsyncUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('lipsync') && !k.startsWith('_')).filter(httpOnly)),
        });
        if (saveOk) {
          console.log(`[PERSIST SAVE] ${sceneKey}: ✅ DB save confirmed — artifacts will survive refresh`);
        } else {
          console.error(`[PERSIST SAVE] ${sceneKey}: ❌ DB SAVE FAILED — artifacts will be LOST on refresh!`);
          toast.error(`Failed to save ${sceneKey} artifacts to DB — they may be lost on refresh`);
        }
      } else {
        console.warn(`[PERSIST SAVE] ${sceneKey}: ⚠️ No projectId — artifacts NOT saved to DB!`);
      }

      // State update — MUST match DB save buckets exactly (no double-counting)
      const savedVideoUrls = Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('video') || k.includes('character-interaction') || k.includes('narrator-scroll') || k.includes('scene-transition')));
      const savedImageUrls = Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('image') || k.includes('kinetic') || k.includes('motion') || k.includes('screen-capture') || k.includes('ai-screen-enhance') || k.includes('storybook-frame') || k.includes('static-asset')));
      const savedAvatarUrls = Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('avatar-3d')));
      const savedLipsyncUrls = Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('lipsync')));
      const totalSaved = Object.keys(savedVideoUrls).length + Object.keys(savedImageUrls).length + Object.keys(savedAvatarUrls).length + Object.keys(savedLipsyncUrls).length;
      console.log(`[EP04] ${sceneKey}: state update — ${Object.keys(savedVideoUrls).length} videos, ${Object.keys(savedImageUrls).length} images, ${Object.keys(savedAvatarUrls).length} avatars, ${Object.keys(savedLipsyncUrls).length} lipsync = ${totalSaved} total`);
      setSceneProduction(prev => ({
        ...prev,
        [sceneKey]: {
          ...(prev[sceneKey] || defaultSceneStatus()),
          visual: 'done',
          videoUrls: savedVideoUrls,
          imageUrls: savedImageUrls,
          avatarUrls: savedAvatarUrls,
          lipsyncUrls: savedLipsyncUrls,
        },
      }));

      const totalResults = Object.keys(results).length;
      toast.success(`Visual production complete for ${sceneKey} (${totalResults} assets)`);
    } catch (err: any) {
      console.error(`[EP04 Visual] Scene ${sceneKey} failed:`, err);
      setSceneProduction(prev => ({
        ...prev,
        [sceneKey]: { ...(prev[sceneKey] || defaultSceneStatus()), visual: 'error' },
      }));
      toast.error(`Visual production failed for ${sceneKey}: ${err.message}`);
    }
  }, [dbProject, projectId, audioMap, screenshotUrls, scenes, scriptContentForUI, processVisualStep, trackGenerationJob, completeGenerationJob, updateSceneArtifacts]);

  const startAllVisualProduction = useCallback(async () => {
    abortRef.current = false;
    const sceneKeys = Array.from(scenes.keys());
    setProductionPhase('visual');
    setVisualProgress({ current: 0, total: sceneKeys.length });

    for (let i = 0; i < sceneKeys.length; i++) {
      if (abortRef.current) break;
      setVisualProgress({ current: i + 1, total: sceneKeys.length });
      await startSceneVisualProduction(sceneKeys[i]);
      // ── Change 7: Rate limiting between scenes (2s) ──
      if (i < sceneKeys.length - 1) await new Promise(r => setTimeout(r, 2000));
    }

    setVisualProgress(null);
    invalidateSceneCache(); // Refresh React Query cache after batch production
    if (!abortRef.current) {
      toast.success('All visual production complete');
    } else {
      toast.warning('Visual production cancelled');
    }
  }, [scenes, startSceneVisualProduction, invalidateSceneCache]);

  // ── Parallel regen for selected scenes (runs all at once) ──
  const startParallelSceneRegen = useCallback(async (sceneKeys: string[], forceRegenAll = false) => {
    if (sceneKeys.length === 0) { toast.warning('No scenes selected for regen'); return; }
    toast.info(`Regenerating ${sceneKeys.length} scene(s) in parallel: ${sceneKeys.map(sk => SCENE_TITLES[sk]?.split(' — ')[1] || sk).join(', ')}`);
    const results = await Promise.allSettled(
      sceneKeys.map(sk => startSceneVisualProduction(sk, undefined, forceRegenAll))
    );
    const ok = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed === 0) {
      toast.success(`Parallel regen complete: all ${ok} scene(s) succeeded`);
    } else {
      toast.warning(`Parallel regen: ${ok} succeeded, ${failed} failed`);
    }
  }, [startSceneVisualProduction]);

  // ── Lipsync-only production across all scenes ──
  const startAllLipsyncProduction = useCallback(async () => {
    abortRef.current = false;
    const sceneKeys = Array.from(scenes.keys());
    setProductionPhase('visual');
    setVisualProgress({ current: 0, total: sceneKeys.length });
    const lipsyncFilter = new Set(['avatar-lipsync']);

    // Clear only lipsync data for all scenes so those steps regenerate
    setSceneProduction(prev => {
      const next = { ...prev };
      for (const sk of sceneKeys) {
        next[sk] = { ...(next[sk] || defaultSceneStatus()), lipsyncUrls: {} };
      }
      return next;
    });

    for (let i = 0; i < sceneKeys.length; i++) {
      if (abortRef.current) break;
      setVisualProgress({ current: i + 1, total: sceneKeys.length });
      await startSceneVisualProduction(sceneKeys[i], lipsyncFilter);
      if (i < sceneKeys.length - 1) await new Promise(r => setTimeout(r, 2000));
    }

    setVisualProgress(null);
    if (!abortRef.current) {
      toast.success('All lipsync production complete');
    } else {
      toast.warning('Lipsync production cancelled');
    }
  }, [scenes, startSceneVisualProduction]);

  // ─── Save All Assets to DB (manual trigger) ─────────────────────────────
  // Persists every asset currently in sceneProduction state to DB.
  // SERIALIZED: saves scenes one at a time to avoid Supabase connection pool
  // exhaustion and statement timeouts (code 57014). Each scene does 2 queries
  // (SELECT + UPDATE), so 12 parallel saves = 24 concurrent queries → timeouts.
  const saveAllAssetsToDb = useCallback(async () => {
    if (!projectId) { toast.error('No project ID'); return; }
    const allSceneKeys = Object.keys(sceneProduction).filter(sk => {
      const s = sceneProduction[sk];
      return s.visual === 'done' || Object.keys(s.videoUrls).length > 0 ||
        Object.keys(s.imageUrls).length > 0 || Object.keys(s.avatarUrls).length > 0 ||
        Object.keys(s.lipsyncUrls).length > 0 || s.musicUrl;
    });
    if (allSceneKeys.length === 0) { toast.warning('No assets in memory to save'); return; }
    toast.info(`Saving ALL assets (visuals + music + TTS) for ${allSceneKeys.length} scenes...`);

    let okScenes = 0;
    let failedScenes = 0;
    let totalTtsSaved = 0;

    for (let i = 0; i < allSceneKeys.length; i++) {
      const sk = allSceneKeys[i];
      const s = sceneProduction[sk];

      // 1. Save TTS lines for this scene
      const sceneLines = scriptKeys.filter(k => scriptContentForUI[k]?.scene === sk);
      for (const lk of sceneLines) {
        if (audioMap[lk]?.audioUrl) {
          const ttsOk = await updateLineTTS(projectId, lk, {
            tts_audio_url: audioMap[lk].audioUrl,
            tts_provider: audioMap[lk].provider,
            tts_voice_id: audioMap[lk].voice,
            tts_status: 'generated',
          });
          if (ttsOk) totalTtsSaved++;
          await new Promise(r => setTimeout(r, 100)); // micro-delay between TTS saves
        }
      }

      // 2. Save visual artifacts (with 1 retry)
      let visSaved = false;
      for (let attempt = 0; attempt < 2 && !visSaved; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 1000));
        visSaved = await updateSceneArtifacts(projectId, sk, {
          videoUrls: s.videoUrls,
          imageUrls: s.imageUrls,
          avatarUrls: s.avatarUrls,
          lipsyncUrls: s.lipsyncUrls,
        });
      }

      // 3. Save music + SFX
      let musSaved = true;
      if (s.musicUrl || (s.sfxUrls && s.sfxUrls.length > 0)) {
        await new Promise(r => setTimeout(r, 300));
        musSaved = await updateSceneMusic(projectId, sk, s.musicUrl, s.sfxUrls || []);
      }

      if (visSaved && musSaved) {
        okScenes++;
      } else {
        failedScenes++;
      }
      console.log(`[EP04] Save ${sk} (${i + 1}/${allSceneKeys.length}): vis=${visSaved}, mus=${musSaved}`);

      // Delay between scenes
      if (i < allSceneKeys.length - 1) await new Promise(r => setTimeout(r, 500));
    }

    if (failedScenes === 0) {
      toast.success(`Saved all ${okScenes} scenes + ${totalTtsSaved} TTS lines to DB`);
    } else {
      toast.warning(`${okScenes} OK, ${failedScenes} failed — use per-scene Save to retry`);
    }
  }, [projectId, sceneProduction, scriptKeys, scriptContentForUI, audioMap, updateSceneArtifacts, updateSceneMusic, updateLineTTS]);

  // ─── Phase 4: Music & SFX (per scene) ─────────────────────────────────

  const startSceneMusicProduction = useCallback(async (sceneKey: string) => {
    setSceneProduction(prev => ({
      ...prev,
      [sceneKey]: { ...(prev[sceneKey] || defaultSceneStatus()), music: 'generating', musicUrl: null },
    }));

    try {
      const config = dbProject.sceneConfigFor(sceneKey) || {};
      const musicConfig = (config as any).music;
      const sfxList = ((config as any).sfx || []) as Array<{ prompt: string; duration?: number }>;

      let musicUrl: string | null = null;
      const sfxUrls: string[] = [];

      // Generate music — use scene config if available, otherwise auto-generate from scene title
      const sceneTitle = SCENE_TITLES[sceneKey] || sceneKey;
      const fallbackPrompt = `Cinematic instrumental background music for a documentary scene: "${sceneTitle}". Emotional, orchestral, suitable for a tech sprint retrospective video.`;
      const musicPrompt = musicConfig?.prompt || fallbackPrompt;
      const musicDuration = musicConfig?.duration || 30;

      {
        let jobId: string | null = null;
        if (projectId) {
          jobId = await trackGenerationJob({
            projectId, jobType: 'video', sceneKey, provider: 'suno', estimatedTokens: 1000,
          });
        }

        // 60-second timeout to prevent infinite spin
        const musicPromise = supabase.functions.invoke('multi-provider-music', {
          body: {
            prompt: musicPrompt,
            duration: musicDuration,
            instrumental: true,
            tier: 'advanced',  // Route to fal.ai Stable Audio when FAL_API_KEY is set
            projectId: projectId || undefined,
            sceneKey: sceneKey,
          },
        });
        const musicTimeout = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('Music generation timed out after 120s') }), 120000)
        );
        const { data, error } = await Promise.race([musicPromise, musicTimeout]);

        if (!error && data?.audioUrl && !data?.isSilentPlaceholder) {
          musicUrl = data.audioUrl;
          // Mirror music to Supabase Storage — CDN URLs expire and may have CORS issues
          if (projectId && !isSupabaseStorageUrl(musicUrl)) {
            try {
              musicUrl = await ensureStorageUrl(projectId, `music-${sceneKey}`, musicUrl, 'audio');
              console.log(`[EP04 Music] ${sceneKey}: mirrored to Storage: ${musicUrl.substring(0, 80)}...`);
            } catch (mirrorErr) {
              console.warn(`[EP04 Music] ${sceneKey}: Storage mirror failed, using original URL:`, mirrorErr);
            }
          }
        } else if (data?.isSilentPlaceholder) {
          console.warn(`[EP04 Music] ${sceneKey}: got silent placeholder — all providers failed`, {
            debugErrors: data?.debugErrors,
          });
          toast.error(`Music for "${sceneTitle}" failed — all providers returned silent. Try "Regen All Music".`);
        } else {
          console.warn(`[EP04 Music] ${sceneKey}: music generation returned no URL`, { error, data });
        }

        if (jobId && projectId) {
          await completeGenerationJob(jobId, data?.tokensUsed || 1000, musicUrl || undefined);
        }
      }

      // Generate SFX clips (30s timeout each)
      for (const sfx of sfxList) {
        try {
          const sfxPromise = supabase.functions.invoke('multi-provider-sfx', {
            body: { prompt: sfx.prompt, duration: sfx.duration || 3, tier: 'advanced' },
          });
          const sfxTimeout = new Promise<{ data: null }>((resolve) =>
            setTimeout(() => resolve({ data: null }), 30000)
          );
          const { data } = await Promise.race([sfxPromise, sfxTimeout]);
          if (data?.audioUrl) {
            let sfxUrl = data.audioUrl;
            if (projectId && !isSupabaseStorageUrl(sfxUrl)) {
              try { sfxUrl = await ensureStorageUrl(projectId, `sfx-${sceneKey}-${sfxUrls.length}`, sfxUrl, 'audio'); } catch { /* keep original */ }
            }
            sfxUrls.push(sfxUrl);
          }
        } catch (sfxErr) {
          console.warn(`[EP04 Music] SFX failed for ${sceneKey}:`, sfxErr);
        }
      }

      // Persist to DB
      if (projectId) {
        await updateSceneMusic(projectId, sceneKey, musicUrl, sfxUrls);
      }

      setSceneProduction(prev => ({
        ...prev,
        [sceneKey]: {
          ...(prev[sceneKey] || defaultSceneStatus()),
          music: musicUrl ? 'done' : 'error',
          musicUrl,
          sfxUrls,
        },
      }));

      if (musicUrl) {
        toast.success(`Music & SFX complete for ${sceneKey}`);
      }
    } catch (err: any) {
      console.error(`[EP04 Music] Scene ${sceneKey} failed:`, err);
      setSceneProduction(prev => ({
        ...prev,
        [sceneKey]: { ...(prev[sceneKey] || defaultSceneStatus()), music: 'error' },
      }));
    }
  }, [dbProject, projectId, trackGenerationJob, completeGenerationJob, updateSceneMusic]);

  // Copy music from one scene to another (for when all providers fail on a specific scene)
  // Validates each candidate with a HEAD request to ensure the file is real audio (>100KB)
  const copySceneMusic = useCallback(async (toSceneKey: string) => {
    const candidates = Array.from(scenes.keys()).filter(sk =>
      sk !== toSceneKey && sceneProduction[sk]?.musicUrl && sceneProduction[sk]?.music === 'done'
    );
    if (candidates.length === 0) {
      toast.error('No scene with music to copy from');
      return;
    }
    toast.info('Checking for valid music source...');
    let sourceUrl: string | null = null;
    let sourceSfx: string[] = [];
    let donorKey: string | null = null;
    for (const sk of candidates) {
      const url = sceneProduction[sk]!.musicUrl!;
      try {
        const resp = await fetch(url, { method: 'HEAD', cache: 'no-store' });
        const size = parseInt(resp.headers.get('content-length') || '0', 10);
        if (resp.ok && size > 100_000) { // >100KB = real audio (not HTML error page or silent placeholder)
          sourceUrl = url;
          sourceSfx = sceneProduction[sk]!.sfxUrls || [];
          donorKey = sk;
          break;
        }
        console.log(`[CopyMusic] Skipping ${sk}: ${resp.ok ? `too small (${size}b)` : `status ${resp.status}`}`);
      } catch (err) {
        console.log(`[CopyMusic] Skipping ${sk}: fetch error`, err);
      }
    }
    if (!sourceUrl || !donorKey) {
      toast.error('All scenes have corrupt music — use Regen instead');
      return;
    }
    // Update React state
    setSceneProduction(prev => ({
      ...prev,
      [toSceneKey]: { ...(prev[toSceneKey] || defaultSceneStatus()), music: 'done', musicUrl: sourceUrl, sfxUrls: sourceSfx },
    }));
    // Persist to DB
    if (projectId) {
      const ok = await updateSceneMusic(projectId, toSceneKey, sourceUrl!, sourceSfx);
      if (ok) {
        toast.success(`Copied music from ${SCENE_TITLES[donorKey]?.split(' — ')[1] || donorKey} → ${SCENE_TITLES[toSceneKey]?.split(' — ')[1] || toSceneKey}`);
      } else {
        toast.error('Copied locally but failed to save to DB');
      }
    }
  }, [scenes, sceneProduction, projectId, updateSceneMusic]);

  const startAllMusicProduction = useCallback(async (skipCompleted = false) => {
    const allSceneKeys = Array.from(scenes.keys());
    // When skipCompleted is true, only regen scenes that failed or have no music
    const sceneKeys = skipCompleted
      ? allSceneKeys.filter(sk => {
          const status = sceneProduction[sk];
          return !status?.musicUrl || status?.music === 'error' || status?.music === 'idle';
        })
      : allSceneKeys;

    if (sceneKeys.length === 0) {
      toast.success('All scenes already have music — nothing to regenerate');
      return;
    }

    setProductionPhase('music');
    const skipped = allSceneKeys.length - sceneKeys.length;
    if (skipped > 0) {
      toast.info(`Skipping ${skipped} scene(s) with existing music, regenerating ${sceneKeys.length} scene(s)`);
    }
    setMusicProgress({ current: 0, total: sceneKeys.length });

    for (let i = 0; i < sceneKeys.length; i++) {
      if (abortRef.current) break;
      setMusicProgress({ current: i + 1, total: sceneKeys.length });
      await startSceneMusicProduction(sceneKeys[i]);
    }

    setMusicProgress(null);
    toast.success('Music & SFX production complete');
  }, [scenes, sceneProduction, startSceneMusicProduction]);

  // ─── Phase 5: Assembly → One Cinematic Movie ──────────────────────────

  // ─── LIPSYNC CONSTANTS ─────────────────────────────────────────────────────
  // Alibaba WAN 2.2 silently trims audio to ~18s (280KB). Lines longer than this
  // play as voiceover with a static/looping avatar after the lipsync portion.
  const LIPSYNC_MAX_DURATION = 18; // seconds

  // Readiness audit — checks all 12 scenes for required assets before assembly
  // Enhanced: per-scene TTS lines with durations, lipsync handoff detection,
  // music-vs-scene duration comparison, pipeline step cross-reference.
  const getAssemblyReadiness = useCallback(() => {
    const sceneKeys = Array.from(scenes.keys());
    const report: Array<{
      sceneKey: string;
      title: string;
      // TTS
      ttsLines: { key: string; voice: string; duration: number; hasAudio: boolean }[];
      ttsReady: number;
      ttsMissing: number;
      expectedDuration: number; // sum of TTS durations (master clock)
      // Visuals
      expectedVisualSteps: { type: string; label: string }[];
      videoCount: number;
      imageCount: number;
      // Lipsync
      lipsyncEntries: { character: string; hasLipsync: boolean; ttsExceeds18s: boolean }[];
      lipsyncReady: number;
      lipsyncMissing: number;
      // Avatar 3D
      avatarCount: number;
      // Music & SFX
      hasMusic: boolean;
      musicDuration: number | null;
      musicCoversScene: boolean;
      sfxCount: number;
      // Overall
      missing: string[];
      canAssemble: boolean; // minimum: TTS + at least 1 visual
    }> = [];

    let totalReady = 0;
    let totalMissing = 0;
    let grandTotalDuration = 0;

    for (const sceneKey of sceneKeys) {
      const status = sceneProduction[sceneKey];
      const sceneLines = scriptKeys.filter(k => scriptContentForUI[k]?.scene === sceneKey);

      // Per-TTS-line detail
      const ttsLines = sceneLines.map(k => {
        const line = scriptContentForUI[k];
        const isVisualOnly = !line?.text || line.text.trim().length === 0;
        return {
          key: k,
          voice: line?.voice || 'unknown',
          duration: line?.duration_est || 5,
          hasAudio: !!audioMap[k]?.audioUrl || isVisualOnly,
          isVisualOnly,
        };
      });
      const ttsReady = ttsLines.filter(l => l.hasAudio).length;
      const ttsMissing = ttsLines.filter(l => !l.hasAudio).length;
      const expectedDuration = ttsLines.reduce((sum, l) => sum + l.duration, 0);
      grandTotalDuration += expectedDuration;

      // Pipeline steps cross-reference
      const pipelineSceneKey = SCRIPT_TO_PIPELINE_MAP[sceneKey] || sceneKey;
      const configPipeline = EP04_SCENE_PIPELINES[pipelineSceneKey as keyof typeof EP04_SCENE_PIPELINES];
      const steps = Array.isArray(configPipeline) ? configPipeline : [];

      const expectedVisualSteps = steps
        .filter(s => ['alibaba-video', 'alibaba-image', 'screen-capture', 'ai-screen-enhance'].includes(s.type))
        .map(s => ({ type: s.type, label: s.type.replace(/-/g, ' ') }));

      const videoCount = Object.values(status?.videoUrls || {}).filter(u => u).length;
      const imageCount = Object.values(status?.imageUrls || {}).filter(u => u).length;
      const avatarCount = Object.values(status?.avatarUrls || {}).filter(u => u).length;

      // Lipsync entries — detect which characters need lipsync and whether TTS exceeds limit
      const lipsyncSteps = steps.filter(s => s.type === 'avatar-lipsync') as Array<{ type: 'avatar-lipsync'; character: string; scriptKey?: string }>;
      const lipsyncEntries = lipsyncSteps.map(ls => {
        // Lipsync keys are like "avatar-lipsync-host-title-welcome" — match by character name substring
        const hasLipsync = Object.keys(status?.lipsyncUrls || {}).some(k => k.includes(ls.character) && (status?.lipsyncUrls || {})[k]?.startsWith('http'));
        // Check if the TTS line for this character exceeds the lipsync limit
        const charTtsLines = ttsLines.filter(l => l.voice === ls.character);
        const longestTts = charTtsLines.reduce((max, l) => Math.max(max, l.duration), 0);
        return {
          character: ls.character,
          hasLipsync,
          ttsExceeds18s: longestTts > LIPSYNC_MAX_DURATION,
        };
      });
      const lipsyncReady = lipsyncEntries.filter(l => l.hasLipsync).length;
      const lipsyncMissing = lipsyncEntries.filter(l => !l.hasLipsync).length;

      // Music & SFX
      const hasMusic = !!status?.musicUrl;
      // Estimate music duration from pipeline config
      const musicStep = steps.find(s => s.type === 'music') as { type: 'music'; duration: number } | undefined;
      const musicDuration = musicStep?.duration || null;
      const musicCoversScene = hasMusic && musicDuration != null ? musicDuration >= expectedDuration : false;
      const sfxCount = (status?.sfxUrls || []).length;

      // Missing assets report
      const missing: string[] = [];
      if (ttsReady === 0) missing.push('TTS audio');
      if (videoCount === 0 && imageCount === 0) missing.push('Visuals');
      if (!hasMusic) missing.push('Music');

      if (missing.length === 0) totalReady++;
      else totalMissing++;

      report.push({
        sceneKey,
        title: SCENE_TITLES[sceneKey] || sceneKey,
        ttsLines,
        ttsReady,
        ttsMissing,
        expectedDuration,
        expectedVisualSteps,
        videoCount,
        imageCount,
        lipsyncEntries,
        lipsyncReady,
        lipsyncMissing,
        avatarCount,
        hasMusic,
        musicDuration,
        musicCoversScene,
        sfxCount,
        missing,
        canAssemble: ttsReady > 0 && (videoCount > 0 || imageCount > 0),
      });
    }

    // ── Bridge narrator TTS audit (11 transitions) ──
    const bridgeAudit = EP04_STORYBOOK_TRANSITIONS.map((t, idx) => {
      const bridgeKey = `bridge-${t.from.replace('scene-', '').split('-')[0]}-to-${t.to.replace('scene-', '').split('-')[0]}`;
      const bridgeLine = EP04_NARRATOR_BRIDGES[bridgeKey];
      const audio = audioMap[bridgeKey]?.audioUrl;
      const hasAudio = !!audio && audio.startsWith('http');
      return {
        bridgeKey,
        from: t.from,
        to: t.to,
        style: t.style,
        text: bridgeLine?.text?.substring(0, 60) || '(unknown)',
        duration: bridgeLine?.duration_est || 7,
        hasAudio,
        audioUrl: hasAudio ? audio : null,
      };
    });
    const bridgeReady = bridgeAudit.filter(b => b.hasAudio).length;
    const bridgeMissing = bridgeAudit.filter(b => !b.hasAudio).length;

    return {
      scenes: report,
      totalScenes: sceneKeys.length,
      readyScenes: totalReady,
      missingScenes: totalMissing,
      isReady: totalMissing === 0 && bridgeMissing === 0,
      grandTotalDuration,
      // Minimum requirements: at least TTS + visuals for every scene
      canAssemble: report.every(s => s.canAssemble),
      // Bridge narrator TTS (for transitions between scenes)
      bridgeAudit,
      bridgeReady,
      bridgeMissing,
    };
  }, [scenes, sceneProduction, scriptKeys, scriptContentForUI, audioMap]);

  const [assemblyReadiness, setAssemblyReadiness] = useState<ReturnType<typeof getAssemblyReadiness> | null>(null);

  // Auto-refresh readiness when audioMap or sceneProduction changes (e.g. after regen)
  useEffect(() => {
    if (assemblyReadiness) {
      // Debounce: wait for state to settle after batch operations
      const t = setTimeout(() => setAssemblyReadiness(getAssemblyReadiness()), 500);
      return () => clearTimeout(t);
    }
  }, [audioMap, sceneProduction]); // eslint-disable-line react-hooks/exhaustive-deps

  const [assemblyJobId, setAssemblyJobId] = useState<string | null>(null);
  const assemblyTaskIdRef = React.useRef<string | null>(null); // JSON2Video project ID fallback
  const pollNoProgressCountRef = React.useRef(0); // Track consecutive polls with 0% progress
  const assemblyCancelledRef = React.useRef(false); // Set true on cancel to abort in-flight polls

  // ─── Multi-Part Assembly ──────────────────────────────────────────────────
  // JSON2Video Professional plan caps at 10 minutes per video.
  // Keep full cinematic content per part (Ken Burns, lipsync, kinetic text, SFX, transitions).
  // If this produces 20+ parts, that's fine — the concat stitch combines them all.
  // Per-scene rendering (1 scene = 1 part) is the recommended mode.
  const BOOKEND_BUFFER = 22; // 12s opening + 10s closing = 22s reserved for bookends
  const MAX_PART_DURATION = 120; // 2 minutes max per part — smaller parts render faster
  const MAX_PART_TTS = 8; // Max TTS audio files per part — keeps JSON2Video renders reliable

  interface AssemblyPart {
    partNumber: number;
    sceneKeys: string[];
    estimatedDuration: number;
    ttsCount: number;
    jobId: string | null;       // castJobId (DB row) for polling via genie-cast-status
    taskId?: string | null;     // JSON2Video project ID — fallback for polling when provider_job_id update fails
    status: 'pending' | 'rendering' | 'completed' | 'failed';
    videoUrl: string | null;
    errorMessage?: string;
    /** When a scene is split into sub-parts, this tracks which TTS lines belong to this sub-part */
    _subPartLineRange?: { start: number; end: number };
  }

  const [assemblyParts, setAssemblyParts] = useState<AssemblyPart[]>([]);
  const [activePartNumber, setActivePartNumber] = useState<number | null>(null);

  // ── Per-Scene Assembly with Smart Splitting ──
  // Each scene renders independently. Only very heavy scenes get split.
  // Visual cycling (15s beats) handles long durations, so threshold is generous.
  const MAX_SUB_TTS = 15;
  const MAX_SUB_DURATION = 300; // 5 min — splitLongScenes() in castTimelineEngine already caps J2V at 35s per scene

  const computePerSceneParts = useCallback((): AssemblyPart[] => {
    // Sort scene keys by scene number (e.g., scene-0, scene-1, ..., scene-11)
    // The scenes Map insertion order may not match narrative order
    // (e.g., script entries for scene-7 can appear before scene-5 entries)
    const sceneKeys = Array.from(scenes.keys()).sort((a, b) => {
      const numA = parseInt(a.match(/scene-(\d+)/)?.[1] || '99', 10);
      const numB = parseInt(b.match(/scene-(\d+)/)?.[1] || '99', 10);
      return numA - numB;
    });
    const parts: AssemblyPart[] = [];
    let partNum = 1;

    for (let si = 0; si < sceneKeys.length; si++) {
      const sceneKey = sceneKeys[si];
      const sceneLines = scriptKeys.filter(k => scriptContentForUI[k]?.scene === sceneKey);
      let sceneDuration = 0;
      let sceneTtsCount = 0;
      for (const k of sceneLines) {
        // Use actual measured TTS duration if available; fall back to estimate
        const actualDur = audioMap[k]?.audioDuration;
        const estDur = scriptContentForUI[k]?.duration_est || 5;
        sceneDuration += (actualDur || estDur) + 0.5;
        if (audioMap[k]?.audioUrl) sceneTtsCount++;
      }
      // Add trailing transition duration (~6s bridge narrator + transition visual)
      const sceneIdx = sceneKey.match(/scene-(\d+)/)?.[1];
      const hasTrailingTransition = sceneIdx && si < sceneKeys.length - 1;
      if (hasTrailingTransition) sceneDuration += 6;
      // Count lipsync clips — each is a video element that adds render load
      const lipsyncCount = Object.values(sceneProduction[sceneKey]?.lipsyncUrls || {}).filter(u => u?.startsWith('http')).length;
      const totalElements = sceneTtsCount + lipsyncCount + (hasTrailingTransition ? 1 : 0); // bridge TTS = 1 extra audio
      console.log(`[PerScene] ${sceneKey}: ${sceneTtsCount} TTS + ${lipsyncCount} lipsync + ${hasTrailingTransition ? '1 bridge' : '0 bridge'} = ${totalElements} elements, ~${Math.round(sceneDuration)}s`);

      // Split threshold: >15 TTS or >300s (5 min) duration
      const needsSplit = sceneTtsCount > MAX_SUB_TTS || sceneDuration > MAX_SUB_DURATION;

      if (needsSplit && sceneLines.length > 1) {
        // Split scene into sub-parts. For duration-triggered splits with few TTS lines,
        // use a smaller subPartSize so each part renders under the time limit.
        // E.g., scene-0-title has 3 TTS but ~140s → needs 2 parts, not 1.
        const durationParts = Math.ceil(sceneDuration / MAX_SUB_DURATION);
        const subPartSize = sceneDuration > MAX_SUB_DURATION
          ? Math.max(1, Math.floor(sceneLines.length / durationParts))
          : MAX_SUB_TTS;
        for (let i = 0; i < sceneLines.length; i += subPartSize) {
          const subLines = sceneLines.slice(i, i + subPartSize);
          let subDuration = 0;
          let subTts = 0;
          for (const k of subLines) {
            const actualDur = audioMap[k]?.audioDuration;
            const estDur = scriptContentForUI[k]?.duration_est || 5;
            subDuration += (actualDur || estDur) + 1.5;
            if (audioMap[k]?.audioUrl) subTts++;
          }
          const subLipsync = Math.ceil(lipsyncCount * subLines.length / sceneLines.length);
          console.log(`[PerScene] ${sceneKey} sub-part ${Math.floor(i / subPartSize) + 1}: ${subTts} TTS, ~${Math.round(subDuration)}s`);
          // Merge tiny sub-parts (<5s) into previous part to avoid 0-duration renders
          const prevPart = parts[parts.length - 1];
          if (subDuration < 5 && prevPart && prevPart.sceneKeys[0] === sceneKey && prevPart._subPartLineRange) {
            prevPart._subPartLineRange.end = Math.min(i + subPartSize, sceneLines.length);
            prevPart.estimatedDuration += subDuration;
            prevPart.ttsCount += subTts + subLipsync;
            console.log(`[PerScene] Merged tiny sub-part (~${Math.round(subDuration)}s) into part ${prevPart.partNumber}`);
          } else {
            parts.push({
              partNumber: partNum++,
              sceneKeys: [sceneKey],
              estimatedDuration: subDuration || 30,
              ttsCount: subTts + subLipsync,
              jobId: null,
              status: 'pending' as const,
              videoUrl: null,
              _subPartLineRange: { start: i, end: Math.min(i + subPartSize, sceneLines.length) },
            });
          }
        }
      } else {
        parts.push({
          partNumber: partNum++,
          sceneKeys: [sceneKey],
          estimatedDuration: sceneDuration || 30,
          ttsCount: totalElements,
          jobId: null,
          status: 'pending' as const,
          videoUrl: null,
        });
      }
    }
    return parts;
  }, [scenes, scriptKeys, scriptContentForUI, audioMap, sceneProduction]);

  // Per-scene polling state — polls all parts with status='rendering'
  const [perScenePolling, setPerScenePolling] = useState(false);
  const perScenePollCountRef = useRef(0);

  // Compute part boundaries dynamically from scene durations AND TTS count
  // Both caps must be respected: duration < MAX_PART_DURATION AND TTS count < MAX_PART_TTS
  // With 143 TTS lines + 13 lipsync clips, expect 20+ parts for reliable rendering
  const computePartBoundaries = useCallback((): AssemblyPart[] => {
    const sceneKeys = Array.from(scenes.keys());
    const parts: AssemblyPart[] = [];
    let currentPart: string[] = [];
    let currentDuration = 0;
    let currentTts = 0;
    let partNum = 1;

    for (const sceneKey of sceneKeys) {
      // Calculate scene duration and TTS count from script lines
      const sceneLines = scriptKeys.filter(k => scriptContentForUI[k]?.scene === sceneKey);
      let sceneDuration = 0;
      let sceneTtsCount = 0;
      for (const k of sceneLines) {
        // Use actual measured TTS duration if available; fall back to estimate
        const actualDur = audioMap[k]?.audioDuration;
        const estDur = scriptContentForUI[k]?.duration_est || 5;
        sceneDuration += (actualDur || estDur) + 0.5; // +1.5s TTS gap per line
        if (audioMap[k]?.audioUrl) sceneTtsCount++;
      }
      sceneDuration = sceneDuration || 30;

      // Add transition duration (~5-7s per transition)
      const transitionDuration = currentPart.length > 0 ? 6 : 0;

      // If adding this scene would exceed EITHER limit, finalize current part
      const wouldExceedDuration = (currentDuration + sceneDuration + transitionDuration) > MAX_PART_DURATION;
      const wouldExceedTts = (currentTts + sceneTtsCount) > MAX_PART_TTS;

      if (currentPart.length > 0 && (wouldExceedDuration || wouldExceedTts)) {
        parts.push({
          partNumber: partNum,
          sceneKeys: [...currentPart],
          estimatedDuration: currentDuration,
          ttsCount: currentTts,
          jobId: null,
          status: 'pending',
          videoUrl: null,
        });
        partNum++;
        currentPart = [sceneKey];
        currentDuration = sceneDuration;
        currentTts = sceneTtsCount;
      } else {
        currentPart.push(sceneKey);
        currentDuration += sceneDuration + transitionDuration;
        currentTts += sceneTtsCount;
      }
    }

    // Push final part
    if (currentPart.length > 0) {
      parts.push({
        partNumber: partNum,
        sceneKeys: [...currentPart],
        estimatedDuration: currentDuration,
        ttsCount: currentTts,
        jobId: null,
        status: 'pending',
        videoUrl: null,
      });
    }

    return parts;
  }, [scenes, scriptKeys, scriptContentForUI, audioMap]);

  // Poll for assembly completion when we have a pending job
  const pollCountRef = React.useRef(0);
  const pollErrorCountRef = React.useRef(0);
  // Store unstable deps in refs so the polling useEffect only re-fires on assemblyJobId change
  // (prevents poll counter reset when scenes/totalDuration/updateFinalAssembly change reference)
  const pollDepsRef = React.useRef({ projectId, totalDuration, scenes, updateFinalAssembly, activePartNumber });
  pollDepsRef.current = { projectId, totalDuration, scenes, updateFinalAssembly, activePartNumber };
  useEffect(() => {
    if (!assemblyJobId) {
      pollCountRef.current = 0;
      pollErrorCountRef.current = 0;
      pollNoProgressCountRef.current = 0;
      return;
    }
    assemblyCancelledRef.current = false; // reset on new job
    console.log(`[EP04 Poll] Polling STARTED for assemblyJobId=${assemblyJobId}, taskId fallback=${assemblyTaskIdRef.current}`);
    const MAX_POLLS = 180; // 180 × 10s = 30 minutes max (8-scene 2.5min video can take 15-20min)
    const MAX_ERRORS = 5;  // 5 consecutive errors = stop

    // Polling function — called immediately on first run, then every 10s
    const doPoll = async () => {
      if (assemblyCancelledRef.current) return; // cancelled — abort
      pollCountRef.current++;
      // Never give up — J2V renders can take 20-40min for complex scenes.
      // Warn at milestones but keep polling until completion or cancellation.
      if (pollCountRef.current === 60) {
        toast.info('Still rendering on JSON2Video (10 min)... polling continues');
      } else if (pollCountRef.current === 180) {
        toast.info('Still rendering on JSON2Video (30 min)... polling continues');
      } else if (pollCountRef.current === 360) {
        toast.warning('Render taking unusually long (60 min) — check JSON2Video dashboard. Polling continues...');
      }
      try {
        // Primary: poll via castJobId (DB row lookup → provider_job_id → JSON2Video)
        const { data, error: fnError } = await supabase.functions.invoke('genie-cast-status', {
          body: { castJobId: assemblyJobId },
        });
        console.log(`[EP04 Poll #${pollCountRef.current}] castJobId=${assemblyJobId}, response:`, JSON.stringify(data)?.substring(0, 300), fnError ? `ERROR: ${fnError.message}` : '');

        // ── Fallback: if castJobId poll returns 'processing' with 0% for 3+ polls,
        // the provider_job_id update likely failed. Use taskId (JSON2Video project ID) directly.
        let resolvedStatus: string | undefined;
        let resolvedVideoUrl: string | undefined;
        let resolvedThumbnailUrl: string | undefined;
        let resolvedProgress = 0;
        let resolvedError: string | undefined;

        const jobStatus = data?.job?.status;
        const jobProgress = data?.job?.progressPercent || 0;

        if (fnError || (!jobStatus) || (jobStatus !== 'completed' && jobStatus !== 'failed' && jobProgress === 0)) {
          // Stuck: edge fn error, no job status, or processing at 0%
          pollNoProgressCountRef.current++;
        } else if (jobProgress > 0 || jobStatus === 'completed' || jobStatus === 'failed') {
          // Real progress or terminal state — reset
          pollNoProgressCountRef.current = 0;
        }

        // Fallback: poll J2V directly if stuck OR if primary says "completed" but has no URL
        // The DB row can show completed (from a prior fallback's write) before output_url commits
        const taskId = assemblyTaskIdRef.current;
        const primaryCompletedNoUrl = (jobStatus === 'completed' || jobStatus === 'done' || jobStatus === 'finished') && !data?.job?.outputUrl;
        if (taskId && (pollNoProgressCountRef.current >= 1 || primaryCompletedNoUrl)) {
          console.log(`[EP04 Poll] ⚠️ castJobId stuck (${pollNoProgressCountRef.current} polls, 0%). Falling back to projectId=${taskId}`);
          const { data: fallbackData, error: fbError } = await supabase.functions.invoke('genie-cast-status', {
            body: { projectId: taskId },
          });
          console.log(`[EP04 Poll Fallback] projectId=${taskId}, FULL response:`, JSON.stringify(fallbackData));
          if (!fbError && fallbackData) {
            // projectId path returns { success, status, videoUrl, thumbnailUrl, progress, error }
            resolvedStatus = fallbackData.status;
            resolvedVideoUrl = fallbackData.videoUrl;
            resolvedThumbnailUrl = fallbackData.thumbnailUrl;
            resolvedProgress = fallbackData.progress || 0;
            resolvedError = fallbackData.error;
            console.log(`[EP04 Poll Fallback] Resolved: status=${resolvedStatus}, videoUrl=${resolvedVideoUrl ? 'YES' : 'NO'}, progress=${resolvedProgress}`);
          }
        }

        // Use fallback results if available, otherwise use primary
        const finalStatus = resolvedStatus || jobStatus;
        const finalVideoUrl = resolvedVideoUrl || data?.job?.outputUrl;
        const finalProgress = resolvedProgress || jobProgress;
        const finalError = resolvedError || data?.job?.errorMessage;

        if (fnError && !resolvedStatus) {
          pollErrorCountRef.current++;
          console.error(`[EP04 Assembly] Poll error ${pollErrorCountRef.current}/${MAX_ERRORS}:`, fnError);
          if (pollErrorCountRef.current >= MAX_ERRORS) {
            setAssemblyProgress(null);
            setAssemblyJobId(null);
            assemblyTaskIdRef.current = null;
            toast.error('Assembly polling failed repeatedly — check console');
          }
          return;
        }
        pollErrorCountRef.current = 0; // reset on success

        // Check if cancelled while we were polling (in-flight abort)
        if (assemblyCancelledRef.current) return;

        if (finalStatus === 'completed' || finalStatus === 'done' || finalStatus === 'finished') {
          // Safety: if "completed" but no video URL, keep polling — the URL hasn't propagated yet
          if (!finalVideoUrl) {
            console.warn(`[EP04 Poll] Status=${finalStatus} but NO videoUrl — keep polling (poll ${pollCountRef.current})`);
            const curPartNum0 = pollDepsRef.current.activePartNumber;
            const partLabel0 = curPartNum0 != null ? ` Part ${curPartNum0}` : '';
            setAssemblyProgress(`Completed but waiting for URL${partLabel0}... (poll ${pollCountRef.current})`);
            return; // don't finalize — next poll should get the URL
          }

          setAssemblyJobId(null);
          setAssemblyProgress(null);
          assemblyTaskIdRef.current = null;
          pollNoProgressCountRef.current = 0;

          // Read latest deps from ref (avoids stale closures AND prevents effect restarts)
          const { activePartNumber: curPartNum, projectId: curProjId, totalDuration: curDuration, scenes: curScenes, updateFinalAssembly: curUpdateFinal } = pollDepsRef.current;

          // If this was a multi-part assembly, update the specific part
          if (curPartNum != null) {
            setAssemblyParts(prev => prev.map(p =>
              p.partNumber === curPartNum
                ? { ...p, status: 'completed', videoUrl: finalVideoUrl }
                : p
            ));
            setActivePartNumber(null);
            toast.success(`Part ${curPartNum} assembled! Video: ${finalVideoUrl?.substring(0, 60)}...`);

            // Check if ALL parts are done
            setAssemblyParts(prev => {
              const allDone = prev.every(p =>
                p.partNumber === curPartNum ? true : p.status === 'completed'
              );
              if (allDone) {
                setProductionPhase('complete');
                toast.success('All parts assembled! Ready for concatenation.');
              }
              return prev;
            });
          } else {
            // Full (non-part) assembly completed
            setFinalVideoUrl(finalVideoUrl);
            setProductionPhase('complete');
            if (curProjId && finalVideoUrl) {
              curUpdateFinal(curProjId, finalVideoUrl, {
                totalDuration: curDuration,
                sceneCount: Array.from(curScenes.keys()).length,
                resolution: '1920x1080',
              });
            }
            toast.success('Cinematic movie assembled successfully!');
          }
        } else if (finalStatus === 'failed' || finalStatus === 'error' || finalStatus === 'cancelled') {
          const errMsg = finalError || 'Unknown error';
          setAssemblyProgress(null);
          setAssemblyJobId(null);
          assemblyTaskIdRef.current = null;
          const curPartNum2 = pollDepsRef.current.activePartNumber;
          if (curPartNum2 != null) {
            setAssemblyParts(prev => prev.map(p =>
              p.partNumber === curPartNum2
                ? { ...p, status: 'failed', errorMessage: errMsg }
                : p
            ));
            setActivePartNumber(null);
          }
          toast.error(`Assembly failed: ${errMsg}`);
        } else {
          const curPartNum3 = pollDepsRef.current.activePartNumber;
          const partLabel = curPartNum3 != null ? ` Part ${curPartNum3}` : '';
          const elapsedMin = Math.round(pollCountRef.current * 10 / 60);
          setAssemblyProgress(`Rendering${partLabel}... ${finalProgress}% (${elapsedMin}min elapsed, poll ${pollCountRef.current})`);
        }
      } catch (err) {
        pollErrorCountRef.current++;
        console.error(`[EP04 Assembly] Poll exception ${pollErrorCountRef.current}/${MAX_ERRORS}:`, err);
        if (pollErrorCountRef.current >= MAX_ERRORS) {
          setAssemblyProgress(null);
          setAssemblyJobId(null);
          assemblyTaskIdRef.current = null;
          toast.error('Assembly polling failed — check network/console');
        }
      }
    };

    // Fire immediately (don't wait 10s for first poll)
    doPoll();
    const timer = setInterval(doPoll, 10000); // Then every 10 seconds
    return () => { clearInterval(timer); assemblyCancelledRef.current = true; };
  }, [assemblyJobId]); // Only re-trigger on job ID change — other deps read from pollDepsRef

  // ── Per-Scene Parallel Polling: poll ALL parts with status='rendering' ──
  // Track per-part stuck polls (no progress via castJobId → fallback to taskId)
  const perSceneStuckCountsRef = React.useRef<Record<number, number>>({});

  useEffect(() => {
    if (!perScenePolling) return;
    const renderingParts = assemblyParts.filter(p => p.status === 'rendering' && (p.jobId || p.taskId));
    if (renderingParts.length === 0) {
      setPerScenePolling(false);
      const completedCount = assemblyParts.filter(p => p.status === 'completed').length;
      if (completedCount === assemblyParts.length && assemblyParts.length > 0) {
        toast.success(`All ${completedCount} scenes assembled!`);
        setAssemblyProgress(null);
      }
      return;
    }

    setAssemblyProgress(`Rendering ${renderingParts.length} scenes in parallel... (poll ${perScenePollCountRef.current})`);

    const timer = setInterval(async () => {
      perScenePollCountRef.current++;

      // Global timeout: 40 polls × 15s = 10 minutes
      if (perScenePollCountRef.current > 40) {
        setPerScenePolling(false);
        setAssemblyProgress(null);
        setAssemblyParts(prev => prev.map(p =>
          p.status === 'rendering' ? { ...p, status: 'failed', errorMessage: 'Polling timed out after 10 minutes' } : p
        ));
        toast.error('Per-scene polling timed out after 10 minutes');
        return;
      }

      for (const part of renderingParts) {
        try {
          let resolvedStatus: string | undefined;
          let resolvedVideoUrl: string | undefined;
          let resolvedError: string | undefined;

          // Always increment stuck counter — reset ONLY on real progress
          const prevStuck = perSceneStuckCountsRef.current[part.partNumber] || 0;
          let newStuck = prevStuck + 1; // assume stuck, reset below if progress

          // Primary: poll via castJobId (DB → provider_job_id → JSON2Video)
          if (part.jobId) {
            try {
              const { data, error: fnError } = await supabase.functions.invoke('genie-cast-status', {
                body: { castJobId: part.jobId },
              });
              console.log(`[EP04 PerScene Poll #${perScenePollCountRef.current}] part=${part.partNumber}, castJobId=${part.jobId}, response:`, JSON.stringify(data)?.substring(0, 200));

              if (fnError) {
                console.warn(`[EP04 PerScene] Edge fn error for part ${part.partNumber}:`, fnError);
                // fnError = stuck poll (counter keeps incrementing)
              } else if (data?.success === false && data?.error) {
                // Edge function returned { success: false, error: '...' }
                resolvedStatus = 'failed';
                resolvedError = data.error;
              } else if (data?.job) {
                const jobStatus = data.job.status;
                const jobProgress = data.job.progressPercent || 0;

                if (jobStatus === 'completed' || jobStatus === 'done' || jobStatus === 'finished') {
                  resolvedStatus = 'completed';
                  resolvedVideoUrl = data.job.outputUrl;
                } else if (jobStatus === 'failed' || jobStatus === 'error' || jobStatus === 'cancelled') {
                  resolvedStatus = 'failed';
                  resolvedError = data.job.errorMessage || 'Render failed';
                } else if (jobProgress > 0) {
                  newStuck = 0; // real progress — reset stuck counter
                }
                // else: jobProgress === 0 → stuck counter stays incremented
              }
            } catch (castPollErr) {
              console.warn(`[EP04 PerScene] castJobId poll threw for part ${part.partNumber}:`, castPollErr);
              // stuck counter increments (network error = stuck)
            }
          }

          // Fallback: if stuck for 1+ polls, immediately try direct projectId polling
          // Don't wait 3 polls (45s) — JSON2Video renders take 3-5 min, start fallback ASAP
          const stuckCount = resolvedStatus ? 0 : newStuck;
          if (!resolvedStatus && part.taskId && (stuckCount >= 1 || !part.jobId)) {
            console.log(`[EP04 PerScene] Part ${part.partNumber}: fallback to taskId=${part.taskId} (stuck=${stuckCount})`);
            try {
              const { data: fbData, error: fbError } = await supabase.functions.invoke('genie-cast-status', {
                body: { projectId: part.taskId },
              });
              console.log(`[EP04 PerScene Fallback] part=${part.partNumber}, taskId=${part.taskId}, response:`, JSON.stringify(fbData)?.substring(0, 200));
              if (fbError) {
                console.warn(`[EP04 PerScene] Fallback edge fn error for part ${part.partNumber}:`, fbError);
              } else if (fbData) {
                if (fbData.status === 'completed' || fbData.status === 'done' || fbData.status === 'finished') {
                  resolvedStatus = 'completed';
                  resolvedVideoUrl = fbData.videoUrl;
                } else if (fbData.status === 'failed' || fbData.status === 'error') {
                  resolvedStatus = 'failed';
                  resolvedError = fbData.error || 'Render failed';
                }
              }
            } catch (fbPollErr) {
              console.warn(`[EP04 PerScene] Fallback poll threw for part ${part.partNumber}:`, fbPollErr);
            }
          }

          // Per-part timeout: if stuck for 20+ consecutive polls (~5 min), give up
          // JSON2Video renders typically take 3-5 min — 8 polls (2 min) was too short
          if (!resolvedStatus && stuckCount >= 20) {
            resolvedStatus = 'failed';
            resolvedError = `Part stuck for ${stuckCount} consecutive polls (~5 min) — marking as failed`;
            console.warn(`[EP04 PerScene] Part ${part.partNumber} timed out after ${stuckCount} stuck polls`);
          }

          // Update stuck counter
          perSceneStuckCountsRef.current[part.partNumber] = resolvedStatus ? 0 : newStuck;

          // Apply resolved status
          if (resolvedStatus === 'completed') {
            setAssemblyParts(prev => prev.map(p =>
              p.partNumber === part.partNumber ? { ...p, status: 'completed', videoUrl: resolvedVideoUrl || null } : p
            ));
            toast.success(`Scene ${part.partNumber} (${part.sceneKeys[0]}) assembled! URL: ${resolvedVideoUrl?.substring(0, 60)}...`);
          } else if (resolvedStatus === 'failed') {
            setAssemblyParts(prev => prev.map(p =>
              p.partNumber === part.partNumber ? { ...p, status: 'failed', errorMessage: resolvedError } : p
            ));
            toast.error(`Scene ${part.partNumber} failed: ${resolvedError}`);
          }
        } catch (err) {
          // Outer catch: increment stuck counter even on unexpected errors
          const s = (perSceneStuckCountsRef.current[part.partNumber] || 0) + 1;
          perSceneStuckCountsRef.current[part.partNumber] = s;
          console.error(`[EP04 PerScene] Poll error for part ${part.partNumber} (stuck=${s}):`, err);
          if (s >= 8) {
            setAssemblyParts(prev => prev.map(p =>
              p.partNumber === part.partNumber ? { ...p, status: 'failed', errorMessage: `Poll error after ${s} attempts` } : p
            ));
            toast.error(`Scene ${part.partNumber} failed after ${s} poll errors`);
          }
        }
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(timer);
  }, [perScenePolling, assemblyParts]);

  // ─── Assembly Constants ─────────────────────────────────────────────────
  // Map storybook transition styles to JSON2Video scene transition presets
  const TRANSITION_STYLE_MAP: Record<string, string> = {
    'page-turn': 'wipeleft',
    'iris-wipe': 'circleopen',
    'scroll-unroll': 'slideup',
    'storybook-flip': 'wiperight',
    'dissolve-morph': 'dissolve',
    'chapter-card': 'fade',
  };

  // Character info for lower-third speaker identification
  // Only "cast" characters get lower-thirds — narrators (host, allaudin) don't need them
  // since their voice is constant throughout the documentary.
  const CHARACTER_LOWER_THIRDS: Record<string, { headline: string; lead: string; barColor: string }> = {
    atlas: { headline: 'ATLAS', lead: 'Claude Code — Backend Engineer', barColor: '#6366f1' },
    nova: { headline: 'NOVA', lead: 'Lovable — Frontend Developer', barColor: '#10b981' },
    squirrel: { headline: 'SQUIRREL', lead: 'QA Chaos Agent', barColor: '#f97316' },
  };

  // ─── OLD buildJson2VideoTimeline DELETED ─────────────────────────────────
  // Replaced by castTimelineEngine.ts — professional per-TTS-line scene architecture.
  // See buildCastTimeline() in src/utils/castTimelineEngine.ts.
  // ── Core assembly function: builds timeline for a subset of scenes ──
  // partNumber=null means full assembly (for plans with higher limits)
  // partNumber=1..N means assemble only that part's scenes
  const startFinalAssembly = useCallback(async (partNumber?: number) => {
    // Step 0: Run readiness audit
    const readiness = getAssemblyReadiness();
    setAssemblyReadiness(readiness);

    if (!readiness.canAssemble) {
      const missingScenes = readiness.scenes.filter(s => s.missing.length > 0);
      const summary = missingScenes.map(s => `${s.title}: ${s.missing.join(', ')}`).join('; ');
      toast.error(`Cannot assemble — missing assets: ${summary}`);
      return;
    }

    // Determine which scenes to include
    const allSceneKeys = Array.from(scenes.keys());
    let targetSceneKeys: string[];
    // Use assemblyParts state (from per-scene or multi-part mode), fallback to computePartBoundaries
    let parts = assemblyParts.length > 0 ? assemblyParts : computePartBoundaries();

    if (partNumber != null) {
      const part = parts.find(p => p.partNumber === partNumber);
      if (!part) {
        toast.error(`Part ${partNumber} not found in ${parts.length}-part list`);
        return;
      }
      targetSceneKeys = part.sceneKeys;
      setActivePartNumber(partNumber);
      // Update part status
      setAssemblyParts(prev => prev.map(p =>
        p.partNumber === partNumber ? { ...p, status: 'rendering' } : p
      ));
    } else {
      targetSceneKeys = allSceneKeys;
    }

    const isFirstPart = partNumber == null || partNumber === 1;
    const isLastPart = partNumber == null || partNumber === parts.length;
    const partLabel = partNumber != null ? ` (Part ${partNumber}/${parts.length})` : '';

    setProductionPhase('assembly');
    setAssemblyProgress(`Building timeline${partLabel}...`);

    try {
      // ── Build layered ChapterResult objects per scene ──
      // When a scene is split into sub-parts, each sub-part only processes its
      // slice of TTS lines and gets proportional visuals. This keeps lipsync
      // aligned (cumulativeStart resets per sub-part) and prevents timeline gaps.
      const currentPart = partNumber != null ? parts.find(p => p.partNumber === partNumber) : null;
      const lineRange = currentPart?._subPartLineRange;

      const preBuiltChapters = targetSceneKeys.map(sceneKey => {
        const status = sceneProduction[sceneKey] || defaultSceneStatus();
        const sceneTitle = SCENE_TITLES[sceneKey] || sceneKey;

        // Filter scene lines to sub-part range if applicable
        const allSceneLines = scriptKeys.filter(k => scriptContentForUI[k]?.scene === sceneKey);
        const sceneLines = lineRange
          ? allSceneLines.slice(lineRange.start, lineRange.end)
          : allSceneLines;
        let cumulativeStart = 0;
        const allTtsUrls: Array<{ url: string; start: number; duration: number; voice: string; key: string }> = [];

        // Buffer between TTS lines to prevent voice overlap.
        // duration_est is an estimate (~150 wpm); actual TTS audio may run longer.
        // 1.5s gap ensures host/nova/atlas voices don't overlap.
        const TTS_GAP = 1.5;

        let dataUriTtsCount = 0;
        for (const k of sceneLines) {
          const line = scriptContentForUI[k];
          const estDur = line?.duration_est || 5;
          const actualDur = audioMap[k]?.audioDuration;
          // Prefer actual measured duration; fall back to estimate + 1s buffer
          const dur = actualDur ? actualDur : estDur + 1;
          const audioUrl = audioMap[k]?.audioUrl;
          if (audioUrl) {
            if (audioUrl.startsWith('http')) {
              allTtsUrls.push({
                url: audioUrl,
                start: cumulativeStart,
                duration: dur,
                voice: line?.voice || 'unknown',
                key: k,
              });
            } else {
              // data: URI — will be filtered by castTimelineEngine (only HTTP URLs pass), warn user
              dataUriTtsCount++;
            }
          }
          cumulativeStart += dur + TTS_GAP;
        }
        if (dataUriTtsCount > 0) {
          console.warn(`[EP04 Assembly] ${sceneKey}: ${dataUriTtsCount} TTS lines have data: URIs (not uploaded to Storage) — these will be SILENT in the video`);
        }

        const sceneDuration = cumulativeStart || 30;

        // Background visuals: ALL scene videos (play sequentially) + images (Ken Burns).
        // Lipsync MP4s are handled separately below (aligned to TTS timing).
        const isHttpUrl = (u: string) => u && u.startsWith('http');
        // Include all HTTP URLs for assembly — freshly regenerated CDN URLs are valid (~24h TTL).
        // isExpiredCdnUrl is pattern-based (matches all Alibaba/DashScope URLs) and can't tell
        // fresh from expired. JSON2Video will fetch during render; fresh URLs will work fine.
        const isSafeUrl = (u: string) => isHttpUrl(u);

        // Collect all scene images — from imageUrls + avatarUrls buckets (trust the source bucket)
        const allImageVisuals: string[] = [
          ...Object.values(status.imageUrls || {}).filter(isSafeUrl),
          ...Object.values(status.avatarUrls || {}).filter(isSafeUrl),
        ];

        // Collect all non-lipsync scene videos — from videoUrls bucket (trust the source bucket)
        const lipsyncSet = new Set(Object.values(status.lipsyncUrls || {}));
        const allSceneVideos: string[] = Object.values(status.videoUrls || {})
          .filter(isSafeUrl)
          .filter(u => !lipsyncSet.has(u));

        // ── Detailed asset audit per scene ──
        const shortUrl = (u: string) => u ? `${u.substring(0, 60)}...` : '(empty)';
        console.log(`[EP04 Assets] ${sceneKey}:`);
        console.log(`  📹 Videos (${Object.keys(status.videoUrls || {}).length} total, ${allSceneVideos.length} for bg):`);
        Object.entries(status.videoUrls || {}).forEach(([k, u]) => {
          const isLipsync = lipsyncSet.has(u);
          console.log(`    ${isLipsync ? '🔇' : '✅'} ${k}: ${shortUrl(u)} ${isLipsync ? '(lipsync—separate)' : ''} ${!isHttpUrl(u) ? '⚠️ NOT HTTP' : ''}`);
        });
        console.log(`  🖼️ Images (${Object.keys(status.imageUrls || {}).length}):`);
        Object.entries(status.imageUrls || {}).forEach(([k, u]) => {
          console.log(`    ${isSafeUrl(u) ? '✅' : '❌'} ${k}: ${shortUrl(u)}`);
        });
        console.log(`  👤 Avatars (${Object.keys(status.avatarUrls || {}).length}):`);
        Object.entries(status.avatarUrls || {}).forEach(([k, u]) => {
          console.log(`    ${isSafeUrl(u) ? '✅' : '❌'} ${k}: ${shortUrl(u)}`);
        });
        console.log(`  🎤 Lipsync (${Object.keys(status.lipsyncUrls || {}).length}):`);
        Object.entries(status.lipsyncUrls || {}).forEach(([k, u]) => {
          console.log(`    ${isHttpUrl(u) ? '✅' : '❌'} ${k}: ${shortUrl(u)}`);
        });
        console.log(`  🎵 Music: ${status.musicUrl ? shortUrl(status.musicUrl) : '(none)'}`);
        console.log(`  🔊 SFX: ${(status.sfxUrls || []).length} clips`);
        (status.sfxUrls || []).forEach((u, i) => u && console.log(`    ${i}: ${shortUrl(u)}`));
        // Pipeline steps summary (kinetic-text, transitions, etc.)
        const pipelineSceneKeyAudit = SCRIPT_TO_PIPELINE_MAP[sceneKey] || sceneKey;
        const configPipelineAudit = EP04_SCENE_PIPELINES[pipelineSceneKeyAudit as keyof typeof EP04_SCENE_PIPELINES];
        const stepsAudit = Array.isArray(configPipelineAudit) ? configPipelineAudit : [];
        const stepTypes = stepsAudit.map((s: any) => `${s.type}${s.character ? `(${s.character})` : ''}${s.scriptKey ? `[${s.scriptKey}]` : ''}${s.text ? `:"${s.text.substring(0, 30)}"` : ''}`);
        console.log(`  📋 Pipeline steps (${stepsAudit.length}): ${stepTypes.join(', ')}`);

        // For sub-parts: distribute visuals proportionally across sub-parts.
        // First sub-part gets the first N videos, second gets next N, etc.
        // Images are distributed evenly across all sub-parts.
        let sceneVideos = allSceneVideos;
        let imageVisuals = allImageVisuals;
        if (lineRange && allSceneLines.length > 0) {
          const subPartFraction = (lineRange.end - lineRange.start) / allSceneLines.length;
          const subPartIndex = Math.floor(lineRange.start / (lineRange.end - lineRange.start || 1));
          const totalSubParts = Math.ceil(allSceneLines.length / (lineRange.end - lineRange.start));

          // Distribute videos: sub-part N gets video N (if available)
          const videosPerPart = Math.max(1, Math.ceil(allSceneVideos.length / totalSubParts));
          const videoStart = subPartIndex * videosPerPart;
          sceneVideos = allSceneVideos.slice(videoStart, videoStart + videosPerPart);

          // Distribute images proportionally
          const imagesPerPart = Math.max(1, Math.ceil(allImageVisuals.length / totalSubParts));
          const imgStart = subPartIndex * imagesPerPart;
          imageVisuals = allImageVisuals.slice(imgStart, imgStart + imagesPerPart);
        }

        // Videos first (play sequentially), then images fill remaining time
        const allVisualUrls: string[] = [
          ...sceneVideos,
          ...imageVisuals,
          // lipsyncUrls handled separately as overlay clips below
        ];

        // Lipsync clips: short MP4 videos (<18s) aligned to their specific TTS line.
        // Keys are like "avatar-lipsync-host-title-welcome" or "avatar-lipsync-atlas".
        // Extract character name + optional scriptKey to match the correct TTS entry.
        // Each lipsync was generated from a SPECIFIC TTS line's audio (via Alibaba wan2.2-s2v),
        // so we must align it to THAT exact TTS entry's start time.
        const KNOWN_CHARACTERS = ['host', 'atlas', 'nova', 'squirrel', 'allaudin'];
        const lipsyncClips: Array<{ url: string; start: number; duration: number; character: string }> = [];
        if (status?.lipsyncUrls) {
          for (const [lipsyncKey, url] of Object.entries(status.lipsyncUrls)) {
            if (!url || !isHttpUrl(url)) continue;

            // Extract character name from key: "avatar-lipsync-host-title-welcome" → "host"
            const charMatch = KNOWN_CHARACTERS.find(c => lipsyncKey.includes(c));
            if (!charMatch) continue;

            // Extract scriptKey (everything after character name): "avatar-lipsync-host-title-welcome" → "title-welcome"
            const charIdx = lipsyncKey.indexOf(charMatch);
            const afterChar = lipsyncKey.substring(charIdx + charMatch.length + 1); // skip the "-" after character
            const scriptKey = afterChar || null;

            // Match to the specific TTS line:
            // 1. If scriptKey exists, find TTS with matching key (exact alignment)
            // 2. Otherwise, find first TTS line for this character (fallback)
            let charTts = scriptKey
              ? allTtsUrls.find(t => t.voice === charMatch && t.key === scriptKey)
              : null;
            if (!charTts) {
              charTts = allTtsUrls.find(t => t.voice === charMatch);
            }

            if (charTts) {
              // Use lipsync clip for up to 18s; if TTS is longer, the remaining
              // audio plays as voiceover over background visuals (handled by TTS layer).
              // Safety trim: subtract 1s from clip to cut before WAN2.2 loop artifacts
              // (WAN2.2 sometimes repeats the last word/phrase at the end of generated video).
              const LIPSYNC_SAFETY_TRIM = 1;
              const rawClip = Math.min(charTts.duration, LIPSYNC_MAX_DURATION);
              const clipDuration = Math.max(rawClip - LIPSYNC_SAFETY_TRIM, 2); // min 2s clip
              lipsyncClips.push({
                url,
                start: charTts.start,
                duration: clipDuration,
                character: charMatch,
              });
              if (charTts.duration > LIPSYNC_MAX_DURATION) {
                console.log(`[EP04 Assembly] Lipsync: "${charMatch}" (key: ${lipsyncKey}) → TTS "${charTts.key}" at t=${charTts.start}s (clip=${clipDuration}s, voiceover for remaining ${(charTts.duration - clipDuration).toFixed(1)}s)`);
              } else {
                console.log(`[EP04 Assembly] Lipsync: "${charMatch}" (key: ${lipsyncKey}) → TTS "${charTts.key}" at t=${charTts.start}s (clip=${clipDuration}s, trimmed ${LIPSYNC_SAFETY_TRIM}s for clean end)`);
              }
            } else {
              console.warn(`[EP04 Assembly] Lipsync: "${charMatch}" (key: ${lipsyncKey}) — no matching TTS found in scene`);
            }
          }
        }

        const pipelineSceneKey = SCRIPT_TO_PIPELINE_MAP[sceneKey] || sceneKey;
        const pipeline = EP04_SCENE_PIPELINES[pipelineSceneKey as keyof typeof EP04_SCENE_PIPELINES];
        const pipelineSteps = Array.isArray(pipeline) ? pipeline : [];
        const musicStep = pipelineSteps.find(s => s.type === 'music') as { type: 'music'; duration: number } | undefined;
        const musicDuration = musicStep?.duration || 30;
        const musicLoop = status.musicUrl ? musicDuration < sceneDuration : false;

        // ── Extract kinetic texts from pipeline config with computed timestamps ──
        // Walk pipeline steps: when we hit a kinetic-text, use the preceding TTS line's
        // start time + 2s offset to place it at the right narrative moment.
        const kineticTexts: Array<{ text: string; start: number; duration: number; style: string }> = [];
        let lastPipelineTtsStart = 0;
        for (const step of pipelineSteps) {
          if (step.type === 'tts') {
            const ttsEntry = allTtsUrls.find(t => t.key === (step as any).scriptKey);
            if (ttsEntry) lastPipelineTtsStart = ttsEntry.start;
          } else if (step.type === 'kinetic-text') {
            const text = (step as any).text as string;
            const ktStart = lastPipelineTtsStart > 0
              ? Math.min(lastPipelineTtsStart + 2, sceneDuration - 7)
              : 5;
            // Impact texts (short, dramatic) get jumping style; longer ones get word-by-word
            const isImpact = text.length < 80 && (
              text.includes('→') || text.includes('NOBODY') || text.includes('tasks.') ||
              text.includes('PROVIDERS') || text.includes('LANGUAGES') || text.includes('SCREENS')
            );
            kineticTexts.push({
              text,
              start: Math.max(0, ktStart),
              duration: 6,
              style: isImpact ? '005' : '003',
            });
          }
        }

        // ── Compute SFX timings aligned to TTS narrative beats ──
        const sfxRawUrls = status.sfxUrls || [];
        const sfxTimings: Array<{ url: string; start: number; duration: number }> = [];
        const musicScoreKey = pipelineSceneKey as keyof typeof EP04_MUSIC_SCORE;
        const scoreSfx = EP04_MUSIC_SCORE[musicScoreKey]?.sfx || [];
        if (sfxRawUrls.length > 0) {
          const ttsStarts = allTtsUrls.map(t => t.start);
          sfxRawUrls.forEach((sfxUrl, sfxIdx) => {
            if (!sfxUrl || !sfxUrl.startsWith('http')) return;
            let sfxStart = 0;
            const sfxDuration = scoreSfx[sfxIdx]?.duration || 3;
            if (sfxIdx === 0) {
              sfxStart = 0; // First SFX at scene start
            } else if (ttsStarts.length > 1) {
              // Distribute across TTS line boundaries
              const ttsSlotIdx = Math.min(
                Math.floor((sfxIdx / sfxRawUrls.length) * ttsStarts.length),
                ttsStarts.length - 1
              );
              sfxStart = ttsStarts[ttsSlotIdx];
            } else {
              sfxStart = Math.floor(sceneDuration * sfxIdx / sfxRawUrls.length);
            }
            sfxTimings.push({ url: sfxUrl, start: sfxStart, duration: sfxDuration });
          });
        }

        return {
          chapterId: sceneKey,
          product: sceneTitle,
          audioUrl: allTtsUrls[0]?.url || undefined,
          visualUrl: allVisualUrls[0] || undefined,
          visualUrls: allVisualUrls,
          sceneVideos,    // pre-separated: guaranteed video URLs from videoUrls bucket
          sceneImages: imageVisuals, // pre-separated: guaranteed image URLs from imageUrls/avatarUrls buckets
          lipsyncClips,
          duration: sceneDuration,
          ttsProvider: 'pre-generated',
          videoProvider: 'pre-generated',
          success: true,
          allTtsUrls,
          musicUrl: status.musicUrl || undefined,
          _musicUrlFormat: status.musicUrl ? (status.musicUrl.startsWith('http') ? 'http' : status.musicUrl.substring(0, 30)) : 'none',
          musicLoop,
          musicDuration,
          sfxUrls: sfxRawUrls,
          kineticTexts,
          sfxTimings,
        };
      });

      // ── Include transitions — between scenes WITHIN this part, OR trailing transition after last scene ──
      // For per-scene mode (1 scene per part), include the transition AFTER that scene
      // so bridge narrator TTS and chapter titles are in the final assembly.
      const targetSceneIndices = new Set(targetSceneKeys.map(k => k.match(/scene-(\d+)/)?.[1]).filter(Boolean));
      const getSceneIndex = (key: string) => key.match(/scene-(\d+)/)?.[1];
      const isPerSceneMode = targetSceneKeys.length === 1;
      const transitions = EP04_STORYBOOK_TRANSITIONS
        .filter(t => {
          const fromIdx = getSceneIndex(t.from);
          const toIdx = getSceneIndex(t.to);
          if (!fromIdx || !toIdx) return false;
          // Multi-part: both from and to must be in this part
          if (!isPerSceneMode) return targetSceneIndices.has(fromIdx) && targetSceneIndices.has(toIdx);
          // Per-scene: include transition that starts from this scene (trailing transition)
          return targetSceneIndices.has(fromIdx);
        })
        .map(t => ({
          from: t.from,
          to: t.to,
          style: t.style,
          duration: t.steps.reduce((sum, s) => sum + ('duration' in s ? (s as any).duration : 3), 0),
          bridgeKey: `bridge-${t.from.replace('scene-', '').split('-')[0]}-to-${t.to.replace('scene-', '').split('-')[0]}`,
        })).map(t => {
          const bridgeAudio = audioMap[t.bridgeKey]?.audioUrl;
          const bridgeLine = EP04_NARRATOR_BRIDGES[t.bridgeKey];
          // Find next scene's visual for transition background (not black screen)
          const toSceneIdx = getSceneIndex(t.to);
          const toSceneKey = toSceneIdx ? targetSceneKeys.find(k => getSceneIndex(k) === toSceneIdx) : undefined;
          const toChapter = toSceneKey ? preBuiltChapters.find(c => c.chapterId === toSceneKey) : undefined;
          // Fallback: use current (source) chapter's image if next chapter not yet generated
          const fromSceneIdx = getSceneIndex(t.from);
          const fromSceneKey = fromSceneIdx ? targetSceneKeys.find(k => getSceneIndex(k) === fromSceneIdx) : undefined;
          const fromChapter = fromSceneKey ? preBuiltChapters.find(c => c.chapterId === fromSceneKey) : undefined;
          return {
            ...t,
            // Bridge audio is NOT passed to transition — bridge TTS already has its own
            // scene in the chapter (via TRANSITION_TO_SCENE remapping). Passing it here
            // would cause the bridge audio to play TWICE (in the TTS scene + transition).
            bridgeAudioUrl: undefined,
            bridgeDuration: bridgeLine?.duration_est || 7,
            nextSceneVisualUrl: (toChapter as any)?.sceneImages?.[0] || (fromChapter as any)?.sceneImages?.[0] || undefined,
            j2vTransition: TRANSITION_STYLE_MAP[t.style] || 'fade',
          };
        });

      // ── Bookend data: opening only for first part, closing only for last ──
      // Use scene visuals as bookend backgrounds for professional look (LinkedIn/X publishing)
      // Use images (not videos) for bookend backgrounds — JSON2Video requires image type
      const firstChapterVisual = (preBuiltChapters[0] as any)?.sceneImages?.[0] || preBuiltChapters[0]?.visualUrls?.find((u: string) => u.match(/\.(png|jpg|jpeg|webp|gif)(\?|$)/i));
      const lastChapterVisual = (preBuiltChapters[preBuiltChapters.length - 1] as any)?.sceneImages?.[0] || preBuiltChapters[preBuiltChapters.length - 1]?.visualUrls?.find((u: string) => u.match(/\.(png|jpg|jpeg|webp|gif)(\?|$)/i));
      const bookends = {
        opening: { duration: isFirstPart ? 12 : 0, hasAssets: isFirstPart, backgroundUrl: firstChapterVisual },
        closing: { duration: isLastPart ? 10 : 0, hasAssets: isLastPart, backgroundUrl: lastChapterVisual },
      };

      const partDuration = preBuiltChapters.reduce((s, c) => s + c.duration, 0)
        + transitions.reduce((s, t) => s + t.duration, 0)
        + bookends.opening.duration + bookends.closing.duration;

      console.log(`[EP04 Assembly${partLabel}] ${preBuiltChapters.length} chapters:`, preBuiltChapters.map(c => {
        const hasEstablishing = ((c as any).sceneVideos || []).length > 0;
        const imgCount = ((c as any).sceneImages || []).length;
        return `${c.chapterId}: ${c.allTtsUrls.length} TTS, ${imgCount} img, ${hasEstablishing ? '1 establishing-shot' : 'no vid'}, ${c.lipsyncClips?.length || 0} lipsync, ${c.kineticTexts?.length || 0} kinetic, ${c.sfxTimings?.length || 0} sfx, music=${!!c.musicUrl}(${(c as any)._musicUrlFormat})(loop=${c.musicLoop}), dur=${c.duration}s`;
      }));
      console.log(`[EP04 Assembly${partLabel}] ${transitions.length} transitions (${transitions.filter(t => t.nextSceneVisualUrl).length} with visuals), duration: ${Math.round(partDuration / 60)}min (${partDuration}s)`);

      // ── Pre-assembly: upload any data: URI music to Storage ──
      // Music generated before Storage upload fix may be stored as data: URIs.
      // JSON2Video needs HTTP URLs, so upload them to Supabase Storage first.
      for (const chapter of preBuiltChapters) {
        if (chapter.musicUrl && !chapter.musicUrl.startsWith('http')) {
          console.log(`[EP04 Assembly${partLabel}] Uploading data: URI music for ${chapter.chapterId} to Storage...`);
          try {
            const httpUrl = await uploadTtsToStorage(projectId || 'unknown', `music-${chapter.chapterId}`, chapter.musicUrl.split(',')[1] || '');
            chapter.musicUrl = httpUrl;
            console.log(`[EP04 Assembly${partLabel}] Music uploaded: ${httpUrl.substring(0, 80)}`);
          } catch (uploadErr) {
            console.warn(`[EP04 Assembly${partLabel}] Music upload failed for ${chapter.chapterId}, skipping music:`, uploadErr);
            chapter.musicUrl = undefined;
          }
        }
      }

      // Guard: reject if part exceeds plan limit (10 min = 600s for Professional)
      if (partDuration > 600) {
        toast.error(`Part${partLabel} is ${Math.round(partDuration / 60)}min — still exceeds 10-min limit. Split into smaller parts.`);
        setAssemblyProgress(null);
        if (partNumber != null) {
          setAssemblyParts(prev => prev.map(p =>
            p.partNumber === partNumber ? { ...p, status: 'failed', errorMessage: `Duration ${Math.round(partDuration / 60)}min exceeds limit` } : p
          ));
        }
        return;
      }

      // Track the assembly job
      let jobId: string | null = null;
      if (projectId) {
        jobId = await trackGenerationJob({
          projectId, jobType: 'assembly',
          sceneKey: partNumber != null ? `part-${partNumber}` : 'final',
          provider: 'json2video', estimatedTokens: 5000,
        });
      }

      setAssemblyProgress(`Building JSON2Video timeline${partLabel}...`);

      // ── Map EP04 data → generic CastTimeline interfaces ──
      const isSafeUrl = (u: string | undefined | null): u is string => !!u && u.startsWith('http');

      // Helper: normalize scene ID (transitions mix pipeline + script IDs)
      // Always resolve to script ID since sceneProduction is keyed by script IDs
      const toScriptId = (id: string): string => PIPELINE_TO_SCRIPT_MAP[id] || id;

      // ── Collect transition/storybook assets per scene for routing ──
      // scene-transition videos and storybook-frame images should go to transitions,
      // NOT into the B-roll pool
      const transitionAssetsByScene: Record<string, { transitionVideos: string[]; storybookFrames: string[] }> = {};
      // Include all targetSceneKeys PLUS scenes referenced by transitions (the TO scene)
      // In per-scene mode, targetSceneKeys may only have scene-0-title, but the transition
      // points to scene-1-problem — we need its storybook-frame for the chapter header
      const transitionSceneKeys = new Set(targetSceneKeys);
      for (const t of transitions) {
        const toKey = toScriptId(t.to);
        const fromKey = toScriptId(t.from);
        if (!transitionSceneKeys.has(toKey)) transitionSceneKeys.add(toKey);
        if (!transitionSceneKeys.has(fromKey)) transitionSceneKeys.add(fromKey);
      }
      for (const sceneKey of transitionSceneKeys) {
        const status = sceneProduction[sceneKey] || defaultSceneStatus();
        const transitionVideos: string[] = [];
        const storybookFrames: string[] = [];
        // Scene-transition videos from videoUrls
        for (const [key, url] of Object.entries(status.videoUrls || {})) {
          if (isSafeUrl(url) && (key.includes('scene-transition') || key.includes('transition'))) {
            transitionVideos.push(url);
          }
        }
        // Storybook-frame images from imageUrls
        for (const [key, url] of Object.entries(status.imageUrls || {})) {
          if (isSafeUrl(url) && (key.includes('storybook-frame') || key.includes('narrator-scroll'))) {
            storybookFrames.push(url);
          }
        }
        transitionAssetsByScene[sceneKey] = { transitionVideos, storybookFrames };
      }

      const castChapters: CastChapter[] = preBuiltChapters.map(ch => {
        const status = sceneProduction[ch.chapterId] || defaultSceneStatus();
        const sceneTransAssets = transitionAssetsByScene[ch.chapterId];
        const transitionVideoSet = new Set(sceneTransAssets?.transitionVideos || []);
        const storybookFrameSet = new Set(sceneTransAssets?.storybookFrames || []);

        // Separate kinetic text images, storybook frames, and regular images (by key pattern)
        const kineticImageMap: Record<string, string> = {};
        const regularImages: string[] = [];
        for (const [key, url] of Object.entries(status.imageUrls || {})) {
          if (!isSafeUrl(url)) continue;
          if (key.includes('kinetic-text')) {
            kineticImageMap[key] = url;
          } else if (storybookFrameSet.has(url)) {
            // Skip — routed to CastTransition.chapterHeaderImageUrl
          } else {
            regularImages.push(url);
          }
        }
        // Only add avatar static images to B-roll if there's NO lipsync for this scene.
        // When lipsync exists, the avatar video IS the visual — adding the static avatar
        // PNG to the B-roll pool causes it to bleed through behind the lipsync video.
        const hasLipsync = (ch.lipsyncClips || []).length > 0;
        if (!hasLipsync) {
          for (const url of Object.values(status.avatarUrls || {})) {
            if (isSafeUrl(url)) regularImages.push(url);
          }
        }

        // Filter scene-transition videos out of the B-roll video pool
        const sceneVideos: string[] = ((ch as any).sceneVideos || [])
          .filter((u: string) => !transitionVideoSet.has(u));

        // Match kinetic text entries to their FLUX-generated images (by index order)
        const kineticKeys = Object.keys(kineticImageMap).sort();
        const kineticTexts = (ch.kineticTexts || []).map((kt, idx) => ({
          ...kt,
          imageUrl: idx < kineticKeys.length ? kineticImageMap[kineticKeys[idx]] : undefined,
        }));
        return {
          id: ch.chapterId,
          title: ch.product,
          duration: ch.duration,
          ttsLines: ch.allTtsUrls,
          lipsyncClips: ch.lipsyncClips || [],
          videos: sceneVideos,
          images: regularImages,
          musicUrl: ch.musicUrl,
          musicLoop: ch.musicLoop,
          sfxTimings: ch.sfxTimings,
          kineticTexts,
        };
      });

      const castTransitions: CastTransition[] = transitions.map(t => {
        // Normalize transition IDs: transitions mix pipeline + script IDs
        // sceneProduction and SCENE_TITLES are keyed by script IDs
        const fromScriptKey = toScriptId(t.from);
        const toScriptKey = toScriptId(t.to);

        // Derive rich chapter title: "Chapter II — The Cast"
        const toChapterInfo = SCENE_CHAPTERS[toScriptKey];
        const chapterTitle = toChapterInfo
          ? `${toChapterInfo.chapter} — ${toChapterInfo.subtitle}`
          : SCENE_TITLES[toScriptKey] || undefined;

        // Route AI-generated transition visuals:
        // 1. scene-transition videos from the FROM scene (generated as transition-out)
        const fromTransAssets = transitionAssetsByScene[fromScriptKey];
        const transitionVideoUrl = fromTransAssets?.transitionVideos?.[0];
        // 2. storybook-frame images from the TO scene (generated as chapter header)
        const toTransAssets = transitionAssetsByScene[toScriptKey];
        const storybookFrameUrl = toTransAssets?.storybookFrames?.[0];

        // 3. Fallback: first regular image from the TO scene (better than no visual at all)
        const toSceneStatus = sceneProduction[toScriptKey] || defaultSceneStatus();
        const toSceneFirstImage = Object.values(toSceneStatus.imageUrls || {}).find(u => isSafeUrl(u));
        // 4. Last resort: first image from the FROM scene
        const fromSceneStatus = sceneProduction[fromScriptKey] || defaultSceneStatus();
        const fromSceneLastImage = Object.values(fromSceneStatus.imageUrls || {}).find(u => isSafeUrl(u));

        // Best transition visual: prefer AI transition video > storybook frame > next scene image > from scene image
        const transitionImageUrl = transitionVideoUrl || storybookFrameUrl || t.nextSceneVisualUrl || toSceneFirstImage || fromSceneLastImage;

        return {
          from: t.from,
          to: t.to,
          style: t.style,
          duration: t.duration,
          bridgeAudioUrl: t.bridgeAudioUrl,
          bridgeDuration: t.bridgeDuration,
          transitionImageUrl: isSafeUrl(transitionImageUrl) ? transitionImageUrl : undefined,
          chapterHeaderImageUrl: isSafeUrl(storybookFrameUrl) ? storybookFrameUrl : undefined,
          sfxUrl: undefined,
          chapterTitle,
          j2vTransition: t.j2vTransition || 'fade',
        };
      });

      const castBookends: CastBookends = {
        opening: {
          duration: bookends.opening.duration,
          backgroundUrl: (bookends.opening as any).backgroundUrl,
          title: 'Beyond AI Hype',
          subtitle: 'The Real Story of an AI Sprint',
          episodeTag: 'EPISODE 2',
          brand: 'A GenieSuite Documentary',
        },
        closing: {
          duration: bookends.closing.duration,
          backgroundUrl: (bookends.closing as any).backgroundUrl,
        },
      };

      // Build speaker info with avatar URLs for basic/051 lower-thirds
      const castSpeakers: CastSpeakerInfo = Object.fromEntries(
        Object.entries(CHARACTER_LOWER_THIRDS).map(([char, info]) => {
          // Find avatar URL for this character across all scene production statuses
          let avatarUrl: string | undefined;
          for (const ch of castChapters) {
            const status = sceneProduction[ch.id] || defaultSceneStatus();
            const avatarKey = Object.keys(status.avatarUrls || {}).find(k =>
              k.includes(char) || k.includes(`avatar-3d-${char}`)
            );
            if (avatarKey && status.avatarUrls[avatarKey]?.startsWith('http')) {
              avatarUrl = status.avatarUrls[avatarKey];
              break; // use first found
            }
          }
          return [char, { ...info, avatarUrl }];
        })
      );

      const timeline = buildCastTimeline(castChapters, castTransitions, castBookends, castSpeakers, 'production');
      const { _totalDuration: timelineDuration, ...timelinePayload } = timeline;
      console.log(`[EP04 Assembly${partLabel}] Built timeline: ${timelinePayload.scenes.length} scenes, ~${timelineDuration}s, payload: ${(JSON.stringify(timelinePayload).length / 1024).toFixed(0)}kb`);

      setAssemblyProgress(`Submitting timeline${partLabel} to JSON2Video...`);

      const assemblyBody = {
        timeline: timelinePayload,
        castProjectId: projectId,
        language: 'en',
        quality: 'production',
      };
      const payloadSize = JSON.stringify(assemblyBody).length;
      console.log(`[EP04 Assembly${partLabel}] Sending: ${timelinePayload.scenes.length} scenes, ${(payloadSize / 1024).toFixed(0)}KB`);

      // PAYLOAD GUARD: Reject if payload exceeds safe limit (edge fn body limit ~6MB)
      // Typical timeline: 50-200KB. Anything over 600KB likely contains data: URIs that slipped through.
      if (payloadSize > 600 * 1024) {
        const msg = `Payload too large (${(payloadSize / 1024).toFixed(0)}KB > 600KB limit). Likely contains data: URIs — check music/images.`;
        console.error(`[EP04 Assembly${partLabel}] ${msg}`);
        toast.error(msg);
        setAssemblyProgress(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('genie-cast-timeline-submit', {
        body: assemblyBody,
      });

      if (error) {
        let detail = error.message;
        try {
          if (error.context && typeof error.context.text === 'function') {
            const body = await error.context.text();
            console.error(`[EP04 Assembly${partLabel}] Edge function error body:`, body);
            detail = `${error.message} — ${body.substring(0, 500)}`;
          }
        } catch (_) { /* response body may not be readable */ }
        throw new Error(`Assembly edge function error: ${detail}`);
      }

      console.log(`[EP04 Assembly${partLabel}] Response:`, JSON.stringify(data));

      if (data?.generationStatus === 'pending' && (data?.castJobId || data?.taskId)) {
        const pollId = data.castJobId || null;
        // ALWAYS store taskId as fallback for polling (in case provider_job_id update fails in edge fn)
        assemblyTaskIdRef.current = data.taskId || null;
        pollNoProgressCountRef.current = 0;
        if (!pollId) {
          console.warn(`[EP04 Assembly${partLabel}] ⚠️ No castJobId — DB insert failed. taskId=${data.taskId}. Will poll via taskId fallback.`);
        } else {
          console.log(`[EP04 Assembly${partLabel}] ✅ Polling with castJobId=${pollId}, taskId fallback=${data.taskId}`);
        }
        // Use castJobId if available, otherwise fall back to taskId for polling
        setAssemblyJobId(pollId || data.taskId);
        setAssemblyProgress(`Rendering${partLabel}... polling for completion`);
        // Track job ID + taskId (JSON2Video project ID) in parts state
        if (partNumber != null) {
          setAssemblyParts(prev => prev.map(p =>
            p.partNumber === partNumber ? { ...p, jobId: pollId, taskId: data.taskId || null, status: 'rendering' } : p
          ));
        }
        toast.success(`Assembly${partLabel} submitted! Rendering — will auto-update.`);
      } else if (data?.videoUrl) {
        if (partNumber != null) {
          // Part completed synchronously
          setAssemblyParts(prev => prev.map(p =>
            p.partNumber === partNumber ? { ...p, status: 'completed', videoUrl: data.videoUrl } : p
          ));
          setAssemblyProgress(null);
          setActivePartNumber(null);
          toast.success(`Part ${partNumber} assembled!`);
        } else {
          // Full assembly completed synchronously
          setFinalVideoUrl(data.videoUrl);
          setProductionPhase('complete');
          setAssemblyProgress(null);
          if (projectId && data.videoUrl) {
            await updateFinalAssembly(projectId, data.videoUrl, {
              totalDuration: partDuration,
              sceneCount: targetSceneKeys.length,
              resolution: '1920x1080',
            });
          }
          toast.success('Cinematic movie assembled successfully!');
        }
      } else {
        throw new Error(data?.message || 'Assembly returned no video URL');
      }

      // Mark assembled scenes
      setSceneProduction(prev => {
        const next = { ...prev };
        for (const sk of targetSceneKeys) {
          next[sk] = { ...(next[sk] || defaultSceneStatus()), assembled: 'done' };
        }
        return next;
      });

      if (jobId && projectId) {
        await completeGenerationJob(jobId, data?.tokensUsed || 5000, data?.videoUrl);
      }
    } catch (err: any) {
      console.error(`[EP04 Assembly${partLabel}] Failed:`, err);
      setAssemblyProgress(null);
      if (partNumber != null) {
        setAssemblyParts(prev => prev.map(p =>
          p.partNumber === partNumber ? { ...p, status: 'failed', errorMessage: err.message } : p
        ));
        setActivePartNumber(null);
      }
      toast.error(`Assembly${partLabel} failed: ${err.message}`);
    }
  }, [scenes, sceneProduction, scriptKeys, scriptContentForUI, audioMap, projectId, trackGenerationJob, completeGenerationJob, updateFinalAssembly, totalDuration, getAssemblyReadiness, computePartBoundaries]);

  // Initialize multi-part boundaries when readiness is checked
  const showMultiPartAssembly = useCallback(() => {
    const readiness = getAssemblyReadiness();
    setAssemblyReadiness(readiness);
    if (!readiness.canAssemble) {
      const missingScenes = readiness.scenes.filter(s => s.missing.length > 0);
      const summary = missingScenes.map(s => `${s.title}: ${s.missing.join(', ')}`).join('; ');
      toast.error(`Cannot assemble — missing assets: ${summary}`);
      return;
    }
    const parts = computePartBoundaries();
    setAssemblyParts(parts);
    console.log('[EP04 Assembly] Multi-part boundaries:', parts.map(p =>
      `Part ${p.partNumber}: ${p.sceneKeys.join(', ')} (~${Math.round(p.estimatedDuration / 60)}min, ${p.ttsCount} TTS)`
    ));
    toast.info(`Split into ${parts.length} parts — assemble each part individually`);
  }, [getAssemblyReadiness, computePartBoundaries]);

  // Per-Scene Assembly: one scene per part, can render all in parallel
  const showPerSceneAssembly = useCallback(() => {
    const readiness = getAssemblyReadiness();
    setAssemblyReadiness(readiness);
    if (!readiness.canAssemble) {
      const missingScenes = readiness.scenes.filter(s => s.missing.length > 0);
      const summary = missingScenes.map(s => `${s.title}: ${s.missing.join(', ')}`).join('; ');
      toast.error(`Cannot assemble — missing assets: ${summary}`);
      return;
    }
    const parts = computePerSceneParts();
    setAssemblyParts(parts);
    console.log('[EP04 PerScene] Scene boundaries:', parts.map(p =>
      `Scene ${p.partNumber}: ${p.sceneKeys[0]} (~${Math.round(p.estimatedDuration / 60)}min, ${p.ttsCount} TTS)`
    ));
    toast.info(`Per-scene mode: ${parts.length} individual scenes — render each or all at once`);
  }, [getAssemblyReadiness, computePerSceneParts]);

  // Start ALL pending per-scene renders in rapid succession
  const startAllPerSceneAssembly = useCallback(async () => {
    const pendingParts = assemblyParts.filter(p => p.status === 'pending');
    if (pendingParts.length === 0) {
      toast.info('No pending scenes to render');
      return;
    }

    setAssemblyProgress(`Submitting ${pendingParts.length} scenes...`);
    let submitted = 0;

    for (const part of pendingParts) {
      try {
        // Fire off each scene render without waiting for completion
        await startFinalAssembly(part.partNumber);
        submitted++;
        // Small delay between submissions to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err: any) {
        console.error(`[EP04 PerScene] Failed to submit scene ${part.partNumber}:`, err);
      }
    }

    // Start parallel polling for all submitted scenes
    // CRITICAL: clear assemblyJobId so single-job poll doesn't conflict with per-scene poll
    if (submitted > 0) {
      setAssemblyJobId(null);
      perScenePollCountRef.current = 0;
      setPerScenePolling(true);
      toast.success(`Submitted ${submitted} scenes for rendering — polling for completion`);
    }
  }, [assemblyParts, startFinalAssembly]);

  // ─── Reusable Video Stitching (Concat) via JSON2Video ────────────────────
  // Takes ordered list of MP4 URLs → builds a minimal JSON2Video timeline
  // where each URL becomes a video element in its own scene → submits → polls.
  // Reusable for ANY Cast production, not EP04-specific.

  /**
   * Build a minimal JSON2Video "stitching timeline" from ordered video URLs.
   * Each URL becomes a full-screen video element inside its own scene.
   * JSON2Video renders them sequentially → one combined MP4.
   *
   * @param videoUrls - Ordered array of Supabase Storage MP4 URLs
   * @param resolution - Output resolution (default: full-hd)
   * @returns JSON2Video timeline payload ready for genie-cast-timeline-submit
   */
  const buildStitchingTimeline = useCallback((
    videoUrls: string[],
    resolution: string = 'full-hd'
  ): Record<string, any> => {
    const scenes = videoUrls.map((url, idx) => ({
      comment: `Segment ${idx + 1} of ${videoUrls.length}`,
      transition: idx > 0 ? { style: 'fade', duration: 0.3 } : undefined,
      elements: [
        {
          type: 'video',
          src: url,
          // Let JSON2Video auto-detect duration from the source video
          // by NOT specifying duration — it plays the full clip
        },
      ],
    }));

    console.log(`[Cast Stitching] Built timeline: ${scenes.length} segments, resolution: ${resolution}`);
    return { resolution, quality: 'high', scenes };
  }, []);

  /**
   * Start the concat/stitch process:
   * 1. Collect completed part video URLs in order
   * 2. Build stitching timeline
   * 3. Submit to genie-cast-timeline-submit
   * 4. Poll for completion via concatJobId
   */
  const startConcatStitch = useCallback(async () => {
    // Collect all completed part URLs in order — ONLY HTTP URLs (no data: URIs)
    const orderedUrls = assemblyParts
      .filter(p => p.status === 'completed' && p.videoUrl && p.videoUrl.startsWith('http'))
      .sort((a, b) => a.partNumber - b.partNumber)
      .map(p => p.videoUrl!);

    // Warn if some parts had non-HTTP URLs (data: URIs or null)
    const droppedParts = assemblyParts.filter(p => p.status === 'completed' && p.videoUrl && !p.videoUrl.startsWith('http'));
    if (droppedParts.length > 0) {
      console.warn(`[Cast Stitching] Dropped ${droppedParts.length} parts with non-HTTP URLs:`, droppedParts.map(p => `Part ${p.partNumber}`));
      toast.warning(`${droppedParts.length} parts have invalid URLs and were excluded`);
    }

    if (orderedUrls.length < 2) {
      toast.error('Need at least 2 completed parts with valid HTTP URLs to stitch');
      return;
    }

    console.log(`[Cast Stitching] Starting concat of ${orderedUrls.length} parts:`, orderedUrls.map(u => u.substring(0, 60)));

    setConcatStatus('submitting');
    setConcatError(null);
    setConcatVideoUrl(null);

    try {
      const timeline = buildStitchingTimeline(orderedUrls);
      const assemblyBody = {
        timeline,
        castProjectId: projectId,
        language: 'en',
        quality: 'production',
      };

      const payloadSize = JSON.stringify(assemblyBody).length;
      console.log(`[Cast Stitching] Submitting: ${timeline.scenes.length} segments, ${(payloadSize / 1024).toFixed(0)}KB`);

      // PAYLOAD GUARD: Stitch payload should be tiny (just video URLs) — reject if suspiciously large
      if (payloadSize > 100 * 1024) {
        throw new Error(`Stitch payload unexpectedly large (${(payloadSize / 1024).toFixed(0)}KB) — should be <100KB for URL-only timeline`);
      }

      const { data, error } = await supabase.functions.invoke('genie-cast-timeline-submit', {
        body: assemblyBody,
      });

      if (error) {
        let detail = error.message;
        try {
          if (error.context && typeof error.context.text === 'function') {
            const body = await error.context.text();
            detail += ` — ${body}`;
          }
        } catch (_) {}
        throw new Error(detail);
      }

      if (data?.videoUrl) {
        // Immediate completion (unlikely for concat, but handle it)
        setConcatStatus('completed');
        setConcatVideoUrl(data.videoUrl);
        setFinalVideoUrl(data.videoUrl);
        setProductionPhase('complete');
        if (projectId && data.videoUrl) {
          updateFinalAssembly(projectId, data.videoUrl, {
            totalDuration: assemblyParts.reduce((s, p) => s + p.estimatedDuration, 0),
            sceneCount: assemblyParts.reduce((s, p) => s + p.sceneKeys.length, 0),
            resolution: '1920x1080',
            stitchedFromParts: assemblyParts.length,
          });
        }
        toast.success('Video stitched successfully!');
      } else if (data?.castJobId || data?.taskId) {
        // Async — need to poll
        const jobId = data.castJobId || data.taskId;
        setConcatJobId(jobId);
        setConcatStatus('rendering');
        toast.success('Stitching timeline submitted — rendering final video...');
      } else {
        throw new Error('No job ID or video URL returned from timeline submit');
      }
    } catch (err: any) {
      console.error('[Cast Stitching] Submit failed:', err);
      setConcatStatus('failed');
      setConcatError(err.message || String(err));
      toast.error(`Stitching failed: ${err.message?.substring(0, 100)}`);
    }
  }, [assemblyParts, buildStitchingTimeline, projectId, supabase]);

  // Poll for concat job completion
  const concatPollRef = useRef(0);
  useEffect(() => {
    if (!concatJobId || concatStatus !== 'rendering') {
      concatPollRef.current = 0;
      return;
    }
    const MAX_POLLS = 360; // 360 × 10s = 60 minutes (full-length documentary stitch needs headroom)
    const timer = setInterval(async () => {
      concatPollRef.current++;
      if (concatPollRef.current > MAX_POLLS) {
        setConcatStatus('failed');
        setConcatError('Stitching timed out after 60 minutes');
        setConcatJobId(null);
        toast.error('Stitching timed out — check JSON2Video dashboard');
        return;
      }
      try {
        const { data, error: fnError } = await supabase.functions.invoke('genie-cast-status', {
          body: { castJobId: concatJobId },
        });
        if (fnError) {
          console.warn(`[Cast Stitching] Poll error (attempt ${concatPollRef.current}):`, fnError);
          return;
        }
        const jobStatus = data?.job?.status;
        const progress = data?.job?.progressPercent;
        if (progress) {
          setAssemblyProgress(`Stitching: ${progress}%`);
        }
        if (jobStatus === 'completed') {
          const videoUrl = data.job.outputUrl;
          setConcatJobId(null);
          setConcatStatus('completed');
          setConcatVideoUrl(videoUrl);
          setFinalVideoUrl(videoUrl);
          setAssemblyProgress(null);
          setProductionPhase('complete');
          if (projectId && videoUrl) {
            updateFinalAssembly(projectId, videoUrl, {
              totalDuration: assemblyParts.reduce((s, p) => s + p.estimatedDuration, 0),
              sceneCount: assemblyParts.reduce((s, p) => s + p.sceneKeys.length, 0),
              resolution: '1920x1080',
              stitchedFromParts: assemblyParts.length,
            });
          }
          toast.success('Final cinematic video stitched successfully!');
        } else if (jobStatus === 'failed') {
          setConcatJobId(null);
          setConcatStatus('failed');
          setConcatError(data.job.errorMessage || 'JSON2Video rendering failed');
          setAssemblyProgress(null);
          toast.error('Stitching render failed — check JSON2Video dashboard');
        }
      } catch (err) {
        console.warn('[Cast Stitching] Poll exception:', err);
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [concatJobId, concatStatus, supabase, projectId, assemblyParts]);

  // ─── Render ──────────────────────────────────────────────────────────────

  // Show loading/error state while project is being resolved
  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold mb-2">Loading EP04 Project...</h2>
          <p className="text-sm text-muted-foreground">Connecting to database...</p>
        </Card>
      </div>
    );
  }

  if (projectLoadError || (!projectId && !projectLoading)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <h2 className="text-lg font-semibold mb-2">Project Load Failed</h2>
          <p className="text-sm text-muted-foreground mb-4">{projectLoadError || 'No project ID found — try refreshing'}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => retryProjectLookup()}>
              <RefreshCw className="h-4 w-4 mr-1" /> Retry
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Custom animation keyframes for character motion during playback */}
      <style>{`
        @keyframes proudPulse {
          0%, 100% { transform: scale(1.1); filter: brightness(1.1); }
          50% { transform: scale(1.15); filter: brightness(1.25); }
        }
        @keyframes dramaticScale {
          0%, 100% { transform: scale(1.08) rotate(-1deg); }
          50% { transform: scale(1.18) rotate(1deg); }
        }
        @keyframes warmGlow {
          0%, 100% { transform: scale(1.08); filter: saturate(1.2); }
          50% { transform: scale(1.12); filter: saturate(1.5) brightness(1.1); }
        }
        @keyframes urgentShake {
          0%, 100% { transform: scale(1.1) translateX(0); }
          25% { transform: scale(1.1) translateX(-2px); }
          75% { transform: scale(1.1) translateX(2px); }
        }
        @keyframes playfulBounce {
          0%, 100% { transform: scale(1.1) translateY(0) rotate(0); }
          30% { transform: scale(1.15) translateY(-4px) rotate(-3deg); }
          60% { transform: scale(1.08) translateY(-1px) rotate(2deg); }
        }
        @keyframes seriousSteady {
          0%, 100% { transform: scale(1.08); opacity: 0.95; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes mysticalFloat {
          0%, 100% { transform: scale(1.1) translateY(0); filter: hue-rotate(0deg); }
          50% { transform: scale(1.14) translateY(-5px); filter: hue-rotate(15deg); }
        }
        @keyframes confidentPulse {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.13); }
        }
        @keyframes reflectiveFade {
          0%, 100% { transform: scale(1.08); opacity: 0.85; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes energeticPop {
          0%, 100% { transform: scale(1.1) rotate(0); }
          25% { transform: scale(1.2) rotate(-2deg); }
          50% { transform: scale(1.05) rotate(1deg); }
          75% { transform: scale(1.18) rotate(-1deg); }
        }
      `}</style>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">The Genie AI Podcast — Episode 2</h1>
              <p className="text-sm text-muted-foreground">
                Beyond AI Hype · Host: Sai Dasika · with Allaudin · {doneCount}/{scriptKeys.length} lines · ~{Math.round(totalDuration / 60)}min
                {tokenBreakdown && tokenBreakdown.total.actual > 0 && (
                  <span className="ml-2 text-primary">
                    · {tokenBreakdown.total.actual.toLocaleString()} tokens · ${tokenBreakdown.total.costUsd.toFixed(4)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {batchProgress ? (
              <>
                <div className="w-40">
                  <Progress value={(batchProgress.current / batchProgress.total) * 100} className="h-2" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {batchProgress.current}/{batchProgress.total}
                </span>
                <Button variant="destructive" size="sm" onClick={cancelBatch}>
                  <Square className="h-3 w-3 mr-1" /> Stop
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={generateAll}
                  disabled={doneCount === scriptKeys.length}
                >
                  <Mic className="h-3 w-3 mr-1" />
                  {doneCount > 0 ? `Generate Remaining (${scriptKeys.length - doneCount})` : 'Generate All TTS'}
                </Button>
                {doneCount > 0 && (
                  <Button variant="outline" size="sm" onClick={playAll}>
                    <Play className="h-3 w-3 mr-1" /> Play All
                  </Button>
                )}
                {playingKey && (
                  <Button variant="ghost" size="sm" onClick={stopPlayback}>
                    <Square className="h-3 w-3 mr-1" /> Stop
                  </Button>
                )}
                {projectId && (
                  <Button variant="outline" size="sm" onClick={saveFullProject} disabled={isSaving}>
                    <Save className="h-3 w-3 mr-1" />
                    {isSaving ? 'Saving...' : 'Save Project'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Script Lines */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          {/* Episode Thumbnail Banner — seamless: thumbnail with overlaid title → collage below */}
          <div className="rounded-2xl overflow-hidden mb-6 border border-border/30">
            {/* Thumbnail with title overlaid at bottom */}
            <div className="relative">
              <img
                src={ep02Thumbnail}
                alt="The Genie AI Podcast — Beyond AI Hype — Episode 2"
                className="w-full h-auto object-cover"
              />
              {/* Bottom gradient fading into the collage area */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-16 pb-5 px-6 text-center">
                <p className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-1 drop-shadow-lg">Beyond AI Hype — Episode 2</p>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground drop-shadow-lg">Two AI Developers. One Human PO. Real Sprint.</h2>
                <p className="text-xs text-muted-foreground mt-1 drop-shadow-md">
                  Host: Sai Dasika · AI • Experimentation • Real-World Impact
                </p>
              </div>
            </div>

            {/* AI Developer Collage — seamless continuation */}
            <div className="flex items-center justify-center gap-8 sm:gap-14 py-6 px-6 bg-background">
              {/* Claude (Atlas) */}
              <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="relative group">
                  <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/40 transition-all duration-500 animate-pulse" />
                  <img src={claudeLogo} alt="Claude / Anthropic" className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-primary/40 shadow-2xl hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-sm font-bold text-primary">Atlas · Claude</span>
                <span className="text-[10px] text-muted-foreground italic max-w-[140px] text-center">"Let me stop talking and write the code now."</span>
              </div>

              <span className="text-3xl font-bold text-muted-foreground/40">×</span>

              {/* Lovable (Nova) */}
              <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="relative group">
                  <div className="absolute -inset-2 bg-accent/20 rounded-2xl blur-xl group-hover:bg-accent/40 transition-all duration-500 animate-pulse" />
                  <img src={lovableLogo} alt="Lovable" className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-accent/40 shadow-2xl object-contain bg-card p-2 hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-sm font-bold text-accent">Nova · Lovable</span>
                <span className="text-[10px] text-muted-foreground italic max-w-[140px] text-center">"I don't sit idle. I build."</span>
              </div>
            </div>
          </div>

          {Array.from(scenes.entries()).map(([sceneId, { keys, lines }]) => (
            <div key={sceneId}>
              {/* Scene Background Header */}
              {(() => {
                const sceneScreenshots = getSceneScreenshots(sceneId);
                const hasScreenshots = sceneScreenshots.length > 0;
                const primaryEntry = sceneScreenshots[0];
                const styleConfig = primaryEntry ? VISUAL_STYLE_CONFIG[primaryEntry.visualStyle] : null;
                const availableScreens = (primaryEntry?.screenIds || []).filter(sid => screenshotUrls[sid]);
                const showOriginal = styleConfig?.showOriginal && availableScreens.length > 0;

                return (
                  <>
                    <div className={cn(
                      "relative rounded-xl overflow-hidden mb-4 group",
                      showOriginal ? 'h-auto' : 'h-40'
                    )}>
                      {/* AI Background — always present */}
                      <div className="relative h-40">
                        {SCENE_BACKGROUNDS[sceneId] ? (
                        <img
                          src={SCENE_BACKGROUNDS[sceneId]}
                          alt={SCENE_TITLES[sceneId] || sceneId}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        ) : (
                        <div className="w-full h-full bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-violet-900/40 flex items-center justify-center">
                          <Film className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                          <div>
                            {/* Storybook chapter header */}
                            {SCENE_CHAPTERS[sceneId] && (
                              <p className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-[0.3em] mb-0.5 drop-shadow-lg">
                                {SCENE_CHAPTERS[sceneId].chapter} — {SCENE_CHAPTERS[sceneId].subtitle}
                              </p>
                            )}
                            <h2 className="text-lg font-bold text-foreground drop-shadow-lg">
                              {SCENE_TITLES[sceneId] || sceneId.replace(/-/g, ' ')}
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs text-muted-foreground">
                                {keys.length} line{keys.length !== 1 ? 's' : ''} · Art Style: {SCENE_STYLES[sceneId] || 'Mixed'}
                              </p>
                              {/* Storybook transition type badge */}
                              {SCENE_TRANSITION_TYPES[sceneId] && (
                                <Badge variant="outline" className={cn('text-[10px]', TRANSITION_COLORS[SCENE_TRANSITION_TYPES[sceneId]] || '')}>
                                  {TRANSITION_LABELS[SCENE_TRANSITION_TYPES[sceneId]] || SCENE_TRANSITION_TYPES[sceneId]}
                                </Badge>
                              )}
                              {styleConfig && (
                                <Badge variant="outline" className={cn('text-xs', styleConfig.color)}>
                                  {styleConfig.icon} {styleConfig.label}
                                </Badge>
                              )}
                              {hasScreenshots && primaryEntry && (
                                <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                                  <Monitor className="w-3 h-3 mr-1" />
                                  {primaryEntry.screenIds.length} screen{primaryEntry.screenIds.length !== 1 ? 's' : ''}
                                  {availableScreens.length > 0 && (
                                    <span className="ml-1 text-emerald-400">
                                      · {availableScreens.length} captured
                                    </span>
                                  )}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                            {sceneId.split('-')[1]?.replace('scene', '') || ''}
                          </Badge>
                        </div>
                      </div>

                      {/* Screenshot overlay strip — only for screen-capture / mixed scenes with captured images */}
                      {showOriginal && availableScreens.length > 0 && (
                        <div className="bg-muted/50 border-t border-border p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Camera className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Sprint Tracker Screenshots — {primaryEntry?.sceneLabel}
                            </span>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {availableScreens.map(screenId => {
                              const screen = primaryEntry?.screens.find(s => s.id === screenId);
                              return (
                                <TooltipProvider key={screenId}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all cursor-pointer group/thumb">
                                        <img
                                          src={screenshotUrls[screenId]}
                                          alt={screen?.name || screenId}
                                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/thumb:scale-105"
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-xs">
                                      <p className="font-medium text-sm">{screen?.name || screenId}</p>
                                      <p className="text-xs text-muted-foreground">{screen?.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Missing screenshots indicator */}
                      {hasScreenshots && styleConfig?.showOriginal && availableScreens.length === 0 && !screenshotsLoading && (
                        <div className="bg-amber-500/5 border-t border-amber-500/20 p-3">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs text-amber-400">
                              {primaryEntry?.screenIds.length} screenshot{primaryEntry?.screenIds.length !== 1 ? 's' : ''} needed — capture from Sprint Tracker
                            </span>
                          </div>
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {(primaryEntry?.screens || []).map(s => (
                              <Badge key={s.id} variant="outline" className="text-xs border-amber-500/30 text-amber-400/80">
                                {s.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
              <div className="space-y-2">
                {keys.map((key, i) => {
                  const line = lines[i];
                  const status = statusMap[key] || 'idle';
                  const isPlaying = playingKey === key;

                  return (
                    <Card
                      key={key}
                      className={cn(
                        'transition-all duration-300',
                        isPlaying && (() => {
                          const ctx = getAnimationContext(line);
                          return `ring-2 ${ctx.cardGlow} shadow-lg`;
                        })(),
                        !isPlaying && status === 'error' && 'border-destructive/50',
                        line.isInterruption && 'border-orange-500/40 bg-orange-500/5 ml-4'
                      )}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Play / Status Button */}
                          <div className="pt-2 flex-shrink-0">
                            {status === 'generating' ? (
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            ) : status === 'done' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => isPlaying ? stopPlayback() : playLine(key)}
                              >
                                {isPlaying ? (
                                  <Pause className="h-5 w-5 text-primary" />
                                ) : (
                                  <Play className="h-5 w-5 text-primary" />
                                )}
                              </Button>
                            ) : status === 'error' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => generateLine(key)}
                              >
                                <AlertCircle className="h-5 w-5 text-destructive" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => generateLine(key)}
                              >
                                <Mic className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            )}
                          </div>

                          {/* Character Avatar with context-aware animation */}
                          {(() => {
                            const animCtx = isPlaying ? getAnimationContext(line) : null;
                            return (
                              <div className={cn(
                                "flex-shrink-0 pt-0.5 relative",
                                isPlaying && "z-10"
                              )}>
                                {/* Mood-specific aura ring */}
                                {isPlaying && animCtx && animCtx.energy === 'high' && (
                                  <div className={cn(
                                    "absolute -inset-4 rounded-full border-[3px] opacity-60",
                                    animCtx.mood === 'urgent' && 'border-red-400/50',
                                    animCtx.mood === 'dramatic' && 'border-violet-400/50',
                                    animCtx.mood === 'proud' && 'border-amber-400/50',
                                    animCtx.mood === 'energetic' && 'border-lime-400/50',
                                  )} style={{ animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite' }} />
                                )}
                                {/* Lip-sync glow — contextual color */}
                                {isPlaying && line.lipsync && animCtx && (
                                  <div className={cn(
                                    "absolute -inset-2.5 rounded-full",
                                    animCtx.mood === 'mystical' && 'bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-blue-500/30',
                                    animCtx.mood === 'warm' && 'bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-yellow-500/25',
                                    animCtx.mood === 'urgent' && 'bg-gradient-to-r from-red-500/30 via-orange-500/20 to-red-500/30',
                                    animCtx.mood === 'playful' && 'bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-cyan-500/25',
                                    !['mystical', 'warm', 'urgent', 'playful'].includes(animCtx.mood) && 'bg-gradient-to-r from-pink-500/30 via-primary/20 to-pink-500/30',
                                  )} style={{ animation: 'pulse 0.6s ease-in-out infinite alternate' }} />
                                )}
                                <img
                                  src={CHARACTER_AVATARS[line.voice]}
                                  alt={VOICE_LABELS[line.voice]}
                                  className={cn(
                                    'w-20 h-20 rounded-full object-cover ring-[3px] shadow-lg transition-all duration-300 relative',
                                    isPlaying
                                      ? 'ring-primary scale-110 shadow-lg'
                                      : 'ring-border',
                                    line.voice === 'squirrel' && 'ring-orange-500/50',
                                    line.isInterruption && !isPlaying && 'animate-bounce'
                                  )}
                                  style={isPlaying && animCtx ? {
                                    animation: animCtx.avatarAnimation,
                                  } : undefined}
                                />
                                {/* Mood indicator badge */}
                                {isPlaying && animCtx && (
                                  <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-background border-2 border-border flex items-center justify-center text-base shadow-lg"
                                    style={{ animation: animCtx.energy === 'high' ? 'bounce 0.6s ease-in-out infinite' : 'pulse 2s ease-in-out infinite' }}
                                  >
                                    {animCtx.emoji}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Context-aware animation strip — shows during playback */}
                            {isPlaying && (() => {
                              const ctx = getAnimationContext(line);
                              return (
                                <div className={cn(
                                  "flex items-center gap-3 mb-3 py-2 px-4 rounded-lg border border-primary/15",
                                  `bg-gradient-to-r ${ctx.stripGradient}`
                                )}>
                                  {/* Mood indicator */}
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground/90">
                                    <span className="text-lg" style={{ animation: ctx.energy === 'high' ? 'bounce 0.5s ease-in-out infinite' : 'pulse 2s ease-in-out infinite' }}>
                                      {ctx.emoji}
                                    </span>
                                    {ctx.mood.toUpperCase()}
                                  </span>
                                  <span className="w-px h-4 bg-border" />
                                  {/* Motion cue from script */}
                                  <span className="text-xs font-medium text-muted-foreground">
                                    🎬 {ctx.motionLabel}
                                  </span>
                                  {/* Direction context — first phrase */}
                                  <span className="text-xs italic text-muted-foreground/70 truncate ml-auto max-w-[250px]">
                                    "{ctx.label}"
                                  </span>
                                  {/* SFX indicators */}
                                  {Array.isArray(line.sfx) && line.sfx.length > 0 && (
                                    <span className="flex items-center gap-1 ml-1">
                                      {line.sfx.slice(0, 3).map((sfx, si) => (
                                        <span
                                          key={sfx}
                                          className="px-2 py-1 rounded-md text-[11px] font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                                          style={{ animation: `pulse 1.2s ease-in-out infinite`, animationDelay: `${si * 0.2}s` }}
                                        >
                                          🔊 {sfx.replace(/_/g, ' ')}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}

                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {line.isInterruption && (
                                <Badge variant="outline" className={cn(
                                  "text-xs bg-orange-500/10 text-orange-400 border-orange-500/30",
                                  isPlaying && "animate-pulse"
                                )}>
                                  ⚡ Interruption
                                </Badge>
                              )}
                              {!isPlaying && line.lipsync && (
                                <Badge variant="outline" className="text-xs bg-pink-500/10 text-pink-400 border-pink-500/30">
                                  👄 Lip-Sync
                                </Badge>
                              )}
                              {!isPlaying && Array.isArray(line.sfx) && line.sfx.length > 0 && (
                                <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                                  🔊 SFX ×{line.sfx.length}
                                </Badge>
                              )}
                              {!isPlaying && line.motion && (
                                <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-400 border-violet-500/30">
                                  🎬 {line.motion.split('-').slice(0, 3).join(' ')}
                                </Badge>
                              )}
                              <Badge variant="outline" className={cn('text-xs', VOICE_COLORS[line.voice])}>
                                {VOICE_LABELS[line.voice]}
                              </Badge>
                              <span className="text-xs text-muted-foreground">~{line.duration_est}s</span>
                              {status === 'done' && (
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              )}
                            </div>
                            <p className={cn(
                              'text-sm leading-relaxed whitespace-pre-line',
                              line.isInterruption && 'italic',
                              isPlaying && 'text-foreground font-medium'
                            )}>
                              {line.text}
                            </p>
                            {/* Clickable CTA Links */}
                            {Array.isArray(line.links) && line.links.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {line.links.map((link) => (
                                  <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                      'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                                      'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 hover:border-primary/50 hover:scale-105',
                                      isPlaying && 'animate-pulse shadow-lg shadow-primary/20'
                                    )}
                                  >
                                    {link.label}
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                ))}
                              </div>
                            )}
                            <p className={cn(
                              "text-xs text-muted-foreground mt-1 italic",
                              isPlaying && "text-primary/70"
                            )}>
                              {line.direction}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <Separator className="mt-6" />
            </div>
          ))}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* PHASE 2: TTS APPROVAL                                             */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <div className="mt-8">
            <Card className={cn(
              'border transition-all',
              productionPhase === 'tts' && doneCount >= ttsApprovalThreshold && 'ring-2 ring-primary/30',
              productionPhase !== 'tts' && 'border-green-500/30 bg-green-500/[0.02]',
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
                      productionPhase !== 'tts' ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary',
                    )}>
                      {productionPhase !== 'tts' ? <CheckCircle2 className="h-4 w-4" /> : '2'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Phase 2: TTS Approval</h3>
                      <p className="text-sm text-muted-foreground">
                        {doneCount >= ttsApprovalThreshold
                          ? `${doneCount}/${scriptKeys.length} lines ready — approve to proceed`
                          : `Need at least ${ttsApprovalThreshold}/${scriptKeys.length} lines (currently ${doneCount})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={doneCount >= ttsApprovalThreshold ? 'default' : 'secondary'} className="text-xs">
                      {doneCount}/{scriptKeys.length} generated
                    </Badge>
                    {productionPhase === 'tts' && (
                      <Button
                        size="sm"
                        onClick={approveTTS}
                        disabled={doneCount < ttsApprovalThreshold}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approve TTS ({doneCount >= scriptKeys.length ? 'All' : `${doneCount}/${scriptKeys.length}`})
                      </Button>
                    )}
                    {productionPhase !== 'tts' && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                        Approved ({doneCount}/{scriptKeys.length})
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-xl font-bold text-foreground">{doneCount}</p>
                    <p className="text-[10px] text-muted-foreground">Lines Generated</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-xl font-bold text-foreground">{Math.round(totalDuration / 60)}min</p>
                    <p className="text-[10px] text-muted-foreground">Total Duration</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-xl font-bold text-foreground">{scenes.size}</p>
                    <p className="text-[10px] text-muted-foreground">Scenes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* PHASE 3: VISUAL PRODUCTION (always visible)                       */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {(() => {
            const phase3Done = productionPhase === 'music' || productionPhase === 'assembly' || productionPhase === 'complete';
            return (
            <div className="mt-6">
              <Card className={cn(
                'border transition-all',
                !phase3Done && 'ring-2 ring-primary/30',
                phase3Done && 'border-green-500/30 bg-green-500/[0.02]',
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
                        phase3Done ? 'bg-green-500 text-white' :
                        'bg-primary/10 text-primary',
                      )}>
                        {phase3Done ? <CheckCircle2 className="h-4 w-4" /> : '3'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Phase 3: Visual Production</h3>
                        <p className="text-sm text-muted-foreground">
                          Generate video, avatar, lipsync assets per scene pipeline
                        </p>
                        {!phase3Done && (
                          <div className="flex items-center gap-3 mt-1">
                            <span className={cn('text-[10px] font-medium', scenesWithPipeline.length >= 12 ? 'text-green-500' : 'text-amber-500')}>
                              {scenesWithPipeline.length}/{scenes.size} pipelines ready
                            </span>
                            <span className={cn('text-[10px] font-medium', Object.keys(screenshotUrls).length >= 15 ? 'text-green-500' : 'text-amber-500')}>
                              {Object.keys(screenshotUrls).length}/19 screenshots loaded
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {visualProgress && (
                        <>
                          <Progress value={(visualProgress.current / visualProgress.total) * 100} className="w-32 h-2" />
                          <span className="text-xs text-muted-foreground">{visualProgress.current}/{visualProgress.total}</span>
                        </>
                      )}
                      {!visualProgress && (
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            onClick={startAllVisualProduction}
                            disabled={scenesWithPipeline.length === 0}
                          >
                            <Film className="h-3 w-3 mr-1" />
                            Produce All Visuals
                          </Button>
                          {/* Regen only scenes with missing/errored assets — runs in parallel */}
                          {(() => {
                            const incompleteScenes = Array.from(scenes.keys()).filter(sk => {
                              const s = sceneProduction[sk];
                              if (!s) return true; // never generated
                              if (s.visual === 'error') return true;
                              if (s.visual !== 'done') return true;
                              // Check if asset count is less than expected pipeline steps
                              const pid = SCRIPT_TO_PIPELINE_MAP[sk] || sk;
                              const cfg = EP04_SCENE_PIPELINES[pid as keyof typeof EP04_SCENE_PIPELINES];
                              const steps = Array.isArray(cfg) ? cfg : [];
                              const expectedVisual = steps.filter(st => !new Set(['tts', 'music', 'sfx']).has(st.type)).length;
                              const actualCount = Object.keys(s.videoUrls).length + Object.keys(s.imageUrls).length
                                + Object.keys(s.avatarUrls).length + Object.keys(s.lipsyncUrls).length;
                              return actualCount < expectedVisual;
                            });
                            return incompleteScenes.length > 0 ? (
                              <Button
                                size="sm" variant="outline"
                                className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                onClick={() => startParallelSceneRegen(incompleteScenes)}
                                disabled={incompleteScenes.some(sk => sceneProduction[sk]?.visual === 'generating')}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Regen {incompleteScenes.length} Incomplete (Parallel)
                              </Button>
                            ) : null;
                          })()}
                          <Button
                            size="sm" variant="outline"
                            className="border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                            onClick={startAllLipsyncProduction}
                            disabled={scenesWithPipeline.length === 0}
                          >
                            <Mic className="h-3 w-3 mr-1" />
                            Regen All Lipsync
                          </Button>
                        </div>
                      )}
                      {(
                        <>
                        <Button
                          size="sm" variant="outline"
                          className="border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
                          onClick={async () => {
                            if (!projectId) { toast.error('No project ID'); return; }
                            toast.info('Repairing avatars + CDN URLs...');
                            let fixCount = 0;

                            // Step 1: Cross-scene avatar repair — replace dog/local avatars with Supabase avatars from other scenes
                            const bestAvatars: Record<string, string> = {};
                            for (const [, sp] of Object.entries(sceneProduction)) {
                              for (const [key, url] of Object.entries(sp.avatarUrls || {})) {
                                if (url && isSupabaseStorageUrl(url)) {
                                  const charMatch = key.match(/avatar-3d-(\w+)-/);
                                  if (charMatch && !bestAvatars[charMatch[1]]) {
                                    bestAvatars[charMatch[1]] = url;
                                  }
                                }
                              }
                            }
                            console.log('🔧 Best cross-scene Supabase avatars:', bestAvatars);

                            for (const [sk, sp] of Object.entries(sceneProduction)) {
                              const avatarUrls = { ...(sp.avatarUrls || {}) };
                              const imageUrls = { ...(sp.imageUrls || {}) };
                              let changed = false;

                              // Fix avatars: replace local/dog paths with cross-scene Supabase avatars
                              for (const [key, url] of Object.entries(avatarUrls)) {
                                if (!url || isSupabaseStorageUrl(url)) continue;
                                const charMatch = key.match(/avatar-3d-(\w+)-/);
                                if (charMatch && bestAvatars[charMatch[1]]) {
                                  console.log(`🔧 ${sk}: replacing avatar ${key} (local/CDN) → cross-scene Supabase`);
                                  avatarUrls[key] = bestAvatars[charMatch[1]];
                                  changed = true;
                                  fixCount++;
                                }
                              }

                              // Fix images: re-upload CDN URLs to Supabase Storage
                              for (const [key, url] of Object.entries(imageUrls)) {
                                if (!url || isSupabaseStorageUrl(url) || isBase64DataUri(url)) continue;
                                if (url.startsWith('http') || url.startsWith('/')) {
                                  try {
                                    const newUrl = await ensureStorageUrl(projectId, key, url);
                                    if (newUrl !== url) {
                                      imageUrls[key] = newUrl;
                                      changed = true;
                                      fixCount++;
                                      console.log(`🔧 ${sk}: re-uploaded CDN image ${key} → Storage`);
                                    }
                                  } catch (err) { console.warn(`🔧 ${sk}: failed to re-upload ${key}:`, err); }
                                }
                              }

                              if (changed) {
                                setSceneProduction(prev => ({
                                  ...prev,
                                  [sk]: { ...prev[sk], avatarUrls, imageUrls },
                                }));
                                await updateSceneArtifacts(projectId, sk, {
                                  videoUrls: sp.videoUrls || {},
                                  imageUrls,
                                  avatarUrls,
                                  lipsyncUrls: sp.lipsyncUrls || {},
                                });
                              }
                            }

                            // Step 2: Server-side repair for anything else
                            const { data, error } = await supabase.functions.invoke('ai-video-generator', {
                              body: { action: 'repair_urls', projectId },
                            });
                            if (error) console.warn('Server repair error:', error.message);
                            if (data?.diagnostics) console.log('🔧 Server diagnostics:\n' + data.diagnostics.join('\n'));

                            toast.success(`Fixed ${fixCount} avatars/CDN URLs${data?.fixedCount ? ` + ${data.fixedCount} server-side` : ''} — refreshing...`);
                            setTimeout(() => window.location.reload(), 2000);
                          }}
                        >
                          Repair URLs
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="border-green-500/30 text-green-600 hover:bg-green-500/10"
                          onClick={async () => {
                            toast.info('Making cast-assets bucket public...');
                            const { data, error } = await supabase.functions.invoke('ai-video-generator', {
                              body: { action: 'make_bucket_public' },
                            });
                            if (error) { toast.error(`Failed: ${error.message}`); return; }
                            toast.success('cast-assets bucket is now PUBLIC — URLs will never expire!');
                          }}
                        >
                          Make Storage Public
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="border-cyan-500/30 text-cyan-600 hover:bg-cyan-500/10"
                          onClick={async () => {
                            // Capture all 19 sprint tracker screenshots via popup window
                            const sprintUrl = `${window.location.origin}/genie-hub?tab=sprint-tracker&autoCapture=true`;
                            toast.info('Opening sprint tracker for auto-capture (19 screens)...');
                            window.open(sprintUrl, 'sprint-capture', 'width=1920,height=1080');
                          }}
                        >
                          <Camera className="h-3 w-3 mr-1" />
                          Capture Sprint Screenshots
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                          onClick={saveAllAssetsToDb}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save All Assets to DB
                        </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Per-scene visual status cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from(scenes.keys()).map(sceneKey => {
                      const status = sceneProduction[sceneKey];
                      const pipelineId = SCRIPT_TO_PIPELINE_MAP[sceneKey] || sceneKey;
                      const configPipeline = EP04_SCENE_PIPELINES[pipelineId as keyof typeof EP04_SCENE_PIPELINES];
                      const rawPipeline = configPipeline || dbProject.scenePipelineFor(sceneKey);
                      const pipelineSteps = Array.isArray(rawPipeline) ? rawPipeline : (rawPipeline?.steps || []) as Array<Record<string, unknown>>;
                      const visualOnlySteps = pipelineSteps.filter(s => !SKIP_IN_VISUAL.has((s.type as string) || 'image'));
                      const extraInteractions = EP04_CHARACTER_INTERACTIONS.filter(ci => ci.sceneId === sceneKey || ci.sceneId === pipelineId);
                      const extraScrolls = EP04_NARRATOR_SCROLLS.filter(ns => ns.sceneId === sceneKey || ns.sceneId === pipelineId);
                      const extraCount = extraInteractions.reduce((n, ci) => n + ci.steps.length, 0) + extraScrolls.reduce((n, ns) => n + ns.steps.length, 0);
                      return (
                        <div key={sceneKey} className={cn(
                          'p-3 rounded-lg border transition-all',
                          status?.visual === 'done' ? 'border-green-500/30 bg-green-500/[0.02]' :
                          status?.visual === 'generating' ? 'border-primary/30 bg-primary/[0.02]' :
                          status?.visual === 'error' ? 'border-red-500/30 bg-red-500/[0.02]' :
                          'border-border/30',
                        )}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold truncate">{SCENE_TITLES[sceneKey] || sceneKey}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-muted-foreground">{visualOnlySteps.length}{extraCount > 0 ? `+${extraCount}` : ''}</span>
                              {/* Per-scene health badges */}
                              {status?.visual === 'done' && (() => {
                                const allUrls = [
                                  ...Object.values(status.videoUrls || {}),
                                  ...Object.values(status.imageUrls || {}),
                                  ...Object.values(status.avatarUrls || {}),
                                  ...Object.values(status.lipsyncUrls || {}),
                                ];
                                const expCount = allUrls.filter(u => isExpiredCdnUrl(u)).length;
                                if (expCount > 0) return <AlertTriangle className="h-3 w-3 text-amber-500" title={`${expCount} expired — Regen needed`} />;
                                return <CheckCircle2 className="h-3 w-3 text-green-500" />;
                              })()}
                              {status?.visual === 'generating' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                              {status?.visual === 'error' && <AlertCircle className="h-3 w-3 text-red-500" />}
                              {(!status || status.visual === 'idle') && <AlertCircle className="h-3 w-3 text-muted-foreground" title="Not generated" />}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {visualOnlySteps.map((step, i) => (
                              <Badge key={i} variant="outline" className="text-[8px]">
                                {(step.type as string) || 'image'}
                              </Badge>
                            ))}
                            {extraCount > 0 && (
                              <Badge variant="outline" className="text-[8px] bg-violet-500/10 text-violet-400 border-violet-500/30">
                                +{extraCount} extra
                              </Badge>
                            )}
                            {pipelineSteps.length === 0 && (
                              <span className="text-[9px] text-muted-foreground">No pipeline configured</span>
                            )}
                          </div>
                          {/* Video Provider Selector — three-provider showcase */}
                          {pipelineSteps.some(s => (s.type as string) === 'alibaba-video') && (
                            <div className="p-2 rounded-md border border-violet-500/20 bg-violet-500/[0.03] mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-violet-400 whitespace-nowrap">Video Provider:</span>
                                <select
                                  className="flex-1 h-7 text-xs rounded border border-violet-500/30 bg-background px-2 font-medium"
                                  value={sceneProviders[sceneKey] || 'alibaba'}
                                  onChange={e => setSceneProviders(prev => ({ ...prev, [sceneKey]: e.target.value as VideoProviderChoice }))}
                                >
                                  {VIDEO_PROVIDER_OPTIONS.map(opt => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.label}{SCENE_PROVIDER_DEFAULTS[sceneKey]?.provider === opt.id ? ' (Recommended)' : ''}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Button
                                  size="sm" variant="default"
                                  className="h-7 text-xs px-3 bg-violet-600 hover:bg-violet-700 text-white"
                                  onClick={() => regenerateSceneVideo(sceneKey)}
                                  disabled={regenProgress[sceneKey] === 'generating'}
                                >
                                  {regenProgress[sceneKey] === 'generating' ? (
                                    <><Loader2 className="h-3 w-3 animate-spin mr-1" />Generating...</>
                                  ) : (
                                    <><RefreshCw className="h-3 w-3 mr-1" />Regen Video with {VIDEO_PROVIDER_OPTIONS.find(o => o.id === (sceneProviders[sceneKey] || 'alibaba'))?.label || 'Provider'}</>
                                  )}
                                </Button>
                                {regenProgress[sceneKey] === 'done' && <span className="flex items-center gap-1 text-green-500 text-xs"><CheckCircle2 className="h-3.5 w-3.5" />Done</span>}
                                {regenProgress[sceneKey] === 'error' && <span className="flex items-center gap-1 text-red-500 text-xs"><AlertCircle className="h-3.5 w-3.5" />Failed</span>}
                              </div>
                              {SCENE_PROVIDER_DEFAULTS[sceneKey] && (
                                <p className="text-[9px] text-muted-foreground mt-1">{SCENE_PROVIDER_DEFAULTS[sceneKey].rationale}</p>
                              )}
                            </div>
                          )}
                          {!phase3Done && status?.visual !== 'done' && (
                            <Button
                              size="sm" variant="outline" className="w-full h-7 text-[10px]"
                              onClick={() => startSceneVisualProduction(sceneKey)}
                              disabled={status?.visual === 'generating' || pipelineSteps.length === 0}
                            >
                              {status?.visual === 'generating' ? 'Producing...' : pipelineSteps.length === 0 ? 'No Pipeline' : 'Start Scene'}
                            </Button>
                          )}
                          {/* Regenerate buttons for completed/errored scenes */}
                          {(status?.visual === 'done' || status?.visual === 'error') && (
                            <div className="flex gap-1 mt-1">
                              {/* Regen All — clears ALL state and regenerates everything with latest prompts */}
                              <Button
                                size="sm" variant="outline" className="flex-1 h-7 text-[10px] border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                onClick={() => {
                                  // Pass forceRegenAll=true to bypass smart-skip entirely (fixes async state race)
                                  startSceneVisualProduction(sceneKey, undefined, true);
                                }}
                                disabled={status?.visual === 'generating' || pipelineSteps.length === 0}
                              >
                                <Film className="h-3 w-3 mr-1" />
                                Regen All
                              </Button>
                              {/* Regenerate Lipsync Only — clears lipsync URLs, re-runs avatar-lipsync steps */}
                              <Button
                                size="sm" variant="outline" className="flex-1 h-7 text-[10px] border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                                onClick={() => {
                                  // Clear ONLY lipsync entries that are missing/empty — preserve existing successful ones
                                  setSceneProduction(prev => {
                                    const existing = prev[sceneKey] || defaultSceneStatus();
                                    // Keep lipsync entries that have valid Supabase URLs, clear the rest
                                    const keptLipsync: Record<string, string> = {};
                                    for (const [k, url] of Object.entries(existing.lipsyncUrls || {})) {
                                      if (url && url.includes('supabase.co/storage')) {
                                        keptLipsync[k] = url;
                                      }
                                    }
                                    const clearedCount = Object.keys(existing.lipsyncUrls || {}).length - Object.keys(keptLipsync).length;
                                    console.log(`[EP04 Regen Lipsync] ${sceneKey}: keeping ${Object.keys(keptLipsync).length} valid, clearing ${clearedCount} missing/expired`);
                                    return {
                                      ...prev,
                                      [sceneKey]: { ...existing, lipsyncUrls: keptLipsync, visual: 'idle' },
                                    };
                                  });
                                  startSceneVisualProduction(sceneKey, new Set(['avatar-lipsync']));
                                }}
                                disabled={status?.visual === 'generating' || pipelineSteps.length === 0}
                              >
                                <Mic className="h-3 w-3 mr-1" />
                                Regen Lipsync
                              </Button>
                            </div>
                          )}

                          {/* ── Save Scene to DB button (visuals + music + TTS) — always visible ── */}
                          {(() => {
                            const sceneLines = scriptKeys.filter(k => scriptContentForUI[k]?.scene === sceneKey);
                            const ttsLines = sceneLines.filter(k => audioMap[k]?.audioUrl);
                            const artCount = (status ? Object.keys(status.videoUrls).length + Object.keys(status.imageUrls).length
                              + Object.keys(status.avatarUrls).length + Object.keys(status.lipsyncUrls).length : 0);
                            const hasMusic = !!(status?.musicUrl);
                            const hasSfx = !!(status?.sfxUrls && status.sfxUrls.length > 0);
                            const hasAnything = artCount > 0 || ttsLines.length > 0 || hasMusic || hasSfx;
                            return (
                              <Button
                                size="sm" variant="outline"
                                className={cn(
                                  'w-full h-6 text-[9px] mt-1',
                                  hasAnything
                                    ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                                    : 'border-muted text-muted-foreground cursor-not-allowed opacity-50',
                                )}
                                disabled={!hasAnything || !projectId}
                                onClick={async () => {
                                  if (!projectId) { toast.error('No project ID'); return; }
                                  toast.info(`Saving ${SCENE_TITLES[sceneKey]?.split(' — ')[1] || sceneKey}: ${artCount} visuals, ${ttsLines.length} TTS, music=${hasMusic ? 'yes' : 'no'}...`);

                                  // 1. Save TTS lines for this scene
                                  let ttsSaved = 0;
                                  for (const lk of ttsLines) {
                                    const audio = audioMap[lk];
                                    const ok = await updateLineTTS(projectId, lk, {
                                      tts_audio_url: audio.audioUrl,
                                      tts_provider: audio.provider,
                                      tts_voice_id: audio.voice,
                                      tts_status: 'generated',
                                    });
                                    if (ok) ttsSaved++;
                                  }

                                  // 2. Save visual artifacts
                                  let visSaved = true;
                                  if (status && artCount > 0) {
                                    visSaved = await updateSceneArtifacts(projectId, sceneKey, {
                                      videoUrls: status.videoUrls,
                                      imageUrls: status.imageUrls,
                                      avatarUrls: status.avatarUrls,
                                      lipsyncUrls: status.lipsyncUrls,
                                    });
                                  }

                                  // 3. Save music + SFX
                                  let musSaved = true;
                                  if (status && (hasMusic || hasSfx)) {
                                    musSaved = await updateSceneMusic(projectId, sceneKey, status.musicUrl, status.sfxUrls || []);
                                  }

                                  const sceneName = SCENE_TITLES[sceneKey]?.split(' — ')[1] || sceneKey;
                                  if (visSaved && musSaved) {
                                    toast.success(`${sceneName}: ${artCount} visuals, ${ttsSaved} TTS, music=${hasMusic ? 'saved' : 'none'}`);
                                  } else {
                                    toast.error(`${sceneName}: partial save — vis=${visSaved}, mus=${musSaved}, tts=${ttsSaved}/${ttsLines.length}`);
                                  }
                                }}
                              >
                                <Save className="h-2.5 w-2.5 mr-1" />
                                Save Scene{hasAnything ? ` (${artCount}v ${ttsLines.length}t${hasMusic ? ' m' : ''})` : ' — no assets yet'}
                              </Button>
                            );
                          })()}

                          {/* ── Clear Scene Assets button ── */}
                          {status?.visual === 'done' && (
                            <Button
                              size="sm" variant="ghost" className="w-full h-6 text-[9px] text-red-500 hover:text-red-600 hover:bg-red-500/10 mt-1"
                              onClick={async () => {
                                setSceneProduction(prev => ({
                                  ...prev,
                                  [sceneKey]: defaultSceneStatus(),
                                }));
                                if (projectId) {
                                  await updateSceneArtifacts(projectId, sceneKey, {
                                    videoUrls: {}, imageUrls: {}, avatarUrls: {}, lipsyncUrls: {},
                                  });
                                }
                                toast.success(`Cleared all assets for ${SCENE_TITLES[sceneKey] || sceneKey}`);
                              }}
                            >
                              <Trash2 className="h-2.5 w-2.5 mr-1" />
                              Clear Assets
                            </Button>
                          )}

                          {/* ── Categorized asset preview for completed scenes ── */}
                          {status?.visual === 'done' && (() => {
                            const categories = [
                              { label: 'Videos', icon: Film, entries: Object.entries(status.videoUrls || {}).filter(([, u]) => u), isVideo: true },
                              { label: 'Images', icon: ImageIcon, entries: Object.entries(status.imageUrls || {}).filter(([, u]) => u), isVideo: false },
                              { label: 'Avatars', icon: Camera, entries: Object.entries(status.avatarUrls || {}).filter(([, u]) => u), isVideo: false },
                              { label: 'Lipsync', icon: Mic, entries: Object.entries(status.lipsyncUrls || {}).filter(([, u]) => u), isVideo: true },
                            ].filter(c => c.entries.length > 0);
                            const totalAssets = categories.reduce((s, c) => s + c.entries.length, 0);
                            const expiredCount = categories.reduce((s, c) => s + c.entries.filter(([, u]) => isExpiredCdnUrl(u)).length, 0);
                            if (totalAssets === 0) return null;
                            return (
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-1">
                                  <p className="text-[9px] text-muted-foreground font-medium">{totalAssets} assets generated</p>
                                  {expiredCount > 0 && (
                                    <Badge variant="outline" className="text-[7px] h-3 px-1 border-amber-500/30 text-amber-500">
                                      {expiredCount} possibly expired
                                    </Badge>
                                  )}
                                </div>
                                {categories.map(cat => {
                                  const CatIcon = cat.icon;
                                  return (
                                    <div key={cat.label} className="space-y-1">
                                      <div className="flex items-center gap-1">
                                        <CatIcon className="h-2.5 w-2.5 text-muted-foreground" />
                                        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">{cat.label}</span>
                                        <Badge variant="outline" className="text-[7px] h-3 px-1">{cat.entries.length}</Badge>
                                      </div>
                                      <div className="grid grid-cols-3 gap-1.5">
                                        {cat.entries.map(([key, url]) => (
                                          <div
                                            key={key}
                                            className="relative group cursor-pointer"
                                            onClick={() => { if (url && url.startsWith('http')) window.open(url, '_blank'); }}
                                            title={`Click to open: ${key}`}
                                          >
                                            {cat.isVideo ? (
                                              <video
                                                src={`${url}${url.includes('?') ? '&' : '?'}${MEDIA_CACHE_BUST}`}
                                                className="w-full h-24 object-cover rounded border border-border/30 bg-black"
                                                controls
                                                muted
                                                preload="metadata"
                                                onError={(e) => {
                                                  const el = e.currentTarget;
                                                  el.style.display = 'none';
                                                  const badge = el.parentElement?.querySelector('.expired-badge');
                                                  if (badge) (badge as HTMLElement).style.display = 'flex';
                                                }}
                                              />
                                            ) : (
                                              <img
                                                src={url}
                                                alt={key}
                                                className="w-full h-24 object-cover rounded border border-border/30 bg-black"
                                                loading="lazy"
                                                onError={(e) => {
                                                  const el = e.currentTarget;
                                                  el.style.display = 'none';
                                                  const badge = el.parentElement?.querySelector('.expired-badge');
                                                  if (badge) (badge as HTMLElement).style.display = 'flex';
                                                }}
                                              />
                                            )}
                                            {/* Expired/broken fallback placeholder — hidden by default, shown on error */}
                                            <div
                                              className="expired-badge w-full h-24 rounded border border-amber-500/30 bg-amber-950/20 items-center justify-center flex-col gap-1"
                                              style={{ display: 'none' }}
                                            >
                                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                                              <span className="text-[8px] text-amber-400 font-medium">Expired</span>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 rounded-b">
                                              <span className="text-[7px] text-white/80 truncate block">{key}</span>
                                            </div>
                                            {isExpiredCdnUrl(url) && (
                                              <div className="absolute top-0.5 left-0.5">
                                                <Badge variant="outline" className="text-[6px] h-3 px-0.5 border-amber-500/50 text-amber-400 bg-black/60">CDN</Badge>
                                              </div>
                                            )}
                                            <a
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <ExternalLink className="h-3 w-3 text-white drop-shadow-md" />
                                            </a>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                                {/* Music audio player if scene has music */}
                                {status.musicUrl && (() => {
                                  const musicExpired = isExpiredCdnUrl(status.musicUrl);
                                  return musicExpired ? (
                                    <div className="flex items-center gap-2 p-1.5 rounded bg-amber-500/10 border border-amber-500/20">
                                      <Music className="h-3 w-3 text-amber-500 flex-shrink-0" />
                                      <span className="text-[10px] text-amber-500">Music URL expired — regenerate in Phase 4</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 p-1.5 rounded bg-muted/30 border border-border/20">
                                      <Music className="h-3 w-3 text-violet-400 flex-shrink-0" />
                                      <audio
                                        key={`${sceneKey}-inline-${status.musicUrl.slice(-20)}`}
                                        src={`${status.musicUrl}${status.musicUrl.includes('?') ? '&' : '?'}${MEDIA_CACHE_BUST}`}
                                        controls
                                        className="h-6 w-full [&::-webkit-media-controls-panel]:h-6"
                                        preload="metadata"
                                        onError={(e) => {
                                          const audio = e.currentTarget;
                                          console.error(`[EP04 Music] ${sceneKey} inline playback error:`, audio.error?.message || 'unknown', `code=${audio.error?.code}`, `src=${status.musicUrl}`);
                                        }}
                                      />
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            );
          })()}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* PHASE 4: MUSIC & SFX (always visible)                             */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {(() => {
            const allMusicDone = Object.keys(sceneProduction).length > 0 &&
              Array.from(scenes.keys()).every(sk => sceneProduction[sk]?.music === 'done');
            return (
            <div className="mt-6">
              <Card className={cn(
                'border transition-all',
                !allMusicDone && 'ring-2 ring-primary/30',
                allMusicDone && 'border-green-500/30 bg-green-500/[0.02]',
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
                        allMusicDone ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary',
                      )}>
                        {allMusicDone ? <CheckCircle2 className="h-4 w-4" /> : '4'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Phase 4: Music & SFX</h3>
                        <p className="text-sm text-muted-foreground">
                          Generate per-scene music tracks and sound effects
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {musicProgress && (
                        <>
                          <Progress value={(musicProgress.current / musicProgress.total) * 100} className="w-32 h-2" />
                          <span className="text-xs text-muted-foreground">{musicProgress.current}/{musicProgress.total}</span>
                        </>
                      )}
                      {!allMusicDone && !musicProgress && (() => {
                        const failedCount = Array.from(scenes.keys()).filter(sk =>
                          sceneProduction[sk]?.music === 'error' || (sceneProduction[sk]?.music === 'done' && !sceneProduction[sk]?.musicUrl)
                        ).length;
                        const hasAnyMusic = Array.from(scenes.keys()).some(sk => sceneProduction[sk]?.musicUrl);
                        return (
                          <div className="flex items-center gap-2">
                            {failedCount > 0 && hasAnyMusic && (
                              <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-600" onClick={() => startAllMusicProduction(true)}>
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Regen {failedCount} Failed
                              </Button>
                            )}
                            <Button size="sm" onClick={() => startAllMusicProduction(false)}>
                              <Music className="h-3 w-3 mr-1" />
                              {hasAnyMusic ? 'Regen All Music' : 'Generate All Music & SFX'}
                            </Button>
                          </div>
                        );
                      })()}
                      {allMusicDone && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                            Complete
                          </Badge>
                          <Button
                            size="sm" variant="outline"
                            className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                            onClick={() => {
                              // Smart regen: only regenerate scenes that failed or have no music
                              startAllMusicProduction(true);
                            }}
                          >
                            <Music className="h-3 w-3 mr-1" />
                            Regen All Music
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Per-scene music status */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Array.from(scenes.keys()).map(sceneKey => {
                      const status = sceneProduction[sceneKey];
                      return (
                        <div key={sceneKey} className={cn(
                          'p-2.5 rounded-lg border text-center',
                          status?.music === 'done' ? 'border-green-500/30 bg-green-500/[0.02]' :
                          status?.music === 'error' ? 'border-red-500/30 bg-red-500/[0.02]' :
                          status?.music === 'generating' ? 'border-primary/30' : 'border-border/30',
                        )}>
                          <p className="text-[10px] font-bold truncate">{SCENE_TITLES[sceneKey]?.split(' — ')[1] || sceneKey}</p>
                          {status?.music === 'done' && status?.musicUrl && <CheckCircle2 className="h-3 w-3 text-green-500 mx-auto mt-1" />}
                          {status?.music === 'generating' && <Loader2 className="h-3 w-3 animate-spin text-primary mx-auto mt-1" />}
                          {status?.music === 'error' && (
                            <div className="mt-1">
                              <AlertTriangle className="h-3 w-3 text-red-500 mx-auto" />
                              <p className="text-[8px] text-red-500 mt-0.5">Failed</p>
                            </div>
                          )}
                          {status?.musicUrl && (() => {
                            const musicExpired = isExpiredCdnUrl(status.musicUrl);
                            return musicExpired ? (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
                                <span className="text-[8px] text-amber-500">URL expired — regenerate</span>
                              </div>
                            ) : (
                              <audio
                                key={`${sceneKey}-music-${status.musicUrl.slice(-20)}`}
                                src={`${status.musicUrl}${status.musicUrl.includes('?') ? '&' : '?'}${MEDIA_CACHE_BUST}`}
                                controls
                                className="w-full mt-2 h-6"
                                onError={(e) => {
                                  const audio = e.currentTarget;
                                  console.error(`[EP04 Music] ${sceneKey} playback error:`, audio.error?.message || 'unknown', `code=${audio.error?.code}`, `src=${status.musicUrl}`);
                                }}
                              />
                            );
                          })()}
                          {/* Per-scene regen button — always visible unless actively generating */}
                          {status?.music !== 'generating' && (
                            <div className="flex gap-1 mt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className={cn(
                                  'flex-1 h-5 text-[8px]',
                                  !status?.musicUrl && 'border-amber-500/30 text-amber-500',
                                )}
                                onClick={() => startSceneMusicProduction(sceneKey)}
                              >
                                <RefreshCw className="h-2.5 w-2.5 mr-0.5" />
                                {status?.musicUrl ? 'Regen' : 'Generate'}
                              </Button>
                              {/* Copy music from another scene (fallback when providers fail) */}
                              {(status?.music === 'error' || !status?.musicUrl) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-5 text-[8px] border-blue-500/30 text-blue-500 px-1.5"
                                  onClick={() => copySceneMusic(sceneKey)}
                                  title="Copy music from a working scene"
                                >
                                  Copy
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            );
          })()}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* PHASE 5: ASSEMBLY → ONE CINEMATIC MOVIE (always visible)          */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {(() => {
            const phase5Done = finalVideoUrl !== null;
            return (
            <div className="mt-6 mb-8">
              <Card className={cn(
                'border transition-all',
                !phase5Done && 'ring-2 ring-primary/30',
                phase5Done && 'border-green-500/30 bg-green-500/[0.02]',
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
                        phase5Done ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary',
                      )}>
                        {phase5Done ? <CheckCircle2 className="h-4 w-4" /> : '5'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Phase 5: Final Assembly</h3>
                        <p className="text-sm text-muted-foreground">
                          Stitch all scenes + transitions + bookends + audio into one cinematic MP4
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assemblyProgress && (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-xs text-muted-foreground">{assemblyProgress}</span>
                          <Button size="sm" variant="destructive" onClick={() => {
                            assemblyCancelledRef.current = true;
                            assemblyTaskIdRef.current = null;
                            setAssemblyJobId(null);
                            setAssemblyProgress(null);
                            setPerScenePolling(false);
                            toast.info('Assembly polling cancelled');
                          }}>
                            <XCircle className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                        </div>
                      )}
                      {!phase5Done && !assemblyProgress && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setAssemblyReadiness(getAssemblyReadiness())}>
                            <Eye className="h-3 w-3 mr-1" />
                            Check Readiness
                          </Button>
                          <Button size="sm" variant="outline" onClick={showPerSceneAssembly}>
                            <Film className="h-3 w-3 mr-1" />
                            Per-Scene (Recommended)
                          </Button>
                          <Button size="sm" variant="outline" onClick={showMultiPartAssembly}>
                            <Layers className="h-3 w-3 mr-1" />
                            Split into Parts
                          </Button>
                          <Button size="sm" onClick={() => startFinalAssembly()}>
                            <Clapperboard className="h-3 w-3 mr-1" />
                            Assemble Full Movie
                          </Button>
                        </div>
                      )}
                      {phase5Done && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* ── Timeline Visualization Bar ───────────────────── */}
                  {assemblyReadiness && (
                    <div className="mb-4 p-3 rounded-lg border bg-muted/10">
                      {/* Summary header */}
                      <div className="flex items-center gap-2 mb-3">
                        {assemblyReadiness.canAssemble ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-sm font-semibold">
                          {assemblyReadiness.canAssemble
                            ? `Ready to assemble — ${assemblyReadiness.readyScenes}/${assemblyReadiness.totalScenes} scenes fully ready`
                            : `Not ready — ${assemblyReadiness.missingScenes} scene(s) missing required assets`}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          ~{Math.round((assemblyReadiness.grandTotalDuration || 0) / 60)}min total
                        </span>
                      </div>

                      {/* Timeline bar: [OPEN] [S0] [T] [S1] [T] ... [S11] [CLOSE] */}
                      <div className="flex items-center gap-0.5 mb-4 overflow-x-auto pb-1">
                        {/* Opening bookend */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-shrink-0 h-6 px-1.5 rounded text-[7px] font-bold flex items-center justify-center bg-violet-500/20 text-violet-400 border border-violet-500/30 cursor-default">
                                OPEN
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Opening bookend (12s) — cinematic reveal + branding</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {assemblyReadiness.scenes.map((s, i) => {
                          const readiness = s.canAssemble ? (s.missing.length === 0 ? 'ready' : 'partial') : 'missing';
                          const colors = {
                            ready: 'bg-green-500/20 text-green-400 border-green-500/30',
                            partial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                            missing: 'bg-red-500/20 text-red-400 border-red-500/30',
                          };
                          return (
                            <React.Fragment key={s.sceneKey}>
                              {/* Transition indicator — colored by bridge TTS status */}
                              {i > 0 && (() => {
                                const bridge = assemblyReadiness.bridgeAudit?.[i - 1];
                                const hasBridgeAudio = bridge?.hasAudio;
                                return (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className={cn(
                                          'flex-shrink-0 h-4 w-4 rounded-sm text-[6px] font-bold flex items-center justify-center border cursor-default',
                                          hasBridgeAudio
                                            ? 'bg-green-500/15 text-green-400 border-green-500/20'
                                            : 'bg-red-500/15 text-red-400 border-red-500/20',
                                        )} title={`Transition ${i - 1}→${i}`}>
                                          T
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs max-w-xs">
                                        <p className="font-bold">Transition {i - 1}→{i} ({bridge?.style || '?'})</p>
                                        <p>{bridge?.text || 'No bridge text'}</p>
                                        <p className={hasBridgeAudio ? 'text-green-400' : 'text-red-400'}>
                                          Bridge TTS: {hasBridgeAudio ? 'Ready' : 'Missing'}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })()}
                              {/* Scene segment */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className={cn(
                                      'flex-shrink-0 h-6 px-1 rounded text-[7px] font-bold flex items-center justify-center border cursor-default min-w-[28px]',
                                      colors[readiness],
                                    )}>
                                      S{i}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs max-w-xs">
                                    <p className="font-bold">{s.title}</p>
                                    <p>TTS: {s.ttsReady}/{s.ttsReady + s.ttsMissing} ({s.expectedDuration}s)</p>
                                    <p>Visuals: {s.videoCount + s.imageCount} | Avatars: {s.avatarCount}</p>
                                    <p>Lipsync: {s.lipsyncReady}/{s.lipsyncReady + s.lipsyncMissing} | Music: {s.hasMusic ? `Yes (${s.musicCoversScene ? 'covers' : 'loops'})` : 'No'}</p>
                                    {s.missing.length > 0 && <p className="text-red-400 font-semibold">Missing: {s.missing.join(', ')}</p>}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </React.Fragment>
                          );
                        })}

                        {/* Closing bookend */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-shrink-0 h-6 px-1.5 rounded text-[7px] font-bold flex items-center justify-center bg-violet-500/20 text-violet-400 border border-violet-500/30 cursor-default">
                                CLOSE
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Closing bookend (16s) — storybook closing + music + SFX</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* Per-scene detail grid — readable cards with clear status */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {assemblyReadiness.scenes.map(s => {
                          const totalTts = s.ttsReady + s.ttsMissing;
                          const totalVisuals = s.videoCount + s.imageCount;
                          const totalLipsync = s.lipsyncReady + s.lipsyncMissing;
                          return (
                            <div key={s.sceneKey} className={cn(
                              'p-2.5 rounded-lg border',
                              s.canAssemble
                                ? (s.missing.length === 0 ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5')
                                : 'border-red-500/30 bg-red-500/5',
                            )}>
                              <p className="text-[11px] font-bold truncate mb-1.5">{s.title.split(' — ')[1] || s.sceneKey}</p>
                              <div className="space-y-1">
                                {/* TTS row */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-muted-foreground">TTS</span>
                                  <span className={cn('text-[10px] font-semibold', s.ttsReady === totalTts ? 'text-green-600' : s.ttsReady > 0 ? 'text-amber-500' : 'text-red-500')}>
                                    {s.ttsReady}/{totalTts} <span className="text-muted-foreground font-normal">({s.expectedDuration}s)</span>
                                  </span>
                                </div>
                                {/* Videos row */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-muted-foreground">Videos</span>
                                  <span className={cn('text-[10px] font-semibold', s.videoCount > 0 ? 'text-green-600' : 'text-muted-foreground')}>
                                    {s.videoCount > 0 ? s.videoCount : 'none'}
                                  </span>
                                </div>
                                {/* Images row */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-muted-foreground">Images</span>
                                  <span className={cn('text-[10px] font-semibold', s.imageCount > 0 ? 'text-green-600' : totalVisuals > 0 ? 'text-muted-foreground' : 'text-red-500')}>
                                    {s.imageCount > 0 ? s.imageCount : 'none'}
                                  </span>
                                </div>
                                {/* Lipsync row */}
                                {totalLipsync > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">Lipsync</span>
                                    <span className={cn('text-[10px] font-semibold', s.lipsyncReady === totalLipsync ? 'text-green-600' : s.lipsyncReady > 0 ? 'text-amber-500' : 'text-red-500')}>
                                      {s.lipsyncReady}/{totalLipsync}
                                      {s.lipsyncEntries.some(l => l.ttsExceeds18s) && <span className="text-amber-500"> (voiceover)</span>}
                                    </span>
                                  </div>
                                )}
                                {/* Avatars row */}
                                {s.avatarCount > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">Avatars</span>
                                    <span className="text-[10px] font-semibold text-green-600">{s.avatarCount}</span>
                                  </div>
                                )}
                                {/* Music row */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-muted-foreground">Music</span>
                                  <span className={cn('text-[10px] font-semibold', s.hasMusic ? 'text-green-600' : 'text-amber-500')}>
                                    {s.hasMusic ? (s.musicCoversScene ? 'Full' : 'Loop') : 'Missing'}
                                  </span>
                                </div>
                                {/* SFX row */}
                                {s.sfxCount > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">SFX</span>
                                    <span className="text-[10px] font-semibold text-green-600">{s.sfxCount}</span>
                                  </div>
                                )}
                              </div>
                              {/* Missing TTS line details */}
                              {s.ttsMissing > 0 && (
                                <div className="mt-1.5 pt-1.5 border-t border-red-500/20">
                                  <p className="text-[9px] text-red-500 font-semibold mb-1">Missing TTS ({s.ttsMissing}):</p>
                                  <div className="space-y-0.5 mb-1.5">
                                    {s.ttsLines.filter(l => !l.hasAudio).slice(0, 5).map(l => (
                                      <p key={l.key} className="text-[8px] text-red-400 truncate" title={l.key}>
                                        {l.voice}: {l.key}
                                      </p>
                                    ))}
                                    {s.ttsLines.filter(l => !l.hasAudio).length > 5 && (
                                      <p className="text-[8px] text-red-400">+{s.ttsLines.filter(l => !l.hasAudio).length - 5} more</p>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full h-6 text-[9px] border-red-500/30 text-red-600 hover:bg-red-500/10"
                                    onClick={() => generateMissingTtsForScene(s.sceneKey)}
                                    disabled={!!batchProgress}
                                  >
                                    <Volume2 className="h-2.5 w-2.5 mr-0.5" />
                                    Regen {s.ttsMissing} Missing TTS
                                  </Button>
                                </div>
                              )}
                              {s.missing.length > 0 && s.ttsMissing === 0 && (
                                <p className="text-[10px] text-red-500 mt-1.5 pt-1.5 border-t border-red-500/20 font-semibold">
                                  Missing: {s.missing.join(', ')}
                                </p>
                              )}
                              {!s.hasMusic && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-1.5 h-6 text-[9px]"
                                  onClick={() => startSceneMusicProduction(s.sceneKey)}
                                >
                                  <Music className="h-2.5 w-2.5 mr-0.5" />
                                  Regen Music
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* ── Bridge Narrator TTS Status ─────────────── */}
                      {assemblyReadiness.bridgeAudit && assemblyReadiness.bridgeAudit.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold">
                              Bridge Narrator TTS: {assemblyReadiness.bridgeReady}/{assemblyReadiness.bridgeAudit.length}
                            </span>
                            {assemblyReadiness.bridgeMissing > 0 && (
                              <>
                                <Badge variant="outline" className="text-[8px] bg-red-500/10 text-red-500 border-red-500/30">
                                  {assemblyReadiness.bridgeMissing} missing
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-5 text-[9px] px-2 border-red-500/30 text-red-600 hover:bg-red-500/10"
                                  onClick={generateMissingBridgeTts}
                                  disabled={!!batchProgress}
                                >
                                  <Volume2 className="h-2.5 w-2.5 mr-0.5" />
                                  Regen {assemblyReadiness.bridgeMissing} Missing
                                </Button>
                              </>
                            )}
                          </div>
                          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
                            {assemblyReadiness.bridgeAudit.map(b => (
                              <div key={b.bridgeKey} className={cn(
                                'p-1.5 rounded border text-[8px]',
                                b.hasAudio ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5',
                              )}>
                                <p className="font-bold">{b.bridgeKey.replace('bridge-', 'B')}</p>
                                <p className="truncate text-muted-foreground">{b.text}</p>
                                <p className={b.hasAudio ? 'text-green-600' : 'text-red-500'}>
                                  {b.hasAudio ? 'Ready' : 'No Audio'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── Regeneration Summary ────────────────────── */}
                      {(() => {
                        const missingTtsScenes = assemblyReadiness.scenes.filter(s => s.ttsMissing > 0);
                        const missingVisualScenes = assemblyReadiness.scenes.filter(s => s.videoCount === 0 && s.imageCount === 0);
                        const missingMusicScenes = assemblyReadiness.scenes.filter(s => !s.hasMusic);
                        const missingLipsyncScenes = assemblyReadiness.scenes.filter(s => s.lipsyncMissing > 0);
                        const missingBridges = (assemblyReadiness.bridgeAudit || []).filter(b => !b.hasAudio);
                        const totalMissingTts = missingTtsScenes.reduce((sum, s) => sum + s.ttsMissing, 0);
                        const hasIssues = missingTtsScenes.length > 0 || missingVisualScenes.length > 0 ||
                          missingMusicScenes.length > 0 || missingBridges.length > 0 || missingLipsyncScenes.length > 0;

                        if (!hasIssues) return (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-xs font-semibold text-green-600">All assets complete — ready for full assembly</span>
                            </div>
                          </div>
                        );

                        return (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              <span className="text-xs font-semibold">Regeneration Needed</span>
                            </div>
                            <div className="space-y-1 text-[9px]">
                              {missingTtsScenes.length > 0 && (
                                <div className="flex items-start gap-1">
                                  <span className="text-red-500 font-bold min-w-[70px]">TTS ({totalMissingTts} lines):</span>
                                  <span className="text-muted-foreground">
                                    {missingTtsScenes.map(s => `${s.title.split(' — ')[1] || s.sceneKey} (${s.ttsMissing})`).join(', ')}
                                  </span>
                                </div>
                              )}
                              {missingVisualScenes.length > 0 && (
                                <div className="flex items-start gap-1">
                                  <span className="text-red-500 font-bold min-w-[70px]">Visuals:</span>
                                  <span className="text-muted-foreground">
                                    {missingVisualScenes.map(s => s.title.split(' — ')[1] || s.sceneKey).join(', ')}
                                  </span>
                                </div>
                              )}
                              {missingMusicScenes.length > 0 && (
                                <div className="flex items-start gap-1">
                                  <span className="text-amber-500 font-bold min-w-[70px]">Music ({missingMusicScenes.length}):</span>
                                  <span className="text-muted-foreground">
                                    {missingMusicScenes.map(s => s.title.split(' — ')[1] || s.sceneKey).join(', ')}
                                  </span>
                                </div>
                              )}
                              {missingLipsyncScenes.length > 0 && (
                                <div className="flex items-start gap-1">
                                  <span className="text-amber-500 font-bold min-w-[70px]">Lipsync:</span>
                                  <span className="text-muted-foreground">
                                    {missingLipsyncScenes.map(s => `${s.title.split(' — ')[1] || s.sceneKey} (${s.lipsyncMissing})`).join(', ')}
                                  </span>
                                </div>
                              )}
                              {missingBridges.length > 0 && (
                                <div className="flex items-start gap-1">
                                  <span className="text-red-500 font-bold min-w-[70px]">Bridges ({missingBridges.length}):</span>
                                  <span className="text-muted-foreground">
                                    {missingBridges.map(b => b.bridgeKey.replace('bridge-', '')).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* ── Batch Regen Action Buttons ──────────── */}
                            <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border/30">
                              {totalMissingTts > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[10px] border-red-500/30 text-red-600 hover:bg-red-500/10"
                                  disabled={!!batchProgress}
                                  onClick={() => {
                                    const allMissingKeys = missingTtsScenes.flatMap(s => s.ttsLines.filter(l => !l.hasAudio).map(l => l.key));
                                    generateMissingForKeys(allMissingKeys);
                                  }}
                                >
                                  <Volume2 className="h-3 w-3 mr-1" />
                                  Regen All {totalMissingTts} Missing TTS
                                </Button>
                              )}
                              {missingMusicScenes.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[10px] border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                  disabled={!!musicProgress}
                                  onClick={() => startAllMusicProduction(true)}
                                >
                                  <Music className="h-3 w-3 mr-1" />
                                  Regen {missingMusicScenes.length} Missing Music + SFX
                                </Button>
                              )}
                              {missingBridges.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[10px] border-red-500/30 text-red-600 hover:bg-red-500/10"
                                  disabled={!!batchProgress}
                                  onClick={generateMissingBridgeTts}
                                >
                                  <Mic className="h-3 w-3 mr-1" />
                                  Regen {missingBridges.length} Missing Bridges
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* ── Multi-Part / Per-Scene Assembly Panel ───────── */}
                  {assemblyParts.length > 0 && (
                    <div className="mb-4 p-3 rounded-lg border border-blue-500/30 bg-blue-500/[0.03]">
                      <div className="flex items-center gap-2 mb-3">
                        {assemblyParts.every(p => p.sceneKeys.length === 1) ? (
                          <Film className="h-4 w-4 text-violet-500" />
                        ) : (
                          <Layers className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="text-sm font-semibold">
                          {assemblyParts.every(p => p.sceneKeys.length === 1)
                            ? `Per-Scene Assembly (${assemblyParts.length} scenes)`
                            : `Multi-Part Assembly (${assemblyParts.length} parts)`}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {assemblyParts.filter(p => p.status === 'completed').length}/{assemblyParts.length} done | JSON2Video Pro: 10min max
                        </span>
                        {/* Render All button for per-scene mode */}
                        {assemblyParts.every(p => p.sceneKeys.length === 1) && assemblyParts.some(p => p.status === 'pending') && !assemblyProgress && (
                          <Button size="sm" variant="default" className="h-6 text-[10px] px-3" onClick={startAllPerSceneAssembly}>
                            <Zap className="h-2.5 w-2.5 mr-0.5" /> Render All ({assemblyParts.filter(p => p.status === 'pending').length})
                          </Button>
                        )}
                      </div>

                      {/* Live assembly status bar */}
                      {assemblyProgress && (
                        <div className="mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500 flex-shrink-0" />
                            <span className="text-xs text-amber-600 font-medium flex-1">{assemblyProgress}</span>
                            <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2" onClick={() => {
                              assemblyCancelledRef.current = true;
                              assemblyTaskIdRef.current = null;
                              setAssemblyJobId(null);
                              setAssemblyProgress(null);
                              setActivePartNumber(null);
                              setPerScenePolling(false);
                              toast.info('Assembly cancelled');
                            }}>
                              <XCircle className="h-2.5 w-2.5 mr-0.5" /> Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {assemblyParts.map(part => {
                          // Calculate what's being stitched for this part
                          const partImages = part.sceneKeys.reduce((sum, sk) => {
                            const s = sceneProduction[sk];
                            return sum + Object.values(s?.imageUrls || {}).filter(u => u?.startsWith('http')).length
                              + Object.values(s?.avatarUrls || {}).filter(u => u?.startsWith('http')).length;
                          }, 0);
                          // Count ALL non-lipsync videos (not just 1 establishing shot)
                          const partVideos = part.sceneKeys.reduce((sum, sk) => {
                            const s = sceneProduction[sk];
                            const lipsyncSet = new Set(Object.values(s?.lipsyncUrls || {}));
                            return sum + Object.values(s?.videoUrls || {})
                              .filter(u => u?.startsWith('http') && !lipsyncSet.has(u)).length;
                          }, 0);
                          const partLipsync = part.sceneKeys.reduce((sum, sk) => {
                            const s = sceneProduction[sk];
                            return sum + Object.values(s?.lipsyncUrls || {}).filter(u => u?.startsWith('http')).length;
                          }, 0);
                          // Music: check both HTTP and data: URIs (data: will be auto-uploaded before render)
                          const partMusicHttp = part.sceneKeys.filter(sk => sceneProduction[sk]?.musicUrl?.startsWith('http')).length;
                          const partMusicData = part.sceneKeys.filter(sk => {
                            const m = sceneProduction[sk]?.musicUrl;
                            return m && !m.startsWith('http');
                          }).length;
                          const partMusicTotal = partMusicHttp + partMusicData;
                          const isActive = activePartNumber === part.partNumber;

                          return (
                            <div key={part.partNumber} className={cn(
                              'p-3 rounded-lg border transition-all',
                              part.status === 'completed' && 'border-green-500/30 bg-green-500/[0.03]',
                              part.status === 'rendering' && 'border-amber-500/30 bg-amber-500/[0.03] ring-1 ring-amber-500/20',
                              part.status === 'failed' && 'border-red-500/30 bg-red-500/[0.03]',
                              part.status === 'pending' && 'border-muted bg-muted/10',
                            )}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold">
                                  Part {part.partNumber}/{assemblyParts.length}
                                  {part.partNumber === 1 && ' (+ Opening)'}
                                  {part.partNumber === assemblyParts.length && ' (+ Closing)'}
                                </span>
                                <Badge variant="outline" className={cn(
                                  'text-[9px]',
                                  part.status === 'completed' && 'bg-green-500/10 text-green-600 border-green-500/30',
                                  part.status === 'rendering' && 'bg-amber-500/10 text-amber-600 border-amber-500/30',
                                  part.status === 'failed' && 'bg-red-500/10 text-red-600 border-red-500/30',
                                  part.status === 'pending' && 'bg-muted/10 text-muted-foreground',
                                )}>
                                  {part.status === 'rendering' && <Loader2 className="h-2.5 w-2.5 mr-0.5 animate-spin" />}
                                  {part.status}
                                </Badge>
                              </div>

                              {/* Scene names */}
                              <p className="text-[10px] text-muted-foreground mb-1">
                                {part.sceneKeys.map(k => SCENE_TITLES[k]?.replace(/Scene \d+ — /, '') || k).join(' → ')}
                                {part._subPartLineRange && (
                                  <span className="text-violet-500 ml-1">(lines {part._subPartLineRange.start + 1}-{part._subPartLineRange.end})</span>
                                )}
                              </p>

                              {/* Asset summary — clearer layout with icons */}
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-medium">
                                  {part.ttsCount} TTS
                                </span>
                                {partVideos > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 font-medium">
                                    {partVideos} video{partVideos > 1 ? 's' : ''}
                                  </span>
                                )}
                                {partImages > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 font-medium">
                                    {partImages} image{partImages > 1 ? 's' : ''}
                                  </span>
                                )}
                                {partVideos === 0 && partImages === 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 font-medium">
                                    no visuals
                                  </span>
                                )}
                                {partLipsync > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-600 font-medium">
                                    {partLipsync} lipsync
                                  </span>
                                )}
                                <span className={cn(
                                  'text-[10px] px-1.5 py-0.5 rounded font-medium',
                                  partMusicTotal > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600',
                                )}>
                                  {partMusicTotal > 0
                                    ? `music ${partMusicHttp > 0 ? '(uploaded)' : '(auto-upload)'}`
                                    : 'no music'}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                  ~{Math.round(part.estimatedDuration / 60)}min
                                </span>
                              </div>

                              {/* Rendering progress for active part */}
                              {part.status === 'rendering' && isActive && assemblyProgress && (
                                <div className="mb-2 text-[10px] text-amber-600 font-medium flex items-center gap-1">
                                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                  {assemblyProgress}
                                </div>
                              )}

                              {/* Action buttons */}
                              <div className="flex items-center gap-1">
                                {part.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    className="h-6 text-[10px] px-2"
                                    disabled={!!assemblyJobId}
                                    onClick={() => startFinalAssembly(part.partNumber)}
                                  >
                                    <Clapperboard className="h-2.5 w-2.5 mr-0.5" />
                                    Assemble Part {part.partNumber}
                                  </Button>
                                )}
                                {part.status === 'rendering' && isActive && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-6 text-[10px] px-2"
                                    onClick={() => {
                                      assemblyCancelledRef.current = true;
                                      assemblyTaskIdRef.current = null;
                                      setAssemblyJobId(null);
                                      setAssemblyProgress(null);
                                      setActivePartNumber(null);
                                      setPerScenePolling(false);
                                      setAssemblyParts(prev => prev.map(p =>
                                        p.partNumber === part.partNumber ? { ...p, status: 'failed', errorMessage: 'Cancelled by user' } : p
                                      ));
                                      toast.info(`Part ${part.partNumber} cancelled`);
                                    }}
                                  >
                                    <XCircle className="h-2.5 w-2.5 mr-0.5" /> Cancel
                                  </Button>
                                )}
                                {part.status === 'failed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-[10px] px-2 border-red-500/30 text-red-600"
                                    disabled={!!assemblyJobId}
                                    onClick={() => startFinalAssembly(part.partNumber)}
                                  >
                                    <RefreshCw className="h-2.5 w-2.5 mr-0.5" />
                                    Retry
                                  </Button>
                                )}
                                {part.status === 'completed' && part.videoUrl && (
                                  <>
                                    <a
                                      href={part.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                                    >
                                      <Download className="h-2.5 w-2.5" /> Download
                                    </a>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-[10px] px-2"
                                      onClick={() => {
                                        // Toggle inline video player
                                        const el = document.getElementById(`part-video-${part.partNumber}`);
                                        if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                                      }}
                                    >
                                      <Eye className="h-2.5 w-2.5 mr-0.5" /> Preview
                                    </Button>
                                  </>
                                )}
                                {part.errorMessage && (
                                  <span className="text-[9px] text-red-500 truncate max-w-[200px]" title={part.errorMessage}>
                                    {part.errorMessage}
                                  </span>
                                )}
                              </div>

                              {/* Inline video player */}
                              {part.status === 'completed' && part.videoUrl && (
                                <div id={`part-video-${part.partNumber}`} style={{ display: 'none' }} className="mt-2">
                                  <video
                                    src={part.videoUrl}
                                    controls
                                    className="w-full rounded-lg border max-h-[200px]"
                                    preload="metadata"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* All parts complete — Stitch into final video */}
                      {assemblyParts.every(p => p.status === 'completed') && (
                        <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                          <p className="text-xs text-green-600 font-semibold mb-2">
                            All {assemblyParts.length} parts rendered successfully!
                          </p>

                          {/* Stitch button + status */}
                          {concatStatus === 'idle' && !concatVideoUrl && (
                            <Button
                              size="sm"
                              onClick={startConcatStitch}
                              className="w-full mb-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs"
                            >
                              <Film className="h-3.5 w-3.5 mr-1.5" />
                              Stitch All {assemblyParts.length} Parts into Final Video
                            </Button>
                          )}
                          {concatStatus === 'submitting' && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-amber-500">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Submitting stitching timeline...
                            </div>
                          )}
                          {concatStatus === 'rendering' && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-amber-500">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Rendering final video... {assemblyProgress || ''}
                            </div>
                          )}
                          {concatStatus === 'failed' && (
                            <div className="mb-2">
                              <p className="text-xs text-red-500 mb-1">Stitching failed: {concatError}</p>
                              <Button size="sm" variant="outline" onClick={() => { setConcatStatus('idle'); setConcatError(null); }}
                                className="text-[10px]">
                                Retry
                              </Button>
                            </div>
                          )}
                          {concatStatus === 'completed' && concatVideoUrl && (
                            <div className="mb-2 p-2 rounded bg-green-500/10 border border-green-500/30">
                              <div className="flex items-center gap-1.5 mb-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-xs font-semibold text-green-600">Final Video Ready</span>
                              </div>
                              <a href={concatVideoUrl} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5">
                                <Download className="h-2.5 w-2.5" /> Download Final Video
                              </a>
                            </div>
                          )}

                          {/* Individual part downloads (always available) */}
                          <details className="mt-1">
                            <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                              Individual part downloads
                            </summary>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {assemblyParts.map(p => p.videoUrl && (
                                <a key={p.partNumber} href={p.videoUrl} target="_blank" rel="noopener noreferrer"
                                  className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5">
                                  <Download className="h-2.5 w-2.5" /> Part {p.partNumber}
                                </a>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assembly pipeline — JSON2Video */}
                  <div className="space-y-2">
                    {[
                      { label: 'Readiness audit', desc: 'Verify TTS + visuals + music for all 12 scenes' },
                      { label: 'Build timeline', desc: 'Assemble scene chapters with audio + visual layers' },
                      { label: 'JSON2Video render', desc: 'Cloud-based timeline rendering → cinematic MP4' },
                    ].map(stage => (
                      <div key={stage.label} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium">{stage.label}</p>
                          <p className="text-[9px] text-muted-foreground">{stage.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Final video preview + download */}
                  {finalVideoUrl && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <h4 className="text-sm font-bold text-green-600">Cinematic Movie Ready</h4>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-green-500/30">
                        <video
                          src={finalVideoUrl}
                          controls
                          className="w-full"
                          poster={SCENE_BACKGROUNDS['scene-0-title']}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" asChild>
                          <a href={finalVideoUrl} download="EP04-Sprint-Documentary.mp4">
                            <Download className="h-3 w-3 mr-1" />
                            Download MP4
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(finalVideoUrl, '_blank')}>
                          <Eye className="h-3 w-3 mr-1" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            );
          })()}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* PHASE 6: PRODUCTION GALLERY & PUBLISH                             */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {(() => {
            // Unlocked when any scene has generated assets OR Phase 5 is complete
            const hasAnyAssets = Object.values(sceneProduction).some(s =>
              Object.values(s.videoUrls || {}).some(u => u) ||
              Object.values(s.imageUrls || {}).some(u => u) ||
              Object.values(s.avatarUrls || {}).some(u => u) ||
              Object.values(s.lipsyncUrls || {}).some(u => u)
            );
            // Phase 6 always visible — no gating
            const _hasAnyAssetsOrComplete = hasAnyAssets || productionPhase === 'complete';

            // Gather all scene keys that have assets
            const sceneKeys = Array.from(scenes.keys());
            const scenesWithAssets = sceneKeys.filter(sk => {
              const s = sceneProduction[sk];
              if (!s) return false;
              return Object.values(s.videoUrls || {}).some(u => u) ||
                Object.values(s.imageUrls || {}).some(u => u) ||
                Object.values(s.avatarUrls || {}).some(u => u) ||
                Object.values(s.lipsyncUrls || {}).some(u => u);
            });

            return (
            <div className="mt-6">
              <Card className="border ring-2 ring-violet-500/30 bg-violet-500/[0.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold bg-violet-500/10 text-violet-400">
                        6
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Phase 6: Gallery & Publish</h3>
                        <p className="text-sm text-muted-foreground">
                          Browse all assets, publish to platforms, and repurpose content
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-400 border-violet-500/30">
                      {scenesWithAssets.length} scenes • {finalVideoUrl ? 'Movie ready' : 'Assets available'}
                    </Badge>
                  </div>

                  <Tabs defaultValue="gallery" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="gallery" className="text-xs gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        Gallery
                      </TabsTrigger>
                      <TabsTrigger value="publish" className="text-xs gap-1.5">
                        <Share2 className="h-3.5 w-3.5" />
                        Social & Publish
                      </TabsTrigger>
                      <TabsTrigger value="repurpose" className="text-xs gap-1.5">
                        <Scissors className="h-3.5 w-3.5" />
                        Repurpose
                      </TabsTrigger>
                    </TabsList>

                    {/* ── Tab 1: Gallery ── */}
                    <TabsContent value="gallery" className="space-y-4">
                      {/* Final assembled movie */}
                      {finalVideoUrl && (
                        <Card className="border-green-500/30 bg-green-500/[0.02]">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Clapperboard className="h-4 w-4 text-green-500" />
                              <h4 className="text-sm font-bold text-green-600">Final Movie</h4>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-green-500/30">
                              <video
                                src={finalVideoUrl}
                                controls
                                className="w-full"
                                poster={SCENE_BACKGROUNDS['scene-0-title']}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" asChild>
                                <a href={finalVideoUrl} download="EP04-Sprint-Documentary.mp4">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download MP4
                                </a>
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => window.open(finalVideoUrl, '_blank')}>
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Open in New Tab
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Per-scene asset sections */}
                      {scenesWithAssets.map(sceneKey => {
                        const s = sceneProduction[sceneKey];
                        if (!s) return null;
                        const allEntries = [
                          ...Object.entries(s.videoUrls || {}).filter(([, u]) => u).map(([k, u]) => ({ key: k, url: u, isVideo: true })),
                          ...Object.entries(s.imageUrls || {}).filter(([, u]) => u).map(([k, u]) => ({ key: k, url: u, isVideo: false })),
                          ...Object.entries(s.avatarUrls || {}).filter(([, u]) => u).map(([k, u]) => ({ key: k, url: u, isVideo: false })),
                          ...Object.entries(s.lipsyncUrls || {}).filter(([, u]) => u).map(([k, u]) => ({ key: k, url: u, isVideo: true })),
                        ];
                        return (
                          <Card key={sceneKey} className="border-border/50">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={SCENE_BACKGROUNDS[sceneKey]}
                                  alt={sceneKey}
                                  className="h-10 w-16 object-cover rounded border border-border/30"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold truncate">{SCENE_TITLES[sceneKey] || sceneKey}</h4>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[9px]">{allEntries.length} assets</Badge>
                                    {s.assembledClipUrl && <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-600 border-green-500/30">Assembled</Badge>}
                                  </div>
                                </div>
                              </div>

                              {/* Assembled scene clip */}
                              {s.assembledClipUrl && (
                                <div className="rounded-lg overflow-hidden border border-green-500/20">
                                  <video src={s.assembledClipUrl} controls className="w-full" preload="metadata" />
                                </div>
                              )}

                              {/* Asset grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {allEntries.map(({ key, url, isVideo }) => (
                                  <div key={key} className="relative group">
                                    {isVideo ? (
                                      <video
                                        src={url}
                                        className="w-full h-28 object-cover rounded border border-border/30 bg-black"
                                        controls
                                        muted
                                        preload="metadata"
                                      />
                                    ) : (
                                      <img
                                        src={url}
                                        alt={key}
                                        className="w-full h-28 object-cover rounded border border-border/30 bg-black"
                                        loading="lazy"
                                      />
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1.5 py-0.5 rounded-b">
                                      <span className="text-[8px] text-white/80 truncate block">{key}</span>
                                    </div>
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-0.5"
                                    >
                                      <ExternalLink className="h-3 w-3 text-white" />
                                    </a>
                                  </div>
                                ))}
                              </div>

                              {/* Music audio player */}
                              {s.musicUrl && (
                                <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/20">
                                  <Music className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                                  <span className="text-[9px] text-muted-foreground font-medium">Music</span>
                                  <audio src={s.musicUrl} controls className="h-7 flex-1" preload="metadata" />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </TabsContent>

                    {/* ── Tab 2: Social & Publish ── */}
                    <TabsContent value="publish">
                      <EP04PublishHub
                        sessionTitle="EP04 — Sprint Documentary"
                        productionArtifacts={finalVideoUrl ? {
                          assembledVideoUrl: finalVideoUrl,
                          sceneVideoUrls: sceneKeys
                            .map(sk => sceneProduction[sk]?.assembledClipUrl)
                            .filter((url): url is string => !!url),
                          audioUrl: null,
                          captionFiles: [],
                          thumbnailUrls: [],
                          exportPresets: [],
                          speakerTracks: [],
                        } : undefined}
                      />
                    </TabsContent>

                    {/* ── Tab 3: Repurpose ── */}
                    <TabsContent value="repurpose">
                      <ContentRepurposingPanel
                        sessionTitle="EP04 — Sprint Documentary"
                        productionArtifacts={finalVideoUrl ? {
                          assembledVideoUrl: finalVideoUrl,
                          sceneVideoUrls: sceneKeys
                            .map(sk => sceneProduction[sk]?.assembledClipUrl)
                            .filter((url): url is string => !!url),
                          audioUrl: null,
                          captionFiles: [],
                          thumbnailUrls: [],
                          exportPresets: [],
                          speakerTracks: [],
                        } : undefined}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            );
          })()}

        </div>
      </ScrollArea>
    </div>
  );
}
