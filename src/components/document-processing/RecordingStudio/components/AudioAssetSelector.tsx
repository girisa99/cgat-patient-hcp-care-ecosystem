/**
 * Audio Asset Selector - Simplified panel for Recording Studio
 * Only selects and plays pre-existing assets from GenieStudio
 * NO generation - just selection and playback
 */

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Play, Square, Repeat, Volume2, Download, Mic, Music, VolumeX } from 'lucide-react';
import type { VoiceoverData, MusicData, AudioTabType } from '../types';
import { 
  isInstrumental, 
  isTTSFile, 
  filterActualVoiceovers, 
  filterTTSFiles,
  filterInstrumentalFiles 
} from '@/components/genie-studio/AudioFileFilters';

interface AudioAssetSelectorProps {
  activeTab: AudioTabType;
  onTabChange: (tab: AudioTabType) => void;
  
  // Voiceover (recorded voice files)
  voiceovers: VoiceoverData[];
  selectedVoiceoverId: string;
  onVoiceoverChange: (id: string) => void;
  onPlayVoiceover: () => void;
  onStopVoiceover: () => void;
  isVoiceoverPlaying: boolean;
  voiceoverVolume: number;
  onVoiceoverVolumeChange: (volume: number) => void;
  
  // Music (instrumental/background music)
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
  
  // TTS (pre-generated TTS files from GenieStudio)
  ttsFiles: VoiceoverData[];
  selectedTTSFileId: string;
  onTTSFileChange: (id: string) => void;
  onPlayTTS: () => void;
  onStopTTS: () => void;
  isTTSPlaying: boolean;
  ttsVolume: number;
  onTTSVolumeChange: (volume: number) => void;
  
  // Ducking controls
  duckingEnabled?: boolean;
  onToggleDucking?: () => void;
}

