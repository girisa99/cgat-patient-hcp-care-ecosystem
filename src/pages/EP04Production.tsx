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
  CheckCircle2, AlertCircle, Mic, SkipForward, ArrowLeft,
  Camera, Monitor, Image as ImageIcon, ExternalLink,
  Film, Music, Clapperboard, Download, Eye, Layers,
  Share2, Scissors
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
const REGENERATE_AVATAR_VIA_AI: Set<string> = new Set(['host', 'allaudin']);

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
    if (autoCreateAttempted.current) return; // guard against React strict-mode double-fire
    autoCreateAttempted.current = true;
    setProjectLoading(true);
    setProjectLoadError(null);

    (async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user) {
        console.error('[EP04] Auth failed — no user session:', authError);
        setProjectLoadError(authError?.message || 'Not authenticated — please sign in and refresh');
        setProjectLoading(false);
        return;
      }
      const db = supabase as any;

      try {
        // Check if EP04 project already exists using exact style_intent match
        const { data: existing } = await db
          .from('cast_projects')
          .select('id')
          .eq('user_id', user.id)
          .eq('style_intent', 'ep04-sprint-documentary')
          .limit(1)
          .maybeSingle();

        if (existing?.id) {
          setAutoProjectId(existing.id);
          setProjectLoading(false);
          return;
        }

        // Also check by title as fallback (for rows created before this fix)
        const { data: legacyExisting } = await db
          .from('cast_projects')
          .select('id')
          .eq('user_id', user.id)
          .ilike('title', '%EP04%')
          .limit(1)
          .maybeSingle();

        if (legacyExisting?.id) {
          // Update legacy row with the stable style_intent so future lookups use exact match
          await db.from('cast_projects')
            .update({ style_intent: 'ep04-sprint-documentary' })
            .eq('id', legacyExisting.id);
          setAutoProjectId(legacyExisting.id);
          setProjectLoading(false);
          return;
        }

        // Create new EP04 project row with stable style_intent
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

        if (!error && created) {
          setAutoProjectId(created.id);
          console.log('[EP04] Auto-created project:', created.id);
        } else {
          console.error('[EP04] Failed to create project row:', error);
          setProjectLoadError(error?.message || 'Failed to create project — check database');
        }
      } catch (err: any) {
        console.error('[EP04] Project lookup/create error:', err);
        setProjectLoadError(err.message || 'Failed to load project');
      } finally {
        setProjectLoading(false);
      }
    })();
  }, [urlProjectId, autoProjectId]);

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
      const p = dbProject.scenePipelineFor(k);
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
        for (const [lineKey, audio] of Object.entries(restoredAudio)) {
          if (staticKeys.has(lineKey)) {
            db.from('cast_project_script_lines')
              .update({
                tts_audio_url: audio.audioUrl,
                tts_provider: audio.provider,
                tts_status: 'generated',
              })
              .eq('project_id', projectId)
              .eq('line_key', lineKey)
              .then(() => {}) // fire-and-forget repair
              .catch(() => {});
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

        if (dbScenes) {
          for (const row of dbScenes) {
            const cfg = (row.scene_config || {}) as Record<string, any>;
            const artifacts = cfg.artifacts as Record<string, Record<string, string>> | undefined;
            if (!artifacts) continue;
            const hasAnyUrl =
              Object.values(artifacts.videoUrls || {}).some(u => u) ||
              Object.values(artifacts.imageUrls || {}).some(u => u) ||
              Object.values(artifacts.avatarUrls || {}).some(u => u) ||
              Object.values(artifacts.lipsyncUrls || {}).some(u => u);
            if (!hasAnyUrl) continue;
            restored[row.scene_key] = {
              visual: 'done',
              music: cfg.musicUrl ? 'done' : 'idle',
              sfx: 'idle',
              assembled: cfg.assembledClipUrl ? 'done' : 'idle',
              videoUrls: artifacts.videoUrls || {},
              imageUrls: artifacts.imageUrls || {},
              avatarUrls: artifacts.avatarUrls || {},
              lipsyncUrls: artifacts.lipsyncUrls || {},
              musicUrl: cfg.musicUrl || null,
              sfxUrls: cfg.sfxUrls || [],
              assembledClipUrl: cfg.assembledClipUrl || null,
            };
          }
        }
      } catch (e) {
        console.warn('[EP04] scene_config artifacts restore failed:', e);
      }

      // Source 2: cast_generation_jobs — MERGE into Source 1 to fill gaps
      // Source 1 may have video/image URLs but be missing avatars (e.g. DashScope URLs were wiped)
      // Source 2 always has the original output_url from generation — never wiped
      try {
        const { data: visualJobs } = await db
          .from('cast_generation_jobs')
          .select('scene_key, job_type, output_url')
          .eq('project_id', projectId)
          .eq('status', 'completed')
          .not('output_url', 'is', null)
          .not('scene_key', 'is', null)
          .neq('job_type', 'tts')
          .order('created_at', { ascending: true });

        if (visualJobs) {
          let idx = 0;
          for (const job of visualJobs) {
            const sk = job.scene_key;
            if (!sk || !job.output_url) continue;
            if (!restored[sk]) {
              restored[sk] = {
                visual: 'done', music: 'idle', sfx: 'idle', assembled: 'idle',
                videoUrls: {}, imageUrls: {}, avatarUrls: {}, lipsyncUrls: {},
                musicUrl: null, sfxUrls: [], assembledClipUrl: null,
              };
            }
            idx++;
            const jt = job.job_type;
            const url = job.output_url as string;
            const isImageUrl = /\.(png|jpg|jpeg|webp|gif)(\?|$)/i.test(url);
            const urlKey = `${jt}-${sk}-${idx}`;
            // Merge: only add if the URL type bucket is empty (don't duplicate Source 1 data)
            if (jt === 'avatar' || jt === 'lipsync') {
              if (Object.keys(restored[sk].avatarUrls).length === 0) {
                restored[sk].avatarUrls[urlKey] = url;
              }
            } else if (jt === 'image' || isImageUrl) {
              if (Object.keys(restored[sk].imageUrls).length === 0) {
                restored[sk].imageUrls[urlKey] = url;
              }
            } else {
              if (Object.keys(restored[sk].videoUrls).length === 0) {
                restored[sk].videoUrls[urlKey] = url;
              }
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

      const restoredCount = Object.keys(restored).filter(sk => restored[sk].visual === 'done').length;
      if (restoredCount > 0) {
        setSceneProduction(prev => ({ ...prev, ...restored }));
        // Advance phase so Phase 3 is visible — scenes show assets not "Start Scene"
        setProductionPhase(prev => prev === 'tts' ? 'tts_approved' : prev);
        console.log(`[EP04] Restored visual artifacts for ${restoredCount} scenes from DB`);
        toast.success(`Restored ${restoredCount} scene(s) with visual assets`);

        // Re-persist restored artifacts back to scene_config so Source 1 works next time
        for (const [sk, status] of Object.entries(restored)) {
          updateSceneArtifacts(projectId, sk, {
            videoUrls: status.videoUrls,
            imageUrls: status.imageUrls,
            avatarUrls: status.avatarUrls,
            lipsyncUrls: status.lipsyncUrls,
          }).catch(() => {}); // fire-and-forget repair
        }
      }

      setContentLoaded(true);
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
    if (Object.values(sceneProduction).some(s => s.visual === 'done')) {
      console.log('[EP04] Skipping auto-seed — visual artifacts already restored from DB');
      seedAttemptedRef.current = true;
      return;
    }
    seedAttemptedRef.current = true;
    console.log('[EP04] No DB data found — auto-seeding from config files...');
    dbProject.seedFromConfig().then(ok => {
      if (ok) toast.success('Project seeded from config — DB is now source of truth');
      else console.warn('[EP04] Auto-seed failed — using config file fallback');
    });
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

      const audioUrl = data.audioUrl || `data:audio/mpeg;base64,${data.audioContent}`;
      const resolvedProvider = data.provider || voiceConfig.provider;
      const resolvedVoice = data.voice || voiceConfig.voiceId;
      const actualTokens = data.tokensUsed || Math.ceil(line.text.length / 4);

      setAudioMap(prev => ({
        ...prev,
        [key]: { audioUrl, provider: resolvedProvider, voice: resolvedVoice },
      }));
      setStatusMap(prev => ({ ...prev, [key]: 'done' }));

      // Auto-persist TTS result + complete job tracking
      if (projectId) {
        updateLineTTS(projectId, key, {
          tts_audio_url: audioUrl,
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

    // Build scenes
    const sceneEntries = Array.from(new Set(scriptKeys.map(k => scriptContentForUI[k].scene)));
    const scenesPayload = sceneEntries.map((sceneKey, idx) => ({
      project_id: projectId,
      scene_key: sceneKey,
      title: SCENE_TITLES[sceneKey] || sceneKey,
      scene_index: idx,
      art_style: SCENE_STYLES[sceneKey] || null,
      visual_style: SCENE_STYLES[sceneKey] || null,
      background_url: null, // Asset imports can't be persisted as URLs
      scene_config: {} as Record<string, unknown>,
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
  const SKIP_IN_VISUAL = new Set(['tts', 'music', 'sfx', 'scene-transition', 'storybook-frame']);

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
        const sourceUrl = screenshotUrls[sid];
        if (!sourceUrl) { toast.warning(`Screenshot "${sid}" not captured — skipping enhance`); continue; }

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
        const url = data?.url || data?.videoUrl || data?.imageUrl;
        if (url) results[`ai-screen-enhance-${sid}`] = url;
        if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url);
      }
      return;
    }

    // ── avatar-lipsync: CRITICAL — pass TTS audioUrl + avatar sourceImage for lip sync ──
    if (stepType === 'avatar-lipsync') {
      const character = (step.character as string) || 'host';
      const ttsAudioUrl = lastTTSByCharacter[character] || null;

      if (!ttsAudioUrl) {
        toast.warning(`No TTS audio for "${character}" lipsync — skipping`);
        return;
      }

      // Find the avatar source image for this character (from current results or pre-made)
      const avatarFromResults = Object.entries(results).find(([k]) => k.includes('avatar-3d') && k.includes(character))?.[1];
      const avatarPreMade = CHARACTER_AVATARS[character];
      const sourceImage = avatarFromResults || avatarPreMade;
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
      const url = data?.url || data?.videoUrl;
      if (url) {
        results[`avatar-lipsync-${character}`] = url;
        console.log(`[EP04 Visual] ${stepLabel}: lipsync "${character}" done: ${url.substring(0, 60)}...`);
      } else {
        console.warn(`[EP04 Visual] ${stepLabel}: lipsync "${character}" returned no URL`, data);
      }
      if (jobId && projectId) await completeGenerationJob(jobId, data?.tokensUsed || 500, url);
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
          const resolvedUrl = screenshotUrls[refImage]
            || Object.entries(screenshotUrls).find(([k]) => refImage.includes(k) || k.includes(refImage))?.[1]
            || Object.values(results).find(url => url && typeof url === 'string' && url.startsWith('http'))
            || SCENE_BACKGROUNDS[sceneKey];
          if (resolvedUrl) {
            body.referenceImage = resolvedUrl;
            console.log(`[EP04 Visual] Resolved i2v referenceImage "${refImage}" → ${resolvedUrl.substring(0, 80)}`);
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

  const startSceneVisualProduction = useCallback(async (sceneKey: string) => {
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
        // Sync config pipeline to DB so scenePipelineFor stays current (fire-and-forget)
        if (projectId) {
          supabase.from('cast_project_scenes').select('scene_config').eq('project_id', projectId).eq('scene_key', sceneKey).single()
            .then(({ data: row }) => {
              const existing = (row?.scene_config || {}) as Record<string, unknown>;
              return supabase.from('cast_project_scenes').update({ scene_config: { ...existing, pipeline: configPipeline } })
                .eq('project_id', projectId).eq('scene_key', sceneKey);
            }).catch(() => {}); // fire-and-forget
        }
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

      // ── Change 1: Track TTS audio per character for lipsync correlation ──
      // Pre-populate from audioMap (Phase 2 TTS already completed) so lipsync
      // works regardless of step ordering within the pipeline.
      const lastTTSByCharacter: Record<string, string> = {};
      const sceneLineKeys = scenes.get(sceneKey)?.keys || [];
      for (const lk of sceneLineKeys) {
        const lineData = scriptContentForUI[lk];
        const audio = audioMap[lk];
        if (lineData && audio?.audioUrl && audio.audioUrl.length > 0) {
          lastTTSByCharacter[lineData.voice] = audio.audioUrl;
        }
      }

      // ── Smart regeneration: skip steps that already have a generated asset ──
      const existingScene = sceneProduction[sceneKey];
      const existingVideoUrls = existingScene?.videoUrls || {};
      const existingImageUrls = existingScene?.imageUrls || {};
      const existingAvatarUrls = existingScene?.avatarUrls || {};
      const existingLipsyncUrls = existingScene?.lipsyncUrls || {};

      const hasExistingAsset = (sType: string, sKey: string, character?: string): boolean => {
        if (sType === 'alibaba-video' || sType === 'video') {
          return Object.keys(existingVideoUrls).some(k => k.includes('video') && k.includes(sKey));
        }
        if (sType === 'kinetic-text' || sType === 'motion-graphics' || sType === 'screen-capture') {
          return Object.keys(existingImageUrls).some(k => k.includes(sType.split('-')[0]) && k.includes(sKey));
        }
        if (sType === 'avatar-3d' && character) {
          // Only skip if the existing avatar is NOT the pre-made fallback (i.e., it's an AI-generated URL)
          const existingUrl = Object.entries(existingAvatarUrls).find(([k]) => k.includes(character))?.[1];
          return !!existingUrl && existingUrl.startsWith('http') && !existingUrl.includes('/assets/');
        }
        if (sType === 'avatar-lipsync' && character) {
          return Object.keys(existingLipsyncUrls).some(k => k.includes(character));
        }
        return false;
      };

      // Count visual steps for progress tracking
      const visualSteps = pipelineSteps.filter(s => !SKIP_IN_VISUAL.has((s.type as string) || 'image'));
      let visualStepNum = 0;
      const totalVisualSteps = visualSteps.length;

      for (let i = 0; i < pipelineSteps.length; i++) {
        if (abortRef.current) break;
        const step = pipelineSteps[i] as Record<string, unknown>;
        const stepType = (step.type as string) || 'image';

        // ── Change 1: Track TTS audio for lipsync (don't regenerate) ──
        if (stepType === 'tts') {
          const scriptKey = step.scriptKey as string;
          const voice = step.voice as string;
          if (scriptKey && audioMap[scriptKey]?.audioUrl) {
            lastTTSByCharacter[voice] = audioMap[scriptKey].audioUrl;
          }
          continue;
        }

        // Skip non-visual step types
        if (SKIP_IN_VISUAL.has(stepType)) continue;

        // ── Skip steps that already have a generated asset ──
        const stepCharacter = step.character as string | undefined;
        if (hasExistingAsset(stepType, sceneKey, stepCharacter)) {
          const existKey = stepCharacter ? `${stepType}(${stepCharacter})` : stepType;
          console.log(`[EP04 Visual] ${sceneKey}: skipping ${existKey} — already generated`);
          // Carry forward existing results so they're preserved in the final output
          if (stepType === 'alibaba-video' || stepType === 'video') {
            Object.assign(results, existingVideoUrls);
          } else if (stepType === 'avatar-3d' && stepCharacter) {
            const entry = Object.entries(existingAvatarUrls).find(([k]) => k.includes(stepCharacter));
            if (entry) results[entry[0]] = entry[1];
          } else if (stepType === 'avatar-lipsync' && stepCharacter) {
            const entry = Object.entries(existingLipsyncUrls).find(([k]) => k.includes(stepCharacter));
            if (entry) results[entry[0]] = entry[1];
          } else {
            Object.assign(results, existingImageUrls);
          }
          continue;
        }

        // ── Change 7: Per-step progress toast ──
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
      if (projectId) {
        await updateSceneArtifacts(projectId, sceneKey, {
          videoUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('video') || k.includes('character-interaction') || k.includes('narrator-scroll'))),
          imageUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('image') || k.includes('kinetic') || k.includes('motion') || k.includes('screen-capture') || k.includes('ai-screen-enhance'))),
          avatarUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('avatar-3d'))),
          lipsyncUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('lipsync'))),
        });
      }

      setSceneProduction(prev => ({
        ...prev,
        [sceneKey]: {
          ...(prev[sceneKey] || defaultSceneStatus()),
          visual: 'done',
          videoUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('video') || k.includes('character-interaction') || k.includes('narrator-scroll') || k.includes('lipsync'))),
          imageUrls: Object.fromEntries(Object.entries(results).filter(([k]) => !k.includes('video') && !k.includes('lipsync') && !k.includes('character-interaction') && !k.includes('narrator-scroll'))),
          avatarUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('avatar-3d'))),
          lipsyncUrls: Object.fromEntries(Object.entries(results).filter(([k]) => k.includes('lipsync'))),
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

      // Generate music
      if (musicConfig) {
        let jobId: string | null = null;
        if (projectId) {
          jobId = await trackGenerationJob({
            projectId, jobType: 'video', sceneKey, provider: 'suno', estimatedTokens: 1000,
          });
        }

        const { data, error } = await supabase.functions.invoke('multi-provider-music', {
          body: {
            prompt: musicConfig.prompt || `Background music for ${sceneKey}`,
            duration: musicConfig.duration || 30,
            instrumental: true,
          },
        });

        if (!error && data?.audioUrl) {
          musicUrl = data.audioUrl;
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
          music: 'done',
          musicUrl,
          sfxUrls,
        },
      }));

      toast.success(`Music & SFX complete for ${sceneKey}`);
    } catch (err: any) {
      console.error(`[EP04 Music] Scene ${sceneKey} failed:`, err);
      setSceneProduction(prev => ({
        ...prev,
        [sceneKey]: { ...(prev[sceneKey] || defaultSceneStatus()), music: 'error' },
      }));
    }
  }, [dbProject, projectId, trackGenerationJob, completeGenerationJob, updateSceneMusic]);

  const startAllMusicProduction = useCallback(async () => {
    const sceneKeys = Array.from(scenes.keys());
    setProductionPhase('music');
    setMusicProgress({ current: 0, total: sceneKeys.length });

    for (let i = 0; i < sceneKeys.length; i++) {
      if (abortRef.current) break;
      setMusicProgress({ current: i + 1, total: sceneKeys.length });
      await startSceneMusicProduction(sceneKeys[i]);
    }

    setMusicProgress(null);
    toast.success('All music & SFX production complete');
  }, [scenes, startSceneMusicProduction]);

  // ─── Phase 5: Assembly → One Cinematic Movie ──────────────────────────

  const startFinalAssembly = useCallback(async () => {
    setProductionPhase('assembly');
    setAssemblyProgress('Assembling per-scene clips...');

    try {
      const sceneKeys = Array.from(scenes.keys());

      // Step 1: Per-scene assembly (TTS audio + visual + lipsync)
      setAssemblyProgress(`Assembling ${sceneKeys.length} scene clips...`);
      for (const sceneKey of sceneKeys) {
        const sceneStatus = sceneProduction[sceneKey];
        if (!sceneStatus) continue;

        const sceneLines = scriptKeys.filter(k => scriptContentForUI[k]?.scene === sceneKey);
        const sceneTTSUrls = sceneLines
          .filter(k => audioMap[k])
          .reduce((acc, k) => ({ ...acc, [k]: audioMap[k].audioUrl }), {});

        let jobId: string | null = null;
        if (projectId) {
          jobId = await trackGenerationJob({
            projectId, jobType: 'video', sceneKey, provider: 'assembly', estimatedTokens: 2000,
          });
        }

        const { data } = await supabase.functions.invoke('ai-universal-processor', {
          body: {
            action: 'assemble_video',
            sceneKey,
            ttsAudioUrls: sceneTTSUrls,
            videoUrls: sceneStatus.videoUrls,
            imageUrls: sceneStatus.imageUrls,
            avatarUrls: sceneStatus.avatarUrls,
            lipsyncUrls: sceneStatus.lipsyncUrls,
            musicUrl: sceneStatus.musicUrl,
            sfxUrls: sceneStatus.sfxUrls,
          },
        });

        if (data?.videoUrl) {
          setSceneProduction(prev => ({
            ...prev,
            [sceneKey]: { ...(prev[sceneKey] || defaultSceneStatus()), assembled: 'done', assembledClipUrl: data.videoUrl },
          }));
        }

        if (jobId && projectId) {
          await completeGenerationJob(jobId, data?.tokensUsed || 2000, data?.videoUrl);
        }
      }

      // Step 2: Render transitions
      setAssemblyProgress('Rendering storybook transitions...');
      await supabase.functions.invoke('ai-universal-processor', {
        body: { action: 'generate_video', type: 'transitions', transitions: EP04_STORYBOOK_TRANSITIONS },
      });

      // Step 3: Render bookends
      setAssemblyProgress('Rendering opening & closing bookends...');
      await supabase.functions.invoke('ai-universal-processor', {
        body: { action: 'generate_video', type: 'bookends', bookends: EP04_STORYBOOK_BOOKENDS },
      });

      // Step 4: Audio mixing
      setAssemblyProgress('Mixing audio: dialogue + music + SFX...');
      await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'mix_audio',
          sceneAudio: Object.fromEntries(
            sceneKeys.map(sk => [sk, {
              tts: scriptKeys.filter(k => scriptContentForUI[k]?.scene === sk && audioMap[k]).map(k => audioMap[k].audioUrl),
              music: sceneProduction[sk]?.musicUrl,
              sfx: sceneProduction[sk]?.sfxUrls || [],
            }])
          ),
        },
      });

      // Step 5: Final stitching → one MP4
      setAssemblyProgress('Final stitching — assembling cinematic movie...');
      const assembledClips = sceneKeys
        .map(sk => sceneProduction[sk]?.assembledClipUrl)
        .filter(Boolean);

      const { data: finalData } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'assemble_video',
          type: 'final',
          sceneClips: assembledClips,
          transitions: EP04_STORYBOOK_TRANSITIONS,
          bookends: EP04_STORYBOOK_BOOKENDS,
        },
      });

      const finalUrl = finalData?.videoUrl || finalData?.url || null;
      setFinalVideoUrl(finalUrl);

      // Persist final assembly
      if (projectId && finalUrl) {
        await updateFinalAssembly(projectId, finalUrl, {
          totalDuration: totalDuration,
          sceneCount: sceneKeys.length,
          resolution: '1920x1080',
        });
      }

      setProductionPhase('complete');
      setAssemblyProgress(null);
      toast.success('Cinematic movie assembled successfully!');
    } catch (err: any) {
      console.error('[EP04 Assembly] Failed:', err);
      setAssemblyProgress(null);
      toast.error(`Assembly failed: ${err.message}`);
    }
  }, [scenes, sceneProduction, scriptKeys, scriptContentForUI, audioMap, projectId, trackGenerationJob, completeGenerationJob, updateFinalAssembly, totalDuration]);

  // ─── Render ──────────────────────────────────────────────────────────────

  // Show loading/error state while project is being resolved
  if (projectLoading || (!projectId && !projectLoadError)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold mb-2">Loading EP04 Project...</h2>
          <p className="text-sm text-muted-foreground">Looking up project in database</p>
        </Card>
      </div>
    );
  }

  if (projectLoadError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <h2 className="text-lg font-semibold mb-2">Project Load Failed</h2>
          <p className="text-sm text-muted-foreground mb-4">{projectLoadError}</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
            </Button>
            <Button onClick={() => {
              autoCreateAttempted.current = false;
              setProjectLoadError(null);
              setProjectLoading(true);
              // Re-trigger the effect by resetting the ref guard
              setTimeout(() => {
                autoCreateAttempted.current = false;
                setAutoProjectId(null);
              }, 0);
            }}>
              Retry
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
            const phase3Unlocked = productionPhase !== 'tts';
            const phase3Done = productionPhase === 'music' || productionPhase === 'assembly' || productionPhase === 'complete';
            return (
            <div className="mt-6">
              <Card className={cn(
                'border transition-all',
                !phase3Unlocked && 'opacity-50',
                phase3Unlocked && !phase3Done && 'ring-2 ring-primary/30',
                phase3Done && 'border-green-500/30 bg-green-500/[0.02]',
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
                        phase3Done ? 'bg-green-500 text-white' :
                        phase3Unlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                      )}>
                        {phase3Done ? <CheckCircle2 className="h-4 w-4" /> : '3'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Phase 3: Visual Production</h3>
                        <p className="text-sm text-muted-foreground">
                          {phase3Unlocked
                            ? 'Generate video, avatar, lipsync assets per scene pipeline'
                            : 'Approve TTS to unlock visual production'}
                        </p>
                        {phase3Unlocked && !phase3Done && (
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
                      {!phase3Unlocked && (
                        <Badge variant="outline" className="text-xs">Locked</Badge>
                      )}
                      {visualProgress && (
                        <>
                          <Progress value={(visualProgress.current / visualProgress.total) * 100} className="w-32 h-2" />
                          <span className="text-xs text-muted-foreground">{visualProgress.current}/{visualProgress.total}</span>
                        </>
                      )}
                      {phase3Unlocked && !phase3Done && !visualProgress && (
                        <Button
                          size="sm"
                          onClick={startAllVisualProduction}
                          disabled={scenesWithPipeline.length === 0}
                        >
                          <Film className="h-3 w-3 mr-1" />
                          Produce All Visuals
                        </Button>
                      )}
                      {phase3Done && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Per-scene visual status cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from(scenes.keys()).map(sceneKey => {
                      const status = sceneProduction[sceneKey];
                      const rawPipeline = dbProject.scenePipelineFor(sceneKey);
                      const pipelineSteps = Array.isArray(rawPipeline) ? rawPipeline : (rawPipeline?.steps || []) as Array<Record<string, unknown>>;
                      const visualOnlySteps = pipelineSteps.filter(s => !SKIP_IN_VISUAL.has((s.type as string) || 'image'));
                      const pipelineId = SCRIPT_TO_PIPELINE_MAP[sceneKey] || sceneKey;
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
                              {status?.visual === 'done' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                              {status?.visual === 'generating' && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                              {status?.visual === 'error' && <AlertCircle className="h-3 w-3 text-red-500" />}
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
                          {phase3Unlocked && !phase3Done && status?.visual !== 'done' && (
                            <Button
                              size="sm" variant="outline" className="w-full h-7 text-[10px]"
                              onClick={() => startSceneVisualProduction(sceneKey)}
                              disabled={status?.visual === 'generating' || pipelineSteps.length === 0}
                            >
                              {status?.visual === 'generating' ? 'Producing...' : pipelineSteps.length === 0 ? 'No Pipeline' : 'Start Scene'}
                            </Button>
                          )}
                          {/* Regenerate button for completed/errored scenes */}
                          {phase3Unlocked && (status?.visual === 'done' || status?.visual === 'error') && (
                            <Button
                              size="sm" variant="outline" className="w-full h-7 text-[10px] mt-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                              onClick={async () => {
                                // Clear old assets from DB before regenerating
                                if (projectId) {
                                  const db = supabase as any;
                                  // Delete old generation jobs for this scene (non-TTS)
                                  await db.from('cast_generation_jobs')
                                    .delete()
                                    .eq('project_id', projectId)
                                    .eq('scene_key', sceneKey)
                                    .neq('job_type', 'tts');
                                  // Clear artifacts in scene_config
                                  await updateSceneArtifacts(projectId, sceneKey, {
                                    videoUrls: {}, imageUrls: {}, avatarUrls: {}, lipsyncUrls: {},
                                  });
                                }
                                // Reset scene status so startSceneVisualProduction can re-run
                                setSceneProduction(prev => ({
                                  ...prev,
                                  [sceneKey]: { ...defaultSceneStatus() },
                                }));
                                startSceneVisualProduction(sceneKey);
                              }}
                              disabled={status?.visual === 'generating' || pipelineSteps.length === 0}
                            >
                              <Film className="h-3 w-3 mr-1" />
                              Regenerate Scene
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
                            if (totalAssets === 0) return null;
                            return (
                              <div className="mt-2 space-y-2">
                                <p className="text-[9px] text-muted-foreground font-medium">{totalAssets} assets generated:</p>
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
                                              />
                                            ) : (
                                              <img
                                                src={url}
                                                alt={key}
                                                className="w-full h-24 object-cover rounded border border-border/30 bg-black"
                                                loading="lazy"
                                              />
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 rounded-b">
                                              <span className="text-[7px] text-white/80 truncate block">{key}</span>
                                            </div>
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
            const phase4Unlocked = productionPhase === 'music' || productionPhase === 'assembly' || productionPhase === 'complete';
            const phase4Done = productionPhase === 'assembly' || productionPhase === 'complete';
            return (
            <div className="mt-6">
              <Card className={cn(
                'border transition-all',
                !phase4Unlocked && 'opacity-50',
                phase4Unlocked && !phase4Done && 'ring-2 ring-primary/30',
                phase4Done && 'border-green-500/30 bg-green-500/[0.02]',
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
                        phase4Done ? 'bg-green-500 text-white' :
                        phase4Unlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                      )}>
                        {phase4Done ? <CheckCircle2 className="h-4 w-4" /> : '4'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Phase 4: Music & SFX</h3>
                        <p className="text-sm text-muted-foreground">
                          {phase4Unlocked
                            ? 'Generate per-scene music tracks and sound effects'
                            : 'Complete visual production to unlock music & SFX'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!phase4Unlocked && (
                        <Badge variant="outline" className="text-xs">Locked</Badge>
                      )}
                      {musicProgress && (
                        <>
                          <Progress value={(musicProgress.current / musicProgress.total) * 100} className="w-32 h-2" />
                          <span className="text-xs text-muted-foreground">{musicProgress.current}/{musicProgress.total}</span>
                        </>
                      )}
                      {phase4Unlocked && !phase4Done && !musicProgress && (
                        <Button size="sm" onClick={startAllMusicProduction}>
                          <Music className="h-3 w-3 mr-1" />
                          Generate All Music
                        </Button>
                      )}
                      {phase4Done && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                          Complete
                        </Badge>
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
                          status?.music === 'generating' ? 'border-primary/30' : 'border-border/30',
                        )}>
                          <p className="text-[10px] font-bold truncate">{SCENE_TITLES[sceneKey]?.split(' — ')[1] || sceneKey}</p>
                          {status?.music === 'done' && <CheckCircle2 className="h-3 w-3 text-green-500 mx-auto mt-1" />}
                          {status?.music === 'generating' && <Loader2 className="h-3 w-3 animate-spin text-primary mx-auto mt-1" />}
                          {status?.musicUrl && (
                            <audio src={status.musicUrl} controls className="w-full mt-2 h-6" />
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
            const phase5Unlocked = productionPhase === 'assembly' || productionPhase === 'complete';
            const phase5Done = productionPhase === 'complete';
            return (
            <div className="mt-6 mb-8">
              <Card className={cn(
                'border transition-all',
                !phase5Unlocked && 'opacity-50',
                phase5Unlocked && !phase5Done && 'ring-2 ring-primary/30',
                phase5Done && 'border-green-500/30 bg-green-500/[0.02]',
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
                        phase5Done ? 'bg-green-500 text-white' :
                        phase5Unlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                      )}>
                        {phase5Done ? <CheckCircle2 className="h-4 w-4" /> : '5'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Phase 5: Final Assembly</h3>
                        <p className="text-sm text-muted-foreground">
                          {phase5Unlocked
                            ? 'Stitch all scenes + transitions + bookends + audio into one cinematic MP4'
                            : 'Complete music & SFX production to unlock final assembly'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!phase5Unlocked && (
                        <Badge variant="outline" className="text-xs">Locked</Badge>
                      )}
                      {assemblyProgress && (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-xs text-muted-foreground">{assemblyProgress}</span>
                        </div>
                      )}
                      {phase5Unlocked && !phase5Done && !assemblyProgress && (
                        <Button size="sm" onClick={startFinalAssembly}>
                          <Clapperboard className="h-3 w-3 mr-1" />
                          Assemble Movie
                        </Button>
                      )}
                      {phase5Done && (
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                          Complete
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Assembly stages */}
                  <div className="space-y-2">
                    {[
                      { label: 'Per-scene assembly', desc: 'Combine TTS + visual + lipsync for each scene' },
                      { label: 'Transition rendering', desc: 'Storybook page turns, iris wipes, dissolves' },
                      { label: 'Bookend rendering', desc: 'Opening + closing storybook sequences' },
                      { label: 'Audio mixing', desc: 'Layer music + SFX under dialogue' },
                      { label: 'Final stitching', desc: 'All clips → one cinematic MP4' },
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
            const phase6Unlocked = hasAnyAssets || productionPhase === 'complete';
            if (!phase6Unlocked) return null;

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
