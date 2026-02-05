/**
 * AVSyncPreview - Audio/Video Synchronization Preview Component
 * 
 * Features:
 * - Timeline visualization with scene blocks
 * - Audio waveform visualization (simulated)
 * - Playhead scrubbing
 * - Sync status indicators (aligned/mismatched)
 * - Scene preview on hover/click
 * - Cross-product compatible (Spark, Mind, Deck, Vibe, Cast)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize2,
  Check,
  AlertTriangle,
  Clock,
  Waves,
  Film,
  Music,
  Mic,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SceneScript, TemplateMapping } from '@/hooks/useUnifiedAuthoring';

// ============================================
// TYPES
// ============================================

export interface SyncStatus {
  sceneId: string;
  audioUrl?: string;
  audioDuration: number; // seconds
  sceneDuration: number; // seconds
  syncState: 'aligned' | 'audio_too_long' | 'audio_too_short' | 'no_audio';
  deviation: number; // seconds difference
}

export interface AVSyncPreviewProps {
  mapping: TemplateMapping | null;
  syncStatuses?: SyncStatus[];
  onPlayScene?: (sceneId: string) => void;
  onSeek?: (timeSeconds: number) => void;
  onSyncFix?: (sceneId: string, action: 'trim' | 'extend' | 'regenerate') => void;
  isPlaying?: boolean;
  currentTime?: number;
  compact?: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getSyncStatusColor = (status: SyncStatus['syncState']): string => {
  switch (status) {
    case 'aligned': return 'bg-green-500';
    case 'audio_too_long': return 'bg-amber-500';
    case 'audio_too_short': return 'bg-orange-500';
    case 'no_audio': return 'bg-muted';
    default: return 'bg-muted';
  }
};

const getSyncStatusIcon = (status: SyncStatus['syncState']) => {
  switch (status) {
    case 'aligned': return <Check className="h-3 w-3 text-green-500" />;
    case 'audio_too_long': return <AlertTriangle className="h-3 w-3 text-amber-500" />;
    case 'audio_too_short': return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    case 'no_audio': return <VolumeX className="h-3 w-3 text-muted-foreground" />;
    default: return null;
  }
};

// Generate simulated waveform data for visualization
const generateWaveform = (duration: number, density: number = 50): number[] => {
  const points = Math.floor(duration * density);
  return Array.from({ length: points }, () => Math.random() * 0.8 + 0.2);
};

// ============================================
// WAVEFORM COMPONENT
// ============================================

interface WaveformDisplayProps {
  duration: number;
  width: number;
  height: number;
  isActive?: boolean;
  progress?: number; // 0-1
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  duration,
  width,
  height,
  isActive = false,
  progress = 0,
}) => {
  const waveform = React.useMemo(() => generateWaveform(duration), [duration]);
  const barWidth = Math.max(2, width / waveform.length - 1);

  return (
    <div className="relative flex items-center gap-px" style={{ width, height }}>
      {waveform.map((amplitude, i) => {
        const barProgress = i / waveform.length;
        const isPast = barProgress < progress;
        
        return (
          <div
            key={i}
            className={cn(
              "rounded-sm transition-colors",
              isPast ? "bg-primary" : isActive ? "bg-primary/30" : "bg-muted-foreground/20"
            )}
            style={{
              width: barWidth,
              height: `${amplitude * height}px`,
            }}
          />
        );
      })}
    </div>
  );
};

// ============================================
// SCENE BLOCK COMPONENT
// ============================================

interface SceneBlockProps {
  scene: SceneScript;
  syncStatus?: SyncStatus;
  totalDuration: number;
  isActive: boolean;
  onClick: () => void;
  onFixSync?: (action: 'trim' | 'extend' | 'regenerate') => void;
}

const SceneBlock: React.FC<SceneBlockProps> = ({
  scene,
  syncStatus,
  totalDuration,
  isActive,
  onClick,
  onFixSync,
}) => {
  const widthPercent = (scene.durationSeconds / totalDuration) * 100;
  const status = syncStatus?.syncState || 'no_audio';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative h-full flex flex-col cursor-pointer transition-all border-r border-background",
              "hover:brightness-110",
              isActive && "ring-2 ring-primary ring-offset-1"
            )}
            style={{ width: `${widthPercent}%`, minWidth: '60px' }}
            onClick={onClick}
          >
            {/* Scene Header */}
            <div className={cn(
              "flex items-center justify-between px-2 py-1 text-[10px] font-medium",
              "bg-muted/80 border-b border-background"
            )}>
              <span className="truncate">{scene.title}</span>
              <div className="flex items-center gap-1">
                {getSyncStatusIcon(status)}
                <span className="text-muted-foreground">{scene.durationSeconds}s</span>
              </div>
            </div>

            {/* Visual Track */}
            <div className={cn(
              "flex-1 flex items-center justify-center",
              scene.sourceType === 'messaging' ? "bg-blue-500/20" :
              scene.sourceType === 'custom' ? "bg-purple-500/20" :
              "bg-muted/50"
            )}>
              <Film className="h-4 w-4 text-muted-foreground/50" />
            </div>

            {/* Audio Track */}
            <div className={cn(
              "h-8 flex items-center px-1",
              status === 'aligned' ? "bg-green-500/10" :
              status === 'no_audio' ? "bg-muted/30" :
              "bg-amber-500/10"
            )}>
              {status !== 'no_audio' ? (
                <WaveformDisplay
                  duration={syncStatus?.audioDuration || scene.durationSeconds}
                  width={Math.max(50, (widthPercent / 100) * 800 - 10)}
                  height={24}
                  isActive={isActive}
                />
              ) : (
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <VolumeX className="h-3 w-3" />
                  <span>No audio</span>
                </div>
              )}
            </div>

            {/* Sync Status Bar */}
            <div className={cn("h-1", getSyncStatusColor(status))} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{scene.title}</p>
            <p className="text-xs text-muted-foreground">
              Scene: {scene.durationSeconds}s • Audio: {syncStatus?.audioDuration?.toFixed(1) || 'N/A'}s
            </p>
            {syncStatus && syncStatus.syncState !== 'aligned' && syncStatus.syncState !== 'no_audio' && (
              <p className="text-xs text-amber-500">
                {syncStatus.syncState === 'audio_too_long' 
                  ? `Audio ${syncStatus.deviation.toFixed(1)}s too long`
                  : `Audio ${Math.abs(syncStatus.deviation).toFixed(1)}s too short`
                }
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              TTS: {scene.ttsConfig.provider}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const AVSyncPreview: React.FC<AVSyncPreviewProps> = ({
  mapping,
  syncStatuses = [],
  onPlayScene,
  onSeek,
  onSyncFix,
  isPlaying: externalIsPlaying,
  currentTime: externalCurrentTime,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(externalIsPlaying || false);
  const [currentTime, setCurrentTime] = useState(externalCurrentTime || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sync with external state
  useEffect(() => {
    if (externalIsPlaying !== undefined) setIsPlaying(externalIsPlaying);
  }, [externalIsPlaying]);

  useEffect(() => {
    if (externalCurrentTime !== undefined) setCurrentTime(externalCurrentTime);
  }, [externalCurrentTime]);

  // Playback simulation
  useEffect(() => {
    if (!isPlaying || !mapping) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.1;
        if (next >= mapping.totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, mapping]);

  // Find active scene based on current time
  useEffect(() => {
    if (!mapping) return;

    let accumulated = 0;
    for (const scene of mapping.scenes) {
      if (currentTime >= accumulated && currentTime < accumulated + scene.durationSeconds) {
        setActiveSceneId(scene.sceneId);
        break;
      }
      accumulated += scene.durationSeconds;
    }
  }, [currentTime, mapping]);

  const handleSeek = useCallback((value: number[]) => {
    const time = value[0];
    setCurrentTime(time);
    onSeek?.(time);
  }, [onSeek]);

  const handleSceneClick = useCallback((sceneId: string) => {
    const scene = mapping?.scenes.find(s => s.sceneId === sceneId);
    if (!scene || !mapping) return;

    // Calculate start time of scene
    let startTime = 0;
    for (const s of mapping.scenes) {
      if (s.sceneId === sceneId) break;
      startTime += s.durationSeconds;
    }

    setCurrentTime(startTime);
    setActiveSceneId(sceneId);
    onPlayScene?.(sceneId);
  }, [mapping, onPlayScene]);

  const skipToStart = useCallback(() => {
    setCurrentTime(0);
    onSeek?.(0);
  }, [onSeek]);

  const skipToEnd = useCallback(() => {
    if (mapping) {
      setCurrentTime(mapping.totalDuration);
      onSeek?.(mapping.totalDuration);
    }
  }, [mapping, onSeek]);

  // Calculate sync summary
  const syncSummary = React.useMemo(() => {
    if (!syncStatuses.length) return null;
    
    const aligned = syncStatuses.filter(s => s.syncState === 'aligned').length;
    const issues = syncStatuses.filter(s => s.syncState !== 'aligned' && s.syncState !== 'no_audio').length;
    const noAudio = syncStatuses.filter(s => s.syncState === 'no_audio').length;

    return { aligned, issues, noAudio, total: syncStatuses.length };
  }, [syncStatuses]);

  // Generate demo sync statuses if none provided
  const effectiveSyncStatuses = React.useMemo(() => {
    if (syncStatuses.length > 0) return syncStatuses;
    if (!mapping) return [];

    return mapping.scenes.map((scene, i): SyncStatus => {
      // Simulate various sync states for demo
      const states: SyncStatus['syncState'][] = ['aligned', 'aligned', 'audio_too_short', 'aligned', 'audio_too_long', 'aligned'];
      const state = states[i % states.length];
      const deviation = state === 'aligned' ? 0 : 
        state === 'audio_too_long' ? 2.5 : -1.8;

      return {
        sceneId: scene.sceneId,
        audioDuration: scene.durationSeconds + deviation,
        sceneDuration: scene.durationSeconds,
        syncState: state,
        deviation,
      };
    });
  }, [mapping, syncStatuses]);

  if (!mapping) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Waves className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Timeline Data</h3>
          <p className="text-sm text-muted-foreground">
            Create a template mapping to preview A/V synchronization
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Waves className="h-5 w-5" />
              A/V Sync Preview
            </CardTitle>
            <CardDescription>
              {mapping.scenes.length} scenes • {formatTime(mapping.totalDuration)} total
            </CardDescription>
          </div>

          {/* Sync Summary */}
          <div className="flex items-center gap-2">
            {effectiveSyncStatuses.length > 0 && (
              <>
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/30">
                  <Check className="h-3 w-3 mr-1" />
                  {effectiveSyncStatuses.filter(s => s.syncState === 'aligned').length} aligned
                </Badge>
                {effectiveSyncStatuses.filter(s => s.syncState !== 'aligned' && s.syncState !== 'no_audio').length > 0 && (
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/30">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {effectiveSyncStatuses.filter(s => s.syncState !== 'aligned' && s.syncState !== 'no_audio').length} issues
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* Provider Pills */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="secondary" className="text-[10px]">
            <Film className="h-3 w-3 mr-1" />
            {mapping.resolvedProviders.video}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            <Mic className="h-3 w-3 mr-1" />
            {mapping.resolvedProviders.tts}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            <Music className="h-3 w-3 mr-1" />
            {mapping.styleIntent}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timeline */}
        <div className="relative">
          {/* Time Markers */}
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1 px-1">
            <span>{formatTime(0)}</span>
            <span>{formatTime(mapping.totalDuration / 2)}</span>
            <span>{formatTime(mapping.totalDuration)}</span>
          </div>

          {/* Scene Blocks */}
          <ScrollArea className="w-full">
            <div 
              ref={timelineRef}
              className="relative flex h-24 rounded-lg overflow-hidden border bg-muted/30"
              style={{ minWidth: '100%' }}
            >
              {mapping.scenes.map((scene) => (
                <SceneBlock
                  key={scene.sceneId}
                  scene={scene}
                  syncStatus={effectiveSyncStatuses.find(s => s.sceneId === scene.sceneId)}
                  totalDuration={mapping.totalDuration}
                  isActive={activeSceneId === scene.sceneId}
                  onClick={() => handleSceneClick(scene.sceneId)}
                  onFixSync={onSyncFix ? (action) => onSyncFix(scene.sceneId, action) : undefined}
                />
              ))}

              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 pointer-events-none"
                style={{ left: `${(currentTime / mapping.totalDuration) * 100}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Progress Slider */}
          <div className="mt-2">
            <Slider
              value={[currentTime]}
              min={0}
              max={mapping.totalDuration}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={skipToStart}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-10 w-10"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={skipToEnd}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(mapping.totalDuration)}
            </span>

            <Button variant="outline" size="sm" className="gap-1">
              <Maximize2 className="h-3 w-3" />
              Fullscreen
            </Button>
          </div>
        </div>

        {/* Legend */}
        {!compact && (
          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Aligned</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span>Audio too long</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span>Audio too short</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-muted" />
              <span>No audio</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AVSyncPreview;
