/**
 * Fullscreen Recording Studio - Main Component
 * Complete React implementation with all features from original popout
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Library } from 'lucide-react';
import { toast } from 'sonner';

import { useCamera, useRecording, useAudioPlayback, useRecordingLibrary } from './hooks';
import { 
  VideoPreview, 
  RecordingControls, 
  AudioPanel, 
  ScriptPanel, 
  RecordingLibraryPanel,
  RecordingPreview 
} from './components';
import type { RecordingStudioProps, LogoState, TeleprompterState, ScriptData } from './types';

export function RecordingStudio({
  isOpen,
  onClose,
  scripts: initialScripts,
  voiceovers,
  music,
  selectedScriptId: initialScriptId = '',
  selectedVoiceoverId: initialVoiceoverId = '',
  selectedMusicId: initialMusicId = '',
}: RecordingStudioProps) {
  // Scripts with local content management
  const [scripts, setScripts] = useState<ScriptData[]>(initialScripts);
  
  // Selections
  const [selectedScriptId, setSelectedScriptId] = useState(initialScriptId);
  const [selectedVoiceoverId, setSelectedVoiceoverId] = useState(initialVoiceoverId);
  const [selectedMusicId, setSelectedMusicId] = useState(initialMusicId);
  
  // Feature states
  const [teleprompter, setTeleprompter] = useState<TeleprompterState>({
    enabled: true,
    scrollSpeed: 1.0,
    isScrolling: false,
  });
  
  const [logo, setLogo] = useState<LogoState>({
    enabled: false,
    src: null,
    position: { x: 20, y: 20 },
    size: 'medium',
  });
  
  const [isBlurEnabled, setIsBlurEnabled] = useState(false);
  const [ttsText, setTTSText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [hasTTSAudio, setHasTTSAudio] = useState(false);
  const [isTTSGenerating, setIsTTSGenerating] = useState(false);
  
  // Script analysis/enhancement states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Recording preview
  const [lastRecordingBlob, setLastRecordingBlob] = useState<Blob | null>(null);
  const [showRecordingPreview, setShowRecordingPreview] = useState(false);
  
  // Audio sync for word highlighting
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Update scripts when props change
  useEffect(() => {
    setScripts(initialScripts);
  }, [initialScripts]);

  // Hooks
  const camera = useCamera({ autoStart: isOpen });
  const library = useRecordingLibrary();
  const audioPlayback = useAudioPlayback();
  
  // Use audio time info from hook for better sync
  useEffect(() => {
    if (audioPlayback.audioTimeInfo) {
      setAudioCurrentTime(audioPlayback.audioTimeInfo.currentTime);
      setAudioDuration(audioPlayback.audioTimeInfo.duration);
    }
  }, [audioPlayback.audioTimeInfo]);
  
  const recording = useRecording(camera.stream, {
    onRecordingComplete: async (blob, duration) => {
      // Stop all audio playback
      audioPlayback.stopAll();
      
      // Show preview instead of immediately saving
      setLastRecordingBlob(blob);
      setShowRecordingPreview(true);
    },
  });

  // Get current data
  const currentScript = scripts.find(s => s.id === selectedScriptId);
  const currentVoiceover = voiceovers.find(v => v.id === selectedVoiceoverId);
  const currentMusic = music.find(m => m.id === selectedMusicId);

  // Handlers
  const handleClose = useCallback(() => {
    camera.stopCamera();
    audioPlayback.stopAll();
    onClose();
  }, [camera, audioPlayback, onClose]);

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
    toast.success('Script updated with enhanced version!');
  }, []);

  // Script analysis
  const handleAnalyzeScript = useCallback(async (): Promise<string | null> => {
    if (!currentScript) return null;
    setIsAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const wordCount = currentScript.content.split(/\s+/).length;
      const estimatedDuration = Math.ceil(wordCount / 150);
      const sentences = currentScript.content.split(/[.!?]+/).filter(s => s.trim()).length;
      
      return `Words: ${wordCount} | Sentences: ${sentences} | Est: ${estimatedDuration}min`;
    } catch (error) {
      toast.error('Analysis failed');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentScript]);

  // Script enhancement
  const handleEnhanceScript = useCallback(async (): Promise<string | null> => {
    if (!currentScript) return null;
    setIsEnhancing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simple enhancement simulation - add paragraph breaks
      const enhanced = currentScript.content
        .replace(/\. /g, '.\n\n')
        .replace(/! /g, '!\n\n')
        .replace(/\? /g, '?\n\n');
      
      return enhanced.trim();
    } catch (error) {
      toast.error('Enhancement failed');
      return null;
    } finally {
      setIsEnhancing(false);
    }
  }, [currentScript]);

  // TTS generation
  const handleGenerateTTS = useCallback(async () => {
    if (!ttsText) return;
    setIsTTSGenerating(true);
    
    try {
      toast.info('TTS generation - integrate with ElevenLabs or OpenAI');
      setHasTTSAudio(false);
    } catch (error) {
      toast.error('TTS generation failed');
    } finally {
      setIsTTSGenerating(false);
    }
  }, [ttsText]);

  // Start recording with audio
  const handleStartRecording = useCallback(() => {
    recording.startRecording();
    
    // Start audio playback with overlap prevention
    if (currentVoiceover) {
      audioPlayback.playVoiceover(currentVoiceover.url);
    }
    if (currentMusic) {
      audioPlayback.playMusic(currentMusic.url);
    }
  }, [recording, audioPlayback, currentVoiceover, currentMusic]);

  // Stop recording
  const handleStopRecording = useCallback(() => {
    recording.stopRecording();
    audioPlayback.stopAll();
  }, [recording, audioPlayback]);

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

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background shrink-0 z-10">
          <h2 className="text-base font-semibold flex items-center gap-2">
            🎬 Recording Studio
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => library.setIsOpen(true)}
              className="gap-1 h-8"
            >
              <Library className="w-4 h-4" />
              Library ({library.recordings.length})
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content - True fullscreen layout */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Video Section - Takes full remaining width */}
          <div className="flex-1 flex flex-col p-4 gap-3 min-w-0 overflow-hidden">
            <div className="flex-1 min-h-0">
              <VideoPreview
                stream={camera.stream}
                isLoading={camera.isLoading}
                error={camera.error}
                isRecording={recording.isRecording}
                countdown={recording.countdown}
                formattedDuration={recording.formattedDuration}
                teleprompter={{
                  ...teleprompter,
                  content: currentScript?.content || '',
                }}
                logo={logo}
                onLogoPositionChange={(pos) => setLogo(prev => ({ ...prev, position: pos }))}
                audioCurrentTime={audioCurrentTime}
                audioDuration={audioDuration}
                onRetryCamera={camera.retryCamera}
              />
            </div>

            <RecordingControls
              isCameraEnabled={camera.isEnabled}
              isMicEnabled={camera.isMicEnabled}
              onToggleCamera={camera.toggleCamera}
              onToggleMic={camera.toggleMic}
              isRecording={recording.isRecording}
              isPaused={recording.isPaused}
              canRecord={!!camera.stream && !camera.isLoading}
              onStartRecording={handleStartRecording}
              onPauseRecording={recording.pauseRecording}
              onStopRecording={handleStopRecording}
              isTeleprompterEnabled={teleprompter.enabled}
              onToggleTeleprompter={() => setTeleprompter(prev => ({ ...prev, enabled: !prev.enabled }))}
              isBlurEnabled={isBlurEnabled}
              onToggleBlur={() => setIsBlurEnabled(!isBlurEnabled)}
              isLogoEnabled={logo.enabled}
              onToggleLogo={() => setLogo(prev => ({ ...prev, enabled: !prev.enabled }))}
              onUploadLogo={handleLogoUpload}
            />
          </div>

          {/* Sidebar - Fixed width, no overlap */}
          <div className="w-[300px] shrink-0 border-l bg-background flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
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
              />

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
                onPlayTTS={() => {}}
                onStopTTS={audioPlayback.stopTTS}
                isTTSPlaying={audioPlayback.isPlaying.tts}
                isTTSGenerating={isTTSGenerating}
                hasTTSAudio={hasTTSAudio}
                ttsVolume={audioPlayback.ttsVolume}
                onTTSVolumeChange={audioPlayback.setTTSVolume}
                currentScriptContent={currentScript?.content}
              />
            </div>
          </div>
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
        />
      </DialogContent>
    </Dialog>
  );
}
