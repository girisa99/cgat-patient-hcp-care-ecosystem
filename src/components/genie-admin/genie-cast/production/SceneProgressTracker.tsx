/**
 * B-021: Scene Progress Tracker — Multi-Mode Production Progress
 *
 * Shows real-time per-scene production status across all rendering modes:
 *   Avatar (photorealistic, 3D Pixar, 2D animated)
 *   AI Video (Veo3, Wan2.6, Sora, ModelsLab)
 *   3D Generation (Meshy, Alibaba Richdreamer, TaoAvatar)
 *   Animation (anime, motion graphics, kinetic typography, whiteboard)
 *   Cinematic (high-end, color-graded)
 *
 * Each scene shows its rendering mode, provider, and phase progress.
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  User,
  Box,
  Sparkles,
  Film,
  Video,
  Mic,
  Check,
  AlertCircle,
  Clock,
  Loader2,
  RotateCcw,
  Eye,
  Layers,
  Clapperboard,
  Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductionState } from '@/hooks/useCastProduction';

// ─── Types ──────────────────────────────────────────────────────────────────

export type SceneRenderMode =
  | 'avatar'        // Talking head (D-ID, Alibaba Wan2.2, ModelsLab)
  | 'ai_video'      // Text/image → video (Veo3, Wan2.6, Sora)
  | '3d_render'     // 3D generation (Meshy, Richdreamer, TaoAvatar)
  | 'animation'     // 2D/3D animation (ModelsLab, anime)
  | 'cinematic'     // High-end video with effects
  | 'interactive'   // Quiz, branching, shoppable
  | 'mixed';        // Multiple modes in one scene

export type ScenePhase =
  | 'queued'
  | 'script_ready'
  | 'tts_generating'
  | 'tts_complete'
  | 'visual_generating'   // Avatar / AI Video / 3D / Animation
  | 'visual_complete'
  | 'compositing'         // B-roll overlay, transitions
  | 'complete'
  | 'failed';

export interface SceneProgress {
  sceneId: string;
  sceneNumber: number;
  title: string;
  renderMode: SceneRenderMode;
  phase: ScenePhase;
  provider: string;
  progress: number;        // 0-100 within current phase
  duration: number;        // seconds
  error?: string;
  retryCount: number;
}

interface SceneProgressTrackerProps {
  scenes: SceneProgress[];
  productionState: ProductionState;
  onRetryScene?: (sceneId: string) => void;
  onPreviewScene?: (sceneId: string) => void;
  className?: string;
}

// ─── Render Mode Config ─────────────────────────────────────────────────────

const RENDER_MODE_CONFIG: Record<SceneRenderMode, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}> = {
  avatar: {
    label: 'Avatar',
    icon: User,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  ai_video: {
    label: 'AI Video',
    icon: Film,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  '3d_render': {
    label: '3D',
    icon: Box,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  animation: {
    label: 'Animation',
    icon: Sparkles,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
  },
  cinematic: {
    label: 'Cinematic',
    icon: Clapperboard,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  interactive: {
    label: 'Interactive',
    icon: Layers,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  mixed: {
    label: 'Multi-Mode',
    icon: Layers,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
};

const PHASE_CONFIG: Record<ScenePhase, {
  label: string;
  icon: React.ElementType;
  progress: number;  // base progress for this phase
}> = {
  queued:             { label: 'Queued',       icon: Clock,        progress: 0 },
  script_ready:      { label: 'Script Ready', icon: Check,        progress: 10 },
  tts_generating:    { label: 'TTS',          icon: Mic,          progress: 20 },
  tts_complete:      { label: 'TTS Done',     icon: Headphones,   progress: 40 },
  visual_generating: { label: 'Rendering',    icon: Loader2,      progress: 50 },
  visual_complete:   { label: 'Rendered',     icon: Video,        progress: 80 },
  compositing:       { label: 'Compositing',  icon: Layers,       progress: 90 },
  complete:          { label: 'Complete',     icon: Check,        progress: 100 },
  failed:            { label: 'Failed',       icon: AlertCircle,  progress: 0 },
};

// ─── Scene Row ──────────────────────────────────────────────────────────────

function SceneRow({
  scene,
  onRetry,
  onPreview,
}: {
  scene: SceneProgress;
  onRetry?: () => void;
  onPreview?: () => void;
}) {
  const modeConfig = RENDER_MODE_CONFIG[scene.renderMode];
  const phaseConfig = PHASE_CONFIG[scene.phase];
  const ModeIcon = modeConfig.icon;
  const PhaseIcon = phaseConfig.icon;
  const isActive = scene.phase === 'tts_generating' || scene.phase === 'visual_generating' || scene.phase === 'compositing';
  const isFailed = scene.phase === 'failed';
  const isComplete = scene.phase === 'complete';

  // Overall progress = phase base + (phase progress * phase weight)
  const overallProgress = isComplete ? 100
    : isFailed ? 0
    : phaseConfig.progress + (scene.progress * (1 - phaseConfig.progress / 100) * 0.5);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        isActive && 'border-primary/40 bg-primary/5 ring-1 ring-primary/10',
        isFailed && 'border-red-300 bg-red-50 dark:bg-red-950/10',
        isComplete && 'border-emerald-300/50 bg-emerald-50/50 dark:bg-emerald-950/10',
        !isActive && !isFailed && !isComplete && 'border-border/50',
      )}
    >
      {/* Scene Number */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
        isComplete ? 'bg-emerald-500 text-white' : isFailed ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground',
      )}>
        {isComplete ? <Check className="w-4 h-4" /> : scene.sceneNumber}
      </div>

      {/* Scene Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium truncate">{scene.title}</span>
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 flex-shrink-0">
            {scene.duration}s
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <Progress value={overallProgress} className="h-1.5 flex-1" />
          <span className="text-[10px] text-muted-foreground w-8 text-right">
            {Math.round(overallProgress)}%
          </span>
        </div>

        {/* Error message */}
        {isFailed && scene.error && (
          <p className="text-[10px] text-red-500 mt-1 truncate">{scene.error}</p>
        )}
      </div>

      {/* Render Mode Badge */}
      <div className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium flex-shrink-0',
        modeConfig.bgColor,
        modeConfig.color,
      )}>
        <ModeIcon className="w-3 h-3" />
        {modeConfig.label}
      </div>

      {/* Phase Badge */}
      <Badge
        variant={isComplete ? 'default' : isFailed ? 'destructive' : 'secondary'}
        className="text-[10px] gap-1 flex-shrink-0"
      >
        <PhaseIcon className={cn('w-3 h-3', isActive && 'animate-spin')} />
        {phaseConfig.label}
      </Badge>

      {/* Provider */}
      <span className="text-[9px] text-muted-foreground w-20 text-right truncate flex-shrink-0">
        {scene.provider}
      </span>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0">
        {isFailed && onRetry && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRetry} title="Retry">
            <RotateCcw className="w-3 h-3" />
          </Button>
        )}
        {isComplete && onPreview && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onPreview} title="Preview">
            <Eye className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SceneProgressTracker({
  scenes,
  productionState,
  onRetryScene,
  onPreviewScene,
  className,
}: SceneProgressTrackerProps) {
  const stats = useMemo(() => {
    const total = scenes.length;
    const complete = scenes.filter(s => s.phase === 'complete').length;
    const failed = scenes.filter(s => s.phase === 'failed').length;
    const active = scenes.filter(s =>
      s.phase === 'tts_generating' || s.phase === 'visual_generating' || s.phase === 'compositing'
    ).length;

    // Count modes
    const modes = new Map<SceneRenderMode, number>();
    scenes.forEach(s => modes.set(s.renderMode, (modes.get(s.renderMode) || 0) + 1));

    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
    const overallProgress = total > 0 ? Math.round((complete / total) * 100) : 0;

    return { total, complete, failed, active, modes, totalDuration, overallProgress };
  }, [scenes]);

  if (scenes.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="w-5 h-5 text-primary" />
              Scene Production Progress
            </CardTitle>
            <CardDescription>
              {stats.total} scenes across {stats.modes.size} rendering mode{stats.modes.size > 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.overallProgress}%</div>
            <div className="text-[10px] text-muted-foreground">
              {stats.complete}/{stats.total} complete
            </div>
          </div>
        </div>

        {/* Mode distribution */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {Array.from(stats.modes.entries()).map(([mode, count]) => {
            const config = RENDER_MODE_CONFIG[mode];
            const Icon = config.icon;
            return (
              <Badge key={mode} variant="outline" className={cn('text-[10px] gap-1', config.color)}>
                <Icon className="w-3 h-3" />
                {config.label}: {count}
              </Badge>
            );
          })}
          <Badge variant="outline" className="text-[10px]">
            <Clock className="w-3 h-3 mr-1" />
            {Math.floor(stats.totalDuration / 60)}:{(stats.totalDuration % 60).toString().padStart(2, '0')}
          </Badge>
        </div>

        {/* Overall progress */}
        <Progress value={stats.overallProgress} className="mt-2" />
      </CardHeader>

      <CardContent>
        <ScrollArea className={scenes.length > 6 ? 'h-[360px]' : undefined}>
          <div className="space-y-2 pr-2">
            {scenes.map(scene => (
              <SceneRow
                key={scene.sceneId}
                scene={scene}
                onRetry={onRetryScene ? () => onRetryScene(scene.sceneId) : undefined}
                onPreview={onPreviewScene ? () => onPreviewScene(scene.sceneId) : undefined}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ─── Helper: Derive render mode from style ──────────────────────────────────

export function deriveSceneRenderMode(styleId: string): SceneRenderMode {
  if (styleId.includes('avatar') || styleId.includes('talking') || styleId.includes('digital_twin') || styleId.includes('mascot')) {
    return 'avatar';
  }
  if (styleId.includes('3d') || styleId.includes('explainer_3d')) {
    return '3d_render';
  }
  if (styleId.includes('anime') || styleId.includes('animation') || styleId.includes('whiteboard') ||
      styleId.includes('motion_graphics') || styleId.includes('kinetic') || styleId.includes('image_to_life')) {
    return 'animation';
  }
  if (styleId.includes('interactive') || styleId.includes('quiz') || styleId.includes('shoppable') || styleId.includes('branching')) {
    return 'interactive';
  }
  if (styleId.includes('cinematic') || styleId.includes('short_film') || styleId.includes('documentary')) {
    return 'cinematic';
  }
  return 'ai_video';
}

export default SceneProgressTracker;
