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

    return (
      <div
        key={key}
        className={cn(
          'rounded-lg border p-3 space-y-2 transition-colors',
          isBridge ? 'bg-muted/30 border-dashed' : 'bg-card',
        )}
      >
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
              <h1 className="text-lg font-bold leading-tight">EP04 Part 2 — The Production</h1>
              <p className="text-xs text-muted-foreground">
                16 scenes · 9 voices · {totalLines} lines · ~30 min
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

            return (
              <section key={sceneKey} className="space-y-3">
                <div className="flex items-center justify-between gap-3 sticky top-[65px] z-20 bg-background/95 backdrop-blur py-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">#{idx}</Badge>
                    <h2 className="text-base font-semibold">{EP04_PART2_SCENE_TITLES[sceneKey]}</h2>
                    <Badge variant="secondary" className="text-[10px]">
                      {grp.dialogue.length} lines
                      {grp.bridges.length > 0 && ` · ${grp.bridges.length} bridge`}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => generateAllInScene(sceneKey)}>
                    <Mic className="h-3.5 w-3.5 mr-1.5" />
                    Generate scene
                  </Button>
                </div>

                <div className="space-y-2 pl-2 border-l-2 border-muted">
                  {grp.dialogue.map(([k, l]) => renderLine(k, l, false))}
                  {grp.bridges.map(([k, l]) => renderLine(k, l, true))}
                </div>

                {trans && idx < SCENE_ORDER.length - 1 && (
                  <div className="ml-2 mt-2 p-3 rounded-md bg-violet-500/5 border border-violet-500/20">
                    <p className="text-[11px] uppercase tracking-wider text-violet-600 mb-1">
                      Transition → {EP04_PART2_SCENE_TITLES[(trans as any).to] || (trans as any).to}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Style: <span className="font-mono">{(trans as any).style || 'dissolve'}</span>
                      {(trans as any).steps && ` · ${(trans as any).steps.length} step(s)`}
                    </p>
                  </div>
                )}

                {idx < SCENE_ORDER.length - 1 && <Separator className="mt-4" />}
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
