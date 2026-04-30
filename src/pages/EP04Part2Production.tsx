/**
 * EP04 Part 2 — "The Production" — Scene-by-Scene TTS Production Page
 *
 * Mirrors the per-scene / per-character layout of EP04Production.tsx (Part 1),
 * adapted for Part 2's 16 scenes, 9 voices, ~140 lines + 15 narrator bridges.
 *
 * Per-scene display:
 *   - Scene header + description
 *   - All dialogue lines grouped by character with TTS Generate / Play controls
 *   - Transition card (narrator bridge) appended at end of each scene
 *
 * Bridges with scene `p2-transition-N-to-M` are folded into scene N via
 * PART2_TRANSITION_TO_SCENE (matches Part 1's pattern).
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Play, Pause, Loader2, CheckCircle2, AlertCircle, Mic, ArrowLeft, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  EP04_PART2_SCRIPT_CONTENT,
  EP04_PART2_NARRATOR_BRIDGES,
  P2_SCENES,
  type Part2ScriptLine,
} from '@/config/ep04-part2-script-content';
import {
  EP04_PART2_VOICES,
  EP04_PART2_TRANSITIONS,
  EP04_PART2_STORYBOOK_BOOKENDS,
  PART2_TRANSITION_TO_SCENE,
  EP04_PART2_SCENE_TITLES,
  EP04_PART2_VOICE_BADGE_CLASSES,
  EP04_PART2_CHARACTER_INTERACTIONS,
  EP04_PART2_NARRATOR_SCROLLS,
  resolvePart2VoiceWithFallback,
} from '@/config/ep04-part2-production-config';
import { cn } from '@/lib/utils';

// ─── Character avatar imports (Part 2 — generated from EP04_PART2_AVATAR_CONFIG.pixarPrompt) ──
import atlasAvatar    from '@/assets/characters/ep04-part2/atlas.png';
import novaAvatar     from '@/assets/characters/ep04-part2/nova.png';
import hostAvatar     from '@/assets/characters/ep04-part2/host.png';
import allaudinAvatar from '@/assets/characters/ep04-part2/allaudin.png';
import squirrelAvatar from '@/assets/characters/ep04-part2/squirrel.png';
import owlAvatar      from '@/assets/characters/ep04-part2/owl.png';
import reelAvatar     from '@/assets/characters/ep04-part2/reel.png';
import maestroAvatar  from '@/assets/characters/ep04-part2/maestro.png';
import forgeAvatar    from '@/assets/characters/ep04-part2/forge.png';

// ─── Scene background imports (16 Pixar-style stills) ──
import scene0Bg  from '@/assets/scenes/ep04-part2/scene-0-cold-open.png';
import scene1Bg  from '@/assets/scenes/ep04-part2/scene-1-recap.png';
import scene2Bg  from '@/assets/scenes/ep04-part2/scene-2-nova-farewell.png';
import scene3Bg  from '@/assets/scenes/ep04-part2/scene-3-atlas-solo.png';
import scene4Bg  from '@/assets/scenes/ep04-part2/scene-4-json2video-death.png';
import scene5Bg  from '@/assets/scenes/ep04-part2/scene-5-production-hell.png';
import scene6Bg  from '@/assets/scenes/ep04-part2/scene-6-model-crisis.png';
import scene7Bg  from '@/assets/scenes/ep04-part2/scene-7-provider-stack.png';
import scene8Bg  from '@/assets/scenes/ep04-part2/scene-8-characters-speak.png';
import scene9Bg  from '@/assets/scenes/ep04-part2/scene-9-pipeline-live.png';
import scene10Bg from '@/assets/scenes/ep04-part2/scene-10-thirty-minutes.png';
import scene11Bg from '@/assets/scenes/ep04-part2/scene-11-meta-moment.png';
import scene12Bg from '@/assets/scenes/ep04-part2/scene-12-different-podcast.png';
import scene13Bg from '@/assets/scenes/ep04-part2/scene-13-imagination.png';
import scene14Bg from '@/assets/scenes/ep04-part2/scene-14-retro-cta.png';
import scene15Bg from '@/assets/scenes/ep04-part2/scene-15-finale.png';

// ─── Transition still imports (15 between-scene stills) ──
import t0to1   from '@/assets/scenes/ep04-part2/transitions/t-0-to-1.png';
import t1to2   from '@/assets/scenes/ep04-part2/transitions/t-1-to-2.png';
import t2to3   from '@/assets/scenes/ep04-part2/transitions/t-2-to-3.png';
import t3to4   from '@/assets/scenes/ep04-part2/transitions/t-3-to-4.png';
import t4to5   from '@/assets/scenes/ep04-part2/transitions/t-4-to-5.png';
import t5to6   from '@/assets/scenes/ep04-part2/transitions/t-5-to-6.png';
import t6to7   from '@/assets/scenes/ep04-part2/transitions/t-6-to-7.png';
import t7to8   from '@/assets/scenes/ep04-part2/transitions/t-7-to-8.png';
import t8to9   from '@/assets/scenes/ep04-part2/transitions/t-8-to-9.png';
import t9to10  from '@/assets/scenes/ep04-part2/transitions/t-9-to-10.png';
import t10to11 from '@/assets/scenes/ep04-part2/transitions/t-10-to-11.png';
import t11to12 from '@/assets/scenes/ep04-part2/transitions/t-11-to-12.png';
import t12to13 from '@/assets/scenes/ep04-part2/transitions/t-12-to-13.png';
import t13to14 from '@/assets/scenes/ep04-part2/transitions/t-13-to-14.png';
import t14to15 from '@/assets/scenes/ep04-part2/transitions/t-14-to-15.png';

/** Single source of truth for avatar lookup. Keys MUST match EP04_PART2_VOICES keys. */
const AVATAR_MAP: Record<string, string> = {
  atlas:    atlasAvatar,
  nova:     novaAvatar,
  host:     hostAvatar,
  allaudin: allaudinAvatar,
  squirrel: squirrelAvatar,
  owl:      owlAvatar,
  reel:     reelAvatar,
  maestro:  maestroAvatar,
  forge:    forgeAvatar,
};

