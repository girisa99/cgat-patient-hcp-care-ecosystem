/**
 * B-024: Production Timeline — Visual Phase Progress
 *
 * Shows the production pipeline as a horizontal or vertical timeline:
 *   Script → TTS → Visual Render → Assembly → Quality Gate → Export
 *
 * Each phase shows estimated/actual duration, current status, and provider.
 * Adapts labels based on the active rendering mode
 * (avatar, 3D, animation, cinematic, AI video).
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Mic,
  User,
  Box,
  Sparkles,
  Film,
  Layers,
  Shield,
  Download,
  Check,
  Loader2,
  Clock,
  AlertCircle,
  Clapperboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SceneRenderMode } from './SceneProgressTracker';

// ─── Types ──────────────────────────────────────────────────────────────────

export type PhaseStatus = 'pending' | 'active' | 'complete' | 'failed' | 'skipped';

export interface TimelinePhase {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: PhaseStatus;
  progress: number;          // 0-100
  provider?: string;
  estimatedSeconds: number;
  actualSeconds?: number;
}

interface ProductionTimelineProps {
  phases: TimelinePhase[];
  currentPhaseId: string | null;
  overallProgress: number;
  elapsedMs: number;
  estimatedTotalMs: number;
  className?: string;
}

// ─── Phase Node ─────────────────────────────────────────────────────────────

function PhaseNode({ phase, isCurrent }: { phase: TimelinePhase; isCurrent: boolean }) {
  const Icon = phase.icon;
  const isActive = phase.status === 'active';
  const isComplete = phase.status === 'complete';
  const isFailed = phase.status === 'failed';
  const isSkipped = phase.status === 'skipped';

  return (
    <div className="flex-1 min-w-0">
      {/* Icon circle */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
            isComplete && 'bg-emerald-500 border-emerald-500 text-white',
            isActive && 'bg-primary/10 border-primary text-primary ring-4 ring-primary/20',
            isFailed && 'bg-red-500 border-red-500 text-white',
            isSkipped && 'bg-muted border-muted-foreground/20 text-muted-foreground',
            !isComplete && !isActive && !isFailed && !isSkipped && 'bg-muted border-border text-muted-foreground',
          )}
        >
          {isComplete ? (
            <Check className="w-5 h-5" />
          ) : isActive ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isFailed ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>

        {/* Progress bar under active phase */}
        {isActive && (
          <Progress value={phase.progress} className="w-full h-1 mt-2" />
        )}

        {/* Label */}
        <span className={cn(
          'text-[11px] font-medium mt-1.5 text-center',
          isActive && 'text-primary',
          isComplete && 'text-emerald-600 dark:text-emerald-400',
          isFailed && 'text-red-500',
          isSkipped && 'text-muted-foreground line-through',
        )}>
          {phase.label}
        </span>

        {/* Provider badge */}
        {phase.provider && (isActive || isComplete) && (
          <Badge variant="outline" className="text-[8px] mt-0.5 px-1 py-0">
            {phase.provider}
          </Badge>
        )}

        {/* Time */}
        <span className="text-[9px] text-muted-foreground mt-0.5">
          {phase.actualSeconds != null
            ? `${phase.actualSeconds}s`
            : isActive
              ? `~${phase.estimatedSeconds}s`
              : ''}
        </span>
      </div>
    </div>
  );
}

// ─── Connector ──────────────────────────────────────────────────────────────

