/**
 * VibeRecordTab - Extracted Recording Tab for Genie Vibe
 * 
 * Consolidates recording functionality from RecordingStudio into a focused component:
 * - Camera/Screen/Both recording with PiP overlay
 * - Countdown, Pause/Resume/Stop
 * - Script selection with original vs enhanced
 * - TTS Generation (Phase 2)
 * - Teleprompter Sync (Phase 2)
 * - ML Background Blur (Phase 2)
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Video,
  Camera,
  CameraOff,
  ScreenShare,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Sparkles,
  Volume2,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import recording hooks from RecordingStudio
import {
  useCamera,
  useScreenShare,
  useRecording,
  useTTSGeneration,
  useTeleprompterSync,
  useMLBackgroundBlur,
  type RecordingMode
} from '@/components/document-processing/RecordingStudio/hooks';

// Import PiP component for screen+camera mode
import { PictureInPicture } from '@/components/document-processing/RecordingStudio/components/PictureInPicture';

// Types
interface ScriptItem {
  id: string;
  title: string;
  content: string;
  enhancedContent?: string;
}

interface RecordingResult {
  id: string;
  url?: string;
  duration?: number;
  type: 'video' | 'audio' | 'photo';
  name?: string;
  thumbnailUrl?: string;
}

interface VibeRecordTabProps {
  productionTitle?: string;
  scripts: ScriptItem[];
  onRecordingComplete: (result: RecordingResult) => void;
  recordings: RecordingResult[];
}

export function VibeRecordTab({
  productionTitle = '',
  scripts,
  onRecordingComplete,
  recordings
}: VibeRecordTabProps) {
  // Recording mode state
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('camera');
  const [isPipEnabled, setIsPipEnabled] = useState(true);
  
  // Script state
  const [selectedScriptId, setSelectedScriptId] = useState<string>('');
  const [useEnhancedScript, setUseEnhancedScript] = useState(false);
  const [activeScript, setActiveScript] = useState<string>('');
  
  // Teleprompter state (Phase 2)
  const [isTeleprompterActive, setIsTeleprompterActive] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(1);
  
  // TTS state (Phase 2)
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Video refs
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const pipContainerRef = useRef<HTMLDivElement>(null);
  
  // Camera hook
  const camera = useCamera({ autoStart: true });
  
  // Screen share hook
  const screenShare = useScreenShare();
  
  // ML Background blur (Phase 2)
  const backgroundBlur = useMLBackgroundBlur({ enabled: false, blurAmount: 15 });
  
  // TTS Generation hook (Phase 2)
  const tts = useTTSGeneration();
  
  // Get current script
  const currentScript = useMemo(() => {
    return scripts.find(s => s.id === selectedScriptId);
  }, [scripts, selectedScriptId]);
  
  // Teleprompter sync hook (Phase 2)
  const teleprompterSync = useTeleprompterSync({
    scriptContent: activeScript || null,
    audioCurrentTime: ttsAudioRef.current?.currentTime || 0,
    audioDuration: ttsAudioRef.current?.duration || 0,
    isAudioPlaying: isTtsPlaying,
    isRecording: false,
    isPaused: false
  });
  
  // Get active stream based on mode
  const getActiveStream = useCallback(async (): Promise<MediaStream | null> => {
    if (recordingMode === 'camera') {
      return camera.stream;
    } else if (recordingMode === 'screen') {
      if (!screenShare.isSharing) {
        return await screenShare.startScreenShare();
      }
      return screenShare.combineStreams(camera.stream, screenShare.screenStream, 'screen');
    } else if (recordingMode === 'screen+camera') {
      if (!screenShare.isSharing) {
        await screenShare.startScreenShare();
      }
      return screenShare.combineStreams(camera.stream, screenShare.screenStream, 'screen+camera');
    }
    return camera.stream;
  }, [recordingMode, camera.stream, screenShare]);
  
  // Recording hook
  const recording = useRecording(getActiveStream, {
    countdownSeconds: 5,
    quality: 'high',
    enablePersistence: true,
    onRecordingComplete: (blob, duration) => {
      console.log('[VibeRecordTab] Recording complete:', blob.size, 'bytes,', duration, 'seconds');
      
      const url = URL.createObjectURL(blob);
      const result: RecordingResult = {
        id: `recording-${Date.now()}`,
        url,
        duration,
        type: 'video',
        name: productionTitle || `Recording ${recordings.length + 1}`,
      };
      
      onRecordingComplete(result);
    },
    onRecordingStarted: () => {
      console.log('[VibeRecordTab] Recording started');
      toast.success('Recording started!');
      setIsTeleprompterActive(true);
    }
  });
  
  // Formatted duration
  const formattedDuration = useMemo(() => {
    const minutes = Math.floor(recording.duration / 60);
    const seconds = recording.duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [recording.duration]);
  
  // Handle recording mode change
  const handleRecordingModeChange = useCallback(async (mode: RecordingMode) => {
    if (mode !== 'screen' && mode !== 'screen+camera' && screenShare.isSharing) {
      screenShare.stopScreenShare();
    }
    
    setRecordingMode(mode);
    
    if (mode === 'screen' || mode === 'screen+camera') {
      await screenShare.startScreenShare();
    }
  }, [screenShare]);
  
  // Handle start recording
  const handleStartRecording = useCallback(() => {
    // Set active script for teleprompter
    if (currentScript) {
      const scriptContent = useEnhancedScript && currentScript.enhancedContent 
        ? currentScript.enhancedContent 
        : currentScript.content || '';
      setActiveScript(scriptContent);
    }
    recording.startRecording();
  }, [currentScript, recording, useEnhancedScript]);
  
  // Handle TTS generation (Phase 2)
  const handleGenerateTTS = useCallback(async () => {
    if (!activeScript) {
      toast.error('Select a script first');
      return;
    }
    
    try {
      const result = await tts.generate({
        provider: 'openai',
        voice: 'alloy',
        text: activeScript,
        speed: 1.0
      });
      
      setTtsAudioUrl(result.audioUrl);
      toast.success(`TTS generated! Duration: ${Math.round(result.duration)}s`);
    } catch (err) {
      toast.error('Failed to generate TTS');
    }
  }, [activeScript, tts]);
  
  // Handle TTS playback (Phase 2)
  const toggleTtsPlayback = useCallback(() => {
    if (!ttsAudioRef.current) return;
    
    if (isTtsPlaying) {
      ttsAudioRef.current.pause();
    } else {
      ttsAudioRef.current.play();
    }
    setIsTtsPlaying(!isTtsPlaying);
  }, [isTtsPlaying]);
  
  // Attach camera stream to video element
  useEffect(() => {
    if (videoPreviewRef.current && camera.stream && recordingMode === 'camera') {
      videoPreviewRef.current.srcObject = camera.stream;
    }
  }, [camera.stream, recordingMode]);
  
  // Render video preview based on mode
  const renderVideoPreview = () => {
    // Screen + Camera mode with PiP
    if (recordingMode === 'screen+camera' && (screenShare.isSharing || screenShare.screenStream)) {
      return (
        <PictureInPicture
          mainStream={screenShare.screenStream}
          pipStream={camera.stream}
          isEnabled={isPipEnabled}
          onToggle={() => setIsPipEnabled(!isPipEnabled)}
          className="w-full h-full"
        />
      );
    }
    
    // Screen only mode
    if (recordingMode === 'screen' && screenShare.screenStream) {
      return (
        <video
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain bg-black"
          ref={(el) => {
            if (el) el.srcObject = screenShare.screenStream;
          }}
        />
      );
    }
    
    // Camera mode
    if (camera.isLoading) {
      return (
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing camera...</p>
        </div>
      );
    }
    
    if (camera.error) {
      return (
        <div className="text-center">
          <CameraOff className="h-16 w-16 text-destructive/50 mx-auto mb-4" />
          <p className="text-destructive mb-4">{camera.error}</p>
          <Button variant="outline" onClick={camera.retryCamera}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Camera
          </Button>
        </div>
      );
    }
    
    if (camera.stream) {
      return (
        <video
          ref={videoPreviewRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      );
    }
    
    return (
      <div className="text-center">
        <Video className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Camera not available</p>
        <Button variant="outline" className="mt-4" onClick={() => camera.initCamera()}>
          <Camera className="h-4 w-4 mr-2" />
          Start Camera
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hidden TTS audio element */}
      {ttsAudioUrl && (
        <audio
          ref={ttsAudioRef}
          src={ttsAudioUrl}
          onEnded={() => setIsTtsPlaying(false)}
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Video className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Record</h2>
            <p className="text-sm text-muted-foreground">Capture video, audio, or screen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {recording.isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <div className="h-2 w-2 rounded-full bg-white mr-1.5 animate-pulse" />
              {formattedDuration}
            </Badge>
          )}
          <Badge variant="outline">Step 1 of 5</Badge>
        </div>
      </div>

      {/* Recording Mode Selection */}
      <div className="grid md:grid-cols-3 gap-4">
        <button 
          onClick={() => handleRecordingModeChange('camera')}
          disabled={recording.isRecording}
          className={cn(
            "p-6 text-center border-2 rounded-lg transition-all group",
            recordingMode === 'camera' 
              ? "border-primary bg-primary/5" 
              : "border-dashed hover:border-primary hover:bg-muted/50",
            recording.isRecording && "opacity-50 cursor-not-allowed"
          )}
        >
          <Camera className={cn(
            "h-10 w-10 mx-auto mb-3 transition-transform",
            recordingMode === 'camera' ? "text-primary scale-110" : "text-blue-500 group-hover:scale-110"
          )} />
          <h3 className="font-semibold">Camera</h3>
          <p className="text-xs text-muted-foreground">Record from webcam</p>
        </button>
        <button 
          onClick={() => handleRecordingModeChange('screen')}
          disabled={recording.isRecording}
          className={cn(
            "p-6 text-center border-2 rounded-lg transition-all group",
            recordingMode === 'screen' 
              ? "border-primary bg-primary/5" 
              : "border-dashed hover:border-primary hover:bg-muted/50",
            recording.isRecording && "opacity-50 cursor-not-allowed"
          )}
        >
          <ScreenShare className={cn(
            "h-10 w-10 mx-auto mb-3 transition-transform",
            recordingMode === 'screen' ? "text-primary scale-110" : "text-green-500 group-hover:scale-110"
          )} />
          <h3 className="font-semibold">Screen</h3>
          <p className="text-xs text-muted-foreground">Record screen activity</p>
        </button>
        <button 
          onClick={() => handleRecordingModeChange('screen+camera')}
          disabled={recording.isRecording}
          className={cn(
            "p-6 text-center border-2 rounded-lg transition-all group relative",
            recordingMode === 'screen+camera' 
              ? "border-primary bg-primary/5" 
              : "border-dashed hover:border-primary hover:bg-muted/50",
            recording.isRecording && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex justify-center gap-1 mb-3">
            <Camera className={cn(
              "h-8 w-8 transition-transform",
              recordingMode === 'screen+camera' ? "text-primary scale-110" : "text-purple-500 group-hover:scale-110"
            )} />
            <ScreenShare className={cn(
              "h-8 w-8 transition-transform",
              recordingMode === 'screen+camera' ? "text-primary scale-110" : "text-purple-500 group-hover:scale-110"
            )} />
          </div>
          <h3 className="font-semibold">Both (PiP)</h3>
          <p className="text-xs text-muted-foreground">Camera + Screen overlay</p>
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs">PiP</Badge>
        </button>
      </div>

      {/* Video Preview Area */}
      <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden" ref={pipContainerRef}>
        {/* Countdown Overlay */}
        {recording.countdown !== null && (
          <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl font-bold text-white animate-pulse">
                {recording.countdown}
              </div>
              <p className="text-white/70 mt-4">Recording starting...</p>
            </div>
          </div>
        )}
        
        {/* Recording indicator */}
        {recording.isRecording && !recording.isPaused && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-medium">REC {formattedDuration}</span>
          </div>
        )}
        
        {/* Paused indicator */}
        {recording.isPaused && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-warning text-warning-foreground px-3 py-1.5 rounded-full">
            <Pause className="h-3 w-3" />
            <span className="text-sm font-medium">PAUSED {formattedDuration}</span>
          </div>
        )}
        
        {/* PiP toggle for screen+camera mode */}
        {recordingMode === 'screen+camera' && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPipEnabled(!isPipEnabled)}
              className="gap-2"
            >
              {isPipEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              PiP {isPipEnabled ? 'On' : 'Off'}
            </Button>
          </div>
        )}
        
        {/* Teleprompter word highlight indicator (Phase 2) */}
        {isTeleprompterActive && teleprompterSync.currentWordIndex > 0 && (
          <div className="absolute bottom-4 left-4 z-10 bg-black/70 text-white px-3 py-1.5 rounded text-sm">
            Word {teleprompterSync.currentWordIndex + 1} / {teleprompterSync.totalWords}
          </div>
        )}
        
        {/* Video Preview */}
        {renderVideoPreview()}
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Camera/Mic toggles */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={camera.toggleCamera}
            className={cn(!camera.isEnabled && "bg-destructive/10 border-destructive/50")}
          >
            {camera.isEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4 text-destructive" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={camera.toggleMic}
            className={cn(!camera.isMicEnabled && "bg-destructive/10 border-destructive/50")}
          >
            {camera.isMicEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-destructive" />}
          </Button>
          
          {/* Background Blur toggle (Phase 2) */}
          {recordingMode === 'camera' && (
            <Button
              variant="outline"
              size="icon"
              onClick={backgroundBlur.toggleBlur}
              disabled={!camera.stream || backgroundBlur.isModelLoading}
              className={cn(backgroundBlur.isBlurEnabled && "bg-primary/10 border-primary/50")}
              title="Background Blur"
            >
              {backgroundBlur.isModelLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className={cn("h-4 w-4", backgroundBlur.isBlurEnabled && "text-primary")} />
              )}
            </Button>
          )}
        </div>
        
        <Separator orientation="vertical" className="h-8" />
        
        {/* Main recording controls */}
        {!recording.isRecording ? (
          <Button 
            size="lg" 
            className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8"
            onClick={handleStartRecording}
            disabled={!camera.stream && recordingMode === 'camera'}
          >
            <div className="h-3 w-3 rounded-full bg-white" />
            Start Recording
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              variant="outline"
              onClick={recording.pauseRecording}
              className="gap-2"
            >
              {recording.isPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
            
            <Button
              size="lg"
              variant="destructive"
              onClick={recording.stopRecording}
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Script & TTS Section (Phase 2) */}
      {scripts.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Script Selection */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="font-medium">Teleprompter Script</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {scripts.length} scripts
              </Badge>
            </div>
            <Select value={selectedScriptId} onValueChange={(v) => {
              setSelectedScriptId(v);
              const script = scripts.find(s => s.id === v);
              if (script) {
                setActiveScript(script.enhancedContent || script.content);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a script..." />
              </SelectTrigger>
              <SelectContent>
                {scripts.map(script => (
                  <SelectItem key={script.id} value={script.id}>
                    <div className="flex items-center gap-2">
                      {script.title}
                      {script.enhancedContent && (
                        <Badge variant="secondary" className="text-xs">Enhanced</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Script version toggle */}
            {currentScript?.enhancedContent && (
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant={!useEnhancedScript ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setUseEnhancedScript(false);
                    if (currentScript) setActiveScript(currentScript.content);
                  }}
                >
                  Original
                </Button>
                <Button
                  variant={useEnhancedScript ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setUseEnhancedScript(true);
                    if (currentScript?.enhancedContent) setActiveScript(currentScript.enhancedContent);
                  }}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Enhanced
                </Button>
              </div>
            )}
            
            {/* Teleprompter Speed */}
            {selectedScriptId && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Speed</span>
                  <span>{teleprompterSpeed}x</span>
                </div>
                <Slider
                  value={[teleprompterSpeed]}
                  onValueChange={([v]) => setTeleprompterSpeed(v)}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>
            )}
          </div>
          
          {/* TTS Generation (Phase 2) */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="font-medium">Voice Over (TTS)</span>
              </div>
              {tts.isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateTTS}
                disabled={!selectedScriptId || tts.isGenerating}
                className="flex-1 gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Generate TTS
              </Button>
              
              {ttsAudioUrl && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTtsPlayback}
                >
                  {isTtsPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              )}
            </div>
            
            {tts.lastResult && (
              <p className="text-xs text-muted-foreground mt-2">
                Duration: {Math.round(tts.lastResult.duration)}s • 
                Provider: {tts.lastResult.provider}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent Recordings */}
      {recordings.length > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg border">
          <h3 className="font-medium mb-3">Recent Recordings ({recordings.length})</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {recordings.slice(-5).map(rec => (
              <div key={rec.id} className="aspect-video bg-black rounded overflow-hidden relative group">
                {rec.url && (
                  <video src={rec.url} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white">{rec.duration ? `${Math.round(rec.duration)}s` : 'Video'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