/** Scene-key → background image. Keys are P2_SCENES.* values. */
const SCENE_BG_MAP: Record<string, string> = {
  [P2_SCENES.COLD_OPEN]:         scene0Bg,
  [P2_SCENES.RECAP]:             scene1Bg,
  [P2_SCENES.NOVA_FAREWELL]:     scene2Bg,
  [P2_SCENES.ATLAS_SOLO]:        scene3Bg,
  [P2_SCENES.JSON2VIDEO_DEATH]:  scene4Bg,
  [P2_SCENES.PRODUCTION_HELL]:   scene5Bg,
  [P2_SCENES.MODEL_CRISIS]:      scene6Bg,
  [P2_SCENES.PROVIDER_STACK]:    scene7Bg,
  [P2_SCENES.CHARACTERS_SPEAK]:  scene8Bg,
  [P2_SCENES.PIPELINE_LIVE]:     scene9Bg,
  [P2_SCENES.THIRTY_MINUTES]:    scene10Bg,
  [P2_SCENES.META_MOMENT]:       scene11Bg,
  [P2_SCENES.DIFFERENT_PODCAST]: scene12Bg,
  [P2_SCENES.IMAGINATION]:       scene13Bg,
  [P2_SCENES.RETRO_CTA]:         scene14Bg,
  [P2_SCENES.FINALE]:            scene15Bg,
};

/** From-scene-key → transition still image (15 transitions, fromScene = key). */
const TRANSITION_BG_MAP: Record<string, string> = {
  [P2_SCENES.COLD_OPEN]:         t0to1,
  [P2_SCENES.RECAP]:             t1to2,
  [P2_SCENES.NOVA_FAREWELL]:     t2to3,
  [P2_SCENES.ATLAS_SOLO]:        t3to4,
  [P2_SCENES.JSON2VIDEO_DEATH]:  t4to5,
  [P2_SCENES.PRODUCTION_HELL]:   t5to6,
  [P2_SCENES.MODEL_CRISIS]:      t6to7,
  [P2_SCENES.PROVIDER_STACK]:    t7to8,
  [P2_SCENES.CHARACTERS_SPEAK]:  t8to9,
  [P2_SCENES.PIPELINE_LIVE]:     t9to10,
  [P2_SCENES.THIRTY_MINUTES]:    t10to11,
  [P2_SCENES.META_MOMENT]:       t11to12,
  [P2_SCENES.DIFFERENT_PODCAST]: t12to13,
  [P2_SCENES.IMAGINATION]:       t13to14,
  [P2_SCENES.RETRO_CTA]:         t14to15,
};

