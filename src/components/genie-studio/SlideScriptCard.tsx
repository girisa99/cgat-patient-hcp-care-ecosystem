/**
 * Slide Script Card - Individual slide voiceover card
 * Part of Genie Spark Presentation Mode
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  Volume2, 
  Edit3, 
  Check, 
  X, 
  Loader2,
  Clock,
  FileText,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SlideScript {
  slideNumber: number;
  title?: string;
  narration: string;
  visualNotes?: string;
  duration: number; // seconds
  wordCount: number;
  audioUrl?: string;
  audioBlob?: Blob;
}

interface SlideScriptCardProps {
  slide: SlideScript;
  isGeneratingAudio?: boolean;
  isPlaying?: boolean;
  onPlayAudio?: () => void;
  onStopAudio?: () => void;
  onGenerateTTS?: () => Promise<void>;
  onUpdateNarration?: (narration: string) => void;
  onDownloadAudio?: () => void;
  className?: string;
}

export function SlideScriptCard({
  slide,
  isGeneratingAudio = false,
  isPlaying = false,
  onPlayAudio,
  onStopAudio,
  onGenerateTTS,
  onUpdateNarration,
  onDownloadAudio,
  className,
}: SlideScriptCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNarration, setEditedNarration] = useState(slide.narration);

  const handleSaveEdit = () => {
    onUpdateNarration?.(editedNarration);
    setIsEditing(false);
    toast.success(`Slide ${slide.slideNumber} updated`);
  };

  const handleCancelEdit = () => {
    setEditedNarration(slide.narration);
    setIsEditing(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className={cn("group hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-mono text-xs">
              Slide {slide.slideNumber}
            </Badge>
            {slide.title && (
              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {slide.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(slide.duration)}</span>
            <span className="mx-1">•</span>
            <FileText className="h-3 w-3" />
            <span>{slide.wordCount} words</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Narration Text */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedNarration}
              onChange={(e) => setEditedNarration(e.target.value)}
              rows={4}
              className="text-sm"
              placeholder="Enter voiceover script..."
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {slide.narration}
          </p>
        )}

        {/* Visual Notes */}
        {slide.visualNotes && !isEditing && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
            <span className="font-medium">Visual:</span> {slide.visualNotes}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {/* Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isEditing || isGeneratingAudio}
            className="text-xs"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </Button>

          {/* Generate TTS Button */}
          {!slide.audioUrl && onGenerateTTS && (
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerateTTS}
              disabled={isGeneratingAudio || isEditing}
              className="text-xs"
            >
              {isGeneratingAudio ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3 mr-1" />
                  Generate Voice
                </>
              )}
            </Button>
          )}

          {/* Playback Controls */}
          {slide.audioUrl && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={isPlaying ? onStopAudio : onPlayAudio}
                className="text-xs"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Play
                  </>
                )}
              </Button>
              
              {onDownloadAudio && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDownloadAudio}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              )}
            </>
          )}

          {/* Audio Ready Badge */}
          {slide.audioUrl && (
            <Badge variant="outline" className="ml-auto text-xs bg-green-500/10 text-green-600 border-green-500/20">
              <Volume2 className="h-3 w-3 mr-1" />
              Audio Ready
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
