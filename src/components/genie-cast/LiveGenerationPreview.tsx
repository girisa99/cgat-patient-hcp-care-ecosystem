/**
 * LiveGenerationPreview - P2 Live TTS/Video Generation UI Component
 *
 * Features:
 * - Chapter-by-chapter TTS generation with real-time playback
 * - Video preview generation with thumbnails
 * - Universal pipeline orchestration (all step types, all formats)
 * - Pause / Resume / Cancel production controls
 * - Per-step-type progress panel
 * - Per-scene "Generate Scene" pipeline trigger
 * - Segmented assembly for >30 min content
 * - Progress tracking and status indicators
 * - Provider routing display
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Mic,
  Video,
  Image as ImageIcon,
  RefreshCw,
  Check,
  Loader2,
  Zap,
  Film,
  Sparkles,
  Layers,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLiveTTSPreview, type TTSAudioResult } from '@/hooks/useLiveTTSPreview';
import { useLiveVideoPreview, type VideoGenerationResult } from '@/hooks/useLiveVideoPreview';
import { useCastProductionOrchestrator, type ProductionOrchestratorConfig } from '@/hooks/useCastProductionOrchestrator';
import type { SceneScript, TemplateMapping } from '@/hooks/useUnifiedAuthoring';
import type { StyleIntent, RegionZone } from '@/services/styleIntentResolver';
import type { ScenePipelineStep } from '@/config/ep04-production-config';
import type { ScriptLine } from '@/config/ep04-script-content';

// ============================================
// TYPES
// ============================================

interface LiveGenerationPreviewProps {
  mapping: TemplateMapping;
  styleIntent?: StyleIntent;
  /** Parent region for provider routing (one of 16: NAM, EU, INDIA, etc.) */
  region?: RegionZone;
  /** Subregion for fine-grained routing (one of 62, e.g. 'us-east', 'uk', 'tamil-nadu') */
  subregion?: string;
  language?: string;
  /** Scene pipeline config — if provided, enables full pipeline orchestration */
  scenePipelines?: Record<string, ScenePipelineStep[]>;
  /** Script content for TTS steps */
  scriptContent?: Record<string, ScriptLine>;
  /** Project ID for checkpoint persistence */
  projectId?: string;
  onTTSComplete?: (results: TTSAudioResult[]) => void;
  onVideoComplete?: (results: VideoGenerationResult[]) => void;
  onAssemblyComplete?: (videoUrl: string) => void;
  showAdvancedControls?: boolean;
  className?: string;
}

// ============================================
// STEP TYPE DISPLAY CONFIG
// ============================================

const STEP_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  'tts':                   { label: 'TTS',        icon: 'mic',    color: 'text-emerald-500' },
  'alibaba-video':         { label: 'Video',      icon: 'video',  color: 'text-sky-500' },
  'alibaba-image':         { label: 'Image',      icon: 'image',  color: 'text-violet-500' },
  'avatar-lipsync':        { label: 'Lipsync',    icon: 'user',   color: 'text-pink-500' },
  'avatar-3d':             { label: '3D',         icon: 'cube',   color: 'text-orange-500' },
  'ai-screen-enhance':     { label: 'Enhance',    icon: 'wand',   color: 'text-amber-500' },
  'screen-capture':        { label: 'Screen',     icon: 'monitor',color: 'text-gray-500' },
  'music':                 { label: 'Music',      icon: 'music',  color: 'text-purple-500' },
  'sfx':                   { label: 'SFX',        icon: 'volume', color: 'text-red-500' },
  'scene-transition':      { label: 'Trans.',     icon: 'shuffle',color: 'text-teal-500' },
  'storybook-frame':       { label: 'Frame',      icon: 'frame',  color: 'text-indigo-500' },
  'character-interaction': { label: 'Char.',      icon: 'users',  color: 'text-blue-500' },
  'narrator-scroll':       { label: 'Scroll',     icon: 'scroll', color: 'text-yellow-500' },
  'kinetic-text':          { label: 'KText',      icon: 'type',   color: 'text-gray-400' },
  'motion-graphics':       { label: 'Motion',     icon: 'film',   color: 'text-gray-400' },
};

