/**
 * Audio Panel Component - Voiceover, TTS, Music tabs
 * Proper separation: Voiceover = recorded voice files, Music = instrumental/background
 * TTS = generated audio with download options (MP3/WAV)
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Square, Repeat, Volume2, Download, FileText, Mic, Loader2, Music, Trash2 } from 'lucide-react';
import type { VoiceoverData, MusicData, AudioTabType } from '../types';

interface GeneratedTTSFile {
  id: string;
  name: string;
  provider: 'openai' | 'elevenlabs';
  voice: string;
  url: string;
  createdAt: Date;
  duration?: number;
}

interface AudioPanelProps {
  activeTab: AudioTabType;
  onTabChange: (tab: AudioTabType) => void;
  
  // Voiceover (recorded voice files only)
  voiceovers: VoiceoverData[];
  selectedVoiceoverId: string;
  onVoiceoverChange: (id: string) => void;
  onPlayVoiceover: () => void;
  onStopVoiceover: () => void;
  isVoiceoverPlaying: boolean;
  voiceoverVolume: number;
  onVoiceoverVolumeChange: (volume: number) => void;
  
  // Music (instrumental/background music only)
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
  
  // TTS Download
  ttsAudioUrl?: string | null;
  onDownloadTTS?: () => void;
  
  // Provider selection
  ttsProvider?: 'openai' | 'elevenlabs';
  onTTSProviderChange?: (provider: 'openai' | 'elevenlabs') => void;
  
  currentScriptContent?: string;
  cleanScriptContent?: string; // Clean version for TTS
  onTranscribe?: () => void;
  isTranscribing?: boolean;
  transcriptionText?: string;
}

const OPENAI_VOICES = [
  { value: 'alloy', label: 'Alloy', description: 'Neutral, balanced' },
  { value: 'echo', label: 'Echo', description: 'Warm, conversational' },
  { value: 'fable', label: 'Fable', description: 'Expressive, British' },
  { value: 'onyx', label: 'Onyx', description: 'Deep, authoritative' },
  { value: 'nova', label: 'Nova', description: 'Energetic, friendly' },
  { value: 'shimmer', label: 'Shimmer', description: 'Clear, professional' },
];

const ELEVENLABS_VOICES = [
  { value: 'CwhRBWXzGAHq8TQ4Fs17', label: 'Roger', description: 'Male, American' },
  { value: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah', description: 'Female, American' },
  { value: 'FGY2WhTYpPnrIDTdsKH5', label: 'Laura', description: 'Female, American' },
  { value: 'IKne3meq5aSn9XLyUdCD', label: 'Charlie', description: 'Male, British' },
  { value: 'JBFqnCBsd6RMkjVDRZzb', label: 'George', description: 'Male, British' },
  { value: 'onwK4e9ZLuTAKqWW03F9', label: 'Daniel', description: 'Male, British' },
  { value: 'pFZP5JQG7iQjIQuC4Bku', label: 'Lily', description: 'Female, British' },
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
  cleanScriptContent,
  onTranscribe,
  isTranscribing,
  transcriptionText,
}: AudioPanelProps) {
  const selectedVoiceover = voiceovers.find(v => v.id === selectedVoiceoverId);
  const selectedMusic = musicList.find(m => m.id === selectedMusicId);
  
  // Local state for generated TTS files
  const [generatedTTSFiles, setGeneratedTTSFiles] = useState<GeneratedTTSFile[]>([]);
  const [selectedTTSFileId, setSelectedTTSFileId] = useState<string>('');
  const [downloadFormat, setDownloadFormat] = useState<'mp3' | 'wav'>('mp3');

  const voiceOptions = ttsProvider === 'elevenlabs' ? ELEVENLABS_VOICES : OPENAI_VOICES;

  // FILTER voiceovers - only show files that are actual voiceovers (have scriptText or no scriptType, exclude TTS and instrumental)
  const actualVoiceovers = voiceovers.filter(v => {
    // If has scriptType, must be 'voiceover' or 'narration'
    if (v.scriptType) {
      return v.scriptType === 'voiceover' || v.scriptType === 'narration';
    }
    // If name suggests instrumental/music, exclude
    const lowerName = v.name.toLowerCase();
    if (lowerName.includes('instrumental') || lowerName.includes('music') || lowerName.includes('bgm') || lowerName.includes('background')) {
      return false;
    }
    // If it has script text, it's a voiceover
    return !!v.scriptText || true; // Default to showing if unclear
  });

  // FILTER TTS files - files that are specifically TTS generated
  const ttsFiles = voiceovers.filter(v => {
    if (v.scriptType === 'tts') return true;
    const lowerName = v.name.toLowerCase();
    return lowerName.includes('tts') || lowerName.includes('generated');
  });

  // FILTER music - use musicList prop (already separated) PLUS any instrumental from voiceovers
  const instrumentalFromVoiceovers = voiceovers.filter(v => {
    const lowerName = v.name.toLowerCase();
    return lowerName.includes('instrumental') || lowerName.includes('music') || lowerName.includes('bgm') || lowerName.includes('background') || v.scriptType === 'instrumental';
  });
  
  // Combine musicList with instrumental files from voiceovers
  const actualMusic = [
    ...musicList,
    ...instrumentalFromVoiceovers.map(v => ({
      id: v.id,
      name: v.name,
      url: v.url
    }))
  ];

  // Handle TTS generation and add to files list
  const handleGenerateAndSave = () => {
    onGenerateTTS();
    
    // Simulate adding to generated files (in real implementation, this would come from API response)
    if (ttsText) {
      const newFile: GeneratedTTSFile = {
        id: `tts-${Date.now()}`,
        name: `TTS ${new Date().toLocaleTimeString()}`,
        provider: ttsProvider,
        voice: voiceOptions.find(v => v.value === selectedVoice)?.label || selectedVoice,
        url: ttsAudioUrl || '',
        createdAt: new Date(),
      };
      setGeneratedTTSFiles(prev => [newFile, ...prev]);
    }
  };

  // Download TTS audio
  const handleDownloadTTS = (format: 'mp3' | 'wav') => {
    if (ttsAudioUrl) {
      const a = document.createElement('a');
      a.href = ttsAudioUrl;
      a.download = `tts-${ttsProvider}-${selectedVoice}-${Date.now()}.${format}`;
      a.click();
    } else if (onDownloadTTS) {
      onDownloadTTS();
    }
  };

  // Download voiceover/music
  const handleExportAudio = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.mp3`;
    a.click();
  };

  // Delete generated TTS file
  const handleDeleteTTSFile = (id: string) => {
    setGeneratedTTSFiles(prev => prev.filter(f => f.id !== id));
    if (selectedTTSFileId === id) {
      setSelectedTTSFileId('');
    }
  };

  // Debug logging
  console.log('[AudioPanel] Total voiceovers prop:', voiceovers.length, voiceovers.map(v => ({ name: v.name, scriptType: v.scriptType })));
  console.log('[AudioPanel] Filtered actualVoiceovers:', actualVoiceovers.length);
  console.log('[AudioPanel] Filtered ttsFiles:', ttsFiles.length);
  console.log('[AudioPanel] Total musicList prop:', musicList.length);
  console.log('[AudioPanel] Filtered actualMusic:', actualMusic.length);

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
          {ttsFiles.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{ttsFiles.length}</Badge>
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
        {/* Voiceover Tab */}
        {activeTab === 'voiceover' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Recorded Voiceovers ({actualVoiceovers.length})
              </Label>
              <Select 
                value={selectedVoiceoverId || "none"} 
                onValueChange={(v) => onVoiceoverChange(v === "none" ? "" : v)}
              >
                <SelectTrigger className="bg-background h-9 text-sm">
                  <SelectValue placeholder="Select voiceover">
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
                      No voiceover files available
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
                  onClick={() => handleExportAudio(selectedVoiceover.url, selectedVoiceover.name)}
                  title="Download voiceover"
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
                {isTranscribing ? 'Transcribing...' : 'Transcribe to Text'}
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
            {/* Existing TTS Files */}
            {ttsFiles.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Existing TTS Files ({ttsFiles.length})
                </Label>
                <Select
                  value={selectedTTSFileId || "none"}
                  onValueChange={(v) => setSelectedTTSFileId(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="bg-background h-9 text-sm">
                    <SelectValue placeholder="Select existing TTS file">
                      {ttsFiles.find(f => f.id === selectedTTSFileId)?.name || "Select existing TTS file"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border shadow-md z-[9999] max-h-[200px]">
                    <SelectItem value="none">None</SelectItem>
                    {ttsFiles.map((file) => (
                      <SelectItem key={file.id} value={file.id}>
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-3 h-3 text-muted-foreground" />
                          {file.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTTSFileId && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        const file = ttsFiles.find(f => f.id === selectedTTSFileId);
                        if (file) {
                          // Set the audio URL and play using the passed-in handler
                          const audio = new Audio(file.url);
                          audio.play();
                        }
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        const file = ttsFiles.find(f => f.id === selectedTTSFileId);
                        if (file) handleExportAudio(file.url, file.name);
                      }}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            )}

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

            {/* Use Script Buttons */}
            <div className="flex gap-1">
              {currentScriptContent && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTTSTextChange(currentScriptContent)}
                  className="flex-1 gap-1.5 h-8 text-xs"
                >
                  📝 Use Original
                </Button>
              )}
              {cleanScriptContent && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onTTSTextChange(cleanScriptContent)}
                  className="flex-1 gap-1.5 h-8 text-xs"
                  title="Clean version without pauses/breaks"
                >
                  ✨ Use Enhanced
                </Button>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Text to Speech</Label>
                <span className="text-[10px] text-muted-foreground">
                  {ttsText.split(/\s+/).filter(w => w).length} words
                </span>
              </div>
              <Textarea
                value={ttsText}
                onChange={(e) => onTTSTextChange(e.target.value)}
                placeholder="Enter or paste text for TTS generation..."
                className="min-h-[80px] text-sm resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Voice</Label>
              <Select value={selectedVoice} onValueChange={onVoiceChange}>
                <SelectTrigger className="bg-background h-9 text-sm">
                  <SelectValue placeholder="Select voice">
                    {voiceOptions.find(v => v.value === selectedVoice)?.label || "Select voice"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md z-[9999]">
                  {voiceOptions.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      <div className="flex items-center gap-2">
                        <span>{v.label}</span>
                        <span className="text-muted-foreground text-[10px]">{v.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleGenerateAndSave}
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={isTTSPlaying ? onStopTTS : onPlayTTS}
                  className="h-8 px-3"
                >
                  {isTTSPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
              )}
            </div>

            {/* Download Options */}
            {hasTTSAudio && (
              <div className="flex gap-1 p-2 bg-muted/30 rounded-md">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadTTS('mp3')}
                  className="flex-1 gap-1 text-xs h-7"
                >
                  <Download className="w-3 h-3" />
                  MP3
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadTTS('wav')}
                  className="flex-1 gap-1 text-xs h-7"
                >
                  <Download className="w-3 h-3" />
                  WAV
                </Button>
              </div>
            )}

            {/* Generated TTS Files */}
            {generatedTTSFiles.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Generated Files</Label>
                <ScrollArea className="max-h-24">
                  <div className="space-y-1">
                    {generatedTTSFiles.map((file) => (
                      <div 
                        key={file.id}
                        className={`flex items-center justify-between p-1.5 rounded text-xs border ${
                          selectedTTSFileId === file.id ? 'bg-primary/10 border-primary' : 'bg-muted/30'
                        }`}
                      >
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedTTSFileId(file.id)}
                        >
                          <div className="font-medium">{file.name}</div>
                          <div className="text-muted-foreground text-[10px]">
                            {file.provider} • {file.voice}
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5"
                            onClick={() => handleDownloadTTS('mp3')}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5"
                            onClick={() => handleDeleteTTSFile(file.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

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
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Instrumental / Background Music ({actualMusic.length})
              </Label>
              <Select 
                value={selectedMusicId || "none"} 
                onValueChange={(v) => onMusicChange(v === "none" ? "" : v)}
              >
                <SelectTrigger className="bg-background h-9 text-sm">
                  <SelectValue placeholder="Select music">
                    {selectedMusic?.name || "Select instrumental/music"}
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
                      No music files available
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
