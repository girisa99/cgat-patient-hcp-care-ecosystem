/**
 * Recording Controls Component - Camera, Mic, Record buttons with pause/trim/transcribe
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Camera, CameraOff, Mic, MicOff, Play, Pause, Square, 
  Type, Sparkles, Image, Scissors, Undo, Subtitles, FileText, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordingControlsProps {
  // Camera state
  isCameraEnabled: boolean;
  isMicEnabled: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  
  // Recording state
  isRecording: boolean;
  isPaused: boolean;
  canRecord: boolean;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onStopRecording: () => void;
  
  // Feature toggles
  isTeleprompterEnabled: boolean;
  onToggleTeleprompter: () => void;
  
  isBlurEnabled: boolean;
  onToggleBlur: () => void;
  
  isLogoEnabled: boolean;
  onToggleLogo: () => void;
  onUploadLogo: () => void;

  // Captions toggle
  captionsEnabled?: boolean;
  onToggleCaptions?: () => void;

  // Trim controls
  onTrimSeconds?: (seconds: number) => void;
  onUndoTrim?: () => void;
  canUndoTrim?: boolean;
  trimSeconds?: number;
  onTrimSecondsChange?: (seconds: number) => void;

  // Transcription during pause
  onTranscribe?: () => void;
  isTranscribing?: boolean;
  transcriptionText?: string | null;
}

export function RecordingControls({
  isCameraEnabled,
  isMicEnabled,
  onToggleCamera,
  onToggleMic,
  isRecording,
  isPaused,
  canRecord,
  onStartRecording,
  onPauseRecording,
  onStopRecording,
  isTeleprompterEnabled,
  onToggleTeleprompter,
  isBlurEnabled,
  onToggleBlur,
  isLogoEnabled,
  onToggleLogo,
  onUploadLogo,
  captionsEnabled = false,
  onToggleCaptions,
  onTrimSeconds,
  onUndoTrim,
  canUndoTrim = false,
  trimSeconds = 5,
  onTrimSecondsChange,
  onTranscribe,
  isTranscribing = false,
  transcriptionText,
}: RecordingControlsProps) {
  return (
    <div className="space-y-3">
      {/* Camera & Mic Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isCameraEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleCamera}
          className="gap-2"
        >
          {isCameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
          Camera: {isCameraEnabled ? 'ON' : 'OFF'}
        </Button>
        
        <Button
          variant={isMicEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleMic}
          className="gap-2"
        >
          {isMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          Mic: {isMicEnabled ? 'ON' : 'OFF'}
        </Button>
        
        <Button
          variant={isTeleprompterEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleTeleprompter}
          className="gap-2"
        >
          <Type className="w-4 h-4" />
          Teleprompter: {isTeleprompterEnabled ? 'ON' : 'OFF'}
        </Button>
      </div>

      {/* Effects Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isBlurEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleBlur}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          BG Blur: {isBlurEnabled ? 'ON' : 'OFF'}
        </Button>
        
        <Button
          variant={isLogoEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleLogo}
          className="gap-2"
        >
          <Image className="w-4 h-4" />
          Logo: {isLogoEnabled ? 'ON' : 'OFF'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onUploadLogo}
          className="gap-2"
        >
          Upload Logo
        </Button>

        {onToggleCaptions && (
          <Button
            variant={captionsEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleCaptions}
            className="gap-2"
          >
            <Subtitles className="w-4 h-4" />
            Captions: {captionsEnabled ? 'ON' : 'OFF'}
          </Button>
        )}
      </div>

      {/* Trim & Transcribe Controls - visible during recording when paused */}
      {isRecording && isPaused && (
        <div className="space-y-2 p-2 bg-muted/50 rounded-md">
          {/* Trim Controls */}
          {onTrimSeconds && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Trim last</span>
              {onTrimSecondsChange && (
                <Slider
                  value={[trimSeconds]}
                  onValueChange={([v]) => onTrimSecondsChange(v)}
                  min={1}
                  max={30}
                  step={1}
                  className="w-20"
                />
              )}
              <span className="text-xs font-medium w-8">{trimSeconds}s</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTrimSeconds(trimSeconds)}
                className="gap-1 h-7 text-xs"
              >
                <Scissors className="w-3 h-3" />
                Trim
              </Button>
              {onUndoTrim && canUndoTrim && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onUndoTrim}
                  className="gap-1 h-7 text-xs"
                >
                  <Undo className="w-3 h-3" />
                  Undo
                </Button>
              )}
            </div>
          )}

          {/* Transcribe Controls */}
          {onTranscribe && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onTranscribe}
                disabled={isTranscribing}
                className="gap-1.5 h-7 text-xs"
              >
                {isTranscribing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
                {isTranscribing ? 'Transcribing...' : 'Transcribe Recording'}
              </Button>
            </div>
          )}

          {/* Transcription Result */}
          {transcriptionText && (
            <div className="p-2 bg-background/50 rounded text-xs max-h-20 overflow-y-auto border">
              <p className="text-muted-foreground font-medium mb-1">Transcription:</p>
              <p>{transcriptionText}</p>
            </div>
          )}
        </div>
      )}

      {/* Main Record Button */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {!isRecording ? (
          <Button
            size="lg"
            disabled={!canRecord}
            onClick={onStartRecording}
            className={cn(
              'gap-2 px-8',
              canRecord 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'opacity-50'
            )}
          >
            <Play className="w-5 h-5" />
            Start Recording
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              variant="outline"
              onClick={onPauseRecording}
              className="gap-2"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            
            <Button
              size="lg"
              variant="destructive"
              onClick={onStopRecording}
              className="gap-2 px-8"
            >
              <Square className="w-5 h-5" />
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
