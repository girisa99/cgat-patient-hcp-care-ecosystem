/**
 * Recording Preview Component - Shows recorded video with playback controls and trimming
 */

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, Download, Trash2, Scissors, RotateCcw, Edit3 } from 'lucide-react';

interface RecordingPreviewProps {
  blob: Blob | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onTrim?: (startTime: number, endTime: number) => void;
  onEdit?: () => void;
}

export function RecordingPreview({
  blob,
  isOpen,
  onClose,
  onSave,
  onDiscard,
  onTrim,
  onEdit,
}: RecordingPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [showTrimControls, setShowTrimControls] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [blob]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setTrimEnd(video.duration);
    };
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleApplyTrim = () => {
    if (onTrim && trimStart < trimEnd) {
      onTrim(trimStart, trimEnd);
    }
  };

  if (!isOpen || !blob) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Recording Preview</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>

        {/* Video */}
        <div className="relative aspect-video bg-black">
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Playback Controls */}
        <div className="p-4 space-y-4">
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-12">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration || 100}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-12 text-right">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button size="icon" variant="outline" onClick={togglePlay}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="icon" variant="outline" onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={showTrimControls ? 'default' : 'outline'}
              onClick={() => setShowTrimControls(!showTrimControls)}
              className="gap-2"
            >
              <Scissors className="w-4 h-4" />
              Trim
            </Button>
          </div>

          {/* Trim Controls */}
          {showTrimControls && (
            <div className="p-3 bg-muted/30 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs w-16">Start: {formatTime(trimStart)}</span>
                <Slider
                  value={[trimStart]}
                  onValueChange={([v]) => setTrimStart(Math.min(v, trimEnd - 0.5))}
                  max={duration}
                  step={0.1}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs w-16">End: {formatTime(trimEnd)}</span>
                <Slider
                  value={[trimEnd]}
                  onValueChange={([v]) => setTrimEnd(Math.max(v, trimStart + 0.5))}
                  max={duration}
                  step={0.1}
                  className="flex-1"
                />
              </div>
              <Button size="sm" onClick={handleApplyTrim} className="w-full">
                Apply Trim ({formatTime(trimEnd - trimStart)})
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onDiscard} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Discard
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={onEdit} className="gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Video
            </Button>
          )}
          <Button onClick={onSave} className="gap-2">
            <Download className="w-4 h-4" />
            Save Recording
          </Button>
        </div>
      </div>
    </div>
  );
}
