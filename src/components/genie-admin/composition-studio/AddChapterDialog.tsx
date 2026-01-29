/**
 * ADD CHAPTER DIALOG
 * 
 * Dialog for adding new chapters to existing templates:
 * - Quick add from presets
 * - Custom chapter creation with AI prompt enhancement
 * - Position selection (before/after existing)
 * - AI-suggested visual types based on content
 */

import React, { useState, useCallback } from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus, Video, User, Box, Sparkles, Image, Monitor,
  Mic2, FileText, ArrowDown, ArrowUp, Wand2, Loader2,
  Lightbulb, CheckCircle2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CompositionChapter, CompositionElementType, VoiceoverType } from './types';

interface AddChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddChapter: (chapter: Partial<CompositionChapter>, position?: 'start' | 'end' | number) => void;
  existingChapters: CompositionChapter[];
  primaryLanguage: string;
  projectContext?: {
    industry?: string;
    template?: string;
    targetAudience?: string;
  };
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

interface EnhancementResult {
  enhancedPrompt: string;
  suggestedScript: string;
  suggestedVisualTypes: CompositionElementType[];
  suggestedDuration: number;
  confidence: number;
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

// Visual type recommendations based on content keywords
const VISUAL_TYPE_KEYWORDS: Record<CompositionElementType, string[]> = {
  avatar: ['introduce', 'welcome', 'explain', 'guide', 'personal', 'host', 'presenter', 'cta', 'call to action'],
  '3d': ['product', 'device', 'hardware', 'physical', 'rotate', '360', 'showcase', 'model'],
  video: ['demo', 'tutorial', 'walkthrough', 'action', 'motion', 'footage', 'dynamic'],
  animation: ['stats', 'data', 'graph', 'chart', 'infographic', 'numbers', 'percentage', 'growth'],
  static: ['image', 'photo', 'screenshot', 'diagram', 'illustration', 'logo'],
  screen_recording: ['software', 'app', 'interface', 'ui', 'click', 'navigation', 'screen'],
  custom: ['custom', 'unique', 'special'],
};

export const AddChapterDialog: React.FC<AddChapterDialogProps> = ({
  open,
  onOpenChange,
  onAddChapter,
  existingChapters,
  primaryLanguage,
  projectContext,
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
  
  // AI Enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // AI-powered prompt enhancement
  const enhancePrompt = useCallback(async () => {
    if (!customPrompt.trim() && !customTitle.trim()) {
      toast.error('Please enter a title or description first');
      return;
    }

    setIsEnhancing(true);
    try {
      const input = customPrompt.trim() || customTitle.trim();
      
      // Call ai-universal-processor for intelligent enhancement
      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          action: 'enhance_chapter_prompt',
          content: input,
          context: {
            industry: projectContext?.industry || 'general',
            template: projectContext?.template || 'standard',
            targetAudience: projectContext?.targetAudience || 'general',
            existingChapters: existingChapters.map(c => c.title),
            language: primaryLanguage,
          }
        }
      });

      if (error) throw error;

      // Parse AI response or use fallback logic
      const result = data?.enhancement || generateLocalEnhancement(input);
      
      setEnhancementResult(result);
      setShowSuggestions(true);
      
      toast.success('✨ Prompt enhanced with AI suggestions');
    } catch (error) {
      console.error('Enhancement failed, using local fallback:', error);
      // Use local enhancement as fallback
      const localResult = generateLocalEnhancement(customPrompt.trim() || customTitle.trim());
      setEnhancementResult(localResult);
      setShowSuggestions(true);
      toast.info('Generated suggestions based on your input');
    } finally {
      setIsEnhancing(false);
    }
  }, [customPrompt, customTitle, projectContext, existingChapters, primaryLanguage]);

  // Local enhancement fallback (keyword-based)
  const generateLocalEnhancement = useCallback((input: string): EnhancementResult => {
    const lowerInput = input.toLowerCase();
    
    // Determine best visual types based on keywords
    const suggestedVisualTypes: CompositionElementType[] = [];
    let maxScore = 0;
    let bestType = 'video' as CompositionElementType;
    
    const visualTypes = Object.entries(VISUAL_TYPE_KEYWORDS) as [CompositionElementType, string[]][];
    for (const [type, keywords] of visualTypes) {
      const score = keywords.filter(kw => lowerInput.includes(kw)).length;
      if (score > maxScore) {
        maxScore = score;
        bestType = type;
      }
      if (score > 0) {
        suggestedVisualTypes.push(type);
      }
    }

    // If no matches, default to video with avatar
    if (suggestedVisualTypes.length === 0) {
      suggestedVisualTypes.push('video', 'avatar');
    } else if (!suggestedVisualTypes.includes(bestType)) {
      suggestedVisualTypes.unshift(bestType);
    }

    // Generate enhanced prompt
    const industryContext = projectContext?.industry 
      ? `For ${projectContext.industry} audience, ` 
      : '';
    
    const visualTypeLabel = bestType === 'avatar' ? 'presenter-led' : bestType;
    const enhancedPrompt = `${industryContext}create a professional ${visualTypeLabel} segment that ${input}. Focus on visual clarity, engagement, and brand consistency.`;

    // Generate suggested script
    const suggestedScript = generateScriptFromPrompt(input, bestType);

    // Calculate duration based on script length
    const wordCount = suggestedScript.split(' ').length;
    const suggestedDuration = Math.max(15, Math.min(120, Math.ceil(wordCount / 2.5)));

    return {
      enhancedPrompt,
      suggestedScript,
      suggestedVisualTypes: suggestedVisualTypes.slice(0, 3),
      suggestedDuration,
      confidence: maxScore > 0 ? Math.min(0.95, 0.6 + maxScore * 0.1) : 0.6,
    };
  }, [projectContext]);

  // Generate script based on prompt and visual type
  const generateScriptFromPrompt = (prompt: string, visualType: CompositionElementType): string => {
    const templates: Record<CompositionElementType, string> = {
      avatar: `Welcome! Let me walk you through ${prompt}. This is designed to help you understand the key points and take action today.`,
      video: `Watch as we demonstrate ${prompt}. Notice how each element works together to deliver exceptional results.`,
      '3d': `Take a closer look at ${prompt}. Rotate the view to see every angle and detail of what makes this special.`,
      animation: `The data tells a compelling story about ${prompt}. Let these visualizations highlight the key insights.`,
      static: `Here's a clear view of ${prompt}. Study the details that make all the difference.`,
      screen_recording: `Follow along as we navigate through ${prompt}. Each step is designed for simplicity and efficiency.`,
      custom: `Discover ${prompt}. This unique presentation showcases exactly what you need to know.`,
    };
    return templates[visualType] || templates.video;
  };

  // Apply AI suggestions
  const applySuggestions = useCallback(() => {
    if (!enhancementResult) return;

    setCustomPrompt(enhancementResult.enhancedPrompt);
    setCustomScript(enhancementResult.suggestedScript);
    setCustomDuration(enhancementResult.suggestedDuration);
    
    if (enhancementResult.suggestedVisualTypes.length > 0) {
      setCustomVisualType(enhancementResult.suggestedVisualTypes[0]);
    }
    
    setShowSuggestions(false);
    toast.success('Applied AI suggestions');
  }, [enhancementResult]);

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
    setEnhancementResult(null);
    setShowSuggestions(false);
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

            {/* Visual Prompt with AI Enhancement */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Describe your chapter</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs h-7"
                        onClick={enhancePrompt}
                        disabled={isEnhancing || (!customPrompt.trim() && !customTitle.trim())}
                      >
                        {isEnhancing ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            ✨ Enhance with AI
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AI will suggest better prompts, visual types, and scripts</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe what you want to generate... e.g., 'introduce our product with a professional host' or 'show key statistics with animated charts'"
                rows={2}
              />
            </div>

            {/* AI Suggestions Panel */}
            {showSuggestions && enhancementResult && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">AI Suggestions</span>
                      <Badge variant="outline" className="text-[10px]">
                        {Math.round(enhancementResult.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowSuggestions(false)}
                      >
                        Dismiss
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={applySuggestions}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Apply All
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Enhanced Prompt:</span>
                      <p className="text-xs mt-1 p-2 bg-background rounded border">
                        {enhancementResult.enhancedPrompt}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Suggested Visual Types:</span>
                      <div className="flex gap-1 mt-1">
                        {enhancementResult.suggestedVisualTypes.map((type, idx) => (
                          <Badge
                            key={type}
                            variant={idx === 0 ? 'default' : 'secondary'}
                            className="gap-1 text-[10px] cursor-pointer"
                            onClick={() => setCustomVisualType(type)}
                          >
                            {VISUAL_TYPE_ICONS[type]}
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Suggested Script:</span>
                      <p className="text-xs mt-1 p-2 bg-background rounded border italic">
                        "{enhancementResult.suggestedScript}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>Suggested Duration:</span>
                      <Badge variant="outline">{enhancementResult.suggestedDuration}s</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Visual Type Selection */}
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
                <div className="flex items-center justify-between">
                  <Label>Voiceover Script</Label>
                  {enhancementResult?.suggestedScript && customScript !== enhancementResult.suggestedScript && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={() => setCustomScript(enhancementResult.suggestedScript)}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Use AI Script
                    </Button>
                  )}
                </div>
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
