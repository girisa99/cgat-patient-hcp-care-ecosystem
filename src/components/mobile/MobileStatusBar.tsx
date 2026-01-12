/**
 * Mobile Status Bar Component
 * Shows connection status, sync status, and native features availability
 * Enhanced with offline mode indicators and feature availability
 */

import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone,
  Cloud,
  CloudOff,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useCapacitor } from '@/hooks/useCapacitor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface MobileStatusBarProps {
  className?: string;
  showDetails?: boolean;
}

// Offline/Online feature summary
const FEATURE_SUMMARY = {
  offline: ['Record', 'Edit', 'Trim', 'Timeline', 'Local Export'],
  onlineOnly: ['AI Scripts', 'AI TTS', 'Cloud Sync', 'Social Upload']
};

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({ 
  className,
  showDetails = true 
}) => {
  const { state: syncState, syncNow } = useOfflineSync();
  const { state: capacitorState } = useCapacitor();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSync = async () => {
    if (!syncState.isSyncing && syncState.isOnline) {
      toast.info('Syncing your work...');
      await syncNow();
      toast.success('All changes synced!');
    }
  };

  return (
    <div className={cn('border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      {/* Main Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          {/* Connection Status with Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  'h-7 px-2 gap-1.5',
                  syncState.isOnline ? 'text-green-600' : 'text-amber-600'
                )}
              >
                {syncState.isOnline ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">
                  {syncState.isOnline ? 'Online' : 'Offline'}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {syncState.isOnline ? (
                    <Cloud className="h-5 w-5 text-green-500" />
                  ) : (
                    <CloudOff className="h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {syncState.isOnline ? 'All Features Active' : 'Offline Mode'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {syncState.isOnline 
                        ? 'Full studio access' 
                        : 'Recording & editing available'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium flex items-center gap-1">
                    <Unlock className="h-3 w-3 text-green-500" />
                    Available Now:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {FEATURE_SUMMARY.offline.map(f => (
                      <Badge key={f} variant="secondary" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>

                {!syncState.isOnline && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium flex items-center gap-1 text-amber-600">
                      <Lock className="h-3 w-3" />
                      When Online:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {FEATURE_SUMMARY.onlineOnly.map(f => (
                        <Badge key={f} variant="outline" className="text-xs opacity-60">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Platform Badge */}
          {capacitorState.isNative && (
            <Badge variant="outline" className="text-xs h-6 px-1.5">
              <Smartphone className="h-3 w-3 mr-1" />
              {capacitorState.platform.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Pending Changes */}
          {syncState.pendingChanges > 0 && (
            <Badge 
              variant="secondary" 
              className={cn(
                'text-xs h-6 gap-1',
                !syncState.isOnline && 'bg-amber-500/10 text-amber-600'
              )}
            >
              <AlertCircle className="h-3 w-3" />
              {syncState.pendingChanges} pending
            </Badge>
          )}

          {/* Sync Button/Status */}
          {syncState.isSyncing ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>Syncing...</span>
            </div>
          ) : syncState.isOnline && syncState.pendingChanges > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSync}
              className="h-7 px-2 text-xs gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sync
            </Button>
          ) : syncState.lastSyncTime ? (
            <button
              onClick={handleSync}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              disabled={!syncState.isOnline}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span>{syncState.lastSyncTime.toLocaleTimeString()}</span>
            </button>
          ) : null}

          {/* Sync Errors */}
          {syncState.syncErrors.length > 0 && (
            <Badge variant="destructive" className="text-xs h-6">
              {syncState.syncErrors.length} errors
            </Badge>
          )}
        </div>
      </div>

      {/* Offline Mode Warning Banner */}
      {!syncState.isOnline && (
        <div className="px-3 py-1.5 bg-amber-500/10 border-t border-amber-500/20">
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
            <CloudOff className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="flex-1">
              Offline mode • Record, edit & arrange clips • AI features resume when online
            </span>
            {syncState.pendingChanges > 0 && (
              <span className="text-amber-600 font-medium">
                {syncState.pendingChanges} to sync
              </span>
            )}
          </div>
        </div>
      )}

      {/* Online Success Banner (when just came back online with pending) */}
      {syncState.isOnline && syncState.pendingChanges > 0 && !syncState.isSyncing && (
        <div className="px-3 py-1.5 bg-green-500/10 border-t border-green-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Cloud className="h-3.5 w-3.5" />
              Back online! {syncState.pendingChanges} items ready to sync
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSync}
              className="h-6 px-2 text-xs text-green-700 hover:text-green-800 hover:bg-green-500/20"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
