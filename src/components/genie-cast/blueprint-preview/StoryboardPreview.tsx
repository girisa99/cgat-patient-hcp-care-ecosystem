/**
 * Storyboard Preview Player
 * Free slideshow preview with scene images + optional TTS audio playback
 * No video API credits consumed
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Image as ImageIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { SceneAssetMapping } from './SceneAssetMapper';

interface StoryboardPreviewProps {
  mappings: SceneAssetMapping[];
  sceneDurations: Record<string, number>; // sceneId -> seconds
  ttsAudioUrls?: Record<string, string>; // sceneId -> audio URL (optional)
  className?: string;
  onRequestVideoPreview?: () => void;
}

export function StoryboardPreview({
  mappings,
  sceneDurations,
  ttsAudioUrls,
  className,
  onRequestVideoPreview,
}: StoryboardPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMapping = mappings[currentIndex];
  const currentDuration = currentMapping
    ? (sceneDurations[currentMapping.sceneId] || 5) * 1000
    : 5000;

  const totalDuration = Object.values(sceneDurations).reduce((sum, d) => sum + d, 0);

  // Calculate elapsed time up to current scene
  const elapsedTime = mappings
    .slice(0, currentIndex)
    .reduce((sum, m) => sum + (sceneDurations[m.sceneId] || 5), 0);

  const progressPercent = totalDuration > 0
    ? ((elapsedTime + (sceneDurations[currentMapping?.sceneId] || 5)) / totalDuration) * 100
    : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-advance logic
  const advanceSlide = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev >= mappings.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [mappings.length]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(advanceSlide, currentDuration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, currentDuration, advanceSlide]);

  // Play TTS audio for current scene
  useEffect(() => {
    if (ttsAudioUrls && currentMapping && !isMuted) {
      const audioUrl = ttsAudioUrls[currentMapping.sceneId];
      if (audioUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(audioUrl);
        audio.volume = 0.8;
        if (isPlaying) audio.play().catch(() => {});
        audioRef.current = audio;
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentIndex, isPlaying, isMuted, ttsAudioUrls, currentMapping]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const goToScene = (index: number) => {
    if (index >= 0 && index < mappings.length) {
      setCurrentIndex(index);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  if (mappings.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-48 bg-muted/30 rounded-lg border border-border/50", className)}>
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No scenes to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("space-y-3", className)}>
      {/* Preview Canvas */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border/50">
        {/* Scene Image */}
        {currentMapping?.assignedAsset ? (
          <img
            src={currentMapping.assignedAsset.url}
            alt={currentMapping.sceneTitle}
            className="w-full h-full object-contain transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-background">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground/50">No asset assigned</p>
            </div>
          </div>
        )}

        {/* Scene Info Overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-black/50 text-white border-0 text-[10px]">
                {currentIndex + 1}/{mappings.length}
              </Badge>
              <span className="text-white/90 text-sm font-medium drop-shadow">
                {currentMapping?.sceneTitle}
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-black/40 text-white/80 border-white/20 capitalize">
              {currentMapping?.sceneType}
            </Badge>
          </div>
        </div>

        {/* Bottom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          {/* Progress Bar */}
          <Progress value={progressPercent} className="h-1 mb-3" />

          <div className="flex items-center justify-between">
            {/* Playback Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => goToScene(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => goToScene(currentIndex + 1)}
                disabled={currentIndex === mappings.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <span className="text-white/70 text-xs">
                {formatTime(elapsedTime)} / {formatTime(totalDuration)}
              </span>

              {/* Volume */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-white hover:bg-white/20"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </Button>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scene Thumbnails Strip */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {mappings.map((mapping, index) => (
          <button
            key={mapping.sceneId}
            onClick={() => goToScene(index)}
            className={cn(
              "flex-shrink-0 w-16 h-10 rounded border-2 overflow-hidden transition-all",
              index === currentIndex
                ? "border-primary shadow-sm"
                : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            {mapping.assignedAsset ? (
              <img
                src={mapping.assignedAsset.thumbnailUrl || mapping.assignedAsset.url}
                alt={mapping.sceneTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-[9px] text-muted-foreground">{index + 1}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Upgrade to Video Preview */}
      {onRequestVideoPreview && (
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 border border-border/30">
          <div className="text-xs text-muted-foreground">
            Want to see real transitions and motion? Generate a low-res 480p video preview.
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 gap-1"
            onClick={onRequestVideoPreview}
          >
            <Play className="h-3 w-3" />
            Video Preview (~1 credit)
          </Button>
        </div>
      )}
    </div>
  );
}
