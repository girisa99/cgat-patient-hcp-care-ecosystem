/**
 * StoryOverview — Read-only "ep04-style" complete production map.
 *
 * For every scene, shows:
 *   - The script lines with which character speaks each one
 *   - The visual prompts that will be sent to image/video/avatar generators
 *   - The scene-out transition style + prompt
 *
 * This gives parity with EP04Production.tsx's "everything-in-one-view" feel,
 * but data-driven from cast_project_scenes.scene_config.pipeline.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Film, Image as ImageIcon, Mic, MessageSquare, Sparkles, Users, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface PipelineStep {
  type?: string;
  prompt?: string;
  model?: string;
  provider?: string;
  style?: string;
  variant?: string;
  duration?: number;
  character?: string;
  characters?: string[];
  voice?: string;
  scriptKey?: string;
  text?: string;
}

const VISUAL_STEP_TYPES = new Set([
  'alibaba-image', 'alibaba-video', 'gemini-image', 'gemini-video', 'flux-image',
  'avatar-3d', 'avatar-lipsync', 'character-interaction', 'character-motion',
  'storybook-frame', 'narrator-scroll', 'kinetic-text',
]);

const TRANSITION_STEP_TYPES = new Set(['scene-transition', 'transition']);

function stepIcon(type?: string) {
  if (!type) return <Sparkles className="h-3.5 w-3.5" />;
  if (type.includes('video') || type.includes('motion') || type.includes('lipsync')) return <Film className="h-3.5 w-3.5" />;
  if (type.includes('image') || type.includes('avatar') || type.includes('storybook') || type.includes('scroll')) return <ImageIcon className="h-3.5 w-3.5" />;
  if (type === 'tts') return <Mic className="h-3.5 w-3.5" />;
  if (type.includes('interaction')) return <Users className="h-3.5 w-3.5" />;
  return <Sparkles className="h-3.5 w-3.5" />;
}

interface Props {
  scenes: StoryOverviewScene[];
  scriptLineData: StoryOverviewLine[];
  characters: StoryOverviewCharacter[];
}

export function StoryOverview({ scenes, scriptLineData, characters }: Props) {
  if (scenes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No scenes yet — seed the project from a template first.
        </CardContent>
      </Card>
    );
  }

  const charByKey: Record<string, StoryOverviewCharacter> = {};
  for (const c of characters) charByKey[c.character_key] = c;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold">Story Map</h2>
            <p className="text-xs text-muted-foreground">
              Complete script + visual prompts + transitions for all {scenes.length} scenes
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

              const visualSteps = pipeline.filter(s => s.type && VISUAL_STEP_TYPES.has(s.type));
              const transitionStep = pipeline.find(s => s.type && TRANSITION_STEP_TYPES.has(s.type));

              return (
                <div key={scene.scene_key}>
                  <div className="border rounded-lg overflow-hidden bg-card">
                    {/* Scene header */}
                    <div className="bg-gradient-to-r from-primary/10 to-transparent px-4 py-2.5 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {String(idx + 1).padStart(2, '0')}
                        </Badge>
                        <h3 className="text-sm font-semibold">{scene.title}</h3>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{scene.scene_key}</span>
                    </div>

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
                            return (
                              <div key={line.key} className="flex gap-2 items-start text-xs">
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
                                  <p className="leading-snug">{line.text || <span className="italic text-muted-foreground">(visual cue)</span>}</p>
                                  {line.direction && (
                                    <p className="text-[10px] text-muted-foreground italic mt-0.5">{line.direction}</p>
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground shrink-0">{line.durationEst}s</span>
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
                          visualSteps.map((step, i) => (
                            <div key={i} className="flex gap-2 items-start text-xs">
                              <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
                                {stepIcon(step.type)}
                                {step.type}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="leading-snug text-muted-foreground">
                                  {step.prompt || (step.character ? `Character: ${step.character}` : null) || (step.characters ? `Characters: ${step.characters.join(' + ')}` : null) || step.text || '(no prompt)'}
                                </p>
                                {(step.model || step.provider || step.style) && (
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {step.model && <Badge variant="secondary" className="text-[9px] py-0 px-1.5">model: {step.model}</Badge>}
                                    {step.provider && <Badge variant="secondary" className="text-[9px] py-0 px-1.5">via: {step.provider}</Badge>}
                                    {step.style && <Badge variant="secondary" className="text-[9px] py-0 px-1.5">style: {step.style}</Badge>}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transition between scenes */}
                  {idx < scenes.length - 1 && (
                    <div className="flex items-center gap-2 my-2 px-2 text-[11px] text-muted-foreground">
                      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      {transitionStep ? (
                        <>
                          <Badge variant="outline" className="text-[10px]">
                            transition · {transitionStep.style || 'cut'}
                          </Badge>
                          <span className="italic line-clamp-1">{transitionStep.prompt || `Hard cut to next scene`}</span>
                          {transitionStep.duration && (
                            <span className="ml-auto text-[10px]">{transitionStep.duration}s</span>
                          )}
                        </>
                      ) : (
                        <span className="italic">Hard cut to next scene</span>
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
  );
}