const SCENE_ORDER = Object.values(P2_SCENES);

// ─── Types ──────────────────────────────────────────────────────────────────

interface GeneratedAudio {
  audioUrl: string;
  provider: string;
  voice: string;
}
type LineStatus = 'idle' | 'generating' | 'done' | 'error';

// ─── Component ──────────────────────────────────────────────────────────────

export default function EP04Part2Production() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || 'ep04-part2-preview';

  const [audioMap, setAudioMap] = useState<Record<string, GeneratedAudio>>({});
  const [statusMap, setStatusMap] = useState<Record<string, LineStatus>>({});
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Build a unified line map then group by *parent* scene (transitions fold in)
  const allLines = useMemo<Record<string, Part2ScriptLine>>(() => {
    const map: Record<string, Part2ScriptLine> = {};
    for (const [k, l] of Object.entries(EP04_PART2_SCRIPT_CONTENT)) {
      map[k] = l;
    }
    for (const [k, l] of Object.entries(EP04_PART2_NARRATOR_BRIDGES)) {
      map[k] = l;
    }
    return map;
  }, []);

  const remapScene = useCallback(
    (sceneKey: string) => PART2_TRANSITION_TO_SCENE[sceneKey] || sceneKey,
    [],
  );

  const sceneGroups = useMemo(() => {
    const groups = new Map<string, { dialogue: Array<[string, Part2ScriptLine]>; bridges: Array<[string, Part2ScriptLine]> }>();
    for (const sceneKey of SCENE_ORDER) {
      groups.set(sceneKey, { dialogue: [], bridges: [] });
    }
    for (const [key, line] of Object.entries(allLines)) {
      const parent = remapScene(line.scene);
      if (!groups.has(parent)) continue;
      const isBridge = key.startsWith('p2-bridge-');
      groups.get(parent)![isBridge ? 'bridges' : 'dialogue'].push([key, line]);
    }
    return groups;
  }, [allLines, remapScene]);

  // ─── TTS generation per-line ──────────────────────────────────────────────

  const generateLine = useCallback(async (key: string, line: Part2ScriptLine) => {
    setStatusMap(s => ({ ...s, [key]: 'generating' }));
    try {
      const voiceCfg = resolvePart2VoiceWithFallback(line.voice as keyof typeof EP04_PART2_VOICES);
      const { data, error } = await supabase.functions.invoke('multi-provider-tts', {
        body: {
          text: line.text,
          provider: voiceCfg.provider,
          voiceId: voiceCfg.voiceId,
          stability: 'stability' in voiceCfg ? (voiceCfg as any).stability : undefined,
          similarityBoost: 'similarityBoost' in voiceCfg ? (voiceCfg as any).similarityBoost : undefined,
          rate: 'rate' in voiceCfg ? (voiceCfg as any).rate : undefined,
          pitch: 'pitch' in voiceCfg ? (voiceCfg as any).pitch : undefined,
          projectId,
          lineKey: key,
        },
      });
      if (error) throw error;
      if (!data?.audioUrl && !data?.audio) throw new Error('No audio returned from TTS');
      const audioUrl: string = data.audioUrl
        || (data.audio ? `data:audio/mpeg;base64,${data.audio}` : '');
      setAudioMap(m => ({ ...m, [key]: { audioUrl, provider: voiceCfg.provider, voice: line.voice } }));
      setStatusMap(s => ({ ...s, [key]: 'done' }));
    } catch (err: any) {
      console.error('[EP04Part2] TTS failed for', key, err);
      toast.error(`TTS failed for ${key}: ${err?.message || 'Unknown error'}`);
      setStatusMap(s => ({ ...s, [key]: 'error' }));
    }
  }, [projectId]);

  const playLine = useCallback((key: string) => {
    const audio = audioMap[key];
    if (!audio) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const el = new Audio(audio.audioUrl);
    audioRef.current = el;
    setPlayingKey(key);
    el.onended = () => setPlayingKey(null);
    el.onerror = () => { setPlayingKey(null); toast.error('Playback failed'); };
    el.play().catch(e => { setPlayingKey(null); toast.error(e?.message || 'Playback blocked'); });
  }, [audioMap]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingKey(null);
  }, []);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  // ─── Scene-level "generate all" ───────────────────────────────────────────

  const generateAllInScene = useCallback(async (sceneKey: string) => {
    const grp = sceneGroups.get(sceneKey);
    if (!grp) return;
    const lines = [...grp.dialogue, ...grp.bridges];
    toast.info(`Generating ${lines.length} lines for ${EP04_PART2_SCENE_TITLES[sceneKey]}...`);
    for (const [k, l] of lines) {
      if (statusMap[k] === 'done') continue;
      // sequential to avoid hammering the edge function
      // eslint-disable-next-line no-await-in-loop
      await generateLine(k, l);
    }
    toast.success(`Scene complete: ${EP04_PART2_SCENE_TITLES[sceneKey]}`);
  }, [sceneGroups, statusMap, generateLine]);

  // ─── Render helpers ───────────────────────────────────────────────────────

  const renderLine = (key: string, line: Part2ScriptLine, isBridge = false) => {
    const status = statusMap[key] || 'idle';
    const audio = audioMap[key];
    const voiceClass = EP04_PART2_VOICE_BADGE_CLASSES[line.voice] || 'bg-muted text-foreground border-border';
    const isPlaying = playingKey === key;

    const avatarSrc = AVATAR_MAP[line.voice];

    return (
      <div
        key={key}
        className={cn(
          'rounded-lg border p-3 transition-colors flex gap-3',
          isBridge ? 'bg-muted/30 border-dashed' : 'bg-card',
        )}
      >
        {/* Character avatar (config-driven via AVATAR_MAP) */}
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={`${line.voice} character avatar`}
            loading="lazy"
            width={48}
            height={48}
            className={cn(
              'h-12 w-12 rounded-full object-cover flex-shrink-0 border-2 ring-2 ring-background',
              isBridge ? 'border-violet-500/40' : 'border-border',
            )}
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-mono text-muted-foreground">
            {line.voice.slice(0, 2)}
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn('font-mono text-[10px]', voiceClass)}>
                {line.voice}
              </Badge>
              {isBridge && (
                <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 border-violet-500/30">
                  bridge · {line.scene}
                </Badge>
              )}
              <span className="font-mono text-[10px] text-muted-foreground">{key}</span>
              {line.duration_est && (
                <span className="text-[10px] text-muted-foreground">~{line.duration_est}s</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {status === 'generating' && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              {status === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              {status === 'error' && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                disabled={status === 'generating'}
                onClick={() => generateLine(key, line)}
              >
                <Mic className="h-3.5 w-3.5 mr-1" />
                {status === 'done' ? 'Regen' : 'Gen'}
              </Button>
              {audio && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={() => isPlaying ? stopPlayback() : playLine(key)}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
              )}
            </div>
          </div>
          <p className={cn('text-sm leading-relaxed', isBridge && 'italic text-muted-foreground')}>
            {line.text}
          </p>
          {line.direction && (
            <p className="text-[11px] text-muted-foreground border-l-2 border-muted pl-2">
              <span className="font-semibold">Direction:</span> {line.direction}
            </p>
          )}
        </div>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const totalLines = Object.keys(allLines).length;
  const doneCount = Object.values(statusMap).filter(s => s === 'done').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/genie-cast')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Cast
            </Button>
            <div>
              <p className="text-[10px] text-primary font-semibold uppercase tracking-[0.2em] leading-tight">Beyond AI Hype — Episode 2 · Part 2</p>
              <h1 className="text-lg font-bold leading-tight">Two AI Developers. One Human PO. The Production.</h1>
              <p className="text-xs text-muted-foreground">
                Continuation of Part 1 · 16 scenes · 9 voices · {totalLines} lines · ~30 min
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Volume2 className="h-3.5 w-3.5" />
            {doneCount}/{totalLines} ready
          </div>
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-65px)]">
        <div className="container mx-auto py-6 space-y-8 max-w-5xl">

          {/* Bookend: opening */}
          {EP04_PART2_STORYBOOK_BOOKENDS?.opening && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="py-4">
                <p className="text-xs uppercase tracking-wider text-amber-600 mb-1">Storybook Opening</p>
                <p className="text-sm text-muted-foreground">
                  {(EP04_PART2_STORYBOOK_BOOKENDS.opening as readonly any[]).length} animated steps · pre-roll bookend
                </p>
              </CardContent>
            </Card>
          )}

          {/* Scenes */}
          {SCENE_ORDER.map((sceneKey, idx) => {
            const grp = sceneGroups.get(sceneKey);
            if (!grp) return null;
            const trans = EP04_PART2_TRANSITIONS?.find((t: any) => t.from === sceneKey);
            const bgSrc = SCENE_BG_MAP[sceneKey];
            const transBgSrc = TRANSITION_BG_MAP[sceneKey];
            const interactions = EP04_PART2_CHARACTER_INTERACTIONS.find(i => i.sceneId === sceneKey);
            const scrolls = EP04_PART2_NARRATOR_SCROLLS.find(s => s.sceneId === sceneKey);

            // Group dialogue by character (Pixar cast roster for this scene)
            const dialogueByChar = new Map<string, Array<[string, Part2ScriptLine]>>();
            for (const [k, l] of grp.dialogue) {
              if (!dialogueByChar.has(l.voice)) dialogueByChar.set(l.voice, []);
              dialogueByChar.get(l.voice)!.push([k, l]);
            }
            const castRoster = Array.from(dialogueByChar.keys());

            const sceneStatus = (() => {
              const all = [...grp.dialogue, ...grp.bridges];
              if (all.length === 0) return { done: 0, total: 0 };
              const done = all.filter(([k]) => statusMap[k] === 'done').length;
              return { done, total: all.length };
            })();

            return (
              <section key={sceneKey} className="space-y-4 rounded-2xl border border-border/60 bg-card/30 p-3 md:p-4 shadow-sm">
                {/* ═══ 1. SCENE HERO — Pixar still + title + scene controls ═══ */}
                {bgSrc && (
                  <div className="relative overflow-hidden rounded-xl border border-border shadow-md">
                    <img
                      src={bgSrc}
                      alt={`${EP04_PART2_SCENE_TITLES[sceneKey]} — Pixar scene still`}
                      loading="lazy"
                      className="w-full h-52 md:h-72 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge variant="outline" className="font-mono bg-background/80 backdrop-blur">
                        Scene #{idx}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur">
                        {sceneStatus.done}/{sceneStatus.total} ready
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-3 flex-wrap">
                      <div className="space-y-1 max-w-[70%]">
                        <h2 className="text-base md:text-xl font-bold drop-shadow leading-tight">
                          {EP04_PART2_SCENE_TITLES[sceneKey]}
                        </h2>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px]">
                            {grp.dialogue.length} lines
                          </Badge>
                          {grp.bridges.length > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-violet-500/20 text-violet-100 border-violet-400/40">
                              {grp.bridges.length} bridge
                            </Badge>
                          )}
                          {castRoster.length > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur">
                              {castRoster.length} character{castRoster.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-background/90 text-foreground hover:bg-background backdrop-blur shadow-lg"
                        onClick={() => generateAllInScene(sceneKey)}
                      >
                        <Mic className="h-3.5 w-3.5 mr-1.5" />
                        Generate scene
                      </Button>
                    </div>
                  </div>
                )}

                {/* ═══ 2. CAST ROSTER — character avatars in this scene ═══ */}
                {castRoster.length > 0 && (
                  <div className="flex items-center gap-2 px-1 overflow-x-auto pb-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex-shrink-0">
                      Cast:
                    </span>
                    {castRoster.map(voice => {
                      const src = AVATAR_MAP[voice];
                      const cls = EP04_PART2_VOICE_BADGE_CLASSES[voice] || 'bg-muted border-border';
                      const lineCount = dialogueByChar.get(voice)?.length ?? 0;
                      return (
                        <div key={voice} className="flex items-center gap-1.5 flex-shrink-0 rounded-full border border-border bg-background/60 pl-1 pr-2.5 py-1">
                          {src ? (
                            <img src={src} alt={`${voice} avatar`} loading="lazy" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-mono">
                              {voice.slice(0, 2)}
                            </div>
                          )}
                          <Badge variant="outline" className={cn('font-mono text-[10px] border-0 px-1', cls)}>
                            {voice}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">{lineCount}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ═══ 3. NARRATOR SCROLL — parchment data reveal ═══ */}
                {scrolls && scrolls.steps.length > 0 && (
                  <div className="rounded-md border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-3 space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-amber-600 font-semibold">
                      📜 Narrator Scroll · {scrolls.steps.length} reveal{scrolls.steps.length > 1 ? 's' : ''}
                    </p>
                    {scrolls.steps.map((s: any, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground italic">
                        {s.prompt}
                        {s.duration && <span className="ml-2 font-mono not-italic">~{s.duration}s</span>}
                      </p>
                    ))}
                  </div>
                )}

                {/* ═══ 4. DIALOGUE — grouped by character ═══ */}
                {castRoster.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
                      🎙️ Dialogue · grouped by character
                    </p>
                    {castRoster.map(voice => {
                      const lines = dialogueByChar.get(voice) ?? [];
                      const src = AVATAR_MAP[voice];
                      const cls = EP04_PART2_VOICE_BADGE_CLASSES[voice] || 'bg-muted border-border';
                      return (
                        <div key={voice} className="rounded-lg border border-border/60 bg-background/40 overflow-hidden">
                          <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/60">
                            {src && (
                              <img src={src} alt={`${voice} avatar`} loading="lazy" width={28} height={28} className="h-7 w-7 rounded-full object-cover ring-2 ring-background" />
                            )}
                            <Badge variant="outline" className={cn('font-mono text-[10px]', cls)}>
                              {voice}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-mono">{lines.length} line{lines.length > 1 ? 's' : ''}</span>
                          </div>
                          <div className="p-2 space-y-2">
                            {lines.map(([k, l]) => renderLine(k, l, false))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ═══ 5. CHARACTER INTERACTION — Pixar group/duo shot ═══ */}
                {interactions && interactions.steps.length > 0 && (
                  <div className="rounded-md border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 p-3 space-y-2">
                    <p className="text-[11px] uppercase tracking-wider text-cyan-600 font-semibold">
                      🎭 Character Interaction · {interactions.steps.length} shot{interactions.steps.length > 1 ? 's' : ''}
                    </p>
                    {interactions.steps.map((s: any, i: number) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {(s.characters || []).map((c: string) => {
                            const src = AVATAR_MAP[c];
                            return (
                              <div key={c} className="flex items-center gap-1 rounded-full bg-background/60 border border-border pl-0.5 pr-2 py-0.5">
                                {src && (
                                  <img src={src} alt={`${c} avatar`} loading="lazy" width={18} height={18} className="h-[18px] w-[18px] rounded-full object-cover" />
                                )}
                                <span className="text-[10px] font-mono">{c}</span>
                              </div>
                            );
                          })}
                          {s.style && (
                            <Badge variant="secondary" className="text-[10px]">{s.style}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{s.prompt}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ═══ 6. BRIDGES — narrator scene-bridge dialogue ═══ */}
                {grp.bridges.length > 0 && (
                  <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 overflow-hidden">
                    <div className="px-3 py-2 bg-violet-500/10 border-b border-violet-500/20">
                      <p className="text-[11px] uppercase tracking-wider text-violet-600 font-semibold">
                        🌉 Scene Bridges · {grp.bridges.length}
                      </p>
                    </div>
                    <div className="p-2 space-y-2">
                      {grp.bridges.map(([k, l]) => renderLine(k, l, true))}
                    </div>
                  </div>
                )}

                {/* ═══ 7. TRANSITION → next scene ═══ */}
                {trans && idx < SCENE_ORDER.length - 1 && (
                  <div className="rounded-md overflow-hidden border border-violet-500/20 bg-violet-500/5">
                    {transBgSrc && (
                      <img
                        src={transBgSrc}
                        alt={`Transition still → ${EP04_PART2_SCENE_TITLES[(trans as any).to] || (trans as any).to}`}
                        loading="lazy"
                        className="w-full h-32 md:h-40 object-cover"
                      />
                    )}
                    <div className="p-3">
                      <p className="text-[11px] uppercase tracking-wider text-violet-600 mb-1 font-semibold">
                        ➡️ Transition → {EP04_PART2_SCENE_TITLES[(trans as any).to] || (trans as any).to}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Style: <span className="font-mono">{(trans as any).style || 'dissolve'}</span>
                        {(trans as any).steps && ` · ${(trans as any).steps.length} step(s)`}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            );
          })}

          {/* Bookend: closing */}
          {EP04_PART2_STORYBOOK_BOOKENDS?.closing && (
            <Card className="border-violet-500/30 bg-violet-500/5">
              <CardContent className="py-4">
                <p className="text-xs uppercase tracking-wider text-violet-600 mb-1">Storybook Closing</p>
                <p className="text-sm text-muted-foreground">
                  {(EP04_PART2_STORYBOOK_BOOKENDS.closing as readonly any[]).length} animated steps · the end... for now
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