export function AudioAssetSelector({
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
  ttsFiles,
  selectedTTSFileId,
  onTTSFileChange,
  onPlayTTS,
  onStopTTS,
  isTTSPlaying,
  ttsVolume,
  onTTSVolumeChange,
  duckingEnabled = true,
  onToggleDucking,
}: AudioAssetSelectorProps) {
  
  const selectedVoiceover = voiceovers.find(v => v.id === selectedVoiceoverId);
  const selectedMusic = musicList.find(m => m.id === selectedMusicId);
  const selectedTTSFile = ttsFiles.find(f => f.id === selectedTTSFileId);

  // Use shared filter functions for consistent categorization
  const voiceoverDataForFiltering = voiceovers.map(v => ({
    id: v.id,
    name: v.name,
    url: v.url,
    scriptText: v.scriptText || undefined,
    scriptType: v.scriptType as any,
    metadataType: v.metadataType || undefined
  }));
  
  // Filter using shared functions
  const actualTTSFiles = filterTTSFiles(voiceoverDataForFiltering);
  const actualVoiceovers = filterActualVoiceovers(voiceoverDataForFiltering);
  const instrumentalFiles = filterInstrumentalFiles(voiceoverDataForFiltering);
  
  // Combine musicList prop with instrumental files
  const actualMusic = [
    ...musicList,
    ...instrumentalFiles
      .filter(v => !musicList.some(m => m.id === v.id))
      .map(v => ({ id: v.id, name: v.name, url: v.url || '' }))
  ];

  // Debug logging
  useEffect(() => {
    console.log('[AudioAssetSelector] File classification:', {
      totalVoiceovers: voiceovers.length,
      actualVoiceovers: actualVoiceovers.length,
      actualTTSFiles: actualTTSFiles.length,
      instrumentalFiles: instrumentalFiles.length,
      actualMusic: actualMusic.length,
      voiceovers: voiceovers.map(v => ({ 
        name: v.name, 
        scriptType: v.scriptType, 
        metadataType: v.metadataType,
        isTTS: isTTSFile({ id: v.id, name: v.name, scriptType: v.scriptType as any, metadataType: v.metadataType })
      })),
    });
  }, [voiceovers, musicList]);

  // Download helper
  const handleDownload = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.mp3`;
    a.click();
  };

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Tab Header */}
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
          Voiceover
          {actualVoiceovers.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{actualVoiceovers.length}</Badge>
          )}
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
          {actualTTSFiles.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{actualTTSFiles.length}</Badge>
          )}
        </button>
        <button
          onClick={() => onTabChange('music')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'music' 
              ? 'bg-background text-foreground border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          Music
          {actualMusic.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{actualMusic.length}</Badge>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-3">
        {/* Voiceover Tab - Selection only */}
        {activeTab === 'voiceover' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Select Voiceover ({actualVoiceovers.length})
              </Label>
              <Select 
                value={selectedVoiceoverId || "none"} 
                onValueChange={(v) => onVoiceoverChange(v === "none" ? "" : v)}
              >
                <SelectTrigger className="bg-background h-9 text-sm">
                  <SelectValue placeholder="Select voiceover file">
                    {selectedVoiceover?.name || "Select voiceover file"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md z-[9999] max-h-[200px]">
                  <SelectItem value="none">None</SelectItem>
                  {actualVoiceovers.length > 0 ? (
                    actualVoiceovers.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center gap-2">
                          <Mic className="w-3 h-3 text-muted-foreground" />
                          {v.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      No voiceover files - create in GenieStudio
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

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
                  onClick={() => handleDownload(selectedVoiceover.url, selectedVoiceover.name)}
                  title="Download"
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

            {actualVoiceovers.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Record voiceovers in GenieStudio Scripts tab
              </p>
            )}
          </div>
        )}

        {/* TTS Tab - Selection only (no generation) */}
        {activeTab === 'tts' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Select TTS File ({actualTTSFiles.length})
              </Label>
              <Select 
                value={selectedTTSFileId || "none"} 
                onValueChange={(v) => onTTSFileChange(v === "none" ? "" : v)}
              >
                <SelectTrigger className="bg-background h-9 text-sm">
                  <SelectValue placeholder="Select TTS file">
                    {selectedTTSFile?.name || "Select TTS file"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md z-[9999] max-h-[200px]">
                  <SelectItem value="none">None</SelectItem>
                  {actualTTSFiles.length > 0 ? (
                    actualTTSFiles.map((file) => (
                      <SelectItem key={file.id} value={file.id}>
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-3 h-3 text-muted-foreground" />
                          {file.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      No TTS files - generate in GenieStudio
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedTTSFileId}
                onClick={isTTSPlaying ? onStopTTS : onPlayTTS}
                className="gap-1.5 h-8 flex-1"
              >
                {isTTSPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isTTSPlaying ? 'Stop' : 'Play'}
              </Button>
              {selectedTTSFile && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3"
                  onClick={() => handleDownload(selectedTTSFile.url, selectedTTSFile.name)}
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
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

            {actualTTSFiles.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Generate TTS audio in GenieStudio Scripts tab
              </p>
            )}
          </div>
        )}

        {/* Music Tab - Selection only */}
        {activeTab === 'music' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Select Music ({actualMusic.length})
              </Label>
              <Select 
                value={selectedMusicId || "none"} 
                onValueChange={(v) => onMusicChange(v === "none" ? "" : v)}
              >
                <SelectTrigger className="bg-background h-9 text-sm">
                  <SelectValue placeholder="Select music file">
                    {selectedMusic?.name || "Select music file"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md z-[9999] max-h-[200px]">
                  <SelectItem value="none">None</SelectItem>
                  {actualMusic.length > 0 ? (
                    actualMusic.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2">
                          <Music className="w-3 h-3 text-muted-foreground" />
                          {m.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      No music files - generate in GenieStudio
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

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
              {selectedMusic && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3"
                  onClick={() => handleDownload(selectedMusic.url, selectedMusic.name)}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={musicLoop}
                  onChange={onToggleMusicLoop}
                  id="music-loop-selector"
                  className="rounded"
                />
                <label htmlFor="music-loop-selector" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  Loop
                </label>
              </div>
              
              {/* Ducking control */}
              {onToggleDucking && (
                <div className="flex items-center gap-2">
                  <label htmlFor="ducking-toggle" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
                    <VolumeX className="w-3 h-3" />
                    Duck
                  </label>
                  <Switch
                    id="ducking-toggle"
                    checked={duckingEnabled}
                    onCheckedChange={onToggleDucking}
                    className="h-4 w-7"
                  />
                </div>
              )}
            </div>

            {actualMusic.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Generate music in GenieStudio Music tab
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
