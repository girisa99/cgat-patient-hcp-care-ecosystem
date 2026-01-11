/**
 * Multi-Clip Timeline
 * P1 Feature: Timeline for assembling and remixing multiple clips
 * Target: Content remix gap in market
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  GripVertical,
  Trash2,
  Copy,
  Scissors,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Plus,
  Film,
  Music,
  Type,
  Image,
  Layers,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';

export interface TimelineClip {
  id: string;
  type: 'video' | 'audio' | 'image' | 'text';
  name: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  startTime: number; // Position on timeline
  duration: number;
  inPoint: number; // Trim start within clip
  outPoint: number; // Trim end within clip
  track: number;
  volume?: number;
  opacity?: number;
  effects?: string[];
  // Audio sync properties (from AudioMixer)
  fadeIn?: number;
  fadeOut?: number;
  audioType?: 'recording' | 'voiceover' | 'music';
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'overlay';
  locked: boolean;
  muted: boolean;
  visible: boolean;
}

// Audio track data from mixer (for import)
export interface MixedAudioTrack {
  id: string;
  name: string;
  url?: string;
  type: 'recording' | 'voiceover' | 'music';
  duration?: number;
  volume: number;
  muted: boolean;
  startOffset: number;
  fadeIn: number;
  fadeOut: number;
  trimStart: number;
  trimEnd: number;
}

interface MultiClipTimelineProps {
  clips?: TimelineClip[];
  mixedAudioTracks?: MixedAudioTrack[]; // Import from AudioMixer
  onClipsChange?: (clips: TimelineClip[]) => void;
  onExport?: (format: string) => void;
  className?: string;
}

const DEFAULT_TRACKS: TimelineTrack[] = [
  { id: 'video-1', name: 'Video 1', type: 'video', locked: false, muted: false, visible: true },
  { id: 'audio-1', name: 'Voiceover', type: 'audio', locked: false, muted: false, visible: true },
  { id: 'audio-2', name: 'Music', type: 'audio', locked: false, muted: false, visible: true },
  { id: 'overlay-1', name: 'Overlay', type: 'overlay', locked: false, muted: false, visible: true },
];

export const MultiClipTimeline: React.FC<MultiClipTimelineProps> = ({
  clips: initialClips = [],
  mixedAudioTracks = [],
  onClipsChange,
  onExport,
  className
}) => {
  const { vibrate } = useMobileFeatures();
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const [clips, setClips] = useState<TimelineClip[]>(initialClips);
  const [tracks, setTracks] = useState<TimelineTrack[]>(DEFAULT_TRACKS);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [history, setHistory] = useState<TimelineClip[][]>([initialClips]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [draggedClip, setDraggedClip] = useState<TimelineClip | null>(null);

  // Import mixed audio tracks from AudioMixer when they change
  React.useEffect(() => {
    if (mixedAudioTracks.length > 0) {
      const audioClips: TimelineClip[] = mixedAudioTracks.map((audioTrack, index) => {
        const effectiveDuration = (audioTrack.duration || 30) - audioTrack.trimStart - audioTrack.trimEnd;
        // Assign voiceovers to track 1, music to track 2
        const trackIndex = audioTrack.type === 'music' ? 2 : 1;
        
        return {
          id: `imported-${audioTrack.id}`,
          type: 'audio' as const,
          name: audioTrack.name,
          sourceUrl: audioTrack.url,
          startTime: audioTrack.startOffset,
          duration: effectiveDuration,
          inPoint: audioTrack.trimStart,
          outPoint: (audioTrack.duration || 30) - audioTrack.trimEnd,
          track: trackIndex,
          volume: audioTrack.volume / 100,
          fadeIn: audioTrack.fadeIn,
          fadeOut: audioTrack.fadeOut,
          audioType: audioTrack.type,
        };
      });

      // Merge with existing clips (avoid duplicates)
      setClips(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const newClips = audioClips.filter(c => !existingIds.has(c.id));
        if (newClips.length > 0) {
          toast.success(`Imported ${newClips.length} audio track(s) from mixer`);
          return [...prev, ...newClips];
        }
        return prev;
      });
    }
  }, [mixedAudioTracks]);

  // Calculate total duration
  const totalDuration = useMemo(() => {
    if (clips.length === 0) return 60; // Default 60 seconds
    return Math.max(...clips.map(c => c.startTime + c.duration), 60);
  }, [clips]);

  // Pixels per second
  const pxPerSecond = 50 * zoom;

  // Update clips with history
  const updateClips = useCallback((newClips: TimelineClip[]) => {
    setClips(newClips);
    
    // Update history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newClips);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    onClipsChange?.(newClips);
  }, [history, historyIndex, onClipsChange]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setClips(history[historyIndex - 1]);
      onClipsChange?.(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setClips(history[historyIndex + 1]);
      onClipsChange?.(history[historyIndex + 1]);
    }
  };

  const selectClip = (clipId: string) => {
    setSelectedClipId(clipId);
    vibrate?.(50);
  };

  const deleteClip = (clipId: string) => {
    const newClips = clips.filter(c => c.id !== clipId);
    updateClips(newClips);
    setSelectedClipId(null);
    toast.success('Clip removed');
  };

  const duplicateClip = (clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (clip) {
      const newClip: TimelineClip = {
        ...clip,
        id: crypto.randomUUID(),
        startTime: clip.startTime + clip.duration + 0.5,
      };
      updateClips([...clips, newClip]);
      toast.success('Clip duplicated');
    }
  };

  const splitClip = (clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    const splitPoint = currentTime - clip.startTime;
    if (splitPoint <= 0 || splitPoint >= clip.duration) {
      toast.error('Move playhead to split point within clip');
      return;
    }

    const clip1: TimelineClip = {
      ...clip,
      duration: splitPoint,
      outPoint: clip.inPoint + splitPoint,
    };

    const clip2: TimelineClip = {
      ...clip,
      id: crypto.randomUUID(),
      startTime: clip.startTime + splitPoint,
      duration: clip.duration - splitPoint,
      inPoint: clip.inPoint + splitPoint,
    };

    const newClips = clips.filter(c => c.id !== clipId);
    newClips.push(clip1, clip2);
    updateClips(newClips);
    toast.success('Clip split');
  };

  const moveClip = (clipId: string, newStartTime: number, newTrack?: number) => {
    const newClips = clips.map(c => {
      if (c.id === clipId) {
        return {
          ...c,
          startTime: Math.max(0, newStartTime),
          track: newTrack ?? c.track,
        };
      }
      return c;
    });
    updateClips(newClips);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    vibrate?.(30);
  };

  const seekTo = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, totalDuration)));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const addClipFromLibrary = (type: TimelineClip['type']) => {
    const mockClip: TimelineClip = {
      id: crypto.randomUUID(),
      type,
      name: `New ${type} clip`,
      startTime: currentTime,
      duration: 10,
      inPoint: 0,
      outPoint: 10,
      track: type === 'video' ? 0 : type === 'audio' ? 1 : 2,
      volume: 1,
      opacity: 1,
    };
    updateClips([...clips, mockClip]);
    setSelectedClipId(mockClip.id);
    toast.success(`Added ${type} clip`);
  };

  // Enhanced clip coloring - includes audio subtypes
  const getClipColor = (clip: TimelineClip) => {
    if (clip.type === 'audio' && clip.audioType) {
      switch (clip.audioType) {
        case 'voiceover': return 'bg-purple-500';
        case 'music': return 'bg-amber-500';
        case 'recording': return 'bg-green-500';
      }
    }
    switch (clip.type) {
      case 'video': return 'bg-blue-500';
      case 'audio': return 'bg-green-500';
      case 'image': return 'bg-purple-500';
      case 'text': return 'bg-yellow-500';
      default: return 'bg-muted';
    }
  };

  const getTrackIcon = (type: TimelineTrack['type']) => {
    switch (type) {
      case 'video': return Film;
      case 'audio': return Music;
      case 'overlay': return Layers;
      default: return Film;
    }
  };

  const selectedClip = clips.find(c => c.id === selectedClipId);

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="pb-2 px-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Film className="h-4 w-4 text-primary" />
            Multi-Clip Timeline
          </CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs px-1.5">{clips.length} clips</Badge>
            <Badge variant="secondary" className="text-xs px-1.5">{formatTime(totalDuration)}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 px-2 pb-3">
        {/* Transport Controls - Compact */}
        <div className="flex items-center justify-between gap-2 p-1.5 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={historyIndex <= 0}>
              <Undo className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => seekTo(0)}>
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon" 
              className="h-8 w-8"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => seekTo(totalDuration)}>
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono min-w-[55px] text-right">{formatTime(currentTime)}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Timeline Seekbar */}
        <div className="px-1">
          <Slider
            value={[currentTime]}
            min={0}
            max={totalDuration}
            step={0.1}
            onValueChange={([value]) => seekTo(value)}
            className="cursor-pointer"
          />
        </div>

        {/* Add Clip Buttons - More compact */}
        <div className="flex gap-1 flex-wrap">
          <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => addClipFromLibrary('video')}>
            <Film className="h-3 w-3 mr-0.5" />
            Video
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => addClipFromLibrary('audio')}>
            <Music className="h-3 w-3 mr-0.5" />
            Audio
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => addClipFromLibrary('image')}>
            <Image className="h-3 w-3 mr-0.5" />
            Image
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={() => addClipFromLibrary('text')}>
            <Type className="h-3 w-3 mr-0.5" />
            Text
          </Button>
        </div>
        
        {/* Help text - more compact */}
        <div className="text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded">
          <p><strong>Video:</strong> Main footage | <strong>Audio:</strong> Music/voiceover | <strong>Image:</strong> Photos/graphics | <strong>Text:</strong> Titles/captions</p>
        </div>

        {/* Zoom Controls - compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] text-muted-foreground min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(4, zoom + 0.25))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Timeline Tracks - constrained width */}
        <div className="border rounded-lg overflow-hidden">
          {/* Timeline Header - Time Ruler */}
          <div className="flex border-b bg-muted/30">
            <div className="w-16 flex-shrink-0 p-1.5 border-r text-[10px] font-medium">
              Tracks
            </div>
            <ScrollArea className="flex-1">
              <div 
                className="h-5 relative"
                style={{ width: Math.max(totalDuration * pxPerSecond, 200) }}
              >
                {/* Time markers */}
                {Array.from({ length: Math.ceil(totalDuration / 5) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full border-l border-muted-foreground/30"
                    style={{ left: i * 5 * pxPerSecond }}
                  >
                    <span className="text-[8px] text-muted-foreground pl-0.5">
                      {formatTime(i * 5).split(':').slice(0, 2).join(':')}
                    </span>
                  </div>
                ))}
                
                {/* Playhead */}
                <div
                  className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
                  style={{ left: currentTime * pxPerSecond }}
                >
                  <div className="w-2 h-2 bg-red-500 -ml-[3px] -mt-0.5 rotate-45" />
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Track Rows - compact */}
          {tracks.map((track, trackIndex) => {
            const TrackIcon = getTrackIcon(track.type);
            const trackClips = clips.filter(c => c.track === trackIndex);

            return (
              <div 
                key={track.id} 
                className={cn(
                  "flex border-b last:border-b-0",
                  track.muted && "opacity-50"
                )}
              >
                {/* Track Header - narrow */}
                <div className="w-16 flex-shrink-0 p-1.5 border-r bg-muted/20 space-y-0.5">
                  <div className="flex items-center gap-0.5">
                    <TrackIcon className="h-2.5 w-2.5" />
                    <span className="text-[9px] font-medium truncate">{track.name}</span>
                  </div>
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => {
                        const newTracks = [...tracks];
                        newTracks[trackIndex].muted = !newTracks[trackIndex].muted;
                        setTracks(newTracks);
                      }}
                    >
                      {track.muted ? (
                        <VolumeX className="h-2.5 w-2.5" />
                      ) : (
                        <Volume2 className="h-2.5 w-2.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Track Content - constrained */}
                <ScrollArea className="flex-1">
                  <div 
                    ref={trackIndex === 0 ? timelineRef : undefined}
                    className="h-12 relative bg-muted/10"
                    style={{ width: Math.max(totalDuration * pxPerSecond, 200) }}
                  >
                    {/* Clips on this track */}
                    {trackClips.map(clip => (
                      <div
                        key={clip.id}
                        className={cn(
                          "absolute top-1 h-10 rounded cursor-pointer transition-all",
                          getClipColor(clip),
                          selectedClipId === clip.id 
                            ? "ring-2 ring-primary ring-offset-1" 
                            : "hover:brightness-110"
                        )}
                        style={{
                          left: clip.startTime * pxPerSecond,
                          width: Math.max(clip.duration * pxPerSecond, 30),
                        }}
                        onClick={() => selectClip(clip.id)}
                      >
                        <div className="p-0.5 h-full flex flex-col justify-between overflow-hidden">
                          <div className="flex items-center gap-0.5">
                            <GripVertical className="h-2.5 w-2.5 text-white/70 cursor-grab" />
                            <span className="text-[8px] text-white font-medium truncate">
                              {clip.name}
                            </span>
                          </div>
                          <span className="text-[7px] text-white/70">
                            {clip.duration.toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Playhead line */}
                    <div
                      className="absolute top-0 w-0.5 h-full bg-red-500/50 pointer-events-none"
                      style={{ left: currentTime * pxPerSecond }}
                    />
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            );
          })}
        </div>

        {/* Selected Clip Controls */}
        {selectedClip && (
          <div className="p-3 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{selectedClip.name}</span>
              <Badge variant="outline">{selectedClip.type}</Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => duplicateClip(selectedClip.id)}
              >
                <Copy className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => splitClip(selectedClip.id)}
              >
                <Scissors className="h-4 w-4 mr-1" />
                Split
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteClip(selectedClip.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>

            {/* Volume/Opacity sliders */}
            {selectedClip.type === 'audio' || selectedClip.type === 'video' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[(selectedClip.volume || 1) * 100]}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                    onValueChange={([value]) => {
                      const newClips = clips.map(c =>
                        c.id === selectedClip.id ? { ...c, volume: value / 100 } : c
                      );
                      updateClips(newClips);
                    }}
                  />
                  <span className="text-xs text-muted-foreground w-8">
                    {Math.round((selectedClip.volume || 1) * 100)}%
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Export Button */}
        <Button 
          className="w-full" 
          onClick={() => onExport?.('mp4')}
          disabled={clips.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Timeline
        </Button>
      </CardContent>
    </Card>
  );
};

export default MultiClipTimeline;
