/**
 * CHAPTER REGENERATION PANEL
 * 
 * Allows selective regeneration of specific elements within a chapter:
 * - Voice/TTS only
 * - Avatar only
 * - Animation/Video only
 * - Full chapter
 * 
 * Saves tokens by not regenerating everything
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  RefreshCw, Mic2, User, Video, Sparkles, Box,
  Play, Loader2, Check, AlertCircle, Wand2,
  Volume2, Languages, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { CompositionChapter } from './types';

export type RegenerationTarget = 
  | 'full' 
  | 'voice_only' 
  | 'visual_only' 
  | 'script_only' 
  | 'avatar_only'
  | 'animation_only'
  | 'translation_only';

interface RegenerationOption {
  id: RegenerationTarget;
  label: string;
  description: string;
  icon: React.ReactNode;
  tokenCost: 'low' | 'medium' | 'high';
  availableFor: string[];
}

const REGENERATION_OPTIONS: RegenerationOption[] = [
  {
    id: 'voice_only',
    label: 'Voice/TTS Only',
    description: 'Regenerate just the voiceover audio with new TTS settings',
    icon: <Mic2 className="w-4 h-4" />,
    tokenCost: 'low',
    availableFor: ['avatar', 'video', 'animation', 'screen_recording', 'static']
  },
  {
    id: 'script_only',
    label: 'Script Only',
    description: 'Rewrite the script content without regenerating media',
    icon: <FileText className="w-4 h-4" />,
    tokenCost: 'low',
    availableFor: ['avatar', 'video', 'animation', 'screen_recording', 'static', '3d']
  },
  {
    id: 'translation_only',
    label: 'Translation Only',
    description: 'Translate script to additional languages without regenerating',
    icon: <Languages className="w-4 h-4" />,
    tokenCost: 'low',
    availableFor: ['avatar', 'video', 'animation', 'screen_recording', 'static', '3d']
  },
  {
    id: 'avatar_only',
    label: 'Avatar Only',
    description: 'Regenerate avatar appearance/animation, keep script & voice',
    icon: <User className="w-4 h-4" />,
    tokenCost: 'medium',
    availableFor: ['avatar']
  },
  {
    id: 'animation_only',
    label: 'Animation Only',
    description: 'Regenerate animation/motion graphics, keep audio',
    icon: <Sparkles className="w-4 h-4" />,
    tokenCost: 'medium',
    availableFor: ['animation', '3d']
  },
  {
    id: 'visual_only',
    label: 'Visual Only',
    description: 'Regenerate video/visual content, keep audio track',
    icon: <Video className="w-4 h-4" />,
    tokenCost: 'medium',
    availableFor: ['video', '3d', 'animation']
  },
  {
    id: 'full',
    label: 'Full Regeneration',
    description: 'Regenerate everything from scratch',
    icon: <RefreshCw className="w-4 h-4" />,
    tokenCost: 'high',
    availableFor: ['avatar', 'video', 'animation', 'screen_recording', 'static', '3d', 'custom']
  },
];

interface ChapterRegenerationPanelProps {
  chapter: CompositionChapter;
  language: string;
  onRegenerate: (target: RegenerationTarget, options: RegenerationOptions) => Promise<void>;
  isRegenerating?: boolean;
  progress?: number;
}

export interface RegenerationOptions {
  target: RegenerationTarget;
  newScript?: string;
  newVoiceProvider?: string;
  newVoiceId?: string;
  targetLanguages?: string[];
  preserveAudio?: boolean;
  preserveVisual?: boolean;
}

const TOKEN_COST_COLORS: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  high: 'bg-red-500/10 text-red-600 border-red-500/30',
};

export const ChapterRegenerationPanel: React.FC<ChapterRegenerationPanelProps> = ({
  chapter,
  language,
  onRegenerate,
  isRegenerating = false,
  progress = 0,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<RegenerationTarget>('voice_only');
  const [editedScript, setEditedScript] = useState(chapter.voiceover?.text || '');
  const [voiceProvider, setVoiceProvider] = useState(chapter.voiceover?.voiceProvider || 'elevenlabs');
  const [targetLanguages, setTargetLanguages] = useState<string[]>([language]);
  const [preserveAudio, setPreserveAudio] = useState(true);

  // Filter options based on chapter visual type
  const availableOptions = REGENERATION_OPTIONS.filter(
    opt => opt.availableFor.includes(chapter.visual?.type || 'video')
  );

  const handleRegenerate = async () => {
    const options: RegenerationOptions = {
      target: selectedTarget,
      newScript: editedScript !== chapter.voiceover?.text ? editedScript : undefined,
      newVoiceProvider: voiceProvider,
      targetLanguages,
      preserveAudio: selectedTarget === 'visual_only',
      preserveVisual: selectedTarget === 'voice_only' || selectedTarget === 'script_only',
    };

    try {
      await onRegenerate(selectedTarget, options);
      toast.success(`${selectedTarget.replace(/_/g, ' ')} regenerated successfully!`);
    } catch (error) {
      toast.error(`Regeneration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const selectedOption = availableOptions.find(o => o.id === selectedTarget);

  return (
    <Card className="border-dashed border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" />
              Selective Regeneration
            </CardTitle>
            <CardDescription>
              Save tokens by regenerating only what you need
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn(
            "text-xs",
            selectedOption ? TOKEN_COST_COLORS[selectedOption.tokenCost] : ''
          )}>
            {selectedOption?.tokenCost} token cost
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Regeneration Target Selection */}
        <div className="space-y-2">
          <Label>What to Regenerate</Label>
          <div className="grid grid-cols-2 gap-2">
            {availableOptions.map((option) => (
              <Button
                key={option.id}
                variant={selectedTarget === option.id ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "justify-start gap-2 h-auto py-2.5",
                  selectedTarget === option.id && "ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => setSelectedTarget(option.id)}
                disabled={isRegenerating}
              >
                {option.icon}
                <div className="text-left">
                  <div className="text-xs font-medium">{option.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Contextual Options based on target */}
        {(selectedTarget === 'voice_only' || selectedTarget === 'script_only') && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Edit Script (optional)</Label>
              <Textarea
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
                placeholder="Edit the voiceover script..."
                rows={4}
                disabled={isRegenerating}
              />
              <p className="text-xs text-muted-foreground">
                Leave unchanged to keep current script, or edit to generate new voiceover
              </p>
            </div>
            
            {selectedTarget === 'voice_only' && (
              <div className="space-y-2">
                <Label>Voice Provider</Label>
              <Select
                value={voiceProvider}
                onValueChange={(v) => setVoiceProvider(v as 'elevenlabs' | 'azure' | 'alibaba' | 'google')}
                disabled={isRegenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elevenlabs">ElevenLabs (Premium)</SelectItem>
                    <SelectItem value="azure">Azure Neural TTS</SelectItem>
                    <SelectItem value="alibaba">Alibaba CosyVoice (CJK)</SelectItem>
                    <SelectItem value="google">Google Cloud TTS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {selectedTarget === 'translation_only' && (
          <div className="space-y-2">
            <Label>Target Languages</Label>
            <div className="flex flex-wrap gap-2">
              {['ar', 'hi', 'zh', 'ja', 'es', 'fr', 'de', 'pt'].map((lang) => (
                <Badge
                  key={lang}
                  variant={targetLanguages.includes(lang) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    if (targetLanguages.includes(lang)) {
                      setTargetLanguages(prev => prev.filter(l => l !== lang));
                    } else {
                      setTargetLanguages(prev => [...prev, lang]);
                    }
                  }}
                >
                  {lang.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedTarget === 'visual_only' && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <Label>Preserve Audio Track</Label>
              <p className="text-xs text-muted-foreground">
                Keep current voiceover, only update video/visuals
              </p>
            </div>
            <Switch
              checked={preserveAudio}
              onCheckedChange={setPreserveAudio}
              disabled={isRegenerating}
            />
          </div>
        )}

        {/* Progress & Action */}
        {isRegenerating && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-center text-muted-foreground">
              Regenerating {selectedTarget.replace(/_/g, ' ')}... {progress}%
            </p>
          </div>
        )}

        <Button 
          className="w-full gap-2" 
          onClick={handleRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Regenerate {selectedOption?.label}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChapterRegenerationPanel;
