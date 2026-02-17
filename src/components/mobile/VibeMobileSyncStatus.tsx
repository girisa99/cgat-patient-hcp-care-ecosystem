/**
 * VibeMobileSyncStatus - Visual sync status indicator for Vibe Mobile
 * 
 * Displays:
 * - Online/offline status
 * - Pending items count
 * - Sync progress
 * - Manual sync button
 */

import React from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { VibeMobileSyncState } from '@/hooks/useVibeMobileSync';

interface VibeMobileSyncStatusProps {
  state: VibeMobileSyncState;
  pendingCount: number;
  syncProgress: number;
  onSync: () => void;
  onCancel: () => void;
  compact?: boolean;
  className?: string;
}

export const VibeMobileSyncStatus: React.FC<VibeMobileSyncStatusProps> = ({
  state,
  pendingCount,
  syncProgress,
  onSync,
  onCancel,
  compact = false,
  className,
}) => {
  const { isOnline, isSyncing, lastSyncTime, errors } = state;

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Compact mode for mobile header
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn('relative p-2', className)}
              onClick={isOnline && pendingCount > 0 && !isSyncing ? onSync : undefined}
              disabled={!isOnline || isSyncing}
            >
              {isSyncing ? (
                <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              ) : isOnline ? (
                <Cloud className="h-5 w-5 text-primary" />
              ) : (
                <CloudOff className="h-5 w-5 text-muted-foreground" />
              )}
              {pendingCount > 0 && !isSyncing && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
                >
                  {pendingCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isSyncing ? (
              <p>Syncing... {syncProgress}%</p>
            ) : isOnline ? (
              pendingCount > 0 ? (
                <p>Tap to sync {pendingCount} items</p>
              ) : (
                <p>All synced • {formatLastSync(lastSyncTime)}</p>
              )
            ) : (
              <p>Offline • {pendingCount} pending</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full status panel
  return (
    <div className={cn('rounded-lg border bg-card p-4 space-y-3', className)}>
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Cloud className="h-5 w-5 text-primary" />
          ) : (
            <CloudOff className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="font-medium">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {lastSyncTime && (
          <span className="text-sm text-muted-foreground">
            Last sync: {formatLastSync(lastSyncTime)}
          </span>
        )}
      </div>

      {/* Pending Items */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span>{pendingCount} items waiting to sync</span>
          </div>
          <span className="text-muted-foreground">
            {formatBytes(state.totalBytesToSync)}
          </span>
        </div>
      )}

      {/* Sync Progress */}
      {isSyncing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Syncing...
            </span>
            <span>{syncProgress}%</span>
          </div>
          <Progress value={syncProgress} className="h-2" />
          {state.currentItem && (
            <p className="text-xs text-muted-foreground truncate">
              {state.currentItem.type}: {String(state.currentItem.data.metadata?.title || state.currentItem.data.metadata?.name || state.currentItem.id)}
            </p>
          )}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Sync errors</p>
            <ul className="text-xs mt-1 space-y-0.5">
              {errors.slice(0, 3).map((error, i) => (
                <li key={i}>{error}</li>
              ))}
              {errors.length > 3 && (
                <li>...and {errors.length - 3} more</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Success State */}
      {!isSyncing && pendingCount === 0 && errors.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Check className="h-4 w-4" />
          <span>All recordings synced</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {isSyncing ? (
          <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onSync}
            disabled={!isOnline || pendingCount === 0}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Now
          </Button>
        )}
      </div>
    </div>
  );
};

export default VibeMobileSyncStatus;
