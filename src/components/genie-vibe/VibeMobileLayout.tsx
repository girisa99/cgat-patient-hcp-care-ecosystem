/**
 * VibeMobileLayout - Streamlined 3-Tab Mobile Experience
 * 
 * Implementation of mobile UX improvements:
 * 1. Auto-detected on mobile devices
 * 2. Offline status indicator (MobileStatusBar)
 * 3. Simplified 3-tab navigation: Record | Edit | Export
 * 4. Sync queue visibility with auto-sync
 * 
 * Critical mobile features (P0): One-tap record, camera capture, preview, local storage
 * Important features (P1): Clip trimming, timeline, text overlays, local export
 * Enhanced features (P2/Online): AI scripts, TTS, cloud sync, social upload
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Video, 
  Scissors, 
  Upload,
  ArrowLeft,
  Monitor,
  Share2,
  Download,
  FileText,
  Sparkles,
  Play,
  RotateCcw,
  Trash2,
  Camera,
  Mic,
  ScreenShare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

// Core mobile components
import { 
  MobileStatusBar,
  OneTapRecordButton,
  QuickClipsGenerator,
  MultiClipTimeline,
  PWAInstallPrompt,
  TimelineClipEditor
} from '@/components/mobile';
import type { RecordingResult } from '@/components/mobile/OneTapRecordButton';
import type { TimelineClip } from '@/components/mobile/MultiClipTimeline';

interface VibeMobileLayoutProps {
  onSwitchToDesktop?: () => void;
  onRecordingComplete?: (result: RecordingResult) => void;
  scripts?: Array<{ id: string; title: string; content: string }>;
  className?: string;
}

type SimplifiedTab = 'record' | 'edit' | 'export';

export const VibeMobileLayout: React.FC<VibeMobileLayoutProps> = ({
  onSwitchToDesktop,
  onRecordingComplete,
  scripts = [],
  className
}) => {
  const navigate = useNavigate();
  const { state: syncState, syncNow, getQueuedItems } = useOfflineSync();
  const { isOnline, shareContent, vibrate } = useMobileFeatures();
  
  // Simplified 3-tab state
  const [activeTab, setActiveTab] = useState<SimplifiedTab>('record');
  const [recordings, setRecordings] = useState<RecordingResult[]>([]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  // Auto-sync when coming back online
  useEffect(() => {
    if (syncState.isOnline && syncState.pendingChanges > 0 && !syncState.isSyncing) {
      toast.info('Syncing your offline work...');
      syncNow();
    }
  }, [syncState.isOnline, syncState.pendingChanges, syncState.isSyncing, syncNow]);

  // Handle recording completion
  const handleRecordingComplete = useCallback((result: RecordingResult) => {
    setRecordings(prev => [result, ...prev]);
    
    // Auto-create timeline clip
    const newClip: TimelineClip = {
      id: result.id,
      type: result.type === 'photo' ? 'image' : result.type,
      name: `Recording ${recordings.length + 1}`,
      sourceUrl: result.url,
      thumbnailUrl: result.thumbnailUrl,
      startTime: timelineClips.length > 0 
        ? Math.max(...timelineClips.map(c => c.startTime + c.duration)) + 0.5
        : 0,
      duration: result.duration || 5,
      inPoint: 0,
      outPoint: result.duration || 5,
      track: result.type === 'audio' ? 1 : 0,
      volume: 1,
      opacity: 1,
    };
    
    setTimelineClips(prev => [...prev, newClip]);
    onRecordingComplete?.(result);
    
    vibrate?.(100);
    toast.success('Recording saved!', {
      action: {
        label: 'Edit',
        onClick: () => setActiveTab('edit')
      }
    });
  }, [recordings.length, timelineClips, onRecordingComplete, vibrate]);

  // Export handler
  const handleExport = useCallback(async (format: string) => {
    if (timelineClips.length === 0) {
      toast.error('No clips to export');
      return;
    }
    
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportProgress(i);
      }
      
      vibrate?.(500);
      toast.success(`Exported ${timelineClips.length} clips as ${format}!`);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [timelineClips.length, vibrate]);

  // Share handler
  const handleShare = useCallback(async () => {
    const success = await shareContent({
      title: 'My Genie Vibe Video',
      text: `Check out my video with ${recordings.length} recordings!`,
      url: window.location.href
    });
    
    if (success) {
      toast.success('Shared successfully!');
    }
  }, [recordings.length, shareContent]);

  const selectedScript = scripts.find(s => s.id === selectedScriptId);
  const totalDuration = timelineClips.reduce((acc, c) => acc + c.duration, 0);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-background flex flex-col overflow-hidden",
        className
      )}
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        height: '100dvh'
      }}
    >
      {/* Mobile Status Bar with Offline Indicator & Sync Queue */}
      <MobileStatusBar className="flex-shrink-0" showDetails={true} />

      {/* Compact Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => navigate('/genie-studio')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Vibe Studio</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onSwitchToDesktop && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 text-xs gap-1"
              onClick={onSwitchToDesktop}
            >
              <Monitor className="h-3 w-3" />
              Desktop
            </Button>
          )}
          
          {/* Recordings count */}
          <Badge variant="secondary" className="h-6 text-xs">
            {recordings.length} clips
          </Badge>
        </div>
      </div>

      {/* Main Content - 3 Tab System */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SimplifiedTab)} className="h-full flex flex-col">
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* ===== RECORD TAB ===== */}
            <TabsContent value="record" className="h-full m-0 overflow-auto">
              <div className="p-4 space-y-4">
                {/* Script Selector (if available) */}
                {scripts.length > 0 && (
                  <Card>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <Select
                          value={selectedScriptId || '__none__'}
                          onValueChange={(value) => setSelectedScriptId(value === '__none__' ? null : value)}
                        >
                          <SelectTrigger className="flex-1 bg-background">
                            <SelectValue placeholder="Select script for teleprompter..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            <SelectItem value="__none__">No script</SelectItem>
                            {scripts.filter(s => s.id).map(script => (
                              <SelectItem key={script.id} value={script.id}>
                                {script.title || 'Untitled'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Script Preview (collapsed by default) */}
                {selectedScript && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <ScrollArea className="h-20">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {selectedScript.content}
                        </p>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Primary Recording Area - 60% viewport */}
                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                  {/* Mode Selector */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Camera
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ScreenShare className="h-4 w-4" />
                      Screen
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Mic className="h-4 w-4" />
                      Audio
                    </Button>
                  </div>

                  {/* One-Tap Record Button */}
                  <OneTapRecordButton
                    variant="floating"
                    onRecordingComplete={handleRecordingComplete}
                    onRecordingStart={() => vibrate?.(100)}
                  />
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Tap to start • Hold for photo
                  </p>
                </div>

                {/* Recent Recordings Thumbnails */}
                {recordings.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Recent Recordings</span>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-xs"
                        onClick={() => setActiveTab('edit')}
                      >
                        View All →
                      </Button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {recordings.slice(0, 5).map((rec, i) => (
                        <div 
                          key={rec.id}
                          onClick={() => {
                            setSelectedClipId(rec.id);
                            setActiveTab('edit');
                          }}
                          className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        >
                          {rec.type === 'video' && <Video className="h-5 w-5 text-muted-foreground" />}
                          {rec.type === 'audio' && <Mic className="h-5 w-5 text-muted-foreground" />}
                          {rec.type === 'photo' && rec.url && (
                            <img src={rec.url} alt="" className="w-full h-full object-cover rounded-lg" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Offline Mode Notice */}
                {!isOnline && (
                  <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3 text-amber-600">
                        <Sparkles className="h-4 w-4 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Offline Mode Active</p>
                          <p className="text-xs text-muted-foreground">
                            Recording locally • AI features resume when online
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* ===== EDIT TAB ===== */}
            <TabsContent value="edit" className="h-full m-0 overflow-auto">
              <div className="p-3 space-y-3">
                {timelineClips.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Scissors className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium mb-1">No clips yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start recording to create clips for editing
                    </p>
                    <Button onClick={() => setActiveTab('record')}>
                      <Video className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Timeline Summary */}
                    <Card>
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{timelineClips.length} clips</Badge>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(totalDuration)}s total
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Timeline Clip Editor */}
                    <TimelineClipEditor
                      clips={timelineClips}
                      selectedClipId={selectedClipId}
                      currentTime={0}
                      onClipsChange={setTimelineClips}
                      onSelectClip={setSelectedClipId}
                      onSeek={() => {}}
                    />

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1">
                        <Scissors className="h-4 w-4" />
                        <span className="text-xs">Trim</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs">AI Arrange</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-2 flex-col gap-1 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (selectedClipId) {
                            setTimelineClips(prev => prev.filter(c => c.id !== selectedClipId));
                            setSelectedClipId(null);
                            toast.success('Clip deleted');
                          }
                        }}
                        disabled={!selectedClipId}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs">Delete</span>
                      </Button>
                    </div>

                    {/* Quick Clips Generator (collapsed) */}
                    <details className="group">
                      <summary className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                        <span className="text-sm font-medium">AI Quick Clips</span>
                        <Badge variant="secondary" className="text-xs">
                          {isOnline ? 'Available' : 'Offline'}
                        </Badge>
                      </summary>
                      <div className="mt-2">
                        <QuickClipsGenerator
                          sourceUrl={recordings[0]?.url}
                          sourceDuration={recordings[0]?.duration || 60}
                          onClipGenerated={(clip) => {
                            toast.success(`Generated: ${clip.suggestion.title}`);
                          }}
                        />
                      </div>
                    </details>
                  </>
                )}
              </div>
            </TabsContent>

            {/* ===== EXPORT TAB ===== */}
            <TabsContent value="export" className="h-full m-0 overflow-auto">
              <div className="p-4 space-y-4">
                {/* Export Summary */}
                <Card>
                  <CardContent className="py-4 px-4">
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-bold">{timelineClips.length}</div>
                      <div className="text-sm text-muted-foreground">
                        clips • {Math.round(totalDuration)}s duration
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Progress */}
                {isExporting && (
                  <Card className="border-primary/20">
                    <CardContent className="py-4 px-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Exporting...</span>
                        <span>{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="h-2" />
                    </CardContent>
                  </Card>
                )}

                {/* Export Options */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Export Format</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => handleExport('mp4')}
                      disabled={isExporting || timelineClips.length === 0}
                    >
                      <Download className="h-5 w-5" />
                      <span className="font-medium">MP4</span>
                      <span className="text-xs text-muted-foreground">Best quality</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => handleExport('webm')}
                      disabled={isExporting || timelineClips.length === 0}
                    >
                      <Download className="h-5 w-5" />
                      <span className="font-medium">WebM</span>
                      <span className="text-xs text-muted-foreground">Smaller size</span>
                    </Button>
                  </div>
                </div>

                {/* Social Share */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Share</h3>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={handleShare}
                    disabled={!isOnline || timelineClips.length === 0}
                  >
                    <Share2 className="h-4 w-4" />
                    Share to Social
                    {!isOnline && <Badge variant="secondary" className="ml-2 text-xs">Offline</Badge>}
                  </Button>
                </div>

                {/* Sync Status */}
                {syncState.pendingChanges > 0 && (
                  <Card className={cn(
                    "border",
                    syncState.isOnline ? "border-green-500/20 bg-green-500/5" : "border-amber-500/20 bg-amber-500/5"
                  )}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              syncState.isOnline ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                            )}
                          >
                            {syncState.pendingChanges} pending
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {syncState.isOnline ? 'Ready to sync' : 'Will sync when online'}
                          </span>
                        </div>
                        {syncState.isOnline && !syncState.isSyncing && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={syncNow}
                          >
                            Sync Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </div>

          {/* Simplified 3-Tab Bottom Navigation */}
          <div className="flex-shrink-0 border-t bg-card safe-area-bottom">
            <TabsList className="h-16 rounded-none bg-transparent grid grid-cols-3 w-full">
              <TabsTrigger 
                value="record" 
                className="flex flex-col gap-1 data-[state=active]:bg-primary/10 rounded-none h-full"
              >
                <Video className="h-5 w-5" />
                <span className="text-xs font-medium">Record</span>
              </TabsTrigger>
              <TabsTrigger 
                value="edit" 
                className="flex flex-col gap-1 data-[state=active]:bg-primary/10 rounded-none h-full relative"
              >
                <Scissors className="h-5 w-5" />
                <span className="text-xs font-medium">Edit</span>
                {timelineClips.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-1 right-1/4 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
                  >
                    {timelineClips.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="export" 
                className="flex flex-col gap-1 data-[state=active]:bg-primary/10 rounded-none h-full"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs font-medium">Export</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt variant="banner" showOnMount={true} />
    </div>
  );
};
