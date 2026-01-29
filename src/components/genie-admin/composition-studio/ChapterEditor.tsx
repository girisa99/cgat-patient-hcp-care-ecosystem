/**
 * CHAPTER EDITOR
 * 
 * Edit individual chapter settings:
 * - Visual type (video, avatar, 3D, animation, static)
 * - Voiceover configuration
 * - Duration and transitions
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video, User, Box, Sparkles, Image, Monitor, Upload,
  Mic2, Wand2, Volume2, Clock, ChevronDown, ChevronUp,
  Play, Trash2, Copy, GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  CompositionChapter, 
  CompositionElementType, 
  VoiceoverType,
  AvatarStyle,
  SUPPORTED_LANGUAGES 
} from './types';
import { ELEMENT_PROVIDERS } from './types';

interface ChapterEditorProps {
  chapter: CompositionChapter;
  languages: string[];
  onUpdate: (chapter: CompositionChapter) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPreview: (language: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const VISUAL_TYPE_ICONS: Record<CompositionElementType, React.ReactNode> = {
  video: <Video className="w-4 h-4" />,
  avatar: <User className="w-4 h-4" />,
  '3d': <Box className="w-4 h-4" />,
  animation: <Sparkles className="w-4 h-4" />,
  static: <Image className="w-4 h-4" />,
  screen_recording: <Monitor className="w-4 h-4" />,
  custom: <Upload className="w-4 h-4" />,
};

const VISUAL_TYPE_LABELS: Record<CompositionElementType, string> = {
  video: 'AI Video',
  avatar: 'AI Avatar',
  '3d': '3D Model',
  animation: 'Animation',
  static: 'Static Image',
  screen_recording: 'Screen Recording',
  custom: 'Custom Upload',
};

const AVATAR_STYLES: { value: AvatarStyle; label: string }[] = [
  { value: 'professional_western', label: 'Professional (Western)' },
  { value: 'professional_mena', label: 'Professional (MENA)' },
  { value: 'professional_cjk', label: 'Professional (CJK)' },
  { value: 'professional_south_asian', label: 'Professional (South Asian)' },
  { value: 'professional_latam', label: 'Professional (LATAM)' },
  { value: 'casual', label: 'Casual' },
  { value: 'custom', label: 'Custom' },
];

export const ChapterEditor: React.FC<ChapterEditorProps> = ({
  chapter,
  languages,
  onUpdate,
  onDelete,
  onDuplicate,
  onPreview,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'settings'>('visual');

  const updateVisual = (updates: Partial<CompositionChapter['visual']>) => {
    onUpdate({
      ...chapter,
      visual: { ...chapter.visual, ...updates },
    });
  };

  const updateVoiceover = (updates: Partial<CompositionChapter['voiceover']>) => {
    onUpdate({
      ...chapter,
      voiceover: { ...chapter.voiceover, ...updates },
    });
  };

  const getStatusColor = () => {
    switch (chapter.status) {
      case 'complete': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'generating': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      isExpanded && "ring-2 ring-primary/20"
    )}>
      {/* Collapsed Header */}
      <CardHeader 
        className="cursor-pointer py-3 hover:bg-muted/30 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="cursor-grab">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="flex items-center gap-2 min-w-[40px]">
            <span className="text-sm font-medium text-muted-foreground">
              #{chapter.order}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{chapter.title}</CardTitle>
              <Badge variant="outline" className="text-xs gap-1">
                {VISUAL_TYPE_ICONS[chapter.visual.type]}
                {VISUAL_TYPE_LABELS[chapter.visual.type]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {chapter.duration}s • {chapter.voiceover.type !== 'none' ? 'With voiceover' : 'No voiceover'}
            </p>
          </div>
          
          <Badge variant="outline" className={cn("text-xs", getStatusColor())}>
            {chapter.status}
          </Badge>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(languages[0] || 'en');
              }}
            >
              <Play className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="pt-0 pb-4">
          <div className="border-t pt-4">
            {/* Chapter Title & Duration */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Chapter Title</Label>
                <Input
                  value={chapter.title}
                  onChange={(e) => onUpdate({ ...chapter, title: e.target.value })}
                  placeholder="Enter chapter title..."
                />
              </div>
              <div className="space-y-2">
                <Label>Duration: {chapter.duration}s</Label>
                <Slider
                  value={[chapter.duration]}
                  onValueChange={([v]) => onUpdate({ ...chapter, duration: v })}
                  min={5}
                  max={120}
                  step={5}
                />
              </div>
            </div>

            {/* Tabs for Visual / Audio / Settings */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="visual" className="gap-1">
                  <Video className="w-3.5 h-3.5" />
                  Visual
                </TabsTrigger>
                <TabsTrigger value="audio" className="gap-1">
                  <Mic2 className="w-3.5 h-3.5" />
                  Audio
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1">
                  <Wand2 className="w-3.5 h-3.5" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Visual Tab */}
              <TabsContent value="visual" className="space-y-4">
                {/* Visual Type Selector */}
                <div className="space-y-2">
                  <Label>Visual Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(VISUAL_TYPE_LABELS) as CompositionElementType[]).map((type) => (
                      <Button
                        key={type}
                        variant={chapter.visual.type === type ? 'default' : 'outline'}
                        size="sm"
                        className="justify-start gap-2 h-auto py-2"
                        onClick={() => updateVisual({ type })}
                      >
                        {VISUAL_TYPE_ICONS[type]}
                        <span className="text-xs">{VISUAL_TYPE_LABELS[type]}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Type-specific options */}
                {chapter.visual.type === 'avatar' && (
                  <div className="space-y-4 p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-2">
                      <Label>Avatar Style</Label>
                      <Select
                        value={chapter.visual.avatarStyle || 'professional_western'}
                        onValueChange={(v) => updateVisual({ avatarStyle: v as AvatarStyle })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVATAR_STYLES.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`lipsync-${chapter.id}`}>Enable Lip-Sync</Label>
                      <Switch
                        id={`lipsync-${chapter.id}`}
                        checked={chapter.visual.enableLipSync ?? true}
                        onCheckedChange={(c) => updateVisual({ enableLipSync: c })}
                      />
                    </div>
                  </div>
                )}

                {(chapter.visual.type === 'video' || chapter.visual.type === 'animation') && (
                  <div className="space-y-2">
                    <Label>Generation Prompt</Label>
                    <Textarea
                      value={chapter.visual.prompt || ''}
                      onChange={(e) => updateVisual({ prompt: e.target.value })}
                      placeholder="Describe what you want to generate..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Powered by: {ELEMENT_PROVIDERS[chapter.visual.type].join(', ')}
                    </p>
                  </div>
                )}

                {chapter.visual.type === '3d' && (
                  <div className="space-y-2">
                    <Label>3D Model Prompt</Label>
                    <Textarea
                      value={chapter.visual.meshPrompt || ''}
                      onChange={(e) => updateVisual({ meshPrompt: e.target.value })}
                      placeholder="Describe the 3D model or scene..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Powered by: Meshy AI, ModelsLab 3D
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Audio Tab */}
              <TabsContent value="audio" className="space-y-4">
                {/* Voiceover Type */}
                <div className="space-y-2">
                  <Label>Voiceover Type</Label>
                  <Select
                    value={chapter.voiceover.type}
                    onValueChange={(v) => updateVoiceover({ type: v as VoiceoverType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Voiceover</SelectItem>
                      <SelectItem value="tts">Text-to-Speech (TTS)</SelectItem>
                      <SelectItem value="voice_clone">Voice Clone</SelectItem>
                      <SelectItem value="lipsync">Lip-Sync to Avatar</SelectItem>
                      <SelectItem value="recorded">Upload Recording</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Upload Voice Recording - Show when "recorded" is selected */}
                {chapter.voiceover.type === 'recorded' && (
                  <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Upload className="w-5 h-5" />
                      <Label className="font-medium">Upload Voice Recording</Label>
                    </div>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Store file reference (URL.createObjectURL for preview)
                          const audioUrl = URL.createObjectURL(file);
                          updateVoiceover({ 
                            uploadedAudioUrl: audioUrl,
                            uploadedFileName: file.name 
                          });
                        }
                      }}
                      className="cursor-pointer"
                    />
                    {chapter.voiceover.uploadedFileName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Volume2 className="w-4 h-4" />
                        <span>Uploaded: {chapter.voiceover.uploadedFileName}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Upload your own voice recording (MP3, WAV, M4A). This will be used instead of TTS.
                    </p>
                  </div>
                )}

                {/* TTS/Voice Clone Options */}
                {(chapter.voiceover.type === 'tts' || chapter.voiceover.type === 'voice_clone' || chapter.voiceover.type === 'lipsync') && (
                  <>
                    <div className="space-y-2">
                      <Label>Voiceover Script</Label>
                      <Textarea
                        value={chapter.voiceover.text || ''}
                        onChange={(e) => updateVoiceover({ text: e.target.value })}
                        placeholder="Enter the voiceover script for this chapter..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Voice Provider</Label>
                        <Select
                          value={chapter.voiceover.voiceProvider || 'elevenlabs'}
                          onValueChange={(v) => updateVoiceover({ voiceProvider: v as any })}
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
                      <div className="space-y-2">
                        <Label>Voice Speed</Label>
                        <Select
                          value={chapter.voiceover.speed || 'normal'}
                          onValueChange={(v) => updateVoiceover({ speed: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slow">Slow (0.8x)</SelectItem>
                            <SelectItem value="normal">Normal (1.0x)</SelectItem>
                            <SelectItem value="fast">Fast (1.2x)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Voice Clone Upload */}
                    {chapter.voiceover.type === 'voice_clone' && (
                      <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
                        <Label className="flex items-center gap-2">
                          <Mic2 className="w-4 h-4" />
                          Upload Voice Sample for Cloning
                        </Label>
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const audioUrl = URL.createObjectURL(file);
                              updateVoiceover({ 
                                voiceCloneSampleUrl: audioUrl,
                                voiceCloneSampleName: file.name 
                              });
                            }
                          }}
                        />
                        {chapter.voiceover.voiceCloneSampleName && (
                          <p className="text-xs text-muted-foreground">
                            Sample: {chapter.voiceover.voiceCloneSampleName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Provide a 30-60 second voice sample for best results. Clear audio without background noise works best.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Background Music Section */}
                <div className="p-3 bg-muted/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`music-${chapter.id}`} className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Background Music
                    </Label>
                    <Switch
                      id={`music-${chapter.id}`}
                      checked={chapter.backgroundMusic?.enabled ?? false}
                      onCheckedChange={(c) => 
                        onUpdate({ 
                          ...chapter, 
                          backgroundMusic: { ...chapter.backgroundMusic, enabled: c } 
                        })
                      }
                    />
                  </div>
                  
                  {chapter.backgroundMusic?.enabled && (
                    <div className="space-y-3">
                      {/* Music Source Toggle */}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={chapter.backgroundMusic?.source !== 'upload' ? 'default' : 'outline'}
                          onClick={() => onUpdate({
                            ...chapter,
                            backgroundMusic: { ...chapter.backgroundMusic, enabled: true, source: 'generate' }
                          })}
                        >
                          <Wand2 className="w-3 h-3 mr-1" />
                          AI Generate
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={chapter.backgroundMusic?.source === 'upload' ? 'default' : 'outline'}
                          onClick={() => onUpdate({
                            ...chapter,
                            backgroundMusic: { ...chapter.backgroundMusic, enabled: true, source: 'upload' }
                          })}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Upload
                        </Button>
                      </div>

                      {/* Upload Music */}
                      {chapter.backgroundMusic?.source === 'upload' && (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const audioUrl = URL.createObjectURL(file);
                                onUpdate({
                                  ...chapter,
                                  backgroundMusic: { 
                                    ...chapter.backgroundMusic, 
                                    enabled: true,
                                    source: 'upload',
                                    uploadedUrl: audioUrl,
                                    uploadedFileName: file.name
                                  }
                                });
                              }
                            }}
                          />
                          {chapter.backgroundMusic?.uploadedFileName && (
                            <p className="text-xs text-muted-foreground">
                              🎵 {chapter.backgroundMusic.uploadedFileName}
                            </p>
                          )}
                        </div>
                      )}

                      {/* AI Generate Music Prompt */}
                      {chapter.backgroundMusic?.source !== 'upload' && (
                        <div className="space-y-2">
                          <Label className="text-xs">Music Style Prompt</Label>
                          <Input
                            value={chapter.backgroundMusic?.prompt || ''}
                            onChange={(e) => onUpdate({
                              ...chapter,
                              backgroundMusic: { 
                                ...chapter.backgroundMusic, 
                                enabled: true,
                                prompt: e.target.value
                              }
                            })}
                            placeholder="e.g., Upbeat corporate, Calm ambient, Epic cinematic..."
                          />
                        </div>
                      )}

                      {/* Volume Control */}
                      <div className="space-y-2">
                        <Label className="text-xs">Volume: {Math.round((chapter.backgroundMusic?.volume || 0.3) * 100)}%</Label>
                        <Slider
                          value={[(chapter.backgroundMusic?.volume || 0.3) * 100]}
                          onValueChange={([v]) => 
                            onUpdate({ 
                              ...chapter, 
                              backgroundMusic: { ...chapter.backgroundMusic, enabled: true, volume: v / 100 } 
                            })
                          }
                          min={0}
                          max={100}
                          step={5}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sound Effects */}
                <div className="p-3 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Sound Effects (SFX)
                    </Label>
                    <Switch
                      checked={chapter.sfx?.enabled ?? false}
                      onCheckedChange={(c) => 
                        onUpdate({ 
                          ...chapter, 
                          sfx: { ...chapter.sfx, enabled: c } 
                        })
                      }
                    />
                  </div>
                  {chapter.sfx?.enabled && (
                    <div className="space-y-2">
                      <Input
                        value={chapter.sfx?.prompt || ''}
                        onChange={(e) => onUpdate({
                          ...chapter,
                          sfx: { ...chapter.sfx, enabled: true, prompt: e.target.value }
                        })}
                        placeholder="e.g., Whoosh transition, Click sound, Notification chime..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Describe the sound effects you want. AI will generate matching audio.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Transition In</Label>
                    <Select
                      value={chapter.visual.transitionIn || 'fade'}
                      onValueChange={(v) => updateVisual({ transitionIn: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Transition Out</Label>
                    <Select
                      value={chapter.visual.transitionOut || 'fade'}
                      onValueChange={(v) => updateVisual({ transitionOut: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Footer Actions */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <div className="flex gap-2">
                {languages.slice(0, 3).map((lang) => (
                  <Button
                    key={lang}
                    variant="outline"
                    size="sm"
                    onClick={() => onPreview(lang)}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Preview ({lang.toUpperCase()})
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ChapterEditor;
