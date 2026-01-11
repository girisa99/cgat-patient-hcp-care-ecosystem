/**
 * Genie Vibe - Consolidated Recording & Production Studio
 * 
 * UNIFIED PIPELINE: Record → Clips → Mix → Timeline → Publish
 * 
 * Design System: Enterprise-ready, no frame-in-frame, mobile-first
 * Teleprompter: Full suite (Desktop + Mobile)
 * Social Publishing: Hybrid (OAuth + Download)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Video,
  Smartphone,
  Monitor,
  Scissors,
  Music,
  Layers,
  Upload,
  Camera,
  ScreenShare,
  FileText,
  Check,
  Play,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useGenieScripts } from '@/components/genie-studio/useGenieScripts';
import { useGenieMediaLibrary } from '@/components/genie-studio/useGenieMediaLibrary';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileRecordingView } from '@/components/document-processing/RecordingStudio/components/MobileRecordingView';
import { Teleprompter } from '@/components/teleprompter';
import { 
  QuickClipsGenerator, 
  MultiClipTimeline, 
  AudioMixer,
  PublishPanel,
  PipelineProgress
} from '@/components/mobile';
import type { TimelineClip } from '@/components/mobile/MultiClipTimeline';
import type { PipelineStage } from '@/components/mobile/PipelineProgress';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';

// Recording result type
interface RecordingResult {
  id: string;
  url?: string;
  duration?: number;
  type: 'video' | 'audio' | 'photo';
  name?: string;
  thumbnailUrl?: string;
}

// Video track from mixer
interface VideoTrack {
  id: string;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  duration?: number;
  selected: boolean;
  order: number;
  visible: boolean;
}

// Audio track from mixer (with sync properties)
interface AudioTrackMix {
  id: string;
  name: string;
  url?: string;
  type: 'recording' | 'voiceover' | 'music';
  duration?: number;
  volume: number;
  muted: boolean;
  // Sync properties
  startOffset: number;
  fadeIn: number;
  fadeOut: number;
  trimStart: number;
  trimEnd: number;
}

// Mixed output result (video + audio)
interface MixedResult {
  videoTracks: VideoTrack[];
  audioTracks: AudioTrackMix[];
  totalDuration: number;
  masterVolume: number;
  syncPoints?: { videoTime: number; audioTrackId: string; label?: string }[];
}

const GenieVibe: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // View mode: 'desktop' or 'mobile' - auto-detect based on device
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(isMobile ? 'mobile' : 'desktop');
  
  // Teleprompter state
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [activeScript, setActiveScript] = useState<string>('');
  
  // Existing hooks - data flow unchanged
  const { scripts: savedScripts } = useGenieScripts();
  const { voiceovers, instrumentalMusic, ttsFiles } = useGenieMediaLibrary();
  
  // Pipeline state - shared across all tabs
  const [activeTab, setActiveTab] = useState<PipelineStage>('record');
  const [recordings, setRecordings] = useState<RecordingResult[]>([]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [mixedMedia, setMixedMedia] = useState<MixedResult | null>(null);
  const [completedStages, setCompletedStages] = useState<PipelineStage[]>([]);

  // Combine voiceovers and TTS for audio mixer
  const allVoiceovers = useMemo(() => [...voiceovers, ...ttsFiles], [voiceovers, ttsFiles]);

  // Calculate total timeline duration
  const totalDuration = useMemo(() => {
    if (timelineClips.length === 0) return 0;
    return Math.max(...timelineClips.map(c => c.startTime + c.duration));
  }, [timelineClips]);

  // Scripts formatted for components
  const scriptsForMobile = useMemo(() => savedScripts.map(s => ({
    id: s.id,
    title: s.name,
    content: s.enhancedContent || s.content || ''
  })), [savedScripts]);

  // Music formatted for components
  const musicForMobile = useMemo(() => instrumentalMusic.map(m => ({
    id: m.id,
    name: m.name,
    url: m.url
  })), [instrumentalMusic]);

  // Mark stage as completed
  const markStageCompleted = useCallback((stage: PipelineStage) => {
    setCompletedStages(prev => 
      prev.includes(stage) ? prev : [...prev, stage]
    );
  }, []);

  // Handle recording completion - auto-advance to clips
  const handleRecordingComplete = useCallback((result: RecordingResult) => {
    setRecordings(prev => [...prev, result]);
    
    // Auto-create timeline clip
    const newClip: TimelineClip = {
      id: result.id,
      type: result.type === 'photo' ? 'image' : result.type,
      name: result.name || `Recording ${recordings.length + 1}`,
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
    markStageCompleted('record');
    
    toast.success('Recording saved! Continue to Quick Clips?', {
      action: {
        label: 'Go to Clips',
        onClick: () => setActiveTab('clips')
      }
    });
  }, [recordings.length, timelineClips, markStageCompleted]);

  // Handle clips generated - advance to mix
  const handleClipsReady = useCallback((clips: TimelineClip[]) => {
    setTimelineClips(prev => [...prev, ...clips]);
    markStageCompleted('clips');
    
    toast.success('Clips ready! Add audio in Mix tab?', {
      action: {
        label: 'Go to Mix',
        onClick: () => setActiveTab('mix')
      }
    });
  }, [markStageCompleted]);

  // Handle mix completion - advance to timeline
  const handleMixComplete = useCallback((result: MixedResult) => {
    setMixedMedia(result);
    markStageCompleted('mix');
    
    // Add video tracks to timeline if not already there
    result.videoTracks.forEach((video, index) => {
      const existingClip = timelineClips.find(c => c.id === video.id);
      if (!existingClip) {
        const lastEndTime = timelineClips.length > 0 
          ? Math.max(...timelineClips.map(c => c.startTime + c.duration))
          : 0;
        
        const newClip: TimelineClip = {
          id: video.id,
          type: 'video',
          name: video.name,
          sourceUrl: video.url,
          thumbnailUrl: video.thumbnailUrl,
          startTime: lastEndTime + (index * 0.1),
          duration: video.duration || 5,
          inPoint: 0,
          outPoint: video.duration || 5,
          track: 0,
          volume: 1,
          opacity: video.visible ? 1 : 0,
        };
        setTimelineClips(prev => [...prev, newClip]);
      }
    });
    
    toast.success('Media mixed! Arrange on timeline?', {
      action: {
        label: 'Go to Timeline',
        onClick: () => setActiveTab('timeline')
      }
    });
  }, [markStageCompleted, timelineClips]);

  // Handle timeline export
  const handleTimelineExport = useCallback((format: string) => {
    markStageCompleted('timeline');
    toast.info(`Preparing ${timelineClips.length} clips for export...`);
    setActiveTab('publish');
  }, [timelineClips.length, markStageCompleted]);

  // Handle final publish
  const handlePublish = useCallback(async (format: string, quality: string) => {
    markStageCompleted('publish');
    // In production, this would trigger actual export
    await new Promise(resolve => setTimeout(resolve, 1500));
  }, [markStageCompleted]);

  // Handle stage click from progress indicator
  const handleStageClick = useCallback((stage: PipelineStage) => {
    setActiveTab(stage);
  }, []);

  // Use a variable to check mode to avoid TypeScript narrowing issues
  const showMobileView = viewMode === 'mobile';

  // ============================================================
  // MOBILE VIEW - Streamlined recording-first experience
  // ============================================================
  if (showMobileView) {
    return (
      <MobileRecordingView
        isOpen={true}
        onClose={() => navigate('/genie-studio')}
        scripts={scriptsForMobile}
        music={musicForMobile}
        onSwitchToDesktop={() => setViewMode('desktop')}
        onRecordingComplete={handleRecordingComplete}
      />
    );
  }

  // ============================================================
  // DESKTOP VIEW - Full 5-tab pipeline (Enterprise Ready, No Frame-in-Frame)
  // ============================================================
  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Teleprompter Overlay */}
        <Teleprompter
          script={activeScript}
          isOpen={isTeleprompterOpen}
          onClose={() => setIsTeleprompterOpen(false)}
        />

        {/* Header - Clean & Minimal */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/genie-studio')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Genie Studio</span>
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-card border flex items-center justify-center overflow-hidden p-1.5">
                  <img src={genieVibeLogo} alt="Genie Vibe" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Genie Vibe Studio</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Record → Clips → Mix → Timeline → Publish</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => setViewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                  <span className="hidden md:inline">Desktop</span>
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => setViewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden md:inline">Mobile</span>
                </Button>
              </div>

              <Badge variant="secondary">
                {recordings.length} Recordings
              </Badge>
            </div>
          </div>
        </header>

        {/* Pipeline Progress Indicator */}
        <PipelineProgress
          currentStage={activeTab}
          completedStages={completedStages}
          onStageClick={handleStageClick}
        />

        {/* Main Content - No Frame-in-Frame */}
        <main className="container py-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PipelineStage)} className="space-y-6">
            <TabsList className="h-12 p-1">
              <TabsTrigger value="record" className="gap-2 px-4">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Record</span>
                {completedStages.includes('record') && <Check className="h-3 w-3 text-green-500 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="clips" className="gap-2 px-4">
                <Scissors className="h-4 w-4" />
                <span className="hidden sm:inline">Clips</span>
                {completedStages.includes('clips') && <Check className="h-3 w-3 text-green-500 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="mix" className="gap-2 px-4">
                <Music className="h-4 w-4" />
                <span className="hidden sm:inline">Mix</span>
                {completedStages.includes('mix') && <Check className="h-3 w-3 text-green-500 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2 px-4">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Timeline</span>
                {completedStages.includes('timeline') && <Check className="h-3 w-3 text-green-500 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="publish" className="gap-2 px-4">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Publish</span>
                {completedStages.includes('publish') && <Check className="h-3 w-3 text-green-500 ml-1" />}
              </TabsTrigger>
            </TabsList>

            {/* Record Tab - Direct Content, No Card Wrapper */}
            <TabsContent value="record" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Video className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Record</h2>
                    <p className="text-sm text-muted-foreground">Capture video, audio, or screen</p>
                  </div>
                </div>
                <Badge variant="outline">Step 1 of 5</Badge>
              </div>

              {/* Recording Mode Selection */}
              <div className="grid md:grid-cols-3 gap-4">
                <button className="p-6 text-center border-2 border-dashed rounded-lg hover:border-primary hover:bg-muted/50 transition-all group">
                  <Camera className="h-10 w-10 mx-auto mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold">Camera</h3>
                  <p className="text-xs text-muted-foreground">Record from webcam</p>
                </button>
                <button className="p-6 text-center border-2 border-dashed rounded-lg hover:border-primary hover:bg-muted/50 transition-all group">
                  <ScreenShare className="h-10 w-10 mx-auto mb-3 text-green-500 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold">Screen</h3>
                  <p className="text-xs text-muted-foreground">Record screen activity</p>
                </button>
                <button className="p-6 text-center border-2 border-dashed rounded-lg hover:border-primary hover:bg-muted/50 transition-all group">
                  <div className="flex justify-center gap-1 mb-3">
                    <Camera className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform" />
                    <ScreenShare className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-semibold">Both</h3>
                  <p className="text-xs text-muted-foreground">Camera + Screen overlay</p>
                </button>
              </div>

              {/* Recording Preview Area */}
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-center">
                  <Video className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a recording mode above to start</p>
                </div>
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center gap-4">
                <Button size="lg" className="gap-2 bg-red-500 hover:bg-red-600 text-white px-8">
                  <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                  Start Recording
                </Button>
              </div>

              {/* Script Teleprompter Option */}
              {scriptsForMobile.length > 0 && (
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" />
                      <span className="font-medium">Teleprompter</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {scriptsForMobile.length} scripts
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select a script to use as teleprompter while recording
                  </p>
                  <ScrollArea className="h-20">
                    <div className="flex gap-2">
                      {scriptsForMobile.slice(0, 5).map(script => (
                        <Button 
                          key={script.id} 
                          variant="outline" 
                          size="sm" 
                          className="h-auto py-2 flex-shrink-0 gap-2"
                          onClick={() => {
                            setActiveScript(script.content);
                            setIsTeleprompterOpen(true);
                          }}
                        >
                          <Play className="h-3 w-3" />
                          <div className="text-left">
                            <p className="text-xs font-medium">{script.title}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Recent Recordings */}
              {recordings.length > 0 && (
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Recent Recordings ({recordings.length})</span>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0"
                      onClick={() => setActiveTab('clips')}
                    >
                      Process with AI Clips →
                    </Button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {recordings.map(rec => (
                      <div key={rec.id} className="w-20 h-14 bg-muted rounded flex-shrink-0 flex items-center justify-center border">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Quick Clips Tab */}
            <TabsContent value="clips" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Scissors className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Quick Clips</h2>
                    <p className="text-sm text-muted-foreground">AI auto-finds the best moments</p>
                  </div>
                </div>
                <Badge variant="outline">Step 2 of 5</Badge>
              </div>
              
              <QuickClipsGenerator 
                sourceUrl={recordings[0]?.url}
                sourceDuration={recordings[0]?.duration || 120}
                onClipGenerated={(clip) => {
                  toast.success(`Generated clip: ${clip.suggestion.title}`);
                  const timelineClip: TimelineClip = {
                    id: clip.id,
                    type: 'video',
                    name: clip.suggestion.title,
                    sourceUrl: clip.outputUrl,
                    startTime: timelineClips.length > 0 
                      ? Math.max(...timelineClips.map(c => c.startTime + c.duration)) + 0.5 
                      : 0,
                    duration: clip.suggestion.duration,
                    inPoint: clip.suggestion.startTime,
                    outPoint: clip.suggestion.endTime,
                    track: 0,
                    volume: 1,
                    opacity: 1,
                  };
                  setTimelineClips(prev => [...prev, timelineClip]);
                  markStageCompleted('clips');
                }}
              />
            </TabsContent>

            {/* Audio Mix Tab */}
            <TabsContent value="mix" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Music className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Audio Mix</h2>
                    <p className="text-sm text-muted-foreground">Add voiceovers, music & sound</p>
                  </div>
                </div>
                <Badge variant="outline">Step 3 of 5</Badge>
              </div>
              
              <AudioMixer
                recordings={recordings}
                voiceovers={allVoiceovers}
                music={musicForMobile}
                onMixComplete={handleMixComplete}
              />
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Timeline</h2>
                    <p className="text-sm text-muted-foreground">Arrange and edit your clips</p>
                  </div>
                </div>
                <Badge variant="outline">Step 4 of 5</Badge>
              </div>
              
              <MultiClipTimeline
                clips={timelineClips}
                mixedAudioTracks={mixedMedia?.audioTracks}
                onClipsChange={setTimelineClips}
                onExport={handleTimelineExport}
              />
            </TabsContent>

            {/* Publish Tab */}
            <TabsContent value="publish" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Publish</h2>
                    <p className="text-sm text-muted-foreground">Export, share, and publish</p>
                  </div>
                </div>
                <Badge variant="outline">Step 5 of 5</Badge>
              </div>
              
              <PublishPanel
                clips={timelineClips}
                totalDuration={totalDuration}
                projectName="My Genie Vibe Project"
                onExport={handlePublish}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AppLayout>
  );
};

export default GenieVibe;
