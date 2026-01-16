/**
 * Quick Label Studio Actions Widget
 * Embeddable widget for Recording Studio and other Genie Studio components
 * Provides one-click training data capture during workflows
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Brain, Camera, FileText, Video, Mic2, 
  Scissors, Tag, Sparkles, CheckCircle2, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useLabelStudio } from '@/hooks/useLabelStudio';

interface LSQuickActionsProps {
  // Current context
  currentScript?: string;
  currentVideoUrl?: string;
  currentAudioUrl?: string;
  currentTranscription?: string;
  
  // Callbacks
  onCaptureFrame?: () => string | null; // Returns base64 image
  onCaptureAudio?: () => string | null; // Returns base64 audio
  
  // UI Options
  variant?: 'compact' | 'full';
  showBadge?: boolean;
}

type CaptureType = 'script' | 'video_trim' | 'scene' | 'audio' | 'emotion' | 'transcription' | 'clip' | 'tags';

const CAPTURE_TYPES: { type: CaptureType; icon: React.ComponentType<{ className?: string }>; label: string; shortLabel: string }[] = [
  { type: 'script', icon: FileText, label: 'Script Quality', shortLabel: 'Script' },
  { type: 'video_trim', icon: Scissors, label: 'Trim Points', shortLabel: 'Trim' },
  { type: 'scene', icon: Video, label: 'Scene Detection', shortLabel: 'Scene' },
  { type: 'audio', icon: Mic2, label: 'Audio Quality', shortLabel: 'Audio' },
  { type: 'emotion', icon: Sparkles, label: 'Voice Emotion', shortLabel: 'Emotion' },
  { type: 'transcription', icon: FileText, label: 'Transcription', shortLabel: 'Trans.' },
  { type: 'tags', icon: Tag, label: 'Content Tags', shortLabel: 'Tags' },
];

export function LSQuickActions({
  currentScript,
  currentVideoUrl,
  currentAudioUrl,
  currentTranscription,
  onCaptureFrame,
  onCaptureAudio,
  variant = 'compact',
  showBadge = true,
}: LSQuickActionsProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState<CaptureType | null>(null);
  const [capturedItems, setCapturedItems] = useState<{ type: CaptureType; id: string }[]>([]);
  
  const { bulkImportTasks } = useLabelStudio();

  const handleCapture = useCallback(async (type: CaptureType) => {
    setIsCapturing(type);
    
    try {
      let captureData: any = null;
      
      switch (type) {
        case 'script':
          if (!currentScript) {
            toast.error('No script content available');
            return;
          }
          captureData = { script: currentScript };
          break;
          
        case 'video_trim':
        case 'scene':
          if (onCaptureFrame) {
            const frame = onCaptureFrame();
            if (!frame) {
              toast.error('Could not capture video frame');
              return;
            }
            captureData = { video_frame: frame, timestamp: Date.now() };
          } else if (currentVideoUrl) {
            captureData = { video: currentVideoUrl };
          } else {
            toast.error('No video available');
            return;
          }
          break;
          
        case 'audio':
        case 'emotion':
          if (onCaptureAudio) {
            const audio = onCaptureAudio();
            if (!audio) {
              toast.error('Could not capture audio');
              return;
            }
            captureData = { audio };
          } else if (currentAudioUrl) {
            captureData = { audio: currentAudioUrl };
          } else {
            toast.error('No audio available');
            return;
          }
          break;
          
        case 'transcription':
          if (!currentAudioUrl || !currentTranscription) {
            toast.error('Audio and transcription required');
            return;
          }
          captureData = { audio: currentAudioUrl, ai_transcription: currentTranscription };
          break;
          
        case 'tags':
          if (!currentVideoUrl) {
            toast.error('No content available for tagging');
            return;
          }
          captureData = { content: currentVideoUrl };
          break;
      }

      // Add to pending queue
      const itemId = `${type}-${Date.now()}`;
      setCapturedItems(prev => [...prev, { type, id: itemId }]);
      setPendingCount(prev => prev + 1);
      
      toast.success(`Captured for ${CAPTURE_TYPES.find(t => t.type === type)?.label || type} training`);
      
    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Failed to capture training data');
    } finally {
      setIsCapturing(null);
    }
  }, [currentScript, currentVideoUrl, currentAudioUrl, currentTranscription, onCaptureFrame, onCaptureAudio]);

  if (variant === 'compact') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 relative">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Train AI</span>
            {showBadge && pendingCount > 0 && (
              <Badge 
                variant="default" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {pendingCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Label Studio Training</h4>
              {pendingCount > 0 && (
                <Badge variant="secondary">{pendingCount} pending</Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              Capture data to train AI on your style
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {CAPTURE_TYPES.slice(0, 6).map(({ type, icon: Icon, shortLabel }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 justify-start gap-2"
                  onClick={() => handleCapture(type)}
                  disabled={isCapturing !== null}
                >
                  {isCapturing === type ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                  <span className="text-xs">{shortLabel}</span>
                </Button>
              ))}
            </div>

            {capturedItems.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>{capturedItems.length} items captured this session</span>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Full variant
  return (
    <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Train AI</span>
        </div>
        {pendingCount > 0 && (
          <Badge variant="default">{pendingCount}</Badge>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-1">
        {CAPTURE_TYPES.slice(0, 4).map(({ type, icon: Icon, shortLabel }) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className="h-auto py-1.5 flex-col gap-1"
            onClick={() => handleCapture(type)}
            disabled={isCapturing !== null}
          >
            {isCapturing === type ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Icon className="w-3 h-3" />
            )}
            <span className="text-[10px]">{shortLabel}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

export default LSQuickActions;
