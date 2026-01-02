/**
 * Audio Panel Component - Voiceover, TTS, Music tabs
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Play, Square, Repeat, Volume2 } from 'lucide-react';
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
}: AudioPanelProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as AudioTabType)}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="voiceover">🎙️ Voiceover</TabsTrigger>
          <TabsTrigger value="tts">🔊 TTS</TabsTrigger>
          <TabsTrigger value="music">🎵 Music</TabsTrigger>
        </TabsList>

        {/* Voiceover Tab */}
        <TabsContent value="voiceover" className="space-y-3 mt-4">
          <Select value={selectedVoiceoverId} onValueChange={onVoiceoverChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select voiceover" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
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
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[voiceoverVolume]}
              onValueChange={([v]) => onVoiceoverVolumeChange(v)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{voiceoverVolume}%</span>
          </div>
        </TabsContent>

        {/* TTS Tab */}
        <TabsContent value="tts" className="space-y-3 mt-4">
          {currentScriptContent && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTTSTextChange(currentScriptContent)}
              className="w-full"
            >
              📝 Use Current Script
            </Button>
          )}

          <Textarea
            value={ttsText}
            onChange={(e) => onTTSTextChange(e.target.value)}
            placeholder="Enter text to convert to speech..."
            className="min-h-[100px]"
          />

          <Select value={selectedVoice} onValueChange={onVoiceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
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
              {isTTSGenerating ? '⏳ Generating...' : '🔊 Generate TTS'}
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
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[ttsVolume]}
              onValueChange={([v]) => onTTSVolumeChange(v)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{ttsVolume}%</span>
          </div>
        </TabsContent>

        {/* Music Tab */}
        <TabsContent value="music" className="space-y-3 mt-4">
          <Select value={selectedMusicId} onValueChange={onMusicChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select music" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
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
              Loop: {musicLoop ? 'ON' : 'OFF'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[musicVolume]}
              onValueChange={([v]) => onMusicVolumeChange(v)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{musicVolume}%</span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
