/**
 * Progressive Analysis Overlay - Shows step-by-step analysis progress
 * Extracted from ScriptEditorTab.tsx
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Search,
  Clock,
  Sparkles,
  FileCheck,
  Wand2,
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisStep {
  step: string;
  status: 'pending' | 'running' | 'complete';
  detail?: string;
}

interface ProgressiveAnalysisOverlayProps {
  steps: AnalysisStep[];
  isVisible: boolean;
}

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  stats: BookOpen,
  readability: Search,
  pacing: Clock,
  engagement: Sparkles,
  clarity: FileCheck,
  ai: Wand2,
};

const STEP_LABELS: Record<string, string> = {
  stats: 'Calculating word count & reading time',
  readability: 'Analyzing readability & complexity',
  pacing: 'Checking pacing & natural pauses',
  engagement: 'Evaluating audience engagement',
  clarity: 'Reviewing clarity & structure',
  ai: 'Getting AI recommendations',
};

export function ProgressiveAnalysisOverlay({ steps, isVisible }: ProgressiveAnalysisOverlayProps) {
  if (!isVisible) return null;

  const completedCount = steps.filter(s => s.status === 'complete').length;
  const progressPercent = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="mb-6 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          Analyzing Script...
        </h3>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const Icon = STEP_ICONS[step.step] || FileCheck;
          const label = STEP_LABELS[step.step] || step.step;

          return (
            <div
              key={step.step}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all",
                step.status === 'running' && "bg-blue-500/10 border border-blue-500/30",
                step.status === 'complete' && "bg-green-500/5 border border-green-500/20",
                step.status === 'pending' && "bg-muted/30 opacity-50"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                step.status === 'running' && "bg-blue-500/20",
                step.status === 'complete' && "bg-green-500/20",
                step.status === 'pending' && "bg-muted"
              )}>
                {step.status === 'running' ? (
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                ) : step.status === 'complete' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Icon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  step.status === 'running' && "text-blue-600",
                  step.status === 'complete' && "text-foreground",
                  step.status === 'pending' && "text-muted-foreground"
                )}>
                  {label}
                </p>
                {step.detail && step.status === 'complete' && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                )}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  step.status === 'running' && "border-blue-500/50 text-blue-600",
                  step.status === 'complete' && "border-green-500/50 text-green-600",
                  step.status === 'pending' && "border-border text-muted-foreground"
                )}
              >
                {step.status === 'running' ? 'Analyzing...' :
                 step.status === 'complete' ? 'Done' :
                 `Step ${idx + 1}`}
              </Badge>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-blue-500/20">
        <Progress value={progressPercent} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {completedCount} of {steps.length} steps complete
        </p>
      </div>
    </div>
  );
}
