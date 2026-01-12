/**
 * Mobile Recording View
 * P1 Feature: Mobile-optimized recording interface for Genie Vibe
 * Integrates: OneTapRecord, QuickClips, MultiClipTimeline, ScriptStitcher, PWA
 * Differentiator: Only mobile solution with AI scripts + one-tap + stitch + remix
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Layers, 
  Sparkles, 
  Settings,
  Library,
  Mic,
  FileText,
  X,
  Maximize2,
  Minimize2,
  Zap,
  Share2,
  Download,
  Music,
  Monitor,
  ArrowLeft,
  Home,
  Camera,
  ScreenShare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

// Mobile Components
import { 
  OneTapRecordButton, 
  QuickClipsGenerator, 
  MultiClipTimeline,
  PWAInstallPrompt,
  MobileStatusBar,
  ScriptStitcher,
  QuickTemplates,
  VoiceCommands,
  OfflineStudioMode
} from '@/components/mobile';
import type { RecordingResult } from '@/components/mobile/OneTapRecordButton';
import type { TimelineClip } from '@/components/mobile/MultiClipTimeline';
import type { StitchedResult } from '@/components/mobile/ScriptStitcher';
import type { TemplateConfig } from '@/components/mobile/QuickTemplates';
import type { VoiceCommandResult } from '@/components/mobile/VoiceCommands';

interface MobileRecordingViewProps {
  isOpen?: boolean;
  onClose?: () => void;
  onRecordingComplete?: (result: RecordingResult) => void;
  onStitchComplete?: (result: StitchedResult) => void;
  scripts?: Array<{ id: string; title: string; content: string }>;
  music?: Array<{ id: string; name: string; url?: string; duration?: number }>;
  onSwitchToDesktop?: () => void;
  className?: string;
}

type MobileTab = 'record' | 'stitch' | 'clips' | 'timeline' | 'library' | 'templates' | 'voice';

export const MobileRecordingView: React.FC<MobileRecordingViewProps> = ({
  isOpen = true,
  onClose,
  onRecordingComplete,
  onStitchComplete,
  scripts = [],
  music = [],
  onSwitchToDesktop,
  className
}) => {
  const isMobile = useIsMobile();
  const { capabilities, isOnline, shareContent, vibrate } = useMobileFeatures();
  
  const [activeTab, setActiveTab] = useState<MobileTab>('record');
  const [recordings, setRecordings] = useState<RecordingResult[]>([]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);

  // Handle stitch completion
  const handleStitchComplete = useCallback((result: StitchedResult) => {
    onStitchComplete?.(result);
    toast.success(`Stitched ${result.segments.length} scripts (${Math.round(result.totalDuration)}s total)`);
    // Optionally switch to timeline to show the result
    setActiveTab('timeline');
  }, [onStitchComplete]);

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
    
    // Switch to clips tab to show the new recording
    vibrate?.(100);
    toast.success('Recording added to timeline!');
  }, [recordings.length, timelineClips, onRecordingComplete, vibrate]);

  // Export timeline
  const handleExport = useCallback(async (format: string) => {
    toast.info(`Exporting ${timelineClips.length} clips as ${format}...`);
    
    // In production, this would trigger actual export
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    vibrate?.(500);
    toast.success('Export complete! Check your downloads.');
  }, [timelineClips.length, vibrate]);

  // Share project
  const handleShare = useCallback(async () => {
    const success = await shareContent({
      title: 'My Genie Vibe Project',
      text: `Check out my video project with ${recordings.length} recordings!`,
      url: window.location.href
    });
    
    if (success) {
      toast.success('Shared successfully!');
    }
  }, [recordings.length, shareContent]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Get selected script for teleprompter
  const selectedScript = scripts.find(s => s.id === selectedScriptId);

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background flex flex-col overflow-hidden",
      isFullscreen && "bg-black",
      className
    )}
    style={{ 
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      height: '100dvh' // Use dynamic viewport height for mobile
    }}>
      {/* Mobile Status Bar */}
      <MobileStatusBar className="flex-shrink-0" />

      {/* Header - Compact for mobile with navigation - no shadow */}
      <div className="flex items-center justify-between px-2 py-2 border-b bg-card flex-shrink-0 min-h-[48px]">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {/* Back button - flat design */}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Video className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="font-semibold text-sm truncate">Vibe</span>
          <Badge variant="secondary" className="text-[9px] px-1 py-0 flex-shrink-0 hidden xs:inline-flex">
            <Sparkles className="h-2 w-2" />
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Desktop Switch button - icon only on very small screens */}
          {onSwitchToDesktop && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 text-[10px] gap-1"
              onClick={onSwitchToDesktop}
            >
              <Monitor className="h-3 w-3" />
              <span className="hidden sm:inline">Desktop</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MobileTab)} className="h-full flex flex-col">
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* Record Tab */}
            <TabsContent value="record" className="h-full m-0 p-4 overflow-auto">
              <div className="space-y-4">
                {/* Script Selector Dropdown (if scripts available) */}
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
                            <SelectValue placeholder="Select a script for teleprompter..." />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50 max-h-64">
                            <SelectItem value="__none__">
                              <span className="text-muted-foreground">No script selected</span>
                            </SelectItem>
                            {scripts.filter(script => script.id && script.id.trim() !== '').map(script => (
                              <SelectItem key={script.id} value={script.id}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{script.title || 'Untitled Script'}</span>
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {script.content?.substring(0, 50) || 'No content'}...
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Teleprompter Preview (if script selected) */}
                {selectedScript && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{selectedScript.title}</span>
                      </div>
                      <ScrollArea className="h-24">
                        <p className="text-sm leading-relaxed">
                          {selectedScript.content}
                        </p>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Recording Area with Inline Record Button */}
                <div className="text-center py-4">
                  <OneTapRecordButton
                    variant="inline"
                    onRecordingComplete={handleRecordingComplete}
                    onRecordingStart={() => vibrate?.(100)}
                  />
                </div>

                {/* Recent Recordings */}
                {recordings.length > 0 && (
                  <Card>
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-xs flex items-center gap-2">
                        <Library className="h-3 w-3" />
                        Recent ({recordings.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-3">
                      <div className="flex gap-2 overflow-x-auto">
                        {recordings.slice(0, 5).map(rec => (
                          <div 
                            key={rec.id} 
                            className="w-12 h-12 bg-muted rounded flex-shrink-0 flex items-center justify-center"
                          >
                            {rec.type === 'video' && <Video className="h-4 w-4 text-muted-foreground" />}
                            {rec.type === 'audio' && <Mic className="h-4 w-4 text-muted-foreground" />}
                            {rec.type === 'photo' && (
                              <img 
                                src={rec.url} 
                                alt="Photo" 
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions Grid - More informative */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-1"
                    onClick={() => {
                      vibrate?.(50);
                      setActiveTab('clips');
                    }}
                  >
                    <Scissors className="h-4 w-4 text-blue-500" />
                    <span className="text-xs">Quick Clips</span>
                    <span className="text-[10px] text-muted-foreground">AI auto-cut</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-1"
                    onClick={() => {
                      vibrate?.(50);
                      setActiveTab('timeline');
                    }}
                  >
                    <Layers className="h-4 w-4 text-purple-500" />
                    <span className="text-xs">Timeline</span>
                    <span className="text-[10px] text-muted-foreground">Multi-track edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-1"
                    onClick={() => {
                      vibrate?.(50);
                      setActiveTab('stitch');
                    }}
                  >
                    <Music className="h-4 w-4 text-pink-500" />
                    <span className="text-xs">Stitch Scripts</span>
                    <span className="text-[10px] text-muted-foreground">Combine with music</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-1"
                    onClick={() => {
                      vibrate?.(50);
                      setActiveTab('library');
                    }}
                  >
                    <Library className="h-4 w-4 text-green-500" />
                    <span className="text-xs">Library</span>
                    <span className="text-[10px] text-muted-foreground">{recordings.length} recordings</span>
                  </Button>
                </div>
                
                {/* Offline Status */}
                {!isOnline && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-medium">Offline Mode</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recordings are saved locally and will sync when you're back online.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Stitch Tab - Combine scripts with music */}
            <TabsContent value="stitch" className="h-full m-0 p-4 overflow-auto">
              <ScriptStitcher
                availableScripts={scripts}
                availableMusic={music.length > 0 ? music : [
                  { id: 'ambient-1', name: 'Calm Ambient', duration: 120 },
                  { id: 'upbeat-1', name: 'Upbeat Corporate', duration: 90 },
                  { id: 'inspirational-1', name: 'Inspirational', duration: 150 },
                ]}
                onExport={handleStitchComplete}
              />
            </TabsContent>

            {/* Clips Tab */}
            <TabsContent value="clips" className="h-full m-0 p-4 overflow-auto">
              <QuickClipsGenerator
                sourceUrl={recordings[0]?.url}
                sourceDuration={recordings[0]?.duration || 120}
                onClipGenerated={(clip) => {
                  toast.success(`Generated: ${clip.suggestion.title}`);
                }}
              />
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="h-full m-0 p-4 overflow-auto">
              <MultiClipTimeline
                clips={timelineClips}
                onClipsChange={setTimelineClips}
                onExport={handleExport}
              />
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="h-full m-0 p-4 overflow-auto">
              <div className="space-y-4">
                {/* Offline Status Card */}
                <OfflineStudioMode compact={false} />
                
                {/* Recording Library */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Library className="h-5 w-5" />
                      Recording Library
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recordings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No recordings yet</p>
                        <p className="text-sm">Start recording to build your library</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {recordings.map(rec => (
                          <Card key={rec.id} className="overflow-hidden">
                            <div className="aspect-video bg-muted flex items-center justify-center">
                              {rec.type === 'photo' && rec.url ? (
                                <img src={rec.url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Video className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <CardContent className="p-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {rec.type}
                                </Badge>
                                {rec.duration && (
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(rec.duration)}s
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Templates Tab - Quick Social Templates (P1) */}
            <TabsContent value="templates" className="h-full m-0 p-4 overflow-auto">
              <QuickTemplates
                onSelectTemplate={(config: TemplateConfig) => {
                  toast.success(`Selected ${config.platform} template: ${config.aspectRatio}`);
                }}
                onApplyTemplate={(template) => {
                  toast.success(`Applied template: ${template.name}`);
                  vibrate?.(100);
                }}
              />
            </TabsContent>

            {/* Voice Commands Tab - Voice-First Editing (P2) */}
            <TabsContent value="voice" className="h-full m-0 p-4 overflow-auto">
              <VoiceCommands
                onCommand={(result: VoiceCommandResult) => {
                  toast.info(`Voice command: ${result.command.action}`);
                }}
                onStartRecording={() => {
                  vibrate?.(100);
                  setActiveTab('record');
                }}
                onPauseRecording={() => toast.info('Pause command received')}
                onStopRecording={() => toast.info('Stop command received')}
                onTrimClip={() => toast.info('Trim command received')}
                onDeleteClip={() => toast.info('Delete command received')}
                onSaveProject={() => toast.info('Save command received')}
                onExport={() => handleExport('mp4')}
              />
            </TabsContent>
          </div>

          {/* Bottom Tab Bar - Fixed at bottom with safe area, scrollable on small screens */}
          <div className="flex-shrink-0 border-t bg-card safe-area-bottom">
            <TabsList className="h-16 rounded-none bg-transparent flex justify-start gap-0 overflow-x-auto w-full">
              <TabsTrigger value="record" className="flex-1 min-w-[48px] flex flex-col gap-1 data-[state=active]:bg-primary/10 py-2 px-2 rounded-none">
                <Video className="h-5 w-5" />
                <span className="text-[10px] font-medium whitespace-nowrap">Record</span>
              </TabsTrigger>
              <TabsTrigger value="stitch" className="flex-1 min-w-[48px] flex flex-col gap-1 data-[state=active]:bg-primary/10 py-2 px-2 rounded-none">
                <Music className="h-5 w-5" />
                <span className="text-[10px] font-medium whitespace-nowrap">Stitch</span>
              </TabsTrigger>
              <TabsTrigger value="clips" className="flex-1 min-w-[48px] flex flex-col gap-1 data-[state=active]:bg-primary/10 py-2 px-2 rounded-none">
                <Scissors className="h-5 w-5" />
                <span className="text-[10px] font-medium whitespace-nowrap">Clips</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex-1 min-w-[48px] flex flex-col gap-1 data-[state=active]:bg-primary/10 py-2 px-2 rounded-none">
                <Sparkles className="h-5 w-5" />
                <span className="text-[10px] font-medium whitespace-nowrap">Social</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex-1 min-w-[48px] flex flex-col gap-1 data-[state=active]:bg-primary/10 py-2 px-2 rounded-none">
                <Mic className="h-5 w-5" />
                <span className="text-[10px] font-medium whitespace-nowrap">Voice</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex-1 min-w-[48px] flex flex-col gap-1 data-[state=active]:bg-primary/10 py-2 px-2 rounded-none">
                <Layers className="h-5 w-5" />
                <span className="text-[10px] font-medium whitespace-nowrap">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="flex-1 min-w-[48px] flex flex-col gap-1 data-[state=active]:bg-primary/10 py-2 px-2 rounded-none">
                <Library className="h-5 w-5" />
                <span className="text-[10px] font-medium whitespace-nowrap">Library</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Removed floating button - using inline record button in Record tab instead */}

      {/* PWA Install Prompt - Above the floating button */}
      <PWAInstallPrompt variant="banner" showOnMount={true} />
    </div>
  );
};

export default MobileRecordingView;
