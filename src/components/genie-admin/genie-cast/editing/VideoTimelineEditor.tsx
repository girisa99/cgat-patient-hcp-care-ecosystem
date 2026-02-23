/**
 * VideoTimelineEditor — Multi-Track Visual Timeline Editor
 *
 * Universal timeline editor for ALL content types:
 *   - AI-generated video (any of 93 styles), offline imports, screen recordings
 *   - Multi-track: video, b-roll, avatar, voiceover, music, SFX, subtitle, overlay
 *   - Drag to reorder clips, resize clips (trim), scrubber, zoom
 *   - Scene/chapter markers with visual grouping
 *   - Import offline video, split, merge, regenerate, replace
 *
 * Style-agnostic: renders the same UI regardless of content source.
 */

import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Scissors,
  Merge,
  Trash2,
  Copy,
  Upload,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  ChevronRight,
  Film,
  Music,
  Mic,
  Type,
  Image,
  Layers,
  GripVertical,
  Maximize2,
  AlertCircle,
  Check,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VideoTimelineHook, TimelineClip, TimelineTrack, TrackType, ClipStatus } from '@/hooks/video-editing/useVideoTimeline';
import type { ClipOperationsHook } from '@/hooks/video-editing/useClipOperations';

// ─── Constants ──────────────────────────────────────────────────────────────

const TRACK_HEIGHT = 56;
const TRACK_LABEL_WIDTH = 140;
const MIN_CLIP_WIDTH = 24;

const TRACK_ICONS: Record<TrackType, React.ElementType> = {
  primary_video: Film,
  b_roll: Image,
  avatar: Layers,
  audio_voice: Mic,
  audio_music: Music,
  audio_sfx: Volume2,
  subtitle: Type,
  overlay: Layers,
};

const TRACK_COLORS: Record<TrackType, string> = {
  primary_video: 'bg-blue-500/80',
  b_roll: 'bg-cyan-500/80',
  avatar: 'bg-purple-500/80',
  audio_voice: 'bg-emerald-500/80',
  audio_music: 'bg-amber-500/80',
  audio_sfx: 'bg-orange-500/80',
  subtitle: 'bg-pink-500/80',
  overlay: 'bg-indigo-500/80',
};

const CLIP_STATUS_STYLES: Record<ClipStatus, { bg: string; border: string; icon?: React.ElementType }> = {
  ready: { bg: 'bg-opacity-90', border: 'border-transparent' },
  generating: { bg: 'bg-opacity-50 animate-pulse', border: 'border-blue-400', icon: Loader2 },
  failed: { bg: 'bg-opacity-60', border: 'border-red-400', icon: AlertCircle },
  placeholder: { bg: 'bg-opacity-30 border-dashed', border: 'border-muted-foreground' },
  importing: { bg: 'bg-opacity-50', border: 'border-amber-400', icon: Upload },
  trimming: { bg: 'bg-opacity-70', border: 'border-yellow-400', icon: Scissors },
  queued: { bg: 'bg-opacity-40', border: 'border-muted-foreground', icon: Loader2 },
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface VideoTimelineEditorProps {
  timeline: VideoTimelineHook;
  clipOps: ClipOperationsHook;
  className?: string;
  compact?: boolean;
  onImportFile?: (file: File) => void;
}

// ─── Time Formatting ────────────────────────────────────────────────────────

function formatTimeMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const frames = Math.floor((ms % 1000) / 33.33); // ~30fps
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;
}

// ─── Toolbar ────────────────────────────────────────────────────────────────

