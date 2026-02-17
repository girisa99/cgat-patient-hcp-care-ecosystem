/**
 * ChapterVideoPreview - In-place video player with dialog expand option
 * Replaces static preview images with playable content
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Play, Pause, Maximize2, Volume2, VolumeX,
  RotateCcw, Download, Loader2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChapterVideoPreviewProps {
  chapterTitle: string;
  previewUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  className?: string;
  onRegenerate?: () => void;
}

export const ChapterVideoPreview: React.FC<ChapterVideoPreviewProps> = ({
  chapterTitle,
  previewUrl,
  videoUrl,
  audioUrl,
  className,
  onRegenerate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogVideoRef = useRef<HTMLVideoElement>(null);

  // Determine the best source to use
  const mediaUrl = videoUrl || previewUrl;
  const isVideo = mediaUrl && (
    mediaUrl.includes('.mp4') || 
    mediaUrl.includes('.webm') || 
    mediaUrl.includes('.mov') ||
    mediaUrl.includes('video/mp4') ||
    mediaUrl.includes('data:video')
  );

  const handlePlay = async () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsLoading(true);
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error('[ChapterVideoPreview] Play failed:', e);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDialogPlay = async () => {
    if (!dialogVideoRef.current) return;
    
    try {
      if (dialogVideoRef.current.paused) {
        await dialogVideoRef.current.play();
      } else {
        dialogVideoRef.current.pause();
      }
    } catch (e) {
      console.error('[ChapterVideoPreview] Dialog play failed:', e);
    }
  };

  const handleDownload = () => {
    if (mediaUrl) {
      const link = document.createElement('a');
      link.href = mediaUrl;
      link.download = `${chapterTitle.replace(/\s+/g, '_')}.${isVideo ? 'mp4' : 'jpg'}`;
      link.click();
    }
  };

  if (!mediaUrl) {
    return (
      <div className={cn(
        "relative aspect-video rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center",
        className
      )}>
        <div className="text-center text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No preview available</p>
          {onRegenerate && (
            <Button size="sm" variant="outline" className="mt-2" onClick={onRegenerate}>
              <RotateCcw className="w-3 h-3 mr-1" /> Generate
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={cn(
        "relative aspect-video rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center",
        className
      )}>
        <div className="text-center text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm">Preview failed to load</p>
          {onRegenerate && (
            <Button size="sm" variant="outline" className="mt-2" onClick={onRegenerate}>
              <RotateCcw className="w-3 h-3 mr-1" /> Regenerate
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn(
        "relative aspect-video rounded-lg overflow-hidden bg-black group",
        className
      )}>
        {isVideo ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-full object-cover"
              muted={isMuted}
              loop
              playsInline
              onLoadedData={() => setIsLoading(false)}
              onError={() => setHasError(true)}
              onEnded={() => setIsPlaying(false)}
              poster={previewUrl !== videoUrl ? previewUrl : undefined}
            />
          </>
        ) : (
          <img
            src={mediaUrl}
            alt={chapterTitle}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-white text-sm font-medium truncate">
            {chapterTitle}
          </p>
        </div>

        {/* Controls overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="flex items-center gap-2">
            {isVideo && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 rounded-full"
                  onClick={handlePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>
                
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </>
            )}

            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full"
              onClick={() => setShowDialog(true)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Video badge */}
        {isVideo && videoUrl && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 text-[10px] bg-black/60 text-white border-0"
          >
            Video
          </Badge>
        )}
      </div>

      {/* Full Preview Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{chapterTitle}</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-1" /> Download
                </Button>
                {onRegenerate && (
                  <Button size="sm" variant="outline" onClick={onRegenerate}>
                    <RotateCcw className="w-4 h-4 mr-1" /> Regenerate
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              {isVideo ? (
                <video
                  ref={dialogVideoRef}
                  src={mediaUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={chapterTitle}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Audio player if separate from video */}
            {audioUrl && !isVideo && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Voiceover Audio</p>
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChapterVideoPreview;
