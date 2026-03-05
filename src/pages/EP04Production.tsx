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
import { EP04_VOICES, EP04_STORYBOOK_TRANSITIONS, EP04_STORYBOOK_BOOKENDS, EP04_CHARACTER_INTERACTIONS, EP04_NARRATOR_SCROLLS, SCRIPT_TO_PIPELINE_MAP, EP04_AVATAR_CONFIG, EP04_SCENE_PIPELINES } from '@/config/ep04-production-config';
import { EP04_SCENE_SCREENSHOT_MAP, PRODUCT_SCREENS } from '@/components/genie-hub/MultiScreenshotGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EP04PublishHub } from '@/components/genie-cast/EP04PublishHub';
import { ContentRepurposingPanel } from '@/components/genie-cast/ContentRepurposingPanel';
import { useCastProjectPersistence } from '@/hooks/useCastProjectPersistence';
import { useCastProjectData } from '@/hooks/useCastProjectData';
import { Save, FolderOpen } from 'lucide-react';

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

// Character avatar imports — upgraded to Pixar 3D portraits for visual consistency with scene backgrounds
import hostAvatar from '@/assets/characters/host-avatar-3d.png';
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
// (host avatar PNG only shows the dog — needs AI regeneration to show the human PO)
// Note: allaudin removed — pre-made genie avatar works well, AI regen hits DashScope rate limits
const REGENERATE_AVATAR_VIA_AI: Set<string> = new Set(['host']);

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
  const [autoProjectId, setAutoProjectId] = useState<string | null>(null);
  const [projectLoadError, setProjectLoadError] = useState<string | null>(null);
  const [projectLoading, setProjectLoading] = useState(!urlProjectId);
  const [loadStep, setLoadStep] = useState<string>(''); // diagnostic step
  const [retryCount, setRetryCount] = useState(0); // triggers effect re-run
  const projectId = urlProjectId || autoProjectId;
  const {
    saveProjectContent, loadProjectContent, updateLineTTS,
    trackGenerationJob, completeGenerationJob, fetchTokenBreakdown,
    tokenBreakdown, isSaving, isLoading: isLoadingContent,
    updateSceneArtifacts, updateSceneMusic, updateFinalAssembly,
  } = useCastProjectPersistence();

  // ─── Auto-create cast_projects row if none exists ──────────────────
  // Uses exact style_intent match to prevent duplicates (not fuzzy title match)
  const autoCreateAttempted = React.useRef(false);
  useEffect(() => {
    if (urlProjectId || autoProjectId) return;
    // Guard against React strict-mode double-fire, but allow retries
    if (autoCreateAttempted.current && retryCount === 0) return;
    autoCreateAttempted.current = true;
    setProjectLoading(true);
    setProjectLoadError(null);
    setLoadStep('Checking authentication...');

    // Timeout guard — 20s max (down from 30s for faster feedback)
    const timeoutId = setTimeout(() => {
      setProjectLoading(false);
      setProjectLoadError(`Timed out at step: "${loadStep || 'authentication check'}". Supabase may be unreachable — check your network or try again.`);
    }, 20000);

    let cancelled = false;

    (async () => {
      try {
        // Step 1: Auth check with explicit timeout
        const authPromise = supabase.auth.getUser();
        const authTimeout = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timed out after 8 seconds')), 8000)
        );
        const authResult = await Promise.race([authPromise, authTimeout]) as any;
        if (cancelled) return;

        const user = authResult?.data?.user;
        if (!user) {
          const authError = authResult?.error;
          console.error('[EP04] Auth failed — no user session:', authError);
          setProjectLoadError(authError?.message || 'Not authenticated — please sign in and refresh');
          setProjectLoading(false);
          clearTimeout(timeoutId);
          return;
        }
        setLoadStep('Looking up EP04 project...');

        const db = supabase as any;

        // Step 2: Look up existing project by style_intent
        const { data: existing, error: lookupErr } = await db
          .from('cast_projects')
          .select('id')
          .eq('user_id', user.id)
          .eq('style_intent', 'ep04-sprint-documentary')
          .limit(1)
          .maybeSingle();

        if (cancelled) return;
        if (lookupErr) {
          console.error('[EP04] DB lookup error:', lookupErr);
          setProjectLoadError(`Database query failed: ${lookupErr.message}`);
          setProjectLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        if (existing?.id) {
          setAutoProjectId(existing.id);
          setProjectLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        // Step 3: Fallback — check by title for legacy rows
        setLoadStep('Checking legacy project titles...');
        const { data: legacyExisting } = await db
          .from('cast_projects')
          .select('id')
          .eq('user_id', user.id)
          .ilike('title', '%EP04%')
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (legacyExisting?.id) {
          await db.from('cast_projects')
            .update({ style_intent: 'ep04-sprint-documentary' })
            .eq('id', legacyExisting.id);
          setAutoProjectId(legacyExisting.id);
          setProjectLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        // Step 4: Create new project
        setLoadStep('Creating EP04 project...');
        const { data: created, error } = await db
          .from('cast_projects')
          .insert({
            user_id: user.id,
            title: 'EP04 — Sprint Documentary',
            description: 'GenieSuite Sprint Documentary — 12 scenes, 5 voices, ~27 min',
            status: 'scripted',
            style_intent: 'ep04-sprint-documentary',
            quality: 'production',
            target_regions: ['global'],
            selected_dialects: ['en-US'],
          })
          .select('id')
          .single();

        if (cancelled) return;
        if (!error && created) {
          setAutoProjectId(created.id);
          console.log('[EP04] Auto-created project:', created.id);
        } else {
          console.error('[EP04] Failed to create project row:', error);
          setProjectLoadError(error?.message || 'Failed to create project — check database');
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('[EP04] Project lookup/create error:', err);
        setProjectLoadError(err.message || 'Failed to load project');
      } finally {
        if (!cancelled) {
          setProjectLoading(false);
          clearTimeout(timeoutId);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [urlProjectId, autoProjectId, retryCount]); // retryCount triggers re-run

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
    // AUTHORITATIVE line list — always from static config (109 dialogue + 11 bridges = 120).
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

  // ─── Load persisted TTS audio + production phase on mount ───────────────
  // Strategy: Try cast_project_script_lines first. If empty (auto-seed wiped TTS),
  // fall back to cast_generation_jobs which preserves output_url for every completed job.

  useEffect(() => {
    if (!projectId || contentLoaded) return;
    (async () => {
      const db = supabase as any;
      const restoredAudio: Record<string, GeneratedAudio> = {};
      const restoredStatus: Record<string, LineStatus> = {};

      // ── Source 1: cast_project_script_lines (primary) ──────────────
      try {
        const { data: ttsLines } = await db
          .from('cast_project_script_lines')
          .select('line_key, tts_audio_url, tts_provider, tts_voice_id, tts_status')
          .eq('project_id', projectId)
          .eq('tts_status', 'generated')
          .not('tts_audio_url', 'is', null);

        if (ttsLines) {
          for (const line of ttsLines) {
            restoredAudio[line.line_key] = {
              audioUrl: line.tts_audio_url,
              provider: line.tts_provider || 'unknown',
              voice: line.tts_voice_id || 'unknown',
            };
            restoredStatus[line.line_key] = 'done';
          }
        }
      } catch (err) {
        console.warn('[EP04] Script lines TTS query failed:', err);
      }

      // ── Source 2: cast_generation_jobs (fallback — recovers wiped TTS) ──
      // If auto-seed overwrote script_lines with null TTS, generation_jobs
      // still has the output_url from the original generation.
      try {
        const { data: jobs } = await db
          .from('cast_generation_jobs')
          .select('line_key, output_url, provider')
          .eq('project_id', projectId)
          .eq('job_type', 'tts')
          .eq('status', 'completed')
          .not('output_url', 'is', null)
          .not('line_key', 'is', null);

        if (jobs) {
          for (const job of jobs) {
            // Only fill gaps — don't overwrite lines already restored from source 1
            if (!restoredAudio[job.line_key]) {
              restoredAudio[job.line_key] = {
                audioUrl: job.output_url,
                provider: job.provider || 'unknown',
                voice: 'unknown',
              };
              restoredStatus[job.line_key] = 'done';
            }
          }
        }
      } catch (err) {
        console.warn('[EP04] Generation jobs TTS query failed:', err);
      }

      // Auto-mark visual-only lines (empty text) as done — they don't need TTS
      for (const [key, line] of Object.entries(scriptContentForUI)) {
        if (!line.text || line.text.trim().length === 0) {
          restoredAudio[key] = { audioUrl: '', provider: 'none', voice: 'visual-only' };
          restoredStatus[key] = 'done';
        }
      }

      // Apply restored TTS
      if (Object.keys(restoredAudio).length > 0) {
        setAudioMap(restoredAudio);
        setStatusMap(restoredStatus);
        const staticKeys = new Set(Object.keys(scriptContentForUI));
        const matchCount = Object.keys(restoredAudio).filter(k => staticKeys.has(k)).length;
        toast.success(`Restored ${matchCount} saved voiceovers`);
        console.log(`[EP04] TTS restored: ${matchCount} match static config, ${Object.keys(restoredAudio).length} total from DB`);

        // ── Re-persist recovered TTS back to script_lines (repair wiped data) ──
        // CRITICAL: Batch updates with delays to avoid exhausting the DB connection pool.
        // Previously fired 120 concurrent UPDATE queries that crashed Supabase.
        const linesToRepair = Object.entries(restoredAudio).filter(([k]) => staticKeys.has(k));
        const BATCH_SIZE = 5;
        for (let i = 0; i < linesToRepair.length; i += BATCH_SIZE) {
          const batch = linesToRepair.slice(i, i + BATCH_SIZE);
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
          // Breathe between batches to avoid connection pool exhaustion
          if (i + BATCH_SIZE < linesToRepair.length) {
            await new Promise(r => setTimeout(r, 200));
          }
        }
      }

      // ── Restore visual/music/assembly artifacts ──
      // (production phase is inferred from restored artifacts below instead of a DB column)
      // Source 1: scene_config.artifacts (from updateSceneArtifacts)
      // Source 2 (fallback): cast_generation_jobs output_url (always saved on generation)
      const restored: Record<string, SceneProductionStatus> = {};

      // Source 1: cast_project_scenes.scene_config.artifacts
      try {
        const { data: dbScenes } = await db
          .from('cast_project_scenes')
          .select('scene_key, scene_config')
          .eq('project_id', projectId);

        console.log(`[PERSIST RESTORE] Found ${dbScenes?.length || 0} scene rows in DB`);
        if (dbScenes) {
          for (const row of dbScenes) {
            const cfg = (row.scene_config || {}) as Record<string, any>;
            const artifacts = cfg.artifacts as Record<string, Record<string, string>> | undefined;
            const gm = cfg.generatedMusic as { url?: string; sfxUrls?: string[] } | undefined;

            // Check ALL production data — not just artifacts
            const hasArtifacts = artifacts && (
              Object.values(artifacts.videoUrls || {}).some(u => u) ||
              Object.values(artifacts.imageUrls || {}).some(u => u) ||
              Object.values(artifacts.avatarUrls || {}).some(u => u) ||
              Object.values(artifacts.lipsyncUrls || {}).some(u => u)
            );
            const hasMusic = !!(gm?.url);
            const hasSfx = !!(gm?.sfxUrls && gm.sfxUrls.length > 0);
            const hasAssembly = !!cfg.assembledClipUrl;

            if (!hasArtifacts && !hasMusic && !hasSfx && !hasAssembly) {
              const configKeys = Object.keys(cfg);
              console.log(`[PERSIST RESTORE] ${row.scene_key}: no production data in scene_config (keys: ${configKeys.join(', ')})`);
              continue;
            }

            const vCount = Object.keys(artifacts?.videoUrls || {}).length;
            const iCount = Object.keys(artifacts?.imageUrls || {}).length;
            const aCount = Object.keys(artifacts?.avatarUrls || {}).length;
            const lCount = Object.keys(artifacts?.lipsyncUrls || {}).length;
            console.log(`[PERSIST RESTORE] ${row.scene_key}: ${vCount} videos, ${iCount} images, ${aCount} avatars, ${lCount} lipsync, music=${hasMusic}, sfx=${hasSfx}, assembled=${hasAssembly}`);

            restored[row.scene_key] = {
              visual: hasArtifacts ? 'done' : 'idle',
              music: hasMusic ? 'done' : 'idle',
              sfx: hasSfx ? 'done' : 'idle',
              assembled: hasAssembly ? 'done' : 'idle',
              videoUrls: artifacts?.videoUrls || {},
              imageUrls: artifacts?.imageUrls || {},
              avatarUrls: artifacts?.avatarUrls || {},
              lipsyncUrls: artifacts?.lipsyncUrls || {},
              musicUrl: gm?.url || null,
              sfxUrls: gm?.sfxUrls || [],
              assembledClipUrl: cfg.assembledClipUrl || null,
            };
          }
        }
      } catch (e) {
        console.warn('[PERSIST RESTORE] scene_config artifacts restore FAILED:', e);
      }

      // Track which scenes came from Source 1 (authoritative) — Source 2 will skip these
      const source1SceneKeys = new Set<string>(Object.keys(restored));

      // Source 2: cast_generation_jobs — ONLY latest job per (scene_key, job_type)
      // Used as gap-fill when Source 1 is empty for a scene. ORDER BY DESC so we
      // see newest first, then deduplicate by (scene_key, job_type) keeping only the first.
      try {
        const { data: visualJobs } = await db
          .from('cast_generation_jobs')
          .select('scene_key, job_type, output_url')
          .eq('project_id', projectId)
          .eq('status', 'completed')
          .not('output_url', 'is', null)
          .not('scene_key', 'is', null)
          .neq('job_type', 'tts')
          .order('created_at', { ascending: false });

        if (visualJobs) {
          // Deduplicate: keep only the LATEST job per (scene_key, job_type)
          const seen = new Set<string>();
          for (const job of visualJobs) {
            const sk = job.scene_key;
            if (!sk || !job.output_url) continue;
            const dedupeKey = `${sk}::${job.job_type}`;
            if (seen.has(dedupeKey)) continue; // skip older versions
            seen.add(dedupeKey);

            // Skip if Source 1 already has this scene (Source 1 is authoritative)
            if (source1SceneKeys.has(sk)) continue;

            if (!restored[sk]) {
              restored[sk] = {
                visual: 'done', music: 'idle', sfx: 'idle', assembled: 'idle',
                videoUrls: {}, imageUrls: {}, avatarUrls: {}, lipsyncUrls: {},
                musicUrl: null, sfxUrls: [], assembledClipUrl: null,
              };
            }
            const jt = job.job_type;
            const url = job.output_url as string;
            const isImageUrl = /\.(png|jpg|jpeg|webp|gif)(\?|$)/i.test(url);
            const urlKey = `${jt}-${sk}`;
            // Also skip if this URL is already present in the bucket
            const alreadyHasUrl = (bucket: Record<string, string>) =>
              Object.values(bucket).includes(url);
            if (jt === 'avatar') {
              if (!alreadyHasUrl(restored[sk].avatarUrls)) restored[sk].avatarUrls[urlKey] = url;
            } else if (jt === 'lipsync') {
              if (!alreadyHasUrl(restored[sk].lipsyncUrls)) restored[sk].lipsyncUrls[urlKey] = url;
            } else if (jt === 'image' || isImageUrl) {
              if (!alreadyHasUrl(restored[sk].imageUrls)) restored[sk].imageUrls[urlKey] = url;
            } else {
              if (!alreadyHasUrl(restored[sk].videoUrls)) restored[sk].videoUrls[urlKey] = url;
            }
          }
        }
      } catch (e) {
        console.warn('[EP04] generation_jobs visual restore failed:', e);
      }

      // Keep ALL URLs including external CDN URLs — only filter placeholders
      // DashScope URLs display fine in <img> tags (no CORS for images)
      // New generations get Supabase Storage URLs from the edge function (server-side mirroring)
      const filterPlaceholders = (urls: Record<string, string>): Record<string, string> => {
        const clean: Record<string, string> = {};
        for (const [k, v] of Object.entries(urls)) {
          if (v && !v.includes('placehold.co')) {
            clean[k] = v;
          }
        }
        return clean;
      };

      for (const sk of Object.keys(restored)) {
        restored[sk].videoUrls = filterPlaceholders(restored[sk].videoUrls);
        restored[sk].imageUrls = filterPlaceholders(restored[sk].imageUrls);
        restored[sk].avatarUrls = filterPlaceholders(restored[sk].avatarUrls);
        restored[sk].lipsyncUrls = filterPlaceholders(restored[sk].lipsyncUrls);
        const totalUrls = Object.keys(restored[sk].videoUrls).length + Object.keys(restored[sk].imageUrls).length
          + Object.keys(restored[sk].avatarUrls).length + Object.keys(restored[sk].lipsyncUrls).length;
        if (totalUrls === 0) {
          restored[sk].visual = 'idle';
        }
      }

      // ── Auto-cleanup: dedup by URL value + detect expired CDN URLs ──
      let totalDupsRemoved = 0;
      let expiredSceneCount = 0;
      const dedupBucket = (bucket: Record<string, string>): Record<string, string> => {
        const seenUrls = new Set<string>();
        const clean: Record<string, string> = {};
        for (const [k, v] of Object.entries(bucket)) {
          if (!v || seenUrls.has(v)) {
            totalDupsRemoved++;
            continue;
          }
          seenUrls.add(v);
          clean[k] = v;
        }
        return clean;
      };
      for (const sk of Object.keys(restored)) {
        restored[sk].videoUrls = dedupBucket(restored[sk].videoUrls);
        restored[sk].imageUrls = dedupBucket(restored[sk].imageUrls);
        restored[sk].avatarUrls = dedupBucket(restored[sk].avatarUrls);
        restored[sk].lipsyncUrls = dedupBucket(restored[sk].lipsyncUrls);
        // Check for expired CDN URLs in this scene
        const allUrls = [
          ...Object.values(restored[sk].videoUrls),
          ...Object.values(restored[sk].imageUrls),
          ...Object.values(restored[sk].avatarUrls),
          ...Object.values(restored[sk].lipsyncUrls),
        ];
        if (allUrls.some(u => isExpiredCdnUrl(u))) {
          expiredSceneCount++;
        }
      }
      // Count scenes with no assets at all
      const allSceneKeys = Object.keys(SCENE_TITLES);
      const notGeneratedCount = allSceneKeys.filter(sk => !restored[sk] || restored[sk].visual !== 'done').length;
      // Summary toast (silent for dedup, informational for expired/missing)
      const toastParts: string[] = [];
      if (totalDupsRemoved > 0) toastParts.push(`Cleaned ${totalDupsRemoved} duplicate(s)`);
      if (expiredSceneCount > 0) toastParts.push(`${expiredSceneCount} scene(s) may have expired CDN URLs`);
      if (notGeneratedCount > 0 && notGeneratedCount < allSceneKeys.length) toastParts.push(`${notGeneratedCount} scene(s) not yet generated`);
      if (toastParts.length > 0) {
        console.log(`[EP04 Cleanup] ${toastParts.join('. ')}`);
      }

      const restoredCount = Object.keys(restored).filter(sk => restored[sk].visual === 'done').length;
      if (restoredCount > 0) {
        setSceneProduction(prev => ({ ...prev, ...restored }));
        // Smart phase advancement:
        //  - ALL scenes have visuals → Phase 3 done → unlock Phase 4 (Music & SFX)
        //  - Some scenes have visuals → at least past TTS approval
        const totalSceneCount = Object.keys(SCENE_TITLES).length;
        const musicCount = Object.values(restored).filter(s => s.music === 'done').length;
        const sfxCount = Object.values(restored).filter(s => s.sfx === 'done').length;
        const assembledCount = Object.values(restored).filter(s => s.assembled === 'done').length;
        console.log(`[EP04] Restore summary: ${restoredCount} visuals, ${musicCount} music, ${sfxCount} sfx, ${assembledCount} assembled (of ${totalSceneCount} total)`);

        if (assembledCount >= totalSceneCount) {
          // All scenes assembled → Phase 5 done
          setProductionPhase('complete');
          console.log(`[EP04] All ${assembledCount} scenes assembled — Phase 5 complete`);
        } else if (musicCount >= totalSceneCount) {
          // All scenes have music → Phase 4 done → unlock Phase 5
          setProductionPhase('assembly');
          console.log(`[EP04] All ${musicCount} scenes have music — advancing to Phase 5 (Assembly)`);
        } else if (restoredCount >= totalSceneCount) {
          // All scenes have visuals → Phase 3 done → unlock Phase 4
          setProductionPhase('music');
          console.log(`[EP04] All ${restoredCount}/${totalSceneCount} scenes have visuals — advancing to Phase 4 (Music & SFX)`);
        } else {
          setProductionPhase(prev => prev === 'tts' ? 'tts_approved' : prev);
          console.log(`[EP04] Restored visual artifacts for ${restoredCount}/${totalSceneCount} scenes from DB`);
        }
        const restoreMsg = `Restored ${restoredCount} scene(s) with visual assets${musicCount > 0 ? `, ${musicCount} with music` : ''}`;
        toast.success(toastParts.length > 0 ? `${restoreMsg}. ${toastParts.join('. ')}.` : restoreMsg);

        // Re-persist ONLY for scenes that came from Source 2 (gap-fill).
        // If Source 1 already had artifacts, do NOT re-persist (it's already authoritative).
        // Serialized to avoid Supabase statement timeout from parallel writes.
        const source2OnlyScenes = Object.entries(restored).filter(([sk]) => !source1SceneKeys.has(sk));
        if (source2OnlyScenes.length > 0) {
          console.log(`[EP04] Re-persisting ${source2OnlyScenes.length} Source-2-only scenes to fill Source 1 gaps (serialized)`);
          let repersistOk = 0;
          for (let i = 0; i < source2OnlyScenes.length; i++) {
            const [sk, sceneStatus] = source2OnlyScenes[i];
            try {
              const ok = await updateSceneArtifacts(projectId, sk, {
                videoUrls: sceneStatus.videoUrls,
                imageUrls: sceneStatus.imageUrls,
                avatarUrls: sceneStatus.avatarUrls,
                lipsyncUrls: sceneStatus.lipsyncUrls,
              });
              if (ok) repersistOk++;
            } catch (e) {
              console.warn(`[EP04] Re-persist ${sk} failed:`, e);
            }
            if (i < source2OnlyScenes.length - 1) await new Promise(r => setTimeout(r, 300));
          }
          console.log(`[EP04] Re-persist complete: ${repersistOk}/${source2OnlyScenes.length} gap-fill scenes saved to DB`);
        } else {
          console.log(`[EP04] All ${Object.keys(restored).length} scenes came from Source 1 — no re-persist needed`);
        }
      }

      // ── Fallback: check cast_projects.status to restore productionPhase ──
      // When TTS is approved, status is set to 'visual_production'. This survives
      // page refresh even if no visual artifacts exist yet (e.g. user approved TTS
      // but hasn't clicked "Produce All Visuals" yet).
      if (restoredCount === 0) {
        try {
          const { data: projRow } = await db
            .from('cast_projects')
            .select('status')
            .eq('id', projectId)
            .maybeSingle();

          if (projRow?.status === 'visual_production' || projRow?.status === 'complete') {
            setProductionPhase(prev => prev === 'tts' ? 'tts_approved' : prev);
            console.log(`[EP04] Phase restored from project status: ${projRow.status}`);
          }
        } catch (e) {
          console.warn('[EP04] Project status check failed:', e);
        }
      }

      setContentLoaded(true);

      // ── Debug: expose DB scene check in browser console ──
      // Run window.__debugSceneDB() in console to see what's stored in DB
      (window as any).__debugSceneDB = async () => {
        const { data } = await supabase
          .from('cast_project_scenes')
          .select('scene_key, scene_config')
          .eq('project_id', projectId);
        console.table((data || []).map(r => {
          const cfg = (r.scene_config || {}) as any;
          const art = cfg.artifacts || {};
          return {
            scene_key: r.scene_key,
            has_artifacts: !!cfg.artifacts,
            videos: Object.keys(art.videoUrls || {}).length,
            images: Object.keys(art.imageUrls || {}).length,
            avatars: Object.keys(art.avatarUrls || {}).length,
            lipsync: Object.keys(art.lipsyncUrls || {}).length,
            config_keys: Object.keys(cfg).join(', '),
          };
        }));
        return data;
      };
      console.log('[EP04] Debug: run window.__debugSceneDB() in console to check DB artifacts');
    })();
  }, [projectId, contentLoaded, scriptContentForUI]);

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
    const hasRestoredAssets = Object.values(sceneProduction).some(s => s.visual === 'done');
    if (hasRestoredAssets) {
      console.log('[EP04] Skipping auto-seed — visual artifacts already restored from DB');
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

      setAudioMap(prev => ({
        ...prev,
        [key]: { audioUrl: audioUrl!, provider: resolvedProvider, voice: resolvedVoice },
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
    if (success === keys.length) {
      toast.success(`Generated all ${success} voiceovers`);
    } else if (success > 0) {
      toast.warning(`Generated ${success}/${keys.length} — ${keys.length - success} failed (check console for details)`);
    } else {
      toast.error(`All ${keys.length} TTS generations failed — check browser console for error details`);
    }
  }, [scriptKeys, statusMap, generateLine]);

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

    // Update project status in DB
    if (projectId) {
      const db = supabase as any;
      await db.from('cast_projects').update({
        status: 'visual_production',
        updated_at: new Date().toISOString(),
      }).eq('id', projectId);
    }

    setProductionPhase('tts_approved');
    toast.success('TTS approved — ready for visual production');
  }, [scriptKeys, audioMap, projectId, doneCount, ttsApprovalThreshold]);

  // ─── Phase 3: Visual Production (per scene) ───────────────────────────

  // ─── Step types to skip in visual production (already done in Phase 2 / Phase 4) ──
  // scene-transition and storybook-frame are visual assets (videos/images) — do NOT skip them
  const SKIP_IN_VISUAL = new Set(['tts', 'music', 'sfx']);

  // ─── Client-side polling for async WAN video tasks ───────────────────────
  const pollVideoTaskResult = useCallback(async (taskId: string): Promise<string | null> => {
    // Poll DashScope task status via the edge function's poll endpoint
    // We re-invoke ai-video-generator with action=poll_task
    const maxPolls = 36; // 36 × 10s = 6 min max
    for (let i = 0; i < maxPolls; i++) {
      await new Promise(r => setTimeout(r, 10000)); // 10s between polls
      try {
        const { data } = await supabase.functions.invoke('ai-video-generator', {
          body: { action: 'poll_task', taskId },
        });
        if (data?.videoUrl && !data.videoUrl.includes('placehold.co')) {
          return data.videoUrl;
        }
        if (data?.status === 'FAILED') {
          console.warn(`[EP04] Video task ${taskId} failed:`, data?.message);
          return null;
        }
        console.log(`[EP04] Video task ${taskId} poll ${i + 1}/${maxPolls}: ${data?.status || 'pending'}`);
      } catch (e) {
        console.warn(`[EP04] Poll error for task ${taskId}:`, e);
      }
    }
    console.warn(`[EP04] Video task ${taskId} timed out after ${maxPolls} polls`);
    return null;
  }, []);

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
          results[`screen-capture-${sid}`] = screenshotUrls[sid];
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
      // Priority: Supabase URL (accessible everywhere) > DashScope CDN (edge function will re-upload)
      // Pre-made local assets are relative paths — convert to full URL so edge function can fetch
      const avatarFromResults = Object.entries(results).find(([k]) => k.includes('avatar-3d') && k.includes(character))?.[1];
      const avatarPreMade = CHARACTER_AVATARS[character];

      // Pick the best available avatar URL
      let sourceImage: string | null = null;
      if (avatarFromResults && avatarFromResults.startsWith('http') && avatarFromResults.includes('supabase.co')) {
        sourceImage = avatarFromResults; // AI-generated avatar already on Supabase — best
      } else if (avatarFromResults && avatarFromResults.startsWith('http')) {
        sourceImage = avatarFromResults; // DashScope CDN — edge function will re-upload to Supabase
      } else if (avatarPreMade) {
        // Pre-made local asset — make it a full URL the edge function can fetch from our app
        sourceImage = avatarPreMade.startsWith('http') ? avatarPreMade : `${window.location.origin}${avatarPreMade}`;
      }
      if (!sourceImage) {
        toast.warning(`No avatar image for "${character}" lipsync — skipping`);
        return;
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
        const maxPolls = 30; // 30 × 10s = 300s (5 min) max
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
      const url = data?.url || data?.videoUrl;
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
      const url = data?.url || data?.videoUrl;
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
      if (url) results[`scene-transition-${sceneKey}-${Date.now()}`] = url;
      if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url);
      return;
    }

    // ── storybook-frame: static illustration (image generation for chapter headers, powered-by pages) ──
    if (stepType === 'storybook-frame') {
      let jobId: string | null = null;
      if (projectId) {
        jobId = await trackGenerationJob({
          projectId, jobType: 'image', sceneKey, provider: 'alibaba', estimatedTokens: 500,
        });
      }

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
      if (error) { toast.error(`${stepLabel} storybook-frame failed: ${error.message}`); return; }
      const url = data?.url || data?.imageUrl;
      if (url) results[`storybook-frame-${sceneKey}-${Date.now()}`] = url;
      if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url);
      return;
    }

    // ── avatar-3d: Use pre-made assets OR generate from character config prompt ──
    if (stepType === 'avatar-3d') {
      const character = (step.character as string) || 'host';
      const existingAvatar = CHARACTER_AVATARS[character];
      // Use pre-made avatar UNLESS character is flagged for AI regeneration
      if (existingAvatar && !REGENERATE_AVATAR_VIA_AI.has(character)) {
        results[`avatar-3d-${character}-${sceneKey}`] = existingAvatar;
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
          // Edge function mirrors external URLs to Supabase Storage (CORS-safe, permanent)
          const url = data?.url || data?.imageUrl || data?.result?.url;
          if (!url) throw new Error('No image URL in response');

          results[`avatar-3d-${character}-${sceneKey}`] = url;
          console.log(`[EP04 Visual] ${stepLabel}: Alibaba avatar for "${character}": ${url.substring(0, 80)}...`);
          if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[EP04 Visual] ${stepLabel}: avatar generation failed for "${character}": ${msg}`);
          // Fallback: use pre-made avatar if available
          if (existingAvatar) {
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
        results[`kinetic-text-${sceneKey}-${Date.now()}`] = sceneBg;
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

    if (isPlaceholder) {
      toast.warning(`${stepLabel} "${stepType}": generation returned placeholder — provider may be unavailable`);
      console.warn(`[EP04 Visual] ${stepLabel} got placeholder URL:`, url);
    } else if (url) {
      results[`${stepType}-${sceneKey}-${Date.now()}`] = url;
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
      console.log(`[PERSIST SAVE] ${sceneKey}: visual production complete, ${Object.keys(results).length} total results:`, Object.keys(results));
      if (projectId) {
        const saveOk = await updateSceneArtifacts(projectId, sceneKey, {
          videoUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('video') || k.includes('character-interaction') || k.includes('narrator-scroll') || k.includes('scene-transition'))),
          imageUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('image') || k.includes('kinetic') || k.includes('motion') || k.includes('screen-capture') || k.includes('ai-screen-enhance') || k.includes('storybook-frame'))),
          avatarUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('avatar-3d'))),
          lipsyncUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('lipsync'))),
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
      const savedImageUrls = Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('image') || k.includes('kinetic') || k.includes('motion') || k.includes('screen-capture') || k.includes('ai-screen-enhance') || k.includes('storybook-frame')));
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
    if (!abortRef.current) {
      toast.success('All visual production complete');
    } else {
      toast.warning('Visual production cancelled');
    }
  }, [scenes, startSceneVisualProduction]);

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
      [sceneKey]: { ...(prev[sceneKey] || defaultSceneStatus()), music: 'generating' },
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

        const { data, error } = await supabase.functions.invoke('multi-provider-music', {
          body: {
            prompt: musicPrompt,
            duration: musicDuration,
            instrumental: true,
          },
        });

        if (!error && data?.audioUrl && !data?.isSilentPlaceholder) {
          musicUrl = data.audioUrl;
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

      // Generate SFX clips
      for (const sfx of sfxList) {
        const { data } = await supabase.functions.invoke('ai-universal-processor', {
          body: { action: 'generate_sfx', prompt: sfx.prompt, duration: sfx.duration || 3 },
        });
        if (data?.audioUrl) sfxUrls.push(data.audioUrl);
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
        return {
          key: k,
          voice: line?.voice || 'unknown',
          duration: line?.duration_est || 5,
          hasAudio: !!audioMap[k]?.audioUrl,
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
        const hasLipsync = !!(status?.lipsyncUrls || {})[ls.character];
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

    return {
      scenes: report,
      totalScenes: sceneKeys.length,
      readyScenes: totalReady,
      missingScenes: totalMissing,
      isReady: totalMissing === 0,
      grandTotalDuration,
      // Minimum requirements: at least TTS + visuals for every scene
      canAssemble: report.every(s => s.canAssemble),
    };
  }, [scenes, sceneProduction, scriptKeys, scriptContentForUI, audioMap]);

  const [assemblyReadiness, setAssemblyReadiness] = useState<ReturnType<typeof getAssemblyReadiness> | null>(null);
  const [assemblyJobId, setAssemblyJobId] = useState<string | null>(null);
  const [assemblyPollTimer, setAssemblyPollTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  // ─── Multi-Part Assembly ──────────────────────────────────────────────────
  // JSON2Video Professional plan caps at 10 minutes per video.
  // EP04 is ~36 minutes → split into 4 parts, each under 10 minutes.
  const MAX_PART_DURATION = 570; // 9.5 minutes (buffer under 10-min limit)
  const MAX_PART_TTS = 28; // Max TTS audio files per part — Part 1 (23 TTS) rendered OK, Part 2 (45 TTS) timed out

  interface AssemblyPart {
    partNumber: number;
    sceneKeys: string[];
    estimatedDuration: number;
    ttsCount: number;
    jobId: string | null;
    status: 'pending' | 'rendering' | 'completed' | 'failed';
    videoUrl: string | null;
    errorMessage?: string;
  }

  const [assemblyParts, setAssemblyParts] = useState<AssemblyPart[]>([]);
  const [activePartNumber, setActivePartNumber] = useState<number | null>(null);

  // Compute part boundaries dynamically from scene durations AND TTS count
  // Both caps must be respected: duration < 570s AND TTS count < 28
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
        sceneDuration += scriptContentForUI[k]?.duration_est || 5;
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
  useEffect(() => {
    if (!assemblyJobId) {
      pollCountRef.current = 0;
      pollErrorCountRef.current = 0;
      return;
    }
    const MAX_POLLS = 120; // 120 × 10s = 20 minutes max
    const MAX_ERRORS = 5;  // 5 consecutive errors = stop
    const timer = setInterval(async () => {
      pollCountRef.current++;
      if (pollCountRef.current > MAX_POLLS) {
        setAssemblyProgress(null);
        setAssemblyJobId(null);
        toast.error('Assembly polling timed out after 20 minutes — check JSON2Video dashboard');
        return;
      }
      try {
        const { data, error: fnError } = await supabase.functions.invoke('genie-cast-status', {
          body: { castJobId: assemblyJobId },
        });
        if (fnError) {
          pollErrorCountRef.current++;
          console.error(`[EP04 Assembly] Poll error ${pollErrorCountRef.current}/${MAX_ERRORS}:`, fnError);
          if (pollErrorCountRef.current >= MAX_ERRORS) {
            setAssemblyProgress(null);
            setAssemblyJobId(null);
            toast.error('Assembly polling failed repeatedly — check console');
          }
          return;
        }
        pollErrorCountRef.current = 0; // reset on success
        const jobStatus = data?.job?.status;
        if (jobStatus === 'completed') {
          const videoUrl = data.job.outputUrl;
          setAssemblyJobId(null);
          setAssemblyProgress(null);

          // If this was a multi-part assembly, update the specific part
          if (activePartNumber != null) {
            setAssemblyParts(prev => prev.map(p =>
              p.partNumber === activePartNumber
                ? { ...p, status: 'completed', videoUrl }
                : p
            ));
            setActivePartNumber(null);
            toast.success(`Part ${activePartNumber} assembled! Video: ${videoUrl?.substring(0, 60)}...`);

            // Check if ALL parts are done
            setAssemblyParts(prev => {
              const allDone = prev.every(p =>
                p.partNumber === activePartNumber ? true : p.status === 'completed'
              );
              if (allDone) {
                setProductionPhase('complete');
                toast.success('All parts assembled! Ready for concatenation.');
              }
              return prev;
            });
          } else {
            // Full (non-part) assembly completed
            setFinalVideoUrl(videoUrl);
            setProductionPhase('complete');
            if (projectId && videoUrl) {
              updateFinalAssembly(projectId, videoUrl, {
                totalDuration,
                sceneCount: Array.from(scenes.keys()).length,
                resolution: '1920x1080',
              });
            }
            toast.success('Cinematic movie assembled successfully!');
          }
        } else if (jobStatus === 'failed') {
          const errMsg = data.job.errorMessage || 'Unknown error';
          setAssemblyProgress(null);
          setAssemblyJobId(null);
          if (activePartNumber != null) {
            setAssemblyParts(prev => prev.map(p =>
              p.partNumber === activePartNumber
                ? { ...p, status: 'failed', errorMessage: errMsg }
                : p
            ));
            setActivePartNumber(null);
          }
          toast.error(`Assembly failed: ${errMsg}`);
        } else {
          const pct = data?.job?.progressPercent || 0;
          const partLabel = activePartNumber != null ? ` Part ${activePartNumber}` : '';
          setAssemblyProgress(`Rendering${partLabel}... ${pct}% (poll ${pollCountRef.current})`);
        }
      } catch (err) {
        pollErrorCountRef.current++;
        console.error(`[EP04 Assembly] Poll exception ${pollErrorCountRef.current}/${MAX_ERRORS}:`, err);
        if (pollErrorCountRef.current >= MAX_ERRORS) {
          setAssemblyProgress(null);
          setAssemblyJobId(null);
          toast.error('Assembly polling failed — check network/console');
        }
      }
    }, 10000); // Poll every 10 seconds
    setAssemblyPollTimer(timer);
    return () => clearInterval(timer);
  }, [assemblyJobId, projectId, totalDuration, scenes, updateFinalAssembly, activePartNumber]);

  // ─── Client-side JSON2Video timeline builder ────────────────────────────
  // Ported from stitchLayeredTimeline in genie-cast-assembler edge function.
  // Builds the full { resolution, quality, scenes } payload in the browser
  // (unlimited memory) so the edge function just forwards it to JSON2Video.
  const buildJson2VideoTimeline = useCallback((
    chapters: Array<{
      chapterId: string; product: string; duration: number;
      allTtsUrls: Array<{ url: string; start: number; duration: number; voice: string }>;
      visualUrls?: string[]; visualUrl?: string;
      musicUrl?: string; musicLoop?: boolean;
      sfxUrls?: string[];
    }>,
    transitions: Array<{
      from: string; to: string; style: string; duration: number;
      bridgeAudioUrl?: string; bridgeDuration?: number;
    }>,
    bookends: { opening: { duration: number }; closing: { duration: number } } | null,
    quality: string,
  ) => {
    const resolution = quality === 'cinematic' ? '4k' : quality === 'production' ? 'full-hd' : 'hd';
    const scenes: Array<Record<string, any>> = [];

    // ── Opening bookend (skip if duration is 0 — multi-part: only Part 1 gets this) ──
    if (bookends && bookends.opening.duration > 0) {
      const openElements: Array<Record<string, any>> = [];
      // Background image from first scene (professional look for LinkedIn/X)
      if (bookends.opening.backgroundUrl) {
        openElements.push({
          type: 'image', src: bookends.opening.backgroundUrl,
          start: 0, duration: bookends.opening.duration,
        });
      }
      // Title text overlay
      openElements.push({
        type: 'text', text: 'Beyond AI Hype — Episode 2',
        duration: bookends.opening.duration, start: 0,
        settings: { 'font-family': 'Inter', 'font-size': '64px', 'font-color': '#f5d77a',
          'text-shadow': '3px 3px 12px rgba(0,0,0,0.9)' }, position: 'center',
      });
      // Subtitle
      openElements.push({
        type: 'text', text: 'A GenieSuite Documentary',
        duration: bookends.opening.duration - 3, start: 3,
        settings: { 'font-family': 'Inter', 'font-size': '28px', 'font-color': '#c4b5fd',
          'text-shadow': '2px 2px 8px rgba(0,0,0,0.8)' }, position: 'bottom-center',
      });
      scenes.push({
        comment: 'Opening Bookend',
        duration: bookends.opening.duration,
        'background-color': '#0f0a1a',
        elements: openElements,
      });
    }

    // Helper: detect video URLs vs image URLs for JSON2Video element type
    const detectMediaType = (url: string): 'video' | 'image' =>
      url.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i) ? 'video' : 'image';

    // ── Scene segments with layered audio ──
    chapters.forEach((chapter, chapterIndex) => {
      const allTts = chapter.allTtsUrls || [];
      const chapterVisuals: string[] = chapter.visualUrls || (chapter.visualUrl ? [chapter.visualUrl] : []);
      const sceneDuration: number = chapter.duration || 30;
      const elements: Array<Record<string, any>> = [];

      // Visual layer: distribute visuals across scene duration
      // FIXED: detect video vs image URLs — JSON2Video rejects video files as 'image' type
      if (chapterVisuals.length > 0) {
        if (allTts.length > 0 && chapterVisuals.length >= allTts.length) {
          // One visual per TTS line — aligned to TTS timing
          allTts.forEach((tts, idx) => {
            const src = chapterVisuals[idx % chapterVisuals.length];
            elements.push({
              type: detectMediaType(src), src,
              start: tts.start, duration: tts.duration,
            });
          });
        } else if (chapterVisuals.length > 1) {
          // Multiple visuals, distribute evenly
          const durPerVisual = Math.max(1, Math.floor(sceneDuration / chapterVisuals.length));
          chapterVisuals.forEach((url, idx) => {
            elements.push({
              type: detectMediaType(url), src: url,
              start: idx * durPerVisual,
              duration: Math.min(durPerVisual, sceneDuration - idx * durPerVisual),
            });
          });
        } else {
          // Single visual — holds for full scene duration
          elements.push({ type: detectMediaType(chapterVisuals[0]), src: chapterVisuals[0], start: 0, duration: sceneDuration });
        }
      }

      // TTS layer: sequential dialogue lines with start offsets
      allTts.forEach(tts => {
        if (tts.url && tts.url.startsWith('http')) {
          elements.push({ type: 'audio', src: tts.url, start: tts.start, duration: tts.duration, volume: 1.0 });
        }
      });

      // Music layer: loop at original speed, volume ducked
      if (chapter.musicUrl && chapter.musicUrl.startsWith('http')) {
        elements.push({
          type: 'audio', src: chapter.musicUrl,
          start: 0, duration: sceneDuration,
          volume: 0.3, loop: !!chapter.musicLoop,
        });
      }

      // SFX layer
      const sfxUrls = chapter.sfxUrls || [];
      sfxUrls.forEach((sfxUrl, sfxIdx) => {
        if (sfxUrl && sfxUrl.startsWith('http')) {
          const sfxStart = sfxIdx > 0 ? Math.floor(sceneDuration * sfxIdx / sfxUrls.length) : 0;
          elements.push({
            type: 'audio', src: sfxUrl,
            start: sfxStart, duration: Math.min(5, sceneDuration - sfxStart),
            volume: 0.6,
          });
        }
      });

      // Scene title overlay (first 5s)
      elements.push({
        type: 'text', text: chapter.product || chapter.chapterId,
        start: 0, duration: Math.min(5, sceneDuration),
        settings: { 'font-family': 'Inter', 'font-size': '42px', 'font-color': '#ffffff',
          'text-shadow': '2px 2px 4px rgba(0,0,0,0.5)' },
        position: 'bottom-left',
      });

      scenes.push({
        comment: `${chapter.product || chapter.chapterId} (${allTts.length} TTS lines, ${sceneDuration}s)`,
        duration: sceneDuration,
        'background-color': '#1e293b',
        elements,
      });

      // Transition segment after this scene (except last)
      if (transitions.length > chapterIndex) {
        const t = transitions[chapterIndex];
        const transElements: Array<Record<string, any>> = [];

        transElements.push({
          type: 'text', text: `~ ${t.style.replace(/-/g, ' ')} ~`,
          start: 0, duration: t.duration,
          settings: { 'font-family': 'Inter', 'font-size': '36px', 'font-color': '#c4b5fd',
            'text-shadow': '2px 2px 6px rgba(0,0,0,0.6)' },
          position: 'center',
        });

        if (t.bridgeAudioUrl && t.bridgeAudioUrl.startsWith('http')) {
          transElements.push({
            type: 'audio', src: t.bridgeAudioUrl,
            start: 1, duration: t.bridgeDuration || (t.duration - 1),
            volume: 1.0,
          });
        }

        scenes.push({
          comment: `Transition: ${t.from} → ${t.to} (${t.style})`,
          duration: t.duration,
          'background-color': '#0f0a1a',
          elements: transElements,
        });
      }
    });

    // ── Closing bookend (skip if duration is 0 — multi-part: only last part gets this) ──
    if (bookends && bookends.closing.duration > 0) {
      const closeElements: Array<Record<string, any>> = [];
      // Background image from last scene
      if (bookends.closing.backgroundUrl) {
        closeElements.push({
          type: 'image', src: bookends.closing.backgroundUrl,
          start: 0, duration: bookends.closing.duration,
        });
      }
      // Closing title
      closeElements.push({
        type: 'text', text: 'The End... For Now',
        duration: bookends.closing.duration, start: 0,
        settings: { 'font-family': 'Inter', 'font-size': '56px', 'font-color': '#f5d77a',
          'text-shadow': '3px 3px 12px rgba(0,0,0,0.9)' }, position: 'center',
      });
      // CTA text
      closeElements.push({
        type: 'text', text: 'Built with GenieSuite Cast  •  Follow for more',
        duration: bookends.closing.duration - 4, start: 4,
        settings: { 'font-family': 'Inter', 'font-size': '24px', 'font-color': '#c4b5fd',
          'text-shadow': '2px 2px 8px rgba(0,0,0,0.8)' }, position: 'bottom-center',
      });
      scenes.push({
        comment: 'Closing Bookend',
        duration: bookends.closing.duration,
        'background-color': '#0f0a1a',
        elements: closeElements,
      });
    }

    const totalDuration = scenes.reduce((sum, s) => sum + (s.duration || 0), 0);
    return { resolution, quality: quality === 'cinematic' ? 'high' : 'medium', scenes, _totalDuration: totalDuration };
  }, []);

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
    let parts = computePartBoundaries();

    if (partNumber != null) {
      const part = parts.find(p => p.partNumber === partNumber);
      if (!part) {
        toast.error(`Part ${partNumber} not found`);
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
      const preBuiltChapters = targetSceneKeys.map(sceneKey => {
        const status = sceneProduction[sceneKey] || defaultSceneStatus();
        const sceneTitle = SCENE_TITLES[sceneKey] || sceneKey;

        const sceneLines = scriptKeys.filter(k => scriptContentForUI[k]?.scene === sceneKey);
        let cumulativeStart = 0;
        const allTtsUrls: Array<{ url: string; start: number; duration: number; voice: string; key: string }> = [];

        for (const k of sceneLines) {
          const line = scriptContentForUI[k];
          const dur = line?.duration_est || 5;
          if (audioMap[k]?.audioUrl) {
            allTtsUrls.push({
              url: audioMap[k].audioUrl,
              start: cumulativeStart,
              duration: dur,
              voice: line?.voice || 'unknown',
              key: k,
            });
          }
          cumulativeStart += dur;
        }

        const sceneDuration = cumulativeStart || 30;

        // Filter out data: URIs AND MP4 video files
        // data: URIs bloat the payload (38MB+), MP4 videos cause JSON2Video render timeouts
        const isHttpUrl = (u: string) => u && u.startsWith('http');
        const isNotVideoFile = (u: string) => !u.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i);
        const isUsableVisual = (u: string) => isHttpUrl(u) && isNotVideoFile(u);
        const allVisualUrls: string[] = [
          // Skip videoUrls entirely — MP4s cause JSON2Video render timeouts
          ...Object.values(status.imageUrls || {}).filter(isUsableVisual),
          ...Object.values(status.avatarUrls || {}).filter(isUsableVisual),
          ...Object.values(status.lipsyncUrls || {}).filter(isUsableVisual),
        ];

        const pipelineSceneKey = SCRIPT_TO_PIPELINE_MAP[sceneKey] || sceneKey;
        const pipeline = EP04_SCENE_PIPELINES[pipelineSceneKey as keyof typeof EP04_SCENE_PIPELINES];
        const musicStep = (Array.isArray(pipeline) ? pipeline : []).find(s => s.type === 'music') as { type: 'music'; duration: number } | undefined;
        const musicDuration = musicStep?.duration || 30;
        const musicLoop = status.musicUrl ? musicDuration < sceneDuration : false;

        const lipsyncData: Array<{ character: string; lipsyncUrl: string | null; ttsExceeds18s: boolean }> = [];
        if (status?.lipsyncUrls) {
          for (const [character, url] of Object.entries(status.lipsyncUrls)) {
            if (url) {
              const charTts = allTtsUrls.filter(t => t.voice === character);
              const longest = charTts.reduce((max, t) => Math.max(max, t.duration), 0);
              lipsyncData.push({ character, lipsyncUrl: url, ttsExceeds18s: longest > LIPSYNC_MAX_DURATION });
            }
          }
        }

        return {
          chapterId: sceneKey,
          product: sceneTitle,
          audioUrl: allTtsUrls[0]?.url || undefined,
          visualUrl: allVisualUrls[0] || undefined,
          visualUrls: allVisualUrls,
          duration: sceneDuration,
          ttsProvider: 'pre-generated',
          videoProvider: 'pre-generated',
          success: true,
          allTtsUrls,
          musicUrl: status.musicUrl || undefined,
          _musicUrlFormat: status.musicUrl ? (status.musicUrl.startsWith('http') ? 'http' : status.musicUrl.substring(0, 30)) : 'none',
          musicLoop,
          musicDuration,
          sfxUrls: status.sfxUrls || [],
          lipsyncData,
        };
      });

      // ── Only include transitions between scenes WITHIN this part ──
      // NOTE: SCENE_TITLES keys (scene-1-problem) differ from EP04_STORYBOOK_TRANSITIONS keys (scene-1-cold-open)
      // Match by scene index number (the digit after 'scene-') instead of exact key match
      const targetSceneIndices = new Set(targetSceneKeys.map(k => k.match(/scene-(\d+)/)?.[1]).filter(Boolean));
      const getSceneIndex = (key: string) => key.match(/scene-(\d+)/)?.[1];
      const transitions = EP04_STORYBOOK_TRANSITIONS
        .filter(t => {
          const fromIdx = getSceneIndex(t.from);
          const toIdx = getSceneIndex(t.to);
          return fromIdx && toIdx && targetSceneIndices.has(fromIdx) && targetSceneIndices.has(toIdx);
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
          return {
            ...t,
            bridgeAudioUrl: bridgeAudio || undefined,
            bridgeDuration: bridgeLine?.duration_est || 7,
          };
        });

      // ── Bookend data: opening only for first part, closing only for last ──
      // Use scene visuals as bookend backgrounds for professional look (LinkedIn/X publishing)
      const firstChapterVisual = preBuiltChapters[0]?.visualUrls?.[0];
      const lastChapterVisual = preBuiltChapters[preBuiltChapters.length - 1]?.visualUrls?.[0];
      const bookends = {
        opening: { duration: isFirstPart ? 21 : 0, hasAssets: isFirstPart, backgroundUrl: firstChapterVisual },
        closing: { duration: isLastPart ? 16 : 0, hasAssets: isLastPart, backgroundUrl: lastChapterVisual },
      };

      const partDuration = preBuiltChapters.reduce((s, c) => s + c.duration, 0)
        + transitions.reduce((s, t) => s + t.duration, 0)
        + bookends.opening.duration + bookends.closing.duration;

      console.log(`[EP04 Assembly${partLabel}] ${preBuiltChapters.length} chapters:`, preBuiltChapters.map(c =>
        `${c.chapterId}: ${c.allTtsUrls.length} TTS, ${c.visualUrls?.length || 0} vis, music=${!!c.musicUrl}(${(c as any)._musicUrlFormat})(loop=${c.musicLoop}), dur=${c.duration}s`
      ));
      console.log(`[EP04 Assembly${partLabel}] ${transitions.length} transitions, duration: ${Math.round(partDuration / 60)}min (${partDuration}s)`);

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

      const timeline = buildJson2VideoTimeline(preBuiltChapters, transitions, bookends, 'production');
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

      console.log(`[EP04 Assembly${partLabel}] Response:`, data);

      if (data?.generationStatus === 'pending' && (data?.castJobId || data?.taskId)) {
        const pollId = data.castJobId || data.taskId;
        setAssemblyJobId(pollId);
        setAssemblyProgress(`Rendering${partLabel}... polling for completion`);
        // Track job ID in parts state
        if (partNumber != null) {
          setAssemblyParts(prev => prev.map(p =>
            p.partNumber === partNumber ? { ...p, jobId: pollId, status: 'rendering' } : p
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
  }, [scenes, sceneProduction, scriptKeys, scriptContentForUI, audioMap, projectId, trackGenerationJob, completeGenerationJob, updateFinalAssembly, totalDuration, getAssemblyReadiness, buildJson2VideoTimeline, computePartBoundaries]);

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

  // ─── Render ──────────────────────────────────────────────────────────────

  // Show loading/error state while project is being resolved
  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold mb-2">Loading EP04 Project...</h2>
          <p className="text-sm text-muted-foreground">{loadStep || 'Connecting to database...'}</p>
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
            <Button onClick={() => {
              autoCreateAttempted.current = false;
              setProjectLoadError(null);
              setAutoProjectId(null);
              setRetryCount(c => c + 1);
            }}>
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
                            toast.info('Repairing storage URLs — checking DB...');
                            const { data, error } = await supabase.functions.invoke('ai-video-generator', {
                              body: { action: 'repair_urls', projectId },
                            });
                            if (error) { toast.error(`Repair failed: ${error.message}`); return; }
                            console.log('🔧 Repair result:', data);
                            if (data?.diagnostics) {
                              console.log('🔧 Diagnostics:\n' + data.diagnostics.join('\n'));
                            }
                            toast.success(`Fixed ${data?.fixedCount || 0} URLs, ${data?.expiredExternal || 0} expired external — refreshing...`);
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
                                  // Clear lipsync + avatar data so lipsync steps regenerate with fresh avatars
                                  setSceneProduction(prev => ({
                                    ...prev,
                                    [sceneKey]: { ...defaultSceneStatus(), visual: 'idle' },
                                  }));
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
                                          <div key={key} className="relative group">
                                            {cat.isVideo ? (
                                              <video
                                                src={url}
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
                                {status.musicUrl && (
                                  <div className="flex items-center gap-2 p-1.5 rounded bg-muted/30 border border-border/20">
                                    <Music className="h-3 w-3 text-violet-400 flex-shrink-0" />
                                    <audio src={status.musicUrl} controls className="h-6 w-full [&::-webkit-media-controls-panel]:h-6" preload="metadata" />
                                  </div>
                                )}
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
                          {status?.musicUrl && (
                            <audio src={status.musicUrl} controls className="w-full mt-2 h-6" />
                          )}
                          {/* Per-scene regen button — always visible unless actively generating */}
                          {status?.music !== 'generating' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className={cn(
                                'w-full mt-1 h-5 text-[8px]',
                                !status?.musicUrl && 'border-amber-500/30 text-amber-500',
                              )}
                              onClick={() => startSceneMusicProduction(sceneKey)}
                            >
                              <RefreshCw className="h-2.5 w-2.5 mr-0.5" />
                              {status?.musicUrl ? 'Regen' : 'Generate'} Music
                            </Button>
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
                            setAssemblyJobId(null);
                            setAssemblyProgress(null);
                            toast.info('Assembly polling cancelled');
                          }}>
                            <XCircle className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                        </div>
                      )}
                      {!phase5Done && !assemblyProgress && (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => setAssemblyReadiness(getAssemblyReadiness())}>
                            <Eye className="h-3 w-3 mr-1" />
                            Check Readiness
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
                            <TooltipContent side="top" className="text-xs">Opening bookend (21s) — storybook + music + SFX</TooltipContent>
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
                              {/* Transition indicator (between scenes) */}
                              {i > 0 && (
                                <div className="flex-shrink-0 h-4 w-4 rounded-sm text-[6px] font-bold flex items-center justify-center bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 cursor-default" title={`Transition ${i - 1}→${i}`}>
                                  T
                                </div>
                              )}
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

                      {/* Per-scene detail grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {assemblyReadiness.scenes.map(s => (
                          <div key={s.sceneKey} className={cn(
                            'p-2 rounded border text-[9px]',
                            s.canAssemble
                              ? (s.missing.length === 0 ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5')
                              : 'border-red-500/30 bg-red-500/5',
                          )}>
                            <p className="font-bold truncate mb-1">{s.title.split(' — ')[1] || s.sceneKey}</p>
                            <div className="space-y-0.5">
                              <p className={s.ttsReady > 0 ? 'text-green-600' : 'text-red-500'}>
                                TTS: {s.ttsReady}/{s.ttsReady + s.ttsMissing} ({s.expectedDuration}s)
                              </p>
                              <p className={s.videoCount + s.imageCount > 0 ? 'text-green-600' : 'text-red-500'}>
                                Visuals: {s.videoCount}V + {s.imageCount}I
                              </p>
                              <p className={s.hasMusic ? 'text-green-600' : 'text-amber-500'}>
                                Music: {s.hasMusic ? (s.musicCoversScene ? 'Full' : 'Loop') : 'Missing'}
                                {s.musicDuration != null && s.hasMusic && (
                                  <span className="text-muted-foreground"> ({s.musicDuration}s/{s.expectedDuration}s)</span>
                                )}
                              </p>
                              {s.avatarCount > 0 && <p className="text-green-600">Avatars: {s.avatarCount}</p>}
                              {s.lipsyncReady > 0 && (
                                <p className="text-green-600">
                                  Lipsync: {s.lipsyncReady}
                                  {s.lipsyncEntries.some(l => l.ttsExceeds18s) && (
                                    <span className="text-amber-500"> (voiceover handoff)</span>
                                  )}
                                </p>
                              )}
                              {s.sfxCount > 0 && <p className="text-green-600">SFX: {s.sfxCount}</p>}
                            </div>
                            {s.missing.length > 0 && (
                              <p className="text-red-500 mt-1 font-semibold">Missing: {s.missing.join(', ')}</p>
                            )}
                            {/* Per-scene music regen button if music missing */}
                            {!s.hasMusic && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-1 h-5 text-[8px]"
                                onClick={() => startSceneMusicProduction(s.sceneKey)}
                              >
                                <Music className="h-2.5 w-2.5 mr-0.5" />
                                Regen Music
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Multi-Part Assembly Panel ─────────────────── */}
                  {assemblyParts.length > 0 && (
                    <div className="mb-4 p-3 rounded-lg border border-blue-500/30 bg-blue-500/[0.03]">
                      <div className="flex items-center gap-2 mb-3">
                        <Layers className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-semibold">Multi-Part Assembly</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          JSON2Video Professional: 10 min max per video
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {assemblyParts.map(part => (
                          <div key={part.partNumber} className={cn(
                            'p-3 rounded-lg border',
                            part.status === 'completed' && 'border-green-500/30 bg-green-500/[0.03]',
                            part.status === 'rendering' && 'border-amber-500/30 bg-amber-500/[0.03]',
                            part.status === 'failed' && 'border-red-500/30 bg-red-500/[0.03]',
                            part.status === 'pending' && 'border-muted bg-muted/10',
                          )}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold">
                                Part {part.partNumber}
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
                            <p className="text-[10px] text-muted-foreground mb-1">
                              {part.sceneKeys.map(k => SCENE_TITLES[k]?.replace(/Scene \d+ — /, '') || k).join(', ')}
                            </p>
                            <p className="text-[10px] text-muted-foreground mb-2">
                              ~{Math.round(part.estimatedDuration / 60)}min, {part.ttsCount} TTS ({part.sceneKeys.length} scenes)
                            </p>
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
                                <a
                                  href={part.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                                >
                                  <Download className="h-2.5 w-2.5" /> Download
                                </a>
                              )}
                              {part.errorMessage && (
                                <span className="text-[9px] text-red-500 truncate max-w-[150px]" title={part.errorMessage}>
                                  {part.errorMessage}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {assemblyParts.every(p => p.status === 'completed') && (
                        <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                          <p className="text-xs text-green-600 font-semibold">
                            All {assemblyParts.length} parts assembled! Use a video editor (DaVinci Resolve, CapCut, etc.) to concatenate the parts into one final video.
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {assemblyParts.map(p => p.videoUrl && (
                              <a key={p.partNumber} href={p.videoUrl} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-blue-500 hover:underline">
                                Part {p.partNumber}
                              </a>
                            ))}
                          </div>
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