function TimelineToolbar({
  timeline,
  clipOps,
  onImportFile,
}: {
  timeline: VideoTimelineHook;
  clipOps: ClipOperationsHook;
  onImportFile?: (file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSelection = timeline.state.selectedClipIds.length > 0;
  const multiSelected = timeline.state.selectedClipIds.length > 1;

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImportFile?.(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onImportFile]);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Playback */}
      <div className="flex items-center gap-0.5 mr-2">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={timeline.stop}>
          <SkipBack className="h-3.5 w-3.5" />
        </Button>
        {timeline.state.isPlaying ? (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={timeline.pause}>
            <Pause className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={timeline.play}>
            <Play className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => timeline.setPlayhead(timeline.state.totalDurationMs)}>
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Time display */}
      <div className="text-xs font-mono text-muted-foreground px-2 min-w-[100px]">
        {formatTimeMs(timeline.state.playheadMs)} / {formatTimeMs(timeline.state.totalDurationMs)}
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Editing tools */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!hasSelection} onClick={clipOps.splitAtPlayhead}>
              <Scissors className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p className="text-xs">Split at playhead (S)</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!multiSelected} onClick={clipOps.mergeSelected}>
              <Merge className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p className="text-xs">Merge selected</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!hasSelection} onClick={() => {
              const clipId = timeline.state.selectedClipIds[0];
              if (clipId) clipOps.duplicateClip(clipId);
            }}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p className="text-xs">Duplicate clip</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" disabled={!hasSelection} onClick={clipOps.deleteSelected}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p className="text-xs">Delete selected (Del)</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="h-5" />

      {/* Import */}
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-3 w-3" />
        Import
      </Button>
      <input ref={fileInputRef} type="file" accept="video/*,audio/*,image/*" className="hidden" onChange={handleImport} />

      {/* Regenerate failed */}
      {timeline.stats.failedClips > 0 && (
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-amber-600" onClick={clipOps.regenerateAllFailed}>
          <RotateCcw className="h-3 w-3" />
          Retry {timeline.stats.failedClips} Failed
        </Button>
      )}

      <div className="flex-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => timeline.setZoom(timeline.state.zoomLevel / 1.5)}>
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="text-[10px] text-muted-foreground w-8 text-center">{Math.round(timeline.state.zoomLevel * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => timeline.setZoom(timeline.state.zoomLevel * 1.5)}>
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Undo/Redo */}
      <Separator orientation="vertical" className="h-5" />
      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!timeline.canUndo}>
        <Undo2 className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!timeline.canRedo}>
        <Redo2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─── Track Label ────────────────────────────────────────────────────────────

function TrackLabel({
  track,
  onToggleMute,
  onToggleLock,
}: {
  track: TimelineTrack;
  onToggleMute: () => void;
  onToggleLock: () => void;
}) {
  const Icon = TRACK_ICONS[track.type] || Film;
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 border-b border-r bg-muted/30',
        'h-full select-none',
        track.muted && 'opacity-50',
      )}
      style={{ width: TRACK_LABEL_WIDTH, height: TRACK_HEIGHT }}
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <span className="text-xs font-medium truncate flex-1">{track.label}</span>
      <div className="flex items-center gap-0.5">
        <button
          className="p-0.5 rounded hover:bg-muted"
          onClick={onToggleMute}
          title={track.muted ? 'Unmute' : 'Mute'}
        >
          {track.muted ? <VolumeX className="h-3 w-3 text-red-400" /> : <Volume2 className="h-3 w-3 text-muted-foreground" />}
        </button>
        <button
          className="p-0.5 rounded hover:bg-muted"
          onClick={onToggleLock}
          title={track.locked ? 'Unlock' : 'Lock'}
        >
          {track.locked ? <Lock className="h-3 w-3 text-amber-400" /> : <Unlock className="h-3 w-3 text-muted-foreground" />}
        </button>
      </div>
    </div>
  );
}

// ─── Clip Block ─────────────────────────────────────────────────────────────

