/**
 * Recording Controls Component - Camera, Mic, Record buttons with pause/trim/transcribe/rewind
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, CameraOff, Mic, MicOff, Play, Pause, Square, 
  Type, Sparkles, Image, Scissors, Undo, Subtitles, FileText, Loader2,
  Volume2, Music, AudioLines, RotateCcw, SkipBack, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioCombinationStatus {
  hasTTS: boolean;
  hasVoiceover: boolean;
  hasMusic: boolean;
  ttsName?: string;
  voiceoverName?: string;
  musicName?: string;
}

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

  // Rewind/restart controls during pause
  onRewindSeconds?: (seconds: number) => void;
  onRestartRecording?: () => void;
  currentDuration?: number;

  // Audio combination status
  audioCombination?: AudioCombinationStatus;
  
  // Audio mixer toggle
  onToggleAudioMixer?: () => void;
  showAudioMixer?: boolean;
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
  onRewindSeconds,
  onRestartRecording,
  currentDuration = 0,
  audioCombination,
  onToggleAudioMixer,
  showAudioMixer = false,
}: RecordingControlsProps) {
  
  // Compute audio combination label
  const getAudioCombinationLabel = () => {
    if (!audioCombination) return null;
    const { hasTTS, hasVoiceover, hasMusic } = audioCombination;
    
    if (!hasTTS && !hasVoiceover && !hasMusic) return 'No audio selected';
    
    const parts: string[] = [];
    if (hasTTS) parts.push('TTS');
    else if (hasVoiceover) parts.push('Voiceover');
    if (hasMusic) parts.push('Music');
    
    return parts.join(' + ');
  };

  const audioLabel = getAudioCombinationLabel();
  
  return (
    <div className="space-y-3">
      {/* Audio Combination Status */}
      {audioCombination && (
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/50">
          <span className="text-xs text-muted-foreground font-medium">Audio:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {audioCombination.hasTTS && (
              <Badge variant="secondary" className="gap-1 text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                <AudioLines className="w-3 h-3" />
                TTS
                {audioCombination.ttsName && (
                  <span className="text-muted-foreground truncate max-w-[80px]">
                    ({audioCombination.ttsName})
                  </span>
                )}
              </Badge>
            )}
            {audioCombination.hasVoiceover && !audioCombination.hasTTS && (
              <Badge variant="secondary" className="gap-1 text-xs bg-purple-500/10 text-purple-600 border-purple-500/20">
                <Volume2 className="w-3 h-3" />
                Voiceover
                {audioCombination.voiceoverName && (
                  <span className="text-muted-foreground truncate max-w-[80px]">
                    ({audioCombination.voiceoverName})
                  </span>
                )}
              </Badge>
            )}
            {audioCombination.hasMusic && (
              <Badge variant="secondary" className="gap-1 text-xs bg-green-500/10 text-green-600 border-green-500/20">
                <Music className="w-3 h-3" />
                Music
                {audioCombination.musicName && (
                  <span className="text-muted-foreground truncate max-w-[80px]">
                    ({audioCombination.musicName})
                  </span>
                )}
              </Badge>
            )}
            {!audioCombination.hasTTS && !audioCombination.hasVoiceover && !audioCombination.hasMusic && (
              <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                No audio selected
              </Badge>
            )}
          </div>
          {/* Audio Mixer Toggle Button */}
          {onToggleAudioMixer && (
            <Button
              size="sm"
              variant={showAudioMixer ? 'default' : 'ghost'}
              className="ml-auto h-7 px-2 gap-1"
              onClick={onToggleAudioMixer}
              title="Open Audio Mixer"
            >
              <AudioLines className="w-3.5 h-3.5" />
              Mixer
            </Button>
          )}
        </div>
      )}

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

      {/* Pause Controls - Rewind, Trim, Transcribe - visible during recording when paused */}
      {isRecording && isPaused && (
        <div className="space-y-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-700">⏸ Recording Paused</span>
            <Badge variant="outline" className="text-xs">
              {Math.floor(currentDuration / 60)}:{(currentDuration % 60).toString().padStart(2, '0')} recorded
            </Badge>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap gap-2">
            {/* Rewind buttons */}
            {onRewindSeconds && currentDuration >= 5 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRewindSeconds(5)}
                  className="gap-1.5 h-8 text-xs"
                >
                  <SkipBack className="w-3 h-3" />
                  -5s
                </Button>
                {currentDuration >= 10 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRewindSeconds(10)}
                    className="gap-1.5 h-8 text-xs"
                  >
                    <SkipBack className="w-3 h-3" />
                    -10s
                  </Button>
                )}
              </>
            )}
            
            {/* Restart button */}
            {onRestartRecording && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRestartRecording}
                className="gap-1.5 h-8 text-xs text-red-600 border-red-500/30 hover:bg-red-500/10"
              >
                <RefreshCw className="w-3 h-3" />
                Start Over
              </Button>
            )}
          </div>

          {/* Trim Controls */}
          {onTrimSeconds && (
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded-md">
              <span className="text-xs text-muted-foreground">Trim last</span>
              {onTrimSecondsChange && (
                <Slider
                  value={[trimSeconds]}
                  onValueChange={([v]) => onTrimSecondsChange(v)}
                  min={1}
                  max={Math.min(30, currentDuration)}
                  step={1}
                  className="w-20"
                />
              )}
              <span className="text-xs font-medium w-8">{trimSeconds}s</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTrimSeconds(trimSeconds)}
                disabled={currentDuration < trimSeconds}
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
                variant="secondary"
                onClick={onTranscribe}
                disabled={isTranscribing}
                className="gap-1.5 h-8 text-xs flex-1"
              >
                {isTranscribing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
                {isTranscribing ? 'Transcribing...' : 'Transcribe Current Recording'}
              </Button>
            </div>
          )}

          {/* Transcription Result */}
          {transcriptionText && (
            <div className="p-2 bg-background/70 rounded-md text-xs max-h-24 overflow-y-auto border">
              <p className="text-muted-foreground font-medium mb-1">📝 Transcription:</p>
              <p className="text-foreground">{transcriptionText}</p>
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
              variant={isPaused ? 'default' : 'outline'}
              onClick={onPauseRecording}
              className={cn("gap-2", isPaused && "bg-green-600 hover:bg-green-700 text-white")}
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
