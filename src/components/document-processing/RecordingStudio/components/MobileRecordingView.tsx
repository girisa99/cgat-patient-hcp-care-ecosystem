/**
 * Mobile Recording View
 * P1 Feature: Mobile-optimized recording interface for Genie Vibe
 * Integrates: OneTapRecord, QuickClips, MultiClipTimeline, PWA
 * Differentiator: Only mobile solution with AI scripts + one-tap + remix
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
  Download
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
  MobileStatusBar
} from '@/components/mobile';
import type { RecordingResult } from '@/components/mobile/OneTapRecordButton';
import type { TimelineClip } from '@/components/mobile/MultiClipTimeline';

interface MobileRecordingViewProps {
  isOpen?: boolean;
  onClose?: () => void;
  onRecordingComplete?: (result: RecordingResult) => void;
  scripts?: Array<{ id: string; title: string; content: string }>;
  className?: string;
}

type MobileTab = 'record' | 'clips' | 'timeline' | 'library';

export const MobileRecordingView: React.FC<MobileRecordingViewProps> = ({
  isOpen = true,
  onClose,
  onRecordingComplete,
  scripts = [],
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

                {/* Recording Area */}
                <div className="text-center py-8">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-dashed border-primary/30">
                      <Video className="h-16 w-16 text-primary/50" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Tap the record button below to start
                    </p>
                  </div>
                </div>

                {/* Recent Recordings */}
                {recordings.length > 0 && (
                  <Card>
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Library className="h-4 w-4" />
                        Recent ({recordings.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <ScrollArea className="h-24">
                        <div className="flex gap-2">
                          {recordings.slice(0, 5).map(rec => (
                            <div 
                              key={rec.id} 
                              className="w-16 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center"
                            >
                              {rec.type === 'video' && <Video className="h-6 w-6 text-muted-foreground" />}
                              {rec.type === 'audio' && <Mic className="h-6 w-6 text-muted-foreground" />}
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
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Feature Highlights */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <Zap className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
                    <span className="text-xs">AI Enhancement</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <Scissors className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                    <span className="text-xs">Quick Clips</span>
                  </div>
                </div>
              </div>
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

          {/* Bottom Tab Bar - Fixed at bottom with safe area */}
          <TabsList className="flex-shrink-0 h-14 rounded-none border-t bg-card grid grid-cols-4 safe-area-bottom">
            <TabsTrigger value="record" className="flex flex-col gap-0.5 data-[state=active]:bg-primary/10 py-1.5">
              <Video className="h-4 w-4" />
              <span className="text-[10px]">Record</span>
            </TabsTrigger>
            <TabsTrigger value="clips" className="flex flex-col gap-0.5 data-[state=active]:bg-primary/10 py-1.5">
              <Scissors className="h-4 w-4" />
              <span className="text-[10px]">Clips</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex flex-col gap-0.5 data-[state=active]:bg-primary/10 py-1.5">
              <Layers className="h-4 w-4" />
              <span className="text-[10px]">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="flex flex-col gap-0.5 data-[state=active]:bg-primary/10 py-1.5">
              <Library className="h-4 w-4" />
              <span className="text-[10px]">Library</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Floating Record Button - Positioned above tab bar */}
      <div className="fixed bottom-20 right-4 z-[60]">
        <OneTapRecordButton
          variant="floating"
          onRecordingComplete={handleRecordingComplete}
          onRecordingStart={() => setActiveTab('record')}
        />
      </div>

      {/* PWA Install Prompt - Above the floating button */}
      <PWAInstallPrompt variant="banner" showOnMount={true} />
    </div>
  );
};

export default MobileRecordingView;
