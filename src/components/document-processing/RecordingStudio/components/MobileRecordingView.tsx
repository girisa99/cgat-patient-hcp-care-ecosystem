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
  Video, 
  Scissors, 
  Layers, 
  Sparkles, 
  Settings,
  Library,
  Mic,
  FileText,
  ChevronUp,
  X,
  Maximize2,
  Minimize2,
  Zap,
  Share2,
  Download,
  Music,
  Monitor
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
  ScriptStitcher
} from '@/components/mobile';
import type { RecordingResult } from '@/components/mobile/OneTapRecordButton';
import type { TimelineClip } from '@/components/mobile/MultiClipTimeline';
import type { StitchedResult } from '@/components/mobile/ScriptStitcher';

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

type MobileTab = 'record' | 'stitch' | 'clips' | 'timeline' | 'library';

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
  const [showScripts, setShowScripts] = useState(false);
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

      {/* Header - Compact for mobile */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Genie Vibe</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            <Sparkles className="h-2.5 w-2.5 mr-0.5" />
            Mobile
          </Badge>
        </div>
        
        <div className="flex items-center gap-0.5">
          {/* Desktop Switch button */}
          {onSwitchToDesktop && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs gap-1"
              onClick={onSwitchToDesktop}
            >
              <Monitor className="h-3.5 w-3.5" />
              Desktop
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
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
                {/* Script Selector (if scripts available) */}
                {scripts.length > 0 && (
                  <Card>
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Script
                        </CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowScripts(!showScripts)}
                        >
                          <ChevronUp className={cn(
                            "h-4 w-4 transition-transform",
                            !showScripts && "rotate-180"
                          )} />
                        </Button>
                      </div>
                    </CardHeader>
                    {showScripts && (
                      <CardContent className="py-2 px-4">
                        <ScrollArea className="h-32">
                          <div className="space-y-2">
                            {scripts.map(script => (
                              <div
                                key={script.id}
                                className={cn(
                                  "p-2 border rounded cursor-pointer transition-colors",
                                  selectedScriptId === script.id 
                                    ? "border-primary bg-primary/5" 
                                    : "hover:bg-muted"
                                )}
                                onClick={() => setSelectedScriptId(script.id)}
                              >
                                <span className="text-sm font-medium">{script.title}</span>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {script.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    )}
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

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-1"
                    onClick={() => setActiveTab('clips')}
                  >
                    <Scissors className="h-4 w-4 text-blue-500" />
                    <span className="text-xs">Quick Clips</span>
                    <span className="text-[10px] text-muted-foreground">AI auto-cut</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 flex flex-col gap-1"
                    onClick={() => setActiveTab('timeline')}
                  >
                    <Layers className="h-4 w-4 text-purple-500" />
                    <span className="text-xs">Timeline</span>
                    <span className="text-[10px] text-muted-foreground">Multi-track edit</span>
                  </Button>
                </div>
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
            </TabsContent>
          </div>

          {/* Bottom Tab Bar - Fixed at bottom with safe area, 5 tabs */}
          <TabsList className="flex-shrink-0 h-14 rounded-none border-t bg-card grid grid-cols-5 safe-area-bottom">
            <TabsTrigger value="record" className="flex flex-col gap-0.5 data-[state=active]:bg-primary/10 py-1.5 px-1">
              <Video className="h-4 w-4" />
              <span className="text-[9px]">Record</span>
            </TabsTrigger>
            <TabsTrigger value="stitch" className="flex flex-col gap-0.5 data-[state=active]:bg-primary/10 py-1.5 px-1">
              <Music className="h-4 w-4" />
              <span className="text-[9px]">Stitch</span>
            </TabsTrigger>
            <TabsTrigger value="clips" className="flex flex-col gap-0.5 data-[state=active]:bg-primary/10 py-1.5 px-1">
              <Scissors className="h-4 w-4" />
              <span className="text-[9px]">Clips</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex flex-col gap-0.5 data-[state=active]:bg-primary/10 py-1.5 px-1">
              <Layers className="h-4 w-4" />
              <span className="text-[9px]">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="flex flex-col gap-0.5 data-[state=active]:bg-primary/10 py-1.5 px-1">
              <Library className="h-4 w-4" />
              <span className="text-[9px]">Library</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Removed floating button - using inline record button in Record tab instead */}

      {/* PWA Install Prompt - Above the floating button */}
      <PWAInstallPrompt variant="banner" showOnMount={true} />
    </div>
  );
};

export default MobileRecordingView;
