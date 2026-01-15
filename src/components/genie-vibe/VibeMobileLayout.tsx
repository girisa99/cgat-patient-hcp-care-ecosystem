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
import BulkQueueStatusMobile from '@/components/bulk-processing/BulkQueueStatusMobile';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Video, 
  Scissors, 
  Upload,
  ArrowLeft,
  Monitor,
  Smartphone,
  Share2,
  Download,
  FileText,
  Sparkles,
  Play,
  RotateCcw,
  Trash2,
  Camera,
  Mic,
  ScreenShare,
  MessageCircle,
  Layers,
  Music,
  Wand2,
  Shuffle,
  Save,
  CloudOff,
  Check,
  Image,
  ExternalLink,
  Link2,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Globe,
  Settings,
  Loader2
} from 'lucide-react';
import { AskGenie } from '@/components/genie-studio/AskGenie';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import { useVibeThumbnails } from '@/hooks/useVibeThumbnails';
import { useVibeProductionSync } from '@/hooks/useVibeProductionSync';
import { useVibeSocialPublish, type SocialPlatform } from '@/hooks/useVibeSocialPublish';

// Core mobile components
import { 
  MobileStatusBar,
  OneTapRecordButton,
  QuickClipsGenerator,
  MultiClipTimeline,
  PWAInstallPrompt,
  TimelineClipEditor
} from '@/components/mobile';
import type { RecordingResult as MobileRecordingResult } from '@/components/mobile/OneTapRecordButton';
import type { TimelineClip } from '@/components/mobile/MultiClipTimeline';

// Compatible recording result - allows timestamp to be optional for parent compatibility
export interface RecordingResult {
  id: string;
  url?: string;
  duration?: number;
  type: 'video' | 'audio' | 'photo';
  name?: string;
  thumbnailUrl?: string;
  timestamp?: number;
  blob?: Blob;
}

interface VibeMobileLayoutProps {
  onSwitchToDesktop?: () => void;
  onRecordingComplete?: (result: RecordingResult) => void;
  scripts?: Array<{ id: string; title: string; content: string }>;
  className?: string;
  // Shared state from parent (to preserve session between desktop/mobile)
  initialRecordings?: RecordingResult[];
  initialTimelineClips?: TimelineClip[];
  onRecordingsChange?: (recordings: RecordingResult[]) => void;
  onTimelineClipsChange?: (clips: TimelineClip[]) => void;
}

type SimplifiedTab = 'record' | 'edit' | 'export';
type RecordingMode = 'camera' | 'screen' | 'audio' | 'both';