// ============================================
// PIPELINE PROGRESS PANEL
// ============================================

function PipelineProgressPanel({
  progressSummary,
  pendingJobsCount,
}: {
  progressSummary: Array<{ type: string; total: number; completed: number; failed: number; pending: number }>;
  pendingJobsCount: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {progressSummary.map(({ type, total, completed, failed }) => {
          const cfg = STEP_TYPE_LABELS[type] || { label: type, color: 'text-muted-foreground' };
          const isDone = completed + failed >= total;
          return (
            <div key={type} className="flex items-center gap-1.5 text-xs px-2 py-1 bg-muted/40 rounded-md">
              <span className={cn('font-medium', cfg.color)}>{cfg.label}:</span>
              <span className={isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                {completed}/{total}
              </span>
              {isDone && <Check className="w-3 h-3 text-emerald-500" />}
              {failed > 0 && (
                <span className="text-red-500">({failed} err)</span>
              )}
            </div>
          );
        })}
      </div>
      {pendingJobsCount > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          {pendingJobsCount} async job{pendingJobsCount > 1 ? 's' : ''} polling...
        </p>
      )}
    </div>
  );
}

// ============================================
// SCENE PREVIEW CARD
// ============================================

interface ScenePreviewCardProps {
  scene: SceneScript;
  ttsResult?: TTSAudioResult;
  videoResult?: VideoGenerationResult;
  isCurrentScene: boolean;
  isPlaying: boolean;
  onPlayTTS: () => void;
  onPauseTTS: () => void;
  onGenerateTTS: () => void;
  onGenerateVideo: () => void;
  onGenerateScene?: () => void;
  isGeneratingTTS: boolean;
  isGeneratingVideo: boolean;
  hasPipeline: boolean;
  orchestratorCurrentScene?: string | null;
}

