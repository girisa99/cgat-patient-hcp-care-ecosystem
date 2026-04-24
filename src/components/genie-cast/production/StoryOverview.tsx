/**
 * StoryOverview — Interactive "ep04-style" complete production map.
 *
 * For every scene, shows:
 *   - Script lines with character + inline AI editing
 *   - Visual prompts with inline AI editing + thumbnail previews
 *   - Scene-out transition with inline AI editing
 *   - Per-scene action bar: Edit (drawer), Generate TTS, Generate Visuals, Generate All
 *
 * All persistence and generation is delegated to callbacks the parent provides.
 * Fully data-driven — no hardcoded step/voice/character lists.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Film, Image as ImageIcon, Mic, MessageSquare, Sparkles, Users,
  ArrowDown, Pencil, Play, Loader2, Settings2, Wand2, Maximize2,
} from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PromptEditor, type PromptTarget, type PromptEditorContext } from './PromptEditor';

// ─── Public types ─────────────────────────────────────────────────────

export interface StoryOverviewScene {
  scene_key: string;
  title: string;
  scene_index: number;
  scene_config: Record<string, unknown> | null;
}

export interface StoryOverviewLine {
  key: string;
  text: string;
  characterKey: string;
  sceneKey: string;
  durationEst: number;
  direction?: string;
}

export interface StoryOverviewCharacter {
  character_key: string;
  display_name: string;
  color_class?: string | null;
  voice_provider?: string;
}

/** Generated assets the parent has available, keyed for preview */
export interface StoryOverviewPreviews {
  /** scriptLineKey → audio URL */
  audioByLineKey?: Record<string, string>;
  /** sceneKey → array of { url, label } for image/video assets */
  visualsBySceneKey?: Record<string, Array<{ url: string; label: string; kind: 'image' | 'video' }>>;
}

/** Loading flags so the action buttons can show spinners */
export interface StoryOverviewBusy {
  ttsBySceneKey?: Record<string, boolean>;
  visualsBySceneKey?: Record<string, boolean>;
}

interface Props {
  scenes: StoryOverviewScene[];
  scriptLineData: StoryOverviewLine[];
  characters: StoryOverviewCharacter[];

  /** Default BCP-47 language for Localize action */
  defaultLanguage?: string;
  /** Optional global context fed to the AI (style/industry/audience) */
  promptContext?: PromptEditorContext;

  /** Generated assets (TTS + visuals) for inline previews */
  previews?: StoryOverviewPreviews;
  /** Per-scene busy flags for buttons */
  busy?: StoryOverviewBusy;

  // ─── Persistence callbacks (parent owns DB writes) ─────────────
  /** Save an edited script line */
  onUpdateLine?: (lineKey: string, newText: string) => Promise<void> | void;
  /** Save an edited visual prompt: parent persists to scene_config.pipeline[stepIndex].prompt */
  onUpdateStepPrompt?: (sceneKey: string, stepIndex: number, newPrompt: string) => Promise<void> | void;
  /** Save an edited transition prompt */
  onUpdateTransitionPrompt?: (sceneKey: string, stepIndex: number, newPrompt: string) => Promise<void> | void;

  // ─── Generation callbacks (parent owns hooks) ──────────────────
  onGenerateSceneTts?: (sceneKey: string) => Promise<void> | void;
  onGenerateSceneVisuals?: (sceneKey: string) => Promise<void> | void;
  onGenerateSceneAll?: (sceneKey: string) => Promise<void> | void;
}

// ─── Pipeline categorization (data-driven, no allow-lists) ─────────────

type PipelineStep = Record<string, unknown> & {
  type?: string;
  prompt?: string;
  duration?: number;
};

function isTtsStep(step: PipelineStep): boolean {
  return typeof step.type === 'string' && step.type.toLowerCase() === 'tts';
}
function isTransitionStep(step: PipelineStep): boolean {
  return typeof step.type === 'string' && /transition/i.test(step.type);
}
function isVisualStep(step: PipelineStep): boolean {
  if (!step.type) return false;
  if (isTtsStep(step) || isTransitionStep(step)) return false;
  return Boolean(step.prompt || step['character'] || step['characters'] || step['text']);
}

