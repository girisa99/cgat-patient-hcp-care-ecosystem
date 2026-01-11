/**
 * Genie Vibe - Consolidated Recording & Production Studio
 * 
 * UNIFIED PIPELINE: Record → Clips → Mix → Timeline → Publish
 * 
 * This is the main production studio with a streamlined 5-tab workflow.
 * For scripts, AI voice generation, and music library - use Genie Studio.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useGenieScripts } from '@/components/genie-studio/useGenieScripts';
import { useGenieMediaLibrary } from '@/components/genie-studio/useGenieMediaLibrary';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileRecordingView } from '@/components/document-processing/RecordingStudio/components/MobileRecordingView';
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
  // DESKTOP VIEW - Full 5-tab pipeline
  // ============================================================
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-pink-950/10">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-violet-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/genie-studio')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Genie Studio
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/90 backdrop-blur border border-pink-200/50 flex items-center justify-center shadow-lg overflow-hidden p-2">
                    <img src={genieVibeLogo} alt="Genie Vibe" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Genie Vibe Studio
                    </h1>
                    <p className="text-xs text-muted-foreground">Record → Clips → Mix → Timeline → Publish</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1"
                  >
                    <Monitor className="h-4 w-4" />
                    <span className="hidden sm:inline">Desktop</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => setViewMode('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span className="hidden sm:inline">Mobile</span>
                  </Button>
                </div>

                <Badge className="bg-pink-500/10 text-pink-600 border-pink-500/20">
                  {recordings.length} Recordings
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Progress Indicator */}
        <PipelineProgress
          currentStage={activeTab}
          completedStages={completedStages}
          onStageClick={handleStageClick}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PipelineStage)} className="space-y-6">
            <TabsList className="bg-muted/50 border border-border/50 h-auto gap-1 p-1">
              <TabsTrigger value="record" className="gap-2">
                <Video className="h-4 w-4" />
                Record
                {completedStages.includes('record') && <Check className="h-3 w-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="clips" className="gap-2">
                <Scissors className="h-4 w-4" />
                Clips
                {completedStages.includes('clips') && <Check className="h-3 w-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="mix" className="gap-2">
                <Music className="h-4 w-4" />
                Mix
                {completedStages.includes('mix') && <Check className="h-3 w-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <Layers className="h-4 w-4" />
                Timeline
                {completedStages.includes('timeline') && <Check className="h-3 w-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="publish" className="gap-2">
                <Upload className="h-4 w-4" />
                Publish
                {completedStages.includes('publish') && <Check className="h-3 w-3 text-green-500" />}
              </TabsTrigger>
            </TabsList>

            {/* Record Tab */}
            <TabsContent value="record" className="space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Record</h2>
                        <p className="text-sm text-muted-foreground">Capture video, audio, or screen</p>
                      </div>
                    </div>
                    <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                      Step 1 of 5
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer p-6 text-center group">
                      <Camera className="h-10 w-10 mx-auto mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold">Camera</h3>
                      <p className="text-xs text-muted-foreground">Record from webcam</p>
                    </Card>
                    <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer p-6 text-center group">
                      <ScreenShare className="h-10 w-10 mx-auto mb-3 text-green-500 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold">Screen</h3>
                      <p className="text-xs text-muted-foreground">Record screen activity</p>
                    </Card>
                    <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer p-6 text-center group">
                      <div className="flex justify-center gap-1 mb-3">
                        <Camera className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform" />
                        <ScreenShare className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="font-semibold">Both</h3>
                      <p className="text-xs text-muted-foreground">Camera + Screen overlay</p>
                    </Card>
                  </div>

                  {/* Recording Preview Area */}
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
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
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Use Script as Teleprompter</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {scriptsForMobile.length} scripts available from Genie Studio
                      </p>
                      <ScrollArea className="h-24">
                        <div className="flex gap-2">
                          {scriptsForMobile.slice(0, 5).map(script => (
                            <Button key={script.id} variant="outline" size="sm" className="h-auto py-2 flex-shrink-0">
                              <div className="text-left">
                                <p className="text-xs font-medium">{script.title}</p>
                                <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[120px]">
                                  {script.content.slice(0, 50)}...
                                </p>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Recent Recordings */}
                  {recordings.length > 0 && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
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
                          <div key={rec.id} className="w-20 h-14 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            <Video className="h-6 w-6 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quick Clips Tab */}
            <TabsContent value="clips" className="space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Scissors className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Quick Clips</h2>
                        <p className="text-sm text-muted-foreground">AI auto-finds the best moments</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                      Step 2 of 5
                    </Badge>
                  </div>
                  
                  <QuickClipsGenerator 
                    sourceUrl={recordings[0]?.url}
                    sourceDuration={recordings[0]?.duration || 120}
                    onClipGenerated={(clip) => {
                      toast.success(`Generated clip: ${clip.suggestion.title}`);
                      // Convert QuickClip to TimelineClip and add to timeline
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audio Mix Tab */}
            <TabsContent value="mix" className="space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Audio Mix</h2>
                        <p className="text-sm text-muted-foreground">Add voiceovers, music & sound</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      Step 3 of 5
                    </Badge>
                  </div>
                  
                  <AudioMixer
                    recordings={recordings}
                    voiceovers={allVoiceovers}
                    music={musicForMobile}
                    onMixComplete={handleMixComplete}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                        <Layers className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Timeline</h2>
                        <p className="text-sm text-muted-foreground">Arrange and edit your clips</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                      Step 4 of 5
                    </Badge>
                  </div>
                  
                  <MultiClipTimeline
                    clips={timelineClips}
                    mixedAudioTracks={mixedMedia?.audioTracks}
                    onClipsChange={setTimelineClips}
                    onExport={handleTimelineExport}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Publish Tab */}
            <TabsContent value="publish" className="space-y-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Publish</h2>
                        <p className="text-sm text-muted-foreground">Export, share, and publish</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      Step 5 of 5
                    </Badge>
                  </div>
                  
                  <PublishPanel
                    clips={timelineClips}
                    totalDuration={totalDuration}
                    projectName="My Genie Vibe Project"
                    onExport={handlePublish}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default GenieVibe;
