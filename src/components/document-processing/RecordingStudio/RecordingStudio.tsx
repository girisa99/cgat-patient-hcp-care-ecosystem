/**
 * Fullscreen Recording Studio - Main Component
 * Replaces the problematic popout with a reliable React modal
 */

import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Library } from 'lucide-react';
import { toast } from 'sonner';

import { useCamera, useRecording, useAudioPlayback, useRecordingLibrary } from './hooks';
import { VideoPreview, RecordingControls, AudioPanel, ScriptPanel, RecordingLibraryPanel } from './components';
import type { RecordingStudioProps, LogoState, TeleprompterState } from './types';

export function RecordingStudio({
  isOpen,
  onClose,
  scripts,
  voiceovers,
  music,
  selectedScriptId: initialScriptId = '',
  selectedVoiceoverId: initialVoiceoverId = '',
  selectedMusicId: initialMusicId = '',
}: RecordingStudioProps) {
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
  
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const camera = useCamera({ autoStart: isOpen });
  const library = useRecordingLibrary();
  const audioPlayback = useAudioPlayback();
  
  const recording = useRecording(camera.stream, {
    onRecordingComplete: async (blob, duration) => {
      const script = scripts.find(s => s.id === selectedScriptId);
      await library.saveRecording(blob, {
        name: `Recording ${new Date().toLocaleString()}`,
        duration,
        scriptTitle: script?.title,
        hasVoiceover: !!selectedVoiceoverId,
        hasMusic: !!selectedMusicId,
      });
      toast.success('Recording saved to library!');
      
      // Also download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  // Get current script content
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

  const handleGenerateTTS = useCallback(async () => {
    if (!ttsText) return;
    setIsTTSGenerating(true);
    // TTS generation would go here - placeholder for now
    toast.info('TTS generation coming soon');
    setIsTTSGenerating(false);
  }, [ttsText]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Hidden file input */}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoFileChange}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            🎬 Recording Studio
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => library.setIsOpen(true)}
              className="gap-2"
            >
              <Library className="w-4 h-4" />
              Library ({library.recordings.length})
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Video Section - Left */}
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
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
            />

            <RecordingControls
              isCameraEnabled={camera.isEnabled}
              isMicEnabled={camera.isMicEnabled}
              onToggleCamera={camera.toggleCamera}
              onToggleMic={camera.toggleMic}
              isRecording={recording.isRecording}
              isPaused={recording.isPaused}
              canRecord={!!camera.stream && !camera.isLoading}
              onStartRecording={recording.startRecording}
              onPauseRecording={recording.pauseRecording}
              onStopRecording={recording.stopRecording}
              isTeleprompterEnabled={teleprompter.enabled}
              onToggleTeleprompter={() => setTeleprompter(prev => ({ ...prev, enabled: !prev.enabled }))}
              isBlurEnabled={isBlurEnabled}
              onToggleBlur={() => setIsBlurEnabled(!isBlurEnabled)}
              isLogoEnabled={logo.enabled}
              onToggleLogo={() => setLogo(prev => ({ ...prev, enabled: !prev.enabled }))}
              onUploadLogo={handleLogoUpload}
            />
          </div>

          {/* Sidebar - Right */}
          <div className="w-[320px] border-l bg-muted/20 p-4 space-y-4 overflow-y-auto">
            <ScriptPanel
              scripts={scripts}
              selectedScriptId={selectedScriptId}
              onScriptChange={setSelectedScriptId}
              scrollSpeed={teleprompter.scrollSpeed}
              onScrollSpeedChange={(speed) => setTeleprompter(prev => ({ ...prev, scrollSpeed: speed }))}
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
      </DialogContent>
    </Dialog>
  );
}
