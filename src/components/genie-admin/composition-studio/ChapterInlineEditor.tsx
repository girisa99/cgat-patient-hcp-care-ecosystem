/**
 * CHAPTER INLINE EDITOR
 * 
 * Provides quick edit controls for each chapter:
 * - Voice replace (TTS with different voice)
 * - Add captions (auto-generate)
 * - Regenerate visual
 * - Adjust audio levels
 * - Add/remove music
 * 
 * Uses useStudioEcosystem for all backend operations
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mic, Music, Type, RefreshCcw, Volume2, Sparkles,
  Wand2, Loader2, ChevronRight, Settings2, Scissors
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { StudioChapter, InlineEditAction } from './useStudioEcosystem';
import type { ProactiveEditSuggestion } from '@/services/proactivePipelineEditorService';

interface ChapterInlineEditorProps {
  chapter: StudioChapter;
  onUpdate: (updates: Partial<StudioChapter>) => void;
  executeInlineEdit: (
    chapter: StudioChapter,
    action: InlineEditAction,
    params?: Record<string, unknown>
  ) => Promise<Partial<StudioChapter['generatedContent']>>;
  getEditSuggestions: (chapter: StudioChapter) => ProactiveEditSuggestion[];
  primaryLanguage: string;
  className?: string;
}

// Voice options for TTS
const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy (Neutral)', provider: 'openai' },
  { value: 'nova', label: 'Nova (Female)', provider: 'openai' },
  { value: 'onyx', label: 'Onyx (Male)', provider: 'openai' },
  { value: 'shimmer', label: 'Shimmer (Female)', provider: 'openai' },
  { value: 'echo', label: 'Echo (Male)', provider: 'openai' },
];

export const ChapterInlineEditor: React.FC<ChapterInlineEditorProps> = ({
  chapter,
  onUpdate,
  executeInlineEdit,
  getEditSuggestions,
  primaryLanguage,
  className,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<InlineEditAction | null>(null);
  const [voiceVolume, setVoiceVolume] = useState(100);
  const [musicVolume, setMusicVolume] = useState(30);
  const [selectedVoice, setSelectedVoice] = useState('alloy');

  // Get AI suggestions for this chapter
  const suggestions = chapter.status === 'complete' 
    ? getEditSuggestions(chapter) 
    : [];

  const handleAction = async (action: InlineEditAction, params?: Record<string, unknown>) => {
    if (!chapter.generatedContent && action !== 'regenerate_visual') {
      toast.error('Generate content first before editing');
      return;
    }

    setIsProcessing(true);
    setCurrentAction(action);

    try {
      const result = await executeInlineEdit(chapter, action, params);
      
      // Update chapter with new content
      onUpdate({
        generatedContent: {
          ...chapter.generatedContent,
          ...result,
        }
      });
      
      toast.success(`${action.replace(/_/g, ' ')} completed!`);
    } catch (error) {
      console.error('[InlineEditor] Error:', error);
      toast.error(`Failed to ${action.replace(/_/g, ' ')}`);
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };

  const isActionLoading = (action: InlineEditAction) => 
    isProcessing && currentAction === action;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 p-2 bg-muted/30 rounded-lg border", className)}>
      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        {/* Voice Replace */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              disabled={isProcessing || chapter.status !== 'complete'}
            >
              {isActionLoading('voice_replace') ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Mic className="w-3 h-3 mr-1" />
              )}
              Voice
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <Label className="text-xs font-medium">Replace Voice</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map(v => (
                    <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => handleAction('voice_replace', { 
                  voiceId: selectedVoice,
                  languageCode: primaryLanguage 
                })}
                disabled={isProcessing}
              >
                {isActionLoading('voice_replace') ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : null}
                Regenerate Voice
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Add Captions */}
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={isProcessing || chapter.status !== 'complete'}
          onClick={() => handleAction('add_captions', { languageCode: primaryLanguage })}
        >
          {isActionLoading('add_captions') ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Type className="w-3 h-3 mr-1" />
          )}
          Captions
        </Button>

        {/* Regenerate Visual */}
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={isProcessing}
          onClick={() => handleAction('regenerate_visual')}
        >
          {isActionLoading('regenerate_visual') ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <RefreshCcw className="w-3 h-3 mr-1" />
          )}
          Regen Visual
        </Button>

        {/* Add/Mix Music */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              disabled={isProcessing || chapter.status !== 'complete'}
            >
              {isActionLoading('add_music') || isActionLoading('adjust_audio') ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Music className="w-3 h-3 mr-1" />
              )}
              Music
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-4">
              <Label className="text-xs font-medium">Audio Mixer</Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> Voice</span>
                  <span>{voiceVolume}%</span>
                </div>
                <Slider
                  value={[voiceVolume]}
                  onValueChange={([v]) => setVoiceVolume(v)}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1"><Music className="w-3 h-3" /> Music</span>
                  <span>{musicVolume}%</span>
                </div>
                <Slider
                  value={[musicVolume]}
                  onValueChange={([v]) => setMusicVolume(v)}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleAction('add_music')}
                  disabled={isProcessing}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Music
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleAction('adjust_audio', { 
                    voiceVolume: voiceVolume / 100, 
                    musicVolume: musicVolume / 100 
                  })}
                  disabled={isProcessing}
                >
                  <Volume2 className="w-3 h-3 mr-1" />
                  Apply Mix
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex items-center gap-1">
          <Wand2 className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">AI suggests:</span>
          {suggestions.slice(0, 2).map((suggestion, i) => (
            <Badge 
              key={i}
              variant="secondary"
              className="text-[10px] cursor-pointer hover:bg-primary/20"
              onClick={() => suggestion.triggerAction()}
            >
              {suggestion.pipelineName}
              <ChevronRight className="w-2 h-2 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {/* Status indicator */}
      {chapter.generatedContent?.captionsUrl && (
        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600">
          <Type className="w-2 h-2 mr-1" /> Captions
        </Badge>
      )}
    </div>
  );
};

export default ChapterInlineEditor;
