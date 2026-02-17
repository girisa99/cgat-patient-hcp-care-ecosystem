/**
 * Offline Studio Mode Component
 * Shows what features work offline vs online, handles sync when back online
 * P1 Feature: Full offline recording capability with auto-sync
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  HardDrive,
  Smartphone,
  Video,
  Mic,
  Music,
  Scissors,
  Type,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { toast } from 'sonner';

export interface OfflineFeature {
  id: string;
  name: string;
  icon: React.ReactNode;
  availableOffline: boolean;
  description: string;
  category: 'recording' | 'editing' | 'audio' | 'ai' | 'export';
}

export interface PendingItem {
  id: string;
  type: 'recording' | 'project' | 'export' | 'settings';
  name: string;
  size?: string;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'synced' | 'error';
}

interface OfflineStudioModeProps {
  className?: string;
  onSyncComplete?: () => void;
  compact?: boolean;
}

// Define what works offline vs online
const OFFLINE_FEATURES: OfflineFeature[] = [
  // OFFLINE AVAILABLE ✅
  { id: 'video-record', name: 'Video Recording', icon: <Video className="h-4 w-4" />, availableOffline: true, description: 'Record video with device camera', category: 'recording' },
  { id: 'audio-record', name: 'Audio Recording', icon: <Mic className="h-4 w-4" />, availableOffline: true, description: 'Record voiceovers and audio', category: 'recording' },
  { id: 'photo-capture', name: 'Photo Capture', icon: <Smartphone className="h-4 w-4" />, availableOffline: true, description: 'Take photos for thumbnails', category: 'recording' },
  { id: 'clip-trimming', name: 'Clip Trimming', icon: <Scissors className="h-4 w-4" />, availableOffline: true, description: 'Trim and cut video clips', category: 'editing' },
  { id: 'timeline-arrange', name: 'Timeline Arrange', icon: <Layers className="h-4 w-4" />, availableOffline: true, description: 'Arrange clips on timeline', category: 'editing' },
  { id: 'text-overlay', name: 'Text Overlays', icon: <Type className="h-4 w-4" />, availableOffline: true, description: 'Add text to videos', category: 'editing' },
  { id: 'local-music', name: 'Local Music', icon: <Music className="h-4 w-4" />, availableOffline: true, description: 'Use downloaded/cached music', category: 'audio' },
  { id: 'local-export', name: 'Local Export', icon: <Download className="h-4 w-4" />, availableOffline: true, description: 'Export to device storage', category: 'export' },
  
  // ONLINE REQUIRED 🔒
  { id: 'ai-scripts', name: 'AI Script Generation', icon: <Sparkles className="h-4 w-4" />, availableOffline: false, description: 'Generate scripts with AI', category: 'ai' },
  { id: 'ai-tts', name: 'AI Text-to-Speech', icon: <Mic className="h-4 w-4" />, availableOffline: false, description: 'Generate voiceovers with AI', category: 'ai' },
  { id: 'cloud-sync', name: 'Cloud Sync', icon: <Cloud className="h-4 w-4" />, availableOffline: false, description: 'Sync projects to cloud', category: 'export' },
  { id: 'stream-music', name: 'Stream Music Library', icon: <Music className="h-4 w-4" />, availableOffline: false, description: 'Access full music catalog', category: 'audio' },
  { id: 'social-export', name: 'Direct Social Upload', icon: <Upload className="h-4 w-4" />, availableOffline: false, description: 'Upload to TikTok, YouTube', category: 'export' },
];

export const OfflineStudioMode: React.FC<OfflineStudioModeProps> = ({
  className,
  onSyncComplete,
  compact = false
}) => {
  const { state: syncState, syncNow, queueChange, getQueuedItems } = useOfflineSync();
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [localStorageUsed, setLocalStorageUsed] = useState(0);
  const [showFeatureList, setShowFeatureList] = useState(false);

  // Calculate local storage usage
  useEffect(() => {
    const calculateStorage = () => {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length * 2; // UTF-16 = 2 bytes per char
        }
      }
      setLocalStorageUsed(total);
    };
    calculateStorage();
    
    // Update periodically
    const interval = setInterval(calculateStorage, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get pending items from sync queue
  useEffect(() => {
    const items = getQueuedItems();
    setPendingItems(items.map(item => ({
      id: item.id,
      type: item.table as PendingItem['type'],
      name: `${item.type} - ${item.table}`,
      timestamp: new Date(item.timestamp),
      status: 'pending'
    })));
  }, [syncState.pendingChanges, getQueuedItems]);

  // Handle manual sync
  const handleSync = useCallback(async () => {
    if (!syncState.isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }
    
    toast.info('Syncing your work to cloud...');
    await syncNow();
    onSyncComplete?.();
    toast.success('All changes synced!');
  }, [syncState.isOnline, syncNow, onSyncComplete]);

  // Auto-notify when back online
  useEffect(() => {
    if (syncState.isOnline && syncState.pendingChanges > 0) {
      toast.success(
        `You're back online! ${syncState.pendingChanges} items ready to sync.`,
        {
          action: {
            label: 'Sync Now',
            onClick: handleSync
          },
          duration: 10000
        }
      );
    }
  }, [syncState.isOnline]);

  const offlineFeatures = OFFLINE_FEATURES.filter(f => f.availableOffline);
  const onlineFeatures = OFFLINE_FEATURES.filter(f => !f.availableOffline);
  const storagePercent = Math.min((localStorageUsed / (5 * 1024 * 1024)) * 100, 100); // 5MB limit

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 p-2 rounded-lg', 
        syncState.isOnline ? 'bg-green-500/10' : 'bg-amber-500/10',
        className
      )}>
        {syncState.isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-amber-500" />
        )}
        <span className="text-xs font-medium">
          {syncState.isOnline ? 'Online - All Features' : 'Offline - Limited Features'}
        </span>
        {syncState.pendingChanges > 0 && (
          <Badge variant="secondary" className="text-xs">
            {syncState.pendingChanges} pending
          </Badge>
        )}
        {syncState.isOnline && syncState.pendingChanges > 0 && (
          <Button size="sm" variant="ghost" onClick={handleSync} className="h-6 px-2">
            <RefreshCw className={cn('h-3 w-3', syncState.isSyncing && 'animate-spin')} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {syncState.isOnline ? (
              <Cloud className="h-5 w-5 text-green-500" />
            ) : (
              <CloudOff className="h-5 w-5 text-amber-500" />
            )}
            <span>{syncState.isOnline ? 'Online Mode' : 'Offline Mode'}</span>
          </div>
          <Badge variant={syncState.isOnline ? 'default' : 'secondary'}>
            {syncState.isOnline ? 'Full Access' : 'Limited'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Summary */}
        <div className={cn(
          'p-3 rounded-lg border',
          syncState.isOnline ? 'bg-green-500/5 border-green-500/20' : 'bg-amber-500/5 border-amber-500/20'
        )}>
          <div className="flex items-start gap-3">
            {syncState.isOnline ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">
                {syncState.isOnline 
                  ? 'All features available' 
                  : 'Recording & editing work offline'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {syncState.isOnline 
                  ? 'AI features, cloud sync, and social uploads are active.'
                  : 'AI features and cloud sync will resume when online.'}
              </p>
            </div>
          </div>
        </div>

        {/* Offline Features */}
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-between h-8 px-2"
            onClick={() => setShowFeatureList(!showFeatureList)}
          >
            <span className="text-sm font-medium">Feature Availability</span>
            <Badge variant="outline" className="text-xs">
              {offlineFeatures.length} offline / {onlineFeatures.length} online
            </Badge>
          </Button>
          
          {showFeatureList && (
            <ScrollArea className="h-48">
              <div className="space-y-1 p-2">
                <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1">
                  <Unlock className="h-3 w-3 text-green-500" /> Works Offline
                </p>
                {offlineFeatures.map(feature => (
                  <div key={feature.id} className="flex items-center gap-2 p-1.5 rounded bg-green-500/5">
                    <span className="text-green-500">{feature.icon}</span>
                    <span className="text-xs">{feature.name}</span>
                  </div>
                ))}
                
                <p className="text-xs text-muted-foreground font-medium mt-3 mb-2 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-amber-500" /> Requires Internet
                </p>
                {onlineFeatures.map(feature => (
                  <div key={feature.id} className={cn(
                    'flex items-center gap-2 p-1.5 rounded',
                    syncState.isOnline ? 'bg-muted/50' : 'bg-amber-500/5 opacity-60'
                  )}>
                    <span className={syncState.isOnline ? 'text-primary' : 'text-amber-500'}>
                      {feature.icon}
                    </span>
                    <span className="text-xs">{feature.name}</span>
                    {!syncState.isOnline && <Lock className="h-3 w-3 ml-auto text-amber-500" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Pending Sync Items */}
        {syncState.pendingChanges > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Sync ({syncState.pendingChanges})
              </span>
              {syncState.isOnline && (
                <Button 
                  size="sm" 
                  onClick={handleSync}
                  disabled={syncState.isSyncing}
                >
                  {syncState.isSyncing ? (
                    <><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Syncing...</>
                  ) : (
                    <><Upload className="h-3 w-3 mr-1" /> Sync Now</>
                  )}
                </Button>
              )}
            </div>
            
            {pendingItems.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-xs">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                <span className="flex-1 truncate">{item.name}</span>
                <span className="text-muted-foreground">
                  {item.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
            
            {pendingItems.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{pendingItems.length - 3} more items
              </p>
            )}
          </div>
        )}

        {/* Local Storage Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Local Storage
            </span>
            <span className="text-muted-foreground">
              {(localStorageUsed / 1024).toFixed(1)} KB / 5 MB
            </span>
          </div>
          <Progress value={storagePercent} className="h-2" />
          {storagePercent > 80 && (
            <p className="text-xs text-amber-500">
              Storage nearly full. Sync to cloud to free space.
            </p>
          )}
        </div>

        {/* Sync Status */}
        {syncState.lastSyncTime && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last synced</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {syncState.lastSyncTime.toLocaleString()}
            </span>
          </div>
        )}

        {/* Sync Errors */}
        {syncState.syncErrors.length > 0 && (
          <div className="p-2 rounded bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive font-medium">
              {syncState.syncErrors.length} sync error(s)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Will retry automatically when online
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfflineStudioMode;
