/**
 * Audio Panel Component - Voiceover, TTS, Music tabs with export features
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Play, Square, Repeat, Volume2, Download, FileText, Mic } from 'lucide-react';
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
  
  currentScriptContent?: string;
  onTranscribe?: () => void;
  isTranscribing?: boolean;
  transcriptionText?: string;
}

const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'nova', label: 'Nova' },
  { value: 'shimmer', label: 'Shimmer' },
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

  // Export audio helper
  const handleExportAudio = (url: string, name: string, format: 'mp3' | 'wav' = 'mp3') => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.${format}`;
    a.click();
  };

  return (
    <div className="bg-card rounded-lg border p-3">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as AudioTabType)}>
        <TabsList className="w-full grid grid-cols-3 h-9 mb-3 bg-muted p-1">
          <TabsTrigger value="voiceover" className="text-xs gap-1 data-[state=active]:bg-background">
            <Mic className="w-3 h-3" />
            <span>Voice</span>
          </TabsTrigger>
          <TabsTrigger value="tts" className="text-xs gap-1 data-[state=active]:bg-background">
            <Volume2 className="w-3 h-3" />
            <span>TTS</span>
          </TabsTrigger>
          <TabsTrigger value="music" className="text-xs gap-1 data-[state=active]:bg-background">
            🎵 <span>Music</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voiceover" className="space-y-2 mt-0">
          <Select 
            value={selectedVoiceoverId || "none"} 
            onValueChange={(v) => onVoiceoverChange(v === "none" ? "" : v)}
          >
            <SelectTrigger className="bg-background h-8 text-xs">
              <SelectValue>
                {selectedVoiceover?.name || (voiceovers.length > 0 ? "Select voiceover" : "No voiceovers")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-md z-[9999]">
              <SelectItem value="none">None</SelectItem>
              {voiceovers.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={!selectedVoiceoverId}
              onClick={isVoiceoverPlaying ? onStopVoiceover : onPlayVoiceover}
              className="gap-1 h-7 text-xs flex-1"
            >
              {isVoiceoverPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isVoiceoverPlaying ? 'Stop' : 'Play'}
            </Button>
            {selectedVoiceover && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={() => handleExportAudio(selectedVoiceover.url, selectedVoiceover.name)}
                title="Download audio"
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-3 h-3 text-muted-foreground shrink-0" />
            <Slider
              value={[voiceoverVolume]}
              onValueChange={([v]) => onVoiceoverVolumeChange(v)}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{voiceoverVolume}%</span>
          </div>

          {onTranscribe && (
            <Button
              size="sm"
              variant="outline"
              onClick={onTranscribe}
              disabled={isTranscribing || !selectedVoiceoverId}
              className="w-full gap-1 h-7 text-xs"
            >
              <FileText className="w-3 h-3" />
              {isTranscribing ? 'Transcribing...' : 'Transcribe'}
            </Button>
          )}
          
          {transcriptionText && (
            <div className="p-2 bg-muted/50 rounded text-xs max-h-16 overflow-y-auto">
              {transcriptionText}
            </div>
          )}
        </TabsContent>

        {/* TTS Tab */}
        <TabsContent value="tts" className="space-y-2 mt-0">
          {currentScriptContent && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTTSTextChange(currentScriptContent)}
              className="w-full gap-1 h-7 text-xs"
            >
              📝 Use Script
            </Button>
          )}

          <Textarea
            value={ttsText}
            onChange={(e) => onTTSTextChange(e.target.value)}
            placeholder="Enter text..."
            className="min-h-[60px] text-xs"
          />

          <Select value={selectedVoice} onValueChange={onVoiceChange}>
            <SelectTrigger className="bg-background h-8 text-xs">
              <SelectValue>
                {VOICE_OPTIONS.find(v => v.value === selectedVoice)?.label || "Select voice"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-md z-[9999]">
              {VOICE_OPTIONS.map((v) => (
                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={onGenerateTTS}
              disabled={!ttsText || isTTSGenerating}
              className="gap-1 h-7 text-xs flex-1"
            >
              {isTTSGenerating ? '⏳...' : '🔊 Generate'}
            </Button>
            
            {hasTTSAudio && (
              <Button
                size="sm"
                variant="outline"
                onClick={isTTSPlaying ? onStopTTS : onPlayTTS}
                className="gap-1 h-7 text-xs"
              >
                {isTTSPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-3 h-3 text-muted-foreground shrink-0" />
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

        <TabsContent value="music" className="space-y-2 mt-0">
          <Select 
            value={selectedMusicId || "none"} 
            onValueChange={(v) => onMusicChange(v === "none" ? "" : v)}
          >
            <SelectTrigger className="bg-background h-8 text-xs">
              <SelectValue>
                {selectedMusic?.name || (musicList.length > 0 ? "Select music" : "No music")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-md z-[9999]">
              <SelectItem value="none">None</SelectItem>
              {musicList.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={!selectedMusicId}
              onClick={isMusicPlaying ? onStopMusic : onPlayMusic}
              className="gap-1 h-7 text-xs flex-1"
            >
              {isMusicPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isMusicPlaying ? 'Stop' : 'Play'}
            </Button>
            
            <Button
              size="sm"
              variant={musicLoop ? 'default' : 'outline'}
              onClick={onToggleMusicLoop}
              className="h-7 px-2"
              title="Loop"
            >
              <Repeat className="w-3 h-3" />
            </Button>

            {selectedMusic && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={() => handleExportAudio(selectedMusic.url, selectedMusic.name)}
                title="Download"
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-3 h-3 text-muted-foreground shrink-0" />
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
