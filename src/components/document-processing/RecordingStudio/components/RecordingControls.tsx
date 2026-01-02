/**
 * Recording Controls Component - Camera, Mic, Record buttons
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Mic, MicOff, Play, Pause, Square, Type, Sparkles, Image } from 'lucide-react';
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
      </div>

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