export const VibeMobileLayout: React.FC<VibeMobileLayoutProps> = ({
  onSwitchToDesktop,
  onRecordingComplete,
  scripts = [],
  className,
  initialRecordings = [],
  initialTimelineClips = [],
  onRecordingsChange,
  onTimelineClipsChange
}) => {
  const { state: syncState, syncNow, getQueuedItems } = useOfflineSync();
  const { isOnline, shareContent, vibrate } = useMobileFeatures();
  
  // New hooks for thumbnails, production sync, and social publishing
  const { isGenerating: isGeneratingThumbnail, generateThumbnail } = useVibeThumbnails();
  const { isSyncing: isSyncingToHub, syncToProductionHub, getAvailableShows } = useVibeProductionSync();
  const { isPublishing, publishTo, suggestHashtags, getCharacterLimit, setN8nWebhook, triggerN8nWorkflow } = useVibeSocialPublish();
  
  // Simplified 3-tab state - initialize from parent's state
  const [activeTab, setActiveTab] = useState<SimplifiedTab>('record');
  const [recordings, setRecordingsInternal] = useState<RecordingResult[]>(initialRecordings);
  const [timelineClips, setTimelineClipsInternal] = useState<TimelineClip[]>(initialTimelineClips);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('camera');
  
  // Publish state
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishCaption, setPublishCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [availableShows, setAvailableShows] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedShowId, setSelectedShowId] = useState<string>('');
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState<string>('');
  const [showN8nConfig, setShowN8nConfig] = useState(false);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);

  // Wrapped setters that also notify parent
  const setRecordings = useCallback((updater: RecordingResult[] | ((prev: RecordingResult[]) => RecordingResult[])) => {
    setRecordingsInternal(prev => {
      const newVal = typeof updater === 'function' ? updater(prev) : updater;
      onRecordingsChange?.(newVal);
      return newVal;
    });
  }, [onRecordingsChange]);

  const setTimelineClips = useCallback((updater: TimelineClip[] | ((prev: TimelineClip[]) => TimelineClip[])) => {
    setTimelineClipsInternal(prev => {
      const newVal = typeof updater === 'function' ? updater(prev) : updater;
      onTimelineClipsChange?.(newVal);
      return newVal;
    });
  }, [onTimelineClipsChange]);
  
  // Auto-sync when coming back online
  useEffect(() => {
    if (syncState.isOnline && syncState.pendingChanges > 0 && !syncState.isSyncing) {
      toast.info('Syncing your offline work...');
      syncNow();
    }
  }, [syncState.isOnline, syncState.pendingChanges, syncState.isSyncing, syncNow]);

  // Handle recording completion - converts from OneTapRecordButton format
  const handleRecordingComplete = useCallback((result: MobileRecordingResult) => {
    const convertedResult: RecordingResult = { ...result };
    setRecordings(prev => [convertedResult, ...prev]);
    
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
    onRecordingComplete?.(convertedResult);
    
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
        paddingTop: 'env(safe-area-inset-top, 0px)',
        height: '100dvh',
        maxHeight: '-webkit-fill-available'
      }}
    >
      {/* Mobile Status Bar with Offline Indicator & Sync Queue */}
      <MobileStatusBar className="flex-shrink-0" showDetails={true} />

      {/* Responsive Header - Clean mobile-first design */}
      <div className="border-b bg-card flex-shrink-0 px-2 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 flex-shrink-0" 
              onClick={onSwitchToDesktop}
              title="Back to Genie Studio"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border flex items-center justify-center flex-shrink-0">
                <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <h1 className="font-semibold text-sm sm:text-base truncate">
                Vibe Studio
              </h1>
            </div>
          </div>
          
          {/* Right: Compact controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Sync status - icon only on mobile */}
            {recordings.length > 0 && (
              <div className="flex items-center">
                {!syncState.isOnline ? (
                  <CloudOff className="h-4 w-4 text-amber-500" />
                ) : syncState.isSyncing ? (
                  <Save className="h-4 w-4 animate-pulse text-primary" />
                ) : (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            )}
            
            {/* Desktop toggle - single button on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2 p-0"
              onClick={onSwitchToDesktop}
              title="Switch to Desktop"
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5 text-xs">Desktop</span>
            </Button>
            
            {/* Clip count badge */}
            <Badge variant="secondary" className="h-7 px-2 text-xs">
              {recordings.length}
            </Badge>
          </div>
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
                {/* Script Selector with Label */}
                <Card>
                  <CardContent className="py-3 px-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Teleprompter Script
                      </label>
                      <Select
                        value={selectedScriptId || '__none__'}
                        onValueChange={(value) => setSelectedScriptId(value === '__none__' ? null : value)}
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="No script selected" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64 z-50 bg-popover border shadow-lg">
                          <SelectItem value="__none__">No script</SelectItem>
                          {scripts.length > 0 ? (
                            scripts.filter(s => s.id).map(script => (
                              <SelectItem key={script.id} value={script.id}>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] px-1">
                                    {script.title?.toLowerCase().includes('video') ? 'Video' : 
                                     script.title?.toLowerCase().includes('audio') ? 'Audio' : 'Script'}
                                  </Badge>
                                  {script.title || 'Untitled'}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">
                              No scripts available. Create in Desktop mode.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

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

                {/* Primary Recording Area */}
                <div className="flex flex-col items-center justify-center py-6 space-y-5">
                  {/* Mode Selector - 4 options including Both (PiP) */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button 
                      variant={recordingMode === 'camera' ? 'default' : 'outline'} 
                      size="sm" 
                      className="gap-1.5"
                      onClick={() => setRecordingMode('camera')}
                    >
                      <Camera className="h-4 w-4" />
                      Camera
                    </Button>
                    <Button 
                      variant={recordingMode === 'screen' ? 'default' : 'outline'} 
                      size="sm" 
                      className="gap-1.5"
                      onClick={() => setRecordingMode('screen')}
                    >
                      <ScreenShare className="h-4 w-4" />
                      Screen
                    </Button>
                    <Button 
                      variant={recordingMode === 'both' ? 'default' : 'outline'} 
                      size="sm" 
                      className="gap-1.5"
                      onClick={() => setRecordingMode('both')}
                    >
                      <Layers className="h-4 w-4" />
                      Both
                    </Button>
                    <Button 
                      variant={recordingMode === 'audio' ? 'default' : 'outline'} 
                      size="sm" 
                      className="gap-1.5"
                      onClick={() => setRecordingMode('audio')}
                    >
                      <Mic className="h-4 w-4" />
                      Audio
                    </Button>
                  </div>

                  {/* Mode Description */}
                  <p className="text-xs text-muted-foreground text-center px-4">
                    {recordingMode === 'camera' && 'Record with front or back camera'}
                    {recordingMode === 'screen' && 'Capture your screen activity'}
                    {recordingMode === 'both' && 'Screen + Camera Picture-in-Picture'}
                    {recordingMode === 'audio' && 'Audio only recording'}
                  </p>

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

            {/* ===== EDIT TAB - Sequential Journey Flow ===== */}
            <TabsContent value="edit" className="h-full m-0 overflow-auto pb-20">
              <div className="p-3 space-y-4">
                {timelineClips.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
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
                    {/* STEP 1: Clip Overview */}
                    <Card className="border-primary/30">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-primary text-primary-foreground text-[10px]">Step 1</Badge>
                          <span className="text-sm font-medium">Your Clips</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{timelineClips.length} clips</Badge>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(totalDuration)}s total
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Preview All">
                              <Play className="h-4 w-4" />
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

                    {/* STEP 2: Arrange & Organize */}
                    <Card>
                      <CardContent className="py-3 px-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">Step 2</Badge>
                          <span className="text-sm font-medium">Arrange & Organize</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-auto py-3 flex-col gap-1.5"
                            onClick={() => toast.info('Drag clips in timeline to reorder')}
                          >
                            <Shuffle className="h-4 w-4 text-primary" />
                            <span className="text-[10px]">Reorder</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-auto py-3 flex-col gap-1.5"
                            onClick={() => toast.info('Select 2+ clips to merge')}
                            disabled={timelineClips.length < 2}
                          >
                            <Layers className="h-4 w-4 text-primary" />
                            <span className="text-[10px]">Merge</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-auto py-3 flex-col gap-1.5 text-destructive hover:text-destructive"
                            onClick={() => {
                              if (selectedClipId) {
                                setTimelineClips(prev => prev.filter(c => c.id !== selectedClipId));
                                setSelectedClipId(null);
                                toast.success('Clip deleted');
                              } else {
                                toast.info('Select a clip first');
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="text-[10px]">Delete</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* STEP 3: Trim & Split */}
                    <Card>
                      <CardContent className="py-3 px-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">Step 3</Badge>
                            <span className="text-sm font-medium">Trim & Refine</span>
                          </div>
                          {!selectedClipId && (
                            <span className="text-[10px] text-muted-foreground">Select a clip</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant={selectedClipId ? "default" : "outline"} 
                            size="sm" 
                            className="h-auto py-3 flex-col gap-1.5"
                            disabled={!selectedClipId}
                            onClick={() => toast.info('Drag clip edges to trim')}
                          >
                            <Scissors className="h-4 w-4" />
                            <span className="text-[10px]">Trim Clip</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-auto py-3 flex-col gap-1.5"
                            disabled={!selectedClipId}
                            onClick={() => toast.info('Split clip at current position')}
                          >
                            <div className="flex items-center gap-0.5">
                              <Scissors className="h-3 w-3" />
                              <Scissors className="h-3 w-3 -scale-x-100" />
                            </div>
                            <span className="text-[10px]">Split</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* STEP 4: Enhance & Effects (AI Features) */}
                    <Card className={cn(!isOnline && "opacity-60")}>
                      <CardContent className="py-3 px-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">Step 4</Badge>
                            <span className="text-sm font-medium">Enhance</span>
                            <Sparkles className="h-3 w-3 text-primary" />
                          </div>
                          {!isOnline && (
                            <Badge variant="outline" className="text-[10px]">Needs Online</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-auto py-3 flex-col gap-1.5"
                            disabled={!isOnline}
                            onClick={() => toast.info('AI enhancement coming soon')}
                          >
                            <Wand2 className="h-4 w-4 text-primary" />
                            <span className="text-[10px]">AI Enhance</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-auto py-3 flex-col gap-1.5"
                            disabled={!isOnline}
                            onClick={() => toast.info('AI auto-arrange coming soon')}
                          >
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-[10px]">AI Arrange</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* STEP 5: Add Audio */}
                    <Card>
                      <CardContent className="py-3 px-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">Step 5</Badge>
                          <span className="text-sm font-medium">Add Audio</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-auto py-3 flex-col gap-1.5"
                            onClick={() => toast.info('Add background music')}
                          >
                            <Music className="h-4 w-4 text-primary" />
                            <span className="text-[10px]">Music</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-auto py-3 flex-col gap-1.5"
                            onClick={() => toast.info('Record voiceover')}
                          >
                            <MessageCircle className="h-4 w-4 text-primary" />
                            <span className="text-[10px]">Voiceover</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Quick Clips - Optional */}
                    <details className="group">
                      <summary className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">AI Quick Clips</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {isOnline ? 'Optional' : 'Offline'}
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

                    {/* Desktop Features Notice */}
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-xs font-medium">More on Desktop</p>
                              <p className="text-[10px] text-muted-foreground">
                                Transitions, TTS, Location Story
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={onSwitchToDesktop}
                          >
                            <Monitor className="h-3 w-3" />
                            Switch
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>

            {/* ===== EXPORT TAB ===== */}
            <TabsContent value="export" className="h-full m-0 overflow-auto">
              <div className="p-4 space-y-4">
                {/* Thumbnail Preview Card */}
                <Card>
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {currentThumbnail || (recordings[0]?.thumbnailUrl) ? (
                          <img 
                            src={currentThumbnail || recordings[0]?.thumbnailUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-1 right-1 h-6 w-6"
                          onClick={async () => {
                            const result = await generateThumbnail({
                              title: `Recording ${recordings.length}`,
                              style: 'youtube'
                            });
                            if (result?.thumbnailUrl) {
                              setCurrentThumbnail(result.thumbnailUrl);
                            }
                          }}
                          disabled={isGeneratingThumbnail || !isOnline}
                        >
                          {isGeneratingThumbnail ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Image className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex-1">
                        <div className="text-2xl font-bold">{timelineClips.length} clips</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(totalDuration)}s duration
                        </div>
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
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Local Export
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-auto py-3 flex-col gap-1.5"
                      onClick={() => handleExport('mp4')}
                      disabled={isExporting || timelineClips.length === 0}
                    >
                      <Download className="h-4 w-4" />
                      <span className="font-medium text-sm">MP4</span>
                      <span className="text-[10px] text-muted-foreground">Best quality</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-3 flex-col gap-1.5"
                      onClick={() => handleExport('webm')}
                      disabled={isExporting || timelineClips.length === 0}
                    >
                      <Download className="h-4 w-4" />
                      <span className="font-medium text-sm">WebM</span>
                      <span className="text-[10px] text-muted-foreground">Smaller size</span>
                    </Button>
                  </div>
                </div>

                {/* Production Hub Sync */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Production Hub
                  </h3>
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="py-3 px-4 space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Sync to Production Hub for post-production, publishing, and team collaboration.
                      </p>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="w-full gap-2"
                        onClick={async () => {
                          const shows = await getAvailableShows();
                          setAvailableShows(shows);
                          setShowPublishDialog(true);
                        }}
                        disabled={!isOnline || timelineClips.length === 0 || isSyncingToHub}
                      >
                        {isSyncingToHub ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                        Sync to Production Hub
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Social Publish */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Social Publish
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowN8nConfig(true)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {(['youtube', 'instagram', 'tiktok'] as SocialPlatform[]).map(platform => (
                      <Button
                        key={platform}
                        variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                        size="sm"
                        className="h-auto py-2 flex-col gap-1"
                        onClick={() => {
                          setSelectedPlatforms(prev => 
                            prev.includes(platform) 
                              ? prev.filter(p => p !== platform)
                              : [...prev, platform]
                          );
                        }}
                        disabled={!isOnline}
                      >
                        {platform === 'youtube' && <Youtube className="h-4 w-4" />}
                        {platform === 'instagram' && <Instagram className="h-4 w-4" />}
                        {platform === 'tiktok' && <Globe className="h-4 w-4" />}
                        <span className="text-[10px] capitalize">{platform}</span>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {(['twitter', 'linkedin', 'facebook'] as SocialPlatform[]).map(platform => (
                      <Button
                        key={platform}
                        variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                        size="sm"
                        className="h-auto py-2 flex-col gap-1"
                        onClick={() => {
                          setSelectedPlatforms(prev => 
                            prev.includes(platform) 
                              ? prev.filter(p => p !== platform)
                              : [...prev, platform]
                          );
                        }}
                        disabled={!isOnline}
                      >
                        {platform === 'twitter' && <Twitter className="h-4 w-4" />}
                        {platform === 'linkedin' && <Linkedin className="h-4 w-4" />}
                        {platform === 'facebook' && <Globe className="h-4 w-4" />}
                        <span className="text-[10px] capitalize">{platform}</span>
                      </Button>
                    ))}
                  </div>

                  {selectedPlatforms.length > 0 && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add caption..."
                        value={publishCaption}
                        onChange={(e) => setPublishCaption(e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const hashtags = suggestHashtags(`Recording ${recordings.length}`);
                            setPublishCaption(prev => prev + ' ' + hashtags.join(' '));
                          }}
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          Add Hashtags
                        </Button>
                        <span className="text-[10px] text-muted-foreground">
                          {publishCaption.length}/{getCharacterLimit(selectedPlatforms[0] || 'youtube')}
                        </span>
                      </div>
                      <Button 
                        className="w-full gap-2"
                        onClick={async () => {
                          for (const platform of selectedPlatforms) {
                            await publishTo(
                              {
                                id: recordings[0]?.id || 'new',
                                title: `Recording ${recordings.length}`,
                                status: 'completed',
                                recording_type: 'video',
                                file_url: recordings[0]?.url,
                                thumbnail_url: currentThumbnail || recordings[0]?.thumbnailUrl,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                              },
                              { platform, caption: publishCaption }
                            );
                          }
                          setSelectedPlatforms([]);
                          setPublishCaption('');
                        }}
                        disabled={isPublishing || !publishCaption}
                      >
                        {isPublishing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                        Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length > 1 ? 's' : ''}
                      </Button>
                    </div>
                  )}
                  
                  {!isOnline && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CloudOff className="h-3 w-3" />
                      Social publish requires internet connection
                    </div>
                  )}
                </div>

                {/* Quick Share (Native) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Quick Share</h3>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={handleShare}
                    disabled={timelineClips.length === 0}
                  >
                    <Share2 className="h-4 w-4" />
                    Share via Device
                  </Button>
                </div>

                {/* Bulk Queue Status - P3 Feature */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Bulk Processing
                  </h3>
                  <BulkQueueStatusMobile />
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

          {/* Bottom Navigation - Fixed at bottom */}
          <div 
            className="flex-shrink-0 border-t bg-card"
            style={{ 
              paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)'
            }}
          >
            <TabsList className="h-14 rounded-none bg-transparent grid grid-cols-3 w-full border-0 gap-0">
              <TabsTrigger 
                value="record" 
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full border-0"
              >
                <Video className="h-5 w-5" />
                <span className="text-[11px] font-medium">Record</span>
              </TabsTrigger>
              <TabsTrigger 
                value="edit" 
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full relative border-0"
              >
                <Scissors className="h-5 w-5" />
                <span className="text-[11px] font-medium">Edit</span>
                {timelineClips.length > 0 && (
                  <Badge 
                    variant="default" 
                    className="absolute top-0.5 right-[20%] h-4 min-w-4 px-1 text-[10px] flex items-center justify-center bg-primary"
                  >
                    {timelineClips.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="export" 
                className="flex flex-col items-center justify-center gap-0.5 py-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full border-0"
              >
                <Upload className="h-5 w-5" />
                <span className="text-[11px] font-medium">Export</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Ask Genie - Context-aware AI assistant (works on mobile) */}
      <AskGenie 
        product="vibe" 
        currentTab={activeTab}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt variant="banner" showOnMount={true} />
    </div>
  );
};
