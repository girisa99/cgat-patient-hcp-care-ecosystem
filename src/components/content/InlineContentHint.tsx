/**
 * Inline Content Hint
 * 
 * PURPOSE: Subtle, dismissable hints powered by Label Studio ML
 * - Appears inline within content flows
 * - Non-intrusive, can be dismissed
 * - Records user interactions for training
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLabelStudioBackground, type TrainingEventType } from '@/services/labelStudioBackgroundService';

interface InlineContentHintProps {
  type: 'suggestion' | 'warning' | 'improvement';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  eventType?: TrainingEventType;
  product: 'mind' | 'spark' | 'vibe' | 'arc' | 'hub';
  className?: string;
  compact?: boolean;
}

export const InlineContentHint: React.FC<InlineContentHintProps> = ({
  type,
  message,
  actionLabel,
  onAction,
  onDismiss,
  eventType = 'caption_selected',
  product,
  className,
  compact = false
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { recordEvent } = useLabelStudioBackground();

  if (isDismissed) return null;

  const handleAction = () => {
    recordEvent({
      eventType,
      context: {
        product,
        userAction: 'accept',
        originalValue: message
      }
    });
    onAction?.();
  };

  const handleDismiss = () => {
    recordEvent({
      eventType,
      context: {
        product,
        userAction: 'ignore',
        originalValue: message
      }
    });
    setIsDismissed(true);
    onDismiss?.();
  };

  const icons = {
    suggestion: <Lightbulb className="h-3.5 w-3.5" />,
    warning: <AlertTriangle className="h-3.5 w-3.5" />,
    improvement: <TrendingUp className="h-3.5 w-3.5" />
  };

  const styles = {
    suggestion: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
    improvement: 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300'
  };

  if (compact) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border",
        styles[type],
        className
      )}>
        {icons[type]}
        <span className="max-w-[200px] truncate">{message}</span>
        {actionLabel && (
          <button 
            onClick={handleAction}
            className="font-medium hover:underline"
          >
            {actionLabel}
          </button>
        )}
        <button 
          onClick={handleDismiss}
          className="opacity-60 hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-start gap-2 p-3 rounded-lg border text-sm",
      styles[type],
      className
    )}>
      <div className="mt-0.5 shrink-0">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{message}</p>
        {actionLabel && (
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 mt-1 text-xs"
            onClick={handleAction}
          >
            {actionLabel} →
          </Button>
        )}
      </div>
      <button 
        onClick={handleDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default InlineContentHint;