const ICON_KEYWORDS: Array<{ match: RegExp; icon: React.ReactNode }> = [
  { match: /tts|voice|narrat/i, icon: <Mic className="h-3.5 w-3.5" /> },
  { match: /video|motion|lipsync|cinematic/i, icon: <Film className="h-3.5 w-3.5" /> },
  { match: /image|avatar|storybook|scroll|frame|illustration/i, icon: <ImageIcon className="h-3.5 w-3.5" /> },
  { match: /interaction|character/i, icon: <Users className="h-3.5 w-3.5" /> },
];
function stepIcon(type?: string): React.ReactNode {
  if (!type) return <Sparkles className="h-3.5 w-3.5" />;
  for (const { match, icon } of ICON_KEYWORDS) if (match.test(type)) return icon;
  return <Sparkles className="h-3.5 w-3.5" />;
}
function readStr(step: PipelineStep, key: string): string | undefined {
  const v = step[key];
  return typeof v === 'string' ? v : undefined;
}

// ─── Main component ───────────────────────────────────────────────────

export function StoryOverview({
  scenes,
  scriptLineData,
  characters,
  defaultLanguage = 'en',
  promptContext,
  previews,
  busy,
  onUpdateLine,
  onUpdateStepPrompt,
  onUpdateTransitionPrompt,
  onGenerateSceneTts,
  onGenerateSceneVisuals,
  onGenerateSceneAll,
}: Props) {
  // Track which item is currently being edited inline ("kind:sceneKey:index")
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerSceneKey, setDrawerSceneKey] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<{ url: string; kind: 'image' | 'video' } | null>(null);

  const charByKey = useMemo(() => {
    const m: Record<string, StoryOverviewCharacter> = {};
    for (const c of characters) m[c.character_key] = c;
    return m;
  }, [characters]);

  if (scenes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No scenes yet — seed the project from a template first.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold">Story Map</h2>
              <p className="text-xs text-muted-foreground">
                Edit any prompt with AI · generate per scene · preview as you go · {scenes.length} scenes
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Mic className="h-3 w-3" /> Dialogue</span>
              <span className="inline-flex items-center gap-1"><Film className="h-3 w-3" /> Visual</span>
              <span className="inline-flex items-center gap-1"><ArrowDown className="h-3 w-3" /> Transition</span>
            </div>
          </div>

          <ScrollArea className="h-[700px] pr-3">
            <div className="space-y-4">
              {scenes.map((scene, idx) => {
                const sceneLines = scriptLineData.filter(l => l.sceneKey === scene.scene_key);
                const pipeline = (scene.scene_config?.pipeline as PipelineStep[] | undefined) || [];

                // Pair pipeline steps with their original index (so persistence updates the right slot)
                const indexedSteps = pipeline.map((step, i) => ({ step, originalIndex: i }));
                const visualSteps = indexedSteps.filter(s => isVisualStep(s.step));
                const transitionSlot = indexedSteps.find(s => isTransitionStep(s.step));

                const sceneVisualPreviews = previews?.visualsBySceneKey?.[scene.scene_key] || [];
                const ttsBusy = busy?.ttsBySceneKey?.[scene.scene_key];
                const visualBusy = busy?.visualsBySceneKey?.[scene.scene_key];
                const anyBusy = ttsBusy || visualBusy;

                return (
                  <div key={scene.scene_key}>
                    <div className="border rounded-lg overflow-hidden bg-card">
                      {/* Scene header with action bar */}
                      <div className="bg-gradient-to-r from-primary/10 to-transparent px-4 py-2.5 border-b flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </Badge>
                          <h3 className="text-sm font-semibold truncate">{scene.title}</h3>
                          <span className="text-[10px] text-muted-foreground font-mono truncate">{scene.scene_key}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {onGenerateSceneTts && (
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-[11px] gap-1"
                              disabled={anyBusy || sceneLines.length === 0}
                              onClick={() => onGenerateSceneTts(scene.scene_key)}
                            >
                              {ttsBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3 w-3" />}
                              TTS
                            </Button>
                          )}
                          {onGenerateSceneVisuals && (
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-[11px] gap-1"
                              disabled={anyBusy || visualSteps.length === 0}
                              onClick={() => onGenerateSceneVisuals(scene.scene_key)}
                            >
                              {visualBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Film className="h-3 w-3" />}
                              Visuals
                            </Button>
                          )}
                          {onGenerateSceneAll && (
                            <Button
                              size="sm"
                              className="h-7 text-[11px] gap-1"
                              disabled={anyBusy}
                              onClick={() => onGenerateSceneAll(scene.scene_key)}
                            >
                              {anyBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                              All
                            </Button>
                          )}
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => setDrawerSceneKey(scene.scene_key)}
                            title="Open full scene editor"
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Two-column layout: script | visual prompts */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
                        {/* LEFT: Script lines */}
                        <div className="p-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            <MessageSquare className="h-3 w-3" />
                            Script ({sceneLines.length} {sceneLines.length === 1 ? 'line' : 'lines'})
                          </div>
                          {sceneLines.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground italic">No dialogue — visual-only scene</p>
                          ) : (
                            sceneLines.map(line => {
                              const char = charByKey[line.characterKey];
                              const editId = `line:${line.key}`;
                              const isEditing = editingId === editId;
                              const audioUrl = previews?.audioByLineKey?.[line.key];

                              return (
                                <div key={line.key} className="text-xs">
                                  {!isEditing ? (
                                    <div className="flex gap-2 items-start group">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'text-[10px] shrink-0 min-w-[70px] justify-center',
                                          char?.color_class,
                                        )}
                                      >
                                        {char?.display_name || line.characterKey}
                                      </Badge>
                                      <div className="flex-1 min-w-0">
                                        <p className="leading-snug">
                                          {line.text || <span className="italic text-muted-foreground">(visual cue)</span>}
                                        </p>
                                        {line.direction && (
                                          <p className="text-[10px] text-muted-foreground italic mt-0.5">{line.direction}</p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-0.5 shrink-0">
                                        {audioUrl && (
                                          <button
                                            type="button"
                                            className="p-1 rounded hover:bg-accent text-primary"
                                            onClick={() => new Audio(audioUrl).play().catch(() => {})}
                                            title="Play TTS"
                                          >
                                            <Play className="h-3 w-3" />
                                          </button>
                                        )}
                                        <span className="text-[10px] text-muted-foreground">{line.durationEst}s</span>
                                        {onUpdateLine && (
                                          <button
                                            type="button"
                                            className="p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setEditingId(editId)}
                                            title="Edit with AI"
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="border rounded p-2 bg-muted/30">
                                      <PromptEditor
                                        initialText={line.text}
                                        target="script_line"
                                        defaultLanguage={defaultLanguage}
                                        context={{
                                          ...promptContext,
                                          sceneTitle: scene.title,
                                          character: char?.display_name || line.characterKey,
                                        }}
                                        onSave={async (newText) => {
                                          if (onUpdateLine) await onUpdateLine(line.key, newText);
                                          setEditingId(null);
                                        }}
                                        onCancel={() => setEditingId(null)}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* RIGHT: Visual prompts */}
                        <div className="p-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                            <Film className="h-3 w-3" />
                            Visual Prompts ({visualSteps.length})
                          </div>
                          {visualSteps.length === 0 ? (
                            <p className="text-[11px] text-muted-foreground italic">No visual generation steps configured</p>
                          ) : (
                            visualSteps.map(({ step, originalIndex }) => {
                              const editId = `step:${scene.scene_key}:${originalIndex}`;
                              const isEditing = editingId === editId;
                              const character = readStr(step, 'character');
                              const charactersRaw = step['characters'];
                              const chars = Array.isArray(charactersRaw)
                                ? charactersRaw.filter((x): x is string => typeof x === 'string')
                                : null;
                              const model = readStr(step, 'model');
                              const provider = readStr(step, 'provider');
                              const style = readStr(step, 'style');
                              const promptText = step.prompt
                                || (character ? `Character: ${character}` : null)
                                || (chars && chars.length ? `Characters: ${chars.join(' + ')}` : null)
                                || readStr(step, 'text')
                                || '';

                              return (
                                <div key={originalIndex} className="text-xs">
                                  {!isEditing ? (
                                    <div className="flex gap-2 items-start group">
                                      <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
                                        {stepIcon(step.type)}
                                        {step.type}
                                      </Badge>
                                      <div className="flex-1 min-w-0">
                                        <p className="leading-snug text-muted-foreground">
                                          {promptText || <span className="italic">(no prompt)</span>}
                                        </p>
                                        {(model || provider || style) && (
                                          <div className="flex gap-1 mt-1 flex-wrap">
                                            {model && <Badge variant="secondary" className="text-[9px] py-0 px-1.5">model: {model}</Badge>}
                                            {provider && <Badge variant="secondary" className="text-[9px] py-0 px-1.5">via: {provider}</Badge>}
                                            {style && <Badge variant="secondary" className="text-[9px] py-0 px-1.5">style: {style}</Badge>}
                                          </div>
                                        )}
                                      </div>
                                      {onUpdateStepPrompt && step.prompt !== undefined && (
                                        <button
                                          type="button"
                                          className="p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                          onClick={() => setEditingId(editId)}
                                          title="Edit prompt with AI"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="border rounded p-2 bg-muted/30">
                                      <PromptEditor
                                        initialText={promptText}
                                        target="visual_prompt"
                                        defaultLanguage={defaultLanguage}
                                        context={{
                                          ...promptContext,
                                          sceneTitle: scene.title,
                                          style: style || promptContext?.style,
                                        }}
                                        onSave={async (newText) => {
                                          if (onUpdateStepPrompt) {
                                            await onUpdateStepPrompt(scene.scene_key, originalIndex, newText);
                                          }
                                          setEditingId(null);
                                        }}
                                        onCancel={() => setEditingId(null)}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}

                          {/* Generated thumbnails */}
                          {sceneVisualPreviews.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-border/40">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                Generated ({sceneVisualPreviews.length})
                              </p>
                              <div className="flex gap-1.5 flex-wrap">
                                {sceneVisualPreviews.map((p, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setPreviewUrl({ url: p.url, kind: p.kind })}
                                    className="relative w-14 h-14 rounded border overflow-hidden bg-muted hover:border-primary transition-colors group/thumb"
                                    title={p.label}
                                  >
                                    {p.kind === 'video' ? (
                                      <>
                                        <video src={p.url} className="w-full h-full object-cover" muted />
                                        <Film className="absolute bottom-0.5 right-0.5 h-3 w-3 text-white drop-shadow" />
                                      </>
                                    ) : (
                                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" loading="lazy" />
                                    )}
                                    <div className="absolute inset-0 bg-foreground/0 group-hover/thumb:bg-foreground/30 transition-colors flex items-center justify-center">
                                      <Maximize2 className="h-3 w-3 text-background opacity-0 group-hover/thumb:opacity-100" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Transition between scenes */}
                    {idx < scenes.length - 1 && (
                      <div className="flex items-center gap-2 my-2 px-2 text-[11px] text-muted-foreground group">
                        <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        {transitionSlot ? (() => {
                          const editId = `transition:${scene.scene_key}:${transitionSlot.originalIndex}`;
                          const isEditing = editingId === editId;
                          if (isEditing) {
                            return (
                              <div className="flex-1 border rounded p-2 bg-muted/30">
                                <PromptEditor
                                  initialText={transitionSlot.step.prompt || ''}
                                  target="transition_prompt"
                                  defaultLanguage={defaultLanguage}
                                  context={{ ...promptContext, sceneTitle: scene.title }}
                                  onSave={async (newText) => {
                                    if (onUpdateTransitionPrompt) {
                                      await onUpdateTransitionPrompt(scene.scene_key, transitionSlot.originalIndex, newText);
                                    }
                                    setEditingId(null);
                                  }}
                                  onCancel={() => setEditingId(null)}
                                />
                              </div>
                            );
                          }
                          return (
                            <>
                              <Badge variant="outline" className="text-[10px]">
                                {transitionSlot.step.type || 'transition'}
                                {readStr(transitionSlot.step, 'style') ? ` · ${readStr(transitionSlot.step, 'style')}` : ''}
                              </Badge>
                              {transitionSlot.step.prompt && (
                                <span className="italic line-clamp-1 flex-1">{transitionSlot.step.prompt}</span>
                              )}
                              {typeof transitionSlot.step.duration === 'number' && (
                                <span className="text-[10px]">{transitionSlot.step.duration}s</span>
                              )}
                              {onUpdateTransitionPrompt && (
                                <button
                                  type="button"
                                  className="p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                                  onClick={() => setEditingId(editId)}
                                  title="Edit transition with AI"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              )}
                            </>
                          );
                        })() : (
                          <span className="italic">Direct cut</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ─── Full-scene editor drawer ─────────────────────────────── */}
      <Sheet open={!!drawerSceneKey} onOpenChange={(open) => !open && setDrawerSceneKey(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {drawerSceneKey && (() => {
            const scene = scenes.find(s => s.scene_key === drawerSceneKey);
            if (!scene) return null;
            const sceneLines = scriptLineData.filter(l => l.sceneKey === scene.scene_key);
            const pipeline = (scene.scene_config?.pipeline as PipelineStep[] | undefined) || [];
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{scene.title}</SheetTitle>
                  <SheetDescription>
                    Full editing surface for scene <span className="font-mono">{scene.scene_key}</span>
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-4">
                  {/* Script */}
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Script ({sceneLines.length})
                    </h4>
                    <div className="space-y-3">
                      {sceneLines.map(line => {
                        const char = charByKey[line.characterKey];
                        return (
                          <div key={line.key} className="border rounded p-2">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge variant="outline" className={cn('text-[10px]', char?.color_class)}>
                                {char?.display_name || line.characterKey}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">{line.durationEst}s</span>
                            </div>
                            {onUpdateLine ? (
                              <PromptEditor
                                initialText={line.text}
                                target="script_line"
                                defaultLanguage={defaultLanguage}
                                context={{
                                  ...promptContext,
                                  sceneTitle: scene.title,
                                  character: char?.display_name || line.characterKey,
                                }}
                                onSave={(t) => onUpdateLine(line.key, t)}
                                onCancel={() => {}}
                                hideCancel
                              />
                            ) : (
                              <p className="text-xs">{line.text}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Pipeline steps */}
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Pipeline ({pipeline.length} steps)
                    </h4>
                    <div className="space-y-3">
                      {pipeline.map((step, i) => {
                        if (isTtsStep(step)) return null; // dialogue handled above
                        const isTrans = isTransitionStep(step);
                        const text = step.prompt || readStr(step, 'text') || '';
                        const handler = isTrans ? onUpdateTransitionPrompt : onUpdateStepPrompt;
                        return (
                          <div key={i} className="border rounded p-2">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Badge variant="outline" className="text-[10px] gap-1">
                                {stepIcon(step.type)}
                                {step.type}
                              </Badge>
                            </div>
                            {handler && step.prompt !== undefined ? (
                              <PromptEditor
                                initialText={text}
                                target={isTrans ? 'transition_prompt' : 'visual_prompt'}
                                defaultLanguage={defaultLanguage}
                                context={{ ...promptContext, sceneTitle: scene.title }}
                                onSave={(t) => handler(scene.scene_key, i, t)}
                                onCancel={() => {}}
                                hideCancel
                              />
                            ) : (
                              <p className="text-xs text-muted-foreground">{text || '(no editable prompt)'}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* ─── Full-size preview dialog ──────────────────────────── */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl p-2">
          {previewUrl && (
            previewUrl.kind === 'video' ? (
              <video src={previewUrl.url} controls autoPlay className="w-full max-h-[80vh] rounded" />
            ) : (
              <img src={previewUrl.url} alt="Preview" className="w-full max-h-[80vh] object-contain rounded" />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