function Connector({ leftComplete }: { leftComplete: boolean }) {
  return (
    <div className="flex items-center flex-shrink-0 px-0.5" style={{ marginTop: '-28px' }}>
      <div className={cn(
        'h-0.5 w-6 transition-all',
        leftComplete ? 'bg-emerald-400' : 'bg-border',
      )} />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ProductionTimeline({
  phases,
  currentPhaseId,
  overallProgress,
  elapsedMs,
  estimatedTotalMs,
  className,
}: ProductionTimelineProps) {
  const elapsed = useMemo(() => {
    const secs = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(secs / 60);
    return mins > 0 ? `${mins}m ${secs % 60}s` : `${secs}s`;
  }, [elapsedMs]);

  const estimated = useMemo(() => {
    const secs = Math.floor(estimatedTotalMs / 1000);
    const mins = Math.floor(secs / 60);
    return mins > 0 ? `${mins}m ${secs % 60}s` : `${secs}s`;
  }, [estimatedTotalMs]);

  const completedCount = phases.filter(p => p.status === 'complete').length;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            Production Timeline
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{completedCount}/{phases.length} phases</span>
            <span>{elapsed} / ~{estimated}</span>
            <Badge variant={overallProgress >= 100 ? 'default' : 'secondary'} className="text-[10px]">
              {Math.round(overallProgress)}%
            </Badge>
          </div>
        </div>
        <Progress value={overallProgress} className="h-1.5" />
      </CardHeader>

      <CardContent>
        <div className="flex items-start overflow-x-auto pb-2">
          {phases.map((phase, idx) => (
            <React.Fragment key={phase.id}>
              {idx > 0 && <Connector leftComplete={phases[idx - 1].status === 'complete'} />}
              <PhaseNode phase={phase} isCurrent={phase.id === currentPhaseId} />
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Factory: Create timeline phases based on rendering mode ────────────────

export function createTimelinePhases(
  renderMode: SceneRenderMode,
  includeExport: boolean = true,
): TimelinePhase[] {
  const phases: TimelinePhase[] = [
    {
      id: 'script',
      label: 'Script',
      description: 'Scene script generation and enrichment',
      icon: FileText,
      status: 'pending',
      progress: 0,
      estimatedSeconds: 15,
    },
    {
      id: 'tts',
      label: 'TTS Audio',
      description: 'Text-to-speech generation with regional voice',
      icon: Mic,
      status: 'pending',
      progress: 0,
      estimatedSeconds: 30,
    },
  ];

  // Mode-specific visual rendering phase
  switch (renderMode) {
    case 'avatar':
      phases.push({
        id: 'visual',
        label: 'Avatar',
        description: 'Avatar video generation with lip-sync',
        icon: User,
        status: 'pending',
        progress: 0,
        estimatedSeconds: 120,
      });
      break;
    case '3d_render':
      phases.push({
        id: 'visual',
        label: '3D Render',
        description: '3D model generation and rendering',
        icon: Box,
        status: 'pending',
        progress: 0,
        estimatedSeconds: 180,
      });
      break;
    case 'animation':
      phases.push({
        id: 'visual',
        label: 'Animation',
        description: 'Animation generation and rendering',
        icon: Sparkles,
        status: 'pending',
        progress: 0,
        estimatedSeconds: 90,
      });
      break;
    case 'cinematic':
      phases.push({
        id: 'visual',
        label: 'Cinematic',
        description: 'Cinematic video rendering with effects',
        icon: Clapperboard,
        status: 'pending',
        progress: 0,
        estimatedSeconds: 150,
      });
      break;
    default:
      phases.push({
        id: 'visual',
        label: 'AI Video',
        description: 'AI video generation',
        icon: Film,
        status: 'pending',
        progress: 0,
        estimatedSeconds: 60,
      });
  }

  phases.push({
    id: 'assembly',
    label: 'Assembly',
    description: 'B-roll overlay, transitions, and stitching',
    icon: Layers,
    status: 'pending',
    progress: 0,
    estimatedSeconds: 30,
  });

  phases.push({
    id: 'quality',
    label: 'QA Gate',
    description: 'Quality assessment and compliance scan',
    icon: Shield,
    status: 'pending',
    progress: 0,
    estimatedSeconds: 10,
  });

  if (includeExport) {
    phases.push({
      id: 'export',
      label: 'Export',
      description: 'Encode to output presets',
      icon: Download,
      status: 'pending',
      progress: 0,
      estimatedSeconds: 20,
    });
  }

  return phases;
}

export default ProductionTimeline;
