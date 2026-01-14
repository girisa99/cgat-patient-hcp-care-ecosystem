/**
 * VibeRecordTab - Enhanced Recording Tab for Genie Vibe
 * 
 * Features:
 * - Camera/Screen/Both recording with PiP overlay
 * - Countdown, Pause/Resume/Stop
 * - Script selection with original vs enhanced
 * - TTS Generation + Voiceover from library
 * - Teleprompter auto-open with sync
 * - FloatingAudioMixer with play/pause/stop controls
 * - preloadedAudioRecorder for proper audio sync
 * - ML Background Blur
 * - Responsive: Desktop vs Mobile layouts
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Wand2,
  Music,
  AudioLines,
  FileText,
  ChevronDown,
  ChevronUp,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

// Import recording hooks from RecordingStudio
import {
  useCamera,
  useScreenShare,
  useRecording,
  useTTSGeneration,
  useTeleprompterSync,
  useMLBackgroundBlur,
  usePreloadedAudioRecorder,
  useStudioSound,
  STUDIO_PRESETS,
  type RecordingMode
} from '@/components/document-processing/RecordingStudio/hooks';

// Import components
import { PictureInPicture } from '@/components/document-processing/RecordingStudio/components/PictureInPicture';
import { FloatingAudioMixer } from '@/components/document-processing/RecordingStudio/components/FloatingAudioMixer';
import { InlineTeleprompter } from '@/components/document-processing/RecordingStudio/components/InlineTeleprompter';

// Types
interface ScriptItem {
  id: string;
  title: string;
  content: string;
  enhancedContent?: string;
}

interface VoiceoverItem {
  id: string;
  name: string;
  url?: string;
  scriptText?: string;
  metadataType?: 'tts' | 'voiceover';
}

interface MusicItem {
  id: string;
  name: string;
  url?: string;
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
  voiceovers?: VoiceoverItem[];
  music?: MusicItem[];
  onRecordingComplete: (result: RecordingResult) => void;
  recordings: RecordingResult[];
}

export function VibeRecordTab({
  productionTitle = '',
  scripts,
  voiceovers = [],
  music = [],
  onRecordingComplete,
  recordings
}: VibeRecordTabProps) {
  const isMobile = useIsMobile();
  
  // Recording mode state
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('camera');
  const [isPipEnabled, setIsPipEnabled] = useState(true);
  
  // Script state
  const [selectedScriptId, setSelectedScriptId] = useState<string>('');
  const [useEnhancedScript, setUseEnhancedScript] = useState(false);
  const [activeScript, setActiveScript] = useState<string>('');
  
  // Audio selection state
  const [selectedVoiceoverId, setSelectedVoiceoverId] = useState<string>('');
  const [selectedMusicId, setSelectedMusicId] = useState<string>('');
  
  // Teleprompter state
  const [isTeleprompterVisible, setIsTeleprompterVisible] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(1);
  
  // Audio mixer state
  const [showAudioMixer, setShowAudioMixer] = useState(false);
  const [ttsVolume, setTtsVolume] = useState(1);
  const [voiceoverVolume, setVoiceoverVolume] = useState(1);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [isMusicLooping, setIsMusicLooping] = useState(true);
  const [duckingEnabled, setDuckingEnabled] = useState(true);
  
  // TTS state
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Voiceover audio state
  const voiceoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isVoiceoverPlaying, setIsVoiceoverPlaying] = useState(false);
  
  // Music audio state
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // UI state
  const [isControlsExpanded, setIsControlsExpanded] = useState(!isMobile);
  
  // Video refs
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const pipContainerRef = useRef<HTMLDivElement>(null);
  
  // Camera hook
  const camera = useCamera({ autoStart: true });
  
  // Screen share hook
  const screenShare = useScreenShare();
  
  // ML Background blur
  const backgroundBlur = useMLBackgroundBlur({ enabled: false, blurAmount: 15 });
  
  // Studio Sound
  const studioSound = useStudioSound();
  
  // TTS Generation hook
  const tts = useTTSGeneration();
  
  // Get current selections
  const currentScript = useMemo(() => {
    return scripts.find(s => s.id === selectedScriptId);
  }, [scripts, selectedScriptId]);
  
  const currentVoiceover = useMemo(() => {
    return voiceovers.find(v => v.id === selectedVoiceoverId);
  }, [voiceovers, selectedVoiceoverId]);
  
  const currentMusic = useMemo(() => {
    return music.find(m => m.id === selectedMusicId);
  }, [music, selectedMusicId]);
  
  // Get script content for teleprompter
  const teleprompterContent = useMemo(() => {
    if (!currentScript) return '';
    if (useEnhancedScript && currentScript.enhancedContent) {
      return currentScript.enhancedContent;
    }
    return currentScript.content || '';
  }, [currentScript, useEnhancedScript]);
  
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
  
  // Preloaded audio recorder for proper audio sync
  const preloadedAudio = usePreloadedAudioRecorder({
    micStream: camera.stream,
    videoStream: camera.stream,
    getVideoStream: getActiveStream,
    enableDucking: duckingEnabled,
    duckedVolume: 0.08,
  });
  
  // Teleprompter sync hook
  const teleprompterSync = useTeleprompterSync({
    scriptContent: teleprompterContent || null,
    audioCurrentTime: preloadedAudio.currentTime,
    audioDuration: preloadedAudio.duration,
    isAudioPlaying: preloadedAudio.isPlaying,
    isRecording: false,
    isPaused: false
  });
  
  // Recording hook
  const recording = useRecording(getActiveStream, {
    countdownSeconds: 5,
    quality: 'high',
    enablePersistence: true,
    onRecordingComplete: (blob, duration) => {
      console.log('[VibeRecordTab] Recording complete:', blob.size, 'bytes,', duration, 'seconds');
      
      // Stop all audio
      preloadedAudio.stopPlayback();
      stopAllAudio();
      
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
      
      // Auto-open teleprompter if script selected
      if (selectedScriptId && teleprompterContent) {
        setIsTeleprompterVisible(true);
      }
      
      // Start preloaded audio playback
      if (preloadedAudio.state.isReady) {
        preloadedAudio.startPlayback();
      }
      
      // Auto-play selected audio tracks
      if (currentVoiceover?.url) {
        playVoiceover();
      }
      if (currentMusic?.url) {
        playMusic();
      }
    }
  });
  
  // Formatted duration
  const formattedDuration = useMemo(() => {
    const minutes = Math.floor(recording.duration / 60);
    const seconds = recording.duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [recording.duration]);
  
  // Audio playback functions
  const playVoiceover = useCallback(() => {
    if (voiceoverAudioRef.current && currentVoiceover?.url) {
      voiceoverAudioRef.current.src = currentVoiceover.url;
      voiceoverAudioRef.current.volume = voiceoverVolume;
      voiceoverAudioRef.current.play();
      setIsVoiceoverPlaying(true);
    }
  }, [currentVoiceover, voiceoverVolume]);
  
  const pauseVoiceover = useCallback(() => {
    if (voiceoverAudioRef.current) {
      voiceoverAudioRef.current.pause();
      setIsVoiceoverPlaying(false);
    }
  }, []);
  
  const stopVoiceover = useCallback(() => {
    if (voiceoverAudioRef.current) {
      voiceoverAudioRef.current.pause();
      voiceoverAudioRef.current.currentTime = 0;
      setIsVoiceoverPlaying(false);
    }
  }, []);
  
  const playMusic = useCallback(() => {
    if (musicAudioRef.current && currentMusic?.url) {
      musicAudioRef.current.src = currentMusic.url;
      musicAudioRef.current.volume = musicVolume;
      musicAudioRef.current.loop = isMusicLooping;
      musicAudioRef.current.play();
      setIsMusicPlaying(true);
    }
  }, [currentMusic, musicVolume, isMusicLooping]);
  
  const pauseMusic = useCallback(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      setIsMusicPlaying(false);
    }
  }, []);
  
  const stopMusic = useCallback(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current.currentTime = 0;
      setIsMusicPlaying(false);
    }
  }, []);
  
  const toggleTtsPlayback = useCallback(() => {
    if (!ttsAudioRef.current) return;
    
    if (isTtsPlaying) {
      ttsAudioRef.current.pause();
    } else {
      ttsAudioRef.current.play();
    }
    setIsTtsPlaying(!isTtsPlaying);
  }, [isTtsPlaying]);
  
  const stopAllAudio = useCallback(() => {
    stopVoiceover();
    stopMusic();
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current.currentTime = 0;
      setIsTtsPlaying(false);
    }
  }, [stopVoiceover, stopMusic]);
  
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
  const handleStartRecording = useCallback(async () => {
    // Set active script for teleprompter
    if (currentScript) {
      const scriptContent = useEnhancedScript && currentScript.enhancedContent 
        ? currentScript.enhancedContent 
        : currentScript.content || '';
      setActiveScript(scriptContent);
    }
    
    // Prepare preloaded audio if we have voiceover or music
    if (currentVoiceover?.url || currentMusic?.url) {
      try {
        await preloadedAudio.prepare({
          tts: currentVoiceover?.url ? { url: currentVoiceover.url, name: currentVoiceover.name, volume: voiceoverVolume } : null,
          music: currentMusic?.url ? { url: currentMusic.url, name: currentMusic.name, volume: musicVolume, loop: isMusicLooping } : null,
        });
      } catch (err) {
        console.warn('[VibeRecordTab] Could not prepare preloaded audio:', err);
      }
    }
    
    recording.startRecording();
  }, [currentScript, currentVoiceover, currentMusic, recording, useEnhancedScript, preloadedAudio]);
  
  // Handle TTS generation
  const handleGenerateTTS = useCallback(async () => {
    if (!teleprompterContent) {
      toast.error('Select a script first');
      return;
    }
    
    try {
      const result = await tts.generate({
        provider: 'openai',
        voice: 'alloy',
        text: teleprompterContent,
        speed: 1.0
      });
      
      setTtsAudioUrl(result.audioUrl);
      toast.success(`TTS generated! Duration: ${Math.round(result.duration)}s`);
    } catch (err) {
      toast.error('Failed to generate TTS');
    }
  }, [teleprompterContent, tts]);
  
  // Update audio volumes
  useEffect(() => {
    if (voiceoverAudioRef.current) {
      voiceoverAudioRef.current.volume = voiceoverVolume;
    }
  }, [voiceoverVolume]);
  
  useEffect(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = musicVolume;
      musicAudioRef.current.loop = isMusicLooping;
    }
  }, [musicVolume, isMusicLooping]);
  
  useEffect(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.volume = ttsVolume;
    }
  }, [ttsVolume]);
  
  // Attach camera stream to video element
  useEffect(() => {
    if (videoPreviewRef.current && camera.stream && recordingMode === 'camera') {
      videoPreviewRef.current.srcObject = camera.stream;
    }
  }, [camera.stream, recordingMode]);
  
  // Build audio tracks for mixer
  const audioTracks = useMemo(() => {
    const tracks: Array<{
      id: string;
      name: string;
      type: 'tts' | 'voiceover' | 'music';
      isPlaying: boolean;
      isPaused?: boolean;
      volume: number;
      onPlay: () => void;
      onPause?: () => void;
      onStop: () => void;
      onVolumeChange: (v: number) => void;
      loop?: boolean;
      onToggleLoop?: () => void;
    }> = [];
    
    // TTS track
    if (ttsAudioUrl) {
      tracks.push({
        id: 'tts',
        name: 'Generated TTS',
        type: 'tts',
        isPlaying: isTtsPlaying,
        volume: ttsVolume,
        onPlay: toggleTtsPlayback,
        onPause: () => { ttsAudioRef.current?.pause(); setIsTtsPlaying(false); },
        onStop: () => { 
          if (ttsAudioRef.current) {
            ttsAudioRef.current.pause();
            ttsAudioRef.current.currentTime = 0;
          }
          setIsTtsPlaying(false);
        },
        onVolumeChange: setTtsVolume,
      });
    }
    
    // Voiceover track
    if (currentVoiceover?.url) {
      tracks.push({
        id: 'voiceover',
        name: currentVoiceover.name,
        type: 'voiceover',
        isPlaying: isVoiceoverPlaying,
        volume: voiceoverVolume,
        onPlay: playVoiceover,
        onPause: pauseVoiceover,
        onStop: stopVoiceover,
        onVolumeChange: setVoiceoverVolume,
      });
    }
    
    // Music track
    if (currentMusic?.url) {
      tracks.push({
        id: 'music',
        name: currentMusic.name,
        type: 'music',
        isPlaying: isMusicPlaying,
        volume: musicVolume,
        onPlay: playMusic,
        onPause: pauseMusic,
        onStop: stopMusic,
        onVolumeChange: setMusicVolume,
        loop: isMusicLooping,
        onToggleLoop: () => setIsMusicLooping(!isMusicLooping),
      });
    }
    
    return tracks;
  }, [
    ttsAudioUrl, isTtsPlaying, ttsVolume, toggleTtsPlayback,
    currentVoiceover, isVoiceoverPlaying, voiceoverVolume, playVoiceover, pauseVoiceover, stopVoiceover,
    currentMusic, isMusicPlaying, musicVolume, playMusic, pauseMusic, stopMusic, isMusicLooping
  ]);
  
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

  // ============================================================
  // MOBILE LAYOUT - Simplified, stacked controls
  // ============================================================
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Hidden audio elements */}
        {ttsAudioUrl && <audio ref={ttsAudioRef} src={ttsAudioUrl} onEnded={() => setIsTtsPlaying(false)} />}
        <audio ref={voiceoverAudioRef} onEnded={() => setIsVoiceoverPlaying(false)} />
        <audio ref={musicAudioRef} onEnded={() => !isMusicLooping && setIsMusicPlaying(false)} />
        
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Video className="h-4 w-4 text-destructive" />
            </div>
            <span className="font-semibold">Record</span>
          </div>
          {recording.isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <div className="h-2 w-2 rounded-full bg-white mr-1.5 animate-pulse" />
              {formattedDuration}
            </Badge>
          )}
        </div>

        {/* Video Preview - Full width */}
        <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
          {recording.countdown !== null && (
            <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center">
              <div className="text-6xl font-bold text-white animate-pulse">{recording.countdown}</div>
            </div>
          )}
          {recording.isRecording && !recording.isPaused && (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              REC {formattedDuration}
            </div>
          )}
          {renderVideoPreview()}
        </div>

        {/* Recording Mode - Horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['camera', 'screen', 'screen+camera'].map((mode) => (
            <button
              key={mode}
              onClick={() => handleRecordingModeChange(mode as RecordingMode)}
              disabled={recording.isRecording}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-lg border text-sm whitespace-nowrap",
                recordingMode === mode ? "border-primary bg-primary/10 text-primary" : "border-muted"
              )}
            >
              {mode === 'camera' ? '📷 Camera' : mode === 'screen' ? '🖥️ Screen' : '📷+🖥️ Both'}
            </button>
          ))}
        </div>

        {/* Main Recording Button */}
        <div className="flex items-center justify-center gap-3">
          {!recording.isRecording ? (
            <Button 
              size="lg" 
              className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-6 text-lg"
              onClick={handleStartRecording}
              disabled={!camera.stream && recordingMode === 'camera'}
            >
              <div className="h-4 w-4 rounded-full bg-white" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button size="lg" variant="outline" onClick={recording.pauseRecording} className="px-6">
                {recording.isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </Button>
              <Button size="lg" variant="destructive" onClick={recording.stopRecording} className="px-6">
                <Square className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Expandable Controls */}
        <button
          onClick={() => setIsControlsExpanded(!isControlsExpanded)}
          className="flex items-center justify-center w-full py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {isControlsExpanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          {isControlsExpanded ? 'Hide Controls' : 'Show Controls'}
        </button>

        {isControlsExpanded && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            {/* Script Selection */}
            {scripts.length > 0 && (
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" /> Script
                </label>
                <Select value={selectedScriptId} onValueChange={setSelectedScriptId}>
                  <SelectTrigger><SelectValue placeholder="Select script..." /></SelectTrigger>
                  <SelectContent>
                    {scripts.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Voiceover Selection */}
            {voiceovers.length > 0 && (
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Mic className="h-4 w-4" /> Voiceover
                </label>
                <Select value={selectedVoiceoverId} onValueChange={setSelectedVoiceoverId}>
                  <SelectTrigger><SelectValue placeholder="Select voiceover..." /></SelectTrigger>
                  <SelectContent>
                    {voiceovers.filter(v => v.url).map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Music Selection */}
            {music.length > 0 && (
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Music className="h-4 w-4" /> Music
                </label>
                <Select value={selectedMusicId} onValueChange={setSelectedMusicId}>
                  <SelectTrigger><SelectValue placeholder="Select music..." /></SelectTrigger>
                  <SelectContent>
                    {music.filter(m => m.url).map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quick Audio Controls */}
            {(currentVoiceover?.url || currentMusic?.url) && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAudioMixer(true)}
                  className="gap-2 flex-1"
                >
                  <AudioLines className="h-4 w-4" />
                  Audio Mixer
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Teleprompter (if recording with script) */}
        {isTeleprompterVisible && teleprompterContent && (
          <div className="p-3 bg-black/90 text-white rounded-lg max-h-32 overflow-hidden">
            <p className="text-sm leading-relaxed">{teleprompterContent}</p>
          </div>
        )}

        {/* Floating Audio Mixer */}
        <FloatingAudioMixer
          isOpen={showAudioMixer}
          onClose={() => setShowAudioMixer(false)}
          tracks={audioTracks}
          duckingEnabled={duckingEnabled}
          onToggleDucking={() => setDuckingEnabled(!duckingEnabled)}
        />
      </div>
    );
  }

  // ============================================================
  // DESKTOP LAYOUT - Full featured, side-by-side controls
  // ============================================================
  return (
    <div className="space-y-6">
      {/* Hidden audio elements */}
      {ttsAudioUrl && <audio ref={ttsAudioRef} src={ttsAudioUrl} onEnded={() => setIsTtsPlaying(false)} />}
      <audio ref={voiceoverAudioRef} onEnded={() => setIsVoiceoverPlaying(false)} />
      <audio ref={musicAudioRef} onEnded={() => !isMusicLooping && setIsMusicPlaying(false)} />
      
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
          {audioTracks.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowAudioMixer(!showAudioMixer)} className="gap-2">
              <AudioLines className="h-4 w-4" />
              Mixer
            </Button>
          )}
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

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Preview (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
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
            
            {/* Teleprompter word indicator */}
            {isTeleprompterVisible && teleprompterSync.currentWordIndex > 0 && (
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
              
              {/* Background Blur toggle */}
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
            
            <Separator orientation="vertical" className="h-8" />
            
            {/* Teleprompter toggle */}
            <Button
              variant={isTeleprompterVisible ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsTeleprompterVisible(!isTeleprompterVisible)}
              disabled={!selectedScriptId}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Teleprompter
            </Button>
          </div>
        </div>

        {/* Side Panel (1/3 width) */}
        <div className="space-y-4">
          {/* Script Selection */}
          {scripts.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">Script</span>
                </div>
                <Badge variant="secondary" className="text-xs">{scripts.length}</Badge>
              </div>
              <Select value={selectedScriptId} onValueChange={setSelectedScriptId}>
                <SelectTrigger><SelectValue placeholder="Select script..." /></SelectTrigger>
                <SelectContent>
                  {scripts.map(script => (
                    <SelectItem key={script.id} value={script.id}>
                      <div className="flex items-center gap-2">
                        {script.title}
                        {script.enhancedContent && <Badge variant="secondary" className="text-xs">Enhanced</Badge>}
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
                    onClick={() => setUseEnhancedScript(false)}
                  >
                    Original
                  </Button>
                  <Button
                    variant={useEnhancedScript ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setUseEnhancedScript(true)}
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
          )}
          
          {/* Voiceover/TTS Selection */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-primary" />
                <span className="font-medium">Voice</span>
              </div>
              {tts.isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            
            {/* Voiceover from library */}
            {voiceovers.length > 0 && (
              <div className="mb-3">
                <Select value={selectedVoiceoverId} onValueChange={setSelectedVoiceoverId}>
                  <SelectTrigger><SelectValue placeholder="Select voiceover..." /></SelectTrigger>
                  <SelectContent>
                    {voiceovers.filter(v => v.url).map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center gap-2">
                          {v.name}
                          {v.metadataType === 'tts' && <Badge variant="outline" className="text-xs">TTS</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* TTS Generation */}
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
                <Button variant="outline" size="icon" onClick={toggleTtsPlayback}>
                  {isTtsPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              )}
            </div>
            
            {tts.lastResult && (
              <p className="text-xs text-muted-foreground mt-2">
                Duration: {Math.round(tts.lastResult.duration)}s • {tts.lastResult.provider}
              </p>
            )}
          </div>
          
          {/* Music Selection */}
          {music.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-primary" />
                  <span className="font-medium">Music</span>
                </div>
                <Badge variant="secondary" className="text-xs">{music.length}</Badge>
              </div>
              <Select value={selectedMusicId} onValueChange={setSelectedMusicId}>
                <SelectTrigger><SelectValue placeholder="Select music..." /></SelectTrigger>
                <SelectContent>
                  {music.filter(m => m.url).map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {currentMusic?.url && (
                <div className="mt-3 flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={isMusicPlaying ? pauseMusic : playMusic} className="flex-1">
                    {isMusicPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    Preview
                  </Button>
                  <div className="flex items-center gap-2">
                    <Switch checked={isMusicLooping} onCheckedChange={setIsMusicLooping} />
                    <span className="text-xs text-muted-foreground">Loop</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Studio Sound */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <span className="font-medium">Studio Sound</span>
              </div>
            </div>
            <Select
              value={studioSound.activePreset || ''}
              onValueChange={(preset) => studioSound.applyPreset(preset as any)}
            >
              <SelectTrigger><SelectValue placeholder="Select preset..." /></SelectTrigger>
              <SelectContent>
                {Object.keys(STUDIO_PRESETS).map((key) => (
                  <SelectItem key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Inline Teleprompter (below video when visible) */}
      {isTeleprompterVisible && teleprompterContent && (
        <div className="p-4 bg-black/90 text-white rounded-lg">
          <InlineTeleprompter
            content={teleprompterContent}
            currentWordIndex={teleprompterSync.currentWordIndex}
            totalWords={teleprompterSync.totalWords}
            progress={teleprompterSync.progress}
            isRecording={recording.isRecording}
            isPaused={recording.isPaused}
            isVisible={isTeleprompterVisible}
            onClose={() => setIsTeleprompterVisible(false)}
          />
        </div>
      )}

      {/* Recent Recordings */}
      {recordings.length > 0 && (
        <div className="p-4 bg-muted/30 rounded-lg border">
          <h3 className="font-medium mb-3">Recent Recordings ({recordings.length})</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {recordings.slice(-5).map(rec => (
              <div key={rec.id} className="aspect-video bg-black rounded overflow-hidden relative group">
                {rec.url && <video src={rec.url} className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white">{rec.duration ? `${Math.round(rec.duration)}s` : 'Video'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Audio Mixer */}
      <FloatingAudioMixer
        isOpen={showAudioMixer}
        onClose={() => setShowAudioMixer(false)}
        tracks={audioTracks}
        duckingEnabled={duckingEnabled}
        onToggleDucking={() => setDuckingEnabled(!duckingEnabled)}
      />
    </div>
  );
}
