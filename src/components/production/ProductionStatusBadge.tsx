/**
 * Production Status Badge - Shows feedback/review status on Kanban cards
 * Integrates with session feedback system for real-time updates
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductionFeedbackStatus } from '@/hooks/useProductionFeedbackSync';
import { STATUS_BADGE_COLORS } from '@/hooks/useProductionFeedbackSync';

interface ProductionStatusBadgeProps {
  status: ProductionFeedbackStatus | null;
  variant?: 'compact' | 'detailed';
  showTooltip?: boolean;
  className?: string;
}

export const ProductionStatusBadge: React.FC<ProductionStatusBadgeProps> = ({
  status,
  variant = 'compact',
  showTooltip = true,
  className,
}) => {
  if (!status || !status.sessionId) {
    return null;
  }

  const { pendingFeedbackCount, resolvedFeedbackCount, urgentItems, overallApproval } = status;
  const hasFeedback = pendingFeedbackCount > 0 || resolvedFeedbackCount > 0;

  // Determine primary indicator
  const getIndicatorConfig = () => {
    if (urgentItems > 0) {
      return {
        icon: AlertCircle,
        color: 'bg-destructive text-destructive-foreground',
        text: `${urgentItems} urgent`,
        priority: 'high',
      };
    }
    if (pendingFeedbackCount > 0) {
      return {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        text: `${pendingFeedbackCount} pending`,
        priority: 'medium',
      };
    }
    if (overallApproval === 'approved') {
      return {
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        text: 'Approved',
        priority: 'low',
      };
    }
    if (overallApproval === 'rejected') {
      return {
        icon: XCircle,
        color: 'bg-destructive/20 text-destructive',
        text: 'Rejected',
        priority: 'high',
      };
    }
    if (resolvedFeedbackCount > 0) {
      return {
        icon: CheckCircle2,
        color: 'bg-muted text-muted-foreground',
        text: `${resolvedFeedbackCount} resolved`,
        priority: 'low',
      };
    }
    return null;
  };

  const config = getIndicatorConfig();
  
  if (!config && !hasFeedback) {
    return null;
  }

  const Icon = config?.icon || MessageSquare;

  const renderCompact = () => (
    <Badge 
      variant="outline" 
      className={cn(
        'gap-1 text-xs py-0.5',
        config?.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {pendingFeedbackCount > 0 && (
        <span className="font-medium">{pendingFeedbackCount}</span>
      )}
    </Badge>
  );

  const renderDetailed = () => (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {/* Main status badge */}
      {config && (
        <Badge 
          variant="outline" 
          className={cn('gap-1 text-xs', config.color)}
        >
          <Icon className="h-3 w-3" />
          <span>{config.text}</span>
        </Badge>
      )}

      {/* Review statuses */}
      {variant === 'detailed' && (
        <>
          {status.scriptStatus && status.scriptStatus !== 'not_started' && (
            <Badge 
              variant="outline" 
              className={cn('text-xs', STATUS_BADGE_COLORS[status.scriptStatus])}
            >
              📝 Script: {status.scriptStatus.replace('_', ' ')}
            </Badge>
          )}
          {status.titleStatus && status.titleStatus !== 'not_started' && (
            <Badge 
              variant="outline" 
              className={cn('text-xs', STATUS_BADGE_COLORS[status.titleStatus])}
            >
              🏷️ Title: {status.titleStatus.replace('_', ' ')}
            </Badge>
          )}
          {status.recordingStatus && status.recordingStatus !== 'not_started' && (
            <Badge 
              variant="outline" 
              className={cn('text-xs', STATUS_BADGE_COLORS[status.recordingStatus])}
            >
              🎬 Recording: {status.recordingStatus.replace('_', ' ')}
            </Badge>
          )}
        </>
      )}
    </div>
  );

  const content = variant === 'compact' ? renderCompact() : renderDetailed();

  if (!showTooltip || variant === 'detailed') {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <p className="font-medium">Collaboration Status</p>
            <div className="space-y-0.5">
              {urgentItems > 0 && (
                <p className="text-destructive">⚠️ {urgentItems} urgent item(s)</p>
              )}
              {pendingFeedbackCount > 0 && (
                <p>🟡 {pendingFeedbackCount} pending feedback</p>
              )}
              {resolvedFeedbackCount > 0 && (
                <p>✅ {resolvedFeedbackCount} resolved</p>
              )}
              {status.scriptStatus !== 'not_started' && (
                <p>📝 Script: {status.scriptStatus.replace('_', ' ')}</p>
              )}
              {status.titleStatus !== 'not_started' && (
                <p>🏷️ Title: {status.titleStatus.replace('_', ' ')}</p>
              )}
              {status.recordingStatus !== 'not_started' && (
                <p>🎬 Recording: {status.recordingStatus.replace('_', ' ')}</p>
              )}
              {status.lastActivity && (
                <p className="text-muted-foreground mt-1">
                  Last activity: {new Date(status.lastActivity).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Mini notification indicator for urgent items
export const UrgentFeedbackIndicator: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="relative">
      <Bell className="h-4 w-4 text-muted-foreground" />
      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
        {count > 9 ? '9+' : count}
      </span>
    </div>
  );
};
