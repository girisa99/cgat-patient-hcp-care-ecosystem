/**
 * Audio Panel Component - Voiceover, TTS, Music tabs with full features
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Play, Square, Repeat, Volume2, Scissors, Mic, FileText } from 'lucide-react';
import type { VoiceoverData, MusicData, AudioTabType } from '../types';

interface AudioPanelProps {
  // Tab state
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
  
  // Script helper
  currentScriptContent?: string;
  
  // Transcription
  onTranscribe?: () => void;
  isTranscribing?: boolean;
  transcriptionText?: string;
}

const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy (Neutral)' },
  { value: 'echo', label: 'Echo (Male)' },
  { value: 'fable', label: 'Fable (British)' },
  { value: 'onyx', label: 'Onyx (Deep Male)' },
  { value: 'nova', label: 'Nova (Female)' },
  { value: 'shimmer', label: 'Shimmer (Soft Female)' },
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
  currentScriptContent,
  onTranscribe,
  isTranscribing,
  transcriptionText,
}: AudioPanelProps) {
  const selectedVoiceover = voiceovers.find(v => v.id === selectedVoiceoverId);
  const selectedMusic = musicList.find(m => m.id === selectedMusicId);

  return (
    <div className="bg-card rounded-lg border p-4">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as AudioTabType)}>
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="voiceover" className="text-xs gap-1">
            <Mic className="w-3 h-3" />
            Voiceover
          </TabsTrigger>
          <TabsTrigger value="tts" className="text-xs gap-1">
            <Volume2 className="w-3 h-3" />
            TTS
          </TabsTrigger>
          <TabsTrigger value="music" className="text-xs gap-1">
            🎵 Music
          </TabsTrigger>
        </TabsList>

        {/* Voiceover Tab */}
        <TabsContent value="voiceover" className="space-y-3 mt-0">
          <Select 
            value={selectedVoiceoverId || "none"} 
            onValueChange={(v) => onVoiceoverChange(v === "none" ? "" : v)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select voiceover">
                {selectedVoiceover?.name || "None"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover z-[100]">
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
              className="gap-2"
            >
              {isVoiceoverPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isVoiceoverPlaying ? 'Stop' : 'Play'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              value={[voiceoverVolume]}
              onValueChange={([v]) => onVoiceoverVolumeChange(v)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10 text-right">{voiceoverVolume}%</span>
          </div>

          {/* Transcription */}
          {onTranscribe && (
            <div className="pt-2 border-t space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onTranscribe}
                disabled={isTranscribing || !selectedVoiceoverId}
                className="w-full gap-2"
              >
                <FileText className="w-4 h-4" />
                {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
              </Button>
              {transcriptionText && (
                <div className="p-2 bg-muted/50 rounded text-xs max-h-20 overflow-y-auto">
                  {transcriptionText}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* TTS Tab */}
        <TabsContent value="tts" className="space-y-3 mt-0">
          {currentScriptContent && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTTSTextChange(currentScriptContent)}
              className="w-full gap-2"
            >
              📝 Use Current Script
            </Button>
          )}

          <Textarea
            value={ttsText}
            onChange={(e) => onTTSTextChange(e.target.value)}
            placeholder="Enter text to convert to speech..."
            className="min-h-[80px] text-sm"
          />

          <Select value={selectedVoice} onValueChange={onVoiceChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-[100]">
              {VOICE_OPTIONS.map((v) => (
                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onGenerateTTS}
              disabled={!ttsText || isTTSGenerating}
              className="gap-2"
            >
              {isTTSGenerating ? '⏳ Generating...' : '🔊 Generate'}
            </Button>
            
            {hasTTSAudio && (
              <Button
                size="sm"
                variant="outline"
                onClick={isTTSPlaying ? onStopTTS : onPlayTTS}
                className="gap-2"
              >
                {isTTSPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isTTSPlaying ? 'Stop' : 'Play'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              value={[ttsVolume]}
              onValueChange={([v]) => onTTSVolumeChange(v)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10 text-right">{ttsVolume}%</span>
          </div>
        </TabsContent>

        {/* Music Tab */}
        <TabsContent value="music" className="space-y-3 mt-0">
          <Select 
            value={selectedMusicId || "none"} 
            onValueChange={(v) => onMusicChange(v === "none" ? "" : v)}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select music">
                {selectedMusic?.name || "None"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover z-[100]">
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
              className="gap-2"
            >
              {isMusicPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isMusicPlaying ? 'Stop' : 'Play'}
            </Button>
            
            <Button
              size="sm"
              variant={musicLoop ? 'default' : 'outline'}
              onClick={onToggleMusicLoop}
              className="gap-2"
            >
              <Repeat className="w-4 h-4" />
              {musicLoop ? 'ON' : 'OFF'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              value={[musicVolume]}
              onValueChange={([v]) => onMusicVolumeChange(v)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10 text-right">{musicVolume}%</span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
