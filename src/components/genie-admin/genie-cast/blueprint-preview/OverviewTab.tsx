/**
 * Blueprint Preview Modal - Overview Tab
 * Shows quick stats, scene flow, target platforms, and industry tags
 * With action buttons for scene editing and platform extension
 */

import React from 'react';
import {
  Clock,
  Layers,
  Target,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Plus,
  Edit3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BlueprintScene } from '@/hooks/useVideoBlueprints';

interface OverviewTabProps {
  scenes: BlueprintScene[];
  targetPlatforms: string[];
  industryTags: string[];
  expandedScene: string | null;
  onExpandScene: (sceneId: string | null) => void;
  onSwitchToTimeline: () => void;
  formatDuration: (seconds: number) => string;
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
  content: <Layers className="h-3 w-3" />,
  feature: <CheckCircle2 className="h-3 w-3" />,
  demo: <Target className="h-3 w-3" />,
  testimonial: <Target className="h-3 w-3" />,
  cta: <ChevronRight className="h-3 w-3" />,
  outro: <CheckCircle2 className="h-3 w-3" />,
};

export function OverviewTab({
  scenes,
  targetPlatforms,
  industryTags,
  expandedScene,
  onExpandScene,
  onSwitchToTimeline,
  formatDuration,
}: OverviewTabProps) {
  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const requiredScenes = scenes.filter(s => !s.is_optional);

  return (
    <div className="p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Total Duration</span>
          </div>
          <p className="text-xl font-bold">{formatDuration(totalDuration)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Range: {formatDuration(scenes.reduce((s, sc) => s + sc.min_duration_seconds, 0))} – {formatDuration(scenes.reduce((s, sc) => s + sc.max_duration_seconds, 0))}
          </p>
        </div>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Layers className="h-4 w-4" />
            <span className="text-xs">Total Scenes</span>
          </div>
          <p className="text-xl font-bold">{scenes.length}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {scenes.filter(s => s.is_optional).length} optional
          </p>
        </div>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs">Required Scenes</span>
          </div>
          <p className="text-xl font-bold">{requiredScenes.length}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Must include in final video
          </p>
        </div>
        <div className="bg-card/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            <span className="text-xs">Target Platforms</span>
          </div>
          <p className="text-xl font-bold">{targetPlatforms.length}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Pre-optimized formats
          </p>
        </div>
      </div>

      {/* Scene Flow Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Scene Flow</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={onSwitchToTimeline}
          >
            <Edit3 className="h-3 w-3" />
            Edit Scenes
          </Button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {scenes.map((scene, index) => (
            <React.Fragment key={scene.id}>
              <div
                className={cn(
                  "flex-shrink-0 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all hover:scale-105",
                  sceneTypeColors[scene.scene_type] || sceneTypeColors.content,
                  scene.is_optional && "opacity-60 border-dashed"
                )}
                onClick={() => onExpandScene(expandedScene === scene.id ? null : scene.id)}
              >
                <div className="flex items-center gap-2">
                  {sceneTypeIcons[scene.scene_type]}
                  <span>{scene.title}</span>
                  {scene.is_optional && (
                    <span className="text-[9px] opacity-60">(opt)</span>
                  )}
                </div>
                <div className="text-xs opacity-70 mt-0.5">
                  {formatDuration(scene.duration_seconds)}
                  <span className="ml-1 opacity-60">
                    ({formatDuration(scene.min_duration_seconds)}–{formatDuration(scene.max_duration_seconds)})
                  </span>
                </div>
              </div>
              {index < scenes.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Target Platforms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Target Platforms</h3>
          <Badge variant="outline" className="text-[10px] h-5">
            Customizable in Production Setup
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {targetPlatforms.map((platform) => (
            <Badge key={platform} variant="secondary" className="capitalize">
              {platform.replace('_', ' ')}
            </Badge>
          ))}
          {targetPlatforms.length === 0 && (
            <span className="text-xs text-muted-foreground">No platforms specified — all formats available</span>
          )}
        </div>
      </div>

      {/* Industry Tags */}
      {industryTags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Best For</h3>
          <div className="flex flex-wrap gap-2">
            {industryTags.map((tag) => (
              <Badge key={tag} variant="outline" className="capitalize">
                {tag.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
