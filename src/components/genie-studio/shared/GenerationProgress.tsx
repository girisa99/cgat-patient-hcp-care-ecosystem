/**
 * Generation Progress Component
 * Standardized progress display for AI generation tasks
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerationProgressProps {
  isProcessing: boolean;
  progress: number;
  message: string;
  error?: string | null;
  className?: string;
}

export function GenerationProgress({
  isProcessing,
  progress,
  message,
  error,
  className,
}: GenerationProgressProps) {
  if (!isProcessing && !error) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {isProcessing && (
        <>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">{message}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </>
      )}
      
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}

interface CompletionBadgeProps {
  isComplete: boolean;
  label?: string;
  className?: string;
}

export function CompletionBadge({
  isComplete,
  label = 'Complete',
  className,
}: CompletionBadgeProps) {
  if (!isComplete) return null;

  return (
    <div className={cn(
      "flex items-center gap-1.5 text-green-600 dark:text-green-400",
      className
    )}>
      <CheckCircle className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
