/**
 * One-Tap Mobile Record Button
 * P1 Feature: Quick recording widget for mobile-first experience
 * Target: 68% market demand for mobile-first recording
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Video, 
  Mic, 
  Square, 
  Pause, 
  Play, 
  X, 
  Camera, 
  Check,
  Loader2,
  Upload,
  Zap
} from 'lucide-react';
import { useCapacitor } from '@/hooks/useCapacitor';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface RecordingResult {
  id: string;
  type: 'video' | 'audio' | 'photo';
  blob?: Blob;
  url?: string;
  duration?: number;
  timestamp: number;
  thumbnailUrl?: string;
}

interface OneTapRecordButtonProps {
  onRecordingComplete?: (result: RecordingResult) => void;
  onRecordingStart?: () => void;
  onRecordingPause?: () => void;
  className?: string;
  variant?: 'floating' | 'inline' | 'compact';
  defaultMode?: 'video' | 'audio' | 'photo';
  maxDuration?: number; // in seconds
}

type RecordingState = 'idle' | 'ready' | 'recording' | 'paused' | 'processing';

export const OneTapRecordButton: React.FC<OneTapRecordButtonProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingPause,
  className,
  variant = 'floating',
  defaultMode = 'video',
  maxDuration = 300 // 5 minutes default
}) => {
  const { takePhoto, vibrate, notificationHaptic, state: capacitorState } = useCapacitor();
  const { capabilities, isOnline, hasCamera, hasNotifications } = useMobileFeatures();
  
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingMode, setRecordingMode] = useState<'video' | 'audio' | 'photo'>(defaultMode);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        const newDuration = prev + 1;
        if (newDuration >= maxDuration) {
          stopRecording();
          toast.info('Maximum recording duration reached');
        }
        return newDuration;
      });
    }, 1000);
  }, [maxDuration]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleOneTapRecord = useCallback(async () => {
    // Haptic feedback
    await vibrate('medium');

    if (recordingMode === 'photo') {
      await handleTakePhoto();
      return;
    }

    if (recordingState === 'idle' || recordingState === 'ready') {
      await startRecording();
    } else if (recordingState === 'recording') {
      await stopRecording();
    } else if (recordingState === 'paused') {
      await resumeRecording();
    }
  }, [recordingState, recordingMode, vibrate]);

  const handleTakePhoto = async () => {
    setRecordingState('processing');
    
    try {
      const photoUrl = await takePhoto();
      
      if (photoUrl) {
        await notificationHaptic('success');
        
        const result: RecordingResult = {
          id: crypto.randomUUID(),
          type: 'photo',
          url: photoUrl,
          timestamp: Date.now()
        };
        
        onRecordingComplete?.(result);
        toast.success('Photo captured!');
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      await notificationHaptic('error');
      toast.error('Failed to capture photo');
    }
    
    setRecordingState('idle');
  };

  const startRecording = async () => {
    try {
      setRecordingState('processing');
      
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: recordingMode === 'video' ? { 
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mimeType = recordingMode === 'video' 
        ? 'video/webm;codecs=vp9,opus'
        : 'audio/webm;codecs=opus';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { 
          type: recordingMode === 'video' ? 'video/webm' : 'audio/webm' 
        });
        const url = URL.createObjectURL(blob);

        const result: RecordingResult = {
          id: crypto.randomUUID(),
          type: recordingMode,
          blob,
          url,
          duration,
          timestamp: Date.now()
        };

        onRecordingComplete?.(result);
        await notificationHaptic('success');
        toast.success(`${recordingMode === 'video' ? 'Video' : 'Audio'} recorded!`);
        
        setRecordingState('idle');
        setDuration(0);
      };

      mediaRecorder.start(1000);
      setRecordingState('recording');
      startTimer();
      onRecordingStart?.();
      
      await notificationHaptic('success');
      toast.success('Recording started');
      
    } catch (error) {
      console.error('Recording start error:', error);
      await notificationHaptic('error');
      toast.error('Failed to start recording. Check permissions.');
      setRecordingState('idle');
    }
  };

  const stopRecording = async () => {
    stopTimer();
    stopMediaStream();
    setRecordingState('processing');
  };

  const pauseRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      stopTimer();
      setRecordingState('paused');
      onRecordingPause?.();
      await vibrate('light');
    }
  };

  const resumeRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      startTimer();
      setRecordingState('recording');
      await vibrate('light');
    }
  };

  const cancelRecording = async () => {
    stopTimer();
    stopMediaStream();
    chunksRef.current = [];
    setRecordingState('idle');
    setDuration(0);
    await vibrate('light');
    toast.info('Recording cancelled');
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeIcon = () => {
    switch (recordingMode) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Mic className="h-5 w-5" />;
      case 'photo': return <Camera className="h-5 w-5" />;
    }
  };

  const getRecordButtonColor = () => {
    switch (recordingState) {
      case 'recording': return 'bg-red-500 hover:bg-red-600 animate-pulse';
      case 'paused': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'processing': return 'bg-muted';
      default: return 'bg-primary hover:bg-primary/90';
    }
  };

  // Floating FAB variant - positioned to not overlap tab bar
  if (variant === 'floating') {
    return (
      <div className={cn("flex flex-col items-end gap-2", className)}>
        {/* Expanded Controls */}
        {isExpanded && recordingState === 'idle' && (
          <Card className="mb-2 animate-in fade-in slide-in-from-bottom-2">
            <CardContent className="p-3 flex gap-2">
              <Button
                variant={recordingMode === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecordingMode('video')}
              >
                <Video className="h-4 w-4 mr-1" /> Video
              </Button>
              <Button
                variant={recordingMode === 'audio' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecordingMode('audio')}
              >
                <Mic className="h-4 w-4 mr-1" /> Audio
              </Button>
              <Button
                variant={recordingMode === 'photo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecordingMode('photo')}
              >
                <Camera className="h-4 w-4 mr-1" /> Photo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recording Controls */}
        {recordingState !== 'idle' && recordingState !== 'processing' && (
          <Card className="mb-2 animate-in fade-in slide-in-from-bottom-2">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Badge variant={recordingState === 'recording' ? 'destructive' : 'secondary'}>
                  {formatDuration(duration)}
                </Badge>
                
                <Progress value={(duration / maxDuration) * 100} className="w-24 h-2" />
                
                <div className="flex gap-1">
                  {recordingState === 'recording' && (
                    <Button variant="ghost" size="icon" onClick={pauseRecording}>
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {recordingState === 'paused' && (
                    <Button variant="ghost" size="icon" onClick={resumeRecording}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={cancelRecording}>
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Record Button */}
        <Button
          size="lg"
          className={cn(
            "h-16 w-16 rounded-full shadow-lg transition-all",
            getRecordButtonColor()
          )}
          onClick={handleOneTapRecord}
          onContextMenu={(e) => {
            e.preventDefault();
            if (recordingState === 'idle') setIsExpanded(!isExpanded);
          }}
          onDoubleClick={() => {
            if (recordingState === 'idle') setIsExpanded(!isExpanded);
          }}
          disabled={recordingState === 'processing'}
        >
          {recordingState === 'processing' ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : recordingState === 'recording' ? (
            <Square className="h-6 w-6" />
          ) : (
            getModeIcon()
          )}
        </Button>

        {/* Hint */}
        {recordingState === 'idle' && !isExpanded && (
          <span className="text-xs text-muted-foreground mt-1">
            Double-tap for options
          </span>
        )}
      </div>
    );
  }

  // Compact variant (for embedding in other components)
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          size="sm"
          className={cn(getRecordButtonColor())}
          onClick={handleOneTapRecord}
          disabled={recordingState === 'processing'}
        >
          {recordingState === 'processing' ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : recordingState === 'recording' ? (
            <Square className="h-4 w-4 mr-1" />
          ) : (
            getModeIcon()
          )}
          {recordingState === 'recording' && formatDuration(duration)}
          {recordingState === 'idle' && 'Record'}
        </Button>
        
        {recordingState === 'recording' && (
          <Button variant="ghost" size="icon" onClick={cancelRecording}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Inline variant (full controls visible)
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0 space-y-4">
        {/* Mode Selection */}
        <div className="flex justify-center gap-2">
          <Button
            variant={recordingMode === 'video' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRecordingMode('video')}
            disabled={recordingState !== 'idle'}
          >
            <Video className="h-4 w-4 mr-1" /> Video
          </Button>
          <Button
            variant={recordingMode === 'audio' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRecordingMode('audio')}
            disabled={recordingState !== 'idle'}
          >
            <Mic className="h-4 w-4 mr-1" /> Audio
          </Button>
          <Button
            variant={recordingMode === 'photo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRecordingMode('photo')}
            disabled={recordingState !== 'idle'}
          >
            <Camera className="h-4 w-4 mr-1" /> Photo
          </Button>
        </div>

        {/* Recording Status */}
        {recordingState !== 'idle' && (
          <div className="text-center space-y-2">
            <Badge variant={recordingState === 'recording' ? 'destructive' : 'secondary'} className="text-lg px-4 py-1">
              {formatDuration(duration)}
            </Badge>
            <Progress value={(duration / maxDuration) * 100} className="w-full" />
          </div>
        )}

        {/* Main Controls */}
        <div className="flex justify-center items-center gap-4">
          {recordingState !== 'idle' && (
            <Button variant="outline" size="icon" onClick={cancelRecording}>
              <X className="h-5 w-5" />
            </Button>
          )}
          
          {recordingState === 'recording' && (
            <Button variant="outline" size="icon" onClick={pauseRecording}>
              <Pause className="h-5 w-5" />
            </Button>
          )}
          
          {recordingState === 'paused' && (
            <Button variant="outline" size="icon" onClick={resumeRecording}>
              <Play className="h-5 w-5" />
            </Button>
          )}

          <Button
            size="lg"
            className={cn(
              "h-20 w-20 rounded-full transition-all",
              getRecordButtonColor()
            )}
            onClick={handleOneTapRecord}
            disabled={recordingState === 'processing'}
          >
            {recordingState === 'processing' ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : recordingState === 'recording' ? (
              <Square className="h-8 w-8" />
            ) : (
              <div className="flex flex-col items-center">
                {getModeIcon()}
                <span className="text-xs mt-1">
                  {recordingMode === 'photo' ? 'Tap' : 'Record'}
                </span>
              </div>
            )}
          </Button>

          {recordingState === 'recording' && (
            <Button variant="default" size="icon" onClick={stopRecording}>
              <Check className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {hasCamera ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
            Camera
          </span>
          <span className="flex items-center gap-1">
            {isOnline ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-yellow-500" />}
            {isOnline ? 'Online' : 'Offline'}
          </span>
          {capacitorState.isNative && (
            <Badge variant="outline" className="text-xs">
              {capacitorState.platform}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OneTapRecordButton;
