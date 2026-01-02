/**
 * Fullscreen Recording Studio - Complete Implementation
 * Features:
 * - Screen sharing with 5-second countdown
 * - Floating teleprompter (separate window)
 * - Script analysis & enhancement with AI
 * - TTS with ElevenLabs/OpenAI (real API integration)
 * - Audio sync and playback
 * - Trim controls with undo
 * - Recording library
 * - Background blur
 * - Keyboard shortcuts
 * - Quality settings
 * - AI Music generation
 * - Studio Sound (podcast audio processing)
 * - Project cost tracking
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  X, Library, Monitor, Camera, MonitorPlay, 
  FileText, Music, Mic, ChevronLeft, ChevronRight,
  FolderOpen, Sliders, Keyboard, Settings2
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  useCamera, 
  useRecording, 
  useAudioPlayback, 
  useRecordingLibrary, 
  useScreenShare, 
  useScriptDraftStorage,
  useKeyboardShortcuts,
  useMediaProject,
  useStudioSound,
  useTTSGeneration,
  useMLBackgroundBlur,
  useFFmpegTrim
} from './hooks';
import { 
  VideoPreview, 
  RecordingControls, 
  AudioPanel, 
  ScriptPanel, 
  RecordingLibraryPanel,
  RecordingPreview,
  FloatingTeleprompter,
  PreRecordingDialog,
  CameraSetupDialog,
  MusicGenerator,
  KeyboardShortcutsHelp,
  RecordingQualitySettings,
  ProjectSelector,
  StudioSoundPanel,
  PictureInPicture,
  VideoEditorIntegration
} from './components';
import type { CameraSetupOptions } from './components';
import type { RecordingStudioProps, LogoState, TeleprompterState, ScriptData } from './types';
import type { RecordingMode } from './hooks/useScreenShare';
import type { RecordingQuality } from './components/RecordingQualitySettings';
import { ProjectAssetBreakdown } from './components/ProjectAssetBreakdown';
import { AvatarCreator } from './components/AvatarCreator';

export function RecordingStudio({
  isOpen,
  onClose,
  scripts: initialScripts,
  voiceovers,
  music,
  selectedScriptId: initialScriptId = '',
  selectedVoiceoverId: initialVoiceoverId = '',
  selectedMusicId: initialMusicId = '',
  onUploadVoiceover,
  onUploadMusic,
  isUploading = false,
}: RecordingStudioProps) {
  // Scripts with local content management
  const [scripts, setScripts] = useState<ScriptData[]>(initialScripts);
  
  // Recording mode
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('camera');
  
  // Selections
  const [selectedScriptId, setSelectedScriptId] = useState(initialScriptId);
  const [selectedVoiceoverId, setSelectedVoiceoverId] = useState(initialVoiceoverId);
  const [selectedMusicId, setSelectedMusicId] = useState(initialMusicId);
  
  // Feature states
  const [teleprompter, setTeleprompter] = useState<TeleprompterState>({
    enabled: false, // Teleprompter opens in separate window now
    scrollSpeed: 1.0,
    isScrolling: false,
  });
  
  const [teleprompterOpen, setTeleprompterOpen] = useState(false);
  
  const [logo, setLogo] = useState<LogoState>({
    enabled: false,
    src: null,
    position: { x: 20, y: 20 },
    size: 'medium',
  });
  
  const [isBlurEnabled, setIsBlurEnabled] = useState(false);
  
  // Recording quality
  const [recordingQuality, setRecordingQuality] = useState<RecordingQuality>('high');
  const [ttsText, setTTSText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [hasTTSAudio, setHasTTSAudio] = useState(false);
  const [isTTSGenerating, setIsTTSGenerating] = useState(false);
  const [ttsAudioUrl, setTTSAudioUrl] = useState<string | null>(null);
  const [ttsProvider, setTTSProvider] = useState<'openai' | 'elevenlabs'>('openai');
  
  // Script analysis/enhancement states - LIFTED from ScriptPanel to persist
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [cleanEnhancedScript, setCleanEnhancedScript] = useState<string | null>(null);
  const [isUsingEnhancedScript, setIsUsingEnhancedScript] = useState(false);
  
  // Enhancement state lifted from ScriptPanel to prevent loss on re-render
  const [enhancedScriptContent, setEnhancedScriptContent] = useState<string | null>(null);
  const [enhancementChangesData, setEnhancementChangesData] = useState<any[]>([]);
  const [showEnhancementChanges, setShowEnhancementChanges] = useState(false);
  const [analysisResultData, setAnalysisResultData] = useState<any[]>([]);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  
  // Pre-recording dialog state
  const [showPreRecordingDialog, setShowPreRecordingDialog] = useState(false);
  
  // Camera setup dialog state
  const [showCameraSetupDialog, setShowCameraSetupDialog] = useState(false);
  
  // Captions and transcription state
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState<string | null>(null);
  
  // Recording preview
  const [lastRecordingBlob, setLastRecordingBlob] = useState<Blob | null>(null);
  const [showRecordingPreview, setShowRecordingPreview] = useState(false);
  
  // Trim state
  const [trimSeconds, setTrimSeconds] = useState(5);
  const [canUndoTrim, setCanUndoTrim] = useState(false);
  const trimHistoryRef = useRef<Blob[]>([]);
  
  // Audio sync for word highlighting
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Focus mode - auto-collapse panels during recording
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [headerMinimized, setHeaderMinimized] = useState(false);
  
  // Asset breakdown panel
  const [showAssetBreakdown, setShowAssetBreakdown] = useState(false);
  
  // Logo position persistence (saved per session)
  const [savedLogoPosition, setSavedLogoPosition] = useState<{ x: number; y: number } | null>(null);
  
  // PIP mode for screen+camera
  const [pipEnabled, setPipEnabled] = useState(true);
  
  // Video editor integration
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [editingBlob, setEditingBlob] = useState<Blob | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Script draft storage hook
  const scriptDraft = useScriptDraftStorage({ 
    scriptId: selectedScriptId,
    autoSaveInterval: 30000 
  });

  // Update scripts when props change
  useEffect(() => {
    setScripts(initialScripts);
  }, [initialScripts]);

  // Note: Draft sync effects moved after currentScript declaration

  // Hooks
  const camera = useCamera({ autoStart: isOpen });
  const screenShare = useScreenShare();
  const library = useRecordingLibrary();
  const audioPlayback = useAudioPlayback();
  
  // Media project tracking for cost management
  const mediaProject = useMediaProject();
  
  // Studio sound processing for podcast-quality audio
  const studioSound = useStudioSound();
  
  // TTS generation with real API integration
  const ttsGeneration = useTTSGeneration();
  
  // ML-based background blur with person segmentation
  const mlBlur = useMLBackgroundBlur({ blurAmount: 15, enabled: isBlurEnabled });
  
  // FFmpeg for precise video trimming
  const ffmpegTrim = useFFmpegTrim();
  
  // Get current data early for keyboard shortcuts
  const currentScript = scripts.find(s => s.id === selectedScriptId);
  const currentVoiceover = voiceovers.find(v => v.id === selectedVoiceoverId);
  const currentMusic = music.find(m => m.id === selectedMusicId);
  
  // Persist logo position when dragged
  useEffect(() => {
    if (logo.enabled && logo.src && savedLogoPosition) {
      setLogo(prev => ({ ...prev, position: savedLogoPosition }));
    }
  }, [logo.enabled, logo.src, savedLogoPosition]);
  
  // Save logo position on change
  const handleLogoPositionChange = useCallback((pos: { x: number; y: number }) => {
    setSavedLogoPosition(pos);
    setLogo(prev => ({ ...prev, position: pos }));
  }, []);
  
  // Calculate current word index from audio time
  useEffect(() => {
    if (audioPlayback.audioTimeInfo) {
      setAudioCurrentTime(audioPlayback.audioTimeInfo.currentTime);
      setAudioDuration(audioPlayback.audioTimeInfo.duration);
      setIsAudioPlaying(audioPlayback.audioTimeInfo.isPlaying);
      
      const currentScript = scripts.find(s => s.id === selectedScriptId);
      if (currentScript && audioPlayback.audioTimeInfo.duration > 0) {
        const words = currentScript.content.split(/\s+/).filter(w => w.length > 0);
        const wordsPerSecond = words.length / audioPlayback.audioTimeInfo.duration;
        const index = Math.min(
          Math.floor(audioPlayback.audioTimeInfo.currentTime * wordsPerSecond),
          words.length - 1
        );
        setCurrentWordIndex(Math.max(0, index));
      }
    }
  }, [audioPlayback.audioTimeInfo, scripts, selectedScriptId]);
  
  // Get combined stream based on mode
  const getRecordingStream = useCallback(async (): Promise<MediaStream | null> => {
    if (recordingMode === 'camera') {
      return camera.stream;
    } else if (recordingMode === 'screen') {
      if (!screenShare.isSharing) {
        await screenShare.startScreenShare();
      }
      return screenShare.combineStreams(camera.stream, screenShare.screenStream, 'screen');
    } else {
      if (!screenShare.isSharing) {
        await screenShare.startScreenShare();
      }
      return screenShare.combineStreams(camera.stream, screenShare.screenStream, 'screen+camera');
    }
  }, [recordingMode, camera.stream, screenShare]);
  
  const recording = useRecording(
    recordingMode === 'camera' ? camera.stream : (screenShare.screenStream || camera.stream), 
    {
      onRecordingComplete: async (blob, duration) => {
        // Stop all audio playback
        audioPlayback.stopAll();
        
        // Stop screen share if active
        if (screenShare.isSharing) {
          screenShare.stopScreenShare();
        }
        
        // Show preview
        setLastRecordingBlob(blob);
        setShowRecordingPreview(true);
      },
      // Pass audio sources for mixing into recording
      audioSources: {
        voiceover: audioPlayback.audioElements?.voiceover,
        tts: audioPlayback.audioElements?.tts,
        music: audioPlayback.audioElements?.music,
      },
      // Recording quality
      quality: recordingQuality,
      // 5-second countdown (default in hook)
      countdownSeconds: 5,
    }
  );

  // Note: currentScript, currentVoiceover, currentMusic defined above after hooks

  // Auto-focus mode: collapse panels when recording starts
  useEffect(() => {
    if (recording.isRecording && !recording.isPaused) {
      // Enter focus mode
      setIsFocusMode(true);
      setIsSidebarCollapsed(true);
      setHeaderMinimized(true);
    } else if (!recording.isRecording) {
      // Exit focus mode when recording stops
      setIsFocusMode(false);
      setHeaderMinimized(false);
      // Don't auto-expand sidebar - let user control it
    }
  }, [recording.isRecording, recording.isPaused]);

  // Sync enhanced script to draft storage when it changes
  useEffect(() => {
    if (enhancedScriptContent && currentScript && selectedScriptId) {
      scriptDraft.updateDraft({
        originalContent: currentScript.content,
        enhancedContent: enhancedScriptContent,
        changes: enhancementChangesData,
        status: 'draft',
      });
    }
  }, [enhancedScriptContent, currentScript, selectedScriptId, enhancementChangesData, scriptDraft]);

  // Load draft on script change if exists
  useEffect(() => {
    if (scriptDraft.hasDraft && scriptDraft.draft?.enhancedContent && !enhancedScriptContent) {
      setEnhancedScriptContent(scriptDraft.draft.enhancedContent);
      setEnhancementChangesData(scriptDraft.draft.changes || []);
      if (scriptDraft.isDraft) {
        toast.info('Restored unsaved enhancement draft');
      }
    }
  }, [scriptDraft.hasDraft, scriptDraft.draft, selectedScriptId, enhancedScriptContent]);

  // Handlers
  const handleClose = useCallback(() => {
    camera.stopCamera();
    screenShare.stopScreenShare();
    audioPlayback.stopAll();
    onClose();
  }, [camera, screenShare, audioPlayback, onClose]);

  const handleLogoUpload = useCallback(() => {
    logoInputRef.current?.click();
  }, []);

  const handleLogoFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogo(prev => ({
        ...prev,
        enabled: true,
        src: e.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Script content update handler
  const handleScriptContentUpdate = useCallback((id: string, newContent: string) => {
    setScripts(prev => prev.map(s => 
      s.id === id ? { ...s, content: newContent } : s
    ));
    toast.success('Script updated!');
  }, []);

  // Script analysis - uses AI
  const handleAnalyzeScript = useCallback(async (): Promise<any> => {
    if (!currentScript) return null;
    setIsAnalyzing(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-script`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            scriptContent: currentScript.content,
            mode: 'analyze'
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentScript]);

  // Script enhancement - uses AI
  const handleEnhanceScript = useCallback(async (): Promise<any> => {
    if (!currentScript) return null;
    setIsEnhancing(true);
    
    try {
      toast.info('Enhancing script with AI...');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-script`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            scriptContent: currentScript.content,
            mode: 'enhance'
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Enhancement failed');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        // Return the full enhancement data including changes
        toast.success('Script enhanced! Review the changes below.');
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error(error instanceof Error ? error.message : 'Enhancement failed');
      return null;
    } finally {
      setIsEnhancing(false);
    }
  }, [currentScript]);

  // TTS generation - uses real API integration with cost tracking
  const handleGenerateTTS = useCallback(async () => {
    const textToSpeak = ttsText || currentScript?.content;
    if (!textToSpeak) {
      toast.error('No text to generate TTS');
      return;
    }
    
    setIsTTSGenerating(true);
    
    try {
      toast.info(`Generating TTS with ${ttsProvider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'}...`);
      
      const result = await ttsGeneration.generate({
        text: textToSpeak,
        voice: selectedVoice,
        provider: ttsProvider,
      });
      
      if (result.audioUrl) {
        setHasTTSAudio(true);
        setTTSAudioUrl(result.audioUrl);
        
        // Log cost to current project if selected
        if (mediaProject.currentProject) {
          await mediaProject.logCost({
            operation_type: 'tts',
            operation_name: `TTS: ${textToSpeak.substring(0, 50)}...`,
            cost: result.estimatedCost || 0.01,
            provider: ttsProvider,
            characters_processed: textToSpeak.length,
            metadata: { voice: selectedVoice }
          });
        }
        
        toast.success('TTS audio generated! Click Play to preview.');
      }
    } catch (error) {
      toast.error('TTS generation failed');
    } finally {
      setIsTTSGenerating(false);
    }
  }, [ttsText, currentScript, ttsProvider, selectedVoice, ttsGeneration, mediaProject]);

  // Start recording - show camera setup dialog first
  const handleStartRecording = useCallback(async () => {
    // Always show camera setup dialog first to let user configure recording mode
    setShowCameraSetupDialog(true);
  }, []);

  // Handle camera setup confirmation
  const handleCameraSetupConfirm = useCallback(async (mode: RecordingMode, options: CameraSetupOptions) => {
    // Apply selected mode
    setRecordingMode(mode);
    
    // Apply options
    setPipEnabled(options.enablePIP);
    setIsBlurEnabled(options.enableBackgroundBlur);
    
    // Apply studio sound settings
    if (options.enableStudioSound) {
      studioSound.applyPreset('podcast');
    } else {
      studioSound.applyPreset('off');
    }
    
    // If we have an enhanced script, show the script selection dialog
    if (cleanEnhancedScript && currentScript) {
      setShowPreRecordingDialog(true);
      return;
    }
    
    // No enhanced script - proceed directly
    await proceedWithRecording(mode);
  }, [cleanEnhancedScript, currentScript, studioSound]);

  // Handle script selection from pre-recording dialog
  const handlePreRecordingScriptSelect = useCallback(async (useEnhanced: boolean) => {
    setIsUsingEnhancedScript(useEnhanced);
    await proceedWithRecording(recordingMode);
  }, [recordingMode]);

  // Actual recording start logic
  const proceedWithRecording = useCallback(async (mode: RecordingMode) => {
    // If screen mode, start screen share first
    if (mode !== 'camera' && !screenShare.isSharing) {
      toast.info('Select your screen to share...');
      const stream = await screenShare.startScreenShare();
      if (!stream) {
        toast.error('Screen share cancelled');
        return;
      }
    }
    
    // Open teleprompter automatically when recording starts
    if (currentScript) {
      setTeleprompterOpen(true);
    }
    
    // Start recording (countdown handled by useRecording)
    recording.startRecording();
    
    // Start audio playback after countdown
    setTimeout(() => {
      if (currentVoiceover) {
        audioPlayback.playVoiceover(currentVoiceover.url);
      }
      if (currentMusic) {
        audioPlayback.playMusic(currentMusic.url);
      }
      
      // Start teleprompter scrolling
      setTeleprompter(prev => ({ ...prev, isScrolling: true }));
      
      // Reset word index for teleprompter
      setCurrentWordIndex(0);
    }, 3500); // After 3 second countdown + buffer
  }, [recording, audioPlayback, currentVoiceover, currentMusic, screenShare, currentScript]);

  // Pause recording - also pause audio
  const handlePauseRecording = useCallback(() => {
    recording.pauseRecording();
    
    // Pause/resume audio with recording
    if (!recording.isPaused) {
      // Pausing - stop audio
      audioPlayback.stopVoiceover();
      audioPlayback.stopTTS();
    }
  }, [recording, audioPlayback]);

  // Stop recording - stop all audio
  const handleStopRecording = useCallback(() => {
    recording.stopRecording();
    audioPlayback.stopAll();
    
    if (screenShare.isSharing) {
      screenShare.stopScreenShare();
    }
  }, [recording, audioPlayback, screenShare]);

  // Trim handler with undo support - now uses hook's trimLastSeconds
  const handleTrimSeconds = useCallback((seconds: number) => {
    if (!recording.recordedChunks || recording.recordedChunks.length === 0) {
      toast.info('Nothing to trim');
      return;
    }
    
    // Store current blob for undo before trimming
    const currentBlob = new Blob(recording.recordedChunks, { type: 'video/webm' });
    trimHistoryRef.current.push(currentBlob);
    
    // Use the hook's trim function
    recording.trimLastSeconds?.(seconds);
    
    toast.success(`Trimmed last ${seconds} seconds`);
    setCanUndoTrim(true);
  }, [recording]);

  // Transcribe current recording (during pause)
  const handleTranscribeRecording = useCallback(async () => {
    if (!recording.isPaused) {
      toast.error('Pause recording to transcribe');
      return;
    }

    const blob = recording.getCurrentBlob?.();
    if (!blob) {
      toast.error('No recording to transcribe');
      return;
    }

    setIsTranscribing(true);
    try {
      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );

      const response = await fetch(
        `https://ithspbabhmdntioslfqe.supabase.co/functions/v1/voice-to-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aHNwYmFiaG1kbnRpb3NsZnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MjU5OTMsImV4cCI6MjA2MjUwMTk5M30.yUZZHsz2wIHboVuWWfqXeAH5oHRxzJIz20NWSUmHPhw`,
          },
          body: JSON.stringify({ audio: base64Audio }),
        }
      );

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const { text } = await response.json();
      setTranscriptionText(text);
      toast.success('Transcription complete!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe recording');
    } finally {
      setIsTranscribing(false);
    }
  }, [recording]);

  const handleUndoTrim = useCallback(() => {
    if (trimHistoryRef.current.length === 0) {
      toast.info('Nothing to undo');
      return;
    }
    
    trimHistoryRef.current.pop();
    setCanUndoTrim(trimHistoryRef.current.length > 0);
    toast.success('Trim undone');
  }, []);

  // Save recording from preview
  const handleSaveRecording = useCallback(async () => {
    if (!lastRecordingBlob) return;
    
    const script = scripts.find(s => s.id === selectedScriptId);
    await library.saveRecording(lastRecordingBlob, {
      name: `Recording ${new Date().toLocaleString()}`,
      duration: recording.duration,
      scriptTitle: script?.title,
      hasVoiceover: !!selectedVoiceoverId,
      hasMusic: !!selectedMusicId,
    });
    
    // Download
    const url = URL.createObjectURL(lastRecordingBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Recording saved!');
    setShowRecordingPreview(false);
    setLastRecordingBlob(null);
  }, [lastRecordingBlob, scripts, selectedScriptId, library, recording.duration, selectedVoiceoverId, selectedMusicId]);

  // Discard recording
  const handleDiscardRecording = useCallback(() => {
    setLastRecordingBlob(null);
    setShowRecordingPreview(false);
    toast.info('Recording discarded');
  }, []);

  // Open recording in video editor
  const handleOpenInEditor = useCallback(() => {
    if (lastRecordingBlob) {
      setEditingBlob(lastRecordingBlob);
      setShowRecordingPreview(false);
      setShowVideoEditor(true);
    }
  }, [lastRecordingBlob]);

  // TTS download
  const handleDownloadTTS = useCallback(() => {
    if (ttsAudioUrl) {
      const a = document.createElement('a');
      a.href = ttsAudioUrl;
      a.download = `tts-${ttsProvider}-${Date.now()}.mp3`;
      a.click();
    } else {
      toast.info('No TTS audio to download');
    }
  }, [ttsAudioUrl, ttsProvider]);

  // Play TTS - create audio element from URL
  const handlePlayTTS = useCallback(() => {
    if (ttsAudioUrl) {
      const audio = new Audio(ttsAudioUrl);
      audioPlayback.playTTS(audio);
    }
  }, [ttsAudioUrl, audioPlayback]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="!max-w-[100vw] !w-screen !h-screen !rounded-none p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden">
        {/* Hidden file input */}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoFileChange}
        />

        {/* Header - Minimized in focus mode */}
        <div className={`flex items-center justify-between px-4 border-b bg-background shrink-0 z-10 transition-all duration-300 ${
          headerMinimized ? 'py-1 opacity-60 hover:opacity-100' : 'py-2'
        }`}>
          <div className="flex items-center gap-3">
            <h2 className={`font-semibold flex items-center gap-2 ${headerMinimized ? 'text-sm' : 'text-base'}`}>
              🎬 {!headerMinimized && 'Recording Studio'}
            </h2>
            
            {/* Recording Mode Selector - Hidden in focus mode */}
            {!headerMinimized && (
              <div className="flex items-center border rounded-lg p-0.5 bg-muted/50">
                <Button
                  size="sm"
                  variant={recordingMode === 'camera' ? 'default' : 'ghost'}
                  onClick={() => setRecordingMode('camera')}
                  className="h-7 px-2 gap-1 text-xs"
                >
                  <Camera className="w-3 h-3" />
                  Camera
                </Button>
                <Button
                  size="sm"
                  variant={recordingMode === 'screen' ? 'default' : 'ghost'}
                  onClick={() => setRecordingMode('screen')}
                  className="h-7 px-2 gap-1 text-xs"
                >
                  <Monitor className="w-3 h-3" />
                  Screen
                </Button>
                <Button
                  size="sm"
                  variant={recordingMode === 'screen+camera' ? 'default' : 'ghost'}
                  onClick={() => setRecordingMode('screen+camera')}
                  className="h-7 px-2 gap-1 text-xs"
                >
                  <MonitorPlay className="w-3 h-3" />
                  Both
                </Button>
              </div>
            )}
            
            {/* Screen sharing status */}
            {screenShare.isSharing && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Screen Sharing
              </Badge>
            )}
            
            {/* Recording indicator in header when minimized */}
            {headerMinimized && recording.isRecording && (
              <Badge variant="destructive" className="gap-1 text-xs animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                REC {recording.formattedDuration}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Teleprompter Button */}
            {currentScript && (
              <FloatingTeleprompter
                content={isUsingEnhancedScript && cleanEnhancedScript ? cleanEnhancedScript : currentScript.content}
                title={currentScript.title + (isUsingEnhancedScript ? ' (Enhanced)' : '')}
                isRecording={recording.isRecording}
                scrollSpeed={teleprompter.scrollSpeed}
                isOpen={teleprompterOpen}
                onClose={() => setTeleprompterOpen(false)}
                currentWordIndex={currentWordIndex}
                audioProgress={audioDuration > 0 ? audioCurrentTime / audioDuration : 0}
              />
            )}
            
            {/* Hide controls in focus mode */}
            {!headerMinimized && (
              <>
                <Separator orientation="vertical" className="h-6" />
                
                {/* Project Selector with breakdown */}
                <div className="flex items-center gap-1">
                  <ProjectSelector
                    projects={mediaProject.projects}
                    currentProject={mediaProject.currentProject}
                    onSelectProject={mediaProject.selectProject}
                    onCreateProject={mediaProject.createProject}
                    totalSessionCost={mediaProject.totalSessionCost}
                    isLoading={mediaProject.isLoading}
                  />
                  {mediaProject.currentProject && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setShowAssetBreakdown(true)}
                      title="View project assets"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                
                <Separator orientation="vertical" className="h-6" />
                
                {/* Keyboard Shortcuts Help */}
                <KeyboardShortcutsHelp isRecording={recording.isRecording} />
                
                {/* Recording Quality Settings */}
                <RecordingQualitySettings
                  quality={recordingQuality}
                  onQualityChange={setRecordingQuality}
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => library.setIsOpen(true)}
                  className="gap-1 h-8"
                >
                  <Library className="w-4 h-4" />
                  Library ({library.recordings.length})
                </Button>
              </>
            )}
            
            {/* Focus mode toggle */}
            {headerMinimized && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setHeaderMinimized(false)}
                className="h-7 text-xs"
              >
                Show Controls
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Video Section */}
          <div className="flex-1 flex flex-col p-4 gap-3 min-w-0 overflow-hidden">
            <div className="flex-1 min-h-0 relative">
              {/* Use PictureInPicture for screen+camera mode */}
              {recordingMode === 'screen+camera' && pipEnabled ? (
                <PictureInPicture
                  mainStream={screenShare.screenStream}
                  pipStream={camera.stream}
                  isEnabled={pipEnabled}
                  onToggle={() => setPipEnabled(!pipEnabled)}
                  className="w-full h-full"
                />
              ) : (
                <VideoPreview
                  stream={recordingMode === 'camera' ? camera.stream : (screenShare.screenStream || camera.stream)}
                  isLoading={camera.isLoading || screenShare.isLoading}
                  error={camera.error || screenShare.error}
                  isRecording={recording.isRecording}
                  countdown={recording.countdown}
                  formattedDuration={recording.formattedDuration}
                  teleprompter={{
                    ...teleprompter,
                    content: '', // Teleprompter is now in separate window
                  }}
                  logo={logo}
                  onLogoPositionChange={handleLogoPositionChange}
                  audioCurrentTime={audioCurrentTime}
                  audioDuration={audioDuration}
                  isAudioPlaying={isAudioPlaying}
                  onRetryCamera={camera.retryCamera}
                />
              )}
            </div>

            <RecordingControls
              isCameraEnabled={camera.isEnabled}
              isMicEnabled={camera.isMicEnabled}
              onToggleCamera={camera.toggleCamera}
              onToggleMic={camera.toggleMic}
              isRecording={recording.isRecording}
              isPaused={recording.isPaused}
              canRecord={!!(camera.stream || screenShare.screenStream) && !camera.isLoading}
              onStartRecording={handleStartRecording}
              onPauseRecording={handlePauseRecording}
              onStopRecording={handleStopRecording}
              isTeleprompterEnabled={teleprompterOpen}
              onToggleTeleprompter={() => setTeleprompterOpen(!teleprompterOpen)}
              isBlurEnabled={isBlurEnabled}
              onToggleBlur={() => setIsBlurEnabled(!isBlurEnabled)}
              isLogoEnabled={logo.enabled}
              onToggleLogo={() => setLogo(prev => ({ ...prev, enabled: !prev.enabled }))}
              onUploadLogo={handleLogoUpload}
              captionsEnabled={captionsEnabled}
              onToggleCaptions={() => setCaptionsEnabled(!captionsEnabled)}
              onTrimSeconds={handleTrimSeconds}
              onUndoTrim={handleUndoTrim}
              canUndoTrim={canUndoTrim}
              trimSeconds={trimSeconds}
              onTrimSecondsChange={setTrimSeconds}
              onTranscribe={handleTranscribeRecording}
              isTranscribing={isTranscribing}
              transcriptionText={transcriptionText}
            />
          </div>

          {/* Sidebar - Fixed width, properly contained */}
          <aside 
            className={`shrink-0 border-l bg-card flex flex-col transition-all duration-200 relative z-10 ${
              isSidebarCollapsed ? 'w-14' : 'w-[340px]'
            }`}
            style={{ minWidth: isSidebarCollapsed ? '56px' : '340px' }}
          >
            {/* Header with toggle */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 shrink-0">
              {!isSidebarCollapsed && (
                <span className="text-sm font-semibold">Settings</span>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 ml-auto shrink-0"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              >
                {isSidebarCollapsed ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Content area - scrollable */}
            {!isSidebarCollapsed && (
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Script Panel */}
                <ScriptPanel
                  scripts={scripts}
                  selectedScriptId={selectedScriptId}
                  onScriptChange={setSelectedScriptId}
                  onScriptContentUpdate={handleScriptContentUpdate}
                  scrollSpeed={teleprompter.scrollSpeed}
                  onScrollSpeedChange={(speed) => setTeleprompter(prev => ({ ...prev, scrollSpeed: speed }))}
                  onAnalyzeScript={handleAnalyzeScript}
                  onEnhanceScript={handleEnhanceScript}
                  isAnalyzing={isAnalyzing}
                  isEnhancing={isEnhancing}
                  onEnhancedScriptReady={setCleanEnhancedScript}
                  onUseEnhancedChange={setIsUsingEnhancedScript}
                  // Lifted state props for persistence
                  enhancedContent={enhancedScriptContent}
                  onEnhancedContentChange={setEnhancedScriptContent}
                  enhancementChanges={enhancementChangesData}
                  onEnhancementChangesChange={setEnhancementChangesData}
                  showChanges={showEnhancementChanges}
                  onShowChangesChange={setShowEnhancementChanges}
                  analysisResult={analysisResultData}
                  onAnalysisResultChange={setAnalysisResultData}
                  showAnalysis={showAnalysisResult}
                  onShowAnalysisChange={setShowAnalysisResult}
                />

                {/* Audio Panel */}
                <AudioPanel
                  activeTab={audioPlayback.activeTab}
                  onTabChange={audioPlayback.setActiveTab}
                  voiceovers={voiceovers}
                  selectedVoiceoverId={selectedVoiceoverId}
                  onVoiceoverChange={setSelectedVoiceoverId}
                  onPlayVoiceover={() => currentVoiceover && audioPlayback.playVoiceover(currentVoiceover.url)}
                  onStopVoiceover={audioPlayback.stopVoiceover}
                  isVoiceoverPlaying={audioPlayback.isPlaying.voiceover}
                  voiceoverVolume={audioPlayback.voiceoverVolume}
                  onVoiceoverVolumeChange={audioPlayback.setVoiceoverVolume}
                  musicList={music}
                  selectedMusicId={selectedMusicId}
                  onMusicChange={setSelectedMusicId}
                  onPlayMusic={() => currentMusic && audioPlayback.playMusic(currentMusic.url)}
                  onStopMusic={audioPlayback.stopMusic}
                  isMusicPlaying={audioPlayback.isPlaying.music}
                  musicVolume={audioPlayback.musicVolume}
                  onMusicVolumeChange={audioPlayback.setMusicVolume}
                  musicLoop={audioPlayback.musicLoop}
                  onToggleMusicLoop={audioPlayback.toggleMusicLoop}
                  ttsText={ttsText}
                  onTTSTextChange={setTTSText}
                  selectedVoice={selectedVoice}
                  onVoiceChange={setSelectedVoice}
                  onGenerateTTS={handleGenerateTTS}
                  onPlayTTS={handlePlayTTS}
                  onStopTTS={audioPlayback.stopTTS}
                  isTTSPlaying={audioPlayback.isPlaying.tts}
                  isTTSGenerating={isTTSGenerating}
                  hasTTSAudio={hasTTSAudio}
                  ttsVolume={audioPlayback.ttsVolume}
                  onTTSVolumeChange={audioPlayback.setTTSVolume}
                  ttsAudioUrl={ttsAudioUrl}
                  onDownloadTTS={handleDownloadTTS}
                  ttsProvider={ttsProvider}
                  onTTSProviderChange={setTTSProvider}
                  currentScriptContent={currentScript?.content}
                  cleanScriptContent={cleanEnhancedScript || undefined}
                  onUploadVoiceover={onUploadVoiceover}
                  onUploadMusic={onUploadMusic}
                  isUploading={isUploading}
                />
                
                {/* Studio Sound Panel for Podcast Audio */}
                <StudioSoundPanel
                  settings={studioSound.settings}
                  activePreset={studioSound.activePreset}
                  onPresetChange={studioSound.applyPreset}
                  onSettingsChange={studioSound.updateSettings}
                />
                
                {/* Music Generator */}
                <MusicGenerator 
                  onMusicGenerated={(generatedMusic) => {
                    // Log cost if project selected
                    if (mediaProject.currentProject) {
                      mediaProject.logCost({
                        operation_type: 'music_gen',
                        operation_name: `Music: ${generatedMusic.prompt.substring(0, 30)}...`,
                        cost: 0.05,
                        provider: 'elevenlabs',
                        duration_seconds: generatedMusic.duration,
                      });
                    }
                  }}
                  onPlayMusic={(url) => audioPlayback.playMusic(url)}
                  onStopMusic={audioPlayback.stopMusic}
                  isPlaying={audioPlayback.isPlaying.music}
                />
              </div>
            )}
            
            {/* Collapsed state - icons only */}
            {isSidebarCollapsed && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={() => setIsSidebarCollapsed(false)}
                  title="Script"
                >
                  <FileText className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={() => setIsSidebarCollapsed(false)}
                  title="Audio"
                >
                  <Mic className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={() => setIsSidebarCollapsed(false)}
                  title="Music"
                >
                  <Music className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={() => setIsSidebarCollapsed(false)}
                  title="Studio Sound"
                >
                  <Sliders className="w-5 h-5" />
                </Button>
              </div>
            )}
          </aside>
        </div>

        {/* Library Panel */}
        <RecordingLibraryPanel
          recordings={library.recordings}
          isOpen={library.isOpen}
          onClose={() => library.setIsOpen(false)}
          onPlay={library.downloadRecording}
          onDownload={library.downloadRecording}
          onDelete={library.deleteRecording}
          isLoading={library.isLoading}
        />

        {/* Recording Preview Modal */}
        <RecordingPreview
          blob={lastRecordingBlob}
          isOpen={showRecordingPreview}
          onClose={() => setShowRecordingPreview(false)}
          onSave={handleSaveRecording}
          onDiscard={handleDiscardRecording}
          onEdit={handleOpenInEditor}
          onTrim={async (startTime, endTime) => {
            if (!lastRecordingBlob) return;
            
            try {
              // Try FFmpeg for precise trimming
              if (ffmpegTrim.isLoaded || !ffmpegTrim.isLoading) {
                toast.info('Loading FFmpeg for precise trimming...');
                const loaded = await ffmpegTrim.loadFFmpeg();
                
                if (loaded) {
                  toast.info('Trimming with FFmpeg...');
                  const trimmedBlob = await ffmpegTrim.trimVideo(
                    lastRecordingBlob,
                    startTime,
                    endTime,
                    { quality: 'high', outputFormat: 'webm' }
                  );
                  
                  if (trimmedBlob) {
                    setLastRecordingBlob(trimmedBlob);
                    toast.success(`Trimmed to ${(endTime - startTime).toFixed(1)}s with FFmpeg`);
                    return;
                  }
                }
              }
              
              // Fallback to browser-based trimming
              toast.info('Using browser-based trimming...');
              
              const video = document.createElement('video');
              video.src = URL.createObjectURL(lastRecordingBlob);
              await new Promise(resolve => { video.onloadedmetadata = resolve; });
              
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth || 1280;
              canvas.height = video.videoHeight || 720;
              const ctx = canvas.getContext('2d');
              
              const stream = canvas.captureStream(30);
              const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
              const chunks: Blob[] = [];
              
              mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
              };
              
              await new Promise<void>((resolve) => {
                mediaRecorder.onstop = () => resolve();
                
                video.currentTime = startTime;
                video.play();
                mediaRecorder.start();
                
                const drawFrame = () => {
                  if (video.currentTime >= endTime) {
                    video.pause();
                    mediaRecorder.stop();
                    return;
                  }
                  ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                  requestAnimationFrame(drawFrame);
                };
                drawFrame();
              });
              
              const trimmedBlob = new Blob(chunks, { type: 'video/webm' });
              setLastRecordingBlob(trimmedBlob);
              toast.success(`Trimmed to ${(endTime - startTime).toFixed(1)}s`);
            } catch (error) {
              console.error('Trim error:', error);
              toast.error('Trim failed');
            }
          }}
        />
        
        {/* Video Editor Integration - for advanced post-processing */}
        <VideoEditorIntegration
          isOpen={showVideoEditor}
          onClose={() => {
            setShowVideoEditor(false);
            setEditingBlob(null);
          }}
          recordingBlob={editingBlob}
          recordingName={`Recording-${Date.now()}`}
          voiceovers={voiceovers.map(v => ({ id: v.id, name: v.name, url: v.url }))}
          music={music.map(m => ({ id: m.id, name: m.name, url: m.url }))}
          onSaveEdited={(blob, transcript) => {
            // Save to library
            library.saveRecording(blob, {
              name: `Edited Recording ${new Date().toLocaleString()}`,
              duration: 0,
              scriptTitle: currentScript?.title,
            });
            toast.success('Edited video saved to library!');
          }}
        />

        {/* Pre-Recording Script Selection Dialog */}
        <PreRecordingDialog
          isOpen={showPreRecordingDialog}
          onClose={() => setShowPreRecordingDialog(false)}
          onSelectScript={handlePreRecordingScriptSelect}
          hasEnhancedScript={!!cleanEnhancedScript}
          originalScriptPreview={currentScript?.content || ''}
          enhancedScriptPreview={cleanEnhancedScript || ''}
          scriptTitle={currentScript?.title}
        />

        {/* Camera Setup Dialog - shown before recording */}
        <CameraSetupDialog
          isOpen={showCameraSetupDialog}
          onClose={() => setShowCameraSetupDialog(false)}
          onConfirm={handleCameraSetupConfirm}
          currentMode={recordingMode}
        />

        {/* Project Asset Breakdown */}
        <ProjectAssetBreakdown
          isOpen={showAssetBreakdown}
          onClose={() => setShowAssetBreakdown(false)}
          projectName={mediaProject.currentProject?.name || 'Project'}
          assets={mediaProject.assets}
          totalCost={mediaProject.currentProject?.total_estimated_cost || 0}
        />
      </DialogContent>
    </Dialog>
  );
}
