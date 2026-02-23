/**
 * TTS Options Panel - Text-to-Speech generation options
 * Includes provider/voice selection, script selection for TTS, version toggle, and TTS result
 * Extracted from ScriptEditorTab.tsx
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Video,
  Mic,
  Sparkles,
  Volume2,
  Play,
  Download,
  Save,
  Check,
  Loader2,
  FileText,
  Wand2,
} from 'lucide-react';
import type { SavedScript, ScriptStats } from './types';

interface TTSResult {
  audioUrl: string;
  audioBlob?: Blob;
  duration: number;
  provider: string;
  charactersProcessed: number;
}

interface TTSOptionsPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ttsProvider: 'openai' | 'elevenlabs' | 'google';
  onProviderChange: (provider: 'openai' | 'elevenlabs' | 'google') => void;
  ttsVoice: string;
  onVoiceChange: (voice: string) => void;
  isTTSGenerating: boolean;
  currentContent: string;
  onGenerateTTS: () => void;
  ttsResult: TTSResult | null;
  onPlay: () => void;
  onDownload: () => void;
  onSaveAsVoiceover: () => void;
  // Script selection for TTS
  savedScripts: SavedScript[];
  selectedTTSScriptId: string | null;
  selectedScriptId: string | null;
  onTTSScriptSelect: (scriptId: string) => void;
  // Version selection
  enhancedContent: string | null;
  activeVersion: 'original' | 'enhanced';
  onVersionChange: (version: 'original' | 'enhanced') => void;
  originalStats: ScriptStats | null;
  enhancedStats: ScriptStats | null;
  stats: ScriptStats;
  // Voice lists
  openaiVoices: Array<{ value: string; label: string; description?: string }>;
  elevenlabsVoices: Array<{ value: string; label: string; description?: string }>;
  googleVoices: Array<{ value: string; label: string; description?: string }>;
}

export function TTSOptionsPanel({
  isOpen,
  onOpenChange,
  ttsProvider,
  onProviderChange,
  ttsVoice,
  onVoiceChange,
  isTTSGenerating,
  currentContent,
  onGenerateTTS,
  ttsResult,
  onPlay,
  onDownload,
  onSaveAsVoiceover,
  savedScripts,
  selectedTTSScriptId,
  selectedScriptId,
  onTTSScriptSelect,
  enhancedContent,
  activeVersion,
  onVersionChange,
  originalStats,
  enhancedStats,
  stats,
  openaiVoices,
  elevenlabsVoices,
  googleVoices,
}: TTSOptionsPanelProps) {
  const videoScripts = savedScripts.filter(s => s.type === 'video');
  const audioScripts = savedScripts.filter(s => s.type === 'audio');

  const voices = ttsProvider === 'openai'
    ? openaiVoices
    : ttsProvider === 'google'
      ? googleVoices
      : elevenlabsVoices;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleContent className="mb-6 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-green-500" />
            TTS Generation Options
          </h3>
        </div>

        {/* Script Selection for TTS */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <Label className="text-xs font-medium mb-2 block">Select Script for TTS</Label>
          <Select
            value={selectedTTSScriptId || selectedScriptId || ''}
            onValueChange={onTTSScriptSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a script..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {savedScripts.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No scripts saved yet. Create one above!
                </div>
              ) : (
                <>
                  {videoScripts.length > 0 && (
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                      Video Scripts
                    </div>
                  )}
                  {videoScripts.map(script => (
                    <SelectItem key={script.id} value={script.id}>
                      <div className="flex items-center gap-2 w-full">
                        <Video className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{script.name}</span>
                        <div className="flex items-center gap-1 ml-auto shrink-0">
                          {script.enhancedContent && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 bg-purple-500/10 text-purple-600 border-purple-500/30">
                              Enhanced
                            </Badge>
                          )}
                          {script.hasVoiceover && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-500/10 text-green-600 border-green-500/30">
                              <Volume2 className="h-2.5 w-2.5" />
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {script.stats?.wordCount || (script.content?.split(/\s+/).length ?? 0)}w
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  {audioScripts.length > 0 && (
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 mt-1">
                      Audio Scripts
                    </div>
                  )}
                  {audioScripts.map(script => (
                    <SelectItem key={script.id} value={script.id}>
                      <div className="flex items-center gap-2 w-full">
                        <Mic className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">{script.name}</span>
                        <div className="flex items-center gap-1 ml-auto shrink-0">
                          {script.enhancedContent && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 bg-purple-500/10 text-purple-600 border-purple-500/30">
                              Enhanced
                            </Badge>
                          )}
                          {script.hasVoiceover && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-500/10 text-green-600 border-green-500/30">
                              <Volume2 className="h-2.5 w-2.5" />
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {script.stats?.wordCount || (script.content?.split(/\s+/).length ?? 0)}w
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          {(selectedTTSScriptId || selectedScriptId) && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {(() => {
                const script = savedScripts.find(s => s.id === (selectedTTSScriptId || selectedScriptId));
                if (!script) return null;
                const wordCount = script.stats?.wordCount || (script.content?.split(/\s+/).length ?? 0);
                const speakingMin = Math.ceil(wordCount / 130);
                return `${wordCount} words • ~${speakingMin} min speaking time${script.enhancedContent ? ' • Enhanced version available' : ''}`;
              })()}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Provider</Label>
            <Select value={ttsProvider} onValueChange={(v: 'openai' | 'elevenlabs' | 'google') => onProviderChange(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elevenlabs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-gradient-to-br from-purple-500 to-pink-500" />
                    ElevenLabs (Premium)
                  </div>
                </SelectItem>
                <SelectItem value="openai">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-gradient-to-br from-green-600 to-teal-500" />
                    OpenAI (Standard)
                  </div>
                </SelectItem>
                <SelectItem value="google">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-gradient-to-br from-blue-500 to-green-500" />
                    Google Cloud (Neural)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">
              {ttsProvider === 'elevenlabs' && 'Best quality, expressive voices'}
              {ttsProvider === 'openai' && 'Fast, natural-sounding'}
              {ttsProvider === 'google' && 'Multi-language, neural voices'}
            </p>
          </div>
          <div>
            <Label>Voice</Label>
            <Select value={ttsVoice} onValueChange={onVoiceChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[250px]">
                {voices.map(voice => (
                  <SelectItem key={voice.value} value={voice.value}>
                    <div className="flex items-center justify-between gap-3">
                      <span>{voice.label}</span>
                      <span className="text-[10px] text-muted-foreground">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={onGenerateTTS}
              disabled={isTTSGenerating || !currentContent.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              {isTTSGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate TTS
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Version Selection for TTS */}
        {enhancedContent && (
          <div className="mb-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <Label className="text-xs font-medium mb-2 block">Generate TTS from:</Label>
            <div className="flex gap-2">
              <Button
                variant={activeVersion === 'original' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onVersionChange('original')}
                className={activeVersion === 'original' ? '' : 'border-border/50'}
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Original ({originalStats?.wordCount || stats.wordCount} words)
              </Button>
              <Button
                variant={activeVersion === 'enhanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onVersionChange('enhanced')}
                className={activeVersion === 'enhanced' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500/30 text-purple-600'}
              >
                <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                Enhanced ({enhancedStats?.wordCount || 0} words)
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Enhanced version includes improved pacing and natural pauses for better voiceover delivery
            </p>
          </div>
        )}

        {/* TTS Result */}
        {ttsResult && (
          <div className="p-4 rounded-lg bg-background border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                TTS Ready
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onPlay}>
                  <Play className="h-4 w-4 mr-1" />
                  Play
                </Button>
                <Button variant="outline" size="sm" onClick={onDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" onClick={onSaveAsVoiceover}>
                  <Save className="h-4 w-4 mr-1" />
                  Save to Voice Tab
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2">{ttsResult.duration.toFixed(1)}s</span>
              </div>
              <div>
                <span className="text-muted-foreground">Provider:</span>
                <span className="ml-2 capitalize">{ttsResult.provider}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Characters:</span>
                <span className="ml-2">{ttsResult.charactersProcessed}</span>
              </div>
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
