/**
 * LiveGenerationPreview - P2 Live TTS/Video Generation UI Component
 * 
 * Features:
 * - Chapter-by-chapter TTS generation with real-time playback
 * - Video preview generation with thumbnails
 * - Progress tracking and status indicators
 * - Provider routing display
 * - Audio waveform visualization placeholder
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertCircle,
  Clock,
  Loader2,
  Zap,
  Film,
  Sparkles,
  Download,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLiveTTSPreview, type TTSAudioResult } from '@/hooks/useLiveTTSPreview';
import { useLiveVideoPreview, type VideoGenerationResult } from '@/hooks/useLiveVideoPreview';
import type { SceneScript, TemplateMapping } from '@/hooks/useUnifiedAuthoring';
import type { StyleIntent, RegionZone } from '@/services/styleIntentResolver';

// ============================================
// TYPES
// ============================================

interface LiveGenerationPreviewProps {
  mapping: TemplateMapping;
  styleIntent?: StyleIntent;
  region?: RegionZone;
  language?: string;
  onTTSComplete?: (results: TTSAudioResult[]) => void;
  onVideoComplete?: (results: VideoGenerationResult[]) => void;
  onAssemblyComplete?: (videoUrl: string) => void;
  showAdvancedControls?: boolean;
  className?: string;
}

type GenerationMode = 'tts' | 'thumbnails' | 'video' | 'full';

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
  isGeneratingTTS: boolean;
  isGeneratingVideo: boolean;
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
  isGeneratingTTS,
  isGeneratingVideo,
}: ScenePreviewCardProps) {
  const hasTTS = !!ttsResult;
  const hasVideo = !!videoResult?.thumbnailUrl || !!videoResult?.animatedPreviewUrl;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all',
        isCurrentScene
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
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
          {isGeneratingVideo && (
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
  language = 'en-US',
  onTTSComplete,
  onVideoComplete,
  onAssemblyComplete,
  showAdvancedControls = true,
  className,
}: LiveGenerationPreviewProps) {
  const [generationMode, setGenerationMode] = useState<GenerationMode>('tts');
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

  // Handlers
  const handleGenerateAllTTS = useCallback(async () => {
    const results = await tts.generateForAllScenes(scenes, language);
    if (autoPlayOnGenerate && results.length > 0) {
      tts.playAllScenes(scenes);
    }
  }, [tts, scenes, language, autoPlayOnGenerate]);

  const handleGenerateAllThumbnails = useCallback(async () => {
    await video.generateAllThumbnails(scenes);
  }, [video, scenes]);

  const handleGenerateAllPreviews = useCallback(async () => {
    const audioResults = Array.from(tts.audioCache.values());
    const results = await video.generateAllPreviews(scenes, audioResults);
    if (results.length > 0 && onVideoComplete) {
      onVideoComplete(results);
    }
  }, [video, tts.audioCache, scenes, onVideoComplete]);

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

  // Provider info
  const providers = video.getResolvedProviders();

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
              Generate TTS audio and video previews in real-time
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
          <Button
            onClick={handleGenerateAllTTS}
            disabled={tts.isGenerating}
            className="gap-2"
          >
            {tts.isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            Generate All TTS
          </Button>

          <Button
            onClick={handleGenerateAllThumbnails}
            disabled={video.isGenerating}
            variant="outline"
            className="gap-2"
          >
            {video.isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            Generate Thumbnails
          </Button>

          <Button
            onClick={handleAssembleVideo}
            disabled={video.isAssembling || ttsCompleteCount < scenes.length}
            variant="outline"
            className="gap-2"
          >
            {video.isAssembling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Video className="w-4 h-4" />
            )}
            Assemble Video
          </Button>

          <Separator orientation="vertical" className="h-8" />

          <Button
            onClick={handleGenerateFull}
            disabled={tts.isGenerating || video.isGenerating || video.isAssembling}
            variant="default"
            className="gap-2 bg-gradient-to-r from-primary to-primary/80"
          >
            {(tts.isGenerating || video.isGenerating || video.isAssembling) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Full Production
          </Button>
        </div>

        {/* Progress Indicators */}
        {(tts.isGenerating || video.isGenerating || video.isAssembling) && (
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
                isGeneratingTTS={tts.progress.currentScene === scene.sceneId}
                isGeneratingVideo={video.progress.currentScene === scene.sceneId}
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
