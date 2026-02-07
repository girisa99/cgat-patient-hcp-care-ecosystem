/**
 * Blueprint Preview Modal - Scene Timeline Tab
 * Interactive scene editing: add/remove, reorder, duration adjustment
 */

import React, { useState } from 'react';
import {
  ChevronRight,
  Sparkles,
  Layers,
  Target,
  CheckCircle2,
  Video,
  FileText,
  Plus,
  Trash2,
  GripVertical,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { BlueprintScene } from '@/hooks/useVideoBlueprints';
import { AISceneCustomizer } from './AISceneCustomizer';
import { TranslationTranscreationToggle } from '../TranslationTranscreationToggle';

interface SceneTimelineTabProps {
  scenes: BlueprintScene[];
  expandedScene: string | null;
  onExpandScene: (sceneId: string | null) => void;
  formatDuration: (seconds: number) => string;
  isEditable?: boolean;
  onScenesModified?: (scenes: BlueprintScene[], description: string) => void;
  /** Language code for AI routing context */
  language?: string;
  /** Regional zone for provider routing */
  region?: string;
  /** Show transcreation toggle in scene timeline */
  showTranscreation?: boolean;
}

const sceneTypeColors: Record<string, string> = {
  intro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  content: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  feature: 'bg-green-500/20 text-green-400 border-green-500/30',
  demo: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  testimonial: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  cta: 'bg-primary/20 text-primary border-primary/30',
  outro: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const sceneTypeIcons: Record<string, React.ReactNode> = {
  intro: <Sparkles className="h-3 w-3" />,
  content: <FileText className="h-3 w-3" />,
  feature: <Layers className="h-3 w-3" />,
  demo: <Video className="h-3 w-3" />,
  testimonial: <Target className="h-3 w-3" />,
  cta: <ChevronRight className="h-3 w-3" />,
  outro: <CheckCircle2 className="h-3 w-3" />,
};

const SCENE_TYPE_OPTIONS = [
  { value: 'intro', label: 'Introduction' },
  { value: 'content', label: 'Content' },
  { value: 'feature', label: 'Feature Highlight' },
  { value: 'demo', label: 'Demo / Walkthrough' },
  { value: 'testimonial', label: 'Testimonial / Proof' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'outro', label: 'Outro / Closing' },
];

export function SceneTimelineTab({
  scenes,
  expandedScene,
  onExpandScene,
  formatDuration,
  isEditable = true,
  onScenesModified,
  language = 'en',
  region = 'global',
  showTranscreation = false,
}: SceneTimelineTabProps) {
  const [durationOverrides, setDurationOverrides] = useState<Record<string, number>>({});

  const getEffectiveDuration = (scene: BlueprintScene) => {
    return durationOverrides[scene.id] ?? scene.duration_seconds;
  };

  const totalDuration = scenes.reduce((sum, s) => sum + getEffectiveDuration(s), 0);

  return (
    <div className="p-6 space-y-4">
      {/* Timeline Summary Bar */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 border border-border/50">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Total: {formatDuration(totalDuration)}</span>
          <span className="text-xs text-muted-foreground">({scenes.length} scenes)</span>
        </div>
        {isEditable && (
          <Badge variant="outline" className="text-[10px]">
            Drag to reorder • Adjust duration with slider
          </Badge>
        )}
      </div>

      {/* Scene List */}
      <div className="space-y-3">
        {scenes.map((scene, index) => {
          const effectiveDuration = getEffectiveDuration(scene);
          const isExpanded = expandedScene === scene.id;
          
          return (
            <div
              key={scene.id}
              className={cn(
                "border rounded-lg overflow-hidden transition-all",
                isExpanded ? "border-primary/50 shadow-sm" : "border-border/50"
              )}
            >
              {/* Scene Header */}
              <div
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors",
                  sceneTypeColors[scene.scene_type] || sceneTypeColors.content
                )}
                onClick={() => onExpandScene(isExpanded ? null : scene.id)}
              >
                <div className="flex items-center gap-3">
                  {isEditable && (
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                  )}
                  <div className="w-8 h-8 rounded-full bg-background/50 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {sceneTypeIcons[scene.scene_type]}
                      <span className="font-medium">{scene.title}</span>
                      {scene.is_optional && (
                        <Badge variant="outline" className="text-[10px] h-4">Optional</Badge>
                      )}
                      {scene.is_repeatable && (
                        <Badge variant="outline" className="text-[10px] h-4 border-primary/30 text-primary">Repeatable</Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-70 capitalize">{scene.scene_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-medium">{formatDuration(effectiveDuration)}</span>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDuration(scene.min_duration_seconds)} – {formatDuration(scene.max_duration_seconds)}
                    </p>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                </div>
              </div>

              {/* Expanded Scene Details */}
              {isExpanded && (
                <div className="p-4 bg-card/50 border-t border-border/50 space-y-4">
                  {/* Duration Slider */}
                  {isEditable && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">
                          Duration: {formatDuration(effectiveDuration)}
                        </label>
                        <span className="text-[10px] text-muted-foreground">
                          Min {formatDuration(scene.min_duration_seconds)} • Max {formatDuration(scene.max_duration_seconds)}
                        </span>
                      </div>
                      <Slider
                        value={[effectiveDuration]}
                        min={scene.min_duration_seconds}
                        max={scene.max_duration_seconds}
                        step={5}
                        onValueChange={([val]) => {
                          setDurationOverrides(prev => ({ ...prev, [scene.id]: val }));
                        }}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Script Template */}
                  {scene.script_template && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Script Template</h4>
                      <p className="text-sm bg-background/50 p-3 rounded-md font-mono text-muted-foreground">
                        {scene.script_template}
                      </p>
                    </div>
                  )}

                  {/* Scene Details Grid */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Scene Type</span>
                      <span className="capitalize">{scene.scene_type}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Scene Key</span>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{scene.scene_key}</code>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Repeatable</span>
                      <span>{scene.is_repeatable ? '✅ Yes' : '❌ No'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isEditable && scene.is_optional && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove Optional Scene
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Scene Button */}
      {isEditable && (
        <div className="flex items-center justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs gap-1.5 border-dashed"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Custom Scene
          </Button>
        </div>
      )}

      {/* AI Scene Customizer — now routes through LLM with local fallback */}
      {isEditable && (
        <AISceneCustomizer
          scenes={scenes}
          onScenesModified={onScenesModified}
          language={language}
          region={region}
        />
      )}

      {/* Per-Scene Translation vs Transcreation (CREATE workflow) */}
      {isEditable && showTranscreation && (
        <TranslationTranscreationToggle
          sourceText={expandedScene 
            ? scenes.find(s => s.id === expandedScene)?.script_template || ''
            : ''
          }
          sourceLanguage="en"
          region={region}
          onResult={(result) => {
            console.log('[CREATE/SceneTimeline] Transcreation result:', result.mode, result.targetLanguage);
          }}
          compact
        />
      )}

      {/* Info Note */}
      <div className="text-[10px] text-muted-foreground text-center bg-muted/20 rounded-md p-2">
        💡 Scene modifications are applied during Production Setup. Required scenes cannot be removed.
      </div>
    </div>
  );
}
