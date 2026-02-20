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
  Camera, Monitor, Image as ImageIcon, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EP04_SCRIPT_CONTENT, type ScriptLine } from '@/config/ep04-script-content';
import { EP04_VOICES } from '@/config/ep04-production-config';
import { EP04_SCENE_SCREENSHOT_MAP, PRODUCT_SCREENS } from '@/components/genie-admin/MultiScreenshotGallery';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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

function getVoiceConfig(voice: 'host' | 'atlas' | 'nova' | 'squirrel' | 'allaudin') {
  // Squirrel uses Nova's voice config with higher pitch; Allaudin uses a deep ElevenLabs voice
  const voiceKey = voice === 'squirrel' ? 'nova' : voice === 'allaudin' ? 'host' : voice;
  const v = EP04_VOICES[voiceKey];
  return {
    provider: v.provider as string,
    voiceId: voice === 'allaudin' ? 'onwK4e9ZLuTAKqWW03F9' : v.voiceId, // Daniel voice for Allaudin — deep, resonant
    stability: 'stability' in v ? (voice === 'allaudin' ? 0.6 : v.stability) : undefined,
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
  host: 'Sai Dasika — Host & Product Owner',
  atlas: 'Atlas (Claude)',
  nova: 'Nova (Lovable)',
  squirrel: '🐿️ Squirrel — The Distractor',
  allaudin: '🧞 Allaudin — The Genie',
};

const CHARACTER_AVATARS: Record<string, string> = {
  host: hostAvatar,
  atlas: atlasAvatar,
  nova: novaAvatar,
  squirrel: squirrelAvatar,
  allaudin: allaudinAvatar,
};

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

export default function EP04Production() {
  const navigate = useNavigate();
  const scriptKeys = Object.keys(EP04_SCRIPT_CONTENT);

  // State
  const [audioMap, setAudioMap] = useState<Record<string, GeneratedAudio>>({});
  const [statusMap, setStatusMap] = useState<Record<string, LineStatus>>({});
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [screenshotUrls, setScreenshotUrls] = useState<Record<string, string>>({});
  const [screenshotsLoading, setScreenshotsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef(false);

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
    const line = EP04_SCRIPT_CONTENT[key];
    if (!line) return false;

    setStatusMap(prev => ({ ...prev, [key]: 'generating' }));
    const voiceConfig = getVoiceConfig(line.voice);

    try {
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

      if (error) throw error;
      if (!data?.audioContent && !data?.audioUrl) throw new Error('No audio returned');

      const audioUrl = data.audioUrl || `data:audio/mpeg;base64,${data.audioContent}`;

      setAudioMap(prev => ({
        ...prev,
        [key]: { audioUrl, provider: data.provider || voiceConfig.provider, voice: data.voice || voiceConfig.voiceId },
      }));
      setStatusMap(prev => ({ ...prev, [key]: 'done' }));
      return true;
    } catch (err: any) {
      console.error(`[EP04 TTS] Failed: ${key}`, err);
      setStatusMap(prev => ({ ...prev, [key]: 'error' }));
      return false;
    }
  }, []);

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
    toast.success(`Generated ${success}/${keys.length} voiceovers`);
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

  // ─── Stats ───────────────────────────────────────────────────────────────

  const doneCount = scriptKeys.filter(k => statusMap[k] === 'done').length;
  const totalDuration = scriptKeys.reduce((sum, k) => sum + EP04_SCRIPT_CONTENT[k].duration_est, 0);

  // ─── Render ──────────────────────────────────────────────────────────────

  // Group by scene
  const scenes = new Map<string, { keys: string[]; lines: ScriptLine[] }>();
  for (const key of scriptKeys) {
    const line = EP04_SCRIPT_CONTENT[key];
    if (!scenes.has(line.scene)) {
      scenes.set(line.scene, { keys: [], lines: [] });
    }
    scenes.get(line.scene)!.keys.push(key);
    scenes.get(line.scene)!.lines.push(line);
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Script Lines */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          {/* Episode Thumbnail Banner — Collage with Two AI Developers */}
          <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-[hsl(220,60%,10%)] via-background to-[hsl(330,40%,12%)]">
            {/* Background thumbnail image */}
            <img
              src={ep02Thumbnail}
              alt="The Genie AI Podcast — Beyond AI Hype — Episode 2"
              className="w-full h-auto object-cover rounded-2xl opacity-30"
            />
            {/* Collage overlay with two AI developer logos */}
            <div className="absolute inset-0 flex items-center justify-center gap-8 sm:gap-12 p-6">
              {/* Claude (Atlas) */}
              <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="relative group">
                  <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/40 transition-all duration-500 animate-pulse" />
                  <img src={claudeLogo} alt="Claude / Anthropic" className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-primary/40 shadow-2xl hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-sm font-bold text-primary drop-shadow-lg">Atlas · Claude</span>
                <span className="text-[10px] text-muted-foreground italic max-w-[140px] text-center">"Let me stop talking and write the code now."</span>
              </div>

              {/* × divider */}
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-muted-foreground/50">×</span>
              </div>

              {/* Lovable (Nova) */}
              <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="relative group">
                  <div className="absolute -inset-2 bg-accent/20 rounded-2xl blur-xl group-hover:bg-accent/40 transition-all duration-500 animate-pulse" />
                  <img src={lovableLogo} alt="Lovable" className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-accent/40 shadow-2xl object-contain bg-card p-2 hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-sm font-bold text-accent drop-shadow-lg">Nova · Lovable</span>
                <span className="text-[10px] text-muted-foreground italic max-w-[140px] text-center">"I don't sit idle. I build."</span>
              </div>
            </div>

            {/* Bottom gradient with corrected title */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent p-6">
              <p className="text-xs text-primary/70 font-semibold uppercase tracking-widest mb-1">Beyond AI Hype — Episode 2</p>
              <h2 className="text-2xl font-bold text-foreground">Two AI Developers. One Human PO. Real Sprint.</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Host: Sai Dasika · with Allaudin · AI • Experimentation • Real-World Impact
              </p>
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
                const availableScreens = primaryEntry?.screenIds.filter(sid => screenshotUrls[sid]) || [];
                const showOriginal = styleConfig?.showOriginal && availableScreens.length > 0;

                return (
                  <>
                    <div className={cn(
                      "relative rounded-xl overflow-hidden mb-4 group",
                      showOriginal ? 'h-auto' : 'h-40'
                    )}>
                      {/* AI Background — always present */}
                      <div className="relative h-40">
                        <img
                          src={SCENE_BACKGROUNDS[sceneId]}
                          alt={SCENE_TITLES[sceneId] || sceneId}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                          <div>
                            <h2 className="text-lg font-bold text-foreground drop-shadow-lg">
                              {SCENE_TITLES[sceneId] || sceneId.replace(/-/g, ' ')}
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs text-muted-foreground">
                                {keys.length} line{keys.length !== 1 ? 's' : ''} · Art Style: {SCENE_STYLES[sceneId] || 'Mixed'}
                              </p>
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
                            {primaryEntry?.screens.map(s => (
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
                                  {line.sfx && line.sfx.length > 0 && (
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
                              {!isPlaying && line.sfx && line.sfx.length > 0 && (
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
                            {line.links && line.links.length > 0 && (
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
        </div>
      </ScrollArea>
    </div>
  );
}