function ClipBlock({
  clip,
  trackType,
  zoomLevel,
  isSelected,
  onSelect,
  onDoubleClick,
}: {
  clip: TimelineClip;
  trackType: TrackType;
  zoomLevel: number;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
}) {
  const effectiveDuration = clip.durationMs - clip.trimStartMs - clip.trimEndMs;
  const widthPx = Math.max(MIN_CLIP_WIDTH, (effectiveDuration / 1000) * 40 * zoomLevel);
  const leftPx = (clip.startMs / 1000) * 40 * zoomLevel;

  const statusStyle = CLIP_STATUS_STYLES[clip.status];
  const trackColor = TRACK_COLORS[trackType];
  const StatusIcon = statusStyle.icon;

  return (
    <div
      className={cn(
        'absolute top-1 rounded cursor-pointer transition-all group',
        'border',
        trackColor,
        statusStyle.bg,
        statusStyle.border,
        isSelected && 'ring-2 ring-primary ring-offset-1',
        clip.locked && 'cursor-not-allowed opacity-60',
      )}
      style={{
        left: leftPx,
        width: widthPx,
        height: TRACK_HEIGHT - 10,
      }}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      title={`${clip.label} (${(effectiveDuration / 1000).toFixed(1)}s) — ${clip.status}`}
    >
      {/* Clip content */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 h-full overflow-hidden">
        {/* Thumbnail */}
        {clip.thumbnailUrl && (
          <img
            src={clip.thumbnailUrl}
            alt=""
            className="h-full w-8 object-cover rounded-sm flex-shrink-0"
          />
        )}

        {/* Status icon */}
        {StatusIcon && (
          <StatusIcon className={cn(
            'h-3 w-3 flex-shrink-0',
            clip.status === 'generating' && 'animate-spin text-blue-300',
            clip.status === 'failed' && 'text-red-300',
            clip.status === 'importing' && 'text-amber-300',
            clip.status === 'queued' && 'text-muted-foreground',
          )} />
        )}

        {/* Label */}
        {widthPx > 50 && (
          <span className="text-[10px] text-white truncate leading-tight">
            {clip.label}
          </span>
        )}

        {/* Duration badge */}
        {widthPx > 80 && (
          <span className="text-[9px] text-white/70 ml-auto flex-shrink-0">
            {(effectiveDuration / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      {/* Trim handles (shown on hover) */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 bg-white/30 rounded-l" />
      <div className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100 bg-white/30 rounded-r" />
    </div>
  );
}

// ─── Time Ruler ─────────────────────────────────────────────────────────────

function TimeRuler({ durationMs, zoomLevel }: { durationMs: number; zoomLevel: number }) {
  const totalSec = Math.ceil(durationMs / 1000) + 5; // Extra space
  const intervalSec = zoomLevel > 2 ? 1 : zoomLevel > 0.5 ? 5 : 10;
  const ticks: { sec: number; major: boolean }[] = [];

  for (let s = 0; s <= totalSec; s += intervalSec) {
    ticks.push({ sec: s, major: s % (intervalSec * 2) === 0 });
  }

  return (
    <div
      className="relative h-6 border-b bg-muted/20"
      style={{ marginLeft: TRACK_LABEL_WIDTH }}
    >
      {ticks.map(t => (
        <div
          key={t.sec}
          className="absolute top-0 h-full"
          style={{ left: t.sec * 40 * zoomLevel }}
        >
          <div className={cn('w-px h-full', t.major ? 'bg-border' : 'bg-border/50')} />
          {t.major && (
            <span className="absolute top-0.5 left-1 text-[9px] text-muted-foreground select-none">
              {Math.floor(t.sec / 60)}:{(t.sec % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Playhead ───────────────────────────────────────────────────────────────

function Playhead({ timeMs, zoomLevel }: { timeMs: number; zoomLevel: number }) {
  const leftPx = (timeMs / 1000) * 40 * zoomLevel;
  return (
    <div
      className="absolute top-0 bottom-0 z-30 pointer-events-none"
      style={{ left: leftPx + TRACK_LABEL_WIDTH }}
    >
      {/* Head */}
      <div className="w-3 h-3 -ml-1.5 bg-red-500 clip-triangle" style={{
        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
      }} />
      {/* Line */}
      <div className="w-px h-full bg-red-500 ml-[5px]" />
    </div>
  );
}

// ─── Scene Markers ──────────────────────────────────────────────────────────

function SceneMarkers({
  scenes,
  chapters,
  markers,
  zoomLevel,
}: {
  scenes: VideoTimelineHook['state']['scenes'];
  chapters: VideoTimelineHook['state']['chapters'];
  markers: VideoTimelineHook['state']['markers'];
  zoomLevel: number;
}) {
  return (
    <div className="relative h-5 border-b bg-muted/10" style={{ marginLeft: TRACK_LABEL_WIDTH }}>
      {/* Scene blocks */}
      {scenes.map((scene, i) => (
        <div
          key={scene.id}
          className={cn(
            'absolute top-0 h-full border-x border-t rounded-t-sm',
            scene.approved ? 'bg-emerald-500/10 border-emerald-400/30' : 'bg-blue-500/10 border-blue-400/30',
          )}
          style={{
            left: (scene.startMs / 1000) * 40 * zoomLevel,
            width: (scene.durationMs / 1000) * 40 * zoomLevel,
          }}
          title={`Scene: ${scene.label}${scene.approved ? ' (approved)' : ''}`}
        >
          <span className="text-[8px] px-1 text-muted-foreground truncate block">
            {scene.label}
          </span>
        </div>
      ))}

      {/* Markers */}
      {markers.map(m => (
        <div
          key={m.id}
          className="absolute top-0 h-full z-10"
          style={{ left: (m.timeMs / 1000) * 40 * zoomLevel }}
          title={`${m.type}: ${m.label}`}
        >
          <div className="w-2 h-2 rounded-full -ml-1" style={{ backgroundColor: m.color }} />
        </div>
      ))}
    </div>
  );
}

// ─── Stats Bar ──────────────────────────────────────────────────────────────

function TimelineStats({ stats }: { stats: VideoTimelineHook['stats'] }) {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] text-muted-foreground border-t bg-muted/10">
      <span>{stats.totalClips} clips</span>
      <span>{stats.totalTracks} tracks</span>
      <span>{stats.totalScenes} scenes</span>
      <span>{stats.totalChapters} chapters</span>
      <span className="text-emerald-600">{stats.readyClips} ready</span>
      {stats.generatingClips > 0 && <span className="text-blue-500">{stats.generatingClips} generating</span>}
      {stats.failedClips > 0 && <span className="text-red-500">{stats.failedClips} failed</span>}
      <span className="ml-auto font-medium">{stats.totalDurationFormatted}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function VideoTimelineEditor({
  timeline,
  clipOps,
  className,
  compact = false,
  onImportFile,
}: VideoTimelineEditorProps) {
  const { state, stats } = timeline;
  const [dragState, setDragState] = useState<{ clipId: string; startX: number; origStartMs: number } | null>(null);

  // Handle clip selection
  const handleClipSelect = useCallback((clipId: string, e: React.MouseEvent) => {
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      // Multi-select
      const current = state.selectedClipIds;
      if (current.includes(clipId)) {
        timeline.selectClips(current.filter(id => id !== clipId));
      } else {
        timeline.selectClips([...current, clipId]);
      }
    } else {
      timeline.selectClips([clipId]);
    }
  }, [state.selectedClipIds, timeline]);

  // Handle double-click (edit clip properties)
  const handleClipDoubleClick = useCallback((clipId: string) => {
    const clip = state.clips[clipId];
    if (!clip) return;
    // Could open a clip properties panel — for now, toggle lock
    if (clip.status === 'failed') {
      timeline.regenerateClip(clipId);
    }
  }, [state.clips, timeline]);

  // Handle click on timeline background to set playhead
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timeMs = (x / (40 * state.zoomLevel)) * 1000;
    timeline.setPlayhead(Math.max(0, timeMs));
  }, [state.zoomLevel, timeline]);

  // Default file import handler
  const handleImport = useCallback((file: File) => {
    if (onImportFile) {
      onImportFile(file);
      return;
    }
    // Default: import to primary video track
    const videoTrack = state.tracks.find(t => t.type === 'primary_video');
    if (!videoTrack) return;

    const isAudio = file.type.startsWith('audio/');
    const isImage = file.type.startsWith('image/');
    const targetTrack = isAudio
      ? state.tracks.find(t => t.type === 'audio_voice') || videoTrack
      : videoTrack;

    timeline.importOfflineClip(
      targetTrack.id,
      file,
      state.totalDurationMs,
      isImage ? 5000 : 30000, // Default 5s for image, 30s for video/audio
    );
  }, [state.tracks, state.totalDurationMs, timeline, onImportFile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          state.isPlaying ? timeline.pause() : timeline.play();
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey) clipOps.splitAtPlayhead();
          break;
        case 'Delete':
        case 'Backspace':
          clipOps.deleteSelected();
          break;
        case 'd':
          if (!e.ctrlKey && !e.metaKey) {
            const first = state.selectedClipIds[0];
            if (first) clipOps.duplicateClip(first);
          }
          break;
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            timeline.selectClips(Object.keys(state.clips));
          }
          break;
        case 'Escape':
          timeline.selectClips([]);
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, timeline, clipOps]);

  const timelineWidthPx = Math.max(800, ((state.totalDurationMs / 1000) + 10) * 40 * state.zoomLevel);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Film className="w-4 h-4" />
              Timeline Editor
            </CardTitle>
            {!compact && (
              <CardDescription className="text-xs mt-0.5">
                Multi-track editing — drag, trim, split, merge across all media types
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {stats.totalClips} clips
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {stats.totalDurationFormatted}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Toolbar */}
      <div className="px-3 py-1.5 border-y bg-muted/20">
        <TimelineToolbar timeline={timeline} clipOps={clipOps} onImportFile={handleImport} />
      </div>

      {/* Timeline area */}
      <CardContent className="p-0">
        <ScrollArea className="w-full" type="always">
          <div className="relative" style={{ minWidth: timelineWidthPx + TRACK_LABEL_WIDTH }}>
            {/* Time ruler */}
            <TimeRuler durationMs={state.totalDurationMs} zoomLevel={state.zoomLevel} />

            {/* Scene/chapter markers */}
            <SceneMarkers
              scenes={state.scenes}
              chapters={state.chapters}
              markers={state.markers}
              zoomLevel={state.zoomLevel}
            />

            {/* Tracks */}
            {state.tracks.map(track => (
              <div key={track.id} className="flex" style={{ height: TRACK_HEIGHT }}>
                {/* Label */}
                <TrackLabel
                  track={track}
                  onToggleMute={() => timeline.toggleTrackMute(track.id)}
                  onToggleLock={() => timeline.toggleTrackLock(track.id)}
                />

                {/* Clip area */}
                <div
                  className="relative flex-1 border-b bg-muted/5 hover:bg-muted/10 transition-colors"
                  onClick={handleTimelineClick}
                >
                  {track.clips.map(clipId => {
                    const clip = state.clips[clipId];
                    if (!clip) return null;
                    return (
                      <ClipBlock
                        key={clipId}
                        clip={clip}
                        trackType={track.type}
                        zoomLevel={state.zoomLevel}
                        isSelected={state.selectedClipIds.includes(clipId)}
                        onSelect={(e) => handleClipSelect(clipId, e)}
                        onDoubleClick={() => handleClipDoubleClick(clipId)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Playhead overlay */}
            <Playhead timeMs={state.playheadMs} zoomLevel={state.zoomLevel} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Speed control */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-t bg-muted/10">
          <span className="text-[10px] text-muted-foreground">Speed:</span>
          <div className="flex items-center gap-1">
            {[0.5, 1, 1.5, 2].map(speed => (
              <Button
                key={speed}
                variant={state.playbackSpeed === speed ? 'default' : 'ghost'}
                size="sm"
                className="h-5 px-1.5 text-[10px]"
                onClick={() => timeline.setSpeed(speed)}
              >
                {speed}x
              </Button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Add track */}
          <Button variant="ghost" size="sm" className="h-5 text-[10px] gap-1" onClick={() => timeline.addTrack('overlay', 'Overlay')}>
            <Plus className="h-3 w-3" />
            Track
          </Button>
        </div>

        {/* Stats bar */}
        <TimelineStats stats={stats} />
      </CardContent>
    </Card>
  );
}

export default VideoTimelineEditor;
