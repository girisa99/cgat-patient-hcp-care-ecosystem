/**
 * Audio Panel Component - Voiceover, TTS, Music tabs with export features
 * TTS with ElevenLabs/OpenAI provider selection and download
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Play, Square, Repeat, Volume2, Download, FileText, Mic, Loader2 } from 'lucide-react';
import type { VoiceoverData, MusicData, AudioTabType } from '../types';

interface AudioPanelProps {
  activeTab: AudioTabType;
  onTabChange: (tab: AudioTabType) => void;
  
  // Voiceover
  voiceovers: VoiceoverData[];
  selectedVoiceoverId: string;
  onVoiceoverChange: (id: string) => void;
  onPlayVoiceover: () => void;
  onStopVoiceover: () => void;
  isVoiceoverPlaying: boolean;
  voiceoverVolume: number;
  onVoiceoverVolumeChange: (volume: number) => void;
  
  // Music
  musicList: MusicData[];
  selectedMusicId: string;
  onMusicChange: (id: string) => void;
  onPlayMusic: () => void;
  onStopMusic: () => void;
  isMusicPlaying: boolean;
  musicVolume: number;
  onMusicVolumeChange: (volume: number) => void;
  musicLoop: boolean;
  onToggleMusicLoop: () => void;
  
  // TTS
  ttsText: string;
  onTTSTextChange: (text: string) => void;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  onGenerateTTS: () => void;
  onPlayTTS: () => void;
  onStopTTS: () => void;
  isTTSPlaying: boolean;
  isTTSGenerating: boolean;
  hasTTSAudio: boolean;
  ttsVolume: number;
  onTTSVolumeChange: (volume: number) => void;
  
  // TTS Download - new props
  ttsAudioUrl?: string | null;
  onDownloadTTS?: () => void;
  
  // Provider selection
  ttsProvider?: 'openai' | 'elevenlabs';
  onTTSProviderChange?: (provider: 'openai' | 'elevenlabs') => void;
  
  currentScriptContent?: string;
  onTranscribe?: () => void;
  isTranscribing?: boolean;
  transcriptionText?: string;
}

const OPENAI_VOICES = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'nova', label: 'Nova' },
  { value: 'shimmer', label: 'Shimmer' },
];

const ELEVENLABS_VOICES = [
  { value: 'CwhRBWXzGAHq8TQ4Fs17', label: 'Roger' },
  { value: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah' },
  { value: 'FGY2WhTYpPnrIDTdsKH5', label: 'Laura' },
  { value: 'IKne3meq5aSn9XLyUdCD', label: 'Charlie' },
  { value: 'JBFqnCBsd6RMkjVDRZzb', label: 'George' },
  { value: 'onwK4e9ZLuTAKqWW03F9', label: 'Daniel' },
  { value: 'pFZP5JQG7iQjIQuC4Bku', label: 'Lily' },
];

export function AudioPanel({
  activeTab,
  onTabChange,
  voiceovers,
  selectedVoiceoverId,
  onVoiceoverChange,
  onPlayVoiceover,
  onStopVoiceover,
  isVoiceoverPlaying,
  voiceoverVolume,
  onVoiceoverVolumeChange,
  musicList,
  selectedMusicId,
  onMusicChange,
  onPlayMusic,
  onStopMusic,
  isMusicPlaying,
  musicVolume,
  onMusicVolumeChange,
  musicLoop,
  onToggleMusicLoop,
  ttsText,
  onTTSTextChange,
  selectedVoice,
  onVoiceChange,
  onGenerateTTS,
  onPlayTTS,
  onStopTTS,
  isTTSPlaying,
  isTTSGenerating,
  hasTTSAudio,
  ttsVolume,
  onTTSVolumeChange,
  ttsAudioUrl,
  onDownloadTTS,
  ttsProvider = 'openai',
  onTTSProviderChange,
  currentScriptContent,
  onTranscribe,
  isTranscribing,
  transcriptionText,
}: AudioPanelProps) {
  const selectedVoiceover = voiceovers.find(v => v.id === selectedVoiceoverId);
  const selectedMusic = musicList.find(m => m.id === selectedMusicId);

  const voiceOptions = ttsProvider === 'elevenlabs' ? ELEVENLABS_VOICES : OPENAI_VOICES;

  // Export audio helper
  const handleExportAudio = (url: string, name: string, format: 'mp3' | 'wav' = 'mp3') => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.${format}`;
    a.click();
  };

  // Download TTS audio
  const handleDownloadTTS = () => {
    if (ttsAudioUrl) {
      const a = document.createElement('a');
      a.href = ttsAudioUrl;
      a.download = `tts-audio-${Date.now()}.mp3`;
      a.click();
    } else if (onDownloadTTS) {
      onDownloadTTS();
    }
  };

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Custom Tab Header */}
      <div className="flex border-b bg-muted/30">
        <button
          onClick={() => onTabChange('voiceover')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'voiceover' 
              ? 'bg-background text-foreground border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          Voice
        </button>
        <button
          onClick={() => onTabChange('tts')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'tts' 
              ? 'bg-background text-foreground border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          TTS
        </button>
        <button
          onClick={() => onTabChange('music')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'music' 
              ? 'bg-background text-foreground border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          🎵 Music
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-3">
        {/* Voiceover Tab */}
        {activeTab === 'voiceover' && (
          <div className="space-y-3">
            <Select 
              value={selectedVoiceoverId || "none"} 
              onValueChange={(v) => onVoiceoverChange(v === "none" ? "" : v)}
            >
              <SelectTrigger className="bg-background h-9 text-sm">
                <SelectValue placeholder="Select voiceover">
                  {selectedVoiceover?.name || "Select voiceover"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {voiceovers.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedVoiceoverId}
                onClick={isVoiceoverPlaying ? onStopVoiceover : onPlayVoiceover}
                className="gap-1.5 h-8 flex-1"
              >
                {isVoiceoverPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isVoiceoverPlaying ? 'Stop' : 'Play'}
              </Button>
              {selectedVoiceover && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3"
                  onClick={() => handleExportAudio(selectedVoiceover.url, selectedVoiceover.name)}
                  title="Download audio"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <Slider
                value={[voiceoverVolume]}
                onValueChange={([v]) => onVoiceoverVolumeChange(v)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-9 text-right">{voiceoverVolume}%</span>
            </div>

            {onTranscribe && (
              <Button
                size="sm"
                variant="outline"
                onClick={onTranscribe}
                disabled={isTranscribing || !selectedVoiceoverId}
                className="w-full gap-1.5 h-8"
              >
                <FileText className="w-3.5 h-3.5" />
                {isTranscribing ? 'Transcribing...' : 'Transcribe'}
              </Button>
            )}
            
            {transcriptionText && (
              <div className="p-2.5 bg-muted/50 rounded-md text-xs max-h-20 overflow-y-auto">
                {transcriptionText}
              </div>
            )}
          </div>
        )}

        {/* TTS Tab */}
        {activeTab === 'tts' && (
          <div className="space-y-3">
            {/* Provider Selection */}
            {onTTSProviderChange && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Provider</Label>
                <RadioGroup 
                  value={ttsProvider} 
                  onValueChange={(v) => onTTSProviderChange(v as 'openai' | 'elevenlabs')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="openai" id="openai" className="h-3.5 w-3.5" />
                    <Label htmlFor="openai" className="text-xs cursor-pointer">OpenAI</Label>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="elevenlabs" id="elevenlabs" className="h-3.5 w-3.5" />
                    <Label htmlFor="elevenlabs" className="text-xs cursor-pointer">ElevenLabs</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentScriptContent && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTTSTextChange(currentScriptContent)}
                className="w-full gap-1.5 h-8"
              >
                📝 Use Script
              </Button>
            )}

            <Textarea
              value={ttsText}
              onChange={(e) => onTTSTextChange(e.target.value)}
              placeholder="Enter text for TTS..."
              className="min-h-[70px] text-sm resize-none"
            />

            <Select value={selectedVoice} onValueChange={onVoiceChange}>
              <SelectTrigger className="bg-background h-9 text-sm">
                <SelectValue placeholder="Select voice">
                  {voiceOptions.find(v => v.value === selectedVoice)?.label || "Select voice"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map((v) => (
                  <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onGenerateTTS}
                disabled={!ttsText || isTTSGenerating}
                className="gap-1.5 h-8 flex-1"
              >
                {isTTSGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    🔊 Generate
                  </>
                )}
              </Button>
              
              {hasTTSAudio && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={isTTSPlaying ? onStopTTS : onPlayTTS}
                    className="h-8 px-3"
                  >
                    {isTTSPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadTTS}
                    className="h-8 px-3"
                    title="Download TTS audio"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <Slider
                value={[ttsVolume]}
                onValueChange={([v]) => onTTSVolumeChange(v)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-9 text-right">{ttsVolume}%</span>
            </div>
          </div>
        )}

        {/* Music Tab */}
        {activeTab === 'music' && (
          <div className="space-y-3">
            <Select 
              value={selectedMusicId || "none"} 
              onValueChange={(v) => onMusicChange(v === "none" ? "" : v)}
            >
              <SelectTrigger className="bg-background h-9 text-sm">
                <SelectValue placeholder="Select music">
                  {selectedMusic?.name || "Select instrumental/music"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {musicList.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedMusicId}
                onClick={isMusicPlaying ? onStopMusic : onPlayMusic}
                className="gap-1.5 h-8 flex-1"
              >
                {isMusicPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isMusicPlaying ? 'Stop' : 'Play'}
              </Button>
              
              <Button
                size="sm"
                variant={musicLoop ? 'default' : 'outline'}
                onClick={onToggleMusicLoop}
                className="h-8 px-3"
                title="Loop"
              >
                <Repeat className="w-3.5 h-3.5" />
              </Button>

              {selectedMusic && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3"
                  onClick={() => handleExportAudio(selectedMusic.url, selectedMusic.name)}
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <Slider
                value={[musicVolume]}
                onValueChange={([v]) => onMusicVolumeChange(v)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-9 text-right">{musicVolume}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
