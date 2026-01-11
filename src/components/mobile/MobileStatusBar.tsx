/**
 * Mobile Status Bar Component
 * Shows connection status, sync status, and native features availability
 */

import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useCapacitor } from '@/hooks/useCapacitor';
import { Badge } from '@/components/ui/badge';

interface MobileStatusBarProps {
  className?: string;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({ className }) => {
  const { state: syncState, syncNow } = useOfflineSync();
  const { state: capacitorState } = useCapacitor();

  const handleSync = () => {
    if (!syncState.isSyncing && syncState.isOnline) {
      syncNow();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 bg-muted/50 border-b text-sm',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          {syncState.isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Offline</span>
            </>
          )}
        </div>

        {/* Platform Badge */}
        {capacitorState.isNative && (
          <Badge variant="outline" className="text-xs">
            <Smartphone className="h-3 w-3 mr-1" />
            {capacitorState.platform.toUpperCase()}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Pending Changes */}
        {syncState.pendingChanges > 0 && (
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-muted-foreground">
              {syncState.pendingChanges} pending
            </span>
          </div>
        )}

        {/* Sync Status */}
        {syncState.isSyncing ? (
          <div className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            <span className="text-muted-foreground">Syncing...</span>
          </div>
        ) : syncState.lastSyncTime ? (
          <button
            onClick={handleSync}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground text-xs">
              {syncState.lastSyncTime.toLocaleTimeString()}
            </span>
          </button>
        ) : null}

        {/* Sync Errors */}
        {syncState.syncErrors.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {syncState.syncErrors.length} errors
          </Badge>
        )}
      </div>
    </div>
  );
};
