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
  RecordingLibraryPanel,
  RecordingPreview,
  FloatingTeleprompter,
  PreRecordingDialog,
  CameraSetupDialog,
  KeyboardShortcutsHelp,
  RecordingQualitySettings,
  ProjectSelector,
  StudioSoundPanel,
  PictureInPicture,
  VideoEditorIntegration,
  ProductionInfo,
  AudioAssetSelector
} from './components';
import type { CameraSetupOptions } from './components';
import type { RecordingStudioProps, LogoState, TeleprompterState, ScriptData, AudioTabType } from './types';
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
  productionContext,
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
  const [activeAudioTab, setActiveAudioTab] = useState<AudioTabType>('voiceover');
  const [selectedTTSFileId, setSelectedTTSFileId] = useState('');
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
  
  // Media project tracking for cost management - linked to production when available
  const mediaProject = useMediaProject({ productionContext });
  
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
  const currentTTSFile = voiceovers.find(v => v.id === selectedTTSFileId);
  
  // Analyze scripts for TTS/Voiceover status
  // Returns detailed info about each script's audio availability
  const scriptAudioStatus = scripts.map(script => {
    const scriptTitle = script.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Find matching TTS files (metadataType = 'tts')
    const matchingTTS = voiceovers.filter(v => {
      if (v.metadataType !== 'tts') return false;
      
      // Match by scriptText content
      if (v.scriptText && script.content) {
        const scriptContent = script.enhancedContent || script.content;
        if (v.scriptText.substring(0, 100) === scriptContent.substring(0, 100)) {
          return true;
        }
      }
      // Match by name pattern
      const voName = v.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return voName.includes(scriptTitle) || scriptTitle.includes(voName.substring(0, 20));
    });
    
    // Find matching Voiceover files (metadataType = 'voiceover')
    const matchingVoiceover = voiceovers.filter(v => {
      if (v.metadataType !== 'voiceover') return false;
      
      // Match by scriptText content
      if (v.scriptText && script.content) {
        const scriptContent = script.enhancedContent || script.content;
        if (v.scriptText.substring(0, 100) === scriptContent.substring(0, 100)) {
          return true;
        }
      }
      // Match by name pattern
      const voName = v.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return voName.includes(scriptTitle) || scriptTitle.includes(voName.substring(0, 20));
    });
    
    // Determine if TTS is for enhanced or original version
    const hasTTSForEnhanced = matchingTTS.some(t => 
      t.name.toLowerCase().includes('enhanced') || 
      (t.scriptText && script.enhancedContent && t.scriptText.substring(0, 50) === script.enhancedContent.substring(0, 50))
    );
    const hasTTSForOriginal = matchingTTS.some(t => 
      !t.name.toLowerCase().includes('enhanced') &&
      (t.scriptText && script.content && t.scriptText.substring(0, 50) === script.content.substring(0, 50))
    );
    
    return {
      script,
      hasTTS: matchingTTS.length > 0,
      hasVoiceover: matchingVoiceover.length > 0,
      hasEnhanced: !!script.enhancedContent,
      hasTTSForEnhanced,
      hasTTSForOriginal: hasTTSForOriginal || (matchingTTS.length > 0 && !hasTTSForEnhanced),
      ttsFiles: matchingTTS,
      voiceoverFiles: matchingVoiceover,
      // Best audio file to use (prefer TTS, then voiceover)
      bestAudioFile: matchingTTS[0] || matchingVoiceover[0] || null
    };
  });
  
  // Group scripts by status
  const scriptsWithTTS = scriptAudioStatus.filter(s => s.hasTTS);
  const scriptsWithVoiceoverOnly = scriptAudioStatus.filter(s => !s.hasTTS && s.hasVoiceover);
  const scriptsNeedingAudio = scriptAudioStatus.filter(s => !s.hasTTS && !s.hasVoiceover);
  
  console.log('[RecordingStudio] Script audio status:', {
    withTTS: scriptsWithTTS.length,
    withVoiceoverOnly: scriptsWithVoiceoverOnly.length,
    needingAudio: scriptsNeedingAudio.length,
    total: scripts.length
  });
  
  // Track script text from selected TTS/voiceover for teleprompter
  const [audioLinkedScriptText, setAudioLinkedScriptText] = useState<string | null>(null);
  
  // Debug logging for audio selection state
  useEffect(() => {
    console.log('[RecordingStudio] Audio asset state:', {
      voiceoversCount: voiceovers.length,
      voiceovers: voiceovers.map(v => ({ 
        id: v.id, 
        name: v.name, 
        metadataType: v.metadataType,
        hasUrl: !!v.url,
        urlType: v.url?.startsWith('blob:') ? 'blob' : v.url?.startsWith('http') ? 'http' : 'other'
      })),
      selectedVoiceoverId,
      currentVoiceover: currentVoiceover ? { 
        id: currentVoiceover.id, 
        name: currentVoiceover.name, 
        hasUrl: !!currentVoiceover.url,
        urlPreview: currentVoiceover.url?.substring(0, 60)
      } : 'None',
      selectedTTSFileId,
      currentTTSFile: currentTTSFile ? { 
        id: currentTTSFile.id, 
        name: currentTTSFile.name, 
        hasUrl: !!currentTTSFile.url,
        hasScriptText: !!currentTTSFile.scriptText 
      } : 'None',
      musicCount: music.length,
      selectedMusicId,
      currentMusic: currentMusic ? { id: currentMusic.id, name: currentMusic.name } : 'None'
    });
  }, [voiceovers, selectedVoiceoverId, currentVoiceover, selectedTTSFileId, currentTTSFile, music, selectedMusicId, currentMusic]);

  // Auto-load script text from TTS/voiceover when selected (for teleprompter sync)
  useEffect(() => {
    if (currentTTSFile?.scriptText) {
      console.log('[RecordingStudio] Loading script text from TTS file for teleprompter:', currentTTSFile.name);
      setAudioLinkedScriptText(currentTTSFile.scriptText);
    } else if (currentVoiceover?.scriptText) {
      console.log('[RecordingStudio] Loading script text from voiceover for teleprompter:', currentVoiceover.name);
      setAudioLinkedScriptText(currentVoiceover.scriptText);
    } else {
      setAudioLinkedScriptText(null);
    }
  }, [currentTTSFile, currentVoiceover]);

  // Apply production context settings when opened from Production Hub
  useEffect(() => {
    if (productionContext) {
      console.log('[RecordingStudio] Applying production context:', productionContext.showTitle);
      
      // Auto-select linked script if available
      if (productionContext.linkedScriptId) {
        const linkedScript = scripts.find(s => s.id === productionContext.linkedScriptId);
        if (linkedScript) {
          setSelectedScriptId(linkedScript.id);
        }
      }
      
      // Auto-select linked music if available  
      if (productionContext.linkedMusicId) {
        const linkedMusic = music.find(m => m.id === productionContext.linkedMusicId);
        if (linkedMusic) {
          setSelectedMusicId(linkedMusic.id);
        }
      }
      
      // Apply studio settings from production context
      if (productionContext.studioSettings) {
        const settings = productionContext.studioSettings;
        
        // Set teleprompter speed
        setTeleprompter(prev => ({
          ...prev,
          scrollSpeed: settings.teleprompterSpeed,
          enabled: settings.teleprompterEnabled,
        }));
        
        // Set TTS provider and voice
        setTTSProvider(settings.ttsProvider);
        setSelectedVoice(settings.ttsVoiceId);
        
        // Apply studio sound preset based on production type
        if (settings.studioSoundEnabled) {
          studioSound.applyPreset('podcast');
        }
      }
    }
  }, [productionContext, scripts, music, studioSound]);
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
    console.log('[Logo] Upload button clicked, triggering file input');
    logoInputRef.current?.click();
  }, []);

  const handleLogoFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('[Logo] No file selected');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    console.log('[Logo] Processing file:', file.name, file.type, file.size);
    
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (result) {
        setLogo(prev => ({
          ...prev,
          enabled: true,
          src: result,
        }));
        toast.success('Logo uploaded! Drag to reposition.');
        console.log('[Logo] Logo loaded successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to load image');
      console.error('[Logo] FileReader error');
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    e.target.value = '';
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
    
    console.log('[RecordingStudio] handleGenerateTTS called:', {
      ttsTextLength: ttsText?.length || 0,
      currentScriptContent: currentScript?.content?.substring(0, 50) || 'None',
      textToSpeakLength: textToSpeak?.length || 0,
      provider: ttsProvider,
      voice: selectedVoice
    });
    
    if (!textToSpeak) {
      toast.error('No text to generate TTS. Enter text or select a script first.');
      return;
    }
    
    setIsTTSGenerating(true);
    
    try {
      console.log('[RecordingStudio] Calling ttsGeneration.generate...');
      
      const result = await ttsGeneration.generate({
        text: textToSpeak,
        voice: selectedVoice,
        provider: ttsProvider,
      });
      
      console.log('[RecordingStudio] TTS generation result:', {
        success: !!result,
        hasAudioUrl: !!result?.audioUrl,
        audioUrlPreview: result?.audioUrl?.substring(0, 60) || 'None',
        duration: result?.duration
      });
      
      if (result && result.audioUrl) {
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
      } else {
        console.error('[RecordingStudio] TTS generation returned no result or no audioUrl');
        toast.error('TTS generation failed - no audio returned');
      }
    } catch (error) {
      console.error('[RecordingStudio] TTS generation error:', error);
      toast.error('TTS generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    
    // Get the countdown duration (default 5 seconds + small buffer)
    const countdownMs = 5000 + 500;
    
    // Start audio playback after countdown completes
    setTimeout(() => {
      console.log('[RecordingStudio] === AUDIO PLAYBACK AFTER COUNTDOWN ===');
      console.log('[RecordingStudio] Selection IDs:', {
        selectedVoiceoverId,
        selectedTTSFileId,
        selectedMusicId,
      });
      console.log('[RecordingStudio] Resolved audio sources:', {
        currentVoiceover: currentVoiceover ? { 
          id: currentVoiceover.id, 
          name: currentVoiceover.name, 
          hasUrl: !!currentVoiceover.url,
          urlPreview: currentVoiceover.url?.substring(0, 50)
        } : 'None (not selected)',
        currentTTSFile: currentTTSFile ? {
          id: currentTTSFile.id,
          name: currentTTSFile.name,
          hasUrl: !!currentTTSFile.url,
          urlPreview: currentTTSFile.url?.substring(0, 50)
        } : 'None (not selected)',
        currentMusic: currentMusic ? {
          id: currentMusic.id,
          name: currentMusic.name,
          hasUrl: !!currentMusic.url
        } : 'None (not selected)',
        ttsGenerationResult: ttsGeneration.lastResult?.audioUrl ? 'Available' : 'None',
        ttsAudioUrlState: ttsAudioUrl ? 'Available' : 'None',
      });
      
      // Priority for voice audio:
      // 1. Selected TTS file from AudioAssetSelector (TTS tab)
      // 2. Selected voiceover from AudioAssetSelector (Voiceover tab)
      // 3. Generated TTS audio (from ttsGeneration hook - live TTS)
      // 4. Local TTS URL state (legacy)
      let voiceAudioPlayed = false;
      
      if (currentTTSFile?.url) {
        console.log('[RecordingStudio] ▶️ Playing TTS file:', currentTTSFile.name);
        audioPlayback.playTTS(currentTTSFile.url);
        voiceAudioPlayed = true;
      } else if (currentVoiceover?.url) {
        console.log('[RecordingStudio] ▶️ Playing voiceover:', currentVoiceover.name);
        audioPlayback.playVoiceover(currentVoiceover.url);
        voiceAudioPlayed = true;
      } else if (ttsGeneration.lastResult?.audioUrl) {
        console.log('[RecordingStudio] ▶️ Playing generated TTS audio');
        const ttsAudioElement = new Audio(ttsGeneration.lastResult.audioUrl);
        audioPlayback.playTTS(ttsAudioElement);
        voiceAudioPlayed = true;
      } else if (ttsAudioUrl) {
        console.log('[RecordingStudio] ▶️ Playing TTS from state URL');
        const ttsAudioElement = new Audio(ttsAudioUrl);
        audioPlayback.playTTS(ttsAudioElement);
        voiceAudioPlayed = true;
      }
      
      if (!voiceAudioPlayed) {
        console.log('[RecordingStudio] ⚠️ No voice audio selected - recording without voice track');
      }
      
      // Play music (can play alongside voice)
      if (currentMusic?.url) {
        console.log('[RecordingStudio] ▶️ Playing music:', currentMusic.name);
        audioPlayback.playMusic(currentMusic.url);
      }
      
      // Start teleprompter scrolling
      setTeleprompter(prev => ({ ...prev, isScrolling: true }));
      
      // Reset word index for teleprompter
      setCurrentWordIndex(0);
    }, countdownMs);
  }, [recording, audioPlayback, currentVoiceover, currentTTSFile, currentMusic, screenShare, currentScript, ttsGeneration.lastResult, ttsAudioUrl, hasTTSAudio, selectedVoiceoverId, selectedTTSFileId, selectedMusicId]);

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

  // Play TTS - create audio element from URL (check both local state and hook result)
  const handlePlayTTS = useCallback(() => {
    const audioUrl = ttsAudioUrl || ttsGeneration.lastResult?.audioUrl;
    console.log('[RecordingStudio] handlePlayTTS called, audioUrl:', audioUrl ? 'Available' : 'Missing');
    
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      console.log('[RecordingStudio] Playing TTS audio');
      audioPlayback.playTTS(audio);
    } else {
      toast.info('No TTS audio available. Generate TTS first.');
    }
  }, [ttsAudioUrl, ttsGeneration.lastResult?.audioUrl, audioPlayback]);

  // Prevent closing during recording - only allow explicit close button
  // MUST be before any early returns to avoid hooks order issues
  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      // If recording, warn user before closing
      if (recording.isRecording) {
        const confirmed = window.confirm('Recording in progress. Are you sure you want to close? Your recording will be lost.');
        if (confirmed) {
          recording.stopRecording();
          handleClose();
        }
        // Don't close if not confirmed
        return;
      }
      handleClose();
    }
  }, [recording.isRecording, recording.stopRecording, handleClose]);

  // Don't use early return - let Dialog handle open/close state
  // This ensures hooks are always called in the same order

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleDialogOpenChange}
      modal={true}
    >
      <DialogContent 
        className="!max-w-[100vw] !w-screen !h-screen !rounded-none p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside during recording
          if (recording.isRecording) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent escape key closing during recording
          if (recording.isRecording) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent any outside interaction from closing during recording
          if (recording.isRecording) {
            e.preventDefault();
          }
        }}
      >
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
            {/* Teleprompter Button - works with script OR audio-linked script text */}
            {(currentScript || audioLinkedScriptText) && (
              <FloatingTeleprompter
                content={
                  currentScript 
                    ? (isUsingEnhancedScript && cleanEnhancedScript ? cleanEnhancedScript : currentScript.content)
                    : audioLinkedScriptText || ''
                }
                title={
                  currentScript 
                    ? (currentScript.title + (isUsingEnhancedScript ? ' (Enhanced)' : ''))
                    : (currentTTSFile?.name || currentVoiceover?.name || 'Audio Script')
                }
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
                    isLinkedToProduction={mediaProject.isLinkedToProduction}
                    productionContext={productionContext}
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
                  isBlurEnabled={isBlurEnabled && recordingMode === 'camera'}
                  blurAmount={15}
                  isBlurLoading={mlBlur.isModelLoading}
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
                {/* Production Info - Show when opened from Production Hub */}
                {productionContext && (
                  <ProductionInfo productionContext={productionContext} />
                )}

                {/* Info Banner - Pre-production in GenieStudio */}
                {!productionContext && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-primary">Tip:</span> Script enhancement, TTS, and music generation are done in GenieStudio. Select prepared assets here for recording.
                    </p>
                  </div>
                )}

                {/* Script Selection - Shows all scripts with status indicators */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Script</span>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                        {scriptsWithTTS.length} TTS
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30">
                        {scriptsWithVoiceoverOnly.length} VO
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                        {scriptsNeedingAudio.length} need audio
                      </Badge>
                    </div>
                  </div>
                  <select
                    value={selectedScriptId}
                    onChange={(e) => {
                      const scriptId = e.target.value;
                      setSelectedScriptId(scriptId);
                      
                      // Auto-select matching audio file when script is selected
                      if (scriptId) {
                        const scriptStatus = scriptAudioStatus.find(s => s.script.id === scriptId);
                        if (scriptStatus?.bestAudioFile) {
                          console.log('[RecordingStudio] Auto-selected audio for script:', scriptStatus.bestAudioFile.name);
                          if (scriptStatus.hasTTS) {
                            setSelectedTTSFileId(scriptStatus.bestAudioFile.id);
                            setActiveAudioTab('tts');
                          } else if (scriptStatus.hasVoiceover) {
                            setSelectedVoiceoverId(scriptStatus.bestAudioFile.id);
                            setActiveAudioTab('voiceover');
                          }
                        }
                      }
                    }}
                    className="w-full p-2 rounded-md border bg-background text-sm"
                  >
                    <option value="">Select script for teleprompter...</option>
                    
                    {/* Scripts with TTS - Ready to record */}
                    {scriptsWithTTS.length > 0 && (
                      <optgroup label="✓ TTS Ready">
                        {scriptsWithTTS.map((s) => (
                          <option key={s.script.id} value={s.script.id}>
                            {s.script.title} {s.hasEnhanced ? '(Enhanced)' : '(Original)'} {s.hasTTSForEnhanced ? '• Enhanced TTS' : s.hasTTSForOriginal ? '• Original TTS' : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    
                    {/* Scripts with Voiceover only */}
                    {scriptsWithVoiceoverOnly.length > 0 && (
                      <optgroup label="🎙 Voiceover Only">
                        {scriptsWithVoiceoverOnly.map((s) => (
                          <option key={s.script.id} value={s.script.id}>
                            {s.script.title} {s.hasEnhanced ? '(Enhanced)' : '(Original)'}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    
                    {/* Scripts needing audio */}
                    {scriptsNeedingAudio.length > 0 && (
                      <optgroup label="⚠ Needs Audio">
                        {scriptsNeedingAudio.map((s) => (
                          <option key={s.script.id} value={s.script.id} className="text-muted-foreground">
                            {s.script.title} {s.hasEnhanced ? '(Enhanced available)' : '(Original only)'}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  
                  {/* Status message based on selected script */}
                  {selectedScriptId && (() => {
                    const status = scriptAudioStatus.find(s => s.script.id === selectedScriptId);
                    if (!status) return null;
                    
                    if (status.hasTTS) {
                      return (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          ✓ TTS audio ready - will auto-play during recording
                        </p>
                      );
                    } else if (status.hasVoiceover) {
                      return (
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          🎙 Voiceover available - will auto-play during recording
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          ⚠ No audio for this script - generate TTS in Genie Studio
                        </p>
                      );
                    }
                  })()}
                  
                  {currentScript && (
                    <div className="p-2 rounded bg-muted/50 text-xs text-muted-foreground max-h-24 overflow-y-auto">
                      {currentScript.content?.slice(0, 200)}...
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Scroll Speed:</span>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={teleprompter.scrollSpeed}
                      onChange={(e) => setTeleprompter(prev => ({ ...prev, scrollSpeed: parseFloat(e.target.value) }))}
                      className="flex-1 h-2"
                    />
                    <span className="text-xs font-medium">{teleprompter.scrollSpeed.toFixed(1)}x</span>
                  </div>
                </div>

                <Separator />

                {/* Audio Asset Selector - Selection only, no generation */}
                <AudioAssetSelector
                  activeTab={activeAudioTab}
                  onTabChange={setActiveAudioTab}
                  
                  // Voiceover - select and play existing files
                  voiceovers={voiceovers}
                  selectedVoiceoverId={selectedVoiceoverId}
                  onVoiceoverChange={setSelectedVoiceoverId}
                  onPlayVoiceover={() => {
                    // Find voiceover fresh in callback to avoid stale closure
                    const voiceoverToPlay = voiceovers.find(v => v.id === selectedVoiceoverId);
                    console.log('[RecordingStudio] onPlayVoiceover:', { 
                      selectedVoiceoverId, 
                      found: !!voiceoverToPlay, 
                      name: voiceoverToPlay?.name,
                      url: voiceoverToPlay?.url?.substring(0, 80),
                      allVoiceoverIds: voiceovers.map(v => v.id)
                    });
                    if (voiceoverToPlay?.url) {
                      audioPlayback.playVoiceover(voiceoverToPlay.url);
                    } else {
                      toast.error('Select a voiceover file first');
                    }
                  }}
                  onStopVoiceover={audioPlayback.stopVoiceover}
                  isVoiceoverPlaying={audioPlayback.isPlaying.voiceover}
                  voiceoverVolume={audioPlayback.voiceoverVolume}
                  onVoiceoverVolumeChange={audioPlayback.setVoiceoverVolume}
                  
                  // Music - select and play existing files
                  musicList={music}
                  selectedMusicId={selectedMusicId}
                  onMusicChange={setSelectedMusicId}
                  onPlayMusic={() => {
                    // Find music fresh in callback to avoid stale closure
                    const musicToPlay = music.find(m => m.id === selectedMusicId);
                    console.log('[RecordingStudio] onPlayMusic:', { 
                      selectedMusicId, 
                      found: !!musicToPlay, 
                      name: musicToPlay?.name,
                      url: musicToPlay?.url?.substring(0, 80)
                    });
                    if (musicToPlay?.url) {
                      audioPlayback.playMusic(musicToPlay.url);
                    } else {
                      toast.error('Select a music file first');
                    }
                  }}
                  onStopMusic={audioPlayback.stopMusic}
                  isMusicPlaying={audioPlayback.isPlaying.music}
                  musicVolume={audioPlayback.musicVolume}
                  onMusicVolumeChange={audioPlayback.setMusicVolume}
                  musicLoop={audioPlayback.musicLoop}
                  onToggleMusicLoop={audioPlayback.toggleMusicLoop}
                  
                  // TTS - select and play existing TTS files from GenieStudio
                  ttsFiles={voiceovers} // Pass all voiceovers, component will filter TTS files
                  selectedTTSFileId={selectedTTSFileId}
                  onTTSFileChange={setSelectedTTSFileId}
                  onPlayTTS={() => {
                    const ttsFile = voiceovers.find(v => v.id === selectedTTSFileId);
                    console.log('[RecordingStudio] Playing TTS:', { selectedTTSFileId, ttsFile: ttsFile?.name, url: ttsFile?.url?.substring(0, 50) });
                    if (ttsFile?.url) {
                      audioPlayback.playTTS(ttsFile.url);
                    } else {
                      toast.error('Select a TTS file first');
                    }
                  }}
                  onStopTTS={audioPlayback.stopTTS}
                  isTTSPlaying={audioPlayback.isPlaying.tts}
                  ttsVolume={audioPlayback.ttsVolume}
                  onTTSVolumeChange={audioPlayback.setTTSVolume}
                  
                  // Ducking control
                  duckingEnabled={audioPlayback.duckingEnabled}
                  onToggleDucking={audioPlayback.toggleDucking}
                />

                <Separator />
                
                {/* Studio Sound Panel for Podcast Audio Processing */}
                <StudioSoundPanel
                  settings={studioSound.settings}
                  activePreset={studioSound.activePreset}
                  onPresetChange={studioSound.applyPreset}
                  onSettingsChange={studioSound.updateSettings}
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
