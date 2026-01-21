/**
 * Genie Vibe - Full Studio (Consolidated Recording & Production)
 * 
 * UNIFIED PIPELINE: Record → Clips → Mix → Timeline → Publish
 * 
 * PHASE 1+2 COMPLETE: Recording consolidated into VibeRecordTab
 * - Camera/Screen/PiP recording with countdown
 * - Pause/Resume/Stop + TTS generation
 * - Script selection (original vs enhanced)
 * - Teleprompter sync + Background blur
 * - Mobile/Desktop views
 * - Meeting URL integration (showId, session, title)
 * 
 * Design System: Enterprise-ready, no frame-in-frame, mobile-first
 * INTEGRATED: Ask Genie AI assistant for context-aware help
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Check,
  Wand2,
  Combine,
  Sparkles,
  Shuffle,
  Zap,
  AudioWaveform,
  MapPin,
  Edit3,
  Library,
  DollarSign
} from 'lucide-react';
// Unified infrastructure imports
import { GlobalTierFilter, type GlobalTier } from '@/components/genie-studio/presentation-generator/components/GlobalTierFilter';
import { useGlobalTier } from '@/hooks/useGlobalTier';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { InlineTrainAIFeedback } from '@/components/genie-studio/InlineTrainAIFeedback';
import { useGenieScripts } from '@/components/genie-studio/useGenieScripts';
import { useGenieMediaLibrary } from '@/components/genie-studio/useGenieMediaLibrary';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';
import { MobileRecordingView } from '@/components/document-processing/RecordingStudio/components/MobileRecordingView';
import { Teleprompter } from '@/components/teleprompter';
import { 
  QuickClipsGenerator, 
  MultiClipTimeline, 
  AudioMixer,
  PublishPanel,
  PipelineProgress,
  RawRecordingPolisher, 
  MultiFileMerger,
  BRollIntegrator,
  VoiceCommands,
  SceneAnalyzerPanel,
  AIAutoArrange,
  SmartTransitions,
  MusicSyncAssembly,
  LocationStoryMode,
  TimelineClipEditor
} from '@/components/shared';
import { AskGenie } from '@/components/genie-studio/AskGenie';
import type { TimelineClip } from '@/components/mobile/MultiClipTimeline';
import type { PipelineStage } from '@/components/mobile/PipelineProgress';
import genieVibeLogo from '@/assets/logos/genie-vibe-combined.png';

// Import extracted VibeRecordTab component (Phase 1+2 consolidation)
// Import VibeMobileLayout (Phase 5 - simplified 3-tab mobile UX)
import { VibeRecordTab, VibeLibraryTab, VibeCostTracker, VibeMobileLayout } from '@/components/genie-vibe';

// Import useMediaProject for cost tracking (Phase 3)
import { useMediaProject } from '@/components/document-processing/RecordingStudio/hooks';

// Import persistence hook for drafts/session storage
import { useVibeRecordingPersistence } from '@/hooks/useVibeRecordingPersistence';

// Recording result type - matches OneTapRecordButton.RecordingResult
interface RecordingResult {
  id: string;
  url?: string;
  duration?: number;
  type: 'video' | 'audio' | 'photo';
  name?: string;
  thumbnailUrl?: string;
  timestamp?: number;
  blob?: Blob;
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
  const [searchParams] = useSearchParams();
  const isMobileOrTablet = useIsMobileOrTablet();
  
  // Unified Global Tier - affects all AI processing (TTS, music, video generation)
  const { globalTier, setGlobalTier, tierConfig } = useGlobalTier({ defaultTier: 'advanced' });
  
  // Get context from URL params (from MeetingRoom or ProductionHub)
  const showId = searchParams.get('showId');
  const sessionId = searchParams.get('session');
  const titleFromUrl = searchParams.get('title');
  
  // View mode: 'desktop' or 'mobile' - auto-detect based on device (includes tablets)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(isMobileOrTablet ? 'mobile' : 'desktop');
  
  // Auto-sync view mode with device detection when screen size changes
  useEffect(() => {
    setViewMode(isMobileOrTablet ? 'mobile' : 'desktop');
  }, [isMobileOrTablet]);
  
  // Teleprompter state
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [activeScript, setActiveScript] = useState<string>('');
  
  // Production context state - loaded from show if available
  const [productionTitle, setProductionTitle] = useState<string>('');
  const [productionScript, setProductionScript] = useState<string>('');
  
  // Existing hooks - data flow unchanged
  const { scripts: savedScripts } = useGenieScripts();
  const { voiceovers, instrumentalMusic, ttsFiles } = useGenieMediaLibrary();
  
  // Recording persistence - auto-saves drafts
  const vibePersistence = useVibeRecordingPersistence({ autoSave: true, autoSaveInterval: 3000 });
  
  // Pipeline state - shared across all tabs (initialized from persisted data)
  const [activeTab, setActiveTab] = useState<PipelineStage>('record');
  const [recordings, setRecordingsLocal] = useState<RecordingResult[]>([]);
  const [timelineClips, setTimelineClipsLocal] = useState<TimelineClip[]>([]);
  const [mixedMedia, setMixedMedia] = useState<MixedResult | null>(null);
  const [completedStages, setCompletedStages] = useState<PipelineStage[]>([]);
  
  // Sync local state with persistence layer
  useEffect(() => {
    if (!vibePersistence.isLoading && vibePersistence.clips.length > 0) {
      // Load persisted clips into local state
      const persistedRecordings: RecordingResult[] = vibePersistence.clips.map(clip => ({
        id: clip.id,
        url: clip.sourceUrl,
        duration: clip.duration,
        type: clip.type === 'image' ? 'photo' : clip.type as 'video' | 'audio' | 'photo',
        name: clip.name,
        thumbnailUrl: clip.thumbnailUrl,
      }));
      
      if (recordings.length === 0 && persistedRecordings.length > 0) {
        setRecordingsLocal(persistedRecordings);
        setTimelineClipsLocal(vibePersistence.clips);
      }
    }
  }, [vibePersistence.isLoading, vibePersistence.clips, recordings.length]);
  
  // Wrapper to update both local state and persistence
  const setRecordings = useCallback((updater: RecordingResult[] | ((prev: RecordingResult[]) => RecordingResult[])) => {
    setRecordingsLocal(prev => {
      const newVal = typeof updater === 'function' ? updater(prev) : updater;
      return newVal;
    });
  }, []);
  
  const setTimelineClips = useCallback((updater: TimelineClip[] | ((prev: TimelineClip[]) => TimelineClip[])) => {
    setTimelineClipsLocal(prev => {
      const newVal = typeof updater === 'function' ? updater(prev) : updater;
      // Persist to database
      vibePersistence.updateClips(newVal);
      return newVal;
    });
  }, [vibePersistence]);
  
  // P2: Timeline Editor state
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [currentPlayheadTime, setCurrentPlayheadTime] = useState(0);
  
  // Phase 3: Media project cost tracking
  const mediaProject = useMediaProject({
    productionContext: showId ? { 
      showId, 
      showTitle: productionTitle,
      showType: 'video',
      scriptMode: 'video',
      currentStage: 'recording',
      participants: []
    } : undefined
  });
  
  // Note: Recording hooks moved to VibeRecordTab component (Phase 1+2 consolidation)
  // The VibeRecordTab handles: camera, screenShare, recording, TTS, teleprompter sync, background blur

  // Load production context from URL params (showId from MeetingRoom or ProductionHub)
  useEffect(() => {
    const loadProductionContext = async () => {
      if (titleFromUrl) {
        setProductionTitle(decodeURIComponent(titleFromUrl));
      }
      
      if (showId) {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data: show } = await supabase
            .from('shows')
            .select('*, show_participants (*)')
            .eq('id', showId)
            .single();
          
          if (show) {
            setProductionTitle(show.title || '');
            // Check for script in metadata
            const metadata = show.metadata as Record<string, any> || {};
            if (metadata?.script_content || metadata?.script) {
              setProductionScript(metadata.script_content || metadata.script);
              setActiveScript(metadata.script_content || metadata.script);
              toast.success(`Loaded production: ${show.title}`);
            }
          }
        } catch (err) {
          console.error('Error loading production context:', err);
        }
      }
    };
    
    loadProductionContext();
  }, [showId, titleFromUrl]);
  
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
    
    // Note: Feedback will be shown after clip generation in handleClipsReady
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
  // MOBILE VIEW - Simplified 3-Tab Experience (Record | Edit | Export)
  // Phase 5: Auto-detected, offline status, sync queue visibility
  // Session state is shared with desktop to preserve work when switching
  // ============================================================
  if (showMobileView) {
    return (
      <VibeMobileLayout
        onSwitchToDesktop={() => setViewMode('desktop')}
        onRecordingComplete={handleRecordingComplete}
        scripts={scriptsForMobile}
        // Share state between desktop and mobile
        initialRecordings={recordings}
        initialTimelineClips={timelineClips}
        onRecordingsChange={setRecordings}
        onTimelineClipsChange={setTimelineClips}
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
                  <p className="text-xs text-muted-foreground hidden lg:block">Record → Clips → Mix → Timeline → Publish</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Navigation */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => navigate('/genie-spark')}
              >
                <Zap className="h-4 w-4" />
                <span className="hidden md:inline">Spark</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => navigate('/genie-deck')}
              >
                <Layers className="h-4 w-4" />
                <span className="hidden md:inline">Deck</span>
              </Button>
              
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={!showMobileView ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => setViewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                  <span className="hidden md:inline">Desktop</span>
                </Button>
                <Button
                  variant={showMobileView ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() => setViewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden md:inline">Mobile</span>
                </Button>
              </div>

              {/* Global Tier Filter - affects TTS, music, video generation quality */}
              <GlobalTierFilter
                value={globalTier === 'standard' ? 1 : globalTier === 'advanced' ? 2 : 3}
                onChange={(tier) => setGlobalTier(tier === 1 ? 'standard' : tier === 2 ? 'advanced' : 'premium')}
                compact={true}
              />

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
            <TabsList className="h-12 p-1 flex-wrap">
              <TabsTrigger value="record" className="gap-2 px-4">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Record</span>
                {completedStages.includes('record') && <Check className="h-3 w-3 text-green-500 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="library" className="gap-2 px-4">
                <Library className="h-4 w-4" />
                <span className="hidden sm:inline">Library</span>
              </TabsTrigger>
              <TabsTrigger value="polish" className="gap-2 px-4">
                <Wand2 className="h-4 w-4" />
                <span className="hidden sm:inline">Polish</span>
              </TabsTrigger>
              <TabsTrigger value="merge" className="gap-2 px-4">
                <Combine className="h-4 w-4" />
                <span className="hidden sm:inline">Merge</span>
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
              {/* P2 Advanced Tabs */}
              <TabsTrigger value="arrange" className="gap-2 px-3">
                <Shuffle className="h-4 w-4" />
                <span className="hidden lg:inline">AI Arrange</span>
              </TabsTrigger>
              <TabsTrigger value="transitions" className="gap-2 px-3">
                <Zap className="h-4 w-4" />
                <span className="hidden lg:inline">Transitions</span>
              </TabsTrigger>
              <TabsTrigger value="beatsync" className="gap-2 px-3">
                <AudioWaveform className="h-4 w-4" />
                <span className="hidden lg:inline">Beat Sync</span>
              </TabsTrigger>
              <TabsTrigger value="location" className="gap-2 px-3">
                <MapPin className="h-4 w-4" />
                <span className="hidden lg:inline">Location</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="gap-2 px-3">
                <Edit3 className="h-4 w-4" />
                <span className="hidden lg:inline">Editor</span>
              </TabsTrigger>
              <TabsTrigger value="publish" className="gap-2 px-4">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Publish</span>
                {completedStages.includes('publish') && <Check className="h-3 w-3 text-green-500 ml-1" />}
              </TabsTrigger>
            </TabsList>

            {/* Record Tab - Uses VibeRecordTab component (Phase 1+2 consolidation) */}
            <TabsContent value="record" className="space-y-6 mt-0">
              <VibeRecordTab
                productionTitle={productionTitle}
                scripts={scriptsForMobile}
                voiceovers={allVoiceovers.map(v => ({ id: v.id, name: v.name, url: v.url, scriptText: v.scriptText, metadataType: v.metadataType as 'tts' | 'voiceover' | undefined }))}
                music={musicForMobile}
                onRecordingComplete={handleRecordingComplete}
                recordings={recordings}
              />
            </TabsContent>

            {/* Library Tab - Phase 3: FFmpeg, StudioSound, Cost Tracking */}
            <TabsContent value="library" className="space-y-6 mt-0">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <VibeLibraryTab
                    onScriptGenerated={(script) => {
                      toast.success(`Script "${script.title}" generated from recording!`);
                    }}
                  />
                </div>
                <div>
                  <VibeCostTracker
                    project={mediaProject.currentProject}
                    assets={mediaProject.assets}
                    sessionCost={mediaProject.totalSessionCost}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="polish" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Wand2 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Polish Recording</h2>
                    <p className="text-sm text-muted-foreground">AI-enhanced cleanup and refinement</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
              
              <RawRecordingPolisher 
                recordingUrl={recordings[0]?.url}
                recordingDuration={recordings[0]?.duration || 120}
                onPolishComplete={(segments) => {
                  toast.success(`Recording polished: ${segments.length} segments processed`);
                  markStageCompleted('record');
                }}
              />
            </TabsContent>

            {/* Merge Tab - MultiFileMerger */}
            <TabsContent value="merge" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Combine className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Merge Files</h2>
                    <p className="text-sm text-muted-foreground">Combine multiple recordings into one</p>
                  </div>
                </div>
                <Badge variant="outline">Multi-File</Badge>
              </div>
              
              <MultiFileMerger 
                onMergeComplete={(outputUrl) => {
                  toast.success('Files merged successfully!');
                  // Add merged recording to recordings list
                  const newRecording = {
                    id: `merged-${Date.now()}`,
                    url: outputUrl,
                    duration: 120,
                    type: 'video' as const,
                    name: `Merged Recording`,
                  };
                  setRecordings(prev => [...prev, newRecording]);
                }}
              />
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

            {/* P2: AI Auto Arrange Tab */}
            <TabsContent value="arrange" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Shuffle className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">AI Auto-Arrange</h2>
                    <p className="text-sm text-muted-foreground">Intelligently reorder clips for flow</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  P2 Feature
                </Badge>
              </div>
              
              <AIAutoArrange
                clips={timelineClips}
                onArrange={(arrangedClips) => {
                  setTimelineClips(arrangedClips);
                  toast.success('Clips auto-arranged by AI!');
                }}
              />
            </TabsContent>

            {/* P2: Smart Transitions Tab */}
            <TabsContent value="transitions" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Smart Transitions</h2>
                    <p className="text-sm text-muted-foreground">AI-powered transition suggestions</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  P2 Feature
                </Badge>
              </div>
              
              <SmartTransitions
                clips={timelineClips}
                onApplyTransitions={() => {
                  toast.success('Smart transitions applied!');
                }}
              />
            </TabsContent>

            {/* P2: Beat Sync Tab */}
            <TabsContent value="beatsync" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <AudioWaveform className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Music Beat Sync</h2>
                    <p className="text-sm text-muted-foreground">Sync cuts to music beats</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-pink-500/10 text-pink-600 border-pink-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  P2 Feature
                </Badge>
              </div>
              
              <MusicSyncAssembly
                clips={timelineClips}
                onSyncClips={(syncedClips) => {
                  setTimelineClips(syncedClips);
                  toast.success('Clips synced to music beats!');
                }}
              />
            </TabsContent>

            {/* P2: Location Story Tab */}
            <TabsContent value="location" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Location Story</h2>
                    <p className="text-sm text-muted-foreground">Geo-based narrative creation</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  P2 Feature
                </Badge>
              </div>
              
              <LocationStoryMode
                clips={timelineClips}
                onClipsChange={setTimelineClips}
              />
            </TabsContent>

            {/* P2: Timeline Clip Editor Tab */}
            <TabsContent value="editor" className="space-y-6 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Edit3 className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Clip Editor</h2>
                    <p className="text-sm text-muted-foreground">Full clip manipulation tools</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  P2 Feature
                </Badge>
              </div>
              
              <TimelineClipEditor
                clips={timelineClips}
                selectedClipId={selectedClipId}
                currentTime={currentPlayheadTime}
                onClipsChange={setTimelineClips}
                onSelectClip={setSelectedClipId}
                onSeek={setCurrentPlayheadTime}
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
                <Badge variant="outline">Final Step</Badge>
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

        {/* Ask Genie - Context-aware AI for Vibe */}
        <AskGenie 
          product="vibe" 
          currentTab={activeTab}
        />
      </div>
    </AppLayout>
  );
};

export default GenieVibe;