function ScenePreviewCard({
  scene,
  ttsResult,
  videoResult,
  isCurrentScene,
  isPlaying,
  onPlayTTS,
  onPauseTTS,
  onGenerateTTS,
  onGenerateVideo,
  onGenerateScene,
  isGeneratingTTS,
  isGeneratingVideo,
  hasPipeline,
  orchestratorCurrentScene,
}: ScenePreviewCardProps) {
  const hasTTS = !!ttsResult;
  const hasVideo = !!videoResult?.thumbnailUrl || !!videoResult?.animatedPreviewUrl;
  const isOrchestratingThisScene = orchestratorCurrentScene === scene.sceneId;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all',
        isOrchestratingThisScene
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : isCurrentScene
            ? 'border-primary/50 bg-primary/5'
            : 'border-border/50 hover:border-border'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="relative w-24 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
          {videoResult?.thumbnailUrl ? (
            <img
              src={videoResult.thumbnailUrl}
              alt={scene.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          {(isGeneratingVideo || isOrchestratingThisScene) && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>

        {/* Scene Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{scene.title}</span>
            <Badge variant="outline" className="text-xs">
              {scene.durationSeconds}s
            </Badge>
            {scene.approvalStatus === 'approved' && (
              <Badge variant="default" className="text-xs bg-emerald-500/90">
                <Check className="w-3 h-3 mr-1" />
                Approved
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {scene.editedText || scene.scriptText}
          </p>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {hasTTS ? (
              <Badge variant="secondary" className="text-xs">
                <Volume2 className="w-3 h-3 mr-1" />
                {ttsResult.provider}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                <VolumeX className="w-3 h-3 mr-1" />
                No TTS
              </Badge>
            )}

            {hasVideo ? (
              <Badge variant="secondary" className="text-xs">
                <Video className="w-3 h-3 mr-1" />
                {videoResult.provider}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                <Video className="w-3 h-3 mr-1" />
                No Video
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {/* Per-scene pipeline button */}
          {hasPipeline && onGenerateScene && (
            <Button
              size="sm"
              variant="outline"
              onClick={onGenerateScene}
              disabled={isOrchestratingThisScene}
              title="Generate full pipeline for this scene"
            >
              {isOrchestratingThisScene ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Layers className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* TTS Controls */}
          {hasTTS ? (
            <Button
              size="sm"
              variant={isPlaying && isCurrentScene ? 'default' : 'outline'}
              onClick={isPlaying && isCurrentScene ? onPauseTTS : onPlayTTS}
            >
              {isPlaying && isCurrentScene ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onGenerateTTS}
              disabled={isGeneratingTTS}
            >
              {isGeneratingTTS ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* Video Controls */}
          {!hasVideo && (
            <Button
              size="sm"
              variant="outline"
              onClick={onGenerateVideo}
              disabled={isGeneratingVideo}
            >
              {isGeneratingVideo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LiveGenerationPreview({
  mapping,
  styleIntent = 'corporate',
  region = 'global',
  subregion,
  language = 'en-US',
  scenePipelines,
  scriptContent,
  projectId,
  onTTSComplete,
  onVideoComplete,
  onAssemblyComplete,
  showAdvancedControls = true,
  className,
}: LiveGenerationPreviewProps) {
  const [autoPlayOnGenerate, setAutoPlayOnGenerate] = useState(true);

  // Initialize hooks
  const tts = useLiveTTSPreview({
    onAllGenerated: onTTSComplete,
    defaultLanguage: language,
  });

  const video = useLiveVideoPreview({
    styleIntent,
    region,
    onAssemblyComplete,
  });

  // Initialize orchestrator (only when scenePipelines is provided)
  const orchestratorConfig = useMemo<ProductionOrchestratorConfig>(() => ({
    scenePipelines: scenePipelines || {},
    scriptContent,
    language,
    region,
    subregion,
    quality: 'cinematic',
    projectId,
    assembly: {
      format: 'video',
      maxSegmentDuration: 1800, // 30 min per segment
      resolution: '1080p',
      transitions: 'fade',
    },
  }), [scenePipelines, scriptContent, language, region, subregion, projectId]);

  const orchestrator = useCastProductionOrchestrator(orchestratorConfig);
  const hasPipeline = !!scenePipelines && Object.keys(scenePipelines).length > 0;

  // Poll pending async jobs every 15s when there are pending jobs
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (orchestrator.pendingJobs.length > 0 && !pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(() => {
        orchestrator.pollPendingJobs();
      }, 15000);
    } else if (orchestrator.pendingJobs.length === 0 && pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [orchestrator.pendingJobs.length, orchestrator.pollPendingJobs]);

  // Computed values
  const scenes = mapping.scenes;
  const totalDuration = useMemo(() =>
    scenes.reduce((sum, s) => sum + s.durationSeconds, 0),
    [scenes]
  );

  const ttsCompleteCount = useMemo(() =>
    scenes.filter(s => tts.audioCache.has(s.sceneId)).length,
    [scenes, tts.audioCache]
  );

  const videoCompleteCount = useMemo(() =>
    scenes.filter(s =>
      video.videoCache.has(`thumb_${s.sceneId}`) ||
      video.videoCache.has(`preview_${s.sceneId}`)
    ).length,
    [scenes, video.videoCache]
  );

  // Handlers — existing quick actions
  const handleGenerateAllTTS = useCallback(async () => {
    const results = await tts.generateForAllScenes(scenes, language);
    if (autoPlayOnGenerate && results.length > 0) {
      tts.playAllScenes(scenes);
    }
  }, [tts, scenes, language, autoPlayOnGenerate]);

  const handleGenerateAllThumbnails = useCallback(async () => {
    await video.generateAllThumbnails(scenes);
  }, [video, scenes]);

  const handleAssembleVideo = useCallback(async () => {
    const audioResults = Array.from(tts.audioCache.values());
    await video.assembleVideo(mapping, audioResults);
  }, [video, tts.audioCache, mapping]);

  const handleGenerateFull = useCallback(async () => {
    // Step 1: Generate all TTS
    await tts.generateForAllScenes(scenes, language);
    // Step 2: Generate all thumbnails
    await video.generateAllThumbnails(scenes);
    // Step 3: Assemble video
    const audioResults = Array.from(tts.audioCache.values());
    await video.assembleVideo(mapping, audioResults);
  }, [tts, video, scenes, language, mapping]);

  // Handlers — orchestrator pipeline
  const handleGenerateFullPipeline = useCallback(async () => {
    await orchestrator.generateAll();
  }, [orchestrator]);

  const handleGenerateScene = useCallback(async (sceneId: string) => {
    await orchestrator.generateScene(sceneId);
  }, [orchestrator]);

  const handleAssemblePipeline = useCallback(async () => {
    await orchestrator.assembleOutput();
  }, [orchestrator]);

  // Provider info
  const providers = video.getResolvedProviders();

  const isAnyGenerating = tts.isGenerating || video.isGenerating || video.isAssembling || orchestrator.isGenerating;

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Live Generation Preview
            </CardTitle>
            <CardDescription>
              {hasPipeline
                ? 'Full production pipeline: TTS, video, lipsync, music, SFX, assembly'
                : 'Generate TTS audio and video previews in real-time'}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Film className="w-3 h-3 mr-1" />
              {providers.video}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Volume2 className="w-3 h-3 mr-1" />
              {mapping.resolvedProviders.tts}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Existing quick shortcuts */}
          <Button
            onClick={handleGenerateAllTTS}
            disabled={isAnyGenerating}
            variant="outline"
            className="gap-2"
            size="sm"
          >
            {tts.isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            TTS Only
          </Button>

          <Button
            onClick={handleGenerateAllThumbnails}
            disabled={isAnyGenerating}
            variant="outline"
            className="gap-2"
            size="sm"
          >
            {video.isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            Thumbnails
          </Button>

          {!hasPipeline && (
            <>
              <Button
                onClick={handleAssembleVideo}
                disabled={video.isAssembling || ttsCompleteCount < scenes.length}
                variant="outline"
                className="gap-2"
                size="sm"
              >
                {video.isAssembling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                Assemble
              </Button>

              <Separator orientation="vertical" className="h-8" />

              <Button
                onClick={handleGenerateFull}
                disabled={isAnyGenerating}
                variant="default"
                className="gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                {isAnyGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Full Production
              </Button>
            </>
          )}

          {/* Pipeline orchestration buttons */}
          {hasPipeline && (
            <>
              <Separator orientation="vertical" className="h-8" />

              <Button
                onClick={handleGenerateFullPipeline}
                disabled={isAnyGenerating}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                {orchestrator.isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate Full Pipeline
              </Button>

              {/* Pause / Resume toggle */}
              {orchestrator.isGenerating && (
                <Button
                  onClick={orchestrator.isPaused ? orchestrator.resume : orchestrator.pause}
                  variant="outline"
                  className="gap-2"
                >
                  {orchestrator.isPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  )}
                </Button>
              )}

              {/* Cancel */}
              {orchestrator.isGenerating && (
                <Button
                  onClick={orchestrator.cancel}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </Button>
              )}

              {/* Assemble (enabled when pipeline complete) */}
              <Button
                onClick={handleAssemblePipeline}
                disabled={!orchestrator.isComplete || orchestrator.isAssembling}
                variant="outline"
                className="gap-2"
              >
                {orchestrator.isAssembling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                Assemble
              </Button>
            </>
          )}
        </div>

        {/* Pipeline Progress Panel */}
        {hasPipeline && orchestrator.progress.status !== 'idle' && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {orchestrator.progress.status === 'generating' && 'Generating pipeline...'}
                {orchestrator.progress.status === 'paused' && 'Pipeline paused'}
                {orchestrator.progress.status === 'assembling' && 'Assembling output...'}
                {orchestrator.progress.status === 'complete' && 'Pipeline complete'}
                {orchestrator.progress.status === 'error' && 'Pipeline error'}
              </span>
              <span className="text-muted-foreground">
                {orchestrator.progress.completedSteps}/{orchestrator.progress.totalSteps} steps
                ({orchestrator.progress.percentage}%)
              </span>
            </div>
            <Progress value={orchestrator.progress.percentage} />
            <PipelineProgressPanel
              progressSummary={orchestrator.progressSummary}
              pendingJobsCount={orchestrator.pendingJobs.length}
            />
            {orchestrator.progress.currentScene && (
              <p className="text-xs text-muted-foreground">
                Current: {orchestrator.progress.currentScene}
                {orchestrator.progress.currentStepType && ` (${orchestrator.progress.currentStepType})`}
              </p>
            )}
          </div>
        )}

        {/* TTS/Video-only progress (when no pipeline) */}
        {!hasPipeline && (tts.isGenerating || video.isGenerating || video.isAssembling) && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {tts.isGenerating && 'Generating TTS...'}
                {video.isGenerating && 'Generating Visuals...'}
                {video.isAssembling && 'Assembling Video...'}
              </span>
              <span className="text-muted-foreground">
                {tts.isGenerating && `${tts.progress.completedScenes}/${tts.progress.totalScenes}`}
                {video.isGenerating && `${video.progress.completedScenes}/${video.progress.totalScenes}`}
              </span>
            </div>
            <Progress
              value={tts.isGenerating ? tts.progress.percentage : video.progress.percentage}
            />
            {(tts.progress.currentScene || video.progress.currentScene) && (
              <p className="text-xs text-muted-foreground">
                Current: {scenes.find(s =>
                  s.sceneId === (tts.progress.currentScene || video.progress.currentScene)
                )?.title || 'Processing...'}
              </p>
            )}
          </div>
        )}

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">{scenes.length}</div>
            <div className="text-xs text-muted-foreground">Total Scenes</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{ttsCompleteCount}</div>
            <div className="text-xs text-muted-foreground">TTS Ready</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{videoCompleteCount}</div>
            <div className="text-xs text-muted-foreground">Visuals Ready</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">{Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}</div>
            <div className="text-xs text-muted-foreground">Total Duration</div>
          </div>
        </div>

        {/* Playback Controls */}
        {ttsCompleteCount > 0 && (
          <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => tts.stopPlayback()}
            >
              <Square className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              disabled={tts.playbackState.currentSceneId === scenes[0]?.sceneId}
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              size="lg"
              className="rounded-full w-12 h-12"
              onClick={() => {
                if (tts.playbackState.isPlaying) {
                  tts.pausePlayback();
                } else if (tts.playbackState.currentSceneId) {
                  tts.resumePlayback();
                } else {
                  tts.playAllScenes(scenes);
                }
              }}
            >
              {tts.playbackState.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => tts.setMuted(!tts.playbackState.isMuted)}
            >
              {tts.playbackState.isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>

            <div className="w-24">
              <Slider
                value={[tts.playbackState.volume * 100]}
                onValueChange={([value]) => tts.setVolume(value / 100)}
                max={100}
                step={1}
              />
            </div>
          </div>
        )}

        {/* Scene List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {scenes.map((scene) => (
              <ScenePreviewCard
                key={scene.sceneId}
                scene={scene}
                ttsResult={tts.getCachedAudio(scene.sceneId)}
                videoResult={video.getCachedVideo(scene.sceneId)}
                isCurrentScene={tts.playbackState.currentSceneId === scene.sceneId}
                isPlaying={tts.playbackState.isPlaying && tts.playbackState.currentSceneId === scene.sceneId}
                onPlayTTS={() => tts.playScene(scene.sceneId)}
                onPauseTTS={() => tts.pausePlayback()}
                onGenerateTTS={() => tts.generateForScene(scene, language)}
                onGenerateVideo={() => video.generateThumbnailForScene(scene)}
                onGenerateScene={hasPipeline ? () => handleGenerateScene(scene.sceneId) : undefined}
                isGeneratingTTS={tts.progress.currentScene === scene.sceneId}
                isGeneratingVideo={video.progress.currentScene === scene.sceneId}
                hasPipeline={hasPipeline}
                orchestratorCurrentScene={orchestrator.progress.currentScene}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Advanced Controls */}
        {showAdvancedControls && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="autoPlay"
                  checked={autoPlayOnGenerate}
                  onCheckedChange={setAutoPlayOnGenerate}
                />
                <Label htmlFor="autoPlay" className="text-sm">
                  Auto-play after generation
                </Label>
              </div>

              <div className="flex items-center gap-2">
                {hasPipeline && projectId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => orchestrator.saveCheckpoint()}
                  >
                    Save Checkpoint
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    tts.clearCache();
                    video.clearCache();
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Clear Cache
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LiveGenerationPreview;
