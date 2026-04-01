import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaylistPart {
  partNumber: number;
  videoUrl: string;
  thumbnailUrl?: string | null;
  estimatedDuration?: number;
}

interface PlaylistVideoPlayerProps {
  parts: PlaylistPart[];
  className?: string;
  autoPlay?: boolean;
  onPlaybackComplete?: () => void;
}

/**
 * Sequential video playlist player — plays parts back-to-back with preloading.
 * Eliminates need for server-side stitching of 12+ parts.
 */
export function PlaylistVideoPlayer({
  parts,
  className,
  autoPlay = false,
  onPlaybackComplete,
}: PlaylistVideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [partDurations, setPartDurations] = useState<Record<number, number>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);

  const currentPart = parts[currentIndex];
  const nextPart = parts[currentIndex + 1] ?? null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === parts.length - 1;

  // Total known duration
  const totalDuration = Object.values(partDurations).reduce((a, b) => a + b, 0);
  const elapsedBefore = parts
    .slice(0, currentIndex)
    .reduce((sum, p) => sum + (partDurations[p.partNumber] ?? p.estimatedDuration ?? 0), 0);

  // Track actual durations as metadata loads
  const handleLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    if (vid.duration && isFinite(vid.duration)) {
      setPartDurations(prev => ({ ...prev, [currentPart.partNumber]: vid.duration }));
    }
  }, [currentPart?.partNumber]);

  // Auto-advance to next part when current ends
  const handleEnded = useCallback(() => {
    if (isLast) {
      setIsPlaying(false);
      onPlaybackComplete?.();
    } else {
      setCurrentIndex(prev => prev + 1);
      // isPlaying stays true — next part auto-plays
    }
  }, [isLast, onPlaybackComplete]);

  // Update progress bar
  const handleTimeUpdate = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    const partProgress = elapsedBefore + vid.currentTime;
    const total = totalDuration || parts.reduce((s, p) => s + (p.estimatedDuration ?? 120), 0);
    setProgress(total > 0 ? (partProgress / total) * 100 : 0);
  }, [elapsedBefore, totalDuration, parts]);

  // Auto-play when index changes
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.load();
    if (isPlaying) {
      vid.play().catch(() => {});
    }
  }, [currentIndex, isPlaying]);

  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, []);

  const goToPart = useCallback((index: number) => {
    if (index >= 0 && index < parts.length) {
      setCurrentIndex(index);
    }
  }, [parts.length]);

  if (!parts.length || !currentPart) {
    return <div className="text-sm text-muted-foreground p-4">No video parts available</div>;
  }

  return (
    <div className={cn("rounded-xl overflow-hidden border border-green-500/30 bg-black", className)}>
      {/* Main video */}
      <div className="relative">
        <video
          ref={videoRef}
          src={currentPart.videoUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full"
          playsInline
          preload="auto"
        />
        {/* Part indicator overlay */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">
          Part {currentPart.partNumber} of {parts.length}
        </div>
      </div>

      {/* Preload next part (hidden) */}
      {nextPart && (
        <video
          ref={nextVideoRef}
          src={nextPart.videoUrl}
          preload="auto"
          className="hidden"
          muted
        />
      )}

      {/* Progress bar (full timeline) */}
      <div className="h-1 bg-gray-800 relative">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
        {/* Part separators */}
        {parts.map((_, i) => {
          if (i === 0) return null;
          const offset = parts.slice(0, i).reduce(
            (s, p) => s + (partDurations[p.partNumber] ?? p.estimatedDuration ?? 120), 0
          );
          const total = totalDuration || parts.reduce((s, p) => s + (p.estimatedDuration ?? 120), 0);
          const pct = total > 0 ? (offset / total) * 100 : 0;
          return (
            <div
              key={i}
              className="absolute top-0 h-full w-px bg-white/30"
              style={{ left: `${pct}%` }}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900/90">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-white hover:bg-white/10"
            onClick={() => goToPart(0)}
            disabled={isFirst}
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-white hover:bg-white/10"
            onClick={() => goToPart(currentIndex - 1)}
            disabled={isFirst}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-white hover:bg-white/10"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-white hover:bg-white/10"
            onClick={() => goToPart(currentIndex + 1)}
            disabled={isLast}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-white hover:bg-white/10"
            onClick={() => goToPart(parts.length - 1)}
            disabled={isLast}
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Part chips */}
        <div className="flex gap-0.5 overflow-x-auto max-w-[60%]">
          {parts.map((p, i) => (
            <button
              key={p.partNumber}
              onClick={() => goToPart(i)}
              className={cn(
                "text-[9px] px-1.5 py-0.5 rounded-full transition-colors shrink-0",
                i === currentIndex
                  ? "bg-violet-500 text-white"
                  : i < currentIndex
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
              )}
            >
              {p.partNumber}
            </button>
          ))}
        </div>

        {/* Download current part */}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 p-0 px-1.5 text-white hover:bg-white/10 text-[10px]"
          asChild
        >
          <a href={currentPart.videoUrl} download={`EP04-Part-${currentPart.partNumber}.mp4`}>
            <Download className="h-3 w-3 mr-1" />
            Part {currentPart.partNumber}
          </a>
        </Button>
      </div>
    </div>
  );
}
