/**
 * CHAPTER REGENERATION PANEL
 * 
 * Comprehensive regeneration for all 206 ecosystem pipelines:
 * - Script & Text (Spark)
 * - Voice & Audio (Mind)
 * - Video & Visual (Vibe)
 * - Avatar & 3D (Vibe/Deck)
 * - Presentation (Deck)
 * - Distribution (Cast)
 * 
 * Saves tokens by selective regeneration
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
  Volume2, Languages, FileText, Image, Presentation,
  Music, Share2, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { CompositionChapter } from './types';

// Full ecosystem regeneration targets covering all 206 pipelines
export type RegenerationTarget = 
  // Script & Text
  | 'full' 
  | 'script_only' 
  | 'translation_only'
  // Voice & Audio
  | 'voice_only' 
  | 'tts_only'
  | 'music_only'
  | 'sfx_only'
  | 'dubbing_only'
  // Visual & Video
  | 'visual_only' 
  | 'video_only'
  | 'image_only'
  | 'animation_only'
  // Avatar & Character
  | 'avatar_only'
  | 'lipsync_only'
  // 3D & Immersive
  | '3d_only'
  | 'vr_scene_only'
  // Presentation
  | 'ppt_only'
  | 'slides_only'
  // Distribution
  | 'thumbnail_only'
  | 'social_format_only';

interface RegenerationOption {
  id: RegenerationTarget;
  label: string;
  description: string;
  icon: React.ReactNode;
  tokenCost: 'low' | 'medium' | 'high' | 'premium';
  availableFor: string[];
  pipelineCategory: string;
  edgeFunction: string;
}

// Complete regeneration options for all major pipeline categories
const REGENERATION_OPTIONS: RegenerationOption[] = [
  // === SCRIPT & TEXT (Spark) ===
  {
    id: 'script_only',
    label: 'Script Only',
    description: 'Rewrite script content without regenerating media',
    icon: <FileText className="w-4 h-4" />,
    tokenCost: 'low',
    availableFor: ['avatar', 'video', 'animation', 'screen_recording', 'static', '3d', 'ppt', 'podcast', 'reel'],
    pipelineCategory: 'script-generation',
    edgeFunction: 'ai-universal-processor'
  },
  {
    id: 'translation_only',
    label: 'Translation Only',
    description: 'Translate script to additional languages',
    icon: <Languages className="w-4 h-4" />,
    tokenCost: 'low',
    availableFor: ['avatar', 'video', 'animation', 'screen_recording', 'static', '3d', 'ppt', 'podcast'],
    pipelineCategory: 'translation',
    edgeFunction: 'translation-service'
  },
  
  // === VOICE & AUDIO (Mind) ===
  {
    id: 'voice_only',
    label: 'Voice/TTS Only',
    description: 'Regenerate voiceover with new TTS settings',
    icon: <Mic2 className="w-4 h-4" />,
    tokenCost: 'low',
    availableFor: ['avatar', 'video', 'animation', 'screen_recording', 'static', 'podcast', 'reel'],
    pipelineCategory: 'tts-generation',
    edgeFunction: 'elevenlabs-voice'
  },
  {
    id: 'tts_only',
    label: 'Regional TTS',
    description: 'Use regional voice (Arabic, Hindi, CJK)',
    icon: <Volume2 className="w-4 h-4" />,
    tokenCost: 'medium',
    availableFor: ['avatar', 'video', 'animation', 'podcast'],
    pipelineCategory: 'tts-generation',
    edgeFunction: 'multi-language-audio-orchestrator'
  },
  {
    id: 'music_only',
    label: 'Background Music',
    description: 'Generate or replace background music',
    icon: <Music className="w-4 h-4" />,
    tokenCost: 'medium',
    availableFor: ['video', 'animation', 'podcast', 'reel', 'avatar'],
    pipelineCategory: 'music-generation',
    edgeFunction: 'multi-provider-music'
  },
  {
    id: 'sfx_only',
    label: 'Sound Effects',
    description: 'Add or regenerate sound effects',
    icon: <Volume2 className="w-4 h-4" />,
    tokenCost: 'low',
    availableFor: ['video', 'animation', 'podcast', 'reel', 'avatar'],
    pipelineCategory: 'audio-production',
    edgeFunction: 'multi-provider-sfx'
  },
  {
    id: 'dubbing_only',
    label: 'Dubbing/Localization',
    description: 'Dub to another language with lip-sync',
    icon: <Languages className="w-4 h-4" />,
    tokenCost: 'premium',
    availableFor: ['avatar', 'video'],
    pipelineCategory: 'dubbing',
    edgeFunction: 'multi-language-audio-orchestrator'
  },

  // === VIDEO & VISUAL (Vibe) ===
  {
    id: 'video_only',
    label: 'Video Generation',
    description: 'Regenerate video content from script',
    icon: <Video className="w-4 h-4" />,
    tokenCost: 'high',
    availableFor: ['video', 'reel', 'shorts', 'animation'],
    pipelineCategory: 'video-generation',
    edgeFunction: 'ai-video-generator'
  },
  {
    id: 'visual_only',
    label: 'Visual Effects',
    description: 'Update video/visual effects, keep audio',
    icon: <Sparkles className="w-4 h-4" />,
    tokenCost: 'medium',
    availableFor: ['video', '3d', 'animation'],
    pipelineCategory: 'video-editing',
    edgeFunction: 'pipeline-editor-processor'
  },
  {
    id: 'image_only',
    label: 'Image Generation',
    description: 'Regenerate static images and thumbnails',
    icon: <Image className="w-4 h-4" />,
    tokenCost: 'low',
    availableFor: ['static', 'ppt', 'thumbnail', 'social', 'infographic'],
    pipelineCategory: 'visual-design',
    edgeFunction: 'ai-image-generator'
  },
  {
    id: 'animation_only',
    label: 'Animation/Motion',
    description: 'Regenerate motion graphics, keep audio',
    icon: <Layers className="w-4 h-4" />,
    tokenCost: 'medium',
    availableFor: ['animation', '3d', 'kinetic_text', 'video'],
    pipelineCategory: 'video-generation',
    edgeFunction: 'ai-video-generator'
  },

  // === AVATAR & CHARACTER (Vibe) ===
  {
    id: 'avatar_only',
    label: 'Avatar Regeneration',
    description: 'Regenerate avatar appearance/animation',
    icon: <User className="w-4 h-4" />,
    tokenCost: 'high',
    availableFor: ['avatar', 'talking_head'],
    pipelineCategory: 'avatar-lipsync',
    edgeFunction: 'ai-video-generator'
  },
  {
    id: 'lipsync_only',
    label: 'Lip-Sync Adjustment',
    description: 'Re-sync avatar lips to audio track',
    icon: <User className="w-4 h-4" />,
    tokenCost: 'medium',
    availableFor: ['avatar', 'talking_head', 'dubbed', 'video'],
    pipelineCategory: 'avatar-lipsync',
    edgeFunction: 'ai-video-generator'
  },

  // === 3D & IMMERSIVE (Deck) ===
  {
    id: '3d_only',
    label: '3D Model/Scene',
    description: 'Regenerate 3D objects and environments',
    icon: <Box className="w-4 h-4" />,
    tokenCost: 'premium',
    availableFor: ['3d', 'product_showcase', 'vr'],
    pipelineCategory: '3d-immersive',
    edgeFunction: 'modelslab-media'
  },
  {
    id: 'vr_scene_only',
    label: 'VR/360° Scene',
    description: 'Regenerate immersive VR environment',
    icon: <Box className="w-4 h-4" />,
    tokenCost: 'premium',
    availableFor: ['vr', '360_video', 'immersive'],
    pipelineCategory: '3d-immersive',
    edgeFunction: 'modelslab-media'
  },

  // === PRESENTATION (Deck) ===
  {
    id: 'ppt_only',
    label: 'PPT/Slides',
    description: 'Regenerate presentation slides',
    icon: <Presentation className="w-4 h-4" />,
    tokenCost: 'medium',
    availableFor: ['ppt', 'slides', 'deck', 'static'],
    pipelineCategory: 'presentation',
    edgeFunction: 'share-presentation'
  },
  {
    id: 'slides_only',
    label: 'Slide Visuals',
    description: 'Update slide backgrounds and graphics',
    icon: <Sparkles className="w-4 h-4" />,
    tokenCost: 'low',
    availableFor: ['ppt', 'slides', 'deck'],
    pipelineCategory: 'visual-design',
    edgeFunction: 'ai-image-generator'
  },

  // === DISTRIBUTION (Cast) ===
  {
    id: 'thumbnail_only',
    label: 'Thumbnail Generation',
    description: 'Create platform-optimized thumbnails',
    icon: <Image className="w-4 h-4" />,
    tokenCost: 'low',
    availableFor: ['video', 'podcast', 'ppt', 'social', 'reel', 'avatar'],
    pipelineCategory: 'distribution',
    edgeFunction: 'ai-image-generator'
  },
  {
    id: 'social_format_only',
    label: 'Social Format',
    description: 'Resize/reformat for social platforms',
    icon: <Share2 className="w-4 h-4" />,
    tokenCost: 'low',
    availableFor: ['video', 'reel', 'shorts', 'story', 'static'],
    pipelineCategory: 'distribution',
    edgeFunction: 'pipeline-editor-processor'
  },

  // === FULL REGENERATION ===
  {
    id: 'full',
    label: 'Full Regeneration',
    description: 'Regenerate everything from scratch',
    icon: <RefreshCw className="w-4 h-4" />,
    tokenCost: 'high',
    availableFor: ['avatar', 'video', 'animation', 'screen_recording', 'static', '3d', 'ppt', 'custom', 'podcast', 'reel', 'vr'],
    pipelineCategory: 'video-generation',
    edgeFunction: 'ai-universal-processor'
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
  pipelineCategory?: string;
  edgeFunction?: string;
}

const TOKEN_COST_COLORS: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  premium: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
};

// Group regeneration options by category for UI tabs
const REGENERATION_CATEGORIES = {
  'Script & Text': ['script_only', 'translation_only'],
  'Voice & Audio': ['voice_only', 'tts_only', 'music_only', 'sfx_only', 'dubbing_only'],
  'Video & Visual': ['video_only', 'visual_only', 'image_only', 'animation_only'],
  'Avatar & 3D': ['avatar_only', 'lipsync_only', '3d_only', 'vr_scene_only'],
  'Presentation': ['ppt_only', 'slides_only'],
  'Distribution': ['thumbnail_only', 'social_format_only'],
  'Full': ['full'],
} as const;

export const ChapterRegenerationPanel: React.FC<ChapterRegenerationPanelProps> = ({
  chapter,
  language,
  onRegenerate,
  isRegenerating = false,
  progress = 0,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<RegenerationTarget>('voice_only');
  const [selectedCategory, setSelectedCategory] = useState<string>('Voice & Audio');
  const [editedScript, setEditedScript] = useState(chapter.voiceover?.text || '');
  const [voiceProvider, setVoiceProvider] = useState<string>(chapter.voiceover?.voiceProvider || 'elevenlabs');
  const [targetLanguages, setTargetLanguages] = useState<string[]>([language]);
  const [preserveAudio, setPreserveAudio] = useState(true);

  // Filter options based on chapter visual type
  const availableOptions = REGENERATION_OPTIONS.filter(
    opt => opt.availableFor.includes(chapter.visual?.type || 'video')
  );

  // Group available options by category
  const groupedOptions = Object.entries(REGENERATION_CATEGORIES).map(([category, targetIds]) => ({
    category,
    options: availableOptions.filter(opt => (targetIds as readonly string[]).includes(opt.id))
  })).filter(group => group.options.length > 0);

  const handleRegenerate = async () => {
    const selectedOption = availableOptions.find(o => o.id === selectedTarget);
    const options: RegenerationOptions = {
      target: selectedTarget,
      newScript: editedScript !== chapter.voiceover?.text ? editedScript : undefined,
      newVoiceProvider: voiceProvider,
      targetLanguages,
      preserveAudio: ['visual_only', 'video_only', 'animation_only', 'image_only'].includes(selectedTarget),
      preserveVisual: ['voice_only', 'script_only', 'tts_only', 'music_only', 'sfx_only'].includes(selectedTarget),
      pipelineCategory: selectedOption?.pipelineCategory,
      edgeFunction: selectedOption?.edgeFunction,
    };

    try {
      await onRegenerate(selectedTarget, options);
      toast.success(`${selectedTarget.replace(/_/g, ' ')} regenerated successfully!`);
    } catch (error) {
      toast.error(`Regeneration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const selectedOption = availableOptions.find(o => o.id === selectedTarget);
  const categoryOptions = groupedOptions.find(g => g.category === selectedCategory)?.options || [];

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
              {availableOptions.length} pipeline options • Save tokens by regenerating only what you need
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn(
            "text-xs",
            selectedOption ? TOKEN_COST_COLORS[selectedOption.tokenCost] : ''
          )}>
            {selectedOption?.tokenCost} cost
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {groupedOptions.map(({ category, options }) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer text-xs px-2 py-1",
                selectedCategory === category && "ring-1 ring-primary"
              )}
              onClick={() => {
                setSelectedCategory(category);
                // Auto-select first available option in category
                if (options.length > 0 && !options.find(o => o.id === selectedTarget)) {
                  setSelectedTarget(options[0].id);
                }
              }}
            >
              {category} ({options.length})
            </Badge>
          ))}
        </div>

        {/* Regeneration Target Selection - Filtered by category */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{selectedCategory} Options</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categoryOptions.map((option) => (
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
                <div className="text-left flex-1 min-w-0">
                  <div className="text-xs font-medium">{option.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {option.description}
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-[9px] px-1 shrink-0", TOKEN_COST_COLORS[option.tokenCost])}>
                  {option.tokenCost}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Contextual Options based on target */}
        {(selectedTarget === 'voice_only' || selectedTarget === 'script_only' || selectedTarget === 'tts_only') && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Edit Script (optional)</Label>
              <Textarea
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
                placeholder="Edit the voiceover script..."
                rows={3}
                disabled={isRegenerating}
              />
            </div>
            
            {(selectedTarget === 'voice_only' || selectedTarget === 'tts_only') && (
              <div className="space-y-2">
                <Label>Voice Provider</Label>
                <Select
                  value={voiceProvider}
                  onValueChange={(v) => setVoiceProvider(v)}
                  disabled={isRegenerating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elevenlabs">ElevenLabs (Premium)</SelectItem>
                    <SelectItem value="azure">Azure Neural TTS</SelectItem>
                    <SelectItem value="alibaba">Alibaba Qwen3-TTS (CJK)</SelectItem>
                    <SelectItem value="google">Google Cloud TTS</SelectItem>
                    <SelectItem value="aws">Amazon Polly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {(selectedTarget === 'translation_only' || selectedTarget === 'dubbing_only') && (
          <div className="space-y-2">
            <Label>Target Languages</Label>
            <div className="flex flex-wrap gap-2">
              {['ar', 'hi', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ru', 'it'].map((lang) => (
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

        {['visual_only', 'video_only', 'animation_only'].includes(selectedTarget) && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <Label>Preserve Audio Track</Label>
              <p className="text-xs text-muted-foreground">
                Keep current voiceover, only update visuals
              </p>
            </div>
            <Switch
              checked={preserveAudio}
              onCheckedChange={setPreserveAudio}
              disabled={isRegenerating}
            />
          </div>
        )}

        {/* Pipeline Info */}
        {selectedOption && (
          <div className="p-2 bg-muted/20 rounded text-xs text-muted-foreground">
            <span className="font-medium">Pipeline:</span> {selectedOption.pipelineCategory} → {selectedOption.edgeFunction}
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
