/**
 * B-025: Production Control Panel — Start/Pause/Cancel/Retry
 *
 * Consolidated action controls for the production pipeline.
 * Adapts to the current production state and rendering mode.
 *
 * States:
 *   idle        → [Start Production]
 *   preparing   → [Cancel] (spinner)
 *   producing   → [Pause] [Cancel]
 *   complete    → [Export] [New Production] [Retry Failed]
 *   failed      → [Retry] [New Production]
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Plus,
  Loader2,
  AlertCircle,
  Check,
  Zap,
  Rocket,
  Settings2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductionState } from '@/hooks/useCastProduction';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProductionControlPanelProps {
  productionState: ProductionState;
  onStart: () => void;
  onCancel: () => void;
  onReset: () => void;
  onRetryFailed?: () => void;
  onExport?: () => void;
  failedSceneCount?: number;
  totalSceneCount?: number;
  disabled?: boolean;
  className?: string;
}

// ─── Status Display ─────────────────────────────────────────────────────────

function StatusDisplay({ state }: { state: ProductionState }) {
  const statusConfig: Record<ProductionState['status'], {
    label: string;
    color: string;
    icon: React.ElementType;
    bgColor: string;
  }> = {
    idle: {
      label: 'Ready',
      color: 'text-muted-foreground',
      icon: Settings2,
      bgColor: 'bg-muted/30',
    },
    preparing: {
      label: 'Preparing',
      color: 'text-blue-600 dark:text-blue-400',
      icon: Loader2,
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    generating_scenes: {
      label: 'Generating Scenes',
      color: 'text-purple-600 dark:text-purple-400',
      icon: Zap,
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    producing: {
      label: 'Producing',
      color: 'text-primary',
      icon: Rocket,
      bgColor: 'bg-primary/5',
    },
    complete: {
      label: 'Complete',
      color: 'text-emerald-600 dark:text-emerald-400',
      icon: Check,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    },
    failed: {
      label: 'Failed',
      color: 'text-red-600 dark:text-red-400',
      icon: AlertCircle,
      bgColor: 'bg-red-50 dark:bg-red-950/20',
    },
  };

  const config = statusConfig[state.status];
  const Icon = config.icon;
  const isAnimating = state.status === 'preparing' || state.status === 'generating_scenes' || state.status === 'producing';

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg', config.bgColor)}>
      <Icon className={cn('w-5 h-5', config.color, isAnimating && 'animate-spin')} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-semibold', config.color)}>{config.label}</span>
          {state.currentTask && (
            <span className="text-xs text-muted-foreground truncate">{state.currentTask}</span>
          )}
        </div>
        {isAnimating && (
          <Progress value={state.progress} className="h-1.5 mt-1.5" />
        )}
      </div>
      <span className="text-xs text-muted-foreground">{Math.round(state.progress)}%</span>
    </div>
  );
}

// ─── Time Display ───────────────────────────────────────────────────────────

function TimeDisplay({ startedAt, completedAt }: { startedAt: string | null; completedAt: string | null }) {
  if (!startedAt) return null;

  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const elapsedSecs = Math.floor((end - start) / 1000);
  const mins = Math.floor(elapsedSecs / 60);
  const secs = elapsedSecs % 60;

  return (
    <Badge variant="outline" className="text-[10px]">
      {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
    </Badge>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ProductionControlPanel({
  productionState,
  onStart,
  onCancel,
  onReset,
  onRetryFailed,
  onExport,
  failedSceneCount = 0,
  totalSceneCount = 0,
  disabled = false,
  className,
}: ProductionControlPanelProps) {
  const isIdle = productionState.status === 'idle';
  const isProducing = productionState.status === 'preparing' ||
    productionState.status === 'generating_scenes' ||
    productionState.status === 'producing';
  const isComplete = productionState.status === 'complete';
  const isFailed = productionState.status === 'failed';

  return (
    <Card className={className}>
      <CardContent className="pt-4 space-y-3">
        {/* Status */}
        <StatusDisplay state={productionState} />

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Start button */}
          {isIdle && (
            <Button
              onClick={onStart}
              disabled={disabled}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80"
              size="lg"
            >
              <Rocket className="w-4 h-4" />
              Start Production
            </Button>
          )}

          {/* Producing controls */}
          {isProducing && (
            <>
              <Button variant="destructive" onClick={onCancel} className="gap-2">
                <Square className="w-4 h-4" />
                Cancel
              </Button>
            </>
          )}

          {/* Complete controls */}
          {isComplete && (
            <>
              {onExport && (
                <Button onClick={onExport} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              )}

              {failedSceneCount > 0 && onRetryFailed && (
                <Button variant="outline" onClick={onRetryFailed} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Retry {failedSceneCount} Failed
                </Button>
              )}

              <Button variant="outline" onClick={onReset} className="gap-2">
                <Plus className="w-4 h-4" />
                New Production
              </Button>
            </>
          )}

          {/* Failed controls */}
          {isFailed && (
            <>
              <Button onClick={onStart} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry Production
              </Button>
              <Button variant="outline" onClick={onReset} className="gap-2">
                <Plus className="w-4 h-4" />
                Start Over
              </Button>
            </>
          )}

          {/* Time display */}
          <div className="ml-auto">
            <TimeDisplay
              startedAt={productionState.startedAt}
              completedAt={productionState.completedAt}
            />
          </div>
        </div>

        {/* Error display */}
        {productionState.error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Production Error</p>
              <p className="text-xs text-red-500 mt-0.5">{productionState.error}</p>
            </div>
          </div>
        )}

        {/* Scene summary in complete/partial state */}
        {(isComplete || isFailed) && totalSceneCount > 0 && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span>{totalSceneCount - failedSceneCount} scenes rendered</span>
            {failedSceneCount > 0 && (
              <span className="text-red-500">{failedSceneCount} failed</span>
            )}
            {productionState.enrichmentScore > 0 && (
              <span>Enrichment: {productionState.enrichmentScore}/100</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProductionControlPanel;
