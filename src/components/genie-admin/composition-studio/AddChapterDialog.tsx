/**
 * ADD CHAPTER DIALOG
 * 
 * Dialog for adding new chapters to existing templates:
 * - Quick add from presets
 * - Custom chapter creation
 * - Position selection (before/after existing)
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus, Video, User, Box, Sparkles, Image, Monitor,
  Mic2, FileText, ArrowDown, ArrowUp, Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompositionChapter, CompositionElementType, VoiceoverType } from './types';

interface AddChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddChapter: (chapter: Partial<CompositionChapter>, position?: 'start' | 'end' | number) => void;
  existingChapters: CompositionChapter[];
  primaryLanguage: string;
}

interface ChapterPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  visual: { type: CompositionElementType; prompt?: string };
  voiceover: { type: VoiceoverType; text: string };
  duration: number;
}

const CHAPTER_PRESETS: ChapterPreset[] = [
  {
    id: 'avatar_intro',
    name: 'Avatar Introduction',
    description: 'Professional avatar introduces the topic',
    icon: <User className="w-5 h-5" />,
    visual: { type: 'avatar' },
    voiceover: { type: 'lipsync', text: 'Welcome! Let me introduce...' },
    duration: 20,
  },
  {
    id: 'product_3d',
    name: '3D Product Showcase',
    description: 'Dynamic 3D visualization of product',
    icon: <Box className="w-5 h-5" />,
    visual: { type: '3d', prompt: 'Professional 3D product visualization with smooth camera rotation' },
    voiceover: { type: 'tts', text: 'Discover our revolutionary product...' },
    duration: 30,
  },
  {
    id: 'animated_stats',
    name: 'Animated Statistics',
    description: 'Eye-catching data visualization',
    icon: <Sparkles className="w-5 h-5" />,
    visual: { type: 'animation', prompt: 'Animated infographic with key statistics' },
    voiceover: { type: 'tts', text: 'The numbers speak for themselves...' },
    duration: 15,
  },
  {
    id: 'video_demo',
    name: 'Video Demo',
    description: 'Feature demonstration video',
    icon: <Video className="w-5 h-5" />,
    visual: { type: 'video', prompt: 'Professional demonstration video' },
    voiceover: { type: 'tts', text: 'Watch how easy it is...' },
    duration: 45,
  },
  {
    id: 'screen_walkthrough',
    name: 'Screen Recording',
    description: 'Step-by-step screen walkthrough',
    icon: <Monitor className="w-5 h-5" />,
    visual: { type: 'screen_recording' },
    voiceover: { type: 'tts', text: 'Let me show you step by step...' },
    duration: 60,
  },
  {
    id: 'cta_avatar',
    name: 'Call to Action',
    description: 'Avatar delivers compelling CTA',
    icon: <User className="w-5 h-5" />,
    visual: { type: 'avatar' },
    voiceover: { type: 'lipsync', text: 'Start your journey today!' },
    duration: 15,
  },
];

const VISUAL_TYPE_ICONS: Record<CompositionElementType, React.ReactNode> = {
  video: <Video className="w-4 h-4" />,
  avatar: <User className="w-4 h-4" />,
  '3d': <Box className="w-4 h-4" />,
  animation: <Sparkles className="w-4 h-4" />,
  static: <Image className="w-4 h-4" />,
  screen_recording: <Monitor className="w-4 h-4" />,
  custom: <FileText className="w-4 h-4" />,
};

export const AddChapterDialog: React.FC<AddChapterDialogProps> = ({
  open,
  onOpenChange,
  onAddChapter,
  existingChapters,
  primaryLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [insertPosition, setInsertPosition] = useState<'end' | number>('end');
  
  // Custom chapter state
  const [customTitle, setCustomTitle] = useState('');
  const [customVisualType, setCustomVisualType] = useState<CompositionElementType>('video');
  const [customVoiceoverType, setCustomVoiceoverType] = useState<VoiceoverType>('tts');
  const [customDuration, setCustomDuration] = useState(30);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customScript, setCustomScript] = useState('');

  const handleAddPreset = () => {
    const preset = CHAPTER_PRESETS.find(p => p.id === selectedPreset);
    if (!preset) return;

    onAddChapter({
      title: preset.name,
      duration: preset.duration,
      visual: preset.visual as any,
      voiceover: { ...preset.voiceover, language: primaryLanguage } as any,
      status: 'draft',
    }, insertPosition === 'end' ? 'end' : insertPosition);

    handleClose();
  };

  const handleAddCustom = () => {
    if (!customTitle.trim()) return;

    onAddChapter({
      title: customTitle,
      duration: customDuration,
      visual: { 
        type: customVisualType, 
        prompt: customPrompt || undefined 
      } as any,
      voiceover: { 
        type: customVoiceoverType, 
        text: customScript, 
        language: primaryLanguage 
      } as any,
      status: 'draft',
    }, insertPosition === 'end' ? 'end' : insertPosition);

    handleClose();
  };

  const handleClose = () => {
    setSelectedPreset(null);
    setCustomTitle('');
    setCustomPrompt('');
    setCustomScript('');
    setActiveTab('preset');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Chapter
          </DialogTitle>
          <DialogDescription>
            Add a chapter from presets or create a custom one
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="preset" className="gap-2">
              <Wand2 className="w-4 h-4" />
              Quick Presets
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <Plus className="w-4 h-4" />
              Custom Chapter
            </TabsTrigger>
          </TabsList>

          {/* Preset Tab */}
          <TabsContent value="preset" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {CHAPTER_PRESETS.map((preset) => (
                <Card
                  key={preset.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    selectedPreset === preset.id && "ring-2 ring-primary border-primary"
                  )}
                  onClick={() => setSelectedPreset(preset.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        selectedPreset === preset.id 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        {preset.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{preset.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {preset.description}
                        </p>
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          {preset.duration}s
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chapter Title *</Label>
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Product Demo"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration: {customDuration}s</Label>
                <Slider
                  value={[customDuration]}
                  onValueChange={([v]) => setCustomDuration(v)}
                  min={5}
                  max={120}
                  step={5}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visual Type</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(VISUAL_TYPE_ICONS) as CompositionElementType[]).map((type) => (
                  <Button
                    key={type}
                    variant={customVisualType === type ? 'default' : 'outline'}
                    size="sm"
                    className="gap-2"
                    onClick={() => setCustomVisualType(type)}
                  >
                    {VISUAL_TYPE_ICONS[type]}
                    {type.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visual Prompt</Label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Voiceover Type</Label>
              <Select
                value={customVoiceoverType}
                onValueChange={(v) => setCustomVoiceoverType(v as VoiceoverType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Voiceover</SelectItem>
                  <SelectItem value="tts">Text-to-Speech</SelectItem>
                  <SelectItem value="lipsync">Lip-Sync (Avatar)</SelectItem>
                  <SelectItem value="voice_clone">Voice Clone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {customVoiceoverType !== 'none' && (
              <div className="space-y-2">
                <Label>Voiceover Script</Label>
                <Textarea
                  value={customScript}
                  onChange={(e) => setCustomScript(e.target.value)}
                  placeholder="Enter the voiceover script..."
                  rows={3}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Position Selection */}
        <div className="space-y-2 pt-2 border-t">
          <Label>Insert Position</Label>
          <Select
            value={insertPosition.toString()}
            onValueChange={(v) => setInsertPosition(v === 'end' ? 'end' : parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="end">
                <span className="flex items-center gap-2">
                  <ArrowDown className="w-4 h-4" />
                  At the end
                </span>
              </SelectItem>
              {existingChapters.map((chapter, idx) => (
                <SelectItem key={chapter.id} value={idx.toString()}>
                  <span className="flex items-center gap-2">
                    <ArrowUp className="w-4 h-4" />
                    Before: {chapter.title}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={activeTab === 'preset' ? handleAddPreset : handleAddCustom}
            disabled={
              (activeTab === 'preset' && !selectedPreset) ||
              (activeTab === 'custom' && !customTitle.trim())
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Chapter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddChapterDialog;
